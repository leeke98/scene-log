// Mock 티켓 데이터 (공연기록 페이지 달력 표시용)
import type { Ticket } from "@/contexts/TicketContext";

// 현재 날짜 기준으로 이번 달에 표시될 수 있도록 날짜 설정
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1; // 1-12

// 이번 달 5일과 10일에 공연이 있다고 가정
const getDateString = (day: number) => {
  return `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
};

export const mockTickets: Omit<Ticket, "id">[] = [
  {
    date: getDateString(5),
    time: "20:00",
    performanceName: "지킬앤하이드",
    genre: "뮤지컬",
    isChild: false,
    theater: "블루스퀘어 신한카드홀",
    seat: "1층 15열 10번",
    casting: ["조정은", "홍광호"],
    ticketPrice: 140000,
    companion: "친구1",
    mdPrice: 50000,
    rating: 5,
    review: "완벽한 공연이었습니다. 주인공의 연기가 인상적이었어요.",
    posterUrl:
      "http://www.kopis.or.kr/upload/pfmPoster/PF_PF250136_240930_134639.gif",
  },
  {
    date: getDateString(10),
    time: "14:00",
    performanceName: "레미제라블",
    genre: "뮤지컬",
    isChild: false,
    theater: "샤롯데씨어터",
    seat: "1층 8열 10번",
    casting: ["류정한", "김호영"],
    ticketPrice: 180000,
    companion: "친구2",
    mdPrice: 80000,
    rating: 5,
    review: "명작의 재현",
    posterUrl:
      "http://www.kopis.or.kr/upload/pfmPoster/PF_PF225531_230908_141242.gif",
  },
  {
    date: getDateString(10),
    time: "19:00",
    performanceName: "지킬앤하이드",
    genre: "뮤지컬",
    isChild: false,
    theater: "블루스퀘어 신한카드홀",
    seat: "1층 15열 10번",
    casting: ["조정은", "홍광호"],
    ticketPrice: 140000,
    companion: "친구1",
    mdPrice: 50000,
    rating: 5,
    review: "완벽한 공연이었습니다. 주인공의 연기가 인상적이었어요.",
    posterUrl:
      "http://www.kopis.or.kr/upload/pfmPoster/PF_PF250136_240930_134639.gif",
  },
];
