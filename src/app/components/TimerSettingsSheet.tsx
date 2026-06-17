/**
 * TimerSettingsSheet — 타이머 설정 바텀시트
 *
 * ## 개요
 * 타이머 화면 사이드의 설정 버튼을 탭하면 표시되는 바텀시트 컴포넌트.
 * 타이머 관련 세부 설정을 조정할 수 있다.
 *
 * ## 주요 기능
 * - 화면 항상 켜짐 / 명언 ON/OFF 토글 설정
 * - 뽀모 소리/진동 선택 (없음/소리만/진동만/둘다) — 뽀모도로 모드에서만 노출
 * - "캐릭터 변경" 버튼: CharacterChangeSheet 바텀시트 연결
 * - 다른 앱 사용(허용 앱) 설정
 */
import { useState } from "react";

/** 뽀모 소리/진동 옵션 — 뽀모도로 모드에서만 표시 */
const POMO_ALERT_OPTIONS = ["없음", "소리만", "진동만", "둘다"] as const;

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-[31px] w-[51px] rounded-full transition-colors duration-200 shrink-0 ${on ? "bg-[#9678ff]" : "bg-[#6d7278]"}`}
    >
      <div
        className={`absolute top-[2px] size-[27px] rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? "translate-x-[22px]" : "translate-x-[2px]"}`}
      />
    </button>
  );
}

export default function TimerSettingsSheet({
  onClose,
  onCharacterChange,
  isPomodoroMode = false,
}: {
  onClose: () => void;
  onCharacterChange: () => void;
  /** 뽀모도로 모드 진입 여부 — true일 때만 "뽀모 소리/진동" 노출 */
  isPomodoroMode?: boolean;
}) {
  const [screenAlwaysOn, setScreenAlwaysOn] = useState(true);
  const [quotes, setQuotes] = useState(true);
  const [pomoAlert, setPomoAlert] = useState("진동만");

  return (
    <div className="absolute inset-0 z-50">
      {/* 딤 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 바텀시트 */}
      <div className="absolute bottom-0 left-0 w-full bg-[#262626] rounded-tl-[16px] rounded-tr-[16px] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-start justify-between px-[16px] py-[24px] shrink-0">
          <p className="font-['Pretendard:SemiBold',sans-serif] text-[18px] leading-[27px] text-[#f9f9fa]">설정</p>
          <button
            onClick={onClose}
            className="size-[24px] flex items-center justify-center cursor-pointer active:opacity-60 transition-opacity"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-full">
              <path d="M18 6L6 18M6 6l12 12" stroke="#f9f9fa" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 설정 항목 */}
        <div className="flex flex-col w-full">
          {/* 화면 항상 켜짐 */}
          <div className="px-[16px]">
            <div className="flex items-center justify-between py-[16px]">
              <p className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[#f9f9fa]">
                화면 항상 켜짐
              </p>
              <Toggle on={screenAlwaysOn} onChange={setScreenAlwaysOn} />
            </div>
            <div className="h-px bg-[#6d7278]" />
          </div>

          {/* 명언 */}
          <div className="px-[16px]">
            <div className="flex items-center justify-between py-[16px]">
              <p className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[#f9f9fa]">
                명언
              </p>
              <Toggle on={quotes} onChange={setQuotes} />
            </div>
            <div className="h-px bg-[#6d7278]" />
          </div>

          {/* 뽀모 소리/진동 — 뽀모도로 모드에서만 노출 */}
          {isPomodoroMode && (
            <div className="px-[16px]">
              <div className="flex flex-col gap-[8px] py-[16px]">
                <p className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[#f9f9fa]">
                  뽀모 소리/진동
                </p>
                <div className="flex gap-[4px]">
                  {POMO_ALERT_OPTIONS.map((opt) => {
                    const sel = pomoAlert === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPomoAlert(opt)}
                        aria-pressed={sel}
                        className={`flex-1 h-[48px] rounded-[8px] flex items-center justify-center font-['Pretendard:Regular',sans-serif] text-[14px] leading-[21px] transition-colors ${
                          sel ? "bg-[#6d7278] text-white" : "bg-[#333] text-[#95999d]"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="h-px bg-[#6d7278]" />
            </div>
          )}

          {/* 캐릭터 변경 */}
          <div className="px-[16px]">
            <button
              onClick={onCharacterChange}
              className="flex items-center justify-between py-[16px] w-full cursor-pointer active:opacity-60 transition-opacity"
            >
              <p className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[#f9f9fa]">
                캐릭터 변경
              </p>
              {/* 우측 화살표 */}
              <svg viewBox="0 0 24 24" fill="none" className="size-[24px] shrink-0">
                <path d="M9 6l6 6-6 6" stroke="#f9f9fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="h-px bg-[#6d7278]" />
          </div>

          {/* 다른 앱 사용 */}
          <div className="px-[16px] py-[16px]">
            <div className="flex flex-col gap-[12px]">
              <div className="flex flex-col gap-[4px]">
                <p className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[#f9f9fa]">
                  다른 앱 사용
                </p>
                <p className="font-['Spoqa_Han_Sans_Neo:Regular',sans-serif] text-[12px] leading-[18px] text-[#acaabb]">
                  타이머 측정 시 차단하지 않을 앱을 추가해요.
                </p>
              </div>
              {/* 앱 아이콘 그리드 */}
              <div className="bg-[#333] h-[64px] rounded-[8px] overflow-hidden relative">
                <div className="absolute inset-0 flex items-center gap-[8px] px-[8px]">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="shrink-0 size-[48px] rounded-[8px] bg-[#6d7278]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 세이프 에어리어 */}
        <div className="h-[34px] relative shrink-0 w-full bg-[#262626]">
          <div className="absolute bottom-[8px] left-[32.13%] right-[32.13%] h-[5px] bg-white rounded-full" />
        </div>
      </div>
    </div>
  );
}
