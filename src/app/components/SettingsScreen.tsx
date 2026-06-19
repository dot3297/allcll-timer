/**
 * SettingsScreen — 카테고리 편집(관리) 화면
 *
 * ## 개요
 * 할일 화면 헤더의 톱니(설정) → "카테고리 편집"으로 진입하는 카테고리 관리 전체 화면.
 * Figma 7577-119676 기준.
 *
 * ## 주요 기능
 * - "표시중" / "숨김" 두 섹션 (숨김은 비어 있어도 항상 표시 + 안내 문구)
 * - 행: 이름 + 우측 ≡ 드래그 핸들. 행을 끌어서:
 *   · 같은 섹션 안 → 순서 변경
 *   · 표시중 → 숨김으로 드롭 → 숨기기 / 숨김 → 표시중으로 드롭 → 숨김 해제
 * - "추가 하기" FAB → 새 카테고리 추가(CategoryAddPopup)
 *
 * ※ 기존 ⋯(수정/삭제) 메뉴·액션 바·숨기기 선택 모드는 제거됨.
 *   이름 수정/삭제 진입 루트는 추후 지정. (onRename/onDelete/categoryHasTodos prop은 시그니처에만 유지)
 */
import { useRef, useState } from "react";
import CategoryRenameSheet from "./CategoryRenameSheet";
import ConfirmPopup from "./ConfirmPopup";
import type { HideMode } from "./CategoryHideSheet";
import dragHandleIcon from "../../imports/할일/icon-drag-handle.svg";

// Back-arrow path (matches the one used in TodoScreen.tsx Header)
const PATH_BACK = "M0 1.13137L1.13137 0L6.56569 5.43431L12 0L13.1314 1.13137L6.56569 7.69706L0 1.13137Z";

type Props = {
  /** Current user-added categories (visible + hidden). 값은 카테고리 키. */
  categories: string[];
  /** 카테고리 키 → 표시 이름. */
  displayName: (key: string) => string;
  /** Categories currently hidden from the main UI. */
  hiddenCategories: string[];
  /** 숨기기. */
  onHide: (list: string[], mode: HideMode) => void;
  /** 숨김 해제. */
  onUnhide: (list: string[], mode: HideMode) => void;
  /** Permanently delete categories — 진입 루트 추후 지정. 시그니처 호환용. */
  onDelete: (list: string[]) => void;
  /** 카테고리에 할일이 있는지 — 시그니처 호환용. */
  categoryHasTodos: (cat: string) => boolean;
  /** Rename a category — 진입 루트 추후 지정. 시그니처 호환용. */
  onRename: (oldName: string, newName: string) => void;
  /** Reorder: 전체 categories 배열(표시중 먼저, 숨김 뒤). */
  onReorder: (newCategories: string[]) => void;
  /** Open the "add category" popup. */
  onAdd: () => void;
  /** Called on back-arrow. */
  onBack: () => void;
  /** 오프라인 동기화 대기 카테고리 키 목록. */
  pendingCategories?: string[];
};

type Section = "visible" | "hidden";
type DragRow = { id: string; el: HTMLElement; top: number; height: number };

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
  pendingCategories = [],
}: Props) {
  const pendingSet = new Set(pendingCategories);
  // 카테고리 탭 → 이름 수정/삭제 바텀시트 (Figma 7577-117423)
  const [renamingCat, setRenamingCat] = useState<string | null>(null);
  // 할일 있는 카테고리 삭제 전 확인 팝업
  const [pendingDeleteList, setPendingDeleteList] = useState<string[] | null>(null);
  const requestDelete = (list: string[]) => {
    if (list.length === 0) return;
    if (list.some(categoryHasTodos)) setPendingDeleteList(list);
    else onDelete(list);
  };
  const hiddenSet = new Set(hiddenCategories);
  const visibleList = categories.filter((c) => !hiddenSet.has(c));
  const hiddenList = categories.filter((c) => hiddenSet.has(c));

  // 드래그 중 표시할 드롭 힌트 (다른 섹션으로 이동 시 해당 섹션 강조)
  const [dropHint, setDropHint] = useState<Section | null>(null);

  const dragRef = useRef<{
    cat: string;
    fromSection: Section;
    startY: number;
    dragEl: HTMLElement;
    originRows: DragRow[];
    fromIndex: number;
    rowH: number;
    boundary: number; // 숨김 섹션 콘텐츠 top — 이보다 아래면 숨김 영역
    toIndex: number;
    cross: Section | null; // 다른 섹션으로 드롭할 경우 그 섹션
  } | null>(null);

  // 같은 섹션 순서 재배치 → 전체 categories 배열로 onReorder.
  const reorderSection = (section: Section, orderedIds: string[]) => {
    const newVis = section === "visible" ? orderedIds : visibleList;
    const newHid = section === "hidden" ? orderedIds : hiddenList;
    onReorder([...newVis, ...newHid]);
  };

  const moveDrag = (clientY: number) => {
    const ctx = dragRef.current;
    if (!ctx) return;
    ctx.dragEl.style.transform = `translateY(${clientY - ctx.startY}px)`;

    const overHidden = clientY >= ctx.boundary;
    const inOtherSection =
      (ctx.fromSection === "visible" && overHidden) || (ctx.fromSection === "hidden" && !overHidden);

    if (inOtherSection) {
      // 다른 섹션으로 이동 — 원래 섹션 gap-shift 해제, 대상 섹션 강조.
      ctx.cross = ctx.fromSection === "visible" ? "hidden" : "visible";
      ctx.originRows.forEach((r, i) => {
        if (i !== ctx.fromIndex) r.el.style.transform = "";
      });
      setDropHint(ctx.cross);
      return;
    }

    // 같은 섹션 내 순서 변경 — toIndex 계산 + 이웃 행 gap-shift.
    ctx.cross = null;
    setDropHint((h) => (h === null ? h : null));
    const draggedTop = ctx.originRows[ctx.fromIndex].top + (clientY - ctx.startY);
    let toIndex = Math.round((draggedTop - ctx.originRows[0].top) / ctx.rowH);
    toIndex = Math.max(0, Math.min(ctx.originRows.length - 1, toIndex));
    ctx.toIndex = toIndex;
    ctx.originRows.forEach((r, i) => {
      if (i === ctx.fromIndex) return;
      let shift = 0;
      if (ctx.fromIndex < toIndex && i > ctx.fromIndex && i <= toIndex) shift = -ctx.rowH;
      else if (ctx.fromIndex > toIndex && i >= toIndex && i < ctx.fromIndex) shift = ctx.rowH;
      r.el.style.transform = shift ? `translateY(${shift}px)` : "";
    });
  };

  const commitDrag = () => {
    const ctx = dragRef.current;
    if (!ctx) return;
    const clearStyles = () => {
      ctx.dragEl.style.transform = "";
      ctx.dragEl.style.transition = "";
      ctx.dragEl.style.zIndex = "";
      ctx.dragEl.style.boxShadow = "";
      ctx.dragEl.style.touchAction = "";
      ctx.originRows.forEach((r) => (r.el.style.transform = ""));
    };

    if (ctx.cross) {
      clearStyles();
      dragRef.current = null;
      setDropHint(null);
      if (ctx.cross === "hidden") onHide([ctx.cat], "all");
      else onUnhide([ctx.cat], "all");
      return;
    }

    // 같은 섹션 reorder
    const ids = ctx.originRows.map((r) => r.id);
    const [moved] = ids.splice(ctx.fromIndex, 1);
    ids.splice(ctx.toIndex, 0, moved);
    const changed = ctx.fromIndex !== ctx.toIndex;
    clearStyles();
    dragRef.current = null;
    setDropHint(null);
    if (changed) reorderSection(ctx.fromSection, ids);
  };

  // 행 위에서 포인터 누름 — 마우스 8px / 터치 200ms 롱프레스로 드래그 시작.
  // 움직임 없이 떼면(=탭) 이름 수정/삭제 바텀시트를 연다.
  const onRowPointerDown = (e: React.PointerEvent, cat: string, section: Section) => {
    if (e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const pointerId = e.pointerId;
    const pointerType = e.pointerType;
    let longTimer = 0;

    const begin = () => {
      if (dragRef.current) return;
      const originEls = Array.from(
        document.querySelectorAll(`[data-sec="${section}"][data-row-id]`),
      ) as HTMLElement[];
      if (originEls.length === 0) return;
      const originRows: DragRow[] = originEls.map((el) => {
        const r = el.getBoundingClientRect();
        return { id: el.getAttribute("data-row-id")!, el, top: r.top, height: r.height };
      });
      const fromIndex = originRows.findIndex((r) => r.id === cat);
      if (fromIndex < 0) return;
      const rowH = originRows.length > 1 ? Math.abs(originRows[1].top - originRows[0].top) : originRows[0].height + 8;
      const dragEl = originRows[fromIndex].el;
      const hiddenSecEl = document.querySelector('[data-name="hidden-section"]');
      const boundary = hiddenSecEl
        ? hiddenSecEl.getBoundingClientRect().top
        : originRows[originRows.length - 1].top + rowH;

      dragRef.current = { cat, fromSection: section, startY, dragEl, originRows, fromIndex, rowH, boundary, toIndex: fromIndex, cross: null };
      dragEl.style.transition = "none";
      dragEl.style.zIndex = "50";
      dragEl.style.position = "relative";
      dragEl.style.boxShadow = "0px 4px 20px rgba(0,0,0,0.4)";
      dragEl.style.touchAction = "none";
      originRows.forEach((r, i) => {
        if (i !== fromIndex) r.el.style.transition = "transform 0.18s cubic-bezier(0.2,0,0,1)";
      });
      try {
        dragEl.setPointerCapture(pointerId);
      } catch {
        /* 합성 이벤트 등에서 capture 실패 가능 */
      }
    };

    const onMove = (ev: PointerEvent) => {
      if (dragRef.current) {
        ev.preventDefault();
        moveDrag(ev.clientY);
        return;
      }
      const dist = Math.hypot(ev.clientX - startX, ev.clientY - startY);
      if (pointerType === "mouse") {
        if (dist > 8) {
          begin();
          moveDrag(ev.clientY);
        }
      } else if (dist > 10) {
        // 롱프레스 전에 많이 움직임 → 스크롤 의도, 드래그 취소
        cleanup();
      }
    };
    const onUp = () => {
      if (dragRef.current) commitDrag();
      else setRenamingCat(cat); // 탭 → 바텀시트
      cleanup();
    };
    const cleanup = () => {
      window.clearTimeout(longTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    if (pointerType !== "mouse") {
      longTimer = window.setTimeout(() => begin(), 200);
    }
  };

  // ── 카테고리 행 ───────────────────────────────────────────────────────────
  const renderRow = (cat: string, section: Section) => {
    const isHidden = section === "hidden";
    return (
      <div
        key={cat}
        onPointerDown={(e) => onRowPointerDown(e, cat, section)}
        className="bg-[var(--color-bg-muted)] rounded-[8px] h-[45px] flex items-center gap-[12px] px-[12px] w-full shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
        data-name="settings-row"
        data-sec={section}
        data-row-id={cat}
      >
        <span
          className={`flex-1 min-w-0 text-left font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] overflow-hidden whitespace-nowrap text-ellipsis ${
            isHidden ? "text-[var(--color-fg-text-disable)]" : "text-[var(--color-fg-text-weak)]"
          }`}
          data-name="settings-row-name"
        >
          {displayName(cat)}
        </span>
        {pendingSet.has(cat) && (
          <span
            className="shrink-0 px-[8px] py-[2px] flex items-center rounded-[4px] bg-[rgba(255,122,104,0.16)] text-[var(--color-fg-text-error)] text-[12px] leading-[18px] font-['Pretendard:Medium',sans-serif] whitespace-nowrap"
            data-name="pending-badge"
          >
            대기
          </span>
        )}
        <img src={dragHandleIcon} alt="" className="size-[24px] shrink-0 pointer-events-none" data-name="drag-handle" />
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-[var(--color-bg-weak)] flex flex-col items-stretch overflow-hidden"
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

      {/* Top nav: back + title */}
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
        <p className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-['Pretendard:Medium',sans-serif] text-[var(--color-fg-text-weak)] text-[16px] leading-[24px] whitespace-nowrap">
          카테고리 편집
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-[32px] overflow-y-auto p-[16px] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        <p className="shrink-0 font-['Pretendard:SemiBold',sans-serif] text-white text-[20px] leading-[28px]">
          카테고리를 관리할 수 있어요
        </p>

        <div className="flex flex-col gap-[24px]" data-name="category-sections">
          {/* 표시중 */}
          <div className="flex flex-col gap-[4px]" data-name="visible-section">
            <p className="font-['Pretendard:Medium',sans-serif] text-[var(--color-fg-text-subtle)] text-[14px] leading-[21px]">
              표시중
            </p>
            <div
              className={`flex flex-col gap-[8px] rounded-[12px] border border-solid transition-colors ${
                dropHint === "visible" ? "border-[var(--color-bg-brand)]" : "border-transparent"
              }`}
              data-name="visible-zone"
            >
              {visibleList.length > 0 ? (
                visibleList.map((cat) => renderRow(cat, "visible"))
              ) : (
                <div className="h-[140px] flex items-center justify-center font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-[var(--color-fg-text-disable)] text-center">
                  카테고리를 드래그해 표시할 수 있어요
                </div>
              )}
            </div>
          </div>

          {/* 숨김 — 비어 있어도 항상 표시 (드롭 영역) */}
          <div className="flex flex-col gap-[4px]" data-name="hidden-section">
            <p className="font-['Pretendard:Medium',sans-serif] text-[var(--color-fg-text-subtle)] text-[14px] leading-[21px]">
              숨김
            </p>
            <div
              className={`flex flex-col gap-[8px] rounded-[12px] border border-solid transition-colors ${
                dropHint === "hidden" ? "border-[var(--color-bg-brand)]" : "border-transparent"
              }`}
              data-name="hidden-zone"
            >
              {hiddenList.length > 0 ? (
                hiddenList.map((cat) => renderRow(cat, "hidden"))
              ) : (
                <div className="h-[140px] flex items-center justify-center font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-[var(--color-fg-text-disable)] text-center">
                  카테고리를 드래그해 숨길수 있어요
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* "추가 하기" FAB */}
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

      {/* Safe area */}
      <div className="h-[34px] shrink-0" />

      {/* 이름 수정/삭제 바텀시트 — 카테고리 탭 시 (Figma 7577-117423) */}
      {renamingCat !== null && (
        <CategoryRenameSheet
          initialName={displayName(renamingCat)}
          onSave={(newName) => {
            onRename(renamingCat, newName);
            setRenamingCat(null);
          }}
          onDelete={() => {
            const c = renamingCat;
            setRenamingCat(null);
            requestDelete([c]);
          }}
          onClose={() => setRenamingCat(null)}
        />
      )}

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
            setPendingDeleteList(null);
          }}
        />
      )}
    </div>
  );
}
