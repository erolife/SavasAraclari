const { common, assert, THREE } = require('./model-harness.cjs');
const { ad, meshes } = common('rammah', 16);

function posX(k) {
  ad.root.updateMatrixWorld(true);
  return ad.parts[k].position.x;
}

// Üst tava kesiti ve emniyet kilidi
ad.onSlider(0, 100);
assert.ok(ad.parts.upperPan.position.y > 1.4, 'upper pan lifts cleanly');
assert.equal(ad.onFire().ok, false, 'launch blocked while cutaway is open');
ad.onSlider(0, 0);
assert.ok(Math.abs(ad.parts.upperPan.position.y - 0.62) < 1e-6);

// İtki = 0 iken alev görünmez ve atış engellenir
ad.onSlider(1, 0);
assert.equal(ad.parts.plume.visible, false, 'plume hidden at zero thrust');
assert.equal(ad.onFire().ok, false, 'launch blocked at zero thrust');

// İtki > 0 ve dümen açısı
ad.onSlider(1, 80);
assert.equal(ad.parts.plume.visible, true);
ad.onSlider(2, -15);
assert.ok(Math.abs(ad.parts.rudderFin.children[0].rotation.y + Math.PI / 12) < 1e-5);

// Ateşleme ve borda saplanması + sıfırlama
const startX = posX('spearRam');
assert.equal(ad.onFire().ok, true);
const impactX = posX('spearRam');
assert.ok(impactX > startX + 1.5, 'torpedo travels forward to target hull');
ad.update(0.5);
assert.ok(Number.isFinite(ad.parts.plume.children[0].scale.x));

// Tekrar ateşleme veya sweep ile başa dönüş
ad.onButton('sweep');
assert.deepEqual(Array.from(ad.getSliderValues()), [0, 55, 0]);
assert.ok(Math.abs(posX('spearRam') - startX) < 1e-6);

// Sınır dışı ve NaN koruması
ad.onSlider(0, 999);
assert.equal(ad.getSliderValues()[0], 100);
ad.onSlider(2, -999);
assert.equal(ad.getSliderValues()[2], -15);
ad.onSlider(1, NaN);
assert.equal(ad.getSliderValues()[1], 55);

// İngilizce dil kontrolü
const enRes = common('rammah', 16, { window: { MuseumPreferences: { language: 'en' } } });
assert.notEqual(enRes.ad.ui.title, ad.ui.title);
console.log(`PASS rammah: 16 groups, ${meshes.length} meshes, cutaway lock, zero-thrust idle, rudder, impact & TR/EN`);
