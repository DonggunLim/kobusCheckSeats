import { JobHistoryList } from "@/entities/job-history";

interface HistoryFeedProps {
  limit?: number;
  autoRefresh?: boolean;
}

export function HistoryFeed({ limit = 20, autoRefresh = true }: HistoryFeedProps) {
  return <JobHistoryList limit={limit} autoRefresh={autoRefresh} />;
}
