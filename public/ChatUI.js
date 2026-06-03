// ===== CosmoHub Chat - Global + DM + Communities =====

const API_URL = window.location.origin;

// ===== SUPABASE SETUP =====
const SUPABASE_URL = 'https://jizbbohomkfjijnkbaie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppemJib2hvbWtmamlqbmtiYWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDE5MzEsImV4cCI6MjA5NTg3NzkzMX0.jhaoyiLJ37zcnFQ6MGqevCEh4r8zfki89UnFYYq62Po';
let sb = null;

function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[CosmoHub Chat] Supabase realtime ready');
        return true;
    }
    console.warn('[CosmoHub Chat] Supabase not loaded');
    return false;
}

// ===== AUTH =====
function getToken() { return localStorage.getItem('cosmohub_token'); }

function apiFetch(url, options) {
    options = options || {};
    var token = getToken();
    var headers = {
        'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (options.headers) {
        Object.keys(options.headers).forEach(function(k) {
            headers[k] = options.headers[k];
        });
    }
    return fetch(url, {
        method: options.method || 'GET',
        headers: headers,
        body: options.body
    });
}

// ===== DEFAULT DATA =====
var DEFAULT_USER = {
    id: null, name: 'Explorer', username: 'explorer', role: 'Member',
    avatar: '', status: 'online'
};

var EMOJI_CATEGORIES = [
    {
        name: 'Smileys',
        emojis: [
            '\uD83D\uDE00','\uD83D\uDE03','\uD83D\uDE04','\uD83D\uDE01','\uD83D\uDE06','\uD83D\uDE05','\uD83D\uDE02','\uD83E\uDD23',
            '\uD83D\uDE0A','\uD83D\uDE07','\uD83D\uDE42','\uD83D\uDE43','\uD83D\uDE09','\uD83D\uDE0C','\uD83D\uDE0D','\uD83E\uDD70',
            '\uD83D\uDE18','\uD83D\uDE17','\uD83D\uDE19','\uD83D\uDE1A','\uD83D\uDE0B','\uD83D\uDE1B','\uD83D\uDE1C','\uD83D\uDE1D',
            '\uD83E\uDD2A','\uD83E\uDD28','\uD83E\uDDD0','\uD83E\uDD13','\uD83D\uDE0E','\uD83E\uDD78','\uD83E\uDD29','\uD83E\uDD73'
        ]
    },
    {
        name: 'Hearts',
        emojis: [
            '\u2764\uFE0F','\uD83D\uDC9B','\uD83D\uDC9A','\uD83D\uDC99','\uD83D\uDC9C','\uD83D\uDD34','\uD83D\uDD35','\uD83D\uDCA5',
            '\uD83D\uDCAB','\uD83D\uDCA2','\uD83D\uDCA3','\uD83D\uDCA4','\uD83D\uDC8E','\uD83D\uDC8D','\uD83D\uDC95','\uD83D\uDC96',
            '\uD83D\uDC97','\uD83D\uDC98','\uD83D\uDC99','\uD83D\uDC9D','\uD83D\uDC9E','\uD83D\uDC9F','\u2763\uFE0F','\uD83D\uDC8B',
            '\uD83D\uDC8C'
        ]
    },
    {
        name: 'Space',
        emojis: [
            '\uD83D\uDE90','\uD83C\uDF0D','\uD83C\uDF0E','\uD83C\uDF0F','\uD83C\uDF15','\uD83C\uDF16','\uD83C\uDF17','\uD83C\uDF18',
            '\uD83C\uDF11','\uD83C\uDF12','\uD83C\uDF13','\uD83C\uDF14','\uD83C\uDF1F','\u2B50','\u2728','\uD83D\uDCAB',
            '\uD83D\uDD2E','\uD83D\uDC80','\uD83D\uDC7D','\uD83D\uDC7E','\uD83E\uDD16','\uD83C\uDF83','\uD83D\uDC7B','\u2620\uFE0F',
            '\u2604\uFE0F','\uD83C\uDF20','\uD83C\uDF0C'
        ]
    },
    {
        name: 'Gestures',
        emojis: [
            '\uD83D\uDC4D','\uD83D\uDC4E','\uD83D\uDC4C','\u270C\uFE0F','\uD83E\uDD1E','\uD83E\uDD18','\uD83D\uDC4F','\uD83D\uDC4B',
            '\uD83D\uDC50','\uD83D\uDE4C','\uD83D\uDE4F','\uD83D\uDCAA','\uD83E\uDD1A','\uD83E\uDD1B','\uD83E\uDD1C','\uD83E\uDD1D',
            '\uD83D\uDC4A','\u270A','\u270B','\uD83D\uDD90\uFE0F','\uD83D\uDC47','\uD83D\uDC48','\uD83D\uDC49','\uD83D\uDC46',
            '\u261D\uFE0F','\uD83D\uDD95','\uD83D\uDD96'
        ]
    },
    {
        name: 'Objects',
        emojis: [
            '\uD83D\uDD14','\uD83D\uDCE2','\uD83D\uDCE3','\uD83D\uDCF1','\uD83D\uDCBB','\uD83D\uDDA5\uFE0F','\uD83D\uDDA8\uFE0F','\u2328\uFE0F',
            '\uD83D\uDCD6','\uD83D\uDCDA','\uD83D\uDCDD','\uD83D\uDCDD','\uD83D\uDD0D','\uD83D\uDD0E','\uD83D\uDD6F\uFE0F','\uD83D\uDCA1',
            '\uD83D\uDD26','\uD83C\uDF81','\uD83C\uDF89','\uD83C\uDF8A','\uD83D\uDEA8','\u26A0\uFE0F','\uD83D\uDEA9','\uD83C\uDFF4',
            '\uD83C\uDFF3\uFE0F','\uD83C\uDFC6','\uD83C\uDFC5'
        ]
    },
    {
        name: 'Nature',
        emojis: [
            '\uD83C\uDF3A','\uD83C\uDF3B','\uD83C\uDF3C','\uD83C\uDF37','\uD83C\uDF38','\uD83C\uDF39','\uD83E\uDD40','\uD83C\uDF3F',
            '\u2618\uFE0F','\uD83C\uDF41','\uD83C\uDF42','\uD83C\uDF43','\uD83C\uDF44','\uD83C\uDF30','\uD83C\uDF31','\uD83C\uDF32',
            '\uD83C\uDF33','\uD83C\uDF34','\uD83C\uDF35','\uD83C\uDF3E','\uD83D\uDC3B','\uD83D\uDC3C','\uD83D\uDC28','\uD83D\uDC3E',
            '\uD83E\uDD81','\uD83D\uDC05','\uD83D\uDC2F'
        ]
    }
];

// ===== STATE =====
var currentUser = JSON.parse(JSON.stringify(DEFAULT_USER));
var channels = [];
var communities = [];
var myCommunities = [];
var messages = [];
var onlineMembers = [];
var allMembers = [];
var recentConversations = [];
var currentChannelId = 'global';
var currentChatType = 'global';
var currentCommunityId = null;
var sidebarCollapsed = localStorage.getItem('cosmohub-sidebar') === 'true';
var supabaseReady = false;
var realtimeChannel = null;
var isSendingMessage = false;
var activeTab = 'global';
var isMemberOfCurrentCommunity = false;
var currentCommunityMembers = [];

// ===== DOM ELEMENTS =====
var elements = {};
function initElements() {
    elements = {
        globalMemberCount: document.getElementById('globalMemberCount'),
        recentList: document.getElementById('recentList'),
        messagesContainer: document.getElementById('messagesContainer'),
        messageInput: document.getElementById('messageInput'),
        sendBtn: document.getElementById('sendBtn'),
        chatTitle: document.getElementById('chatTitle'),
        onlineCount: document.getElementById('onlineCount'),
        chatHeaderIcon: document.getElementById('chatHeaderIcon'),
        chatPrefix: document.getElementById('chat-prefix'),
        drawerChannelName: document.getElementById('drawerChannelName'),
        drawerChannelDesc: document.getElementById('drawerChannelDesc'),
        drawerOnlineCount: document.getElementById('drawerOnlineCount'),
        drawerTotalCount: document.getElementById('drawerTotalCount'),
        drawerMembersList: document.getElementById('drawerMembersList'),
        drawerMembersCount: document.getElementById('drawerMembersCount'),
        drawerChannelIcon: document.getElementById('drawerChannelIcon'),
        drawerSectionTitle: document.getElementById('drawer-section-title'),
        searchInput: document.getElementById('searchInput'),
        onlineCountSidebar: document.getElementById('online-count'),
        globalCategory: document.getElementById('global-category'),
        communitiesList: document.getElementById('communities-list'),
        myCommunitiesList: document.getElementById('my-communities-list'),
        recentHeader: document.getElementById('recent-header'),
        newMessageBtn: document.getElementById('new-message-btn'),
        createCommunityBtn: document.getElementById('create-community-btn'),
        communityJoinOverlay: document.getElementById('community-join-overlay'),
        joinCommunityBtn: document.getElementById('join-community-btn'),
        chatInputArea: document.getElementById('chat-input-area')
    };
}

// ===== SAFE FETCH =====
function safeFetch(url, defaultData) {
    return apiFetch(url)
        .then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .catch(function(err) {
            console.warn('[CosmoHub Chat] Failed:', url, err.message);
            return defaultData;
        });
}

// ===== STARFIELD =====
function initStarfield() {
    var canvas = document.getElementById('starfield-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var stars = [];
    for (var i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.2 + 0.3,
            alpha: Math.random(),
            speed: Math.random() * 0.3 + 0.1,
            twinkleSpeed: Math.random() * 0.02 + 0.005
        });
    }
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(function(star) {
            star.alpha += star.twinkleSpeed;
            if (star.alpha > 1 || star.alpha < 0.2) star.twinkleSpeed = -star.twinkleSpeed;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,' + (Math.abs(star.alpha) * 0.6) + ')';
            ctx.fill();
            star.y -= star.speed * 0.2;
            if (star.y < 0) star.y = canvas.height;
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// ===== SIDEBAR =====
function initSidebar() {
    var sidebar = document.getElementById('sidebar');
    var btn = document.getElementById('collapse-btn');
    if (!sidebar || !btn) return;
    if (sidebarCollapsed) sidebar.classList.add('collapsed');
    btn.addEventListener('click', function() {
        sidebarCollapsed = !sidebarCollapsed;
        sidebar.classList.toggle('collapsed', sidebarCollapsed);
        localStorage.setItem('cosmohub-sidebar', sidebarCollapsed);
    });
}

// ===== TOAST =====
function showToast(title, message, type, duration) {
    type = type || 'info';
    duration = duration || 4000;
    var container = document.getElementById('toast-container');
    if (!container) return;
    var icons = { success: 'check-circle', error: 'x-circle', info: 'info', warning: 'alert-triangle' };
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<i data-lucide="' + (icons[type] || 'info') + '" class="toast-icon ' + type + '"></i>' +
        '<div class="toast-content"><div class="toast-title">' + title + '</div><div class="toast-message">' + message + '</div></div>' +
        '<button class="toast-close" aria-label="Dismiss"><i data-lucide="x"></i></button>';
    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    toast.querySelector('.toast-close').addEventListener('click', function() { removeToast(toast); });
    if (duration > 0) setTimeout(function() { removeToast(toast); }, duration);
}

function removeToast(toast) {
    toast.classList.add('removing');
    toast.addEventListener('animationend', function() { toast.remove(); });
}

// ===== MODAL =====
var Modal = {
    overlay: null, title: null, body: null, footer: null,
    cancelBtn: null, confirmBtn: null, onConfirm: null, onCancel: null,

    init: function() {
        this.overlay = document.getElementById('modal-overlay');
        this.title = document.getElementById('modal-title');
        this.body = document.getElementById('modal-body');
        this.footer = document.getElementById('modal-footer');
        this.cancelBtn = document.getElementById('modal-cancel');
        this.confirmBtn = document.getElementById('modal-confirm');
        if (!this.overlay) return;
        var self = this;
        document.getElementById('modal-close').addEventListener('click', function() { self.close(); });
        this.cancelBtn.addEventListener('click', function() { if (self.onCancel) self.onCancel(); self.close(); });
        this.confirmBtn.addEventListener('click', function() { if (self.onConfirm) self.onConfirm(); self.close(); });
        this.overlay.addEventListener('click', function(e) { if (e.target === self.overlay) self.close(); });
    },

    open: function(title, content, options) {
        options = options || {};
        this.title.textContent = title;
        this.body.innerHTML = content;
        this.footer.style.display = options.showFooter !== false ? 'flex' : 'none';
        this.confirmBtn.textContent = options.confirmText || 'Confirm';
        this.cancelBtn.textContent = options.cancelText || 'Cancel';
        this.onConfirm = options.onConfirm || null;
        this.onCancel = options.onCancel || null;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (window.lucide) lucide.createIcons();
    },

    close: function() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.onConfirm = null;
        this.onCancel = null;
    }
};

// ===== EMOJI MODAL =====
var EmojiModal = {
    overlay: null, body: null, initialized: false,
    init: function() {
        this.overlay = document.getElementById('emoji-modal-overlay');
        this.body = document.getElementById('emoji-modal-body');
        var closeBtn = document.getElementById('emoji-modal-close');
        if (!this.overlay) return;
        var self = this;
        closeBtn.addEventListener('click', function() { self.close(); });
        this.overlay.addEventListener('click', function(e) { if (e.target === self.overlay) self.close(); });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && self.overlay.classList.contains('active')) self.close();
        });
        this.renderEmojiGrid();
        this.initialized = true;
    },
    renderEmojiGrid: function() {
        if (!this.body) return;
        this.body.innerHTML = '';
        EMOJI_CATEGORIES.forEach(function(cat) {
            var categoryDiv = document.createElement('div');
            categoryDiv.className = 'emoji-category';
            var nameDiv = document.createElement('div');
            nameDiv.className = 'emoji-category-name';
            nameDiv.textContent = cat.name;
            categoryDiv.appendChild(nameDiv);
            var gridDiv = document.createElement('div');
            gridDiv.className = 'emoji-category-grid';
            cat.emojis.forEach(function(emoji) {
                var span = document.createElement('span');
                span.className = 'emoji-item';
                span.textContent = emoji;
                span.addEventListener('click', function() {
                    var input = document.getElementById('messageInput');
                    if (input) { input.value += emoji; input.focus(); }
                });
                gridDiv.appendChild(span);
            });
            categoryDiv.appendChild(gridDiv);
            this.body.appendChild(categoryDiv);
        }.bind(this));
    },
    open: function() {
        if (!this.overlay) return;
        if (!this.initialized) this.init();
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    close: function() {
        if (!this.overlay) return;
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// ===== FUTURE FEATURE =====
function showFutureFeature(featureName, icon, description) {
    var content = '<div style="text-align:center; padding:20px;"><div style="font-size:48px; margin-bottom:12px;">' + icon + '</div>' +
        '<h4 style="font-size:16px; margin-bottom:8px; color:var(--text-primary);">' + featureName + ' \u2014 Future Feature</h4>' +
        '<p style="color:var(--text-secondary); font-size:13px; line-height:1.5;">' + description + '</p>' +
        '<p style="margin-top:12px; font-size:10px; opacity:0.5; color:var(--text-muted);">\uD83D\uDCA1 This helps keep CosmoHub running smoothly on the free tier.</p></div>';
    Modal.open(featureName, content, { showFooter: false });
}

// ===== NUMBER ANIMATION =====
function animateNumber(element, target, duration) {
    duration = duration || 800;
    if (!element) return;
    var start = parseInt(element.textContent.replace(/,/g, '')) || 0;
    var diff = target - start;
    if (diff === 0) return;
    var startTime = performance.now();
    function update(currentTime) {
        var elapsed = currentTime - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var easeOut = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(start + diff * easeOut);
        element.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// ===== SEARCH =====
function initSearch() {
    var input = document.getElementById('searchInput');
    if (!input) return;
    var debounceTimer;
    input.addEventListener('input', function(e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() { performSearch(e.target.value); }, 200);
    });
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { input.value = ''; performSearch(''); input.blur(); }
    });
}

function performSearch(query) {
    var lowerQuery = query.toLowerCase().trim();
    document.querySelectorAll('.recent-item').forEach(function(item) {
        item.style.display = (!lowerQuery || item.textContent.toLowerCase().includes(lowerQuery)) ? 'flex' : 'none';
    });
    document.querySelectorAll('.message-bubble').forEach(function(bubble) {
        var text = bubble.textContent.toLowerCase();
        var msg = bubble.closest('.message');
        if (msg) msg.style.opacity = (!lowerQuery || text.includes(lowerQuery)) ? '1' : '0.3';
    });
}

// ===== KEYBOARD =====
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            var s = document.getElementById('searchInput');
            if (s) s.focus();
        }
        if (e.key === 'Escape') {
            Modal.close();
            EmojiModal.close();
            var s = document.getElementById('searchInput');
            if (s && document.activeElement === s) { s.value = ''; performSearch(''); s.blur(); }
        }
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            var b = document.getElementById('collapse-btn');
            if (b) b.click();
        }
    });
}

// ===== RENDER FUNCTIONS =====
function renderGlobalChatInfo() {
    var channel = channels.find(function(c) { return c.id === currentChannelId; });
    if (!channel) channel = { name: 'Global Chat', description: 'Open discussion for all CosmoHub members.', icon: '\uD83D\uDE80', membersOnline: 0, totalMembers: 0 };
    var online = channel.membersOnline || 0;
    var total = channel.totalMembers || 0;
    if (elements.globalMemberCount) animateNumber(elements.globalMemberCount, online);
    if (elements.chatTitle) elements.chatTitle.textContent = channel.name;
    if (elements.onlineCount) elements.onlineCount.textContent = online.toLocaleString() + ' members online';
    if (elements.drawerChannelName) elements.drawerChannelName.textContent = channel.name;
    if (elements.drawerChannelDesc) elements.drawerChannelDesc.textContent = channel.description;
    if (elements.drawerOnlineCount) animateNumber(elements.drawerOnlineCount, online);
    if (elements.drawerTotalCount) animateNumber(elements.drawerTotalCount, total);
    if (elements.drawerMembersCount) animateNumber(elements.drawerMembersCount, online);
    if (elements.chatHeaderIcon) elements.chatHeaderIcon.innerHTML = '<span style="font-size:16px;">' + (channel.icon || '\uD83D\uDE80') + '</span>';
    if (elements.chatPrefix) elements.chatPrefix.textContent = '#';
    if (elements.drawerSectionTitle) elements.drawerSectionTitle.textContent = 'ONLINE MEMBERS';
}

function renderCommunityInfo(community) {
    if (!community) return;
    var online = currentCommunityMembers.filter(function(m) { return m.status === 'online'; }).length;
    var total = currentCommunityMembers.length;
    if (elements.chatTitle) elements.chatTitle.textContent = community.name;
    if (elements.onlineCount) elements.onlineCount.textContent = total.toLocaleString() + ' members';
    if (elements.drawerChannelName) elements.drawerChannelName.textContent = community.name;
    if (elements.drawerChannelDesc) elements.drawerChannelDesc.textContent = community.description || 'Community discussion';
    if (elements.drawerOnlineCount) animateNumber(elements.drawerOnlineCount, online);
    if (elements.drawerTotalCount) animateNumber(elements.drawerTotalCount, total);
    if (elements.drawerMembersCount) animateNumber(elements.drawerMembersCount, total);
    if (elements.chatHeaderIcon) elements.chatHeaderIcon.innerHTML = '<span style="font-size:16px;">' + (community.icon || '\uD83D\uDEA0') + '</span>';
    if (elements.chatPrefix) elements.chatPrefix.textContent = '#';
    if (elements.drawerSectionTitle) elements.drawerSectionTitle.textContent = 'COMMUNITY MEMBERS';
}

function renderRecentConversations() {
    if (!elements.recentList) return;
    elements.recentList.innerHTML = '';
    var data = recentConversations || [];
    if (data.length === 0) {
        elements.recentList.innerHTML = '<div class="empty-state"><i data-lucide="message-circle"></i><p>No conversations yet</p></div>';
        if (window.lucide) lucide.createIcons();
        return;
    }
    data.forEach(function(conv, i) {
        var item = document.createElement('div');
        item.className = 'recent-item' + (conv.id === currentChannelId ? ' active' : '');
        item.style.animationDelay = (i * 0.03) + 's';
        item.dataset.convId = conv.id;
        item.dataset.convType = conv.type || 'dm';

        var avatarHtml;
        if (conv.type === 'community') {
            avatarHtml = '<div class="group-icon" style="background:linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,211,238,0.2));"><span style="font-size:18px;">' + (conv.icon || '\uD83D\uDEA0') + '</span></div>';
        } else {
            avatarHtml = '<div class="recent-avatar"><img src="' + (conv.avatar || '') + '" alt="' + (conv.name || 'User') + '" onerror="this.style.display=\'none\'"><span class="status-indicator ' + (conv.status || 'offline') + '"></span></div>';
        }

        var unreadHtml = conv.unread > 0 ? '<span class="unread-badge">' + conv.unread + '</span>' : '';
        item.innerHTML = avatarHtml +
            '<div class="recent-info"><div class="recent-top"><span class="recent-name">' + (conv.name || 'Unknown') + '</span><span class="recent-time">' + (conv.time || '') + '</span></div>' +
            '<div class="recent-message"><span>' + (conv.lastMessage || '') + '</span>' + unreadHtml + '</div></div>';
        item.addEventListener('click', function() { switchConversation(conv.id, conv.type || 'dm'); });
        elements.recentList.appendChild(item);
    });
    if (window.lucide) lucide.createIcons();
}

function renderMyCommunities() {
    if (!elements.myCommunitiesList) return;
    elements.myCommunitiesList.innerHTML = '';
    var data = myCommunities || [];
    if (data.length === 0) {
        elements.myCommunitiesList.innerHTML = '<div class="empty-state" style="padding:16px 0;"><i data-lucide="users" style="width:20px;height:20px;"></i><p style="font-size:11px;">You haven\'t joined any communities yet</p></div>';
        if (window.lucide) lucide.createIcons();
        return;
    }
    data.forEach(function(comm, i) {
        var item = document.createElement('div');
        item.className = 'category-item' + (('community:' + comm.id) === currentChannelId ? ' active' : '');
        item.style.marginBottom = '6px';
        item.style.cursor = 'pointer';
        item.innerHTML =
            '<div class="category-icon" style="font-size:14px;">' + (comm.icon || '\uD83D\uDEA0') + '</div>' +
            '<div class="category-info"><span class="category-name">' + comm.name + '</span><span class="category-desc">' + (comm.description || 'Community') + '</span></div>' +
            '<span class="member-count">' + (comm.memberCount || 0) + '</span>';
        item.addEventListener('click', function() { switchConversation('community:' + comm.id, 'community'); });
        elements.myCommunitiesList.appendChild(item);
    });
}

function renderMessages() {
    if (!elements.messagesContainer) return;
    elements.messagesContainer.innerHTML = '';
    var data = messages || [];
    if (data.length === 0) {
        elements.messagesContainer.innerHTML = '<div class="empty-state"><i data-lucide="message-square"></i><p>No messages yet. Start the conversation!</p></div>';
        if (window.lucide) lucide.createIcons();
        return;
    }
    data.forEach(function(msg, i) {
        var messageEl = document.createElement('div');
        var isOwn = msg.user_id === currentUser.id;
        messageEl.className = 'message ' + (isOwn ? 'message-own' : '');
        messageEl.style.animationDelay = (i * 0.03) + 's';
        var displayName = msg.username || 'Unknown';
        var avatar = msg.avatar || '';
        var timeStr = msg.created_at ? formatTime(msg.created_at) : (msg.time || '');
        var content = (msg.content || '').replace(/\\n/g, '<br>');
        messageEl.innerHTML =
            '<div class="message-avatar"><img src="' + avatar + '" alt="' + displayName + '" onerror="this.style.display=\'none\'"></div>' +
            '<div class="message-content"><div class="message-header"><span class="message-author">' + displayName + '</span><span class="message-time">' + timeStr + '</span></div>' +
            '<div class="message-bubble">' + content + '</div></div>';
        elements.messagesContainer.appendChild(messageEl);
    });
    if (window.lucide) lucide.createIcons();
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
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

function renderMembersList(container, data) {
    if (!container) return;
    container.innerHTML = '';
    if (data.length === 0) {
        container.innerHTML = '<div class="empty-state"><i data-lucide="users"></i><p>No members</p></div>';
        if (window.lucide) lucide.createIcons();
        return;
    }
    data.forEach(function(member, i) {
        var statusText = member.status === 'online' ? 'Online' : member.status === 'idle' ? 'Idle' : 'Do Not Disturb';
        var crownHtml = member.isAdmin ? '<span class="member-crown">\uD83D\uDC51</span>' : '';
        var div = document.createElement('div');
        div.className = 'member-item';
        div.style.animationDelay = (i * 0.03) + 's';
        div.innerHTML =
            '<div class="member-avatar"><img src="' + (member.avatar || '') + '" alt="' + (member.name || 'User') + '" onerror="this.style.display=\'none\'"><span class="status-indicator ' + (member.status || 'offline') + '"></span></div>' +
            '<div class="member-info"><span class="member-name">' + (member.name || 'Unknown') + '</span><span class="member-status ' + (member.status || 'offline') + '">' + statusText + '</span></div>' + crownHtml;
        container.appendChild(div);
    });
}

function renderMembers() {
    if (currentChatType === 'community') {
        renderMembersList(elements.drawerMembersList, currentCommunityMembers || []);
    } else {
        renderMembersList(elements.drawerMembersList, onlineMembers || []);
    }
}

function renderSidebarOnlineCount() {
    if (elements.onlineCountSidebar) animateNumber(elements.onlineCountSidebar, onlineMembers.length);
}

// ===== TAB SWITCHING =====
function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.tab === tab);
    });

    if (tab === 'global') {
        if (elements.globalCategory) elements.globalCategory.style.display = '';
        if (elements.communitiesList) elements.communitiesList.style.display = 'none';
        if (elements.recentHeader) elements.recentHeader.style.display = '';
        if (elements.recentList) elements.recentList.style.display = '';
        if (elements.newMessageBtn) elements.newMessageBtn.style.display = '';
        switchConversation('global', 'global');
    } else if (tab === 'direct') {
        if (elements.globalCategory) elements.globalCategory.style.display = 'none';
        if (elements.communitiesList) elements.communitiesList.style.display = 'none';
        if (elements.recentHeader) elements.recentHeader.style.display = '';
        if (elements.recentList) elements.recentList.style.display = '';
        if (elements.newMessageBtn) elements.newMessageBtn.style.display = '';
        var firstDM = recentConversations.find(function(c) { return c.type === 'dm'; });
        if (firstDM) {
            switchConversation(firstDM.id, 'dm');
        } else {
            showToast('Direct Messages', 'Select a conversation or click New Message', 'info', 2000);
            if (elements.messagesContainer) elements.messagesContainer.innerHTML = '<div class="empty-state"><i data-lucide="message-square"></i><p>No direct messages yet. Click New Message to start!</p></div>';
            if (window.lucide) lucide.createIcons();
        }
    } else if (tab === 'communities') {
        if (elements.globalCategory) elements.globalCategory.style.display = 'none';
        if (elements.communitiesList) elements.communitiesList.style.display = '';
        if (elements.recentHeader) elements.recentHeader.style.display = 'none';
        if (elements.recentList) elements.recentList.style.display = 'none';
        if (elements.newMessageBtn) elements.newMessageBtn.style.display = 'none';
        loadCommunities();
        if (myCommunities.length > 0) {
            switchConversation('community:' + myCommunities[0].id, 'community');
        } else {
            if (elements.messagesContainer) elements.messagesContainer.innerHTML = '<div class="empty-state"><i data-lucide="users"></i><p>Join or create a community to start chatting!</p></div>';
            if (elements.chatTitle) elements.chatTitle.textContent = 'Communities';
            if (elements.onlineCount) elements.onlineCount.textContent = '';
            if (window.lucide) lucide.createIcons();
        }
    }
}

// ===== CONVERSATION SWITCHING =====
function switchConversation(channelId, type) {
    currentChannelId = channelId;
    currentChatType = type || 'global';
    currentCommunityId = type === 'community' ? channelId.replace('community:', '') : null;

    document.querySelectorAll('.recent-item').forEach(function(item) {
        item.classList.toggle('active', item.dataset.convId === channelId);
    });
    document.querySelectorAll('.category-item').forEach(function(item) {
        item.classList.toggle('active', false);
    });
    var globalChatItem = document.getElementById('globalChatItem');
    if (globalChatItem) globalChatItem.classList.toggle('active', channelId === 'global');

    if (type === 'community') {
        renderMyCommunities();
    }

    if (type === 'global') {
        renderGlobalChatInfo();
        updateJoinOverlay(false);
    } else if (type === 'dm') {
        var conv = recentConversations.find(function(c) { return c.id === channelId; });
        if (elements.chatTitle) elements.chatTitle.textContent = conv ? conv.name : 'Private Chat';
        if (elements.onlineCount) elements.onlineCount.textContent = 'Private conversation';
        if (elements.drawerChannelName) elements.drawerChannelName.textContent = conv ? conv.name : 'Private Chat';
        if (elements.drawerChannelDesc) elements.drawerChannelDesc.textContent = 'Direct message conversation.';
        if (elements.drawerOnlineCount) animateNumber(elements.drawerOnlineCount, 1);
        if (elements.drawerTotalCount) animateNumber(elements.drawerTotalCount, 2);
        if (elements.chatHeaderIcon) elements.chatHeaderIcon.innerHTML = '<span style="font-size:16px;">\uD83D\uDCAC</span>';
        if (elements.chatPrefix) elements.chatPrefix.textContent = '@';
        if (elements.drawerSectionTitle) elements.drawerSectionTitle.textContent = 'PARTICIPANTS';
        updateJoinOverlay(false);
    } else if (type === 'community') {
        var community = myCommunities.find(function(c) { return c.id === currentCommunityId; });
        if (!community) community = communities.find(function(c) { return c.id === currentCommunityId; });
        if (community) renderCommunityInfo(community);
        checkCommunityMembership();
    }

    if (elements.messageInput) {
        var targetName;
        if (type === 'global') targetName = '# Global Chat';
        else if (type === 'community') targetName = '# ' + (elements.chatTitle && elements.chatTitle.textContent ? elements.chatTitle.textContent : 'Community');
        else targetName = (conv && conv.name ? conv.name : 'user');
        elements.messageInput.placeholder = 'Message ' + targetName + '...';
    }

    loadMessagesForChannel(channelId);
    if (supabaseReady) subscribeToChannel(channelId);
}

function updateJoinOverlay(show) {
    if (elements.communityJoinOverlay) {
        elements.communityJoinOverlay.style.display = show ? '' : 'none';
    }
    if (elements.chatInputArea) {
        elements.chatInputArea.style.display = show ? 'none' : '';
    }
}

function checkCommunityMembership() {
    if (!currentCommunityId || !currentUser.id) return;
    apiFetch(API_URL + '/api/community-members?community_id=' + currentCommunityId)
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data && Array.isArray(data)) {
                isMemberOfCurrentCommunity = data.some(function(m) { return m.id === currentUser.id; });
                currentCommunityMembers = data;
                renderMembers();
                updateJoinOverlay(!isMemberOfCurrentCommunity);
            }
        })
        .catch(function(err) { console.warn('checkCommunityMembership error:', err); });
}

// ===== MESSAGE FUNCTIONS =====
function sendMessage() {
    if (!elements.messageInput) return;
    var content = elements.messageInput.value.trim();
    if (!content) return;
    console.log('[CosmoHub Chat] Sending message to:', currentChannelId, 'type:', currentChatType);

    if (!currentUser.id) {
        showToast('Login Required', 'Please sign in to send messages.', 'warning', 3000);
        return;
    }

    if (currentChatType === 'community' && !isMemberOfCurrentCommunity) {
        showToast('Join Required', 'Join this community to send messages.', 'warning', 3000);
        return;
    }

    if (isSendingMessage) return;
    isSendingMessage = true;

    var messageData = { channel_id: currentChannelId, content: content };
    elements.messageInput.value = '';

    apiFetch(API_URL + '/api?endpoint=messages', {
        method: 'POST',
        body: JSON.stringify(messageData)
    })
    .then(function(res) {
        if (!res.ok) {
            return res.json().then(function(err) {
                console.error('[CosmoHub Chat] Failed to save:', err);
                var msg = err.error || err.message || ('HTTP ' + res.status);
                showToast('Error', msg, 'error', 4000);
                elements.messageInput.value = content;
            }).catch(function() {
                res.text().then(function(text) {
                    console.error('[CosmoHub Chat] Raw error response:', text);
                    showToast('Error', 'Server error: ' + res.status, 'error', 4000);
                }).catch(function() {
                    showToast('Error', 'Message not saved (HTTP ' + res.status + ')', 'error', 4000);
                });
                elements.messageInput.value = content;
            });
        }
        return res.json().then(function(data) {
            console.log('[CosmoHub Chat] Message saved:', data.id);
        });
    })
    .catch(function(err) {
        console.error('[CosmoHub Chat] Send exception:', err);
        showToast('Error', 'Failed to send message.', 'error', 3000);
        elements.messageInput.value = content;
    })
    .finally(function() {
        isSendingMessage = false;
    });
}

function loadMessagesForChannel(channelId) {
    if (!channelId) return;
    apiFetch(API_URL + '/api/messages?channel_id=' + encodeURIComponent(channelId))
        .then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(function(data) {
            messages = data || [];
            renderMessages();
        })
        .catch(function(err) {
            console.error('[CosmoHub Chat] Load messages error:', err);
            if (supabaseReady && sb) {
                sb.from('messages').select('*').eq('channel_id', channelId).order('created_at', { ascending: true }).limit(200)
                    .then(function(result) {
                        if (!result.error && result.data) {
                            messages = result.data;
                            renderMessages();
                        }
                    });
            }
        });
}

function subscribeToChannel(channelId) {
    if (!supabaseReady || !sb) return;
    if (realtimeChannel) { sb.removeChannel(realtimeChannel); realtimeChannel = null; }
    realtimeChannel = sb.channel('chat-' + channelId)
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages', filter: 'channel_id=eq.' + channelId },
            function(payload) {
                var newMsg = payload.new;
                var exists = messages.some(function(m) { return m.id === newMsg.id; });
                if (!exists) { messages.push(newMsg); renderMessages(); }
            })
        .subscribe(function(status) {
            console.log('[CosmoHub Chat] Realtime status:', status);
        });
}

// ===== DATA LOADING =====
function loadChannels() {
    safeFetch(API_URL + '/api?endpoint=channels', [])
        .then(function(data) {
            if (data && data.length > 0) {
                channels = data;
                if (currentChatType === 'global') renderGlobalChatInfo();
            }
        });
}

function loadCommunities() {
    safeFetch(API_URL + '/api?endpoint=communities', [])
        .then(function(data) {
            if (data) {
                communities = data;
                myCommunities = data.filter(function(c) { return c.isMember; });
                renderMyCommunities();
            }
        });
}

function loadOnlineMembers() {
    safeFetch(API_URL + '/api?endpoint=online-members', [])
        .then(function(data) {
            if (data) {
                onlineMembers = data;
                renderMembers();
                renderSidebarOnlineCount();
            }
        });
}

function loadAllMembers() {
    safeFetch(API_URL + '/api?endpoint=members', [])
        .then(function(data) { if (data) allMembers = data; });
}

function loadConversations() {
    if (!currentUser.id) {
        recentConversations = [];
        renderRecentConversations();
        return;
    }
    safeFetch(API_URL + '/api?endpoint=conversations', [])
        .then(function(data) {
            if (data && data.length > 0) {
                recentConversations = data;
                renderRecentConversations();
            }
        });
}

// ===== USER PROFILE =====
function loadUserProfile() {
    var saved = localStorage.getItem('cosmohub_user');
    if (saved) {
        try { currentUser = JSON.parse(JSON.stringify(DEFAULT_USER));
            var parsed = JSON.parse(saved);
            Object.keys(parsed).forEach(function(k) { currentUser[k] = parsed[k]; });
        } catch (e) {}
    }

    var token = getToken();
    if (!token) { updateUserDisplay(); return Promise.resolve(); }

    return apiFetch(API_URL + '/api/me')
        .then(function(res) {
            if (res.ok) return res.json();
            throw new Error('Not ok');
        })
        .then(function(json) {
            var user = json.user;
            currentUser = {
                id: user.id, name: user.name || user.username, username: user.username,
                role: user.role || 'Explorer', avatar: user.avatar || '', status: 'online'
            };
            localStorage.setItem('cosmohub_user', JSON.stringify(currentUser));
        })
        .catch(function(err) { console.warn('[CosmoHub Chat] Profile load error:', err); })
        .finally(function() { updateUserDisplay(); });
}

function updateUserDisplay() {
    if (elements.messageInput && currentUser.username) {
        var target;
        if (currentChatType === 'global') target = '# Global Chat';
        else if (currentChatType === 'community') target = '# ' + (elements.chatTitle && elements.chatTitle.textContent ? elements.chatTitle.textContent : 'Community');
        else target = '';
        elements.messageInput.placeholder = 'Message ' + (target || currentUser.username) + '...';
    }
}

// ===== COMMUNITY ACTIONS =====
function joinCommunity() {
    if (!currentCommunityId || !currentUser.id) {
        showToast('Login Required', 'Please sign in to join communities.', 'warning', 3000);
        return;
    }
    apiFetch(API_URL + '/api?endpoint=community-members', {
        method: 'POST',
        body: JSON.stringify({ community_id: currentCommunityId })
    })
    .then(function(res) {
        if (res.ok) {
            showToast('Joined!', 'You are now a member of this community.', 'success', 2000);
            isMemberOfCurrentCommunity = true;
            updateJoinOverlay(false);
            loadCommunities().then(function() { checkCommunityMembership(); });
        } else {
            return res.json().then(function(err) {
                showToast('Error', err.error || 'Failed to join', 'error', 3000);
            });
        }
    })
    .catch(function(err) {
        showToast('Error', 'Failed to join community.', 'error', 3000);
    });
}

function showCreateCommunityModal() {
    if (!currentUser.id) {
        showToast('Login Required', 'Please sign in to create a community.', 'warning', 3000);
        return;
    }
    var content =
        '<div style="display:flex; flex-direction:column; gap:12px;">' +
        '<div><label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">Community Name *</label>' +
        '<input type="text" id="community-name-input" placeholder="e.g. Space Explorers" style="width:100%; padding:10px 12px; background:var(--bg-input); border:1px solid var(--border-color); border-radius:var(--radius-md); color:var(--text-primary); font-size:13px; font-family:inherit; outline:none;"></div>' +
        '<div><label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">Description</label>' +
        '<input type="text" id="community-desc-input" placeholder="What is this community about?" style="width:100%; padding:10px 12px; background:var(--bg-input); border:1px solid var(--border-color); border-radius:var(--radius-md); color:var(--text-primary); font-size:13px; font-family:inherit; outline:none;"></div>' +
        '<div><label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">Icon (emoji)</label>' +
        '<input type="text" id="community-icon-input" placeholder="\uD83D\uDEA0" value="\uD83D\uDEA0" maxlength="2" style="width:80px; padding:10px 12px; background:var(--bg-input); border:1px solid var(--border-color); border-radius:var(--radius-md); color:var(--text-primary); font-size:18px; font-family:inherit; outline:none; text-align:center;"></div>' +
        '</div>';

    Modal.open('Create Community', content, {
        confirmText: 'Create',
        onConfirm: function() {
            var name = document.getElementById('community-name-input').value.trim();
            var desc = document.getElementById('community-desc-input').value.trim();
            var icon = document.getElementById('community-icon-input').value.trim() || '\uD83D\uDEA0';
            if (!name) { showToast('Error', 'Community name is required.', 'error', 3000); return; }
            apiFetch(API_URL + '/api?endpoint=communities', {
                method: 'POST',
                body: JSON.stringify({ name: name, description: desc, icon: icon })
            })
            .then(function(res) {
                if (res.ok) {
                    return res.json().then(function(data) {
                        showToast('Created!', 'Community "' + name + '" created successfully.', 'success', 3000);
                        loadCommunities().then(function() {
                            switchConversation('community:' + data.id, 'community');
                        });
                    });
                } else {
                    return res.json().then(function(err) {
                        showToast('Error', err.error || 'Failed to create community', 'error', 3000);
                    });
                }
            })
            .catch(function(err) {
                showToast('Error', 'Failed to create community.', 'error', 3000);
            });
        }
    });
}

// ===== MODAL CONTENT BUILDERS =====
function buildMemberList(members) {
    if (!members || members.length === 0) {
        return '<div class="empty-state"><i data-lucide="users"></i><p>No members to display</p></div>';
    }
    return members.map(function(m, i) {
        var statusText = m.status === 'online' ? 'Online' : m.status === 'idle' ? 'Idle' : m.status === 'dnd' ? 'Do Not Disturb' : 'Offline';
        var crownHtml = m.isAdmin ? '<span style="color:var(--accent-purple); font-size:12px;">\uD83D\uDC51</span>' : '';
        var safeName = (m.name || m.username || 'User').replace(/'/g, "\\'");
        return '<div class="modal-list-item" style="animation-delay:' + (i * 0.02) + 's; cursor:pointer;" onclick="startDM(\'' + m.id + '\', \'' + safeName + '\')">' +
            '<div class="member-avatar" style="width:36px;height:36px;flex-shrink:0;">' +
            '<img src="' + (m.avatar || '') + '" alt="' + (m.name || 'User') + '" onerror="this.style.display=\'none\'" style="width:100%;height:100%;object-fit:cover;">' +
            '<span class="status-indicator ' + (m.status || 'offline') + '"></span></div>' +
            '<div style="flex:1; min-width:0;">' +
            '<div style="font-size:12px; font-weight:500; color:var(--text-primary); margin-bottom:2px; display:flex; align-items:center; gap:4px;">' + (m.name || m.username || 'Unknown') + ' ' + crownHtml + '</div>' +
            '<div style="font-size:10px; color:var(--text-muted);">' + statusText + '</div></div></div>';
    }).join('');
}

function initModalButtons() {
    var drawerViewAll = document.getElementById('drawer-view-all');
    if (drawerViewAll) {
        drawerViewAll.addEventListener('click', function() {
            var membersToShow = currentChatType === 'community' ? currentCommunityMembers : (allMembers.length > 0 ? allMembers : onlineMembers);
            Modal.open('All Members \u2014 Click to Message', buildMemberList(membersToShow), { showFooter: false });
        });
    }

    var newMsgBtn = document.getElementById('new-message-btn');
    if (newMsgBtn) {
        newMsgBtn.addEventListener('click', function() {
            if (!currentUser.id) { showToast('Login Required', 'Please sign in to start a conversation.', 'warning', 3000); return; }
            var membersToShow = allMembers.length > 0 ? allMembers : onlineMembers;
            Modal.open('Start a Conversation', buildMemberList(membersToShow), { showFooter: false });
        });
    }

    var createBtn = document.getElementById('create-community-btn');
    if (createBtn) createBtn.addEventListener('click', showCreateCommunityModal);

    var joinBtn = document.getElementById('join-community-btn');
    if (joinBtn) joinBtn.addEventListener('click', joinCommunity);
}

window.startDM = function(userId, userName) {
    Modal.close();
    var dmChannelId = generateDMChannelId(currentUser.id, userId);
    var exists = recentConversations.find(function(c) { return c.id === dmChannelId; });
    if (!exists) {
        recentConversations.unshift({
            id: dmChannelId, name: userName, type: 'dm', avatar: '',
            lastMessage: '', time: 'Now', unread: 0, status: 'online'
        });
        renderRecentConversations();
    }
    switchTab('direct');
    switchConversation(dmChannelId, 'dm');
    showToast('Conversation started', 'Messaging ' + userName, 'success', 2000);
};

function generateDMChannelId(userA, userB) {
    if (!userA || !userB) return '';
    var sorted = [userA, userB].sort();
    return 'dm:' + sorted[0] + ':' + sorted[1];
}

// ===== MENU DRAWER =====
function initMenuDrawer() {
    var menuBtn = document.getElementById('channel-menu-btn');
    var drawer = document.getElementById('menu-drawer');
    var overlay = document.getElementById('menu-drawer-overlay');
    var closeBtn = document.getElementById('menu-drawer-close');
    if (!menuBtn || !drawer || !overlay) return;

    function openDrawer() {
        drawer.classList.add('open');
        overlay.classList.add('open');
        menuBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (window.lucide) lucide.createIcons();
    }
    function closeDrawer() {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        menuBtn.classList.remove('active');
        document.body.style.overflow = '';
    }
    menuBtn.addEventListener('click', function() {
        if (drawer.classList.contains('open')) closeDrawer(); else openDrawer();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    if (elements.sendBtn) elements.sendBtn.addEventListener('click', sendMessage);
    if (elements.messageInput) {
        elements.messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
        });
    }

    var emojiBtn = document.getElementById('emoji-btn');
    if (emojiBtn) emojiBtn.addEventListener('click', function() { EmojiModal.open(); });

    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { switchTab(btn.dataset.tab); });
    });

    var globalChatItem = document.getElementById('globalChatItem');
    if (globalChatItem) {
        globalChatItem.addEventListener('click', function() {
            switchTab('global');
            switchConversation('global', 'global');
        });
    }

    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var targetPage = this.dataset.page;
            if (targetPage) {
                var currentPage = window.location.pathname.split('/').pop();
                if (currentPage !== targetPage) window.location.href = targetPage;
            }
        });
    });

    var clipBtn = document.getElementById('clip-btn');
    if (clipBtn) {
        clipBtn.addEventListener('click', function() {
            showFutureFeature('Attach File', '\uD83D\uDCCE', 'File uploads are coming soon!');
        });
    }
    var gifBtn = document.getElementById('gif-btn');
    if (gifBtn) {
        gifBtn.addEventListener('click', function() {
            showFutureFeature('GIF Search', '\uD83C\uDF9E\uFE0F', 'GIF sharing is coming soon!');
        });
    }
}

// ===== POLLING =====
var pollInterval;
function startPolling() {
    pollInterval = setInterval(function() {
        loadOnlineMembers();
        if (currentUser.id) {
            loadConversations();
            apiFetch(API_URL + '/api?endpoint=online-members', { method: 'POST' }).catch(function() {});
        }
    }, 15000);
}
function stopPolling() {
    if (pollInterval) clearInterval(pollInterval);
    if (realtimeChannel) { sb.removeChannel(realtimeChannel); realtimeChannel = null; }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    if (window.lucide) lucide.createIcons();
    initElements();
    initEventListeners();
    supabaseReady = initSupabase();
    initStarfield();
    initSidebar();
    Modal.init();
    EmojiModal.init();
    initSearch();
    initModalButtons();
    initMenuDrawer();
    initKeyboardShortcuts();

    renderGlobalChatInfo();
    renderRecentConversations();
    renderMessages();
    renderMembers();
    renderSidebarOnlineCount();

    loadUserProfile().then(function() {
        loadChannels();
        loadOnlineMembers();
        loadAllMembers();
        loadConversations();
        loadCommunities();
        if (supabaseReady) {
            loadMessagesForChannel('global');
            subscribeToChannel('global');
        }
    });

    startPolling();
    console.log('%c\uD83D\uDE80 CosmoHub Chat \u2014 Global + DM + Communities', 'color:#a855f7; font-size:16px; font-weight:bold;');
});

window.addEventListener('beforeunload', stopPolling);