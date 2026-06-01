// ===== CosmoHub Chat - Enhanced Edition =====
// Features: Animated starfield, real-time clock, modals, toasts,
// localStorage persistence, search highlighting, keyboard shortcuts,
// animated counters, micro-interactions

const API_URL = window.location.origin;

// ===== DEFAULT DATA =====
const DEFAULT_CHANNELS = [{
    id: 'global',
    name: 'Global Chat',
    description: 'Open discussion for all CosmoHub members.',
    icon: '&#129680;',
    membersOnline: 0,
    totalMembers: 0,
    type: 'global'
}];

const DEFAULT_MESSAGES = [];
const DEFAULT_MEMBERS = [];
const DEFAULT_CONVERSATIONS = [];
const DEFAULT_NOTIFICATIONS = [];
const DEFAULT_USER = {
    id: 'user_001',
    name: 'Explorer',
    role: 'Member',
    avatar: '',
    status: 'online'
};

// ===== STATE =====
let currentUser = { ...DEFAULT_USER };
let channels = [...DEFAULT_CHANNELS];
let messages = [...DEFAULT_MESSAGES];
let onlineMembers = [...DEFAULT_MEMBERS];
let recentConversations = [...DEFAULT_CONVERSATIONS];
let notifications = [...DEFAULT_NOTIFICATIONS];
let currentChannelId = 'global';
let sidebarCollapsed = localStorage.getItem('cosmohub-sidebar') === 'true';
let allMembers = [...DEFAULT_MEMBERS];

// ===== SAFE FETCH HELPER =====
function safeFetch(url, defaultData) {
    return fetch(url)
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
        .catch(err => {
            console.warn(`[CosmoHub Chat] Failed to load ${url}:`, err.message);
            return defaultData;
        });
}

// ===== STARFIELD ANIMATION =====
function initStarfield() {
    const canvas = document.getElementById('starfield-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    const numStars = 150;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.2 + 0.3,
            alpha: Math.random(),
            speed: Math.random() * 0.3 + 0.1,
            twinkleSpeed: Math.random() * 0.02 + 0.005
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(star => {
            star.alpha += star.twinkleSpeed;
            if (star.alpha > 1 || star.alpha < 0.2) star.twinkleSpeed = -star.twinkleSpeed;
            const opacity = Math.abs(star.alpha);
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
            ctx.fill();
            star.y -= star.speed * 0.2;
            if (star.y < 0) star.y = canvas.height;
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// ===== SIDEBAR COLLAPSE =====
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const btn = document.getElementById('collapse-btn');
    if (!sidebar || !btn) return;

    if (sidebarCollapsed) sidebar.classList.add('collapsed');

    btn.addEventListener('click', () => {
        sidebarCollapsed = !sidebarCollapsed;
        sidebar.classList.toggle('collapsed', sidebarCollapsed);
        localStorage.setItem('cosmohub-sidebar', sidebarCollapsed);
    });
}

// ===== TOAST NOTIFICATIONS =====
function showToast(title, message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        info: 'info',
        warning: 'alert-triangle'
    };

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i data-lucide="${icons[type] || 'info'}" class="toast-icon ${type}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Dismiss">
            <i data-lucide="x"></i>
        </button>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    if (duration > 0) {
        setTimeout(() => removeToast(toast), duration);
    }
}

function removeToast(toast) {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
}

// ===== MODAL SYSTEM =====
const Modal = {
    overlay: null,
    title: null,
    body: null,
    footer: null,
    cancelBtn: null,
    confirmBtn: null,
    onConfirm: null,
    onCancel: null,

    init() {
        this.overlay = document.getElementById('modal-overlay');
        this.title = document.getElementById('modal-title');
        this.body = document.getElementById('modal-body');
        this.footer = document.getElementById('modal-footer');
        this.cancelBtn = document.getElementById('modal-cancel');
        this.confirmBtn = document.getElementById('modal-confirm');

        if (!this.overlay) return;

        document.getElementById('modal-close').addEventListener('click', () => this.close());
        this.cancelBtn.addEventListener('click', () => {
            if (this.onCancel) this.onCancel();
            this.close();
        });
        this.confirmBtn.addEventListener('click', () => {
            if (this.onConfirm) this.onConfirm();
            this.close();
        });
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
    },

    open(title, content, options = {}) {
        this.title.textContent = title;
        this.body.innerHTML = content;
        this.footer.style.display = options.showFooter !== false ? 'flex' : 'none';
        this.confirmBtn.textContent = options.confirmText || 'Confirm';
        this.cancelBtn.textContent = options.cancelText || 'Cancel';
        this.onConfirm = options.onConfirm || null;
        this.onCancel = options.onCancel || null;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        lucide.createIcons();
    },

    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.onConfirm = null;
        this.onCancel = null;
    }
};

// ===== NUMBER COUNTER ANIMATION =====
function animateNumber(element, target, duration = 800) {
    if (!element) return;
    const start = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + diff * easeOut);
        element.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// ===== SEARCH WITH HIGHLIGHTING =====
function initSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    let debounceTimer;
    input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => performSearch(e.target.value), 200);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            input.value = '';
            performSearch('');
            input.blur();
        }
    });
}

function performSearch(query) {
    const lowerQuery = query.toLowerCase().trim();

    // Search in recent conversations
    const recentItems = document.querySelectorAll('.recent-item');
    recentItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = (!lowerQuery || text.includes(lowerQuery)) ? 'flex' : 'none';
    });

    // Search in messages
    const messageBubbles = document.querySelectorAll('.message-bubble');
    messageBubbles.forEach(bubble => {
        const text = bubble.textContent.toLowerCase();
        bubble.parentElement.parentElement.style.opacity = (!lowerQuery || text.includes(lowerQuery)) ? '1' : '0.3';
    });

    // Remove old highlights
    document.querySelectorAll('.search-highlight').forEach(el => {
        const parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });

    if (!lowerQuery) {
        messageBubbles.forEach(b => b.parentElement.parentElement.style.opacity = '1');
        return;
    }

    // Highlight matches in messages
    const walker = document.createTreeWalker(
        document.querySelector('.chat-main'),
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.toLowerCase().includes(lowerQuery) && node.parentElement && !node.parentElement.classList.contains('search-highlight')) {
            textNodes.push(node);
        }
    }

    textNodes.forEach(node => {
        const parent = node.parentNode;
        const text = node.textContent;
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        const parts = text.split(regex);
        const fragment = document.createDocumentFragment();
        parts.forEach(part => {
            if (part.toLowerCase() === lowerQuery) {
                const span = document.createElement('span');
                span.className = 'search-highlight';
                span.textContent = part;
                fragment.appendChild(span);
            } else {
                fragment.appendChild(document.createTextNode(part));
            }
        });
        parent.replaceChild(fragment, node);
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ===== KEYBOARD SHORTCUTS =====
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.focus();
        }
        if (e.key === 'Escape') {
            Modal.close();
            const searchInput = document.getElementById('searchInput');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.value = '';
                performSearch('');
                searchInput.blur();
            }
        }
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            const btn = document.getElementById('collapse-btn');
            if (btn) btn.click();
        }
    });
}

// ===== DOM ELEMENTS =====
let elements = {};

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
        membersList: document.getElementById('membersList'),
        onlineMembersCount: document.getElementById('onlineMembersCount'),
        drawerChannelName: document.getElementById('drawerChannelName'),
        drawerChannelDesc: document.getElementById('drawerChannelDesc'),
        drawerOnlineCount: document.getElementById('drawerOnlineCount'),
        drawerTotalCount: document.getElementById('drawerTotalCount'),
        drawerMembersList: document.getElementById('drawerMembersList'),
        drawerMembersCount: document.getElementById('drawerMembersCount'),
        drawerChannelIcon: document.getElementById('drawerChannelIcon'),
        notifBadge: document.getElementById('notifBadge'),
        msgBadge: document.getElementById('msgBadge'),
        searchInput: document.getElementById('searchInput'),
        onlineCountSidebar: document.getElementById('online-count')
    };
}

// ===== RENDER FUNCTIONS (Enhanced with animations) =====

function renderGlobalChatInfo() {
    const channel = channels.find(c => c.id === currentChannelId) || channels[0] || DEFAULT_CHANNELS[0];
    if (!channel) return;

    const online = channel.membersOnline !== undefined ? channel.membersOnline : 0;
    const total = channel.totalMembers !== undefined ? channel.totalMembers : 0;

    if (elements.globalMemberCount) animateNumber(elements.globalMemberCount, online);
    if (elements.chatTitle) elements.chatTitle.textContent = channel.name || 'Global Chat';
    if (elements.onlineCount) elements.onlineCount.textContent = `${online.toLocaleString()} members online`;
    if (elements.drawerChannelName) elements.drawerChannelName.textContent = channel.name || 'Global Chat';
    if (elements.drawerChannelDesc) elements.drawerChannelDesc.textContent = channel.description || 'Open discussion for all CosmoHub members.';
    if (elements.drawerOnlineCount) animateNumber(elements.drawerOnlineCount, online);
    if (elements.drawerTotalCount) animateNumber(elements.drawerTotalCount, total);
    if (elements.drawerMembersCount) animateNumber(elements.drawerMembersCount, online);
    if (elements.onlineMembersCount) animateNumber(elements.onlineMembersCount, online);
    if (elements.chatHeaderIcon) elements.chatHeaderIcon.innerHTML = `<span style="font-size: 16px;">${channel.icon || '&#129680;'}</span>`;
}

function renderRecentConversations() {
    if (!elements.recentList) return;
    elements.recentList.innerHTML = '';

    const data = recentConversations || [];
    if (data.length === 0) {
        elements.recentList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="message-circle"></i>
                <p>No conversations yet</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    data.forEach((conv, i) => {
        const item = document.createElement('div');
        item.className = 'recent-item';
        item.style.animationDelay = `${i * 0.03}s`;
        const avatarHtml = conv.type === 'group'
            ? `<div class="group-icon"><i data-lucide="${conv.icon || 'users'}" style="width:18px;height:18px;"></i></div>`
            : `<div class="recent-avatar"><img src="${conv.avatar || ''}" alt="${conv.name || 'User'}" onerror="this.style.display='none'"><span class="status-indicator ${conv.status || 'offline'}"></span></div>`;
        const unreadHtml = conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : '';
        item.innerHTML = `
            ${avatarHtml}
            <div class="recent-info">
                <div class="recent-top"><span class="recent-name">${conv.name || 'Unknown'}</span><span class="recent-time">${conv.time || ''}</span></div>
                <div class="recent-message"><span>${conv.lastMessage || ''}</span>${unreadHtml}</div>
            </div>`;
        elements.recentList.appendChild(item);
    });
    lucide.createIcons();
}

function renderMessages() {
    if (!elements.messagesContainer) return;
    elements.messagesContainer.innerHTML = '';

    const data = messages || [];
    if (data.length === 0) {
        elements.messagesContainer.innerHTML = `
            <div class="empty-state">
                <i data-lucide="message-square"></i>
                <p>No messages yet. Start the conversation!</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    data.forEach((msg, i) => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${msg.isOwn ? 'message-own' : ''}`;
        messageEl.style.animationDelay = `${i * 0.03}s`;
        const adminBadge = msg.isAdmin ? `<span class="message-badge"><i data-lucide="check" style="width:9px;height:9px;"></i></span>` : '';
        const reactionsHtml = msg.reactions && msg.reactions.length > 0
            ? `<div class="message-reactions">${msg.reactions.map(r => `<div class="reaction"><span class="reaction-emoji">${r.emoji || '&#128077;'}</span><span>${r.count || 0}</span></div>`).join('')}</div>`
            : '';

        messageEl.innerHTML = `
            <div class="message-avatar"><img src="${msg.authorAvatar || ''}" alt="${msg.authorName || 'User'}" onerror="this.style.display='none'"></div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${msg.authorName || 'Unknown'}</span>${adminBadge}
                    <span class="message-time">${msg.time || ''}</span>
                </div>
                <div class="message-bubble">${(msg.content || '').replace(/\n/g, '<br>')}</div>
                ${reactionsHtml}
            </div>`;
        elements.messagesContainer.appendChild(messageEl);
    });
    lucide.createIcons();
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function buildMemberItem(member, i) {
    const statusText = member.status === 'online' ? 'Online' : member.status === 'idle' ? 'Idle' : 'Do Not Disturb';
    const crownHtml = member.isAdmin ? '<span class="member-crown">&#128081;</span>' : '';
    return `
        <div class="member-item" style="animation-delay: ${i * 0.03}s">
            <div class="member-avatar"><img src="${member.avatar || ''}" alt="${member.name || 'User'}" onerror="this.style.display='none'"><span class="status-indicator ${member.status || 'offline'}"></span></div>
            <div class="member-info"><span class="member-name">${member.name || 'Unknown'}</span><span class="member-status ${member.status || 'offline'}">${statusText}</span></div>
            ${crownHtml}
        </div>`;
}

function renderMembersList(container, data) {
    if (!container) return;
    container.innerHTML = '';
    if (data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="users"></i>
                <p>No members online</p>
            </div>`;
        lucide.createIcons();
        return;
    }
    data.forEach((member, i) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = buildMemberItem(member, i);
        container.appendChild(wrapper.firstElementChild);
    });
    lucide.createIcons();
}

function renderMembers() {
    renderMembersList(elements.membersList, onlineMembers || []);
    renderMembersList(elements.drawerMembersList, onlineMembers || []);
}

function renderNotifications() {
    const data = notifications || [];
    const unreadCount = data.filter(n => !n.read).length;
    if (elements.notifBadge) {
        animateNumber(elements.notifBadge, unreadCount);
        elements.notifBadge.style.display = 'flex';
    }
}

function renderSidebarOnlineCount() {
    if (elements.onlineCountSidebar) {
        const totalOnline = onlineMembers.length;
        animateNumber(elements.onlineCountSidebar, totalOnline);
    }
}

// ===== MODAL CONTENT BUILDERS =====
function buildMemberList(members) {
    if (!members || members.length === 0) {
        return `<div class="empty-state"><i data-lucide="users"></i><p>No members to display</p></div>`;
    }
    return members.map((m, i) => {
        const statusText = m.status === 'online' ? 'Online' : m.status === 'idle' ? 'Idle' : m.status === 'dnd' ? 'Do Not Disturb' : 'Offline';
        const crownHtml = m.isAdmin ? '<span style="color:var(--accent-purple); font-size:12px;">&#128081;</span>' : '';
        return `
        <div class="modal-list-item" style="animation-delay: ${i * 0.02}s">
            <div class="member-avatar" style="width:36px;height:36px;flex-shrink:0;">
                <img src="${m.avatar || ''}" alt="${m.name || 'User'}" onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover;">
                <span class="status-indicator ${m.status || 'offline'}"></span>
            </div>
            <div style="flex:1; min-width:0;">
                <div style="font-size:12px; font-weight:500; color:var(--text-primary); margin-bottom:2px; display:flex; align-items:center; gap:4px;">
                    ${m.name || 'Unknown'} ${crownHtml}
                </div>
                <div style="font-size:10px; color:var(--text-muted);">${statusText}</div>
            </div>
        </div>`;
    }).join('');
}

function initModalButtons() {
    const newMsgBtn = document.getElementById('new-message-btn');
    const drawerViewAll = document.getElementById('drawer-view-all');

    if (drawerViewAll) {
        drawerViewAll.addEventListener('click', () => {
            const membersToShow = allMembers.length > 0 ? allMembers : onlineMembers;
            Modal.open('All Members', buildMemberList(membersToShow), {
                showFooter: false
            });
        });
    }

    if (newMsgBtn) {
        newMsgBtn.addEventListener('click', () => {
            Modal.open('New Message', `
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <input type="text" placeholder="Search user..." style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; padding:8px 12px; color:var(--text-primary); font-family:inherit; font-size:12px; outline:none;">
                    <div style="font-size:10px; color:var(--text-muted); margin-top:4px;">Start typing to find a user to message.</div>
                </div>
            `, {
                confirmText: 'Start Chat',
                onConfirm: () => showToast('Chat started', 'New conversation created', 'success')
            });
        });
    }
}

// ===== MENU DRAWER =====
function initMenuDrawer() {
    const menuBtn = document.getElementById('channel-menu-btn');
    const drawer = document.getElementById('menu-drawer');
    const overlay = document.getElementById('menu-drawer-overlay');
    const closeBtn = document.getElementById('menu-drawer-close');

    if (!menuBtn || !drawer || !overlay) return;

    function open() {
        drawer.classList.add('open');
        overlay.classList.add('open');
        menuBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
        lucide.createIcons();
    }

    function close() {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        menuBtn.classList.remove('active');
        document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', () => {
        if (drawer.classList.contains('open')) {
            close();
        } else {
            open();
        }
    });

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
            close();
        }
    });
}


// ===== MESSAGE FUNCTIONS =====

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `Today at ${displayHours}:${minutes} ${ampm}`;
}

function sendMessage() {
    if (!elements.messageInput) return;
    const content = elements.messageInput.value.trim();
    if (!content) return;

    const newMessage = {
        id: 'msg_' + Date.now(),
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar || '',
        isAdmin: false,
        content: content,
        time: getCurrentTime(),
        isOwn: true,
        reactions: []
    };

    messages.push(newMessage);
    renderMessages();
    elements.messageInput.value = '';

    safeFetch(`${API_URL}/api/send-message`, { success: true })
        .then(() => {
            // Message sent successfully
        });
}

// ===== DATA LOADING =====

function loadChannels() {
    safeFetch(`${API_URL}/api/channels`, DEFAULT_CHANNELS)
        .then(data => {
            if (data && data.length > 0) {
                channels = data;
                renderGlobalChatInfo();
            }
        });
}

function loadMessages() {
    safeFetch(`${API_URL}/api/messages`, DEFAULT_MESSAGES)
        .then(data => {
            if (data) {
                messages = data.map(m => ({...m, isOwn: m.authorId === currentUser.id}));
                renderMessages();
            }
        });
}

function loadOnlineMembers() {
    safeFetch(`${API_URL}/api/online-members`, DEFAULT_MEMBERS)
        .then(data => {
            if (data) {
                onlineMembers = data;
                renderMembers();
                renderSidebarOnlineCount();
                if (channels[0]) {
                    channels[0].membersOnline = data.length;
                    renderGlobalChatInfo();
                }
            }
        });
}

function loadAllMembers() {
    safeFetch(`${API_URL}/api/members`, DEFAULT_MEMBERS)
        .then(data => {
            if (data) {
                allMembers = data;
            }
        });
}

function loadConversations() {
    safeFetch(`${API_URL}/api/conversations`, DEFAULT_CONVERSATIONS)
        .then(data => {
            if (data) {
                recentConversations = data;
                renderRecentConversations();
            }
        });
}

function loadBadges() {
    safeFetch(`${API_URL}/api/badges`, { notifications: 0, messages: 0 })
        .then(d => {
            if (elements.notifBadge) {
                const notifCount = d.notifications !== undefined && d.notifications !== null ? d.notifications : 0;
                animateNumber(elements.notifBadge, notifCount);
                elements.notifBadge.style.display = 'flex';
            }
            if (elements.msgBadge) {
                const msgCount = d.messages !== undefined && d.messages !== null ? d.messages : 0;
                animateNumber(elements.msgBadge, msgCount);
                elements.msgBadge.style.display = 'flex';
            }
        });
}

function loadNotifications() {
    safeFetch(`${API_URL}/api/notifications`, DEFAULT_NOTIFICATIONS)
        .then(data => {
            if (data) {
                notifications = data;
                renderNotifications();
            }
        });
}

function loadUserProfile() {
    safeFetch(`${API_URL}/api/profile`, DEFAULT_USER)
        .then(data => {
            if (data) {
                currentUser = { ...DEFAULT_USER, ...data };
            }
        });
}

// ===== POLLING =====
let pollInterval;

function startPolling() {
    pollInterval = setInterval(() => {
        safeFetch(`${API_URL}/api/messages`, DEFAULT_MESSAGES)
            .then(data => {
                if (data && data.length > messages.length) {
                    const newMsgs = data.slice(messages.length).map(m => ({...m, isOwn: m.authorId === currentUser.id}));
                    messages.push(...newMsgs);
                    renderMessages();
                }
            });

        safeFetch(`${API_URL}/api/online-members`, DEFAULT_MEMBERS)
            .then(data => {
                if (data) {
                    onlineMembers = data;
                    renderMembers();
                    renderSidebarOnlineCount();
                    if (channels[0]) {
                        channels[0].membersOnline = data.length;
                        renderGlobalChatInfo();
                    }
                }
            });
    }, 5000);
}

function stopPolling() {
    if (pollInterval) clearInterval(pollInterval);
}

// ===== EVENT LISTENERS =====

function initEventListeners() {
    // Send message
    if (elements.sendBtn) {
        elements.sendBtn.addEventListener('click', sendMessage);
    }
    if (elements.messageInput) {
        elements.messageInput.addEventListener('keypress', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Button micro-interactions
    document.querySelectorAll('.icon-btn, .input-action-btn, .send-btn, .new-message-btn, .view-all-btn, .tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.92)';
            setTimeout(() => this.style.transform = '', 150);
        });
    });

    // Navigation using data-page attributes
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetPage = this.dataset.page;
            if (targetPage) {
                const currentPage = window.location.pathname.split('/').pop();
                if (currentPage !== targetPage) {
                    window.location.href = targetPage;
                }
            }
        });
    });

    // Input action buttons
    document.querySelectorAll('.input-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.id;
            if (id === 'attach-btn') showToast('Attach', 'File upload coming soon', 'info', 2000);
            if (id === 'emoji-btn') showToast('Emoji', 'Emoji picker coming soon', 'info', 2000);
            if (id === 'gif-btn') showToast('GIF', 'GIF search coming soon', 'info', 2000);
            if (id === 'clip-btn') showToast('Attachment', 'File attachment coming soon', 'info', 2000);
        });
    });
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    initElements();
    initEventListeners();

    // Core systems
    initStarfield();
    initSidebar();
    Modal.init();
    initSearch();
    initModalButtons();
    initMenuDrawer();
    initKeyboardShortcuts();

    // Render defaults immediately
    renderGlobalChatInfo();
    renderRecentConversations();
    renderMessages();
    renderMembers();
    renderNotifications();
    renderSidebarOnlineCount();

    // Load from API
    loadUserProfile();
    loadChannels();
    loadMessages();
    loadOnlineMembers();
    loadAllMembers();
    loadConversations();
    loadNotifications();
    loadBadges();

    // Start polling
    startPolling();


    console.log('%c🚀 CosmoHub Chat Enhanced', 'color: #a855f7; font-size: 16px; font-weight: bold;');
    console.log('%cFeatures: Starfield, Clock, Modals, Toasts, Search, localStorage, Keyboard Shortcuts', 'color: #22d3ee; font-size: 11px;');
});

// Cleanup on page unload
window.addEventListener('beforeunload', stopPolling);