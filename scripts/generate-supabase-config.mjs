#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const DEFAULT_ENV_FILES = ['.env.local', '.env'];
const OUTPUT_PATH = 'src/config/supabase.generated.ts';

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
    return parseEnvFile(await readFile(resolve(process.cwd(), path), 'utf8'));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}

async function loadConfig() {
  const envFromFiles = {};

  for (const file of DEFAULT_ENV_FILES) {
    Object.assign(envFromFiles, await loadEnvFile(file));
  }

  return {
    url: process.env.SUPABASE_URL ?? envFromFiles.SUPABASE_URL ?? '',
    anonKey: process.env.SUPABASE_ANON_KEY ?? envFromFiles.SUPABASE_ANON_KEY ?? '',
  };
}

function toSource(config) {
  return `export const generatedSupabaseConfig = ${JSON.stringify(config, null, 2)} as const;\n`;
}

async function main() {
  const outputPath = resolve(process.cwd(), OUTPUT_PATH);
  const config = await loadConfig();

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, toSource(config));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
