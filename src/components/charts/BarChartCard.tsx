import {
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface BarChartCardProps {
  title: string;
  data: Array<Record<string, string | number>>;
  dataKey: string;
  xAxisKey: string;
  config: ChartConfig;
  className?: string;
  height?: string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
  barColor?: string;
}

export default function BarChartCard({
  title,
  data,
  dataKey,
  xAxisKey,
  config,
  className,
  height = "h-[240px]",
  yAxisFormatter,
  tooltipFormatter,
  barColor,
}: BarChartCardProps) {
  const defaultBarColor = config[dataKey]?.color || "hsl(var(--chart-1))";
  const fillColor = barColor || defaultBarColor;

  return (
    <div
      className={`bg-white rounded-lg p-4 border border-gray-200 min-w-0 ${
        className || ""
      }`}
    >
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <ChartContainer config={config} className={`${height} w-full`}>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={40}
            tickFormatter={yAxisFormatter}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={tooltipFormatter}
          />
          <Bar dataKey={dataKey} fill={fillColor} radius={4} />
        </RechartsBarChart>
      </ChartContainer>
    </div>
  );
}
