import { useState, useMemo, useEffect } from "react";
import ActorDetailModal from "./ActorDetailModal";
import ActorTable from "./ActorTable";
import Pagination from "../Pagination";
import { useActorStats } from "@/queries/reports/queries";

interface ActorMonthlyTabProps {
  searchTerm: string;
  year: string;
  month: string; // "YYYY-MM" 형식
}

export default function ActorMonthlyTab({
  searchTerm,
  year,
  month,
}: ActorMonthlyTabProps) {
  const [selectedActor, setSelectedActor] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // month가 "YYYY-MM" 형식이므로 "MM" 부분만 추출
  const monthOnly = month.split("-")[1];

  // 배우별 통계 데이터 가져오기
  const { data: actorStats } = useActorStats({
    search: searchTerm || undefined,
    year,
    month: monthOnly,
    page: currentPage,
    limit,
  });

  // API 데이터를 컴포넌트에서 사용하는 형식으로 변환
  const actors = useMemo(() => {
    if (!actorStats || !actorStats.data) return [];
    return actorStats.data.map((actor) => ({
      name: actor.actorName,
      totalViewCount: actor.viewCount,
      watchedPerformances: actor.performanceList,
      totalAmount: actor.totalTicketPrice,
    }));
  }, [actorStats]);

  // 정렬: 총 관극 횟수 많은 순 > 관람 금액 많은 순 > 이름 가나다 순
  const filteredAndSortedActors = useMemo(() => {
    return actors.sort((a, b) => {
      // 1순위: 총 관극 횟수
      if (b.totalViewCount !== a.totalViewCount) {
        return b.totalViewCount - a.totalViewCount;
      }
      // 2순위: 관람 금액
      if (b.totalAmount !== a.totalAmount) {
        return b.totalAmount - a.totalAmount;
      }
      // 3순위: 이름 가나다 순
      return a.name.localeCompare(b.name, "ko");
    });
  }, [actors]);

  const handleActorClick = (actorName: string) => {
    setSelectedActor(actorName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActor(null);
  };

  // 검색어, 연도, 월 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, year, month]);

  const pagination = actorStats?.pagination;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* 테이블 */}
      <ActorTable
        actors={filteredAndSortedActors}
        onActorClick={handleActorClick}
        currentPage={currentPage}
        limit={limit}
      />

      {/* 페이징 */}
      {pagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPageChange={handlePageChange}
        />
      )}

      {/* 배우 상세 모달 */}
      {selectedActor && (
        <ActorDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          actorName={selectedActor}
          year={year}
          month={monthOnly}
        />
      )}
    </div>
  );
}
