/**
 * BottomNav — 하단 네비게이션 바
 *
 * ## 개요
 * 타이머·어제의 나·할일 3개 탭으로 구성된 전역 하단 네비게이션.
 * 각 탭은 activeTab prop과 비교해 활성/비활성 색상(#9678FF / #6D7278)을 결정한다.
 *
 * ## 탭 구성
 * - 타이머  : 앱의 메인 화면. 타이머 실행 중에도 항상 마운트 유지 (z-index 레이어링)
 * - 어제의 나: 전날 공부 통계 및 비교 화면
 * - 할일    : 할일 목록 관리 화면
 *
 * ## 참고
 * - 랭킹 탭은 제거됨. 랭킹 화면은 타이머 화면 우측 사이드 버튼에서만 진입.
 * - Safe Area(34px) + Home Indicator pill 포함.
 */
import type { ReactNode } from "react";

export type BottomNavTab = 'timer' | 'yesterday' | 'todo';

// ── SVG path data ────────────────────────────────────────────────────────────
const SVG_TIMER_CAP  = "M12 0H6V2H12V0Z";
const SVG_TIMER_BODY = "M16.03 6.39L17.45 4.97C17.02 4.46 16.55 3.98 16.04 3.56L14.62 4.98C13.07 3.74 11.12 3 9 3C4.03 3 0 7.03 0 12C0 16.97 4.02 21 9 21C13.98 21 18 16.97 18 12C18 9.88 17.26 7.93 16.03 6.39ZM10 13H8V7H10V13Z";
const SVG_YESTERDAY  = "M5.5 18H0V6H5.5V18ZM12.75 0H7.25V18H12.75V0ZM20 8H14.5V18H20V8Z";
const SVG_TODO       = "M18 0H2C0.9 0 0 0.9 0 2V16C0 17.1 0.9 18 2 18H18C19.1 18 20 17.1 20 16V2C20 0.9 19.1 0 18 0ZM8 14H3V12H8V14ZM8 10H3V8H8V10ZM8 6H3V4H8V6ZM12.82 12L10 9.16L11.41 7.75L12.82 9.17L15.99 6L17.41 7.42L12.82 12Z";
const SVG_HOME_PILL  = "M129.713 0C131.222 0 132.109 0.103072 132.593 0.333984C133.456 0.746957 134 1.59507 134 2.5C134 3.405 133.456 4.25402 132.593 4.66602C132.109 4.89698 131.222 5 129.713 5H4.28711C2.77823 5 1.89125 4.89698 1.40723 4.66602C0.544227 4.25402 0 3.405 0 2.5C7.33714e-05 1.59507 0.544285 0.746957 1.40723 0.333984C1.89128 0.103072 2.77838 0 4.28711 0H129.713Z";

const ACTIVE   = 'var(--color-fg-text-brand)';
const INACTIVE = 'var(--color-fg-text-disable)';

// ── Shared tab item ──────────────────────────────────────────────────────────
function TabItem({
  active,
  onClick,
  px,
  label,
  children,
}: {
  active: boolean;
  onClick?: () => void;
  px: string;
  label: string;
  children: ReactNode;
}) {
  const inner = (
    <div className={`flex flex-col gap-[3px] items-center ${px} py-[7px]`}>
      <div className="size-[24px] relative shrink-0">{children}</div>
      <p
        className="font-['Spoqa_Han_Sans_Neo:Medium',sans-serif] leading-[1.5] text-[12px] text-center whitespace-nowrap shrink-0"
        style={{ color: active ? ACTIVE : INACTIVE }}
      >
        {label}
      </p>
    </div>
  );

  if (active) {
    return (
      <div className="flex-[1_0_0] min-w-px" aria-current="page">
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-[1_0_0] min-w-px cursor-pointer active:bg-[#404040] transition-colors"
    >
      {inner}
    </button>
  );
}

// ── Public component ─────────────────────────────────────────────────────────
export default function BottomNav({
  activeTab,
  onTimer,
  onYesterday,
  onTodo,
}: {
  activeTab: BottomNavTab;
  onTimer?: () => void;
  onYesterday?: () => void;
  onTodo?: () => void;
}) {
  const c = (tab: BottomNavTab) => (activeTab === tab ? ACTIVE : INACTIVE);

  return (
    <div className="shrink-0 w-full">
      {/* Tab bar */}
      <div className="bg-[var(--color-bg-muted)] rounded-tl-[16px] rounded-tr-[16px] relative w-full">
        {/* Top border + drop shadow overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-tl-[16px] rounded-tr-[16px] border-t border-[var(--color-fg-text-disable)]"
          style={{ boxShadow: '0px -2px 8px 0px rgba(109,114,120,0.08)' }}
          aria-hidden="true"
        />
        <div className="flex items-start overflow-clip rounded-[inherit]">
          {/* ── 타이머 ── */}
          <TabItem active={activeTab === 'timer'} onClick={onTimer} px="px-[33px]" label="타이머">
            <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 18 21">
              <path d={SVG_TIMER_CAP}  fill={c('timer')} />
              <path d={SVG_TIMER_BODY} fill={c('timer')} />
            </svg>
          </TabItem>

          {/* ── 어제의 나 ── */}
          <TabItem active={activeTab === 'yesterday'} onClick={onYesterday} px="px-[28px]" label="어제의 나">
            <div className="absolute inset-[12.31%_8.33%_12.69%_8.33%]">
              <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 20 18">
                <path d={SVG_YESTERDAY} fill={c('yesterday')} />
              </svg>
            </div>
          </TabItem>

          {/* ── 할일 ── */}
          <TabItem active={activeTab === 'todo'} onClick={onTodo} px="px-[31px]" label="할일">
            <div className="absolute inset-[12.31%_8.33%_12.69%_8.33%]">
              <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 20 18">
                <path clipRule="evenodd" d={SVG_TODO} fill={c('todo')} fillRule="evenodd" />
              </svg>
            </div>
          </TabItem>

        </div>
      </div>

      {/* Safe-area bar */}
      <div className="bg-[var(--color-bg-muted)] h-[34px] relative w-full">
        <div className="absolute bottom-[8px] h-[5px] left-[32.13%] right-[32.13%]">
          <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 134 5">
            <path d={SVG_HOME_PILL} fill="white" />
          </svg>
        </div>
      </div>
    </div>
  );
}
