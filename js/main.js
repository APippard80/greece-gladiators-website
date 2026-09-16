/*
  Always start each page load at the top, instead of the browser restoring
  whatever scroll position it remembers from a previous visit to that page.
  scrollRestoration is also set inline in <head> (before CSS/images load) so
  it takes effect before the browser has a chance to restore anything; the
  pageshow listener re-applies it on bfcache back/forward restores too, since
  those don't re-run DOMContentLoaded.
*/
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);
window.addEventListener("pageshow", function () {
  window.scrollTo(0, 0);
});

/*
  Page-hero background fit — shows the photo at its actual (uncropped) height
  whenever that doesn't leave empty gaps on the sides; falls back to cropping
  to fill the full width whenever the photo is too narrow/tall to cover it.
  Re-checked on resize since which mode fits depends on the live viewport width.
*/
function fitPageHeroBackground(hero) {
  const raw = getComputedStyle(hero).getPropertyValue("--page-hero-img");
  const match = raw && raw.match(/url\((?:"([^"]+)"|'([^']+)'|([^)]+))\)/);
  const src = match && (match[1] || match[2] || match[3]);
  if (!src) return;
  const img = new Image();
  img.onload = function () {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = hero.clientWidth / hero.clientHeight;
    hero.style.backgroundSize = imgRatio >= boxRatio ? "auto 100%" : "cover";
  };
  img.src = src;
}

function initPageHeroFit() {
  const heroes = document.querySelectorAll(".page-hero");
  if (!heroes.length) return;
  heroes.forEach(fitPageHeroBackground);
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      heroes.forEach(fitPageHeroBackground);
    }, 150);
  });
}

/*
  Photo lightbox — inert until real photos are added to the Photos page.
  Once you add real <img class="photo-tile-real" data-full="path/to/full.jpg">
  tiles, clicking one opens it full-size here.
*/
document.addEventListener("DOMContentLoaded", function () {
  initPageHeroFit();

  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;
  const lightboxImg = lightbox.querySelector("img");
  const closeBtn = lightbox.querySelector(".lightbox-close");

  document.querySelectorAll("[data-full]").forEach(function (tile) {
    tile.addEventListener("click", function () {
      lightboxImg.src = tile.getAttribute("data-full");
      lightbox.classList.add("open");
    });
  });

  function closeLightbox() { lightbox.classList.remove("open"); }
  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
});
