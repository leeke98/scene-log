import { useState, useMemo, useEffect } from "react";
import PerformanceDetailModal from "./PerformanceDetailModal";
import PerformanceTable from "./PerformanceTable";
import TopPosters from "./TopPosters";
import Pagination from "../Pagination";
import { usePerformanceStats } from "@/queries/reports/queries";

interface PerformanceAnnualTabProps {
  searchTerm: string;
  year: string;
}

export default function PerformanceAnnualTab({
  searchTerm,
  year,
}: PerformanceAnnualTabProps) {
  const [selectedPerformance, setSelectedPerformance] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  // API 호출
  const { data, isLoading, error } = usePerformanceStats({
    search: searchTerm || undefined,
    year,
    page: currentPage,
    limit,
  });

  // 검색어나 연도 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, year]);

  // 검색 필터링 및 정렬: 관극 횟수 높은 순 > 별점 높은 순
  const sortedPerformances = useMemo(() => {
    if (!data?.data) return [];

    const performances = data.data;

    // 정렬: 관극 횟수 높은 순 > 별점 높은 순
    return performances.sort((a, b) => {
      // 1순위: 관극 횟수 높은 순
      if (b.viewCount !== a.viewCount) {
        return b.viewCount - a.viewCount;
      }
      // 2순위: 별점 높은 순 (undefined는 0으로 처리)
      const ratingA = a.avgRating ?? 0;
      const ratingB = b.avgRating ?? 0;
      return ratingB - ratingA;
    });
  }, [data]);

  const pagination = data?.pagination;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerformanceClick = (performanceName: string) => {
    setSelectedPerformance(performanceName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPerformance(null);
  };

  // 1페이지일 때는 Top 10 포스터 표시, 테이블은 11위부터
  // 2페이지 이상일 때는 Top 10 포스터 숨김, 테이블은 전체 표시
  // 검색어가 있으면 Top 10 포스터 숨김
  const showTop10 =
    currentPage === 1 && sortedPerformances.length > 0 && !searchTerm.trim();
  const tablePerformances = showTop10
    ? sortedPerformances.slice(10)
    : sortedPerformances;

  return (
    <div className="space-y-6">
      {/* Top 10 포스터 (1페이지일 때만) */}
      {showTop10 && (
        <TopPosters
          performances={sortedPerformances.slice(0, 10)}
          onPerformanceClick={handlePerformanceClick}
        />
      )}

      {/* 테이블 */}
      <PerformanceTable
        performances={tablePerformances}
        isLoading={isLoading}
        error={error}
        currentPage={currentPage}
        limit={limit}
        total={pagination?.total ?? 0}
        startRankOffset={showTop10 ? 10 : 0}
        onPerformanceClick={handlePerformanceClick}
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

      {/* 극 상세 모달 */}
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
