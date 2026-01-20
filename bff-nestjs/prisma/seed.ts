import { PrismaClient, Role, TaskStatus, TeamRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Seeding Process ---');
  const password = await argon2.hash('password123');

  // 1. Create or Update Admin User (Global Role)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { password },
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      password,
      role: Role.ADMIN, // Este es el rol global del sistema
    },
  });

  // 2. Create Team using OWNER instead of ADMIN
  // English: Fixed based on your schema error: OWNER, MEMBER, VIEWER
  const team = await prisma.team.create({
    data: {
      name: 'Development Team',
      members: {
        create: {
          userId: admin.id,
          role: TeamRole.OWNER, // Cambiado de ADMIN a OWNER
        },
      },
    },
  });

  // 3. Create Project with Tasks
  await prisma.project.create({
    data: {
      name: 'Platform Rebuild',
      teamId: team.id,
      tasks: {
        create: [
          {
            title: 'Database Schema',
            status: TaskStatus.DONE,
          },
          {
            title: 'API Implementation',
            status: TaskStatus.IN_PROGRESS,
          },
          {
            title: 'Legacy Migration',
            status: TaskStatus.TODO,
            dueDate: new Date('2025-01-01'),
          },
        ],
      },
    },
  });

  console.log('--- Seed Success ---');
  console.log({
    admin: admin.email,
    teamId: team.id,
  });
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
