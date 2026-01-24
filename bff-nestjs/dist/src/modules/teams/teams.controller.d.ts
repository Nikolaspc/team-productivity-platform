import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
export declare class TeamsController {
    private readonly teamsService;
    constructor(teamsService: TeamsService);
    create(userId: number, dto: CreateTeamDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    findAll(userId: number): Promise<({
        _count: {
            members: number;
            projects: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    })[]>;
}
