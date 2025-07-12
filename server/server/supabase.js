let supabase = null;

try {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
} catch (err) {
  console.warn('[WARN] Supabase not installed or failed to load:', err.message);
}

module.exports = supabase;
