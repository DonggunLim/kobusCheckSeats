import type { FetchJobHistoryResponse } from "../model/types";

/**
 * Fetch job history list
 */
export async function fetchJobHistory(
  limit: number = 20
): Promise<FetchJobHistoryResponse> {
  const response = await fetch(`/api/jobs/history?limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch job history");
  }
  return response.json();
}
