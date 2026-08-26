# AWS SBG Technicals — Vol Results

A Y2K fever dream that fake-rejects each selected volunteer before revealing
they got in, decorated with a meme and a message written for them.

Every vol gets their own unguessable link. Each page is prerendered separately,
so no vol can read anyone else's meme or message before their own reveal.

```bash
npm install
npm run dev
```

## Adding a vol

Edit `data/vols.json`. One object per vol:

```json
{
  "slug": "shreyas-k3f9",
  "name": "Shreyas",
  "meme": "/memes/shreyas.jpg",
  "message": "you asked what a for loop was on day one. now look at you.",
  "consoleLines": ["EXCUSES COUNTED...... 4", "CHAI CONSUMED...... 61L"],
  "accent": "#ff00ff"
}
```

| Field | Required | What it does |
|---|---|---|
| `name` | **yes** | Shown in the reveal, the fake console, the rejection screen, and the flex card. |
| `slug` | generated | The URL segment. Leave it out and `npm run links` fills it in. |
| `meme` | no | Path under `public/memes/`. Omit it and they get a tidy placeholder frame. |
| `message` | no | The personal line. Omit it and a shared default is used. |
| `consoleLines` | no | Extra joke metrics spliced into the fake AWS console, just for them. |
| `accent` | no | Hex colour theming their page. Omit it and one is assigned from a palette. |

Only `name` really matters. Everything else degrades gracefully, so you can send
links before you have written every meme.

## Adding a meme

Drop the image in `public/memes/` and reference it as `/memes/<filename>`.
If the path is wrong the page quietly shows the placeholder instead of a broken
image, so a typo embarrasses nobody.

## Generating links

```bash
SITE_URL=https://your-real-site.vercel.app npm run links
```

This assigns a random suffix to any vol missing a slug, writes it back into
`data/vols.json`, and prints a `Name — URL` list to copy into your DMs. Vols
missing a meme or message are flagged so you can spot gaps.

**Slugs that already exist are never regenerated**, because you may already have
sent those links.

## The music

See [`public/README.md`](public/README.md). Short version: drop `music.mp3` into
`public/`. Until you do, the site is silent and shows no audio control.

## Deploying

Push to GitHub, import the repo in Vercel, accept the Next.js preset. No
environment variables, no database, no configuration. It is a static export.

## Before you send the links

- [ ] `npm test` passes
- [ ] `npm run build && npm run verify` reports no leaks
- [ ] `npm run links` shows no `[no meme, no message]` flags
- [ ] Every name is spelled the way that person spells it
- [ ] You have opened at least two real vol links on an actual phone
- [ ] `public/music.mp3` is in place, or you are happy shipping silent
- [ ] The sample vols are deleted from `data/vols.json`
- [ ] **Nobody on the list is someone who was not selected**

That last one matters more than the rest combined. This site tells everyone in
the file that they got in. A wrong name there is the one failure mode that
genuinely hurts someone.

## How it works

`data/vols.json` is read at build time. `generateStaticParams` prerenders one
HTML file per vol under `out/r/<slug>/`, each containing only that vol's content.
`npm run verify` greps every generated page for every *other* vol's message and
meme path and fails the build if it finds one.

The reveal is a five-phase client-side state machine in `src/components/Reveal.tsx`:
desktop → dial-up → evaluation → rejection → acceptance. The double-click on the
desktop icon is load-bearing: it is also the user gesture browsers require before
audio may play.

`prefers-reduced-motion` disables the screen shake, confetti, and cursor trail
while leaving the sequence intact. The rejection can be skipped by tapping,
though not for the first 1.2 seconds, so a reflex tap cannot rob someone of the
joke.
