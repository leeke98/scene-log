import { useState, useRef, useEffect } from "react";
import { type ChartConfig } from "@/components/ui/chart";
import BarChartCard from "@/components/charts/BarChartCard";
import PieChartCard from "@/components/charts/PieChartCard";
import SummaryCards from "@/components/report/SummaryCards";
import TopPerformancesPoster from "@/components/report/TopPerformancesPoster";
import {
  useSummary,
  useMonthlyStats,
  useDayOfWeekStats,
  useMostViewedPerformance,
} from "@/queries/reports/queries";

interface OverallAnnualTabProps {
  year: string;
}

export default function OverallAnnualTab({ year }: OverallAnnualTabProps) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [posterHeight, setPosterHeight] = useState<number | null>(null);

  // 전체 요약 데이터 가져오기
  const { data: summary } = useSummary(year);

  // 월별 통계 데이터 가져오기
  const { data: monthlyStats } = useMonthlyStats(year);

  // 요일별 통계 데이터 가져오기
  const { data: dayOfWeekStats } = useDayOfWeekStats(year);

  // 가장 많이 본 작품 데이터 가져오기
  const { data: top10Performances } = useMostViewedPerformance(year);

  // 요약 섹션의 높이를 측정하여 포스터 높이에 반영
  useEffect(() => {
    const updateHeight = () => {
      if (summaryRef.current) {
        const summaryHeight = summaryRef.current.offsetHeight;
        // 제목 높이(약 1.5rem + mb-4 = 1rem)를 제외한 높이
        const titleHeight = 40; // text-lg + mb-4
        setPosterHeight(summaryHeight - titleHeight);
      }
    };

    // 초기 측정
    const timer = setTimeout(updateHeight, 0);

    // ResizeObserver로 더 정확하게 측정
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    if (summaryRef.current) {
      resizeObserver.observe(summaryRef.current);
    }

    window.addEventListener("resize", updateHeight);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [summary]);

  // 월별 관람수 차트 데이터 매핑 (실제 데이터 기반)
  // 1월부터 12월까지 모든 달을 표시하고, 데이터가 없는 달은 0으로 채움
  const monthlyViewCountData = (() => {
    // 1월부터 12월까지 기본 배열 생성
    const allMonths = Array.from({ length: 12 }, (_, i) => ({
      month: `${i + 1}월`,
      관람수: 0,
    }));

    if (monthlyStats && monthlyStats.length > 0) {
      // API에서 받은 데이터를 월별로 매핑
      monthlyStats.forEach((item) => {
        const month = parseInt(item.yearMonth.split("-")[1], 10);
        if (month >= 1 && month <= 12) {
          allMonths[month - 1].관람수 = item.count;
        }
      });
    }

    return allMonths;
  })();

  const monthlyViewCountConfig: ChartConfig = {
    관람수: {
      label: "관람수",
      color: "hsl(var(--chart-1))",
    },
  };

  // 월별 금액 차트 데이터 매핑 (실제 데이터 기반)
  // 1월부터 12월까지 모든 달을 표시하고, 데이터가 없는 달은 0으로 채움
  const monthlyAmountData = (() => {
    // 1월부터 12월까지 기본 배열 생성
    const allMonths = Array.from({ length: 12 }, (_, i) => ({
      month: `${i + 1}월`,
      금액: 0,
    }));

    if (monthlyStats && monthlyStats.length > 0) {
      // API에서 받은 데이터를 월별로 매핑
      monthlyStats.forEach((item) => {
        const month = parseInt(item.yearMonth.split("-")[1], 10);
        if (month >= 1 && month <= 12) {
          allMonths[month - 1].금액 = item.totalPrice;
        }
      });
    }

    return allMonths;
  })();

  const monthlyAmountConfig: ChartConfig = {
    금액: {
      label: "금액",
      color: "hsl(var(--chart-2))",
    },
  };

  // SummaryCards에 전달할 데이터 매핑
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
          <h2 className="text-lg font-semibold mb-3">가장 많이 본 작품</h2>
          <TopPerformancesPoster
            performances={top10Performances || []}
            height={posterHeight}
          />
        </div>
      </div>

      {/* 차트 섹션 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">차트</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-4">
          <BarChartCard
            title="월 별 관람수"
            data={monthlyViewCountData}
            dataKey="관람수"
            xAxisKey="month"
            config={monthlyViewCountConfig}
            className="md:col-span-2 lg:col-span-2"
          />
          <BarChartCard
            title="월 별 관람 금액"
            data={monthlyAmountData}
            dataKey="금액"
            xAxisKey="month"
            config={monthlyAmountConfig}
            yAxisFormatter={(value) => `${(value / 10000).toLocaleString()}만`}
            tooltipFormatter={(value: number) => `${value.toLocaleString()}원`}
            className="md:col-span-2 lg:col-span-2"
          />
          <PieChartCard
            title="관극 요일"
            dayOfWeekStats={dayOfWeekStats}
            className="md:col-span-1 lg:col-span-1"
          />
        </div>
      </section>
    </div>
  );
}
