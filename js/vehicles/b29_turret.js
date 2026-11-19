/* Boeing B-29 Superfortress — GE Merkezi Ateş Kontrol (Central Station Fire Control) & Uzaktan Taret Sistemi (1944)
 * Smithsonian NASM / NMUSAF referanslı müze sergisi; iç bilgisayar, paralaks ölçeği ve kablo yolları eğitim amaçlıdır. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.b29_turret = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'b29_turret');
    const { T, root, parts, mats, mesh, box, cyl, ring, pipe, beam, instances } = K;
    const english = window.MuseumPreferences?.language === 'en';
    const t = (tr, en) => (english ? en : tr);

    const Ps = new T.Vector3(1.16, 2.18, 1.32); // Yan nişangâh istasyonu
    const Pu = new T.Vector3(0.0, 3.24, -0.35); // Üst insansız taret ekseni
    const Pl = new T.Vector3(0.0, 0.90, -0.35); // Alt insansız taret ekseni

    const state = {
      azimuth: 18,    // -140..+140 deg
      elevation: 16,  // -35..+60 deg
      rangeM: 320,    // 150..900 m
      showRays: true,
      ammo: 400,
      recoilPhase: 0,
      firing: false,
      azU: 0,
      elU: 0,
      azL: 0,
      elL: 0,
      upperBlocked: false,
      lowerBlocked: false
    };

    const counts = {};
    let partIndex = 0;

    function mat(color, metalness = 0.55, roughness = 0.42, paint = false) {
      const m = new T.MeshStandardMaterial({ color, metalness, roughness, bumpScale: 0.002 });
      m.userData.paint = paint;
      return m;
    }

    const aluMat = mat(0xb8c0c8, 0.82, 0.28, true);
    const cabinMat = mat(0x526452, 0.25, 0.72, false);
    const gunMat = mat(0x272c31, 0.85, 0.32, false);
    const brassMat = mats.brass.clone();
    const copperMat = mat(0xb66e3d, 0.75, 0.35, false);
    const blueCompMat = mat(0x2a455e, 0.55, 0.45, false);
    const glassMat = new T.MeshStandardMaterial({
      color: 0x9ed2e6,
      transparent: true,
      opacity: 0.34,
      roughness: 0.12,
      metalness: 0.15
    });
    const raySightMat = new T.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.85 });
    const rayUpperMat = new T.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.82 });
    const rayLowerMat = new T.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.82 });
    const flashMat = new T.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.9 });

    function part(id, tr, en, subTr, subEn, descTr, descEn, basePos = [0, 0, 0], exp = [0, 0.5, 0], outer = false) {
      const sub = t(subTr, subEn);
      counts[sub] = (counts[sub] || 0) + 1;
      const p = K.part(id, ++partIndex + '. ' + t(tr, en), sub, basePos, exp, t(descTr, descEn), outer);
      Object.assign(p.userData, {
        material: t('Alüminyum alaşım gövde, pleksiglas kubbe, çelik namlular ve pirinç dişliler', 'Aluminum alloy fuselage, plexiglass dome, steel barrels and brass gears'),
        weight: t('Temsili kesit sergisi (orijinal sistem ~1.000+ kg)', 'Interpretive cutaway exhibit (full aircraft CFC system >1,000 kg)'),
        spec: t('GE Central Station Fire Control (CSFC) • paralaks & amplidin modeli', 'GE Central Station Fire Control (CSFC) • parallax & amplidyne model')
      });
      return p;
    }

    // -------------------------------------------------------------------------
    // A. BASINÇLI KABİN & NİŞANGÂH (PRESSURIZED CABIN & SIGHT) — 4 Grup
    // -------------------------------------------------------------------------
    const stand = part(
      'stand',
      'Çelik Müze Gövde Standı',
      'Steel museum fuselage stand',
      'Basınçlı Kabin & Nişangâh',
      'Pressurized Cabin & Sight',
      'B-29 gövde kesitini yüksekte taşıyarak alt taretin serbestçe dönmesini sağlayan çelik destek iskelesi.',
      'Steel museum cradle elevating the B-29 fuselage section so the lower remote turret clears the floor.',
      [0, 0, 0],
      [0, -0.3, 0]
    );
    box(stand, [3.4, 0.12, 4.4], [0, 0.06, 0.25], mats.dark);
    for (const [x, z] of [[-1.35, -1.65], [1.35, -1.65], [-1.35, 2.05], [1.35, 2.05]]) {
      beam(stand, [x, 0.12, z], [x * 0.72, 1.36, z], 0.09, mats.steel);
    }
    ring(stand, 1.24, [0, 2.08, -1.65], mats.steel, 0.045);
    ring(stand, 1.24, [0, 2.08, 2.05], mats.steel, 0.045);

    const fuselage = part(
      'fuselage',
      'B-29 Basınçlı Gövde Kesiti',
      'B-29 pressurized fuselage section',
      'Basınçlı Kabin & Nişangâh',
      'Pressurized Cabin & Sight',
      'Nişancıların yüksek irtifada oksijen maskesi olmadan görev yaptığı basınçlı gövde kesiti. X-Ray modunda şeffaflaşır.',
      'Pressurized fuselage compartment keeping gunners warm at altitude. Becomes transparent in X-Ray mode.',
      [0, 0, 0],
      [0, 0.65, 0],
      true
    );
    const hullShellMat = aluMat.clone();
    hullShellMat.side = T.DoubleSide;
    mesh(fuselage, new T.CylinderGeometry(1.18, 1.18, 3.7, 36, 1, true, 0.45, Math.PI * 1.75), hullShellMat, [0, 2.08, 0.2], [Math.PI / 2, 0, 0]);
    for (const z of [-1.2, -0.35, 0.55, 1.45]) {
      ring(fuselage, 1.15, [0, 2.08, z], cabinMat, 0.032);
    }
    box(fuselage, [1.85, 0.06, 3.5], [0, 1.42, 0.2], cabinMat);

    const blisterDome = part(
      'blisterDome',
      'Basınçlı Yan Gözlem Kubbesi (Blister)',
      'Pressurized side sighting blister',
      'Basınçlı Kabin & Nişangâh',
      'Pressurized Cabin & Sight',
      'Sancak yanında nişancıya geniş görüş açısı sunan pleksiglas gözlem kubbesi.',
      'Starboard plexiglass sighting blister giving the gunner an unobstructed panoramic view.',
      [0, 0, 0],
      [0.85, 0.35, 0.3],
      true
    );
    mesh(blisterDome, new T.SphereGeometry(0.48, 24, 18, 0, Math.PI, 0, Math.PI), glassMat, [Ps.x - 0.1, Ps.y, Ps.z], [0, 0, -Math.PI / 2]);
    ring(blisterDome, 0.48, [Ps.x - 0.1, Ps.y, Ps.z], aluMat, 0.035, [0, Math.PI / 2, 0]);

    const sightStation = part(
      'sightStation',
      'GE Jiroskopik Optik Nişangâh İstasyonu',
      'GE gyroscopic optical sighting station',
      'Basınçlı Kabin & Nişangâh',
      'Pressurized Cabin & Sight',
      'Nişancının hedefi takip ettiği çift tutamaklı optik nişangâh ve selsyn açı vericisi.',
      'Gunner optical sighting pedestal with dual handles and selsyn angle transmitter.',
      [Ps.x, Ps.y, Ps.z],
      [0.7, 0.2, 0.5]
    );
    cyl(sightStation, 0.07, 0.68, [-0.12, -0.40, 0], mats.dark, 'y');
    box(sightStation, [0.32, 0.12, 0.32], [-0.36, -0.48, 0], cabinMat); // Nişancı koltuğu
    const sightYawGroup = new T.Group();
    sightStation.add(sightYawGroup);
    const sightPitchGroup = new T.Group();
    sightYawGroup.add(sightPitchGroup);
    box(sightPitchGroup, [0.24, 0.18, 0.20], [0, 0, 0], blueCompMat);
    cyl(sightPitchGroup, 0.048, 0.34, [0.16, 0.03, 0], gunMat, 'x');
    ring(sightPitchGroup, 0.055, [0.33, 0.03, 0], brassMat, 0.012, [0, Math.PI / 2, 0]);

    // -------------------------------------------------------------------------
    // B. ANALOG BİLGİSAYAR & SERVO (ANALOG COMPUTER & SERVO) — 4 Grup
    // -------------------------------------------------------------------------
    const computerCase = part(
      'computerCase',
      'GE Analog Ateş Kontrol Bilgisayarı',
      'GE analog fire-control computer',
      'Analog Bilgisayar & Servo',
      'Analog Computer & Servo',
      'Menzil, rüzgâr, yerçekimi düşümü ve paralaks ofsetini gerçek zamanlı hesaplayan elektro-mekanik bilgisayar kutusu.',
      'Electromechanical analog computer calculating target lead, gravity drop, and parallax offset.',
      [0, 0, 0],
      [-0.75, 0.35, 0.4],
      true
    );
    const compMat = blueCompMat.clone();
    compMat.transparent = true;
    compMat.opacity = 0.88;
    box(computerCase, [0.62, 0.56, 0.72], [-0.42, 1.76, 1.05], compMat);

    const camGears = part(
      'camGears',
      'Paralaks Kam Tamburları ve Diferansiyeller',
      'Parallax cam drums & differentials',
      'Analog Bilgisayar & Servo',
      'Analog Computer & Servo',
      'Hedef açısı ve menzil değiştikçe dönerek nişangâh ile uzak taretler arasındaki açı farkını üreten kam dişli mekanizması.',
      'Cam drums and differential gears rotating with range and bearing to compute turret lead angles.',
      [-0.42, 1.76, 1.05],
      [-0.95, 0.65, 0.4]
    );
    const camDrum1 = cyl(camGears, 0.14, 0.28, [0, 0.08, -0.14], brassMat, 'z');
    const camDrum2 = cyl(camGears, 0.12, 0.26, [0, -0.10, 0.14], copperMat, 'x');
    ring(camGears, 0.15, [0, 0.08, 0.02], mats.steel, 0.024);

    const amplidyne = part(
      'amplidyne',
      'Amplidyne Güç Yükseltici & Veri Kabloları',
      'Amplidyne servo drive & data cables',
      'Analog Bilgisayar & Servo',
      'Analog Computer & Servo',
      'Bilgisayardan gelen zayıf sinyali yüksek torklu taret motor akımına yükselten döner amplidyne ünitesi ve hatları.',
      'Rotary amplidyne power amplifier driving the remote turrets via armored signal harnesses.',
      [0, 0, 0],
      [-0.65, 0.25, -0.4]
    );
    cyl(amplidyne, 0.16, 0.46, [-0.52, 1.68, 0.15], gunMat, 'z');
    pipe(amplidyne, [[Ps.x - 0.1, Ps.y - 0.2, Ps.z], [0.4, 1.62, 1.1], [-0.15, 1.72, 1.05]], 0.022, copperMat);
    pipe(amplidyne, [[-0.42, 2.02, 0.85], [-0.28, 2.75, 0.1], [Pu.x, Pu.y - 0.24, Pu.z]], 0.024, copperMat);
    pipe(amplidyne, [[-0.42, 1.48, 0.85], [-0.28, 1.15, 0.1], [Pl.x, Pl.y + 0.24, Pl.z]], 0.024, copperMat);

    const interrupterCam = part(
      'interrupterCam',
      'Gövde Koruma Ateş Kesici (Interrupter)',
      'Airframe fire-interrupter cam',
      'Analog Bilgisayar & Servo',
      'Analog Computer & Servo',
      'Taret namluları uçağın kendi gövdesine veya dikey kuyruğuna yöneldiğinde tetiği otomatik kesen güvenlik diski.',
      'Safety interrupter disc cutting firing power whenever a turret points toward the bomber’s own structure.',
      [-0.42, 1.76, 0.58],
      [-0.95, 0.3, 0]
    );
    const interrupterDisc = cyl(interrupterCam, 0.18, 0.04, [0, 0, 0], brassMat, 'z');
    box(interrupterCam, [0.07, 0.24, 0.06], [0, 0.12, 0], mats.red);

    // -------------------------------------------------------------------------
    // C. ÜST İNSANSIZ TARET (UPPER REMOTE TURRET) — 4 Grup
    // -------------------------------------------------------------------------
    const upperRing = part(
      'upperRing',
      'Üst Barbet Dişli Çemberi ve Pinyon',
      'Upper turret ring gear & pinion',
      'Üst İnsansız Taret',
      'Upper Remote Turret',
      'Üst tareti 360° döndüren 5:1 oranlı azimut dişli halkası ve servo tahrik pinyonu.',
      'Upper turret 5:1 azimuth ring gear and driving servo pinion.',
      [Pu.x, Pu.y, Pu.z],
      [0, 0.85, 0]
    );
    ring(upperRing, 0.42, [0, -0.05, 0], mats.steel, 0.045, [Math.PI / 2, 0, 0]);
    const upperPinion = cyl(upperRing, 0.084, 0.12, [-0.504, -0.05, 0], brassMat, 'y');

    const upperTurretYaw = new T.Group();
    upperTurretYaw.position.set(Pu.x, Pu.y, Pu.z);
    root.add(upperTurretYaw);

    const upperDome = part(
      'upperDome',
      'Üst İnsansız Alçak Kubbe',
      'Upper unmanned low-profile dome',
      'Üst İnsansız Taret',
      'Upper Remote Turret',
      'İçinde mürettebat bulunmadığı için gövdeye çok alçak oturabilen aerodinamik üst taret kapağı.',
      'Aerodynamic low-profile unmanned dome housing twin .50-caliber machine guns.',
      [0, 0, 0],
      [0, 1.35, 0],
      true
    );
    upperTurretYaw.add(upperDome);
    mesh(upperDome, new T.SphereGeometry(0.44, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), aluMat, [0, 0, 0]);

    const upperGuns = part(
      'upperGuns',
      'Üst İkiz .50 Cal (12,7 mm) Namlular',
      'Upper twin .50 cal barrels',
      'Üst İnsansız Taret',
      'Upper Remote Turret',
      'Üst beşikte yer alan ikiz M2 Browning 12,7 mm makineli tüfek namluları ve geri tepme yayları.',
      'Twin M2 .50-caliber machine gun barrels mounted in the upper elevating cradle.',
      [0, 0.14, 0],
      [0.65, 1.15, 0]
    );
    upperTurretYaw.add(upperGuns);
    const upperGunPivot = new T.Group();
    upperGuns.add(upperGunPivot);
    const upperRecoilGroup = new T.Group();
    upperGunPivot.add(upperRecoilGroup);
    for (const z of [-0.11, 0.11]) {
      box(upperRecoilGroup, [0.36, 0.11, 0.09], [0.05, 0, z], gunMat);
      cyl(upperRecoilGroup, 0.028, 0.78, [0.58, 0, z], gunMat, 'x');
    }
    const upperFlash = new T.Mesh(new T.ConeGeometry(0.08, 0.28, 10), flashMat);
    upperFlash.rotation.z = -Math.PI / 2;
    upperFlash.position.set(1.12, 0, 0);
    upperFlash.visible = false;
    upperRecoilGroup.add(upperFlash);

    const upperAmmo = part(
      'upperAmmo',
      'Üst Taret Mühimmat Besleme Kutuları',
      'Upper turret ammunition boxes',
      'Üst İnsansız Taret',
      'Upper Remote Turret',
      'Taret dönüş halkası altında asılı 12,7 mm şerit mühimmat kutuları.',
      'Ammo feed boxes and chutes suspended beneath the upper turret mount.',
      [0, -0.22, 0],
      [0, 0.45, -0.7]
    );
    upperTurretYaw.add(upperAmmo);
    box(upperAmmo, [0.32, 0.22, 0.46], [-0.08, 0, 0], brassMat);

    // -------------------------------------------------------------------------
    // D. ALT İNSANSIZ TARET & PARALAKS (LOWER TURRET & PARALLAX) — 5 Grup
    // -------------------------------------------------------------------------
    const lowerRing = part(
      'lowerRing',
      'Alt Barbet Dişli Çemberi ve Pinyon',
      'Lower turret ring gear & pinion',
      'Alt İnsansız Taret & Paralaks',
      'Lower Turret & Parallax',
      'Karın altı tareti süren 5:1 oranlı azimut dişli çemberi ve ters yönlü servo pinyonu.',
      'Ventral turret 5:1 azimuth ring gear and counter-rotating servo pinion.',
      [Pl.x, Pl.y, Pl.z],
      [0, -0.45, 0]
    );
    ring(lowerRing, 0.42, [0, 0.05, 0], mats.steel, 0.045, [Math.PI / 2, 0, 0]);
    const lowerPinion = cyl(lowerRing, 0.084, 0.12, [-0.504, 0.05, 0], brassMat, 'y');

    const lowerTurretYaw = new T.Group();
    lowerTurretYaw.position.set(Pl.x, Pl.y, Pl.z);
    root.add(lowerTurretYaw);

    const lowerDome = part(
      'lowerDome',
      'Alt İnsansız Karın Kubbesi',
      'Lower ventral unmanned dome',
      'Alt İnsansız Taret & Paralaks',
      'Lower Turret & Parallax',
      'Uçağın gövde altını koruyan insansız yarım küre taret kubbesi.',
      'Ventral hemispherical remote turret dome protecting the bomber’s underside.',
      [0, 0, 0],
      [0, -0.65, 0],
      true
    );
    lowerTurretYaw.add(lowerDome);
    mesh(lowerDome, new T.SphereGeometry(0.42, 24, 14, 0, Math.PI * 2, Math.PI * 0.48, Math.PI * 0.52), aluMat, [0, 0, 0]);

    const lowerGuns = part(
      'lowerGuns',
      'Alt İkiz .50 Cal (12,7 mm) Namlular',
      'Lower twin .50 cal barrels',
      'Alt İnsansız Taret & Paralaks',
      'Lower Turret & Parallax',
      'Bilgisayar tarafından paralaks düzeltmesiyle yönlendirilen alt ikiz 12,7 mm namlular.',
      'Lower twin .50-caliber barrels aimed independently with analog parallax correction.',
      [0, -0.14, 0],
      [0.65, -0.5, 0]
    );
    lowerTurretYaw.add(lowerGuns);
    const lowerGunPivot = new T.Group();
    lowerGuns.add(lowerGunPivot);
    const lowerRecoilGroup = new T.Group();
    lowerGunPivot.add(lowerRecoilGroup);
    for (const z of [-0.11, 0.11]) {
      box(lowerRecoilGroup, [0.36, 0.11, 0.09], [0.05, 0, z], gunMat);
      cyl(lowerRecoilGroup, 0.028, 0.76, [0.56, 0, z], gunMat, 'x');
    }
    const lowerFlash = new T.Mesh(new T.ConeGeometry(0.08, 0.28, 10), flashMat);
    lowerFlash.rotation.z = -Math.PI / 2;
    lowerFlash.position.set(1.08, 0, 0);
    lowerFlash.visible = false;
    lowerRecoilGroup.add(lowerFlash);

    const parallaxRays = part(
      'parallaxRays',
      'Paralaks Yakınsama Işınları',
      'Parallax convergence rays',
      'Alt İnsansız Taret & Paralaks',
      'Lower Turret & Parallax',
      'Nişangâh (sarı), üst taret (mavi) ve alt taretin (yeşil) hedefte kesişen görüş/ateş ışınlarını gösterir.',
      'Shows the sight (amber), upper turret (blue), and lower turret (green) vectors converging on the target.',
      [0, 0, 0],
      [1.2, 0.2, 0]
    );
    function makeRay(matRef) {
      const m = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 1, 8), matRef);
      parallaxRays.add(m);
      return m;
    }
    const raySight = makeRay(raySightMat);
    const rayUpper = makeRay(rayUpperMat);
    const rayLower = makeRay(rayLowerMat);

    const targetRing = part(
      'targetRing',
      'Kalibrasyon Hedef Halkası',
      'Calibration target ring',
      'Alt İnsansız Taret & Paralaks',
      'Lower Turret & Parallax',
      'Seçilen hedef menziline göre uzakta konumlanan ve ışınların toplandığı hedef işaret halkası.',
      'Calibration target ring placed at the selected range where all three aiming vectors meet.',
      [0, 0, 0],
      [1.4, 0.3, 0]
    );
    const targetMarker = new T.Group();
    targetRing.add(targetMarker);
    ring(targetMarker, 0.36, [0, 0, 0], mats.red, 0.025, [0, Math.PI / 2, 0]);
    ring(targetMarker, 0.16, [0, 0, 0], brassMat, 0.018, [0, Math.PI / 2, 0]);

    function placeRay(rayMesh, fromV, toV) {
      const diff = toV.clone().sub(fromV);
      const len = Math.max(0.01, diff.length());
      rayMesh.position.copy(fromV).addScaledVector(diff, 0.5);
      rayMesh.scale.set(1, len, 1);
      rayMesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), diff.normalize());
    }

    function computeTargetPoint() {
      const az = (state.azimuth * Math.PI) / 180;
      const el = (state.elevation * Math.PI) / 180;
      const u = new T.Vector3(
        Math.cos(az) * Math.cos(el),
        Math.sin(el),
        Math.sin(az) * Math.cos(el)
      );
      const distUnits = state.rangeM / 35; // 150 m -> 4.28 u, 900 m -> 25.71 u
      return { u, target: Ps.clone().addScaledVector(u, distUnits) };
    }

    function sync() {
      const azRad = (state.azimuth * Math.PI) / 180;
      const elRad = (state.elevation * Math.PI) / 180;
      sightYawGroup.rotation.y = -azRad;
      sightPitchGroup.rotation.z = elRad;

      const { target } = computeTargetPoint();
      const du = target.clone().sub(Pu);
      const dl = target.clone().sub(Pl);

      state.azU = Math.atan2(du.z, du.x);
      state.elU = Math.atan2(du.y, Math.hypot(du.x, du.z));
      state.azL = Math.atan2(dl.z, dl.x);
      state.elL = Math.atan2(dl.y, Math.hypot(dl.x, dl.z));

      // Ateş kesici: gövde konisi ve kuyruk sektörü içine düşen açılar
      state.upperBlocked = state.elU < -0.14 || Math.abs(state.azU) > 2.15;
      state.lowerBlocked = state.elL > 0.14 || Math.abs(state.azL) > 2.15;

      upperTurretYaw.rotation.y = -state.azU;
      upperGunPivot.rotation.z = state.elU;
      upperPinion.rotation.y = state.azU * (0.42 / 0.084);

      lowerTurretYaw.rotation.y = -state.azL;
      lowerGunPivot.rotation.z = state.elL;
      lowerPinion.rotation.y = state.azL * (0.42 / 0.084);

      // Kam ve kesici diskleri nişangâh/menzil girdisiyle senkron döner
      camDrum1.rotation.z = azRad * 0.8 + (state.rangeM / 900) * 1.4;
      camDrum2.rotation.x = elRad * 1.2 + (state.rangeM / 900) * 1.1;
      interrupterDisc.rotation.z = azRad * 0.5;

      // Geri tepme
      const kick = Math.sin(state.recoilPhase * Math.PI) * 0.11;
      upperRecoilGroup.position.x = -kick * (state.upperBlocked ? 0 : 1);
      lowerRecoilGroup.position.x = -kick * (state.lowerBlocked ? 0 : 1);
      upperFlash.visible = state.firing && !state.upperBlocked && state.recoilPhase > 0.15 && state.recoilPhase < 0.75;
      lowerFlash.visible = state.firing && !state.lowerBlocked && state.recoilPhase > 0.15 && state.recoilPhase < 0.75;

      // Paralaks ışınları & hedef halka
      parallaxRays.visible = state.showRays;
      targetRing.visible = state.showRays;
      if (state.showRays) {
        const visualDist = Math.min(8.5, target.distanceTo(Ps));
        const sightDir = target.clone().sub(Ps).normalize();
        const visualTarget = Ps.clone().addScaledVector(sightDir, visualDist);
        targetMarker.position.copy(visualTarget);
        targetMarker.lookAt(Ps);
        targetMarker.rotateY(Math.PI / 2);

        placeRay(raySight, Ps, visualTarget);
        placeRay(rayUpper, new T.Vector3(Pu.x, Pu.y + 0.14, Pu.z), visualTarget);
        placeRay(rayLower, new T.Vector3(Pl.x, Pl.y - 0.14, Pl.z), visualTarget);
      }
    }

    function reset() {
      Object.assign(state, {
        azimuth: 18,
        elevation: 16,
        rangeM: 320,
        showRays: true,
        ammo: 400,
        recoilPhase: 0,
        firing: false
      });
      sync();
    }

    const camPresets = {
      iso: { pos: [6.4, 4.2, 6.4], look: [0.4, 2.0, 0.2] },
      front: { pos: [7.5, 2.2, 0.4], look: [0.2, 2.0, 0.2] },
      breech: { pos: [-6.4, 2.5, 2.8], look: [0, 2.0, 0.2] },
      engine: { pos: [-3.2, 2.6, 3.8], look: [-0.35, 1.85, 0.8] },
      suspension: { pos: [4.2, 1.6, 4.2], look: [0.6, 1.7, 0.4] },
      top: { pos: [0.2, 9.2, 0.01], look: [0.2, 2.0, 0.2] }
    };

    const tourSteps = [
      [
        ['Basınçlı Kabinden Uzaktan Kontrol', 'Remote gunnery from a pressurized cabin'],
        ['B-29’da nişancılar açık taretlerde donmak yerine basınçlı gövde içinden dört insansız tareti yönetiyordu.', 'Instead of freezing in exposed turrets, B-29 gunners operated four unmanned turrets from inside a pressurized fuselage.'],
        'iso', 'fuselage', false
      ],
      [
        ['Yan Gözlem Kubbesi (Blister) ve Nişangâh', 'Side blister & optical sighting station'],
        ['Nişancı şeffaf pleksiglas kubbeden baktığında selsyn vericisi açı bilgilerini merkezî bilgisayara aktarır.', 'As the gunner tracks a target from the side blister, selsyn transmitters feed bearing and elevation to the computer.'],
        'front', 'sightStation', false
      ],
      [
        ['GE Analog Bilgisayar ve Amplidyne', 'GE analog computer & amplidyne'],
        ['X-Ray modunda kabin içindeki analog bilgisayarı ve güç yükselticisini inceleyin; menzil değiştikçe kam tamburları döner.', 'Inspect the analog computer and amplidyne amplifier inside the fuselage; cam drums rotate as range changes.'],
        'engine', 'camGears', true
      ],
      [
        ['Gerçek Zamanlı Paralaks Düzeltmesi', 'Real-time parallax correction'],
        ['Hedef yaklaştıkça üst ve alt taretlerin açıları nişangâhtan farklılaşır; uzaklaştıkça tek noktada yakınsar.', 'At short range, upper and lower turret angles diverge strongly from the sight; at long range they converge.'],
        'iso', 'parallaxRays', false
      ],
      [
        ['İnsansız Üst ve Alt Taretler', 'Unmanned upper & ventral turrets'],
        ['Azimut dişli çemberi ile 5:1 pinyon üzerinden senkronize dönen ikiz 12,7 mm taretleri inceleyin.', 'Inspect the twin .50-caliber remote turrets driven synchronously via 5:1 azimuth ring gears and pinions.'],
        'suspension', 'upperGuns', false
      ],
      [
        ['Gövde Koruma Ateş Kesicisi', 'Airframe fire interrupter'],
        ['Taret namlusu uçağın kendi gövdesine yöneldiğinde kesici mekanizma o taretin ateşlemesini otomatik kilitler.', 'When a turret’s line of fire crosses the bomber’s own fuselage cone, the interrupter locks out firing.'],
        'breech', 'interrupterCam', false
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
      title: t('BOEING B-29 — GE MERKEZÎ ATEŞ KONTROLÜ', 'BOEING B-29 — GE CENTRAL FIRE CONTROL'),
      sub: t('1944 • Analog Paralaks Bilgisayarı • Uzaktan Kumandalı Taretler', '1944 • Analog Parallax Computer • Remote-Controlled Turrets'),
      subsystems: Object.entries(counts).map(([key, count]) => ({ key, label: key, count, color: '#38bdf8' })),
      camLabels: Object.fromEntries(Object.entries({
        iso: ['Genel Sergi', 'Full exhibit'],
        front: ['Sancak & Nişangâh', 'Starboard & sight'],
        breech: ['İskele Profil', 'Port profile'],
        engine: ['Bilgisayar Kesiti', 'Computer cutaway'],
        suspension: ['Alt Taret', 'Lower turret'],
        top: ['Üst Görünüş', 'Top view']
      }).map(([k, v]) => [k, t(...v)])),
      sliders: [
        [['Nişangâh Azimut Açısı', 'Sight azimuth'], -140, 140, '°'],
        [['Nişangâh Yükseliş Açısı', 'Sight elevation'], -35, 60, '°'],
        [['Hedef Menzili', 'Target range'], 150, 900, ' m']
      ].map(([labels, min, max, unit]) => ({
        label: t(...labels),
        min,
        max,
        step: 1,
        fmt: v => Math.round(v) + unit
      })),
      buttons: {
        terrain: t('Paralaks Işınlarını Göster', 'Show parallax rays'),
        sweep: t('Sergiyi Sıfırla', 'Reset exhibit')
      },
      telemetryTag: t('B-29 CSFC • GE ANALOG', 'B-29 CSFC • GE ANALOG'),
      statLabels: [
        ['PARALAKS FARKI', 'PARALLAX DELTA'],
        ['ÜST TARET AÇISI', 'UPPER ELEV'],
        ['ALT TARET AÇISI', 'LOWER ELEV'],
        ['MÜHİMMAT', 'AMMO']
      ].map(v => t(...v))
    });

    sync();

    return {
      root,
      parts,
      ui,
      camPresets,
      tourSteps,
      defaultPart: parts.sightStation,
      firePart: parts.upperGuns,
      update(dt) {
        if (state.firing) {
          state.recoilPhase += dt * 5.2;
          if (state.recoilPhase >= 1) {
            state.recoilPhase = 0;
            state.firing = false;
          }
          sync();
        }
      },
      onFire() {
        if (state.ammo <= 0) {
          state.ammo = 400;
          sync();
          return { ok: true, resupplied: true };
        }
        if (state.upperBlocked && state.lowerBlocked) {
          return { ok: false, msg: t('Ateş kesici aktif: her iki taret gövde koruma açısında.', 'Fire interrupter active: both turrets blocked by airframe cone.') };
        }
        const cost = (state.upperBlocked ? 0 : 8) + (state.lowerBlocked ? 0 : 8);
        state.ammo = Math.max(0, state.ammo - cost);
        state.firing = true;
        state.recoilPhase = 0.25;
        sync();
        return { ok: true };
      },
      fireButtonLabel: () => t(state.ammo > 0 ? 'SALVO ATEŞLE (.50 CAL)' : 'MÜHİMMAT İKMALİ', state.ammo > 0 ? 'FIRE REMOTE SALVO' : 'RESUPPLY AMMO'),
      mobileFireButtonLabel: () => t(state.ammo > 0 ? 'ATEŞLE' : 'İKMAL', state.ammo > 0 ? 'FIRE' : 'RELOAD'),
      onSlider(i, v) {
        if (!Number.isFinite(v)) return {};
        const clamped = T.MathUtils.clamp(v, ui.sliders[i].min, ui.sliders[i].max);
        if (i === 0) state.azimuth = clamped;
        else if (i === 1) state.elevation = clamped;
        else if (i === 2) state.rangeM = clamped;
        sync();
        return {};
      },
      onButton(name) {
        if (name === 'terrain') {
          state.showRays = !state.showRays;
          sync();
        } else if (name === 'sweep') {
          reset();
        }
        return {};
      },
      buttonActive: name => name === 'terrain' && state.showRays,
      getSliderValues: () => [state.azimuth, state.elevation, state.rangeM],
      getStats: () => {
        const deltaDeg = Math.abs((state.elU - state.elL) * (180 / Math.PI));
        return [
          deltaDeg.toFixed(1) + ' <span>°</span>',
          Math.round(state.elU * (180 / Math.PI)) + ' <span>°</span>',
          Math.round(state.elL * (180 / Math.PI)) + ' <span>°</span>',
          String(state.ammo)
        ];
      },
      getStatus: () => {
        if (state.upperBlocked && state.lowerBlocked) {
          return { text: t('ATEŞ KESİCİ KİLİTLİ (GÖVDE KONİSİ)', 'FIRE INTERRUPTER LOCKED'), color: '#dc2626' };
        }
        if (state.upperBlocked || state.lowerBlocked) {
          return { text: t('KISMİ ATEŞ KESİCİ AKTİF (1 TARET)', 'PARTIAL INTERRUPTER (1 TURRET)'), color: '#d97706' };
        }
        return { text: t('İKİ TARET HEDEFE KİLİTLİ', 'BOTH TURRETS TRACKING TARGET'), color: '#059669' };
      },
      applyTextures: K.applyTextures,
      setTexture: K.setTexture,
      toggleRelief: K.toggleRelief
    };
  };
})();
