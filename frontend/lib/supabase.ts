import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

/**
 * Centrally initialized Supabase Client.
 *
 * Utilizes public anonymous environmental configurations.
 * Implements lazy warning constraints so client instantiation doesn't break static compilation.
 */
export const getSupabaseClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn(
      "Supabase environmental keys are missing. Standard operations are loaded with mock data layers."
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};
