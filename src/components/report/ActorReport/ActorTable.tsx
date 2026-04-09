import { useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

// 작품 태그 색상 (jewel tone, 순환) - 모달과 동일
const tagColors = [
  "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/40",
  "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40",
  "bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/40",
  "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
  "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
];

export interface ActorData {
  id: string;
  name: string;
  totalViewCount: number;
  watchedPerformances: string[];
  totalAmount: number;
  imageUrl?: string | null;
}

interface ActorCardListProps {
  actors: ActorData[];
  isLoading?: boolean;
  onActorClick: (actorId: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

const rankConfig: Record<number, { bg: string; text: string }> = {
  1: { bg: "bg-yellow-400", text: "text-yellow-900" },
  2: { bg: "bg-slate-300", text: "text-slate-700" },
  3: { bg: "bg-amber-600", text: "text-white" },
};

export default function ActorCardList({
  actors,
  isLoading,
  onActorClick,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: ActorCardListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node || !hasNextPage || isFetchingNextPage) return;
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage?.();
        }
      });
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm">불러오는 중...</span>
      </div>
    );
  }

  if (actors.length === 0) {
    return (
      <Card className="shadow-sm border-border rounded-xl">
        <CardContent className="px-6">
          <EmptyState icon="🎭" message="검색 결과가 없습니다." size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="max-w-2xl mx-auto space-y-2">
        {actors.map((actor, index) => {
          const rank = index + 1;
          const rankStyle = rankConfig[rank];

          return (
            <Card
              key={actor.id}
              className="shadow-sm border-border rounded-xl cursor-pointer transition-colors hover:bg-violet-50/60 dark:hover:bg-violet-950/20"
              onClick={() => onActorClick(actor.id)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                {/* 이미지 영역 (항상 자리 차지) */}
                {actor.imageUrl ? (
                  <img
                    src={actor.imageUrl}
                    alt={actor.name}
                    className="flex-shrink-0 w-14 h-14 rounded-xl object-cover object-top"
                  />
                ) : (
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground/60 text-center leading-tight">
                      이미지<br />없음
                    </span>
                  </div>
                )}

                {/* 정보 영역 */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* 랭크뱃지 + 이름 */}
                  <div className="flex items-center gap-2">
                    {rankStyle ? (
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${rankStyle.bg} ${rankStyle.text} text-[10px] font-bold flex-shrink-0 shadow-sm`}
                      >
                        {rank}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground tabular-nums w-5 text-center flex-shrink-0">
                        {rank}
                      </span>
                    )}
                    <span className="font-semibold text-sm truncate">{actor.name}</span>
                  </div>

                  {/* 통계 + 태그 */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm font-medium tabular-nums">
                      {actor.totalViewCount}
                      <span className="text-xs font-normal text-muted-foreground ml-0.5">회</span>
                    </span>
                    <span className="text-sm font-medium tabular-nums">
                      {actor.totalAmount.toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground ml-0.5">원</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {actor.watchedPerformances.map((performance, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${tagColors[idx % tagColors.length]}`}
                        >
                          {performance}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 무한 스크롤 센티널 */}
      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
