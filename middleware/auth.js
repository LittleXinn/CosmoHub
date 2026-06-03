const jwt = require('jsonwebtoken');
const { supabase } = require('../lib/db');

const JWT_SECRET = process.env.JWT_SECRET || 'cosmohub-dev-secret-change-in-production';

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Check if session exists in database (if sessions table exists)
  let session = null;
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (!error) session = data;
  } catch (err) {
    // Sessions table might not exist yet - log but don't fail
    console.warn('[auth] Session check failed (table might not exist):', err.message);
  }

  // If sessions table exists and no valid session found, reject
  // But if table doesn't exist, allow through (for migration period)
  if (session === null) {
    // Check if sessions table exists by trying a simple query
    const { error: tableCheck } = await supabase.from('sessions').select('id').limit(1);
    if (!tableCheck || tableCheck.code !== '42P01') {
      // Table exists but no session found
      return res.status(401).json({ error: 'Session expired' });
    }
    // Table doesn't exist - allow through (dev mode)
    console.warn('[auth] Sessions table not found - allowing request (dev mode)');
  }

  // Get user data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, username, name, role, handle, avatar, bio, created_at')
    .eq('id', decoded.userId)
    .maybeSingle();

  if (userError) {
    console.error('User fetch error:', userError);
  }

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  req.user = user;
  req.token = token;
  next();
}

module.exports = { authMiddleware, verifyToken, JWT_SECRET };