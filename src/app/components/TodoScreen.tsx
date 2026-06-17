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
 * - 카테고리 추가: CategoryAddPopup 연동
 * - 완료된 할일은 각 카테고리 그룹 하단에 표시 (별도 완료 섹션/전체 삭제 없음)
 *
 * ## 현재 상태 (TODO)
 * - [ ] 서버 API 연동 (현재 로컬 state로만 관리)
 */
import { useState, useEffect, useRef } from "react";
import svgPaths from "../../imports/할일-2/svg-sh8v04ggfj";
import CategoryAddPopup from "./CategoryAddPopup";
import CategoryDuplicatePopup from "./CategoryDuplicatePopup";
import SettingsScreen from "./SettingsScreen";
import TodoEditSheet from "./TodoEditSheet";
import BottomNav from "./BottomNav";
import SharedCalendar from "./SharedCalendar";
import TodoStatsScreen from "./TodoStatsScreen";
import { useOffline, SYNC_ANIM_MS } from "../contexts/OfflineContext";

/** 동기화 대기 배지 — 오프라인 중 추가/변경된 항목에 표시 (Figma 7357:124409)
 *  bg/error-subtle(다크: 에러색 저투명 틴트) + fg-text/error(#ff7a68) */
function PendingBadge() {
  return (
    <span className="shrink-0 px-[8px] py-[2px] flex items-center rounded-[4px] bg-[rgba(255,122,104,0.16)] text-[var(--color-fg-text-error)] text-[12px] leading-[18px] font-['Pretendard:Medium',sans-serif] whitespace-nowrap">
      대기
    </span>
  );
}


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
  onSettings,
}: {
  onBack: () => void;
  onStats: () => void;
  onSettings: (rect: DOMRect) => void;
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

          {/* 설정(톱니) 버튼 → 카테고리 추가/편집 메뉴 */}
          <button
            type="button"
            onClick={(e) => onSettings((e.currentTarget as HTMLElement).getBoundingClientRect())}
            aria-label="카테고리 설정"
            className="size-[24px] relative active:opacity-70 transition-opacity"
            data-name="settings-btn"
          >
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d={svgPaths.p1c54e880} fill="#D8D8D8" />
            </svg>
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
  type TodoItem = { id: string; text: string; done: boolean; category: string; date: string; pending?: boolean; partial?: boolean };
  // 카테고리 숨김 규칙 (날짜 범위)
  type HideRule = { kind: "all" } | { kind: "from"; date: string } | { kind: "until"; date: string };
  // 특정 날짜에 카테고리가 숨겨지는지 판정
  const isCategoryHiddenOn = (rule: HideRule | undefined, dateStr: string): boolean => {
    if (!rule) return false;
    if (rule.kind === "all") return true;
    if (rule.kind === "from") return dateStr >= rule.date;
    return dateStr < rule.date; // until
  };
  // 카테고리 키 → 표시 이름 (동일 이름 신규 생성 카테고리는 키가 이름과 다르다)
  const displayCat = (key: string) => categoryName[key] ?? key;
  // 특정 날짜에 카테고리가 보이는지: 생성일 이후(>=)이고 숨김 규칙에 안 걸려야 표시.
  const isCategoryVisibleOn = (key: string, dateStr: string) => {
    const created = categoryCreated[key];
    if (created && dateStr < created) return false; // 생성 전이면 존재하지 않음
    return !isCategoryHiddenOn(categoryHide[key], dateStr);
  };

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
  // Figma 7221-33867: 기본으로 카테고리 칩 3개가 노출된다. (사용자는 이름 수정/삭제 가능)
  const [activeCategory, setActiveCategory] = useState<string>("전체");
  const [categories, setCategories] = useState<string[]>([
    "카테고리 1",
    "카테고리 2",
    "카테고리 3",
  ]);
  // Categories the user has hidden from the chip row / group view (not deleted —
  // the data is preserved, they just don't appear in the main timeline).
  // 카테고리별 숨김 규칙. 키가 없으면 모든 날짜에서 표시.
  //   { kind: 'all' }          → 모든 날짜에서 숨김
  //   { kind: 'from', date }   → 그 날짜 이후(>=)부터 숨김 (오늘부터 숨기기 → 과거는 표시)
  //   { kind: 'until', date }  → 그 날짜 이전(<)까지 숨김 (오늘부터 숨김 해제 → 과거는 계속 숨김)
  const [categoryHide, setCategoryHide] = useState<Record<string, HideRule>>({});
  // 카테고리 표시 이름 맵. 키가 표시이름과 다른 경우(동일 이름 신규 생성)만 항목을 둔다.
  // 항목이 없으면 키 자체가 표시 이름.
  const [categoryName, setCategoryName] = useState<Record<string, string>>({});
  // 카테고리 생성일(YYYY-MM-DD). 사용자가 생성한 카테고리에만 기록.
  // 생성일 이전 날짜에는 해당 카테고리가 존재하지 않은 것으로 보고 표시하지 않는다.
  // (시드 카테고리는 항목 없음 → 모든 날짜에서 표시)
  const [categoryCreated, setCategoryCreated] = useState<Record<string, string>>({});
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  // "···" 버튼 팝업 메뉴 — id + 버튼의 화면 좌표(left, top) 기억
  const [todoMenu, setTodoMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  // 상태 선택 메뉴(미완료/세모/완료) — 체크박스 탭 시 표시
  const [statusMenu, setStatusMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  // "편집" 버튼 팝업 메뉴 — 버튼 하단 right-aligned 위치 기억
  const [editMenu, setEditMenu] = useState<{ right: number; top: number } | null>(null);
  // Tracks which input is currently focused for inline editing.
  // While an input has focus it stays editable regardless of whether it has text.
  const [inlineFocusId, setInlineFocusId] = useState<string | null>(null);
  // Tracks the most recently created (empty) todo so it stays visible in the 전체
  // view until the user types something or taps away.
  const [newTodoId, setNewTodoId] = useState<string | null>(null);
  // 완료한 할일 숨기기 토글 — true면 각 카테고리 그룹에서 완료 행을 렌더하지 않는다.
  const [hideCompleted, setHideCompleted] = useState(false);
  // 동일 이름 카테고리 추가 시 확인 팝업 — { name: 표시이름, existingKey: 기존 카테고리 키 }
  const [dupCategory, setDupCategory] = useState<{ name: string; existingKey: string } | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  // 오프라인 중 추가/수정된 카테고리(키별) 동기화 대기 표시
  const [categoryPending, setCategoryPending] = useState<Record<string, boolean>>({});

  // ── 오프라인 모드 (UI 전용) ──
  // 오프라인 중 추가/수정/완료한 할일·카테고리는 pending(대기) 표시. 온라인 복귀 시 동기화 연출 후 정리.
  const { isOffline, addPending } = useOffline();
  const prevOfflineRef = useRef(isOffline);
  useEffect(() => {
    if (prevOfflineRef.current && !isOffline) {
      // 온라인 복귀 — 동기화 완료 연출 시간 뒤 대기 배지 제거
      const id = window.setTimeout(() => {
        setTodos((prev) => prev.map((t) => (t.pending ? { ...t, pending: false } : t)));
        setCategoryPending({});
      }, SYNC_ANIM_MS);
      prevOfflineRef.current = isOffline;
      return () => window.clearTimeout(id);
    }
    prevOfflineRef.current = isOffline;
  }, [isOffline]);

  const addCategory = (name: string) => {
    setShowCategoryPopup(false);
    // 표시 이름이 같은 기존 카테고리가 있으면 확인 팝업을 띄운다.
    const existingKey = categories.find((c) => displayCat(c) === name);
    if (existingKey) {
      setDupCategory({ name, existingKey });
      return;
    }
    setCategories((prev) => [...prev, name]);
    if (isOffline) setCategoryPending((p) => ({ ...p, [name]: true }));
    // 생성일 = 오늘. (생성일 이전 날짜에는 표시되지 않음)
    setCategoryCreated((prev) => ({ ...prev, [name]: todayStr }));
    // 빈 투두(텍스트 없는 입력칸)는 모두 정리 — 새 카테고리만 추가하고 할일 인풋은 만들지 않는다.
    setTodos((prev) => prev.filter((t) => t.text.trim()));
  };

  // 중복 팝업 "네" — 기존 카테고리 사용. 숨겨져 있으면 다시 보이게(규칙 제거).
  const useExistingCategory = (existingKey: string) => {
    setCategoryHide((prev) => {
      if (!(existingKey in prev)) return prev;
      const next = { ...prev };
      delete next[existingKey];
      return next;
    });
    if (isOffline) setCategoryPending((p) => ({ ...p, [existingKey]: true }));
    setDupCategory(null);
  };

  // 중복 팝업 "아니요" — 같은 이름의 신규 카테고리 생성.
  // 기존 카테고리: 오늘부터 숨김({from: 오늘}) → 과거 데이터는 그대로 유지.
  // 신규 카테고리: 생성일=오늘 → 생성 전(과거) 날짜에는 표시되지 않음.
  const createDuplicateCategory = (name: string, existingKey: string) => {
    const newKey = `dup-${Date.now()}-${Math.floor(performance.now())}`;
    setCategories((prev) => [...prev, newKey]);
    if (isOffline) setCategoryPending((p) => ({ ...p, [newKey]: true }));
    setCategoryName((prev) => ({ ...prev, [newKey]: name }));
    setCategoryCreated((prev) => ({ ...prev, [newKey]: todayStr }));
    setCategoryHide((prev) => ({
      ...prev,
      [existingKey]: { kind: "from", date: todayStr },
    }));
    setTodos((prev) => prev.filter((t) => t.text.trim()));
    setDupCategory(null);
  };

  // 카테고리 숨기기. mode 'today' → 오늘부터 숨김(과거 표시), 'all' → 전체 숨김.
  const hideCategories = (list: string[], mode: "today" | "all" = "all") => {
    if (list.length === 0) return;
    const rule: HideRule = mode === "today" ? { kind: "from", date: todayStr } : { kind: "all" };
    setCategoryHide((prev) => {
      const next = { ...prev };
      for (const c of list) next[c] = rule;
      return next;
    });
    if (list.includes(activeCategory)) setActiveCategory("전체");
  };

  // 카테고리 숨김 해제. mode 'all' → 규칙 제거(모든 날짜 표시),
  // mode 'today' → 오늘 이후만 표시하고 과거는 계속 숨김({ until: 오늘 }).
  const unhideCategories = (list: string[], mode: "today" | "all" = "all") => {
    if (list.length === 0) return;
    setCategoryHide((prev) => {
      const next = { ...prev };
      for (const c of list) {
        if (mode === "all") delete next[c];
        else next[c] = { kind: "until", date: todayStr };
      }
      return next;
    });
  };

  // Delete categories entirely. Removes them from categories, hide rules, and todos.
  const deleteCategories = (list: string[]) => {
    if (list.length === 0) return;
    const set = new Set(list);
    setCategories((prev) => prev.filter((c) => !set.has(c)));
    setCategoryHide((prev) => {
      const next = { ...prev };
      for (const c of list) delete next[c];
      return next;
    });
    setCategoryName((prev) => {
      const next = { ...prev };
      for (const c of list) delete next[c];
      return next;
    });
    setCategoryCreated((prev) => {
      const next = { ...prev };
      for (const c of list) delete next[c];
      return next;
    });
    setTodos((prev) => prev.filter((t) => !set.has(t.category)));
    if (list.includes(activeCategory)) setActiveCategory("전체");
  };

  // Rename a category. 'oldKey' 는 카테고리 키.
  const renameCategory = (oldKey: string, newName: string) => {
    if (!newName.trim()) return;
    // 동일 이름 신규로 만들어진 카테고리(키 != 표시이름)는 표시 이름 맵만 갱신한다.
    if (oldKey in categoryName) {
      if (categoryName[oldKey] === newName) return;
      setCategoryName((prev) => ({ ...prev, [oldKey]: newName }));
      if (isOffline) setCategoryPending((p) => ({ ...p, [oldKey]: true }));
      return;
    }
    // 일반 카테고리: 키 자체(=표시 이름)를 변경.
    if (oldKey === newName) return;
    setCategories((prev) => prev.map((c) => (c === oldKey ? newName : c)));
    // 키가 바뀌므로 대기 표시도 새 키로 이동
    if (isOffline) setCategoryPending((p) => { const n = { ...p }; delete n[oldKey]; n[newName] = true; return n; });
    setCategoryHide((prev) => {
      if (!(oldKey in prev)) return prev;
      const next = { ...prev };
      next[newName] = next[oldKey];
      delete next[oldKey];
      return next;
    });
    setCategoryCreated((prev) => {
      if (!(oldKey in prev)) return prev;
      const next = { ...prev };
      next[newName] = next[oldKey];
      delete next[oldKey];
      return next;
    });
    setTodos((prev) => prev.map((t) => t.category === oldKey ? { ...t, category: newName } : t));
    if (activeCategory === oldKey) setActiveCategory(newName);
  };

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

  // 현재 보고 있는 날짜 기준으로 그룹에 노출할 카테고리 (생성일 + 숨김 규칙 적용).
  const viewedDateStr = selectedDateStr ?? todayStr;
  const visibleCategories = categories.filter((c) => isCategoryVisibleOn(c, viewedDateStr));
  // 편집 화면의 "표시중 / 숨김" 분류 기준 — 오늘 시점에 숨겨져 있으면 숨김으로 본다.
  const hiddenTodayCategories = categories.filter((c) =>
    isCategoryHiddenOn(categoryHide[c], todayStr),
  );

  const updateTodo = (id: string, patch: Partial<TodoItem>) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  // 상태 직접 설정 — 체크박스 탭 시 뜨는 메뉴에서 미완료/세모/완료를 선택. 오프라인 중이면 대기 표시.
  const setTodoStatus = (todo: TodoItem, status: "none" | "partial" | "done") => {
    const patch: Partial<TodoItem> = { partial: status === "partial", done: status === "done" };
    if (isOffline) {
      if (!todo.pending) addPending(1);
      patch.pending = true;
    }
    updateTodo(todo.id, patch);
    setStatusMenu(null);
  };

  const removeTodo = (id: string) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  const addTodo = (category: string = activeCategory) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    // 날짜가 선택된 경우 해당 날짜로 투두 생성 (과거/미래 모두 허용)
    const todoDate = selectedDateStr ?? todayStr;
    pendingFocusId.current = id;
    setNewTodoId(id);
    // 오프라인 중 추가한 항목은 동기화 대기(pending)로 생성
    setTodos((prev) => [{ id, text: "", done: false, category, date: todoDate, pending: isOffline }, ...prev]);
    if (isOffline) addPending(1);
  };

  // 미루기: 해당 투두의 날짜를 오늘로 변경 + 날짜 필터 해제
  const postponeTodo = (id: string) => {
    updateTodo(id, { date: todayStr });
    setSelectedDate(null);
    setTodoMenu(null);
  };

  // 진입 시 자동 입력칸을 띄우지 않는다. 사용자가 카테고리 칩의 "+"를 눌러야
  // 해당 그룹 아래에 "할일을 추가해 보세요" 입력칸이 나타난다. (Figma: 기본은 칩만 표시)

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
        onClick={(e) => {
          if (!todo.text.trim()) return;
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          setStatusMenu({ id: todo.id, x: rect.left, y: rect.bottom });
        }}
        disabled={!todo.text.trim()}
        aria-label="상태 선택"
        aria-disabled={!todo.text.trim()}
        className="size-[24px] flex items-center justify-center shrink-0"
      >
        {todo.partial ? (
          // 세모(중간 완료) — 브랜드 보더 박스 + 브랜드 삼각형
          <div className="size-[18px] rounded-[4px] border border-[var(--color-bg-brand)] flex items-center justify-center">
            <svg width="10" height="9" viewBox="0 0 10 9" fill="none" aria-hidden="true">
              <path d="M5 0.8L9.33 8.2H0.67L5 0.8Z" fill="var(--color-bg-brand)" />
            </svg>
          </div>
        ) : (
          <div className="size-[18px] rounded-[4px] border border-[var(--color-fg-text-disable)]" />
        )}
      </button>
      <input
        type="text"
        value={todo.text}
        placeholder="할일을 추가해 보세요"
        data-todo-id={todo.id}
        onFocus={() => setInlineFocusId(todo.id)}
        onBlur={() => setInlineFocusId(null)}
        onChange={(e) => updateTodo(todo.id, isOffline ? { text: e.target.value, pending: true } : { text: e.target.value })}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing || e.keyCode === 229) return;
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
            if (todo.text.trim()) addTodo(todo.category);
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
      {todo.pending && todo.text.trim() && <PendingBadge />}
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

  // 완료된 할일 행 — 각 카테고리 그룹 하단에 렌더. (체크 채움 + 취소선)
  const renderDoneRow = (todo: TodoItem) => (
    <div
      key={todo.id}
      className="shrink-0 bg-[var(--color-bg-muted)] rounded-[8px] h-[40px] flex items-center gap-[8px] px-[12px]"
      data-name="todo-row-done"
    >
      <button
        type="button"
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          setStatusMenu({ id: todo.id, x: rect.left, y: rect.bottom });
        }}
        aria-label="상태 선택"
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
        {todo.text || " "}
      </p>
      {todo.pending && <PendingBadge />}
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
          onSettings={(rect) =>
            setEditMenu({ right: window.innerWidth - rect.right, top: rect.bottom + 4 })
          }
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
        {/* Todo list — Figma 7267:119045: 카테고리별 세로 그룹. 각 그룹 = 회색 "카테고리" 칩 헤더 + 할일들.
            (필터 칩 행/편집 버튼은 제거 — 카테고리 관리는 헤더 톱니로 이동) */}
        <div className="px-[16px] mt-[8px] flex-1 min-h-0 flex flex-col relative">
          {/* 완료 숨기기/보기 — 첫 카테고리 칩과 같은 라인 우측에 고정 (완료 항목이 있을 때만 표시) */}
          {completedTodos.length > 0 && (
              <button
                type="button"
                onClick={() => setHideCompleted((v) => !v)}
                className="absolute top-[5px] right-[16px] z-[20] flex items-center gap-[2px] px-[8px] py-[4px] rounded-[4px] active:opacity-70 transition-opacity"
                data-name="toggle-completed"
                aria-pressed={hideCompleted}
              >
                {/* Figma 7290-114025 — 채워진 눈 아이콘 (보기) / 눈+슬래시 (숨기기) */}
                <svg className="size-[12px] shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <g transform="translate(0.5 2.15)" fill="var(--color-fg-text-subtle)">
                    <path d="M5.5 0C8.15 0 10.2 2.2876 11 4.2876C10.2 6.28754 7.64996 7.7002 5.5 7.7002C3.35004 7.7002 0.800047 6.28754 0 4.2876C0.8 2.2876 2.85 0 5.5 0ZM5.5 0.799805C4.4154 0.799805 3.41976 1.2671 2.58154 1.99707C1.83588 2.64645 1.2476 3.47755 0.875488 4.27783C1.2327 4.96052 1.86368 5.58315 2.65527 6.05762C3.55418 6.59636 4.58852 6.8999 5.5 6.8999C6.41148 6.8999 7.44582 6.59636 8.34473 6.05762C9.13625 5.58319 9.7668 4.96044 10.124 4.27783C9.7519 3.47761 9.16406 2.6464 8.41846 1.99707C7.58024 1.2671 6.5846 0.799805 5.5 0.799805Z" />
                    <path d="M7.2002 3.8501C7.2002 2.94193 6.40817 2.1499 5.5 2.1499C4.59183 2.1499 3.7998 2.94193 3.7998 3.8501C3.7998 4.76871 4.5522 5.55029 5.5 5.55029V6.3501C4.1 6.3501 3 5.2001 3 3.8501C3 2.5001 4.15 1.3501 5.5 1.3501C6.85 1.3501 8 2.5001 8 3.8501C8 5.2001 6.9 6.3501 5.5 6.3501V5.55029C6.4478 5.55029 7.2002 4.76871 7.2002 3.8501Z" />
                  </g>
                  {!hideCompleted && (
                    <>
                      <path d="M2 2L10 10" stroke="var(--color-bg-weak)" strokeWidth="2.6" strokeLinecap="round" />
                      <path d="M2 2L10 10" stroke="var(--color-fg-text-subtle)" strokeWidth="1.2" strokeLinecap="round" />
                    </>
                  )}
                </svg>
                <span className="font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-[var(--color-fg-text-subtle)] whitespace-nowrap">
                  {hideCompleted ? "완료 보기" : "완료 숨기기"}
                </span>
              </button>
          )}
          <div
            className="flex-1 min-h-0 flex flex-col gap-[16px] overflow-y-auto pr-[2px] pb-[8px]"
            data-name="todo-list"
          >
            {/* 카테고리 그룹: 사용자 카테고리(기본 3개) + "전체"(미분류) 그룹은 할일이 있을 때만 표시.
                각 그룹마다 회색 칩 헤더 + 할일. */}
            {(() => {
              const allHasTodos =
                activeTodos.some(
                  (t) => t.category === "전체" && (t.text.trim() || t.id === pinnedNewTodo?.id)
                ) || completedTodos.some((t) => t.category === "전체");
              return allHasTodos ? ["전체", ...visibleCategories] : [...visibleCategories];
            })().map((cat) => {
              const isAll = cat === "전체";
              const pinnedHere =
                pinnedNewTodo && pinnedNewTodo.category === cat ? pinnedNewTodo : null;
              const groupTodos = activeTodos.filter(
                (t) => t.category === cat && t.text.trim() && t.id !== pinnedNewTodo?.id
              );
              // 완료된 할일은 해당 카테고리 그룹 맨 하단에 표시
              const groupDone = completedTodos.filter((t) => t.category === cat);
              return (
                <div
                  key={cat}
                  className="shrink-0 flex flex-col gap-[8px]"
                  data-name="category-group"
                  data-category={cat}
                >
                  {/* 회색 "카테고리" 칩 헤더 (Chips_v2.0) — 탭하면 해당 카테고리에 할일 추가 */}
                  <div className="self-start flex items-center gap-[6px]">
                    <button
                      type="button"
                      onClick={() => addTodo(cat)}
                      className="h-[32px] px-[12px] py-[4px] rounded-[36px] bg-[var(--color-bg-muted)] inline-flex items-center justify-center gap-[2px] active:opacity-80 transition-opacity"
                      aria-label={`${isAll ? "전체" : displayCat(cat)}에 할일 추가`}
                      data-name="category-chip"
                    >
                      <span className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[var(--color-fg-text-inverse)] whitespace-nowrap">
                        {isAll ? "전체" : displayCat(cat)}
                      </span>
                      <svg className="size-[16px] shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M8 3.5V12.5M3.5 8H12.5"
                          stroke="var(--color-fg-text-inverse)"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {!isAll && categoryPending[cat] && <PendingBadge />}
                  </div>
                  {pinnedHere && renderActiveRow(pinnedHere)}
                  {groupTodos.map(renderActiveRow)}
                  {!hideCompleted && groupDone.map(renderDoneRow)}
                </div>
              );
            })}
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

      {/* ── 상태 선택 메뉴 (미완료 / 세모 / 완료) — 체크박스 탭 시 ── */}
      {statusMenu && (() => {
        const todo = todos.find((t) => t.id === statusMenu.id);
        if (!todo) return null;
        const cur = todo.done ? "done" : todo.partial ? "partial" : "none";
        const options = [
          {
            key: "none" as const,
            label: "미완료",
            icon: <div className="size-[18px] rounded-[4px] border border-[var(--color-fg-text-disable)]" />,
          },
          {
            key: "partial" as const,
            label: "중간 완료",
            icon: (
              <div className="size-[18px] rounded-[4px] border border-[var(--color-bg-brand)] flex items-center justify-center">
                <svg width="10" height="9" viewBox="0 0 10 9" fill="none" aria-hidden="true">
                  <path d="M5 0.8L9.33 8.2H0.67L5 0.8Z" fill="var(--color-bg-brand)" />
                </svg>
              </div>
            ),
          },
          {
            key: "done" as const,
            label: "완료",
            icon: (
              <div className="size-[18px] rounded-[4px] flex items-center justify-center bg-[var(--color-bg-brand)]">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M1.5 5.2L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ),
          },
        ];
        return (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setStatusMenu(null)} />
            <div
              className="fixed z-[61] bg-[var(--color-bg-muted)] rounded-[12px] p-[6px] flex items-center gap-[4px]"
              style={{ left: statusMenu.x, top: statusMenu.y + 6, boxShadow: "0px 4px 20px rgba(0,0,0,0.4)" }}
            >
              {options.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  aria-label={opt.label}
                  onClick={() => setTodoStatus(todo, opt.key)}
                  className={`size-[32px] rounded-[8px] flex items-center justify-center active:opacity-70 transition-colors ${
                    cur === opt.key ? "bg-[var(--color-bg-neutral-solid-pressed)]" : ""
                  }`}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          </>
        );
      })()}

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

      {/* 동일 이름 카테고리 확인 팝업 */}
      {dupCategory && (
        <CategoryDuplicatePopup
          onUseExisting={() => useExistingCategory(dupCategory.existingKey)}
          onCreateNew={() => createDuplicateCategory(dupCategory.name, dupCategory.existingKey)}
          onClose={() => setDupCategory(null)}
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
          displayName={displayCat}
          hiddenCategories={hiddenTodayCategories}
          onHide={(list, mode) => {
            hideCategories(list, mode);
          }}
          onUnhide={(list, mode) => {
            unhideCategories(list, mode);
          }}
          onDelete={(list) => {
            deleteCategories(list);
          }}
          categoryHasTodos={(cat) => todos.some((t) => t.category === cat && t.text.trim() !== "")}
          onRename={(oldName, newName) => {
            renameCategory(oldName, newName);
          }}
          onReorder={(newOrder) => setCategories(newOrder)}
          onAdd={() => setShowCategoryPopup(true)}
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
              updateTodo(editingTodoId, isOffline ? { text, pending: true } : { text });
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
