/**
 * Optional, non-blocking prompts. Tutorial flags live on the plain game state,
 * so the ordinary save mechanism preserves progress. All game actions remain
 * available regardless of the current prompt. Pass the input used for the
 * just-completed simulation update (and also call once when a save loads).
 */
const STEPS = [
  ['move', 'Move with WASD or the left stick. Your organism follows the direction you swim.'],
  ['depth', 'Swim up with R / RB and dive with F / RT. Food and threats can be above or below you.'],
  ['sense', 'Hold Tab or LB to sense nearby life and danger. Release it to explore unaided.'],
  ['feed', 'Approach small life and hold E or X to feed. Break glowing nutrient pods for more food. Biomass never drains over time.'],
  ['evade', 'Evade with Shift or B. When a threat shows its warning, move out of the marked area before it strikes.'],
  ['mutation', 'Keep feeding until an adaptation appears. Choose a trait: its effects and appearance travel with you.'],
  ['guardian', 'The Glassjaw guards the way. Evade its warning, then attack with Space or A during recovery for extra damage.'],
  ['transition', 'Gather the remaining biomass, then feed at the glowing opening to enter the reef.'],
];

function tutorialState(state) {
  if (!state.tutorial || state.tutorial.version !== 1) {
    state.tutorial = {version: 1, flags: {}, dismissed: false};
  }
  state.tutorial.flags ||= {};
  return state.tutorial;
}

/** Record observations and update the visible guide. Safe with older saves. */
export function updateTutorial(state, input = {}) {
  if (!state?.player) return;
  const tutorial = tutorialState(state), flags = tutorial.flags, p = state.player;
  if (Math.hypot(Number(input.x) || 0, Number(input.z) || 0) > .1) flags.move = true;
  if (Math.abs(Number(input.y) || 0) > .1) flags.depth = true;
  if (input.sense) flags.sense = true;
  if ((state.totalFed || 0) > 0) flags.feed = true;
  if (input.dodge && p.dodgeCooldown > 0) flags.evade = true;
  if ((p.traits || []).length > 0 || state.mutationTaken) flags.mutation = true;
  if (state.bossDefeated || state.stage > 0) flags.guardian = true;
  if (state.stage > 0) flags.transition = true;
  // Once the player has left the arrival, do not send them back to complete
  // tutorial actions they skipped. The field guide remains available.
  if (state.stage > 0) for (const [id] of STEPS) flags[id] = true;

  const panel = document.getElementById('tutorial');
  if (!panel) return;
  const index = STEPS.findIndex(([id]) => !flags[id]);
  const replay = !!tutorial.replay && index < 0;
  panel.hidden = tutorial.dismissed || (index < 0 && !replay);
  if (!panel.hidden) {
    const step = document.getElementById('tutorial-step');
    const copy = document.getElementById('tutorial-copy');
    const label = replay ? 'FIELD GUIDE' : `${String(index + 1).padStart(2, '0')} / ${STEPS.length}`;
    const tip = replay ? (state.stage === 1 ? 'In the reef, break nutrient pods for food. Dodge charging hunters and marked impacts; strike the sentinel during recovery.' : 'Feed on small life, evade warnings and strike during openings. The field guide has the full controls.') : STEPS[index][1];
    // Avoid repeatedly announcing unchanged text to assistive technology.
    if (step.textContent !== label) step.textContent = label;
    if (copy.textContent !== tip) copy.textContent = tip;
  }
}

export function dismissTutorial(state) {
  if (!state) return;
  tutorialState(state).dismissed = true;
  tutorialState(state).replay = false;
  const panel = document.getElementById('tutorial'); if (panel) panel.hidden = true;
}

export function showTutorial(state) {
  if (!state) return;
  const tutorial = tutorialState(state);
  tutorial.dismissed = false;
  // Completed journeys get a compact contextual reminder rather than being
  // asked to repeat actions from an earlier scale.
  tutorial.replay = STEPS.every(([id]) => tutorial.flags[id]) || state.stage > 0;
  updateTutorial(state);
}
