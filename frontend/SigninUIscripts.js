document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('signup-email').value.trim();
            const username = document.getElementById('signup-username').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm').value;

            if (!email || !username || !password || !confirmPassword) {
                alert('Please fill in all fields');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                document.getElementById('signup-email').focus();
                return;
            }

            if (username.length < 3) {
                alert('Username must be at least 3 characters long');
                document.getElementById('signup-username').focus();
                return;
            }

            if (password.length < 6) {
                alert('Password must be at least 6 characters long');
                document.getElementById('signup-password').focus();
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                document.getElementById('signup-confirm').focus();
                return;
            }

            console.log('Sign up attempt:', { email, username });

            const submitBtn = signupForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'CREATING ACCOUNT...';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                alert('Account created successfully! (Demo mode)');
                window.location.href = 'Index.html';
            }, 1500);
        });
    }
});

// Real-time password match checking
document.addEventListener('DOMContentLoaded', function() {
    const confirmInput = document.getElementById('signup-confirm');
    const passwordInput = document.getElementById('signup-password');

    if (confirmInput && passwordInput) {
        confirmInput.addEventListener('input', function() {
            if (this.value && passwordInput.value) {
                if (this.value === passwordInput.value) {
                    this.classList.remove('error');
                    this.classList.add('success');
                } else {
                    this.classList.remove('success');
                    this.classList.add('error');
                }
            } else {
                this.classList.remove('error', 'success');
            }
        });

        passwordInput.addEventListener('input', function() {
            if (confirmInput.value) {
                confirmInput.dispatchEvent(new Event('input'));
            }
        });
    }
});

// Username availability check (demo)
document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('signup-username');

    if (usernameInput) {
        let debounceTimer;
        usernameInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (this.value.length >= 3) {
                    console.log('Checking username availability:', this.value);
                }
            }, 500);
        });
    }
});