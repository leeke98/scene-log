import { useState, useEffect, useMemo } from "react";
import {
  cleanTheaterName,
  normalizePerformanceName,
  type KopisPerformance,
} from "@/services/kopisApi";
import { formatDateToKopis } from "@/lib/dateUtils";
import { useSearchPerformances, usePerformanceDetail } from "@/queries/kopis";

interface UsePerformanceSearchParams {
  selectedDate?: Date | string;
  selectedGenre?: "연극" | "뮤지컬";
  onSelect: (performance: {
    performanceName: string;
    theater: string;
    posterUrl: string;
    isChild?: boolean;
  }) => void;
  onClose: () => void;
}

export function usePerformanceSearch({
  selectedDate,
  selectedGenre,
  onSelect,
  onClose,
}: UsePerformanceSearchParams) {
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState<"AAAA" | "GGGA">(
    selectedGenre === "연극" ? "AAAA" : "GGGA"
  );
  const [modalDate, setModalDate] = useState<Date | null>(
    selectedDate
      ? typeof selectedDate === "string"
        ? new Date(selectedDate + "T00:00:00")
        : selectedDate
      : null
  );
  const [shouldSearch, setShouldSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMt20id, setSelectedMt20id] = useState<string | undefined>(
    undefined
  );

  const startDate = modalDate ? formatDateToKopis(modalDate) : undefined;
  const canSearch = !!searchTerm.trim() && !!startDate && !!genre;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: queryError,
  } = useSearchPerformances({
    searchTerm: searchTerm.trim(),
    startDate,
    genre,
    rows: 20,
    enabled: shouldSearch && canSearch,
  });

  const performances = useMemo(() => data?.pages.flat() ?? [], [data]);

  const { data: detailData, error: detailError } =
    usePerformanceDetail(selectedMt20id);

  // queryError → error 상태 반영
  useEffect(() => {
    if (queryError) {
      setError(
        queryError instanceof Error
          ? queryError.message
          : "공연 검색에 실패했습니다."
      );
    }
  }, [queryError]);

  // props의 selectedDate 변경 시 modalDate 동기화
  useEffect(() => {
    if (selectedDate) {
      setModalDate(
        typeof selectedDate === "string"
          ? new Date(selectedDate + "T00:00:00")
          : selectedDate
      );
    }
  }, [selectedDate]);

  // props의 selectedGenre 변경 시 genre 동기화
  useEffect(() => {
    if (selectedGenre) {
      setGenre(selectedGenre === "연극" ? "AAAA" : "GGGA");
    }
  }, [selectedGenre]);

  // 검색 조건 변경 시 검색 상태 리셋
  useEffect(() => {
    setShouldSearch(false);
  }, [searchTerm, modalDate, genre]);

  // 상세 정보 로드 완료 → onSelect 호출
  useEffect(() => {
    if (!detailData || !selectedMt20id) return;

    const performancesWithoutBracket = performances.filter(
      (p) => !p.prfnm.includes("[")
    );
    const referenceName =
      performancesWithoutBracket[0]?.prfnm ?? undefined;

    const normalizedName = normalizePerformanceName(
      detailData.prfnm,
      referenceName
    );
    const cleanedTheater = cleanTheaterName(detailData.fcltynm);

    onSelect({
      performanceName: normalizedName,
      theater: cleanedTheater,
      posterUrl: detailData.poster || "",
      isChild: false,
    });

    onClose();
    setSearchTerm("");
    setError(null);
    setSelectedMt20id(undefined);
  }, [detailData, selectedMt20id, performances, onSelect, onClose]);

  // 상세 정보 조회 실패 → 검색 결과 기본값으로 폴백
  useEffect(() => {
    if (!detailError || !selectedMt20id) return;

    setError(
      detailError instanceof Error
        ? detailError.message
        : "공연 상세 정보를 불러오는데 실패했습니다."
    );

    const performance = performances.find((p) => p.mt20id === selectedMt20id);
    if (performance) {
      const performancesWithoutBracket = performances.filter(
        (p) => !p.prfnm.includes("[")
      );
      const referenceName = performancesWithoutBracket[0]?.prfnm ?? undefined;

      onSelect({
        performanceName: normalizePerformanceName(
          performance.prfnm,
          referenceName
        ),
        theater: cleanTheaterName(performance.fcltynm),
        posterUrl: performance.poster || "",
      });
      onClose();
      setSearchTerm("");
    }

    setSelectedMt20id(undefined);
  }, [detailError, selectedMt20id, performances, onSelect, onClose]);

  const handleDateChange = (dateString: string | null) => {
    const date = dateString
      ? (() => {
          const [year, month, day] = dateString.split("-").map(Number);
          return new Date(year, month - 1, day);
        })()
      : null;
    setModalDate(date);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop - clientHeight < 200 &&
      !isFetchingNextPage &&
      !isLoading &&
      hasNextPage
    ) {
      fetchNextPage();
    }
  };

  const handleSelectPerformance = (performance: KopisPerformance) => {
    setError(null);
    setSelectedMt20id(performance.mt20id);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && canSearch && !isLoading) {
      setShouldSearch(true);
    }
  };

  const handleSearchClick = () => {
    if (canSearch && !isLoading) {
      setShouldSearch(true);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    genre,
    setGenre,
    modalDate,
    canSearch,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    performances,
    error,
    handleDateChange,
    handleScroll,
    handleSelectPerformance,
    handleKeyPress,
    handleSearchClick,
  };
}
