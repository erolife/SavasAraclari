/* IJN Yamato 46 cm/45 (460 mm) Type 94 üç namlulu taret ve barbet kesiti (1:2 müze ölçeği). Balistik/zırh delme hesabı yapılmaz. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.yamato460 = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'yamato460');
    const { T, root, parts, mats: M, mesh, box, cyl, ring, pipe, beam, instances } = K;

    const S = {
      az: 18, elev: 22, centerDelta: 0,
      loadingMode: false, delayCoil: true,
      ammo: 18, salvoActive: false, salvoTime: 0,
      loadPhase: 0
    };
    const counts = {}; let n = 0;

    // Kure Donanma Cephaneliği koyu gri-mavi tonu ve teak güverte
    M.paint.color.setHex(0x4b545c); M.paint.roughness = 0.72; M.paint.metalness = 0.42;
    const armorMat = M.paint.clone(); armorMat.color.setHex(0x434c54); armorMat.userData.paint = true;
    const teakMat = M.wood.clone(); teakMat.color.setHex(0x8a6b48);
    const apBodyMat = M.white.clone(); apBodyMat.color.setHex(0xdedfd8);
    const apCapMat = M.red.clone(); apCapMat.color.setHex(0x9e352a);
    const silkBagMat = M.white.clone(); silkBagMat.color.setHex(0xd6ccb4);
    const flashMat = new T.MeshBasicMaterial({ color: 0xffab38, transparent: true, opacity: 0.88, depthWrite: false });

    function G(parent, pos, name) {
      const g = new T.Group(); g.position.set(...pos); if (name) g.name = name; parent.add(g); return g;
    }
    function P(key, name, sub, desc, exp = [0, 0.5, 0], outer = false, parent = root) {
      counts[sub] = (counts[sub] || 0) + 1;
      const p = K.part(key, ++n + '. ' + name, sub, [0, 0, 0], exp, desc, outer, parent);
      p.userData.material = 'VHS yüzeyi sertleştirilmiş zırh çeliği, dövme çelik namlu, pirinç ve teak güverte';
      p.userData.spec = '1:2 müze kesit ölçeği • Type 94 460 mm L/45 üçlü taret (tam ölçek taret kütlesi ~2.774 t)';
      return p;
    }

    const GX = [-1.12, 0, 1.12]; // 1:2 ölçekte ~2,24 m namlu eksen aralığı

    // --------------------------------------------------------- 1..3 KAİDE, GÜVERTE VE BARBET ZIRHI
    const base = P('base', 'Cephanelik Tabanı ve Sintine Kaidesi', 'Barbet ve Güverte',
      'Gemi çift dip yapısı üzerindeki dairesel müze kesit kaidesi ve alt merkezleme yatağı.',
      [0, -0.6, 0], false);
    cyl(base, 3.85, 0.16, [0, 0.08, 0], M.dark); // alt yüzey y = 0.000
    ring(base, 3.82, [0, 0.16, 0], M.steel, 0.03, [Math.PI / 2, 0, 0]);
    cyl(base, 0.72, 0.22, [0, 0.27, 0], M.steel);

    const barbette = P('barbette', '560 mm Zırhlı Barbet Kuyusu (Kesitli)', 'Barbet ve Güverte',
      'Güverte altındaki cephane asansörlerini koruyan kalın silindirik zırh kuşak. Ön-sağ kadranı müze kesiti olarak açıktır; X-Ray tüm duvarı saydamlaştırır.',
      [0, 0.2, 0], true);
    const barbMat = armorMat.clone(); barbMat.side = T.DoubleSide; barbMat.userData.paint = true;
    // 250° yaylı silindirik kesit duvarı (ön-sağda 110° kesit penceresi)
    mesh(barbette, new T.CylinderGeometry(3.15, 3.15, 5.18, 44, 1, true, 0.85, Math.PI * 1.38), barbMat, [0, 2.75, 0]);
    mesh(barbette, new T.CylinderGeometry(2.88, 2.88, 5.18, 44, 1, true, 0.85, Math.PI * 1.38), M.dark, [0, 2.75, 0]);
    for (const y of [1.95, 3.70, 5.34]) {
      ring(barbette, 3.02, [0, y, 0], M.steel, 0.045, [Math.PI / 2, 0, 0]);
    }

    const deckRing = P('deckRing', 'Teak Kaplı Ana Güverte Kesiti ve Bilyeli Yatak', 'Barbet ve Güverte',
      'Yamato’nun teak kaplı üst güverte kesiti ve ~2.774 tonluk döner kütleyi taşıyan konik makaralı yatak çemberi.',
      [0, 0.5, 0], false);
    box(deckRing, [7.8, 0.14, 7.8], [0, 5.42, 0], M.paint);
    box(deckRing, [7.6, 0.05, 7.6], [0, 5.515, 0], teakMat);
    ring(deckRing, 3.18, [0, 5.56, 0], M.steel, 0.08, [Math.PI / 2, 0, 0]);
    const rollers = Array.from({ length: 36 }, (_, i) => {
      const a = i * 2 * Math.PI / 36;
      return { pos: [Math.sin(a) * 3.02, 5.58, Math.cos(a) * 3.02], rot: [0, a, Math.PI / 2] };
    });
    instances(deckRing, new T.CylinderGeometry(0.055, 0.045, 0.18, 10), M.brass, rollers);

    // --------------------------------------------------------- 4..5 BARUT VE MERMİ ODALARI
    const powderRoom = P('powderRoom', 'Alt İpek Barut Kesesi Odası ve Alev Kapakları', 'Asansör ve Cephanelik',
      'Tam atımda namlu başına 6 adet (toplam ~330 kg) ipek barut kesesinin depolandığı alt kat ve alev sızdırmaz döner kapaklar.',
      [-0.8, -0.3, 0], false);
    cyl(powderRoom, 2.86, 0.08, [0, 1.92, 0], M.steel);
    const bagTransforms = [];
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < 10; i++) {
        const a = 1.15 + i * 0.36;
        bagTransforms.push({
          pos: [Math.sin(a) * 2.35, 0.48 + row * 0.36, Math.cos(a) * 2.35],
          rot: [Math.PI / 2, 0, -a]
        });
      }
    }
    instances(powderRoom, new T.CylinderGeometry(0.10, 0.10, 0.48, 12), silkBagMat, bagTransforms);

    const shellRoom = P('shellRoom', 'Üst 460 mm Zırh Delici Mermi Odası', 'Asansör ve Cephanelik',
      'Her biri 1.460 kg ağırlığındaki Type 91 zırh delici mermilerin dikey istiflendiği cephane güvertesi.',
      [0.8, 0.1, 0], false);
    cyl(shellRoom, 2.86, 0.08, [0, 3.68, 0], M.steel);
    const rackTransforms = [], capTransforms = [];
    for (let i = 0; i < 18; i++) {
      const a = 1.05 + i * 0.22;
      const r = i % 2 === 0 ? 2.42 : 2.02;
      const sx = Math.sin(a) * r, sz = Math.cos(a) * r;
      rackTransforms.push({ pos: [sx, 2.36, sz] });
      capTransforms.push({ pos: [sx, 2.78, sz] });
    }
    instances(shellRoom, new T.CylinderGeometry(0.115, 0.115, 0.62, 12), apBodyMat, rackTransforms);
    instances(shellRoom, new T.ConeGeometry(0.115, 0.26, 12), apCapMat, capTransforms);

    // --------------------------------------------------------- 6..8 DÖNER KUYU ŞAFTI VE ASANSÖRLER
    const turretYaw = G(root, [0, 0, 0], 'turret-yaw');

    const stalk = P('stalk', 'Döner Kuyu Gövdesi ve Çalışma Güvertesi', 'Asansör ve Cephanelik',
      'Taret ile birlikte dönen merkezi çelik kafes şaft. Cephane asansörlerini mermi odasından taret beşiğine taşır.',
      [0, 0.4, 0], false, turretYaw);
    for (const sx of [-1.55, 1.55]) {
      for (const sz of [-1.15, 1.15]) beam(stalk, [sx, 0.30, sz], [sx, 5.65, sz], 0.12, M.steel);
    }
    cyl(stalk, 2.75, 0.10, [0, 4.55, 0], M.paint); // çalışma/aktarma güvertesi
    cyl(stalk, 3.05, 0.22, [0, 5.72, 0], M.paint); // taret taban tablası

    const shellHoists = P('shellHoists', '3 × Dikey İticili Mermi Asansörü', 'Asansör ve Cephanelik',
      'Her namluya ait dikey mermi asansörü ve üstte yataya devrilen bekleme oluğu. Dolum çevriminde mermiyi yukarı sürer.',
      [0, 0.7, -0.5], false, turretYaw);
    const shellCars = GX.map((gx, i) => {
      for (const dx of [-0.18, 0.18]) beam(shellHoists, [gx + dx, 2.05, -0.52], [gx + dx, 5.95, -0.52], 0.04, M.steel);
      const car = G(shellHoists, [gx, 2.45, -0.52], 'shell-car-' + i);
      box(car, [0.34, 0.96, 0.32], [0, 0, 0], M.dark);
      cyl(car, 0.115, 0.64, [0, -0.08, 0], apBodyMat);
      mesh(car, new T.ConeGeometry(0.115, 0.28, 14), apCapMat, [0, 0.38, 0]);
      const tiltTray = G(shellHoists, [gx, 5.98, -0.52], 'shell-tilt-' + i);
      box(tiltTray, [0.30, 0.10, 0.88], [0, 0, -0.22], M.brass);
      return { car, tiltTray };
    });

    const powderHoists = P('powderHoists', '3 × Alev Korumalı Barut Asansörü', 'Asansör ve Cephanelik',
      'Üst güvertedeki olası bir parlamanın barut odasına inmesini önleyen kapalı zırhlı kılıf içinde çalışan barut asansörleri.',
      [0, 0.5, -0.9], false, turretYaw);
    const powderCars = GX.map((gx, i) => {
      box(powderHoists, [0.32, 5.25, 0.32], [gx, 2.95, -1.18], M.dark);
      const pCar = G(powderHoists, [gx, 0.72, -1.18], 'powder-car-' + i);
      box(pCar, [0.26, 0.68, 0.26], [0, 0, 0], M.brass);
      cyl(pCar, 0.095, 0.52, [0, 0, 0], silkBagMat);
      return pCar;
    });

    // --------------------------------------------------------- 9..12 650 MM TARET ZIRHI VE MESAFE ÖLÇER
    const gunhouse = P('gunhouse', '650 mm Ön Zırhlı Taret Kabuğu', 'Taret ve Zırh',
      'Savaş gemisi tarihinin en kalın taret zırhı: 45° eğimli 650 mm ön levha, 250 mm yanlar ve 270 mm tavan. X-Ray iç beşikleri ve kamaları açar.',
      [0, 1.5, 0], true, turretYaw);
    const ghMat = armorMat.clone(); ghMat.side = T.DoubleSide; ghMat.userData.paint = true;
    // Çokgen zırhlı taret evi (loft/extrude profil)
    function gunhouseGeo() {
      const yb = 5.82, yt = 7.48;
      // Alt ve üst sekizgen kesit [x, z]
      const bot = [[-2.35, 2.55], [2.35, 2.55], [2.95, 0.85], [2.75, -2.55], [1.65, -3.35], [-1.65, -3.35], [-2.75, -2.55], [-2.95, 0.85]];
      const top = [[-2.05, 1.45], [2.05, 1.45], [2.52, 0.55], [2.42, -2.35], [1.48, -3.05], [-1.48, -3.05], [-2.42, -2.35], [-2.52, 0.55]];
      const v = [], ix = [], N = bot.length;
      bot.forEach(([x, z]) => v.push(x, yb, z));
      top.forEach(([x, z]) => v.push(x, yt, z));
      for (let i = 0; i < N; i++) {
        const b = (i + 1) % N;
        ix.push(i, b, i + N, b, b + N, i + N);
      }
      // Tavan ve taban kapaması
      const cTop = v.length / 3; v.push(0, yt, -0.7);
      for (let i = 0; i < N; i++) ix.push(cTop, ((i + 1) % N) + N, i + N);
      const cBot = v.length / 3; v.push(0, yb, -0.5);
      for (let i = 0; i < N; i++) ix.push(cBot, i, (i + 1) % N);
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(v, 3));
      g.setIndex(ix);
      const flat = g.toNonIndexed();
      flat.computeVertexNormals();
      return flat;
    }
    mesh(gunhouse, gunhouseGeo(), ghMat);
    // 650 mm kalın ön plaka vurgusu
    box(gunhouse, [4.35, 0.32, 1.62], [0, 6.66, 2.02], ghMat, [Math.atan2(1.10, 1.66), 0, 0]);

    const blastBags = P('blastBags', 'Namlu Kökü Patlama Körükleri (Blast Bags)', 'Taret ve Zırh',
      'Ön zırh yarıklarını deniz suyuna ve komşu namlunun namlu ağzı basıncına karşı kapatan esnek kanvas körükler.',
      [0, 1.2, 0.9], false, turretYaw);
    GX.forEach(gx => {
      cyl(blastBags, 0.34, 0.72, [gx, 6.52, 2.18], M.rubber, 'z', 0.44);
    });

    const rangefinder = P('rangefinder', '15 Metrelik Stereo Mesafe Ölçer Kolları', 'Atış Kontrol',
      'Taretin arka yanlarından dışarı uzanan 15,7 m (1:2 ölçekte ~7,85 m) taban açıklıklı dev optik mesafe ölçer tüpü ve zırhlı başlıkları.',
      [0, 1.9, -1.2], false, turretYaw);
    cyl(rangefinder, 0.24, 7.85, [0, 7.12, -2.62], M.paint, 'x');
    for (const s of [-1, 1]) {
      box(rangefinder, [0.78, 0.62, 0.92], [s * 3.72, 7.12, -2.62], armorMat);
      cyl(rangefinder, 0.14, 0.12, [s * 3.85, 7.12, -2.14], M.glass, 'z');
      ring(rangefinder, 0.15, [s * 3.85, 7.12, -2.12], M.brass, 0.02);
    }

    const sights = P('sights', 'Nişangâh Periskopları ve Taret Tavan Donanımı', 'Atış Kontrol',
      'Taret komutanı ve yan nişancıların zırhlı periskop kubbeleri, havalandırma panjurları ve tavan korkulukları.',
      [0, 2.1, -0.3], false, turretYaw);
    for (const [sx, sz] of [[-1.25, -0.6], [1.25, -0.6], [0, -1.65]]) {
      cyl(sights, 0.24, 0.22, [sx, 7.58, sz], armorMat);
      box(sights, [0.22, 0.12, 0.16], [sx, 7.72, sz + 0.08], M.dark);
    }

    // --------------------------------------------------------- 13..18 ÜÇ BAĞIMSIZ 460 MM NAMLU, KAMA VE RAMMER
    const cradles = P('cradles', 'Üçlü Beşik, Muylular ve Hidropnömatik Silindirler', '460 mm Toplar',
      'Her namlunun bağımsız -5° ile +45° arasında yükselmesini sağlayan çelik beşikler ve alttaki ikiz geri tepme/ileri getirme silindirleri.',
      [0, 1.1, 0.5], false, turretYaw);
    for (const sx of [-1.62, -0.58, 0.58, 1.62]) box(cradles, [0.14, 0.92, 1.45], [sx, 6.32, 1.25], M.steel);

    const gunPivots = GX.map((gx, i) => {
      const piv = G(cradles, [gx, 6.52, 1.35], 'gun-piv-' + i);
      cyl(piv, 0.14, 0.92, [0, 0, 0], M.steel, 'x');
      box(piv, [0.64, 0.44, 2.15], [0, -0.10, -0.25], M.dark);
      for (const dx of [-0.19, 0.19]) cyl(piv, 0.095, 1.95, [dx, -0.32, -0.15], M.brass, 'z'); // hidropnömatik silindirler
      return piv;
    });

    function buildBarrelGroup(partObj, pivIdx, keyLabel) {
      const slide = G(gunPivots[pivIdx], [0, 0, 0], 'recoil-slide-' + keyLabel);
      // 460 mm L/45 namlu: tam ölçek 20,7 m -> 1:2 ölçekte 10,35 m toplam boy!
      cyl(slide, 0.26, 2.35, [0, 0, 0.45], M.steel, 'z', 0.30); // kalın arka ceket
      cyl(slide, 0.21, 3.60, [0, 0, 3.42], M.paint, 'z', 0.255); // orta kademe
      cyl(slide, 0.175, 3.65, [0, 0, 7.04], M.paint, 'z', 0.21); // ön namlu
      ring(slide, 0.20, [0, 0, 8.86], M.dark, 0.028); // namlu ağzı bileziği
      cyl(slide, 0.115, 0.12, [0, 0, 8.88], M.dark, 'z'); // 460 mm (1:2 -> Ø230 mm) ağız boşluğu
      // Parça grubunu sahne ağacında kendi partObj altında da temsil etmek için bağlantı halkası
      ring(partObj, 0.29, [GX[pivIdx], 6.52, 1.75], M.steel, 0.025);
      const flash = new T.Mesh(new T.ConeGeometry(0.46, 1.85, 16), flashMat);
      flash.rotation.x = Math.PI / 2;
      flash.position.set(0, 0, 9.85);
      flash.visible = false;
      slide.add(flash);
      return { slide, flash };
    }

    const barrelL = P('barrelL', 'Sol 460 mm L/45 Namlu (Type 94)', '460 mm Toplar',
      'Sol dış namlu. Salvo atışında sağ namluyla birlikte ilk anda ateşlenir.', [-0.8, 1.2, 1.8], false, turretYaw);
    const barrelC = P('barrelC', 'Orta 460 mm L/45 Namlu ve Gecikme Bobini Hattı', '460 mm Toplar',
      'Orta namlu. Namlu ağzı şok dalgalarının mermileri saptırmasını önlemek için gecikme bobiniyle dış namlulardan ~0,08 sn sonra ateşlenir.',
      [0, 1.4, 2.0], false, turretYaw);
    const barrelR = P('barrelR', 'Sağ 460 mm L/45 Namlu (Type 94)', '460 mm Toplar',
      'Sağ dış namlu. Bağımsız beşiği sayesinde diğer namlulardan ayrı olarak +3° dolum açısına indirilebilir.',
      [0.8, 1.2, 1.8], false, turretYaw);

    const gunSlides = [
      buildBarrelGroup(barrelL, 0, 'L'),
      buildBarrelGroup(barrelC, 1, 'C'),
      buildBarrelGroup(barrelR, 2, 'R')
    ];
    // Orta namlu gecikme bobini kutusu
    box(barrelC, [0.22, 0.18, 0.28], [0, 6.92, 0.45], M.brass);

    const breeches = P('breeches', '3 × Welin Basamaklı Vidalı Kama Bloğu', '460 mm Toplar',
      'Yüksek basıncı kilitleyen basamaklı vidalı kama kapakları. Dolum çevriminde yana açılır, atışta namluyla birlikte geri teper.',
      [0, 1.1, -0.6], false, turretYaw);
    const breechBlocks = GX.map((gx, i) => {
      // Kama görseli namlu kıçında geri tepmeyi izler, menteşesi dolumda açılır
      const bRoot = G(breeches, [gx, 6.52, 1.35], 'breech-follow-' + i);
      const bSlide = G(bRoot, [0, 0, -0.82], 'breech-slide-' + i);
      box(bSlide, [0.56, 0.56, 0.42], [0, 0, 0], M.steel);
      const door = G(bSlide, [0.26, 0, -0.22], 'breech-door-' + i);
      cyl(door, 0.22, 0.18, [-0.26, 0, -0.06], M.brass, 'z');
      return { bRoot, bSlide, door };
    });

    const rammers = P('rammers', '3 × Zincirli Hidrolik Mermi İtici (Rammer)', 'Asansör ve Cephanelik',
      'Taret arka duvarına bağlı teleskopik zincirli iticiler. Namlu +3° dolum açısına indiğinde 1.460 kg mermiyi ve 6 barut kesesini yatağa sürer.',
      [0, 1.0, -1.4], false, turretYaw);
    const rammerRods = GX.map((gx, i) => {
      box(rammers, [0.34, 0.28, 1.05], [gx, 6.42, -2.35], M.dark);
      const rod = G(rammers, [gx, 6.46, -1.85], 'rammer-rod-' + i);
      cyl(rod, 0.065, 1.35, [0, 0, 0.55], M.brass, 'z');
      cyl(rod, 0.10, 0.08, [0, 0, 1.24], M.steel, 'z');
      return rod;
    });

    // --------------------------------------------------------- KİNEMATİK VE SENKRONİZASYON
    function recoilProfile(t) {
      if (t <= 0) return 0;
      if (t < 0.11) return t / 0.11; // hızlı geri tepme
      if (t < 0.75) return Math.max(0, 1 - (t - 0.11) / 0.64); // hidropnömatik ileri geliş
      return 0;
    }

    function sync() {
      turretYaw.rotation.y = S.az * Math.PI / 180;

      const outerDeg = S.loadingMode ? 3 : S.elev;
      const centerDeg = S.loadingMode ? 3 : T.MathUtils.clamp(S.elev + S.centerDelta, -5, 45);
      const degs = [outerDeg, centerDeg, outerDeg];

      const delay = S.delayCoil ? 0.08 : 0; // 0,08 sn orta namlu gecikme bobini!
      const kicks = [
        S.salvoActive ? recoilProfile(S.salvoTime) : 0,
        S.salvoActive ? recoilProfile(S.salvoTime - delay) : 0,
        S.salvoActive ? recoilProfile(S.salvoTime) : 0
      ];

      gunPivots.forEach((piv, i) => {
        const rad = -degs[i] * Math.PI / 180;
        piv.rotation.x = rad;
        const rz = kicks[i] > 0 ? -0.72 * kicks[i] : 0; // 1:2 ölçekte ~0,72 m (tam ölçek ~1,43 m) geri tepme!
        gunSlides[i].slide.position.z = rz;
        const localT = i === 1 ? S.salvoTime - delay : S.salvoTime;
        gunSlides[i].flash.visible = S.salvoActive && localT > 0 && localT < 0.09;

        breechBlocks[i].bRoot.rotation.x = rad;
        breechBlocks[i].bSlide.position.z = -0.82 + rz;
      });

      // +3° Dolum çevrimi animasyonu (asansör -> devrilme oluğu -> kama açılışı -> zincirli rammer)
      const p = S.loadingMode ? S.loadPhase : 0;
      const hoistLift = S.loadingMode ? (p < 0.35 ? p / 0.35 : p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1) : 0;
      const trayTilt = S.loadingMode && p >= 0.32 && p <= 0.82 ? Math.sin(Math.min(1, (p - 0.32) / 0.15) * Math.PI / 2) : 0;
      const breechOpen = S.loadingMode && p >= 0.25 && p <= 0.88 ? 1.25 : 0;
      const ramStroke = S.loadingMode && p >= 0.45 && p <= 0.80 ? Math.sin(((p - 0.45) / 0.35) * Math.PI) : 0;

      shellCars.forEach(({ car, tiltTray }) => {
        car.position.y = 2.45 + hoistLift * 3.15;
        tiltTray.rotation.x = trayTilt * 1.42;
      });
      powderCars.forEach(pCar => {
        pCar.position.y = 0.72 + hoistLift * 4.85;
      });
      breechBlocks.forEach(({ door }) => {
        door.rotation.y = breechOpen;
      });
      rammerRods.forEach(rod => {
        rod.position.z = -1.85 + ramStroke * 1.32;
      });
    }

    function update(dt) {
      if (!Number.isFinite(dt)) return;
      dt = T.MathUtils.clamp(dt, 0, 0.05);
      if (S.salvoActive) {
        S.salvoTime += dt;
        if (S.salvoTime >= 0.92) {
          S.salvoActive = false;
          S.salvoTime = 0;
        }
      }
      if (S.loadingMode) {
        S.loadPhase = (S.loadPhase + dt * 0.28) % 1;
      }
      sync();
    }

    const camPresets = {
      iso: { pos: [13.8, 10.4, 16.2], look: [0.6, 5.2, 2.2] },
      front: { pos: [4.2, 7.6, 14.2], look: [0, 6.5, 3.2] },
      breech: { pos: [4.8, 7.8, -5.8], look: [0, 6.4, -0.5] },
      engine: { pos: [6.8, 3.4, 5.8], look: [0, 2.8, -0.4] },
      suspension: { pos: [-7.4, 7.5, -4.6], look: [0, 7.0, -2.2] },
      top: { pos: [0.1, 18.5, 0.5], look: [0, 5.5, 1.0] }
    };

    const tourSteps = [
      ['Type 94 460 mm Üçlü Taret: Denizlerin En Büyük Topu', 'Yamato ve Musashi zırhlılarının her bir tareti tam ölçekte ~2.774 ton ağırlığındaydı — bir muhrip gemi kütlesine eşdeğer! 1:2 müze kesitinde üst taret ve çok katlı barbet kuyusunu birlikte görüyorsunuz.', 'iso', gunhouse, false],
      ['650 mm Ön Zırh ve Üç Bağımsız Beşik', 'X-Ray’i açın ve “Orta Namlu Farkı” kaydırıcısını oynatın: üç 460 mm namlu tek ortak milde değil, bağımsız hidropnömatik beşiklerde taşınır.', 'front', cradles, true],
      ['0,08 Saniye Gecikme Bobini (Salvo Dağılmasını Önleme)', 'Üç dev top aynı milisaniyede patlarsa namlu ağzı şok dalgaları mermileri saptırır. Salvo ateşleyin: dış namlular önce, orta namlu 0,08 sn sonra ateşlenir ve geri teper.', 'front', barrelC, false],
      ['15 Metrelik Stereo Mesafe Ölçer', 'Taretin arkasından iki yana uzanan zırhlı kollar 15 metrelik optik taban oluşturarak ufuk ötesi hedeflerin mesafesini üçgenleme ile ölçer.', 'suspension', rangefinder, false],
      ['Mermi ve İpek Barut Odaları', 'Alt katta alev sızdırmaz kapaklar ardında ipek barut keseleri, üst katta 1.460 kg’lık Type 91 zırh delici mermiler dikey çemberlerde istiflenir.', 'engine', shellRoom, true],
      ['+3° Sabit Açıda Asansör ve Zincirli Rammer Dolumu', '“+3° Dolum Çevrimi” düğmesini açın: namlular +3° dolum açısına iner, üç mermi ve üç barut asansörü yükselir, Welin kamalar açılır ve zincirli rammer mermileri sürer.', 'breech', rammers, true]
    ].map(a => ({ title: a[0], desc: a[1], cam: a[2], part: a[3], cutaway: a[4], explode: 0, sub: 'all' }));

    const ui = K.ui({
      title: 'IJN Yamato — 460 mm Type 94 Üçlü Taret ve Asansörler',
      sub: '1941 Kure Donanma Tersanesi • 1:2 Müze Kesiti • 650 mm Ön Zırh & 0,08 sn Gecikme Bobini',
      portraitCameraScale: 1.5,
      shadowExtent: 14,
      subsystems: Object.entries(counts).map(([key, count]) => ({ key, label: key, count, color: '#4b545c' })),
      camLabels: {
        iso: 'Tam Kesit', front: '650 mm Ön & Namlular', breech: 'Kama & Rammer',
        engine: 'Barbet & Cephanelik', suspension: '15 m Mesafe Ölçer', top: 'Üst'
      },
      sliders: [
        { label: 'Taret Yanca Dönüşü', min: -150, max: 150, step: 1, fmt: v => Math.round(v) + '°' },
        { label: 'Namlu Yükseliş Açısı', min: -5, max: 45, step: 1, fmt: v => Math.round(v) + '°' },
        { label: 'Orta Namlu Bağımsız Farkı', min: -10, max: 10, step: 1, fmt: v => (v >= 0 ? '+' : '') + Math.round(v) + '°' }
      ],
      buttons: { terrain: '+3° Dolum Çevrimi', sweep: '0,08 sn Gecikme Bobini' },
      telemetryTag: 'TYPE 94 • 46 CM/45 • KURE',
      statLabels: ['TARET YANCA', 'YÜKSELİŞ (DIŞ / ORTA)', 'SALVO KİPİ', 'HAZIR MERMİ']
    });

    sync();
    return {
      root, parts, ui, camPresets, tourSteps,
      defaultPart: gunhouse, firePart: barrelC, update,
      gunPivots, gunSlides, shellCars, powderCars, rammerRods,
      onFire: () => {
        if (S.loadingMode) return { ok: false, msg: 'Dolum çevrimi açıkken kama kilitli değil — önce dolum çevrimini kapatın.' };
        if (S.ammo < 3) {
          S.ammo = 18; S.salvoActive = false; S.salvoTime = 0;
          sync();
          return { ok: true, refill: true, msg: 'Cephanelik ikmali: 18 × Type 91 mermi hazır.' };
        }
        if (S.salvoActive) return { ok: false };
        S.ammo -= 3; S.salvoActive = true; S.salvoTime = 0.001;
        sync();
        if (ctx.audio && ctx.audio.playCannonFire) ctx.audio.playCannonFire();
        return { ok: true, msg: (S.delayCoil ? 'Kademeli 3’lü salvo (orta +0,08 sn)' : 'Eşzamanlı 3’lü salvo') + ' — kalan ' + S.ammo };
      },
      fireButtonLabel: () => S.loadingMode ? 'DOLUMDA ATIŞ KİLİTLİ' : S.ammo < 3 ? 'CEPHANE İKMALİ (18 MERMİ)' : '3×460 MM SALVO (' + S.ammo + ')',
      mobileFireButtonLabel: () => S.loadingMode ? 'Dolumda' : S.ammo < 3 ? 'İkmal' : 'Salvo',
      onSlider: (i, v) => {
        if (!Number.isFinite(v)) return {};
        if (i === 0) S.az = T.MathUtils.clamp(v, -150, 150);
        if (i === 1) S.elev = T.MathUtils.clamp(v, -5, 45);
        if (i === 2) S.centerDelta = T.MathUtils.clamp(v, -10, 10);
        sync(); return {};
      },
      onButton: name => {
        if (name === 'terrain') { S.loadingMode = !S.loadingMode; S.loadPhase = 0; S.salvoActive = false; S.salvoTime = 0; }
        if (name === 'sweep') S.delayCoil = !S.delayCoil;
        sync(); return {};
      },
      buttonActive: name => name === 'terrain' ? S.loadingMode : name === 'sweep' ? S.delayCoil : false,
      getSliderValues: () => [S.az, S.elev, S.centerDelta],
      getStats: () => {
        const od = S.loadingMode ? 3 : Math.round(S.elev);
        const cd = S.loadingMode ? 3 : Math.round(T.MathUtils.clamp(S.elev + S.centerDelta, -5, 45));
        return [
          Math.round(S.az) + '° <span>barbet</span>',
          od + '° / ' + cd + '° <span>beşik</span>',
          (S.delayCoil ? '+0,08 sn' : '0,00 sn') + ' <span>orta gecikme</span>',
          S.ammo + ' <span>/ 18 AP</span>'
        ];
      },
      getStatus: () => S.salvoActive
        ? { text: S.delayCoil ? '460 MM KADEMELİ SALVO • ORTA NAMLU +0,08 SN GECİKMELİ' : '460 MM EŞZAMANLI ÜÇLÜ SALVO • GERİ TEPME', color: '#b84a27' }
        : S.loadingMode
          ? { text: '+3° SABİT YÜKLEME AÇISI • ASANSÖR VE ZİNCİRLİ RAMMER ÇEVRİMİ', color: '#8a6b48' }
          : { text: 'TYPE 94 ÜÇLÜ TARET HAZIR • 1.460 KG ZIRH DELİCİ MERMİ', color: '#4b545c' },
      applyTextures: K.applyTextures, setTexture: K.setTexture, toggleRelief: K.toggleRelief
    };
  };
})();
