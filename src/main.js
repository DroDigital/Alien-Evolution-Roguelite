import './style.css';
import { Game, STAGES } from './game.js';
import { Renderer } from './render.js';
import { updateTutorial, dismissTutorial, showTutorial } from './tutorial.js';

const $ = id => document.getElementById(id);
const SAVE_KEY = 'origin-feast-save-v1';
const RECORD_KEY = 'origin-feast-record-v1';
let game, renderer, paused = true, started = false, last = 0, saveClock = 0, audioContext;
let pointerDown = false, lastPointerX = 0, lastPointerY = 0, toastTimer, previousPadButtons = [];
let lastSound = 0, transitionTimer;
const keys = new Set();
const overlays = ['start-screen','mutation-screen','pause-screen','end-screen'];
const show = id => { for (const name of overlays) $(name).hidden = name !== id; };
const hideOverlays = () => overlays.forEach(id => $(id).hidden = true);
const readSave = () => { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; } };
function save() {
  if (!game || ['dead','victory'].includes(game.state.mode)) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(game.state)); } catch { toast('Saving is unavailable in this browser.'); }
}
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch {} }
function toast(message) {
  const node = $('toast'); node.textContent = message; node.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => node.hidden = true, 4400);
}
function sound(kind) {
  const volume = Number($('audio-volume')?.value ?? 70) / 100;
  if (!volume) return;
  try {
    audioContext ||= new AudioContext();
    if (audioContext.state === 'suspended') audioContext.resume();
    const oscillator = audioContext.createOscillator(), gain = audioContext.createGain(), now = audioContext.currentTime;
    const frequencies = {feed: 400, attack: 120, damage: 75, stage: 330, mutation: 500, victory: 440};
    oscillator.type = kind === 'damage' ? 'sawtooth' : 'sine';
    oscillator.frequency.setValueAtTime(frequencies[kind] || 220, now);
    oscillator.frequency.exponentialRampToValueAtTime((frequencies[kind] || 220) * (kind === 'damage' ? .6 : 1.45), now + .16);
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.05 * volume, now + .025); gain.gain.exponentialRampToValueAtTime(.0001, now + .22);
    oscillator.connect(gain).connect(audioContext.destination); oscillator.start(now); oscillator.stop(now + .23);
  } catch { /* Audio is optional; all cues also have visual counterparts. */ }
}
function updateRecord() {
  try {
    const record = JSON.parse(localStorage.getItem(RECORD_KEY) || '{}');
    record.highest = Math.max(record.highest || 0, game.state.stage + 1);
    record.runs = (record.runs || 0) + 1;
    if (game.state.mode === 'victory') record.victories = (record.victories || 0) + 1;
    localStorage.setItem(RECORD_KEY, JSON.stringify(record));
  } catch {}
}
function presentMutations(options) {
  const container = $('mutation-options'); container.replaceChildren();
  for (const option of options || []) {
    const button = document.createElement('button'); button.className = 'mutation-card';
    const title = document.createElement('strong'); title.textContent = option.name;
    const desc = document.createElement('span'); desc.textContent = option.description;
    button.append(title, desc); button.addEventListener('click', () => {
      game.chooseMutation(option.id); hideOverlays(); paused = false; save(); sound('mutation');
    }); container.append(button);
  }
  paused = true; show('mutation-screen'); container.querySelector('button')?.focus();
}
function endRun(victory, data = {}) {
  paused = true; clearSave(); updateRecord();
  $('end-title').textContent = victory ? 'The universe is inside you.' : 'The organism falls silent.';
  const traits = game.state.player.traits || [];
  const discoveries = game.state.discoveries || [];
  $('end-copy').textContent = `${victory ? 'The final structures have been consumed.' : (data.cause || 'Your health reached zero.')}  Scale reached: ${game.state.stage + 1} / 8. Mutations: ${traits.length ? traits.map(t => typeof t === 'string' ? t : t.name || t.id).join(', ') : 'none'}. Discoveries: ${discoveries.length ? discoveries.join(', ') : 'none'}.`;
  show('end-screen'); sound(victory ? 'victory' : 'damage');
}
function event(type, data) {
  if (type === 'mutation') { presentMutations(data.choices); save(); }
  else if (type === 'stage') {
    const stage = STAGES[game.state.stage];
    toast(`SCALE ${game.state.stage + 1} · ${stage.name}`);
    if (!$('reduce-motion').checked) {
      $('transition-scale').textContent = `SCALE ${String(game.state.stage + 1).padStart(2, '0')} / 08`;
      $('transition-title').textContent = stage.name;
      $('transition-setting').textContent = stage.setting;
      const transition = $('stage-transition'); transition.classList.remove('is-active'); void transition.offsetWidth;
      transition.classList.add('is-active'); clearTimeout(transitionTimer);
      transitionTimer = setTimeout(() => transition.classList.remove('is-active'), 2200);
    }
    sound('stage'); save();
  }
  else if (type === 'message') toast(typeof data === 'string' ? data : data?.text || '');
  else if (type === 'death') endRun(false, data);
  else if (type === 'victory') endRun(true, data);
  else if (['feed','attack','damage'].includes(type)) sound(type);
}
function start(saved = null) {
  try { game = new Game(saved); } catch (error) { console.error('Could not restore save:', error); game = new Game(); toast('Save could not be restored. A new run has begun.'); }
  game.onEvent = event;
  started = true; paused = false; $('hud').hidden = false; hideOverlays();
  if (game.state.mode === 'mutation') {
    const options = game.getMutationChoices();
    if (options?.length) presentMutations(options);
    else { game.state.mode = 'playing'; toast('Choose your next mutation at the next milestone.'); }
  }
  updateTutorial(game.state); renderer.update(game.state, 0); save();
}
function toggleTutorial() {
  if (!game) return;
  if ($('tutorial').hidden) showTutorial(game.state); else dismissTutorial(game.state);
  save();
}
function togglePause() {
  if (!started || !game || ['dead','victory','mutation'].includes(game.state.mode)) return;
  paused = !paused; keys.clear();
  if (paused) { save(); show('pause-screen'); } else hideOverlays();
}
function updateHUD() {
  const s = game.state, p = s.player, stage = STAGES[s.stage] || {};
  $('stage-number').textContent = `SCALE ${String(s.stage + 1).padStart(2,'0')} / 08`;
  $('stage-title').textContent = stage.name || stage.title || `Scale ${s.stage + 1}`;
  $('stage-description').textContent = stage.setting || stage.subtitle || stage.description || '';
  const hp = Math.max(0, p.health || 0), max = p.maxHealth || 100;
  $('health-text').textContent = `${Math.ceil(hp)} / ${max}`; $('health-fill').style.width = `${Math.min(100, hp / max * 100)}%`;
  $('biomass-text').textContent = `${Math.floor(s.biomass || 0)} / ${s.goal || 0}`;
  $('biomass-fill').style.width = `${Math.min(100, (s.biomass || 0) / (s.goal || 1) * 100)}%`;
  $('objective').textContent = s.objective || 'Feed, grow, and seek the guardian.';
  $('status').textContent = s.encounter ? `${s.encounter.kind.toUpperCase()} · CORE ${Math.ceil(s.encounter.coreIntegrity)} / ${s.encounter.maxCoreIntegrity} · DESTROY THREE ANCHORS` : `INSTABILITY ${s.instability || 0} / 100${s.alert ? ' · DEFENDERS ALERTED' : ''}`;
  $('hud-traits').textContent = (p.traits || []).length ? (p.traits || []).map(t => typeof t === 'string' ? t : t.name || t.id).join('  /  ') : 'No mutations yet';
}
function gamepadMenu() {
  const pad = navigator.getGamepads?.()[0]; if (!pad) { previousPadButtons = []; return; }
  const pressed = i => !!pad.buttons[i]?.pressed && !previousPadButtons[i];
  if (pressed(9)) togglePause();
  if (paused) {
    const overlay = overlays.map(id => $(id)).find(el => !el.hidden);
    const buttons = overlay ? [...overlay.querySelectorAll('button:not([hidden]), input')].filter(el => el.offsetParent !== null) : [];
    const current = buttons.indexOf(document.activeElement);
    if (buttons.length && (pressed(12) || pressed(14))) buttons[(current + buttons.length - 1) % buttons.length].focus();
    if (buttons.length && (pressed(13) || pressed(15))) buttons[(current + 1) % buttons.length].focus();
    if (pressed(0)) (buttons.includes(document.activeElement) ? document.activeElement : buttons[0])?.click();
    if (pressed(1) && !$('pause-screen').hidden) togglePause();
  }
  previousPadButtons = pad.buttons.map(b => b.pressed);
}
function gamepadInput() {
  const pad = navigator.getGamepads?.()[0]; if (!pad) return null;
  const dead = v => Math.abs(v || 0) < .18 ? 0 : v;
  if (!paused) { renderer.yaw -= dead(pad.axes[2]) * .045; renderer.pitch = Math.max(.24, Math.min(1.15, renderer.pitch + dead(pad.axes[3]) * .035)); }
  return {x:dead(pad.axes[0]), z:dead(pad.axes[1]), y:(pad.buttons[5]?.value || 0) - (pad.buttons[7]?.value || 0), attack:!!pad.buttons[0]?.pressed, feed:!!pad.buttons[2]?.pressed, dodge:!!pad.buttons[1]?.pressed, ability:!!pad.buttons[3]?.pressed, sense:!!pad.buttons[4]?.pressed};
}
function input() {
  const pad = gamepadInput() || {};
  let x = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0) + (pad.x || 0);
  let z = (keys.has('KeyS') ? 1 : 0) - (keys.has('KeyW') ? 1 : 0) + (pad.z || 0);
  const len = Math.hypot(x,z); if (len > 1) { x /= len; z /= len; }
  const yaw = renderer.yaw || 0, cos = Math.cos(yaw), sin = Math.sin(yaw);
  return {x:x*cos + z*sin, z:-x*sin + z*cos, y:Math.max(-1, Math.min(1, (keys.has('KeyR') ? 1 : 0) - (keys.has('KeyF') ? 1 : 0) + (pad.y || 0))), attack:keys.has('Space') || pad.attack, feed:keys.has('KeyE') || pad.feed, dodge:keys.has('ShiftLeft') || keys.has('ShiftRight') || pad.dodge, ability:keys.has('KeyQ') || pad.ability, sense:keys.has('Tab') || pad.sense};
}
function frame(now) {
  const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
  gamepadMenu();
  if (started && game) {
    if (!paused) { const controls = input(); game.update(dt, controls); updateTutorial(game.state, controls); if (now - lastSound > 450 && (controls.feed || controls.attack)) { sound(controls.feed ? 'feed' : 'attack'); lastSound = now; } saveClock += dt; if (saveClock > 5) { save(); saveClock = 0; } }
    renderer.update(game.state, dt); updateHUD();
  }
  requestAnimationFrame(frame);
}
try {
  renderer = new Renderer($('game')); window.addEventListener('resize', () => renderer.resize());
  $('start-button').addEventListener('click', () => start());
  $('resume-button').hidden = !readSave(); $('resume-button').addEventListener('click', () => start(readSave()));
  $('resume-game').addEventListener('click', togglePause);
  $('restart-button').addEventListener('click', () => { clearSave(); start(); });
  $('play-again').addEventListener('click', () => start());
  $('pause-button').addEventListener('click', togglePause);
  $('reduce-motion').addEventListener('change', e => { renderer.reducedMotion = e.target.checked; });
  $('help').addEventListener('click', () => { $('help-panel').hidden = false; });
  $('close-help').addEventListener('click', () => { $('help-panel').hidden = true; });
  $('toggle-tutorial').addEventListener('click', toggleTutorial);
  $('dismiss-tutorial').addEventListener('click', () => { if (game) { dismissTutorial(game.state); save(); } });
  $('show-tutorial').addEventListener('click', () => { if (game) { showTutorial(game.state); $('help-panel').hidden = true; save(); } });
  window.addEventListener('keydown', e => {
    if (started && !paused && ['Space','Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
    if (e.code === 'Escape' && !e.repeat) togglePause();
    if (e.code === 'KeyH' && !paused && !e.repeat) toggleTutorial();
    keys.add(e.code);
  });
  window.addEventListener('keyup', e => keys.delete(e.code));
  window.addEventListener('blur', () => { if (started && !paused) togglePause(); keys.clear(); });
  window.addEventListener('pagehide', save);
  const canvas = $('game');
  canvas.addEventListener('pointerdown', e => { pointerDown = true; lastPointerX = e.clientX; lastPointerY = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointerup', () => pointerDown = false);
  canvas.addEventListener('pointermove', e => { if (pointerDown) { const sensitivity = Number($('camera-sensitivity')?.value || 75) / 75; renderer.yaw -= (e.clientX-lastPointerX) * .005 * sensitivity; renderer.pitch = Math.max(.24, Math.min(1.15, renderer.pitch + (e.clientY-lastPointerY) * .005 * sensitivity)); lastPointerX = e.clientX; lastPointerY = e.clientY; } });
  show('start-screen'); requestAnimationFrame(frame);
} catch (error) { console.error(error); document.body.insertAdjacentHTML('beforeend', '<p class="fatal-error">Unable to start the 3D renderer. Please use a browser with WebGL enabled.</p>'); }
