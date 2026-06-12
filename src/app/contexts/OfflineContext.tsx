/**
 * OfflineContext — 오프라인 모드 전역 상태 (UI 전용 프로토타입)
 *
 * ## 개요
 * 타이머·투두 화면의 오프라인 UX를 시연하기 위한 전역 상태.
 * 실제 네트워크/동기화 로직은 없고, 화면 표현(배너·대기 배지·임시저장 다이얼로그)만 구동한다.
 *
 * ## 상태
 * - isOffline    : 오프라인 여부 (개발용 토글로 전환)
 * - pendingCount : 동기화 대기 중인 항목 수 (타이머·투두 합산) — 배너 문구에 사용
 * - justSynced   : 온라인 복귀 직후 "동기화 완료" 연출 표시 여부 (약 2.2초)
 *
 * ## 동작
 * - 오프라인 중 항목 추가/변경 → addPending()으로 대기 수 증가
 * - 온라인 복귀(setOffline(false)) → 대기 항목이 있으면 "동기화 완료" 연출 후 대기 수 0으로
 */
import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";

/** 온라인 복귀 시 "동기화 완료" 연출 지속 시간(ms). 타이머·투두 화면도 이 값에 맞춰 대기 배지를 정리한다. */
export const SYNC_ANIM_MS = 2200;

/** 오프라인 중 임시 저장된 타이머 기록 — 홈 "내 타이머" 리스트에 대기 배지로 표시 */
export type PendingTimer = { id: string; name: string; time: string; synced: boolean };

type OfflineCtx = {
  isOffline: boolean;
  pendingCount: number;
  justSynced: boolean;
  pendingTimers: PendingTimer[];
  setOffline: (v: boolean) => void;
  addPending: (n?: number) => void;
  /** 타이머 임시 저장 — 대기 기록으로 추가 (pendingCount도 +1) */
  addPendingTimer: (name: string, time: string) => void;
};

const Ctx = createContext<OfflineCtx | null>(null);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [justSynced, setJustSynced] = useState(false);
  const [pendingTimers, setPendingTimers] = useState<PendingTimer[]>([]);

  // pendingCount의 최신값을 콜백에서 안전하게 읽기 위한 미러
  const pendingRef = useRef(0);
  useEffect(() => { pendingRef.current = pendingCount; }, [pendingCount]);

  const setOffline = useCallback((v: boolean) => {
    if (!v) {
      // 온라인 복귀 — 대기 항목이 있으면 동기화 완료 연출 후 정리
      if (pendingRef.current > 0) {
        setJustSynced(true);
        window.setTimeout(() => {
          setJustSynced(false);
          setPendingCount(0);
          // 대기 타이머는 목록에 남기되 동기화 완료 처리(배지 제거)
          setPendingTimers((prev) => prev.map((t) => (t.synced ? t : { ...t, synced: true })));
        }, SYNC_ANIM_MS);
      }
    } else {
      setJustSynced(false);
    }
    setIsOffline(v);
  }, []);

  const addPending = useCallback((n = 1) => {
    setPendingCount((c) => Math.max(0, c + n));
  }, []);

  const addPendingTimer = useCallback((name: string, time: string) => {
    const id = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    setPendingTimers((prev) => [{ id, name, time, synced: false }, ...prev]);
    setPendingCount((c) => c + 1);
  }, []);

  return (
    <Ctx.Provider value={{ isOffline, pendingCount, justSynced, pendingTimers, setOffline, addPending, addPendingTimer }}>
      {children}
    </Ctx.Provider>
  );
}

export function useOffline(): OfflineCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOffline must be used within <OfflineProvider>");
  return v;
}
