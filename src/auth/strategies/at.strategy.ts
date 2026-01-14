// src/auth/strategies/at.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      // English: Extract token from Bearer header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // English: This MUST match the .env key
      secretOrKey: config.get<string>('AT_SECRET'),
    });
  }

  async validate(payload: any) {
    // English: Payload contains: sub (id), email, and role
    return payload;
  }
}
