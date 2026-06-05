/**
 * CategoryAddPopup — 할일 카테고리 추가 팝업
 *
 * ## 개요
 * 할일 화면에서 "전체 +" 버튼 또는 "카테고리 추가" 칩을 탭했을 때 표시되는 팝업 컴포넌트.
 * 새 카테고리 이름을 입력받아 부모 컴포넌트에 전달한다.
 *
 * ## 주요 기능
 * - 카테고리 이름 텍스트 입력 필드
 * - 확인 시 onConfirm(name) 콜백으로 부모에게 신규 카테고리명 전달
 * - 취소 시 onCancel 콜백 호출
 * - 팝업 열릴 때 입력 필드에 자동 포커스
 */
import { useEffect, useRef, useState } from "react";

type Props = {
  onCancel: () => void;
  onConfirm: (name: string) => void;
  defaultValue?: string;
};

/**
 * Category-add popup.
 *
 * Spec (Figma node 6324-228393 → Popup v.2.0):
 * - Card: 343 × 223, padding 24, radius 16 (radius/md = 12 used inline), bg color/bg/muted = #333
 * - Container: 295 × 175 with 32px vertical gap between (title • input • button-group)
 * - Title: Heading 5/Bold (Pretendard SemiBold 18/27), color/fg-text/solid = #fff
 * - Text input: 295 × 40, radius 8, border color/border/solid = #b6b8b9 (focus → brand)
 * - Buttons: 44px tall, gap 8, equal-width
 *   - Cancel: outlined (border subtle #6d7278, white text)
 *   - Confirm: brand-solid (#9678ff bg, white text)
 * - Backdrop: opacity/dim = 50 → black/50
 */
export default function CategoryAddPopup({ onCancel, onConfirm, defaultValue = "" }: Props) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Autofocus the input when the popup mounts.
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleConfirm = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50"
      onClick={onCancel}
      data-name="category-popup-backdrop"
    >
      <div
        className="bg-[#333] rounded-[16px] p-[24px] w-[343px] flex flex-col gap-[32px] items-stretch"
        onClick={(e) => e.stopPropagation()}
        data-name="category-popup"
      >
        {/* Title: Heading 5/Bold = SemiBold 18/27 */}
        <p className="font-['Pretendard:SemiBold',sans-serif] text-white text-[18px] text-center leading-[27px]">
          카테고리 추가
        </p>

        {/* Text input: gray border default, brand purple on focus */}
        <div className="relative h-[40px]">
          <input
            ref={inputRef}
            type="text"
            value={value}
            placeholder="오늘 할 것들"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm();
              if (e.key === "Escape") onCancel();
            }}
            className="peer w-full h-full rounded-[8px] border border-[#b6b8b9] focus:border-[#9678ff] bg-transparent text-[#f9f9fa] text-[14px] font-['Pretendard:Regular',sans-serif] leading-[21px] pl-[12px] pr-[36px] outline-none placeholder:text-[#95999d] transition-colors"
            data-name="category-input"
          />
          {value && (
            <button
              type="button"
              aria-label="입력 지우기"
              onClick={() => {
                setValue("");
                inputRef.current?.focus();
              }}
              className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] rounded-full bg-[#6d7278] flex items-center justify-center active:scale-90 transition-transform"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="#262626" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Button group: gap 8, equal-width, 44px tall */}
        <div className="flex gap-[8px] items-stretch h-[44px]">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-[8px] border border-[#6d7278] bg-transparent text-[#f9f9fa] text-[14px] leading-[21px] font-['Pretendard:Medium',sans-serif] active:scale-[0.98] transition-transform"
            data-name="cancel-btn"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!value.trim()}
            className="flex-1 rounded-[8px] bg-[#9678ff] text-white text-[14px] leading-[21px] font-['Pretendard:Medium',sans-serif] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
            data-name="confirm-btn"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
