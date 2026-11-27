const { common, assert, THREE } = require('./model-harness.cjs');
const { ad, meshes } = common('gepard', 19);

// 1. Zemin teması (palet alt tabanı min.y === 0.000)
ad.root.updateMatrixWorld(true);
const rootBox = new THREE.Box3().setFromObject(ad.root);
assert.ok(Math.abs(rootBox.min.y) < 0.005, `min.y=${rootBox.min.y}`);

// 2. Kule yönü (±180°) ve 35 mm namlu yükselişi (-10..+85°)
ad.onSlider(0, -120);
ad.onSlider(1, 75);
ad.root.updateMatrixWorld(true);
const turretYaw = ad.parts.turret.parent;
assert.ok(Math.abs(turretYaw.rotation.y + (120 * Math.PI) / 180) < 1e-6);
const gunElev = ad.parts.leftGun.parent;
assert.ok(Math.abs(gunElev.rotation.x + (75 * Math.PI) / 180) < 1e-6);

// 3. Tarama hızı %0 iken arama radarı, APU fanı ve motor fanı tamamen durmalı
const searchDish = ad.parts.searchMast.parent.querySelector
  ? null
  : ad.parts.searchRadar.parent.children.find(c => c.name === 'search-dish');
const apuFan = ad.parts.auxPowerUnit.children.find(c => c.name === 'apu-fan');
assert.ok(searchDish && apuFan, 'searchDish or apuFan missing');

ad.onSlider(2, 0);
const d0 = searchDish.rotation.y;
const a0 = apuFan.rotation.z;
for (let i = 0; i < 10; i++) ad.update(0.05);
assert.equal(searchDish.rotation.y, d0);
assert.equal(apuFan.rotation.z, a0);

// 4. Tarama hızı > 0 iken döner; arama radarı katlandığında yalnız çanak dönüşü durur
ad.onSlider(2, 80);
for (let i = 0; i < 6; i++) ad.update(0.05);
assert.notEqual(searchDish.rotation.y, d0);
assert.notEqual(apuFan.rotation.z, a0);

ad.onButton('terrain'); // Arama radarını katla
const mastPivot = ad.parts.searchRadar.parent;
assert.ok(mastPivot.rotation.x < -1.2, `mastPivot.rotation.x=${mastPivot.rotation.x}`);
const dFold = searchDish.rotation.y;
for (let i = 0; i < 6; i++) ad.update(0.05);
assert.equal(searchDish.rotation.y, dFold);
ad.onButton('terrain'); // Tekrar aç

// 5. Zıt fazlı 35 mm salvo, HEI-T <-> FAPDS geçişi ve 0 -> ikmal
const leftSlide = ad.parts.leftGun.children.find(c => c.name === 'left-recoil');
const rightSlide = ad.parts.rightGun.children.find(c => c.name === 'right-recoil');
assert.ok(leftSlide && rightSlide);
assert.equal(ad.getStats()[2], 'HEI-T');
assert.equal(Number(ad.getStats()[3]), 640);

assert.equal(ad.onFire().ok, true);
assert.notEqual(leftSlide.position.z, rightSlide.position.z);
for (let i = 0; i < 15; i++) ad.update(0.05);
assert.equal(leftSlide.position.z, 0);
assert.equal(rightSlide.position.z, 0);

ad.onButton('mode');
assert.equal(ad.getStats()[2], 'FAPDS');
assert.equal(Number(ad.getStats()[3]), 40);
while (Number(ad.getStats()[3]) > 0) {
  assert.equal(ad.onFire().ok, true);
}
assert.equal(Number(ad.getStats()[3]), 0);
assert.equal(ad.onFire().resupplied, true);
assert.equal(Number(ad.getStats()[3]), 40);

// 6. Sınır dışı / NaN koruması, reset ve TR/EN çift dil
ad.onSlider(0, 999);
assert.equal(ad.getSliderValues()[0], 180);
ad.onSlider(1, -99);
assert.equal(ad.getSliderValues()[1], -10);
ad.onSlider(2, NaN);
assert.equal(ad.getSliderValues()[2], 80);
ad.onButton('sweep');
assert.deepEqual(Array.from(ad.getSliderValues()), [18, 32, 70]);

const enRes = common('gepard', 19, { window: { MuseumPreferences: { language: 'en' } } });
assert.notEqual(enRes.ad.ui.sub, ad.ui.sub);
assert.notEqual(enRes.ad.modeLabel(), ad.modeLabel());
assert.notEqual(enRes.ad.ui.buttons.terrain, ad.ui.buttons.terrain);

console.log(`PASS gepard: 19 groups, ${meshes.length} meshes, min.y=0, 0%/fold radar stop, alternating recoil, HEI/FAPDS refill & TR/EN`);
