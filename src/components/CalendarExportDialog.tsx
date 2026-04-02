import { useRef, useState, useCallback, useMemo } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/components/Calendar.css";
import { useTicketsByMonth } from "@/queries/tickets";
import type { CalendarTicket } from "@/services/ticketApi";
import { API_BASE_URL } from "@/lib/apiClient";
import { useUiStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CalendarExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: Date;
}

export default function CalendarExportDialog({
  open,
  onOpenChange,
  currentDate,
}: CalendarExportDialogProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const theme = useUiStore((s) => s.theme);

  const currentYearMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }, [currentDate]);

  const { data: monthTickets = [] } = useTicketsByMonth(currentYearMonth);

  const ticketsByDate = useMemo(() => {
    const grouped: Record<string, CalendarTicket[]> = {};
    monthTickets.forEach((ticket) => {
      if (!grouped[ticket.date]) {
        grouped[ticket.date] = [];
      }
      grouped[ticket.date].push(ticket);
    });
    return grouped;
  }, [monthTickets]);

  const toProxyUrl = (url: string) => {
    if (url.startsWith("https://")) return url;
    return `${API_BASE_URL}/proxy/image?url=${encodeURIComponent(url)}`;
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const parts = time.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dateStr = formatDate(date);
    const tickets = ticketsByDate[dateStr] || [];

    const dayOfWeek = date.getDay();
    const dayClass =
      dayOfWeek === 0 ? "sunday" : dayOfWeek === 6 ? "saturday" : "";

    return (
      <div className="calendar-tile-content">
        <div className="calendar-day-header">
          <div className={`calendar-day-number ${dayClass}`}>
            {date.getDate()}
          </div>
        </div>
        {tickets.length > 0 && (
          <div
            className={`calendar-tickets ${
              tickets.length === 1 ? "single-ticket" : ""
            }`}
          >
            {tickets.length === 1 ? (
              <div className="calendar-ticket-poster single">
                {tickets[0].posterUrl ? (
                  <img
                    src={toProxyUrl(tickets[0].posterUrl)}
                    alt="공연 포스터"
                    className="w-full h-full object-cover"
                  />
                ) : null}
                <div
                  className={`calendar-ticket-fallback ${
                    tickets[0].posterUrl ? "hidden" : ""
                  }`}
                >
                  {tickets[0].time ? formatTime(tickets[0].time) : "공연"}
                </div>
                {tickets[0].time && (
                  <div className="calendar-ticket-overlay">
                    {formatTime(tickets[0].time)}
                  </div>
                )}
              </div>
            ) : (
              <>
                {tickets.slice(0, 3).map((ticket) => (
                  <div key={ticket.id} className="calendar-ticket-poster">
                    {ticket.posterUrl ? (
                      <img
                        src={toProxyUrl(ticket.posterUrl)}
                        alt="공연 포스터"
                        className="w-full h-full object-cover"
                          />
                    ) : null}
                    <div
                      className={`calendar-ticket-fallback ${
                        ticket.posterUrl ? "hidden" : ""
                      }`}
                    >
                      {ticket.time ? formatTime(ticket.time) : "공연"}
                    </div>
                    {ticket.time && (
                      <div className="calendar-ticket-overlay">
                        {formatTime(ticket.time)}
                      </div>
                    )}
                  </div>
                ))}
                {tickets.length > 3 && (
                  <div className="calendar-ticket-more">
                    +{tickets.length - 3}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const formatShortWeekday = (_locale: string | undefined, date: Date) => {
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    return weekdays[date.getDay()];
  };

  const inlineImages = async (container: HTMLElement) => {
    const imgs = container.querySelectorAll<HTMLImageElement>("img");
    const originals: { img: HTMLImageElement; src: string }[] = [];

    await Promise.all(
      Array.from(imgs).map(async (img) => {
        if (!img.src || img.src.startsWith("data:")) return;
        try {
          const res = await fetch(img.src);
          const blob = await res.blob();
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          originals.push({ img, src: img.src });
          img.src = dataUrl;
        } catch {
          // 변환 실패 시 원본 유지
        }
      })
    );

    return originals;
  };

  const handleDownload = useCallback(async () => {
    if (!captureRef.current) return;

    setIsExporting(true);
    let originals: { img: HTMLImageElement; src: string }[] = [];
    try {
      originals = await inlineImages(captureRef.current);

      const bgColor = theme === "dark" ? "#020817" : "#ffffff";
      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 2,
        backgroundColor: bgColor,
      });

      const link = document.createElement("a");
      link.download = `scene-log-${currentYearMonth}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert("이미지 내보내기에 실패했습니다. 다시 시도해주세요.");
    } finally {
      originals.forEach(({ img, src }) => (img.src = src));
      setIsExporting(false);
    }
  }, [currentYearMonth, theme]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle>달력 이미지 내보내기</DialogTitle>
          <DialogDescription>
            미리보기를 확인하고 다운로드 버튼을 눌러 이미지로 저장하세요.
          </DialogDescription>
        </DialogHeader>

        {/* 캡처 영역 */}
        <div
          ref={captureRef}
          className="bg-background rounded-lg p-4 sm:p-6"
        >
          {/* 연/월 헤더 */}
          <div className="text-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {format(currentDate, "yyyy년 MM월", { locale: ko })}
            </h2>
          </div>

          {/* 달력 */}
          <div className="w-full performance-calendar-wrapper calendar-export-mode">
            <Calendar
              value={currentDate}
              tileContent={tileContent}
              className="performance-calendar"
              formatDay={() => ""}
              formatShortWeekday={formatShortWeekday}
              showNeighboringMonth={true}
              locale="ko-KR"
              calendarType="gregory"
            />
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleDownload} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                내보내는 중...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
