import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { mockTickets } from "@/data/mockTickets";

export interface Ticket {
  id: string;
  date: string; // YYYY-MM-DD 형식
  time?: string; // HH:MM 형식 (공연 시간)
  performanceName: string; // 정규화된 작품명 (띄어쓰기 통일, [지역] 제거)
  genre?: "연극" | "뮤지컬"; // 장르 정보
  isChild?: boolean; // 어린이 공연 여부 (true: 어린이, false: 성인)
  theater: string; // 정규화된 극장명
  seat: string;
  casting: string[]; // 배우 목록 (배열)
  ticketPrice: number;
  companion?: string;
  mdPrice: number;
  rating: number;
  review: string;
  posterUrl?: string; // KOPIS API에서 받은 포스터 URL
}

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, "id">) => void;
  updateTicket: (id: string, ticket: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  getTicket: (id: string) => Ticket | undefined;
  getTicketsByDate: (date: string) => Ticket[];
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const stored = localStorage.getItem("tickets");
    if (stored) {
      return JSON.parse(stored);
    }
    // localStorage에 데이터가 없으면 mock 데이터 사용
    const mockTicketsWithId = mockTickets.map((ticket, index) => ({
      ...ticket,
      id: `mock_${Date.now()}_${index}`,
    }));
    // mock 데이터를 localStorage에 저장하지 않고 메모리에서만 사용
    return mockTicketsWithId;
  });

  const saveTickets = (newTickets: Ticket[]) => {
    setTickets(newTickets);
    localStorage.setItem("tickets", JSON.stringify(newTickets));
  };

  const addTicket = (ticketData: Omit<Ticket, "id">) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: Date.now().toString(),
    };
    const updatedTickets = [...tickets, newTicket];
    saveTickets(updatedTickets);
  };

  const updateTicket = (id: string, ticketData: Partial<Ticket>) => {
    const updatedTickets = tickets.map((ticket) =>
      ticket.id === id ? { ...ticket, ...ticketData } : ticket
    );
    saveTickets(updatedTickets);
  };

  const deleteTicket = (id: string) => {
    const updatedTickets = tickets.filter((ticket) => ticket.id !== id);
    saveTickets(updatedTickets);
  };

  const getTicket = (id: string) => {
    return tickets.find((ticket) => ticket.id === id);
  };

  const getTicketsByDate = (date: string) => {
    return tickets.filter((ticket) => ticket.date === date);
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        addTicket,
        updateTicket,
        deleteTicket,
        getTicket,
        getTicketsByDate,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error("useTickets must be used within a TicketProvider");
  }
  return context;
}
