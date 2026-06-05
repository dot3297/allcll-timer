/**
 * CashHistoryScreen — 캐시 적립/사용 내역 화면
 *
 * ## 개요
 * 사용자의 캐시 적립 및 사용 이력을 전체 목록으로 보여주는 전체 화면 컴포넌트.
 * CashPopup 내 "내 캐시 히스토리" 버튼을 탭하면 진입한다.
 *
 * ## 주요 기능
 * - 캐시 적립/사용 내역을 날짜·타입별로 리스트 표시
 * - 각 항목에 적립/사용 구분, 금액, 날짜 정보 표시
 *
 * ## 현재 상태 (TODO)
 * - [ ] 서버 API 연동 (현재 더미 데이터 사용)
 * - [ ] 무한 스크롤 구현
 * - [ ] 날짜·타입 필터 기능 추가
 */
// ── 캐시 히스토리 페이지 ──────────────────────────────────────────────────────

type HistoryItem = {
  id: number;
  type: "적립" | "사용";
  title: string;
  expiry: string;
  amount: number;
  date: string;
};

const HISTORY: HistoryItem[] = [
  { id: 1,  type: "적립", title: "타이머", expiry: "2028-05-26까지 사용 가능", amount: +5,  date: "2026-05-26" },
  { id: 2,  type: "적립", title: "타이머", expiry: "2028-05-26까지 사용 가능", amount: +5,  date: "2026-05-26" },
  { id: 3,  type: "적립", title: "타이머", expiry: "2028-05-25까지 사용 가능", amount: +5,  date: "2026-05-25" },
  { id: 4,  type: "적립", title: "타이머", expiry: "2028-05-22까지 사용 가능", amount: +10, date: "2026-05-22" },
  { id: 5,  type: "적립", title: "타이머", expiry: "2028-04-14까지 사용 가능", amount: +10, date: "2026-04-14" },
  { id: 6,  type: "적립", title: "타이머", expiry: "2028-04-13까지 사용 가능", amount: +5,  date: "2026-04-13" },
  { id: 7,  type: "적립", title: "타이머", expiry: "2028-04-13까지 사용 가능", amount: +10, date: "2026-04-13" },
  { id: 8,  type: "적립", title: "타이머", expiry: "2028-04-12까지 사용 가능", amount: +5,  date: "2026-04-12" },
  { id: 9,  type: "적립", title: "타이머", expiry: "2028-03-30까지 사용 가능", amount: +10, date: "2026-03-30" },
  { id: 10, type: "사용", title: "스토어 구매", expiry: "",                     amount: -50, date: "2026-03-28" },
  { id: 11, type: "적립", title: "타이머", expiry: "2028-03-20까지 사용 가능", amount: +5,  date: "2026-03-20" },
  { id: 12, type: "적립", title: "타이머", expiry: "2028-03-10까지 사용 가능", amount: +10, date: "2026-03-10" },
];

const BALANCE = HISTORY.reduce((s, i) => s + i.amount, 0); // 282

export default function CashHistoryScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-white h-full w-full flex flex-col">

      {/* 상태바 */}
      <div className="h-[42px] relative shrink-0 w-full">
        <p
          className="absolute font-['SF_Pro:Medium',sans-serif] font-[510] text-[#333] text-[15px] tracking-[-0.165px] whitespace-nowrap"
          style={{ fontVariationSettings: "'wdth' 100", left: 29.5, top: "calc(50% - 9px)" }}
        >
          9:41
        </p>
      </div>

      {/* 네비게이션 바 */}
      <div className="flex h-[56px] items-center px-[4px] shrink-0 w-full relative">
        {/* 뒤로가기 */}
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="flex items-center justify-center w-[44px] h-[44px] active:opacity-50 transition-opacity"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* 타이틀 */}
        <p className="absolute left-1/2 -translate-x-1/2 font-['Pretendard:SemiBold',sans-serif] text-[17px] leading-[1.5] text-[#333] whitespace-nowrap">
          캐시 히스토리
        </p>

        {/* 우측 ? 버튼 */}
        <button
          type="button"
          aria-label="캐시 안내"
          className="absolute right-[12px] flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[#efeff0] active:bg-[#d8d8d8] transition-colors"
        >
          <p className="font-['Pretendard:SemiBold',sans-serif] text-[14px] leading-none text-[#6d7278]">?</p>
        </button>
      </div>

      {/* 보유 잔액 */}
      <div className="flex items-center justify-between px-[20px] py-[20px] shrink-0">
        <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[#b6b8b9]">
          보유
        </p>
        <div className="flex items-baseline gap-[2px]">
          <p className="font-['Pretendard:Bold',sans-serif] text-[28px] leading-[1.2] text-[#333]">
            {BALANCE}
          </p>
          <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[#b6b8b9]">
            캐시
          </p>
        </div>
      </div>

      {/* 구분선 */}
      <div className="h-[8px] bg-[#f9f9fa] shrink-0" />

      {/* 캐시 내역 */}
      <div
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {/* 섹션 헤더 */}
        <div className="px-[20px] pt-[24px] pb-[12px]">
          <p className="font-['Pretendard:SemiBold',sans-serif] text-[16px] leading-[24px] text-[#333]">
            캐시 내역
          </p>
        </div>

        {/* 내역 리스트 */}
        <div className="flex flex-col">
          {HISTORY.map((item, idx) => (
            <div key={item.id}>
              {/* 행 */}
              <div className="flex items-center gap-[12px] px-[20px] py-[14px]">
                {/* 뱃지 */}
                <div
                  className="shrink-0 flex items-center justify-center rounded-[6px] px-[8px] h-[24px]"
                  style={{ background: item.type === "적립" ? "#f0f0f2" : "#fff0f3" }}
                >
                  <p
                    className="font-['Pretendard:Medium',sans-serif] text-[11px] leading-none whitespace-nowrap"
                    style={{ color: item.type === "적립" ? "#6d7278" : "#ff4d6a" }}
                  >
                    {item.type}
                  </p>
                </div>

                {/* 중앙: 타이틀 + 만료일 */}
                <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                  <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[#333] whitespace-nowrap">
                    {item.title}
                  </p>
                  {item.expiry ? (
                    <p className="font-['Pretendard:Regular',sans-serif] text-[12px] leading-[18px] text-[#b6b8b9]">
                      {item.expiry}
                    </p>
                  ) : (
                    <div className="h-[18px]" />
                  )}
                </div>

                {/* 우측: 금액 + 날짜 */}
                <div className="flex flex-col items-end gap-[2px] shrink-0">
                  <div className="flex items-baseline gap-[1px]">
                    <p
                      className="font-['Pretendard:SemiBold',sans-serif] text-[15px] leading-[22px]"
                      style={{ color: item.amount > 0 ? "#9678ff" : "#333" }}
                    >
                      {item.amount > 0 ? `+${item.amount}` : item.amount}
                    </p>
                    <p className="font-['Pretendard:Regular',sans-serif] text-[12px] leading-[18px] text-[#b6b8b9]">
                      캐시
                    </p>
                  </div>
                  <p className="font-['Pretendard:Regular',sans-serif] text-[12px] leading-[18px] text-[#b6b8b9]">
                    {item.date}
                  </p>
                </div>
              </div>

              {/* 행 구분선 (마지막 제외) */}
              {idx < HISTORY.length - 1 && (
                <div className="h-px bg-[#f2f2f4] mx-[20px]" />
              )}
            </div>
          ))}
        </div>

        <div className="h-[40px]" />
      </div>
    </div>
  );
}
