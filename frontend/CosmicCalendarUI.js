// ===== CosmoHub Cosmic Calendar - Enhanced =====
// Replace MOCK sections with real API calls when backend is ready.

const API_URL = window.location.origin + '/api';
const BADGE_API_URL = window.location.origin;

// ===== AUTH & ROLE CONFIG =====
const AUTH_TOKEN = 'mock_jwt_token_12345';

const currentUser = {
    id: 'user_001',
    name: 'Alex Mercer',
    email: 'alex@cosmohub.edu',
    role: 'user',
    avatar: null,
    createdAt: '2025-01-15'
};

// ===== CATEGORY CONFIG =====
const CATEGORIES = {
    todo:     { label: 'To Do / Task', color: '#a855f7', icon: 'check-square', class: 'cat-todo', bar: 'linear-gradient(180deg, #a855f7, #c084fc)' },
    event:    { label: 'Event',        color: '#3b82f6', icon: 'calendar',     class: 'cat-event', bar: 'linear-gradient(180deg, #3b82f6, #60a5fa)' },
    meeting:  { label: 'Meeting',      color: '#22d3ee', icon: 'users',        class: 'cat-meeting', bar: 'linear-gradient(180deg, #22d3ee, #67e8f9)' },
    deadline: { label: 'Deadline',     color: '#ef4444', icon: 'alert-circle', class: 'cat-deadline', bar: 'linear-gradient(180deg, #ef4444, #f87171)' },
    personal: { label: 'Personal',     color: '#f472b6', icon: 'heart',        class: 'cat-personal', bar: 'linear-gradient(180deg, #f472b6, #f9a8d4)' },
    study:    { label: 'Study',        color: '#6366f1', icon: 'book-open',    class: 'cat-study', bar: 'linear-gradient(180deg, #6366f1, #818cf8)' },
    reminder: { label: 'Reminder',     color: '#f97316', icon: 'bell',         class: 'cat-reminder', bar: 'linear-gradient(180deg, #f97316, #fb923c)' }
};

// ===== STATE =====
let currentDate = new Date();
let currentView = 'month';
let selectedDate = null;
let editingItemId = null;
let hiddenCategories = new Set();
let searchQuery = '';

// ===== MOCK DATA =====
let mockCalendarItems = generateMockItems();

function generateMockItems() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    const items = [
        { id: 'evt_1', title: 'Review Physics Notes', category: 'study', date: todayStr, time: '09:00', priority: 'high', description: 'Go through chapters 4-6 before quiz.', userId: currentUser.id },
        { id: 'evt_2', title: 'Team Sync', category: 'meeting', date: todayStr, time: '14:00', priority: 'medium', description: 'Weekly standup with the project team.', userId: currentUser.id },
        { id: 'evt_3', title: 'Gym Session', category: 'personal', date: todayStr, time: '18:30', priority: 'low', description: 'Leg day workout.', userId: currentUser.id },
    ];

    const offsets = [-2, -1, 1, 2, 3, 5, 7];
    const titles = [
        ['Submit Assignment', 'deadline'], ['Study Group', 'study'], ['Doctor Appt', 'personal'],
        ['Project Deadline', 'deadline'], ['Buy Groceries', 'todo'], ['Call Mom', 'reminder'],
        ['Hackathon', 'event'], ['Code Review', 'meeting'], ['Read Paper', 'study']
    ];

    offsets.forEach((offset, idx) => {
        const date = new Date(today);
        date.setDate(date.getDate() + offset);
        const dy = date.getFullYear();
        const dm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const [t, c] = titles[idx % titles.length];
        items.push({
            id: 'evt_' + (idx + 4),
            title: t,
            category: c,
            date: `${dy}-${dm}-${dd}`,
            time: ['08:00','10:30','13:00','16:00','19:00'][idx % 5],
            priority: ['low','medium','high'][idx % 3],
            description: 'Mock calendar item for preview.',
            userId: currentUser.id
        });
    });

    return items;
}

// ===== API SERVICE =====
const apiService = {
    async getCalendarItems(filters = {}) {
        return MOCK_getCalendarItems(filters);
    },

    async createItem(data) {
        return MOCK_createItem(data);
    },

    async updateItem(id, data) {
        return MOCK_updateItem(id, data);
    },

    async deleteItem(id) {
        return MOCK_deleteItem(id);
    },

    async getBadges() {
        return safeFetch(`${BADGE_API_URL}/api/badges`, { notifications: 0, messages: 0 });
    },

    async getOnlineCount() {
        return safeFetch(`${BADGE_API_URL}/api/users/online`, { count: 0 });
    }
};

function safeFetch(url, defaultData) {
    return fetch(url)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .catch(err => {
            console.warn(`[CosmoHub] Failed to load ${url}:`, err.message);
            return defaultData;
        });
}

// ===== MOCK FUNCTIONS =====
function MOCK_getCalendarItems(filters) {
    let results = mockCalendarItems.filter(i => i.userId === currentUser.id);
    if (filters.search) {
        const q = filters.search.toLowerCase();
        results = results.filter(i => i.title.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q)));
    }
    if (filters.category && filters.category !== 'all') {
        results = results.filter(i => i.category === filters.category);
    }
    if (filters.month) {
        results = results.filter(i => i.date.startsWith(filters.month));
    }
    return Promise.resolve({ data: results, total: results.length });
}

function MOCK_createItem(data) {
    const newItem = {
        id: 'evt_' + Date.now(),
        ...data,
        userId: currentUser.id,
        createdAt: new Date().toISOString()
    };
    mockCalendarItems.push(newItem);
    return Promise.resolve({ success: true, data: newItem });
}

function MOCK_updateItem(id, data) {
    const idx = mockCalendarItems.findIndex(i => i.id === id && i.userId === currentUser.id);
    if (idx !== -1) {
        mockCalendarItems[idx] = { ...mockCalendarItems[idx], ...data };
        return Promise.resolve({ success: true, data: mockCalendarItems[idx] });
    }
    return Promise.reject(new Error('Item not found'));
}

function MOCK_deleteItem(id) {
    const idx = mockCalendarItems.findIndex(i => i.id === id && i.userId === currentUser.id);
    if (idx !== -1) {
        mockCalendarItems.splice(idx, 1);
        return Promise.resolve({ success: true });
    }
    return Promise.reject(new Error('Item not found'));
}

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', async function() {
    lucide.createIcons();
    await initializeApp();
    setupNavigation();
    setupSearch();
    setupMonthNav();
    setupViewToggle();
    setupModals();
    setupQuickAdd();
    setupMonthPicker();
    setupBadges();
    setupButtonEffects();
    setupUpNextModal();
    console.log('%c🚀 CosmoHub Cosmic Calendar - Enhanced', 'color: #a855f7; font-size: 16px; font-weight: bold;');
    console.log('%cBackground image ready. Swap --calendar-bg-image in CSS to customize.', 'color: #22d3ee; font-size: 12px;');
});

// ===== INITIALIZATION =====
async function initializeApp() {
    await loadCalendar();
    await loadStats();
    await loadUpcoming();
    await loadOnlineCount();
}

// ===== CALENDAR RENDERING =====
async function loadCalendar() {
    const monthStr = formatMonthKey(currentDate);
    const response = await apiService.getCalendarItems({ month: monthStr });
    renderCalendar(currentDate, response.data);
}

function formatMonthKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function parseDateKey(str) {
    return new Date(str + 'T00:00:00');
}

function renderCalendar(date, items) {
    const grid = document.getElementById('calendar-grid');
    const monthLabel = document.getElementById('month-selector-label');
    if (!grid) return;

    const year = date.getFullYear();
    const month = date.getMonth();
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    if (monthLabel) monthLabel.textContent = `${monthNames[month]} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = firstDayOfMonth.getDay();

    const today = new Date();
    const todayKey = formatDateKey(today);

    const itemsByDate = {};
    items.forEach(item => {
        if (!itemsByDate[item.date]) itemsByDate[item.date] = [];
        itemsByDate[item.date].push(item);
    });

    Object.keys(itemsByDate).forEach(key => {
        itemsByDate[key].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
    });

    grid.innerHTML = '';
    let cellIndex = 0;

    // Previous month filler
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        const dayNum = prevMonthDays - i;
        const cell = createDayCell(dayNum, true, false, null, [], cellIndex++);
        grid.appendChild(cell);
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = key === todayKey;
        const dayItems = itemsByDate[key] || [];
        const cell = createDayCell(d, false, isToday, key, dayItems, cellIndex++);
        grid.appendChild(cell);
    }

    // Next month filler to complete 42 cells (6 rows)
    const totalCells = startDay + daysInMonth;
    const remaining = 42 - totalCells;
    for (let d = 1; d <= remaining; d++) {
        const cell = createDayCell(d, true, false, null, [], cellIndex++);
        grid.appendChild(cell);
    }

    renderCategoryLegend();
}

function createDayCell(dayNum, isOtherMonth, isToday, dateKey, items, index) {
    const cell = document.createElement('div');
    cell.className = 'day-cell' + (isOtherMonth ? ' other-month' : '') + (isToday ? ' today' : '');
    if (dateKey) cell.dataset.date = dateKey;

    // Staggered animation delay
    cell.style.animationDelay = `${index * 0.02}s`;

    const num = document.createElement('div');
    num.className = 'day-number';
    num.textContent = dayNum;
    cell.appendChild(num);

    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'day-events';

    const maxVisible = 2;
    items.slice(0, maxVisible).forEach(item => {
        const cat = CATEGORIES[item.category];
        const eventEl = document.createElement('div');
        eventEl.className = 'day-event';
        eventEl.title = `${item.title}${item.time ? ' at ' + item.time : ''}`;
        const timeStr = item.time ? formatTime12(item.time) : '';
        eventEl.innerHTML = `
            <span class="day-event-dot dot-${item.category}"></span>
            <span class="day-event-text">${timeStr ? timeStr + ' ' : ''}${escapeHtml(item.title)}</span>
        `;
        eventEl.addEventListener('click', (e) => {
            e.stopPropagation();
            openItemModal(item);
        });
        eventsContainer.appendChild(eventEl);
    });

    if (items.length > maxVisible) {
        const more = document.createElement('div');
        more.className = 'day-event-more';
        more.textContent = `+${items.length - maxVisible} more`;
        more.addEventListener('click', (e) => {
            e.stopPropagation();
            openDayModal(dateKey);
        });
        eventsContainer.appendChild(more);
    }

    cell.appendChild(eventsContainer);

    if (!isOtherMonth && dateKey) {
        cell.addEventListener('click', () => {
            document.querySelectorAll('.day-cell').forEach(c => c.classList.remove('selected'));
            cell.classList.add('selected');
            selectedDate = dateKey;
            openDayModal(dateKey);
        });
    }

    return cell;
}

function formatTime12(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function renderCategoryLegend() {
    const legend = document.getElementById('category-legend');
    if (!legend) return;
    legend.innerHTML = '';
    Object.keys(CATEGORIES).forEach(key => {
        const cat = CATEGORIES[key];
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<span class="legend-dot" style="background: ${cat.color};"></span>${cat.label}`;
        legend.appendChild(item);
    });
}

// ===== MONTH NAVIGATION =====
function setupMonthNav() {
    document.getElementById('prev-month')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        loadCalendar();
    });
    document.getElementById('next-month')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        loadCalendar();
    });
    document.getElementById('today-btn')?.addEventListener('click', () => {
        currentDate = new Date();
        loadCalendar();
    });
}

// ===== VIEW TOGGLE =====
function setupViewToggle() {
    document.querySelectorAll('.view-text-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-text-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            showToast(`${currentView.charAt(0).toUpperCase() + currentView.slice(1)} view active`, 'info');
        });
    });
}

// ===== SEARCH =====
function setupSearch() {
    const searchInput = document.getElementById('calendar-search');
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            searchQuery = e.target.value.trim();
            if (searchQuery) {
                const response = await apiService.getCalendarItems({ search: searchQuery });
                highlightSearchMatches(response.data);
            } else {
                document.querySelectorAll('.day-cell').forEach(c => c.style.opacity = '1');
            }
        }, 300);
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

function highlightSearchMatches(items) {
    const matchedDates = new Set(items.map(i => i.date));
    document.querySelectorAll('.day-cell').forEach(cell => {
        const key = cell.dataset.date;
        if (key && !matchedDates.has(key)) {
            cell.style.opacity = '0.35';
        } else {
            cell.style.opacity = '1';
        }
    });
}

// ===== STATS =====
async function loadStats() {
    const monthStr = formatMonthKey(currentDate);
    const response = await apiService.getCalendarItems({ month: monthStr });
    const items = response.data;

    renderCategoryBreakdown(items);
}

function renderCategoryBreakdown(items) {
    const container = document.getElementById('category-breakdown');
    if (!container) return;

    // Count items per category
    const counts = {};
    Object.keys(CATEGORIES).forEach(key => counts[key] = 0);
    items.forEach(item => {
        if (counts[item.category] !== undefined) counts[item.category]++;
    });

    const total = items.length || 1;

    // Sort by count descending
    const sortedCats = Object.keys(CATEGORIES).sort((a, b) => counts[b] - counts[a]);

    container.innerHTML = '';

    sortedCats.forEach(key => {
        const cat = CATEGORIES[key];
        const count = counts[key];
        const percent = (count / total) * 100;

        const row = document.createElement('div');
        row.className = 'cat-breakdown-row';
        row.innerHTML = `
            <div class="cat-breakdown-icon cat-icon-${key}"><i data-lucide="${cat.icon}"></i></div>
            <div class="cat-breakdown-info">
                <div class="cat-breakdown-name">${cat.label}</div>
                <div class="cat-breakdown-bar">
                    <div class="cat-breakdown-fill" style="width: 0%; background: ${cat.bar};"></div>
                </div>
            </div>
            <div class="cat-breakdown-count">${count}</div>
        `;
        container.appendChild(row);

        // Animate the bar after a small delay
        setTimeout(() => {
            const fill = row.querySelector('.cat-breakdown-fill');
            if (fill) fill.style.width = percent + '%';
        }, 100);
    });

    lucide.createIcons();
}

// ===== UPCOMING (Today's tasks only, max 2 visible) =====
let todayItemsCache = [];

async function loadUpcoming() {
    const response = await apiService.getCalendarItems({});
    const today = formatDateKey(new Date());
    todayItemsCache = response.data
        .filter(i => i.date === today)
        .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

    renderUpcomingList(todayItemsCache);
}

function renderUpcomingList(items) {
    const list = document.getElementById('upcoming-list');
    const countEl = document.getElementById('upcoming-count');
    const viewAllBtn = document.getElementById('view-all-upnext-btn');
    if (!list) return;

    if (countEl) countEl.textContent = items.length;

    // Show/hide View All button
    if (viewAllBtn) {
        viewAllBtn.classList.toggle('hidden', items.length <= 2);
    }

    list.innerHTML = '';
    if (items.length === 0) {
        list.innerHTML = `
            <div class="upcoming-item upcoming-item-empty">
                <div class="upcoming-info">
                    <div class="upcoming-title" style="color: var(--text-muted);">No tasks for today</div>
                    <div class="upcoming-meta">You're all caught up!</div>
                </div>
            </div>`;
        if (viewAllBtn) viewAllBtn.classList.add('hidden');
        return;
    }

    // Show only first 2 items
    const visibleItems = items.slice(0, 2);
    visibleItems.forEach(item => {
        const cat = CATEGORIES[item.category];
        const el = document.createElement('div');
        el.className = 'upcoming-item';
        el.innerHTML = `
            <div class="upcoming-indicator" style="background: ${cat.bar};"></div>
            <div class="upcoming-info">
                <div class="upcoming-title">${escapeHtml(item.title)}</div>
                <div class="upcoming-meta">
                    ${item.time ? `<span>${formatTime12(item.time)}</span>` : ''}
                    <span style="color: ${cat.color};">• ${cat.label}</span>
                </div>
            </div>
        `;
        el.addEventListener('click', () => openItemModal(item));
        list.appendChild(el);
    });
}

// ===== TODAY'S TASKS MODAL =====
function setupUpNextModal() {
    const viewAllBtn = document.getElementById('view-all-upnext-btn');
    const modal = document.getElementById('upnext-modal');
    const closeBtn = document.getElementById('upnext-modal-close');
    const doneBtn = document.getElementById('upnext-modal-done');

    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            openUpNextModal();
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeUpNextModal);
    if (doneBtn) doneBtn.addEventListener('click', closeUpNextModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeUpNextModal();
        });
    }
}

function openUpNextModal() {
    const modal = document.getElementById('upnext-modal');
    const subtitle = document.getElementById('upnext-modal-subtitle');
    const list = document.getElementById('upnext-modal-list');
    if (!modal || !list) return;

    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    if (subtitle) subtitle.textContent = `${todayItemsCache.length} item${todayItemsCache.length !== 1 ? 's' : ''}`;

    list.innerHTML = '';
    if (todayItemsCache.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="padding: 20px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <p style="font-size: 12px; margin-top: 8px;">No tasks for today</p>
            </div>`;
    } else {
        todayItemsCache.forEach(item => {
            const cat = CATEGORIES[item.category];
            const row = document.createElement('div');
            row.className = 'day-item-row';
            row.innerHTML = `
                <div class="item-color-bar" style="background: ${cat.bar};"></div>
                <div class="item-info">
                    <div class="item-title">${escapeHtml(item.title)}</div>
                    <div class="item-meta">
                        <span style="color: ${cat.color};">${cat.label}</span>
                        ${item.time ? `<span>• ${item.time}</span>` : ''}
                        ${item.priority !== 'medium' ? `<span>• ${item.priority} priority</span>` : ''}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="item-action-btn" title="Edit" data-id="${item.id}"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                    <button class="item-action-btn delete" title="Delete" data-id="${item.id}"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </div>
            `;
            row.querySelector('.item-action-btn[data-id]').addEventListener('click', () => {
                closeUpNextModal();
                openItemModal(item);
            });
            row.querySelector('.item-action-btn.delete').addEventListener('click', () => {
                closeUpNextModal();
                openDeleteModal(item.title, item.id);
            });
            list.appendChild(row);
        });
    }

    modal.classList.add('active');
    lucide.createIcons();
}

function closeUpNextModal() {
    document.getElementById('upnext-modal')?.classList.remove('active');
}

// ===== MONTH/YEAR PICKER =====
let pickerYear = new Date().getFullYear();
let pickerMonth = new Date().getMonth();

function setupMonthPicker() {
    const monthSelector = document.getElementById('month-selector');
    const modal = document.getElementById('month-picker-modal');
    const closeBtn = document.getElementById('month-picker-close');
    const cancelBtn = document.getElementById('month-picker-cancel');
    const confirmBtn = document.getElementById('month-picker-confirm');
    const yearPrev = document.getElementById('year-prev');
    const yearNext = document.getElementById('year-next');

    monthSelector?.addEventListener('click', () => {
        pickerYear = currentDate.getFullYear();
        pickerMonth = currentDate.getMonth();
        renderMonthPicker();
        modal?.classList.add('active');
        lucide.createIcons();
    });

    closeBtn?.addEventListener('click', closeMonthPicker);
    cancelBtn?.addEventListener('click', closeMonthPicker);
    confirmBtn?.addEventListener('click', () => {
        currentDate.setFullYear(pickerYear);
        currentDate.setMonth(pickerMonth);
        loadCalendar();
        closeMonthPicker();
    });

    yearPrev?.addEventListener('click', () => {
        pickerYear--;
        renderMonthPicker();
    });

    yearNext?.addEventListener('click', () => {
        pickerYear++;
        renderMonthPicker();
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeMonthPicker();
    });
}

function renderMonthPicker() {
    const grid = document.getElementById('month-picker-grid');
    const yearLabel = document.getElementById('year-label');
    if (!grid) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (yearLabel) yearLabel.textContent = pickerYear;

    grid.innerHTML = '';
    months.forEach((m, idx) => {
        const btn = document.createElement('button');
        btn.className = 'picker-month-btn' + (idx === pickerMonth ? ' active' : '');
        btn.textContent = m;
        btn.addEventListener('click', () => {
            pickerMonth = idx;
            document.querySelectorAll('.picker-month-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
        grid.appendChild(btn);
    });
}

function closeMonthPicker() {
    document.getElementById('month-picker-modal')?.classList.remove('active');
}

// ===== MODALS =====
function setupModals() {
    document.getElementById('day-modal-close')?.addEventListener('click', closeDayModal);
    document.getElementById('add-item-inline-btn')?.addEventListener('click', () => {
        closeDayModal();
        openItemModal(null, selectedDate);
    });
    document.getElementById('day-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'day-modal') closeDayModal();
    });

    document.getElementById('item-modal-close')?.addEventListener('click', closeItemModal);
    document.getElementById('item-modal-cancel')?.addEventListener('click', closeItemModal);
    document.getElementById('item-modal-save')?.addEventListener('click', saveItem);
    document.getElementById('item-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'item-modal') closeItemModal();
    });

    document.getElementById('delete-modal-close')?.addEventListener('click', closeDeleteModal);
    document.getElementById('delete-cancel')?.addEventListener('click', closeDeleteModal);
    document.getElementById('delete-confirm')?.addEventListener('click', confirmDelete);
    document.getElementById('delete-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'delete-modal') closeDeleteModal();
    });
}

function openDayModal(dateKey) {
    selectedDate = dateKey;
    const modal = document.getElementById('day-modal');
    const title = document.getElementById('day-modal-title');
    const subtitle = document.getElementById('day-modal-subtitle');
    const list = document.getElementById('day-items-list');

    const dateObj = parseDateKey(dateKey);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    title.textContent = dayName;

    const items = mockCalendarItems.filter(i => i.date === dateKey && i.userId === currentUser.id && !hiddenCategories.has(i.category));
    items.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

    subtitle.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

    list.innerHTML = '';
    if (items.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="padding: 20px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <p style="font-size: 12px; margin-top: 8px;">No items for this day</p>
            </div>`;
    } else {
        items.forEach(item => {
            const cat = CATEGORIES[item.category];
            const row = document.createElement('div');
            row.className = 'day-item-row';
            row.innerHTML = `
                <div class="item-color-bar" style="background: ${cat.bar};"></div>
                <div class="item-info">
                    <div class="item-title">${escapeHtml(item.title)}</div>
                    <div class="item-meta">
                        <span style="color: ${cat.color};">${cat.label}</span>
                        ${item.time ? `<span>• ${item.time}</span>` : ''}
                        ${item.priority !== 'medium' ? `<span>• ${item.priority} priority</span>` : ''}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="item-action-btn" title="Edit" data-id="${item.id}"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                    <button class="item-action-btn delete" title="Delete" data-id="${item.id}"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </div>
            `;
            row.querySelector('.item-action-btn[data-id]').addEventListener('click', () => {
                closeDayModal();
                openItemModal(item);
            });
            row.querySelector('.item-action-btn.delete').addEventListener('click', () => {
                openDeleteModal(item.title, item.id);
            });
            list.appendChild(row);
        });
    }

    modal.classList.add('active');
}

function closeDayModal() {
    document.getElementById('day-modal')?.classList.remove('active');
}

function openItemModal(item = null, dateOverride = null) {
    editingItemId = item ? item.id : null;
    const modal = document.getElementById('item-modal');
    const title = document.getElementById('item-modal-title');
    const titleInput = document.getElementById('item-title');
    const catSelect = document.getElementById('item-category');
    const dateInput = document.getElementById('item-date');
    const timeInput = document.getElementById('item-time');
    const prioritySelect = document.getElementById('item-priority');
    const descInput = document.getElementById('item-description');
    const footer = document.getElementById('item-modal-footer');

    title.textContent = item ? 'Edit Item' : 'Add Item';

    if (item) {
        titleInput.value = item.title;
        catSelect.value = item.category;
        dateInput.value = item.date;
        timeInput.value = item.time || '';
        prioritySelect.value = item.priority || 'medium';
        descInput.value = item.description || '';
    } else {
        titleInput.value = '';
        catSelect.value = 'todo';
        dateInput.value = dateOverride || formatDateKey(new Date());
        timeInput.value = '';
        prioritySelect.value = 'medium';
        descInput.value = '';
    }

    footer.innerHTML = '';
    if (item) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.marginRight = 'auto';
        deleteBtn.addEventListener('click', () => {
            closeItemModal();
            openDeleteModal(item.title, item.id);
        });
        footer.appendChild(deleteBtn);
    }
    footer.appendChild(document.createElement('button'));
    footer.lastChild.outerHTML = '<button class="btn-secondary" id="item-modal-cancel">Cancel</button>';
    footer.appendChild(document.createElement('button'));
    footer.lastChild.outerHTML = '<button class="btn-primary" id="item-modal-save">Save Item</button>';

    document.getElementById('item-modal-cancel')?.addEventListener('click', closeItemModal);
    document.getElementById('item-modal-save')?.addEventListener('click', saveItem);

    modal.classList.add('active');
}

function closeItemModal() {
    document.getElementById('item-modal')?.classList.remove('active');
    editingItemId = null;
}

async function saveItem() {
    const title = document.getElementById('item-title').value.trim();
    const category = document.getElementById('item-category').value;
    const date = document.getElementById('item-date').value;
    const time = document.getElementById('item-time').value;
    const priority = document.getElementById('item-priority').value;
    const description = document.getElementById('item-description').value.trim();

    if (!title) { showToast('Please enter a title', 'error'); return; }
    if (!date) { showToast('Please select a date', 'error'); return; }

    const data = { title, category, date, time, priority, description };

    try {
        if (editingItemId) {
            await apiService.updateItem(editingItemId, data);
            showToast('Item updated successfully', 'success');
        } else {
            await apiService.createItem(data);
            showToast('Item added successfully', 'success');
        }
        closeItemModal();
        await loadCalendar();
        await loadStats();
        await loadUpcoming();
    } catch (err) {
        showToast('Failed to save: ' + err.message, 'error');
    }
}

// ===== DELETE =====
let itemToDeleteId = null;

function openDeleteModal(itemName, id) {
    itemToDeleteId = id;
    document.getElementById('delete-item-name').textContent = itemName || 'this item';
    document.getElementById('delete-modal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('delete-modal')?.classList.remove('active');
    itemToDeleteId = null;
}

async function confirmDelete() {
    if (!itemToDeleteId) return;
    try {
        await apiService.deleteItem(itemToDeleteId);
        showToast('Item deleted successfully', 'success');
        closeDeleteModal();
        await loadCalendar();
        await loadStats();
        await loadUpcoming();
    } catch (err) {
        showToast('Delete failed: ' + err.message, 'error');
    }
}

// ===== QUICK ADD =====
function setupQuickAdd() {
    document.getElementById('quick-add-btn')?.addEventListener('click', () => {
        openItemModal(null, formatDateKey(new Date()));
    });
    document.getElementById('new-event-btn')?.addEventListener('click', () => {
        openItemModal(null, formatDateKey(new Date()));
    });
}

// ===== BADGES & ONLINE =====
function setupBadges() {
    loadBadges();
    startBadgePolling();
}

async function loadBadges() {
    const d = await apiService.getBadges();
    const notifEl = document.getElementById('notif-badge');
    const msgEl = document.getElementById('msg-badge');
    if (notifEl) { notifEl.textContent = d.notifications || 0; notifEl.style.display = d.notifications ? 'flex' : 'none'; }
    if (msgEl) { msgEl.textContent = d.messages || 0; msgEl.style.display = d.messages ? 'flex' : 'none'; }
}

let badgePollInterval;
function startBadgePolling() {
    badgePollInterval = setInterval(loadBadges, 5000);
}
function stopBadgePolling() {
    if (badgePollInterval) clearInterval(badgePollInterval);
}

async function loadOnlineCount() {
    const d = await apiService.getOnlineCount();
    const el = document.getElementById('online-count');
    if (el) el.textContent = (d.count || 0).toLocaleString();
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

// ===== BUTTON EFFECTS =====
function setupButtonEffects() {
    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.92)';
            setTimeout(() => this.style.transform = 'scale(1)', 150);
        });
    });
}

// ===== UTILITIES =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== TOAST =====
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        success: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        error: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        info: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = icons[type] + '<span>' + escapeHtml(message) + '</span>';
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Cleanup
window.addEventListener('beforeunload', stopBadgePolling);

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

// Sidebar Collapse
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

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            const searchInput = document.getElementById('calendar-search');
            if (searchInput) searchInput.focus();
        }
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
            });
            const searchInput = document.getElementById('calendar-search');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.value = '';
                searchInput.blur();
                document.querySelectorAll('.day-cell').forEach(c => c.style.opacity = '1');
            }
        }
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            const btn = document.querySelector('.collapse-btn');
            if (btn) btn.click();
        }
    });
}

// Enhanced Button Effects
function setupEnhancedButtonEffects() {
    document.querySelectorAll('.icon-btn, .btn-primary, .btn-secondary, .new-event-btn, .today-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => this.style.transform = '', 150);
        });
    });
}

// ===== ENHANCED INITIALIZATION =====
// Override the existing DOMContentLoaded by wrapping the original
const originalInit = document.addEventListener;
// The original handler is already set, so we'll add our enhancements after

document.addEventListener('DOMContentLoaded', function() {
    // Core enhancements
    initStarfield();
    initSidebar();
    initKeyboardShortcuts();
    setupEnhancedButtonEffects();

    // Animate stats on load
    setTimeout(() => {
        const statValues = document.querySelectorAll('.mini-stat-value');
        statValues.forEach(el => {
            const target = parseInt(el.textContent.replace(/,/g, '')) || 0;
            if (target > 0) animateCounter(el, target);
        });
    }, 300);

    // Animate upcoming count
    setTimeout(() => {
        const countEl = document.getElementById('upcoming-count');
        if (countEl) {
            const target = parseInt(countEl.textContent) || 0;
            if (target > 0) animateCounter(countEl, target, 800);
        }
    }, 400);

    console.log('%c🚀 CosmoHub Cosmic Calendar Enhanced', 'color: #a855f7; font-size: 16px; font-weight: bold;');
    console.log('%cFeatures: Starfield, Animated Counters, Sidebar Collapse, Keyboard Shortcuts, Glow Effects', 'color: #22d3ee; font-size: 11px;');
});