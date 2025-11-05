import { useTickets } from "@/contexts/TicketContext";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "@/components/Calendar.css";

interface CalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onTicketClick: (ticketId: string) => void;
}

export default function PerformanceCalendar({
  currentDate,
  onDateChange,
  onTicketClick,
}: CalendarProps) {
  const { getTicketsByDate } = useTickets();

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dateStr = formatDate(date);
    const tickets = getTicketsByDate(dateStr);

    return (
      <div className="calendar-tile-content">
        <div className="calendar-day-number">{date.getDate()}</div>
        {tickets.length > 0 && (
          <div className={`calendar-tickets ${tickets.length === 1 ? "single-ticket" : ""}`}>
            {tickets.length === 1 ? (
              // 티켓이 하나인 경우: 한 칸을 꽉 채워서 표시
              <button
                key={tickets[0].id}
                onClick={(e) => {
                  e.stopPropagation();
                  onTicketClick(tickets[0].id);
                }}
                className="calendar-ticket-poster single"
                title={`${tickets[0].performanceName}${tickets[0].time ? ` (${tickets[0].time})` : ""}`}
              >
                {tickets[0].posterUrl ? (
                  <img
                    src={tickets[0].posterUrl}
                    alt={tickets[0].performanceName}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      if (target.nextElementSibling) {
                        (
                          target.nextElementSibling as HTMLElement
                        ).style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`calendar-ticket-fallback ${
                    tickets[0].posterUrl ? "hidden" : ""
                  }`}
                >
                  {tickets[0].performanceName}
                </div>
              </button>
            ) : (
              // 티켓이 여러 개인 경우: 칸을 나눠서 표시
              <>
                {tickets.slice(0, 3).map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTicketClick(ticket.id);
                    }}
                    className="calendar-ticket-poster"
                    title={`${ticket.performanceName}${ticket.time ? ` (${ticket.time})` : ""}`}
                  >
                    {ticket.posterUrl ? (
                      <img
                        src={ticket.posterUrl}
                        alt={ticket.performanceName}
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          if (target.nextElementSibling) {
                            (
                              target.nextElementSibling as HTMLElement
                            ).style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`calendar-ticket-fallback ${
                        ticket.posterUrl ? "hidden" : ""
                      }`}
                    >
                      {ticket.performanceName}
                    </div>
                  </button>
                ))}
                {tickets.length > 3 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTicketClick(tickets[0].id);
                    }}
                    className="calendar-ticket-more cursor-pointer hover:bg-gray-100 rounded"
                    title={`총 ${tickets.length}개의 공연이 있습니다`}
                  >
                    +{tickets.length - 3}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // 요일을 일요일부터 시작하도록 설정
  const formatShortWeekday = (_locale: string | undefined, date: Date) => {
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    return weekdays[date.getDay()];
  };

  return (
    <div className="w-full performance-calendar-wrapper">
      <Calendar
        onChange={(value) => {
          if (value instanceof Date) {
            onDateChange(value);
          }
        }}
        value={currentDate}
        tileContent={tileContent}
        className="performance-calendar"
        formatDay={(_locale, _date) => ""}
        formatShortWeekday={formatShortWeekday}
        showNeighboringMonth={true}
        locale="ko-KR"
        calendarType="gregory"
      />
    </div>
  );
}
