var API_BASE_URL = window.location.origin + '/api';

function showToast(message, type) {
    type = type || 'info';
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;

    const icons = {
        success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
        error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    toast.innerHTML = icons[type] + '<span class="toast-message">' + message + '</span>';
    container.appendChild(toast);

    setTimeout(function() {
        toast.classList.add('hiding');
        setTimeout(function() { toast.remove(); }, 300);
    }, 4000);
}

// ============================================
// AVATAR UPLOAD
// ============================================
function initAvatarUpload() {
    const preview = document.getElementById('avatar-preview');
    const input = document.getElementById('avatar-input');
    const img = document.getElementById('avatar-img');

    if (!preview || !input) return;

    preview.addEventListener('click', function() { input.click(); });

    input.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showToast('Image must be under 2MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
            img.style.transform = 'scale(1.2)';
            setTimeout(function() { img.style.transform = 'scale(1)'; }, 300);
            showToast('Avatar updated!', 'success');
        };
        reader.readAsDataURL(file);
    });
}

// ============================================
// PASSWORD STRENGTH METER
// ============================================
function calculateStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}

function updatePasswordStrength(password) {
    const strengthContainer = document.getElementById('password-strength');
    const bars = document.querySelectorAll('.strength-bar');
    const text = document.getElementById('strength-text');
    const requirements = document.getElementById('password-requirements');

    if (!strengthContainer) return;

    if (password.length > 0) {
        strengthContainer.classList.add('visible');
        if (requirements) requirements.style.display = 'grid';
    } else {
        strengthContainer.classList.remove('visible');
        if (requirements) requirements.style.display = 'none';
        return;
    }

    const score = calculateStrength(password);
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

    bars.forEach(function(bar, i) {
        bar.classList.toggle('active', i < score);
    });

    text.textContent = score > 0 ? labels[score - 1] : 'Enter a password';
    text.style.color = score > 0 ? colors[score - 1] : 'rgba(255,255,255,0.5)';

    var checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };

    Object.keys(checks).forEach(function(req) {
        var el = document.querySelector('[data-req="' + req + '"]');
        if (el) el.classList.toggle('met', checks[req]);
    });
}

// ============================================
// VALIDATION HELPERS
// ============================================
function setValidation(input, isValid, message) {
    const group = input.closest('.input-group');
    const hint = group ? group.querySelector('.input-hint') : null;
    const icon = group ? group.querySelector('.validation-icon') : null;

    input.classList.remove('error', 'success');
    input.classList.add(isValid ? 'success' : 'error');

    if (hint) {
        hint.textContent = message || '';
        hint.className = 'input-hint ' + (isValid ? 'success' : message ? 'error' : '');
    }

    if (icon) {
        icon.className = 'validation-icon ' + (isValid ? 'valid' : message ? 'invalid' : '');
        icon.innerHTML = isValid 
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
            : message 
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
                : '';
    }
}

function clearValidation(input) {
    input.classList.remove('error', 'success');
    const group = input.closest('.input-group');
    const hint = group ? group.querySelector('.input-hint') : null;
    const icon = group ? group.querySelector('.validation-icon') : null;
    if (hint) {
        hint.textContent = '';
        hint.className = 'input-hint';
    }
    if (icon) {
        icon.className = 'validation-icon';
        icon.innerHTML = '';
    }
}

// ============================================
// DEBOUNCE UTILITY
// ============================================
function debounce(fn, ms) {
    var timer;
    return function() {
        var args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function() { fn.apply(null, args); }, ms);
    };
}

// ============================================
// FORM INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Only run on SignupUI.html (has #submit-btn with the standalone signup form)
    var submitBtn = document.getElementById('submit-btn');
    if (!submitBtn) return;

    initAvatarUpload();

    var form = document.getElementById('signup-form');
    var emailInput = document.getElementById('signup-email');
    var usernameInput = document.getElementById('signup-username');
    var passwordInput = document.getElementById('signup-password');
    var confirmInput = document.getElementById('signup-confirm');
    var btnText = submitBtn.querySelector('.btn-text');
    var btnSpinner = submitBtn.querySelector('.btn-spinner');

    if (!form) return;

    // Email validation
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var checkEmail = debounce(function(email) {
        if (!email || !emailRegex.test(email)) {
            if (email) setValidation(emailInput, false, 'Please enter a valid email');
            return;
        }
        setValidation(emailInput, true, 'Looks good!');
    }, 600);

    if (emailInput) {
        emailInput.addEventListener('input', function() {
            if (!this.value) {
                clearValidation(this);
                return;
            }
            checkEmail(this.value.trim());
        });
    }

    // Username validation
    var checkUsername = debounce(function(username) {
        if (username.length < 3) {
            setValidation(usernameInput, false, 'Minimum 3 characters');
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setValidation(usernameInput, false, 'Only letters, numbers & underscores');
            return;
        }
        setValidation(usernameInput, true, 'Looks good!');
    }, 500);

    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            if (!this.value) {
                clearValidation(this);
                return;
            }
            checkUsername(this.value.trim());
        });
    }

    // Password strength & validation
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
            if (confirmInput && confirmInput.value) {
                confirmInput.dispatchEvent(new Event('input'));
            }
        });
    }

    // Confirm password validation
    if (confirmInput) {
        confirmInput.addEventListener('input', function() {
            if (!this.value) {
                clearValidation(this);
                return;
            }
            if (!passwordInput || !passwordInput.value) {
                setValidation(this, false, 'Enter password first');
                return;
            }
            var match = this.value === passwordInput.value;
            setValidation(this, match, match ? 'Passwords match!' : 'Passwords do not match');
        });
    }

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        var email = emailInput.value.trim();
        var username = usernameInput.value.trim();
        var password = passwordInput.value;
        var confirmPassword = confirmInput.value;

        var hasError = false;

        if (!email || !emailRegex.test(email)) {
            setValidation(emailInput, false, 'Valid email required');
            hasError = true;
        }

        if (!username || username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
            setValidation(usernameInput, false, 'Valid username required');
            hasError = true;
        }

        var strength = calculateStrength(password);
        if (strength < 3) {
            showToast('Please use a stronger password (8+ chars, uppercase, number, special)', 'error');
            passwordInput.focus();
            hasError = true;
        }

        if (password !== confirmPassword) {
            setValidation(confirmInput, false, 'Passwords must match');
            hasError = true;
        }

        if (hasError) return;

        // Loading state
        submitBtn.disabled = true;
        if (btnText) btnText.hidden = true;
        if (btnSpinner) btnSpinner.hidden = false;

        // Get avatar if uploaded
        var avatarImg = document.getElementById('avatar-img');
        var avatarData = avatarImg && avatarImg.src && !avatarImg.src.includes('default-avatar') 
            ? avatarImg.src 
            : null;

        try {
            var response = await fetch(API_BASE_URL + '/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    username: username,
                    password: password,
                    name: username,
                    avatar: avatarData
                })
            });

            var data = await response.json();

            if (response.ok && data.success) {
                showToast('Account created! Please log in.', 'success');

                // Success animation
                submitBtn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
                if (btnText) {
                    btnText.textContent = 'Success!';
                    btnText.hidden = false;
                }
                if (btnSpinner) btnSpinner.hidden = true;

                setTimeout(function() {
                    window.location.href = 'LoginUI.html';
                }, 1500);
            } else {
                submitBtn.disabled = false;
                if (btnText) btnText.hidden = false;
                if (btnSpinner) btnSpinner.hidden = true;
                showToast(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            submitBtn.disabled = false;
            if (btnText) btnText.hidden = false;
            if (btnSpinner) btnSpinner.hidden = true;
            showToast('Network error. Please try again.', 'error');
        }
    });
});

// ============================================
// SOCIAL LOGIN HANDLERS
// ============================================
function socialLogin(provider) {
    showToast(provider + ' login coming soon!', 'info');
}