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
    // Initialize S3 Client with credentials from environment
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
   * Deletes a file from Cloud Storage bucket with key extraction
   * English: Extracts the file key from the full URL and deletes it from S3
   * Works with Supabase S3 endpoint format
   */
  async deleteFile(fileUrl: string): Promise<void> {
    const bucket = this.config.get<string>('STORAGE_BUCKET')!;

    try {
      // English: Extract the file key from the URL
      // URL format: https://iaqnnevdkhpkpyrwecfh.storage.supabase.co/storage/v1/s3/{bucket}/task-attachments/...
      // We need to extract: task-attachments/FILENAME

      const bucketMarker = `/${bucket}/`;
      const markerIndex = fileUrl.indexOf(bucketMarker);

      if (markerIndex === -1) {
        throw new Error(
          `Bucket marker "${bucketMarker}" not found in URL: ${fileUrl}`,
        );
      }

      // English: Extract everything after the bucket name (the file key)
      const fileKey = fileUrl.substring(markerIndex + bucketMarker.length);

      this.logger.log(`Attempting to delete cloud file with key: ${fileKey}`);

      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: fileKey,
      });

      await this.s3Client.send(command);

      this.logger.log(`Successfully deleted file: ${fileKey}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Cloud Delete Error: ${errorMessage}`);
      throw error;
    }
  }
}
