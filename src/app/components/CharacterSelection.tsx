import { useState, useEffect, useRef } from "react";
import imgGirl from "../../imports/캐릭터선여자/b5b64fe36f1fb20103d3c9da8a1eefda7de19367.png";
import imgBoy from "../../imports/캐릭터선여자/d6e94594e2c1501e7867fd52255fb888895a91b8.png";
import imgCat from "../../imports/캐릭터선여자/cat.png";
import videoGirl from "../../imports/캐릭터선여자/character_girl.mp4";
import videoBoy  from "../../imports/캐릭터선택남자/character_boy.mp4";
import videoCat  from "../../imports/캐릭터선여자/character_cat.mp4";

// ── 크로마키 컴포넌트 ─────────────────────────────────────────────────────────
// Chrome 버그 수정: play 이벤트 대기 대신 video.play() 명시 호출 + 즉시 rAF 시작
function VideoChromaKey({ src, className = "" }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const bgRef = useRef<[number, number, number] | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let frameCount = 0;

    // 테두리 스트립 샘플링으로 배경색 감지
    const sampleBg = (dx: number, dy: number, dw: number, dh: number): [number, number, number] => {
      const rs: number[] = [], gs: number[] = [], bs: number[] = [];
      const N = 20;
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const pts: [number, number][] = [
          [dx + t * dw, dy + 2],
          [dx + t * dw, dy + dh - 3],
          [dx + 2,      dy + t * dh],
          [dx + dw - 3, dy + t * dh],
        ];
        for (const [x, y] of pts) {
          const px = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
          rs.push(px[0]); gs.push(px[1]); bs.push(px[2]);
        }
      }
      rs.sort((a, b) => a - b); gs.sort((a, b) => a - b); bs.sort((a, b) => a - b);
      const m = Math.floor(rs.length / 2);
      return [rs[m], gs[m], bs[m]];
    };

    const process = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      // 영상 메타데이터 아직 미준비 → 다음 프레임에 재시도
      if (!vw || !vh) { rafRef.current = requestAnimationFrame(process); return; }

      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.offsetWidth || 240;
      const cssH = canvas.offsetHeight || 240;
      const cw = Math.round(cssW * dpr);
      const ch = Math.round(cssH * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      const scale = Math.min(cw / vw, ch / vh);
      const drawW = vw * scale, drawH = vh * scale;
      const drawX = (cw - drawW) / 2, drawY = (ch - drawH) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(video, drawX, drawY, drawW, drawH);

      frameCount++;
      if (!bgRef.current || frameCount % 120 === 1) {
        bgRef.current = sampleBg(drawX, drawY, drawW, drawH);
      }

      const [bgR, bgG, bgB] = bgRef.current;
      const bgLum = (bgR + bgG + bgB) / 3;
      const HARD = Math.min(Math.max(50, Math.round(bgLum + 40)), 160);
      const SOFT = 10;

      const imageData = ctx.getImageData(0, 0, cw, ch);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const dr = d[i] - bgR, dg = d[i + 1] - bgG, db = d[i + 2] - bgB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);
        if (dist < HARD) {
          d[i + 3] = 0;
        } else if (dist < HARD + SOFT) {
          d[i + 3] = Math.round(((dist - HARD) / SOFT) * 255);
        }
      }
      ctx.putImageData(imageData, 0, 0);
      rafRef.current = requestAnimationFrame(process);
    };

    // ✅ Chrome 버그 핵심 수정:
    //    play 이벤트를 기다리지 않고 rAF 루프를 즉시 시작,
    //    video.play()를 명시적으로 호출해 autoplay 확실히 트리거
    bgRef.current = null;
    frameCount = 0;
    rafRef.current = requestAnimationFrame(process);
    video.play().catch(() => {}); // 자동재생 정책 실패 시 무시

    return () => { cancelAnimationFrame(rafRef.current); };
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      <video ref={videoRef} src={src} autoPlay loop muted playsInline style={{ display: "none" }} />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

const svgPaths = {
  pe1fc120: "M129.713 0C131.222 0 132.109 0.103072 132.593 0.333984C133.456 0.746957 134 1.59507 134 2.5C134 3.405 133.456 4.25402 132.593 4.66602C132.109 4.89698 131.222 5 129.713 5H4.28711C2.77823 5 1.89125 4.89698 1.40723 4.66602C0.544227 4.25402 0 3.405 0 2.5C7.33714e-05 1.59507 0.544285 0.746957 1.40723 0.333984C1.89128 0.103072 2.77838 0 4.28711 0H129.713Z",
  p2e98bf80: "M0 1.13137L1.13137 0L6.56569 5.43431L12 0L13.1314 1.13137L6.56569 7.69706L0 1.13137Z",
  p1fa84700: "M60.9102 0C62.1582 0 62.6111 0.130042 63.0674 0.374023C63.5237 0.618053 63.8819 0.976321 64.126 1.43262C64.37 1.88887 64.5 2.34185 64.5 3.58984V7.91016C64.5 9.15815 64.37 9.61113 64.126 10.0674C63.8819 10.5237 63.5237 10.8819 63.0674 11.126C62.6111 11.37 62.1582 11.5 60.9102 11.5H46.0898C44.8418 11.5 44.3889 11.37 43.9326 11.126C43.4763 10.8819 43.1181 10.5237 42.874 10.0674C42.63 9.61113 42.5 9.15815 42.5 7.91016V3.58984C42.5 2.34185 42.63 1.88887 42.874 1.43262C43.1181 0.976321 43.4763 0.618053 43.9326 0.374023C44.3889 0.130042 44.8418 0 46.0898 0H60.9102ZM46.0898 1C45.103 1 44.7581 1.06668 44.4043 1.25586C44.1223 1.40669 43.9067 1.62227 43.7559 1.9043C43.5667 2.25812 43.5 2.60305 43.5 3.58984V7.91016C43.5 8.89695 43.5667 9.24188 43.7559 9.5957C43.9067 9.87773 44.1223 10.0933 44.4043 10.2441C44.7581 10.4333 45.103 10.5 46.0898 10.5H60.9102C61.897 10.5 62.2419 10.4333 62.5957 10.2441C62.8777 10.0933 63.0933 9.87773 63.2441 9.5957C63.4333 9.24188 63.5 8.89695 63.5 7.91016V3.58984C63.5 2.60305 63.4333 2.25812 63.2441 1.9043C63.0933 1.62227 62.8777 1.40669 62.5957 1.25586C62.2419 1.06668 61.897 1 60.9102 1H46.0898ZM65.5 3.69043C65.5184 3.69985 67 4.46155 67 5.69043C66.9997 6.92675 65.5 7.69043 65.5 7.69043V3.69043Z",
  p1f1ce200: "M29.8005 2.64105C32.0349 2.64115 34.1839 3.46068 35.8033 4.93025C35.9252 5.04371 36.1201 5.04228 36.2402 4.92704L37.4059 3.8041C37.4667 3.74566 37.5006 3.66649 37.5001 3.58411C37.4996 3.50174 37.4647 3.42296 37.4032 3.36519C33.1529 -0.522963 26.4475 -0.522963 22.1972 3.36519C22.1356 3.42291 22.1007 3.50167 22.1001 3.58405C22.0995 3.66642 22.1334 3.74561 22.1941 3.8041L23.3601 4.92704C23.4802 5.04245 23.6752 5.04388 23.7971 4.93025C25.4167 3.46058 27.5659 2.64105 29.8005 2.64105V2.64105ZM29.8005 6.29447C31.0282 6.2944 32.212 6.72997 33.122 7.51655C33.2451 7.62819 33.439 7.62577 33.559 7.5111L34.7233 6.38816C34.7846 6.32926 34.8186 6.24935 34.8178 6.16632C34.8169 6.08329 34.7812 6.00406 34.7186 5.94636C31.9474 3.48579 27.6559 3.48579 24.8848 5.94636C24.8222 6.00406 24.7865 6.08333 24.7857 6.16638C24.7848 6.24944 24.819 6.32934 24.8804 6.38816L26.0444 7.5111C26.1644 7.62577 26.3583 7.62819 26.4813 7.51655C27.3908 6.73049 28.5737 6.29496 29.8005 6.29447V6.29447ZM32.0381 8.97444C32.1003 8.91611 32.1346 8.83583 32.1328 8.75257C32.1311 8.6693 32.0934 8.59043 32.0286 8.53457C30.7424 7.49612 28.8586 7.49612 27.5724 8.53457C27.5076 8.59038 27.4699 8.66923 27.468 8.7525C27.4662 8.83576 27.5004 8.91606 27.5626 8.97444L29.577 10.9146C29.636 10.9716 29.7165 11.0037 29.8005 11.0037C29.8845 11.0037 29.965 10.9716 30.024 10.9146L32.0381 8.97444Z",
  p95dd880: "M1.5 7.03551C1.77879 7.03551 1.91826 7.03589 2.03418 7.05894C2.51011 7.15367 2.88186 7.52539 2.97656 8.00133C2.99962 8.11724 3 8.25671 3 8.53551V9.35386C3 9.6325 2.99961 9.77216 2.97656 9.88804C2.88176 10.3639 2.51004 10.7357 2.03418 10.8304C1.91826 10.8535 1.77879 10.8539 1.5 10.8539C1.22121 10.8539 1.08174 10.8535 0.96582 10.8304C0.489961 10.7357 0.118238 10.3639 0.0234375 9.88804C0.000386359 9.77216 1.83726e-09 9.6325 0 9.35386V8.53551C0 8.25671 0.000379849 8.11724 0.0234375 8.00133C0.118143 7.52539 0.489893 7.15367 0.96582 7.05894C1.08174 7.03589 1.22121 7.03551 1.5 7.03551ZM6.2998 5.12633C6.57857 5.12633 6.71807 5.12671 6.83398 5.14976C7.31001 5.24445 7.68265 5.61613 7.77734 6.09215C7.8004 6.20806 7.7998 6.34755 7.7998 6.62633V9.35386C7.7998 9.6325 7.80039 9.77216 7.77734 9.88804C7.68259 10.364 7.30994 10.7358 6.83398 10.8304C6.71808 10.8535 6.57853 10.8539 6.2998 10.8539C6.02113 10.8539 5.88152 10.8535 5.76562 10.8304C5.28984 10.7357 4.91802 10.3638 4.82324 9.88804C4.80019 9.77216 4.7998 9.6325 4.7998 9.35386V6.62633C4.7998 6.34755 4.80019 6.20806 4.82324 6.09215C4.91795 5.61629 5.28979 5.24454 5.76562 5.14976C5.88152 5.12671 6.02113 5.12633 6.2998 5.12633ZM10.9004 2.93101C11.1789 2.93101 11.3187 2.9314 11.4346 2.95445C11.9103 3.04931 12.2823 3.42099 12.377 3.89683C12.4 4.01275 12.4004 4.15224 12.4004 4.43101V9.35386C12.4004 9.63251 12.4 9.77216 12.377 9.88804C12.2822 10.3638 11.9103 10.7356 11.4346 10.8304C11.3187 10.8535 11.1789 10.8539 10.9004 10.8539C10.6218 10.8539 10.4821 10.8534 10.3662 10.8304C9.89026 10.7358 9.51762 10.364 9.42285 9.88804C9.3998 9.77216 9.40039 9.63251 9.40039 9.35386V4.43101C9.40039 4.15227 9.39981 4.01274 9.42285 3.89683C9.51754 3.4208 9.89018 3.04914 10.3662 2.95445C10.4821 2.93144 10.6218 2.93101 10.9004 2.93101ZM15.5996 0.639997C15.8782 0.639997 16.0179 0.640422 16.1338 0.663435C16.6098 0.758121 16.9825 1.1298 17.0771 1.60582C17.1002 1.72174 17.0996 1.8612 17.0996 2.14V9.35386C17.0996 9.63251 17.1002 9.77216 17.0771 9.88804C16.9824 10.364 16.6097 10.7358 16.1338 10.8304C16.0179 10.8534 15.8782 10.8539 15.5996 10.8539C15.3211 10.8539 15.1813 10.8535 15.0654 10.8304C14.5897 10.7356 14.2178 10.3638 14.123 9.88804C14.1 9.77216 14.0996 9.63251 14.0996 9.35386V2.14C14.0996 1.8612 14.1 1.72174 14.123 1.60582C14.2177 1.12999 14.5897 0.758282 15.0654 0.663435C15.1813 0.640388 15.3211 0.639997 15.5996 0.639997Z",
};

type CharacterSelectionProps = {
  onClose: () => void;
  onStart: () => void;
};

// 캐릭터 목록: 남자(0) · 여자(1) · 고양이(2)
const characters = [
  { id: 'boy',  image: imgBoy,  video: videoBoy,  name: '남자' },
  { id: 'girl', image: imgGirl, video: videoGirl, name: '여자' },
  { id: 'cat',  image: imgCat,  video: videoCat,  name: '고양이' },
];

export default function CharacterSelection({ onClose, onStart }: CharacterSelectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(1); // 여자 기본 선택

  // ── 스와이프 처리 ──────────────────────────────────────────────────────────
  const touchStartX = useRef<number | null>(null);
  const MIN_SWIPE = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > MIN_SWIPE && selectedIndex < characters.length - 1) setSelectedIndex(i => i + 1);
    if (delta < -MIN_SWIPE && selectedIndex > 0) setSelectedIndex(i => i - 1);
    touchStartX.current = null;
  };

  return (
    <div className="bg-[#262626] fixed inset-0 z-50 animate-in slide-in-from-right duration-300">
      {/* 모바일 최대 너비 제한 — 데스크톱 크롬에서도 모바일 비율 유지 */}
      <div className="bg-[#262626] h-full flex flex-col w-full max-w-[430px] mx-auto overflow-hidden">

        {/* 임시 테스트 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-[20px] left-1/2 -translate-x-1/2 z-50 bg-blue-500/80 text-white px-4 py-2 rounded-full text-xs shadow-lg"
        >
          ← 타이머홈으로
        </button>

        {/* ── 상단 네비게이션 ── shrink-0 으로 고정 높이 확보 */}
        <div className="shrink-0 bg-[#262626] z-10" data-name="Topnavigation">
          <div className="h-[42px] relative shrink-0 w-full" data-name="Status Bar">
            <div className="absolute h-[11.5px] right-[14.5px] top-[19.16px] w-[67px]" data-name="Symbol">
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 67 11.5">
                <g id="Symbol">
                  <g id="Battery">
                    <path d={svgPaths.p1fa84700} fill="#333333" id="Rectangle" opacity="0.36" />
                    <rect fill="#333333" height="7.66667" id="Rectangle_2" rx="1.6" width="18" x="44.5" y="1.91667" />
                  </g>
                  <path clipRule="evenodd" d={svgPaths.p1f1ce200} fill="#333333" fillRule="evenodd" id="Wi-Fi" />
                  <path d={svgPaths.p95dd880} fill="#333333" id="Cellular" />
                </g>
              </svg>
            </div>
            <div className="absolute h-[22px] left-[29.5px] top-[10px]" data-name="Time">
              <p className="[word-break:break-word] font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] text-[#f9f9fa] text-[15px] tracking-[-0.165px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                9:41
              </p>
            </div>
          </div>
          <div className="relative shrink-0 w-full" data-name="nav-bar">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex items-center justify-between px-[12px] py-[16px] relative size-full">
                <button
                  onClick={onClose}
                  className="content-stretch flex items-center relative shrink-0 size-[24px]"
                  data-name="leading"
                >
                  <div className="relative shrink-0 size-[24px]" data-name="type=outline, name=expandleft">
                    <div className="absolute flex inset-[22.64%_35.14%_22.64%_32.79%] items-center justify-center" style={{ containerType: "size" }}>
                      <div className="-scale-x-100 flex-none h-[100cqw] rotate-90 w-[100cqh]">
                        <div className="relative size-full" data-name="Vector 71 (Stroke)">
                          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.1314 7.69706">
                            <path clipRule="evenodd" d={svgPaths.p2e98bf80} fill="#D8D8D8" fillRule="evenodd" id="Vector 71 (Stroke)" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
                <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="trailing">
                  <div className="content-stretch flex items-center relative shrink-0 size-[24px]" />
                  <div className="content-stretch flex items-center relative shrink-0 size-[24px]" />
                  <div className="content-stretch flex items-center relative shrink-0 size-[24px]" />
                </div>
                <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Pretendard:Medium',sans-serif] leading-[24px] left-[calc(50%+0.5px)] not-italic text-[#f9f9fa] text-[16px] text-center whitespace-nowrap">타이머</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 타이틀 ── shrink-0, 고정 높이 없이 자연스럽게 */}
        <p className="shrink-0 mt-6 px-4 w-full font-['Pretendard:Medium',sans-serif] text-[clamp(20px,5.5vw,24px)] leading-[1.4] text-center text-white whitespace-pre-wrap">
          {`앞으로 함께할\n캐릭터를 선택해 주세요`}
        </p>

        {/* ── 캐러셀 ── 선택 240px / 미선택 150px, 195px 오프셋 스와이프 */}
        <div
          className="flex-1 min-h-[200px] w-full relative overflow-hidden"
          data-name="carousel"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {characters.map((character, index) => {
            const isSelected = index === selectedIndex;
            const distance = index - selectedIndex;
            const size = isSelected ? 240 : 150;
            const offset = distance * 195;

            return (
              <div
                key={character.id}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  width: size,
                  height: size,
                  opacity: distance === 0 ? 1 : 0.2,
                  left: '50%',
                  top: '50%',
                  transform: `translateX(calc(${offset}px - 50%)) translateY(-50%)`,
                }}
                onClick={() => setSelectedIndex(index)}
              >
                {character.video ? (
                  <VideoChromaKey
                    src={character.video}
                    className="absolute inset-0 size-full pointer-events-none"
                  />
                ) : (
                  <img
                    alt={character.name}
                    className="absolute inset-0 max-w-none object-contain pointer-events-none size-full"
                    src={character.image}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── 안내 텍스트 ── shrink-0 */}
        <p className="shrink-0 py-3 font-['Pretendard:Medium',sans-serif] leading-[24px] text-[#b6b8b9] text-[16px] text-center whitespace-nowrap">
          캐릭터는 설정에서 변경 가능해요
        </p>

        {/* ── 하단 버튼 영역 ── shrink-0 으로 항상 화면 하단에 고정 */}
        <div className="shrink-0 w-full" data-name="Buttom group">
          <div className="flex flex-col items-center w-full" data-name="footer">
            <div className="w-full px-[16px] pb-[4px]" data-name="button-area">
              <button
                onClick={onStart}
                className="bg-[#9678ff] h-[56px] relative rounded-[8px] w-full active:bg-[#654ec1] transition-colors"
                data-name="Button/Action Button"
              >
                <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                  <div className="content-stretch flex items-center justify-center p-[16px] relative size-full">
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="content">
                      <div className="[word-break:break-word] flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">
                        <p className="leading-[24px]">타이머 시작</p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>
            <div className="h-[34px] overflow-clip relative shrink-0 w-full" data-name="Safe Area">
              <div className="absolute bottom-[8px] h-[5px] left-[32.13%] right-[32.13%]" data-name="Shape">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 134 5">
                  <path d={svgPaths.pe1fc120} fill="white" id="Union" />
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
