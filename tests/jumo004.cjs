const { common, assert } = require('./model-harness.cjs');
const { ad, meshes } = common('jumo004', 21);
const get = name => ad.root.getObjectByName(name);
const rotors = [-1,1].flatMap(side=>[get('compressor-'+side),get('turbine-'+side)]);
for(const side of [-1,1]) {
  const rotor=get('compressor-'+side);
  assert.equal(rotor.children.find(x=>x.isInstancedMesh).count,8*19);
  assert.equal(ad.parts['combustion'+side].children.length,6*4);
}
ad.onFire();
for(let i=0;i<120;i++) {
  ad.update(.016);
  for(const rotor of rotors) assert.equal(rotor.rotation.z,rotors[0].rotation.z);
}
assert(rotors[0].rotation.z>0);
ad.onSlider(0,0);
const angle=rotors[0].rotation.z;
ad.update(.016);
assert.equal(rotors[0].rotation.z,angle);
for(let position=0;position<=100;position++) {
  ad.onSlider(1,position);
  ad.onSlider(2,position);
  assert.equal(get('cover-1').position.x,-get('cover--1').position.x);
  assert.equal(get('needle-1').position.z,get('needle--1').position.z);
}
assert.equal(get('cover-1').position.y,1.1);
assert(Math.abs(get('needle-1').position.z+3.43)<1e-9);
ad.onButton('terrain');
assert.equal(get('canopy').position.y,.77);
ad.onButton('sweep');
assert.equal(get('canopy').position.y,0);
assert.equal(get('cover-1').position.y,0);
assert.equal(rotors[0].rotation.z,0);
console.log('PASS Jumo 004: 21 groups, '+meshes.length+' meshes, rotor synchrony, zero speed, eight stages, six chambers, 101 cover/nozzle positions and reset');
