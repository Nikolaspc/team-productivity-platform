import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TeamRole } from '@prisma/client';

describe('TeamsService', () => {
  let service: TeamsService;
  let prisma: PrismaService;

  const mockUserId = 1;
  const mockTeamDto = { name: 'Engineering Team' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: PrismaService,
          useValue: {
            extended: {
              $transaction: jest.fn(),
              team: {
                findMany: jest.fn(),
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a team and its owner within a transaction', async () => {
      const mockTeam = { id: 10, name: mockTeamDto.name };

      // English: Mocking the transaction flow
      (prisma.extended.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          const tx = {
            team: { create: jest.fn().mockResolvedValue(mockTeam) },
            teamMember: { create: jest.fn().mockResolvedValue({}) },
          };
          return callback(tx);
        },
      );

      const result = await service.create(mockUserId, mockTeamDto);

      expect(result).toEqual(mockTeam);
      expect(prisma.extended.$transaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return teams where the user is a member', async () => {
      const mockTeams = [
        { id: 1, name: 'Team A' },
        { id: 2, name: 'Team B' },
      ];
      (prisma.extended.team.findMany as jest.Mock).mockResolvedValue(mockTeams);

      const result = await service.findAll(mockUserId);

      expect(result).toHaveLength(2);
      expect(prisma.extended.team.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { members: { some: { userId: mockUserId } } },
        }),
      );
    });
  });
});
