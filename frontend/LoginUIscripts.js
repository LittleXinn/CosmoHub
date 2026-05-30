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
// HARDCODED TEST ACCOUNTS
// ============================================
const TEST_ACCOUNTS = [
    {
        email: 'test@cosmohub.com',
        password: 'TestPass123!',
        name: 'Alex Mercer',
        role: 'Explorer',
        handle: '@alexmercer'
    },
    {
        email: 'admin@cosmohub.com',
        password: 'AdminPass123!',
        name: 'Luna Reyes',
        role: 'Admin',
        handle: '@lunareyes'
    }
];

function authenticateUser(email, password) {
    return TEST_ACCOUNTS.find(acc => 
        acc.email.toLowerCase() === email.toLowerCase() && 
        acc.password === password
    );
}

// ============================================
// LOGIN FORM HANDLER
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }

            const submitBtn = loginForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'LOGGING IN...';
            submitBtn.disabled = true;

            // Simulate network delay
            setTimeout(() => {
                const user = authenticateUser(email, password);

                if (user) {
                    // Store user session in localStorage
                    localStorage.setItem('cosmohub_user', JSON.stringify({
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        handle: user.handle,
                        loggedInAt: new Date().toISOString()
                    }));

                    submitBtn.textContent = 'SUCCESS!';

                    // Redirect to Dashboard after brief delay
                    setTimeout(() => {
                        window.location.href = 'DashboardUI.html';
                    }, 800);
                } else {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    alert('Invalid email or password.\n\nTest accounts:\n• test@cosmohub.com / TestPass123!\n• admin@cosmohub.com / AdminPass123!');
                }
            }, 1500);
        });
    }
});

// ============================================
// FORGOT PASSWORD HANDLER
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            if (!email) {
                alert('Please enter your email address first');
                document.getElementById('login-email').focus();
            } else {
                alert('Password reset link sent to ' + email + ' (Demo mode)');
            }
        });
    }
});