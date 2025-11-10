"use client";

import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface YearPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
  startYear?: number; // 시작 연도 (기본값: 현재 연도 - 15)
  endYear?: number; // 종료 연도 (기본값: 현재 연도 + 5)
}

export default function YearPicker({
  value,
  onChange,
  className,
  startYear,
  endYear,
}: YearPickerProps) {
  const currentYear = value.getFullYear();
  const currentDate = new Date();

  // 연도 범위 생성
  const generateYears = () => {
    const start = startYear ?? currentDate.getFullYear() - 10;
    const end = endYear ?? currentDate.getFullYear() + 5;
    const years: number[] = [];
    for (let year = start; year <= end; year++) {
      years.push(year);
    }
    return years;
  };

  const years = generateYears();

  const handleYearChange = (selectedYear: string) => {
    const year = parseInt(selectedYear, 10);
    const newDate = new Date(value);
    newDate.setFullYear(year);
    onChange(newDate);
  };

  const handlePrevious = () => {
    const newDate = new Date(value);
    newDate.setFullYear(newDate.getFullYear() - 1);
    onChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(value);
    newDate.setFullYear(newDate.getFullYear() + 1);
    onChange(newDate);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        className="h-10 w-10"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Select value={currentYear.toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="w-auto min-w-[100px] justify-center px-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <SelectValue placeholder="연도 선택" />
          </div>
        </SelectTrigger>
        <SelectContent className="w-auto min-w-[120px]">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}년
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        className="h-10 w-10"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
