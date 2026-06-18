import { useState } from "react";
import SharedCalendar from "./components/SharedCalendar";
import CharacterSelection from "./components/CharacterSelection";
import TimerScreen from "./components/TimerScreen";
import TodoScreen from "./components/TodoScreen";
import YesterdayScreen from "./components/YesterdayScreen";
import RankingScreen from "./components/RankingScreen";
import PomodoroBottomSheet, { type PomodoroSettings } from "./components/PomodoroBottomSheet";
import TimeEditScreen from "./components/TimeEditScreen";
import ConflictPopup from "./components/ConflictPopup";
import HomeScreen from "./components/HomeScreen";
import AppSettingsScreen from "./components/AppSettingsScreen";
import { OfflineProvider, useOffline } from "./contexts/OfflineContext";

/** 개발용 온/오프라인 토글 — 오프라인 모드 UI 시연용 (실제 네트워크 감지 아님).
 *  배너 없는 화면(홈·랭킹)에서도 복귀할 수 있도록 항상 노출한다. */
function OfflineDevToggle() {
  const { isOffline, setOffline } = useOffline();
  return (
    <button
      onClick={() => setOffline(!isOffline)}
      className={`fixed top-[8px] left-[140px] z-[100] px-3 py-2 rounded-full text-xs font-medium shadow-lg transition-colors ${
        isOffline ? "bg-[#f37555] text-white" : "bg-[#333] text-white"
      }`}
      data-name="dev-offline-toggle"
    >
      {isOffline ? "✈️ 오프라인 (탭하면 온라인)" : "📶 온라인 (탭하면 오프라인)"}
    </button>
  );
}

/** 숫자가 바뀔 때마다 아래→위로 슬라이드 인 되는 타이머 표시 컴포넌트 */
function AnimatedTimerDisplay({ seconds }: { seconds: number }) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return (
    <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[48px] not-italic relative shrink-0 text-[#333] text-[36px] w-full tabular-nums" style={{ overflow: 'hidden' }}>
      <style>{`
        @keyframes timerDigitUp {
          from { transform: translateY(50%); opacity: 0; }
          to   { transform: translateY(0%);  opacity: 1; }
        }
      `}</style>
      {timeStr.split('').map((char, i) =>
        char === ':' ? (
          <span key={`sep-${i}`}>{char}</span>
        ) : (
          <span
            key={`${i}-${char}`}
            style={{
              display: 'inline-block',
              animation: 'timerDigitUp 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {char}
          </span>
        )
      )}
    </p>
  );
}

const svgPaths = {
  p1c248100: "M21.5 32C28.9558 32 35 25.9558 35 18.5C35 11.0442 28.9558 5 21.5 5C14.0442 5 8 11.0442 8 18.5C8 25.9558 14.0442 32 21.5 32Z",
  p1c54e880: "M19.1454 12.9405L19.1358 12.9595C19.1743 12.646 19.2127 12.323 19.2127 12C19.2127 11.677 19.1839 11.373 19.1454 11.0595L19.155 11.0785L21.5 9.2545L19.1646 5.2455L16.4064 6.3475L16.416 6.357C15.9163 5.977 15.3685 5.654 14.7726 5.407H14.7822L14.3402 2.5H9.65984L9.23698 5.4165H9.24659C8.65073 5.6635 8.10293 5.9865 7.60319 6.3665L7.6128 6.357L4.84497 5.2455L2.5 9.2545L4.84497 11.0785L4.85458 11.0595C4.81614 11.373 4.7873 11.677 4.7873 12C4.7873 12.323 4.81614 12.646 4.86419 12.9595L4.85458 12.9405L2.83637 14.508L2.51922 14.755L4.85458 18.745L7.62241 17.6525L7.60319 17.6145C8.11254 18.004 8.66034 18.327 9.26581 18.574H9.23698L9.66945 21.5H14.3306C14.3306 21.5 14.3594 21.329 14.3882 21.101L14.7534 18.5835H14.7438C15.3397 18.3365 15.8971 18.0135 16.4064 17.624L16.3872 17.662L19.155 18.7545L21.4904 14.7645C21.4904 14.7645 21.3558 14.6505 21.1732 14.5175L19.1454 12.9405ZM11.9952 15.325C10.1404 15.325 8.63151 13.8335 8.63151 12C8.63151 10.1665 10.1404 8.675 11.9952 8.675C13.85 8.675 15.3589 10.1665 15.3589 12C15.3589 13.8335 13.85 15.325 11.9952 15.325Z",
  p1f1ce200: "M29.8005 2.64105C32.0349 2.64115 34.1839 3.46068 35.8033 4.93025C35.9252 5.04371 36.1201 5.04228 36.2402 4.92704L37.4059 3.8041C37.4667 3.74566 37.5006 3.66649 37.5001 3.58411C37.4996 3.50174 37.4647 3.42296 37.4032 3.36519C33.1529 -0.522963 26.4475 -0.522963 22.1972 3.36519C22.1356 3.42291 22.1007 3.50167 22.1001 3.58405C22.0995 3.66642 22.1334 3.74561 22.1941 3.8041L23.3601 4.92704C23.4802 5.04245 23.6752 5.04388 23.7971 4.93025C25.4167 3.46058 27.5659 2.64105 29.8005 2.64105V2.64105ZM29.8005 6.29447C31.0282 6.2944 32.212 6.72997 33.122 7.51655C33.2451 7.62819 33.439 7.62577 33.559 7.5111L34.7233 6.38816C34.7846 6.32926 34.8186 6.24935 34.8178 6.16632C34.8169 6.08329 34.7812 6.00406 34.7186 5.94636C31.9474 3.48579 27.6559 3.48579 24.8848 5.94636C24.8222 6.00406 24.7865 6.08333 24.7857 6.16638C24.7848 6.24944 24.819 6.32934 24.8804 6.38816L26.0444 7.5111C26.1644 7.62577 26.3583 7.62819 26.4813 7.51655C27.3908 6.73049 28.5737 6.29496 29.8005 6.29447V6.29447ZM32.0381 8.97444C32.1003 8.91611 32.1346 8.83583 32.1328 8.75257C32.1311 8.6693 32.0934 8.59043 32.0286 8.53457C30.7424 7.49612 28.8586 7.49612 27.5724 8.53457C27.5076 8.59038 27.4699 8.66923 27.468 8.7525C27.4662 8.83576 27.5004 8.91606 27.5626 8.97444L29.577 10.9146C29.636 10.9716 29.7165 11.0037 29.8005 11.0037C29.8845 11.0037 29.965 10.9716 30.024 10.9146L32.0381 8.97444Z",
  p1f3c4380: "M20 14.0003L10 8.00033V20.0003L20 14.0003Z",
  p1fa84700: "M60.9102 0C62.1582 0 62.6111 0.130042 63.0674 0.374023C63.5237 0.618053 63.8819 0.976321 64.126 1.43262C64.37 1.88887 64.5 2.34185 64.5 3.58984V7.91016C64.5 9.15815 64.37 9.61113 64.126 10.0674C63.8819 10.5237 63.5237 10.8819 63.0674 11.126C62.6111 11.37 62.1582 11.5 60.9102 11.5H46.0898C44.8418 11.5 44.3889 11.37 43.9326 11.126C43.4763 10.8819 43.1181 10.5237 42.874 10.0674C42.63 9.61113 42.5 9.15815 42.5 7.91016V3.58984C42.5 2.34185 42.63 1.88887 42.874 1.43262C43.1181 0.976321 43.4763 0.618053 43.9326 0.374023C44.3889 0.130042 44.8418 0 46.0898 0H60.9102ZM46.0898 1C45.103 1 44.7581 1.06668 44.4043 1.25586C44.1223 1.40669 43.9067 1.62227 43.7559 1.9043C43.5667 2.25812 43.5 2.60305 43.5 3.58984V7.91016C43.5 8.89695 43.5667 9.24188 43.7559 9.5957C43.9067 9.87773 44.1223 10.0933 44.4043 10.2441C44.7581 10.4333 45.103 10.5 46.0898 10.5H60.9102C61.897 10.5 62.2419 10.4333 62.5957 10.2441C62.8777 10.0933 63.0933 9.87773 63.2441 9.5957C63.4333 9.24188 63.5 8.89695 63.5 7.91016V3.58984C63.5 2.60305 63.4333 2.25812 63.2441 1.9043C63.0933 1.62227 62.8777 1.40669 62.5957 1.25586C62.2419 1.06668 61.897 1 60.9102 1H46.0898ZM65.5 3.69043C65.5184 3.69985 67 4.46155 67 5.69043C66.9997 6.92675 65.5 7.69043 65.5 7.69043V3.69043Z",
  p2890d100: "M8.0001 8.39261e-08L8.0001 16",
  p2a59a680: "M0 15.5V5H2.5V15.5H0ZM5.75 15.5V0H8.25V15.5H5.75ZM11.5 15.5V7.5H14V15.5H11.5Z",
  p2e98bf80: "M0 1.13137L1.13137 0L6.56569 5.43431L12 0L13.1314 1.13137L6.56569 7.69706L0 1.13137Z",
  p882cd80: "M0 0.628539L0.628539 0L3.6476 3.01906L6.66667 0L7.29521 0.628539L3.6476 4.27614L0 0.628539Z",
  p95dd880: "M1.5 7.03551C1.77879 7.03551 1.91826 7.03589 2.03418 7.05894C2.51011 7.15367 2.88186 7.52539 2.97656 8.00133C2.99962 8.11724 3 8.25671 3 8.53551V9.35386C3 9.6325 2.99961 9.77216 2.97656 9.88804C2.88176 10.3639 2.51004 10.7357 2.03418 10.8304C1.91826 10.8535 1.77879 10.8539 1.5 10.8539C1.22121 10.8539 1.08174 10.8535 0.96582 10.8304C0.489961 10.7357 0.118238 10.3639 0.0234375 9.88804C0.000386359 9.77216 1.83726e-09 9.6325 0 9.35386V8.53551C0 8.25671 0.000379849 8.11724 0.0234375 8.00133C0.118143 7.52539 0.489893 7.15367 0.96582 7.05894C1.08174 7.03589 1.22121 7.03551 1.5 7.03551ZM6.2998 5.12633C6.57857 5.12633 6.71807 5.12671 6.83398 5.14976C7.31001 5.24445 7.68265 5.61613 7.77734 6.09215C7.8004 6.20806 7.7998 6.34755 7.7998 6.62633V9.35386C7.7998 9.6325 7.80039 9.77216 7.77734 9.88804C7.68259 10.364 7.30994 10.7358 6.83398 10.8304C6.71808 10.8535 6.57853 10.8539 6.2998 10.8539C6.02113 10.8539 5.88152 10.8535 5.76562 10.8304C5.28984 10.7357 4.91802 10.3638 4.82324 9.88804C4.80019 9.77216 4.7998 9.6325 4.7998 9.35386V6.62633C4.7998 6.34755 4.80019 6.20806 4.82324 6.09215C4.91795 5.61629 5.28979 5.24454 5.76562 5.14976C5.88152 5.12671 6.02113 5.12633 6.2998 5.12633ZM10.9004 2.93101C11.1789 2.93101 11.3187 2.9314 11.4346 2.95445C11.9103 3.04931 12.2823 3.42099 12.377 3.89683C12.4 4.01275 12.4004 4.15224 12.4004 4.43101V9.35386C12.4004 9.63251 12.4 9.77216 12.377 9.88804C12.2822 10.3638 11.9103 10.7356 11.4346 10.8304C11.3187 10.8535 11.1789 10.8539 10.9004 10.8539C10.6218 10.8539 10.4821 10.8534 10.3662 10.8304C9.89026 10.7358 9.51762 10.364 9.42285 9.88804C9.3998 9.77216 9.40039 9.63251 9.40039 9.35386V4.43101C9.40039 4.15227 9.39981 4.01274 9.42285 3.89683C9.51754 3.4208 9.89018 3.04914 10.3662 2.95445C10.4821 2.93144 10.6218 2.93101 10.9004 2.93101ZM15.5996 0.639997C15.8782 0.639997 16.0179 0.640422 16.1338 0.663435C16.6098 0.758121 16.9825 1.1298 17.0771 1.60582C17.1002 1.72174 17.0996 1.8612 17.0996 2.14V9.35386C17.0996 9.63251 17.1002 9.77216 17.0771 9.88804C16.9824 10.364 16.6097 10.7358 16.1338 10.8304C16.0179 10.8534 15.8782 10.8539 15.5996 10.8539C15.3211 10.8539 15.1813 10.8535 15.0654 10.8304C14.5897 10.7356 14.2178 10.3638 14.123 9.88804C14.1 9.77216 14.0996 9.63251 14.0996 9.35386V2.14C14.0996 1.8612 14.1 1.72174 14.123 1.60582C14.2177 1.12999 14.5897 0.758282 15.0654 0.663435C15.1813 0.640388 15.3211 0.639997 15.5996 0.639997Z",
  pc9c8380: "M0.0363852 0.799172C2.22719 0.898917 4.3769 1.4292 6.36277 2.35973C8.34864 3.29027 10.1318 4.60284 11.6104 6.22251C13.089 7.84217 14.2341 9.73721 14.9803 11.7994C15.7266 13.8616 16.0593 16.0506 15.9596 18.2414",
  pe1fc120: "M129.713 0C131.222 0 132.109 0.103072 132.593 0.333984C133.456 0.746957 134 1.59507 134 2.5C134 3.405 133.456 4.25402 132.593 4.66602C132.109 4.89698 131.222 5 129.713 5H4.28711C2.77823 5 1.89125 4.89698 1.40723 4.66602C0.544227 4.25402 0 3.405 0 2.5C7.33714e-05 1.59507 0.544285 0.746957 1.40723 0.333984C1.89128 0.103072 2.77838 0 4.28711 0H129.713Z",
  p1169c200: "M1.13137 1.01465e-06L16.2627 15.1314L15.1314 16.2627L5.91658e-07 1.13137L1.13137 1.01465e-06Z",
  p1580e100: "M12.7363 6.26562L14.5215 8.05176L4.99121 17.583L0.917969 18.0811L1.41699 14.0107L10.9492 4.47852L12.7363 6.26562Z",
  p19ea9c00: "M0.666646 0.252796C0.91332 0.0879736 1.20333 0 1.5 0C1.89783 0 2.27936 0.158035 2.56066 0.43934C2.84197 0.720644 3 1.10218 3 1.5C3 1.79667 2.91203 2.08668 2.74721 2.33335C2.58238 2.58003 2.34811 2.77229 2.07403 2.88582C1.79994 2.99935 1.49834 3.02906 1.20736 2.97118C0.916393 2.9133 0.649119 2.77044 0.43934 2.56066C0.229562 2.35088 0.0867006 2.08361 0.0288228 1.79264C-0.0290551 1.50166 0.000649929 1.20006 0.114181 0.925975C0.227713 0.651886 0.419972 0.417618 0.666646 0.252796Z",
  p1fbadb80: "M0.594635 3.64321L2.84464 1.14321L7.09464 5.14321",
  p32b5000: "M15.0166 0.800781C15.4812 0.809914 15.8282 0.961281 16.1113 1.24512L17.7754 2.91309C18.0577 3.19618 18.2002 3.53381 18.2002 3.97852C18.2001 4.42304 18.0576 4.75995 17.7754 5.04297L16.7158 6.10449L12.8916 2.27051L13.9541 1.20605C14.2289 0.930585 14.5621 0.791862 15.0166 0.800781Z",
  p3476e000: "M6.61413e-07 15.1314L15.1314 0L16.2627 1.13137L1.13137 16.2627L6.61413e-07 15.1314Z",
  p3e214280: "M8.5 2.7998C10.559 2.7998 12.4471 3.53195 13.918 4.75L15.3721 3.29688L16.5029 4.42871L15.0479 5.88184C16.2665 7.35285 16.9999 9.24037 17 11.2998C17 15.9942 13.1944 19.7998 8.5 19.7998C3.80558 19.7998 0 15.9942 0 11.2998C0.000131941 6.6055 3.80566 2.7998 8.5 2.7998ZM8.5 4.40039C4.68932 4.40039 1.59974 7.48915 1.59961 11.2998C1.59961 15.1106 4.68924 18.2002 8.5 18.2002C12.3108 18.2002 15.4004 15.1106 15.4004 11.2998C15.4003 7.48915 12.3107 4.40039 8.5 4.40039ZM9.2998 11.2002H7.7002V5.7998H9.2998V11.2002ZM11.5 1.59961H5.5V0H11.5V1.59961Z",
  p41a8c80: "M0.589723 7.1565L6.08972 1.1565L16.5897 11.6565",
};


function StatusBar() {
  return (
    <div className="h-[42px] relative w-full">
      <div className="absolute h-[11.5px] right-[14.5px] top-[19.16px] w-[67px]" data-name="Symbol">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 67 11.5">
          <g id="Symbol">
            <g id="Battery">
              <path d={svgPaths.p1fa84700} fill="var(--fill-0, #333333)" id="Rectangle" opacity="0.36" />
              <rect fill="var(--fill-0, #333333)" height="7.66667" id="Rectangle_2" rx="1.6" width="18" x="44.5" y="1.91667" />
            </g>
            <path clipRule="evenodd" d={svgPaths.p1f1ce200} fill="var(--fill-0, #333333)" fillRule="evenodd" id="Wi-Fi" />
            <path d={svgPaths.p95dd880} fill="var(--fill-0, #333333)" id="Cellular" />
          </g>
        </svg>
      </div>
      <div className="absolute h-[22px] left-[29.5px] top-[10px]" data-name="Time">
        <p className="[word-break:break-word] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] text-[#333] text-[15px] tracking-[-0.165px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          9:41
        </p>
      </div>
    </div>
  );
}

function TaskList({ onTaskClick, onPendingClick }: { onTaskClick: () => void; onPendingClick: () => void }) {
  // 오프라인 임시 저장된 타이머는 맨 위에 "대기" 배지와 함께 표시 (PDF: 내 타이머 대기 배지)
  const { pendingTimers } = useOffline();
  const tasks = [
    { name: "아이유 좋아", time: "01:39:01", color: "#F8D884", isPlaying: true },
    { name: "국어 인강", time: "01:39:01", color: "#F8D884", isPlaying: false },
    { name: "국어 인강", time: "01:22:15", color: "#D9D2BF", isPlaying: false },
    { name: "수학 문제풀이", time: "00:58:30", color: "#F8D884", isPlaying: false },
    { name: "영어 단어 암기", time: "00:45:00", color: "#78A6FF", isPlaying: false },
    { name: "과학 개념 정리", time: "01:10:22", color: "#F8D884", isPlaying: false },
    { name: "어쩌구", time: "00:30:00", color: "#A0F1C1", isPlaying: false },
    { name: "유산소", time: "00:52:17", color: "#A0F1C1", isPlaying: false },
    { name: "독서", time: "01:05:44", color: "#78A6FF", isPlaying: false },
    { name: "명상", time: "00:20:00", color: "#A0F1C1", isPlaying: false },
    { name: "피아노 연습", time: "00:40:10", color: "#F8D884", isPlaying: false },
    { name: "드로잉", time: "00:55:30", color: "#D9D2BF", isPlaying: false },
    { name: "수학 오답노트", time: "01:15:00", color: "#F8D884", isPlaying: false },
    { name: "논문 읽기", time: "01:30:00", color: "#78A6FF", isPlaying: false },
    { name: "영어 회화 연습", time: "00:35:20", color: "#78A6FF", isPlaying: false },
    { name: "코딩 공부", time: "02:00:00", color: "#A0F1C1", isPlaying: false },
    { name: "한국사 공부", time: "00:48:33", color: "#F8D884", isPlaying: false },
    { name: "스트레칭", time: "00:15:00", color: "#A0F1C1", isPlaying: false },
    { name: "일기 쓰기", time: "00:22:45", color: "#D9D2BF", isPlaying: false },
    { name: "플래너 정리", time: "00:18:00", color: "#D9D2BF", isPlaying: false },
  ];

  // 대기 타이머(오프라인 임시 저장)를 맨 위로, 그 뒤 기존 기록
  const allTasks = [
    ...pendingTimers.map((pt) => ({ name: pt.name, time: pt.time, color: "#9678ff", isPlaying: false, pending: !pt.synced })),
    ...tasks.map((t) => ({ ...t, pending: false })),
  ];

  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      {allTasks.map((task, idx) => (
        <div
          key={idx}
          className="content-stretch flex items-center gap-[4px] relative w-full cursor-pointer active:bg-[#F7F7F8] transition-all duration-200 ease-out active:scale-[0.98] rounded-[8px] px-[4px] -mx-[4px]"
          onClick={task.pending ? onPendingClick : onTaskClick}
        >
          <div className="flex-[1_0_0] flex gap-[8px] items-center min-w-px">
            <div className="relative shrink-0 size-[28px]">
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
                <g id="Group 3815">
                  <circle cx="14" cy="14" fill={task.color} id="Ellipse 2" opacity="0.2" r="14" />
                  <path d={task.isPlaying ? svgPaths.p1f3c4380 : svgPaths.p1f3c4380} fill={task.color} id="Vector 78" />
                </g>
              </svg>
            </div>
            <p className="[word-break:break-word] font-['Spoqa_Han_Sans_Neo:Regular',sans-serif] leading-[1.5] min-w-px not-italic overflow-hidden relative text-[#6d7278] text-[14px] text-ellipsis whitespace-nowrap">{task.name}</p>
            {task.pending && (
              <span className="shrink-0 px-[8px] py-[2px] flex items-center rounded-[4px] bg-[#fef1ec] text-[#ff7a68] text-[12px] leading-[18px] font-['Pretendard:Medium',sans-serif] whitespace-nowrap">
                대기
              </span>
            )}
          </div>
          <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[21px] not-italic relative shrink-0 text-[#6d7278] text-[14px] text-right whitespace-nowrap">{task.time}</p>
        </div>
      ))}
    </div>
  );
}

function TimeChart() {
  return (
    <div className="absolute right-0 top-[23px] mix-blend-multiply" data-name="chart">
      <div className="absolute bg-[#f8d884] h-[20px] mix-blend-multiply right-[27px] top-[63px] w-[93px]" />
      <div className="absolute bg-[#f8d884] h-[20px] mix-blend-multiply right-[27px] top-[23px] w-[93px]" />
      <div className="absolute bg-[#78a6ff] h-[20px] mix-blend-multiply right-0 top-[123px] w-[74px]" />
      <div className="absolute bg-[#78a6ff] h-[20px] mix-blend-multiply right-[96px] top-[123px] w-[24px]" />
      <div className="absolute bg-[#a0f1c1] h-[20px] mix-blend-multiply right-[38px] top-[283px] w-[82px]" />
      <div className="absolute bg-[#a0f1c1] h-[20px] mix-blend-multiply right-[79px] top-[323px] w-[6px]" />
      <div className="absolute bg-[#78a6ff] mix-blend-multiply right-[36px] size-[20px] top-[323px]" />
      <div className="absolute bg-[#78a6ff] h-[20px] mix-blend-multiply right-[69px] top-[383px] w-[51px]" />
      <div className="absolute bg-[#78a6ff] h-[20px] mix-blend-multiply right-0 top-[83px] w-[27px]" />
    </div>
  );
}

function TimeLabels() {
  const hours = [5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4];
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col font-['ITC_Avant_Garde_Gothic_Std:Demi',sans-serif] gap-[14px] items-center leading-none not-italic py-[7px] relative shrink-0 text-[#b6b8b9] text-[8px] text-center whitespace-nowrap">
      {hours.map((hour, idx) => (
        <p key={idx} className="[text-box-edge:cap_alphabetic] [text-box-trim:trim-both] relative shrink-0">{hour}</p>
      ))}
    </div>
  );
}

export default function App() {
  const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTimeEdit, setShowTimeEdit] = useState(false);
  const [timeEditConflict, setTimeEditConflict] = useState(false);
  const [showConflict, setShowConflict] = useState(false);
  const [showHomeScreen, setShowHomeScreen] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  // 선택한 캐릭터 id — 달리기 배경 분기에 사용 ('boy' | 'girl' | 'cat')
  const [selectedCharacter, setSelectedCharacter] = useState("girl");
  const [showTimerScreen, setShowTimerScreen] = useState(false);
  const [showTodoScreen, setShowTodoScreen] = useState(false);
  const [showYesterdayScreen, setShowYesterdayScreen] = useState(false);
  const [showRankingScreen, setShowRankingScreen] = useState(false);
  const [isPomodoroOn, setIsPomodoroOn] = useState(false);
  const [showPomodoroSheet, setShowPomodoroSheet] = useState(false);
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>({ focusMinutes: 25, breakMinutes: 5 });

  // 오늘 총 집중 시간 — 세션 종료 시마다 누적
  const [homeTimerSecs, setHomeTimerSecs] = useState(0);

  // 타이머 완료 날짜 기록 (날짜별 누적 집중 시간, 초 단위)
  const [timerSessions, setTimerSessions] = useState<{ date: string; secs: number }[]>([]);

  // 홈 캘린더 날짜 선택
  const [selectedHomeDate, setSelectedHomeDate] = useState<{ year: number; month: number; day: number } | null>(null);

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const selectedHomeDateStr = selectedHomeDate
    ? `${selectedHomeDate.year}-${String(selectedHomeDate.month + 1).padStart(2, "0")}-${String(selectedHomeDate.day).padStart(2, "0")}`
    : null;

  return (
    <OfflineProvider>
      <OfflineDevToggle />
      {showYesterdayScreen && (
        <div className="fixed inset-0 z-[60] bg-[#262626]">
          <YesterdayScreen
            onNavigateToTimer={() => {
              setShowYesterdayScreen(false);
              setShowTimerScreen(true);
            }}
            onNavigateToTodo={() => {
              setShowYesterdayScreen(false);
              setShowTodoScreen(true);
            }}
            onNavigateToRanking={() => {
              setShowYesterdayScreen(false);
              setShowRankingScreen(true);
            }}
          />
        </div>
      )}

      {showRankingScreen && (
        <div className="fixed inset-0 z-[60] bg-[#262626]">
          <RankingScreen
            onNavigateToTimer={() => {
              setShowRankingScreen(false);
              setShowTimerScreen(true);
            }}
            onNavigateToYesterday={() => {
              setShowRankingScreen(false);
              setShowYesterdayScreen(true);
            }}
            onNavigateToTodo={() => {
              setShowRankingScreen(false);
              setShowTodoScreen(true);
            }}
          />
        </div>
      )}

      {showTodoScreen && (
        <div className="fixed inset-0 z-[60] bg-[#262626]">
          <TodoScreen
            onBack={() => setShowTodoScreen(false)}
            onNavigateToTimer={() => {
              setShowTodoScreen(false);
              setShowTimerScreen(true);
            }}
            onNavigateToYesterday={() => {
              setShowTodoScreen(false);
              setShowYesterdayScreen(true);
            }}
            onNavigateToRanking={() => {
              setShowTodoScreen(false);
              setShowRankingScreen(true);
            }}
          />
        </div>
      )}

      {showTimerScreen && (
        <div className="fixed inset-0 z-50 bg-[#262626]">
          <TimerScreen
            character={selectedCharacter}
            onNavigateToTodo={() => setShowTodoScreen(true)}
            onNavigateToYesterday={() => setShowYesterdayScreen(true)}
            onNavigateToRanking={() => setShowRankingScreen(true)}
            onGoHome={(sessionSecs) => {
              setHomeTimerSecs(prev => prev + sessionSecs);
              // 타이머 완료 날짜 기록
              const d = new Date();
              const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
              setTimerSessions(prev => {
                const existing = prev.find(s => s.date === dateStr);
                if (existing) return prev.map(s => s.date === dateStr ? { ...s, secs: s.secs + sessionSecs } : s);
                return [...prev, { date: dateStr, secs: sessionSecs }];
              });
              setShowTimerScreen(false);
            }}
            isPomodoroMode={isPomodoroOn}
            pomodoroFocusMinutes={pomodoroSettings.focusMinutes}
            pomodoroBreakMinutes={pomodoroSettings.breakMinutes}
          />
        </div>
      )}

      {showTimeEdit && (
        <div className="fixed inset-0 z-[70] bg-white">
          <TimeEditScreen
            conflict={timeEditConflict}
            onBack={() => {
              // 충돌 모드에서 선택 없이 뒤로가기 → 충돌 팝업을 다시 띄운다
              const wasConflict = timeEditConflict;
              setShowTimeEdit(false);
              setTimeEditConflict(false);
              if (wasConflict) setShowConflict(true);
            }}
            onResolve={() => { setTimeEditConflict(false); }}
          />
        </div>
      )}

      {showConflict && (
        <ConflictPopup
          onClose={() => setShowConflict(false)}
          onViewTimeline={() => { setShowConflict(false); setShowTimeEdit(true); setTimeEditConflict(true); }}
        />
      )}

      {showHomeScreen && (
        <HomeScreen
          onOpenTimer={() => setShowHomeScreen(false)}
          onOpenTodo={() => { setShowHomeScreen(false); setShowTodoScreen(true); }}
          onOpenSettings={() => setShowAppSettings(true)}
        />
      )}

      {showAppSettings && (
        <AppSettingsScreen onBack={() => setShowAppSettings(false)} />
      )}

      {showCharacterSelection && (
        <CharacterSelection
          onClose={() => setShowCharacterSelection(false)}
          onStart={(characterId) => {
            setSelectedCharacter(characterId);
            setShowCharacterSelection(false);
            setShowTimerScreen(true);
          }}
        />
      )}

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div className="bg-white h-dvh overflow-clip relative w-full" data-name="타이머">

        <div className="absolute bg-white content-stretch drop-shadow-[0px_4px_6px_rgba(109,114,120,0.08)] flex flex-col items-start left-0 rounded-bl-[16px] rounded-br-[16px] top-0 w-full z-10" data-name="Topnavigation">
        <StatusBar />
        <div className="relative shrink-0 w-full" data-name="nav-bar">
          <div className="flex flex-row items-center justify-center size-full">
            <div className="content-stretch flex items-center justify-between px-[12px] py-[16px] relative size-full">
              <button type="button" onClick={() => setShowHomeScreen(true)} aria-label="홈으로" className="content-stretch flex items-center relative shrink-0 size-[24px] active:opacity-70 transition-opacity cursor-pointer" data-name="leading">
                <div className="relative shrink-0 size-[24px]" data-name="type=outline, name=expandleft">
                  <div className="absolute flex inset-[22.64%_35.14%_22.64%_32.79%] items-center justify-center" style={{ containerType: "size" }}>
                    <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                      <div className="relative size-full" data-name="Vector 71 (Stroke)">
                        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.1314 7.69706">
                          <path clipRule="evenodd" d={svgPaths.p2e98bf80} fill="var(--fill-0, #333333)" fillRule="evenodd" id="Vector 71 (Stroke)" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
              <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="trailing">
                <div className="relative shrink-0 size-[24px]" data-name="type=fill, name=Statistic">
                  <div className="absolute inset-[17.71%_20.83%]" data-name="Vector">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 15.5">
                      <path d={svgPaths.p2a59a680} fill="var(--fill-0, #333333)" id="Vector" />
                    </svg>
                  </div>
                </div>
                <div className="relative shrink-0 size-[24px]" data-name="type=fill, name=Settings">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[24px] top-1/2">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <g id="Frame 4679">
                        <path d={svgPaths.p1c54e880} fill="var(--fill-0, #333333)" id="Vector" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
              <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[calc(50%+0.5px)] not-italic text-[#333] text-[16px] text-center whitespace-nowrap">타이머</p>
            </div>
          </div>
        </div>
        <SharedCalendar
          theme="light"
          progressData={(() => {
            const now = new Date();
            const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
            // 시간 구간별 비율: 30분=25%, 1시간=50%, 2시간=75%, 3시간+=100%
            const secsToRatio = (secs: number) => {
              const SEGMENTS = [
                { from: 0,     to: 1800,  ratioFrom: 0,    ratioTo: 0.25 }, // 0~30분
                { from: 1800,  to: 3600,  ratioFrom: 0.25, ratioTo: 0.5  }, // 30분~1시간
                { from: 3600,  to: 7200,  ratioFrom: 0.5,  ratioTo: 0.75 }, // 1시간~2시간
                { from: 7200,  to: 10800, ratioFrom: 0.75, ratioTo: 1.0  }, // 2시간~3시간
              ];
              if (secs >= 10800) return 1;
              const seg = SEGMENTS.find(s => secs >= s.from && secs < s.to);
              if (!seg) return 0;
              const t = (secs - seg.from) / (seg.to - seg.from);
              return seg.ratioFrom + t * (seg.ratioTo - seg.ratioFrom);
            };
            return timerSessions
              .filter(s => s.date.startsWith(ym))
              .map(s => ({
                day: new Date(s.date).getDate(),
                ratio: secsToRatio(s.secs),
              }));
          })()}
          className="content-stretch flex flex-col items-center relative shrink-0 w-full"
          isCollapsed={isCalendarCollapsed}
          onToggle={() => setIsCalendarCollapsed(!isCalendarCollapsed)}
          selectedDay={selectedHomeDate}
          onDaySelect={setSelectedHomeDate}
        />
      </div>

      <div className={`absolute left-0 w-full px-[20px] transition-all duration-300 ${isCalendarCollapsed ? 'top-[208px]' : 'top-[512px]'}`}>
        <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full">
          <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="timer-section">
            <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-w-px relative">
              <AnimatedTimerDisplay seconds={homeTimerSecs} />
            </div>
            {/* ── 뽀모도로 토글 — knob 슬라이딩 애니메이션 ── */}
            <button
              type="button"
              aria-label={isPomodoroOn ? "뽀모도로 끄기" : "뽀모도로 켜기"}
              aria-pressed={isPomodoroOn}
              onClick={() => {
                const next = !isPomodoroOn;
                setIsPomodoroOn(next);
                if (next) setShowPomodoroSheet(true);
              }}
              data-name="toggle"
              className="relative shrink-0 active:scale-[0.97] cursor-pointer select-none"
              style={{
                width: 100, height: 31, borderRadius: 9999,
                background: isPomodoroOn ? '#9678ff' : '#d8d8d8',
                transition: 'background 0.3s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {/* 텍스트 — ON: 왼쪽, OFF: 오른쪽. 둘 다 opacity 전환 */}
              <span
                className="font-['Pretendard:Medium',sans-serif] leading-[21px] text-[14px] text-white whitespace-nowrap"
                style={{
                  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                  left: 10, opacity: isPomodoroOn ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                  pointerEvents: 'none',
                }}
              >뽀모도로</span>
              <span
                className="font-['Pretendard:Medium',sans-serif] leading-[21px] text-[14px] text-white whitespace-nowrap"
                style={{
                  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                  right: 10, opacity: isPomodoroOn ? 0 : 1,
                  transition: 'opacity 0.2s ease',
                  pointerEvents: 'none',
                }}
              >뽀모도로</span>
              {/* Knob — left:2(OFF) → left:71(ON), cubic-bezier 스프링 효과 */}
              <div
                style={{
                  position: 'absolute', top: 2, width: 27, height: 27,
                  left: isPomodoroOn ? 71 : 2,
                  transition: 'left 0.35s cubic-bezier(0.34,1.4,0.64,1)',
                  pointerEvents: 'none',
                }}
              >
                <div className="relative size-[27px]">
                  <div className="absolute inset-[-18.52%_-29.63%_-40.74%_-29.63%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 43 43">
                      <g filter="url(#pomo_knob_shadow)">
                        <path clipRule="evenodd" d={svgPaths.p1c248100} fill="white" fillRule="evenodd" />
                      </g>
                      <defs>
                        <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="43" id="pomo_knob_shadow" width="43" x="0" y="0">
                          <feFlood floodOpacity="0" result="BackgroundImageFix" />
                          <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                          <feOffset dy="3" /><feGaussianBlur stdDeviation="0.5" />
                          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
                          <feBlend in2="BackgroundImageFix" mode="normal" result="s1" />
                          <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                          <feOffset dy="3" /><feGaussianBlur stdDeviation="4" />
                          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
                          <feBlend in2="s1" mode="normal" result="s2" />
                          <feBlend in="SourceGraphic" in2="s2" mode="normal" result="shape" />
                        </filter>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Two-column layout — each column scrolls independently */}
          <div className="relative w-full flex gap-[16px] items-start">
            {/* LEFT: task list — flex-col content so overflow-y works directly */}
            <div
              className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden"
              style={{ height: isCalendarCollapsed ? 'min(calc(100dvh - 296px), 420px)' : 'min(calc(100dvh - 600px), 420px)' }}
            >
              <TaskList onTaskClick={() => setShowCharacterSelection(true)} onPendingClick={() => setShowConflict(true)} />
              {/* bottom padding so last item clears the fade */}
              <div className="h-[80px]" aria-hidden="true" />
            </div>

            {/* RIGHT: scroll wrapper (block) → inner flex row.
                overflow-y must be on a block/non-flex container to work
                when its children are laid out horizontally. */}
            <div
              className="shrink-0 overflow-y-auto [&::-webkit-scrollbar]:hidden"
              style={{ height: isCalendarCollapsed ? 'min(calc(100dvh - 296px), 420px)' : 'min(calc(100dvh - 600px), 420px)' }}
            >
              <div className="flex gap-[8px]">
                <TimeLabels />
                <div className="relative h-[528px] w-[120px]">
                  <TimeChart />
                  <div className="absolute left-0 top-0 w-full h-full flex flex-col gap-0">
                    {Array.from({ length: 24 }).map((_, idx) => (
                      <div key={idx} className="relative flex-1">
                        <div className="absolute border-[#f2f2fa] border-b border-solid inset-x-0 bottom-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 뽀모도로 설정 바텀시트 */}
      {showPomodoroSheet && (
        <PomodoroBottomSheet
          onConfirm={(settings) => {
            setPomodoroSettings(settings);
            setShowPomodoroSheet(false);
          }}
          onClose={() => {
            setShowPomodoroSheet(false);
            setIsPomodoroOn(false); // 설정 없이 닫으면 토글 OFF
          }}
        />
      )}

      {/* 오늘이 아닌 날짜 선택 시 "오늘 날짜로" 플로팅 버튼 */}
      {selectedHomeDate && selectedHomeDateStr !== null && selectedHomeDateStr !== todayStr && (
        <div className="absolute bottom-[108px] left-0 right-0 flex items-center justify-center z-[25] pointer-events-none">
          <button
            type="button"
            onClick={() => setSelectedHomeDate(null)}
            className="pointer-events-auto flex gap-[4px] h-[40px] items-center pl-[12px] pr-[16px] py-[12px] bg-white border border-[#efeff0] rounded-full active:opacity-80 transition-opacity"
            style={{ boxShadow: "0px 4px 6px rgba(0,0,0,0.32)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8C3 5.24 5.24 3 8 3C9.45 3 10.76 3.6 11.72 4.56" stroke="#333" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M10.5 2L12 4.5L9.5 5" stroke="#333" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-['Pretendard:Medium',sans-serif] text-[#333] text-[14px] leading-[21px] whitespace-nowrap">
              오늘 날짜로
            </span>
          </button>
        </div>
      )}

      <div className="absolute bottom-[8px] h-[5px] left-[32.13%] right-[32.13%]" data-name="home-indicator">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 134 5">
          <path d={svgPaths.pe1fc120} fill="var(--fill-0, black)" id="Union" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent h-[100px] pointer-events-none" />

      <div className="absolute bottom-[50px] right-[16px] z-40">
        {isMenuOpen && (
          <div className="flex flex-col gap-[8px] items-end mb-[8px] animate-in fade-in slide-in-from-bottom-4 duration-200" data-name="Floating Action Menu">
            {/* 메뉴 카드 — overflow-clip으로 rounded 처리, 아이템 간 gap 없음 */}
            <div className="overflow-clip drop-shadow-[0px_4px_10px_rgba(109,114,120,0.16)] flex flex-col rounded-[16px] shrink-0 w-[173px]" data-name="tab-row">
              {/* 사진 내보내기 */}
              <button
                className="flex items-center gap-[12px] px-[16px] py-[12px] w-full bg-white active:bg-[#efeff0] transition-colors duration-150 text-left"
                onClick={() => console.log('사진 내보내기')}
              >
                <div className="overflow-clip relative shrink-0 size-[24px]">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute border-[#333] border-[1.6px] border-solid left-1/2 size-[18px] top-1/2" />
                  <div className="absolute h-[10.5px] left-[4px] top-[9px] w-[16px]">
                    <div className="absolute inset-[-11.01%_-3.54%_-5.39%_-3.69%]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.1554 12.2222">
                        <path d={svgPaths.p41a8c80} stroke="#333333" strokeWidth="1.6" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute h-[4px] left-[13.5px] top-[11px] w-[6.5px]">
                    <div className="absolute inset-[-28.58%_-8.44%_-14.56%_-9.15%]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.64293 5.72577">
                        <path d={svgPaths.p1fbadb80} stroke="#333333" strokeWidth="1.6" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute left-[13px] size-[3px] top-[6px]">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 3">
                      <path d={svgPaths.p19ea9c00} fill="#333333" />
                    </svg>
                  </div>
                </div>
                <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[1.5] text-[#333]">사진 내보내기</p>
              </button>

              {/* 시간 수정 */}
              <button
                className="flex items-center gap-[12px] px-[16px] py-[12px] w-full bg-white active:bg-[#efeff0] transition-colors duration-150 text-left"
                onClick={() => { setIsMenuOpen(false); setShowTimeEdit(true); setTimeEditConflict(false); }}
              >
                <div className="relative shrink-0 size-[24px]">
                  <div className="absolute inset-[10.42%]">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.9998 18.9999">
                      <path d={svgPaths.p32b5000} stroke="#333333" strokeWidth="1.6" />
                      <path d={svgPaths.p1580e100} stroke="#333333" strokeWidth="1.6" />
                    </svg>
                  </div>
                  <div className="absolute h-0 left-[11px] top-[20.96px] w-[8px]">
                    <div className="absolute inset-[-0.8px_0]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 1.6">
                        <path d="M0 0.8H8" stroke="#333333" strokeWidth="1.6" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[1.5] text-[#333]">시간 수정</p>
              </button>

              {/* 타이머 추가/편집 */}
              <button
                className="flex items-center gap-[12px] px-[16px] py-[12px] w-full bg-white active:bg-[#efeff0] transition-colors duration-150 text-left"
                onClick={() => console.log('타이머 추가/편집')}
              >
                <div className="relative shrink-0 size-[24px]">
                  <div className="absolute inset-[9.17%_14.58%_8.33%_14.58%]">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 19.7998">
                      <path d={svgPaths.p3e214280} fill="#333333" />
                    </svg>
                  </div>
                </div>
                <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[1.5] text-[#333]">타이머 추가/편집</p>
              </button>
            </div>

            {/* X 닫기 버튼 */}
            <button
              className="bg-white border border-[#efeff0] border-solid cursor-pointer drop-shadow-[0px_4px_10px_rgba(95,98,129,0.16)] flex items-center justify-center rounded-full shrink-0 size-[48px] transition-all duration-150 active:scale-95"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="relative shrink-0 size-[24px]">
                <div className="absolute inset-[16.12%]">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.2627 16.2627">
                    <path clipRule="evenodd" d={svgPaths.p1169c200} fill="#333333" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p3476e000} fill="#333333" fillRule="evenodd" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        )}

        {!isMenuOpen && (
          <button
            className="bg-[#9678ff] content-stretch drop-shadow-[0px_4px_6px_rgba(109,114,120,0.16)] flex gap-[4px] items-center justify-center px-[12px] relative rounded-[999px] shrink-0 size-[48px] active:bg-[#654ec1] transition-colors hover:scale-105"
            data-name="Floating Action Button"
            onClick={() => setIsMenuOpen(true)}
          >
            <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icon24">
              <div className="absolute inset-[16.67%_16.67%_16.67%_16.66%]">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                  <g id="Group 4657">
                    <path d={svgPaths.p2890d100} id="Vector 79" stroke="white" strokeWidth="1.6" />
                    <path d="M16 7.9999H-4.76837e-07" id="Vector 80" stroke="white" strokeWidth="1.6" />
                  </g>
                </svg>
              </div>
            </div>
          </button>
        )}
      </div>
      </div>
    </OfflineProvider>
  );
}
