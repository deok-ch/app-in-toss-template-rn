#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const DEFAULT_ENV_FILES = ['.env.local', '.env'];

function parseEnvFile(source) {
  const entries = {};

  for (const line of source.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (trimmedLine === '' || trimmedLine.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    entries[key] = value;
  }

  return entries;
}

async function loadEnvFile(path) {
  try {
    const source = await readFile(resolve(process.cwd(), path), 'utf8');
    return parseEnvFile(source);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}

async function loadConfig(envPath) {
  const envFromFiles = {};
  const envFiles = envPath == null ? DEFAULT_ENV_FILES : [envPath];

  for (const file of envFiles) {
    Object.assign(envFromFiles, await loadEnvFile(file));
  }

  return {
    supabaseUrl: process.env.SUPABASE_URL ?? envFromFiles.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? envFromFiles.SUPABASE_SERVICE_ROLE_KEY,
    reportsTable: process.env.SUPABASE_REPORTS_TABLE ?? envFromFiles.SUPABASE_REPORTS_TABLE ?? 'reports',
  };
}

function usage() {
  console.log(`Usage:
  node scripts/publish-report-to-supabase.mjs <report-json-path>
  node scripts/publish-report-to-supabase.mjs <report-json-path> --dry-run
  node scripts/publish-report-to-supabase.mjs <report-json-path> --env .env.local

Required values from .env.local, .env, or environment variables:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Optional:
  SUPABASE_REPORTS_TABLE   default: reports
`);
}

function requireEnv(name, value) {
  if (value == null || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.replace(/\/$/, '');
}

function assertString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Report field "${fieldName}" must be a non-empty string.`);
  }

  return value;
}

function parseReport(rawJson) {
  const report = JSON.parse(rawJson);

  assertString(report.id, 'id');
  assertString(report.date, 'date');
  assertString(report.type, 'type');

  return report;
}

function toReportRow(report) {
  return {
    id: report.id,
    date: report.date,
    type: report.type,
    published_at: report.publishedAt ?? new Date().toISOString(),
    payload: report,
  };
}

async function publishReport(report, config) {
  const supabaseUrl = requireEnv('SUPABASE_URL', config.supabaseUrl);
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY', config.serviceRoleKey);
  const endpoint = `${supabaseUrl}/rest/v1/${encodeURIComponent(config.reportsTable)}?on_conflict=id`;
  const row = toReportRow(report);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Supabase upsert failed (${response.status}): ${responseText}`);
  }

  return responseText === '' ? null : JSON.parse(responseText);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const envFlagIndex = args.indexOf('--env');
  const envPath = envFlagIndex === -1 ? undefined : args[envFlagIndex + 1];
  const reportPath = args.find((arg, index) => !arg.startsWith('-') && index !== envFlagIndex + 1);

  if (args.includes('--help') || args.includes('-h')) {
    usage();
    process.exit(0);
  }

  if (reportPath == null) {
    usage();
    process.exit(1);
  }

  const absoluteReportPath = resolve(process.cwd(), reportPath);
  const rawJson = await readFile(absoluteReportPath, 'utf8');
  const report = parseReport(rawJson);
  const config = await loadConfig(envPath);

  if (dryRun) {
    console.log(JSON.stringify(toReportRow(report), null, 2));
    return;
  }

  const result = await publishReport(report, config);

  console.log(`Published report: ${report.id}`);
  if (result != null) {
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
