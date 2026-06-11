# allcll-timer

> **올클(allcll) 모바일 타이머 앱** — 공부 시간을 기록하고, 랭킹으로 동기부여를 받는 학습 타이머 서비스

[![Vercel](https://img.shields.io/badge/배포-Vercel-black)](https://ollcl-timer.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-allcll--timer-blue)](https://github.com/dot3297/allcll-timer)

**배포 URL:** https://ollcl-timer.vercel.app

---

## 목차

1. [프로젝트 소개](#프로젝트-소개)
2. [기술 스택](#기술-스택)
3. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
4. [프로젝트 구조](#프로젝트-구조)
5. [화면 구성](#화면-구성)
6. [핵심 기능 상세](#핵심-기능-상세)
7. [컴포넌트 문서](#컴포넌트-문서)
8. [디자인 시스템](#디자인-시스템)
9. [API 연동 계획 (TODO)](#api-연동-계획-todo)
10. [환경 변수](#환경-변수)
11. [배포](#배포)

---

## 프로젝트 소개

올클 타이머는 학생들이 공부 시간을 기록하고 동기부여를 받을 수 있도록 설계된 모바일 웹 앱입니다.

**주요 특징:**
- 🎮 캐릭터와 함께하는 몰입형 공부 타이머 (런닝 모드)
- ⏰ 시계 모드: 어제의 나와 실시간 비교
- 🍅 뽀모도로 타이머 내장
- 📅 캘린더로 공부 기록 시각화 (아크 링)
- 🏆 조별 랭킹으로 경쟁·동기부여
- 📋 카테고리별 할일 관리

---

## 기술 스택

| 항목 | 내용 |
|---|---|
| 프레임워크 | React 18 + TypeScript |
| 스타일 | Tailwind CSS v4 + CSS Custom Properties (디자인 토큰) |
| 빌드 | Vite 6 |
| 애니메이션 | DotLottie, Canvas API (크로마키) |
| 배포 | Vercel + GitHub Actions 자동 배포 |
| 디자인 | Figma — Pretendard 폰트, 브랜드 컬러 `#9678ff` |

---

## 로컬 개발 환경 설정

### 요구사항
- Node.js 20 이상
- npm 10 이상

### 설치 및 실행

```bash
# 1. 레포 클론
git clone https://github.com/dot3297/allcll-timer.git
cd allcll-timer

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행 (http://localhost:5173)
npm run dev

# 4. 프로덕션 빌드
npm run build
```

### 환경 변수 설정 (배경음 기능 사용 시)

`.env` 파일을 프로젝트 루트에 생성:

```env
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

> ⚠️ `.env` 파일은 절대 GitHub에 커밋하지 말 것

---

## 프로젝트 구조

```
src/
├── app/
│   ├── App.tsx                   # 루트 컴포넌트 — 전체 화면 라우팅·상태 관리
│   └── components/
│       ├── TimerScreen.tsx       # 타이머 메인 (런닝/시계/뽀모도로 모드)
│       ├── SharedCalendar.tsx    # 홈·할일 공통 캘린더
│       ├── YesterdayScreen.tsx   # 어제의 나 통계 화면
│       ├── TodoScreen.tsx        # 할일 화면
│       ├── SettingsScreen.tsx    # 카테고리 설정 화면
│       ├── RankingScreen.tsx     # 랭킹 화면
│       ├── CharacterSelection.tsx# 캐릭터 선택 온보딩
│       ├── BottomNav.tsx         # 하단 네비게이션 바
│       ├── MusicBottomSheet.tsx  # 배경음 바텀시트
│       ├── TimerSettingsSheet.tsx# 타이머 설정 바텀시트
│       ├── PomodoroBottomSheet.tsx# 뽀모도로 설정 바텀시트
│       ├── CashPopup.tsx         # 캐시·업적 안내 팝업
│       ├── CashHistoryScreen.tsx # 캐시 내역 화면
│       ├── CategoryAddPopup.tsx  # 카테고리 추가 팝업
│       ├── CategoryRenameSheet.tsx # 카테고리 이름 변경
│       ├── CharacterChangeSheet.tsx# 캐릭터 변경 바텀시트
│       ├── ConfirmPopup.tsx      # 범용 확인 팝업
│       ├── TodoEditSheet.tsx     # 할일 편집 바텀시트
│       └── TodoStatsScreen.tsx   # 할일 통계 (미완성)
├── imports/                      # 에셋 (이미지·영상·SVG·Lottie)
│   ├── 캐릭터선여자/              # 캐릭터 이미지·영상
│   ├── 랭킹티어/                  # 티어 배지 SVG
│   ├── 타이머종료/                # 종료 배경 영상·Confetti
│   └── ...
└── styles/
    ├── tokens.css                # 디자인 토큰 CSS 변수 (design.md 기반)
    ├── globals.css               # 전역 스타일
    └── index.css                 # 스타일 엔트리
```

---

## 화면 구성

```
App
├── 홈 화면
│   ├── SharedCalendar (주간 뷰, 공부 시간 기반 아크 링)
│   ├── 오늘 총 공부 시간 표시
│   ├── 뽀모도로 토글
│   └── 타이머 시작 → CharacterSelection → TimerScreen
│
├── TimerScreen (타이머 메인)
│   ├── [런닝 모드]  배경 영상 + 캐릭터 + 공부 타이머
│   ├── [시계 모드]  다크 배경 + 어제의 나 비교 바
│   ├── [뽀모도로]   25분/5분 카운트다운 + 토마토 링
│   └── 사이드: 랭킹 / 캐시 / 배경음 / 설정
│
├── YesterdayScreen (어제의 나)
│   ├── 지난주 오늘 대비 비교 카드
│   ├── 역대 최고 기록 카드
│   └── 주간 평균 비교 카드
│
├── TodoScreen (할일)
│   ├── SharedCalendar (완료 할일 비율 아크 링)
│   ├── 카테고리 칩 필터
│   ├── 할일 목록 (추가·수정·삭제·완료 토글)
│   └── SettingsScreen (카테고리 관리)
│
└── RankingScreen (타이머 사이드 버튼 진입)
    ├── 고2 / 클럽 탭
    └── 티어 캐러셀 + 유저 순위 리스트
```

---

## 핵심 기능 상세

### 타이머 상태 유지 (탭 전환 시)

탭 전환 시 TimerScreen이 언마운트되지 않도록 **z-index 레이어링** 방식을 사용합니다.

```tsx
// App.tsx — 타이머 화면은 항상 마운트 유지, z-index로 다른 화면 위에 덮기
{showTimerScreen && (
  <div className="fixed inset-0 z-[60]">
    <TimerScreen ... />
  </div>
)}
```

### 캘린더 아크 링 — 진행률 계산 방식

**홈 화면 (타이머 기반):**

| 공부 시간 | 아크 비율 |
|---|---|
| 0 ~ 30분 | 0 ~ 25% (선형) |
| 30분 ~ 1시간 | 25 ~ 50% (선형) |
| 1시간 ~ 2시간 | 50 ~ 75% (선형) |
| 2시간 ~ 3시간 이상 | 75 ~ 100% (선형) |

**할일 화면:** `완료한 할일 수 / 전체 할일 수 × 100%`

### 크로마키 캐릭터 렌더링

`CharacterSelection.tsx`의 `VideoChromaKey` 컴포넌트가 Canvas API로 캐릭터 소개 영상의 배경색을 실시간 제거합니다.

```
영상 프레임 → Canvas drawImage → 픽셀 순회 → 배경색 감지(테두리 샘플링) → Alpha=0 처리 → 표시
```

---

## 컴포넌트 문서

### TimerScreen — 타이머 메인 화면

| 모드 | 트리거 | 특징 |
|---|---|---|
| 런닝 | 기본 | 배경 영상 재생, 캐릭터 표시, 공부 타이머 |
| 시계 | 모드 스위처 "시계" 탭 | 다크 배경 + 어제의 나 비교 바 표시 |
| 뽀모도로 | 설정에서 뽀모도로 ON | 집중/휴식 카운트다운, 토마토 링 |

**State:**
```ts
mainTimer      // 총 공부 시간 (초)
subjectTimer   // 현재 과목 시간 (초) — 쉴래요 시 정지
totalTimer     // 오늘 총 시간 (초)
isResting      // 쉴래요 상태
timerMode      // 'running' | 'clock'
cashBalance    // 현재 보유 캐시 잔액
```

---

### SharedCalendar — 공통 캘린더

**Props:**
```ts
theme: 'light' | 'dark'           // 라이트/다크 테마
progressData: { day, ratio }[]    // 날짜별 아크 비율 (0~1)
isCollapsed: boolean               // true = 주간 뷰, false = 월간 뷰
selectedDay: { year, month, day } | null  // 선택된 날짜
onDaySelect: (day) => void         // 날짜 선택 콜백
onToggle: () => void               // 접힘/펼침 토글 콜백
```

---

### YesterdayScreen — 어제의 나

수평 바 차트로 공부 시간을 비교합니다.

```
진입 → barsAnimated: false → 80ms 후 true (바 채움 애니메이션 시작)
     → 80+680ms 후 pillsVisible: true (툴팁 등장)
```

스크롤 다운 시 헤더가 위로 슬라이드 아웃 (`height: 0 + opacity: 0` transition).

---

### MusicBottomSheet — 배경음

**현재:** 하드코딩된 더미 플레이리스트 표시

**연동 예정:** YouTube Data API v3 — `@motemote-youtube` 채널

```
채널 ID 조회 → 플레이리스트 목록 → 영상 목록 (title + thumbnail + videoId)
→ videoId로 IFrame Player 백그라운드 재생
```

```env
VITE_YOUTUBE_API_KEY=...  # .env에 보관, 절대 커밋 금지
```

---

### BottomNav — 하단 네비게이션

```ts
type BottomNavTab = 'timer' | 'yesterday' | 'todo'
// 랭킹 탭 제거됨 — 타이머 화면 우측 사이드 버튼에서만 진입
```

---

### 기타 컴포넌트

| 컴포넌트 | 진입 경로 | 설명 |
|---|---|---|
| `CharacterSelection` | 홈 → 타이머 시작 | 캐릭터 선택 온보딩, 크로마키 영상 |
| `CashPopup` | 타이머 → 캐시 버튼 | 업적·캐시 안내 팝업 |
| `CashHistoryScreen` | CashPopup → 내 캐시 히스토리 | 캐시 적립/사용 내역 (TODO: API) |
| `SettingsScreen` | 할일 → 설정 아이콘 | 카테고리 순서변경·숨기기·삭제·이름변경 |
| `RankingScreen` | 타이머 → 랭킹 버튼 | 티어 캐러셀·유저 순위 (TODO: API) |
| `TimerSettingsSheet` | 타이머 → 설정 | 허용앱 OFF·뽀모도로 토글 |
| `PomodoroBottomSheet` | 타이머 설정 → 뽀모도로 ON | 집중/휴식 시간 드럼롤 설정 |
| `CategoryAddPopup` | 할일 → 전체 + | 카테고리 이름 입력 팝업 |
| `CategoryRenameSheet` | 설정 → 이름 변경 | 기존 이름 pre-fill 바텀시트 |
| `ConfirmPopup` | 전체 삭제 등 | 범용 확인/취소 다이얼로그 (재사용) |
| `TodoEditSheet` | 할일 항목 탭 | 할일 수정·삭제 바텀시트 |
| `CharacterChangeSheet` | 타이머 설정 | 캐릭터 변경 바텀시트 (TODO: localhost 에셋 교체) |
| `TodoStatsScreen` | 할일 → 통계 아이콘 | 할일 통계 화면 (미완성) |

---

## 디자인 시스템

`src/styles/tokens.css` — `design.md v1.1.0` 기반 CSS 커스텀 프로퍼티 (3계층)

```
primitive (원시값) → semantic (의미·역할) → component (컴포넌트 전용)
```

### 주요 토큰

```css
/* 배경 */
--color-bg-weak: #262626;           /* 다크 메인 배경 */
--color-bg-muted: #333333;          /* 카드·바텀시트 배경 */
--color-bg-brand: #9678ff;          /* 브랜드 보라 */
--color-bg-brand-pressed: #8461fa;  /* 브랜드 눌림 */

/* 텍스트 */
--color-fg-text-solid: #ffffff;     /* 주요 텍스트 */
--color-fg-text-weak: #f9f9fa;      /* 본문 텍스트 */
--color-fg-text-muted: #b6b8b9;     /* 보조 텍스트 */
--color-fg-text-disable: #6d7278;   /* 비활성 텍스트 */
--color-fg-text-brand: #ab94ff;     /* 브랜드 텍스트 */

/* 테두리 */
--color-border-weak: #6d7278;       /* 기본 테두리 */
--color-border-brand: #9678ff;      /* 브랜드 테두리 */

/* 버튼 */
--btn-brand-bg: #9678ff;
--btn-brand-bg-pressed: #654ec1;
--btn-neutral-bg: #333333;
```

### 사용 방법

```tsx
// Tailwind 임의값에 CSS 변수 삽입
<div className="bg-[var(--color-bg-weak)] text-[var(--color-fg-text-weak)]">
```

---

## API 연동 계획 (TODO)

### 1. 배경음 — YouTube Data API v3

```
VITE_YOUTUBE_API_KEY 발급 → .env 설정
→ @motemote-youtube 채널 영상 목록 로드
→ IFrame Player로 백그라운드 재생
```

### 2. 어제의 나 — 공부 기록 API

```
GET /api/study-records?userId={id}&date={YYYY-MM-DD}
→ 오늘 / 지난주 오늘 / 역대 최고 기록 반환
```

### 3. 랭킹 — 실시간 랭킹 API

```
GET /api/ranking?type=grade2|club&tier={1~4}
→ 유저 순위 리스트 (닉네임, 공부 시간, 아바타)
```

### 4. 캐시·업적 — 서버 연동

```
GET  /api/cash/balance     → 현재 보유 캐시
GET  /api/cash/history     → 적립/사용 내역
POST /api/study/complete   → 타이머 종료 시 기록 저장 + 캐시 지급
```

### 5. 할일 — 영구 저장

```
현재: 로컬 useState (새로고침 시 초기화)
예정: GET/POST/PATCH/DELETE /api/todos
```

---

## 환경 변수

| 변수명 | 필수 | 설명 |
|---|---|---|
| `VITE_YOUTUBE_API_KEY` | 배경음 기능 시 | YouTube Data API v3 키 |

---

## 배포

### 자동 배포 (GitHub Actions)

`main` 브랜치에 push하면 자동으로 빌드 + Vercel 배포가 실행됩니다.

```
git push origin main
→ GitHub Actions 트리거
→ npm ci + npm run build
→ Vercel 배포
```

**필요한 GitHub Secrets** (`Settings → Secrets → Actions`):

| Secret | 설명 |
|---|---|
| `VERCEL_TOKEN` | Vercel 계정 API 토큰 |
| `VERCEL_ORG_ID` | `team_nrwceiVC6TdbhtGW846yUAyG` |
| `VERCEL_PROJECT_ID` | `prj_SPznDxzrzwWNBhU8wlkT43utL3UB` |

### 수동 배포

```bash
npm run build
# dist/ 폴더를 Vercel에 업로드
```

---

## 참고

- **Figma 디자인:** [모바일 캘린더 구현](https://www.figma.com/design/sowMWJX7L3wTWyhopFYT17)
- **디자인 토큰 명세:** `design.md` (프로젝트 루트의 별도 문서)
- **브랜드 컬러:** `#9678ff` (Purple)
- **폰트:** Pretendard (Regular 400 / Medium 500 / SemiBold 600)
