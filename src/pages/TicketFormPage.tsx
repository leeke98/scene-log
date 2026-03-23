import { useState, useEffect } from "react";
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
import { Star, Plus, Loader2, Pencil, Check } from "lucide-react";

type StepStatus = "active" | "completed" | "locked";

function StepCard({
  step,
  title,
  status,
  onEdit,
  summary,
  children,
  isLast,
}: {
  step: number;
  title: string;
  status: StepStatus;
  onEdit?: () => void;
  summary: React.ReactNode;
  children: React.ReactNode;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-5">
      {/* 왼쪽: 스텝 원형 + 연결선 */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors ${
            status === "completed"
              ? "bg-gray-900 text-white"
              : status === "active"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-400 border border-gray-200"
          }`}
        >
          {status === "completed" ? <Check className="w-4 h-4" /> : step}
        </div>
        {!isLast && (
          <div
            className={`w-px flex-1 mt-1 ${
              status === "completed" ? "bg-gray-900" : "bg-gray-200"
            }`}
            style={{ minHeight: "24px" }}
          />
        )}
      </div>

      {/* 오른쪽: 콘텐츠 */}
      <div className={`flex-1 ${isLast ? "pb-0" : "pb-7"}`}>
        {/* 스텝 헤더 */}
        <div className="flex items-center justify-between h-8 mb-3">
          <h3
            className={`font-semibold text-sm ${
              status === "locked" ? "text-gray-400" : "text-gray-800"
            }`}
          >
            {title}
          </h3>
          {status === "completed" && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
            >
              <Pencil className="w-3 h-3" />
              수정
            </button>
          )}
        </div>

        {/* 완료 요약 */}
        {status === "completed" && (
          <div className="text-sm text-gray-600">{summary}</div>
        )}

        {/* 활성 입력 영역 */}
        {status === "active" && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            {children}
          </div>
        )}

        {/* 잠김 상태 */}
        {status === "locked" && (
          <p className="text-xs text-gray-400">이전 단계를 완료하면 입력할 수 있어요</p>
        )}
      </div>
    </div>
  );
}

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

  const [currentStep, setCurrentStep] = useState(1);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // 수정 모드: 데이터 로드 후 step 3(감상 기록)에서 시작
  useEffect(() => {
    if (isEditMode && formData.performanceName) {
      setCurrentStep(3);
    }
  }, [isEditMode, formData.performanceName]);

  if (isLoadingTicket) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-10 text-center">
          <p className="text-gray-500 text-sm">티켓 정보를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  const stepStatus = (step: number): StepStatus => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "active";
    return "locked";
  };

  // 스텝 1 요약
  const step1Summary = (
    <div className="flex items-center gap-3">
      {formData.posterUrl && (
        <img
          src={formData.posterUrl}
          alt=""
          className="w-9 h-[52px] object-cover rounded shadow-sm flex-shrink-0"
        />
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {formData.performanceName || "공연 미선택"}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formData.date} · {formData.time}
        </p>
      </div>
    </div>
  );

  // 스텝 2 요약
  const theaterSeat = [formData.theater, formData.seat].filter(Boolean).join(" · ");
  const priceSummary = [
    formData.ticketPrice && `티켓 ${formData.ticketPrice}원`,
    formData.mdPrice && `MD ${formData.mdPrice}원`,
  ]
    .filter(Boolean)
    .join(" · ");

  const step2Summary = (
    <div className="space-y-0.5">
      {theaterSeat && <p className="text-sm text-gray-700">{theaterSeat}</p>}
      {formData.casting.length > 0 && (
        <p className="text-xs text-gray-500">{formData.casting.join(", ")}</p>
      )}
      {priceSummary && <p className="text-xs text-gray-500">{priceSummary}</p>}
      {!theaterSeat && formData.casting.length === 0 && !priceSummary && (
        <p className="text-xs text-gray-400">입력된 정보 없음</p>
      )}
    </div>
  );

  // 스텝 3 요약
  const step3Summary = (
    <div className="flex items-center gap-3">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= formData.rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-200"
            }`}
          />
        ))}
      </div>
      {formData.review && (
        <p className="text-xs text-gray-500 truncate max-w-[240px]">
          {formData.review}
        </p>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          {/* === STEP 1: 공연 선택 === */}
          <StepCard
            step={1}
            title="공연 선택"
            status={stepStatus(1)}
            onEdit={() => setCurrentStep(1)}
            summary={step1Summary}
            isLast={false}
          >
            <div className="space-y-4">
              {/* 날짜 & 시간 */}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    공연 날짜
                  </Label>
                  <DatePicker
                    value={formData.date}
                    onChange={(date) =>
                      setFormData((prev) => ({ ...prev, date: date || "" }))
                    }
                    placeholder="날짜 선택"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    공연 시간
                  </Label>
                  <TimePicker
                    value={formData.time}
                    onChange={(time) =>
                      setFormData((prev) => ({ ...prev, time }))
                    }
                  />
                </div>
              </div>

              {/* 포스터 + 공연 정보 */}
              <div className="flex gap-4 items-start">
                <div
                  className="relative w-[150px] flex-shrink-0 aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-300 transition-all group overflow-hidden"
                  onClick={() => setShowSearchModal(true)}
                >
                  {formData.posterUrl ? (
                    <>
                      <img
                        src={formData.posterUrl}
                        alt={formData.performanceName || "포스터"}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/40 px-2 py-1 rounded-full transition-opacity">
                          변경
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                        <Plus className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="text-gray-400 text-[11px] text-center leading-tight">
                        {formData.date ? "공연 검색" : "날짜 먼저\n선택"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 pt-1 min-w-0">
                  {formData.performanceName ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-800 text-sm leading-snug">
                        {formData.performanceName}
                      </p>
                      <p className="text-xs text-gray-500">{formData.theater}</p>
                      <button
                        type="button"
                        onClick={() => setShowSearchModal(true)}
                        className="text-xs text-blue-500 hover:text-blue-600 mt-1 transition-colors"
                      >
                        다른 공연 선택
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">포스터를 클릭하여 공연을 검색하세요</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.date}
                >
                  다음
                </Button>
              </div>
            </div>
          </StepCard>

          {/* === STEP 2: 관람 정보 === */}
          <StepCard
            step={2}
            title="관람 정보"
            status={stepStatus(2)}
            onEdit={() => setCurrentStep(2)}
            summary={step2Summary}
            isLast={false}
          >
            <div className="space-y-4">
              {/* 장르 */}
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  장르
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
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
                    size="sm"
                    variant={formData.genre === "뮤지컬" ? "default" : "outline"}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, genre: "뮤지컬" }))
                    }
                    className="flex-1"
                  >
                    뮤지컬
                  </Button>
                </div>
              </div>

              {/* 극장 & 좌석 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="theater"
                    className="text-xs font-semibold text-gray-600 mb-1.5 block"
                  >
                    극장
                  </Label>
                  <Input
                    id="theater"
                    name="theater"
                    value={formData.theater}
                    onChange={handleChange}
                    placeholder="극장명"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="seat"
                    className="text-xs font-semibold text-gray-600 mb-1.5 block"
                  >
                    좌석
                  </Label>
                  <Input
                    id="seat"
                    name="seat"
                    value={formData.seat}
                    onChange={handleChange}
                    placeholder="좌석 정보"
                  />
                </div>
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

              {/* 티켓 가격 & 동행자 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="ticketPrice"
                    className="text-xs font-semibold text-gray-600 mb-1.5 block"
                  >
                    티켓 가격
                  </Label>
                  <PriceInput
                    id="ticketPrice"
                    name="ticketPrice"
                    value={formData.ticketPrice}
                    onChange={handlePriceChange("ticketPrice")}
                    placeholder="티켓 가격"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="companion"
                    className="text-xs font-semibold text-gray-600 mb-1.5 block"
                  >
                    동행자
                  </Label>
                  <Input
                    id="companion"
                    name="companion"
                    value={formData.companion}
                    onChange={handleChange}
                    placeholder="동행자 정보"
                  />
                </div>
              </div>

              {/* MD 가격 */}
              <div className="w-1/2 pr-1.5">
                <Label
                  htmlFor="mdPrice"
                  className="text-xs font-semibold text-gray-600 mb-1.5 block"
                >
                  MD 가격
                </Label>
                <PriceInput
                  id="mdPrice"
                  name="mdPrice"
                  value={formData.mdPrice}
                  onChange={handlePriceChange("mdPrice")}
                  placeholder="MD 가격"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCurrentStep(3)}
                >
                  다음
                </Button>
              </div>
            </div>
          </StepCard>

          {/* === STEP 3: 감상 기록 === */}
          <StepCard
            step={3}
            title="감상 기록"
            status={stepStatus(3)}
            onEdit={() => setCurrentStep(3)}
            summary={step3Summary}
            isLast={true}
          >
            <div className="space-y-4">
              {/* 별점 */}
              <div>
                <Label className="text-xs font-semibold text-gray-600 mb-2 block">
                  별점
                </Label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className="focus:outline-none hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= formData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 후기 */}
              <div>
                <Label
                  htmlFor="review"
                  className="text-xs font-semibold text-gray-600 mb-1.5 block"
                >
                  공연 후기
                </Label>
                <textarea
                  id="review"
                  name="review"
                  value={formData.review}
                  onChange={handleChange}
                  rows={5}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="공연 후기를 입력하세요"
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-2">
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
          </StepCard>
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
