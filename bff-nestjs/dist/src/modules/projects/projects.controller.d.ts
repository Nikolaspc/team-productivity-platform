import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Role } from '@prisma/client';
export declare class ProjectsController {
    private projectsService;
    constructor(projectsService: ProjectsService);
    create(teamId: number, dto: CreateProjectDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        teamId: number;
    }>;
    findAll(teamId: number): Promise<({
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
    remove(teamId: number, projectId: number, userId: number, userRole: Role): Promise<any>;
}
