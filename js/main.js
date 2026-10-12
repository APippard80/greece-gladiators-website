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
  Photo lightbox — clicking any element with data-full="path/to/image.jpg"
  opens that image full-size. If the element also has
  data-gallery='["a.jpg","b.jpg",...]', the arrows / arrow keys / a swipe
  scroll through all of those photos. Works for images added after page load
  (the Sponsors / Fundraisers / Community Service cards from js/content.js),
  and builds the lightbox itself on pages that don't include its markup.
  Close with the ×, a click outside the image, or the Esc key.
*/
function getLightbox() {
  let lightbox = document.getElementById("lightbox");
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.id = "lightbox";
    lightbox.innerHTML = '<button class="lightbox-close" aria-label="Close">&times;</button><img src="" alt="">';
    document.body.appendChild(lightbox);
  }
  if (!lightbox.querySelector(".lightbox-prev")) {
    lightbox.insertAdjacentHTML("beforeend",
      '<button class="lightbox-nav lightbox-prev" aria-label="Previous photo">&#8249;</button>' +
      '<button class="lightbox-nav lightbox-next" aria-label="Next photo">&#8250;</button>' +
      '<div class="lightbox-counter" aria-live="polite"></div>');
  }
  return lightbox;
}

document.addEventListener("DOMContentLoaded", function () {
  initPageHeroFit();

  const lightbox = getLightbox();
  const lightboxImg = lightbox.querySelector("img");
  const counter = lightbox.querySelector(".lightbox-counter");
  let photos = [];
  let index = 0;

  function show(i) {
    index = (i + photos.length) % photos.length;
    lightboxImg.src = photos[index];
    const many = photos.length > 1;
    lightbox.classList.toggle("is-gallery", many);
    counter.textContent = many ? index + 1 + " / " + photos.length : "";
    if (many) new Image().src = photos[(index + 1) % photos.length]; // preload the next one
  }

  function open(tile) {
    let list = null;
    try { list = JSON.parse(tile.getAttribute("data-gallery") || "null"); } catch (err) {}
    photos = Array.isArray(list) && list.length ? list : [tile.getAttribute("data-full")];
    lightboxImg.alt = tile.getAttribute("data-alt") || tile.getAttribute("alt") || "";
    show(Math.max(0, photos.indexOf(tile.getAttribute("data-full"))));
    lightbox.classList.add("open");
  }

  function isOpen() { return lightbox.classList.contains("open"); }
  function closeLightbox() { lightbox.classList.remove("open"); }

  document.addEventListener("click", function (e) {
    if (e.target.closest(".lightbox-prev")) return show(index - 1);
    if (e.target.closest(".lightbox-next")) return show(index + 1);
    const tile = e.target.closest("[data-full]");
    if (tile && !lightbox.contains(tile)) {
      e.preventDefault();
      open(tile);
    } else if (e.target === lightbox || e.target.closest(".lightbox-close")) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (isOpen()) {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft" && photos.length > 1) show(index - 1);
      else if (e.key === "ArrowRight" && photos.length > 1) show(index + 1);
      return;
    }
    // Keyboard users can open a focused photo with Enter or Space.
    const tile = e.target.closest && e.target.closest('[data-full][role="button"]');
    if (tile && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      open(tile);
    }
  });

  // Swipe left/right on phones to change photos.
  let touchX = null;
  lightbox.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", function (e) {
    if (touchX === null || photos.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) show(dx < 0 ? index + 1 : index - 1);
  });
});
