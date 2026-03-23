import { useRef, useEffect, useState } from "react";

/** 요약 카드 섹션에서 제목 영역(text-lg + mb-4)을 제외한 콘텐츠 높이 */
const TITLE_HEIGHT = 40;

/**
 * 요소의 높이를 측정하고 타이틀 높이를 뺀 포스터 높이를 반환한다.
 * ResizeObserver + window resize 이벤트로 실시간 갱신.
 *
 * @param deps 높이를 재측정할 트리거 값 배열 (데이터 로드 후 재측정 필요할 때 사용)
 */
export function useSummaryHeight(deps: unknown[] = []) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [posterHeight, setPosterHeight] = useState<number | null>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (summaryRef.current) {
        setPosterHeight(summaryRef.current.offsetHeight - TITLE_HEIGHT);
      }
    };

    const timer = setTimeout(updateHeight, 0);
    const resizeObserver = new ResizeObserver(updateHeight);

    if (summaryRef.current) {
      resizeObserver.observe(summaryRef.current);
    }

    window.addEventListener("resize", updateHeight);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
    // deps는 외부에서 제어하므로 exhaustive-deps 경고 무시
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { summaryRef, posterHeight };
}
