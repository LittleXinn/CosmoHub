// ===== CosmoHub Dashboard JavaScript =====

// ===== API CONFIG =====
const API_URL = window.location.origin; // Same server, or change to your Render URL
const BACKEND_READY = true;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide Icons
    lucide.createIcons();

    // ===== Sidebar Navigation =====
    const navItems = document.querySelectorAll('.nav-item');
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

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const pageName = this.querySelector('.nav-text').textContent.trim();
            const targetPage = pageRoutes[pageName];
            if (targetPage) {
                const currentPage = window.location.pathname.split('/').pop();
                if (currentPage !== targetPage) {
                    window.location.href = targetPage;
                }
            } else {
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // ===== Search Bar =====
    const searchInput = document.querySelector('.search-bar input');
    const searchBar = document.querySelector('.search-bar');
    searchInput.addEventListener('focus', () => searchBar.style.borderColor = 'rgba(100, 100, 180, 0.4)');
    searchInput.addEventListener('blur', () => searchBar.style.borderColor = 'rgba(80, 80, 140, 0.18)');
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // ===== Notification Buttons =====
    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.92)';
            setTimeout(() => this.style.transform = 'scale(1)', 150);
        });
    });

    // ===== View All Buttons =====
    document.querySelectorAll('.view-all-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cardTitle = this.closest('.card').querySelector('.card-title').textContent;
            console.log('View all:', cardTitle);
        });
    });

    // ===== Card Hover Effects =====
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.2)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });

    // ===== TASK CHECKBOX TOGGLE =====
    function attachCheckboxListeners() {
        document.querySelectorAll('.task-checkbox').forEach(box => {
            box.addEventListener('click', function(e) {
                e.stopPropagation();
                const isChecked = this.classList.toggle('checked');
                this.classList.toggle('unchecked', !isChecked);
                const taskTitle = this.closest('.task-item').querySelector('.task-title');
                taskTitle.classList.toggle('done', isChecked);
                lucide.createIcons();

                // Update backend
                const taskId = this.closest('.task-item').dataset.taskId;
                if (taskId) {
                    fetch(`${API_URL}/api/tasks/${taskId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ done: isChecked })
                    });
                }
            });
        });
    }

    // ============================================================
    // ===== BACKEND DATA FUNCTIONS =====
    // ============================================================

    window.loadStats = function(stats) {
        const container = document.getElementById('stats-row');
        if (!container) return;
        container.innerHTML = '';

        const statConfigs = [
            { key: 'activeUsers', icon: 'users', color: 'purple', label: 'Active Users', showDot: true },
            { key: 'unreadAnnouncements', icon: 'megaphone', color: 'pink', label: 'Unread\nAnnouncements' },
            { key: 'todoTasks', icon: 'check-circle-2', color: 'cyan', label: 'To-Do\nTasks' }
        ];

        statConfigs.forEach(cfg => {
            if (stats[cfg.key] === undefined && stats[cfg.key] !== 0) return;
            const val = stats[cfg.key];
            const box = document.createElement('div');
            box.className = 'stat-box';
            box.innerHTML = `
                <div class="stat-icon-wrap ${cfg.color}">
                    <i data-lucide="${cfg.icon}"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-number">${val}</span>
                    <span class="stat-label">${cfg.label}${cfg.showDot ? '<span class="stat-online-dot"></span>' : ''}</span>
                </div>
            `;
            container.appendChild(box);
        });
        lucide.createIcons();
    };

    window.loadAnnouncements = function(announcements) {
        const container = document.getElementById('announcement-list');
        if (!container) return;
        container.innerHTML = '';

        if (!announcements || announcements.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="megaphone"></i>
                    <p>No announcements yet</p>
                </div>`;
            lucide.createIcons();
            return;
        }

        const colors = ['purple', 'blue', 'cyan'];
        const icons = ['megaphone', 'star', 'info'];

        announcements.slice(0, 5).forEach((ann, i) => {
            const color = colors[i % colors.length];
            const icon = icons[i % icons.length];
            const item = document.createElement('div');
            item.className = 'announcement-item';
            item.innerHTML = `
                <div class="announcement-icon-wrap ${color}">
                    <i data-lucide="${icon}"></i>
                </div>
                <div class="announcement-body">
                    <div class="announcement-title">${ann.title}</div>
                    <div class="announcement-desc">${ann.description}</div>
                    <div class="announcement-meta">
                        <span class="announcement-time">${ann.time || ann.date}</span>
                        <span class="announcement-dot ${color}"></span>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });
        lucide.createIcons();
    };

    window.loadEvents = function(events) {
        const container = document.getElementById('events-list');
        if (!container) return;
        container.innerHTML = '';

        if (!events || events.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="calendar"></i>
                    <p>No upcoming events</p>
                </div>`;
            lucide.createIcons();
            return;
        }

        events.forEach(evt => {
            const item = document.createElement('div');
            item.className = 'event-item';
            item.innerHTML = `
                <div class="event-date">
                    <span class="event-date-month">${evt.month}</span>
                    <span class="event-date-day">${evt.day}</span>
                </div>
                <div class="event-body">
                    <div class="event-title">${evt.title}</div>
                    <div class="event-time">${evt.event_time}</div>
                    <span class="event-tag ${evt.type}">
                        <span class="event-tag-dot"></span>
                        ${evt.type.charAt(0).toUpperCase() + evt.type.slice(1)}
                    </span>
                </div>
            `;
            container.appendChild(item);
        });
    };

    window.loadCommunities = function(communities) {
        const container = document.getElementById('communities-grid');
        if (!container) return;
        container.innerHTML = '';

        if (!communities || communities.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i data-lucide="users"></i>
                    <p>No communities yet</p>
                </div>`;
            lucide.createIcons();
            return;
        }

        const colors = ['purple', 'blue', 'cyan', 'pink'];
        const icons = ['code-2', 'flask-conical', 'sigma', 'gamepad-2'];

        communities.forEach((comm, i) => {
            const color = colors[i % colors.length];
            const icon = comm.icon || icons[i % icons.length];
            const card = document.createElement('div');
            card.className = 'community-card';
            card.innerHTML = `
                <div class="community-card-icon ${color}">
                    <i data-lucide="${icon}"></i>
                </div>
                <span class="community-card-name">${comm.name}</span>
                <span class="community-card-members">${comm.members} members</span>
            `;
            container.appendChild(card);
        });
        lucide.createIcons();
    };

    window.loadUserProfile = function(user) {
        const nameEl = document.getElementById('profile-name');
        if (nameEl) nameEl.textContent = user.name || '--';

        const handleEl = document.getElementById('profile-handle');
        if (handleEl) handleEl.textContent = user.handle || '--';

        const roleEl = document.getElementById('profile-role');
        if (roleEl) roleEl.textContent = user.role || '--';

        if (user.avatar) {
            loadProfileAvatar(user.avatar);
        }
    };

    window.loadProfileAvatar = function(imageUrl) {
        const avatarContainer = document.getElementById('profile-avatar');
        if (!avatarContainer) return;

        const existingImg = avatarContainer.querySelector('img');
        if (existingImg) existingImg.remove();

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'User';
        img.onload = () => avatarContainer.classList.add('has-image');
        img.onerror = () => avatarContainer.classList.remove('has-image');
        avatarContainer.appendChild(img);
    };

    window.loadSchedule = function(schedule) {
        const container = document.getElementById('schedule-list');
        const labelEl = document.getElementById('schedule-label');
        if (!container) return;

        if (labelEl && schedule.date) {
            labelEl.textContent = schedule.date;
        }

        container.innerHTML = '';

        if (!schedule.items || schedule.items.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 16px;">
                    <i data-lucide="clock"></i>
                    <p>No events today</p>
                </div>`;
            lucide.createIcons();
            return;
        }

        const colors = ['purple', 'green', 'blue'];
        schedule.items.forEach((item, i) => {
            const el = document.createElement('div');
            el.className = 'schedule-item';
            el.innerHTML = `
                <span class="schedule-time">${item.time}</span>
                <span class="schedule-dot ${colors[i % colors.length]}"></span>
                <span class="schedule-text">${item.title}</span>
            `;
            container.appendChild(el);
        });
    };

    window.loadTasks = function(tasks) {
        const container = document.getElementById('tasks-list');
        if (!container) return;
        container.innerHTML = '';

        if (!tasks || tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 16px;">
                    <i data-lucide="check-circle-2"></i>
                    <p>No tasks yet</p>
                </div>`;
            lucide.createIcons();
            return;
        }

        tasks.forEach(task => {
            const isDone = task.done;
            const item = document.createElement('div');
            item.className = 'task-item';
            item.dataset.taskId = task.id;
            item.innerHTML = `
                <div class="task-checkbox ${isDone ? 'checked' : 'unchecked'}">
                    <i data-lucide="check"></i>
                </div>
                <div class="task-info">
                    <div class="task-title ${isDone ? 'done' : ''}">${task.title}</div>
                    <div class="task-due">${task.due}</div>
                </div>
            `;
            container.appendChild(item);
        });

        attachCheckboxListeners();
        lucide.createIcons();
    };

    window.loadOnlineCount = function(count) {
        const el = document.getElementById('online-count');
        if (el) el.textContent = count !== undefined ? count.toLocaleString() : '--';
    };

    window.loadBadges = function(notifications, messages) {
        const notifBadge = document.getElementById('notif-badge');
        const msgBadge = document.getElementById('msg-badge');
        if (notifBadge) notifBadge.textContent = notifications !== undefined ? notifications : '--';
        if (msgBadge) msgBadge.textContent = messages !== undefined ? messages : '--';
    };

    // ===== LOAD DATA FROM BACKEND =====
    if (BACKEND_READY) {
        fetch(`${API_URL}/api/stats`).then(r => r.json()).then(loadStats);
        fetch(`${API_URL}/api/announcements`).then(r => r.json()).then(loadAnnouncements);
        fetch(`${API_URL}/api/events`).then(r => r.json()).then(loadEvents);
        fetch(`${API_URL}/api/communities`).then(r => r.json()).then(loadCommunities);
        fetch(`${API_URL}/api/user/profile`).then(r => r.json()).then(loadUserProfile);
        fetch(`${API_URL}/api/schedule`).then(r => r.json()).then(loadSchedule);
        fetch(`${API_URL}/api/tasks`).then(r => r.json()).then(loadTasks);
        fetch(`${API_URL}/api/online`).then(r => r.json()).then(d => loadOnlineCount(d.count));
        fetch(`${API_URL}/api/badges`).then(r => r.json()).then(d => loadBadges(d.notifications, d.messages));
    }

    // ===== Console Welcome =====
    console.log('%c🚀 CosmoHub Dashboard Loaded', 'color: #a855f7; font-size: 16px; font-weight: bold;');
    console.log('%cBackend API: ' + API_URL, 'color: #22d3ee; font-size: 12px;');
});
