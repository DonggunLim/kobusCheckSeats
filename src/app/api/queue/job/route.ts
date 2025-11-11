import { NextRequest, NextResponse } from 'next/server';
import { checkSeatsQueue, type CheckSeatsJobData } from '@/shared/lib/queue';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 요청 데이터 검증
    const { departure, arrival, targetMonth, targetDate, targetTimes, userId, scheduleId } = body;

    if (!departure || !arrival || !targetMonth || !targetDate || !targetTimes) {
      return NextResponse.json(
        { error: 'Missing required fields: departure, arrival, targetMonth, targetDate, targetTimes' },
        { status: 400 }
      );
    }

    // targetTimes가 배열인지 확인
    if (!Array.isArray(targetTimes) || targetTimes.length === 0) {
      return NextResponse.json(
        { error: 'targetTimes must be a non-empty array' },
        { status: 400 }
      );
    }

    // 큐에 Job 추가
    const jobData: CheckSeatsJobData = {
      departure,
      arrival,
      targetMonth,
      targetDate,
      targetTimes,
      userId,
      scheduleId,
    };

    const job = await checkSeatsQueue.add('check-seats-job', jobData, {
      // Job별 옵션 (선택사항)
      priority: body.priority || 1, // 숫자가 낮을수록 우선순위 높음
      delay: body.delay || 0, // 지연 시간 (ms)
      removeOnComplete: true,
      removeOnFail: false,
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Job added to queue successfully',
    });
  } catch (error) {
    console.error('Error adding job to queue:', error);
    return NextResponse.json(
      { error: 'Failed to add job to queue' },
      { status: 500 }
    );
  }
}

// Job 상태 확인 API
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing jobId parameter' },
        { status: 400 }
      );
    }

    const job = await checkSeatsQueue.getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const state = await job.getState();
    const progress = job.progress;

    return NextResponse.json({
      jobId: job.id,
      state,
      progress,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    });
  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}
