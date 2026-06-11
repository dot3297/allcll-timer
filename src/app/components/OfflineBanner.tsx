/**
 * OfflineBanner — 오프라인 모드 상단 배너 (Figma/PDF: offline-mode-ux-guide)
 *
 * 화면 최상단(상태바 아래)에 슬라이드로 나타나는 다크그레이 배너.
 * - 오프라인 + 대기 있음 : "오프라인 모드 · N개 항목 동기화 대기 중"
 * - 오프라인 + 대기 없음 : "오프라인 모드 · 일부 기능이 제한됩니다"
 * - 온라인 복귀 직후      : "동기화 완료" (브랜드 톤, 약 2.2초 후 사라짐)
 *
 * 타이머·투두 화면 루트에 배치한다. 상태바(42px) 바로 아래에 오버레이된다.
 *
 * @param offlineLabel 대기 항목이 없을 때 표시할 컨텍스트 문구(예: 타이머 측정 중 "측정 중").
 *                     지정 시 "오프라인 · {offlineLabel}"로 표시. (PDF p.4 "오프라인 · 측정 중")
 */
import { useOffline } from "../contexts/OfflineContext";

export default function OfflineBanner({ offlineLabel }: { offlineLabel?: string } = {}) {
  const { isOffline, pendingCount, justSynced } = useOffline();
  const visible = isOffline || justSynced;

  const synced = justSynced && !isOffline;
  const label = synced
    ? "동기화 완료"
    : pendingCount > 0
      ? `오프라인 모드 · ${pendingCount}개 항목 동기화 대기 중`
      : offlineLabel
        ? `오프라인 · ${offlineLabel}`
        : "오프라인 모드 · 일부 기능이 제한됩니다";

  return (
    <>
      <style>{`
        @keyframes offlineBannerIn {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0%);    opacity: 1; }
        }
      `}</style>
      <div
        className="absolute top-[42px] left-0 right-0 z-[70] pointer-events-none px-[12px]"
        aria-hidden={!visible}
      >
        {visible && (
          <div
            role="status"
            className="flex items-center gap-[8px] h-[36px] px-[14px] rounded-[10px] shadow-[0px_4px_12px_rgba(0,0,0,0.35)]"
            style={{
              background: synced ? "var(--color-bg-brand)" : "#1f1f1f",
              animation: "offlineBannerIn 0.3s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            {synced ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8.4L6.2 11.5L13 4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              // 오프라인(연결 끊김) 아이콘 — 와이파이에 사선
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 5.5C5.5 2.8 10.5 2.8 14 5.5" stroke="#b6b8b9" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M4.3 8.2C6.5 6.5 9.5 6.5 11.7 8.2" stroke="#b6b8b9" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="8" cy="11.5" r="1.1" fill="#b6b8b9" />
                <path d="M2 14L14 2" stroke="#ff6b6b" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            )}
            <p className="font-['Pretendard:Medium',sans-serif] text-[13px] leading-[20px] text-white whitespace-nowrap overflow-hidden text-ellipsis">
              {label}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
