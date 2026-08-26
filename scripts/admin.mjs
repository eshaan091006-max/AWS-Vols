/**
 * Local-only editor for data/vols.json.
 *
 * The deployed site is a static export with no API routes, so this cannot live
 * inside the Next app. It is a standalone server that runs on your machine,
 * binds to loopback only, and edits the same files you would edit by hand.
 *
 *   npm run admin
 */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = Number(process.env.ADMIN_PORT ?? 4444);
const MAX_BODY = 30 * 1024 * 1024;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']);

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const uiPath = path.join(here, 'admin-ui.html');
const dataPath = path.join(root, 'data', 'vols.json');
const memeDir = path.join(root, 'public', 'memes');

const slugify = (name) =>
  name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['\u2019]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'vol';

const randomSuffix = (length = 4) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
};

const readVols = () => JSON.parse(readFileSync(dataPath, 'utf8'));
const writeVols = (vols) => writeFileSync(dataPath, JSON.stringify(vols, null, 2) + '\n');

const json = (res, code, body) => {
  const payload = JSON.stringify(body);
  res.writeHead(code, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) });
  res.end(payload);
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('Body too large. Keep memes under 30 MB.'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch (e) {
        reject(new Error('Malformed JSON body.'));
      }
    });
    req.on('error', reject);
  });

/** Never trust a filename from a form: strip to a basename and a safe charset. */
function safeMemeName(rawName, slug) {
  const ext = path.extname(String(rawName ?? '')).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) throw new Error('Unsupported image type: ' + (ext || 'none'));
  return slug + ext;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');

    if (req.method === 'GET' && url.pathname === '/') {
      // Read per request so editing the UI needs no server restart.
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(readFileSync(uiPath, 'utf8'));
      return;
    }

    // Meme previews in the admin come straight from public/memes.
    if (req.method === 'GET' && url.pathname.startsWith('/memes/')) {
      const file = path.join(memeDir, path.basename(url.pathname));
      if (!existsSync(file)) {
        json(res, 404, { error: 'Not found' });
        return;
      }
      const type = MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
      res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
      res.end(readFileSync(file));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/vols') {
      json(res, 200, { vols: readVols(), siteUrl: process.env.SITE_URL ?? '' });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/vols') {
      const body = await readBody(req);
      if (!Array.isArray(body.vols)) throw new Error('Expected { vols: [...] }');

      const taken = new Set(body.vols.map((v) => v.slug).filter(Boolean));
      const cleaned = body.vols
        .filter((v) => String(v.name ?? '').trim())
        .map((v) => {
          const out = { slug: v.slug, name: String(v.name).trim() };
          if (!out.slug) {
            // Existing slugs are never regenerated; links may already be sent.
            let candidate;
            do {
              candidate = slugify(out.name) + '-' + randomSuffix();
            } while (taken.has(candidate));
            taken.add(candidate);
            out.slug = candidate;
          }
          if (v.meme) out.meme = v.meme;
          if (String(v.message ?? '').trim()) out.message = String(v.message).trim();
          const lines = (v.consoleLines ?? []).map((l) => String(l).trim()).filter(Boolean);
          if (lines.length) out.consoleLines = lines;
          if (String(v.accent ?? '').trim()) out.accent = String(v.accent).trim();
          return out;
        });

      writeVols(cleaned);
      json(res, 200, { ok: true, vols: cleaned });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/upload') {
      const body = await readBody(req);
      const slug = String(body.slug ?? '').replace(/[^a-z0-9-]/gi, '') || 'vol-' + randomSuffix();
      const filename = safeMemeName(body.filename, slug);
      const base64 = String(body.data ?? '').replace(/^data:[^;]+;base64,/, '');
      if (!base64) throw new Error('No image data received.');

      if (!existsSync(memeDir)) mkdirSync(memeDir, { recursive: true });
      const target = path.join(memeDir, filename);
      if (path.dirname(target) !== memeDir) throw new Error('Refusing to write outside public/memes.');

      writeFileSync(target, Buffer.from(base64, 'base64'));
      json(res, 200, { ok: true, path: '/memes/' + filename });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/delete-meme') {
      const body = await readBody(req);
      const rel = String(body.path ?? '');
      const filename = path.basename(rel);
      const target = path.join(memeDir, filename);
      if (rel.startsWith('/memes/') && existsSync(target) && filename !== 'sample.png') {
        unlinkSync(target);
      }
      json(res, 200, { ok: true });
      return;
    }

    json(res, 404, { error: 'Not found' });
  } catch (err) {
    json(res, 400, { error: err.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n  Vol admin running at http://localhost:' + PORT);
  console.log('  Editing: data/vols.json  +  public/memes/');
  console.log('  Loopback only. Ctrl+C to stop.\n');
});
