import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://')) {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
        console.log("✅ Supabase initialized successfully.");
    } catch (e) {
        console.error("❌ Failed to initialize Supabase:", e);
    }
} else {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("⚠️ Supabase credentials (URL or Key) are missing in environment variables.");
    } else if (!supabaseUrl.startsWith('https://')) {
        console.warn("⚠️ Invalid Supabase URL format. It should start with https://");
    }
}

export const supabase = supabaseInstance;
