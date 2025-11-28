// KOPIS API 서비스 키 (환경변수로 관리하는 것을 권장)
const KOPIS_SERVICE_KEY = import.meta.env.VITE_KOPIS_SERVICE_KEY || "";

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
 * XML 문자열을 파싱하여 공연 목록 추출
 */
function parseKopisXml(xmlString: string): KopisPerformance[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const dbElements = xmlDoc.getElementsByTagName("db");

  const performances: KopisPerformance[] = [];

  for (let i = 0; i < dbElements.length; i++) {
    const db = dbElements[i];
    const getTextContent = (tagName: string) => {
      const element = db.getElementsByTagName(tagName)[0];
      return element ? element.textContent || "" : "";
    };

    performances.push({
      mt20id: getTextContent("mt20id"),
      prfnm: getTextContent("prfnm"),
      prfpdfrom: getTextContent("prfpdfrom"),
      prfpdto: getTextContent("prfpdto"),
      fcltynm: getTextContent("fcltynm"),
      poster: getTextContent("poster"),
      area: getTextContent("area"),
      genrenm: getTextContent("genrenm"),
      openrun: getTextContent("openrun"),
      prfstate: getTextContent("prfstate"),
    });
  }

  return performances;
}

/**
 * 공연 검색
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
  if (!KOPIS_SERVICE_KEY) {
    throw new Error("KOPIS API 서비스 키가 설정되지 않았습니다.");
  }

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

  // 개발 환경에서는 Vite 프록시 사용, 프로덕션에서는 CORS 프록시 사용
  let url: URL;
  if (import.meta.env.DEV) {
    // 개발 환경: Vite 프록시 사용
    const apiUrl = "/api/kopis/pblprfr";
    url = new URL(apiUrl, window.location.origin);
  } else {
    // 프로덕션: CORS 프록시 사용 (전체 URL 직접 구성)
    const targetUrl = "http://www.kopis.or.kr/openApi/restful/pblprfr";
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${targetUrl}`;
    url = new URL(proxyUrl);
  }

  url.searchParams.append("service", KOPIS_SERVICE_KEY);
  url.searchParams.append("stdate", startDateStr);
  url.searchParams.append("eddate", endDateStr);
  url.searchParams.append("cpage", page.toString());
  url.searchParams.append("rows", rows.toString());
  url.searchParams.append("shprfnm", searchTerm);

  // 장르 코드가 있으면 추가
  if (genre) {
    url.searchParams.append("shcate", genre);
  }

  // 아동 공연 여부 필터 (기본값: N - 성인 공연만)
  url.searchParams.append("kidstate", "N");

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const xmlText = await response.text();
    return parseKopisXml(xmlText);
  } catch (error) {
    console.error("KOPIS API 검색 오류:", error);
    throw error;
  }
}

/**
 * 공연 상세 정보 XML 파싱
 */
function parseKopisDetailXml(xmlString: string): KopisPerformanceDetail | null {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const dbElements = xmlDoc.getElementsByTagName("db");

  if (dbElements.length === 0) {
    return null;
  }

  const db = dbElements[0];
  const getTextContent = (tagName: string) => {
    const element = db.getElementsByTagName(tagName)[0];
    return element ? element.textContent || "" : "";
  };

  const baseInfo: KopisPerformance = {
    mt20id: getTextContent("mt20id"),
    prfnm: getTextContent("prfnm"),
    prfpdfrom: getTextContent("prfpdfrom"),
    prfpdto: getTextContent("prfpdto"),
    fcltynm: getTextContent("fcltynm"),
    poster: getTextContent("poster"),
    area: getTextContent("area"),
    genrenm: getTextContent("genrenm"),
    openrun: getTextContent("openrun"),
    prfstate: getTextContent("prfstate"),
  };

  const detail: KopisPerformanceDetail = {
    ...baseInfo,
    prfcast: getTextContent("prfcast"),
    prfcrew: getTextContent("prfcrew"),
    prfruntime: getTextContent("prfruntime"),
    prfage: getTextContent("prfage"),
    pcseguidance: getTextContent("pcseguidance"),
    dtguidance: getTextContent("dtguidance"),
    mt10id: getTextContent("mt10id"),
  };

  return detail;
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
  if (!KOPIS_SERVICE_KEY) {
    throw new Error("KOPIS API 서비스 키가 설정되지 않았습니다.");
  }

  // 개발 환경에서는 Vite 프록시 사용, 프로덕션에서는 CORS 프록시 사용
  let url: URL;
  if (import.meta.env.DEV) {
    // 개발 환경: Vite 프록시 사용
    const apiUrl = `/api/kopis/pblprfr/${mt20id}`;
    url = new URL(apiUrl, window.location.origin);
  } else {
    // 프로덕션: CORS 프록시 사용 (전체 URL 직접 구성)
    const targetUrl = `http://www.kopis.or.kr/openApi/restful/pblprfr/${mt20id}`;
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${targetUrl}`;
    url = new URL(proxyUrl);
  }

  url.searchParams.append("service", KOPIS_SERVICE_KEY);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const xmlText = await response.text();
    const detail = parseKopisDetailXml(xmlText);

    if (!detail) {
      throw new Error("공연 정보를 찾을 수 없습니다.");
    }

    return detail;
  } catch (error) {
    console.error("KOPIS API 상세 조회 오류:", error);
    throw error;
  }
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
 * 주간 예매 순위 XML 파싱 (boxof 태그 사용)
 */
function parseBoxOfficeXml(xmlString: string): KopisPerformance[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const boxofElements = xmlDoc.getElementsByTagName("boxof");

  const performances: KopisPerformance[] = [];

  for (let i = 0; i < boxofElements.length; i++) {
    const boxof = boxofElements[i];
    const getTextContent = (tagName: string) => {
      const element = boxof.getElementsByTagName(tagName)[0];
      return element ? element.textContent || "" : "";
    };

    // prfpd 형식: "2023.07.21~2023.11.19" -> prfpdfrom, prfpdto로 분리
    const prfpd = getTextContent("prfpd");
    let prfpdfrom = "";
    let prfpdto = "";
    if (prfpd) {
      const parts = prfpd.split("~");
      if (parts.length === 2) {
        prfpdfrom = parts[0].trim().replace(/\./g, ""); // "2023.07.21" -> "20230721"
        prfpdto = parts[1].trim().replace(/\./g, ""); // "2023.11.19" -> "20231119"
      }
    }

    // cate를 genrenm으로 사용
    const cate = getTextContent("cate");

    performances.push({
      mt20id: getTextContent("mt20id"),
      prfnm: getTextContent("prfnm"),
      prfpdfrom: prfpdfrom,
      prfpdto: prfpdto,
      fcltynm: getTextContent("prfplcnm"), // prfplcnm -> fcltynm
      poster: getTextContent("poster"),
      area: getTextContent("area"),
      genrenm: cate, // cate -> genrenm
      openrun: "", // boxof 응답에는 없음
      prfstate: "", // boxof 응답에는 없음
    });
  }

  return performances;
}

/**
 * 주간 예매 순위 조회
 * @param catecode 장르 코드 (AAAA: 연극, GGGA: 뮤지컬)
 * @param stdate 시작일 (YYYYMMDD 형식, 기본값: 오늘로부터 일주일 전)
 * @param eddate 종료일 (YYYYMMDD 형식, 기본값: 오늘)
 */
export async function getWeeklyBoxOffice(
  catecode: "AAAA" | "GGGA",
  stdate?: string,
  eddate?: string
): Promise<KopisPerformance[]> {
  if (!KOPIS_SERVICE_KEY) {
    throw new Error("KOPIS API 서비스 키가 설정되지 않았습니다.");
  }

  // eddate: 오늘 날짜
  const today = new Date();
  const eddateStr =
    eddate ||
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(today.getDate()).padStart(2, "0")}`;

  // stdate: 오늘로부터 일주일 전
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const stdateStr =
    stdate ||
    `${oneWeekAgo.getFullYear()}${String(oneWeekAgo.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(oneWeekAgo.getDate()).padStart(2, "0")}`;

  // 개발 환경에서는 Vite 프록시 사용, 프로덕션에서는 CORS 프록시 사용
  let url: URL;
  if (import.meta.env.DEV) {
    // 개발 환경: Vite 프록시 사용
    const apiUrl = "/api/kopis/boxoffice";
    url = new URL(apiUrl, window.location.origin);
  } else {
    // 프로덕션: CORS 프록시 사용 (전체 URL 직접 구성)
    const targetUrl = "http://www.kopis.or.kr/openApi/restful/boxoffice";
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${targetUrl}`;
    url = new URL(proxyUrl);
  }

  url.searchParams.append("service", KOPIS_SERVICE_KEY);
  url.searchParams.append("stdate", stdateStr);
  url.searchParams.append("eddate", eddateStr);
  url.searchParams.append("catecode", catecode);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const xmlText = await response.text();
    return parseBoxOfficeXml(xmlText);
  } catch (error) {
    console.error("KOPIS API 주간 예매 순위 조회 오류:", error);
    throw error;
  }
}
