import { useState } from "react";
import { type KopisPerformance } from "@/services/kopisApi";

interface PerformancePosterProps {
  performance: KopisPerformance;
  rank: number;
  onClick: () => void;
}

export default function PerformancePoster({
  performance,
  rank,
  onClick,
}: PerformancePosterProps) {
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

