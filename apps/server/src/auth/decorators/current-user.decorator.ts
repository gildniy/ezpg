import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtUser } from "../interfaces/jwt-user.interface";

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!data) return request.user as JwtUser;
    return request.user[data] as JwtUser;
  },
);
