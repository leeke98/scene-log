import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

// 작품 태그 색상 (jewel tone, 순환) - 모달과 동일
const tagColors = [
  "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/40",
  "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40",
  "bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/40",
  "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
  "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
];

export interface ActorData {
  name: string;
  totalViewCount: number;
  watchedPerformances: string[];
  totalAmount: number;
}

interface ActorTableProps {
  actors: ActorData[];
  onActorClick: (actorName: string) => void;
  currentPage?: number;
  limit?: number;
}

const rankConfig: Record<number, { bg: string; text: string }> = {
  1: { bg: "bg-yellow-400", text: "text-yellow-900" },
  2: { bg: "bg-slate-300", text: "text-slate-700" },
  3: { bg: "bg-amber-600", text: "text-white" },
};

export default function ActorTable({
  actors,
  onActorClick,
  currentPage = 1,
  limit = 10,
}: ActorTableProps) {
  const getRankBadge = (index: number) => {
    const actualRank = (currentPage - 1) * limit + index + 1;
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

  return (
    <Card className="shadow-sm border-border rounded-xl overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
              <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                이름
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                총 관극 횟수
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                관람 작품
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                관람 금액
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actors.length > 0 ? (
              actors.map((actor, index) => (
                <TableRow
                  key={`${actor.name}-${index}`}
                  className="cursor-pointer transition-colors hover:bg-violet-50/60 dark:hover:bg-violet-950/20 border-b border-border/60"
                  onClick={() => onActorClick(actor.name)}
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankBadge(index)}
                      <span className="font-medium text-sm">{actor.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1.5">
                      <div className="text-sm font-semibold">
                        {actor.totalViewCount}
                        <span className="text-xs font-normal text-muted-foreground ml-0.5">
                          회
                        </span>
                      </div>
                      <div className="bg-muted rounded-full h-1.5 w-24">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (actor.totalViewCount / 30) * 100,
                              100
                            )}%`,
                            background: "hsl(var(--chart-1))",
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {actor.watchedPerformances.map((performance, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${tagColors[idx % tagColors.length]}`}
                        >
                          {performance}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="font-medium">
                      {actor.totalAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground ml-0.5">원</span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <span className="text-3xl">🎭</span>
                    <span className="text-sm">검색 결과가 없습니다.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
