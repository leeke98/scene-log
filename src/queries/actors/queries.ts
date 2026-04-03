/**
 * 배우 관련 Queries
 */
import { useQuery } from "@tanstack/react-query";
import { searchActors } from "@/services/actorApi";

export function useActorSearch(q: string) {
  return useQuery({
    queryKey: ["actors", "search", q],
    queryFn: () => searchActors(q),
    enabled: q.trim().length > 0,
    staleTime: 1000 * 30, // 30초
  });
}
