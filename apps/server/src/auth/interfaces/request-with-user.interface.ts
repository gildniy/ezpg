import { Request } from "express";
import { JwtUser } from "./jwt-user.interface";

/**
 * Interface for Express Request object with attached user data
 */
export interface RequestWithUser extends Request {
  user: JwtUser;
}
