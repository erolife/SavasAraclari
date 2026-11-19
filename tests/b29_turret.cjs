const { common, assert, THREE } = require('./model-harness.cjs');
const { ad, meshes } = common('b29_turret', 17);

// 150 m vs 900 m menzilde paralaks açı farkı doğrulanır
ad.onSlider(0, 15);
ad.onSlider(1, 5);
ad.onSlider(2, 150);
const delta150 = parseFloat(ad.getStats()[0]);
const upperYaw150 = ad.parts.upperDome.parent.rotation.y;

ad.onSlider(2, 900);
const delta900 = parseFloat(ad.getStats()[0]);
const upperYaw900 = ad.parts.upperDome.parent.rotation.y;

assert.ok(delta150 > delta900 * 3, `parallax delta at 150m (${delta150}) must exceed 900m (${delta900})`);
assert.ok(upperYaw150 !== upperYaw900, 'turret yaw adjusts with target range');

// Üst ve alt pinyonların azimut halkasına ters oranda dönmesi (5:1)
const upperPinion = ad.parts.upperRing.children.find(c => c.geometry?.type === 'CylinderGeometry');
assert.ok(Math.abs(upperPinion.rotation.y + ad.parts.upperDome.parent.rotation.y * 5) < 1e-6);

// Ateş kesici (kuyruk sektörü 140 derecede her iki taret de kilitlenmeli)
ad.onSlider(0, 140);
ad.onSlider(1, 0);
assert.equal(ad.onFire().ok, false, 'both turrets locked in tail sector');
assert.equal(ad.getStatus().color, '#dc2626');

// Yükseliş +16° iken yalnızca alt taret kesici altında (tek taret -8)
ad.onSlider(0, 18);
ad.onSlider(1, 16);
assert.equal(ad.onFire().ok, true);
assert.equal(Number(ad.getStats()[3]), 392);

// Yatay (0°, 0°) konumunda iki taret de serbest (-16) ve ikmal testi
ad.onSlider(0, 0);
ad.onSlider(1, 0);
const beforeAmmo = Number(ad.getStats()[3]);
assert.equal(ad.onFire().ok, true);
assert.equal(Number(ad.getStats()[3]), beforeAmmo - 16);

while (Number(ad.getStats()[3]) > 0) ad.onFire();
assert.equal(Number(ad.getStats()[3]), 0);
assert.equal(ad.onFire().resupplied, true);
assert.equal(Number(ad.getStats()[3]), 400);

// Sınır dışı ve NaN koruması
ad.onSlider(0, 999);
assert.equal(ad.getSliderValues()[0], 140);
ad.onSlider(2, -100);
assert.equal(ad.getSliderValues()[2], 150);
ad.onSlider(1, NaN);
assert.equal(ad.getSliderValues()[1], 0);

ad.onButton('sweep');
assert.deepEqual(Array.from(ad.getSliderValues()), [18, 16, 320]);

const enRes = common('b29_turret', 17, { window: { MuseumPreferences: { language: 'en' } } });
assert.notEqual(enRes.ad.ui.title, ad.ui.title);
console.log(`PASS b29_turret: 17 groups, ${meshes.length} meshes, parallax math (${delta150}°@150m vs ${delta900}°@900m), 5:1 pinion, ammo/resupply & TR/EN`);
