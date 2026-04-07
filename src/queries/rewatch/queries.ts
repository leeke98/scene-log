import { useQuery } from "@tanstack/react-query";
import { getRewatchSeasons, getRewatchSeasonDetail } from "@/services/rewatchApi";
import { queryKeys } from "@/lib/react-query/queryKeys";

export function useRewatchSeasons() {
  return useQuery({
    queryKey: queryKeys.rewatch.seasons(),
    queryFn: getRewatchSeasons,
    select: (res) => res.data,
  });
}

export function useRewatchSeasonDetail(seasonId: string | null) {
  return useQuery({
    queryKey: queryKeys.rewatch.detail(seasonId ?? ""),
    queryFn: () => getRewatchSeasonDetail(seasonId!),
    enabled: !!seasonId,
    select: (res) => res.data,
  });
}
