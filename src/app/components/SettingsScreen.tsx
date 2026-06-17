/**
 * SettingsScreen — 카테고리 편집(관리) 화면
 *
 * ## 개요
 * 할일 화면 헤더의 톱니(설정) → "편집"으로 진입하는 카테고리 관리 전체 화면.
 * Figma 7238-112932 기준.
 *
 * ## 주요 기능
 * - "표시중" / "숨김" 두 섹션으로 카테고리 목록 표시 (회색 박스 행)
 * - 행의 "···" 메뉴: 수정(이름 변경) / 숨기기·숨김 해제 / 삭제
 * - 체크박스 다중 선택 → 하단 액션 바(숨기기/숨김 해제·삭제)
 * - "추가 하기" FAB → 새 카테고리 추가(CategoryAddPopup)
 */
import { useEffect, useRef, useState } from "react";
import CategoryRenameSheet from "./CategoryRenameSheet";
import CategoryHideSheet, { type HideMode, type SheetVariant } from "./CategoryHideSheet";
import ConfirmPopup from "./ConfirmPopup";

// Back-arrow path (matches the one used in TodoScreen.tsx Header)
const PATH_BACK = "M0 1.13137L1.13137 0L6.56569 5.43431L12 0L13.1314 1.13137L6.56569 7.69706L0 1.13137Z";

type Props = {
  /** Current user-added categories (visible + hidden). 값은 카테고리 키. */
  categories: string[];
  /** 카테고리 키 → 표시 이름 (동일 이름 신규 카테고리는 키가 이름과 다름). */
  displayName: (key: string) => string;
  /** Categories currently hidden from the main UI. */
  hiddenCategories: string[];
  /** Mark the supplied categories as hidden with a scope ('today' = 오늘부터, 'all' = 전체). */
  onHide: (list: string[], mode: HideMode) => void;
  /** 숨김 해제. mode 'all' = 전체 해제(모든 날짜 표시), 'today' = 오늘부터 해제(과거는 계속 숨김). */
  onUnhide: (list: string[], mode: HideMode) => void;
  /** Permanently delete the supplied categories and their todos. */
  onDelete: (list: string[]) => void;
  /** Returns true if the given category has at least one todo with text. */
  categoryHasTodos: (cat: string) => boolean;
  /** Rename a category: replace oldName with newName everywhere. */
  onRename: (oldName: string, newName: string) => void;
  /** Reorder: called with the new full categories array (visible first, then hidden). */
  onReorder: (newCategories: string[]) => void;
  /** Open the "add category" popup. */
  onAdd: () => void;
  /** Called on back-arrow. */
  onBack: () => void;
};

export default function SettingsScreen({
  categories,
  displayName,
  hiddenCategories,
  onHide,
  onUnhide,
  onDelete,
  categoryHasTodos,
  onRename,
  onReorder,
  onAdd,
  onBack,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [renamingCat, setRenamingCat] = useState<string | null>(null);
  // 할일이 있는 카테고리를 삭제할 때 보여줄 확인 팝업 — 삭제할 카테고리 목록을 보관
  const [pendingDeleteList, setPendingDeleteList] = useState<string[] | null>(null);
  // 숨기기/숨김 해제 옵션 바텀시트 (null이면 닫힘)
  const [sheet, setSheet] = useState<{ list: string[]; variant: SheetVariant } | null>(null);
  // 숨기기/숨김 해제 결과 토스트 (null이면 숨김)
  const [toast, setToast] = useState<string | null>(null);

  // 토스트 자동 사라짐
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  // ── 드래그 정렬 상태 (표시중 섹션) ─────────────────────────────────────────
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const hiddenSet = new Set(hiddenCategories);
  const visibleList = categories.filter((c) => !hiddenSet.has(c));
  const hiddenList = categories.filter((c) => hiddenSet.has(c));

  // 드래그 중에는 displayList를 미리 재배치해 라이브 프리뷰를 보여준다.
  const displayList =
    draggingIdx !== null && overIdx !== null && draggingIdx !== overIdx
      ? (() => {
          const next = [...visibleList];
          const [item] = next.splice(draggingIdx, 1);
          next.splice(overIdx, 0, item);
          return next;
        })()
      : visibleList;

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, idx: number) => {
    e.preventDefault();
    try {
      (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
    } catch {
      // 활성 포인터가 없으면(예: 합성 이벤트) 캡처를 건너뛴다.
    }
    setDraggingIdx(idx);
    setOverIdx(idx);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingIdx === null) return;
    e.preventDefault();
    const y = e.clientY;
    const found = rowRefs.current.findIndex((ref) => {
      if (!ref) return false;
      const r = ref.getBoundingClientRect();
      return y >= r.top && y < r.bottom;
    });
    if (found >= 0) setOverIdx(found);
  };

  const handlePointerUp = () => {
    if (draggingIdx !== null && overIdx !== null && draggingIdx !== overIdx) {
      const next = [...visibleList];
      const [item] = next.splice(draggingIdx, 1);
      next.splice(overIdx, 0, item);
      onReorder([...next, ...hiddenList]);
    }
    setDraggingIdx(null);
    setOverIdx(null);
  };

  const hasSelection = selected.size > 0;
  const allSelectedAreHidden = hasSelection && [...selected].every((c) => hiddenSet.has(c));

  const toggleRow = (cat: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const requestDelete = (list: string[]) => {
    if (list.length === 0) return;
    const needsConfirm = list.some((cat) => categoryHasTodos(cat));
    if (needsConfirm) {
      setPendingDeleteList(list);
    } else {
      onDelete(list);
      setSelected(new Set());
    }
  };

  // 한국어 목적격 조사 (받침 있으면 을, 없으면 를)
  const objParticle = (s: string) => {
    const code = s.charCodeAt(s.length - 1);
    if (code < 0xac00 || code > 0xd7a3) return "을"; // 비한글(숫자 등)은 을
    return (code - 0xac00) % 28 !== 0 ? "을" : "를";
  };

  // 숨기기/숨김 해제 결과 토스트 문구 (Figma 7296-114843)
  const buildToast = (list: string[], variant: SheetVariant, mode: HideMode) => {
    const label = list.length === 1 ? displayName(list[0]) : `${list.length}개 카테고리`;
    const subject = `“${label}”${objParticle(label)}`;
    if (variant === "hide") {
      return mode === "today"
        ? `${subject} 오늘부터 숨겼어요`
        : `${subject} 과거 기록까지 모두 숨겼어요`;
    }
    return mode === "today"
      ? `${subject} 오늘부터 다시 표시 했어요`
      : `${subject} 과거 기록부터 다시 표시 했어요`;
  };

  // ── 카테고리 행 ───────────────────────────────────────────────────────────
  // dragIdx 가 주어지면(표시중 행) 드래그 핸들 + 정렬 프리뷰가 활성화된다.
  const renderRow = (cat: string, isHidden: boolean, dragIdx?: number) => {
    const checked = selected.has(cat);
    const draggable = dragIdx !== undefined;
    const originalIdx = draggable ? visibleList.indexOf(cat) : -1;
    const isDragging = draggable && draggingIdx === originalIdx;
    const isDropTarget =
      draggable && draggingIdx !== null && overIdx === dragIdx && draggingIdx !== dragIdx;
    return (
      <div
        key={cat}
        ref={draggable ? (el) => { rowRefs.current[dragIdx] = el; } : undefined}
        className={`bg-[var(--color-bg-muted)] rounded-[8px] h-[40px] flex items-center gap-[8px] px-[12px] w-full shrink-0 transition-opacity duration-100 ${
          isDragging ? "opacity-40" : "opacity-100"
        }`}
        style={isDropTarget ? { borderTop: "2px solid var(--color-border-brand)", marginTop: "-2px" } : undefined}
        data-name="settings-row"
        data-hidden={isHidden}
      >
        {/* 체크박스 (다중 선택) */}
        <button
          type="button"
          onClick={() => toggleRow(cat)}
          aria-label={checked ? "선택 해제" : "선택"}
          className="size-[24px] flex items-center justify-center shrink-0"
        >
          <div
            className={`size-[18px] rounded-[4px] flex items-center justify-center transition-colors ${
              checked
                ? "bg-[var(--color-bg-brand)] border border-[var(--color-border-brand)]"
                : "border-[1.44px] border-[var(--color-border-subtle)]"
            }`}
          >
            {checked && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1.5 5.2L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </button>

        {/* 이름 — 탭하면 이름 변경(수정) */}
        <button
          type="button"
          onClick={() => setRenamingCat(cat)}
          className="flex-1 min-w-0 text-left font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[var(--color-fg-text-weak)] overflow-hidden whitespace-nowrap text-ellipsis active:opacity-70 transition-opacity"
          aria-label={`${displayName(cat)} 이름 수정`}
          data-name="settings-row-name"
        >
          {displayName(cat)}
        </button>

        {/* 드래그 핸들 (표시중 행만) — 순서 변경 */}
        {draggable && (
          <button
            type="button"
            aria-label="순서 변경"
            onPointerDown={(e) => handlePointerDown(e, dragIdx)}
            className={`size-[24px] flex items-center justify-center shrink-0 touch-none select-none ${
              draggingIdx === dragIdx ? "cursor-grabbing" : "cursor-grab active:opacity-70"
            }`}
            data-name="drag-handle"
          >
            {/* Figma 7238-113411 — 드래그 핸들 (가로 막대 2개, "=") */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="2" y="6" width="12" height="2" rx="1" fill="var(--color-fg-text-disable)" />
              <rect x="2" y="9.5" width="12" height="2" rx="1" fill="var(--color-fg-text-disable)" />
            </svg>
          </button>
        )}

      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-[var(--color-bg-weak)] flex flex-col items-stretch"
      data-name="settings-screen"
    >
      {/* Status Bar */}
      <div className="h-[42px] relative w-full shrink-0">
        <div className="absolute h-[22px] left-[29.5px] top-[10px]">
          <p
            className="font-['SF_Pro:Medium',sans-serif] font-[510] text-[var(--color-fg-text-weak)] text-[15px] tracking-[-0.165px] whitespace-nowrap"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            9:41
          </p>
        </div>
      </div>

      {/* Top nav: back + title "편집" */}
      <div className="h-[56px] relative w-full shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로"
          className="absolute left-[8px] top-1/2 -translate-y-1/2 size-[36px] flex items-center justify-center rounded-[8px] active:bg-[#333] transition-colors"
          data-name="settings-back"
        >
          <div className="size-[24px] relative">
            <div
              className="absolute flex inset-[22.64%_35.14%_22.64%_32.79%] items-center justify-center"
              style={{ containerType: "size" }}
            >
              <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.1314 7.69706">
                  <path clipRule="evenodd" d={PATH_BACK} fill="#F9F9FA" fillRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </button>
        <p className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-['Pretendard:Medium',sans-serif] text-[var(--color-fg-text-weak)] text-[16px] leading-[24px]">
          편집
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-[32px] overflow-y-auto p-[16px]">
        {/* Title */}
        <p className="shrink-0 font-['Pretendard:SemiBold',sans-serif] text-white text-[20px] leading-[28px]">
          카테고리를 관리할 수 있어요
        </p>

        {categories.length === 0 ? (
          <p className="font-['Pretendard:Medium',sans-serif] text-[var(--color-fg-text-subtle)] text-[16px] leading-[24px]">
            아직 추가된 카테고리가 없어요. 추가 하기로 만들어 보세요.
          </p>
        ) : (
          <div className="flex flex-col gap-[24px]" data-name="category-sections">
            {/* 표시중 */}
            {visibleList.length > 0 && (
              <div className="flex flex-col gap-[4px]" data-name="visible-section">
                <p className="font-['Pretendard:Medium',sans-serif] text-[var(--color-fg-text-subtle)] text-[14px] leading-[21px]">
                  표시중
                </p>
                <div
                  className="flex flex-col gap-[8px]"
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                >
                  {displayList.map((cat, displayIdx) => renderRow(cat, false, displayIdx))}
                </div>
              </div>
            )}

            {/* 숨김 */}
            {hiddenList.length > 0 && (
              <div className="flex flex-col gap-[4px]" data-name="hidden-section">
                <p className="font-['Pretendard:Medium',sans-serif] text-[var(--color-fg-text-subtle)] text-[14px] leading-[21px]">
                  숨김
                </p>
                <div className="flex flex-col gap-[8px]">
                  {hiddenList.map((cat) => renderRow(cat, true))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단: 선택 시 액션 바 / 미선택 시 "추가 하기" FAB */}
      {hasSelection ? (
        <div className="shrink-0 px-[16px] pb-[12px] flex items-stretch gap-[8px]">
          <button
            type="button"
            onClick={() => {
              // 숨기기·숨김 해제 모두 범위 선택 바텀시트를 먼저 띄운다.
              setSheet({
                list: Array.from(selected),
                variant: allSelectedAreHidden ? "unhide" : "hide",
              });
            }}
            className="flex-1 h-[56px] rounded-[12px] bg-[var(--color-fg-text-disable)] text-white text-[16px] leading-[24px] font-['Pretendard:Medium',sans-serif] active:bg-[#404040] transition-colors"
          >
            {allSelectedAreHidden ? "숨김 해제" : "숨기기"}
          </button>
          <button
            type="button"
            onClick={() => requestDelete(Array.from(selected))}
            className="flex-1 h-[56px] rounded-[12px] bg-[var(--color-bg-error)] text-white text-[16px] leading-[24px] font-['Pretendard:Medium',sans-serif] active:bg-[var(--color-bg-error-pressed)] transition-colors"
          >
            삭제
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          className="absolute right-[16px] bottom-[50px] h-[40px] flex items-center gap-[4px] pl-[12px] pr-[16px] rounded-full bg-[var(--color-bg-brand)] active:bg-[var(--color-bg-brand-pressed)] transition-colors"
          style={{ boxShadow: "0px 4px 6px rgba(109,114,120,0.16)" }}
          data-name="settings-fab-add"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3.5V12.5M3.5 8H12.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-['Pretendard:Medium',sans-serif] text-white text-[14px] leading-[21px] whitespace-nowrap">
            추가 하기
          </span>
        </button>
      )}

      {/* Safe area */}
      <div className="h-[34px] shrink-0" />

      {/* 할일 있는 카테고리 삭제 전 확인 팝업 */}
      {pendingDeleteList !== null && (
        <ConfirmPopup
          title="이 카테고리를 삭제할까요?"
          description={"선택한 카테고리를 삭제하면\n할 일이 삭제돼요"}
          cancelLabel="취소"
          confirmLabel="네"
          onCancel={() => setPendingDeleteList(null)}
          onConfirm={() => {
            onDelete(pendingDeleteList);
            setSelected(new Set());
            setPendingDeleteList(null);
          }}
        />
      )}

      {/* Category rename bottom sheet */}
      {renamingCat !== null && (
        <CategoryRenameSheet
          initialName={displayName(renamingCat)}
          onSave={(newName) => {
            onRename(renamingCat, newName);
            setRenamingCat(null);
          }}
          onClose={() => setRenamingCat(null)}
        />
      )}

      {/* 카테고리 숨기기 / 숨김 해제 옵션 바텀시트 (오늘부터 / 전체) */}
      {sheet !== null && sheet.list.length > 0 && (
        <CategoryHideSheet
          label={sheet.list.length === 1 ? displayName(sheet.list[0]) : `${sheet.list.length}개 카테고리`}
          variant={sheet.variant}
          onConfirm={(mode) => {
            if (sheet.variant === "hide") onHide(sheet.list, mode);
            else onUnhide(sheet.list, mode);
            setToast(buildToast(sheet.list, sheet.variant, mode));
            setSelected(new Set());
            setSheet(null);
          }}
          onClose={() => setSheet(null)}
        />
      )}

      {/* 결과 토스트 (Figma 7296-114843) — 다크 배경, 자동 사라짐 */}
      {toast && (
        <div
          className="fixed bottom-[96px] left-1/2 -translate-x-1/2 z-[95] max-w-[calc(100%-32px)] pointer-events-none"
          data-name="settings-toast"
        >
          <div
            className="bg-[var(--color-bg-neutral-solid-pressed)] rounded-[16px] px-[20px] py-[16px]"
            style={{ opacity: 0.92, boxShadow: "0px 8px 24px rgba(0,0,0,0.45)" }}
          >
            <p className="font-['Pretendard:Regular',sans-serif] text-[16px] leading-[24px] text-white text-center [word-break:keep-all]">
              {toast}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
