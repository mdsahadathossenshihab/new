
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase configuration
 * The URL and Key provided by the user are used here.
 */
const supabaseUrl = 'https://jebjjnanijuitzztavsh.supabase.co';
const supabaseAnonKey = 'sb_publishable_H4venEtHyM-d_pUoviO-Cg_1VVZwNyG';

// Helper function to validate URL before initializing the client
const validateSupabaseUrl = (url: string): string => {
  try {
    // If it's a valid URL, return it
    new URL(url);
    return url;
  } catch (e) {
    // Return a dummy valid URL format to prevent construction error, 
    // though requests will still fail until the real URL is fixed.
    console.warn("Supabase URL is invalid. DB operations will fail.");
    return 'https://invalid-url-placeholder.supabase.co';
  }
};

export const supabase = createClient(
  validateSupabaseUrl(supabaseUrl), 
  supabaseAnonKey
);
