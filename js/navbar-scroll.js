const header = document.querySelector('header');
let previousScrollY = window.scrollY;

document.addEventListener('scroll', () => {
    header.classList.toggle('hidden', window.scrollY > previousScrollY);
    previousScrollY = window.scrollY;
}, { passive: true });
