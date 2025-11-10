import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { type ChartConfig } from "@/components/ui/chart";
import BarChartCard from "@/components/charts/BarChartCard";
import PieChartCard from "@/components/charts/PieChartCard";
import SummaryCards from "@/components/report/SummaryCards";

export default function OverallMonthlyTab() {
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

  // 주별 관람수 막대 그래프 데이터
  const weeklyViewCountData = [
    { week: "1주", 관람수: 2 },
    { week: "2주", 관람수: 3 },
    { week: "3주", 관람수: 4 },
    { week: "4주", 관람수: 2 },
    { week: "5주", 관람수: 1 },
  ];

  const weeklyViewCountConfig: ChartConfig = {
    관람수: {
      label: "관람수",
      color: "hsl(var(--chart-1))",
    },
  };

  // 주별 관람 금액 막대 차트 데이터
  const weeklyAmountData = [
    { week: "1주", 금액: 60000 },
    { week: "2주", 금액: 90000 },
    { week: "3주", 금액: 120000 },
    { week: "4주", 금액: 60000 },
    { week: "5주", 금액: 30000 },
  ];

  const weeklyAmountConfig: ChartConfig = {
    금액: {
      label: "관람 금액",
      color: "hsl(var(--chart-2))",
    },
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

      {/* 차트 섹션 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">차트</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-4">
          <BarChartCard
            title="주 별 관람수"
            data={weeklyViewCountData}
            dataKey="관람수"
            xAxisKey="week"
            config={weeklyViewCountConfig}
            className="md:col-span-2 lg:col-span-2"
          />
          <BarChartCard
            title="주 별 관람 금액"
            data={weeklyAmountData}
            dataKey="금액"
            xAxisKey="week"
            config={weeklyAmountConfig}
            yAxisFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
            tooltipFormatter={(value: number) =>
              `${(value / 10000).toFixed(0)}만원`
            }
            className="md:col-span-2 lg:col-span-2"
          />
          <PieChartCard
            title="관극 요일"
            data={dayOfWeekData}
            config={dayOfWeekConfig}
            colors={COLORS}
            nameKey="name"
            label={({ name, value }) => `${name}: ${value}`}
            className="md:col-span-1 lg:col-span-1"
          />
        </div>
      </section>
    </div>
  );
}
