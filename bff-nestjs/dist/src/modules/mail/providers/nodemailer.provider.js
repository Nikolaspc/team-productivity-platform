"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NodemailerProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodemailerProvider = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const config_1 = require("@nestjs/config");
let NodemailerProvider = NodemailerProvider_1 = class NodemailerProvider {
    config;
    transporter;
    logger = new common_1.Logger(NodemailerProvider_1.name);
    constructor(config) {
        this.config = config;
        this.transporter = nodemailer.createTransport({
            host: this.config.get('MAIL_HOST'),
            port: this.config.get('MAIL_PORT'),
            auth: {
                user: this.config.get('MAIL_USER'),
                pass: this.config.get('MAIL_PASS'),
            },
        });
    }
    async sendMail(options) {
        try {
            await this.transporter.sendMail({
                from: this.config.get('MAIL_FROM'),
                to: options.to,
                subject: options.subject,
                html: `<h1>${options.subject}</h1><p>${options.context.message || ''}</p>`,
            });
            this.logger.log(`Email successfully sent to ${options.to}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to send email to ${options.to}: ${errorMessage}`, errorStack);
            throw error;
        }
    }
};
exports.NodemailerProvider = NodemailerProvider;
exports.NodemailerProvider = NodemailerProvider = NodemailerProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NodemailerProvider);
//# sourceMappingURL=nodemailer.provider.js.map