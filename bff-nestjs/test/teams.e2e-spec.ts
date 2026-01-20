import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Teams (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: number;

  const testUser = {
    email: `team-e2e-${Date.now()}@test.com`,
    password: 'password123',
    name: 'Team Manager',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // Setup: User & Auth
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
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
    await app.close();
  });

  describe('/teams', () => {
    it('POST /teams - Should create a team and assign user as OWNER', async () => {
      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Alpha Team' })
        .expect(201);

      expect(response.body.name).toBe('Alpha Team');

      // English: Verify in DB that the membership was created correctly
      const membership = await prisma.teamMember.findFirst({
        where: { teamId: response.body.id, userId: userId },
      });
      expect(membership?.role).toBe('OWNER');
    });

    it('GET /teams - Should list user teams', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((t: any) => t.name === 'Alpha Team')).toBe(
        true,
      );
    });
  });
});
