import { Star } from "lucide-react";
import type { PerformanceStats } from "@/types/report";
import { Card } from "@/components/ui/card";

interface PerformanceTableProps {
  performances: PerformanceStats[];
  isLoading: boolean;
  error: Error | null;
  startRankOffset?: number;
  onPerformanceClick: (performanceName: string) => void;
}

const rankBadgeConfig: Record<number, string> = {
  1: "bg-yellow-400 text-yellow-900",
  2: "bg-slate-300 text-slate-700",
  3: "bg-amber-600 text-white",
};

export default function PerformanceTable({
  performances,
  isLoading,
  error,
  startRankOffset = 0,
  onPerformanceClick,
}: PerformanceTableProps) {
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
            className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
          />
        ))}
        {hasHalfStar && (
          <div className="relative w-3.5 h-3.5">
            <Star className="w-3.5 h-3.5 fill-muted text-muted absolute" />
            <div
              className="absolute overflow-hidden"
              style={{ width: "50%" }}
            >
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="w-3.5 h-3.5 fill-muted text-muted"
          />
        ))}
        <span className="ml-1 text-xs text-muted-foreground tabular-nums">
          {safeRating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <span className="text-3xl">🎭</span>
        <span className="text-sm">불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-destructive">
        <span className="text-3xl">⚠️</span>
        <span className="text-sm">데이터를 불러오는 중 오류가 발생했습니다.</span>
      </div>
    );
  }

  if (performances.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <span className="text-3xl">🎭</span>
        <span className="text-sm">데이터가 없습니다.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
      {performances.map((performance, index) => {
        const rank = index + 1 + startRankOffset;
        const badgeStyle = rankBadgeConfig[rank];

        return (
          <Card
            key={performance.name}
            className="cursor-pointer transition-colors hover:bg-violet-50/60 dark:hover:bg-violet-950/20 shadow-sm border-border rounded-xl overflow-hidden"
            onClick={() => onPerformanceClick(performance.name)}
          >
            <div className="flex items-center gap-3 p-3 sm:p-4">
              {/* 순위 */}
              <div className="flex-shrink-0 w-8 text-center">
                {badgeStyle ? (
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${badgeStyle} text-xs font-bold shadow-sm`}
                  >
                    {rank}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground tabular-nums">
                    {rank}
                  </span>
                )}
              </div>

              {/* 포스터 썸네일 */}
              <div className="w-11 h-[60px] sm:w-16 sm:h-[88px] rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {performance.posterUrl ? (
                  <img
                    src={performance.posterUrl}
                    alt={performance.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-400 to-purple-600">
                    <span className="text-white text-xs font-bold">
                      {performance.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {performance.name}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {performance.viewCount}
                    </span>
                    회
                  </span>
                  <span className="text-muted-foreground/30">|</span>
                  <span className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {performance.totalTicketPrice.toLocaleString()}
                    </span>
                    원
                  </span>
                </div>
                {/* 별점 */}
                <div className="mt-1">
                  {renderStars(performance.avgRating)}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
