import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config'; // English: Added to allow strategies to read .env
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AtStrategy, RtStrategy } from './strategies';

@Module({
  // English: ConfigModule is required to inject ConfigService into strategies
  imports: [ConfigModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
  // English: Export AuthService if other modules need to use it
  exports: [AuthService],
})
export class AuthModule {}
