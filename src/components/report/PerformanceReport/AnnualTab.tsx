import { useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, Theater, Wallet } from "lucide-react";
import PerformanceDetailModal from "./PerformanceDetailModal";
import PerformanceTable from "./PerformanceTable";
import TopPosters from "./TopPosters";
import { useInfinitePerformanceStats } from "@/queries/reports/queries";
import { useSummary } from "@/queries/reports/queries";

interface PerformanceAnnualTabProps {
  searchTerm: string;
  year: string;
  genre?: "뮤지컬" | "연극";
}

export default function PerformanceAnnualTab({
  searchTerm,
  year,
  genre,
}: PerformanceAnnualTabProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPerformance = searchParams.get("performance");
  const isModalOpen = !!selectedPerformance;
  const limit = 20;

  const { data: summaryData } = useSummary(year, undefined, genre);

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
    genre,
    limit,
  });

  // 전체 데이터 플랫하게
  const allPerformances = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data ?? []);
  }, [data]);

  // 정렬
  const sortedPerformances = useMemo(() => {
    return [...allPerformances].sort((a, b) => {
      if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount;
      return (b.avgRating ?? 0) - (a.avgRating ?? 0);
    });
  }, [allPerformances]);

  // 무한 스크롤 감지
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

  // 검색어나 연도 변경 시 스크롤 초기화 (useInfiniteQuery가 자동으로 리셋)
  useEffect(() => {
    // key가 바뀌면 자동 리셋
  }, [searchTerm, year]);

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

      {/* Top 10 포디움 */}
      {showTop3 && (
        <TopPosters
          performances={sortedPerformances.slice(0, 3)}
          onPerformanceClick={handlePerformanceClick}
        />
      )}

      {/* 카드 리스트 */}
      <PerformanceTable
        performances={tablePerformances}
        isLoading={isLoading}
        error={error}
        startRankOffset={showTop3 ? 3 : 0}
        onPerformanceClick={handlePerformanceClick}
      />

      {/* 무한 스크롤 센티널 */}
      <div ref={sentinelRef} className="h-4" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4 text-sm text-muted-foreground">
          불러오는 중...
        </div>
      )}

      {/* 상세 모달 (바텀 시트) */}
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
