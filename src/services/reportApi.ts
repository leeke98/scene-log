/**
 * 리포트 관련 API
 */
import { apiGet } from "@/lib/apiClient";
import type {
  TicketSummary,
  MonthlyStats,
  WeeklyStats,
  DayOfWeekStats,
  GrassData,
  ActorDetail,
  PerformanceDetail,
  Top10Performance,
  ActorListStats,
  PerformanceListStats,
} from "@/types/report";

type Genre = "뮤지컬" | "연극";

function buildQuery(params: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") q.append(key, value);
  }
  return q.toString() ? `?${q.toString()}` : "";
}

export async function getSummary(
  year?: string,
  month?: string,
  genre?: Genre,
  startDate?: string,
  endDate?: string
): Promise<TicketSummary> {
  return apiGet<TicketSummary>(`/reports/summary${buildQuery({ year, month, genre, startDate, endDate })}`);
}

export async function getMonthlyStats(
  year?: string,
  genre?: Genre,
  startDate?: string,
  endDate?: string
): Promise<MonthlyStats[]> {
  return apiGet<MonthlyStats[]>(`/reports/monthly${buildQuery({ year, genre, startDate, endDate })}`);
}

export async function getWeeklyStats(
  yearMonth?: string,
  genre?: Genre,
  startDate?: string,
  endDate?: string
): Promise<WeeklyStats[]> {
  return apiGet<WeeklyStats[]>(`/reports/weekly${buildQuery({ yearMonth, genre, startDate, endDate })}`);
}

export async function getDayOfWeekStats(
  year?: string,
  month?: string,
  genre?: Genre,
  startDate?: string,
  endDate?: string
): Promise<DayOfWeekStats[]> {
  return apiGet<DayOfWeekStats[]>(`/reports/day-of-week${buildQuery({ year, month, genre, startDate, endDate })}`);
}

export async function getActorStats(params?: {
  search?: string;
  year?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  genre?: Genre;
  page?: number;
  limit?: number;
}): Promise<ActorListStats> {
  const { search, year, month, startDate, endDate, genre, page, limit } = params || {};
  const q = new URLSearchParams();
  if (search) q.append("search", search);
  if (year) q.append("year", year);
  if (month) q.append("month", month);
  if (startDate) q.append("startDate", startDate);
  if (endDate) q.append("endDate", endDate);
  if (genre) q.append("genre", genre);
  if (page) q.append("page", page.toString());
  if (limit) q.append("limit", limit.toString());
  return apiGet<ActorListStats>(`/reports/actors${q.toString() ? `?${q.toString()}` : ""}`);
}

export async function getActorDetail(params?: {
  actorId: string;
  year?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  genre?: Genre;
}): Promise<ActorDetail> {
  const { actorId, year, month, startDate, endDate, genre } = params || {};
  if (!actorId) throw new Error("actorId is required");
  return apiGet<ActorDetail>(`/reports/actors/${encodeURIComponent(actorId)}${buildQuery({ year, month, startDate, endDate, genre })}`);
}

export async function getPerformanceStats(params?: {
  search?: string;
  year?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  genre?: Genre;
  limit?: number;
  page?: number;
}): Promise<PerformanceListStats> {
  const { search, year, month, startDate, endDate, genre, limit, page } = params || {};
  const q = new URLSearchParams();
  if (search) q.append("search", search);
  if (year) q.append("year", year);
  if (month) q.append("month", month);
  if (startDate) q.append("startDate", startDate);
  if (endDate) q.append("endDate", endDate);
  if (genre) q.append("genre", genre);
  if (limit) q.append("limit", limit.toString());
  if (page) q.append("page", page.toString());
  return apiGet<PerformanceListStats>(`/reports/performances${q.toString() ? `?${q.toString()}` : ""}`);
}

export async function getMostViewedPerformance(
  year?: string,
  month?: string,
  genre?: Genre,
  startDate?: string,
  endDate?: string
): Promise<Top10Performance[]> {
  return apiGet<Top10Performance[]>(`/reports/performances/top${buildQuery({ year, month, genre, startDate, endDate })}`);
}

export async function getPerformanceDetail(params?: {
  performanceName: string;
  year?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  genre?: Genre;
}): Promise<PerformanceDetail> {
  const { performanceName, year, month, startDate, endDate, genre } = params || {};
  if (!performanceName) throw new Error("performanceName is required");
  return apiGet<PerformanceDetail>(`/reports/performances/${encodeURIComponent(performanceName)}${buildQuery({ year, month, startDate, endDate, genre })}`);
}

export async function getGrassData(): Promise<GrassData[]> {
  return apiGet<GrassData[]>("/reports/grass");
}
