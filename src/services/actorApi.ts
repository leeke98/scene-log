/**
 * 배우 관련 API
 */
import { apiGet, apiPost, apiPut } from "@/lib/apiClient";
import type { Actor, ActorSearchResult, CreateActorRequest } from "@/types/actor";

export async function searchActors(q: string): Promise<ActorSearchResult[]> {
  const result = await apiGet<ActorSearchResult[] | { data: ActorSearchResult[] }>(
    `/actors/search?q=${encodeURIComponent(q)}`
  );
  return Array.isArray(result) ? result : result.data;
}

export async function createActor(
  data: CreateActorRequest
): Promise<Actor> {
  return apiPost<Actor>("/actors", data);
}

export async function updateActor(
  id: string,
  data: Partial<CreateActorRequest>
): Promise<Actor> {
  return apiPut<Actor>(`/actors/${id}`, data);
}

export async function reportActor(
  id: string,
  reason: string
): Promise<{ message: string }> {
  return apiPost<{ message: string }>(`/actors/${id}/report`, { reason });
}
