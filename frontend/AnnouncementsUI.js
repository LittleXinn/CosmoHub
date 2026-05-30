// ===== CosmoHub Announcements JavaScript =====

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide Icons
    lucide.createIcons();

    // ===== CONFIG: Set to true when backend is ready =====
    const BACKEND_READY = true;
const API_URL = window.location.origin;

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
            const pageName = this.dataset.page;
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

    // ===== Category Dropdown =====
    const categoryDropdown = document.getElementById('category-dropdown');
    const dropdownToggle = categoryDropdown.querySelector('.dropdown-toggle');
    const currentCategoryLabel = document.getElementById('current-category');

    dropdownToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        categoryDropdown.classList.toggle('open');
    });

    document.addEventListener('click', function() {
        categoryDropdown.classList.remove('open');
    });

    categoryDropdown.querySelector('.dropdown-menu').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // ===== Category Tabs =====
    const tabs = document.querySelectorAll('.tab');
    let currentFilter = 'all';

    function setActiveTab(filter) {
        currentFilter = filter;
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === filter);
        });
        renderAnnouncements();
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => setActiveTab(tab.dataset.tab));
    });

    // ===== Category Sidebar & Dropdown Sync =====
    function setActiveCategory(category) {
        currentFilter = category;
        setActiveTab(category);

        // Update dropdown
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.classList.toggle('active', item.dataset.category === category);
        });
        const activeDropdownItem = document.querySelector('.dropdown-item.active');
        if (activeDropdownItem) {
            currentCategoryLabel.textContent = activeDropdownItem.querySelector('span').textContent;
        }

        // Update sidebar categories
        document.querySelectorAll('.category-row').forEach(row => {
            row.classList.toggle('active', row.dataset.category === category);
        });
    }

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            setActiveCategory(this.dataset.category);
            categoryDropdown.classList.remove('open');
        });
    });

    // ===== Announcement Data =====
    const announcementsData = [
        {
            id: 1,
            title: 'Midterm Examination Schedule',
            description: 'The midterm examinations will start from May 20, 2025. Please check the detailed schedule and prepare accordingly.',
            category: 'academic',
            tags: ['academic', 'important'],
            pinned: true,
            image: 'galaxy',
            author: { name: 'Dr. Nova Carter', role: 'Academic Office', avatar: null },
            date: 'May 15, 2025',
            time: '10:30 AM'
        },
        {
            id: 2,
            title: 'Science Fair 2025 Registration Open!',
            description: 'The annual Science Fair is back! Register your teams before May 25, 2025 to participate. Exciting prizes await!',
            category: 'events',
            tags: ['events', 'featured'],
            pinned: false,
            image: 'calendar',
            author: { name: 'Prof. Ethan Blake', role: 'Science Department', avatar: null },
            date: 'May 14, 2025',
            time: '2:15 PM'
        },
        {
            id: 3,
            title: 'System Maintenance Notice',
            description: 'CosmoHub will undergo scheduled maintenance on May 18, 2025 from 12:00 AM to 3:00 AM. Some features may be unavailable.',
            category: 'system',
            tags: ['system', 'notice'],
            pinned: false,
            image: 'megaphone',
            author: { name: 'Admin Team', role: 'System Administrator', avatar: null },
            date: 'May 13, 2025',
            time: '9:00 AM'
        },
        {
            id: 4,
            title: 'New Resources Added to Galaxy Library',
            description: "We've added 120+ new e-books and research papers. Explore now and expand your knowledge!",
            category: 'academic',
            tags: ['academic', 'library'],
            pinned: false,
            image: 'book',
            author: { name: 'Mira Solis', role: 'Library Head', avatar: null },
            date: 'May 12, 2025',
            time: '4:45 PM'
        },
        {
            id: 5,
            title: 'Community Meetup – May 24',
            description: 'Join us for the Community Meetup and connect with fellow explorers. Dont miss out!',
            category: 'community',
            tags: ['community', 'events'],
            pinned: false,
            image: 'users',
            author: { name: 'Kai Anderson', role: 'Community Manager', avatar: null },
            date: 'May 11, 2025',
            time: '11:20 AM'
        },
        {
            id: 6,
            title: 'Guest Lecture: Quantum Computing',
            description: 'Renowned physicist Dr. Alan Vance will deliver a lecture on Quantum Computing fundamentals. Open to all students.',
            category: 'academic',
            tags: ['academic', 'events'],
            pinned: false,
            image: 'flask',
            author: { name: 'Dr. Alan Vance', role: 'Visiting Professor', avatar: null },
            date: 'May 10, 2025',
            time: '3:00 PM'
        },
        {
            id: 7,
            title: 'Server Upgrade Complete',
            description: 'Our servers have been successfully upgraded. You should notice improved performance and faster load times.',
            category: 'system',
            tags: ['system'],
            pinned: false,
            image: 'cpu',
            author: { name: 'Tech Team', role: 'Infrastructure', avatar: null },
            date: 'May 9, 2025',
            time: '8:00 AM'
        },
        {
            id: 8,
            title: 'Summer Internship Opportunities',
            description: 'Multiple internship openings at leading tech companies. Apply through the Career Portal by June 1.',
            category: 'general',
            tags: ['general', 'important'],
            pinned: false,
            image: 'briefcase',
            author: { name: 'Career Center', role: 'Placement Office', avatar: null },
            date: 'May 8, 2025',
            time: '1:30 PM'
        }
    ];

    const categoryIcons = {
        all: 'layout-grid',
        academic: 'graduation-cap',
        events: 'calendar-days',
        general: 'info',
        community: 'users',
        system: 'cpu'
    };

    const tagIcons = {
        academic: 'graduation-cap',
        events: 'calendar-days',
        general: 'info',
        community: 'users',
        system: 'cpu',
        important: 'alert-circle',
        featured: 'star',
        notice: 'bell',
        library: 'book-open'
    };

    const imageIcons = {
        galaxy: 'orbit',
        calendar: 'calendar',
        megaphone: 'megaphone',
        book: 'book-open',
        users: 'users',
        flask: 'flask-conical',
        cpu: 'cpu',
        briefcase: 'briefcase'
    };

    const imageColors = {
        galaxy: 'purple',
        calendar: 'cyan',
        megaphone: 'pink',
        book: 'blue',
        users: 'indigo',
        flask: 'green',
        cpu: 'orange',
        briefcase: 'yellow'
    };

    const imageBgColors = {
        galaxy: 'rgba(168, 85, 247, 0.12)',
        calendar: 'rgba(34, 211, 238, 0.12)',
        megaphone: 'rgba(244, 114, 182, 0.12)',
        book: 'rgba(59, 130, 246, 0.12)',
        users: 'rgba(99, 102, 241, 0.12)',
        flask: 'rgba(34, 197, 94, 0.12)',
        cpu: 'rgba(249, 115, 22, 0.12)',
        briefcase: 'rgba(234, 179, 8, 0.12)'
    };

    const imageBorderColors = {
        galaxy: 'rgba(168, 85, 247, 0.2)',
        calendar: 'rgba(34, 211, 238, 0.2)',
        megaphone: 'rgba(244, 114, 182, 0.2)',
        book: 'rgba(59, 130, 246, 0.2)',
        users: 'rgba(99, 102, 241, 0.2)',
        flask: 'rgba(34, 197, 94, 0.2)',
        cpu: 'rgba(249, 115, 22, 0.2)',
        briefcase: 'rgba(234, 179, 8, 0.2)'
    };

    // ===== Render Announcements =====
    function renderAnnouncements() {
        const container = document.getElementById('announcements-feed');
        container.innerHTML = '';

        let filtered = announcementsData;
        if (currentFilter !== 'all') {
            filtered = announcementsData.filter(a => a.category === currentFilter);
        }

        // Sort: pinned first, then by date
        filtered.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.id - a.id;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="megaphone"></i>
                    <p>No announcements in this category</p>
                </div>`;
            lucide.createIcons();
            return;
        }

        filtered.forEach(ann => {
            const card = document.createElement('div');
            card.className = 'announcement-card' + (ann.pinned ? ' pinned' : '');

            const imgIcon = imageIcons[ann.image] || 'file-text';
            const imgBg = imageBgColors[ann.image] || 'rgba(100,100,180,0.12)';
            const imgBorder = imageBorderColors[ann.image] || 'rgba(100,100,180,0.2)';
            const imgColor = imageColors[ann.image] === 'purple' ? '#a855f7' :
                             imageColors[ann.image] === 'cyan' ? '#22d3ee' :
                             imageColors[ann.image] === 'pink' ? '#f472b6' :
                             imageColors[ann.image] === 'blue' ? '#3b82f6' :
                             imageColors[ann.image] === 'indigo' ? '#6366f1' :
                             imageColors[ann.image] === 'green' ? '#22c55e' :
                             imageColors[ann.image] === 'orange' ? '#f97316' :
                             imageColors[ann.image] === 'yellow' ? '#eab308' : '#a855f7';

            const tagsHtml = ann.tags.map(tag => {
                const icon = tagIcons[tag] || 'tag';
                return `<span class="tag ${tag}"><i data-lucide="${icon}"></i>${tag.charAt(0).toUpperCase() + tag.slice(1)}</span>`;
            }).join('');

            const pinnedBadge = ann.pinned ? `
                <div class="announcement-pinned-badge">
                    <i data-lucide="pin"></i>Pinned
                </div>
            ` : '';

            card.innerHTML = `
                <div class="announcement-header">
                    <div class="announcement-image-placeholder" style="background:${imgBg};border-color:${imgBorder};">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${imgColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            ${getIconPath(imgIcon)}
                        </svg>
                    </div>
                    <div class="announcement-meta-top">
                        ${pinnedBadge}
                        <div class="announcement-title">${ann.title}</div>
                        <div class="announcement-desc">${ann.description}</div>
                    </div>
                </div>
                <div class="announcement-tags">${tagsHtml}</div>
                <div class="announcement-footer">
                    <div class="announcement-author">
                        <div class="author-avatar-placeholder">
                            <i data-lucide="user"></i>
                        </div>
                        <div class="author-info">
                            <span class="author-name">${ann.author.name}</span>
                            <span class="author-role">${ann.author.role}</span>
                        </div>
                    </div>
                    <div class="announcement-date">
                        <span class="date-text">${ann.date}</span>
                        <span class="time-text">${ann.time}</span>
                    </div>
                    <div class="announcement-actions">
                        <button class="action-dot-btn"><i data-lucide="more-vertical"></i></button>
                    </div>
                </div>
            `;
            container.appendChild(card);
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

    // ===== Render Categories Sidebar =====
    function renderCategories() {
        const container = document.getElementById('category-list');
        const categories = [
            { key: 'all', name: 'All Announcements', count: 28 },
            { key: 'academic', name: 'Academic', count: 8 },
            { key: 'events', name: 'Events', count: 6 },
            { key: 'general', name: 'General', count: 5 },
            { key: 'community', name: 'Community', count: 5 },
            { key: 'system', name: 'System', count: 4 }
        ];

        categories.forEach(cat => {
            const icon = categoryIcons[cat.key];
            const row = document.createElement('div');
            row.className = 'category-row' + (cat.key === 'all' ? ' active' : '');
            row.dataset.category = cat.key;
            row.innerHTML = `
                <div class="category-icon-wrap ${cat.key}">
                    <i data-lucide="${icon}"></i>
                </div>
                <span class="category-name">${cat.name}</span>
                <span class="category-count">${cat.count}</span>
            `;
            row.addEventListener('click', () => setActiveCategory(cat.key));
            container.appendChild(row);
        });
    }

    // ===== Render Highlights =====
    function renderHighlights() {
        const container = document.getElementById('highlights-list');
        const highlights = [
            { title: 'Midterm Examination Schedule', date: 'May 15, 2025', icon: 'megaphone', color: 'purple', pinned: true },
            { title: 'Science Fair 2025', date: 'May 14, 2025', icon: 'star', color: 'blue', pinned: false },
            { title: 'System Maintenance', date: 'May 13, 2025', icon: 'megaphone', color: 'red', pinned: false },
            { title: 'New Resources Added', date: 'May 12, 2025', icon: 'book-open', color: 'cyan', pinned: false },
            { title: 'Community Meetup', date: 'May 11, 2025', icon: 'users', color: 'pink', pinned: false },
            { title: 'Quantum Computing Lecture', date: 'May 10, 2025', icon: 'flask-conical', color: 'green', pinned: false }
        ];

        highlights.forEach(hl => {
            const item = document.createElement('div');
            item.className = 'highlight-item';
            item.innerHTML = `
                <div class="highlight-icon-wrap ${hl.color}">
                    <i data-lucide="${hl.icon}"></i>
                </div>
                <div class="highlight-info">
                    <div class="highlight-title">${hl.title}</div>
                    <div class="highlight-date">${hl.date}</div>
                </div>
                ${hl.pinned ? '<div class="highlight-pin"><i data-lucide="pin"></i></div>' : ''}
            `;
            container.appendChild(item);
        });
    }

    // ===== Modal =====
    const modalOverlay = document.getElementById('modal-overlay');
    const newAnnouncementBtn = document.getElementById('new-announcement-btn');
    const modalClose = document.getElementById('modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    const modalPublish = document.getElementById('modal-publish');

    function openModal() {
        modalOverlay.classList.add('open');
        lucide.createIcons();
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
    }

    newAnnouncementBtn.addEventListener('click', openModal);
    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) closeModal();
    });

    modalPublish.addEventListener('click', function() {
        this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Published!</span>';
        setTimeout(() => {
            closeModal();
            this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><span>Publish</span>';
        }, 800);
    });

    // ===== Category Pills in Modal =====
    document.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', function() {
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // ===== Enable Notifications =====
    document.getElementById('enable-notify-btn').addEventListener('click', function() {
        this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Notifications On</span>';
        this.style.background = 'var(--accent-green)';
        this.style.borderColor = 'var(--accent-green)';
    });

    // ===== Backend Data Functions =====
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

    // ===== LOAD FROM BACKEND =====
    if (BACKEND_READY) {
        fetch(`${API_URL}/api/online`).then(r => r.json()).then(d => loadOnlineCount(d.count));
        fetch(`${API_URL}/api/badges`).then(r => r.json()).then(d => loadBadges(d.notifications, d.messages));
        fetch(`${API_URL}/api/announcements`).then(r => r.json()).then(data => {
            announcementsData.length = 0;
            announcementsData.push(...data);
            renderAnnouncements();
        });
    }

    // ===== Initial Render =====
    renderCategories();
    renderHighlights();
    renderAnnouncements();
    lucide.createIcons();

    // ===== Console Welcome =====
    console.log('%c📢 CosmoHub Announcements Loaded', 'color: #a855f7; font-size: 16px; font-weight: bold;');
    console.log('%cAll data areas are ready for backend integration!', 'color: #22d3ee; font-size: 12px;');
});
