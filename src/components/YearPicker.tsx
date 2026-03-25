"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface YearPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
  startYear?: number;
  endYear?: number;
}

export default function YearPicker({
  value,
  onChange,
  className,
  startYear,
  endYear,
}: YearPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const currentYear = value.getFullYear();
  const now = new Date();

  const start = startYear ?? now.getFullYear() - 10;
  const end = endYear ?? now.getFullYear() + 5;
  const years: number[] = [];
  for (let y = start; y <= end; y++) {
    years.push(y);
  }

  const handleYearSelect = (year: number) => {
    const newDate = new Date(value);
    newDate.setFullYear(year);
    onChange(newDate);
    setIsOpen(false);
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
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center rounded-lg border border-input bg-background shadow-sm overflow-hidden">
        <button
          onClick={handlePrevious}
          className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="이전 연도"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border" />

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button className="h-8 md:h-10 px-3 text-sm font-medium hover:bg-accent transition-colors min-w-[80px] text-center">
              {currentYear}년
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="center" collisionPadding={16}>
            <div className="grid grid-cols-4 gap-1.5 max-h-[240px] overflow-y-auto">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className={cn(
                    "h-9 rounded-md text-sm font-medium transition-colors",
                    year === currentYear
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-5 bg-border" />

        <button
          onClick={handleNext}
          className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="다음 연도"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
