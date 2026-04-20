<script lang="ts">
  import { onMount } from "svelte";

  let {
    serverMode = false,
    uptime = "00:00:00",
    cpuLoad = 0,
    processCount = 12,
  } = $props<{
    serverMode?: boolean;
    uptime?: string;
    cpuLoad?: number;
    processCount?: number;
  }>();

  let clock = $state("");

  const refreshClock = () => {
    clock = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  onMount(() => {
    refreshClock();
    const timer = setInterval(refreshClock, 1000);
    return () => clearInterval(timer);
  });
</script>

<header class="menu-bar" class:server={serverMode}>
  <div class="left">
    <div class="brand-badge">TN</div>
    <div class="title">{serverMode ? "SSH // TonimOS" : "TonimOS"}</div>
    {#if !serverMode}
      <div class="item">File</div>
      <div class="item">Edit</div>
      <div class="item">View</div>
      <div class="item">Window</div>
      <div class="item">Help</div>
    {/if}
  </div>
  <div class="right">
    {#if serverMode}
      <div class="status live">UP {uptime}</div>
      <div class="status">CPU {cpuLoad}%</div>
      <div class="status">PROC {processCount}</div>
    {:else}
      <div class="status live">Live</div>
      <div class="status">Wifi</div>
      <div class="status">Bat 100%</div>
      <div class="clock">{clock}</div>
    {/if}
  </div>
</header>

<style>
  .menu-bar {
    position: absolute;
    top: 8px;
    left: 12px;
    right: 12px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    border-radius: 10px;
    background: var(--glass-bg-strong);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    box-shadow: 0 8px 22px rgb(0 0 0 / 0.34);
    color: var(--ui-text);
    z-index: 1200;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    animation: reveal 320ms ease;
  }

  .menu-bar.server {
    background: linear-gradient(
      180deg,
      rgb(10 14 22 / 0.92),
      rgb(7 11 18 / 0.94)
    );
  }

  .left,
  .right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-badge {
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: 1px solid rgb(139 164 199 / 0.28);
    background: rgb(17 27 42 / 0.8);
    font-size: 0.63rem;
    font-weight: 700;
    color: var(--ui-accent);
  }

  .title {
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--ui-text);
  }

  .item {
    padding: 3px 6px;
    border-radius: 6px;
    color: var(--ui-muted);
    opacity: 0.86;
    transition:
      background-color 160ms ease,
      color 160ms ease;
  }

  .item:hover {
    background: rgb(136 184 255 / 0.12);
    color: var(--ui-text);
  }

  .status {
    padding: 3px 7px;
    border-radius: 7px;
    border: 1px solid rgb(121 144 178 / 0.2);
    background: rgb(16 24 38 / 0.72);
    color: var(--ui-muted);
  }

  .status.live {
    border-color: rgb(99 163 255 / 0.42);
    background: rgb(136 184 255 / 0.12);
    color: var(--ui-accent);
  }

  .clock {
    font-variant-numeric: tabular-nums;
    font-family: var(--font-mono);
    letter-spacing: 0.05em;
    color: var(--ui-text);
    min-width: 74px;
    text-align: right;
  }

  @keyframes reveal {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 780px) {
    .item:nth-child(n + 5) {
      display: none;
    }

    .menu-bar {
      top: 8px;
      left: 8px;
      right: 8px;
      height: 34px;
      padding: 0 9px;
      font-size: 0.66rem;
    }

    .right {
      gap: 6px;
    }

    .status:nth-child(2),
    .status:nth-child(3) {
      display: none;
    }
  }
</style>
