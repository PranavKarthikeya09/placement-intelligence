import { createClient } from "@supabase/supabase-js";

// Retrieve URL and publishable/anon key from environment variables
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
// Strip trailing /rest/v1 if present so Supabase client gets the standard project base URL
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ""
).trim();

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in environment configuration."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabasePublishableKey || "placeholder-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
