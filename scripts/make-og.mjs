/**
 * Generates public/og.png, the card shown when a vol link is pasted into
 * WhatsApp or Instagram.
 *
 * It must give nothing away — no name, no result — so it is deliberately just
 * "HELLO" over a Y2K grid. Drawn from a hand-rolled 5x7 bitmap font rather than
 * a font library, since we only ever need four letters.
 *
 *   node scripts/make-og.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const W = 1200;
const H = 630;

const GLYPHS = {
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
};

const WORD = 'HELLO';
const PX = 22;
const GAP = PX;

function crc32(buf) {
  let c;
  let crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = c ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

// RGB canvas, row-major.
const px = Buffer.alloc(W * H * 3);
const set = (x, y, r, g, b) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = r;
  px[i + 1] = g;
  px[i + 2] = b;
};

// Background: Y2K teal with a faint grid.
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const grid = x % 40 === 0 || y % 40 === 0;
    if (grid) set(x, y, 0, 105, 105);
    else set(x, y, 0, 128, 128);
  }
}

// Scanlines.
for (let y = 0; y < H; y += 4) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    px[i] = Math.round(px[i] * 0.88);
    px[i + 1] = Math.round(px[i + 1] * 0.88);
    px[i + 2] = Math.round(px[i + 2] * 0.88);
  }
}

const wordW = WORD.length * 5 * PX + (WORD.length - 1) * GAP;
const wordH = 7 * PX;
const startX = Math.round((W - wordW) / 2);
const startY = Math.round((H - wordH) / 2) - 10;

const block = (bx, by, r, g, b) => {
  for (let dy = 0; dy < PX; dy++) for (let dx = 0; dx < PX; dx++) set(bx + dx, by + dy, r, g, b);
};

WORD.split('').forEach((letter, li) => {
  const rows = GLYPHS[letter];
  const ox = startX + li * (5 * PX + GAP);
  for (let ry = 0; ry < rows.length; ry++) {
    for (let rx = 0; rx < 5; rx++) {
      if (rows[ry][rx] !== '1') continue;
      const bx = ox + rx * PX;
      const by = startY + ry * PX;
      block(bx + 8, by + 8, 0, 0, 0); // drop shadow
      block(bx, by, 255, 0, 255); // magenta face
    }
  }
});

// A chunky bevel border.
const border = (inset, r, g, b, thickness) => {
  for (let t = 0; t < thickness; t++) {
    for (let x = inset; x < W - inset; x++) {
      set(x, inset + t, r, g, b);
      set(x, H - 1 - inset - t, r, g, b);
    }
    for (let y = inset; y < H - inset; y++) {
      set(inset + t, y, r, g, b);
      set(W - 1 - inset - t, y, r, g, b);
    }
  }
};
border(18, 255, 255, 255, 6);
border(34, 0, 0, 0, 4);

// PNG: filter byte 0 per scanline.
const raw = Buffer.alloc(H * (1 + W * 3));
let p = 0;
for (let y = 0; y < H; y++) {
  raw[p++] = 0;
  px.copy(raw, p, y * W * 3, (y + 1) * W * 3);
  p += W * 3;
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;
ihdr[9] = 2;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, 'public', 'og.png');
writeFileSync(out, png);
console.log(`Wrote ${out} (${W}x${H}, ${(png.length / 1024).toFixed(1)} KB)`);
