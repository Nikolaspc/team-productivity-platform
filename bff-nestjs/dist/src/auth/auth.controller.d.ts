import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(dto: RegisterDto, res: Response): Promise<{
        access_token: string;
    }>;
    signin(dto: LoginDto, res: Response): Promise<{
        access_token: string;
    }>;
    logout(userId: number, res: Response): Promise<{
        success: boolean;
    }>;
    refreshTokens(userId: number, refreshToken: string, res: Response): Promise<{
        access_token: string;
    }>;
}
