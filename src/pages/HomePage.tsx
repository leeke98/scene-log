import { useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { formatDateToISO } from "@/lib/dateUtils";
import Layout from "@/components/Layout";
import Calendar from "@/components/Calendar";
import MonthPicker from "@/components/MonthPicker";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentDate = useMemo(() => {
    const month = searchParams.get("month");
    if (month) {
      const [y, m] = month.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  }, [searchParams]);

  const setCurrentDate = useCallback(
    (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      setSearchParams((prev) => {
        prev.set("month", `${y}-${m}`);
        return prev;
      });
    },
    [setSearchParams]
  );

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleDateClick = (date: Date) => {
    navigate(`/tickets/new?date=${formatDateToISO(date)}`);
    window.scrollTo(0, 0);
  };

  return (
    <Layout>
      <div className="mb-4 md:mb-6 max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MonthPicker value={currentDate} onChange={handleMonthChange} />
            <Button
              variant="outline"
              className="h-8 text-sm md:h-10 md:text-base"
              onClick={() => {
                setSearchParams((prev) => {
                  prev.delete("month");
                  return prev;
                });
              }}
            >
              오늘
            </Button>
          </div>
          <Button
            onClick={() => navigate("/tickets/new")}
            size="icon"
            className="md:hidden h-8 w-8 bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => navigate("/tickets/new")}
            className="hidden md:inline-flex h-10 bg-primary hover:bg-primary/90 text-white"
          >
            새 기록 추가
          </Button>
        </div>
      </div>

      <Calendar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onTicketClick={handleTicketClick}
        onDateClick={handleDateClick}
      />
    </Layout>
  );
}
