import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Invitations (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let ownerToken: string;
  let guestToken: string;
  let teamId: number;
  let invitationToken: string;

  const ownerUser = {
    email: 'owner@test.com',
    password: 'password123',
    name: 'Owner',
  };

  const guestUser = {
    email: 'guest@test.com',
    password: 'password123',
    name: 'Guest',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // 1. Create Owner and Team
    await request(app.getHttpServer()).post('/auth/signup').send(ownerUser);

    const loginOwner = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(ownerUser);

    ownerToken = loginOwner.body.access_token;

    const teamRes = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'E2E Team' });

    teamId = teamRes.body.id;

    // 2. Create Guest User
    await request(app.getHttpServer()).post('/auth/signup').send(guestUser);

    const loginGuest = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(guestUser);

    guestToken = loginGuest.body.access_token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [ownerUser.email, guestUser.email] } },
    });
    await prisma.team.deleteMany({ where: { name: 'E2E Team' } });
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /invitations/team/:id/send - Should send invitation', async () => {
    const res = await request(app.getHttpServer())
      .post(`/invitations/team/${teamId}/send`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: guestUser.email, role: 'MEMBER' })
      .expect(201);

    expect(res.body.message).toBeDefined();
    expect(res.body.invitationId).toBeDefined();

    const inv = await prisma.invitation.findFirst({
      where: { email: guestUser.email },
    });

    invitationToken = inv!.token;
  });

  it('POST /invitations/accept - Should fail if email mismatch', async () => {
    // Attempting to accept guest's invitation with owner's account
    await request(app.getHttpServer())
      .post('/invitations/accept')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ token: invitationToken })
      .expect(403);
  });

  it('POST /invitations/accept - Should join team successfully', async () => {
    await request(app.getHttpServer())
      .post('/invitations/accept')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ token: invitationToken })
      .expect(201);

    // Verify membership
    const member = await prisma.teamMember.findFirst({
      where: {
        teamId,
        user: { email: guestUser.email },
      },
    });

    expect(member).toBeDefined();
  });
});
