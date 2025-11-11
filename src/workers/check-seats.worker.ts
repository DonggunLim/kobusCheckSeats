import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../shared/lib/redis';
import type { CheckSeatsJobData } from '../shared/lib/queue';
import { checkBusSeats } from './lib/check-bus-seats';

// 워커 생성
const worker = new Worker<CheckSeatsJobData>(
  'check-seats',
  async (job: Job<CheckSeatsJobData>) => {
    console.log(`[Worker] Processing job ${job.id}`, job.data);

    const { departure, arrival, targetMonth, targetDate, targetTimes } = job.data;

    try {
      // 진행률 업데이트
      await job.updateProgress(10);

      // 실제 좌석 확인 로직 실행
      const result = await checkBusSeats({
        departure,
        arrival,
        targetMonth,
        targetDate,
        targetTimes,
      });

      // 진행률 업데이트
      await job.updateProgress(90);

      console.log(`[Worker] Job ${job.id} completed successfully`);
      console.log(`[Worker] Found seats: ${result.foundSeats}`);

      await job.updateProgress(100);

      return result;
    } catch (error) {
      console.error(`[Worker] Job ${job.id} failed:`, error);
      throw error; // 에러를 throw하면 BullMQ가 재시도 처리
    }
  },
  {
    connection: getRedisConnection(),
    concurrency: 5, // 동시에 처리할 수 있는 작업 수
    limiter: {
      max: 10, // 최대 10개 작업
      duration: 1000, // 1초당
    },
  }
);

// 워커 이벤트 리스너
worker.on('completed', (job: Job) => {
  console.log(`[Worker] ✓ Job ${job.id} completed`);
});

worker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`[Worker] ✗ Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err: Error) => {
  console.error('[Worker] Worker error:', err);
});

worker.on('ready', () => {
  console.log('[Worker] Worker is ready and waiting for jobs');
});

// 프로세스 종료 시 워커 정리
process.on('SIGTERM', async () => {
  console.log('[Worker] SIGTERM received, closing worker...');
  await worker.close();
  await getRedisConnection().quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Worker] SIGINT received, closing worker...');
  await worker.close();
  await getRedisConnection().quit();
  process.exit(0);
});

console.log('[Worker] Check seats worker started');
