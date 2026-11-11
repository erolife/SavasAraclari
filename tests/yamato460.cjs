const { common, THREE, assert } = require('./model-harness.cjs');

const { ad, groups, meshes } = common('yamato460', 18);

// 1. Zemin teması (kaide alt yüzeyi y = 0.000)
ad.root.updateMatrixWorld(true);
const bounds = new THREE.Box3().setFromObject(ad.root, true);
assert(Math.abs(bounds.min.y) < 1e-4, `Kaide zemin teması bozuk: min.y=${bounds.min.y}`);

// 2. X-Ray dış kabukları (560 mm barbet zırhı ve 650 mm taret kabuğu)
const outerIds = groups.filter(g => g.userData.isOuterShell).map(g => g.userData.id);
assert(outerIds.includes('yamato460_barbette') && outerIds.includes('yamato460_gunhouse'));

// 3. Üç bağımsız 460 mm namlu beşiği (orta namlu fark açısı testi)
ad.onSlider(1, 20);
ad.onSlider(2, 8);
assert(Math.abs(ad.gunPivots[0].rotation.x - (-20 * Math.PI / 180)) < 1e-6);
assert(Math.abs(ad.gunPivots[2].rotation.x - (-20 * Math.PI / 180)) < 1e-6);
assert(Math.abs(ad.gunPivots[1].rotation.x - (-28 * Math.PI / 180)) < 1e-6, 'Orta namlu bağımsız yükselebilmeli');

// 4. 0,08 sn gecikme bobini (dış namlular t=0'da teperken orta namlu 0,08 sn bekler)
assert.equal(ad.buttonActive('sweep'), true, 'Gecikme bobini varsayılan olarak açık olmalı');
assert.equal(ad.onFire().ok, true);
ad.update(0.05); // t ≈ 0.051 sn (< 0.08 sn)
assert(ad.gunSlides[0].slide.position.z < -0.25, 'Sol namlu geri tepmeye başlamış olmalı');
assert(ad.gunSlides[2].slide.position.z < -0.25, 'Sağ namlu geri tepmeye başlamış olmalı');
assert.equal(ad.gunSlides[1].slide.position.z, 0, '0,05 sn anında orta namlu henüz ateşlenmemiş olmalı');
ad.update(0.05); // t ≈ 0.101 sn (> 0.08 sn)
assert(ad.gunSlides[1].slide.position.z < -0.10, '0,08 sn sonrasında orta namlu ateşlenip geri tepmeli');
for (let i = 0; i < 25; i++) ad.update(0.05); // salvo tamamla

// Gecikme bobini kapatıldığında üç namlu eşzamanlı geri teper
ad.onButton('sweep');
assert.equal(ad.buttonActive('sweep'), false);
assert.equal(ad.onFire().ok, true);
ad.update(0.05);
assert(Math.abs(ad.gunSlides[0].slide.position.z - ad.gunSlides[1].slide.position.z) < 1e-6, 'Bobin kapalıyken 3 namlu eşzamanlı tepmeli');
for (let i = 0; i < 25; i++) ad.update(0.05);

// 5. +3° sabit yükleme açısı, mermi/barut asansörleri ve zincirli rammer çevrimi + atış kilidi
ad.onButton('terrain');
assert.equal(ad.buttonActive('terrain'), true);
assert.equal(ad.onFire().ok, false, 'Dolum çevrimindeyken atış kilitli olmalı');
assert(Math.abs(ad.gunPivots[0].rotation.x - (-3 * Math.PI / 180)) < 1e-6, 'Dolumda namlular +3° açıya inmeli');
let maxShellY = 0, maxRamZ = -2;
for (let i = 0; i < 75; i++) {
  ad.update(0.05);
  maxShellY = Math.max(maxShellY, ad.shellCars[0].car.position.y);
  maxRamZ = Math.max(maxRamZ, ad.rammerRods[0].position.z);
}
assert(maxShellY > 5.4, `Mermi asansörü taret beşiğine yükselmeli: ${maxShellY}`);
assert(maxRamZ > -0.7, `Zincirli rammer ileri sürülmeli: ${maxRamZ}`);
ad.onButton('terrain'); // dolumdan çık

// 6. Kalan 4 salvoyu bitir ve 18 mermi ikmalini doğrula
for (let k = 0; k < 4; k++) {
  assert.equal(ad.onFire().ok, true);
  for (let i = 0; i < 25; i++) ad.update(0.05);
}
const refill = ad.onFire();
assert.equal(refill.refill, true, '18 mermi tükendiğinde cephane ikmali yapılmalı');

console.log(`PASS yamato460: 18 groups, ${meshes.length} meshes; ground=0, independent cradles, 0.08s delay coil, +3° hoist/rammer cycle & 18-round refill`);
