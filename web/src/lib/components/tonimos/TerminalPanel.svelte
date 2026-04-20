<script lang="ts">
  import { tick } from "svelte";

  let {
    serverMode = false,
    serverStats = { uptime: "00:00:00", cpuLoad: 18, processCount: 14 },
    onEnterSSH = () => {},
    onExitSSH = () => {},
    onOpenLab = () => {},
  } = $props<{
    serverMode?: boolean;
    serverStats?: { uptime: string; cpuLoad: number; processCount: number };
    onEnterSSH?: () => void;
    onExitSSH?: () => void;
    onOpenLab?: () => void;
  }>();

  type Entry = {
    type: "input" | "output";
    value: string;
  };

  const intro = [
    "Welcome to TonimOS terminal v0.1",
    "Type help to list commands.",
  ];

  const projectLines = [
    "SneakyChat - experimental chat platform.",
    "AI Science Reels - automating short AI science videos.",
    "Scientific Tools - mini simulations and utility tools.",
  ];

  const physicsFacts = [
    "In chaotic systems, tiny initial differences can lead to wildly different outcomes.",
    "Statistical mechanics connects microscopic randomness with macroscopic laws.",
    "Numerical simulation lets us explore systems that cannot be solved analytically.",
    "Complex systems often exhibit emergent behavior that is not obvious from local rules.",
  ];

  let lines = $state<Entry[]>(
    intro.map((value) => ({ type: "output", value })),
  );
  let input = $state("");
  let history = $state<string[]>([]);
  let historyIndex = $state(-1);
  let body: HTMLDivElement | undefined;
  let inputEl: HTMLInputElement | undefined;

  const prompt = "tonim@tonimos:~$";

  const print = async (value: string) => {
    lines = [...lines, { type: "output", value }];
    await tick();
    body?.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
  };

  const processCommand = async (command: string) => {
    const normalized = command.trim().toLowerCase();
    if (!normalized) return;

    if (!serverMode) {
      switch (normalized) {
        case "ssh tonim@tonimos":
          await print("connecting to tonim@tonimos ...");
          await print("establishing secure shell ...");
          await print("screen flicker detected");
          onEnterSSH();
          return;
        case "lab":
          await print("opening scientific notebook mode ...");
          onOpenLab();
          return;
      }
    }

    if (serverMode) {
      switch (normalized) {
        case "gui":
        case "exit":
        case "logout":
          await print("closing ssh session ...");
          onExitSSH();
          return;
        case "lab":
          await print("opening lab workspace ...");
          onOpenLab();
          return;
        case "ls":
        case "ls /projects":
          await print("about.txt  projects/  resume.pdf  terminal/");
          await print("physics-lab/");
          return;
        case "cat about.txt":
          await print(
            "Physics graduate from Bangladesh building computational and software systems.",
          );
          return;
        case "top":
          await print(`PID   USER   CPU  MEM  CMD`);
          await print(
            `101   tonim  ${serverStats.cpuLoad.toFixed(0)}%   34%  physics-bg`,
          );
          await print(`102   tonim   7%   12%  terminal`);
          await print(`103   tonim   3%    4%  lab-renderer`);
          return;
        case "uptime":
          await print(
            `up ${serverStats.uptime}, 1 user, load average: ${serverStats.cpuLoad.toFixed(2)}`,
          );
          return;
        case "neofetch":
          await print("TonimOS SSH session / Linux server mode");
          await print("Host: tonimos-lab-node");
          await print("Kernel: ssh + physics engine");
          await print(`Processes: ${serverStats.processCount}`);
          await print(`Load: ${serverStats.cpuLoad}%`);
          return;
      }
    }

    switch (normalized) {
      case "help":
        await print(
          serverMode
            ? "Commands: help, neofetch, ls /projects, cat about.txt, top, uptime, lab, gui, exit"
            : "Commands: help, whoami, about, projects, skills, contact, clear, neofetch, physics, ssh tonim@tonimos, lab",
        );
        break;
      case "whoami":
        await print("Tonim");
        await print(
          "Physics graduate exploring scientific computing and software engineering.",
        );
        break;
      case "about":
        await print(
          "Physics graduate from Bangladesh building computational and software systems.",
        );
        break;
      case "projects":
        for (const item of projectLines) await print(`- ${item}`);
        break;
      case "skills":
        for (const skill of [
          "Python",
          "JavaScript",
          "TypeScript",
          "Machine Learning",
          "Scientific Computing",
          "Web Development",
          "Systems Programming",
        ]) {
          await print(skill);
        }
        break;
      case "contact":
        await print("GitHub: github.com");
        await print("LinkedIn: linkedin.com");
        await print("Email: tonim@example.com");
        await print("Instagram: instagram.com");
        break;
      case "clear":
        lines = [];
        break;
      case "neofetch":
        if (serverMode) {
          await print("TonimOS SSH session / Linux server mode");
          await print(`Uptime: ${serverStats.uptime}`);
          await print(`CPU load: ${serverStats.cpuLoad.toFixed(0)}%`);
          await print(`Process count: ${serverStats.processCount}`);
        } else {
          await print("TonimOS 1.0 / SvelteKit");
          await print("Host: Hacker-Scientist Workstation");
          await print("Kernel: physics-sim + creative-code");
          await print("Shell: zsh-inspired");
          await print("Theme: dark glass + neon");
        }
        break;
      case "physics": {
        await print("Favorite topics:");
        await print("- statistical mechanics");
        await print("- computational physics");
        await print("- complex systems");
        const randomFact =
          physicsFacts[Math.floor(Math.random() * physicsFacts.length)];
        await print(`Fact: ${randomFact}`);
        break;
      }
      default:
        await print(`Command not found: ${normalized}`);
        await print("Type help for a list of commands.");
    }
  };

  const submit = async () => {
    const command = input.trim();
    if (!command) return;
    lines = [...lines, { type: "input", value: `${prompt} ${command}` }];
    history = [...history, command];
    historyIndex = history.length;
    input = "";
    await processCommand(command);
    await tick();
    body?.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      historyIndex = Math.max(0, historyIndex - 1);
      input = history[historyIndex] ?? "";
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!history.length) return;
      historyIndex = Math.min(history.length, historyIndex + 1);
      input = history[historyIndex] ?? "";
    }
  };
</script>

<section
  class="terminal"
  class:server={serverMode}
  role="button"
  tabindex="0"
  onclick={() => inputEl?.focus()}
  onkeydown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputEl?.focus();
    }
  }}
>
  {#if serverMode}
    <div class="server-strip">
      <div><span>uptime</span> {serverStats.uptime}</div>
      <div><span>cpu</span> {serverStats.cpuLoad.toFixed(0)}%</div>
      <div><span>proc</span> {serverStats.processCount}</div>
    </div>
  {/if}
  <div class="body" bind:this={body}>
    {#each lines as line, index (index)}
      <div class="line" class:input={line.type === "input"}>{line.value}</div>
    {/each}
  </div>
  <div class="prompt-row">
    <span class="prompt">{prompt}</span>
    <input
      bind:this={inputEl}
      bind:value={input}
      onkeydown={onKeyDown}
      spellcheck="false"
      autocomplete="off"
    />
    <span class="cursor" aria-hidden="true"></span>
  </div>
</section>

<style>
  .terminal {
    position: relative;
    height: 100%;
    display: grid;
    grid-template-rows: 1fr auto;
    padding: 14px;
    font-family: var(--font-mono);
    font-size: 0.84rem;
    background: linear-gradient(
      180deg,
      rgb(8 13 21 / 0.96),
      rgb(7 11 18 / 0.98)
    );
    color: #c9d7e8;
    isolation: isolate;
  }

  .terminal.server {
    padding-top: 10px;
  }

  .terminal::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
        180deg,
        rgb(255 255 255 / 0.02),
        transparent 42%
      ),
      repeating-linear-gradient(
        0deg,
        rgb(136 184 255 / 0.05) 0,
        rgb(136 184 255 / 0.05) 1px,
        transparent 1px,
        transparent 3px
      );
    opacity: 0.2;
  }

  .body {
    position: relative;
    z-index: 1;
    overflow: auto;
    padding-right: 6px;
    scrollbar-width: thin;
    scrollbar-color: rgb(112 140 176 / 0.72) transparent;
  }

  .server-strip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
    margin-bottom: 10px;
    padding: 10px 12px;
    border: 1px solid rgb(118 142 177 / 0.2);
    border-radius: 12px;
    background: rgb(10 16 25 / 0.76);
    color: #d9e4f3;
    font-size: 0.76rem;
    letter-spacing: 0.03em;
    position: relative;
    z-index: 1;
  }

  .server-strip span {
    color: var(--ui-muted);
    text-transform: uppercase;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    margin-right: 6px;
  }

  .line {
    line-height: 1.62;
    word-break: break-word;
  }

  .line.input {
    color: #eef4fd;
  }

  .prompt-row {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    border-top: 1px solid rgb(118 142 177 / 0.34);
    padding-top: 11px;
    margin-top: 9px;
  }

  .prompt {
    color: var(--ui-accent);
    flex: 0 0 auto;
  }

  input {
    flex: 1;
    background: transparent;
    border: 0;
    outline: none;
    color: #e0ebfa;
    font: inherit;
    caret-color: var(--ui-accent);
  }

  .cursor {
    width: 7px;
    height: 14px;
    border-radius: 1px;
    background: var(--ui-accent);
    animation: blink 1s steps(1) infinite;
  }

  @keyframes blink {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0;
    }
  }
</style>
