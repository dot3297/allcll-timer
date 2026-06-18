/**
 * SettingsScreen — 카테고리 편집(관리) 화면
 *
 * ## 개요
 * 할일 화면 헤더의 톱니(설정) → "카테고리 편집"으로 진입하는 카테고리 관리 전체 화면.
 * Figma 7526-115946 / 선택 상태 7526-117381 기준.
 *
 * ## 주요 기능
 * - "표시중" / "숨김" 두 섹션으로 카테고리 목록 표시 (회색 박스 행)
 *   - 표시중 행: 이름 + 우측 더보기(⋯) 아이콘
 *   - 숨김 행: 이름 흐림(disable), 아이콘 없음
 * - 행(⋯) 탭 → 해당 카테고리 선택 → 하단 액션 바(숨기기·숨김 해제 / 삭제)가 FAB 자리에 표시
 * - "추가 하기" FAB → 새 카테고리 추가(CategoryAddPopup)
 *
 * ※ 이름 수정 진입 루트는 추후 지정 예정 (현재 미연결).
 *   순서 변경(드래그)은 제거됨. (onRename/onReorder prop은 시그니처에만 유지)
 */
import { useRef, useState } from "react";
import ConfirmPopup from "./ConfirmPopup";
import CategoryRenameSheet from "./CategoryRenameSheet";
import type { HideMode } from "./CategoryHideSheet";
import moreIcon from "../../imports/할일/icon-more.svg";
import checkBrandIcon from "../../imports/할일/icon-check-brand.svg";

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
  /** 오프라인 중 추가/수정/숨김되어 동기화 대기 중인 카테고리 키 목록. */
  pendingCategories?: string[];
  /** Rename a category — 진입 루트 추후 지정. 시그니처 호환용. */
  onRename: (oldName: string, newName: string) => void;
  /** Reorder: 현재 디자인에선 미사용(드래그 제거). 시그니처 호환용. */
  onReorder: (newCategories: string[]) => void;
  /** Open the "add category" popup. */
  onAdd: () => void;
  /** Called on back-arrow. */
  onBack: () => void;
};

type Section = "visible" | "hidden";

export default function SettingsScreen({
  categories,
  displayName,
  hiddenCategories,
  onHide,
  onUnhide,
  onDelete,
  categoryHasTodos,
  pendingCategories = [],
  onRename,
  onReorder,
  onAdd,
  onBack,
}: Props) {
  const pendingSet = new Set(pendingCategories);
  // ⋯ 아이콘 탭으로 선택된 카테고리 — 선택 시 하단 액션 바 표시 (Figma 7546-116539)
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  // 이름 영역 탭으로 열리는 이름 수정 시트 대상 (Figma 7546-116838)
  const [renamingCat, setRenamingCat] = useState<string | null>(null);
  // 할일이 있는 카테고리 삭제 전 확인 팝업 — 삭제할 카테고리 목록 보관
  const [pendingDeleteList, setPendingDeleteList] = useState<string[] | null>(null);
  // 숨기기 선택 모드 (Figma 7526-117545) — 표시중 카테고리를 다중 선택해 한 번에 숨김
  const [hideSelecting, setHideSelecting] = useState(false);
  const [hideChecked, setHideChecked] = useState<Set<string>>(new Set());
  // "이전 날 모두 숨기기" 체크 — true면 과거 기록까지 전체 숨김(mode 'all'), false면 오늘부터(mode 'today')
  const [hidePastToo, setHidePastToo] = useState(false);

  const hiddenSet = new Set(hiddenCategories);
  const visibleList = categories.filter((c) => !hiddenSet.has(c));
  const hiddenList = categories.filter((c) => hiddenSet.has(c));
  const selectedIsHidden = selectedCat !== null && hiddenSet.has(selectedCat);

  // 숨기기 선택 모드 진입 — ⋯에서 고른 카테고리를 미리 체크.
  const enterHideSelect = (preChecked: string) => {
    setSelectedCat(null);
    setHideChecked(new Set([preChecked]));
    setHidePastToo(false);
    setHideSelecting(true);
  };
  const exitHideSelect = () => {
    setHideSelecting(false);
    setHideChecked(new Set());
    setHidePastToo(false);
  };
  const toggleHideChecked = (cat: string) =>
    setHideChecked((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  // 삭제 요청 — 할일이 있으면 확인 팝업, 없으면 바로 삭제.
  const requestDelete = (list: string[]) => {
    if (list.length === 0) return;
    if (list.some(categoryHasTodos)) setPendingDeleteList(list);
    else onDelete(list);
  };

  // ── 드래그 정렬 (할일 화면과 동일한 동작) ─────────────────────────────────
  // 행을 길게 눌러(터치 200ms) / 끌어서(마우스 8px) 같은 섹션 내 순서를 바꾼다.
  // 드래그 중인 행은 그림자(Shadow/dark/500)로 떠 있는 느낌을 준다.
  type DragRow = { id: string; el: HTMLElement; top: number; height: number };
  const dragRef = useRef<{
    section: Section;
    startY: number;
    fromIndex: number;
    toIndex: number;
    rows: DragRow[];
    rowH: number;
    dragEl: HTMLElement;
  } | null>(null);
  // 직전 제스처가 드래그였는지 — true면 뒤따르는 onClick(이름 수정)을 무시한다.
  const didDragRef = useRef(false);

  // 같은 섹션 내 카테고리 순서 재배치 → 전체 categories 배열(표시중 먼저, 숨김 뒤)로 onReorder.
  const reorderSection = (section: Section, orderedIds: string[]) => {
    const newVisible = section === "visible" ? orderedIds : visibleList;
    const newHidden = section === "hidden" ? orderedIds : hiddenList;
    onReorder([...newVisible, ...newHidden]);
  };

  // 드래그 중 — 잡은 행을 손가락 위치로 옮기고, 지나친 이웃 행에 빈자리를 만든다.
  const moveDrag = (clientY: number) => {
    const ctx = dragRef.current;
    if (!ctx) return;
    const dY = clientY - ctx.startY;
    ctx.dragEl.style.transform = `translateY(${dY}px)`;
    const draggedTop = ctx.rows[ctx.fromIndex].top + dY;
    let toIndex = Math.round((draggedTop - ctx.rows[0].top) / ctx.rowH);
    toIndex = Math.max(0, Math.min(ctx.rows.length - 1, toIndex));
    ctx.toIndex = toIndex;
    ctx.rows.forEach((r, i) => {
      if (i === ctx.fromIndex) return;
      let shift = 0;
      if (ctx.fromIndex < toIndex && i > ctx.fromIndex && i <= toIndex) shift = -ctx.rowH;
      else if (ctx.fromIndex > toIndex && i >= toIndex && i < ctx.fromIndex) shift = ctx.rowH;
      r.el.style.transform = shift ? `translateY(${shift}px)` : "";
    });
  };

  // 드래그 종료 — 인라인 스타일 정리 후 새 순서를 commit.
  const commitDrag = () => {
    const ctx = dragRef.current;
    if (!ctx) return;
    const ids = ctx.rows.map((r) => r.id);
    const [moved] = ids.splice(ctx.fromIndex, 1);
    ids.splice(ctx.toIndex, 0, moved);
    ctx.rows.forEach((r) => {
      r.el.style.transform = "";
      r.el.style.transition = "";
      r.el.style.zIndex = "";
      r.el.style.boxShadow = "";
      r.el.style.touchAction = "";
    });
    const changed = ctx.fromIndex !== ctx.toIndex;
    dragRef.current = null;
    if (changed) reorderSection(ctx.section, ids);
  };

  // 행 위에서 포인터 누름 — 마우스 8px / 터치 200ms 롱프레스로 드래그 시작.
  // (더보기 ⋯ 버튼에서는 드래그하지 않는다.)
  const onRowPointerDown = (e: React.PointerEvent, cat: string, section: Section) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-name="more-icon"]')) return;
    didDragRef.current = false;

    const startX = e.clientX;
    const startY = e.clientY;
    const pointerId = e.pointerId;
    const pointerType = e.pointerType;
    let longTimer = 0;

    const begin = () => {
      if (dragRef.current) return;
      const rowEls = Array.from(
        document.querySelectorAll(`[data-row-cat="${section}"][data-row-id]`),
      ) as HTMLElement[];
      if (rowEls.length === 0) return;
      const rows: DragRow[] = rowEls.map((el) => {
        const r = el.getBoundingClientRect();
        return { id: el.getAttribute("data-row-id")!, el, top: r.top, height: r.height };
      });
      const fromIndex = rows.findIndex((r) => r.id === cat);
      if (fromIndex < 0) return;
      const rowH = rows.length > 1 ? Math.abs(rows[1].top - rows[0].top) : rows[0].height + 8;
      const dragEl = rows[fromIndex].el;
      dragRef.current = { section, startY, fromIndex, toIndex: fromIndex, rows, rowH, dragEl };
      didDragRef.current = true;
      dragEl.style.transition = "none";
      dragEl.style.zIndex = "50";
      dragEl.style.boxShadow = "0px 4px 20px rgba(0,0,0,0.4)";
      dragEl.style.touchAction = "none";
      rows.forEach((r, i) => {
        if (i !== fromIndex) r.el.style.transition = "transform 0.18s cubic-bezier(0.2,0,0,1)";
      });
      try {
        dragEl.setPointerCapture(pointerId);
      } catch {
        /* capture may fail if pointer already released */
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
        cleanup();
      }
    };
    const onUp = () => {
      const wasDrag = !!dragRef.current;
      if (wasDrag) commitDrag();
      cleanup();
      if (wasDrag) window.setTimeout(() => (didDragRef.current = false), 0);
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
  // 이름 영역 탭 → 이름 수정 시트 / 더보기(⋯) 탭 → 하단 액션 바.
  // 표시중 행만 우측에 더보기(⋯) 아이콘을 노출(숨김 행은 흐림 처리, 아이콘 없음).
  const renderRow = (cat: string, section: Section) => {
    const isHidden = section === "hidden";

    // 숨기기 선택 모드 — 표시중 행은 탭하여 다중 선택(체크). 숨김 행은 표시만.
    if (hideSelecting) {
      const checked = hideChecked.has(cat);
      const selectable = !isHidden;
      return (
        <button
          key={cat}
          type="button"
          disabled={!selectable}
          onClick={selectable ? () => toggleHideChecked(cat) : undefined}
          className={`bg-[var(--color-bg-muted)] rounded-[8px] h-[45px] flex items-center gap-[12px] px-[12px] w-full shrink-0 border border-solid ${
            checked ? "border-[var(--color-bg-brand)]" : "border-transparent"
          } ${selectable ? "active:opacity-70 transition-opacity" : ""}`}
          data-name="settings-row"
          data-hidden={isHidden}
          data-checked={checked}
        >
          <span
            className="flex-1 min-w-0 text-left font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] overflow-hidden whitespace-nowrap text-ellipsis text-[var(--color-fg-text-weak)]"
            data-name="settings-row-name"
          >
            {displayName(cat)}
          </span>
          {checked && <img src={checkBrandIcon} alt="" className="size-[24px] shrink-0" data-name="check-icon" />}
        </button>
      );
    }

    // 일반 모드 — 행 탭 → 이름 수정 시트 / 길게 끌기 → 순서 변경 / 더보기(⋯) → 하단 액션 바.
    const isSelected = selectedCat === cat;
    return (
      <div
        key={cat}
        onPointerDown={(e) => onRowPointerDown(e, cat, section)}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[data-name="more-icon"]')) return;
          // 방금 드래그로 순서를 바꾼 경우 — 이름 수정 시트를 열지 않는다.
          if (didDragRef.current) return;
          setSelectedCat(null);
          setRenamingCat(cat);
        }}
        className="bg-[var(--color-bg-muted)] rounded-[8px] h-[45px] flex items-center gap-[12px] px-[12px] w-full shrink-0 cursor-pointer active:opacity-70 transition-opacity"
        data-name="settings-row"
        data-hidden={isHidden}
        data-selected={isSelected}
        data-row-id={cat}
        data-row-cat={section}
      >
        {/* 이름 */}
        <span
          className={`flex-1 min-w-0 text-left font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] overflow-hidden whitespace-nowrap text-ellipsis ${
            isHidden ? "text-[var(--color-fg-text-disable)]" : "text-[var(--color-fg-text-weak)]"
          }`}
          data-name="settings-row-name"
        >
          {displayName(cat)}
        </span>
        {/* 동기화 대기 배지 — 오프라인 중 추가/수정/숨김 시 (Figma 7357:124409) */}
        {pendingSet.has(cat) && (
          <span
            className="shrink-0 px-[8px] py-[2px] flex items-center rounded-[4px] bg-[rgba(255,122,104,0.16)] text-[var(--color-fg-text-error)] text-[12px] leading-[18px] font-['Pretendard:Medium',sans-serif] whitespace-nowrap"
            data-name="pending-badge"
          >
            대기
          </span>
        )}
        {/* 더보기(⋯) — 탭하면 하단 액션 바(표시중: 숨기기/삭제 · 숨김: 숨김 해제/삭제) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCat((prev) => (prev === cat ? null : cat));
          }}
          aria-label="더보기"
          className="size-[24px] shrink-0 flex items-center justify-center active:opacity-70 transition-opacity"
          data-name="more-icon"
        >
          <img src={moreIcon} alt="" className="size-[24px]" />
        </button>
      </div>
    );
  };

  const renderSection = (section: Section, label: string) => {
    const list = section === "visible" ? visibleList : hiddenList;
    if (list.length === 0) return null;
    return (
      <div className="flex flex-col gap-[4px]" data-name={`${section}-section`}>
        <p className="font-['Pretendard:Medium',sans-serif] text-[var(--color-fg-text-subtle)] text-[14px] leading-[21px]">
          {label}
        </p>
        <div className="flex flex-col gap-[8px]">
          {list.map((cat) => renderRow(cat, section))}
        </div>
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

      {/* Top nav: back + title "카테고리 편집" */}
      <div className="h-[56px] relative w-full shrink-0">
        <button
          type="button"
          onClick={() => (hideSelecting ? exitHideSelect() : onBack())}
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
      <div className="flex-1 min-h-0 flex flex-col gap-[32px] overflow-y-auto p-[16px]">
        {/* Title */}
        <p className="shrink-0 font-['Pretendard:SemiBold',sans-serif] text-white text-[20px] leading-[28px]">
          {hideSelecting ? "숨길 카테고리를 선택해 주세요" : "카테고리를 관리할 수 있어요"}
        </p>

        {categories.length === 0 ? (
          <p className="font-['Pretendard:Medium',sans-serif] text-[var(--color-fg-text-subtle)] text-[16px] leading-[24px]">
            아직 추가된 카테고리가 없어요. 추가 하기로 만들어 보세요.
          </p>
        ) : (
          <div className="flex flex-col gap-[24px]" data-name="category-sections">
            {renderSection("visible", "표시중")}
            {renderSection("hidden", "숨김")}
          </div>
        )}
      </div>

      {/* 하단 영역 — 숨기기 선택 모드 / 카테고리 선택 액션 바 / 기본 FAB */}
      {hideSelecting ? (
        /* 숨기기 선택 모드 바 — 이전 날 모두 숨기기 체크 + 완료 (Figma 7526-117545) */
        <div className="absolute bottom-0 left-0 w-full" data-name="settings-hide-bar">
          <div className="flex flex-col gap-[10px] p-[16px]">
            {/* 이전 날 모두 숨기기 체크박스 */}
            <button
              type="button"
              onClick={() => setHidePastToo((v) => !v)}
              className="flex items-center gap-[4px] active:opacity-70 transition-opacity"
              aria-pressed={hidePastToo}
              data-name="hide-past-toggle"
            >
              <div
                className={`size-[18px] rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
                  hidePastToo
                    ? "bg-[var(--color-bg-brand)] border border-[var(--color-border-brand)]"
                    : "border-[1.44px] border-[var(--color-border-subtle)]"
                }`}
              >
                {hidePastToo && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1.5 5.2L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[var(--color-fg-text-muted)]">
                이전 날 모두 숨기기
              </span>
            </button>
            {/* 완료 — 선택 0개면 비활성(bg #333 / text #6d7278) (Figma 7546-243795) */}
            <button
              type="button"
              disabled={hideChecked.size === 0}
              onClick={() => {
                const list = Array.from(hideChecked);
                if (list.length) onHide(list, hidePastToo ? "all" : "today");
                exitHideSelect();
              }}
              className={`h-[56px] w-full rounded-[8px] transition-colors flex items-center justify-center ${
                hideChecked.size === 0
                  ? "bg-[var(--color-bg-muted)]"
                  : "bg-[var(--color-bg-brand)] active:bg-[var(--color-bg-brand-pressed)]"
              }`}
              data-name="hide-done"
            >
              <span
                className={`font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] ${
                  hideChecked.size === 0 ? "text-[var(--color-fg-text-disable)]" : "text-white"
                }`}
              >
                완료
              </span>
            </button>
          </div>
          {/* 하단 안전영역 */}
          <div className="h-[34px] w-full shrink-0" />
        </div>
      ) : selectedCat !== null ? (
        <div className="absolute bottom-0 left-0 w-full" data-name="settings-action-bar">
          <div className="flex gap-[8px] items-stretch p-[16px]">
            {/* 숨기기 / 숨김 해제 */}
            <button
              type="button"
              onClick={() => {
                const c = selectedCat;
                if (hiddenSet.has(c)) {
                  setSelectedCat(null);
                  onUnhide([c], "all");
                } else {
                  // 숨기기 → 숨기기 선택 모드로 진입 (해당 카테고리 미리 체크)
                  enterHideSelect(c);
                }
              }}
              className="flex-1 h-[56px] rounded-[8px] bg-[var(--color-bg-muted)] active:opacity-80 transition-opacity flex items-center justify-center"
            >
              <span className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-white">
                {selectedIsHidden ? "숨김 해제" : "숨기기"}
              </span>
            </button>
            {/* 삭제 */}
            <button
              type="button"
              onClick={() => {
                const c = selectedCat;
                setSelectedCat(null);
                requestDelete([c]);
              }}
              className="flex-1 h-[56px] rounded-[8px] bg-[var(--color-bg-error)] active:bg-[var(--color-bg-error-pressed)] transition-colors flex items-center justify-center"
            >
              <span className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-white">삭제</span>
            </button>
          </div>
          {/* 하단 안전영역 */}
          <div className="h-[34px] w-full shrink-0" />
        </div>
      ) : (
        <>
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
          {/* Safe area (FAB 상태에서만 — 액션 바는 자체 안전영역 포함) */}
          <div className="h-[34px] shrink-0" />
        </>
      )}

      {/* 이름 수정 바텀시트 — 이름 영역 탭 시 (Figma 7546-116838) */}
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
