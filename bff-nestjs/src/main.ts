import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  // Create the app with NestExpressApplication type to access Express methods
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Security enhancement - Hide the underlying technology (Express)
  app.disable('x-powered-by');

  // Set Pino as the primary logger for structured JSON logging
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const cookieSecret = configService.get<string>('COOKIE_SECRET');
  const nodeEnv = configService.get<string>('NODE_ENV');

  // Set API version prefix for versioning strategy
  app.setGlobalPrefix('api/v1');

  // Cookie signing is mandatory for SaaS security to prevent client-side tampering
  app.use(cookieParser(cookieSecret));

  // Strict CORS configuration pulling from validated environment variables
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'set-cookie'],
  });

  // Global validation pipes for DTO integrity
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter for GDPR and security compliance
  app.useGlobalFilters(new AllExceptionsFilter(configService));

  // Global interceptor for serialization
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  // Swagger API Documentation - restricted to non-production environments
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

  // Start listening on configured port
  await app.listen(port);

  // Initial bootstrap info with proper console logging
  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);

  if (nodeEnv !== 'production') {
    console.log(`📚 Documentation: http://localhost:${port}/api/docs`);
  }
}

// Execute bootstrap with error handling
bootstrap().catch((error) => {
  console.error('❌ Application bootstrap failed:', error);
  process.exit(1);
});
