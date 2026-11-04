/* =============================================================================
 * Karşı Ağırlıklı Trebuchet (Mancınık / Karabuğa) — 1250 (14 mekanik grup)
 * Klasik script olarak yüklenir; sayfa file:// ile açıldığında da çalışır.
 * Adaptör kalıbı: arayüz tanımı, mekanik durum ve animasyon bu modülün içindedir.
 *
 * Mekanik model (basitleştirilmiş, açıklamalı):
 *  - Kol açısı θ, karşı ağırlığın potansiyel enerjisinden hesaplanan açısal hızla döner.
 *  - Sapan, kol ucuna asılı ve asılma noktası hareket eden bir sarkaç olarak sayısal
 *    entegre edilir (çift sarkaç kamçı etkisi). Gülle, oluğa sürtünerek başlar, yerden kalkar
 *    ve hız vektörü "Bırakma Açısı"na ulaştığında sapandan kurtulur.
 *  - Bırakılan güllenin hız büyüklüğü enerji bütçesinden gelir: v = √(2·η·M·g·Δh / m).
 *    η (verim) menteşeli ağırlıkta %70, sabit ağırlıkta %55 alınmıştır (varsayım).
 *  - Ölçüler (10 m uzun kol, 1:4 kol oranı, 6 t karşı ağırlık, 100 kg gülle) tipik
 *    rekonstrüksiyon mertebesindedir; tarihî tek bir makineyi birebir temsil etmez.
 * ========================================================================== */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.trebuchet = function buildTrebuchet(ctx) {
    const { THREE, scene, addCADMesh, createPartGroup, addInstancedMesh } = ctx;
    const audio = ctx.audio || null;
    const notify = ctx.notify || (() => {});

    // ------------------------------------------------------------------------
    // ÖLÇÜLER (1 birim = 1 m). Atış yönü +Z, y yukarı.
    // ------------------------------------------------------------------------
    const PY = 6.5;                 // ana mil yüksekliği
    const RL = 10.0;                // uzun kol
    const RS = 2.5;                 // kısa kol (oran 1:4)
    const LS = 8.0;                 // sapan boyu
    const FX = 1.5;                 // A-çerçevelerin yanal konumu
    const STONE_KG = 100;
    const STONE_R = Math.cbrt((3 * STONE_KG) / (4 * Math.PI * 2650)); // granit → ≈ 0,21 m
    const TROUGH_Y = 0.45;          // oluk üst yüzeyi
    const YG = TROUGH_Y + STONE_R;  // gülle merkezinin oluktaki yüksekliği
    const THETA_REST = Math.PI / 2; // dinlenme: uzun kol dik yukarı (ağırlık en altta)
    const THETA_COCK = Math.PI + Math.asin((PY - 1.0) / RL); // kurulu: kol ucu yerden ~1 m yüksekte, arkada
    const G = 9.81;
    const ARM_MASS = 2000, ARM_LEN = RL + RS;
    const I_ARM = (ARM_MASS * ARM_LEN * ARM_LEN) / 12 + ARM_MASS * Math.pow((RL - RS) / 2, 2);
    const THROW_SLOWMO = 0.6;       // atış görsel olarak 1/0,6 kat yavaş
    const FLIGHT_SLOWMO = 0.22;

    // ------------------------------------------------------------------------
    // DOKULAR & MALZEMELER
    // ------------------------------------------------------------------------
    function woodCanvas(base, grain, gray) {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const g = c.getContext('2d');
      g.fillStyle = gray ? '#808080' : base;
      g.fillRect(0, 0, 256, 256);
      let seed = base.charCodeAt(1) * 89 + base.charCodeAt(4) * 17;
      const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      for (let i = 0; i < 80; i++) {
        const y0 = rand() * 256, amp = 2 + rand() * 7, freq = 0.008 + rand() * 0.03;
        g.strokeStyle = gray ? (rand() > 0.5 ? 'rgba(30,30,30,0.5)' : 'rgba(220,220,220,0.35)') : grain;
        g.globalAlpha = gray ? 1 : 0.15 + rand() * 0.35;
        g.lineWidth = 0.6 + rand() * 2;
        g.beginPath();
        for (let x = 0; x <= 256; x += 8) {
          const y = y0 + Math.sin(x * freq + i) * amp;
          if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.stroke();
      }
      g.globalAlpha = 1;
      const t = new THREE.CanvasTexture(c);
      if (!gray) t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(3, 1);
      return t;
    }
    function stoneFillTexture() {
      const c = document.createElement('canvas');
      c.width = 128; c.height = 128;
      const g = c.getContext('2d');
      g.fillStyle = '#8d8478';
      g.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 90; i++) {
        g.fillStyle = ['#6f675d', '#a39a8c', '#7d7468', '#5d564e'][i % 4];
        g.beginPath();
        g.ellipse(Math.random() * 128, Math.random() * 128, 4 + Math.random() * 9, 3 + Math.random() * 7, Math.random() * 3, 0, Math.PI * 2);
        g.fill();
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    }

    const FINISHES = {
      oak_iron: { label: 'Meşe & Dövme Demir', btn: '🪵 Meşe & Demir', base: '#7e5328', grain: '#432910', metal: 0x33373d },
      pine_field: { label: 'Çam (Kuşatma Sahasında Kesilmiş)', btn: '🌲 Saha Çamı', base: '#b48a55', grain: '#7a5630', metal: 0x3b3f45 },
      museum: { label: 'Müze Rekonstrüksiyonu', btn: '🏛️ Müze Rekonst.', base: '#c6a273', grain: '#977046', metal: 0x4a4f57 },
      weathered: { label: 'Yıpranmış (Uzun Kuşatma)', btn: '🌧️ Yıpranmış', base: '#7a6f60', grain: '#4a4238', metal: 0x5a3f2c }
    };
    const woodMaps = {};
    Object.keys(FINISHES).forEach(k => { woodMaps[k] = woodCanvas(FINISHES[k].base, FINISHES[k].grain, false); });
    const woodBump = woodCanvas('#808080', '#000000', true);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: woodMaps.oak_iron, bumpMap: woodBump, bumpScale: 0.03, roughness: 0.82, metalness: 0.02, userData: { trRole: 'wood' } });
    const ironMat = new THREE.MeshStandardMaterial({ color: FINISHES.oak_iron.metal, roughness: 0.5, metalness: 0.75, userData: { trRole: 'metal' } });
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xb89a66, roughness: 0.92, metalness: 0.0 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1e, roughness: 0.8, metalness: 0.0 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x77787b, roughness: 0.95, metalness: 0.02 });
    const fillMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: stoneFillTexture(), roughness: 0.95, metalness: 0.0 });

    const myMeshes = [];
    const add = (...args) => { const m = addCADMesh(...args); myMeshes.push(m); return m; };
    const ROT_X = [Math.PI / 2, 0, 0];
    const ROT_Z = [0, 0, Math.PI / 2];
    const _up = new THREE.Vector3(0, 1, 0), _dir = new THREE.Vector3();
    function setBetween(mesh, a, b) {
      _dir.subVectors(b, a);
      const len = Math.max(1e-4, _dir.length());
      mesh.position.copy(a).addScaledVector(_dir, 0.5);
      mesh.scale.set(1, len, 1);
      mesh.quaternion.setFromUnitVectors(_up, _dir.normalize());
    }
    // İki nokta arasına kalıcı kiriş (statik)
    function beamBetween(parent, a, b, w, h, mat) {
      const m = add(parent, new THREE.BoxGeometry(w, 1, h), mat);
      setBetween(m, new THREE.Vector3(...a), new THREE.Vector3(...b));
      return m;
    }

    const root = new THREE.Group();
    root.visible = false;
    scene.add(root);

    // ===================== A. ÇERÇEVE (frame) =====================
    const partBase = createPartGroup({
      id: 'treb_base', name: 'Taban Kirişleri & Çapraz Traversler',
      subsystem: 'frame', subLabel: 'ALT SİSTEM: TAŞIYICI ÇERÇEVE',
      desc: 'Makinenin bütün yükünü zemine yayan kalın taban kirişleri. Arkaya doğru uzayan kısım, oluk ve tetik direğini taşır. Bu boyutta makineler genellikle kuşatma sahasında, yanında getirilen demir aksam ve yerinde kesilen kerestelerle kurulurdu.',
      material: 'Meşe Kalas & Demir Kenet', weight: '~6 t (tahmini)', spec: '14 m taban uzunluğu',
      location: 'Zemin', basePos: [0, 0, 0], explodeVec: [0, -1.4, 0], isOuterShell: false
    });
    [-FX, FX].forEach(x => add(partBase, new THREE.BoxGeometry(0.4, 0.4, 14), woodMat, [x, 0.2, -2.5]));
    [-9.0, -4.3, -3.2, 3.2, 4.3].forEach(z => add(partBase, new THREE.BoxGeometry(FX * 2 + 0.6, 0.35, 0.35), woodMat, [0, 0.175, z]));
    root.add(partBase);

    const partFrame = createPartGroup({
      id: 'treb_frame', name: 'A-Çerçeve Dikmeleri & Payandalar',
      subsystem: 'frame', subLabel: 'ALT SİSTEM: TAŞIYICI ÇERÇEVE',
      desc: 'İki yanda üçgen (A) biçimli dikmeler ana mili 6,5 m yükseklikte taşır. Karşı ağırlık kasası iki çerçevenin arasından geçer. Çapraz payandalar, ağırlığın düşüşü ve kolun savrulmasıyla oluşan büyük yatay kuvvetlere karşı çerçeveyi sabitler.',
      material: 'Meşe Direk', weight: '~5 t (tahmini)', spec: `Mil yüksekliği ${PY.toFixed(1).replace('.', ',')} m`,
      location: 'Gövde iki yanı', basePos: [0, 0, 0], explodeVec: [0, 0.4, 0], isOuterShell: false
    });
    [-FX, FX].forEach(x => {
      beamBetween(partFrame, [x, 0.35, -3.2], [x, PY - 0.1, -0.05], 0.32, 0.32, woodMat);
      beamBetween(partFrame, [x, 0.35, 3.2], [x, PY - 0.1, 0.05], 0.32, 0.32, woodMat);
      beamBetween(partFrame, [x, 2.8, -1.85], [x, 2.8, 1.85], 0.22, 0.22, woodMat);           // yatay kuşak
      beamBetween(partFrame, [x, 0.35, -4.3], [x, 3.6, -1.55], 0.2, 0.2, woodMat);            // arka payanda
      beamBetween(partFrame, [x, 0.35, 4.3], [x, 3.6, 1.55], 0.2, 0.2, woodMat);              // ön payanda
    });
    // Not: iki çerçeve arasında yatay travers yoktur; karşı ağırlık kasası savruluşta bu boşluktan geçer.
    root.add(partFrame);

    // ===================== B. KOL & SAPAN (arm) =====================
    const partAxle = createPartGroup({
      id: 'treb_axle', name: 'Ana Mil (Aks) & Demir Yataklar',
      subsystem: 'arm', subLabel: 'ALT SİSTEM: ATIŞ KOLU & SAPAN',
      desc: 'Kolun etrafında döndüğü kalın mil. Uçları, dikmelerin tepesindeki demir kaplı yataklara oturur. Tonlarca ağırlığın düşüşünde mil büyük eğilme ve sürtünme yüküne maruz kaldığı için iyi yağlanması gerekirdi.',
      material: 'Meşe Mil & Demir Yatak', weight: '~400 kg', spec: 'Ø 36 cm mil',
      location: 'Dikmelerin tepesi', basePos: [0, 0, 0], explodeVec: [0, 2.2, 0], isOuterShell: false
    });
    add(partAxle, new THREE.CylinderGeometry(0.18, 0.18, FX * 2 + 0.6, 18), woodMat, [0, PY, 0], ROT_Z);
    [-FX, FX].forEach(x => add(partAxle, new THREE.BoxGeometry(0.42, 0.3, 0.5), ironMat, [x, PY - 0.08, 0]));
    root.add(partAxle);

    const armPivot = new THREE.Group();     // yerel +Z = uzun kol yönü; rotation.x = -θ
    armPivot.position.set(0, PY, 0);
    root.add(armPivot);

    const partArm = createPartGroup({
      id: 'treb_arm', name: 'Atış Kolu (1:4 Oranlı Kaldıraç) & Demir Kuşaklar',
      subsystem: 'arm', subLabel: 'ALT SİSTEM: ATIŞ KOLU & SAPAN',
      desc: `Milin bir yanında ${RS} m'lik kısa kol (karşı ağırlık), diğer yanında ${RL} m'lik uzun kol (sapan) bulunan dev kaldıraç. Ağırlık kısa kolun ucunu birkaç metre düşürürken uzun kolun ucu dört kat uzun bir yay çizer; böylece yavaş ve ağır bir düşüş, hızlı bir savuruşa dönüşür. Kol, genellikle birden fazla kerestenin demir kuşaklarla birleştirilmesiyle yapılırdı.`,
      material: 'Birleştirilmiş Meşe & Demir Kuşak', weight: '~2 t (tahmini)', spec: `${RL} m + ${RS} m (oran 1:${Math.round(RL / RS)})`,
      location: 'Ana mil üzerinde', basePos: [0, 0, 0], explodeVec: [0, 1.6, 0], isOuterShell: false
    });
    add(partArm, new THREE.BoxGeometry(0.55, 0.62, 5.5), woodMat, [0, 0, 0.25]);
    add(partArm, new THREE.BoxGeometry(0.40, 0.44, 7.0), woodMat, [0, 0, 6.5]);
    for (let z = -2.2; z <= 9.5; z += 1.3) {
      const big = z < 3;
      add(partArm, new THREE.BoxGeometry(big ? 0.6 : 0.45, big ? 0.67 : 0.49, 0.08), ironMat, [0, 0, z], [0, 0, 0], false);
    }
    add(partArm, new THREE.CylinderGeometry(0.06, 0.06, 0.9, 10), ironMat, [0, 0, -RS + 0.05], ROT_Z); // menteşe pimi
    armPivot.add(partArm);

    const partHook = createPartGroup({
      id: 'treb_hook', name: 'Bırakma Kancası (Çatal Pim)',
      subsystem: 'arm', subLabel: 'ALT SİSTEM: ATIŞ KOLU & SAPAN',
      desc: 'Sapanın bir ucu kola sabit bağlıdır; diğer ucundaki halka, kol ucundaki çatal pime geçirilir. Savruluşta sapan kolu geçtiği anda halka pimden kayar ve gülle serbest kalır. Pimin bükülme açısı bırakma anını, dolayısıyla atış açısını ve menzili belirler. "Bırakma Açısı" kaydırıcısı bu ayarı temsil eder.',
      material: 'Dövme Demir', weight: '~6 kg', spec: 'Ayarlanabilir pim açısı',
      location: 'Uzun kolun ucu', basePos: [0, 0, RL], explodeVec: [0, 1.0, 1.4], isOuterShell: false
    });
    add(partHook, new THREE.BoxGeometry(0.46, 0.5, 0.16), ironMat, [0, 0, 0]);
    const prong = add(partHook, new THREE.CylinderGeometry(0.035, 0.035, 0.55, 8), ironMat, [0, 0.25, 0.25], [0.8, 0, 0]);
    armPivot.add(partHook);

    // Karşı ağırlık: kısa kol ucundaki menteşeye asılı; menteşeli modda dünyaya göre dik kalır
    const hingeGroup = new THREE.Group();
    hingeGroup.position.set(0, 0, -RS);
    armPivot.add(hingeGroup);
    const cwUpright = new THREE.Group();
    hingeGroup.add(cwUpright);
    const cwHang = new THREE.Group();       // menteşeli: -1,6 m aşağıda / sabit: kol ucuna gömülü
    cwUpright.add(cwHang);

    // ===================== C. KARŞI AĞIRLIK (counterweight) =====================
    const partCwHinge = createPartGroup({
      id: 'treb_cw_hinge', name: 'Menteşe Askısı & Demir Kulaklar',
      subsystem: 'counterweight', subLabel: 'ALT SİSTEM: KARŞI AĞIRLIK',
      desc: 'Menteşeli karşı ağırlık, kısa kolun ucuna serbest dönebilen bir pimle asılır. Kol dönerken kasa dik kalır ve neredeyse düz bir çizgide aşağı düşer. Bu, enerjinin daha büyük kısmının kola aktarılmasını sağlar ve makinenin sarsıntısını azaltır; menteşeli ağırlığın sabit ağırlığa göre daha verimli olduğu kabul edilir.',
      material: 'Dövme Demir', weight: '~150 kg', spec: 'Serbest dönen askı',
      location: 'Kısa kolun ucu', basePos: [0, 0, 0], explodeVec: [0, 0.8, -0.8], isOuterShell: false
    });
    [-0.36, 0.36].forEach(x => add(partCwHinge, new THREE.BoxGeometry(0.08, 1.0, 0.18), ironMat, [x, -0.45, 0]));
    cwHang.add(partCwHinge);

    const partCwBox = createPartGroup({
      id: 'treb_cw_box', name: 'Karşı Ağırlık Kasası (Demir Kuşaklı)',
      subsystem: 'counterweight', subLabel: 'ALT SİSTEM: KARŞI AĞIRLIK',
      desc: 'İçi taş, toprak veya kurşunla doldurulan kalın ahşap kasa. Kasanın kütlesi makinenin gücünü doğrudan belirler; doldurulan malzeme artırılıp azaltılarak menzil ayarlanabilirdi. X-Ray modunda kasa saydamlaşır ve içindeki dolgu görünür.',
      material: 'Meşe Kalas & Demir Kuşak', weight: '~800 kg (boş kasa, tahmini)', spec: '2,2 × 2,0 × 2,0 m',
      location: 'Menteşe askısının altı', basePos: [0, 0, 0], explodeVec: [0, -1.4, -1.6], isOuterShell: true
    });
    const BOX_W = 2.2, BOX_H = 2.0, BOX_D = 2.0, BOX_Y = -1.0 - BOX_H / 2;
    add(partCwBox, new THREE.BoxGeometry(BOX_W, 0.12, BOX_D), woodMat, [0, BOX_Y - BOX_H / 2, 0]);
    [-1, 1].forEach(s => {
      add(partCwBox, new THREE.BoxGeometry(0.1, BOX_H, BOX_D), woodMat, [s * (BOX_W / 2 - 0.05), BOX_Y, 0]);
      add(partCwBox, new THREE.BoxGeometry(BOX_W, BOX_H, 0.1), woodMat, [0, BOX_Y, s * (BOX_D / 2 - 0.05)]);
    });
    [-0.6, 0, 0.6].forEach(dy => add(partCwBox, new THREE.BoxGeometry(BOX_W + 0.04, 0.08, BOX_D + 0.04), ironMat, [0, BOX_Y + dy, 0], [0, 0, 0], false));
    cwHang.add(partCwBox);

    const partCwFill = createPartGroup({
      id: 'treb_cw_fill', name: 'Taş & Toprak Dolgu (Ayarlanabilir Kütle)',
      subsystem: 'counterweight', subLabel: 'ALT SİSTEM: KARŞI AĞIRLIK',
      desc: 'Kasayı dolduran taş ve toprak. "Karşı Ağırlık" kaydırıcısıyla kütle değiştikçe dolgunun yüksekliği de değişir. Daha ağır dolgu daha yüksek atış hızı ve menzil verir, ama çerçeveyi de o kadar zorlar.',
      material: 'Taş, Toprak (veya Kurşun)', weight: '3 – 10 t (ayarlanabilir)', spec: 'Güç = kütle × düşüş yüksekliği',
      location: 'Kasanın içi', basePos: [0, 0, 0], explodeVec: [0, -2.4, -2.4], isOuterShell: false
    });
    const fillGroup = new THREE.Group();
    partCwFill.add(fillGroup);
    add(fillGroup, new THREE.BoxGeometry(BOX_W - 0.22, 1, BOX_D - 0.22), fillMat);
    cwHang.add(partCwFill);

    // ===================== D. KURMA & TETİK (winding) =====================
    const partWheels = createPartGroup({
      id: 'treb_wheels', name: 'İnsan Gücüyle Dönen Kurma Çarkları (Treadwheel)',
      subsystem: 'winding', subLabel: 'ALT SİSTEM: KURMA & TETİK',
      desc: 'Çerçevenin iki yanındaki büyük çarkların içinde yürüyen adamlar, ortak bir mili döndürür. Mile sarılan halat uzun kolu aşağı çeker ve karşı ağırlığı yukarı kaldırır. Büyük çark ile küçük mil arasındaki çap farkı, insan gücünü tonlarca ağırlığı kaldırabilecek bir kaldıraca dönüştürür; tek bir kurma birkaç dakika sürebilirdi.',
      material: 'Meşe Çark & Ahşap Basamak', weight: '~1,2 t (2 çark)', spec: 'Ø 4 m çark / Ø 60 cm mil',
      location: 'Çerçevenin iki yanı', basePos: [0, 0, 0], explodeVec: [0, 0.6, -1.8], isOuterShell: false
    });
    const WHEEL_Z = -3.8, WHEEL_Y = 2.2, WHEEL_R = 2.0, DRUM_R = 0.3; // arka payandaların gerisinde
    const wheelSpin = new THREE.Group();
    wheelSpin.position.set(0, WHEEL_Y, WHEEL_Z);
    partWheels.add(wheelSpin);
    add(wheelSpin, new THREE.CylinderGeometry(DRUM_R, DRUM_R, 5.6, 16), woodMat, [0, 0, 0], ROT_Z);
    const rimGeo = new THREE.TorusGeometry(WHEEL_R, 0.08, 8, 40);
    const spokeGeo = new THREE.BoxGeometry(0.1, WHEEL_R * 2, 0.1);
    const slatGeo = new THREE.BoxGeometry(1.0, 0.08, 0.22);
    [-2.45, 2.45].forEach(x => {
      [-0.5, 0.5].forEach(dx => add(wheelSpin, rimGeo, woodMat, [x + dx, 0, 0], [0, Math.PI / 2, 0], false));
      for (let k = 0; k < 4; k++) add(wheelSpin, spokeGeo, woodMat, [x - 0.5, 0, 0], [(k / 4) * Math.PI, 0, 0], false);
      for (let k = 0; k < 4; k++) add(wheelSpin, spokeGeo, woodMat, [x + 0.5, 0, 0], [(k / 4) * Math.PI, 0, 0], false);
      const slats = addInstancedMesh(wheelSpin, slatGeo, woodMat, 28);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
      for (let k = 0; k < 28; k++) {
        const a = (k / 28) * Math.PI * 2;
        q.setFromEuler(new THREE.Euler(a, 0, 0));
        m4.compose(new THREE.Vector3(x, Math.cos(a) * (WHEEL_R - 0.05), Math.sin(a) * (WHEEL_R - 0.05)), q, new THREE.Vector3(1, 1, 1));
        slats.setMatrixAt(k, m4);
      }
      slats.instanceMatrix.needsUpdate = true;
      myMeshes.push(slats);
      add(partWheels, new THREE.BoxGeometry(0.25, WHEEL_Y + 0.2, 0.25), woodMat, [x + (x > 0 ? 0.75 : -0.75), (WHEEL_Y + 0.2) / 2, WHEEL_Z]);
    });
    root.add(partWheels);

    const partRope = createPartGroup({
      id: 'treb_rope', name: 'Kurma Halatı',
      subsystem: 'winding', subLabel: 'ALT SİSTEM: KURMA & TETİK',
      desc: 'Çark milinden uzun kola uzanan kalın kenevir halat. Kol kurulup tetik pimi takıldıktan sonra halat çözülür; atış sırasında kola bağlı kalmaz.',
      material: 'Kenevir Halat', weight: '~40 kg', spec: 'Ø 4 cm',
      location: 'Çark mili ile kol arası', basePos: [0, 0, 0], explodeVec: [0, 0.3, -1.0], isOuterShell: false
    });
    const ropeSeg = add(partRope, new THREE.CylinderGeometry(0.025, 0.025, 1, 8), ropeMat, [0, 0, 0], [0, 0, 0], false);
    root.add(partRope);

    const partTrigger = createPartGroup({
      id: 'treb_trigger', name: 'Tetik Direği & Kurtarma Kancası',
      subsystem: 'winding', subLabel: 'ALT SİSTEM: KURMA & TETİK',
      desc: 'Kurulu kolun ucu, tabana sabitlenmiş direkteki kancaya takılır. Topçu ustası kancanın pimini bir halat veya tokmakla çektiğinde kol serbest kalır ve atış başlar.',
      material: 'Meşe Direk & Demir Kanca', weight: '~80 kg', spec: 'Pimli kurtarma kancası',
      location: 'Tabanın arka ucu', basePos: [0, 0, 0], explodeVec: [0, 0.5, -1.4], isOuterShell: false
    });
    add(partTrigger, new THREE.BoxGeometry(0.3, 1.25, 0.3), woodMat, [0, 0.35 + 0.62, -9.0]);
    const triggerHook = new THREE.Group();
    triggerHook.position.set(0, 1.45, -8.85);
    partTrigger.add(triggerHook);
    add(triggerHook, new THREE.BoxGeometry(0.12, 0.12, 0.6), ironMat, [0, 0, 0.3]);
    add(triggerHook, new THREE.BoxGeometry(0.12, 0.3, 0.1), ironMat, [0, -0.12, 0.58]);
    root.add(partTrigger);

    // ===================== E. MÜHİMMAT & SAPAN (ammo) =====================
    const partTrough = createPartGroup({
      id: 'treb_trough', name: 'Gülle Oluğu',
      subsystem: 'ammo', subLabel: 'ALT SİSTEM: SAPAN & MÜHİMMAT',
      desc: 'Atışın başında gülle, sapanın içinde bu oluk boyunca arkaya doğru sürüklenir; kol yükseldikçe yerden kalkar ve kolun arkasında büyük bir yay çizerek savrulur. Oluk, güllenin yanlara kaçmasını önler.',
      material: 'Meşe Kalas', weight: '~300 kg', spec: '10 m oluk',
      location: 'Çerçevenin altı, arkaya doğru', basePos: [0, 0, 0], explodeVec: [0, -0.8, -0.6], isOuterShell: false
    });
    add(partTrough, new THREE.BoxGeometry(0.7, 0.1, 10.0), woodMat, [0, TROUGH_Y - 0.05, -4.2]);
    [-0.4, 0.4].forEach(x => add(partTrough, new THREE.BoxGeometry(0.08, 0.2, 10.0), woodMat, [x, TROUGH_Y + 0.05, -4.2]));
    root.add(partTrough);

    const partSling = createPartGroup({
      id: 'treb_sling', name: `Sapan, Deri Cep & Taş Gülle (~${STONE_KG} kg)`,
      subsystem: 'ammo', subLabel: 'ALT SİSTEM: SAPAN & MÜHİMMAT',
      desc: `Kol ucuna asılı ${LS} m'lik sapan ve deri cep. Sapan, kola eklenmiş ikinci bir sarkaç gibi davranır: kol yavaşlarken sapan kamçı gibi hızlanır ve gülleyi kol ucunun kendi hızından daha hızlı fırlatır. Simülasyonda sapan hareketli asılma noktalı bir sarkaç olarak hesaplanır. Granit gülle Ø ${Math.round(STONE_R * 200)} cm ≈ ${STONE_KG} kg.`,
      material: 'Kenevir Halat, Deri & Granit', weight: `~${STONE_KG + 15} kg (gülle dahil)`, spec: `${LS} m sapan`,
      location: 'Uzun kolun ucu', basePos: [0, 0, 0], explodeVec: [0, 1.2, 2.0], isOuterShell: false
    });
    const slingUnit = new THREE.CylinderGeometry(0.02, 0.02, 1, 6);
    const slingRopes = [add(partSling, slingUnit, ropeMat, [0, 0, 0], [0, 0, 0], false), add(partSling, slingUnit, ropeMat, [0, 0, 0], [0, 0, 0], false)];
    const pouch = add(partSling, new THREE.BoxGeometry(0.5, 0.12, 0.5), leatherMat, [0, 0, 0], [0, 0, 0], false);
    const stoneMesh = add(partSling, new THREE.SphereGeometry(STONE_R, 20, 16), stoneMat);
    root.add(partSling);

    const partAmmo = createPartGroup({
      id: 'treb_ammo', name: 'Yontulmuş Taş Gülle İstifi',
      subsystem: 'ammo', subLabel: 'ALT SİSTEM: SAPAN & MÜHİMMAT',
      desc: 'Taş ustalarının sahada yonttuğu yuvarlak gülleler. Aynı ağırlıkta gülleler kullanmak, ayarlanmış bir makinenin aynı noktaya tekrar tekrar isabet ettirmesini sağlardı; kuşatmalarda bu yüzden standart ağırlıkta gülle hazırlanırdı.',
      material: 'Granit / Kireçtaşı', weight: `${STONE_KG} kg / adet`, spec: '6 gülle',
      location: 'Çerçevenin sağ önü', basePos: [3.6, 0, 1.5], explodeVec: [2.0, 0.3, 0], isOuterShell: false
    });
    const pileStones = [];
    [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25], [0, -0.75], [0, 0.75]].forEach(p => {
      pileStones.push(add(partAmmo, new THREE.SphereGeometry(STONE_R, 16, 12), stoneMat, [p[0], STONE_R, p[1]]));
    });
    root.add(partAmmo);

    // Uçan gülle (parça değil)
    const flyStone = new THREE.Mesh(new THREE.SphereGeometry(STONE_R, 20, 16), stoneMat.clone());
    flyStone.castShadow = true;
    flyStone.visible = false;
    scene.add(flyStone);

    // ------------------------------------------------------------------------
    // MEKANİK DURUM
    // ------------------------------------------------------------------------
    const S = {
      phase: 'cocked',      // 'rest' | 'cocked' | 'throwing' | 'settling'
      cock: 1,              // 0..1 kurulma oranı
      cwTons: 6,
      releaseDeg: 45,
      hinged: true,
      loaded: true,
      ammo: 7,
      theta: THETA_COCK,
      thetaDot: 0,
      phi: 0, phiDot: 0,
      tipVel: new THREE.Vector3(),
      released: false,
      prevAngle: Math.PI,
      auto: 'none',         // 'none' | 'cock'
      loop: false,
      vRelease: 0,
      lastClick: 1,
      finish: 'oak_iron',
      relief: true,
      cwSwing: 0
    };
    const flight = { p0: new THREE.Vector3(), v0: new THREE.Vector3(), t: 0 };

    const efficiency = () => (S.hinged ? 0.70 : 0.55);
    const thetaForCock = c => THETA_REST + c * (THETA_COCK - THETA_REST);
    const tipPos = (th, out) => out.set(0, PY + RL * Math.sin(th), RL * Math.cos(th));
    const cwDrop = th => RS * (Math.sin(THETA_COCK - Math.PI) - Math.sin(th - Math.PI));
    const I_EFF = () => S.cwTons * 1000 * RS * RS + I_ARM + STONE_KG * RL * RL;
    function armOmega(th) {
      const M = S.cwTons * 1000;
      return Math.sqrt(Math.max(0, (2 * 0.85 * M * G * cwDrop(th)) / I_EFF()));
    }
    // Enerji bütçesinden bırakma hızı (Δh ≈ ağırlığın bırakma anına kadarki düşüşü)
    function releaseSpeed(dropM) {
      const M = S.cwTons * 1000;
      return Math.sqrt(Math.max(0, (2 * efficiency() * M * G * dropM) / STONE_KG));
    }
    const typicalDrop = () => RS * (Math.sin(THETA_COCK - Math.PI) + 0.9);
    function rangeMeters(v, angDeg, h) {
      const th = angDeg * Math.PI / 180;
      const vy = v * Math.sin(th), vx = v * Math.cos(th);
      const t = (vy + Math.sqrt(vy * vy + 2 * G * h)) / G;
      return Math.round(vx * t);
    }

    // Dinlenme / kurulma sırasında sapan: kol ucundan aşağı sarkar, oluğa değerse oluk boyunca uzanır
    const _tip = new THREE.Vector3(), _bob = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3();
    function hangingBob(tip, out) {
      if (tip.y - LS >= YG) return out.set(0, tip.y - LS, tip.z);
      const dy = tip.y - YG;
      return out.set(0, YG, tip.z + Math.sqrt(Math.max(0, LS * LS - dy * dy)));
    }

    function startThrow() {
      S.phase = 'throwing';
      S.released = false;
      S.theta = THETA_COCK - 0.003;
      tipPos(S.theta, _tip);
      hangingBob(_tip, _bob);
      S.phi = Math.atan2(_bob.z - _tip.z, -(_bob.y - _tip.y));
      S.phiDot = 0;
      S.tipVel.set(0, 0, 0);
      S.prevAngle = Math.PI;
      if (audio && audio.playCreakWhoosh) audio.playCreakWhoosh();
    }

    function doRelease(vel) {
      S.released = true;
      const speed = releaseSpeed(Math.max(0.5, cwDrop(S.theta)));
      S.vRelease = speed;
      flight.p0.copy(_bob);
      flight.v0.copy(vel).normalize().multiplyScalar(speed);
      flight.t = 0;
      flyStone.position.copy(_bob);
      flyStone.visible = true;
      S.loaded = false;
    }

    function fire() {
      if (S.phase === 'throwing' || S.phase === 'settling') return { ok: false, msg: 'Atış sürüyor.' };
      if (S.cock < 0.999) return { ok: false, msg: '<strong>Kol kurulmamış.</strong><br/>"Kol İndirme" %100 olmalı; tetik kancası ancak o zaman takılır.' };
      if (!S.loaded) return { ok: false, msg: S.ammo > 0 ? '<strong>Sapanda gülle yok.</strong>' : '<strong>Gülle kalmadı!</strong> "Gülle İkmali" ile yeni gülleler getirin.' };
      S.ammo -= 1;
      startThrow();
      return { ok: true };
    }

    // ------------------------------------------------------------------------
    // HER KARE GÜNCELLEME
    // ------------------------------------------------------------------------
    function stepThrow(h) {
      const thPrev = S.theta;
      if (!S.released) {
        S.thetaDot = -armOmega(S.theta) - 0.02;
        S.theta += S.thetaDot * h;
      } else {
        // Bırakmadan sonra kol, dinlenme konumu etrafında sönümlü salınır
        const k = (S.cwTons * 1000 * G * RS) / I_EFF();
        S.thetaDot += (-k * Math.sin(S.theta - THETA_REST) - 1.8 * S.thetaDot) * h;
        S.theta += S.thetaDot * h;
      }
      // Kol ucunun hız ve ivmesi (sonlu farklarla)
      const vz = -RL * Math.sin(S.theta) * S.thetaDot;
      const vy = RL * Math.cos(S.theta) * S.thetaDot;
      const az = (vz - S.tipVel.z) / h, ay = (vy - S.tipVel.y) / h;
      S.tipVel.set(0, vy, vz);
      tipPos(S.theta, _tip);

      // Hareketli asılma noktalı sarkaç: L·φ¨ = −g·sinφ − a_z·cosφ − a_y·sinφ
      const phiStart = S.phi;
      const phiAcc = -(G * Math.sin(S.phi) + az * Math.cos(S.phi) + ay * Math.sin(S.phi)) / LS;
      S.phiDot += phiAcc * h;
      if (S.released) S.phiDot *= (1 - 1.5 * h);
      S.phi += S.phiDot * h;
      _bob.set(0, _tip.y - LS * Math.cos(S.phi), _tip.z + LS * Math.sin(S.phi));
      if (_bob.y < YG) { // oluk teması: gülle oluğa bastırılır
        const c = THREE.MathUtils.clamp((_tip.y - YG) / LS, -1, 1);
        S.phi = Math.sign(S.phi || 1) * Math.acos(c);
        S.phiDot = (S.phi - phiStart) / h;
        _bob.set(0, _tip.y - LS * Math.cos(S.phi), _tip.z + LS * Math.sin(S.phi));
      }

      if (!S.released) {
        _a.set(0, vy + LS * S.phiDot * Math.sin(S.phi), vz + LS * S.phiDot * Math.cos(S.phi)); // gülle hızı
        const ang = Math.atan2(_a.y, _a.z);
        const target = S.releaseDeg * Math.PI / 180;
        const airborne = _bob.y > YG + 0.05;
        if ((airborne && _a.z > 1 && ang <= target && S.prevAngle > target) || S.theta < THETA_REST - 0.35) {
          if (S.theta < THETA_REST - 0.35) _a.set(0, Math.sin(target), Math.cos(target)); // güvenlik: zorunlu bırakma
          doRelease(_a);
        }
        S.prevAngle = ang;
      } else if (Math.abs(S.theta - THETA_REST) < 0.01 && Math.abs(S.thetaDot) < 0.03 && Math.abs(S.phiDot) < 0.05) {
        S.phase = 'rest';
        S.theta = THETA_REST;
        S.cock = 0;
        S.lastClick = 0;
      }
      return thPrev;
    }

    function update(dt) {
      // Otomatik kurma / seri atış
      if (S.auto === 'cock' && (S.phase === 'rest' || S.phase === 'cocked')) {
        S.phase = 'rest';
        S.cock = Math.min(1, S.cock + dt * 0.28);
        if (audio && S.cock - S.lastClick >= 0.04) { audio.playClick(260); S.lastClick = S.cock; }
        if (S.cock >= 1) {
          S.phase = 'cocked';
          if (S.ammo > 0) S.loaded = true;
          S.auto = 'none';
          if (S.loop) { const r = fire(); if (!r.ok) { S.loop = false; notify(r.msg); } }
        }
      }
      if (S.loop && S.phase === 'rest' && S.auto === 'none') S.auto = 'cock';

      if (S.phase === 'throwing' || S.phase === 'settling') {
        const sub = 12;
        const h = (dt * THROW_SLOWMO) / sub;
        for (let i = 0; i < sub; i++) stepThrow(h);
        if (S.released) S.phase = S.phase === 'rest' ? 'rest' : 'settling';
      } else {
        S.theta = thetaForCock(S.cock);
        tipPos(S.theta, _tip);
        hangingBob(_tip, _bob);
        S.phi = Math.atan2(_bob.z - _tip.z, -(_bob.y - _tip.y));
      }
      if (S.phase === 'settling' && Math.abs(S.theta - THETA_REST) < 0.01 && Math.abs(S.thetaDot) < 0.03) {
        S.phase = 'rest'; S.cock = 0; S.lastClick = 0;
      }

      // Kol
      armPivot.rotation.x = -S.theta;

      // Karşı ağırlık: menteşeli → dik kalır (+ küçük gecikmeli salınım), sabit → kola rijit bağlı
      if (S.hinged) {
        const targetSwing = THREE.MathUtils.clamp(-S.thetaDot * 0.12, -0.35, 0.35);
        S.cwSwing += (targetSwing - S.cwSwing) * Math.min(1, dt * 3);
        cwUpright.rotation.x = S.theta + S.cwSwing;
        cwHang.position.y += (0 - cwHang.position.y) * Math.min(1, dt * 6);
      } else {
        cwUpright.rotation.x = THETA_REST;
        cwHang.position.y += (1.6 - cwHang.position.y) * Math.min(1, dt * 6);
      }
      partCwHinge.visible = S.hinged;
      // Dolgu yüksekliği kütleye göre (10 t = kasa dolu)
      const fillH = Math.max(0.15, (S.cwTons / 10) * (BOX_H - 0.15));
      fillGroup.scale.y = fillH;
      fillGroup.position.y = BOX_Y - BOX_H / 2 + 0.06 + fillH / 2;

      // Sapan: sabit uç kol ucunda; cep ve gülle sarkaç ucunda
      tipPos(S.theta, _tip);
      _a.copy(_tip).add(new THREE.Vector3(0.12, 0, 0));
      _b.copy(_tip).add(new THREE.Vector3(-0.12, 0, 0));
      const pouchPos = new THREE.Vector3().copy(_bob);
      setBetween(slingRopes[0], _a, pouchPos);
      setBetween(slingRopes[1], _b, pouchPos);
      pouch.position.copy(pouchPos).add(new THREE.Vector3(0, -STONE_R * 0.7, 0));
      stoneMesh.position.copy(pouchPos);
      stoneMesh.visible = S.loaded && !S.released;

      // Bırakma kancası: pim açısı ayarı görsel olarak pimi büker
      prong.rotation.x = 0.3 + (S.releaseDeg - 30) / 30 * 0.8;

      // Kurma halatı & çarklar
      const ropeVisible = S.phase === 'rest' || (S.phase === 'cocked' && S.auto !== 'none');
      ropeSeg.visible = ropeVisible && S.cock > 0.001;
      const attach = new THREE.Vector3(0, PY + 5 * Math.sin(S.theta), 5 * Math.cos(S.theta));
      const drum = new THREE.Vector3(0, WHEEL_Y + DRUM_R, WHEEL_Z);
      const restLen = new THREE.Vector3(0, PY + 5 * Math.sin(THETA_REST), 5 * Math.cos(THETA_REST)).distanceTo(drum);
      const curLen = thetaForCock(S.cock);
      const cockLen = new THREE.Vector3(0, PY + 5 * Math.sin(curLen), 5 * Math.cos(curLen)).distanceTo(drum);
      wheelSpin.rotation.x = -((restLen - cockLen) / DRUM_R);
      if (ropeSeg.visible) setBetween(ropeSeg, drum, attach);

      // Tetik kancası
      triggerHook.rotation.x = (S.phase === 'cocked') ? 0 : -0.9;

      // Gülle istifi (namludaki dahil kalan sayı)
      const inPile = Math.max(0, S.ammo - (S.loaded ? 1 : 0));
      pileStones.forEach((s, i) => { s.visible = i < inPile; });

      // Uçuş (yavaş çekim)
      if (flyStone.visible) {
        flight.t += dt * FLIGHT_SLOWMO;
        const t = flight.t;
        flyStone.position.set(flight.p0.x + flight.v0.x * t, flight.p0.y + flight.v0.y * t - 0.5 * G * t * t, flight.p0.z + flight.v0.z * t);
        if (flyStone.position.y < STONE_R || flyStone.position.distanceTo(flight.p0) > 90) flyStone.visible = false;
      }
    }

    // ------------------------------------------------------------------------
    // DOKULAR
    // ------------------------------------------------------------------------
    function applyTextures(blueprint) {
      const fin = FINISHES[S.finish];
      myMeshes.forEach(m => {
        const role = m.material.userData && m.material.userData.trRole;
        if (role === 'wood') {
          m.material.map = blueprint ? null : woodMaps[S.finish];
          m.material.bumpMap = (!blueprint && S.relief) ? woodBump : null;
          m.material.needsUpdate = true;
        } else if (role === 'metal') {
          m.material.color.setHex(fin.metal);
          m.userData.origColor = m.material.color.clone();
        }
      });
    }

    // ------------------------------------------------------------------------
    // ADAPTÖR ARAYÜZÜ
    // ------------------------------------------------------------------------
    const ui = {
      title: 'KARŞI AĞIRLIKLI TREBUCHET (MANCINIK) — 1250',
      sub: 'Orta Çağ\'ın en güçlü kuşatma makinesi • 1:4 kaldıraç kolu, menteşeli karşı ağırlık ve sapan (çift sarkaç)',
      partCount: '14 Ana Grup',
      texTitle: '🪵 Kereste & Demir Aksam',
      textures: Object.keys(FINISHES).map(k => ({ key: k, label: FINISHES[k].btn })),
      textureLabel: () => FINISHES[S.finish].label,
      activeTexture: () => S.finish,
      reliefLabel: on => (on ? '🪵 Ahşap Damar Kabartması: AÇIK' : '🪵 Ahşap Damar Kabartması: KAPALI'),
      relief: () => S.relief,
      subsystems: [
        { key: 'frame', label: 'Taban & A-Çerçeve', color: '#94a3b8', count: 2 },
        { key: 'arm', label: 'Mil, Kol & Bırakma Kancası', color: '#d97706', count: 3 },
        { key: 'counterweight', label: 'Menteşeli Karşı Ağırlık', color: '#ef4444', count: 3 },
        { key: 'winding', label: 'Kurma Çarkları, Halat & Tetik', color: '#10b981', count: 3 },
        { key: 'ammo', label: 'Oluk, Sapan & Gülleler', color: '#38bdf8', count: 3 }
      ],
      camLabels: { iso: 'İzometrik', front: 'Ön Görünüş', breech: 'Karşı Ağırlık', engine: 'Kurma Çarkı', suspension: 'Tetik & Oluk', top: 'Üst Görünüş' },
      sliders: [
        { label: 'Kol İndirme (Kurma Çarkı)', min: 0, max: 100, step: 1, fmt: v => `%${Math.round(v)}` },
        { label: 'Karşı Ağırlık Kütlesi', min: 3, max: 10, step: 0.5, fmt: v => `${v.toString().replace('.', ',')} t` },
        { label: 'Bırakma Açısı (Kanca Pimi)', min: 25, max: 65, step: 1, fmt: v => `${Math.round(v)}°` }
      ],
      buttons: { terrain: '🔄 Otomatik Kurma (Çark)', sweep: '🎯 Seri Atış Gösterimi', mode: true },
      telemetryTag: 'ÇİFT SARKAÇ',
      statLabels: ['BIRAKMA HIZI (MODEL)', 'MENZİL (HESAP)', 'KALAN GÜLLE', 'VERİM (VARSAYIM)'],
      fog: { near: 34, far: 90 },
      shadowExtent: 18
    };

    function modeLabel() { return S.hinged ? '⛓️ Menteşeli Ağırlık (Sabite Geç)' : '🔩 Sabit Ağırlık (Menteşeliye Geç)'; }
    function getSliderValues() { return [S.cock * 100, S.cwTons, S.releaseDeg]; }

    function onSlider(index, val) {
      if (index === 0) {
        S.auto = 'none'; S.loop = false;
        if (S.phase === 'throwing' || S.phase === 'settling') return { msg: 'Atış sürerken kol kurulamaz.' };
        const c = val / 100;
        if (S.phase === 'cocked' && c < 1) S.loaded = false; // tetikten kurtarıp indirmek: gülle cepten alınır
        S.phase = c >= 0.999 ? 'cocked' : 'rest';
        if (audio && Math.abs(c - S.lastClick) >= 0.04) { audio.playClick(260); S.lastClick = c; }
        S.cock = c;
        if (S.phase === 'cocked' && S.ammo > 0) S.loaded = true;
      } else if (index === 1) {
        S.cwTons = val;
      } else if (index === 2) {
        S.releaseDeg = val;
      }
      return {};
    }

    function onButton(name) {
      if (name === 'terrain') {
        S.loop = false;
        if (S.auto === 'cock') { S.auto = 'none'; return { active: false }; }
        if (S.phase === 'throwing' || S.phase === 'settling') return { active: false, msg: 'Atış sürüyor; kol dinlenmeye gelince kurulabilir.' };
        if (S.phase === 'cocked') return { active: false, msg: 'Kol zaten kurulu.' };
        S.auto = 'cock';
        return { active: true };
      }
      if (name === 'sweep') {
        S.loop = !S.loop;
        if (S.loop) {
          if (S.ammo <= 0) { S.loop = false; return { active: false, msg: '<strong>Gülle kalmadı!</strong> Önce "Gülle İkmali" yapın.' }; }
          if (S.phase === 'cocked' && S.loaded) { const r = fire(); if (!r.ok) S.loop = false; }
          else if (S.phase === 'rest') S.auto = 'cock';
        } else { S.auto = 'none'; }
        return { active: S.loop };
      }
      if (name === 'mode') {
        S.hinged = !S.hinged;
        return {
          active: !S.hinged,
          msg: S.hinged
            ? '<strong>Menteşeli karşı ağırlık:</strong> Kasa dik kalarak neredeyse düz aşağı düşer; enerjinin daha büyük kısmı kola aktarılır (bu modelde verim %70 varsayılır).'
            : '<strong>Sabit karşı ağırlık:</strong> Kasa kola rijit bağlıdır ve bir yay çizerek döner; enerjinin bir kısmı kasanın yana savrulmasına gider (bu modelde verim %55 varsayılır).'
        };
      }
      return {};
    }
    const buttonActive = name => (name === 'terrain' ? (S.auto === 'cock' && !S.loop) : name === 'sweep' ? S.loop : !S.hinged);

    function fireButtonLabel() { return (S.ammo <= 0 && !S.loaded) ? '📦 GÜLLE İKMALİ (7 Adet)' : '💥 TETİĞİ ÇEK — ATEŞLE!'; }
    function onFire() {
      if (S.ammo <= 0 && !S.loaded) { S.ammo = 7; if (S.phase === 'cocked') S.loaded = true; return { ok: true, refill: true }; }
      return fire();
    }

    function getStats() {
      const v = S.released && (S.phase === 'settling' || S.phase === 'throwing') ? S.vRelease : releaseSpeed(typicalDrop());
      return [
        `${Math.round(v)} <span>m/sn</span>`,
        `${rangeMeters(releaseSpeed(typicalDrop()), S.releaseDeg, 12)} <span>Metre</span>`,
        `${S.ammo} <span>Adet</span>`,
        `%${Math.round(efficiency() * 100)} <span>${S.hinged ? 'menteşeli' : 'sabit'}</span>`
      ];
    }
    function getStatus() {
      if (S.phase === 'throwing' && !S.released) return { text: 'SAVRULUYOR', color: '#ef4444' };
      if (S.phase === 'throwing' || S.phase === 'settling') return { text: 'GÜLLE UÇUŞTA', color: '#d97706' };
      if (S.auto === 'cock') return { text: 'KURULUYOR', color: '#d97706' };
      if (S.phase === 'cocked') return S.loaded ? { text: 'KURULU & DOLU', color: '#0284c7' } : { text: 'KURULU — GÜLLE YOK', color: '#d97706' };
      return { text: `KOL %${Math.round(S.cock * 100)}`, color: '#64748b' };
    }

    const camPresets = {
      iso: { pos: [17, 9.5, 14], look: [0, 5, -1.5] },
      front: { pos: [5, 5, 18], look: [0, 5.5, 0] },
      breech: { pos: [7.5, 6.5, 6], look: [0, 6, -1] },
      engine: { pos: [10, 4.5, -7], look: [2.4, 2.2, -1.5] },
      suspension: { pos: [5.5, 3.2, -13], look: [0, 0.6, -7] },
      top: { pos: [0.1, 31, 0.1], look: [0, 0, -2] }
    };

    const tourSteps = [
      { title: 'Genel Bakış: Karşı Ağırlıklı Trebuchet (Mancınık)', desc: 'Orta Çağ kuşatmalarının en güçlü makinesi. Kısa kolun ucundaki tonlarca ağırlık düşerken, dört kat uzun olan kol sapanı büyük bir hızla savurur. Ölçüler tipik rekonstrüksiyon mertebesindedir: 10 m kol, 1:4 oran, 6 t ağırlık, 100 kg gülle.', explode: 0, cutaway: false, sub: 'all', cam: 'iso', part: partArm },
      { title: 'X-Ray: Karşı Ağırlık Kasası ve Dolgu', desc: 'Kasa saydamlaşınca içindeki taş-toprak dolgu görünür. "Karşı Ağırlık Kütlesi" kaydırıcısıyla 3–10 t arasında değiştirin: dolgu yüksekliği ve telemetrideki hız/menzil birlikte değişir.', explode: 0, cutaway: true, sub: 'all', cam: 'breech', part: partCwFill },
      { title: 'Kurma: İnsan Gücüyle Dönen Çarklar', desc: 'Çarkların içinde yürüyen adamlar mili döndürür; halat uzun kolu aşağı çeker ve ağırlığı kaldırır. "Kol İndirme" kaydırıcısını veya "Otomatik Kurma"yı deneyin. Kol %100\'e ulaşınca tetik kancası takılır ve gülle cebe konur.', explode: 0, cutaway: false, sub: 'all', cam: 'engine', part: partWheels },
      { title: 'Bırakma Kancası: Atış Açısını Belirleyen Pim', desc: 'Sapanın halkası kol ucundaki pimden kaydığı anda gülle serbest kalır. "Bırakma Açısı" bu anı ayarlar. Hava direnci ihmal edildiğinde en uzak atış 45° civarındadır; makine yüksekten bıraktığı için en iyi açı biraz daha düşüktür.', explode: 0, cutaway: false, sub: 'all', cam: 'iso', part: partHook },
      { title: 'Atış: Çift Sarkaç ve Sapanın Kamçı Etkisi', desc: 'Tetiği çekin: gülle önce oluk boyunca sürüklenir, sonra kolun arkasında büyük bir yay çizer. Sapan, kola eklenmiş ikinci bir sarkaç gibi kamçılanır. "Menteşeli/Sabit Ağırlık" düğmesiyle iki tasarımı karşılaştırın.', explode: 0, cutaway: false, sub: 'all', cam: 'iso', part: partSling },
      { title: 'Tam Teardown (%85): 14 Mekanik Grup', desc: 'Taban, A-çerçeve, mil, kol, kanca, menteşe askısı, ağırlık kasası, dolgu, kurma çarkları, halat, tetik, oluk, sapan ve gülle istifi ayrılmış görünümde.', explode: 85, cutaway: false, sub: 'all', cam: 'iso', part: partBase }
    ];

    return {
      root, ui, camPresets, tourSteps,
      flashMesh: null,
      firePart: partSling,
      parts: { base: partBase, frame: partFrame, axle: partAxle, arm: partArm, hook: partHook, cwHinge: partCwHinge, cwBox: partCwBox, cwFill: partCwFill, wheels: partWheels, rope: partRope, trigger: partTrigger, trough: partTrough, sling: partSling, ammo: partAmmo },
      defaultPart: partArm,
      update, onSlider, onButton, buttonActive, onFire, fireButtonLabel, modeLabel,
      getSliderValues, getStats, getStatus,
      applyTextures,
      setTexture: key => { if (FINISHES[key]) S.finish = key; },
      toggleRelief: () => { S.relief = !S.relief; return S.relief; },
      specs: { RL, RS, LS, STONE_KG, STONE_R, THETA_COCK, releaseSpeed, rangeMeters, typicalDrop, I_ARM }
    };
  };
})();
