import { useState, useEffect } from "react";

// ── SVG path constants ───────────────────────────────────────────────────────
const ARC_PATH =
  "M0.0363852 0.799172C2.22719 0.898917 4.3769 1.4292 6.36277 2.35973C8.34864 3.29027 10.1318 4.60284 11.6104 6.22251C13.089 7.84217 14.2341 9.73721 14.9803 11.7994C15.7266 13.8616 16.0593 16.0506 15.9596 18.2414";
const CHEVRON_PATH =
  "M0 0.628539L0.628539 0L3.6476 3.01906L6.66667 0L7.29521 0.628539L3.6476 4.27614L0 0.628539Z";

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;
const MONTH_NAMES = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

// ── 날짜 유틸 ─────────────────────────────────────────────────────────────────

// 해당 달의 달력 그리드 생성 (월요일 시작)
// 각 셀에 실제 year/month를 포함해 인접 달 셀의 정확한 날짜도 알 수 있다
type GridCell = { day: number; currentMonth: boolean; year: number; month: number };

function buildMonthGrid(year: number, month: number): GridCell[][] {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // 0=월
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevTotal = new Date(year, month, 0).getDate();

  // 이전/다음 달 연도·월
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear  = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear  = month === 11 ? year + 1 : year;

  const cells: GridCell[] = [];

  // 이전 달 날짜 채우기
  for (let i = 0; i < firstDow; i++) {
    cells.push({ day: prevTotal - firstDow + 1 + i, currentMonth: false, year: prevYear, month: prevMonth });
  }
  // 현재 달 날짜
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, currentMonth: true, year, month });
  }
  // 다음 달로 채우기 (7의 배수로 맞춤)
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, currentMonth: false, year: nextYear, month: nextMonth });
  }

  const grid: GridCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    grid.push(cells.slice(i, i + 7));
  }
  return grid;
}

// 해당 날짜가 포함된 주의 7일 (월요일 시작)
type WeekDay = { day: number; month: number; year: number };

function getWeekOf(date: Date): WeekDay[] {
  const dow = (date.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(date);
    d.setDate(date.getDate() - dow + i);
    return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
  });
}

// ── Theme tokens ─────────────────────────────────────────────────────────────
type Theme = "light" | "dark";

const T = {
  light: {
    labelDefault:    "text-[#b6b8b9]",
    labelToday:      "text-[#333]",
    dayProgress:     "text-[#333]",
    dayEmpty:        "text-[#b6b8b9]",
    dayFuture:       "text-[#b6b8b9]",
    dayToday:        "text-[#333]",
    dayNextMonth:    "text-[#b6b8b9]",
    ringProgress:    "border-[#d8d8d8]",   // Figma: border-subtle #d8d8d8
    ringEmpty:       "border-[#efeff0]",
    ringToday:       "border-[#9678FF]",   // 오늘: 보라 full ring
    navBg:           "white",
    navBorder:       "#EFEFF0",
    navArrow:        "#333333",
    monthText:       "text-[#333]",
    handle:          "bg-[#d8d8d8]",
    shadow:          "drop-shadow(0px 4px 4px rgba(110,109,120,0.04))",
    shadowToday:     "drop-shadow(0px 4px 4px rgba(110,109,120,0.08))",
  },
  dark: {
    labelDefault:    "text-[#6d7278]",
    labelToday:      "text-[#f9f9fa]",
    dayProgress:     "text-[#d8d8d8]",
    dayEmpty:        "text-[#d8d8d8]",
    dayFuture:       "text-[#6D7278]",
    dayToday:        "text-[#f9f9fa]",
    dayNextMonth:    "text-[#6d7278]",
    ringProgress:    "border-[#b6b8b9]",
    ringEmpty:       "border-[#6D7278]",
    ringToday:       "border-[#9678FF]",   // 오늘: 보라 full ring
    navBg:           "#333",
    navBorder:       "#404040",
    navArrow:        "#D8D8D8",
    monthText:       "text-[#f9f9fa]",
    handle:          "bg-[#6d7278]",
    shadow:          "drop-shadow(0px 4px 4px rgba(110,109,120,0.04))",
    shadowToday:     "drop-shadow(0px 4px 4px rgba(110,109,120,0.04))",
  },
} as const;

// ── DayCell ───────────────────────────────────────────────────────────────────
type DayCellProps = {
  label?: string;
  day: number;
  isToday?: boolean;
  isFuture?: boolean;
  hasProgress?: boolean;
  nextMonth?: boolean;
  theme: Theme;
  arcStyle?: React.CSSProperties;
  isSelected?: boolean;
  onClick?: () => void;
};

function DayCell({ label, day, isToday, isFuture, hasProgress, nextMonth, theme, arcStyle, isSelected, onClick }: DayCellProps) {
  const t = T[theme];

  // 우선순위: 선택 > 오늘 > 미래 > 인접월 > progress > 기본
  const dayText = isSelected
    ? "text-[#333333]"
    : isToday                 // 오늘이 인접 달 행에 있어도 오늘 색상 우선
    ? t.dayToday
    : isFuture
    ? t.dayFuture             // 미래 날짜
    : nextMonth
    ? t.dayNextMonth
    : hasProgress
    ? t.dayProgress
    : t.dayEmpty;

  // 링 색상은 데이터(progress) 유무 기반 — 미래 날짜는 데이터가 없으므로 자연히 ringEmpty
  const ringBorder = isSelected
    ? "border-transparent"
    : isToday
    ? t.ringToday             // 오늘: 보라 full ring
    : hasProgress
    ? t.ringProgress          // 데이터 있는 날: 밝은 링
    : t.ringEmpty;            // 데이터 없는 날(과거·미래 모두): 어두운/연한 링

  // 선택된 날은 테마의 기본 레이블 색상 사용 (흰색 고정 X — 라이트 테마에서 배경과 겹침)
  const labelText = isToday ? t.labelToday : t.labelDefault;

  return (
    <div
      className={`flex flex-col gap-[4px] items-center pb-[8px] pt-[4px] px-[8px] flex-1 ${
        isToday || isSelected ? "rounded-[12px]" : "rounded-[8px]"
      } ${onClick ? "cursor-pointer active:opacity-70 transition-opacity" : ""}`}
      style={{ filter: isToday || isSelected ? t.shadowToday : t.shadow }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {label !== undefined && (
        <p className={`font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-center min-w-full w-[min-content] ${labelText}`}>
          {label}
        </p>
      )}
      <div className={`flex flex-col items-center justify-center p-[8px] rounded-full size-[35px] relative ${isSelected ? "bg-[#9678FF]" : ""}`}>
        <div
          aria-hidden="true"
          className={`absolute inset-0 rounded-full border-[2px] border-solid pointer-events-none ${ringBorder}`}
        />
        <p className={`font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-center whitespace-nowrap ${dayText}`}>
          {day}
        </p>
        {/* 오늘은 full ring(border-[#9678FF])으로 표시하므로 아크 미표시 */}
        {/* 선택된 날도 아크 미표시 */}
        {hasProgress && !isSelected && !isToday && (
          <div className="absolute left-0 size-[35px] top-0">
            <div className="absolute inset-[0_0_47.73%_52.07%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.7768 18.2778">
                <path
                  d={ARC_PATH}
                  stroke="#9678FF"
                  strokeWidth="2"
                  pathLength={1}
                  style={arcStyle}
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SharedCalendar ────────────────────────────────────────────────────────────
export interface SharedCalendarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  progressData: { day: number; ratio: number }[];
  theme?: Theme;
  className?: string;
  selectedDay?: { year: number; month: number; day: number } | null;
  onDaySelect?: (date: { year: number; month: number; day: number } | null) => void;
}

export default function SharedCalendar({
  isCollapsed,
  onToggle,
  progressData,
  theme = "light",
  className,
  selectedDay,
  onDaySelect,
}: SharedCalendarProps) {
  const [colAnimate, setColAnimate] = useState(false);
  const [expAnimate, setExpAnimate] = useState(false);
  const t = T[theme];

  // 오늘 날짜
  const today = new Date();
  const todayYear  = today.getFullYear();
  const todayMonth = today.getMonth();  // 0-based
  const todayDay   = today.getDate();

  // 펼친 뷰에서 현재 보고 있는 연/월
  const [viewYear,  setViewYear]  = useState(todayYear);
  const [viewMonth, setViewMonth] = useState(todayMonth);

  // 접힌 뷰: 오늘이 포함된 주
  const thisWeek = getWeekOf(today);

  // 펼친 뷰: 선택된 달의 그리드
  const monthGrid = buildMonthGrid(viewYear, viewMonth);

  // 이전/다음 달 이동
  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  // selectedDay와 특정 날짜가 같은지 체크
  const isSameDay = (y: number, m: number, d: number) =>
    !!selectedDay && selectedDay.year === y && selectedDay.month === m && selectedDay.day === d;

  // 날짜 클릭 핸들러
  const handleDayClick = (y: number, m: number, d: number) => {
    if (!onDaySelect) return;
    if (isSameDay(y, m, d)) {
      onDaySelect(null);
    } else {
      onDaySelect({ year: y, month: m, day: d });
    }
  };

  // progressData 변경 시 접힌 뷰 아크 애니메이션 재실행
  useEffect(() => {
    setColAnimate(false);
    const id = setTimeout(() => setColAnimate(true), 80);
    return () => clearTimeout(id);
  }, [progressData]);

  // 펼침 전환 or progressData 변경 시 그리드 아크 애니메이션
  useEffect(() => {
    if (!isCollapsed) {
      setExpAnimate(false);
      const id = setTimeout(() => setExpAnimate(true), 80);
      return () => clearTimeout(id);
    } else {
      setExpAnimate(false);
    }
  }, [isCollapsed, progressData]);

  // 달 변경 시 애니메이션 리셋
  useEffect(() => {
    setExpAnimate(false);
    const id = setTimeout(() => setExpAnimate(true), 80);
    return () => clearTimeout(id);
  }, [viewYear, viewMonth]);

  // 날짜 비교용 숫자 (YYYYMMDD)
  const todayNumeric = todayYear * 10000 + todayMonth * 100 + todayDay;

  const arcStyle = (animate: boolean, delayMs: number, ratio: number = 1): React.CSSProperties => ({
    strokeDasharray: 1,
    strokeDashoffset: animate ? (1 - ratio) : 1,
    transition: animate
      ? `stroke-dashoffset 0.65s cubic-bezier(0.4, 0, 0.2, 1) ${delayMs}ms`
      : "none",
  });

  return (
    <div className={className ?? "flex flex-col items-center relative w-full select-none"}>
      {isCollapsed ? (
        /* ── 접힌 뷰: 오늘이 속한 주 7일 ─────────────────────── */
        <div className="flex gap-[4px] items-center justify-center w-full px-[16px]">
          {thisWeek.map((d, i) => {
            const isTodayCell = d.year === todayYear && d.month === todayMonth && d.day === todayDay;
            const isOtherMonth = d.month !== todayMonth;
            const progressItem = !isOtherMonth ? progressData.find((p) => p.day === d.day) : undefined;
            const selected = isSameDay(d.year, d.month, d.day);
            const cellNumeric = d.year * 10000 + d.month * 100 + d.day;
            const isFutureCell = cellNumeric > todayNumeric;
            return (
              <DayCell
                key={i}
                label={isTodayCell ? "오늘" : WEEKDAYS[i]}
                day={d.day}
                isToday={isTodayCell}
                isFuture={isFutureCell}
                hasProgress={!!progressItem && !isTodayCell}
                nextMonth={isOtherMonth}
                theme={theme}
                arcStyle={arcStyle(colAnimate, i * 130, progressItem?.ratio ?? 1)}
                isSelected={selected}
                onClick={() => handleDayClick(d.year, d.month, d.day)}
              />
            );
          })}
        </div>
      ) : (
        /* ── 펼친 뷰: 선택된 달 전체 그리드 ─────────────────── */
        <div className="flex flex-col gap-[24px] items-center w-full px-[16px]">
          {/* 월 네비게이션 */}
          <div className="flex gap-[24px] items-center justify-center py-[4px] w-full">
            <button
              type="button"
              onClick={goToPrevMonth}
              aria-label="이전 달"
              className="size-[20px] relative active:opacity-70 transition-opacity"
            >
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <circle cx="10" cy="10" fill={t.navBg} r="9.5" stroke={t.navBorder} />
              </svg>
              <div className="absolute inset-[16.67%_18.75%_16.67%_14.58%]">
                <div className="absolute flex inset-[22.64%_35.14%_22.64%_32.79%] items-center justify-center" style={{ containerType: "size" }}>
                  <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.29521 4.27614">
                      <path clipRule="evenodd" d={CHEVRON_PATH} fill={t.navArrow} fillRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            <p className={`font-['Pretendard:Medium',sans-serif] text-[14px] leading-[1.5] ${t.monthText}`}>
              {viewYear}년 {MONTH_NAMES[viewMonth]}
            </p>

            <button
              type="button"
              onClick={goToNextMonth}
              aria-label="다음 달"
              className="size-[20px] relative active:opacity-70 transition-opacity"
            >
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <circle cx="10" cy="10" fill={t.navBg} r="9.5" stroke={t.navBorder} />
              </svg>
              <div className="absolute inset-[16.67%_14.58%_16.67%_18.75%]">
                <div className="absolute flex inset-[22.64%_32.79%_22.64%_35.14%] items-center justify-center" style={{ containerType: "size" }}>
                  <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.29521 4.27614">
                      <path clipRule="evenodd" d={CHEVRON_PATH} fill={t.navArrow} fillRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* 날짜 그리드 — 주(row) 간 gap 없음, 셀 내부 패딩으로 간격 처리 */}
          <div className="flex flex-col items-start w-full">
            {monthGrid.map((week, wi) => (
              <div key={wi} className="flex gap-[4px] items-center justify-center w-full">
                {week.map((d, di) => {
                  // 인접 달 셀도 오늘이면 today 처리
                  const isTodayCell = d.year === todayYear && d.month === todayMonth && d.day === todayDay;
                  const progressItem = d.currentMonth
                    ? progressData.find((p) => p.day === d.day)
                    : undefined;
                  const hasProgress = !!progressItem && !isTodayCell;
                  const selected = d.currentMonth && isSameDay(viewYear, viewMonth, d.day);
                  const cellNumeric = d.year * 10000 + d.month * 100 + d.day;
                  const isFutureCell = cellNumeric > todayNumeric;

                  // 첫 행(wi===0)에서는 요일 레이블 표시
                  // 오늘이면 "오늘" 레이블, 아니면 요일명
                  const label = wi === 0
                    ? (isTodayCell ? "오늘" : WEEKDAYS[di])
                    : (isTodayCell ? "오늘" : undefined); // 오늘이 첫 행 외에 있어도 "오늘" 표시

                  return (
                    <DayCell
                      key={di}
                      label={label}
                      day={d.day}
                      nextMonth={!d.currentMonth}
                      isToday={isTodayCell}
                      isFuture={isFutureCell}
                      hasProgress={hasProgress}
                      theme={theme}
                      arcStyle={arcStyle(expAnimate, (wi * 7 + di) * 80, progressItem?.ratio ?? 1)}
                      isSelected={selected}
                      // currentMonth 셀 + 오늘 셀은 클릭 허용 (오늘이 인접 달에 있어도 클릭 가능)
                      onClick={(d.currentMonth || isTodayCell) ? () => handleDayClick(d.year, d.month, d.day) : undefined}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 드래그 핸들 — 토글 버튼 */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={isCollapsed ? "캘린더 확장" : "캘린더 축소"}
        className="flex flex-col items-center justify-center pb-[4px] pt-[12px] w-full"
      >
        <div className={`h-[3px] rounded-[8px] w-[56px] ${t.handle}`} />
      </button>
    </div>
  );
}
