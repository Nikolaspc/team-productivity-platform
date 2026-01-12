import {
  ClassSerializerInterceptor,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js'; // English: Import the new filter

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // English: Set global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // English: Middleware for cookie handling
  app.use(cookieParser());

  // English: Configure CORS according to Roadmap Section 9
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // English: Global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // English: Apply Global Exception Filter (Section 11 of Spec)
  app.useGlobalFilters(new AllExceptionsFilter());

  // English: Global interceptors for @Exclude() and other decorators
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // English: Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Team Productivity Platform')
    .setDescription('The Team Productivity API description')
    .setVersion('1.0')
    .addCookieAuth('access_token') // English: Necessary for our Cookie security strategy
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  // English: Verification logs
  logger.log('************************************************');
  logger.log(`🚀 APP STARTED SUCCESSFULLY ON PORT ${port}`);
  logger.log('✅ DATABASE AND MODULES INITIALIZED');
  logger.log('************************************************');
}
bootstrap();
