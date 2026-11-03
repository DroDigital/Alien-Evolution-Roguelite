# ORIGIN: THE FEAST

A code-first browser game about an alien organism growing from microscopic prey into a cosmic predator. This is a working title, not a cleared commercial name.

## Run locally

Requires Node.js and npm for development and build. From this directory:

```sh
npm install
npm run dev
```

Open the local address printed by the development server in a WebGL-capable browser. To produce static files and serve the production build:

```sh
npm run build
npm run preview
```

The production build and its locally bundled dependencies do not require an editor or a network connection after they have been installed. The game periodically saves the current run in browser local storage, also saving on pause and page exit when available. Continue uses the same browser and origin; clearing site data removes saves and records. See [ASSETS.md](ASSETS.md) for the asset inventory and third-party credit.

## Controls

| Action | Keyboard |
| --- | --- |
| Move | W A S D |
| Rise / dive (first two scales) | R / F |
| Attack | Space |
| Feed / interact | E |
| Evade | Shift |
| Ability | Q |
| Sense | Tab |
| Pause | Escape |
| Look around | Drag on the game view |
| Show / hide journey tips | H |

Gamepad: left stick moves, right stick rotates the camera, A attacks, X feeds, B evades, Y uses the pulse, left bumper senses, right bumper rises, right trigger dives, and Start pauses. In menus, use the D-pad and A. A physical controller has not been tested.

## Scope and limitations

This is a compact, stylized procedural interpretation of the supplied brief, not a production-scale photorealistic game. Stages are arena-like local representations with shared gameplay systems, not detailed simulated ecosystems or seamless physical-scale worlds. The first two stages support vertical swimming; later stages use planar movement viewed in 3D. Earth and the universe are represented by encounters and feeding objectives rather than simulations of their individual structures. The alert message is a small action-linked cue, not a fully simulated regional response system. There is no control remapping, detailed discovery archive, or accelerated early-run mode. No 90–150-minute balance target or human playtest has been established.

Gamepad movement and actions are implemented, along with basic menu navigation (D-pad and A); controller support has not been verified on physical hardware. The procedural visual style and basic generated audio do not meet the brief's photorealistic art and layered sound ambitions. Tested platforms and other verification are limited to those reported with the build.

## How to play

Move through each area and feed on the two types of nearby matter. Feeding fills the biomass bar; halfway to the stage goal you choose a mutation. Defeat the stage's larger enemy and reach the biomass goal to reveal the way onward, then approach it and feed. In the final area, keep feeding on the exposed universe to finish. Attacks and evasion have short cooldowns; nothing drains merely because time passes.

In the first two scales, break glowing nutrient pods to release food, evade a hunter’s marked strike, and attack guardians during their bright recovery window. The selected mutations change the creature’s anatomy and persist across scales. The optional unstable organ adds instability; reaching its limit starts an encounter in which the exposed core must be protected while its manifestations are destroyed. Later bosses can also initiate containment: destroy the three anchors to break free. Depleting health or exposed core integrity ends the run.

The areas use a small local coordinate system while the creature's growth and traits persist between them. This makes the extreme changes of scale playable without claiming a physically continuous simulation.
