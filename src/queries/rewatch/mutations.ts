import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { type ApiError } from "@/lib/apiClient";
import { queryKeys } from "@/lib/react-query/queryKeys";
import {
  createRewatchSeason,
  deleteRewatchSeason,
  addRewatchMilestone,
  updateRewatchMilestone,
  deleteRewatchMilestone,
  addRewatchCard,
  deleteRewatchCard,
  addTicketToCard,
  updateCardTicketStamps,
  removeTicketFromCard,
  useVoucher,
  cancelVoucherUsage,
  updateMerchandiseReceipt,
  type RewatchRewardType,
} from "@/services/rewatchApi";

// ─── Seasons ──────────────────────────────────────────────────────────────────

export function useCreateRewatchSeason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRewatchSeason,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.seasons() });
      toast.success("재관람 극이 추가되었습니다.");
    },
    onError: (error: ApiError) => {
      if (error.code === "SEASON_ALREADY_EXISTS") {
        toast.error("이미 등록된 공연 시즌입니다.");
      } else {
        toast.error(error.error || "재관람 극 추가에 실패했습니다.");
      }
    },
  });
}

export function useDeleteRewatchSeason() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (seasonId: string) => deleteRewatchSeason(seasonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.seasons() });
      toast.success("재관람 극이 삭제되었습니다.");
    },
    onError: (error: ApiError) => {
      toast.error(error.error || "재관람 극 삭제에 실패했습니다.");
    },
  });
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export function useAddRewatchMilestone(seasonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      stampCount: number;
      rewardType: RewatchRewardType;
      discountPercent?: number | null;
      voucherQty?: number | null;
      merchandiseDesc?: string | null;
    }) => addRewatchMilestone(seasonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.seasons() });
      toast.success("재관람 혜택이 추가되었습니다.");
    },
    onError: (error: ApiError) => {
      toast.error(error.error || "재관람 혜택 추가에 실패했습니다.");
    },
  });
}

export function useUpdateRewatchMilestone(seasonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      milestoneId,
      data,
    }: {
      milestoneId: string;
      data: {
        stampCount?: number;
        discountPercent?: number | null;
        voucherQty?: number | null;
        merchandiseDesc?: string | null;
      };
    }) => updateRewatchMilestone(milestoneId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.seasons() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.detail(seasonId) });
      toast.success("재관람 혜택이 수정되었습니다.");
    },
    onError: (error: ApiError) => {
      toast.error(error.error || "재관람 혜택 수정에 실패했습니다.");
    },
  });
}

export function useDeleteRewatchMilestone(seasonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (milestoneId: string) => deleteRewatchMilestone(milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.seasons() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.detail(seasonId) });
      toast.success("재관람 혜택이 삭제되었습니다.");
    },
    onError: (error: ApiError) => {
      toast.error(error.error || "재관람 혜택 삭제에 실패했습니다.");
    },
  });
}

// ─── Cards ────────────────────────────────────────────────────────────────────

export function useAddRewatchCard(seasonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { label?: string | null }) => addRewatchCard(seasonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.seasons() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.detail(seasonId) });
      toast.success("카드가 추가되었습니다.");
    },
    onError: (error: ApiError) => {
      toast.error(error.error || "카드 추가에 실패했습니다.");
    },
  });
}

export function useDeleteRewatchCard(seasonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => deleteRewatchCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.seasons() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.detail(seasonId) });
      toast.success("카드가 삭제되었습니다.");
    },
    onError: (error: ApiError) => {
      toast.error(error.error || "카드 삭제에 실패했습니다.");
    },
  });
}

// ─── Card Tickets ─────────────────────────────────────────────────────────────

export function useAddTicketToCard(seasonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, ticketId, stampCount }: { cardId: string; ticketId: string; stampCount?: number }) =>
      addTicketToCard(cardId, { ticketId, stampCount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.detail(seasonId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.seasons() });
      toast.success("티켓이 추가되었습니다.");
    },
    onError: (error: ApiError) => {
      if (error.code === "TICKET_ALREADY_ADDED") {
        toast.error("이미 이 카드에 추가된 티켓입니다.");
      } else {
        toast.error(error.error || "티켓 추가에 실패했습니다.");
      }
    },
  });
}

export function useUpdateCardTicketStamps(seasonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      ticketId,
      stampCount,
    }: {
      cardId: string;
      ticketId: string;
      stampCount: number;
    }) => updateCardTicketStamps(cardId, ticketId, stampCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.detail(seasonId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.seasons() });
    },
    onError: (error: ApiError) => {
      toast.error(error.error || "도장 수 수정에 실패했습니다.");
    },
  });
}

export function useRemoveTicketFromCard(seasonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, ticketId }: { cardId: string; ticketId: string }) =>
      removeTicketFromCard(cardId, ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.detail(seasonId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.seasons() });
      toast.success("티켓이 제거되었습니다.");
    },
    onError: (error: ApiError) => {
      toast.error(error.error || "티켓 제거에 실패했습니다.");
    },
  });
}

// ─── Voucher Usages ───────────────────────────────────────────────────────────

export function useUseVoucher(seasonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      milestoneId,
      ticketId,
    }: {
      cardId: string;
      milestoneId: string;
      ticketId: string;
    }) => useVoucher(cardId, { milestoneId, ticketId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.detail(seasonId) });
      toast.success("할인권 사용이 처리되었습니다.");
    },
    onError: (error: ApiError) => {
      if (error.code === "VOUCHER_EXHAUSTED") {
        toast.error("할인권 잔여 수량이 없습니다.");
      } else {
        toast.error(error.error || "할인권 사용 처리에 실패했습니다.");
      }
    },
  });
}

export function useCancelVoucherUsage(seasonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (usageId: string) => cancelVoucherUsage(usageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.detail(seasonId) });
      toast.success("할인권 사용이 취소되었습니다.");
    },
    onError: (error: ApiError) => {
      toast.error(error.error || "할인권 사용 취소에 실패했습니다.");
    },
  });
}

// ─── Merchandise ──────────────────────────────────────────────────────────────

export function useUpdateMerchandise(seasonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      milestoneId,
      received,
    }: {
      cardId: string;
      milestoneId: string;
      received: boolean;
    }) => updateMerchandiseReceipt(cardId, milestoneId, received),
    onSuccess: (_data, { received }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewatch.detail(seasonId) });
      toast.success(received ? "굿즈 수령이 완료되었습니다." : "굿즈 수령이 취소되었습니다.");
    },
    onError: (error: ApiError) => {
      toast.error(error.error || "굿즈 수령 처리에 실패했습니다.");
    },
  });
}
