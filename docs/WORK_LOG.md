# Development checkpoints

## Milestone 1 — Playable foundation

PR #1 established a compact browser-based 3D foundation across eight scale-local arenas with feeding, combat, mutation, exposed-core encounters, save/resume, and a finite finale. It is not completion of the master brief.

## Milestone 2 — Arrival and living reef

The first two stages now support vertical swimming, height-aware interactions and a pitch-adjustable camera. The arrival has a short non-blocking meteor descent and opening, plus microscopic colonies; the reef has coral, kelp and a landmark arch. Breakable nutrient pods release food, early melee and ranged enemies commit to marked attacks, and guardians have a visible recovery opening. Traits add distinct persistent anatomy. An optional, save-persistent tutorial teaches early actions, and a non-blocking overlay signals scale changes. Older planar saves migrate to ground level.

The world still uses procedural stylized geometry; scenery is largely decorative, and movement in stages three through eight remains planar. This is a foundation under continued development, not a finished production-scale game. See the README for further limitations.

Verification: `npm run build` and `npm test`; sixteen automated tests include early-stage interaction, old-save migration, and input-driven complete routes on three seeds. Browser verification is described separately in the PR; simulation is not human playtesting.

## Proposed milestone 3 — The lightless reach and breaking surface

Build the deep ocean and surface stages into distinctive encounters. Add three-dimensional traversal and navigation to the deep, readable visibility and hazards, a distinctive leviathan encounter, and an approachable transition to the surface. Make human detection and response visible and action-linked, with avoidable warnings, a resolvable containment encounter, and meaningful coastal interactions. Preserve earlier traits, old saves and the path through later scales. Test the browser experience and the complete progression route.

## Continuation prompt

> Continue the Alien Evolution Roguelite from current `main` after milestone 2 is merged. Read `docs/MASTER_PROMPT.md`, `docs/WORK_LOG.md`, and the README. Implement milestone 3: deepen the deep-ocean and ocean/surface stages with three-dimensional deep-water traversal, readable hazards and a distinctive leviathan, then action-linked human observation, response and resolvable containment at the surface. Make the environments and interactions meaningfully distinct, carry existing traits and save state forward, and keep the route through all eight scales playable. Exercise the actual browser controls and relevant simulation logic, document evidence and remaining limitations, and open a separate PR targeting `main`. Update this log and provide a concrete prompt for the next milestone. Do not describe unfinished content as complete.

Browser checks in headless Chromium with software WebGL confirmed scene startup, feeding and the mutation screen from a controlled save, persistence of a selected trait, a prepared gate transition to the reef, and vertical movement after loading a save without height fields. No human playtest or physical controller test was performed; software rendering was very slow, and the full run was verified by simulation rather than in the browser.
