// src/auth/strategies/at.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express'; // Professional tip: Use 'import type' for Express types

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.['access_token'] || null;
        },
      ]),
      ignoreExpiration: false,
      // Fix for TS2345: Provide a fallback to ensure it's always a string
      secretOrKey: process.env.AT_SECRET || 'dev_secret_key_123',
    });
  }

  async validate(payload: any) {
    // English: The returned object will be available in req.user
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
