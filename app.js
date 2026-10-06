(() => {
  const chapters = window.CURRICULUM || [];
  const phases = window.CURRICULUM_PHASES || [];
  const completedKey = "asresh-fde-curriculum-progress-v1";
  const reader = document.getElementById("chapter-reader");
  const lessonContent = window.CURRICULUM_LESSONS || {};
  const studyContent = window.CURRICULUM_STUDY || {};
  const requestedId = Number(new URLSearchParams(window.location.search).get("chapter"));
  let completed = new Set();
  let selectedId = chapters.some(chapter => chapter.id === requestedId) ? requestedId : 1;
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
    if (!reader.hidden) updateReaderCompletion(selectedId);
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
      return `<section class="phase-block" id="phase-${phase.id}"><div class="phase-block-head"><div class="phase-title-wrap"><span class="phase-badge">${phase.number}</span><div><div class="phase-title">${escapeHTML(phase.name)}</div><div class="phase-subtitle">${escapeHTML(phase.subtitle)}</div></div></div><span class="phase-count">${items.filter(chapter => completed.has(chapter.id)).length} / ${items.length} DONE</span></div><div class="chapter-list">${items.map(chapter => `<a class="chapter-card${selectedId === chapter.id ? " selected" : ""}" href="?chapter=${chapter.id}" data-id="${chapter.id}" aria-label="Open chapter ${chapter.id}: ${escapeHTML(chapter.title)}"><span class="chapter-number">${String(chapter.id).padStart(2,"0")}${completed.has(chapter.id) ? " <span class=\"chapter-check\" aria-label=\"complete\">✓</span>" : ""}</span><span class="chapter-card-main"><span class="chapter-name">${escapeHTML(chapter.title)}</span><span class="chapter-blurb">${escapeHTML(chapter.blurb)}</span></span><span class="chapter-time">${escapeHTML(chapter.time)}</span></a>`).join("")}</div></section>`;
    }).join("");
    if (!phaseSections.innerHTML) phaseSections.innerHTML = `<div class="phase-block phase-empty">No chapter matches “${escapeHTML(query)}”. Try a broader search.</div>`;
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
        <a class="detail-read-link" href="?chapter=${chapter.id}">Read the full chapter <span aria-hidden="true">→</span></a>
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
          ${next ? `<a class="next-button" href="?chapter=${next.id}" aria-label="Next chapter">Next →</a>` : previous ? `<a class="next-button" href="?chapter=${previous.id}" aria-label="Back to chapter 19">← Back</a>` : ""}
        </div>
      </article>`;
    detail.querySelector("[data-action='complete']").addEventListener("click", () => {
      if (completed.has(chapter.id)) completed.delete(chapter.id); else completed.add(chapter.id);
      saveProgress();
    });
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

  function minutesFor(time) {
    const match = time.match(/(?:(\d+)h)?\s*(?:(\d+)m)?/i);
    return (Number(match?.[1] || 0) * 60) + Number(match?.[2] || 0);
  }

  function durationLabel(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return [hours ? `${hours}h` : "", remainder ? `${remainder}m` : ""].filter(Boolean).join(" ") || "1m";
  }

  function renderCodeExample(example, chapterId) {
    if (!example) return "";
    const study = studyContent[chapterId] || {};
    return `<section class="reader-code code-example" aria-labelledby="reader-code-title">
      <div class="code-example-head"><div><p class="detail-kicker">CODE WALKTHROUGH · ${escapeHTML(example.language)}</p><h3 id="reader-code-title">${escapeHTML(example.title)}</h3></div><button type="button" class="copy-code-button" data-reader-copy="${chapterId}">Copy code</button></div>
      <p class="code-example-description">${escapeHTML(example.description)}</p><pre><code>${escapeHTML(example.code)}</code></pre>
      <div class="code-example-notes"><b>TRACE THE DECISIONS</b><ul>${example.walkthrough.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul><div class="code-practice"><b>NOW WORK IT THROUGH</b><p>${escapeHTML(study.codeTask || "Run the example, trace its inputs and outputs, then change one requirement and test the result.")}</p></div></div><p class="copy-status" role="status" aria-live="polite"></p>
    </section>`;
  }

  function updateReaderCompletion(id) {
    const button = reader.querySelector("[data-reader-complete]");
    if (!button) return;
    const isComplete = completed.has(id);
    button.classList.toggle("done", isComplete);
    button.textContent = isComplete ? "✓ Chapter complete — mark as in progress" : "Mark chapter complete";
  }

  function renderReader(id) {
    const chapter = chapters.find(item => item.id === id);
    if (!chapter) return;
    const lesson = lessonContent[id] || {};
    const study = studyContent[id] || {};
    const phase = findPhase(chapter.phase);
    const example = (window.CURRICULUM_EXAMPLES || {})[id];
    const previous = chapters.find(item => item.id === id - 1);
    const next = chapters.find(item => item.id === id + 1);
    const totalMinutes = minutesFor(chapter.time);
    const labMinutes = (study.tasks || []).reduce((sum, task) => sum + task.minutes, 0);
    const plan = [
      { label: "Study the concepts", minutes: study.learn || 0, detail: "Read each section slowly, annotate unfamiliar terms, and test the ideas against the field scenario." },
      { label: "Work through the code", minutes: study.code || 0, detail: study.codeTask || "Trace inputs, outputs, and failure behavior; then make and test one small change." },
      { label: "Build the guided lab", minutes: labMinutes, detail: "Complete the timed tasks below and keep the listed deliverables." },
      { label: "Review and document", minutes: study.review || 0, detail: "Answer the self-check from memory, inspect your artifact against the outcomes, and write one next question." }
    ];
    const sections = lesson.sections || [];
    const articleSections = sections.map((section, index) => `
      ${index === 1 && study.case ? `<section class="reader-field-case" id="reader-field-case"><p class="reader-overline">FIELD SCENARIO · PAUSE BEFORE REVEALING THE DEBRIEF</p><h2>${escapeHTML(study.case.title)}</h2><p>${escapeHTML(study.case.story)}</p><div class="case-question"><b>YOUR DECISION</b><p>${escapeHTML(study.case.question)}</p><details><summary>Show a reasoned approach</summary><p>${escapeHTML(study.case.answer)}</p></details></div></section>` : ""}
      ${index === 1 ? renderCodeExample(example, id) : ""}
      <section class="lesson-section" id="lesson-section-${index + 1}"><p class="reader-overline">${String(index + 1).padStart(2, "0")} / LEARN</p><h2>${escapeHTML(section.title)}</h2>${section.paragraphs.map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join("")}</section>
    `).join("");
    const model = lesson.model || {title:"Workflow model",steps:[]};
    document.body.classList.add("reading-mode");
    reader.hidden = false;
    document.title = `${chapter.title} — FDE Field Guide`;
    reader.innerHTML = `
      <header class="reader-topbar"><a class="reader-brand" href="index.html"><span class="brand-mark">F</span><span>FIELDGUIDE<span class="wordmark-dot">/</span>FDE</span></a><a class="reader-back" href="index.html#course-map">← All chapters</a></header>
      <section class="reader-hero"><div class="reader-hero-inner"><div class="reader-hero-copy"><div class="reader-breadcrumb"><span>${escapeHTML(phase.number)} · ${escapeHTML(phase.name)}</span><span>CHAPTER ${String(id).padStart(2,"0")} / 20</span></div><p class="eyebrow"><span class="eyebrow-line"></span> FIELD GUIDE · ${escapeHTML(chapter.time)} GUIDED STUDY</p><h1>${escapeHTML(chapter.title)}</h1><p>${escapeHTML(chapter.summary)}</p><div class="reader-hero-meta"><span>READ · TRACE · BUILD · REVIEW</span><span>${escapeHTML(chapter.artifact)}</span></div></div><aside class="study-plan"><span class="study-plan-kicker">YOUR ${escapeHTML(chapter.time).toUpperCase()} STUDY PLAN</span><p>This is a guided study session. The timed activities below add up to the roadmap estimate.</p>${plan.map(item => `<div class="study-plan-row"><span>${escapeHTML(item.label)}</span><b>${durationLabel(item.minutes)}</b><i><span style="width:${Math.round(item.minutes/totalMinutes*100)}%"></span></i><small>${escapeHTML(item.detail)}</small></div>`).join("")}</aside></div></section>
      <div class="reader-layout"><article class="lesson-article">
        <section class="reader-outcomes"><p class="reader-overline">BY THE END OF THIS CHAPTER</p><ul>${chapter.outcomes.map(item=>`<li>${escapeHTML(item)}</li>`).join("")}</ul></section>
        ${articleSections}
        <section class="workflow-model"><p class="reader-overline">KEEP THIS MODEL IN VIEW</p><h2>${escapeHTML(model.title)}</h2><div class="workflow-steps">${model.steps.map((step,index)=>`<div class="workflow-step"><span>${String(index+1).padStart(2,"0")}</span><b>${escapeHTML(step)}</b>${index<model.steps.length-1?`<i aria-hidden="true">↓</i>`:""}</div>`).join("")}</div></section>
        <section class="reader-lab"><p class="reader-overline">GUIDED BUILD LAB · ${durationLabel(labMinutes)}</p><h2>Put it to work</h2><p class="lab-intro">${escapeHTML(chapter.exercise)} Work with synthetic data unless you have explicit approval for a real customer dataset. Spend the time shown on each task and keep its deliverable.</p><ol class="timed-lab">${(study.tasks||[]).map(item=>`<li><div><span class="lab-task-time">${durationLabel(item.minutes)}</span><b>${escapeHTML(item.title)}</b><p>${escapeHTML(item.instructions)}</p><small>DELIVERABLE · ${escapeHTML(item.output)}</small></div></li>`).join("")}</ol><div class="reader-artifact"><span>TAKE THIS WITH YOU</span><b>${escapeHTML(chapter.artifact)}</b></div></section>
        <section class="reader-checks"><p class="reader-overline">REVIEW · ${durationLabel(study.review||0)} · CLOSE YOUR NOTES FIRST</p><h2>Check your understanding</h2><p>Answer from memory, open the explanation, then review your artifact against the chapter outcomes. Write one next question for a user, system owner, or reviewer.</p>${(lesson.checks||[]).map(item=>`<details><summary>${escapeHTML(item.q)}</summary><p>${escapeHTML(item.a)}</p></details>`).join("")}</section>
        <div class="reader-completion"><div><p class="reader-overline">CHAPTER ${String(id).padStart(2,"0")} DELIVERABLE</p><b>${escapeHTML(chapter.artifact)}</b></div><button class="complete-button${completed.has(id)?" done":""}" data-reader-complete>${completed.has(id)?"✓ Chapter complete — mark as in progress":"Mark chapter complete"}</button></div>
        <nav class="reader-pager" aria-label="Chapter navigation">${previous?`<a href="?chapter=${previous.id}"><small>PREVIOUS · ${String(previous.id).padStart(2,"0")}</small><b>← ${escapeHTML(previous.title)}</b></a>`:`<a href="index.html#course-map"><small>COURSE MAP</small><b>← All chapters</b></a>`}${next?`<a class="reader-pager-next" href="?chapter=${next.id}"><small>NEXT · ${String(next.id).padStart(2,"0")}</small><b>${escapeHTML(next.title)} →</b></a>`:`<a class="reader-pager-next" href="index.html#capstone"><small>FINISH</small><b>Return to course map ↑</b></a>`}</nav>
      </article><aside class="reader-toc"><div><span>IN THIS CHAPTER</span><a href="#lesson-section-1">Learn the concept</a><a href="#reader-field-case">Field scenario</a><a href="#reader-code-title">Trace the code</a><a href="#lesson-section-3">Connect the pieces</a><a href="#reader-lab-anchor">Timed build lab</a><a href="#reader-check-anchor">Knowledge check</a><hr><span>COURSE PROGRESS</span><b>${completed.size} / ${chapters.length} complete</b><div class="reader-progress-track"><i style="width:${chapters.length?completed.size/chapters.length*100:0}%"></i></div><a class="toc-map-link" href="index.html#course-map">Back to course map ↗</a></div></aside></div>`;
    reader.querySelector(".reader-lab").id = "reader-lab-anchor";
    reader.querySelector(".reader-checks").id = "reader-check-anchor";
    const completeButton = reader.querySelector("[data-reader-complete]");
    completeButton.addEventListener("click", () => {
      if (completed.has(id)) completed.delete(id); else completed.add(id);
      try { localStorage.setItem(completedKey, JSON.stringify([...completed])); } catch (_) {}
      updateProgress();
      renderChapters(search.value);
      updateReaderCompletion(id);
    });
    const copyButton = reader.querySelector("[data-reader-copy]");
    if (copyButton && example) copyButton.addEventListener("click", async () => {
      const status = reader.querySelector(".copy-status");
      try { await navigator.clipboard.writeText(example.code); status.textContent = "Code copied."; }
      catch (_) { status.textContent = "Clipboard unavailable. Select the snippet to copy it."; }
    });
    updateProgress();
    window.scrollTo(0, 0);
  }

  renderNav();
  renderChapters();
  renderDetail(selectedId);
  updateProgress();

  if (chapters.some(chapter => chapter.id === requestedId)) renderReader(requestedId);

  search.addEventListener("input", () => renderChapters(search.value));
  document.addEventListener("keydown", event => {
    if (event.key === "/" && !["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) { event.preventDefault(); search.focus(); }
    if (event.key === "Escape" && document.activeElement === search) { search.value = ""; renderChapters(); search.blur(); }
  });
  document.getElementById("resume-button").addEventListener("click", () => {
    const firstOpen = chapters.find(chapter => !completed.has(chapter.id));
    window.location.href = `?chapter=${firstOpen ? firstOpen.id : 1}`;
  });
  document.querySelectorAll("[data-open-chapter]").forEach(link => link.href = `?chapter=${Number(link.dataset.openChapter)}`);
})();
