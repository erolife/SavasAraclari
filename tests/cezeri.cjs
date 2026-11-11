const { common, THREE, assert } = require('./model-harness.cjs');

const { ad, groups, meshes } = common('cezeri', 18);

// 1. Bazalt su kanalı kaidesi zemin teması (y = 0.000)
ad.root.updateMatrixWorld(true);
const bounds = new THREE.Box3().setFromObject(ad.root, true);
assert(Math.abs(bounds.min.y) < 1e-4, `Kaide zemin teması bozuk: min.y=${bounds.min.y}`);

// 2. X-Ray dış kabukları (ikiz bakır silindirler ve tunç valf odaları)
const outerIds = groups.filter(g => g.userData.isOuterShell).map(g => g.userData.id);
assert(outerIds.includes('cezeri_cylinders') && outerIds.includes('cezeri_valveBoxes'));

// 3. 90° dişli çifti hız vektörü doğrulaması: v1 = w1 x r1 === v2 = w2 x r2
ad.onSlider(0, 80);
const z0 = ad.wheelShaft.rotation.z, x0 = ad.camAxleGroup.rotation.x;
ad.update(0.05);
const dw1 = ad.wheelShaft.rotation.z - z0;
const dw2 = ad.camAxleGroup.rotation.x - x0;
assert(dw1 > 0, 'Su çarkı mili +Z yönünde dönmeli (alt kanatlar +X su akışıyla uyumlu)');
assert(Math.abs(dw2 / dw1 - 2.0) < 1e-9, `Fener dişli 2:1 hız oranıyla dönmeli: ${dw2 / dw1}`);

// Temas noktasında teğetsel hız vektörleri: r1 = (+0.56, 0, 0), r2 = (0, 0, -0.28)
const v1 = new THREE.Vector3(0, 0, dw1).cross(new THREE.Vector3(0.56, 0, 0));
const v2 = new THREE.Vector3(dw2, 0, 0).cross(new THREE.Vector3(0, 0, -0.28));
assert(v1.distanceTo(v2) < 1e-9, `Temas noktasında dişli teğetsel hızları eşit olmalı: ${v1.y} vs ${v2.y}`);

// 4. Savak %0 kapatıldığında tüm mekanizma tam durmalı
ad.onSlider(0, 0);
const stopW = ad.wheelShaft.rotation.z, stopC = ad.camAxleGroup.rotation.x, stopP = ad.pistonRig[0].head.position.x;
ad.update(0.05);
assert.equal(ad.wheelShaft.rotation.z, stopW, 'Savak %0 iken su çarkı durmalı');
assert.equal(ad.camAxleGroup.rotation.x, stopC, 'Savak %0 iken kam mili durmalı');
assert.equal(ad.pistonRig[0].head.position.x, stopP, 'Savak %0 iken pistonlar durmalı');
assert(ad.clacks.every(c => c.intake.rotation.z === 0 && c.delivery.rotation.z === 0), 'Akış durduğunda klape valfler kapanmalı');

// 5. Eksantrik kam mili 4 fazlı kol sıralaması ve ikiz pompa ters fazlı klape valfleri
ad.onSlider(2, 90); // elle çevrim 90° -> vxSign = -sin(90°) = -1 (sola hareket: sol basar, sağ emer!)
const left90 = ad.clacks[0], right90 = ad.clacks[1];
assert(left90.delivery.rotation.z !== 0 && left90.intake.rotation.z === 0, 'Sola strokta sol basma klapesi açılmalı');
assert(right90.intake.rotation.z !== 0 && right90.delivery.rotation.z === 0, 'Sola strokta sağ emme klapesi açılmalı');

ad.onSlider(2, 270); // elle çevrim 270° -> vxSign = -sin(270°) = +1 (sağa hareket: sağ basar, sol emer!)
assert(right90.delivery.rotation.z !== 0 && right90.intake.rotation.z === 0, 'Sağa strokta sağ basma klapesi açılmalı');
assert(left90.intake.rotation.z !== 0 && left90.delivery.rotation.z === 0, 'Sağa strokta sol emme klapesi açılmalı');

// 4 kam kolunun farklı açılarda farklı yüksekliklerde bulunması
ad.onSlider(2, 22);
const heights = ad.leverRig.map(l => l.stem.position.y);
assert(new Set(heights.map(h => h.toFixed(4))).size >= 3, '90° faz farklı kam lobları kolları sıralı kaldırmalı');

console.log(`PASS cezeri: 18 groups, ${meshes.length} meshes; ground=0, exact v1=v2 90° peg/lantern gear (2:1), 0% sluice stop, 4-phase cams & opposed clack-valve pump`);

