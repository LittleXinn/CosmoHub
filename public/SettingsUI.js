// ===== CosmoHub Settings =====

// ===== STARFIELD =====
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
    let sidebarCollapsed = localStorage.getItem('cosmohub-sidebar') === 'true';
    if (sidebarCollapsed) sidebar.classList.add('collapsed');
    btn.addEventListener('click', () => {
        sidebarCollapsed = !sidebarCollapsed;
        sidebar.classList.toggle('collapsed', sidebarCollapsed);
        localStorage.setItem('cosmohub-sidebar', sidebarCollapsed);
    });
}

// ===== NAVIGATION =====
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const targetPage = this.dataset.page;
            if (targetPage) {
                const currentPage = window.location.pathname.split('/').pop();
                if (currentPage !== targetPage) window.location.href = targetPage;
            }
        });
    });
}

// ===== TOAST =====
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success: 'check-circle', error: 'x-circle', info: 'info' };
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i data-lucide="${icons[type] || 'info'}" class="toast-icon ${type}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    container.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => toast.remove(), 3000);
}

// ===== MODAL =====
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

// ===== MODAL CONTENT =====
const modalContent = {
    account: {
        title: 'Account Settings',
        content: `
            <div class="form-group">
                <label class="form-label">Display Name</label>
                <input type="text" class="form-input" value="Explorer" placeholder="Enter your name">
            </div>
            <div class="form-group">
                <label class="form-label">Username</label>
                <input type="text" class="form-input" value="explorer" placeholder="Enter username">
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" value="explorer@cosmohub.space" placeholder="Enter email">
            </div>
            <div class="form-group">
                <label class="form-label">Bio</label>
                <input type="text" class="form-input" value="Exploring the cosmos, one star at a time." placeholder="Tell us about yourself">
            </div>
        `,
        confirmText: 'Save Changes',
        onConfirm: () => showToast('Success', 'Account information updated', 'success')
    },
    security: {
        title: 'Security Settings',
        content: `
            <div class="form-group">
                <label class="form-label">Current Password</label>
                <input type="password" class="form-input" placeholder="Enter current password">
            </div>
            <div class="form-group">
                <label class="form-label">New Password</label>
                <input type="password" class="form-input" placeholder="Enter new password">
            </div>
            <div class="form-group">
                <label class="form-label">Confirm New Password</label>
                <input type="password" class="form-input" placeholder="Confirm new password">
            </div>
            <div class="toggle-row">
                <div class="toggle-info">
                    <div class="toggle-title">Two-Factor Authentication</div>
                    <div class="toggle-desc">Add an extra layer of security</div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `,
        confirmText: 'Update Password',
        onConfirm: () => showToast('Success', 'Security settings updated', 'success')
    },
    notifications: {
        title: 'Notification Preferences',
        content: `
            <div class="toggle-row">
                <div class="toggle-info">
                    <div class="toggle-title">Email Notifications</div>
                    <div class="toggle-desc">Receive updates via email</div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" checked>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="toggle-row">
                <div class="toggle-info">
                    <div class="toggle-title">Push Notifications</div>
                    <div class="toggle-desc">Browser push notifications</div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" checked>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="toggle-row">
                <div class="toggle-info">
                    <div class="toggle-title">Announcements</div>
                    <div class="toggle-desc">New announcements from communities</div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" checked>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="toggle-row">
                <div class="toggle-info">
                    <div class="toggle-title">Direct Messages</div>
                    <div class="toggle-desc">New private message alerts</div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" checked>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="toggle-row">
                <div class="toggle-info">
                    <div class="toggle-title">Event Reminders</div>
                    <div class="toggle-desc">Upcoming event notifications</div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `,
        confirmText: 'Save Preferences',
        onConfirm: () => showToast('Success', 'Notification preferences saved', 'success')
    },
    help: {
        title: 'Help & Support',
        content: `
            <div class="form-group">
                <label class="form-label">Subject</label>
                <input type="text" class="form-input" placeholder="What do you need help with?">
            </div>
            <div class="form-group">
                <label class="form-label">Message</label>
                <input type="text" class="form-input" placeholder="Describe your issue...">
            </div>
            <p style="font-size:11px;color:var(--text-muted);margin-top:8px;">
                You can also reach us at <span style="color:var(--accent-purple)">support@cosmohub.space</span>
            </p>
        `,
        confirmText: 'Send Message',
        onConfirm: () => showToast('Sent', 'Support message sent successfully', 'success')
    },
    about: {
        title: 'About CosmoHub',
        content: `
            <div style="text-align:center;padding:10px 0;">
                <svg viewBox="0 0 32 32" width="48" height="48" fill="none" stroke="var(--accent-purple)" stroke-width="1.5" style="margin-bottom:12px;">
                    <circle cx="16" cy="16" r="6"/>
                    <ellipse cx="16" cy="16" rx="14" ry="5" transform="rotate(-30 16 16)"/>
                    <ellipse cx="16" cy="16" rx="14" ry="5" transform="rotate(30 16 16)"/>
                </svg>
                <div style="font-size:16px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">CosmoHub</div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:16px;">Version 1.0.0 &middot; Build 2025.06</div>
                <p style="font-size:12px;color:var(--text-secondary);line-height:1.6;margin-bottom:16px;">
                    CosmoHub is a collaborative platform for space enthusiasts, researchers, and explorers. 
                    Connect with the universe and each other.
                </p>
                <div style="display:flex;gap:8px;justify-content:center;">
                    <span style="font-size:10px;padding:3px 10px;background:rgba(168,85,247,0.1);color:var(--accent-purple);border-radius:20px;border:1px solid rgba(168,85,247,0.15);">React</span>
                    <span style="font-size:10px;padding:3px 10px;background:rgba(34,211,238,0.1);color:var(--accent-cyan);border-radius:20px;border:1px solid rgba(34,211,238,0.15);">Supabase</span>
                    <span style="font-size:10px;padding:3px 10px;background:rgba(244,114,182,0.1);color:var(--accent-pink);border-radius:20px;border:1px solid rgba(244,114,182,0.15);">Vercel</span>
                </div>
            </div>
        `,
        showFooter: false
    }
};

// ===== THEME =====
function initTheme() {
    const currentTheme = localStorage.getItem('cosmohub-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeUI(currentTheme);

    document.getElementById('theme-dropdown').addEventListener('click', () => {
        const themes = [
            { id: 'dark', label: 'Cosmic Dark', dot: 'var(--accent-purple)' },
            { id: 'light', label: 'Stellar Light', dot: 'var(--accent-cyan)' }
        ];
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        const theme = themes.find(t => t.id === next);
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('cosmohub-theme', next);
        updateThemeUI(next);
        showToast('Theme Updated', `Switched to ${theme.label}`, 'success');
    });
}

function updateThemeUI(theme) {
    const label = document.getElementById('theme-label');
    const dot = document.getElementById('theme-dot');
    if (theme === 'light') {
        label.textContent = 'Stellar Light';
        dot.style.background = 'var(--accent-cyan)';
    } else {
        label.textContent = 'Cosmic Dark';
        dot.style.background = 'var(--accent-purple)';
    }
}

// ===== LANGUAGE =====
function initLanguage() {
    const languages = ['English', 'Español', 'Français', 'Deutsch', '中文'];
    let currentLang = localStorage.getItem('cosmohub-lang') || 'English';
    document.getElementById('lang-label').textContent = currentLang;

    document.getElementById('lang-dropdown').addEventListener('click', () => {
        const current = document.getElementById('lang-label').textContent;
        const idx = languages.indexOf(current);
        const next = languages[(idx + 1) % languages.length];
        document.getElementById('lang-label').textContent = next;
        localStorage.setItem('cosmohub-lang', next);
        showToast('Language Updated', `Language set to ${next}`, 'success');
    });
}

// ===== SETTINGS ITEMS =====
function initSettingsItems() {
    document.querySelectorAll('.settings-item[data-modal]').forEach(item => {
        item.addEventListener('click', () => {
            const key = item.dataset.modal;
            const data = modalContent[key];
            if (data) {
                Modal.open(data.title, data.content, {
                    confirmText: data.confirmText,
                    showFooter: data.showFooter,
                    onConfirm: data.onConfirm
                });
            }
        });
    });
}

// ===== TOP BUTTONS =====
function initTopButtons() {
    document.getElementById('notification-btn').addEventListener('click', () => {
        showToast('Notifications', 'You have no new notifications', 'info');
    });
    document.getElementById('message-btn').addEventListener('click', () => {
        showToast('Messages', 'No unread messages', 'info');
    });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    initStarfield();
    initSidebar();
    initNavigation();
    Modal.init();
    initTheme();
    initLanguage();
    initSettingsItems();
    initTopButtons();

    const savedOnline = localStorage.getItem('cosmohub-online') || '0';
    document.getElementById('online-count').textContent = savedOnline;
});
