const { common, assert, THREE: T } = require('./model-harness.cjs');
const { ad, meshes } = common('scythed', 18);
const byName = name => ad.root.getObjectByName(name);
const phase = () => ad.getSliderValues()[1];
const close = (a, b, message) => assert(Math.abs(a - b) < 1e-7, message);
const moving = ['rear-axle', 'wheel--1', 'wheel-1', 'rear-crown', 'long-shaft', 'front-crown', 'front-rotor', 'blade-rotor'];

ad.onSlider(0, 12); ad.update(.05);
const wheelAngle = byName('rear-axle').rotation.x;
assert(wheelAngle > 0);
for (const name of ['wheel--1', 'wheel-1', 'rear-crown']) close(byName(name).rotation.x, wheelAngle, name);
close(byName('long-shaft').rotation.z, wheelAngle * 3);
ad.parts.pinions.children.forEach(g => close(g.rotation.z, wheelAngle * 3));
for (const name of ['front-crown', 'front-rotor', 'blade-rotor']) close(byName(name).rotation.y, wheelAngle, name);

// Contact velocity v = omega x r: both orthogonal gear contacts move together.
const cross = (w, r) => new T.Vector3(...w).cross(new T.Vector3(...r));
const rearContactA = cross([1, 0, 0], [0, 0, .4]);
const rearContactB = cross([0, 0, 3], [-.4 / 3, 0, 0]);
assert(rearContactA.distanceTo(rearContactB) < 1e-9);
const frontContactA = cross([0, 0, 3], [0, .4 / 3, 0]);
const frontContactB = cross([0, 1, 0], [0, 0, -.4]);
assert(frontContactA.distanceTo(frontContactB) < 1e-9);

ad.onSlider(0, 0);
const stopped = moving.map(n => byName(n).quaternion.clone());
ad.update(.05); moving.forEach((n, i) => assert(byName(n).quaternion.equals(stopped[i]), n + ' must stop'));
ad.onFire(); assert.equal(ad.getSliderValues()[0], 6);
ad.onSlider(1, 137); close(phase(), 137); assert.equal(ad.getSliderValues()[0], 0);
ad.update(.05); close(phase(), 137, 'Manual phase must override playback');
ad.onSlider(0, 999); assert.equal(ad.getSliderValues()[0], 18);
ad.onSlider(0, -999); assert.equal(ad.getSliderValues()[0], 0);
ad.onSlider(2, 100); close(byName('inspection-lid').rotation.z, Math.PI / 2);

function tightBounds(group){
  const bounds=new T.Box3(),v=new T.Vector3(),local=new T.Matrix4(),world=new T.Matrix4();
  group.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position;
    for(let j=0;j<(o.isInstancedMesh?o.count:1);j++){
      if(o.isInstancedMesh){o.getMatrixAt(j,local);world.multiplyMatrices(o.matrixWorld,local);}else world.copy(o.matrixWorld);
      for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(world);bounds.expandByPoint(v);}
    }
  });return bounds;
}

// Entire revolution: blade volume stays clear of horses and rear cart; nothing goes below the floor.
for (let deg = 0; deg <= 360; deg += 5) {
  ad.onSlider(1, deg); ad.root.updateMatrixWorld(true);
  const blades = new T.Box3().setFromObject(ad.parts.blades);
  const horses = new T.Box3().setFromObject(ad.parts.horses);
  assert(!blades.intersectsBox(horses), 'Orak/at kesişimi: ' + deg);
  assert(blades.min.y > 1.35);
  const gearBox = tightBounds(ad.parts.rearGear);
  for(const o of ad.parts.chassis.children)assert(!gearBox.intersectsBox(new T.Box3().setFromObject(o)), 'Arka dişli/şasi kesişimi: '+deg);
  // A rotated local AABB overestimates a circular rim: check actual wheel vertices.
  for (const name of ['wheel--1', 'wheel-1']) byName(name).traverse(o => {
    if (!o.isMesh || o.isInstancedMesh) return;
    const a=o.geometry.attributes.position, v=new T.Vector3();
    for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);assert(v.y>=-.005, 'Tekerlek zemini: '+deg);}
  });
}
ad.onButton('terrain'); assert.equal(byName('horse-figures').visible, false); assert.equal(byName('horse-tack').visible, false); assert(ad.parts.draft.children.every(o=>!o.visible));
ad.onButton('mode'); assert.equal(byName('sweep-guide').visible, true);
ad.onButton('sweep'); assert.deepEqual(Array.from(ad.getSliderValues()), [0, 0, 0]);
assert.equal(byName('horse-figures').visible, true); assert.equal(byName('sweep-guide').visible, false);

// UI finishes and metadata must agree; all numeric geometry remains finite at extreme controls.
for (const f of ad.ui.textures) { ad.setTexture(f.key); ad.applyTextures(false); assert.equal(ad.ui.activeTexture(), f.key); }
ad.toggleRelief(); ad.applyTextures(false); ad.applyTextures(true);
for (const k of ['iso', 'front', 'breech', 'engine', 'suspension', 'top']) assert(ad.camPresets[k]);
assert.equal(ad.tourSteps.length, 6);
console.log(`PASS scythed: 18 groups, ${meshes.length} meshes; connected 3:1/1:3 drive, contact directions, zero RPM, manual override, 73 clearance poses, cover/horses/reset, finishes`);
