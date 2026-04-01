import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PeriodType = "연간" | "월" | "직접" | "누적";

interface PeriodFilterProps {
  activePeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
}

export default function PeriodFilter({
  activePeriod,
  onPeriodChange,
}: PeriodFilterProps) {
  return (
    <Select
      value={activePeriod}
      onValueChange={(value) => onPeriodChange(value as PeriodType)}
    >
      <SelectTrigger className="h-8 md:h-10 w-20 md:w-24 text-xs md:text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="연간">연간</SelectItem>
        <SelectItem value="월">월</SelectItem>
        <SelectItem value="직접">직접</SelectItem>
        <SelectItem value="누적">누적</SelectItem>
      </SelectContent>
    </Select>
  );
}

export type { PeriodType };
