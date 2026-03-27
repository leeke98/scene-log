import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type KopisPerformance } from "@/services/kopisApi";
import PerformancePoster from "./PerformancePoster";

interface ScrollablePostersProps {
  performances: KopisPerformance[];
  isLoading: boolean;
  error: string | null;
  onPosterClick: (mt20id: string) => void;
}

export default function ScrollablePosters({
  performances,
  isLoading,
  error,
  onPosterClick,
}: ScrollablePostersProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px 여유
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener("scroll", checkScrollPosition);
      // 윈도우 리사이즈 시에도 체크
      window.addEventListener("resize", checkScrollPosition);
      return () => {
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [performances]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -600,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 600,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-hidden">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="w-36 sm:w-40 md:w-48 flex-shrink-0">
            <div className="w-full aspect-[3/4] bg-muted rounded-lg animate-pulse" />
            <div className="mt-2 space-y-1.5">
              <div className="h-3 bg-muted rounded animate-pulse w-full" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-muted-foreground py-8">{error}</div>;
  }

  if (performances.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        예매 순위 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 왼쪽 화살표 */}
      {showLeftArrow && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background shadow-md"
          onClick={scrollLeft}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}

      {/* 포스터 목록 */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingLeft: showLeftArrow ? "3rem" : "0",
          paddingRight: showRightArrow ? "3rem" : "0",
        }}
      >
        {performances.map((performance, index) => (
          <div key={performance.mt20id || index} className="w-36 sm:w-40 md:w-48 flex-shrink-0">
            <PerformancePoster
              performance={performance}
              rank={index + 1}
              onClick={() => onPosterClick(performance.mt20id)}
            />
          </div>
        ))}
      </div>

      {/* 오른쪽 화살표 */}
      {showRightArrow && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background shadow-md"
          onClick={scrollRight}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

