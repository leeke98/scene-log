import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";

interface DatePickerProps {
  type: "year" | "month";
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DatePicker({
  type,
  selectedDate,
  onDateChange,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date) => {
    if (type === "year") {
      return `${date.getFullYear()}년`;
    } else {
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      onDateChange(date);
      setShowPicker(false);
    }
  };

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    if (type === "year") {
      newDate.setFullYear(newDate.getFullYear() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (type === "year") {
      newDate.setFullYear(newDate.getFullYear() + 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        className="h-10 w-10"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-2"
        >
          <CalendarIcon className="w-4 h-4" />
          {formatDate(selectedDate)}
        </Button>
        {showPicker && (
          <div className="absolute top-full left-0 mt-2 z-10">
            <ReactDatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              showYearPicker={type === "year"}
              showMonthYearPicker={type === "month"}
              dateFormat={type === "year" ? "yyyy년" : "yyyy년 MM월"}
              locale={ko}
              inline
            />
          </div>
        )}
      </div>
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

