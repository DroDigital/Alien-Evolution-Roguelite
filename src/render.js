import * as THREE from 'three';

// All geometry is original and generated at runtime. Gameplay remains in its own
// small coordinate system; changing scale never changes collision precision.
const PALETTES = [
  {bg:0x071c23, fog:0x071c23, floor:0x0a2930, accent:0x6de5cb, light:0x75d9d0},
  {bg:0x092c35, fog:0x092c35, floor:0x174344, accent:0xffbc74, light:0x8fe2dc},
  {bg:0x080f23, fog:0x080f23, floor:0x101d30, accent:0x9c8bff, light:0x7493e2},
  {bg:0x102d36, fog:0x102d36, floor:0x224b51, accent:0xffb36c, light:0xb9e3e0},
  {bg:0x070f22, fog:0x070f22, floor:0x102b3c, accent:0x8ac7ff, light:0x8bb4ed},
  {bg:0x110f25, fog:0x110f25, floor:0x211b36, accent:0xffbe6f, light:0xffc992},
  {bg:0x100d24, fog:0x100d24, floor:0x201a37, accent:0xdb9fff, light:0xb3a3f4},
  {bg:0x0b1025, fog:0x0b1025, floor:0x172439, accent:0x86ebea, light:0xafc8ff},
];
const TAU = Math.PI * 2;
const rand = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return x - Math.floor(x); };
const mat = (color, options={}) => new THREE.MeshStandardMaterial({ color, roughness: 0.48, metalness: 0.08, ...options });
const sphere = new THREE.SphereGeometry(1, 20, 14);
const smallSphere = new THREE.SphereGeometry(1, 12, 8);
const torus = new THREE.TorusGeometry(1, .045, 8, 48);
const cone = new THREE.ConeGeometry(1, 1, 8);
const crystal = new THREE.OctahedronGeometry(1, 0);
const rock = new THREE.IcosahedronGeometry(1, 1);

function mesh(geo, material, scale, position) {
  const m = new THREE.Mesh(geo, material);
  if (scale) m.scale.set(...scale);
  if (position) m.position.set(...position);
  return m;
}
function ring(color, radius=1, opacity=.8) {
  const m = mesh(torus, new THREE.MeshBasicMaterial({color, transparent:true, opacity, side:THREE.DoubleSide, depthWrite:false}), [radius,radius,radius]);
  m.rotation.x = Math.PI / 2;
  return m;
}
function glow(color, opacity=.2) {
  return new THREE.MeshBasicMaterial({color, transparent:true, opacity, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
}
function groundTexture(stage) {
  const canvas=document.createElement('canvas'); canvas.width=512; canvas.height=512;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle = '#b2b2b2'; ctx.fillRect(0,0,512,512);
  // Low-contrast material variation is part of the procedural asset, not a remote texture.
  for(let i=0;i<900;i++) {
    const x=rand(i*3+stage*771)*512, y=rand(i*3+1+stage*771)*512;
    const radius=2+rand(i*3+2)*22;
    ctx.fillStyle=i%2?'rgba(255,255,255,.025)':'rgba(0,0,0,.035)';
    ctx.beginPath();ctx.ellipse(x,y,radius,radius*(.3+rand(i+5)*.7),rand(i)*Math.PI,0,TAU);ctx.fill();
  }
  if(stage===0) {
    ctx.strokeStyle='rgba(220,255,250,.13)';ctx.lineWidth=1;
    for(let i=0;i<26;i++){ctx.beginPath();ctx.ellipse(rand(i+20)*512,rand(i+89)*512,12+rand(i+11)*38,6+rand(i+80)*20,rand(i)*TAU,0,TAU);ctx.stroke();}
  } else if(stage>=4) {
    ctx.fillStyle='rgba(255,255,255,.42)';
    for(let i=0;i<160;i++){const x=rand(i+122)*512,y=rand(i+710)*512;ctx.fillRect(x,y,1.2,1.2);}
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(7,7);texture.anisotropy=4;return texture;
}
function creature() {
  const g = new THREE.Group();
  const membrane = mat(0x64dec2, {transparent:true, opacity:.78, roughness:.28, metalness:.2});
  const inner = mat(0x174b4a, {emissive:0x1d8875, emissiveIntensity:.6, roughness:.22});
  const pale = mat(0xa4ffe3, {emissive:0x39d9a8, emissiveIntensity:.65});
  const dark = mat(0x112b35, {roughness:.25});
  let body = mesh(sphere, membrane, [1.05,.6,1.35], [0,.85,0]); g.add(body);
  g.add(mesh(sphere, inner, [.49,.42,.67], [0,.89,.02]));
  g.add(mesh(sphere, pale, [.18,.18,.18], [0,1.23,-.24]));
  // A persistent pair of forward eyes and trailing cilia tie every form together.
  for (const side of [-1,1]) {
    g.add(mesh(sphere, dark, [.18,.16,.16], [side*.44,1.13,-.87]));
    g.add(mesh(sphere, pale, [.07,.07,.07], [side*.45,1.17,-1.015]));
    const fin = mesh(new THREE.ConeGeometry(.48,1.25,5), membrane, [.8,.5,1], [side*.95,.82,.12]);
    fin.rotation.z = side * -Math.PI / 2; g.add(fin);
    for (let i=0;i<3;i++) {
      const feeler = mesh(new THREE.CapsuleGeometry(.055, .68 + i*.16, 3, 6), pale, [1,1,1], [side*(.35+i*.2),.8,1.14+i*.1]);
      feeler.rotation.x = Math.PI/2.7; feeler.rotation.z = side*(.25+i*.18); g.add(feeler);
    }
  }
  g.userData.body = body;
  g.userData.traitGroup = new THREE.Group(); g.add(g.userData.traitGroup);
  const halo = ring(0x7cebd4, 1.5, .22); halo.position.y=.08; g.add(halo);
  return g;
}
function addTraits(group, traits) {
  const tg = group.userData.traitGroup;
  tg.clear();
  const count = Math.min(8, traits.length);
  const armor = traits.some(t => /armor|shell|plate|carapace/i.test(typeof t === 'string' ? t : (t.name||t.id||'')));
  const volatile = traits.some(t => /volatile|unstable|energy/i.test(typeof t === 'string' ? t : (t.name||t.id||'')));
  const color = volatile ? 0xff8d9d : armor ? 0xb2d7d6 : 0x80ffe1;
  const m = mat(color, {emissive:color, emissiveIntensity:.18, metalness:.35});
  for (let i=0;i<count;i++) {
    const a = i * 2.4;
    const spike = mesh(cone,m,[.13,.38,.13],[Math.cos(a)*.75,1.32,Math.sin(a)*.85]);
    spike.rotation.z = Math.cos(a)*-.4; spike.rotation.x = Math.sin(a)*.4;
    tg.add(spike);
  }
}
function entityVisual(type, stage, radius=1) {
  const g = new THREE.Group();
  const size = Math.max(.55, Math.min(2.8, radius || 1));
  const dangerReach = type==='ranged' ? 10+radius : type==='boss' ? 6+radius : type==='enemy' ? 3.4+radius : type==='anchor' ? 7 : radius+1;
  const cosmic = stage >= 4;
  const cyan = mat(0x76d9bf, {emissive:0x237b70, emissiveIntensity:.35});
  const gold = mat(0xf1bb77, {emissive:0x9c5027, emissiveIntensity:.35});
  const red = mat(0xe96867, {emissive:0x9c262d, emissiveIntensity:.35});
  const purple = mat(0xa18bdb, {emissive:0x564391, emissiveIntensity:.35});
  if (type === 'foodA' || type === 'foodB') {
    const b = type === 'foodB';
    if (cosmic) {
      g.add(mesh(sphere, b?gold:cyan, [1,1,1],[0,1,0]));
      if (b) { const r=ring(0xffc984,1.5,.75); r.position.y=1; r.rotation.x=.6; g.add(r); }
      else { g.add(mesh(sphere, glow(0x7edfd4,.12),[1.35,1.35,1.35],[0,1,0])); }
    } else if (b) {
      g.add(mesh(sphere,gold,[1,.5,.65],[0,.8,0]));
      const tail=mesh(cone,gold,[.5,.75,.12],[0,.8,.8]); tail.rotation.x=Math.PI/2; g.add(tail);
      g.add(mesh(sphere,mat(0x16272c),[.09,.09,.09],[.4,.96,-.4]));
    } else {
      g.add(mesh(sphere,cyan,[.8,.75,1],[0,.8,0]));
      for(let i=0;i<4;i++){let a=i*TAU/4;let p=mesh(smallSphere,gold,[.16,.16,.16],[Math.cos(a)*.62,.9,Math.sin(a)*.7]);g.add(p);}
    }
  } else if (type === 'enemy' || type === 'ranged' || type === 'boss') {
    const boss=type==='boss', ranged=type==='ranged';
    const bodyMat=boss?purple:red;
    g.add(mesh(cosmic ? rock : sphere,bodyMat,[1.05,.65,1.25],[0,1,0]));
    g.add(mesh(sphere,mat(0x26192a),[.6,.3,.45],[0,1.4,-.22]));
    for(const side of [-1,1]) {
      g.add(mesh(sphere,mat(0xffd4a3,{emissive:0xff5d48,emissiveIntensity:1}),[.15,.15,.15],[side*.38,1.42,-.53]));
      const horn=mesh(cone,bodyMat,[.2,.85,.2],[side*.75,1.55,-.5]); horn.rotation.z=-side*.55;g.add(horn);
      if (boss || ranged) { const wing=mesh(cone,bodyMat,[.45,1.7,.26],[side*1.25,1,.1]); wing.rotation.z=-side*Math.PI/2.7;g.add(wing); }
    }
    if (boss) { const r=ring(0xf98b79,1.8,.4);r.position.y=.1;g.add(r); }
    const tel = ring(0xff7d67,dangerReach/size,.8); tel.position.y=.08; tel.visible=false; g.add(tel); g.userData.telegraph=tel;
  } else if (type === 'gate' || type === 'core' || type === 'anchor') {
    const c=type==='anchor'?0xff7a76:0x8aefdc;
    const ringMesh=mesh(new THREE.TorusGeometry(1.2,.13,8,40),mat(c,{emissive:c,emissiveIntensity:.6}),[1,1,1],[0,1.6,0]);g.add(ringMesh);
    g.add(mesh(crystal,mat(c,{emissive:c,emissiveIntensity:.8}),[.5,.75,.5],[0,1.6,0]));
    if(type==='gate' && stage===7) {
      // The final object is a finite, visible cosmic web. Feeding contracts the
      // whole structure as the simulation counts down the remaining universe.
      for(let i=0;i<3;i++) {
        const web=mesh(new THREE.TorusGeometry(1.5+i*.35,.045,6,48),glow(0xb9b0ff,.65),[1,1,1],[0,1.6,0]);
        web.rotation.x=i*.95;web.rotation.y=i*.75;g.add(web);
      }
      for(let i=0;i<12;i++) {
        const a=i*TAU/12; const satellite=mesh(smallSphere,mat(0xc8b6ff,{emissive:0x9d85ff,emissiveIntensity:.8}),[.12,.12,.12],[Math.cos(a)*1.8,1.6+Math.sin(a*3)*.45,Math.sin(a)*1.8]);g.add(satellite);
      }
      g.userData.universe=true;
    }
    g.userData.spin=ringMesh;
  } else {
    g.add(mesh(rock, mat(stage<4?0x416e68:0x6d668d), [1.2,1.2,1.2],[0,.6,0]));
  }
  if (!g.userData.telegraph) {
    const tel=ring(0xff9b72,dangerReach/size,.8); tel.position.y=.08; tel.visible=false; g.add(tel); g.userData.telegraph=tel;
  }
  // Radius describes collision size; keep readability for small food.
  g.userData.baseSize=size;
  g.scale.setScalar(size);
  return g;
}

export class Renderer {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(48, 1, .1, 150);
    this.scene.add(new THREE.HemisphereLight(0xc6f9f2,0x102131,2));
    const key = new THREE.DirectionalLight(0xd4fff1, 2.2); key.position.set(-8,18,8); this.scene.add(key);
    const rim = new THREE.PointLight(0x66d4c6,35,60); rim.position.set(4,8,-8); this.scene.add(rim);
    this.world = new THREE.Group(); this.scene.add(this.world);
    this.entityRoot = new THREE.Group(); this.scene.add(this.entityRoot);
    this.player = creature(); this.scene.add(this.player);
    this.entities = new Map(); this.stage = -1; this.traitsKey=''; this.time=0; this.yaw=0; this.reducedMotion=false;
    this.effectPool = Array.from({length:24}, () => { const r=ring(0xb2ffdf,1,.7); r.visible=false; this.scene.add(r); return r; });
    this.resize();
  }
  buildStage(stage) {
    this.stage = stage;
    this.world.clear();
    const p=PALETTES[stage] || PALETTES[0];
    this.scene.background = new THREE.Color(p.bg);
    this.scene.fog = new THREE.FogExp2(p.fog, stage < 4 ? .025 : .017);
    const ground = mesh(new THREE.PlaneGeometry(250,250),mat(p.floor,{roughness:.98, metalness:.05, map:groundTexture(stage)}),[1,1,1],[0,-.32,0]); ground.rotation.x=-Math.PI/2; this.world.add(ground);
    // An offset grid of generated landmarks makes navigation legible without
    // depending on a network asset pipeline.
    for (let i=0;i<100;i++) {
      const x=(rand(i*4+stage*91)-.5)*105, z=(rand(i*4+1+stage*91)-.5)*105;
      if (Math.hypot(x,z)<8) continue;
      const h=1+rand(i*4+2)*4;
      const group=new THREE.Group(); group.position.set(x,0,z);
      if(stage===0) {
        const shell=mesh(sphere,mat(i%2?0x234a46:0x345b52,{transparent:true,opacity:.55}),[h*.65,h*.35,h*.9],[0,h*.15,0]);group.add(shell);
        if(i%3===0){let r=ring(0x6ab6a0,h*.8,.2);r.position.y=.1;group.add(r);}
      } else if(stage===1 || stage===2) {
        group.add(mesh(rock,mat(stage===1?0x345f56:0x202b44),[h*.8,h*.45,h*.8],[0,h*.15,0]));
        for(let k=0;k<3;k++){
          const stalk=mesh(cone,mat(stage===1?(i%2?0x48897a:0xb26b54):0x546a9d,{emissive:stage===2?0x344e9a:0x111111,emissiveIntensity:.5}),[.16,h*(.5+k*.18),.16],[(k-1)*.4,h*.4,0]); stalk.rotation.z=(k-1)*.25;group.add(stalk);
        }
      } else if(stage===3) {
        group.add(mesh(rock,mat(0x536e68),[h,h*.45,h],[0,-.05,0]));
        if(i%3===0){const tower=mesh(new THREE.BoxGeometry(1,1,1),mat(0xa8aaa0),[.4,h,.4],[0,h*.5,0]);group.add(tower);}
      } else {
        const c=[0x4b7e93,0xd39b6b,0xa379af,0x5f879f][stage-4];
        group.add(mesh(sphere,mat(c,{emissive:c,emissiveIntensity:.15,roughness:.8}),[h*.55,h*.55,h*.55],[0,h*.4,0]));
        if(i%3===0) { const r=ring(p.accent,h*.85,.25);r.position.y=h*.4; r.rotation.x=.6; group.add(r); }
      }
      this.world.add(group);
    }
    // Floating motes and stars give the space between landmarks depth.
    const positions=[]; for(let i=0;i<500;i++) positions.push((rand(i+912+stage*1000)-.5)*115, rand(i+1723)*28+1, (rand(i+3912)-.5)*115);
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    const points=new THREE.Points(geometry,new THREE.PointsMaterial({color:p.accent,size:stage<4?.12:.2,transparent:true,opacity:.5,depthWrite:false}));this.world.add(points);
    for(const value of this.entities.values()) this.entityRoot.remove(value.group);
    this.entities.clear();
  }
  update(state, dt=0) {
    if (!state || !state.player) return;
    const stage=Math.max(0,Math.min(7,state.stage|0));
    if(stage!==this.stage) this.buildStage(stage);
    this.time = state.time || (this.time + dt);
    const p=state.player;
    this.player.position.set(p.x||0, .12 + (this.reducedMotion ? 0 : Math.sin(this.time*2)*.08), p.z||0);
    this.player.rotation.y = (p.angle || 0) + Math.PI;
    const traits=p.traits || []; const key=JSON.stringify(traits);
    if(key!==this.traitsKey){addTraits(this.player,traits);this.traitsKey=key;}
    this.player.userData.body.scale.y=.6 + (this.reducedMotion ? 0 : Math.sin(this.time*3)*.025);
    const seen=new Set();
    for(const e of state.entities || []){
      if(e.dead && !['enemy','ranged','boss'].includes(e.type)) continue;
      seen.add(e.id);
      let v=this.entities.get(e.id);
      if(!v || v.type!==e.type){ if(v)this.entityRoot.remove(v.group);const group=entityVisual(e.type,stage,e.radius);this.entityRoot.add(group);v={group,type:e.type};this.entities.set(e.id,v); }
      v.group.position.set(e.x||0, this.reducedMotion ? 0 : Math.sin(this.time*1.8+(Number(e.id)||0))*.08, e.z||0);
      if (!v.group.userData.senseRing) {
        const isThreat = ['enemy','ranged','boss','anchor'].includes(e.type);
        const sr=ring(isThreat ? 0xff9b84 : 0xa8ffe1,1.7,.45); sr.position.y=.12; v.group.add(sr); v.group.userData.senseRing=sr;
      }
      v.group.userData.senseRing.visible=!!state.sense || !!e.dead;
      v.group.userData.senseRing.material.color.set(e.dead ? 0xa8ffe1 : (['enemy','ranged','boss','anchor'].includes(e.type) ? 0xff9b84 : 0xa8ffe1));
      const universeScale=v.group.userData.universe ? .45+.55*Math.max(0,(e.hp||0)/(e.maxHp||1)) : 1;
      v.group.scale.set(v.group.userData.baseSize*universeScale, v.group.userData.baseSize*universeScale*(e.dead ? .42 : 1), v.group.userData.baseSize*universeScale);
      if(e.angle != null) v.group.rotation.y=e.angle;
      if(v.group.userData.telegraph) v.group.userData.telegraph.visible=!!e.telegraph;
      if(v.group.userData.spin && !this.reducedMotion) v.group.userData.spin.rotation.z += dt;
    }
    for(const [id,v] of this.entities) if(!seen.has(id)){this.entityRoot.remove(v.group);this.entities.delete(id);}
    const effects = state.effects || [];
    this.effectPool.forEach((r,i) => {
      const e=effects[i]; r.visible=!!e; if (!e) return;
      const age=e.age || 0; const size=.7+age*4;
      r.position.set(e.x||0,.15,e.z||0); r.scale.setScalar(size);
      r.material.color.set(e.kind === 'damage' ? 0xff7b75 : e.kind === 'attack' ? 0xf7dfaa : 0x9dffe0);
      r.material.opacity=Math.max(0,.8-age*1.5);
    });
    const sy=Math.sin(this.yaw), cy=Math.cos(this.yaw);
    const target=new THREE.Vector3((p.x||0)-sy, 0, (p.z||0)-cy);
    const desired=new THREE.Vector3((p.x||0)+sy*20, 16, (p.z||0)+cy*20);
    const smooth=this.reducedMotion ? 1 : 1-Math.exp(-Math.max(dt,.016)*4);
    if(!this.cameraReady){this.camera.position.copy(desired);this.cameraReady=true;} else this.camera.position.lerp(desired,smooth);
    this.camera.lookAt(target);
    this.renderer.render(this.scene,this.camera);
  }
  resize() {
    const canvas=this.renderer.domElement;
    const width=canvas.clientWidth || window.innerWidth, height=canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(width,height,false); this.camera.aspect=width/height;this.camera.updateProjectionMatrix();
  }
  dispose() { this.renderer.dispose(); }
}
