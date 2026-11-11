/* Saturn V — Rocketdyne F-1 sıvı yakıtlı roket motoru ve Mark 10 türbopompa kesiti (1:1 ölçek). Akış ve itki değerleri eğitim amaçlıdır; gerçek termodinamik/CFD simülasyonu değildir. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.saturnv_f1 = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'saturnv_f1');
    const { T, root, parts, mats: M, mesh, box, cyl, ring, pipe, beam, instances } = K;

    const S = {
      throttle: 75, gimbalX: 0, gimbalZ: 0,
      firing: false, showFlow: true, foilOff: false,
      shaftAngle: 0, flowPhase: 0
    };
    const counts = {}; let n = 0;

    M.paint.color.setHex(0x3a434a); M.paint.metalness = 0.55; M.paint.roughness = 0.52;
    const inconel = M.steel.clone(); inconel.color.setHex(0x7a838b); inconel.metalness = 0.82; inconel.roughness = 0.34;
    const foilMat = M.brass.clone(); foilMat.color.setHex(0xb49658); foilMat.metalness = 0.72; foilMat.roughness = 0.38; foilMat.userData.paint = true;
    const copperBaffle = M.brass.clone(); copperBaffle.color.setHex(0xc2783c); copperBaffle.metalness = 0.80; copperBaffle.roughness = 0.30;
    const standMat = M.paint.clone(); standMat.color.setHex(0x455058); standMat.userData.paint = true;
    const loxFlowMat = new T.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85, depthWrite: false });
    const rp1FlowMat = new T.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.85, depthWrite: false });
    const outerPlumeMat = new T.MeshBasicMaterial({ color: 0xff8c24, transparent: true, opacity: 0.55, depthWrite: false, side: T.DoubleSide });
    const corePlumeMat = new T.MeshBasicMaterial({ color: 0xfff0b8, transparent: true, opacity: 0.88, depthWrite: false });

    function G(parent, pos, name) {
      const g = new T.Group(); g.position.set(...pos); if (name) g.name = name; parent.add(g); return g;
    }
    function P(key, name, sub, desc, exp = [0, 0.5, 0], outer = false, parent = root) {
      counts[sub] = (counts[sub] || 0) + 1;
      const p = K.part(key, ++n + '. ' + name, sub, [0, 0, 0], exp, desc, outer, parent);
      p.userData.material = 'Inconel-X750 nikel alaşımı, paslanmaz çelik, bakır enjektör ve ısıl folyo ceket';
      p.userData.spec = 'Rocketdyne F-1 (NASM A19700271000 referanslı) • 1:1 ölçek (~5,6 m motor boyu, Ø 3,7 m lüle ağzı)';
      return p;
    }
    const UP = new T.Vector3(0, 1, 0), tmpA = new T.Vector3(), tmpB = new T.Vector3(), tmpD = new T.Vector3();
    function stretch(o, a, b) {
      tmpA.set(...a); tmpB.set(...b);
      o.position.copy(tmpA).add(tmpB).multiplyScalar(0.5);
      tmpD.copy(tmpB).sub(tmpA);
      o.scale.y = Math.max(tmpD.length(), 1e-4);
      o.quaternion.setFromUnitVectors(UP, tmpD.normalize());
    }
    function latheBell(parent, pts, mat, a0 = 0, aLen = Math.PI * 2) {
      const vecs = pts.map(([r, y]) => new T.Vector2(r, y));
      const geo = new T.LatheGeometry(vecs, 48, a0, aLen);
      const m = mat.clone(); m.side = T.DoubleSide;
      if (mat.userData && mat.userData.paint) m.userData.paint = true;
      return mesh(parent, geo, m);
    }

    // --------------------------------------------------------- 1..3 STATİK TEST STANDI VE KARDAN VEKTÖRLEME
    const testStand = P('testStand', 'Statik Test ve Müze İtki Çerçevesi', 'Stand ve Vektörleme',
      '6,77 MN (1,5 milyon lbf) deniz seviyesi itkisini karşılayan üst itki köprüsü, dört çelik kolon ve alev çukuru taban halkası.',
      [0, -0.4, 0], false);
    // Zemin pabuçları y = 0.000
    for (const sx of [-2.45, 2.45]) {
      for (const sz of [-2.45, 2.45]) {
        box(testStand, [0.68, 0.12, 0.68], [sx, 0.06, sz], M.dark); // alt yüzey y = 0.000
        beam(testStand, [sx, 0.12, sz], [sx * 0.78, 7.55, sz * 0.78], 0.22, standMat);
      }
    }
    ring(testStand, 2.35, [0, 0.08, 0], M.dark, 0.08, [Math.PI / 2, 0, 0]); // alev yönlendirme halkası (min.y = 0.000)
    // Üst çapraz itki köprüsü (y = 7.55)
    box(testStand, [4.10, 0.30, 0.42], [0, 7.55, 0], standMat);
    box(testStand, [0.42, 0.30, 4.10], [0, 7.55, 0], standMat);
    for (const s of [-1, 1]) {
      beam(testStand, [s * 2.45, 0.12, -2.45], [s * 1.91, 7.55, 1.91], 0.10, M.steel);
      beam(testStand, [-2.45, 0.12, s * 2.45], [1.91, 7.55, s * 1.91], 0.10, M.steel);
    }

    const PIV_Y = 7.22;
    const engineGimbal = G(root, [0, PIV_Y, 0], 'engine-gimbal');

    const gimbalBearing = P('gimbalBearing', 'Üniversal Kardan İtki Mafsalı (±6°)', 'Stand ve Vektörleme',
      'Saturn V S-IC kademesini yönlendirmek için tüm 8,4 tonluk motoru X ve Z eksenlerinde ±6° yatıran çapraz pimli itki yatağı.',
      [0, 1.3, 0], false);
    cyl(gimbalBearing, 0.42, 0.34, [0, 7.36, 0], M.steel);
    box(gimbalBearing, [0.58, 0.32, 0.58], [0, PIV_Y, 0], M.dark);
    cyl(gimbalBearing, 0.09, 0.76, [0, PIV_Y, 0], inconel, 'x');
    cyl(gimbalBearing, 0.09, 0.76, [0, PIV_Y, 0], inconel, 'z');

    const gimbalRams = P('gimbalRams', 'İkiz Hidrolik Vektörleme Silindirleri (X / Z)', 'Stand ve Vektörleme',
      'Üst test çerçevesi ile yanma odası kulakları arasında çalışan dik açılı iki hidrolik servo aktüatör.',
      [0.6, 1.1, 0.6], false);
    const ramX = { cylO: cyl(gimbalRams, 0.075, 1, [0, 0, 0], M.paint), rodO: cyl(gimbalRams, 0.048, 1, [0, 0, 0], inconel) };
    const ramZ = { cylO: cyl(gimbalRams, 0.075, 1, [0, 0, 0], M.paint), rodO: cyl(gimbalRams, 0.048, 1, [0, 0, 0], inconel) };

    // engineGimbal yerel koordinatlarında y = 0 -> dünya y = 7.22
    // Lüle ağzı yerel y = -5.32 -> dünya y = 1.90 (Ø 3.70 m, R = 1.85 m)
    const bellProfile = [
      [0.58, -0.95], // yanma odası üstü (dünya y=6.27)
      [0.62, -1.35], // silindirik yanma bölgesi
      [0.48, -1.85], // ses hızı boğazı (dünya y=5.37)
      [0.82, -2.55],
      [1.26, -3.65], // türbin egzoz manifoldu birleşimi (dünya y=3.57)
      [1.60, -4.50],
      [1.85, -5.32]  // çıkış ağzı Ø 3.70 m (dünya y=1.90)
    ];

    // --------------------------------------------------------- 4..10 YANMA ODASI, BÖLMELİ ENJEKTÖR VE LÜLE
    const insulation = P('insulation', 'Isıl Folyo Battaniye ve Dış Koruma Ceketleri', 'Yanma Odası ve Lüle',
      'Uçuş motorlarında taban geri akış ısısına karşı sarılan Inconel folyo ısıl battaniye. X-Ray veya ceket düğmesiyle kaldırıldığında alttaki soğutma boruları görülür.',
      [-0.8, 0.4, 0], true, engineGimbal);
    const insGroup = G(insulation, [0, 0, 0], 'foil-blanket');
    latheBell(insGroup, bellProfile.slice(0, 5).map(([r, y]) => [r + 0.035, y]), foilMat, Math.PI * 0.32, Math.PI * 1.45);

    const injectorDome = P('injectorDome', 'LOX Kubbesi ve Kararsızlık Önleyici Bölmeli Enjektör', 'Yanma Odası ve Lüle',
      'Üstteki yüksek basınçlı sıvı oksijen kubbesi ve yanma kararsızlığını bastıran radyal/çevresel bakır bölmeli (baffle) enjektör plakası.',
      [0, 1.0, 0], false, engineGimbal);
    mesh(injectorDome, new T.SphereGeometry(0.58, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), inconel, [0, -0.82, 0]);
    cyl(injectorDome, 0.34, 0.52, [0, -0.22, 0], inconel);
    // Bakır enjektör yüzü ve radyal/halka bölmeler (X-Ray veya alttan bakışta net görünür)
    cyl(injectorDome, 0.57, 0.06, [0, -0.92, 0], copperBaffle);
    ring(injectorDome, 0.28, [0, -0.97, 0], copperBaffle, 0.025, [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 6; i++) {
      box(injectorDome, [0.52, 0.09, 0.022], [0, -0.98, 0], copperBaffle, [0, i * Math.PI / 6, 0]);
    }

    const thrustChamber = P('thrustChamber', 'Rejeneratif Soğutma Borulu Yanma Odası ve Boğaz', 'Yanma Odası ve Lüle',
      'RP-1 yakıtının 3.300 °C alev ısısına karşı duvarı soğutmak için içinden dolaştığı fırın kaynaklı 178 Inconel-X750 boru demeti.',
      [0, 0.3, 0], false, engineGimbal);
    latheBell(thrustChamber, bellProfile.slice(0, 5), M.dark);
    // Çevresel rejeneratif boru demeti temsili (36 konturlu dikey tüp)
    const tubeCurvePts = bellProfile.slice(0, 5).map(([r, y]) => new T.Vector3(r + 0.014, y, 0));
    const singleTubeGeo = new T.TubeGeometry(new T.CatmullRomCurve3(tubeCurvePts), 28, 0.018, 6, false);
    instances(thrustChamber, singleTubeGeo, inconel, Array.from({ length: 36 }, (_, i) => ({
      pos: [0, 0, 0], rot: [0, i * 2 * Math.PI / 36, 0]
    })));

    const bands = P('bands', 'Yüksek Basınç Çember Kuşakları', 'Yanma Odası ve Lüle',
      ' ~70 bar iç yanma basıncına karşı soğutma borularını dıştan kuşatan dövme çelik takviye çemberleri.',
      [0, 0.2, 0.5], false, engineGimbal);
    for (const [r, y] of [[0.64, -1.15], [0.64, -1.48], [0.51, -1.85], [0.74, -2.35], [1.04, -3.05]]) {
      ring(bands, r, [0, y, 0], M.steel, 0.028, [Math.PI / 2, 0, 0]);
    }

    const exhaustManifold = P('exhaustManifold', 'Sarmal Türbin Egzoz Manifoldu', 'Türbopompa ve Gaz Üreteci',
      'Türbinden çıkan yakıtça zengin ılık gazı lülenin çevresine dağıtan dev salyangoz halka manifold.',
      [-0.5, 0, 0.6], false, engineGimbal);
    ring(exhaustManifold, 1.38, [0, -3.58, 0], inconel, 0.20, [Math.PI / 2, 0, 0]);
    // Türbinden manifolda bağlanan geniş egzoz dirseği
    pipe(exhaustManifold, [[1.22, -2.55, 0], [1.45, -3.12, 0.25], [1.38, -3.55, 0.35]], 0.19, inconel);

    const nozzleExt = P('nozzleExt', 'Perde Soğutmalı Alt Lüle Uzantısı (Ø 3,7 m)', 'Yanma Odası ve Lüle',
      '10:1’den 16:1 genleşme oranına büyüyen sökülebilir alt çan uzantısı. X-Ray ile çift cidarlı perde soğutma kanalları görülür.',
      [0, -0.9, 0], true, engineGimbal);
    latheBell(nozzleExt, bellProfile.slice(4), M.paint, 0.45, Math.PI * 1.72); // kesit pencereli alt çan
    ring(nozzleExt, 1.86, [0, -5.32, 0], inconel, 0.035, [Math.PI / 2, 0, 0]);

    const curtainSlots = P('curtainSlots', 'Türbin Gazı Perde Soğutma Enjeksiyon Kanalları', 'Yanma Odası ve Lüle',
      'Manifolddan alt lüle iç duvarına koruyucu sınır tabakası (film cooling) üfleyen çevresel oluklar ve iç nervürler.',
      [0, -0.6, 0.4], false, engineGimbal);
    latheBell(curtainSlots, bellProfile.slice(4).map(([r, y]) => [r - 0.025, y]), copperBaffle, 0, Math.PI * 2);
    instances(curtainSlots, new T.BoxGeometry(0.03, 0.18, 0.05), inconel, Array.from({ length: 32 }, (_, i) => {
      const a = i * 2 * Math.PI / 32;
      return { pos: [Math.cos(a) * 1.28, -3.72, Math.sin(a) * 1.28], rot: [0, -a, 0] };
    }));

    // --------------------------------------------------------- 11..14 55.000 BG MARK 10 TÜRBOPOMPA VE GAZ ÜRETECİ
    const PX = 1.22, PZ = 0;
    const pumpCasing = P('pumpCasing', '55.000 BG Mark 10 Türbopompa Gövdesi (Kesitli)', 'Türbopompa ve Gaz Üreteci',
      'Saniyede ~2,6 ton toplam itici yakıt basan dev türbopompa dış salyangozları. Ön yüzü kesitlidir; X-Ray tüm gövdeyi saydamlaştırır.',
      [1.1, 0.4, 0], true, engineGimbal);
    const pCaseMat = inconel.clone(); pCaseMat.side = T.DoubleSide;
    mesh(pumpCasing, new T.CylinderGeometry(0.46, 0.46, 1.85, 32, 1, true, Math.PI * 0.25, Math.PI * 1.45), pCaseMat, [PX, -1.65, PZ]);
    ring(pumpCasing, 0.48, [PX, -0.88, PZ], inconel, 0.06, [Math.PI / 2, 0, 0]); // üst LOX salyangozu
    ring(pumpCasing, 0.44, [PX, -1.55, PZ], inconel, 0.055, [Math.PI / 2, 0, 0]); // orta RP-1 salyangozu
    beam(pumpCasing, [0.58, -1.15, 0], [PX - 0.35, -1.15, 0], 0.12, M.steel);
    beam(pumpCasing, [0.68, -2.25, 0], [PX - 0.35, -2.25, 0], 0.12, M.steel);

    const pumpRotor = P('pumpRotor', 'Ortak Şaft: LOX Çarkı, RP-1 Çarkı ve 2 Kademeli Türbin', 'Türbopompa ve Gaz Üreteci',
      'Tek ortak mil üzerinde dönen üst LOX santrifüj çarkı, orta RP-1 yakıt çarkı ve altta 55.000 BG üreten iki kademeli türbin diski. Gaz kolu %0 iken tam durur.',
      [1.4, 0.4, 0.4], false, engineGimbal);
    const shaftGroup = G(pumpRotor, [PX, -1.65, PZ], 'turbopump-shaft');
    cyl(shaftGroup, 0.075, 1.92, [0, 0, 0], inconel);
    // Üst LOX çarkı (y = +0.76)
    cyl(shaftGroup, 0.34, 0.11, [0, 0.76, 0], M.steel);
    instances(shaftGroup, new T.BoxGeometry(0.24, 0.09, 0.025), loxFlowMat.color ? inconel : inconel, Array.from({ length: 12 }, (_, i) => {
      const a = i * Math.PI / 6;
      return { pos: [Math.cos(a) * 0.22, 0.76, Math.sin(a) * 0.22], rot: [0, -a + 0.35, 0] };
    }));
    // Orta RP-1 çarkı (y = +0.10)
    cyl(shaftGroup, 0.31, 0.10, [0, 0.10, 0], copperBaffle);
    instances(shaftGroup, new T.BoxGeometry(0.22, 0.08, 0.025), copperBaffle, Array.from({ length: 12 }, (_, i) => {
      const a = i * Math.PI / 6;
      return { pos: [Math.cos(a) * 0.20, 0.10, Math.sin(a) * 0.20], rot: [0, -a + 0.35, 0] };
    }));
    // Alt 2 kademeli türbin diskleri (y = -0.52 ve -0.76)
    for (const ty of [-0.52, -0.76]) {
      cyl(shaftGroup, 0.30, 0.06, [0, ty, 0], foilMat);
      instances(shaftGroup, new T.BoxGeometry(0.12, 0.055, 0.022), foilMat, Array.from({ length: 24 }, (_, i) => {
        const a = i * Math.PI / 12;
        return { pos: [Math.cos(a) * 0.35, ty, Math.sin(a) * 0.35], rot: [0.32, -a, 0] };
      }));
    }

    const pumpStator = P('pumpStator', 'Türbopompa Difüzör ve Türbin Stator Kanatları', 'Türbopompa ve Gaz Üreteci',
      'LOX ile RP-1 sızıntısını ayıran ara salmastra yatağı ve iki türbin kademesi arasındaki sabit yönlendirme kanatları.',
      [1.3, 0.2, -0.3], false, engineGimbal);
    ring(pumpStator, 0.38, [PX, -1.25, PZ], M.dark, 0.035, [Math.PI / 2, 0, 0]);
    ring(pumpStator, 0.39, [PX, -2.29, PZ], M.steel, 0.03, [Math.PI / 2, 0, 0]); // iki türbin arası sabit stator halkası

    const gasGen = P('gasGen', 'Küresel Gaz Üreteci ve Isı Eşanjörü', 'Türbopompa ve Gaz Üreteci',
      'Ana akışın ~%3’ünü yakıtça zengin yakarak türbini çeviren küresel yanma odası ve tank basınçlandırma ısı eşanjörü.',
      [1.5, 0.1, -0.6], false, engineGimbal);
    mesh(gasGen, new T.SphereGeometry(0.28, 24, 16), copperBaffle, [PX + 0.42, -1.95, -0.45]);
    pipe(gasGen, [[PX + 0.42, -2.18, -0.45], [PX + 0.22, -2.18, -0.22], [PX, -2.15, 0]], 0.095, inconel);
    cyl(gasGen, 0.18, 0.62, [PX - 0.15, -2.85, -0.42], foilMat); // ısı eşanjörü

    // --------------------------------------------------------- 15..17 YÜKSEK BASINÇ BORULARI VE AKIŞ/ATEŞLEME
    const loxDucts = P('loxDucts', 'Çift Yüksek Basınçlı LOX Borusu ve Ana Valf', 'Besleme ve Akış',
      'LOX pompasından çıkan sıvı oksijeni üst LOX kubbesine ileten iki yüksek basınç besleme borusu ve ana oksijen valfleri.',
      [0.8, 0.9, 0.4], false, engineGimbal);
    for (const sz of [-0.26, 0.26]) {
      pipe(loxDucts, [[PX, -0.88, sz * 0.6], [0.92, -0.42, sz], [0.44, -0.48, sz * 0.7]], 0.085, inconel);
      box(loxDucts, [0.22, 0.22, 0.22], [0.78, -0.45, sz], M.paint);
    }

    const fuelDucts = P('fuelDucts', 'RP-1 Yakıt Halkası ve Besleme Valfleri', 'Besleme ve Akış',
      'RP-1 kerosen yakıtını yanma odası çevresindeki rejeneratif soğutma borularına dağıtan halka manifold ve ana yakıt valfleri.',
      [0.7, 0.2, 0.6], false, engineGimbal);
    ring(fuelDucts, 0.68, [0, -1.65, 0], copperBaffle, 0.048, [Math.PI / 2, 0, 0]);
    for (const sz of [-0.28, 0.28]) {
      pipe(fuelDucts, [[PX - 0.25, -1.55, sz * 0.7], [0.85, -1.62, sz], [0.66, -1.65, sz * 0.8]], 0.068, copperBaffle);
    }

    const plumeFlow = P('plumeFlow', 'İç Akış Vurgusu ve Statik Ateşleme Alevi', 'Besleme ve Akış',
      'Mavi sıvı oksijen (LOX), kehribar RP-1 yakıt akışı ve statik ateşleme sırasında Ø 3,7 m lüleden çıkan şok elmaslı alev konisi.',
      [0, -1.2, 0], false, engineGimbal);
    const flowMarkers = [];
    for (let i = 0; i < 4; i++) {
      const mLox = new T.Mesh(new T.SphereGeometry(0.055, 10, 10), loxFlowMat);
      plumeFlow.add(mLox);
      flowMarkers.push({ o: mLox, kind: 'lox', lane: i / 4 });
      const mRp1 = new T.Mesh(new T.SphereGeometry(0.05, 10, 10), rp1FlowMat);
      plumeFlow.add(mRp1);
      flowMarkers.push({ o: mRp1, kind: 'rp1', lane: i / 4 });
    }
    const hotPlume = G(plumeFlow, [0, -5.32, 0], 'hot-fire-plume');
    // Alev konisi y = -5.32'den en fazla -1.78 aşağı iner -> dünya y >= 7.22 - 7.10 = 0.12 > 0 (zeminin altına taşmaz!)
    const pOuter = new T.Mesh(new T.ConeGeometry(1.72, 1.72, 32, 1, true), outerPlumeMat);
    pOuter.rotation.x = Math.PI;
    pOuter.position.set(0, -0.86, 0);
    hotPlume.add(pOuter);
    const pCore = new T.Mesh(new T.ConeGeometry(0.95, 1.35, 24), corePlumeMat);
    pCore.rotation.x = Math.PI;
    pCore.position.set(0, -0.68, 0);
    hotPlume.add(pCore);

    // --------------------------------------------------------- KİNEMATİK VE SENKRONİZASYON
    function sync() {
      if (S.throttle <= 0 && S.firing) S.firing = false; // %0 gazda ateşleme emniyet kilidi

      const gx = S.gimbalX * Math.PI / 180;
      const gz = S.gimbalZ * Math.PI / 180;
      engineGimbal.rotation.set(gx, 0, gz);
      engineGimbal.updateMatrixWorld(true);

      // X ve Z hidrolik gimbal silindirlerinin dünya/root uzayında bağlanması
      const attachX = new T.Vector3(0.62, -1.25, 0).applyEuler(engineGimbal.rotation).add(engineGimbal.position);
      const anchorX = [1.82, 7.42, 0];
      const midX = [(anchorX[0] + attachX.x) * 0.5, (anchorX[1] + attachX.y) * 0.5, (anchorX[2] + attachX.z) * 0.5];
      stretch(ramX.cylO, anchorX, midX);
      stretch(ramX.rodO, midX, attachX.toArray());

      const attachZ = new T.Vector3(0, -1.25, 0.62).applyEuler(engineGimbal.rotation).add(engineGimbal.position);
      const anchorZ = [0, 7.42, 1.82];
      const midZ = [(anchorZ[0] + attachZ.x) * 0.5, (anchorZ[1] + attachZ.y) * 0.5, (anchorZ[2] + attachZ.z) * 0.5];
      stretch(ramZ.cylO, anchorZ, midZ);
      stretch(ramZ.rodO, midZ, attachZ.toArray());

      insGroup.visible = !S.foilOff;
      shaftGroup.rotation.y = S.shaftAngle;

      const activeFlow = S.showFlow && S.throttle > 0;
      flowMarkers.forEach(m => {
        m.o.visible = activeFlow;
        const u = (S.flowPhase + m.lane) % 1;
        if (m.kind === 'lox') {
          m.o.position.set(PX * (1 - u), -0.88 + Math.sin(u * Math.PI) * 0.45, 0.24);
        } else {
          const ang = u * Math.PI * 2;
          m.o.position.set(Math.cos(ang) * 0.66, -1.65 - u * 1.6, Math.sin(ang) * 0.66);
        }
      });

      hotPlume.visible = S.firing && S.throttle > 0;
      const sc = 0.55 + 0.45 * (S.throttle / 100);
      hotPlume.scale.set(0.95 + 0.05 * Math.sin(S.flowPhase * 30), sc, 0.95 + 0.05 * Math.cos(S.flowPhase * 30));
    }

    function update(dt) {
      if (!Number.isFinite(dt)) return;
      dt = T.MathUtils.clamp(dt, 0, 0.05);
      if (S.throttle > 0) {
        const frac = S.throttle / 100;
        S.shaftAngle = (S.shaftAngle + dt * frac * 14) % (Math.PI * 200);
        S.flowPhase = (S.flowPhase + dt * frac * 1.2) % 1;
      }
      sync();
    }

    const camPresets = {
      iso: { pos: [9.8, 5.8, 11.2], look: [0.2, 3.85, 0] },
      front: { pos: [0.2, 4.2, 10.2], look: [0.2, 4.1, 0] },
      breech: { pos: [3.2, 1.4, 5.6], look: [0, 3.2, 0] },
      engine: { pos: [5.0, 5.4, 1.3], look: [0.85, 5.25, 0] },
      suspension: { pos: [-3.8, 7.6, 4.4], look: [0, 6.8, 0] },
      top: { pos: [0.1, 14.5, 0.1], look: [0, 4.5, 0] }
    };

    const tourSteps = [
      ['Rocketdyne F-1: Tek Odalı En Güçlü Sıvı Yakıtlı Roket Motoru', 'Apollo/Saturn V’in birinci kademesinde beş adet F-1 motoru birlikte 33,8 MN itki üretti. 1:1 müze ölçeğindeki modelde motor boyu ~5,6 m, alt lüle çapı 3,7 metredir.', 'iso', thrustChamber, false],
      ['55.000 BG Mark 10 Türbopompa ve Ortak Şaft', 'Kesitten içeri bakın: üstte sıvı oksijen (LOX) çarkı, ortada RP-1 kerosen çarkı ve altta iki kademeli türbin tek mil üzerinde döner. Gaz kolu %0 olduğunda şaft tamamen durur.', 'engine', pumpRotor, true],
      ['Rejeneratif Borulu Yanma Odası ve Isıl Folyo Ceket', '“Isıl Folyo Ceket” düğmesiyle veya X-Ray ile dış battaniyeyi kaldırın: RP-1 yakıtı yanma odasına girmeden önce 178 Inconel borudan geçerek duvarı erimekten korur.', 'front', thrustChamber, true],
      ['Bölmeli (Baffle) Bakır Enjektör: Kararsızlığa Çözüm', 'Geliştirme yıllarındaki yıkıcı basınç dalgalanmaları, bakır enjektör yüzüne yerleştirilen radyal ve dairesel bölmelerle (Project First) bastırıldı.', 'suspension', injectorDome, true],
      ['Sarmal Türbin Manifoldu ve Alt Lüle Perde Soğutması', 'Türbinden çıkan görece ılık (~650 °C) gaz doğrudan dışarı atılmaz; sarmal manifolddan geçerek Ø 3,7 m alt çanın iç yüzeyine koruyucu gaz perdesi üfler.', 'breech', exhaustManifold, true],
      ['±6° Kardan Vektörleme ve Statik Ateşleme', 'X ve Z kardan kaydırıcılarıyla tüm motoru ±6° yatırın; ikiz hidrolik aktüatörler uzayıp kısalır. Gaz açıkken statik ateşlemeyi başlatın.', 'iso', gimbalBearing, false]
    ].map(a => ({ title: a[0], desc: a[1], cam: a[2], part: a[3], cutaway: a[4], explode: 0, sub: 'all' }));

    const ui = K.ui({
      title: 'Saturn V — Rocketdyne F-1 Roket Motoru ve Türbopompa Kesiti',
      sub: '1967 Apollo 4 ilk uçuş • 1:1 Ölçek (Ø 3,7 m lüle) • 55.000 BG Türbopompa & ±6° Vektörleme',
      portraitCameraScale: 1.5,
      shadowExtent: 11,
      subsystems: Object.entries(counts).map(([key, count]) => ({ key, label: key, count, color: '#455058' })),
      camLabels: {
        iso: 'Genel Stand', front: 'Yanma Odası', breech: 'Ø 3,7 m Lüle İçi',
        engine: 'Türbopompa Kesiti', suspension: 'LOX Kubbesi & Kardan', top: 'Üst'
      },
      sliders: [
        { label: 'Türbopompa Debi / Gaz Kolu', min: 0, max: 100, step: 1, fmt: v => Math.round(v) + '%' },
        { label: 'Kardan Eğimi X (Yunuslama)', min: -6, max: 6, step: 0.5, fmt: v => v.toFixed(1) + '°' },
        { label: 'Kardan Eğimi Z (Sapma)', min: -6, max: 6, step: 0.5, fmt: v => v.toFixed(1) + '°' }
      ],
      buttons: { terrain: 'Isıl Folyo Ceket', sweep: 'Akış İşaretleri' },
      telemetryTag: 'F-1 • LOX / RP-1 • 6,77 MN',
      statLabels: ['TÜRBOPOMPA DEVRİ', 'TOPLAM DEBİ (TEMSİLİ)', 'VEKTÖR AÇISI', 'STATİK ATEŞLEME']
    });

    sync();
    return {
      root, parts, ui, camPresets, tourSteps,
      defaultPart: pumpRotor, firePart: plumeFlow, update,
      engineGimbal, shaftGroup, ramX, ramZ, hotPlume,
      onFire: () => {
        if (S.throttle <= 0) return { ok: false, msg: 'Türbopompa debisi %0 iken ateşleme kilitli — önce gaz kolunu açın.' };
        S.firing = !S.firing;
        sync();
        if (S.firing && ctx.audio && ctx.audio.playCannonFire) ctx.audio.playCannonFire();
        return { ok: true, msg: S.firing ? 'Statik ateşleme aktif (LOX + RP-1).' : 'Ana valfler kapatıldı — statik ateşleme durduruldu.' };
      },
      fireButtonLabel: () => S.throttle <= 0 ? 'DEBİ %0 — ATEŞLEME KİLİTLİ' : S.firing ? 'ATEŞLEMEYİ DURDUR' : 'STATİK ATEŞLEME BAŞLAT',
      mobileFireButtonLabel: () => S.throttle <= 0 ? 'Kilitli' : S.firing ? 'Durdur' : 'Ateşle',
      onSlider: (i, v) => {
        if (!Number.isFinite(v)) return {};
        if (i === 0) S.throttle = T.MathUtils.clamp(v, 0, 100);
        if (i === 1) S.gimbalX = T.MathUtils.clamp(v, -6, 6);
        if (i === 2) S.gimbalZ = T.MathUtils.clamp(v, -6, 6);
        sync(); return {};
      },
      onButton: name => {
        if (name === 'terrain') S.foilOff = !S.foilOff;
        if (name === 'sweep') S.showFlow = !S.showFlow;
        sync(); return {};
      },
      buttonActive: name => name === 'terrain' ? S.foilOff : name === 'sweep' ? S.showFlow : false,
      getSliderValues: () => [S.throttle, S.gimbalX, S.gimbalZ],
      getStats: () => {
        const rpm = Math.round(5500 * (S.throttle / 100));
        const flowKgs = Math.round(2577 * (S.throttle / 100));
        return [
          rpm + ' <span>dev/dk</span>',
          flowKgs + ' <span>kg/sn LOX+RP1</span>',
          S.gimbalX.toFixed(1) + '° / ' + S.gimbalZ.toFixed(1) + '° <span>X/Z</span>',
          (S.firing && S.throttle > 0 ? 'AKTİF' : 'KAPALI') + ' <span>test</span>'
        ];
      },
      getStatus: () => S.firing && S.throttle > 0
        ? { text: 'STATİK ATEŞLEME AKTİF • TÜRBOPOMPA VE PERDE SOĞUTMA ÇALIŞIYOR', color: '#d96b1f' }
        : S.throttle > 0
          ? { text: 'SOĞUK ÇEVRİM • MARK 10 TÜRBOPOMPA DÖNÜYOR', color: '#387594' }
          : { text: 'TÜRBOPOMPA DURDU • ATEŞLEME EMNİYET KİLİDİNDE', color: '#455058' },
      applyTextures: K.applyTextures, setTexture: K.setTexture, toggleRelief: K.toggleRelief
    };
  };
})();
