/* Buffington–Crozier "Kaybolan Top" (Disappearing Gun) — 6 İnç M1905 / M1903 Kıyı Kundağı (1895)
 * National Park Service Battery Chamberlin / Fort Casey referanslı 1:1 müze sergisi; iç kesitler eğitim yorumudur. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.buffington = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'buffington');
    const { T, root, parts, mats, mesh, box, cyl, ring, beam, instances } = K;
    const english = window.MuseumPreferences?.language === 'en';
    const t = (tr, en) => (english ? en : tr);

    // Paralel 4-çubuk mekanizması kinematik sabitleri (L_BOT + L_TOP = 2.70 m sabit kaldıraç boyu)
    const Y_PARAPET = 2.60;
    const Y_RAIL = 1.72;
    const Z_CW = 0.55;
    const L_BOT = 1.05;
    const L_TOP = 1.65;

    const state = {
      traverseDeg: 0,
      elevDeg: 8,
      batteryPct: 100, // 100 = mevzide (siper üstü), 0 = gizli (siper arkası)
      showCoverLine: true,
      ammo: 12,
      recoilActive: false,
      recoilFlash: 0,
      raisingActive: false
    };

    const counts = {};
    let partIndex = 0;

    function mat(color, metalness = 0.48, roughness = 0.52, paint = false) {
      const m = new T.MeshStandardMaterial({ color, metalness, roughness, bumpScale: 0.002 });
      m.userData.paint = paint;
      return m;
    }

    const concreteMat = mat(0x9b9689, 0.05, 0.92, false);
    const ironMat = mat(0x3b443e, 0.45, 0.58, true);
    const steelMat = mats.steel.clone();
    const darkMat = mats.dark.clone();
    const brassMat = mats.brass.clone();
    const copperMat = mat(0xb86f3e, 0.78, 0.34, false);
    const leadMat = mat(0x475569, 0.65, 0.55, false);
    const woodMat = mats.wood.clone();
    const flashMat = new T.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.9 });
    const guideMat = new T.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 });

    function part(id, tr, en, subTr, subEn, descTr, descEn, basePos = [0, 0, 0], exp = [0, 0.5, 0], outer = false, parent = root) {
      const sub = t(subTr, subEn);
      counts[sub] = (counts[sub] || 0) + 1;
      const p = K.part(id, ++partIndex + '. ' + t(tr, en), sub, basePos, exp, t(descTr, descEn), outer, parent);
      Object.assign(p.userData, {
        material: t('Dökme demir yan şasi, çelik kaldıraç kolları, kurşun blok ve beton tahkimat', 'Cast-iron chassis, forged steel gun levers, lead counterweight & concrete parapet'),
        weight: t('~50 ton toplam top + kundak + kurşun karşı ağırlık (1:1 ölçek)', '~50 t total gun, carriage & lead counterweight (1:1 scale)'),
        spec: t('152 mm (6 inç) L/50 • 2,70 m kaldıraç • Ateş sonrası otomatik siper arkası gizleme', '152 mm (6-inch) L/50 • 2.70 m rigid levers • Recoil-driven self-retracting parapet cover')
      });
      return p;
    }

    function stretch(obj, a, b) {
      const av = new T.Vector3(...a), bv = new T.Vector3(...b);
      obj.position.copy(av).add(bv).multiplyScalar(0.5);
      obj.scale.set(1, Math.max(av.distanceTo(bv), 1e-4), 1);
      obj.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), bv.sub(av).normalize());
    }

    // -------------------------------------------------------------------------
    // A. BETON SİPER VE KARŞI AĞIRLIK KUYUSU (3 Grup)
    // -------------------------------------------------------------------------
    const concreteFoundation = part('concreteFoundation',
      'Endicott Beton Zemin ve Kuyu Kesiti', 'Endicott concrete pit & foundation',
      'Beton Siper ve Kuyu', 'Concrete Parapet & Pit',
      'Kundağı ve kurşun karşı ağırlığın içine indiği kuyu oyuğunu barındıran beton kıyı tahkimatı.',
      'Reinforced concrete emplacement floor and vertical counterweight well.',
      [0, 0, 0], [0, -0.3, 0], true
    );
    box(concreteFoundation, [5.40, 0.20, 3.20], [0, 0.10, -2.50], concreteMat); // min.y = 0.000
    box(concreteFoundation, [5.40, 0.20, 2.50], [0, 0.10, 1.50], concreteMat);
    for (const sx of [-1.85, 1.85]) box(concreteFoundation, [1.70, 1.35, 3.80], [sx, 0.675, -0.30], concreteMat);
    box(concreteFoundation, [2.00, 1.35, 1.15], [0, 0.675, -1.65], concreteMat); // arka kuyu duvarı

    const parapetWall = part('parapetWall',
      'Deniz Cephesi Beton Siper Duvarı (2,60 m)', 'Seaward concrete parapet (2.60 m)',
      'Beton Siper ve Kuyu', 'Concrete Parapet & Pit',
      'Denizden gelen düşman ateşi ve gözlemini tamamen kesen 2,60 m yüksekliğindeki beton göğüslük; X-Ray ile içi açılır.',
      'Thick 2.60 m seaward concrete parapet shielding crew and gun during reloading; transparent in X-Ray.',
      [0, 0, 0], [0, 0.6, 1.3], true
    );
    box(parapetWall, [5.40, Y_PARAPET, 1.30], [0, Y_PARAPET / 2, 2.30], concreteMat); // üst kot y = 2.60, ön kenar z = 2.95, iç kenar z = 1.65

    const loadingPlatform = part('loadingPlatform',
      'Arka Yükleme Platformu ve Korkuluklar', 'Rear loading platform & handrails',
      'Beton Siper ve Kuyu', 'Concrete Parapet & Pit',
      'Top geri tepip siper arkasına çöktüğünde mürettebatın güvende durup doldurduğu platform.',
      'Protected rear crew gallery where shells and powder bags are rammed while concealed.',
      [0, 0, 0], [0, 0.5, -1.0]
    );
    box(loadingPlatform, [4.60, 0.14, 1.65], [0, 1.28, -2.75], woodMat);
    for (const sx of [-2.2, -1.1, 0, 1.1, 2.2]) box(loadingPlatform, [0.06, 0.85, 0.06], [sx, 1.75, -3.52], darkMat);
    box(loadingPlatform, [4.46, 0.05, 0.05], [0, 2.16, -3.52], darkMat);

    // -------------------------------------------------------------------------
    // B. DÖNER KUNDAK & HİDROLİK FREN (5 Grup)
    // -------------------------------------------------------------------------
    const traverseTrack = part('traverseTrack',
      'Dairesel Çelik Yön Rayı (Traverse)', 'Circular steel traverse track',
      'Döner Kundak ve Fren', 'Traversing Carriage & Recoil',
      'Kundağın kuyu üzerinde ±60° yön değiştirmesini sağlayan çelik dairesel ray ve dişli çember.',
      'Fixed circular steel traverse track and geared ring on the concrete pit rim.',
      [0, 0, 0], [0, 0.3, 0]
    );
    ring(traverseTrack, 1.62, [0, 1.38, 0.25], steelMat, 0.06, [Math.PI / 2, 0, 0]);
    ring(traverseTrack, 1.38, [0, 1.36, 0.25], darkMat, 0.04, [Math.PI / 2, 0, 0]);

    // Kundağın yön dönüşü grubu (pivot z = 0.25 üzerinde dönen üst platform)
    const carriageYaw = new T.Group();
    carriageYaw.name = 'carriage-yaw';
    carriageYaw.position.set(0, 0, 0);
    root.add(carriageYaw);

    const baseRing = part('baseRing',
      'Döner Taban Halkası ve 16 Konik Rulman', 'Rotating racer ring & 16 conical rollers',
      'Döner Kundak ve Fren', 'Traversing Carriage & Recoil',
      '50 tonluk kundağı ray üzerinde kolayca çeviren 16 adet konik çelik makaralı döner tabla.',
      'Rotating racer ring supported on sixteen conical steel rollers for smooth manual traverse.',
      [0, 0, 0], [0, 0.4, 0], false, carriageYaw
    );
    ring(baseRing, 1.56, [0, 1.46, 0.25], ironMat, 0.07, [Math.PI / 2, 0, 0]);
    const rollerGeo = new T.CylinderGeometry(0.065, 0.065, 0.14, 10);
    const rollerTransforms = Array.from({ length: 16 }, (_, k) => {
      const a = (k * Math.PI * 2) / 16;
      return { pos: [Math.cos(a) * 1.56, 1.42, 0.25 + Math.sin(a) * 1.56], rot: [Math.PI / 2, -a, 0] };
    });
    instances(baseRing, rollerGeo, brassMat, rollerTransforms);

    const sideFrames = part('sideFrames',
      'İkiz Dökme Demir Yan Kundak & Raylar', 'Twin cast-iron chassis & slide rails',
      'Döner Kundak ve Fren', 'Traversing Carriage & Recoil',
      'Yatay üst kızak raylarını ve dikey karşı ağırlık kılavuz raylarını taşıyan ikiz ana gövde.',
      'Twin cast-iron side cheeks carrying the horizontal top-carriage rails and vertical pit guides.',
      [0, 0, 0], [0, 0.5, 0], false, carriageYaw
    );
    for (const s of [-1, 1]) {
      box(sideFrames, [0.16, 0.36, 2.35], [s * 0.72, Y_RAIL - 0.10, -0.05], ironMat);
      box(sideFrames, [0.09, 1.32, 0.14], [s * 0.48, 1.05, Z_CW], steelMat); // dikey karşı ağırlık kuyu rayı
    }

    const topCarriage = part('topCarriage',
      'Kayar Kızak Arabası ve Hidrolik Fren Silindirleri', 'Sliding top carriage & hydraulic cylinders',
      'Döner Kundak ve Fren', 'Traversing Carriage & Recoil',
      'Kaldıraç milini taşıyan ve geri tepme enerjisini sıvı yağ basıncıyla sönümleyen ikiz hidrolik silindirler.',
      'Sliding top carriage housing twin hydraulic recoil cylinders absorbing firing energy.',
      [0, 0, 0], [0, 0.7, -0.4], false, carriageYaw
    );
    const topCarriageMove = new T.Group();
    topCarriageMove.name = 'top-carriage-slide';
    topCarriageMove.position.set(0, Y_RAIL, 0);
    topCarriage.add(topCarriageMove);
    box(topCarriageMove, [1.34, 0.18, 0.44], [0, 0, 0], ironMat);
    for (const s of [-1, 1]) {
      cyl(topCarriageMove, 0.10, 0.88, [s * 0.62, 0.14, 0], copperMat, 'z');
    }

    const recoilPistons = part('recoilPistons',
      'Ankrajlı Hidrolik Fren Piston Çubukları', 'Anchored recoil piston rods',
      'Döner Kundak ve Fren', 'Traversing Carriage & Recoil',
      'Ön sabit şasi ile geri tepen kızak arabası arasında uzanan yüksek basınçlı piston milleri.',
      'High-strength piston rods stretching between the front chassis anchor and sliding top carriage.',
      [0, 0, 0], [0, 0.7, 0.4], false, carriageYaw
    );
    const pistonL = cyl(recoilPistons, 0.042, 1, [-0.62, Y_RAIL + 0.14, 0.35], steelMat);
    const pistonR = cyl(recoilPistons, 0.042, 1, [0.62, Y_RAIL + 0.14, 0.35], steelMat);

    // -------------------------------------------------------------------------
    // C. PARALEL KALDIRAÇ & KURŞUN KARŞI AĞIRLIK (4 Grup)
    // -------------------------------------------------------------------------
    const gunLevers = part('gunLevers',
      'İkiz 2,70 m Çelik Kaldıraç Kolları', 'Twin 2.70 m steel gun levers',
      'Kaldıraç ve Karşı Ağırlık', 'Lever Arm & Counterweight',
      'Alt ucu karşı ağırlığa, orta mili kızağa, üst ucu top muylusuna bağlı rijit döner kollar.',
      'Twin 2.70 m rigid levers pivoting about the top carriage between counterweight and trunnions.',
      [0, 0, 0], [0, 0.9, 0], false, carriageYaw
    );
    const leverLeft = new T.Group();
    leverLeft.name = 'lever-left';
    const leverRight = new T.Group();
    leverRight.name = 'lever-right';
    gunLevers.add(leverLeft, leverRight);
    for (const lg of [leverLeft, leverRight]) {
      box(lg, [0.12, L_BOT + L_TOP, 0.22], [0, (L_BOT + L_TOP) / 2, 0], ironMat);
      cyl(lg, 0.09, 0.18, [0, 0, 0], brassMat, 'x');
      cyl(lg, 0.11, 0.18, [0, L_BOT, 0], brassMat, 'x');
      cyl(lg, 0.10, 0.18, [0, L_BOT + L_TOP, 0], brassMat, 'x');
    }

    const counterweight = part('counterweight',
      'Katmanlı Kurşun Karşı Ağırlık Bloğu', 'Stacked lead counterweight block',
      'Kaldıraç ve Karşı Ağırlık', 'Lever Arm & Counterweight',
      'Mandal bırakıldığında kuyu içine düşerek 12 tonluk namluyu kolayca siper üstüne kaldıran dev kurşun blok.',
      'Massive stacked lead weight falling down the vertical pit to raise the gun back to battery.',
      [0, 0, 0], [0, -0.5, 0], false, carriageYaw
    );
    const cwBlock = new T.Group();
    cwBlock.name = 'counterweight-block';
    cwBlock.position.set(0, 0.72, Z_CW);
    counterweight.add(cwBlock);
    box(cwBlock, [0.84, 0.56, 0.72], [0, 0, 0], leadMat);
    for (const dy of [-0.14, 0, 0.14]) box(cwBlock, [0.88, 0.06, 0.76], [0, dy, 0], steelMat);

    const trippingLatch = part('trippingLatch',
      'Dişli Geri Tepme Mandalı (Pawl & Ratchet)', 'Tripping pawls & safety latch',
      'Kaldıraç ve Karşı Ağırlık', 'Lever Arm & Counterweight',
      'Top ateşlenip siper arkasına indiğinde karşı ağırlığı yukarıda kilitleyen tırnak ve serbest bırakma kolu.',
      'Ratchet pawls locking the gun in the retracted loading position until manually tripped.',
      [0, 0, 0], [0, 0.8, -0.5], false, carriageYaw
    );
    box(trippingLatch, [0.14, 0.16, 1.35], [0.76, 1.56, -0.15], darkMat);
    const latchHandle = new T.Group();
    latchHandle.name = 'latch-handle';
    latchHandle.position.set(0.84, 1.66, -0.68);
    trippingLatch.add(latchHandle);
    box(latchHandle, [0.06, 0.54, 0.06], [0, 0.24, 0], brassMat, [0.25, 0, 0]);

    const elevatingRack = part('elevatingRack',
      'Paralel Yükseliş Kolu & El Çarkı', 'Parallel elevation link & handwheel',
      'Kaldıraç ve Karşı Ağırlık', 'Lever Arm & Counterweight',
      'Top siper arkasına düşerken bile yükleme açısını sabit tutan paralel arka yükseliş çubuğu.',
      'Parallel elevating bar linking the rear toothed quadrant to the gun breech.',
      [0, 0, 0], [0, 0.6, -0.8], false, carriageYaw
    );
    const elevSlider = box(elevatingRack, [0.18, 0.30, 0.26], [0, 1.90, -1.10], darkMat);
    ring(elevatingRack, 0.22, [0.45, 1.88, -1.10], brassMat, 0.022, [0, Math.PI / 2, 0]);
    const elevRod = cyl(elevatingRack, 0.035, 1, [0, 2.2, -1.2], steelMat);

    // -------------------------------------------------------------------------
    // D. 6 İNÇ M1905 TOP & YÜKLEME (5 Grup)
    // -------------------------------------------------------------------------
    const trunnionMount = new T.Group();
    trunnionMount.name = 'trunnion-mount';
    trunnionMount.position.set(0, 3.35, 0.22);
    carriageYaw.add(trunnionMount);

    const gunPivot = new T.Group();
    gunPivot.name = 'gun-pivot';
    trunnionMount.add(gunPivot);

    const barrel = part('barrel',
      '6 İnç (152 mm) L/50 M1905 Kıyı Topu Namlusu', '6-inch (152 mm) L/50 M1905 rifled barrel',
      '6 İnç M1905 Top ve Yükleme', '6-Inch M1905 Gun & Loading',
      'Mezride siperin üstünden aşan, atış sonrası tamamen 2,60 m beton duvarın arkasına çöken çelik namlu.',
      '7.6 m forged steel barrel rising clear of the 2.60 m parapet to fire and plunging behind cover.',
      [0, 0, 0], [0, 1.2, 0.6], false, gunPivot
    );
    cyl(barrel, 0.20, 1.45, [0, 0, -0.58], darkMat, 'z');
    cyl(barrel, 0.16, 1.55, [0, 0, 0.90], steelMat, 'z');
    cyl(barrel, 0.125, 1.40, [0, 0, 2.25], steelMat, 'z');
    cyl(barrel, 0.145, 0.14, [0, 0, 2.95], brassMat, 'z');

    const breech = part('breech',
      'Kesintili Vidalı Kama ve Menteşe', 'Interrupted-screw breech & carrier',
      '6 İnç M1905 Top ve Yükleme', '6-Inch M1905 Gun & Loading',
      'Yüksek basınçlı barut keselerini sızdırmaz biçimde kilitleyen hızlı açılır kama bloğu.',
      'Quick-acting interrupted-screw breech block unlocked only behind cover.',
      [0, 0, 0], [0, 1.0, -0.7], false, gunPivot
    );
    cyl(breech, 0.19, 0.24, [0, 0, -1.42], brassMat, 'z');
    box(breech, [0.16, 0.08, 0.16], [0.20, 0, -1.46], ironMat);

    const sightPlatform = part('sightPlatform',
      'Yan Nişancı Platformu ve Teleskop', 'Gunner sighting platform & telescope',
      '6 İnç M1905 Top ve Yükleme', '6-Inch M1905 Gun & Loading',
      'Nişancının hedefi görüp yükseliş ve yön çarklarını ayarladığı yan konsol.',
      'Lateral aiming console supporting the telescopic sight and deflection handwheels.',
      [0, 0, 0], [-0.9, 0.8, 0], false, carriageYaw
    );
    box(sightPlatform, [0.44, 0.08, 0.62], [-0.95, 2.02, -0.10], woodMat);
    cyl(sightPlatform, 0.03, 0.56, [-0.88, 2.48, 0.05], brassMat, 'z');

    const ammoTruck = part('ammoTruck',
      'Mermi Arabası ve 6 İnç Zırh Delici Mermiler', 'Shot truck & 6-inch AP shells',
      '6 İnç M1905 Top ve Yükleme', '6-Inch M1905 Gun & Loading',
      'Gizli yükleme platformunda 48 kg’lık 6 inç mermileri kamaya taşıyan tekerlekli el arabası.',
      'Protected shot truck ferrying 48 kg 6-inch armor-piercing projectiles behind the parapet.',
      [0, 0, 0], [0, 0.5, -1.1]
    );
    box(ammoTruck, [0.62, 0.12, 0.86], [-1.35, 1.48, -2.55], woodMat);
    for (const s of [-1, 1]) cyl(ammoTruck, 0.14, 0.06, [-1.35 + s * 0.34, 1.49, -2.55], ironMat, 'x');
    for (const dz of [-0.22, 0.08]) {
      cyl(ammoTruck, 0.075, 0.42, [-1.35, 1.75, -2.55 + dz], darkMat, 'y');
      mesh(ammoTruck, new T.ConeGeometry(0.075, 0.18, 12), brassMat, [-1.35, 2.05, -2.55 + dz]);
    }

    const muzzleFx = part('muzzleFx',
      'Siper Koruma Hattı (y = 2,60 m) & Ağız Alevi', 'Parapet cover line (y = 2.60 m) & muzzle blast',
      '6 İnç M1905 Top ve Yükleme', '6-Inch M1905 Gun & Loading',
      'Siper üst kenarını gösteren yatay mavi referans çizgisi ve ateşleme anındaki namlu parlaması.',
      'Reference plane marking the 2.60 m concrete parapet crest above the concealed reload zone.',
      [0, 0, 0], [0, 0.6, 0.9], false, gunPivot
    );
    // Sabit mavi kılavuz dikmesi (parçayı temsil eder) + sahne geneli siper seviyesi çizgisi
    box(muzzleFx, [0.06, 0.06, 0.24], [0, 0.20, 2.86], brassMat);
    const blastCone = new T.Mesh(new T.ConeGeometry(0.42, 1.35, 16), flashMat);
    blastCone.rotation.x = Math.PI / 2;
    blastCone.position.set(0, 0, 3.72);
    blastCone.visible = false;
    muzzleFx.add(blastCone);
    const coverGuideBar = new T.Mesh(new T.BoxGeometry(5.50, 0.04, 0.08), guideMat);
    coverGuideBar.position.set(0, Y_PARAPET + 0.02, 1.65);
    root.add(coverGuideBar);

    // -------------------------------------------------------------------------
    // E. KİNEMATİK SENKRONİZASYON
    // -------------------------------------------------------------------------
    function sync() {
      carriageYaw.rotation.y = (state.traverseDeg * Math.PI) / 180;
      const u = 1 - state.batteryPct / 100; // 0 = mevzi, 1 = gizli
      const alpha = 0.12 + u * (1.18 - 0.12);

      const zAxle = Z_CW - L_BOT * Math.sin(alpha);
      const yCw = Y_RAIL - L_BOT * Math.cos(alpha);
      const zTrun = zAxle - L_TOP * Math.sin(alpha);
      const yTrun = Y_RAIL + L_TOP * Math.cos(alpha);

      topCarriageMove.position.set(0, Y_RAIL, zAxle);
      cwBlock.position.set(0, yCw, Z_CW);

      leverLeft.position.set(-0.56, yCw, Z_CW);
      leverRight.position.set(0.56, yCw, Z_CW);
      leverLeft.rotation.x = -alpha;
      leverRight.rotation.x = -alpha;

      trunnionMount.position.set(0, yTrun, zTrun);
      gunPivot.rotation.x = (-state.elevDeg * Math.PI) / 180;

      // Bağlı hidrolik fren piston çubukları
      stretch(pistonL, [-0.62, Y_RAIL + 0.14, 0.92], [-0.62, Y_RAIL + 0.14, zAxle]);
      stretch(pistonR, [0.62, Y_RAIL + 0.14, 0.92], [0.62, Y_RAIL + 0.14, zAxle]);

      // Paralel arka yükseliş çubuğu
      const elevRad = (state.elevDeg * Math.PI) / 180;
      const breechPos = [0, yTrun - Math.sin(elevRad) * 1.15, zTrun - Math.cos(elevRad) * 1.15];
      stretch(elevRod, [0, 1.92, -1.10], breechPos);
      elevSlider.position.z = -1.10;

      // Mandal kolu konumu
      latchHandle.rotation.x = state.batteryPct < 10 ? 0.45 : -0.25;

      blastCone.visible = state.recoilFlash > 0;
      coverGuideBar.visible = state.showCoverLine;
    }

    function reset() {
      Object.assign(state, {
        traverseDeg: 0,
        elevDeg: 8,
        batteryPct: 100,
        showCoverLine: true,
        ammo: 12,
        recoilActive: false,
        recoilFlash: 0,
        raisingActive: false
      });
      sync();
    }

    const camPresets = {
      iso: { pos: [8.6, 5.4, 8.8], look: [0, 2.0, -0.3] },
      front: { pos: [0.4, 3.8, 9.8], look: [0, 2.2, 0.8] },
      breech: { pos: [-4.6, 3.4, -7.2], look: [0, 2.0, -1.0] },
      engine: { pos: [5.4, 2.6, 0.4], look: [0, 1.9, -0.3] },
      suspension: { pos: [3.8, 2.2, 2.8], look: [0, 1.5, 0.1] },
      top: { pos: [0.1, 11.4, 0.2], look: [0, 2.0, 0] }
    };

    const tourSteps = [
      [['2,60 m Beton Siper Üstü Atış Mevzii', 'Elevated 2.60 m firing battery'], ['Endicott dönemi kıyı topu yalnızca ateşlemek için beton göğüslüğün üzerine çıkar ve tüm ufku görür.', 'The 6-inch rifle rises above the thick concrete parapet only for the instant of aiming and firing.'], 'iso', 'barrel', false],
      [['İkiz 2,70 m Paralel Kaldıraç Kolları', 'Twin 2.70 m parallel gun levers'], ['X-Ray’i açın: kaldıraç kolu orta mili kızakta kayarken üst muyluyu aşağı ve geriye doğru yay çizerek indirir.', 'Turn on X-Ray: as the center axle slides aft, the lever arcs the gun downward behind the wall.'], 'engine', 'gunLevers', true],
      [['Kurşun Karşı Ağırlık Kuyusu', 'Vertical lead counterweight well'], ['Silah geriye çöktüğünde kuyu içindeki ağır kurşun blok yukarı yükselerek geri tepme enerjisini potansiyel enerjiye çevirir.', 'As the gun drops, the lead counterweight is hoisted up inside the concrete pit to store recoil energy.'], 'engine', 'counterweight', true],
      [['Hidrolik Geri Tepme Fren Silindirleri', 'Hydraulic recoil brake cylinders'], ['Kızak arabasındaki yağ dolu silindirler kalan şoku emerek mekanizmanın betona çarpmasını önler.', 'Twin oil-filled cylinders inside the sliding top carriage smoothly brake the final inches of recoil.'], 'suspension', 'topCarriage', false],
      [['Dişli Mandal & Güvenli Yükleme', 'Tripping pawls & protected reload'], ['Top %0 konuma indiğinde tırnaklı mandalla kilitlenir; ekip siper arkasında güvenle yeniden doldurur.', 'Pawls latch the retracted gun behind the 2.60 m parapet so crews reload unseen by enemy ships.'], 'breech', 'trippingLatch', false],
      [['Ateşle → Geri Tepip Gizlen → Mandalı Bırak', 'Fire → Retract → Release latch'], ['Ateşle düğmesiyle topun kendiliğinden çökmesini izleyin; ardından mod düğmesiyle mandalı bırakıp kaldırın.', 'Press Fire to see recoil drop the gun automatically, then release the latch to swing back up.'], 'iso', 'muzzleFx', false]
    ].map(([title, desc, cam, key, cutaway]) => ({
      title: t(...title), desc: t(...desc), cam, part: parts[key], cutaway, explode: 0, sub: 'all'
    }));

    const ui = K.ui({
      cameraPadding: 0.85,
      title: t('BUFFINGTON–CROZIER — 1895 KAYBOLAN KIYI TOPU', 'BUFFINGTON–CROZIER — 1895 DISAPPEARING GUN'),
      sub: t('6 İnç M1905 • Paralel Kaldıraç & Kurşun Karşı Ağırlık • Siper Koruma Kundağı', '6-Inch M1905 • Parallel Lever & Lead Counterweight • Disappearing Carriage'),
      subsystems: Object.entries(counts).map(([key, count]) => ({ key, label: key, count, color: '#3b443e' })),
      camLabels: Object.fromEntries(Object.entries({
        iso: ['Genel Sergi', 'Full exhibit'],
        front: ['Deniz Cephesi', 'Seaward parapet'],
        breech: ['Yükleme Platformu', 'Loading gallery'],
        engine: ['X-Ray Kuyu & Kaldıraç', 'X-Ray Pit & Levers'],
        suspension: ['Hidrolik Fren & Rulman', 'Recoil brake & track'],
        top: ['Üst Görünüş', 'Top view']
      }).map(([k, v]) => [k, t(...v)])),
      sliders: [
        [['Yön Açısı (Traverse)', 'Traverse angle'], -60, 60, '°'],
        [['Namlu Yükseliş Açısı', 'Gun elevation'], -5, 20, '°'],
        [['Mevzi Konumu (Gizli ↔ Siper Üstü)', 'Battery position (Cover ↔ Fire)'], 0, 100, '%']
      ].map(([labels, min, max, unit]) => ({
        label: t(...labels), min, max, step: 1, fmt: v => Math.round(v) + unit
      })),
      buttons: {
        terrain: t('Siper Koruma Hattı (2,6 m)', 'Parapet cover line (2.6 m)'),
        sweep: t('Sistemi Sıfırla', 'Reset system'),
        mode: true
      },
      telemetryTag: t('M1903 KUNDAK • 152 MM • KARŞI AĞIRLIK', 'M1903 CARRIAGE • 6-IN • COUNTERWEIGHT'),
      statLabels: [
        ['KUNDAK KONUMU', 'CARRIAGE STATE'],
        ['MUYLU YÜKSEKLİĞİ', 'TRUNNION HEIGHT'],
        ['KARŞI AĞIRLIK', 'COUNTERWEIGHT'],
        ['HAZIR MERMİ', 'SHELLS READY']
      ].map(v => t(...v))
    });

    sync();

    return {
      root, parts, ui, camPresets, tourSteps,
      defaultPart: parts.gunLevers, firePart: parts.barrel,
      trunnionMount, cwBlock, topCarriageMove,
      update(dt) {
        if (!Number.isFinite(dt)) return;
        dt = T.MathUtils.clamp(dt, 0, 0.05);
        if (state.recoilFlash > 0) state.recoilFlash = Math.max(0, state.recoilFlash - dt * 4.0);
        if (state.recoilActive) {
          state.batteryPct = Math.max(0, state.batteryPct - dt * 135);
          if (state.batteryPct <= 0) state.recoilActive = false;
        } else if (state.raisingActive) {
          state.batteryPct = Math.min(100, state.batteryPct + dt * 115);
          if (state.batteryPct >= 100) state.raisingActive = false;
        }
        sync();
      },
      onFire() {
        if (state.batteryPct < 85) {
          return { ok: false, msg: t('Top siper arkasında kilitli — önce mandalı bırakıp mevziye kaldırın.', 'Locked behind parapet — release tripping latch first.') };
        }
        if (state.recoilActive) return { ok: false };
        if (state.ammo <= 0) {
          state.ammo = 12;
          sync();
          return { ok: true, resupplied: true };
        }
        state.ammo--;
        state.recoilFlash = 1.0;
        state.recoilActive = true;
        state.raisingActive = false;
        sync();
        if (ctx.audio?.playCannonFire) ctx.audio.playCannonFire();
        return { ok: true };
      },
      fireButtonLabel: () => {
        if (state.batteryPct < 85) return t('SİPER ARKASI KİLİTLİ', 'LOCKED BEHIND COVER');
        return t(state.ammo > 0 ? '6 İNÇ ATEŞLE & ÇÖK' : 'MERMİ İKMALİ (12)', state.ammo > 0 ? 'FIRE 6-IN & RETRACT' : 'RESUPPLY SHELLS (12)');
      },
      mobileFireButtonLabel: () => {
        if (state.batteryPct < 85) return t('KİLİTLİ', 'LOCKED');
        return t(state.ammo > 0 ? 'ATEŞLE' : 'İKMAL', state.ammo > 0 ? 'FIRE' : 'RELOAD');
      },
      modeLabel: () => state.batteryPct < 85
        ? t('Mandalı Bırak (Mevziye Kaldır)', 'Release Latch (Raise to Battery)')
        : t('Mevzi Hazır (Ateşleme Açık)', 'In Battery (Ready to Fire)'),
      onSlider(i, v) {
        if (!Number.isFinite(v)) return {};
        const clamped = T.MathUtils.clamp(v, ui.sliders[i].min, ui.sliders[i].max);
        if (i === 0) state.traverseDeg = clamped;
        else if (i === 1) state.elevDeg = clamped;
        else if (i === 2) {
          state.batteryPct = clamped;
          state.recoilActive = false;
          state.raisingActive = false;
        }
        sync();
        return {};
      },
      onButton(name) {
        if (name === 'terrain') {
          state.showCoverLine = !state.showCoverLine;
          sync();
        } else if (name === 'sweep') {
          reset();
        } else if (name === 'mode') {
          state.raisingActive = true;
          state.recoilActive = false;
        }
        return {};
      },
      buttonActive: name => (name === 'terrain' && state.showCoverLine) || (name === 'mode' && state.batteryPct >= 85),
      getSliderValues: () => [state.traverseDeg, state.elevDeg, state.batteryPct],
      getStats: () => [
        state.batteryPct >= 85 ? t('MEVZİDE', 'IN BATTERY') : state.batteryPct <= 5 ? t('GİZLİ (KİLİTLİ)', 'CONCEALED') : t('HAREKET HALİNDE', 'IN TRANSIT'),
        trunnionMount.position.y.toFixed(2) + ' m',
        cwBlock.position.y.toFixed(2) + ' m',
        String(state.ammo)
      ],
      getStatus: () => ({
        text: state.recoilActive
          ? t('GERİ TEPME: NAMLU SİPER ARKASINA ÇÖKÜYOR', 'RECOIL STROKE: DROPPING BEHIND PARAPET')
          : state.batteryPct < 85
            ? t('SİPER ARKASINDA GÜVENLİ DOLUM • MANDAL KİLİTLİ', 'CONCEALED BEHIND 2.6 M WALL • SAFE RELOAD')
            : t('2,60 M SİPER ÜSTÜNDE • ATIŞA HAZIR', 'ELEVATED ABOVE PARAPET • READY TO FIRE'),
        color: state.recoilActive ? '#f97316' : state.batteryPct < 85 ? '#d97706' : '#0284c7'
      }),
      applyTextures: K.applyTextures,
      setTexture: K.setTexture,
      toggleRelief: K.toggleRelief
    };
  };
})();
