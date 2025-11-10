import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: string; // YYYY-MM-DD 형식
  onChange: (date: string | null) => void;
  placeholder?: string;
  className?: string;
  size?: "default" | "small"; // 캘린더 크기 옵션
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "날짜 선택",
  className,
  size = "default",
}: DatePickerProps) {
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange(null);
    }
  };

  const selectedDate = value
    ? (() => {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
      })()
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(
              (() => {
                const [year, month, day] = value.split("-").map(Number);
                return new Date(year, month - 1, day);
              })(),
              "yyyy년 MM월 dd일 EEEE",
              { locale: ko }
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-[var(--radix-popover-trigger-width)] p-3",
          size === "small" && "p-2"
        )}
        align="start"
      >
        <Calendar
          mode="single"
          required
          selected={selectedDate}
          onSelect={handleDateChange}
          initialFocus
          locale={ko}
          captionLayout="dropdown"
          formatters={{
            formatMonthDropdown: (date) => `${date.getMonth() + 1}월`,
            formatYearDropdown: (date) => `${date.getFullYear()}년`,
          }}
          style={
            size === "small"
              ? ({ "--cell-size": "1.5rem" } as React.CSSProperties)
              : undefined
          }
          className={size === "small" ? "p-1" : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
