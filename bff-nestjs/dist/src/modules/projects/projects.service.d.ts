import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Role, TeamRole } from '@prisma/client';
export declare class ProjectsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(teamId: number, dto: CreateProjectDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        teamId: number;
    }>;
    findAllByTeam(teamId: number): Promise<({
        _count: {
            tasks: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        teamId: number;
    })[]>;
    remove(teamId: number, projectId: number, userRole: Role, teamRole?: TeamRole): Promise<any>;
}
