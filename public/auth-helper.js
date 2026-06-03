// ============================================
// COSMOHUB AUTH HELPER
// Use this on any page that needs authentication
// ============================================

const API_BASE_URL = window.location.origin + '/api';

const Auth = {
    // Get stored token
    getToken() {
        return localStorage.getItem('cosmohub_token');
    },

    // Get stored user data
    getUser() {
        const user = localStorage.getItem('cosmohub_user');
        return user ? JSON.parse(user) : null;
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!this.getToken();
    },

    // Verify token with server
    async verify() {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Update stored user data
                localStorage.setItem('cosmohub_user', JSON.stringify(data.user));
                return data.user;
            } else {
                // Token invalid, clear everything
                this.logout();
                return null;
            }
        } catch (error) {
            console.error('Auth verification error:', error);
            return this.getUser(); // Return cached user if offline
        }
    },

    // Log out user
    async logout() {
        const token = this.getToken();

        if (token) {
            try {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        localStorage.removeItem('cosmohub_token');
        localStorage.removeItem('cosmohub_user');
        window.location.href = 'LoginUI.html';
    },

    // Protect a page (redirect to login if not authenticated)
    async protectPage() {
        const user = await this.verify();
        if (!user) {
            window.location.href = 'LoginUI.html';
            return null;
        }
        return user;
    },

    // Make authenticated API request
    async fetch(url, options = {}) {
        const token = this.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return fetch(url, {
            ...options,
            headers
        });
    }
};

// Auto-protect pages that include this script
// Add data-protect="true" to <body> to enable auto-protection
document.addEventListener('DOMContentLoaded', async function() {
    if (document.body.dataset.protect === 'true') {
        const user = await Auth.protectPage();
        if (user && window.onAuthReady) {
            window.onAuthReady(user);
        }
    }
});
