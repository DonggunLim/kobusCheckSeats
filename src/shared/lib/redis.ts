import Redis from 'ioredis';

export const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null, // BullMQ 필수 설정
});

// Redis 연결 상태 확인
redisConnection.on('connect', () => {
  console.log('Redis connected');
});

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err);
});
