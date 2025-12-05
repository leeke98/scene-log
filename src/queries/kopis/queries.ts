/**
 * KOPIS API 관련 Queries
 */
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  searchPerformances,
  getPerformanceDetail,
  getWeeklyBoxOffice,
} from "@/services/kopisApi";
import { queryKeys } from "@/lib/react-query/queryKeys";

interface SearchPerformancesParams {
  searchTerm: string;
  startDate?: string;
  endDate?: string;
  genre?: "AAAA" | "GGGA";
  rows?: number;
  enabled?: boolean; // 쿼리 실행 여부 제어
}

/**
 * 공연 목록 검색 (무한 스크롤)
 */
export function useSearchPerformances(params: SearchPerformancesParams) {
  const { searchTerm, startDate, endDate, genre, rows = 20, enabled } = params;

  return useInfiniteQuery({
    queryKey: queryKeys.kopis.performances({
      searchTerm,
      startDate,
      endDate,
      genre,
      rows,
    }),
    queryFn: ({ pageParam = 1 }) =>
      searchPerformances(
        searchTerm,
        startDate,
        endDate,
        genre,
        pageParam,
        rows
      ),
    getNextPageParam: (lastPage, allPages) => {
      // 마지막 페이지의 결과가 rows보다 적으면 더 이상 데이터가 없음
      if (lastPage.length < rows) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
    enabled: enabled !== undefined ? enabled : !!searchTerm && !!startDate,
  });
}

/**
 * 공연 상세 정보 조회
 */
export function usePerformanceDetail(mt20id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.kopis.performanceDetail(mt20id || ""),
    queryFn: () => getPerformanceDetail(mt20id!),
    enabled: !!mt20id,
  });
}

/**
 * 주간 예매 순위 조회
 */
export function useWeeklyBoxOffice(
  genre: "연극" | "뮤지컬",
  stdate: string,
  eddate: string
) {
  return useQuery({
    queryKey: queryKeys.kopis.boxOffice({ genre, stdate, eddate }),
    queryFn: () => getWeeklyBoxOffice(genre, stdate, eddate),
  });
}
