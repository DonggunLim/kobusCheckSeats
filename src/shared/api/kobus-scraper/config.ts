import type { RouteQuery } from "@/entities/bus-route";

/**
 * 기본 설정
 */
export const DEFAULT_CONFIG: RouteQuery = {
  departure: "서울경부",
  arrival: "상주",
  targetMonth: "10",
  targetDate: "2",
  targetTimes: ["18:40", "19:40"],
};
