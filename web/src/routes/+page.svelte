<script lang="ts">
  import { onMount } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import AboutPanel from "$lib/components/tonimos/AboutPanel.svelte";
  import BootSequence from "$lib/components/tonimos/BootSequence.svelte";
  import ContactPanel from "$lib/components/tonimos/ContactPanel.svelte";
  import DesktopIcons from "$lib/components/tonimos/DesktopIcons.svelte";
  import Dock from "$lib/components/tonimos/Dock.svelte";
  import MenuBar from "$lib/components/tonimos/MenuBar.svelte";
  import PhysicsBackground from "$lib/components/tonimos/PhysicsBackground.svelte";
  import PhysicsLabPanel from "$lib/components/tonimos/PhysicsLabPanel.svelte";
  import ProjectsPanel from "$lib/components/tonimos/ProjectsPanel.svelte";
  import ResumePanel from "$lib/components/tonimos/ResumePanel.svelte";
  import TerminalPanel from "$lib/components/tonimos/TerminalPanel.svelte";
  import type { DesktopWindow, WindowId } from "$lib/components/tonimos/types";
  import WindowFrame from "$lib/components/tonimos/WindowFrame.svelte";

  let booted = $state(false);
  let mobileMode = $state(false);
  let sshMode = $state(false);
  let activeWindow = $state<WindowId>("terminal");
  let zCounter = $state(40);
  let uiTick = $state(0);
  let sshStartedAt = $state<number | null>(null);
  let serverCpuLoad = $state(18);
  let serverProcessCount = $state(14);
  let transitionFlash = $state(false);
  let closeTimers = new SvelteMap<WindowId, number>();

  let windows = $state<DesktopWindow[]>([
    {
      id: "about",
      title: "About Tonim",
      x: 90,
      y: 84,
      width: 440,
      height: 390,
      z: 22,
      minimized: false,
      maximized: false,
      closed: false,
      closing: false,
    },
    {
      id: "projects",
      title: "Projects",
      x: 500,
      y: 112,
      width: 460,
      height: 330,
      z: 26,
      minimized: false,
      maximized: false,
      closed: false,
      closing: false,
    },
    {
      id: "terminal",
      title: "Terminal",
      x: 225,
      y: 285,
      width: 620,
      height: 280,
      z: 30,
      minimized: false,
      maximized: false,
      closed: false,
      closing: false,
    },
    {
      id: "resume",
      title: "Resume",
      x: 984,
      y: 90,
      width: 360,
      height: 380,
      z: 18,
      minimized: false,
      maximized: false,
      closed: false,
      closing: false,
    },
    {
      id: "contact",
      title: "Contact",
      x: 890,
      y: 290,
      width: 330,
      height: 260,
      z: 20,
      minimized: false,
      maximized: false,
      closed: false,
      closing: false,
    },
    {
      id: "lab",
      title: "Physics Lab",
      x: 120,
      y: 84,
      width: 720,
      height: 560,
      z: 16,
      minimized: false,
      maximized: false,
      closed: true,
      closing: false,
    },
  ]);

  const renderedWindows = $derived(
    [...windows]
      .filter((win) => !win.closed && !win.minimized)
      .filter((win) => (!sshMode ? true : win.id === "terminal"))
      .sort((a, b) => a.z - b.z),
  );

  const terminalVisible = $derived(
    windows.some(
      (win) => win.id === "terminal" && !win.closed && !win.minimized,
    ),
  );

  const windowFields = $derived(
    windows
      .filter((win) => !win.closed)
      .map((win) => ({
        x: win.x,
        y: win.y,
        width: win.width,
        height: win.height,
      })),
  );

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  };

  const refreshServerStats = () => {
    if (!sshMode || sshStartedAt === null) return;
    const uptime = Math.max(0, Math.floor((Date.now() - sshStartedAt) / 1000));
    serverCpuLoad = Math.max(
      7,
      Math.min(
        97,
        Math.round(
          18 + Math.sin(uiTick * 0.65) * 14 + Math.cos(uiTick * 0.21) * 7,
        ),
      ),
    );
    serverProcessCount = 12 + Math.round(Math.abs(Math.sin(uiTick * 0.45)) * 6);
    sshStartedAt = Date.now() - uptime * 1000;
  };

  const recalcMobile = () => {
    mobileMode = window.innerWidth < 920;
  };

  const cancelCloseAnimation = (id: WindowId) => {
    const timer = closeTimers.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      closeTimers.delete(id);
    }
  };

  const snapWindow = (win: DesktopWindow) => {
    if (mobileMode || win.maximized) return win;

    const desktopTop = 42;
    const desktopBottom = 82;
    const snapThreshold = 28;
    const margin = 8;
    const halfGap = 8;
    const maxHeight = Math.max(
      180,
      window.innerHeight - desktopTop - desktopBottom,
    );
    const halfWidth = Math.max(
      280,
      Math.floor((window.innerWidth - margin * 2 - halfGap) / 2),
    );

    const nearLeft = win.x <= margin + snapThreshold;
    const nearRight =
      win.x + win.width >= window.innerWidth - margin - snapThreshold;
    const nearTop = win.y <= desktopTop + snapThreshold;
    const nearBottom =
      win.y + win.height >= window.innerHeight - desktopBottom - snapThreshold;

    if (nearTop) {
      return {
        ...win,
        x: 8,
        y: 42,
        width: Math.max(280, window.innerWidth - 16),
        height: Math.max(180, window.innerHeight - 108),
        maximized: true,
      };
    }

    if (nearLeft) {
      return {
        ...win,
        x: margin,
        y: desktopTop,
        width: halfWidth,
        height: maxHeight,
        maximized: false,
      };
    }

    if (nearRight) {
      return {
        ...win,
        x: margin + halfWidth + halfGap,
        y: desktopTop,
        width: halfWidth,
        height: maxHeight,
        maximized: false,
      };
    }

    if (nearBottom) {
      return {
        ...win,
        y: Math.max(
          desktopTop,
          window.innerHeight - desktopBottom - win.height,
        ),
      };
    }

    return win;
  };

  onMount(() => {
    recalcMobile();
    window.addEventListener("resize", recalcMobile);
    const timer = setInterval(() => {
      uiTick += 1;
      refreshServerStats();
    }, 1000);
    return () => {
      window.removeEventListener("resize", recalcMobile);
      clearInterval(timer);
    };
  });

  const setWindows = (next: DesktopWindow[]) => {
    windows = next;
    const open = [...next]
      .filter((win) => !win.closed && !win.minimized)
      .sort((a, b) => b.z - a.z);
    if (!open.length) return;
    if (!open.some((win) => win.id === activeWindow)) {
      activeWindow = open[0].id;
    }
  };

  const focusWindow = (id: WindowId) => {
    zCounter += 1;
    activeWindow = id;
    cancelCloseAnimation(id);
    setWindows(
      windows.map((win) =>
        win.id === id
          ? {
              ...win,
              z: zCounter,
              closed: false,
              closing: false,
              minimized: false,
            }
          : win,
      ),
    );
  };

  const openWindow = (id: WindowId) => {
    if (sshMode && id !== "terminal") return;
    cancelCloseAnimation(id);
    if (id === "lab") {
      cancelCloseAnimation(id);
      windows = windows.map((win) =>
        win.id === "lab"
          ? {
              ...win,
              closed: false,
              closing: false,
              minimized: false,
              maximized: false,
            }
          : win,
      );
      focusWindow(id);
      return;
    }
    focusWindow(id);
  };

  const openLabWindow = () => {
    sshMode = false;
    sshStartedAt = null;
    cancelCloseAnimation("lab");
    windows = windows.map((win) =>
      win.id === "lab"
        ? {
            ...win,
            closed: false,
            closing: false,
            minimized: false,
            maximized: false,
          }
        : win,
    );
    focusWindow("lab");
    transitionFlash = true;
    window.setTimeout(() => (transitionFlash = false), 240);
  };

  const enterSSHMode = () => {
    sshMode = true;
    sshStartedAt = Date.now();
    cancelCloseAnimation("terminal");
    focusWindow("terminal");
    windows = windows.map((win) =>
      win.id === "terminal"
        ? {
            ...win,
            maximized: true,
            closed: false,
            closing: false,
            minimized: false,
          }
        : win,
    );
    transitionFlash = true;
    window.setTimeout(() => (transitionFlash = false), 420);
    refreshServerStats();
  };

  const exitSSHMode = () => {
    sshMode = false;
    sshStartedAt = null;
    windows = windows.map((win) =>
      win.id === "terminal" ? { ...win, maximized: false } : win,
    );
    transitionFlash = true;
    window.setTimeout(() => (transitionFlash = false), 220);
  };

  const handleWindowAction = (
    type: "close" | "minimize" | "maximize" | "focus",
    id: WindowId,
  ) => {
    if (sshMode && id !== "terminal") return;
    if (type === "focus") {
      focusWindow(id);
      return;
    }

    if (type === "close") {
      cancelCloseAnimation(id);
      setWindows(
        windows.map((win) =>
          win.id === id ? { ...win, closing: true, minimized: false } : win,
        ),
      );
      const timer = window.setTimeout(() => {
        setWindows(
          windows.map((win) =>
            win.id === id ? { ...win, closed: true, closing: false } : win,
          ),
        );
        closeTimers.delete(id);
      }, 220);
      closeTimers.set(id, timer);
      return;
    }

    if (type === "minimize") {
      setWindows(
        windows.map((win) =>
          win.id === id ? { ...win, minimized: true } : win,
        ),
      );
      return;
    }

    zCounter += 1;
    activeWindow = id;
    cancelCloseAnimation(id);
    setWindows(
      windows.map((win) =>
        win.id === id
          ? {
              ...win,
              maximized: !win.maximized,
              z: zCounter,
              minimized: false,
              closing: false,
            }
          : win,
      ),
    );
  };

  const startDrag = (id: WindowId, event: PointerEvent) => {
    if (mobileMode) return;
    const candidate = windows.find((win) => win.id === id);
    if (!candidate || candidate.maximized || candidate.closing) return;

    event.preventDefault();
    const originX = candidate.x;
    const originY = candidate.y;
    const startX = event.clientX;
    const startY = event.clientY;

    const onMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const maxX = Math.max(8, window.innerWidth - candidate.width - 8);
      const maxY = Math.max(42, window.innerHeight - candidate.height - 82);
      const nextX = Math.max(8, Math.min(maxX, originX + dx));
      const nextY = Math.max(42, Math.min(maxY, originY + dy));
      setWindows(
        windows.map((win) =>
          win.id === id ? { ...win, x: nextX, y: nextY } : win,
        ),
      );
    };

    const onUp = () => {
      const snapped = snapWindow(candidate);
      if (
        snapped.x !== candidate.x ||
        snapped.y !== candidate.y ||
        snapped.width !== candidate.width ||
        snapped.height !== candidate.height ||
        snapped.maximized !== candidate.maximized
      ) {
        setWindows(
          windows.map((win) => (win.id === id ? { ...win, ...snapped } : win)),
        );
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startResize = (id: WindowId, event: PointerEvent) => {
    if (mobileMode) return;
    const candidate = windows.find((win) => win.id === id);
    if (!candidate || candidate.maximized || candidate.closing) return;

    event.preventDefault();
    event.stopPropagation();
    const originWidth = candidate.width;
    const originHeight = candidate.height;
    const startX = event.clientX;
    const startY = event.clientY;
    const minWidth = 280;
    const minHeight = 180;

    const onMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const maxWidth = Math.max(minWidth, window.innerWidth - candidate.x - 8);
      const maxHeight = Math.max(
        minHeight,
        window.innerHeight - candidate.y - 82,
      );
      const nextWidth = Math.max(
        minWidth,
        Math.min(maxWidth, originWidth + dx),
      );
      const nextHeight = Math.max(
        minHeight,
        Math.min(maxHeight, originHeight + dy),
      );

      setWindows(
        windows.map((win) =>
          win.id === id
            ? { ...win, width: nextWidth, height: nextHeight }
            : win,
        ),
      );
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };
</script>

<div class="tonimos">
  <PhysicsBackground
    terminalActive={terminalVisible}
    serverMode={sshMode}
    labMode={activeWindow === "lab"}
    {windowFields}
  />

  {#if transitionFlash}
    <div class="transition-flash" aria-hidden="true"></div>
  {/if}

  {#if !booted}
    <BootSequence onDone={() => (booted = true)} />
  {/if}

  {#if booted}
    <MenuBar
      serverMode={sshMode}
      uptime={sshStartedAt === null
        ? "00:00:00"
        : formatUptime(
            Math.max(0, Math.floor((Date.now() - sshStartedAt) / 1000)),
          )}
      cpuLoad={serverCpuLoad}
      processCount={serverProcessCount}
    />

    {#if !sshMode}
      <DesktopIcons onOpen={openWindow} />
    {/if}

    <div class="desktop-area">
      {#each renderedWindows as win (win.id)}
        {#if !mobileMode || win.id === activeWindow || sshMode}
          <WindowFrame
            {win}
            isFocused={activeWindow === win.id}
            {mobileMode}
            onAction={handleWindowAction}
            onStartDrag={startDrag}
            onStartResize={startResize}
          >
            {#if win.id === "about"}
              <AboutPanel />
            {:else if win.id === "projects"}
              <ProjectsPanel />
            {:else if win.id === "terminal"}
              <TerminalPanel
                serverMode={sshMode}
                serverStats={{
                  uptime:
                    sshStartedAt === null
                      ? "00:00:00"
                      : formatUptime(
                          Math.max(
                            0,
                            Math.floor((Date.now() - sshStartedAt) / 1000),
                          ),
                        ),
                  cpuLoad: serverCpuLoad,
                  processCount: serverProcessCount,
                }}
                onEnterSSH={enterSSHMode}
                onExitSSH={exitSSHMode}
                onOpenLab={openLabWindow}
              />
            {:else if win.id === "resume"}
              <ResumePanel />
            {:else if win.id === "contact"}
              <ContactPanel />
            {:else if win.id === "lab"}
              <PhysicsLabPanel />
            {/if}
          </WindowFrame>
        {/if}
      {/each}
    </div>

    {#if !sshMode}
      <Dock onOpen={openWindow} {activeWindow} />
    {/if}

    {#if sshMode}
      <aside class="server-hud" aria-label="Server status">
        <div>
          <span>uptime</span>
          <strong
            >{sshStartedAt === null
              ? "00:00:00"
              : formatUptime(
                  Math.max(0, Math.floor((Date.now() - sshStartedAt) / 1000)),
                )}</strong
          >
        </div>
        <div>
          <span>cpu</span>
          <strong>{serverCpuLoad}%</strong>
        </div>
        <div>
          <span>proc</span>
          <strong>{serverProcessCount}</strong>
        </div>
      </aside>
    {/if}
  {/if}
</div>

<style>
  .tonimos {
    position: fixed;
    inset: 0;
    overflow: hidden;
    isolation: isolate;
    background: linear-gradient(180deg, #060a10 0%, #0a0f17 56%, #0e1521 100%);
  }

  .tonimos::before {
    content: "";
    position: absolute;
    inset: -16%;
    z-index: 0;
    pointer-events: none;
    background: radial-gradient(
      48% 40% at 28% 24%,
      rgb(108 150 219 / 0.16),
      transparent 72%
    );
    mix-blend-mode: screen;
    animation: haze-shift 26s ease-in-out infinite alternate;
  }

  .tonimos::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: linear-gradient(0deg, rgb(255 255 255 / 0.03), transparent 26%),
      radial-gradient(
        42% 26% at 50% 100%,
        rgb(99 130 182 / 0.12),
        transparent 72%
      );
  }

  .desktop-area {
    position: absolute;
    inset: 0;
    padding-top: 44px;
    padding-bottom: 90px;
    z-index: 450;
    animation: desktop-in 460ms cubic-bezier(0.2, 0.9, 0, 1);
  }

  .transition-flash {
    position: absolute;
    inset: 0;
    z-index: 1500;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgb(255 255 255 / 0.16),
      rgb(136 184 255 / 0.06)
    );
    animation: flash-fade 420ms ease forwards;
  }

  .server-hud {
    position: absolute;
    right: 12px;
    top: 58px;
    z-index: 1200;
    display: grid;
    gap: 8px;
    padding: 12px;
    min-width: 180px;
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    background: rgb(7 11 18 / 0.78);
    box-shadow: var(--shadow-soft);
  }

  .server-hud div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    color: #c8d4e5;
  }

  .server-hud span {
    color: var(--ui-muted);
    text-transform: uppercase;
  }

  .server-hud strong {
    font-weight: 600;
    color: #edf3fb;
  }

  @keyframes desktop-in {
    from {
      opacity: 0;
      transform: translateY(14px) scale(0.99);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes haze-shift {
    0% {
      transform: translate3d(-1.5%, -1%, 0);
    }
    100% {
      transform: translate3d(1.5%, 1%, 0);
    }
  }

  @keyframes flash-fade {
    0% {
      opacity: 0;
    }
    18% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @media (max-width: 920px) {
    .desktop-area {
      padding-top: 40px;
      padding-bottom: 82px;
    }
  }
</style>
