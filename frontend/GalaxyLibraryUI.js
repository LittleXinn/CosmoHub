// ===== CosmoHub Galaxy Library - Database Ready =====
// This file is structured for easy backend integration.
// Replace the MOCK sections with real API calls when your backend is ready.

// ===== BACKEND-READY BADGE SYSTEM =====
const BADGE_API_URL = window.location.origin;

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

function loadBadges() {
    safeFetch(`${BADGE_API_URL}/api/badges`, { notifications: 0, messages: 0 })
        .then(d => {
            const notifEl = document.getElementById('notif-badge');
            const msgEl = document.getElementById('msg-badge');
            if (notifEl) {
                const notifCount = d.notifications !== undefined && d.notifications !== null ? d.notifications : 0;
                notifEl.textContent = notifCount;
                notifEl.style.display = 'flex';
            }
            if (msgEl) {
                const msgCount = d.messages !== undefined && d.messages !== null ? d.messages : 0;
                msgEl.textContent = msgCount;
                msgEl.style.display = 'flex';
            }
        });
}

function loadNotifications() {
    safeFetch(`${BADGE_API_URL}/api/notifications`, [])
        .then(data => {
            const notifEl = document.getElementById('notif-badge');
            if (notifEl && data) {
                const unreadCount = data.filter(n => !n.read).length;
                notifEl.textContent = unreadCount;
                notifEl.style.display = 'flex';
            }
        });
}

// ===== POLLING =====
let badgePollInterval;

function startBadgePolling() {
    badgePollInterval = setInterval(() => {
        safeFetch(`${BADGE_API_URL}/api/badges`, { notifications: 0, messages: 0 })
            .then(d => {
                const notifEl = document.getElementById('notif-badge');
                const msgEl = document.getElementById('msg-badge');
                if (notifEl) {
                    const notifCount = d.notifications !== undefined && d.notifications !== null ? d.notifications : 0;
                    notifEl.textContent = notifCount;
                    notifEl.style.display = 'flex';
                }
                if (msgEl) {
                    const msgCount = d.messages !== undefined && d.messages !== null ? d.messages : 0;
                    msgEl.textContent = msgCount;
                    msgEl.style.display = 'flex';
                }
            });
    }, 5000);
}

function stopBadgePolling() {
    if (badgePollInterval) clearInterval(badgePollInterval);
}

const API_URL = window.location.origin + '/api';

// ===== AUTH & ROLE CONFIG =====
// TODO: Replace with JWT token from login system
// const AUTH_TOKEN = localStorage.getItem('auth_token');
const AUTH_TOKEN = 'mock_jwt_token_12345';

// TODO: Replace with real user data from /api/me endpoint
// const currentUser = await fetchUserProfile();
const currentUser = {
    id: 'user_001',
    name: 'Alex Mercer',
    email: 'alex@cosmohub.edu',
    role: 'user',        // 'admin' | 'mod' | 'user'
    avatar: null,
    createdAt: '2025-01-15'
};

// ===== PERMISSION SYSTEM =====
const PERMISSIONS = {
    admin: {
        canUpload: true,
        canEditOwn: true,
        canDeleteOwn: true,
        canEditOthers: true,
        canDeleteOthers: true,
        canModerate: true,
        label: 'Admin',
        color: 'admin',
        badgeIcon: 'shield-alert'
    },
    mod: {
        canUpload: true,
        canEditOwn: true,
        canDeleteOwn: true,
        canEditOthers: true,
        canDeleteOthers: true,
        canModerate: true,
        label: 'Moderator',
        color: 'mod',
        badgeIcon: 'shield-check'
    },
    user: {
        canUpload: true,
        canEditOwn: true,
        canDeleteOwn: true,
        canEditOthers: false,
        canDeleteOthers: false,
        canModerate: false,
        label: 'User',
        color: 'user',
        badgeIcon: 'user'
    }
};

const userPerms = PERMISSIONS[currentUser.role] || PERMISSIONS.user;

// ===== API SERVICE (Replace mock functions with real fetch calls) =====
const apiService = {
    // --- AUTH ---
    async getCurrentUser() {
        // TODO: Replace with real API
        // const res = await fetch(`${API_URL}/auth/me`, {
        //     headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        // });
        // return res.json();
        return MOCK_getCurrentUser();
    },

    // --- RESOURCES ---
    async getResources(filters = {}) {
        // TODO: Replace with real API
        // const query = new URLSearchParams(filters).toString();
        // const res = await fetch(`${API_URL}/resources?${query}`, {
        //     headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        // });
        // return res.json();
        return MOCK_getResources(filters);
    },

    async getResourceById(id) {
        // TODO: Replace with real API
        // const res = await fetch(`${API_URL}/resources/${id}`, {
        //     headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        // });
        // return res.json();
        return MOCK_getResourceById(id);
    },

    async createResource(formData) {
        // TODO: Replace with real API
        // const res = await fetch(`${API_URL}/resources`, {
        //     method: 'POST',
        //     headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
        //     body: formData  // FormData for file uploads
        // });
        // return res.json();
        return MOCK_createResource(formData);
    },

    async updateResource(id, data) {
        // TODO: Replace with real API
        // const res = await fetch(`${API_URL}/resources/${id}`, {
        //     method: 'PUT',
        //     headers: {
        //         'Authorization': `Bearer ${AUTH_TOKEN}`,
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(data)
        // });
        // return res.json();
        return MOCK_updateResource(id, data);
    },

    async deleteResource(id) {
        // TODO: Replace with real API
        // const res = await fetch(`${API_URL}/resources/${id}`, {
        //     method: 'DELETE',
        //     headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        // });
        // return res.json();
        return MOCK_deleteResource(id);
    },

    // --- STATS ---
    async getLibraryStats() {
        // TODO: Replace with real API
        // const res = await fetch(`${API_URL}/library/stats`, {
        //     headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        // });
        // return res.json();
        return MOCK_getLibraryStats();
    },

    // --- CATEGORIES ---
    async getCategories() {
        // TODO: Replace with real API
        // const res = await fetch(`${API_URL}/categories`, {
        //     headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        // });
        // return res.json();
        return MOCK_getCategories();
    },

    // --- CONTRIBUTORS ---
    async getTopContributors(limit = 5) {
        // TODO: Replace with real API
        // const res = await fetch(`${API_URL}/contributors?limit=${limit}`, {
        //     headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        // });
        // return res.json();
        return MOCK_getTopContributors(limit);
    },

    // --- ONLINE COUNT ---
    async getOnlineCount() {
        // TODO: Replace with real API
        // const res = await fetch(`${API_URL}/users/online`, {
        //     headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        // });
        // return res.json();
        return MOCK_getOnlineCount();
    }
};

// ===== MOCK DATA (Remove when backend is ready) =====
let mockResources = []; // Empty by default - will be populated from backend

let mockCategories = [
    { id: 'all', name: 'All Resources', icon: 'layout-grid', count: 0, color: 'all' },
    { id: 'cs', name: 'Computer Science', icon: 'code-2', count: 0, color: 'cs' },
    { id: 'math', name: 'Mathematics', icon: 'sigma', count: 0, color: 'math' },
    { id: 'physics', name: 'Physics', icon: 'atom', count: 0, color: 'physics' },
    { id: 'engineering', name: 'Engineering', icon: 'wrench', count: 0, color: 'engineering' },
    { id: 'business', name: 'Business', icon: 'briefcase', count: 0, color: 'business' },
    { id: 'general', name: 'General Studies', icon: 'graduation-cap', count: 0, color: 'general' }
];

let mockContributors = []; // Will be populated from backend database

function MOCK_getCurrentUser() {
    return Promise.resolve(currentUser);
}

function MOCK_getResources(filters) {
    let results = [...mockResources];
    if (filters.category && filters.category !== 'all') {
        results = results.filter(r => r.category.toLowerCase().replace(/\s/g, '') === filters.category);
    }
    if (filters.type && filters.type !== 'all') {
        results = results.filter(r => r.type === filters.type);
    }
    if (filters.search) {
        const q = filters.search.toLowerCase();
        results = results.filter(r => r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q));
    }
    return Promise.resolve({
        data: results,
        total: results.length,
        page: 1,
        perPage: 20,
        totalPages: 1
    });
}

function MOCK_getResourceById(id) {
    const resource = mockResources.find(r => r.id === id);
    return Promise.resolve(resource || null);
}

function MOCK_createResource(formData) {
    const newResource = {
        id: 'res_' + Date.now(),
        title: formData.get('title'),
        author: currentUser.name,
        authorId: currentUser.id,
        type: formData.get('type') || 'pdf',
        category: formData.get('category'),
        downloads: 0,
        rating: 0,
        date: new Date().toISOString().split('T')[0],
        fileSize: formData.get('file')?.size ? (formData.get('file').size / 1024 / 1024).toFixed(1) + ' MB' : null,
        description: formData.get('description') || ''
    };
    mockResources.unshift(newResource);
    return Promise.resolve({ success: true, data: newResource });
}

function MOCK_updateResource(id, data) {
    const idx = mockResources.findIndex(r => r.id === id);
    if (idx !== -1) {
        mockResources[idx] = { ...mockResources[idx], ...data };
        return Promise.resolve({ success: true, data: mockResources[idx] });
    }
    return Promise.reject(new Error('Resource not found'));
}

function MOCK_deleteResource(id) {
    const idx = mockResources.findIndex(r => r.id === id);
    if (idx !== -1) {
        mockResources.splice(idx, 1);
        return Promise.resolve({ success: true });
    }
    return Promise.reject(new Error('Resource not found'));
}

function MOCK_getLibraryStats() {
    return Promise.resolve({
        totalResources: 0,
        totalDownloads: 0,
        totalContributors: 0,
        averageRating: '0'
    });
}

function MOCK_getCategories() {
    return Promise.resolve(mockCategories);
}

function MOCK_getTopContributors(limit) {
    return Promise.resolve(mockContributors.slice(0, limit));
}

function MOCK_getOnlineCount() {
    return Promise.resolve({ count: 0 });
}

// ===== STATE MANAGEMENT =====
let currentFilters = { category: 'all', type: 'all', search: '' };
let currentPage = 1;
let resourcesCache = [];
let allResources = []; // All sorted resources
const ITEMS_PER_PAGE = 6;

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', async function() {
    lucide.createIcons();

    // Initialize UI
    await initializeApp();

    // Load badges from backend
    loadBadges();
    loadNotifications();

    // Start badge polling
    startBadgePolling();

    // Setup event listeners
    setupNavigation();
    setupSearch();
    setupFilters();
    setupViewToggle();
    setupCategories();
    setupUploadModal();
    setupDeleteModal();
    setupResourceActions();
    setupButtonEffects();
    setupViewMore();
    setupPagination();

    console.log('%c🚀 CosmoHub Galaxy Library - DB Ready', 'color: #a855f7; font-size: 16px; font-weight: bold;');
    console.log('%cRole: ' + currentUser.role.toUpperCase() + ' | User: ' + currentUser.name, 'color: #22d3ee; font-size: 12px;');
});

// ===== INITIALIZATION =====
async function initializeApp() {
    try {
        // Load user profile
        setupRoleBadge();

        // Load stats
        await loadStats();

        // Load resources
        await loadResources();

        // Load categories
        await loadCategories();

        // Load contributors
        await loadContributors();

        // Load online count
        await loadOnlineCount();

    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Failed to load library data', 'error');
    }
}

// ===== ROLE BADGE =====
function setupRoleBadge() {
    const roleBadge = document.getElementById('role-badge');
    const roleText = document.getElementById('role-text');
    if (roleBadge && roleText) {
        roleBadge.className = 'role-badge ' + userPerms.color;
        roleText.textContent = userPerms.label;
    }
}

// ===== LOAD STATS =====
async function loadStats() {
    try {
        const stats = await apiService.getLibraryStats();

        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers[0]) statNumbers[0].textContent = (stats.totalResources || 0).toLocaleString();
        if (statNumbers[1]) statNumbers[1].textContent = (stats.totalDownloads || 0).toLocaleString();
        if (statNumbers[2]) statNumbers[2].textContent = (stats.totalContributors || 0).toLocaleString();
        if (statNumbers[3]) statNumbers[3].textContent = stats.averageRating || '0';
    } catch (error) {
        console.error('Failed to load stats:', error);
        // Default to 0 on error
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(el => el.textContent = '0');
    }
}

// ===== LOAD RESOURCES =====
async function loadResources() {
    try {
        const response = await apiService.getResources(currentFilters);
        // Sort all by downloads descending
        allResources = response.data
            .sort((a, b) => (b.downloads || 0) - (a.downloads || 0));

        // Paginate
        const totalPages = Math.ceil(allResources.length / ITEMS_PER_PAGE) || 1;
        currentPage = Math.min(currentPage, totalPages);

        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        resourcesCache = allResources.slice(start, end);

        renderResources(resourcesCache);
        renderPagination(allResources.length);
    } catch (error) {
        console.error('Failed to load resources:', error);
        showToast('Failed to load resources', 'error');
    }
}

// ===== RENDER RESOURCES =====
function renderResources(resources) {
    const grid = document.getElementById('resources-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (resources.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; padding: 40px;">
                <i data-lucide="book-x"></i>
                <p>No resources found</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    resources.forEach(resource => {
        const isOwn = resource.authorId === currentUser.id;
        const canEdit = isOwn ? userPerms.canEditOwn : userPerms.canEditOthers;
        const canDelete = isOwn ? userPerms.canDeleteOwn : userPerms.canDeleteOthers;
        const permissionTag = isOwn ? 'Yours' : 'Read Only';
        const permissionClass = isOwn ? 'mine' : 'restricted';

        const card = document.createElement('div');
        card.className = 'resource-card';
        card.dataset.resourceId = resource.id;
        card.dataset.ownerId = resource.authorId;

        card.innerHTML = `
            <div class="resource-card-header">
                <div class="resource-icon-wrap ${resource.type}"><i data-lucide="${getResourceIcon(resource.type)}"></i></div>
                <span class="resource-type">${resource.type.toUpperCase()}</span>
                <div class="resource-actions">
                    <button class="resource-menu action-download" title="Download" data-id="${resource.id}"><i data-lucide="download"></i></button>
                    <button class="resource-menu action-edit ${canEdit ? '' : 'hidden'}" title="Edit" data-id="${resource.id}"><i data-lucide="pencil"></i></button>
                    <button class="resource-menu action-delete ${canDelete ? '' : 'hidden'}" title="Delete" data-id="${resource.id}"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
            <h3 class="resource-title">${escapeHtml(resource.title)}</h3>
            <p class="resource-author">By ${escapeHtml(resource.author)}</p>
            <div class="resource-meta">
                <span class="resource-stat"><i data-lucide="download"></i> ${resource.downloads.toLocaleString()}</span>
                <span class="resource-stat"><i data-lucide="star"></i> ${resource.rating}</span>
                <span class="resource-date">${formatDate(resource.date)}</span>
            </div>
            <span class="resource-permission-tag ${permissionClass}">${permissionTag}</span>
        `;

        // Hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        });

        grid.appendChild(card);
    });

    lucide.createIcons();
    setupResourceActionButtons();
}

function getResourceIcon(type) {
    const icons = {
        pdf: 'file-text',
        docx: 'file-text',
        pptx: 'presentation',
        ebook: 'book-open',
        video: 'play-circle',
        link: 'link'
    };
    return icons[type] || 'file';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ===== LOAD CATEGORIES =====
async function loadCategories() {
    try {
        const categories = await apiService.getCategories();
        renderCategories(categories);
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

function renderCategories(categories) {
    const list = document.querySelector('.categories-list');
    if (!list) return;

    list.innerHTML = '';
    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'category-item ' + (cat.id === 'all' ? 'active' : '');
        item.dataset.categoryId = cat.id;
        item.innerHTML = `
            <div class="category-icon ${cat.color}"><i data-lucide="${cat.icon}"></i></div>
            <span class="category-name">${escapeHtml(cat.name)}</span>
            <span class="category-count">${(cat.count || 0).toLocaleString()}</span>
        `;
        item.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(c => c.classList.remove('active'));
            item.classList.add('active');
            currentFilters.category = cat.id;
            loadResources();
        });
        list.appendChild(item);
    });
    lucide.createIcons();
}

// ===== LOAD CONTRIBUTORS =====
async function loadContributors() {
    try {
        const contributors = await apiService.getTopContributors(3);
        renderContributors(contributors);
    } catch (error) {
        console.error('Failed to load contributors:', error);
    }
}

function renderContributors(contributors) {
    const list = document.getElementById('contributors-list');
    if (!list) return;

    list.innerHTML = '';

    if (!contributors || contributors.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="padding: 20px;">
                <i data-lucide="users" style="width: 20px; height: 20px;"></i>
                <p style="font-size: 10px;">No contributors yet</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    list.innerHTML = '';

    if (!contributors || contributors.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="padding: 20px;">
                <i data-lucide="users"></i>
                <p>No contributors yet</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const gradients = [
        'linear-gradient(135deg, #6366f1, #a855f7)',
        'linear-gradient(135deg, #22d3ee, #3b82f6)',
        'linear-gradient(135deg, #f97316, #ef4444)',
        'linear-gradient(135deg, #22c55e, #14b8a6)',
        'linear-gradient(135deg, #ec4899, #f472b6)'
    ];

    contributors.forEach((contrib, i) => {
        const item = document.createElement('div');
        item.className = 'contributor-item';
        item.innerHTML = `
            <div class="contributor-avatar">
                <div class="avatar-placeholder" style="background: ${gradients[i % gradients.length]};">${contrib.name[0]}</div>
            </div>
            <div class="contributor-info">
                <span class="contributor-name">${escapeHtml(contrib.name)} ${contrib.isTop ? '<span class="crown">👑</span>' : ''}</span>
                <span class="contributor-count">${contrib.resources} resources</span>
            </div>
        `;
        list.appendChild(item);
    });
}

// ===== LOAD ONLINE COUNT =====
async function loadOnlineCount() {
    try {
        const data = await apiService.getOnlineCount();
        const el = document.getElementById('online-count');
        if (el) el.textContent = (data.count || 0).toLocaleString();
    } catch (error) {
        console.error('Failed to load online count:', error);
        const el = document.getElementById('online-count');
        if (el) el.textContent = '0';
    }
}

// ===== RESOURCE ACTION BUTTONS =====
function setupResourceActionButtons() {
    document.querySelectorAll('.action-download').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const resource = resourcesCache.find(r => r.id === id);
            if (resource) {
                // TODO: Real download via API
                // window.open(`${API_URL}/resources/${id}/download`, '_blank');
                showToast(`Downloading: ${resource.title}`, 'info');
            }
        });
    });

    document.querySelectorAll('.action-edit').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const resource = resourcesCache.find(r => r.id === id);
            if (resource) {
                showToast(`Edit mode: ${resource.title}`, 'info');
                // TODO: Open edit modal with resource data
            }
        });
    });

    document.querySelectorAll('.action-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const resource = resourcesCache.find(r => r.id === id);
            if (resource) {
                openDeleteModal(resource.title, id);
            }
        });
    });
}

// ===== NAVIGATION =====
function setupNavigation() {
    const pageRoutes = {
        'Home': 'DashboardUI.html',
        'Chats': 'ChatUI.html',
        'Announcements': 'AnnouncementsUI.html',
        'Galaxy Library': 'GalaxyLibraryUI.html',
        'Cosmic Calendar': 'CosmicCalendarUI.html',
        'Communities': 'CommunitiesUI.html',
        'Profile': 'ProfileUI.html',
        'Settings': 'SettingsUI.html'
    };

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const pageName = this.querySelector('.nav-text').textContent.trim();
            const targetPage = pageRoutes[pageName];
            if (targetPage) {
                const currentPage = window.location.pathname.split('/').pop();
                if (currentPage !== targetPage) {
                    window.location.href = targetPage;
                }
            }
        });
    });
}

// ===== SEARCH =====
function setupSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchBar = document.querySelector('.search-bar');

    if (!searchInput) return;

    searchInput.addEventListener('focus', () => {
        searchBar.style.borderColor = 'rgba(100, 100, 180, 0.4)';
    });
    searchInput.addEventListener('blur', () => {
        searchBar.style.borderColor = 'rgba(80, 80, 140, 0.18)';
    });

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentFilters.search = e.target.value;
            loadResources();
        }, 300);
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

// ===== FILTERS =====
function setupFilters() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const type = this.textContent.toLowerCase().replace(/\s/g, '_');
            currentFilters.type = type === 'all_resources' ? 'all' : type;
            loadResources();
        });
    });
}

// ===== VIEW TOGGLE =====
function setupViewToggle() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ===== PAGINATION =====
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const paginationEl = document.getElementById('pagination') || document.querySelector('.pagination');
    if (!paginationEl) return;

    // Clear existing
    paginationEl.innerHTML = '';

    // Only show pagination if there are items AND more than 1 page
    if (totalItems === 0 || totalPages <= 1) {
        paginationEl.style.display = 'none';
        return;
    }
    paginationEl.style.display = 'flex';

    // Prev button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn prev';
    prevBtn.innerHTML = '<i data-lucide="chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.style.opacity = currentPage === 1 ? '0.4' : '1';
    prevBtn.style.cursor = currentPage === 1 ? 'not-allowed' : 'pointer';
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadResources();
        }
    });
    paginationEl.appendChild(prevBtn);

    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'page-btn';
        firstBtn.textContent = '1';
        firstBtn.addEventListener('click', () => { currentPage = 1; loadResources(); });
        paginationEl.appendChild(firstBtn);
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            paginationEl.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
        btn.textContent = i;
        btn.addEventListener('click', () => { currentPage = i; loadResources(); });
        paginationEl.appendChild(btn);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            paginationEl.appendChild(ellipsis);
        }
        const lastBtn = document.createElement('button');
        lastBtn.className = 'page-btn';
        lastBtn.textContent = totalPages;
        lastBtn.addEventListener('click', () => { currentPage = totalPages; loadResources(); });
        paginationEl.appendChild(lastBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn next';
    nextBtn.innerHTML = '<i data-lucide="chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.style.opacity = currentPage === totalPages ? '0.4' : '1';
    nextBtn.style.cursor = currentPage === totalPages ? 'not-allowed' : 'pointer';
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadResources();
        }
    });
    paginationEl.appendChild(nextBtn);

    lucide.createIcons();
}

function setupPagination() {
    // Pagination is rendered dynamically by renderPagination()
}



// ===== CATEGORIES =====
function setupCategories() {
    // Handled in renderCategories
}

function setupViewMore() {
    const viewMoreBtn = document.getElementById('view-more-btn');
    if (viewMoreBtn) {
        viewMoreBtn.addEventListener('click', () => {
            contributorsExpanded = !contributorsExpanded;
            renderContributors(mockContributors);
        });
    }
}

// ===== UPLOAD MODAL =====
function setupUploadModal() {
    const modal = document.getElementById('upload-modal');
    const uploadBtn = document.getElementById('upload-btn');
    const heroUploadBtn = document.getElementById('hero-upload-btn');
    const uploadBannerBtn = document.getElementById('upload-btn-banner');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-upload');
    const dropzone = document.getElementById('upload-dropzone');
    const fileInput = document.getElementById('file-input');

    if (!userPerms.canUpload) {
        if (uploadBtn) uploadBtn.style.display = 'none';
        return;
    }

    uploadBtn?.addEventListener('click', openUploadModal);
    heroUploadBtn?.addEventListener('click', openUploadModal);
    uploadBannerBtn?.addEventListener('click', openUploadModal);
    closeBtn?.addEventListener('click', closeUploadModal);
    cancelBtn?.addEventListener('click', closeUploadModal);

    confirmBtn?.addEventListener('click', async () => {
        const formData = new FormData();
        const titleInput = modal.querySelector('input[type="text"]');
        const categorySelect = modal.querySelector('select');
        const descTextarea = modal.querySelector('textarea');

        if (!titleInput.value.trim()) {
            showToast('Please enter a title', 'error');
            return;
        }

        formData.append('title', titleInput.value);
        formData.append('category', categorySelect.value);
        formData.append('description', descTextarea.value);
        if (fileInput.files[0]) {
            formData.append('file', fileInput.files[0]);
        }

        try {
            // TODO: Real API call
            // const result = await apiService.createResource(formData);
            const result = await MOCK_createResource(formData);

            if (result.success) {
                showToast('Resource uploaded successfully!', 'success');
                closeUploadModal();
                await loadResources();
                await loadStats();
            }
        } catch (error) {
            showToast('Upload failed: ' + error.message, 'error');
        }
    });

    dropzone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        showToast('Files ready to upload', 'info');
    });
    fileInput?.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            showToast(`${fileInput.files.length} file(s) selected`, 'info');
        }
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeUploadModal();
    });
}

function openUploadModal() {
    const modal = document.getElementById('upload-modal');
    if (modal) {
        modal.classList.add('active');
        lucide.createIcons();
    }
}

function closeUploadModal() {
    const modal = document.getElementById('upload-modal');
    if (modal) {
        modal.classList.remove('active');
        // Reset form
        const inputs = modal.querySelectorAll('input, textarea');
        inputs.forEach(input => input.value = '');
    }
}

// ===== DELETE MODAL =====
let resourceToDelete = null;

function setupDeleteModal() {
    const modal = document.getElementById('delete-modal');
    const closeBtn = document.getElementById('delete-modal-close');
    const cancelBtn = document.getElementById('delete-cancel');
    const confirmBtn = document.getElementById('delete-confirm');

    closeBtn?.addEventListener('click', closeDeleteModal);
    cancelBtn?.addEventListener('click', closeDeleteModal);

    confirmBtn?.addEventListener('click', async () => {
        if (!resourceToDelete) return;

        try {
            // TODO: Real API call
            // await apiService.deleteResource(resourceToDelete.id);
            await MOCK_deleteResource(resourceToDelete.id);

            showToast('Resource deleted successfully', 'success');
            closeDeleteModal();
            await loadResources();
            await loadStats();
        } catch (error) {
            showToast('Delete failed: ' + error.message, 'error');
        }
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeDeleteModal();
    });
}

function openDeleteModal(title, id) {
    const modal = document.getElementById('delete-modal');
    const nameEl = document.getElementById('delete-resource-name');
    if (modal && nameEl) {
        nameEl.textContent = title;
        resourceToDelete = { title, id };
        modal.classList.add('active');
        lucide.createIcons();
    }
}

function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) modal.classList.remove('active');
    resourceToDelete = null;
}

// Cleanup on page unload
window.addEventListener('beforeunload', stopBadgePolling);

// ===== BUTTON EFFECTS =====
function setupButtonEffects() {
    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.92)';
            setTimeout(() => this.style.transform = 'scale(1)', 150);
        });
    });
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;

    const icons = {
        success: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        error: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        info: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    toast.innerHTML = icons[type] + '<span>' + escapeHtml(message) + '</span>';
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== RESOURCE ACTIONS SETUP =====

// ===== VIEW ALL CONTRIBUTORS =====
function setupViewMore() {
    const viewAllBtn = document.getElementById('view-all-btn');
    const contributorsModal = document.getElementById('contributors-modal');
    const contributorsModalClose = document.getElementById('contributors-modal-close');
    const contributorsModalDone = document.getElementById('contributors-modal-done');

    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', async () => {
            try {
                const contributors = await apiService.getTopContributors(10);
                renderAllContributors(contributors);
                contributorsModal.classList.add('active');
                lucide.createIcons();
            } catch (error) {
                console.error('Failed to load all contributors:', error);
                showToast('Failed to load contributors', 'error');
            }
        });
    }

    if (contributorsModalClose) {
        contributorsModalClose.addEventListener('click', closeContributorsModal);
    }

    if (contributorsModalDone) {
        contributorsModalDone.addEventListener('click', closeContributorsModal);
    }

    if (contributorsModal) {
        contributorsModal.addEventListener('click', (e) => {
            if (e.target === contributorsModal) closeContributorsModal();
        });
    }
}

function closeContributorsModal() {
    const modal = document.getElementById('contributors-modal');
    if (modal) modal.classList.remove('active');
}

function renderAllContributors(contributors) {
    const list = document.getElementById('contributors-list-all');
    if (!list) return;

    list.innerHTML = '';

    if (!contributors || contributors.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; padding: 20px;">
                <i data-lucide="users" style="width: 20px; height: 20px;"></i>
                <p style="font-size: 10px;">No contributors yet</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const gradients = [
        'linear-gradient(135deg, #6366f1, #a855f7)',
        'linear-gradient(135deg, #22d3ee, #3b82f6)',
        'linear-gradient(135deg, #f97316, #ef4444)',
        'linear-gradient(135deg, #22c55e, #14b8a6)',
        'linear-gradient(135deg, #ec4899, #f472b6)',
        'linear-gradient(135deg, #8b5cf6, #6366f1)',
        'linear-gradient(135deg, #06b6d4, #22d3ee)',
        'linear-gradient(135deg, #f59e0b, #f97316)',
        'linear-gradient(135deg, #10b981, #22c55e)',
        'linear-gradient(135deg, #d946ef, #ec4899)'
    ];

    const rankClasses = ['gold', 'gold', 'silver', 'bronze', 'normal', 'normal', 'normal', 'normal', 'normal', 'normal'];

    contributors.forEach((contrib, i) => {
        const item = document.createElement('div');
        item.className = 'contributor-item';

        const rankClass = i < rankClasses.length ? rankClasses[i] : 'normal';

        item.innerHTML = `
            <div class="rank-badge ${rankClass}">${i + 1}</div>
            <div class="contributor-avatar">
                <div class="avatar-placeholder" style="background: ${gradients[i % gradients.length]};">${contrib.name[0]}</div>
            </div>
            <div class="contributor-info">
                <span class="contributor-name">${escapeHtml(contrib.name)} ${contrib.isTop ? '<span class="crown">👑</span>' : ''}</span>
                <span class="contributor-count">${contrib.resources} resources</span>
            </div>
        `;
        list.appendChild(item);
    });
}

function setupResourceActions() {
    // Handled dynamically in renderResources
}

// ===== ENHANCED FEATURES =====

// Starfield Animation
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

// Animated Counter
function animateCounter(el, target, duration = 1200) {
    if (!el) return;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);
        el.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// Resource Card Stagger Animation
function animateResourceCards() {
    const cards = document.querySelectorAll('.resource-card');
    cards.forEach((card, i) => {
        card.style.animationDelay = `${i * 0.05}s`;
    });
}

// Search Highlighting
function initSearchHighlight() {
    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => performSearch(e.target.value), 200);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            performSearch('');
            searchInput.blur();
        }
    });
}

function performSearch(query) {
    const lowerQuery = query.toLowerCase().trim();
    const cards = document.querySelectorAll('.resource-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = (!lowerQuery || text.includes(lowerQuery)) ? 'flex' : 'none';
    });

    document.querySelectorAll('.search-highlight').forEach(el => {
        const parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });

    if (!lowerQuery) return;

    const walker = document.createTreeWalker(
        document.querySelector('.resources-grid'),
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
    return string.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-bar input');
            if (searchInput) searchInput.focus();
        }
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            const btn = document.querySelector('.collapse-btn');
            if (btn) btn.click();
        }
    });
}

// Sidebar Collapse (if not already present)
function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const btn = document.querySelector('.collapse-btn');
    if (!sidebar || !btn) return;

    let sidebarCollapsed = localStorage.getItem('cosmohub-sidebar') === 'true';
    if (sidebarCollapsed) sidebar.classList.add('collapsed');

    btn.addEventListener('click', () => {
        sidebarCollapsed = !sidebarCollapsed;
        sidebar.classList.toggle('collapsed', sidebarCollapsed);
        localStorage.setItem('cosmohub-sidebar', sidebarCollapsed);
    });
}

// Collapsed sidebar styles (injected via JS if not in CSS)
if (!document.getElementById('sidebar-collapse-styles')) {
    const style = document.createElement('style');
    style.id = 'sidebar-collapse-styles';
    style.textContent = `
        .sidebar { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .sidebar.collapsed { width: 60px; min-width: 60px; }
        .sidebar.collapsed .logo-text,
        .sidebar.collapsed .nav-text,
        .sidebar.collapsed .sidebar-footer,
        .sidebar.collapsed .footer-text,
        .sidebar.collapsed .footer-text2,
        .sidebar.collapsed .online-count { opacity: 0; width: 0; overflow: hidden; display: none; }
        .sidebar.collapsed .sidebar-logo { justify-content: center; padding: 0 0 18px; }
        .sidebar.collapsed .nav-item { justify-content: center; padding: 10px; }
        .sidebar.collapsed .sidebar-bottom { justify-content: center; }
        .sidebar.collapsed .collapse-btn { transform: rotate(180deg); margin-left: 0; }
    `;
    document.head.appendChild(style);
}

// ===== ENHANCED INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Core enhancements
    initStarfield();
    initSidebar();
    initSearchHighlight();
    initKeyboardShortcuts();

    // Animate stats on load
    setTimeout(() => {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(el => {
            const target = parseInt(el.textContent.replace(/,/g, '')) || 0;
            if (target > 0) animateCounter(el, target);
        });
    }, 300);

    // Animate resource cards after render
    const observer = new MutationObserver(() => {
        animateResourceCards();
    });
    const grid = document.getElementById('resources-grid');
    if (grid) observer.observe(grid, { childList: true });

    console.log('%c🚀 CosmoHub Galaxy Library Enhanced', 'color: #a855f7; font-size: 16px; font-weight: bold;');
    console.log('%cFeatures: Starfield, Animated Counters, Search Highlight, Keyboard Shortcuts, Card Animations', 'color: #22d3ee; font-size: 11px;');
});