/* Leonardo's scythed chariot, c.1485 — British Museum 1860,0616.99.
 * An interpretive museum reconstruction, NOT a surviving working vehicle.
 * Units and gear ratios below are exhibit design choices, not historical measurements.
 * Rear axle X -> longitudinal lantern shaft Z -> front crown/rotor Y.
 */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.scythed = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'scythed');
    const { T, root, parts, mats: M, part, mesh, box, cyl, ring, pipe, beam, instances } = K;
    const AXLE_Y = .86, REAR_Z = -2.8, FRONT_Z = 4.25;
    const CROWN_R = .4, PINION_R = CROWN_R / 3;
    const S = { rpm: 0, phase: 0, cover: 0, horses: true, emphasis: false };
    const counts = {}, driven = [], details = [], woodMeshes = [];
    let partNumber = 0, finish = 'oak', relief = true;

    // Repeatable, fine longitudinal grain; no image downloads or asset dependencies.
    const pixels = new Uint8Array(256 * 64 * 4);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 256; x++) {
      const g = Math.sin(y * 2.3 + Math.sin(x * .025) * .9) * 13
        + Math.sin(y * 7.7 + x * .035) * 5 + Math.sin(x * 1.7 + y * 53) * 3;
      const v = Math.round(202 + g);
      pixels.set([v, v, v, 255], (y * 256 + x) * 4);
    }
    const grain = new T.DataTexture(pixels, 256, 64, T.RGBAFormat);
    grain.colorSpace = T.SRGBColorSpace;
    grain.wrapS = grain.wrapT = T.RepeatWrapping; grain.needsUpdate = true;
    M.wood.color.setHex(0x89613d); M.wood.map = grain; M.wood.bumpMap = grain;
    M.wood.bumpScale = .012; M.wood.userData.wood = true;
    M.steel.color.setHex(0x575b59); M.steel.roughness = .48;
    M.dark.color.setHex(0x343736); M.dark.roughness = .65;
    const carved = M.wood.clone(); carved.color.setHex(0x745039);
    const leather = new T.MeshStandardMaterial({ color: 0x392b24, roughness: .95 });
    const edge = new T.MeshStandardMaterial({ color: 0xa4aaa6, metalness: .8, roughness: .32 });

    function P(key, name, sub, desc, explode, outer = false) {
      counts[sub] = (counts[sub] || 0) + 1;
      const p = part(key, (++partNumber) + '. ' + name, sub, [0, 0, 0], explode, desc, outer);
      Object.assign(p.userData, { material: 'Ahşap, dövme demir ve deri — görsel yorum',
        weight: 'Tarihsel kütle bilinmiyor', spec: 'Çizimden rekonstrüksiyon; boyutlar ve iç aktarım yorumsal' });
      return p;
    }
    function group(parent, pos, name) {
      const g = new T.Group(); g.position.set(...pos); g.name = name; parent.add(g); return g;
    }
    function ellipsoid(p, pos, scale, mat = carved, rotation = [0, 0, 0]) {
      const o = mesh(p, new T.SphereGeometry(1, 24, 16), mat, pos, rotation);
      o.scale.set(...scale); return o;
    }
    function pegRow(p, pts, radius = .028, mat = M.dark) {
      const o = instances(p, new T.SphereGeometry(radius, 8, 6), mat, pts.map(pos => ({ pos })));
      details.push(o); return o;
    }

    const chassis = P('chassis', 'Zıvanalı Ahşap Şasi', 'Araba',
      'Arka iki tekerleği ve uzun ön çerçeveyi taşıyan ahşap kirişler. Birleşim ve ölçüler çizimin müze yorumudur.', [0, .4, -.8]);
    for (const x of [-.72, .72]) box(chassis, [.19, .23, 2.0], [x, 1.03, -2.65], M.wood);
    for (const z of [-3.5, -1.85]) box(chassis, [1.72, .18, .18], [0, 1.07, z], M.wood);
    for (const x of [-.64, .64]) {
      beam(chassis, [x, .32, -3.4], [-x, .32, -1.9], .09, M.wood);
      for (const z of [-3.4, -1.9]) beam(chassis, [x, .32, z], [x, 1.03, z], .07, M.wood);
    }

    const deck = P('deck', 'Açılabilir Sergi Paneli', 'Araba',
      'Arka platformun ahşap panelleri. Menteşeli açılış, iç dişlileri göstermek için eklenmiş sergi özelliğidir; çizimde belgelenmiş bir kapak değildir.', [0, 1.3, 0], true);
    const lid = group(deck, [-.8, 1.39, -2.65], 'inspection-lid');
    for (let i = 0; i < 8; i++) box(lid, [.19, .075, 1.45], [.1 + i * .20, 0, 0], M.wood);
    for (const z of [-.58, .58]) box(lid, [1.6, .045, .09], [.8, .06, z], M.dark);
    pegRow(lid, Array.from({ length: 16 }, (_, i) => [.1 + (i % 8) * .20, .09, i < 8 ? -.58 : .58]), .018);

    const ironwork = P('ironwork', 'Demir Kuşaklar ve Ahşap Pimler', 'Araba',
      'Kiriş uçlarındaki kuşaklar, pim başları ve kapak menteşeleri. Modern altıgen cıvata yerine dönemle uyumlu sade bağlantı biçimleri.', [0, .6, -.5]);
    for (const x of [-.72, .72]) for (const z of [-3.45, -1.9]) {
      box(ironwork, [.23, .035, .18], [x, 1.17, z], M.dark);
      box(ironwork, [.035, .25, .18], [x + Math.sign(x) * .11, 1.04, z], M.dark);
    }
    for (const z of [-3.2, -2.1]) cyl(ironwork, .045, .22, [-.8, 1.39, z], M.steel, 'z');
    pegRow(ironwork, [-3.45, -1.9].flatMap(z => [-.72, .72].map(x => [x, 1.20, z])));

    const axlePart = P('axle', 'Arka Dingil ve Yatakları', 'Aktarma',
      'Tekerleklerle aynı fazda dönen enine dingil. Ortadaki taç dişli, hareketi boyuna mile aktarır.', [0, -.18, -.6]);
    const axle = group(axlePart, [0, AXLE_Y, REAR_Z], 'rear-axle');
    cyl(axle, .09, 2.65, [0, 0, 0], M.dark, 'x');
    for (const x of [-.72, .72]) {
      box(axlePart, [.26, .32, .30], [x, AXLE_Y, REAR_Z], M.wood);
      cyl(axlePart, .12, .28, [x, AXLE_Y, REAR_Z], M.steel, 'x');
    }
    const wheelsPart = P('wheels', 'Ahşap İspitli Tekerlekler', 'Araba',
      'On iki parmak, dilimli ahşap ispit, demir çember ve pimli göbek. Tekerlekler sergi yerinde döner; atlar sabit heykel olarak gösterilir.', [0, 0, -1]);
    const wheels = [];
    for (const side of [-1, 1]) {
      const w = group(wheelsPart, [side * 1.1, AXLE_Y, REAR_Z], 'wheel-' + side); wheels.push(w);
      const rim = mesh(w, new T.TorusGeometry(.755, .085, 8, 72), M.wood, [0, 0, 0], [0, Math.PI / 2, 0]);
      rim.scale.z = 1.35;
      ring(w, .842, [0, 0, 0], M.dark, .018, [0, Math.PI / 2, 0]);
      for (const x of [-.09, .09]) ring(w, .775, [x, 0, 0], M.dark, .018, [0, Math.PI / 2, 0]);
      cyl(w, .17, .36, [0, 0, 0], M.wood, 'x');
      cyl(w, .18, .07, [side * .18, 0, 0], M.dark, 'x');
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        beam(w, [0, .13 * Math.cos(a), .13 * Math.sin(a)], [0, .74 * Math.cos(a), .74 * Math.sin(a)], .075, M.wood);
      }
      pegRow(w, Array.from({ length: 24 }, (_, i) => [side * .11, .775 * Math.cos(i * Math.PI / 12), .775 * Math.sin(i * Math.PI / 12)]), .021);
      box(w, [.05, .26, .045], [side * .27, 0, 0], M.steel);
    }

    const rearGearPart = P('rearGear', 'Arka Ahşap Taç Dişli', 'Aktarma',
      'Sergi yorumunda 24 pimli taç dişli ve 8 çubuklu fener dişli kullanılır. 3:1 oran tarihsel ölçüm değildir.', [0, .6, -.5]);
    const rearGear = group(rearGearPart, [-PINION_R - .18, AXLE_Y, REAR_Z], 'rear-crown');
    cyl(rearGear, .44, .12, [0, 0, 0], M.wood, 'x');
    ring(rearGear, .37, [-.07, 0, 0], M.dark, .025, [0, Math.PI / 2, 0]);
    instances(rearGear, new T.CylinderGeometry(.026, .026, .12, 10), M.wood,
      Array.from({ length: 24 }, (_, i) => { const a = i * Math.PI / 12; return { pos: [.12, CROWN_R * Math.cos(a), CROWN_R * Math.sin(a)], rot: [0, 0, Math.PI / 2] }; }));
    driven.push(rearGear);

    const pinionPart = P('pinions', 'İki Fener Dişli', 'Aktarma',
      'Boyuna milin iki ucunda açık kafesli fener dişliler. Çubuklar ahşap diskleri bağlar; iki dik açılı aktarımın oranları birbirini dengeler.', [.6, .5, 0]);
    const pinions = [];
    for (const z of [REAR_Z + CROWN_R, FRONT_Z - CROWN_R]) {
      const g = group(pinionPart, [0, AXLE_Y, z], 'lantern'); pinions.push(g);
      for (const dz of [-.115, .115]) cyl(g, .17, .045, [0, 0, dz], M.wood, 'z');
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        cyl(g, .018, .23, [PINION_R * Math.cos(a), PINION_R * Math.sin(a), 0], M.wood, 'z');
      }
      driven.push(g);
    }
    const shaftPart = P('shaft', 'Uzun Boyuna Tahrik Mili', 'Aktarma',
      'Atların altından geçen mil, arka fener dişliyi ön fener dişliye kesintisiz bağlar. Mil ve iki fener dişli aynı açısal hızdadır.', [0, .35, 0]);
    const shaft = group(shaftPart, [0, AXLE_Y, .7], 'long-shaft');
    cyl(shaft, .055, 6.5, [0, 0, 0], M.dark, 'z');
    for (const z of [-2.6, 0, 2.6]) { cyl(shaft, .075, .15, [0, 0, z], M.steel, 'z'); box(shaft, [.15, .035, .045], [0, 0, z], M.wood); }
    driven.push(shaft);
    const bearings = P('bearings', 'Mil Yatakları ve Çapraz Destekler', 'Aktarma',
      'Uzun mili taşıyan yatak köprüleri ve ön düşey mil desteği. Şasiye bağlanmayan, boşlukta duran aktarma parçaları yoktur.', [0, -.22, 0]);
    for (const z of [-1.65, 1.55, 3.55]) {
      beam(bearings, [-1.35, .62, z], [1.35, .62, z], .10, M.wood);
      box(bearings, [.23, .28, .18], [0, .75, z], M.wood);
      cyl(bearings, .09, .22, [0, AXLE_Y, z], M.steel, 'z');
    }

    const frontGearPart = P('frontGear', 'Ön Taç Dişli ve Düşey Mil', 'Aktarma',
      'Mil ucundaki fener dişli, yatay düzlemdeki taç dişliyi döndürür. Temas noktasında iki dişlinin teğetsel hareket yönleri aynıdır.', [0, .6, .4]);
    const frontGear = group(frontGearPart, [0, 1.1733333333, FRONT_Z], 'front-crown');
    cyl(frontGear, .44, .12, [0, 0, 0], M.wood);
    instances(frontGear, new T.CylinderGeometry(.026, .026, .13, 10), M.wood,
      Array.from({ length: 24 }, (_, i) => { const a = i * Math.PI / 12; return { pos: [CROWN_R * Math.cos(a), -.125, CROWN_R * Math.sin(a)] }; }));
    cyl(frontGear, .065, .86, [0, -.10, 0], M.dark);
    driven.push(frontGear);

    const rotorPart = P('rotor', 'Dört Kollu Orak Taşıyıcısı', 'Kesici Düzen', '', [0, .9, .5]);
    rotorPart.userData.desc = 'Öndeki dört kollu yatay düzen, British Museum çiziminin ayırt edici biçimidir. Kolların altındaki eğik destekler dönerek birlikte hareket eder.';
    const rotor = group(rotorPart, [0, 1.48, FRONT_Z], 'front-rotor');
    cyl(rotor, .22, .20, [0, 0, 0], M.wood);
    ring(rotor, .22, [0, .11, 0], M.dark, .025, [-Math.PI / 2, 0, 0]);
    for (let i = 0; i < 4; i++) {
      const g = group(rotor, [0, 0, 0], 'arm'); g.rotation.y = i * Math.PI / 2;
      box(g, [1.35, .11, .15], [.78, 0, 0], M.wood);
      beam(g, [.12, -.30, 0], [1.15, -.03, 0], .06, M.dark);
      for (const x of [.4, 1.2]) box(g, [.09, .14, .19], [x, 0, 0], M.dark);
    }
    const bladesPart = P('blades', 'Dört Kavisli Orak Bıçağı', 'Kesici Düzen',
      'Düz çubuk yerine incelen, kavisli orak profilleri. Biçim çizimden yorumlanmıştır; kesici imalat ölçüleri veya kullanım hesabı sunulmaz.', [0, 1.2, .6]);
    const blades = group(bladesPart, [0, 1.48, FRONT_Z], 'blade-rotor');
    function bladeGeometry() {
      const s = new T.Shape(); s.moveTo(1.14, -.07); s.lineTo(1.44, -.08);
      s.bezierCurveTo(1.86, -.04, 2.02, .30, 1.95, .67);
      s.bezierCurveTo(1.87, .43, 1.69, .28, 1.42, .24);
      s.lineTo(1.14, .07); s.closePath();
      const g = new T.ExtrudeGeometry(s, { depth: .035, bevelEnabled: true, bevelThickness: .008, bevelSize: .008, bevelSegments: 1, curveSegments: 20 });
      g.rotateX(-Math.PI / 2); return g;
    }
    const bladeGeo = bladeGeometry();
    for (let i = 0; i < 4; i++) {
      const g = group(blades, [0, 0, 0], 'scythe'); g.rotation.y = i * Math.PI / 2;
      mesh(g, bladeGeo, M.steel);
      pipe(g, [[1.95, .04, -.67], [1.87, .04, -.43], [1.69, .04, -.28], [1.42, .04, -.24]], .009, edge);
      pegRow(g, [[1.21, .06, 0], [1.35, .06, -.02]], .024);
    }

    const outriggers = P('outriggers', 'Uzun Çeki Çerçevesi', 'Araba',
      'İki yandaki uzun ahşap kiriş ve ön çaprazlar; ön kesici düzeni arka arabaya bağlar. Atların ve orakların hareket hacminden ayrı yerleştirilmiştir.', [0, -.15, .4]);
    for (const x of [-1.35, 1.35]) {
      beam(outriggers, [Math.sign(x) * .72, .65, -2.9], [x, .65, -1.65], .12, M.wood);
      beam(outriggers, [x, .65, -1.65], [x, .65, 3.6], .12, M.wood);
      beam(outriggers, [x, .65, 3.6], [0, .7, FRONT_Z], .12, M.wood);
      for (const z of [-1.6, 1.55, 3.5]) box(outriggers, [.16, .16, .07], [x, .65, z], M.dark);
    }
    box(bearings, [.28, .46, .28], [0, .85, FRONT_Z], M.wood);
    ring(bearings, .10, [0, 1.08, FRONT_Z], M.steel, .03, [-Math.PI / 2, 0, 0]);

    const draft = P('draft', 'Boyunduruk ve Çeki Bağlantıları', 'Koşum',
      'Atların göğüs koşumları ve araba arasında çeki bağlantıları. Hayvanlar, ölçü ve düzeni anlatan sabit oyma figürlerdir.', [.4, .3, 0]);
    beam(draft, [-1.15, 1.45, .8], [1.15, 1.45, .8], .09, M.wood);
    for (const x of [-.80, .80]) {
      ring(draft, .07, [x, 1.45, .8], M.steel, .017);
      pipe(draft, [[x, 1.45, .8], [x * 1.45, 1.15, -.3], [Math.sign(x) * .72, 1.1, -1.85]], .025, leather);
    }
    const horsesPart = P('horses', 'İki Oyma At Figürü', 'Koşum',
      'Çizimdeki atlı çekişi ve insan ölçeğini anlatan stilize ahşap heykeller. Düğmeyle gizlenerek alttaki mil bütünüyle incelenebilir.', [-1.5, .2, 0]);
    const horseFigures = group(horsesPart, [0, 0, 0], 'horse-figures');
    const harness = P('harness', 'Deri Koşum, Dizgin ve Tokalar', 'Koşum',
      'Boyun, göğüs, başlık ve dizgin ayrıntıları. Görsel rekonstrüksiyon; özgün bir koşum takımının birebir kopyası değildir.', [1.5, .2, 0]);
    const tack = group(harness, [0, 0, 0], 'horse-tack');
    for (const x of [-.83, .83]) {
      const h = group(horseFigures, [x, 0, -.15], 'carved-horse');
      ellipsoid(h, [0, 1.57, -.05], [.32, .43, .83]);
      ellipsoid(h, [0, 1.61, .48], [.30, .45, .36]);
      ellipsoid(h, [0, 1.57, -.65], [.33, .40, .35]);
      ellipsoid(h, [0, 2.02, .68], [.23, .65, .29], carved, [.30, 0, 0]);
      ellipsoid(h, [0, 2.49, .97], [.19, .29, .34], carved, [.28, 0, 0]);
      ellipsoid(h, [0, 2.30, 1.23], [.16, .16, .27]);
      for (const side of [-1, 1]) {
        ellipsoid(h, [side * .12, 2.80, .83], [.055, .19, .095], carved, [.18, 0, side * -.22]);
        ellipsoid(h, [side * .18, 2.52, 1.08], [.025, .027, .035], M.dark);
        ellipsoid(h, [side * .13, 2.31, 1.42], [.025, .018, .035], M.dark);
        for (const back of [false, true]) {
          const z = back ? -.65 : .48, kneeZ = back ? -.48 : .57;
          ellipsoid(h, [side * .23, 1.13, z], [.12, .38, .15], carved, [back ? -.24 : .08, 0, 0]);
          ellipsoid(h, [side * .23, .76, kneeZ], [.10, .12, .11]);
          beam(h, [side * .23, .76, kneeZ], [side * .23, .19, z + .10], .09, carved);
          ellipsoid(h, [side * .23, .34, z + .09], [.075, .23, .08]);
          box(h, [.18, .15, .25], [side * .23, .075, z + .14], M.dark);
        }
      }
      pipe(h, [[0, 1.8, -.83], [0, 1.45, -1.1], [.08, .75, -1.16]], .075, carved);
      pipe(h, [[0, 2.65, .69], [0, 2.22, .37], [0, 1.77, .35]], .065, M.dark);
      const t = group(tack, [x, 0, -.15], 'tack');
      const collar = ring(t, .34, [0, 1.91, .65], leather, .045); collar.scale.y = 1.35;
      const belly = ring(t, .36, [0, 1.57, -.12], leather, .035); belly.scale.y = 1.22;
      pipe(t, [[-.20, 2.56, .85], [-.19, 2.43, 1.11], [-.15, 2.30, 1.35], [.15, 2.30, 1.35], [.19, 2.43, 1.11], [.20, 2.56, .85]], .022, leather);
      for (const side of [-1, 1]) {
        ring(t, .045, [side * .19, 2.32, 1.19], M.brass, .012, [0, Math.PI / 2, 0]);
        pipe(t, [[side * .19, 2.32, 1.19], [side * .35, 1.97, -.15], [Math.sign(x) * .73 - x, 1.40, -1.75]], .012, leather);
      }
      box(t, [.075, .12, .025], [.35, 1.55, -.12], M.brass);
    }
    const controls = P('controls', 'Arka Korkuluk ve Dizgin Bağları', 'Araba',
      'Arka platformun alçak korkuluğu ve dizgin bağlama halkaları. İnceleme kapağının hareket alanı serbest bırakılmıştır.', [0, .4, -1]);
    for (const x of [-.73, .73]) {
      beam(controls, [x, 1.1, -3.45], [x, 1.72, -3.45], .08, M.wood);
      ring(controls, .065, [x, 1.40, -1.9], M.dark, .018);
      beam(controls, [x, 1.12, -1.9], [x, 1.35, -1.9], .035, M.dark);
    }
    beam(controls, [-.73, 1.72, -3.45], [.73, 1.72, -3.45], .08, M.wood);

    const display = P('display', 'Müze Desteği ve Dönüş İzi', 'Sergi',
      'Ön ünitenin altındaki beşik modern sergi desteğidir. Kesik halka, orakların dönüş hacmini gösterir; tarihsel aracın parçası değildir.', [0, -.05, .6]);
    box(display, [1.3, .12, .7], [0, .06, FRONT_Z], M.dark);
    for (const x of [-.38, .38]) beam(display, [x, .12, FRONT_Z], [0, .65, FRONT_Z], .08, M.steel);
    const sweepGroup = group(display, [0, .025, FRONT_Z], 'sweep-guide');
    const guideMat = new T.MeshBasicMaterial({ color: 0xad844a, transparent: true, opacity: .32, depthWrite: false });
    for (let i = 0; i < 20; i++) {
      const o = new T.Mesh(new T.TorusGeometry(2.08, .012, 5, 8, .17), guideMat);
      o.rotation.set(-Math.PI / 2, 0, i * Math.PI / 10); sweepGroup.add(o);
    }

    // Material bookkeeping is local to this model; keep the shared helper untouched.
    for (const entry of K.meshes) if (entry.o.material.userData.wood) woodMeshes.push(entry.o);
    const finishes = { oak: { label: 'Eskitilmiş Meşe', color: 0x89613d }, walnut: { label: 'Koyu Ceviz', color: 0x57402e },
      ash: { label: 'Açık Ahşap', color: 0xb49a70 }, study: { label: 'Nötr Müze Modeli', color: 0x91958c } };
    function applyTextures(blueprint) {
      K.applyTextures(blueprint);
      for (const o of woodMeshes) {
        o.userData.origColor.setHex(finishes[finish].color);
        if (!blueprint) o.material.color.copy(o.userData.origColor);
        o.material.map = grain; o.material.bumpMap = relief ? grain : null;
        o.material.bumpScale = .012; o.material.needsUpdate = true;
      }
      details.forEach(o => { o.visible = relief; });
    }
    function sync() {
      axle.rotation.x = S.phase; wheels.forEach(w => { w.rotation.x = S.phase; }); rearGear.rotation.x = S.phase;
      shaft.rotation.z = S.phase * 3; pinions.forEach(p => { p.rotation.z = S.phase * 3; });
      frontGear.rotation.y = S.phase; rotor.rotation.y = S.phase; blades.rotation.y = S.phase;
      lid.rotation.z = S.cover * Math.PI / 200;
      horseFigures.visible = tack.visible = S.horses;
      draft.children.forEach(o => { o.visible = S.horses; });
      for (const g of driven) g.traverse(o => {
        if (o.isMesh && o.material.emissive) { o.material.emissive.setHex(S.emphasis ? 0x6e3b0c : 0); o.material.emissiveIntensity = S.emphasis ? .45 : 0; }
      });
      sweepGroup.visible = S.emphasis;
    }
    function update(dt) {
      if (Number.isFinite(dt)) S.phase = (S.phase + S.rpm * Math.max(0, Math.min(dt, .05)) * Math.PI / 30) % (Math.PI * 2);
      sync();
    }
    const camPresets = {
      iso: { pos: [11, 7.5, 12], look: [0, 1.1, .6] }, front: { pos: [4.5, 5, 8], look: [0, 1.1, FRONT_Z] },
      breech: { pos: [4.5, 3.5, -6], look: [0, 1, REAR_Z] }, engine: { pos: [2.4, 2.8, -4.4], look: [-.1, .95, -2.5] },
      suspension: { pos: [4.6, 3, 2.4], look: [0, 1.3, .1] }, top: { pos: [.01, 14, .6], look: [0, 0, .6] }
    };
    const tourSteps = [
      ['Bir Çizimden Müze Modeline', 'Leonardo, yaklaşık 1485. British Museum 1860,0616.99 çizimi temel alınır. Yapıldığı veya savaşta kullanıldığı doğrulanmış bir araç değildir.', 'iso', chassis, false],
      ['Ahşap İspit ve Demir Çember', 'Büyük arka tekerleklerde ahşap parmaklar, göbek pimleri ve demir kuşaklar. Ahşap kaplamaları değiştirerek yüzeyleri inceleyin.', 'breech', wheelsPart, false],
      ['İlk Dik Açılı Aktarım', 'Arka taç dişli → fener dişli → uzun mil. 24/8 oranı, çizimde eksik kalan iç mekanizmayı anlatmak için seçilmiş bir sergi yorumudur.', 'engine', rearGearPart, true],
      ['Atlı Çekiş ve Uzun Mil', 'Oyma atları gizleyerek gövdelerin altındaki mil ve yataklarını görün. Atlar sabittir; gösterim gerçek yürüyüş simülasyonu değildir.', 'suspension', draft, false],
      ['Dört Kavisli Orak', 'Öndeki ikinci aktarım yatay dört kolu döndürür. Faz kaydırıcısı gösterimi durdurur; istediğiniz açıyı tek tek inceleyebilirsiniz.', 'front', bladesPart, false],
      ['Tasarımla Gerçek Arasındaki Mesafe', 'Özgün çizim bir üretim planı değildir. Ölçüler, dişliler, kapak ve sergi beşiği yorumlanmıştır. Savaşta kullanılmış bir araçla karıştırılmamalıdır.', 'top', frontGearPart, false]
    ].map(a => ({ title: a[0], desc: a[1], cam: a[2], part: a[3], cutaway: a[4], explode: 0, sub: 'all' }));
    const ui = K.ui({ portraitCameraScale: 1.9, title: 'LEONARDO — Oraklı Savaş Arabası',
      sub: '~1485 • Çizimden rekonstrüksiyon • Ahşap, demir ve atlı çekiş', shadowExtent: 11, fog: { near: 50, far: 140 },
      subsystems: Object.entries(counts).map(([key, count], i) => ({ key, label: key, count, color: ['#a77c4a', '#647b83', '#b39358', '#8d7261', '#718670'][i] })),
      camLabels: { iso: 'Genel', front: 'Oraklar', breech: 'Tekerlekler', engine: 'Dişli Aktarımı', suspension: 'Atlar ve Koşum', top: 'Üst Görünüm' },
      sliders: [{ label: 'Tekerlek Gösterim Devri', min: 0, max: 18, step: 1, fmt: v => v + ' dev/dk' },
        { label: 'Elle İnceleme Fazı', min: 0, max: 360, step: 1, fmt: v => Math.round(v) + '°' },
        { label: 'Sergi Kapağı Açıklığı', min: 0, max: 100, step: 1, fmt: v => '%' + v }],
      buttons: { terrain: 'Atları Göster / Gizle', sweep: 'Başlangıç Pozu', mode: true },
      telemetryTag: 'ÇİZİMDEN REKONSTRÜKSİYON', statLabels: ['TEKERLEK', 'BOYUNA MİL', 'ÖN ROTOR', 'AKTARIM YORUMU'] });
    ui.textures = Object.entries(finishes).map(([key, f]) => ({ key, label: f.label }));
    ui.textureLabel = () => finishes[finish].label; ui.activeTexture = () => finish;
    ui.relief = () => relief; ui.reliefLabel = v => 'Ahşap ve Pim Ayrıntıları: ' + (v ? 'AÇIK' : 'KAPALI');
    applyTextures(false); sync();
    return { root, parts, ui, camPresets, tourSteps, defaultPart: chassis, firePart: bladesPart, update,
      onSlider: (i, v) => { if (!Number.isFinite(v)) return {}; if (i === 0) S.rpm = T.MathUtils.clamp(v, 0, 18);
        if (i === 1) { S.phase = T.MathUtils.clamp(v, 0, 360) * Math.PI / 180; S.rpm = 0; }
        if (i === 2) S.cover = T.MathUtils.clamp(v, 0, 100); sync(); return {}; },
      onButton: name => { if (name === 'terrain') S.horses = !S.horses;
        else if (name === 'mode') S.emphasis = !S.emphasis;
        else Object.assign(S, { rpm: 0, phase: 0, cover: 0, horses: true, emphasis: false }); sync(); return {}; },
      buttonActive: name => name === 'terrain' ? S.horses : name === 'mode' ? S.emphasis : false,
      modeLabel: () => S.emphasis ? 'AKTARIM VURGUSU: AÇIK' : 'GÜÇ AKTARIMINI İZLE',
      onFire: () => { S.rpm = S.rpm ? 0 : 6; return { ok: true }; },
      fireButtonLabel: () => S.rpm ? 'MEKANİK GÖSTERİMİ DURDUR' : 'MEKANİK GÖSTERİMİ BAŞLAT',
      mobileFireButtonLabel: () => S.rpm ? 'Gösterimi Durdur' : 'Mekaniği Oynat',
      getSliderValues: () => [S.rpm, S.phase * 180 / Math.PI, S.cover],
      getStats: () => [S.rpm + ' <span>dev/dk</span>', S.rpm * 3 + ' <span>dev/dk</span>', S.rpm + ' <span>dev/dk</span>', '3:1 → 1:3 <span>temsili</span>'],
      getStatus: () => ({ text: S.rpm ? 'YAVAŞ MEKANİK GÖSTERİM' : 'DURAKLATILDI • İNCELE', color: '#967043' }),
      applyTextures, setTexture: key => { if (finishes[key]) finish = key; }, toggleRelief: () => { relief = !relief; return relief; } };
  };
})();
