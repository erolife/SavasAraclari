/* ASELSAN KORKUT — FNSS ACV-30 Şasisi Üzerinde 2× 35 mm Hava Savunma Sistemi & ATOM Parçacıklı Mühimmat (2016)
 * ASELSAN / TSKGV referanslı müze sergisi; iç şeritsiz besleme, kule kesiti ve parçacık bulutu eğitim amaçlıdır. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.korkut = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'korkut');
    const { T, root, parts, mats, mesh, box, cyl, ring, pipe, beam, instances } = K;
    const english = window.MuseumPreferences?.language === 'en';
    const t = (tr, en) => (english ? en : tr);

    const TURRET_POS = new T.Vector3(0, 1.56, -0.15);
    const CRADLE_POS = new T.Vector3(0, 0.38, 0.34);

    const state = {
      yawDeg: 14,      // Kule yön açısı (-180..+180°)
      elevDeg: 28,     // Namlu yükseliş açısı (-10..+85°)
      scanPct: 60,     // Sensör & takip taraması (0..100%)
      atomMode: true,  // ATOM Parçacıklı vs HEI-T
      showDiagram: true,
      ammo: 400,
      firing: false,
      fireTimer: 0,
      leftRecoil: 0,
      rightRecoil: 0,
      scanPhase: 0
    };

    const counts = {};
    let partIndex = 0;

    function mat(color, metalness = 0.45, roughness = 0.52, paint = false) {
      const m = new T.MeshStandardMaterial({ color, metalness, roughness, bumpScale: 0.002 });
      m.userData.paint = paint;
      return m;
    }

    const camoMat = mat(0x6c6855, 0.28, 0.72, true);
    const turretMat = mat(0x5b5848, 0.32, 0.66, true);
    const steelMat = mats.steel.clone();
    const darkMat = mats.dark.clone();
    const rubberMat = mats.rubber.clone();
    const brassMat = mats.brass.clone();
    const copperMat = mat(0xc26d38, 0.80, 0.30, false);
    const radomeMat = mat(0xc8c3b4, 0.15, 0.55, false);
    const glassMat = new T.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.48,
      roughness: 0.12,
      metalness: 0.2
    });
    const pathMat = new T.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
    const burstMat = new T.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.9 });
    const pelletMat = new T.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.85, metalness: 0.85, roughness: 0.2 });

    function part(id, tr, en, subTr, subEn, descTr, descEn, basePos = [0, 0, 0], exp = [0, 0.5, 0], outer = false, parent = root) {
      const sub = t(subTr, subEn);
      counts[sub] = (counts[sub] || 0) + 1;
      const p = K.part(id, ++partIndex + '. ' + t(tr, en), sub, basePos, exp, t(descTr, descEn), outer, parent);
      Object.assign(p.userData, {
        material: t('Alüminyum/çelik zırh, MKE 35 mm KDC-02 namlu ve tungsten parçacıklı mühimmat', 'Aluminum/steel armor, MKE 35 mm KDC-02 barrels & tungsten ABM'),
        weight: t('FNSS ACV-30 sınıfı amfibi paletli taşıyıcı (~30 t sınıfı)', 'FNSS ACV-30 amphibious tracked platform (~30 t class)'),
        spec: t('2× 35 mm • 1.100 atım/dk • ATOM 35 mm (4 km etkili menzil)', '2× 35 mm • 1,100 rpm • ATOM 35 mm (4 km effective range)')
      });
      return p;
    }

    // -------------------------------------------------------------------------
    // A. ACV-30 AMFİBİ GÖVDE (ACV-30 AMPHIBIOUS HULL) — 5 Grup
    // -------------------------------------------------------------------------
    const hull = part(
      'hull',
      'FNSS ACV-30 Amfibi Zırhlı Gövde',
      'FNSS ACV-30 amphibious armored hull',
      'ACV-30 Amfibi Gövde',
      'ACV-30 Amphibious Hull',
      'Burun dalga kıran levhalı, derin su geçişine ve yüzmeye uyumlu alçak profilli zırhlı gövde.',
      'Amphibious tracked armored chassis with bow trim vane and driver periscopes.',
      [0, 0, 0],
      [0, 0.6, 0],
      true
    );
    const hullShape = new T.Shape();
    hullShape.moveTo(-2.75, 0.55);
    hullShape.lineTo(2.45, 0.55);
    hullShape.lineTo(2.95, 1.05);
    hullShape.lineTo(2.45, 1.54);
    hullShape.lineTo(-2.75, 1.54);
    hullShape.closePath();
    const hullGeo = new T.ExtrudeGeometry(hullShape, { depth: 2.15, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1 });
    mesh(hull, hullGeo, camoMat, [0, 0, -1.075], [0, -Math.PI / 2, 0]);
    // Dalga kıran (ön burun, +Z yönü ön olsun)
    box(hull, [1.85, 0.32, 0.06], [0, 1.44, 2.74], camoMat, [0.42, 0, 0]);
    // Sürücü/komutan periskop kupolası
    box(hull, [0.54, 0.14, 0.54], [-0.55, 1.61, 1.48], darkMat);
    box(hull, [0.42, 0.08, 0.12], [-0.55, 1.66, 1.72], glassMat);

    const powerpack = part(
      'powerpack',
      'Ön-Sağ Dizel Güç Paketi ve Soğutma',
      'Front-right diesel powerpack & cooling',
      'ACV-30 Amfibi Gövde',
      'ACV-30 Amphibious Hull',
      'Ön-sağ bölmede yer alan dizel motor, transmisyon ve üst soğutma panjurları.',
      'Front-right diesel powerpack, transmission and armored louver deck.',
      [0, 0, 0],
      [0.7, 0.7, 0.4]
    );
    box(powerpack, [0.78, 0.62, 1.55], [0.48, 1.06, 1.35], darkMat);
    box(powerpack, [0.84, 0.08, 1.48], [0.48, 1.57, 1.35], steelMat);
    for (let z = 0.75; z <= 1.95; z += 0.24) {
      box(powerpack, [0.72, 0.03, 0.10], [0.48, 1.62, z], darkMat);
    }

    const waterjets = part(
      'waterjets',
      'Kıç İkiz Amfibi Su Jetleri',
      'Stern twin amphibious waterjets',
      'ACV-30 Amfibi Gövde',
      'ACV-30 Amphibious Hull',
      'Nehir ve su geçişlerinde 6+ km/sa hızla ilerleme sağlayan arka ikiz su jeti itki nozulları.',
      'Twin rear hydro-jet thrusters enabling amphibious river and lake crossings.',
      [0, 0, 0],
      [0, 0.2, -0.9]
    );
    for (const x of [-0.62, 0.62]) {
      cyl(waterjets, 0.19, 0.36, [x, 0.92, -2.84], steelMat, 'z', 0.14);
      ring(waterjets, 0.19, [x, 0.92, -3.02], darkMat, 0.03);
    }
    box(waterjets, [0.95, 0.72, 0.10], [0, 1.02, -2.78], camoMat);

    const runningGear = part(
      'runningGear',
      '6×2 Yol Tekerlekleri & Burulma Süspansiyonu',
      '6×2 road wheels & torsion-bar gear',
      'ACV-30 Amfibi Gövde',
      'ACV-30 Amphibious Hull',
      'Her yanda 6 adet çiftli yol tekerleği, ön dişli cer çarkı ve arka gergi tekeri.',
      'Six dual road wheels per side, forward drive sprockets and rear idlers.',
      [0, 0, 0],
      [0, -0.25, 0]
    );
    for (const xSign of [-1, 1]) {
      const tx = xSign * 1.24;
      for (let i = 0; i < 6; i++) {
        const z = -1.72 + i * 0.68;
        cyl(runningGear, 0.33, 0.22, [tx, 0.38, z], rubberMat, 'x');
        cyl(runningGear, 0.18, 0.24, [tx, 0.38, z], camoMat, 'x');
        beam(runningGear, [xSign * 1.02, 0.56, z - 0.18], [tx, 0.38, z], 0.07, steelMat);
      }
      // Ön cer dişlisi ve arka gergi tekeri
      cyl(runningGear, 0.30, 0.26, [tx, 0.78, 2.38], steelMat, 'x');
      cyl(runningGear, 0.28, 0.24, [tx, 0.76, -2.42], steelMat, 'x');
    }

    const tracks = part(
      'tracks',
      'Lastik Pabuçlu Çelik Paletler',
      'Rubber-padded steel tracks',
      'ACV-30 Amfibi Gövde',
      'ACV-30 Amphibious Hull',
      'Yol ve arazi sürüşüne uyumlu, instanced baklalardan oluşan çift palet hattı.',
      'Twin continuous track runs formed by instanced rubber-padded steel links.',
      [0, 0, 0],
      [0.65, -0.2, 0]
    );
    const trackCurve = new T.CatmullRomCurve3([
      new T.Vector3(0, 0.05, -1.80),
      new T.Vector3(0, 0.05, 1.75),
      new T.Vector3(0, 0.78, 2.68),
      new T.Vector3(0, 1.12, 2.32),
      new T.Vector3(0, 1.12, -2.36),
      new T.Vector3(0, 0.76, -2.72)
    ], true, 'catmullrom', 0.15);
    const trackTransforms = [];
    const N_LINKS = 46;
    for (const xSign of [-1, 1]) {
      const tx = xSign * 1.24;
      for (let i = 0; i < N_LINKS; i++) {
        const u = i / N_LINKS;
        const pt = trackCurve.getPointAt(u);
        const tan = trackCurve.getTangentAt(u);
        const ang = Math.atan2(tan.y, tan.z);
        trackTransforms.push({ pos: [tx, pt.y, pt.z], rot: [-ang, 0, 0] });
      }
    }
    instances(tracks, new T.BoxGeometry(0.42, 0.07, 0.19), rubberMat, trackTransforms);

    // -------------------------------------------------------------------------
    // B. İNSANSIZ KULE & ÇİFT BESLEME (UNMANNED TURRET & DUAL FEED) — 3 Grup
    // -------------------------------------------------------------------------
    const turretRing = part(
      'turretRing',
      'Kule Azimut Dişli Çemberi ve Sepet',
      'Turret azimuth ring gear & basket',
      'İnsansız Kule & Çift Besleme',
      'Unmanned Turret & Dual Feed',
      'Stabilize insansız kuleyi ±180° döndüren 5:1 azimut dişli halkası ve tahrik pinyonu.',
      '5:1 azimuth ring gear and servo pinion driving the stabilized unmanned turret.',
      [TURRET_POS.x, TURRET_POS.y, TURRET_POS.z],
      [0, 0.4, 0]
    );
    ring(turretRing, 0.62, [0, -0.02, 0], steelMat, 0.055, [Math.PI / 2, 0, 0]);
    const turretPinion = cyl(turretRing, 0.124, 0.14, [0.744, -0.02, 0], brassMat, 'y');

    const turretYawGroup = new T.Group();
    turretYawGroup.position.copy(TURRET_POS);
    root.add(turretYawGroup);

    const turretShell = part(
      'turretShell',
      'İnsansız Stabilize Kule Zırh Kabuğu',
      'Unmanned stabilized turret shell',
      'İnsansız Kule & Çift Besleme',
      'Unmanned Turret & Dual Feed',
      'Mürettebat gövde içinde güvenli kaldığı için kompakt tasarlanan insansız kule zırhı.',
      'Compact unmanned armored turret shell keeping crew protected inside the hull.',
      [0, 0, 0],
      [0, 1.0, 0],
      true,
      turretYawGroup
    );
    box(turretShell, [1.56, 0.62, 1.85], [0, 0.34, -0.10], turretMat);
    box(turretShell, [1.22, 0.24, 1.35], [0, 0.74, -0.22], turretMat);

    const dualFeedMag = part(
      'dualFeedMag',
      'Otomatik Şeritsiz Çift Mühimmat Besleme (OŞMBM)',
      'Automatic linkless dual-feed magazine',
      'İnsansız Kule & Çift Besleme',
      'Unmanned Turret & Dual Feed',
      'İki farklı 35 mm mühimmat tipini (ATOM ve HEI-T) şeritsiz besleyen çift tambur ve anlık seçim kolu.',
      'Linkless dual-drum magazine feeding two distinct 35 mm round types with instant selection.',
      [0, 0.22, -0.18],
      [-0.65, 0.65, 0],
      false,
      turretYawGroup
    );
    const drumAtom = cyl(dualFeedMag, 0.24, 0.52, [-0.34, 0, 0], brassMat, 'z');
    const drumHeit = cyl(dualFeedMag, 0.24, 0.52, [0.34, 0, 0], copperMat, 'z');
    const selectorArm = box(dualFeedMag, [0.28, 0.08, 0.14], [-0.14, 0.28, 0.15], steelMat);

    // -------------------------------------------------------------------------
    // C. 2× 35 MM TOP & ATOM PROGRAMLAYICI (TWIN 35 MM & ATOM) — 5 Grup
    // -------------------------------------------------------------------------
    const gunPivot = new T.Group();
    gunPivot.position.copy(CRADLE_POS);
    turretYawGroup.add(gunPivot);

    const gunCradle = part(
      'gunCradle',
      'Yükseliş Beşiği ve Geri Tepme Silindirleri',
      'Elevation cradle & recoil buffers',
      '2× 35 mm Top & ATOM Programlayıcı',
      'Twin 35 mm & ATOM Programmer',
      'İkiz 35 mm KDC-02 topları -10°..+85° aralığında yüksek hızla yönlendiren beşik.',
      'High-speed elevating cradle pitching both 35 mm KDC-02 cannons between -10° and +85°.',
      [0, 0, 0],
      [0, 0.6, 0.5],
      false,
      gunPivot
    );
    box(gunCradle, [0.84, 0.36, 0.72], [0, 0, 0.12], darkMat);
    for (const x of [-0.34, 0.34]) {
      cyl(gunCradle, 0.075, 0.62, [x, 0.16, 0.22], steelMat, 'z');
    }

    const leftGun = part(
      'leftGun',
      'Sol 35 mm KDC-02 L/90 Namlu',
      'Left 35 mm KDC-02 L/90 barrel',
      '2× 35 mm Top & ATOM Programlayıcı',
      'Twin 35 mm & ATOM Programmer',
      '550 atım/dk atış hızına sahip sol 35 mm otomatik top namlusu; ateşlemede sırayla geri teper.',
      'Left 35 mm L/90 autocannon barrel cycling in alternating recoil phase.',
      [-0.32, 0, 0],
      [-0.45, 0.4, 0.8],
      false,
      gunPivot
    );
    const leftBarrelGrp = new T.Group();
    leftGun.add(leftBarrelGrp);
    cyl(leftBarrelGrp, 0.055, 2.25, [0, 0, 1.38], darkMat, 'z');
    cyl(leftBarrelGrp, 0.075, 0.55, [0, 0, 0.48], steelMat, 'z');

    const rightGun = part(
      'rightGun',
      'Sağ 35 mm KDC-02 L/90 Namlu',
      'Right 35 mm KDC-02 L/90 barrel',
      '2× 35 mm Top & ATOM Programlayıcı',
      'Twin 35 mm & ATOM Programmer',
      'Sol namluyla birlikte toplam 1.100 atım/dk ateş gücü üreten sağ 35 mm L/90 top namlusu.',
      'Right 35 mm L/90 barrel combining with the left gun for 1,100 rounds/min.',
      [0.32, 0, 0],
      [0.45, 0.4, 0.8],
      false,
      gunPivot
    );
    const rightBarrelGrp = new T.Group();
    rightGun.add(rightBarrelGrp);
    cyl(rightBarrelGrp, 0.055, 2.25, [0, 0, 1.38], darkMat, 'z');
    cyl(rightBarrelGrp, 0.075, 0.55, [0, 0, 0.48], steelMat, 'z');

    const barrelCage = part(
      'barrelCage',
      'İkiz Namlu Bağlantı & Rijitlik Kafesi',
      'Twin barrel alignment brace',
      '2× 35 mm Top & ATOM Programlayıcı',
      'Twin 35 mm & ATOM Programmer',
      'Yüksek atım hızında titreşimi azaltarak dağılımı daraltan ara namlu bağlantı kelepçesi.',
      'Mid-barrel structural collar reducing harmonic vibration during burst fire.',
      [0, 0, 1.45],
      [0, 0.5, 0.6],
      false,
      gunPivot
    );
    box(barrelCage, [0.78, 0.14, 0.22], [0, 0, 0], turretMat);

    const muzzleCoils = part(
      'muzzleCoils',
      'Namlu Ağzı Hız Ölçer & ATOM Programlama Bobini',
      'Muzzle velocity & ATOM programmer coils',
      '2× 35 mm Top & ATOM Programlayıcı',
      'Twin 35 mm & ATOM Programmer',
      'Her merminin namlu çıkış hızını ölçerek ATOM dip tapasına elektromanyetik indüksiyonla patlama süresini yükleyen bobinler.',
      'Muzzle-mounted velocity sensors and inductive coils programming each ATOM shell’s airburst timer at exit.',
      [0, 0, 2.52],
      [0, 0.5, 1.1],
      false,
      gunPivot
    );
    const coilRings = [];
    for (const x of [-0.32, 0.32]) {
      cyl(muzzleCoils, 0.078, 0.26, [x, 0, 0], steelMat, 'z');
      const cr = ring(muzzleCoils, 0.088, [x, 0, 0.08], copperMat, 0.022);
      coilRings.push(cr);
    }

    // -------------------------------------------------------------------------
    // D. RADAR & ELEKTRO-OPTİK (RADAR & ELECTRO-OPTICS) — 3 Grup
    // -------------------------------------------------------------------------
    const trackingRadar = part(
      'trackingRadar',
      'Kule Arkası 3B Atış Kontrol Takip Radarı',
      'Rear 3D fire-control tracking radar',
      'Radar & Elektro-Optik',
      'Radar & Electro-Optics',
      'Hava hedefini otomatik kilitleyip hız ve mesafe verisi sağlayan stabilize Ku/X-band takip radarı.',
      'Stabilized rear tracking radar dish locking onto aerial targets and feeding fire control.',
      [0, 0.94, -0.78],
      [0, 1.2, -0.6],
      false,
      turretYawGroup
    );
    const radarSpinGrp = new T.Group();
    trackingRadar.add(radarSpinGrp);
    cyl(radarSpinGrp, 0.08, 0.28, [0, 0.14, 0], darkMat, 'y');
    box(radarSpinGrp, [0.58, 0.38, 0.14], [0, 0.36, 0], radomeMat);

    const eotsTurret = part(
      'eotsTurret',
      'Elektro-Optik / Termal / Lazer Hedefleme Küresi',
      'Electro-optical / IR / laser pod',
      'Radar & Elektro-Optik',
      'Radar & Electro-Optics',
      'Gündüz TV, termal kamera ve lazer mesafe ölçer içeren bağımsız stabilize optik başlık.',
      'Independent stabilized sensor turret housing thermal, daylight and laser rangefinder optics.',
      [0.48, 0.92, 0.06],
      [0.5, 1.2, 0.3],
      false,
      turretYawGroup
    );
    const eotsSpinGrp = new T.Group();
    eotsTurret.add(eotsSpinGrp);
    cyl(eotsSpinGrp, 0.06, 0.18, [0, 0.09, 0], darkMat, 'y');
    mesh(eotsSpinGrp, new T.SphereGeometry(0.18, 18, 14), turretMat, [0, 0.24, 0]);
    cyl(eotsSpinGrp, 0.07, 0.08, [0, 0.24, 0.16], glassMat, 'z');

    const sensorsSmoke = part(
      'sensorsSmoke',
      'Meteoroloji Direği & Sis Havanları',
      'Met sensor mast & smoke dischargers',
      'Radar & Elektro-Optik',
      'Radar & Electro-Optics',
      'Rüzgâr/basınç ölçen meteoroloji sensörü ve kule yanındaki koruyucu sis havanları.',
      'Meteorological mast feeding ballistic wind corrections and lateral smoke grenade launchers.',
      [0, 0.65, -0.35],
      [-0.7, 0.9, -0.4],
      false,
      turretYawGroup
    );
    cyl(sensorsSmoke, 0.025, 0.45, [-0.58, 0.34, -0.35], steelMat, 'y');
    for (const xSign of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        cyl(sensorsSmoke, 0.04, 0.18, [xSign * 0.80, -0.18, 0.18 + k * 0.14], darkMat, 'z', 0.04, [0, 0, xSign * -0.4]);
      }
    }

    // -------------------------------------------------------------------------
    // E. ATOM HAVA PATLAMASI ŞEMASI (ATOM AIRBURST DIAGRAM) — 3 Grup
    // -------------------------------------------------------------------------
    const flightPath = part(
      'flightPath',
      'Programlı Mermi Uçuş İzi',
      'Programmed ballistic trace',
      'ATOM Hava Patlaması Şeması',
      'ATOM Airburst Diagram',
      'Namludan çıkarken programlanan ATOM mermisinin hedef önündeki paralanma noktasına giden ekseni.',
      'Trajectory axis leading from the inductive muzzle programmer to the target airburst point.',
      [0, 0, 0],
      [0, 0.4, 1.5],
      false,
      gunPivot
    );
    cyl(flightPath, 0.015, 3.2, [0, 0, 4.15], pathMat, 'z');

    const burstRing = part(
      'burstRing',
      'Dip Tapa Paralanma Halkası',
      'Base-fuze airburst ring',
      'ATOM Hava Patlaması Şeması',
      'ATOM Airburst Diagram',
      'Merminin programlanan milisaniyede hedef önünde patladığı noktayı gösteren halka.',
      'Marker ring indicating the exact pre-programmed airburst point ahead of the threat.',
      [0, 0, 5.75],
      [0, 0.5, 1.8],
      false,
      gunPivot
    );
    ring(burstRing, 0.28, [0, 0, 0], burstMat, 0.028);
    const burstFlash = mesh(burstRing, new T.SphereGeometry(0.14, 12, 10), burstMat, [0, 0, 0]);

    const tungstenCone = part(
      'tungstenCone',
      'Tungsten Parçacık Bulutu & Temsili İHA Hedefi',
      'Tungsten pellet cloud & target UAV',
      'ATOM Hava Patlaması Şeması',
      'ATOM Airburst Diagram',
      'ATOM modunda hedef önünde açılan yoğun tungsten bilye konisi ve temsili İHA hedefi.',
      'High-density tungsten fragment cone dispersing ahead of a representative UAV target.',
      [0, 0, 5.85],
      [0, 0.6, 2.2],
      false,
      gunPivot
    );
    const cloudGroup = new T.Group();
    tungstenCone.add(cloudGroup);
    const pelletTransforms = [];
    for (let ringIdx = 0; ringIdx < 3; ringIdx++) {
      const zOff = 0.25 + ringIdx * 0.34;
      const rad = 0.14 + ringIdx * 0.20;
      const cnt = 8 + ringIdx * 4;
      for (let j = 0; j < cnt; j++) {
        const a = (j * Math.PI * 2) / cnt + ringIdx * 0.2;
        pelletTransforms.push({ pos: [Math.cos(a) * rad, Math.sin(a) * rad, zOff] });
      }
    }
    instances(cloudGroup, new T.SphereGeometry(0.032, 8, 6), pelletMat, pelletTransforms);

    // Küçük temsili İHA hedef silueti (z_local = +1.35)
    const uavGrp = new T.Group();
    uavGrp.position.set(0, 0, 1.35);
    tungstenCone.add(uavGrp);
    box(uavGrp, [0.12, 0.09, 0.62], [0, 0, 0], darkMat);
    box(uavGrp, [0.95, 0.03, 0.22], [0, 0.02, 0.04], mats.red);

    function sync() {
      const yawRad = (state.yawDeg * Math.PI) / 180;
      const elevRad = (state.elevDeg * Math.PI) / 180;

      turretYawGroup.rotation.y = -yawRad;
      turretPinion.rotation.y = yawRad * (0.62 / 0.124);
      gunPivot.rotation.x = -elevRad;

      // Geri tepme konumu
      leftBarrelGrp.position.z = -state.leftRecoil * 0.22;
      rightBarrelGrp.position.z = -state.rightRecoil * 0.22;

      // Çift mühimmat seçimi ve bobin vurgusu
      selectorArm.position.x = state.atomMode ? -0.14 : 0.14;
      drumAtom.scale.setScalar(state.atomMode ? 1.06 : 0.96);
      drumHeit.scale.setScalar(state.atomMode ? 0.96 : 1.06);

      // Sensör taraması (scanPct === 0 iken durur)
      if (state.scanPct === 0) {
        radarSpinGrp.rotation.y = 0;
        eotsSpinGrp.rotation.y = 0;
      } else {
        radarSpinGrp.rotation.y = Math.sin(state.scanPhase * 1.4) * 0.55;
        eotsSpinGrp.rotation.y = Math.cos(state.scanPhase * 0.9) * 0.85;
      }

      // ATOM Diyagramı görünürlüğü
      flightPath.visible = state.showDiagram;
      burstRing.visible = state.showDiagram;
      tungstenCone.visible = state.showDiagram;
      cloudGroup.visible = state.atomMode;
      burstFlash.scale.setScalar(state.firing ? 1.65 : state.atomMode ? 1.0 : 0.55);
    }

    function reset() {
      Object.assign(state, {
        yawDeg: 14,
        elevDeg: 28,
        scanPct: 60,
        atomMode: true,
        showDiagram: true,
        ammo: 400,
        firing: false,
        fireTimer: 0,
        leftRecoil: 0,
        rightRecoil: 0,
        scanPhase: 0
      });
      sync();
    }

    const camPresets = {
      iso: { pos: [5.8, 4.2, 6.2], look: [0, 1.5, 0.4] },
      front: { pos: [0.4, 2.4, 7.8], look: [0, 1.5, 0.2] },
      breech: { pos: [-4.5, 2.8, -6.4], look: [0, 1.5, -0.3] },
      engine: { pos: [3.4, 2.6, 3.6], look: [0.3, 1.4, 1.1] },
      suspension: { pos: [4.6, 1.1, 0.2], look: [0, 0.6, 0] },
      top: { pos: [0.1, 8.8, 0.2], look: [0, 1.4, 0.2] }
    };

    const tourSteps = [
      [
        ['Amfibi FNSS ACV-30 & İnsansız Kule', 'Amphibious ACV-30 & unmanned turret'],
        ['KORKUT, su jetli amfibi paletli gövde üzerinde stabilize insansız kule ile mekanize birliklere eşlik eder.', 'KORKUT pairs an unmanned stabilized turret with a waterjet-propelled amphibious tracked chassis.'],
        'iso', 'hull', false
      ],
      [
        ['İkiz 35 mm Top ve Şeritsiz Besleme', 'Twin 35 mm cannons & linkless feed'],
        ['X-Ray modunda kule içindeki Çift Mühimmat Besleme tamburlarını inceleyin; sistem tek tuşla ATOM ve HEI-T arasında geçiş yapar.', 'Toggle X-Ray to see the linkless dual-drum magazine inside the turret switching instantly between ATOM and HEI-T.'],
        'engine', 'dualFeedMag', true
      ],
      [
        ['Namlu Ağzı ATOM Programlama Bobini', 'Muzzle inductive ATOM programmer'],
        ['Her mermi namludan çıkarken ilk hızı ölçülür ve dip tapasına patlama süresi elektromanyetik bobinle yüklenir.', 'Each round’s muzzle velocity is measured and its base-fuze airburst time is inductively programmed at the muzzle.'],
        'front', 'muzzleCoils', false
      ],
      [
        ['3B Takip Radarı ve Elektro-Optik Küre', '3D tracking radar & EOTS pod'],
        ['Kule arkasındaki takip radarı ile üstteki termal/lazer hedefleme küresi hedefi otonom izler.', 'The rear tracking radar and upper EOTS turret autonomously track fast-moving aerial targets.'],
        'breech', 'trackingRadar', false
      ],
      [
        ['Tungsten Parçacık Bulutu (ABM)', 'Tungsten airburst pellet cloud'],
        ['ATOM mühimmatı İHA veya füze önünde paralanarak yoğun tungsten parçacık konisi oluşturur.', 'ATOM shells detonate ahead of UAVs or cruise missiles, projecting a dense cone of tungsten pellets.'],
        'iso', 'tungstenCone', false
      ],
      [
        ['1.100 Atım/Dk Zıt Fazlı Salvo', '1,100 rpm alternating salvo'],
        ['Ateşle düğmesine basarak iki 35 mm namlunun zıt fazda geri tepmesini ve ATOM parçacık parlamasını izleyin.', 'Press Fire to trigger alternating twin-barrel recoil and inspect the airburst flash ahead of the target.'],
        'iso', 'leftGun', false
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
      cameraPadding: 0.84,
      title: t('ASELSAN KORKUT — 2× 35 MM & ATOM (2016)', 'ASELSAN KORKUT — TWIN 35 MM & ATOM (2016)'),
      sub: t('FNSS ACV-30 • 1.100 atım/dk • Programlı parçacıklı mühimmat', 'FNSS ACV-30 • 1,100 rpm • Programmable airburst munition'),
      subsystems: Object.entries(counts).map(([key, count]) => ({ key, label: key, count, color: '#0ea5e9' })),
      camLabels: Object.fromEntries(Object.entries({
        iso: ['Genel Sergi', 'Full exhibit'],
        front: ['Ön Cephe & Bobinler', 'Front & muzzle coils'],
        breech: ['Radar & Su Jetleri', 'Radar & waterjets'],
        engine: ['Besleme Kesiti', 'Dual-feed cutaway'],
        suspension: ['Palet & Süspansiyon', 'Tracks & suspension'],
        top: ['Üst Görünüş', 'Top view']
      }).map(([k, v]) => [k, t(...v)])),
      sliders: [
        [['Kule Yön Açısı', 'Turret azimuth'], -180, 180, '°'],
        [['Namlu Yükseliş Açısı', 'Gun elevation'], -10, 85, '°'],
        [['Sensör & Takip Taraması', 'Sensor scan rate'], 0, 100, '%']
      ].map(([labels, min, max, unit]) => ({
        label: t(...labels),
        min,
        max,
        step: 1,
        fmt: v => Math.round(v) + unit
      })),
      buttons: {
        terrain: t('ATOM Hava Patlaması Şeması', 'Show ATOM airburst diagram'),
        sweep: t('Sistemi Sıfırla', 'Reset system'),
        mode: true
      },
      telemetryTag: t('KORKUT • 35 MM ATOM ABM', 'KORKUT • 35 MM ATOM ABM'),
      statLabels: [
        ['KULE / YÜKSELİŞ', 'YAW / ELEV'],
        ['MÜHİMMAT TİPİ', 'MUNITION'],
        ['TARAMA HIZI', 'SCAN RATE'],
        ['HAZIR MERMİ', 'AMMO']
      ].map(v => t(...v))
    });

    sync();

    return {
      root,
      parts,
      ui,
      camPresets,
      tourSteps,
      defaultPart: parts.muzzleCoils,
      firePart: parts.leftGun,
      update(dt) {
        if (state.scanPct > 0) {
          state.scanPhase += dt * (0.4 + (state.scanPct / 100) * 2.4);
        }
        if (state.firing) {
          state.fireTimer += dt * 7.5;
          state.leftRecoil = Math.max(0, Math.sin(state.fireTimer * Math.PI));
          state.rightRecoil = Math.max(0, Math.sin((state.fireTimer + 0.5) * Math.PI));
          if (state.fireTimer >= 1.5) {
            state.firing = false;
            state.fireTimer = 0;
            state.leftRecoil = 0;
            state.rightRecoil = 0;
          }
        }
        sync();
      },
      onFire() {
        if (state.ammo <= 0) {
          state.ammo = 400;
          sync();
          return { ok: true, resupplied: true };
        }
        state.ammo = Math.max(0, state.ammo - 20);
        state.firing = true;
        state.fireTimer = 0.25;
        state.leftRecoil = 0.7;
        state.rightRecoil = 0.15;
        sync();
        return { ok: true };
      },
      fireButtonLabel: () => t(state.ammo > 0 ? '35 MM SALVO ATEŞLE' : 'MÜHİMMAT İKMALİ', state.ammo > 0 ? 'FIRE 35 MM BURST' : 'RESUPPLY AMMO'),
      mobileFireButtonLabel: () => t(state.ammo > 0 ? 'ATEŞLE' : 'İKMAL', state.ammo > 0 ? 'FIRE' : 'RELOAD'),
      modeLabel: () => t(state.atomMode ? 'Mühimmat: 35 mm ATOM (Parçacıklı)' : 'Mühimmat: 35 mm HEI-T', state.atomMode ? 'Munition: 35 mm ATOM (ABM)' : 'Munition: 35 mm HEI-T'),
      onSlider(i, v) {
        if (!Number.isFinite(v)) return {};
        const clamped = T.MathUtils.clamp(v, ui.sliders[i].min, ui.sliders[i].max);
        if (i === 0) state.yawDeg = clamped;
        else if (i === 1) state.elevDeg = clamped;
        else if (i === 2) state.scanPct = clamped;
        sync();
        return {};
      },
      onButton(name) {
        if (name === 'terrain') {
          state.showDiagram = !state.showDiagram;
          sync();
        } else if (name === 'sweep') {
          reset();
        } else if (name === 'mode') {
          state.atomMode = !state.atomMode;
          sync();
        }
        return {};
      },
      buttonActive: name => (name === 'terrain' && state.showDiagram) || (name === 'mode' && state.atomMode),
      getSliderValues: () => [state.yawDeg, state.elevDeg, state.scanPct],
      getStats: () => [
        `${Math.round(state.yawDeg)}° / ${Math.round(state.elevDeg)}°`,
        state.atomMode ? 'ATOM ABM' : 'HEI-T',
        Math.round(state.scanPct) + ' <span>%</span>',
        String(state.ammo)
      ],
      getStatus: () => ({
        text: state.firing
          ? t('1.100 ATIM/DK ZIT FAZLI SALVO', '1,100 RPM ALTERNATING BURST')
          : state.atomMode
            ? t('NAMLU BOBİNİ AKTİF • ATOM PROGRAMLAMAYA HAZIR', 'MUZZLE COIL ARMED • ATOM ABM READY')
            : t('35 MM HEI-T KONVANSİYONEL BESLEME', '35 MM HEI-T CONVENTIONAL FEED'),
        color: state.firing ? '#dc2626' : state.atomMode ? '#0284c7' : '#d97706'
      }),
      applyTextures: K.applyTextures,
      setTexture: K.setTexture,
      toggleRelief: K.toggleRelief
    };
  };
})();
