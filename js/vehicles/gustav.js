/* 80 cm Kanone (E) “Schwerer Gustav” (1941–1942) — Krupp Süper Ağır Demiryolu Kuşatma Topu
 * 1:3 ölçekli müze sergisi; iç jeneratör, hidrolik geri tepme hacimleri ve yükleme asansörü eğitim amaçlı yorumdur. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.gustav = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'gustav');
    const { T, root, parts, mats, mesh, box, cyl, ring, pipe, beam, instances } = K;
    const english = window.MuseumPreferences?.language === 'en';
    const t = (tr, en) => (english ? en : tr);

    // 1:3 Müze Ölçeği Sabitleri (Zemin Y = 0.000, İleri +Z)
    const Y_BALLAST = 0.08;
    const Y_TIE_TOP = 0.14;
    const Y_RAIL_TOP = 0.21;
    const R_W = 0.16;
    const Y_WHEEL = Y_RAIL_TOP + R_W; // 0.370 m
    const TRUNNION_Y = 2.95;
    const TRUNNION_Z = 0.85;
    const R_ARC = 1.65;
    const R_PIN = 0.16;
    const PIN_ANGLE = -1.25; // rad; 0..48° arası temasın orta eksende kalmasını sağlar
    const BOGIE_Z = [-4.20, -2.10, 1.70, 3.80];
    const AXLE_DZ = [-0.72, -0.36, 0, 0.36, 0.72];
    const TRACK_X = [-0.78, 0.78]; // İki paralel standart ray hattı (her birinin iki rayı ±0.24)
    const MAX_SHIFT = 1.15;

    const S = {
      elevDeg: 22,
      loadPct: 0,
      trackDeg: 0,
      apShell: true,
      showDiagram: true,
      ammo: 48, // Sivastopol kuşatmasındaki tarihsel 48 atım
      recoilPhase: 0,
      firing: false,
      genPhase: 0
    };

    const counts = {};
    let partIndex = 0;

    function mat(color, metalness = 0.45, roughness = 0.55, paint = false) {
      const m = new T.MeshStandardMaterial({ color, metalness, roughness, bumpScale: 0.002 });
      m.userData.paint = paint;
      return m;
    }

    mats.paint.color.setHex(0x4b5156); // Wehrmacht Schwarzgrau (RAL 7021)
    mats.paint.metalness = 0.38;
    mats.paint.roughness = 0.68;

    const frameMat = mat(0x3b4045, 0.48, 0.62, true);
    const barrelMat = mat(0x2f3438, 0.62, 0.46, true);
    const bridgeMat = mat(0x565c62, 0.42, 0.64, true);
    const darkMat = mats.dark.clone();
    const steelMat = mats.steel.clone();
    const cutawaySteelMat = steelMat.clone();
    cutawaySteelMat.side = T.DoubleSide;
    const cutawayFrameMat = frameMat.clone();
    cutawayFrameMat.side = T.DoubleSide;
    const brassMat = mats.brass.clone();
    const woodMat = mats.wood.clone();
    const ballastMat = mat(0x6e685f, 0.05, 0.96, false);
    const copperMat = mat(0xb86e3b, 0.78, 0.32, false);
    const oliveMat = mat(0x6e7348, 0.25, 0.72, false);
    const redMat = mats.red.clone();
    const silkMat = mat(0xd8ceb4, 0.05, 0.88, false);
    const oilMat = new T.MeshStandardMaterial({
      color: 0x228be6, transparent: true, opacity: 0.62, roughness: 0.16, metalness: 0.15
    });
    const gasMat = new T.MeshStandardMaterial({
      color: 0xe6a122, transparent: true, opacity: 0.58, roughness: 0.18, metalness: 0.15
    });
    const glassMat = new T.MeshStandardMaterial({
      color: 0x8cc8e0, transparent: true, opacity: 0.42, roughness: 0.12, metalness: 0.2
    });
    const diagramMat = new T.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.78 });
    const curveWarnMat = new T.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.85 });
    const flashMat = new T.MeshBasicMaterial({ color: 0xffa928, transparent: true, opacity: 0.90, depthWrite: false });
    const humanMat = mat(0x94a3b8, 0.15, 0.78, false);

    function part(id, tr, en, subTr, subEn, descTr, descEn, basePos = [0, 0, 0], exp = [0, 0.6, 0], outer = false, parent = root) {
      const sub = t(subTr, subEn);
      counts[sub] = (counts[sub] || 0) + 1;
      const p = K.part(id, ++partIndex + '. ' + t(tr, en), sub, basePos, exp, t(descTr, descEn), outer, parent);
      Object.assign(p.userData, {
        material: t('Krupp zırh ve döküm çeliği, krom hidrolik pistonlar, pirinç yataklar', 'Krupp structural and forged steel, chrome hydraulic rods, brass bearings'),
        weight: t('1.350 ton tam muharebe kütlesi (~400 ton namlu/beşik/kama)', '1,350 t combat weight (~400 t barrel, cradle & breech)'),
        spec: t('1:3 müze ölçeği • 800 mm (L/40.6) • 32,48 m namlu • 40 aks / 80 tekerlek', '1:3 museum scale • 800 mm (L/40.6) • 32.48 m barrel • 40 axles / 80 wheels')
      });
      return p;
    }

    function G(parent, pos = [0, 0, 0], name = '') {
      const g = new T.Group();
      g.position.set(...pos);
      if (name) g.name = name;
      parent.add(g);
      return g;
    }

    // =========================================================================
    // A. DEMİRYOLU & 80 TEKERLEKLİ BOJİLER (4 GRUP)
    // =========================================================================
    const trackBed = part(
      'trackBed',
      'İkiz Paralel Demiryolu Hattı & Balast Yatağı',
      'Twin Parallel Railway Tracks & Ballast Bed',
      'Demiryolu ve 80 Tekerlekli Boji',
      'Railway & 80-Wheel Bogies',
      '1.350 tonluk kütleyi taşıyan 4 paralel I-profil çelik ray (2 standart 1.435 mm hat), ahşap traversler ve geri tepme takviyeli kırmataş balast yatağı.',
      'Four parallel steel I-rails (twin 1,435 mm tracks), sleepers, and reinforced crushed-stone ballast carrying the 1,350-tonne gun.',
      [0, 0, 0],
      [0, -0.45, 0]
    );
    // Alt yüzey Y = 0.000
    box(trackBed, [3.20, Y_BALLAST, 14.40], [0, Y_BALLAST / 2, 0], ballastMat);
    const sleeperTransforms = [];
    for (let i = 0; i < 36; i++) {
      const z = -7.0 + i * 0.40;
      sleeperTransforms.push({ pos: [0, 0.11, z] });
    }
    instances(trackBed, new T.BoxGeometry(2.70, 0.06, 0.14), woodMat, sleeperTransforms);
    // 4 paralel I-profil ray
    for (const cx of TRACK_X) {
      for (const offset of [-0.24, 0.24]) {
        const rx = cx + offset;
        box(trackBed, [0.068, 0.018, 14.20], [rx, 0.149, 0], steelMat);
        box(trackBed, [0.026, 0.036, 14.20], [rx, 0.176, 0], darkMat);
        box(trackBed, [0.048, 0.018, 14.20], [rx, 0.201, 0], steelMat); // Üst yüzey = 0.210
      }
      // Geri tepme destek çaprazları
      for (let z = -6.0; z <= 6.0; z += 2.0) {
        box(trackBed, [0.44, 0.022, 0.08], [cx, 0.151, z], frameMat);
      }
    }

    // Hareketli araç ana taşıyıcı grubu (Schießkurve ray boyunca zShift kayması)
    const carriageMoveGroup = G(root, [0, 0, 0], 'carriage-move');
    const wheelDummy = new T.Object3D();

    function buildBogieSide(sideKey, sideX, trName, enName, trDesc, enDesc) {
      const sideSign = Math.sign(sideX);
      const grp = part(
        sideKey,
        trName,
        enName,
        'Demiryolu ve 80 Tekerlekli Boji',
        'Railway & 80-Wheel Bogies',
        trDesc,
        enDesc,
        [0, 0, 0],
        [sideSign * 0.85, -0.15, 0],
        false,
        carriageMoveGroup
      );
      const wheelTransforms = [];
      const flangeTransforms = [];
      const axleTransforms = [];

      for (const bz of BOGIE_Z) {
        // Boji şasi yan kirişleri ve döner destek plakası
        box(grp, [0.07, 0.20, 1.80], [sideX - 0.34, 0.42, bz], frameMat);
        box(grp, [0.07, 0.20, 1.80], [sideX + 0.34, 0.42, bz], frameMat);
        box(grp, [0.68, 0.08, 0.44], [sideX, 0.56, bz], bridgeMat);
        cyl(grp, 0.22, 0.08, [sideX, 0.62, bz], steelMat, 'y');

        for (const dz of AXLE_DZ) {
          const az = bz + dz;
          axleTransforms.push({ pos: [sideX, Y_WHEEL, az] });
          // İç ve dış ray tekerlekleri + ray açıklığına bakan iç flanşlar
          wheelTransforms.push({ pos: [sideX - 0.24, Y_WHEEL, az] });
          wheelTransforms.push({ pos: [sideX + 0.24, Y_WHEEL, az] });
          flangeTransforms.push({ pos: [sideX - 0.205, Y_WHEEL, az] });
          flangeTransforms.push({ pos: [sideX + 0.205, Y_WHEEL, az] });
          // Rulman kutuları ve yaprak yay dikmeleri
          box(grp, [0.08, 0.11, 0.11], [sideX - 0.34, Y_WHEEL, az], darkMat);
          box(grp, [0.08, 0.11, 0.11], [sideX + 0.34, Y_WHEEL, az], darkMat);
        }
      }

      const axleMesh = instances(grp, new T.CylinderGeometry(0.036, 0.036, 0.62, 12), darkMat, axleTransforms);
      const wheelMesh = instances(grp, new T.CylinderGeometry(R_W, R_W, 0.055, 24), steelMat, wheelTransforms);
      const flangeMesh = instances(grp, new T.CylinderGeometry(R_W + 0.025, R_W + 0.025, 0.016, 24), darkMat, flangeTransforms);
      return { axleMesh, wheelMesh, flangeMesh, axleTransforms, wheelTransforms, flangeTransforms };
    }

    const leftWheelInst = buildBogieSide(
      'leftBogies',
      -0.78,
      'Sol Hat 4×5 Akslı Bojiler (40 Tekerlek)',
      'Left Track 4×5-Axle Bogies (40 Wheels)',
      'Sol demiryolu hattında çalışan dört adet beş akslı boji, 20 aks, rulman yatakları ve 40 flanşlı çelik demiryolu tekerleği.',
      'Four five-axle bogies, 20 axles, journal boxes, and 40 flanged steel rail wheels riding the left track.'
    );
    const rightWheelInst = buildBogieSide(
      'rightBogies',
      0.78,
      'Sağ Hat 4×5 Akslı Bojiler (40 Tekerlek)',
      'Right Track 4×5-Axle Bogies (40 Wheels)',
      'Sağ demiryolu hattında çalışan dört adet beş akslı boji, 20 aks ve 40 flanşlı çelik demiryolu tekerleği; toplam 80 tekerlek.',
      'Four five-axle bogies, 20 axles, and 40 flanged steel wheels on the right track — totaling 80 wheels.'
    );

    const lowerBridges = part(
      'lowerBridges',
      'Ön ve Arka Dengeleme Köprü Kirişleri',
      'Front & Rear Equalizing Bridge Spans',
      'Demiryolu ve 80 Tekerlekli Boji',
      'Railway & 80-Wheel Bogies',
      'Sekiz boji üzerindeki kütleyi iki ana yan duvara eşit dağıtan ön ve arka köprüler; orta eksen yüksek açılı geri tepme için açıktır.',
      'Heavy articulated bridge spans distributing weight across front and rear bogie pairs while leaving the center pit open for high-angle recoil.',
      [0, 0, 0],
      [0, 0.45, 0],
      false,
      carriageMoveGroup
    );
    for (const [bz, len] of [[-3.15, 2.95], [2.75, 2.95]]) {
      box(lowerBridges, [2.10, 0.30, len], [0, 0.81, bz], bridgeMat);
      for (const sx of [-0.78, 0.78]) {
        box(lowerBridges, [0.56, 0.14, len - 0.15], [sx, 0.68, bz], frameMat);
      }
    }

    // =========================================================================
    // B. ANA GÖVDE, GÜÇ & KONTROL (4 GRUP)
    // =========================================================================
    const mainCarriage = part(
      'mainCarriage',
      'Perçinli Çelik Ana Kutu Gövde (Seitenwände)',
      'Riveted Steel Twin Box-Girder Carriage',
      'Ana Gövde ve Güç',
      'Main Carriage & Power',
      'Sol ve sağ ray hatları boyunca uzanan dev perçinli kutu yan duvarlar, orta muylu kuleleri ve geri tepme açık şasi kemerleri (X-Ray saydam).',
      'Colossal twin riveted box-girder side walls spanning both tracks with raised central trunnion towers (X-Ray transparent).',
      [0, 0, 0],
      [0, 0.9, 0],
      true,
      carriageMoveGroup
    );
    for (const sx of [-0.90, 0.90]) {
      // Alt boyuna kiriş duvarı
      box(mainCarriage, [0.34, 0.94, 9.20], [sx, 1.43, 0], mats.paint);
      // Orta yükseltilmiş muylu kulesi
      box(mainCarriage, [0.38, 1.24, 2.75], [sx, 2.52, 0.75], mats.paint);
      // Ön ve arka eğimli omuz takviyeleri
      beam(mainCarriage, [sx, 1.90, 3.10], [sx, 2.95, 1.95], 0.18, frameMat);
      beam(mainCarriage, [sx, 1.90, -1.60], [sx, 2.95, -0.45], 0.18, frameMat);
    }
    // Üst/ön/arka enine bağlama kemerleri (namlu yolunu kesmeyen z = -4.45 ve z = +4.45 tampon)
    box(mainCarriage, [2.22, 0.42, 0.32], [0, 1.25, 4.48], frameMat);
    box(mainCarriage, [2.22, 0.42, 0.32], [0, 1.25, -4.48], frameMat);
    box(mainCarriage, [1.50, 0.24, 0.55], [0, 1.78, 4.20], bridgeMat);
    // Dış perçin şeritleri (instanced)
    const rivetTransforms = [];
    for (const side of [-1, 1]) {
      const rx = side * 1.078;
      for (let z = -4.3; z <= 4.3; z += 0.45) {
        rivetTransforms.push({ pos: [rx, 1.06, z], rot: [0, 0, Math.PI / 2] });
        rivetTransforms.push({ pos: [rx, 1.80, z], rot: [0, 0, Math.PI / 2] });
      }
    }
    instances(mainCarriage, new T.CylinderGeometry(0.018, 0.018, 0.025, 6), steelMat, rivetTransforms);

    const catwalks = part(
      'catwalks',
      'Yan Yürüyüş Yolları, Merdivenler ve Korkuluklar',
      'Side Catwalks, Access Ladders & Railings',
      'Ana Gövde ve Güç',
      'Main Carriage & Power',
      'Mürettebatın nişangâh, kama ve vinç güvertelerine ulaştığı ızgaralı yan yürüyüş platformları, erişim merdivenleri ve emniyet korkulukları.',
      'Grated side walkways, steel ladders, and safety railings giving the crew access to control and loading decks.',
      [0, 0, 0],
      [1.05, 0.35, 0],
      false,
      carriageMoveGroup
    );
    const postTransforms = [];
    for (const sx of [-1.22, 1.22]) {
      box(catwalks, [0.30, 0.05, 8.60], [sx, 1.92, 0], steelMat);
      box(catwalks, [0.025, 0.025, 8.60], [sx + Math.sign(sx) * 0.13, 2.32, 0], brassMat);
      for (let z = -4.2; z <= 4.2; z += 0.70) {
        postTransforms.push({ pos: [sx + Math.sign(sx) * 0.13, 2.12, z] });
      }
    }
    // Arka ve ön yan erişim merdivenleri
    for (const [lx, lz] of [[-1.34, -4.15], [1.34, -4.15]]) {
      for (const dz of [-0.14, 0.14]) beam(catwalks, [lx, 0.45, lz + dz], [lx, 1.92, lz + dz], 0.03, steelMat);
      for (let y = 0.65; y <= 1.85; y += 0.24) {
        box(catwalks, [0.03, 0.025, 0.28], [lx, y, lz], steelMat);
      }
    }
    instances(catwalks, new T.CylinderGeometry(0.014, 0.014, 0.40, 8), steelMat, postTransforms);

    const powerUnits = part(
      'powerUnits',
      'İkiz Dizel-Elektrik Güç Jeneratörleri',
      'Twin Diesel-Electric Power Generators',
      'Ana Gövde ve Güç',
      'Main Carriage & Power',
      'Yükseliş tahriki, kama motoru, mühimmat vinci ve asansörler için elektrik üreten ön gövde içi ikiz dizel jeneratör setleri ve soğutma fanları.',
      'Front twin diesel-generator sets and copper busbars supplying electrical power to the elevation drives, hoist, and breech.',
      [0, 0, 0],
      [0, 0.85, 0.75],
      false,
      carriageMoveGroup
    );
    const fanRotors = [];
    for (const sx of [-0.42, 0.42]) {
      box(powerUnits, [0.46, 0.48, 1.15], [sx, 1.24, 3.25], oliveMat);
      cyl(powerUnits, 0.16, 0.34, [sx, 1.32, 2.48], copperMat, 'z');
      const fan = G(powerUnits, [sx, 1.28, 3.88], 'gen-fan');
      cyl(fan, 0.18, 0.04, [0, 0, 0], steelMat, 'z');
      box(fan, [0.30, 0.04, 0.05], [0, 0, 0.02], darkMat);
      box(fan, [0.04, 0.30, 0.05], [0, 0, 0.02], darkMat);
      fanRotors.push(fan);
    }
    pipe(powerUnits, [[-0.42, 1.48, 2.48], [-0.42, 1.82, 1.40], [-0.42, 1.82, 0.85]], 0.028, copperMat);
    pipe(powerUnits, [[0.42, 1.48, 2.48], [0.42, 1.82, 1.40], [0.42, 1.82, 0.85]], 0.028, copperMat);

    const controlCabin = part(
      'controlCabin',
      'Nişancı Kontrol Kabini & Açı Kadranı',
      'Gunner Control Cabin & Elevation Dial',
      'Ana Gövde ve Güç',
      'Main Carriage & Power',
      'Sol tarafta yükseliş açısını ayarlayan kumanda kulübesi, mekanik derece kadranı, panoramik nişangâh ve elektrik kumanda kolları.',
      'Left-side gunner platform housing the mechanical elevation dial, panoramic sight, and electric drive switchgear.',
      [0, 0, 0],
      [-1.05, 0.55, 0.25],
      false,
      carriageMoveGroup
    );
    box(controlCabin, [0.48, 0.72, 0.78], [-1.26, 2.34, 0.65], frameMat);
    box(controlCabin, [0.40, 0.28, 0.52], [-1.26, 2.84, 0.65], glassMat);
    cyl(controlCabin, 0.18, 0.04, [-1.02, 2.52, 0.65], brassMat, 'x');
    const dialPointer = box(controlCabin, [0.03, 0.15, 0.025], [-0.99, 2.52, 0.65], redMat);
    cyl(controlCabin, 0.04, 0.32, [-1.32, 3.12, 0.82], brassMat, 'y');

    // =========================================================================
    // C. 80 CM NAMLU, MUYLU & KAMA (4 GRUP)
    // =========================================================================
    const elevPivot = G(carriageMoveGroup, [0, TRUNNION_Y, TRUNNION_Z], 'elev-pivot');

    const elevationDrive = part(
      'elevationDrive',
      'Muylu Yatakları & Dişli Yükseliş Yayı',
      'Trunnion Bearings & Toothed Elevation Arcs',
      '80 cm Namlu ve Kama',
      '80 cm Barrel & Breech',
      '400 tonluk döner kütleyi 0°..+48° aralığında kaldıran ikiz elektrikli pinyonlar (r=0,16 m) ve beşik altındaki dev dişli yaylar (R=1,65 m).',
      'Electric elevation pinions driving colossal twin toothed elevation arcs (R = 1.65 m) under the gun cradle from 0° to +48°.',
      [0, 0, 0],
      [0, 0.6, -0.45],
      false,
      carriageMoveGroup
    );
    // Sabit muylu yatakları & pinyonlar
    const pinY = TRUNNION_Y + (R_ARC + R_PIN) * Math.sin(PIN_ANGLE);
    const pinZ = TRUNNION_Z + (R_ARC + R_PIN) * Math.cos(PIN_ANGLE);
    const leftPinionGrp = G(elevationDrive, [-0.64, pinY, pinZ], 'pinion-left');
    const rightPinionGrp = G(elevationDrive, [0.64, pinY, pinZ], 'pinion-right');
    for (const pGrp of [leftPinionGrp, rightPinionGrp]) {
      cyl(pGrp, R_PIN, 0.14, [0, 0, 0], brassMat, 'x');
      cyl(pGrp, 0.07, 0.24, [0, 0, 0], steelMat, 'x');
      box(pGrp, [0.16, 0.04, R_PIN * 2.05], [0, 0, 0], darkMat);
    }
    for (const sx of [-0.72, 0.72]) {
      cyl(elevationDrive, 0.24, 0.22, [sx, TRUNNION_Y, TRUNNION_Z], brassMat, 'x');
      box(elevationDrive, [0.22, 0.28, 0.36], [sx, pinY - 0.14, pinZ], steelMat);
    }
    // Dönen yükseliş yayları (elevPivot altında — bu alt grup namluyla döner)
    const arcsHolder = G(elevPivot, [0, 0, 0], 'elevation-arcs');
    // `elevationDrive` alt parçaları için mesh görünürlüğüne katılması adına addCADMesh doğrudan elevPivot'a değil ayrı bir holder'a veya elevationDrive'a bağlı;
    // Ama elevPivot sadece 1 parça grubuyla değil, bağımsız olarak dönmeli: Tooth meshlerini arcsHolder'a koyup CAD listesine ekleyelim!
    const arcTransforms = [];
    for (const sx of [-0.64, 0.64]) {
      for (let k = 0; k < 22; k++) {
        const a = -2.10 + k * 0.044; // -2.10 .. -1.176 rad
        arcTransforms.push({
          pos: [sx, R_ARC * Math.sin(a), R_ARC * Math.cos(a)],
          rot: [-a, 0, 0]
        });
      }
      // Yayın kendi kavis gövdesi (kutulardan oluşan kavis)
      for (let k = 0; k < 10; k++) {
        const a = -2.06 + k * 0.095;
        const arcSeg = new T.BoxGeometry(0.11, 0.14, 0.17);
        const segM = ctx.addCADMesh(arcsHolder, arcSeg, steelMat, [sx, (R_ARC - 0.09) * Math.sin(a), (R_ARC - 0.09) * Math.cos(a)], [-a, 0, 0]);
        K.meshes.push({ o: segM, color: steelMat.color.clone(), paint: false });
      }
    }
    const arcTeethMesh = ctx.addInstancedMesh(arcsHolder, new T.BoxGeometry(0.11, 0.05, 0.035), brassMat, arcTransforms.length);
    arcTeethMesh.userData.origColor = brassMat.color.clone();
    K.meshes.push({ o: arcTeethMesh, color: brassMat.color.clone(), paint: false });
    arcTransforms.forEach((tr, i) => {
      wheelDummy.position.set(...tr.pos);
      wheelDummy.rotation.set(...tr.rot);
      wheelDummy.scale.set(1, 1, 1);
      wheelDummy.updateMatrix();
      arcTeethMesh.setMatrixAt(i, wheelDummy.matrix);
    });
    arcTeethMesh.instanceMatrix.needsUpdate = true;
    // X-Ray / part isolate senkronizasyonu: arcsHolder içindeki alt meshler de `elevationDrive` seçildiğinde parlasın diye parent'ı not al
    elevationDrive.userData.extraGroup = arcsHolder;

    const gunCradle = part(
      'gunCradle',
      'Çelik Namlu Beşiği & Muylu Pimleri',
      'Steel Gun Cradle & Trunnion Pins',
      '80 cm Namlu ve Kama',
      '80 cm Barrel & Breech',
      'Dev 80 cm namlunun eksenel geri tepmesini taşıyan, yanlarında muylu pimleri ve alt/üst kızak rayları bulunan ağır kaynaklı çelik beşik.',
      'Heavy welded steel cradle carrying the trunnion pins and bronze guideways for axial 80 cm barrel recoil.',
      [0, 0, 0],
      [0, 0.85, 0],
      false,
      elevPivot
    );
    box(gunCradle, [0.92, 0.68, 2.35], [0, 0, -0.05], frameMat);
    for (const sx of [-0.60, 0.60]) {
      cyl(gunCradle, 0.16, 0.34, [sx, 0, 0], steelMat, 'x');
    }
    box(gunCradle, [0.98, 0.08, 2.50], [0, -0.36, -0.10], brassMat);

    // Geri tepme kızağı (elevPivot altında, Z boyunca geri teper)
    const recoilSlide = G(elevPivot, [0, 0, 0], 'recoil-slide');

    const barrelMain = part(
      'barrelMain',
      '32,48 m 800 mm Yivli Krupp Namlusu',
      '32.48 m 800 mm Rifled Krupp Barrel',
      '80 cm Namlu ve Kama',
      '80 cm Barrel & Breech',
      'Toplam 10,83 m (gerçek 32,48 m / L/40.6) uzunluğunda iki parçalı ceketli namlu, sıcak geçme takviye bilezikleri ve 96 yivli 800 mm iç astar.',
      'Two-piece jacketed 800 mm (L/40.6, 32.48 m full-scale) Krupp rifled barrel with shrunk-on reinforcing hoops and dark rifled bore.',
      [0, 0, 0],
      [0, 0.6, 1.4],
      false,
      recoilSlide
    );
    // Kademeli ceketli Krupp namlu profili (-1.45 .. +9.38 = 10.83 m)
    cyl(barrelMain, 0.38, 2.50, [0, 0, -0.20], barrelMat, 'z', 0.42);  // Arka ceket (-1.45..+1.05)
    cyl(barrelMain, 0.31, 3.00, [0, 0, 2.55], barrelMat, 'z', 0.36);   // Orta kademe (+1.05..+4.05)
    cyl(barrelMain, 0.24, 3.20, [0, 0, 5.65], barrelMat, 'z', 0.29);   // Ön namlu (+4.05..+7.25)
    cyl(barrelMain, 0.205, 2.13, [0, 0, 8.315], barrelMat, 'z', 0.23); // Uç kesim (+7.25..+9.38)
    // Açık namlu ağzı yüzüğü + iç karanlık yiv borusu
    ring(barrelMain, 0.175, [0, 0, 9.38], steelMat, 0.032);
    cyl(barrelMain, 0.135, 1.40, [0, 0, 8.70], darkMat, 'z');
    // Sıkı geçme bilezikler
    for (const [rz, rr] of [[-0.8, 0.43], [0.4, 0.40], [1.9, 0.355], [3.6, 0.325], [5.8, 0.275], [7.9, 0.235]]) {
      ring(barrelMain, rr, [0, 0, rz], frameMat, 0.022);
    }
    // Ateşleme efekti (addCADMesh dışı kayıtsız efekt mesh'i)
    const muzzleFlash = new T.Mesh(new T.ConeGeometry(0.45, 2.2, 16), flashMat);
    muzzleFlash.rotation.x = Math.PI / 2;
    muzzleFlash.position.set(0, 0, 10.55);
    muzzleFlash.visible = false;
    recoilSlide.add(muzzleFlash);

    const breechBlock = part(
      'breechBlock',
      'Kuyruk Halkası & Yatay Kama Bloğu (Keilverschluss)',
      'Forged Breech Ring & Horizontal Sliding Wedge',
      '80 cm Namlu ve Kama',
      '80 cm Barrel & Breech',
      '80 cm atış basıncını karşılayan dövme çelik kuyruk bloğu ve yükleme döngüsünde yana doğru 0,58 m kayarak açılan yatay kama mekanizması.',
      'Massive forged breech ring and horizontal sliding wedge breechblock traveling sideways by 0.58 m during the loading cycle.',
      [0, 0, 0],
      [0, 0.35, -1.15],
      false,
      recoilSlide
    );
    // Kuyruk gövdesi (yerel z = -2.15 .. -1.45)
    box(breechBlock, [0.92, 0.78, 0.70], [0, 0, -1.80], steelMat);
    cyl(breechBlock, 0.145, 0.72, [0, 0, -1.80], darkMat, 'z'); // Arka hazne ağzı temsili delik
    // Hareketli yatay kama bloğu
    const wedgeHolder = G(breechBlock, [0, 0, -1.80], 'breech-wedge');
    box(wedgeHolder, [0.56, 0.48, 0.28], [0, 0, 0], brassMat);
    cyl(wedgeHolder, 0.08, 0.36, [0.32, 0.08, 0], steelMat, 'x');
    const wedgeCrank = box(wedgeHolder, [0.06, 0.28, 0.06], [0.48, 0.08, 0], redMat);

    // =========================================================================
    // D. HİDROLİK GERİ TEPME & GERİ GETİRİCİ (2 GRUP)
    // =========================================================================
    const recoilBrakes = part(
      'recoilBrakes',
      'Alt İkiz Hidrolik Geri Tepme Fren Silindirleri',
      'Lower Twin Hydraulic Recoil Brake Cylinders',
      'Hidrolik Geri Tepme',
      'Hydraulic Recoil System',
      'Atışta 400 tonluk namlunun ~1,2 m (modelde 0,40 m) geri tepme enerjisini emen alt ikiz yağ freni silindirleri ve X-Ray iç yağ hazneleri.',
      'Lower twin hydraulic recoil buffers absorbing the kinetic shock of the 400-tonne barrel assembly during recoil.',
      [0, 0, 0],
      [0, -0.55, 0.3],
      false,
      elevPivot
    );
    const oilVolumes = [];
    const brakeRods = [];
    for (const sx of [-0.36, 0.36]) {
      const thStart = sx < 0 ? -Math.PI * 0.50 : Math.PI;
      mesh(recoilBrakes, new T.CylinderGeometry(0.115, 0.115, 1.90, 24, 1, true, thStart, Math.PI * 1.50), cutawaySteelMat, [sx, -0.48, -0.05], [Math.PI / 2, 0, 0]);
      cyl(recoilBrakes, 0.125, 0.06, [sx, -0.48, -1.00], darkMat, 'z');
      cyl(recoilBrakes, 0.125, 0.06, [sx, -0.48, 0.90], darkMat, 'z');
      const oil = cyl(recoilBrakes, 0.095, 1.65, [sx, -0.48, -0.05], oilMat, 'z');
      oilVolumes.push(oil);
      const rod = cyl(recoilBrakes, 0.042, 1.45, [sx, -0.48, -0.95], steelMat, 'z');
      brakeRods.push(rod);
    }

    const recuperators = part(
      'recuperators',
      'Üst İkiz Hidropnömatik Geri Getirici Silindirler',
      'Upper Twin Hydropneumatic Recuperators',
      'Hidrolik Geri Tepme',
      'Hydraulic Recoil System',
      'Geri tepme sırasında sıkışan yüksek basınçlı azot gazıyla 400 tonluk namluyu yumuşakça ileri batarya konumuna geri döndüren üst ikiz silindirler.',
      'Upper twin nitrogen-charged hydropneumatic recuperator cylinders returning the recoiled barrel forward into battery.',
      [0, 0, 0],
      [0, 0.95, 0.3],
      false,
      elevPivot
    );
    const gasVolumes = [];
    for (const sx of [-0.34, 0.34]) {
      const thStart = sx < 0 ? -Math.PI * 0.50 : Math.PI;
      mesh(recuperators, new T.CylinderGeometry(0.105, 0.105, 1.85, 24, 1, true, thStart, Math.PI * 1.50), cutawayFrameMat, [sx, 0.48, -0.05], [Math.PI / 2, 0, 0]);
      cyl(recuperators, 0.115, 0.06, [sx, 0.48, -0.98], brassMat, 'z');
      cyl(recuperators, 0.115, 0.06, [sx, 0.48, 0.88], brassMat, 'z');
      const gas = cyl(recuperators, 0.085, 1.55, [sx, 0.48, -0.05], gasMat, 'z');
      gasVolumes.push(gas);
    }
    pipe(recuperators, [[-0.34, 0.58, -0.98], [0, 0.66, -0.98], [0.34, 0.58, -0.98]], 0.025, brassMat);

    // =========================================================================
    // E. YÜKLEME VİNÇLERİ, ASANSÖR, 800 MM MÜHİMMAT & ŞEMA (5 GRUP)
    // =========================================================================
    const rearCranes = part(
      'rearCranes',
      'Kıç İkiz Mühimmat Kaldırma Vinçleri',
      'Rear Twin Ammunition Gantry Cranes',
      'Yükleme ve 800 mm Mühimmat',
      'Loading & 800 mm Ammunition',
      '7,1 tonluk zırh delici mermiyi vagon katından arka yükleme güvertesine kaldıran 11,6 m (1:3 ölçekli 3,86 m) kıç ikiz portal vinçler.',
      'Full-height rear gantry cranes (11.6 m full-scale) lifting 7.1-tonne projectiles from ammunition wagons onto the loading deck.',
      [0, 0, 0],
      [0, 0.75, -0.85],
      false,
      carriageMoveGroup
    );
    for (const sx of [-0.90, 0.90]) {
      beam(rearCranes, [sx, 1.85, -4.32], [sx, 3.80, -4.32], 0.14, frameMat);
      beam(rearCranes, [sx, 1.85, -3.55], [sx, 3.80, -3.85], 0.11, bridgeMat);
    }
    box(rearCranes, [2.04, 0.14, 0.62], [0, 3.79, -4.12], steelMat); // tepe = 3.86 m
    const craneTrolley = G(rearCranes, [0, 3.65, -4.12], 'crane-trolley');
    box(craneTrolley, [0.36, 0.14, 0.36], [0, 0, 0], brassMat);
    const hoistCable = cyl(craneTrolley, 0.014, 1.40, [0, -0.75, 0], darkMat, 'y');

    const ammoElevator = part(
      'ammoElevator',
      'Kıç Yükleme Güvertesi & Zincirli Mermi Asansörü',
      'Rear Loading Deck & Chain Ammunition Hoist',
      'Yükleme ve 800 mm Mühimmat',
      'Loading & 800 mm Ammunition',
      'Alt mühimmat vagonundan gelen 800 mm mermi ve barut kovanını 2,85 m yükseklikteki yükleme oluğuna çıkaran elektrikli asansör.',
      'Electrically driven chain elevator lifting 800 mm projectiles and brass charges up to the rear loading deck.',
      [0, 0, 0],
      [-0.75, 0.45, -0.65],
      false,
      carriageMoveGroup
    );
    // Asansör kuyusu açıklıklı arka güverte (z = -4.55..-3.55 arası orta boş)
    box(ammoElevator, [1.56, 0.08, 1.40], [0, 1.92, -2.85], bridgeMat);
    box(ammoElevator, [0.42, 0.08, 1.00], [-0.57, 1.92, -4.05], bridgeMat);
    box(ammoElevator, [0.42, 0.08, 1.00], [0.57, 1.92, -4.05], bridgeMat);
    for (const sx of [-0.34, 0.34]) {
      beam(ammoElevator, [sx, 1.15, -4.15], [sx, 3.10, -4.15], 0.055, steelMat);
    }
    const elevatorCar = G(ammoElevator, [0, 1.35, -4.05], 'elevator-car');
    box(elevatorCar, [0.58, 0.10, 0.72], [0, 0, 0], brassMat);

    const rammerTray = part(
      'rammerTray',
      'Yükleme Oluğu & Hidrolik Mermi Tokmağı (Rammer)',
      'Loading Tray & Hydraulic Rammer',
      'Yükleme ve 800 mm Mühimmat',
      'Loading & 800 mm Ammunition',
      'Yükleme çevriminin %55–%85 aralığında 800 mm mermiyi ve barut kovanını açık yatay kama haznesine iten teleskopik hidrolik tokmak.',
      'Telescopic hydraulic rammer tray driving the heavy 800 mm shell and propellant charge into the open breech chamber.',
      [0, 0, 0],
      [0.75, 0.55, -0.45],
      false,
      carriageMoveGroup
    );
    box(rammerTray, [0.44, 0.08, 1.75], [0, 2.68, -2.92], frameMat);
    const rammerArm = G(rammerTray, [0, 2.86, -3.65], 'rammer-arm');
    box(rammerArm, [0.16, 0.12, 1.25], [0, 0, 0], steelMat);
    cyl(rammerArm, 0.13, 0.08, [0, 0, 0.65], brassMat, 'z');

    const ammunition = part(
      'ammunition',
      '800 mm Mermi Ailesi (7,1 t AP / 4,8 t HE) & Ölçek Standı',
      '800 mm Shells (7.1 t AP / 4.8 t HE) & Human Scale Stand',
      'Yükleme ve 800 mm Mühimmat',
      'Loading & 800 mm Ammunition',
      'Hareketli 7,1 ton zırh delici (AP, 38 km) veya 4,8 ton yüksek patlayıcılı (HE, 47 km) 800 mm mermi ile yanda 1,75 m insan boyu kıyas standı.',
      'Switchable 7.1-tonne AP or 4.8-tonne HE 800 mm shell on the loading path alongside a 1.75 m human-scale comparison display.',
      [0, 0, 0],
      [0.95, 0.25, -0.35],
      false,
      carriageMoveGroup
    );
    // Hareketli aktif mermi + kovan grubu
    const activeRound = G(ammunition, [0, 1.62, -4.05], 'active-round');
    const shellBodyAP = G(activeRound, [0, 0, 0], 'shell-ap');
    cyl(shellBodyAP, 0.133, 0.68, [0, 0, 0.10], darkMat, 'z');
    mesh(shellBodyAP, new T.ConeGeometry(0.133, 0.42, 24), redMat, [0, 0, 0.65], [Math.PI / 2, 0, 0]);
    cyl(shellBodyAP, 0.136, 0.06, [0, 0, -0.15], copperMat, 'z');

    const shellBodyHE = G(activeRound, [0, 0, 0], 'shell-he');
    cyl(shellBodyHE, 0.133, 0.56, [0, 0, 0.04], oliveMat, 'z');
    mesh(shellBodyHE, new T.ConeGeometry(0.133, 0.36, 24), oliveMat, [0, 0, 0.50], [Math.PI / 2, 0, 0]);
    cyl(shellBodyHE, 0.136, 0.06, [0, 0, -0.15], copperMat, 'z');
    // Pirinç barut kovanı ve ipek barut kesesi
    cyl(activeRound, 0.145, 0.44, [0, 0, -0.54], brassMat, 'z');
    cyl(activeRound, 0.12, 0.30, [0, 0, -0.94], silkMat, 'z');

    // Sağ yanda sabit zemin ölçek karşılaştırma standı (min.y = 0.000)
    const scaleStand = G(ammunition, [2.05, 0, -3.55], 'scale-stand');
    box(scaleStand, [0.95, 0.06, 0.72], [0, 0.03, 0], steelMat);
    cyl(scaleStand, 0.133, 0.72, [-0.20, 0.42, 0], darkMat, 'y');
    mesh(scaleStand, new T.ConeGeometry(0.133, 0.44, 24), redMat, [-0.20, 1.00, 0]);
    // 1,75 m İnsan Ölçeği (1:3 ölçek = 0.583 m)
    cyl(scaleStand, 0.06, 0.24, [0.22, 0.18, 0], humanMat, 'y');
    cyl(scaleStand, 0.075, 0.22, [0.22, 0.41, 0], humanMat, 'y');
    mesh(scaleStand, new T.SphereGeometry(0.055, 12, 10), humanMat, [0.22, 0.57, 0]);

    const azimuthDiagram = part(
      'azimuthDiagram',
      'Kavisli Demiryolu Nişan Şeması (Schießkurve)',
      'Curved Firing-Track Azimuth Diagram (Schießkurve)',
      'Yükleme ve 800 mm Mühimmat',
      'Loading & 800 mm Ammunition',
      'Üst kule yan dönüşü olmadığı için tüm topun ±15° kavisli ray üzerinde kaydırılarak yatay nişan almasını gösteren yer diyagramı.',
      'Ground diagram illustrating lateral azimuth aiming by shifting the entire 1,350-tonne gun along curved Schießkurve rails (±15°).',
      [0, 0, 0],
      [0, 0.05, 0.4],
      false,
      root
    );
    mesh(azimuthDiagram, new T.RingGeometry(6.75, 7.05, 36, 1, Math.PI * 1.38, Math.PI * 0.24), diagramMat, [0, 0.015, 0.85], [-Math.PI / 2, 0, 0]);
    const azPointerGrp = G(azimuthDiagram, [0, 0.225, 0.85], 'az-pointer');
    box(azPointerGrp, [0.08, 0.014, 6.80], [0, 0, 3.40], curveWarnMat);
    const arrowHead = K.polygon(azPointerGrp, [[0, -0.38], [-0.22, 0], [0.22, 0]], 0.018, curveWarnMat);
    arrowHead.rotation.x = -Math.PI / 2;
    arrowHead.position.set(0, -0.008, 6.75);

    function updateWheelInstances(wheelRot) {
      for (const side of [leftWheelInst, rightWheelInst]) {
        side.axleTransforms.forEach((tr, i) => {
          wheelDummy.position.set(...tr.pos);
          wheelDummy.rotation.set(wheelRot, 0, Math.PI / 2);
          wheelDummy.updateMatrix();
          side.axleMesh.setMatrixAt(i, wheelDummy.matrix);
        });
        side.axleMesh.instanceMatrix.needsUpdate = true;

        side.wheelTransforms.forEach((tr, i) => {
          wheelDummy.position.set(...tr.pos);
          wheelDummy.rotation.set(wheelRot, 0, Math.PI / 2);
          wheelDummy.updateMatrix();
          side.wheelMesh.setMatrixAt(i, wheelDummy.matrix);
        });
        side.wheelMesh.instanceMatrix.needsUpdate = true;

        side.flangeTransforms.forEach((tr, i) => {
          wheelDummy.position.set(...tr.pos);
          wheelDummy.rotation.set(wheelRot, 0, Math.PI / 2);
          wheelDummy.updateMatrix();
          side.flangeMesh.setMatrixAt(i, wheelDummy.matrix);
        });
        side.flangeMesh.instanceMatrix.needsUpdate = true;
      }
    }

    function recoilOffset() {
      if (S.recoilPhase <= 0) return 0;
      return S.recoilPhase < 0.20
        ? 0.40 * Math.sin((S.recoilPhase / 0.20) * (Math.PI / 2))
        : 0.40 * Math.pow(1 - (S.recoilPhase - 0.20) / 0.80, 1.8);
    }

    function sync() {
      const elevRad = (S.elevDeg * Math.PI) / 180;
      const trackShift = (S.trackDeg / 15) * MAX_SHIFT;
      const wheelRot = trackShift / R_W;

      // Araç konum kayması ve 80 tekerlek dönüşü
      carriageMoveGroup.position.z = trackShift;
      updateWheelInstances(wheelRot);

      // Muylu yükseliş ve dişli yay/pinyon oranı
      elevPivot.rotation.x = -elevRad;
      const pinRot = elevRad * (R_ARC / R_PIN);
      leftPinionGrp.rotation.x = pinRot;
      rightPinionGrp.rotation.x = pinRot;
      dialPointer.rotation.x = -elevRad;

      // Geri tepme & hidrolik sıkışma
      const r = recoilOffset();
      recoilSlide.position.z = r === 0 ? 0 : -r;
      const oilScale = Math.max(0.45, (1.65 - r * 0.95) / 1.65);
      const gasScale = Math.max(0.45, (1.55 - r * 0.90) / 1.55);
      for (const oil of oilVolumes) {
        oil.scale.y = oilScale;
        oil.position.z = -0.05 + (1.65 * (1 - oilScale)) * 0.45;
      }
      for (const gas of gasVolumes) {
        gas.scale.y = gasScale;
        gas.position.z = -0.05 + (1.55 * (1 - gasScale)) * 0.45;
      }
      for (const rod of brakeRods) {
        rod.position.z = -0.95 - r * 0.85;
      }

      muzzleFlash.visible = S.firing && S.recoilPhase < 0.18;

      // 4 Fazlı Yükleme & Kama Döngüsü (loadPct 0..100)
      const p = S.loadPct / 100;
      let wedgeFrac = 0;
      let liftFrac = 0;
      let ramFrac = 0;
      if (p > 0 && p < 1) {
        if (p < 0.25) {
          wedgeFrac = p / 0.25;
        } else if (p < 0.55) {
          wedgeFrac = 1;
          liftFrac = (p - 0.25) / 0.30;
        } else if (p < 0.85) {
          wedgeFrac = 1;
          liftFrac = 1;
          ramFrac = (p - 0.55) / 0.30;
        } else {
          wedgeFrac = 1 - (p - 0.85) / 0.15;
          liftFrac = 0;
          ramFrac = 0;
        }
      }

      wedgeHolder.position.x = wedgeFrac * 0.58;
      wedgeCrank.rotation.z = wedgeFrac * 1.45;

      const elevY = 1.35 + liftFrac * 1.40;
      elevatorCar.position.y = elevY;
      craneTrolley.position.z = -4.12 + liftFrac * 0.25;
      const cabLen = Math.max(0.60, 2.25 - liftFrac * 1.15);
      hoistCable.scale.y = cabLen / 1.40;
      hoistCable.position.y = -cabLen / 2;

      rammerArm.position.z = -3.65 + ramFrac * 1.60;
      activeRound.position.y = 1.62 + liftFrac * 1.24;
      activeRound.position.z = -4.05 + ramFrac * 1.65;
      activeRound.visible = p < 0.88;

      // AP vs HE Mermi görünümü
      shellBodyAP.visible = S.apShell;
      shellBodyHE.visible = !S.apShell;

      // Jeneratör pervaneleri ve Schießkurve diyagramı
      for (const f of fanRotors) f.rotation.z = S.genPhase;
      azimuthDiagram.visible = S.showDiagram;
      azPointerGrp.rotation.y = (-S.trackDeg * Math.PI) / 180;
    }

    function reset() {
      Object.assign(S, {
        elevDeg: 22,
        loadPct: 0,
        trackDeg: 0,
        apShell: true,
        showDiagram: true,
        ammo: 48,
        recoilPhase: 0,
        firing: false
      });
      sync();
    }

    const camPresets = {
      iso: { pos: [12.5, 7.2, 11.8], look: [0.3, 2.2, 0.8] },
      front: { pos: [3.4, 4.4, 14.5], look: [0, 2.8, 2.6] },
      breech: { pos: [-5.6, 4.2, -7.8], look: [0, 2.5, -2.4] },
      engine: { pos: [5.8, 4.4, 2.2], look: [0, 2.2, 1.3] },
      suspension: { pos: [6.4, 1.8, -1.8], look: [0, 0.7, -1.6] },
      top: { pos: [0.2, 17.5, 0.8], look: [0, 2.0, 0.8] }
    };

    const tourSteps = [
      [
        ['İkiz Demiryolu & 80 Tekerlek', 'Twin parallel tracks & 80 wheels'],
        ['1.350 tonluk kütle iki paralel standart demiryolu hattında 8×5 akslı bojilerle (40 aks / 80 tekerlek) taşınır; yön ayarı ±15° kavisli raylarla (Schießkurve) yapılır.', 'Two parallel rail lines carry 40 axles and 80 flanged wheels; lateral aiming shifts the entire gun along ±15° curved Schießkurve tracks.'],
        'suspension', 'leftBogies', false
      ],
      [
        ['32,48 m 800 mm Yivli Namlu', '32.48 m 800 mm rifled Krupp barrel'],
        ['Tarihin en büyük çaplı yivli namlusu: 400 tonluk döner kütle muylular üstünde dişli yaylarla +48° açısına kadar yükseltilir.', 'At 32.48 m (1:3 scale 10.83 m), this is the largest-caliber rifled barrel ever fired in combat, elevated up to +48° by twin toothed arcs.'],
        'iso', 'barrelMain', false
      ],
      [
        ['Alt ve Üst Hidrolik Geri Tepme', 'Hydraulic recoil brakes & recuperators'],
        ['X-Ray görünümünde alttaki mavi yağlı geri tepme frenlerinin ve üstteki amber hidropnömatik geri getiricilerin ateşte sıkışmasını izleyin.', 'Enable X-Ray to observe the blue hydraulic recoil buffers below and amber hydropneumatic recuperators above compressing at fire.'],
        'engine', 'recoilBrakes', true
      ],
      [
        ['Yatay Kama & Yükleme Döngüsü', 'Horizontal wedge breech & loading'],
        ['Yükleme kaydırıcısını kaydırarak yatay kama bloğunun yana açılmasını, asansörün 800 mm mermiyi kaldırmasını ve tokmağın sürmesini izleyin.', 'Move the loading slider to watch the sliding wedge open sideways, the chain hoist raise an 800 mm shell, and the hydraulic rammer seat it.'],
        'breech', 'breechBlock', false
      ],
      [
        ['7,1 t AP ve 4,8 t HE Mermi Ölçeği', '7.1 t AP / 4.8 t HE & human scale'],
        ['Arka yükleme yanındaki 1,75 m insan boyu kıyas standıyla 7,1 tonluk Betongranate zırh delici merminin devasa boyutunu karşılaştırın.', 'Compare the 1.75 m human-scale reference beside the 800 mm shell to grasp the sheer mass of 7.1 t AP and 4.8 t HE rounds.'],
        'breech', 'ammunition', false
      ],
      [
        ['Ana Gövde & Sivastopol Salvosu', 'Twin box carriage & full recoil fire'],
        ['Kama kilitliyken Ateşle düğmesine basarak 0,40 m ölçekli namlu geri tepmesini ve Sivastopol’da kullanılan 48 atımlık stok sayacını test edin.', 'With the breech locked, press Fire to trigger full 0.40 m scale barrel recoil across the open center pit.'],
        'iso', 'mainCarriage', true
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
      cameraPadding: 0.88,
      shadowExtent: 14,
      fog: { near: 26, far: 78 },
      title: t('SCHWERER GUSTAV — 80 cm Kanone (E) (1941)', 'SCHWERER GUSTAV — 80 cm Kanone (E) (1941)'),
      sub: t('1:3 Müze Ölçeği • 32,48 m Namlu • 80 Tekerlekli İkiz Demiryolu Topu', '1:3 Museum Scale • 32.48 m Barrel • 80-Wheel Twin-Track Railway Gun'),
      subsystems: Object.entries(counts).map(([key, count]) => ({ key, label: key, count, color: '#64748b' })),
      camLabels: Object.fromEntries(Object.entries({
        iso: ['Genel Sergi', 'Full exhibit'],
        front: ['Ön Namlu', 'Front muzzle'],
        breech: ['Kama & Yükleme', 'Breech & hoist'],
        engine: ['Geri Tepme & Güç', 'Recoil & power'],
        suspension: ['80 Tekerlek & Ray', '80 wheels & rail'],
        top: ['Kuş Bakışı', 'Top view']
      }).map(([k, v]) => [k, t(...v)])),
      sliders: [
        [['Namlu Yükselişi', 'Barrel elevation'], 0, 48, '°'],
        [['Yükleme & Kama Döngüsü', 'Loading & breech cycle'], 0, 100, '%'],
        [['Ray Konumu (Schießkurve)', 'Track shift (Schießkurve)'], -15, 15, '°']
      ].map(([labels, min, max, unit]) => ({
        label: t(...labels),
        min,
        max,
        step: 1,
        fmt: v => Math.round(v) + unit
      })),
      buttons: {
        terrain: t('Kavisli Ray Şeması (Schießkurve)', 'Show Schießkurve azimuth track'),
        sweep: t('Sistemi Sıfırla', 'Reset system'),
        mode: true
      },
      telemetryTag: t('GUSTAV • 800 MM DEMİRYOLU TOPU', 'GUSTAV • 800 MM RAILWAY GUN'),
      statLabels: [
        ['YÜKSELİŞ / KAMA', 'ELEV / BREECH'],
        ['MERMİ / MENZİL', 'SHELL / RANGE'],
        ['RAY KAYMASI', 'TRACK SHIFT'],
        ['STOK (SİVASTOPOL)', 'AMMO (SEVASTOPOL)']
      ].map(v => t(...v))
    });

    sync();

    return {
      root,
      parts,
      ui,
      camPresets,
      tourSteps,
      defaultPart: parts.barrelMain,
      firePart: parts.breechBlock,
      update(dt) {
        if (!Number.isFinite(dt)) return;
        const clampedDt = T.MathUtils.clamp(dt, 0, 0.05);
        S.genPhase = (S.genPhase + clampedDt * 2.4) % (Math.PI * 2);
        if (S.firing) {
          S.recoilPhase += clampedDt * 1.15;
          if (S.recoilPhase >= 1) {
            S.recoilPhase = 0;
            S.firing = false;
          }
        }
        sync();
      },
      onFire() {
        const breechOpen = S.loadPct > 0 && S.loadPct < 100;
        if (breechOpen) {
          return {
            ok: false,
            msg: t('Kama açık — yükleme tamamlanmadan ateşlenemez!', 'Breech open — complete loading before firing!')
          };
        }
        if (S.ammo <= 0) {
          S.ammo = 48;
          sync();
          return { ok: true, resupplied: true };
        }
        S.ammo -= 1;
        S.firing = true;
        S.recoilPhase = 0.01;
        sync();
        return { ok: true };
      },
      fireButtonLabel: () => t(S.ammo > 0 ? '800 MM TOPU ATEŞLE' : '48 MERMİ İKMALİ', S.ammo > 0 ? 'FIRE 800 MM CANNON' : 'RESUPPLY 48 SHELLS'),
      mobileFireButtonLabel: () => t(S.ammo > 0 ? 'ATEŞLE' : 'İKMAL', S.ammo > 0 ? 'FIRE' : 'RELOAD'),
      modeLabel: () => t(S.apShell ? 'Mermi: 7,1 t AP (38 km)' : 'Mermi: 4,8 t HE (47 km)', S.apShell ? 'Shell: 7.1 t AP (38 km)' : 'Shell: 4.8 t HE (47 km)'),
      onSlider(i, v) {
        if (!Number.isFinite(v)) return {};
        const clamped = T.MathUtils.clamp(v, ui.sliders[i].min, ui.sliders[i].max);
        if (i === 0) S.elevDeg = clamped;
        else if (i === 1) S.loadPct = clamped;
        else if (i === 2) S.trackDeg = clamped;
        sync();
        return {};
      },
      onButton(name) {
        if (name === 'terrain') {
          S.showDiagram = !S.showDiagram;
          sync();
        } else if (name === 'sweep') {
          reset();
        } else if (name === 'mode') {
          S.apShell = !S.apShell;
          sync();
        }
        return {};
      },
      buttonActive: name => (name === 'terrain' && S.showDiagram) || (name === 'mode' && S.apShell),
      getSliderValues: () => [S.elevDeg, S.loadPct, S.trackDeg],
      getStats: () => {
        const breechClosed = S.loadPct === 0 || S.loadPct === 100;
        return [
          `${Math.round(S.elevDeg)}° / ${breechClosed ? t('KİLİT', 'LOCK') : t('AÇIK', 'OPEN')}`,
          S.apShell ? '7.1t AP (38 km)' : '4.8t HE (47 km)',
          `${Math.round(S.trackDeg)}° <span>(${((S.trackDeg / 15) * MAX_SHIFT).toFixed(2)} m)</span>`,
          String(S.ammo)
        ];
      },
      getStatus: () => {
        const breechOpen = S.loadPct > 0 && S.loadPct < 100;
        if (S.firing) {
          return { text: t('800 MM GERİ TEPME & HİDROLİK SÖNÜMLEME', '800 MM RECOIL & HYDRAULIC RECOVERY'), color: '#dc2626' };
        }
        if (breechOpen) {
          return { text: t('KAMA AÇIK — YÜKLEME DÖNGÜSÜ AKTİF (ATEŞ KİLİTLİ)', 'BREECH OPEN — LOADING CYCLE ACTIVE (FIRE LOCKED)'), color: '#d97706' };
        }
        return { text: t('KAMA KİLİTLİ • ATEŞE HAZIR', 'BREECH LOCKED • READY TO FIRE'), color: '#0284c7' };
      },
      applyTextures: K.applyTextures,
      setTexture: K.setTexture,
      toggleRelief: K.toggleRelief
    };
  };
})();
