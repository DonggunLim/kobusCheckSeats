import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../shared/lib/redis';
import type { CheckSeatsJobData } from '../shared/lib/queue';
import { checkBusSeats } from './lib/check-bus-seats';
import prisma from '../shared/lib/prisma';
import { jobEvents } from '../shared/lib/job-events';

// 워커 생성
const worker = new Worker<CheckSeatsJobData>(
  'check-seats',
  async (job: Job<CheckSeatsJobData>) => {
    console.log(`[Worker] Processing job ${job.id}`, job.data);

    const { departure, arrival, targetMonth, targetDate, targetTimes } = job.data;

    try {
      // DB 상태 업데이트: active
      await updateJobStatus(job.id as string, 'active', 10);

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
      await updateJobStatus(job.id as string, 'active', 90);

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

// DB 상태 업데이트 헬퍼 함수
async function updateJobStatus(
  jobId: string,
  status: string,
  progress: number,
  result?: any,
  error?: string
) {
  try {
    const updatedJob = await prisma.jobHistory.update({
      where: { jobId },
      data: {
        status,
        progress,
        ...(result ? { result: JSON.stringify(result) } : {}),
        ...(error ? { error } : {}),
        ...(status === 'completed' || status === 'failed' ? { completedAt: new Date() } : {}),
        updatedAt: new Date(),
      },
    });

    // SSE로 실시간 업데이트 전송
    jobEvents.emitJobUpdate(jobId, {
      id: updatedJob.id,
      jobId: updatedJob.jobId,
      status: updatedJob.status,
      progress: updatedJob.progress,
      deprCd: updatedJob.deprCd,
      arvlCd: updatedJob.arvlCd,
      targetDate: updatedJob.targetDate,
      targetTimes: JSON.parse(updatedJob.targetTimes),
      result: updatedJob.result ? JSON.parse(updatedJob.result) : null,
      error: updatedJob.error,
      createdAt: updatedJob.createdAt,
      updatedAt: updatedJob.updatedAt,
      completedAt: updatedJob.completedAt,
    });
  } catch (err) {
    console.error(`[Worker] Failed to update job ${jobId} status in DB:`, err);
  }
}

// 워커 이벤트 리스너
worker.on('completed', async (job: Job) => {
  console.log(`[Worker] ✓ Job ${job.id} completed`);

  // DB 상태 업데이트: completed
  await updateJobStatus(
    job.id as string,
    'completed',
    100,
    job.returnvalue
  );
});

worker.on('failed', async (job: Job | undefined, err: Error) => {
  console.error(`[Worker] ✗ Job ${job?.id} failed:`, err.message);

  // DB 상태 업데이트: failed
  if (job?.id) {
    await updateJobStatus(
      job.id as string,
      'failed',
      job.progress as number || 0,
      undefined,
      err.message
    );
  }
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
