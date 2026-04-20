<script lang="ts">
  import type { WindowId } from "./types";

  let { onOpen = () => {}, activeWindow } = $props<{
    onOpen?: (id: WindowId) => void;
    activeWindow?: WindowId;
  }>();

  const apps: Array<{ id: WindowId; icon: string; label: string }> = [
    { id: "about", icon: "AB", label: "About" },
    { id: "terminal", icon: ">_", label: "Terminal" },
    { id: "projects", icon: "PX", label: "Projects" },
    { id: "resume", icon: "CV", label: "Resume" },
    { id: "lab", icon: "LB", label: "Lab" },
    { id: "contact", icon: "@@", label: "Contact" },
  ];

  let hovered = $state(-1);

  const scaleFor = (index: number) => {
    if (hovered < 0) return 1;
    const dist = Math.abs(index - hovered);
    if (dist > 2) return 1;
    return 1.42 - dist * 0.18;
  };
</script>

<div class="dock-wrap">
  <div
    class="dock"
    role="group"
    aria-label="Application Dock"
    onmouseleave={() => (hovered = -1)}
  >
    {#each apps as app, index (app.id)}
      <button
        type="button"
        class="app"
        class:active={activeWindow === app.id}
        style={`transform: translateY(${hovered === index ? -9 : 0}px) scale(${scaleFor(index)});`}
        onmouseenter={() => (hovered = index)}
        onclick={() => onOpen(app.id)}
        title={app.label}
      >
        <span>{app.icon}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .dock-wrap {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 14px;
    display: grid;
    place-items: center;
    z-index: 1200;
    pointer-events: none;
  }

  .dock {
    position: relative;
    display: flex;
    gap: 8px;
    padding: 9px 10px;
    border-radius: 14px;
    background: var(--glass-bg-strong);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    box-shadow: 0 12px 28px rgb(0 0 0 / 0.34);
    pointer-events: auto;
    animation: rise-in 320ms ease;
  }

  .dock::before {
    content: "";
    position: absolute;
    inset: 1px;
    border-radius: inherit;
    background: linear-gradient(
      180deg,
      rgb(255 255 255 / 0.05),
      rgb(255 255 255 / 0)
    );
    pointer-events: none;
  }

  .app {
    position: relative;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    border: 1px solid rgb(120 144 179 / 0.23);
    background: rgb(15 24 38 / 0.84);
    color: #d8e3f2;
    font-size: 0.82rem;
    font-family: var(--font-mono);
    font-weight: 500;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition:
      transform 180ms ease,
      box-shadow 180ms ease,
      border-color 180ms ease;
    box-shadow: 0 6px 12px rgb(0 0 0 / 0.24);
  }

  .app::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -5px;
    width: 16px;
    height: 3px;
    transform: translateX(-50%) scaleX(0);
    border-radius: 999px;
    background: var(--ui-accent);
    opacity: 0.75;
    transition: transform 160ms ease;
  }

  .app:hover,
  .app.active {
    border-color: var(--glass-border-strong);
    box-shadow: 0 10px 18px rgb(0 0 0 / 0.34);
  }

  .app.active::after,
  .app:hover::after {
    transform: translateX(-50%) scaleX(1);
  }

  @keyframes rise-in {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 780px) {
    .dock-wrap {
      bottom: 8px;
    }

    .dock {
      border-radius: 12px;
      padding: 8px;
      gap: 6px;
    }

    .app {
      width: 36px;
      height: 36px;
      font-size: 0.72rem;
    }
  }
</style>
