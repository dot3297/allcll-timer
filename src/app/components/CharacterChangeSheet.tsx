/**
 * CharacterChangeSheet — 캐릭터 변경 바텀시트
 *
 * ## 개요
 * 타이머 설정 바텀시트에서 "캐릭터 변경" 버튼을 탭했을 때 표시되는 바텀시트 컴포넌트.
 * 사용 가능한 캐릭터 목록을 표시하고 선택을 변경할 수 있다.
 *
 * ## 주요 기능
 * - 캐릭터 선택 목록 표시 및 현재 선택 상태 강조
 * - 선택 변경 후 onSelect 콜백으로 부모에게 전달
 * - 취소/닫기 시 onClose 콜백 호출
 *
 * ## 현재 상태 (TODO)
 * - [ ] localhost:3845 에셋 URL을 로컬 import 방식으로 교체 필요
 */
import { useState } from "react";

const imgCharacter1 = "http://localhost:3845/assets/931ff6cd511628648ae3acc87aa0014ca6f5f7b7.png";
const imgCharacter2 = "http://localhost:3845/assets/05d5642a839cf515f2629abc371c6c711eb3736a.png";
const imgCheckBadge = "http://localhost:3845/assets/d3d818778a577232e83300c9c0f24685ff5ee8bb.svg";
const imgClose     = "http://localhost:3845/assets/ff99e618e4b5525940e7b3beef5c7e12e4064cf8.svg";

const characters = [
  { id: 1, src: imgCharacter1 },
  { id: 2, src: imgCharacter2 },
];

export default function CharacterChangeSheet({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState(1);

  return (
    <div className="absolute inset-0 z-[60]">
      {/* 딤 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 바텀시트 */}
      <div className="absolute bottom-0 left-0 w-full bg-[#262626] rounded-tl-[16px] rounded-tr-[16px] flex flex-col">
        {/* 헤더 */}
        <div className="relative flex flex-col gap-[4px] px-[16px] py-[24px] shrink-0">
          <p className="font-['Pretendard:SemiBold',sans-serif] text-[18px] leading-[27px] text-[#f9f9fa]">
            캐릭터 변경
          </p>
          <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[#868b90]">
            캐릭터 변경 시 모든 타이머에 적용되요
          </p>
          {/* X 버튼 */}
          <button
            onClick={onClose}
            className="absolute right-[16px] top-[24px] size-[24px] flex items-center justify-center cursor-pointer active:opacity-60 transition-opacity"
          >
            <img src={imgClose} alt="닫기" className="size-full" />
          </button>
        </div>

        {/* 캐릭터 선택 */}
        <div className="flex gap-[8px] items-center px-[16px] pb-[16px] shrink-0">
          {characters.map((char) => {
            const isSelected = selected === char.id;
            return (
              <button
                key={char.id}
                onClick={() => setSelected(char.id)}
                className="relative shrink-0 size-[80px] cursor-pointer active:scale-95 transition-transform"
              >
                <img
                  src={char.src}
                  alt={`캐릭터 ${char.id}`}
                  className={`block size-full rounded-full transition-all duration-200 ${
                    isSelected ? "ring-[2.5px] ring-[#9678ff] ring-offset-[2px] ring-offset-[#262626]" : ""
                  }`}
                />
                {/* 선택 체크 배지 */}
                {isSelected && (
                  <div className="absolute right-0 top-0 size-[24px]">
                    <img src={imgCheckBadge} alt="선택됨" className="block size-full" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 변경 하기 버튼 */}
        <div className="flex flex-col items-start px-[16px] pb-[16px] shrink-0">
          <button
            onClick={onClose}
            className="bg-[#9678ff] h-[56px] w-full rounded-[8px] flex items-center justify-center cursor-pointer active:bg-[#654ec1] transition-colors"
          >
            <p className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-white">
              변경 하기
            </p>
          </button>
        </div>

        {/* 세이프 에어리어 */}
        <div className="h-[34px] relative shrink-0 w-full bg-[#262626]">
          <div className="absolute bottom-[8px] left-[32.13%] right-[32.13%] h-[5px] bg-white rounded-full" />
        </div>
      </div>
    </div>
  );
}
