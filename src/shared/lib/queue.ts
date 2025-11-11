import { Queue } from 'bullmq';
import { getRedisConnection } from './redis';
import type { RouteQuery } from '../types/bus-check.types';

// Job 데이터 타입 정의 (RouteQuery 확장)
export interface CheckSeatsJobData extends RouteQuery {
  userId?: string;
  scheduleId?: string;
}

let checkSeatsQueue: Queue<CheckSeatsJobData> | null = null;

// 큐를 lazy하게 생성
export function getCheckSeatsQueue(): Queue<CheckSeatsJobData> {
  if (!checkSeatsQueue) {
    checkSeatsQueue = new Queue<CheckSeatsJobData>('check-seats', {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3, // 기본 재시도 횟수
        backoff: {
          type: 'exponential',
          delay: 2000, // 2초부터 시작하여 지수적으로 증가
        },
        removeOnComplete: {
          age: 24 * 3600, // 24시간 후 완료된 작업 제거
          count: 1000, // 최대 1000개의 완료된 작업 보관
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // 7일 후 실패한 작업 제거
        },
      },
    });

    // 큐 이벤트 리스너
    checkSeatsQueue.on('error', (error) => {
      console.error('Queue error:', error);
    });
  }

  return checkSeatsQueue;
}
