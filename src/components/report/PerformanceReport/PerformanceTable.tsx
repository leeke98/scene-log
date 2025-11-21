import { Star } from "lucide-react";
import type { PerformanceStats } from "@/types/report";

interface PerformanceTableProps {
  performances: PerformanceStats[];
  isLoading: boolean;
  error: Error | null;
  currentPage: number;
  limit: number;
  total: number;
  startRankOffset?: number; // 순위 시작 오프셋 (1페이지에서 4위부터 시작할 때 3)
  onPerformanceClick: (performanceName: string) => void;
}

export default function PerformanceTable({
  performances,
  isLoading,
  error,
  currentPage,
  limit,
  total,
  startRankOffset = 0,
  onPerformanceClick,
}: PerformanceTableProps) {
  const getRankBadge = (index: number) => {
    const actualRank = (currentPage - 1) * limit + index + 1 + startRankOffset;
    if (currentPage === 1) {
      if (actualRank === 1) {
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-white text-xs font-bold mr-2">
            1
          </span>
        );
      }
      if (actualRank === 2) {
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-bold mr-2">
            2
          </span>
        );
      }
      if (actualRank === 3) {
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold mr-2">
            3
          </span>
        );
      }
    }
    return null;
  };

  // 별점 표시 (테이블용)
  const renderStars = (rating: number | undefined) => {
    const safeRating = rating ?? 0;
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-4 h-4 fill-yellow-400 text-yellow-400"
          />
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
        <span className="ml-2 text-sm text-gray-600">
          {safeRating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
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
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  로딩 중...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-red-500">
                  데이터를 불러오는 중 오류가 발생했습니다.
                </td>
              </tr>
            ) : performances.length > 0 ? (
              performances.map((performance, index) => (
                <tr
                  key={performance.name}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onPerformanceClick(performance.name)}
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
                            width: `${Math.min(
                              (performance.viewCount / total) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {performance.totalTicketPrice.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStars(performance.avgRating)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
