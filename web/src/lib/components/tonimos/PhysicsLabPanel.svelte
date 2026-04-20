<script lang="ts">
  import { onMount } from "svelte";

  type LabTab = "projectile" | "orbit" | "waves" | "electric";
  type Vec2 = { x: number; y: number };
  type Charge = { x: number; y: number; polarity: 1 | -1 };
  type WaveSource = { x: number; y: number; phase: number };

  const tabs: Array<{ id: LabTab; label: string; subtitle: string }> = [
    {
      id: "projectile",
      label: "Projectile",
      subtitle: "drag angle and gravity",
    },
    { id: "orbit", label: "Orbits", subtitle: "stable and unstable motion" },
    { id: "waves", label: "Waves", subtitle: "interference sources" },
    { id: "electric", label: "Electric", subtitle: "field visualization" },
  ];

  let activeTab = $state<LabTab>("projectile");
  let canvas: HTMLCanvasElement | undefined;
  let angle = $state(54);
  let speed = $state(18);
  let gravity = $state(9.8);
  let orbitVelocity = $state(1.08);
  let orbitMass = $state(1.5);
  let waveFrequency = $state(2.1);
  let waveSpacing = $state(34);
  let chargeStrength = $state(1.2);
  let electronStrength = $state(-1.1);
  let tick = 0;

  let orbit = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    trail: [] as Vec2[],
    seed: "",
  };

  let waveSources = $state<WaveSource[]>([
    { x: 0.35, y: 0.42, phase: 0 },
    { x: 0.68, y: 0.56, phase: Math.PI * 0.4 },
  ]);

  let charges = $state<Charge[]>([
    { x: 0.34, y: 0.46, polarity: 1 },
    { x: 0.66, y: 0.56, polarity: -1 },
  ]);

  const resetOrbit = () => {
    orbit = {
      x: 0.34,
      y: 0.5,
      vx: 0,
      vy: orbitVelocity,
      trail: [],
      seed: `${orbitMass}-${orbitVelocity}`,
    };
  };

  const addWaveSource = (x: number, y: number) => {
    waveSources = [
      ...waveSources,
      { x, y, phase: waveSources.length * 0.7 },
    ].slice(-6);
  };

  const addCharge = (x: number, y: number, polarity: 1 | -1) => {
    charges = [...charges, { x, y, polarity }].slice(-6);
  };

  const toCanvasPoint = (event: PointerEvent) => {
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  };

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  onMount(() => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas?.clientWidth ?? 0;
      height = canvas?.clientHeight ?? 0;
      if (!canvas) return;
      canvas.width = Math.floor(width * devicePixelRatio);
      canvas.height = Math.floor(height * devicePixelRatio);
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const drawGrid = () => {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(125, 148, 182, 0.12)";
      for (let x = 24; x < width; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 24; y < height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const drawProjectile = () => {
      const originX = 72;
      const originY = height - 56;
      const theta = (angle * Math.PI) / 180;
      const vx = Math.cos(theta) * speed * 12;
      const vy = Math.sin(theta) * speed * 12;
      const points: Vec2[] = [];
      for (let i = 0; i < 120; i += 1) {
        const tSample = i / 12;
        const x = originX + vx * tSample;
        const y =
          originY - (vy * tSample - 0.5 * gravity * 18 * tSample * tSample);
        if (y > originY + 10) break;
        points.push({ x, y });
      }

      ctx.strokeStyle = "rgba(136, 184, 255, 0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(originX, originY, 5, 0, Math.PI * 2);
      ctx.fill();

      const end = points[points.length - 1];
      if (end) {
        ctx.fillStyle = "#88b8ff";
        ctx.beginPath();
        ctx.arc(end.x, end.y, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(220, 230, 245, 0.85)";
      ctx.font = "12px var(--font-mono)";
      ctx.fillText(`angle ${angle}°`, 16, 24);
      ctx.fillText(`v0 ${speed.toFixed(1)} m/s`, 16, 42);
      ctx.fillText(`g ${gravity.toFixed(1)} m/s²`, 16, 60);
    };

    const drawOrbit = () => {
      const center = { x: width * 0.5, y: height * 0.5 };
      const targetSeed = `${orbitMass}-${orbitVelocity}`;
      if (orbit.seed !== targetSeed) {
        resetOrbit();
      }

      const dt = 0.016;
      const pull = 220 * orbitMass;
      const dx = center.x - orbit.x * width;
      const dy = center.y - orbit.y * height;
      const distSq = Math.max(900, dx * dx + dy * dy);
      const dist = Math.sqrt(distSq);
      const accel = pull / distSq;

      orbit.vx += (dx / dist) * accel * dt;
      orbit.vy += (dy / dist) * accel * dt;
      orbit.x += orbit.vx * dt;
      orbit.y += orbit.vy * dt;
      orbit.trail.push({ x: orbit.x * width, y: orbit.y * height });
      orbit.trail = orbit.trail.slice(-180);

      ctx.strokeStyle = "rgba(110, 200, 255, 0.72)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < orbit.trail.length; i += 1) {
        const point = orbit.trail[i];
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();

      ctx.fillStyle = "#f1c56b";
      ctx.beginPath();
      ctx.arc(center.x, center.y, 18 + orbitMass * 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#d8e4f4";
      ctx.beginPath();
      ctx.arc(orbit.x * width, orbit.y * height, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(220, 230, 245, 0.85)";
      ctx.font = "12px var(--font-mono)";
      ctx.fillText(`mass ${orbitMass.toFixed(1)}x`, 16, 24);
      ctx.fillText(`velocity ${orbitVelocity.toFixed(2)}`, 16, 42);
    };

    const drawWaves = () => {
      const step = waveSpacing;
      ctx.fillStyle = "rgba(220, 230, 245, 0.86)";
      ctx.font = "12px var(--font-mono)";
      ctx.fillText(`frequency ${waveFrequency.toFixed(1)} Hz`, 16, 24);
      ctx.fillText(`sources ${waveSources.length}`, 16, 42);

      for (let y = 24; y < height; y += step) {
        for (let x = 24; x < width; x += step) {
          let value = 0;
          for (const source of waveSources) {
            const sx = source.x * width;
            const sy = source.y * height;
            const dist = Math.hypot(x - sx, y - sy) / 26;
            value += Math.sin(dist * waveFrequency - tick * 0.1 + source.phase);
          }
          const intensity = Math.max(
            0,
            Math.min(
              1,
              (value + waveSources.length) / (waveSources.length * 2),
            ),
          );
          ctx.fillStyle = `rgba(136, 184, 255, ${0.08 + intensity * 0.52})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.2 + intensity * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.strokeStyle = "rgba(136, 184, 255, 0.22)";
      for (const source of waveSources) {
        const sx = source.x * width;
        const sy = source.y * height;
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const drawElectric = () => {
      ctx.fillStyle = "rgba(220, 230, 245, 0.86)";
      ctx.font = "12px var(--font-mono)";
      ctx.fillText(`charge set ${charges.length}`, 16, 24);
      ctx.fillText(
        `field strength ${(chargeStrength + Math.abs(electronStrength)).toFixed(1)}`,
        16,
        42,
      );

      for (let y = 28; y < height; y += 28) {
        for (let x = 28; x < width; x += 28) {
          let fx = 0;
          let fy = 0;
          for (const charge of charges) {
            const cx = charge.x * width;
            const cy = charge.y * height;
            const dx = x - cx;
            const dy = y - cy;
            const distSq = Math.max(36, dx * dx + dy * dy);
            const force =
              ((charge.polarity === 1 ? chargeStrength : electronStrength) *
                1200) /
              distSq;
            fx += (dx / Math.sqrt(distSq)) * force;
            fy += (dy / Math.sqrt(distSq)) * force;
          }
          const magnitude = Math.min(1, Math.hypot(fx, fy) / 14);
          ctx.strokeStyle = `rgba(136, 184, 255, ${0.08 + magnitude * 0.4})`;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + fx * 3, y + fy * 3);
          ctx.stroke();
        }
      }

      for (const charge of charges) {
        const cx = charge.x * width;
        const cy = charge.y * height;
        ctx.fillStyle = charge.polarity === 1 ? "#8bc3ff" : "#ff8f8f";
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0a0f17";
        ctx.font = "bold 12px var(--font-mono)";
        ctx.fillText(charge.polarity === 1 ? "+" : "−", cx - 4, cy + 4);
      }
    };

    const frame = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(8, 13, 21, 0.96)";
      ctx.fillRect(0, 0, width, height);
      drawGrid();
      drawRoundedRect(ctx, 10, 10, width - 20, height - 20, 16);
      ctx.strokeStyle = "rgba(136, 184, 255, 0.1)";
      ctx.stroke();

      if (activeTab === "projectile") drawProjectile();
      if (activeTab === "orbit") drawOrbit();
      if (activeTab === "waves") drawWaves();
      if (activeTab === "electric") drawElectric();

      raf = requestAnimationFrame(frame);
    };

    const onPointerDown = (event: PointerEvent) => {
      const point = toCanvasPoint(event);
      if (activeTab === "waves" && event.button === 0) {
        addWaveSource(point.x, point.y);
      }
      if (activeTab === "electric" && event.button === 0) {
        addCharge(point.x, point.y, charges.length % 2 === 0 ? 1 : -1);
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      if (!canvas) return;
      const point = toCanvasPoint(event as PointerEvent);
      if (activeTab === "electric") {
        addCharge(point.x, point.y, -1);
      }
    };

    resetOrbit();
    resize();
    window.addEventListener("resize", resize);
    const canvasElement = canvas;
    canvasElement.addEventListener("pointerdown", onPointerDown);
    canvasElement.addEventListener("contextmenu", onContextMenu);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvasElement.removeEventListener("pointerdown", onPointerDown);
      canvasElement.removeEventListener("contextmenu", onContextMenu);
    };
  });
</script>

<section class="lab-panel">
  <header class="lab-header">
    <div>
      <p class="eyebrow">Scientific Notebook Mode</p>
      <h2>Tonim Lab</h2>
    </div>
    <div class="hint">
      Click sources to add them. Right click in electric mode to drop negative
      charges.
    </div>
  </header>

  <nav class="tabs" aria-label="Lab simulations">
    {#each tabs as tab (tab.id)}
      <button
        type="button"
        class:active={activeTab === tab.id}
        onclick={() => (activeTab = tab.id)}
      >
        <strong>{tab.label}</strong>
        <span>{tab.subtitle}</span>
      </button>
    {/each}
  </nav>

  <div class="controls">
    {#if activeTab === "projectile"}
      <label
        >Angle <input
          type="range"
          min="10"
          max="80"
          bind:value={angle}
        /></label
      >
      <label
        >Speed <input type="range" min="8" max="30" bind:value={speed} /></label
      >
      <label
        >Gravity <input
          type="range"
          min="4"
          max="18"
          step="0.1"
          bind:value={gravity}
        /></label
      >
    {:else if activeTab === "orbit"}
      <label
        >Velocity <input
          type="range"
          min="0.7"
          max="1.6"
          step="0.01"
          bind:value={orbitVelocity}
        /></label
      >
      <label
        >Central Mass <input
          type="range"
          min="0.8"
          max="3.0"
          step="0.1"
          bind:value={orbitMass}
        /></label
      >
    {:else if activeTab === "waves"}
      <label
        >Frequency <input
          type="range"
          min="1.2"
          max="4.5"
          step="0.1"
          bind:value={waveFrequency}
        /></label
      >
      <label
        >Spacing <input
          type="range"
          min="20"
          max="44"
          step="1"
          bind:value={waveSpacing}
        /></label
      >
    {:else}
      <label
        >Positive Charge <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          bind:value={chargeStrength}
        /></label
      >
      <label
        >Negative Charge <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          bind:value={electronStrength}
        /></label
      >
    {/if}
  </div>

  <div class="canvas-shell">
    <canvas
      bind:this={canvas}
      aria-label="Scientific notebook simulation canvas"
    ></canvas>
  </div>
</section>

<style>
  .lab-panel {
    display: grid;
    gap: 12px;
    padding: 18px;
    color: var(--ui-text);
    background: linear-gradient(
      180deg,
      rgb(8 13 21 / 0.96),
      rgb(6 10 16 / 0.98)
    );
  }

  .lab-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: end;
  }

  .eyebrow {
    margin: 0 0 6px;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--ui-muted);
  }

  h2 {
    margin: 0;
    font-size: 1.15rem;
    letter-spacing: 0.02em;
  }

  .hint {
    max-width: 320px;
    font-size: 0.84rem;
    color: #9fb0c5;
    line-height: 1.45;
  }

  .tabs {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .tabs button {
    padding: 12px;
    text-align: left;
    border-radius: 12px;
    border: 1px solid rgb(123 148 183 / 0.18);
    background: rgb(10 16 25 / 0.72);
    color: inherit;
    cursor: pointer;
    transition:
      border-color 160ms ease,
      transform 160ms ease,
      background-color 160ms ease;
  }

  .tabs button.active {
    border-color: var(--glass-border-strong);
    background: rgb(136 184 255 / 0.12);
  }

  .tabs strong {
    display: block;
    font-size: 0.86rem;
    margin-bottom: 4px;
  }

  .tabs span {
    display: block;
    font-size: 0.74rem;
    color: #91a2ba;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
  }

  label {
    display: grid;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgb(123 148 183 / 0.16);
    background: rgb(10 16 25 / 0.72);
    font-size: 0.82rem;
    color: #c8d4e5;
  }

  input[type="range"] {
    width: 100%;
  }

  .canvas-shell {
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgb(123 148 183 / 0.18);
    background: rgb(7 11 18 / 0.95);
    min-height: 360px;
  }

  canvas {
    display: block;
    width: 100%;
    height: min(62vh, 560px);
    cursor: crosshair;
  }

  @media (max-width: 820px) {
    .lab-header {
      flex-direction: column;
      align-items: start;
    }

    .tabs {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
