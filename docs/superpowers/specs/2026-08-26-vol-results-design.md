# AWS SBG Technicals — Vol Results Site

**Date:** 2026-08-26
**Status:** Approved design

## Purpose

Announce the ~20 selected volunteers for the AWS Student Builder Group
technicals team. Every vol is accepted. The site delivers that news as a
prank: it fake-rejects them, holds the dread for three seconds, then
detonates into an acceptance decorated with a meme and a message written
for them personally.

Inspired by `vol-results.vercel.app`, which shows one identical page to
everyone. The difference here is personalization.

## Success criteria

- A vol opens their link on a phone, and the reveal lands — dread, then
  relief, then a laugh at something written specifically about them.
- They want to screenshot it and post it.
- No vol can see another vol's page content before their own reveal.
- The organizer can add a vol by editing one JSON object and dropping one
  image in a folder.

## Constraints

- ~20 vols. Hand-authored content, no bulk import needed.
- Free hosting on Vercel.
- Organizer edits content in a code editor and pushes to deploy.
- Audio is a single organizer-supplied MP3, delivered later. The site must
  work correctly and silently before that file exists.
- Mobile-first. Most vols will open the link on a phone from a DM.

## Architecture

Next.js App Router, `output: 'export'` static export, deployed to Vercel.

Route: `/r/[slug]`. `generateStaticParams` reads `data/vols.json` at build
time and prerenders one HTML file per vol.

**Why static export, specifically:** each prerendered page contains only
that vol's data. A single client-side bundle holding all 20 records would
let any vol open devtools and read everyone's memes and messages before the
links went out, spoiling the surprise for the whole group. Per-page
prerendering seals each reveal without needing a backend or auth.

The root route `/` shows a decoy — a Y2K "404 / this site is under
construction" gag — so a stray visitor finds nothing and no vol index
exists.

## Data model

`data/vols.json`, an array of:

| Field | Required | Purpose |
|---|---|---|
| `slug` | yes | Unguessable URL segment, e.g. `aditya-k3f9`. Generated. |
| `name` | yes | Display name in the WordArt reveal. |
| `meme` | no | Path under `public/memes/`. Falls back to a generated placeholder. |
| `message` | no | The personal line. Falls back to shared default copy. |
| `consoleLines` | no | Extra fake-evaluation lines. Merged with shared defaults. |
| `accent` | no | Hex colour theming their panel. Falls back to a rotating palette. |

Every field but `name` degrades gracefully, so a half-filled entry still
produces a complete, funny page. This matters because content will be
written incrementally.

`scripts/links.mjs` (`npm run links`) assigns random slugs to any entry
missing one, writes them back to the JSON, and prints a `Name — URL` list
for distribution.

## Reveal sequence

State machine, one component per state, driven by a single `phase` value.

1. **DESKTOP** — Y2K desktop: tiled wallpaper, cursor trail, taskbar with a
   live clock, one icon `SBG_TECHNICALS_VERDICT.exe`. Inert until
   double-clicked. That gesture also unlocks audio, which browsers require.
2. **DIALUP** — connection dialog and progress bar. Music starts.
3. **EVALUATING** — AWS Console parody in Y2K dress. Lines stream in:
   `PROVISIONING VOL INSTANCE (t2.micro)`, `ATTACHING IAM ROLE:
   VolunteerFullAccess`, `BILLING ALERT: $0.00 — UNPAID LABOUR DETECTED`,
   plus the vol's own `consoleLines`. Progress bars stall at 99%.
4. **REJECTED** — CloudFormation stack rollback failure. Red BSOD, error
   dialogs stacking, screen shake, music cuts to silence. Held ~3s.
5. **FLIP** — BSOD shatters, music returns, confetti, marquee tickers,
   `YOU'RE IN` in bevelled WordArt.
6. **PANEL** — draggable Y2K window with their name, meme, and message.
7. **CARD** — button renders a 1080×1350 story card to canvas and downloads
   it.

Phases 4→5 are the whole point; the timing there gets tuned against the
real thing rather than specified here.

## Accessibility and safety valves

- `prefers-reduced-motion` disables shake, confetti, and cursor trail; the
  sequence still plays.
- Audio starts muted-capable and is user-triggered; a persistent mute
  control is always visible.
- The rejection phase is skippable by tap for anyone who does not want to
  sit through it.
- If `public/music.mp3` is absent, the site runs silently with no console
  errors and no broken UI.

## Out of scope

- Admin UI, database, authentication.
- Rejection or waitlist outcomes. Every vol in the file is accepted.
- Analytics, view tracking, guestbook.
