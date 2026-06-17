/**
 * TimeEditScreen — 타이머 시간 수정 화면 (Figma 7429-114411 "타이머_시간 수정")
 *
 * 플로팅 메뉴의 "시간 수정"에서 진입. 하루 측정 기록을 타임라인으로 보여주고,
 * 상단 스테퍼로 총 시간을 조정하며, 비어있는 구간엔 기록을 추가(+)할 수 있는 화면.
 *
 * - 라이트 테마(흰 배경)
 * - 좌측: 시간 라벨 + 컬러 타임라인 바(학습=노랑 #f8d884 / 휴식=코랄 #ff8080)
 * - 우측: 기록 라벨(과목·시간) 또는 "추가하기" 추가 박스
 *
 * 현재는 UI 전용(더미 데이터). 실제 편집 로직은 추후 연동.
 *
 * conflict=true 로 진입(충돌 팝업 "타임라인 보기")하면, 상단에 "기존 기록 vs 새로 측정한 기록"
 * 선택 패널과 하단 저장 버튼이 추가된다. (기존 CategoryHideSheet 라디오 패턴 차용)
 */
import { useState } from "react";
import { useOffline } from "../contexts/OfflineContext";

type TimelineRow =
  | { type: "label"; time: string; color: string; name: string; duration: string; dim?: boolean }
  | { type: "box"; time: string; color?: string; text: string; add?: boolean };

const ROWS: TimelineRow[] = [
  { type: "box", time: "07:50", text: "쉬었어요" },
  { type: "label", time: "07:50", color: "#f8d884", name: "수학", duration: "2시간 49분" },
  { type: "box", time: "07:50", text: "추가하기", add: true },
  { type: "label", time: "07:50", color: "#ff8080", name: "국어", duration: "2시간 49분" },
  { type: "label", time: "07:50", color: "#ff8080", name: "잠깐 쉬었어요", duration: "2시간 49분", dim: true },
  { type: "label", time: "07:50", color: "#ff8080", name: "국어", duration: "2시간 49분" },
  { type: "box", time: "07:50", text: "추가하기", add: true },
  { type: "label", time: "07:50", color: "#ff8080", name: "국어", duration: "2시간 49분" },
  { type: "box", time: "07:50", text: "추가하기", add: true },
  { type: "label", time: "07:50", color: "#ff8080", name: "국어", duration: "2시간 49분" },
  { type: "box", time: "07:50", text: "추가하기", add: true },
];

/** 원형 회색 스테퍼 버튼 (Figma: Stepperleft/right) */
function Stepper({ dir }: { dir: "left" | "right" }) {
  return (
    <button
      type="button"
      aria-label={dir === "left" ? "시간 줄이기" : "시간 늘리기"}
      className="shrink-0 size-[32px] rounded-full bg-[#f2f2fa] flex items-center justify-center active:scale-95 transition-transform"
    >
      <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={dir === "left" ? "M14.5 7L9.5 12L14.5 17" : "M9.5 7L14.5 12L9.5 17"}
          stroke="#b6b8b9"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function TimeEditScreen({
  onBack,
  conflict = false,
  onResolve,
}: {
  onBack?: () => void;
  /** 충돌(다른 기기 저장) 해소 모드 */
  conflict?: boolean;
  /** 충돌 해소 완료(저장) 시 */
  onResolve?: () => void;
}) {
  // 헤더 날짜 (Figma 텍스트)
  const dateTitle = "12월 13일(수)";

  // 충돌 해소 — 기존 기록 vs 새로 측정한(대기) 기록 중 선택
  const { pendingTimers, resolvePendingTimers } = useOffline();
  const newRec = pendingTimers.find((t) => !t.synced) ?? { name: "한국사", time: "00:00:01" };
  const [picked, setPicked] = useState<"existing" | "new" | null>(null);

  return (
    <div className="bg-white h-full w-full flex flex-col relative overflow-hidden" data-name="타이머_시간 수정">
      {/* ── Status bar ── */}
      <div className="h-[42px] relative w-full shrink-0">
        <p
          className="absolute font-['SF_Pro:Medium',sans-serif] font-[510] text-[#333] text-[15px] tracking-[-0.165px] whitespace-nowrap"
          style={{ fontVariationSettings: "'wdth' 100", left: 29.5, top: "calc(50% - 9px)" }}
        >
          9:41
        </p>
      </div>

      {/* ── Nav bar (뒤로 / 날짜 / 도움말) ── */}
      <div className="h-[56px] shrink-0 relative w-full flex items-center justify-between px-[12px]">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로"
          className="size-[24px] flex items-center justify-center active:opacity-70 transition-opacity"
        >
          <svg className="size-[24px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5L8 12L15 19" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="absolute left-1/2 -translate-x-1/2 font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[#333] whitespace-nowrap">
          {dateTitle}
        </p>
        <button type="button" aria-label="도움말" className="size-[24px] flex items-center justify-center active:opacity-70 transition-opacity">
          <svg className="size-[22px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9.5" fill="#d8d8d8" />
            <path d="M9.6 9.4C9.6 8.1 10.7 7.2 12 7.2C13.3 7.2 14.4 8.1 14.4 9.3C14.4 10.3 13.8 10.8 13 11.3C12.3 11.7 12 12.1 12 12.9V13.2" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="12" cy="16" r="0.95" fill="white" />
          </svg>
        </button>
      </div>

      {/* ── Time stepper header ── */}
      <div className="shrink-0 w-full flex items-center pb-[16px] px-[20px]">
        <Stepper dir="left" />
        <p
          className="flex-1 font-['Pretendard:Bold',sans-serif] text-[40px] leading-none text-[#333] text-center tabular-nums whitespace-nowrap"
          style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
        >
          04:50:38
        </p>
        <Stepper dir="right" />
      </div>

      {/* ── 충돌 선택 패널 (기존 기록 vs 새 기록) ── */}
      {conflict && (
        <div className="shrink-0 px-[16px] pb-[12px] flex flex-col gap-[8px]">
          <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[#6d7278]">
            같은 시간대에 기록이 겹쳐요. 저장할 기록을 선택하세요.
          </p>
          {([
            { key: "existing", name: "수학", duration: "2시간 49분", desc: "기존 기록 (다른 기기)", pending: false },
            { key: "new", name: newRec.name, duration: newRec.time, desc: "방금 측정한 기록", pending: true },
          ] as const).map((opt) => {
            const sel = picked === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setPicked(opt.key)}
                aria-pressed={sel}
                className={`flex items-center gap-[12px] px-[16px] py-[12px] rounded-[12px] w-full text-left transition-colors ${
                  sel ? "bg-[rgba(150,120,255,0.1)] border border-[#9678ff]" : "border border-[#efeff0] bg-white"
                }`}
              >
                <div className="size-[28px] shrink-0 rounded-full bg-[#f2f2fa]" aria-hidden="true" />
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center gap-[6px]">
                    <span className="font-['Spoqa_Han_Sans_Neo:Medium',sans-serif] text-[14px] leading-[21px] text-[#333] whitespace-nowrap">
                      {opt.name}
                    </span>
                    <span className="font-['Spoqa_Han_Sans_Neo:Regular',sans-serif] text-[12px] leading-[18px] text-[#b6b8b9]">
                      {opt.duration}
                    </span>
                    {opt.pending && (
                      <span className="shrink-0 px-[8px] py-[2px] rounded-[4px] bg-[#fef1ec] text-[#ff7a68] text-[12px] leading-[18px] font-['Pretendard:Medium',sans-serif]">
                        대기
                      </span>
                    )}
                  </div>
                  <span className="font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-[#6d7278]">
                    {opt.desc}
                  </span>
                </div>
                {sel ? (
                  <div className="size-[24px] shrink-0 rounded-full bg-[#9678ff] flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2.5 6.2L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : (
                  <div className="size-[24px] shrink-0 rounded-full border-[1.5px] border-[#d8d8d8]" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Record timeline (scroll) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        <div className="flex flex-col pb-[40px]">
          {ROWS.map((row, idx) => (
            <div key={idx} className="flex gap-[14px] items-stretch px-[16px]">
              {/* 좌측 레일: 시간 라벨 + 컬러 바/커넥터 */}
              <div className="flex gap-[12px] shrink-0 items-stretch">
                <span className="w-[32px] shrink-0 text-right font-['Spoqa_Han_Sans_Neo:Medium',sans-serif] text-[12px] leading-[1.5] text-[#b6b8b9] pt-[10px]">
                  {row.time}
                </span>
                <div className="w-[20px] shrink-0 flex justify-center">
                  {row.type === "label" ? (
                    <div
                      className="w-[20px] rounded-[2px] my-[8px]"
                      style={{ background: row.color, opacity: row.dim ? 0.3 : 1, minHeight: 40 }}
                    />
                  ) : (
                    // 빈 구간 — 점선 커넥터
                    <div className="w-0 border-l-[1.5px] border-dashed border-[#dadbe8] my-[4px]" />
                  )}
                </div>
              </div>

              {/* 우측 콘텐츠 */}
              <div className="flex-1 min-w-0 flex items-center py-[8px]">
                {row.type === "label" ? (
                  <div className={`flex items-end gap-[4px] ${row.dim ? "opacity-60" : ""}`}>
                    <span className={`font-['Spoqa_Han_Sans_Neo:Medium',sans-serif] leading-[1.5] ${row.dim ? "text-[12px] text-[#868b90]" : "text-[16px] text-[#6d7278]"}`}>
                      {row.name}
                    </span>
                    <span className="font-['Spoqa_Han_Sans_Neo:Regular',sans-serif] text-[12px] leading-[1.5] text-[#b6b8b9]">
                      {row.duration}
                    </span>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0 bg-[#f9f9fa] rounded-[8px] px-[16px] py-[14px] flex items-center justify-between gap-[8px]">
                    <span className="font-['Spoqa_Han_Sans_Neo:Regular',sans-serif] text-[12px] leading-[1.5] text-[#b6b8b9] whitespace-nowrap overflow-hidden text-ellipsis">
                      {row.text}
                    </span>
                    {row.add && (
                      <button
                        type="button"
                        aria-label="기록 추가"
                        className="shrink-0 size-[24px] rounded-[16px] bg-white drop-shadow-[0px_4px_4px_rgba(110,109,120,0.08)] flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M7 1.5V12.5M1.5 7H12.5" stroke="#333" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 충돌 해소 저장 버튼 ── */}
      {conflict && (
        <div className="shrink-0 bg-white px-[16px] pt-[12px] pb-[8px] border-t border-[#f2f2fa]">
          <button
            type="button"
            disabled={!picked}
            onClick={() => { resolvePendingTimers(); onResolve?.(); }}
            className={`w-full h-[52px] rounded-[8px] text-[16px] leading-[24px] font-['Pretendard:Medium',sans-serif] transition-colors ${
              picked ? "bg-[#9678ff] text-white active:bg-[#8461fa]" : "bg-[#f2f2fa] text-[#b6b8b9]"
            }`}
          >
            이 기록으로 저장
          </button>
        </div>
      )}

      {/* ── Safe area ── */}
      <div className="h-[34px] shrink-0 bg-white" />
    </div>
  );
}
