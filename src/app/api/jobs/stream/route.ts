import { NextRequest } from 'next/server';
import { jobEvents } from '@/shared/lib/job-events';

/**
 * GET /api/jobs/stream
 * Server-Sent Events (SSE) 엔드포인트
 * 잡 상태 변경 시 실시간으로 클라이언트에게 전달
 */
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  // SSE용 ReadableStream 생성
  const stream = new ReadableStream({
    start(controller) {
      // 연결 유지를 위한 heartbeat (30초마다)
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 30000);

      // 잡 업데이트 이벤트 리스너
      const jobUpdateListener = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      jobEvents.on('job-update', jobUpdateListener);

      // 클라이언트 연결 종료 시 정리
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        jobEvents.off('job-update', jobUpdateListener);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
