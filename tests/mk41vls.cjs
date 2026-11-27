const { common, assert, THREE } = require('./model-harness.cjs');
const { ad, meshes } = common('mk41vls', 18);

// 1. Zemin teması (alt kaide min.y === 0.000)
ad.root.updateMatrixWorld(true);
const rootBox = new THREE.Box3().setFromObject(ad.root);
assert.ok(Math.abs(rootBox.min.y) < 0.005, `min.y=${rootBox.min.y}`);

// 2. Hücre seçimi + kapak inceleme açısı yalnız seçili hücre ve merkez baca kapağını açar
ad.onSlider(0, 3);
ad.onSlider(1, 100);
assert.ok(Math.abs(ad.hatchPivots[2].pivot.rotation.z) > 1.2);
assert.equal(ad.hatchPivots[0].pivot.rotation.z, 0);
assert.ok(Math.abs(ad.uptakePivot.rotation.z) > 1.2);

ad.onSlider(1, 0);
assert.equal(ad.hatchPivots[2].pivot.rotation.z, 0);
assert.equal(ad.uptakePivot.rotation.z, 0);

// 3. Fırlatma hızı %0 iken füze yükselmez; %75'te yükselir
ad.onSlider(2, 0);
assert.equal(ad.onFire().ok, true);
const cell3Y0 = ad.missilePivots[2].position.y;
for (let i = 0; i < 6; i++) ad.update(0.05);
assert.equal(ad.missilePivots[2].position.y, cell3Y0);

ad.onSlider(2, 80);
for (let i = 0; i < 14; i++) ad.update(0.05);
assert.ok(ad.missilePivots[2].position.y > cell3Y0 + 0.5, `missileY=${ad.missilePivots[2].position.y}`);
assert.ok(Math.abs(ad.uptakePivot.rotation.z) > 1.0, 'uptake hatch must open during launch');

// Fırlatma bitişi
for (let i = 0; i < 25; i++) ad.update(0.05);
assert.equal(ad.getStats()[3], '7 / 8');

// 4. Tekli <-> 2'li Salvo ve 8/8 -> 0/8 -> 8/8 ikmal
ad.onButton('mode');
assert.equal(ad.onFire().ok, true);
for (let i = 0; i < 40; i++) ad.update(0.05);
assert.equal(ad.getStats()[3], '5 / 8');

for (let k = 0; k < 3; k++) {
  assert.equal(ad.onFire().ok, true);
  for (let i = 0; i < 40; i++) ad.update(0.05);
}
assert.equal(ad.getStats()[3], '0 / 8');
const resupply = ad.onFire();
assert.equal(resupply.resupplied, true);
assert.equal(ad.getStats()[3], '8 / 8');

// 5. Sınır dışı / NaN koruması, reset ve TR/EN çift dil
ad.onSlider(0, 99);
assert.equal(ad.getSliderValues()[0], 8);
ad.onSlider(1, -20);
assert.equal(ad.getSliderValues()[1], 0);
ad.onSlider(2, NaN);
assert.equal(ad.getSliderValues()[2], 80);
ad.onButton('sweep');
assert.deepEqual(Array.from(ad.getSliderValues()), [1, 0, 75]);

const enRes = common('mk41vls', 18, { window: { MuseumPreferences: { language: 'en' } } });
assert.notEqual(enRes.ad.ui.sub, ad.ui.sub);
assert.notEqual(enRes.ad.modeLabel(), ad.modeLabel());
assert.notEqual(enRes.ad.ui.buttons.terrain, ad.ui.buttons.terrain);

console.log(`PASS mk41vls: 18 groups, ${meshes.length} meshes, min.y=0, hatch/uptake sync, 0%-speed freeze, salvo & 8-cell refill & TR/EN`);
