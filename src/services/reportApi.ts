/**
 * 리포트 관련 API
 */
import { apiGet } from "@/lib/apiClient";
import type {
  TicketSummary,
  MonthlyStats,
  WeeklyStats,
  DayOfWeekStats,
  ActorStats,
  PerformanceStats,
  GrassData,
  ActorDetail,
  PerformanceDetail,
  Top10Performance,
} from "@/types/report";

/**
 * 전체 통계 요약
 */
export async function getSummary(
  year?: string,
  month?: string
): Promise<TicketSummary> {
  const endpoint =
    year && month
      ? `/reports/summary?year=${year}&month=${month}`
      : year
      ? `/reports/summary?year=${year}`
      : "/reports/summary";
  return apiGet<TicketSummary>(endpoint);
}

/**
 * 월별 통계
 */
export async function getMonthlyStats(year?: string): Promise<MonthlyStats[]> {
  const endpoint = year ? `/reports/monthly?year=${year}` : "/reports/monthly";
  return apiGet<MonthlyStats[]>(endpoint);
}

/**
 * 주별 통계
 */
export async function getWeeklyStats(
  yearMonth?: string
): Promise<WeeklyStats[]> {
  const endpoint = yearMonth
    ? `/reports/weekly?yearMonth=${yearMonth}`
    : "/reports/weekly";
  return apiGet<WeeklyStats[]>(endpoint);
}

/**
 * 요일별 통계
 */
export async function getDayOfWeekStats(
  year?: string,
  month?: string
): Promise<DayOfWeekStats[]> {
  const endpoint =
    year && month
      ? `/reports/day-of-week?year=${year}&month=${month}`
      : year
      ? `/reports/day-of-week?year=${year}`
      : "/reports/day-of-week";
  return apiGet<DayOfWeekStats[]>(endpoint);
}

/**
 * 배우별 통계
 */
export async function getActorStats(params?: {
  search?: string;
  year?: string;
  month?: string;
}): Promise<ActorStats[]> {
  const { search, year, month } = params || {};
  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  if (year) queryParams.append("year", year);
  if (month) queryParams.append("month", month);
  const endpoint = `/reports/actors${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  return apiGet<ActorStats[]>(endpoint);
}

/**
 * 배우 상세 정보
 */
export async function getActorDetail(params?: {
  actorName: string;
  year?: string;
  month?: string;
}): Promise<ActorDetail> {
  const { actorName } = params || {};
  const queryParams = new URLSearchParams();
  if (params?.year) queryParams.append("year", params.year);
  if (params?.month) queryParams.append("month", params.month);
  if (!actorName) throw new Error("actorName is required");
  const endpoint = `/reports/actors/${encodeURIComponent(actorName)}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  return apiGet<ActorDetail>(endpoint);
}

/**
 * 작품별 통계
 */
export async function getPerformanceStats(params?: {
  search?: string;
  year?: string;
  month?: string;
}): Promise<PerformanceStats[]> {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append("search", params.search);
  if (params?.year) queryParams.append("year", params.year);
  if (params?.month) queryParams.append("month", params.month);
  const endpoint = `/reports/performances${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  return apiGet<PerformanceStats[]>(endpoint);
}

/**
 * 가장 많이 본 작품 Top 10
 */
export async function getMostViewedPerformance(
  year?: string,
  month?: string
): Promise<Top10Performance[]> {
  const queryParams = new URLSearchParams();
  if (year) queryParams.append("year", year);
  if (month) queryParams.append("month", month);
  const endpoint = `/reports/performances/top${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  return apiGet<Top10Performance[]>(endpoint);
}

/**
 * 작품 상세 정보
 */
export async function getPerformanceDetail(params?: {
  performanceName: string;
  year?: string;
  month?: string;
}): Promise<PerformanceDetail> {
  const { performanceName } = params || {};
  const queryParams = new URLSearchParams();
  if (params?.year) queryParams.append("year", params.year);
  if (params?.month) queryParams.append("month", params.month);
  if (!performanceName) throw new Error("performanceName is required");
  if (!performanceName) throw new Error("performanceName is required");
  const endpoint = `/reports/performances/${encodeURIComponent(
    performanceName
  )}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  return apiGet<PerformanceDetail>(endpoint);
}

/**
 * 잔디밭 데이터
 */
export async function getGrassData(): Promise<GrassData[]> {
  const endpoint = "/reports/grass";
  return apiGet<GrassData[]>(endpoint);
}
