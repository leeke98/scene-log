import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    // 날짜를 YYYY-MM-DD 형식으로 변환하여 티켓 생성 페이지로 이동
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    navigate(`/tickets/new?date=${year}-${month}-${day}`);
    // 페이지 이동 후 스크롤을 맨 위로 이동
    window.scrollTo(0, 0);
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2">
          <MonthPicker value={currentDate} onChange={handleMonthChange} />
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
