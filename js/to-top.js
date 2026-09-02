document.addEventListener('click', event => {
    if (!event.target.closest('#to-top')) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    window.scrollTo({
        top: 0,
        behavior: reduceMotion.matches ? 'auto' : 'smooth'
    });
});
