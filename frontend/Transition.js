const TransitionConfig = {
    defaultEffect: 'blurFade',  // 'fadeSlide', 'scaleFade', 'blurFade'
    duration: 250
};

document.addEventListener('DOMContentLoaded', function() {
    const pageLinks = document.querySelectorAll('.page-link');

    // Handle page link clicks
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('data-target');
            const targetPage = document.getElementById(targetId + '-page');
            const currentPage = document.querySelector('.page.active');
            const effect = this.getAttribute('data-effect') || TransitionConfig.defaultEffect;

            if (targetPage && currentPage && targetPage !== currentPage) {
                transitionPages(currentPage, targetPage, effect);
            }
        });
    });

    // Main transition function
    function transitionPages(fromPage, toPage, effect) {
        // Prevent multiple transitions
        if (document.body.classList.contains('transitioning')) return;
        document.body.classList.add('transitioning');

        const fromId = fromPage.id;
        const toId = toPage.id;
        const isForward = (fromId === 'login-page' && toId === 'signup-page');

        const animClasses = getAnimationClasses(effect, isForward);
        const duration = getEffectDuration(effect);

        // Prepare target page
        toPage.style.display = 'flex';
        toPage.style.position = 'absolute';
        toPage.style.top = '0';
        toPage.style.left = '0';
        toPage.style.width = '100%';
        toPage.style.zIndex = '10';

        // Trigger animation
        requestAnimationFrame(() => {
            fromPage.classList.add(animClasses.out);
            toPage.classList.add(animClasses.in);

            setTimeout(() => {
                // Clean up
                fromPage.classList.remove('active', animClasses.out);
                toPage.classList.remove(animClasses.in);
                toPage.classList.add('active');

                // Reset styles
                toPage.style.position = '';
                toPage.style.top = '';
                toPage.style.left = '';
                toPage.style.width = '';
                toPage.style.zIndex = '';
                toPage.style.display = '';

                document.body.classList.remove('transitioning');

                // Update URL
                const pageName = toId.replace('-page', '');
                history.replaceState(null, null, '#' + pageName);
            }, duration);
        });
    }

    function getAnimationClasses(effect, isForward) {
        const effects = {
            fadeSlide: {
                out: isForward ? 'fade-slide-out' : 'fade-slide-out-reverse',
                in: isForward ? 'fade-slide-in' : 'fade-slide-in-reverse'
            },
            scaleFade: {
                out: 'scale-fade-out',
                in: 'scale-fade-in'
            },
            blurFade: {
                out: 'blur-fade-out',
                in: 'blur-fade-in'
            }
        };
        return effects[effect] || effects.fadeSlide;
    }

    function getEffectDuration(effect) {
        const durations = {
            fadeSlide: 500,
            scaleFade: 450,
            blurFade: 550
        };
        return durations[effect] || 500;
    }
});

window.TransitionConfig = TransitionConfig;