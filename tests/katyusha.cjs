const {common,assert}=require('./model-harness.cjs');const {ad,meshes}=common('katyusha',18);
assert.equal(ad.onFire().ok,true);for(let i=0;i<120;i++)ad.update(.05);assert.match(ad.getStats()[2],/^0 /);assert.equal(ad.onFire().refill,true);
ad.onSlider(0,30);assert.equal(ad.onFire().ok,false);assert.equal(ad.buttonActive('terrain'),false);ad.onButton('terrain');assert.equal(ad.getSliderValues()[0],0);
for(const a of [5,45]){ad.onSlider(2,a);ad.update(.05);assert.equal(ad.getSliderValues()[2],a);}ad.onSlider(1,7);ad.update(.05);assert.equal(ad.getSliderValues()[1],7);
console.log(`PASS Katyusha: 18 groups, ${meshes.length} meshes, tours/finishes/finite geometry, salvo/refill, jack interlock, angle controls`);
