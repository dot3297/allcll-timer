import { useEffect, useRef, useState } from "react";

type Props = {
  /** Initial text in the input. */
  initialText: string;
  /** Save handler — called when "수정하기" pressed. */
  onSave: (text: string) => void;
  /** Delete handler — called when the trash icon is pressed. */
  onDelete: () => void;
  /** Close handler — called on backdrop click. */
  onClose: () => void;
};

/**
 * Bottom-sheet editor for an existing todo.
 *
 * Spec (Figma node 6880-707012):
 * - Anchored to viewport bottom, rounded top corners (16), bg #262626
 * - Drag handle at top
 * - Text input: dark bg, subtle border, clear-X icon
 * - Two outlined chips: 날짜 변경 ⇄ / 반복 ↻ (placeholders for now)
 * - Action row: trash square button + 수정하기 brand button (purple, dims when no text)
 * - Backdrop above the sheet (dim, click-to-close)
 */
export default function TodoEditSheet({ initialText, onSave, onDelete, onClose }: Props) {
  const [draft, setDraft] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const len = inputRef.current?.value.length ?? 0;
    inputRef.current?.setSelectionRange(len, len);
  }, []);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col justify-end"
      onClick={onClose}
      data-name="todo-edit-backdrop"
    >
      {/* Dim above the sheet */}
      <div className="flex-1 bg-black/30" aria-hidden="true" />

      {/* Sheet panel */}
      <div
        className="bg-[#262626] rounded-tl-[16px] rounded-tr-[16px] flex flex-col items-stretch px-[16px] pt-[8px] pb-[16px] gap-[12px]"
        onClick={(e) => e.stopPropagation()}
        data-name="todo-edit-sheet"
      >
        {/* Drag handle */}
        <div className="flex items-center justify-center pt-[4px] pb-[8px]" aria-hidden="true">
          <div className="bg-[#6d7278] h-[4px] w-[40px] rounded-full" />
        </div>

        {/* Text input */}
        <div className="relative h-[48px]">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            placeholder="할일을 입력하세요"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return;
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
              if (e.key === "Escape") onClose();
            }}
            className="peer w-full h-full rounded-[8px] border border-[#404040] focus:border-[#9678ff] bg-transparent text-[#f9f9fa] text-[14px] leading-[21px] font-['Pretendard:Regular',sans-serif] pl-[12px] pr-[40px] outline-none placeholder:text-[#6d7278] transition-colors"
            data-name="todo-edit-input"
          />
          {draft && (
            <button
              type="button"
              aria-label="입력 지우기"
              onClick={() => {
                setDraft("");
                inputRef.current?.focus();
              }}
              className="absolute right-[10px] top-1/2 -translate-y-1/2 size-[20px] rounded-full bg-[#6d7278] flex items-center justify-center active:scale-90 transition-transform"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="#262626" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Secondary chips: 날짜 변경 / 반복 (visual placeholders) */}
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            className="h-[32px] px-[12px] rounded-[36px] border border-[#404040] bg-transparent inline-flex items-center gap-[4px] text-[#d8d8d8] active:opacity-70 transition-opacity"
          >
            <span className="font-['Pretendard:Medium',sans-serif] text-[13px] leading-[18px]">
              날짜 변경
            </span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 4l3-2v4h7M12 10l-3 2v-4h-7" stroke="#D8D8D8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="h-[32px] px-[12px] rounded-[36px] border border-[#404040] bg-transparent inline-flex items-center gap-[4px] text-[#d8d8d8] active:opacity-70 transition-opacity"
          >
            <span className="font-['Pretendard:Medium',sans-serif] text-[13px] leading-[18px]">
              반복
            </span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2.5 7a4.5 4.5 0 0 1 8-2.8M11.5 7a4.5 4.5 0 0 1-8 2.8M11 2v3h-3M3 12V9h3"
                stroke="#D8D8D8"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Action row: trash + 수정하기 */}
        <div className="flex items-stretch gap-[8px] mt-[4px]">
          <button
            type="button"
            onClick={onDelete}
            aria-label="삭제"
            className="size-[48px] shrink-0 rounded-[8px] border border-[#404040] flex items-center justify-center active:scale-95 transition-transform"
            data-name="todo-edit-delete"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 4h10M5 4V2.5C5 2 5.5 1.5 6 1.5h4c.5 0 1 .5 1 1V4M4 4l.8 9c.05.6.55 1 1.1 1H10c.55 0 1.05-.4 1.1-1L12 4M7 7v5M9 7v5"
                stroke="#D8D8D8"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!draft.trim()}
            className="flex-1 h-[48px] rounded-[8px] bg-[#9678ff] text-white text-[14px] leading-[21px] font-['Pretendard:Medium',sans-serif] active:scale-[0.99] transition-transform disabled:opacity-40 disabled:active:scale-100"
            data-name="todo-edit-save"
          >
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
}
