import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Response } from 'express';
export declare class AuthService {
    private prisma;
    private jwtService;
    private config;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService);
    signupLocal(dto: RegisterDto, res: Response): Promise<{
        access_token: string;
    }>;
    signinLocal(dto: LoginDto, res: Response): Promise<{
        access_token: string;
    }>;
    logout(userId: number, res: Response): Promise<{
        success: boolean;
    }>;
    refreshTokens(userId: number, rt: string, res: Response): Promise<{
        access_token: string;
    }>;
    updateRtHash(userId: number, rt: string): Promise<void>;
    getTokens(userId: number, email: string, role: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    private finalizeSession;
}
