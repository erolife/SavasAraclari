/* 1206 El-Cezerî (Kitâbü'l-Hiyel): Su çarkı, 90° fener dişli, eksantrik kam mili ve ikiz silindirli emme-basma su pompası. Eğitim amaçlı müze rekonstrüksiyonu; hidrolik verim hesabı yapılmaz. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.cezeri = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'cezeri');
    const { T, root, parts, mats: M, mesh, box, cyl, ring, pipe, beam, instances } = K;

    const S = {
      sluice: 65, headLoad: 1.0, manualAngle: 0,
      manualMode: false, showWater: true,
      theta: 0, waterPhase: 0, velSign: 1
    };
    const counts = {}; let n = 0;

    // Diyarbakır bazalt taşı, ceviz/meşe ahşap ve dövme bakır/tunç paleti
    M.paint.color.setHex(0x6e5136); M.paint.roughness = 0.85; M.paint.metalness = 0.08;
    const oakMat = M.wood.clone(); oakMat.color.setHex(0x785638); oakMat.userData.paint = true;
    const darkOak = M.wood.clone(); darkOak.color.setHex(0x523924);
    const basaltMat = M.dark.clone(); basaltMat.color.setHex(0x3a3d40); basaltMat.roughness = 0.92; basaltMat.metalness = 0.08;
    const limestoneMat = M.white.clone(); limestoneMat.color.setHex(0xc8bfa8); limestoneMat.roughness = 0.88;
    const copperMat = M.brass.clone(); copperMat.color.setHex(0xb86d3c); copperMat.metalness = 0.76; copperMat.roughness = 0.34;
    const bronzeMat = M.brass.clone(); bronzeMat.color.setHex(0xa68446); bronzeMat.metalness = 0.74; bronzeMat.roughness = 0.38;
    const waterMat = new T.MeshStandardMaterial({ color: 0x2b8cbe, transparent: true, opacity: 0.62, roughness: 0.18, metalness: 0.10 });
    const dropMat = new T.MeshBasicMaterial({ color: 0x5cc8f2, transparent: true, opacity: 0.85, depthWrite: false });

    function G(parent, pos, name) {
      const g = new T.Group(); g.position.set(...pos); if (name) g.name = name; parent.add(g); return g;
    }
    function P(key, name, sub, desc, exp = [0, 0.5, 0], outer = false, parent = root) {
      counts[sub] = (counts[sub] || 0) + 1;
      const p = K.part(key, ++n + '. ' + name, sub, [0, 0, 0], exp, desc, outer, parent);
      p.userData.material = 'Meşe ve ceviz ahşap, dövme bakır boru, dökme tunç silindir/valf ve bazalt kaide';
      p.userData.spec = '1206 Artuklu Sarayı (Diyarbakır) • Kitâbü’l-Hiyel Kategori V Bölüm 5 ve kam mili sentezi';
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

    // Sabit geometrik merkezler:
    // Su çarkı & krank mili ekseni (Z boyu): WX = -1.15, WY = 1.52
    // Çivili çark R1 = 0.56 (20 diş), Fener dişli R2 = 0.28 (10 çubuk) -> temas P = (-0.59, 1.52, -0.48)
    // Yatay kam mili ekseni (X boyu): y = 1.52, z = -0.20 (-0.48 + R2 = -0.20)
    const WX = -1.15, WY = 1.52;
    const R_WHEEL = 1.12, R1 = 0.56, R2 = 0.28, CAM_Z = -0.20;

    // --------------------------------------------------------- 1..4 BAZALT SU KANALI, SAVAK VE SU ÇARKI
    const stoneBase = P('stoneBase', 'Kesme Bazalt Su Kanalı ve Müze Kaidesi', 'Su Kanalı ve Çark',
      'Alt su arkını (+X yönünde akış) ve mekanizma dikmelerini taşıyan Diyarbakır bazaltı ve kalker bordürlü kaide.',
      [0, -0.5, 0], false);
    box(stoneBase, [5.6, 0.18, 3.6], [0, 0.09, -0.3], basaltMat); // alt yüzey y = 0.000!
    // Arka su arkı yan duvarları (z = -1.95 .. -1.15)
    box(stoneBase, [5.5, 0.56, 0.18], [0, 0.46, -2.01], limestoneMat);
    box(stoneBase, [5.5, 0.56, 0.18], [0, 0.46, -1.09], limestoneMat);
    // Ön pompa emme havuzu (z = +0.25 .. +0.95, x = -2.55 .. +0.25)
    box(stoneBase, [2.95, 0.36, 0.14], [-1.15, 0.36, 0.18], limestoneMat);
    box(stoneBase, [2.95, 0.36, 0.14], [-1.15, 0.36, 0.98], limestoneMat);
    box(stoneBase, [0.14, 0.36, 0.94], [-2.56, 0.36, 0.58], limestoneMat);
    box(stoneBase, [0.14, 0.36, 0.94], [0.26, 0.36, 0.58], limestoneMat);
    box(stoneBase, [2.68, 0.22, 0.66], [-1.15, 0.29, 0.58], waterMat); // emme havuzu suyu

    const sluiceGate = P('sluiceGate', 'Ayarlanabilir Meşe Savak Kapısı ve Su Akışı', 'Su Kanalı ve Çark',
      'Sol girişteki dikey savak kapısı. Kapı %0’a indirildiğinde su akışı kesilir ve çark ile tüm dişli/pompa sistemi durur.',
      [-1.2, 0.4, -0.8], false);
    for (const z of [-1.96, -1.14]) beam(sluiceGate, [-2.45, 0.18, z], [-2.45, 1.45, z], 0.10, darkOak);
    box(sluiceGate, [0.12, 0.10, 0.94], [-2.45, 1.48, -1.55], darkOak);
    const gateBoard = G(sluiceGate, [-2.45, 0.46, -1.55], 'sluice-board');
    box(gateBoard, [0.06, 0.56, 0.72], [0, 0, 0], oakMat);
    cyl(gateBoard, 0.025, 0.85, [0, 0.55, 0], bronzeMat);
    const channelStream = box(sluiceGate, [5.35, 0.28, 0.72], [0, 0.32, -1.55], waterMat);
    const streamDrops = Array.from({ length: 8 }, (_, i) => {
      const m = new T.Mesh(new T.SphereGeometry(0.045, 8, 8), dropMat);
      sluiceGate.add(m);
      return { o: m, lane: i / 8 };
    });

    const timberFrame = P('timberFrame', 'Artuklu Ahşap Taşıyıcı İskelet ve Yataklar', 'Su Kanalı ve Çark',
      'Su çarkı milini, yatay kam milini ve üst terfi haznesini taşıyan zıvanalı meşe dikmeler ve kirişler.',
      [0, 0.3, 0], false);
    for (const [fx, fz, fh] of [
      [-1.15, -1.98, 1.68], [-1.15, -0.96, 1.68], [-1.15, 0.22, 1.68],
      [-0.78, -0.20, 1.68], [2.05, -0.20, 1.68],
      [2.05, 0.38, 2.75], [0.85, 0.38, 2.75]
    ]) {
      beam(timberFrame, [fx, 0.18, fz], [fx, fh, fz], 0.13, darkOak);
    }
    beam(timberFrame, [-1.35, 1.38, -2.02], [-1.35, 1.38, 0.28], 0.12, oakMat);
    beam(timberFrame, [-0.95, 1.38, -2.02], [-0.95, 1.38, 0.28], 0.12, oakMat);
    beam(timberFrame, [-0.82, 1.38, -0.20], [2.10, 1.38, -0.20], 0.12, oakMat);
    beam(timberFrame, [0.80, 2.68, 0.38], [2.10, 2.68, 0.38], 0.13, darkOak);

    // Ana su çarkı + çivili çark + krank diski ortak mili (Z ekseni etrafında +theta ile döner!)
    const wheelShaft = G(root, [WX, WY, 0], 'wheel-shaft');

    const waterWheel = P('waterWheel', 'Alt Akışlı Kanatlı Su Çarkı', 'Su Kanalı ve Çark',
      'Ø 2,24 m ahşap su çarkı ve 16 kepçe kanat. Alttan +X yönünde akan su kanatları iterek mili +Z yönünde döndürür.',
      [-0.6, 0.6, -1.0], false, wheelShaft);
    for (const wz of [-1.74, -1.36]) {
      ring(waterWheel, R_WHEEL - 0.10, [0, 0, wz], oakMat, 0.045);
      for (let i = 0; i < 4; i++) box(waterWheel, [0.09, (R_WHEEL - 0.12) * 2, 0.05], [0, 0, wz], darkOak, [0, 0, i * Math.PI / 4]);
    }
    const paddles = Array.from({ length: 16 }, (_, i) => {
      const a = i * 2 * Math.PI / 16;
      return { pos: [Math.cos(a) * R_WHEEL, Math.sin(a) * R_WHEEL, -1.55], rot: [0, 0, a] };
    });
    instances(waterWheel, new T.BoxGeometry(0.26, 0.035, 0.44), oakMat, paddles);

    // --------------------------------------------------------- 5..9 MİL, 90° DİŞLİ ÇİFTİ VE EKSANTRİK KAM MİLİ
    const mainAxle = P('mainAxle', 'Ana Meşe Mil ve Bronz Muylu Bilezikleri', 'Dişli ve Kam Mili',
      'Su çarkının torkunu hem ortadaki çivili dişliye hem de öndeki pompa krank diskine ileten tek parça meşe mil.',
      [-0.4, 0.5, -0.3], false, wheelShaft);
    cyl(mainAxle, 0.095, 2.62, [0, 0, -0.68], darkOak, 'z');
    for (const bz of [-1.96, -0.96, 0.22]) cyl(mainAxle, 0.108, 0.12, [0, 0, bz], bronzeMat, 'z');

    const crownGear = P('crownGear', 'Çivili Dik Dişli Çark (20 Diş)', 'Dişli ve Kam Mili',
      'Yarıçapı R1 = 0,56 m olan ahşap çark ve +Z yönüne uzanan 20 gürgen diş. Sağ kenarda (x = -0,59) fener dişliyi yukarı (+Y) sürer.',
      [-0.2, 0.7, -0.4], false, wheelShaft);
    cyl(crownGear, R1 + 0.06, 0.09, [0, 0, -0.58], oakMat, 'z');
    ring(crownGear, R1, [0, 0, -0.53], bronzeMat, 0.02);
    const crownPegs = Array.from({ length: 20 }, (_, i) => {
      const a = i * 2 * Math.PI / 20;
      return { pos: [Math.cos(a) * R1, Math.sin(a) * R1, -0.47], rot: [Math.PI / 2, 0, 0] };
    });
    instances(crownGear, new T.CylinderGeometry(0.028, 0.032, 0.14, 10), darkOak, crownPegs);

    // Yatay kam mili grubu: X ekseni boyunca, merkez y = WY (1.52), z = CAM_Z (-0.20)
    // v1 = (0, +R1*w1, 0), v2 = (w2,0,0) x (0,0,-R2) = (0, +R2*w2, 0) => w2 = +2.0 * w1!
    const camAxleGroup = G(root, [0, WY, CAM_Z], 'cam-axle');

    const lanternGear = P('lanternGear', 'Fener Dişli (10 Çubuk — 90° Aktarım, 1:2 Hız)', 'Dişli ve Kam Mili',
      'İki ahşap disk arasına dizilmiş 10 silindirik çubuktan oluşan fener dişli (R2 = 0,28 m). Çivili çarkın iki katı açısal hızla döner.',
      [0.2, 0.8, -0.2], false, camAxleGroup);
    for (const lx of [-0.68, -0.50]) cyl(lanternGear, R2 + 0.04, 0.05, [lx, 0, 0], oakMat, 'x');
    const staves = Array.from({ length: 10 }, (_, i) => {
      const a = i * 2 * Math.PI / 10 + Math.PI / 10;
      return { pos: [-0.59, Math.sin(a) * R2, Math.cos(a) * R2], rot: [0, 0, Math.PI / 2] };
    });
    instances(lanternGear, new T.CylinderGeometry(0.026, 0.026, 0.22, 10), darkOak, staves);

    const camShaft = P('camShaft', 'Yatay Eksantrik Kam Mili ve 4 Fazlı Kam Lobları', 'Dişli ve Kam Mili',
      'Dairesel dönüşü sıralı doğrusal kalkışa çeviren 90° faz farkıyla dizilmiş 4 eksantrik kam lobu.',
      [0.6, 0.9, -0.2], false, camAxleGroup);
    cyl(camShaft, 0.065, 2.95, [0.62, 0, 0], darkOak, 'x');
    for (const bx of [-0.78, 2.05]) cyl(camShaft, 0.08, 0.11, [bx, 0, 0], bronzeMat, 'x');
    const CAM_X = [0.05, 0.55, 1.05, 1.55];
    CAM_X.forEach((cx, i) => {
      const lobe = G(camShaft, [cx, 0, 0], 'cam-lobe-' + i);
      lobe.rotation.x = i * Math.PI / 2;
      cyl(lobe, 0.13, 0.07, [0, 0, 0], bronzeMat, 'x');
      // Eksantrik burun (+Y yönünde çıkıntılı lob)
      cyl(lobe, 0.085, 0.068, [0, 0.11, 0], copperMat, 'x');
    });

    const tripLevers = P('tripLevers', '4 × Mafsallı Devirme Kolu ve Dikey İtici Çubuklar', 'Dişli ve Kam Mili',
      'Kam loblarının sırayla kaldırıp bıraktığı dört mafsallı kol ve üst rehber çerçevedeki dikey tunç tokmak/şamandıra çubukları.',
      [0.6, 1.2, 0.2], false);
    beam(tripLevers, [-0.15, 1.88, 0.16], [1.75, 1.88, 0.16], 0.08, darkOak); // kol dayanak mili
    box(tripLevers, [1.90, 0.07, 0.22], [0.80, 2.38, -0.20], oakMat); // dikey çubuk kılavuzu
    const leverRig = CAM_X.map((cx, i) => {
      const piv = G(tripLevers, [cx, 1.88, 0.16], 'rocker-' + i);
      box(piv, [0.07, 0.07, 0.62], [0, 0, -0.22], oakMat);
      cyl(piv, 0.04, 0.09, [0, -0.05, -0.36], bronzeMat, 'x'); // kam takipçi pabucu
      const stem = G(tripLevers, [cx, 2.15, -0.20], 'pestle-' + i);
      cyl(stem, 0.028, 0.78, [0, 0.22, 0], copperMat);
      mesh(stem, new T.SphereGeometry(0.065, 14, 12), bronzeMat, [0, 0.64, 0]);
      return { piv, stem, phase: i * Math.PI / 2 };
    });

    // --------------------------------------------------------- 10..13 KRANK, YARIK KOL VE İKİZ BAKIR POMPA
    const crankDisc = P('crankDisc', 'Ön Krank Diski ve Eksantrik Bronz Pim', 'İkiz Su Pompası',
      'Ana milin ön ucundaki ahşap-tunç krank tekeri ve r = 0,22 m yarıçapındaki eksantrik tahrik pimi.',
      [-0.5, 0.4, 0.6], false, wheelShaft);
    cyl(crankDisc, 0.32, 0.07, [0, 0, 0.42], oakMat, 'z');
    ring(crankDisc, 0.32, [0, 0, 0.45], bronzeMat, 0.02);
    cyl(crankDisc, 0.036, 0.22, [0.22, 0, 0.53], bronzeMat, 'z'); // krank pimi (x_local = +0.22, y_local = 0)

    const PIV_PUMP_Y = 0.62, R_PIN = 0.22, L_YOKE = 0.50;
    const slottedArm = P('slottedArm', 'Yarık Salınım Kolu (Krank–Doğrusal Dönüştürücü)', 'İkiz Su Pompası',
      'El-Cezerî’nin mühendislik tarihindeki ünlü mekanizması: döner krank pimi kolun yarığında kayarak alt mafsal etrafında simetrik salınım üretir.',
      [-0.5, 0.2, 0.9], false);
    box(slottedArm, [0.22, 0.16, 0.18], [WX, PIV_PUMP_Y, 0.58], bronzeMat);
    const yokePivot = G(slottedArm, [WX, PIV_PUMP_Y, 0.58], 'slotted-yoke');
    // Yarık çerçeve: iki yan kol + alt/üst köprü (ortadaki yarıkta krank pimi görünür!)
    for (const dx of [-0.065, 0.065]) box(yokePivot, [0.038, 1.24, 0.06], [dx, 0.66, 0], bronzeMat);
    box(yokePivot, [0.17, 0.08, 0.07], [0, 0.08, 0], bronzeMat);
    box(yokePivot, [0.17, 0.08, 0.07], [0, 1.26, 0], bronzeMat);
    cyl(yokePivot, 0.055, 0.12, [0, L_YOKE, 0], copperMat, 'z'); // biyel bağlantı pimi

    const CYL_Y = 1.12, CYL_Z = 0.58;
    const cylinders = P('cylinders', 'İkiz Dökme Bakır Pompa Silindirleri (Kesitli)', 'İkiz Su Pompası',
      'Karşılıklı yerleştirilmiş sol ve sağ bakır emme-basma silindirleri. Ön yüzü kesitlidir; X-Ray tüm silindir gövdelerini saydamlaştırır.',
      [-0.5, 0.5, 1.0], true);
    const cylMat = copperMat.clone(); cylMat.side = T.DoubleSide;
    for (const s of [-1, 1]) {
      const cx = WX + s * 0.92;
      // Yatay silindir (X ekseni boyunca): ön tarafında kesit penceresi
      const cg = G(cylinders, [cx, CYL_Y, CYL_Z], 'pump-cyl-' + s);
      cg.rotation.z = Math.PI / 2;
      mesh(cg, new T.CylinderGeometry(0.145, 0.145, 0.68, 28, 1, true, Math.PI * 0.35, Math.PI * 1.45), cylMat);
      ring(cylinders, 0.16, [cx - s * 0.34, CYL_Y, CYL_Z], bronzeMat, 0.02, [0, Math.PI / 2, 0]);
      ring(cylinders, 0.16, [cx + s * 0.34, CYL_Y, CYL_Z], bronzeMat, 0.02, [0, Math.PI / 2, 0]);
      box(cylinders, [0.18, 0.38, 0.22], [cx, 0.76, CYL_Z], darkOak); // ahşap silindir yatağı
    }

    const pistons = P('pistons', 'Karşılıklı İkiz Pistonlar ve Keten Sızdırmazlık', 'İkiz Su Pompası',
      'Kenevir ipi sarılı iki bakır piston diski ve yarık kola bağlanan mafsallı itme çubukları. Biri emerken diğeri basar.',
      [-0.5, 0.6, 1.2], false);
    const pistonRig = [-1, 1].map(s => {
      const head = G(pistons, [WX + s * 0.92, CYL_Y, CYL_Z], 'piston-head-' + s);
      cyl(head, 0.132, 0.12, [0, 0, 0], bronzeMat, 'x');
      cyl(head, 0.138, 0.06, [0, 0, 0], limestoneMat, 'x'); // keten/yağlı sargı kuşağı
      cyl(head, 0.028, 0.42, [-s * 0.22, 0, 0], copperMat, 'x'); // piston kolu
      const linkRod = cyl(pistons, 0.024, 1, [0, 0, 0], bronzeMat);
      return { s, head, linkRod };
    });

    // --------------------------------------------------------- 14..18 KLAPELİ VALFLER, BORULAR VE TERFİ HAZNESİ
    const valveBoxes = P('valveBoxes', 'Emme ve Basma Valf Odaları', 'Valfler ve Basma Hattı',
      'Her silindirin dış ucundaki emme (alt) ve basma (üst) tunç valf sandıkları. X-Ray ile içteki dört klapenin açılıp kapanması izlenir.',
      [-0.5, 0.7, 1.1], true);
    const vBoxMat = bronzeMat.clone(); vBoxMat.side = T.DoubleSide;
    for (const s of [-1, 1]) {
      const vx = WX + s * 1.36;
      box(valveBoxes, [0.22, 0.48, 0.24], [vx, CYL_Y + 0.06, CYL_Z], vBoxMat);
    }

    const clackValves = P('clackValves', '4 × Tek Yönlü Menteşeli Bronz Klape Valf', 'Valfler ve Basma Hattı',
      'Basınç farkıyla tek yönde açılan menteşeli tunç klapeler: emme strokunda alt klape açılır, basma strokunda üst klape açılır.',
      [-0.5, 0.8, 1.3], false);
    const clacks = [-1, 1].map(s => {
      const vx = WX + s * 1.36;
      const intake = G(clackValves, [vx - s * 0.06, CYL_Y - 0.10, CYL_Z], 'clack-in-' + s);
      box(intake, [0.13, 0.022, 0.12], [s * 0.06, 0, 0], copperMat);
      const delivery = G(clackValves, [vx - s * 0.06, CYL_Y + 0.20, CYL_Z], 'clack-out-' + s);
      box(delivery, [0.13, 0.022, 0.12], [s * 0.06, 0, 0], copperMat);
      return { s, intake, delivery };
    });

    const suctionPipes = P('suctionPipes', 'Alt Hazne Emme Boruları', 'Valfler ve Basma Hattı',
      'Ön su havuzundan her iki valf odasının altına uzanan dikey bakır emme boruları ve süzgeç ağızları.',
      [-0.5, -0.1, 1.1], false);
    for (const s of [-1, 1]) {
      const vx = WX + s * 1.36;
      pipe(suctionPipes, [[vx, 0.34, CYL_Z], [vx, CYL_Y - 0.16, CYL_Z]], 0.048, copperMat);
      cyl(suctionPipes, 0.075, 0.08, [vx, 0.34, CYL_Z], bronzeMat);
    }

    const deliveryPipe = P('deliveryPipe', 'Çatal Birleştirici ve Dikey Su Basma Borusu', 'Valfler ve Basma Hattı',
      'İki silindirin nöbetleşe bastığı suyu tek bir çatal boruda birleştirip ~2,9 m yüksekliğe çıkaran bakır terfi hattı.',
      [0.4, 1.1, 0.9], false);
    pipe(deliveryPipe, [[WX - 1.36, CYL_Y + 0.30, CYL_Z], [WX - 0.95, 1.85, CYL_Z], [WX, 2.05, CYL_Z]], 0.048, copperMat);
    pipe(deliveryPipe, [[WX + 1.36, CYL_Y + 0.30, CYL_Z], [WX + 0.95, 1.85, CYL_Z], [WX, 2.05, CYL_Z]], 0.048, copperMat);
    pipe(deliveryPipe, [[WX, 2.02, CYL_Z], [WX, 2.95, CYL_Z], [1.35, 3.05, 0.38], [1.45, 2.92, 0.38]], 0.055, copperMat);

    const upperBasin = P('upperBasin', 'Üst Bakır Terfi Haznesi ve Su Jeti Gösterimi', 'Valfler ve Basma Hattı',
      'Pompalanan suyun döküldüğü yüksek bakır hazne ve geri dönüş çörteni. İkiz silindir sayesinde akış kesintisiz sürer.',
      [1.0, 1.4, 0.5], false);
    cyl(upperBasin, 0.46, 0.32, [1.45, 2.88, 0.38], copperMat, 'y', 0.38);
    cyl(upperBasin, 0.42, 0.06, [1.45, 2.96, 0.38], waterMat);
    const dischargeJet = cyl(upperBasin, 0.036, 0.32, [1.45, 2.86, 0.38], waterMat);
    const riserDrops = Array.from({ length: 6 }, (_, i) => {
      const m = new T.Mesh(new T.SphereGeometry(0.04, 8, 8), dropMat);
      upperBasin.add(m);
      return { o: m, lane: i / 6 };
    });

    // --------------------------------------------------------- KİNEMATİK VE SENKRONİZASYON
    function sync() {
      const theta1 = S.manualMode ? S.manualAngle * Math.PI / 180 : S.theta;
      wheelShaft.rotation.z = theta1;
      camAxleGroup.rotation.x = 2.0 * theta1; // R1 / R2 = 0.56 / 0.28 = tam 2:1 dişli oranı!

      // Savak kapısı açıklığı (0..100%)
      const openFrac = S.sluice / 100;
      gateBoard.position.y = 0.46 + openFrac * 0.48;
      channelStream.scale.y = 0.25 + 0.75 * openFrac;

      // 4 eksantrik kam kolu ve dikey çubuklar (90° faz farkı)
      const camAng = 2.0 * theta1;
      leverRig.forEach(lv => {
        const lift = Math.pow(Math.max(0, Math.sin(camAng + lv.phase)), 1.6);
        lv.piv.rotation.x = lift * 0.28;
        lv.stem.position.y = 2.15 + lift * 0.22;
      });

      // El-Cezerî yarık kol (slotted lever) ve ikiz piston kinematiği
      const pinX = WX + R_PIN * Math.cos(theta1);
      const pinY = WY + R_PIN * Math.sin(theta1);
      const psi = Math.atan2(pinX - WX, pinY - PIV_PUMP_Y);
      yokePivot.rotation.z = -psi;

      const hingeX = WX + L_YOKE * Math.sin(psi);
      const hingeY = PIV_PUMP_Y + L_YOKE * Math.cos(psi);
      const strokeX = L_YOKE * Math.sin(psi); // ~±0,122 m piston stroku

      pistonRig.forEach(({ s, head, linkRod }) => {
        const headX = WX + s * 0.92 + strokeX;
        head.position.set(headX, CYL_Y, CYL_Z);
        const rodEnd = [headX - s * 0.42, CYL_Y, CYL_Z];
        stretch(linkRod, [hingeX, hingeY, CYL_Z], rodEnd);
      });

      // Hız işaretine göre klape valfler: d(pinX)/d(theta1) = -R_PIN * sin(theta1)
      const movingFlow = S.manualMode || S.sluice > 0;
      const vxSign = -Math.sin(theta1);
      clacks.forEach(({ s, intake, delivery }) => {
        if (!movingFlow) {
          intake.rotation.z = 0;
          delivery.rotation.z = 0;
        } else {
          const compressing = s * vxSign > 0.02;
          const sucking = s * vxSign < -0.02;
          intake.rotation.z = sucking ? s * 0.58 : 0;
          delivery.rotation.z = compressing ? s * 0.58 : 0;
        }
      });

      const showDrops = S.showWater && !S.manualMode && S.sluice > 0;
      streamDrops.forEach(d => {
        d.o.visible = showDrops;
        const u = (S.waterPhase + d.lane) % 1;
        d.o.position.set(-2.35 + u * 4.9, 0.42 + 0.03 * Math.sin(u * 18), -1.55);
      });
      dischargeJet.visible = showDrops;
      riserDrops.forEach(d => {
        d.o.visible = showDrops;
        const u = (S.waterPhase * 1.4 + d.lane) % 1;
        d.o.position.set(WX + u * (1.45 - WX), 2.05 + Math.sin(u * Math.PI) * 1.02, CYL_Z * (1 - u) + 0.38 * u);
      });
    }

    function omegaRadSec() {
      if (S.manualMode || S.sluice <= 0) return 0;
      return (S.sluice / 100) * (1.8 / S.headLoad);
    }

    function update(dt) {
      if (!Number.isFinite(dt)) return;
      dt = T.MathUtils.clamp(dt, 0, 0.05);
      const w = omegaRadSec();
      if (w > 0) {
        S.theta = (S.theta + dt * w) % (Math.PI * 200);
        S.waterPhase = (S.waterPhase + dt * (0.35 + 0.65 * (S.sluice / 100))) % 1;
      }
      sync();
    }

    const camPresets = {
      iso: { pos: [5.8, 3.8, 6.4], look: [0, 1.4, -0.2] },
      front: { pos: [-1.15, 1.8, 4.6], look: [-1.15, 1.3, 0.4] },
      breech: { pos: [2.6, 2.8, 3.4], look: [0.8, 2.0, -0.1] },
      engine: { pos: [-0.2, 2.5, 2.2], look: [-0.8, 1.5, -0.4] },
      suspension: { pos: [-4.4, 2.4, -4.6], look: [-1.1, 1.1, -1.4] },
      top: { pos: [0.1, 8.8, -0.2], look: [0, 1.3, -0.2] }
    };

    const tourSteps = [
      ['1206 Artuklu Sarayı: El-Cezerî’nin Mekanik Mirası', 'Diyarbakırlı mühendis Bedîüzzaman El-Cezerî’nin 1206’da yazdığı Kitâbü’l-Hiyel’deki su yükseltme ve kam mili düzeneklerini birleştiren müze rekonstrüksiyonu.', 'iso', waterWheel, false],
      ['Savak Kapısı ve Alt Akışlı Su Çarkı', 'Savak kapısı açıklığını değiştirin: +X yönünde akan su çark kanatlarını iter. Kapıyı %0’a indirdiğinizde su kesilir ve tüm sistem durur.', 'suspension', sluiceGate, false],
      ['90° Çivili Çark ve Fener Dişli (1:2 Hız Artışı)', 'Su çarkı milindeki 20 dişli dik çark, yatay kam milindeki 10 çubuklu fener dişliyi temas noktasında yukarı (+Y) sürerek dönüşü 90° çevirir ve hızı ikiye katlar.', 'engine', lanternGear, false],
      ['Eksantrik Kam Mili ve Sıralı Devirme Kolları', '90° faz farkıyla dizilmiş dört eksantrik kam lobu, mafsallı kolları ve dikey tunç çubukları dalga sırasıyla kaldırıp indirir.', 'breech', camShaft, false],
      ['Yarık Salınım Kolu ve İkiz Bakır Su Pompası', 'Öndeki krank pimi yarık kolun içinde kayarak dairesel dönüşü karşılıklı doğrusal harekete çevirir; sol piston emerken sağ piston suyu yukarı basar.', 'front', slottedArm, true],
      ['Tek Yönlü Klape Valfler ve Kesintisiz Terfi', 'X-Ray ile valf sandıklarını açın: strok yönüne göre alt emme ve üst basma klapeleri sırayla açılıp kapanır, su çatal borudan üst hazneye yükselir.', 'front', clackValves, true]
    ].map(a => ({ title: a[0], desc: a[1], cam: a[2], part: a[3], cutaway: a[4], explode: 0, sub: 'all' }));

    const ui = K.ui({
      title: '1206 El-Cezerî — Su Çarklı, Kam Milli ve İkiz Pompalı Düzenek',
      sub: 'Kitâbü’l-Hiyel (Diyarbakır, 1206) • 90° Fener Dişli • Eksantrik Kam Mili & Yarık Kollu İkiz Pompa',
      portraitCameraScale: 1.45,
      shadowExtent: 8,
      subsystems: Object.entries(counts).map(([key, count]) => ({ key, label: key, count, color: '#8c6239' })),
      camLabels: {
        iso: 'Genel Düzenek', front: 'İkiz Su Pompası', breech: 'Kam Mili & Hazne',
        engine: '90° Fener Dişli', suspension: 'Savak & Su Çarkı', top: 'Üst'
      },
      sliders: [
        { label: 'Savak Kapısı Açıklığı (Su Debisi)', min: 0, max: 100, step: 1, fmt: v => Math.round(v) + '%' },
        { label: 'Terfi Yükü Direnci (Temsili)', min: 0.6, max: 1.6, step: 0.1, fmt: v => v.toFixed(1) + '×' },
        { label: 'Elle Çevrim Açısı', min: 0, max: 360, step: 1, fmt: v => Math.round(v) + '°' }
      ],
      buttons: { terrain: 'Elle Adımlama Kipi', sweep: 'Su Akışı Vurgusu' },
      telemetryTag: 'EL-CEZERÎ • 1206 • HİYEL',
      statLabels: ['ÇARK DEVRİ', 'KAM MİLİ (2:1)', 'POMPA DURUMU', 'SAVAK AÇIKLIĞI']
    });

    sync();
    return {
      root, parts, ui, camPresets, tourSteps,
      defaultPart: slottedArm, firePart: cylinders, update,
      wheelShaft, camAxleGroup, yokePivot, pistonRig, clacks, leverRig,
      onFire: () => {
        S.sluice = S.sluice > 0 ? 0 : 75;
        S.manualMode = false;
        sync();
        return { ok: true, msg: S.sluice > 0 ? 'Savak kapısı açıldı — su çarkı ve ikiz pompa çalışıyor.' : 'Savak kapısı kapatıldı — su akışı durduruldu.' };
      },
      fireButtonLabel: () => S.sluice > 0 && !S.manualMode ? 'SAVAK KAPISINI KAPAT' : 'SAVAK KAPISINI AÇ (%75)',
      mobileFireButtonLabel: () => S.sluice > 0 && !S.manualMode ? 'Durdur' : 'Çalıştır',
      onSlider: (i, v) => {
        if (!Number.isFinite(v)) return {};
        if (i === 0) { S.sluice = T.MathUtils.clamp(v, 0, 100); S.manualMode = false; }
        if (i === 1) S.headLoad = T.MathUtils.clamp(v, 0.6, 1.6);
        if (i === 2) { S.manualMode = true; S.manualAngle = T.MathUtils.clamp(v, 0, 360); }
        sync(); return {};
      },
      onButton: name => {
        if (name === 'terrain') S.manualMode = !S.manualMode;
        if (name === 'sweep') S.showWater = !S.showWater;
        sync(); return {};
      },
      buttonActive: name => name === 'terrain' ? S.manualMode : name === 'sweep' ? S.showWater : false,
      getSliderValues: () => [S.sluice, S.headLoad, S.manualAngle],
      getStats: () => {
        const rpm1 = omegaRadSec() * 60 / (Math.PI * 2);
        return [
          rpm1.toFixed(1) + ' <span>dev/dk</span>',
          (rpm1 * 2).toFixed(1) + ' <span>dev/dk</span>',
          (S.manualMode ? 'ELLE' : S.sluice > 0 ? 'EMME+BASMA' : 'DURDU') + ' <span>ikiz</span>',
          Math.round(S.sluice) + '% <span>savak</span>'
        ];
      },
      getStatus: () => S.manualMode
        ? { text: 'ELLE İNCELEME KİPİ • KRANK VE KLAPE FAZINI AÇIYLA İZLEYİN', color: '#8c6239' }
        : S.sluice > 0
          ? { text: 'SU ÇARKI DÖNÜYOR • KAM MİLİ VE İKİZ BAKIR POMPA AKTİF', color: '#2b7a9e' }
          : { text: 'SAVAK KAPALI • SU ÇARKI VE POMPA TAM DURDU', color: '#523924' },
      applyTextures: K.applyTextures, setTexture: K.setTexture, toggleRelief: K.toggleRelief
    };
  };
})();

