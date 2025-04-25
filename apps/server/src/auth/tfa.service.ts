import { Injectable } from "@nestjs/common";
import { ConfigService } from "@ezpg/config";
import { authenticator } from "otplib";

@Injectable()
export class TfaService {
  constructor(private configService: ConfigService) {
    authenticator.options = {
      window: 1,
      step: 30,
    };
  }

  generateSecret(): string {
    return authenticator.generateSecret();
  }

  generateQrCode(secret: string, email: string): string {
    return authenticator.keyuri(email, this.configService.app.name, secret);
  }

  verifyToken(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
  }
}
