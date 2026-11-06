const {common,assert,THREE}=require('./model-harness.cjs');const {ad,meshes}=common('huey',20);
const rotor=ad.parts.main.children[0],tail=ad.parts.tailRotor.children[0];
ad.onFire();ad.update(.05);assert(rotor.rotation.y>0);assert(tail.rotation.x<0);ad.onFire();const r=rotor.rotation.y;ad.update(.05);assert.equal(rotor.rotation.y,r);
ad.onButton('terrain');ad.update(.05);ad.onSlider(1,9);assert(!ad.buttonActive('terrain'));assert.equal(ad.getSliderValues()[1],9);
ad.onSlider(2,100);assert.equal(ad.parts.doors.children[0].position.z,-1.65);ad.onButton('sweep');assert(Math.abs(ad.parts.doors.children[0].position.z)<1e-9);
ad.update(NaN);assert(Number.isFinite(rotor.rotation.y));const b=new THREE.Box3().setFromObject(ad.parts.main);assert(b.max.x-b.min.x>14.69&&b.max.x-b.min.x<14.8);console.log(`PASS UH-1H: 20 groups, ${meshes.length} meshes, rotor stop/link, collective/manual override, doors/reset, 14.7m rotor`);
