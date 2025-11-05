import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Calendar from "@/components/Calendar";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PerformanceRecordPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  const handleMonthChange = (date: Date | null) => {
    if (date) {
      setCurrentDate(date);
      setShowMonthPicker(false);
    }
  };

  const formatMonthYear = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-10 w-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              {formatMonthYear(currentDate)}
            </Button>
            {showMonthPicker && (
              <div className="absolute top-full left-0 mt-2 z-10">
                <ReactDatePicker
                  selected={currentDate}
                  onChange={handleMonthChange}
                  showMonthYearPicker
                  dateFormat="yyyy년 MM월"
                  locale={ko}
                  inline
                />
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-10 w-10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
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
