/**
 * CategoryDuplicatePopup — 동일 이름 카테고리 추가 시 확인 팝업
 *
 * Figma 7277-184515 (Popup v2.0)
 * - 네  : 기존 카테고리 사용
 * - 아니요: 같은 이름의 신규 카테고리 생성 (오늘 날짜까지의 데이터는 기존에 남기고 오늘부터 새로 시작)
 */
type Props = {
  /** "네" — 기존 카테고리 사용 */
  onUseExisting: () => void;
  /** "아니요" — 같은 이름의 신규 카테고리 생성 */
  onCreateNew: () => void;
  /** 백드롭 탭 — 아무 동작 없이 닫기 */
  onClose: () => void;
};

export default function CategoryDuplicatePopup({ onUseExisting, onCreateNew, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[88] flex items-center justify-center bg-black/50"
      onClick={onClose}
      data-name="category-dup-backdrop"
    >
      <div
        className="bg-[#333] rounded-[16px] p-[24px] w-[343px] flex flex-col gap-[32px] items-stretch"
        onClick={(e) => e.stopPropagation()}
        data-name="category-dup-popup"
      >
        {/* Title (2 lines, centered) */}
        <p className="font-['Pretendard:SemiBold',sans-serif] text-white text-[18px] leading-[27px] text-center">
          동일한 이름의 카테고리가 이미 있어요
          <br />
          기존 카테고리를 사용할까요?
        </p>

        {/* Buttons: 아니요(outline) / 네(brand) */}
        <div className="flex gap-[8px] items-stretch h-[44px]">
          <button
            type="button"
            onClick={onCreateNew}
            className="flex-1 rounded-[8px] border border-[#6d7278] bg-transparent text-[#f9f9fa] text-[14px] leading-[21px] font-['Pretendard:Medium',sans-serif] active:scale-[0.98] transition-transform"
            data-name="dup-no"
          >
            아니요
          </button>
          <button
            type="button"
            onClick={onUseExisting}
            className="flex-1 rounded-[8px] bg-[#9678ff] text-white text-[14px] leading-[21px] font-['Pretendard:Medium',sans-serif] active:scale-[0.98] transition-transform"
            data-name="dup-yes"
          >
            네
          </button>
        </div>
      </div>
    </div>
  );
}
