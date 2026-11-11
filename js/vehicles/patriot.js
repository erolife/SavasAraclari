/* MIM-104 Patriot: M901 fırlatma istasyonu ve AN/MPQ-53 faz dizinli radar. Müze referanslı yaklaşık sergi modeli; hava savunma/angajman simülatörü değildir. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.patriot = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'patriot');
    const { T, root, parts, mats: M, mesh, box, cyl, ring, pipe, beam, instances } = K;

    const S = {
      az: 20, elev: 38, scanRate: 50,
      stow: false, showBeam: true,
      ammo: 4, fired: [false, false, false, false],
      launching: false, activeCell: 0, flight: 0,
      scanPhase: 0, genPhase: 0
    };
    const counts = {}; let n = 0;

    M.paint.color.setHex(0x555f47); M.paint.roughness = 0.78;
    const desertOlive = M.paint.clone(); desertOlive.color.setHex(0x636b52); desertOlive.userData.paint = true;
    const radomeMat = M.white.clone(); radomeMat.color.setHex(0xbfc4b8);
    const copperMat = M.brass.clone(); copperMat.color.setHex(0xb87b3e); copperMat.metalness = 0.78; copperMat.roughness = 0.35;
    const missileMat = M.white.clone(); missileMat.color.setHex(0xdadcd6);
    const beamMat = new T.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28, depthWrite: false, side: T.DoubleSide });
    const coreBeamMat = new T.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.62, depthWrite: false });
    const plumeMat = new T.MeshBasicMaterial({ color: 0xff9f2e, transparent: true, opacity: 0.88, depthWrite: false });

    function G(parent, pos, name) {
      const g = new T.Group(); g.position.set(...pos); if (name) g.name = name; parent.add(g); return g;
    }
    function P(key, name, sub, desc, exp = [0, 0.5, 0], outer = false, parent = root) {
      counts[sub] = (counts[sub] || 0) + 1;
      const p = K.part(key, ++n + '. ' + name, sub, [0, 0, 0], exp, desc, outer, parent);
      p.userData.material = 'Kaynaklı çelik/alüminyum şasi, kompozit kanister, dalga kılavuzu ve ferrit faz modülleri';
      p.userData.spec = 'MIM-104A/C (PAC-2) & AN/MPQ-53 • müze referanslı yaklaşık oranlar';
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

    const LX = -3.6, RX = 3.8;
    const WR = 0.45, WEFF = WR + 0.027; // K.wheel diş yüksekliği payı

    // --------------------------------------------------------- 1..3 M860 RÖMORK VE DESTEK AYAKLARI
    const trailerLift = G(root, [0, 0, 0], 'launcher-lift');
    const trailer = P('trailer', 'M860 Yarı Römork Şasisi', 'Şasi ve Destek',
      'M901 fırlatma istasyonunu taşıyan iki dingilli yarı römork. Atış konumunda dört köşe denge ayaklarıyla teraziye alınır.',
      [-0.8, -0.2, 0], false, trailerLift);
    for (const s of [-1, 1]) box(trailer, [0.16, 0.28, 7.6], [LX + s * 0.92, 0.92, 0], M.paint);
    box(trailer, [2.25, 0.08, 6.4], [LX, 1.08, -0.4], desertOlive);
    // Deveboynu ön çeki bölümü
    box(trailer, [1.85, 0.22, 1.5], [LX, 1.24, 3.35], M.paint);
    beam(trailer, [LX - 0.84, 0.94, 2.6], [LX - 0.84, 1.24, 3.0], 0.14, M.paint);
    beam(trailer, [LX + 0.84, 0.94, 2.6], [LX + 0.84, 1.24, 3.0], 0.14, M.paint);
    cyl(trailer, 0.09, 0.18, [LX, 1.06, 3.85], M.dark); // kingpin

    const axles = P('axles', 'Arka Tandem Dingiller ve Çift Tekerlekler', 'Şasi ve Destek',
      'Yol intikalinde yükü taşıyan arka çift dingil takımı ve ön park dikmeleri. Atış konumunda tekerlekler yerden hafifçe kesilir.',
      [-1.0, -0.4, -0.8], false, trailerLift);
    const roadWheels = [];
    for (const z of [-2.35, -3.45]) {
      cyl(axles, 0.065, 2.35, [LX, WEFF, z], M.dark, 'x');
      for (const s of [-1, 1]) {
        box(axles, [0.12, 0.26, 0.42], [LX + s * 0.92, 0.72, z], M.steel);
        const wg = G(axles, [LX + s * 1.12, WEFF, z], 'wheel');
        K.wheel(wg, 0, 0, 0, WR, 0.22);
        roadWheels.push(wg);
      }
    }
    // Ön park dikmeleri (yol konumunda y=0 temaslı)
    const dollyLegs = G(axles, [LX, 0, 2.85], 'dolly-legs');
    for (const s of [-1, 1]) {
      cyl(dollyLegs, 0.055, 0.92, [s * 0.72, 0.50, 0], M.steel);
      box(dollyLegs, [0.24, 0.04, 0.28], [s * 0.72, 0.02, 0], M.dark);
    }

    const outriggers = P('outriggers', 'Dört Köşe Hidrolik Denge Ayakları', 'Şasi ve Destek',
      'Atış sırasında geri tepme ve rüzgâr yükünü zemine aktaran dört açılır kol ve vidalı kriko pabuçları.',
      [-1.2, -0.3, 0], false);
    const outriggerRig = [];
    for (const [sx, sz, zBase, ang] of [
      [-1, 1, 2.15, 0.62], [1, 1, 2.15, -0.62],
      [-1, -1, -3.65, 2.52], [1, -1, -3.65, -2.52]
    ]) {
      const piv = G(outriggers, [LX + sx * 0.98, 0.92, zBase], 'outrigger-piv');
      box(piv, [0.18, 0.18, 1.25], [0, 0, 0.62], M.paint);
      const jack = G(piv, [0, 0, 1.18], 'outrigger-jack');
      cyl(jack, 0.075, 0.68, [0, -0.22, 0], M.steel);
      const foot = G(jack, [0, -0.89, 0], 'outrigger-foot');
      cyl(foot, 0.05, 0.52, [0, 0.26, 0], M.steel);
      cyl(foot, 0.26, 0.06, [0, 0, 0], M.dark); // alt yüzey y = -0.03 -> foot.y = -0.89 + 0.92 = +0.03 -> min.y = 0.000
      outriggerRig.push({ piv, foot, deployYaw: ang, stowYaw: sx > 0 ? (sz > 0 ? 0 : Math.PI) : (sz > 0 ? 0 : Math.PI) });
    }

    // --------------------------------------------------------- 4..5 JENERATÖR VE ELEKTRONİK KABİNİ
    const genset = P('genset', '15 kW Dizel Jeneratör ve Elektronik Kabini', 'Güç ve Komuta',
      'Ön deveboynu üzerindeki güç ünitesi ve veri terminali kabini. X-Ray ile iç motor ve hidrolik pompa görülür.',
      [-0.8, 0.7, 1.0], true, trailerLift);
    const genMat = desertOlive.clone(); genMat.side = T.DoubleSide; genMat.userData.paint = true;
    box(genset, [1.76, 0.96, 1.32], [LX, 1.84, 3.32], genMat);
    for (const y of [1.62, 1.82, 2.02]) box(genset, [0.68, 0.04, 0.04], [LX - 0.42, y, 3.99], M.dark);
    cyl(genset, 0.045, 0.42, [LX + 0.62, 2.52, 3.65], M.dark); // egzoz borusu
    cyl(genset, 0.02, 1.65, [LX - 0.75, 3.12, 3.82], M.steel); // VHF/veri anteni

    const genCore = P('genCore', 'Jeneratör Motoru ve Hidrolik Pompa Paketi', 'Güç ve Komuta',
      'Fırlatıcı döner tablasını ve yükseliş silindirlerini besleyen iç dizel motor, alternatör ve hidrolik güç ünitesi.',
      [-0.8, 1.1, 1.2], false, trailerLift);
    box(genCore, [0.68, 0.48, 0.74], [LX - 0.34, 1.64, 3.32], M.dark);
    cyl(genCore, 0.19, 0.46, [LX + 0.26, 1.62, 3.32], M.brass, 'x');
    const genFan = G(genCore, [LX - 0.72, 1.64, 3.32], 'gen-fan');
    ring(genFan, 0.20, [0, 0, 0], M.steel, 0.02, [0, Math.PI / 2, 0]);
    for (let i = 0; i < 6; i++) box(genFan, [0.02, 0.34, 0.05], [0, 0, 0], M.steel, [i * Math.PI / 3, 0, 0]);

    // --------------------------------------------------------- 6..9 M901 FIRLATICI VE KANİSTERLER
    const turntableYaw = G(trailerLift, [LX, 1.12, -1.05], 'turntable-yaw');
    const turntable = P('turntable', 'M901 Döner Tabla ve Dişli Çemberi', 'M901 Fırlatıcı',
      'Kanister paketini atış sektörüne yönlendiren döner tabla. Fırlatmadan önce hedef sektörüne döner; atış anında sabitlenir.',
      [-0.6, 0.5, -0.3], false, turntableYaw);
    cyl(turntable, 0.96, 0.18, [0, 0.09, 0], M.dark);
    ring(turntable, 0.98, [0, 0.12, 0], M.steel, 0.035, [Math.PI / 2, 0, 0]);
    box(turntable, [1.72, 0.24, 2.35], [0, 0.30, -0.15], M.paint);
    for (const s of [-1, 1]) {
      box(turntable, [0.18, 0.58, 0.48], [s * 0.72, 0.66, -1.08], M.paint); // arka mafsal kulakları
      cyl(turntable, 0.055, 0.26, [s * 0.72, 0.84, -1.08], M.steel, 'x');
    }

    const boomElev = G(turntableYaw, [0, 0.84, -1.08], 'boom-elev');
    const trunnion = P('trunnion', 'Kaldırma Beşiği ve Arka Mafsal', 'M901 Fırlatıcı',
      'Dörtlü füze kanisterlerini taşıyan çelik kafes beşik. Arka muylu etrafında 0° ile 38° atış açısı arasında yükselir.',
      [-0.6, 0.9, -0.5], false, boomElev);
    for (const s of [-1, 1]) box(trunnion, [0.14, 0.20, 4.95], [s * 0.76, 0.12, 1.95], M.paint);
    for (const z of [-0.1, 1.2, 2.6, 4.0]) box(trunnion, [1.68, 0.14, 0.16], [0, 0.12, z], M.steel);

    const elevRams = P('elevRams', 'İkiz Hidrolik Yükseliş Silindirleri', 'M901 Fırlatıcı',
      'Döner tabla ile kaldırma beşiği arasında uzanan çift kademeli hidrolik silindirler; açı değiştikçe boyları güncellenir.',
      [-0.6, 0.7, 0.2], false, turntableYaw);
    const rams = [];
    for (const s of [-1, 1]) {
      const barrel = cyl(elevRams, 0.075, 1, [0, 0, 0], M.paint);
      const piston = cyl(elevRams, 0.048, 1, [0, 0, 0], M.steel);
      rams.push({ s, barrel, piston });
    }

    const canisters = P('canisters', 'Dörtlü Füze Kanister Paketi (2×2)', 'M901 Fırlatıcı',
      'Her biri bir MIM-104 PAC-2 füzesi barındıran dört yivli alüminyum kanister. Hem nakliye kabı hem fırlatma tüpü görevi görür; X-Ray ile içteki füzeler izlenir.',
      [-0.6, 1.4, 0.2], true, boomElev);
    const canMat = desertOlive.clone(); canMat.side = T.DoubleSide; canMat.userData.paint = true;
    const cellOffsets = [[-0.52, 1.38], [0.52, 1.38], [-0.52, 0.48], [0.52, 0.48]]; // [x, y] boomElev içinde
    const CAN_Z = 1.92, CAN_L = 5.45;
    const ribTransforms = [];
    cellOffsets.forEach(([cx, cy]) => {
      // İçi boş kutu tüp (4 duvar + arka kapak) ki füzeler X-Ray ve ön ağızdan net görünsün
      box(canisters, [0.92, 0.045, CAN_L], [cx, cy + 0.435, CAN_Z], canMat);
      box(canisters, [0.92, 0.045, CAN_L], [cx, cy - 0.435, CAN_Z], canMat);
      box(canisters, [0.045, 0.83, CAN_L], [cx - 0.435, cy, CAN_Z], canMat);
      box(canisters, [0.045, 0.83, CAN_L], [cx + 0.435, cy, CAN_Z], canMat);
      for (let k = 0; k < 9; k++) {
        const rz = CAN_Z - 2.4 + k * 0.6;
        ribTransforms.push({ pos: [cx, cy + 0.465, rz] }, { pos: [cx, cy - 0.465, rz] });
      }
    });
    instances(canisters, new T.BoxGeometry(0.96, 0.03, 0.07), M.paint, ribTransforms);
    // Ön ve arka birleştirme çerçeveleri
    for (const z of [CAN_Z - CAN_L / 2 + 0.08, CAN_Z, CAN_Z + CAN_L / 2 - 0.08]) {
      box(canisters, [2.04, 0.07, 0.14], [0, 0.93, z], M.steel);
      box(canisters, [0.08, 1.88, 0.14], [0, 0.93, z], M.steel);
    }

    // --------------------------------------------------------- 10..12 KIRILABİLİR KAPAKLAR, FÜZELER VE KABLOLAR
    const diaphragms = P('diaphragms', 'Kırılabilir Ön Kanister Kapakları', 'PAC-2 Füzeleri',
      'Füze ateşlendiğinde burun konisinin delip geçtiği çapraz çentikli ön sızdırmazlık kapakları. Ateşlenen hücrenin kapağı açılır.',
      [-0.6, 1.5, 1.2], false, boomElev);
    const cellCovers = cellOffsets.map(([cx, cy]) => {
      const intact = G(diaphragms, [cx, cy, CAN_Z + CAN_L / 2 + 0.01], 'cover-intact');
      box(intact, [0.84, 0.80, 0.025], [0, 0, 0], radomeMat);
      box(intact, [0.82, 0.02, 0.035], [0, 0, 0.005], M.dark, [0, 0, Math.PI / 4]);
      box(intact, [0.82, 0.02, 0.035], [0, 0, 0.005], M.dark, [0, 0, -Math.PI / 4]);
      const burst = G(diaphragms, [cx, cy, CAN_Z + CAN_L / 2 + 0.01], 'cover-burst');
      for (const [dx, dy, rx, ry] of [[0, 0.36, -0.85, 0], [0, -0.36, 0.85, 0], [-0.36, 0, 0, -0.85], [0.36, 0, 0, 0.85]]) {
        box(burst, [0.28, 0.28, 0.02], [dx, dy, 0.10], radomeMat, [rx, ry, 0]);
      }
      burst.visible = false;
      return { intact, burst };
    });

    const missiles = P('missiles', '4 × MIM-104 PAC-2 Füzesi ve Kanatçıkları', 'PAC-2 Füzeleri',
      'Uzunluk ~5,2 m, çap ~41 cm, katı yakıtlı tek kademeli önleme füzesi. Ateşlemede sıradaki hücreden kanister açısı boyunca yükselir.',
      [-0.6, 1.7, 0.8], false, boomElev);
    const missileGroups = cellOffsets.map(([cx, cy], idx) => {
      const mg = G(missiles, [cx, cy, CAN_Z], 'missile-' + idx);
      cyl(mg, 0.20, 3.85, [0, 0, -0.35], missileMat, 'z');
      mesh(mg, new T.ConeGeometry(0.20, 1.10, 28), radomeMat, [0, 0, 2.12], [Math.PI / 2, 0, 0]);
      cyl(mg, 0.16, 0.18, [0, 0, -2.35], M.dark, 'z'); // roket lülesi
      for (let f = 0; f < 4; f++) {
        const fg = G(mg, [0, 0, -2.02], 'fin');
        fg.rotation.z = f * Math.PI / 2 + Math.PI / 4;
        box(fg, [0.02, 0.34, 0.44], [0, 0.24, 0], M.dark);
      }
      const plume = new T.Mesh(new T.ConeGeometry(0.24, 1.45, 16), plumeMat);
      plume.rotation.x = -Math.PI / 2;
      plume.position.set(0, 0, -3.15);
      plume.visible = false;
      mg.add(plume);
      return { mg, cx, cy, plume };
    });

    const umbilicals = P('umbilicals', 'Veri Bağlantı Kabloları ve Arka Gaz Kapakları', 'PAC-2 Füzeleri',
      'Fırlatma öncesi füzeye güdüm verisi aktaran arka göbek konnektörleri ve katı yakıt egzoz çıkışları.',
      [-0.6, 1.3, -1.0], false, boomElev);
    cellOffsets.forEach(([cx, cy]) => {
      ring(umbilicals, 0.26, [cx, cy, CAN_Z - CAN_L / 2 - 0.02], M.dark, 0.03);
      pipe(umbilicals, [[cx * 0.5, 0.22, -0.55], [cx * 0.8, cy - 0.25, -0.82], [cx, cy, CAN_Z - CAN_L / 2 - 0.03]], 0.024, M.rubber);
    });

    // --------------------------------------------------------- 13..18 AN/MPQ-53 FAZ DİZİNLİ RADAR SETİ
    const radarTrailer = P('radarTrailer', 'AN/MPQ-53 Radar Römorku ve Destek Ayakları', 'Şasi ve Destek',
      'Faz dizinli radar sığınağını taşıyan yarı römork ve zemine basan dört sabit denge ayağı.',
      [1.0, -0.3, 0], false);
    for (const s of [-1, 1]) box(radarTrailer, [0.16, 0.28, 7.2], [RX + s * 1.02, 0.92, -0.2], M.paint);
    box(radarTrailer, [2.36, 0.10, 6.8], [RX, 1.08, -0.2], desertOlive);
    for (const z of [-2.2, -3.3]) {
      cyl(radarTrailer, 0.065, 2.45, [RX, WEFF + 0.05, z], M.dark, 'x');
      for (const s of [-1, 1]) K.wheel(radarTrailer, RX + s * 1.18, WEFF + 0.05, z, WR, 0.22);
    }
    for (const [sx, zBase] of [[-1, 2.55], [1, 2.55], [-1, -3.35], [1, -3.35]]) {
      box(radarTrailer, [0.55, 0.16, 0.18], [RX + sx * 1.32, 0.92, zBase], M.paint);
      cyl(radarTrailer, 0.065, 0.90, [RX + sx * 1.54, 0.48, zBase], M.steel);
      cyl(radarTrailer, 0.24, 0.06, [RX + sx * 1.54, 0.03, zBase], M.dark); // alt yüzey y = 0.000
    }
    // Fırlatıcı ile radar arası saha fiber/güç kablo hattı (zemin üstü y >= 0.025)
    pipe(radarTrailer, [[-2.4, 0.04, 1.2], [-0.4, 0.03, 1.6], [1.6, 0.03, 1.3], [2.7, 0.04, 0.9]], 0.025, M.rubber);

    const radarShelter = P('radarShelter', 'Radar Ekipman Sığınağı Dış Kabuğu', 'AN/MPQ-53 Radar',
      'Arama, hedef takibi, IFF ve füze güdümünü (Track-Via-Missile) tek çatıda birleştiren zırhlı elektronik kabin. X-Ray iç rafları açar.',
      [1.0, 0.9, -0.3], true);
    const shelterMat = desertOlive.clone(); shelterMat.side = T.DoubleSide; shelterMat.userData.paint = true;
    box(radarShelter, [2.34, 2.25, 4.45], [RX, 2.26, -1.15], shelterMat);
    // Üst klima ve soğutucu eşanjör üniteleri
    box(radarShelter, [1.82, 0.38, 1.45], [RX, 3.56, -1.85], M.paint);
    for (const x of [-0.45, 0.45]) ring(radarShelter, 0.28, [RX + x, 3.76, -1.85], M.dark, 0.025, [Math.PI / 2, 0, 0]);

    const radarRacks = P('radarRacks', 'Yüksek Güçlü Verici ve Sinyal İşleme Rafları', 'AN/MPQ-53 Radar',
      'Sığınak içindeki yüksek gerilim verici tüpleri, darbe sıkıştırma birimleri, sıvı soğutma boruları ve sayısal sinyal işlemci dolapları.',
      [1.0, 1.1, -0.3], false);
    for (let i = 0; i < 4; i++) {
      const rz = -2.65 + i * 0.95;
      box(radarRacks, [0.68, 1.72, 0.72], [RX - 0.65, 2.04, rz], M.dark);
      box(radarRacks, [0.68, 1.72, 0.72], [RX + 0.65, 2.04, rz], M.steel);
    }
    pipe(radarRacks, [[RX - 0.55, 2.95, -2.6], [RX - 0.55, 2.95, 0.8], [RX, 2.55, 1.45]], 0.045, copperMat);

    // 25° geriye eğik ön faz dizinli anten yüzü (fiziksel olarak dönmez!)
    const TILT = -25 * Math.PI / 180;
    const arrayFrame = G(root, [RX, 2.38, 1.52], 'radar-array-frame');
    arrayFrame.rotation.x = TILT;

    const radarFace = P('radarFace', 'Faz Dizinli Ana Anten Kubbesi ve Yardımcı Diziler', 'AN/MPQ-53 Radar',
      'Ø ~2,44 m ana faz dizinli mercek, beş yardımcı TVM (füze üzerinden takip) dizisi ve alt IFF anteni. Mekanik dönüş yapmaz; X-Ray faz modüllerini gösterir.',
      [1.0, 0.8, 1.2], true, arrayFrame);
    const faceHousingMat = desertOlive.clone(); faceHousingMat.side = T.DoubleSide; faceHousingMat.userData.paint = true;
    box(radarFace, [2.88, 3.05, 0.36], [0, 0, -0.18], faceHousingMat);
    const radomeShell = radomeMat.clone(); radomeShell.side = T.DoubleSide;
    cyl(radarFace, 1.22, 0.06, [0, 0.24, 0.04], radomeShell, 'z'); // Ø 2.44 m ana dairesel dizi
    ring(radarFace, 1.24, [0, 0.24, 0.05], M.paint, 0.035);
    // Yardımcı TVM dairesel/alt diziler ve alt yatay IFF dizisi
    for (const [ax, ay, ar] of [[-0.98, -0.88, 0.24], [-0.42, -1.04, 0.19], [0.98, -0.88, 0.24], [1.05, 1.12, 0.20], [-1.05, 1.12, 0.20]]) {
      cyl(radarFace, ar, 0.05, [ax, ay, 0.04], radomeShell, 'z');
      ring(radarFace, ar + 0.015, [ax, ay, 0.05], M.dark, 0.018);
    }
    box(radarFace, [1.55, 0.22, 0.06], [0, -1.32, 0.04], radomeShell); // IFF dizisi

    const phaseModules = P('phaseModules', 'Ferrit Faz Kaydırıcı Modül Ağı ve Dalga Kılavuzu', 'AN/MPQ-53 Radar',
      'Ana radomun arkasındaki optik besleme boynuzu ve binlerce ferrit faz kaydırıcı elemanı temsil eden petek modül ızgarası.',
      [1.0, 0.8, 0.8], false, arrayFrame);
    cyl(phaseModules, 1.16, 0.08, [0, 0.24, -0.06], M.dark, 'z');
    const modTransforms = [];
    for (let gx = -9; gx <= 9; gx++) {
      for (let gy = -9; gy <= 9; gy++) {
        const px = gx * 0.115 + (gy % 2) * 0.057, py = gy * 0.102;
        if (Math.hypot(px, py) <= 1.06) modTransforms.push({ pos: [px, 0.24 + py, -0.01] });
      }
    }
    instances(phaseModules, new T.CylinderGeometry(0.036, 0.036, 0.08, 6), copperMat, modTransforms);
    // Arkadaki optik besleme hunisi (space-fed lens mimarisi)
    mesh(phaseModules, new T.ConeGeometry(0.85, 0.95, 24, 1, true), copperMat, [0, 0.24, -0.52], [-Math.PI / 2, 0, 0]);

    const radarBeam = P('radarBeam', 'Elektronik Faz Taramalı RF Hüzme Gösterimi', 'Güç ve Komuta',
      'Anten gövdesi sabit dururken faz farklarıyla mikrosaniyeler içinde yönlendirilen temsili arama ve güdüm hüzmesi. Tarama hızı 0% iken durur.',
      [1.0, 0.8, 1.8], false, arrayFrame);
    const beamSteer = G(radarBeam, [0, 0.24, 0.08], 'electronic-beam');
    const outerCone = new T.Mesh(new T.ConeGeometry(0.95, 7.2, 24, 1, true), beamMat);
    outerCone.rotation.x = -Math.PI / 2;
    outerCone.position.set(0, 0, 3.6);
    beamSteer.add(outerCone);
    const innerRay = new T.Mesh(new T.CylinderGeometry(0.035, 0.14, 7.2, 12), coreBeamMat);
    innerRay.rotation.x = Math.PI / 2;
    innerRay.position.set(0, 0, 3.6);
    beamSteer.add(innerRay);

    // --------------------------------------------------------- KİNEMATİK VE SENKRONİZASYON
    function sync() {
      const stowed = S.stow;
      // Yol konumunda römork 4 cm iner, ön dikmeler ve arka tekerlekler y=0'a oturur; atış konumunda 4 denge pabucu y=0'a basar
      trailerLift.position.y = stowed ? 0 : 0.04;
      dollyLegs.position.y = stowed ? 0 : 0.18;
      outriggerRig.forEach(o => {
        o.piv.rotation.y = stowed ? o.stowYaw : o.deployYaw;
        o.foot.position.y = stowed ? -0.45 : -0.89; // -0.89 + 0.92 (piv.y) = +0.03 -> pabuç altı y = 0.000
      });

      const effAz = stowed ? 0 : S.az;
      const effElev = stowed ? 0 : S.elev;
      turntableYaw.rotation.y = effAz * Math.PI / 180;
      boomElev.rotation.x = -effElev * Math.PI / 180;

      // Hidrolik yükseliş silindirleri: turntableYaw uzayında alt pimden boomElev üzerindeki üst pime
      const eRad = effElev * Math.PI / 180;
      const upY = 0.84 + Math.sin(eRad) * 1.95 + Math.cos(eRad) * 0.06;
      const upZ = -1.08 + Math.cos(eRad) * 1.95 - Math.sin(eRad) * 0.06;
      rams.forEach(({ s, barrel, piston }) => {
        const a = [s * 0.62, 0.36, 0.68], b = [s * 0.62, upY, upZ];
        const mid = [a[0], a[1] * 0.45 + b[1] * 0.55, a[2] * 0.45 + b[2] * 0.55];
        stretch(barrel, a, mid);
        stretch(piston, mid, b);
      });

      // Füzeler ve kırılabilir kapaklar
      cellCovers.forEach((c, idx) => {
        const opened = S.fired[idx];
        c.intact.visible = !opened;
        c.burst.visible = opened;
      });
      missileGroups.forEach((m, idx) => {
        if (S.launching && S.activeCell === idx) {
          m.mg.visible = true;
          const dist = Math.pow(S.flight, 1.55) * 18;
          m.mg.position.set(m.cx, m.cy, CAN_Z + dist);
          m.plume.visible = true;
          m.plume.scale.setScalar(0.85 + 0.25 * Math.sin(S.flight * 40));
        } else {
          m.mg.visible = !S.fired[idx];
          m.mg.position.set(m.cx, m.cy, CAN_Z);
          m.plume.visible = false;
        }
      });

      // Elektronik faz taraması: radarFace SABİT kalır, yalnız beamSteer elektronik olarak tarar
      beamSteer.visible = S.showBeam && !stowed;
      const azBeam = Math.sin(S.scanPhase) * 0.68; // ~±39° elektronik yanca tarama
      const elBeam = 0.12 + Math.sin(S.scanPhase * 2.3) * 0.22; // katmanlı yükseliş taraması
      beamSteer.rotation.set(-elBeam, azBeam, 0);
      genFan.rotation.x = S.genPhase;
    }

    function update(dt) {
      if (!Number.isFinite(dt)) return;
      dt = T.MathUtils.clamp(dt, 0, 0.05);
      if (!S.stow && S.scanRate > 0) {
        S.scanPhase = (S.scanPhase + dt * (S.scanRate / 100) * 3.4) % (Math.PI * 200);
      }
      if (!S.stow) S.genPhase = (S.genPhase + dt * 8) % (Math.PI * 2);
      if (S.launching) {
        S.flight += dt * 1.15;
        if (S.flight >= 1.2) {
          S.launching = false;
          S.flight = 0;
        }
      }
      sync();
    }

    const camPresets = {
      iso: { pos: [11.5, 6.8, 12.5], look: [0, 1.8, 0] },
      front: { pos: [-3.6, 3.4, 9.8], look: [-3.6, 2.2, 0.5] },
      breech: { pos: [-8.5, 3.6, -5.8], look: [-3.6, 2.1, -0.5] },
      engine: { pos: [6.8, 3.2, 8.6], look: [3.8, 2.3, 1.2] },
      suspension: { pos: [-7.6, 1.6, 4.4], look: [-3.6, 0.8, 0] },
      top: { pos: [0.1, 17.5, 0.1], look: [0, 1.5, 0] }
    };

    const tourSteps = [
      ['Patriot Batarya Çifti: Fırlatıcı ve Radar', 'MIM-104 Patriot tek başına ateş eden bir rampa değildir; soldaki M901 fırlatma istasyonu ile sağdaki AN/MPQ-53 faz dizinli radar veri bağıyla birlikte çalışır.', 'iso', canisters, false],
      ['Dörtlü PAC-2 Kanister Paketi ve 38° Yükseliş', 'Her kapalı kanister hem taşıma kutusu hem fırlatma tüpüdür. İkiz hidrolik silindirler beşiğe tipik 38° sabit atış açısını verir; X-Ray ile içteki dört füzeyi görün.', 'front', missiles, true],
      ['Kırılabilir Ön Kapak ve Kanisterden Çıkış', 'Ateşleme düğmesine basın: sıradaki hücrenin ön sızdırmazlık kapağı yarılır ve MIM-104 füzesi kanister doğrultusunda yükselir.', 'front', diaphragms, false],
      ['AN/MPQ-53 Faz Dizinli Radar: Dönmeyen Anten', 'Klasik radarların aksine bu anten gövdesi dönmez! X-Ray ile Ø 2,44 m merceğin arkasındaki binlerce ferrit faz kaydırıcı modülü ve optik besleme hunisini inceleyin.', 'engine', phaseModules, true],
      ['Elektronik Hüzme Yönlendirme ve TVM', 'Tarama hızını değiştirin: anten sabit kalırken RF hüzmesi faz farklarıyla mikrosaniyeler içinde sektörü tarar. Hız 0% olduğunda tarama durur.', 'engine', radarBeam, false],
      ['Denge Ayakları ve Yol / Atış Dönüşümü', '“Yol / Atış Konumu” düğmesiyle kanisterleri 0°’ye indirip dört denge ayağını katlayın; sistem çekiciye bağlanmaya hazır intikal düzenine geçer.', 'suspension', outriggers, false]
    ].map(a => ({ title: a[0], desc: a[1], cam: a[2], part: a[3], cutaway: a[4], explode: 0, sub: 'all' }));

    const ui = K.ui({
      title: 'MIM-104 Patriot — M901 Fırlatıcı ve AN/MPQ-53 Radar',
      sub: '1984 hizmet / 1991 PAC-2 • 4× Kanister • Elektronik Faz Taramalı Radar',
      portraitCameraScale: 1.5,
      shadowExtent: 14,
      subsystems: Object.entries(counts).map(([key, count]) => ({ key, label: key, count, color: '#555f47' })),
      camLabels: {
        iso: 'Batarya Genel', front: 'Kanister Önü', breech: 'M901 Arka Mafsal',
        engine: 'AN/MPQ-53 Radar', suspension: 'Römork & Ayaklar', top: 'Üst'
      },
      sliders: [
        { label: 'Fırlatıcı Yanca Açısı', min: -90, max: 90, step: 1, fmt: v => Math.round(v) + '°' },
        { label: 'Kanister Yükseliş Açısı', min: 0, max: 38, step: 1, fmt: v => Math.round(v) + '°' },
        { label: 'Elektronik Radar Tarama Hızı', min: 0, max: 100, step: 1, fmt: v => Math.round(v) + '%' }
      ],
      buttons: { terrain: 'Yol / Atış Konumu', sweep: 'RF Hüzme Gösterimi' },
      telemetryTag: 'M901 • AN/MPQ-53 • PAC-2',
      statLabels: ['FIRLATICI AÇISI', 'KANİSTER YÜKSELİŞ', 'ELEKTRONİK TARAMA', 'HAZIR FÜZE']
    });

    sync();
    return {
      root, parts, ui, camPresets, tourSteps,
      defaultPart: canisters, firePart: missiles, update,
      arrayFrame, beamSteer,
      onFire: () => {
        if (S.stow) return { ok: false, msg: 'Yol konumunda atış kilitli — önce atış konumuna geçin.' };
        if (S.ammo <= 0) {
          S.ammo = 4; S.fired = [false, false, false, false]; S.launching = false; S.flight = 0;
          sync();
          return { ok: true, refill: true, msg: 'İkmal: 4 × MIM-104 kanisteri yüklendi.' };
        }
        if (S.launching && S.flight < 0.35) return { ok: false };
        const cell = 4 - S.ammo;
        S.ammo--; S.fired[cell] = true; S.activeCell = cell; S.launching = true; S.flight = 0;
        sync();
        if (ctx.audio && ctx.audio.playCannonFire) ctx.audio.playCannonFire();
        return { ok: true, msg: (cell + 1) + '. kanisterden MIM-104 ateşlendi — kalan ' + S.ammo };
      },
      fireButtonLabel: () => S.stow ? 'YOL KONUMUNDA KİLİTLİ' : S.ammo <= 0 ? 'KANİSTER İKMALİ (4 FÜZE)' : 'MIM-104 FIRLAT (' + S.ammo + '/4)',
      mobileFireButtonLabel: () => S.stow ? 'Kilitli' : S.ammo <= 0 ? 'İkmal' : 'Fırlat',
      onSlider: (i, v) => {
        if (!Number.isFinite(v)) return {};
        if (i === 0) S.az = T.MathUtils.clamp(v, -90, 90);
        if (i === 1) S.elev = T.MathUtils.clamp(v, 0, 38);
        if (i === 2) S.scanRate = T.MathUtils.clamp(v, 0, 100);
        sync(); return {};
      },
      onButton: name => {
        if (name === 'terrain') { S.stow = !S.stow; S.launching = false; S.flight = 0; }
        if (name === 'sweep') S.showBeam = !S.showBeam;
        sync(); return {};
      },
      buttonActive: name => name === 'terrain' ? S.stow : name === 'sweep' ? S.showBeam : false,
      getSliderValues: () => [S.az, S.elev, S.scanRate],
      getStats: () => [
        (S.stow ? 0 : Math.round(S.az)) + '° <span>yanca</span>',
        (S.stow ? 0 : Math.round(S.elev)) + '° <span>yükseliş</span>',
        (S.stow || S.scanRate === 0 ? 'DURDU' : Math.round(S.scanRate) + '%') + ' <span>faz tarama</span>',
        S.ammo + ' <span>/ 4 PAC-2</span>'
      ],
      getStatus: () => S.launching
        ? { text: 'MIM-104 KANİSTERDEN ÇIKIŞ • TVM GÜDÜM AKTİF', color: '#c2612c' }
        : S.stow
          ? { text: 'M901 YOL İNTİKAL KONUMUNDA • ATIŞ KİLİTLİ', color: '#647078' }
          : { text: S.scanRate > 0 ? 'AN/MPQ-53 ELEKTRONİK SEKTÖR TARAMASI AKTİF' : 'BATARYA HAZIR • RADAR TARAMASI DURAKLATILDI', color: '#555f47' },
      applyTextures: K.applyTextures, setTexture: K.setTexture, toggleRelief: K.toggleRelief
    };
  };
})();

