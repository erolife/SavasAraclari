const { common, assert, THREE } = require('./model-harness.cjs');
const { ad, meshes } = common('gustav', 19);

// 1. Zemin teması kontrolü (balast tabanı min.y === 0.000)
ad.root.updateMatrixWorld(true);
const rootBox = new THREE.Box3().setFromObject(ad.root);
assert.ok(Math.abs(rootBox.min.y) < 0.005, `min.y=${rootBox.min.y}`);

// 2. Yükseliş ve 1.65 : 0.16 dişli yay-pinyon oranı
ad.onSlider(0, 48);
ad.root.updateMatrixWorld(true);
const elevPivot = ad.parts.gunCradle.parent;
assert.ok(Math.abs(elevPivot.rotation.x + (48 * Math.PI) / 180) < 1e-6);
const leftPinion = ad.parts.elevationDrive.children.find(c => c.name === 'pinion-left');
assert.ok(leftPinion, 'pinion-left missing');
assert.ok(Math.abs(leftPinion.rotation.x - ((48 * Math.PI) / 180) * (1.65 / 0.16)) < 1e-6);

// 3. Maksimum yükseliş (+48°) ve geri tepmede kuyruğun ray/köprü çakışması olmaması
const fireMaxElev = ad.onFire();
assert.equal(fireMaxElev.ok, true);
for (let i = 0; i < 4; i++) ad.update(0.05); // Geri tepme zirvesine yakın
ad.root.updateMatrixWorld(true);
const recoilSlide = ad.parts.barrelMain.parent;
assert.ok(recoilSlide.position.z < -0.1, `recoilZ=${recoilSlide.position.z}`);
const breechBox = new THREE.Box3().setFromObject(ad.parts.breechBlock);
assert.ok(breechBox.min.y > 0.25, `Breech must clear rails at +48 deg recoil: ${breechBox.min.y}`);

// Geri tepme döngüsünün sıfıra dönmesi
for (let i = 0; i < 30; i++) ad.update(0.05);
assert.equal(recoilSlide.position.z, 0);

// 4. Yükleme döngüsü (kama yana açılmalı + emniyet kilidi çalışmalı)
ad.onSlider(1, 50);
const wedgeHolder = ad.parts.breechBlock.children.find(c => c.name === 'breech-wedge');
assert.ok(wedgeHolder.position.x > 0.35, `Wedge should slide open: ${wedgeHolder.position.x}`);
const lockedFire = ad.onFire();
assert.equal(lockedFire.ok, false);

ad.onSlider(1, 100);
assert.equal(wedgeHolder.position.x, 0);
assert.equal(ad.onFire().ok, true);

// 5. Schießkurve ray konumu (±15° -> ±1.15 m) ve ray sınırları içinde kalma
ad.onSlider(2, 15);
const carriageMove = ad.parts.leftBogies.parent;
assert.ok(Math.abs(carriageMove.position.z - 1.15) < 1e-6);
ad.onSlider(2, -15);
assert.ok(Math.abs(carriageMove.position.z + 1.15) < 1e-6);
ad.onSlider(2, 0);
assert.equal(carriageMove.position.z, 0);

// 6. Mermi modu (7.1 t AP <-> 4.8 t HE) & 48 -> 0 -> 48 ikmal döngüsü
assert.ok(ad.getStats()[1].includes('7.1t AP'));
ad.onButton('mode');
assert.ok(ad.getStats()[1].includes('4.8t HE'));
ad.onButton('mode');
while (Number(ad.getStats()[3]) > 0) {
  const res = ad.onFire();
  assert.equal(res.ok, true);
}
assert.equal(Number(ad.getStats()[3]), 0);
const resupply = ad.onFire();
assert.equal(resupply.resupplied, true);
assert.equal(Number(ad.getStats()[3]), 48);

// 7. Sınır dışı ve NaN koruması + reset
ad.onSlider(0, 999);
assert.equal(ad.getSliderValues()[0], 48);
ad.onSlider(1, -99);
assert.equal(ad.getSliderValues()[1], 0);
ad.onSlider(2, NaN);
assert.equal(ad.getSliderValues()[2], 0);
ad.onButton('sweep');
assert.deepEqual(Array.from(ad.getSliderValues()), [22, 0, 0]);

// 8. TR/EN çift dil doğrulaması
const enRes = common('gustav', 19, { window: { MuseumPreferences: { language: 'en' } } });
assert.notEqual(enRes.ad.ui.sub, ad.ui.sub);
assert.notEqual(enRes.ad.modeLabel(), ad.modeLabel());
assert.notEqual(enRes.ad.ui.buttons.terrain, ad.ui.buttons.terrain);

console.log(`PASS gustav: 19 groups, ${meshes.length} meshes, 80 wheels grounded, +48 deg recoil clearance, breech safety lock, Schiesskurve shift & TR/EN`);
