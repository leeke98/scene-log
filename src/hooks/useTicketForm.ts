import { useState, useEffect } from "react";
import { formatDateToISO } from "@/lib/dateUtils";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTicket, useCreateTicket, useUpdateTicket } from "@/queries/tickets";
import { toast } from "react-toastify";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import type { Actor } from "@/types/actor";

export type TicketFormData = {
  date: string;
  time: string;
  performanceName: string;
  genre: "연극" | "뮤지컬";
  isChild?: boolean;
  theater: string;
  seat: string;
  casting: Actor[];
  ticketPrice: string;
  companion: string;
  mdPrice: string;
  rating: number;
  review: string;
  posterUrl: string;
  isLinked: boolean;
  kopisId: string;
};

export function useTicketForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();

  const isEditMode = !!id;
  const dateFromUrl = searchParams.get("date");
  const kopisIdFromUrl = searchParams.get("kopisId");
  const performanceNameFromUrl = searchParams.get("performanceName");
  const posterUrlFromUrl = searchParams.get("posterUrl");
  const theaterFromUrl = searchParams.get("theater");
  const returnToFromUrl = searchParams.get("returnTo");
  const { data: ticket, isLoading: isLoadingTicket } = useTicket(id);
  const createTicketMutation = useCreateTicket();
  const updateTicketMutation = useUpdateTicket();

  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [pendingPosterFile, setPendingPosterFile] = useState<File | null>(null);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState("");

  const isPending =
    createTicketMutation.isPending || updateTicketMutation.isPending || isUploadingPoster;

  const [isDirtyFlag, setIsDirty] = useState(false);
  const isDirty = isDirtyFlag || pendingPosterFile !== null;

  const [initialTicketData, setInitialTicketData] =
    useState<TicketFormData | null>(null);
  const [formData, setFormData] = useState<TicketFormData>({
    date: isEditMode
      ? ""
      : dateFromUrl || formatDateToISO(new Date()),
    time: "20:00",
    performanceName: performanceNameFromUrl || "",
    genre: "뮤지컬",
    isChild: undefined,
    theater: theaterFromUrl || "",
    seat: "",
    casting: [],
    ticketPrice: "",
    companion: "",
    mdPrice: "",
    rating: 0,
    review: "",
    posterUrl: posterUrlFromUrl || "",
    isLinked: !!kopisIdFromUrl,
    kopisId: kopisIdFromUrl || "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isEditMode && ticket) {
      const timeFormatted = ticket.time
        ? ticket.time.split(":").slice(0, 2).join(":")
        : "20:00";

      const loadedData: TicketFormData = {
        date: ticket.date,
        time: timeFormatted,
        performanceName: ticket.performanceName,
        genre: ticket.genre || "뮤지컬",
        isChild: ticket.isChild,
        theater: ticket.theater,
        seat: ticket.seat || "",
        casting: ticket.casting || [],
        ticketPrice: ticket.ticketPrice?.toString() || "",
        companion: ticket.companion || "",
        mdPrice: ticket.mdPrice?.toString() || "",
        rating: ticket.rating || 0,
        review: ticket.review || "",
        posterUrl: ticket.posterUrl || "",
        isLinked: ticket.isLinked || false,
        kopisId: ticket.kopisId || "",
      };

      setFormData(loadedData);
      setInitialTicketData(loadedData);
    }
  }, [isEditMode, ticket]);

  // 유저 인터랙션용 setFormData — dirty 플래그를 함께 설정
  const setFormDataDirty: typeof setFormData = (updater) => {
    setFormData(updater);
    setIsDirty(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormDataDirty((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormDataDirty((prev) => ({ ...prev, date: formatDateToISO(date) }));
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormDataDirty((prev) => ({ ...prev, rating: prev.rating === rating ? 0 : rating }));
  };

  const handlePerformanceSelect = (performance: {
    performanceName: string;
    theater: string;
    posterUrl: string;
    isChild?: boolean;
    mt20id?: string;
  }) => {
    setPendingPosterFile(null); // KOPIS 포스터로 교체 시 pending 파일 초기화
    setPosterPreviewUrl("");
    setFormDataDirty((prev) => ({
      ...prev,
      performanceName: performance.performanceName,
      theater: performance.theater,
      posterUrl: performance.posterUrl,
      isChild: performance.isChild,
      isLinked: !!performance.mt20id,
      kopisId: performance.mt20id || "",
    }));
  };

  const handleAddActor = (actor: Actor) => {
    if (!formData.casting.some((a) => a.id === actor.id)) {
      setFormDataDirty((prev) => ({
        ...prev,
        casting: [...prev.casting, actor],
      }));
    }
  };

  const handleRemoveActor = (index: number) => {
    setFormDataDirty((prev) => ({
      ...prev,
      casting: prev.casting.filter((_, i) => i !== index),
    }));
  };

  const handlePriceChange =
    (field: "ticketPrice" | "mdPrice") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, "");
      setFormDataDirty((prev) => ({
        ...prev,
        [field]: value ? Number(value).toLocaleString() : "",
      }));
    };

  const today = formatDateToISO(new Date());
  const isFutureDate = !!formData.date && formData.date > today;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date) {
      toast.error("날짜를 입력해주세요.");
      return;
    }

    if (
      !isFutureDate &&
      (!formData.time || !formData.performanceName || !formData.theater)
    ) {
      toast.error("필수 필드(날짜, 시간, 공연명, 극장)를 모두 입력해주세요.");
      return;
    }

    // 저장 시점에 pending 파일이 있으면 Cloudinary 업로드
    let resolvedPosterUrl = formData.posterUrl;
    if (pendingPosterFile) {
      setIsUploadingPoster(true);
      try {
        resolvedPosterUrl = await uploadImageToCloudinary(pendingPosterFile);
        setPendingPosterFile(null);
      } catch {
        toast.error("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
        setIsUploadingPoster(false);
        return;
      }
      setIsUploadingPoster(false);
    }

    const timeFormatted = formData.time.includes(":")
      ? formData.time.split(":").length === 2
        ? `${formData.time}:00`
        : formData.time
      : `${formData.time}:00:00`;

    const castingIds =
      formData.casting.length > 0
        ? formData.casting.map((a) => a.id)
        : undefined;

    const ticketData = {
      date: formData.date,
      time: timeFormatted,
      performanceName: formData.performanceName,
      genre: formData.genre || undefined,
      isChild: formData.isChild,
      theater: formData.theater,
      seat: formData.seat || undefined,
      castingIds,
      ticketPrice: formData.ticketPrice
        ? Number(formData.ticketPrice.replace(/,/g, ""))
        : undefined,
      companion: formData.companion || undefined,
      mdPrice: formData.mdPrice
        ? Number(formData.mdPrice.replace(/,/g, ""))
        : undefined,
      rating: formData.rating || undefined,
      review: formData.review || undefined,
      posterUrl: resolvedPosterUrl || undefined,
      isLinked: formData.isLinked,
      kopisId: formData.kopisId || undefined,
    };

    try {
      setIsDirty(false);

      if (isEditMode && id && initialTicketData) {
        const updateData: Record<string, unknown> = {};

        if (ticketData.date !== initialTicketData.date)
          updateData.date = ticketData.date;
        if (ticketData.time !== initialTicketData.time)
          updateData.time = ticketData.time;
        if (ticketData.performanceName !== initialTicketData.performanceName)
          updateData.performanceName = ticketData.performanceName;
        if (ticketData.genre !== initialTicketData.genre)
          updateData.genre = ticketData.genre;
        if (ticketData.isChild !== initialTicketData.isChild)
          updateData.isChild = ticketData.isChild;
        if (ticketData.theater !== initialTicketData.theater)
          updateData.theater = ticketData.theater;
        if (ticketData.seat !== initialTicketData.seat)
          updateData.seat = ticketData.seat;

        const initialIds = initialTicketData.casting.map((a) => a.id).sort();
        const currentIds = formData.casting.map((a) => a.id).sort();
        const castingChanged =
          JSON.stringify(currentIds) !== JSON.stringify(initialIds);
        if (castingChanged) updateData.castingIds = currentIds;

        const ticketPriceStr = ticketData.ticketPrice?.toString() || "";
        if (ticketPriceStr !== initialTicketData.ticketPrice)
          updateData.ticketPrice = ticketData.ticketPrice;
        if (ticketData.companion !== initialTicketData.companion)
          updateData.companion = ticketData.companion;

        const mdPriceStr = ticketData.mdPrice?.toString() || "";
        if (mdPriceStr !== initialTicketData.mdPrice)
          updateData.mdPrice = ticketData.mdPrice;
        if (ticketData.rating !== initialTicketData.rating)
          updateData.rating = ticketData.rating;
        if (ticketData.review !== initialTicketData.review)
          updateData.review = ticketData.review;
        if (ticketData.posterUrl !== initialTicketData.posterUrl)
          updateData.posterUrl = ticketData.posterUrl;
        if (ticketData.isLinked !== initialTicketData.isLinked)
          updateData.isLinked = ticketData.isLinked;
        if (ticketData.kopisId !== (initialTicketData.kopisId || undefined))
          updateData.kopisId = ticketData.kopisId;

        if (Object.keys(updateData).length === 0) {
          toast.info("변경된 내용이 없습니다.");
          return;
        }

        await updateTicketMutation.mutateAsync({ id, data: updateData });
        navigate(`/tickets/${id}`, { replace: true });
      } else {
        await createTicketMutation.mutateAsync(ticketData);
        navigate(returnToFromUrl || "/");
      }
    } catch (error: unknown) {
      console.error("티켓 저장 오류:", error);
    }
  };

  const handlePosterFileSelect = (file: File | null, previewUrl: string) => {
    setPendingPosterFile(file);
    setPosterPreviewUrl(previewUrl);
  };

  return {
    formData,
    setFormData: setFormDataDirty,
    isDirty,
    isEditMode,
    isLoadingTicket,
    isPending,
    isFutureDate,
    handleChange,
    handleDateChange,
    handleRatingClick,
    handlePerformanceSelect,
    handleAddActor,
    handleRemoveActor,
    handlePriceChange,
    handleSubmit,
    navigate,
    posterPreviewUrl,
    setPendingPosterFile: handlePosterFileSelect,
  };
}
