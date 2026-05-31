let oldScroll = 0;

document.addEventListener("scroll", () =>
{
   const scrolledUp = oldScroll > window.scrollY;
   oldScroll = window.scrollY;

    const header = document.getElementsByTagName("header")[0];
      if (!scrolledUp) {
         header.classList.add("hidden");
      } else {
         header.classList.remove("hidden");
      }
});