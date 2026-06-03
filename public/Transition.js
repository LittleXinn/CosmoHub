const TransitionConfig = {
    defaultEffect: 'blurFade',
    duration: 550
};

document.addEventListener('DOMContentLoaded', function() {
    const pageLinks = document.querySelectorAll('.page-link');

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

    function transitionPages(fromPage, toPage, effect) {
        if (document.body.classList.contains('transitioning')) return;
        document.body.classList.add('transitioning');

        const fromId = fromPage.id;
        const toId = toPage.id;
        const isForward = (fromId === 'login-page' && toId === 'signup-page');

        const animClasses = getAnimationClasses(effect, isForward);
        const duration = getEffectDuration(effect);

        // Prepare: make both pages absolute during transition
        // This prevents flex layout from interfering with the animation
        const pages = [fromPage, toPage];
        pages.forEach(page => {
            page.style.position = 'fixed';
            page.style.top = '0';
            page.style.left = '0';
            page.style.width = '100%';
            page.style.height = '100%';
            page.style.minHeight = '100vh';
            page.style.zIndex = '1';
            page.style.display = 'flex';
            page.style.overflow = 'hidden';
        });

        // Stack: outgoing page below, incoming page above
        fromPage.style.zIndex = '5';
        toPage.style.zIndex = '10';

        // Ensure target page is visible but invisible initially
        toPage.style.opacity = '0';
        toPage.style.pointerEvents = 'none';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Add animation classes
                fromPage.classList.add(animClasses.out);
                toPage.classList.add(animClasses.in);

                // Make target page interactive during animation
                toPage.style.pointerEvents = 'auto';

                setTimeout(() => {
                    // Clean up animations
                    fromPage.classList.remove(animClasses.out);
                    toPage.classList.remove(animClasses.in);

                    // Switch active state
                    fromPage.classList.remove('active');
                    toPage.classList.add('active');

                    // Reset all inline styles
                    pages.forEach(page => {
                        page.style.position = '';
                        page.style.top = '';
                        page.style.left = '';
                        page.style.width = '';
                        page.style.height = '';
                        page.style.minHeight = '';
                        page.style.zIndex = '';
                        page.style.display = '';
                        page.style.overflow = '';
                        page.style.opacity = '';
                        page.style.pointerEvents = '';
                    });

                    document.body.classList.remove('transitioning');

                    // Update URL hash
                    const pageName = toId.replace('-page', '');
                    history.replaceState(null, null, '#' + pageName);
                }, duration);
            });
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
        return effects[effect] || effects.blurFade;
    }

    function getEffectDuration(effect) {
        const durations = {
            fadeSlide: 500,
            scaleFade: 450,
            blurFade: 550
        };
        return durations[effect] || 550;
    }
});

window.TransitionConfig = TransitionConfig;