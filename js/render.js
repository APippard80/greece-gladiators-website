/*
  Renders ROSTER / SCHEDULE (from data.js) into whichever page has the
  matching container element. Safe to load on every page — each render
  function checks its container exists before doing anything.
*/

function sortedSchedule() {
  return [...SCHEDULE].sort((a, b) => a.date.localeCompare(b.date));
}

function typeClass(type) {
  return "type-" + type.toLowerCase();
}

function renderRoster() {
  const el = document.getElementById("roster-container");
  if (!el) return;
  el.innerHTML = ROSTER.map(function (p) {
    const photo = p.photo
      ? '<img class="player-photo" src="' + p.photo + '" alt="' + p.name + '">'
      : '<div class="player-photo player-placeholder" title="Photo Coming Soon">&#128247;</div>';
    const video = p.video
      ? '<a class="player-video" href="' + p.video + '" target="_blank" rel="noopener">&#9658; What Baseball Means to Me</a>'
      : '<div class="player-video player-placeholder">&#9658; Video Coming Soon</div>';
    return (
      '<div class="player-card">' +
      '<div class="player-top">' +
      photo +
      '<div class="player-info">' +
      '<div class="jersey">' + p.number + "</div>" +
      '<div class="pname">' + p.name + (p.placeholder ? ' <span class="badge-sample">Sample</span>' : "") + "</div>" +
      '<div class="ppos">' + p.position + "</div>" +
      "</div>" +
      "</div>" +
      video +
      "</div>"
    );
  }).join("");
}

function renderSchedule() {
  const el = document.getElementById("schedule-container");
  if (!el) return;
  el.innerHTML = sortedSchedule().map(function (g) {
    return (
      '<div class="sched-card ' + typeClass(g.type) + '" data-date="' + g.date + '">' +
      '<div class="sched-date"><div class="dow">' + g.displayDate.split(",")[0] + '</div><div class="d">' + g.displayDate.split(",")[1].trim() + "</div></div>" +
      '<div class="sched-info"><div class="title">' + g.opponent + (g.placeholder ? ' <span class="badge-sample">Sample</span>' : "") + '</div><div class="meta">' + g.time + " &middot; " + g.location + "</div></div>" +
      '<div class="type-tag">' + (g.type === "Game" ? "⚾ " : "") + g.type + "</div>" +
      "</div>"
    );
  }).join("");
}

function renderNextUp() {
  const el = document.getElementById("next-up-container");
  if (!el) return;
  const today = new Date().toISOString().slice(0, 10);
  const next = sortedSchedule().find(function (g) {
    return g.date >= today;
  });
  if (!next) {
    el.innerHTML =
      '<div class="label">Next Up</div>' +
      '<div class="detail">Nothing on the calendar yet</div>' +
      '<div class="meta">Check back soon, or view the full schedule.</div>';
    return;
  }
  const detail = next.type === "Game" ? "Gladiators " + next.opponent : next.opponent;
  el.innerHTML =
    '<div class="label">Next Up &middot; ' + next.type + '</div>' +
    '<div class="detail">' + detail + (next.placeholder ? ' <span class="badge-sample">Sample</span>' : "") + "</div>" +
    '<div class="meta">' + next.displayDate + " &middot; " + next.time + " &middot; " + next.location + "</div>";
}

function initHidePastToggle() {
  const toggle = document.getElementById("hide-past-toggle");
  const list = document.getElementById("schedule-container");
  if (!toggle || !list) return;
  const today = new Date().toISOString().slice(0, 10);

  function apply() {
    list.querySelectorAll(".sched-card").forEach(function (card) {
      card.style.display = toggle.checked && card.getAttribute("data-date") < today ? "none" : "";
    });
  }

  let saved = true;
  try {
    const stored = localStorage.getItem("hidePastEvents");
    if (stored !== null) saved = stored === "1";
  } catch (e) {}
  toggle.checked = saved;
  apply();

  toggle.addEventListener("change", function () {
    try {
      localStorage.setItem("hidePastEvents", toggle.checked ? "1" : "0");
    } catch (e) {}
    apply();
  });
}

function renderPhaseTracks() {
  document.querySelectorAll(".phase-track[data-phases]").forEach(function (el) {
    el.innerHTML = SEASON_PHASES.map(function (p) {
      return (
        "<li" + (p.current ? ' class="is-current"' : "") + ">" +
        '<span class="phase-when">' + p.when + "</span>" +
        '<span class="phase-name">' + p.name + "</span>" +
        '<span class="phase-note">' + p.note + "</span>" +
        "</li>"
      );
    }).join("");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderPhaseTracks();
  renderRoster();
  renderSchedule();
  renderNextUp();
  initHidePastToggle();
});
