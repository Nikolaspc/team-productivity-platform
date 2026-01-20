import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  // English comment: Inject the Prisma service to interact with the database
  constructor(private prisma: PrismaService) {}

  async getHello(): Promise<string> {
    // English comment: Create a test user in PostgreSQL 14 with all required fields
    const user = await this.prisma.user.create({
      data: {
        email: `dev_${Date.now()}@example.com`,
        name: 'Nikolas Developer',
        password: 'securePassword123', // This field was missing and caused the error
      },
    });

    return `User created successfully: ${user.email} with ID: ${user.id}`;
  }
}
