import axios from "axios";
import type { RouteQuery } from "@/entities/bus-route";
import { CheckResult } from "@/entities/check-result";

/**
 * API를 통해 좌석 체크를 요청합니다.
 */
export async function checkSeatsAPI(
  config: RouteQuery
): Promise<CheckResult> {
  const { data } = await axios.post<CheckResult>("/api/check", config);
  return data;
}
