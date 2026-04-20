<script lang="ts">
  const resumeText = `H.M. Tajul Islam Tanim\nBSc in Physics\nBangladesh\n\nCareer Interests:\n- scientific computing\n- machine learning\n- research engineering\n- simulation systems\n\nGoal:\nPursue graduate studies in engineering and contribute to research in computational science and intelligent systems.`;

  const downloadResume = () => {
    const blob = new Blob([resumeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "Tonim_Resume.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };
</script>

<section class="panel resume">
  <h2>Resume</h2>
  <div class="row"><span>Name:</span> H.M. Tajul Islam Tanim</div>
  <div class="row"><span>Degree:</span> BSc in Physics</div>
  <div class="row"><span>Location:</span> Bangladesh</div>

  <h3>Career Interests</h3>
  <ul>
    <li>scientific computing</li>
    <li>machine learning</li>
    <li>research engineering</li>
    <li>simulation systems</li>
  </ul>

  <h3>Goal</h3>
  <p>
    Pursue graduate studies in engineering and contribute to research in
    computational science and intelligent systems.
  </p>

  <button type="button" class="download" onclick={downloadResume}
    >Download Resume</button
  >
</section>

<style>
  .panel {
    padding: 22px;
    color: var(--ui-text);
    line-height: 1.6;
  }

  h2 {
    margin: 0 0 14px;
    font-size: 0.84rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ui-muted);
  }

  h3 {
    margin: 15px 0 9px;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9fb2ca;
  }

  .row {
    margin: 7px 0;
    padding: 7px 10px;
    border-radius: 10px;
    border: 1px solid rgb(123 148 183 / 0.22);
    background: rgb(10 16 25 / 0.62);
  }

  .row span {
    font-weight: 600;
    font-family: var(--font-mono);
    font-size: 0.74rem;
    letter-spacing: 0.04em;
    color: #b8c8dc;
    text-transform: uppercase;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    padding: 6px 0;
    color: #c6d3e5;
  }

  p {
    line-height: 1.62;
    color: #c2d1e4;
  }

  .download {
    margin-top: 14px;
    padding: 10px 14px;
    border-radius: 11px;
    border: 1px solid var(--glass-border-strong);
    background: rgb(136 184 255 / 0.14);
    color: #e3ecfb;
    font-weight: 600;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition:
      transform 140ms ease,
      box-shadow 140ms ease;
  }

  .download:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 18px rgb(0 0 0 / 0.34);
  }
</style>
