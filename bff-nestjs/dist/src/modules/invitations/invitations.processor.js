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
var InvitationsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationsProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const mail_service_1 = require("../mail/mail.service");
let InvitationsProcessor = InvitationsProcessor_1 = class InvitationsProcessor extends bullmq_1.WorkerHost {
    mailService;
    logger = new common_1.Logger(InvitationsProcessor_1.name);
    constructor(mailService) {
        super();
        this.mailService = mailService;
    }
    async process(job) {
        this.logger.log(`Processing job ${job.id} of type ${job.name}...`);
        switch (job.name) {
            case 'send-invitation':
                const { email, token, teamName } = job.data;
                return await this.mailService.sendInvitationEmail(email, teamName, token);
            default:
                this.logger.warn(`Unknown job name: ${job.name}`);
        }
    }
};
exports.InvitationsProcessor = InvitationsProcessor;
exports.InvitationsProcessor = InvitationsProcessor = InvitationsProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('mail-queue'),
    __metadata("design:paramtypes", [mail_service_1.MailService])
], InvitationsProcessor);
//# sourceMappingURL=invitations.processor.js.map