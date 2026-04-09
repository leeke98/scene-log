import { useEffect, useRef, useState } from "react";
import { X, ChevronRight, Eye, Wallet, Camera, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useActorDetail } from "@/queries/reports/queries";
import { useUploadActorImage, useDeleteActorImage } from "@/queries/actors";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "react-toastify";

// 작품 태그 색상 (jewel tone, 순환)
const tagColors = [
  "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/40",
  "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40",
  "bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/40",
  "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
  "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
];

interface ActorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  actorId: string;
  year?: string;
  month?: string;
}

export default function ActorDetailModal({
  isOpen,
  onClose,
  actorId,
  year,
  month,
}: ActorDetailModalProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageMenuRef = useRef<HTMLDivElement>(null);
  const [showImageMenu, setShowImageMenu] = useState(false);
  // undefined: 서버 데이터 그대로, null: 로컬에서 삭제됨, string: 로컬에서 업로드됨
  const [localImageUrl, setLocalImageUrl] = useState<string | null | undefined>(undefined);

  const { data: actorDetail, isLoading, error } = useActorDetail({
    actorId,
    year,
    month,
  });

  const uploadMutation = useUploadActorImage(actorId);
  const deleteMutation = useDeleteActorImage(actorId);

  // 바텀시트 열릴 때 body 스크롤 방지 + 닫힐 때 메뉴 초기화
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
        setShowImageMenu(false);
        setLocalImageUrl(undefined);
      };
    }
  }, [isOpen]);

  // 이미지 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    if (!showImageMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (imageMenuRef.current && !imageMenuRef.current.contains(e.target as Node)) {
        setShowImageMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showImageMenu]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    uploadMutation.mutate(file, {
      onSuccess: (data) => setLocalImageUrl(data.imageUrl),
      onError: () => toast.error("이미지 업로드에 실패했습니다."),
    });
  };

  const handleDeleteImage = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => setLocalImageUrl(null),
      onError: () => toast.error("이미지 삭제에 실패했습니다."),
    });
  };

  // 로딩/에러 상태
  if (isLoading || error || !actorDetail) {
    return createPortal(
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
        onClick={handleBackdropClick}
      >
        <div
          className="w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl shadow-xl border border-border p-8 text-center text-sm text-muted-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading
            ? "불러오는 중..."
            : "데이터를 불러올 수 없습니다."}
        </div>
      </div>,
      document.body
    );
  }

  const actor = actorDetail.actor;
  const tickets = actorDetail.tickets.map((ticket) => ({
    id: ticket.id,
    date: ticket.date,
    performanceName: ticket.performanceName,
  }));

  const isImageLoading = uploadMutation.isPending || deleteMutation.isPending;
  const displayImageUrl = localImageUrl !== undefined ? localImageUrl : actor.imageUrl;
  const hasImage = !!displayImageUrl;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col h-[85vh] sm:h-auto sm:max-h-[80vh] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 드래그 핸들 (모바일) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* 숨겨진 파일 input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* 헤더 */}
        <div className="flex items-start justify-between px-4 pt-4 pb-2 sm:px-5 sm:pt-5 flex-shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            {/* 이미지 영역: 업로드 중이거나 이미지 있을 때 표시 */}
            {(hasImage || uploadMutation.isPending) && (
              <div className="relative flex-shrink-0">
                {hasImage ? (
                  <img
                    src={displayImageUrl!}
                    alt={actor.actorName}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-muted" />
                )}
                {/* 로딩 스피너 오버레이 */}
                {isImageLoading && (
                  <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
                {/* 코너 뱃지 + 드롭다운 */}
                {hasImage && !isImageLoading && (
                  <div ref={imageMenuRef} className="absolute -bottom-1.5 -right-1.5">
                    <button
                      onClick={() => setShowImageMenu((v) => !v)}
                      className="w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors"
                      title="사진 편집"
                    >
                      <Camera className="w-3 h-3 text-muted-foreground" />
                    </button>
                    {showImageMenu && (
                      <div className="absolute top-8 left-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10 w-28">
                        <button
                          onClick={() => { fileInputRef.current?.click(); setShowImageMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                          사진 변경
                        </button>
                        <div className="border-t border-border/60" />
                        <button
                          onClick={() => { handleDeleteImage(); setShowImageMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-muted transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          사진 삭제
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="min-w-0">
              <span className="text-xs text-muted-foreground">배우</span>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-bold tracking-tight leading-tight">
                  {actor.actorName}
                </h2>
                {/* 이미지 없을 때만 카메라 아이콘 노출 (subtle) */}
                {!hasImage && !isImageLoading && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImageLoading}
                    className="p-1 rounded-md text-muted-foreground/30 hover:text-muted-foreground hover:bg-muted transition-colors flex-shrink-0"
                    title="사진 추가"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-0.5 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 통계 영역 (고정) */}
        <div className="flex-shrink-0 p-4 sm:p-5 space-y-4">
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Eye className="w-3.5 h-3.5" />
                총 관람 횟수
              </div>
              <div className="text-xl font-bold">
                {actor.viewCount}
                <span className="text-sm font-normal text-muted-foreground ml-0.5">
                  회
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Wallet className="w-3.5 h-3.5" />
                관람 금액
              </div>
              <div className="text-base font-bold leading-tight mt-1">
                {actor.totalTicketPrice.toLocaleString()}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">
                  원
                </span>
              </div>
            </div>
          </div>

          {/* 관람 작품 태그 */}
          {actor.performanceList.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                관람 작품
              </p>
              <div className="flex flex-wrap gap-1.5">
                {actor.performanceList.map((performance, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                      tagColors[idx % tagColors.length]
                    }`}
                  >
                    {performance}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="border-t border-border mx-4 sm:mx-5 flex-shrink-0" />

        {/* 관람 티켓 (스크롤 영역) */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              관람 티켓
            </p>
            <span className="text-xs text-muted-foreground">
              {tickets.length}건
            </span>
          </div>
          {tickets.length > 0 ? (
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border/60">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
                      {ticket.date}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {ticket.performanceName}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground flex-shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState message="티켓 정보가 없습니다." variant="inline" size="sm" />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
