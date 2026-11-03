import test from 'node:test';
import assert from 'node:assert/strict';
import { updateTutorial, dismissTutorial, showTutorial } from '../src/tutorial.js';

function fakeDocument(t) {
  const previous = globalThis.document;
  const elements = Object.fromEntries(['tutorial', 'tutorial-step', 'tutorial-copy']
    .map(id => [id, { hidden: false, textContent: '' }]));
  globalThis.document = { getElementById: id => elements[id] ?? null };
  t.after(() => { globalThis.document = previous; });
  return elements;
}
function state() {
  return {stage: 0, totalFed: 0, player: {traits: [], dodgeCooldown: 0}};
}

test('tutorial records actions in any order without gating game state', t => {
  const elements = fakeDocument(t);
  const s = state();
  updateTutorial(s, {sense: true});
  assert.match(elements['tutorial-copy'].textContent, /WASD/);
  assert.equal(s.tutorial.flags.sense, true);
  assert.equal(s.stage, 0);
  updateTutorial(s, {x: 1});
  assert.match(elements['tutorial-copy'].textContent, /R \/ RB/);
  updateTutorial(s, {y: 1});
  assert.match(elements['tutorial-copy'].textContent, /feed/i);
  assert.equal(s.totalFed, 0);
});

test('dismissal is optional and survives a save round-trip', t => {
  const elements = fakeDocument(t);
  const s = state();
  updateTutorial(s, {x: 1});
  dismissTutorial(s);
  assert.equal(elements.tutorial.hidden, true);
  const loaded = JSON.parse(JSON.stringify(s));
  updateTutorial(loaded, {y: 1});
  assert.equal(elements.tutorial.hidden, true);
  assert.equal(loaded.tutorial.flags.move, true);
  assert.equal(loaded.tutorial.flags.depth, true);
  showTutorial(loaded);
  assert.equal(elements.tutorial.hidden, false);
  assert.match(elements['tutorial-copy'].textContent, /sense/i);
});

test('old saves and late-stage replay do not require first-stage steps', t => {
  const elements = fakeDocument(t);
  const s = {...state(), stage: 1};
  updateTutorial(s);
  assert.equal(elements.tutorial.hidden, true);
  showTutorial(s);
  assert.equal(elements.tutorial.hidden, false);
  assert.match(elements['tutorial-copy'].textContent, /reef/i);
  dismissTutorial(s);
  assert.equal(elements.tutorial.hidden, true);
  s.stage = 4;
  showTutorial(s);
  assert.match(elements['tutorial-copy'].textContent, /field guide/i);
});
