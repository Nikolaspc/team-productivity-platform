import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2'; // English: Changed from bcrypt to argon2

const prisma = new PrismaClient();

async function main() {
  // English: Use argon2 to match AuthService logic
  const password = await argon2.hash('password123');

  // English: Create an ADMIN user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {
      password, // English: Update password in case it was previously hashed with bcrypt
    },
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      password,
      role: Role.ADMIN,
    },
  });

  // English: Create a regular USER
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {
      password,
    },
    create: {
      email: 'user@test.com',
      name: 'Regular User',
      password,
      role: Role.USER,
    },
  });

  console.log('--- Seed Success ---');
  console.log({ admin: admin.email, user: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
