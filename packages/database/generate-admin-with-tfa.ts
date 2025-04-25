// Generate an admin user with TFA enabled and display QR code URL
import { PrismaClient } from "./src/generated/client";
import * as bcrypt from "bcrypt";
import {
  generateTotpSecret,
  generateOtpAuthUri,
  generateTotpQrCodeDataUri,
  generateTOTP,
} from "@ezpg/helpers";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  try {
    console.log("Creating an admin user with TFA enabled...");

    // Generate a TFA secret using our helpers
    const secretData = generateTotpSecret();
    const secretBase32 = secretData.base32;

    // Generate a hashed password
    const password = "AdminTFA123!";
    const hashedPassword = await hashPassword(password);

    // Generate the user_id using our SQL function
    const result = await prisma.$queryRaw<[{ generate_user_id: string }]>`
      SELECT generate_user_id('AD') as generate_user_id
    `;

    const userId = result[0].generate_user_id;

    // Create the user with the generated ID and TFA enabled
    const user = await prisma.user.create({
      data: {
        user_id: userId,
        username: "admin_tfa",
        password_hash: hashedPassword,
        role_id: 1, // ADMIN role
        tfa_enabled: true,
        tfa_secret: secretBase32, // Store the secret directly - in a real app, you'd encrypt this
        first_login: false,
      },
    });

    console.log("\nAdmin user created successfully:");
    console.log(`- User ID: ${user.user_id}`);
    console.log(`- Username: ${user.username}`);
    console.log(`- Password: ${password}`);
    console.log(`- TFA Secret: ${secretBase32}`);

    // Generate OTP Auth URI and QR code
    const otpAuthUrl = generateOtpAuthUri(
      user.username,
      secretBase32,
      "EZPG Admin",
    );

    console.log(`\nOTP Auth URL: ${otpAuthUrl}`);

    // Generate QR code data URI
    const qrCodeDataUri = await generateTotpQrCodeDataUri(otpAuthUrl);
    console.log(`\nQR Code Data URI: ${qrCodeDataUri}`);

    // Generate current OTP for testing
    const token = generateTOTP(secretData.buffer);

    console.log(`\nCurrent OTP code: ${token} (valid for 30 seconds)`);
    console.log(
      "\nYou can now log in with these credentials and the OTP code.",
    );
  } catch (error) {
    console.error("Error creating user with TFA:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
