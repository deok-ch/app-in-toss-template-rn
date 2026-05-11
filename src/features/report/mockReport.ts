import type { Report } from './types';

export const latestReport: Report = {
  id: '2026-05-11-daily-pre-market',
  date: '2026-05-11',
  type: 'daily_pre_market',
  publishedAtLabel: '오늘 08:40 업데이트',
  marketTemperature: '보수',
  marketTemperatureReason: '미국 기술주 흐름은 우호적이지만 환율과 단기 과열 부담을 같이 확인해야 합니다.',
  oneLineConclusion:
    '오늘은 공격적 매수보다 관찰 우선입니다. AI 전력 인프라와 반도체는 강하지만, 한국 장에서는 외국인 수급 확인이 필요합니다.',
  confidence: 'medium',
  top3: [
    {
      id: 'ai-power',
      name: 'AI 전력 인프라',
      country: 'GLOBAL',
      category: '섹터',
      reason: '데이터센터 증설과 전력망 투자 기대가 이어지며 중기 수요가 견조합니다.',
      risk: '단기 급등 구간에서는 밸류에이션 부담과 차익실현 가능성이 큽니다.',
      confidence: 'high',
    },
    {
      id: 'semiconductor',
      name: '반도체 대표주',
      country: 'KR',
      category: '한국',
      reason: 'AI 메모리와 고대역폭 메모리 수요가 실적 기대를 지지합니다.',
      risk: '환율 변동과 외국인 수급 약화가 나타나면 장중 변동성이 커질 수 있습니다.',
      confidence: 'medium',
    },
    {
      id: 'us-mega-tech',
      name: '미국 빅테크',
      country: 'US',
      category: '미국',
      reason: '실적과 AI 투자 사이클이 아직 시장의 중심 테마로 남아 있습니다.',
      risk: '금리 재상승 또는 규제 이슈가 나오면 고평가 부담이 빠르게 반영될 수 있습니다.',
      confidence: 'medium',
    },
  ],
  koreaSummary: [
    {
      id: 'korea-flow',
      label: '수급',
      value: '외국인 매수 지속 여부가 장 초반 방향성을 좌우할 가능성이 큽니다.',
      tone: 'neutral',
    },
    {
      id: 'korea-sector',
      label: '섹터',
      value: '반도체, 조선, 방산은 관심 유지. 2차전지는 선별 접근이 필요합니다.',
      tone: 'positive',
    },
    {
      id: 'korea-risk',
      label: '주의',
      value: '테마 급등주는 실적 확인 전 추격보다 눌림 확인이 유리합니다.',
      tone: 'caution',
    },
  ],
  usSummary: [
    {
      id: 'us-tech',
      label: '기술주',
      value: 'AI 인프라 투자 기대가 지수 하단을 지지하고 있습니다.',
      tone: 'positive',
    },
    {
      id: 'us-rate',
      label: '금리',
      value: '금리 민감 구간이라 성장주 비중 확대는 지표 확인이 필요합니다.',
      tone: 'neutral',
    },
    {
      id: 'us-energy',
      label: '유가',
      value: '유가 상승은 에너지 섹터에는 우호적이나 물가 부담을 키울 수 있습니다.',
      tone: 'caution',
    },
  ],
  risks: [
    '환율 급등 시 한국 성장주와 외국인 수급에 부담이 생길 수 있습니다.',
    '이미 많이 오른 AI 테마는 호재보다 차익실현 뉴스에 더 민감할 수 있습니다.',
    '실적 발표 전후에는 기대치와 실제 가이던스의 차이를 확인해야 합니다.',
  ],
  checkpoints: ['원/달러 환율', '미국 10년물 금리', '외국인 코스피 순매수', 'AI 인프라 관련 실적 코멘트'],
  weekendNotice:
    '주말과 주요 휴장일에는 신규 장전 리포트가 발행되지 않을 수 있어요. 대신 다음 거래일을 준비하는 체크포인트를 정리해드려요.',
  disclaimer:
    '이 리포트는 투자 판단 참고용 리서치이며, 특정 종목의 매수·매도 권유가 아닙니다. 모든 투자의 최종 판단과 책임은 투자자 본인에게 있습니다.',
  feedback: {
    helpful: 128,
    unclear: 17,
  },
};
