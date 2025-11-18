export interface JobHistoryItem {
  id: number;
  jobId: string;
  departure: string;  // 출발 터미널 이름
  arrival: string;    // 도착 터미널 이름
  targetMonth: string;
  targetDate: string;
  targetTimes: string[];
  status: "waiting" | "active" | "completed" | "failed" | "delayed";
  retryCount: number;
  result: any | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface FetchJobHistoryResponse {
  success: boolean;
  jobs: JobHistoryItem[];
  count: number;
}
