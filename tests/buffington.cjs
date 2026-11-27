const { common, assert, THREE } = require('./model-harness.cjs');
const { ad, meshes } = common('buffington', 17);

// 1. Zemin teması (beton temel min.y === 0.000)
ad.root.updateMatrixWorld(true);
const rootBox = new THREE.Box3().setFromObject(ad.root);
assert.ok(Math.abs(rootBox.min.y) < 0.005, `min.y=${rootBox.min.y}`);

// 2. Rijit 2.70 m kaldıraç uzunluğu, saf dikey karşı ağırlık ve 2.60 m siper üst/alt konumu
function checkKinematics(pct) {
  ad.onSlider(2, pct);
  const trun = ad.trunnionMount.position;
  const cw = ad.cwBlock.position;
  const len = Math.hypot(trun.z - cw.z, trun.y - cw.y);
  assert.ok(Math.abs(len - 2.70) < 1e-3, `pct=${pct} leverLen=${len}`);
  return { yTrun: trun.y, yCw: cw.y, zCw: cw.z };
}

const up = checkKinematics(100);
const mid = checkKinematics(50);
const down = checkKinematics(0);

assert.equal(up.zCw, down.zCw);
assert.equal(mid.zCw, down.zCw);
assert.ok(up.yTrun > 2.60, `battery trunnion must clear 2.60m parapet: ${up.yTrun}`);
assert.ok(down.yTrun < 2.60, `concealed trunnion must drop below 2.60m parapet: ${down.yTrun}`);
assert.ok(down.yCw > up.yCw + 0.5, `counterweight rises during recoil: up=${up.yCw} down=${down.yCw}`);

// 3. Ateşleme -> otomatik geri tepme ile siper arkasına çöküş -> kilit -> mandal bırakma ile yükselme
ad.onSlider(2, 100);
assert.equal(ad.onFire().ok, true);
for (let i = 0; i < 25; i++) ad.update(0.05);
assert.equal(ad.getSliderValues()[2], 0);
assert.equal(ad.onFire().ok, false, 'locked gun behind parapet must not fire');

ad.onButton('mode'); // Mandalı bırak -> mevziye kaldır
for (let i = 0; i < 25; i++) ad.update(0.05);
assert.equal(ad.getSliderValues()[2], 100);

// 4. 12 -> 0 -> 12 ikmal döngüsü
while (Number(ad.getStats()[3]) > 0) {
  ad.onSlider(2, 100);
  assert.equal(ad.onFire().ok, true);
}
ad.onSlider(2, 100);
const resupply = ad.onFire();
assert.equal(resupply.resupplied, true);
assert.equal(Number(ad.getStats()[3]), 12);

// 5. Sınır dışı / NaN koruması, reset ve TR/EN çift dil
ad.onSlider(0, -999);
assert.equal(ad.getSliderValues()[0], -60);
ad.onSlider(1, 99);
assert.equal(ad.getSliderValues()[1], 20);
ad.onSlider(2, NaN);
assert.equal(ad.getSliderValues()[2], 100);
ad.onButton('sweep');
assert.deepEqual(Array.from(ad.getSliderValues()), [0, 8, 100]);

const enRes = common('buffington', 17, { window: { MuseumPreferences: { language: 'en' } } });
assert.notEqual(enRes.ad.ui.sub, ad.ui.sub);
assert.notEqual(enRes.ad.modeLabel(), ad.modeLabel());
assert.notEqual(enRes.ad.ui.buttons.terrain, ad.ui.buttons.terrain);

console.log(`PASS buffington: 17 groups, ${meshes.length} meshes, min.y=0, rigid 2.70m levers, 2.60m cover cycle, pawl lock & TR/EN`);
