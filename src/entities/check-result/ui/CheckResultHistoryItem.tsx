import type { CheckResult } from "../model/types";
import { CheckResultCard } from "./CheckResultCard";

interface CheckResultHistoryItemProps {
  history: CheckResult;
}

export function CheckResultHistoryItem({
  history,
}: CheckResultHistoryItemProps) {
  return (
    <div className="hover:bg-gray-50 transition-colors">
      <CheckResultCard result={history} showTimestamp={true} />
    </div>
  );
}
