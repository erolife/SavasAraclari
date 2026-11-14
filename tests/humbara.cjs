const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('humbara',12),get=n=>ad.root.getObjectByName(n);
const cord=get('plumb'), casting=get('mortar-display');
for(let angle=0;angle<=90;angle++){
  ad.onSlider(0,angle);
  const pivot=cord.localToWorld(new T.Vector3(0,0,0));
  const end=cord.localToWorld(new T.Vector3(0,-.81,0));
  assert(Math.abs(end.distanceTo(pivot)-.81)<1e-7);
  assert.equal(ad.getSliderValues()[0],angle);
  assert.equal(casting.rotation.x,.64);
}
ad.onSlider(1,25);
assert.equal(casting.rotation.y,get('casting-details').rotation.y);
ad.onSlider(0,NaN);
assert.equal(ad.getSliderValues()[0],90);
ad.onFire();
assert(get('museum-cover').visible);
ad.onButton('sweep');
assert(!get('museum-cover').visible);
assert.equal(ad.getSliderValues().join(','),'35,0,0');
console.log('PASS Humbara: 12 groups, '+meshes.length+' meshes, 91 plumb positions, separate exhibits and reset');
