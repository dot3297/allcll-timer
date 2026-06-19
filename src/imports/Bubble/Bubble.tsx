/** 말풍선 배경 — 꼬리 하단 중앙 (Figma 7577-237611) */
export default function Bubble() {
  return (
    <div className="relative size-full" data-name="bubble">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 198 61.9998">
        <g id="bubble">
          <g id="Union" filter="url(#filter0_i_0_4)">
            <path
              d="M93.0684 52H16C7.16345 52 3.2215e-07 44.8366 0 36V16C0 7.16344 7.16344 0 16 0H182C190.837 2.38375e-06 198 7.16345 198 16V36C198 44.8366 190.837 52 182 52H105C105 56 101.5 61.4998 97 61.7148C98.3424 60.9235 97.4995 55 93.0684 52Z"
              fill="var(--fill-0, white)"
            />
          </g>
        </g>
        <defs>
          <filter id="filter0_i_0_4" x="-4" y="-4" width="202" height="65.7148" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dx="-4" dy="-4" />
            <feGaussianBlur stdDeviation="6" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0" />
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_0_4" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
