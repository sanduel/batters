# Inglorious Batters

A single-page tool to build a batting order and assign field positions per inning
for slow-pitch softball (10 fielders: 4 outfielders).

## Use it

Open `index.html` in a browser — that's it. No server or build step.
To host it, drop the three files on any static host:

- `index.html` — the app
- `lineup.js` — the logic (loaded by the app)
- `tests.html` — dev-only logic tests (not needed in production)

## What it does

- **Batting Order** — add players (field is at the bottom of the list); drag rows
  to reorder (numbers renumber). Each player gets a distinct color.
  - **Batting order / A–Z toggle** — view the list in lineup order or sorted
    alphabetically. A–Z is display-only: each row keeps its batting number, and
    your lineup order is preserved when you switch back.
  - **Double-click a name** to edit/fix its spelling (updates the grid too).
- **Field grid** — 10 positions (P, C, SS, 1B, 2B, 3B, LF, LCF, RCF, RF) × 5 innings.
  Drag a player from the batting order into a cell to field them.
- **Move / change position** — dragging a player into a new slot *moves* them
  there: a player can only hold one position per inning, so the old slot is
  vacated automatically (no double-booking). The same player in *different*
  innings is fine and adds to their innings count.
- **Innings played** — each batting-order row shows `N / 5 inn`, the number of
  innings that player is fielding.
- **Per-inning fill** — each inning header shows `n/10` fielders assigned.
- **Share link** — encodes the whole game (batting order + every position) into a
  link. "Share link" copies it (or opens the share sheet on mobile) and updates the
  address bar so you can bookmark it. Opening that link on any device rebuilds the
  exact lineup — a self-contained snapshot, no account or server needed.
- **Mobile friendly** — panels stack, controls are touch-sized, drag works by
  press-and-hold (so normal scrolling still works), and the grid scrolls sideways
  with the position labels pinned.
- **Print / Save as PDF** — the toolbar button opens the browser print dialog;
  choose "Save as PDF". The batting order prints on its own page and the field
  grid on the next; controls and the per-player innings count are hidden, and
  player colors are preserved.
- **Auto-save** — the current game is saved in your browser (localStorage) and
  restored on reload. "Reset game" clears everything.

## Tests

- Logic unit tests: open `tests.html` in a browser; it reports pass/fail counts.
- The app uses [SortableJS](https://github.com/SortableJS/Sortable) (loaded from a
  CDN with Subresource Integrity) for drag-and-drop.
