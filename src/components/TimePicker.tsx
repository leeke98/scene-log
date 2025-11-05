import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimePickerProps {
  value: string; // "HH:MM" 형식
  onChange: (time: string) => void;
  className?: string;
}

export default function TimePicker({
  value,
  onChange,
  className = "",
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

  // value를 시간과 분으로 분리
  let [hour, minute] = value.split(":").map(Number);

  // 분이 10분 단위가 아니면 가장 가까운 10분 단위로 조정
  const minutes = [0, 10, 20, 30, 40, 50];
  const adjustedMinute = minutes.reduce((prev, curr) =>
    Math.abs(curr - minute) < Math.abs(prev - minute) ? curr : prev
  );

  // 조정된 분이 다르면 onChange 호출
  useEffect(() => {
    if (minute !== adjustedMinute) {
      const newTime = `${String(hour).padStart(2, "0")}:${String(
        adjustedMinute
      ).padStart(2, "0")}`;
      onChange(newTime);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  minute = adjustedMinute;

  // 24시간 형식 시간 배열 (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // 외부 클릭 시 닫기 및 선택된 항목으로 스크롤
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);

      // 선택된 항목으로 스크롤
      setTimeout(() => {
        if (hourScrollRef.current) {
          const selectedHourElement = hourScrollRef.current.querySelector(
            `button[data-hour="${hour}"]`
          );
          if (selectedHourElement) {
            selectedHourElement.scrollIntoView({
              block: "center",
              behavior: "smooth",
            });
          }
        }

        if (minuteScrollRef.current) {
          const selectedMinuteElement = minuteScrollRef.current.querySelector(
            `button[data-minute="${minute}"]`
          );
          if (selectedMinuteElement) {
            selectedMinuteElement.scrollIntoView({
              block: "center",
              behavior: "smooth",
            });
          }
        }
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, hour, minute]);

  const handleHourSelect = (selectedHour: number) => {
    const newTime = `${String(selectedHour).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")}`;
    onChange(newTime);
  };

  const handleMinuteSelect = (selectedMinute: number) => {
    const newTime = `${String(hour).padStart(2, "0")}:${String(
      selectedMinute
    ).padStart(2, "0")}`;
    onChange(newTime);
  };

  const displayValue = `${String(hour).padStart(2, "0")}:${String(
    minute
  ).padStart(2, "0")}`;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 시간 선택 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-32 items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground"
      >
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{displayValue}</span>
      </button>

      {/* 시간 선택 드롭다운 */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 flex gap-2 rounded-lg border border-border bg-white p-4 shadow-lg">
          {/* 시간 선택 컬럼 */}
          <div className="flex flex-col">
            <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
              시간
            </div>
            <div
              ref={hourScrollRef}
              className="max-h-48 overflow-y-auto scroll-smooth"
            >
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  data-hour={h}
                  onClick={() => handleHourSelect(h)}
                  className={`w-12 rounded px-2 py-1.5 text-sm transition-colors ${
                    h === hour
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {String(h).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>

          {/* 분 선택 컬럼 */}
          <div className="flex flex-col">
            <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
              분
            </div>
            <div
              ref={minuteScrollRef}
              className="max-h-48 overflow-y-auto scroll-smooth"
            >
              {minutes.map((m) => (
                <button
                  key={m}
                  type="button"
                  data-minute={m}
                  onClick={() => handleMinuteSelect(m)}
                  className={`w-12 rounded px-2 py-1.5 text-sm transition-colors ${
                    m === minute
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {String(m).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
