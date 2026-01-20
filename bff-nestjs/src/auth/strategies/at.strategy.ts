import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';

// English: Updated payload to include the user's role
type JwtPayload = {
  sub: number;
  email: string;
  role: Role;
};

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('AT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    // English: Whatever is returned here is attached to request.user
    return payload;
  }
}
