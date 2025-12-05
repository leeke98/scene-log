import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { useWeeklyBoxOffice } from "@/queries/kopis";
import {
  PerformanceDetailModal,
  ScrollablePosters,
} from "@/components/explore";

export default function ExplorePage() {
  const [selectedMt20id, setSelectedMt20id] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 날짜 계산: stdate는 오늘로부터 6일 전, eddate는 오늘 (일주일 치)
  const { stdate, eddate } = useMemo(() => {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}${month}${day}`;
    };

    return {
      stdate: formatDate(oneWeekAgo),
      eddate: formatDate(today),
    };
  }, []);

  // 뮤지컬 주간 예매 순위 조회
  const {
    data: musicalRankings = [],
    isLoading: isLoadingMusical,
    error: errorMusical,
  } = useWeeklyBoxOffice("뮤지컬", stdate, eddate);

  // 연극 주간 예매 순위 조회
  const {
    data: playRankings = [],
    isLoading: isLoadingPlay,
    error: errorPlay,
  } = useWeeklyBoxOffice("연극", stdate, eddate);

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
      <div className="container mx-auto px-4">
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
              error={
                errorMusical
                  ? errorMusical instanceof Error
                    ? errorMusical.message
                    : "예매 순위를 불러오는데 실패했습니다."
                  : null
              }
              onPosterClick={handlePosterClick}
            />
          </div>

          {/* 주간 연극 예매 순위 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">주간 연극 예매 순위</h2>
            <ScrollablePosters
              performances={playRankings}
              isLoading={isLoadingPlay}
              error={
                errorPlay
                  ? errorPlay instanceof Error
                    ? errorPlay.message
                    : "예매 순위를 불러오는데 실패했습니다."
                  : null
              }
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
