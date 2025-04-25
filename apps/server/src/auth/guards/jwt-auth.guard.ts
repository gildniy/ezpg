import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  // Use the name of the JwtStrategy ('jwt')
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Allow access if @Public() decorator is present
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    // Otherwise, proceed with standard JWT authentication provided by AuthGuard('jwt')
    return super.canActivate(context);
  }

  // Optional: Handle authentication errors (e.g., log, customize response)
  handleRequest(err, user, info) {
    if (err || !user) {
      // console.error('JWT Auth Error:', info);
      throw err || new UnauthorizedException("Invalid or expired token.");
    }
    return user; // Attach user to request
  }
}
