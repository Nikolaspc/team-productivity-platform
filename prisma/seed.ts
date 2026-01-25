// prisma/seed.ts
import { PrismaClient, Role, TaskStatus, TeamRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Seeding Process ---');
  // English: Hashing the default password for the admin user
  const password = await argon2.hash('password123');

  // 1. Create or Update Admin User
  // English: The email is admin@test.com, not admin@demo.local
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { password },
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      password,
      role: Role.ADMIN,
    },
  });

  // 2. Create Team
  // English: Check if team exists to avoid unique constraint errors during re-seeding
  const existingTeam = await prisma.team.findFirst({
    where: { name: 'Development Team' },
  });

  if (!existingTeam) {
    const team = await prisma.team.create({
      data: {
        name: 'Development Team',
        members: {
          create: {
            userId: admin.id,
            role: TeamRole.OWNER,
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
            { title: 'Database Schema', status: TaskStatus.DONE },
            { title: 'API Implementation', status: TaskStatus.IN_PROGRESS },
            {
              title: 'Legacy Migration',
              status: TaskStatus.TODO,
              dueDate: new Date('2025-01-01'),
            },
          ],
        },
      },
    });
  }

  console.log('--- Seed Success ---');
  console.log({
    admin: admin.email,
    password_plain: 'password123',
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
