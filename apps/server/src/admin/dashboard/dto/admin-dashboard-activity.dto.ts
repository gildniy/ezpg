import { ApiProperty } from "@nestjs/swagger";

export enum ActivityType {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export enum UserType {
  ADMIN = "ADMIN",
  MERCHANT = "MERCHANT",
  AGENT = "AGENT",
}

export class AdminDashboardActivityDto {
  @ApiProperty({
    description: "Unique activity ID",
    example: "act_1234567890",
  })
  id: string;

  @ApiProperty({
    description: "User ID who performed the activity",
    example: "user_123",
  })
  userId: string;

  @ApiProperty({
    description: "Username who performed the activity",
    example: "admin1",
  })
  username: string;

  @ApiProperty({
    description: "Type of user who performed the activity",
    example: UserType.ADMIN,
    enum: UserType,
    enumName: "UserType",
  })
  userType: UserType;

  @ApiProperty({
    description: "IP address of the user",
    example: "192.168.1.1",
  })
  ipAddress: string;

  @ApiProperty({
    description: "Activity type",
    example: ActivityType.LOGIN,
    enum: ActivityType,
  })
  activityType: ActivityType;

  @ApiProperty({
    description: "Detailed description of the activity",
    example: "Logged in to admin panel",
  })
  description: string;

  @ApiProperty({
    description: "Timestamp of the activity",
    example: "2023-06-20T10:15:00Z",
  })
  timestamp: Date;
}
