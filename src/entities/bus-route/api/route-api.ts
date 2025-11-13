import type { Area, TerminalData } from "../model/types";

/**
 * Fetch all available areas
 */
export async function fetchAreas(): Promise<Area[]> {
  const response = await fetch("/api/areas");
  if (!response.ok) {
    throw new Error("Failed to fetch areas");
  }
  return response.json();
}

/**
 * Fetch terminals for a specific area
 */
export async function fetchTerminals(areaCd: string): Promise<TerminalData[]> {
  const response = await fetch(`/api/terminals?areaCd=${areaCd}`);
  if (!response.ok) {
    throw new Error("Failed to fetch terminals");
  }
  return response.json();
}

/**
 * Fetch destinations reachable from a departure terminal
 */
export async function fetchDestinations(
  deprCd: string
): Promise<TerminalData[]> {
  const response = await fetch(`/api/destinations?deprCd=${deprCd}`);
  if (!response.ok) {
    throw new Error("Failed to fetch destinations");
  }
  return response.json();
}
