"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MonthPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export default function MonthPicker({
  value,
  onChange,
  className,
}: MonthPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const months = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  const currentYear = value.getFullYear();
  const currentMonth = value.getMonth();

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentYear, monthIndex, 1);
    onChange(newDate);
    setIsOpen(false);
  };

  const handleYearChange = (delta: number) => {
    const newDate = new Date(value);
    newDate.setFullYear(newDate.getFullYear() + delta);
    onChange(newDate);
  };

  const handlePrevious = () => {
    const newDate = new Date(value);
    newDate.setMonth(newDate.getMonth() - 1);
    onChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(value);
    newDate.setMonth(newDate.getMonth() + 1);
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
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            {format(value, "yyyy년 MM월", { locale: ko })}
          </Button>
        </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          {/* 연도 네비게이션 */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleYearChange(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">이전 연도</span>
            </Button>
            <span className="text-sm font-medium">{currentYear}년</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleYearChange(1)}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">다음 연도</span>
            </Button>
          </div>

          {/* 월 그리드 */}
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => (
              <Button
                key={index}
                variant={index === currentMonth ? "default" : "outline"}
                className={cn(
                  "h-10 w-14 text-sm",
                  index === currentMonth && "bg-primary text-primary-foreground"
                )}
                onClick={() => handleMonthSelect(index)}
              >
                {month}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
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
