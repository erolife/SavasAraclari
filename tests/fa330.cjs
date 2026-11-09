const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('fa330',23),find=n=>ad.root.getObjectByName(n);
const close=(a,b)=>assert(Math.abs(a-b)<1e-5,`${a} != ${b}`);
const craft=find('aircraft-pose'),rotor=find('free-rotor'),tilt=find('rotor-tilt');
// Lofted surfaces must face outwards, not expose only their far-side interiors.
assert(ad.parts.hull.children[0].geometry.attributes.normal.getX(0)>0);
assert(find('blade-0').children[0].geometry.attributes.normal.getZ(17)>0);
assert.equal(ad.ui.sliders.length,3);assert.equal(Object.keys(ad.camPresets).length,6);
assert.equal(ad.parts.blades.children.length,3);
const cables=ad.parts.cable.children.slice(1),first=cables[0],last=cables[62];
function endpoint(o,y){return o.localToWorld(new T.Vector3(0,y,0));}
for(let pose=0;pose<=100;pose++){
 ad.onSlider(0,pose);ad.root.updateMatrixWorld(true);
 close(craft.position.y,1.15+pose*.03);close(craft.position.z,-2-pose*.04);
 close(endpoint(first,-.5).distanceTo(new T.Vector3(0,1.70,.85)),0);
 close(endpoint(last,.5).distanceTo(find('tow-anchor').getWorldPosition(new T.Vector3())),0);
 for(let i=0;i<31;i++)close(endpoint(cables[i*2],.5).distanceTo(endpoint(cables[(i+1)*2],-.5)),0);
 for(const angle of [-8,0,8]){
  ad.onSlider(2,angle);ad.root.updateMatrixWorld(true);close(tilt.rotation.x,angle*Math.PI/180);
  const rotorBounds=new T.Box3().setFromObject(ad.parts.blades);
  const tailBounds=new T.Box3().setFromObject(ad.parts.tail);
  assert(rotorBounds.min.y>tailBounds.max.y,'Rotor must clear tail, including both tilt limits');
  assert(rotorBounds.max.z<3.20,'Rotor must clear conning tower and ladder');
 }
}
ad.onSlider(0,0);ad.root.updateMatrixWorld(true);
close(new T.Box3().setFromObject(ad.parts.skids).min.y,1.15);
for(let a=0;a<360;a+=10)for(const angle of [-8,8]){
 rotor.rotation.y=a*Math.PI/180;ad.onSlider(2,angle);ad.root.updateMatrixWorld(true);
 assert(new T.Box3().setFromObject(ad.parts.blades).min.y>new T.Box3().setFromObject(ad.parts.tail).max.y);
}
// Main mast must sit behind the backrest, not through the observer's cushion.
const mainMast=ad.parts.mast.children[0];
assert(new T.Box3().setFromObject(mainMast).max.z<new T.Box3().setFromObject(ad.parts.seat).min.z);
ad.onFire();const r=rotor.rotation.y;ad.update(.05);assert(rotor.rotation.y!==r);
ad.onSlider(1,0);const stopped=rotor.rotation.y;ad.update(.05);close(rotor.rotation.y,stopped);
assert(!find('airflow-arrow').visible);
ad.onSlider(1,35);ad.onFire();ad.update(.05);close(rotor.rotation.y,stopped);
ad.onSlider(0,35);ad.onButton('terrain');ad.update(0);close(ad.getSliderValues()[0],35);
ad.update(.05);assert(ad.getSliderValues()[0]>35);assert(find('tow-drum').rotation.x!==0);
ad.onSlider(0,22);ad.update(.05);close(ad.getSliderValues()[0],22);assert(!ad.buttonActive('terrain'));
ad.onButton('sweep');assert(find('storage-lid').rotation.y<0);ad.root.updateMatrixWorld(true);
for(const x of [-1.25,1.25]){
 const hits=new T.Raycaster(new T.Vector3(x,1.47,2),new T.Vector3(0,0,1)).intersectObject(ad.parts.containers,true);
 assert(hits.length&&hits[0].distance>2.7,'Open storage lid must expose a hollow tube, not a solid end cap');
}
ad.onButton('sweep');close(find('storage-lid').rotation.y,0);
ad.onSlider(0,-500);close(ad.getSliderValues()[0],0);ad.onSlider(1,500);close(ad.getSliderValues()[1],100);
ad.onSlider(2,Infinity);ad.update(NaN);assert(ad.getSliderValues().every(Number.isFinite));
// Cable animation must reuse buffers across repeated poses.
const geos=meshes.map(m=>m.geometry);for(let i=0;i<200;i++){ad.onSlider(0,i%101);ad.update(.016);}
meshes.forEach((m,i)=>assert.equal(m.geometry,geos[i]));
const fs=require('node:fs'),vm=require('node:vm'),sandbox={window:{}};
vm.runInNewContext(fs.readFileSync('js/catalog.js','utf8'),sandbox);
const record=sandbox.window.MUSEUM_CATALOG.VEHICLES.find(v=>v.id==='fa330');
assert(record&&record.sim==='fa330'&&record.status==='live');assert.equal(record.sources.length,3);
assert.equal(record.energy[0],'airflow');assert.equal(record.role[0],'intelligence');
assert(sandbox.window.MUSEUM_CATALOG.FACETS.find(f=>f.key==='energy').options.some(o=>o.key==='airflow'));
console.log(`PASS fa330: 23 parts / ${meshes.length} meshes; 101 cable poses, tilt/rotor/tower clearance, deck contact, zero speed, pause, manual override, lids, buffer reuse, catalog`);
