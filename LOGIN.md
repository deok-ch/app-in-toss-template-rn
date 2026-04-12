# LOGIN.md — Apps in Toss 사용자 식별 가이드

Apps in Toss에서 사용자를 식별하는 두 가지 방법을 정리한 문서.

| 방법 | 대상 | 함수 | 서버 필요 |
|---|---|---|---|
| **토스 로그인** | 로그인한 사용자 | `appLogin()` | O |
| **Anonymous Key** | 비로그인 사용자 | `getAnonymousKey()` | X |

---

# 영역 1. 토스 로그인 (인증 사용자)

OAuth2 기반으로 사용자 동의 후 개인정보(이름, 전화번호 등)까지 조회 가능.

---

## 전체 흐름 요약

```
[앱] appLogin() 호출
  ↓ authorizationCode + referrer 반환
[서버] POST /generate-token   → accessToken + refreshToken 발급
[서버] GET  /login-me         → 사용자 정보(암호화) 조회
[서버] AES-256-GCM 복호화     → 실제 사용자 정보 획득
```

> **중요**: Step 2(토큰 발급), Step 3(토큰 갱신), Step 4(사용자 정보 조회), Step 5(복호화)는
> 반드시 **백엔드 서버**에서 처리한다. React Native 앱에서 직접 호출하지 않는다.

---

## Base URL

```
https://apps-in-toss-api.toss.im
```

---

## Step 1. Authorization Code 발급 (앱)

`appLogin()`을 호출해 사용자 인증 후 authorization code를 받는다.

```typescript
import { AppLogin } from '@apps-in-toss/framework';

const { authorizationCode, referrer } = await AppLogin.appLogin();
// referrer: 'sandbox' (샌드박스 앱) | 'DEFAULT' (실제 토스 앱)
```

- authorization code 유효시간: **10분**
- 발급 즉시 서버로 전달해 토큰 교환을 완료한다
- 만료 후 사용 시 `invalid_grant` 에러 발생

---

## Step 2. AccessToken 발급 (서버)

```
POST /api-partner/v1/apps-in-toss/user/oauth2/generate-token
Content-Type: application/json
```

**Request Body**

```json
{
  "authorizationCode": "string",
  "referrer": "DEFAULT"
}
```

**Response (성공)**

```json
{
  "resultType": "SUCCESS",
  "success": {
    "accessToken": "string",
    "refreshToken": "string",
    "tokenType": "Bearer",
    "expiresIn": 3599,
    "scope": "user_key user_name user_phone user_birthday"
  }
}
```

**Response (실패)**

```json
{ "error": "invalid_grant" }
```

| 항목 | 유효시간 |
|---|---|
| accessToken | 1시간 |
| refreshToken | 14일 |

---

## Step 3. AccessToken 갱신 (서버)

accessToken 만료 시 refreshToken으로 재발급한다.

```
POST /api-partner/v1/apps-in-toss/user/oauth2/refresh-token
Content-Type: application/json
```

**Request Body**

```json
{
  "refreshToken": "string"
}
```

**Response (성공)**

```json
{
  "resultType": "SUCCESS",
  "success": {
    "accessToken": "string",
    "refreshToken": "string",
    "tokenType": "Bearer",
    "expiresIn": 3599,
    "scope": "user_key user_name user_phone user_birthday"
  }
}
```

---

## Step 4. 사용자 정보 조회 (서버)

```
GET /api-partner/v1/apps-in-toss/user/oauth2/login-me
Authorization: Bearer {accessToken}
```

**Response (성공)**

```json
{
  "resultType": "SUCCESS",
  "success": {
    "userKey": 443731104,
    "scope": "user_key user_name user_phone user_birthday",
    "agreedTerms": ["terms_tag1"],
    "name": "ENCRYPTED_VALUE",
    "phone": "ENCRYPTED_VALUE",
    "birthday": "ENCRYPTED_VALUE",
    "ci": null,
    "di": null,
    "gender": null,
    "nationality": null,
    "email": null
  }
}
```

---

## Scope 정책

요청할 수 있는 scope는 콘솔에서 신청한 항목으로 제한된다.
사용자가 동의한 항목만 실제로 반환된다.

| scope | 반환 필드 | 비고 |
|---|---|---|
| `user_key` | `userKey` | 사용자 고유 식별자. 2026-01-02 추가 |
| `user_name` | `name` | AES-256-GCM 암호화 |
| `user_phone` | `phone` | AES-256-GCM 암호화 |
| `user_birthday` | `birthday` | AES-256-GCM 암호화 |
| `user_ci` | `ci` | AES-256-GCM 암호화 |
| `user_gender` | `gender` | AES-256-GCM 암호화 |
| `user_nationality` | `nationality` | AES-256-GCM 암호화 |

**이 프로젝트의 기본 scope**: `user_key` (최소) ~ `user_key user_name user_phone user_birthday` (최대)

scope 응답에 예상치 못한 값이 포함되더라도 예외를 던지지 않고 무시한다.

---

## Step 5. 사용자 정보 복호화 (서버)

개인정보 필드(`name`, `phone`, `birthday` 등)는 **AES-256-GCM**으로 암호화되어 전달된다.
복호화 키와 AAD(Additional Authenticated Data)는 콘솔 신청 후 **이메일로 수령**한다.

**복호화 방식**

- 알고리즘: AES-256-GCM
- IV: 암호문 앞 12바이트에 포함
- AAD: 이메일로 수령한 값 사용

```typescript
// Node.js 서버 예시
import { createDecipheriv } from 'crypto';

function decryptAES256GCM(encrypted: string, key: Buffer, aad: Buffer): string {
  const data = Buffer.from(encrypted, 'base64');
  const iv = data.subarray(0, 12);
  const authTag = data.subarray(data.length - 16);
  const ciphertext = data.subarray(12, data.length - 16);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  decipher.setAAD(aad);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
```

> **주의**: 복호화 키는 서버 환경변수로 관리하고 앱 번들에 포함하지 않는다.

---

## Step 6. 로그인 연결 해제 (서버 — AccessToken 방식)

사용자 로그아웃 또는 회원 탈퇴 시 호출한다.

```
POST /api-partner/v1/apps-in-toss/user/oauth2/access/remove-by-access-token
Authorization: Bearer {accessToken}
```

**Response**

```json
{
  "resultType": "SUCCESS",
  "success": {
    "userKey": 443731104
  }
}
```

---

## Step 7. 연결 해제 콜백 수신 (서버 — POST)

토스 앱에서 사용자가 직접 연결을 끊을 경우 서버로 콜백이 전송된다.
콘솔에서 콜백 수신 URL을 등록해야 한다.

```
POST {등록한 콜백 URL}
Content-Type: application/json
```

**Request Body**

```json
{
  "userKey": 443731104,
  "referrer": "UNLINK"
}
```

**referrer 값**

| 값 | 의미 |
|---|---|
| `UNLINK` | 사용자가 토스 앱 설정에서 직접 연결 해제 |
| `WITHDRAWAL_TERMS` | 사용자가 로그인 서비스 동의 철회 |
| `WITHDRAWAL_TOSS` | 사용자가 토스 계정 삭제 |

콜백 수신 시 해당 `userKey`의 세션·토큰을 서버에서 즉시 무효화한다.

---

## 에러 코드

| 코드 | 원인 | 대응 |
|---|---|---|
| `invalid_grant` | authorization code 만료 또는 중복 토큰 요청 | 앱에서 `appLogin()` 재호출 |
| `INTERNAL_ERROR` | 서버 내부 오류 | 재시도 또는 토스 측 문의 |
| `USER_KEY_NOT_FOUND` | 로그인 서비스에 userKey 없음 | 로그인 연결 상태 확인 |
| `USER_NOT_FOUND` | 토스 사용자 정보 조회 불가 | 토스 계정 상태 확인 |
| `BAD_REQUEST_RETRIEVE_CERT_RESULT_EXCEEDED_LIMIT` | 조회 횟수 초과 | 요청 빈도 조절 |

---

## 환경별 동작 차이

| 항목 | 샌드박스 (`referrer: 'sandbox'`) | 프로덕션 (`referrer: 'DEFAULT'`) |
|---|---|---|
| 앱 | Apps in Toss 샌드박스 앱 | 실제 토스 앱 |
| 사용자 인증 | 테스트 계정 | 실제 토스 계정 |
| 토큰 | 실제 API와 동일한 엔드포인트 사용 | 동일 |

로컬 개발 중 인증 오류는 대부분 **토큰 만료** 또는 **샌드박스 로그인 누락**이 원인이다.

---

## 구현 체크리스트

- [ ] 콘솔에서 scope 신청 (`user_key`, `user_name`, `user_phone`, `user_birthday`)
- [ ] 콘솔에서 콜백 URL 등록 (POST 방식)
- [ ] 복호화 키·AAD 이메일 수령 → 서버 환경변수에 등록
- [ ] 앱: `appLogin()` 호출 후 `authorizationCode`·`referrer` 서버 전달
- [ ] 서버: `/generate-token` 호출 → accessToken·refreshToken 저장
- [ ] 서버: `/login-me` 호출 → 암호화된 사용자 정보 복호화
- [ ] 서버: accessToken 만료(1시간) 시 `/refresh-token`으로 갱신 처리
- [ ] 서버: 로그아웃 시 `/remove-by-access-token` 호출
- [ ] 서버: POST 콜백 수신 엔드포인트 구현 → userKey 세션 무효화

---

# 영역 2. Anonymous Key (비로그인 사용자 식별)

로그인 없이 앱 내에서 사용자를 구분해야 할 때 사용.
서버 연동 없이 앱 단독으로 처리 가능.

## 개요

| 항목 | 내용 |
|---|---|
| 함수 | `getAnonymousKey()` |
| 임포트 | `import { getAnonymousKey } from '@apps-in-toss/framework'` |
| 최소 SDK 버전 | **2.4.5** (현재 설치: 2.4.1 → **업그레이드 필요**) |
| 반환 값 | `{ type: 'HASH', hash: string }` \| `'INVALID_CATEGORY'` \| `'ERROR'` \| `undefined` |
| 서버 필요 여부 | 없음 |
| 용도 | 앱 내 사용자 데이터 관리 (Toss 서버 API 호출용 아님) |

> **주의**: SDK를 2.4.5 이상으로 업그레이드해야 사용 가능하다.
> ```bash
> npm install @apps-in-toss/framework@latest
> ```

## 함수 시그니처

```typescript
function getAnonymousKey(): Promise<
  | { type: 'HASH'; hash: string }
  | 'INVALID_CATEGORY'
  | 'ERROR'
  | undefined
>;
```

## 반환값 상세

| 반환값 | 의미 |
|---|---|
| `{ type: 'HASH', hash: string }` | 성공. `hash`가 사용자 식별자 |
| `'INVALID_CATEGORY'` | 게임 카테고리 미니앱에서 호출됨 (비게임 전용) |
| `'ERROR'` | 알 수 없는 오류 발생 |
| `undefined` | SDK 버전이 2.4.5 미만 |

## 특성

- `hash`는 **이 미니앱 내에서만 유효한** 고유 식별자다
- 동일 사용자라도 다른 미니앱에서는 다른 `hash` 값이 반환된다
- **Toss 서버 API 호출에 사용할 수 없다** — 앱 내부 데이터 관리 전용
- 샌드박스에서는 Mock 데이터가 반환된다 — 실제 테스트는 QR 코드로 토스 앱에서 진행해야 한다

## 사용 예시

```typescript
import { getAnonymousKey } from '@apps-in-toss/framework';

async function getOrCreateAnonymousId(): Promise<string | null> {
  const result = await getAnonymousKey();

  if (result == null) {
    // SDK 버전 미달 (2.4.5 미만)
    console.warn('getAnonymousKey: SDK 업그레이드 필요');
    return null;
  }
  if (result === 'INVALID_CATEGORY') {
    // 게임 카테고리에서 호출됨 — 비게임 미니앱에서만 사용 가능
    return null;
  }
  if (result === 'ERROR') {
    // 오류 발생
    return null;
  }

  // 성공: result.hash 사용
  return result.hash;
}
```

## 토스 로그인과 병행 사용 패턴

로그인 전에는 Anonymous Key로 사용자를 추적하다가, 로그인 후 `userKey`로 전환하는 패턴:

```typescript
import { getAnonymousKey } from '@apps-in-toss/framework';

// 앱 시작 시
async function initUserIdentity() {
  const anonymousResult = await getAnonymousKey();
  const anonymousHash =
    anonymousResult != null && typeof anonymousResult === 'object'
      ? anonymousResult.hash
      : null;

  // anonymousHash를 로컬 임시 식별자로 사용
  // 로그인 완료 후에는 userKey로 교체
}
```

## 구현 체크리스트

- [ ] `@apps-in-toss/framework` 2.4.5 이상으로 업그레이드
- [ ] 반환값 4가지 케이스 모두 처리 (성공, INVALID_CATEGORY, ERROR, undefined)
- [ ] `hash` 값을 Toss 서버 API에 전달하지 않도록 주의
- [ ] 실제 동작 테스트는 토스 앱에서 QR 코드 스캔으로 진행
