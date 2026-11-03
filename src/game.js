/**
 * Scale-local simulation for the browser edition of Alien Evolution.
 * World positions are deliberately local to each stage; progression lives in
 * the serializable state, not in astronomical floating point coordinates.
 *
 * Input: {x,y,z,attack,feed,dodge,sense,ability}; directions are world-relative.
 * In the first two water regions y controls depth; all positions are local units.
 * update(dt,input) accepts seconds. Call chooseMutation(id) after a mutation
 * event. Events: message {text}, stage {stage}, mutation {choices}, death
 * {cause}, victory {summary}, encounter {kind}, encounterEnd {kind}.
 */
import { installEarlyEnvironment, hitEarlyEnvironment, earlyDamageMultiplier, updateEarlyEnemy } from './early-encounters.js';

export const STAGES = [
  { name:'The Arrival', scale:'MICROSCOPIC OCEAN', setting:'Inside a fallen meteor, a new life wakes.', foods:['Drifting cells','Mineral spores'], threats:['Maw microbes','Needle cells'], boss:'The Glassjaw', objective:'Gather biomass and overcome the Glassjaw.', gate:'Open water' },
  { name:'The Living Reef', scale:'COASTAL WATERS', setting:'A sunlit reef becomes a hunting ground.', foods:['Reef grazers','Kelp clusters'], threats:['Reef hunters','Spinefish'], boss:'The Reef Sentinel', objective:'Feed in the reef and defeat its sentinel.', gate:'The continental shelf' },
  { name:'The Lightless Reach', scale:'DEEP OCEAN', setting:'Far below, the dark is full of moving lights.', foods:['Lantern shoals','Thermal blooms'], threats:['Abyss stalkers','Pulse jellies'], boss:'The Hollow Leviathan', objective:'Grow among the vents and defeat the leviathan.', gate:'The rising current' },
  { name:'The Breaking Surface', scale:'OCEAN & COAST', setting:'Humanity has finally seen what is rising.', foods:['Whale shoals','Coastal structures'], threats:['Hunter vessels','Sonar aircraft'], boss:'The Containment Fleet', objective:'Feed along the coast and break the fleet.', gate:'The upper atmosphere' },
  { name:'A World Unmade', scale:'PLANETARY', setting:'The planet that held you is now within reach.', foods:['Continental masses','Orbital stations'], threats:['Defense craft','Surface batteries'], boss:'The Aegis Array', objective:'Break the Aegis and consume pieces of Earth.', gate:'Earth’s exposed core' },
  { name:'The Starward Feast', scale:'STELLAR', setting:'Worlds circle a star like prey around a lure.', foods:['Rocky worlds','Gas giants'], threats:['Orbital wardens','Lance platforms'], boss:'The Solar Warden', objective:'Feed on worlds and overcome the solar warden.', gate:'The star’s heart' },
  { name:'The Long Spiral', scale:'GALACTIC', setting:'Something ancient moves between the arms.', foods:['Star systems','Nebulae'], threats:['Void hunters','Beacon arrays'], boss:'The Spiral Keeper', objective:'Consume systems and defeat the spiral keeper.', gate:'The galactic nucleus' },
  { name:'The Last Horizon', scale:'UNIVERSAL', setting:'The cosmic web gathers itself to resist you.', foods:['Galaxy clusters','Dark filaments'], threats:['Immune sentinels','Radiant nodes'], boss:'The Universe’s Antibody', objective:'Defeat the antibody, then feed on the exposed universe.', gate:'The remaining universe' }
];

const MUTATIONS = {
  carapace:{id:'carapace',name:'Living Carapace',description:'+25 maximum health and restore 25 health. Your plates persist at every scale.'},
  swift:{id:'swift',name:'Slipstream Fins',description:'+16% movement speed and a shorter evade cooldown.'},
  jaws:{id:'jaws',name:'Rending Jaws',description:'+30% attack damage. Works on creatures, defenses and cosmic matter.'},
  tendrils:{id:'tendrils',name:'Grasping Tendrils',description:'Increase feeding and attack reach. Your pulse also slows nearby threats.'},
  adaptive:{id:'adaptive',name:'Adaptive Tissue',description:'Restore health on feeding and reduce instability by 25.'},
  volatile:{id:'volatile',name:'Unstable Organ',description:'+55% attack damage, but adds 40 instability. At 100, survive a stabilization encounter.'}
};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const dist=(a,b)=>Math.hypot(a.x-b.x,(a.y||0)-(b.y||0),a.z-b.z);
const copy=o=>JSON.parse(JSON.stringify(o));

export class Game {
  constructor(saved) {
    this.onEvent=()=>{};
    if (saved && saved.player && Number.isInteger(saved.stage) && saved.stage>=0 && saved.stage<STAGES.length) {
      this.state=copy(saved);
      this.state.effects=[];
      // Saves from the planar foundation contain no height field.
      this.state.player.y = Number.isFinite(this.state.player.y) ? this.state.player.y : 0;
      for (const e of this.state.entities || []) if (!Number.isFinite(e.y)) e.y = 0;
      // A saved choice is re-emitted by the UI using getMutationChoices().
      return;
    }
    const seed=(Date.now() ^ Math.floor(Math.random()*0xffffffff))>>>0;
    this.state={version:1,seed,rng:seed,stage:0,time:0,mode:'playing',player:{x:0,y:0,z:12,angle:Math.PI,health:100,maxHealth:100,traits:[],speed:7,damage:13,reach:0,dodgeCooldown:0,attackCooldown:0,feedCooldown:0,abilityCooldown:0,invulnerable:0},entities:[],effects:[],sense:false,biomass:0,goal:35,stageKills:0,bossDefeated:false,mutationTaken:false,instability:0,encounter:null,containmentUsed:false,gateSpawned:false,alert:0,recentFood:'foodA',discoveries:[],totalFed:0,objective:'',nextId:1,regenClock:0};
    this.makeStage();
  }
  emit(type,data={}) { this.onEvent(type,data); }
  random() { const s=this.state; s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0; return s.rng/4294967296; }
  entity(type,x,z,extra={}) {
    const s=this.state;
    const base={id:s.nextId++,type,x,y:0,z,hp:1,maxHp:1,radius:0.8,telegraph:0,dead:false,phase:'idle',timer:1+this.random(),...extra};
    s.entities.push(base); return base;
  }
  makeStage() {
    const s=this.state; const stage=s.stage;
    s.entities=[]; s.effects=[]; s.biomass=0; s.goal=35; s.stageKills=0;
    s.bossDefeated=false; s.mutationTaken=false; s.encounter=null; s.containmentUsed=false;
    s.gateSpawned=false; s.alert=0; s.regenClock=0;
    s.player.x=0; s.player.y=0; s.player.z=12; s.player.angle=Math.PI;
    s.player.health=Math.min(s.player.maxHealth,s.player.health+(stage?18:0));
    s.objective=STAGES[stage].objective;
    // Curated central route and seeded side pockets; every layout has both foods.
    const foods=[[-7,8],[2,7],[8,3],[-4,0],[4,-5],[-10,-8],[11,-11],[-3,-15],[7,-19],[-12,-21],[14,12],[16,-3]];
    foods.forEach(([x,z],i)=>this.entity(i%2?'foodB':'foodA',x+(this.random()-.5)*2,z+(this.random()-.5)*2,{radius:i%2?1.05:.7,value:i%2?7:5,y:stage<2?(i%4)*1.4:0}));
    this.entity('enemy',-8,-2,{hp:28,maxHp:28,radius:1.25,homeX:-8,homeZ:-2});
    this.entity('enemy',9,-15,{hp:28,maxHp:28,radius:1.25,homeX:9,homeZ:-15});
    this.entity('ranged',10,4,{hp:23,maxHp:23,radius:1,homeX:10,homeZ:4});
    this.entity('ranged',-9,-14,{hp:23,maxHp:23,radius:1,homeX:-9,homeZ:-14});
    this.entity('boss',0,-25,{hp:95,maxHp:95,radius:2.7,homeX:0,homeZ:-25,timer:2});
    // Environmental hazards have a visible windup, and are avoidable.
    for (const [x,z] of [[-15,2],[15,-20],[-4,-10]]) this.entity('obstacle',x,z,{radius:2.3,timer:2+this.random()*2});
    installEarlyEnvironment(this);
  }
  getMutationChoices() {
    const s=this.state;
    const relevant=s.recentFood==='foodB'?'adaptive':'jaws';
    const third=s.stage>=4?'volatile':(s.stage%2?'tendrils':'swift');
    return ['carapace',relevant,third].map(id=>({...MUTATIONS[id]}));
  }
  chooseMutation(id) {
    const s=this.state;
    if(s.mode!=='mutation' || !this.getMutationChoices().some(c=>c.id===id)) return false;
    const p=s.player;
    p.traits.push(id);
    if(id==='carapace'){p.maxHealth+=25;p.health=Math.min(p.maxHealth,p.health+25);}
    if(id==='swift')p.speed*=1.16;
    if(id==='jaws')p.damage*=1.3;
    if(id==='tendrils')p.reach+=.8;
    if(id==='adaptive'){p.health=Math.min(p.maxHealth,p.health+15);s.instability=Math.max(0,s.instability-25);}
    if(id==='volatile'){p.damage*=1.55;s.instability+=40;}
    s.mutationTaken=true;s.mode='playing';
    this.emit('message',{text:`${MUTATIONS[id].name} takes root.`});
    if(s.instability>=100) this.startEncounter('stabilization');
    return true;
  }
  startEncounter(kind) {
    const s=this.state; if(s.encounter) return;
    const p=s.player;
    s.encounter={kind,coreIntegrity:100,maxCoreIntegrity:100};
    if(kind==='containment') s.containmentUsed=true;
    for(let i=0;i<3;i++) {
      const a=(i/3)*Math.PI*2;
      // Encounters can begin at the edge of a local region. Keep every anchor
      // reachable even when the triggering strike lands against a boundary.
      this.entity('anchor',clamp(p.x+Math.cos(a)*4,-26,26),clamp(p.z+Math.sin(a)*4,-29,17),{hp:26,maxHp:26,radius:1,y:p.y||0,encounterAnchor:true});
    }
    this.emit('encounter',{kind});
    this.emit('message',{text:kind==='containment'?'CONTAINMENT: Your core is exposed. Destroy the three anchors to break free.':'INSTABILITY: Protect your exposed core. Destroy the three manifestations to stabilize.'});
  }
  finishEncounter() {
    const s=this.state; const kind=s.encounter.kind;
    if(kind==='stabilization')s.instability=35;
    s.encounter=null; s.player.invulnerable=2;
    this.emit('encounterEnd',{kind});
    this.emit('message',{text:kind==='containment'?'Containment broken. Your core is safe.':'Your genome stabilizes.'});
  }
  damagePlayer(amount,source) {
    const s=this.state,p=s.player;
    if(p.invulnerable>0||s.mode!=='playing')return false;
    p.health=Math.max(0,p.health-amount);p.invulnerable=.65;this.emit('damage',{});
    if(s.encounter)s.encounter.coreIntegrity=Math.max(0,s.encounter.coreIntegrity-amount*1.5);
    s.effects.push({x:p.x,y:p.y||0,z:p.z,kind:'damage',age:0});
    if(s.encounter && s.encounter.coreIntegrity<=0){this.die('Exposed core destroyed during '+s.encounter.kind);return true;}
    if(p.health<=0)this.die(source||'Health depleted');
    return true;
  }
  die(cause) { const s=this.state;s.mode='dead';s.cause=cause;this.emit('death',{cause}); }
  hit(e,damage) {
    if(e.dead)return;
    if(hitEarlyEnvironment(this,e,damage)) return;
    damage *= earlyDamageMultiplier(this.state,e);
    e.hp=Math.max(0,e.hp-damage);sfx(this.state,e.x,e.z,'hit',e.y);
    if(e.hp<=0) {
      e.dead=true; e.telegraph=0;
      if(e.type==='boss') {
        this.state.bossDefeated=true;this.state.stageKills++;
        this.emit('message',{text:`${STAGES[this.state.stage].boss} defeated. Feed to grow and open the way.`});
      } else if(e.type==='enemy'||e.type==='ranged')this.state.stageKills++;
      if(e.type==='anchor'&&this.state.encounter&&!this.state.entities.some(a=>a.type==='anchor'&&!a.dead))this.finishEncounter();
    }
  }
  feed(e) {
    const s=this.state,p=s.player;
    if(e.type==='gate') {
      if(s.stage===7) {
        e.hp-=1; sfx(s,e.x,e.z,'feed',e.y);
        this.emit('message',{text:`Absorbing the universe: ${Math.round((1-e.hp/e.maxHp)*100)}%`});
        if(e.hp<=0){e.dead=true;s.mode='victory';this.emit('victory',{summary:this.summary()});}
      } else {
        s.stage++;this.makeStage();this.emit('stage',{stage:s.stage});
      }
      return;
    }
    let value=e.value||((e.type==='boss')?12:8);
    s.biomass+=value;s.totalFed++;s.recentFood=e.type==='foodB'?'foodB':'foodA';this.emit('feed',{});
    if(p.traits.includes('adaptive'))p.health=Math.min(p.maxHealth,p.health+3);
    e.consumed=true;e.dead=true;sfx(s,e.x,e.z,'feed',e.y);
    if(!s.discoveries.includes(STAGES[s.stage].foods[e.type==='foodB'?1:0])&&(e.type==='foodA'||e.type==='foodB'))s.discoveries.push(STAGES[s.stage].foods[e.type==='foodB'?1:0]);
    if(s.stage>=3 && s.alert===0 && s.totalFed%4===0){s.alert=1;this.emit('message',{text:'Your feeding has been detected. Nearby defenders are investigating.'});}
  }
  summary(){const s=this.state;return {stage:s.stage,scale:STAGES[s.stage].scale,traits:[...s.player.traits],discoveries:[...s.discoveries],totalFed:s.totalFed,cause:s.cause||'The universe was consumed',seed:s.seed};}
  update(dt,input={}) {
    const s=this.state;if(s.mode!=='playing')return;
    dt=clamp(Number(dt)||0,0,.05);s.time+=dt;
    const p=s.player; s.sense=!!input.sense;
    for(const k of ['dodgeCooldown','attackCooldown','feedCooldown','abilityCooldown','invulnerable'])p[k]=Math.max(0,(p[k]||0)-dt);
    let x=Number(input.x)||0,z=Number(input.z)||0;const len=Math.hypot(x,z);
    if(len>1){x/=len;z/=len;}
    if(len>.05){p.angle=Math.atan2(x,z);p.x=clamp(p.x+x*p.speed*dt,-27,27);p.z=clamp(p.z+z*p.speed*dt,-30,18);}
    // Vertical swimming is optional and independent of horizontal steering.
    // The finite water column keeps targets and the follow camera in view.
    if(s.stage<2) p.y=clamp((p.y||0)+clamp(Number(input.y)||0,-1,1)*p.speed*.7*dt,0,9);
    else p.y=0;
    if(input.dodge&&p.dodgeCooldown<=0){
      const dx=len>.05?x:Math.sin(p.angle),dz=len>.05?z:Math.cos(p.angle);
      p.x=clamp(p.x+dx*4.8,-27,27);p.z=clamp(p.z+dz*4.8,-30,18);
      p.invulnerable=.6;p.dodgeCooldown=p.traits.includes('swift')?1.35:2;
      sfx(s,p.x,p.z,'dodge',p.y);
    }
    if(input.attack&&p.attackCooldown<=0){
      p.attackCooldown=.43;this.emit('attack',{});
      const candidates=s.entities.filter(e=>!e.dead && ['enemy','ranged','boss','anchor','bloom'].includes(e.type)&&dist(p,e)<e.radius+2.5+p.reach).sort((a,b)=>dist(p,a)-dist(p,b));
      if(candidates[0])this.hit(candidates[0],p.damage);
      sfx(s,p.x,p.z,'attack',p.y);
    }
    if(input.ability&&p.abilityCooldown<=0){
      p.abilityCooldown=8;
      for(const e of s.entities)if(!e.dead&&['enemy','ranged','boss'].includes(e.type)&&dist(p,e)<8){this.hit(e,p.damage*.65);e.slow=2.5;}
      sfx(s,p.x,p.z,'pulse',p.y);
    }
    if(input.feed&&p.feedCooldown<=0){
      const candidates=s.entities.filter(e=>!e.consumed&&((['foodA','foodB'].includes(e.type)&&!e.dead)||(e.type==='gate'&&!e.dead&&!s.encounter)||(['enemy','ranged','boss'].includes(e.type)&&e.dead))&&dist(p,e)<e.radius+2.5+p.reach).sort((a,b)=>dist(p,a)-dist(p,b));
      if(candidates[0]){p.feedCooldown=.32;this.feed(candidates[0]);}
    }
    // Stop processing the old stage immediately after transition or victory.
    if(s.mode!=='playing')return;
    // Resolve an exposed-core encounter before presenting a new mutation. In
    // particular, an unstable choice must never be swallowed by containment.
    if(!s.encounter&&!s.mutationTaken&&s.biomass>=Math.ceil(s.goal/2)){
      s.mode='mutation';this.emit('mutation',{choices:this.getMutationChoices()});return;
    }
    if(!s.encounter&&s.biomass>=s.goal&&s.bossDefeated&&!s.gateSpawned){
      s.gateSpawned=true;this.entity('gate',0,-27,{radius:2.5,hp:s.stage===7?6:1,maxHp:s.stage===7?6:1});
      s.objective=s.stage===7?'Feed repeatedly on the exposed universe.':`Feed at ${STAGES[s.stage].gate} to ascend.`;
      this.emit('message',{text:`The way is open: ${STAGES[s.stage].gate}. Approach and feed.`});
    }
    s.regenClock+=dt;
    const livingFood=s.entities.filter(e=>['foodA','foodB'].includes(e.type)&&!e.dead).length;
    if(livingFood<5&&s.regenClock>8){
      s.regenClock=0;const angle=this.random()*Math.PI*2,r=7+this.random()*8;
      this.entity(this.random()<.5?'foodA':'foodB',clamp(p.x+Math.cos(angle)*r,-25,25),clamp(p.z+Math.sin(angle)*r,-27,15),{value:6,y:s.stage<2?clamp((p.y||0)+(this.random()-.5)*4,0,8):0});
    }
    for(const e of s.entities){
      if(e.dead)continue;
      if(e.type==='obstacle') {
        e.timer-=dt;
        if(e.timer<=0){
          if(!e.telegraph){e.telegraph=1;e.timer=1.2;}
          else {if(dist(p,e)<e.radius+1)this.damagePlayer(7,'Environmental hazard');e.telegraph=0;e.timer=4+this.random()*2;}
        }
        continue;
      }
      if(e.type==='anchor' && s.encounter) {
        e.timer-=dt;
        if(e.timer<=0) {
          if(!e.telegraph){e.telegraph=1;e.timer=1.4;}
          else {if(dist(p,e)<7)this.damagePlayer(6,'Exposed core assault');e.telegraph=0;e.timer=3;}
        }
        continue;
      }
      if(updateEarlyEnemy(this,e,dt)) continue;
      if(!['enemy','ranged','boss'].includes(e.type))continue;
      e.slow=Math.max(0,(e.slow||0)-dt);
      const d=dist(p,e), range=e.type==='boss'?11:e.type==='ranged'?12:8;
      if(d>range+7){e.telegraph=0;e.phase='idle';e.timer=.7;continue;}
      if(d>range)continue;
      if(e.phase==='windup'){
        e.timer-=dt;e.telegraph=clamp(e.timer/(e.type==='boss'?1.4:1),.08,1);
        if(e.timer<=0){
          const reach=e.type==='ranged'?10:e.type==='boss'?6:3.4;
          if(dist(p,e)<reach+e.radius){
            const landed=this.damagePlayer(e.type==='boss'?13:7,e.type==='boss'?STAGES[s.stage].boss:STAGES[s.stage].threats[e.type==='ranged'?1:0]);
            if(landed&&e.type==='boss'&&s.stage>=3&&!s.containmentUsed&&p.health>0&&!s.encounter)this.startEncounter('containment');
          }
          sfx(s,e.x,e.z,'enemy',e.y);e.phase='cooldown';e.timer=e.type==='boss'?2.3:2.6;e.telegraph=0;
        }
      } else if(e.phase==='cooldown'){
        e.timer-=dt;if(e.timer<=0){e.phase='idle';e.timer=.7;}
      } else {
        const ideal=e.type==='ranged'?7:e.type==='boss'?4.6:2.7;
        if(d>ideal){const speed=(e.type==='boss'?2.3:2.5)*(e.slow>0?.45:1);e.x+=(p.x-e.x)/d*speed*dt;e.z+=(p.z-e.z)/d*speed*dt;}
        else {e.timer-=dt;if(e.timer<=0){e.phase='windup';e.timer=e.type==='boss'?1.4:1;e.telegraph=1;
          if(e.type==='boss'&&s.stage>=3&&!s.containmentUsed&&!s.encounter) this.emit('message',{text:'CONTAINMENT WINDUP: Evade the guardian’s marked strike or your core will be exposed.'});
        }}
      }
    }
    if(s.alert && !s.entities.some(e=>!e.dead&&['enemy','ranged','boss'].includes(e.type)&&dist(p,e)<15)){s.alert=0;this.emit('message',{text:'You escaped the responding defenders. The alert has settled.'});}
    s.effects=s.effects.filter(e=>(e.age+=dt)<.65);
    // Drop consumed objects; corpses remain edible and anchors disappear on destruction.
    s.entities=s.entities.filter(e=>!e.consumed&&!(e.type==='anchor'&&e.dead));
  }
}
function sfx(s,x,z,kind,y=0){s.effects.push({x,y:y||0,z,kind,age:0});}
