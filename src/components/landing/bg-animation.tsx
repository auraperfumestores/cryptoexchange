'use client';

import { useEffect, useRef } from 'react';

interface Coin {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  type: 'usdt' | 'inr';
}

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let animId: number;
    const coins: Coin[] = [];
    const COIN_COUNT = 28;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function spawnCoin(): Coin {
      const isUsdt = Math.random() > 0.35;
      return {
        x: Math.random() * (canvas?.width ?? 1200),
        y: Math.random() * (canvas?.height ?? 800),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 16 + Math.random() * 22,
        opacity: 0.04 + Math.random() * 0.08,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.008,
        type: isUsdt ? 'usdt' : 'inr',
      };
    }

    resize();
    for (let i = 0; i < COIN_COUNT; i++) {
      const c = spawnCoin();
      c.opacity = 0.03 + Math.random() * 0.06;
      coins.push(c);
    }

    function drawCoin(c: Coin) {
      ctx.save();
      ctx.globalAlpha = c.opacity;

      const glowColor = c.type === 'usdt' ? '#26A17B' : '#3B82F6';
      const gradient = ctx.createRadialGradient(0, 0, c.radius * 0.4, 0, 0, c.radius * 1.4);
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = c.type === 'usdt' ? '#26A17B' : '#3B82F6';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = c.radius * 0.08;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = `bold ${c.radius * 0.8}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.type === 'usdt' ? '₮' : '₹', c.x, c.y + 1);

      ctx.restore();
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const c of coins) {
        c.x += c.vx;
        c.y += c.vy;
        c.rotation += c.rotationSpeed;

        if (c.x < -c.radius * 2) c.x = canvas.width + c.radius;
        if (c.x > canvas.width + c.radius * 2) c.x = -c.radius;
        if (c.y < -c.radius * 2) c.y = canvas.height + c.radius;
        if (c.y > canvas.height + c.radius * 2) c.y = -c.radius;

        drawCoin(c);
      }

      animId = requestAnimationFrame(animate);
    }

    animate();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
