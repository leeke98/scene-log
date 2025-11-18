import {
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  type PieLabel,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DayOfWeekStats } from "@/types/report";

// 요일별 색상 맵 (공통 사용)
export const dayOfWeekColorMap: Record<string, string> = {
  월: "hsl(12, 76%, 61%)", // 주황색
  화: "hsl(173, 58%, 39%)", // 청록색
  수: "hsl(197, 37%, 24%)", // 어두운 청록색
  목: "hsl(43, 74%, 66%)", // 노란색
  금: "hsl(27, 87%, 67%)", // 주황-빨강
  토: "hsl(340, 75%, 55%)", // 분홍색
  일: "hsl(220, 70%, 50%)", // 파란색
};

// 요일 순서
const dayOfWeekOrder = [
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
  "일요일",
];

// 요일별 데이터 변환 함수
function transformDayOfWeekData(
  dayOfWeekStats: DayOfWeekStats[] | undefined
): Array<{ name: string; value: number }> {
  if (!dayOfWeekStats) return [];

  return dayOfWeekStats
    .map((item) => ({
      name: item.dayOfWeek.replace("요일", ""), // "월요일" -> "월"
      fullName: item.dayOfWeek, // "월요일"
      value: item.count,
    }))
    .sort((a, b) => {
      // 요일 순서대로 정렬
      const indexA = dayOfWeekOrder.indexOf(a.fullName);
      const indexB = dayOfWeekOrder.indexOf(b.fullName);
      return indexA - indexB;
    })
    .map((item) => ({
      name: item.name,
      value: item.value,
    }));
}

// 요일별 config 자동 생성 함수
function generateDayOfWeekConfig(
  data: Array<{ name: string; value: number }>
): ChartConfig {
  return data.reduce((acc, item) => {
    acc[item.name] = {
      label: item.name,
      color: dayOfWeekColorMap[item.name] || "hsl(var(--chart-3))",
    };
    return acc;
  }, {} as ChartConfig);
}

interface PieChartCardProps {
  title: string;
  dayOfWeekStats: DayOfWeekStats[] | undefined;
  className?: string;
  height?: string;
  showLegend?: boolean;
  label?: PieLabel;
  outerRadius?: number;
}

export default function PieChartCard({
  title,
  dayOfWeekStats,
  className,
  height = "h-[240px]",
  showLegend = false,
  label,
  outerRadius = 80,
}: PieChartCardProps) {
  // height가 "h-full"인 경우 flex-1 사용
  const heightClass = height === "h-full" ? "flex-1" : height;

  // 요일별 데이터 변환
  const data = transformDayOfWeekData(dayOfWeekStats);

  // 요일별 config 자동 생성
  const config = generateDayOfWeekConfig(data);

  // 요일별 색상 배열 생성
  const colors = data.map(
    (item) => dayOfWeekColorMap[item.name] || "hsl(var(--chart-3))"
  );

  return (
    <div
      className={`bg-white rounded-lg p-4 border border-gray-200 min-w-0 flex flex-col ${
        className || ""
      }`}
    >
      <h3 className="text-sm font-medium text-gray-700 mb-2 flex-shrink-0">
        {title}
      </h3>
      <ChartContainer
        config={config}
        className={`${heightClass} w-full flex-1`}
      >
        <RechartsPieChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={outerRadius}
            label={label || (({ name, value }) => `${name}: ${value}`)}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          {showLegend && (
            <ChartLegend
              content={() => {
                // data를 기반으로 직접 범례 생성 (중복 방지)
                return (
                  <div className="flex items-center justify-center gap-4 pt-3">
                    {data.map((item, index) => {
                      const itemConfig = config[item.name];
                      const color = colors[index % colors.length];

                      return (
                        <div
                          key={item.name}
                          className="flex items-center gap-1.5"
                        >
                          <div
                            className="h-2 w-2 shrink-0 rounded-[2px]"
                            style={{
                              backgroundColor: color,
                            }}
                          />
                          <span className="text-xs text-gray-700">
                            {itemConfig?.label || item.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
              className="-bottom-2"
            />
          )}
        </RechartsPieChart>
      </ChartContainer>
    </div>
  );
}
