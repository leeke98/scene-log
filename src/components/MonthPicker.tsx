"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { cn } from "@/lib/utils";
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

const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

export default function MonthPicker({ value, onChange, className }: MonthPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const currentYear = value.getFullYear();
  const currentMonth = value.getMonth();

  const handleMonthSelect = (monthIndex: number) => {
    onChange(new Date(currentYear, monthIndex, 1));
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
    <div className={cn("flex items-center", className)}>
      {/* Pill 컨테이너 */}
      <div className="flex items-center rounded-lg border border-input bg-background shadow-sm overflow-hidden">
        <button
          onClick={handlePrevious}
          className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="이전 달"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border" />

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button className="h-8 md:h-10 px-3 text-sm font-medium hover:bg-accent transition-colors min-w-[96px] text-center">
              {format(value, "yyyy년 MM월", { locale: ko })}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="center" collisionPadding={16}>
            {/* 연도 선택 */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
              <button
                onClick={() => handleYearChange(-1)}
                className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="이전 연도"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold">{currentYear}년</span>
              <button
                onClick={() => handleYearChange(1)}
                className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="다음 연도"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 월 그리드 */}
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((month, index) => (
                <button
                  key={index}
                  onClick={() => handleMonthSelect(index)}
                  className={cn(
                    "h-9 rounded-md text-sm font-medium transition-colors",
                    index === currentMonth
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {month}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-5 bg-border" />

        <button
          onClick={handleNext}
          className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="다음 달"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
