import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayload, verify } from 'jsonwebtoken';

import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/app-config';

import { DatabaseService } from 'src/database/database.service';
import { users } from 'src/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly db: DatabaseService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header found');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');

    const decoded = await this.verifyToken(token, secret);
    const user = await this.db.db.query.users.findFirst({
      where: eq(users.authId, decoded.sub),
    });
    request.user = user;
    return true;
  }
  private async verifyToken(token: string, secret: string) {
    const decoded = (verify(token, secret)) as JwtPayload;
    const userId = decoded.sub;
    if (!userId || !decoded.exp || !decoded.iat) {
      throw new UnauthorizedException('Invalid token');
    }

    const currentTimestamp = Math.floor(Date.now() / 1000); // Convert to unix timestamp
    if (decoded.exp < currentTimestamp) {
      throw new UnauthorizedException('Token has expired');
    }

    // Optional: Check if token is used before its issued time
    if (decoded.iat > currentTimestamp) {
      throw new UnauthorizedException('Token used before issuance');
    }
    return {
      sub: userId,
      exp: decoded.exp,
      iat: decoded.iat,
      ...decoded,
    };
  }
}
