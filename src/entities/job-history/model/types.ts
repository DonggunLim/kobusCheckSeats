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

export interface JobHistoryStats {
  total: number;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}
