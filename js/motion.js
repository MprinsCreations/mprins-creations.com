const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let smoothScroll;
let scrollFrame;

const updateSmoothScroll = time => {
    smoothScroll.raf(time);
    scrollFrame = requestAnimationFrame(updateSmoothScroll);
};

const syncMotion = () => {
    document.querySelectorAll('video[autoplay]').forEach(video => {
        if (motionPreference.matches) {
            video.pause();
        } else {
            video.play().catch(() => {});
        }
    });

    cancelAnimationFrame(scrollFrame);
    smoothScroll?.destroy();
    smoothScroll = undefined;

    if (!motionPreference.matches && window.Lenis) {
        smoothScroll = new window.Lenis({ allowNestedScroll: true });
        scrollFrame = requestAnimationFrame(updateSmoothScroll);
    }
};

motionPreference.addEventListener('change', syncMotion);
syncMotion();
