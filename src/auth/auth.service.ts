import {
  ForbiddenException,
  Injectable,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signupLocal(dto: RegisterDto, res: Response) {
    // English: Using the extended client to respect soft-delete filters
    const existingUser = await this.prisma.extended.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hash = await argon2.hash(dto.password);

    const newUser = await this.prisma.extended.user.create({
      data: {
        email: dto.email,
        password: hash,
        name: dto.name,
      },
    });

    const tokens = await this.getTokens(
      newUser.id,
      newUser.email,
      newUser.role,
    );
    await this.updateRtHash(newUser.id, tokens.refresh_token);

    return this.finalizeSession(res, tokens);
  }

  async signinLocal(dto: LoginDto, res: Response) {
    const user = await this.prisma.extended.user.findUnique({
      where: { email: dto.email },
    });

    if (!user)
      throw new ForbiddenException('Access Denied: Invalid credentials');

    const passwordMatches = await argon2.verify(user.password, dto.password);
    if (!passwordMatches)
      throw new ForbiddenException('Access Denied: Invalid credentials');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return this.finalizeSession(res, tokens);
  }

  async logout(userId: number, res: Response) {
    await this.prisma.extended.user.updateMany({
      where: {
        id: userId,
        refreshTokenHash: { not: null },
      },
      data: { refreshTokenHash: null },
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
    });

    return { success: true };
  }

  async refreshTokens(userId: number, rt: string, res: Response) {
    const user = await this.prisma.extended.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshTokenHash)
      throw new ForbiddenException('Access Denied: Session expired');

    const rtMatches = await argon2.verify(user.refreshTokenHash, rt);
    if (!rtMatches)
      throw new ForbiddenException('Access Denied: Invalid token');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return this.finalizeSession(res, tokens);
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = await argon2.hash(rt);
    await this.prisma.extended.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }

  async getTokens(userId: number, email: string, role: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.config.get<string>('AT_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.config.get<string>('RT_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return { access_token: at, refresh_token: rt };
  }

  private finalizeSession(
    res: Response,
    tokens: { access_token: string; refresh_token: string },
  ) {
    const isProduction = this.config.get<string>('NODE_ENV') === 'production';

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token: tokens.access_token };
  }
}
