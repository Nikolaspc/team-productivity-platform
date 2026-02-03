import { Test, TestingModule } from '@nestjs/testing';
import { TeamMemberGuard } from './team-member.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException, ExecutionContext } from '@nestjs/common';

describe('TeamMemberGuard', () => {
  let guard: TeamMemberGuard;
  let prisma: PrismaService;

  const mockPrisma = {
    extended: {
      teamMember: { findFirst: jest.fn() },
    },
  };

  const createMockContext = (params: any, body: any, userId: number): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          params,
          body,
          user: { sub: userId },
        }),
      }),
    }) as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamMemberGuard, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    guard = module.get<TeamMemberGuard>(TeamMemberGuard);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return true if no teamId is provided (skips check)', async () => {
    const context = createMockContext({}, {}, 1);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow access if membership exists', async () => {
    mockPrisma.extended.teamMember.findFirst.mockResolvedValue({
      id: 1,
    });
    const context = createMockContext({ teamId: '5' }, {}, 1);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockPrisma.extended.teamMember.findFirst).toHaveBeenCalled();
  });

  it('should throw ForbiddenException if membership does not exist', async () => {
    mockPrisma.extended.teamMember.findFirst.mockResolvedValue(null);
    const context = createMockContext({}, { teamId: 5 }, 1); // Prueba desde el body

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
