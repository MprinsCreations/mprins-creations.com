(() => {
    const root = document.documentElement;
    let viewportWidth = window.innerWidth;
    let resizeTimer;

    const lockBannerHeight = () => {
        const viewportHeight = window.innerHeight;

        viewportWidth = window.innerWidth;
        root.style.setProperty('--banner-height', `${viewportHeight / 2}px`);
        root.style.setProperty('--home-banner-height', `${viewportHeight}px`);
    };

    const handleResize = () => {
        if (window.innerWidth === viewportWidth) return;

        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(lockBannerHeight, 200);
    };

    lockBannerHeight();
    window.addEventListener('resize', handleResize, { passive: true });
})();
