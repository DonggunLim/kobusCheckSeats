import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../shared/lib/redis';
import { getCheckSeatsQueue, type CheckSeatsJobData } from '../shared/lib/queue';
import { checkBusSeats } from './lib/check-bus-seats';
import prisma from '../shared/lib/prisma';
import { jobEvents } from '../shared/lib/job-events';
import type { Prisma } from '@prisma/client';

// 워커 생성
const worker = new Worker<CheckSeatsJobData>(
  'check-seats',
  async (job: Job<CheckSeatsJobData>) => {
    console.log(`[Worker] Processing job ${job.id}`, job.data);

    const { departure, arrival, targetMonth, targetDate, targetTimes } = job.data;

    try {
      // DB 상태 업데이트: active
      await updateJobStatus(job.id as string, 'active');

      // 실제 좌석 확인 로직 실행
      const result = await checkBusSeats({
        departure,
        arrival,
        targetMonth,
        targetDate,
        targetTimes,
      });

      console.log(`[Worker] Job ${job.id} completed successfully`);
      console.log(`[Worker] Found seats: ${result.foundSeats}`);

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

// 목표 날짜/시간이 지났는지 확인 (KST 기준)
function checkShouldContinue(
  targetMonth: string,
  targetDate: string,
  targetTimes: string[]
): boolean {
  // 현재 KST 시간
  const nowKST = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' })
  );

  // 목표 날짜 파싱 (예: "11월" -> 11, "18" -> 18)
  const year = nowKST.getFullYear();
  const month = parseInt(targetMonth.replace('월', ''));
  const day = parseInt(targetDate);

  // 마지막 조회 시간 찾기 (예: ["08:00", "09:30"] -> "09:30")
  const lastTime = targetTimes.sort().reverse()[0]; // 가장 늦은 시간
  const [hour, minute] = lastTime.split(':').map(Number);

  // 목표 날짜+시간 생성
  const targetDateTime = new Date(year, month - 1, day, hour, minute);

  // 현재 시간이 목표 시간보다 이전이면 계속 재시도
  return nowKST < targetDateTime;
}

// DB 상태 업데이트 헬퍼 함수 (Prisma 타입 기반)
async function updateJobStatus(
  jobId: string,
  status: string,
  retryCount?: number,
  result?: any,
  error?: string
) {
  try {
    // Prisma 타입을 활용한 업데이트 데이터 구성
    const updateData: Prisma.JobHistoryUpdateInput = {
      status,
      updatedAt: new Date(),
    };

    if (retryCount !== undefined) {
      updateData.retryCount = retryCount;
    }

    if (result) {
      updateData.result = JSON.stringify(result);
    }

    if (error) {
      updateData.error = error;
    }

    if (status === 'completed' || status === 'failed') {
      updateData.completedAt = new Date();
    }

    const updatedJob = await prisma.jobHistory.update({
      where: { jobId },
      data: updateData,
    });

    // SSE로 실시간 업데이트 전송
    jobEvents.emitJobUpdate(jobId, {
      id: updatedJob.id,
      jobId: updatedJob.jobId,
      status: updatedJob.status,
      retryCount: updatedJob.retryCount,
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

  const result = job.returnvalue;
  const retryCount = (job.data.retryCount || 0) + 1;

  // 좌석을 찾지 못했으면 날짜/시간 체크 후 재시도
  if (result && !result.foundSeats) {
    // 목표 날짜와 마지막 시간을 파싱
    const { targetMonth, targetDate, targetTimes } = job.data;
    const shouldContinue = checkShouldContinue(targetMonth, targetDate, targetTimes);

    if (shouldContinue) {
      const queue = getCheckSeatsQueue();
      await queue.add('check-seats-job', {
        ...job.data,
        retryCount,
      }, {
        delay: 3 * 60 * 1000, // 3분 후 재시도 (180000ms)
      });

      console.log(`[Worker] 좌석 없음 - 3분 후 재시도 예약 (재시도 ${retryCount}회)`);
    } else {
      console.log(`[Worker] 목표 날짜/시간 도달 - 재시도 중지 (총 ${retryCount}회 시도)`);
    }
  } else if (result && result.foundSeats) {
    console.log(`[Worker] ✓ 좌석 발견 - 재시도 중지 (총 ${retryCount}회 시도)`);
  }

  // DB 상태 업데이트: completed, retryCount 기록
  await updateJobStatus(
    job.id as string,
    'completed',
    retryCount,
    job.returnvalue
  );
});

worker.on('failed', async (job: Job | undefined, err: Error) => {
  console.error(`[Worker] ✗ Job ${job?.id} failed:`, err.message);

  // DB 상태 업데이트: failed
  if (job?.id) {
    const retryCount = (job.data?.retryCount || 0) + 1;
    await updateJobStatus(
      job.id as string,
      'failed',
      retryCount,
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
