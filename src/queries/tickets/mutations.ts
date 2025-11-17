/**
 * 티켓 관련 Mutations
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTicket,
  updateTicket,
  deleteTicket,
  type CreateTicketRequest,
  type UpdateTicketRequest,
  type Ticket,
} from "@/services/ticketApi";
import { toast } from "react-toastify";
import { queryKeys } from "@/lib/react-query/queryKeys";

/**
 * 티켓 생성 Mutation
 */
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketRequest) => createTicket(data),
    onSuccess: (_, variables) => {
      // 생성된 티켓의 날짜에서 yearMonth 추출 (YYYY-MM-DD -> YYYY-MM)
      if (variables.date) {
        const yearMonth = variables.date.substring(0, 7); // YYYY-MM
        // 해당 월의 티켓 목록 무효화
        queryClient.invalidateQueries({
          queryKey: queryKeys.tickets.month(yearMonth),
        });
      }
      // 모든 티켓 목록 쿼리도 무효화 (안전장치)
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.lists(),
      });
      toast.success("티켓이 생성되었습니다.");
    },
    onError: (error: any) => {
      toast.error(error?.error || "티켓 생성에 실패했습니다.");
    },
  });
}

/**
 * 티켓 수정 Mutation
 */
export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketRequest }) =>
      updateTicket(id, data),
    onSuccess: async (_, variables) => {
      // 해당 티켓 상세 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(variables.id),
      });

      // 날짜가 변경된 경우, 변경 전후 월 모두 무효화
      // 기존 티켓 정보를 가져와서 날짜 비교
      const existingTicket = queryClient.getQueryData<Ticket>(
        queryKeys.tickets.detail(variables.id)
      );

      if (existingTicket?.date) {
        const oldYearMonth = existingTicket.date.substring(0, 7);
        queryClient.invalidateQueries({
          queryKey: queryKeys.tickets.month(oldYearMonth),
        });
      }

      if (variables.data.date) {
        const newYearMonth = variables.data.date.substring(0, 7);
        queryClient.invalidateQueries({
          queryKey: queryKeys.tickets.month(newYearMonth),
        });
      }

      // 모든 티켓 목록 쿼리도 무효화 (안전장치)
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.lists(),
      });
      toast.success("티켓이 수정되었습니다.");
    },
    onError: (error: any) => {
      toast.error(error?.error || "티켓 수정에 실패했습니다.");
    },
  });
}

/**
 * 티켓 삭제 Mutation
 */
export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTicket(id),
    onSuccess: (_, id) => {
      // 삭제 전 티켓 정보를 가져와서 해당 월의 쿼리 무효화
      const deletedTicket = queryClient.getQueryData<Ticket>(
        queryKeys.tickets.detail(id)
      );

      if (deletedTicket?.date) {
        const yearMonth = deletedTicket.date.substring(0, 7);
        queryClient.invalidateQueries({
          queryKey: queryKeys.tickets.month(yearMonth),
        });
      }

      // 해당 티켓 상세 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(id),
      });
      // 모든 티켓 목록 쿼리도 무효화 (안전장치)
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.lists(),
      });
      toast.success("티켓이 삭제되었습니다.");
    },
    onError: (error: any) => {
      toast.error(error?.error || "티켓 삭제에 실패했습니다.");
    },
  });
}
