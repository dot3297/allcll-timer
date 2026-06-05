import svgPaths from "./svg-sh8v04ggfj";

export default function Component({ className, onNavigateToTimer }: { className?: string; onNavigateToTimer?: () => void }) {
  return (
    <div className={className || "bg-[#262626] h-[812px] overflow-clip relative w-[375px]"} data-name="할일">
      <div className="absolute bottom-0 content-stretch flex flex-col items-start left-0 w-[375px]" data-name="Bottom navigation">
        <div className="bg-[#333] relative rounded-tl-[16px] rounded-tr-[16px] shrink-0 w-full" data-name="Bottom navigation">
          <div className="content-stretch flex items-start overflow-clip relative rounded-[inherit] size-full">
            <div className="flex-[1_0_0] min-w-px relative cursor-pointer active:bg-[#404040] transition-colors" data-name="1" onClick={onNavigateToTimer}>
              <div className="flex flex-col items-center size-full">
                <div className="content-stretch flex flex-col gap-[3px] items-center px-[33px] py-[7px] relative size-full">
                  <div className="relative shrink-0 size-[24px]" data-name="icon24">
                    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[24px] top-1/2" />
                    <div className="absolute contents inset-[8.15%_12.5%_4.35%_12.5%]" data-name="Group">
                      <div className="absolute inset-[8.15%_12.5%_4.35%_12.5%]" data-name="Group">
                        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 21">
                          <g id="Group">
                            <path d="M12 0H6V2H12V0Z" fill="var(--fill-0, #6D7278)" id="Vector" />
                            <path d={svgPaths.p9e515a0} fill="var(--fill-0, #6D7278)" id="Vector_2" />
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <p className="[word-break:break-word] font-['Spoqa_Han_Sans_Neo:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#6d7278] text-[12px] text-center whitespace-nowrap">타이머</p>
                </div>
              </div>
            </div>
            <div className="flex-[1_0_0] min-w-px relative" data-name="3">
              <div className="flex flex-col items-center size-full">
                <div className="content-stretch flex flex-col gap-[3px] items-center px-[28px] py-[7px] relative size-full">
                  <div className="relative shrink-0 size-[24px]" data-name="icon24">
                    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[24px] top-1/2" />
                    <div className="absolute inset-[12.31%_8.33%_12.69%_8.33%]" data-name="Group">
                      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 18">
                        <g id="Group">
                          <path d={svgPaths.p28572200} fill="var(--fill-0, #6D7278)" id="Vector" />
                        </g>
                      </svg>
                    </div>
                  </div>
                  <p className="[word-break:break-word] font-['Spoqa_Han_Sans_Neo:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#6d7278] text-[12px] text-center whitespace-nowrap">어제의 나</p>
                </div>
              </div>
            </div>
            <div className="flex-[1_0_0] min-w-px relative" data-name="2">
              <div className="flex flex-col items-center size-full">
                <div className="content-stretch flex flex-col gap-[3px] items-center px-[31px] py-[7px] relative size-full">
                  <div className="relative shrink-0 size-[24px]" data-name="icon24">
                    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[24px] top-1/2" />
                    <div className="absolute contents inset-[12.31%_8.33%_12.69%_8.33%]" data-name="Group">
                      <div className="absolute inset-[12.31%_8.33%_12.69%_8.33%]" data-name="Group">
                        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 18">
                          <g id="Group">
                            <path clipRule="evenodd" d={svgPaths.p2ffd1800} fill="var(--fill-0, #9678FF)" fillRule="evenodd" id="Vector" />
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <p className="[word-break:break-word] font-['Spoqa_Han_Sans_Neo:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#9678ff] text-[12px] text-center whitespace-nowrap">할일</p>
                </div>
              </div>
            </div>
            <div className="flex-[1_0_0] min-w-px relative" data-name="6">
              <div className="flex flex-col items-center size-full">
                <div className="content-stretch flex flex-col gap-[3px] items-center px-[31px] py-[7px] relative size-full">
                  <div className="relative shrink-0 size-[24px]" data-name="icon24">
                    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[24px] top-1/2" />
                    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[18px] top-[calc(50%-0.04px)]" data-name="Vector">
                      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                        <path d={svgPaths.p2aa01300} fill="var(--fill-0, #6D7278)" id="Vector" />
                      </svg>
                    </div>
                  </div>
                  <p className="[word-break:break-word] font-['Spoqa_Han_Sans_Neo:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#6d7278] text-[12px] text-center whitespace-nowrap">랭킹</p>
                </div>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="absolute border-[#6d7278] border-solid border-t inset-0 pointer-events-none rounded-tl-[16px] rounded-tr-[16px] shadow-[0px_-2px_8px_0px_rgba(0,0,0,0)]" />
        </div>
        <div className="bg-[#333] h-[34px] overflow-clip relative shrink-0 w-full" data-name="Safe Area">
          <div className="absolute bottom-[8px] h-[5px] left-[32.13%] right-[32.13%]" data-name="Shape">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 134 5">
              <g id="Shape">
                <foreignObject height="93" width="222" x="-44" y="-44">
                  <div style={{ backdropFilter: "blur(22px)", clipPath: "url(#bgblur_0_6_564_clip_path)", height: "100%", width: "100%" }} xmlns="http://www.w3.org/1999/xhtml" />
                </foreignObject>
                <path d={svgPaths.pe1fc120} fill="var(--fill-0, white)" id="Union" data-figma-bg-blur-radius="44" />
              </g>
              <defs>
                <clipPath id="bgblur_0_6_564_clip_path" transform="translate(44 44)">
                  <path d={svgPaths.pe1fc120} />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute bg-[#262626] h-[100px] left-1/2 top-[186px] w-[375px]" />
      <div className="-translate-x-1/2 absolute content-stretch flex flex-col items-start left-1/2 top-[270px] w-[343px]" data-name="comtainer">
        <div className="content-stretch flex h-[36px] items-center justify-center overflow-clip px-[12px] py-[8px] relative rounded-[8px] shrink-0" data-name="Button/text button">
          <div className="content-stretch flex gap-[2px] items-center relative shrink-0" data-name="content">
            <div className="[word-break:break-word] flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f9f9fa] text-[14px] text-center whitespace-nowrap">
              <p className="leading-[21px]">전체</p>
            </div>
            <div className="overflow-clip relative shrink-0 size-[16px]" data-name="icon24">
              <div className="absolute inset-[16.67%_16.67%_16.67%_16.66%]">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6667 10.6667">
                  <g id="Group 4657">
                    <path d={svgPaths.p1ae795c0} id="Vector 79" stroke="var(--stroke-0, #D8D8D8)" />
                    <path d="M10.6667 5.33327H0" id="Vector 80" stroke="var(--stroke-0, #D8D8D8)" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex items-center relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[343px]" data-name="Text input">
            <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
              <div className="bg-[#333] flex-[1_0_0] h-[40px] min-w-px relative rounded-[8px]">
                <div className="flex flex-row items-center size-full">
                  <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[16px] relative size-full">
                    <div className="content-stretch flex items-center relative shrink-0" data-name="checkbox">
                      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icon24">
                        <div className="absolute border border-[#d8d8d8] border-solid inset-[12.49%_12.5%_12.51%_12.5%] rounded-[4px]" />
                      </div>
                    </div>
                    <p className="[word-break:break-word] flex-[1_0_0] font-['Pretendard:Regular',sans-serif] leading-[21px] min-w-px not-italic overflow-hidden relative text-[#95999d] text-[14px] text-ellipsis whitespace-nowrap">할일을 추가해 보세요</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute bg-[#262626] h-[68px] left-1/2 overflow-clip top-[194px] w-[375px]">
        <div className="absolute content-stretch flex gap-[8px] items-center left-[98px] top-[18px]">
          <div className="content-stretch flex gap-[2px] h-[32px] items-center justify-center px-[12px] py-[6px] relative rounded-[36px] shrink-0" data-name="Chips_v2.0">
            <div aria-hidden="true" className="absolute border border-[#95999d] border-solid inset-0 pointer-events-none rounded-[36px]" />
            <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[21px] not-italic relative shrink-0 text-[#b6b8b9] text-[14px] whitespace-nowrap">전체</p>
          </div>
          <div className="bg-[#333] content-stretch flex gap-[2px] h-[32px] items-center justify-center px-[12px] py-[6px] relative rounded-[36px] shrink-0" data-name="Chips_v2.0">
            <div aria-hidden="true" className="absolute border border-[#b6b8b9] border-solid inset-0 pointer-events-none rounded-[36px]" />
            <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[21px] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">오늘 할것들</p>
          </div>
          <div className="content-stretch flex gap-[2px] h-[32px] items-center justify-center px-[12px] py-[6px] relative rounded-[36px] shrink-0" data-name="Chips_v2.0">
            <div aria-hidden="true" className="absolute border border-[#95999d] border-solid inset-0 pointer-events-none rounded-[36px]" />
            <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[21px] not-italic relative shrink-0 text-[#b6b8b9] text-[14px] whitespace-nowrap">공부</p>
          </div>
          <div className="content-stretch flex gap-[2px] h-[32px] items-center justify-center px-[12px] py-[6px] relative rounded-[36px] shrink-0" data-name="Chips_v2.0">
            <div aria-hidden="true" className="absolute border border-[#95999d] border-solid inset-0 pointer-events-none rounded-[36px]" />
            <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[21px] not-italic relative shrink-0 text-[#b6b8b9] text-[14px] whitespace-nowrap">갓생</p>
          </div>
        </div>
        <div className="absolute content-stretch flex flex-col gap-[10px] h-[68px] items-start left-0 px-[16px] py-[18px] top-0 w-[133px]" data-name="fixed">
          <div className="absolute bg-gradient-to-r from-[#262626] h-[68px] left-0 to-[rgba(38,38,38,0)] top-0 via-[82.707%] via-[rgba(38,38,38,0.6)] w-[133px]" data-name="scroll fog" />
          <div className="bg-white content-stretch flex gap-[2px] h-[32px] items-center justify-center px-[12px] py-[6px] relative rounded-[36px] shrink-0" data-name="Chips_v2.0">
            <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[21px] not-italic relative shrink-0 text-[#262626] text-[14px] whitespace-nowrap">카테고리 추가</p>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#262626] content-stretch drop-shadow-[0px_4px_6px_rgba(109,114,120,0.16)] flex flex-col items-start left-0 rounded-bl-[16px] rounded-br-[16px] top-0 w-[375px]" data-name="Topnavigation">
        <div className="h-[42px] relative shrink-0 w-full" data-name="Status Bar">
          <div className="absolute h-[11.5px] left-[293.5px] top-[19.16px] w-[67px]" data-name="Symbol">
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
          <div className="-translate-y-1/2 absolute h-[22px] left-0 top-[calc(50%+4px)] w-[180px]" data-name="Time">
            <p className="[word-break:break-word] absolute font-['SF_Pro:Medium',sans-serif] font-[510] leading-[normal] left-[29.5px] text-[#f9f9fa] text-[15px] top-[calc(50%-9px)] tracking-[-0.165px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              9:41
            </p>
          </div>
        </div>
        <div className="h-[56px] relative shrink-0 w-full" data-name="actions">
          <div className="flex flex-row items-center justify-center size-full">
            <div className="content-stretch flex items-center justify-between pr-[12px] py-[8px] relative size-full">
              <div className="content-stretch flex h-[36px] items-center justify-center overflow-clip px-[12px] py-[8px] relative rounded-[8px] shrink-0" data-name="Button/text button">
                <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="content">
                  <div className="[word-break:break-word] flex flex-col font-['Pretendard:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#f9f9fa] text-[20px] text-center whitespace-nowrap">
                    <p className="leading-[28px]">할일</p>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="sub-actions">
                <div className="content-stretch flex items-center relative shrink-0" data-name="touarea">
                  <div className="relative shrink-0 size-[24px]" data-name="icon24">
                    <div className="absolute inset-[17.71%_20.83%]" data-name="Vector">
                      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 15.5">
                        <path d={svgPaths.p2a59a680} fill="var(--fill-0, #D8D8D8)" id="Vector" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex items-center relative shrink-0" data-name="touarea">
                  <div className="relative shrink-0 size-[24px]" data-name="icon24">
                    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[24px] top-1/2">
                      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                        <g id="Frame 4679">
                          <path d={svgPaths.p1c54e880} fill="var(--fill-0, #D8D8D8)" id="Vector" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="calendar">
          <div className="content-stretch flex gap-[4px] items-center justify-center relative shrink-0 w-full" data-name="week-row">
            <div className="content-stretch drop-shadow-[0px_4px_4px_rgba(110,109,120,0.04)] flex flex-col gap-[4px] items-center pb-[8px] pt-[4px] px-[8px] relative rounded-[8px] shrink-0 w-[47px]" data-name="ring calendar">
              <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[18px] min-w-full not-italic relative shrink-0 text-[#6d7278] text-[12px] text-center w-[min-content]">월</p>
              <div className="content-stretch flex flex-col gap-[8px] items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 size-[35px]" data-name="ring">
                <div aria-hidden="true" className="absolute border-[#b6b8b9] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#d8d8d8] text-[16px] text-center whitespace-nowrap">25</p>
                <div className="absolute left-0 size-[35px] top-0" data-name="arc-fill">
                  <div className="absolute inset-[0_0_47.73%_52.07%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.7768 18.2778">
                      <path d={svgPaths.pc9c8380} id="arc-fill" stroke="var(--stroke-0, #9678FF)" strokeWidth="1.6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch drop-shadow-[0px_4px_4px_rgba(110,109,120,0.04)] flex flex-col gap-[4px] items-center pb-[8px] pt-[4px] px-[8px] relative rounded-[8px] shrink-0 w-[47px]" data-name="ring calendar">
              <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[18px] min-w-full not-italic relative shrink-0 text-[#6d7278] text-[12px] text-center w-[min-content]">화</p>
              <div className="content-stretch flex flex-col gap-[8px] items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 size-[35px]" data-name="ring">
                <div aria-hidden="true" className="absolute border-[#b6b8b9] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#d8d8d8] text-[16px] text-center whitespace-nowrap">26</p>
                <div className="absolute left-0 size-[35px] top-0" data-name="arc-fill">
                  <div className="absolute inset-[0_0_47.73%_52.07%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.7768 18.2778">
                      <path d={svgPaths.pc9c8380} id="arc-fill" stroke="var(--stroke-0, #9678FF)" strokeWidth="1.6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch drop-shadow-[0px_4px_4px_rgba(110,109,120,0.04)] flex flex-col gap-[4px] items-center pb-[8px] pt-[4px] px-[8px] relative rounded-[8px] shrink-0 w-[47px]" data-name="ring calendar">
              <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[18px] min-w-full not-italic relative shrink-0 text-[#6d7278] text-[12px] text-center w-[min-content]">수</p>
              <div className="content-stretch flex flex-col gap-[8px] items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 size-[35px]" data-name="ring">
                <div aria-hidden="true" className="absolute border-[#b6b8b9] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#d8d8d8] text-[16px] text-center whitespace-nowrap">27</p>
                <div className="absolute left-0 size-[35px] top-0" data-name="arc-fill">
                  <div className="absolute inset-[0_0_47.73%_52.07%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.7768 18.2778">
                      <path d={svgPaths.pc9c8380} id="arc-fill" stroke="var(--stroke-0, #9678FF)" strokeWidth="1.6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch drop-shadow-[0px_4px_4px_rgba(110,109,120,0.08)] flex flex-col gap-[4px] items-center pb-[8px] pt-[4px] px-[8px] relative rounded-[12px] shrink-0 w-[47px]" data-name="ring calendar">
              <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[18px] min-w-full not-italic relative shrink-0 text-[#d8d8d8] text-[12px] text-center w-[min-content]">오늘</p>
              <div className="content-stretch flex flex-col items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 size-[35px]" data-name="ring">
                <div aria-hidden="true" className="absolute border-[#b6b8b9] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#d8d8d8] text-[16px] text-center whitespace-nowrap">28</p>
              </div>
            </div>
            <div className="content-stretch drop-shadow-[0px_4px_4px_rgba(110,109,120,0.04)] flex flex-col gap-[4px] items-center pb-[8px] pt-[4px] px-[8px] relative rounded-[8px] shrink-0 w-[47px]" data-name="ring calendar">
              <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[18px] min-w-full not-italic relative shrink-0 text-[#6d7278] text-[12px] text-center w-[min-content]">금</p>
              <div className="content-stretch flex flex-col items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 size-[35px]" data-name="ring">
                <div aria-hidden="true" className="absolute border-[#efeff0] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#6d7278] text-[16px] text-center whitespace-nowrap">29</p>
              </div>
            </div>
            <div className="content-stretch drop-shadow-[0px_4px_4px_rgba(110,109,120,0.04)] flex flex-col gap-[4px] items-center pb-[8px] pt-[4px] px-[8px] relative rounded-[8px] shrink-0 w-[47px]" data-name="ring calendar">
              <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[18px] min-w-full not-italic relative shrink-0 text-[#6d7278] text-[12px] text-center w-[min-content]">토</p>
              <div className="content-stretch flex flex-col items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 size-[35px]" data-name="ring">
                <div aria-hidden="true" className="absolute border-[#efeff0] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#6d7278] text-[16px] text-center whitespace-nowrap">30</p>
              </div>
            </div>
            <div className="content-stretch drop-shadow-[0px_4px_4px_rgba(110,109,120,0.04)] flex flex-col gap-[4px] items-center pb-[8px] pt-[4px] px-[8px] relative rounded-[8px] shrink-0 w-[47px]" data-name="ring calendar">
              <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[18px] min-w-full not-italic relative shrink-0 text-[#6d7278] text-[12px] text-center w-[min-content]">일</p>
              <div className="content-stretch flex flex-col items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 size-[35px]" data-name="ring">
                <div aria-hidden="true" className="absolute border-[#efeff0] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[9999px]" />
                <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#6d7278] text-[16px] text-center whitespace-nowrap">31</p>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col items-center justify-center pb-[4px] pt-[12px] relative shrink-0 w-full" data-name="spacer">
            <div className="bg-[#6d7278] h-[3px] relative rounded-[8px] shrink-0 w-[56px]" data-name="spacer-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}