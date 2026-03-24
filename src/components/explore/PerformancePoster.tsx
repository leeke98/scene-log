import { useState } from "react";
import { type KopisPerformance } from "@/services/kopisApi";

interface PerformancePosterProps {
  performance: KopisPerformance;
  rank?: number;
  onClick: () => void;
}

export default function PerformancePoster({
  performance,
  rank,
  onClick,
}: PerformancePosterProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="w-full cursor-pointer group" onClick={onClick}>
      {/* 포스터 이미지 영역 */}
      <div className="w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden relative">
        {/* 순위 배지 */}
        {rank !== undefined && (
          <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">
            {rank}
          </div>
        )}
        {performance.poster && !imageError ? (
          <img
            src={performance.poster}
            alt={performance.prfnm}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-400 to-purple-600">
            <span className="text-white text-2xl font-bold opacity-90">
              {performance.prfnm.charAt(0)}
            </span>
          </div>
        )}
        {/* 호버 오버레이 (어둡게만) */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* 카드 하단 텍스트 */}
      <div className="mt-2 px-0.5">
        <p className="text-xs font-medium leading-tight line-clamp-2 text-foreground">
          {performance.prfnm}
        </p>
        {(performance.prfplcnm || performance.fcltynm) && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {performance.prfplcnm || performance.fcltynm}
          </p>
        )}
      </div>
    </div>
  );
}

