const { common, THREE, assert } = require('./model-harness.cjs');

const { ad, groups, meshes } = common('firtina', 19);

// 1. Zemin teması: hem normal sürüşte hem hidropnömatik atış kilidi (kneel) çökmesinde palet y=0'da
ad.root.updateMatrixWorld(true);
const bDrive = new THREE.Box3().setFromObject(ad.root, true);
assert(Math.abs(bDrive.min.y) < 1e-4, `Sürüş konumunda palet zemin teması bozuk: min.y=${bDrive.min.y}`);

ad.onButton('terrain'); // atış kilidi (gövde -0,12 m çöker)
assert.equal(ad.hullBody.position.y, -0.12);
ad.root.updateMatrixWorld(true);
const bKneel = new THREE.Box3().setFromObject(ad.root, true);
assert(Math.abs(bKneel.min.y) < 1e-4, `Atış kilidinde zemin teması bozuk: min.y=${bKneel.min.y}`);
ad.onButton('terrain'); // sürüş konumuna dön

// 2. X-Ray dış kabukları (zırhlı gövde ve kaynaklı taret)
const outerIds = groups.filter(g => g.userData.isOuterShell).map(g => g.userData.id);
assert(outerIds.includes('firtina_hull') && outerIds.includes('firtina_turret'));

// 3. MTU 881 motor devri 0 iken fan ve ön cer dişlileri tam durmalı
ad.onSlider(2, 1600);
ad.update(0.05);
assert(ad.coolFan.rotation.y > 0 && ad.sprocketG[0].rotation.x > 0, 'Motor çalışırken fan ve cer dönmeli');

ad.onSlider(2, 0);
const fanStop = ad.coolFan.rotation.y, sprStop = ad.sprocketG[0].rotation.x;
ad.update(0.05);
assert.equal(ad.coolFan.rotation.y, fanStop, '0 dev/dk iken soğutma fanı durmalı');
assert.equal(ad.sprocketG[0].rotation.x, sprStop, '0 dev/dk iken cer dişlileri durmalı');

// 4. +68° yüksek açılı yükseliş ve robotik yükleme kolunun namlu açısına hizalanması
ad.onSlider(0, 68);
assert(Math.abs(ad.gunElev.rotation.x - (-68 * Math.PI / 180)) < 1e-6);

ad.onButton('sweep'); // otomatik yükleyici çevrimini aç
assert.equal(ad.onFire().ok, false, 'Yükleme kolu aktifken atış emniyet kilidinde olmalı');
for (let i = 0; i < 28; i++) ad.update(0.05); // lp ≈ 28 * 0.05 * 0.45 = 0.63 (tam hizalı sürme evresi: 0.50..0.82)
assert(Math.abs(ad.trayPitch.rotation.x - ad.gunElev.rotation.x) < 1e-6, 'Robotik yükleme tepsisi +68° namlu açısına tam hizalanmalı');
ad.onButton('sweep'); // yükleyiciyi kapat

// 5. 155 mm geri tepme ve 48 mermi Poyraz ikmal döngüsü
assert.equal(ad.onFire().ok, true);
ad.update(0.05);
assert(ad.recoilSlide.position.z < -0.15, 'Atışta 155 mm L/52 namlu geri tepmeli');
for (let s = 0; s < 25; s++) ad.update(0.05);

for (let shot = 1; shot < 48; shot++) {
  assert.equal(ad.onFire().ok, true);
  for (let s = 0; s < 20; s++) ad.update(0.05);
}
const refill = ad.onFire();
assert.equal(refill.refill, true, '48 mermi tükendiğinde Poyraz ikmali yapılmalı');

console.log(`PASS firtina: 19 groups, ${meshes.length} meshes; ground=0 (drive & HSU kneel), 0-RPM stop, +68° aligned robotic loader & 48-round refill`);

