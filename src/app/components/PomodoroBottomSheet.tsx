import { useState, useRef } from "react";

// ── Options ──────────────────────────────────────────────────────────────────
const FOCUS_OPTIONS  = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map(n => `${n}분`);
const BREAK_OPTIONS  = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map(n => `${n}분`);

const DEFAULT_FOCUS_IDX = FOCUS_OPTIONS.indexOf("25분");  // 25분
const DEFAULT_BREAK_IDX = BREAK_OPTIONS.indexOf("5분");   // 5분

// ── DrumPicker ───────────────────────────────────────────────────────────────
const ITEM_H = 48; // px per row

function DrumPicker({
  options,
  selectedIdx,
  onChange,
}: {
  options: string[];
  selectedIdx: number;
  onChange: (idx: number) => void;
}) {
  const startYRef = useRef<number | null>(null);

  const prev = selectedIdx > 0                 ? options[selectedIdx - 1] : null;
  const curr = options[selectedIdx];
  const next = selectedIdx < options.length - 1 ? options[selectedIdx + 1] : null;

  return (
    <div
      className="relative select-none"
      style={{ width: 100, height: ITEM_H * 3 }}
      onTouchStart={(e) => { startYRef.current = e.touches[0].clientY; }}
      onTouchEnd={(e) => {
        if (startYRef.current === null) return;
        const dy = startYRef.current - e.changedTouches[0].clientY;
        if (dy > 20)       onChange(Math.min(options.length - 1, selectedIdx + 1));
        else if (dy < -20) onChange(Math.max(0, selectedIdx - 1));
        startYRef.current = null;
      }}
    >
      {/* Selected highlight */}
      <div
        className="absolute left-0 right-0 bg-[#F2F2F2] rounded-[8px] pointer-events-none"
        style={{ top: ITEM_H, height: ITEM_H }}
      />

      {/* Top: previous item */}
      <button
        type="button"
        className="absolute left-0 right-0 flex items-center justify-center cursor-pointer disabled:cursor-default"
        style={{ top: 0, height: ITEM_H }}
        disabled={!prev}
        onClick={() => prev && onChange(selectedIdx - 1)}
      >
        <p className="font-['Pretendard:Medium',sans-serif] text-[14px] text-[#b6b8b9]">
          {prev ?? ""}
        </p>
      </button>

      {/* Middle: selected */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center"
        style={{ top: ITEM_H, height: ITEM_H }}
      >
        <p className="font-['Pretendard:SemiBold',sans-serif] text-[16px] text-[#333]">
          {curr}
        </p>
      </div>

      {/* Bottom: next item */}
      <button
        type="button"
        className="absolute left-0 right-0 flex items-center justify-center cursor-pointer disabled:cursor-default"
        style={{ top: ITEM_H * 2, height: ITEM_H }}
        disabled={!next}
        onClick={() => next && onChange(selectedIdx + 1)}
      >
        <p className="font-['Pretendard:Medium',sans-serif] text-[14px] text-[#b6b8b9]">
          {next ?? ""}
        </p>
      </button>

      {/* Top/bottom fade overlays */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: 0, height: ITEM_H,
          background: "linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0))",
        }}
      />
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: 0, height: ITEM_H,
          background: "linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0))",
        }}
      />
    </div>
  );
}

// ── PomodoroBottomSheet ───────────────────────────────────────────────────────
export interface PomodoroSettings {
  focusMinutes: number;
  breakMinutes: number;
}

export default function PomodoroBottomSheet({
  onConfirm,
  onClose,
}: {
  onConfirm: (settings: PomodoroSettings) => void;
  onClose: () => void;
}) {
  const [focusIdx, setFocusIdx] = useState(DEFAULT_FOCUS_IDX);
  const [breakIdx, setBreakIdx] = useState(DEFAULT_BREAK_IDX);

  const handleConfirm = () => {
    onConfirm({
      focusMinutes: parseInt(FOCUS_OPTIONS[focusIdx]),
      breakMinutes: parseInt(BREAK_OPTIONS[breakIdx]),
    });
  };

  return (
    <>
      {/* Dimmed backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white rounded-tl-[20px] rounded-tr-[20px] overflow-hidden shadow-[0px_-4px_24px_rgba(0,0,0,0.08)]">

        {/* Drag handle */}
        <div className="flex justify-center pt-[10px] pb-[4px]">
          <div className="w-[40px] h-[4px] rounded-full bg-[#d8d8d8]" />
        </div>

        {/* Title */}
        <div className="flex items-center justify-center px-[20px] py-[16px]">
          <p className="font-['Pretendard:SemiBold',sans-serif] text-[18px] leading-[27px] text-[#333]">
            뽀모도로 설정
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#F2F2F2] mx-0" />

        {/* 집중시간 row */}
        <div className="flex items-center justify-between px-[24px] py-[12px]">
          <p className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[#333]">
            집중시간
          </p>
          <DrumPicker
            options={FOCUS_OPTIONS}
            selectedIdx={focusIdx}
            onChange={setFocusIdx}
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-[#F2F2F2]" />

        {/* 휴식시간 row */}
        <div className="flex items-center justify-between px-[24px] py-[12px]">
          <p className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[#333]">
            휴식시간
          </p>
          <DrumPicker
            options={BREAK_OPTIONS}
            selectedIdx={breakIdx}
            onChange={setBreakIdx}
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-[#F2F2F2]" />

        {/* Confirm button */}
        <div className="px-[20px] pt-[16px] pb-[36px]">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full h-[48px] bg-[#9678ff] rounded-[12px] flex items-center justify-center active:opacity-80 transition-opacity"
          >
            <p className="font-['Pretendard:SemiBold',sans-serif] text-[16px] leading-[24px] text-white">
              확인
            </p>
          </button>
        </div>

      </div>
    </>
  );
}
