# Development checkpoints

## Milestone 1 — Playable foundation

A compact browser-based 3D foundation covers eight local-scale arenas, procedural creature and scenery, feeding, combat, mutation, exposed-core encounters, save/resume, and a finite finale. This is an early implementation, not completion of the master brief. The 3D view currently uses planar movement; areas and encounters share substantial systems. See the README for controls and limitations.

Verification: `npm run build`; `npm test` (seven tests, including simulated routes for three seeds). Browser smoke testing is separately reported in the PR. Simulated tests are not human playtesting.

## Proposed next milestone — The arrival and living reef

After this milestone is merged to main, build the microscopic-to-coastal journey into a genuinely distinctive, playable first experience. Add a meteor arrival, three-dimensional navigation and camera controls, richer environmental interaction and distinct predator patterns, a legible tutorial, meaningful mutation appearance and behavior, and a polished transition. Preserve the existing eight-stage route and save compatibility where practical. Validate actual browser controls and playability; update documentation and open a separate PR. Treat later scales as works in progress, not finished production content.

## Continuation prompt

> Continue the Alien Evolution Roguelite in this repository from current `main`. Read `docs/MASTER_PROMPT.md`, `docs/WORK_LOG.md`, and the README first. The first milestone established a compact eight-scale playable foundation; it does not satisfy the complete production brief. Implement the next major milestone: turn the microscopic arrival and coastal reef into a distinctive, polished playable journey with a meteor arrival, three-dimensional movement and camera, readable tutorials and predator counterplay, environmental interaction, meaningful visible and mechanical evolution, and a smooth scale transition. Preserve the working later-stage route and save compatibility where feasible. Test the actual browser experience as well as the relevant simulation logic, document evidence and limitations honestly, and create a PR targeting `main` when the milestone is ready. Update this work log and provide a concrete prompt for the next milestone. Continue in major steps with a PR after each one; do not describe unfinished content as complete.

Browser smoke test in headless Chromium with software WebGL: startup, rendering, movement, pause, save, reload, and Continue worked with no uncaught JavaScript exceptions. Feeding and the mutation interface were not verified in that browser run because rendering was extremely slow; they were exercised by simulation tests. No human playtest or physical controller test was performed.
