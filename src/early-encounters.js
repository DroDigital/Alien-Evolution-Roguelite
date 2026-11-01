/** Small, authored interactions for the arrival and the reef. All state remains
 * plain JSON so saves made mid-windup or mid-charge can be resumed. */
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const distance = (a, b) => Math.hypot(a.x - b.x, (a.y || 0) - (b.y || 0), a.z - b.z);
const targetOf = e => ({x:e.aimX, y:e.aimY || 0, z:e.aimZ});

export function installEarlyEnvironment(game) {
  if (game.state.stage > 1) return;
  // Fixed, optional food pockets complement the normal renewable food sources.
  for (const [x, z] of [[-2, 4], [6, -10]]) {
    game.entity('bloom', x, z, { y:1.5, hp:13, maxHp:13, radius:1.1 });
  }
}

export function hitEarlyEnvironment(game, entity, damage) {
  if (entity.type !== 'bloom') return false;
  entity.hp = Math.max(0, entity.hp - damage);
  if (entity.hp <= 0) {
    entity.dead = true;
    entity.consumed = true;
    // Place each food close enough to find but separately feedable.
    game.entity('foodA', clamp(entity.x - 1, -26, 26), entity.z, {y:entity.y || 0, value:5, radius:.7});
    game.entity('foodB', clamp(entity.x + 1, -26, 26), entity.z, {y:entity.y || 0, value:7, radius:1.05});
    game.emit('message', {text:'Nutrient pod ruptured. Feed on the released cells.'});
    game.state.effects.push({x:entity.x, y:entity.y || 0, z:entity.z, kind:'feed', age:0});
  }
  return true;
}

export function earlyDamageMultiplier(state, entity) {
  return state.stage < 2 && entity.type === 'boss' && entity.phase === 'recovery' ? 1.5 : 1;
}

/** Returns true if the entity was handled. Melee hunters commit to a charge,
 * ranged hunters mark a position before striking, and guardians pulse in an
 * area followed by an opening. All threats can be avoided by moving/evading. */
export function updateEarlyEnemy(game, e, dt) {
  const s = game.state;
  if (s.stage > 1 || !['enemy', 'ranged', 'boss'].includes(e.type)) return false;
  const p = s.player;
  e.y = Number(e.y) || 0;
  e.slow = Math.max(0, (e.slow || 0) - dt);
  const d = distance(p, e);
  const range = e.type === 'boss' ? 12 : e.type === 'ranged' ? 13 : 9;
  if (d > range + 7 && !['windup','charge','recovery'].includes(e.phase)) {
    e.telegraph=0; e.phase='idle'; e.timer=.7; return true;
  }
  if (e.phase === 'recovery') {
    e.telegraph = 0;
    e.timer -= dt;
    if (e.timer <= 0) {e.phase='idle'; e.timer=.65;}
    return true;
  }
  if (e.phase === 'windup') {
    e.timer -= dt;
    e.telegraph = Math.max(.1, Math.min(1, e.timer / (e.type === 'boss' ? 1.5 : 1.2)));
    if (e.timer <= 0) {
      e.telegraph = 0;
      if (e.type === 'enemy') { e.phase='charge'; e.timer=.65; }
      else {
        const target = e.type === 'ranged' && Number.isFinite(e.aimX) ? targetOf(e) : e;
        const reach = e.type === 'boss' ? 6 + e.radius : 3.2;
        if (distance(p, target) < reach) game.damagePlayer(e.type === 'boss' ? 13 : 7, e.type === 'boss' ? (s.stage ? 'The Reef Sentinel' : 'The Glassjaw') : (s.stage ? 'Spinefish' : 'Needle cells'));
        s.effects.push({x:target.x, y:target.y || 0, z:target.z, kind:'enemy', age:0});
        e.phase='recovery'; e.timer=e.type==='boss'?2.5:1.6;
        if (e.type === 'boss') game.emit('message',{text:'The guardian is recovering — strike during the opening.'});
      }
    }
    return true;
  }
  if (e.phase === 'charge') {
    const target = Number.isFinite(e.aimX) ? targetOf(e) : p;
    const remaining = distance(e, target);
    const step = Math.min(remaining, (s.stage === 1 ? 13 : 11)*dt);
    if (remaining > .001) {
      e.x += (target.x-e.x)/remaining*step;
      e.y = clamp(e.y+((target.y||0)-e.y)/remaining*step,0,9);
      e.z += (target.z-e.z)/remaining*step;
    }
    e.timer -= dt;
    if (distance(p,e)<e.radius+1.3) game.damagePlayer(8, s.stage ? 'Reef hunter charge' : 'Maw microbe charge');
    if (e.timer <= 0 || remaining < .35) {e.phase='recovery';e.timer=1.5;}
    return true;
  }
  if (d > range) return true;
  const ideal = e.type === 'ranged' ? 7 : e.type === 'boss' ? 4.6 : 3.6;
  if (d > ideal) {
    const speed = (e.type === 'boss' ? 2.3 : s.stage === 1 ? 3 : 2.5) * (e.slow > 0 ? .45 : 1);
    const step = Math.min(speed * dt, Math.max(0, d-ideal));
    if (d > .001) {
      e.x += (p.x-e.x)/d*step;
      e.y = clamp(e.y+((p.y||0)-e.y)/d*step,0,9);
      e.z += (p.z-e.z)/d*step;
    }
  } else {
    e.timer = (Number(e.timer) || 0) - dt;
    if (e.timer <= 0) {
      e.phase='windup';e.timer=e.type==='boss'?1.5:1.2;e.telegraph=1;
      e.aimX=p.x;e.aimY=p.y||0;e.aimZ=p.z;
    }
  }
  return true;
}
