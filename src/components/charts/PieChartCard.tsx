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
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface PieChartCardProps {
  title: string;
  data: Array<{ name: string; value: number }>;
  config: ChartConfig;
  colors: string[];
  className?: string;
  height?: string;
  nameKey?: string;
  dataKey?: string;
  showLegend?: boolean;
  label?: PieLabel;
  outerRadius?: number;
}

export default function PieChartCard({
  title,
  data,
  config,
  colors,
  className,
  height = "h-[240px]",
  nameKey = "name",
  dataKey = "value",
  showLegend = false,
  label,
  outerRadius = 80,
}: PieChartCardProps) {
  // height가 "h-full"인 경우 flex-1 사용
  const heightClass = height === "h-full" ? "flex-1" : height;

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
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={outerRadius}
            label={label}
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
              content={<ChartLegendContent nameKey={nameKey} />}
              className="-bottom-2"
            />
          )}
        </RechartsPieChart>
      </ChartContainer>
    </div>
  );
}
