import { JobHistoryList } from "@/entities/job-history";

interface HistoryFeedProps {
  limit?: number;
}

export function HistoryFeed({ limit = 20 }: HistoryFeedProps) {
  return <JobHistoryList limit={limit} />;
}
