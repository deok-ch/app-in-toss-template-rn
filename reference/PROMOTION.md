# PROMOTION.md — Apps in Toss 비게임 프로모션(토스 포인트) API 가이드

Apps in Toss에서 사용자에게 토스 포인트를 지급하는 두 가지 방법을 정리한 문서.

| 방법 | 서버 필요 | 함수 / 엔드포인트 | 특징 |
|---|---|---|---|
| **서버 없이 지급** | X | `grantPromotionReward()` | 클라이언트 단독 처리, 토스앱 5.232.0+ 필요 |
| **서버를 통해 지급** | O | REST API 3단계 | Key 발급 → 지급 → 결과 조회 |

---

## Base URL

```
https://apps-in-toss-api.toss.im
```

---

# 영역 1. 서버 없이 지급

서버 없이 클라이언트에서 직접 토스 포인트를 지급하는 방식.
토스앱 **5.232.0 버전 이상**에서만 동작한다.

---

## 전체 흐름 요약

```
[앱] grantPromotionReward({ promotionCode, amount }) 호출
  ↓ 성공: { key: string }
  ↓ 실패: { errorCode: string, message: string }
  ↓ 알 수 없는 오류: 'ERROR'
  ↓ 버전 미지원: undefined
```

> **중요**: 프로모션 등록을 위해 **테스트 프로모션 코드로 최소 1회 이상 호출**해야 한다.
> 최소 버전 미만 사용자에게는 자동으로 업데이트 안내 화면이 표시된다.

---

## 함수 시그니처

```typescript
import { grantPromotionReward } from '@apps-in-toss/framework';

function grantPromotionReward({
  params,
}: {
  params: {
    promotionCode: string;
    amount: number;
  };
}): Promise<GrantPromotionRewardResult>;
```

---

## 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `promotionCode` | string | O | 콘솔에서 발급받은 프로모션 코드 |
| `amount` | number | O | 지급할 포인트 금액 |

---

## 반환값

| 반환값 | 의미 |
|---|---|
| `{ key: string }` | 성공. `key`는 리워드 키 |
| `{ errorCode: string, message: string }` | 실패. 에러 코드와 메시지 포함 |
| `'ERROR'` | 알 수 없는 오류 |
| `undefined` | 토스앱 버전이 5.232.0 미만 |

---

## 에러 코드

| 코드 | 메시지 | 원인 |
|---|---|---|
| `4100` | 프로모션 정보를 찾을 수 없어요 | 미등록된 프로모션 코드 호출 |
| `4109` | 프로모션이 실행중이 아니에요 | 미시작 또는 예산 소진 |
| `4110` | 리워드를 지급/회수할 수 없어요 | 내부 시스템 오류 |
| `4112` | 프로모션 머니가 부족해요 | 예산 부족 |
| `4114` | 1회 지급 금액을 초과했어요 | 설정된 1회 지급 한도 초과 |

---

## 사용 예시

```typescript
import { grantPromotionReward } from '@apps-in-toss/framework';

async function givePromotionPoint(promotionCode: string, amount: number) {
  const result = await grantPromotionReward({
    params: { promotionCode, amount },
  });

  if (result === undefined) {
    // 토스앱 5.232.0 미만 — 업데이트 안내 화면이 자동 표시됨
    console.warn('grantPromotionReward: 토스앱 버전 업데이트 필요');
    return;
  }

  if (result === 'ERROR') {
    // 알 수 없는 오류
    console.error('grantPromotionReward: 알 수 없는 오류 발생');
    return;
  }

  if ('errorCode' in result) {
    // 에러 코드 포함 실패
    console.error(`grantPromotionReward 실패: [${result.errorCode}] ${result.message}`);
    return;
  }

  // 성공: result.key 사용
  console.log('포인트 지급 성공. 리워드 키:', result.key);
}
```

---

## 구현 체크리스트

- [ ] 콘솔에서 프로모션 등록 및 `promotionCode` 발급
- [ ] 테스트 프로모션 코드로 최소 1회 호출 (프로모션 정상 등록 확인)
- [ ] 반환값 4가지 케이스 모두 처리 (성공, errorCode 실패, ERROR, undefined)
- [ ] 토스앱 5.232.0 미만 대응 — `undefined` 반환 시 별도 UX 처리 여부 결정
- [ ] 실기기(토스앱)에서 실제 포인트 지급 테스트

---

# 영역 2. 서버를 통해 지급

서버에서 Key를 생성하고, 해당 Key로 포인트를 지급하는 방식.
중복 지급 방지 등 지급 제어가 필요할 때 사용한다.

---

## 전체 흐름 요약

```
[서버] POST /execute-promotion/get-key   → key 발급 (유효시간 1시간)
  ↓
[서버] POST /execute-promotion            → 포인트 지급 (key + promotionCode + amount)
  ↓
[서버] POST /execution-result             → 지급 결과 조회 (SUCCESS / PENDING / FAILED)
```

> **중요**: 1회 지급만 허용하려면 **파트너사 서버에서 자체적으로 제어**해야 한다.
> 동일 Key로 중복 지급 시 에러 코드 `4113`이 반환된다.

---

## Step 1. Key 생성

```
POST /api-partner/v1/apps-in-toss/promotion/execute-promotion/get-key
```

**요청 헤더**

| 헤더 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `x-toss-user-key` | string | O | 토스 로그인 userKey |

**응답 (성공)**

```json
{
  "resultType": "SUCCESS",
  "success": {
    "key": "3oBpxjUgl5r66edcVi7ynHGIjhzr9KOka6FfEKikev0="
  }
}
```

| 항목 | 유효시간 |
|---|---|
| key | 1시간 |

---

## Step 2. 리워드 지급

```
POST /api-partner/v1/apps-in-toss/promotion/execute-promotion
```

**요청 헤더**

| 헤더 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `x-toss-user-key` | string | O | 토스 로그인 userKey |

**요청 Body**

```json
{
  "promotionCode": "01JPPJ6SB66BQXXDAKRQZ6SZD7",
  "key": "3oBpxjUgl5r66edcVi7ynHGIjhzr9KOka6FfEKikev0=",
  "amount": 10
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `promotionCode` | string | O | 콘솔에서 발급받은 프로모션 코드 |
| `key` | string | O | Step 1에서 발급받은 Key |
| `amount` | number | O | 지급할 포인트 금액 |

**응답 (성공)**

```json
{
  "resultType": "SUCCESS",
  "success": {
    "key": "3oBpxjUgl5r66edcVi7ynHGIjhzr9KOka6FfEKikev0="
  }
}
```

---

## Step 3. 지급 결과 조회

```
POST /api-partner/v1/apps-in-toss/promotion/execution-result
```

**요청 Body**

```json
{
  "promotionCode": "01JPPJ6SB66BQXXDAKRQZ6SZD7",
  "key": "3oBpxjUgl5r66edcVi7ynHGIjhzr9KOka6FfEKikev0="
}
```

**응답 (성공)**

```json
{
  "resultType": "SUCCESS",
  "success": "PENDING"
}
```

**지급 상태값**

| 상태 | 의미 |
|---|---|
| `SUCCESS` | 지급 완료 |
| `PENDING` | 처리 중 |
| `FAILED` | 지급 실패 |

---

## 추가 에러 코드 (서버 지급 방식)

| 코드 | 메시지 | 원인 |
|---|---|---|
| `4113` | 이미 지급/회수된 내역이에요 | 동일 Key로 중복 지급 시도 |
| `4116` | 최대 지급 금액이 예산을 초과했어요 | 설정된 최대 지급 금액 초과 |

---

## 구현 체크리스트

- [ ] 콘솔에서 프로모션 등록 및 `promotionCode` 발급
- [ ] Step 1: `/get-key` 호출 시 `x-toss-user-key` 헤더 포함
- [ ] Key 유효시간(1시간) 내에 Step 2 완료
- [ ] 1회 지급 제한이 필요하면 서버에서 Key 사용 여부 직접 관리
- [ ] Step 3으로 지급 상태 확인 (PENDING → 재조회 로직 고려)
- [ ] 에러 코드 4113(중복 지급) 처리
- [ ] 실서버에서 실제 포인트 지급 E2E 테스트
