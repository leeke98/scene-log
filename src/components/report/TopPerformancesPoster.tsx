import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Top10Performance } from "@/types/report";

interface TopPerformancesPosterProps {
  performances: Top10Performance[];
  height?: number | null;
}

export default function TopPerformancesPoster({
  performances,
  height,
}: TopPerformancesPosterProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

    // 초기 체크 (약간의 지연을 두어 레이아웃이 완료된 후 체크)
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
  }, [performances, height, checkScrollability]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (performances.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center"
        style={{
          height: height ? `${height}px` : "auto",
        }}
      >
        <span className="text-gray-400 text-sm">데이터가 없습니다</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 relative"
      style={{ height: height ? `${height}px` : "auto" }}
    >
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 z-10 bg-white shadow-md"
          aria-label="이전 작품 보기"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      )}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto items-center h-full flex-1 [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {performances.map((performance, index) => {
          const hasError = imageErrors.has(performance.performanceName);
          const showImage = performance.posterUrl && !hasError;

          return (
            <div
              key={`${performance.performanceName}-${index}`}
              className="bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden relative group"
              style={{
                height: "100%",
                width: "auto",
                aspectRatio: "3/4",
              }}
            >
              {showImage ? (
                <img
                  src={performance.posterUrl}
                  alt={performance.performanceName}
                  className="w-full h-full object-cover"
                  onError={() => {
                    setImageErrors((prev) =>
                      new Set(prev).add(performance.performanceName)
                    );
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-500 text-xs text-center px-2">
                    {performance.performanceName}
                  </span>
                </div>
              )}
              {/* 호버 시 작품명과 관람수 표시 */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                <p className="text-white text-sm font-semibold text-center px-2 mb-1">
                  {performance.performanceName}
                </p>
                <p className="text-white text-xs text-center">
                  {performance.count}회 관람
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 z-10 bg-white shadow-md"
          aria-label="다음 작품 보기"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </div>
  );
}
