import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TimePicker from "@/components/TimePicker";
import DatePicker from "@/components/DatePicker";
import CastingField from "@/components/ticket-form/CastingField";
import PriceInput from "@/components/ticket-form/PriceInput";
import PerformanceSearchInline from "@/components/ticket-form/PerformanceSearchInline";
import { useTicketForm } from "@/hooks/useTicketForm";
import { toast } from "react-toastify";
import {
  Star,
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
                ? "text-foreground"
                : step.number < currentStep
                ? "text-muted-foreground hover:text-foreground"
                : "text-muted-foreground/40"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                step.number === currentStep
                  ? "bg-foreground text-background"
                  : step.number < currentStep
                  ? "bg-muted-foreground text-background"
                  : "bg-muted text-muted-foreground"
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
                step.number < currentStep ? "bg-muted-foreground" : "bg-border"
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
    isDirty,
    isEditMode,
    isLoadingTicket,
    isPending,
    isFutureDate,
    handleChange,
    handleRatingClick,
    handlePerformanceSelect,
    handleAddActor,
    handleRemoveActor,
    handlePriceChange,
    handleSubmit,
    navigate,
    posterPreviewUrl,
    setPendingPosterFile,
  } = useTicketForm();

  const [currentStep, setCurrentStep] = useState(1);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const handleBackClick = () => {
    if (isDirty && !isPending) {
      setShowLeaveDialog(true);
    } else {
      navigate(-1);
    }
  };

  // 브라우저 탭 닫기 / 새로고침 차단
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

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
          <p className="text-muted-foreground text-sm">티켓 정보를 불러오는 중...</p>
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
            onClick={handleBackClick}
            className="absolute left-0 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </button>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
            {isEditMode ? "기록 수정" : "기록 추가"}
          </h1>
        </div>

        {/* 스텝 인디케이터 */}
        <StepIndicator
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              (e.target as HTMLElement).tagName !== "TEXTAREA"
            ) {
              e.preventDefault();
            }
          }}
        >
          {/* === STEP 1: 공연 선택 === */}
          {currentStep === 1 && (
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
              {/* 날짜 & 시간 */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                <div className="min-w-0">
                  <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
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
                  <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
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

              {/* 인라인 공연 검색 */}
              <PerformanceSearchInline
                date={formData.date}
                genre={formData.genre}
                onGenreChange={(genre) =>
                  setFormData((prev) => ({ ...prev, genre }))
                }
                performanceName={formData.performanceName}
                theater={formData.theater}
                posterUrl={formData.posterUrl}
                posterPreviewUrl={posterPreviewUrl}
                onPerformanceSelect={handlePerformanceSelect}
                onManualNameChange={(name) =>
                  setFormData((prev) => ({
                    ...prev,
                    performanceName: name,
                    isLinked: false,
                    kopisId: "",
                  }))
                }
                onPosterFileSelect={setPendingPosterFile}
              />
            </div>
          )}

          {/* === STEP 2: 관람 정보 === */}
          {currentStep === 2 && (
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
              {/* 극장 & 좌석 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="theater"
                    className="text-xs font-semibold text-muted-foreground mb-1.5 block"
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
                    className="text-xs font-semibold text-muted-foreground mb-1.5 block"
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
                    className="text-xs font-semibold text-muted-foreground mb-1.5 block"
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
                    className="text-xs font-semibold text-muted-foreground mb-1.5 block"
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
                  className="text-xs font-semibold text-muted-foreground mb-1.5 block"
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
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
              {/* 별점 */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
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
                            : "text-muted-foreground/30"
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
                  className="text-xs font-semibold text-muted-foreground mb-1.5 block"
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
                key="next"
                type="button"
                size="sm"
                onClick={() => {
                  if (currentStep === 1 && !isFutureDate && !formData.performanceName) {
                    toast.warn("공연명을 입력해주세요.");
                    return;
                  }
                  setCurrentStep((s) => s + 1);
                }}
              >
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                key="submit"
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

      {/* 이탈 확인 다이얼로그 */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>작성 중인 내용이 있어요</DialogTitle>
            <DialogDescription>
              페이지를 벗어나면 입력한 내용이 사라집니다. 정말 나가시겠어요?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-center gap-4 sm:justify-between sm:gap-0">
            <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
              계속 작성
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowLeaveDialog(false);
                navigate(-1);
              }}
            >
              나가기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
