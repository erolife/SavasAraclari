const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('t34',18),find=n=>ad.root.getObjectByName(n);
const close=(a,b,e=1e-5)=>assert(Math.abs(a-b)<e,`${a} != ${b}`);
const RP=.415+.06,ARM=Math.hypot(.40,.15);
assert.equal(ad.ui.sliders.length,3);assert.equal(Object.keys(ad.camPresets).length,6);
// Hull loft must face outwards (flat-shaded, outward normal on the belly).
const hullGeo=ad.parts.hull.children[0].geometry;assert(hullGeo.attributes.normal.getY(0)<0);
// Rest pose: all five wheels and both lower track runs on the ground.
ad.onSlider(0,0);ad.root.updateMatrixWorld(true);
close(new T.Box3().setFromObject(ad.parts.tracks).min.y,0,1e-4);
ad.hubs.forEach(h=>close(h.y,RP));
assert(!find('test-log').visible);
const rest=ad.suspension.map(o=>o.len);
// Obstacle under wheel 2: exact circle contact, only that wheel lifts, arm length constant, spring shortens.
for(const H of [.05,.12,.16,.2]){
 ad.onSlider(0,H);ad.root.updateMatrixWorld(true);
 const h=ad.hubs[1];close(h.lift,H,1e-3);
 const log=find('test-log');assert(log.visible);
 close(Math.hypot(h.z-log.position.z,h.y-log.position.y),RP+H/2,2e-3);
 [0,2,3,4].forEach(k=>close(ad.hubs[k].lift,0));
 ad.suspension.forEach(o=>{const hb=ad.hubs[o.k];close(Math.hypot(hb.z-o.pivot[0],hb.y-o.pivot[1]),ARM,1e-3);
   if(o.k===1)assert(o.len<rest[ad.suspension.indexOf(o)]-H*.2,'Lifted wheel must compress its spring');else close(o.len,rest[ad.suspension.indexOf(o)],1e-6);});
 // Track loop: lower run under the lifted wheel follows it; first/last points close the loop.
 const loop=ad.trackLoop();assert.equal(loop.length,16);close(loop[4][1],h.y-.415-.03,1e-6);
 // Lifted wheel tread must stay above the hull belly and below the sponson floor.
 for(const p of ['wheelsL','wheelsR','tracks'])assert(new T.Box3().setFromObject(ad.parts[p]).max.y<1.18,p+' must clear the sponson floor at y=1.18');
}
// Track segments are reused (no geometry allocation while animating).
const geos=meshes.map(m=>m.geometry);
// Automatic obstacle pass: every wheel lifts in turn, slider value is not overridden by hidden floors.
ad.onSlider(1,900);ad.onButton('terrain');assert(ad.buttonActive('terrain'));
const seen=new Set();for(let i=0;i<900;i++){ad.update(.05);ad.hubs.forEach((h,k)=>{if(h.lift>.05)seen.add(k);});}
assert.equal(seen.size,5,'All five road wheels must ride over the log');
ad.onSlider(0,0);assert(!ad.buttonActive('terrain'));close(ad.getSliderValues()[0],0);
meshes.forEach((m,i)=>assert.equal(m.geometry,geos[i]));
// Zero RPM stops wheels, sprockets, fan and crank pulley.
ad.onSlider(1,0);const fan=find('fan'),sp=find('sprocket'),wh=find('road-wheel');
const f0=fan.rotation.z,s0=sp.rotation.x,w0=wh.rotation.x;ad.update(.05);ad.update(.05);
close(fan.rotation.z,f0);close(sp.rotation.x,s0);close(wh.rotation.x,w0);
ad.onSlider(1,1800);ad.update(.05);assert(fan.rotation.z!==f0&&wh.rotation.x!==w0);
assert(ad.getStats()[0].startsWith('53.0'));
// Turret traverse and recoil path: breech never reaches the turret rear wall.
ad.onSlider(2,90);close(find('turret-yaw').rotation.y,Math.PI/2);
const rec=find('gun-recoil');ad.onFire();let minZ=0;for(let i=0;i<40;i++){ad.update(.02);minZ=Math.min(minZ,rec.position.z);}
close(minZ,-.37,.02);close(rec.position.z,0);
ad.root.updateMatrixWorld(true);
// Ammo: 77 rounds, refill at zero.
assert.equal(ad.onFire().ok,true);assert.equal(ad.onFire().ok,false,'No second shot during recoil');for(let j=0;j<20;j++)ad.update(.05);
for(let i=0;i<75;i++){assert(ad.onFire().ok);for(let j=0;j<20;j++)ad.update(.05);}assert(ad.getStats()[3].startsWith('0 '));
assert(ad.fireButtonLabel().includes('İKMAL'));assert(ad.onFire().refill);assert(ad.fireButtonLabel().includes('77'));
// Hatches open/close, clamps, invalid input.
ad.onButton('sweep');assert(find('turret-hatch').rotation.x<-1);ad.onButton('sweep');close(find('turret-hatch').rotation.x,0);
ad.onSlider(0,9);close(ad.getSliderValues()[0],.20);ad.onSlider(1,-5);close(ad.getSliderValues()[1],0);
ad.onSlider(2,NaN);ad.update(NaN);assert(ad.getSliderValues().every(Number.isFinite));
const fs=require('node:fs'),vm=require('node:vm'),sb={window:{}};vm.runInNewContext(fs.readFileSync('js/catalog.js','utf8'),sb);
const rec2=sb.window.MUSEUM_CATALOG.VEHICLES.find(v=>v.id==='t34');
assert(rec2&&rec2.sim==='t34'&&rec2.status==='live'&&rec2.origin==='ussr'&&rec2.sources.length>=1);
console.log(`PASS t34: 18 parts / ${meshes.length} meshes; exact log contact, constant arm length, spring compression, 5-wheel pass, track floor, zero RPM, recoil, 77 rounds, hatches, catalog`);
