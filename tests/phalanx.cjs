const {common,assert,THREE}=require('./model-harness.cjs');
const {ad,meshes}=common('phalanx',18);
assert.equal(ad.root.visible,false);
const rotor=ad.parts.barrels.children[0];
ad.onFire();assert.equal(ad.getSliderValues()[0],24);ad.update(.05);const phase=rotor.rotation.z;assert(phase>0);
ad.onFire();ad.update(.05);assert.equal(rotor.rotation.z,phase);
ad.onButton('terrain');ad.update(.05);assert(ad.buttonActive('terrain'));
ad.onSlider(1,45);assert(!ad.buttonActive('terrain'));assert.equal(ad.getSliderValues()[1],45);
for(const yaw of [-150,0,150])for(const elev of [-10,5,70]){ad.onSlider(1,yaw);ad.onSlider(2,elev);ad.update(.05);const b=new THREE.Box3().setFromObject(ad.root);assert(b.min.y>=-.01);assert(Number.isFinite(b.max.z));}
ad.onSlider(0,1000);assert.equal(ad.getSliderValues()[0],60);ad.update(NaN);assert(Number.isFinite(rotor.rotation.z));
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,5]);
console.log(`PASS Phalanx: 18 groups, ${meshes.length} meshes, rotor start/stop, manual override, angle limits, ground clearance and reset`);
