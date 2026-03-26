import { useState } from "react";
import { Star } from "lucide-react";
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

  const top3 = performances.slice(0, 3);

  // 공동 순위 계산
  const calculateRanks = () => {
    const ranks: number[] = [];
    for (let i = 0; i < top3.length; i++) {
      if (i === 0) {
        ranks.push(1);
      } else if (top3[i].viewCount === top3[i - 1].viewCount) {
        ranks.push(ranks[i - 1]);
      } else {
        let groupStart = i - 1;
        while (
          groupStart > 0 &&
          top3[groupStart].viewCount === top3[groupStart - 1].viewCount
        ) {
          groupStart--;
        }
        const prevRank = ranks[groupStart] ?? 1;
        ranks.push(prevRank + (i - groupStart));
      }
    }
    return ranks;
  };

  const ranks = calculateRanks();

  const badgeColors: Record<number, string> = {
    1: "bg-yellow-500",
    2: "bg-slate-400",
    3: "bg-amber-600",
  };

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {top3.map((perf, index) => {
        const hasError = imageErrors.has(perf.name);
        const showImage = perf.posterUrl && !hasError;
        const rank = ranks[index] ?? index + 1;

        return (
          <div
            key={perf.name}
            className="cursor-pointer group"
            onClick={() => onPerformanceClick(perf.name)}
          >
            {/* 포스터 */}
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md transition-transform group-hover:scale-[1.03] bg-muted">
              {showImage ? (
                <img
                  src={perf.posterUrl}
                  alt={perf.name}
                  className="w-full h-full object-cover"
                  onError={() =>
                    setImageErrors((prev) => new Set(prev).add(perf.name))
                  }
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-violet-400 to-purple-600">
                  <span className="text-white text-2xl sm:text-3xl font-bold opacity-90">
                    {perf.name.charAt(0)}
                  </span>
                </div>
              )}

              {/* 순위 배지 */}
              <div
                className={`absolute top-1.5 left-1.5 z-10 ${badgeColors[rank] ?? "bg-slate-500"} text-white font-bold w-7 h-7 rounded-full flex items-center justify-center shadow text-xs`}
              >
                {rank}
              </div>

              {/* 호버 오버레이 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <p className="text-white text-sm font-semibold">
                  {perf.viewCount}회 관람
                </p>
              </div>
            </div>

            {/* 하단 정보 */}
            <div className="mt-2 text-center">
              <p className="text-sm font-medium truncate">{perf.name}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {perf.viewCount}회
                </span>
                {(perf.avgRating ?? 0) > 0 && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {perf.avgRating.toFixed(1)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
