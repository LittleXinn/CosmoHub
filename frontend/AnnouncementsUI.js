// ===== CosmoHub Announcements - Enhanced Edition =====
// Features: Animated starfield, toasts, collapsible sidebar, search highlighting,
// keyboard shortcuts, animated counters, micro-interactions

const API_URL = window.location.origin;

// ===== DEFAULT DATA =====
const DEFAULT_ANNOUNCEMENTS = [];
const DEFAULT_CATEGORIES = [
    { key: 'all', name: 'All Announcements', count: 0 },
    { key: 'academic', name: 'Academic', count: 0 },
    { key: 'events', name: 'Events', count: 0 },
    { key: 'general', name: 'General', count: 0 },
    { key: 'community', name: 'Community', count: 0 },
    { key: 'system', name: 'System', count: 0 }
];
const DEFAULT_HIGHLIGHTS = [];
const DEFAULT_ONLINE = { count: 0 };
const DEFAULT_BADGES = { notifications: 0, messages: 0 };

// ===== STATE =====
let announcementsData = [];
let categoriesData = [...DEFAULT_CATEGORIES];
let highlightsData = [...DEFAULT_HIGHLIGHTS];
let currentFilter = 'all';
let currentCategory = 'all';
let sidebarCollapsed = localStorage.getItem('cosmohub-sidebar') === 'true';
let notificationsEnabled = localStorage.getItem('cosmohub-notifications') === 'true';

// ===== SAFE FETCH HELPER =====
function safeFetch(url, defaultData) {
    return fetch(url)
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
        .catch(err => {
            console.warn(`[CosmoHub Announcements] Failed to load ${url}:`, err.message);
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
    const cards = document.querySelectorAll('.announcement-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = (!lowerQuery || text.includes(lowerQuery)) ? 'flex' : 'none';
    });

    // Remove old highlights
    document.querySelectorAll('.search-highlight').forEach(el => {
        const parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });

    if (!lowerQuery) return;

    // Highlight matches
    const walker = document.createTreeWalker(
        document.querySelector('.announcements-feed'),
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
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.focus();
        }
        if (e.key === 'Escape') {
            const modal = document.getElementById('modal-overlay');
            if (modal && modal.classList.contains('open')) {
                modal.classList.remove('open');
            }
            const searchInput = document.getElementById('search-input');
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


// ===== NOTIFICATION MODAL =====
function initNotificationModal() {
    const notifBtn = document.getElementById('notification-btn');
    const modalOverlay = document.getElementById('notif-modal-overlay');
    const modalClose = document.getElementById('notif-modal-close');
    const modalDone = document.getElementById('notif-modal-done');
    const toggleSwitch = document.getElementById('notif-modal-toggle');
    const statusText = document.getElementById('notif-modal-status');

    if (!notifBtn || !modalOverlay) return;

    function updateToggleState() {
        if (notificationsEnabled) {
            toggleSwitch.classList.add('on');
            statusText.textContent = 'On';
            statusText.classList.add('on');
            notifBtn.classList.add('active');
        } else {
            toggleSwitch.classList.remove('on');
            statusText.textContent = 'Off';
            statusText.classList.remove('on');
            notifBtn.classList.remove('active');
        }
    }

    // Restore saved state
    updateToggleState();

    function openModal() {
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        lucide.createIcons();
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    notifBtn.addEventListener('click', openModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalDone) modalDone.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
    }

    if (toggleSwitch) {
        toggleSwitch.addEventListener('click', () => {
            notificationsEnabled = !notificationsEnabled;
            localStorage.setItem('cosmohub-notifications', notificationsEnabled);
            updateToggleState();
            showToast(
                notificationsEnabled ? 'Notifications On' : 'Notifications Off',
                notificationsEnabled ? 'You will receive announcement alerts' : 'You will not receive alerts',
                notificationsEnabled ? 'success' : 'info',
                3000
            );
        });
    }
}

// ===== DOM ELEMENTS =====
let elements = {};

function initElements() {
    elements = {
        onlineCount: document.getElementById('online-count'),
        announcementsFeed: document.getElementById('announcements-feed'),
        categoryList: document.getElementById('category-list'),
        highlightsList: document.getElementById('highlights-list'),
        modalOverlay: document.getElementById('modal-overlay'),
        newAnnouncementBtn: document.getElementById('new-announcement-btn'),
        modalClose: document.getElementById('modal-close'),
        modalCancel: document.getElementById('modal-cancel'),
        modalPublish: document.getElementById('modal-publish'),
        searchInput: document.getElementById('search-input'),
        searchBar: document.getElementById('search-bar'),
        notifBadge: document.getElementById('notif-badge')
    };
}

// ===== CATEGORY CONFIG =====
const categoryIcons = {
    all: 'layout-grid', academic: 'graduation-cap', events: 'calendar-days',
    general: 'info', community: 'users', system: 'cpu'
};
const tagIcons = {
    academic: 'graduation-cap', events: 'calendar-days', general: 'info',
    community: 'users', system: 'cpu', important: 'alert-circle',
    featured: 'star', notice: 'bell', library: 'book-open'
};
const imageIcons = {
    galaxy: 'orbit', calendar: 'calendar', megaphone: 'megaphone',
    book: 'book-open', users: 'users', flask: 'flask-conical',
    cpu: 'cpu', briefcase: 'briefcase'
};
const imageColors = {
    galaxy: '#a855f7', calendar: '#22d3ee', megaphone: '#f472b6',
    book: '#3b82f6', users: '#6366f1', flask: '#22c55e',
    cpu: '#f97316', briefcase: '#eab308'
};
const imageBgColors = {
    galaxy: 'rgba(168,85,247,0.12)', calendar: 'rgba(34,211,238,0.12)',
    megaphone: 'rgba(244,114,182,0.12)', book: 'rgba(59,130,246,0.12)',
    users: 'rgba(99,102,241,0.12)', flask: 'rgba(34,197,94,0.12)',
    cpu: 'rgba(249,115,22,0.12)', briefcase: 'rgba(234,179,8,0.12)'
};
const imageBorderColors = {
    galaxy: 'rgba(168,85,247,0.2)', calendar: 'rgba(34,211,238,0.2)',
    megaphone: 'rgba(244,114,182,0.2)', book: 'rgba(59,130,246,0.2)',
    users: 'rgba(99,102,241,0.2)', flask: 'rgba(34,197,94,0.2)',
    cpu: 'rgba(249,115,22,0.2)', briefcase: 'rgba(234,179,8,0.2)'
};

// ===== RENDER FUNCTIONS (Enhanced with animations) =====

function renderAnnouncements() {
    if (!elements.announcementsFeed) return;
    elements.announcementsFeed.innerHTML = '';

    const data = announcementsData || [];
    let filtered = currentFilter === 'all' ? data : data.filter(a => a.category === currentFilter);

    filtered.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.id || 0) - (a.id || 0);
    });

    if (filtered.length === 0) {
        elements.announcementsFeed.innerHTML = `
            <div class="empty-state">
                <i data-lucide="megaphone"></i>
                <p>No announcements in this category</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    filtered.forEach((ann, i) => {
        const card = document.createElement('div');
        card.className = 'announcement-card' + (ann.pinned ? ' pinned' : '');
        card.style.animationDelay = `${i * 0.05}s`;
        const imgIcon = imageIcons[ann.image] || 'file-text';
        const imgBg = imageBgColors[ann.image] || 'rgba(100,100,180,0.12)';
        const imgBorder = imageBorderColors[ann.image] || 'rgba(100,100,180,0.2)';
        const imgColor = imageColors[ann.image] || '#a855f7';
        const tags = ann.tags || [];
        const tagsHtml = tags.map(tag => {
            const icon = tagIcons[tag] || 'tag';
            return `<span class="tag ${tag}"><i data-lucide="${icon}"></i>${tag.charAt(0).toUpperCase() + tag.slice(1)}</span>`;
        }).join('');
        const pinnedBadge = ann.pinned ? `<div class="announcement-pinned-badge"><i data-lucide="pin"></i>Pinned</div>` : '';

        card.innerHTML = `
            <div class="announcement-image-placeholder" style="background:${imgBg};border-color:${imgBorder};">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${imgColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${getIconPath(imgIcon)}</svg>
            </div>
            <div class="announcement-content">
                ${pinnedBadge}
                <div class="announcement-title">${ann.title || 'Untitled'}</div>
                <div class="announcement-desc">${ann.description || ''}</div>
                <div class="announcement-tags">${tagsHtml}</div>
            </div>
            <div class="announcement-meta">
                <div class="announcement-date">
                    <span class="date-text">${ann.date || ''}</span>
                    <span class="time-text">${ann.time || ''}</span>
                </div>
                <div class="announcement-author">
                    <div class="author-info">
                        <span class="author-name">${ann.author_name || 'Unknown'}</span>
                        <span class="author-role">${ann.author_role || ''}</span>
                    </div>
                    <div class="author-avatar-placeholder"><i data-lucide="user"></i></div>
                </div>
                <div class="announcement-actions">
                    <button class="action-dot-btn"><i data-lucide="more-vertical"></i></button>
                </div>
            </div>`;
        elements.announcementsFeed.appendChild(card);
    });
    lucide.createIcons();
}

function getIconPath(name) {
    const paths = {
        'orbit': '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)"/>',
        'calendar': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
        'megaphone': '<path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
        'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
        'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'flask-conical': '<path d="M10 2v7.31"/><path d="M14 2v7.31"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 0 1 2.5 5.2c0 2.5-2 4.5-4.5 4.5S7.5 17 7.5 14.5a6.5 6.5 0 0 1 2.5-5.2"/>',
        'cpu': '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
        'briefcase': '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
        'file-text': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>'
    };
    return paths[name] || paths['file-text'];
}

function renderCategories() {
    if (!elements.categoryList) return;
    elements.categoryList.innerHTML = '';

    const data = categoriesData || [];
    if (data.length === 0) {
        elements.categoryList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="layout-grid"></i>
                <p>No categories</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    data.forEach(cat => {
        const icon = categoryIcons[cat.key] || 'layout-grid';
        const count = cat.count !== undefined ? cat.count : 0;
        const row = document.createElement('div');
        row.className = 'category-row' + (cat.key === currentCategory ? ' active' : '');
        row.dataset.category = cat.key;
        row.innerHTML = `
            <div class="category-icon-wrap ${cat.key}"><i data-lucide="${icon}"></i></div>
            <span class="category-name">${cat.name || 'Unknown'}</span>
            <span class="category-count">${count}</span>`;
        row.addEventListener('click', () => setActiveCategory(cat.key));
        elements.categoryList.appendChild(row);
    });
    lucide.createIcons();
}

function renderHighlights() {
    if (!elements.highlightsList) return;
    elements.highlightsList.innerHTML = '';

    const data = highlightsData || [];
    if (data.length === 0) {
        elements.highlightsList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="star"></i>
                <p>No highlights</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    data.forEach((hl, i) => {
        const item = document.createElement('div');
        item.className = 'highlight-item';
        item.style.animationDelay = `${i * 0.03}s`;
        item.innerHTML = `
            <div class="highlight-icon-wrap ${hl.color || 'purple'}"><i data-lucide="${hl.icon || 'star'}"></i></div>
            <div class="highlight-info">
                <div class="highlight-title">${hl.title || 'Untitled'}</div>
                <div class="highlight-date">${hl.date || ''}</div>
            </div>
            ${hl.pinned ? '<div class="highlight-pin"><i data-lucide="pin"></i></div>' : ''}`;
        elements.highlightsList.appendChild(item);
    });
    lucide.createIcons();
}

function updateCategoryCounts() {
    const counts = { all: 0, academic: 0, events: 0, general: 0, community: 0, system: 0 };
    (announcementsData || []).forEach(a => {
        counts.all++;
        if (a.category && counts[a.category] !== undefined) counts[a.category]++;
    });

    Object.keys(counts).forEach(key => {
        const el = document.getElementById(`count-${key}`);
        if (el) el.textContent = counts[key];
    });

    categoriesData = categoriesData.map(cat => ({
        ...cat,
        count: counts[cat.key] !== undefined ? counts[cat.key] : 0
    }));
    renderCategories();
}

function setActiveCategory(category) {
    currentCategory = category;
    currentFilter = category;

    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === category);
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.toggle('active', item.dataset.category === category);
    });

    const activeItem = document.querySelector('.dropdown-item.active');
    if (activeItem && elements.currentCategoryLabel) {
        const span = activeItem.querySelector('span');
        if (span) elements.currentCategoryLabel.textContent = span.textContent;
    }

    document.querySelectorAll('.category-row').forEach(row => {
        row.classList.toggle('active', row.dataset.category === category);
    });

    renderAnnouncements();
}

function loadOnlineCount(count) {
    if (elements.onlineCount) {
        elements.onlineCount.textContent = count !== undefined && count !== null ? count.toLocaleString() : '0';
    }
}

// ===== DATA LOADING =====

function loadAnnouncements() {
    safeFetch(`${API_URL}/api/announcements`, DEFAULT_ANNOUNCEMENTS)
        .then(data => {
            if (data) {
                announcementsData = data;
                renderAnnouncements();
                updateCategoryCounts();
            }
        });
}

function loadCategories() {
    safeFetch(`${API_URL}/api/announcement-categories`, DEFAULT_CATEGORIES)
        .then(data => {
            if (data && data.length > 0) {
                categoriesData = data;
                renderCategories();
            }
        });
}

function loadHighlights() {
    safeFetch(`${API_URL}/api/announcement-highlights`, DEFAULT_HIGHLIGHTS)
        .then(data => {
            if (data) {
                highlightsData = data;
                renderHighlights();
            }
        });
}

function loadOnline() {
    safeFetch(`${API_URL}/api/online`, DEFAULT_ONLINE)
        .then(d => loadOnlineCount(d.count));
}

// ===== MODAL FUNCTIONS =====

function openModal() {
    if (elements.modalOverlay) {
        elements.modalOverlay.classList.add('open');
        lucide.createIcons();
    }
}

function closeModal() {
    if (elements.modalOverlay) elements.modalOverlay.classList.remove('open');
}

function publishAnnouncement() {
    const titleInput = document.getElementById('ann-title');
    const descInput = document.getElementById('ann-desc');
    const pinnedInput = document.getElementById('ann-pinned');
    const activePill = document.querySelector('.pill.active');

    const title = titleInput ? titleInput.value.trim() : '';
    const description = descInput ? descInput.value.trim() : '';
    const pinned = pinnedInput ? pinnedInput.checked : false;
    const category = activePill ? activePill.dataset.pill : 'general';

    if (!title || !description) {
        showToast('Error', 'Please fill in both title and description.', 'error', 3000);
        return;
    }

    const newAnnouncement = {
        id: Date.now(),
        title: title,
        description: description,
        category: category,
        pinned: pinned,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        author_name: 'You',
        author_role: 'Explorer',
        image: 'megaphone',
        tags: [category]
    };

    announcementsData.unshift(newAnnouncement);
    renderAnnouncements();
    updateCategoryCounts();
    closeModal();

    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (pinnedInput) pinnedInput.checked = false;

    showToast('Published', 'Your announcement has been published!', 'success', 3000);

    safeFetch(`${API_URL}/api/announcements`, { success: true });
}

// ===== EVENT LISTENERS =====

function initEventListeners() {
    // Navigation using data-page attributes
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetPage = this.dataset.page;
            if (targetPage) {
                const currentPage = window.location.pathname.split('/').pop();
                if (currentPage !== targetPage) window.location.href = targetPage;
            }
        });
    });

    // Search
    if (elements.searchInput && elements.searchBar) {
        elements.searchInput.addEventListener('focus', () => elements.searchBar.style.borderColor = 'rgba(100, 100, 180, 0.4)');
        elements.searchInput.addEventListener('blur', () => elements.searchBar.style.borderColor = 'rgba(80, 80, 140, 0.18)');
    }

    // Button effects
    document.querySelectorAll('.icon-btn, .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => this.style.transform = '', 150);
        });
    });

    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => setActiveCategory(tab.dataset.tab));
    });

    // Dropdown items (for modal category pills)
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            setActiveCategory(this.dataset.category);
        });
    });

    // Modal
    if (elements.newAnnouncementBtn) elements.newAnnouncementBtn.addEventListener('click', openModal);
    if (elements.modalClose) elements.modalClose.addEventListener('click', closeModal);
    if (elements.modalCancel) elements.modalCancel.addEventListener('click', closeModal);
    if (elements.modalOverlay) {
        elements.modalOverlay.addEventListener('click', e => { if (e.target === elements.modalOverlay) closeModal(); });
    }
    if (elements.modalPublish) elements.modalPublish.addEventListener('click', publishAnnouncement);

    // Pills
    document.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', function() {
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
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
    initSearch();
    initKeyboardShortcuts();
    initNotificationModal();

    // Render defaults immediately
    renderAnnouncements();
    renderCategories();
    renderHighlights();
    loadOnlineCount(0);

    // Load from API
    loadAnnouncements();
    loadCategories();
    loadHighlights();
    loadOnline();

    console.log('%c🚀 CosmoHub Announcements Enhanced', 'color: #a855f7; font-size: 16px; font-weight: bold;');
    console.log('%cFeatures: Starfield, Toasts, Search, Collapsible Sidebar, Keyboard Shortcuts', 'color: #22d3ee; font-size: 11px;');
});