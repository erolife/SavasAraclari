const { common, assert, THREE } = require('./model-harness.cjs');
const { ad, meshes } = common('wagenburg', 11);
const get = name => ad.root.getObjectByName(name);
const left=get('side--1'), right=get('side-1'), rear=get('tailgate');
for(let value=0;value<=100;value++) {
  ad.onSlider(0,value);
  ad.onSlider(1,value);
  assert.equal(left.rotation.z,-right.rotation.z);
  assert(left.rotation.z<=0 && rear.rotation.x<=0);
  ad.root.updateMatrixWorld(true);
  assert(new THREE.Box3().setFromObject(rear).min.y>.15);
}
const near=get('neighbor-1'), far=get('neighbor--1');
assert(!near.visible && !far.visible);
ad.onFire();
for(const gap of [0,30,100]) {
  ad.onSlider(2,gap);
  assert(near.visible && far.visible);
  assert.equal(near.position.z,-far.position.z);
  assert(Math.abs(near.position.z-(4.59+gap*.018))<1e-9);
}
ad.onButton('terrain');
assert(!get('roof-cloth').visible);
ad.onButton('sweep');
assert(!near.visible && get('roof-cloth').visible);
assert.equal(ad.getSliderValues().join(','),'0,0,30');
console.log('PASS Wagenburg: 11 groups, '+meshes.length+' meshes, 101 panel/ramp states, formation, ground clearance and reset');
