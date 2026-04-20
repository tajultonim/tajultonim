<script lang="ts">
  import type { DesktopWindow, WindowId } from "./types";

  let {
    win,
    isFocused = false,
    mobileMode = false,
    onAction = () => {},
    onStartDrag = () => {},
    onStartResize = () => {},
    children,
  } = $props<{
    win: DesktopWindow;
    isFocused?: boolean;
    mobileMode?: boolean;
    onAction?: (
      type: "close" | "minimize" | "maximize" | "focus",
      id: WindowId,
    ) => void;
    onStartDrag?: (id: WindowId, event: PointerEvent) => void;
    onStartResize?: (id: WindowId, event: PointerEvent) => void;
    children?: () => unknown;
  }>();

  const containerStyle = $derived(
    mobileMode
      ? ""
      : win.maximized
        ? "left: 8px; top: 42px; width: calc(100% - 16px); height: calc(100% - 108px);"
        : `left:${win.x}px; top:${win.y}px; width:${win.width}px; height:${win.height}px;`,
  );
</script>

<section
  class="window"
  class:focused={isFocused}
  class:maximized={win.maximized}
  class:mobile={mobileMode}
  class:closing={win.closing}
  style={containerStyle}
>
  <div
    class="titlebar"
    role="group"
    aria-label={`${win.title} controls`}
    onpointerdown={(event) => {
      onAction("focus", win.id);
      if (!mobileMode) onStartDrag(win.id, event);
    }}
  >
    <div class="controls">
      <button
        type="button"
        class="dot close"
        onclick={(event) => {
          event.stopPropagation();
          onAction("close", win.id);
        }}
        aria-label="Close"
      ></button>
      <button
        type="button"
        class="dot min"
        onclick={(event) => {
          event.stopPropagation();
          onAction("minimize", win.id);
        }}
        aria-label="Minimize"
      ></button>
      <button
        type="button"
        class="dot max"
        onclick={(event) => {
          event.stopPropagation();
          onAction("maximize", win.id);
        }}
        aria-label="Maximize"
      ></button>
    </div>
    <div class="title">{win.title}</div>
  </div>

  <div
    class="content"
    role="group"
    onpointerdown={() => onAction("focus", win.id)}
  >
    {@render children?.()}
  </div>

  {#if !mobileMode && !win.maximized}
    <button
      type="button"
      class="resize-handle"
      aria-label={`Resize ${win.title}`}
      onpointerdown={(event) => {
        event.stopPropagation();
        onAction("focus", win.id);
        onStartResize(win.id, event);
      }}
    ></button>
  {/if}
</section>

<style>
  .window {
    position: absolute;
    display: flex;
    flex-direction: column;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid var(--glass-border);
    background: linear-gradient(
      180deg,
      rgb(10 16 25 / 0.92),
      rgb(8 13 21 / 0.88)
    );
    backdrop-filter: blur(14px) saturate(110%);
    box-shadow: var(--shadow-soft);
    transform-origin: center;
    animation: appear 300ms cubic-bezier(0.2, 0.8, 0.2, 1);
    will-change: transform, opacity;
  }

  .window.closing {
    pointer-events: none;
    animation: close 220ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  .window::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgb(255 255 255 / 0.04),
      rgb(255 255 255 / 0)
    );
    opacity: 0.65;
  }

  .window.focused {
    border-color: var(--glass-border-strong);
    box-shadow: var(--shadow-focus);
  }

  .window.maximized {
    border-radius: 10px;
  }

  .titlebar {
    height: 36px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    cursor: grab;
    background: linear-gradient(
      180deg,
      rgb(14 21 33 / 0.96),
      rgb(10 16 25 / 0.94)
    );
    border-bottom: 1px solid rgb(130 152 183 / 0.18);
  }

  .titlebar:active {
    cursor: grabbing;
  }

  .controls {
    display: flex;
    gap: 8px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    border: 1px solid rgb(153 171 198 / 0.24);
    cursor: pointer;
    box-shadow: inset 0 1px 2px rgb(255 255 255 / 0.12);
  }

  .dot.close {
    background: #ac6363;
  }

  .dot.min {
    background: #a7895f;
  }

  .dot.max {
    background: #5d8f71;
  }

  .title {
    flex: 1;
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.11em;
    color: var(--ui-muted);
  }

  .content {
    position: relative;
    flex: 1;
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: rgb(116 143 182 / 0.56) transparent;
    background: linear-gradient(
      180deg,
      rgb(9 14 22 / 0.88),
      rgb(8 13 21 / 0.84)
    );
  }

  .resize-handle {
    position: absolute;
    right: 2px;
    bottom: 2px;
    width: 18px;
    height: 18px;
    border: 0;
    background: linear-gradient(
        135deg,
        transparent 0 46%,
        rgb(136 184 255 / 0.26) 46% 52%,
        transparent 52% 100%
      ),
      linear-gradient(
        135deg,
        transparent 0 62%,
        rgb(136 184 255 / 0.12) 62% 68%,
        transparent 68% 100%
      );
    cursor: nwse-resize;
    padding: 0;
    z-index: 5;
  }

  .resize-handle:hover {
    background: linear-gradient(
        135deg,
        transparent 0 44%,
        rgb(136 184 255 / 0.45) 44% 50%,
        transparent 50% 100%
      ),
      linear-gradient(
        135deg,
        transparent 0 60%,
        rgb(136 184 255 / 0.2) 60% 66%,
        transparent 66% 100%
      );
  }

  .window.mobile {
    left: 8px;
    top: 42px;
    width: calc(100% - 16px);
    height: calc(100% - 106px);
    border-radius: 10px;
  }

  .window.mobile .titlebar {
    cursor: default;
  }

  @keyframes appear {
    from {
      opacity: 0;
      transform: translateY(14px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes close {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(12px) scale(0.965);
    }
  }
</style>
