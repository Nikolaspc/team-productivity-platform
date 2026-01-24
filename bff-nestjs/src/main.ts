import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser'; // Fixed: Default import for TS2349 compatibility
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  // English: Create the app with NestExpressApplication type to access Express methods
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // English: Security enhancement - Hide the underlying technology (Express)
  app.disable('x-powered-by');

  // English: Set Pino as the primary logger for structured JSON logging
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const cookieSecret = configService.get<string>('COOKIE_SECRET');
  const nodeEnv = configService.get<string>('NODE_ENV');

  app.setGlobalPrefix('api/v1');

  // English: Cookie signing is mandatory for SaaS security to prevent client-side tampering
  app.use(cookieParser(cookieSecret));

  // English: Strict CORS configuration pulling from validated environment variables
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'set-cookie'],
  });

  // English: Global validation pipes for DTO integrity
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // English: Global exception filter for GDPR and security compliance
  app.useGlobalFilters(new AllExceptionsFilter(configService));

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  // English: Swagger API Documentation - restricted to non-production environments
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Team Productivity Platform')
      .setDescription('BFF Enterprise API - German Market Standard')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer' }, 'access-token')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);

  // English: Initial bootstrap info
  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  if (nodeEnv !== 'production') {
    console.log(`📚 Documentation: http://localhost:${port}/api/docs`);
  }
}
bootstrap();
