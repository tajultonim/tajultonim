<section class="panel contact">
  <h2>Contact</h2>
  <div class="links">
    <a href="https://github.com/" target="_blank" rel="noreferrer"
      ><span></span> GitHub</a
    >
    <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer"
      ><span>in</span> LinkedIn</a
    >
    <a href="mailto:tonim@example.com"><span>✉</span> Email</a>
    <a href="https://instagram.com/" target="_blank" rel="noreferrer"
      ><span>◉</span> Instagram</a
    >
  </div>
</section>

<style>
  .panel {
    padding: 22px;
    color: var(--ui-text);
  }

  h2 {
    margin: 0 0 14px;
    font-size: 0.84rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--ui-muted);
  }

  .links {
    display: grid;
    gap: 11px;
  }

  a {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 12px;
    border-radius: 12px;
    border: 1px solid rgb(121 144 178 / 0.24);
    background: linear-gradient(
      180deg,
      rgb(13 21 33 / 0.76),
      rgb(10 16 25 / 0.72)
    );
    color: #dbe6f3;
    text-decoration: none;
    transition:
      transform 160ms ease,
      border-color 160ms ease,
      box-shadow 160ms ease;
  }

  a:hover {
    transform: translateX(3px);
    border-color: var(--glass-border-strong);
    box-shadow: 0 10px 18px rgb(0 0 0 / 0.34);
  }

  span {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 8px;
    border: 1px solid rgb(127 152 190 / 0.26);
    background: var(--ui-accent-soft);
    color: var(--ui-accent);
    font-family: var(--font-mono);
    font-size: 0.76rem;
    font-weight: 700;
  }
</style>
