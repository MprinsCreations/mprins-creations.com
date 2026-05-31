async function loadComponent(selector, file)
{
    const response = await fetch(file);
    const html = await response.text();

    document.querySelector(selector).innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () =>
{
    loadComponent("#navbar-container", "/components/navbar.html");
    loadComponent("#footer-container", "/components/footer.html");
});