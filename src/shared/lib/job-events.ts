import { EventEmitter } from 'events';

/**
 * Job 상태 변경 이벤트 에미터
 * Worker에서 잡 상태가 변경될 때 이벤트를 발행하고
 * SSE API에서 클라이언트에게 전달
 */
class JobEventEmitter extends EventEmitter {
  emitJobUpdate(jobId: string, data: any) {
    this.emit('job-update', { jobId, ...data });
  }
}

export const jobEvents = new JobEventEmitter();

// 최대 리스너 수 증가 (많은 클라이언트 연결 대응)
jobEvents.setMaxListeners(100);
