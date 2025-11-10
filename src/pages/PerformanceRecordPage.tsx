import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Calendar from "@/components/Calendar";
import MonthPicker from "@/components/MonthPicker";
import { Button } from "@/components/ui/button";

export default function PerformanceRecordPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2">
          <MonthPicker value={currentDate} onChange={handleMonthChange} />
        </div>
        <Button
          onClick={() => navigate("/tickets/new")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          티켓 생성
        </Button>
      </div>

      <Calendar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onTicketClick={handleTicketClick}
      />
    </Layout>
  );
}
