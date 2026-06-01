// ===== CosmoHub Dashboard - Enhanced Edition =====
// Features: Animated starfield, real-time clock, modals, toasts, 
// localStorage persistence, activity charts, search highlighting, 
// theme toggle, sidebar collapse, keyboard shortcuts

const API_URL = window.location.origin;
const BACKEND_READY = true;

// ===== DEFAULT DATA =====
const DEFAULT_STATS = { activeUsers: 0, unreadAnnouncements: 0, todoTasks: 0 };
const DEFAULT_ANNOUNCEMENTS = [];
const DEFAULT_EVENTS = [];
const DEFAULT_COMMUNITIES = [];
const DEFAULT_USER = { name: 'Explorer', handle: '@explorer', role: 'Member' };
const DEFAULT_SCHEDULE = { date: 'Today', items: [] };
const DEFAULT_TASKS = [];
const DEFAULT_ONLINE = { count: 0 };
const DEFAULT_BADGES = { notifications: 0, messages: 0 };

// ===== STATE =====
let currentTheme = localStorage.getItem('cosmohub-theme') || 'dark';
let sidebarCollapsed = localStorage.getItem('cosmohub-sidebar') === 'true';
let tasksData = JSON.parse(localStorage.getItem('cosmohub-tasks')) || DEFAULT_TASKS;

// ===== SAFE FETCH HELPER =====
function safeFetch(url, defaultData) {
    return fetch(url)
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
        .catch(err => {
            console.warn(`[CosmoHub] Failed to load ${url}:`, err.message);
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
            // Subtle drift
            star.y -= star.speed * 0.2;
            if (star.y < 0) star.y = canvas.height;
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// ===== REAL-TIME CLOCK =====
function initClock() {
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');
    if (!timeEl || !dateEl) return;

    function update() {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        dateEl.textContent = now.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    update();
    setInterval(update, 1000);
}

// ===== THEME TOGGLE =====
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const btn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    if (!btn || !icon) return;

    function updateIcon() {
        icon.setAttribute('data-lucide', currentTheme === 'dark' ? 'sun' : 'moon');
        lucide.createIcons();
    }
    updateIcon();

    btn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('cosmohub-theme', currentTheme);
        updateIcon();
        showToast('Theme updated', `Switched to ${currentTheme} mode`, 'info');
    });
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
    const start = parseInt(element.textContent) || 0;
    const diff = target - start;
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

// ===== ACTIVITY CHART =====
function drawActivityChart() {
    const canvas = document.getElementById('activity-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 5, bottom: 5, left: 0, right: 0 };
    const chartHeight = height - padding.top - padding.bottom;

    // Generate demo data (7 days)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const tasksData = [3, 5, 2, 7, 4, 6, 3];
    const eventsData = [1, 2, 0, 3, 1, 2, 1];
    const maxVal = Math.max(...tasksData, ...eventsData) + 1;

    function drawLine(data, color, fillColor) {
        ctx.beginPath();
        const stepX = width / (data.length - 1);
        data.forEach((val, i) => {
            const x = i * stepX;
            const y = padding.top + chartHeight - (val / maxVal) * chartHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Fill area
        ctx.lineTo(width, height - padding.bottom);
        ctx.lineTo(0, height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();

        // Draw points
        data.forEach((val, i) => {
            const x = i * stepX;
            const y = padding.top + chartHeight - (val / maxVal) * chartHeight;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = fillColor.replace(/[0-9.]+\)$/, '0.1)');
            ctx.fill();
        });
    }

    drawLine(tasksData, '#a855f7', 'rgba(168, 85, 247, 0.1)');
    drawLine(eventsData, '#22d3ee', 'rgba(34, 211, 238, 0.1)');

    // Day labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    const stepX = width / (days.length - 1);
    days.forEach((day, i) => {
        ctx.fillText(day, i * stepX, height - 2);
    });
}

// ===== SEARCH WITH HIGHLIGHTING =====
function initSearch() {
    const input = document.getElementById('search-input');
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
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const hasMatch = !lowerQuery || text.includes(lowerQuery);
        card.style.opacity = hasMatch ? '1' : '0.3';
        card.style.transform = hasMatch ? '' : 'scale(0.98)';
        card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    });

    // Remove old highlights
    document.querySelectorAll('.search-highlight').forEach(el => {
        const parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });

    if (!lowerQuery) return;

    // Add highlights
    const walker = document.createTreeWalker(
        document.querySelector('.dashboard-grid'),
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.toLowerCase().includes(lowerQuery)) {
            textNodes.push(node);
        }
    }

    textNodes.forEach(node => {
        const parent = node.parentNode;
        if (parent.classList && parent.classList.contains('search-highlight')) return;
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

// ===== DATA LOADERS (Enhanced with animations) =====

function loadStats(stats) {
    const container = document.getElementById('stats-row');
    if (!container) return;
    container.innerHTML = '';
    const configs = [
        { key: 'activeUsers', icon: 'users', color: 'purple', label: 'Active Users', dot: true },
        { key: 'unreadAnnouncements', icon: 'megaphone', color: 'pink', label: 'Unread Announcements' },
        { key: 'todoTasks', icon: 'check-circle-2', color: 'cyan', label: 'To-Do Tasks' }
    ];
    configs.forEach(cfg => {
        const val = stats && stats[cfg.key] !== undefined ? stats[cfg.key] : 0;
        const box = document.createElement('div');
        box.className = 'stat-box';
        box.innerHTML = `
            <div class="stat-icon-wrap ${cfg.color}"><i data-lucide="${cfg.icon}"></i></div>
            <div class="stat-info">
                <span class="stat-number" data-target="${val}">0</span>
                <span class="stat-label">${cfg.label}${cfg.dot ? '<span class="stat-online-dot"></span>' : ''}</span>
            </div>`;
        container.appendChild(box);
    });
    lucide.createIcons();

    // Animate numbers
    requestAnimationFrame(() => {
        container.querySelectorAll('.stat-number').forEach(el => {
            animateNumber(el, parseInt(el.dataset.target));
        });
    });
}

function loadAnnouncements(announcements) {
    const container = document.getElementById('announcement-list');
    if (!container) return;
    container.innerHTML = '';
    const data = announcements || [];
    if (data.length === 0) {
        container.innerHTML = `<div class="empty-state"><i data-lucide="megaphone"></i><p>No announcements yet</p></div>`;
        lucide.createIcons();
        return;
    }
    const colors = ['purple', 'blue', 'cyan'];
    const icons = ['megaphone', 'star', 'info'];
    data.slice(0, 5).forEach((ann, i) => {
        const item = document.createElement('div');
        item.className = 'announcement-item';
        item.style.animationDelay = `${i * 0.05}s`;
        item.innerHTML = `
            <div class="announcement-icon-wrap ${colors[i % 3]}"><i data-lucide="${icons[i % 3]}"></i></div>
            <div class="announcement-body">
                <div class="announcement-title">${ann.title || 'Untitled'}</div>
                <div class="announcement-desc">${ann.description || ''}</div>
                <div class="announcement-meta">
                    <span class="announcement-time">${ann.time || ann.date || ''}</span>
                    <span class="announcement-dot ${colors[i % 3]}"></span>
                </div>
            </div>`;
        container.appendChild(item);
    });
    lucide.createIcons();
}

function loadEvents(events) {
    const container = document.getElementById('events-list');
    if (!container) return;
    container.innerHTML = '';
    const data = events || [];
    if (data.length === 0) {
        container.innerHTML = `<div class="empty-state"><i data-lucide="calendar"></i><p>No upcoming events</p></div>`;
        lucide.createIcons();
        return;
    }
    data.forEach((evt, i) => {
        const item = document.createElement('div');
        item.className = 'event-item';
        item.style.animationDelay = `${i * 0.05}s`;
        const type = evt.type || 'event';
        item.innerHTML = `
            <div class="event-date">
                <span class="event-date-month">${evt.month || '---'}</span>
                <span class="event-date-day">${evt.day || '--'}</span>
            </div>
            <div class="event-body">
                <div class="event-title">${evt.title || 'Untitled Event'}</div>
                <div class="event-time">${evt.event_time || ''}</div>
                <span class="event-tag ${type}"><span class="event-tag-dot"></span>${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </div>`;
        container.appendChild(item);
    });
}

function loadCommunities(communities) {
    const container = document.getElementById('communities-grid');
    if (!container) return;
    container.innerHTML = '';
    const data = communities || [];
    if (data.length === 0) {
        container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><i data-lucide="users"></i><p>No communities yet</p></div>`;
        lucide.createIcons();
        return;
    }
    const colors = ['purple', 'blue', 'cyan', 'pink'];
    const icons = ['code-2', 'flask-conical', 'sigma', 'gamepad-2'];
    data.forEach((comm, i) => {
        const card = document.createElement('div');
        card.className = 'community-card';
        card.style.animationDelay = `${i * 0.05}s`;
        card.innerHTML = `
            <div class="community-card-icon ${colors[i % 4]}"><i data-lucide="${comm.icon || icons[i % 4]}"></i></div>
            <span class="community-card-name">${comm.name || 'Community'}</span>
            <span class="community-card-members">${comm.members !== undefined ? comm.members.toLocaleString() : '0'} members</span>`;
        container.appendChild(card);
    });
    lucide.createIcons();
}

function loadUserProfile(user) {
    const nameEl = document.getElementById('profile-name');
    const handleEl = document.getElementById('profile-handle');
    const roleEl = document.getElementById('profile-role');
    if (nameEl) nameEl.textContent = user && user.name ? user.name : 'Explorer';
    if (handleEl) handleEl.textContent = user && user.handle ? user.handle : '@explorer';
    if (roleEl) roleEl.textContent = user && user.role ? user.role : 'Member';
}

function loadSchedule(schedule) {
    const container = document.getElementById('schedule-list');
    const labelEl = document.getElementById('schedule-label');
    if (!container) return;
    const data = schedule || { date: 'Today', items: [] };
    if (labelEl) labelEl.textContent = data.date || 'Today';
    container.innerHTML = '';
    const items = data.items || [];
    if (items.length === 0) {
        container.innerHTML = `<div class="empty-state"><i data-lucide="clock"></i><p>No events today</p></div>`;
        lucide.createIcons();
        return;
    }
    const colors = ['purple', 'green', 'blue'];
    items.forEach((item, i) => {
        const el = document.createElement('div');
        el.className = 'schedule-item';
        el.style.animationDelay = `${i * 0.05}s`;
        el.innerHTML = `<span class="schedule-time">${item.time || ''}</span><span class="schedule-dot ${colors[i % 3]}"></span><span class="schedule-text">${item.title || ''}</span>`;
        container.appendChild(el);
    });
}

function loadTasks(tasks) {
    const container = document.getElementById('tasks-list');
    if (!container) return;
    container.innerHTML = '';
    const data = tasks || [];
    if (data.length === 0) {
        container.innerHTML = `<div class="empty-state"><i data-lucide="check-circle-2"></i><p>No tasks yet</p></div>`;
        lucide.createIcons();
        return;
    }
    data.forEach((task, i) => {
        const isDone = task.done === true;
        const item = document.createElement('div');
        item.className = 'task-item';
        item.style.animationDelay = `${i * 0.05}s`;
        item.innerHTML = `
            <div class="task-checkbox ${isDone ? 'checked' : 'unchecked'}" data-index="${i}">
                <i data-lucide="check"></i>
            </div>
            <div class="task-info">
                <div class="task-title ${isDone ? 'done' : ''}">${task.title || 'Untitled Task'}</div>
                <div class="task-due">${task.due || ''}</div>
            </div>`;
        container.appendChild(item);
    });
    attachCheckboxListeners();
    lucide.createIcons();
}

function attachCheckboxListeners() {
    document.querySelectorAll('.task-checkbox').forEach(box => {
        box.addEventListener('click', function(e) {
            e.stopPropagation();
            const isChecked = this.classList.toggle('checked');
            this.classList.toggle('unchecked', !isChecked);
            const taskTitle = this.closest('.task-item').querySelector('.task-title');
            if (taskTitle) taskTitle.classList.toggle('done', isChecked);
            lucide.createIcons();

            // Persist to localStorage
            const index = parseInt(this.dataset.index);
            if (!isNaN(index) && tasksData[index]) {
                tasksData[index].done = isChecked;
                localStorage.setItem('cosmohub-tasks', JSON.stringify(tasksData));
                if (isChecked) {
                    showToast('Task completed', tasksData[index].title, 'success', 2000);
                }
            }
        });
    });
}

function loadOnlineCount(count) {
    const el = document.getElementById('online-count');
    if (el) animateNumber(el, count !== undefined && count !== null ? count : 0);
}

function loadBadges(notifications, messages) {
    const notifBadge = document.getElementById('notif-badge');
    const msgBadge = document.getElementById('msg-badge');
    if (notifBadge) {
        const oldVal = parseInt(notifBadge.textContent) || 0;
        const newVal = notifications !== undefined && notifications !== null ? notifications : 0;
        if (newVal !== oldVal) animateNumber(notifBadge, newVal);
    }
    if (msgBadge) {
        const oldVal = parseInt(msgBadge.textContent) || 0;
        const newVal = messages !== undefined && messages !== null ? messages : 0;
        if (newVal !== oldVal) animateNumber(msgBadge, newVal);
    }
}

// ===== MODAL CONTENT BUILDERS =====
function buildModalList(items, type) {
    if (!items || items.length === 0) {
        return `<div class="empty-state"><i data-lucide="inbox"></i><p>No items to display</p></div>`;
    }
    return items.map((item, i) => `
        <div class="modal-list-item" style="animation-delay: ${i * 0.03}s">
            <div style="flex:1; min-width:0;">
                <div style="font-size:12px; font-weight:500; color:var(--text-primary); margin-bottom:2px;">${item.title || 'Untitled'}</div>
                <div style="font-size:10px; color:var(--text-muted);">${item.description || item.time || item.date || ''}</div>
            </div>
        </div>
    `).join('');
}

function initModalButtons() {
    const annBtn = document.getElementById('view-all-announcements');
    const evtBtn = document.getElementById('view-all-events');
    const commBtn = document.getElementById('view-all-communities');
    const taskBtn = document.getElementById('view-all-tasks');
    const newEventBtn = document.getElementById('new-event-btn');

    if (annBtn) {
        annBtn.addEventListener('click', () => {
            safeFetch(`${API_URL}/api/announcements`, DEFAULT_ANNOUNCEMENTS).then(data => {
                Modal.open('All Announcements', buildModalList(data, 'announcement'), {
                    confirmText: 'Mark all read',
                    onConfirm: () => showToast('Success', 'All announcements marked as read', 'success')
                });
            });
        });
    }

    if (evtBtn) {
        evtBtn.addEventListener('click', () => {
            window.location.href = 'CosmicCalendarUI.html';
        });
    }

    if (commBtn) {
        commBtn.addEventListener('click', () => {
            safeFetch(`${API_URL}/api/communities`, DEFAULT_COMMUNITIES).then(data => {
                Modal.open('All Communities', buildModalList(data, 'community'), {
                    confirmText: 'Join Community'
                });
            });
        });
    }

    if (taskBtn) {
        taskBtn.addEventListener('click', () => {
            const data = tasksData.length > 0 ? tasksData : DEFAULT_TASKS;
            Modal.open('All Tasks', buildModalList(data, 'task'), {
                confirmText: 'Clear Completed',
                onConfirm: () => {
                    tasksData = tasksData.filter(t => !t.done);
                    localStorage.setItem('cosmohub-tasks', JSON.stringify(tasksData));
                    loadTasks(tasksData);
                    showToast('Tasks updated', 'Completed tasks cleared', 'success');
                }
            });
        });
    }

}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card').forEach(card => {
        card.style.animationPlayState = 'paused';
        observer.observe(card);
    });
}

// ===== KEYBOARD SHORTCUTS =====
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+/ for search
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.focus();
        }
        // Escape to close modal
        if (e.key === 'Escape') {
            Modal.close();
        }
        // Ctrl+B for sidebar toggle
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            document.getElementById('collapse-btn').click();
        }
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();

    // Core systems
    initStarfield();
    initClock();
    initSidebar();
    Modal.init();
    initSearch();
    initModalButtons();
    initKeyboardShortcuts();

    // Navigation
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

    // Button micro-interactions
    document.querySelectorAll('.icon-btn, .view-all-btn, .theme-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.92)';
            setTimeout(() => this.style.transform = '', 150);
        });
    });

    // Notification button
    const notifBtn = document.getElementById('notification-btn');
    if (notifBtn) {
        notifBtn.addEventListener('click', () => {
            showToast('Notifications', 'You have no new notifications', 'info', 3000);
        });
    }

    // Message button
    const msgBtn = document.getElementById('message-btn');
    if (msgBtn) {
        msgBtn.addEventListener('click', () => {
            showToast('Messages', 'No unread messages', 'info', 3000);
        });
    }

    // ===== RENDER DEFAULT DATA =====
    loadStats(DEFAULT_STATS);
    loadAnnouncements(DEFAULT_ANNOUNCEMENTS);
    loadEvents(DEFAULT_EVENTS);
    loadCommunities(DEFAULT_COMMUNITIES);
    loadUserProfile(DEFAULT_USER);
    loadSchedule(DEFAULT_SCHEDULE);
    loadTasks(tasksData);
    loadOnlineCount(DEFAULT_ONLINE.count);
    loadBadges(DEFAULT_BADGES.notifications, DEFAULT_BADGES.messages);

    // Draw chart after layout
    requestAnimationFrame(() => {
        initScrollAnimations();
    });

    // ===== LOAD API DATA =====
    safeFetch(`${API_URL}/api/stats`, DEFAULT_STATS).then(loadStats);
    safeFetch(`${API_URL}/api/announcements`, DEFAULT_ANNOUNCEMENTS).then(loadAnnouncements);
    safeFetch(`${API_URL}/api/events`, DEFAULT_EVENTS).then(loadEvents);
    safeFetch(`${API_URL}/api/communities`, DEFAULT_COMMUNITIES).then(loadCommunities);
    safeFetch(`${API_URL}/api/profile`, DEFAULT_USER).then(loadUserProfile);
    safeFetch(`${API_URL}/api/schedule`, DEFAULT_SCHEDULE).then(loadSchedule);
    safeFetch(`${API_URL}/api/tasks`, DEFAULT_TASKS).then(apiTasks => {
        if (apiTasks && apiTasks.length > 0) {
            tasksData = apiTasks;
            localStorage.setItem('cosmohub-tasks', JSON.stringify(tasksData));
        }
        loadTasks(tasksData);
    });
    safeFetch(`${API_URL}/api/online`, DEFAULT_ONLINE).then(d => loadOnlineCount(d.count));
    safeFetch(`${API_URL}/api/badges`, DEFAULT_BADGES).then(d => loadBadges(d.notifications, d.messages));


    console.log('%c🚀 CosmoHub Dashboard Enhanced', 'color: #a855f7; font-size: 16px; font-weight: bold;');
    console.log('%cFeatures: Starfield, Clock, Theme, Modals, Toasts, Charts, Search, localStorage', 'color: #22d3ee; font-size: 11px;');
});