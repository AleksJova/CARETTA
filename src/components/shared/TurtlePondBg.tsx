import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/**
 * TurtlePond — a reusable animated "water" background with drifting loggerhead
 * turtles that gently flee the pointer and trail ripples.
 *
 * Design intent: this is purely a *background*. It knows nothing about the app.
 * Drop it behind a login card, a page header, a hero — anything. Put your own
 * content in via `children`; it renders on top, centered by default. This is why
 * it lives in shared/ and not auth/: the login screen and the role headers reuse
 * the same component with different props (full-bleed + interactive for login,
 * a short non-interactive band for headers).
 *
 * Performance notes:
 *  - One requestAnimationFrame loop drives ALL turtles (not one per turtle).
 *  - Positions live in a ref and are written straight to element.style.transform,
 *    so React never re-renders during animation (state would mean ~60 renders/sec).
 *  - Only `transform` / `opacity` are animated -> GPU-composited, no layout/paint.
 *  - Flipper flap + bubbles are pure CSS (zero JS cost).
 *  - Honors prefers-reduced-motion: turtles place once and hold still, no loop.
 */
interface TurtlePondProps {
  /** How many turtles (default 5). 0 = water only. */
  turtleCount?: number;
  /** Pointer ripples on/off (default true). */
  ripples?: boolean;
  /** Rising bubbles on/off (default true). */
  bubbles?: boolean;
  /** Turtles flee the pointer (default true). False for headers you don't want "grabby". */
  interactive?: boolean;
  /** Extra classes for the outer wrapper. */
  className?: string;
  /** Extra inline styles for the outer wrapper (e.g. { height: 220 } for a header band). */
  style?: CSSProperties;
  /** Content rendered on top of the water. */
  children?: ReactNode;
}

interface Turtle {
  el: HTMLDivElement;
  svg: SVGElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  max: number;
  min: number;
  phase: number;
  dart: number;
}

export default function TurtlePond({
  turtleCount = 5,
  ripples = true,
  bubbles = true,
  interactive = true,
  className = '',
  style = {},
  children,
}: TurtlePondProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const turtleLayerRef = useRef<HTMLDivElement>(null);
  const rippleLayerRef = useRef<HTMLDivElement>(null);
  const bubbleLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const tLayer = turtleLayerRef.current;
    const rLayer = rippleLayerRef.current;
    const bLayer = bubbleLayerRef.current;
    if (!scene || !tLayer) return;

    // ---- bubbles ----
    // Built imperatively here (not in render) so the one-time Math.random()
    // sizing/positioning stays out of the pure render path. Pure-CSS rise.
    if (bubbles && bLayer) {
      for (let i = 0; i < 7; i++) {
        const b = document.createElement('span');
        b.className = 'tp-bub';
        b.style.cssText =
          `position:absolute;border-radius:50%;background:rgba(255,255,255,.5);` +
          `bottom:-20px;width:${4 + Math.random() * 7}px;height:${4 + Math.random() * 7}px;` +
          `left:${Math.random() * 100}%;` +
          `animation-duration:${7 + Math.random() * 7}s;animation-delay:-${Math.random() * 10}s`;
        bLayer.appendChild(b);
      }
    }

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    let W = scene.clientWidth;
    let H = scene.clientHeight;

    const palette = [
      ['#34B894', '#0F6E56', '#2AA17D'],
      ['#3FB3B8', '#0F6E66', '#2E9AA0'],
      ['#5DCAA5', '#178F6A', '#46B894'],
    ];

    const turtleSVG = (s: number, shell: string, edge: string, head: string) =>
      `
      <svg width="${s}" height="${s * 1.1}" viewBox="0 0 64 72" style="overflow:visible;display:block">
        <g class="tp-fl" style="transform-box:fill-box;transform-origin:80% 50%"><ellipse cx="52" cy="26" rx="9" ry="5" fill="${shell}"/></g>
        <g class="tp-fl" style="transform-box:fill-box;transform-origin:20% 50%;animation-delay:-.4s"><ellipse cx="12" cy="26" rx="9" ry="5" fill="${shell}"/></g>
        <g class="tp-fl tp-b" style="transform-box:fill-box;transform-origin:80% 50%;animation-delay:-.7s"><ellipse cx="50" cy="56" rx="7" ry="4" fill="${shell}"/></g>
        <g class="tp-fl tp-b" style="transform-box:fill-box;transform-origin:20% 50%;animation-delay:-.2s"><ellipse cx="14" cy="56" rx="7" ry="4" fill="${shell}"/></g>
        <ellipse cx="32" cy="13" rx="7" ry="9" fill="${head}"/>
        <circle cx="29" cy="9" r="1.5" fill="#0B3B30"/><circle cx="35" cy="9" r="1.5" fill="#0B3B30"/>
        <path d="M32 62 l-3.5 8 h7 z" fill="${head}"/>
        <ellipse cx="32" cy="40" rx="20" ry="23" fill="${shell}" stroke="${edge}" stroke-width="2"/>
        <path d="M32 22 L32 58 M16 32 L48 32 M14 44 L50 44" stroke="${edge}" stroke-width="1.4" opacity=".35" fill="none"/>
        <path d="M32 32 l9 7 -4 11 h-10 l-4 -11 z" fill="${edge}" opacity=".22"/>
        <ellipse cx="26" cy="33" rx="4" ry="5" fill="#fff" opacity=".18"/>
      </svg>`;

    // ---- build turtles ----
    const turtles: Turtle[] = [];
    for (let i = 0; i < turtleCount; i++) {
      const p = palette[i % palette.length];
      const size = 30 + Math.round(Math.random() * 20);
      const el = document.createElement('div');
      el.style.cssText =
        `position:absolute;top:0;left:0;will-change:transform;` +
        `pointer-events:${interactive ? 'auto' : 'none'};` +
        `cursor:${interactive ? 'pointer' : 'default'};` +
        `opacity:${0.78 + (size - 30) / 90}`;
      el.innerHTML = turtleSVG(size, p[0], p[1], p[2]);
      tLayer.appendChild(el);

      const t: Turtle = {
        el,
        svg: el.firstElementChild as SVGElement,
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 1.4,
        vy: (Math.random() - 0.5) * 1.4,
        max: 0.7 + Math.random() * 0.5,
        min: 0.35,
        phase: Math.random() * 6.28,
        dart: 0,
      };

      if (interactive) {
        el.addEventListener('pointerenter', () => {
          t.svg.classList.remove('tp-wig');
          void t.svg.getBoundingClientRect().width; // restart animation
          t.svg.classList.add('tp-wig');
          t.dart = 1.8;
        });
      }
      turtles.push(t);
    }

    // ---- pointer + ripples ----
    let px = -9999;
    let py = -9999;
    let active = false;
    let lastRip = 0;
    const toLocal = (e: PointerEvent) => {
      const r = scene.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      active = true;
    };
    const spawnRipple = (x: number, y: number, big: boolean) => {
      if (reduce || !ripples || !rLayer) return;
      const d = document.createElement('div');
      const sz = big ? 34 : 20;
      d.className = 'tp-rip';
      d.style.cssText = `left:${x}px;top:${y}px;width:${sz}px;height:${sz}px`;
      rLayer.appendChild(d);
      setTimeout(() => d.remove(), 1150);
    };
    const onMove = (e: PointerEvent) => {
      toLocal(e);
      const n = performance.now();
      if (n - lastRip > 110) {
        lastRip = n;
        spawnRipple(px, py, false);
      }
    };
    const onDown = (e: PointerEvent) => {
      toLocal(e);
      spawnRipple(px, py, true);
    };
    const onLeave = () => {
      active = false;
      px = -9999;
      py = -9999;
    };

    if (interactive || ripples) {
      scene.addEventListener('pointermove', onMove);
      scene.addEventListener('pointerdown', onDown);
      scene.addEventListener('pointerleave', onLeave);
    }

    // ---- physics loop ----
    const FLEE = 120;
    const place = (t: Turtle, extra: number) => {
      const ang = (Math.atan2(t.vy, t.vx) * 180) / Math.PI + 90;
      t.el.style.transform = `translate(${t.x}px,${t.y}px) translate(-50%,-50%) rotate(${ang + extra}deg)`;
    };

    let raf = 0;
    if (reduce) {
      turtles.forEach((t) => place(t, 0));
    } else {
      const step = (ts: number) => {
        for (const t of turtles) {
          t.vx += (Math.random() - 0.5) * 0.06;
          t.vy += (Math.random() - 0.5) * 0.06;
          if (interactive && active) {
            const dx = t.x - px;
            const dy = t.y - py;
            const d = Math.hypot(dx, dy);
            if (d < FLEE && d > 0.1) {
              const f = (FLEE - d) / FLEE;
              t.vx += (dx / d) * f * 0.55;
              t.vy += (dy / d) * f * 0.55;
            }
          }
          if (t.dart > 0) {
            t.vx *= 1 + t.dart * 0.04;
            t.vy *= 1 + t.dart * 0.04;
            t.dart -= 0.08;
          }
          const sp = Math.hypot(t.vx, t.vy);
          const mx = t.max * (1 + (t.dart > 0 ? t.dart : 0));
          if (sp > mx) {
            t.vx *= mx / sp;
            t.vy *= mx / sp;
          }
          if (sp < t.min && sp > 0) {
            t.vx *= t.min / sp;
            t.vy *= t.min / sp;
          }
          t.x += t.vx;
          t.y += t.vy;
          const m = 46;
          if (t.x < -m) t.x = W + m;
          if (t.x > W + m) t.x = -m;
          if (t.y < -m) t.y = H + m;
          if (t.y > H + m) t.y = -m;
          place(t, Math.sin(ts / 320 + t.phase) * 5);
        }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    // ---- keep up with size changes ----
    let ro: ResizeObserver | undefined;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => {
        W = scene.clientWidth;
        H = scene.clientHeight;
      });
      ro.observe(scene);
    }

    // ---- cleanup ----
    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      if (interactive || ripples) {
        scene.removeEventListener('pointermove', onMove);
        scene.removeEventListener('pointerdown', onDown);
        scene.removeEventListener('pointerleave', onLeave);
      }
      turtles.forEach((t) => t.el.remove());
      if (rLayer) rLayer.innerHTML = '';
      if (bLayer) bLayer.innerHTML = '';
    };
  }, [turtleCount, ripples, bubbles, interactive]);

  return (
    <div
      ref={sceneRef}
      className={`tp-scene ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background:
          'linear-gradient(165deg,#D2F1EA 0%,#A6E1DC 30%,#8FD2E2 62%,#B7E6EF 100%)',
        touchAction: 'none',
        ...style,
      }}
    >
      <TurtlePondStyles />

      {/* soft drifting light blobs for depth */}
      <div
        className="tp-blob"
        style={{
          top: -60,
          left: -40,
          width: 300,
          height: 300,
          background:
            'radial-gradient(circle,rgba(255,255,255,.35),transparent 65%)',
        }}
      />
      <div
        className="tp-blob"
        style={{
          bottom: -80,
          right: -30,
          width: 340,
          height: 340,
          background:
            'radial-gradient(circle,rgba(141,210,226,.4),transparent 65%)',
          animationDelay: '-7s',
        }}
      />

      <div
        ref={rippleLayerRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      />
      <div
        ref={bubbleLayerRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />
      <div
        ref={turtleLayerRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />

      {/* your content sits on top, centered by default */}
      {children != null && (
        <div
          style={{
            position: 'relative',
            zIndex: 5,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** Scoped styles. Injected once; cheap and keeps the component self-contained. */
function TurtlePondStyles() {
  return (
    <style>{`
      .tp-blob{position:absolute;border-radius:50%;pointer-events:none}
      .tp-rip{position:absolute;border:2px solid rgba(255,255,255,.7);border-radius:50%;
        pointer-events:none;transform:translate(-50%,-50%) scale(.2);animation:tpRip 1.1s ease-out forwards}
      @keyframes tpRip{to{transform:translate(-50%,-50%) scale(2.4);opacity:0;border-width:.5px}}
      @keyframes tpFlap{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(12deg)}}
      @keyframes tpRise{0%{transform:translateY(0);opacity:0}15%{opacity:.55}100%{transform:translateY(-340px);opacity:0}}
      @keyframes tpDrift{from{transform:translate(0,0)}to{transform:translate(40px,26px)}}
      @keyframes tpWig{0%,100%{transform:scale(1)}30%{transform:scale(1.12) rotate(-6deg)}60%{transform:scale(1.12) rotate(6deg)}}
      @media (prefers-reduced-motion: no-preference){
        .tp-fl{animation:tpFlap 1.1s ease-in-out infinite}
        .tp-fl.tp-b{animation-duration:1.4s}
        .tp-bub{animation:tpRise linear infinite}
        .tp-blob{animation:tpDrift 18s ease-in-out infinite alternate}
        .tp-wig{animation:tpWig .7s ease}
      }
    `}</style>
  );
}
