/**
 * CategoryActionSheet — 카테고리 선택 시 뜨는 액션 바텀시트 (Figma 7526-117490)
 *
 * 카테고리 편집 화면(SettingsScreen)에서 카테고리 행을 탭하면 표시된다.
 * 이름 수정 / 숨기기(또는 숨김 해제) / 삭제(코랄) + 닫기 버튼.
 */
import iconRename from "../../imports/할일/icon-category-edit.svg";
import iconHide from "../../imports/할일/icon-hide.svg";
import iconDelete from "../../imports/할일/icon-trash-coral.svg";

type Props = {
  /** 대상 카테고리가 현재 숨김 상태인지 — true면 "숨김 해제"로 표시. */
  isHidden: boolean;
  /** "이름 수정" 선택 */
  onRename: () => void;
  /** "숨기기" / "숨김 해제" 선택 */
  onToggleHide: () => void;
  /** "삭제" 선택 */
  onDelete: () => void;
  /** 닫기(백드롭/닫기 버튼) */
  onClose: () => void;
};

export default function CategoryActionSheet({ isHidden, onRename, onToggleHide, onDelete, onClose }: Props) {
  return (
    <>
      <style>{`@keyframes catActionSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      {/* 딤 백드롭 */}
      <div className="fixed inset-0 z-[80] bg-black/50" onClick={onClose} />
      {/* 바텀시트 */}
      <div
        className="fixed inset-x-0 bottom-0 z-[81] bg-[var(--color-bg-weak)] rounded-t-[16px] flex flex-col items-center"
        style={{ animation: "catActionSheetUp 0.28s cubic-bezier(0.22,1,0.36,1)" }}
        data-name="category-action-sheet"
      >
        {/* 핸들 */}
        <div className="w-full flex justify-center py-[9px]">
          <div className="h-[5px] w-[40px] rounded-full bg-[var(--color-fg-text-disable)]" />
        </div>

        {/* 옵션 리스트 — 좌측 아이콘 + 좌측정렬 텍스트 */}
        <div className="w-full px-[16px]">
          {/* 이름 수정 */}
          <button
            type="button"
            onClick={onRename}
            className="w-full flex gap-[12px] items-center py-[16px] active:opacity-70 transition-opacity"
          >
            <img src={iconRename} alt="" className="size-[24px] shrink-0" />
            <span className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[var(--color-fg-text-weak)]">
              이름 수정
            </span>
          </button>
          <div className="h-px w-full bg-[var(--color-border-subtle)]" />

          {/* 숨기기 / 숨김 해제 */}
          <button
            type="button"
            onClick={onToggleHide}
            className="w-full flex gap-[12px] items-center py-[16px] active:opacity-70 transition-opacity"
          >
            <img src={iconHide} alt="" className="size-[24px] shrink-0" />
            <span className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[var(--color-fg-text-weak)]">
              {isHidden ? "숨김 해제" : "숨기기"}
            </span>
          </button>
          <div className="h-px w-full bg-[var(--color-border-subtle)]" />

          {/* 삭제 (코랄) */}
          <button
            type="button"
            onClick={onDelete}
            className="w-full flex gap-[12px] items-center py-[16px] active:opacity-70 transition-opacity"
          >
            <img src={iconDelete} alt="" className="size-[24px] shrink-0" />
            <span className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[var(--color-bg-error-pressed)]">
              삭제
            </span>
          </button>
        </div>

        {/* 닫기 버튼 */}
        <div className="w-full p-[16px]">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-[56px] rounded-[8px] bg-[var(--color-bg-brand)] active:bg-[var(--color-bg-brand-pressed)] transition-colors flex items-center justify-center"
          >
            <span className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-white">닫기</span>
          </button>
        </div>

        {/* 하단 안전영역 */}
        <div className="h-[34px] w-full shrink-0" />
      </div>
    </>
  );
}
