/*
  Shared header + footer, injected on every page from one place.
  Edit the nav links, footer links, or social URLs here ONCE and every
  page picks up the change — no need to touch each HTML file.
*/

const HEADER_HTML = `
  <div class="nav-inner">
    <a href="index.html" class="brand">
      <span class="crest"><img src="assets/logo/circle-emblem.png" alt="Greece Gladiators logo"></span>
      <span class="brand-text">Gladiators<small>12U Black &middot; Greece, NY</small></span>
    </a>
    <a href="cooperstown.html" aria-label="Our trip to Cooperstown" class="header-badge-link">
      <img src="assets/logo/cooperstown-official.svg" alt="Cooperstown All-Star Village" class="header-cooperstown-logo">
    </a>
    <button class="nav-toggle" aria-label="Toggle menu">&#9776;</button>
    <nav class="main-nav">
      <ul>
        <li><a href="index.html" data-page="index.html">Home</a></li>
        <li><a href="cooperstown.html" data-page="cooperstown.html">Cooperstown</a></li>
        <li><a href="roster.html" data-page="roster.html">Roster</a></li>
        <li><a href="schedule.html" data-page="schedule.html">Schedule</a></li>
        <li><a href="photos.html" data-page="photos.html">Photos</a></li>
        <li><a href="sponsors.html" data-page="sponsors.html">Sponsors</a></li>
        <li><a href="fundraisers.html" data-page="fundraisers.html">Fundraisers</a></li>
        <li><a href="community-service.html" data-page="community-service.html">Community Service</a></li>
        <li><a href="social.html" data-page="social.html">Social</a></li>
      </ul>
    </nav>
  </div>
  <div class="border-red"></div>
  <div class="stitch-divider" aria-hidden="true"></div>
  <div class="border-red"></div>
`;

const FOOTER_HTML = `
  <div class="border-red"></div>
  <div class="stitch-divider" aria-hidden="true"></div>
  <div class="border-red"></div>
  <div class="footer-inner">
    <img class="footer-wordmark" src="assets/logo/wordmark.png" alt="Greece Gladiators Baseball">
    <p>&copy; <span class="year"></span> Greece Gladiators (12U Black) &middot; Greece, NY</p>
  </div>
`;

document.addEventListener("DOMContentLoaded", function () {
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  if (headerEl) headerEl.innerHTML = HEADER_HTML;
  if (footerEl) footerEl.innerHTML = FOOTER_HTML;

  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav.main-nav a[data-page]").forEach(function (link) {
    if (link.getAttribute("data-page") === current) {
      link.classList.add("active");
    }
  });

  const yearEl = document.querySelector(".year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }
});
