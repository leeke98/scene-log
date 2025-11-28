// KOPIS API는 백엔드를 통해 호출하므로 서비스 키는 백엔드에서 관리
import { apiGet } from "@/lib/apiClient";

export interface KopisPerformance {
  mt20id: string; // 공연 ID
  prfnm: string; // 공연명
  prfpdfrom: string; // 공연 시작일
  prfpdto: string; // 공연 종료일
  fcltynm: string; // 시설명(극장)
  poster: string; // 포스터 URL
  area: string; // 지역
  genrenm: string; // 장르명
  openrun: string; // 오픈런 여부
  prfstate: string; // 공연 상태
}

export interface KopisPerformanceDetail extends KopisPerformance {
  prfcast?: string; // 캐스팅
  prfcrew?: string; // 제작진
  prfruntime?: string; // 공연 시간
  prfage?: string; // 관람 연령
  pcseguidance?: string; // 가격 안내
  dtguidance?: string; // 시간 안내
  mt10id?: string; // 시설 ID
  // 추가 필드들
  [key: string]: string | undefined;
}

/**
 * 공연 목록 검색
 * @param searchTerm 작품명
 * @param startDate 검색 시작일 (YYYYMMDD 형식)
 * @param endDate 검색 종료일 (YYYYMMDD 형식, 기본값: 오늘)
 * @param genre 장르 코드 (AAAA: 연극, GGGA: 뮤지컬)
 * @param page 페이지 번호 (기본값: 1)
 * @param rows 페이지당 결과 수 (기본값: 20)
 */
export async function searchPerformances(
  searchTerm: string,
  startDate?: string,
  endDate?: string,
  genre?: "AAAA" | "GGGA",
  page: number = 1,
  rows: number = 20
): Promise<KopisPerformance[]> {
  // startDate가 없으면 사용자가 선택한 날짜로 설정 (없으면 1년 전)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const startDateStr =
    startDate ||
    `${oneYearAgo.getFullYear()}${String(oneYearAgo.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(oneYearAgo.getDate()).padStart(2, "0")}`;

  // endDate 계산: startDate 기준 최대 31일 후
  let endDateStr: string;
  if (endDate) {
    // endDate가 명시적으로 제공된 경우
    endDateStr = endDate;
  } else if (startDate) {
    // startDate가 있으면 startDate + 31일로 설정
    const startDateObj = new Date(
      parseInt(startDate.substring(0, 4)),
      parseInt(startDate.substring(4, 6)) - 1,
      parseInt(startDate.substring(6, 8))
    );
    const maxEndDate = new Date(startDateObj);
    maxEndDate.setDate(maxEndDate.getDate() + 31);

    const today = new Date();
    // startDate + 31일과 오늘 중 더 작은 값 사용
    const finalEndDate = maxEndDate < today ? maxEndDate : today;

    endDateStr = `${finalEndDate.getFullYear()}${String(
      finalEndDate.getMonth() + 1
    ).padStart(2, "0")}${String(finalEndDate.getDate()).padStart(2, "0")}`;
  } else {
    // 둘 다 없으면 오늘 날짜로 설정
    const today = new Date();
    endDateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(today.getDate()).padStart(2, "0")}`;
  }

  // 백엔드 API 호출
  const queryParams = new URLSearchParams();
  queryParams.append("stdate", startDateStr);
  queryParams.append("eddate", endDateStr);
  queryParams.append("page", page.toString());
  queryParams.append("limit", rows.toString());

  if (searchTerm) {
    queryParams.append("search", searchTerm);
  }

  // 장르 코드를 한글로 변환 (AAAA -> 연극, GGGA -> 뮤지컬)
  if (genre) {
    const genreKorean = genre === "AAAA" ? "연극" : "뮤지컬";
    queryParams.append("genre", genreKorean);
  }

  const endpoint = `/kopis/performances${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  return apiGet<KopisPerformance[]>(endpoint);
}

/**
 * 작품명 정규화 함수
 * - [지역] 표시 제거: "지킬앤하이드 [광주]" → "지킬앤하이드"
 * - 대괄호가 없는 버전이 진짜 작품명이므로, 대괄호를 제거한 후 정규화
 * - 띄어쓰기 통일화 (연속된 공백을 하나로, 앞뒤 공백 제거)
 *
 * @param prfnm 작품명
 * @param referenceName 참고할 작품명 (대괄호 없는 버전이 있다면 그것을 우선 사용)
 */
export function normalizePerformanceName(
  prfnm: string,
  referenceName?: string
): string {
  if (!prfnm) return "";

  // 참고 작품명이 있고 대괄호가 없다면 그것을 기준으로 사용
  if (referenceName && !referenceName.includes("[")) {
    // referenceName의 대괄호 제거 및 공백 정리
    let ref = referenceName
      .replace(/\s*\[[^\]]+\]\s*/g, "")
      .trim()
      .replace(/\s+/g, " ");
    if (ref) {
      // 현재 작품명에서 대괄호 제거 후 비교
      let current = prfnm
        .replace(/\s*\[[^\]]+\]\s*/g, "")
        .trim()
        .replace(/\s+/g, " ");
      // 대괄호 제거 후 공백만 제거한 버전이 같은지 확인 (대소문자 무시, 공백 무시)
      const currentNormalized = current.replace(/\s+/g, "").toLowerCase();
      const refNormalized = ref.replace(/\s+/g, "").toLowerCase();
      if (currentNormalized === refNormalized) {
        return ref; // 참고 작품명 사용
      }
    }
  }

  // 1. [지역] 패턴 제거 (예: [광주], [전주], [부산] 등)
  let normalized = prfnm.replace(/\s*\[[^\]]+\]\s*/g, "");

  // 2. 앞뒤 공백 제거
  normalized = normalized.trim();

  // 3. 연속된 공백을 하나로 통일 (띄어쓰기 통일화)
  normalized = normalized.replace(/\s+/g, " ");

  return normalized;
}

/**
 * 극장명 정제 함수
 * "(구. ...)" 형태는 제거하고, 맨 뒤의 괄호는 제거하고 내용만 유지
 * 중첩된 괄호도 처리: "블루스퀘어 (신한카드홀 (구. 인터파크홀) )" → "블루스퀘어 신한카드홀"
 * 예: "논산아트센터(구. 논산문화예술회관) (대공연장)" → "논산아트센터 대공연장"
 *
 * 추가 처리:
 * - "드림씨어터 [부산] (드림씨어터 [부산] )" → "드림씨어터 부산"
 * - "계명아트센터 (계명아트센터)" → "계명아트센터"
 */
export function cleanTheaterName(fcltynm: string): string {
  if (!fcltynm) return "";

  // 1. "(구. ...)" 패턴을 먼저 모두 제거 (중첩된 것 포함)
  let cleaned = fcltynm.replace(/\(구\.\s*[^)]+\)/g, "");

  // 2. 앞뒤 공백 정리
  cleaned = cleaned.trim();

  // 3. 공백이 연속된 경우 하나로 정리
  cleaned = cleaned.replace(/\s+/g, " ");

  // 4. 맨 뒤의 괄호 패턴 찾기 (중첩된 괄호도 처리)
  // 가장 바깥쪽 닫는 괄호를 찾고, 그 앞의 열리는 괄호를 찾아서 내용만 추출
  let lastCloseParen = cleaned.lastIndexOf(")");

  if (lastCloseParen !== -1) {
    // 닫는 괄호 앞에서 열리는 괄호를 찾기 (가장 가까운 열리는 괄호)
    let openParen = -1;
    let depth = 0;

    for (let i = lastCloseParen - 1; i >= 0; i--) {
      if (cleaned[i] === ")") {
        depth++;
      } else if (cleaned[i] === "(") {
        if (depth === 0) {
          openParen = i;
          break;
        }
        depth--;
      }
    }

    // 열리는 괄호를 찾았다면 그 사이의 내용 처리
    if (openParen !== -1) {
      const beforeParen = cleaned.substring(0, openParen).trim();
      const insideParen = cleaned
        .substring(openParen + 1, lastCloseParen)
        .trim();
      const afterParen = cleaned.substring(lastCloseParen + 1).trim();

      // [지역] 패턴 추출 (괄호 안과 밖 모두)
      const beforeRegionMatch = beforeParen.match(/\[([^\]]+)\]/);
      const insideRegionMatch = insideParen.match(/\[([^\]]+)\]/);

      // [지역] 제거 후 비교
      const beforeWithoutRegion = beforeParen
        .replace(/\s*\[[^\]]+\]\s*/g, " ")
        .trim()
        .replace(/\s+/g, " ");
      const insideWithoutRegion = insideParen
        .replace(/\s*\[[^\]]+\]\s*/g, " ")
        .trim()
        .replace(/\s+/g, " ");

      // 괄호 안의 내용이 앞부분과 동일한 경우
      if (beforeWithoutRegion === insideWithoutRegion) {
        // 지역 정보 우선순위: 괄호 안 > 괄호 밖
        const region = insideRegionMatch?.[1] || beforeRegionMatch?.[1];
        if (region) {
          cleaned =
            beforeWithoutRegion +
            " " +
            region +
            (afterParen ? " " + afterParen : "");
        } else {
          cleaned = beforeWithoutRegion + (afterParen ? " " + afterParen : "");
        }
      } else {
        // 괄호 안의 내용과 앞부분을 합치기
        cleaned =
          beforeParen +
          " " +
          insideParen +
          (afterParen ? " " + afterParen : "");
      }
    }
  }

  // 5. 남은 [지역] 패턴 처리 - 괄호 밖에 남은 [지역]은 지역명만 추출하여 추가
  const remainingRegionMatch = cleaned.match(/\[([^\]]+)\]/);
  if (remainingRegionMatch) {
    const region = remainingRegionMatch[1];
    const withoutBrackets = cleaned.replace(/\s*\[[^\]]+\]\s*/g, " ").trim();
    // 지역명이 이미 포함되어 있지 않으면 추가
    if (!withoutBrackets.includes(region)) {
      cleaned = withoutBrackets + " " + region;
    } else {
      cleaned = withoutBrackets;
    }
  }

  // 6. 다시 공백 정리
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

/**
 * 공연 상세 정보 조회
 * @param mt20id 공연 ID
 */
export async function getPerformanceDetail(
  mt20id: string
): Promise<KopisPerformanceDetail> {
  // 백엔드 API 호출
  const endpoint = `/kopis/performances/${mt20id}`;
  return apiGet<KopisPerformanceDetail>(endpoint);
}

/**
 * 날짜를 YYYYMMDD 형식으로 변환
 */
export function formatDateForKopis(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * 주간 예매 순위 조회
 * @param catecode 장르 코드 (AAAA: 연극, GGGA: 뮤지컬)
 * @param stdate 시작일 (YYYYMMDD 형식, 기본값: 오늘로부터 일주일 전)
 * @param eddate 종료일 (YYYYMMDD 형식, 기본값: 오늘)
 */
export async function getWeeklyBoxOffice(
  catecode: "AAAA" | "GGGA"
): Promise<KopisPerformance[]> {
  // 백엔드 API 호출
  const queryParams = new URLSearchParams();

  // 장르 코드를 한글로 변환 (AAAA -> 연극, GGGA -> 뮤지컬)
  const genreKorean = catecode === "AAAA" ? "연극" : "뮤지컬";
  queryParams.append("genre", genreKorean);

  const endpoint = `/kopis/boxoffice${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const response = await apiGet<{ data: KopisPerformance[] }>(endpoint);
  return response.data;
}
