/**
 * OfflineBanner — 오프라인 모드 상단 배너 (Figma 7353:33750 "toast")
 *
 * 화면 최상단(상태바 아래)에 슬라이드로 나타나는 코랄 토스트.
 * - 오프라인 + 대기 있음 : "오프라인 모드중 · N개 항목 동기화 대기 중"
 * - 오프라인 + 대기 없음 : "오프라인 모드중 · 일부 기능이 제한돼요"
 * - 타이머 측정 중       : "오프라인 모드중 · 측정 중" (offlineLabel)
 * - 온라인 복귀 직후      : "동기화 완료" (브랜드 톤, 약 2.2초 후 사라짐)
 *
 * 우측 "온라인 모드" 텍스트 버튼으로 온라인 복귀(setOffline(false)).
 * 타이머·투두 화면 루트에 배치한다. 상태바(42px) 바로 아래에 오버레이된다.
 *
 * @param offlineLabel 대기 항목이 없을 때 표시할 컨텍스트 문구(예: 타이머 측정 중 "측정 중").
 */
import { useOffline } from "../contexts/OfflineContext";

export default function OfflineBanner({ offlineLabel }: { offlineLabel?: string } = {}) {
  const { isOffline, pendingCount, justSynced, setOffline } = useOffline();
  const visible = isOffline || justSynced;
  const synced = justSynced && !isOffline;

  const detail =
    pendingCount > 0
      ? `${pendingCount}개 항목 동기화 대기 중`
      : offlineLabel
        ? offlineLabel
        : "일부 기능이 제한돼요";

  return (
    <>
      <style>{`
        @keyframes offlineBannerIn {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0%);    opacity: 1; }
        }
      `}</style>
      <div className="absolute top-[42px] left-0 right-0 z-[70]" aria-hidden={!visible}>
        {visible && (
          synced ? (
            // 동기화 완료 — 온라인 복귀 확인 (브랜드 톤)
            <div
              role="status"
              className="flex items-center gap-[4px] px-[16px] py-[8px] bg-[var(--color-bg-brand)]"
              style={{ animation: "offlineBannerIn 0.3s cubic-bezier(0.22,1,0.36,1)" }}
            >
              <span className="shrink-0 size-[20px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8.4L6.2 11.5L13 4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="flex-1 min-w-0 font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-white">
                동기화 완료
              </p>
            </div>
          ) : (
            // 오프라인 — 코랄 토스트 (Figma 7353:33750)
            <div
              role="status"
              className="flex items-center gap-[4px] px-[16px] py-[8px]"
              style={{
                // 디자인 값: color/bg/error(#F79479) 20% (Figma 7353:33750)
                backgroundColor: "rgba(247, 148, 121, 0.2)",
                animation: "offlineBannerIn 0.3s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {/* 오프라인 아이콘 (와이파이 + 사선) */}
              <span className="shrink-0 size-[20px] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 5.5C5.5 2.8 10.5 2.8 14 5.5" stroke="var(--color-fg-text-inverse)" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M4.3 8.2C6.5 6.5 9.5 6.5 11.7 8.2" stroke="var(--color-fg-text-inverse)" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx="8" cy="11.5" r="1.1" fill="var(--color-fg-text-inverse)" />
                  <path d="M2 14L14 2" stroke="#f37555" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </span>
              <p className="flex-1 min-w-0 font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-[var(--color-fg-text-inverse)]">
                오프라인 모드중 · {detail}
              </p>
              {/* 온라인 모드 버튼 — 온라인 복귀 */}
              <button
                type="button"
                onClick={() => setOffline(false)}
                className="shrink-0 h-[28px] flex items-center gap-[2px] px-[8px] py-[4px] rounded-[4px] active:opacity-70 transition-opacity"
                data-name="online-mode-button"
              >
                <span className="font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-[#f37555] whitespace-nowrap">
                  온라인 모드
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M10 6A4 4 0 1 1 8.8 3.15" stroke="#f37555" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M10 1.5V4H7.5" stroke="#f37555" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )
        )}
      </div>
    </>
  );
}
