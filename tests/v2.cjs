const {common,assert,THREE}=require('./model-harness.cjs');const {ad,meshes}=common('v2',18);
for(const angle of [0,30,60,90]){ad.onSlider(0,angle);ad.update(.05);assert.equal(ad.getSliderValues()[0],angle);const b=new THREE.Box3().setFromObject(ad.root);assert(b.min.y>-.08);assert(Number.isFinite(b.max.y));}
ad.onButton('terrain');ad.update(.05);assert(ad.buttonActive('terrain'));ad.onSlider(0,40);ad.update(.05);assert.equal(ad.getSliderValues()[0],40);assert(!ad.buttonActive('terrain'));ad.onFire();assert.equal(ad.getSliderValues()[0],90);ad.onFire();assert.equal(ad.getSliderValues()[0],0);
console.log(`PASS V2: 18 groups, ${meshes.length} meshes, finishes/tours/finite geometry, ground clearance at 0/30/60/90, manual override, pose toggles`);
