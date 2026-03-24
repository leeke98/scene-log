import { useSummaryHeight } from "@/hooks/useSummaryHeight";
import SummaryCards from "@/components/report/SummaryCards";
import TopPerformancesPoster from "@/components/report/TopPerformancesPoster";
import GrassField from "@/components/GrassField";
import PieChartCard from "@/components/charts/PieChartCard";
import {
  useSummary,
  useDayOfWeekStats,
  useMostViewedPerformance,
  useGrassData,
} from "@/queries/reports/queries";

export default function OverallCumulativeTab() {
  // 전체 요약 데이터 가져오기 (누적 데이터이므로 파라미터 없음)
  const { data: summary } = useSummary();

  const { summaryRef, posterHeight } = useSummaryHeight([summary]);

  // 요일별 통계 데이터 가져오기 (누적 데이터이므로 파라미터 없음)
  const { data: dayOfWeekStats } = useDayOfWeekStats();

  // 가장 많이 본 작품 데이터 가져오기 (누적 데이터이므로 파라미터 없음)
  const { data: top10Performances } = useMostViewedPerformance();

  // 잔디밭 데이터 가져오기
  const { data: grassData } = useGrassData();

  // SummaryCards에 전달할 데이터 매핑
  const summaryData = summary
    ? {
        totalViewCount: summary.totalCount,
        totalPerformanceCount: summary.uniquePerformances,
        totalAmount: summary.totalTicketPrice,
        totalMdAmount: summary.totalMdPrice,
        mostFrequentActor: summary.mostViewedActor
          ? `${summary.mostViewedActor.name} | ${summary.mostViewedActor.count}회`
          : "-",
        mostFrequentTheater: summary.mostViewedTheater
          ? summary.mostViewedTheater.name
          : "-",
      }
    : {
        totalViewCount: 0,
        totalPerformanceCount: 0,
        totalAmount: 0,
        totalMdAmount: 0,
        mostFrequentActor: "-",
        mostFrequentTheater: "-",
      };

  return (
    <div className="space-y-6">
      {/* 요약과 가장 많이 본 작품 동일 선상 */}
      <div className="grid grid-cols-5 gap-6 items-start">
        {/* 요약 섹션 */}
        <div
          className="col-span-2 flex flex-col"
          id="summary-section"
          ref={summaryRef}
        >
          <SummaryCards data={summaryData} />
        </div>

        {/* 가장 많이 본 작품 섹션 */}
        <div className="col-span-3 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-base font-semibold tracking-wide">가장 많이 본 작품</h2>
          </div>
          <TopPerformancesPoster
            performances={top10Performances || []}
            height={posterHeight}
          />
        </div>
      </div>

      {/* 잔디밭 및 차트 섹션 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h2 className="text-base font-semibold tracking-wide">관람 내역</h2>
        </div>
        <div className="grid grid-cols-6 gap-4 items-stretch">
          {/* 잔디밭 - 4칸 차지 */}
          <div className="col-span-4 md:col-span-4 bg-card rounded-xl px-8 py-6 border border-border shadow-sm flex flex-col">
            <GrassField data={grassData || []} />
          </div>
          {/* 관극 요일 파이 차트 - 2칸 차지 */}
          <div className="col-span-2 md:col-span-2 flex">
            <PieChartCard
              title="관극 요일"
              dayOfWeekStats={dayOfWeekStats}
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
