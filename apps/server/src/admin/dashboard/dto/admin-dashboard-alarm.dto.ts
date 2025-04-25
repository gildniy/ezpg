import { ApiProperty } from "@nestjs/swagger";

export enum AlarmSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export class AdminDashboardAlarmDto {
  @ApiProperty({
    description: "Unique alarm ID",
    example: "alarm_12345",
  })
  id: string;

  @ApiProperty({
    description: "Alarm title",
    example: "Unusual withdrawal activity",
  })
  title: string;

  @ApiProperty({
    description: "Detailed alarm message",
    example:
      "Merchant MERCH001 has 10 withdrawals over 1M KRW in the last hour",
  })
  message: string;

  @ApiProperty({
    description: "Alarm severity level",
    enum: AlarmSeverity,
    example: AlarmSeverity.MEDIUM,
  })
  severity: AlarmSeverity;

  @ApiProperty({
    description: "Timestamp when the alarm was created",
    example: "2023-06-20T15:30:00Z",
  })
  timestamp: Date;

  @ApiProperty({
    description: "Has the alarm been acknowledged",
    example: false,
  })
  isAcknowledged: boolean;
}
