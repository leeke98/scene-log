import { useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, Theater, Wallet } from "lucide-react";
import PerformanceDetailModal from "./PerformanceDetailModal";
import PerformanceTable from "./PerformanceTable";
import TopPosters from "./TopPosters";
import { useInfinitePerformanceStats, useSummary } from "@/queries/reports/queries";

interface PerformanceMonthlyTabProps {
  searchTerm: string;
  year: string;
  month: string; // "YYYY-MM" 형식
  genre?: "뮤지컬" | "연극";
}

export default function PerformanceMonthlyTab({
  searchTerm,
  year,
  month,
  genre,
}: PerformanceMonthlyTabProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPerformance = searchParams.get("performance");
  const isModalOpen = !!selectedPerformance;
  const limit = 20;

  const monthOnly = month.split("-")[1];

  const { data: summaryData } = useSummary(year, monthOnly, genre);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePerformanceStats({
    search: searchTerm || undefined,
    year,
    month: monthOnly,
    genre,
    limit,
  });

  const allPerformances = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data ?? []);
  }, [data]);

  const sortedPerformances = useMemo(() => {
    return [...allPerformances].sort((a, b) => {
      if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount;
      return (b.avgRating ?? 0) - (a.avgRating ?? 0);
    });
  }, [allPerformances]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    // key 변경 시 자동 리셋
  }, [searchTerm, year, month]);

  const showTop3 = sortedPerformances.length > 0 && !searchTerm.trim();
  const tablePerformances = showTop3
    ? sortedPerformances.slice(3)
    : sortedPerformances;

  const handlePerformanceClick = (performanceName: string) => {
    setSearchParams((prev) => {
      prev.set("performance", performanceName);
      return prev;
    });
  };

  const handleCloseModal = () => {
    setSearchParams((prev) => {
      prev.delete("performance");
      return prev;
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summaryData && !searchTerm.trim() && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Eye className="w-3.5 h-3.5" />
              총 관람
            </div>
            <div className="text-lg sm:text-xl font-bold">
              {summaryData.totalCount}
              <span className="text-xs font-normal text-muted-foreground ml-0.5">
                회
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Theater className="w-3.5 h-3.5" />
              작품 수
            </div>
            <div className="text-lg sm:text-xl font-bold">
              {summaryData.uniquePerformances}
              <span className="text-xs font-normal text-muted-foreground ml-0.5">
                편
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Wallet className="w-3.5 h-3.5" />
              총 금액
            </div>
            <div className="text-sm sm:text-base font-bold">
              {summaryData.totalTicketPrice.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground ml-0.5">
                원
              </span>
            </div>
          </div>
        </div>
      )}

      {showTop3 && (
        <TopPosters
          performances={sortedPerformances.slice(0, 3)}
          onPerformanceClick={handlePerformanceClick}
        />
      )}

      <PerformanceTable
        performances={tablePerformances}
        isLoading={isLoading}
        error={error}
        startRankOffset={showTop3 ? 3 : 0}
        onPerformanceClick={handlePerformanceClick}
      />

      <div ref={sentinelRef} className="h-4" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4 text-sm text-muted-foreground">
          불러오는 중...
        </div>
      )}

      {selectedPerformance && (
        <PerformanceDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          performanceName={selectedPerformance}
        />
      )}
    </div>
  );
}
