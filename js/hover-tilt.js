const reduceTiltMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('.hover-tilt').forEach(wrapper => {
    if (reduceTiltMotion.matches) return;

    const tile = wrapper.firstElementChild;
    if (!tile) return;

    const maxTilt = Number(wrapper.dataset.maxTilt) || 5;
    const scale = Number(wrapper.dataset.tileScale) || 1.005;
    const perspective = Number(wrapper.dataset.perspective) || 800;

    Object.assign(wrapper.style, {
        width: '100%',
        height: '100%',
        perspective: `${perspective}px`,
        perspectiveOrigin: 'center'
    });
    tile.style.transformStyle = 'preserve-3d';

    wrapper.addEventListener('pointerenter', () => {
        tile.style.transition = 'transform 300ms cubic-bezier(0.2, 1.25, 0.3, 1)';
    });

    wrapper.addEventListener('pointermove', event => {
        const rect = wrapper.getBoundingClientRect();
        const strength = maxTilt * Math.min(1, 320 / Math.max(rect.width, rect.height)) * 2;
        const rotateX = -(event.clientY - rect.top) / rect.height * strength + strength / 2;
        const rotateY = (event.clientX - rect.left) / rect.width * strength - strength / 2;

        tile.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
    });

    wrapper.addEventListener('pointerleave', () => {
        tile.style.transition = 'transform 500ms cubic-bezier(0.4, 2.4, 0.4, 1)';
        tile.style.transform = 'none';
    });
});
