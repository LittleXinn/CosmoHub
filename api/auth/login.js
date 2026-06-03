const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../../lib/db');
const { JWT_SECRET } = require('../../middleware/auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const { email, password } = body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, username, name, password_hash, role, handle, avatar, bio')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create session in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const { error: sessionError } = await supabase.from('sessions').insert({
      user_id: user.id,
      token: token,
      expires_at: expiresAt.toISOString()
    });

    if (sessionError) {
      console.warn('[login] Session creation failed:', sessionError.message);
      // Don't fail login if session table doesn't exist yet
    }

    // Return user data (without password_hash)
    const { password_hash, ...userData } = user;

    res.status(200).json({
      success: true,
      token: token,
      user: userData
    });
  } catch (err) {
    console.error('[login] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};