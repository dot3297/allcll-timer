/**
 * RankingScreen — 랭킹 화면
 *
 * ## 개요
 * 타이머 사이드 메뉴의 "랭킹" 버튼을 탭하면 진입하는 랭킹 전체 화면 컴포넌트.
 * 학년·클럽 탭 전환, 티어 캐러셀, 유저 순위 리스트를 제공한다.
 *
 * ## 주요 기능
 * - 고2 / 클럽 탭 전환으로 다른 랭킹 카테고리 표시
 * - 티어 캐러셀: 브론즈~다이아몬드 등 티어 배지 이미지 슬라이드 (로컬 SVG 에셋 사용)
 * - 유저 리스트: 순위·닉네임·공부 시간 등 랭킹 정보 표시
 * - 티어 배지 이미지: /src/imports/랭킹티어/ 경로의 로컬 SVG 파일 사용
 *
 * ## 현재 상태 (TODO)
 * - [ ] 서버 API 연동 (현재 더미 데이터 사용)
 * - [ ] 실시간 랭킹 업데이트 구현
 */
import { useState, useEffect, useRef } from "react";
import { useOffline } from "../contexts/OfflineContext";
import imgInfoIcon from "../../imports/랭킹아이콘/info_circle.svg";
// 티어 뱃지 이미지 — 로컬 에셋 (Figma MCP URL 만료 대비)
import imgTierActive4   from "../../imports/랭킹티어/tier_active_4.svg";
import imgTierActive3   from "../../imports/랭킹티어/tier_active_3.svg";
import imgTierActive2   from "../../imports/랭킹티어/tier_active_2.svg";
import imgTierActive1   from "../../imports/랭킹티어/tier_active_1.svg";
import imgTierInactive4 from "../../imports/랭킹티어/tier_inactive_4.svg";
import imgTierInactive3 from "../../imports/랭킹티어/tier_inactive_3.svg";
import imgTierInactive2 from "../../imports/랭킹티어/tier_inactive_2.svg";
import imgTierInactive1 from "../../imports/랭킹티어/tier_inactive_1.svg";

// ── Assets ────────────────────────────────────────────────────────────────────
const imgSymbol = "http://localhost:3845/assets/390e5254479589bfd886e998b9c2b3a3390f0b82.svg";

// ── Avatar ────────────────────────────────────────────────────────────────────
// Unsplash 고정 photo ID 목록 — 사람 / 동물 / 풍경 믹스
const UNSPLASH_IDS = [
  "1507003211169-0a1dd7228f2d", // 사람
  "1574158622682-e719686abd98", // 고양이
  "1506905925346-21bda4d32df4", // 산 풍경
  "1494790108755-2616b612b47c", // 사람
  "1552053831-71594a27632d",    // 햄스터
  "1469474968028-56623f02e42e", // 노을 풍경
  "1500648767791-00dcc994a43e", // 사람
  "1561037978-f4df0891b31e",    // 강아지
  "1501854140801-50d01698950b", // 자연 풍경
  "1438761681033-6461ffad8d80", // 사람
  "1548247416-ec66f4900b2e",    // 고양이
  "1426604966848-d7adac402bff", // 풍경
  "1472099645785-5658abf4ff4e", // 사람
  "1560807707-8cc77767d783",    // 강아지
  "1448375240586-882707db888b", // 숲 풍경
  "1531746020798-e6953c6e8e04", // 사람
  "1583511655857-d19b40a7a54e", // 고양이
  "1506744038136-46273834b3fb", // 호수 풍경
  "1547425260-76bcadfb4f2c",    // 사람
  "1587300003388-59208cc962cb", // 강아지
];

function avatarSrc(idx: number): string {
  // pravatar — 안정적인 인물 사진 아바타(404 없음). idx로 결정론적 선택.
  return `https://i.pravatar.cc/100?img=${(idx % 70) + 1}`;
}

function Avatar({
  idx,
  size = 40,
  className = "",
}: {
  idx: number;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`rounded-full shrink-0 bg-[#444] ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      alt=""
      src={avatarSrc(idx)}
      className={`rounded-full object-cover block shrink-0 ${className}`}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
// Tier badge images — active (보라색) vs inactive (어두운) 상태 분리
// Active: size=m(100px) — Figma Component103 m 상태
const ACTIVE_BADGE_IMG: Record<number, string> = {
  4: imgTierActive4,
  3: imgTierActive3,
  2: imgTierActive2,
  1: imgTierActive1,
};
// Inactive: size=sm(84px) — Figma Component103 sm 상태
const INACTIVE_BADGE_IMG: Record<number, string> = {
  4: imgTierInactive4,
  3: imgTierInactive3,
  2: imgTierInactive2,
  1: imgTierInactive1,
};

// ── Time helpers ──────────────────────────────────────────────────────────────
function timeToSecs(t: string): number {
  const [h, m, s] = t.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}
function secsToTime(n: number): string {
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  const s = n % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Rank data ─────────────────────────────────────────────────────────────────
type RankItem = { rank: number; avatarIdx: number; name: string; baseSecs: number; isMe?: boolean };

const NAMES_T4 = ["규리규리구리","금지된자소서","틈섀","감사한포도42","얼렁떵땅","무주택세대주","새벽세시반","하루열두시간","졸린눈깜빡","공부왕찐천재","수능디데이100","밤새운보람","오늘도화이팅","집중력만렙","독서실단골","카페인중독자","눈뜨면공부","합격만기다려","도서관지박령","마지막스퍼트"];
const NAMES_T3 = ["최상위권신화","불꽃공부맨","전교1등도전","수능만점자","독서왕","매일공부왕","집중의달인","새벽감성러","스터디리더","목표달성자","끝까지간다","성실한하루","포기란없다","빡공머신","야간자율학습","도전그자체","공부가좋아","시험지정복","오답노트달인","내일도화이팅"];
const NAMES_T2 = ["전설의고수","신들린공부","최정상각","공부신","천재공부법","초집중모드","무한반복","완전이해","심화학습","기출마스터","오늘도최선","완벽한복습","개념왕","수학마스터","영어달인","국어의신","과학천재","사탐만렙","논리왕","철두철미"];

function buildData(names: string[], startSecs: number, step: number, meIndex?: number): RankItem[] {
  return names.map((name, i) => ({
    rank: i + 1,
    avatarIdx: i,
    name,
    baseSecs: Math.max(60, startSecs - i * step),
    isMe: i === meIndex,
  }));
}

// Pre-built tier rank lists (immutable)
const TIER_DATA: Record<number, RankItem[]> = {
  4: buildData(NAMES_T4, timeToSecs("05:34:05"), 800, 4),   // rank 5 = 나 (고2)
  3: buildData(NAMES_T3, timeToSecs("08:45:20"), 950),
  2: buildData(NAMES_T2, timeToSecs("11:20:15"), 1100, 3),  // rank 4 = 나 (클럽)
  1: buildData(NAMES_T2, timeToSecs("14:10:30"), 1200),     // 최고 조
};

// 탭별 기본 조
const TAB_DEFAULT_TIER: Record<"고2" | "클럽", number> = { "고2": 4, "클럽": 2 };

// Motivational message per active tier
const TIER_MSG: Record<number, string> = {
  4: "45분만 더 달리면 3조로 올라가요",
  3: "1시간만 더 달리면 2조로 올라가요",
  2: "2시간만 더 달리면 1조로 올라가요",
  1: "최고 조에서 달리고 있어요",
};

// ── Club data ─────────────────────────────────────────────────────────────────
// 클럽 탭: 조(tier) 개념 없이 단순 순위(1,2,3,4...)만 존재.
// 세그먼트 필터 = "전체" + 클럽 태그(최대 2개). 각 세그먼트는 독립적인 순위 리스트.
const CLUB_TAGS = ["학교", "동아리"] as const;
const CLUB_SEGMENTS = ["전체", ...CLUB_TAGS] as const;

const NAMES_CLUB_SCHOOL = ["반장님","우리반에이스","앞자리고정","조용한모범생","얼렁떵땅","뒷자리단골","급식부장","야자생존자","칠판지킴이","담임의자랑"];
const NAMES_CLUB_CIRCLE = ["동방지박령","연습벌레","무대체질","합주의달인","얼렁떵땅","악보마스터","박자감甲","목청왕","리허설중독","앵콜요청러"];

// 클럽 세그먼트별 순위 데이터 (index: 0=전체, 1=학교, 2=동아리). rank 5 = 나(얼렁떵땅).
const CLUB_DATA: RankItem[][] = [
  buildData(NAMES_T4, timeToSecs("05:34:05"), 800, 4),              // 전체
  buildData(NAMES_CLUB_SCHOOL, timeToSecs("04:50:12"), 700, 4),    // 학교
  buildData(NAMES_CLUB_CIRCLE, timeToSecs("03:40:33"), 600, 4),    // 동아리
];

// ── Carousel tiers ────────────────────────────────────────────────────────────
// 왼→오 오름차순 [1,2,3,4]. 활성(현재 조)이 중앙에 오면 더 높은 조(3,2,1)가 왼쪽에 보인다. (Figma 7130-35592)
const CAROUSEL_TIERS = [1, 2, 3, 4] as const;
type CarouselTier = typeof CAROUSEL_TIERS[number];
const CAROUSEL_GAP  = 16;
const CELL_SIZE     = 100; // 고정 셀 크기 — translateX 계산이 배지 크기에 독립적

const EASE = "cubic-bezier(0.4, 0, 0.2, 1)"; // Material Design standard
const DUR  = "0.35s";

// ── TierBadge (carousel item) ─────────────────────────────────────────────────
// 고정 100px 셀 안에 absolute로 배치 → 크기 변화가 레이아웃에 영향 없음
function TierBadge({ tier, isActive, onClick }: { tier: number; isActive: boolean; onClick: () => void }) {
  const size          = isActive ? 100 : 84;
  const offset        = (CELL_SIZE - size) / 2; // 셀 안 중앙 정렬 offset
  const imgSz         = isActive ? 68 : 56;
  const imgL          = isActive ? 15 : 13.64;
  const imgT          = isActive ? 5 : 3;
  const pillTop       = isActive ? 62 : 48;
  const pillH         = isActive ? 32 : 26.88;
  const pillPx        = isActive ? 16 : 13.44;
  const pillLeft      = isActive ? 5 : 3;
  const pillBg        = isActive ? "var(--color-fg-text-weak)" : "var(--color-bg-muted)";
  const pillTextColor = isActive ? "var(--color-fg-text-solid-muted)" : "var(--color-fg-text-disable)";
  const fs            = isActive ? 14 : 12;
  const lh            = isActive ? "21px" : "18px";
  const badgeImg      = isActive
    ? (ACTIVE_BADGE_IMG[tier]   ?? ACTIVE_BADGE_IMG[4])
    : (INACTIVE_BADGE_IMG[tier] ?? INACTIVE_BADGE_IMG[4]);

  return (
    <div
      onClick={onClick}
      className="absolute overflow-clip cursor-pointer"
      style={{
        left: offset, top: offset,
        width: size, height: size,
        transition: `left ${DUR} ${EASE}, top ${DUR} ${EASE}, width ${DUR} ${EASE}, height ${DUR} ${EASE}`,
      }}
    >
      <img alt="" className="absolute max-w-none"
        style={{ left: imgL, top: imgT, width: imgSz, height: imgSz }}
        src={badgeImg}
      />
      <div className="absolute flex items-center justify-center rounded-full"
        style={{
          left: pillLeft, top: pillTop, height: pillH,
          paddingLeft: pillPx, paddingRight: pillPx,
          background: pillBg,
          transition: `all ${DUR} ${EASE}`,
        }}
      >
        <p className="font-['Pretendard:Medium',sans-serif] whitespace-nowrap"
          style={{ fontSize: fs, lineHeight: lh, color: pillTextColor }}>
          32,345명
        </p>
      </div>
    </div>
  );
}

// ── TierCarousel ──────────────────────────────────────────────────────────────
function TierCarousel({ activeTier, onChange }: { activeTier: number; onChange: (t: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(375);
  const touchStartX  = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setWidth(el.offsetWidth);
    const ro = new ResizeObserver(() => setWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const idx = CAROUSEL_TIERS.indexOf(activeTier as CarouselTier);

  // translateX는 고정 CELL_SIZE 기준 → 배지 크기 변화에 완전히 독립.
  // 활성(보라색) 셀을 항상 화면 중앙에 배치한다.
  const widthBefore = idx * (CELL_SIZE + CAROUSEL_GAP);
  const tx = width / 2 - widthBefore - CELL_SIZE / 2;

  const goPrev = () => idx > 0 && onChange(CAROUSEL_TIERS[idx - 1]);
  const goNext = () => idx < CAROUSEL_TIERS.length - 1 && onChange(CAROUSEL_TIERS[idx + 1]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden"
      style={{ height: CELL_SIZE + 10 }}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = touchStartX.current - e.changedTouches[0].clientX;
        if (dx > 40) goNext();
        else if (dx < -40) goPrev();
        touchStartX.current = null;
      }}
    >
      <div
        className="flex"
        style={{
          gap: CAROUSEL_GAP,
          transform: `translateX(${tx}px)`,
          transition: `transform ${DUR} ${EASE}`,
        }}
      >
        {CAROUSEL_TIERS.map((tier) => (
          // 고정 100px 셀: 레이아웃 불변, 배지는 내부에서 absolute 애니메이션
          <div
            key={tier}
            style={{ width: CELL_SIZE, height: CELL_SIZE, flexShrink: 0, position: "relative" }}
          >
            <TierBadge tier={tier} isActive={tier === activeTier} onClick={() => onChange(tier)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SegmentedControl (클럽 태그 필터) ─────────────────────────────────────────
// Figma 7277-185789: 알약형 컨테이너(#333) 안에 세그먼트들, 활성은 브랜드 퍼플(#9678ff).
function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex items-center justify-center px-[16px] py-[16px] w-full">
      <div className="bg-[var(--color-bg-muted)] flex h-[40px] items-center p-[4px] rounded-full">
        {options.map((opt, i) => {
          const active = i === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(i)}
              aria-pressed={active}
              className={`min-w-[68px] h-[32px] flex items-center justify-center px-[8px] py-[6px] rounded-full transition-colors ${
                active ? "bg-[#9678ff] drop-shadow-[0px_4px_10px_rgba(109,114,120,0.16)]" : ""
              }`}
            >
              <p
                className={`font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] whitespace-nowrap ${
                  active ? "text-white" : "text-[var(--color-fg-text-disable)]"
                }`}
              >
                {opt}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── MeBadge ───────────────────────────────────────────────────────────────────
function MeBadge() {
  return (
    <div className="bg-white flex items-center justify-center rounded-full shrink-0" style={{ width: 20, height: 20 }}>
      <p className="font-['Pretendard:SemiBold',sans-serif] text-[10px] leading-[16px] text-[var(--color-fg-text-solid-muted)] text-center">나</p>
    </div>
  );
}

// ── RankRow ───────────────────────────────────────────────────────────────────
function RankRow({ item, tick }: { item: RankItem; tick: number }) {
  return (
    <div
      className={`flex gap-[42px] items-center px-[12px] py-[8px] rounded-[12px] drop-shadow-[0px_4px_4px_rgba(110,109,120,0.04)] ${
        item.isMe ? "bg-[var(--color-bg-muted)]" : ""
      }`}
    >
      {/* Left: rank + avatar + name */}
      <div className="flex flex-1 gap-[8px] items-center min-w-0">
        <div className="flex items-center justify-center shrink-0 w-[20px] h-[20px]">
          <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[1.5] text-white w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {item.rank}
          </p>
        </div>
        {/* 아바타 — 48px 슬롯에 40px 이미지 (Figma medal-icon). 내 행이면 아바타 우하단에 퍼플 "나" 배지. */}
        <div className="relative shrink-0 size-[48px] flex items-center justify-center">
          <Avatar size={40} idx={item.avatarIdx} />
          {item.isMe && (
            <div className="absolute bottom-[2px] right-[2px] size-[20px] rounded-full bg-[var(--color-bg-brand-pressed)] border border-white flex items-center justify-center">
              <p className="font-['Pretendard:SemiBold',sans-serif] text-[10px] leading-[16px] text-white text-center">나</p>
            </div>
          )}
        </div>
        <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[1.5] text-[var(--color-fg-text-muted)] overflow-hidden text-ellipsis whitespace-nowrap">
          {item.name}
        </p>
      </div>
      {/* Live timer */}
      <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[1.5] text-white text-center whitespace-nowrap shrink-0 tabular-nums">
        {secsToTime(item.baseSecs + tick)}
      </p>
    </div>
  );
}

// ── RankingScreen ─────────────────────────────────────────────────────────────
export default function RankingScreen({
  onNavigateToTimer,
  onNavigateToYesterday,
  onNavigateToTodo,
}: {
  onNavigateToTimer?: () => void;
  onNavigateToYesterday?: () => void;
  onNavigateToTodo?: () => void;
}) {
  const [activeTab,     setActiveTab]     = useState<"고2" | "클럽">("고2");
  // 탭마다 독립적인 활성 조를 기억
  const [tierByTab,     setTierByTab]     = useState<Record<"고2" | "클럽", number>>(TAB_DEFAULT_TIER);
  // 클럽 세그먼트 필터 (0=전체, 1=태그1, 2=태그2)
  const [clubSegment,   setClubSegment]   = useState(0);
  const [tick,          setTick]          = useState(0);
  const [showGradeInfo, setShowGradeInfo] = useState(false);

  const isClub     = activeTab === "클럽";
  const activeTier = tierByTab[activeTab];

  // 오프라인 모드 — 실시간 랭킹 갱신 불가 (PDF: 타이머 오프라인 제한 사항)
  const { isOffline } = useOffline();

  // 1-second interval — all timers tick together.
  // 오프라인에서는 실시간 갱신이 불가하므로 인터벌을 멈춘다(마지막 캐시 상태로 고정).
  useEffect(() => {
    if (isOffline) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isOffline]);

  // ── 데이터 선택 ──
  // 클럽: 조 개념 없이 세그먼트별 단순 순위 리스트.
  // 고2: 조(tier)별 리스트 + 동기부여 메시지.
  let rankData: RankItem[];
  let meItem: RankItem | undefined;
  let msg = "";
  if (isClub) {
    rankData = CLUB_DATA[clubSegment] ?? CLUB_DATA[0];
    meItem   = rankData.find(item => item.isMe);
  } else {
    rankData = TIER_DATA[activeTier] ?? TIER_DATA[4];
    // 동기부여 메시지는 항상 "내 조" 기준으로 고정 — 캐러셀로 다른 조를 봐도 바뀌지 않는다.
    const myTier     = TAB_DEFAULT_TIER[activeTab];
    msg              = TIER_MSG[myTier] ?? TIER_MSG[4];
    // 내 항목 — 캐러셀 탐색 시에도 항상 표시되도록 탭의 기본 조에서 고정
    const myTierData = TIER_DATA[myTier] ?? TIER_DATA[4];
    meItem           = myTierData.find(item => item.isMe);
  }

  return (
    <div className="bg-[var(--color-bg-weak)] h-full w-full flex flex-col relative">

      {/* ── Status bar ── */}
      <div className="h-[42px] relative shrink-0 w-full">
        <div className="absolute h-[11.5px] right-[14.5px] top-[19px] w-[67px]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSymbol} />
        </div>
        <p
          className="absolute font-['SF_Pro:Medium',sans-serif] font-[510] text-[var(--color-fg-text-weak)] text-[15px] tracking-[-0.165px] whitespace-nowrap"
          style={{ fontVariationSettings: "'wdth' 100", left: 29.5, top: "calc(50% - 9px)" }}
        >
          9:41
        </p>
      </div>

      {/* ── Header (뒤로가기 + 중앙 타이틀) ── */}
      <div className="h-[56px] shrink-0 relative w-full">
        <button
          type="button"
          onClick={onNavigateToTimer}
          aria-label="뒤로"
          className="absolute left-[8px] top-1/2 -translate-y-1/2 size-[36px] flex items-center justify-center rounded-[8px] active:bg-[#333] transition-colors"
        >
          <svg className="size-[24px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5L8 12L15 19" stroke="var(--color-fg-text-weak)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[var(--color-fg-text-weak)] whitespace-nowrap">
          랭킹
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center px-[16px] shrink-0">
        {(["고2", "클럽"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              // 탭 전환 시 해당 탭의 기본 조(나의 조)로 이동
              setTierByTab(prev => ({ ...prev, [tab]: TAB_DEFAULT_TIER[tab] }));
              // 클럽 세그먼트는 항상 "전체"로 리셋
              setClubSegment(0);
            }}
            className={`flex-1 h-[40px] flex items-center justify-center px-[16px] py-[10px] transition-colors ${
              activeTab === tab ? "border-b-2 border-[var(--color-fg-text-weak)]" : ""
            }`}
          >
            <p className={`font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] whitespace-nowrap ${
              activeTab === tab ? "text-[var(--color-fg-text-weak)]" : "text-[var(--color-fg-text-muted)]"
            }`}>
              {tab}
            </p>
          </button>
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="bg-[var(--color-fg-text-disable)] h-px w-full shrink-0" />

      {/* ── 오프라인 안내 — 실시간 랭킹 갱신 불가 (PDF) ── */}
      {isOffline && (
        <div className="shrink-0 flex items-center justify-center gap-[6px] px-[16px] py-[8px] bg-[rgba(255,107,107,0.10)]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 5.5C5.5 2.8 10.5 2.8 14 5.5" stroke="#ff6b6b" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M4.3 8.2C6.5 6.5 9.5 6.5 11.7 8.2" stroke="#ff6b6b" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="1.1" fill="#ff6b6b" />
            <path d="M2 14L14 2" stroke="#ff6b6b" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <p className="font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-[var(--color-fg-text-muted)]">
            오프라인 · 실시간 랭킹이 갱신되지 않아요
          </p>
        </div>
      )}

      {/* ── 상단 고정 섹션 (스크롤 안 됨) ── */}
      <div className="shrink-0 relative flex flex-col items-center py-[24px] gap-[8px]">

        {isClub ? (
          /* 클럽: 조 개념 없음 → 태그 세그먼트 필터 (전체 + 최대 2태그) */
          <SegmentedControl
            options={CLUB_SEGMENTS}
            value={clubSegment}
            onChange={setClubSegment}
          />
        ) : (
          <>
            {/* 고2: 동기부여 메시지 */}
            <div className="flex gap-[4px] items-center justify-center px-[16px]">
              <p className="font-['Pretendard:SemiBold',sans-serif] text-[20px] leading-[28px] text-white text-center">
                {msg}
              </p>
              <button
                type="button"
                onClick={() => setShowGradeInfo(true)}
                className="relative shrink-0 cursor-pointer active:scale-90 transition-transform"
                style={{ width: 20, height: 20 }}
                aria-label="등급 안내 보기"
              >
                <div className="absolute" style={{ left: 1.67, top: 1.67, width: 16.667, height: 16.667 }}>
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgInfoIcon} />
                </div>
              </button>
            </div>

            {/* 고2: 티어 캐러셀 */}
            <TierCarousel
              activeTier={activeTier}
              onChange={(t) => setTierByTab(prev => ({ ...prev, [activeTab]: t }))}
            />
          </>
        )}

        {/* My rank card — 핀 고정(퍼플 보더 + 아바타 위 퍼플 "나" 배지) */}
        {meItem && (
          <div className="bg-[var(--color-bg-input)] border-2 border-[var(--color-border-brand)] drop-shadow-[0px_4px_4px_rgba(110,109,120,0.04)] flex items-center px-[12px] py-[8px] rounded-[12px] mx-[16px] w-[calc(100%-32px)]">
            <div className="flex flex-1 gap-[42px] items-center min-w-0">
              <div className="flex flex-1 gap-[8px] items-center min-w-0">
                <div className="flex flex-col items-center justify-center shrink-0 size-[20px] overflow-hidden">
                  <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-white overflow-hidden text-ellipsis w-full whitespace-nowrap">
                    {meItem.rank}
                  </p>
                </div>
                {/* 아바타(48px 슬롯, 40px 이미지) + 퍼플 "나" 배지 */}
                <div className="relative shrink-0 size-[48px] flex items-center justify-center">
                  <Avatar size={40} idx={meItem.avatarIdx} />
                  <div className="absolute bottom-[2px] right-[2px] size-[20px] rounded-full bg-[var(--color-bg-brand-pressed)] border border-white flex items-center justify-center">
                    <p className="font-['Pretendard:SemiBold',sans-serif] text-[10px] leading-[16px] text-white text-center">나</p>
                  </div>
                </div>
                <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-white overflow-hidden text-ellipsis whitespace-nowrap">
                  얼렁떵땅
                </p>
              </div>
              <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-white text-center whitespace-nowrap shrink-0 tabular-nums">
                {secsToTime(meItem.baseSecs + tick)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Rank list (scrollable) + 상단 스크롤 포그 ── */}
      <div className="flex-1 min-h-0 relative">
        {/* 상단 포그 — 위 불투명(#262626) → 아래 투명. 리스트가 티어 섹션 아래로 페이드인 (Figma 7277-185840) */}
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-[80px] z-[10]"
          style={{ background: "linear-gradient(to bottom, rgba(38,38,38,1) 0%, rgba(38,38,38,0.6) 50%, rgba(38,38,38,0) 100%)" }}
          aria-hidden="true"
        />
        <div
          className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex flex-col gap-[4px] px-[14px] py-[8px]">
            {rankData.map((item) => (
              <RankRow key={item.rank} item={item} tick={tick} />
            ))}
          </div>
        </div>
      </div>

      {/* ── 하단 스크롤 포그 (리스트 페이드아웃) ── */}
      <div
        className="pointer-events-none absolute left-0 right-0 bottom-[34px] h-[72px] z-[10]"
        style={{ background: "linear-gradient(to bottom, rgba(38,38,38,0) 0%, var(--color-bg-weak) 100%)" }}
        aria-hidden="true"
      />

      {/* ── Safe area ── */}
      <div className="h-[34px] shrink-0 bg-[var(--color-bg-weak)]" />

      {/* ── Grade info popup ── */}
      {showGradeInfo && (
        <>
          {/* 딤드 배경 */}
          <div
            className="absolute inset-0 bg-black/50 z-40"
            onClick={() => setShowGradeInfo(false)}
          />
          {/* 팝업 카드 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[343px] max-w-[480px] bg-[var(--color-bg-weak)] rounded-[16px] p-[24px] flex flex-col gap-[16px] items-center overflow-hidden">
            <div className="flex flex-col gap-[32px] items-start w-full">

              {/* 제목 + 설명 + 테이블 */}
              <div className="flex flex-col gap-[16px] items-start w-full">
                {/* 제목 */}
                <div className="w-full text-center">
                  <p className="font-['Pretendard:SemiBold',sans-serif] text-[18px] leading-[27px] text-white">
                    함께 달리는 러너 등급
                  </p>
                </div>
                {/* 설명 */}
                <div className="w-full text-center">
                  <p className="font-['Pretendard:Regular',sans-serif] text-[16px] leading-[24px] text-white">
                    총 누적 시간에 따라 조가 나뉘어요
                  </p>
                </div>
                {/* 등급표 */}
                <div className="bg-[var(--color-bg-muted)] rounded-[12px] p-[16px] w-full">
                  <div className="flex flex-col gap-[8px] font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px]">
                    {[
                      { tier: "1조", desc: "총 8시간 이상" },
                      { tier: "2조", desc: "총 4시간 이상" },
                      { tier: "3조", desc: "총 1시간 이상" },
                      { tier: "4조", desc: "총 0시간 이상" },
                    ].map(({ tier, desc }) => (
                      <div key={tier} className="flex items-center justify-between">
                        <p className="text-[#ab94ff] whitespace-nowrap shrink-0">{tier}</p>
                        <p className="flex-1 min-w-px text-white text-right">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 확인 버튼 */}
              <button
                type="button"
                onClick={() => setShowGradeInfo(false)}
                className="bg-[var(--color-bg-brand)] h-[44px] w-full flex items-center justify-center rounded-[8px] active:bg-[var(--color-bg-brand-pressed)] transition-colors"
              >
                <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-white text-center">
                  확인
                </p>
              </button>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
