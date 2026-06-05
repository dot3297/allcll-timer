/**
 * TodoScreen — 할일 화면
 *
 * ## 개요
 * 앱의 할일 관리 메인 화면 컴포넌트.
 * 카테고리별 할일 CRUD와 캘린더를 통한 날짜별 진행률 시각화를 제공한다.
 *
 * ## 주요 기능
 * - 카테고리 칩 필터: 카테고리별 할일 필터링
 * - 할일 CRUD: 추가·수정(TodoEditSheet)·삭제·완료 토글
 * - 전체 뷰: 카테고리별 그룹으로 할일 목록 표시
 * - SharedCalendar 연동: 완료 할일 비율로 아크 채움 비율(progressData) 계산하여 전달
 * - 설정 아이콘: SettingsScreen으로 이동
 * - 카테고리 추가: CategoryAddPopup, 전체 삭제: ConfirmPopup 연동
 *
 * ## 현재 상태 (TODO)
 * - [ ] 서버 API 연동 (현재 로컬 state로만 관리)
 */
import { useState, useEffect, useRef } from "react";
import svgPaths from "../../imports/할일-2/svg-sh8v04ggfj";
import CategoryAddPopup from "./CategoryAddPopup";
import ConfirmPopup from "./ConfirmPopup";
import SettingsScreen from "./SettingsScreen";
import TodoEditSheet from "./TodoEditSheet";
import BottomNav from "./BottomNav";
import SharedCalendar from "./SharedCalendar";
import TodoStatsScreen from "./TodoStatsScreen";


// ============================================================
// Status bar
// ============================================================
function StatusBar() {
  return (
    <div className="h-[42px] relative w-full">
      <div className="absolute h-[11.5px] right-[14.5px] top-[19.16px] w-[67px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 67 11.5">
          <g>
            <path d={svgPaths.p1fa84700} fill="#F9F9FA" opacity="0.36" />
            <rect fill="#F9F9FA" height="7.66667" rx="1.6" width="18" x="44.5" y="1.91667" />
            <path clipRule="evenodd" d={svgPaths.p1f1ce200} fill="#F9F9FA" fillRule="evenodd" />
            <path d={svgPaths.p95dd880} fill="#F9F9FA" />
          </g>
        </svg>
      </div>
      <div className="absolute h-[22px] left-[29.5px] top-[10px]">
        <p
          className="font-['SF_Pro:Medium',sans-serif] font-[510] text-[var(--color-fg-text-weak)] text-[15px] tracking-[-0.165px] whitespace-nowrap"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          9:41
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Header — title + stats icon only (settings moved to chip row)
// ============================================================
function Header({
  onBack,
  onStats,
}: {
  onBack: () => void;
  onStats: () => void;
}) {
  return (
    <div className="h-[56px] shrink-0 w-full">
      <div className="flex flex-row items-center justify-between size-full pr-[12px] pl-[16px] py-[8px]">
        <p className="font-['Pretendard:SemiBold',sans-serif] text-[var(--color-fg-text-weak)] text-[20px] leading-[28px]">
          할일
        </p>

        <div className="flex gap-[12px] items-center">
          {/* 통계 버튼 → 할일 통계 페이지 */}
          <button
            type="button"
            onClick={onStats}
            aria-label="할일 통계"
            className="size-[24px] relative active:opacity-70 transition-opacity"
            data-name="stats-btn"
          >
            <div className="absolute inset-[17.71%_20.83%]">
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 15.5">
                <path d={svgPaths.p2a59a680} fill="#D8D8D8" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TodoScreen — top-level
// ============================================================
export default function TodoScreen({
  onBack,
  onNavigateToTimer,
  onNavigateToYesterday,
  onNavigateToRanking,
}: {
  onBack: () => void;
  onNavigateToTimer?: () => void;
  onNavigateToYesterday?: () => void;
  onNavigateToRanking?: () => void;
}) {
  // Each todo remembers the category it was created under so we can filter the list
  // by the currently-active chip. "전체" is a virtual filter that shows everything,
  // so todos created while on "전체" carry "전체" as their category.
  type TodoItem = { id: string; text: string; done: boolean; category: string; date: string };

  // Stores the ID of a todo that should be focused after the next render.
  // Using a ref (not state) so it doesn't trigger an extra render cycle.
  const pendingFocusId = useRef<string | null>(null);

  // After every render, if there's a pending focus target, find it in the DOM and focus it.
  // This is more reliable than setTimeout(0) in React 18 concurrent mode where the DOM
  // may not yet be updated when a 0ms timeout fires.
  useEffect(() => {
    if (!pendingFocusId.current) return;
    const el = document.querySelector<HTMLInputElement>(`[data-todo-id="${pendingFocusId.current}"]`);
    if (el) {
      el.focus();
      pendingFocusId.current = null;
    }
  });

  const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(true);
  // 캘린더에서 선택된 날짜 — null이면 전체 표시
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number } | null>(null);
  // Empty default state matching Figma 6324-228262: no user categories yet, "전체" is active.
  const [activeCategory, setActiveCategory] = useState<string>("전체");
  const [categories, setCategories] = useState<string[]>([]);
  // Categories the user has hidden from the chip row / group view (not deleted —
  // the data is preserved, they just don't appear in the main timeline).
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  // "···" 버튼 팝업 메뉴 — id + 버튼의 화면 좌표(left, top) 기억
  const [todoMenu, setTodoMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  // "편집" 버튼 팝업 메뉴 — 버튼 하단 right-aligned 위치 기억
  const [editMenu, setEditMenu] = useState<{ right: number; top: number } | null>(null);
  // Tracks which input is currently focused for inline editing.
  // While an input has focus it stays editable regardless of whether it has text.
  const [inlineFocusId, setInlineFocusId] = useState<string | null>(null);
  // Tracks the most recently created (empty) todo so it stays visible in the 전체
  // view until the user types something or taps away.
  const [newTodoId, setNewTodoId] = useState<string | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);

  const addCategory = (name: string) => {
    setCategories((prev) => (prev.includes(name) ? prev : [...prev, name]));
    // 나가는 카테고리(activeCategory)의 빈 투두만 정리.
    // 다른 카테고리의 빈 투두는 그대로 유지해야 해당 카테고리로 돌아왔을 때 입력칸이 남아있다.
    const outgoing = activeCategory;
    setTodos((prev) => prev.filter((t) => t.text.trim() || t.category !== outgoing));
    setActiveCategory(name);
    setShowCategoryPopup(false);
    // 한국어 IME 조합 버그 방지: 카테고리 입력창에서 마지막 글자(예: "피")의 조합 이벤트가
    // 새 투두 인풋으로 전파되지 않도록 포커스를 짧게 지연시킨다.
    setTimeout(() => addTodo(name), 100);
  };

  // Mark a batch of categories as hidden. If the currently-active chip is in the
  // batch, reset to "전체" so the user isn't stranded on a non-visible chip.
  const hideCategories = (list: string[]) => {
    if (list.length === 0) return;
    setHiddenCategories((prev) => Array.from(new Set([...prev, ...list])));
    if (list.includes(activeCategory)) setActiveCategory("전체");
  };

  // Remove from hidden — categories become visible again in the chip row.
  const unhideCategories = (list: string[]) => {
    if (list.length === 0) return;
    const set = new Set(list);
    setHiddenCategories((prev) => prev.filter((c) => !set.has(c)));
  };

  // Delete categories entirely. Removes them from the categories list AND from
  // hiddenCategories, and drops every todo that belonged to them.
  const deleteCategories = (list: string[]) => {
    if (list.length === 0) return;
    const set = new Set(list);
    setCategories((prev) => prev.filter((c) => !set.has(c)));
    setHiddenCategories((prev) => prev.filter((c) => !set.has(c)));
    setTodos((prev) => prev.filter((t) => !set.has(t.category)));
    if (list.includes(activeCategory)) setActiveCategory("전체");
  };

  // Rename a category: update categories list, hiddenCategories, todos, and
  // activeCategory (if that category is currently selected).
  const renameCategory = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return;
    setCategories((prev) => prev.map((c) => (c === oldName ? newName : c)));
    setHiddenCategories((prev) => prev.map((c) => (c === oldName ? newName : c)));
    setTodos((prev) => prev.map((t) => t.category === oldName ? { ...t, category: newName } : t));
    if (activeCategory === oldName) setActiveCategory(newName);
  };

  // Reorder: replace the full categories array (comes from SettingsScreen drag).
  const reorderCategories = (newOrder: string[]) => {
    setCategories(newOrder);
  };

  // Categories the user can actually see / pick in the main UI.
  const visibleCategories = categories.filter((c) => !hiddenCategories.includes(c));

  // Prepend a new empty todo so the latest item appears at the top, then focus it.
  // Without an arg the todo inherits the active category chip; in the 전체 grouped
  // view we explicitly pass a category so the row lands under the right header.
  // 오늘 날짜 문자열 (YYYY-MM-DD)
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  // 선택된 날짜 문자열 (YYYY-MM-DD) — null이면 전체 표시
  const selectedDateStr = selectedDate
    ? `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`
    : null;

  const updateTodo = (id: string, patch: Partial<TodoItem>) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const removeTodo = (id: string) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  const addTodo = (category: string = activeCategory) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    // 날짜가 선택된 경우 해당 날짜로 투두 생성 (과거/미래 모두 허용)
    const todoDate = selectedDateStr ?? todayStr;
    pendingFocusId.current = id;
    setNewTodoId(id);
    setTodos((prev) => [{ id, text: "", done: false, category, date: todoDate }, ...prev]);
  };

  // 미루기: 해당 투두의 날짜를 오늘로 변경 + 날짜 필터 해제
  const postponeTodo = (id: string) => {
    updateTodo(id, { date: todayStr });
    setSelectedDate(null);
    setTodoMenu(null);
  };

  // Auto-add and focus an empty todo when the screen first mounts so the keyboard
  // pops up immediately on entry.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { addTodo(); }, []);

  // "전체 삭제" on the 완료 section — clears only the completed todos currently visible
  // (category filter + date filter 모두 적용).
  const clearCompleted = () =>
    setTodos((prev) =>
      prev.filter((t) => {
        if (!t.done) return true;
        // 날짜 필터 중이면 해당 날짜가 아닌 완료 투두는 유지
        if (selectedDateStr && t.date !== selectedDateStr) return true;
        if (activeCategory === "전체") return false;
        return t.category !== activeCategory;
      }),
    );

  // The "section label" shown above the todo input.
  // For now it mirrors the active category; matches the figma which shows "전체" when 전체 is active.
  const sectionLabel = activeCategory;

  // Split todos into active (not done) and completed, filtered by the active chip.
  // "전체" is a virtual catch-all — it shows every todo regardless of category.
  // 날짜 필터(selectedDateStr)가 설정된 경우 해당 날짜의 투두만 표시.
  // Order: latest-first (preserved from the prepend in addTodo).
  const visibleTodos = (() => {
    let list = activeCategory === "전체" ? todos : todos.filter((t) => t.category === activeCategory);
    if (selectedDateStr) {
      list = list.filter((t) => t.date === selectedDateStr);
    }
    return list;
  })();
  const activeTodos = visibleTodos.filter((t) => !t.done);
  const completedTodos = visibleTodos.filter((t) => t.done);

  // "전체" 뷰에서 새로 추가된 투두를 항상 최상단에 고정.
  // 포커스 중(타이핑 중)이면 텍스트가 생겨도 언마운트되지 않도록 inlineFocusId도 체크한다.
  const pinnedNewTodo: TodoItem | null =
    activeCategory === "전체"
      ? (activeTodos.find(
          (t) => t.id === newTodoId && (!t.text.trim() || inlineFocusId === t.id)
        ) ?? null)
      : null;

  // 특정 카테고리 뷰에서 상단에 고정할 입력 행.
  // 우선순위: ① 현재 포커스 중인 투두(타이핑 중 input이 unmount되지 않도록) → ② 빈 투두 → ③ null(추가 버튼)
  const pinnedCategoryTodo: TodoItem | null = (() => {
    if (activeCategory === "전체") return null;
    if (inlineFocusId) {
      const focused = activeTodos.find((t) => t.id === inlineFocusId);
      if (focused) return focused;
    }
    return activeTodos.find((t) => !t.text.trim()) ?? null;
  })();

  // In the "전체" view we group active todos by category.
  // pinnedNewTodo 는 이미 상단에 따로 렌더되므로 여기서 제외한다.
  const activeGroups: { category: string; todos: TodoItem[] }[] = (() => {
    if (activeCategory !== "전체") return [];
    const order = ["전체", ...visibleCategories];
    return order
      .map((cat) => ({
        category: cat,
        todos: activeTodos.filter(
          (t) => t.category === cat && t.text.trim() && t.id !== pinnedNewTodo?.id
        ),
      }))
      .filter((g) => g.todos.length > 0);
  })();

  // Reusable row JSX so both flat and grouped renderings share one implementation.
  // Tapping a row whose text is non-empty opens the edit bottom sheet;
  // empty rows still allow direct inline typing (for the freshly-added row).
  const renderActiveRow = (todo: TodoItem) => (
    <div
      key={todo.id}
      className="shrink-0 bg-[var(--color-bg-muted)] rounded-[8px] h-[40px] flex items-center gap-[8px] px-[12px] cursor-text"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus();
      }}
      data-name="todo-row"
    >
      <button
        type="button"
        onClick={() => {
          if (!todo.text.trim()) return;
          updateTodo(todo.id, { done: !todo.done });
        }}
        disabled={!todo.text.trim()}
        aria-label="완료"
        aria-disabled={!todo.text.trim()}
        className="size-[24px] flex items-center justify-center shrink-0"
      >
        <div className="size-[18px] rounded-[4px] border border-[var(--color-fg-text-disable)]" />
      </button>
      <input
        type="text"
        value={todo.text}
        placeholder="할일을 추가해 보세요"
        data-todo-id={todo.id}
        onFocus={() => setInlineFocusId(todo.id)}
        onBlur={() => setInlineFocusId(null)}
        onChange={(e) => updateTodo(todo.id, { text: e.target.value })}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing || e.keyCode === 229) return;
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
            if (todo.text.trim()) addTodo();
          }
          if (e.key === "Escape") e.currentTarget.blur();
          if (e.key === "Backspace" && todo.text === "") {
            e.preventDefault();
            removeTodo(todo.id);
          }
        }}
        className="flex-1 min-w-0 bg-transparent outline-none border-none font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[var(--color-fg-text-weak)] placeholder:text-[var(--color-fg-text-muted)] cursor-text"
        data-name="todo-input"
      />
      {todo.text.trim() && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setTodoMenu({ id: todo.id, x: window.innerWidth - rect.right, y: rect.bottom });
          }}
          className="shrink-0 size-[24px] flex items-center justify-center active:opacity-70 transition-opacity"
          aria-label="더보기"
        >
          <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
            <circle cx="2" cy="2" r="1.5" fill="#D8D8D8" />
            <circle cx="8" cy="2" r="1.5" fill="#D8D8D8" />
            <circle cx="14" cy="2" r="1.5" fill="#D8D8D8" />
          </svg>
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-[var(--color-bg-weak)] h-full w-full relative overflow-clip" data-name="할일">
      {/* Header block: rounded bottom corners, contains status / title / calendar */}
      <div
        className="absolute left-0 top-0 w-full bg-[var(--color-bg-weak)] flex flex-col items-start rounded-bl-[16px] rounded-br-[16px]"
        style={{ filter: "drop-shadow(0px 4px 6px rgba(109,114,120,0.16))" }}
      >
        <StatusBar />
        <Header
          onBack={onBack}
          onStats={() => setShowStats(true)}
        />
        <SharedCalendar
          theme="dark"
          isCollapsed={isCalendarCollapsed}
          onToggle={() => setIsCalendarCollapsed(!isCalendarCollapsed)}
          selectedDay={selectedDate}
          onDaySelect={setSelectedDate}
          progressData={(() => {
            const now = new Date();
            const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
            // 이번 달 텍스트 있는 투두를 날짜별로 그룹화 → 완료율 계산
            const map = new Map<number, { total: number; done: number }>();
            todos
              .filter((t) => t.text.trim() && t.date?.startsWith(ym))
              .forEach((t) => {
                const day = new Date(t.date).getDate();
                const entry = map.get(day) ?? { total: 0, done: 0 };
                entry.total++;
                if (t.done) entry.done++;
                map.set(day, entry);
              });
            return Array.from(map.entries())
              .filter(([, v]) => v.done > 0)
              .map(([day, v]) => ({ day, ratio: v.done / v.total }));
          })()}
        />
      </div>

      {/* Mid section — spans from below the header down to just above the bottom nav.
          Flex column so the todo list flex-grows and scrolls internally on overflow,
          while the chip row + section header stay fixed in size. */}
      <div
        className={`absolute left-0 right-0 bottom-[93px] flex flex-col transition-all duration-300 ${
          isCalendarCollapsed ? "top-[194px]" : "top-[502px]"
        }`}
      >
        {/* Chip row: scrollable chips with sticky "편집" button on right. */}
        <div className="relative h-[48px] w-full shrink-0 overflow-hidden">
          {/* Scrollable category chips */}
          <div
            className="absolute left-[16px] right-[80px] top-0 bottom-0 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
            data-name="chip-scroll"
          >
            <div className="flex gap-[8px] items-center py-[8px] min-w-max h-full">
              {/* "카테고리 전체" chip — always visible */}
              <button
                type="button"
                onClick={() => setActiveCategory("전체")}
                className={`h-[32px] px-[12px] py-[6px] rounded-[36px] shrink-0 inline-flex items-center justify-center transition-colors ${
                  activeCategory === "전체"
                    ? "bg-[var(--color-bg-muted)] border border-[var(--color-fg-text-muted)]"
                    : "border border-[var(--color-fg-text-disable)] bg-transparent"
                }`}
              >
                <span
                  className={`font-['Pretendard:Medium',sans-serif] text-[14px] whitespace-nowrap ${
                    activeCategory === "전체" ? "text-white" : "text-[var(--color-fg-text-muted)]"
                  }`}
                >
                  카테고리 전체
                </span>
              </button>
              {visibleCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`h-[32px] px-[12px] py-[6px] rounded-[36px] shrink-0 inline-flex items-center justify-center transition-colors ${
                    activeCategory === cat
                      ? "bg-[var(--color-bg-muted)] border border-[var(--color-fg-text-muted)]"
                      : "border border-[var(--color-fg-text-disable)] bg-transparent"
                  }`}
                >
                  <span
                    className={`font-['Pretendard:Medium',sans-serif] text-[14px] whitespace-nowrap ${
                      activeCategory === cat ? "text-white" : "text-[var(--color-fg-text-muted)]"
                    }`}
                  >
                    {cat}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* "편집" button fixed to the right — opens SettingsScreen */}
          <div
            className="absolute bg-[var(--color-bg-weak)] flex gap-[0] h-[48px] items-center pl-[8px] pr-[16px] right-0 top-0"
            data-name="fixed"
          >
            <button
              type="button"
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setEditMenu({ right: window.innerWidth - rect.right, top: rect.bottom + 4 });
              }}
              className="flex items-center gap-[4px] active:opacity-70 transition-opacity"
              aria-label="카테고리 편집"
              data-name="Button/text button"
            >
              <span className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[var(--color-fg-text-weak)]">
                편집
              </span>
              <svg className="size-[16px] shrink-0" fill="none" viewBox="0 0 24 24">
                <path d={svgPaths.p1c54e880} fill="var(--color-fg-text-weak)" />
              </svg>
            </button>
          </div>
        </div>

        {/* Section header + todo list — flex-1 so it absorbs remaining space, min-h-0 so the
            inner list's overflow-y-auto actually clips inside the viewport. */}
        <div className="px-[16px] mt-[8px] flex-1 min-h-0 flex flex-col">
          <div className="shrink-0 px-[12px] flex items-center h-[36px]">
            <p className="font-['Pretendard:Medium',sans-serif] text-[var(--color-fg-text-weak)] text-[14px] leading-[21px]">
              {activeCategory === "전체" ? "카테고리 전체" : activeCategory}
            </p>
          </div>

          {/* Todo list — flex-1 fills remaining vertical space, scrolls internally on overflow. */}
          <div
            className="mt-[8px] flex-1 min-h-0 flex flex-col gap-[8px] overflow-y-auto pr-[2px] pb-[8px]"
            data-name="todo-list"
          >
            {/* Active todos. Layout depends on whether "전체" or a specific category is active. */}
            {activeCategory === "전체" ? (
              // "전체" 뷰: 빈 인풋을 최상단에 고정하고, 텍스트 있는 투두는 카테고리 그룹별로 그 아래 나열.
              <>
                {/* 빈 인풋 행 — 항상 최상단 */}
                {pinnedNewTodo && renderActiveRow(pinnedNewTodo)}
                {/* 텍스트가 있는 투두들 (카테고리 순서대로 평탄하게 나열) */}
                {activeGroups.map((g) => (
                  <div
                    key={g.category}
                    className="shrink-0 flex flex-col gap-[8px]"
                    data-name="category-group"
                    data-category={g.category}
                  >
                    {g.todos.map(renderActiveRow)}
                  </div>
                ))}
              </>
            ) : (
              // 특정 카테고리 뷰:
              // ① 빈 입력칸(pinnedCategoryTodo)을 항상 최상단에 고정 — 없으면 "추가" 버튼
              // ② 텍스트 있는 투두들을 그 아래 나열
              <>
                {pinnedCategoryTodo ? (
                  renderActiveRow(pinnedCategoryTodo)
                ) : (
                  <button
                    type="button"
                    onClick={addTodo}
                    className="shrink-0 bg-[var(--color-bg-muted)] rounded-[8px] h-[40px] flex items-center gap-[8px] px-[12px] active:bg-[#404040] transition-colors"
                    data-name="todo-empty"
                  >
                    <div className="size-[24px] flex items-center justify-center shrink-0">
                      <div className="size-[18px] rounded-[4px] border border-[var(--color-fg-text-disable)]" />
                    </div>
                    <p className="font-['Pretendard:Regular',sans-serif] text-[var(--color-fg-text-subtle)] text-[14px] leading-[21px]">
                      할일을 추가해 보세요
                    </p>
                  </button>
                )}
                {activeTodos
                  .filter((t) => t.text.trim() && t.id !== pinnedCategoryTodo?.id)
                  .map(renderActiveRow)}
              </>
            )}

            {completedTodos.length > 0 && (
              <>
                <div
                  className="shrink-0 mt-[16px] flex items-center justify-between px-[4px]"
                  data-name="completed-header"
                >
                  <p className="font-['Pretendard:Medium',sans-serif] text-[var(--color-fg-text-weak)] text-[14px] leading-[21px]">
                    완료
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-[2px] active:opacity-70 transition-opacity"
                    data-name="clear-completed"
                  >
                    <span className="font-['Pretendard:Medium',sans-serif] text-[var(--color-fg-text-weak)] text-[14px] leading-[21px]">
                      전체 삭제
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M3 4h10M5 4V2.5C5 2 5.5 1.5 6 1.5h4c.5 0 1 .5 1 1V4M4 4l.8 9c.05.6.55 1 1.1 1H10c.55 0 1.05-.4 1.1-1L12 4M7 7v5M9 7v5"
                        stroke="#F9F9FA"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                {completedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="shrink-0 bg-[var(--color-bg-muted)] rounded-[8px] h-[40px] flex items-center gap-[8px] px-[12px]"
                    data-name="todo-row-done"
                  >
                    <button
                      type="button"
                      onClick={() => updateTodo(todo.id, { done: !todo.done })}
                      aria-label="완료 취소"
                      className="size-[24px] flex items-center justify-center shrink-0"
                    >
                      <div className="size-[18px] rounded-[4px] flex items-center justify-center bg-[var(--color-bg-brand)]">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                          <path d="M1.5 5.2L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                    <p
                      className="flex-1 min-w-0 font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[var(--color-fg-text-disable)] line-through overflow-hidden whitespace-nowrap text-ellipsis"
                      title={todo.text}
                    >
                      {todo.text || " "}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setTodoMenu({ id: todo.id, x: window.innerWidth - rect.right, y: rect.bottom });
                      }}
                      className="shrink-0 size-[24px] flex items-center justify-center active:opacity-70 transition-opacity"
                      aria-label="더보기"
                    >
                      <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
                        <circle cx="2" cy="2" r="1.5" fill="var(--color-fg-text-disable)" />
                        <circle cx="8" cy="2" r="1.5" fill="var(--color-fg-text-disable)" />
                        <circle cx="14" cy="2" r="1.5" fill="var(--color-fg-text-disable)" />
                      </svg>
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 오늘이 아닌 날짜 선택 시 플로팅 액션 버튼 */}
      {selectedDate && selectedDateStr !== null && selectedDateStr !== todayStr && (() => {
        // 선택한 날짜에 미완료(텍스트 있는) 투두가 있는지 확인
        const hasActiveTodos = activeTodos.some((t) => t.text.trim());
        return (
          <div className="absolute bottom-[103px] left-0 right-0 flex items-center justify-center gap-[8px] z-[30] pointer-events-none">
            {/* 오늘 날짜로 — 날짜 필터 해제 (항상 표시) */}
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="pointer-events-auto flex gap-[4px] h-[40px] items-center pl-[12px] pr-[16px] py-[12px] bg-white border border-[var(--color-border-weak)] rounded-full active:opacity-80 transition-opacity"
              style={{ boxShadow: "0px 4px 6px rgba(0,0,0,0.32)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8C3 5.24 5.24 3 8 3C9.45 3 10.76 3.6 11.72 4.56" stroke="var(--color-bg-muted)" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M10.5 2L12 4.5L9.5 5" stroke="var(--color-bg-muted)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-['Pretendard:Medium',sans-serif] text-[var(--color-bg-muted)] text-[14px] leading-[21px] whitespace-nowrap">
                오늘 날짜로
              </span>
            </button>

            {/* 할일 미루기 — 미완료 투두가 있을 때만 표시 */}
            {hasActiveTodos && (
              <button
                type="button"
                onClick={() => {
                  setTodos((prev) =>
                    prev.map((t) =>
                      t.date === selectedDateStr && !t.done
                        ? { ...t, date: todayStr }
                        : t
                    )
                  );
                  setSelectedDate(null);
                }}
                className="pointer-events-auto flex gap-[4px] h-[40px] items-center pl-[12px] pr-[16px] py-[12px] bg-[var(--color-bg-brand)] rounded-full active:opacity-80 transition-opacity"
                style={{ boxShadow: "0px 4px 6px rgba(0,0,0,0.32)" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="1.5" y="3.5" width="13" height="11" rx="1.5" stroke="white" strokeWidth="1.3"/>
                  <path d="M5 1.5V4.5M11 1.5V4.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M8 7.5V11.5M6 9.5L8 11.5L10 9.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-['Pretendard:Medium',sans-serif] text-white text-[14px] leading-[21px] whitespace-nowrap">
                  할일 미루기
                </span>
              </button>
            )}
          </div>
        );
      })()}

      {/* Bottom navigation */}
      <div className="absolute bottom-0 left-0 w-full">
        <BottomNav
          activeTab="todo"
          onTimer={onNavigateToTimer ?? onBack}
          onYesterday={onNavigateToYesterday ?? onBack}
        />
      </div>

      {/* "···" 팝업 메뉴 — 수정 / 삭제 */}
      {todoMenu && (
        <>
          {/* 백드롭 — 바깥 탭 시 닫힘 */}
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setTodoMenu(null)}
          />
          {/* 메뉴 카드 — 버튼 바로 하단, left/top 기준 */}
          <div
            className="fixed z-[61] bg-[var(--color-bg-muted)] rounded-[12px] p-[4px] flex flex-col gap-[4px] min-w-[120px]"
            style={{
              right: todoMenu.x,
              top: todoMenu.y + 4,
              boxShadow: "0px 20px 50px -20px rgba(0,0,0,0.7)",
            }}
          >
            {/* 수정 — 완료되지 않은 투두에만 표시 */}
            {!todos.find((t) => t.id === todoMenu.id)?.done && (
              <button
                type="button"
                onClick={() => {
                  setEditingTodoId(todoMenu.id);
                  setTodoMenu(null);
                }}
                className="rounded-[8px] px-[12px] py-[8px] text-left w-full active:opacity-70 transition-opacity"
              >
                <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[1.5] text-white">
                  수정
                </p>
              </button>
            )}
            {/* 미루기 — 오늘 날짜가 아닌 투두에만 표시 */}
            {(() => {
              const todo = todos.find((t) => t.id === todoMenu.id);
              if (!todo || todo.date === todayStr) return null;
              return (
                <button
                  type="button"
                  onClick={() => postponeTodo(todoMenu.id)}
                  className="rounded-[8px] px-[12px] py-[8px] text-left w-full active:opacity-70 transition-opacity"
                >
                  <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[1.5] text-[var(--color-fg-text-brand)]">
                    오늘로 미루기
                  </p>
                </button>
              );
            })()}
            <button
              type="button"
              onClick={() => {
                removeTodo(todoMenu.id);
                setTodoMenu(null);
              }}
              className="rounded-[8px] px-[12px] py-[8px] text-left w-full active:opacity-70 transition-opacity"
            >
              <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[1.5] text-[#ff7a68]">
                삭제
              </p>
            </button>
          </div>
        </>
      )}

      {/* "편집" 버튼 팝업 메뉴 — 새 카테고리 추가 / 편집 */}
      {editMenu && (
        <>
          {/* 백드롭 */}
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setEditMenu(null)}
          />
          {/* 메뉴 카드 */}
          <div
            className="fixed z-[61] bg-[var(--color-bg-muted)] rounded-[12px] p-[4px] flex flex-col gap-[4px] min-w-[160px]"
            style={{
              right: editMenu.right,
              top: editMenu.top,
              boxShadow: "0px 20px 50px -20px rgba(0,0,0,0.7)",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setEditMenu(null);
                setShowCategoryPopup(true);
              }}
              className="rounded-[8px] px-[12px] py-[8px] text-left w-full active:opacity-70 transition-opacity"
            >
              <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[1.5] text-white">
                새 카테고리 추가
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMenu(null);
                setShowSettings(true);
              }}
              className="rounded-[8px] px-[12px] py-[8px] text-left w-full active:opacity-70 transition-opacity"
            >
              <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[1.5] text-white">
                편집
              </p>
            </button>
          </div>
        </>
      )}

      {/* Category add popup */}
      {showCategoryPopup && (
        <CategoryAddPopup onCancel={() => setShowCategoryPopup(false)} onConfirm={addCategory} />
      )}

      {/* Confirm popup for "전체 삭제" on the 완료 section */}
      {showClearConfirm && (
        <ConfirmPopup
          title={"완료한 할 일이 모두 지워져요\n정말 삭제할까요?"}
          onCancel={() => setShowClearConfirm(false)}
          onConfirm={() => {
            clearCompleted();
            setShowClearConfirm(false);
          }}
        />
      )}

      {/* 할일 통계 화면 */}
      {showStats && (
        <div className="absolute inset-0 z-[40] bg-[var(--color-bg-weak)]">
          <TodoStatsScreen onBack={() => setShowStats(false)} />
        </div>
      )}

      {/* Settings screen (category edit) */}
      {showSettings && (
        <SettingsScreen
          categories={categories}
          hiddenCategories={hiddenCategories}
          onHide={(list) => {
            hideCategories(list);
          }}
          onUnhide={(list) => {
            unhideCategories(list);
          }}
          onDelete={(list) => {
            deleteCategories(list);
          }}
          categoryHasTodos={(cat) => todos.some((t) => t.category === cat && t.text.trim() !== "")}
          onRename={(oldName, newName) => {
            renameCategory(oldName, newName);
          }}
          onReorder={(newOrder) => {
            reorderCategories(newOrder);
          }}
          onBack={() => setShowSettings(false)}
        />
      )}

      {/* Bottom sheet to edit an existing todo */}
      {editingTodoId && (() => {
        const todo = todos.find((t) => t.id === editingTodoId);
        if (!todo) return null;
        return (
          <TodoEditSheet
            initialText={todo.text}
            onSave={(text) => {
              updateTodo(editingTodoId, { text });
              setEditingTodoId(null);
            }}
            onDelete={() => {
              removeTodo(editingTodoId);
              setEditingTodoId(null);
            }}
            onClose={() => setEditingTodoId(null)}
          />
        );
      })()}
    </div>
  );
}
