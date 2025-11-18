/**
 * Job History entity types
 */

export interface JobHistoryItem {
  id: number;
  jobId: string;
  deprCd: string;
  arvlCd: string;
  targetMonth: string;
  targetDate: string;
  targetTimes: string[];
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  retryCount: number;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/**
 * API Response types
 */
export interface FetchJobHistoryResponse {
  success: boolean;
  jobs: any[];
  count: number;
}
