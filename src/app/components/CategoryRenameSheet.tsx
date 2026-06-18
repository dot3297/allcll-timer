/**
 * CategoryRenameSheet — 카테고리 이름 변경 바텀시트
 *
 * ## 개요
 * 설정 화면에서 카테고리를 선택한 뒤 이름 변경을 선택하면 표시되는 바텀시트 컴포넌트.
 * 기존 카테고리 이름이 입력 필드에 미리 채워진 상태로 열린다.
 *
 * ## 주요 기능
 * - initialName prop으로 기존 이름을 입력 필드에 pre-fill
 * - 이름 수정 후 확인 시 onRename(newName) 콜백으로 부모에게 전달
 * - 취소 시 onCancel 콜백 호출
 * - 바텀시트 열릴 때 입력 필드에 자동 포커스
 */
import { useEffect, useRef, useState } from "react";
import iconTrash from "../../imports/할일/icon-trash-gray.svg";

type Props = {
  /** Current category name (pre-filled in the input). */
  initialName: string;
  /** Called when "수정하기" is pressed with the new trimmed name. */
  onSave: (newName: string) => void;
  /** Called when the trash button is pressed — delete this category. */
  onDelete: () => void;
  /** Called when backdrop is tapped or Escape pressed. */
  onClose: () => void;
};

/**
 * Bottom-sheet for renaming a category.
 *
 * Spec (Figma node 6880-837432):
 * - Same sheet chrome as TodoEditSheet (drag handle, #262626 bg, rounded top)
 * - Input: bg #333, border white (focused), h-56, p-16, rounded-8, Pretendard Regular 16
 * - Clear-X icon on the right
 * - Action row: trash icon (56×56, #6d7278) + "수정하기" brand button (#9678ff)
 */
export default function CategoryRenameSheet({ initialName, onSave, onDelete, onClose }: Props) {
  const [draft, setDraft] = useState(initialName);
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
      className="fixed inset-0 z-[90] flex flex-col justify-end"
      onClick={onClose}
      data-name="category-rename-backdrop"
    >
      {/* Dim */}
      <div className="flex-1 bg-black/30" aria-hidden="true" />

      {/* Sheet */}
      <div
        className="bg-[#262626] rounded-tl-[16px] rounded-tr-[16px] flex flex-col items-stretch px-[16px] pt-[8px] pb-[16px] gap-[8px]"
        onClick={(e) => e.stopPropagation()}
        data-name="category-rename-sheet"
      >
        {/* Drag handle */}
        <div className="flex items-center justify-center pt-[4px] pb-[4px]" aria-hidden="true">
          <div className="bg-[#6d7278] h-[5px] w-[40px] rounded-full" />
        </div>

        {/* Text input — bg #333, white border (focused state per Figma), h-56 */}
        <div className="relative h-[56px]">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            placeholder="카테고리 이름을 입력하세요"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return;
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
              if (e.key === "Escape") onClose();
            }}
            className="peer w-full h-full rounded-[8px] border border-[#404040] focus:border-[#f9f9fa] bg-[#333] text-[#f9f9fa] text-[16px] leading-[24px] font-['Pretendard:Regular',sans-serif] pl-[16px] pr-[48px] outline-none placeholder:text-[#6d7278] transition-colors"
            data-name="category-rename-input"
          />
          {draft && (
            <button
              type="button"
              aria-label="입력 지우기"
              onClick={() => {
                setDraft("");
                inputRef.current?.focus();
              }}
              className="absolute right-[12px] top-1/2 -translate-y-1/2 size-[24px] rounded-full bg-[#6d7278] flex items-center justify-center active:scale-90 transition-transform"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="#262626" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Action row: trash(삭제) + 수정하기 (Figma 7546-116838) */}
        <div className="flex items-stretch gap-[8px] mt-[8px]">
          {/* Trash — 이 카테고리 삭제 */}
          <button
            type="button"
            onClick={onDelete}
            aria-label="삭제"
            className="size-[56px] shrink-0 rounded-[8px] bg-[var(--color-bg-muted)] flex items-center justify-center active:scale-95 transition-transform"
            data-name="category-rename-delete"
          >
            <img src={iconTrash} alt="" className="size-[20px]" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!draft.trim() || draft.trim() === initialName}
            className="flex-1 h-[56px] rounded-[8px] bg-[#9678ff] text-white text-[16px] leading-[24px] font-['Pretendard:Medium',sans-serif] active:scale-[0.99] transition-transform disabled:opacity-40 disabled:active:scale-100"
            data-name="category-rename-save"
          >
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
}
