const { common, assert } = require('./model-harness.cjs');
const { ad, meshes } = common('mahmudiye', 17);
const get = name => ad.root.getObjectByName(name);
const hatches = ad.parts.battery1_0.children[0].children.filter(o => o.type === 'Group');
assert.equal(hatches.length, 16);
for (let value = 0; value <= 100; value++) {
  ad.onSlider(0, value);
  for (const hatch of hatches) assert(Math.abs(hatch.rotation.z - value * Math.PI / 100) < 1e-9);
  assert.equal(ad.getSliderValues()[1], 65);
  assert.equal(ad.getSliderValues()[2], 65);
}
ad.onButton('terrain');
assert(!get('side-1').visible && get('side--1').visible);
assert(!get('ports-1-0').visible && get('ports--1-0').visible);
ad.onFire();
assert(!get('canvas').visible);
ad.onButton('sweep');
assert(get('canvas').visible && get('side-1').visible);
assert.equal(ad.getSliderValues().join(','), '65,65,65');
console.log('PASS Mahmudiye: 17 groups, '+meshes.length+' meshes, 101 hatch settings, independent decks, section, sails and reset');
