import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // English: Import ConfigModule
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // English: Load .env file globally
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
