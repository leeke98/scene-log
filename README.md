# Scene Log — 공연 관람 기록 서비스

연극·뮤지컬 관람 기록을 저장하고 다양한 통계와 리포트를 제공하는 웹 애플리케이션입니다.

## 프로젝트 소개

Scene Log는 사용자가 관람한 공연의 정보(날짜, 작품명, 배우, 좌석, 가격, 별점, 후기 등)를 기록하고, 월별·연도별 통계, 작품별·배우별 분석 리포트를 제공하는 개인 공연 기록 서비스입니다. KOPIS(공연예술통합전산망) 연동으로 공연 정보를 편리하게 검색하고 가져올 수 있습니다.

## 주요 기능

- **사용자 인증** — 이메일/비밀번호 및 Google OAuth 로그인
- **공연 기록 관리** — 티켓 정보 등록, 수정, 삭제
- **캘린더 뷰** — 관람 이력을 달력으로 확인
- **통계 리포트** — 전체 / 작품별 / 배우별 분석 (차트 포함)
- **KOPIS 연동** — 공연 정보 검색 및 자동 입력
- **배우 관리** — 배우 데이터 검색 및 중복 병합

## 기술 스택

### Frontend

| 영역 | 기술 |
|---|---|
| UI 라이브러리 | React 18, TypeScript |
| 빌드 도구 | Vite |
| 라우팅 | React Router DOM |
| 서버 상태 | TanStack Query (React Query) |
| 클라이언트 상태 | Zustand |
| 스타일 | Tailwind CSS, Radix UI (Shadcn/UI 패턴) |
| 차트 | Recharts |
| 아이콘 | lucide-react |
| 드래그 앤 드롭 | @dnd-kit |
| 테스트 | Vitest + jsdom |

### Backend

| 영역 | 기술 |
|---|---|
| 런타임 | Node.js, Express, TypeScript |
| ORM | Prisma |
| 데이터베이스 | PostgreSQL (Supabase) |
| 인증 | JWT (액세스 토큰 + httpOnly 리프레시 토큰) |
| 문서화 | Swagger (OpenAPI) |

## 아키텍처

### 데이터 흐름

```
Page
  └─ TanStack Query hook (src/queries/)
       └─ service 함수 (src/services/)
            └─ apiClient (src/lib/apiClient.ts)
                 └─ Backend REST API
```

- **서버 상태**: TanStack Query가 캐싱, 리페치, 뮤테이션 관리
- **클라이언트 상태**: Zustand (`authStore`) — 인증 정보를 localStorage에 유지

### 주요 디렉토리

```
src/
├── components/       # 도메인별 UI 컴포넌트 (report/, explore/, charts/, ui/)
├── lib/
│   └── apiClient.ts  # JWT Bearer 처리, 401 자동 리다이렉트, 개발 로그
├── pages/            # 라우트 단위 페이지 컴포넌트
├── queries/          # TanStack Query 훅 (auth/, tickets/, reports/, kopis/)
├── services/         # 원시 API 호출 (authApi, ticketApi, reportApi, kopisApi)
├── stores/
│   └── authStore.ts  # Zustand 인증 스토어
└── types/            # 공유 TypeScript 인터페이스
```

## 시작하기

### 필수 요구사항

- Node.js >= 22.12.0
- npm >= 10.0.0

### 환경 변수

| 변수 | 설명 |
|---|---|
| `VITE_API_BASE_URL` | 백엔드 베이스 URL (개발 시 `/api` 프록시 기본값 사용) |
| `VITE_KOPIS_SERVICE_KEY` | KOPIS API 키 |

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (/api → localhost:3001 프록시)
npm run dev

# 프로덕션 빌드 (TypeScript 체크 포함)
npm run build

# 빌드 미리보기
npm run preview

# 린팅
npm run lint

# 테스트
npm run test
```

## 라이선스

개인 프로젝트입니다.
