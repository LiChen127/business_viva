import redisClient from '@/config/redis.config';

class RedisHelper {
  static defineKey(key: string, service: string) {
    return `${service}:${key}`;
  }

  static async set(key: string, value: any, ttl: number) {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;

    if (ttl) {
      await redisClient.set(key, stringValue, 'EX', ttl);
    } else {
      await redisClient.set(key, stringValue);
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    const value = await redisClient.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      return value as unknown as T;
    }
  }

  static async delete(key: string) {
    await redisClient.del(key);
  }

  static async clear() {
    await redisClient.flushall();
  }

  static async exists(key: string) {
    const result = await redisClient.exists(key);
    return result === 1;
  }
}

export default RedisHelper;
