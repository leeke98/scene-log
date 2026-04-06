import { useQuery } from "@tanstack/react-query";
import { getMarks } from "@/services/markApi";
import { queryKeys } from "@/lib/react-query/queryKeys";

export function useMarks() {
  return useQuery({
    queryKey: queryKeys.marks.list(),
    queryFn: getMarks,
    select: (res) => res.data,
  });
}
