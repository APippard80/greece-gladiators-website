/*
  ROSTER & SCHEDULE DATA
  ----------------------
  This is the ONLY file you need to edit to update the roster or schedule.
  Everything below is a plain list of { ... } entries — copy an existing
  entry, change the values between the quotes, and add a comma between entries.

  Set placeholder: true on any sample row you haven't replaced yet — it shows
  a small "SAMPLE" ribbon so nobody mistakes it for a real player/game.
  Once you replace an entry with real info, delete the `placeholder: true,` line
  (or change it to `placeholder: false,`).

  photo: path to a headshot, e.g. "assets/photos/roster/jaxson-ferra.jpg" — leave
  as null to show a "Photo Coming Soon" placeholder.
  video: a URL (YouTube, etc.) to that player's "What Baseball Means to Me" clip —
  leave as null to show a "Video Coming Soon" placeholder.
*/

const ROSTER = [
  { number: "1",  name: "Jaxson Ferra",         position: "—", placeholder: false, photo: null, video: null },
  { number: "2",  name: "Cameron Everhart",     position: "—", placeholder: false, photo: null, video: null },
  { number: "4",  name: "Logan Jerge",          position: "—", placeholder: false, photo: null, video: null },
  { number: "5",  name: "Joseph JT Pippard",    position: "—", placeholder: false, photo: null, video: null },
  { number: "7",  name: "Royal Newton",         position: "—", placeholder: false, photo: null, video: null },
  { number: "10", name: "Manny Vega",           position: "—", placeholder: false, photo: null, video: null },
  { number: "11", name: "Declan Spell",         position: "—", placeholder: false, photo: null, video: null },
  { number: "15", name: "Isaiah Doty",          position: "—", placeholder: false, photo: null, video: null },
  { number: "17", name: "Jaxson Paquette",      position: "—", placeholder: false, photo: null, video: null },
  { number: "20", name: "Robert Collyer",       position: "—", placeholder: false, photo: null, video: null },
  { number: "28", name: "Louis Carrion",        position: "—", placeholder: false, photo: null, video: null },
  { number: "44", name: "Dominic Llerena",      position: "—", placeholder: false, photo: null, video: null },
];

/*
  SCHEDULE
  --------
  type must be exactly "Game", "Practice", or "Event" (controls the color tag).
  date should be sortable, e.g. "2026-09-20" (YYYY-MM-DD) so entries stay in order
  automatically no matter what order you add them in.
*/

const SCHEDULE = [
  { date: "2026-08-15", displayDate: "Sat, Aug 15", time: "3:00 – 4:00 PM",  type: "Event",    opponent: "Parents Meeting",                      location: "145 Dorsetwood Dr, Rochester, NY",             placeholder: false },
  { date: "2026-09-14", displayDate: "Mon, Sep 14", time: "7:00 – 8:30 PM",  type: "Practice", opponent: "Team Practice",                         location: "The Armory Baseball and Softball, Rochester, NY", placeholder: false },
  { date: "2026-09-19", displayDate: "Sat, Sep 19", time: "12:00 – 2:00 PM", type: "Practice", opponent: "7th Grade Practice (open, modified age)", location: "Odyssey Academy, Rochester, NY",               placeholder: false },
  { date: "2026-09-21", displayDate: "Mon, Sep 21", time: "5:30 – 7:00 PM",  type: "Practice", opponent: "Team Practice",                         location: "The Armory Baseball and Softball, Rochester, NY", placeholder: false },
  { date: "2026-09-28", displayDate: "Mon, Sep 28", time: "5:30 – 7:00 PM",  type: "Practice", opponent: "Team Practice",                         location: "The Armory Baseball and Softball, Rochester, NY", placeholder: false },
  { date: "2026-10-01", displayDate: "Thu, Oct 1",  time: "5:30 – 7:00 PM",  type: "Event",    opponent: "Bottle & Can Drive — Flyer Handout",     location: "167 Sharon Dr, Rochester, NY",                 placeholder: false },
  { date: "2026-10-03", displayDate: "Sat, Oct 3",  time: "Time TBD",        type: "Practice", opponent: "Practice with St. John Fisher Team",     location: "St. John Fisher University, Rochester, NY",    placeholder: false },
  { date: "2026-10-05", displayDate: "Mon, Oct 5",  time: "5:30 – 7:00 PM",  type: "Practice", opponent: "Team Practice",                         location: "The Armory Baseball and Softball, Rochester, NY", placeholder: false },
  { date: "2026-10-12", displayDate: "Mon, Oct 12", time: "7:00 – 8:30 PM",  type: "Practice", opponent: "Team Practice",                         location: "The Armory Baseball and Softball, Rochester, NY", placeholder: false },
  { date: "2026-10-16", displayDate: "Fri, Oct 16", time: "12:00 – 6:00 PM", type: "Event",    opponent: "Gladiators Golf Tournament (org-wide)",  location: "Salmon Creek Country Club, Spencerport, NY",   placeholder: false },
  { date: "2026-10-17", displayDate: "Sat, Oct 17", time: "9:30 – 11:30 AM", type: "Event",    opponent: "Bottle & Can Drive — Pickup",             location: "Greece, NY",                                    placeholder: false },
  { date: "2026-10-19", displayDate: "Mon, Oct 19", time: "5:30 – 7:00 PM",  type: "Practice", opponent: "Team Practice",                         location: "The Armory Baseball and Softball, Rochester, NY", placeholder: false },
  { date: "2026-10-26", displayDate: "Mon, Oct 26", time: "5:30 – 7:00 PM",  type: "Practice", opponent: "Team Practice",                         location: "The Armory Baseball and Softball, Rochester, NY", placeholder: false },
  { date: "2026-11-02", displayDate: "Mon, Nov 2",  time: "5:30 – 7:00 PM",  type: "Practice", opponent: "Team Practice",                         location: "The Armory Baseball and Softball, Rochester, NY", placeholder: false },
  { date: "2026-11-09", displayDate: "Mon, Nov 9",  time: "7:00 – 8:30 PM",  type: "Practice", opponent: "Team Practice",                         location: "The Armory Baseball and Softball, Rochester, NY", placeholder: false },
  { date: "2026-11-16", displayDate: "Mon, Nov 16", time: "5:30 – 7:00 PM",  type: "Practice", opponent: "Team Practice",                         location: "The Armory Baseball and Softball, Rochester, NY", placeholder: false },
  { date: "2026-11-30", displayDate: "Mon, Nov 30", time: "5:30 – 7:00 PM",  type: "Practice", opponent: "Team Practice",                         location: "The Armory Baseball and Softball, Rochester, NY", placeholder: false },
  { date: "2026-12-07", displayDate: "Mon, Dec 7",  time: "5:30 – 7:00 PM",  type: "Practice", opponent: "Team Practice",                         location: "The Armory Baseball and Softball, Rochester, NY", placeholder: false },
  { date: "2026-12-14", displayDate: "Mon, Dec 14", time: "7:00 – 8:30 PM",  type: "Practice", opponent: "Team Practice",                         location: "The Armory Baseball and Softball, Rochester, NY", placeholder: false },
  { date: "2027-07-15", displayDate: "Thu, Jul 15", time: "All Day (Jul 15–19)", type: "Event", opponent: "Lou Izzo Tournament",                  location: "Grace and Truth Sportspark, Hilton, NY",       placeholder: false },
  { date: "2027-07-23", displayDate: "Fri, Jul 23", time: "All Day (Jul 23–30)", type: "Event", opponent: "Cooperstown All-Star Village Tournament", location: "4158 NY-23, Oneonta, NY",                    placeholder: false },
];
