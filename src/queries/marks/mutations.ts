import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMark, removeMark, type AddMarkRequest } from "@/services/markApi";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { toast } from "react-toastify";
import { type ApiError } from "@/lib/apiClient";

export function useAddMark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddMarkRequest) => addMark(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marks.list() });
      toast.success("위시리스트에 저장되었습니다.");
    },
    onError: (error: ApiError) => {
      toast.error(error.error || "위시리스트 저장에 실패했습니다.");
    },
  });
}

export function useRemoveMark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (kopisId: string) => removeMark(kopisId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marks.list() });
      toast.success("위시리스트에서 제거되었습니다.");
    },
    onError: (error: ApiError) => {
      toast.error(error.error || "위시리스트 제거에 실패했습니다.");
    },
  });
}
