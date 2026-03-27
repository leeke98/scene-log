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
import {
  Star,
  Plus,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";

const STEPS = [
  { number: 1, label: "공연 선택" },
  { number: 2, label: "관람 정보" },
  { number: 3, label: "감상 기록" },
] as const;

function StepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((step, idx) => (
        <div key={step.number} className="flex items-center">
          <button
            type="button"
            onClick={() => onStepClick(step.number)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
              step.number === currentStep
                ? "text-gray-900"
                : step.number < currentStep
                ? "text-gray-500 hover:text-gray-700"
                : "text-gray-300"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                step.number === currentStep
                  ? "bg-gray-900 text-white"
                  : step.number < currentStep
                  ? "bg-gray-400 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {step.number < currentStep ? (
                <Check className="w-3 h-3" />
              ) : (
                step.number
              )}
            </span>
            <span className="text-center sm:text-left leading-tight">
              {step.label.split(" ").map((word, i) => (
                <span key={i}>
                  {i > 0 && <br className="sm:hidden" />}
                  {i > 0 && <span className="hidden sm:inline"> </span>}
                  {word}
                </span>
              ))}
            </span>
          </button>
          {idx < STEPS.length - 1 && (
            <div
              className={`w-6 sm:w-10 h-px mx-1 ${
                step.number < currentStep ? "bg-gray-400" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
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

  // 수정 모드: 데이터 로드 후 step 1에서 시작
  useEffect(() => {
    if (isEditMode && formData.performanceName) {
      setCurrentStep(1);
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

  const canSave = !!formData.date;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 pt-0 sm:pt-8 pb-8">
        {/* 상단 헤더: 뒤로가기 / 제목 */}
        <div className="relative flex items-center justify-center mb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-0 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </button>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-gray-900">
            {isEditMode ? "기록 수정" : "기록 추가"}
          </h1>
        </div>

        {/* 스텝 인디케이터 */}
        <StepIndicator
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />

        <form onSubmit={handleSubmit}>
          {/* === STEP 1: 공연 선택 === */}
          {currentStep === 1 && (
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
              {/* 날짜 & 시간 */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                <div className="min-w-0">
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
              <div className="flex gap-3 sm:gap-4 items-start">
                <div
                  className="relative w-[100px] sm:w-[150px] flex-shrink-0 aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-300 transition-all group overflow-hidden"
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
                    <p className="text-sm text-gray-400">
                      포스터를 클릭하여 공연을 검색하세요
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* === STEP 2: 관람 정보 === */}
          {currentStep === 2 && (
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                onAddActor={handleAddActor}
                onRemoveActor={handleRemoveActor}
              />

              {/* 티켓 가격 & 동행자 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="w-full sm:w-1/2 sm:pr-1.5">
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
            </div>
          )}

          {/* === STEP 3: 감상 기록 === */}
          {currentStep === 3 && (
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
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
            </div>
          )}

          {/* 하단 네비게이션 */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep((s) => s - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
            ) : (
              <div />
            )}
            {currentStep < 3 ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setCurrentStep((s) => s + 1)}
              >
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="sm"
                disabled={!canSave || isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    처리 중...
                  </span>
                ) : (
                  "저장"
                )}
              </Button>
            )}
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
