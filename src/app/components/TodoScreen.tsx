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
import checkboxEmpty from "../../imports/할일/checkbox-empty.svg";
import checkboxPartial from "../../imports/할일/checkbox-partial.svg";
import iconCategoryAdd from "../../imports/할일/icon-category-add.svg";
import iconCategoryEdit from "../../imports/할일/icon-category-edit.svg";
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
// 가상 시드 데이터 — 오늘 기준 "어제까지"의 데모 할일.
// 캘린더 진행률 아크와 과거 날짜별 할일 목록을 채우기 위한 용도.
// (이번 달 1일 ~ 어제까지 날짜별 2~4개, 완료/부분완료/미완료 혼합)
// ============================================================
type SeedTodo = { id: string; text: string; done: boolean; category: string; date: string; partial: boolean };
function buildSeedTodos(): SeedTodo[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const today = now.getDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  const cats = ["카테고리 1", "카테고리 2", "카테고리 3"];
  const pool = [
    "수학 문제집 3장 풀기", "영어 단어 50개 암기", "국어 비문학 지문 2개",
    "한국사 인강 1강 듣기", "과학 개념 정리", "모의고사 오답노트 정리",
    "독서 30분 하기", "영어 듣기 1회분", "수학 오답 다시 풀기",
    "영단어 복습", "문법 정리노트 작성", "사회 요약정리",
  ];
  const out: SeedTodo[] = [];
  let seq = 0;
  // 1일 ~ 어제(today-1)까지
  for (let day = 1; day < today; day++) {
    const date = `${year}-${pad(month + 1)}-${pad(day)}`;
    const count = 2 + (day % 3); // 2~4개
    for (let i = 0; i < count; i++) {
      const r = (day * 7 + i * 3) % 10;
      const done = r < 6; // 약 60% 완료
      const partial = !done && r < 8; // 일부는 부분완료
      out.push({
        id: `seed-${date}-${seq++}`,
        text: pool[(day * 2 + i) % pool.length],
        done,
        category: cats[(day + i) % cats.length],
        date,
        partial,
      });
    }
  }
  return out;
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

  // ── 드래그 재정렬 (Figma 7535-232864) ──
  // 같은 카테고리 그룹 안에서 할일 행을 길게 눌러(터치) / 끌어서(마우스) 순서를 바꾼다.
  // 드래그 중인 행은 그림자(Shadow/dark/500)로 떠 있는 느낌을 준다.
  type DragRow = { id: string; el: HTMLElement; top: number; height: number };
  const dragRef = useRef<{
    id: string;
    cat: string;
    startY: number;
    fromIndex: number;
    toIndex: number;
    rows: DragRow[];
    rowH: number;
    dragEl: HTMLElement;
  } | null>(null);
  // 직전 제스처가 드래그였는지 — true면 뒤따르는 onClick(수정 시트 열기)을 무시한다.
  const didDragRef = useRef(false);

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
  const [todos, setTodos] = useState<TodoItem[]>(() => buildSeedTodos());
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

  // 오프라인에서 카테고리를 동기화 대기 표시(+ 새로 대기가 되면 글로벌 대기 카운터 +1).
  // 이미 대기 중인 카테고리는 카운터를 중복 증가시키지 않는다.
  const markCategoryPending = (key: string) => {
    if (!isOffline) return;
    if (!categoryPending[key]) addPending(1);
    setCategoryPending((p) => ({ ...p, [key]: true }));
  };

  const addCategory = (name: string) => {
    setShowCategoryPopup(false);
    // 표시 이름이 같은 기존 카테고리가 있으면 확인 팝업을 띄운다.
    const existingKey = categories.find((c) => displayCat(c) === name);
    if (existingKey) {
      setDupCategory({ name, existingKey });
      return;
    }
    setCategories((prev) => [...prev, name]);
    markCategoryPending(name);
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
    markCategoryPending(existingKey);
    setDupCategory(null);
  };

  // 중복 팝업 "아니요" — 같은 이름의 신규 카테고리 생성.
  // 기존 카테고리: 오늘부터 숨김({from: 오늘}) → 과거 데이터는 그대로 유지.
  // 신규 카테고리: 생성일=오늘 → 생성 전(과거) 날짜에는 표시되지 않음.
  const createDuplicateCategory = (name: string, existingKey: string) => {
    const newKey = `dup-${Date.now()}-${Math.floor(performance.now())}`;
    setCategories((prev) => [...prev, newKey]);
    markCategoryPending(newKey);
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
    if (isOffline) list.forEach(markCategoryPending);
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
    if (isOffline) list.forEach(markCategoryPending);
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
      markCategoryPending(oldKey);
      return;
    }
    // 일반 카테고리: 키 자체(=표시 이름)를 변경.
    if (oldKey === newName) return;
    setCategories((prev) => prev.map((c) => (c === oldKey ? newName : c)));
    // 키가 바뀌므로 대기 표시도 새 키로 이동 (새로 대기가 되면 글로벌 카운터 +1)
    if (isOffline) {
      if (!categoryPending[oldKey]) addPending(1);
      setCategoryPending((p) => { const n = { ...p }; delete n[oldKey]; n[newName] = true; return n; });
    }
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

  // 체크박스 탭 — 미완료 → 부분완료(세모) → 완료 → 미완료 순환
  const cycleTodoStatus = (todo: TodoItem) => {
    const order = ["none", "partial", "done"] as const;
    const cur = todo.done ? "done" : todo.partial ? "partial" : "none";
    const next = order[(order.indexOf(cur) + 1) % order.length];
    setTodoStatus(todo, next);
  };

  const removeTodo = (id: string) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  // 같은 카테고리 내에서 할일 순서 재배치. orderedIds는 그 그룹의 새 순서(상→하).
  // todos 배열에서 해당 카테고리 슬롯만 새 순서로 교체하고 나머지는 그대로 둔다.
  const reorderWithinCategory = (cat: string, orderedIds: string[]) => {
    setTodos((prev) => {
      const idSet = new Set(orderedIds);
      const items = orderedIds
        .map((id) => prev.find((t) => t.id === id))
        .filter(Boolean) as TodoItem[];
      let gi = 0;
      return prev.map((t) => (t.category === cat && idSet.has(t.id) ? items[gi++] : t));
    });
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
    if (changed) reorderWithinCategory(ctx.cat, ids);
  };

  // 행 위에서 포인터 누름 — 마우스는 8px 이동, 터치는 200ms 롱프레스로 드래그 시작.
  // (빈/편집 중 행, 체크박스 버튼에서는 드래그하지 않는다.)
  const onRowPointerDown = (e: React.PointerEvent, todo: TodoItem) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const isInputMode = !todo.text.trim() || inlineFocusId === todo.id;
    if (isInputMode) return;
    didDragRef.current = false;

    const cat = todo.category;
    const startX = e.clientX;
    const startY = e.clientY;
    const pointerId = e.pointerId;
    const pointerType = e.pointerType;
    let longTimer = 0;

    const begin = () => {
      if (dragRef.current) return;
      const rowEls = Array.from(
        document.querySelectorAll(`[data-row-cat="${cat}"][data-row-id]`),
      ) as HTMLElement[];
      if (rowEls.length === 0) return;
      const rows: DragRow[] = rowEls.map((el) => {
        const r = el.getBoundingClientRect();
        return { id: el.getAttribute("data-row-id")!, el, top: r.top, height: r.height };
      });
      const fromIndex = rows.findIndex((r) => r.id === todo.id);
      if (fromIndex < 0) return;
      const rowH = rows.length > 1 ? Math.abs(rows[1].top - rows[0].top) : rows[0].height + 8;
      const dragEl = rows[fromIndex].el;
      dragRef.current = { id: todo.id, cat, startY, fromIndex, toIndex: fromIndex, rows, rowH, dragEl };
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
        // 롱프레스 전에 많이 움직임 → 스크롤 의도, 드래그 취소
        cleanup();
      }
    };
    const onUp = () => {
      const wasDrag = !!dragRef.current;
      if (wasDrag) commitDrag();
      cleanup();
      // 마우스는 pointerup 직후 click이 한 번 발생 → 그 click만 무시하고 다음 tick에 해제.
      // 터치 드래그는 click이 없으므로 곧 해제되어 다음 탭이 막히지 않는다.
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
  const renderActiveRow = (todo: TodoItem) => {
    // 빈 행/입력 중인 행은 인라인 타이핑, 텍스트가 확정된 행은 탭하면 수정 바텀시트가 뜬다.
    const isInputMode = !todo.text.trim() || inlineFocusId === todo.id;
    return (
      <div
        key={todo.id}
        className={`shrink-0 bg-[var(--color-bg-muted)] rounded-[8px] flex items-center gap-[8px] px-[12px] py-[8px] ${isInputMode ? "cursor-text" : "cursor-grab active:cursor-grabbing"}`}
        onPointerDown={isInputMode ? undefined : (e) => onRowPointerDown(e, todo)}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          // 방금 드래그로 순서를 바꾼 경우 — 뒤따르는 click을 무시한다.
          // (플래그 해제는 pointerup 후 처리하므로 여기선 reset하지 않는다.)
          if (didDragRef.current) return;
          if (isInputMode) {
            (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus();
          } else {
            // 확정된 할일 — 인풋 전체 선택 시 수정 바텀시트 (Figma 7469-145952)
            setEditingTodoId(todo.id);
          }
        }}
        data-name="todo-row"
        {...(isInputMode ? {} : { "data-row-id": todo.id, "data-row-cat": todo.category })}
      >
        {isInputMode ? (
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
            className="flex-1 min-w-0 bg-transparent outline-none border-none font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[var(--color-fg-text-weak)] placeholder:text-[var(--color-fg-text-subtle)] cursor-text"
            data-name="todo-input"
          />
        ) : (
          <p
            className="flex-1 min-w-0 font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[var(--color-fg-text-weak)] overflow-hidden whitespace-nowrap text-ellipsis"
            title={todo.text}
            data-name="todo-text"
          >
            {todo.text}
          </p>
        )}
        {todo.pending && todo.text.trim() && <PendingBadge />}
        {/* 체크박스 — 우측 (Figma 7274-263967). 탭하면 미완료→부분완료(세모)→완료 순환 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!todo.text.trim()) return;
            cycleTodoStatus(todo);
          }}
          disabled={!todo.text.trim()}
          aria-label="상태 변경"
          aria-disabled={!todo.text.trim()}
          className="size-[24px] flex items-center justify-center shrink-0"
        >
          {todo.partial ? (
            // 부분완료(세모) — 라임 박스 + 흰 삼각형 (Figma 7519-117674)
            <img src={checkboxPartial} alt="" className="size-[24px]" />
          ) : (
            <img src={checkboxEmpty} alt="" className="size-[18px]" />
          )}
        </button>
      </div>
    );
  };

  // 완료된 할일 행 — 라임 배경 + 우측 라임 체크 (Figma 7274-263967). 취소선 없음, 수정/삭제 불가.
  const renderDoneRow = (todo: TodoItem) => (
    <div
      key={todo.id}
      className="shrink-0 bg-[#e5fc8b] rounded-[8px] flex items-center gap-[8px] px-[12px] py-[8px]"
      data-name="todo-row-done"
    >
      <p
        className="flex-1 min-w-0 font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[#333] overflow-hidden whitespace-nowrap text-ellipsis"
        title={todo.text}
      >
        {todo.text || " "}
      </p>
      {todo.pending && <PendingBadge />}
      {/* 체크박스 — 우측, 라임 완료. 탭하면 미완료로 순환 (완료→미완료) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          cycleTodoStatus(todo);
        }}
        aria-label="상태 변경"
        className="size-[24px] flex items-center justify-center shrink-0"
      >
        <div className="size-[18px] rounded-[4px] flex items-center justify-center bg-[#7da907]">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1.5 5.2L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
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

      {/* "···" 액션 바 — 수정 / (오늘로 미루기) / 삭제 (Figma 7447-266638) */}
      {todoMenu && (() => {
        const todo = todos.find((t) => t.id === todoMenu.id);
        const showEdit = !todo?.done;
        const showPostpone = !!todo && todo.date !== todayStr;
        return (
          <>
            <style>{`@keyframes todoActionUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
            {/* 백드롭 — 바깥 탭 시 닫힘 */}
            <div className="fixed inset-0 z-[60]" onClick={() => setTodoMenu(null)} />
            {/* 하단 액션 바 */}
            <div
              className="fixed inset-x-0 bottom-0 z-[61] bg-[var(--color-bg-weak)] flex flex-col items-center"
              style={{ animation: "todoActionUp 0.25s cubic-bezier(0.22,1,0.36,1)" }}
            >
              <div className="flex gap-[8px] items-stretch p-[16px] w-full">
                {/* 수정 — 완료되지 않은 투두에만 */}
                {showEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTodoId(todoMenu.id);
                      setTodoMenu(null);
                    }}
                    className="flex-1 h-[56px] rounded-[8px] bg-[var(--color-bg-neutral-solid)] active:bg-[var(--color-bg-neutral-solid-pressed)] transition-colors flex items-center justify-center"
                  >
                    <p className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-white">수정</p>
                  </button>
                )}
                {/* 오늘로 미루기 — 오늘 날짜가 아닌 투두에만 */}
                {showPostpone && (
                  <button
                    type="button"
                    onClick={() => postponeTodo(todoMenu.id)}
                    className="flex-1 h-[56px] rounded-[8px] bg-[var(--color-bg-neutral-solid)] active:bg-[var(--color-bg-neutral-solid-pressed)] transition-colors flex items-center justify-center"
                  >
                    <p className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-white">오늘로 미루기</p>
                  </button>
                )}
                {/* 삭제 */}
                <button
                  type="button"
                  onClick={() => {
                    removeTodo(todoMenu.id);
                    setTodoMenu(null);
                  }}
                  className="flex-1 h-[56px] rounded-[8px] bg-[var(--color-bg-error)] active:bg-[var(--color-bg-error-pressed)] transition-colors flex items-center justify-center"
                >
                  <p className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-white">삭제</p>
                </button>
              </div>
              {/* 하단 안전영역 */}
              <div className="h-[34px] w-full shrink-0" />
            </div>
          </>
        );
      })()}

      {/* ── 상태 선택 바텀시트 (미완료 / 부분 완료 / 완료) — 체크박스 탭 시 (Figma 7446-114767) ── */}
      {statusMenu && (() => {
        const todo = todos.find((t) => t.id === statusMenu.id);
        if (!todo) return null;
        const cur = todo.done ? "done" : todo.partial ? "partial" : "none";
        const options = [
          {
            key: "none" as const,
            label: "미완료",
            icon: <div className="size-[24px] rounded-[5px] border-[1.92px] border-[var(--color-border-subtle)]" />,
          },
          {
            key: "partial" as const,
            label: "부분 완료",
            icon: (
              <div className="size-[24px] rounded-[5px] border-[1.92px] border-[var(--color-bg-brand)] flex items-center justify-center">
                <svg width="14" height="12" viewBox="0 0 10 9" fill="none" aria-hidden="true">
                  <path d="M5 0.8L9.33 8.2H0.67L5 0.8Z" fill="var(--color-bg-brand)" />
                </svg>
              </div>
            ),
          },
          {
            key: "done" as const,
            label: "완료",
            icon: (
              <div className="size-[24px] rounded-[5px] flex items-center justify-center bg-[var(--color-bg-brand)]">
                <svg width="16" height="16" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M1.5 5.2L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ),
          },
        ];
        return (
          <>
            <style>{`@keyframes statusSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
            {/* 딤 백드롭 */}
            <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setStatusMenu(null)} />
            {/* 바텀시트 */}
            <div
              className="fixed inset-x-0 bottom-0 z-[61] bg-[var(--color-bg-weak)] rounded-t-[16px] flex flex-col items-center"
              style={{ animation: "statusSheetUp 0.28s cubic-bezier(0.22,1,0.36,1)" }}
            >
              {/* 헤더 */}
              <div className="relative w-full flex flex-col items-center justify-center px-[16px] py-[24px]">
                <div className="absolute top-[10px] left-1/2 -translate-x-1/2 h-[5px] w-[40px] rounded-full bg-[var(--color-fg-text-disable)]" />
                <p className="font-['Pretendard:SemiBold',sans-serif] text-[18px] leading-[27px] text-[var(--color-fg-text-weak)] text-center">
                  할일을 완료 했나요?
                </p>
              </div>
              {/* 옵션 3개 */}
              <div className="flex gap-[8px] items-center justify-center py-[16px] w-full">
                {options.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    aria-label={opt.label}
                    aria-pressed={cur === opt.key}
                    onClick={() => setTodoStatus(todo, opt.key)}
                    className={`bg-[var(--color-bg-muted)] rounded-[12px] px-[24px] py-[16px] flex flex-col gap-[8px] items-center justify-center active:opacity-70 transition-opacity ${
                      cur === opt.key ? "ring-2 ring-[var(--color-bg-brand)]" : ""
                    }`}
                  >
                    <div className="size-[32px] flex items-center justify-center">{opt.icon}</div>
                    <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[var(--color-fg-text-weak)] text-center min-w-[52px]">
                      {opt.label}
                    </p>
                  </button>
                ))}
              </div>
              {/* 하단 안전영역 */}
              <div className="h-[34px] w-full shrink-0" />
            </div>
          </>
        );
      })()}

      {/* 카테고리 관리 바텀시트 — 새 카테고리 추가 / 카테고리 편집 (Figma 7445-269063) */}
      {editMenu && (
        <>
          <style>{`@keyframes catSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
          {/* 딤 백드롭 */}
          <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setEditMenu(null)} />
          {/* 바텀시트 */}
          <div
            className="fixed inset-x-0 bottom-0 z-[61] bg-[var(--color-bg-weak)] rounded-t-[16px] flex flex-col items-center"
            style={{ animation: "catSheetUp 0.28s cubic-bezier(0.22,1,0.36,1)" }}
          >
            {/* 핸들 */}
            <div className="w-full flex justify-center py-[9px]">
              <div className="h-[5px] w-[40px] rounded-full bg-[var(--color-fg-text-disable)]" />
            </div>
            {/* 옵션 리스트 — 좌측 아이콘 + 좌측정렬 텍스트 (Figma 7542-116474) */}
            <div className="w-full px-[16px]">
              {/* 카테고리 추가 */}
              <button
                type="button"
                onClick={() => {
                  setEditMenu(null);
                  setShowCategoryPopup(true);
                }}
                className="w-full flex gap-[12px] items-center py-[16px] active:opacity-70 transition-opacity"
              >
                <img src={iconCategoryAdd} alt="" className="size-[24px] shrink-0 p-[4px]" />
                <span className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[var(--color-fg-text-weak)]">
                  카테고리 추가
                </span>
              </button>
              <div className="h-px w-full bg-[var(--color-border-subtle)]" />
              {/* 카테고리 편집 */}
              <button
                type="button"
                onClick={() => {
                  setEditMenu(null);
                  setShowSettings(true);
                }}
                className="w-full flex gap-[12px] items-center py-[16px] active:opacity-70 transition-opacity"
              >
                <img src={iconCategoryEdit} alt="" className="size-[24px] shrink-0" />
                <span className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-[var(--color-fg-text-weak)]">
                  카테고리 편집
                </span>
              </button>
            </div>
            {/* 닫기 버튼 */}
            <div className="w-full p-[16px]">
              <button
                type="button"
                onClick={() => setEditMenu(null)}
                className="w-full h-[56px] rounded-[8px] bg-[var(--color-bg-brand)] active:bg-[var(--color-bg-brand-pressed)] transition-colors flex items-center justify-center"
              >
                <p className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-white">닫기</p>
              </button>
            </div>
            {/* 하단 안전영역 */}
            <div className="h-[34px] w-full shrink-0" />
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
          pendingCategories={Object.keys(categoryPending).filter((k) => categoryPending[k])}
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
