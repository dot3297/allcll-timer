/**
 * TodoEditSheet — 할일 항목 편집 바텀시트
 *
 * ## 개요
 * 할일 화면에서 기존 할일 항목을 탭했을 때 표시되는 바텀시트 컴포넌트.
 * 할일 내용을 수정하거나 삭제할 수 있다.
 *
 * ## 주요 기능
 * - initialText prop으로 기존 할일 내용을 입력 필드에 pre-fill
 * - 내용 수정 후 저장 시 onSave(newText) 콜백으로 부모에게 전달
 * - 삭제 버튼: onDelete 콜백 호출
 * - 바텀시트 열릴 때 입력 필드에 자동 포커스
 */
import { useEffect, useRef, useState } from "react";
import iconDateChange from "../../imports/할일/icon-date-change.svg";
import iconRepeat from "../../imports/할일/icon-repeat.svg";
import iconTrash from "../../imports/할일/icon-trash.svg";

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

        {/* Text input (Figma 7469-145952: h-56, 16px, bg muted + 클리어 X) */}
        <div className="relative h-[56px]">
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
            className="peer w-full h-full rounded-[8px] border border-[#6d7278] focus:border-[#f9f9fa] bg-[var(--color-bg-muted)] text-[#f9f9fa] text-[16px] leading-[24px] font-['Pretendard:Regular',sans-serif] pl-[16px] pr-[48px] outline-none placeholder:text-[#6d7278] transition-colors"
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
              className="absolute right-[16px] top-1/2 -translate-y-1/2 size-[20px] rounded-full bg-[#6d7278] flex items-center justify-center active:scale-90 transition-transform"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="#262626" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Secondary chips: 날짜 변경 / 반복 (Figma 7519-117537) */}
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            className="h-[32px] px-[12px] py-[4px] rounded-full border border-[#6d7278] bg-transparent inline-flex items-center gap-[2px] active:opacity-70 transition-opacity"
          >
            <span className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[#868b90]">
              날짜 변경
            </span>
            <img src={iconDateChange} alt="" className="size-[16px]" />
          </button>
          <button
            type="button"
            className="h-[32px] px-[12px] py-[4px] rounded-full border border-[#6d7278] bg-transparent inline-flex items-center gap-[2px] active:opacity-70 transition-opacity"
          >
            <span className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[#868b90]">
              반복
            </span>
            <img src={iconRepeat} alt="" className="size-[16px]" />
          </button>
        </div>

        {/* Action row: trash(56) + 수정하기(56) — Figma 7469-145952 */}
        <div className="flex items-stretch gap-[8px] mt-[4px]">
          <button
            type="button"
            onClick={onDelete}
            aria-label="삭제"
            className="size-[56px] shrink-0 rounded-[8px] bg-[var(--color-bg-muted)] flex items-center justify-center active:scale-95 transition-transform"
            data-name="todo-edit-delete"
          >
            <img src={iconTrash} alt="" className="size-[20px]" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!draft.trim()}
            className="flex-1 h-[56px] rounded-[8px] bg-[#9678ff] text-white text-[16px] leading-[24px] font-['Pretendard:Medium',sans-serif] active:scale-[0.99] transition-transform disabled:opacity-40 disabled:active:scale-100"
            data-name="todo-edit-save"
          >
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
}
