/**
 * 리포트 관련 Queries
 */
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import * as reportApi from "@/services/reportApi";

type Genre = "뮤지컬" | "연극";

export function useSummary(year?: string, month?: string, genre?: Genre, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: queryKeys.reports.summary(year, month, genre, startDate, endDate),
    queryFn: () => reportApi.getSummary(year, month, genre, startDate, endDate),
  });
}

export function useMonthlyStats(year?: string, genre?: Genre, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: queryKeys.reports.monthly(year, genre, startDate, endDate),
    queryFn: () => reportApi.getMonthlyStats(year, genre, startDate, endDate),
  });
}

export function useWeeklyStats(yearMonth?: string, genre?: Genre, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: queryKeys.reports.weekly(yearMonth, genre, startDate, endDate),
    queryFn: () => reportApi.getWeeklyStats(yearMonth, genre, startDate, endDate),
  });
}

export function useDayOfWeekStats(year?: string, month?: string, genre?: Genre, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: queryKeys.reports.dayOfWeek(year, month, genre, startDate, endDate),
    queryFn: () => reportApi.getDayOfWeekStats(year, month, genre, startDate, endDate),
  });
}

export function useActorStats(params?: {
  search?: string;
  year?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  genre?: Genre;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.reports.actors(params),
    queryFn: () => reportApi.getActorStats(params),
  });
}

export function useInfiniteActorStats(params?: {
  search?: string;
  year?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  genre?: Genre;
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
      params?.startDate,
      params?.endDate,
      params?.genre,
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

export function useActorDetail(params: {
  actorName: string;
  year?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  genre?: Genre;
}) {
  return useQuery({
    queryKey: queryKeys.reports.actorDetail(params),
    queryFn: () => reportApi.getActorDetail(params),
    enabled: !!params.actorName,
  });
}

export function usePerformanceStats(params?: {
  search?: string;
  year?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  genre?: Genre;
  limit?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: queryKeys.reports.performances(params),
    queryFn: () => reportApi.getPerformanceStats(params),
  });
}

export function useInfinitePerformanceStats(params?: {
  search?: string;
  year?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  genre?: Genre;
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
      params?.startDate,
      params?.endDate,
      params?.genre,
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

export function useMostViewedPerformance(year?: string, month?: string, genre?: Genre, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [
      ...queryKeys.reports.all,
      "mostViewedPerformance",
      year,
      month,
      genre,
      startDate,
      endDate,
    ] as const,
    queryFn: () => reportApi.getMostViewedPerformance(year, month, genre, startDate, endDate),
  });
}

export function usePerformanceDetail(params: {
  performanceName: string;
  year?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  genre?: Genre;
}) {
  return useQuery({
    queryKey: queryKeys.reports.performanceDetail(params),
    queryFn: () => reportApi.getPerformanceDetail(params),
    enabled: !!params.performanceName,
  });
}

export function useGrassData() {
  return useQuery({
    queryKey: queryKeys.reports.grass(),
    queryFn: () => reportApi.getGrassData(),
  });
}
