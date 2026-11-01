# Master Prompt: Build a 3D Alien Evolution Roguelite

## The assignment

Design and build a complete, playable, visually ambitious 3D single-player action roguelite. The player begins as a microscopic alien organism inside a meteor that crash-lands in Earth's ocean. By hunting, feeding, adapting, and surviving, the same organism grows through the food chain until it can consume the entire universe.

The game should deliver one clear fantasy:

**Start as prey that can barely be seen. End as an impossibly vast predator that makes the universe fight for its life.**

The journey must be playable from the first microscopic encounter through the final act of devouring the universe. Make the transformations spectacular, the basic actions satisfying, and the creature recognizably the same evolving life form throughout.

Act as the game's creative director, designer, programmer, technical artist, audio designer, and QA team. Make reasonable decisions independently. Use milestones to manage the work, but build the actual game; a game design document, prototype, collection of scenes, or impressive opening alone is not the final deliverable.

Use original characters, creatures, worldbuilding, visual designs, names, audio, and assets or properly licensed material. If choosing a title, research potential conflicts before treating it as final.

---

## 1. Design pillars

Every major decision should reinforce these pillars:

1. **The pleasure of growth.** Food, defeated enemies, new body parts, and changes in scale produce visible, mechanical rewards.
2. **One creature, many scales.** This is one alien organism's journey, not a series of unrelated protagonists or genres.
3. **You are what you eat.** Encounters with different forms of life and matter influence the evolutionary options and traits available to the player.
4. **The world responds.** Natural predators, human defenders, and cosmic forces react to the threat as it becomes visible to them.
5. **A rewarding roguelite.** Runs offer different routes, builds, and encounters; setbacks also produce discoveries and unlocks that make future attempts interesting.
6. **Pressure when it is fun.** Combat and major encounters can be intense. Exploration, feeding, experimentation, and recovery should remain enjoyable and unhurried.

The intended tone is awe, discovery, escalating power, and a touch of cosmic horror. The player is not a conventional human hero. Let the alien feel strange and fascinating without making the game visually confusing or needlessly complicated.

---

## 2. The player's experience

### Camera and controls

Use a fully 3D perspective that makes the organism and its surroundings understandable. Default to a responsive third-person follow camera with player-controlled looking and sensible automatic framing. Adjust the camera smoothly as the creature and its surroundings change scale.

Provide intuitive movement through water, across or above surfaces, and through space. Preserve familiar controls between stages; introduce any new movement capability through a short playable moment. Avoid requiring constant disorienting six-axis maneuvers. Let the player adjust camera sensitivity and relevant movement assists.

Support keyboard and mouse and controller throughout the playable experience, including menus. Provide remapping, or clearly report any supported input that cannot be remapped. Do not make an essential action depend on a controller-only or mouse-only interaction.

### Core verbs

Build the game around a small set of consistent, satisfying actions:

- **Move and explore:** Swim, maneuver, breach, glide, or fly as appropriate to the body and environment.
- **Attack:** Use an immediate primary attack and unlock distinctive active abilities.
- **Evade or defend:** Give the player a responsive way to avoid or mitigate a telegraphed threat.
- **Feed:** Consume suitable prey or matter to gain biomass and access evolution.
- **Evolve:** Choose new traits that affect abilities, appearance, or both.
- **Sense:** Provide an optional, readable way to identify nearby prey, threats, objectives, and notable opportunities without replacing visual exploration.

Use context-sensitive interactions where they reduce unnecessary button complexity. Convey reach, impact, damage, feeding, and growth through animation, sound, camera work, and clear effects. Do not take control away from the player for every minor meal.

### The basic loop

Explore → identify prey or an opportunity → hunt or consume → grow → choose an evolution → encounter new resistance → overcome a major objective → reach a new scale.

Make this loop enjoyable within the first few minutes and deepen it as the player progresses. There should be regular moments of discovery or meaningful progress, but no obligation to rush.

**Do not add hunger, thirst, oxygen, decay, lifespan, or any other survival meter that drains just because time passes.** Food is a source of growth and evolution, not a constant chore. Short, clearly explained combat ability cooldowns are acceptable.

---

## 3. Food, growth, and scale

### A clear food chain

Communicate whether something is edible, dangerous, or currently too large through silhouette, behavior, contextual cues, and optional UI. Use relative size and condition consistently:

- The player can quickly consume sufficiently small or weakened targets.
- Comparable targets can fight back and may need to be defeated or stunned first.
- Much larger threats are dangerous but have readable behavior and viable escape routes.
- Objects that cannot yet be consumed communicate what changed when they become edible.

Avoid making every target a damage sponge. Eating a large amount of small prey should feel different from defeating and consuming a major predator, ship, planet, or star.

### Progress without busywork

Feeding grants biomass toward growth. Reaching growth milestones offers evolution choices and moves the player toward the next major scale. Avoid making the same biomass serve as an obscure spending currency that can accidentally prevent progression.

Make food sources abundant enough that a fair route always exists. Provide alternative sources for important evolution categories; never require one rare randomly spawned organism to complete a run. Permit the ecosystem to replenish where needed, without spawning endless forced combat.

Use visual comparison—previously dangerous prey becoming small, a former obstacle fitting in the creature's jaws, or a shoreline receding beneath it—to make growth emotionally clear.

### What carries forward

Keep the creature's identity, earned traits, health state, chosen abilities, run seed, and relevant world state consistent through transitions. Earlier adaptations should remain useful or evolve into scale-appropriate equivalents. A favorite ability must not quietly disappear because the player entered a different stage.

---

## 4. A complete journey through eight scales

Use the following as the minimum progression framework. Refine names and exact content where a better implementation serves the fantasy. Every stage must be playable, have its own primary environment and interactions, and provide a clear route onward.

### I. Microscopic ocean — the arrival

The meteor opens in the water and the player emerges as a vulnerable organism. Navigate a detailed microscopic environment, consume simple life, avoid larger predators, and choose the first body-changing mutation.

Teach movement, sensing, feeding, evasion, and evolution through a short interactive sequence. The first major encounter should demonstrate that even a much larger organism can be overcome through observation and the right opening.

**Scale fantasy:** A drop of ocean is an entire dangerous world.

### II. Small aquatic life — a new food chain

Enter a living coastal ecosystem with reefs, vegetation, small prey, and larger marine hunters. Use three-dimensional terrain for hiding, ambushing, and maneuvering. Feeding should shift from absorbing tiny organisms to pursuing and consuming recognizable aquatic life.

**Scale fantasy:** What was once an immense obstacle is now a place the creature can navigate.

### III. The deep ocean — becoming an apex predator

Explore dark water, deep-sea structures, luminous life, and threatening predators. Visibility and sound should create atmosphere while keeping enemies and attacks readable. Introduce a major deep-sea creature with a distinctive attack pattern or body part the player can exploit.

**Scale fantasy:** The creature becomes the monster that other life avoids.

### IV. Ocean and surface domination — humanity takes notice

Grow into a leviathan capable of breaching the surface and affecting coastlines. Human observations lead to boats, aircraft, sonar, specialized hunters, and containment attempts as the player makes its presence known.

Let the player interact meaningfully with both ocean and coastal or land environments. Provide traversal that suits the creature's build rather than forcing it into a humanoid form.

**Scale fantasy:** The player can see the consequences of its existence from the perspective of an inhabited world.

### V. Planetary — consuming Earth

Transition through atmospheric and orbital perspectives. Let the player attack and consume major regions, structures, and ultimately the planet itself while facing organized planetary defenses.

Make Earth's destruction a multi-step playable event with visible physical consequences. The player should actively break through resistance and feed, not simply press a button and watch the planet disappear.

**Scale fantasy:** The world that once contained the creature becomes its prey.

### VI. Stellar — feeding on worlds and stars

Travel through a stylized but convincing solar-system-scale environment. Consume planets and other celestial matter, overcome orbital defenses or other appropriate threats, and work toward feeding on a star.

Make movement and target selection immediate enough to remain fun; do not simulate empty travel at literal real-world distances.

**Scale fantasy:** Planetary bodies become objects the player can actively hunt and consume.

### VII. Galactic — a cosmic predator

Expand from individual celestial bodies toward systems and larger galactic structures. Introduce original cosmic life, advanced defenses, and coordinated resistance where appropriate.

Let the player actively traverse and consume meaningful representative systems, then grow into an entity capable of consuming galactic structures. Keep the creature and its chosen abilities visible and relevant.

**Scale fantasy:** The player is no longer visiting a galaxy; it is becoming large enough to eat one.

### VIII. Universal — the final feast

Travel through a readable representation of the cosmic web. Defeat the final resistance, break open the remaining structures that hold the universe together, and actively absorb the universe itself.

The finale must combine playable feeding, movement, and confrontation. Use a finite, understandable representation and visually communicate the consumption of the remaining universe rather than requiring the player to individually click an astronomical number of stars.

**Scale fantasy:** The creature consumes the entirety of the universe, not merely a final planet, galaxy, boss, or menu objective.

### Stage completeness

Each stage must include, at minimum:

- A distinct environment with an actual route to explore.
- At least two meaningfully different types of prey or consumable matter.
- Appropriate resistance, with at least two distinguishable behaviors or threats.
- An environmental interaction or traversal challenge appropriate to its scale.
- A distinctive major encounter and a clear, achievable transition objective.
- Growth and evolution that retain the player's existing creature identity.

These are minimums, not substitutes for depth. Reusing underlying systems is encouraged, but simply changing sizes, colors, or backgrounds is not a meaningful new stage.

---

## 5. Evolution: become what you consume

Use an understandable mutation system that links the player's encounters to its build.

Different prey and matter should influence the categories of traits offered, while still allowing multiple ways to obtain each essential role. At evolution milestones, present a small set of choices with clear effects:

- At least one useful, safe option.
- At least one option relevant to the player's current build or recent feeding.
- A varied additional option that can introduce a new direction, including an optional unstable mutation where appropriate.

Do not offer only risky mutations, dead choices, or choices that make a viable run depend on a specific random drop.

Mutations should change the creature's appearance and play. Preserve consistent visual anchors—such as its core, movement style, or characteristic anatomy—so it remains one identifiable organism.

Support several compatible approaches rather than fixed classes:

- **Ambush:** Speed, stealth, precision, or burst damage.
- **Armored:** Durable plating, resistance, and close-range impact.
- **Adaptive:** Recovery, absorption, and flexible responses.
- **Controller:** Tendrils, displacement, slowing, and area control.
- **Volatile:** Optional high-risk transformations with powerful effects.
- **Cosmic:** Scale-appropriate manipulation of gravity, energy, or space.

Examples of how evolution should carry across scales:

- An early armored trait can become broad protective plates that later scatter planetary defense beams.
- A bioluminescent lure can attract small prey early, then develop into an energy pulse that disrupts cosmic defenses.
- A risky energy organ can offer a powerful feeding or combat ability while increasing visible genetic instability.

These examples demonstrate continuity; create original, balanced implementations. Limit equipped active abilities to a manageable number, while making passive traits and synergies clear. Allow sensible adjustments at safe evolution points without forcing the player to manage an inventory constantly.

---

## 6. Predators and a reactive world

The world's resistance should change because of what the creature does and who can plausibly detect it:

- **Microscopic:** Natural predators and biological defenses; humanity does not magically know the organism exists.
- **Aquatic:** Larger wildlife and environmental dangers.
- **Leviathan:** Human observation and escalating attempts to investigate, hunt, or contain the creature.
- **Planetary and beyond:** Large-scale defenses, original cosmic predators, and other forces capable of responding at those scales.

Use a small, readable response system. For example, a region can move through stages such as unaware, investigating, mobilizing, and major confrontation. Explain what caused the change and what kinds of resistance it can produce.

Escalation should be linked to meaningful visible actions and milestones. It must not rise simply because the player explores, pauses, or takes a long time. A call for reinforcements, sonar sweep, or containment deployment should be communicated before it becomes dangerous.

Give the player ways to respond: escape the area, break line of sight, disable a response source, defeat a hunter, or engage the confrontation. Combat pressure should settle after a situation is resolved. Do not generate unavoidable infinite pursuit or spawn defenders directly on top of the player.

As the creature grows, let it feel powerful against former threats. New resistance should introduce different behaviors and counterplay, not just multiply enemy health and damage.

---

## 7. Clear and fair run-ending conditions

The game must consistently communicate why a run can end. Use these three related systems:

### A. Health reaches zero

Predators, defenses, and clearly signaled environmental hazards can damage the organism. A run ends when its health reaches zero. Attacks need readable cues, reasonable reactions, and a way to evade or mitigate them.

### B. The exposed core is destroyed during a containment encounter

Certain clearly telegraphed attacks or structures can trap the player and expose its core. This begins a playable breakout encounter with a visible core-integrity indicator.

The player can escape by interacting with or destroying containment mechanisms, defeating the relevant attackers, or another clearly signaled means. The run ends only if the creature's health reaches zero or the exposed core's integrity reaches zero. Capture alone is not an instant defeat.

Avoid unavoidable traps, repeated chain captures, unannounced core damage, and mandatory button-mashing. Provide an accessible hold or toggle option for repeated interactions.

### C. A voluntary unstable mutation leads to failed stabilization

Some optional mutations grant exceptional power and add a clearly displayed amount of genetic instability. Instability does not rise from the passage of time, ordinary growth, or normal feeding. Any special hazard that can increase it must be clearly marked.

The player can choose safe mutations and find accessible opportunities to reduce instability. Before selecting a mutation that reaches the limit, show the resulting consequence.

Reaching the limit starts a playable stabilization encounter. The player must protect the exposed core while overcoming the unstable manifestation or completing a clear combat objective. The encounter succeeds when its objective is met; the organism stabilizes to a safe level and the run continues. The encounter fails if health or core integrity reaches zero.

No unavoidable countdown is required. A run should never end from a hidden threshold, an unexplained mutation roll, a failure to eat frequently, or passive passage of time.

---

## 8. Roguelite structure and replay value

Every new run begins with the microscopic organism arriving on Earth. Vary the journey through:

- Curated layouts and alternate routes within each scale.
- Different combinations of prey, environments, predators, and defenses.
- Seeded, balanced evolution options and meaningful synergies.
- Boss or encounter variations with readable differences.
- Rare discoveries and optional high-reward risks.
- Changes in how the world responds to the player's actions.

Combine authored areas and encounters with constrained procedural generation. Use reachability checks and fallback choices to ensure a run always has a valid route through all required stages. Randomness should create interesting decisions, not unwinnable builds.

After victory or death, show a concise run summary: creature form, highest scale reached, major discoveries, notable mutations, and a clear cause of death or victory.

Retain permanent discoveries and unlocks, such as new mutation possibilities, modest starting options, cosmetics, and an evolving creature or discovery record. Permanent bonuses should be bounded so that skill and build decisions remain important.

### Make long runs respectful of the player's time

Support reliable save, quit, and resume throughout a run. A crash or normal exit should not silently erase progress.

Because later-stage defeat can be costly, let players who have reached milestones optionally accelerate previously experienced early growth on later runs. They still begin microscopic and play through the stages, but need less repetitive feeding. Make this a choice, not a forced shortcut, and preserve a full standard run for anyone who wants it.

Target a substantial but replayable complete run. Use approximately 90–150 minutes for an experienced player as an initial tuning hypothesis, then adjust based on actual playtesting. New players may take longer. Do not pad the game with repetitive feeding to hit a number, and allow the run to be enjoyed across multiple sessions.

---

## 9. Story and identity

Build a distinctive, original identity around the creature and the world's response.

Suggested direction: the meteor carried a dormant organism from an unknown cosmic ecology. As it grows, the player discovers signs that the universe has defenses resembling an immense immune system. The final encounter suggests that the creature's appetite is part of a much larger, unsettling life cycle.

Use this as a creative foundation, not an excuse for long exposition or a fixed imitation of another work. Communicate the mystery through environments, creature behavior, discoveries, human reactions, and a few memorable encounters. Keep dialogue and cutscenes skippable, and preserve player control whenever possible.

The player should feel like an evolving alien organism throughout—not a conventional spaceship, a sequence of unrelated animals, or a human protagonist in disguise.

---

## 10. Presentation and art direction

Aim for highly detailed, photorealistic or convincingly photorealistic 3D presentation within the available hardware and production constraints. Use plausible materials and natural lighting as the visual foundation, then apply controlled speculative design for the alien and later cosmic phenomena.

Give each scale a distinctive visual language while maintaining one coherent game:

- **Microscopic:** Translucent membranes, tiny suspended particles, fluid motion, and macro-photography-inspired lighting.
- **Coastal ocean:** Rich marine habitats, convincing water, sunlight, depth, and recognizable environmental scale cues.
- **Deep sea:** Darkness, restrained bioluminescence, atmospheric depth, and readable silhouettes.
- **Surface and Earth:** Ocean scale, weather, human structures, and destructive impacts.
- **Space and beyond:** Strong celestial scale cues, stellar materials, dramatic lighting, and a readable cosmic web.

Use physically based materials, suitable lighting and shadow techniques, convincing animation, and restrained effects. Integrate sourced assets into a unified art direction instead of mixing visibly incompatible styles.

Animate the creature's anatomy with a combination of appropriate imported animation, skeletal or morph-target animation, procedural motion, and secondary movement as feasible. Mutation attachments and scale transitions should avoid obvious seams or abrupt pops.

Combat information must remain legible against detailed backgrounds. Provide options for motion blur, camera shake, screen effects, field of view, contrast, and text size where appropriate.

---

## 11. Audio, feedback, and accessibility

Develop a layered soundscape that evolves with scale: fluid movement and microscopic feeding, marine ambience, the weight of a leviathan, planetary destruction, and cosmic phenomena.

Give attacks, evasion, damage, feeding, growth, mutation, boss phases, and transformations distinct audio and visual feedback. Support player-controlled audio levels and captions for important nonverbal cues where feasible.

Use adaptive music or sound design to distinguish exploration, combat, discovery, and major transformation. The player should be able to pause and enjoy the game without being pushed by incessant alarm sounds.

Include readable UI, scalable text, remappable controls where supported, color-independent threat cues, adjustable camera sensitivity, reduced screen shake and motion blur, and appropriate difficulty or assist options. Important information should not depend exclusively on color, sound, or rapid repeated button presses.

---

## 12. Code-first technology and scale architecture

The game must be built through code. Choose the language, graphics API, rendering approach, and supporting libraries based on the available environment and the game's needs.

- Do not depend on Unity, Unreal, Godot, or another editor-driven game engine.
- Code-first graphics, rendering, physics, audio, animation, input, UI, and asset-processing libraries are allowed.
- Sourced textures, models, shaders, sound, and animation are allowed as data used by the code.
- The finished game must not require the player to install a game engine or editor.
- Choose a practical initial platform for the available environment. Aim for Windows and macOS where feasible; report which platforms were actually built and tested.
- The ordinary game should work offline after installation, including access to required assets.

### Represent extreme scales honestly

Do not attempt to simulate every cell, real-world planet, star, and galaxy at literal physical scale. Build a convincing, playable representation using techniques suited to the chosen stack, such as local coordinate spaces, floating origins, scale-relative units, streaming, and distinct simulation regions.

Separate symbolic progression—stage, growth, unlocked traits, and world history—from local rendering and physics coordinates. Preserve these through transitions. Design collision, movement, camera clipping, lighting, and targeting to remain stable at each scale.

Use polished transitions when representations change. Loading, abstraction, and camera reframing are acceptable; do not falsely claim literal seamlessness or full-universe simulation.

### Asset and rendering pipeline

Use an interoperable, documented asset format appropriate to the stack. For example, consider glTF where its material, animation, and model support fit the chosen renderer; verify actual importer support rather than assuming every extension works.

Support suitable material maps, skeletal or morph animation, texture compression or resolution tiers, level of detail, and efficient asset loading where available. Profile the actual target system and choose realistic quality presets. Do not claim photorealism, frame rates, hardware compatibility, or platform support that was not observed.

---

## 13. Asset research and rights

Search the web, when available, for high-quality resources that can improve the actual game, including models, animations, physically based textures, materials, HDRIs, shaders, sound effects, music, and visual effects.

Evaluate each resource for technical fit and rights before including it. Maintain a machine-readable or easily inspected asset manifest with:

- Asset title and source URL.
- Creator or publisher.
- License and attribution requirements.
- Whether redistribution and the intended commercial use are allowed.
- Any relevant modifications or usage restrictions.

Prefer original or clearly permissive assets. Do not assume that an item is reusable just because it appears in an image search or can be downloaded. Check model, texture, shader, sound, and music licenses individually. Do not use recognizable characters or assets copied from another game.

Useful starting points to investigate include Poly Haven for models, materials, and HDRIs, and Freesound for individual sounds. Licenses differ between some sound uploads; check each item. Confirm the current terms and access before use.

Create original procedural or code-driven alternatives when suitable resources are unavailable. If network access or a required tool is missing, state the limitation and continue with the best valid resources available. Do not silently treat missing assets or placeholder primitives as final-quality content.

---

## 14. Production approach

1. **Inspect the environment:** Determine available tooling, target hardware, permissions, network access, and delivery constraints.
2. **Design the technical foundation:** Select the stack, asset pipeline, scale representation, controls, and save strategy. Explain key choices briefly.
3. **Prove the core loop:** Build and test a genuinely enjoyable microscopic-to-aquatic slice with movement, feeding, an enemy, evolution, a stage transition, and a save.
4. **Build the full arc:** Extend the same working foundation through all eight scales, the reactive world, mutation instability, major encounters, and the universe-consuming victory.
5. **Integrate and polish:** Improve gameplay, art consistency, audio, accessibility, performance, balance, and procedural variety across the whole game.
6. **Validate and package:** Exercise the full route, fix demonstrated issues, document credits, and produce runnable artifacts for the available environment.

Keep the game runnable as development proceeds. Use checkpoints and a concise work log so work can continue after interruptions. Do not stop after the first vertical slice or present a roadmap as a completed game.

If a real environmental or tool limitation blocks a specific part, do as much independent work as possible, explain the blocker and its impact, and accurately identify what remains.

---

## 15. Quality assurance and completion criteria

Test the actual executable or runnable application. Use unit or integration tests for important logic where useful, and play or directly exercise the game for behavior that requires visual, audio, or control verification.

At minimum, verify:

1. A fresh run starts with the meteor and microscopic organism.
2. Movement, camera, targeting, feeding, damage, evolution, and basic controls work.
3. Safe choices remain available, mutation effects are clear, and a build remains viable.
4. Each stage contains its required interactions, encounter, and route to the next stage.
5. Growth, appearance, abilities, health, and relevant world state survive every transition.
6. Escalation responds to actions and resolves without permanent unavoidable pursuit.
7. Health death, containment escape and failure, and unstable-mutation stabilization and failure behave as described.
8. The player can save, quit, resume, die, retain appropriate unlocks, and start another run.
9. Multiple generated seeds provide a reachable path and do not require a missing rare resource.
10. Normal gameplay provides a real route from the beginning to actively consuming the universe and receiving a victory summary.
11. Essential assets load offline, controls and menus work on supported input devices, and no critical progression path depends on placeholders.
12. Record actual visual, platform, performance, and playtest evidence for the environment available.

Debug shortcuts and test harnesses may help reach later stages, but they do not replace checking the actual progression path. Automated or simulated results must be labeled as such; do not imply human playtesting if it did not happen.

Deliver the source code, necessary licensed assets, runnable build when possible, build and launch instructions, controls, configuration, asset credits and licenses, test evidence, and an honest list of remaining limitations. Do not call unfinished content, missing assets, an untested build, or a single vertical slice a complete game.

---

## Reference starting points

Use these as research references rather than sources to copy. Verify current documentation and per-asset rights during development:

- Spore's official description of its distinct evolutionary stages: https://www.spore.com/what/spore
- Maneater's official description of feeding, evolution, and escalating hunters: https://www.thqnordicmobile.com/en/games/maneater/
- Khronos glTF 2.0 specification: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
- Poly Haven asset license: https://polyhaven.com/license
- Freesound license FAQ: https://freesound.org/help/faq/
- Xbox accessibility guidance on camera and motion settings: https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/117

## Final direction

Make the creature's journey feel like a continuous escalation of discovery and power: from a tiny alien in Earth's ocean, to the world's most terrifying predator, to a cosmic life form that actively consumes the entire universe.

**Make every major transformation playable, every risk understandable, every run worth remembering, and every claim about the finished game verifiable.**
