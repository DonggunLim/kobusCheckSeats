import axios from "axios";
import type { CheckResult } from "../model/types";

export async function getHistoryAPI(limit: number = 10): Promise<CheckResult[]> {
  const { data } = await axios.get<CheckResult[]>("/api/history", {
    params: { limit },
  });
  return data;
}
