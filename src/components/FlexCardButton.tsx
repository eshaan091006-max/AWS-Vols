'use client';
import { useState } from 'react';
import { CARD_HEIGHT, CARD_WIDTH, cardFilename, coverRect, wrapText } from '@/lib/flexCard';
import type { Vol } from '@/lib/vols';

const PAD = 24;
const FRAME = { x: 110, y: 430, w: 860, h: 620 };

/** Reads the next/font family off the page so the card matches the site. */
function fontVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => img.decode().then(() => resolve(img)).catch(() => resolve(img));
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function bevelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  accent: string,
) {
  // Canvas has no text-shadow, so the bevel is stacked fills.
  ctx.fillStyle = '#000';
  for (const [dx, dy] of [[7, 7], [6, 6], [5, 5]] as const) ctx.fillText(text, x + dx, y + dy);
  ctx.fillStyle = accent;
  ctx.fillText(text, x + 3, y + 3);

  const grad = ctx.createLinearGradient(0, y - 150, 0, y + 30);
  grad.addColorStop(0, '#fff8a0');
  grad.addColorStop(0.42, '#ffef00');
  grad.addColorStop(0.62, '#ff8a00');
  grad.addColorStop(1, '#ff008a');
  ctx.fillStyle = grad;
  ctx.fillText(text, x, y);

  ctx.lineWidth = 5;
  ctx.strokeStyle = '#000';
  ctx.strokeText(text, x, y);
}

export function FlexCardButton({ vol }: { vol: Vol }) {
  const [busy, setBusy] = useState(false);

  const render = async () => {
    setBusy(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready;

      const canvas = document.createElement('canvas');
      canvas.width = CARD_WIDTH;
      canvas.height = CARD_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const pixel = fontVar('--font-pixel', 'monospace');
      const comic = fontVar('--font-comic', 'sans-serif');
      const meme = vol.meme ? await loadImage(vol.meme) : null;

      // Background
      const bg = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
      bg.addColorStop(0, '#000080');
      bg.addColorStop(1, vol.accent);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

      // Bevelled border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.strokeRect(PAD, PAD, CARD_WIDTH - PAD * 2, CARD_HEIGHT - PAD * 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 6;
      ctx.strokeRect(PAD + 10, PAD + 10, CARD_WIDTH - (PAD + 10) * 2, CARD_HEIGHT - (PAD + 10) * 2);

      ctx.textAlign = 'center';
      const cx = CARD_WIDTH / 2;

      ctx.fillStyle = '#ffffff';
      ctx.font = `26px ${pixel}`;
      ctx.fillText('AWS STUDENT BUILDER GROUP', cx, 118);

      ctx.font = `170px Impact, Haettenschweiler, ${pixel}`;
      bevelText(ctx, "I'M IN", cx, 300, vol.accent);

      ctx.fillStyle = '#ffffff';
      ctx.font = `46px ${pixel}`;
      ctx.fillText(vol.name.toUpperCase(), cx, 386);

      // Meme frame
      if (meme) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(FRAME.x - 8, FRAME.y - 8, FRAME.w + 16, FRAME.h + 16);
        const { sx, sy, sw, sh } = coverRect(meme.naturalWidth, meme.naturalHeight, FRAME.w, FRAME.h);
        ctx.drawImage(meme, sx, sy, sw, sh, FRAME.x, FRAME.y, FRAME.w, FRAME.h);
      }

      // Message
      const msgTop = meme ? 1130 : 700;
      ctx.fillStyle = '#ffffff';
      ctx.font = `${meme ? 38 : 54}px ${comic}`;
      const lines = wrapText(ctx, vol.message, CARD_WIDTH - 220).slice(0, meme ? 3 : 6);
      lines.forEach((line, i) => {
        ctx.fillText(line, cx, msgTop + i * (meme ? 48 : 70));
      });

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = `24px ${pixel}`;
      ctx.fillText("AWS SBG TECHNICALS '26", cx, CARD_HEIGHT - 62);

      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cardFilename(vol.name);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className="win-btn" type="button" onClick={render} disabled={busy}>
      {busy ? 'RENDERING...' : '💾 SAVE YOUR FLEX CARD'}
    </button>
  );
}
