import svgPaths from "./svg-hl1c3pe2dk";

export default function Bubble() {
  return (
    <div className="relative size-full" data-name="bubble">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 198 61.9998">
        <g id="bubble">
          <g filter="url(#filter0_i_6_763)" id="Union">
            <path d={svgPaths.p2ed4d00} fill="var(--fill-0, white)" />
          </g>
        </g>
        <defs>
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="65.9998" id="filter0_i_6_763" width="202" x="-4" y="-4">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset dx="-4" dy="-4" />
            <feGaussianBlur stdDeviation="6" />
            <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0" />
            <feBlend in2="shape" mode="normal" result="effect1_innerShadow_6_763" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}