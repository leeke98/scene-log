import { Skeleton } from "@/components/ui/skeleton";

export default function TicketCardSkeleton() {
  return (
    <div className="relative h-full">
      <div className="relative bg-gradient-to-br from-background to-muted/50 rounded-2xl shadow-lg overflow-hidden border-2 border-border flex flex-row sm:flex-col h-full">
        {/* 포스터 영역 - 모바일: 왼쪽 고정폭, sm 이상: 상단 */}
        <Skeleton className="w-28 shrink-0 sm:w-full sm:h-64 rounded-none" />

        {/* 정보 영역 */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 min-w-0">
          {/* 모바일 공연명 */}
          <div className="sm:hidden space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          <div className="space-y-2 sm:space-y-3">
            {/* 날짜 + 시간 */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            {/* 극장 */}
            <Skeleton className="h-3 w-32" />
            {/* 좌석 */}
            <Skeleton className="h-3 w-20" />
            {/* 캐스팅 */}
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-14 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>
          </div>

          {/* 별점 */}
          <div className="pt-2 sm:pt-3 border-t border-border">
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* 티켓 구멍 효과 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-muted rounded-full border-2 border-border sm:left-0 sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 sm:-translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-muted rounded-full border-2 border-border sm:left-auto sm:right-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:translate-x-1/2 sm:translate-y-0" />
      </div>
    </div>
  );
}
