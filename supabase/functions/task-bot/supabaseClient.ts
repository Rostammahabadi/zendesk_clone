// supabaseClient.ts
import { load } from "https://deno.land/std@0.192.0/dotenv/mod.ts";

// This loads .env variables into Deno.env
await load({ export: true });

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";


// You can load from environment variables or hardcode for testing
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  global: { fetch },
});