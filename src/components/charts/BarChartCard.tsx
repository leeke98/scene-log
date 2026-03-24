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
      className={`bg-card rounded-xl p-5 border border-border shadow-sm min-w-0 ${
        className || ""
      }`}
    >
      <h3 className="text-sm font-semibold text-foreground/70 mb-3 tracking-wide">
        {title}
      </h3>
      <ChartContainer config={config} className={`${height} w-full`}>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey={xAxisKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={40}
            tickFormatter={yAxisFormatter}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={tooltipFormatter}
          />
          <Bar dataKey={dataKey} fill={fillColor} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ChartContainer>
    </div>
  );
}
