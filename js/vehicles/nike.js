/* MIM-14 Nike Hercules — Yüksek İrtifa Hava Savunma Füzesi & 4× M5E1 Booster (1959)
 * NPS Golden Gate / White Sands referanslı müze sergisi; iç yakıt ve güdüm yerleşimi eğitim amaçlıdır. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.nike = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'nike');
    const { T, root, parts, mats, mesh, box, cyl, ring, pipe, beam, instances } = K;
    const english = window.MuseumPreferences?.language === 'en';
    const t = (tr, en) => (english ? en : tr);

    const PIVOT_POS = new T.Vector3(0, 0.78, -2.05);
    const BASE_HULL_Y = 0.42;

    const state = {
      elevDeg: 58,     // Rampa dikme açısı (0..85°)
      stageSep: 0,     // Kademe ayrılma incelemesi (%0..%100)
      elevonDeg: 0,    // Elevon dümen açısı (-20..+20°)
      showPad: true,
      launched: false,
      flightRatio: 0,
      animating: false
    };

    const counts = {};
    let partIndex = 0;

    function mat(color, metalness = 0.45, roughness = 0.48, paint = false) {
      const m = new T.MeshStandardMaterial({ color, metalness, roughness, bumpScale: 0.002 });
      m.userData.paint = paint;
      return m;
    }

    const oliveMat = mat(0x525d47, 0.35, 0.65, true);
    const whiteMat = mat(0xe2e6e0, 0.28, 0.52, true);
    const orangeMat = mat(0xc45824, 0.35, 0.50, false);
    const steelMat = mats.steel.clone();
    const darkMat = mats.dark.clone();
    const concreteMat = mat(0x888b86, 0.05, 0.94, false);
    const grainMat = mat(0xb88635, 0.12, 0.72, false);
    const brassMat = mats.brass.clone();
    const copperMat = mat(0xa8643a, 0.68, 0.42, false);
    const flameMat = new T.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.85 });

    function part(id, tr, en, subTr, subEn, descTr, descEn, basePos = [0, 0, 0], exp = [0, 0.5, 0], outer = false, parent = root) {
      const sub = t(subTr, subEn);
      counts[sub] = (counts[sub] || 0) + 1;
      const p = K.part(id, ++partIndex + '. ' + t(tr, en), sub, basePos, exp, t(descTr, descEn), outer, parent);
      Object.assign(p.userData, {
        material: t('Alüminyum/çelik füze gövdesi, katı roket yakıtı ve beton mevzii', 'Aluminum/steel airframe, solid propellant grains and concrete pad'),
        weight: t('~4.850 kg tam kalkış kütlesi (4× M5E1 booster dahil)', '~4,850 kg full launch mass (including 4× M5E1 booster)'),
        spec: t('MIM-14 Nike Hercules • ~12,5 m toplam boy • M42 booster kümesi', 'MIM-14 Nike Hercules • ~12.5 m total length • M42 booster cluster')
      });
      return p;
    }

    // -------------------------------------------------------------------------
    // A. HİDROLİK FIRLATMA RAMPASI (HYDRAULIC LAUNCHER) — 5 Grup
    // -------------------------------------------------------------------------
    const pad = part(
      'pad',
      'Saha Beton Mevzii ve Ankraj Plakası',
      'Concrete launch pad & anchors',
      'Hidrolik Fırlatma Rampası',
      'Hydraulic Launcher',
      'Sabit Nike batarya mevziindeki beton taban ve ray ankraj plakaları.',
      'Reinforced concrete battery pad and launcher anchor plates.',
      [0, 0, 0],
      [0, -0.35, 0]
    );
    box(pad, [4.6, 0.14, 7.2], [0, 0.07, 0.2], concreteMat);
    for (const [x, z] of [[-1.6, -2.5], [1.6, -2.5], [-1.6, 2.7], [1.6, 2.7]]) {
      box(pad, [0.42, 0.12, 0.42], [x, 0.20, z], steelMat);
    }

    const baseFrame = part(
      'baseFrame',
      'Rampa Alt Şasisi ve Arka Muylu Yatağı',
      'Launcher base frame & rear trunnion',
      'Hidrolik Fırlatma Rampası',
      'Hydraulic Launcher',
      'Rampa rayını arka mafsalda taşıyan kaynaklı çelik alt şasi ve yan payandalar.',
      'Welded steel launcher base carrying the rear trunnion pivot and hydraulic cylinder mounts.',
      [0, 0, 0],
      [0, -0.2, -0.5]
    );
    box(baseFrame, [1.55, 0.16, 4.4], [0, 0.22, -0.35], oliveMat);
    for (const x of [-0.62, 0.62]) {
      beam(baseFrame, [x, 0.26, -2.25], [x, PIVOT_POS.y, PIVOT_POS.z], 0.12, steelMat);
      beam(baseFrame, [x, 0.26, -1.25], [x, PIVOT_POS.y, PIVOT_POS.z], 0.10, steelMat);
      box(baseFrame, [0.16, 0.22, 0.28], [x * 0.84, 0.36, -0.85], darkMat); // Alt hidrolik kulak
    }
    cyl(baseFrame, 0.07, 1.48, [0, PIVOT_POS.y, PIVOT_POS.z], steelMat, 'x');

    const erectorCylinders = part(
      'erectorCylinders',
      'Teleskopik İkiz Hidrolik Dikme Silindirleri',
      'Telescopic twin hydraulic erector cylinders',
      'Hidrolik Fırlatma Rampası',
      'Hydraulic Launcher',
      'Füze rayını 0°’den 85° atış açısına kadar kaldıran ikiz teleskopik hidrolik silindirler.',
      'Twin telescopic hydraulic cylinders elevating the launch rail from 0° to 85° firing angle.',
      [0, 0, 0],
      [0.65, 0.25, 0]
    );
    const cylGroups = [];
    for (const x of [-0.52, 0.52]) {
      const barrelG = new T.Group();
      barrelG.position.set(x, 0.38, -0.85);
      erectorCylinders.add(barrelG);
      const outerTube = cyl(barrelG, 0.075, 1.0, [0, 0.5, 0], oliveMat, 'y');

      const rodG = new T.Group();
      erectorCylinders.add(rodG);
      const innerRod = cyl(rodG, 0.044, 1.0, [0, -0.5, 0], steelMat, 'y');
      cylGroups.push({ x, baseAnchor: new T.Vector3(x, 0.38, -0.85), barrelG, outerTube, rodG, innerRod });
    }

    // Hareketli rampa grubu (PIVOT_POS etrafında X ekseninde döner)
    const railPivot = new T.Group();
    railPivot.position.copy(PIVOT_POS);
    root.add(railPivot);

    const launchRail = part(
      'launchRail',
      'Fırlatma Rayı ve Göbek Bağı Kolu',
      'Launch rail & umbilical mast',
      'Hidrolik Fırlatma Rampası',
      'Hydraulic Launcher',
      'Füzeyi kalkış boyunca yönlendiren kafes fırlatma rayı ve ateşleme göbek bağı kolu.',
      'Lattice elevation rail guiding the missile at ignition, fitted with a side umbilical mast.',
      [0, 0, 0],
      [0, 0.2, 0.6],
      false,
      railPivot
    );
    for (const x of [-0.52, 0.52]) {
      box(launchRail, [0.10, 0.14, 4.3], [x, -0.04, 2.05], oliveMat);
      box(launchRail, [0.14, 0.18, 0.22], [x, -0.10, 2.35], darkMat); // Üst silindir mafsalı
    }
    for (let z = 0.35; z <= 3.95; z += 0.72) {
      box(launchRail, [1.14, 0.08, 0.12], [0, -0.06, z], steelMat);
    }
    beam(launchRail, [0.58, 0.0, 1.3], [0.58, 0.65, 1.4], 0.06, darkMat);

    const blastDeflector = part(
      'blastDeflector',
      'Arka Çelik Alev Saptırıcı Kalkan',
      'Rear steel blast deflector',
      'Hidrolik Fırlatma Rampası',
      'Hydraulic Launcher',
      '4× M5E1 katı yakıtlı booster ateşlendiğinde egzoz jetini geriye ve yukarı saptıran çelik kalkan.',
      'Heavy steel blast shield deflecting the initial exhaust jet of all four M5E1 boosters.',
      [0, 0, 0],
      [0, -0.2, -1.0]
    );
    box(blastDeflector, [1.85, 0.78, 0.12], [0, 0.48, -2.55], steelMat, [0.62, 0, 0]);
    for (const x of [-0.72, 0.72]) {
      beam(blastDeflector, [x, 0.14, -3.08], [x, 0.56, -2.62], 0.07, darkMat);
    }

    // Füzenin tamamını taşıyan eksenel kalkış grubu (railPivot içine oturur)
    const missileFlightGroup = new T.Group();
    missileFlightGroup.position.set(0, BASE_HULL_Y, 0.55);
    railPivot.add(missileFlightGroup);

    const stage1Group = new T.Group();
    missileFlightGroup.add(stage1Group);

    const stage2Group = new T.Group();
    stage2Group.position.set(0, 0, 2.55);
    missileFlightGroup.add(stage2Group);

    // -------------------------------------------------------------------------
    // B. 1. KADEME: 4× M5E1 BOOSTER (STAGE 1 BOOSTER CLUSTER) — 4 Grup
    // -------------------------------------------------------------------------
    const boosterOffsets = [
      [-0.17, 0.17],
      [0.17, 0.17],
      [-0.17, -0.17],
      [0.17, -0.17]
    ];

    const boosterTubes = part(
      'boosterTubes',
      '1. Kademe: 4× M5E1 Katı Yakıt Tüpleri',
      'Stage 1: 4× M5E1 booster tubes',
      '1. Kademe: 4× M5E1 Booster',
      'Stage 1: 4× M5E1 Booster',
      'İlk 3,5 saniyede füzeyi ses üstü hıza çıkaran kare kümeli dört adet katı yakıtlı Nike motoru.',
      'Cluster of four M5E1 solid-rocket casings accelerating the missile past Mach 3 in seconds.',
      [0, 0, 0],
      [0, 0.3, -0.8],
      true,
      stage1Group
    );
    for (const [bx, by] of boosterOffsets) {
      cyl(boosterTubes, 0.145, 2.35, [bx, by, 1.25], whiteMat, 'z');
    }

    const solidGrains = part(
      'solidGrains',
      'Yıldız Kesitli Katı Yakıt Çekirdekleri',
      'Star-perforated solid fuel grains',
      '1. Kademe: 4× M5E1 Booster',
      'Stage 1: 4× M5E1 Booster',
      'X-Ray modunda görünen yüksek itkili yıldız kanallı katı roket yakıt blokları.',
      'Internal star-core solid propellant charges revealed in X-Ray mode.',
      [0, 0, 0],
      [0, 0.65, -0.4],
      false,
      stage1Group
    );
    for (const [bx, by] of boosterOffsets) {
      cyl(solidGrains, 0.105, 2.05, [bx, by, 1.25], grainMat, 'z');
    }

    const boosterNozzles = part(
      'boosterNozzles',
      '4× Yakınsak-Iraksak Laval Lüleleri',
      '4× De Laval exhaust nozzles',
      '1. Kademe: 4× M5E1 Booster',
      'Stage 1: 4× M5E1 Booster',
      'Dört motorun arkasında yer alan yüksek ısıya dayanıklı çelik Laval egzoz lüleleri.',
      'Four steel exhaust nozzles terminating the M42 booster cluster.',
      [0, 0, 0],
      [0, 0, -1.2],
      false,
      stage1Group
    );
    for (const [bx, by] of boosterOffsets) {
      cyl(boosterNozzles, 0.135, 0.24, [bx, by, -0.02], darkMat, 'z', 0.085);
    }

    const boosterFins = part(
      'boosterFins',
      'Kuyruk Stabilize Kanatları ve Taşıyıcı Kafes',
      'Booster stabilizing fins & tie frame',
      '1. Kademe: 4× M5E1 Booster',
      'Stage 1: 4× M5E1 Booster',
      'Dört roket gövdesini bir arada tutan arka kafes ve geniş X-konfigürasyonlu stabilize kanatçıkları.',
      'Rear structural collar binding the four boosters with wide X-configuration stabilizing fins.',
      [0, 0, 0],
      [0.45, 0.45, -0.8],
      false,
      stage1Group
    );
    box(boosterFins, [0.58, 0.58, 0.22], [0, 0, 0.22], oliveMat);
    box(boosterFins, [0.56, 0.56, 0.18], [0, 0, 2.25], oliveMat);
    const bFinShape = new T.Shape();
    bFinShape.moveTo(0, 0);
    bFinShape.lineTo(0.85, 0);
    bFinShape.lineTo(0.32, 0.72);
    bFinShape.lineTo(0, 0.72);
    bFinShape.closePath();
    const bFinGeo = new T.ExtrudeGeometry(bFinShape, { depth: 0.03, bevelEnabled: false });
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const finG = new T.Group();
      finG.rotation.z = a;
      boosterFins.add(finG);
      mesh(finG, bFinGeo, orangeMat, [0.24, 0, 0.05], [0, Math.PI / 2, 0]);
    }

    // -------------------------------------------------------------------------
    // C. 2. KADEME: SUSTAINER FÜZESİ (STAGE 2 SUSTAINER) — 5 Grup
    // -------------------------------------------------------------------------
    const sustainerHull = part(
      'sustainerHull',
      '2. Kademe: Sustainer Gövde ve Ojiv Burun',
      'Stage 2: Sustainer airframe & nose cone',
      '2. Kademe: Sustainer Füzesi',
      'Stage 2: Sustainer',
      '1. kademe ayrıldıktan sonra yüksek irtifaya tırmanan uzun sustainer füze gövdesi ve konik burun.',
      'Slender second-stage missile body and ogive nose cone carrying warhead and guidance.',
      [0, 0, 0],
      [0, 0.5, 0.7],
      true,
      stage2Group
    );
    cyl(sustainerHull, 0.24, 3.15, [0, 0, 1.80], whiteMat, 'z');
    mesh(sustainerHull, new T.ConeGeometry(0.24, 1.05, 28), whiteMat, [0, 0, 3.90], [Math.PI / 2, 0, 0]);

    const sustainerMotor = part(
      'sustainerMotor',
      'M30 Katı Yakıtlı Sürdürme Motoru',
      'M30 solid sustainer motor',
      '2. Kademe: Sustainer Füzesi',
      'Stage 2: Sustainer',
      'Ayrılma sonrasında füzeyi 45+ km irtifaya ulaştıran iç M30 katı yakıt motoru ve arka lüle.',
      'Internal M30 solid-propellant sustainer motor propelling the missile after booster separation.',
      [0, 0, 0],
      [0, 0.9, 0.2],
      false,
      stage2Group
    );
    cyl(sustainerMotor, 0.18, 1.65, [0, 0, 1.15], grainMat, 'z');
    cyl(sustainerMotor, 0.16, 0.28, [0, 0, 0.14], darkMat, 'z', 0.11);

    const deltaWings = part(
      'deltaWings',
      '4× Ana Süpersonik Delta Kanat',
      '4× Main supersonic delta wings',
      '2. Kademe: Sustainer Füzesi',
      'Stage 2: Sustainer',
      'Yüksek irtifa ince atmosferinde keskin manevra sağlayan dört uzun delta kanat.',
      'Four long-chord delta wings providing high-altitude supersonic lift and maneuverability.',
      [0, 0, 0],
      [0.5, 0.5, 0.5],
      false,
      stage2Group
    );
    const dWingShape = new T.Shape();
    dWingShape.moveTo(0, 0);
    dWingShape.lineTo(1.75, 0);
    dWingShape.lineTo(0.15, 0.58);
    dWingShape.lineTo(0, 0.58);
    dWingShape.closePath();
    const dWingGeo = new T.ExtrudeGeometry(dWingShape, { depth: 0.026, bevelEnabled: false });
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const wG = new T.Group();
      wG.rotation.z = a;
      deltaWings.add(wG);
      mesh(wG, dWingGeo, whiteMat, [0.22, 0, 0.85], [0, Math.PI / 2, 0]);
    }

    const elevons = part(
      'elevons',
      'Arka Hareketli Elevon Kontrol Dümenleri',
      'Rear movable elevon control fins',
      '2. Kademe: Sustainer Füzesi',
      'Stage 2: Sustainer',
      'Radyo-komut sinyalleriyle ±20° hareket ederek füzeyi hedefe yönlendiren arka elevon yüzeyleri.',
      'Four trailing control surfaces deflecting ±20° under radio-command guidance.',
      [0, 0, 0],
      [0.4, 0.4, 0.1],
      false,
      stage2Group
    );
    const elevonPivots = [];
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const holder = new T.Group();
      holder.rotation.z = a;
      elevons.add(holder);
      const piv = new T.Group();
      piv.position.set(0.36, 0, 0.62);
      holder.add(piv);
      box(piv, [0.28, 0.028, 0.22], [0, 0, 0], orangeMat);
      elevonPivots.push(piv);
    }

    const noseFins = part(
      'noseFins',
      'Burun Arkası Küçük Denge Kanatçıkları',
      'Forward nose guidance fins',
      '2. Kademe: Sustainer Füzesi',
      'Stage 2: Sustainer',
      'Hücum açısı kararlılığı için burun konisinin hemen arkasına yerleştirilmiş dört küçük kanatçık.',
      'Four small forward fins located immediately aft of the nose cone for aerodynamic stability.',
      [0, 0, 0],
      [0.3, 0.4, 1.1],
      false,
      stage2Group
    );
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const nf = new T.Group();
      nf.rotation.z = a;
      noseFins.add(nf);
      box(nf, [0.16, 0.02, 0.30], [0.28, 0, 3.25], orangeMat);
    }

    // -------------------------------------------------------------------------
    // D. GÜDÜM, HARP BAŞLIĞI & AYRILMA (GUIDANCE, WARHEAD & STAGING) — 3 Grup
    // -------------------------------------------------------------------------
    const guidancePack = part(
      'guidancePack',
      'Radyo-Komut Güdüm & Jiroskop Paketi',
      'Radio-command guidance & gyro pack',
      'Güdüm, Harp Başlığı & Ayrılma',
      'Guidance, Warhead & Staging',
      'Yer takip radarından gelen komutları hidrolik elevon aktüatörlerine çeviren güdüm elektroniği.',
      'Guidance receiver and gyroscope package translating ground radar commands into elevon steering.',
      [0, 0, 0],
      [-0.6, 0.8, 0.9],
      false,
      stage2Group
    );
    cyl(guidancePack, 0.16, 0.55, [0, 0, 3.05], brassMat, 'z');
    ring(guidancePack, 0.17, [0, 0, 2.95], copperMat, 0.025);

    const warhead = part(
      'warhead',
      'T-45 Parça Tesirli Harp Başlığı Kesiti',
      'T-45 high-explosive warhead cutaway',
      'Güdüm, Harp Başlığı & Ayrılma',
      'Guidance, Warhead & Staging',
      'Yüksek irtifadaki bombardıman filolarına karşı tasarlanmış T-45 harp başlığı yerleşim kesiti.',
      'T-45 fragmentation warhead assembly positioned forward of the M30 sustainer motor.',
      [0, 0, 0],
      [-0.6, 0.8, 0.5],
      false,
      stage2Group
    );
    cyl(warhead, 0.18, 0.62, [0, 0, 2.35], mats.red, 'z');
    ring(warhead, 0.19, [0, 0, 2.35], steelMat, 0.025);

    const stagingAdapter = part(
      'stagingAdapter',
      'Konik Kademe Ayrılma Adaptörü & Alev',
      'Conical staging adapter & ignition plume',
      'Güdüm, Harp Başlığı & Ayrılma',
      'Guidance, Warhead & Staging',
      '1. kademe yakıtı bittiğinde 2. kademenin itkiyle ayrılmasını sağlayan ara bağlantı konisi.',
      'Interstage conical adapter releasing the sustainer at booster burnout.',
      [0, 0, 0],
      [0, 0.5, -0.2],
      false,
      stage1Group
    );
    cyl(stagingAdapter, 0.24, 0.34, [0, 0, 2.48], steelMat, 'z', 0.32);
    const boosterPlume = new T.Mesh(new T.ConeGeometry(0.32, 1.35, 18), flameMat);
    boosterPlume.rotation.x = -Math.PI / 2;
    boosterPlume.position.set(0, 0, -0.78);
    boosterPlume.visible = false;
    stagingAdapter.add(boosterPlume);

    function sync() {
      const elevRad = (state.elevDeg * Math.PI) / 180;
      railPivot.rotation.x = -elevRad;

      // Hidrolik silindirlerin alt ve üst mafsallara tam bağlanması
      railPivot.updateMatrixWorld(true);
      const localTopMount = new T.Vector3(0, -0.10, 2.35);
      for (const c of cylGroups) {
        const worldTop = new T.Vector3(c.x, localTopMount.y, localTopMount.z);
        // railPivot dönüşünü elle uygula: x sabit, y/z PIVOT_POS etrafında elevRad döner
        const dy0 = localTopMount.y;
        const dz0 = localTopMount.z;
        const ry = dy0 * Math.cos(elevRad) + dz0 * Math.sin(elevRad);
        const rz = -dy0 * Math.sin(elevRad) + dz0 * Math.cos(elevRad);
        worldTop.set(c.x, PIVOT_POS.y + ry, PIVOT_POS.z + rz);

        const span = worldTop.clone().sub(c.baseAnchor);
        const totalLen = Math.max(0.2, span.length());
        const dir = span.clone().normalize();
        const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), dir);

        const tubeLen = Math.min(1.35, totalLen * 0.72);
        c.barrelG.quaternion.copy(q);
        c.outerTube.scale.set(1, tubeLen, 1);
        c.outerTube.position.set(0, tubeLen * 0.5, 0);

        const rodLen = Math.max(0.4, totalLen * 0.68);
        c.rodG.position.copy(worldTop);
        c.rodG.quaternion.copy(q);
        c.innerRod.scale.set(1, rodLen, 1);
        c.innerRod.position.set(0, -rodLen * 0.5, 0);
      }

      // Kademe ayrılma ve uçuş
      const sepZ = (state.stageSep / 100) * 1.85 + (state.launched ? state.flightRatio * 1.6 : 0);
      missileFlightGroup.position.z = 0.55 + state.flightRatio * 2.4;
      stage2Group.position.z = 2.55 + sepZ;

      const elevonRad = (state.elevonDeg * Math.PI) / 180;
      for (const piv of elevonPivots) {
        piv.rotation.x = elevonRad;
      }

      pad.visible = state.showPad;
      blastDeflector.visible = state.showPad;
      boosterPlume.visible = state.launched && state.flightRatio > 0.05;
    }

    function reset() {
      Object.assign(state, {
        elevDeg: 58,
        stageSep: 0,
        elevonDeg: 0,
        showPad: true,
        launched: false,
        flightRatio: 0,
        animating: false
      });
      sync();
    }

    const camPresets = {
      iso: { pos: [7.2, 5.2, 7.6], look: [0, 2.2, 0.2] },
      front: { pos: [0.5, 3.4, 9.2], look: [0, 2.0, 0.6] },
      breech: { pos: [-3.8, 2.2, -7.8], look: [0, 1.4, -0.5] },
      engine: { pos: [4.2, 2.2, 1.6], look: [0, 1.8, 0.4] },
      suspension: { pos: [3.8, 1.5, -1.6], look: [0, 1.0, -0.9] },
      top: { pos: [0.2, 11.2, 0.2], look: [0, 1.5, 0.5] }
    };

    const tourSteps = [
      [
        ['İki Kademeli Yüksek İrtifa Füzesi', 'Two-stage high-altitude SAM'],
        ['1959’da hizmete giren MIM-14 Nike Hercules, 40 km’yi aşan irtifalarda bombardıman uçaklarını önlemek üzere geliştirildi.', 'Entering service in 1959, the MIM-14 Nike Hercules intercepted high-altitude aircraft above 40 km.'],
        'iso', 'sustainerHull', false
      ],
      [
        ['Hidrolik Dikme ve Fırlatma Rayı', 'Hydraulic erector & launch rail'],
        ['İkiz teleskopik hidrolik silindirler rayı yatay taşıma konumundan 85° fırlatma açısına diker.', 'Twin telescopic hydraulic cylinders elevate the rail from horizontal stowage up to an 85° launch angle.'],
        'suspension', 'erectorCylinders', false
      ],
      [
        ['4× M5E1 Katı Yakıtlı Booster Kümesi', '4× M5E1 solid booster cluster'],
        ['Dört adet M5E1 motor aynı anda ateşlenerek 4,8 tonluk füzeyi birkaç saniyede ses üstü hıza çıkarır.', 'Four clustered M5E1 solid motors ignite together, accelerating the 4.8-tonne missile past Mach 3 in seconds.'],
        'breech', 'boosterTubes', true
      ],
      [
        ['Kademe Ayrılması ve Konik Adaptör', 'Stage separation & interstage adapter'],
        ['Kademe ayrılma kaydırıcısıyla 1. kademe yakıtı bittikten sonra sustainer füzesinin nasıl ayrıldığını inceleyin.', 'Use the stage separation slider to inspect how the second-stage sustainer cleanly separates after booster burnout.'],
        'engine', 'stagingAdapter', false
      ],
      [
        ['M30 Sustainer, T-45 Başlık ve Güdüm', 'M30 sustainer, T-45 warhead & guidance'],
        ['X-Ray modunda 2. kademedeki M30 katı yakıt motorunu, harp başlığını ve radyo-komut güdüm bölümünü görün.', 'Toggle X-Ray to reveal the M30 sustainer grain, T-45 warhead section and radio-command guidance pack.'],
        'engine', 'warhead', true
      ],
      [
        ['Elevon Kontrolü ve Güvenlik Kilidi', 'Elevon steering & elevation lock'],
        ['Rampa en az 45°’ye dikilmeden ateşleme kilitlidir. Açıyı yükseltip fırlatma ve kademe ayrılmasını başlatın.', 'Launch is locked below 45° rail elevation. Raise the rail and fire to watch launch and stage separation.'],
        'iso', 'elevons', false
      ]
    ].map(([title, desc, cam, key, cutaway]) => ({
      title: t(...title),
      desc: t(...desc),
      cam,
      part: parts[key],
      cutaway,
      explode: 0,
      sub: 'all'
    }));

    const ui = K.ui({
      cameraPadding: 0.82,
      title: t('MIM-14 NIKE HERCULES (1959)', 'MIM-14 NIKE HERCULES (1959)'),
      sub: t('4× M5E1 Booster Kümesi • M30 Sustainer • Hidrolik Rampa', '4× M5E1 Booster Cluster • M30 Sustainer • Hydraulic Launcher'),
      subsystems: Object.entries(counts).map(([key, count]) => ({ key, label: key, count, color: '#6b7280' })),
      camLabels: Object.fromEntries(Object.entries({
        iso: ['Genel Sergi', 'Full exhibit'],
        front: ['Ön Cephe', 'Front view'],
        breech: ['Lüle & Saptırıcı', 'Nozzles & deflector'],
        engine: ['Kademe Kesiti', 'Staging cutaway'],
        suspension: ['Hidrolik Dikme', 'Hydraulic erector'],
        top: ['Üst Görünüş', 'Top view']
      }).map(([k, v]) => [k, t(...v)])),
      sliders: [
        [['Rampa Dikme Açısı', 'Launcher elevation'], 0, 85, '°'],
        [['Kademe Ayrılma İncelemesi', 'Stage separation'], 0, 100, '%'],
        [['Elevon Dümen Açısı', 'Elevon deflection'], -20, 20, '°']
      ].map(([labels, min, max, unit]) => ({
        label: t(...labels),
        min,
        max,
        step: 1,
        fmt: v => Math.round(v) + unit
      })),
      buttons: {
        terrain: t('Beton Mevzii & Kalkanı Göster', 'Show pad & blast shield'),
        sweep: t('Rampayı Sıfırla', 'Reset launcher')
      },
      telemetryTag: t('MIM-14 • M42 + M30', 'MIM-14 • M42 + M30'),
      statLabels: [
        ['RAMPA AÇISI', 'RAIL ELEV'],
        ['KADEME AYRIMI', 'SEPARATION'],
        ['ELEVON', 'ELEVON'],
        ['ATEŞLEME DURUMU', 'LAUNCH STATE']
      ].map(v => t(...v))
    });

    sync();

    return {
      root,
      parts,
      ui,
      camPresets,
      tourSteps,
      defaultPart: parts.boosterTubes,
      firePart: parts.stagingAdapter,
      update(dt) {
        if (state.animating) {
          const target = state.launched ? 1 : 0;
          const step = dt * 1.4;
          if (Math.abs(target - state.flightRatio) <= step) {
            state.flightRatio = target;
            state.animating = false;
          } else {
            state.flightRatio += Math.sign(target - state.flightRatio) * step;
          }
          sync();
        }
      },
      onFire() {
        if (!state.launched && state.elevDeg < 45) {
          return { ok: false, msg: t('Emniyet kilidi: Fırlatma için rampa en az 45° yükseltilmelidir.', 'Safety lock: raise launcher rail to at least 45° before firing.') };
        }
        state.launched = !state.launched;
        state.animating = true;
        state.flightRatio = state.launched ? 1 : 0;
        sync();
        return { ok: true };
      },
      fireButtonLabel: () => t(state.launched ? 'RAMPAYA GERİ AL' : 'FÜZEYİ FIRLAT', state.launched ? 'RESET MISSILE' : 'FIRE MISSILE'),
      mobileFireButtonLabel: () => t(state.launched ? 'GERİ AL' : 'FIRLAT', state.launched ? 'RESET' : 'FIRE'),
      onSlider(i, v) {
        if (!Number.isFinite(v)) return {};
        const clamped = T.MathUtils.clamp(v, ui.sliders[i].min, ui.sliders[i].max);
        if (i === 0) state.elevDeg = clamped;
        else if (i === 1) state.stageSep = clamped;
        else if (i === 2) state.elevonDeg = clamped;
        sync();
        return {};
      },
      onButton(name) {
        if (name === 'terrain') {
          state.showPad = !state.showPad;
          sync();
        } else if (name === 'sweep') {
          reset();
        }
        return {};
      },
      buttonActive: name => name === 'terrain' && state.showPad,
      getSliderValues: () => [state.elevDeg, state.stageSep, state.elevonDeg],
      getStats: () => [
        Math.round(state.elevDeg) + ' <span>°</span>',
        Math.round(state.stageSep) + ' <span>%</span>',
        Math.round(state.elevonDeg) + ' <span>°</span>',
        state.launched ? t('AYRILDI', 'STAGED') : state.elevDeg < 45 ? t('KİLİTLİ', 'LOCKED') : t('HAZIR', 'ARMED')
      ],
      getStatus: () => {
        if (state.launched) return { text: t('1. KADEME AYRILDI • SUSTAINER UÇUŞTA', 'STAGE 1 SEPARATED • SUSTAINER BURN'), color: '#dc2626' };
        if (state.elevDeg < 45) return { text: t('RAMPA < 45° • ATEŞLEME KİLİTLİ', 'RAIL < 45° • LAUNCH LOCKED'), color: '#d97706' };
        return { text: t('RAMPA ATEŞLEMEYE HAZIR', 'LAUNCHER ARMED FOR IGNITION'), color: '#059669' };
      },
      applyTextures: K.applyTextures,
      setTexture: K.setTexture,
      toggleRelief: K.toggleRelief
    };
  };
})();
