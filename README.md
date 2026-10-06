# FDE Field Guide

A self-contained, project-led 20-chapter curriculum for Forward Deployed Engineering, from understanding a customer workflow to delivering, operating, and measuring an AI-enabled solution.

**Live site:** [FDE Field Guide](https://asresh.github.io/fde-curriculum/)

## Open the site

Open `index.html` in a modern browser. The site is static: it needs no account, build step, API key, or backend. Chapter completion is saved in the browser.

## Course map

| Phase | Chapters | Focus |
| --- | ---: | --- |
| FDE foundations | 1–5 | Role, software engineering, service boundaries, delivery habits, discovery |
| Customer systems | 6–10 | Workflow mapping, scope, data, integrations, a thin-slice demo |
| Applied AI | 11–15 | Model choices, retrieval, bounded agents, evaluation, security |
| Production + impact | 16–20 | Deployment, operations, adoption, value proof, capstone |

Each chapter opens as a dedicated study page whose timed activities add up to the estimate in the course map. A session includes concept reading and notes, a code trace with a small change, a realistic field scenario, a timed build lab with concrete deliverables, and a review. The examples cover service boundaries, SQL, integrations, retrieval, evaluation, authorization, deployment, observability, and human approval. The capstone is a five-hour sequence of discovery, design, implementation, evaluation, and handoff work. Use synthetic information for practice; use real customer data only with explicit authorization.

## Field method

Carry one workflow from the first chapter to the capstone:

1. Understand the people, process, systems, exceptions, and measurable outcome.
2. Deliver one bounded, usable slice with clear data and human-control boundaries.
3. Record the evidence, limitations, operational owner, and next decision.

## Files

- `index.html` — course overview and chapter reader shell
- `styles.css` — responsive visual design
- `curriculum.js` — all 20 original chapter briefs
- `chapter-examples.js` — 20 original, annotated code examples
- `chapter-lessons.js` — original lesson sections, workflow models, exercises, and knowledge checks for all chapters
- `chapter-study.js` — chapter-specific scenarios, code tasks, timed lab tasks, and deliverables
- `app.js` — chapter routing, search, progress tracking, timed study plans, and page rendering

## License

MIT. Copyright © 2026 Asresh. See [LICENSE](LICENSE).
