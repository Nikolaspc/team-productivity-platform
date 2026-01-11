// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  HttpCode,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto'; // Updated path
import { JwtService } from '@nestjs/jwt';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.register(dto);
    this.setCookies(res, tokens);
    return user;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.login(dto);
    this.setCookies(res, tokens);
    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // English: Get token from cookies to identify user session
    const token = req.cookies['access_token'];
    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.AT_SECRET || 'at-secret',
        });
        await this.authService.logout(payload.sub);
      } catch (e) {
        /* English: Token might be already expired, just clear cookies */
      }
    }
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken)
      throw new UnauthorizedException('No refresh token provided');

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.RT_SECRET || 'rt-secret',
      });
      const { user, tokens } = await this.authService.refreshTokens(
        payload.sub,
        refreshToken,
      );
      this.setCookies(res, tokens);
      return user;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private setCookies(
    res: Response,
    tokens: { access_token: string; refresh_token: string },
  ) {
    // English: Security configuration for HttpOnly cookies
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
