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
    summary: (year?: string, month?: string) =>
      [...queryKeys.reports.all, "summary", year, month] as const,
    monthly: (year?: string) =>
      [...queryKeys.reports.all, "monthly", year] as const,
    weekly: (yearMonth?: string) =>
      [...queryKeys.reports.all, "weekly", yearMonth] as const,
    dayOfWeek: (year?: string, month?: string) =>
      [...queryKeys.reports.all, "dayOfWeek", year, month] as const,
    actors: (params?: {
      search?: string;
      year?: string;
      month?: string;
      page?: number;
      limit?: number;
    }) =>
      [
        ...queryKeys.reports.all,
        "actors",
        params?.search,
        params?.year,
        params?.month,
        params?.page,
        params?.limit,
      ] as const,
    actorDetail: (params: {
      actorName: string;
      year?: string;
      month?: string;
    }) =>
      [
        ...queryKeys.reports.all,
        "actorDetail",
        params.actorName,
        params.year,
        params.month,
      ] as const,
    performances: (params?: {
      search?: string;
      year?: string;
      month?: string;
      page?: number;
      limit?: number;
    }) =>
      [
        ...queryKeys.reports.all,
        "performances",
        params?.search,
        params?.year,
        params?.month,
        params?.page,
        params?.limit,
      ] as const,
    performanceDetail: (params: {
      performanceName: string;
      year?: string;
      month?: string;
    }) =>
      [
        ...queryKeys.reports.all,
        "performanceDetail",
        params.performanceName,
        params.year,
        params.month,
      ] as const,
    grass: () => [...queryKeys.reports.all, "grass"] as const,
  },
} as const;
