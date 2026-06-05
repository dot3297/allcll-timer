import svgPaths from "./svg-s95bx09h17";
import imgRectangle151156339 from "./2eb36c9b01328c8d70f2a070f4bd3e2de50b175c.png";

function Frame() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-w-px relative">
      <div className="relative rounded-[6px] shrink-0 size-[51px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[6px]">
          <div className="absolute bg-[#d9d9d9] inset-0 rounded-[6px]" />
          <div className="absolute inset-0 overflow-hidden rounded-[6px]">
            <img alt="" className="absolute h-[103.92%] left-[-41.39%] max-w-none top-[-0.98%] w-[183.83%]" src={imgRectangle151156339} />
          </div>
        </div>
      </div>
      <p className="[word-break:break-word] flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[21px] min-w-px not-italic overflow-hidden relative text-[#262626] text-[14px] text-ellipsis whitespace-nowrap">[Playlist] 지브리 피아노 OST | 집중 플레이리스트 | 가사 없는 잔잔한 음악 | 모트모트</p>
      <div className="absolute bg-gradient-to-r from-[#333] h-[51px] left-[51px] to-[rgba(51,51,51,0)] top-0 w-[36px]" />
      <div className="absolute flex h-[51px] items-center justify-center right-0 top-0 w-[36px]">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="bg-gradient-to-r from-[#333] h-[51px] relative to-[rgba(51,51,51,0)] w-[36px]" />
        </div>
      </div>
    </div>
  );
}

function SkipPrevious24Dp1F1F1F() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="skip_previous_24dp_1F1F1F 1">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_6_3784)" id="skip_previous_24dp_1F1F1F 1">
          <g id="Vector" />
          <path d={svgPaths.p148ab0f0} fill="var(--fill-0, #333333)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_6_3784">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function SkipNext24Dp1F1F1F() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="skip_next_24dp_1F1F1F 1">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_6_3788)" id="skip_next_24dp_1F1F1F 1">
          <g id="Vector" />
          <path d={svgPaths.p3a5aedc0} fill="var(--fill-0, #333333)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_6_3788">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
      <SkipPrevious24Dp1F1F1F />
      <div className="relative shrink-0 size-[24px]" data-name="icon">
        <div className="absolute bottom-[21.02%] left-1/4 right-1/4 top-[20.65%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 14">
            <path d={svgPaths.pc724cc0} fill="var(--fill-0, #333333)" id="Vector" />
          </svg>
        </div>
      </div>
      <SkipNext24Dp1F1F1F />
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-[#f9f9fa] content-stretch flex gap-[12px] items-center overflow-clip p-[16px] relative shrink-0 w-[375px]">
      <Frame />
      <Frame1 />
    </div>
  );
}

function Shape() {
  return (
    <div className="absolute bottom-[8px] h-[5px] left-[32.13%] right-[32.13%]" data-name="Shape">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 134 5">
        <g id="Shape">
          <foreignObject height="93" width="222" x="-44" y="-44">
            <div style={{ backdropFilter: "blur(22px)", clipPath: "url(#bgblur_0_6_3236_clip_path)", height: "100%", width: "100%" }} xmlns="http://www.w3.org/1999/xhtml" />
          </foreignObject>
          <path d={svgPaths.pe1fc120} fill="var(--fill-0, #262626)" id="Union" data-figma-bg-blur-radius="44" />
        </g>
        <defs>
          <clipPath id="bgblur_0_6_3236_clip_path" transform="translate(44 44)">
            <path d={svgPaths.pe1fc120} />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Footer() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[375px]" data-name="footer">
      <div className="h-[34px] overflow-clip relative shrink-0 w-full" data-name="Safe Area">
        <Shape />
      </div>
    </div>
  );
}

function Playlist() {
  return (
    <div className="bg-[#f9f9fa] content-stretch flex h-[34px] items-start justify-center px-[16px] py-[12px] relative shrink-0 w-[375px]" data-name="playlist">
      <div className="-translate-x-1/2 absolute bottom-0 content-stretch flex flex-col items-center justify-end left-1/2 w-[375px]" data-name="Buttom group">
        <Footer />
      </div>
    </div>
  );
}

export default function Frame3() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full">
      <Frame2 />
      <Playlist />
    </div>
  );
}