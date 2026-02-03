// bff-nestjs/src/common/guards/team-owner.guard.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TeamOwnerGuard } from './team-owner.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TeamRole } from '@prisma/client';

describe('TeamOwnerGuard', () => {
  let guard: TeamOwnerGuard;
  let prisma: PrismaService;

  const mockPrismaService = {
    extended: {
      teamMember: {
        findUnique: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamOwnerGuard, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    guard = module.get<TeamOwnerGuard>(TeamOwnerGuard);
    prisma = module.get<PrismaService>(PrismaService);
  });

  const createMockContext = (userId: number, teamId: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { sub: userId },
          params: { id: teamId },
        }),
      }),
    }) as any;

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if user is OWNER', async () => {
    mockPrismaService.extended.teamMember.findUnique.mockResolvedValue({
      role: TeamRole.OWNER,
    });

    const context = createMockContext(1, '10');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user is not OWNER', async () => {
    mockPrismaService.extended.teamMember.findUnique.mockResolvedValue({
      role: TeamRole.MEMBER,
    });

    const context = createMockContext(1, '10');
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException if membership does not exist', async () => {
    mockPrismaService.extended.teamMember.findUnique.mockResolvedValue(null);

    const context = createMockContext(1, '10');
    await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
  });
});
