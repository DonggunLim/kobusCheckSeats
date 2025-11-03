import { CheckResultHistoryList } from "@/entities/check-result";

interface HistoryFeedProps {
  limit?: number;
}

export function HistoryFeed({ limit = 10 }: HistoryFeedProps) {
  return <CheckResultHistoryList limit={limit} />;
}
