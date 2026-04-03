import { useEffect, useRef, useState } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActorSearch } from "@/queries/actors";
import { useCreateActor } from "@/queries/actors";
import type { Actor } from "@/types/actor";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

const domainLabel: Record<string, string> = {
  뮤지컬: "뮤지컬",
  연극: "연극",
  클래식: "클래식",
  기타: "기타",
};

type CastingFieldProps = {
  casting: Actor[];
  onAddActor: (actor: Actor) => void;
  onRemoveActor: (index: number) => void;
};

export default function CastingField({
  casting,
  onAddActor,
  onRemoveActor,
}: CastingFieldProps) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const createActorMutation = useCreateActor();

  // debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(inputValue.trim()), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data: searchResults, isLoading: isSearching } =
    useActorSearch(debouncedQuery);

  // 클릭 외부 감지 → 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 검색 결과 바뀌면 하이라이트 초기화
  useEffect(() => {
    setHighlightedIndex(-1);
    itemRefs.current = [];
  }, [searchResults, isOpen]);

  const handleSelect = (actor: Actor) => {
    onAddActor(actor);
    setInputValue("");
    setDebouncedQuery("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleCreateActor = async () => {
    const name = inputValue.trim();
    if (!name) return;
    try {
      const actor = await createActorMutation.mutateAsync({ name });
      onAddActor(actor);
      setInputValue("");
      setDebouncedQuery("");
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    } catch {
      toast.error("배우 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const showDropdown =
    isOpen && debouncedQuery.length > 0 && (isSearching || (searchResults !== undefined));

  const filteredResults = searchResults?.filter(
    (r) => !casting.some((a) => a.id === r.id)
  );

  return (
    <div>
      <Label htmlFor="casting">캐스팅</Label>
      <div className="space-y-2" ref={containerRef}>
        {/* 선택된 배우 태그 */}
        {casting.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {casting.map((actor, index) => (
              <div
                key={actor.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm"
              >
                <span>{actor.name}</span>
                {actor.domain && (
                  <span className="text-xs text-primary/60">
                    {domainLabel[actor.domain] ?? actor.domain}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveActor(index)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 검색 입력 */}
        <div className="relative">
          <Input
            ref={inputRef}
            id="casting"
            type="text"
            enterKeyHint="search"
            placeholder="배우 이름으로 검색"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (inputValue.trim()) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsOpen(false);
                setHighlightedIndex(-1);
                return;
              }

              if (!showDropdown || isSearching) return;

              // filteredResults 항목 수 + 새 배우 등록 버튼 1개
              const itemCount = (filteredResults?.length ?? 0) + 1;

              if (e.key === "ArrowDown") {
                e.preventDefault();
                const next = (highlightedIndex + 1) % itemCount;
                setHighlightedIndex(next);
                itemRefs.current[next]?.scrollIntoView({ block: "nearest" });
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                const prev = (highlightedIndex - 1 + itemCount) % itemCount;
                setHighlightedIndex(prev);
                itemRefs.current[prev]?.scrollIntoView({ block: "nearest" });
              } else if (e.key === "Enter") {
                if (highlightedIndex === -1) return;
                e.preventDefault();
                const resultsLength = filteredResults?.length ?? 0;
                if (highlightedIndex < resultsLength) {
                  handleSelect(filteredResults![highlightedIndex]);
                } else {
                  void handleCreateActor();
                }
              }
            }}
            className="w-full"
            autoComplete="off"
          />

          {/* 드롭다운 */}
          {showDropdown && (
            <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
              {isSearching ? (
                <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  검색 중...
                </div>
              ) : filteredResults && filteredResults.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto divide-y divide-border/50">
                  {filteredResults.map((actor, idx) => (
                    <li key={actor.id}>
                      <button
                        ref={(el) => { itemRefs.current[idx] = el; }}
                        type="button"
                        className={cn(
                          "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                          highlightedIndex === idx ? "bg-muted/80" : "hover:bg-muted/60"
                        )}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(actor)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {actor.name}
                            </span>
                            {actor.domain && (
                              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {domainLabel[actor.domain] ?? actor.domain}
                              </span>
                            )}
                          </div>
                          {actor.performances.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {actor.performances.slice(0, 3).join(" · ")}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {/* 새 배우 등록 */}
              {!isSearching && (
                <button
                  ref={(el) => { itemRefs.current[filteredResults?.length ?? 0] = el; }}
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground transition-colors border-t border-border/50",
                    highlightedIndex === (filteredResults?.length ?? 0) ? "bg-muted/80" : "hover:bg-muted/60"
                  )}
                  onMouseEnter={() => setHighlightedIndex(filteredResults?.length ?? 0)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleCreateActor}
                  disabled={createActorMutation.isPending}
                >
                  {createActorMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>
                    &quot;{inputValue.trim()}&quot; 새 배우로 등록
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
