const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('kamov',15),get=n=>ad.root.getObjectByName(n);
const lower=get('lower-rotor'),upper=get('upper-rotor'),basket=get('basket');
assert.equal(lower.children.filter(o=>o.type==='Group').length,3);
assert.equal(upper.children.filter(o=>o.type==='Group').length,3);
assert(upper.position.y>lower.position.y);
ad.onFire();
for(let i=0;i<150;i++){
  ad.update(.016);
  assert(Math.abs(lower.rotation.y+upper.rotation.y-.6)<1e-8);
}
assert(lower.rotation.y>0);
ad.onSlider(0,0);
const stopped=lower.rotation.y;
ad.update(.05);
assert.equal(lower.rotation.y,stopped);
const cable=ad.parts.rescue.children[2];
for(let v=0;v<=100;v++){
  ad.onSlider(1,v);
  ad.onSlider(2,v);
  assert(Math.abs(cable.position.y-cable.scale.y/2-basket.position.y-.24)<1e-8);
  assert.equal(get('door-1').position.z,get('door--1').position.z);
  assert(new T.Box3().setFromObject(basket).min.y>.18);
}
ad.onButton('terrain');
assert.equal(get('cowling').position.x,2.8);
ad.onButton('sweep');
assert.equal(get('cowling').position.x,0);
assert.equal(lower.rotation.y,0);
assert.equal(ad.getSliderValues().join(','),'32,0,0');
console.log('PASS Kamov: 15 groups, '+meshes.length+' meshes, counter-rotation, zero speed, 101 cable/door positions, deck clearance and reset');
