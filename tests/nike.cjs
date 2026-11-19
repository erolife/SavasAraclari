const { common, assert, THREE } = require('./model-harness.cjs');
const { ad, meshes } = common('nike', 17);

// 0..85 derece boyunca hidrolik silindir bağlantı uçlarının mafsallarda kalması kontrol edilir
for (const deg of [0, 20, 45, 65, 85]) {
  ad.onSlider(0, deg);
  ad.root.updateMatrixWorld(true);

  const railPivot = ad.parts.launchRail.parent;
  const erector = ad.parts.erectorCylinders;
  // Sol silindir: children[0] barrelG (taban), children[1] rodG (rampa ucunda)
  const barrelPos = erector.children[0].position;
  const rodPos = erector.children[1].position;
  const mountLocal = new THREE.Vector3(-0.52, -0.10, 2.35);
  const mountWorld = mountLocal.applyMatrix4(railPivot.matrixWorld);
  assert.ok(rodPos.distanceTo(mountWorld) < 1e-4, `rod remains attached at ${deg}°`);
  assert.ok(rodPos.distanceTo(barrelPos) > 0.5, 'valid cylinder span');
}

// < 45 derecede fırlatma kilitli olmalı
ad.onSlider(0, 30);
assert.equal(ad.onFire().ok, false, 'launch blocked below 45°');

// >= 45 derecede fırlatma ve kademe ayrılma testi
ad.onSlider(0, 60);
const beforeZ = ad.parts.sustainerHull.parent.position.z;
assert.equal(ad.onFire().ok, true);
assert.ok(ad.parts.sustainerHull.parent.position.z > beforeZ + 1.0, 'stage 2 separates axially');

// Kademe ayrılma kaydırıcısı testi
ad.onButton('sweep');
const restZ = ad.parts.sustainerHull.parent.position.z;
ad.onSlider(1, 100);
assert.ok(ad.parts.sustainerHull.parent.position.z > restZ + 1.7, 'stage separation slider shifts sustainer');

// Elevon açısı testi
ad.onSlider(2, 20);
assert.ok(Math.abs(ad.parts.elevons.children[0].children[0].rotation.x - (20 * Math.PI) / 180) < 1e-6);

// Sınır dışı & NaN koruması
ad.onSlider(0, 999);
assert.equal(ad.getSliderValues()[0], 85);
ad.onSlider(2, -999);
assert.equal(ad.getSliderValues()[2], -20);
ad.onSlider(1, NaN);
assert.equal(ad.getSliderValues()[1], 100);

ad.onButton('sweep');
assert.deepEqual(Array.from(ad.getSliderValues()), [58, 0, 0]);

const enRes = common('nike', 17, { window: { MuseumPreferences: { language: 'en' } } });
assert.notEqual(enRes.ad.ui.sub, ad.ui.sub);
assert.notEqual(enRes.ad.ui.sliders[0].label, ad.ui.sliders[0].label);
console.log(`PASS nike: 17 groups, ${meshes.length} meshes, 0..85° hydraulic attachment, <45° safety lock, staging & TR/EN`);
