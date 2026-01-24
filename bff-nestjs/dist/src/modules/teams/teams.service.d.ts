import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
export declare class TeamsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
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
    remove(teamId: number): Promise<any>;
}
