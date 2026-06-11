/**
 * CategoryHideSheet — 카테고리 숨기기/숨김 해제 옵션 바텀시트
 *
 * ## 개요
 * 카테고리를 숨기거나 숨김 해제할 때 범위를 선택하는 바텀시트. (Figma 7238-115925)
 *
 * ## variant='hide'
 * - 오늘 부터 숨기기 ('today'): 오늘 이후 날짜에서만 숨김, 지난 기록은 그대로 남음
 * - 전체 숨기기 ('all'): 지난 기록 포함 모든 날짜에서 숨김
 *
 * ## variant='unhide'
 * - 오늘 부터 숨김 해제 ('today'): 오늘 이후만 다시 표시, 지난 기록은 계속 숨김
 * - 전체 숨김 해제 ('all'): 지난 기록 포함 모든 날짜에서 다시 표시
 */
import { useState } from "react";

export type HideMode = "today" | "all";
export type SheetVariant = "hide" | "unhide";

type Props = {
  /** 시트 제목에 들어갈 라벨 (단일: 카테고리명, 다중: "N개 카테고리" 등). */
  label: string;
  /** 'hide' = 숨기기, 'unhide' = 숨김 해제. */
  variant: SheetVariant;
  /** "완료" 시 선택한 모드를 전달. */
  onConfirm: (mode: HideMode) => void;
  /** 백드롭/X 탭 시 닫기. */
  onClose: () => void;
};

const COPY: Record<SheetVariant, { suffix: string; today: { title: string; desc: string }; all: { title: string; desc: string } }> = {
  hide: {
    suffix: "숨기기",
    today: { title: "오늘 부터 숨기기", desc: "지난 기록은 그대로 남아요" },
    all: { title: "전체 숨기기", desc: "지난 기록을 포함해 모든 날짜에서 숨겨요" },
  },
  unhide: {
    suffix: "숨김 해제",
    today: { title: "오늘 부터 숨김 해제", desc: "지난 기록은 계속 숨겨둬요" },
    all: { title: "전체 숨김 해제", desc: "지난 기록을 포함해 모든 날짜에서 다시 보여요" },
  },
};

export default function CategoryHideSheet({ label, variant, onConfirm, onClose }: Props) {
  const [mode, setMode] = useState<HideMode>("today");
  const copy = COPY[variant];

  const Option = ({
    value,
    title,
    desc,
  }: {
    value: HideMode;
    title: string;
    desc: string;
  }) => {
    const selected = mode === value;
    return (
      <button
        type="button"
        onClick={() => setMode(value)}
        className={`flex items-center gap-[22px] px-[16px] py-[12px] rounded-[12px] w-full text-left transition-colors ${
          selected
            ? "bg-[rgba(150,120,255,0.1)] border border-[var(--color-border-brand)]"
            : "border border-transparent"
        }`}
        data-name={`hide-option-${value}`}
        aria-pressed={selected}
      >
        <div className="flex-1 min-w-0 flex flex-col">
          <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[var(--color-fg-text-inverse)]">
            {title}
          </p>
          <p className="font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-[var(--color-fg-text-muted)]">
            {desc}
          </p>
        </div>
        {/* 라디오 */}
        {selected ? (
          <div className="size-[24px] shrink-0 rounded-full bg-[var(--color-bg-brand)] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 6.2L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : (
          <div className="size-[24px] shrink-0 rounded-full border-[1.5px] border-[var(--color-fg-text-disable)]" />
        )}
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[85] flex flex-col justify-end"
      onClick={onClose}
      data-name="category-hide-backdrop"
    >
      <div className="flex-1 bg-black/40" aria-hidden="true" />

      <div
        className="bg-[var(--color-bg-weak)] rounded-tl-[16px] rounded-tr-[16px] flex flex-col items-stretch"
        onClick={(e) => e.stopPropagation()}
        data-name="category-hide-sheet"
      >
        {/* Header: 제목 + X */}
        <div className="flex items-start justify-between gap-[12px] p-[16px]">
          <p className="flex-1 min-w-0 font-['Pretendard:SemiBold',sans-serif] text-[18px] leading-[27px] text-[var(--color-fg-text-weak)]">
            {label} {copy.suffix}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="size-[24px] shrink-0 flex items-center justify-center active:opacity-70 transition-opacity"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5L15 15M15 5L5 15" stroke="var(--color-fg-text-weak)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Options */}
        <div className="flex flex-col px-[16px] pb-[16px]">
          <Option value="today" title={copy.today.title} desc={copy.today.desc} />
          <Option value="all" title={copy.all.title} desc={copy.all.desc} />
        </div>

        {/* Footer: 완료 */}
        <div className="px-[16px] pb-[8px]">
          <button
            type="button"
            onClick={() => onConfirm(mode)}
            className="w-full h-[56px] rounded-[8px] bg-[var(--color-bg-brand)] text-white text-[16px] leading-[24px] font-['Pretendard:Medium',sans-serif] active:bg-[var(--color-bg-brand-pressed)] transition-colors"
            data-name="hide-confirm"
          >
            완료
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[34px] shrink-0" />
      </div>
    </div>
  );
}
