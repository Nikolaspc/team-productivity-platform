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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationsService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const mail_service_1 = require("../mail/mail.service");
const client_1 = require("@prisma/client");
let InvitationsService = class InvitationsService {
    prisma;
    jwtService;
    notifications;
    mailService;
    constructor(prisma, jwtService, notifications, mailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.notifications = notifications;
        this.mailService = mailService;
    }
    async createInvitation(teamId, inviterId, targetEmail, role = client_1.TeamRole.MEMBER) {
        const team = await this.prisma.team.findUnique({
            where: { id: teamId },
            include: { members: true },
        });
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        const inviterMember = team.members.find((m) => m.userId === inviterId);
        if (!inviterMember) {
            throw new common_1.ForbiddenException('You are not a member of this team');
        }
        if (inviterMember.role !== client_1.TeamRole.OWNER) {
            throw new common_1.ForbiddenException('Only team owners can send invitations');
        }
        const lowerEmail = targetEmail.toLowerCase();
        const existingMember = await this.prisma.teamMember.findFirst({
            where: { teamId, user: { email: lowerEmail } },
        });
        if (existingMember)
            throw new common_1.BadRequestException('User is already a member of this team');
        const inviterUser = await this.prisma.user.findUnique({
            where: { id: inviterId },
        });
        if (inviterUser?.email.toLowerCase() === lowerEmail) {
            throw new common_1.BadRequestException('You cannot invite yourself');
        }
        const invitationToken = this.jwtService.sign({ teamId, email: lowerEmail, role, inviterId }, { expiresIn: '7d' });
        const invitation = await this.prisma.invitation.create({
            data: {
                email: lowerEmail,
                token: invitationToken,
                teamId,
                inviterId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: client_1.InvitationStatus.PENDING,
            },
        });
        await this.mailService.sendInvitationEmail(lowerEmail, team.name, invitationToken);
        return {
            message: 'Invitation sent successfully',
            invitationId: invitation.id,
        };
    }
    async acceptInvitation(token, userId) {
        try {
            const payload = await this.jwtService.verifyAsync(token);
            const { teamId, email, role } = payload;
            const invitation = await this.prisma.invitation.findUnique({
                where: { token },
            });
            if (!invitation ||
                invitation.status === client_1.InvitationStatus.ACCEPTED ||
                new Date() > invitation.expiresAt) {
                throw new common_1.BadRequestException('Invitation invalid, already accepted or expired');
            }
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new common_1.NotFoundException('User not found');
            if (user.email.toLowerCase() !== email.toLowerCase()) {
                throw new common_1.ForbiddenException('Email mismatch for this invitation');
            }
            const userName = user.name ?? 'New Member';
            await this.prisma.$transaction([
                this.prisma.teamMember.create({
                    data: {
                        userId,
                        teamId,
                        role: role || client_1.TeamRole.MEMBER,
                    },
                }),
                this.prisma.invitation.update({
                    where: { id: invitation.id },
                    data: { status: client_1.InvitationStatus.ACCEPTED },
                }),
            ]);
            this.notifications.notifyInvitationAccepted(teamId, userName);
            return { message: 'Joined the team successfully' };
        }
        catch (error) {
            if (error.name === 'JsonWebTokenError')
                throw new common_1.BadRequestException('Invalid invitation token');
            if (error.name === 'TokenExpiredError')
                throw new common_1.BadRequestException('Invitation token has expired');
            throw error;
        }
    }
};
exports.InvitationsService = InvitationsService;
exports.InvitationsService = InvitationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        notifications_gateway_1.NotificationsGateway,
        mail_service_1.MailService])
], InvitationsService);
//# sourceMappingURL=invitations.service.js.map