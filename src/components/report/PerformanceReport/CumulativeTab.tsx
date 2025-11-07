import { useState, useMemo } from "react";
import { Star } from "lucide-react";
import PerformanceDetailModal from "./PerformanceDetailModal";

interface PerformanceData {
  name: string;
  rating: number;
  viewCount: number;
  totalAmount: number;
  firstWatchedDate: string;
}

interface PerformanceCumulativeTabProps {
  searchTerm: string;
}

export default function PerformanceCumulativeTab({
  searchTerm,
}: PerformanceCumulativeTabProps) {
  const [selectedPerformance, setSelectedPerformance] =
    useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 가짜 데이터 (추후 실제 데이터로 교체)
  const performances: PerformanceData[] = [
    {
      name: "일 테노레",
      rating: 5.0,
      viewCount: 12,
      totalAmount: 1561123321,
      firstWatchedDate: "2023.04.04",
    },
    {
      name: "알라딘",
      rating: 4.5,
      viewCount: 8,
      totalAmount: 1200000000,
      firstWatchedDate: "2023.05.15",
    },
    {
      name: "킹키부츠",
      rating: 4.5,
      viewCount: 6,
      totalAmount: 900000000,
      firstWatchedDate: "2023.06.20",
    },
    {
      name: "시카고",
      rating: 4.0,
      viewCount: 5,
      totalAmount: 800000000,
      firstWatchedDate: "2023.07.01",
    },
    {
      name: "레미제라블",
      rating: 4.0,
      viewCount: 4,
      totalAmount: 700000000,
      firstWatchedDate: "2023.08.15",
    },
    {
      name: "웨스트 사이드 스토리",
      rating: 3.5,
      viewCount: 3,
      totalAmount: 600000000,
      firstWatchedDate: "2023.09.10",
    },
    {
      name: "시스터 액트",
      rating: 3.5,
      viewCount: 2,
      totalAmount: 500000000,
      firstWatchedDate: "2023.10.05",
    },
  ];

  // 검색 필터링 및 정렬: 별점 높은 순 > 관극 횟수 높은 순
  const sortedPerformances = useMemo(() => {
    const filtered = performances.filter((performance) =>
      performance.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 정렬: 별점 높은 순 > 관극 횟수 높은 순
    return filtered.sort((a, b) => {
      // 1순위: 별점 높은 순
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      // 2순위: 관극 횟수 높은 순
      return b.viewCount - a.viewCount;
    });
  }, [searchTerm]);

  const handlePerformanceClick = (performanceName: string) => {
    setSelectedPerformance(performanceName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPerformance(null);
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-white text-xs font-bold mr-2">
          1
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-bold mr-2">
          2
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold mr-2">
          3
        </span>
      );
    }
    return null;
  };

  // 별점 표시 (테이블용)
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative w-4 h-4">
            <Star className="w-4 h-4 fill-gray-300 text-gray-300 absolute" />
            <div className="absolute overflow-hidden" style={{ width: "50%" }}>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="w-4 h-4 fill-gray-300 text-gray-300"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 테이블 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작품명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관람 횟수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관람 금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  후기 별점
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPerformances.length > 0 ? (
                sortedPerformances.map((performance, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handlePerformanceClick(performance.name)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRankBadge(index)}
                        <span className="text-gray-900 font-medium">
                          {performance.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">
                          {performance.viewCount}회
                        </span>
                        <div className="bg-gray-200 rounded-full h-2 w-24">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min((performance.viewCount / 50) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {performance.totalAmount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(performance.rating)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
