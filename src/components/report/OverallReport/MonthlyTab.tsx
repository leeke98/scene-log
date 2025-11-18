import { useRef, useEffect, useState } from "react";
import { type ChartConfig } from "@/components/ui/chart";
import BarChartCard from "@/components/charts/BarChartCard";
import PieChartCard from "@/components/charts/PieChartCard";
import SummaryCards from "@/components/report/SummaryCards";
import TopPerformancesPoster from "@/components/report/TopPerformancesPoster";
import {
  useSummary,
  useWeeklyStats,
  useDayOfWeekStats,
  useMostViewedPerformance,
} from "@/queries/reports/queries";

interface OverallMonthlyTabProps {
  year: string;
  month: string; // "YYYY-MM" 형식
}

export default function OverallMonthlyTab({
  year,
  month,
}: OverallMonthlyTabProps) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [posterHeight, setPosterHeight] = useState<number | null>(null);

  // month가 "YYYY-MM" 형식이므로 "MM" 부분만 추출
  const monthOnly = month.split("-")[1]; // "YYYY-MM" -> "MM"

  // 전체 요약 데이터 가져오기
  const { data: summary } = useSummary(year, monthOnly);

  // 주별 통계 데이터 가져오기
  const { data: weeklyStats } = useWeeklyStats(month);

  // 요일별 통계 데이터 가져오기
  const { data: dayOfWeekStats } = useDayOfWeekStats(year, monthOnly);

  // 가장 많이 본 작품 데이터 가져오기
  const { data: top10Performances } = useMostViewedPerformance(year, monthOnly);

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

  // 주별 관람수 차트 데이터 매핑 (실제 데이터 기반)
  // 해당 월의 모든 주차를 표시하고, 데이터가 없는 주차는 0으로 채움
  const weeklyViewCountData = (() => {
    // API 응답에서 최대 주차 번호 찾기
    let maxWeek = 0;
    if (weeklyStats && weeklyStats.length > 0) {
      weeklyStats.forEach((item) => {
        // "2025-05-1" 형식에서 마지막 부분이 주차 번호
        const weekNumber = parseInt(item.yearWeek.split("-")[2], 10);
        if (weekNumber > maxWeek) {
          maxWeek = weekNumber;
        }
      });
    }

    // 최소 4주, 최대 6주 (월의 주차 수는 보통 4-6주)
    const totalWeeks = Math.max(4, maxWeek || 4);

    // 1주부터 해당 월의 마지막 주까지 기본 배열 생성
    const allWeeks = Array.from({ length: totalWeeks }, (_, i) => ({
      week: `${i + 1}주`,
      관람수: 0,
    }));

    if (weeklyStats && weeklyStats.length > 0) {
      // API에서 받은 데이터를 주차별로 매핑
      weeklyStats.forEach((item) => {
        // "2025-05-1" 형식에서 마지막 부분이 주차 번호
        const weekNumber = parseInt(item.yearWeek.split("-")[2], 10);
        if (weekNumber >= 1 && weekNumber <= totalWeeks) {
          allWeeks[weekNumber - 1].관람수 = item.count;
        }
      });
    }

    return allWeeks;
  })();

  const weeklyViewCountConfig: ChartConfig = {
    관람수: {
      label: "관람수",
      color: "hsl(var(--chart-1))",
    },
  };

  // 주별 관람 금액 차트 데이터 매핑 (실제 데이터 기반)
  const weeklyAmountData = (() => {
    // API 응답에서 최대 주차 번호 찾기
    let maxWeek = 0;
    if (weeklyStats && weeklyStats.length > 0) {
      weeklyStats.forEach((item) => {
        // "2025-05-1" 형식에서 마지막 부분이 주차 번호
        const weekNumber = parseInt(item.yearWeek.split("-")[2], 10);
        if (weekNumber > maxWeek) {
          maxWeek = weekNumber;
        }
      });
    }

    // 최소 4주, 최대 6주 (월의 주차 수는 보통 4-6주)
    const totalWeeks = Math.max(4, maxWeek || 4);

    // 1주부터 해당 월의 마지막 주까지 기본 배열 생성
    const allWeeks = Array.from({ length: totalWeeks }, (_, i) => ({
      week: `${i + 1}주`,
      금액: 0,
    }));

    if (weeklyStats && weeklyStats.length > 0) {
      // API에서 받은 데이터를 주차별로 매핑
      weeklyStats.forEach((item) => {
        // "2025-05-1" 형식에서 마지막 부분이 주차 번호
        const weekNumber = parseInt(item.yearWeek.split("-")[2], 10);
        if (weekNumber >= 1 && weekNumber <= totalWeeks) {
          allWeeks[weekNumber - 1].금액 = item.totalPrice;
        }
      });
    }

    return allWeeks;
  })();

  const weeklyAmountConfig: ChartConfig = {
    금액: {
      label: "관람 금액",
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
        mostFrequentActor: summary.mostViewedActor
          ? `${summary.mostViewedActor.name} | ${summary.mostViewedActor.count}회`
          : "-",
        mostFrequentTheater: summary.mostViewedTheater
          ? `${summary.mostViewedTheater.name}`
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
