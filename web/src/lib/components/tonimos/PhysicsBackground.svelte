<script lang="ts">
  import { onMount } from "svelte";

  type WindowField = { x: number; y: number; width: number; height: number };

  let {
    terminalActive = false,
    serverMode = false,
    labMode = false,
    windowFields = [],
  } = $props<{
    terminalActive?: boolean;
    serverMode?: boolean;
    labMode?: boolean;
    windowFields?: WindowField[];
  }>();

  let canvas: HTMLCanvasElement | undefined;

  onMount(() => {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Body = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      mass: number;
      charge: number;
      radius: number;
      trail: { x: number; y: number }[];
    };

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      mass: number;
      charge: number;
      radius: number;
    };

    let raf = 0;
    let w = 0;
    let h = 0;
    let t = 0;
    const mouse = { x: 0, y: 0, active: false, strength: 1.4 };
    const blackHole = { x: 0, y: 0, active: false, strength: 3.2 };

    const bodies = Array.from(
      { length: 8 },
      (_, index) =>
        ({
          x: 0.18 + Math.random() * 0.64,
          y: 0.2 + Math.random() * 0.55,
          vx: (Math.random() - 0.5) * 0.0014,
          vy: (Math.random() - 0.5) * 0.0014,
          mass: 2.8 + Math.random() * 3.8,
          charge: index % 2 === 0 ? 1 : -1,
          radius: 4 + Math.random() * 4,
          trail: [] as { x: number; y: number }[],
        }) satisfies Body,
    );

    const particles = Array.from(
      { length: 160 },
      () =>
        ({
          x: Math.random(),
          y: Math.random(),
          vx: (Math.random() - 0.5) * 0.0012,
          vy: (Math.random() - 0.5) * 0.0012,
          mass: 0.2 + Math.random() * 0.9,
          charge: Math.random() > 0.5 ? 1 : -1,
          radius: 0.9 + Math.random() * 1.7,
        }) satisfies Particle,
    );

    const resize = () => {
      w = canvas?.clientWidth ?? 0;
      h = canvas?.clientHeight ?? 0;
      if (!canvas) return;
      canvas.width = Math.floor(w * devicePixelRatio);
      canvas.height = Math.floor(h * devicePixelRatio);
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const onMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
    };

    const onPointerDown = (event: MouseEvent) => {
      if (event.button === 2) {
        blackHole.x = event.clientX;
        blackHole.y = event.clientY;
        blackHole.active = true;
        blackHole.strength = 3.5;
        event.preventDefault();
        return;
      }

      mouse.strength = 1.8;
      mouse.active = true;
    };

    const onPointerUp = () => {
      mouse.strength = 1.4;
    };

    const onLeave = () => {
      mouse.active = false;
    };

    const drawGrid = () => {
      const step = 56;
      ctx.lineWidth = 1;
      ctx.strokeStyle = terminalActive
        ? "rgba(136, 184, 255, 0.09)"
        : serverMode
          ? "rgba(125, 188, 255, 0.08)"
          : "rgba(96, 118, 153, 0.08)";
      ctx.beginPath();

      for (let x = 0; x <= w; x += step) {
        ctx.moveTo(x, 0);
        for (let y = 0; y <= h; y += 8) {
          const warp = Math.sin(y * 0.016 + t * 0.9 + x * 0.0013) * 3.2;
          ctx.lineTo(x + warp, y);
        }
      }

      for (let y = 0; y <= h; y += step) {
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 8) {
          const warp = Math.cos(x * 0.016 + t * 0.8 + y * 0.0011) * 3.2;
          ctx.lineTo(x, y + warp);
        }
      }

      ctx.stroke();
    };

    const drawOrbits = () => {
      const cx = w * 0.74;
      const cy = h * 0.32;
      const amp = terminalActive ? 1.2 : labMode ? 1.05 : 1;

      for (let i = 0; i < 3; i += 1) {
        const radius = 48 + i * 28;
        ctx.strokeStyle = terminalActive
          ? `rgba(136, 184, 255, ${0.24 - i * 0.05})`
          : `rgba(99, 123, 162, ${0.22 - i * 0.05})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          radius,
          radius * (0.58 + i * 0.1),
          t * 0.34 + i,
          0,
          Math.PI * 2,
        );
        ctx.stroke();

        const theta = t * (0.6 + i * 0.17) + i * 1.7;
        const ex = cx + Math.cos(theta) * radius;
        const ey = cy + Math.sin(theta) * radius * (0.58 + i * 0.1);
        ctx.fillStyle = terminalActive
          ? "rgba(160, 205, 255, 0.92)"
          : labMode
            ? "rgba(180, 210, 255, 0.9)"
            : "rgba(128, 153, 194, 0.86)";
        ctx.beginPath();
        ctx.arc(ex, ey, 2.8 + i * 0.8 * amp, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawBodies = () => {
      for (let i = 0; i < bodies.length; i += 1) {
        const body = bodies[i];
        for (let j = i + 1; j < bodies.length; j += 1) {
          const other = bodies[j];
          const dx = other.x - body.x;
          const dy = other.y - body.y;
          const distSq = Math.max(0.0008, dx * dx + dy * dy);
          const dist = Math.sqrt(distSq);
          const gravity = 0.00032 * body.mass * other.mass;
          const chargeForce = 0.00012 * body.charge * other.charge;
          const force = gravity - chargeForce;
          const accel = force / distSq;
          const fx = (dx / dist) * accel;
          const fy = (dy / dist) * accel;
          body.vx += fx / body.mass;
          body.vy += fy / body.mass;
          other.vx -= fx / other.mass;
          other.vy -= fy / other.mass;
        }

        body.x += body.vx;
        body.y += body.vy;
        body.vx *= 0.999;
        body.vy *= 0.999;
        if (body.x < 0 || body.x > 1) body.vx *= -1;
        if (body.y < 0 || body.y > 1) body.vy *= -1;
        body.x = Math.max(0, Math.min(1, body.x));
        body.y = Math.max(0, Math.min(1, body.y));
        body.trail.push({ x: body.x * w, y: body.y * h });
        body.trail = body.trail.slice(-48);

        ctx.strokeStyle = `rgba(136, 184, 255, ${0.08 + body.mass * 0.01})`;
        ctx.beginPath();
        for (let k = 0; k < body.trail.length; k += 1) {
          const point = body.trail[k];
          if (k === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
        ctx.fillStyle =
          body.charge > 0
            ? "rgba(136, 184, 255, 0.94)"
            : "rgba(111, 129, 160, 0.92)";
        ctx.beginPath();
        ctx.arc(body.x * w, body.y * h, body.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawParticles = () => {
      for (const p of particles) {
        for (const body of bodies) {
          const dx = body.x * w - p.x * w;
          const dy = body.y * h - p.y * h;
          const distSq = Math.max(380, dx * dx + dy * dy);
          const dist = Math.sqrt(distSq);
          const gravity = 0.0012 * body.mass;
          const charge = 0.0003 * body.charge * p.charge;
          const force = gravity - charge;
          const accel = force / distSq;
          p.vx += (dx / dist) * accel;
          p.vy += (dy / dist) * accel;
        }

        if (mouse.active) {
          const dx = p.x * w - mouse.x;
          const dy = p.y * h - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 160) {
            const force = (160 - dist) / 160;
            p.vx += (dx / (dist || 1)) * force * 0.00015 * mouse.strength;
            p.vy += (dy / (dist || 1)) * force * 0.00015 * mouse.strength;
          }
        }

        if (blackHole.active) {
          const dx = blackHole.x - p.x * w;
          const dy = blackHole.y - p.y * h;
          const distSq = Math.max(180, dx * dx + dy * dy);
          const dist = Math.sqrt(distSq);
          const pull = blackHole.strength / distSq;
          p.vx += (dx / dist) * pull;
          p.vy += (dy / dist) * pull;
        }

        for (const field of windowFields) {
          const centerX = field.x + field.width / 2;
          const centerY = field.y + field.height / 2;
          const dx = p.x * w - centerX;
          const dy = p.y * h - centerY;
          const distSq = Math.max(500, dx * dx + dy * dy);
          const dist = Math.sqrt(distSq);
          const bend = 0.00036 / distSq;
          p.vx += (dy / dist) * bend * field.width;
          p.vy -= (dx / dist) * bend * field.height;
        }

        p.x +=
          p.vx *
          (terminalActive ? 1.35 : serverMode ? 1.18 : labMode ? 1.24 : 1);
        p.y +=
          p.vy *
          (terminalActive ? 1.35 : serverMode ? 1.18 : labMode ? 1.24 : 1);

        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        p.x = Math.max(0, Math.min(1, p.x));
        p.y = Math.max(0, Math.min(1, p.y));

        ctx.fillStyle = terminalActive
          ? "rgba(152, 198, 254, 0.84)"
          : labMode
            ? "rgba(162, 205, 255, 0.78)"
            : "rgba(118, 143, 184, 0.76)";
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawWave = () => {
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = terminalActive
        ? "rgba(140, 188, 255, 0.44)"
        : labMode
          ? "rgba(152, 205, 255, 0.36)"
          : "rgba(110, 136, 178, 0.38)";
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const y =
          h * 0.75 +
          Math.sin(x * 0.01 + t * 2) * 13 +
          Math.sin(x * 0.027 - t * 1.4) * 7;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    const frame = () => {
      t += 0.012;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(8, 13, 21, 0.26)";
      ctx.fillRect(0, 0, w, h);
      drawGrid();
      drawBodies();
      drawWave();
      drawOrbits();
      drawParticles();
      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("mouseleave", onLeave);
    };
  });
</script>

<canvas bind:this={canvas} class="physics-bg" aria-hidden="true"></canvas>

<style>
  .physics-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    opacity: 0.62;
    mix-blend-mode: screen;
  }
</style>
