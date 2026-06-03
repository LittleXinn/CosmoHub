const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Initialize database tables if they don't exist
async function initDatabase() {
  try {
    // Users table
    const { error: usersError } = await supabase.rpc('create_users_table', {});

    // If RPC doesn't exist, create tables via raw SQL using the REST API
    // Supabase doesn't allow raw SQL via the JS client directly, 
    // so we use the SQL editor in the dashboard or migrations

    // For programmatic setup, we can check if tables exist by querying them
    const { error: checkError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.log('Tables not found. Please run the SQL setup in your Supabase dashboard SQL editor.');
      console.log('See README.md for the setup SQL.');
    }
  } catch (err) {
    console.error('Database init error:', err);
  }
}

module.exports = { supabase, initDatabase };
