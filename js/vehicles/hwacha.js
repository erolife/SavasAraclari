/* Munjong Hwacha (1451), Singijeon variant. External museum reconstruction.
 * References and interpretive limits: INCELEME_NOTLARI.md.
 * Proportions, articulation limits and display timing are exhibit choices.
 */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.hwacha = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'hwacha');
    const { T, root, parts, mats: M, mesh, box, cyl, ring, beam, pipe, instances } = K;
    const S = { speed: 1, angle: 25, spread: 0, remaining: 100, playing: false, progress: 0, arrows: true };
    const counts = {}, arrowMeshes = [], hardware = [];
    let number = 0, finish = 'oak', relief = true;
    const grainData = new Uint8Array(256 * 64 * 4);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 256; x++) {
      const v = Math.round(205 + 17 * Math.sin(y * 2.4 + Math.sin(x * .03)) + 6 * Math.sin(y * 9 + x * .02));
      grainData.set([v, v, v, 255], (y * 256 + x) * 4);
    }
    const grain = new T.DataTexture(grainData, 256, 64, T.RGBAFormat);
    grain.colorSpace = T.SRGBColorSpace; grain.wrapS = grain.wrapT = T.RepeatWrapping; grain.needsUpdate = true;
    M.wood.color.setHex(0x966c42); M.wood.map = grain; M.wood.userData.wood = true;
    M.dark.color.setHex(0x393935); M.steel.color.setHex(0x61625b);
    const bamboo = new T.MeshStandardMaterial({ color: 0xb79556, roughness: .85, map: grain });
    const paper = new T.MeshStandardMaterial({ color: 0xd9cba6, roughness: .95 });
    const cord = new T.MeshStandardMaterial({ color: 0x9d835b, roughness: 1 });
    function P(key, name, sub, desc, exp, outer = false, parent = root) {
      counts[sub] = (counts[sub] || 0) + 1;
      const p = K.part(key, (++number) + '. ' + name, sub, [0, 0, 0], exp, desc, outer, parent);
      Object.assign(p.userData, { material: 'Ahşap, demir ve dış ok modelleri', weight: 'Kütle hesaplanmıyor',
        spec: 'Modern rekonstrüksiyonlardan yorum; ölçüler yaklaşık' });
      return p;
    }
    function group(parent, pos, name) { const g = new T.Group(); g.name = name; g.position.set(...pos); parent.add(g); return g; }
    function pins(p, points) { const o = instances(p, new T.SphereGeometry(.025, 8, 6), M.dark, points.map(pos => ({ pos }))); hardware.push(o); }

    const chassis = P('chassis', 'Uzun Ahşap Şasi', 'Araba', 'İki uzun kiriş, enine zıvanalı bağlantılar ve önde yükselen taşıyıcılar. Model ölçüleri orantısal yorumdur.', [0, -.15, 0]);
    for (const x of [-.62, .62]) beam(chassis, [x, .70, -1.55], [x, 1.02, .98], .16, M.wood);
    for (const z of [-1.35, -.35, .8]) box(chassis, [1.42, .14, .16], [0, .70 + (z + 1.55) * .126, z], M.wood);
    const deck = P('deck', 'Alt Döşeme ve Çaprazlar', 'Araba', 'Alt döşeme tahtaları ve şasiyi bir arada tutan çaprazlar; X-Ray ile taşıyıcılar görünür.', [0, -.25, -.3], true);
    for (let i = 0; i < 6; i++) box(deck, [.195, .055, 1.72], [-.51 + i * .204, .89, -.35], M.wood, [-.125, 0, 0]);
    for (const s of [-1, 1]) beam(deck, [s * .55, .68, -1.35], [-s * .55, .88, .55], .055, M.dark);
    const axle = P('axle', 'Dingil ve Ahşap Yataklar', 'Araba', 'Enine dingil, ahşap yataklar ve dış uç pimleri. Tekerlekler bu sabit dingile oturur.', [0, -.25, .2]);
    cyl(axle, .095, 2.20, [0, .72, .38], M.wood, 'x');
    for (const x of [-.62, .62]) { box(axle, [.25, .28, .30], [x, .80, .38], M.wood); cyl(axle, .13, .28, [x, .72, .38], M.dark, 'x'); }
    const wheels = P('wheels', 'İspitli Ahşap Tekerlekler', 'Araba', 'On iki ahşap parmak, dilimli ispit, demir çember, göbek bilezikleri ve uç pimleri.', [1, 0, 0]);
    for (const side of [-1, 1]) {
      const w = group(wheels, [side * .98, .72, .38], 'wheel-' + side);
      mesh(w, new T.TorusGeometry(.64, .069, 8, 72), M.wood, [0, 0, 0], [0, Math.PI / 2, 0]);
      mesh(w, new T.CylinderGeometry(.72, .72, .13, 72, 1, true), M.dark, [0, 0, 0], [0, 0, Math.PI / 2]);
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        beam(w, [0, Math.sin(a) * .11, Math.cos(a) * .11], [0, Math.sin(a) * .65, Math.cos(a) * .65], .055, M.wood);
        box(w, [.15, .025, .055], [0, Math.sin(a) * .64, Math.cos(a) * .64], M.dark, [-a, 0, 0]);
      }
      cyl(w, .15, .24, [0, 0, 0], M.wood, 'x');
      for (const x of [-.11, .11]) cyl(w, .154, .028, [x, 0, 0], M.dark, 'x');
      cyl(w, .065, .34, [0, 0, 0], M.dark, 'x');
      cyl(w, .024, .22, [side * .17, 0, 0], M.steel);
    }
    const handles = P('handles', 'Uzun Taşıma Kolları', 'Araba', 'Arkaya uzanan ahşap taşıma kolları ve uç kavramaları; boşlukta kalan bir platform yerine şasiye bağlıdır.', [0, .2, -1]);
    for (const x of [-.62, .62]) {
      beam(handles, [x, .77, -1], [x, .25, -3.05], .12, M.wood);
      for (let i = 0; i < 7; i++) ring(handles, .075, [x, .28 + i * .009, -2.94 + i * .035], cord, .012, [Math.PI / 2 - .25, 0, 0]);
    }
    const feet = P('feet', 'Arka Sergi Dayanakları', 'Araba', 'Arka kolların altındaki ahşap dayanaklar ve zemin pabuçları. Sabit sergi pozunu destekler.', [0, 0, -.5]);
    for (const x of [-.62, .62]) { beam(feet, [x, .08, -2.8], [x, .34, -2.8], .10, M.wood); box(feet, [.20, .10, .28], [x, .05, -2.8], M.wood); }
    const fittings = P('fittings', 'Demir Kuşak ve Birleşimler', 'Araba', 'Ahşap uçlarını saran demir bantlar, yuvarlak pimler ve kol bağlantıları. Modern cıvata biçimleri kullanılmaz.', [0, .25, -.4]);
    for (const x of [-.62, .62]) for (const z of [-1.2, .7]) {
      box(fittings, [.20, .022, .18], [x, .70 + (z + 1.55) * .126 + .09, z], M.dark);
      pins(fittings, [[x, .70 + (z + 1.55) * .126 + .11, z]]);
    }
    const uprights = P('uprights', 'Kaset Taşıyıcı Dikmeleri', 'Taşıyıcı', 'İki yan dikme, çapraz payandalar ve enine başlık kaseti taşır.', [0, .4, .3]);
    for (const x of [-.85, .85]) {
      beam(uprights, [x, 1.05, .48], [x, 2.12, .12], .13, M.wood);
      beam(uprights, [Math.sign(x) * .62, .79, -1.1], [x, 2.02, .12], .095, M.wood);
      beam(uprights, [Math.sign(x) * .62, .98, .88], [x, 2.02, .12], .095, M.wood);
    }
    box(uprights, [1.9, .13, .15], [0, 1.12, .48], M.wood);
    const trunnions = P('trunnions', 'Yan Mafsal ve Pimler', 'Taşıyıcı', 'Yükseliş incelemesi için yatay eksen. Hareket aralığı sergi yorumudur; tarihsel ayar çizelgesi değildir.', [0, .4, 0]);
    for (const x of [-.85, .85]) { cyl(trunnions, .115, .22, [x, 2.10, .12], M.dark, 'x'); cyl(trunnions, .043, .20, [x + Math.sign(x) * .12, 2.10, .12], M.steel); }
    const elevation = group(root, [0, 2.10, .12], 'elevation');
    const frame = P('frame', 'Kaset Ahşap Çerçevesi', 'Kaset', 'Delikli levhaları birleştiren yan çerçeve, üst ve alt başlıklar. Levhalar ayrı seçilebilir.', [0, .6, 0], false, elevation);
    for (const x of [-.76, .76]) box(frame, [.12, 1.55, .72], [x, 0, -.08], M.wood);
    for (const y of [-.72, .72]) box(frame, [1.64, .12, .72], [0, y, -.08], M.wood);
    const front = P('front', 'Ön Delikli Levha — 100 Göz', 'Kaset', '10 × 10 açıklık. Delikler boyalı işaretler değil, ahşap levhanın içinden geçen geometri boşluklarıdır.', [0, 0, .75], true, elevation);
    const rear = P('rear', 'Arka Kılavuz Levha', 'Kaset', 'Ön levhayla aynı eksende yüz açıklık. Levha aralığı ve delik ölçüleri yalnız görsel rekonstrüksiyondur.', [0, 0, -.65], true, elevation);
    // Ten separate planks, each with ten actual Shape holes; no 100 opaque tube substitutes.
    for (let row = 0; row < 10; row++) {
      const shape = new T.Shape(); shape.moveTo(-.70, -.068); shape.lineTo(.70, -.068); shape.lineTo(.70, .068); shape.lineTo(-.70, .068); shape.closePath();
      for (let col = 0; col < 10; col++) { const hole = new T.Path(); hole.absarc((col - 4.5) * .14, 0, .042, 0, Math.PI * 2, true); shape.holes.push(hole); }
      const geometry = new T.ExtrudeGeometry(shape, { depth: .085, bevelEnabled: false, curveSegments: 10 });
      for (const [p, z] of [[front, .18], [rear, -.42]]) {
        const plank = mesh(p, geometry, M.wood, [0, (row - 4.5) * .14, z]); plank.userData.apertures = 10;
      }
    }
    const bands = P('bands', 'Kaset Kuşakları ve Bağlar', 'Kaset', 'Yan demir kuşaklar, ahşap pimler ve dış bağ halkaları kaset köşelerini ayrıntılandırır.', [0, .3, 0], false, elevation);
    for (const x of [-.77, .77]) for (const y of [-.62, .62]) {
      box(bands, [.14, .055, .76], [x, y, -.08], M.dark);
      pins(bands, [[x, y, .31], [x, y, -.47]]);
      ring(bands, .045, [x + Math.sign(x) * .09, y, -.1], M.dark, .012, [0, Math.PI / 2, 0]);
    }
    const shafts = P('shafts', 'Yüz Uzun Ok Sapı', 'Oklar', 'Munjong kaydındaki yüz orta boy Singijeon. Dış saplar temsili oranlarla modellenir; üretim ölçüsü verilmez.', [0, .3, -1], false, elevation);
    const heads = P('heads', 'Ok Uçları ve Dış Kılıflar', 'Oklar', 'Demir renkli uçlar ve açık renkli dış kılıflar. Kapalı dış yüzey gösterimi; iç yapı modellenmez.', [0, .3, 1], false, elevation);
    const bindings = P('bindings', 'Dış Bağlar ve Sap Uçları', 'Oklar', 'Kılıfların dışındaki bağ halkaları ve sap sonları. Tekrarlanan yüz parça örneklenmiş geometriyle çizilir.', [0, .5, -.3], false, elevation);
    const locations = Array.from({ length: 100 }, (_, i) => [(i % 10 - 4.5) * .14, (Math.floor(i / 10) - 4.5) * .14]);
    function arrows(p, geometry, mat, z, rot = [Math.PI / 2, 0, 0]) {
      const o = instances(p, geometry, mat, locations.map(([x, y]) => ({ pos: [x, y, z], rot })));
      arrowMeshes.push(o); return o;
    }
    arrows(shafts, new T.CylinderGeometry(.013, .013, 2.65, 8), bamboo, -.46);
    arrows(heads, new T.CylinderGeometry(.032, .032, .36, 12), paper, .59);
    arrows(heads, new T.ConeGeometry(.035, .17, 4), M.dark, .86);
    for (const z of [.43, .72]) arrows(bindings, new T.TorusGeometry(.033, .005, 4, 12), cord, z, [0, 0, 0]);
    arrows(bindings, new T.CylinderGeometry(.018, .018, .08, 8), bamboo, -1.77);
    const bracePart = P('brace', 'Kaset Arka Desteği', 'Taşıyıcı', 'Kaset ile şasi arasındaki bağlantılı destek. Değişen uzunluk, açı incelemesi için kullanılan sergi animasyonudur.', [0, -.1, -.6]);
    const brace = box(bracePart, [.07, 1, .07], [0, 0, 0], M.wood);
    const braceBase = new T.Vector3(0, .82, -1.15), braceEnd = new T.Vector3();
    for (const z of [-1.15]) cyl(bracePart, .07, .22, [0, .82, z], M.dark, 'x');
    const topJoint = group(elevation, [0, -.74, -.28], 'brace-joint'); cyl(topJoint, .06, .20, [0, 0, 0], M.dark, 'x');
    const legend = P('legend', 'Joseon Sergi Levhası', 'Araba', '1451: Munjong Hwacha. Bu model yüz Singijeon okunu taşıyan varyantı gösterir; elli chongtong taşıyan düzen değildir.', [0, .25, .5]);
    box(legend, [.44, .16, .025], [0, 1.12, .57], M.dark);
    // Simple carved triple-stroke emblem, not an invented historical inscription.
    for (const x of [-.12, 0, .12]) box(legend, [.018, .10, .008], [x, 1.12, .588], M.brass);

    function sync() {
      elevation.rotation.x = -S.angle * Math.PI / 180;
      front.position.z = S.spread * .008; rear.position.z = -S.spread * .008;
      arrowMeshes.forEach(o => { o.count = S.remaining; o.visible = S.arrows; });
      elevation.updateMatrix();
      braceEnd.set(0, -.74, -.28).applyMatrix4(elevation.matrix);
      const delta = braceEnd.clone().sub(braceBase);
      brace.position.copy(braceBase).add(braceEnd).multiplyScalar(.5); brace.scale.y = delta.length();
      brace.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), delta.normalize());
    }
    function reset() { Object.assign(S, { speed: 1, angle: 25, spread: 0, remaining: 100, playing: false, progress: 0, arrows: true }); sync(); }
    function update(dt) {
      if (S.playing && Number.isFinite(dt)) {
        S.progress += Math.max(0, Math.min(dt, .05)) * S.speed * 10;
        const consumed = Math.min(S.remaining, Math.floor(S.progress + 1e-9));
        S.remaining -= consumed; S.progress -= consumed;
        if (!S.remaining) { S.playing = false; S.progress = 0; }
      }
      sync();
    }
    function fire() {
      if (!S.remaining) { S.remaining = 100; S.progress = 0; sync(); return { ok: true, refill: true }; }
      if (S.spread || !S.arrows) return { ok: false, msg: 'Sıralı inceleme için levhaları birleştirin ve okları görünür yapın.' };
      S.playing = !S.playing; return { ok: true };
    }
    const finishes = { oak: { label: 'Sıcak Ahşap (temsili)', color: 0x966c42 }, aged: { label: 'Yaşlanmış Ahşap (temsili)', color: 0x80725c }, dark: { label: 'Koyu Ahşap (temsili)', color: 0x503e2f }, pale: { label: 'Açık Ahşap (temsili)', color: 0xbd9b69 } };
    const woods = K.meshes.filter(({ o }) => o.material.userData.wood).map(({ o }) => o);
    function applyTextures(blueprint) {
      K.applyTextures(blueprint);
      woods.forEach(o => { o.userData.origColor.setHex(finishes[finish].color); if (!blueprint) o.material.color.copy(o.userData.origColor);
        o.material.map = grain; o.material.bumpMap = relief ? grain : null; o.material.bumpScale = .009; o.material.needsUpdate = true; });
      hardware.forEach(o => { o.visible = relief; });
    }
    const camPresets = {
      iso: { pos: [5.3, 4.3, 5.8], look: [0, 1.3, -.6] }, front: { pos: [0, 3.3, 5], look: [0, 2.1, .2] },
      breech: { pos: [3.6, 3.4, -4.7], look: [0, 1.5, -.65] }, engine: { pos: [2.6, 3.0, 2.9], look: [0, 2.1, .1] },
      suspension: { pos: [3.5, 1.6, 2.6], look: [0, .8, .15] }, top: { pos: [.01, 7.7, -.5], look: [0, 0, -.5] }
    };
    const tourSteps = [
      ['Munjong’un Hwacha’sı • 1451', 'Joseon kayıtlarında yüz orta boy Singijeon veya elli chongtong taşıyan iki düzen anlatılır. Burada yüz oklu varyant görülür.', 'iso', chassis, false],
      ['Ahşap Araba', 'İspitli tekerlek, sabit dingil, uzun taşıma kolları, kuşaklar ve zıvanalı ahşap birleşimler.', 'suspension', wheels, false],
      ['Yüz Açıklıklı Kaset', 'Her levhada on sıra ve yüz gerçek açıklık. Levha ayırma kaydırıcısıyla kılavuz düzenini inceleyin.', 'engine', front, false],
      ['Uzun Singijeon Sapları', 'Saplar deliklerden arkaya uzanır. Okları gizleyerek boş kaseti görebilir, sıralı incelemeyle kalan sayısını takip edebilirsiniz.', 'breech', shafts, false],
      ['Taşıyıcı ve Mafsallar', 'X-Ray ile ahşap dikmeleri ve bağlantılı arka desteği görün. Açı aralığı ve hareketli destek sergi yorumudur.', 'engine', trunnions, true],
      ['Kaynak ve Rekonstrüksiyon', 'Tarih: Kore Ulusal Tarih Enstitüsü. Dış görünüm: Korea Culture Information Service Agency rekonstrüksiyonu. Ölçüler yaklaşık; sıralı eksilme gerçek atış temposu değildir.', 'iso', frame, false]
    ].map(a => ({ title: a[0], desc: a[1], cam: a[2], part: a[3], cutaway: a[4], explode: 0, sub: 'all' }));
    const ui = K.ui({ portraitCameraScale: 1.85, title: 'HWACHA — Munjong • 1451', sub: 'Joseon • 100 Singijeon • Yaklaşık dış rekonstrüksiyon',
      subsystems: Object.entries(counts).map(([key, count], i) => ({ key, label: key, count, color: ['#aa8056', '#6e8290', '#a98a5b', '#8c955d'][i] })),
      camLabels: { iso: 'Genel', front: 'Yüz Ok', breech: 'Arka Saplar', engine: 'Kaset', suspension: 'Ahşap Araba', top: 'Üst' },
      sliders: [{ label: 'Sıralı İnceleme Hızı (temsili)', min: .5, max: 2, step: .5, fmt: v => v + '×' },
        { label: 'Kaset İnceleme Açısı', min: 10, max: 35, step: 1, fmt: v => v + '°' },
        { label: 'Levhaları Ayır (sergi)', min: 0, max: 100, step: 1, fmt: v => '%' + v }],
      buttons: { terrain: 'Okları Göster / Gizle', sweep: 'Başlangıca Dön' }, telemetryTag: '1451 • JOSEON • MÜZE YORUMU',
      statLabels: ['KASETTEKİ OK', 'İNCELEME AÇISI', 'GÖSTERİM HIZI', 'LEVHA ARALIĞI'] });
    ui.textures = Object.entries(finishes).map(([key, f]) => ({ key, label: f.label }));
    ui.textureLabel = () => finishes[finish].label; ui.activeTexture = () => finish; ui.relief = () => relief;
    ui.reliefLabel = v => 'Ahşap ve Pim Ayrıntıları: ' + (v ? 'AÇIK' : 'KAPALI');
    applyTextures(false); sync();
    return { root, parts, ui, camPresets, tourSteps, defaultPart: front, firePart: shafts, update, onFire: fire,
      fireButtonLabel: () => !S.remaining ? 'KASETİ YENİLE (100)' : S.playing ? 'İNCELEMEYİ DURAKLAT' : 'SIRALI İNCELEMEYİ BAŞLAT',
      mobileFireButtonLabel: () => !S.remaining ? 'Yenile (100)' : S.playing ? 'Duraklat' : 'Sıralı İnceleme',
      onSlider: (i, v) => { if (!Number.isFinite(v)) return {}; S.playing = false;
        if (i === 0) S.speed = T.MathUtils.clamp(v, .5, 2); if (i === 1) S.angle = T.MathUtils.clamp(v, 10, 35); if (i === 2) S.spread = T.MathUtils.clamp(v, 0, 100); sync(); return {}; },
      onButton: n => { if (n === 'terrain') { S.arrows = !S.arrows; S.playing = false; sync(); } else reset(); return {}; },
      buttonActive: n => n === 'terrain' ? S.arrows : false,
      getSliderValues: () => [S.speed, S.angle, S.spread],
      getStats: () => [S.remaining + ' <span>/ 100</span>', S.angle + ' <span>°</span>', S.speed + ' <span>× temsili</span>', S.spread + ' <span>% sergi</span>'],
      getStatus: () => ({ text: S.playing ? 'SIRALI EKSİLME • TEMSİLİ' : 'DURAKLATILDI • İNCELE', color: '#957343' }),
      applyTextures, setTexture: k => { if (finishes[k]) finish = k; }, toggleRelief: () => { relief = !relief; return relief; } };
  };
})();
