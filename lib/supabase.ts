import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// sanity check: the key exposed to the browser should be the public anon key.
// secret keys (starting with "sb_" or containing "secret") are dangerous and
// will be rejected by Supabase when used client-side. We log a warning to make
// debugging easier.
if (typeof window !== 'undefined') {
  if (/\b(sb_|secret)\b/i.test(supabaseAnonKey)) {
    console.error(
      'WARNING: Supabase client is using a secret API key in the browser! Replace NEXT_PUBLIC_SUPABASE_ANON_KEY with the public anon key from your Supabase project.'
    )
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
