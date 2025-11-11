import Redis from 'ioredis';

let redisConnection: Redis | null = null;

export function getRedisConnection(): Redis {
  // 빌드 타임에는 Redis 연결을 만들지 않음
  if (typeof window !== 'undefined') {
    throw new Error('Redis connection should only be used on the server side');
  }

  if (!redisConnection) {
    redisConnection = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null, // BullMQ 필수 설정
      lazyConnect: true, // 명시적으로 connect()를 호출할 때까지 연결하지 않음
    });

    // Redis 연결 상태 확인
    redisConnection.on('connect', () => {
      console.log('Redis connected');
    });

    redisConnection.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  return redisConnection;
}
