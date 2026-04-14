# CONTACT.md — 공유 리워드 (contactsViral)

친구 초대 기반 바이럴 유입, 추천인 보상, 미니앱 성장 캠페인에 사용하는 공유 리워드 API.

---

## 개요

사용자가 친구에게 미니앱을 공유하고, 그 결과에 따라 리워드를 지급하는 기능.

| 항목 | 내용 |
|---|---|
| 함수명 | `contactsViral` |
| 패키지 | `@apps-in-toss/framework` |
| 최소 토스앱 버전 | **5.223.0 이상** |
| 미니앱 승인 | **필수** (미승인 시 Internal Server Error) |
| 샌드박스 테스트 | 실제 공유 UI 미노출, 리워드 미지급 |

---

## 함수 시그니처

```typescript
function contactsViral(params: ContactsViralParams): () => void;
```

반환값은 cleanup 함수(`() => void`)로, 공유 기능 완료 후 반드시 호출해 리소스를 해제해야 한다.

---

## 타입 정의

### ContactsViralParams

```typescript
interface ContactsViralParams {
  options: ContactsViralOption;
  onEvent: (event: ContactsViralEvent) => void;
  onError: (error: unknown) => void;
}
```

### ContactsViralOption

```typescript
type ContactsViralOption = {
  moduleId: string; // UUID 형식의 고유 리워드 ID (Apps in Toss 콘솔에 등록된 값)
};
```

### RewardFromContactsViralEvent (`type: 'sendViral'`)

공유 성공 시 리워드가 지급될 때 발생.

```typescript
type RewardFromContactsViralEvent = {
  type: 'sendViral';
  data: {
    rewardAmount: number; // 지급할 리워드 수량
    rewardUnit: string;   // 리워드 단위명 (예: '하트', '보석')
  };
};
```

### ContactsViralSuccessEvent (`type: 'close'`)

모듈 종료 시 발생.

```typescript
type ContactsViralSuccessEvent = {
  type: 'close';
  data: {
    closeReason: 'clickBackButton' | 'noReward'; // 종료 이유
    sentRewardAmount?: number;     // 받은 전체 리워드 수량 (선택)
    sendableRewardsCount?: number; // 공유 가능한 친구 수 (선택)
    sentRewardsCount: number;      // 공유 완료한 친구 수
    rewardUnit?: string;           // 리워드 단위 (선택)
  };
};
```

---

## 사용 예시 (React Native)

이 프로젝트 (`@apps-in-toss/framework`) 기준 구현 패턴:

```tsx
import { contactsViral } from '@apps-in-toss/framework';
import { Button } from '@toss/tds-react-native';
import { useCallback } from 'react';

function ContactsViralButton({ moduleId }: { moduleId: string }) {
  const handleContactsViral = useCallback(() => {
    try {
      const cleanup = contactsViral({
        options: { moduleId: moduleId.trim() },
        onEvent: (event) => {
          if (event.type === 'sendViral') {
            console.log('리워드 지급:', event.data.rewardAmount, event.data.rewardUnit);
          } else if (event.type === 'close') {
            console.log('모듈 종료:', event.data.closeReason);
            cleanup();
          }
        },
        onError: (error) => {
          console.error('에러 발생:', error);
          cleanup?.();
        },
      });
    } catch (error) {
      console.error('실행 중 에러:', error);
    }
  }, [moduleId]);

  return <Button onPress={handleContactsViral}>친구에게 공유하고 리워드 받기</Button>;
}
```

---

## 이벤트 처리 흐름

```
contactsViral() 호출
    │
    ├─ 공유 성공 → onEvent({ type: 'sendViral', data: { rewardAmount, rewardUnit } })
    │
    └─ 모듈 종료 → onEvent({ type: 'close', data: { closeReason, sentRewardsCount, ... } })
                       └─ cleanup() 호출 (리소스 해제)
```

### closeReason 값

| 값 | 설명 |
|---|---|
| `'clickBackButton'` | 사용자가 뒤로가기 버튼을 눌러 종료 |
| `'noReward'` | 지급 가능한 리워드 없음 |

---

## 주의사항

1. **cleanup 필수 호출**: `close` 이벤트 또는 에러 발생 시 반드시 cleanup 함수를 호출한다.
2. **moduleId 형식**: UUID 형식이어야 하며, Apps in Toss 콘솔에 등록된 리워드 ID를 사용한다.
3. **미니앱 승인 필수**: 승인되지 않은 미니앱에서 호출하면 Internal Server Error 발생.
4. **토스앱 버전**: 5.223.0 미만에서는 동작하지 않는다.
5. **샌드박스 환경**: 실제 공유 UI가 노출되지 않고 리워드도 지급되지 않으므로, 최종 검증은 프로덕션 환경에서 진행한다.
6. **헤더 없음**: Apps in Toss 배포 심사 규칙에 따라 이 기능을 사용하는 페이지에도 뒤로가기 버튼이 있는 헤더를 추가하지 않는다.

---

## 참조

- [공식 문서](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EC%B9%9C%EA%B5%AC%EC%B4%88%EB%8C%80/contactsViral.html)
