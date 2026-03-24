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
      if (actualRank === 1)
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-white text-xs font-bold mr-2">
            1
          </span>
        );
      if (actualRank === 2)
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-bold mr-2">
            2
          </span>
        );
      if (actualRank === 3)
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold mr-2">
            3
          </span>
        );
    }
    return null;
  };

  const renderStars = (rating: number | undefined) => {
    const safeRating = rating ?? 0;
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative w-4 h-4">
            <Star className="w-4 h-4 fill-muted text-muted absolute" />
            <div className="absolute overflow-hidden" style={{ width: "50%" }}>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 fill-muted text-muted-foreground" />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {safeRating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-3">작품명</TableHead>
              <TableHead className="px-6 py-3">관람 횟수</TableHead>
              <TableHead className="px-6 py-3">관람 금액</TableHead>
              <TableHead className="px-6 py-3">후기 별점</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-8 text-center text-destructive">
                  데이터를 불러오는 중 오류가 발생했습니다.
                </TableCell>
              </TableRow>
            ) : performances.length > 0 ? (
              performances.map((performance, index) => (
                <TableRow
                  key={performance.name}
                  className="cursor-pointer"
                  onClick={() => onPerformanceClick(performance.name)}
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankBadge(index)}
                      <span className="font-medium">{performance.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm">{performance.viewCount}회</div>
                      <div className="bg-muted rounded-full h-2 w-24">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min((performance.viewCount / total) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    {performance.totalTicketPrice.toLocaleString()}원
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {renderStars(performance.avgRating)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
