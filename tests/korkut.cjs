const { common, assert, THREE } = require('./model-harness.cjs');
const { ad, meshes } = common('korkut', 19);

// Kule azimut ve 5:1 pinyon dönüşü
ad.onSlider(0, 90);
ad.onSlider(1, 45);
ad.root.updateMatrixWorld(true);
const turretYawGrp = ad.parts.turretShell.parent;
const gunPivot = ad.parts.gunCradle.parent;
assert.ok(Math.abs(turretYawGrp.rotation.y + Math.PI / 2) < 1e-6);
assert.ok(Math.abs(gunPivot.rotation.x + Math.PI / 4) < 1e-6);

// ATOM konisinin namlu açısıyla aynı ebeveyn altında (gunPivot) hizalı olduğu
assert.equal(ad.parts.tungstenCone.parent, gunPivot);

// Tarama hızı = 0 iken sensörlerin tamamen durması
ad.onSlider(2, 0);
ad.update(1.0);
assert.equal(ad.parts.trackingRadar.children[0].rotation.y, 0);
assert.equal(ad.parts.eotsTurret.children[0].rotation.y, 0);

// Mod geçişi (ATOM <-> HEI-T)
const cloudGrp = ad.parts.tungstenCone.children[0];
assert.equal(cloudGrp.visible, true);
ad.onButton('mode');
assert.equal(cloudGrp.visible, false);
assert.equal(ad.getStats()[1], 'HEI-T');
ad.onButton('mode');
assert.equal(cloudGrp.visible, true);

// İkiz namlu salvo & mühimmat ikmali
const ammoBefore = Number(ad.getStats()[3]);
assert.equal(ad.onFire().ok, true);
assert.equal(Number(ad.getStats()[3]), ammoBefore - 20);
assert.notEqual(ad.parts.leftGun.children[0].position.z, 0);
while (Number(ad.getStats()[3]) > 0) ad.onFire();
assert.equal(Number(ad.getStats()[3]), 0);
assert.equal(ad.onFire().resupplied, true);
assert.equal(Number(ad.getStats()[3]), 400);

// Sınır dışı ve NaN koruması
ad.onSlider(0, 999);
assert.equal(ad.getSliderValues()[0], 180);
ad.onSlider(1, -999);
assert.equal(ad.getSliderValues()[1], -10);
ad.onSlider(2, NaN);
assert.equal(ad.getSliderValues()[2], 0);

ad.onButton('sweep');
assert.deepEqual(Array.from(ad.getSliderValues()), [14, 28, 60]);

const enRes = common('korkut', 19, { window: { MuseumPreferences: { language: 'en' } } });
assert.notEqual(enRes.ad.ui.sub, ad.ui.sub);
assert.notEqual(enRes.ad.modeLabel(), ad.modeLabel());
console.log(`PASS korkut: 19 groups, ${meshes.length} meshes, yaw/elev/ATOM alignment, zero-scan idle, dual-feed mode & TR/EN`);
