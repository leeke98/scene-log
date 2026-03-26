/**
 * 리포트 관련 Queries
 */
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
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
 * 배우별 통계 무한 스크롤 조회
 */
export function useInfiniteActorStats(params?: {
  search?: string;
  year?: string;
  month?: string;
  limit?: number;
}) {
  const limit = params?.limit ?? 10;
  return useInfiniteQuery({
    queryKey: [
      ...queryKeys.reports.all,
      "actors",
      "infinite",
      params?.search,
      params?.year,
      params?.month,
      limit,
    ] as const,
    queryFn: ({ pageParam = 1 }) =>
      reportApi.getActorStats({ ...params, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
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
  limit?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: queryKeys.reports.performances({
      search: params?.search,
      year: params?.year,
      month: params?.month,
      page: params?.page,
      limit: params?.limit,
    }),
    queryFn: () => reportApi.getPerformanceStats(params),
  });
}
/**
 * 작품별 통계 무한 스크롤 조회
 */
export function useInfinitePerformanceStats(params?: {
  search?: string;
  year?: string;
  month?: string;
  limit?: number;
}) {
  const limit = params?.limit ?? 20;
  return useInfiniteQuery({
    queryKey: [
      ...queryKeys.reports.all,
      "performances",
      "infinite",
      params?.search,
      params?.year,
      params?.month,
      limit,
    ] as const,
    queryFn: ({ pageParam = 1 }) =>
      reportApi.getPerformanceStats({ ...params, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined;
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
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
