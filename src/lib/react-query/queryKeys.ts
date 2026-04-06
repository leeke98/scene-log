/**
 * React Query Query Keys 중앙 관리
 *
 * 모든 query key는 여기서 정의하여 타입 안정성과 일관성을 보장합니다.
 * query key는 계층 구조로 구성하여 부분 무효화가 가능하도록 합니다.
 */

export const queryKeys = {
  // 인증 관련
  auth: {
    all: ["auth"] as const,
    currentUser: () => [...queryKeys.auth.all, "currentUser"] as const,
  },

  // 티켓 관련
  tickets: {
    all: ["tickets"] as const,
    lists: () => [...queryKeys.tickets.all, "list"] as const,
    list: (filters?: { yearMonth?: string; date?: string }) =>
      [...queryKeys.tickets.lists(), filters] as const,
    details: () => [...queryKeys.tickets.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tickets.details(), id] as const,
    month: (yearMonth: string) =>
      [...queryKeys.tickets.all, "month", yearMonth] as const,
    date: (date: string) => [...queryKeys.tickets.all, "date", date] as const,
  },

  // 리포트 관련
  reports: {
    all: ["reports"] as const,
    summary: (year?: string, month?: string, genre?: string, startDate?: string, endDate?: string) =>
      [...queryKeys.reports.all, "summary", year, month, genre, startDate, endDate] as const,
    monthly: (year?: string, genre?: string, startDate?: string, endDate?: string) =>
      [...queryKeys.reports.all, "monthly", year, genre, startDate, endDate] as const,
    weekly: (yearMonth?: string, genre?: string, startDate?: string, endDate?: string) =>
      [...queryKeys.reports.all, "weekly", yearMonth, genre, startDate, endDate] as const,
    dayOfWeek: (year?: string, month?: string, genre?: string, startDate?: string, endDate?: string) =>
      [...queryKeys.reports.all, "dayOfWeek", year, month, genre, startDate, endDate] as const,
    actors: (params?: {
      search?: string;
      year?: string;
      month?: string;
      startDate?: string;
      endDate?: string;
      genre?: string;
      page?: number;
      limit?: number;
    }) =>
      [
        ...queryKeys.reports.all,
        "actors",
        params?.search,
        params?.year,
        params?.month,
        params?.startDate,
        params?.endDate,
        params?.genre,
        params?.page,
        params?.limit,
      ] as const,
    actorDetail: (params: {
      actorId: string;
      year?: string;
      month?: string;
      startDate?: string;
      endDate?: string;
      genre?: string;
    }) =>
      [
        ...queryKeys.reports.all,
        "actorDetail",
        params.actorId,
        params.year,
        params.month,
        params.startDate,
        params.endDate,
        params.genre,
      ] as const,
    performances: (params?: {
      search?: string;
      year?: string;
      month?: string;
      startDate?: string;
      endDate?: string;
      genre?: string;
      page?: number;
      limit?: number;
    }) =>
      [
        ...queryKeys.reports.all,
        "performances",
        params?.search,
        params?.year,
        params?.month,
        params?.startDate,
        params?.endDate,
        params?.genre,
        params?.page,
        params?.limit,
      ] as const,
    performanceDetail: (params: {
      performanceName: string;
      year?: string;
      month?: string;
      startDate?: string;
      endDate?: string;
      genre?: string;
    }) =>
      [
        ...queryKeys.reports.all,
        "performanceDetail",
        params.performanceName,
        params.year,
        params.month,
        params.startDate,
        params.endDate,
        params.genre,
      ] as const,
    grass: () => [...queryKeys.reports.all, "grass"] as const,
  },

  // 위시리스트 관련
  marks: {
    all: ["marks"] as const,
    list: () => [...queryKeys.marks.all, "list"] as const,
  },

  // KOPIS API 관련
  kopis: {
    all: ["kopis"] as const,
    performances: (params?: {
      searchTerm?: string;
      startDate?: string;
      endDate?: string;
      genre?: "AAAA" | "GGGA";
      page?: number;
      rows?: number;
    }) =>
      [
        ...queryKeys.kopis.all,
        "performances",
        params?.searchTerm,
        params?.startDate,
        params?.endDate,
        params?.genre,
        params?.page,
        params?.rows,
      ] as const,
    performanceDetail: (mt20id: string) =>
      [...queryKeys.kopis.all, "performanceDetail", mt20id] as const,
    boxOffice: (params?: {
      genre?: "연극" | "뮤지컬";
      stdate?: string;
      eddate?: string;
    }) =>
      [
        ...queryKeys.kopis.all,
        "boxOffice",
        params?.genre,
        params?.stdate,
        params?.eddate,
      ] as const,
  },
} as const;
