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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                총 관극 횟수
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                관람 작품
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                관람 금액
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {actors.length > 0 ? (
              actors.map((actor, index) => (
                <tr
                  key={`${actor.name}-${index}`}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onActorClick(actor.name)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankBadge(index)}
                      <span className="text-gray-900 font-medium">
                        {actor.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {actor.totalViewCount}회
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
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {actor.totalAmount.toLocaleString()}원
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
