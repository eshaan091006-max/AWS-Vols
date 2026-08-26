'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const TRAIL_LENGTH = 14;

type Point = { x: number; y: number };

export function CursorTrail({ accent }: { accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    // A trail on a touchscreen follows nothing and costs frames.
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points: Point[] = [];
    let raf = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e: PointerEvent) => {
      points.push({ x: e.clientX, y: e.clientY });
      if (points.length > TRAIL_LENGTH) points.shift();
    };

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      points.forEach((p, i) => {
        const t = i / TRAIL_LENGTH;
        const size = 3 + t * 9;
        ctx.globalAlpha = t * 0.75;
        ctx.fillStyle = i % 2 === 0 ? accent : '#ffffff';
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      });
      ctx.globalAlpha = 1;
      if (points.length > 0 && Math.random() < 0.35) points.shift();
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, [accent, reduced]);

  if (reduced) return null;
  return <canvas ref={canvasRef} className="cursor-trail" aria-hidden />;
}
