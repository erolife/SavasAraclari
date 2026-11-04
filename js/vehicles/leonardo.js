/* =============================================================================
 * 1487 Leonardo da Vinci'nin Zırhlı Aracı (Carro Armato — Codex Arundel f.1030)
 * 14 bağımsız mekanik grup, 4 alt sistem — Adaptör Kalıbı
 * Klasik script olarak yüklenir; sayfa file:// ile açıldığında da çalışır.
 *
 * Tarihsel ve Mekanik Arka Plan:
 *  - Leonardo da Vinci, ~1487'de Milano Dükü Ludovico Sforza'nın hizmetindeyken
 *    kaplumbağa kabuğundan esinlenen konik ahşap zırhlı, 8 kişinin içeriden krank
 *    çevirerek hareket ettirdiği ve çevresine 16 hafif top (falconet) dizilmiş bir
 *    kuşatma/muharebe aracı tasarladı (British Museum, Arundel MS 263, f.1030).
 *  - Ünlü "Ters Dişli Bilmecesi": Leonardo'nun çiziminde krank milindeki fener
 *    dişliler (rocchetti), ön ve arka tekerleklerin çivili taç dişlilerine aynı iç
 *    taraftan kavrar. Bu düzende krank çevrildiğinde ön ve arka tekerlekler birbirine
 *    ZIT yönde döner ve araç olduğu yerde kilitlenir. Tarihçiler bunun çizimlerin
 *    çalınmasına karşı bilinçli bir "mühendislik şifresi/kilidi" mi yoksa hızlı bir
 *    eskiz hatası mı olduğunu hâlâ tartışmaktadır.
 * ========================================================================== */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.leonardo = function buildLeonardo(ctx) {
    const { THREE, scene, addCADMesh, createPartGroup, addInstancedMesh } = ctx;
    const audio = ctx.audio || null;
    const notify = ctx.notify || (() => {});

    // ------------------------------------------------------------------------
    // ÖLÇÜLER (1 birim = 1 m)
    // ------------------------------------------------------------------------
    const R_BASE = 2.55;          // Konik zırh alt etek yarıçapı (çap ~5,1 m)
    const R_TOP = 0.58;           // Gözetleme kulesi boğaz yarıçapı
    const Y_SKIRT = 0.28;         // Alt etek zırhının yerden yüksekliği
    const Y_PORT = 1.02;          // Top mazgalları kuşağı yüksekliği
    const Y_CONE_TOP = 2.22;      // Ana konik kabuk üst yüksekliği
    const Y_DECK = 0.62;          // Mürettebat ve şasi platformu yüksekliği
    const R_WHEEL = 0.56;         // Tahrik tekerleği yarıçapı (merkez Y = 0.56 -> zemine tam değer)
    const WHEEL_X = 1.32;         // Tekerleklerin X ekseni açıklığı
    const WHEEL_Z = 1.18;         // Ön ve arka dingil Z mesafesi
    const CRANK_Y = 1.08;         // Krank mili yüksekliği
    const GUN_COUNT = 16;         // Çevresel hafif top sayısı

    // ------------------------------------------------------------------------
    // PROSEDÜREL DOKULAR VE KAPLAMALAR
    // ------------------------------------------------------------------------
    function makeWoodTex(baseHex, grainHex, stripeHex, isBump) {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const g = c.getContext('2d');
      g.fillStyle = isBump ? '#808080' : baseHex;
      g.fillRect(0, 0, 256, 256);

      let seed = baseHex.charCodeAt(1) * 131 + baseHex.charCodeAt(2) * 37;
      const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

      // Kalas birleşim derzleri
      g.strokeStyle = isBump ? 'rgba(20,20,20,0.85)' : 'rgba(15,10,5,0.38)';
      g.lineWidth = 2;
      for (let y = 32; y < 256; y += 32) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(256, y);
        g.stroke();
      }

      // Ahşap damar çizgileri
      for (let i = 0; i < 85; i++) {
        const y0 = rand() * 256;
        const amp = 1.5 + rand() * 4.5;
        const freq = 0.015 + rand() * 0.025;
        g.strokeStyle = isBump
          ? (rand() > 0.5 ? 'rgba(35,35,35,0.55)' : 'rgba(220,220,220,0.4)')
          : grainHex;
        g.globalAlpha = isBump ? 0.9 : (0.16 + rand() * 0.28);
        g.lineWidth = 0.7 + rand() * 1.6;
        g.beginPath();
        for (let x = 0; x <= 256; x += 8) {
          const y = y0 + Math.sin(x * freq + i) * amp;
          if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.stroke();
      }

      // Sforza / Rönesans geometrik kuşak motifi (varsa)
      if (!isBump && stripeHex) {
        g.globalAlpha = 0.28;
        g.fillStyle = stripeHex;
        g.fillRect(0, 96, 256, 28);
        g.fillRect(0, 192, 256, 20);
      }
      g.globalAlpha = 1;

      const t = new THREE.CanvasTexture(c);
      if (!isBump) t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      return t;
    }

    const FINISHES = {
      florence1487: {
        btn: '🪵 1487 Floransa Meşe',
        label: '1487 Floransa Koyu Meşe & Dövme Demir Kuşaklar',
        woodBase: '#7c4d25', woodGrain: '#3b1f0b', stripe: null,
        iron: 0x2b3036, bronze: 0xb87333, gearWood: 0x9a6b3b
      },
      codexSepia: {
        btn: '📜 Codex Arundel Eskiz',
        label: 'Codex Arundel (f.1030) Parşömen & Sepya Mürekkep Tonu',
        woodBase: '#c2a67d', woodGrain: '#6e5233', stripe: '#8c6239',
        iron: 0x4a3f35, bronze: 0xa67c52, gearWood: 0xb59469
      },
      sforzaCourt: {
        btn: '🛡️ Milano Dükalığı (Sforza)',
        label: 'Milano Dükü Ludovico Sforza Tören & Kuşatma Boyası',
        woodBase: '#6b3e26', woodGrain: '#2d160a', stripe: '#991b1b',
        iron: 0x1e242b, bronze: 0xd99b26, gearWood: 0x8c5830
      },
      museumPine: {
        btn: '🏛️ Müze Rekonstrüksiyonu',
        label: 'Modern Müze Rekonstrüksiyonu — Açık Çam & Çelik',
        woodBase: '#b8864b', woodGrain: '#6e471b', stripe: null,
        iron: 0x3f4752, bronze: 0xc98a3e, gearWood: 0xc99b62
      }
    };

    const woodMaps = {};
    Object.keys(FINISHES).forEach(k => {
      const f = FINISHES[k];
      woodMaps[k] = makeWoodTex(f.woodBase, f.woodGrain, f.stripe, false);
    });
    const woodBump = makeWoodTex('#808080', '#303030', null, true);

    const myMeshes = [];
    function makeMat(role, hex, rough, metal, bumpScale = 0.022) {
      const m = new THREE.MeshStandardMaterial({
        color: hex,
        roughness: rough,
        metalness: metal,
        map: role === 'wood' ? woodMaps.florence1487 : null,
        bumpMap: role === 'wood' ? woodBump : null,
        bumpScale: role === 'wood' ? bumpScale : 0
      });
      m.userData = { leoRole: role };
      return m;
    }

    const matShellWood = makeMat('wood', 0xffffff, 0.76, 0.06, 0.026);
    const matFrameWood = makeMat('wood', 0xf3e5d0, 0.78, 0.05, 0.018);
    const matGearWood = makeMat('gear', 0x9a6b3b, 0.68, 0.08, 0.015);
    const matWroughtIron = makeMat('iron', 0x2b3036, 0.46, 0.76, 0);
    const matBronzeGun = makeMat('bronze', 0xb87333, 0.34, 0.82, 0);
    const matRopeHemp = makeMat('other', 0xc2a472, 0.88, 0.02, 0);
    const matIdlerHighlight = makeMat('idler', 0x0284c7, 0.35, 0.65, 0);

    function addMesh(parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], castShadow = true) {
      const m = addCADMesh(parent, geo, mat, pos, rot, castShadow);
      myMeshes.push(m);
      return m;
    }

    // ------------------------------------------------------------------------
    // KÖK GRUP VE 14 MEKANİK PARÇA GRUBU
    // ------------------------------------------------------------------------
    const root = new THREE.Group();
    root.name = 'leonardo_root';
    root.visible = false;
    scene.add(root);

    // 1. Konik Ahşap Zırh Kabuğu (Dış Kabuk — X-Ray'de saydamlaşır)
    const partConeArmor = createPartGroup({
      id: 'leo_cone_armor',
      name: '1. Konik Eğimli Ahşap Zırh Kabuğu (Testuggine)',
      subsystem: 'armor',
      subLabel: 'Zırh Kabuğu & İskelet',
      desc: 'Kaplumbağa kabuğundan esinlenen 16 dilimli eğimli meşe zırh plakaları ve demir çember kuşaklar. Düşman güllelerini sektirmek için ~38° eğimle tasarlanmıştır; X-Ray modunda saydamlaşarak iç mekanizmayı gösterir.',
      material: 'Meşe Kalas + Dövme Demir Kuşak',
      weight: '~1.450 kg',
      spec: '16 Dilim • Ø 5,1 m • 75 mm Kalas',
      location: 'Üst Gövde Kabuğu',
      basePos: [0, 0, 0],
      explodeVec: [0, 2.5, 0],
      isOuterShell: true
    });
    root.add(partConeArmor);

    // 2. İç Radyal Kaburga İskeleti (16 Kiriş)
    const partRibFrame = createPartGroup({
      id: 'leo_rib_frame',
      name: '2. Radyal Çatallı Kaburga İskeleti (16 Ana Kiriş)',
      subsystem: 'armor',
      subLabel: 'Zırh Kabuğu & İskelet',
      desc: 'Konik zırh plakalarını taşıyan 16 adet eğimli meşe mertek ve yatay geçme çember kirişler. Zırh ağırlığını ana şasi platformuna aktarır.',
      material: 'Fırınlanmış Meşe Kiriş',
      weight: '~680 kg',
      spec: '16 Radyal Mertek + 3 Çember Halka',
      location: 'Kabuk İç İskeleti',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.55, 0],
      isOuterShell: false
    });
    root.add(partRibFrame);

    // 3. Üst Gözetleme Kulesi (Komutan Feneri)
    const partCupola = createPartGroup({
      id: 'leo_cupola',
      name: '3. Üst Gözetleme Kulesi (Komutan Feneri & Duman Bacası)',
      subsystem: 'armor',
      subLabel: 'Zırh Kabuğu & İskelet',
      desc: 'Koninin tepesinde yer alan 8 pencereli gözetleme kulesi. İçerideki 8 kişilik mürettebat dışarıyı göremediğinden, komutan buradan yön ve ateş emirlerini verir; aynı zamanda barut dumanını tahliye eder.',
      material: 'Meşe & Demir Zırhlı Kule',
      weight: '~210 kg',
      spec: 'Ø 1,16 m • 8 Gözetleme Yarığı',
      location: 'Tava / Tepe Noktası',
      basePos: [0, 0, 0],
      explodeVec: [0, 3.6, 0],
      isOuterShell: true
    });
    root.add(partCupola);

    // 4. Alt Etek Zırhı & Mazgal Kuşağı
    const partSkirtShield = createPartGroup({
      id: 'leo_skirt_shield',
      name: '4. Alt Etek Zırhı & 16 Top Mazgal Kuşağı',
      subsystem: 'armor',
      subLabel: 'Zırh Kabuğu & İskelet',
      desc: 'Tekerlek poyralarını ve mürettebatın ayaklarını düşman ateşinden koruyan alt zırh eteği ile 16 top namlusunun dışarı uzandığı demir çerçeveli mazgal kuşağı.',
      material: 'Zırhlı Meşe & Demir Çember',
      weight: '~540 kg',
      spec: '16 Mazgal Açıklığı • Y = 0,28–1,12 m',
      location: 'Çevresel Etek',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.9, 1.8],
      isOuterShell: true
    });
    root.add(partSkirtShield);

    // 5. Ana Ahşap Şasi Platformu & Dingil Yatakları
    const partMainDeck = createPartGroup({
      id: 'leo_main_deck',
      name: '5. Ana Şasi Platformu & Dingil Yatakları',
      subsystem: 'chassis',
      subLabel: 'Şasi & Yönlendirme',
      desc: '8 mürettebatın üzerinde durduğu dairesel meşe platform, boyuna ve enine ana şasi kirişleri ile 4 tekerlek dingilinin dökme tunç yatakları.',
      material: 'Kalın Meşe Kiriş & Tunç Yatak',
      weight: '~920 kg',
      spec: 'Ø 4,5 m Platform • Y = 0,62 m',
      location: 'Alt Gövde Şasisi',
      basePos: [0, 0, 0],
      explodeVec: [0, -0.6, 0],
      isOuterShell: false
    });
    root.add(partMainDeck);

    // 6. Arka Yönlendirme Tekeri & Dümen Yekesi
    const partRudderTail = createPartGroup({
      id: 'leo_rudder_tail',
      name: '6. Arka Yönlendirme Tekeri & Dümen Yekesi',
      subsystem: 'chassis',
      subLabel: 'Şasi & Yönlendirme',
      desc: 'Ana tahrik tekerlekleri sabit eksende döndüğü için aracın yönünü hafifçe değiştirmeye yardımcı olan arka sarhoş tekerlek ve iç dümen kolu.',
      material: 'Meşe Teker & Demir Çatal',
      weight: '~145 kg',
      spec: '±30° Dümen Açısı • Arka Merkez',
      location: 'Arka Şasi Uzantısı',
      basePos: [0, 0, 0],
      explodeVec: [0, -0.4, -2.2],
      isOuterShell: false
    });
    root.add(partRudderTail);

    // 7. İkiz Krank Mili & 8 Kişilik Çevirme Kolları
    const partCrankShafts = createPartGroup({
      id: 'leo_crank_shafts',
      name: '7. İkiz Krank Mili & 8 Kişilik Çevirme Kolları',
      subsystem: 'drivetrain',
      subLabel: 'Krank & Fener Dişli Aktarma',
      desc: 'Gövde ortasında boyuna uzanan iki paralel demir/meşe krank mili. Her milde ikişer krank dirseği bulunur; 8 mürettebat kolları çevirerek kas gücünü fener dişlilere aktarır.',
      material: 'Dövme Demir Krank & Gürgen Kollar',
      weight: '~310 kg',
      spec: '2 Krank Mili • 4 Dirsek • 8 Mürettebat',
      location: 'Merkez Makine Dairesi',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.55, 0],
      isOuterShell: false
    });
    root.add(partCrankShafts);

    // 8. Boyuna Tahrik Milleri & 4 Adet Fener Dişli (Rocchetti / Kafes Pinyon)
    const partLanternPinions = createPartGroup({
      id: 'leo_lantern_pinions',
      name: '8. Boyuna Tahrik Milleri & 4 × Fener Dişli (Rocchetti)',
      subsystem: 'drivetrain',
      subLabel: 'Krank & Fener Dişli Aktarma',
      desc: 'Her iki yanda (x = ±1,04 m, y = 0,56 m) Z ekseni boyunca uzanan tahrik milleri ve uçlarındaki 10 çubuklu kafes fener dişliler (r ≈ 0,12 m). Tekerleklerin iç taç dişlileriyle (R = 0,36 m) 90° dik açıyla kavraşır.',
      material: 'Şimşir Ağacı & Dövme Demir Mil',
      weight: '~210 kg',
      spec: 'Z Eksenli 2 Tahrik Mili + 4 Fener Pinyon',
      location: 'Sağ/Sol Alt Aktarma Hattı',
      basePos: [0, 0, 0],
      explodeVec: [-1.4, 0.35, 0],
      isOuterShell: false
    });
    root.add(partLanternPinions);

    // 9. Arka Pinyon Kaydırma Çatalı & Ters Dişli Düzeltme Mandalı
    const partIdlerGear = createPartGroup({
      id: 'leo_idler_gear',
      name: '9. Arka Pinyon Kaydırma Çatalı (Kodeks z=-0,82m ⇄ Düzeltilmiş z=-1,54m)',
      subsystem: 'drivetrain',
      subLabel: 'Krank & Fener Dişli Aktarma',
      desc: 'Codex Arundel f.1030 çiziminde arka fener pinyon z = -0,82 m konumunda (arka taç dişlinin ön kenarı) durduğu için ön ve arka tekerlekler ZIT yönde döner. Kaydırma çatalı arka pinyonu mil üzerinde z = -1,54 m konumuna (arka kenar) kaydırdığında 4 tekerlek aynı yönde döner!',
      material: 'Dövme Demir Çatal & Tunç Bilezik',
      weight: '~85 kg',
      spec: 'z = -0,82 m (Kodeks) ⇄ z = -1,54 m (Senkron)',
      location: 'Arka Tahrik Mili Üzeri',
      basePos: [0, 0, 0],
      explodeVec: [1.4, 0.35, -0.8],
      isOuterShell: false
    });
    root.add(partIdlerGear);

    // 10. Ön Tahrik Tekerlekleri & Çivili Taç Dişliler (2 Adet)
    const partFrontWheels = createPartGroup({
      id: 'leo_front_wheels',
      name: '10. Ön Tahrik Tekerlekleri & Çivili Taç Dişliler (Sağ/Sol)',
      subsystem: 'drivetrain',
      subLabel: 'Krank & Fener Dişli Aktarma',
      desc: 'İç yüzeyinde 24 adet ahşap/demir kama diş bulunan çivili taç dişli (ruota dentata) ile donatılmış ön tahrik tekerlekleri. Çamurlu arazide tutunma için dış çemberde demir mahmuzlar yer alır.',
      material: 'Meşe İspit & Demir Çember',
      weight: '~480 kg (Çift)',
      spec: 'Ø 1,12 m • 24 Taç Diş • Z = +1,18 m',
      location: 'Ön Dingil Hattı',
      basePos: [0, 0, 0],
      explodeVec: [0, -0.2, 1.9],
      isOuterShell: false
    });
    root.add(partFrontWheels);

    // 11. Arka Tahrik Tekerlekleri & Çivili Taç Dişliler (2 Adet)
    const partRearWheels = createPartGroup({
      id: 'leo_rear_wheels',
      name: '11. Arka Tahrik Tekerlekleri & Çivili Taç Dişliler (Sağ/Sol)',
      subsystem: 'drivetrain',
      subLabel: 'Krank & Fener Dişli Aktarma',
      desc: 'Arka dingildeki tahrik tekerlekleri. "1487 Kodeks" modunda ön tekerleklere ZIT yönde dönerek aracı kilitler; "Düzeltilmiş Dişli" modunda ön tekerleklerle aynı yönde dönerek aracı ilerletir.',
      material: 'Meşe İspit & Demir Çember',
      weight: '~480 kg (Çift)',
      spec: 'Ø 1,12 m • 24 Taç Diş • Z = -1,18 m',
      location: 'Arka Dingil Hattı',
      basePos: [0, 0, 0],
      explodeVec: [0, -0.2, -1.9],
      isOuterShell: false
    });
    root.add(partRearWheels);

    // 12. Çevresel Top Platformu & 16 Kundak
    const partCannonRing = createPartGroup({
      id: 'leo_cannon_ring',
      name: '12. 360° Çevresel Top Halkası & 16 Ahşap Kundak',
      subsystem: 'artillery',
      subLabel: '360° Çevresel Top Bataryası',
      desc: 'Zırh eteğinin hemen arkasında 360° boyunca dizilmiş 16 adet kızaklı meşe top kundağı ve yükseliş takozları. Aracın her yöne ateş edebilmesini sağlar.',
      material: 'Meşe Kundak & Demir Kızak',
      weight: '~640 kg',
      spec: '16 Kundak • 22,5° Açısal Aralık',
      location: 'Çevresel Batarya Güvertesi',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.85, 0],
      isOuterShell: false
    });
    root.add(partCannonRing);

    // 13. 16 Adet Kuyruktan Dolma Tunç Hafif Top (Falconet)
    const partCannonBarrels = createPartGroup({
      id: 'leo_cannon_barrels',
      name: '13. 16 Adet Tunç Hafif Top Namlusu (Falconet / Spingarda)',
      subsystem: 'artillery',
      subLabel: '360° Çevresel Top Bataryası',
      desc: 'Mazgallardan dışarı uzanan 16 adet dökme tunç hafif top (~50 mm kalibre). Dar iç hacimde ağızdan dolum imkânsız olduğu için değiştirilebilir barut odalı (kuyruktan dolma / mascolo) olarak tasarlanmıştır.',
      material: 'Dökme Tunç (Bronz)',
      weight: '~1.120 kg (16 × 70 kg)',
      spec: '16 × Ø 50 mm • L = 1,05 m',
      location: '360° Mazgal Hattı',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.15, 1.4],
      isOuterShell: false
    });
    root.add(partCannonBarrels);

    // 14. Barut Fıçıları, Yedek Barut Odaları (Mascoli) & Gülle Sandıkları
    const partAmmoPowder = createPartGroup({
      id: 'leo_ammo_powder',
      name: '14. Barut Fıçıları, Kuyruk Odaları (Mascoli) & Gülle Sandıkları',
      subsystem: 'artillery',
      subLabel: '360° Çevresel Top Bataryası',
      desc: 'Platform üzerinde depolanan kara barut fıçıları, önceden doldurulmuş yedek tunç barut odaları (mascoli) ve demir/taş gülle sandıkları.',
      material: 'Meşe Fıçı, Tunç Oda & Demir Gülle',
      weight: '~380 kg',
      spec: '32 Atımlık Hazır Mühimmat',
      location: 'Platform İç İstif Alanı',
      basePos: [0, 0, 0],
      explodeVec: [1.3, 0.2, 1.3],
      isOuterShell: false
    });
    root.add(partAmmoPowder);

    // ------------------------------------------------------------------------
    // GEOMETRİ İNŞASI
    // ------------------------------------------------------------------------

    // --- 1. Konik Ahşap Zırh Kabuğu (partConeArmor) ---
    const coneHeight = Y_CONE_TOP - Y_PORT;
    const coneMidY = (Y_CONE_TOP + Y_PORT) * 0.5;
    const coneGeo = new THREE.CylinderGeometry(R_TOP, R_BASE * 0.88, coneHeight, 16, 1, true);
    addMesh(partConeArmor, coneGeo, matShellWood, [0, coneMidY, 0]);

    // Konik kabuk üzerindeki demir takviye çemberleri
    [0.18, 0.52, 0.86].forEach(t => {
      const y = Y_PORT + coneHeight * t;
      const r = THREE.MathUtils.lerp(R_BASE * 0.88, R_TOP, t) + 0.015;
      const bandGeo = new THREE.CylinderGeometry(r - 0.01, r + 0.01, 0.055, 16, 1, true);
      addMesh(partConeArmor, bandGeo, matWroughtIron, [0, y, 0]);
    });

    // 16 dilim sırt çıtaları (dövme demir şeritler)
    const slopeLen = Math.hypot(R_BASE * 0.88 - R_TOP, coneHeight);
    const slopeAngle = Math.atan2(R_BASE * 0.88 - R_TOP, coneHeight);
    const strakeGeo = new THREE.BoxGeometry(0.055, slopeLen, 0.03);
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      const rMid = (R_BASE * 0.88 + R_TOP) * 0.5 + 0.012;
      const grp = new THREE.Group();
      grp.rotation.y = ang;
      addMesh(grp, strakeGeo, matWroughtIron, [0, coneMidY, rMid], [-slopeAngle, 0, 0]);
      partConeArmor.add(grp);
    }

    // --- 2. İç Radyal Kaburga İskeleti (partRibFrame) ---
    // Koni dış yüzeyi Y_PORT (0.92 m, r=2.11 m) ile Y_CONE_TOP (2.22 m, r=0.56 m) arasında daraldığı için,
    // iç kaburgalar koni yüzeyinin ~0.12 m içerisinden paralel (rot.x = -ribTilt) olarak
    // Y = 1.00 m (r = 1.88 m) seviyesinden Y = 2.16 m (r = 0.50 m) seviyesine uzanır.
    const ribBottomR = 1.80;
    const ribTopR = 0.44;
    const ribBottomY = 1.00;
    const ribTopY = 2.14;
    const ribSpanY = ribTopY - ribBottomY;
    const ribLen = Math.hypot(ribBottomR - ribTopR, ribSpanY);
    const ribTilt = Math.atan2(ribBottomR - ribTopR, ribSpanY);
    const ribGeo = new THREE.BoxGeometry(0.075, ribLen, 0.085);
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2 + Math.PI / 16;
      const rMid = (ribBottomR + ribTopR) * 0.5;
      const yMid = (ribTopY + ribBottomY) * 0.5;
      const grp = new THREE.Group();
      grp.rotation.y = ang;
      addMesh(grp, ribGeo, matFrameWood, [0, yMid, rMid], [-ribTilt, 0, 0]);
      partRibFrame.add(grp);
    }
    // İç yatay gergi halkaları ve dikey destek dikmeleri (koni iç profili r(y) içinde kalacak şekilde)
    const innerRing1 = new THREE.TorusGeometry(1.30, 0.05, 8, 16);
    addMesh(partRibFrame, innerRing1, matFrameWood, [0, 1.45, 0], [Math.PI / 2, 0, 0]);
    const innerRing2 = new THREE.TorusGeometry(0.74, 0.045, 8, 16);
    addMesh(partRibFrame, innerRing2, matFrameWood, [0, 1.92, 0], [Math.PI / 2, 0, 0]);
    const pillarH = 1.56 - Y_DECK; // Y = 0.62 .. 1.56 m (iç gergi kirişlerine kadar yükselir, koni kabuğunu delmez)
    const pillarGeo = new THREE.CylinderGeometry(0.055, 0.06, pillarH, 10);
    [[-0.58, -0.58], [0.58, -0.58], [-0.58, 0.58], [0.58, 0.58]].forEach(([px, pz]) => {
      addMesh(partRibFrame, pillarGeo, matFrameWood, [px, Y_DECK + pillarH * 0.5, pz]);
    });

    // --- 3. Üst Gözetleme Kulesi (partCupola) ---
    const cupWallGeo = new THREE.CylinderGeometry(R_TOP * 0.92, R_TOP, 0.36, 8);
    addMesh(partCupola, cupWallGeo, matShellWood, [0, Y_CONE_TOP + 0.18, 0]);
    const cupIronRing = new THREE.CylinderGeometry(R_TOP + 0.015, R_TOP + 0.015, 0.05, 8);
    addMesh(partCupola, cupIronRing, matWroughtIron, [0, Y_CONE_TOP + 0.03, 0]);
    // 8 gözetleme yarığı (koyu girintiler)
    const slitGeo = new THREE.BoxGeometry(0.22, 0.07, 0.04);
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const g = new THREE.Group();
      g.rotation.y = ang;
      addMesh(g, slitGeo, matWroughtIron, [0, Y_CONE_TOP + 0.20, R_TOP * 0.93]);
      partCupola.add(g);
    }
    // Kule külah çatısı ve tepe alemi
    const cupRoofGeo = new THREE.ConeGeometry(R_TOP * 1.08, 0.34, 8);
    addMesh(partCupola, cupRoofGeo, matShellWood, [0, Y_CONE_TOP + 0.52, 0]);
    const finialGeo = new THREE.SphereGeometry(0.07, 10, 10);
    addMesh(partCupola, finialGeo, matBronzeGun, [0, Y_CONE_TOP + 0.71, 0]);

    // --- 4. Alt Etek Zırhı & 16 Top Mazgal Kuşağı (partSkirtShield) ---
    const skirtH = Y_PORT - Y_SKIRT;
    const skirtMidY = (Y_PORT + Y_SKIRT) * 0.5;
    const skirtGeo = new THREE.CylinderGeometry(R_BASE * 0.88, R_BASE, skirtH, 16, 1, true);
    addMesh(partSkirtShield, skirtGeo, matShellWood, [0, skirtMidY, 0]);
    const bottomRimGeo = new THREE.CylinderGeometry(R_BASE + 0.01, R_BASE + 0.02, 0.06, 16, 1, true);
    addMesh(partSkirtShield, bottomRimGeo, matWroughtIron, [0, Y_SKIRT + 0.03, 0]);

    // 16 top mazgal çerçevesi
    const portFrameGeo = new THREE.BoxGeometry(0.24, 0.20, 0.08);
    for (let i = 0; i < GUN_COUNT; i++) {
      const ang = (i / GUN_COUNT) * Math.PI * 2;
      const g = new THREE.Group();
      g.rotation.y = ang;
      addMesh(g, portFrameGeo, matWroughtIron, [0, Y_PORT - 0.02, R_BASE * 0.88]);
      partSkirtShield.add(g);
    }

    // --- 5. Ana Şasi Platformu & Dingil Yatakları (partMainDeck) ---
    // Tekerleklerin (x = ±1.32, z = ±1.18, R = 0.56) ve pinyonların içinden geçmemesi,
    // ayrıca alt etek zırhının (r ≈ 2.28 m) dışına köşelerinin taşmaması için sekizgen/yuvarlatılmış meşe platform
    const centerDeckGeo = new THREE.BoxGeometry(1.56, 0.09, 3.28);
    addMesh(partMainDeck, centerDeckGeo, matFrameWood, [0, Y_DECK, 0]);
    const sideWingDeckGeo = new THREE.BoxGeometry(0.84, 0.09, 0.96);
    addMesh(partMainDeck, sideWingDeckGeo, matFrameWood, [-1.20, Y_DECK, 0]);
    addMesh(partMainDeck, sideWingDeckGeo, matFrameWood, [1.20, Y_DECK, 0]);
    const endCapDeckGeo = new THREE.BoxGeometry(1.24, 0.09, 0.34);
    addMesh(partMainDeck, endCapDeckGeo, matFrameWood, [0, Y_DECK, 1.81]);
    addMesh(partMainDeck, endCapDeckGeo, matFrameWood, [0, Y_DECK, -1.81]);

    // Ana boyuna (x = ±0.82, z = ±1.76 -> r = 1.94 m < 2.24 m) ve enine şasi kirişleri
    const mainBeamZ = new THREE.BoxGeometry(0.16, 0.16, 3.52);
    addMesh(partMainDeck, mainBeamZ, matFrameWood, [-0.82, Y_DECK - 0.08, 0]);
    addMesh(partMainDeck, mainBeamZ, matFrameWood, [0.82, Y_DECK - 0.08, 0]);
    // Dış yan kirişler: x = ±1.56, z = ±1.32 -> köşe yarıçapı r = sqrt(1.63^2 + 1.32^2) = 2.09 m < 2.24 m (etek zırhından taşmaz!)
    const outerSillZ = new THREE.BoxGeometry(0.14, 0.14, 2.64);
    addMesh(partMainDeck, outerSillZ, matFrameWood, [-1.56, Y_DECK - 0.06, 0]);
    addMesh(partMainDeck, outerSillZ, matFrameWood, [1.56, Y_DECK - 0.06, 0]);
    // İç enine kirişler (z = ±0.54, genişlik 3.26 m -> r = sqrt(1.63^2 + 0.62^2) = 1.74 m)
    const innerBeamX = new THREE.BoxGeometry(3.26, 0.16, 0.16);
    addMesh(partMainDeck, innerBeamX, matFrameWood, [0, Y_DECK - 0.08, 0.54]);
    addMesh(partMainDeck, innerBeamX, matFrameWood, [0, Y_DECK - 0.08, -0.54]);
    // Ön/arka uç enine kirişler (z = ±1.68, genişlik 1.80 m -> r = sqrt(0.90^2 + 1.76^2) = 1.97 m < 2.24 m, etek zırhını delmez!)
    const endBeamX = new THREE.BoxGeometry(1.80, 0.16, 0.16);
    addMesh(partMainDeck, endBeamX, matFrameWood, [0, Y_DECK - 0.08, 1.68]);
    addMesh(partMainDeck, endBeamX, matFrameWood, [0, Y_DECK - 0.08, -1.68]);

    // Krank mili dikme yatakları (platform üstünde 4 adet) ve alt tahrik mili yatakları
    const stanchionGeo = new THREE.BoxGeometry(0.14, 0.52, 0.18);
    [[-0.52, 0.95], [0.52, 0.95], [-0.52, -0.95], [0.52, -0.95]].forEach(([sx, sz]) => {
      addMesh(partMainDeck, stanchionGeo, matFrameWood, [sx, Y_DECK + 0.28, sz]);
    });
    const driveBearingGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
    [[-1.04, 0.48], [1.04, 0.48], [-1.04, -0.48], [1.04, -0.48]].forEach(([bx, bz]) => {
      addMesh(partMainDeck, driveBearingGeo, matWroughtIron, [bx, R_WHEEL, bz]);
    });
    // Komutan merkezi merdiveni/kürsüsü
    const stepStandGeo = new THREE.CylinderGeometry(0.32, 0.40, 0.55, 8);
    addMesh(partMainDeck, stepStandGeo, matFrameWood, [0, Y_DECK + 0.30, 0]);

    // --- 6. Arka Yönlendirme Tekeri & Dümen Yekesi (partRudderTail) ---
    const rudderPivot = new THREE.Group();
    rudderPivot.position.set(0, 0, -1.92);
    partRudderTail.add(rudderPivot);
    // Arka kuyruk kolu (sabit bağlantı)
    const tailBoomGeo = new THREE.BoxGeometry(0.16, 0.12, 0.75);
    addMesh(partRudderTail, tailBoomGeo, matFrameWood, [0, Y_DECK - 0.06, -1.65]);
    // Döner çatal, tekerlek (R=0.30, Y=0.30 -> zemine değer) ve dümen yekesi
    const casterPostGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.72, 10);
    addMesh(rudderPivot, casterPostGeo, matWroughtIron, [0, 0.62, 0]);
    const casterWheelPivot = new THREE.Group();
    casterWheelPivot.position.set(0, 0.30, 0);
    rudderPivot.add(casterWheelPivot);
    const casterWheelGeo = new THREE.CylinderGeometry(0.30, 0.30, 0.10, 16);
    addMesh(casterWheelPivot, casterWheelGeo, matGearWood, [0, 0, 0], [0, 0, Math.PI / 2]);
    const casterRimGeo = new THREE.TorusGeometry(0.30, 0.022, 8, 16);
    addMesh(casterWheelPivot, casterRimGeo, matWroughtIron, [0, 0, 0], [0, Math.PI / 2, 0]);
    // Dümen yekesi (içeriye uzanan kol)
    const tillerGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.95, 8);
    addMesh(rudderPivot, tillerGeo, matFrameWood, [0, 0.96, 0.42], [Math.PI / 2 - 0.18, 0, 0]);

    // --- 7. İkiz Krank Mili & 8 Kişilik Çevirme Kolları (partCrankShafts) ---
    // İki paralel krank mili: X = -0.52 ve X = +0.52, Y = CRANK_Y (1.08), Z = -1.18..+1.18
    // z = 0 noktasında r1 = 0.26 m düz dişli ile alt tahrik milindeki (x = ±1.04, y = 0.56) r2 = 0.475 m düz dişliye bağlanır
    const crankPivots = [];
    [-1, 1].forEach(side => {
      const cx = side * 0.52;
      const shaftGrp = new THREE.Group();
      shaftGrp.position.set(cx, CRANK_Y, 0);
      shaftGrp.userData.side = side;
      partCrankShafts.add(shaftGrp);
      crankPivots.push(shaftGrp);

      // Ana mil parçaları
      const shaftSegGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.56, 10);
      addMesh(shaftGrp, shaftSegGeo, matWroughtIron, [0, 0, -0.92], [Math.PI / 2, 0, 0]);
      addMesh(shaftGrp, shaftSegGeo, matWroughtIron, [0, 0, 0], [Math.PI / 2, 0, 0]);
      addMesh(shaftGrp, shaftSegGeo, matWroughtIron, [0, 0, 0.92], [Math.PI / 2, 0, 0]);

      // Her milde 2 adet krank dirseği (4 mürettebat tutamağı = toplam 8 kişi)
      [-0.46, 0.46].forEach((cz, idx) => {
        const throwSign = (idx === 0 ? 1 : -1) * side;
        const throwR = 0.22;
        const cheekGeo = new THREE.BoxGeometry(0.04, throwR + 0.06, 0.05);
        addMesh(shaftGrp, cheekGeo, matWroughtIron, [0, throwSign * throwR * 0.5, cz - 0.18]);
        addMesh(shaftGrp, cheekGeo, matWroughtIron, [0, throwSign * throwR * 0.5, cz + 0.18]);
        // Ahşap çevirme tutamağı (2 kişinin tuttuğu bar)
        const handleGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.38, 10);
        addMesh(shaftGrp, handleGeo, matGearWood, [0, throwSign * throwR, cz], [Math.PI / 2, 0, 0]);
      });

      // z = 0 noktasında alt tahrik miliyle kavraşan r1 = 0.26 m düz dişli (spur gear)
      const spurR1 = 0.26;
      const spurDisc1 = new THREE.CylinderGeometry(spurR1, spurR1, 0.06, 20);
      addMesh(shaftGrp, spurDisc1, matGearWood, [0, 0, 0], [Math.PI / 2, 0, 0]);
      const spurTooth1 = new THREE.BoxGeometry(0.038, 0.038, 0.065);
      for (let t = 0; t < 10; t++) {
        const a = (t / 10) * Math.PI * 2;
        addMesh(shaftGrp, spurTooth1, matWroughtIron, [Math.cos(a) * spurR1, Math.sin(a) * spurR1, 0], [0, 0, a]);
      }
    });

    // --- 8. Boyuna Tahrik Milleri & 4 Adet Fener Dişli (Rocchetti — partLanternPinions) ---
    // Pinyonların ekseni Z yönündedir (taç dişlilerin X eksenine 90° dik!).
    // Ön pinyon z = +0.82 m (ön taç dişlinin arka kenarı: 1.18 - 0.36 = +0.82 m).
    // Arka pinyon Kodeks modunda z = -0.82 m (arka taç dişlinin ön kenarı: -1.18 + 0.36 = -0.82 m),
    // Düzeltilmiş modda z = -1.54 m (arka taç dişlinin arka kenarı: -1.18 - 0.36 = -1.54 m).
    function buildLanternCageZ(parent, radius = 0.15, pinRadius = 0.12, length = 0.20, pins = 10) {
      const g = new THREE.Group();
      const discGeo = new THREE.CylinderGeometry(radius, radius, 0.032, 16);
      addMesh(g, discGeo, matGearWood, [0, 0, -length * 0.5], [Math.PI / 2, 0, 0]);
      addMesh(g, discGeo, matGearWood, [0, 0, length * 0.5], [Math.PI / 2, 0, 0]);
      const pinGeo = new THREE.CylinderGeometry(0.016, 0.016, length, 8);
      for (let i = 0; i < pins; i++) {
        const a = (i / pins) * Math.PI * 2;
        const px = Math.cos(a) * pinRadius;
        const py = Math.sin(a) * pinRadius;
        addMesh(g, pinGeo, matWroughtIron, [px, py, 0], [Math.PI / 2, 0, 0]);
      }
      parent.add(g);
      return g;
    }

    const driveShaftGroups = [];
    const lanternGroups = [];
    [-1, 1].forEach(side => {
      const dx = side * 1.04;
      const dGrp = new THREE.Group();
      dGrp.position.set(dx, R_WHEEL, 0);
      dGrp.userData = { side };
      partLanternPinions.add(dGrp);
      driveShaftGroups.push(dGrp);

      // Z ekseni boyunca uzanan boyuna tahrik mili (z = -1.68 .. +1.02 m, uzunluk 2.70 m)
      const longShaftGeo = new THREE.CylinderGeometry(0.038, 0.038, 2.70, 10);
      addMesh(dGrp, longShaftGeo, matWroughtIron, [0, 0, -0.33], [Math.PI / 2, 0, 0]);

      // z = 0 noktasında krank milindeki r1 = 0.26 m dişliyle kavraşan r2 = 0.475 m düz dişli
      const spurR2 = 0.475;
      const spurDisc2 = new THREE.CylinderGeometry(spurR2, spurR2, 0.06, 24);
      addMesh(dGrp, spurDisc2, matGearWood, [0, 0, 0], [Math.PI / 2, 0, 0]);
      const spurTooth2 = new THREE.BoxGeometry(0.04, 0.04, 0.065);
      for (let t = 0; t < 16; t++) {
        const a = (t / 16) * Math.PI * 2;
        addMesh(dGrp, spurTooth2, matWroughtIron, [Math.cos(a) * spurR2, Math.sin(a) * spurR2, 0], [0, 0, a]);
      }

      // Ön fener pinyon (sabit: z = +0.82 m)
      const frontPinion = new THREE.Group();
      frontPinion.position.set(0, 0, 0.82);
      frontPinion.userData = { side, fb: 1 };
      buildLanternCageZ(frontPinion, 0.15, 0.12, 0.20, 10);
      dGrp.add(frontPinion);
      lanternGroups.push(frontPinion);

      // Arka fener pinyon (kaydırılabilir: Kodeks z = -0.82 m ⇄ Düzeltilmiş z = -1.54 m)
      const rearPinion = new THREE.Group();
      rearPinion.position.set(0, 0, -0.82);
      rearPinion.userData = { side, fb: -1 };
      buildLanternCageZ(rearPinion, 0.15, 0.12, 0.20, 10);
      dGrp.add(rearPinion);
      lanternGroups.push(rearPinion);
    });

    // --- 9. Arka Pinyon Kaydırma Çatalı & Mandal Düzeneği (partIdlerGear) ---
    // Arka fener pinyonları z = -0.82 m ile z = -1.54 m arasında kaydıran çatallı kol mekanizması
    const shifterGroups = [];
    [-1, 1].forEach(side => {
      const sg = new THREE.Group();
      sg.position.set(side * 1.04, R_WHEEL, -0.82);
      sg.userData = { side };
      // Pinyon bileziğini kavrayan çatal halka
      const collarGeo = new THREE.TorusGeometry(0.175, 0.022, 8, 16);
      addMesh(sg, collarGeo, matIdlerHighlight, [0, 0, 0]);
      // Yukarıya (platformdaki kol yuvasına) uzanan kaydırma manivelası
      const forkStemGeo = new THREE.BoxGeometry(0.045, 0.42, 0.045);
      addMesh(sg, forkStemGeo, matIdlerHighlight, [-side * 0.14, 0.21, 0]);
      const handleKnobGeo = new THREE.SphereGeometry(0.045, 10, 10);
      addMesh(sg, handleKnobGeo, matBronzeGun, [-side * 0.14, 0.44, 0]);
      partIdlerGear.add(sg);
      shifterGroups.push(sg);
    });
    // Kaydırma kılavuz rayı (sabit)
    [-1, 1].forEach(side => {
      const railGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.96, 8);
      addMesh(partIdlerGear, railGeo, matWroughtIron, [side * 0.90, R_WHEEL + 0.28, -1.18], [Math.PI / 2, 0, 0]);
    });

    // --- 10 & 11. Ön ve Arka Tahrik Tekerlekleri + Çivili Taç Dişliler ---
    function buildDriveWheel(parent, side, zPos) {
      const wGrp = new THREE.Group();
      wGrp.position.set(side * WHEEL_X, R_WHEEL, zPos);
      wGrp.userData = { side, zPos };

      // Ana ahşap tekerlek çemberi ve demir dış çember
      const rimWoodGeo = new THREE.TorusGeometry(R_WHEEL - 0.04, 0.055, 10, 24);
      addMesh(wGrp, rimWoodGeo, matGearWood, [0, 0, 0], [0, Math.PI / 2, 0]);
      const rimIronGeo = new THREE.TorusGeometry(R_WHEEL, 0.022, 8, 24);
      addMesh(wGrp, rimIronGeo, matWroughtIron, [0, 0, 0], [0, Math.PI / 2, 0]);

      // 8 adet radyal ispit kolu
      const spokeGeo = new THREE.BoxGeometry(0.05, R_WHEEL * 1.88, 0.065);
      for (let i = 0; i < 4; i++) {
        addMesh(wGrp, spokeGeo, matGearWood, [0, 0, 0], [(i / 4) * Math.PI, 0, 0]);
      }

      // Poyra (hub)
      const hubGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.24, 12);
      addMesh(wGrp, hubGeo, matWroughtIron, [0, 0, 0], [0, 0, Math.PI / 2]);

      // İç yüzeyde Çivili Taç Dişli (Ruota Dentata — 20 kama diş)
      const crownRingR = 0.36;
      const crownRingGeo = new THREE.TorusGeometry(crownRingR, 0.035, 8, 20);
      const innerX = -side * 0.09;
      addMesh(wGrp, crownRingGeo, matGearWood, [innerX, 0, 0], [0, Math.PI / 2, 0]);
      const pegGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.11, 8);
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        addMesh(
          wGrp,
          pegGeo,
          matWroughtIron,
          [innerX - side * 0.055, Math.cos(a) * crownRingR, Math.sin(a) * crownRingR],
          [0, 0, Math.PI / 2]
        );
      }

      // Dış sırt çamur mahmuzları (12 adet)
      const cleatGeo = new THREE.BoxGeometry(0.09, 0.03, 0.03);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        addMesh(wGrp, cleatGeo, matWroughtIron, [0, Math.cos(a) * (R_WHEEL + 0.015), Math.sin(a) * (R_WHEEL + 0.015)], [a, 0, 0]);
      }

      parent.add(wGrp);
      return wGrp;
    }

    const frontWheelGroups = [
      buildDriveWheel(partFrontWheels, -1, WHEEL_Z),
      buildDriveWheel(partFrontWheels, 1, WHEEL_Z)
    ];
    const rearWheelGroups = [
      buildDriveWheel(partRearWheels, -1, -WHEEL_Z),
      buildDriveWheel(partRearWheels, 1, -WHEEL_Z)
    ];

    // --- 12 & 13. 360° Çevresel Top Platformu & 16 Tunç Hafif Top (Falconet) ---
    const ringTrackGeo = new THREE.TorusGeometry(1.78, 0.055, 8, 24);
    addMesh(partCannonRing, ringTrackGeo, matFrameWood, [0, Y_PORT - 0.16, 0], [Math.PI / 2, 0, 0]);

    // Top halkasını ana şasiye bağlayan 8 adet dikme ve radyal destek kolu
    const ringPillarH = (Y_PORT - 0.16) - Y_DECK + 0.08;
    const ringPillarGeo = new THREE.CylinderGeometry(0.05, 0.055, ringPillarH, 8);
    const ringSpokeGeo = new THREE.BoxGeometry(0.08, 0.07, 0.92);
    for (let p = 0; p < 8; p++) {
      const a = (p / 8) * Math.PI * 2 + Math.PI / 8;
      const g = new THREE.Group();
      g.rotation.y = a;
      addMesh(g, ringPillarGeo, matFrameWood, [0, Y_DECK + ringPillarH * 0.5 - 0.04, 1.78]);
      addMesh(g, ringSpokeGeo, matFrameWood, [0, Y_PORT - 0.19, 1.32]);
      partCannonRing.add(g);
    }

    const barrelPivots = [];
    const muzzleFlashes = [];
    const carriageGeo = new THREE.BoxGeometry(0.18, 0.12, 0.56);
    const barrelOuterGeo = new THREE.CylinderGeometry(0.042, 0.058, 0.96, 12);
    const muzzleRingGeo = new THREE.TorusGeometry(0.048, 0.012, 8, 12);
    const breechBlockGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.22, 10);
    const flashGeo = new THREE.ConeGeometry(0.11, 0.42, 8);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffb703, transparent: true, opacity: 0.9 });

    for (let i = 0; i < GUN_COUNT; i++) {
      const ang = (i / GUN_COUNT) * Math.PI * 2;

      // Ahşap kundak (partCannonRing içinde)
      const cGrp = new THREE.Group();
      cGrp.rotation.y = ang;
      addMesh(cGrp, carriageGeo, matFrameWood, [0, Y_PORT - 0.10, 1.82]);
      partCannonRing.add(cGrp);

      // Tunç top namlusu ve geri tepme grubu (partCannonBarrels içinde)
      const bRoot = new THREE.Group();
      bRoot.rotation.y = ang;
      partCannonBarrels.add(bRoot);

      const elevGrp = new THREE.Group();
      elevGrp.position.set(0, Y_PORT - 0.01, 1.72);
      bRoot.add(elevGrp);

      const recoilGrp = new THREE.Group();
      elevGrp.add(recoilGrp);

      addMesh(recoilGrp, barrelOuterGeo, matBronzeGun, [0, 0, 0.36], [Math.PI / 2, 0, 0]);
      addMesh(recoilGrp, muzzleRingGeo, matBronzeGun, [0, 0, 0.84], [0, 0, 0]);
      addMesh(recoilGrp, breechBlockGeo, matWroughtIron, [0, 0, -0.16], [Math.PI / 2, 0, 0]);

      const fl = new THREE.Mesh(flashGeo, flashMat);
      fl.position.set(0, 0, 1.06);
      fl.rotation.x = Math.PI / 2;
      fl.visible = false;
      recoilGrp.add(fl);

      barrelPivots.push({ elevGrp, recoilGrp, recoil: 0, flashTimer: 0, angle: ang });
      muzzleFlashes.push(fl);
    }

    // --- 14. Barut Fıçıları, Mascoli Odaları ve Gülle Sandıkları (partAmmoPowder) ---
    // Tekerlek boşluklarından uzakta, merkez platform koridoru üzerinde konumlandırılmıştır
    const barrelCaskGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.40, 12);
    const ammoCrateGeo = new THREE.BoxGeometry(0.34, 0.20, 0.26);
    const shotBallGeo = new THREE.SphereGeometry(0.036, 8, 8);
    [
      [-0.56, 1.32], [0.56, 1.32], [-0.56, -1.32], [0.56, -1.32]
    ].forEach(([ax, az], idx) => {
      addMesh(partAmmoPowder, barrelCaskGeo, matFrameWood, [ax, Y_DECK + 0.24, az]);
      const crateX = (idx % 2 === 0 ? -1 : 1) * 1.24;
      const crateZ = (idx < 2 ? 1 : -1) * 0.26;
      addMesh(partAmmoPowder, ammoCrateGeo, matFrameWood, [crateX, Y_DECK + 0.14, crateZ], [0, idx * 0.3, 0]);
      for (let s = -1; s <= 1; s++) {
        addMesh(partAmmoPowder, shotBallGeo, matWroughtIron, [crateX + s * 0.075, Y_DECK + 0.26, crateZ]);
      }
    });

    // ------------------------------------------------------------------------
    // SİMÜLASYON DURUMU VE FİZİK / ANİMASYON DÖNGÜSÜ
    // ------------------------------------------------------------------------
    const GEAR_RATIO_SPUR = 0.26 / 0.475;     // Krank düz dişlisi (r1=0.26) / Tahrik mili düz dişlisi (r2=0.475) ≈ 0.5474
    const GEAR_RATIO_CROWN = 0.12 / 0.36;     // Fener pinyon (rp=0.12) / Taç dişli (Rc=0.36) = 1/3 ≈ 0.3333
    const TOTAL_WHEEL_RATIO = GEAR_RATIO_SPUR * GEAR_RATIO_CROWN; // ≈ 0.1825

    const S = {
      rpm: 28,                // Mürettebat krank devri (0 - 60 RPM)
      elevDeg: 2,             // Çevresel top yükseliş açısı (-2° .. +12°)
      steerDeg: 0,            // Arka dümen açısı (-30° .. +30°)
      gearMode: 'codex',      // 'codex' (1487 Ters Dişli Kilidi: z=-0.82) | 'fixed' (Düzeltilmiş Senkron: z=-1.54)
      autoCrank: true,        // Otomatik krank çevirme
      rippleFire: false,      // 360° sıralı dairesel atış modu
      salvoTimer: -1,         // Salvo atışı zamanlayıcısı
      salvoIndex: 0,          // Sıradaki ateşlenecek top (0..15)
      ammoSalvos: 32,         // Kalan top atımı (her top atışında 1 azalır)
      crankAngle: 0,
      finish: 'florence1487',
      relief: true
    };

    function fireSingleBarrel(idx) {
      if (S.ammoSalvos <= 0) return false;
      const b = barrelPivots[idx % GUN_COUNT];
      if (!b) return false;
      S.ammoSalvos = Math.max(0, S.ammoSalvos - 1);
      b.recoil = 1.0;
      b.flashTimer = 0.11;
      muzzleFlashes[idx % GUN_COUNT].visible = true;
      // Ses yükünü sınırlamak için 2 atışta bir ses çalınır
      if (idx % 2 === 0 && audio && audio.playCannonFire) audio.playCannonFire();
      return true;
    }

    function triggerSalvo() {
      if (S.ammoSalvos <= 0) {
        S.ammoSalvos = 32;
        if (audio && audio.playClick) audio.playClick(520);
        return { ok: true, refill: true };
      }
      S.salvoTimer = 0;
      S.salvoIndex = 0;
      fireSingleBarrel(0);
      return { ok: true };
    }

    function update(dt) {
      const activeRpm = S.autoCrank ? S.rpm : 0;
      const omegaCrank = (activeRpm * Math.PI * 2) / 60; // rad/sn
      S.crankAngle += omegaCrank * dt;

      // 1. Krank milleri dönüşü (Z ekseni etrafında)
      crankPivots.forEach(cp => {
        cp.rotation.z = S.crankAngle * cp.userData.side;
      });

      // 2. Boyuna tahrik milleri ve Z eksenli fener dişliler dönüşü
      const shaftAngle = -S.crankAngle * GEAR_RATIO_SPUR;
      driveShaftGroups.forEach(dg => {
        dg.rotation.z = shaftAngle * dg.userData.side;
      });

      // Arka fener pinyonun Z konumu: Kodeks modunda z = -0.82 m, Düzeltilmiş modda z = -1.54 m
      const targetRearPinionZ = S.gearMode === 'fixed' ? -1.54 : -0.82;
      lanternGroups.forEach(lg => {
        if (lg.userData.fb < 0) {
          lg.position.z += (targetRearPinionZ - lg.position.z) * Math.min(1, dt * 8);
        }
      });

      // 3. Arka pinyon kaydırma çatalı (arka pinyonla birlikte z = -0.82 ⇄ -1.54 arasında kayar)
      shifterGroups.forEach(sg => {
        sg.position.z += (targetRearPinionZ - sg.position.z) * Math.min(1, dt * 8);
      });

      // 4. Ön ve Arka Tahrik Tekerlekleri
      // Tekerlek açısal hızı = tahrik mili hızı × (0.12 / 0.36) = omegaCrank × 0.1825
      const wheelOmega = omegaCrank * TOTAL_WHEEL_RATIO;
      frontWheelGroups.forEach(wg => {
        wg.rotation.x += wheelOmega * dt;
      });
      rearWheelGroups.forEach(wg => {
        // KODEKS MODU (z=-0.82, ön kenar): Arka tekerlekler ön tekerleklere ZIT yönde döner!
        // DÜZELTİLMİŞ MOD (z=-1.54, arka kenar): Arka tekerlekler ön tekerleklerle AYNI yönde döner!
        const dir = S.gearMode === 'codex' ? -1 : 1;
        wg.rotation.x += dir * wheelOmega * dt;
      });

      // Kodeks modunda krank çevrilirken ön/arka tekerlekler zıt kastığı için gövdede hafif zorlanma titreşimi
      if (S.gearMode === 'codex' && activeRpm > 1) {
        partMainDeck.position.z = Math.sin(S.crankAngle * 6) * 0.008;
      } else {
        partMainDeck.position.z = 0;
      }

      // 5. Arka yönlendirme dümeni
      const steerRad = THREE.MathUtils.degToRad(S.steerDeg);
      rudderPivot.rotation.y += (steerRad - rudderPivot.rotation.y) * Math.min(1, dt * 8);
      if (S.gearMode === 'fixed') {
        casterWheelPivot.rotation.x += wheelOmega * (R_WHEEL / 0.30) * dt;
      }

      // 6. 16 Çevresel Top Yükseliş Açısı ve Salvo Geri Tepmesi
      const elevRad = -THREE.MathUtils.degToRad(S.elevDeg);
      barrelPivots.forEach((bp, idx) => {
        bp.elevGrp.rotation.x += (elevRad - bp.elevGrp.rotation.x) * Math.min(1, dt * 8);
        if (bp.recoil > 0) {
          bp.recoil = Math.max(0, bp.recoil - dt * 3.8);
          bp.recoilGrp.position.z = -Math.sin(bp.recoil * Math.PI) * 0.16;
        } else {
          bp.recoilGrp.position.z = 0;
        }
        if (bp.flashTimer > 0) {
          bp.flashTimer -= dt;
          if (bp.flashTimer <= 0) muzzleFlashes[idx].visible = false;
        }
      });

      // Salvo veya 360° sıralı dairesel atış zamanlayıcısı
      if (S.salvoTimer >= 0 || S.rippleFire) {
        S.salvoTimer = (S.salvoTimer < 0 ? 0 : S.salvoTimer) + dt;
        const stepInterval = 0.085;
        if (S.salvoTimer >= stepInterval) {
          S.salvoTimer -= stepInterval;
          S.salvoIndex = (S.salvoIndex + 1) % GUN_COUNT;
          if (S.ammoSalvos > 0) {
            fireSingleBarrel(S.salvoIndex);
            if (!S.rippleFire && S.salvoIndex === GUN_COUNT - 1) {
              S.salvoTimer = -1;
            }
          } else {
            S.rippleFire = false;
            S.salvoTimer = -1;
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // DOKU / KAPLAMA YÖNETİMİ
    // ------------------------------------------------------------------------
    function applyTextures(blueprint) {
      const fin = FINISHES[S.finish];
      myMeshes.forEach(m => {
        const role = m.material.userData && m.material.userData.leoRole;
        if (role === 'wood') {
          m.material.map = blueprint ? null : woodMaps[S.finish];
          m.material.bumpMap = (!blueprint && S.relief) ? woodBump : null;
          m.material.needsUpdate = true;
        } else if (role === 'gear') {
          m.material.color.setHex(fin.gearWood);
          m.userData.origColor = m.material.color.clone();
        } else if (role === 'iron') {
          m.material.color.setHex(fin.iron);
          m.userData.origColor = m.material.color.clone();
        } else if (role === 'bronze') {
          m.material.color.setHex(fin.bronze);
          m.userData.origColor = m.material.color.clone();
        }
      });
    }
    function setTexture(key) { if (FINISHES[key]) S.finish = key; }
    function toggleRelief() { S.relief = !S.relief; return S.relief; }

    // ------------------------------------------------------------------------
    // ADAPTÖR ARAYÜZÜ (simulator.html İle Tam Uyumlu)
    // ------------------------------------------------------------------------
    const ui = {
      title: 'LEONARDO DA VINCI\'NİN ZIRHLI ARACI (Carro Armato — ~1487)',
      sub: 'Codex Arundel f.1030 • 8 Kişilik Krank & Fener Dişli Tahrik • 16 Çevresel Top • Ters Dişli Bilmecesi',
      partCount: '14 Ana Grup',
      texTitle: '🎨 Rönesans Ahşap & Metal Kaplaması',
      textures: Object.keys(FINISHES).map(k => ({ key: k, label: FINISHES[k].btn })),
      textureLabel: () => FINISHES[S.finish].label,
      activeTexture: () => S.finish,
      reliefLabel: on => (on ? '🪵 Kalas & Perçin Kabartma Dokusu: AÇIK' : '🪵 Kalas & Perçin Kabartma Dokusu: KAPALI'),
      relief: () => S.relief,
      subsystems: [
        { key: 'armor', label: 'Konik Zırh Kabuğu & Gözetleme Kulesi', color: '#d97706', count: 4 },
        { key: 'drivetrain', label: 'Krank, Fener Dişliler & 4 Tahrik Tekeri', color: '#0284c7', count: 5 },
        { key: 'artillery', label: '360° Çevresel 16 Hafif Top Bataryası', color: '#ef4444', count: 3 },
        { key: 'chassis', label: 'Ana Şasi Platformu & Arka Dümen', color: '#10b981', count: 2 }
      ],
      camLabels: {
        iso: 'İzometrik',
        front: 'Ön Mazgal',
        breech: 'Top Halkası',
        engine: 'Krank & Dişli',
        suspension: 'Taç Dişli Teker',
        top: 'Üst Kesit'
      },
      sliders: [
        { label: 'Mürettebat Krank Devri (8 Kişi)', min: 0, max: 60, step: 1, fmt: v => `${Math.round(v)} RPM` },
        { label: 'Çevresel Top Yükseliş Açısı', min: -2, max: 12, step: 0.5, fmt: v => `${v >= 0 ? '+' : ''}${v}°` },
        { label: 'Arka Dümen Tekeri Açısı', min: -30, max: 30, step: 1, fmt: v => `${v > 0 ? '+' : ''}${Math.round(v)}°` }
      ],
      buttons: {
        terrain: '💪 Otomatik Krank Çevirme',
        sweep: '🔥 360° Dairesel Sıralı Atış',
        mode: true
      },
      telemetryTag: 'CODEX ARUNDEL 1030',
      statLabels: ['TAHRİK DURUMU', 'İLERLEME HIZI', 'KALAN ATIM', 'TOPLAM AĞIRLIK']
    };

    function modeLabel() {
      return S.gearMode === 'codex'
        ? '📜 Mod: 1487 Kodeks Çizimi (Ön/Arka Zıt Kilitli) — Düzeltmek İçin Tıkla'
        : '⚙️ Mod: Düzeltilmiş Dişli (4 Teker Senkron İlerliyor)';
    }

    function getSliderValues() {
      return [S.rpm, S.elevDeg, S.steerDeg];
    }

    function onSlider(index, val) {
      if (index === 0) {
        S.rpm = val;
        S.autoCrank = val > 0;
      } else if (index === 1) {
        S.elevDeg = val;
      } else if (index === 2) {
        S.steerDeg = val;
      }
      return {};
    }

    function onButton(name) {
      if (name === 'terrain') {
        S.autoCrank = !S.autoCrank;
        if (S.autoCrank && S.rpm <= 0) S.rpm = 28;
        return { active: S.autoCrank };
      }
      if (name === 'sweep') {
        S.rippleFire = !S.rippleFire;
        if (S.rippleFire && S.ammoSalvos <= 0) {
          S.ammoSalvos = 32;
        }
        return { active: S.rippleFire };
      }
      if (name === 'mode') {
        S.gearMode = S.gearMode === 'codex' ? 'fixed' : 'codex';
        const msg = S.gearMode === 'fixed'
          ? '<strong>⚙️ Düzeltilmiş Dişli Modu Aktif!</strong><br/>Kaydırma çatalı arka fener pinyonu <code>z = -1,54 m</code> konumuna (arka taç dişlinin arka kenarına) kaydırdı: Ön ve arka tekerlekler artık <strong>aynı yönde</strong> dönüyor!'
          : '<strong>📜 1487 Kodeks Çizimi Modu Aktif!</strong><br/>Arka fener pinyon <code>z = -0,82 m</code> konumunda (arka taç dişlinin ön kenarında): Ön ve arka tekerlekler <strong>zıt yönde</strong> dönerek aracı kilitliyor!';
        return { active: S.gearMode === 'fixed', msg };
      }
      return {};
    }

    function buttonActive(name) {
      if (name === 'terrain') return S.autoCrank;
      if (name === 'sweep') return S.rippleFire;
      if (name === 'mode') return S.gearMode === 'fixed';
      return false;
    }

    function fireButtonLabel() {
      return S.ammoSalvos <= 0
        ? '📦 BARUT & GÜLLE İKMALİ (32 Atım)'
        : '💥 16 TOPLA 360° SALVO ATEŞİ!';
    }

    function onFire() {
      return triggerSalvo();
    }

    function getStats() {
      const activeRpm = S.autoCrank ? S.rpm : 0;
      // Teker çevresi = 2 * pi * 0.56 ≈ 3.519 m; teker devri = activeRpm * TOTAL_WHEEL_RATIO (≈ 0.1825)
      const speedKmh = S.gearMode === 'fixed'
        ? ((activeRpm * TOTAL_WHEEL_RATIO * 3.519 * 60) / 1000).toFixed(1)
        : '0.0';
      const driveText = S.gearMode === 'fixed' ? 'SENKRON' : 'ZIT KİLİTLİ';
      return [
        `${driveText} <span>${Math.round(activeRpm)} RPM</span>`,
        `${speedKmh} <span>km/sa</span>`,
        `${S.ammoSalvos} <span>Atım</span>`,
        `~6.8 <span>Ton</span>`
      ];
    }

    function getStatus() {
      if (S.salvoTimer >= 0 || S.rippleFire) return { text: '360° SALVO ATEŞİ!', color: '#ef4444' };
      if (S.ammoSalvos <= 0) return { text: 'MÜHİMMAT BİTTİ', color: '#d97706' };
      if (S.gearMode === 'codex') return { text: 'KODEKS: TERS DİŞLİ KİLİTLİ', color: '#d97706' };
      return { text: 'DÜZELTİLMİŞ: İLERLEMEYE HAZIR', color: '#10b981' };
    }

    const camPresets = {
      iso: { pos: [5.4, 3.4, 5.4], look: [0, 1.15, 0] },
      front: { pos: [0.0, 1.45, 4.8], look: [0, 1.05, 0] },
      breech: { pos: [2.8, 2.2, 2.8], look: [0, 1.05, 0] },
      engine: { pos: [2.4, 1.85, 0.2], look: [0, 0.95, 0] },
      suspension: { pos: [2.7, 0.95, 2.1], look: [1.1, 0.65, 1.1] },
      top: { pos: [0.1, 6.8, 0.1], look: [0, 1.0, 0] }
    };

    const tourSteps = [
      {
        title: 'Genel Bakış: Leonardo da Vinci\'nin Zırhlı Aracı (~1487)',
        desc: 'Milano Dükü Ludovico Sforza için tasarlanan kaplumbağa kabuğu formlu kuşatma aracı. Eğimli ahşap/demir zırhı gülleleri sektirir, çevresindeki 16 hafif top 360° ateş gücü sağlar.',
        explode: 0, cutaway: false, sub: 'all', cam: 'iso', part: partConeArmor
      },
      {
        title: 'X-Ray Kesit: 8 Kişilik Krank Mili ve Düz Dişli Aktarımı',
        desc: 'Dış konik kabuk saydamlaştığında içerideki iki paralel krank mili ve z=0 düzleminde alt boyuna tahrik millerine güç aktaran düz dişli çiftleri (r=0,26m → r=0,475m) görülür.',
        explode: 0, cutaway: true, sub: 'all', cam: 'engine', part: partCrankShafts
      },
      {
        title: 'Ünlü Mühendislik Bilmecesi: Ters Dişli Hatası mı, Güvenlik Kilidi mi?',
        desc: 'Codex Arundel f.1030 çiziminde arka fener pinyon z=-0,82m noktasında (taç dişlinin ön kenarı) durduğu için ön ve arka tekerlekler ZIT yönde döner. Sağ paneldeki "Mod" butonuna tıklayarak arka pinyonu z=-1,54m konumuna (arka kenara) kaydırın!',
        explode: 15, cutaway: true, sub: 'drivetrain', cam: 'suspension', part: partIdlerGear
      },
      {
        title: 'Z Eksenli Fener Dişliler (Rocchetti) ve Çivili Taç Dişli Tekerlekler',
        desc: 'Boyuna tahrik milleri üzerindeki 10 çubuklu kafes fener dişliler (r=0,12m), tekerleklerin iç yüzeyindeki 20 çivili taç dişliyle (R=0,36m) 90° dik açıyla kavraşarak insan gücünü yüksek torka dönüştürür.',
        explode: 30, cutaway: true, sub: 'drivetrain', cam: 'suspension', part: partLanternPinions
      },
      {
        title: '360° Çevresel Top Bataryası (16 × Falconet)',
        desc: '8 dikmeyle desteklenen çevresel top halkası üzerindeki 16 adet tunç hafif top ve yedek barut odaları (mascoli). "16 Topla 360° Salvo Ateşi" butonuna basarak dairesel yaylım ateşini başlatın!',
        explode: 20, cutaway: true, sub: 'artillery', cam: 'breech', part: partCannonBarrels
      },
      {
        title: 'Tam Teardown (%85): 14 Bağımsız Mekanik Grup',
        desc: 'Konik zırh, 16 kaburga kirişi, gözetleme kulesi, etek zırhı, tekerlek yuvalı şasi platformu, arka dümen, ikiz krank mili, boyuna tahrik milleri ve 4 fener pinyon, kaydırma çatalı, 4 tahrik tekeri ve 16 top bataryası ayrılmış görünümde.',
        explode: 85, cutaway: false, sub: 'all', cam: 'iso', part: partConeArmor
      }
    ];

    return {
      root, ui, camPresets, tourSteps,
      flashMesh: null,
      firePart: partCannonBarrels,
      parts: {
        coneArmor: partConeArmor,
        ribFrame: partRibFrame,
        cupola: partCupola,
        skirtShield: partSkirtShield,
        mainDeck: partMainDeck,
        rudderTail: partRudderTail,
        crankShafts: partCrankShafts,
        lanternPinions: partLanternPinions,
        idlerGear: partIdlerGear,
        frontWheels: partFrontWheels,
        rearWheels: partRearWheels,
        cannonRing: partCannonRing,
        cannonBarrels: partCannonBarrels,
        ammoPowder: partAmmoPowder
      },
      defaultPart: partConeArmor,
      update, onSlider, onButton, buttonActive, onFire, fireButtonLabel, modeLabel,
      getSliderValues, getStats, getStatus,
      applyTextures, setTexture, toggleRelief
    };
  };
})();

