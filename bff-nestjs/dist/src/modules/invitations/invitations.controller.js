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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationsController = void 0;
const common_1 = require("@nestjs/common");
const invitations_service_1 = require("./invitations.service");
const at_guard_1 = require("../../auth/guards/at.guard");
const decorators_1 = require("../../common/decorators");
const swagger_1 = require("@nestjs/swagger");
const invitation_dto_1 = require("./dto/invitation.dto");
let InvitationsController = class InvitationsController {
    invitationsService;
    constructor(invitationsService) {
        this.invitationsService = invitationsService;
    }
    async invite(teamId, userId, dto) {
        return this.invitationsService.createInvitation(teamId, userId, dto.email, dto.role);
    }
    async accept(dto, userId) {
        return this.invitationsService.acceptInvitation(dto.token, userId);
    }
};
exports.InvitationsController = InvitationsController;
__decorate([
    (0, common_1.Post)('team/:teamId/send'),
    (0, swagger_1.ApiOperation)({ summary: 'Send an email invitation to join a team' }),
    __param(0, (0, common_1.Param)('teamId', common_1.ParseIntPipe)),
    __param(1, (0, decorators_1.GetCurrentUserId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, invitation_dto_1.SendInvitationDto]),
    __metadata("design:returntype", Promise)
], InvitationsController.prototype, "invite", null);
__decorate([
    (0, common_1.Post)('accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept a team invitation using a token' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.GetCurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invitation_dto_1.AcceptInvitationDto, Number]),
    __metadata("design:returntype", Promise)
], InvitationsController.prototype, "accept", null);
exports.InvitationsController = InvitationsController = __decorate([
    (0, swagger_1.ApiTags)('invitations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(at_guard_1.AtGuard),
    (0, common_1.Controller)('invitations'),
    __metadata("design:paramtypes", [invitations_service_1.InvitationsService])
], InvitationsController);
//# sourceMappingURL=invitations.controller.js.map