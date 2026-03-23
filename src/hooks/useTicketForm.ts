import { useState, useEffect } from "react";
import { formatDateToISO } from "@/lib/dateUtils";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTicket, useCreateTicket, useUpdateTicket } from "@/queries/tickets";
import { toast } from "react-toastify";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

export type TicketFormData = {
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
};

export function useTicketForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();

  const isEditMode = !!id;
  const dateFromUrl = searchParams.get("date");
  const { data: ticket, isLoading: isLoadingTicket } = useTicket(id);
  const createTicketMutation = useCreateTicket();
  const updateTicketMutation = useUpdateTicket();

  const isPending =
    createTicketMutation.isPending || updateTicketMutation.isPending;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<number | null>(null);
  const [initialTicketData, setInitialTicketData] =
    useState<TicketFormData | null>(null);
  const [formData, setFormData] = useState<TicketFormData>({
    date: isEditMode
      ? ""
      : dateFromUrl || new Date().toISOString().split("T")[0],
    time: "20:00",
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setFormData((prev) => ({
        ...prev,
        casting: arrayMove(
          prev.casting,
          active.id as number,
          over.id as number
        ),
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date: formatDateToISO(date) }));
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
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

  const handleAddActor = (actorName: string) => {
    if (actorName && !formData.casting.includes(actorName)) {
      setFormData((prev) => ({
        ...prev,
        casting: [...prev.casting, actorName],
      }));
    }
  };

  const handleRemoveActor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      casting: prev.casting.filter((_, i) => i !== index),
    }));
  };

  const handlePriceChange =
    (field: "ticketPrice" | "mdPrice") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [field]: value ? Number(value).toLocaleString() : "",
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.date ||
      !formData.time ||
      !formData.performanceName ||
      !formData.theater
    ) {
      toast.error("필수 필드(날짜, 시간, 공연명, 극장)를 모두 입력해주세요.");
      return;
    }

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

        const castingChanged =
          JSON.stringify(ticketData.casting || []) !==
          JSON.stringify(initialTicketData.casting || []);
        if (castingChanged) updateData.casting = ticketData.casting;

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

        if (Object.keys(updateData).length === 0) {
          toast.info("변경된 내용이 없습니다.");
          return;
        }

        await updateTicketMutation.mutateAsync({ id, data: updateData });
      } else {
        await createTicketMutation.mutateAsync(ticketData);
      }

      navigate("/");
    } catch (error: unknown) {
      console.error("티켓 저장 오류:", error);
    }
  };

  return {
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
    handleDateChange,
    handleRatingClick,
    handlePerformanceSelect,
    handleAddActor,
    handleRemoveActor,
    handlePriceChange,
    handleSubmit,
    navigate,
  };
}
