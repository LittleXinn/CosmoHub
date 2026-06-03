// api/index.js — CosmoHub Unified API (Single Serverless Function)
// Consolidates: chat routes + auth (login, register, logout, me, forgot-password, check-username)

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const { supabase } = require('../lib/db');

const JWT_SECRET = process.env.JWT_SECRET || 'cosmohub-dev-secret-change-me';

// ============================================================
// AUTH MIDDLEWARE (inlined to keep everything in one file)
// ============================================================
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ============================================================
// HELPERS
// ============================================================
function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return req.body;
  }
  if (req.body && typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return {};
}

function formatTime(isoString) {
  if (!isoString) return '';
  var date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  var hours = date.getHours();
  var minutes = date.getMinutes().toString().padStart(2, '0');
  var ampm = hours >= 12 ? 'PM' : 'AM';
  var displayHours = hours % 12 || 12;
  return 'Today at ' + displayHours + ':' + minutes + ' ' + ampm;
}

// ============================================================
// AUTH HANDLERS (no auth required)
// ============================================================

// --- LOGIN ---
async function handleLogin(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = parseBody(req);
  const { email, password } = body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, username, name, password_hash, role, handle, avatar, bio')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username, name: user.name, avatar: user.avatar, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await supabase.from('sessions').insert({
      user_id: user.id,
      token: token,
      expires_at: expiresAt.toISOString()
    }).catch(() => {});

    const { password_hash, ...userData } = user;
    return res.status(200).json({ success: true, token: token, user: userData });
  } catch (err) {
    console.error('[login] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// --- REGISTER ---
async function handleRegister(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, username, password, name, avatar } = parseBody(req);

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const handle = '@' + username.toLowerCase();
    const userName = name || username;

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password_hash: passwordHash,
        name: userName,
        role: 'Explorer',
        handle: handle,
        avatar: avatar || null
      })
      .select('id, email, username, name, role, handle')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ error: 'Failed to create account' });
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Please log in.',
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// --- FORGOT PASSWORD ---
async function handleForgotPassword(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email } = parseBody(req);

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent'
      });
    }

    const resetId = uuidv4();
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('user_id', user.id);

    await supabase
      .from('password_resets')
      .insert({
        id: resetId,
        user_id: user.id,
        token: token,
        expires_at: expiresAt.toISOString()
      });

    const isDev = process.env.NODE_ENV !== 'production';

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent',
      ...(isDev && { devToken: token })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// --- CHECK USERNAME ---
async function handleCheckUsername(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { username } = req.query;

    if (!username || username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    return res.status(200).json({
      available: !existing,
      username: username.toLowerCase()
    });
  } catch (error) {
    console.error('Check username error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ============================================================
// PROTECTED AUTH HANDLERS (require auth)
// ============================================================

// --- LOGOUT ---
function handleLogout(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  authMiddleware(req, res, async () => {
    const token = req.token;
    try {
      await supabase.from('sessions').delete().eq('token', token);
    } catch (err) {
      console.warn('[logout] Session deletion failed:', err.message);
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
}

// --- ME ---
function handleMe(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  authMiddleware(req, res, () => {
    res.status(200).json({ success: true, user: req.user });
  });
}

// ============================================================
// MAIN EXPORT — Unified Router
// ============================================================
module.exports = (req, res) => {
  setCORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  var url = req.url || '';
  var path = url.split('?')[0];
  var body = parseBody(req);
  var endpoint = req.query?.endpoint || body.endpoint || path.replace('/api/', '').replace('/', '');

  console.log('[api/index.js]', req.method, req.url, 'endpoint:', endpoint);

  // --- Public auth routes (no auth required) ---
  if (endpoint === 'login' || path === '/api/login' || path === '/api/auth/login' || path === '/login') {
    return handleLogin(req, res);
  }
  if (endpoint === 'register' || path === '/api/register' || path === '/api/auth/register' || path === '/register') {
    return handleRegister(req, res);
  }
  if (endpoint === 'forgot-password' || path === '/api/forgot-password' || path === '/api/auth/forgot-password' || path === '/forgot-password') {
    return handleForgotPassword(req, res);
  }
  if (endpoint === 'check-username' || path === '/api/check-username' || path === '/api/auth/check-username' || path === '/check-username') {
    return handleCheckUsername(req, res);
  }

  // --- Protected auth routes ---
  if (endpoint === 'logout' || path === '/api/logout' || path === '/api/auth/logout' || path === '/logout') {
    return handleLogout(req, res);
  }
  if (endpoint === 'me' || path === '/api/me' || path === '/api/auth/me' || path === '/me') {
    return handleMe(req, res);
  }

  // --- Health check ---
  if (url === '/' || url === '/api' || url === '/api/') {
    return res.json({
      status: 'ok',
      message: 'API is running',
      endpoints: [
        'messages', 'channels', 'communities', 'community-members',
        'online-members', 'members', 'conversations',
        'login', 'register', 'logout', 'me', 'forgot-password', 'check-username',
        'auth/login', 'auth/register', 'auth/logout', 'auth/me', 'auth/forgot-password', 'auth/check-username'
      ]
    });
  }

  // --- Chat routes (requires auth) ---
  authMiddleware(req, res, async () => {
    try {
      var userId = req.user.id;
      var method = req.method;
      var endpoint = req.query?.endpoint || body.endpoint || path.replace('/api/', '').replace('/', '');

      console.log('[api/index.js] chat endpoint:', endpoint, 'method:', method);

      // ========== MESSAGES ==========
      if (endpoint === 'messages') {
        if (method === 'GET') {
          var channelId = req.query?.channel_id;
          if (!channelId) return res.status(400).json({ error: 'channel_id required' });
          var { data, error } = await supabase.from('messages').select('*').eq('channel_id', decodeURIComponent(channelId)).order('created_at', { ascending: true }).limit(200);
          if (error) return res.status(500).json({ error: error.message });
          return res.json(data || []);
        }
        if (method === 'POST') {
          var channel_id = body.channel_id;
          var content = body.content;
          if (!channel_id || !content || !content.trim()) return res.status(400).json({ error: 'channel_id and content required' });
          var type = channel_id.startsWith('dm:') ? 'dm' : channel_id.startsWith('community:') ? 'community' : 'global';
          var { data, error } = await supabase.from('messages').insert({
            channel_id: channel_id, content: content.trim(), user_id: userId,
            username: req.user.username || req.user.name || 'Unknown', avatar: req.user.avatar || '', type: type
          }).select().single();
          if (error) return res.status(500).json({ error: error.message });
          if (type === 'dm') {
            var parts = channel_id.split(':');
            if (parts.length === 3) {
              await supabase.from('conversations').upsert({
                id: channel_id, user1_id: parts[1], user2_id: parts[2],
                last_message: content.trim(), last_message_at: new Date().toISOString()
              }, { onConflict: 'id' });
            }
          }
          return res.json(data);
        }
        return res.status(405).json({ error: 'Method not allowed' });
      }

      // ========== CHANNELS ==========
      if (endpoint === 'channels') {
        if (method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
        var { data: memberships, error: memErr } = await supabase.from('community_members').select('community_id, role, communities(id, name, description, icon, created_by)').eq('user_id', userId);
        if (memErr) console.warn('[channels] error:', memErr.message);
        var communityChannels = (memberships || []).map(m => ({
          id: 'community:' + m.community_id, name: m.communities?.name || 'Community',
          description: m.communities?.description || '', icon: m.communities?.icon || '\uD83D\uDEA0',
          membersOnline: 0, totalMembers: 0, type: 'community', myRole: m.role
        }));
        return res.json([{ id: 'global', name: 'Global Chat', description: 'Open discussion for all CosmoHub members.', icon: '\uD83D\uDE80', membersOnline: 0, totalMembers: 0, type: 'global' }, ...communityChannels]);
      }

      // ========== COMMUNITIES ==========
      if (endpoint === 'communities') {
        if (method === 'GET') {
          var { data: allCommunities, error: commErr } = await supabase.from('communities').select('id, name, description, icon, created_by, created_at');
          if (commErr) return res.status(500).json({ error: commErr.message });
          var communityIds = (allCommunities || []).map(c => c.id);
          var memberCounts = {};
          if (communityIds.length > 0) {
            var { data: counts } = await supabase.from('community_members').select('community_id, count').in('community_id', communityIds);
            (counts || []).forEach(row => { memberCounts[row.community_id] = parseInt(row.count) || 0; });
          }
          var { data: myMemberships } = await supabase.from('community_members').select('community_id, role').eq('user_id', userId).in('community_id', communityIds);
          var myMap = {};
          (myMemberships || []).forEach(m => { myMap[m.community_id] = m.role; });
          var formatted = (allCommunities || []).map(c => ({
            id: c.id, name: c.name, description: c.description, icon: c.icon,
            createdBy: c.created_by, memberCount: memberCounts[c.id] || 0,
            isMember: !!myMap[c.id], myRole: myMap[c.id] || null, createdAt: c.created_at
          }));
          return res.json(formatted);
        }
        if (method === 'POST') {
          var name = body.name;
          if (!name || !name.trim()) return res.status(400).json({ error: 'Community name is required' });
          var { data, error } = await supabase.from('communities').insert({
            name: name.trim(), description: (body.description || '').trim(),
            icon: (body.icon || '').trim() || '\uD83D\uDEA0', created_by: userId
          }).select().single();
          if (error) return res.status(500).json({ error: error.message });
          await supabase.from('community_members').insert({ community_id: data.id, user_id: userId, role: 'admin' });
          return res.json(data);
        }
        return res.status(405).json({ error: 'Method not allowed' });
      }

      // ========== COMMUNITY MEMBERS ==========
      if (endpoint === 'community-members') {
        if (method === 'GET') {
          var communityId = req.query?.community_id;
          if (!communityId) return res.status(400).json({ error: 'community_id required' });
          var { data, error } = await supabase.from('community_members').select('user_id, role, joined_at, users(id, username, name, avatar, role)').eq('community_id', communityId);
          if (error) return res.status(500).json({ error: error.message });
          var formatted = (data || []).map(m => ({
            id: m.user_id, name: m.users?.name || m.users?.username, username: m.users?.username,
            avatar: m.users?.avatar, role: m.role, userRole: m.users?.role, joinedAt: m.joined_at, isAdmin: m.role === 'admin'
          }));
          return res.json(formatted);
        }
        if (method === 'POST') {
          var commId = body.community_id;
          if (!commId) return res.status(400).json({ error: 'community_id required' });
          var { data, error } = await supabase.from('community_members').insert({ community_id: commId, user_id: userId, role: 'member' }).select().single();
          if (error) {
            if (error.message && error.message.includes('duplicate') || error.code === '23505') return res.status(409).json({ error: 'Already a member' });
            return res.status(500).json({ error: error.message });
          }
          return res.json(data);
        }
        if (method === 'DELETE') {
          var delId = body.community_id;
          if (!delId) return res.status(400).json({ error: 'community_id required' });
          var { error } = await supabase.from('community_members').delete().eq('community_id', delId).eq('user_id', userId);
          if (error) return res.status(500).json({ error: error.message });
          return res.json({ success: true, message: 'Left community' });
        }
        return res.status(405).json({ error: 'Method not allowed' });
      }

      // ========== ONLINE MEMBERS ==========
      if (endpoint === 'online-members') {
        if (method === 'POST') {
          var { error } = await supabase.from('user_status').upsert({ user_id: userId, status: 'online', last_seen: new Date().toISOString() }, { onConflict: 'user_id' });
          if (error) return res.status(500).json({ error: error.message });
          return res.json({ success: true });
        }
        if (method === 'GET') {
          var fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
          var { data, error } = await supabase.from('user_status').select('user_id, status, last_seen, users(id, username, name, avatar, role)').gte('last_seen', fiveMinutesAgo).eq('status', 'online');
          if (error) return res.status(500).json({ error: error.message });
          var formatted = (data || []).map(row => ({
            id: row.user_id, name: row.users?.name || row.users?.username, username: row.users?.username,
            avatar: row.users?.avatar, role: row.users?.role, status: row.status,
            isAdmin: row.users?.role === 'Admin' || row.users?.role === 'admin'
          }));
          return res.json(formatted);
        }
        return res.status(405).json({ error: 'Method not allowed' });
      }

      // ========== MEMBERS ==========
      if (endpoint === 'members') {
        if (method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
        var { data, error } = await supabase.from('users').select('id, username, name, avatar, role').neq('id', userId);
        if (error) return res.status(500).json({ error: error.message });
        var userIds = (data || []).map(u => u.id);
        var statusMap = {};
        if (userIds.length > 0) {
          var { data: statuses } = await supabase.from('user_status').select('user_id, status').in('user_id', userIds);
          (statuses || []).forEach(s => { statusMap[s.user_id] = s.status; });
        }
        var formatted = (data || []).map(u => ({
          id: u.id, name: u.name || u.username, username: u.username, avatar: u.avatar,
          role: u.role, status: statusMap[u.id] || 'offline', isAdmin: u.role === 'Admin' || u.role === 'admin'
        }));
        return res.json(formatted);
      }

      // ========== CONVERSATIONS ==========
      if (endpoint === 'conversations') {
        if (method === 'GET') {
          var { data, error } = await supabase.from('conversations').select('id, user1_id, user2_id, last_message, last_message_at').or('user1_id.eq.' + userId + ',user2_id.eq.' + userId).order('last_message_at', { ascending: false });
          if (error) return res.status(500).json({ error: error.message });
          var otherUserIds = (data || []).map(conv => conv.user1_id === userId ? conv.user2_id : conv.user1_id);
          var userMap = {};
          if (otherUserIds.length > 0) {
            var { data: users } = await supabase.from('users').select('id, username, name, avatar').in('id', otherUserIds);
            (users || []).forEach(u => { userMap[u.id] = u; });
          }
          var formatted = (data || []).map(conv => {
            var otherId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
            var otherUser = userMap[otherId] || {};
            return { id: conv.id, type: 'dm', name: otherUser.name || otherUser.username || 'Unknown', avatar: otherUser.avatar || '', lastMessage: conv.last_message || '', time: formatTime(conv.last_message_at), unread: 0, status: 'online', userId: otherId };
          });
          return res.json(formatted);
        }
        if (method === 'DELETE') {
          var conversationId = body.conversation_id;
          if (!conversationId || typeof conversationId !== 'string') {
            return res.status(400).json({ error: 'conversation_id is required' });
          }
          if (!conversationId.startsWith('dm:')) {
            return res.status(400).json({ error: 'Only direct message conversations can be permanently deleted' });
          }
          var parts = conversationId.split(':');
          if (parts.length !== 3) {
            return res.status(400).json({ error: 'Invalid DM channel format' });
          }
          var dmUserA = parts[1];
          var dmUserB = parts[2];
          if (userId !== dmUserA && userId !== dmUserB) {
            return res.status(403).json({ error: 'You can only delete conversations you are a part of' });
          }
          var { error: msgError } = await supabase.from('messages').delete().eq('channel_id', conversationId);
          if (msgError) {
            console.error('[api] Failed to delete messages:', msgError);
            return res.status(500).json({ error: 'Failed to delete messages: ' + msgError.message });
          }
          var { error: convError } = await supabase.from('conversations').delete().eq('id', conversationId);
          if (convError) {
            console.error('[api] Failed to delete conversation record:', convError);
          }
          return res.json({ success: true, deleted: true, conversation_id: conversationId, message: 'Conversation permanently deleted' });
        }
        return res.status(405).json({ error: 'Method not allowed' });
      }

      console.log('[api/index.js] No route matched for endpoint:', endpoint);
      return res.status(404).json({ error: 'Not found', endpoint: endpoint });
    } catch (err) {
      console.error('[api/index.js] Unhandled error:', err);
      return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  });
};