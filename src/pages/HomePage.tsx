import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDateToISO } from "@/lib/dateUtils";
import Layout from "@/components/Layout";
import Calendar from "@/components/Calendar";
import MonthPicker from "@/components/MonthPicker";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

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
      <div className="mb-6 flex items-center justify-between max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2">
          <MonthPicker value={currentDate} onChange={handleMonthChange} />
          <Button
            variant="outline"
            className="h-10"
            onClick={() => setCurrentDate(new Date())}
          >
            오늘
          </Button>
        </div>
        <Button
          onClick={() => navigate("/tickets/new")}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          새 기록 추가
        </Button>
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
