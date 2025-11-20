/**
 * 리포트 관련 Queries
 */
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import * as reportApi from "@/services/reportApi";

/**
 * 전체 통계 요약 조회
 */
export function useSummary(year?: string, month?: string) {
  return useQuery({
    queryKey: queryKeys.reports.summary(year, month),
    queryFn: () => reportApi.getSummary(year, month),
  });
}

/**
 * 월별 통계 조회
 */
export function useMonthlyStats(year?: string) {
  return useQuery({
    queryKey: queryKeys.reports.monthly(year),
    queryFn: () => reportApi.getMonthlyStats(year),
  });
}

/**
 * 주별 통계 조회
 */
export function useWeeklyStats(yearMonth?: string) {
  return useQuery({
    queryKey: queryKeys.reports.weekly(yearMonth),
    queryFn: () => reportApi.getWeeklyStats(yearMonth),
  });
}

/**
 * 요일별 통계 조회
 */
export function useDayOfWeekStats(year?: string, month?: string) {
  return useQuery({
    queryKey: queryKeys.reports.dayOfWeek(year, month),
    queryFn: () => reportApi.getDayOfWeekStats(year, month),
  });
}

/**
 * 배우별 통계 조회
 */
export function useActorStats(params?: {
  search?: string;
  year?: string;
  month?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.reports.actors(params),
    queryFn: () => reportApi.getActorStats(params),
  });
}

/**
 * 배우 상세 정보 조회
 */
export function useActorDetail(params: {
  actorName: string;
  year?: string;
  month?: string;
}) {
  return useQuery({
    queryKey: queryKeys.reports.actorDetail(params),
    queryFn: () => reportApi.getActorDetail(params),
    enabled: !!params.actorName, // actorName이 있을 때만 호출
  });
}

/**
 * 작품별 통계 조회
 */
export function usePerformanceStats(params?: {
  search?: string;
  year?: string;
  month?: string;
}) {
  return useQuery({
    queryKey: queryKeys.reports.performances(params),
    queryFn: () => reportApi.getPerformanceStats(params),
  });
}

/**
 * 가장 많이 본 작품 Top 10 조회
 */
export function useMostViewedPerformance(year?: string, month?: string) {
  return useQuery({
    queryKey: [
      ...queryKeys.reports.all,
      "mostViewedPerformance",
      year,
      month,
    ] as const,
    queryFn: () => reportApi.getMostViewedPerformance(year, month),
  });
}

/**
 * 작품 상세 정보 조회
 */
export function usePerformanceDetail(params: {
  performanceName: string;
  year?: string;
  month?: string;
}) {
  return useQuery({
    queryKey: queryKeys.reports.performanceDetail(params),
    queryFn: () => reportApi.getPerformanceDetail(params),
    enabled: !!params.performanceName, // performanceName이 있을 때만 호출
  });
}

/**
 * 잔디밭 데이터 조회
 */
export function useGrassData() {
  return useQuery({
    queryKey: queryKeys.reports.grass(),
    queryFn: () => reportApi.getGrassData(),
  });
}
