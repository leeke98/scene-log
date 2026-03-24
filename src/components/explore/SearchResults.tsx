import { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useSearchPerformances } from "@/queries/kopis";
import PerformancePoster from "./PerformancePoster";

interface SearchResultsProps {
  searchTerm: string;
  genre?: "AAAA" | "GGGA";
  onPosterClick: (mt20id: string) => void;
}

export default function SearchResults({
  searchTerm,
  genre,
  onPosterClick,
}: SearchResultsProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useSearchPerformances({ searchTerm, genre, rows: 20 });

  const performances = data?.pages.flat() ?? [];

  // 무한 스크롤: 하단 sentinel 감지
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground py-12">
        검색 중 오류가 발생했습니다.
      </div>
    );
  }

  if (performances.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p className="text-base">"{searchTerm}"에 대한 검색 결과가 없습니다.</p>
        <p className="text-sm mt-1">다른 검색어나 장르 필터를 시도해보세요.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        검색 결과 {performances.length}건{hasNextPage ? " (더 있음)" : ""}
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {performances.map((performance, index) => (
          <div key={performance.mt20id || index} className="space-y-1.5">
            <PerformancePoster
              performance={performance}
              onClick={() => onPosterClick(performance.mt20id)}
            />
            <div className="px-0.5">
              <p className="text-xs font-medium leading-tight line-clamp-2">
                {performance.prfnm}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {performance.fcltynm}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div ref={loadMoreRef} className="h-8 mt-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!hasNextPage && performances.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-4">
          모든 결과를 불러왔습니다.
        </p>
      )}
    </div>
  );
}
