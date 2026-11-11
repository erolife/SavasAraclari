const { common, THREE, assert } = require('./model-harness.cjs');

const { ad, groups, meshes } = common('saturnv_f1', 17);

// 1. Zemin teması (stand pabuçları y = 0.000)
ad.root.updateMatrixWorld(true);
const bounds = new THREE.Box3().setFromObject(ad.root, true);
assert(Math.abs(bounds.min.y) < 1e-4, `Stand zemin teması bozuk: min.y=${bounds.min.y}`);

// 2. X-Ray dış kabukları (folyo battaniye, alt lüle uzantısı ve türbopompa dış gövdesi)
const outerIds = groups.filter(g => g.userData.isOuterShell).map(g => g.userData.id);
for (const k of ['saturnv_f1_insulation', 'saturnv_f1_nozzleExt', 'saturnv_f1_pumpCasing']) {
  assert(outerIds.includes(k), `Eksik X-Ray dış kabuğu: ${k}`);
}

// 3. Mark 10 türbopompa ortak şaft dönüşü, sabit statorlar ve %0 gazda tam duruş + ateşleme kilidi
ad.onSlider(0, 80);
ad.update(0.05);
assert(ad.shaftGroup.rotation.y > 0, 'Gaz açıkken ortak şaft dönmeli');
assert.equal(ad.parts.pumpStator.rotation.y, 0, 'Türbopompa stator kanatları dönmemeli');

assert.equal(ad.onFire().ok, true, 'Gaz açıkken statik ateşleme başlamalı');
assert.equal(ad.hotPlume.visible, true);

// Ateşleme aktifken dahi alev zeminin altına taşmamalı
ad.root.updateMatrixWorld(true);
const bFire = new THREE.Box3().setFromObject(ad.root, true);
assert(bFire.min.y >= -1e-4, `Statik ateşleme alevi zeminin altına taşmamalı: ${bFire.min.y}`);

// Gaz kolu %0'a çekildiğinde şaft durmalı ve ateşleme otomatik kapanmalı
ad.onSlider(0, 0);
const stoppedAngle = ad.shaftGroup.rotation.y;
ad.update(0.05);
assert.equal(ad.shaftGroup.rotation.y, stoppedAngle, '%0 gazda türbopompa şaftı tam durmalı');
assert.equal(ad.hotPlume.visible, false, '%0 gazda alev sönmeli');
assert.equal(ad.onFire().ok, false, '%0 gazda ateşleme kilitli olmalı');

// 4. ±6° kardan vektörleme ve X/Z hidrolik aktüatör boyu değişimi
ad.onSlider(1, -6);
ad.onSlider(2, -6);
const lenXNeg = ad.ramX.cylO.scale.y + ad.ramX.rodO.scale.y;
const lenZNeg = ad.ramZ.cylO.scale.y + ad.ramZ.rodO.scale.y;
ad.onSlider(1, 6);
ad.onSlider(2, 6);
const lenXPos = ad.ramX.cylO.scale.y + ad.ramX.rodO.scale.y;
const lenZPos = ad.ramZ.cylO.scale.y + ad.ramZ.rodO.scale.y;
assert.notEqual(lenXNeg, lenXPos, 'Yunuslama gimbal açısı X aktüatör boyunu değiştirmeli');
assert.notEqual(lenZNeg, lenZPos, 'Sapma gimbal açısı Z aktüatör boyunu değiştirmeli');

// 5. Isıl folyo ceket aç/kapat
assert.equal(ad.buttonActive('terrain'), false);
ad.onButton('terrain');
assert.equal(ad.buttonActive('terrain'), true);
assert.equal(ad.parts.insulation.children[0].visible, false, 'Folyo ceket düğmesi battaniyeyi gizlemeli');

console.log(`PASS saturnv_f1: 17 groups, ${meshes.length} meshes; ground=0, 55k hp shared shaft, 0% interlock, ±6° X/Z gimbal actuators & thermal blanket`);

