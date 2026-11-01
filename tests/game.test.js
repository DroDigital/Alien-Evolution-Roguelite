import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, STAGES } from '../src/game.js';

function seededGame(seed) {
  const game = new Game();
  game.state.seed = game.state.rng = seed >>> 0;
  game.state.nextId = 1;
  game.makeStage();
  return game;
}
const dist = (a,b) => Math.hypot(a.x-b.x,(a.y||0)-(b.y||0),a.z-b.z);
const tick = (game, input={}, count=1) => { for (let i=0;i<count;i++) game.update(.05,input); };

// A simple controller, issuing the same move/attack/feed/evade actions as a
// player. It does not change health, positions, biomass, or progression.
function playToVictory(seed) {
  const g = seededGame(seed);
  const visited = new Set([0]);
  for (let frame=0;frame<48000 && g.state.mode!=='victory' && g.state.mode!=='dead';frame++) {
    const s=g.state, p=s.player;
    visited.add(s.stage);
    if (s.mode==='mutation') { assert.equal(g.chooseMutation('carapace'),true); continue; }
    const living = s.entities.filter(e=>!e.dead);
    let target;
    if (s.encounter) {
      target=living.filter(e=>e.type==='anchor').sort((a,b)=>dist(p,a)-dist(p,b))[0];
    } else if (s.gateSpawned) {
      target=living.find(e=>e.type==='gate');
    } else if (s.biomass < s.goal) {
      target=living.filter(e=>e.type==='foodA'||e.type==='foodB').sort((a,b)=>dist(p,a)-dist(p,b))[0];
    } else {
      target=living.find(e=>e.type==='boss');
    }
    if (!target) continue;
    const d=dist(p,target), dx=(target.x-p.x)/(d||1), dy=((target.y||0)-(p.y||0))/(d||1), dz=(target.z-p.z)/(d||1);
    const combat=['enemy','ranged','boss','anchor'].includes(target.type);
    const stop=combat ? target.radius+1.6 : target.radius+1.4;
    const danger=living.find(e=>['enemy','ranged','boss'].includes(e.type) && e.phase==='windup' && e.timer<.22 && dist(p,e)<(e.type==='ranged'?10:e.type==='boss'?6:3.4)+e.radius);
    // Dodge away from an imminent attack. The game provides invulnerability,
    // so even a crowded encounter is navigable without health manipulation.
    let x=d>stop?dx:0, y=d>stop?dy:0, z=d>stop?dz:0;
    if(danger && p.dodgeCooldown<=0){ const dd=dist(p,danger)||1;x=(p.x-danger.x)/dd;z=(p.z-danger.z)/dd; }
    tick(g,{x,y,z,attack:true,feed:true,ability:true,dodge:!!danger});
  }
  return {g,visited};
}

test('fresh seed provides both food types and a boss at every scale',()=>{
  assert.equal(STAGES.length,8);
  for (const seed of [1,42,8675309,0xffffffff]) {
    const g=seededGame(seed);
    for(let stage=0;stage<8;stage++) {
      g.state.stage=stage;g.makeStage();
      for(const type of ['foodA','foodB','enemy','ranged','boss','obstacle'])
        assert.ok(g.state.entities.some(e=>e.type===type),`seed ${seed}, stage ${stage}: missing ${type}`);
      assert.ok(g.state.entities.filter(e=>e.type.startsWith('food')).reduce((n,e)=>n+e.value,0)>=g.state.goal);
    }
  }
});

test('feeding, mutation, and save round-trip preserve creature progress',()=>{
  const g=seededGame(42), s=g.state;
  const food=s.entities.filter(e=>e.type==='foodA').slice(0,4);
  for(const item of food) g.feed(item);
  tick(g);
  assert.equal(s.mode,'mutation');
  assert.ok(g.getMutationChoices().some(c=>c.id==='carapace'));
  assert.equal(g.chooseMutation('carapace'),true);
  assert.equal(s.player.maxHealth,125);
  assert.equal(s.biomass,20);
  const restored=new Game(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.state.stage,s.stage);
  assert.equal(restored.state.biomass,s.biomass);
  assert.deepEqual(restored.state.player.traits,['carapace']);
  assert.equal(restored.state.player.maxHealth,125);
  assert.deepEqual(restored.state.entities,s.entities);
});

test('no passive health or instability loss while safely idle',()=>{
  const g=seededGame(2);
  g.state.entities=[];
  const {health}=g.state.player;
  tick(g,{},2400);
  assert.equal(g.state.player.health,health);
  assert.equal(g.state.instability,0);
  assert.equal(g.state.mode,'playing');
});

test('containment and stabilization end through their anchors; core destruction ends run',()=>{
  const g=seededGame(3);
  g.startEncounter('containment');
  assert.equal(g.state.encounter.coreIntegrity,100);
  for(const anchor of g.state.entities.filter(e=>e.type==='anchor')) g.hit(anchor,100);
  assert.equal(g.state.encounter,null);
  g.startEncounter('stabilization');
  g.state.instability=120;
  for(const anchor of g.state.entities.filter(e=>e.type==='anchor'&&!e.dead)) g.hit(anchor,100);
  assert.equal(g.state.encounter,null);
  assert.equal(g.state.instability,35);
  g.startEncounter('containment');
  g.state.player.invulnerable=0;
  g.state.encounter.coreIntegrity=1;
  g.damagePlayer(1,'test');
  assert.equal(g.state.mode,'dead');
  assert.match(g.state.cause,/core/i);
});

test('simulated controls reach the universe and consume it across seeded runs',()=>{
  for(const seed of [1,42,8675309]) {
    const {g,visited}=playToVictory(seed);
    assert.equal(g.state.mode,'victory',`seed ${seed}: ${g.state.mode} at stage ${g.state.stage}, health ${g.state.player.health}, biomass ${g.state.biomass}, boss ${g.state.bossDefeated}`);
    assert.equal(visited.size,8);
    assert.equal(g.state.stage,7);
    assert.ok(g.state.player.traits.length>=8);
  }
});

test('voluntary unstable mutations trigger a playable encounter and health can end a run',()=>{
  const g=seededGame(17);
  g.state.stage=4;
  for(let i=0;i<3;i++) {
    g.state.mode='mutation';
    assert.equal(g.chooseMutation('volatile'),true);
  }
  assert.equal(g.state.instability,120);
  assert.equal(g.state.mode,'playing');
  assert.equal(g.state.encounter?.kind,'stabilization');
  assert.equal(g.state.entities.filter(e=>e.type==='anchor'&&!e.dead).length,3);
  g.state.player.health=1;
  g.state.player.invulnerable=0;
  g.damagePlayer(5,'A predator');
  assert.equal(g.state.mode,'dead');
  assert.equal(g.state.cause,'A predator');
});

test('edge containment anchors remain reachable and encounter cannot be bypassed by a gate or mutation',()=>{
  const g=seededGame(99), s=g.state;
  s.stage=4;
  s.player.x=27; s.player.z=18;
  g.startEncounter('containment');
  const anchors=s.entities.filter(e=>e.type==='anchor');
  assert.equal(anchors.length,3);
  assert.ok(anchors.every(e=>e.x>=-27&&e.x<=27&&e.z>=-30&&e.z<=18));
  s.entities=[...anchors];
  s.biomass=s.goal; s.bossDefeated=true; s.mutationTaken=false;
  const gate=g.entity('gate',27,18,{radius:2.5});
  s.gateSpawned=true;
  tick(g,{feed:true});
  assert.equal(s.stage,4);
  assert.equal(s.mode,'playing');
  assert.equal(gate.dead,false);
  for(const anchor of anchors) g.hit(anchor,100);
  tick(g);
  assert.equal(s.mode,'mutation');
  g.chooseMutation('carapace');
  tick(g,{feed:true},10);
  assert.equal(s.stage,5);
});

test('vertical movement changes feeding and attack reach and remains within bounds',()=>{
  const g=seededGame(13), s=g.state, p=s.player;
  s.entities=[]; p.x=0; p.z=0; p.y=0;
  const food=g.entity('foodA',0,0,{y:8,value:5});
  const enemy=g.entity('enemy',1,0,{y:8,hp:28,maxHp:28,phase:'recovery',timer:99});
  tick(g,{feed:true,attack:true});
  assert.equal(food.dead,false,'food above should be out of reach');
  assert.equal(enemy.hp,28,'enemy above should be out of reach');
  tick(g,{y:1},40);
  assert.ok(p.y>7 && p.y<=9);
  tick(g,{feed:true,attack:true},12);
  assert.equal(food.consumed,true);
  assert.ok(enemy.hp<28);
  tick(g,{y:1},100);
  assert.equal(p.y,9);
  tick(g,{y:-1},100);
  assert.equal(p.y,0);
});

test('pre-height saves migrate to ground level without losing progress',()=>{
  const original=seededGame(14).state;
  original.player.traits.push('jaws'); original.biomass=12;
  const legacy=JSON.parse(JSON.stringify(original));
  delete legacy.player.y;
  for(const entity of legacy.entities) delete entity.y;
  const restored=new Game(legacy);
  assert.equal(restored.state.player.y,0);
  assert.ok(restored.state.entities.every(e=>e.y===0));
  assert.deepEqual(restored.state.player.traits,['jaws']);
  assert.equal(restored.state.biomass,12);
  tick(restored,{y:1},10);
  assert.ok(restored.state.player.y>0);
  const resumed=new Game(JSON.parse(JSON.stringify(restored.state)));
  assert.equal(resumed.state.player.y,restored.state.player.y);
});

test('both early stages permit a player to feed at each seeded elevation',()=>{
  for(const seed of [1,42,8675309]) for(const stage of [0,1]) {
    const g=seededGame(seed),s=g.state;
    s.stage=stage;g.makeStage();
    const foods=s.entities.filter(e=>e.type==='foodA'||e.type==='foodB');
    assert.ok(foods.some(e=>e.y>3));
    s.entities=[...foods];
    for(const food of foods) {
      for(let i=0;i<600 && !food.consumed;i++) {
        if(s.mode==='mutation') {g.chooseMutation('carapace');continue;}
        const p=s.player,d=dist(p,food)||1;
        tick(g,{x:(food.x-p.x)/d,y:(food.y-p.y)/d,z:(food.z-p.z)/d,feed:true});
      }
      assert.equal(food.consumed,true,`seed ${seed}, stage ${stage}, food height ${food.y}`);
    }
  }
});

test('nutrient pods break into both foods when attacked',()=>{
  const g=seededGame(5),s=g.state,p=s.player;
  s.entities=[];p.x=0;p.y=1.5;p.z=0;
  const pod=g.entity('bloom',1,0,{y:1.5,hp:13,maxHp:13,radius:1.1});
  tick(g,{attack:true});
  assert.equal(pod.dead,true);
  assert.ok(s.entities.some(e=>e.type==='foodA'&&!e.dead));
  assert.ok(s.entities.some(e=>e.type==='foodB'&&!e.dead));
});

test('ranged attacks lock their target, so movement avoids the marked strike',()=>{
  function scenario(move) {
    const g=seededGame(6),s=g.state,p=s.player;
    s.entities=[];p.x=0;p.y=0;p.z=0;
    const e=g.entity('ranged',7,0,{timer:0,phase:'idle',radius:1,hp:23,maxHp:23});
    tick(g);
    assert.equal(e.phase,'windup');
    assert.equal(e.aimX,0);assert.equal(e.aimZ,0);
    tick(g,move?{z:1}:{},30);
    return p.health;
  }
  assert.equal(scenario(true),100);
  assert.equal(scenario(false),93);
});

test('early melee commits to a charge and guardian takes extra damage during recovery',()=>{
  const g=seededGame(7),s=g.state,p=s.player;
  s.entities=[];p.x=0;p.y=0;p.z=0;
  const enemy=g.entity('enemy',3,0,{timer:0,phase:'idle',radius:1.25,hp:28,maxHp:28});
  tick(g);
  assert.equal(enemy.phase,'windup');
  tick(g,{},25);
  assert.equal(enemy.phase,'charge');
  tick(g,{},15);
  assert.equal(enemy.phase,'recovery');
  const boss=g.entity('boss',10,0,{hp:100,maxHp:100,radius:2.7,phase:'idle'});
  g.hit(boss,10); assert.equal(boss.hp,90);
  boss.phase='recovery';g.hit(boss,10); assert.equal(boss.hp,75);
});
