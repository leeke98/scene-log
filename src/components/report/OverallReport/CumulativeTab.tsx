import { useState } from "react";
import { ChevronRight } from "lucide-react";
import SummaryCards from "@/components/report/SummaryCards";
import GrassField from "@/components/GrassField";

export default function OverallCumulativeTab() {
  const [posterIndex, setPosterIndex] = useState(0);

  const handlePosterNext = () => {
    setPosterIndex((prev) => (prev + 1) % 10);
  };

  const posters = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    title: `작품 ${i + 1}`,
  }));

  const displayedPosters = posters.slice(posterIndex, posterIndex + 6);
  if (displayedPosters.length < 6) {
    displayedPosters.push(...posters.slice(0, 6 - displayedPosters.length));
  }

  const summaryData = {
    totalViewCount: 58,
    totalPerformanceCount: 26,
    totalAmount: 123456789,
    totalMdAmount: 234567,
    mostFrequentActor: "아무개 / 17회",
    mostFrequentTheater: "블루스퀘어 | 17회",
  };

  return (
    <div className="space-y-6">
      {/* 요약과 가장 많이 본 작품 동일 선상 */}
      <div className="grid grid-cols-5 gap-6 items-stretch">
        {/* 요약 섹션 */}
        <div className="col-span-2 flex flex-col">
          <SummaryCards data={summaryData} />
        </div>

        {/* 가장 많이 본 작품 섹션 */}
        <div className="col-span-3 flex flex-col">
          <h2 className="text-lg font-semibold mb-3">가장 많이 본 작품</h2>
          <div className="flex items-center gap-2 flex-1">
            <div className="flex gap-3 flex-1 overflow-hidden h-full">
              {displayedPosters.map((poster) => (
                <div
                  key={poster.id}
                  className="bg-gray-200 rounded-lg aspect-[3/4] h-full flex-shrink-0 flex items-center justify-center"
                >
                  <span className="text-gray-500 text-xs">포스터</span>
                </div>
              ))}
            </div>
            <button
              onClick={handlePosterNext}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 잔디밭 섹션 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">관람 내역</h2>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <GrassField data={[]} />
        </div>
      </section>
    </div>
  );
}
