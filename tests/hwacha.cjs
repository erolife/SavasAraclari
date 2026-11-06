const { common, assert, THREE: T } = require('./model-harness.cjs');
const { ad, meshes } = common('hwacha', 18);
const count = () => Number.parseInt(ad.getStats()[0]);
const close = (a, b) => assert(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
const arrows = meshes.filter(o => o.isInstancedMesh && o.instanceMatrix.count === 100);
assert.equal(arrows.length, 6);
const elevation = ad.root.getObjectByName('elevation');
const brace = ad.parts.brace.children[0];

// Raycast all 200 holes: empty space must actually pass through each plank.
ad.onSlider(1, 10); ad.root.updateMatrixWorld(true);
for (const name of ['front', 'rear']) {
  const planks = ad.parts[name].children;
  assert.equal(planks.reduce((sum, o) => sum + o.userData.apertures, 0), 100);
  for (let row = 0; row < 10; row++) for (let col = 0; col < 10; col++) {
    const plank = planks[row];
    const origin = plank.localToWorld(new T.Vector3((col - 4.5) * .14, 0, 1));
    const direction = new T.Vector3(0, 0, -1).transformDirection(plank.matrixWorld);
    assert.equal(new T.Raycaster(origin, direction).intersectObject(plank).length, 0, 'Blocked aperture');
    const solid = plank.localToWorld(new T.Vector3((col - 4.5) * .14, .06, 1));
    assert(new T.Raycaster(solid, direction).intersectObject(plank).length > 0, 'Missing wooden web');
  }
}
// Articulation: support endpoints remain on chassis and moving frame at every angle.
for (let angle = 10; angle <= 35; angle++) {
  ad.onSlider(1, angle); ad.root.updateMatrixWorld(true);
  close(elevation.rotation.x, -angle * Math.PI / 180);
  const a = brace.localToWorld(new T.Vector3(0, -.5, 0));
  const b = brace.localToWorld(new T.Vector3(0, .5, 0));
  assert(a.distanceTo(new T.Vector3(0, .82, -1.15)) < 1e-6);
  assert(b.distanceTo(ad.root.getObjectByName('brace-joint').getWorldPosition(new T.Vector3())) < 1e-6);
  const tail = elevation.localToWorld(new T.Vector3(0, -.63, -1.81));
  assert(tail.y > .5, 'Lowest arrow tail must clear the ground');
  for (const side of [-1, 1]) {
    const wheel = ad.root.getObjectByName('wheel-' + side);
    close(new T.Box3().setFromObject(wheel).min.y, 0);
    const wb = new T.Box3().setFromObject(wheel);
    const deck = new T.Box3().setFromObject(ad.parts.deck);
    assert(!wb.intersectsBox(deck), 'Deck must not penetrate wheels');
  }
}
ad.onButton('sweep');
ad.update(NaN); ad.update(-1); assert.equal(count(), 100);
ad.onFire(); for (let i = 0; i < 20; i++) ad.update(.05);
assert.equal(count(), 90); arrows.forEach(o => assert.equal(o.count, 90));
ad.onFire(); ad.update(.05); assert.equal(count(), 90, 'Pause must preserve remaining arrows');
ad.onFire(); ad.onSlider(1, 30); ad.update(.05); assert.equal(count(), 90, 'Manual controls override playback');
ad.onSlider(0, 2); ad.onFire(); for (let i = 0; i < 90; i++) ad.update(.05);
assert.equal(count(), 0); arrows.forEach(o => assert.equal(o.count, 0));
for (let i = 0; i < 50; i++) ad.update(.05);
assert.equal(count(), 0); assert(ad.fireButtonLabel().includes('100'));
assert(ad.onFire().refill); assert.equal(count(), 100);
ad.update(.05); assert.equal(count(), 100, 'Refill must not restart playback');
ad.onSlider(2, 100); assert.equal(ad.onFire().ok, false);
close(ad.parts.front.position.z, .8); close(ad.parts.rear.position.z, -.8);
ad.onSlider(2, 0); ad.onButton('terrain'); assert.equal(ad.onFire().ok, false);
arrows.forEach(o => assert.equal(o.visible, false));
ad.onButton('sweep'); arrows.forEach(o => assert(o.visible && o.count === 100));
assert.deepEqual(Array.from(ad.getSliderValues()), [1, 25, 0]);
ad.onSlider(0, 999); ad.onSlider(1, -999); ad.onSlider(2, 999);
assert.deepEqual(Array.from(ad.getSliderValues()), [2, 10, 100]);
ad.onSlider(0, NaN); ad.onSlider(1, Infinity); ad.onSlider(2, undefined);
assert.deepEqual(Array.from(ad.getSliderValues()), [2, 10, 100]);
// No display speed drift: ten simulated seconds consume exactly 100 at 1x.
ad.onButton('sweep'); ad.onFire(); for (let i = 0; i < 199; i++) ad.update(.05);
assert.equal(count(), 1); ad.update(.05); assert.equal(count(), 0);
console.log(`PASS Hwacha: 18 groups, ${meshes.length} meshes, 200 open apertures, 100 arrows, 26 angles, support continuity, ground/wheel clearance, pause/manual/refill/reset, finishes`);
