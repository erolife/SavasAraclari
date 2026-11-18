const { common, THREE, assert } = require('./model-harness.cjs');
const { ad, meshes } = common('yoroi', 32);
const start = ad.getSliderValues();
assert.deepEqual(Array.from(start), [0, 0, 0]);

function centre(part) {
  ad.root.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(part).getCenter(new THREE.Vector3());
}
const chest = centre(ad.parts.chest);
const helmet = centre(ad.parts.bowl);
const right = centre(ad.parts.waidate);
for (let i = 0; i <= 100; i++) {
  ad.onSlider(0, i);
  ad.onSlider(1, i);
  assert.equal(ad.getSliderValues()[0], i);
  assert.equal(ad.getSliderValues()[1], i);
  assert.ok(Math.abs(centre(ad.parts.chest).z - chest.z - .62 * i / 100) < 1e-5);
  assert.ok(Math.abs(centre(ad.parts.bowl).y - helmet.y - .60 * i / 100) < 1e-5);
  assert.ok(Math.abs(centre(ad.parts.waidate).x - right.x - .68 * i / 100) < 1e-5);
}
ad.onSlider(0, NaN);
assert.equal(ad.getSliderValues()[0], 100);
ad.onSlider(2, 200);
assert.equal(ad.getSliderValues()[2], 90);
ad.onSlider(2, -200);
assert.equal(ad.getSliderValues()[2], -90);
ad.onButton('sweep');
assert.deepEqual(Array.from(ad.getSliderValues()), [0, 0, 0]);
ad.onButton('terrain');
assert.equal(ad.parts.support.visible, false);
assert.equal(ad.parts.mannequin.visible, false);
ad.onButton('sweep');
assert.equal(ad.parts.support.visible, true);
assert.equal(ad.onFire().ok, true);
assert.equal(ad.getSliderValues()[0], 100);
ad.onFire();
assert.equal(ad.getSliderValues()[0], 0);
ad.onSlider(1, 75);
ad.update(.5);
assert.equal(ad.getSliderValues()[1], 75);
assert.ok(meshes.some(mesh => mesh.isInstancedMesh && mesh.count > 200));
const original = centre(ad.parts.chest);
ad.onButton('sweep');
assert.ok(centre(ad.parts.chest).distanceTo(original) < 1e-8);
console.log('PASS yoroi: 32 groups, 255 meshes, 101 separation/lift poses, clamps, reset, supports and instanced lacing');
