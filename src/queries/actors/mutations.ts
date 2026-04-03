/**
 * 배우 관련 Mutations
 */
import { useMutation } from "@tanstack/react-query";
import { createActor, updateActor, reportActor } from "@/services/actorApi";
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
