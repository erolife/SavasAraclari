/* Flakpanzer Gepard — Çift Radarlı Otonom 2× 35 mm Oerlikon KDA Uçaksavar Tankı (1976)
 * Deutsches Panzermuseum Munster & Bundeswehr referanslı 1:1 ölçekli müze sergisi; iç kesitler eğitim yorumudur. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.gepard = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'gepard');
    const { T, root, parts, mats, mesh, box, cyl, ring, pipe, beam, instances } = K;
    const english = window.MuseumPreferences?.language === 'en';
    const t = (tr, en) => (english ? en : tr);

    const state = {
      yawDeg: 18,
      elevDeg: 32,
      scanPct: 70,
      folded: false,
      fapdsMode: false,
      ammoHEI: 640,
      ammoAP: 40,
      firing: false,
      fireTimer: 0,
      leftRecoil: 0,
      rightRecoil: 0,
      searchAngle: 0,
      apuAngle: 0,
      fanAngle: 0
    };

    const counts = {};
    let partIndex = 0;

    function mat(color, metalness = 0.45, roughness = 0.52, paint = false) {
      const m = new T.MeshStandardMaterial({ color, metalness, roughness, bumpScale: 0.002 });
      m.userData.paint = paint;
      return m;
    }

    const oliveMat = mat(0x525a44, 0.28, 0.72, true);
    const turretMat = mat(0x474f3b, 0.32, 0.68, true);
    const steelMat = mats.steel.clone();
    const darkMat = mats.dark.clone();
    const rubberMat = mats.rubber.clone();
    const brassMat = mats.brass.clone();
    const copperMat = mat(0xb86f3e, 0.78, 0.34, false);
    const radomeMat = mat(0xcfc8b4, 0.16, 0.52, false);
    const glassMat = new T.MeshStandardMaterial({
      color: 0x38bdf8, transparent: true, opacity: 0.45, roughness: 0.15, metalness: 0.2
    });
    const beamMat = new T.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.18, depthWrite: false, side: T.DoubleSide });
    const trackBeamMat = new T.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.22, depthWrite: false });
    const flashMat = new T.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.9 });

    function part(id, tr, en, subTr, subEn, descTr, descEn, basePos = [0, 0, 0], exp = [0, 0.5, 0], outer = false, parent = root) {
      const sub = t(subTr, subEn);
      counts[sub] = (counts[sub] || 0) + 1;
      const p = K.part(id, ++partIndex + '. ' + t(tr, en), sub, basePos, exp, t(descTr, descEn), outer, parent);
      Object.assign(p.userData, {
        material: t('Kaynaklı Leopard 1 çeliği, 35 mm L/90 dövme çelik namlular ve Albis/MPDR radomlar', 'Welded Leopard 1 steel, 35 mm L/90 forged barrels & Albis/MPDR radomes'),
        weight: t('~47,5 ton muharebe ağırlığı (1:1 ölçek)', '~47.5 t combat weight (1:1 scale)'),
        spec: t('2× 35 mm Oerlikon KDA • 1.100 atım/dk • MPDR-12 S-band + Ku-band takip radarı', '2× 35 mm Oerlikon KDA • 1,100 rpm • MPDR-12 S-band + Ku-band tracking radar')
      });
      return p;
    }

    // -------------------------------------------------------------------------
    // A. LEOPARD 1 GÖVDE & GÜÇ PAKETİ (5 Grup)
    // -------------------------------------------------------------------------
    const hull = part('hull',
      'Leopard 1 Zırhlı Gövde Kabuğu', 'Leopard 1 armored chassis shell',
      'Gövde ve Güç Paketi', 'Chassis & Powerpack',
      'Eğimli ön glasis levhasına ve yan etek bağlantılarına sahip modifiye Leopard 1 şasisi.',
      'Modified Leopard 1 hull featuring sloped front glacis armor and side skirt mounts.',
      [0, 0, 0], [0, 0.7, 0], true
    );
    const hullShape = new T.Shape();
    hullShape.moveTo(-3.35, 0.52);
    hullShape.lineTo(2.75, 0.52);
    hullShape.lineTo(3.45, 1.02);
    hullShape.lineTo(2.65, 1.44);
    hullShape.lineTo(-3.25, 1.44);
    hullShape.closePath();
    const hullGeo = new T.ExtrudeGeometry(hullShape, { depth: 2.36, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1 });
    mesh(hull, hullGeo, oliveMat, [-1.18, 0, 0], [0, Math.PI / 2, 0]);
    // Ön çamurluklar ve farlar
    for (const s of [-1, 1]) {
      box(hull, [0.46, 0.14, 0.24], [s * 1.32, 1.24, 3.22], oliveMat);
      cyl(hull, 0.08, 0.09, [s * 1.24, 1.32, 3.30], glassMat, 'z');
    }

    const mainEngine = part('mainEngine',
      '830 BG MTU MB 838 V10 Ana Dizel & Fanlar', '830 hp MTU MB 838 V10 diesel & fans',
      'Gövde ve Güç Paketi', 'Chassis & Powerpack',
      'Arka bölmede yerleşik 830 beygirlik 10 silindirli dizel motor ve çift üst soğutma fanı.',
      '830 hp twin-supercharged V10 diesel engine and dual top cooling fans in the rear bay.',
      [0, 0.96, -2.05], [0, 0.8, -1.2]
    );
    box(mainEngine, [1.28, 0.64, 1.56], [0, 0, 0], darkMat);
    for (const xOff of [-0.36, 0.36]) {
      for (let k = 0; k < 5; k++) {
        cyl(mainEngine, 0.11, 0.26, [xOff, 0.28, -0.56 + k * 0.28], steelMat, 'y');
      }
    }
    const fanGroup = new T.Group();
    fanGroup.name = 'engine-fan';
    fanGroup.position.set(0, 0.49, 0);
    mainEngine.add(fanGroup);
    for (const fz of [-0.38, 0.38]) {
      ring(mainEngine, 0.34, [0, 0.49, fz], darkMat, 0.03, [Math.PI / 2, 0, 0]);
    }
    const fanRotor = new T.Group();
    fanRotor.name = 'engine-fan-rotor';
    fanGroup.add(fanRotor);
    for (let i = 0; i < 6; i++) {
      box(fanRotor, [0.56, 0.02, 0.08], [0, 0, -0.38], brassMat, [0, (i * Math.PI) / 3, 0]);
      box(fanRotor, [0.56, 0.02, 0.08], [0, 0, 0.38], brassMat, [0, (i * Math.PI) / 3, 0]);
    }

    const auxPowerUnit = part('auxPowerUnit',
      '90 BG Yardımcı Güç Ünitesi (APU)', '90 hp Daimler-Benz APU generator',
      'Gövde ve Güç Paketi', 'Chassis & Powerpack',
      'Ana motor kapalıyken radarlara ve kule elektrik motorlarına güç sağlayan ön-sol yardımcı dizel jeneratör.',
      'Front-left 90 hp auxiliary power unit supplying continuous electrical power to radars and drives.',
      [-0.64, 0.98, 2.05], [-0.8, 0.7, 0.9]
    );
    box(auxPowerUnit, [0.76, 0.56, 1.12], [0, 0, 0], copperMat);
    cyl(auxPowerUnit, 0.24, 0.44, [0, 0.02, -0.45], steelMat, 'z');
    const apuFan = new T.Group();
    apuFan.name = 'apu-fan';
    apuFan.position.set(0, 0.02, 0.62);
    auxPowerUnit.add(apuFan);
    cyl(apuFan, 0.07, 0.12, [0, 0, 0], darkMat, 'z');
    for (let i = 0; i < 4; i++) {
      box(apuFan, [0.42, 0.06, 0.02], [0, 0, 0], brassMat, [0, 0, (i * Math.PI) / 2]);
    }

    const suspension = part('suspension',
      '7× Çift Yol Tekerleği ve Süspansiyon', '7× Dual roadwheels & torsion bars',
      'Gövde ve Güç Paketi', 'Chassis & Powerpack',
      'Her iki yanda 7 çift kauçuk bandajlı yol tekerleği, ön avara çarkı ve arka tahrik cer dişlisi.',
      'Seven dual rubber-rimmed roadwheels per side with front idlers and rear drive sprockets.',
      [0, 0, 0], [0, -0.3, 0]
    );
    const WZ = [-2.36, -1.58, -0.80, -0.02, 0.76, 1.54, 2.32];
    const roadR = 0.34;
    const wheelY = 0.40; // alt kenar y = 0.06, alt palet y = 0.00..0.06
    for (const s of [-1, 1]) {
      for (const wz of WZ) {
        cyl(suspension, roadR, 0.28, [s * 1.38, wheelY, wz], rubberMat, 'x');
        cyl(suspension, 0.20, 0.30, [s * 1.38, wheelY, wz], oliveMat, 'x');
      }
      // Ön avara ve arka cer dişlisi
      cyl(suspension, 0.32, 0.26, [s * 1.38, 0.82, 3.04], steelMat, 'x');
      cyl(suspension, 0.35, 0.28, [s * 1.38, 0.82, -3.02], darkMat, 'x');
    }

    const tracks = part('tracks',
      'Çift Çelik-Kauçuk Palet ve Yan Etekler', 'Double-pin tracks & side skirts',
      'Gövde ve Güç Paketi', 'Chassis & Powerpack',
      'Zemine y = 0,000 m kotunda tam oturan kapalı palet bakla döngüsü ve koruyucu zırh etekleri.',
      'Closed steel-rubber track loop resting flush on ground y = 0.000 m with side armor skirts.',
      [0, 0, 0], [0, -0.1, 0], true
    );
    const padGeo = new T.BoxGeometry(0.46, 0.06, 0.18);
    const padTransforms = [];
    for (const s of [-1, 1]) {
      const px = s * 1.38;
      for (let z = -2.42; z <= 2.38; z += 0.20) padTransforms.push({ pos: [px, 0.03, z], rot: [0, 0, 0] }); // alt kol y=0.000
      for (let z = -2.92; z <= 2.94; z += 0.20) padTransforms.push({ pos: [px, 1.14, z], rot: [0, 0, 0] }); // üst kol
      for (let k = 1; k <= 4; k++) {
        const frac = k / 5;
        padTransforms.push({ pos: [px, 0.06 + frac * 0.78, 2.42 + frac * 0.64], rot: [-0.88, 0, 0] });
        padTransforms.push({ pos: [px, 0.06 + frac * 0.78, -2.42 - frac * 0.64], rot: [0.88, 0, 0] });
      }
      // Yan zırh eteği (outer=true olduğu için X-Ray'de tekerlekler açılır)
      box(tracks, [0.06, 0.42, 6.10], [s * 1.66, 0.96, 0], oliveMat);
    }
    instances(tracks, padGeo, darkMat, padTransforms);

    // -------------------------------------------------------------------------
    // B. KULE VE 2× 35 MM OERLİKON KDA (6 Grup)
    // -------------------------------------------------------------------------
    const turretYaw = new T.Group();
    turretYaw.name = 'turret-yaw';
    turretYaw.position.set(0, 1.46, -0.12);
    root.add(turretYaw);

    const turretRing = part('turretRing',
      '360° Kule Dişli Halkası ve Kayar Bilezik', '360° turret ring & slip ring',
      'Atış Kontrol ve Kule Halkası', 'Fire Control & Turret Ring',
      'Zırhlı kuleyi hızlı hedef takibi için saniyede 90° döndüren elektrikli tahrik halkası.',
      'Electric drive turret ring enabling rapid 90°/s target slewing and slip-ring power transfer.',
      [0, 1.46, -0.12], [0, 0.9, 0], false, root
    );
    ring(turretRing, 1.06, [0, 0, 0], steelMat, 0.05, [Math.PI / 2, 0, 0]);

    const turret = part('turret',
      'Kaynaklı Zırhlı Kule Kabuğu', 'Welded armored turret shell',
      'Kule ve 35 mm KDA Toplar', 'Turret & 35 mm KDA',
      'İki mürettebatı, mühimmat haznelerini ve atış kontrol bilgisayarını koruyan kule zırhı; X-Ray ile içi görülür.',
      'Welded armor turret housing crew, computers and 680 rounds; turn on X-Ray to inspect interior.',
      [0, 0, 0], [0, 1.3, 0], true, turretYaw
    );
    box(turret, [2.10, 0.92, 2.38], [0, 0.50, -0.05], turretMat);
    box(turret, [1.72, 0.72, 0.65], [0, 0.48, 1.24], turretMat, [0.36, 0, 0]); // eğimli ön alın
    box(turret, [1.96, 0.66, 0.72], [0, 0.56, -1.42], turretMat); // arka radar sepeti
    // Sis havanları
    for (const s of [-1, 1]) {
      for (let k = 0; k < 4; k++) {
        mesh(turret, new T.CylinderGeometry(0.04, 0.04, 0.22, 10), darkMat, [s * 1.09, 0.52, 0.35 + k * 0.12], [0.45, 0, s * -0.5]);
      }
    }

    const crewStation = part('crewStation',
      'Nişancı / Komutan İstasyonu ve Bilgisayar', 'Crew stations & analog/digital computer',
      'Atış Kontrol ve Kule Halkası', 'Fire Control & Turret Ring',
      'Radar verilerini önleme açısına dönüştüren atış kontrol bilgisayarı ve ikiz mürettebat koltukları.',
      'Ballistic fire-control computer calculating lead angles from radar vectors plus crew stations.',
      [0, 0, 0], [0, 0.6, 0], false, turretYaw
    );
    box(crewStation, [0.70, 0.44, 0.52], [0, 0.34, -0.68], copperMat);
    for (const s of [-1, 1]) {
      box(crewStation, [0.40, 0.52, 0.40], [s * 0.56, 0.26, 0.15], darkMat);
    }

    const ammoBins = part('ammoBins',
      '640 HEI-T + 40 FAPDS Mühimmat Haznesi', '640 HEI-T + 40 FAPDS ammunition bins',
      'Atış Kontrol ve Kule Halkası', 'Fire Control & Turret Ring',
      'Kule yan ceplerinde 640 adet uçaksavar (HEI-T) ve 40 adet zırh delici (FAPDS) 35 mm mühimmatı taşır.',
      'Turret magazines storing 640 HEI-T anti-air rounds and 40 FAPDS anti-armor rounds.',
      [0, 0, 0], [0, 0.8, 0], false, turretYaw
    );
    for (const s of [-1, 1]) {
      box(ammoBins, [0.34, 0.48, 0.96], [s * 0.82, 0.28, -0.22], brassMat);
    }

    // Dıştan takılı ikiz 35 mm Oerlikon KDA yuvası (yükseliş grubu)
    const gunElev = new T.Group();
    gunElev.name = 'gun-elev';
    gunElev.position.set(0, 0.52, 0.36);
    turretYaw.add(gunElev);

    function buildCannon(key, sideSign, labelTr, labelEn) {
      const grp = part(key, labelTr, labelEn, 'Kule ve 35 mm KDA Toplar', 'Turret & 35 mm KDA',
        'Kule yanlarına dıştan takılı, 550 atım/dk gaz pistonlu 35 mm L/90 Oerlikon KDA topu ve namlu ağzı hız ölçeri.',
        'Externally podded 35 mm L/90 Oerlikon KDA autocannon (550 rpm per gun) with muzzle velocity sensor.',
        [sideSign * 1.24, 0, 0], [sideSign * 0.9, 0.3, 0.6], false, gunElev
      );
      // Sabit pod gövdesi + kama kundağı (grp zaten x = sideSign*1.24 noktasında, kule yanına yapışık!)
      box(grp, [0.36, 0.44, 1.38], [0, 0, 0.15], turretMat);
      box(grp, [0.22, 0.26, 0.46], [-sideSign * 0.16, 0, 0.05], steelMat); // muylu gövde bağlantısı
      const slide = new T.Group();
      slide.name = sideSign < 0 ? 'left-recoil' : 'right-recoil';
      slide.position.set(0, 0, 0);
      grp.add(slide);
      // 35 mm L/90 yivli uzun namlu (3,15 m)
      cyl(slide, 0.068, 1.15, [0, 0, 1.18], darkMat, 'z');
      cyl(slide, 0.048, 1.98, [0, 0, 2.72], steelMat, 'z');
      // Namlu ağzı v0 Doppler hız ölçer halkası
      box(slide, [0.15, 0.15, 0.26], [0, 0, 3.62], brassMat);
      cyl(slide, 0.042, 0.12, [0, 0, 3.80], darkMat, 'z');
      return slide;
    }
    const leftSlide = buildCannon('leftGun', -1, 'Sol 35 mm Oerlikon KDA Topu', 'Left 35 mm Oerlikon KDA pod');
    const rightSlide = buildCannon('rightGun', 1, 'Sağ 35 mm Oerlikon KDA Topu', 'Right 35 mm Oerlikon KDA pod');

    const dualFeed = part('dualFeed',
      'Çift Şeritli Mühimmat Besleme Yolu', 'Dual-belt ammunition feed chutes',
      'Kule ve 35 mm KDA Toplar', 'Turret & 35 mm KDA',
      'Tek şalterle ana HEI-T veya ikincil FAPDS şeridini seçen esnek besleme kanalları.',
      'Flexible dual feed chutes allowing instantaneous selection between HEI-T and FAPDS belts.',
      [0, 0, 0], [0, 0.6, 0.4], false, gunElev
    );
    const shellGeo = new T.CylinderGeometry(0.022, 0.022, 0.22, 8);
    const shellTransforms = [];
    for (const s of [-1, 1]) {
      box(dualFeed, [0.44, 0.16, 0.34], [s * 0.98, -0.06, 0], steelMat);
      for (let k = 0; k < 7; k++) {
        shellTransforms.push({ pos: [s * (0.76 + k * 0.075), -0.04, 0.04], rot: [Math.PI / 2, 0, 0] });
      }
    }
    instances(dualFeed, shellGeo, brassMat, shellTransforms);

    const muzzleFx = part('muzzleFx',
      'Ağız Çıkış Hız Ölçeri ve Salvo İzi', 'Muzzle velocity ring & burst trace',
      'Kule ve 35 mm KDA Toplar', 'Turret & 35 mm KDA',
      'Zıt fazlı ateşlemede namlu ağzı parlamasını ve programlı uçuş izini gösterir.',
      'Displays alternating muzzle flashes and ballistic tracer axes during 35 mm burst firing.',
      [0, 0, 0], [0, 0.3, 1.2], false, gunElev
    );
    const flashLeft = new T.Mesh(new T.ConeGeometry(0.18, 0.85, 12), flashMat);
    flashLeft.rotation.x = Math.PI / 2;
    flashLeft.position.set(-1.24, 0, 4.25);
    flashLeft.visible = false;
    muzzleFx.add(flashLeft);
    const flashRight = new T.Mesh(new T.ConeGeometry(0.18, 0.85, 12), flashMat);
    flashRight.rotation.x = Math.PI / 2;
    flashRight.position.set(1.24, 0, 4.25);
    flashRight.visible = false;
    muzzleFx.add(flashRight);
    // Temsili sabit ölçüm sensörü direği (muzzleFx boş kalmaz)
    for (const s of [-1, 1]) box(muzzleFx, [0.06, 0.08, 0.22], [s * 1.24, 0.10, 3.60], copperMat);

    // -------------------------------------------------------------------------
    // C. ÇİFT RADAR SİSTEMİ & OPTİK (6 Grup)
    // -------------------------------------------------------------------------
    const searchMast = part('searchMast',
      'Katlanır Arka Radar Direği', 'Folding rear search radar mast',
      'Çift Radar Sistemi', 'Dual Radar Suite',
      'Taşıma ve gizlenme için hidrolik olarak kule arkasına 90° katlanan döner direk.',
      'Hydraulically folding rear mast lowering the search antenna 90° behind the turret for travel.',
      [0, 0.90, -1.26], [0, 1.1, -0.9], false, turretYaw
    );
    const mastPivot = new T.Group();
    mastPivot.name = 'search-mast-pivot';
    mastPivot.position.set(0, 0.90, -1.26);
    turretYaw.add(mastPivot);
    // Sabit arka menteşe yatağı (searchMast parçası içinde [0,0,0] yerel merkezinde)
    box(searchMast, [0.42, 0.24, 0.36], [0, 0.02, 0], darkMat);
    cyl(mastPivot, 0.11, 0.62, [0, 0.31, 0], turretMat, 'y');

    const searchRadar = part('searchRadar',
      'MPDR-12 S-Band 360° Arama Radarı', 'MPDR-12 S-band 360° search radar',
      'Çift Radar Sistemi', 'Dual Radar Suite',
      'Dakikada 60 devirle 15 km menzilde alçak irtifa hedeflerini sürekli tarayan S-band eliptik anten.',
      'S-band elliptical search antenna rotating at 60 rpm to detect targets out to 15 km.',
      [0, 0.64, 0], [0, 1.4, -0.6], false, mastPivot
    );
    const searchDish = new T.Group();
    searchDish.name = 'search-dish';
    searchDish.position.set(0, 0.64, 0);
    mastPivot.add(searchDish);
    cyl(searchDish, 0.13, 0.16, [0, 0.08, 0], darkMat, 'y');
    box(searchDish, [1.56, 0.44, 0.14], [0, 0.36, 0], radomeMat);
    box(searchDish, [0.36, 0.12, 0.26], [0, 0.36, 0.18], steelMat); // besleme boynuzu
    cyl(searchRadar, 0.12, 0.08, [0, 0.02, 0], brassMat, 'y');

    const trackMount = part('trackMount',
      'Ön Takip Radarı Çatalı', 'Front tracking radar yoke',
      'Çift Radar Sistemi', 'Dual Radar Suite',
      'Kule alnında +/-180° dönebilen monopulse takip radarı taşıyıcı boyunduruğu.',
      'Front turret yoke elevating the Ku-band tracking radar along target line of sight.',
      [0, 0.64, 1.12], [0, 0.8, 1.0], false, turretYaw
    );
    box(trackMount, [0.24, 0.34, 0.24], [0, 0, 0], darkMat);
    box(trackMount, [0.74, 0.12, 0.20], [0, 0.20, 0], steelMat);

    const trackRadar = part('trackRadar',
      'Albis Ku-Band Monopulse Takip Radarı', 'Albis Ku-band tracking radar',
      'Çift Radar Sistemi', 'Dual Radar Suite',
      'Arama radarından aldığı hedefi kilitleyip atış bilgisayarına saniyelik hız/mesafe akışı veren dar hüzme anteni.',
      'High-frequency Ku-band monopulse dish locking onto a single target to supply precision range.',
      [0, 0.98, 1.12], [0, 1.0, 1.3], false, turretYaw
    );
    const trackDish = new T.Group();
    trackDish.name = 'track-dish';
    trackDish.position.set(0, 0.98, 1.12);
    turretYaw.add(trackDish);
    cyl(trackDish, 0.42, 0.12, [0, 0, 0.04], radomeMat, 'z');
    cyl(trackDish, 0.09, 0.28, [0, 0, 0.20], darkMat, 'z');
    box(trackRadar, [0.16, 0.16, 0.18], [0, 0, -0.06], darkMat);

    const radarBeams = part('radarBeams',
      'S-Band & Ku-Band Elektronik Hüzmeler', 'S-band & Ku-band radar beams',
      'Çift Radar Sistemi', 'Dual Radar Suite',
      '360° tarayan S-band arama yelpazesi ve hedefe kilitlenen Ku-band dar takip konisi.',
      'Visualizes the 360° S-band search fan and the narrow Ku-band tracking beam.',
      [0, 0, 0], [0, 1.4, 0.4], false, turretYaw
    );
    ring(radarBeams, 0.24, [0, 0.92, -1.26], copperMat, 0.02, [Math.PI / 2, 0, 0]);
    const searchFanMesh = new T.Mesh(new T.ConeGeometry(1.15, 2.8, 18, 1, true), beamMat);
    searchFanMesh.rotation.z = Math.PI / 2;
    searchFanMesh.position.set(1.4, 0.36, 0);
    searchDish.add(searchFanMesh);
    const trackConeMesh = new T.Mesh(new T.ConeGeometry(0.45, 3.6, 16, 1, true), trackBeamMat);
    trackConeMesh.rotation.x = -Math.PI / 2;
    trackConeMesh.position.set(0, 0, 2.05);
    trackDish.add(trackConeMesh);

    const laserOptics = part('laserOptics',
      'Komutan / Nişancı Periskopu ve Lazer (1A2)', 'Periscope sights & 1A2 laser rangefinder',
      'Atış Kontrol ve Kule Halkası', 'Fire Control & Turret Ring',
      'Kule tavanında yer alan stabilize optik periskoplar ve 1A2 modernizasyonuyla eklenen lazer mesafe ölçer.',
      'Stabilized optical periscopes and the 1A2 laser rangefinder mounted atop the turret roof.',
      [0, 1.00, 0.34], [0, 1.3, 0.2], false, turretYaw
    );
    for (const s of [-1, 1]) {
      cyl(laserOptics, 0.12, 0.22, [s * 0.56, 0.04, 0], turretMat, 'y');
      box(laserOptics, [0.16, 0.12, 0.10], [s * 0.56, 0.12, 0.10], glassMat);
    }

    // -------------------------------------------------------------------------
    // D. SİNKRONİZASYON & ANİMASYON
    // -------------------------------------------------------------------------
    function sync() {
      turretYaw.rotation.y = (state.yawDeg * Math.PI) / 180;
      const elevRad = (-state.elevDeg * Math.PI) / 180;
      gunElev.rotation.x = elevRad;
      trackDish.rotation.x = elevRad;

      mastPivot.rotation.x = state.folded ? -Math.PI / 2 : 0;
      searchDish.rotation.y = state.searchAngle;
      apuFan.rotation.z = state.apuAngle;
      fanRotor.rotation.y = state.fanAngle;

      const beamsVisible = state.scanPct > 0;
      searchFanMesh.visible = beamsVisible && !state.folded;
      trackConeMesh.visible = beamsVisible;

      leftSlide.position.z = state.leftRecoil > 0 ? -0.24 * state.leftRecoil : 0;
      rightSlide.position.z = state.rightRecoil > 0 ? -0.24 * state.rightRecoil : 0;
      flashLeft.visible = state.firing && state.leftRecoil > 0.35;
      flashRight.visible = state.firing && state.rightRecoil > 0.35;
    }

    function reset() {
      Object.assign(state, {
        yawDeg: 18,
        elevDeg: 32,
        scanPct: 70,
        folded: false,
        fapdsMode: false,
        ammoHEI: 640,
        ammoAP: 40,
        firing: false,
        fireTimer: 0,
        leftRecoil: 0,
        rightRecoil: 0
      });
      sync();
    }

    const camPresets = {
      iso: { pos: [7.4, 4.6, 8.0], look: [0, 1.85, 0] },
      front: { pos: [0.4, 2.6, 8.6], look: [0, 1.9, 0.4] },
      breech: { pos: [-5.0, 3.5, -6.8], look: [0, 2.0, -0.4] },
      engine: { pos: [4.2, 3.0, 3.8], look: [0.2, 1.4, 0.2] },
      suspension: { pos: [5.6, 1.1, 0], look: [0, 0.65, 0] },
      top: { pos: [0.1, 10.2, 0.2], look: [0, 1.8, 0] }
    };

    const tourSteps = [
      [['Leopard 1 Gövde ve 90 BG APU Jeneratörü', 'Leopard 1 chassis & 90 hp APU generator'], ['Gepard, Leopard 1 şasisi üzerine kuruludur; öndeki 90 BG yardımcı motor ana motor kapalıyken radarları besler.', 'Gepard rides a Leopard 1 hull whose front 90 hp auxiliary engine powers radars silently.'], 'iso', 'hull', false],
      [['Katlanır MPDR-12 S-Band Arama Radarı', 'Folding MPDR-12 S-band search radar'], ['Arka direk 60 dev/dk hızla 15 km’lik hava sahasını tarar; düğmeyle kule arkasına 90° katlayabilirsiniz.', 'The rear mast sweeps 360° out to 15 km; use the button to fold it 90° behind the turret.'], 'breech', 'searchRadar', false],
      [['Albis Ku-Band Monopulse Takip Radarı', 'Albis Ku-band tracking radar'], ['Ön alındaki takip radarı namlularla senkron yükselerek hedef mesafe ve hızını sürekli ölçer.', 'Mounted on the front turret face, the Ku-band dish tracks the selected aerial target continuously.'], 'front', 'trackRadar', false],
      [['Dıştan Takılı 2× 35 mm Oerlikon KDA', 'Externally podded 2× 35 mm KDA cannons'], ['Zırh dışındaki toplar dakikada toplam 1.100 atım yapar; X-Ray ile çift şerit besleme oluklarını görün.', 'External gun pods fire 1,100 rpm combined; inspect dual feed chutes inside the X-Ray turret.'], 'engine', 'dualFeed', true],
      [['HEI-T (640) ⇄ FAPDS (40) Çift Mühimmat', 'HEI-T (640) vs. FAPDS (40) dual feed'], ['Mod düğmesi uçaksavar mermisi ile zırh delici FAPDS şeritleri arasında anında geçiş yapar.', 'Toggle the munition mode to switch instantly between anti-air HEI-T and armor-piercing FAPDS.'], 'engine', 'ammoBins', true],
      [['Zıt Fazlı Salvo ve Namlu Ağız Hız Ölçeri', 'Alternating salvo & muzzle velocity ring'], ['Ateşle düğmesiyle iki namlunun 180° zıt fazda geri tepmesini ve v0 ölçer halkalarını izleyin.', 'Press Fire to trigger alternating twin recoil and inspect the v0 Doppler muzzle rings.'], 'iso', 'leftGun', false]
    ].map(([title, desc, cam, key, cutaway]) => ({
      title: t(...title), desc: t(...desc), cam, part: parts[key], cutaway, explode: 0, sub: 'all'
    }));

    const ui = K.ui({
      cameraPadding: 0.84,
      title: t('FLAKPANZER GEPARD — ÇİFT RADAR & 2× 35 MM KDA (1976)', 'FLAKPANZER GEPARD — DUAL RADAR & 2× 35 MM KDA (1976)'),
      sub: t('Leopard 1 Şasisi • MPDR-12 S-Band + Ku-Band Takip • 1.100 atım/dk', 'Leopard 1 Chassis • MPDR-12 S-Band + Ku-Band Track • 1,100 rpm'),
      subsystems: Object.entries(counts).map(([key, count]) => ({ key, label: key, count, color: '#474f3b' })),
      camLabels: Object.fromEntries(Object.entries({
        iso: ['Genel Sergi', 'Full exhibit'],
        front: ['Ön Cephe & Takip', 'Front & tracker'],
        breech: ['Arama Radarı', 'Search radar'],
        engine: ['X-Ray Çift Besleme', 'X-Ray dual feed'],
        suspension: ['Palet & Yürüyüş', 'Tracks & wheels'],
        top: ['Üst Görünüş', 'Top view']
      }).map(([k, v]) => [k, t(...v)])),
      sliders: [
        [['Kule Yön Açısı', 'Turret azimuth'], -180, 180, '°'],
        [['35 mm Namlu Yükselişi', '35 mm gun elevation'], -10, 85, '°'],
        [['Radar & APU Tarama Hızı', 'Radar & APU scan rate'], 0, 100, '%']
      ].map(([labels, min, max, unit]) => ({
        label: t(...labels), min, max, step: 1, fmt: v => Math.round(v) + unit
      })),
      buttons: {
        terrain: t('Arama Radarını Katla', 'Fold search radar'),
        sweep: t('Sistemi Sıfırla', 'Reset system'),
        mode: true
      },
      telemetryTag: t('GEPARD 1A2 • S/KU-BAND • 2×35 MM', 'GEPARD 1A2 • S/KU-BAND • 2×35 MM'),
      statLabels: [
        ['KULE / YÜKSELİŞ', 'YAW / ELEV'],
        ['ARAMA RADARI', 'SEARCH RADAR'],
        ['MÜHİMMAT SEÇİMİ', 'MUNITION'],
        ['HAZIR MERMİ', 'AMMO READY']
      ].map(v => t(...v))
    });

    sync();

    return {
      root, parts, ui, camPresets, tourSteps,
      defaultPart: parts.searchRadar, firePart: parts.leftGun,
      update(dt) {
        if (!Number.isFinite(dt)) return;
        dt = T.MathUtils.clamp(dt, 0, 0.05);
        if (state.scanPct > 0) {
          const factor = state.scanPct / 100;
          state.apuAngle = (state.apuAngle + dt * factor * 9.0) % (Math.PI * 2);
          state.fanAngle = (state.fanAngle + dt * factor * 7.5) % (Math.PI * 2);
          if (!state.folded) {
            state.searchAngle = (state.searchAngle + dt * factor * 6.28) % (Math.PI * 2);
          }
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
        if (state.fapdsMode) {
          if (state.ammoAP <= 0) {
            state.ammoAP = 40;
            sync();
            return { ok: true, resupplied: true };
          }
          state.ammoAP = Math.max(0, state.ammoAP - 4);
        } else {
          if (state.ammoHEI <= 0) {
            state.ammoHEI = 640;
            sync();
            return { ok: true, resupplied: true };
          }
          state.ammoHEI = Math.max(0, state.ammoHEI - 20);
        }
        state.firing = true;
        state.fireTimer = 0.25;
        state.leftRecoil = 0.72;
        state.rightRecoil = 0.16;
        sync();
        if (ctx.audio?.playCannonFire) ctx.audio.playCannonFire();
        return { ok: true };
      },
      fireButtonLabel: () => {
        const cur = state.fapdsMode ? state.ammoAP : state.ammoHEI;
        return t(cur > 0 ? '35 MM SALVO ATEŞLE' : 'MÜHİMMAT İKMALİ', cur > 0 ? 'FIRE 35 MM BURST' : 'RESUPPLY AMMO');
      },
      mobileFireButtonLabel: () => {
        const cur = state.fapdsMode ? state.ammoAP : state.ammoHEI;
        return t(cur > 0 ? 'ATEŞLE' : 'İKMAL', cur > 0 ? 'FIRE' : 'RELOAD');
      },
      modeLabel: () => t(
        state.fapdsMode ? 'Mühimmat: FAPDS (40 Zırh Delici)' : 'Mühimmat: HEI-T (640 Uçaksavar)',
        state.fapdsMode ? 'Munition: FAPDS (40 AP)' : 'Munition: HEI-T (640 AA)'
      ),
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
          state.folded = !state.folded;
          sync();
        } else if (name === 'sweep') {
          reset();
        } else if (name === 'mode') {
          state.fapdsMode = !state.fapdsMode;
          sync();
        }
        return {};
      },
      buttonActive: name => (name === 'terrain' && state.folded) || (name === 'mode' && state.fapdsMode),
      getSliderValues: () => [state.yawDeg, state.elevDeg, state.scanPct],
      getStats: () => [
        `${Math.round(state.yawDeg)}° / ${Math.round(state.elevDeg)}°`,
        state.folded ? t('KATLI (0 rpm)', 'FOLDED (0 rpm)') : state.scanPct > 0 ? t('AKTİF 360°', 'ACTIVE 360°') : t('DURDU', 'STOPPED'),
        state.fapdsMode ? 'FAPDS' : 'HEI-T',
        String(state.fapdsMode ? state.ammoAP : state.ammoHEI)
      ],
      getStatus: () => ({
        text: state.firing
          ? t('1.100 ATIM/DK ZIT FAZLI 35 MM SALVO', '1,100 RPM ALTERNATING 35 MM BURST')
          : state.folded
            ? t('ARAMA RADARI KATLANDI • YOL KONUMU', 'SEARCH RADAR FOLDED • TRAVEL LOCK')
            : state.scanPct > 0
              ? t('S-BAND ARAMA & KU-BAND TAKİP AKTİF', 'S-BAND SEARCH & KU-BAND TRACK ACTIVE')
              : t('RADAR & APU DURDURULDU', 'RADAR & APU STOPPED'),
        color: state.firing ? '#dc2626' : state.folded ? '#d97706' : '#0284c7'
      }),
      applyTextures: K.applyTextures,
      setTexture: K.setTexture,
      toggleRelief: K.toggleRelief
    };
  };
})();
