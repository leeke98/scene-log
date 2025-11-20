import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

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

export default function ActorTable({
  actors,
  onActorClick,
  currentPage = 1,
  limit = 10,
}: ActorTableProps) {
  const getRankBadge = (index: number) => {
    // 실제 순위 계산: (현재 페이지 - 1) * 페이지당 항목 수 + 인덱스 + 1
    const actualRank = (currentPage - 1) * limit + index + 1;

    // 1페이지이고 실제 순위가 1, 2, 3등일 때만 배지 표시
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

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-3">이름</TableHead>
              <TableHead className="px-6 py-3">총 관극 횟수</TableHead>
              <TableHead className="px-6 py-3">관람 작품</TableHead>
              <TableHead className="px-6 py-3">관람 금액</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actors.length > 0 ? (
              actors.map((actor, index) => (
                <TableRow
                  key={`${actor.name}-${index}`}
                  className="cursor-pointer"
                  onClick={() => onActorClick(actor.name)}
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankBadge(index)}
                      <span className="font-medium">{actor.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div>{actor.totalViewCount}회</div>
                      <div className="bg-gray-200 rounded-full h-2 w-24">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (actor.totalViewCount / 30) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {actor.watchedPerformances.map((performance, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {performance}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {actor.totalAmount.toLocaleString()}원
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="px-6 py-8 text-center">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
