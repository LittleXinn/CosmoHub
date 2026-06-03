// ===== CosmoHub Profile - Feed Edition =====

const API_URL = window.location.origin;

// ===== SUPABASE SETUP =====
const SUPABASE_URL = 'https://jizbbohomkfjijnkbaie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppemJib2hvbWtmamlqbmtiYWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDE5MzEsImV4cCI6MjA5NTg3NzkzMX0.jhaoyiLJ37zcnFQ6MGqevCEh4r8zfki89UnFYYq62Po';
let sb = null;

function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[CosmoHub Profile] Supabase client initialized');
        return true;
    }
    console.warn('[CosmoHub Profile] Supabase library not loaded');
    return false;
}

// ===== DEFAULT DATA =====
const DEFAULT_USER = { name: 'Alex Mercer', username: 'alexmercer', handle: '@alexmercer', role: 'Explorer', bio: 'Explorer of knowledge, seeker of stars.', location: 'Andromeda Galaxy' };
const DEFAULT_ONLINE = { count: 1248 };
const DEFAULT_BADGES = { notifications: 4, messages: 5 };

// ===== STATE =====
let currentTheme = localStorage.getItem('cosmohub-theme') || 'dark';
let sidebarCollapsed = localStorage.getItem('cosmohub-sidebar') === 'true';
let supabaseReady = false;
let currentUser = { ...DEFAULT_USER };
let userProfile = null;
let pendingImageFile = null;
let pendingImageType = null; // 'avatar' or 'banner'
let currentFeedFilter = 'all';

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
        <button class="toast-close" aria-label="Dismiss"><i data-lucide="x"></i></button>
    `;
    container.appendChild(toast);
    lucide.createIcons();
    toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
    if (duration > 0) setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
}

// ===== MODAL SYSTEM =====
const Modal = {
    overlay: null, title: null, body: null, footer: null,
    cancelBtn: null, confirmBtn: null, onConfirm: null, onCancel: null,

    init() {
        this.overlay = document.getElementById('modal-overlay');
        this.title = document.getElementById('modal-title');
        this.body = document.getElementById('modal-body');
        this.footer = document.getElementById('modal-footer');
        this.cancelBtn = document.getElementById('modal-cancel');
        this.confirmBtn = document.getElementById('modal-confirm');
        if (!this.overlay) return;
        document.getElementById('modal-close').addEventListener('click', () => this.close());
        this.cancelBtn.addEventListener('click', () => { if (this.onCancel) this.onCancel(); this.close(); });
        this.confirmBtn.addEventListener('click', () => { if (this.onConfirm) this.onConfirm(); this.close(); });
        this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.close(); });
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

// ===== CROP MODAL =====
const CropModal = {
    overlay: null,
    previewImg: null,
    confirmBtn: null,
    cancelBtn: null,
    closeBtn: null,
    onConfirm: null,

    init() {
        this.overlay = document.getElementById('crop-modal-overlay');
        this.previewImg = document.getElementById('crop-preview-img');
        this.confirmBtn = document.getElementById('crop-confirm');
        this.cancelBtn = document.getElementById('crop-cancel');
        this.closeBtn = document.getElementById('crop-modal-close');
        if (!this.overlay) return;

        this.closeBtn.addEventListener('click', () => this.close());
        this.cancelBtn.addEventListener('click', () => this.close());
        this.confirmBtn.addEventListener('click', () => {
            if (this.onConfirm) this.onConfirm();
            this.close();
        });
        this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.close(); });
    },

    open(file, onConfirm) {
        this.onConfirm = onConfirm || null;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewImg.src = e.target.result;
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
        reader.readAsDataURL(file);
    },

    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.onConfirm = null;
        pendingImageFile = null;
        pendingImageType = null;
    }
};

// ===== NUMBER COUNTER ANIMATION =====
function animateNumber(element, target, duration = 800) {
    if (!element) return;
    const start = parseInt(element.textContent.replace(/,/g, '')) || 0;
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
        if (e.key === 'Escape') { input.value = ''; performSearch(''); input.blur(); }
    });
}

function performSearch(query) {
    const lowerQuery = query.toLowerCase().trim();
    document.querySelectorAll('.feed-container .card, .feed-container .post-card, .feed-container .activity-item, .feed-container .resource-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        const hasMatch = !lowerQuery || text.includes(lowerQuery);
        card.style.opacity = hasMatch ? '1' : '0.3';
        card.style.transform = hasMatch ? '' : 'scale(0.98)';
        card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    });
    document.querySelectorAll('.search-highlight').forEach(el => {
        const parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });
    if (!lowerQuery) return;
    const walker = document.createTreeWalker(document.querySelector('.feed-container'), NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.toLowerCase().includes(lowerQuery)) textNodes.push(node);
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

// ===== KEYBOARD SHORTCUTS =====
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.focus();
        }
        if (e.key === 'Escape') {
            Modal.close();
            CropModal.close();
        }
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            document.getElementById('collapse-btn').click();
        }
    });
}

// ===== PROFILE DATA LOADING =====
async function loadProfile() {
    try {
        let userId = currentUser?.id;
        if (!userId) {
            userId = localStorage.getItem('cosmohub_user_id') || 'demo-user-id';
        }

        if (supabaseReady && sb) {
            const { data, error } = await sb
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (!error && data) {
                userProfile = data;
            } else {
                userProfile = getDemoProfile();
            }
        } else {
            userProfile = getDemoProfile();
        }

        renderProfile();
        loadProfileStats();
    } catch (err) {
        console.error('Error loading profile:', err);
        userProfile = getDemoProfile();
        renderProfile();
        loadProfileStats();
    }
}

function getDemoProfile() {
    return {
        id: 'demo-user-id',
        name: 'Alex Mercer',
        username: 'alexmercer',
        handle: '@alexmercer',
        email: 'alex@cosmohub.com',
        bio: 'Explorer of knowledge, seeker of stars.',
        location: 'Andromeda Galaxy',
        website: 'https://cosmohub.dev',
        role: 'Explorer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
        banner: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&h=400&fit=crop',
        created_at: '2025-02-12T00:00:00Z',
        tags: ['Astronomy', 'Web Developer', 'AI Enthusiast', 'Problem Solver'],
        verified: true
    };
}

function renderProfile() {
    if (!userProfile) return;

    const name = userProfile.name || userProfile.username || 'User';
    const handle = userProfile.handle || `@${userProfile.username}` || '@user';
    const bio = userProfile.bio || 'No bio yet.';
    const location = userProfile.location || 'Unknown Location';
    const website = userProfile.website || '';
    const avatar = userProfile.avatar || '';
    const banner = userProfile.banner || 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&h=400&fit=crop';

    let joinedText = 'Recently joined';
    if (userProfile.created_at) {
        const date = new Date(userProfile.created_at);
        joinedText = `Joined ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    document.getElementById('profile-name').textContent = name;
    document.getElementById('profile-handle').textContent = handle;
    document.getElementById('profile-bio').innerHTML = `${bio} <span class="sparkle">&#10022;</span>`;
    document.getElementById('profile-location').textContent = location;
    document.getElementById('profile-joined').textContent = joinedText;
    document.getElementById('about-text').textContent = bio;
    document.getElementById('create-post-name').textContent = name.split(' ')[0] || name;

    const websiteEl = document.getElementById('profile-website');
    if (websiteEl) {
        if (website) {
            websiteEl.textContent = website.replace(/^https?:\/\//, '').replace(/\/$/, '');
            websiteEl.href = website;
            websiteEl.style.display = '';
        } else {
            websiteEl.style.display = 'none';
        }
    }

    const verifiedEl = document.getElementById('profile-verified');
    if (verifiedEl) {
        verifiedEl.style.display = userProfile.verified ? '' : 'none';
    }

    const bannerImg = document.getElementById('banner-img');
    if (bannerImg) bannerImg.src = banner;

    // Avatar
    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl && avatar) {
        let img = avatarEl.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            img.alt = name;
            avatarEl.appendChild(img);
        }
        img.src = avatar;
        avatarEl.classList.add('has-image');
    }

    // Create post avatar
    const createPostAvatar = document.getElementById('create-post-avatar');
    if (createPostAvatar && avatar) {
        createPostAvatar.src = avatar;
    }

    // Tags
    renderTags(userProfile.tags || ['Astronomy', 'Web Developer', 'AI Enthusiast', 'Problem Solver']);

    lucide.createIcons();
}

function renderTags(tags) {
    const container = document.getElementById('profile-tags');
    const tagConfigs = {
        'Astronomy': { class: 'astronomy', icon: 'atom' },
        'Web Developer': { class: 'developer', icon: 'code-2' },
        'AI Enthusiast': { class: 'ai', icon: 'brain' },
        'Problem Solver': { class: 'solver', icon: 'puzzle' },
        'Designer': { class: 'developer', icon: 'paintbrush' },
        'Scientist': { class: 'astronomy', icon: 'flask-conical' },
    };

    container.innerHTML = tags.map(tag => {
        const config = tagConfigs[tag] || { class: 'astronomy', icon: 'star' };
        return `<span class="tag ${config.class}"><i data-lucide="${config.icon}" class="tag-icon"></i> ${tag}</span>`;
    }).join('');
    lucide.createIcons();
}

// ===== PROFILE STATS =====
function loadProfileStats() {
    const stats = {
        posts: 42,
        communities: 8,
        resources: 15,
        reputation: 1280,
        followers: 356,
        following: 128
    };

    animateNumber(document.getElementById('stat-posts-count'), stats.posts, 1000);
    animateNumber(document.getElementById('stat-communities-count'), stats.communities, 1000);
    animateNumber(document.getElementById('stat-resources-count'), stats.resources, 1000);
    animateNumber(document.getElementById('stat-followers-count'), stats.followers, 1000);
    animateNumber(document.getElementById('stat-following-count'), stats.following, 1000);
}

// ===== SKILLS ANIMATION =====
function animateSkills() {
    const skillFills = document.querySelectorAll('.skill-fill');
    skillFills.forEach(fill => {
        const width = fill.dataset.width || '0';
        fill.style.width = '0%';
        setTimeout(() => {
            fill.style.width = width + '%';
        }, 100);
    });
}

// ===== ACHIEVEMENTS =====
function loadAchievements() {
    const achievements = [
        { name: 'First Steps', desc: 'Joined CosmoHub', icon: 'rocket', iconClass: 'purple', unlocked: true },
        { name: 'Contributor', desc: 'Made 10 posts', icon: 'pen-tool', iconClass: 'cyan', unlocked: true },
        { name: 'Rising Star', desc: '100 reputation', icon: 'star', iconClass: 'gold', unlocked: true },
        { name: 'Librarian', desc: 'Shared 5 resources', icon: 'book-open', iconClass: 'green', unlocked: true },
        { name: 'Community Lead', desc: 'Created a community', icon: 'users', iconClass: 'purple', unlocked: false },
        { name: 'Influencer', desc: '1K followers', icon: 'trending-up', iconClass: 'gold', unlocked: false },
        { name: 'Event Host', desc: 'Hosted an event', icon: 'calendar', iconClass: 'cyan', unlocked: false },
        { name: 'Top Contributor', desc: 'Top 10 monthly', icon: 'award', iconClass: 'gold', unlocked: false },
    ];

    const container = document.getElementById('achievements-grid');
    container.innerHTML = achievements.map((ach, i) => `
        <div class="achievement-item ${ach.unlocked ? '' : 'locked'}" style="animation-delay: ${i * 0.05}s" title="${ach.unlocked ? ach.desc : 'Locked: ' + ach.desc}">
            <div class="achievement-icon-wrap ${ach.iconClass}">
                <i data-lucide="${ach.icon}"></i>
            </div>
            <div class="achievement-name">${ach.name}</div>
            <div class="achievement-desc">${ach.desc}</div>
        </div>
    `).join('');
    lucide.createIcons();
}

// ===== ACTIVITY =====
function loadActivity() {
    const activities = [
        {
            icon: 'message-circle',
            iconClass: 'purple',
            title: 'Replied in the discussion "Best resources to learn Deep Learning?"',
            meta: 'in AI & Machine Learning',
            time: '2h ago'
        },
        {
            icon: 'file-text',
            iconClass: 'blue',
            title: 'Uploaded a new resource "Python Data Science Handbook.pdf"',
            meta: 'in Galaxy Library',
            time: '5h ago'
        },
        {
            icon: 'users',
            iconClass: 'green',
            title: 'Joined the community "Space Enthusiasts"',
            meta: '',
            time: '1d ago'
        },
        {
            icon: 'calendar',
            iconClass: 'pink',
            title: 'Attended event "Web Development Workshop"',
            meta: 'in Cosmic Calendar',
            time: '2d ago'
        },
        {
            icon: 'megaphone',
            iconClass: 'orange',
            title: 'Created a new post in "Study Hub" community',
            meta: '',
            time: '3d ago'
        }
    ];

    const container = document.getElementById('activity-feed');
    container.innerHTML = activities.map((act, i) => `
        <div class="activity-item" style="animation-delay: ${i * 0.05}s">
            <div class="activity-icon-wrap ${act.iconClass}">
                <i data-lucide="${act.icon}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-title">${act.title}</div>
                ${act.meta ? `<div class="activity-meta">${act.meta}</div>` : ''}
                <div class="activity-time">${act.time}</div>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

// ===== POSTS =====
function loadPosts() {
    const posts = [
        {
            title: 'Getting Started with Astrophysics: A Beginners Guide',
            excerpt: 'Astrophysics can seem daunting at first, but with the right resources and mindset, anyone can begin their journey into understanding the cosmos. In this post, I\'ll share my personal roadmap for getting started with astrophysics as a complete beginner.',
            image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=400&fit=crop',
            likes: 124,
            comments: 18,
            time: '3 days ago',
            liked: false
        },
        {
            title: 'Building a Real-time Chat App with Supabase',
            excerpt: 'In this tutorial, we\'ll walk through building a real-time chat application using Supabase, React, and WebSockets. Let\'s dive into the architecture, database schema, and implementation details.',
            image: null,
            likes: 89,
            comments: 12,
            time: '1 week ago',
            liked: true
        },
        {
            title: 'My Top 5 Resources for Learning Machine Learning',
            excerpt: 'After spending months learning ML, here are the resources that helped me the most. From courses to books to communities, this comprehensive list will get you started on the right foot.',
            image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
            likes: 256,
            comments: 34,
            time: '2 weeks ago',
            liked: false
        }
    ];

    const grid = document.getElementById('posts-feed');
    grid.innerHTML = posts.map((post, i) => `
        <div class="post-card" style="animation-delay: ${i * 0.1}s" data-post-id="${i}">
            <div class="post-header-row">
                <img src="${userProfile?.avatar || ''}" alt="" class="post-avatar" onerror="this.style.display='none'">
                <div class="post-author-info">
                    <div class="post-author-name">${userProfile?.name || 'User'}</div>
                    <div class="post-time">${post.time}</div>
                </div>
            </div>
            <div class="post-title">${post.title}</div>
            <div class="post-excerpt">${post.excerpt}</div>
            ${post.image ? `<img src="${post.image}" alt="" class="post-image" loading="lazy">` : ''}
            <div class="post-footer">
                <div class="post-action ${post.liked ? 'liked' : ''}" onclick="toggleLike(this, ${post.likes})">
                    <i data-lucide="heart"></i>
                    <span class="like-count">${post.likes}</span>
                </div>
                <div class="post-action">
                    <i data-lucide="message-circle"></i>
                    <span>${post.comments}</span>
                </div>
                <div class="post-action">
                    <i data-lucide="share-2"></i>
                    <span>Share</span>
                </div>
                <div class="post-action">
                    <i data-lucide="bookmark"></i>
                    <span>Save</span>
                </div>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function toggleLike(el, initialCount) {
    const isLiked = el.classList.contains('liked');
    const countEl = el.querySelector('.like-count');
    if (isLiked) {
        el.classList.remove('liked');
        countEl.textContent = initialCount;
    } else {
        el.classList.add('liked');
        countEl.textContent = initialCount + 1;
        el.style.transform = 'scale(1.2)';
        setTimeout(() => el.style.transform = '', 200);
    }
}

// ===== RESOURCES =====
function loadResources() {
    const resources = [
        { name: 'Python Data Science Handbook.pdf', type: 'pdf', size: '12.4 MB', date: '2 days ago' },
        { name: 'React Patterns Cheatsheet.docx', type: 'doc', size: '1.2 MB', date: '1 week ago' },
        { name: 'Galaxy Wallpaper Collection.zip', type: 'zip', size: '45.8 MB', date: '2 weeks ago' },
        { name: 'ML Model Training Script.py', type: 'code', size: '24 KB', date: '3 weeks ago' },
        { name: 'Nebula Photography Set.jpg', type: 'img', size: '8.6 MB', date: '1 month ago' },
    ];

    const typeIcons = {
        pdf: 'file-text',
        doc: 'file-text',
        zip: 'archive',
        code: 'code-2',
        img: 'image'
    };

    const list = document.getElementById('resources-feed');
    list.innerHTML = resources.map((res, i) => `
        <div class="resource-card" style="animation-delay: ${i * 0.05}s">
            <div class="resource-icon-wrap ${res.type}">
                <i data-lucide="${typeIcons[res.type] || 'file'}"></i>
            </div>
            <div class="resource-info">
                <div class="resource-name">${res.name}</div>
                <div class="resource-meta">${res.size} &middot; ${res.date}</div>
            </div>
            <button class="resource-download" title="Download" onclick="showToast('Download', 'Starting download...', 'info', 2000)">
                <i data-lucide="download"></i>
            </button>
        </div>
    `).join('');
    lucide.createIcons();
}

// ===== FEED NAVIGATION =====
function initFeedNav() {
    const buttons = document.querySelectorAll('.feed-nav-btn');
    const sections = {
        'all': ['feed-about', 'feed-create-post', 'feed-posts', 'feed-activity', 'feed-resources'],
        'posts': ['feed-create-post', 'feed-posts'],
        'activity': ['feed-activity'],
        'resources': ['feed-resources'],
        'about': ['feed-about']
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            currentFeedFilter = filter;

            buttons.forEach(b => b.classList.toggle('active', b === btn));

            // Hide all sections first
            document.querySelectorAll('.feed-section, .create-post-card').forEach(el => {
                el.style.display = 'none';
            });

            // Show relevant sections
            const toShow = sections[filter] || [];
            toShow.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = '';
            });

            // Animate skills when about is shown
            if (filter === 'all' || filter === 'about') {
                setTimeout(animateSkills, 200);
            }
        });
    });
}

// ===== ONLINE COUNT =====
async function loadOnlineCount() {
    const el = document.getElementById('online-count');
    if (!el) return;
    try {
        if (supabaseReady && sb) {
            const { count, error } = await sb
                .from('users')
                .select('*', { count: 'exact', head: true });
            if (!error && count) {
                animateNumber(el, count);
                return;
            }
        }
    } catch (err) {}
    animateNumber(el, DEFAULT_ONLINE.count);
}

// ===== BADGES =====
function loadBadges(notifications, messages) {
    const notifBadge = document.getElementById('notif-badge');
    const msgBadge = document.getElementById('msg-badge');
    if (notifBadge) animateNumber(notifBadge, notifications !== undefined ? notifications : DEFAULT_BADGES.notifications);
    if (msgBadge) animateNumber(msgBadge, messages !== undefined ? messages : DEFAULT_BADGES.messages);
}

// ===== AVATAR & BANNER UPLOAD =====
function initImageUploads() {
    // ===== AVATAR =====
    const avatarWrapper = document.getElementById('avatar-drop-zone');
    const avatarInput = document.getElementById('avatar-upload');
    const avatarContainer = document.getElementById('profile-avatar');

    if (avatarWrapper && avatarInput) {
        // Click on the avatar wrapper (not the banner) triggers avatar upload
        avatarWrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            avatarInput.click();
        });

        avatarWrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            avatarWrapper.style.transform = 'scale(1.05)';
        });
        avatarWrapper.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            avatarWrapper.style.transform = '';
        });
        avatarWrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            avatarWrapper.style.transform = '';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImageUpload(file, 'avatar');
            }
        });

        avatarInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                handleImageUpload(e.target.files[0], 'avatar');
            }
        });
    }

    // ===== BANNER =====
    const bannerWrap = document.getElementById('banner-drop-zone');
    const bannerInput = document.getElementById('banner-upload');

    if (bannerWrap && bannerInput) {
        // Click on banner overlay triggers banner upload
        const bannerOverlay = bannerWrap.querySelector('.banner-upload-overlay');
        if (bannerOverlay) {
            bannerOverlay.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                bannerInput.click();
            });
        }

        // Also allow clicking on the banner image itself to change it
        bannerWrap.addEventListener('click', (e) => {
            // Only trigger if not clicking on avatar area
            if (!e.target.closest('#avatar-drop-zone')) {
                bannerInput.click();
            }
        });

        bannerWrap.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            bannerWrap.style.opacity = '0.8';
        });
        bannerWrap.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            bannerWrap.style.opacity = '';
        });
        bannerWrap.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            bannerWrap.style.opacity = '';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImageUpload(file, 'banner');
            }
        });

        bannerInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                handleImageUpload(e.target.files[0], 'banner');
            }
        });
    }
}

function handleImageUpload(file, type) {
    if (!file.type.startsWith('image/')) {
        showToast('Error', 'Please upload an image file', 'error');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showToast('Error', 'Image must be under 5MB', 'error');
        return;
    }
    pendingImageFile = file;
    pendingImageType = type;
    CropModal.open(file, () => applyImageUpload());
}

function applyImageUpload() {
    if (!pendingImageFile || !pendingImageType) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        if (pendingImageType === 'avatar') {
            const avatarEl = document.getElementById('profile-avatar');
            let img = avatarEl.querySelector('img');
            if (!img) {
                img = document.createElement('img');
                img.alt = userProfile?.name || 'User';
                avatarEl.appendChild(img);
            }
            img.src = e.target.result;
            avatarEl.classList.add('has-image');
            // Also update create post avatar
            const createPostAvatar = document.getElementById('create-post-avatar');
            if (createPostAvatar) createPostAvatar.src = e.target.result;
            if (userProfile) userProfile.avatar = e.target.result;
            showToast('Success', 'Avatar updated!', 'success');
        } else {
            const bannerImg = document.getElementById('banner-img');
            bannerImg.src = e.target.result;
            if (userProfile) userProfile.banner = e.target.result;
            showToast('Success', 'Banner updated!', 'success');
        }
    };
    reader.readAsDataURL(pendingImageFile);
}

// ===== NEW POST MODAL =====
function openNewPostModal() {
    const firstName = userProfile?.name?.split(' ')[0] || 'Alex';
    const content = `
        <div class="new-post-form">
            <div class="form-group">
                <textarea id="new-post-text" rows="4" placeholder="What's on your mind, ${firstName}?"></textarea>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="cp-btn" style="flex:0 0 auto;" onclick="showToast('Photo','Opening photo upload...','info',2000)"><i data-lucide="image"></i> Photo</button>
                <button class="cp-btn" style="flex:0 0 auto;" onclick="showToast('Resource','Opening resource upload...','info',2000)"><i data-lucide="paperclip"></i> Resource</button>
                <button class="cp-btn" style="flex:0 0 auto;" onclick="showToast('Event','Opening event creator...','info',2000)"><i data-lucide="calendar"></i> Event</button>
            </div>
        </div>
    `;
    Modal.open('Create Post', content, {
        confirmText: 'Post',
        onConfirm: () => {
            const text = document.getElementById('new-post-text').value.trim();
            if (text) {
                showToast('Posted!', 'Your post has been published.', 'success');
            } else {
                showToast('Error', 'Post cannot be empty', 'error');
            }
        }
    });
}

// ===== STATUS BUTTON =====
function initStatusButton() {
    const btn = document.getElementById('status-btn');
    if (!btn) return;

    function applyStatus(status) {
        const dot = btn.querySelector('.status-dot');
        const text = btn.querySelector('.status-text');
        const onlineDot = document.querySelector('.online-status');
        const label = status === 'dnd' ? 'Do Not Disturb' : status.charAt(0).toUpperCase() + status.slice(1);

        dot.className = 'status-dot ' + status;
        text.textContent = label;

        if (onlineDot) {
            if (status === 'online') {
                onlineDot.style.background = 'var(--accent-green)';
                onlineDot.style.boxShadow = '0 0 8px rgba(34,197,94,0.5)';
            } else if (status === 'invisible') {
                onlineDot.style.background = 'var(--text-muted)';
                onlineDot.style.boxShadow = 'none';
            } else if (status === 'dnd') {
                onlineDot.style.background = 'var(--accent-red)';
                onlineDot.style.boxShadow = '0 0 8px rgba(239,68,68,0.5)';
            }
        }

        showToast('Status', `Status set to ${label}`, 'success', 2000);
    }

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const current = btn.querySelector('.status-dot').classList.contains('online') ? 'online'
            : btn.querySelector('.status-dot').classList.contains('dnd') ? 'dnd'
            : 'invisible';

        const content = `
            <div class="status-picker">
                <button class="status-picker-option" data-status="online">
                    <span class="status-picker-dot online"></span>
                    <span>Online</span>
                </button>
                <button class="status-picker-option" data-status="invisible">
                    <span class="status-picker-dot invisible"></span>
                    <span>Invisible</span>
                </button>
                <button class="status-picker-option" data-status="dnd">
                    <span class="status-picker-dot dnd"></span>
                    <span>Do Not Disturb</span>
                </button>
            </div>
        `;

        Modal.open('Set Status', content, {
            showFooter: false,
            onConfirm: null,
            onCancel: null
        });

        // Attach click handlers after modal is open
        setTimeout(() => {
            document.querySelectorAll('.status-picker-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    applyStatus(opt.dataset.status);
                    Modal.close();
                });
            });
        }, 50);
    });
}

// ===== EDIT PROFILE MODAL =====
function initEditProfile() {
    const btn = document.getElementById('edit-profile-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const content = `
            <form class="settings-form" id="edit-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="edit-name" value="${userProfile?.name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Handle</label>
                        <div class="input-with-prefix">
                            <span class="input-prefix">@</span>
                            <input type="text" id="edit-handle" value="${(userProfile?.handle || '').replace('@', '') || userProfile?.username || ''}">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Bio</label>
                    <textarea id="edit-bio" rows="3">${userProfile?.bio || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" id="edit-location" value="${userProfile?.location || ''}">
                    </div>
                    <div class="form-group">
                        <label>Website</label>
                        <input type="url" id="edit-website" value="${userProfile?.website || ''}" placeholder="https://">
                    </div>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select id="edit-role" style="padding:8px 12px;background:rgba(255,255,255,0.03);border:1px solid var(--border-color);border-radius:var(--radius-md);color:var(--text-primary);font-size:12px;font-family:inherit;">
                        <option value="Explorer" ${userProfile?.role === 'Explorer' ? 'selected' : ''}>Explorer</option>
                        <option value="Navigator" ${userProfile?.role === 'Navigator' ? 'selected' : ''}>Navigator</option>
                        <option value="Commander" ${userProfile?.role === 'Commander' ? 'selected' : ''}>Commander</option>
                        <option value="Scientist" ${userProfile?.role === 'Scientist' ? 'selected' : ''}>Scientist</option>
                    </select>
                </div>
            </form>
        `;
        Modal.open('Edit Profile', content, {
            confirmText: 'Save Profile',
            onConfirm: async () => {
                const updates = {
                    name: document.getElementById('edit-name').value,
                    handle: '@' + document.getElementById('edit-handle').value.replace('@', ''),
                    bio: document.getElementById('edit-bio').value,
                    location: document.getElementById('edit-location').value,
                    website: document.getElementById('edit-website').value,
                    role: document.getElementById('edit-role').value,
                    updated_at: new Date().toISOString()
                };
                try {
                    if (supabaseReady && sb && userProfile?.id && userProfile.id !== 'demo-user-id') {
                        const { error } = await sb.from('users').update(updates).eq('id', userProfile.id);
                        if (error) throw error;
                    }
                    Object.assign(userProfile, updates);
                    renderProfile();
                    showToast('Success', 'Profile updated successfully!', 'success');
                } catch (err) {
                    showToast('Error', 'Failed to update profile', 'error');
                }
            }
        });
    });
}

// ===== SHARE PROFILE =====
function initShareProfile() {
    const btn = document.getElementById('share-profile-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const url = window.location.href;
        const handle = userProfile?.handle || '@alexmercer';
        const text = `Check out ${userProfile?.name || 'my'} profile on CosmoHub ${handle}`;

        if (navigator.share) {
            try {
                await navigator.share({ title: 'CosmoHub Profile', text, url });
            } catch (err) {
                // User cancelled
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                showToast('Copied!', 'Profile link copied to clipboard', 'success');
            } catch (err) {
                showToast('Share', text + ' — ' + url, 'info', 5000);
            }
        }
    });
}

// ===== COPY HANDLE =====
function initCopyHandle() {
    const handleEl = document.getElementById('profile-handle');
    if (!handleEl) return;
    handleEl.addEventListener('click', async () => {
        const handle = handleEl.textContent;
        try {
            await navigator.clipboard.writeText(handle);
            showToast('Copied!', `${handle} copied to clipboard`, 'success', 2000);
        } catch (err) {
            showToast('Handle', handle, 'info', 2000);
        }
    });
    handleEl.style.cursor = 'pointer';
    handleEl.title = 'Click to copy handle';
}

// ===== QUICK ACTIONS =====
function initQuickActions() {
    const actions = {
        'qa-new-post': () => openNewPostModal(),
        'qa-upload-resource': () => window.location.href = 'GalaxyLibraryUI.html',
        'qa-create-event': () => window.location.href = 'CosmicCalendarUI.html',
        'qa-invite': () => {
            const link = 'https://cosmohub.dev/invite/alexmercer';
            navigator.clipboard?.writeText(link).then(() => {
                showToast('Invite Link', 'Copied to clipboard!', 'success');
            }).catch(() => {
                showToast('Invite', link, 'info', 4000);
            });
        },
        'qa-settings': () => { window.location.href = 'SettingsUI.html'; }
    };

    Object.entries(actions).forEach(([id, handler]) => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', handler);
    });

    // Create post trigger
    const createPostTrigger = document.getElementById('create-post-trigger');
    if (createPostTrigger) {
        createPostTrigger.addEventListener('click', () => openNewPostModal());
    }

    // Create post bottom buttons
    const cpPhoto = document.getElementById('cp-photo');
    const cpResource = document.getElementById('cp-resource');
    const cpEvent = document.getElementById('cp-event');

    if (cpPhoto) cpPhoto.addEventListener('click', () => showToast('Photo', 'Opening photo upload...', 'info', 2000));
    if (cpResource) cpResource.addEventListener('click', () => showToast('Resource', 'Opening resource upload...', 'info', 2000));
    if (cpEvent) cpEvent.addEventListener('click', () => showToast('Event', 'Opening event creator...', 'info', 2000));
}

// ===== NOTIFICATION & MESSAGE BUTTONS =====
function initActionButtons() {
    const notifBtn = document.getElementById('notification-btn');
    const msgBtn = document.getElementById('message-btn');

    if (notifBtn) {
        notifBtn.addEventListener('click', () => {
            showToast('Notifications', 'You have no new notifications', 'info', 3000);
        });
    }

    if (msgBtn) {
        msgBtn.addEventListener('click', () => {
            showToast('Messages', 'No unread messages', 'info', 3000);
        });
    }
}

// ===== NAVIGATION =====
function initNavigation() {
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
}

// ===== SUPABASE USER SYNC =====
async function syncUserFromSupabase() {
    const saved = localStorage.getItem('cosmohub_user');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            currentUser = { ...DEFAULT_USER, ...parsed };
        } catch (e) { }
    }

    if (!supabaseReady || !sb) return;

    try {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await sb
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error || !profile) {
            console.warn('[CosmoHub Profile] Profile load failed:', error?.message);
            return;
        }

        currentUser = {
            id: profile.id,
            name: profile.name || profile.username || 'Explorer',
            username: profile.username || profile.name || 'explorer',
            handle: profile.handle || '@' + (profile.username || 'explorer'),
            role: profile.role || 'Member',
            avatar_url: profile.avatar || ''
        };

        localStorage.setItem('cosmohub_user', JSON.stringify(currentUser));
        console.log('[CosmoHub Profile] User synced:', currentUser.username);
    } catch (err) {
        console.warn('[CosmoHub Profile] User sync error:', err.message);
    }
}

// ===== REALTIME SUBSCRIPTIONS =====
function setupRealtimeSubscriptions() {
    if (!supabaseReady || !sb) return;

    if (userProfile?.id) {
        sb.channel('profile_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'users', filter: `id=eq.${userProfile.id}` },
                (payload) => {
                    console.log('Profile updated:', payload);
                    userProfile = { ...userProfile, ...payload.new };
                    renderProfile();
                }
            )
            .subscribe();
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();

    supabaseReady = initSupabase();

    initStarfield();
    initSidebar();
    Modal.init();
    CropModal.init();
    initSearch();
    initKeyboardShortcuts();
    initFeedNav();
    initEditProfile();
    initStatusButton();
    initCopyHandle();
    initImageUploads();
    initQuickActions();
    initActionButtons();
    initNavigation();

    // Button click animations
    document.querySelectorAll('.icon-btn, .view-all-btn, .feed-nav-btn, .post-action, .resource-download, .qa-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.92)';
            setTimeout(() => this.style.transform = '', 150);
        });
    });

    // Load data
    syncUserFromSupabase().then(() => {
        loadProfile();
        loadActivity();
        loadPosts();
        loadResources();
        loadOnlineCount();
        loadBadges();
        loadAchievements();
        setTimeout(animateSkills, 500);
    });

    setTimeout(setupRealtimeSubscriptions, 1000);

    console.log('%c🚀 CosmoHub Profile Feed Edition', 'color: #a855f7; font-size: 16px; font-weight: bold;');
    console.log('%cFeatures: Facebook-style feed, Sticky nav, Quick Actions, Supabase Sync, Edit Profile, Realtime, Uploads', 'color: #22d3ee; font-size: 11px;');
});

// Expose to window
window.cosmohub = { supabase: sb, userProfile, loadProfile, toggleLike };