const { common, THREE, assert } = require('./model-harness.cjs');

const { ad, groups, meshes } = common('patriot', 18);

// 1. Tam zemin teması (hem atış konumunda hem yol intikal konumunda min.y ≈ 0)
ad.root.updateMatrixWorld(true);
const bDeploy = new THREE.Box3().setFromObject(ad.root, true);
assert(Math.abs(bDeploy.min.y) < 1e-4, `Atış konumunda zemin teması bozuk: min.y=${bDeploy.min.y}`);

ad.onButton('terrain'); // yol konumuna al
ad.root.updateMatrixWorld(true);
const bStow = new THREE.Box3().setFromObject(ad.root, true);
assert(Math.abs(bStow.min.y) < 1e-4, `Yol konumunda zemin teması bozuk: min.y=${bStow.min.y}`);
assert.equal(ad.onFire().ok, false, 'Yol konumunda atış kilitli olmalı');
ad.onButton('terrain'); // tekrar atış konumuna dön

// 2. X-Ray dış kabuk grupları (kanister, jeneratör, radar sığınağı ve radom kabuğu)
const outerIds = groups.filter(g => g.userData.isOuterShell).map(g => g.userData.id);
for (const k of ['patriot_genset', 'patriot_canisters', 'patriot_radarShelter', 'patriot_radarFace']) {
  assert(outerIds.includes(k), `Eksik X-Ray dış kabuğu: ${k}`);
}

// 3. Elektronik faz taraması: radar anten yüzü fiziksel dönmez, RF hüzmesi tarar ve 0% hızda durur
ad.onSlider(2, 80);
const yawBefore = ad.arrayFrame.rotation.y;
const beamBefore = ad.beamSteer.rotation.y;
ad.update(0.05);
assert.equal(ad.arrayFrame.rotation.y, yawBefore, 'Faz dizinli radar anten gövdesi mekanik olarak dönmemeli');
assert.notEqual(ad.beamSteer.rotation.y, beamBefore, 'RF hüzmesi elektronik olarak taramalı');

ad.onSlider(2, 0);
const stoppedAz = ad.beamSteer.rotation.y, stoppedEl = ad.beamSteer.rotation.x;
ad.update(0.05);
assert.equal(ad.beamSteer.rotation.y, stoppedAz, '0% tarama hızında elektronik hüzme durmalı');
assert.equal(ad.beamSteer.rotation.x, stoppedEl);

// 4. Kanister yükselişi ve ikiz hidrolik silindir uzaması
ad.onSlider(1, 0);
ad.root.updateMatrixWorld(true);
const ramLow = ad.parts.elevRams.children[0].scale.y + ad.parts.elevRams.children[1].scale.y;
ad.onSlider(1, 38);
ad.root.updateMatrixWorld(true);
const ramHigh = ad.parts.elevRams.children[0].scale.y + ad.parts.elevRams.children[1].scale.y;
assert(ramHigh > ramLow + 0.4, `Yükseliş silindiri 38°'de uzamalı: ${ramLow} -> ${ramHigh}`);

// 5. 4 hücreli MIM-104 ateşleme, kırılabilir ön kapak açılması ve ikmal döngüsü
const intactCovers = ad.parts.diaphragms.children.filter(c => c.name === 'cover-intact');
const burstCovers = ad.parts.diaphragms.children.filter(c => c.name === 'cover-burst');
assert.equal(intactCovers.length, 4);
assert(intactCovers.every(c => c.visible) && burstCovers.every(c => !c.visible));

for (let i = 0; i < 4; i++) {
  const res = ad.onFire();
  assert.equal(res.ok, true, `${i + 1}. atış başarılı olmalı`);
  assert.equal(intactCovers[i].visible, false, `${i + 1}. hücrenin ön kapağı kırılmalı`);
  assert.equal(burstCovers[i].visible, true);
  for (let s = 0; s < 30; s++) ad.update(0.05);
}
assert(ad.parts.missiles.children.every(m => !m.visible), '4 atış sonunda kanisterler boşalmalı');
const refill = ad.onFire();
assert.equal(refill.refill, true, 'Boş kanisterde ikmal yapılmalı');
assert(intactCovers.every(c => c.visible) && ad.parts.missiles.children.every(m => m.visible));

console.log(`PASS patriot: 18 groups, ${meshes.length} meshes; ground=0 (deploy & stow), non-rotating phased array + electronic scan, hydraulic rams, 4-cell burst & refill`);

