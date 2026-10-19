import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';

export interface SessionUser {
  id: number;
  username: string;
}

@Injectable()
export class SessionService implements OnModuleDestroy {
  private readonly logger = new Logger(SessionService.name);
  private readonly redis: Redis;
  readonly ttlSec: number;

  constructor(config: ConfigService) {
    this.ttlSec = Number(config.get('SESSION_TTL', 3600));
    this.redis = new Redis({
      host: config.get<string>('REDIS_HOST', 'localhost'),
      port: Number(config.get('REDIS_PORT', 6379)),
      password: config.get<string>('REDIS_PASSWORD') || undefined,
      lazyConnect: false,
      maxRetriesPerRequest: 2,
    });
    this.redis.on('error', (e) => this.logger.error(`Redis: ${e.message}`));
  }

  private key(sessionId: string) {
    return `session:${sessionId}`;
  }

  async create(user: SessionUser): Promise<string> {
    const sessionId = randomUUID();
    const key = this.key(sessionId);
    await this.redis
      .multi()
      .hset(key, { userId: String(user.id), username: user.username })
      .expire(key, this.ttlSec)
      .exec();
    return sessionId;
  }

  async get(sessionId: string): Promise<SessionUser | null> {
    const data = await this.redis.hgetall(this.key(sessionId));
    if (!data.userId) return null;
    return { id: Number(data.userId), username: data.username };
  }

  async destroy(sessionId: string): Promise<void> {
    await this.redis.del(this.key(sessionId));
  }

  async onModuleDestroy() {
    await this.redis.quit().catch(() => undefined);
  }
}
