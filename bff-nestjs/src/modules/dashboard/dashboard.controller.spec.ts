import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockDashboardService = {
    getTeamStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockDashboardService }],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  it('should return stats for a team via service', async () => {
    const mockStats = {
      teamName: 'Team Alpha',
      totalProjects: 1,
      projects: [],
    };
    mockDashboardService.getTeamStats.mockResolvedValue(mockStats);

    const result = await controller.getStats(1);

    expect(service.getTeamStats).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockStats);
  });
});
