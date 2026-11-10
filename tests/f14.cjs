const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('f14',17),find=n=>ad.root.getObjectByName(n);
const close=(a,b,e=1e-4)=>assert(Math.abs(a-b)<e,`${a} != ${b}`);
assert.equal(ad.ui.sliders.length,3);assert.equal(Object.keys(ad.camPresets).length,6);

// Outward normals check on fuselage and outer wing upper/lower faces.
const wingGeo=find('pivot-L').children[0].geometry;
let maxNy=-1,minNy=1;for(let i=0;i<wingGeo.attributes.normal.count;i++){const ny=wingGeo.attributes.normal.getY(i);maxNy=Math.max(maxNy,ny);minNy=Math.min(minNy,ny);}
assert(maxNy>.9&&minNy<-.9,'Wing loft must have outward +Y and -Y normals');

// Grounded rest pose (Mach = 0): nose & main landing gear sit cleanly on y = 0.000 m.
ad.onSlider(1,0);ad.onSlider(0,20);ad.root.updateMatrixWorld(true);
close(new T.Box3().setFromObject(ad.parts.gearNose).min.y,0,1e-4);
close(new T.Box3().setFromObject(ad.parts.gearMain).min.y,0,1e-4);

// Exact symmetric sweep & wingspan at 20°, 68°, and 75° (ground park), plus vertical clearance over stabilators and lateral clearance from twin tails!
const spanAt=deg=>{
  ad.onSlider(0,deg);ad.root.updateMatrixWorld(true);
  const pL=find('pivot-L'),pR=find('pivot-R');
  close(pL.rotation.y,-pR.rotation.y,1e-7);
  close(pL.rotation.y,(deg-20)*Math.PI/180,1e-7);
  const bL=new T.Box3().setFromObject(ad.parts.wingL,true),bR=new T.Box3().setFromObject(ad.parts.wingR,true);
  close(bL.max.x,-bR.min.x,1e-4);
  const bStab=new T.Box3().setFromObject(ad.parts.stabs),finMaxX=new T.Box3().setFromObject(find('fin-L')).max.x;
  assert(bL.min.y>bStab.max.y+.30,`Swept wing must stay >30 cm above horizontal stabilators at ${deg}°`);
  const wm=find('pivot-L').children[0],pos=wm.geometry.attributes.position,v=new T.Vector3();
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(wm.matrixWorld);if(v.z<-5.2)assert(v.x>finMaxX+.8,`Wing must clear vertical tail laterally at ${deg}° (got x=${v.x}, z=${v.z})`);}
  return bL.max.x-bR.min.x;
};
const sp20=spanAt(20),sp68=spanAt(68),sp75=spanAt(75);
close(sp20,19.54,.03);
close(sp68,11.66,.05);
close(sp75,9.99,.10);
assert(sp20>sp68&&sp68>sp75);

// 75° oversweep lockout in flight: setting Mach > 0 clamps 75° -> 68°, and slider 0 cannot exceed 68° while airborne.
ad.onSlider(1,.8);
close(ad.getSliderValues()[0],68,1e-5);
ad.onSlider(0,75);
close(ad.getSliderValues()[0],68,1e-5);
assert(!find('nose-gear-strut').visible&&!find('main-gear-L').visible,'Landing gear retracts when Mach > 0');

// Supersonic intake ramps: 0° at Mach <= 1.0, monotone deflection for Mach > 1.0.
ad.onSlider(1,.9);close(find('intake-ramp-L').rotation.x,0,1e-6);
ad.onSlider(1,1.6);const r16=find('intake-ramp-L').rotation.x;assert(r16>.08);
ad.onSlider(1,2.2);const r22=find('intake-ramp-L').rotation.x;assert(r22>r16);
close(r22,find('intake-ramp-R').rotation.x,1e-7);

// Automatic wing-sweep schedule + manual override + geometry buffer reuse.
const geos=meshes.map(m=>m.geometry);
ad.onButton('terrain');assert(ad.buttonActive('terrain'));
ad.onSlider(1,.4);ad.update(.05);close(ad.getSliderValues()[0],20,1e-3);
ad.onSlider(1,.9);ad.update(.05);close(ad.getSliderValues()[0],44,.5);
ad.onSlider(1,1.6);ad.update(.05);close(ad.getSliderValues()[0],68,1e-3);
ad.onSlider(0,35);assert(!ad.buttonActive('terrain'),'Manual wing sweep slider must disengage auto-sweep');
close(ad.getSliderValues()[0],35,1e-5);

// Throttle 0% stops fans completely; >=92% opens nozzles and lights afterburners.
ad.onSlider(2,0);
const fanL=find('fan-L'),f0=fanL.rotation.z;
ad.update(.05);ad.update(.05);close(fanL.rotation.z,f0,1e-7);
assert(!find('ab-flame-L').visible);
ad.onSlider(2,96);ad.update(.05);
assert(fanL.rotation.z!==f0&&find('ab-flame-L').visible&&find('ab-flame-R').visible);

// 6 x AIM-54 Phoenix launch sequence & refill.
for(let i=0;i<6;i++){
  const res=ad.onFire();assert(res.ok&&!res.refill);
  for(let k=0;k<40;k++)ad.update(.05);
}
assert.equal(ad.kinematics.state.ammo,0);
assert(!find('phoenix-0').visible&&!find('phoenix-5').visible);
assert(ad.fireButtonLabel().includes('İKMAL'));
assert(ad.onFire().refill);
assert.equal(ad.kinematics.state.ammo,6);
assert(find('phoenix-0').visible&&find('phoenix-5').visible);
meshes.forEach((m,i)=>assert.equal(m.geometry,geos[i],'No geometry reallocation allowed'));

// Canopy & speedbrake toggle + input clamps.
ad.onButton('sweep');assert(find('canopy-hinge').rotation.x<-.4&&find('speedbrake-upper').rotation.x>.4);
ad.onButton('sweep');close(find('canopy-hinge').rotation.x,0);
ad.onSlider(1,0);ad.onSlider(0,999);close(ad.getSliderValues()[0],75);
ad.onSlider(2,-50);close(ad.getSliderValues()[2],0);
ad.onSlider(0,NaN);ad.update(NaN);assert(ad.getSliderValues().every(Number.isFinite));

const fs=require('node:fs'),vm=require('node:vm'),sb={window:{}};vm.runInNewContext(fs.readFileSync('js/catalog.js','utf8'),sb);
const rec=sb.window.MUSEUM_CATALOG.VEHICLES.find(v=>v.id==='f14');
assert(rec&&rec.sim==='f14'&&rec.status==='live'&&rec.origin==='usa'&&rec.sources.length>=1);
console.log(`PASS f14: 17 parts / ${meshes.length} meshes; spans 20°=${sp20.toFixed(2)}m 68°=${sp68.toFixed(2)}m 75°=${sp75.toFixed(2)}m, stabilator/fin clearance, 75° flight lockout, ramps, AB, 6xAIM-54, catalog`);
