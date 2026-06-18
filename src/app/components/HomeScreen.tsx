/**
 * HomeScreen — 앱 런처형 홈 (Figma 7357-124865 "홈")
 *
 * 타이머 홈의 뒤로가기에서 진입. 상단 다짐/주간 캘린더 + 광고 배너 +
 * 모듈 그리드(타이머·할일 활성, 나머지 잠금) + "온라인 모드" FAB + 하단 탭.
 * 아이콘·링·썸네일은 Figma 에셋(SVG/PNG/JPG)을 그대로 사용한다.
 *
 * - 라이트 테마(bg #f7f7f8)
 * - 타이머/할일 모듈만 활성(흰 카드), 나머지는 잠금(회색 카드, UI 전용)
 */
import { useState } from "react";
import { useOffline } from "../contexts/OfflineContext";
import SharedCalendar from "./SharedCalendar";
import statusSymbol from "../../imports/홈/status-symbol.svg";
import chevronIcon from "../../imports/홈/chevron.svg";
import pencilIcon from "../../imports/홈/pencil.svg";
import bellIcon from "../../imports/홈/bell.svg";
import xCircleIcon from "../../imports/홈/x-circle.svg";
import ringDisable from "../../imports/홈/ring-disable.svg";
import ringTimer2 from "../../imports/홈/ring-timer2.svg";
import ringTodo2 from "../../imports/홈/ring-todo2.svg";
import ringVocab from "../../imports/홈/ring-vocab.svg";
import ringMission from "../../imports/홈/ring-mission.svg";
import fortuneCat from "../../imports/홈/fortune-cat.png";
import diaryCheck from "../../imports/홈/diary-check.svg";
import modeSwitchIcon from "../../imports/홈/icon-mode-switch.svg";
import adCal from "../../imports/홈/ad-cal.png";
import clubThumb from "../../imports/홈/club-thumb.jpg";
import navHome from "../../imports/홈/nav-home.svg";
import navContent from "../../imports/홈/nav-content.svg";
import navProfile from "../../imports/홈/nav-profile.svg";
import navStore from "../../imports/홈/nav-store.svg";

/** 모듈 카드 */
function Card({
  title, disabled = false, onClick, children,
}: {
  title: string; disabled?: boolean; onClick?: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`relative h-[128px] rounded-[12px] pt-[12px] pl-[12px] pr-[8px] pb-[8px] flex flex-col items-start justify-between text-left overflow-hidden ${
        disabled ? "bg-[#efeff0]" : "bg-white active:scale-[0.98]"
      } transition-transform`}
      style={{ boxShadow: "0px 4px 8px rgba(110,109,120,0.04)" }}
    >
      <div className="flex items-center gap-[2px]">
        <p className={`font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] whitespace-nowrap ${disabled ? "text-[#b6b8b9]" : "text-[#acaabb]"}`}>{title}</p>
        <img src={chevronIcon} alt="" className="size-[20px]" />
      </div>
      <div className="w-full flex items-end justify-between gap-[4px]">{children}</div>
    </button>
  );
}

/** 큰 값 텍스트 (숫자 24 Bold + 단위 12) */
function Value({ num, unit, gray = false }: { num: string; unit: string; gray?: boolean }) {
  const c = gray ? "text-[#b6b8b9]" : "text-[#333]";
  return (
    <p className={`whitespace-nowrap ${c}`}>
      <span className="font-['Pretendard:Bold',sans-serif] text-[24px] leading-[1.4]">{num}</span>
      <span className="font-['Pretendard:Regular',sans-serif] text-[12px] leading-[1.5]"> {unit}</span>
    </p>
  );
}

const NAV = [
  { label: "홈", icon: navHome, active: true },
  { label: "콘텐츠", icon: navContent },
  { label: "프로필", icon: navProfile },
  { label: "스토어", icon: navStore },
];

export default function HomeScreen({
  onOpenTimer, onOpenTodo, onOpenSettings,
}: {
  /** 타이머 모듈 탭 — 타이머 홈으로 복귀 */
  onOpenTimer: () => void;
  /** 할일 모듈 탭 — 할일 화면 진입 */
  onOpenTodo: () => void;
  /** 모드 전환 FAB 탭 — 설정 화면 진입 */
  onOpenSettings: () => void;
}) {
  const { isOffline } = useOffline();
  // 오프라인 모드에서는 타이머·할일을 제외한 모듈이 잠금(회색). 온라인 모드에서는 전체 활성.
  const locked = isOffline;
  const [calCollapsed, setCalCollapsed] = useState(true);
  const [selDay, setSelDay] = useState<{ year: number; month: number; day: number } | null>(null);

  return (
    <div className="absolute inset-0 z-[60] bg-[#f7f7f8] flex flex-col overflow-hidden" data-name="홈">
      {/* ── 상단 네비 (흰 카드) ── */}
      <div
        className="bg-white rounded-bl-[16px] rounded-br-[16px] shrink-0 z-10"
        style={{ filter: "drop-shadow(0px 4px 6px rgba(109,114,120,0.08))" }}
      >
        {/* status bar */}
        <div className="h-[42px] relative w-full">
          <p className="absolute left-[29.5px] top-1/2 -translate-y-1/2 font-['SF_Pro:Medium',sans-serif] font-[510] text-[#333] text-[15px] tracking-[-0.165px]" style={{ fontVariationSettings: "'wdth' 100" }}>9:41</p>
          <img src={statusSymbol} alt="" className="absolute right-[14.5px] top-[19.16px] h-[11.5px] w-[67px]" />
        </div>

        {/* 다짐 + 벨 */}
        <div className="h-[56px] flex items-center justify-between pl-[16px] pr-[12px]">
          <button type="button" className="flex gap-[4px] items-center active:opacity-70 transition-opacity">
            <p className="font-['Pretendard:SemiBold',sans-serif] text-[20px] leading-[28px] text-[#b6b8b9] whitespace-nowrap">나의 다짐을 적어보세요</p>
            <img src={pencilIcon} alt="" className="size-[16px]" />
          </button>
          <button type="button" aria-label="알림" className="size-[24px] flex items-center justify-center active:opacity-70 transition-opacity">
            <img src={bellIcon} alt="" className="size-[24px]" />
          </button>
        </div>

        {/* 주간 캘린더 — 타이머·할일 공통 SharedCalendar */}
        <SharedCalendar
          theme="light"
          progressData={[]}
          isCollapsed={calCollapsed}
          onToggle={() => setCalCollapsed((v) => !v)}
          selectedDay={selDay}
          onDaySelect={setSelDay}
          className="content-stretch flex flex-col items-center relative shrink-0 w-full"
        />
      </div>

      {/* ── 본문 (스크롤) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-[16px] pt-[16px] pb-[160px] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        {/* 광고 배너 */}
        <div className="h-[80px] rounded-[12px] bg-[#ffaa00] relative overflow-hidden mb-[12px] flex justify-end p-[8px]" style={{ boxShadow: "0px 4px 8px rgba(110,109,120,0.08)" }}>
          <img src={adCal} alt="" className="absolute top-[-10%] left-[27.44%] h-[120%] w-[45.12%] object-cover pointer-events-none" />
          <img src={xCircleIcon} alt="" className="relative size-[16px]" />
        </div>

        {/* 모듈 그리드 — 온라인: 전체 활성 / 오프라인: 타이머·할일만 활성, 나머지 잠금(회색) */}
        <div className="grid grid-cols-2 gap-x-[8px] gap-y-[12px]">
          {/* 타이머 (항상 활성) */}
          <Card title="타이머" onClick={onOpenTimer}>
            <Value num="4" unit="h 35 m" />
            <img src={ringTimer2} alt="" className="size-[40px] shrink-0" />
          </Card>
          {/* 할일 (항상 활성) */}
          <Card title="할일" onClick={onOpenTodo}>
            <Value num="1" unit="개 완료" />
            <img src={ringTodo2} alt="" className="size-[40px] shrink-0" />
          </Card>
          {/* 일기장 — 활성 시 라임 체크 버튼 */}
          <Card title="일기장" disabled={locked}>
            <Value num="13" unit="일" gray={locked} />
            {locked ? (
              <img src={ringDisable} alt="" className="size-[40px] shrink-0" />
            ) : (
              <div className="size-[40px] rounded-full bg-[#e5fc8b] flex items-center justify-center shrink-0">
                <img src={diaryCheck} alt="" className="size-[24px]" />
              </div>
            )}
          </Card>
          {/* 명언 */}
          <Card title="명언" disabled={locked}>
            <p className={`font-['Pretendard:Medium',sans-serif] text-[14px] leading-[1.5] ${locked ? "text-[#b6b8b9]" : "text-[#333]"}`}>
              저는 가만히 있는 높이에<br />지기 싫었어요.<br />그 하나로 여기까지 왔어요.
            </p>
          </Card>
          {/* 운세 — 활성 시 우상단 고양이 이미지 */}
          <Card title="운세" disabled={locked}>
            {!locked && <img src={fortuneCat} alt="" className="absolute right-[8.75px] top-[10px] w-[32px] h-[36px] object-contain pointer-events-none" />}
            <p className={`font-['Pretendard:Medium',sans-serif] text-[14px] leading-[1.5] ${locked ? "text-[#b6b8b9]" : "text-[#333]"}`}>
              오늘은 새로운 기회를<br />만나게 될 것이다냥!
            </p>
          </Card>
          {/* 단어장 */}
          <Card title="단어장" disabled={locked}>
            <Value num="20" unit="개" gray={locked} />
            <img src={locked ? ringDisable : ringVocab} alt="" className="size-[40px] shrink-0" />
          </Card>
          {/* 미션 */}
          <Card title="미션" disabled={locked}>
            <Value num="8" unit="개 완료" gray={locked} />
            <img src={locked ? ringDisable : ringMission} alt="" className="size-[40px] shrink-0" />
          </Card>
          {/* 클럽 */}
          <Card title="클럽" disabled={locked}>
            <div className="flex flex-col">
              <p className={`font-['Pretendard:Medium',sans-serif] text-[14px] leading-[1.5] ${locked ? "text-[#b6b8b9]" : "text-[#95999d]"}`}>명이팬클럽</p>
              <p className={`whitespace-nowrap ${locked ? "text-[#b6b8b9]" : "text-[#333]"}`}><span className="font-['Pretendard:Bold',sans-serif] text-[24px] leading-[1.4]">8</span><span className="text-[12px] leading-[1.5]"> 명 접속</span></p>
            </div>
            <img src={clubThumb} alt="" className="size-[40px] rounded-full object-cover shrink-0" />
          </Card>
          {/* 독서기록 */}
          <Card title="독서기록" disabled={locked}>
            <Value num="4" unit="권" gray={locked} />
            <img src={locked ? ringDisable : ringMission} alt="" className="size-[40px] shrink-0" />
          </Card>
        </div>
      </div>

      {/* ── 모드 전환 FAB (Figma 7357-125183) — 탭하면 설정 화면으로 이동 ── */}
      <button
        type="button"
        onClick={onOpenSettings}
        className="absolute left-1/2 -translate-x-1/2 bottom-[110px] flex items-center gap-[4px] pl-[12px] pr-[16px] py-[12px] rounded-full bg-[var(--color-bg-brand)] active:bg-[var(--color-bg-brand-pressed)] transition-colors z-20"
        style={{ boxShadow: "0px 4px 6px rgba(109,114,120,0.16)" }}
      >
        <img src={modeSwitchIcon} alt="" className="size-[24px]" />
        <span className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-white whitespace-nowrap">{isOffline ? "온라인 모드" : "오프라인 모드"}</span>
      </button>

      {/* ── 하단 탭 ── */}
      <div className="absolute bottom-0 left-0 w-full bg-white rounded-tl-[16px] rounded-tr-[16px] border-t border-[#efeff0]" style={{ boxShadow: "0px -2px 8px rgba(109,114,120,0.08)" }}>
        <div className="flex items-start">
          {NAV.map((t) => (
            <button key={t.label} type="button" className="flex-1 flex flex-col items-center gap-[3px] py-[7px] active:opacity-70 transition-opacity">
              <img src={t.icon} alt="" className="size-[24px]" />
              <span className={`font-['Spoqa_Han_Sans_Neo:Medium',sans-serif] text-[12px] leading-[1.5] ${t.active ? "text-[#9678ff]" : "text-[#b6b8b9]"}`}>{t.label}</span>
            </button>
          ))}
        </div>
        <div className="h-[34px]" />
      </div>
    </div>
  );
}
