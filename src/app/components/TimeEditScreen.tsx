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
import { useState, Fragment } from "react";
import { useOffline } from "../contexts/OfflineContext";

// 충돌 카드 옵션 (Figma 7437-268787) — 같은 시간대 겹친 두 기록
// 다른 디바이스(기존 기록) = 회색 배지 / 현재 디바이스(새 기록) = 코랄 배지
const CONFLICT_OPTS = [
  { key: "other",   name: "수학", color: "#ff8080", device: "다른 디바이스", deviceBg: "#f7f7f8", deviceText: "#868b90", duration: "2시간 40분", range: "13:00 - 16:10" },
  { key: "current", name: "국어", color: "#f8d884", device: "현재 디바이스", deviceBg: "#fef1ec", deviceText: "#ff7a68", duration: "2시간 40분", range: "13:00 - 16:10" },
] as const;

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

  // 충돌 해소 — 같은 시간대 겹친 두 기록 중 남길 것 선택
  const { resolvePendingTimers } = useOffline();
  const [picked, setPicked] = useState<string | null>(null);

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

      {/* ── Record timeline (scroll) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        <div className="flex flex-col pb-[40px]">
          {ROWS.map((row, idx) => (
            <Fragment key={idx}>
            <div className="flex gap-[14px] items-stretch px-[16px]">
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
            {/* 충돌 카드 — 겹친 시간대에 인라인 삽입 (Figma 7437-268787) */}
            {conflict && idx === 2 && (
              <div className="mx-[16px] my-[8px] border border-[#ff7a68] rounded-[16px] overflow-hidden">
                {/* 경고 배너 (코랄) */}
                <div className="bg-[#fef1ec] px-[16px] py-[12px] flex items-center gap-[4px]">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="10" cy="10" r="8.33" fill="#ff7a68" />
                    <path d="M10 5.2V11" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="10" cy="14.2" r="1" fill="white" />
                  </svg>
                  <p className="font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-[#ff7a68]">
                    13:00 - 15:49 기록이 겹쳐요
                  </p>
                </div>
                {/* 기록 선택 영역 (화이트) */}
                <div className="bg-white p-[16px] flex flex-col gap-[16px]">
                  <div className="flex flex-col gap-[8px]">
                    {CONFLICT_OPTS.map((opt) => {
                      const sel = picked === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setPicked(opt.key)}
                          aria-pressed={sel}
                          className={`flex items-center justify-between gap-[8px] px-[16px] py-[12px] rounded-[12px] w-full text-left bg-white transition-colors border ${sel ? "border-[#9678ff]" : "border-[#efeff0]"}`}
                        >
                          <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
                            <div className="flex items-center gap-[4px] w-full">
                              <div className="w-[16px] h-[15px] shrink-0 rounded-[4px]" style={{ background: opt.color }} aria-hidden="true" />
                              <span className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[#6d7278] whitespace-nowrap">
                                {opt.name}
                              </span>
                              <span
                                className="shrink-0 px-[8px] py-[2px] rounded-[4px] text-[12px] leading-[18px] font-['Pretendard:Medium',sans-serif]"
                                style={{ background: opt.deviceBg, color: opt.deviceText }}
                              >
                                {opt.device}
                              </span>
                            </div>
                            <span className="font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-[#b6b8b9]">
                              {opt.range}
                            </span>
                          </div>
                          <span className="shrink-0 font-['Pretendard:SemiBold',sans-serif] text-[16px] leading-[24px] text-[#868b90] whitespace-nowrap">
                            {opt.duration}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    disabled={!picked}
                    onClick={() => { resolvePendingTimers(); onResolve?.(); }}
                    className={`w-full h-[44px] rounded-[8px] text-[14px] leading-[21px] font-['Pretendard:Medium',sans-serif] transition-colors ${
                      picked ? "bg-[#9678ff] text-white active:bg-[#8461fa]" : "bg-[#f2f2fa] text-[#b6b8b9]"
                    }`}
                  >
                    {picked ? `${CONFLICT_OPTS.find((o) => o.key === picked)?.name} 기록 남기기` : "남길 기록을 선택하세요"}
                  </button>
                </div>
              </div>
            )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* ── Safe area ── */}
      <div className="h-[34px] shrink-0 bg-white" />
    </div>
  );
}
