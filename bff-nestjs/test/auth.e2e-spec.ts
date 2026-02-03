import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    email: `e2e-auth-${Date.now()}@productivity.com`,
    password: 'password123',
    name: 'Nikolas Tesla',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.use(cookieParser());

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.$disconnect();
    await app.close();
  });

  describe('Authentication Flow', () => {
    it('/auth/signup (POST) - Success with RegisterDto', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');

      // English: Safe way to check cookies without TS errors
      const cookies = response.get('Set-Cookie');
      expect(cookies).toBeDefined();
      if (cookies) {
        expect(cookies[0]).toContain('refresh_token');
      }
    });

    it('/auth/signin (POST) - Success with LoginDto', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.get('Set-Cookie')).toBeDefined();
    });

    it('/auth/logout (POST) - Success', async () => {
      const loginRes = await request(app.getHttpServer()).post('/auth/signin').send({
        email: testUser.email,
        password: testUser.password,
      });

      const at = loginRes.body.access_token;

      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${at}`)
        .expect(200);
    });

    it('/auth/signup (POST) - Should fail if name is missing', async () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'noname@test.com',
          password: 'password123',
        })
        .expect(400);
    });
  });
});
