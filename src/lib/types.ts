export interface BusCheckConfig {
  departure: string;
  arrival: string;
  targetMonth: string;
  targetDate: string;
  targetTimes: string[];
}

export interface BusTimeResult {
  time: string;
  remainSeats: string;
  status: string;
  hasSeats: boolean;
}

export interface CheckResult {
  timestamp: string;
  config: BusCheckConfig;
  results: BusTimeResult[];
  foundSeats: boolean;
  success: boolean;
  error?: string;
}

export interface Stats {
  totalChecks: number;
  successfulChecks: number;
  foundSeatsCount: number;
  failedChecks: number;
  successRate: number;
  foundSeatsRate: number;
}
