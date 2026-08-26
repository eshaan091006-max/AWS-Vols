'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const COUNT = 140;
const GRAVITY = 0.16;
const PALETTE = ['#ffef00', '#00ffff', '#ff008a', '#00ff66', '#ffffff'];

type Particle = {
  x: number; y: number; vx: number; vy: number;
  w: number; h: number; rot: number; vr: number; color: string;
};

export function Confetti({ active, accent }: { active: boolean; accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!active || reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const colors = [accent, ...PALETTE];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const w = window.innerWidth;
    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * window.innerHeight * 0.6,
      vx: (Math.random() - 0.5) * 3.2,
      vy: 1 + Math.random() * 3.5,
      w: 6 + Math.random() * 8,
      h: 9 + Math.random() * 12,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.28,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const draw = () => {
      const h = window.innerHeight;
      ctx.clearRect(0, 0, window.innerWidth, h);
      let alive = 0;

      for (const p of particles) {
        p.vy += GRAVITY;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y < h + 40) alive++;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (alive === 0) {
        ctx.clearRect(0, 0, window.innerWidth, h);
        return;
      }
      raf = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [active, accent, reduced]);

  if (reduced) return null;
  return <canvas ref={canvasRef} style={style} aria-hidden />;
}

const style: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 9997,
  pointerEvents: 'none',
};
