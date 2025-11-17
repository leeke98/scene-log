/**
 * 티켓 관련 Queries
 */
import { useQuery } from "@tanstack/react-query";
import { getTicketsByMonth, getTicketById } from "@/services/ticketApi";
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
