import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsService } from './invitations.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { MailService } from '../mail/mail.service';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TeamRole, InvitationStatus } from '@prisma/client';

describe('InvitationsService', () => {
  let service: InvitationsService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockTeamId = 1;
  const mockInviterId = 10;
  const mockUserId = 5;
  const mockEmail = 'guest@test.com';
  const mockToken = 'valid-jwt-token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        {
          provide: PrismaService,
          useValue: {
            team: { findUnique: jest.fn() },
            teamMember: { findFirst: jest.fn(), create: jest.fn() },
            invitation: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            user: { findUnique: jest.fn() },
            $transaction: jest.fn((promises) => Promise.all(promises)),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue(mockToken),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: NotificationsGateway,
          useValue: { notifyInvitationAccepted: jest.fn() },
        },
        {
          provide: MailService,
          useValue: { sendInvitationEmail: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  describe('createInvitation', () => {
    it('should create an invitation successfully', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue({
        id: mockTeamId,
        name: 'Team Jest',
      });
      (prisma.teamMember.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.invitation.create as jest.Mock).mockResolvedValue({ id: 500 });

      const result = await service.createInvitation(
        mockTeamId,
        mockInviterId,
        mockEmail,
      );

      expect(result.message).toBe('Invitation sent successfully');
      expect(prisma.invitation.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if team does not exist', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.createInvitation(999, mockInviterId, mockEmail),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is already a member', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValue({
        id: mockTeamId,
      });
      (prisma.teamMember.findFirst as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(
        service.createInvitation(mockTeamId, mockInviterId, mockEmail),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('acceptInvitation', () => {
    const mockPayload = {
      teamId: mockTeamId,
      email: mockEmail,
      role: TeamRole.MEMBER,
    };
    const mockInvitationDb = {
      id: 100,
      token: mockToken,
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + 10000),
      teamId: mockTeamId,
    };

    it('should accept an invitation successfully', async () => {
      (jwt.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(
        mockInvitationDb,
      );
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUserId,
        email: mockEmail,
        name: 'Nikolas',
      });

      const result = await service.acceptInvitation(mockToken, mockUserId);

      expect(result.message).toBe('Joined the team successfully');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if email in token does not match user email', async () => {
      (jwt.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(
        mockInvitationDb,
      );
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: mockUserId,
        email: 'other@test.com',
      });

      await expect(
        service.acceptInvitation(mockToken, mockUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if invitation is already accepted', async () => {
      (jwt.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue({
        ...mockInvitationDb,
        status: InvitationStatus.ACCEPTED,
      });

      await expect(
        service.acceptInvitation(mockToken, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token is expired (JWT error)', async () => {
      const error = new Error();
      error.name = 'TokenExpiredError';
      (jwt.verifyAsync as jest.Mock).mockRejectedValue(error);

      await expect(
        service.acceptInvitation('expired', mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      (jwt.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(
        mockInvitationDb,
      );
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.acceptInvitation(mockToken, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
