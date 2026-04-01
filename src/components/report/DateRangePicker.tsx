import { useState, useRef } from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
}

function toDate(str: string): Date | undefined {
  if (!str) return undefined;
  const d = parseISO(str);
  return isValid(d) ? d : undefined;
}

function parseTyped(str: string): Date | undefined {
  // 지원 형식: YYYY-MM-DD, YYYY.MM.DD, YYYYMMDD
  const cleaned = str.replace(/[.\s]/g, "-");
  const d = parse(cleaned, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

interface DateInputProps {
  value: string;       // YYYY-MM-DD
  onChange: (v: string) => void;
  placeholder: string;
  align: "start" | "end";
  disabledFn?: (date: Date) => boolean;
}

function DateInput({ value, onChange, placeholder, align, disabledFn }: DateInputProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // 달력에서 날짜 선택 시
  const handleSelect = (date: Date | undefined) => {
    const str = date ? format(date, "yyyy-MM-dd") : "";
    onChange(str);
    setInputText(str);
    setOpen(false);
  };

  // 키보드 입력 중 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputText(raw);
    const parsed = parseTyped(raw);
    if (parsed) {
      onChange(format(parsed, "yyyy-MM-dd"));
    } else if (raw === "") {
      onChange("");
    }
  };

  // 포커스 시 달력 열기
  const handleFocus = () => setOpen(true);

  // 달력 밖 클릭 시 닫힐 때 입력 텍스트 정규화
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // 팝오버 닫힐 때 표시 텍스트를 현재 유효값으로 정규화
      setInputText(value);
    }
    setOpen(next);
  };

  const selectedDate = toDate(value);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {/* asChild 내부에서 input을 직접 쓰면 ref 전달이 복잡하므로 div wrapper 사용 */}
        <div
          className={cn(
            "flex items-center gap-1 h-8 md:h-10 px-1.5 md:px-2.5",
            "rounded-lg border border-input bg-background",
            "focus-within:ring-1 focus-within:ring-ring",
            "cursor-text min-w-0"
          )}
          onClick={() => inputRef.current?.focus()}
        >
          <CalendarIcon className="w-3 h-3 md:w-3.5 md:h-3.5 text-muted-foreground shrink-0 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            className={cn(
              "w-[4rem] md:w-24 bg-transparent text-xs md:text-sm outline-none min-w-0",
              "placeholder:text-muted-foreground"
            )}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
          locale={ko}
          disabled={disabledFn}
        />
      </PopoverContent>
    </Popover>
  );
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: DateRangePickerProps) {
  const start = toDate(startDate);
  const end = toDate(endDate);

  const handleStartChange = (v: string) => {
    onStartChange(v);
    // 시작일이 종료일보다 늦어지면 종료일 초기화
    const newStart = toDate(v);
    if (newStart && end && newStart > end) {
      onEndChange("");
    }
  };

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <DateInput
        value={startDate}
        onChange={handleStartChange}
        placeholder="시작일"
        align="start"
        disabledFn={end ? (date) => date > end : undefined}
      />
      <span className="text-muted-foreground text-xs md:text-sm shrink-0">~</span>
      <DateInput
        value={endDate}
        onChange={onEndChange}
        placeholder="종료일"
        align="end"
        disabledFn={start ? (date) => date < start : undefined}
      />
    </div>
  );
}
