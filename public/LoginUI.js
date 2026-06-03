function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const eyeIcon = btn.querySelector('.eye-icon');
    if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.src = 'assets/eye-on.png';
        eyeIcon.alt = 'Hide Password';
    } else {
        input.type = 'password';
        eyeIcon.src = 'assets/eye-off.png';
        eyeIcon.alt = 'Show Password';
    }
}

// ============================================
// STARFIELD
// ============================================
function generateStarfield() {
    const container = document.getElementById('starfield');
    if (!container) return;
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
        star.style.setProperty('--delay', (Math.random() * 5) + 's');
        const size = Math.random() * 2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        container.appendChild(star);
    }
}

// ============================================
// TOASTS
// ============================================
function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 4000;
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    var iconSvg = '';
    if (type === 'success') {
        iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    } else if (type === 'error') {
        iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else {
        iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }
    toast.innerHTML = iconSvg +
        '<span class="toast-message">' + message + '</span>' +
        '<button class="toast-close">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
        '</button>';
    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', function() {
        toast.classList.add('hiding');
        setTimeout(function() { toast.remove(); }, 300);
    });

    setTimeout(function() {
        toast.classList.add('hiding');
        setTimeout(function() { toast.remove(); }, 300);
    }, duration);
}

// ============================================
// VALIDATION HELPERS
// ============================================
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePasswordScore(password) {
    var score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}

function getStrengthLabel(score) {
    if (score <= 1) return { cls: 'weak', text: 'Weak' };
    if (score === 2) return { cls: 'fair', text: 'Fair' };
    if (score === 3) return { cls: 'good', text: 'Good' };
    return { cls: 'strong', text: 'Strong' };
}

function showInputError(inputId, message) {
    var input = document.getElementById(inputId);
    var errorEl = document.getElementById(inputId + '-error');
    if (input) {
        input.classList.add('error');
        input.classList.remove('success');
    }
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }
}

function clearInputError(inputId) {
    var input = document.getElementById(inputId);
    var errorEl = document.getElementById(inputId + '-error');
    if (input) input.classList.remove('error');
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
    }
}

function markInputSuccess(inputId) {
    var input = document.getElementById(inputId);
    if (input) {
        input.classList.remove('error');
        input.classList.add('success');
    }
    clearInputError(inputId);
}

// ============================================
// PASSWORD STRENGTH (LoginUI.html style only)
// ============================================
function setupPasswordStrength() {
    var passwordInput = document.getElementById('signup-password');
    var strengthContainer = document.getElementById('password-strength');
    var strengthFill = document.getElementById('strength-fill');
    var strengthText = document.getElementById('strength-text');
    if (!passwordInput || !strengthFill) return;
    passwordInput.addEventListener('input', function() {
        var val = this.value;
        if (val.length === 0) {
            strengthContainer.classList.remove('visible');
            return;
        }
        strengthContainer.classList.add('visible');
        var score = validatePasswordScore(val);
        var strength = getStrengthLabel(score);
        strengthFill.className = 'strength-fill ' + strength.cls;
        strengthText.textContent = strength.text;
    });
}

// ============================================
// REAL-TIME VALIDATION
// ============================================
function setupRealtimeValidation() {
    var loginEmail = document.getElementById('login-email');
    if (loginEmail) {
        loginEmail.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                showInputError('login-email', 'Please enter a valid email address');
            } else if (this.value) {
                markInputSuccess('login-email');
            }
        });
        loginEmail.addEventListener('input', function() {
            if (this.classList.contains('error')) clearInputError('login-email');
        });
    }

    var signupEmail = document.getElementById('signup-email');
    if (signupEmail) {
        signupEmail.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                showInputError('signup-email', 'Please enter a valid email address');
            } else if (this.value) {
                markInputSuccess('signup-email');
            }
        });
        signupEmail.addEventListener('input', function() {
            if (this.classList.contains('error')) clearInputError('signup-email');
        });
    }

    var signupUsername = document.getElementById('signup-username');
    if (signupUsername) {
        signupUsername.addEventListener('blur', function() {
            if (this.value && this.value.length < 3) {
                showInputError('signup-username', 'Username must be at least 3 characters');
            } else if (this.value) {
                markInputSuccess('signup-username');
            }
        });
        signupUsername.addEventListener('input', function() {
            if (this.classList.contains('error')) clearInputError('signup-username');
        });
    }

    var signupConfirm = document.getElementById('signup-confirm');
    var signupPassword = document.getElementById('signup-password');
    if (signupConfirm && signupPassword) {
        signupConfirm.addEventListener('blur', function() {
            if (this.value && this.value !== signupPassword.value) {
                showInputError('signup-confirm', 'Passwords do not match');
            } else if (this.value) {
                markInputSuccess('signup-confirm');
            }
        });
        signupConfirm.addEventListener('input', function() {
            if (this.classList.contains('error')) clearInputError('signup-confirm');
        });
    }
}

// ============================================
// API CONFIG
// ============================================
var API_BASE_URL = window.location.origin + '/api';

// ============================================
// LOGIN FORM
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    generateStarfield();
    setupPasswordStrength();
    setupRealtimeValidation();

    var loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            var email = document.getElementById('login-email').value.trim();
            var password = document.getElementById('login-password').value;

            var hasError = false;
            if (!email) {
                showInputError('login-email', 'Email is required');
                hasError = true;
            } else if (!validateEmail(email)) {
                showInputError('login-email', 'Please enter a valid email address');
                hasError = true;
            }
            if (!password) {
                showInputError('login-password', 'Password is required');
                hasError = true;
            }
            if (hasError) {
                showToast('Please fix the errors above', 'error');
                return;
            }

            var submitBtn = document.getElementById('login-submit');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            try {
                var response = await fetch(API_BASE_URL + '/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password })
                });
                var data = await response.json();

                if (response.ok && data.success) {
                    localStorage.setItem('cosmohub_token', data.token);
                    localStorage.setItem('cosmohub_user', JSON.stringify({
                        id: data.user.id,
                        email: data.user.email,
                        username: data.user.username,
                        name: data.user.name,
                        role: data.user.role,
                        avatar: data.user.avatar,
                        loggedInAt: new Date().toISOString()
                    }));
                    submitBtn.classList.remove('loading');
                    submitBtn.querySelector('.btn-text').textContent = 'SUCCESS!';
                    showToast('Welcome back, ' + (data.user.username || data.user.name || 'Explorer') + '! Redirecting...', 'success');
                    setTimeout(function() {
                        window.location.href = 'DashboardUI.html';
                    }, 800);
                } else {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                    showToast(data.error || 'Invalid email or password', 'error');
                    var card = loginForm.closest('.glass-card');
                    if (card) {
                        card.style.animation = 'none';
                        card.offsetHeight;
                        card.style.animation = 'shake 0.5s ease';
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                showToast('Network error. Please try again.', 'error');
            }
        });
    }

    // ============================================
    // SIGNUP FORM (LoginUI.html embedded page only)
    // Only attach if the LoginUI-style submit button exists
    // ============================================
    var signupForm = document.getElementById('signup-form');
    var signupSubmitBtn = document.getElementById('signup-submit');
    if (signupForm && signupSubmitBtn) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            var email = document.getElementById('signup-email').value.trim();
            var username = document.getElementById('signup-username').value.trim();
            var password = document.getElementById('signup-password').value;
            var confirm = document.getElementById('signup-confirm').value;

            var hasError = false;
            if (!email) {
                showInputError('signup-email', 'Email is required');
                hasError = true;
            } else if (!validateEmail(email)) {
                showInputError('signup-email', 'Please enter a valid email address');
                hasError = true;
            }
            if (!username) {
                showInputError('signup-username', 'Username is required');
                hasError = true;
            } else if (username.length < 3) {
                showInputError('signup-username', 'Username must be at least 3 characters');
                hasError = true;
            }
            if (!password) {
                showInputError('signup-password', 'Password is required');
                hasError = true;
            } else if (password.length < 6) {
                showInputError('signup-password', 'Password must be at least 6 characters');
                hasError = true;
            }
            if (!confirm) {
                showInputError('signup-confirm', 'Please confirm your password');
                hasError = true;
            } else if (password !== confirm) {
                showInputError('signup-confirm', 'Passwords do not match');
                hasError = true;
            }
            if (hasError) {
                showToast('Please fix the errors above', 'error');
                return;
            }

            var submitBtn = document.getElementById('signup-submit');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            try {
                var response = await fetch(API_BASE_URL + '/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, username: username, password: password })
                });
                var data = await response.json();

                if (response.ok && data.success) {
                    submitBtn.classList.remove('loading');
                    submitBtn.querySelector('.btn-text').textContent = 'CREATED!';
                    showToast('Account created! Please log in.', 'success');
                    setTimeout(function() {
                        window.location.href = 'LoginUI.html';
                    }, 1500);
                } else {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                    showToast(data.error || 'Failed to create account', 'error');
                    var card = signupForm.closest('.glass-card');
                    if (card) {
                        card.style.animation = 'none';
                        card.offsetHeight;
                        card.style.animation = 'shake 0.5s ease';
                    }
                }
            } catch (error) {
                console.error('Signup error:', error);
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                showToast('Network error. Please try again.', 'error');
            }
        });
    }
});

// ============================================
// SHAKE KEYFRAMES (injected)
// ============================================
(function() {
    var style = document.createElement('style');
    style.textContent = '@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-10px)} 80%{transform:translateX(10px)} }';
    document.head.appendChild(style);
})();

// ============================================
// FORGOT PASSWORD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    var forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', async function(e) {
            e.preventDefault();
            var email = document.getElementById('login-email').value;
            if (!email) {
                showToast('Please enter your email address first', 'info');
                document.getElementById('login-email').focus();
                return;
            }
            if (!validateEmail(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            try {
                var response = await fetch(API_BASE_URL + '/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email })
                });
                var data = await response.json();
                if (response.ok) {
                    showToast(data.message || 'Password reset link sent to your email!', 'success');
                    if (data.devToken) console.log('Development reset token:', data.devToken);
                } else {
                    showToast(data.error || 'Failed to send reset link', 'error');
                }
            } catch (error) {
                console.error('Forgot password error:', error);
                showToast('Network error. Please try again.', 'error');
            }
        });
    }
});

// ============================================
// SOCIAL BUTTONS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.social-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            showToast('Social login coming soon!', 'info');
        });
    });
});

// ============================================
// AUTO-REDIRECT IF LOGGED IN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    var token = localStorage.getItem('cosmohub_token') || sessionStorage.getItem('cosmohub_token');
    if (token) {
        fetch(API_BASE_URL + '/auth/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(function(res) {
            if (res.ok) {
                window.location.href = 'DashboardUI.html';
            } else {
                localStorage.removeItem('cosmohub_token');
                localStorage.removeItem('cosmohub_user');
                sessionStorage.removeItem('cosmohub_token');
                sessionStorage.removeItem('cosmohub_user');
            }
        })
        .catch(function() {});
    }
});