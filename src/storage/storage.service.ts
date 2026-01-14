// src/storage/storage.service.ts
import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private readonly logger = new Logger(StorageService.name);

  constructor(private config: ConfigService) {
    // English: Initialize S3 Client with credentials from environment
    this.s3Client = new S3Client({
      region: this.config.get<string>('STORAGE_REGION')!,
      endpoint: this.config.get<string>('STORAGE_ENDPOINT')!,
      credentials: {
        accessKeyId: this.config.get<string>('STORAGE_ACCESS_KEY')!,
        secretAccessKey: this.config.get<string>('STORAGE_SECRET_KEY')!,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucket = this.config.get<string>('STORAGE_BUCKET')!;
    const fileKey = `task-attachments/${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    const endpoint = this.config.get<string>('STORAGE_ENDPOINT')!;
    return `${endpoint}/${bucket}/${fileKey}`;
  }

  /**
   * English: Deletes a file from Supabase/S3 bucket with improved key extraction
   */
  async deleteFile(fileUrl: string): Promise<void> {
    const bucket = this.config.get<string>('STORAGE_BUCKET')!;

    try {
      const bucketMarker = `/${bucket}/`;
      const markerIndex = fileUrl.indexOf(bucketMarker);

      if (markerIndex === -1) {
        throw new Error(`Bucket marker ${bucketMarker} not found in URL`);
      }

      const fileKey = fileUrl.substring(markerIndex + bucketMarker.length);

      this.logger.log(`Attempting to delete cloud file with key: ${fileKey}`);

      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: fileKey,
      });

      await this.s3Client.send(command);
    } catch (error: any) {
      // English: Explicitly handle 'unknown' error type for TS18046
      this.logger.error(`Cloud Delete Error: ${error.message}`);
      throw error;
    }
  }
}
