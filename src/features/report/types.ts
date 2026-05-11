export type ReportType = 'daily_pre_market' | 'weekly_watch' | 'market_closed';

export type MarketTemperature = '공격' | '중립' | '보수' | '관망';

export type Confidence = 'high' | 'medium' | 'low';

export type CountryCode = 'KR' | 'US' | 'GLOBAL';

export interface TopInterest {
  id: string;
  name: string;
  country: CountryCode;
  category: string;
  reason: string;
  risk: string;
  confidence: Confidence;
}

export interface SummaryItem {
  id: string;
  label: string;
  value: string;
  tone: 'positive' | 'neutral' | 'caution';
}

export interface ReportFeedback {
  helpful: number;
  unclear: number;
}

export interface Report {
  id: string;
  date: string;
  type: ReportType;
  publishedAtLabel: string;
  marketTemperature: MarketTemperature;
  marketTemperatureReason: string;
  oneLineConclusion: string;
  confidence: Confidence;
  top3: TopInterest[];
  koreaSummary: SummaryItem[];
  usSummary: SummaryItem[];
  risks: string[];
  checkpoints: string[];
  weekendNotice: string;
  disclaimer: string;
  feedback: ReportFeedback;
}
