import { Redis } from '@upstash/redis';
import type { StorageBackend } from './types';

/**
 * Upstash Redis storage backend for production
 * Uses HTTP-based Redis client that works in serverless environments
 */
export class RedisStorage implements StorageBackend {
  private redis: Redis;

  constructor(redis?: Redis) {
    this.redis =
      redis ||
      new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN!,
      });
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const value = await this.redis.get<T>(key);
    return value ?? null;
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    await this.redis.set(key, value);
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.redis.del(key);
    return result > 0;
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result > 0;
  }

  async keys(pattern: string): Promise<string[]> {
    // Convert our simple wildcard pattern to Redis pattern
    // Our patterns use * which is the same as Redis
    const keys: string[] = [];
    let cursor: string = '0';

    do {
      const result: [string, string[]] = await this.redis.scan(cursor, {
        match: pattern,
        count: 100,
      });
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== '0');

    return keys;
  }
}
