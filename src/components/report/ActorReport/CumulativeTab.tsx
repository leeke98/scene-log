import { useState, useMemo } from "react";
import ActorDetailModal from "./ActorDetailModal";

interface ActorData {
  name: string;
  totalViewCount: number;
  watchedPerformances: string[];
  totalAmount: number;
  firstWatchedDate: string;
  daysSinceFirst: number;
}

interface ActorCumulativeTabProps {
  searchTerm: string;
}

export default function ActorCumulativeTab({
  searchTerm,
}: ActorCumulativeTabProps) {
  const [selectedActor, setSelectedActor] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 가짜 데이터 (추후 실제 데이터로 교체)
  const actors: ActorData[] = [
    {
      name: "서경수",
      totalViewCount: 17,
      watchedPerformances: ["일 테노레", "알라딘", "킹키부츠"],
      totalAmount: 1561123321,
      firstWatchedDate: "2023.04.04",
      daysSinceFirst: 1321,
    },
    {
      name: "김경수",
      totalViewCount: 12,
      watchedPerformances: ["시카고", "레미제라블"],
      totalAmount: 1200000000,
      firstWatchedDate: "2023.05.15",
      daysSinceFirst: 1280,
    },
    {
      name: "강병훈",
      totalViewCount: 8,
      watchedPerformances: ["햄릿", "맥베스"],
      totalAmount: 800000000,
      firstWatchedDate: "2023.06.20",
      daysSinceFirst: 1244,
    },
    {
      name: "고은성",
      totalViewCount: 15,
      watchedPerformances: ["웨스트 사이드 스토리", "시스터 액트"],
      totalAmount: 1500000000,
      firstWatchedDate: "2023.03.10",
      daysSinceFirst: 1346,
    },
    {
      name: "전성우",
      totalViewCount: 10,
      watchedPerformances: ["오페라의 유령", "라이온킹"],
      totalAmount: 1000000000,
      firstWatchedDate: "2023.07.01",
      daysSinceFirst: 1233,
    },
    {
      name: "박지면",
      totalViewCount: 6,
      watchedPerformances: ["드라큘라"],
      totalAmount: 600000000,
      firstWatchedDate: "2023.08.15",
      daysSinceFirst: 1188,
    },
    {
      name: "박진주",
      totalViewCount: 9,
      watchedPerformances: ["캣츠", "그리스"],
      totalAmount: 900000000,
      firstWatchedDate: "2023.09.10",
      daysSinceFirst: 1162,
    },
    {
      name: "신성인",
      totalViewCount: 11,
      watchedPerformances: ["모차르트", "베토벤"],
      totalAmount: 1100000000,
      firstWatchedDate: "2023.04.20",
      daysSinceFirst: 1305,
    },
    {
      name: "전동석",
      totalViewCount: 7,
      watchedPerformances: ["햄릿"],
      totalAmount: 700000000,
      firstWatchedDate: "2023.10.05",
      daysSinceFirst: 1137,
    },
  ];

  // 검색 필터링 및 정렬
  const filteredAndSortedActors = useMemo(() => {
    const filtered = actors.filter((actor) =>
      actor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 정렬: 총 관극 횟수 많은 순 > 관람 금액 많은 순 > 이름 가나다 순
    return filtered.sort((a, b) => {
      // 1순위: 총 관극 횟수
      if (b.totalViewCount !== a.totalViewCount) {
        return b.totalViewCount - a.totalViewCount;
      }
      // 2순위: 관람 금액
      if (b.totalAmount !== a.totalAmount) {
        return b.totalAmount - a.totalAmount;
      }
      // 3순위: 이름 가나다 순
      return a.name.localeCompare(b.name, "ko");
    });
  }, [searchTerm]);

  const handleActorClick = (actorName: string) => {
    setSelectedActor(actorName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActor(null);
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-white text-xs font-bold mr-2">
          1
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-bold mr-2">
          2
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold mr-2">
          3
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 테이블 */}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  처음 본 날
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedActors.length > 0 ? (
                filteredAndSortedActors.map((actor, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleActorClick(actor.name)}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {actor.firstWatchedDate} (D+{actor.daysSinceFirst}일)
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 배우 상세 모달 */}
      {selectedActor && (
        <ActorDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          actorName={selectedActor}
        />
      )}
    </div>
  );
}
