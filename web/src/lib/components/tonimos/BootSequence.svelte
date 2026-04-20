<script lang="ts">
  import { onMount } from "svelte";

  let { onDone = () => {} } = $props<{ onDone?: () => void }>();

  const bootLines = [
    "Booting TonimOS...",
    "Loading kernel...",
    "Initializing physics engine...",
    "Mounting /home/tonim",
  ];

  const greetings = [
    "Hello",
    "Bonjour",
    "Hola",
    "Ciao",
    "नमस्ते",
    "你好",
    "Tonim",
  ];

  let bootIndex = $state(-1);
  let greetingIndex = $state(-1);
  let mode = $state<"boot" | "hello" | "zoom">("boot");

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  onMount(() => {
    let cancelled = false;

    (async () => {
      for (let i = 0; i < bootLines.length; i += 1) {
        if (cancelled) return;
        await sleep(480);
        bootIndex = i;
      }

      await sleep(520);
      mode = "hello";

      for (let i = 0; i < greetings.length; i += 1) {
        if (cancelled) return;
        greetingIndex = i;
        await sleep(i === greetings.length - 1 ? 650 : 320);
      }

      if (cancelled) return;
      mode = "zoom";
      await sleep(1100);
      if (!cancelled) onDone();
    })();

    return () => {
      cancelled = true;
    };
  });
</script>

<div class="boot-screen" class:zooming={mode === "zoom"}>
  {#if mode === "boot"}
    <div class="boot-log">
      {#each bootLines.slice(0, bootIndex + 1) as line (line)}
        <div class="line">{line}</div>
      {/each}
    </div>
  {:else}
    <div class="hello-wrap">
      <div class="hello" class:final={greetingIndex === greetings.length - 1}>
        {greetingIndex >= 0 ? greetings[greetingIndex] : ""}
      </div>
    </div>
  {/if}
</div>

<style>
  .boot-screen {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: linear-gradient(
      180deg,
      var(--surface-0) 0%,
      var(--surface-1) 56%,
      var(--surface-2) 100%
    );
    color: var(--ui-text);
    z-index: 2000;
    overflow: hidden;
  }

  .boot-screen::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      46% 38% at 28% 26%,
      rgb(109 153 224 / 0.14),
      transparent 72%
    );
    mix-blend-mode: screen;
    opacity: 0.8;
  }

  .boot-screen::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      rgb(255 255 255 / 0.03) 0,
      rgb(255 255 255 / 0.03) 1px,
      transparent 1px,
      transparent 4px
    );
    opacity: 0.22;
  }

  .boot-log {
    width: min(92vw, 720px);
    padding: 24px;
    border-radius: 12px;
    border: 1px solid var(--glass-border);
    background: var(--glass-bg-strong);
    box-shadow: var(--shadow-soft);
    font-family: var(--font-mono);
    font-size: clamp(0.95rem, 2vw, 1.15rem);
    line-height: 1.74;
    letter-spacing: 0.04em;
  }

  .line {
    opacity: 0;
    color: var(--ui-text);
    animation: type-in 260ms forwards;
  }

  .hello-wrap {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
  }

  .hello {
    font-family: var(--font-ui);
    font-size: clamp(2.1rem, 10vw, 7rem);
    font-weight: 800;
    color: var(--ui-text);
    letter-spacing: 0.04em;
    text-shadow: 0 10px 22px rgb(0 0 0 / 0.4);
    animation: pop 300ms ease;
  }

  .hello.final {
    color: var(--ui-accent);
  }

  .boot-screen.zooming .hello {
    animation: zoom-forward 1s cubic-bezier(0.2, 0.7, 0, 1) forwards;
  }

  @keyframes type-in {
    from {
      opacity: 0;
      transform: translateY(7px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pop {
    from {
      opacity: 0;
      transform: scale(0.84) translateY(6px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes zoom-forward {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(5.3);
      opacity: 0;
    }
  }
</style>
