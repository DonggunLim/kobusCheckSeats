import axios from "axios";
import type { Stats } from "../model/types";

export async function getCheckResultStats(): Promise<Stats> {
  const { data } = await axios.get<Stats>("/api/stats");
  return data;
}
