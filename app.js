(() => {
  const chapters = window.CURRICULUM || [];
  const phases = window.CURRICULUM_PHASES || [];
  const completedKey = "asresh-fde-curriculum-progress-v1";
  let completed = new Set();
  let selectedId = 1;
  try { completed = new Set(JSON.parse(localStorage.getItem(completedKey) || "[]").map(Number)); } catch (_) { completed = new Set(); }

  const phaseNav = document.getElementById("phase-nav");
  const phaseSections = document.getElementById("phase-sections");
  const detail = document.getElementById("chapter-detail");
  const search = document.getElementById("chapter-search");
  const progressLabel = document.getElementById("progress-label");
  const progressFill = document.getElementById("progress-fill");

  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
  const findPhase = id => phases.find(phase => phase.id === id);
  const saveProgress = () => {
    try { localStorage.setItem(completedKey, JSON.stringify([...completed])); } catch (_) {}
    updateProgress();
    renderChapters(search.value);
    renderDetail(selectedId);
  };

  function updateProgress() {
    const count = completed.size;
    progressLabel.textContent = `${count} / ${chapters.length} complete`;
    progressFill.style.width = `${chapters.length ? count / chapters.length * 100 : 0}%`;
    document.querySelectorAll(".phase-nav-link").forEach(link => {
      const phase = phases.find(item => item.id === link.dataset.phase);
      const phaseChapters = chapters.filter(chapter => chapter.phase === phase.id);
      const countDone = phaseChapters.filter(chapter => completed.has(chapter.id)).length;
      const small = link.querySelector("small");
      if (small) small.textContent = `${countDone}/${phaseChapters.length} done`;
    });
  }

  function renderNav() {
    phaseNav.innerHTML = phases.map(phase => `<a class="phase-nav-link${phase.id === "foundations" ? " active" : ""}" href="#phase-${phase.id}" data-phase="${phase.id}"><span>${phase.number}</span><span><b>${escapeHTML(phase.name)}</b><small>0/5 done</small></span></a>`).join("");
    phaseNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      phaseNav.querySelectorAll("a").forEach(item => item.classList.toggle("active", item === link));
    }));
  }

  function renderChapters(query = "") {
    const term = query.trim().toLowerCase();
    phaseSections.innerHTML = phases.map(phase => {
      const items = chapters.filter(chapter => chapter.phase === phase.id && (!term || `${chapter.title} ${chapter.blurb} ${chapter.summary}`.toLowerCase().includes(term)));
      if (!items.length) return "";
      return `<section class="phase-block" id="phase-${phase.id}"><div class="phase-block-head"><div class="phase-title-wrap"><span class="phase-badge">${phase.number}</span><div><div class="phase-title">${escapeHTML(phase.name)}</div><div class="phase-subtitle">${escapeHTML(phase.subtitle)}</div></div></div><span class="phase-count">${items.filter(chapter => completed.has(chapter.id)).length} / ${items.length} DONE</span></div><div class="chapter-list">${items.map(chapter => `<button class="chapter-card${selectedId === chapter.id ? " selected" : ""}" type="button" data-id="${chapter.id}" aria-pressed="${selectedId === chapter.id}"><span class="chapter-number">${String(chapter.id).padStart(2,"0")}${completed.has(chapter.id) ? " <span class=\"chapter-check\" aria-label=\"complete\">✓</span>" : ""}</span><span class="chapter-card-main"><span class="chapter-name">${escapeHTML(chapter.title)}</span><span class="chapter-blurb">${escapeHTML(chapter.blurb)}</span></span><span class="chapter-time">${escapeHTML(chapter.time)}</span></button>`).join("")}</div></section>`;
    }).join("");
    if (!phaseSections.innerHTML) phaseSections.innerHTML = `<div class="phase-block phase-empty">No chapter matches “${escapeHTML(query)}”. Try a broader search.</div>`;
    phaseSections.querySelectorAll(".chapter-card").forEach(button => button.addEventListener("click", () => selectChapter(Number(button.dataset.id))));
  }

  function renderDetail(id) {
    const chapter = chapters.find(item => item.id === id);
    if (!chapter) return;
    const phase = findPhase(chapter.phase);
    const previous = chapters.find(item => item.id === id - 1);
    const next = chapters.find(item => item.id === id + 1);
    const isComplete = completed.has(chapter.id);
    const example = (window.CURRICULUM_EXAMPLES || {})[chapter.id];
    const exampleHtml = example ? `
      <section class="code-example" aria-labelledby="code-example-title">
        <div class="code-example-head">
          <div>
            <p class="detail-kicker">CODE EXAMPLE · ${escapeHTML(example.language)}</p>
            <h4 id="code-example-title">${escapeHTML(example.title)}</h4>
          </div>
          <button type="button" class="copy-code-button" data-action="copy-code">Copy code</button>
        </div>
        <p class="code-example-description">${escapeHTML(example.description)}</p>
        <pre><code>${escapeHTML(example.code)}</code></pre>
        <div class="code-example-notes">
          <b>READ THE EXAMPLE</b>
          <ul>${example.walkthrough.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
        </div>
        <p class="copy-status" role="status" aria-live="polite"></p>
      </section>` : "";

    detail.innerHTML = `
      <article class="detail-content">
        <div class="detail-headerline">
          <span class="detail-phase-tag">${phase.number} / ${escapeHTML(phase.name)}</span>
          <span class="detail-time">${escapeHTML(chapter.time)}</span>
        </div>
        <p class="detail-kicker">CHAPTER ${String(chapter.id).padStart(2, "0")} · FIELD BRIEF</p>
        <h3>${escapeHTML(chapter.title)}</h3>
        <p class="detail-summary">${escapeHTML(chapter.summary)}</p>
        <section class="detail-section">
          <h4>YOU WILL BE ABLE TO</h4>
          <ul>${chapter.outcomes.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
        </section>
        <section class="detail-section">
          <h4>IN THIS CHAPTER</h4>
          <ul>${chapter.lessons.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
        </section>
        ${exampleHtml}
        <section class="detail-section">
          <h4>FIELD EXERCISE</h4>
          <p>${escapeHTML(chapter.exercise)}</p>
        </section>
        <div class="artifact-box">
          <span>TAKE THIS WITH YOU</span>
          <b>${escapeHTML(chapter.artifact)}</b>
        </div>
        <div class="detail-actions">
          <button type="button" class="complete-button${isComplete ? " done" : ""}" data-action="complete">
            ${isComplete ? "✓ Completed — mark open" : "Mark chapter complete"}
          </button>
          ${next ? `<button type="button" class="next-button" data-action="next" aria-label="Next chapter">Next →</button>` : previous ? `<button type="button" class="next-button" data-action="next" aria-label="Back to chapter 19">← Back</button>` : ""}
        </div>
      </article>`;
    detail.querySelector("[data-action='complete']").addEventListener("click", () => {
      if (completed.has(chapter.id)) completed.delete(chapter.id); else completed.add(chapter.id);
      saveProgress();
    });
    const nextButton = detail.querySelector("[data-action='next']");
    if (nextButton) nextButton.addEventListener("click", () => selectChapter(next ? next.id : previous.id));
    const copyButton = detail.querySelector("[data-action='copy-code']");
    if (copyButton && example) copyButton.addEventListener("click", async () => {
      const status = detail.querySelector(".copy-status");
      try {
        await navigator.clipboard.writeText(example.code);
        status.textContent = "Code copied.";
      } catch (_) {
        status.textContent = "Clipboard unavailable. Select the snippet to copy it.";
      }
    });
  }

  function selectChapter(id) {
    selectedId = id;
    renderChapters(search.value);
    renderDetail(id);
    const phase = findPhase(chapters.find(chapter => chapter.id === id).phase);
    phaseNav.querySelectorAll("a").forEach(link => link.classList.toggle("active", link.dataset.phase === phase.id));
  }

  renderNav();
  renderChapters();
  renderDetail(selectedId);
  updateProgress();

  search.addEventListener("input", () => renderChapters(search.value));
  document.addEventListener("keydown", event => {
    if (event.key === "/" && !["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) { event.preventDefault(); search.focus(); }
    if (event.key === "Escape" && document.activeElement === search) { search.value = ""; renderChapters(); search.blur(); }
  });
  document.getElementById("resume-button").addEventListener("click", () => {
    const firstOpen = chapters.find(chapter => !completed.has(chapter.id));
    selectChapter(firstOpen ? firstOpen.id : 1);
    document.getElementById("course-map").scrollIntoView({behavior:"smooth"});
  });
  document.querySelectorAll("[data-open-chapter]").forEach(link => link.addEventListener("click", () => selectChapter(Number(link.dataset.openChapter))));
})();
