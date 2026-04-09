/**
 * 배우 관련 Mutations
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createActor, updateActor, reportActor, uploadActorImage, deleteActorImage } from "@/services/actorApi";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { queryKeys } from "@/lib/react-query/queryKeys";
import type { CreateActorRequest } from "@/types/actor";

export function useCreateActor() {
  return useMutation({
    mutationFn: (data: CreateActorRequest) => createActor(data),
  });
}

export function useUpdateActor() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateActorRequest>;
    }) => updateActor(id, data),
  });
}

export function useReportActor() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reportActor(id, reason),
  });
}

export function useUploadActorImage(actorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const imageUrl = await uploadImageToCloudinary(file);
      return uploadActorImage(actorId, imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useDeleteActorImage(actorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteActorImage(actorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}
