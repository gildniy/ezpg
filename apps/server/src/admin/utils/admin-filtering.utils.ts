import { JwtUser } from "src/auth/interfaces/jwt-user.interface";
import { PrismaService } from "@ezpg/database"; // Assuming PrismaService is exported from database package
import { AdminAdminsService } from "../admins/admin-admins.service";

/**
 * Determines the target admin ID for filtering based on user role and viewAsAdminId parameter.
 * Optionally fetches associated merchant IDs if a target admin ID is determined.
 *
 * @param user The currently authenticated JWT user.
 * @param viewAsAdminId Optional ID of the admin to view as (SuperAdmin only).
 * @param prisma Optional PrismaService instance to fetch merchant IDs.
 * @param adminService AdminAdminsService instance for superadmin checks
 * @returns Object containing targetAdminId and optional merchant ID lists.
 */
export async function getAdminTargetingInfo(
  user: JwtUser,
  viewAsAdminId?: string,
  prisma?: PrismaService, // Make prisma optional, only needed if fetching IDs
  adminService?: AdminAdminsService, // Add admin service parameter
): Promise<{
  targetAdminId: string | null;
  filterMerchantIds?: string[];
}> {
  // We need prisma to check if user is super admin if adminService is not provided
  if (!prisma && !adminService) {
    throw new Error(
      "Either PrismaService or AdminAdminsService is required for getAdminTargetingInfo",
    );
  }

  // Use adminService if available, otherwise use isSuperAdmin function
  const userIsSuperAdmin = await adminService.isSuperAdmin(user.userId);

  let targetAdminId: string | null = null;

  if (viewAsAdminId && userIsSuperAdmin) {
    targetAdminId = viewAsAdminId;
  } else if (!userIsSuperAdmin) {
    targetAdminId = user.userId;
  }
  // targetAdminId remains null for SuperAdmin viewing all

  let filterMerchantIds: string[] | undefined = undefined;

  // Fetch merchant IDs only if a target admin is set AND prisma instance is provided
  if (targetAdminId !== null && prisma) {
    try {
      const targetMerchants = await prisma.merchant.findMany({
        where: { created_by: targetAdminId },
        select: { merchant_id: true },
      });
      filterMerchantIds = targetMerchants.map((m) => m.merchant_id);
    } catch (error) {
      // Handle potential errors during merchant fetch (e.g., log it)
      console.error(
        `Error fetching merchants for admin ${targetAdminId}:`,
        error,
      );
      // Decide how to proceed: throw error, or return without filters?
      // Returning without filters might be safer depending on use case.
      targetAdminId = null; // Reset targetAdminId if fetch fails? Or just return empty filters?
      filterMerchantIds = undefined;
    }
  }

  return { targetAdminId, filterMerchantIds };
}
