/**
 * AppSettingsScreen — 앱 설정 화면 (Figma 7526-115437 "설정")
 *
 * 홈 화면의 모드 전환 FAB에서 진입. 차단/문의/리뷰/테마 등 메뉴와
 * "온라인 모드" 토글(온/오프라인 전환)을 제공한다. (메뉴는 UI 전용)
 */
import { useOffline } from "../contexts/OfflineContext";
import statusSymbol from "../../imports/홈/status-symbol.svg";

/** 라벨형 온/오프 토글 — ON: 브랜드 보라 / OFF: 회색 (Figma 7526-115836) */
function LabeledToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      aria-pressed={on}
      className={`flex items-center gap-[5px] h-[31px] rounded-full py-[2px] transition-colors ${
        on ? "bg-[var(--color-bg-brand)] pl-[8px] pr-[2px]" : "bg-[#efeff0] pl-[2px] pr-[8px]"
      }`}
    >
      {on && <span className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-white">ON</span>}
      <div className="size-[27px] rounded-full bg-white shrink-0" style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.15)" }} />
      {!on && <span className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[#b6b8b9]">OFF</span>}
    </button>
  );
}

const MENU = ["차단 유저 관리", "문의/건의하기", "리뷰 남기기", "테마 변경"];
const FOOTER = ["이용약관", "개인정보 처리방침", "로그아웃", "회원탈퇴"];

export default function AppSettingsScreen({ onBack }: { onBack: () => void }) {
  const { isOffline, setOffline } = useOffline();
  const online = !isOffline; // "온라인 모드" 토글 상태

  return (
    <div className="absolute inset-0 z-[70] bg-white flex flex-col" data-name="설정">
      {/* ── Status bar ── */}
      <div className="h-[42px] relative shrink-0 w-full">
        <p className="absolute left-[29.5px] top-1/2 -translate-y-1/2 font-['SF_Pro:Medium',sans-serif] font-[510] text-[#333] text-[15px] tracking-[-0.165px]" style={{ fontVariationSettings: "'wdth' 100" }}>9:41</p>
        <img src={statusSymbol} alt="" className="absolute right-[14.5px] top-[19.16px] h-[11.5px] w-[67px]" />
      </div>

      {/* ── Nav bar ── */}
      <div className="h-[56px] shrink-0 relative w-full flex items-center px-[12px]">
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
        <p className="absolute left-1/2 -translate-x-1/2 font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[#333] whitespace-nowrap">설정</p>
      </div>

      {/* ── 메뉴 리스트 ── */}
      <div className="flex-1 min-h-0 overflow-y-auto p-[16px] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        {MENU.map((label) => (
          <div key={label} className="w-full">
            <button type="button" className="w-full py-[12px] text-left active:opacity-60 transition-opacity">
              <p className="font-['Pretendard:Regular',sans-serif] text-[14px] leading-[21px] text-[#333]">{label}</p>
            </button>
            <div className="h-px bg-[#efeff0]" />
          </div>
        ))}

        {/* 온라인 모드 토글 */}
        <div className="w-full">
          <div className="flex items-center py-[8px]">
            <p className="flex-1 font-['Pretendard:Regular',sans-serif] text-[14px] leading-[21px] text-[#333]">온라인 모드</p>
            <LabeledToggle on={online} onChange={(v) => setOffline(!v)} />
          </div>
          <div className="h-px bg-[#efeff0]" />
        </div>

        {/* 하단 약관/계정 */}
        <div className="pt-[4px]">
          {FOOTER.map((label) => (
            <button key={label} type="button" className="w-full py-[8px] text-left active:opacity-60 transition-opacity">
              <p className="font-['Pretendard:Regular',sans-serif] text-[12px] leading-[18px] text-[#868b90]">{label}</p>
            </button>
          ))}
          <div className="py-[8px]">
            <p className="font-['Pretendard:Regular',sans-serif] text-[12px] leading-[18px] text-[var(--color-fg-text-brand)] opacity-50">ver.2.4.51</p>
          </div>
        </div>
      </div>

      {/* ── Safe area ── */}
      <div className="h-[34px] shrink-0 bg-white" />
    </div>
  );
}
