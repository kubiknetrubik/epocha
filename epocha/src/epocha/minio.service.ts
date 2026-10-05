import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as Minio from 'minio';

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Minio.Client;
  private readonly bucket: string;
  private readonly baseUrl: string;

  constructor(config: ConfigService) {
    const endPoint = config.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = Number(config.get('MINIO_PORT', 9000));
    const useSSL = config.get<string>('MINIO_USE_SSL', 'false') === 'true';
    this.bucket = config.get<string>('MINIO_BUCKET', 'media');
    this.baseUrl = `${useSSL ? 'https' : 'http'}://${endPoint}:${port}/${this.bucket}`;
    this.client = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey: config.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: config.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    });
  }

  async onModuleInit() {
    try {
      if (!(await this.client.bucketExists(this.bucket))) {
        await this.client.makeBucket(this.bucket, 'us-east-1');
      }
      await this.client.setBucketPolicy(
        this.bucket,
        JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/*`],
            },
          ],
        }),
      );
    } catch (e) {
      this.logger.error(`MinIO недоступен: ${(e as Error).message}`);
    }
  }

  async upload(file: Express.Multer.File, kind: 'img' | 'vid'): Promise<string> {
    const name = `${kind}-${randomUUID()}.${EXT[file.mimetype] ?? 'bin'}`;
    await this.client.putObject(this.bucket, name, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });
    return name;
  }

  async remove(name?: string | null): Promise<void> {
    if (!name || !this.isManaged(name)) return;
    try {
      await this.client.removeObject(this.bucket, name);
    } catch (e) {
      this.logger.warn(`Не удалось удалить ${name}: ${(e as Error).message}`);
    }
  }

  publicUrl(value?: string | null): string | null {
    if (!value || !value.trim()) return null;
    return this.isManaged(value) ? `${this.baseUrl}/${value}` : value;
  }

  private isManaged(value: string): boolean {
    return !/^(https?:)?\/\//.test(value) && !value.startsWith('/');
  }
}
