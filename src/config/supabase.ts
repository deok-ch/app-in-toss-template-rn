import { generatedSupabaseConfig } from './supabase.generated';

export const supabaseConfig = generatedSupabaseConfig;

export function hasSupabaseConfig() {
  return supabaseConfig.url.trim() !== '' && supabaseConfig.anonKey.trim() !== '';
}
