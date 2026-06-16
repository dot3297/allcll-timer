/**
 * YesterdayScreen — 어제의 나 화면
 *
 * ## 개요
 * 지난 학습 기록과 비교 정보를 제공하는 화면 컴포넌트.
 * 어제와 지난주 오늘의 공부 시간을 비교하고 역대 최고 기록을 표시한다.
 *
 * ## 주요 기능
 * - 지난주 오늘과의 공부 시간 비교 표시
 * - 역대 최고 기록 카드 표시
 * - 주간 비교 카드: 이번 주 vs 지난주 학습량 시각화
 * - 헤더 스크롤 애니메이션: 스크롤 다운 시 헤더가 위로 슬라이드 아웃
 *
 * ## 현재 상태 (TODO)
 * - [ ] 서버 API 연동 (현재 더미 데이터 사용)
 */
import { useState, useEffect, useRef } from "react";
import BottomNav from "./BottomNav";

// ── 툴팁 (rounded rect + 아래 삼각) ─────────────────────────────────

function Tooltip({
  label,
  barEndPx,
  visible,
}: {
  label: string;
  barEndPx: number;
  visible: boolean;
}) {
  return (
    <div
      className="absolute"
      style={{
        top: 14,
        left: barEndPx,
        transform: visible
          ? "translateX(-50%) translateY(0px)"
          : "translateX(-50%) translateY(-8px)",
        opacity: visible ? 1 : 0,
        transition:
          "opacity 0.35s cubic-bezier(0.22,1,0.36,1), transform 0.35s cubic-bezier(0.22,1,0.36,1)",
        pointerEvents: visible ? "auto" : "none",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* 둥근 사각형 본체 */}
      <div
        style={{
          background: "var(--color-bg-brand)",
          borderRadius: 10,
          height: 20,
          padding: "0 10px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <p className="font-['Pretendard:SemiBold',sans-serif] text-[12px] leading-[18px] text-white whitespace-nowrap">
          {label}
        </p>
      </div>
      {/* 아래 삼각형 */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "4.5px solid transparent",
          borderRight: "4.5px solid transparent",
          borderTop: "5px solid var(--color-bg-brand)",
          marginTop: 0,
        }}
      />
    </div>
  );
}

// ── 수평 바 한 행 ─────────────────────────────────────────────────────

function BarRow({
  label,
  labelColor,
  barColor,
  barLeft = 44,
  barWidth,
  value,
  animated,
  delay = 0,
}: {
  label: string;
  labelColor: string;
  barColor: string;
  barLeft?: number;
  barWidth: number;
  value: string;
  animated: boolean;
  delay?: number;
}) {
  const isPurple = barColor === "bg-[var(--color-bg-brand)]";

  return (
    <div className="flex gap-[12px] items-center relative shrink-0 w-full">
      <p
        className={`font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] ${labelColor} shrink-0`}
        style={{ width: 32 }}
      >
        {label}
      </p>
      <div className={`flex-1 h-[12px] ${barColor} opacity-20 rounded-[8px]`} />
      <p className={`font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] ${labelColor} whitespace-nowrap`}>
        {value}
      </p>
      {/* 채워진 오버레이 바 — 보라색만 width 0→target 애니메이션 */}
      <div
        className={`absolute ${barColor} h-[12px] rounded-[8px]`}
        style={{
          left: barLeft,
          top: "50%",
          transform: "translateY(-50%)",
          width: isPurple ? (animated ? barWidth : 0) : barWidth,
          transition: isPurple
            ? `width 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`
            : "none",
        }}
      />
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────

export default function YesterdayScreen({
  onNavigateToTimer,
  onNavigateToTodo,
  onNavigateToRanking,
}: {
  onNavigateToTimer?: () => void;
  onNavigateToTodo?: () => void;
  onNavigateToRanking?: () => void;
}) {
  const [barsAnimated, setBarsAnimated] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    // 진입 직후 바 애니메이션 시작
    const t1 = setTimeout(() => setBarsAnimated(true), 80);
    // 바 애니메이션(650ms) 완료 후 필 등장
    const t2 = setTimeout(() => setPillsVisible(true), 80 + 680);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const curr = el.scrollTop;
    const prev = lastScrollTop.current;
    if (curr > prev && curr > 8) {
      setHeaderHidden(true);   // 아래 스크롤 → 숨김
    } else if (curr < prev) {
      setHeaderHidden(false);  // 위 스크롤 → 표시
    }
    lastScrollTop.current = curr;
  };

  return (
    <div className="bg-[var(--color-bg-weak)] h-full w-full relative flex flex-col">

      {/* 상태바 */}
      <div className="h-[42px] relative w-full shrink-0">
        <p
          className="absolute font-['SF_Pro:Medium',sans-serif] font-[510] text-[var(--color-fg-text-weak)] text-[15px] tracking-[-0.165px] whitespace-nowrap"
          style={{ fontVariationSettings: "'wdth' 100", left: 29.5, top: "calc(50% - 9px)" }}
        >
          9:41
        </p>
      </div>

      {/* 타이틀 — 스크롤 다운 시 위로 슬라이드 아웃 */}
      <div
        className="shrink-0 w-full overflow-hidden"
        style={{
          height: headerHidden ? 0 : 56,
          opacity: headerHidden ? 0 : 1,
          transition: 'height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div className="flex h-[56px] items-center px-[16px] py-[8px] w-full">
          <p className="font-['Pretendard:SemiBold',sans-serif] leading-[28px] text-[20px] text-[var(--color-fg-text-weak)] whitespace-nowrap">
            어제의 나
          </p>
        </div>
      </div>

      {/* 스크롤 콘텐츠 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-[16px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ paddingBottom: 100 }}
      >
        <div className="flex flex-col gap-[12px] w-full">

          {/* ── 카드 1: 지난주 오늘 비교 ─────────────────────────── */}
          <div
            className="bg-[var(--color-bg-muted)] rounded-[12px] px-[20px] py-[16px] flex flex-col gap-[28px]"
            style={{ boxShadow: "0px 4px 12px 0px rgba(110,109,120,0.08)" }}
          >
            <p className="font-['Pretendard:SemiBold',sans-serif] text-[18px] leading-[27px] text-white">
              지난주 오늘보다{" "}
              <br />
              <span className="text-[var(--color-fg-text-brand)]">13분</span> 더 공부했어요
            </p>

            <div className="relative w-full" style={{ paddingTop: 47 }}>
              <Tooltip label="+13분" barEndPx={44 + 68} visible={pillsVisible} />
              <div className="flex flex-col gap-[12px]">
                <BarRow label="오늘"   labelColor="text-[var(--color-fg-text-brand)]" barColor="bg-[var(--color-bg-brand)]" barWidth={68}  value="60분"  animated={barsAnimated} delay={0} />
                <BarRow label="지난주" labelColor="text-[var(--color-fg-text-muted)]" barColor="bg-[var(--color-fg-text-muted)]" barWidth={27}  value="47분"  animated={barsAnimated} />
              </div>
            </div>
          </div>

          {/* ── 카드 2: 역대 최고 기록 ───────────────────────────── */}
          <div
            className="bg-[var(--color-bg-muted)] rounded-[12px] px-[20px] py-[16px] flex flex-col gap-[28px]"
            style={{ boxShadow: "0px 4px 12px 0px rgba(110,109,120,0.08)" }}
          >
            <p className="font-['Pretendard:SemiBold',sans-serif] text-[18px] leading-[27px] text-white">
              역대 최고 기록까지{" "}
              <br />
              <span className="text-[var(--color-fg-text-brand)]">48분</span> 남았어요
            </p>

            <div className="relative w-full" style={{ paddingTop: 47 }}>
              <Tooltip label="3시간 12분" barEndPx={44 + 155} visible={pillsVisible} />
              <BarRow label="오늘" labelColor="text-[var(--color-fg-text-brand)]" barColor="bg-[var(--color-bg-brand)]" barWidth={155} value="4시간 32분" animated={barsAnimated} delay={60} />
            </div>
          </div>

          {/* ── 카드 3: 이번주 vs 지난주 ─────────────────────────── */}
          <div
            className="bg-[var(--color-bg-muted)] rounded-[12px] px-[20px] py-[16px] flex flex-col gap-[28px]"
            style={{ boxShadow: "0px 4px 12px 0px rgba(110,109,120,0.08)" }}
          >
            <p className="font-['Pretendard:SemiBold',sans-serif] text-[18px] leading-[27px] text-white">
              지난주 보다 조금 힘든 한 주에요
              <br />
              오늘은 20분만 더 해봐요
            </p>

            <div className="relative w-full" style={{ paddingTop: 47 }}>
              <Tooltip label="-32%" barEndPx={44 + 68} visible={pillsVisible} />
              <div className="flex flex-col gap-[12px]">
                <BarRow label="이번주" labelColor="text-[var(--color-fg-text-brand)]" barColor="bg-[var(--color-bg-brand)]" barWidth={68}  value="평균 28분" animated={barsAnimated} delay={120} />
                <BarRow label="지난주" labelColor="text-[var(--color-fg-text-muted)]" barColor="bg-[var(--color-fg-text-muted)]" barWidth={138} value="평균 41분" animated={barsAnimated} />
              </div>
            </div>
          </div>

          {/* ── 카드 4: 집중 골드 타임 + 평균 지속 시간 (나란히) ── */}
          <div className="flex gap-[8px]">
            <div
              className="bg-[var(--color-bg-muted)] rounded-[12px] px-[20px] py-[16px] flex-1 flex flex-col gap-[4px]"
              style={{ boxShadow: "0px 4px 12px 0px rgba(110,109,120,0.08)" }}
            >
              <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[var(--color-fg-text-muted)]">집중 골드 타임</p>
              <p className="font-['Pretendard:SemiBold',sans-serif] text-[18px] leading-[27px] text-white">오후 3~5시</p>
              <p className="font-['Pretendard:SemiBold',sans-serif] text-[12px] leading-[18px] text-[var(--color-fg-text-muted)] whitespace-nowrap">화요일이 가장 강해요</p>
            </div>
            <div
              className="bg-[var(--color-bg-muted)] rounded-[12px] px-[20px] py-[16px] flex-1 flex flex-col gap-[4px]"
              style={{ boxShadow: "0px 4px 12px 0px rgba(110,109,120,0.08)" }}
            >
              <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[var(--color-fg-text-muted)]">평균 지속 시간</p>
              <p className="font-['Pretendard:SemiBold',sans-serif] text-[18px] leading-[27px] text-white">23분</p>
              <p className="font-['Pretendard:SemiBold',sans-serif] text-[12px] leading-[18px] text-[var(--color-fg-text-muted)] whitespace-nowrap">최장 기록 41분</p>
            </div>
          </div>

          {/* ── 카드 5: 연도별 평균 바 차트 ──────────────────────── */}
          <div
            className="bg-[var(--color-bg-muted)] rounded-[12px] px-[20px] py-[17px] flex flex-col gap-[28px]"
            style={{ boxShadow: "0px 4px 12px 0px rgba(110,109,120,0.08)" }}
          >
            <div className="flex flex-col gap-[4px]">
              <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[var(--color-fg-text-muted)]">연도별 평균</p>
              <p className="font-['Pretendard:SemiBold',sans-serif] text-[18px] leading-[27px] text-white">
                1년 전 오늘의 나는
                <br />
                하루 평균 23분, 지금은 61분 이에요
              </p>
            </div>

            {/* 세로 바 차트 */}
            <div className="flex gap-[26px] items-end justify-center">
              {/* 2024 */}
              <div className="flex flex-col gap-[12px] items-center" style={{ width: 24 }}>
                <div className="bg-[var(--color-fg-text-muted)] opacity-20 rounded-t-[4px] w-full" style={{ height: 100 }} />
                <p className="font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-[var(--color-fg-text-muted)] text-center">24</p>
              </div>
              {/* 2025 */}
              <div className="flex flex-col gap-[12px] items-center" style={{ width: 24 }}>
                <div className="bg-[var(--color-fg-text-muted)] opacity-20 rounded-t-[4px] w-full" style={{ height: 125 }} />
                <p className="font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-[var(--color-fg-text-muted)] text-center">25</p>
              </div>
              {/* 2026 (현재, 보라색) */}
              <div className="flex flex-col gap-[12px] items-center" style={{ width: 24 }}>
                <div className="bg-[var(--color-bg-brand)] rounded-t-[4px] w-full" style={{ height: 100 }} />
                <p className="font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-[var(--color-fg-text-brand)] text-center">26</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 바텀 네비게이션 */}
      <BottomNav
        activeTab="yesterday"
        onTimer={onNavigateToTimer}
        onTodo={onNavigateToTodo}
      />
    </div>
  );
}
