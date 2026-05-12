import { Storage } from '@apps-in-toss/framework';
import { hasSupabaseConfig, supabaseConfig } from 'config/supabase';

import type { Report, ReportFeedback, ReportFeedbackChoice } from './types';

interface ReportRow {
  payload: unknown;
  published_at: string;
}

interface FeedbackRow {
  feedback: unknown;
}

export type TodayReportResult =
  | { status: 'ready'; report: Report }
  | { status: 'not-configured' }
  | { status: 'not-published' }
  | { status: 'error'; message: string };

export async function fetchTodayReport(): Promise<TodayReportResult> {
  if (!hasSupabaseConfig()) {
    return { status: 'not-configured' };
  }

  const today = getKoreaDateString();
  const endpoint = buildReportsEndpoint(today);

  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      return {
        status: 'error',
        message: `리포트를 불러오지 못했어요. (${response.status})`,
      };
    }

    const rows = JSON.parse(responseText) as ReportRow[];
    const row = rows[0];
    if (row == null) {
      return { status: 'not-published' };
    }

    const report = row.payload;

    if (report == null) {
      return { status: 'not-published' };
    }

    if (!isReport(report)) {
      return {
        status: 'error',
        message: '리포트 데이터 형식이 앱과 맞지 않아요.',
      };
    }

    const feedback = await fetchReportFeedback(report.id, report.feedback);

    return {
      status: 'ready',
      report: {
        ...report,
        feedback,
        publishedAtLabel: formatKoreaPublishedAt(row.published_at),
      },
    };
  } catch {
    return {
      status: 'error',
      message: '네트워크 상태를 확인한 뒤 다시 시도해주세요.',
    };
  }
}

export async function submitReportFeedback(reportId: string, feedback: ReportFeedbackChoice): Promise<void> {
  if (!hasSupabaseConfig()) {
    throw new Error('Supabase 연결이 필요해요.');
  }

  const anonymousKey = await getAnonymousFeedbackKey();
  const endpoint = buildReportFeedbackUpsertEndpoint();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${supabaseConfig.anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      report_id: reportId,
      anonymous_key: anonymousKey,
      feedback,
    }),
  });

  if (!response.ok) {
    throw new Error(`피드백 저장에 실패했어요. (${response.status})`);
  }
}

function buildReportsEndpoint(date: string) {
  const baseUrl = supabaseConfig.url.replace(/\/$/, '');
  const query = new URLSearchParams({
    select: 'payload,published_at',
    date: `eq.${date}`,
    order: 'published_at.desc',
    limit: '1',
  });

  return `${baseUrl}/rest/v1/reports?${query.toString()}`;
}

function buildReportFeedbackEndpoint(reportId: string) {
  const baseUrl = supabaseConfig.url.replace(/\/$/, '');
  const query = new URLSearchParams({
    select: 'feedback',
    report_id: `eq.${reportId}`,
  });

  return `${baseUrl}/rest/v1/report_feedback?${query.toString()}`;
}

function buildReportFeedbackUpsertEndpoint() {
  const baseUrl = supabaseConfig.url.replace(/\/$/, '');

  return `${baseUrl}/rest/v1/report_feedback?on_conflict=report_id,anonymous_key`;
}

async function fetchReportFeedback(reportId: string, fallback: ReportFeedback): Promise<ReportFeedback> {
  const response = await fetch(buildReportFeedbackEndpoint(reportId), {
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${supabaseConfig.anonKey}`,
    },
  });

  if (!response.ok) {
    return fallback;
  }

  const rows = JSON.parse(await response.text()) as FeedbackRow[];

  return rows.reduce<ReportFeedback>(
    (acc, row) => {
      if (row.feedback === 'helpful') {
        return { ...acc, helpful: acc.helpful + 1 };
      }

      if (row.feedback === 'unclear') {
        return { ...acc, unclear: acc.unclear + 1 };
      }

      return acc;
    },
    { helpful: 0, unclear: 0 }
  );
}

async function getAnonymousFeedbackKey() {
  const storageKey = 'mullin-gime-bunseokham:feedback-anonymous-key';
  const savedKey = await Storage.getItem(storageKey);

  if (savedKey != null && savedKey.trim() !== '') {
    return savedKey;
  }

  const newKey = createAnonymousKey();
  await Storage.setItem(storageKey, newKey);

  return newKey;
}

function createAnonymousKey() {
  const randomPart = Math.random().toString(36).slice(2);
  const timePart = Date.now().toString(36);

  return `anon-${timePart}-${randomPart}`;
}

function formatKoreaPublishedAt(value: string) {
  const publishedAt = new Date(value);

  if (Number.isNaN(publishedAt.getTime())) {
    return '업데이트 시간 확인 중';
  }

  const date = getKoreaDateString(publishedAt);
  const today = getKoreaDateString();
  const time = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(publishedAt);

  return date === today ? `오늘 ${time} 업데이트` : `${date} ${time} 업데이트`;
}

function getKoreaDateString(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(date);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isReport(value: unknown): value is Report {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.date) &&
    isString(value.type) &&
    isString(value.publishedAtLabel) &&
    isString(value.marketTemperature) &&
    isString(value.marketTemperatureReason) &&
    isString(value.oneLineConclusion) &&
    isString(value.confidence) &&
    Array.isArray(value.top3) &&
    Array.isArray(value.koreaSummary) &&
    Array.isArray(value.usSummary) &&
    Array.isArray(value.risks) &&
    Array.isArray(value.checkpoints) &&
    isString(value.weekendNotice) &&
    isString(value.disclaimer) &&
    isRecord(value.feedback)
  );
}
