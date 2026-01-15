import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient();

      // English: Extract token from handshake auth or headers
      const token =
        client.handshake?.auth?.token ||
        client.handshake?.headers?.authorization?.split(' ')[1];

      if (!token) {
        this.logger.error('No token provided for WebSocket connection');
        throw new WsException('Unauthorized');
      }

      // English: Verify the access token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('AT_SECRET'),
      });

      // English: Attach the user payload to the client for later use
      client.user = payload;

      return true;
    } catch (error) {
      this.logger.error('WebSocket JWT Verification failed');
      throw new WsException('Unauthorized');
    }
  }
}
