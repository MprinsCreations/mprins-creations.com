document.addEventListener('click', (e) => {
  if (e.target.closest('#to-top')) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});