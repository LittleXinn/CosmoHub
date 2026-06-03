// api/index.js - Main API entry point
// Handles all chat endpoints + acts as router
const { supabase } = require('../lib/db');
const { authMiddleware } = require('../middleware/auth');

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

module.exports = (req, res) => {
  setCORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  console.log('[api/index.js]', req.method, req.url);

  // Health check - no auth required
  if (req.url === '/' || req.url === '/api' || req.url === '/api/') {
    return res.json({ status: 'ok', message: 'API is running', endpoints: ['messages','channels','communities','community-members','online-members','members','conversations'] });
  }

  authMiddleware(req, res, async () => {
    try {
      var userId = req.user.id;
      var url = req.url || '';
      var method = req.method;
      var body = parseBody(req);
      var path = url.split('?')[0];
      var endpoint = req.query?.endpoint || body.endpoint || path.replace('/api/', '').replace('/', '');

      console.log('[api/index.js] endpoint:', endpoint, 'method:', method);

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
        if (method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
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

      console.log('[api/index.js] No route matched for endpoint:', endpoint);
      return res.status(404).json({ error: 'Not found', endpoint: endpoint });
    } catch (err) {
      console.error('[api/index.js] Unhandled error:', err);
      return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  });
};
