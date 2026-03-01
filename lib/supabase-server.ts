import "server-only"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServerKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY_LEGACY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseServerKey) {
  throw new Error(
    "Missing Supabase server key. Set SUPABASE_SERVICE_ROLE_KEY (recommended) or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  )
}

export const supabaseServer = createClient(supabaseUrl, supabaseServerKey)
