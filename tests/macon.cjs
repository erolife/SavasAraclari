const {common,load,THREE,assert}=require('./model-harness.cjs');
const {ad,meshes}=common('macon',48);
const bars=meshes.filter(o=>o.parent===ad.parts.trapeze),smallBars=meshes.filter(o=>o.parent===ad.parts.shipTrap);
function end(o,y){return o.localToWorld(new THREE.Vector3(0,y,0));}
function midpoint(o){return o.localToWorld(new THREE.Vector3());}
for(let i=0;i<=100;i++){
 ad.onSlider(1,i);ad.onSlider(2,i);ad.root.updateMatrixWorld(true);
 const large=ad.parts.largehook.parent,small=ad.parts.smallhook.parent;
 const hook=large.localToWorld(new THREE.Vector3(.04,.94,0)),smallHook=small.localToWorld(new THREE.Vector3(.04,.94,0));
 assert(hook.distanceTo(midpoint(bars[2]))<1e-8,'large hook stays on capture bar');
 assert(smallHook.distanceTo(midpoint(smallBars[2]))<1e-8,'small hook stays on capture bar');
 assert(Math.abs(bars[0].scale.y-3)<1e-8,'trapeze arms remain rigid');assert(Math.abs(bars[1].scale.y-3)<1e-8);
 assert(Math.abs(smallBars[0].scale.y-.5)<1e-8,'sixfold scale is maintained');
 assert(Math.abs(ad.parts.skin.parent.position.z-i*.012)<1e-8);
 const bounds=new THREE.Box3().setFromObject(large);assert(bounds.min.y>.20,'aircraft clears exhibit floor');
}
// Lowered aircraft is beneath the keel; recovered aircraft is above the hangar deck.
ad.onSlider(1,0);assert(ad.parts.smallfuselage.parent.position.y< -1);
ad.onSlider(1,100);assert(ad.parts.smallfuselage.parent.position.y>-.75);
ad.onButton('sweep');ad.onFire();ad.update(.05);assert.notEqual(ad.parts.prop1.parent.rotation.z,0);
ad.root.updateMatrixWorld(true);const axis=ad.parts.prop1.parent.localToWorld(new THREE.Vector3(0,0,1)).sub(ad.parts.prop1.parent.getWorldPosition(new THREE.Vector3())).normalize();assert(Math.abs(axis.x)>.999,'airship propeller thrust axis follows longitudinal hull');
ad.onSlider(0,0);const angle=ad.parts.prop1.parent.rotation.z;ad.onFire();ad.update(.05);assert.equal(ad.parts.prop1.parent.rotation.z,angle,'zero speed');ad.onSlider(2,NaN);assert.equal(ad.getSliderValues()[2],0);ad.onSlider(1,999);assert.equal(ad.getSliderValues()[1],100);
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[30,0,0]);
const en=load('macon',{window:{MuseumPreferences:{language:'en'}}}).ad;for(const p of Object.values(en.parts))assert(!/[çğıöşüÇĞİÖŞÜ]/.test(p.userData.name+p.userData.desc+p.userData.spec));
console.log('Macon: 48 groups, 387 meshes; 101 rigid-arm/hook/scale/clearance poses, longitudinal propulsion, reset and English verified.');
const fs=require('node:fs'),vm=require('node:vm'),sandbox={window:{}};
for(const file of ['catalog.js','catalog-en.js','catalog-source-en.js'])vm.runInNewContext(fs.readFileSync('js/'+file,'utf8'),sandbox);
const englishCatalog=sandbox.window.MuseumCatalogEnglish.translate(sandbox.window.MUSEUM_CATALOG);
for(const id of ['brennan','kerrison','macon']){
 const v=englishCatalog.VEHICLES.find(v=>v.id===id);assert(v&&v.status==='live');assert.equal(v.sources.length,3);assert.equal(v.modal.length,4);
 assert(!/[çğıöşüÇĞİÖŞÜ]/.test([v.name,v.sub,v.desc,...v.modal].join(' ')),'English catalog and plan modal');
}
