/* =============================================================================
 * Osmanlı Şahi Topu — Dardanelles Gun (1464) 3D Araç Modülü (13 mekanik grup)
 * Klasik script olarak yüklenir; sayfa file:// ile açıldığında da çalışır.
 *
 * Ölçü referansı: Royal Armouries / Fort Nelson'daki Dardanelles Gun
 *   - Toplam uzunluk ≈ 5,18 m, ağırlık ≈ 16,8 t, ağız iç çapı ≈ 63 cm
 *   - Birbirine vidalanan iki parça (ön namlu + arka barut odası)
 *   - 1464'te Munir Ali tarafından dökülmüştür; 1453 kuşatma toplarının
 *     günümüze ulaşan en yakın örneği kabul edilir.
 *
 * "tahmini" diye işaretlenen değerler (barut odası çapı, barut miktarı,
 * manivela yuvası sayısı, diş adımı, parça ağırlık dağılımı, ilk hız)
 * kaynakla doğrulanmamış mühendislik varsayımlarıdır.
 * ========================================================================== */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.sahi1453 = function buildSahi(ctx) {
    const { THREE, scene, MATS, addCADMesh, createPartGroup, muzzleLight } = ctx;

    // ------------------------------------------------------------------------
    // ÖLÇÜLER (sahne birimi = 1 metre)
    // ------------------------------------------------------------------------
    const DIM = {
      frontLength: 2.62,        // ön parça
      breechLength: 2.56,       // arka parça (toplam ≈ 5,18 m)
      boreRadius: 0.315,        // 63 cm ağız
      ballRadius: 0.305,        // 61 cm gülle (rüzgârlık payı)
      chamberRadius: 0.125,     // 25 cm barut odası (tahmini)
      outerRadius: 0.45,
      collarRadius: 0.50,
      threadRadius: 0.355,
      threadLength: 0.30,
      threadPitch: 0.06,        // tahmini
      screwTravel: 0.55,        // arka parçanın vidadan tamamen kurtulma mesafesi
      axisHeightBattle: 0.95,   // atış mevziinde namlu ekseni yüksekliği
      axisHeightTransport: 1.78,
      pivotZ: -2.25,            // yükseliş pivotu (arka eyer)
      quoinZ: 1.75,             // ön destek kütüğü konumu
      recoilDistance: 0.45,
      transportGap: 0.6,        // nakliyede iki parça arasına eklenen açıklık
      graniteDensity: 2650,     // kg/m³
      powderDensity: 950,       // kg/m³ (kara barut yığın yoğunluğu)
      powderLength: 1.45,
      powderRadius: 0.115,
      muzzleVelocity: 175       // m/sn (tahmini)
    };
    const seatZ = DIM.threadLength + 0.08 + DIM.ballRadius;            // takoz + keçe + gülle yarıçapı
    const ramTravel = DIM.frontLength - DIM.ballRadius - seatZ;          // ağızdan yatağa sürülme mesafesi
    const specs = Object.assign({}, DIM, {
      seatZ,
      ramTravel,
      totalLength: DIM.frontLength + DIM.breechLength,
      ballMassKg: Math.round((4 / 3) * Math.PI * Math.pow(DIM.ballRadius, 3) * DIM.graniteDensity),
      powderKg: Math.round(Math.PI * DIM.powderRadius * DIM.powderRadius * DIM.powderLength * DIM.powderDensity)
    });

    // ------------------------------------------------------------------------
    // YARDIMCILAR & YEREL MALZEMELER
    // ------------------------------------------------------------------------
    MATS.sahiBronzeOuter.side = THREE.DoubleSide; // içi boş namlu kesitte görünsün
    // Granit: çevre yansımalı Gerçekçi Modda beyaz görünmemesi için koyu, mat gri
    MATS.sahiGranite.color.setHex(0x6e7074);
    MATS.sahiGranite.roughness = 0.95;
    const earthMat = new THREE.MeshStandardMaterial({ color: 0x6b553a, roughness: 1.0, metalness: 0.0 });
    const wickerMat = new THREE.MeshStandardMaterial({ color: 0x6e5230, roughness: 0.95, metalness: 0.0 });
    const AXIAL = [Math.PI / 2, 0, 0]; // Lathe/Silindir Y ekseni → namlu Z ekseni
    const lathe = (pts, segs = 56) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), segs);

    function addSockets(parent, z, count) {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const r = DIM.collarRadius - 0.015;
        addCADMesh(parent, new THREE.BoxGeometry(0.05, 0.09, 0.11), MATS.rubberTire,
          [Math.cos(a) * r, Math.sin(a) * r, z], [0, 0, a], false);
      }
    }

    // ------------------------------------------------------------------------
    // HİYERARŞİ
    //   sahiRoot ─┬─ battleGroup (kalas yatak, tabya, arka tampon)   [Atış Mevzii]
    //             ├─ transportGroup (öküz arabaları)                 [Nakliye]
    //             ├─ cephane istifi, topçu aletleri                  [her iki mod]
    //             └─ recoilGroup ─┬─ sledGroup (kızak, ön destek)
    //                             └─ gunLift → elevPivot → gunBody (top parçaları)
    // ------------------------------------------------------------------------
    const sahiRoot = new THREE.Group();
    sahiRoot.visible = false;
    scene.add(sahiRoot);

    const battleGroup = new THREE.Group();
    sahiRoot.add(battleGroup);
    const transportGroup = new THREE.Group();
    transportGroup.visible = false;
    sahiRoot.add(transportGroup);

    const recoilGroup = new THREE.Group();
    sahiRoot.add(recoilGroup);
    const sledGroup = new THREE.Group();
    recoilGroup.add(sledGroup);
    const gunLift = new THREE.Group();
    gunLift.position.y = DIM.axisHeightBattle;
    recoilGroup.add(gunLift);
    const elevPivot = new THREE.Group();
    elevPivot.position.z = DIM.pivotZ;
    gunLift.add(elevPivot);
    const gunBody = new THREE.Group();
    gunBody.position.z = -DIM.pivotZ;
    elevPivot.add(gunBody);

    // ========================================================================
    // A. İKİ PARÇALI TUNÇ GÖVDE (barrel)
    // ========================================================================
    // 1. Ön parça — içi boş döner profil
    const partFront = createPartGroup({
      id: 'sahi_barrel',
      name: 'Ön Namlu Parçası (Tunç Döküm) & Kabartma Bilezikleri',
      subsystem: 'barrel',
      subLabel: 'ALT SİSTEM: İKİ PARÇALI TUNÇ GÖVDE',
      desc: 'Topun ön yarısı. İç çapı yaklaşık 63 cm olan namlu taş gülleye yön verir. Arka ucunda, arka parçanın vidalandığı dişi yuva ve karşı tutmak için manivela yuvalı kalın bir bilezik bulunur. Ağız kısmı, patlama basıncına karşı kalınlaştırılmıştır. X-Ray modunda namlunun içi boş olduğu ve gülleyle aradaki küçük boşluk görülebilir.',
      material: 'Kalay-Tunç Döküm',
      weight: '~8 t (tahmini, toplam 16,8 t)',
      spec: '~63 cm ağız / 2,62 m uzunluk',
      location: 'Topun ön yarısı',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.9, 2.2],
      isOuterShell: true
    });
    const frontShift = new THREE.Group();
    partFront.add(frontShift);
    addCADMesh(frontShift, lathe([
      [0.36, 0], [0.50, 0], [0.50, 0.30], [0.45, 0.34], [0.44, 1.15], [0.47, 1.18], [0.47, 1.32], [0.44, 1.35],
      [0.42, 2.30], [0.48, 2.38], [0.50, 2.55], [0.47, DIM.frontLength],
      [DIM.boreRadius, DIM.frontLength], [DIM.boreRadius, 0.34], [0.36, 0.32], [0.36, 0]
    ]), MATS.sahiBronzeOuter, [0, 0, 0], AXIAL);
    addSockets(frontShift, 0.15, 12); // yuva sayısı tahmini

    const flashMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.9, 2.8, 20, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
    );
    flashMesh.rotation.x = -Math.PI / 2; // dar uç namlu ağzında, geniş taban ileri bakar
    flashMesh.position.set(0, 0, DIM.frontLength + 1.4);
    frontShift.add(flashMesh);
    gunBody.add(partFront);

    // 2. Arka parça — barut odası, falya, manivela bileziği
    const partBreech = createPartGroup({
      id: 'sahi_breech',
      name: 'Arka Parça: Dar Barut Odası, Falya Deliği & Manivela Bileziği',
      subsystem: 'barrel',
      subLabel: 'ALT SİSTEM: İKİ PARÇALI TUNÇ GÖVDE',
      desc: 'Topun arka yarısı. İçinde namludan çok daha dar bir barut odası bulunur: dar oda, barutun gazını küçük bir hacimde tutarak basıncı yükseltir ve kalın tunç duvar bu basınca dayanır. Üstteki falya deliğinden ateşlenir. Ön ucundaki erkek vida ile ön parçaya vidalanır.',
      material: 'Kalay-Tunç Döküm',
      weight: '~8,8 t (tahmini)',
      spec: '~25 cm barut odası (tahmini)',
      location: 'Topun arka yarısı',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.9, -2.0],
      isOuterShell: true
    });
    const breechScrewGroup = new THREE.Group();
    partBreech.add(breechScrewGroup);
    addCADMesh(breechScrewGroup, lathe([
      [0, -DIM.breechLength], [0.22, -DIM.breechLength], [0.36, -2.50], [0.43, -2.38], [0.45, -2.25],
      [0.45, -1.02], [0.48, -0.98], [0.48, -0.84], [0.45, -0.80], [0.45, -0.34],
      [0.50, -0.30], [0.50, -0.01], [DIM.threadRadius - 0.02, -0.01],
      [DIM.chamberRadius, -0.01], [DIM.chamberRadius, -1.60], [0, -1.60]
    ]), MATS.sahiBronzeOuter, [0, 0, 0], AXIAL);
    addSockets(breechScrewGroup, -0.155, 12);
    addCADMesh(breechScrewGroup, new THREE.CylinderGeometry(0.08, 0.09, 0.05, 16), MATS.sahiBronzeBand, [0, 0.455, -1.45]);
    addCADMesh(breechScrewGroup, new THREE.CylinderGeometry(0.025, 0.025, 0.06, 10), MATS.rubberTire, [0, 0.462, -1.45], [0, 0, 0], false);
    gunBody.add(partBreech);

    // 3. Erkek vida boynu
    const partThreads = createPartGroup({
      id: 'sahi_threads',
      name: 'Erkek Vida Boynu & Bakır Sızdırmazlık Bileziği',
      subsystem: 'barrel',
      subLabel: 'ALT SİSTEM: İKİ PARÇALI TUNÇ GÖVDE',
      desc: 'Arka parçanın önündeki dişli boyun, ön parçanın içindeki dişi yuvaya vidalanır. Böylece 16,8 tonluk top iki ayrı yük halinde taşınıp mevzide birleştirilebilir. Boynun içinden barut odasının ağzı geçer. "Vidalı Gövde Sökme" kaydırıcısında dönüş miktarı diş adımına göre hesaplanır: vida her tam turda bir diş adımı kadar ilerler.',
      material: 'Kalay-Tunç (arka parçayla tek döküm)',
      weight: 'Arka parçaya dahil',
      spec: `${Math.round(DIM.threadPitch * 100)} cm diş adımı (tahmini)`,
      location: 'İki parçanın birleşim yeri',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.8, -0.6],
      isOuterShell: false
    });
    const threadSpinGroup = new THREE.Group();
    partThreads.add(threadSpinGroup);
    addCADMesh(threadSpinGroup, lathe([
      [DIM.chamberRadius, -0.02], [DIM.threadRadius - 0.012, -0.02],
      [DIM.threadRadius - 0.012, DIM.threadLength], [DIM.chamberRadius, DIM.threadLength], [DIM.chamberRadius, -0.02]
    ], 40), MATS.sahiThreadGold, [0, 0, 0], AXIAL);
    for (let z = 0.03; z < DIM.threadLength; z += DIM.threadPitch) {
      addCADMesh(threadSpinGroup, new THREE.TorusGeometry(DIM.threadRadius - 0.01, 0.014, 8, 40), MATS.brassAmmo, [0, 0, z], [0, 0, 0], false);
    }
    addCADMesh(threadSpinGroup, new THREE.TorusGeometry(0.42, 0.022, 10, 40), MATS.radiatorCopper, [0, 0, -0.012], [0, 0, 0], false);
    gunBody.add(partThreads);

    // 4. Manivelalar
    const partLevers = createPartGroup({
      id: 'sahi_levers',
      name: 'Meşe Vidalama Manivelaları (Demir Uçlu)',
      subsystem: 'barrel',
      subLabel: 'ALT SİSTEM: İKİ PARÇALI TUNÇ GÖVDE',
      desc: 'Arka parçanın bileziğindeki yuvalara sokulan kalın meşe kollar. Ön parça sabit tutulurken arka parça bu kollarla çevrilir. Kol yaklaşık 60° döndürüldükten sonra bir sonraki yuvaya takılır; vida tamamen açılana kadar bu işlem tekrarlanır. Simülasyondaki "geri sıçrayan" kol hareketi bu yuva değiştirmeyi gösterir.',
      material: 'Meşe & Dövme Demir',
      weight: '~60 kg (2 kol)',
      spec: '1,2 m kol boyu',
      location: 'Arka parça bileziği',
      basePos: [0, 0, -0.155],
      explodeVec: [0, 1.4, -1.2],
      isOuterShell: false
    });
    const leverSwingGroup = new THREE.Group();
    partLevers.add(leverSwingGroup);
    [Math.PI / 6, (Math.PI * 5) / 6].forEach(a => {
      const r0 = DIM.collarRadius - 0.05;
      const len = 1.2;
      const rc = r0 + len / 2;
      addCADMesh(leverSwingGroup, new THREE.CylinderGeometry(0.035, 0.045, len, 10), MATS.sahiOakTimber,
        [Math.cos(a) * rc, Math.sin(a) * rc, 0], [0, 0, a - Math.PI / 2]);
      const rt = r0 + 0.06;
      addCADMesh(leverSwingGroup, new THREE.CylinderGeometry(0.05, 0.05, 0.14, 10), MATS.sahiWroughtIron,
        [Math.cos(a) * rt, Math.sin(a) * rt, 0], [0, 0, a - Math.PI / 2]);
    });
    gunBody.add(partLevers);

    // ========================================================================
    // B. İÇ BALİSTİK (ballistics)
    // ========================================================================
    const ballCm = Math.round(DIM.ballRadius * 200);
    const partBall = createPartGroup({
      id: 'sahi_stoneball',
      name: `Taş Gülle (Ø ${ballCm} cm, ~${specs.ballMassKg} kg) & Keçe Tampon`,
      subsystem: 'ballistics',
      subLabel: 'ALT SİSTEM: İÇ BALİSTİK & MÜHİMMAT',
      desc: `Yontulmuş granit küre. Çapı namlu iç çapından biraz küçük tutulur; bu boşluğa "rüzgârlık" denir. Kütlesi çaptan hesaplanmıştır: ${ballCm} cm granit ≈ ${specs.ballMassKg} kg. Dolumda gülle namlu ağzından girer ve harbi ile barut odasının ağzına kadar sürülür. Arkasındaki keçe tampon, barut gazının gülleyi geçip kaçmasını azaltır.`,
      material: 'Granit & Keçe',
      weight: `~${specs.ballMassKg} kg (hesaplanan)`,
      spec: 'Granit yoğunluğu 2.650 kg/m³',
      location: 'Namlu içi, barut odası ağzının önü',
      basePos: [0, 0, seatZ],
      explodeVec: [0, 1.6, 2.6],
      isOuterShell: false
    });
    const ballGroup = new THREE.Group();
    partBall.add(ballGroup);
    addCADMesh(ballGroup, new THREE.SphereGeometry(DIM.ballRadius, 28, 20), MATS.sahiGranite);
    addCADMesh(ballGroup, new THREE.CylinderGeometry(DIM.ballRadius + 0.005, DIM.ballRadius + 0.005, 0.08, 24), MATS.sahiRopeHemp,
      [0, 0, -(DIM.ballRadius + 0.04)], AXIAL);
    gunBody.add(partBall);

    const partPowder = createPartGroup({
      id: 'sahi_powder',
      name: `Barut Kesesi (~${specs.powderKg} kg, tahmini), Ahşap Takoz & Falya Kanalı`,
      subsystem: 'ballistics',
      subLabel: 'ALT SİSTEM: İÇ BALİSTİK & MÜHİMMAT',
      desc: 'Barut odasına keten keseler içinde kara barut doldurulur. Odanın ağzına çakılan ahşap takoz barutu sıkıştırır ve gülleyle arasında tampon oluşturur. Falya deliğine konan ince barut tutuşturulunca alev kanaldan odaya iner. Barut miktarı, tahmini oda hacminden hesaplanmıştır.',
      material: 'Kara Barut, Keten & Ahşap',
      weight: `~${specs.powderKg} kg barut (tahmini)`,
      spec: 'Güherçile-kömür-kükürt karışımı',
      location: 'Arka parçanın barut odası',
      basePos: [0, 0, 0],
      explodeVec: [0, 2.2, -1.6],
      isOuterShell: false
    });
    const powderFollow = new THREE.Group(); // arka parçayla birlikte geri çekilir
    partPowder.add(powderFollow);
    const powderGroup = new THREE.Group();
    powderFollow.add(powderGroup);
    const powderZc = -1.58 + DIM.powderLength / 2;
    addCADMesh(powderGroup, new THREE.CylinderGeometry(DIM.powderRadius, DIM.powderRadius, DIM.powderLength, 20), MATS.sahiPowderSack,
      [0, 0, powderZc], AXIAL);
    for (let k = -2; k <= 2; k++) {
      addCADMesh(powderGroup, new THREE.TorusGeometry(DIM.powderRadius + 0.003, 0.01, 6, 20), MATS.sahiRopeHemp,
        [0, 0, powderZc + k * 0.3], [0, 0, 0], false);
    }
    const tampionMesh = addCADMesh(powderFollow, new THREE.CylinderGeometry(DIM.chamberRadius - 0.003, DIM.chamberRadius - 0.003, 0.28, 18),
      MATS.sahiOakTimber, [0, 0, DIM.threadLength - 0.15], AXIAL);
    const primeMesh = addCADMesh(powderFollow, new THREE.CylinderGeometry(0.02, 0.02, 0.33, 8), MATS.brassAmmo,
      [0, (0.45 + DIM.chamberRadius) / 2, -1.45], [0, 0, 0], false);
    gunBody.add(partPowder);

    // ========================================================================
    // C. ATIŞ MEVZİİ & GERİ TEPME (carriage)
    // ========================================================================
    const partSled = createPartGroup({
      id: 'sahi_sled',
      name: 'Meşe Kızak & Eyer Takozları',
      subsystem: 'carriage',
      subLabel: 'ALT SİSTEM: ATIŞ MEVZİİ & GERİ TEPME',
      desc: 'Top, ateşte üzerinde geriye kayan iki uzun meşe kirişten oluşan bir kızağa oturtulur. Kirişleri bağlayan eyer takozları gövdeyi yerinde tutar. Tekerlekli bir arabaya göre çok daha sağlam olan bu düzen, büyük geri tepme kuvvetini kalas yatağa yayar.',
      material: 'Meşe & Dövme Demir Kuşak',
      weight: '~2,5 t (tahmini)',
      spec: '5 m kızak boyu',
      location: 'Topun altı',
      basePos: [0, 0, 0],
      explodeVec: [0, -0.6, 0],
      isOuterShell: false
    });
    [-0.38, 0.38].forEach(x => {
      addCADMesh(partSled, new THREE.BoxGeometry(0.26, 0.30, 5.0), MATS.sahiOakTimber, [x, 0.30, -0.1]);
      for (let s = -3; s <= 3; s++) {
        addCADMesh(partSled, new THREE.BoxGeometry(0.28, 0.32, 0.06), MATS.sahiWroughtIron, [x, 0.30, -0.1 + s * 0.75], [0, 0, 0], false);
      }
      addCADMesh(partSled, new THREE.TorusGeometry(0.09, 0.025, 8, 16), MATS.sahiWroughtIron, [x, 0.30, -2.62], [0, Math.PI / 2, 0], false);
    });
    [-1.8, -0.4, 1.0].forEach(z => {
      addCADMesh(partSled, new THREE.BoxGeometry(1.02, 0.12, 0.26), MATS.sahiOakTimber, [0, 0.44, z]);
    });
    sledGroup.add(partSled);

    const partQuoins = createPartGroup({
      id: 'sahi_quoins',
      name: 'Ön Destek Kütüğü & Yükseliş Kaması',
      subsystem: 'carriage',
      subLabel: 'ALT SİSTEM: ATIŞ MEVZİİ & GERİ TEPME',
      desc: 'Namlunun ağız tarafı, üst üste konmuş kalaslardan oluşan bir destek kütüğüne ve üzerindeki kamaya dayanır. Topçular kamayı çakarak veya kalas ekleyerek namluyu yükseltirdi; top arka eyerin üzerinde döner. Sağ paneldeki açı değiştikçe kütük yükselir.',
      material: 'Meşe Kalas & Gürgen Kama',
      weight: '~300 kg',
      spec: '0° – 14° yükseliş',
      location: 'Namlunun ağız tarafı altı',
      basePos: [0, 0, DIM.quoinZ],
      explodeVec: [0, -0.4, 1.6],
      isOuterShell: false
    });
    const cribGroup = new THREE.Group();
    partQuoins.add(cribGroup);
    addCADMesh(cribGroup, new THREE.BoxGeometry(0.9, 1, 0.55), MATS.sahiOakTimber);
    const wedgeGroup = new THREE.Group();
    partQuoins.add(wedgeGroup);
    addCADMesh(wedgeGroup, new THREE.BoxGeometry(0.7, 0.07, 0.6), MATS.woodTool, [0, 0, 0], [0.08, 0, 0]);
    sledGroup.add(partQuoins);

    const partBed = createPartGroup({
      id: 'sahi_bed',
      name: 'Kalas Atış Yatağı & Toprak Tabya (Gabyonlu)',
      subsystem: 'carriage',
      subLabel: 'ALT SİSTEM: ATIŞ MEVZİİ & GERİ TEPME',
      desc: 'Bu büyüklükteki toplar tekerlekli bir arabadan değil, zemine yerleştirilmiş kalın kalaslardan oluşan bir yataktan ateşlenirdi. Öndeki toprak tabya ve toprakla doldurulmuş hasır sepetler (gabyon) topçuları surlardan gelen atışlara karşı korur; atış ortadaki alçak eşiğin üzerinden yapılır.',
      material: 'Meşe Kalas, Toprak & Hasır',
      weight: 'Sabit mevzi',
      spec: '7,2 m yatak boyu',
      location: 'Mevzi zemini ve önü',
      basePos: [0, 0, 0],
      explodeVec: [0, -0.9, 0.6],
      isOuterShell: false
    });
    addCADMesh(partBed, new THREE.BoxGeometry(2.4, 0.15, 7.2), MATS.sahiOakTimber, [0, 0.075, -0.3]);
    for (let i = 1; i < 12; i++) {
      addCADMesh(partBed, new THREE.BoxGeometry(2.42, 0.006, 0.03), MATS.rubberTire, [0, 0.152, -3.9 + i * 0.6], [0, 0, 0], false);
    }
    [-1.35, 1.35].forEach(x => {
      addCADMesh(partBed, new THREE.BoxGeometry(1.4, 1.3, 1.6), earthMat, [x, 0.65, 3.6]);
      [-0.35, 0.35].forEach(dx => {
        addCADMesh(partBed, new THREE.CylinderGeometry(0.32, 0.32, 0.62, 14), wickerMat, [x + dx, 1.61, 3.6]);
      });
    });
    addCADMesh(partBed, new THREE.BoxGeometry(1.3, 0.45, 1.6), earthMat, [0, 0.225, 3.6]);
    battleGroup.add(partBed);

    const partRecoil = createPartGroup({
      id: 'sahi_recoil',
      name: 'Arka Tampon Kirişi, Kazıklar & Kenevir Halatlar',
      subsystem: 'carriage',
      subLabel: 'ALT SİSTEM: ATIŞ MEVZİİ & GERİ TEPME',
      desc: 'Ateşte top kızağıyla birlikte geriye kayar ve orada kalır. Arkada zemine çakılı kazıklarla desteklenen kalın tampon kirişi ve kızağa bağlı kenevir halatlar bu hareketi sınırlar. Top kendiliğinden ileri gelmez: topçular onu halat ve manivelalarla yeniden atış konumuna çeker (Otomatik Dolum\'un ilk adımı).',
      material: 'Meşe & Kenevir Halat',
      weight: 'Sabit mevzi',
      spec: `~${Math.round(DIM.recoilDistance * 100)} cm geri tepme payı`,
      location: 'Mevzinin arkası',
      basePos: [0, 0, -3.45],
      explodeVec: [0, 0.3, -1.8],
      isOuterShell: false
    });
    addCADMesh(partRecoil, new THREE.BoxGeometry(2.4, 0.5, 0.4), MATS.sahiOakTimber, [0, 0.40, 0]);
    for (let i = 0; i < 6; i++) {
      const x = -1.05 + i * 0.42;
      addCADMesh(partRecoil, new THREE.CylinderGeometry(0.1, 0.085, 1.3, 12), MATS.sahiOakTimber, [x, 0.5, -0.36]);
      addCADMesh(partRecoil, new THREE.CylinderGeometry(0.11, 0.11, 0.1, 12), MATS.sahiWroughtIron, [x, 1.18, -0.36]);
      addCADMesh(partRecoil, new THREE.BoxGeometry(0.12, 0.12, 0.9), MATS.sahiOakTimber, [x, 0.2, -0.8], [-0.45, 0, 0]);
    }
    [-0.38, 0.38].forEach(x => {
      addCADMesh(partRecoil, new THREE.CylinderGeometry(0.04, 0.04, 0.95, 10), MATS.sahiRopeHemp, [x, 0.32, 0.62], AXIAL);
    });
    battleGroup.add(partRecoil);

    // ========================================================================
    // D. NAKLİYE & LOJİSTİK (logistics)
    // ========================================================================
    const partWagon = createPartGroup({
      id: 'sahi_wagon',
      name: 'Öküz Arabaları (Nakliye Modu: İki Parça Ayrı)',
      subsystem: 'logistics',
      subLabel: 'ALT SİSTEM: NAKLİYE & KUŞATMA LOJİSTİĞİ',
      desc: 'Vidalı yapının asıl amacı buydu: top sökülür ve iki parçası ayrı ağır arabalarla, çok sayıda öküz çiftiyle taşınırdı. Büyük kuşatma toplarının Edirne\'den İstanbul önlerine getirilişinde yolların düzeltildiği ve köprüler kurulduğu anlatılır. Bu modda top ateş edilemez.',
      material: 'Meşe & Dövme Demir Çember',
      weight: '~1,5 t / araba (tahmini)',
      spec: '2 araba, çok çiftli öküz koşumu',
      location: 'Nakliye düzeni',
      basePos: [0, 0, 0],
      explodeVec: [0, -0.8, 0],
      isOuterShell: false
    });
    function buildWagon(zc, withDrawbar) {
      [-0.85, 0.85].forEach(dz => {
        addCADMesh(partWagon, new THREE.CylinderGeometry(0.07, 0.07, 2.2, 12), MATS.sahiWroughtIron, [0, 0.55, zc + dz], [0, 0, Math.PI / 2]);
        [-1.0, 1.0].forEach(x => {
          addCADMesh(partWagon, new THREE.CylinderGeometry(0.55, 0.55, 0.16, 24), MATS.sahiWroughtIron, [x, 0.55, zc + dz], [0, 0, Math.PI / 2]);
          addCADMesh(partWagon, new THREE.CylinderGeometry(0.50, 0.50, 0.17, 24), MATS.sahiOakTimber, [x, 0.55, zc + dz], [0, 0, Math.PI / 2]);
          addCADMesh(partWagon, new THREE.CylinderGeometry(0.13, 0.13, 0.24, 12), MATS.sahiWroughtIron, [x, 0.55, zc + dz], [0, 0, Math.PI / 2]);
        });
      });
      [-0.42, 0.42].forEach(x => {
        addCADMesh(partWagon, new THREE.BoxGeometry(0.22, 0.20, 2.6), MATS.sahiOakTimber, [x, 0.95, zc]);
      });
      [-0.7, 0, 0.7].forEach(dz => {
        addCADMesh(partWagon, new THREE.BoxGeometry(1.1, 0.12, 0.24), MATS.sahiOakTimber, [0, 1.24 - 0.17, zc + dz]);
        addCADMesh(partWagon, new THREE.BoxGeometry(0.9, 0.12, 0.2), MATS.sahiOakTimber, [0, 1.24, zc + dz]);
      });
      if (withDrawbar) {
        addCADMesh(partWagon, new THREE.BoxGeometry(0.12, 0.12, 2.6), MATS.sahiOakTimber, [0, 0.62, zc + 2.6], [0.12, 0, 0]);
        addCADMesh(partWagon, new THREE.CylinderGeometry(0.06, 0.06, 1.6, 10), MATS.sahiOakTimber, [0, 0.48, zc + 3.85], [0, 0, Math.PI / 2]);
      }
    }
    const frontCenterZ = DIM.frontLength / 2 + DIM.transportGap;                          // ≈ 1,91
    const breechCenterZ = -DIM.breechLength / 2 - DIM.screwTravel - DIM.transportGap;     // ≈ -2,43
    buildWagon(frontCenterZ, true);
    buildWagon(breechCenterZ, true);
    transportGroup.add(partWagon);

    const partAmmo = createPartGroup({
      id: 'sahi_ammopile',
      name: 'Yedek Taş Gülle İstifi & Barut Fıçıları',
      subsystem: 'logistics',
      subLabel: 'ALT SİSTEM: NAKLİYE & KUŞATMA LOJİSTİĞİ',
      desc: `Mevzinin yanında kalas raf üzerinde bekletilen yedek granit gülleler (her biri ~${specs.ballMassKg} kg) ve deri örtülü barut fıçıları. Topa her dolumda istiften bir gülle alınır; telemetrideki gülle sayısı ile istifteki gülleler birlikte azalır.`,
      material: 'Granit & Demir Çemberli Meşe Fıçı',
      weight: `~${Math.round((specs.ballMassKg * 6) / 100) / 10} t gülle + barut`,
      spec: '6 gülle + 3 fıçı',
      location: 'Mevzinin sağ yanı',
      basePos: [2.45, 0, -0.9],
      explodeVec: [2.2, 0.4, 0],
      isOuterShell: false
    });
    addCADMesh(partAmmo, new THREE.BoxGeometry(0.95, 0.1, 2.1), MATS.sahiOakTimber, [0, 0.05, 0]);
    const pileBalls = [];
    [-0.64, 0, 0.64].forEach(z => {
      [-0.31, 0.31].forEach(x => {
        pileBalls.push(addCADMesh(partAmmo, new THREE.SphereGeometry(DIM.ballRadius, 20, 16), MATS.sahiGranite, [x, 0.1 + DIM.ballRadius, z]));
      });
    });
    [[-0.22, 0.32, -1.55], [0.3, 0.32, -1.55], [0.04, 0.96, -1.55]].forEach(p => {
      addCADMesh(partAmmo, new THREE.CylinderGeometry(0.24, 0.26, 0.64, 16), MATS.woodTool, p);
      addCADMesh(partAmmo, new THREE.CylinderGeometry(0.262, 0.262, 0.05, 16), MATS.sahiWroughtIron, [p[0], p[1] + 0.18, p[2]], [0, 0, 0], false);
      addCADMesh(partAmmo, new THREE.CylinderGeometry(0.262, 0.262, 0.05, 16), MATS.sahiWroughtIron, [p[0], p[1] - 0.18, p[2]], [0, 0, 0], false);
    });
    sahiRoot.add(partAmmo);

    const partTools = createPartGroup({
      id: 'sahi_tools',
      name: 'Islak Sünger, Harbi Sırığı, Su Kovası & Ateşleme Fitili',
      subsystem: 'logistics',
      subLabel: 'ALT SİSTEM: NAKLİYE & KUŞATMA LOJİSTİĞİ',
      desc: 'Her atıştan sonra namlu içindeki kıvılcımlar ıslak süngerle söndürülür ve sıcak tunç soğutulur; aksi halde yeni barut erken tutuşabilir. Harbi sırığı gülleyi yerine sürer, ucu yanan fitil sırığı (linstock) ile falya ateşlenir. Aşırı ısınan büyük tunç topların çatlayabildiği bilinir.',
      material: 'Dişbudak Sırık, Yapağı & Demir',
      weight: '~120 kg (takım)',
      spec: '4,2 m sırık boyu',
      location: 'Mevzinin sol yanı',
      basePos: [-2.3, 0, 0.2],
      explodeVec: [-2.2, 0.5, 0],
      isOuterShell: false
    });
    [-1.2, 1.2].forEach(z => {
      addCADMesh(partTools, new THREE.BoxGeometry(0.45, 0.52, 0.10), MATS.sahiOakTimber, [0, 0.26, z]);
    });
    addCADMesh(partTools, new THREE.CylinderGeometry(0.032, 0.032, 4.2, 10), MATS.woodTool, [-0.12, 0.55, 0], AXIAL);
    addCADMesh(partTools, new THREE.CylinderGeometry(0.29, 0.29, 0.30, 18), MATS.sahiOakTimber, [-0.12, 0.55, 2.15], AXIAL);
    addCADMesh(partTools, new THREE.CylinderGeometry(0.032, 0.032, 4.2, 10), MATS.woodTool, [0.14, 0.55, 0], AXIAL);
    addCADMesh(partTools, new THREE.CylinderGeometry(0.30, 0.28, 0.45, 18), MATS.sahiPowderSack, [0.14, 0.55, 2.15], AXIAL);
    addCADMesh(partTools, new THREE.CylinderGeometry(0.24, 0.19, 0.46, 16), MATS.sahiOakTimber, [0.05, 0.23, 1.85]);
    addCADMesh(partTools, new THREE.CylinderGeometry(0.025, 0.03, 1.65, 10), MATS.sahiWroughtIron, [0.05, 0.82, -1.75], [0.2, 0, 0]);
    addCADMesh(partTools, new THREE.SphereGeometry(0.06, 10, 10), MATS.brassAmmo, [0.05, 1.63, -1.58]);
    sahiRoot.add(partTools);

    // ========================================================================
    // E. EFEKTLER: KARA BARUT DUMANI, BUHAR & BALİSTİK UÇUŞ
    // ========================================================================
    const smokeTex = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g = c.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 2, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.5, 'rgba(240,240,236,0.55)');
      gr.addColorStop(1, 'rgba(230,230,225,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();
    const SMOKE_POOL = 48; // performans için sabit havuz
    const smokePool = [];
    for (let i = 0; i < SMOKE_POOL; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0xf1f0ea, transparent: true, opacity: 0, depthWrite: false }));
      s.visible = false;
      s.userData = { life: 0, max: 1, vel: new THREE.Vector3(), s0: 1, grow: 1, op0: 0.7 };
      scene.add(s);
      smokePool.push(s);
    }
    const tmpV = new THREE.Vector3();
    function emitSmoke(origin, dir, count, o) {
      let n = 0;
      for (const s of smokePool) {
        if (n >= count) break;
        if (s.visible) continue;
        const u = s.userData;
        u.life = 0;
        u.max = o.life * (0.7 + Math.random() * 0.6);
        u.s0 = o.size * (0.6 + Math.random() * 0.6);
        u.grow = o.grow * (0.7 + Math.random() * 0.6);
        u.op0 = o.opacity;
        s.material.color.setHex(o.color || 0xf1f0ea);
        s.position.copy(origin).addScaledVector(dir, Math.random() * 0.6);
        u.vel.copy(dir).multiplyScalar(o.speed * (0.3 + Math.random()));
        u.vel.x += (Math.random() - 0.5) * o.spread;
        u.vel.y += (Math.random() - 0.2) * o.spread;
        u.vel.z += (Math.random() - 0.5) * o.spread;
        s.scale.setScalar(u.s0);
        s.material.opacity = u.op0;
        s.visible = true;
        n++;
      }
    }
    function updateSmoke(dt) {
      for (const s of smokePool) {
        if (!s.visible) continue;
        const u = s.userData;
        u.life += dt;
        const t = u.life / u.max;
        if (t >= 1) { s.visible = false; continue; }
        s.position.addScaledVector(u.vel, dt);
        u.vel.multiplyScalar(Math.max(0, 1 - dt * 1.4)); // hava sürtünmesi
        u.vel.y += dt * 0.35;                            // sıcak dumanın yükselmesi
        s.scale.setScalar(u.s0 + u.grow * t);
        s.material.opacity = u.op0 * Math.pow(1 - t, 1.5);
      }
    }

    const flyBall = new THREE.Mesh(new THREE.SphereGeometry(DIM.ballRadius, 24, 18), MATS.sahiGranite.clone());
    flyBall.castShadow = true;
    flyBall.visible = false;
    scene.add(flyBall);
    const SLOWMO = 0.1; // gerçek hızın 1/10'u (yörünge şekli korunur)
    const G = 9.81;
    const flight = { t: 0, p0: new THREE.Vector3(), v0: new THREE.Vector3() };

    function muzzleWorld(out) {
      return gunBody.localToWorld(out.set(0, 0, DIM.frontLength + 0.05));
    }
    function muzzleDir(out) {
      const a = gunBody.localToWorld(new THREE.Vector3(0, 0, 0));
      return muzzleWorld(out).sub(a).normalize();
    }

    function fire() {
      const m = muzzleWorld(new THREE.Vector3());
      const d = muzzleDir(new THREE.Vector3());
      emitSmoke(m, d, 30, { life: 7, size: 1.4, grow: 6.5, speed: 7, spread: 2.2, opacity: 0.8 });
      const touch = gunBody.localToWorld(new THREE.Vector3(0, 0.5, -1.45));
      emitSmoke(touch, new THREE.Vector3(0, 1, 0), 5, { life: 3, size: 0.3, grow: 1.4, speed: 1.5, spread: 0.4, opacity: 0.6 });
      flight.t = 0;
      flight.p0.copy(m);
      flight.v0.copy(d).multiplyScalar(DIM.muzzleVelocity);
      flyBall.position.copy(m);
      flyBall.visible = true;
    }
    function puffSteam() {
      const m = muzzleWorld(new THREE.Vector3());
      const d = muzzleDir(new THREE.Vector3());
      emitSmoke(m, d, 8, { life: 2.6, size: 0.5, grow: 1.8, speed: 1.2, spread: 0.6, opacity: 0.55, color: 0xffffff });
    }

    // ========================================================================
    // F. HER KARE GÜNCELLEME
    // ========================================================================
    let screwEff = 0;
    let sep = 0;
    let gunBack = 0;

    function update(state, dt) {
      const transport = state.sahiMode === 'transport';

      battleGroup.visible = !transport;
      sledGroup.visible = !transport;
      transportGroup.visible = transport;
      partLevers.visible = !transport;

      gunLift.position.y += ((transport ? DIM.axisHeightTransport : DIM.axisHeightBattle) - gunLift.position.y) * Math.min(1, dt * 4);
      sep += ((transport ? DIM.transportGap : 0) - sep) * Math.min(1, dt * 3);
      frontShift.position.z = sep;

      // Vida: dönüş = ilerleme ÷ diş adımı × 2π. Nakliyede vida tamamen açılır ve parçalar ayrılır.
      const screwTarget = transport ? 1 : state.sahiScrewPct / 100;
      screwEff += (screwTarget - screwEff) * Math.min(1, dt * (transport ? 2 : 12));
      const shift = -screwEff * DIM.screwTravel - sep;
      const rot = ((screwEff * DIM.screwTravel) / DIM.threadPitch) * Math.PI * 2;
      breechScrewGroup.position.z = shift;
      breechScrewGroup.rotation.z = rot;
      threadSpinGroup.position.z = shift;
      threadSpinGroup.rotation.z = rot;
      powderFollow.position.z = shift;
      leverSwingGroup.position.z = shift;
      leverSwingGroup.rotation.z = rot % (Math.PI / 3); // 60° çevir, yuva değiştir

      // Yükseliş: top arka eyer üzerinde döner, ön destek kütüğü yükselir
      const elevTarget = transport ? 0 : THREE.MathUtils.degToRad(state.sahiElevDeg);
      elevPivot.rotation.x += (-elevTarget - elevPivot.rotation.x) * Math.min(1, dt * 8);
      const th = -elevPivot.rotation.x;
      const gunBottom = DIM.axisHeightBattle - 0.43 + (DIM.quoinZ - DIM.pivotZ) * Math.tan(th);
      const cribH = Math.max(0.02, gunBottom - 0.07 - 0.45);
      cribGroup.scale.y = cribH;
      cribGroup.position.y = 0.45 + cribH / 2;
      wedgeGroup.position.y = 0.45 + cribH + 0.035;

      // Geri tepme: top hızla geri kayar ve orada kalır; topçular onu dolumun ilk adımında geri çeker
      const backTarget = state.sahiGunBack ? DIM.recoilDistance : 0;
      gunBack += (backTarget - gunBack) * Math.min(1, dt * (state.sahiGunBack ? 14 : 1.5));
      recoilGroup.position.z = -gunBack;

      if (state.recoilProgress > 0.001) {
        state.recoilProgress = Math.max(0, state.recoilProgress - dt * 1.6);
        const pulse = Math.sin(state.recoilProgress * Math.PI);
        recoilGroup.rotation.x = -pulse * 0.02; // burun hafifçe kalkar
        const fl = state.recoilProgress > 0.8 ? (state.recoilProgress - 0.8) * 5 : 0;
        flashMesh.material.opacity = fl * 0.9;
        flashMesh.scale.setScalar(0.6 + fl * 0.8);
        if (muzzleLight) {
          muzzleWorld(muzzleLight.position);
          muzzleLight.intensity = fl * 20;
        }
      } else {
        recoilGroup.rotation.x *= 0.9;
        flashMesh.material.opacity = 0;
        if (muzzleLight) muzzleLight.intensity = 0;
      }

      // Dolum durumunun görselleştirilmesi
      const showCharge = !transport;
      ballGroup.visible = showCharge && state.sahiLoaded;
      ballGroup.position.z = (1 - state.sahiRammerPct / 100) * ramTravel;
      powderGroup.visible = showCharge && state.sahiCharge.powder;
      tampionMesh.visible = showCharge && state.sahiCharge.tampion;
      primeMesh.visible = showCharge && state.sahiCharge.primed;
      const inPile = Math.max(0, state.sahiAmmoCount - (state.sahiLoaded ? 1 : 0));
      pileBalls.forEach((b, i) => { b.visible = i < inPile; });

      // Balistik uçuş (yavaş çekim)
      if (flyBall.visible) {
        flight.t += dt * SLOWMO;
        const t = flight.t;
        flyBall.position.set(
          flight.p0.x + flight.v0.x * t,
          flight.p0.y + flight.v0.y * t - 0.5 * G * t * t,
          flight.p0.z + flight.v0.z * t
        );
        flyBall.rotation.x += dt * 4;
        if (flyBall.position.y <= DIM.ballRadius) {
          tmpV.copy(flyBall.position).setY(0.2);
          emitSmoke(tmpV, new THREE.Vector3(0, 1, 0), 10, { life: 3, size: 0.8, grow: 3, speed: 2.5, spread: 2, opacity: 0.7, color: 0xb59b78 });
          flyBall.visible = false;
        } else if (flyBall.position.distanceTo(flight.p0) > 80) {
          flyBall.visible = false;
        }
      }
      updateSmoke(dt);
    }

    return {
      root: sahiRoot,
      specs,
      flashMesh,
      update,
      fire,
      puffSteam,
      parts: {
        front: partFront, breech: partBreech, threads: partThreads, levers: partLevers,
        ball: partBall, powder: partPowder,
        sled: partSled, quoins: partQuoins, bed: partBed, recoil: partRecoil,
        wagon: partWagon, ammo: partAmmo, tools: partTools
      }
    };
  };
})();
