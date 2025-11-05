import { useState, useEffect } from "react";
import { X, Search, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  searchPerformances,
  getPerformanceDetail,
  cleanTheaterName,
  normalizePerformanceName,
  formatDateForKopis,
  type KopisPerformance,
} from "@/services/kopisApi";
import { useTickets } from "@/contexts/TicketContext";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";

interface PerformanceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (performance: {
    performanceName: string;
    theater: string;
    posterUrl: string;
    isChild?: boolean; // 어린이 공연 여부
  }) => void;
  selectedDate?: Date | string; // 검색 시작일로 사용
  onDateChange?: (date: Date | null) => void; // 날짜 변경 콜백
  selectedGenre?: "연극" | "뮤지컬"; // 티켓 입력폼에서 선택된 장르
  onGenreChange?: (genre: "연극" | "뮤지컬") => void; // 장르 변경 콜백
}

export default function PerformanceSearchModal({
  isOpen,
  onClose,
  onSelect,
  selectedDate,
  onDateChange,
  selectedGenre,
  onGenreChange,
}: PerformanceSearchModalProps) {
  const { tickets } = useTickets();
  const [searchTerm, setSearchTerm] = useState("");
  // selectedGenre가 있으면 그것을 사용하고, 없으면 기본값 "뮤지컬"
  const [genre, setGenre] = useState<"AAAA" | "GGGA">(
    selectedGenre === "연극" ? "AAAA" : "GGGA"
  ); // 연극: AAAA, 뮤지컬: GGGA
  const [performances, setPerformances] = useState<KopisPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [modalDate, setModalDate] = useState<Date | null>(
    selectedDate
      ? typeof selectedDate === "string"
        ? new Date(selectedDate + "T00:00:00")
        : selectedDate
      : null
  );

  // selectedDate가 변경되면 modalDate도 업데이트
  useEffect(() => {
    if (selectedDate) {
      setModalDate(
        typeof selectedDate === "string"
          ? new Date(selectedDate + "T00:00:00")
          : selectedDate
      );
    }
  }, [selectedDate]);

  // selectedGenre가 변경되면 genre도 업데이트
  useEffect(() => {
    if (selectedGenre) {
      setGenre(selectedGenre === "연극" ? "AAAA" : "GGGA");
    }
  }, [selectedGenre]);

  const handleDateChange = (date: Date | null) => {
    setModalDate(date);
    if (onDateChange) {
      onDateChange(date);
    }
  };

  const handleSearch = async (page: number = 1, append: boolean = false) => {
    if (!searchTerm.trim()) {
      setError("작품명을 입력해주세요.");
      return;
    }

    if (!modalDate) {
      setError("공연 날짜를 먼저 선택해주세요.");
      return;
    }

    if (!genre) {
      setError("장르를 선택해주세요.");
      return;
    }

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
      setCurrentPage(1);
      setHasMore(true);
    }

    try {
      const startDate = modalDate ? formatDateForKopis(modalDate) : undefined;
      const results = await searchPerformances(
        searchTerm,
        startDate,
        undefined,
        genre,
        page,
        20
      );

      if (append) {
        // 추가 로드인 경우 기존 결과에 추가
        setPerformances((prev) => [...prev, ...results]);
      } else {
        // 새 검색인 경우 결과 교체
        setPerformances(results);
      }

      // 결과가 20개 미만이면 더 이상 데이터가 없음
      setHasMore(results.length === 20);

      if (!append && results.length === 0) {
        setError("검색 결과가 없습니다. 날짜 범위를 확인해주세요.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "공연 검색에 실패했습니다."
      );
      if (!append) {
        setPerformances([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 무한 스크롤 처리
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    // 스크롤이 끝에서 200px 이내에 도달하면 다음 페이지 로드
    if (
      scrollHeight - scrollTop - clientHeight < 200 &&
      !isLoadingMore &&
      !isLoading &&
      hasMore
    ) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      handleSearch(nextPage, true);
    }
  };

  const handleSelectPerformance = async (performance: KopisPerformance) => {
    setIsLoading(true);
    setError(null);

    try {
      // 공연 상세 정보 조회하여 정확한 극장 정보 가져오기
      const detail = await getPerformanceDetail(performance.mt20id);

      // 검색 결과에서 대괄호가 없는 작품명 찾기 (진짜 작품명)
      const performancesWithoutBracket = performances.filter(
        (p) => !p.prfnm.includes("[")
      );
      const referenceName =
        performancesWithoutBracket.length > 0
          ? performancesWithoutBracket[0].prfnm
          : undefined;

      // 기존 티켓에서 대괄호 없는 같은 작품명 찾기 (대괄호 제거 후 비교)
      const currentWithoutBracket = detail.prfnm
        .replace(/\s*\[[^\]]+\]\s*/g, "")
        .trim();
      const existingTicket = tickets.find((ticket) => {
        const ticketWithoutBracket = ticket.performanceName
          .replace(/\s*\[[^\]]+\]\s*/g, "")
          .trim();
        // 공백 제거 후 비교
        return (
          ticketWithoutBracket.replace(/\s+/g, "").toLowerCase() ===
          currentWithoutBracket.replace(/\s+/g, "").toLowerCase()
        );
      });

      // 참고 작품명: 기존 티켓이 있으면 그것을, 없으면 검색 결과에서 대괄호 없는 것을 사용
      const finalReferenceName =
        existingTicket?.performanceName || referenceName;

      // 작품명 정규화: 띄어쓰기 통일, [지역] 제거, 참고 작품명 사용
      const normalizedPerformanceName = normalizePerformanceName(
        detail.prfnm,
        finalReferenceName
      );

      // 극장명 정제: "(구. ...)" 제거, 맨 뒤 "(...)" 유지, [지역] 제거
      const cleanedTheater = cleanTheaterName(detail.fcltynm);

      // kidstate 파라미터로 필터링했으므로 상세 조회에서 child 확인 불필요
      // 검색 시 kidstate=N이므로 성인 공연만 조회됨 (isChild = false)
      onSelect({
        performanceName: normalizedPerformanceName,
        theater: cleanedTheater,
        posterUrl: detail.poster || "",
        isChild: false, // kidstate=N이므로 성인 공연
      });

      // 모달 닫기
      onClose();
      setSearchTerm("");
      setPerformances([]);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "공연 상세 정보를 불러오는데 실패했습니다."
      );
      // 실패해도 검색 결과의 기본 정보라도 사용
      // 검색 결과에서 대괄호가 없는 작품명 찾기
      const performancesWithoutBracket = performances.filter(
        (p) => !p.prfnm.includes("[")
      );
      const referenceName =
        performancesWithoutBracket.length > 0
          ? performancesWithoutBracket[0].prfnm
          : undefined;

      const normalizedPerformanceName = normalizePerformanceName(
        performance.prfnm,
        referenceName
      );
      const cleanedTheater = cleanTheaterName(performance.fcltynm);
      onSelect({
        performanceName: normalizedPerformanceName,
        theater: cleanedTheater,
        posterUrl: performance.poster || "",
      });
      onClose();
      setSearchTerm("");
      setPerformances([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading && !isLoadingMore) {
      handleSearch(1, false);
    }
  };

  const handleSearchClick = () => {
    handleSearch(1, false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">공연 검색</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 검색 영역 */}
        <div className="p-6 border-b space-y-4">
          {/* 날짜 선택 */}
          <div>
            <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              공연 날짜
            </Label>
            <ReactDatePicker
              selected={modalDate}
              onChange={handleDateChange}
              dateFormat="yyyy년 MM월 dd일 EEEE"
              locale={ko}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholderText="공연 날짜를 선택하세요"
            />
            {modalDate && (
              <p className="text-xs text-gray-500 mt-1">
                선택된 날짜 기준으로 검색됩니다 (
                {modalDate.toLocaleDateString("ko-KR")})
              </p>
            )}
            {!modalDate && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ 날짜를 선택하지 않으면 검색 결과가 부정확할 수 있습니다.
              </p>
            )}
          </div>

          {/* 장르 선택 */}
          <div>
            <Label className="text-sm font-medium mb-2 block">장르 선택</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={genre === "AAAA" ? "default" : "outline"}
                onClick={() => {
                  setGenre("AAAA");
                  if (onGenreChange) {
                    onGenreChange("연극");
                  }
                }}
                className="flex-1"
              >
                연극
              </Button>
              <Button
                type="button"
                variant={genre === "GGGA" ? "default" : "outline"}
                onClick={() => {
                  setGenre("GGGA");
                  if (onGenreChange) {
                    onGenreChange("뮤지컬");
                  }
                }}
                className="flex-1"
              >
                뮤지컬
              </Button>
            </div>
          </div>

          {/* 작품명 검색 */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              작품명 검색
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="작품명을 입력하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleSearchClick}
                disabled={isLoading || isLoadingMore || !modalDate || !genre}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* 검색 결과 */}
        <div className="flex-1 overflow-y-auto p-6" onScroll={handleScroll}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : performances.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {performances.map((performance) => (
                <div
                  key={performance.mt20id}
                  onClick={() => handleSelectPerformance(performance)}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-4">
                    {performance.poster && (
                      <img
                        src={performance.poster}
                        alt={performance.prfnm}
                        className="w-20 h-28 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {performance.prfnm}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">기간:</span>{" "}
                        {performance.prfpdfrom} ~ {performance.prfpdto}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">극장:</span>{" "}
                        {performance.fcltynm}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">지역:</span>{" "}
                        {performance.area}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">장르:</span>{" "}
                        {performance.genrenm}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">
                더 많은 결과를 불러오는 중...
              </span>
            </div>
          )}
          {!isLoading &&
            !isLoadingMore &&
            performances.length > 0 &&
            !hasMore && (
              <div className="text-center py-4 text-gray-500 text-sm">
                모든 결과를 불러왔습니다.
              </div>
            )}
          {!isLoading && performances.length === 0 && !error ? (
            <div className="text-center py-12 text-gray-500">
              {!modalDate ? (
                <div className="space-y-2">
                  <p className="font-medium">공연 날짜를 먼저 선택해주세요.</p>
                  <p className="text-sm">
                    날짜 선택 후 작품명을 입력하고 검색 버튼을 눌러주세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-medium">
                    작품명을 입력하고 검색 버튼을 눌러주세요.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
