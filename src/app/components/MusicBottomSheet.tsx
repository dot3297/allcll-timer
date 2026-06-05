import { useState, useRef, useEffect } from "react";
import svgPaths from "../../imports/음악아이콘탭시/svg-bcva7eqjg3";
import playerSvgPaths from "../../imports/Frame1707491357-2/svg-s95bx09h17";
import headerSvgPaths from "../../imports/Header/svg-cjxbwaizyw";
import imgRectangle1 from "../../imports/음악아이콘탭시/2eb36c9b01328c8d70f2a070f4bd3e2de50b175c.png";
import imgRectangle2 from "../../imports/음악아이콘탭시/ef56ade7278fa4cf408600d9ad242fa1cf591e3a.png";
import imgRectangle3 from "../../imports/음악아이콘탭시/a44e7af8787d80aa04319def031b855232bb2896.png";
import imgRectangle4 from "../../imports/음악아이콘탭시/17aeb1b4a480457ffe548c35f029a2af92cc7c56.png";

interface MusicBottomSheetProps {
  onClose: () => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  onSongSelected?: (selected: boolean) => void;
}

const playlists = [
  {
    title: "[Playlist] 지브리 피아노 OST | 집중 플레이리스트 | 가사 없는 잔잔한 음악 | 모트모트",
    artist: "모트모트",
    image: imgRectangle1,
  },
  {
    title: "[뽀모도로 타이머] 집중력 빡 올려주는 클래식 | 3시간 안에 무조건 끝낸다 | 모트모트",
    artist: "모트모트",
    image: imgRectangle2,
  },
  {
    title: "[Playlist] 집중할 때 듣는 재즈 | 가사 없는 음악 | 모트모트",
    artist: "모트모트",
    image: imgRectangle3,
  },
  {
    title: "[Playlist] 2시간 집중, 할 수 있지? | 가사 없는 잔잔한 음악 | 공부할 때 듣는 플리 | 모트모트",
    artist: "모트모트",
    image: imgRectangle4,
  },
  {
    title: "[Playlist] 공부할 때 듣기 좋은 클래식 모음 | 바흐, 모차르트 | 가사 없는 음악",
    artist: "클래식 모음",
    image: imgRectangle1,
  },
  {
    title: "[Playlist] 카페 분위기 재즈 | 힐링 음악 | 작업용 BGM",
    artist: "재즈 컬렉션",
    image: imgRectangle2,
  },
  {
    title: "[Playlist] 새벽 감성 로파이 | 집중력 UP | Study Music",
    artist: "로파이 뮤직",
    image: imgRectangle3,
  },
  {
    title: "[Playlist] 잔잔한 피아노 연주곡 | 마음이 편안해지는 음악",
    artist: "피아노 연주",
    image: imgRectangle4,
  },
  {
    title: "[Playlist] 빗소리와 함께 듣는 재즈 | 감성 충전 | 힐링 타임",
    artist: "모트모트",
    image: imgRectangle1,
  },
  {
    title: "[Playlist] 집중력 200% 올려주는 어쿠스틱 기타 | 가사 없는 음악",
    artist: "어쿠스틱 기타",
    image: imgRectangle2,
  },
  {
    title: "[Playlist] 시험 기간 필수템 | 3시간 논스톱 집중 음악",
    artist: "스터디 뮤직",
    image: imgRectangle3,
  },
  {
    title: "[Playlist] 새벽 공부 할 때 듣는 음악 | 차분한 클래식",
    artist: "모트모트",
    image: imgRectangle4,
  },
  {
    title: "[Playlist] 편안한 보사노바 | 공부 타이머 | 집중력 향상",
    artist: "보사노바 뮤직",
    image: imgRectangle1,
  },
  {
    title: "[Playlist] 감성 영화 OST 모음 | 잔잔한 배경음악",
    artist: "영화음악",
    image: imgRectangle2,
  },
  {
    title: "[Playlist] 하루 종일 듣기 좋은 인디 음악 | 가사 없는 버전",
    artist: "인디 뮤직",
    image: imgRectangle3,
  },
  {
    title: "[Playlist] 집중이 안 될 때 듣는 음악 | 백색소음 + 피아노",
    artist: "모트모트",
    image: imgRectangle4,
  },
];

function SongRow({
  playlist,
  liked,
  onPlay,
  onToggleLike,
}: {
  playlist: typeof playlists[0];
  liked: boolean;
  onPlay: () => void;
  onToggleLike: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onPlay}
      className="content-stretch flex gap-[12px] items-center py-[4px] relative shrink-0 w-full cursor-pointer active:bg-[#333] transition-colors rounded-[8px]"
    >
      {/* 앨범 썸네일 */}
      <div className="relative rounded-[6px] shrink-0 size-[51px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[6px]">
          <div className="absolute bg-[#d9d9d9] inset-0 rounded-[6px]" />
          <div className="absolute inset-0 overflow-hidden rounded-[6px]">
            <img alt="" className="absolute inset-0 size-full object-cover" src={playlist.image} />
          </div>
        </div>
      </div>
      {/* 제목 / 아티스트 */}
      <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Pretendard:Medium',sans-serif] items-start justify-center leading-[0] min-w-0 not-italic relative">
        <div className="flex flex-col justify-center w-full overflow-hidden relative shrink-0 text-[14px] text-white">
          <p className="leading-[21px] overflow-hidden text-ellipsis whitespace-nowrap">{playlist.title}</p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[#95999d] text-[12px]">
          <p className="leading-[18px] whitespace-nowrap overflow-hidden text-ellipsis">{playlist.artist}</p>
        </div>
      </div>
      {/* 하트 버튼 */}
      <button
        onClick={onToggleLike}
        className="relative shrink-0 size-[20px] cursor-pointer active:scale-90 transition-transform"
        aria-label={liked ? '내 리스트에서 제거' : '내 리스트에 저장'}
        style={{ opacity: liked ? 1 : 1 }}
      >
        {liked ? (
          /* 선택됨: 채워진 하트 */
          <svg
            className="absolute block inset-0 size-full"
            fill="none"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transition: 'opacity 0.2s ease' }}
          >
            <path
              d="M13.9558 2.54604C13.1268 2.54378 12.3143 2.80307 11.6133 3.29362C10.9124 3.78416 10.3519 4.48568 9.99754 5.31614C9.57954 4.30943 8.86233 3.49221 7.96582 3.0011C7.06931 2.50999 6.04783 2.37476 5.07213 2.61802C4.09644 2.86127 3.22567 3.46826 2.6054 4.33753C1.98512 5.20679 1.65292 6.28564 1.66435 7.39372C1.66435 13.75 9.99754 18.3333 9.99754 18.3333C9.99754 18.3333 18.3307 13.75 18.3307 7.39372C18.3307 6.10804 17.8698 4.87501 17.0493 3.96589C16.2289 3.05677 15.1161 2.54604 13.9558 2.54604Z"
              fill="white"
            />
          </svg>
        ) : (
          /* 미선택: 아웃라인 하트 */
          <div className="absolute inset-[11.25%_8.75%_8.68%_8.75%]">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 16.013">
              <path
                clipRule="evenodd"
                d={svgPaths.p17d42a70}
                fill="white"
                fillRule="evenodd"
                style={{ transition: 'opacity 0.2s ease' }}
              />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
}

export default function MusicBottomSheet({ onClose, onPlayingChange, onSongSelected }: MusicBottomSheetProps) {
  const minHeight = Math.round(window.innerHeight * 0.6);
  const maxHeight = Math.round(window.innerHeight * 0.9);

  const [height, setHeight] = useState(() => Math.round(window.innerHeight * 0.6));
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(() => Math.round(window.innerHeight * 0.6));
  const [selectedSong, setSelectedSong] = useState<typeof playlists[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'playlist' | 'myList'>('playlist');
  const [likedSongs, setLikedSongs] = useState<typeof playlists[number][]>([]);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartHeight(height);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const deltaY = startY - currentY;
    const newHeight = Math.min(Math.max(startHeight + deltaY, minHeight), maxHeight);
    setHeight(newHeight);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // 중간 지점보다 높으면 확장, 아니면 축소
    if (height > (minHeight + maxHeight) / 2) {
      setHeight(maxHeight);
    } else {
      setHeight(minHeight);
    }
  };

  const handleSongClick = (playlist: typeof playlists[0]) => {
    setSelectedSong(playlist);
    setIsPlaying(true);
    onPlayingChange?.(true);
    onSongSelected?.(true);
  };

  const toggleLike = (playlist: typeof playlists[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedSongs(prev => {
      const already = prev.some(s => s.title === playlist.title);
      if (already) return prev.filter(s => s.title !== playlist.title);
      return [playlist, ...prev]; // 최신순: 맨 앞에 추가
    });
  };

  const isLiked = (playlist: typeof playlists[0]) =>
    likedSongs.some(s => s.title === playlist.title);

  const togglePlayPause = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    onPlayingChange?.(next);
  };

  const handleScrollAttempt = (e: React.WheelEvent | React.TouchEvent) => {
    if (height < maxHeight) {
      e.preventDefault();
      setHeight(maxHeight);
    }
  };

  return (
    <>
      {/* 딤드 배경 */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* 바텀시트 */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 w-full bg-[#262626] rounded-tl-[16px] rounded-tr-[16px] z-50 transition-all duration-300"
        style={{ height: `${height}px` }}
      >
        {/* 헤더 */}
        <div className="content-stretch flex flex-col gap-[10px] items-start justify-center px-[16px] py-[24px] relative shrink-0 w-full">
          <div className="content-stretch flex gap-[12px] items-start justify-end relative shrink-0 w-full">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px relative">
              <div className="[word-break:break-word] flex flex-col font-['Pretendard:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-white text-[18px] w-full">
                <p className="leading-[27px]">배경음</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="relative size-[24px] cursor-pointer active:scale-95 transition-transform"
            >
              <div className="absolute inset-[16.12%]">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.2627 16.2627">
                  <g>
                    <path clipRule="evenodd" d={headerSvgPaths.p1169c200} fill="white" fillRule="evenodd" />
                    <path clipRule="evenodd" d={headerSvgPaths.p3476e000} fill="white" fillRule="evenodd" />
                  </g>
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div className="content-stretch flex items-center justify-center px-[16px] relative shrink-0 w-full">
          {(['playlist', 'myList'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-[1_0_0] h-[40px] min-w-px relative cursor-pointer"
            >
              <div
                aria-hidden="true"
                className={`absolute border-b-2 border-solid inset-0 pointer-events-none transition-colors duration-200 ${activeTab === tab ? 'border-[#f9f9fa]' : 'border-transparent'}`}
              />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="content-stretch flex items-center justify-center px-[16px] py-[10px] relative size-full">
                  <p className={`font-['Pretendard:Medium',sans-serif] leading-[21px] text-[14px] text-center whitespace-nowrap transition-colors duration-200 ${activeTab === tab ? 'text-[#f9f9fa]' : 'text-[#6d7278]'}`}>
                    {tab === 'playlist' ? '플레이리스트' : '내 리스트'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 콘텐츠 — 플레이리스트 또는 내 리스트 */}
        <div
          onWheel={handleScrollAttempt}
          onTouchMove={handleScrollAttempt}
          className={`flex flex-col gap-[16px] p-[16px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${height >= maxHeight ? 'overflow-y-auto' : 'overflow-y-hidden'}`}
          style={{ maxHeight: `${height - 130 - (selectedSong ? 83 : 0)}px` }}
        >
          {activeTab === 'playlist' ? (
            /* 플레이리스트 탭 */
            playlists.map((playlist, index) => (
              <SongRow
                key={index}
                playlist={playlist}
                liked={isLiked(playlist)}
                onPlay={() => handleSongClick(playlist)}
                onToggleLike={(e) => toggleLike(playlist, e)}
              />
            ))
          ) : likedSongs.length === 0 ? (
            /* 내 리스트 빈 상태 */
            <div className="flex flex-col items-center justify-center gap-[8px] flex-1 w-full text-center" style={{ minHeight: '160px' }}>
              <p className="font-['Pretendard:Medium',sans-serif] text-[16px] leading-[24px] text-white w-full">
                저장된 음악이 없어요
              </p>
              <p className="font-['Pretendard:Medium',sans-serif] text-[14px] leading-[21px] text-[#b6b8b9] w-full">
                하트를 눌러 리스트에 저장해 보세요
              </p>
            </div>
          ) : (
            /* 내 리스트 — 최신순 */
            likedSongs.map((playlist, index) => (
              <SongRow
                key={index}
                playlist={playlist}
                liked={true}
                onPlay={() => handleSongClick(playlist)}
                onToggleLike={(e) => toggleLike(playlist, e)}
              />
            ))
          )}
        </div>

        {/* 하단 플레이어 */}
        {selectedSong && (
          <div className="absolute bottom-0 left-0 w-full bg-[#333] border-t border-[#6d7278]">
            <div className="content-stretch flex gap-[12px] items-center p-[16px] relative shrink-0 w-full">
              {/* 앨범 커버 및 제목 */}
              <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-w-px relative">
                <div className="relative rounded-[6px] shrink-0 size-[51px]">
                  <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[6px]">
                    <div className="absolute bg-[#d9d9d9] inset-0 rounded-[6px]" />
                    <div className="absolute inset-0 overflow-hidden rounded-[6px]">
                      <img alt="" className="absolute inset-0 size-full object-cover" src={selectedSong.image} />
                    </div>
                  </div>
                </div>
                <div className="flex-[1_0_0] min-w-0 relative overflow-hidden">
                  <p className={`font-['Pretendard:Medium',sans-serif] leading-[21px] text-white text-[14px] overflow-hidden whitespace-nowrap ${isPlaying ? 'animate-[scroll_15s_linear_infinite]' : 'text-ellipsis'}`}>
                    <style>{`
                      @keyframes scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                      }
                    `}</style>
                    {isPlaying ? `${selectedSong.title}     ${selectedSong.title}` : selectedSong.title}
                  </p>
                  <div className="absolute bg-gradient-to-r from-[#333] h-[51px] right-0 to-[rgba(51,51,51,0)] top-[-15px] w-[36px]" />
                </div>
              </div>

              {/* 재생 컨트롤 */}
              <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
                {/* 이전 버튼 */}
                <button className="relative shrink-0 size-[24px] cursor-pointer active:scale-95 transition-transform">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <g clipPath="url(#clip0_prev)">
                      <path d={playerSvgPaths.p148ab0f0} fill="white" />
                    </g>
                    <defs>
                      <clipPath id="clip0_prev">
                        <rect fill="white" height="24" width="24" />
                      </clipPath>
                    </defs>
                  </svg>
                </button>

                {/* 재생/일시정지 버튼 */}
                <button
                  onClick={togglePlayPause}
                  className="relative shrink-0 size-[24px] cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="absolute bottom-[21.02%] left-1/4 right-1/4 top-[20.65%]">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 14">
                      <path d={isPlaying ? playerSvgPaths.pc724cc0 : "M0 14V0L12 7L0 14Z"} fill="white" />
                    </svg>
                  </div>
                </button>

                {/* 다음 버튼 */}
                <button className="relative shrink-0 size-[24px] cursor-pointer active:scale-95 transition-transform">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <g clipPath="url(#clip0_next)">
                      <path d={playerSvgPaths.p3a5aedc0} fill="white" />
                    </g>
                    <defs>
                      <clipPath id="clip0_next">
                        <rect fill="white" height="24" width="24" />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
