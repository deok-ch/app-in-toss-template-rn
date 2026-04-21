# CLAUDE.md — my-granite-app (Apps in Toss)

Apps in Toss 플랫폼 위에서 동작하는 Granite React Native 앱 개발 규칙.

---

## 프로젝트 개요

| 항목           | 값                                                                     |
| -------------- | ---------------------------------------------------------------------- |
| 앱 이름        | `my-granite-app` (패키지명), `app-in-toss-app` (granite appName)       |
| URL Scheme     | `intoss://app-in-toss-app`                                             |
| React Native   | 0.84.0                                                                 |
| React          | 19.2.3                                                                 |
| Framework      | `@granite-js/react-native` 1.0.4                                       |
| BaaS           | `@apps-in-toss/framework` 2.4.1                                        |
| Design System  | `@toss/tds-react-native` 2.0.2                                         |
| TDS React 지원 | **React 18까지만 공식 지원** (현재 프로젝트는 19.2.3 — 동작 확인 필요) |

---

## 디렉토리 구조

```
my-granite-app/
├── src/
│   ├── _app.tsx          # 앱 진입점 — 절대 수정 최소화
│   └── pages/            # 실제 페이지 컴포넌트 작성 위치
│       ├── index.tsx     → intoss://app-in-toss-app
│       └── about.tsx     → intoss://app-in-toss-app/about
├── pages/                # 루트 re-export shim (자동 생성, 직접 편집 금지)
├── src/router.gen.ts     # 라우터 타입 (자동 생성, 직접 편집 금지)
├── require.context.ts    # 페이지 컨텍스트 (수정 금지)
└── granite.config.ts     # 앱 설정
```

**규칙**: 새 페이지는 반드시 `src/pages/` 에 추가한다. `pages/` (루트) 파일은 직접 편집하지 않는다.

---

## 라우팅 규칙

### 파일 기반 라우팅 (Next.js 스타일)

| 파일 경로                   | URL                                    |
| --------------------------- | -------------------------------------- |
| `src/pages/index.tsx`       | `intoss://app-in-toss-app`             |
| `src/pages/about.tsx`       | `intoss://app-in-toss-app/about`       |
| `src/pages/item/index.tsx`  | `intoss://app-in-toss-app/item`        |
| `src/pages/item/detail.tsx` | `intoss://app-in-toss-app/item/detail` |

### 페이지 컴포넌트 패턴 (반드시 준수)

```typescript
import { createRoute } from '@granite-js/react-native';

// Route export는 파일당 하나, 이름은 반드시 `Route`
export const Route = createRoute('/your-path', {
  component: Page,
});

function Page() {
  const navigation = Route.useNavigation();

  return (
    // JSX
  );
}
```

- `createRoute` 첫 번째 인자: 해당 파일의 URL 경로 (예: `'/'`, `'/about'`)
- `component`: 페이지 렌더링 컴포넌트
- `Route.useNavigation()`: 페이지 내 내비게이션 훅 — 다른 훅/라이브러리로 대체 불가

### 내비게이션

```typescript
const navigation = Route.useNavigation();

// 다른 페이지로 이동
navigation.navigate('/about');

// 파라미터 전달 (라우터 타입 선언이 된 경우)
navigation.navigate('/item/detail', { id: 123 });
```

---

## 앱 진입점 (`src/_app.tsx`)

```typescript
import { AppsInToss } from '@apps-in-toss/framework';
import { PropsWithChildren } from 'react';
import { InitialProps } from '@granite-js/react-native';
import { context } from '../require.context';

function AppContainer({ children }: PropsWithChildren<InitialProps>) {
  return <>{children}</>;
}

export default AppsInToss.registerApp(AppContainer, { context });
```

TDS를 사용하려면 `TDSProvider`를 `AppContainer` 안에 추가해야 한다:

```typescript
import { AppsInToss } from '@apps-in-toss/framework';
import { PropsWithChildren } from 'react';
import { InitialProps } from '@granite-js/react-native';
import { TDSProvider } from '@toss/tds-react-native';
import { context } from '../require.context';

function AppContainer({ children }: PropsWithChildren<InitialProps>) {
  return (
    <TDSProvider>
      {children}
    </TDSProvider>
  );
}

export default AppsInToss.registerApp(AppContainer, { context });
```

- `TDSProvider`는 반드시 앱 루트에서 한 번만 선언한다.
- 다른 전역 Provider가 있을 경우 `TDSProvider` 안쪽에 중첩한다.
- `AppsInToss.registerApp` 호출 구조는 변경하지 않는다.

---

## 설정 (`granite.config.ts`)

```typescript
import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  scheme: 'intoss',
  appName: 'app-in-toss-app', // Apps in Toss 콘솔 앱 이름과 반드시 일치
  plugins: [
    appsInToss({
      brand: {
        displayName: 'app-in-toss-app', // 네비게이션 바 레이블 (한글 가능)
        primaryColor: '#3182F6', // RGB HEX 형식
        icon: '', // 아이콘 이미지 URL (미정이면 빈 문자열)
      },
      permissions: [],
    }),
  ],
});
```

- `appName`은 Apps in Toss 콘솔에 등록된 앱 이름과 반드시 일치해야 한다.
- `primaryColor`는 TDS 컴포넌트의 기본 색상에 반영된다.

---

## 개발 서버

```bash
# 개발 서버 시작
npm run dev

# 빌드 (.ait 파일 생성)
npm run build

# 배포
npm run deploy
```

### iOS 시뮬레이터 테스트

1. Apps in Toss 샌드박스 앱 실행
2. Scheme 입력: `intoss://app-in-toss-app`
3. "Bundling {n}%..." 메시지 → Metro 연결 성공

### iOS 실기기 테스트

```bash
# Mac IP 확인
ipconfig getifaddr en0
```

1. 개발 머신과 같은 WiFi 연결
2. "Local Network" 권한 허용
3. 샌드박스 앱 설정에서 IP 주소 입력

### Android 테스트

```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5173 tcp:5173

# 연결 확인
adb reverse --list
```

---

## TypeScript 규칙

`tsconfig.json` strict 옵션이 모두 활성화되어 있다.

- `strict: true`
- `noUnusedLocals: true` — 사용하지 않는 지역 변수 금지
- `noUnusedParameters: true` — 사용하지 않는 파라미터 금지
- `noImplicitReturns: true` — 모든 코드 경로에서 반환값 명시
- `noUncheckedIndexedAccess: true` — 배열/객체 접근 시 undefined 가능성 고려
- `baseUrl: "src"` — `src/` 기준 절대 경로 임포트 사용 가능

---

## TDS (Toss Design System) 사용 규칙

### 설치 및 버전

```bash
npm install @toss/tds-react-native
```

> **주의**: `@toss/tds-react-native`는 공식적으로 React 18까지만 지원한다.
> 이 프로젝트는 React 19.2.3을 사용하므로, TDS 컴포넌트 동작에 이상이 있을 경우 React 버전 비호환을 먼저 의심한다.

### 컴포넌트 임포트 패턴

```typescript
import { Button, Badge, Toast } from '@toss/tds-react-native';
```

### 사용 가능한 컴포넌트 (전체 목록)

#### Foundation

| 컴포넌트   | 역할                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| Colors     | Grey·Blue·Red 등 9가지 색상 계열 × 10단계 토큰 + 배경 시맨틱 토큰 제공 |
| Typography | 7개 본문 + 13개 서브 토큰 계층, 접근성 설정에 따라 자동 스케일         |

#### Interactive

| 컴포넌트          | 역할                                                                              |
| ----------------- | --------------------------------------------------------------------------------- |
| Button            | 액션 실행 버튼. fill/weak 스타일, primary/danger/light/dark 타입, tiny~big 사이즈 |
| Icon Button       | 아이콘만으로 액션을 표현하는 버튼. 깔끔한 UI 유지에 적합                          |
| Text Button       | 텍스트 기반 인터랙션 버튼. 서브 액션·링크 형태의 버튼에 사용                      |
| Checkbox          | 다중 선택 항목. 체크/미체크 상태 표현, 동시에 여러 항목 선택 가능                 |
| Radio             | 단일 선택 항목. 여러 선택지 중 하나만 선택할 때 사용                              |
| Switch            | On/Off 토글. 설정 활성화·비활성화에 사용                                          |
| Dropdown          | 버튼 클릭 시 펼쳐지는 드롭다운 메뉴에서 하나의 옵션 선택                          |
| Segmented Control | 여러 선택지를 시각적으로 구분된 세그먼트로 표시하는 단일 선택 UI                  |

#### Input

| 컴포넌트        | 역할                                                                   |
| --------------- | ---------------------------------------------------------------------- |
| Text Field      | 텍스트 입력 필드. 다양한 스타일과 유효성 상태 지원                     |
| Search Field    | 검색 아이콘·지우기 버튼 내장 검색 입력 필드                            |
| Keypad          | 숫자 입력용 가상 키패드. 금액·PIN·전화번호 입력에 사용                 |
| Numeric Spinner | +/- 버튼으로 정수를 조정하는 입력 컴포넌트. 키보드 없이 숫자 입력 가능 |

#### Display

| 컴포넌트    | 역할                                                              |
| ----------- | ----------------------------------------------------------------- |
| Amount Top  | 금액·중요 수치를 화면 상단에 크게 표시. 서브타이틀·버튼 슬롯 포함 |
| Badge       | 항목의 상태를 강조해 빠르게 인식시키는 뱃지                       |
| List        | 여러 항목을 세로로 나열, 항목 사이 구분선 자동 처리               |
| List Row    | 좌·중·우 섹션을 가진 리스트 개별 행                               |
| List Header | 섹션 제목·설명·인터랙션 요소를 포함한 리스트 헤더                 |
| List Footer | 리스트 하단에 "더 보기" 형태로 추가 항목 로드를 유도하는 푸터     |
| Board Row   | 제목 클릭으로 펼치고 접는 아코디언. 많은 정보를 좁은 공간에 표시  |
| Table Row   | 좌·우 두 칼럼 구성의 테이블 행. 라벨-값 쌍 표시에 적합            |
| Toast       | 짧은 메시지를 일시적으로 표시하다 자동 사라지는 알림              |
| Loader      | 데이터 로딩·처리 중임을 알리는 애니메이션 로딩 인디케이터         |
| Skeleton    | 콘텐츠 로딩 전 레이아웃 형태를 유지하는 플레이스홀더              |
| Post        | 공지·이벤트 등 장문 텍스트를 제목·본문·목록 구조로 스타일링       |
| Error Page  | HTTP 상태 코드 기반으로 적절한 오류 메시지와 이미지를 자동 표시   |
| Result      | 작업 완료·실패 결과를 성공/오류 상태로 시각화하는 결과 화면       |
| Rating      | 별점 표시 및 사용자 평가 수집                                     |
| Highlight   | 특정 요소를 강조하고 설명을 표시. 온보딩·기능 안내에 적합         |

#### Layout

| 컴포넌트     | 역할                                                            |
| ------------ | --------------------------------------------------------------- |
| Navbar       | 화면 상단 내비게이션 바. 뒤로가기·타이틀·액션 버튼 슬롯 제공    |
| Tab          | 단일 화면에서 여러 콘텐츠를 탭으로 전환                         |
| Carousel     | 여러 항목을 가로 스크롤로 탐색하는 슬라이드 레이아웃            |
| Grid List    | 1·2·3열 그리드 레이아웃으로 항목 배치                           |
| Stepper      | 순차적 단계를 시각적으로 표시. 멀티스텝 프로세스 진행 상황 안내 |
| Progress Bar | 작업 진행률을 시각적으로 표시하는 프로그레스 바                 |
| Slider       | 슬라이딩 제스처로 값 선택. 볼륨·밝기·범위 선택에 사용           |

#### Visual

| 컴포넌트 | 역할                                                              |
| -------- | ----------------------------------------------------------------- |
| Asset    | 이미지·아이콘·Lottie 애니메이션을 표준 프레임으로 표시            |
| Border   | 요소 사이에 구분선을 그어 UI 계층 명확화. 리스트·섹션 구분에 사용 |
| Gradient | 선형·방사형 그라디언트 배경 효과 생성                             |
| Shadow   | iOS·Android 각각에 최적화된 플랫폼별 그림자 효과 자동 적용        |

#### Overlay

| 컴포넌트 | 역할                                                                      |
| -------- | ------------------------------------------------------------------------- |
| Dialog   | 중요 정보 제공 또는 확인 요청을 위한 모달. AlertDialog·ConfirmDialog 제공 |

### Typography 토큰 레퍼런스

폰트 사이즈·줄간격을 직접 숫자로 하드코딩하지 않는다. 아래 토큰을 사용한다.

| 토큰              | 크기 | 줄간격 | 용도                            |
| ----------------- | ---- | ------ | ------------------------------- |
| Typography 1      | 30px | 40px   | 매우 큰 제목                    |
| sub Typography 1  | 29px | 38px   |                                 |
| sub Typography 2  | 28px | 37px   |                                 |
| sub Typography 3  | 27px | 36px   |                                 |
| Typography 2      | 26px | 35px   | 큰 제목                         |
| sub Typography 4  | 25px | 34px   |                                 |
| sub Typography 5  | 24px | 33px   |                                 |
| sub Typography 6  | 23px | 32px   |                                 |
| Typography 3      | 22px | 31px   | 일반 제목                       |
| sub Typography 7  | 21px | 30px   |                                 |
| Typography 4      | 20px | 29px   | 작은 제목                       |
| sub Typography 8  | 19px | 28px   |                                 |
| sub Typography 9  | 18px | 27px   |                                 |
| Typography 5      | 17px | 25.5px | 본문                            |
| sub Typography 10 | 16px | 24px   |                                 |
| Typography 6      | 15px | 22.5px | 작은 본문                       |
| sub Typography 11 | 14px | 21px   |                                 |
| Typography 7      | 13px | 19.5px | 부가 정보 (안 읽어도 됨)        |
| sub Typography 12 | 12px | 18px   |                                 |
| sub Typography 13 | 11px | 16.5px | 비필수 정보 (아예 안 읽어도 됨) |

iOS 접근성 설정에 따라 Large(100%) ~ A11y_xxxLarge(310%)까지 자동 스케일된다.

```typescript
// ❌ 금지 — 직접 숫자 하드코딩
<Text style={{ fontSize: 17, lineHeight: 25.5 }}>텍스트</Text>

// ✅ 권장 — TDS Typography 컴포넌트 사용
import { Typography } from '@toss/tds-react-native';
<Typography.Body>텍스트</Typography.Body>
```

---

### Colors 토큰 레퍼런스

`colors.*` 토큰을 직접 HEX 값 대신 사용한다.

```typescript
import { colors } from '@toss/tds-react-native';

// 예시
backgroundColor: colors.blue500; // #3182f6 (토스 기본 블루)
color: colors.grey900; // #191f28 (기본 텍스트)
borderColor: colors.grey200; // #e5e8eb (구분선)
```

#### Grey (텍스트·배경·구분선)

| 토큰             | HEX     | 주요 용도               |
| ---------------- | ------- | ----------------------- |
| `colors.grey50`  | #f9fafb | 가장 밝은 배경          |
| `colors.grey100` | #f2f4f6 | 섹션 배경               |
| `colors.grey200` | #e5e8eb | 구분선·테두리           |
| `colors.grey300` | #d1d6db | 비활성 테두리           |
| `colors.grey400` | #b0b8c1 | placeholder             |
| `colors.grey500` | #8b95a1 | 보조 텍스트             |
| `colors.grey600` | #6b7684 | 서브 텍스트             |
| `colors.grey700` | #4e5968 | 본문 보조               |
| `colors.grey800` | #333d4b | 본문                    |
| `colors.grey900` | #191f28 | 기본 텍스트 (가장 진함) |

#### Blue (주요 액션·브랜드)

| 토큰             | HEX     | 주요 용도            |
| ---------------- | ------- | -------------------- |
| `colors.blue50`  | #e8f3ff | 선택 배경            |
| `colors.blue100` | #c9e2ff | 강조 배경            |
| `colors.blue200` | #90c2ff |                      |
| `colors.blue300` | #64a8ff |                      |
| `colors.blue400` | #4593fc |                      |
| `colors.blue500` | #3182f6 | **기본 브랜드 컬러** |
| `colors.blue600` | #2272eb | hover/pressed        |
| `colors.blue700` | #1b64da |                      |
| `colors.blue800` | #1957c2 |                      |
| `colors.blue900` | #194aa6 | 가장 진한 블루       |

#### Red (오류·위험·경고)

| 토큰            | HEX     | 주요 용도               |
| --------------- | ------- | ----------------------- |
| `colors.red50`  | #ffeeee | 오류 배경               |
| `colors.red100` | #ffd4d6 |                         |
| `colors.red200` | #feafb4 |                         |
| `colors.red300` | #fb8890 |                         |
| `colors.red400` | #f66570 |                         |
| `colors.red500` | #f04452 | **기본 오류/위험 컬러** |
| `colors.red600` | #e42939 |                         |
| `colors.red700` | #d22030 |                         |
| `colors.red800` | #bc1b2a |                         |
| `colors.red900` | #a51926 |                         |

#### 그 외 색상 계열

| 계열   | 500 기준값 | 주요 용도       |
| ------ | ---------- | --------------- |
| Orange | #fe9800    | 주의·알림       |
| Yellow | #ffc342    | 강조·하이라이트 |
| Green  | #03b26c    | 성공·완료·수익  |
| Teal   | #18a5a5    | 정보·중립 강조  |
| Purple | #a234c7    | 특수 강조       |

각 계열 모두 50~900 10단계 토큰 제공 (`colors.orange500`, `colors.green200` 등).

#### Grey Opacity (오버레이·딤 처리)

| 토큰                    | 투명도 | 주요 용도     |
| ----------------------- | ------ | ------------- |
| `colors.greyOpacity50`  | 2%     |               |
| `colors.greyOpacity100` | 5%     |               |
| `colors.greyOpacity200` | 10%    | 약한 딤       |
| `colors.greyOpacity300` | 18%    |               |
| `colors.greyOpacity400` | 31%    |               |
| `colors.greyOpacity500` | 46%    | 중간 딤       |
| `colors.greyOpacity600` | 58%    |               |
| `colors.greyOpacity700` | 70%    | 강한 딤       |
| `colors.greyOpacity800` | 80%    | 모달 오버레이 |
| `colors.greyOpacity900` | 91%    |               |

#### 배경 시맨틱 토큰

| 토큰                       | 값      | 용도                 |
| -------------------------- | ------- | -------------------- |
| `colors.background`        | #FFFFFF | 기본 페이지 배경     |
| `colors.greyBackground`    | grey100 | 섹션·카드 배경       |
| `colors.layeredBackground` | #FFFFFF | 레이어드 콘텐츠 배경 |
| `colors.floatedBackground` | #FFFFFF | 플로팅 요소 배경     |

### 제약 사항

- TDS 컴포넌트는 로컬 브라우저에서 동작하지 않는다 — 반드시 샌드박스 앱으로 테스트한다
- `TDSProvider` 없이 TDS 컴포넌트를 사용하면 동작하지 않는다

---

## 스타일링 규칙

- `StyleSheet.create()` 를 사용한다 (인라인 스타일 지양)
- 스타일 객체는 컴포넌트 파일 하단에 선언한다
- 색상 상수는 파일 상단 또는 별도 `constants/colors.ts`에 정의한다
- 폰트 크기/줄간격은 TDS Typography 토큰을 우선 사용하고, 직접 지정이 불가피한 경우에만 숫자를 쓴다

---

## 코드 품질

```bash
npm run lint       # ESLint 검사
npm run typecheck  # TypeScript 타입 검사
npm run test       # Jest 테스트
```

- Linter: ESLint + Prettier (`.eslint.config.mjs` 기준)
- 커밋 전 `typecheck`와 `lint`를 통과해야 한다

---

## 트러블슈팅

| 증상                     | 해결책                                                  |
| ------------------------ | ------------------------------------------------------- |
| "too many open files"    | `rm -rf node_modules && npm install`                    |
| Plugin option error      | `granite.config.ts`의 `icon` 값을 빈 문자열 `''`로 설정 |
| Network inspector 오작동 | 앱 재시작 → dev 서버 중지 → inspector 종료 → 재시작     |
| REPL 멈춤                | eye 아이콘 클릭 후 `__DEV__`, `1`, `undefined` 등 입력  |
| Port 연결 실패           | `adb kill-server` 후 재연결                             |

---

## 주요 의존성 참조

| 패키지                      | 용도                           |
| --------------------------- | ------------------------------ |
| `@granite-js/react-native`  | 핵심 프레임워크 (라우팅, 빌드) |
| `@apps-in-toss/framework`   | Apps in Toss 플랫폼 통합       |
| `@toss/tds-react-native`    | Toss Design System 컴포넌트    |
| `@granite-js/plugin-router` | 파일 기반 라우터               |
| `@granite-js/plugin-hermes` | Hermes JS 엔진 최적화          |

---

## 참조

/reference 폴더 내부를 참조

- CONTACT.md => 리워드 공유하기
- LOGIN.md => 로그인
- PAYMENTS.md => 인앱 결제
- PROMOTION.md => 광고
