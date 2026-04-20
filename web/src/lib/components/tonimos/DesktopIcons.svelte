<script lang="ts">
  import type { WindowId } from "./types";

  let { onOpen = () => {} } = $props<{ onOpen?: (id: WindowId) => void }>();

  const items: Array<{ id: WindowId; icon: string; label: string }> = [
    { id: "about", icon: "📝", label: "About.txt" },
    { id: "projects", icon: "📁", label: "Projects/" },
    { id: "resume", icon: "📄", label: "resume.pdf" },
    { id: "lab", icon: "🧪", label: "Physics Lab" },
    { id: "terminal", icon: "⌨️", label: "terminal" },
  ];
</script>

<div class="desktop-icons">
  {#each items as item, index (item.id)}
    <button
      type="button"
      class="icon"
      style={`--i:${index};`}
      onclick={() => onOpen(item.id)}
    >
      <div class="glyph">{item.icon}</div>
      <div class="label">{item.label}</div>
    </button>
  {/each}
</div>

<style>
  .desktop-icons {
    position: absolute;
    top: 64px;
    left: 20px;
    display: grid;
    gap: 10px;
    z-index: 300;
  }

  .icon {
    display: grid;
    justify-items: center;
    gap: 5px;
    width: 92px;
    padding: 10px 8px;
    border-radius: 10px;
    border: 1px solid rgb(119 143 178 / 0.18);
    background: rgb(10 17 27 / 0.45);
    backdrop-filter: blur(4px);
    color: #d4deeb;
    cursor: pointer;
    transition:
      background-color 170ms ease,
      border-color 170ms ease,
      transform 170ms ease,
      box-shadow 170ms ease;
    animation: icon-in 420ms cubic-bezier(0.2, 0.9, 0, 1) both;
    animation-delay: calc(150ms + var(--i) * 80ms);
  }

  .icon:hover {
    background: rgb(15 24 38 / 0.76);
    border-color: rgb(129 178 250 / 0.46);
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgb(0 0 0 / 0.28);
  }

  .glyph {
    font-size: 1.45rem;
    filter: drop-shadow(0 3px 6px rgb(0 0 0 / 0.42));
  }

  .label {
    font-size: 0.75rem;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--ui-muted);
    opacity: 1;
  }

  @keyframes icon-in {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 920px) {
    .desktop-icons {
      display: none;
    }
  }
</style>
