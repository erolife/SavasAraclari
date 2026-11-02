/* =============================================================================
 * Roma Ballistası — İki Kollu Burulma Ok Atıcısı (12 mekanik grup)
 * Klasik script olarak yüklenir; sayfa file:// ile açıldığında da çalışır.
 *
 * Bu modül "adaptör" kalıbını kullanır: arayüz tanımı (başlık, kaydırıcılar, butonlar,
 * telemetri, doku seçenekleri, tur adımları, kamera açıları) ve tüm mekanik durum
 * modülün içindedir. Çekirdek (simulator.html) yalnızca genel çağrılar yapar.
 *
 * Tarihsel arka plan ve oranlar:
 *  - Burulma topçuluğu M.Ö. 4. yüzyılda Helen dünyasında gelişti; Roma ordusu bu makineleri devraldı.
 *  - Vitruvius (De Architectura, X. kitap) ok atan makinelerde tüm ölçüleri yay deliği çapına (D)
 *    bağlar ve D'yi ok boyunun 1/9'u olarak verir. Burada ok boyu 1,35 m → D ≈ 15 cm alınmıştır.
 *  - Diğer ölçüler bu modüler sistemden esinlenen yaklaşık değerlerdir; ilk hız ve ağırlık tahminidir.
 * ========================================================================== */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.ballista = function buildBallista(ctx) {
    const { THREE, scene, MATS, addCADMesh, createPartGroup, addInstancedMesh } = ctx;
    const audio = ctx.audio || null;
    const notify = ctx.notify || (() => {});

    // ------------------------------------------------------------------------
    // ÖLÇÜLER (1 birim = 1 m)
    // ------------------------------------------------------------------------
    const BOLT_LEN = 1.35;
    const D = BOLT_LEN / 9;            // Vitruvius: yay deliği çapı = ok boyu / 9
    const FZ = 0.70;                   // yay çerçevesinin kızak üzerindeki konumu
    const AXIS_Y = 0.245;              // ok ekseninin kızak çerçevesindeki yüksekliği
    const SK = 0.33;                   // tendon demetlerinin merkezden yanal uzaklığı
    const ARM = 0.85;                  // kol boyu
    const THETA_REST = THREE.MathUtils.degToRad(15);   // dinlenmede kollar hafif öne bakar
    const THETA_SWING = THREE.MathUtils.degToRad(75);  // tam kurulmada geriye dönüş açısı
    const STRING_HALF = SK + ARM * Math.cos(THETA_REST); // kiriş yarı boyu (gergin, düz)
    const PIVOT_Y = 1.18;              // kardan mafsalın yerden yüksekliği
    const V_MAX = 75;                  // m/sn — tam kurulma + tam ön gerilimde tahmini ilk hız
    const SLOWMO = 0.25;

    // ------------------------------------------------------------------------
    // PROSEDÜREL DOKULAR
    // ------------------------------------------------------------------------
    function woodCanvas(base, grain, gray) {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const g = c.getContext('2d');
      g.fillStyle = gray ? '#808080' : base;
      g.fillRect(0, 0, 256, 256);
      let seed = base.charCodeAt(1) * 97 + base.charCodeAt(3) * 13;
      const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      for (let i = 0; i < 70; i++) {
        const y0 = rand() * 256;
        const amp = 2 + rand() * 6;
        const freq = 0.01 + rand() * 0.03;
        g.strokeStyle = gray ? (rand() > 0.5 ? 'rgba(30,30,30,0.5)' : 'rgba(220,220,220,0.35)') : grain;
        g.globalAlpha = gray ? 1 : 0.18 + rand() * 0.35;
        g.lineWidth = 0.6 + rand() * 1.8;
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
      t.repeat.set(2, 1);
      return t;
    }
    function sinewTexture() {
      const c = document.createElement('canvas');
      c.width = 64; c.height = 256;
      const g = c.getContext('2d');
      g.fillStyle = '#c9a77a';
      g.fillRect(0, 0, 64, 256);
      g.strokeStyle = 'rgba(110,80,45,0.55)';
      g.lineWidth = 3;
      for (let y = -64; y < 320; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(64, y + 40); g.stroke(); }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    }

    const FINISHES = {
      oak_bronze: { label: 'Meşe & Tunç Kaplama', btn: '🪵 Meşe & Tunç', base: '#8a5a2b', grain: '#4a2c10', metal: 0xb08d57 },
      ash_iron: { label: 'Dişbudak & Demir Kaplama', btn: '⚒️ Dişbudak & Demir', base: '#b98d5a', grain: '#7a5530', metal: 0x3b3f45 },
      museum: { label: 'Müze Rekonstrüksiyonu', btn: '🏛️ Müze Rekonst.', base: '#c9a67a', grain: '#9a7448', metal: 0xc9a15e },
      painted: { label: 'Aşı Boyalı (varsayımsal)', btn: '🎨 Aşı Boyalı', base: '#7a2e1f', grain: '#4a170e', metal: 0xa8844f }
    };
    const woodMaps = {};
    Object.keys(FINISHES).forEach(k => { woodMaps[k] = woodCanvas(FINISHES[k].base, FINISHES[k].grain, false); });
    const woodBump = woodCanvas('#808080', '#000000', true);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: woodMaps.oak_bronze, bumpMap: woodBump, bumpScale: 0.02, roughness: 0.78, metalness: 0.02, userData: { balRole: 'wood' } });
    const metalMat = new THREE.MeshStandardMaterial({ color: FINISHES.oak_bronze.metal, roughness: 0.32, metalness: 0.85, userData: { balRole: 'metal' } });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x2a2d32, roughness: 0.5, metalness: 0.75 });
    const sinewMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: sinewTexture(), roughness: 0.85, metalness: 0.0 });
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xc2a370, roughness: 0.9, metalness: 0.0 });
    const stringMat = new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 0.7, metalness: 0.0 });
    const featherMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide });

    const myMeshes = [];
    const add = (...args) => { const m = addCADMesh(...args); myMeshes.push(m); return m; };
    const ROT_X = [Math.PI / 2, 0, 0];   // silindir Y → Z
    const ROT_Z = [0, 0, Math.PI / 2];   // silindir Y → X

    // Silindiri iki nokta arasına yerleştir (yükseklik 1 olan geometri varsayılır)
    const _up = new THREE.Vector3(0, 1, 0);
    const _dir = new THREE.Vector3();
    function setBetween(mesh, a, b) {
      _dir.subVectors(b, a);
      const len = Math.max(1e-4, _dir.length());
      mesh.position.copy(a).addScaledVector(_dir, 0.5);
      mesh.scale.set(1, len, 1);
      mesh.quaternion.setFromUnitVectors(_up, _dir.normalize());
    }

    // ------------------------------------------------------------------------
    // HİYERARŞİ: root → (ayak, mafsal) + elevGroup (kızak çerçevesi; yükseliş açısı)
    // ------------------------------------------------------------------------
    const root = new THREE.Group();
    root.visible = false;
    scene.add(root);
    const elevGroup = new THREE.Group();
    elevGroup.position.y = PIVOT_Y;
    root.add(elevGroup);

    // ===================== A. BURULMA SİSTEMİ (torsion) =====================
    const partFrame = createPartGroup({
      id: 'bal_frame',
      name: 'Yay Çerçevesi (Capitulum): Tablalar & Dikmeler',
      subsystem: 'torsion',
      subLabel: 'ALT SİSTEM: BURULMA YAYLARI',
      desc: `Makinenin "kafası". Üst ve alt yatay tablalar ile dikmelerden oluşur; tendon demetleri tablalardaki deliklerden geçer. Vitruvius bu deliğin çapını (D) temel ölçü alır ve makinenin bütün parçalarını D'nin katları olarak verir: ok atan makinelerde D, ok boyunun 1/9'udur (burada ${Math.round(D * 100)} cm). Kolların geriye dönebilmesi için dış dikmeler önde konumlanır.`,
      material: 'Meşe & Tunç Bilezik',
      weight: '~35 kg (tahmini)',
      spec: `Yay deliği D ≈ ${Math.round(D * 100)} cm (ok boyu / 9)`,
      location: 'Kızağın ön ucu',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.9, 0.5],
      isOuterShell: true
    });
    [-1, 1].forEach(sy => {
      add(partFrame, new THREE.BoxGeometry(1.24, 0.06, 0.26), woodMat, [0, AXIS_Y + sy * 0.45, FZ]);
      add(partFrame, new THREE.BoxGeometry(1.26, 0.015, 0.27), metalMat, [0, AXIS_Y + sy * 0.48, FZ], [0, 0, 0], false);
    });
    [-0.10, 0.10].forEach(x => add(partFrame, new THREE.BoxGeometry(0.06, 0.84, 0.18), woodMat, [x, AXIS_Y, FZ]));
    [-0.56, 0.56].forEach(x => add(partFrame, new THREE.BoxGeometry(0.08, 0.84, 0.08), woodMat, [x, AXIS_Y, FZ + 0.13]));
    elevGroup.add(partFrame);

    const partSkeins = createPartGroup({
      id: 'bal_skeins',
      name: 'Tendon Demetleri (Burulma Yayları)',
      subsystem: 'torsion',
      subLabel: 'ALT SİSTEM: BURULMA YAYLARI',
      desc: 'Makinenin enerji kaynağı: hayvan tendonundan (sinir) bükülmüş kalın ip demetleri. Kollar bu demetlerin ortasından geçer; kurulmada kollar geriye döndükçe zaten burulmuş olan demetler daha da burulur ve enerji depolar. Esnek bir yay yerine burulmayı kullanmak, aynı boyutta çok daha fazla enerji sağlar. X-Ray modunda çerçevenin içinde görünür.',
      material: 'Hayvan Tendonu (Sinir) İp',
      weight: '~8 kg (2 demet, tahmini)',
      spec: `Demet çapı ≈ D (${Math.round(D * 100)} cm)`,
      location: 'Yay çerçevesinin iki yanı',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.6, 0.3],
      isOuterShell: false
    });
    const skeinGroups = [-1, 1].map(sx => {
      const g = new THREE.Group();
      g.position.set(sx * SK, AXIS_Y, FZ);
      partSkeins.add(g);
      add(g, new THREE.CylinderGeometry(D / 2, D / 2, 0.86, 18), sinewMat);
      return g;
    });
    elevGroup.add(partSkeins);

    const partWashers = createPartGroup({
      id: 'bal_washers',
      name: 'Tunç Burma Halkaları (Modioli) & Manivelalar',
      subsystem: 'torsion',
      subLabel: 'ALT SİSTEM: BURULMA YAYLARI',
      desc: 'Tendon demetlerinin uçları, tablaların üstünde ve altında duran tunç halkalara bağlıdır. Halkalar manivelalarla çevrilerek demetlere ön gerilim verilir, sonra pimlerle kilitlenir. İki yanın eşit gerilmesi gerekir; aksi halde ok sapar. "Tendon Ön Gerilimi" kaydırıcısı bu halkaları çevirir ve atış gücünü artırır.',
      material: 'Döküm Tunç & Demir Pim',
      weight: '~12 kg (4 halka)',
      spec: 'Ön gerilim: 0° – 90° halka dönüşü',
      location: 'Tablaların üstü ve altı',
      basePos: [0, 0, 0],
      explodeVec: [0, 2.1, 0.2],
      isOuterShell: false
    });
    const washerGroups = [];
    [-1, 1].forEach(sx => {
      [-1, 1].forEach(sy => {
        const g = new THREE.Group();
        g.position.set(sx * SK, AXIS_Y + sy * 0.505, FZ);
        g.userData.dir = sx;
        partWashers.add(g);
        add(g, new THREE.CylinderGeometry(0.11, 0.11, 0.05, 24), metalMat);
        add(g, new THREE.BoxGeometry(0.36, 0.03, 0.035), ironMat, [0, sy * 0.035, 0]);
        add(g, new THREE.CylinderGeometry(0.012, 0.012, 0.09, 8), ironMat, [0.12, -sy * 0.01, 0], [0, 0, 0], false);
        washerGroups.push(g);
      });
    });
    elevGroup.add(partWashers);

    // ===================== B. KOLLAR & KİRİŞ (arms) =====================
    const partArms = createPartGroup({
      id: 'bal_arms',
      name: 'Kollar (Bracchia) — Demir Uç Başlıklı',
      subsystem: 'arms',
      subLabel: 'ALT SİSTEM: KOLLAR & KİRİŞ',
      desc: 'Her kol, bir tendon demetinin tam ortasından geçer. Kiriş geriye çekildikçe kollar demetleri burarak geriye döner; tetik bırakılınca demetler çözülmeye çalışır ve kolları ileri fırlatır. Kol uçlarındaki demir başlıklar kirişin bağlandığı yerdir.',
      material: 'Dişbudak/Meşe & Demir Başlık',
      weight: '~10 kg (2 kol)',
      spec: `${Math.round(ARM * 100)} cm kol, ${Math.round(THREE.MathUtils.radToDeg(THETA_SWING))}° dönüş`,
      location: 'Tendon demetlerinin içinden dışa',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.1, 1.0],
      isOuterShell: false
    });
    const armPivots = [-1, 1].map(sx => {
      const pv = new THREE.Group();
      pv.position.set(sx * SK, AXIS_Y, FZ);
      partArms.add(pv);
      add(pv, new THREE.BoxGeometry(ARM, 0.085, 0.07), woodMat, [ARM / 2, 0, 0]);
      add(pv, new THREE.BoxGeometry(0.07, 0.10, 0.085), ironMat, [ARM - 0.02, 0, 0]);
      pv.userData.side = sx;
      return pv;
    });
    elevGroup.add(partArms);

    const partString = createPartGroup({
      id: 'bal_string',
      name: 'Kiriş (Tendon Örgü Yay Kirişi)',
      subsystem: 'arms',
      subLabel: 'ALT SİSTEM: KOLLAR & KİRİŞ',
      desc: 'İki kol ucunu birbirine bağlayan kalın örgü kiriş. Kurulmada sürgünün ucundaki pençe kirişi yakalar ve çıkrıkla geriye çeker. Bırakıldığında kiriş, oku kanal boyunca iterek fırlatır.',
      material: 'Örgü Hayvan Tendonu',
      weight: '~1 kg',
      spec: `Gergin boy ≈ ${(STRING_HALF * 2).toFixed(2).replace('.', ',')} m`,
      location: 'Kol uçları arası',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.5, 1.6],
      isOuterShell: false
    });
    const unitCyl = new THREE.CylinderGeometry(0.009, 0.009, 1, 8);
    const stringSegs = [add(partString, unitCyl, stringMat, [0, 0, 0], [0, 0, 0], false), add(partString, unitCyl, stringMat, [0, 0, 0], [0, 0, 0], false)];
    elevGroup.add(partString);

    // ===================== C. KIZAK & KURMA MEKANİZMASI (stock) =====================
    const partStock = createPartGroup({
      id: 'bal_stock',
      name: 'Kızak Gövdesi (Canalis) & Ok Kanalı',
      subsystem: 'stock',
      subLabel: 'ALT SİSTEM: KIZAK & KURMA',
      desc: 'Makinenin omurgası olan uzun ahşap gövde. Üstündeki kırlangıç kuyruğu oluklu kanalda sürgü ileri-geri kayar. Ön ucunda yay çerçevesi, arka ucunda çıkrık bulunur.',
      material: 'Meşe',
      weight: '~30 kg (tahmini)',
      spec: '2,3 m gövde boyu',
      location: 'Merkez eksen',
      basePos: [0, 0, 0],
      explodeVec: [0, -0.5, 0],
      isOuterShell: false
    });
    add(partStock, new THREE.BoxGeometry(0.24, 0.14, 2.3), woodMat, [0, 0.10, -0.2]);
    add(partStock, new THREE.BoxGeometry(0.06, 0.006, 2.2), ironMat, [0, 0.172, -0.2], [0, 0, 0], false);
    [-0.13, 0.13].forEach(x => add(partStock, new THREE.BoxGeometry(0.03, 0.05, 2.25), woodMat, [x, 0.15, -0.2]));
    [-1.0, -0.3, 0.4].forEach(z => add(partStock, new THREE.BoxGeometry(0.27, 0.15, 0.04), metalMat, [0, 0.10, z], [0, 0, 0], false));
    elevGroup.add(partStock);

    const partSlider = createPartGroup({
      id: 'bal_slider',
      name: 'Sürgü (Diostra), Pençe (Cheir) & Tetik',
      subsystem: 'stock',
      subLabel: 'ALT SİSTEM: KIZAK & KURMA',
      desc: 'Kanal içinde kayan sürgü. Kurmadan önce ileri itilir ve arka ucundaki pençe kirişi yakalar; sonra çıkrıkla geriye çekilir. Ok, sürgünün üstündeki oluğa, ucu kirişe dayanacak şekilde yerleştirilir. Tetik kolu kaldırılınca pençe açılır ve kiriş serbest kalır; sürgü geride kalır.',
      material: 'Meşe & Tunç Pençe',
      weight: '~9 kg',
      spec: 'Pençe + cırcır mandalları',
      location: 'Kızak kanalı içinde',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.7, -0.4],
      isOuterShell: false
    });
    const sliderGroup = new THREE.Group();
    partSlider.add(sliderGroup);
    add(sliderGroup, new THREE.BoxGeometry(0.10, 0.06, 0.9), woodMat, [0, 0.20, 0.45]);
    add(sliderGroup, new THREE.BoxGeometry(0.03, 0.006, 0.88), ironMat, [0, 0.233, 0.45], [0, 0, 0], false);
    const clawGroup = new THREE.Group();
    clawGroup.position.set(0, 0.235, 0.03);
    sliderGroup.add(clawGroup);
    add(clawGroup, new THREE.BoxGeometry(0.06, 0.07, 0.06), metalMat, [0, 0.03, -0.04]);
    add(clawGroup, new THREE.BoxGeometry(0.06, 0.03, 0.03), metalMat, [0, 0.055, -0.08]);
    const triggerGroup = new THREE.Group();
    triggerGroup.position.set(0, 0.17, 0.08);
    sliderGroup.add(triggerGroup);
    add(triggerGroup, new THREE.BoxGeometry(0.025, 0.025, 0.30), ironMat, [0, -0.02, -0.15], [0.25, 0, 0]);
    [-0.065, 0.065].forEach(x => add(sliderGroup, new THREE.BoxGeometry(0.03, 0.04, 0.06), ironMat, [x, 0.185, 0.06], [0, 0, 0], false));
    elevGroup.add(partSlider);

    const partRatchet = createPartGroup({
      id: 'bal_ratchet',
      name: 'Cırcır Dişli Rayları & Mandallar',
      subsystem: 'stock',
      subLabel: 'ALT SİSTEM: KIZAK & KURMA',
      desc: 'Kızağın iki yanındaki dişli raylar ve sürgü üzerindeki mandallar, kurma sırasında sürgünün geri kaçmasını engeller. Böylece topçular çıkrığı istedikleri yerde bırakabilir ve makine kurulu bekleyebilir. Kurarken duyulan "tık tık" sesi bu mandallardır.',
      material: 'Dövme Demir',
      weight: '~4 kg',
      spec: '2 × 37 diş',
      location: 'Kızağın iki üst kenarı',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.35, 0],
      isOuterShell: false
    });
    const toothGeo = new THREE.BoxGeometry(0.02, 0.025, 0.03);
    const TEETH = 37;
    [-0.115, 0.115].forEach(x => {
      add(partRatchet, new THREE.BoxGeometry(0.025, 0.02, 1.9), ironMat, [x, 0.18, -0.1], [0, 0, 0], false);
      const im = addInstancedMesh(partRatchet, toothGeo, ironMat, TEETH);
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0, 0));
      for (let i = 0; i < TEETH; i++) {
        m4.compose(new THREE.Vector3(x, 0.198, -1.0 + i * 0.05), q, new THREE.Vector3(1, 1, 1));
        im.setMatrixAt(i, m4);
      }
      im.instanceMatrix.needsUpdate = true;
      myMeshes.push(im);
    });
    elevGroup.add(partRatchet);

    const partWinch = createPartGroup({
      id: 'bal_winch',
      name: 'Çıkrık (Sucula), Tambur & Çekme Halatı',
      subsystem: 'stock',
      subLabel: 'ALT SİSTEM: KIZAK & KURMA',
      desc: 'Kızağın arka ucundaki yatay mil. İki yanındaki el kollarıyla çevrildikçe tambura sarılan halat sürgüyü geriye çeker. Tambur yarıçapı küçük, kollar uzun olduğu için topçu, burulma demetlerinin büyük kuvvetini kaldıraç avantajıyla yenebilir.',
      material: 'Meşe Mil & Demir Kol',
      weight: '~7 kg',
      spec: 'Tambur Ø 12 cm, 4 kollu çark',
      location: 'Kızağın arka ucu',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.4, -1.2],
      isOuterShell: false
    });
    const WINCH_Z = -1.22;
    const DRUM_R = 0.06;
    const winchGroup = new THREE.Group();
    winchGroup.position.set(0, 0.12, WINCH_Z);
    partWinch.add(winchGroup);
    add(winchGroup, new THREE.CylinderGeometry(0.03, 0.03, 0.56, 12), woodMat, [0, 0, 0], ROT_Z);
    add(winchGroup, new THREE.CylinderGeometry(DRUM_R, DRUM_R, 0.14, 16), ropeMat, [0, 0, 0], ROT_Z);
    [-0.29, 0.29].forEach(x => {
      add(winchGroup, new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), metalMat, [x, 0, 0], ROT_Z);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2;
        add(winchGroup, new THREE.CylinderGeometry(0.014, 0.014, 0.34, 8), ironMat,
          [x, Math.cos(a) * 0.17, Math.sin(a) * 0.17], [a, 0, 0], false);
      }
    });
    [-0.16, 0.16].forEach(x => add(partWinch, new THREE.BoxGeometry(0.04, 0.12, 0.10), woodMat, [x, 0.12, WINCH_Z]));
    const ropeSeg = add(partWinch, new THREE.CylinderGeometry(0.008, 0.008, 1, 6), ropeMat, [0, 0, 0], [0, 0, 0], false);
    elevGroup.add(partWinch);

    const partBolt = createPartGroup({
      id: 'bal_bolt',
      name: `Ok (${BOLT_LEN.toFixed(2).replace('.', ',')} m) — Piramidal Demir Uçlu`,
      subsystem: 'stock',
      subLabel: 'ALT SİSTEM: KIZAK & KURMA',
      desc: 'Sert ağaçtan gövde, kalkan ve zırh delmek için kare kesitli piramidal demir uç ve üç tüy. Vitruvius\'un oranlar sistemi bu ok boyundan başlar. Atıştan sonra gerçek bir balistik kavisle uçar (yavaş çekim).',
      material: 'Dişbudak, Demir & Tüy',
      weight: '~0,4 kg (tahmini)',
      spec: 'Vitruvius: D = ok boyu / 9',
      location: 'Sürgünün oluğunda',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.0, 1.8],
      isOuterShell: false
    });
    const boltGroup = new THREE.Group(); // yerel orijin = ok kuyruğu (kirişe dayanan uç)
    partBolt.add(boltGroup);
    function buildBoltGeometry(parent, adder) {
      adder(parent, new THREE.CylinderGeometry(0.013, 0.013, BOLT_LEN - 0.12, 8), woodMat, [0, 0, (BOLT_LEN - 0.12) / 2], ROT_X);
      adder(parent, new THREE.ConeGeometry(0.022, 0.13, 4), ironMat, [0, 0, BOLT_LEN - 0.06], ROT_X);
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2;
        adder(parent, new THREE.PlaneGeometry(0.035, 0.16), featherMat, [Math.cos(a) * 0.025, Math.sin(a) * 0.025, 0.12], [Math.PI / 2, 0, a + Math.PI / 2]);
      }
    }
    buildBoltGeometry(boltGroup, (p, g, m, pos, rot) => add(p, g, m, pos, rot, false));
    elevGroup.add(partBolt);

    // ===================== D. AYAK & MAFSAL (stand) =====================
    const partStand = createPartGroup({
      id: 'bal_stand',
      name: 'Ayak (Columella) & Üç Bacaklı Kaide',
      subsystem: 'stand',
      subLabel: 'ALT SİSTEM: AYAK & NİŞAN',
      desc: 'Makineyi göğüs hizasına kaldıran dikme ve onu taşıyan üç bacaklı kaide. Payandalar dikmeyi bacaklara bağlar; atışta oluşan sarsıntıyı zemine dağıtır.',
      material: 'Meşe & Demir Kuşak',
      weight: '~40 kg (tahmini)',
      spec: `Nişan ekseni ≈ ${PIVOT_Y.toFixed(2).replace('.', ',')} m`,
      location: 'Zemin',
      basePos: [0, 0, 0],
      explodeVec: [0, -0.6, 0],
      isOuterShell: false
    });
    add(partStand, new THREE.CylinderGeometry(0.07, 0.08, 1.0, 14), woodMat, [0, 0.55, 0]);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + Math.PI / 2;
      const dx = Math.cos(a), dz = Math.sin(a);
      add(partStand, new THREE.BoxGeometry(0.08, 0.07, 0.9), woodMat, [dx * 0.42, 0.05, dz * 0.42], [0, -a + Math.PI / 2, 0]);
      add(partStand, new THREE.BoxGeometry(0.04, 0.04, 0.62), woodMat, [dx * 0.24, 0.32, dz * 0.24], [0, -a + Math.PI / 2, 0]).rotateX(0.75);
    }
    add(partStand, new THREE.CylinderGeometry(0.085, 0.085, 0.04, 14), metalMat, [0, 0.95, 0], [0, 0, 0], false);
    root.add(partStand);

    const partJoint = createPartGroup({
      id: 'bal_joint',
      name: 'Kardan Mafsal (Carchesium) — Yükseliş & Yön Mafsalı',
      subsystem: 'stand',
      subLabel: 'ALT SİSTEM: AYAK & NİŞAN',
      desc: 'Kızak, ayağın tepesindeki çatallı bir mafsala yatay bir pimle bağlanır. Bu düzen makinenin hem yukarı-aşağı (yükseliş) hem de sağa-sola döndürülmesini sağlar. Yükseliş açısı menzili belirler: hava direnci ihmal edildiğinde en uzak atış yaklaşık 45°\'dedir.',
      material: 'Tunç & Demir Pim',
      weight: '~6 kg',
      spec: '0° – 30° yükseliş',
      location: 'Ayağın tepesi',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.3, -0.5],
      isOuterShell: false
    });
    add(partJoint, new THREE.BoxGeometry(0.16, 0.10, 0.16), metalMat, [0, 1.02, 0]);
    [-0.1, 0.1].forEach(x => add(partJoint, new THREE.BoxGeometry(0.03, 0.18, 0.12), metalMat, [x, 1.12, 0]));
    add(partJoint, new THREE.CylinderGeometry(0.018, 0.018, 0.28, 10), ironMat, [0, PIVOT_Y, 0], ROT_Z);
    root.add(partJoint);

    // ===================== UÇAN OK (parça değil; sahnede bağımsız) =====================
    const flyBolt = new THREE.Group();
    flyBolt.visible = false;
    scene.add(flyBolt);
    buildBoltGeometry(flyBolt, (p, g, m, pos, rot) => {
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(pos[0], pos[1], pos[2]);
      mesh.rotation.set(rot[0], rot[1], rot[2]);
      mesh.castShadow = true;
      p.add(mesh);
      return mesh;
    });

    // ------------------------------------------------------------------------
    // MEKANİK DURUM
    // ------------------------------------------------------------------------
    const S = {
      draw: 0.65,       // 0..1 sürgü geri çekilme oranı (sahne kurulu ve dolu açılır)
      twist: 0.6,       // 0..1 ön gerilim
      elev: 12,         // derece
      elevCur: 12,
      released: false,  // pençe açık, kiriş serbest
      loaded: true,
      ammo: 12,
      releaseT: -1,
      thetaRelease: THETA_REST,
      sliderZRelease: 0,
      oscT: -1,
      auto: 'none',     // 'none' | 'reset' | 'draw'
      autoThenDraw: false,
      loop: false,
      lastClick: 0.65,
      flightT: 0,
      stuckT: -1,
      lastV0: 0,
      finish: 'oak_bronze',
      relief: true
    };
    const flight = { p0: new THREE.Vector3(), v0: new THREE.Vector3() };

    const thetaForDraw = d => THETA_REST - d * THETA_SWING;
    function stringCenterZ(theta) {
      const xt = SK + ARM * Math.cos(theta);
      const zt = FZ + ARM * Math.sin(theta);
      return zt - Math.sqrt(Math.max(0, STRING_HALF * STRING_HALF - xt * xt));
    }
    const SLIDER_Z_REST = stringCenterZ(THETA_REST);

    function muzzleVelocity(d, tw) { return V_MAX * Math.sqrt(Math.max(0, d)) * (0.55 + 0.45 * tw); }
    function rangeMeters(d, tw, elevDeg) {
      const v = muzzleVelocity(d, tw);
      const th = THREE.MathUtils.degToRad(elevDeg);
      const vy = v * Math.sin(th), vx = v * Math.cos(th);
      const h = PIVOT_Y + AXIS_Y;
      const t = (vy + Math.sqrt(vy * vy + 2 * 9.81 * h)) / 9.81;
      return Math.round(vx * t);
    }

    function catchString() {
      S.released = false;
      S.draw = 0;
      if (!S.loaded && S.ammo > 0) S.loaded = true;
    }

    function ratchetClick() {
      if (audio && Math.abs(S.draw - S.lastClick) >= 0.05) { audio.playClick(1100); S.lastClick = S.draw; }
    }

    function fire() {
      if (S.released) return { ok: false, msg: '<strong>Kiriş zaten serbest.</strong><br/>Önce sürgüyü ileri itip pençeyle kirişi yakalayın, sonra yeniden kurun.' };
      if (!S.loaded) return { ok: false, msg: S.ammo > 0 ? '<strong>Ok yerleştirilmemiş.</strong><br/>Sürgüyü tamamen ileri (%0) itince yeni ok yerleşir.' : '<strong>Ok kalmadı!</strong> "Ok İkmali" ile yeni oklar getirin.' };
      if (S.draw < 0.15) return { ok: false, msg: '<strong>Kiriş yeterince gerilmemiş.</strong><br/>"Kiriş Germe" en az %15 olmalı.' };
      S.released = true;
      S.releaseT = 0;
      S.thetaRelease = thetaForDraw(S.draw);
      S.sliderZRelease = stringCenterZ(S.thetaRelease);
      S.lastV0 = muzzleVelocity(S.draw, S.twist);
      S.ammo -= 1;
      if (audio && audio.playTwang) audio.playTwang();
      return { ok: true };
    }

    function refill() { S.ammo = 12; if (!S.released && S.draw === 0) S.loaded = true; }

    // ------------------------------------------------------------------------
    // HER KARE GÜNCELLEME
    // ------------------------------------------------------------------------
    const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
    function update(dt) {
      // Otomatik çevrim: ileri it → yakala/ok yerleştir → çıkrıkla kur → (seri atışta) ateş
      if (S.auto === 'reset') {
        S.draw = Math.max(0, S.draw - dt * 0.9);
        if (S.draw <= 0) { catchString(); S.auto = (S.loop || S.autoThenDraw) ? 'draw' : 'none'; S.autoThenDraw = false; }
      } else if (S.auto === 'draw') {
        if (S.released) { S.auto = 'reset'; }
        else if (!S.loaded && S.ammo <= 0) { S.auto = 'none'; S.loop = false; notify('<strong>Ok kalmadı!</strong> Seri atış durdu.'); }
        else {
          S.draw = Math.min(1, S.draw + dt * 0.35);
          ratchetClick();
          if (S.draw >= 1) {
            S.auto = 'none';
            if (S.loop) { const r = fire(); if (!r.ok) S.loop = false; }
          }
        }
      }
      if (S.loop && S.auto === 'none' && S.released && S.releaseT < 0 && S.stuckT < 0 && !flyBolt.visible) S.auto = 'reset';

      // Kol açısı
      let theta;
      if (S.released && S.releaseT >= 0) {
        S.releaseT += dt;
        const T = 0.22; // görsel (yavaş çekim) serbest kalma süresi
        const k = Math.min(1, S.releaseT / T);
        theta = THETA_REST + (S.thetaRelease - THETA_REST) * Math.cos(k * Math.PI / 2);
        if (k >= 1) {
          S.releaseT = -1;
          S.oscT = 0;
          // Ok kirişten ayrılır
          boltGroup.localToWorld(flight.p0.set(0, 0, 0));
          const o = elevGroup.localToWorld(_a.set(0, 0, 0));
          const f = elevGroup.localToWorld(_b.set(0, 0, 1));
          flight.v0.subVectors(f, o).normalize().multiplyScalar(S.lastV0);
          S.flightT = 0;
          S.loaded = false;
          flyBolt.visible = true;
          flyBolt.position.copy(flight.p0);
        }
      } else if (S.released) {
        theta = THETA_REST;
        if (S.oscT >= 0) {
          S.oscT += dt;
          theta += 0.09 * Math.exp(-S.oscT * 6) * Math.sin(S.oscT * 38);
          if (S.oscT > 1.2) S.oscT = -1;
        }
      } else {
        theta = thetaForDraw(S.draw);
      }

      armPivots.forEach(pv => { pv.rotation.y = pv.userData.side > 0 ? -theta : Math.PI + theta; });

      // Sürgü konumu daima "draw" değerinden gelir: kurulu iken kirişi taşır, atıştan sonra
      // geride kalır ve topçu onu ileri ittikçe (draw → 0) öne kayar.
      const stringZ = stringCenterZ(theta);
      const sliderPos = stringCenterZ(thetaForDraw(S.draw));
      sliderGroup.position.z = sliderPos;
      clawGroup.rotation.x = S.released ? -0.9 : 0;
      triggerGroup.rotation.x = S.released ? -0.5 : 0;

      // Kiriş: kol uçlarından kiriş merkezine
      const xt = SK + ARM * Math.cos(theta);
      const zt = FZ + ARM * Math.sin(theta);
      _a.set(-xt, AXIS_Y, zt);
      _b.set(xt, AXIS_Y, zt);
      _c.set(0, AXIS_Y, stringZ);
      setBetween(stringSegs[0], _a, _c);
      setBetween(stringSegs[1], _c, _b);

      // Ok: kuyruğu kirişe dayalı (yalnızca kurulu ve yüklüyken veya serbest kalma sırasında)
      boltGroup.visible = S.loaded;
      boltGroup.position.set(0, AXIS_Y + 0.005, stringZ + 0.01);

      // Çıkrık & halat
      winchGroup.rotation.x = -((SLIDER_Z_REST - sliderPos) / DRUM_R);
      _a.set(0, 0.12 + DRUM_R, WINCH_Z);
      _b.set(0, 0.20, sliderPos - 0.02);
      setBetween(ropeSeg, _a, _b);

      // Ön gerilim: halkalar ve demetler döner
      washerGroups.forEach(g => { g.rotation.y = g.userData.dir * S.twist * Math.PI / 2; });
      skeinGroups.forEach((g, i) => { g.rotation.y = (i === 0 ? -1 : 1) * (S.twist * Math.PI / 2 + (THETA_REST - theta) * 0.6); });

      // Yükseliş
      S.elevCur += (S.elev - S.elevCur) * Math.min(1, dt * 6);
      elevGroup.rotation.x = -THREE.MathUtils.degToRad(S.elevCur);

      // Uçuş (yavaş çekim) — ok hız vektörüne hizalanır, yere saplanır
      if (flyBolt.visible && S.stuckT < 0) {
        S.flightT += dt * SLOWMO;
        const t = S.flightT;
        _a.set(flight.p0.x + flight.v0.x * t, flight.p0.y + flight.v0.y * t - 4.905 * t * t, flight.p0.z + flight.v0.z * t);
        _b.set(flight.v0.x, flight.v0.y - 9.81 * t, flight.v0.z);
        flyBolt.position.copy(_a);
        flyBolt.lookAt(_c.copy(_a).add(_b));
        if (_a.y <= 0.05) { S.stuckT = 0; }
        else if (_a.distanceTo(flight.p0) > 70) { flyBolt.visible = false; }
      } else if (S.stuckT >= 0) {
        S.stuckT += dt;
        if (S.stuckT > 2.5) { flyBolt.visible = false; S.stuckT = -1; }
      }
    }

    // ------------------------------------------------------------------------
    // DOKU / KAPLAMA
    // ------------------------------------------------------------------------
    function applyTextures(blueprint) {
      const fin = FINISHES[S.finish];
      myMeshes.forEach(m => {
        const role = m.material.userData && m.material.userData.balRole;
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
    function setTexture(key) { if (FINISHES[key]) S.finish = key; }
    function toggleRelief() { S.relief = !S.relief; return S.relief; }

    // ------------------------------------------------------------------------
    // ADAPTÖR ARAYÜZÜ
    // ------------------------------------------------------------------------
    const ui = {
      title: 'ROMA BALLİSTASI — İki Kollu Burulma Ok Atıcısı',
      sub: 'M.Ö. 4. yy\'da Helen dünyasında gelişen, Roma\'nın devraldığı burulma topçuluğu • Vitruvius oranları (D = ok boyu / 9)',
      partCount: '12 Ana Grup',
      texTitle: '🪵 Ahşap & Metal Kaplama',
      textures: Object.keys(FINISHES).map(k => ({ key: k, label: FINISHES[k].btn })),
      textureLabel: () => FINISHES[S.finish].label,
      activeTexture: () => S.finish,
      reliefLabel: on => (on ? '🪵 Ahşap Damar Kabartması: AÇIK' : '🪵 Ahşap Damar Kabartması: KAPALI'),
      relief: () => S.relief,
      subsystems: [
        { key: 'torsion', label: 'Burulma Yayları & Çerçeve', color: '#d97706', count: 3 },
        { key: 'arms', label: 'Kollar & Kiriş', color: '#ef4444', count: 2 },
        { key: 'stock', label: 'Kızak, Sürgü, Cırcır & Çıkrık', color: '#10b981', count: 5 },
        { key: 'stand', label: 'Ayak & Kardan Mafsal', color: '#38bdf8', count: 2 }
      ],
      camLabels: { iso: 'İzometrik', front: 'Ön Görünüş', breech: 'Yay Çerçevesi', engine: 'Çıkrık', suspension: 'Ayak & Mafsal', top: 'Üst Kesit' },
      sliders: [
        { label: 'Kiriş Germe (Çıkrık & Cırcır)', min: 0, max: 100, step: 1, fmt: v => `%${Math.round(v)}` },
        { label: 'Tendon Ön Gerilimi (Halka Dönüşü)', min: 0, max: 100, step: 1, fmt: v => `${Math.round(v * 0.9)}°` },
        { label: 'Yükseliş Açısı (Kardan Mafsal)', min: 0, max: 30, step: 0.5, fmt: v => `+${v}°` }
      ],
      buttons: { terrain: '🔄 Otomatik Kurma (Çıkrık)', sweep: '🎯 Seri Atış Gösterimi' },
      telemetryTag: 'VITRUVIUS X',
      statLabels: ['İLK HIZ (TAHMİNİ)', 'MENZİL (HESAP)', 'KALAN OK', 'AĞIRLIK (TAHMİNİ)']
    };

    function getSliderValues() { return [S.draw * 100, S.twist * 100, S.elev]; }

    function onSlider(index, val) {
      if (index === 0) {
        S.auto = 'none'; S.loop = false;
        const d = val / 100;
        if (S.released) {
          if (d > S.draw + 1e-6) return { msg: '<strong>Pençe açık, kiriş serbest.</strong><br/>Önce sürgüyü tamamen ileri (%0) itin; pençe kirişi yakalayınca yeniden kurabilirsiniz.' };
          S.draw = d;
          if (S.draw <= 0.001) catchString();
        } else {
          S.draw = d;
          ratchetClick();
        }
      } else if (index === 1) {
        S.twist = val / 100;
      } else if (index === 2) {
        S.elev = val;
      }
      return {};
    }

    function onButton(name) {
      if (name === 'terrain') {
        S.loop = false;
        if (S.auto !== 'none') { S.auto = 'none'; return { active: false }; }
        if (S.released || !S.loaded) { S.auto = 'reset'; S.autoThenDraw = true; } else { S.auto = 'draw'; }
        return { active: true };
      }
      if (name === 'sweep') {
        S.loop = !S.loop;
        if (S.loop) {
          if (S.ammo <= 0 && !S.loaded) { S.loop = false; return { active: false, msg: '<strong>Ok kalmadı!</strong> Önce "Ok İkmali" yapın.' }; }
          S.auto = (S.released || !S.loaded) ? 'reset' : 'draw';
        } else { S.auto = 'none'; }
        return { active: S.loop };
      }
      return {};
    }
    const buttonActive = name => (name === 'terrain' ? (S.auto !== 'none' && !S.loop) : S.loop);

    function fireButtonLabel() { return (!S.loaded && S.ammo <= 0) ? '📦 OK İKMALİ (12 Adet)' : '💥 BALLİSTAYI ATEŞLE (TETİK)'; }
    function onFire() {
      if (!S.loaded && S.ammo <= 0) { refill(); return { ok: true, refill: true }; }
      return fire();
    }

    function getStats() {
      const v = muzzleVelocity(S.draw, S.twist);
      return [
        `${Math.round(v)} <span>m/sn</span>`,
        `${rangeMeters(S.draw, S.twist, S.elev)} <span>Metre</span>`,
        `${S.ammo} <span>Adet</span>`,
        `~120 <span>kg</span>`
      ];
    }
    function getStatus() {
      if (S.released && S.releaseT >= 0) return { text: 'ATEŞ!', color: '#ef4444' };
      if (S.released) return { text: 'KİRİŞ SERBEST', color: '#d97706' };
      if (S.auto === 'draw') return { text: 'KURULUYOR', color: '#d97706' };
      if (!S.loaded) return { text: 'OK YOK', color: '#d97706' };
      if (S.draw < 0.15) return { text: 'GERİLMEDİ', color: '#64748b' };
      return { text: `KURULU %${Math.round(S.draw * 100)}`, color: '#0284c7' };
    }

    const camPresets = {
      iso: { pos: [4.2, 2.6, 4.2], look: [0, 1.2, 0] },
      front: { pos: [0.6, 1.6, 3.8], look: [0, 1.35, 0.7] },
      breech: { pos: [1.6, 1.9, 1.8], look: [0.3, 1.45, 0.7] },
      engine: { pos: [-1.6, 1.8, -2.6], look: [0, 1.3, -1.1] },
      suspension: { pos: [2.4, 1.0, 1.2], look: [0, 0.8, 0] },
      top: { pos: [0.1, 5.5, 0.1], look: [0, 1.2, 0] }
    };

    const tourSteps = [
      { title: 'Genel Bakış: Roma Ballistası (İki Kollu Burulma Makinesi)', desc: 'Esnek bir yay yerine burulmuş tendon demetlerinde enerji depolayan hassas atış makinesi. Burulma topçuluğu M.Ö. 4. yüzyılda Helen dünyasında gelişti ve Roma ordusu tarafından devralındı. Model, Vitruvius\'un oranlar sisteminden esinlenir.', explode: 0, cutaway: false, sub: 'all', cam: 'iso', part: partFrame },
      { title: 'X-Ray: Tendon Demetleri — Makinenin Enerji Kaynağı', desc: 'Çerçeve saydamlaşınca iki dikey tendon demeti görünür. Kollar bu demetlerin ortasından geçer; geriye döndükçe demetleri burarak enerji depolar.', explode: 0, cutaway: true, sub: 'all', cam: 'breech', part: partSkeins },
      { title: 'Ön Gerilim: Tunç Burma Halkaları', desc: '"Tendon Ön Gerilimi" kaydırıcısını değiştirin: halkalar ve demetler döner, telemetrideki ilk hız ve menzil artar. Gerçekte iki yanın eşit gerilmesi gerekirdi.', explode: 25, cutaway: true, sub: 'torsion', cam: 'breech', part: partWashers },
      { title: 'Kurma: Çıkrık, Cırcır ve Sürgü', desc: '"Kiriş Germe" kaydırıcısıyla çıkrığı çevirin: halat sürgüyü geri çeker, kollar geriye döner ve cırcır mandalları sürgünün kaçmasını engeller.', explode: 0, cutaway: false, sub: 'all', cam: 'engine', part: partWinch },
      { title: 'Atış: Pençe Tetik ve Ok Uçuşu', desc: 'Tetik kolu pençeyi açar, kollar ileri fırlar ve kiriş oku iter. Ok gerçek bir kavisle uçar (yavaş çekim). Yeniden kurmak için sürgüyü ileri itip kirişi yakalamak gerekir.', explode: 0, cutaway: false, sub: 'all', cam: 'iso', part: partSlider },
      { title: 'Tam Teardown (%85): 12 Mekanik Grup', desc: 'Çerçeve, tendon demetleri, burma halkaları, kollar, kiriş, kızak, sürgü-pençe, cırcır, çıkrık, ok, ayak ve kardan mafsal ayrılmış görünümde.', explode: 85, cutaway: false, sub: 'all', cam: 'iso', part: partStand }
    ];

    return {
      root, ui, camPresets, tourSteps,
      flashMesh: null,
      parts: { frame: partFrame, skeins: partSkeins, washers: partWashers, arms: partArms, string: partString, stock: partStock, slider: partSlider, ratchet: partRatchet, winch: partWinch, bolt: partBolt, stand: partStand, joint: partJoint },
      defaultPart: partFrame,
      update, onSlider, onButton, buttonActive, onFire, fireButtonLabel,
      getSliderValues, getStats, getStatus,
      applyTextures, setTexture, toggleRelief,
      specs: { D, BOLT_LEN, V_MAX, rangeMeters }
    };
  };
})();
