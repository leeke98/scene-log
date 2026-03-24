import { Star } from "lucide-react";
import type { PerformanceStats } from "@/types/report";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface PerformanceTableProps {
  performances: PerformanceStats[];
  isLoading: boolean;
  error: Error | null;
  currentPage: number;
  limit: number;
  total: number;
  startRankOffset?: number;
  onPerformanceClick: (performanceName: string) => void;
}

const rankConfig: Record<number, { bg: string; text: string }> = {
  1: { bg: "bg-yellow-400", text: "text-yellow-900" },
  2: { bg: "bg-slate-300", text: "text-slate-700" },
  3: { bg: "bg-amber-600", text: "text-white" },
};

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
    const actualRank =
      (currentPage - 1) * limit + index + 1 + startRankOffset;
    if (currentPage !== 1 || actualRank > 3) return null;
    const { bg, text } = rankConfig[actualRank];
    return (
      <span
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${bg} ${text} text-[10px] font-bold mr-2 flex-shrink-0 shadow-sm`}
      >
        {actualRank}
      </span>
    );
  };

  const renderStars = (rating: number | undefined) => {
    const safeRating = rating ?? 0;
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative w-3.5 h-3.5">
            <Star className="w-3.5 h-3.5 fill-muted text-muted absolute" />
            <div className="absolute overflow-hidden" style={{ width: "50%" }}>
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="w-3.5 h-3.5 fill-muted text-muted" />
        ))}
        <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
          {safeRating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <Card className="shadow-sm border-border rounded-xl">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
              <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                작품명
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                관람 횟수
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                관람 금액
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                후기 별점
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <span className="text-3xl">🎭</span>
                    <span className="text-sm">불러오는 중...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-destructive">
                    <span className="text-3xl">⚠️</span>
                    <span className="text-sm">데이터를 불러오는 중 오류가 발생했습니다.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : performances.length > 0 ? (
              performances.map((performance, index) => (
                <TableRow
                  key={performance.name}
                  className="cursor-pointer transition-colors hover:bg-violet-50/60 dark:hover:bg-violet-950/20 border-b border-border/60"
                  onClick={() => onPerformanceClick(performance.name)}
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankBadge(index)}
                      <span className="font-medium text-sm">{performance.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1.5">
                      <div className="text-sm font-semibold">
                        {performance.viewCount}
                        <span className="text-xs font-normal text-muted-foreground ml-0.5">
                          회
                        </span>
                      </div>
                      <div className="bg-muted rounded-full h-1.5 w-24">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (performance.viewCount / (total || 1)) * 100,
                              100
                            )}%`,
                            background: "hsl(var(--chart-1))",
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="font-medium">
                      {performance.totalTicketPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground ml-0.5">원</span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {renderStars(performance.avgRating)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <span className="text-3xl">🎭</span>
                    <span className="text-sm">데이터가 없습니다.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
