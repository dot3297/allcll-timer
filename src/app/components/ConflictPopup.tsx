/**
 * ConflictPopup — 다른 기기 저장 기록 충돌 안내 (Figma 7418-116495 "Popup v.2.0")
 *
 * 타이머 홈에서 동기화 대기("대기") 기록을 탭하면 표시.
 * 같은 시간대에 다른 기기가 이미 저장한 기록이 있어 이 기록이 임시 보관 중임을 알리고,
 * "타임라인 보기"로 시간 수정(타임라인) 화면으로 이동해 기존 기록을 삭제하도록 유도한다.
 */
type Props = {
  /** "닫기" / 백드롭 탭 */
  onClose: () => void;
  /** "타임라인 보기" — 시간 수정 화면으로 이동 */
  onViewTimeline: () => void;
};

export default function ConflictPopup({ onClose, onViewTimeline }: Props) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center" data-name="conflict-popup">
      {/* 딤 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <style>{`@keyframes conflictPop { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      {/* 팝업 카드 (라이트) */}
      <div
        className="relative bg-white rounded-[16px] p-[24px] w-[343px] max-w-[480px] flex flex-col gap-[16px] items-center"
        style={{ animation: "conflictPop 0.25s cubic-bezier(0.22,1,0.36,1) forwards", boxShadow: "0px 4px 12px rgba(109,114,120,0.16)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-[32px] items-stretch w-full">
          {/* 제목 + 설명 */}
          <div className="flex flex-col gap-[16px] items-center w-full">
            <p className="font-['Pretendard:SemiBold',sans-serif] text-[18px] leading-[27px] text-[#262626] text-center w-full">
              다른 기기에 저장된 기록이 있어요
            </p>
            <p className="font-['Pretendard:Regular',sans-serif] text-[16px] leading-[24px] text-[#262626] text-center w-full">
              타임라인에서 기존 기록을 삭제하면<br />
              이 기록으로 저장할 수 있어요
            </p>
          </div>
          {/* 버튼: 닫기(아웃라인) / 타임라인 보기(브랜드) */}
          <div className="flex gap-[8px] items-stretch h-[44px] w-full">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[8px] border border-[#efeff0] bg-white text-[#333] text-[14px] leading-[21px] font-['Pretendard:Medium',sans-serif] active:scale-[0.98] transition-transform"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={onViewTimeline}
              className="flex-1 rounded-[8px] bg-[#9678ff] text-white text-[14px] leading-[21px] font-['Pretendard:Medium',sans-serif] active:bg-[#8461fa] transition-colors"
            >
              타임라인 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
