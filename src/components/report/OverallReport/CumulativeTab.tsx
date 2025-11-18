import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { type ChartConfig } from "@/components/ui/chart";
import SummaryCards from "@/components/report/SummaryCards";
import GrassField from "@/components/GrassField";
import PieChartCard from "@/components/charts/PieChartCard";

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

  // 관극 요일 파이 차트 데이터
  const dayOfWeekData = [
    { name: "월", value: 8 },
    { name: "화", value: 5 },
    { name: "수", value: 7 },
    { name: "목", value: 6 },
    { name: "금", value: 9 },
    { name: "토", value: 15 },
    { name: "일", value: 8 },
  ];

  // 각 요일마다 고유한 색상 정의 (7개의 서로 다른 색상)
  const dayOfWeekConfig: ChartConfig = {
    월: { label: "월", color: "hsl(12, 76%, 61%)" }, // 주황색
    화: { label: "화", color: "hsl(173, 58%, 39%)" }, // 청록색
    수: { label: "수", color: "hsl(197, 37%, 24%)" }, // 어두운 청록색
    목: { label: "목", color: "hsl(43, 74%, 66%)" }, // 노란색
    금: { label: "금", color: "hsl(27, 87%, 67%)" }, // 주황-빨강
    토: { label: "토", color: "hsl(340, 75%, 55%)" }, // 분홍색
    일: { label: "일", color: "hsl(220, 70%, 50%)" }, // 파란색
  };

  const COLORS = [
    "hsl(12, 76%, 61%)", // 월 - 주황색
    "hsl(173, 58%, 39%)", // 화 - 청록색
    "hsl(197, 37%, 24%)", // 수 - 어두운 청록색
    "hsl(43, 74%, 66%)", // 목 - 노란색
    "hsl(27, 87%, 67%)", // 금 - 주황-빨강
    "hsl(340, 75%, 55%)", // 토 - 분홍색
    "hsl(220, 70%, 50%)", // 일 - 파란색
  ];

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

      {/* 잔디밭 및 차트 섹션 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">관람 내역</h2>
        <div className="grid grid-cols-6 gap-4 items-stretch">
          {/* 잔디밭 - 3칸 차지 */}
          <div className="col-span-4 md:col-span-4 bg-white rounded-lg px-8 py-6 border border-gray-200 flex flex-col">
            <GrassField data={[]} />
          </div>
          {/* 관극 요일 파이 차트 - 2칸 차지 */}
          <div className="col-span-2 md:col-span-2 flex">
            <PieChartCard
              title="관극 요일"
              data={dayOfWeekData}
              config={dayOfWeekConfig}
              colors={COLORS}
              nameKey="name"
              label={({ name, value }) => `${name}: ${value}`}
              className="w-full h-full flex flex-col"
              height="h-full"
              showLegend={true}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
