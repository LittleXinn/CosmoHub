const { supabase } = require('../../lib/db');
const { authMiddleware } = require('../../middleware/auth');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  authMiddleware(req, res, async () => {
    const token = req.token;

    // Delete session from database
    try {
      await supabase.from('sessions').delete().eq('token', token);
    } catch (err) {
      console.warn('[logout] Session deletion failed:', err.message);
    }

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
};