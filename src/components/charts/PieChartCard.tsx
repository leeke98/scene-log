import { Pie, PieChart as RechartsPieChart, Cell } from "recharts";
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
  label?: (props: { name: string; value: number }) => string;
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
  return (
    <div
      className={`bg-white rounded-lg p-4 border border-gray-200 min-w-0 ${className || ""}`}
    >
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <ChartContainer config={config} className={`${height} w-full`}>
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

