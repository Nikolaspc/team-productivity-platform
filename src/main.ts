import {
  ClassSerializerInterceptor,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // English: Set global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // English: Middleware for cookie handling
  app.use(cookieParser());

  // English: Configure CORS
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

  // English: Apply Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // English: Global interceptors
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // English: Swagger Configuration - FIXED FOR BEARER AUTH
  const config = new DocumentBuilder()
    .setTitle('Team Productivity Platform')
    .setDescription('The Team Productivity API description')
    .setVersion('1.0')
    // English: Added Bearer Auth to match AtStrategy validation
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token', // English: This name links the security to the @ApiBearerAuth() decorator
    )
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // English: Updated to 'api' to match your previous tests, or keep 'api/docs'
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log('************************************************');
  logger.log(`🚀 APP STARTED SUCCESSFULLY ON PORT ${port}`);
  logger.log('✅ DATABASE AND MODULES INITIALIZED');
  logger.log('************************************************');
}
bootstrap();
