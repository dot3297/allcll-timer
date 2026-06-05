/**
 * ConfirmPopup — 범용 확인/취소 팝업
 *
 * ## 개요
 * 앱 전반에서 재사용되는 확인/취소 다이얼로그 팝업 컴포넌트.
 * 할일 "전체 삭제" 확인 등 사용자 의사 결정이 필요한 다양한 상황에서 사용된다.
 *
 * ## 주요 기능
 * - title, message, confirmLabel, cancelLabel props로 텍스트 완전 커스터마이즈
 * - title에서 \n 개행 문자 지원 (whitespace-pre-line)
 * - 확인 버튼: onConfirm 콜백 호출
 * - 취소 버튼: onCancel 콜백 호출
 */
type Props = {
  /** Title text. Use \n for explicit line breaks; the popup honours `whitespace-pre-line`. */
  title: string;
  /** Optional description text shown below the title (Regular 16px). */
  description?: string;
  /** Optional cancel-button label. Defaults to "취소". */
  cancelLabel?: string;
  /** Optional confirm-button label. Defaults to "확인". */
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Generic confirmation popup used for destructive actions.
 *
 * Spec (Figma node 6880-616860 → "완료한 할 일 전체 삭제" dialog):
 * - Card: 343 × 173, padding 24, radius 16, bg color/bg/muted = #333
 * - Title: Pretendard SemiBold 18/27, color/fg-text/solid = #fff, centered, multi-line
 * - Buttons: 44px tall, gap 8, equal width
 *   - 취소: outlined (border #6d7278, white text)
 *   - 확인: brand solid (#9678ff, white text)
 * - Backdrop: black/50, click-outside-to-cancel
 */
export default function ConfirmPopup({
  title,
  description,
  cancelLabel = "취소",
  confirmLabel = "확인",
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50"
      onClick={onCancel}
      data-name="confirm-popup-backdrop"
    >
      <div
        className="bg-[#333] rounded-[16px] p-[24px] w-[343px] flex flex-col gap-[32px] items-stretch"
        onClick={(e) => e.stopPropagation()}
        data-name="confirm-popup"
      >
        <div className="flex flex-col gap-[16px] items-center">
          <p className="font-['Pretendard:SemiBold',sans-serif] text-white text-[18px] text-center leading-[27px] whitespace-pre-line w-full">
            {title}
          </p>
          {description && (
            <p className="font-['Pretendard:Regular',sans-serif] text-[#b6b8b9] text-[16px] text-center leading-[24px] whitespace-pre-line w-full">
              {description}
            </p>
          )}
        </div>

        <div className="flex gap-[8px] items-stretch h-[44px]">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-[8px] border border-[#6d7278] bg-transparent text-[#f9f9fa] text-[14px] leading-[21px] font-['Pretendard:Medium',sans-serif] active:opacity-70 transition-opacity"
            data-name="confirm-cancel-btn"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-[8px] bg-[#9678ff] text-white text-[14px] leading-[21px] font-['Pretendard:Medium',sans-serif] active:bg-[#654ec1] transition-colors"
            data-name="confirm-ok-btn"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
