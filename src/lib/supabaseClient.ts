import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
export const IS_SUPABASE_VALID = isValidUrl(supabaseUrl) && !!supabaseAnonKey;
const isValidUrl = (url: string) => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl)) {
    console.warn('Supabase URL or Anon Key is missing or invalid. Using placeholder client for build.');
}

export const supabase = createClient(
    isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-project.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
