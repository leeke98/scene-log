import { useState } from "react";
import { formatDateToISO } from "@/lib/dateUtils";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PerformanceSearchModal from "@/components/PerformanceSearchModal";
import TimePicker from "@/components/TimePicker";
import DatePicker from "@/components/DatePicker";
import CastingField from "@/components/ticket-form/CastingField";
import PriceInput from "@/components/ticket-form/PriceInput";
import { useTicketForm } from "@/hooks/useTicketForm";
import { Star, Plus, Loader2 } from "lucide-react";

export default function TicketFormPage() {
  const {
    formData,
    setFormData,
    isEditMode,
    isLoadingTicket,
    isPending,
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleChange,
    handleRatingClick,
    handlePerformanceSelect,
    handleAddActor,
    handleRemoveActor,
    handlePriceChange,
    handleSubmit,
    navigate,
  } = useTicketForm();

  const [showSearchModal, setShowSearchModal] = useState(false);

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
                onChange={(time) =>
                  setFormData((prev) => ({ ...prev, time }))
                }
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
              <CastingField
                casting={formData.casting}
                activeId={activeId}
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onAddActor={handleAddActor}
                onRemoveActor={handleRemoveActor}
              />

              {/* 티켓 가격 */}
              <div>
                <Label htmlFor="ticketPrice">티켓 가격</Label>
                <PriceInput
                  id="ticketPrice"
                  name="ticketPrice"
                  value={formData.ticketPrice}
                  onChange={handlePriceChange("ticketPrice")}
                  placeholder="티켓 가격"
                />
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
                <PriceInput
                  id="mdPrice"
                  name="mdPrice"
                  value={formData.mdPrice}
                  onChange={handlePriceChange("mdPrice")}
                  placeholder="MD 가격"
                />
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
                  disabled={isPending}
                >
                  취소
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      처리 중...
                    </span>
                  ) : isEditMode ? (
                    "수정"
                  ) : (
                    "저장"
                  )}
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
            setFormData((prev) => ({ ...prev, date: formatDateToISO(date) }));
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
