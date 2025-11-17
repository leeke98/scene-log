import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTicket, useCreateTicket, useUpdateTicket } from "@/queries/tickets";
import { toast } from "react-toastify";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PerformanceSearchModal from "@/components/PerformanceSearchModal";
import TimePicker from "@/components/TimePicker";
import { Star, Plus, X } from "lucide-react";
import DatePicker from "@/components/DatePicker";

export default function TicketFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const isEditMode = !!id;
  const { data: ticket, isLoading: isLoadingTicket } = useTicket(id);
  const createTicketMutation = useCreateTicket();
  const updateTicketMutation = useUpdateTicket();
  const [initialTicketData, setInitialTicketData] = useState<{
    date: string;
    time: string;
    performanceName: string;
    genre: "연극" | "뮤지컬";
    isChild?: boolean;
    theater: string;
    seat: string;
    casting: string[];
    ticketPrice: string;
    companion: string;
    mdPrice: string;
    rating: number;
    review: string;
    posterUrl: string;
  } | null>(null);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [formData, setFormData] = useState<{
    date: string;
    time: string;
    performanceName: string;
    genre: "연극" | "뮤지컬";
    isChild?: boolean;
    theater: string;
    seat: string;
    casting: string[];
    ticketPrice: string;
    companion: string;
    mdPrice: string;
    rating: number;
    review: string;
    posterUrl: string;
  }>({
    date: isEditMode ? "" : new Date().toISOString().split("T")[0],
    time: "20:00", // 기본값: 오후 8시
    performanceName: "",
    genre: "뮤지컬",
    isChild: undefined,
    theater: "",
    seat: "",
    casting: [],
    ticketPrice: "",
    companion: "",
    mdPrice: "",
    rating: 0,
    review: "",
    posterUrl: "",
  });

  // 수정 모드일 때 기존 티켓 데이터 로드
  useEffect(() => {
    if (isEditMode && ticket) {
      // time을 HH:MM 형식으로 변환 (HH:MM:SS -> HH:MM)
      const timeFormatted = ticket.time
        ? ticket.time.split(":").slice(0, 2).join(":")
        : "20:00";

      const loadedData = {
        date: ticket.date,
        time: timeFormatted,
        performanceName: ticket.performanceName,
        genre: ticket.genre || "뮤지컬",
        isChild: ticket.isChild,
        theater: ticket.theater,
        seat: ticket.seat || "",
        casting: (() => {
          const casting = ticket.casting;
          if (!casting) return [] as string[];
          if (Array.isArray(casting)) return casting as string[];
          if (typeof casting === "string") {
            return (casting as string)
              .split(",")
              .map((c: string) => c.trim())
              .filter(Boolean) as string[];
          }
          return [] as string[];
        })(),
        ticketPrice: ticket.ticketPrice?.toString() || "",
        companion: ticket.companion || "",
        mdPrice: ticket.mdPrice?.toString() || "",
        rating: ticket.rating || 0,
        review: ticket.review || "",
        posterUrl: ticket.posterUrl || "",
      };

      setFormData(loadedData);
      setInitialTicketData(loadedData);
    }
  }, [isEditMode, ticket]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setFormData((prev) => ({
        ...prev,
        date: `${year}-${month}-${day}`,
      }));
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));
  };

  const handlePerformanceSelect = (performance: {
    performanceName: string;
    theater: string;
    posterUrl: string;
    isChild?: boolean;
  }) => {
    setFormData((prev) => ({
      ...prev,
      performanceName: performance.performanceName,
      theater: performance.theater,
      posterUrl: performance.posterUrl,
      isChild: performance.isChild,
    }));
  };

  if (isLoadingTicket) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">티켓 정보를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (
      !formData.date ||
      !formData.time ||
      !formData.performanceName ||
      !formData.theater
    ) {
      toast.error("필수 필드(날짜, 시간, 공연명, 극장)를 모두 입력해주세요.");
      return;
    }

    // time을 HH:MM:SS 형식으로 변환
    const timeFormatted = formData.time.includes(":")
      ? formData.time.split(":").length === 2
        ? `${formData.time}:00`
        : formData.time
      : `${formData.time}:00:00`;

    const ticketData = {
      date: formData.date,
      time: timeFormatted,
      performanceName: formData.performanceName,
      genre: formData.genre || undefined,
      isChild: formData.isChild,
      theater: formData.theater,
      seat: formData.seat || undefined,
      casting: formData.casting.length > 0 ? formData.casting : undefined,
      ticketPrice: formData.ticketPrice
        ? Number(formData.ticketPrice.replace(/,/g, ""))
        : undefined,
      companion: formData.companion || undefined,
      mdPrice: formData.mdPrice
        ? Number(formData.mdPrice.replace(/,/g, ""))
        : undefined,
      rating: formData.rating || undefined,
      review: formData.review || undefined,
      posterUrl: formData.posterUrl || undefined,
    };

    try {
      if (isEditMode && id && initialTicketData) {
        // 수정 모드: 변경된 필드만 전송
        const updateData: Record<string, unknown> = {};

        // 각 필드를 비교하여 변경된 것만 추가
        if (ticketData.date !== initialTicketData.date) {
          updateData.date = ticketData.date;
        }
        if (ticketData.time !== initialTicketData.time) {
          updateData.time = ticketData.time;
        }
        if (ticketData.performanceName !== initialTicketData.performanceName) {
          updateData.performanceName = ticketData.performanceName;
        }
        if (ticketData.genre !== initialTicketData.genre) {
          updateData.genre = ticketData.genre;
        }
        if (ticketData.isChild !== initialTicketData.isChild) {
          updateData.isChild = ticketData.isChild;
        }
        if (ticketData.theater !== initialTicketData.theater) {
          updateData.theater = ticketData.theater;
        }
        if (ticketData.seat !== initialTicketData.seat) {
          updateData.seat = ticketData.seat;
        }
        // casting 배열 비교
        const castingChanged =
          JSON.stringify(ticketData.casting?.sort()) !==
          JSON.stringify(initialTicketData.casting.sort());
        if (castingChanged) {
          updateData.casting = ticketData.casting;
        }
        const ticketPriceStr = ticketData.ticketPrice?.toString() || "";
        if (ticketPriceStr !== initialTicketData.ticketPrice) {
          updateData.ticketPrice = ticketData.ticketPrice;
        }
        if (ticketData.companion !== initialTicketData.companion) {
          updateData.companion = ticketData.companion;
        }
        const mdPriceStr = ticketData.mdPrice?.toString() || "";
        if (mdPriceStr !== initialTicketData.mdPrice) {
          updateData.mdPrice = ticketData.mdPrice;
        }
        if (ticketData.rating !== initialTicketData.rating) {
          updateData.rating = ticketData.rating;
        }
        if (ticketData.review !== initialTicketData.review) {
          updateData.review = ticketData.review;
        }
        if (ticketData.posterUrl !== initialTicketData.posterUrl) {
          updateData.posterUrl = ticketData.posterUrl;
        }

        // 변경된 필드가 없으면 경고
        if (Object.keys(updateData).length === 0) {
          toast.info("변경된 내용이 없습니다.");
          return;
        }

        await updateTicketMutation.mutateAsync({ id, data: updateData });
      } else {
        // 생성 모드: 전체 데이터 전송
        await createTicketMutation.mutateAsync(ticketData);
      }

      navigate("/");
    } catch (error: any) {
      // 에러는 mutation의 onError에서 처리됨
      console.error("티켓 저장 오류:", error);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <form onSubmit={handleSubmit}>
          {/* 상단: 공연 날짜 선택 */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <Label
              htmlFor="date"
              className="text-base font-semibold mb-3 block"
            >
              공연 날짜를 먼저 선택해주세요
            </Label>
            <div className="flex gap-3 items-center">
              <div className="flex-1 max-w-xs">
                <DatePicker
                  value={formData.date}
                  onChange={(date) =>
                    setFormData((prev) => ({ ...prev, date: date || "" }))
                  }
                  placeholder="날짜 선택"
                />
              </div>
              <TimePicker
                value={formData.time}
                onChange={(time) => {
                  setFormData((prev) => ({
                    ...prev,
                    time,
                  }));
                }}
              />
            </div>
            {!formData.date && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ 날짜를 선택하지 않으면 정확한 공연 검색이 어려울 수 있습니다.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 좌측: 작품 정보 영역 */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-2 block">
                  작품 정보
                </Label>
                <p className="text-md text-gray-600 mb-4">
                  {formData.performanceName || "공연을 검색하여 선택해주세요"}
                </p>
                <div
                  className="relative aspect-[3/4] max-w-lg mx-auto bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors group"
                  onClick={() => setShowSearchModal(true)}
                >
                  {formData.posterUrl ? (
                    <>
                      <img
                        src={formData.posterUrl}
                        alt={formData.performanceName || "포스터"}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white font-medium">
                          클릭하여 변경
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Plus className="w-16 h-16 text-gray-400" />
                      <span className="text-gray-500 text-sm font-medium">
                        {formData.date ? "공연 검색" : "날짜 선택 후 공연 검색"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 우측: 상세 정보 필드 */}
            <div className="space-y-6">
              {/* 장르 선택 */}
              <div>
                <Label>장르</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={formData.genre === "연극" ? "default" : "outline"}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, genre: "연극" }))
                    }
                    className="flex-1"
                  >
                    연극
                  </Button>
                  <Button
                    type="button"
                    variant={
                      formData.genre === "뮤지컬" ? "default" : "outline"
                    }
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, genre: "뮤지컬" }))
                    }
                    className="flex-1"
                  >
                    뮤지컬
                  </Button>
                </div>
              </div>

              {/* 극장 */}
              <div>
                <Label htmlFor="theater">극장</Label>
                <Input
                  id="theater"
                  name="theater"
                  type="text"
                  value={formData.theater}
                  onChange={handleChange}
                  placeholder="극장명"
                />
              </div>

              {/* 좌석 */}
              <div>
                <Label htmlFor="seat">좌석</Label>
                <Input
                  id="seat"
                  name="seat"
                  type="text"
                  value={formData.seat}
                  onChange={handleChange}
                  placeholder="좌석 정보"
                />
              </div>

              {/* 캐스팅 */}
              <div>
                <Label htmlFor="casting">캐스팅</Label>
                <div className="space-y-2">
                  {/* 입력된 배우 태그들 */}
                  {formData.casting.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.casting.map((actor: string, index: number) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm"
                        >
                          <span>{actor}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                casting: prev.casting.filter(
                                  (_: string, i: number) => i !== index
                                ),
                              }));
                            }}
                            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 배우 입력 필드 */}
                  <Input
                    id="casting"
                    type="text"
                    placeholder="배우 이름을 입력하고 Enter를 누르세요"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const value = input.value.trim();
                        if (value && !formData.casting.includes(value)) {
                          setFormData((prev) => ({
                            ...prev,
                            casting: [...prev.casting, value],
                          }));
                          input.value = "";
                        }
                      }
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              {/* 티켓 가격 */}
              <div>
                <Label htmlFor="ticketPrice">티켓 가격</Label>
                <div className="relative">
                  <Input
                    id="ticketPrice"
                    name="ticketPrice"
                    type="text"
                    value={formData.ticketPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        ticketPrice: value
                          ? Number(value).toLocaleString()
                          : "",
                      }));
                    }}
                    placeholder="티켓 가격"
                    className={formData.ticketPrice ? "pr-10" : ""}
                  />
                  {formData.ticketPrice && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 pointer-events-none">
                      원
                    </span>
                  )}
                </div>
              </div>

              {/* 동행자 */}
              <div>
                <Label htmlFor="companion">동행자</Label>
                <Input
                  id="companion"
                  name="companion"
                  type="text"
                  value={formData.companion}
                  onChange={handleChange}
                  placeholder="동행자 정보"
                />
              </div>

              {/* MD 가격 */}
              <div>
                <Label htmlFor="mdPrice">MD 가격</Label>
                <div className="relative">
                  <Input
                    id="mdPrice"
                    name="mdPrice"
                    type="text"
                    value={formData.mdPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        mdPrice: value ? Number(value).toLocaleString() : "",
                      }));
                    }}
                    placeholder="MD 가격"
                    className={formData.mdPrice ? "pr-10" : ""}
                  />
                  {formData.mdPrice && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 pointer-events-none">
                      원
                    </span>
                  )}
                </div>
              </div>

              {/* 별점 */}
              <div>
                <Label>별점</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 공연 후기 */}
              <div>
                <Label htmlFor="review">공연 후기</Label>
                <textarea
                  id="review"
                  name="review"
                  value={formData.review}
                  onChange={handleChange}
                  rows={6}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="공연 후기를 입력하세요"
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button type="submit" className="flex-1">
                  {isEditMode ? "수정" : "저장"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* 공연 검색 모달 */}
      <PerformanceSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelect={handlePerformanceSelect}
        selectedDate={
          formData.date
            ? (() => {
                const [year, month, day] = formData.date.split("-").map(Number);
                return new Date(year, month - 1, day);
              })()
            : undefined
        }
        onDateChange={(date) => {
          if (date) {
            handleDateChange(date);
          }
        }}
        selectedGenre={formData.genre || undefined}
        onGenreChange={(genre) => {
          setFormData((prev) => ({ ...prev, genre }));
        }}
      />
    </Layout>
  );
}
