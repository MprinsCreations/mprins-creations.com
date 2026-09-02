const loadComponent = async (selector, path) => {
    const response = await fetch(path);
    document.querySelector(selector).innerHTML = await response.text();
};

document.addEventListener('DOMContentLoaded', () => {
    loadComponent('#navbar-container', '/components/navbar.html');
    loadComponent('#footer-container', '/components/footer.html');
});
