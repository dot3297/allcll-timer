import { useRef, useState } from "react";
import CategoryRenameSheet from "./CategoryRenameSheet";
import ConfirmPopup from "./ConfirmPopup";

// Back-arrow path (matches the one used in TodoScreen.tsx Header)
const PATH_BACK = "M0 1.13137L1.13137 0L6.56569 5.43431L12 0L13.1314 1.13137L6.56569 7.69706L0 1.13137Z";

type Props = {
  /** Current user-added categories (visible + hidden). */
  categories: string[];
  /** Categories currently hidden from the main UI. Shown here so the user can manage them. */
  hiddenCategories: string[];
  /** Mark the supplied categories as hidden (data preserved). */
  onHide: (list: string[]) => void;
  /** Move the supplied categories back to visible (remove from hidden). */
  onUnhide: (list: string[]) => void;
  /** Permanently delete the supplied categories and their todos. */
  onDelete: (list: string[]) => void;
  /** Returns true if the given category has at least one todo with text. */
  categoryHasTodos: (cat: string) => boolean;
  /** Rename a category: replace oldName with newName everywhere. */
  onRename: (oldName: string, newName: string) => void;
  /** Reorder: called with the new full categories array (visible first, then hidden). */
  onReorder: (newCategories: string[]) => void;
  /** Called on back-arrow or 완료 (no selection). */
  onBack: () => void;
};

export default function SettingsScreen({
  categories,
  hiddenCategories,
  onHide,
  onUnhide,
  onDelete,
  categoryHasTodos,
  onRename,
  onReorder,
  onBack,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [renamingCat, setRenamingCat] = useState<string | null>(null);
  // 할일이 있는 카테고리를 삭제할 때 보여줄 확인 팝업 — 삭제할 카테고리 목록을 보관
  const [pendingDeleteList, setPendingDeleteList] = useState<string[] | null>(null);

  // ── drag state ──────────────────────────────────────────────────────────
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  // Refs for each visible-row div so we can hit-test by clientY.
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Split into the two sections.
  const hiddenSet = new Set(hiddenCategories);
  const visibleList = categories.filter((c) => !hiddenSet.has(c));
  const hiddenList = categories.filter((c) => hiddenSet.has(c));

  // Live preview: while dragging, rearrange visibleList for display only.
  const displayList =
    draggingIdx !== null && overIdx !== null && draggingIdx !== overIdx
      ? (() => {
          const next = [...visibleList];
          const [item] = next.splice(draggingIdx, 1);
          next.splice(overIdx, 0, item);
          return next;
        })()
      : visibleList;

  const allSelected = categories.length > 0 && selected.size === categories.length;
  const hasSelection = selected.size > 0;
  const allSelectedAreHidden = hasSelection && [...selected].every((c) => hiddenSet.has(c));

  const toggleRow = (cat: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(categories));
  };

  // ── pointer drag handlers (attached to each drag handle) ─────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, idx: number) => {
    e.preventDefault();
    // Capture so move/up fire even if pointer leaves the element.
    (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
    setDraggingIdx(idx);
    setOverIdx(idx);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingIdx === null) return;
    e.preventDefault();
    const y = e.clientY;
    // Hit-test each visible row ref.
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

  return (
    <div
      className="fixed inset-0 z-[70] bg-[#262626] flex flex-col items-stretch"
      data-name="settings-screen"
    >
      {/* Status Bar */}
      <div className="h-[42px] relative w-full shrink-0">
        <div className="absolute h-[22px] left-[29.5px] top-[10px]">
          <p
            className="font-['SF_Pro:Medium',sans-serif] font-[510] text-[#f9f9fa] text-[15px] tracking-[-0.165px] whitespace-nowrap"
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
                <svg
                  className="absolute block inset-0 size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 13.1314 7.69706"
                >
                  <path clipRule="evenodd" d={PATH_BACK} fill="#F9F9FA" fillRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </button>
        <p className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-['Pretendard:Medium',sans-serif] text-[#f9f9fa] text-[16px] leading-[24px]">
          편집
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col px-[16px] pt-[16px] pb-[24px]">
        {categories.length === 0 ? (
          <div className="flex flex-col gap-[8px]">
            <p className="font-['Pretendard:SemiBold',sans-serif] text-white text-[20px] leading-[28px]">
              아직 추가된 카테고리가 없어요
            </p>
            <p className="font-['Pretendard:Medium',sans-serif] text-[#95999d] text-[16px] leading-[24px]">
              카테고리를 추가해 보세요
            </p>
          </div>
        ) : (
          <p className="font-['Pretendard:SemiBold',sans-serif] text-[#f9f9fa] text-[20px] leading-[28px]">
            카테고리 편집을 할 수 있어요
          </p>
        )}

        {/* 전체 선택 — only shown when there are visible categories */}
        {visibleList.length > 0 && (
          <>
            <button
              type="button"
              onClick={toggleAll}
              className="mt-[24px] self-start h-[40px] flex items-center gap-[12px] active:opacity-70 transition-opacity"
              data-name="settings-select-all"
            >
              <div className="size-[24px] flex items-center justify-center shrink-0">
                <div
                  className={`size-[18px] rounded-[4px] flex items-center justify-center transition-colors ${
                    allSelected
                      ? "bg-[#9678ff] border border-[#9678ff]"
                      : "border border-[#d8d8d8]"
                  }`}
                >
                  {allSelected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path
                        d="M1.5 5.2L4 7.5L8.5 2.5"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span className="font-['Pretendard:Regular',sans-serif] text-[#f9f9fa] text-[14px] leading-[21px]">
                전체 선택
              </span>
            </button>
            <div className="mt-[8px] h-px w-full bg-[#404040]" aria-hidden="true" />
          </>
        )}

        {/* Category rows */}
        <div
          className="mt-[12px] flex flex-col flex-1 min-h-0 overflow-y-auto"
          // Pointer move/up are on the scroll container so they stay active
          // even when the pointer slides between rows.
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {categories.length > 0 && (
            <>
              {/* ── Visible category rows ── */}
              <div className="flex flex-col gap-[8px]">
                {displayList.map((cat, displayIdx) => {
                  // originalIdx: position in the non-rearranged visibleList (used for drag logic).
                  const originalIdx = visibleList.indexOf(cat);
                  const checked = selected.has(cat);
                  const isDragging = draggingIdx === originalIdx;
                  // Show a drop-indicator line above a row when it's the current overIdx
                  // and not the dragging row itself.
                  const isDropTarget =
                    draggingIdx !== null &&
                    overIdx === displayIdx &&
                    draggingIdx !== displayIdx;

                  return (
                    <div
                      key={cat}
                      ref={(el) => { rowRefs.current[displayIdx] = el; }}
                      className={`h-[40px] flex items-center gap-[12px] transition-opacity duration-100 ${
                        isDragging ? "opacity-40" : "opacity-100"
                      }`}
                      data-name="settings-row"
                      data-hidden="false"
                      style={
                        isDropTarget
                          ? { borderTop: "2px solid #9678ff", marginTop: "-2px" }
                          : undefined
                      }
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleRow(cat)}
                        aria-label={checked ? "선택 해제" : "선택"}
                        className="size-[24px] flex items-center justify-center shrink-0"
                      >
                        <div
                          className={`size-[18px] rounded-[4px] flex items-center justify-center transition-colors ${
                            checked
                              ? "bg-[#9678ff] border border-[#9678ff]"
                              : "border border-[#d8d8d8]"
                          }`}
                        >
                          {checked && (
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 10 10"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M1.5 5.2L4 7.5L8.5 2.5"
                                stroke="white"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </button>

                      {/* Name */}
                      <span className="font-['Pretendard:Medium',sans-serif] text-[#f9f9fa] text-[14px] leading-[21px] flex-1 min-w-0">
                        {cat}
                      </span>

                      {/* Pencil – rename */}
                      <button
                        type="button"
                        aria-label="이름 수정"
                        onClick={() => setRenamingCat(cat)}
                        className="size-[24px] flex items-center justify-center shrink-0 active:opacity-70 transition-opacity"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M11.5 1.5L14.5 4.5L4.5 14.5H1.5V11.5L11.5 1.5Z"
                            stroke="#B6B8B9"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      {/* Drag handle ≡ */}
                      <button
                        type="button"
                        aria-label="순서 변경"
                        onPointerDown={(e) => handlePointerDown(e, displayIdx)}
                        className={`size-[24px] flex items-center justify-center shrink-0 touch-none select-none ${
                          draggingIdx === displayIdx
                            ? "cursor-grabbing"
                            : "cursor-grab active:opacity-70"
                        }`}
                        data-name="drag-handle"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <rect x="2" y="4" width="12" height="1.5" rx="0.75" fill="#6d7278" />
                          <rect x="2" y="7.25" width="12" height="1.5" rx="0.75" fill="#6d7278" />
                          <rect x="2" y="10.5" width="12" height="1.5" rx="0.75" fill="#6d7278" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* ── Hidden section ── */}
              {hiddenList.length > 0 && (
                <>
                  <div className="mt-[16px] h-px w-full bg-[#404040]" aria-hidden="true" />
                  <p
                    className="font-['Pretendard:Regular',sans-serif] text-[#95999d] text-[14px] leading-[21px] mt-[16px] px-[4px]"
                    data-name="hidden-section-header"
                  >
                    숨긴 할일
                  </p>
                  <div className="flex flex-col gap-[8px] mt-[8px]">
                    {hiddenList.map((cat) => {
                      const checked = selected.has(cat);
                      return (
                        <div
                          key={cat}
                          className="h-[40px] flex items-center gap-[12px]"
                          data-name="settings-row"
                          data-hidden="true"
                        >
                          <button
                            type="button"
                            onClick={() => toggleRow(cat)}
                            aria-label={checked ? "선택 해제" : "선택"}
                            className="size-[24px] flex items-center justify-center shrink-0"
                          >
                            <div
                              className={`size-[18px] rounded-[4px] flex items-center justify-center transition-colors ${
                                checked
                                  ? "bg-[#9678ff] border border-[#9678ff]"
                                  : "border border-[#6d7278]"
                              }`}
                            >
                              {checked && (
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 10 10"
                                  fill="none"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M1.5 5.2L4 7.5L8.5 2.5"
                                    stroke="white"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                          </button>
                          <span className="font-['Pretendard:Medium',sans-serif] text-[#95999d] text-[14px] leading-[21px] flex-1 min-w-0">
                            {cat}
                          </span>
                          {/* No pencil/drag for hidden rows */}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Bottom CTA */}
        {categories.length > 0 && hasSelection ? (
          <div className="mt-[16px] flex items-stretch gap-[8px]">
            <button
              type="button"
              onClick={() => {
                allSelectedAreHidden
                  ? onUnhide(Array.from(selected))
                  : onHide(Array.from(selected));
                setSelected(new Set());
              }}
              className="flex-1 h-[56px] rounded-[12px] bg-[#6d7278] text-white text-[16px] leading-[24px] font-['Pretendard:Medium',sans-serif] active:bg-[#404040] transition-colors"
              data-name={allSelectedAreHidden ? "settings-unhide" : "settings-hide"}
            >
              {allSelectedAreHidden ? "숨김 해제" : "감추기"}
            </button>
            <button
              type="button"
              onClick={() => {
                const list = Array.from(selected);
                // 선택된 카테고리 중 할일이 하나라도 있으면 확인 팝업을 먼저 띄운다
                const needsConfirm = list.some((cat) => categoryHasTodos(cat));
                if (needsConfirm) {
                  setPendingDeleteList(list);
                } else {
                  onDelete(list);
                  setSelected(new Set());
                }
              }}
              className="flex-1 h-[56px] rounded-[12px] bg-[#9678ff] text-white text-[16px] leading-[24px] font-['Pretendard:Medium',sans-serif] active:bg-[#654ec1] transition-colors"
              data-name="settings-delete"
            >
              삭제
            </button>
          </div>
        ) : categories.length > 0 ? (
          <button
            type="button"
            onClick={onBack}
            disabled
            className="mt-[16px] h-[56px] rounded-[12px] bg-[#9678ff] text-white text-[16px] leading-[24px] font-['Pretendard:Medium',sans-serif] disabled:bg-[#333] disabled:text-[#6d7278] disabled:cursor-not-allowed"
            data-name="settings-done"
          >
            완료
          </button>
        ) : null}
      </div>

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
          initialName={renamingCat}
          onSave={(newName) => {
            onRename(renamingCat, newName);
            setRenamingCat(null);
          }}
          onClose={() => setRenamingCat(null)}
        />
      )}
    </div>
  );
}
