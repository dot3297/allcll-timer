/**
 * TimerScreen — 타이머 메인 화면
 *
 * ## 개요
 * 앱의 핵심 화면인 타이머 메인 컴포넌트.
 * 런닝 모드, 시계 모드, 뽀모도로 모드 세 가지 타이머 형태를 지원하며,
 * 탭 전환 시에도 타이머 상태가 유지된다.
 *
 * ## 주요 기능
 * - 런닝 모드: 배경 영상 + 캐릭터 애니메이션 + 공부 타이머
 * - 시계 모드: 다크 배경 + bg-circle 레이아웃 + 어제의 나 비교 바
 * - 뽀모도로 모드: 25/5분 카운트다운 + 토마토 링 시각화
 * - 사이드 아이콘: 랭킹·캐시·배경음·설정 버튼
 * - 탭 전환 시 타이머 상태 유지 (z-index 레이어링 방식)
 * - 타이머 종료 시 Confetti Lottie 애니메이션 재생
 */
import { useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import confettiLottie from "../../imports/타이머종료/Confetti.lottie";
import videoBg from "../../imports/타이머일반모드쉴래요클릭시/timer_bg.mp4";
import imgRestBg from "../../imports/타이머일반모드쉴래요클릭시/timer_girl.png";
import imgClockBgCircle from "../../imports/타이머일반모드쉴래요클릭시/timer_clock_bg_circle.svg";
import videoEndBg from "../../imports/타이머종료/timer_end_bg.mp4";
import Bubble from "../../imports/Bubble/Bubble";
import CashPopup from "./CashPopup";
import CashHistoryScreen from "./CashHistoryScreen";
import MusicBottomSheet from "./MusicBottomSheet";
import TimerSettingsSheet from "./TimerSettingsSheet";
import CharacterChangeSheet from "./CharacterChangeSheet";
import BottomNav from "./BottomNav";
import imgFomoLeaf   from "../../imports/뽀모도로토마토/fomo_leaf.svg";
import imgFomoTomato from "../../imports/뽀모도로토마토/fomo_tomato.svg";
import imgMusicOff   from "../../imports/배경음아이콘/music-off.svg";

const svgPaths = {
  p23923000: "M16.3125 6.9375L10.563 10.2603L7.6875 8.59886V15.7804L10.5624 17.4419L16.3125 14.1191V6.9375Z",
};


function ChatBubble({ isResting }: { isResting: boolean }) {
  const messages = [
    "내 자신에 대한 자신감을 잃으면,<br />온 세상이 나의 적이 된다",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (isResting) {
      // fade out → 텍스트 교체 → fade in
      setFade(false);
      setTimeout(() => {
        setFade(true);
      }, 500);
      return;
    }

    // 쉬는 상태에서 복귀하면 fade in 후 사이클 재시작
    setFade(false);
    setTimeout(() => setFade(true), 500);

    const interval = setInterval(() => {
      setFade(false); // fade out
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setFade(true); // fade in
      }, 500); // fade out 시간
    }, 3000); // 3초마다 변경

    return () => clearInterval(interval);
  }, [isResting]);

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 left-[calc(50%+0.89px)] top-[calc(50%-195px)]">
      <style>{`
        @keyframes bubbleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
      <div style={{ animation: 'bubbleFloat 2.5s ease-in-out infinite' }}>
        <div className="relative inline-flex flex-col items-center">
          {/* 텍스트 */}
          <div className="relative z-10 px-[24px] pt-[16px] pb-[26px]">
            <div
              className={`font-['Pretendard:Medium',sans-serif] text-[#333] text-[12px] text-center leading-[18px] transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
              dangerouslySetInnerHTML={{ __html: isResting ? "지금 쉬는중.." : messages[currentMessageIndex] }}
            />
          </div>
          {/* 말풍선 배경 */}
          <div className="absolute inset-0">
            <Bubble />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimerScreen({
  onNavigateToTodo,
  onNavigateToYesterday,
  onNavigateToRanking,
  onGoHome,
  isPomodoroMode = false,
  pomodoroFocusMinutes = 25,
  pomodoroBreakMinutes = 5,
}: {
  onNavigateToTodo?: () => void;
  onNavigateToYesterday?: () => void;
  onNavigateToRanking?: () => void;
  onGoHome?: (sessionSecs: number) => void;
  isPomodoroMode?: boolean;
  pomodoroFocusMinutes?: number;
  pomodoroBreakMinutes?: number;
}) {
  const [timerMode, setTimerMode] = useState<'running' | 'clock'>('running');
  const [showPopup, setShowPopup] = useState(false);
  const [showCashHistory, setShowCashHistory] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [hasSongSelected, setHasSongSelected] = useState(false);
  const [showEndPopup, setShowEndPopup] = useState(false);
  const [showSubjectSheet, setShowSubjectSheet] = useState(false);
  const [selectedTaskName, setSelectedTaskName] = useState("한국사");
  const [isStopped, setIsStopped] = useState(false);
  const [achievementCount, setAchievementCount] = useState(0);
  const [cashCount, setCashCount] = useState(0);
  const [cashBalance, setCashBalance] = useState(35); // 현재 보유 캐시
  const [showMusicSheet, setShowMusicSheet] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [mainTimer, setMainTimer] = useState(0);
  const [subjectTimer, setSubjectTimer] = useState(0);
  const [totalTimer, setTotalTimer] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  // 뽀모도로 전용 state
  const [pomodoroCount,    setPomodoroCount]    = useState(0);
  const [pomodoroSecsLeft, setPomodoroSecsLeft] = useState(pomodoroFocusMinutes * 60);
  const [pomodoroPhase,    setPomodoroPhase]    = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    const interval = setInterval(() => {
      // 종료 팝업이 떠 있으면 모든 타이머 정지
      if (isStopped) return;

      if (isResting) {
        // 휴식 중일 때는 휴식 타이머만 증가
        setRestTimer((prev) => prev + 1);
      } else {
        // 공부 중일 때는 모든 타이머 증가
        setMainTimer((prev) => prev + 1);
        setSubjectTimer((prev) => prev + 1);
        setTotalTimer((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isResting, isStopped]);

  const handleRestToggle = () => {
    if (isResting) {
      // 휴식 종료 -> 공부 재개
      setIsResting(false);
      setRestTimer(0);
    } else {
      // 휴식 시작
      setIsResting(true);
      setRestTimer(0);
    }
  };

  // 팝업 등장 후 획득 업적·캐시 카운트업 애니메이션
  useEffect(() => {
    if (!showEndPopup) {
      setAchievementCount(0);
      setCashCount(0);
      return;
    }
    // 팝업 등장 모션(0.35s) 이후 시작
    const timeout = setTimeout(() => {
      const DURATION = 900; // ms
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / DURATION, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        setAchievementCount(Math.round(eased * 10));
        setCashCount(Math.round(eased * 5));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 350);
    return () => clearTimeout(timeout);
  }, [showEndPopup]);

  // 뽀모도로 카운트다운
  useEffect(() => {
    if (!isPomodoroMode || isStopped) return;
    const interval = setInterval(() => {
      setPomodoroSecsLeft(prev => {
        if (prev <= 1) {
          if (pomodoroPhase === 'focus') {
            setPomodoroCount(c => c + 1);
            setPomodoroPhase('break');
            return pomodoroBreakMinutes * 60;
          } else {
            setPomodoroPhase('focus');
            return pomodoroFocusMinutes * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPomodoroMode, pomodoroPhase, pomodoroFocusMinutes, pomodoroBreakMinutes, isStopped]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatMMSS = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 뽀모도로 원형 진행 링
  const RING_SIZE   = 60;
  const RING_STROKE = 4;
  const RING_R      = (RING_SIZE - RING_STROKE) / 2; // 28
  const RING_CIRC   = 2 * Math.PI * RING_R;
  const pomodoroTotalSecs = pomodoroPhase === 'focus' ? pomodoroFocusMinutes * 60 : pomodoroBreakMinutes * 60;
  const ringOffset = RING_CIRC * (pomodoroSecsLeft / (pomodoroTotalSecs || 1)); // 0=full, CIRC=empty

  return (
    <div className="h-full relative w-full bg-[var(--color-bg-weak)]" data-name="타이머_일반모드">
      {/* 배경 — 런닝: 영상 / 쉴래요: 정지 이미지 / 시계: 다크 + bg-circle */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 런닝 모드 비디오 — 시계/종료/쉴래요 상태면 숨김 */}
        <video
          src={videoBg}
          className={`absolute h-[82.1%] left-0 max-w-none top-[-13.1%] w-full object-cover transition-opacity duration-500 ${(isResting || isStopped || timerMode === 'clock') ? 'opacity-0' : 'opacity-100'}`}
          autoPlay
          loop
          muted
          playsInline
        />
        {/* 쉴래요 모드 이미지 */}
        <img
          alt=""
          src={imgRestBg}
          className={`absolute h-[82.1%] left-0 max-w-none top-[-13.1%] w-full object-cover transition-opacity duration-500 ${isResting && timerMode === 'running' ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* 종료 모드 비디오 */}
        <video
          src={videoEndBg}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isStopped ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* 시계 모드 bg-circle 데코 */}
      {timerMode === 'clock' && !isStopped && (
        <img
          src={imgClockBgCircle}
          alt=""
          className="absolute -translate-x-1/2 pointer-events-none"
          style={{ left: '50%', top: 219, width: 280, height: 280 }}
        />
      )}

      {/* 배경 그라데이션 — 시계 모드에선 숨김 */}
      {timerMode === 'running' && (
        <div className="absolute h-[238px] left-0 top-0 w-full" style={{ backgroundImage: "linear-gradient(179.92deg, rgb(13, 13, 62) 0.10971%, rgba(13, 13, 62, 0) 99.891%)" }} />
      )}

      {/* 종료 상태 하단 사각형 #314767 — 377×314px */}
      <div
        className={`absolute bottom-0 left-0 w-full transition-opacity duration-500 ${isStopped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ height: 314, background: '#314767', width: '100%' }}
      />

      {/* 말풍선 — 종료 후 또는 시계 모드에선 숨김 */}
      <div className={`transition-opacity duration-500 ${(isStopped || timerMode === 'clock') ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <ChatBubble isResting={isResting} />
      </div>

      {/* "45분만~" 전체 폭 배너 — backdrop blur 반투명 바 + 끊김 없는 좌측 스크롤 */}
      <div className="absolute top-[42px] left-0 w-full h-[33px] backdrop-blur-[50px] bg-[rgba(255,255,255,0.1)] overflow-hidden flex items-center">
        <style>{`
          @keyframes bannerScroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        {/*
          끊김 없는 루프: 동일한 span 두 개를 이어붙이고 -50% 이동.
          각 span에 동일한 pl/pr을 주어 루프 접합 지점의 간격이 일정하게 유지된다.
        */}
        <div
          className="flex items-center whitespace-nowrap"
          style={{ animation: 'bannerScroll 20s linear infinite', willChange: 'transform' }}
        >
          {["a", "b"].map((key) => (
            <span
              key={key}
              className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-white pl-[24px] pr-[60px]"
            >
              45분만 더 달리면 3조로 올라가요!
            </span>
          ))}
        </div>
      </div>

      {/* 모드 스위처 — top 91px 중앙 */}
      <div className="absolute top-[91px] left-1/2 -translate-x-1/2 backdrop-blur-[20px] bg-white/10 rounded-[999px] flex items-center p-[4px] shrink-0">
        <button
          type="button"
          onClick={() => setTimerMode('running')}
          className={`h-[32px] px-[16px] rounded-[999px] flex items-center justify-center transition-all duration-200 ${timerMode === 'running' ? 'bg-[var(--color-bg-brand)]' : 'opacity-30'}`}
        >
          <p className="font-['Pretendard:SemiBold',sans-serif] text-[14px] leading-[21px] text-white whitespace-nowrap">런닝</p>
        </button>
        <button
          type="button"
          onClick={() => setTimerMode('clock')}
          className={`h-[32px] px-[16px] rounded-[999px] flex items-center justify-center transition-all duration-200 ${timerMode === 'clock' ? 'bg-[var(--color-bg-brand)]' : 'opacity-30'}`}
        >
          <p className="font-['Pretendard:SemiBold',sans-serif] text-[14px] leading-[21px] text-white whitespace-nowrap">시계</p>
        </button>
      </div>

      {/* 우측 사이드 아이콘 컬럼 — top 91px */}
      <div className="absolute top-[91px] right-[16px] flex flex-col gap-[12px] items-end">

        {/* 랭킹 — Figma 7162-112496: icon-wrap left-[8px] top-0 / label-wrap left-0 top-[27px] */}
        <button
          type="button"
          onClick={onNavigateToRanking}
          className="inline-grid grid-cols-[max-content] grid-rows-[max-content] place-items-start relative shrink-0 active:scale-95 transition-transform"
          aria-label="랭킹"
        >
          {/* 흰 원 "3" — left-[8px] top-0 */}
          <div className="col-1 row-1 ml-[8px] mt-0 bg-white rounded-full size-[32px] overflow-hidden relative pointer-events-none">
            <svg
              viewBox="0 0 10.9621 15.8125"
              fill="none"
              className="absolute"
              style={{ left: 10.15, top: 7.56, width: 10.96, height: 15.81 }}
            >
              <path
                d="M2.58506 0.77216C2.98792 0.525965 3.6258 0.335723 4.49867 0.201434C5.37155 0.0671445 6.06538 0 6.58015 0C8.12447 0 9.27712 0.324531 10.0381 0.973593C10.7991 1.62266 11.09 2.57387 10.911 3.82723C10.6871 5.39393 9.80308 6.59134 8.25876 7.41945C9.93737 7.95661 10.6312 9.16521 10.3402 11.0452C10.1388 12.6567 9.46736 13.8765 8.3259 14.7046C7.29636 15.4432 5.94228 15.8125 4.26367 15.8125C2.96554 15.8125 1.71218 15.488 0.503583 14.8389C0.257387 14.727 0.0895258 14.6599 0 14.6375L1.14145 12.3881C1.2086 12.4105 1.3317 12.4777 1.51075 12.5896C1.71218 12.6791 1.94719 12.7686 2.21576 12.8581C2.95435 13.1043 3.64818 13.2274 4.29724 13.2274C4.96868 13.2274 5.5506 13.0596 6.04299 12.7239C6.53539 12.3658 6.83754 11.8062 6.94944 11.0452C7.08373 10.2843 6.94944 9.74712 6.54658 9.43378C6.16609 9.12044 5.69608 8.96377 5.13655 8.96377C4.4651 8.96377 3.79366 8.96377 3.12221 8.96377L3.45794 6.68086H4.26367C4.93511 6.68086 5.56179 6.59134 6.14371 6.41229C6.18847 6.36753 6.278 6.30038 6.41229 6.21085C6.56896 6.09895 6.72563 5.95347 6.8823 5.77442C7.21802 5.37155 7.43064 4.87916 7.52017 4.29724C7.6097 3.71532 7.47541 3.27888 7.1173 2.98792C6.7592 2.69697 6.32276 2.55149 5.80799 2.55149C5.3156 2.55149 4.91273 2.58506 4.59939 2.6522C4.30843 2.69697 4.03985 2.75292 3.79366 2.82006C3.32365 2.90959 2.99912 2.99912 2.82006 3.08864L2.58506 0.77216Z"
                fill="var(--color-fg-text-solid-muted)"
              />
            </svg>
          </div>
          {/* 보라 뱃지 — left-0 top-[27px] */}
          <div className="col-1 row-1 ml-0 mt-[27px] bg-[var(--color-bg-brand-hover)] flex items-center justify-center px-[8px] py-[2px] rounded-full w-[48px] pointer-events-none">
            <p className="font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-white whitespace-nowrap">랭킹</p>
          </div>
        </button>

        {/* 캐시 — 코인 아이콘 배경 + 잔액 텍스트 오버레이 */}
        <button
          type="button"
          onClick={() => setShowPopup(true)}
          className="inline-grid grid-cols-[max-content] grid-rows-[max-content] place-items-start relative shrink-0 active:scale-95 transition-transform"
          aria-label="캐시"
        >
          {/* 흰 원 — 캐시 금액 텍스트 (Figma 7162-112507: #333, top 7.5px) */}
          <div className="col-1 row-1 ml-[8px] mt-0 bg-white rounded-full size-[32px] overflow-hidden relative pointer-events-none">
            <p
              className="absolute font-['Pretendard:SemiBold',sans-serif] text-[12px] leading-[18px] text-[var(--color-fg-text-solid-muted)] whitespace-nowrap overflow-hidden text-ellipsis text-right"
              style={{ left: 27.5, top: 7.5, transform: 'translateX(-100%)' }}
            >
              +{Math.min(cashBalance, 999)}
            </p>
          </div>
          {/* 보라 뱃지 */}
          <div className="col-1 row-1 ml-0 mt-[27px] bg-[var(--color-bg-brand-hover)] flex items-center justify-center px-[8px] py-[2px] rounded-full w-[48px] pointer-events-none">
            <p className="font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-white whitespace-nowrap">캐시</p>
          </div>
        </button>

        {/* 배경음 */}
        <button
          type="button"
          onClick={() => setShowMusicSheet(true)}
          className="inline-grid grid-cols-[max-content] grid-rows-[max-content] place-items-start relative shrink-0 active:scale-95 transition-transform"
          aria-label="배경음"
        >
          <div className="col-1 row-1 ml-[8px] mt-0 bg-white rounded-full size-[32px] overflow-hidden flex items-center justify-center pointer-events-none">
            {hasSongSelected ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.5 2.5V12.9167C17.5 13.6902 17.1927 14.4321 16.6457 14.9791C16.0987 15.526 15.3569 15.8333 14.5833 15.8333C13.8098 15.8333 13.0679 15.526 12.5209 14.9791C11.974 14.4321 11.6667 13.6902 11.6667 12.9167C11.6667 12.1431 11.974 11.4013 12.5209 10.8543C13.0679 10.3073 13.8098 10 14.5833 10C15.0333 10 15.4583 10.1 15.8333 10.2833V5.39167L7.5 7.16667V14.5833C7.5 15.3569 7.19271 16.0987 6.64573 16.6457C6.09875 17.1927 5.35688 17.5 4.58333 17.5C3.80979 17.5 3.06792 17.1927 2.52094 16.6457C1.97396 16.0987 1.66667 15.3569 1.66667 14.5833C1.66667 13.8098 1.97396 13.0679 2.52094 12.5209C3.06792 11.974 3.80979 11.6667 4.58333 11.6667C5.03333 11.6667 5.45833 11.7667 5.83333 11.95V5L17.5 2.5Z" fill="var(--color-fg-text-solid-muted)"/>
              </svg>
            ) : (
              <img src={imgMusicOff} alt="배경음 없음" width={20} height={20} />
            )}
          </div>
          <div className="col-1 row-1 ml-0 mt-[27px] bg-[var(--color-bg-brand-hover)] flex items-center justify-center px-[8px] py-[2px] rounded-full w-[48px] pointer-events-none">
            <p className="font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-white whitespace-nowrap">배경음</p>
          </div>
        </button>

        {/* 설정 */}
        <button
          type="button"
          onClick={() => setShowSettingsSheet(true)}
          className="inline-grid grid-cols-[max-content] grid-rows-[max-content] place-items-start relative shrink-0 active:scale-95 transition-transform"
          aria-label="설정"
        >
          <div className="col-1 row-1 ml-[8px] mt-0 bg-white rounded-full size-[32px] overflow-hidden flex items-center justify-center pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="var(--color-fg-text-solid-muted)" />
            </svg>
          </div>
          <div className="col-1 row-1 ml-0 mt-[27px] bg-[var(--color-bg-brand-hover)] flex items-center justify-center px-[8px] py-[2px] rounded-full w-[48px] pointer-events-none">
            <p className="font-['Pretendard:Medium',sans-serif] text-[12px] leading-[18px] text-white whitespace-nowrap">설정</p>
          </div>
        </button>

      </div>

      {/* 시계 모드 time-info — Figma 7179-246255: size-full justify-center */}
      {timerMode === 'clock' && !isStopped && !isPomodoroMode && (
        <div
          className="absolute left-0 right-0 top-0 flex flex-col gap-[2px] items-center justify-center px-[16px] pointer-events-none"
          style={{ height: 719 }}
        >
          {/* 과목 선택 버튼 */}
          <button
            type="button"
            onClick={() => setShowSubjectSheet(true)}
            className="flex h-[36px] items-center justify-center gap-[4px] pl-[16px] pr-[8px] py-[8px] rounded-[8px] shrink-0 active:bg-white/10 transition-colors pointer-events-auto"
          >
            <p className="font-['Pretendard:SemiBold',sans-serif] leading-[28px] text-[20px] text-[var(--color-fg-text-weak)] text-center whitespace-nowrap">
              {selectedTaskName}
            </p>
            <svg viewBox="0 0 10 6" fill="none" className="w-[10px] h-[6px] shrink-0">
              <path d="M1 1L5 5L9 1" stroke="#F9F9FA" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* 메인 타이머 */}
          <p className="font-['Pretendard:SemiBold',sans-serif] leading-[56px] text-[44px] text-center text-white w-full">
            {formatTime(mainTimer)}
          </p>
          {/* sub-time-row — Figma w-[132px] */}
          <div className="flex items-center justify-center shrink-0 w-full">
            <div className="w-[132px] flex flex-col items-start">
              <div className="flex items-center justify-center py-[4px] w-full">
                <p className="flex-1 font-['Pretendard:Medium',sans-serif] leading-[21px] text-[14px] text-[var(--color-fg-text-weak)] text-center">{selectedTaskName}</p>
              </div>
              <p className="font-['Pretendard:Medium',sans-serif] leading-[28px] text-[20px] text-center text-white w-full">{formatTime(subjectTimer)}</p>
            </div>
            <div className="w-[132px] flex flex-col items-start">
              <div className="flex items-center justify-center py-[4px] w-full">
                <p className="flex-1 font-['Pretendard:Medium',sans-serif] leading-[21px] text-[14px] text-[var(--color-fg-text-weak)] text-center">오늘 총 시간</p>
              </div>
              <p className="font-['Pretendard:Medium',sans-serif] leading-[28px] text-[20px] text-white text-center w-full">{formatTime(totalTimer)}</p>
            </div>
          </div>
        </div>
      )}


      {/* 시계 모드 비교 바 — 버튼 위 20px (z-10으로 패널 위에 표시) */}
      {timerMode === 'clock' && !isStopped && (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center px-[16px] py-[8px] rounded-[999px] z-10"
          style={{ bottom: 'calc(93px + 24px + 56px + 20px)', border: '1px solid var(--color-border-brand)', background: 'rgba(150,120,255,0.2)' }}
        >
          <p className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-white whitespace-nowrap">
            어제의 나보다 +{formatTime(Math.max(0, mainTimer - 5094))} 앞서는중
          </p>
        </div>
      )}

      {/* 타이머 컨트롤 영역 — 종료 후 숨김 */}
      <div
        className={`absolute bg-[var(--color-bg-weak)] bottom-0 left-0 content-stretch flex flex-col justify-between items-center px-[16px] pt-[16px] w-full rounded-tl-[20px] rounded-tr-[20px] transition-opacity duration-500 ${isStopped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ paddingBottom: 'calc(93px + 24px)', height: 355 }}
      >
        {isPomodoroMode ? (
          <>
            {/* ── 뽀모도로 모드 ──────────────────────────────────────── */}
            <div className="content-stretch flex flex-col gap-[13px] items-center relative shrink-0 w-full">
              {/* 토마토 배지 + 카운트다운 — 가로 배치 */}
              <div className="flex gap-[8px] items-center justify-center relative shrink-0 w-full">
                {/* 토마토 + 진행 링 (60×60) */}
                <div className="relative shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
                  {/* 원형 진행 링 — 시계 방향으로 채워짐 */}
                  <svg
                    className="absolute inset-0"
                    width={RING_SIZE}
                    height={RING_SIZE}
                    style={{ transform: 'rotate(-90deg)' }}
                  >
                    {/* 진행 */}
                    <circle
                      cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R}
                      fill="none"
                      stroke="var(--color-bg-brand)"
                      strokeWidth={RING_STROKE}
                      strokeDasharray={RING_CIRC}
                      strokeDashoffset={ringOffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.95s linear' }}
                    />
                  </svg>
                  {/* 토마토 아이콘 (48×48, 링 안쪽 중앙) */}
                  <div
                    className="absolute"
                    style={{ width: 48, height: 48, top: (RING_SIZE - 48) / 2, left: (RING_SIZE - 48) / 2 }}
                  >
                    {/* 줄기/잎 — 퍼플 곡선, top 위치 */}
                    <div className="absolute" style={{ left: 23.04, top: 0.02, width: 16.93, height: 8.867 }}>
                      <img alt="" className="block max-w-none size-full" src={imgFomoLeaf} />
                    </div>
                    {/* 토마토 바디 — 24×24, 중앙 */}
                    <div className="absolute overflow-clip" style={{ left: 12, top: 12, width: 24, height: 24 }}>
                      <div className="absolute inset-[12.5%_6.37%_9.44%_6.25%]">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFomoTomato} />
                      </div>
                    </div>
                    {/* 카운트 배지 — 오른쪽 하단 */}
                    <div className="absolute bg-[#f79479] flex items-center justify-center px-[8px] py-[2px] rounded-full" style={{ left: 26, top: 26 }}>
                      <p className="font-['Pretendard:SemiBold',sans-serif] leading-[18px] text-[12px] text-[var(--color-fg-text-solid-muted)] whitespace-nowrap">
                        {pomodoroPhase === 'focus' ? pomodoroCount + 1 : pomodoroCount}
                      </p>
                    </div>
                  </div>
                </div>
                {/* 카운트다운 */}
                <p className="font-['Pretendard:SemiBold',sans-serif] leading-[56px] text-[44px] text-white tabular-nums">
                  {formatMMSS(pomodoroSecsLeft)}
                </p>
              </div>
              {/* 통계 — 과목 타이머 + 오늘 총 시간 */}
              <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
                <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-w-px relative">
                  <button
                    type="button"
                    onClick={() => setShowSubjectSheet(true)}
                    className="content-stretch flex h-[36px] items-center justify-center overflow-clip px-[12px] py-[8px] relative rounded-[8px] shrink-0 active:bg-white/10 transition-colors"
                  >
                    <div className="content-stretch flex gap-[2px] items-center relative shrink-0">
                      <p className="font-['Pretendard:Medium',sans-serif] leading-[21px] not-italic relative shrink-0 text-[14px] text-[var(--color-fg-text-weak)] text-center whitespace-nowrap">{selectedTaskName}</p>
                      <div className="relative shrink-0 size-[16px] flex items-center justify-center">
                        <svg viewBox="0 0 10 6" fill="none" className="w-[10px] h-[6px]">
                          <path d="M1 1L5 5L9 1" stroke="#F9F9FA" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </button>
                  <p className="font-['Pretendard:Medium',sans-serif] leading-[28px] min-w-full not-italic relative shrink-0 text-[20px] text-white text-center w-[min-content]">
                    {formatTime(subjectTimer)}
                  </p>
                </div>
                <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
                  <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-start min-w-px relative">
                    <div className="content-stretch flex h-[36px] items-center justify-center py-[4px] relative shrink-0 w-full">
                      <p className="font-['Pretendard:Medium',sans-serif] flex-[1_0_0] leading-[21px] min-w-px not-italic relative text-[14px] text-[var(--color-fg-text-weak)] text-center">
                        오늘 총 시간
                      </p>
                    </div>
                    <p className="font-['Pretendard:Medium',sans-serif] leading-[28px] not-italic relative shrink-0 text-[20px] text-white text-center w-full">
                      {formatTime(totalTimer)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* 종료 버튼 (단일 · full-width) */}
            <button
              onClick={() => { setIsStopped(true); setShowEndPopup(true); }}
              className="w-full h-[56px] bg-[var(--color-fg-text-disable)] rounded-[8px] cursor-pointer active:bg-[#404040] transition-colors"
            >
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] text-[16px] text-center text-white">종료</p>
              </div>
            </button>
          </>
        ) : (
          <>
            {/* ── 일반 모드 ────────────────────────────────────────── */}
            {/* 런닝 모드: time-info를 패널 안에 표시 */}
            {/* 런닝 모드 time-info */}
            {timerMode === 'running' && (
              <div className="content-stretch flex flex-col gap-[2px] items-center relative shrink-0 w-full">
                {/* ① 과목 선택 버튼 */}
                <button
                  type="button"
                  onClick={() => setShowSubjectSheet(true)}
                  className="flex h-[36px] items-center justify-center gap-[4px] px-[12px] py-[8px] rounded-[8px] shrink-0 active:bg-white/10 transition-colors"
                >
                  <p className={`font-['Pretendard:SemiBold',sans-serif] leading-[28px] text-[20px] text-center whitespace-nowrap ${isResting ? 'text-[var(--color-fg-text-muted)]' : 'text-[var(--color-fg-text-weak)]'}`}>
                    {selectedTaskName}
                  </p>
                  <svg viewBox="0 0 10 6" fill="none" className="w-[10px] h-[6px] shrink-0">
                    <path d="M1 1L5 5L9 1" stroke={isResting ? 'var(--color-fg-text-muted)' : 'var(--color-fg-text-weak)'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {/* ② 메인 타이머 */}
                <p className="font-['Pretendard:SemiBold',sans-serif] leading-[56px] text-[44px] text-center text-white">
                  {formatTime(isResting ? restTimer : mainTimer)}
                </p>
                {/* ③ sub-time-row */}
                <div className="flex gap-[12px] items-start justify-center shrink-0 w-full mt-[14px]">
                  {/* 과목 — 쉴래요 시 #b6b8b9 (Figma 7183-261865) */}
                  <div className="w-[120px] flex flex-col items-center gap-0">
                    <p className={`font-['Pretendard:Medium',sans-serif] leading-[21px] text-[14px] text-center whitespace-nowrap ${isResting ? 'text-[var(--color-fg-text-muted)]' : 'text-[var(--color-fg-text-weak)]'}`}>{selectedTaskName}</p>
                    <p className={`font-['Pretendard:Medium',sans-serif] leading-[28px] text-[20px] text-center ${isResting ? 'text-[var(--color-fg-text-muted)]' : 'text-white'}`}>{formatTime(subjectTimer)}</p>
                  </div>
                  <div className="w-[120px] flex flex-col items-center gap-0">
                    <p className="font-['Pretendard:Medium',sans-serif] leading-[21px] text-[14px] text-[var(--color-fg-text-weak)] text-center whitespace-nowrap">오늘 총 시간</p>
                    <p className="font-['Pretendard:Medium',sans-serif] leading-[28px] text-[20px] text-white text-center">{formatTime(totalTimer)}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full mt-auto">
              <button
                disabled={isResting}
                onClick={() => { if (!isResting) { setIsStopped(true); setShowEndPopup(true); } }}
                className={`flex-[1_0_0] h-[56px] min-w-px relative rounded-[8px] ${isResting ? 'bg-[var(--color-bg-muted)] cursor-not-allowed' : 'bg-[var(--color-fg-text-disable)] cursor-pointer active:bg-[#404040] transition-colors'}`}
              >
                <div className="flex flex-row items-center justify-center size-full">
                  <p className={`font-['Pretendard:Medium',sans-serif] leading-[24px] text-[16px] text-center ${isResting ? 'text-[var(--color-fg-text-disable)]' : 'text-white'}`}>종료</p>
                </div>
              </button>
              <button
                onClick={handleRestToggle}
                className="bg-[var(--color-bg-brand)] flex-[1_0_0] h-[56px] min-w-px relative rounded-[8px] cursor-pointer active:bg-[var(--color-bg-brand-pressed)] transition-colors"
              >
                <div className="flex flex-row items-center justify-center size-full">
                  <p className="font-['Pretendard:Medium',sans-serif] leading-[24px] text-[16px] text-center text-white">
                    {isResting ? '그만 쉴래요' : '쉴래요'}
                  </p>
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 바텀 네비게이션 — 종료 후 숨김 */}
      <div className={`absolute bottom-0 left-0 w-full transition-opacity duration-500 ${isStopped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <BottomNav
          activeTab="timer"
          onYesterday={onNavigateToYesterday}
          onTodo={onNavigateToTodo}
        />
      </div>

      {/* 캐시 팝업 */}
      {showPopup && (
        <CashPopup
          onClose={() => setShowPopup(false)}
          onCashHistory={() => {
            setShowPopup(false);
            setShowCashHistory(true);
          }}
        />
      )}

      {/* 캐시 히스토리 페이지 */}
      {showCashHistory && (
        <div className="fixed inset-0 z-[60] bg-[var(--color-bg-weak)]">
          <CashHistoryScreen onBack={() => setShowCashHistory(false)} />
        </div>
      )}

      {/* 종료 팝업 */}
      {showEndPopup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          {/* dim */}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: 0.5 }}
            onClick={() => setShowEndPopup(false)}
          />
          {/* popup card */}
          <style>{`
            @keyframes popIn {
              from { transform: scale(0.75); opacity: 0; }
              to   { transform: scale(1);    opacity: 1; }
            }
          `}</style>
          <div
            className="relative bg-[var(--color-bg-weak)] rounded-[16px] p-[24px] w-[350px] flex flex-col gap-[16px] items-center"
            style={{ animation: "popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
          >
            {/* 컨페티 로띠 — 타이틀 텍스트 상단에 한 번만 재생 (3x 사이즈) */}
            <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-10" style={{ top: -180, width: 1050, height: 360 }}>
              <DotLottieReact src={confettiLottie} autoplay loop={false} style={{ width: "100%", height: "100%" }} />
            </div>
            {/* texts */}
            <div className="flex flex-col gap-[16px] items-center w-full">
              <p className="font-['Pretendard:Medium',sans-serif] text-[18px] leading-[27px] text-white w-full text-center">
                기록 성공 했어요!
              </p>
              <p className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-white w-full text-center">
                캐시는 올클 스토어에서 사용할 수 있어요
              </p>
              {/* stats box */}
              <div className="bg-[var(--color-bg-muted)] rounded-[12px] p-[16px] flex items-center justify-center gap-px w-full">
                <div className="flex flex-col items-center flex-1">
                  <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[var(--color-fg-text-subtle)] w-full text-center">집중 시간</p>
                  <p className="font-['Pretendard:SemiBold',sans-serif] text-[20px] leading-[28px] text-white w-full text-center tabular-nums">
                    {formatTime(mainTimer)}
                  </p>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[var(--color-fg-text-subtle)] w-full text-center">획득 업적</p>
                  <p className="font-['Pretendard:SemiBold',sans-serif] text-[20px] leading-[28px] text-white w-full text-center tabular-nums">+{achievementCount}</p>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[var(--color-fg-text-subtle)] w-full text-center">획득 캐시</p>
                  <p className="font-['Pretendard:SemiBold',sans-serif] text-[20px] leading-[28px] text-white w-full text-center tabular-nums">+{cashCount}</p>
                </div>
              </div>
            </div>
            {/* confirm button */}
            <button
              onClick={() => {
                setShowEndPopup(false);
                setIsStopped(false);
                setMainTimer(0);
                setSubjectTimer(0);
                setRestTimer(0);
                setIsResting(false);
                // 뽀모도로 초기화
                setPomodoroCount(0);
                setPomodoroPhase('focus');
                setPomodoroSecsLeft(pomodoroFocusMinutes * 60);
                // 세션 시간을 홈으로 전달해 누적
                const sessionSecs = mainTimer;
                // 타이머 홈으로 이동
                onGoHome?.(sessionSecs);
              }}
              className="bg-[var(--color-bg-brand)] w-full h-[44px] rounded-[8px] flex items-center justify-center cursor-pointer active:bg-[var(--color-bg-brand-pressed)] transition-colors"
            >
              <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-white text-center">확인</p>
            </button>
          </div>
        </div>
      )}

      {/* 음악 바텀시트 */}
      {showMusicSheet && (
        <MusicBottomSheet
          onClose={() => setShowMusicSheet(false)}
          onPlayingChange={(playing) => setIsMusicOn(playing)}
          onSongSelected={(selected) => setHasSongSelected(selected)}
        />
      )}

      {/* 설정 바텀시트 */}
      {showSettingsSheet && (
        <TimerSettingsSheet
          onClose={() => setShowSettingsSheet(false)}
          onCharacterChange={() => {
            setShowSettingsSheet(false);
            setShowCharacterSheet(true);
          }}
        />
      )}

      {/* 캐릭터 변경 바텀시트 */}
      {showCharacterSheet && (
        <CharacterChangeSheet onClose={() => setShowCharacterSheet(false)} />
      )}

      {/* 과목 변경 바텀시트 */}
      {showSubjectSheet && (
        <SubjectChangeSheet
          tasks={SUBJECT_TASKS}
          selectedName={selectedTaskName}
          onSelect={(name) => {
            setSelectedTaskName(name);
            setSubjectTimer(0);
            setShowSubjectSheet(false);
          }}
          onClose={() => setShowSubjectSheet(false)}
        />
      )}
    </div>
  );
}

// ── 과목 변경 데이터 ───────────────────────────────────────────────────────────
const SUBJECT_TASKS: { name: string; time: string; color: string }[] = [
  { name: "한국사",        time: "01:39:01", color: "#F8D884" },
  { name: "국어 인강",     time: "01:22:15", color: "#F8D884" },
  { name: "수학 문제풀이", time: "00:58:30", color: "#F8D884" },
  { name: "영어 단어 암기", time: "00:45:00", color: "#78A6FF" },
  { name: "과학 개념 정리", time: "01:10:22", color: "#F8D884" },
  { name: "어쩌구",        time: "00:30:00", color: "#A0F1C1" },
  { name: "유산소",        time: "00:52:17", color: "#A0F1C1" },
  { name: "독서",          time: "01:05:44", color: "#78A6FF" },
  { name: "명상",          time: "00:20:00", color: "#A0F1C1" },
  { name: "피아노 연습",   time: "00:40:10", color: "#F8D884" },
  { name: "코딩 공부",     time: "02:00:00", color: "#A0F1C1" },
  { name: "수학 오답노트", time: "01:15:00", color: "#F8D884" },
  { name: "영어 회화",     time: "00:35:20", color: "#78A6FF" },
  { name: "논문 읽기",     time: "01:30:00", color: "#78A6FF" },
  { name: "드로잉",        time: "00:55:30", color: "#D9D2BF" },
  { name: "플래너 정리",   time: "00:18:00", color: "#D9D2BF" },
  { name: "일기 쓰기",     time: "00:22:45", color: "#D9D2BF" },
  { name: "스트레칭",      time: "00:15:00", color: "#A0F1C1" },
  { name: "한국사 공부",   time: "00:48:33", color: "#F8D884" },
  { name: "과학 실험",     time: "00:50:00", color: "#A0F1C1" },
  { name: "사회 정리",     time: "00:42:00", color: "#78A6FF" },
  { name: "국어 문법",     time: "00:37:15", color: "#F8D884" },
  { name: "수학 개념",     time: "01:00:00", color: "#F8D884" },
  { name: "영어 독해",     time: "00:50:30", color: "#78A6FF" },
  { name: "물리 공부",     time: "01:05:00", color: "#D9D2BF" },
  { name: "화학 공부",     time: "00:55:00", color: "#D9D2BF" },
  { name: "지구과학",      time: "00:40:00", color: "#A0F1C1" },
  { name: "생명과학",      time: "00:45:30", color: "#A0F1C1" },
  { name: "기타 연습",     time: "00:30:00", color: "#D9D2BF" },
  { name: "요리 공부",     time: "00:25:00", color: "#A0F1C1" },
];

// ── 과목 변경 바텀시트 ─────────────────────────────────────────────────────────
function SubjectChangeSheet({
  tasks,
  selectedName,
  onSelect,
  onClose,
}: {
  tasks: { name: string; time: string; color: string }[];
  selectedName: string;
  onSelect: (name: string) => void;
  onClose: () => void;
}) {
  const minHeight = Math.round(window.innerHeight * 0.6);
  const maxHeight = Math.round(window.innerHeight * 0.9);
  const [height, setHeight] = useState(minHeight);

  // 콘텐츠 영역에서 스크롤을 시도하면 최대 높이로 확장
  const handleScrollAttempt = (e: React.WheelEvent | React.TouchEvent) => {
    if (height < maxHeight) {
      e.preventDefault();
      setHeight(maxHeight);
    }
  };

  // 헤더 75px + safe area 34px
  const listMaxH = height - 75 - 34;

  return (
    <>
      {/* 딤 */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* 시트 */}
      <div
        className="fixed bottom-0 left-0 w-full bg-[var(--color-bg-weak)] rounded-tl-[16px] rounded-tr-[16px] z-50 transition-all duration-300 flex flex-col"
        style={{ height: `${height}px` }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-[16px] pt-[24px] pb-[10px] shrink-0">
          <p className="font-['Pretendard:SemiBold',sans-serif] text-[18px] leading-[27px] text-[var(--color-fg-text-weak)]">
            과목 변경
          </p>
          <button
            type="button"
            onClick={onClose}
            className="relative size-[24px] cursor-pointer active:scale-95 transition-transform"
            aria-label="닫기"
          >
            <div className="absolute inset-[16.12%]">
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.2627 16.2627">
                <path clipRule="evenodd" d="M1.13137 1.01465e-06L16.2627 15.1314L15.1314 16.2627L5.91658e-07 1.13137L1.13137 1.01465e-06Z" fill="white" fillRule="evenodd" />
                <path clipRule="evenodd" d="M6.61413e-07 15.1314L15.1314 0L16.2627 1.13137L1.13137 16.2627L6.61413e-07 15.1314Z" fill="white" fillRule="evenodd" />
              </svg>
            </div>
          </button>
        </div>

        {/* 타이머 목록 */}
        <div
          onWheel={handleScrollAttempt}
          onTouchMove={handleScrollAttempt}
          className={`px-[16px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
            height >= maxHeight ? "overflow-y-auto" : "overflow-y-hidden"
          }`}
          style={{ maxHeight: `${listMaxH}px` }}
        >
          {tasks.map((task, idx) => {
            const isSelected = task.name === selectedName;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelect(task.name)}
                className={`w-full flex items-center gap-[8px] text-left transition-colors active:opacity-70 ${
                  isSelected
                    ? "bg-[var(--color-bg-muted)] rounded-[8px] px-[12px] py-[12px] my-[2px]"
                    : "py-[12px]"
                }`}
              >
                {/* 컬러 아이콘 */}
                <div className="relative shrink-0 size-[28px]">
                  <svg viewBox="0 0 28 28" fill="none" className="absolute inset-0 size-full">
                    <circle cx="14" cy="14" r="14" fill={task.color} opacity="0.2" />
                    <path d="M18 14L11.5 10.2V17.8L18 14Z" fill={task.color} />
                  </svg>
                </div>
                {/* 과목명 */}
                <p className="flex-1 font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-white overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
                  {task.name}
                </p>
                {/* 누적 시간 */}
                <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-white whitespace-nowrap shrink-0">
                  {task.time}
                </p>
              </button>
            );
          })}
          <div className="h-[20px]" />
        </div>

        {/* Safe area */}
        <div className="h-[34px] shrink-0" />
      </div>
    </>
  );
}
