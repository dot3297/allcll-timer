import svgPaths from "./svg-cjxbwaizyw";

function Frame1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px relative">
      <div className="[word-break:break-word] flex flex-col font-['Pretendard:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#333] text-[18px] w-full">
        <p className="leading-[27px]">배경음</p>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[16.12%]">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.2627 16.2627">
        <g id="Group 4604">
          <path clipRule="evenodd" d={svgPaths.p1169c200} fill="var(--fill-0, #333333)" fillRule="evenodd" id="Vector 98 (Stroke)" />
          <path clipRule="evenodd" d={svgPaths.p3476e000} fill="var(--fill-0, #333333)" fillRule="evenodd" id="Vector 99 (Stroke)" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[12px] items-start justify-end relative shrink-0 w-[343px]">
      <Frame1 />
      <div className="absolute right-0 size-[24px] top-[0.46px]" data-name="icon">
        <Group />
      </div>
    </div>
  );
}

export default function Header() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start justify-center px-[16px] py-[24px] relative size-full" data-name="header">
      <Frame />
    </div>
  );
}