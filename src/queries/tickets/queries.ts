/**
 * 티켓 관련 Queries
 */
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  getTicketsByMonth,
  getTicketById,
  getTicketsList,
} from "@/services/ticketApi";
import { queryKeys } from "@/lib/react-query/queryKeys";

/**
 * 월별 티켓 조회
 */
export function useTicketsByMonth(yearMonth: string) {
  return useQuery({
    queryKey: queryKeys.tickets.month(yearMonth),
    queryFn: () => getTicketsByMonth(yearMonth),
    enabled: !!yearMonth,
  });
}

/**
 * 티켓 상세 조회
 */
export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id!),
    queryFn: () => getTicketById(id!),
    enabled: !!id,
  });
}

/**
 * 티켓 목록 조회 (무한 스크롤)
 */
export function useTicketsList(
  limit: number = 20,
  performanceName?: string,
  genre?: "연극" | "뮤지컬"
) {
  return useInfiniteQuery({
    queryKey: [
      ...queryKeys.tickets.lists(),
      "infinite",
      performanceName,
      genre,
    ],
    queryFn: ({ pageParam = 1 }) =>
      getTicketsList({ page: pageParam, limit, performanceName, genre }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      // 현재 페이지가 마지막 페이지인지 확인
      const totalPages = Math.ceil(pagination.total / pagination.limit);
      if (pagination.page >= totalPages) {
        return undefined;
      }
      return pagination.page + 1;
    },
    initialPageParam: 1,
  });
}
