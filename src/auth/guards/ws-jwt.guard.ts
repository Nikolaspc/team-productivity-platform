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

      // English: Extract token from handshake auth or headers (standard WS Auth flow)
      const token =
        client.handshake?.auth?.token ||
        client.handshake?.headers?.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(
          'WebSocket connection attempt rejected: No token provided',
        );
        throw new WsException('Unauthorized');
      }

      // English: Verify the access token using the global AT_SECRET
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('AT_SECRET'),
      });

      // English: Attach the user payload to the client for use in event handlers (@ConnectedSocket)
      client.user = payload;

      return true;
    } catch (error: unknown) {
      // English: Handle unknown error type to ensure production stability
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`WebSocket JWT Verification failed: ${errorMessage}`);

      throw new WsException('Unauthorized');
    }
  }
}
