import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import {
  getWeeklyBoxOffice,
  getPerformanceDetail,
  type KopisPerformance,
  type KopisPerformanceDetail,
} from "@/services/kopisApi";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// 포스터 컴포넌트
function PerformancePoster({
  performance,
  rank,
  onClick,
}: {
  performance: KopisPerformance;
  rank: number;
  onClick: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="w-48 h-64 bg-gray-200 rounded overflow-hidden relative group cursor-pointer flex-shrink-0"
      onClick={onClick}
    >
      {/* 순위 배지 */}
      <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center">
        {rank}
      </div>
      {performance.poster && !imageError ? (
        <img
          src={performance.poster}
          alt={performance.prfnm}
          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 text-center px-2">
          {performance.prfnm}
        </div>
      )}
    </div>
  );
}

// 공연 상세 정보 모달 컴포넌트
function PerformanceDetailModal({
  isOpen,
  onClose,
  mt20id,
}: {
  isOpen: boolean;
  onClose: () => void;
  mt20id: string | null;
}) {
  const [detail, setDetail] = useState<KopisPerformanceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && mt20id) {
      const fetchDetail = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const result = await getPerformanceDetail(mt20id);
          setDetail(result);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "상세 정보를 불러오는데 실패했습니다."
          );
          console.error("공연 상세 정보 조회 오류:", err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetail();
    } else {
      setDetail(null);
      setError(null);
    }
  }, [isOpen, mt20id]);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    // YYYYMMDD 형식을 YYYY.MM.DD로 변환
    if (dateStr.length === 8) {
      return `${dateStr.substring(0, 4)}.${dateStr.substring(
        4,
        6
      )}.${dateStr.substring(6, 8)}`;
    }
    return dateStr;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-6">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-500">정보를 불러오는 중...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500">{error}</div>
          )}

          {detail && !isLoading && (
            <div className="space-y-6">
              {/* 제목과 닫기 버튼 */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{detail.prfnm}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* 포스터와 모든 정보 */}
              <div className="flex gap-6 mb-6">
                {detail.poster && (
                  <img
                    src={detail.poster}
                    alt={detail.prfnm}
                    className="w-64 h-80 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-gray-600">
                        공연 기간:
                      </span>{" "}
                      {formatDate(detail.prfpdfrom)} ~{" "}
                      {formatDate(detail.prfpdto)}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">
                        공연장:
                      </span>{" "}
                      {detail.fcltynm || "-"}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">
                        공연 상태:
                      </span>{" "}
                      {detail.prfstate || "-"}
                    </div>
                    {detail.prfcast && (
                      <div>
                        <span className="font-semibold text-gray-600">
                          출연진:
                        </span>{" "}
                        {detail.prfcast}
                      </div>
                    )}
                    {detail.prfruntime && (
                      <div>
                        <span className="font-semibold text-gray-600">
                          런타임:
                        </span>{" "}
                        {detail.prfruntime}
                      </div>
                    )}
                    {detail.prfage && (
                      <div>
                        <span className="font-semibold text-gray-600">
                          관람 연령:
                        </span>{" "}
                        {detail.prfage}
                      </div>
                    )}
                    {detail.pcseguidance && (
                      <div>
                        <span className="font-semibold text-gray-600">
                          티켓 가격:
                        </span>{" "}
                        {detail.pcseguidance}
                      </div>
                    )}
                    {detail.dtguidance && (
                      <div>
                        <span className="font-semibold text-gray-600">
                          공연 시간:
                        </span>{" "}
                        <p className="text-sm whitespace-pre-line inline">
                          {detail.dtguidance}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 스크롤 가능한 포스터 목록 컴포넌트
function ScrollablePosters({
  performances,
  isLoading,
  error,
  onPosterClick,
}: {
  performances: KopisPerformance[];
  isLoading: boolean;
  error: string | null;
  onPosterClick: (mt20id: string) => void;
}) {
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
          <div
            key={index}
            className="w-48 h-64 bg-gray-200 rounded animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-gray-500 py-8">{error}</div>;
  }

  if (performances.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
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
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md"
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
          <PerformancePoster
            key={performance.mt20id || index}
            performance={performance}
            rank={index + 1}
            onClick={() => onPosterClick(performance.mt20id)}
          />
        ))}
      </div>

      {/* 오른쪽 화살표 */}
      {showRightArrow && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md"
          onClick={scrollRight}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

export default function ExplorePage() {
  const [musicalRankings, setMusicalRankings] = useState<KopisPerformance[]>(
    []
  );
  const [playRankings, setPlayRankings] = useState<KopisPerformance[]>([]);
  const [isLoadingMusical, setIsLoadingMusical] = useState(true);
  const [isLoadingPlay, setIsLoadingPlay] = useState(true);
  const [errorMusical, setErrorMusical] = useState<string | null>(null);
  const [errorPlay, setErrorPlay] = useState<string | null>(null);
  const [selectedMt20id, setSelectedMt20id] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // 뮤지컬 주간 예매 순위 조회
    const fetchMusicalRankings = async () => {
      try {
        setIsLoadingMusical(true);
        setErrorMusical(null);
        const results = await getWeeklyBoxOffice("GGGA");
        setMusicalRankings(results); // 전체 데이터 표시
      } catch (err) {
        setErrorMusical(
          err instanceof Error
            ? err.message
            : "예매 순위를 불러오는데 실패했습니다."
        );
        console.error("뮤지컬 예매 순위 조회 오류:", err);
      } finally {
        setIsLoadingMusical(false);
      }
    };

    // 연극 주간 예매 순위 조회
    const fetchPlayRankings = async () => {
      try {
        setIsLoadingPlay(true);
        setErrorPlay(null);
        const results = await getWeeklyBoxOffice("AAAA");
        setPlayRankings(results); // 전체 데이터 표시
      } catch (err) {
        setErrorPlay(
          err instanceof Error
            ? err.message
            : "예매 순위를 불러오는데 실패했습니다."
        );
        console.error("연극 예매 순위 조회 오류:", err);
      } finally {
        setIsLoadingPlay(false);
      }
    };

    fetchMusicalRankings();
    fetchPlayRankings();
  }, []);

  const handlePosterClick = (mt20id: string) => {
    setSelectedMt20id(mt20id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMt20id(null);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">탐색</h1>
        <div className="space-y-12">
          {/* 주간 뮤지컬 예매 순위 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              주간 뮤지컬 예매 순위
            </h2>
            <ScrollablePosters
              performances={musicalRankings}
              isLoading={isLoadingMusical}
              error={errorMusical}
              onPosterClick={handlePosterClick}
            />
          </div>

          {/* 주간 연극 예매 순위 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">주간 연극 예매 순위</h2>
            <ScrollablePosters
              performances={playRankings}
              isLoading={isLoadingPlay}
              error={errorPlay}
              onPosterClick={handlePosterClick}
            />
          </div>
        </div>
      </div>

      {/* 공연 상세 정보 모달 */}
      <PerformanceDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mt20id={selectedMt20id}
      />
    </Layout>
  );
}
