import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PerformanceStats } from "@/types/report";

interface TopPostersProps {
  performances: PerformanceStats[];
  onPerformanceClick: (performanceName: string) => void;
}

export default function TopPosters({
  performances,
  onPerformanceClick,
}: TopPostersProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const top10 = performances.slice(0, 10);

  // 스크롤 가능 여부 확인
  const checkScrollability = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // 초기 체크
    const initialCheck = () => {
      requestAnimationFrame(() => {
        checkScrollability();
      });
    };

    initialCheck();

    // 스크롤 이벤트 리스너
    container.addEventListener("scroll", checkScrollability);
    window.addEventListener("resize", checkScrollability);

    // ResizeObserver로 컨테이너 크기 변경 감지
    const resizeObserver = new ResizeObserver(() => {
      checkScrollability();
    });

    resizeObserver.observe(container);

    // 이미지 로드 완료 후에도 체크
    const images = container.querySelectorAll("img");
    const imageLoadPromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    });

    Promise.all(imageLoadPromises).then(() => {
      setTimeout(checkScrollability, 100);
    });

    return () => {
      container.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
      resizeObserver.disconnect();
    };
  }, [checkScrollability, top10]);

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

  // 공동 순위 계산 함수
  const calculateRanks = () => {
    if (top10.length === 0) return [];

    const ranks: number[] = [];
    let currentRank = 1;

    for (let i = 0; i < top10.length; i++) {
      if (i === 0) {
        // 첫 번째 항목은 항상 1등
        ranks.push(1);
        currentRank = 1;
      } else if (top10[i].viewCount === top10[i - 1].viewCount) {
        // 이전 항목과 관극 횟수가 같으면 같은 순위
        ranks.push(ranks[i - 1]);
      } else {
        // 이전 항목과 다르면 새로운 순위
        // 이전 그룹의 시작 인덱스 찾기
        let groupStartIndex = i - 1;
        while (
          groupStartIndex > 0 &&
          top10[groupStartIndex].viewCount ===
            top10[groupStartIndex - 1].viewCount
        ) {
          groupStartIndex--;
        }

        // 이전 그룹의 순위와 그룹 크기를 이용해 다음 순위 계산
        const previousGroupRank = ranks[groupStartIndex] ?? 1;
        const groupSize = i - groupStartIndex;
        currentRank = previousGroupRank + groupSize;
        ranks.push(currentRank);
      }
    }

    return ranks;
  };

  const ranks = calculateRanks();

  const getRankBadge = (rank: number) => {
    const badgeClasses = {
      1: "bg-yellow-500",
      2: "bg-gray-400",
      3: "bg-amber-600",
      4: "bg-gray-500",
      5: "bg-gray-600",
      6: "bg-gray-700",
      7: "bg-gray-800",
      8: "bg-gray-900",
      9: "bg-slate-800",
      10: "bg-slate-900",
    };

    const badgeColor =
      badgeClasses[rank as keyof typeof badgeClasses] || "bg-gray-800";

    return (
      <div
        className={`absolute top-2 left-2 z-10 ${badgeColor} text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg`}
      >
        {rank}
      </div>
    );
  };

  return (
    <div className="relative mb-8">
      {/* 왼쪽 스크롤 버튼 */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 bg-white shadow-md"
          aria-label="이전 작품 보기"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* 포스터 목록 */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingLeft: canScrollLeft ? "3rem" : "0",
          paddingRight: canScrollRight ? "3rem" : "0",
        }}
      >
        {top10.map((performance, index) => {
          const rank = ranks[index] ?? index + 1;
          const hasError = imageErrors.has(performance.name);
          const showImage = performance.posterUrl && !hasError;

          return (
            <div
              key={performance.name}
              className="relative group cursor-pointer flex-shrink-0"
              onClick={() => onPerformanceClick(performance.name)}
            >
              {/* 포스터 */}
              <div
                className="bg-gray-200 rounded-lg overflow-hidden shadow-md transition-transform group-hover:scale-105"
                style={{
                  width: "200px",
                  height: "280px",
                }}
              >
                {showImage ? (
                  <img
                    src={performance.posterUrl}
                    alt={performance.name}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setImageErrors((prev) =>
                        new Set(prev).add(performance.name)
                      );
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500 text-sm text-center px-2">
                      {performance.name}
                    </span>
                  </div>
                )}

                {/* 순위 배지 */}
                {getRankBadge(rank)}

                {/* 호버 오버레이 */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                  <p className="text-white text-base font-semibold text-center px-2 mb-2">
                    {performance.name}
                  </p>
                  <p className="text-white text-sm text-center">
                    {performance.viewCount}회 관람
                  </p>
                </div>
              </div>

              {/* 포스터 아래 작품명 */}
              <div className="mt-3 text-left">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                  {performance.viewCount}회 관람
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 오른쪽 스크롤 버튼 */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 bg-white shadow-md"
          aria-label="다음 작품 보기"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </div>
  );
}

