import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./config"

export interface JWTPayload {
  userId: string
  email: string
  name: string
}

export class JWTService {
  private static readonly ACCESS_TOKEN_EXPIRY = "15m"
  private static readonly REFRESH_TOKEN_EXPIRY = "7d"

  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    })
  }

  static generateRefreshToken(payload: Pick<JWTPayload, "userId">): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    })
  }

  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  }

  static generateTokenPair(payload: JWTPayload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken({ userId: payload.userId }),
    }
  }
}
