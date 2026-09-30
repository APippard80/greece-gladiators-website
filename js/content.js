/*
  SPONSORS / FUNDRAISERS / COMMUNITY SERVICE CARDS
  ------------------------------------------------
  These three pages build their cards from js/content.json. That file is
  rewritten automatically every morning by scripts/sync_content.py, which
  reads the "Gladiators 12U Black Website" folder in Google Drive — so to add
  or change a card, add or edit a folder in Drive rather than editing HTML.

  Each page marks where its cards go with data-content="<section>", where
  <section> is "sponsors", "fundraisers", or "communityService".
*/

const STATUS_ORDER = { active: 0, upcoming: 1, completed: 2 };

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeLink(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url) ? url : null;
}

// Blank lines in the Drive description become separate paragraphs.
function paragraphs(text) {
  return String(text || "")
    .split(/\n\s*\n/)
    .map(function (p) { return p.trim(); })
    .filter(Boolean)
    .map(function (p) { return "<p>" + escapeHtml(p).replace(/\n/g, "<br>") + "</p>"; })
    .join("");
}

// Active first, then Upcoming (soonest first), then Completed (most recent first).
// Items without a sortable date keep their order at the end of their group.
function sortItems(items) {
  return items
    .map(function (item, i) { return { item: item, i: i }; })
    .sort(function (a, b) {
      const sa = STATUS_ORDER[(a.item.status || "").toLowerCase()];
      const sb = STATUS_ORDER[(b.item.status || "").toLowerCase()];
      const ga = sa === undefined ? 1 : sa;
      const gb = sb === undefined ? 1 : sb;
      if (ga !== gb) return ga - gb;
      const da = a.item.dateSort || "";
      const db = b.item.dateSort || "";
      if (da && db && da !== db) return ga === 2 ? db.localeCompare(da) : da.localeCompare(db);
      if (da !== db) return da ? -1 : 1;
      return a.i - b.i;
    })
    .map(function (x) { return x.item; });
}

function visible(items) {
  return (items || []).filter(function (item) {
    return (item.status || "").toLowerCase() !== "hidden";
  });
}

function eventCard(item) {
  const status = (item.status || "").trim();
  const photo = item.image
    ? '<img class="fundraiser-photo" src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">'
    : '<div class="fundraiser-placeholder">Photos Coming Soon</div>';
  const link = safeLink(item.link);
  return (
    '<div class="fundraiser-card">' +
    photo +
    '<div class="fundraiser-body">' +
    (status ? '<span class="status-chip status-' + escapeHtml(status.toLowerCase()) + '">' + escapeHtml(status) + "</span>" : "") +
    "<h3>" + escapeHtml(item.title) + "</h3>" +
    (item.date ? '<div class="fundraiser-meta">' + escapeHtml(item.date) + "</div>" : "") +
    paragraphs(item.description) +
    (link ? '<a class="card-link" href="' + escapeHtml(link) + '" target="_blank" rel="noopener">Learn More &rarr;</a>' : "") +
    "</div>" +
    "</div>"
  );
}

function sponsorCard(item) {
  const logo = item.image
    ? '<div class="sponsor-logo-box has-logo"><img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + ' logo" loading="lazy"></div>'
    : '<div class="sponsor-logo-box">Sponsor Logo</div>';
  const inner = logo + "<h3>" + escapeHtml(item.title) + "</h3>" + paragraphs(item.description);
  const link = safeLink(item.link);
  return link
    ? '<a class="sponsor-card is-link" href="' + escapeHtml(link) + '" target="_blank" rel="noopener">' + inner + "</a>"
    : '<div class="sponsor-card">' + inner + "</div>";
}

const EMPTY_MESSAGES = {
  sponsors: "Sponsor spots are open — be the first to back the team!",
  fundraisers: "New fundraisers are on the way — check back soon.",
  communityService: "Community events are on the way — check back soon.",
};

function renderSection(el, data) {
  const section = el.getAttribute("data-content");
  const items = sortItems(visible(data[section]));
  if (!items.length) {
    el.innerHTML = '<p class="content-empty">' + EMPTY_MESSAGES[section] + "</p>";
    return;
  }
  el.innerHTML = items.map(section === "sponsors" ? sponsorCard : eventCard).join("");
}

function renderSponsorFlyer(data) {
  const el = document.getElementById("sponsor-flyer");
  if (!el) return;
  const flyer = data.sponsorFlyer;
  if (!flyer || !flyer.image) {
    el.hidden = true;
    return;
  }
  el.innerHTML =
    '<a href="' + escapeHtml(flyer.image) + '" target="_blank" rel="noopener">' +
    '<img src="' + escapeHtml(flyer.image) + '" alt="Sponsorship flyer for the Greece Gladiators (12U Black)"></a>';
  el.hidden = false;
}

document.addEventListener("DOMContentLoaded", function () {
  const targets = document.querySelectorAll("[data-content]");
  if (!targets.length) return;
  fetch("js/content.json", { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      targets.forEach(function (el) { renderSection(el, data); });
      renderSponsorFlyer(data);
    })
    .catch(function () {
      targets.forEach(function (el) {
        el.innerHTML = '<p class="content-empty">Couldn\'t load this section right now — please refresh the page.</p>';
      });
    });
});
