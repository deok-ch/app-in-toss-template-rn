import { hasSupabaseConfig, supabaseConfig } from 'config/supabase';

import type { Report } from './types';

interface ReportRow {
  payload: unknown;
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
    const report = rows[0]?.payload;

    if (report == null) {
      return { status: 'not-published' };
    }

    if (!isReport(report)) {
      return {
        status: 'error',
        message: '리포트 데이터 형식이 앱과 맞지 않아요.',
      };
    }

    return { status: 'ready', report };
  } catch {
    return {
      status: 'error',
      message: '네트워크 상태를 확인한 뒤 다시 시도해주세요.',
    };
  }
}

function buildReportsEndpoint(date: string) {
  const baseUrl = supabaseConfig.url.replace(/\/$/, '');
  const query = new URLSearchParams({
    select: 'payload',
    date: `eq.${date}`,
    order: 'published_at.desc',
    limit: '1',
  });

  return `${baseUrl}/rest/v1/reports?${query.toString()}`;
}

function getKoreaDateString() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(new Date());
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
