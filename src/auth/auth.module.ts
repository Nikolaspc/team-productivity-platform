// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AtStrategy } from './strategies/at.strategy';

@Module({
  imports: [
    // Registering JwtModule to enable token signing and verification
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AtStrategy, // Required for AtGuard to work
  ],
  exports: [AuthService], // Exporting so other modules can use auth logic
})
export class AuthModule {}
