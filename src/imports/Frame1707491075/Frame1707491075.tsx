import svgPaths from "./svg-on1zmpiu4u";

function Frame3() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full">
      <p className="[word-break:break-word] font-['Pretendard:SemiBold',sans-serif] leading-[56px] not-italic relative shrink-0 text-[#262626] text-[44px] text-center w-full">00:17:38</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[18px] not-italic relative shrink-0 text-[#6d7278] text-[12px] text-center whitespace-nowrap">한국사</p>
      <div className="relative shrink-0 size-[16px]" data-name="icon24">
        <div className="absolute inset-[35.14%_22.64%_32.79%_22.64%]" data-name="Vector 71 (Stroke)">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.75425 5.13137">
            <path clipRule="evenodd" d={svgPaths.p12bf6f80} fill="var(--fill-0, #B6B8B9)" fillRule="evenodd" id="Vector 71 (Stroke)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-w-px relative">
      <Frame5 />
      <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[28px] min-w-full not-italic relative shrink-0 text-[#b6b8b9] text-[20px] text-center w-[min-content]">00:00:00</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Pretendard:Medium',sans-serif] items-start min-w-px not-italic relative text-center">
      <p className="leading-[18px] relative shrink-0 text-[#6d7278] text-[12px] w-full">오늘 총 시간</p>
      <p className="leading-[28px] relative shrink-0 text-[#262626] text-[20px] w-full">00:00:00</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
      <Frame1 />
      <Frame />
    </div>
  );
}

export default function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative size-full">
      <Frame3 />
      <Frame2 />
    </div>
  );
}