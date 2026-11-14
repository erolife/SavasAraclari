const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('corvus',12), get=n=>ad.root.getObjectByName(n);
const hinge=get('bridge-hinge'), rope=ad.parts.rope.children[0];
for(let lift=0;lift<=75;lift++)for(const turn of [-30,0,30]){
  ad.onSlider(0,lift);
  ad.onSlider(1,turn);
  const end=hinge.localToWorld(new T.Vector3(0,.10,4.83));
  const upper=rope.localToWorld(new T.Vector3(0,.5,0));
  const lower=rope.localToWorld(new T.Vector3(0,-.5,0));
  assert(upper.distanceTo(end)<1e-7);
  assert(lower.distanceTo(new T.Vector3(0,5.34,6.3))<1e-7);
}
ad.onFire();
assert(!get('neighbor').visible&&!get('neighbor-stands').visible);
ad.onSlider(2,0);
assert(!get('sail').visible);
ad.onButton('sweep');
assert(get('neighbor').visible&&get('sail').visible);
assert.equal(ad.getSliderValues().join(','),'55,0,1');
console.log('PASS Corvus: 12 groups, '+meshes.length+' meshes, 228 connected rope poses, toggles and reset');
