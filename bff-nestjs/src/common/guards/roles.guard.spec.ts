import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let prisma: PrismaService;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockPrisma = {
    teamMember: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(() => {
    reflector = mockReflector as any;
    prisma = mockPrisma as any;
    guard = new RolesGuard(reflector, prisma);
  });

  const createMockContext = (user: any, params: any = {}): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user, params }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  it('should allow access if route is public', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true); // isPublic = true
    const context = createMockContext(null);
    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user is global ADMIN', async () => {
    mockReflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(null);
    const context = createMockContext({ role: Role.ADMIN });
    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should throw Forbidden if global roles do not match', async () => {
    mockReflector.getAllAndOverride
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce([Role.ADMIN]); // requiredRoles

    const context = createMockContext({ role: Role.USER });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should validate team membership if teamId is present', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    const mockUser = { sub: 1, role: Role.USER };
    const context = createMockContext(mockUser, { teamId: '10' });

    mockPrisma.teamMember.findUnique.mockResolvedValue({
      userId: 1,
      teamId: 10,
      role: 'MEMBER',
    });

    expect(await guard.canActivate(context)).toBe(true);
    expect(mockUser['teamRole']).toBe('MEMBER');
  });

  it('should throw Forbidden if user is not in team', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    const context = createMockContext({ sub: 1 }, { teamId: '10' });

    mockPrisma.teamMember.findUnique.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow('You are not a member of this team');
  });
});
