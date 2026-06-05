# allcll-timer

> 올클 모바일 타이머 앱 — React + TypeScript + Tailwind CSS + Vite

배포 URL: https://allcll-timer-be1xezioj-dot3297s-projects.vercel.app

---

## 기술 스택

| 항목 | 내용 |
|---|---|
| 프레임워크 | React 18 + TypeScript |
| 스타일 | Tailwind CSS v4 + CSS Custom Properties (디자인 토큰) |
| 빌드 | Vite 6 |
| 배포 | Vercel (GitHub Actions 자동 배포) |
| 디자인 | Figma → Pretendard 폰트, 브랜드 컬러 `#9678ff` |

---

## 화면 구성

```
App
├── 홈 화면 (타이머 홈)
│   ├── SharedCalendar (접힌 주간 뷰)
│   └── 타이머 시작 버튼 → CharacterSelection
├── TimerScreen (타이머 메인)
│   ├── 런닝 모드 (배경 영상 + 캐릭터)
│   ├── 시계 모드 (다크 + 비교 바)
│   └── 뽀모도로 모드 (카운트다운 링)
├── YesterdayScreen (어제의 나)
├── TodoScreen (할일)
│   ├── SharedCalendar
│   └── SettingsScreen (카테고리 관리)
└── RankingScreen (랭킹, 타이머 사이드 버튼 진입)
```

---

## 컴포넌트 문서

### BottomNav — 하단 네비게이션 바
타이머·어제의 나·할일 3개 탭으로 구성된 전역 하단 네비게이션.
각 탭은 `activeTab` prop과 비교해 활성/비활성 색상(`#9678FF` / `#6D7278`)을 결정한다.
- **참고:** 랭킹 탭은 제거됨. 랭킹 화면은 타이머 화면 우측 사이드 버튼에서만 진입.

---

### TimerScreen — 타이머 메인 화면
앱의 핵심 화면. 런닝 모드·시계 모드·뽀모도로 모드 세 가지 타이머 형태를 지원하며, 탭 전환 시에도 타이머 상태가 유지된다.
- **런닝 모드:** 배경 영상 + 캐릭터 애니메이션 + 공부 타이머
- **시계 모드:** 다크 배경 + bg-circle + 어제의 나 비교 바
- **뽀모도로 모드:** 25/5분 카운트다운 + 토마토 링 시각화
- **사이드 아이콘:** 랭킹·캐시·배경음·설정 버튼
- **탭 전환 유지:** z-index 레이어링으로 타이머 언마운트 방지

---

### SharedCalendar — 홈·할일 공통 캘린더
홈·할일 화면 공통 캘린더 컴포넌트. 접힌 뷰(주간)와 펼쳐진 뷰(월간) 두 가지 모드를 지원한다.
- **접힌 뷰:** 오늘 날짜 중앙 고정, 좌우 스와이프로 날짜 이동
- **펼쳐진 뷰:** 날짜별 아크 링으로 진행률 시각화
- **progressData:** `{ day, ratio(0~1) }` 배열로 아크 채움 비율 전달
- **홈:** 타이머 공부 시간 기반 (30분=25%, 1시간=50%, 2시간=75%, 3시간+=100%)
- **할일:** 완료 할일 수 / 전체 할일 수 비율

---

### YesterdayScreen — 어제의 나
지난 학습 기록과 비교 정보를 제공하는 화면.
- 지난주 오늘과의 공부 시간 비교
- 역대 최고 기록 카드
- 주간 비교 카드 (이번 주 vs 지난주)
- 헤더 스크롤 시 위로 슬라이드 아웃 애니메이션
- **TODO:** 서버 API 연동 필요 (현재 더미 데이터)

---

### TodoScreen — 할일
카테고리별 할일 CRUD와 캘린더를 통한 날짜별 진행률 시각화를 제공한다.
- 카테고리 칩 필터 / 할일 CRUD / 완료 토글
- 전체 뷰: 카테고리별 그룹 표시
- **TODO:** 서버 API 연동 필요 (현재 로컬 state)

---

### RankingScreen — 랭킹
타이머 사이드 "랭킹" 버튼에서 진입하는 랭킹 전체 화면.
- 고2 / 클럽 탭 전환
- 티어 캐러셀 (로컬 SVG 에셋 `/src/imports/랭킹티어/`)
- **TODO:** 서버 API 연동 필요 (현재 더미 데이터)

---

### MusicBottomSheet — 배경음 바텀시트
타이머 화면 배경음 버튼에서 열리는 바텀시트.

**데이터 소스 (TODO):** YouTube Data API v3 — `@motemote-youtube` 채널
```
1) GET /youtube/v3/channels?forHandle=motemote-youtube&part=id
2) GET /youtube/v3/playlists?channelId={id}&part=snippet&maxResults=20
3) GET /youtube/v3/playlistItems?playlistId={id}&part=snippet&maxResults=50
   → title, thumbnail(mqdefault), videoId 추출
```
**재생 방식:** 숨겨진 YouTube IFrame Player로 백그라운드 오디오 재생
```html
<iframe src="https://www.youtube.com/embed/{videoId}?autoplay=1" style="display:none" />
```
> ⚠️ API 키는 `.env`의 `VITE_YOUTUBE_API_KEY`에 보관 — GitHub에 커밋 금지

---

### CharacterSelection — 캐릭터 선택 온보딩
타이머 시작 전 캐릭터를 선택하는 온보딩 화면.
- 남자·여자·고양이 3종 캐릭터
- **크로마키 처리:** Canvas API로 캐릭터 소개 영상의 배경색 실시간 제거

---

### SettingsScreen — 설정
할일 화면 우상단 설정 아이콘에서 진입하는 카테고리 관리 화면.
- 카테고리 순서 변경 / 숨기기 / 삭제 / 이름 변경

---

### 기타 컴포넌트

| 컴포넌트 | 설명 |
|---|---|
| `CashPopup` | 타이머 캐시 버튼 탭 시 업적·캐시 안내 팝업 |
| `CashHistoryScreen` | 캐시 적립/사용 내역 화면 (TODO: API 연동) |
| `CategoryAddPopup` | 할일 카테고리 추가 팝업 |
| `CategoryRenameSheet` | 카테고리 이름 변경 바텀시트 |
| `CharacterChangeSheet` | 타이머 내 캐릭터 변경 바텀시트 |
| `ConfirmPopup` | 범용 확인/취소 다이얼로그 (재사용) |
| `PomodoroBottomSheet` | 뽀모도로 집중/휴식 시간 설정 바텀시트 |
| `TimerSettingsSheet` | 타이머 허용앱·뽀모도로 설정 바텀시트 |
| `TodoEditSheet` | 할일 항목 편집 바텀시트 |
| `TodoStatsScreen` | 할일 통계 화면 (TODO: 미완성) |

---

## 디자인 시스템

`src/styles/tokens.css` — design.md v1.1.0 기반 CSS 커스텀 프로퍼티

```css
/* 예시 */
--color-bg-weak: #262626;       /* 다크 배경 */
--color-bg-brand: #9678ff;      /* 브랜드 보라 */
--color-fg-text-weak: #f9f9fa;  /* 본문 텍스트 */
--btn-brand-bg: #9678ff;        /* 브랜드 버튼 */
```

| 계층 | 설명 |
|---|---|
| `primitive` | 원시 색상 팔레트 (직접 사용 지양) |
| `semantic` | 의미 기반 토큰 (`color/fg-text/*`, `color/bg/*`, `color/border/*`) |
| `component` | 컴포넌트 전용 토큰 (`button/brand/*` 등) |

---

## 배포

### 자동 배포 (GitHub Actions)
`.github/workflows/deploy.yml` — `main` 브랜치 push 시 자동 빌드 + 배포

필요한 GitHub Secrets:

| Secret | 값 |
|---|---|
| `VERCEL_TOKEN` | Vercel API 토큰 |
| `VERCEL_ORG_ID` | `team_nrwceiVC6TdbhtGW846yUAyG` |
| `VERCEL_PROJECT_ID` | `prj_SPznDxzrzwWNBhU8wlkT43utL3UB` |
