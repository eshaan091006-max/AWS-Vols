# Assets

## music.mp3

Drop your track here as `music.mp3`. It starts when the dial-up dialog opens,
goes silent during the fake rejection, and slams back in on the reveal. It loops.

Until this file exists the site runs silently and the mute button is hidden.
Nothing else changes. (Your browser console will log one 404 for the missing
file — that is the browser reporting a network request, not an app error.)

Keep it under about 3 MB. Most vols will open this on mobile data.

## memes/

Per-vol images. Reference them from `data/vols.json` as `/memes/<file>`.
Anything the browser renders works: jpg, png, gif, webp.

`sample.png` is a generated placeholder used by the seed data. Delete it once
you have replaced the sample vols with real ones.
