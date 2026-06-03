// ===== CosmoHub Communities - Enhanced Edition =====

const API_URL = window.location.origin;

// ===== SUPABASE SETUP =====
const SUPABASE_URL = 'https://jizbbohomkfjijnkbaie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppemJib2hvbWtmamlqbmtiYWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDE5MzEsImV4cCI6MjA5NTg3NzkzMX0.jhaoyiLJ37zcnFQ6MGqevCEh4r8zfki89UnFYYq62Po';
let sb = null;

function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[CosmoHub Communities] Supabase client initialized');
        return true;
    }
    console.warn('[CosmoHub Communities] Supabase library not loaded');
    return false;
}

// ===== DEFAULT DATA =====
const DEFAULT_STATS = { communities: 128, members: 5400, discussions: 342, events: 98 };
const DEFAULT_COMMUNITIES = [
    { id: '1', name: 'Physics Explorers', description: 'Discuss theories, share resources, and explore the universe of physics.', member_count: 1200, category: 'science', icon: 'atom', color: '#a78bfa', joined: false },
    { id: '2', name: 'Code Galaxy', description: 'A community for coders to learn, build, and grow together.', member_count: 2400, category: 'technology', icon: 'code', color: '#60a5fa', joined: true },
    { id: '3', name: 'Study Hub', description: 'Share notes, solve doubts, and help each other succeed.', member_count: 3100, category: 'academic', icon: 'book', color: '#34d399', joined: true },
    { id: '4', name: 'Design Universe', description: 'Where creativity meets inspiration. Share your art and get feedback.', member_count: 856, category: 'arts', icon: 'rocket', color: '#f472b6', joined: false },
    { id: '5', name: 'Startup Space', description: 'Connect, collaborate, and build the next big idea together.', member_count: 1100, category: 'business', icon: 'rocket', color: '#fbbf24', joined: true }
];
const DEFAULT_DISCUSSIONS = [
    { id: '1', title: 'Best resources to learn Quantum Mechanics?', community_name: 'Physics Explorers', author: 'Mira Solis', time: '24m ago', replies: 12, icon: 'atom', color: '#a78bfa' },
    { id: '2', title: "React vs Vue in 2025 - What's your pick?", community_name: 'Code Galaxy', author: 'Ethan Blake', time: '1h ago', replies: 18, icon: 'code', color: '#60a5fa' },
    { id: '3', title: 'How to stay productive during exams?', community_name: 'Study Hub', author: 'Nova Carter', time: '2h ago', replies: 23, icon: 'book', color: '#34d399' },
    { id: '4', title: 'Share your latest UI/UX design!', community_name: 'Design Universe', author: 'Kai Anderson', time: '3h ago', replies: 15, icon: 'rocket', color: '#f472b6' }
];
const DEFAULT_POPULAR = [
    { id: '6', name: 'AI & Machine Learning', member_count: 4800, icon: 'brain', color: '#a78bfa' },
    { id: '7', name: 'Astronomy Club', member_count: 2700, icon: 'star', color: '#60a5fa' },
    { id: '8', name: 'Math Wizards', member_count: 1900, icon: 'sigma', color: '#34d399' },
    { id: '9', name: 'Cyber Security Hub', member_count: 1600, icon: 'shield', color: '#f472b6' },
    { id: '10', name: 'Robotics Lab', member_count: 1300, icon: 'cpu', color: '#fbbf24' }
];
const DEFAULT_ONLINE = { count: 1248 };
const DEFAULT_BADGES = { notifications: 5, messages: 3 };

// ===== LUCIDE ICONS FOR PICKER =====
const LUCIDE_ICONS = [
    'users', 'atom', 'code', 'book', 'rocket', 'brain', 'star', 'sigma',
    'shield', 'cpu', 'zap', 'heart', 'globe', 'flame', 'gamepad-2', 'music',
    'camera', 'pen-tool', 'briefcase', 'graduation-cap', 'microscope', 'palette',
    'terminal', 'wifi', 'cloud', 'database', 'lock', 'key', 'compass', 'map',
    'sun', 'moon', 'sparkles', 'crown', 'trophy', 'medal', 'flag', 'target',
    'anchor', 'anchor', 'plane', 'car', 'bike', 'dumbbell', 'coffee', 'pizza',
    'apple', 'leaf', 'flower', 'tree-pine', 'mountain', 'waves', 'fish',
    'cat', 'dog', 'bird', 'bug', 'ghost', 'skull', 'alien', 'rocket',
    'satellite', 'orbit', 'telescope', 'planet', 'infinity', 'dna', 'atom',
    'atom', 'beaker', 'flask-conical', 'pill', 'syringe', 'stethoscope',
    'heart-pulse', 'activity', 'bar-chart', 'pie-chart', 'trending-up',
    'dollar-sign', 'bitcoin', 'credit-card', 'wallet', 'shopping-bag',
    'shopping-cart', 'package', 'truck', 'mail', 'phone', 'message-circle',
    'message-square', 'send', 'inbox', 'archive', 'trash', 'folder',
    'file-text', 'file-code', 'image', 'video', 'film', 'tv', 'radio',
    'headphones', 'speaker', 'mic', 'mic-off', 'volume-2', 'volume-x',
    'bell', 'bell-off', 'calendar', 'calendar-check', 'calendar-clock',
    'clock', 'timer', 'hourglass', 'watch', 'alarm-clock', 'sunrise',
    'sunset', 'umbrella', 'thermometer', 'wind', 'cloud-rain', 'cloud-snow',
    'cloud-lightning', 'tornado', 'cloud-fog', 'eye', 'eye-off', 'glasses',
    'scan', 'scan-line', 'fingerprint', 'face-id', 'scan-face', 'user',
    'user-check', 'user-plus', 'user-minus', 'user-x', 'users-round',
    'group', 'contact', 'contact-2', 'id-card', 'badge', 'passport',
    'ticket', 'bookmark', 'book-open', 'book-marked', 'library', 'scroll',
    'newspaper', 'panel-top', 'layout', 'grid', 'grid-3x3', 'columns',
    'rows', 'table', 'list', 'list-checks', 'check-square', 'square',
    'circle', 'triangle', 'hexagon', 'octagon', 'star-off', 'heart-off',
    'thumbs-up', 'thumbs-down', 'smile', 'frown', 'meh', 'laugh',
    'angry', 'annoyed', 'brain-circuit', 'bot', 'bot-message-square',
    'cpu', 'hard-drive', 'server', 'network', 'plug', 'battery',
    'battery-charging', 'battery-full', 'battery-low', 'battery-medium',
    'battery-warning', 'power', 'power-off', 'flashlight', 'lamp',
    'lamp-desk', 'lamp-floor', 'lamp-wall', 'lightbulb', 'lightbulb-off',
    'candlestick-chart', 'line-chart', 'area-chart', 'scatter-chart',
    'radar', 'gauge', 'gauge-circle', 'gauge-minus', 'gauge-plus',
    'settings', 'settings-2', 'sliders', 'sliders-horizontal',
    'wrench', 'hammer', 'screwdriver', 'axe', 'sword', 'shield',
    'shield-check', 'shield-alert', 'shield-question', 'shield-off',
    'shield-half', 'swords', 'bomb', 'crosshair', 'focus', 'scan-eye',
    'scan-search', 'search', 'search-x', 'search-slash', 'zoom-in',
    'zoom-out', 'maximize', 'minimize', 'maximize-2', 'minimize-2',
    'move', 'move-diagonal', 'move-horizontal', 'move-vertical',
    'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'arrow-up-left',
    'arrow-up-right', 'arrow-down-left', 'arrow-down-right', 'chevron-up',
    'chevron-down', 'chevron-left', 'chevron-right', 'chevrons-up',
    'chevrons-down', 'chevrons-left', 'chevrons-right', 'corner-up-left',
    'corner-up-right', 'corner-down-left', 'corner-down-right',
    'refresh-cw', 'refresh-ccw', 'rotate-cw', 'rotate-ccw', 'repeat',
    'repeat-1', 'shuffle', 'arrow-left-right', 'arrow-up-down',
    'git-branch', 'git-commit', 'git-merge', 'git-pull-request',
    'git-pull-request-closed', 'git-pull-request-draft', 'github',
    'gitlab', 'bitbucket', 'code-2', 'codepen', 'codesandbox',
    'terminal-square', 'command', 'figma', 'framer', 'trello',
    'kanban', 'kanban-square', 'layout-template', 'layout-grid',
    'layout-list', 'layout-dashboard', 'panels-top-left', 'sidebar',
    'sidebar-close', 'sidebar-open', 'panel-left', 'panel-right',
    'panel-top', 'panel-bottom', 'panel-left-close', 'panel-left-open',
    'panel-right-close', 'panel-right-open', 'panel-top-close',
    'panel-top-open', 'panel-bottom-close', 'panel-bottom-open',
    'split', 'split-square-horizontal', 'split-square-vertical',
    'grip-vertical', 'grip-horizontal', 'grip', 'grab', 'hand',
    'hand-metal', 'pointer', 'mouse', 'mouse-pointer-2', 'mouse-pointer-click',
    'navigation', 'navigation-2', 'navigation-off', 'compass', 'map-pin',
    'map-pinned', 'pin', 'pin-off', 'locate', 'locate-fixed',
    'locate-off', 'radar', 'radius', 'orbit', 'satellite-dish',
    'rocket', 'plane', 'plane-takeoff', 'plane-landing', 'helicopter',
    'sailboat', 'ship', 'anchor', 'life-buoy', 'truck', 'bus',
    'car', 'car-front', 'car-taxi-front', 'bike', 'train-front',
    'train-track', 'tram-front', 'container', 'crane', 'forklift',
    'dices', 'dice-1', 'dice-2', 'dice-3', 'dice-4', 'dice-5',
    'dice-6', 'gamepad-2', 'joystick', 'puzzle', 'toy-brick',
    'blocks', 'shapes', 'shape', 'triangle', 'circle', 'square',
    'pentagon', 'hexagon', 'octagon', 'star', 'heart', 'diamond',
    'club', 'spade', 'crown', 'gem', 'gem-2', 'coins', 'banknote',
    'receipt', 'receipt-text', 'receipt-pound-sterling', 'receipt-euro',
    'receipt-japanese-yen', 'receipt-indian-rupee', 'receipt-russian-ruble',
    'receipt-cent', 'receipt-franc', 'receipt-cent', 'receipt-cent',
    'wallet', 'wallet-2', 'wallet-cards', 'credit-card', 'banknote',
    'landmark', 'piggy-bank', 'hand-coins', 'hand-heart', 'hand-helping',
    'hand-metal', 'hand-platter', 'handshake', 'heart-handshake',
    'award', 'badge', 'badge-check', 'badge-dollar-sign', 'badge-help',
    'badge-info', 'badge-minus', 'badge-plus', 'badge-percent',
    'badge-x', 'medal', 'trophy', 'crown', 'gem', 'diamond',
    'circle-dollar-sign', 'circle-user', 'circle-check', 'circle-x',
    'circle-plus', 'circle-minus', 'circle-alert', 'circle-pause',
    'circle-play', 'circle-stop', 'circle-dot', 'circle-equal',
    'circle-slash', 'circle-arrow-up', 'circle-arrow-down',
    'circle-arrow-left', 'circle-arrow-right', 'circle-chevron-up',
    'circle-chevron-down', 'circle-chevron-left', 'circle-chevron-right',
    'square-check', 'square-x', 'square-plus', 'square-minus',
    'square-pause', 'square-play', 'square-stop', 'square-dot',
    'square-equal', 'square-slash', 'square-arrow-up', 'square-arrow-down',
    'square-arrow-left', 'square-arrow-right', 'square-chevron-up',
    'square-chevron-down', 'square-chevron-left', 'square-chevron-right',
    'octagon-alert', 'octagon-x', 'octagon-minus', 'octagon-plus',
    'octagon-pause', 'octagon-play', 'octagon-stop', 'triangle-alert',
    'triangle-x', 'triangle-minus', 'triangle-plus', 'triangle-pause',
    'triangle-play', 'triangle-stop', 'diamond-alert', 'diamond-x',
    'diamond-minus', 'diamond-plus', 'diamond-pause', 'diamond-play',
    'diamond-stop', 'pentagon-alert', 'pentagon-x', 'pentagon-minus',
    'pentagon-plus', 'pentagon-pause', 'pentagon-play', 'pentagon-stop',
    'hexagon-alert', 'hexagon-x', 'hexagon-minus', 'hexagon-plus',
    'hexagon-pause', 'hexagon-play', 'hexagon-stop', 'star-alert',
    'star-x', 'star-minus', 'star-plus', 'star-pause', 'star-play',
    'star-stop', 'heart-alert', 'heart-x', 'heart-minus', 'heart-plus',
    'heart-pause', 'heart-play', 'heart-stop', 'moon-alert', 'moon-x',
    'moon-minus', 'moon-plus', 'moon-pause', 'moon-play', 'moon-stop',
    'sun-alert', 'sun-x', 'sun-minus', 'sun-plus', 'sun-pause',
    'sun-play', 'sun-stop', 'cloud-alert', 'cloud-x', 'cloud-minus',
    'cloud-plus', 'cloud-pause', 'cloud-play', 'cloud-stop', 'cloud-off',
    'cloud-download', 'cloud-upload', 'cloud-rain-wind', 'cloud-snow',
    'cloud-lightning', 'cloud-fog', 'cloud-hail', 'cloud-moon',
    'cloud-moon-rain', 'cloud-sun', 'cloud-sun-rain', 'cloud-drizzle',
    'thermometer-sun', 'thermometer-snowflake', 'thermometer-alert',
    'droplets', 'droplet', 'droplet-off', 'umbrella', 'umbrella-off',
    'wind', 'snowflake', 'tornado', 'cloud-lightning', 'haze',
    'fog', 'sun-dim', 'sun-medium', 'sun-moon', 'moon-star',
    'eclipse', 'aurora', 'rainbow', 'bolt', 'bolt-off', 'plug',
    'plug-2', 'plug-zap', 'battery', 'battery-charging', 'battery-full',
    'battery-low', 'battery-medium', 'battery-warning', 'power',
    'power-off', 'flashlight', 'lamp', 'lamp-desk', 'lamp-floor',
    'lamp-wall', 'lamp-ceiling', 'lightbulb', 'lightbulb-off',
    'candlestick-chart', 'line-chart', 'area-chart', 'scatter-chart',
    'radar', 'gauge', 'gauge-circle', 'gauge-minus', 'gauge-plus',
    'activity', 'pulse', 'heart-pulse', 'stethoscope', 'syringe',
    'pill', 'capsule', 'bandage', 'bone', 'brain', 'brain-circuit',
    'brain-cog', 'eye', 'eye-off', 'glasses', 'contact', 'contact-2',
    'scan', 'scan-line', 'scan-face', 'scan-eye', 'scan-search',
    'fingerprint', 'dna', 'atom', 'microscope', 'flask-conical',
    'flask-round', 'test-tube', 'test-tube-2', 'beaker', 'beaker-2',
    'graduation-cap', 'school', 'school-2', 'book', 'book-open',
    'book-open-check', 'book-marked', 'book-x', 'book-plus',
    'book-minus', 'library', 'scroll', 'scroll-text', 'file',
    'file-text', 'file-code', 'file-code-2', 'file-json', 'file-xml',
    'file-type', 'file-image', 'file-video', 'file-audio', 'file-music',
    'file-plus', 'file-minus', 'file-x', 'file-check', 'file-question',
    'file-warning', 'file-clock', 'file-heart', 'file-key', 'file-lock',
    'file-search', 'file-cog', 'file-pen', 'file-edit', 'file-diff',
    'file-stack', 'file-box', 'files', 'folder', 'folder-open',
    'folder-plus', 'folder-minus', 'folder-x', 'folder-check',
    'folder-heart', 'folder-key', 'folder-lock', 'folder-cog',
    'folder-pen', 'folder-edit', 'folder-git', 'folder-git-2',
    'folder-kanban', 'folder-root', 'folder-symlink', 'folder-tree',
    'folder-up', 'folder-down', 'folder-sync', 'folder-archive',
    'folder-clock', 'folder-search', 'folder-heart', 'folder-key-2',
    'hard-drive', 'hard-drive-download', 'hard-drive-upload',
    'server', 'server-cog', 'server-crash', 'server-off',
    'database', 'database-backup', 'database-zap', 'table',
    'table-2', 'table-properties', 'table-rows-split',
    'columns', 'columns-2', 'columns-3', 'columns-4', 'grid-2x2',
    'grid-3x3', 'grid-2x2-check', 'grid-2x2-x', 'grid-2x2-plus',
    'grid-2x2-minus', 'layout-grid', 'layout-list', 'layout-template',
    'layout-dashboard', 'layout-panel-left', 'layout-panel-top',
    'layout-panel-top-close', 'layout-panel-top-open', 'panels-top-left',
    'panel-left', 'panel-right', 'panel-top', 'panel-bottom',
    'panel-left-close', 'panel-left-open', 'panel-right-close',
    'panel-right-open', 'panel-top-close', 'panel-top-open',
    'panel-bottom-close', 'panel-bottom-open', 'sidebar',
    'sidebar-close', 'sidebar-open', 'sidebar-left',
    'sidebar-right', 'split', 'split-square-horizontal',
    'split-square-vertical', 'grip-vertical', 'grip-horizontal',
    'grip', 'grab', 'hand', 'hand-metal', 'pointer',
    'mouse-pointer-2', 'mouse-pointer-click', 'navigation',
    'navigation-2', 'navigation-off', 'compass', 'map',
    'map-pin', 'map-pinned', 'pin', 'pin-off', 'locate',
    'locate-fixed', 'locate-off', 'radar', 'radius', 'orbit'
];

const COLOR_SWATCHES = [
    '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9',
    '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16',
    '#eab308', '#f59e0b', '#f97316', '#ef4444', '#ec4899',
    '#f472b6', '#d946ef', '#a855f7'
];

const CATEGORY_COLORS = {
    academic: '#34d399',
    technology: '#60a5fa',
    science: '#a78bfa',
    arts: '#f472b6',
    business: '#fbbf24',
    gaming: '#ef4444',
    general: '#94a3b8'
};

const CATEGORY_ICONS = {
    academic: 'graduation-cap',
    technology: 'cpu',
    science: 'microscope',
    arts: 'palette',
    business: 'briefcase',
    gaming: 'gamepad-2',
    general: 'globe'
};

// ===== STATE =====
let currentTheme = localStorage.getItem('cosmohub-theme') || 'dark';
let sidebarCollapsed = localStorage.getItem('cosmohub-sidebar') === 'true';
let supabaseReady = false;
let currentUser = { name: 'Explorer', username: 'explorer', handle: '@explorer', role: 'Member' };
let currentTab = 'explore';
let currentCategory = 'all';
let searchQuery = '';
let communities = [];
let discussions = [];
let myCommunityIds = [];
let isLoading = false;

// ===== SAFE FETCH HELPER =====
function safeFetch(url, defaultData) {
    return fetch(url)
        .then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .catch(function(err) {
            console.warn('[CosmoHub] Failed to load ' + url + ':', err.message);
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
        stars.forEach(function(star) {
            star.alpha += star.twinkleSpeed;
            if (star.alpha > 1 || star.alpha < 0.2) star.twinkleSpeed = -star.twinkleSpeed;
            const opacity = Math.abs(star.alpha);
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (opacity * 0.6) + ')';
            ctx.fill();
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
        timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    update();
    setInterval(update, 1000);
}

// ===== SIDEBAR COLLAPSE =====
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const btn = document.getElementById('collapse-btn');
    if (!sidebar || !btn) return;
    if (sidebarCollapsed) sidebar.classList.add('collapsed');
    btn.addEventListener('click', function() {
        sidebarCollapsed = !sidebarCollapsed;
        sidebar.classList.toggle('collapsed', sidebarCollapsed);
        localStorage.setItem('cosmohub-sidebar', sidebarCollapsed);
    });
}

// ===== TOAST NOTIFICATIONS =====
function showToast(title, message, type, duration) {
    type = type || 'info';
    duration = duration || 4000;
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success: 'check-circle', error: 'x-circle', info: 'info', warning: 'alert-triangle' };
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<i data-lucide="' + (icons[type] || 'info') + '" class="toast-icon ' + type + '"></i>' +
        '<div class="toast-content"><div class="toast-title">' + title + '</div><div class="toast-message">' + message + '</div></div>' +
        '<button class="toast-close" aria-label="Dismiss"><i data-lucide="x"></i></button>';
    container.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    toast.querySelector('.toast-close').addEventListener('click', function() { removeToast(toast); });
    if (duration > 0) setTimeout(function() { removeToast(toast); }, duration);
}

function removeToast(toast) {
    toast.classList.add('removing');
    toast.addEventListener('animationend', function() { toast.remove(); });
}

// ===== MODAL SYSTEM =====
const Modal = {
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
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    close: function() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.onConfirm = null;
        this.onCancel = null;
    }
};

// ===== ENHANCED CREATE COMMUNITY MODAL =====
const CreateModal = {
    overlay: null,
    form: null,
    selectedIcon: 'users',
    selectedColor: '#a855f7',
    isSubmitting: false,

    init: function() {
        this.overlay = document.getElementById('create-modal-overlay');
        this.form = document.getElementById('create-community-form');
        if (!this.overlay || !this.form) return;

        var self = this;

        // Close handlers
        document.getElementById('create-modal-close').addEventListener('click', function() { self.close(); });
        document.getElementById('create-modal-cancel').addEventListener('click', function() { self.close(); });
        this.overlay.addEventListener('click', function(e) { if (e.target === self.overlay) self.close(); });

        // Submit handler
        document.getElementById('create-modal-confirm').addEventListener('click', function(e) {
            e.preventDefault();
            self.submit();
        });

        // Initialize sub-components
        self.initIconPicker();
        self.initColorPicker();
        self.initLivePreview();
        self.initValidation();
        self.initCharCounters();
    },

    // ---- Icon Picker ----
    initIconPicker: function() {
        var self = this;
        var grid = document.getElementById('icon-picker-grid');
        var searchInput = document.getElementById('icon-search-input');
        var hiddenInput = document.getElementById('community-icon-input');
        if (!grid) return;

        function renderIcons(filter) {
            filter = (filter || '').toLowerCase().trim();
            var icons = filter
                ? LUCIDE_ICONS.filter(function(i) { return i.toLowerCase().includes(filter); })
                : LUCIDE_ICONS.slice(0, 64);

            grid.innerHTML = icons.map(function(icon) {
                var isSelected = icon === self.selectedIcon;
                return '<div class="icon-picker-item ' + (isSelected ? 'selected' : '') + '" data-icon="' + icon + '" title="' + icon + '">' +
                    '<i data-lucide="' + icon + '"></i>' +
                '</div>';
            }).join('');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        renderIcons();

        grid.addEventListener('click', function(e) {
            var item = e.target.closest('.icon-picker-item');
            if (!item) return;
            var icon = item.dataset.icon;
            self.selectedIcon = icon;
            hiddenInput.value = icon;
            grid.querySelectorAll('.icon-picker-item').forEach(function(el) { el.classList.remove('selected'); });
            item.classList.add('selected');
            self.updatePreview();
        });

        if (searchInput) {
            var debounceTimer;
            searchInput.addEventListener('input', function(e) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(function() { renderIcons(e.target.value); }, 150);
            });
        }
    },

    // ---- Color Picker ----
    initColorPicker: function() {
        var self = this;
        var swatchesContainer = document.getElementById('color-swatches');
        var customInput = document.getElementById('color-custom');
        var hiddenInput = document.getElementById('community-color-input');
        if (!swatchesContainer) return;

        swatchesContainer.innerHTML = COLOR_SWATCHES.map(function(color) {
            var isSelected = color === self.selectedColor;
            return '<div class="color-swatch ' + (isSelected ? 'selected' : '') + '" data-color="' + color + '" style="background:' + color + ';color:' + color + '" title="' + color + '"></div>';
        }).join('');

        swatchesContainer.addEventListener('click', function(e) {
            var swatch = e.target.closest('.color-swatch');
            if (!swatch) return;
            var color = swatch.dataset.color;
            self.selectedColor = color;
            hiddenInput.value = color;
            swatchesContainer.querySelectorAll('.color-swatch').forEach(function(el) { el.classList.remove('selected'); });
            swatch.classList.add('selected');
            if (customInput) customInput.value = color;
            self.updatePreview();
        });

        if (customInput) {
            customInput.addEventListener('input', function(e) {
                var color = e.target.value;
                self.selectedColor = color;
                hiddenInput.value = color;
                swatchesContainer.querySelectorAll('.color-swatch').forEach(function(el) { el.classList.remove('selected'); });
                self.updatePreview();
            });
        }
    },

    // ---- Live Preview ----
    initLivePreview: function() {
        var self = this;
        var nameInput = document.getElementById('community-name-input');
        var descInput = document.getElementById('community-description');
        var catSelect = document.getElementById('community-category');

        [nameInput, descInput, catSelect].forEach(function(el) {
            if (el) el.addEventListener('input', function() { self.updatePreview(); });
        });
        if (catSelect) catSelect.addEventListener('change', function() { self.updatePreview(); });

        self.updatePreview();
    },

    updatePreview: function() {
        var nameInput = document.getElementById('community-name-input');
        var descInput = document.getElementById('community-description');
        var catSelect = document.getElementById('community-category');

        var previewName = document.getElementById('preview-name');
        var previewDesc = document.getElementById('preview-desc');
        var previewIcon = document.getElementById('preview-icon');
        var previewCategory = document.getElementById('preview-category');
        var previewAccent = document.getElementById('preview-accent');

        var name = (nameInput && nameInput.value.trim()) || 'Your Community';
        var desc = (descInput && descInput.value.trim()) || 'Your community description will appear here...';
        var cat = catSelect ? catSelect.value : '';
        var icon = this.selectedIcon || 'users';
        var color = this.selectedColor || '#a855f7';

        if (previewName) previewName.textContent = name;
        if (previewDesc) previewDesc.textContent = desc;
        if (previewCategory) {
            previewCategory.textContent = cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'Select a category';
        }
        if (previewAccent) previewAccent.style.background = color;
        if (previewIcon) {
            previewIcon.style.background = hexToRgba(color, 0.15);
            previewIcon.style.color = color;
            previewIcon.innerHTML = '<i data-lucide="' + icon + '"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },

    // ---- Validation ----
    initValidation: function() {
        var self = this;
        var nameInput = document.getElementById('community-name-input');
        var descInput = document.getElementById('community-description');
        var catSelect = document.getElementById('community-category');

        function validateField(el, minLen, maxLen) {
            if (!el) return true;
            var val = el.value.trim();
            var isValid = val.length >= minLen && val.length <= maxLen;
            el.classList.toggle('error', !isValid && val.length > 0);
            el.classList.toggle('success', isValid && val.length > 0);
            return isValid;
        }

        if (nameInput) {
            nameInput.addEventListener('blur', function() { validateField(nameInput, 2, 50); });
            nameInput.addEventListener('input', function() {
                if (nameInput.classList.contains('error')) validateField(nameInput, 2, 50);
            });
        }

        if (descInput) {
            descInput.addEventListener('blur', function() { validateField(descInput, 20, 500); });
            descInput.addEventListener('input', function() {
                var val = descInput.value.trim();
                var isValid = val.length >= 20;
                descInput.classList.toggle('error', !isValid && val.length > 0);
                descInput.classList.toggle('success', isValid);
                var errEl = document.getElementById('desc-error');
                if (errEl) errEl.style.display = (!isValid && val.length > 0) ? 'flex' : 'none';
            });
        }

        if (catSelect) {
            catSelect.addEventListener('change', function() {
                catSelect.classList.toggle('error', !catSelect.value);
                catSelect.classList.toggle('success', !!catSelect.value);
            });
        }
    },

    // ---- Character Counters ----
    initCharCounters: function() {
        var nameInput = document.getElementById('community-name-input');
        var descInput = document.getElementById('community-description');
        var nameCount = document.getElementById('name-char-count');
        var descCount = document.getElementById('desc-char-count');

        function updateCounter(input, counterEl, max) {
            if (!input || !counterEl) return;
            var len = input.value.length;
            counterEl.textContent = len + '/' + max;
            counterEl.classList.toggle('warning', len > max * 0.8);
            counterEl.classList.toggle('error', len > max);
        }

        if (nameInput && nameCount) {
            nameInput.addEventListener('input', function() { updateCounter(nameInput, nameCount, 50); });
            updateCounter(nameInput, nameCount, 50);
        }

        if (descInput && descCount) {
            descInput.addEventListener('input', function() { updateCounter(descInput, descCount, 500); });
            updateCounter(descInput, descCount, 500);
        }
    },

    open: function() {
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Reset form state
        var nameInput = document.getElementById('community-name-input');
        var descInput = document.getElementById('community-description');
        var catSelect = document.getElementById('community-category');
        if (nameInput) { nameInput.value = ''; nameInput.classList.remove('error', 'success'); }
        if (descInput) { descInput.value = ''; descInput.classList.remove('error', 'success'); }
        if (catSelect) { catSelect.value = ''; catSelect.classList.remove('error', 'success'); }

        // Reset counters
        var nameCount = document.getElementById('name-char-count');
        var descCount = document.getElementById('desc-char-count');
        if (nameCount) nameCount.textContent = '0/50';
        if (descCount) descCount.textContent = '0/500';

        // Reset error messages
        var descErr = document.getElementById('desc-error');
        if (descErr) descErr.style.display = 'none';

        this.updatePreview();
    },

    close: function() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.isSubmitting = false;
        var confirmBtn = document.getElementById('create-modal-confirm');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i data-lucide="sparkles" style="width:14px;height:14px;"></i><span>Create Community</span>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },

    validateForm: function() {
        var nameInput = document.getElementById('community-name-input');
        var descInput = document.getElementById('community-description');
        var catSelect = document.getElementById('community-category');
        var isValid = true;

        if (!nameInput || nameInput.value.trim().length < 2) {
            if (nameInput) nameInput.classList.add('error');
            isValid = false;
        }
        if (!descInput || descInput.value.trim().length < 20) {
            if (descInput) descInput.classList.add('error');
            var errEl = document.getElementById('desc-error');
            if (errEl) errEl.style.display = 'flex';
            isValid = false;
        }
        if (!catSelect || !catSelect.value) {
            if (catSelect) catSelect.classList.add('error');
            isValid = false;
        }

        if (!isValid) {
            showToast('Validation Error', 'Please fill in all required fields correctly.', 'error', 4000);
            // Shake the first invalid field into view
            var firstInvalid = document.querySelector('.form-input.error, .form-textarea.error, .form-select.error');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalid.focus();
            }
        }

        return isValid;
    },

    submit: async function() {
        if (this.isSubmitting) return;
        if (!this.validateForm()) return;

        this.isSubmitting = true;
        var confirmBtn = document.getElementById('create-modal-confirm');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite;">' +
                '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>' +
                '</svg> Creating...</span>';
        }

        var formData = new FormData(this.form);
        var data = Object.fromEntries(formData);
        data.icon = this.selectedIcon;
        data.color = this.selectedColor;

        var success = await createCommunity(data);

        if (success) {
            this.close();
            this.form.reset();
            this.selectedIcon = 'users';
            this.selectedColor = '#a855f7';
            // Reset picker states
            var grid = document.getElementById('icon-picker-grid');
            if (grid) {
                grid.querySelectorAll('.icon-picker-item').forEach(function(el) { el.classList.remove('selected'); });
                var defaultIcon = grid.querySelector('[data-icon="users"]');
                if (defaultIcon) defaultIcon.classList.add('selected');
            }
            var swatches = document.getElementById('color-swatches');
            if (swatches) {
                swatches.querySelectorAll('.color-swatch').forEach(function(el) { el.classList.remove('selected'); });
                var defaultColor = swatches.querySelector('[data-color="#a855f7"]');
                if (defaultColor) defaultColor.classList.add('selected');
            }
            var customColor = document.getElementById('color-custom');
            if (customColor) customColor.value = '#a855f7';
            this.updatePreview();
        } else {
            this.isSubmitting = false;
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = '<i data-lucide="sparkles" style="width:14px;height:14px;"></i><span>Create Community</span>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }
    }
};

// ===== NUMBER COUNTER ANIMATION =====
function animateNumber(element, target, duration) {
    duration = duration || 800;
    if (!element) return;
    const start = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
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

// ===== SEARCH =====
function initSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;
    let debounceTimer;
    input.addEventListener('input', function(e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() { performSearch(e.target.value); }, 200);
    });
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { input.value = ''; performSearch(''); input.blur(); }
    });
}

function performSearch(query) {
    const lowerQuery = query.toLowerCase().trim();
    document.querySelectorAll('.card').forEach(function(card) {
        const text = card.textContent.toLowerCase();
        const hasMatch = !lowerQuery || text.includes(lowerQuery);
        card.style.opacity = hasMatch ? '1' : '0.3';
        card.style.transform = hasMatch ? '' : 'scale(0.98)';
        card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    });
}

// ===== KEYBOARD SHORTCUTS =====
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            Modal.close();
            CreateModal.close();
        }
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            document.getElementById('collapse-btn').click();
        }
    });
}

// ===== INTERSECTION OBSERVER =====
function initScrollAnimations() {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) entry.target.style.animationPlayState = 'running';
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.card').forEach(function(card) {
        card.style.animationPlayState = 'paused';
        observer.observe(card);
    });
}

// ===== SUPABASE USER SYNC =====
async function syncUserFromSupabase() {
    const saved = localStorage.getItem('cosmohub_user');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            currentUser = Object.assign({ name: 'Explorer', username: 'explorer', handle: '@explorer', role: 'Member' }, parsed);
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
            console.warn('[CosmoHub Communities] Profile load failed:', error ? error.message : 'no profile');
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
        console.log('[CosmoHub Communities] User synced:', currentUser.username);
    } catch (err) {
        console.warn('[CosmoHub Communities] User sync error:', err.message);
    }
}

// ===== SUPABASE DATA FETCHING =====

async function fetchCommunities() {
    isLoading = true;
    showLoading();

    try {
        const { data, error } = await sb
            .from('communities')
            .select('*')
            .order('member_count', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            communities = data.map(function(c) {
                return Object.assign({}, c, {
                    icon: c.icon || 'users',
                    color: c.color || '#a78bfa',
                    joined: myCommunityIds.includes(c.id)
                });
            });
        } else {
            communities = JSON.parse(JSON.stringify(DEFAULT_COMMUNITIES));
        }
    } catch (err) {
        console.warn('Supabase fetch failed, using demo data:', err);
        communities = JSON.parse(JSON.stringify(DEFAULT_COMMUNITIES));
    }

    isLoading = false;
    renderCommunities();
    renderPopular();
    renderMyCommunities();
}

async function fetchDiscussions() {
    try {
        const { data, error } = await sb
            .from('discussions')
            .select('*, communities(name, icon, color), users(name)')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        if (data && data.length > 0) {
            discussions = data.map(function(d) {
                return {
                    id: d.id,
                    title: d.title,
                    community_name: d.communities ? d.communities.name : 'Unknown',
                    author: d.users ? d.users.name : 'Anonymous',
                    time: formatTime(d.created_at),
                    replies: d.reply_count || 0,
                    icon: d.communities ? d.communities.icon : 'message-square',
                    color: d.communities ? d.communities.color : '#a78bfa'
                };
            });
        } else {
            discussions = JSON.parse(JSON.stringify(DEFAULT_DISCUSSIONS));
        }
    } catch (err) {
        console.warn('Supabase discussions fetch failed:', err);
        discussions = JSON.parse(JSON.stringify(DEFAULT_DISCUSSIONS));
    }

    renderDiscussions();
}

async function fetchMyCommunities() {
    try {
        const user = await getCurrentUser();
        if (!user || !user.id) {
            myCommunityIds = DEFAULT_COMMUNITIES.filter(function(c) { return c.joined; }).map(function(c) { return c.id; });
            return;
        }

        const { data, error } = await sb
            .from('community_members')
            .select('community_id')
            .eq('user_id', user.id);

        if (error) throw error;
        myCommunityIds = data ? data.map(function(m) { return m.community_id; }) : [];
    } catch (err) {
        console.warn('Failed to fetch my communities:', err);
        myCommunityIds = DEFAULT_COMMUNITIES.filter(function(c) { return c.joined; }).map(function(c) { return c.id; });
    }
}

async function fetchStats() {
    try {
        const results = await Promise.all([
            sb.from('communities').select('*', { count: 'exact', head: true }),
            sb.from('community_members').select('*', { count: 'exact', head: true }),
            sb.from('discussions').select('*', { count: 'exact', head: true }),
            sb.from('events').select('*', { count: 'exact', head: true }).gte('date', new Date().toISOString().slice(0, 7) + '-01')
        ]);
        animateNumber(document.getElementById('stat-communities'), (results[0].count) || 128);
        animateNumber(document.getElementById('stat-members'), (results[1].count) || 5400);
        animateNumber(document.getElementById('stat-discussions'), (results[2].count) || 342);
        animateNumber(document.getElementById('stat-events'), (results[3].count) || 98);
    } catch (err) {
        console.warn('Stats fetch failed:', err);
        animateNumber(document.getElementById('stat-communities'), 128);
        animateNumber(document.getElementById('stat-members'), 5400);
        animateNumber(document.getElementById('stat-discussions'), 342);
        animateNumber(document.getElementById('stat-events'), 98);
    }
}

async function joinCommunity(communityId) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.id) {
            showToast('Sign In Required', 'Please sign in to join communities', 'warning');
            return;
        }

        const isJoined = myCommunityIds.includes(communityId);

        if (isJoined) {
            const { error } = await sb
                .from('community_members')
                .delete()
                .eq('community_id', communityId)
                .eq('user_id', user.id);
            if (error) throw error;
            myCommunityIds = myCommunityIds.filter(function(id) { return id !== communityId; });
            const c = communities.find(function(x) { return x.id === communityId; });
            if (c) { c.joined = false; c.member_count = Math.max(0, (c.member_count || 0) - 1); }
            showToast('Left Community', 'You left the community', 'info');
        } else {
            const { error } = await sb
                .from('community_members')
                .insert({ community_id: communityId, user_id: user.id });
            if (error) throw error;
            myCommunityIds.push(communityId);
            const c = communities.find(function(x) { return x.id === communityId; });
            if (c) { c.joined = true; c.member_count = (c.member_count || 0) + 1; }
            showToast('Joined Community', 'Welcome to the community!', 'success');
        }

        renderCommunities();
        renderMyCommunities();
        renderPopular();
    } catch (err) {
        console.error('Join toggle failed:', err);
        const c = communities.find(function(x) { return x.id === communityId; });
        if (c) {
            c.joined = !c.joined;
            c.member_count = (c.member_count || 0) + (c.joined ? 1 : -1);
            if (c.joined) myCommunityIds.push(communityId);
            else myCommunityIds = myCommunityIds.filter(function(id) { return id !== communityId; });
        }
        renderCommunities();
        renderMyCommunities();
        renderPopular();
    }
}

async function createCommunity(formData) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.id) {
            showToast('Sign In Required', 'Please sign in to create a community', 'warning');
            return false;
        }

        var newCommunity = {
            name: formData.name,
            description: formData.description,
            category: formData.category,
            icon: formData.icon || 'users',
            color: formData.color || '#a855f7',
            member_count: 1,
            created_by: user.id
        };

        const { data, error } = await sb
            .from('communities')
            .insert(newCommunity)
            .select()
            .single();

        if (error) throw error;

        await sb.from('community_members').insert({ community_id: data.id, user_id: user.id });

        communities.unshift(Object.assign({}, data, { joined: true }));
        myCommunityIds.push(data.id);

        renderCommunities();
        renderMyCommunities();
        showToast('Community Created', 'Your community is live!', 'success');
        return true;
    } catch (err) {
        console.error('Create community failed:', err);
        var id = 'local_' + Date.now();
        communities.unshift({
            id: id, name: formData.name, description: formData.description,
            category: formData.category, member_count: 1,
            icon: formData.icon || 'users', color: formData.color || '#a855f7', joined: true
        });
        myCommunityIds.push(id);
        renderCommunities();
        renderMyCommunities();
        showToast('Community Created', 'Your community is live!', 'success');
        return true;
    }
}

async function getCurrentUser() {
    if (currentUser && currentUser.id) return currentUser;
    if (!sb) return null;
    try {
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return null;
        const { data: profile } = await sb.from('users').select('*').eq('id', session.user.id).single();
        currentUser = Object.assign({ name: 'Explorer', username: 'explorer', handle: '@explorer', role: 'Member' }, profile || {}, { id: session.user.id });
        return currentUser;
    } catch (e) { return null; }
}

// ===== RENDERING =====

function renderCommunities() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;

    let filtered = communities;

    if (currentTab === 'my-communities') {
        filtered = filtered.filter(function(c) { return c.joined || myCommunityIds.includes(c.id); });
    } else if (currentTab === 'invitations') {
        filtered = [];
    }

    if (currentCategory !== 'all') {
        filtered = filtered.filter(function(c) { return c.category === currentCategory; });
    }

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(function(c) {
            return (c.name || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
        });
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;"><i data-lucide="search"></i><p>No communities found</p></div>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    // Limit to 3 featured communities so page doesn't scroll
    filtered = filtered.slice(0, 3);

    grid.innerHTML = filtered.map(function(c) {
        const isJoined = c.joined || myCommunityIds.includes(c.id);
        return '<div class="community-card-lg" style="--card-accent:' + (c.color || '#a78bfa') + '">' +
            '<div class="card-header">' +
                '<div class="community-icon-lg" style="background:' + hexToRgba(c.color || '#a78bfa', 0.15) + ';color:' + (c.color || '#a78bfa') + '">' +
                    '<i data-lucide="' + (c.icon || 'users') + '"></i>' +
                '</div>' +
                '<div class="community-info">' +
                    '<h4>' + escapeHtml(c.name) + '</h4>' +
                    '<div class="members">' + formatNumber(c.member_count || 0) + ' Members</div>' +
                '</div>' +
            '</div>' +
            '<p class="community-desc">' + escapeHtml(c.description || '') + '</p>' +
            '<button class="join-btn ' + (isJoined ? 'joined' : '') + '" data-community-id="' + c.id + '">' +
                (isJoined ? 'Joined' : 'Join') +
            '</button>' +
        '</div>';
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderDiscussions() {
    const list = document.getElementById('discussions-list');
    if (!list) return;

    list.innerHTML = discussions.map(function(d) {
        return '<div class="discussion-item" onclick="openDiscussion(\'' + d.id + '\')">' +
            '<div class="discussion-icon" style="background:' + hexToRgba(d.color || '#a78bfa', 0.15) + ';color:' + (d.color || '#a78bfa') + '">' +
                '<i data-lucide="' + (d.icon || 'message-square') + '"></i>' +
            '</div>' +
            '<div class="discussion-content">' +
                '<h4>' + escapeHtml(d.title) + '</h4>' +
                '<div class="discussion-meta">' +
                    '<span>' + escapeHtml(d.community_name) + '</span>' +
                    '<span class="dot"></span>' +
                    '<span>Asked by ' + escapeHtml(d.author) + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="discussion-stats">' +
                '<span class="discussion-time">' + d.time + '</span>' +
                '<span class="discussion-replies">' +
                    '<i data-lucide="message-circle" style="width:10px;height:10px;"></i>' +
                    d.replies +
                '</span>' +
            '</div>' +
        '</div>';
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderPopular() {
    const list = document.getElementById('popular-list');
    if (!list) return;

    const popular = DEFAULT_POPULAR.slice(0, 7);

    if (popular.length === 0) {
        list.innerHTML = '<div class="empty-state"><i data-lucide="users"></i><p>No popular communities yet</p></div>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    list.innerHTML = popular.map(function(c, index) {
        const isJoined = myCommunityIds.includes(c.id);
        const rank = index + 1;
        const isTop = rank <= 3;
        return '<div class="rs-item">' +
            '<span class="rs-rank ' + (isTop ? 'top' : '') + '">' + rank + '</span>' +
            '<div class="rs-icon" style="background:' + hexToRgba(c.color || '#a78bfa', 0.15) + ';color:' + (c.color || '#a78bfa') + '">' +
                '<i data-lucide="' + (c.icon || 'users') + '"></i>' +
            '</div>' +
            '<div class="rs-info">' +
                '<div class="rs-name">' + escapeHtml(c.name) + '</div>' +
                '<div class="rs-meta">' + formatNumber(c.member_count || 0) + ' Members</div>' +
            '</div>' +
            '<button class="rs-action ' + (isJoined ? 'joined' : '') + '" data-community-id="' + c.id + '">' + (isJoined ? 'Joined' : 'Join') + '</button>' +
        '</div>';
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderMyCommunities() {
    const list = document.getElementById('my-communities-list');
    if (!list) return;

    const myCommunities = communities.filter(function(c) { return c.joined || myCommunityIds.includes(c.id); });

    if (myCommunities.length === 0) {
        list.innerHTML = '<div class="empty-state"><i data-lucide="users"></i><p>You havent joined any communities yet</p></div>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    const displayItems = myCommunities.slice(0, 6);

    list.innerHTML = displayItems.map(function(c) {
        const unreadCount = Math.floor(Math.random() * 15) + 1;
        return '<div class="rs-item">' +
            '<div class="rs-icon" style="background:' + hexToRgba(c.color || '#a78bfa', 0.15) + ';color:' + (c.color || '#a78bfa') + '">' +
                '<i data-lucide="' + (c.icon || 'users') + '"></i>' +
            '</div>' +
            '<div class="rs-info">' +
                '<div class="rs-name">' + escapeHtml(c.name) + '</div>' +
                '<div class="rs-meta">' + formatNumber(c.member_count || 0) + ' Members</div>' +
            '</div>' +
            '<div class="rs-badge">' +
                '<span class="dot"></span>' +
                '<span>' + unreadCount + '</span>' +
            '</div>' +
        '</div>';
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function showLoading() {
    const grid = document.getElementById('featured-grid');
    if (!grid || !isLoading) return;
    grid.innerHTML = Array(5).fill(0).map(function() {
        return '<div class="community-card-lg">' +
            '<div class="skeleton" style="height:38px;width:38px;border-radius:8px;margin-bottom:10px;"></div>' +
            '<div class="skeleton" style="height:14px;width:70%;margin-bottom:6px;"></div>' +
            '<div class="skeleton" style="height:10px;width:50%;margin-bottom:12px;"></div>' +
            '<div class="skeleton" style="height:50px;width:100%;margin-bottom:10px;"></div>' +
            '<div class="skeleton" style="height:28px;width:100%;"></div>' +
        '</div>';
    }).join('');
}

// ===== EVENT HANDLERS =====

function setupEventListeners() {
    // Tabs
    document.querySelectorAll('.tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
            tab.classList.add('active');
            currentTab = tab.dataset.tab;
            renderCommunities();
        });
    });

    // Category pills
    document.querySelectorAll('.pill').forEach(function(pill) {
        pill.addEventListener('click', function() {
            document.querySelectorAll('.pill').forEach(function(p) { p.classList.remove('active'); });
            pill.classList.add('active');
            currentCategory = pill.dataset.category;
            renderCommunities();
        });
    });

    // Community search
    const communitySearch = document.getElementById('community-search');
    if (communitySearch) {
        communitySearch.addEventListener('input', function(e) {
            searchQuery = e.target.value;
            renderCommunities();
        });
    }

    // Create community buttons
    const createBtn = document.getElementById('create-community-btn');
    if (createBtn) {
        createBtn.addEventListener('click', function() { CreateModal.open(); });
    }

    // View all buttons
    document.getElementById('view-all-featured')?.addEventListener('click', function() {
        currentTab = 'explore';
        document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
        document.querySelector('[data-tab="explore"]')?.classList.add('active');
        renderCommunities();
    });

    document.getElementById('view-all-discussions')?.addEventListener('click', function() {
        Modal.open('All Discussions', '<div class="empty-state"><i data-lucide="message-square"></i><p>All discussions view coming soon</p></div>', { confirmText: 'Close' });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    document.getElementById('view-all-popular')?.addEventListener('click', function() {
        Modal.open('Popular Communities', '<div class="empty-state"><i data-lucide="users"></i><p>All popular communities coming soon</p></div>', { confirmText: 'Close' });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    document.getElementById('manage-communities')?.addEventListener('click', function() {
        currentTab = 'my-communities';
        document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
        document.querySelector('[data-tab="my-communities"]')?.classList.add('active');
        renderCommunities();
    });

    document.getElementById('filter-btn')?.addEventListener('click', function() {
        showToast('Filters', 'Advanced filters coming soon!', 'info', 3000);
    });

    // Notification / Message buttons
    const notifBtn = document.getElementById('notification-btn');
    if (notifBtn) {
        notifBtn.addEventListener('click', function() {
            showToast('Notifications', 'You have no new notifications', 'info', 3000);
        });
    }

    const msgBtn = document.getElementById('message-btn');
    if (msgBtn) {
        msgBtn.addEventListener('click', function() {
            showToast('Messages', 'No unread messages', 'info', 3000);
        });
    }

    // Button click feedback
    document.querySelectorAll('.icon-btn, .view-all-btn, .join-btn, .rs-action, .filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.92)';
            setTimeout(function() { btn.style.transform = ''; }, 150);
        });
    });

    // Event delegation for join community buttons
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('[data-community-id]');
        if (btn && (btn.classList.contains('join-btn') || btn.classList.contains('rs-action'))) {
            e.stopPropagation();
            joinCommunity(btn.dataset.communityId);
        }
    });
}

// ===== UTILITIES =====

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    return num.toString();
}

function formatTime(isoString) {
    if (!isoString) return 'just now';
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return date.toLocaleDateString();
}

function hexToRgba(hex, alpha) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 'rgba(168, 85, 247, ' + alpha + ')';
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
}

function openDiscussion(id) {
    showToast('Discussion', 'Opening discussion ' + id + '...', 'info', 2000);
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

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') lucide.createIcons();

    supabaseReady = initSupabase();

    initStarfield();
    initClock();
    initSidebar();
    Modal.init();
    CreateModal.init();
    initKeyboardShortcuts();

    // Navigation
    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.addEventListener('click', function() {
            const targetPage = this.dataset.page;
            if (targetPage) {
                const currentPage = window.location.pathname.split('/').pop();
                if (currentPage !== targetPage) window.location.href = targetPage;
            }
        });
    });

    // Render defaults first
    animateNumber(document.getElementById('stat-communities'), DEFAULT_STATS.communities);
    animateNumber(document.getElementById('stat-members'), DEFAULT_STATS.members);
    
    animateNumber(document.getElementById('stat-events'), DEFAULT_STATS.events);
    loadOnlineCount(DEFAULT_ONLINE.count);
    

    requestAnimationFrame(function() {
        initScrollAnimations();
    });

    // Sync user then load data
    syncUserFromSupabase().then(function() {
        fetchMyCommunities().then(function() {
            fetchCommunities();
            fetchStats();
        });
    });

    setupEventListeners();

    console.log('%c🚀 CosmoHub Communities Enhanced Edition', 'color: #a855f7; font-size: 16px; font-weight: bold;');
    console.log('%cFeatures: Starfield, Clock, Modals, Toasts, Supabase User Sync, Search, Join/Create Communities, Icon Picker, Color Picker, Live Preview', 'color: #22d3ee; font-size: 11px;');
});