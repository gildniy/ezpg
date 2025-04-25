import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO for merchant TFA status entry
 */
export class MerchantTfaStatusDto {
  @ApiProperty({
    description: "Merchant ID",
    example: "merchant1",
  })
  merchantId: string;

  @ApiProperty({
    description: "Merchant name",
    example: "Example Merchant",
  })
  merchantName: string;

  @ApiProperty({
    description: "Username",
    example: "merchant_user",
  })
  username: string;

  @ApiProperty({
    description: "Whether TFA is enabled",
    example: true,
  })
  tfaEnabled: boolean;

  @ApiProperty({
    description: "Last login timestamp",
    example: "2023-05-15T10:30:00Z",
    nullable: true,
  })
  lastLoginAt?: Date;
}

/**
 * DTO for agent TFA status entry
 */
export class AgentTfaStatusDto {
  @ApiProperty({
    description: "Agent ID",
    example: "agent1",
  })
  agentId: string;

  @ApiProperty({
    description: "Agent name",
    example: "Example Agent",
  })
  agentName: string;

  @ApiProperty({
    description: "Username",
    example: "agent_user",
  })
  username: string;

  @ApiProperty({
    description: "Whether TFA is enabled",
    example: true,
  })
  tfaEnabled: boolean;

  @ApiProperty({
    description: "Last login timestamp",
    example: "2023-05-15T10:30:00Z",
    nullable: true,
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: "Associated merchant ID",
    example: "merchant1",
  })
  merchantId: string;

  @ApiProperty({
    description: "Associated merchant name",
    example: "Example Merchant",
  })
  merchantName: string;
}

/**
 * DTO for TFA status report
 * Used to return TFA status for all merchants and agents
 */
export class TfaStatusReportDto {
  @ApiProperty({
    description: "List of merchants with TFA status",
    type: [MerchantTfaStatusDto],
  })
  merchants: MerchantTfaStatusDto[];

  @ApiProperty({
    description: "List of agents with TFA status",
    type: [AgentTfaStatusDto],
  })
  agents: AgentTfaStatusDto[];
}
