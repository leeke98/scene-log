import { Loader2 } from "lucide-react";
import { useSummaryHeight } from "@/hooks/useSummaryHeight";
import PieChartCard from "@/components/charts/PieChartCard";
import SummaryCards from "@/components/report/SummaryCards";
import TopPerformancesPoster from "@/components/report/TopPerformancesPoster";
import {
  useSummary,
  useDayOfWeekStats,
  useMostViewedPerformance,
} from "@/queries/reports/queries";

interface OverallCustomRangeTabProps {
  startDate: string;
  endDate: string;
  genre?: "뮤지컬" | "연극";
}

export default function OverallCustomRangeTab({ startDate, endDate, genre }: OverallCustomRangeTabProps) {
  const { data: summary, isLoading } = useSummary(undefined, undefined, genre, startDate, endDate);
  const { summaryRef, posterHeight } = useSummaryHeight([summary]);
  const { data: dayOfWeekStats } = useDayOfWeekStats(undefined, undefined, genre, startDate, endDate);
  const { data: top10Performances } = useMostViewedPerformance(undefined, undefined, genre, startDate, endDate);

  const summaryData = summary
    ? {
        totalViewCount: summary.totalCount,
        totalPerformanceCount: summary.uniquePerformances,
        totalAmount: summary.totalTicketPrice,
        totalMdAmount: summary.totalMdPrice,
        mostFrequentActor: summary.mostViewedActor?.name || "-",
        mostFrequentTheater: summary.mostViewedTheater?.name || "-",
      }
    : {
        totalViewCount: 0,
        totalPerformanceCount: 0,
        totalAmount: 0,
        totalMdAmount: 0,
        mostFrequentActor: "-",
        mostFrequentTheater: "-",
      };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm">불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-6 items-start">
        <div className="md:col-span-2 flex flex-col" id="summary-section" ref={summaryRef}>
          <SummaryCards data={summaryData} />
        </div>
        <div className="md:col-span-3 flex flex-col">
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
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h2 className="text-base font-semibold tracking-wide">관극 요일</h2>
        </div>
        <PieChartCard
          title="관극 요일"
          dayOfWeekStats={dayOfWeekStats}
          showLegend={true}
        />
      </section>
    </div>
  );
}
