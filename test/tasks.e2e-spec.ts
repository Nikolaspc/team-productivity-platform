import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: number;
  let projectId: number;

  const testUser = {
    email: `tasks-e2e-${Date.now()}@test.com`,
    password: 'password123',
    name: 'Task Tester',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.use(cookieParser());
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // --- SETUP: Create User, Team and Project ---
    // 1. Signup & Signin
    await request(app.getHttpServer()).post('/auth/signup').send(testUser);
    const loginRes = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: testUser.email,
        password: testUser.password,
      });
    accessToken = loginRes.body.access_token;

    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    userId = user!.id;

    // 2. Create Team
    const team = await prisma.team.create({
      data: {
        name: 'E2E Team',
        members: { create: { userId, role: 'OWNER' } },
      },
    });

    // 3. Create Project
    const project = await prisma.project.create({
      data: {
        name: 'E2E Project',
        teamId: team.id,
      },
    });
    projectId = project.id;
  });

  afterAll(async () => {
    // English: Cleanup database
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.team.deleteMany({ where: { name: 'E2E Team' } });
    await prisma.$disconnect();
    await app.close();
  });

  describe('/tasks', () => {
    it('POST /tasks - Should create a task', async () => {
      const createTaskDto = {
        title: 'Finish E2E Tests',
        description: 'Testing the task creation flow',
        projectId: projectId,
        status: 'TODO',
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createTaskDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createTaskDto.title);
    });

    it('GET /tasks/project/:id - Should return tasks for the project', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tasks/project/${projectId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('POST /tasks - Should fail if user is not in the team', async () => {
      // English: Create a project in a team where the user is NOT a member
      const otherTeam = await prisma.team.create({
        data: { name: 'Other Team' },
      });
      const otherProject = await prisma.project.create({
        data: { name: 'Unauthorized Project', teamId: otherTeam.id },
      });

      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Hacker Task',
          projectId: otherProject.id,
        })
        .expect(403); // English: Forbidden
    });
  });
});
