// 리포트 관련 타입 정의

export interface TicketSummary {
  totalCount: number; // 총 관람 수
  totalTicketPrice: number; // 총 금액
  totalMdPrice: number; // 총 MD 금액
  uniquePerformances: number; // 총 관람 작품 수
  mostViewedActor: {
    name: string;
    count: number;
  }; // 가장 많이 본 배우
  mostViewedPerformance: {
    name: string;
    count: number;
  }; // 가장 많이 본 작품
  mostViewedTheater: {
    name: string;
    count: number;
  }; // 가장 많이 간 극장
}

export interface MonthlyStats {
  yearMonth: string; // YYYY-MM 형식
  count: number; // 관람 수
  totalPrice: number; // 총 금액
}

export interface WeeklyStats {
  yearWeek: string; // YYYY-WW 형식
  count: number; // 관람 수
  totalPrice: number; // 총 금액
}

export interface DayOfWeekStats {
  dayOfWeek: string; // "일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"
  count: number; // 관람 수
}

export interface ActorStats {
  name: string; // 배우 이름
  viewCount: number; // 총 관람 횟수
  totalTicketPrice: number; // 관람 금액
  uniquePerformances: number; // 본 작품 수
  performanceList: string[]; // 본 작품 목록
}

export interface PerformanceStats {
  name: string; // 작품명
  viewCount: number; // 관극 회수
  totalTicketPrice: number; // 관극 금액
  avgRating: number; // 후기 별점 평균
  firstViewed: string; // 첫 관람일 (YYYY-MM-DD)
  lastViewed: string; // 마지막 관람일 (YYYY-MM-DD)
  posterUrl?: string; // 포스터 URL
  genre?: "연극" | "뮤지컬"; // 장르
}

export interface Top10Performance {
  performanceName: string;
  count: number;
  posterUrl?: string;
}

export interface GrassData {
  date: string; // YYYY-MM-DD 형식
  count: number; // 해당 날짜의 관람 수
}

export interface ReportFilter {
  type: "year" | "month" | "cumulative"; // 필터 타입
  year?: string; // 연도 (YYYY)
  month?: string; // 월 (YYYY-MM)
}

export interface ActorDetail {
  actor: ActorStats;
  tickets: Array<{
    id: string;
    date: string;
    performanceName: string;
    theater: string;
    seat: string;
    rating: number;
    posterUrl?: string;
  }>;
}

export interface PerformanceDetail {
  performance: PerformanceStats;
  tickets: Array<{
    id: string;
    date: string;
    theater: string;
    seat: string;
    rating: number;
    review?: string;
  }>;
}

// KOPIS API 관련 (탐색 탭)
export interface WeeklyRanking {
  ranking: number;
  performanceName: string;
  theater: string;
  genre: string;
  area: string;
  posterUrl?: string;
}

export interface CurrentPerformance {
  performanceName: string;
  theater: string;
  startDate: string;
  endDate: string;
  genre: string;
  area: string;
  posterUrl?: string;
  prfstate: string; // 공연 상태
}
