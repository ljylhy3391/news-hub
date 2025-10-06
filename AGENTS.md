# Repository Guidelines

## 프로젝트 구조 및 모듈 배치
Next.js 15 App Router 경로는 `src/app`에 있으니 새 페이지는 서버 컴포넌트로 추가하고, 클라이언트 훅이 필요할 때만 `"use client"`를 선언하세요. 공용 UI는 카드·헤더·그리드 등을 모아 둔 `src/components`, RSS 파싱과 이미지 보강 로직은 `src/lib`, 타입 정의는 `src/types`에 정리되어 있습니다. 정적 자산은 `public/`에 두고, 디자인 참고 자료는 `principles/news-ui.json`에서 확인할 수 있습니다.

## 빌드·테스트·개발 명령어
- `npm install` : 의존성을 설치하며 `package-lock.json`을 반드시 커밋합니다.
- `npm run dev` : Turbopack 기반 개발 서버를 `http://localhost:3000`에서 실행합니다.
- `npm run build` : 프로덕션용 Next.js 빌드를 수행하므로 구성 변경 전후로 확인하세요.
- `npm run start` : 빌드 결과를 로컬 프로덕션 환경에서 구동합니다.
- `npm run lint` : Next.js/ESLint 플랫 설정으로 정적 분석을 수행하니 PR 전 기본 검증에 포함하세요.

## 코딩 스타일 및 네이밍 규칙
`tsconfig.json`은 strict 옵션을 켠 상태이므로 공개 API에는 명시적 타입을 부여합니다. 기본 들여쓰기는 2칸, 불변 데이터는 `const`를 우선 사용하고, `@/` 경로 별칭으로 `src/` 하위 모듈을 import하세요. UI 스타일은 Tailwind 클래스 인라인 작성이 기본이며, 반복 사용되는 패턴만 헬퍼로 분리합니다. 컴포넌트 파일명은 `HeroCard.tsx`처럼 PascalCase를 유지하고, 기능 단위 폴더를 만들어 관련 모듈을 묶습니다.

## 테스트 가이드
현재 자동화 테스트 툴체인은 미구현 상태입니다. 새 스펙을 도입한다면 React Testing Library나 Playwright를 고려하고, 실행 파일은 `src/**/__tests__`에 임시 보관하세요. 그때까지는 수동 검증에 집중해 홈, 태그별 페이지, 북마크 흐름을 순회하며 RSS fetch 로그를 확인합니다. PR 전 `npm run lint`를 실행해 타입·접근성 이슈를 사전에 제거하세요.

## 커밋 및 PR 가이드라인
커밋 메시지는 `feat(bookmark): ...`, `fix(image): ...`처럼 스코프가 있는 형태를 사용하며, 연관 영역이 여러 개면 복수 스코프도 허용합니다. 한국어 요약은 짧고 명료하면 괜찮습니다. 하나의 커밋에는 하나의 주제를 담고, 필요한 경우 본문에 관련 파일이나 맥락을 덧붙이세요. PR에는 변경 요약, 관련 이슈 링크, UI 변경 시 스크린샷 또는 캡처, 실행한 명령어 체크(예: lint, build, 수동 테스트)를 포함합니다. 새 RSS 소스나 이미지 도메인을 추가했다면 리뷰어가 `next.config.ts`를 검토할 수 있도록 명시하세요.

## 보안 및 구성 주의사항
외부 이미지를 추가할 때는 `next.config.ts`의 `images.remotePatterns`를 갱신하고 이유를 기록하세요. RSS 보강과 관련된 타임아웃·동시성·캐시 TTL 값은 `src/lib/getFeed.ts`에 있으니 변경 시 보수적으로 조정하고 PR 설명에 언급합니다. 향후 API 키나 비밀 값은 `.env.local`에 저장하고, 필요한 환경 변수를 문서나 PR에서 안내하되 민감 정보는 커밋하지 마세요.
