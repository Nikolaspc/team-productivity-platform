"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WsJwtGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsJwtGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const websockets_1 = require("@nestjs/websockets");
let WsJwtGuard = WsJwtGuard_1 = class WsJwtGuard {
    jwtService;
    config;
    logger = new common_1.Logger(WsJwtGuard_1.name);
    constructor(jwtService, config) {
        this.jwtService = jwtService;
        this.config = config;
    }
    async canActivate(context) {
        try {
            const client = context.switchToWs().getClient();
            const token = client.handshake?.auth?.token ||
                client.handshake?.headers?.authorization?.split(' ')[1];
            if (!token) {
                this.logger.warn('WebSocket connection attempt rejected: No token provided');
                throw new websockets_1.WsException('Unauthorized');
            }
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.config.get('AT_SECRET'),
            });
            client.user = payload;
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`WebSocket JWT Verification failed: ${errorMessage}`);
            throw new websockets_1.WsException('Unauthorized');
        }
    }
};
exports.WsJwtGuard = WsJwtGuard;
exports.WsJwtGuard = WsJwtGuard = WsJwtGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], WsJwtGuard);
//# sourceMappingURL=ws-jwt.guard.js.map