# Greece Gladiators 12U Black — Team Website

A plain HTML/CSS/JS site — no build tools, no installs needed. Open `index.html`
in a browser to preview it, or upload the whole folder to any web host
(GitHub Pages, Netlify, etc.).

## The Cooperstown trip

This site is built around one central story: the team's trip to the
**Cooperstown All-Star Village** this summer, and raising the money to get
there. That's why the Home hero, the crimson "We're Going to Cooperstown"
banner, and the Sponsors/Fundraisers pages all point back to it.

Open **`cooperstown.html`** to edit the trip page itself — the stats row (7
games / 1 week / 1839), the "What the Week Looks Like" list, the "Why We're
Asking for Help" section, and the fundraising progress bar (currently a
placeholder — update `$0 of $15,000 raised` and the bar's `width` once you
have a real number and goal).

### The Cooperstown badge and logo

Two different Cooperstown graphics are used on the site:

- **Header** — the *real, official* Cooperstown All-Star Village logo, saved
  at `assets/logo/cooperstown-official.svg` (downloaded from cooperstown.com).
  It's white artwork, so it only shows up against a dark background — that's
  also why it's hidden below ~980px width (`.header-badge-link` in
  `css/styles.css`), to keep the nav from crowding on tablets/phones.
- **Home hero, Home banner, and `cooperstown.html`** — a custom circular
  "COOPERSTOWN / ALL-STAR VILLAGE / 12U BLACK" patch, hand-built as inline SVG
  (not an image file). The same markup is copy-pasted into each spot with
  different `id`s on its internal paths (SVG `id`s must be unique per page) —
  if you ever need to edit its text or colors, search for
  `COOPERSTOWN</textPath>` in `index.html` and `cooperstown.html` and update
  all three occurrences.

## How to update the roster or schedule

Open **`js/data.js`** in any text editor (Notepad works). Everything is a list
of `{ ... }` entries — copy one, change the values in quotes, keep the commas.

- Roster entry: `{ number: "7", name: "Real Name", position: "SS", placeholder: false }`
- Schedule entry: `{ date: "2026-10-11", displayDate: "Sun, Oct 11", time: "1:00 PM", type: "Game", opponent: "vs. Real Opponent", location: "Real Field", placeholder: false }`

Set `placeholder: false` (or delete that line) once you replace sample data with
the real thing — that's what removes the "SAMPLE" ribbon.

`type` must be exactly `"Game"`, `"Practice"`, or `"Event"`.

The Home page's "Next Up" box updates itself automatically from the same file —
no need to edit it separately.

## How to add game photos

The gallery on `photos.html` already has real team photos in it. To add more,
open **`photos.html`** and add another tile to the grid:
```html
<img class="photo-tile" src="assets/photos/your-photo.jpg" data-full="assets/photos/your-photo.jpg" alt="Description of the photo">
```
Drop the actual photo file into the `assets/photos/` folder first. Clicking the
photo will open it full-size automatically — no other setup needed.

The Home page's "Team Moments" strip (a 4-photo teaser above "This Season")
works the same way — edit the `<a href="photos.html"><img ...></a>` blocks in
`index.html`.

Each page's colored banner near the top (the "page-hero") also shows a
background photo — set by a `style="--page-hero-img:url('../assets/photos/your-photo.jpg')"`
attribute on the `<div class="page-hero">` in that page's HTML. The path must
start with `../` (not `/` and not a bare `assets/...`): the actual `url(...)`
is applied inside `css/styles.css` via `var(--page-hero-img)`, and browsers
resolve relative URLs passed through custom properties relative to the
stylesheet that consumes them, not the HTML page that sets them — so the path
needs to back out of `css/` first. A bare `assets/...` path here loads fine in
some places and silently 404s in others, which is easy to miss without
checking network requests.

## How to add sponsors

Open **`sponsors.html`** and copy one `.sponsor-card` block, replacing the logo
box, name, and blurb. Drop sponsor logo image files into `assets/sponsors/`.

## How to add fundraisers

Open **`fundraisers.html`** and copy one `.fundraiser-card` block. Each card
has a status chip — use `status-active`, `status-upcoming`, or
`status-completed` (these just control the chip's color/label). Swap the
`<div class="fundraiser-placeholder">Photo Coming Soon</div>` for a real photo
once you have one:
```html
<img class="fundraiser-photo" src="assets/photos/your-photo.jpg" alt="Description">
```

## Team logo

The real team logo is already in — `assets/logo/circle-emblem.png` (the
gladiator/baseball crest, used in the header and browser tab icon) and
`assets/logo/wordmark.png` (the full "GLADIATORS BASEBALL" logo, used big in
the Home page hero and again in the footer on every page). If you ever get a
cleaner/higher-resolution version of either file, just overwrite the file at
that same path and every page picks it up automatically — no HTML/CSS
changes needed (see the note below about clearing your browser's cache after
you do this).

## If you edit a file and don't see the change

Browsers aggressively cache `.css` and `.js` files. Every page loads them
with a version tag, like `css/styles.css?v=20` — if you edit `css/styles.css`,
`js/data.js`, `js/render.js`, `js/partials.js`, or `js/main.js` and your
changes don't show up, bump that version number by one everywhere it
appears across **all 8** HTML files (index, cooperstown, roster, schedule,
sponsors, fundraisers, social, photos), then reload. Editing an `.html` file
directly, or adding/replacing an image, doesn't need this — only the shared
CSS/JS files.

## How to add real social media / GameChanger links

- Social links: edit `social.html` (and the footer links in `js/partials.js`) —
  replace the `#` placeholders with your real Facebook/Instagram URLs.
- GameChanger: edit `schedule.html` — replace the `#` in the "View on
  GameChanger" button with the team's real GameChanger page URL.

## Contact email placeholder

The "Become a Sponsor" button on `sponsors.html` and the "Want to Help?"
button on `fundraisers.html` both use a placeholder email
(`info@greecegladiators12ublack.com`). Replace it with a real contact address
when ready.
