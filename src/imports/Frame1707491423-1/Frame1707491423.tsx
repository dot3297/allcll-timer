import svgPaths from "./svg-5qfkvt3420";
import musicOffSvg from "./mdi_music-off.svg";

const MUSIC_ON_ICON = "https://www.figma.com/api/mcp/asset/40cab050-a10c-4380-83dc-8806673720e4";

function MusicIcon({ isMusicOn }: { isMusicOn: boolean }) {
  return (
    <div className="col-1 ml-[8px] mt-0 relative row-1 size-[32px] bg-white rounded-full flex items-center justify-center">
      <img
        src={isMusicOn ? MUSIC_ON_ICON : musicOffSvg}
        className="size-[20px]"
        alt={isMusicOn ? "배경음 켜짐" : "배경음 꺼짐"}
      />
    </div>
  );
}

function MusicLabel() {
  return (
    <div className="bg-[#8461fa] col-1 content-stretch flex items-center justify-center ml-0 mt-[27px] px-[8px] py-[2px] relative rounded-[9999px] row-1">
      <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[18px] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">배경음</p>
    </div>
  );
}

function MusicButton({ isMusicOn, onClick }: { isMusicOn: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0 cursor-pointer active:scale-95 transition-transform">
      <MusicIcon isMusicOn={isMusicOn} />
      <MusicLabel />
    </button>
  );
}

function SettingsIcon() {
  return (
    <div className="col-1 ml-[8px] mt-0 relative row-1 size-[32px]">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Frame 1707491419">
          <path d={svgPaths.p16b6ae00} fill="white" />
          <path d={svgPaths.p33596ec0} fill="#333333" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function SettingsLabel() {
  return (
    <div className="bg-[#8461fa] col-1 content-stretch flex items-center justify-center ml-0 mt-[27px] px-[8px] py-[2px] relative rounded-[9999px] row-1 w-[48px]">
      <p className="[word-break:break-word] font-['Pretendard:Medium',sans-serif] leading-[18px] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">설정</p>
    </div>
  );
}

function SettingsButton({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0 cursor-pointer active:scale-95 transition-transform">
      <SettingsIcon />
      <SettingsLabel />
    </button>
  );
}

export default function Frame4({
  onMusicClick,
  onSettingsClick,
  isMusicOn = true,
}: {
  onMusicClick?: () => void;
  onSettingsClick?: () => void;
  isMusicOn?: boolean;
}) {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center justify-center leading-[0] relative size-full">
      <MusicButton isMusicOn={isMusicOn} onClick={onMusicClick} />
      <SettingsButton onClick={onSettingsClick} />
    </div>
  );
}
