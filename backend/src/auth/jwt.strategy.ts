import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { passportJwtSecret } from "jwks-rsa";

/**
 * JWT Strategy for Auth0 authentication.
 *
 * This strategy validates JWT tokens issued by Auth0 and extracts user information.
 * It uses the Auth0 public key to verify token signatures.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${configService.get("AUTH0_DOMAIN")}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: configService.get("AUTH0_AUDIENCE"),
      issuer: configService.get("AUTH0_DOMAIN"),
      algorithms: ["RS256"],
    });
  }

  /**
   * Validates the JWT payload and returns user information.
   * This method is called after the JWT is successfully verified.
   */
  async validate(payload: any) {
    return {
      auth0Id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      locale: payload.locale || "en",
    };
  }
}
