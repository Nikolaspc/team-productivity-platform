// src/auth/auth.service.ts
import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserEntity } from './entities/user.entity';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hash = await argon2.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          name: dto.name,
        },
      });

      const tokens = await this.getTokens(user.id, user.email, user.role);
      await this.updateRtHash(user.id, tokens.refresh_token);

      return { user: new UserEntity(user), tokens };
    } catch (error) {
      throw new ConflictException('Credentials taken or invalid data');
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatches = await argon2.verify(user.password, dto.password);
    if (!passwordMatches)
      throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return { user: new UserEntity(user), tokens };
  }

  async logout(userId: number) {
    // Enterprise standard: Clear the refresh token from DB on logout
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshTokenHash: { not: null },
      },
      data: { refreshTokenHash: null },
    });
  }

  async refreshTokens(userId: number, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshTokenHash)
      throw new ForbiddenException('Access Denied');

    const rtMatches = await argon2.verify(user.refreshTokenHash, rt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return { user: new UserEntity(user), tokens };
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = await argon2.hash(rt);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }

  async getTokens(userId: number, email: string, role: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: process.env.AT_SECRET, expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: process.env.RT_SECRET, expiresIn: '7d' },
      ),
    ]);

    return { access_token: at, refresh_token: rt };
  }
}
