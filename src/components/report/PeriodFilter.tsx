import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PeriodType = "연간" | "월" | "누적";

interface PeriodFilterProps {
  activePeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
}

export default function PeriodFilter({
  activePeriod,
  onPeriodChange,
}: PeriodFilterProps) {
  return (
    <Tabs
      value={activePeriod}
      onValueChange={(value) => onPeriodChange(value as PeriodType)}
    >
      <TabsList className="h-8 md:h-10">
        <TabsTrigger value="연간" className="text-xs md:text-sm px-2.5 md:px-3">연간</TabsTrigger>
        <TabsTrigger value="월" className="text-xs md:text-sm px-2.5 md:px-3">월</TabsTrigger>
        <TabsTrigger value="누적" className="text-xs md:text-sm px-2.5 md:px-3">누적</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export type { PeriodType };
