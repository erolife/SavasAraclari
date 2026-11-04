/* =============================================================================
 * 1862 Gatling Makineli Silahı (Richard J. Gatling — US Patent No. 36,836)
 * 14 bağımsız mekanik grup, 4 alt sistem — Adaptör Kalıbı
 * Klasik script olarak yüklenir; sayfa file:// ile açıldığında da çalışır.
 *
 * Tarihsel ve Mekanik Arka Plan:
 *  - Dr. Richard Jordan Gatling tarafından 4 Kasım 1862'de patenti alınan (US 36,836)
 *    6 döner namlulu, el krankıyla tahrik edilen ilk başarılı seri atışlı silah.
 *  - 1862 tarihli ilk modelde kağıt kartuşları taşıyan "çelik tüp haznecikler"
 *    (steel chambers) ve kapsüller kullanılıyordu (hazne-namlu birleşiminde gaz
 *    kaçağı sorunu vardı; 1865/1866 modellerinde yekpare pirinç kovana geçildi).
 *  - Temel mekanik ilke: 6 namlu, taşıyıcı tambur (carrier block) ve kilit silindiri
 *    ana rotor mili etrafında BİRLİKTE döner. Dış pirinç kuyruk muhafazası ve
 *    içindeki helisel kam (cam) oluğu SABİTTİR.
 *  - Her namlunun arkasındaki kilit sürgüsü (lock/bolt), sabit helisel kam rampasını
 *    izleyerek 1 tam turda (360°):
 *      • Saat 12 yönünde (φ = 0°): Üst yerçekimli şarjörden düşen mermiyi/hazneyi alır,
 *      • Saat 12 → 5 yönünde (φ = 0°..153°): Helisel kam rampasıyla 14 cm ileri itilerek
 *        mermiyi namlu atım yatağına sürer,
 *      • Saat 6 yönünde (φ = 180°): Tam kilitli konumda kurma halkası iğneyi serbest
 *        bırakır ve alt namlu ateşlenir!
 *      • Saat 7 → 11 yönünde (φ = 207°..333°): Geri çekme kam oluğuyla geriye çekilir
 *        ve boş kovan/hazne alt tahliye oluğundan yere düşer.
 * ========================================================================== */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.gatling = function buildGatling(ctx) {
    const { THREE, scene, addCADMesh, createPartGroup } = ctx;
    const audio = ctx.audio || null;
    const notify = ctx.notify || (() => {});

    // ------------------------------------------------------------------------
    // ÖLÇÜLER (1 birim = 1 m)
    // ------------------------------------------------------------------------
    const R_WHEEL = 0.68;         // 1862 No.1 topçu arabası tekerlek yarıçapı (Ø 1,36 m)
    const WHEEL_X = 0.68;         // Tekerlek iz yarı genişliği (tam iz 1,36 m)
    const Y_AXLE = R_WHEEL;       // Dingil merkezi yüksekliği (0,68 m -> min.y = 0.000 m)
    const Y_TRUNNION = 0.98;      // Silah muylu (yükseliş) ekseni yüksekliği
    const Z_TRUNNION = 0.05;      // Muylu Z konumu
    const BARREL_COUNT = 6;       // 6 döner namlu
    const R_CLUSTER = 0.068;      // Namlu demeti merkez dairesi yarıçapı (6,8 cm)
    const BARREL_LEN = 0.92;      // Namlu boyu (~36 inç)
    const BOLT_STROKE = 0.14;     // Kilit sürgüsünün helisel kam boyunca ileri-geri kursu (14 cm)
    const GEAR_RATIO = 1.0;       // Konik dişli oranı (15:15 = 1:1, 1 krank devri = 6 atış)

    // ------------------------------------------------------------------------
    // PROSEDÜREL DOKULAR VE KAPLAMALAR
    // ------------------------------------------------------------------------
    function makeGatlingTex(baseHex, grainHex, isWood, isBump) {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const g = c.getContext('2d');
      g.fillStyle = isBump ? '#808080' : baseHex;
      g.fillRect(0, 0, 256, 256);

      let seed = baseHex.charCodeAt(1) * 137 + baseHex.charCodeAt(3) * 53;
      const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

      if (isWood) {
        // Amerikan ceviz / meşe kundak damarları
        for (let i = 0; i < 75; i++) {
          const y0 = rand() * 256;
          const amp = 1.0 + rand() * 3.2;
          const freq = 0.018 + rand() * 0.024;
          g.strokeStyle = isBump
            ? (rand() > 0.5 ? 'rgba(40,40,40,0.55)' : 'rgba(215,215,215,0.4)')
            : grainHex;
          g.globalAlpha = isBump ? 0.8 : (0.18 + rand() * 0.25);
          g.lineWidth = 0.8 + rand() * 1.6;
          g.beginPath();
          for (let x = 0; x <= 256; x += 8) {
            const y = y0 + Math.sin(x * freq + i) * amp;
            if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
          }
          g.stroke();
        }
      } else {
        // Torna edilmiş pirinç / menevişli çelik fırça izleri ve perçin noktaları
        for (let i = 0; i < 90; i++) {
          const y = rand() * 256;
          g.strokeStyle = isBump ? 'rgba(60,60,60,0.45)' : grainHex;
          g.globalAlpha = isBump ? 0.65 : 0.14;
          g.lineWidth = 0.6 + rand() * 1.1;
          g.beginPath();
          g.moveTo(0, y);
          g.lineTo(256, y);
          g.stroke();
        }
        // Perçin dizisi
        g.fillStyle = isBump ? '#dcdcdc' : grainHex;
        g.globalAlpha = isBump ? 0.85 : 0.28;
        for (let x = 16; x < 256; x += 32) {
          g.beginPath(); g.arc(x, 20, 3.2, 0, Math.PI * 2); g.fill();
          g.beginPath(); g.arc(x, 236, 3.2, 0, Math.PI * 2); g.fill();
        }
      }
      g.globalAlpha = 1;

      const t = new THREE.CanvasTexture(c);
      if (!isBump) t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      return t;
    }

    const FINISHES = {
      unionBrass1862: {
        btn: '🎺 1862 Union Pirinç & Meneviş',
        label: '1862 Indianapolis İlk Üretim — Parlak Pirinç Kuyruk, Menevişli Çelik & Ceviz Kundak',
        woodBase: '#6b4226', woodGrain: '#2d180a',
        brass: 0xd49b35, bluedSteel: 0x222933, iron: 0x333942, camSteel: 0x0284c7
      },
      coltArsenal1866: {
        btn: '⚙️ Colt Tersanesi (Parlak Çelik)',
        label: 'Colt Patent Firearms (Hartford) — Parlak Torna Çelik & Koyu Meşe Topçu Arabası',
        woodBase: '#54341e', woodGrain: '#1f1006',
        brass: 0xe0a938, bluedSteel: 0x4b5563, iron: 0x272c33, camSteel: 0x0284c7
      },
      civilWarSmoke: {
        btn: '🔥 Petersburg Cephe Barut İsi',
        label: '1864 Petersburg Kuşatması — Kara Barut İsi, Matlaşmış Bronz & Saha Yıpranması',
        woodBase: '#4a3222', woodGrain: '#1a0f08',
        brass: 0x9a7132, bluedSteel: 0x1c2026, iron: 0x232528, camSteel: 0x0369a1
      },
      smithsonianGilt: {
        btn: '🏛️ Smithsonian Patent Modeli',
        label: '1862 ABD Patent Ofisi Sergi Modeli — Altın Yaldızlı Pirinç & Cilalı Maun',
        woodBase: '#7c3f23', woodGrain: '#381608',
        brass: 0xf59e0b, bluedSteel: 0x1e293b, iron: 0x334155, camSteel: 0x0ea5e9
      }
    };

    const woodMaps = {};
    Object.keys(FINISHES).forEach(k => {
      const f = FINISHES[k];
      woodMaps[k] = makeGatlingTex(f.woodBase, f.woodGrain, true, false);
    });
    const woodBump = makeGatlingTex('#808080', '#282828', true, true);
    const metalBump = makeGatlingTex('#808080', '#383838', false, true);

    const myMeshes = [];
    function makeMat(role, hex, rough, metal, bumpScale = 0.018, extra = {}) {
      const isWood = role === 'carriageWood';
      const m = new THREE.MeshStandardMaterial({
        color: hex,
        roughness: rough,
        metalness: metal,
        map: isWood ? woodMaps.unionBrass1862 : null,
        bumpMap: isWood ? woodBump : metalBump,
        bumpScale,
        ...extra
      });
      m.userData = { gatRole: role };
      return m;
    }

    const matCarriageWood = makeMat('carriageWood', 0xffffff, 0.72, 0.06, 0.022);
    const matBrass = makeMat('brass', 0xd49b35, 0.26, 0.88, 0.012, { side: THREE.DoubleSide });
    const matBluedSteel = makeMat('bluedSteel', 0x222933, 0.34, 0.85, 0.012);
    const matWroughtIron = makeMat('iron', 0x333942, 0.50, 0.78, 0.015);
    const matCamHighlight = makeMat('camSteel', 0x0284c7, 0.28, 0.82, 0.010);
    const matBrightSteel = makeMat('brightSteel', 0xcbd5e1, 0.24, 0.90, 0.008);

    function addMesh(parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], castShadow = true) {
      const m = addCADMesh(parent, geo, mat, pos, rot, castShadow);
      myMeshes.push(m);
      return m;
    }

    // ------------------------------------------------------------------------
    // KÖK GRUP
    // ------------------------------------------------------------------------
    const root = new THREE.Group();
    root.name = 'gatling_root';
    root.visible = false;
    scene.add(root);

    // ------------------------------------------------------------------------
    // 14 BAĞIMSIZ MEKANİK PARÇA GRUBU (4 Alt Sistem)
    // ------------------------------------------------------------------------

    // 1. 6 Adet Döner Çelik Namlu & Ön/Arka Pirinç Diskler
    const partBarrelCluster = createPartGroup({
      id: 'gat_barrel_cluster',
      name: '1. 6 × Döner Yivli Çelik Namlu Demeti (.58 Kalibre)',
      subsystem: 'barrel_group',
      subLabel: '6 Döner Namlu & Çerçeve',
      desc: 'Merkez mil etrafında dairesel dizilmiş 6 adet .58 kalibrelik (~14,7 mm) çelik namlu ve bunları birbirine kenetleyen ön/arka pirinç diskler. Her namlu tur başına yalnızca 1 kez ateşlendiği için aşırı ısınmadan dakikada ~200 mermi atabilir.',
      material: 'Menevişli Yivli Çelik & Dökme Pirinç Disk',
      weight: '~34 kg (6 Namlu + Diskler)',
      spec: '6 × L = 92 cm • Ø .58 inç (~14,7 mm)',
      location: 'Ön Döner Namlu Grubu',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.45, 1.55],
      isOuterShell: false
    });
    root.add(partBarrelCluster);

    // 2. Merkez Ana Rotor Mili & Yatak Burçları
    const partMainShaft = createPartGroup({
      id: 'gat_main_shaft',
      name: '2. Merkez Ana Rotor Mili (Namlu, Tambur & Kilit Taşıyıcı Mil)',
      subsystem: 'barrel_group',
      subLabel: '6 Döner Namlu & Çerçeve',
      desc: 'Kuyruk dişli kutusundan namlu ucundaki ön çerçeve yatağına kadar uzanan dövme çelik ana mil. 6 namluyu, mermi taşıyıcı tamburu ve 6 kilit sürgüsü silindirini tek parça halinde döndürür.',
      material: 'Torna Edilmiş Dövme Çelik Mil',
      weight: '~9,5 kg',
      spec: 'Uzunluk 1,62 m • Ø 38 mm Ana Mil',
      location: 'Merkez Dönme Ekseni',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.85, 0.85],
      isOuterShell: false
    });
    root.add(partMainShaft);

    // 3. Dikdörtgen Dış Yan Çerçeve Kolları & Muylular
    const partOuterFrame = createPartGroup({
      id: 'gat_outer_frame',
      name: '3. Sabit Dış Çerçeve Kolları, Ön Nişangâh Halkası & Muylular',
      subsystem: 'barrel_group',
      subLabel: '6 Döner Namlu & Çerçeve',
      desc: 'Döner namlu demetinin iki yanından uzanarak ön mil yatağını ve arka kuyruk muhafazasını birbirine bağlayan sabit dövme demir çerçeve. Silah bu çerçevenin yan muyluları (trunnions) üzerinde yükselip alçalır.',
      material: 'Dövme Demir Çerçeve & Pirinç Arpacık',
      weight: '~22 kg',
      spec: 'Sabit İkiz Yan Kiriş + Ø 50 mm Muylular',
      location: 'Silah Dış İskeleti',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.15, 0.45],
      isOuterShell: false
    });
    root.add(partOuterFrame);

    // 4. Sabit Pirinç Kuyruk Muhafazası (X-Ray Dış Kabuk)
    const partBreechCasing = createPartGroup({
      id: 'gat_breech_casing',
      name: '4. Sabit Pirinç Kuyruk Muhafazası (Kam & Kilit Silindiri Kabuğu)',
      subsystem: 'breech_cam',
      subLabel: 'Helisel Kam, 6 Kilit & Krank',
      desc: 'İçindeki helisel kam oluğunu, 6 kayar kilit sürgüsünü ve konik dişlileri toz ve barut artıklarından koruyan dökme pirinç dış muhafaza. X-Ray modunda saydamlaşarak sürgülerin kam oluğundaki ileri-geri hareketini gösterir!',
      material: 'Dökme & Torna Pirinç Muhafaza',
      weight: '~18 kg',
      spec: 'Ø 26 cm Silindirik Pirinç Kuyruk Kabuğu',
      location: 'Arka Kuyruk Bölümü (Z = -0,48..-0,02 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.65, -0.45],
      isOuterShell: true
    });
    root.add(partBreechCasing);

    // 5. Sabit Helisel Kam Olukları & İtme/Çekme Rampası
    const partHelicalCam = createPartGroup({
      id: 'gat_helical_cam',
      name: '5. Sabit Helisel Kam Rayı (İleri Sürüş & Geri Çekme Rampası)',
      subsystem: 'breech_cam',
      subLabel: 'Helisel Kam, 6 Kilit & Krank',
      desc: 'Gatling mekanizmasının kalbi: dış muhafazanın iç yüzeyine sabitlenmiş çift eğimli helisel kam oluğu. Dönen 6 kilit sürgüsünün arka kulakçıklarını yakalayarak saat 12→6 arasında 14 cm ileri iter (dolum) ve saat 6→12 arasında 14 cm geri çeker (tahliye).',
      material: 'Sertleştirilmiş Çelik Helisel Kam Halkası',
      weight: '~7,2 kg',
      spec: 'z(φ) Helisel Profil • 140 mm Kurs',
      location: 'Kuyruk Muhafazası İçi (Sabit)',
      basePos: [0, 0, 0],
      explodeVec: [-0.95, 1.35, -0.35],
      isOuterShell: false
    });
    root.add(partHelicalCam);

    // 6. 6 Adet İleri-Geri Kayar Kilit Sürgüsü (Locks / Bolts) & İğneler
    const partLockBolts = createPartGroup({
      id: 'gat_lock_bolts',
      name: '6. 6 × İleri-Geri Kayar Kilit Sürgüsü (Locks), Tırnak & Ateşleme İğnesi',
      subsystem: 'breech_cam',
      subLabel: 'Helisel Kam, 6 Kilit & Krank',
      desc: 'Her namlunun hizasında kendi oluğu içinde ileri-geri kayan 6 adet çelik kilit mekanizması. Her sürgü mermiyi namluya sürer, atım yatağını kilitler, içindeki yaylı iğneyle kapsülü patlatır ve kovan çekici tırnağıyla boş kovanı geri çeker.',
      material: 'Sertleştirilmiş Çelik Sürgü & Yaylı İğne',
      weight: '~8,4 kg (6 × 1,4 kg)',
      spec: '6 × Kayar Sürgü • 14 cm İleri-Geri Hareket',
      location: 'Döner Kilit Silindiri Üzeri',
      basePos: [0, 0, 0],
      explodeVec: [0.95, 1.35, -0.35],
      isOuterShell: false
    });
    root.add(partLockBolts);

    // 7. Horoz Kurma & Saat 6 Yönü Ateşleme Bırakma Halkası (Cocking Ring)
    const partCockingRing = createPartGroup({
      id: 'gat_cocking_ring',
      name: '7. Ateşleme Kurma Çemberi & Saat 6 Bırakma Mandalı (Cocking Ring)',
      subsystem: 'breech_cam',
      subLabel: 'Helisel Kam, 6 Kilit & Krank',
      desc: 'Kilit sürgüsü ileri giderken ateşleme iğnesinin topuzunu geride tutarak yayı kuran ve namlu tam alt noktaya (saat 6 yönü, φ = 180°) ulaştığında iğneyi aniden serbest bırakıp ateşlemeyi başlatan kam çemberi.',
      material: 'Yay Çeliği Kurma Rampası',
      weight: '~2,8 kg',
      spec: 'Saat 6 Yönü (φ = 180°) Sabit Ateşleme Noktası',
      location: 'Kuyruk Arka Bölümü',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.85, -0.95],
      isOuterShell: false
    });
    root.add(partCockingRing);

    // 8. El Krankı, 90° Konik Dişli Çifti (Bevel Gears) & Arka Kapak
    const partCrankGears = createPartGroup({
      id: 'gat_crank_gears',
      name: '8. El Krankı, 90° Konik Dişli Çifti (Bevel Gear) & Dişli Kutusu',
      subsystem: 'breech_cam',
      subLabel: 'Helisel Kam, 6 Kilit & Krank',
      desc: 'Nişancının sağ yanda çevirdiği ahşap tutamaklı el krankı ve hareketi 90° döndürerek ana rotor miline ileten 1:1 oranlı konik dişli çifti (bevel gears). 1 tam krank turu 6 namluyu sırayla ateşler.',
      material: 'Dökme Demir Konik Dişliler & Ceviz Tutamak',
      weight: '~6,5 kg',
      spec: '15:15 Konik Dişli (1:1 Oran) • 6 Atış / Tur',
      location: 'Kuyruk Sağ Arka Yanı',
      basePos: [0, 0, 0],
      explodeVec: [1.35, 0.85, -0.85],
      isOuterShell: false
    });
    root.add(partCrankGears);

    // 9. Üst Yerçekimli Pirinç Şarjör (Hopper) & Mermi İstifi
    const partAmmoHopper = createPartGroup({
      id: 'gat_ammo_hopper',
      name: '9. Üst Yerçekimli Pirinç Besleme Şarjörü (Gravity Hopper) & Mermiler',
      subsystem: 'feed_system',
      subLabel: 'Yerçekimli Şarjör & Besleme',
      desc: 'Yay kullanmadan tamamen yerçekimiyle çalışan eğimli pirinç şarjör kutusu. İçindeki .58 kalibre hazneli mermiler kendi ağırlıklarıyla birer birer alttaki döner taşıyıcı tamburun oluklarına düşer.',
      material: 'Pirinç Şarjör Kutusu & .58 Kovanlar',
      weight: '~6,2 kg (Dolu)',
      spec: '48 Atımlık Yerçekimli Besleme Haznesi',
      location: 'Taşıyıcı Tambur Üstü (Saat 12 Yönü)',
      basePos: [0, 0, 0],
      explodeVec: [0, 2.25, 0.15],
      isOuterShell: false
    });
    root.add(partAmmoHopper);

    // 10. 6 Oluklu Döner Besleme Tamburu (Carrier Block) & Kovan Tahliyesi
    const partCarrierEjector = createPartGroup({
      id: 'gat_carrier_ejector',
      name: '10. 6 Oluklu Döner Besleme Tamburu (Carrier Block) & Tahliye Kanalı',
      subsystem: 'feed_system',
      subLabel: 'Yerçekimli Şarjör & Besleme',
      desc: 'Namluların hemen arkasında ana mille birlikte dönen 6 oluklu pirinç/çelik tambur. Üstten düşen dolu mermiyi namlu hizasında tutar; ateşleme sonrası geri çekilen boş kovanı ise sol-alt tahliye penceresinden yere düşürür.',
      material: 'Dökme Pirinç Tambur & Çelik Tahliye Siperi',
      weight: '~7,8 kg',
      spec: '6 × Yarım Silindirik Mermi Yatağı',
      location: 'Namlu Arkası ile Kilit Önü Arası',
      basePos: [0, 0, 0],
      explodeVec: [-1.15, 0.95, 0.15],
      isOuterShell: false
    });
    root.add(partCarrierEjector);

    // 11. Ahşap/Demir Dingil Gövdesi, Muylu Çatalı & Yön Tablası
    const partAxleBody = createPartGroup({
      id: 'gat_axle_body',
      name: '11. Topçu Arabası Ana Dingili, Muylu Çatalı & Yanal Nişan Tablası',
      subsystem: 'carriage',
      subLabel: '1862 Topçu Arabası & Nişan',
      desc: 'Amerikan İç Savaşı tipi meşe/ceviz dingil gövdesi, dövme demir dingil mili ve silah çerçevesini taşıyan döner muylu çatalı (±18° yanal nişan açısı sağlar).',
      material: 'Amerikan Meşesi & Dövme Demir Dingil',
      weight: '~68 kg',
      spec: 'İz Genişliği 1,36 m • ±18° Yanal Dönüş',
      location: 'Alt Taşıyıcı Dingil (Z = 0,0 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, -0.55, 0.25],
      isOuterShell: false
    });
    root.add(partAxleBody);

    // 12. Kuyruk Altı Dikey Vidalı Yükseliş (Elevation) Mekanizması
    const partElevScrew = createPartGroup({
      id: 'gat_elev_screw',
      name: '12. Kuyruk Altı Vidalı Yükseliş (Elevation) Mekanizması & El Çarkı',
      subsystem: 'carriage',
      subLabel: '1862 Topçu Arabası & Nişan',
      desc: 'Kuyruk muhafazasının altını araba kirişine bağlayan pirinç somunlu dikey çelik vida ve dört kollu el çarkı. Namluların yükseliş açısını -5° ile +15° arasında hassas biçimde ayarlar.',
      material: 'Torna Çelik Vida & Dökme Pirinç El Çarkı',
      weight: '~9,0 kg',
      spec: '-5° .. +15° Vidalı Yükseliş Ayarı',
      location: 'Kuyruk Altı (Z = -0,42 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, -0.35, -0.55],
      isOuterShell: false
    });
    root.add(partElevScrew);

    // 13. 12 İspitli Ahşap Topçu Tekerlekleri (Sol & Sağ)
    const partWheels = createPartGroup({
      id: 'gat_wheels',
      name: '13. 2 × 12 İspitli Ahşap Topçu Tekerleği (Ø 1,36 m) & Demir Çember',
      subsystem: 'carriage',
      subLabel: '1862 Topçu Arabası & Nişan',
      desc: 'Bozuk arazi koşullarında silahı taşımak için kullanılan, sıcak geçirilmiş demir çemberli (tire) ve dökme demir poyralı 12 ispitli iki büyük topçu tekerleği.',
      material: 'Dişbudak/Meşe İspit & Dövme Demir Çember',
      weight: '~86 kg (2 × 43 kg)',
      spec: '2 × Ø 1,36 m (54 inç) • 12 Radyal İspit',
      location: 'Sol ve Sağ Dingil Uçları (X = ±0,68 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, -0.85, 0.55],
      isOuterShell: false
    });
    root.add(partWheels);

    // 14. Çift Kuyruk Kirişi (Trail), Toprak Mahmuzu & Mühimmat Sandığı
    const partTrailBox = createPartGroup({
      id: 'gat_trail_box',
      name: '14. Kuyruk Kirişi (Trail), Toprak Mahmuzu, El Kolları & Cephane Sandığı',
      subsystem: 'carriage',
      subLabel: '1862 Topçu Arabası & Nişan',
      desc: 'Dingilden geriye doğru alçalarak zemine oturan meşe kuyruk kirişleri, geri tepmeyi toprağa aktaran demir mahmuz (lunette/spade), manevra el kolları ve üstteki yedek şarjör/mühimmat sandığı.',
      material: 'Meşe Kiriş, Demir Mahmuz & Pirinç Köşebent',
      weight: '~54 kg',
      spec: 'Z = 0,0..-1,75 m Kuyruk & Cephane Sandığı',
      location: 'Arka Kuyruk Destek Yapısı',
      basePos: [0, 0, 0],
      explodeVec: [0, -0.65, -1.35],
      isOuterShell: false
    });
    root.add(partTrailBox);

    // ------------------------------------------------------------------------
    // HİYERARŞİK DÖNÜŞ & YÜKSELİŞ REFERANS NOKTALARI
    // Not: Teardown (patlatma) sisteminin 14 grubun her birini doğrudan root altında
    // bağımsızca kaydırabilmesi için silahın üst parçaları kendi grupları içindeki
    // birer alt "aimPivot" (Y = Y_TRUNNION, Z = Z_TRUNNION) etrafında döndürülür.
    // ------------------------------------------------------------------------
    const gunAimPivots = [];
    function createAimSubgroup(partGrp) {
      const yawG = new THREE.Group();
      yawG.position.set(0, Y_TRUNNION, Z_TRUNNION);
      partGrp.add(yawG);
      const elevG = new THREE.Group();
      yawG.add(elevG);
      gunAimPivots.push({ yawG, elevG });
      return { yawG, elevG };
    }

    const aimBarrel = createAimSubgroup(partBarrelCluster);
    const aimShaft = createAimSubgroup(partMainShaft);
    const aimFrame = createAimSubgroup(partOuterFrame);
    const aimCasing = createAimSubgroup(partBreechCasing);
    const aimCam = createAimSubgroup(partHelicalCam);
    const aimBolts = createAimSubgroup(partLockBolts);
    const aimCocking = createAimSubgroup(partCockingRing);
    const aimCrank = createAimSubgroup(partCrankGears);
    const aimHopper = createAimSubgroup(partAmmoHopper);
    const aimCarrier = createAimSubgroup(partCarrierEjector);
    const aimElevScrew = createAimSubgroup(partElevScrew);

    // ------------------------------------------------------------------------
    // GEOMETRİ İNŞASI (Muylu Merkezine Göre Yerel Koordinatlar: Y=0, Z=0 -> Y=0.98, Z=0.05)
    //   • Arka Kuyruk Muhafazası & Kam: z = -0.50 .. -0.14 m
    //   • Döner Besleme Tamburu (Carrier Block): z = -0.14 .. +0.04 m
    //   • 6 Döner Namlu: z = +0.04 .. +0.96 m
    //   • Ön Çerçeve Yatağı: z = +0.96 .. +1.02 m
    // ------------------------------------------------------------------------

    // --- 1. 6 Adet Döner Çelik Namlu & Pirinç Diskler (partBarrelCluster) ---
    const barrelRotorGrp = new THREE.Group();
    aimBarrel.elevG.add(barrelRotorGrp);

    // Ön ve arka pirinç namlu bağlama diskleri (z = +0.12 m ve z = +0.84 m)
    const diskGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.028, 24);
    addMesh(barrelRotorGrp, diskGeo, matBrass, [0, 0, 0.12], [Math.PI / 2, 0, 0]);
    addMesh(barrelRotorGrp, diskGeo, matBrass, [0, 0, 0.84], [Math.PI / 2, 0, 0]);

    // 6 adet çelik namlu (φ_i = i * 60°, Saat 12 yönü φ = 0 -> x = sin(φ)*R, y = cos(φ)*R)
    const barrelGeo = new THREE.CylinderGeometry(0.015, 0.019, BARREL_LEN, 12);
    const muzzleCrownGeo = new THREE.TorusGeometry(0.0155, 0.0035, 8, 12);
    const breechCollarGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.06, 12);

    for (let i = 0; i < BARREL_COUNT; i++) {
      const phi = (i / BARREL_COUNT) * Math.PI * 2;
      const bx = Math.sin(phi) * R_CLUSTER;
      const by = Math.cos(phi) * R_CLUSTER;
      addMesh(barrelRotorGrp, barrelGeo, matBluedSteel, [bx, by, 0.04 + BARREL_LEN * 0.5], [Math.PI / 2, 0, 0]);
      addMesh(barrelRotorGrp, breechCollarGeo, matBrass, [bx, by, 0.07], [Math.PI / 2, 0, 0]);
      addMesh(barrelRotorGrp, muzzleCrownGeo, matBrass, [bx, by, 0.04 + BARREL_LEN]);
    }

    // Namlu alevi (alt namlu konumunda: Saat 6 yönü -> x = 0, y = -R_CLUSTER, z = +1.12 m)
    const flashGeo = new THREE.ConeGeometry(0.055, 0.34, 10);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffb703, transparent: true, opacity: 0.92 });
    const muzzleFlashMesh = new THREE.Mesh(flashGeo, flashMat);
    muzzleFlashMesh.position.set(0, -R_CLUSTER, 0.04 + BARREL_LEN + 0.17);
    muzzleFlashMesh.rotation.x = Math.PI / 2;
    muzzleFlashMesh.visible = false;
    aimBarrel.elevG.add(muzzleFlashMesh);

    // --- 2. Merkez Ana Rotor Mili (partMainShaft) ---
    const mainShaftRotorGrp = new THREE.Group();
    aimShaft.elevG.add(mainShaftRotorGrp);
    const mainShaftGeo = new THREE.CylinderGeometry(0.022, 0.022, 1.50, 12);
    addMesh(mainShaftRotorGrp, mainShaftGeo, matBrightSteel, [0, 0, 0.25], [Math.PI / 2, 0, 0]);
    // Mil üzerindeki kama bilezikleri ve ön pirinç somun
    const shaftKeyCollarGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.08, 8);
    addMesh(mainShaftRotorGrp, shaftKeyCollarGeo, matWroughtIron, [0, 0, 0.48], [Math.PI / 2, 0, 0]);
    addMesh(mainShaftRotorGrp, shaftKeyCollarGeo, matBrass, [0, 0, 0.98], [Math.PI / 2, 0, 0]);

    // --- 3. Sabit Dış Yan Çerçeve Kolları & Muylular (partOuterFrame) ---
    // Sol ve sağ yan çerçeve barları (x = ±0.145 m, z = -0.16 .. +0.98 m)
    const sideBarGeo = new THREE.BoxGeometry(0.026, 0.048, 1.14);
    addMesh(aimFrame.elevG, sideBarGeo, matWroughtIron, [-0.145, 0, 0.41]);
    addMesh(aimFrame.elevG, sideBarGeo, matWroughtIron, [0.145, 0, 0.41]);
    // Ön mil yatağı köprüsü (z = +0.98 m) ve üst arpacık halkası
    const frontCrossGeo = new THREE.BoxGeometry(0.316, 0.052, 0.042);
    addMesh(aimFrame.elevG, frontCrossGeo, matWroughtIron, [0, 0, 0.98]);
    const frontBearingGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.055, 16);
    addMesh(aimFrame.elevG, frontBearingGeo, matBrass, [0, 0, 0.98], [Math.PI / 2, 0, 0]);
    const frontSightArchGeo = new THREE.TorusGeometry(0.135, 0.014, 8, 16, Math.PI);
    addMesh(aimFrame.elevG, frontSightArchGeo, matWroughtIron, [0, 0.02, 0.96]);
    const sightBladeGeo = new THREE.ConeGeometry(0.012, 0.045, 6);
    addMesh(aimFrame.elevG, sightBladeGeo, matBrass, [0, 0.175, 0.96]);
    // Muylular (Trunnions: x = ±0.18 m, z = 0)
    const trunnionPinGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.42, 12);
    addMesh(aimFrame.elevG, trunnionPinGeo, matWroughtIron, [0, 0, 0], [0, 0, Math.PI / 2]);

    // --- 4. Sabit Pirinç Kuyruk Muhafazası (partBreechCasing — X-Ray Dış Kabuk) ---
    // z = -0.50 .. -0.14 m arasında silindirik pirinç gövde (R = 0.128 m)
    const casingBodyGeo = new THREE.CylinderGeometry(0.128, 0.128, 0.36, 24, 1, true);
    addMesh(aimCasing.elevG, casingBodyGeo, matBrass, [0, 0, -0.32], [Math.PI / 2, 0, 0]);
    // Ön ve arka pirinç flanş bilezikleri
    const casingFlangeGeo = new THREE.TorusGeometry(0.130, 0.012, 10, 24);
    addMesh(aimCasing.elevG, casingFlangeGeo, matBrass, [0, 0, -0.145]);
    addMesh(aimCasing.elevG, casingFlangeGeo, matBrass, [0, 0, -0.495]);
    // Arka kubbeli pirinç kapak (dişli kutusu kapağı)
    const rearCapGeo = new THREE.CylinderGeometry(0.126, 0.112, 0.035, 24);
    addMesh(aimCasing.elevG, rearCapGeo, matBrass, [0, 0, -0.51], [Math.PI / 2, 0, 0]);
    // Üst patent plakası ve gez (rear sight)
    const plaqueGeo = new THREE.BoxGeometry(0.07, 0.012, 0.14);
    addMesh(aimCasing.elevG, plaqueGeo, matBrass, [0, 0.132, -0.32]);
    const rearSightStemGeo = new THREE.BoxGeometry(0.018, 0.065, 0.018);
    addMesh(aimCasing.elevG, rearSightStemGeo, matBrass, [-0.135, 0.055, -0.18]);

    // --- 5. Sabit Helisel Kam Rayı (partHelicalCam) ---
    // Helisel kam fonksiyonu z_bolt(phi):
    //   phi = 0 (Saat 12): en geride (zOff = 0.00 -> yerel z = -0.36)
    //   phi = 0 .. 0.85*PI (Saat 12 -> Saat 5): ileri sürüş rampası (zOff = 0 -> +0.14)
    //   phi = 0.85*PI .. 1.15*PI (Saat 5 -> Saat 7): tam kilitli düzlük (zOff = +0.14 -> yerel z = -0.22), Saat 6'da (phi = PI) ateşleme!
    //   phi = 1.15*PI .. 1.85*PI (Saat 7 -> Saat 11): geri çekme/tahliye rampası (zOff = +0.14 -> 0.00)
    //   phi = 1.85*PI .. 2*PI (Saat 11 -> Saat 12): arka bekleme düzlüğü (zOff = 0.00)
    function getBoltCamOffsetZ(phiRaw) {
      const twoPi = Math.PI * 2;
      const phi = ((phiRaw % twoPi) + twoPi) % twoPi;
      const p1 = 0.85 * Math.PI;
      const p2 = 1.15 * Math.PI;
      const p3 = 1.85 * Math.PI;
      if (phi < p1) {
        const u = phi / p1;
        return BOLT_STROKE * 0.5 * (1 - Math.cos(u * Math.PI));
      } else if (phi <= p2) {
        return BOLT_STROKE;
      } else if (phi < p3) {
        const u = (phi - p2) / (p3 - p2);
        return BOLT_STROKE * 0.5 * (1 + Math.cos(u * Math.PI));
      }
      return 0;
    }

    // Helisel kam oluğunun 3B görsel inşası (36 segmentli çift dudaklı helisel ray, r = 0.098 m)
    const CAM_SEGS = 36;
    const camSegGeo = new THREE.BoxGeometry(0.022, 0.018, 0.024);
    for (let s = 0; s < CAM_SEGS; s++) {
      const phi = (s / CAM_SEGS) * Math.PI * 2;
      const zOff = getBoltCamOffsetZ(phi);
      const rCam = 0.098;
      const cx = Math.sin(phi) * rCam;
      const cy = Math.cos(phi) * rCam;
      const czBase = -0.39 + zOff;
      // Arka itme rampası ve ön geri çekme dudağı (aralarında kilit kulakçığının kaydığı 3.8 cm kanal)
      addMesh(aimCam.elevG, camSegGeo, matCamHighlight, [cx, cy, czBase - 0.022], [0, 0, -phi]);
      addMesh(aimCam.elevG, camSegGeo, matCamHighlight, [cx, cy, czBase + 0.022], [0, 0, -phi]);
    }
    // Kam taşıyıcı arka sabit halka
    const camBaseRingGeo = new THREE.TorusGeometry(0.104, 0.012, 8, 24);
    addMesh(aimCam.elevG, camBaseRingGeo, matCamHighlight, [0, 0, -0.42]);

    // --- 6. 6 Adet İleri-Geri Kayar Kilit Sürgüsü (Locks) & Kilit Silindiri (partLockBolts) ---
    const lockRotorGrp = new THREE.Group();
    aimBolts.elevG.add(lockRotorGrp);

    // Kilit sürgülerinin içinde kaydığı döner oluklu silindir gövdesi (z = -0.36 .. -0.16 m)
    const lockCoreCylinderGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.22, 18);
    addMesh(lockRotorGrp, lockCoreCylinderGeo, matWroughtIron, [0, 0, -0.27], [Math.PI / 2, 0, 0]);

    const boltMeshes = [];
    const boltBodyGeo = new THREE.CylinderGeometry(0.014, 0.015, 0.15, 10);
    const boltLugGeo = new THREE.BoxGeometry(0.016, 0.032, 0.018);
    const strikerPinGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.17, 8);
    const extractorHookGeo = new THREE.BoxGeometry(0.008, 0.012, 0.035);

    for (let i = 0; i < BARREL_COUNT; i++) {
      const phi0 = (i / BARREL_COUNT) * Math.PI * 2;
      const bx = Math.sin(phi0) * R_CLUSTER;
      const by = Math.cos(phi0) * R_CLUSTER;

      const bGrp = new THREE.Group();
      const zOff0 = getBoltCamOffsetZ(phi0);
      bGrp.position.set(bx, by, -0.36 + zOff0);
      bGrp.rotation.z = -phi0;
      lockRotorGrp.add(bGrp);

      // Ana çelik sürgü gövdesi
      addMesh(bGrp, boltBodyGeo, matBrightSteel, [0, 0, 0.02], [Math.PI / 2, 0, 0]);
      // Helisel kam oluğuna giren dış kılavuz kulakçığı (cam follower lug)
      addMesh(bGrp, boltLugGeo, matCamHighlight, [0, 0.024, -0.03]);
      // İç ateşleme iğnesi ve arka horoz topuzu (striker)
      const strikerMesh = addMesh(bGrp, strikerPinGeo, matBluedSteel, [0, 0, 0.0], [Math.PI / 2, 0, 0]);
      // Ön kovan çekici tırnak (extractor)
      addMesh(bGrp, extractorHookGeo, matWroughtIron, [0, 0.012, 0.095]);

      boltMeshes.push({ bGrp, strikerMesh, index: i, basePhi: phi0 });
    }

    // --- 7. Horoz Kurma & Saat 6 Ateşleme Bırakma Çemberi (partCockingRing) ---
    // Saat 6 yönünde (y = -0.088 m) keskin düşüş basamağı olan iç kurma halkası
    const cockingRingGeo = new THREE.TorusGeometry(0.082, 0.011, 8, 20, Math.PI * 1.65);
    addMesh(aimCocking.elevG, cockingRingGeo, matBluedSteel, [0, 0, -0.34], [0, 0, -Math.PI * 0.35]);
    const searDetentGeo = new THREE.BoxGeometry(0.028, 0.038, 0.035);
    addMesh(aimCocking.elevG, searDetentGeo, matBrass, [0, -0.085, -0.34]);

    // --- 8. El Krankı & 90° Konik Dişli Çifti (partCrankGears) ---
    // Ana milin arka ucundaki konik dişli (Z eksenli, z = -0.45 m)
    const shaftBevelGrp = new THREE.Group();
    shaftBevelGrp.position.set(0, 0, -0.45);
    aimCrank.elevG.add(shaftBevelGrp);
    const bevelGear1Geo = new THREE.CylinderGeometry(0.032, 0.052, 0.028, 16);
    addMesh(shaftBevelGrp, bevelGear1Geo, matWroughtIron, [0, 0, 0], [Math.PI / 2, 0, 0]);

    // Sağ yandaki (+X eksenli, x = +0.05 .. +0.24 m, z = -0.42 m) krank mili ve konik dişlisi
    const crankPivotGrp = new THREE.Group();
    crankPivotGrp.position.set(0, 0, -0.42);
    aimCrank.elevG.add(crankPivotGrp);

    const bevelGear2Geo = new THREE.CylinderGeometry(0.032, 0.052, 0.028, 16);
    addMesh(crankPivotGrp, bevelGear2Geo, matWroughtIron, [0.05, 0, 0], [0, 0, Math.PI / 2]);
    // Krank mili kovanı (sabit yatak: aimCrank.elevG üzerinde)
    const crankSleeveGeo = new THREE.CylinderGeometry(0.024, 0.028, 0.14, 12);
    addMesh(aimCrank.elevG, crankSleeveGeo, matBrass, [0.14, 0, -0.42], [0, 0, Math.PI / 2]);

    // Dönen krank mili, kolu ve ahşap tutamağı
    const crankAxleGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.20, 10);
    addMesh(crankPivotGrp, crankAxleGeo, matBrightSteel, [0.13, 0, 0], [0, 0, Math.PI / 2]);
    const crankArmGeo = new THREE.BoxGeometry(0.018, 0.16, 0.028);
    addMesh(crankPivotGrp, crankArmGeo, matWroughtIron, [0.225, 0.065, 0]);
    const woodGripGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.12, 12);
    addMesh(crankPivotGrp, woodGripGeo, matCarriageWood, [0.285, 0.135, 0], [0, 0, Math.PI / 2]);

    // --- 9. Üst Yerçekimli Pirinç Şarjör (Hopper) & Mermi İstifi (partAmmoHopper) ---
    // z = -0.05 m (Carrier tamburunun tam üstü, Saat 12 yönü)
    const hopperBaseGeo = new THREE.BoxGeometry(0.11, 0.045, 0.15);
    addMesh(aimHopper.elevG, hopperBaseGeo, matBrass, [0, 0.145, -0.05]);
    // Eğimli dikey pirinç şarjör bacası
    const hopperChuteGeo = new THREE.BoxGeometry(0.075, 0.28, 0.135);
    addMesh(aimHopper.elevG, hopperChuteGeo, matBrass, [0.015, 0.295, -0.05], [0, 0, -0.10]);
    const hopperLidGeo = new THREE.BoxGeometry(0.09, 0.022, 0.15);
    addMesh(aimHopper.elevG, hopperLidGeo, matBrass, [0.03, 0.435, -0.05], [0, 0, -0.10]);

    // Şarjör yan penceresinden görünen .58 kalibre pirinç/çelik kovan istifi (8 görünür kovan)
    const hopperRounds = [];
    const cartridgeGeo = new THREE.CylinderGeometry(0.0085, 0.0095, 0.085, 10);
    for (let r = 0; r < 8; r++) {
      const rm = addMesh(
        aimHopper.elevG,
        cartridgeGeo,
        matBrightSteel,
        [0.012, 0.165 + r * 0.031, -0.05],
        [Math.PI / 2, 0, 0]
      );
      hopperRounds.push(rm);
    }

    // --- 10. 6 Oluklu Döner Besleme Tamburu (Carrier Block) & Tahliye Kanalı (partCarrierEjector) ---
    const carrierRotorGrp = new THREE.Group();
    aimCarrier.elevG.add(carrierRotorGrp);

    // 6 oluklu pirinç taşıyıcı tambur (z = -0.14 .. +0.04 m, boy 0.18 m)
    const carrierCoreGeo = new THREE.CylinderGeometry(0.062, 0.062, 0.165, 18);
    addMesh(carrierRotorGrp, carrierCoreGeo, matBrass, [0, 0, -0.05], [Math.PI / 2, 0, 0]);
    const fluteRibGeo = new THREE.BoxGeometry(0.018, 0.026, 0.165);
    const chamberedCartridges = [];
    for (let i = 0; i < BARREL_COUNT; i++) {
      const phi = (i / BARREL_COUNT) * Math.PI * 2 + Math.PI / 6;
      addMesh(
        carrierRotorGrp,
        fluteRibGeo,
        matBrass,
        [Math.sin(phi) * 0.068, Math.cos(phi) * 0.068, -0.05],
        [0, 0, -phi]
      );
      // Tambur oluğundaki mermi/kovan
      const phiSlot = (i / BARREL_COUNT) * Math.PI * 2;
      const cm = addMesh(
        carrierRotorGrp,
        cartridgeGeo,
        matBrass,
        [Math.sin(phiSlot) * R_CLUSTER, Math.cos(phiSlot) * R_CLUSTER, -0.05],
        [Math.PI / 2, 0, 0]
      );
      chamberedCartridges.push(cm);
    }

    // Sabit alt kovan tahliye sundurması (ejector chute: sol-alt, z = -0.05 m)
    const ejectorChuteGeo = new THREE.BoxGeometry(0.08, 0.06, 0.15);
    addMesh(aimCarrier.elevG, ejectorChuteGeo, matWroughtIron, [-0.105, -0.085, -0.05], [0, 0, 0.48]);

    // Uçuşan boş kovan havuzu (6 adet küçük pirinç kovan)
    const ejectedCases = [];
    for (let c = 0; c < 6; c++) {
      const em = addMesh(partCarrierEjector, cartridgeGeo, matBrass, [0, -5, 0]);
      em.visible = false;
      ejectedCases.push({ mesh: em, active: false, vx: 0, vy: 0, vz: 0, rx: 0 });
    }

    // --- 11. Topçu Arabası Ana Dingili, Muylu Çatalı & Yanal Nişan Tablası (partAxleBody) ---
    // Ahşap ana dingil kirişi (Y = Y_AXLE = 0.68 m, X = -0.62 .. +0.62 m)
    const woodAxleGeo = new THREE.BoxGeometry(1.24, 0.13, 0.14);
    addMesh(partAxleBody, woodAxleGeo, matCarriageWood, [0, Y_AXLE, 0]);
    // Dövme demir dingil uç milleri (spindles: X = -0.78 .. +0.78 m)
    const ironAxleGeo = new THREE.CylinderGeometry(0.038, 0.038, 1.62, 12);
    addMesh(partAxleBody, ironAxleGeo, matWroughtIron, [0, Y_AXLE, 0], [0, 0, Math.PI / 2]);
    // Dingil bağlantı kelepçeleri
    [-0.42, 0, 0.42].forEach(ax => {
      const strapGeo = new THREE.BoxGeometry(0.05, 0.145, 0.155);
      addMesh(partAxleBody, strapGeo, matWroughtIron, [ax, Y_AXLE, 0]);
    });

    // Döner muylu çatalı (Yanal nişan tablası: S.yawDeg ile döner)
    const trunnionCradleYawGrp = new THREE.Group();
    trunnionCradleYawGrp.position.set(0, Y_AXLE + 0.07, Z_TRUNNION);
    partAxleBody.add(trunnionCradleYawGrp);

    const turntableGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.05, 16);
    addMesh(trunnionCradleYawGrp, turntableGeo, matBrass, [0, 0.025, 0]);
    // Sol ve sağ muylu dikmeleri (cheeks: Y_AXLE + 0.07 -> Y_TRUNNION = 0.98 m)
    const cheekBracketGeo = new THREE.BoxGeometry(0.045, 0.26, 0.14);
    addMesh(trunnionCradleYawGrp, cheekBracketGeo, matWroughtIron, [-0.165, 0.16, 0]);
    addMesh(trunnionCradleYawGrp, cheekBracketGeo, matWroughtIron, [0.165, 0.16, 0]);
    const capSquareGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.055, 12);
    addMesh(trunnionCradleYawGrp, capSquareGeo, matBrass, [-0.165, 0.23, 0], [0, 0, Math.PI / 2]);
    addMesh(trunnionCradleYawGrp, capSquareGeo, matBrass, [0.165, 0.23, 0], [0, 0, Math.PI / 2]);

    // --- 12. Kuyruk Altı Vidalı Yükseliş (Elevation) Mekanizması (partElevScrew) ---
    // Kuyruk muhafazasının altını (z = -0.38 m) kuyruk kirişine bağlayan dikey vida ve el çarkı
    const elevScrewGrp = new THREE.Group();
    elevScrewGrp.position.set(0, -0.18, -0.38);
    aimElevScrew.elevG.add(elevScrewGrp);

    const screwRodGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.34, 12);
    addMesh(elevScrewGrp, screwRodGeo, matBrightSteel, [0, -0.04, 0]);
    const brassNutGeo = new THREE.CylinderGeometry(0.038, 0.045, 0.06, 12);
    addMesh(elevScrewGrp, brassNutGeo, matBrass, [0, -0.14, 0]);
    const handwheelRingGeo = new THREE.TorusGeometry(0.095, 0.010, 8, 16);
    const handwheelGrp = new THREE.Group();
    handwheelGrp.position.set(0, -0.12, 0);
    elevScrewGrp.add(handwheelGrp);
    addMesh(handwheelGrp, handwheelRingGeo, matBrass, [0, 0, 0], [Math.PI / 2, 0, 0]);
    const hwSpokeGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.19, 8);
    addMesh(handwheelGrp, hwSpokeGeo, matBrass, [0, 0, 0], [Math.PI / 2, 0, 0]);
    addMesh(handwheelGrp, hwSpokeGeo, matBrass, [0, 0, 0], [0, 0, Math.PI / 2]);

    // --- 13. 12 İspitli Ahşap Topçu Tekerlekleri (partWheels — Sol & Sağ) ---
    // Tekerlek dış yarıçapı: rimWood R = 0.635, tube = 0.032 -> 0.667 m;
    // demir çember (tire): R = 0.666, tube = 0.014 -> 0.666 + 0.014 = 0.680 m = Y_AXLE -> min.y = 0.000 m!
    function buildArtilleryWheel(side) {
      const wGrp = new THREE.Group();
      wGrp.position.set(side * WHEEL_X, Y_AXLE, 0);
      partWheels.add(wGrp);

      // Ahşap ispit çemberi (felloe) ve dış demir çember (tire)
      const felloeGeo = new THREE.TorusGeometry(0.632, 0.034, 10, 28);
      addMesh(wGrp, felloeGeo, matCarriageWood, [0, 0, 0], [0, Math.PI / 2, 0]);
      const ironTireGeo = new THREE.TorusGeometry(0.666, 0.014, 8, 28);
      addMesh(wGrp, ironTireGeo, matWroughtIron, [0, 0, 0], [0, Math.PI / 2, 0]);

      // 12 adet radyal ispit kolu (6 çapraz çift)
      const spokeGeo = new THREE.CylinderGeometry(0.018, 0.022, 1.24, 8);
      for (let s = 0; s < 6; s++) {
        addMesh(wGrp, spokeGeo, matCarriageWood, [0, 0, 0], [(s / 6) * Math.PI, 0, 0]);
      }

      // Dökme demir/ahşap poyra (nave / hub) ve pirinç dingil kapağı (linchpin cap)
      const hubGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.24, 14);
      addMesh(wGrp, hubGeo, matCarriageWood, [0, 0, 0], [0, 0, Math.PI / 2]);
      const hubBandGeo = new THREE.CylinderGeometry(0.102, 0.102, 0.045, 14);
      addMesh(wGrp, hubBandGeo, matWroughtIron, [-side * 0.06, 0, 0], [0, 0, Math.PI / 2]);
      addMesh(wGrp, hubBandGeo, matWroughtIron, [side * 0.06, 0, 0], [0, 0, Math.PI / 2]);
      const hubCapGeo = new THREE.CylinderGeometry(0.046, 0.052, 0.07, 12);
      addMesh(wGrp, hubCapGeo, matBrass, [side * 0.135, 0, 0], [0, 0, Math.PI / 2]);
      return wGrp;
    }
    buildArtilleryWheel(-1);
    buildArtilleryWheel(1);

    // --- 14. Çift Kuyruk Kirişi (Trail), Toprak Mahmuzu & Mühimmat Sandığı (partTrailBox) ---
    // Dingilden (Y = 0.66 m, Z = 0.0 m) arka toprak mahmuzuna (Y = 0.08 m, Z = -1.62 m) uzanan ikiz meşe kiriş
    const trailDx = 1.62;
    const trailDy = 0.58;
    const trailLen = Math.hypot(trailDx, trailDy);
    const trailPitch = Math.atan2(trailDy, trailDx); // ~0.344 rad (~19.7°)
    const trailBeamGeo = new THREE.BoxGeometry(0.085, 0.13, trailLen);
    [-0.15, 0.15].forEach(tx => {
      addMesh(partTrailBox, trailBeamGeo, matCarriageWood, [tx, 0.37, -0.81], [trailPitch, 0, 0]);
    });

    // Kuyruk kirişlerini birbirine bağlayan enine traversler (transoms) ve yükseliş vidası yatağı
    const transomGeo = new THREE.BoxGeometry(0.38, 0.11, 0.14);
    addMesh(partTrailBox, transomGeo, matCarriageWood, [0, 0.53, -0.36], [trailPitch, 0, 0]);
    addMesh(partTrailBox, transomGeo, matCarriageWood, [0, 0.25, -1.15], [trailPitch, 0, 0]);

    // Arka toprak mahmuzu (trail spade) ve toparlak çekme halkası (lunette ring: min.y >= 0.00 m)
    const trailSpadeGeo = new THREE.BoxGeometry(0.36, 0.05, 0.26);
    addMesh(partTrailBox, trailSpadeGeo, matWroughtIron, [0, 0.03, -1.64]);
    const lunetteRingGeo = new THREE.TorusGeometry(0.065, 0.016, 8, 16);
    addMesh(partTrailBox, lunetteRingGeo, matWroughtIron, [0, 0.07, -1.78], [Math.PI / 2, 0, 0]);

    // Kuyruk manevra el kolları (handspikes)
    const handspikeGeo = new THREE.CylinderGeometry(0.016, 0.022, 0.65, 8);
    [-0.22, 0.22].forEach(hx => {
      addMesh(partTrailBox, handspikeGeo, matCarriageWood, [hx, 0.24, -1.32], [Math.PI / 2 - 0.45, 0, 0]);
    });

    // Kuyruk üstü yedek şarjör ve .58 mühimmat sandığı (limber chest on trail)
    const ammoChestGeo = new THREE.BoxGeometry(0.46, 0.24, 0.34);
    addMesh(partTrailBox, ammoChestGeo, matCarriageWood, [0, 0.52, -0.78], [trailPitch, 0, 0]);
    const chestLidGeo = new THREE.BoxGeometry(0.48, 0.035, 0.36);
    addMesh(partTrailBox, chestLidGeo, matBrass, [0, 0.64, -0.74], [trailPitch, 0, 0]);

    // ------------------------------------------------------------------------
    // SİMÜLASYON DURUMU VE KAM / ATEŞLEME DÖNGÜSÜ
    // ------------------------------------------------------------------------
    const S = {
      crankRpm: 35,           // El krankı devri (0 - 70 RPM; 35 RPM = 210 atım/dk)
      elevDeg: 2,             // Namluların yükseliş açısı (-5° .. +15°)
      yawDeg: 0,              // Yanal nişan açısı (-18° .. +18°)
      autoCrank: true,        // Otomatik krank çevirme açık
      autoSweep: false,       // Otomatik yanal tarama (sweep)
      liveFireMode: true,     // true = Canlı Atış (Barut & Kovan Tahliyesi), false = Kuru Tetik / Mekanik Eğitim
      rotorAngle: 0,          // Ana rotor açısı θ (rad)
      lastFiredStep: 0,       // Her π/3 (60°) adımda 1 namlu saat 6 yönünden geçer ve ateşlenir
      burstTimer: 0,          // "Ateşle" butonuna basıldığında 1.8 sn hızlı salvo
      flashTimer: 0,
      ammoCount: 48,          // Şarjördeki kalan mermi sayısı (48 tam kapasite)
      sweepTimer: 0,
      finish: 'unionBrass1862',
      relief: true
    };

    function spawnEjectedCase() {
      const slot = ejectedCases.find(c => !c.active) || ejectedCases[0];
      slot.active = true;
      slot.mesh.visible = true;
      // Sol-alt tahliye kanalından (dünya koordinatı yaklaşık X = -0.12, Y = 0.88, Z = 0.0) fırlat
      slot.mesh.position.set(-0.12, Y_TRUNNION - 0.10, Z_TRUNNION - 0.05);
      slot.vx = -0.55 - (Math.random() * 0.25);
      slot.vy = 0.35 + (Math.random() * 0.20);
      slot.vz = -0.15 + (Math.random() * 0.30);
      slot.rx = 6.0 + Math.random() * 6.0;
    }

    function triggerSingleBarrelShot() {
      if (!S.liveFireMode || S.ammoCount <= 0) return;
      S.ammoCount = Math.max(0, S.ammoCount - 1);
      S.flashTimer = 0.055;
      muzzleFlashMesh.visible = true;
      spawnEjectedCase();

      // Şarjördeki görünür mermi istifini doluluk oranına göre güncelle
      const visibleRounds = Math.ceil((S.ammoCount / 48) * hopperRounds.length);
      hopperRounds.forEach((rm, idx) => {
        rm.visible = idx < visibleRounds;
      });

      if (audio) {
        if (audio.playGunBurst && S.lastFiredStep % 2 === 0) audio.playGunBurst();
        else if (audio.playClick) audio.playClick(680);
      }
    }

    function update(dt) {
      // 1. Krank ve ana rotor dönüşü (Gizli alt sınır yok: S.crankRpm = 0 ise tamamen durur!)
      let activeRpm = S.autoCrank ? S.crankRpm : 0;
      if (S.burstTimer > 0) {
        S.burstTimer = Math.max(0, S.burstTimer - dt);
        activeRpm = Math.max(activeRpm, 50); // Salvo butonuna basıldığında geçici 50 RPM (300 atım/dk)
      }

      const omegaCrank = (activeRpm * Math.PI * 2) / 60;
      const omegaRotor = omegaCrank * GEAR_RATIO;
      const dTheta = omegaRotor * dt;
      S.rotorAngle += dTheta;

      // Dönen gruplar: namlu demeti, ana mil, kilit silindiri ve besleme tamburu BİRLİKTE döner
      barrelRotorGrp.rotation.z = S.rotorAngle;
      mainShaftRotorGrp.rotation.z = S.rotorAngle;
      lockRotorGrp.rotation.z = S.rotorAngle;
      carrierRotorGrp.rotation.z = S.rotorAngle;

      // Konik dişli çifti ve sağ el krankı dönüşü (v = ω × r ile 1:1 oran)
      shaftBevelGrp.rotation.z = S.rotorAngle;
      crankPivotGrp.rotation.x = S.rotorAngle;

      // 2. 6 Kilit sürgüsünün (locks) sabit helisel kam oluğu boyunca ileri-geri hareketi z(φ_i)
      boltMeshes.forEach(bm => {
        const phi = S.rotorAngle + bm.basePhi;
        const zOff = getBoltCamOffsetZ(phi);
        bm.bGrp.position.z = -0.36 + zOff;

        // Saat 4 -> Saat 6 arasında horoz kurma halkası iğneyi geriye çeker, Saat 6'da (φ = π) bırakır
        const twoPi = Math.PI * 2;
        const normPhi = ((phi % twoPi) + twoPi) % twoPi;
        const isCocking = normPhi > 0.65 * Math.PI && normPhi < Math.PI;
        bm.strikerMesh.position.z = isCocking ? -0.028 : 0.012;
      });

      // 3. Her 60° (π/3 rad) dönüşte bir namlu Saat 6 ateşleme noktasından (φ = π) geçer
      const stepIndex = Math.floor((S.rotorAngle + Math.PI / 6) / (Math.PI / 3));
      if (stepIndex > S.lastFiredStep) {
        const stepsPassed = Math.min(6, stepIndex - S.lastFiredStep);
        for (let s = 0; s < stepsPassed; s++) {
          S.lastFiredStep++;
          triggerSingleBarrelShot();
        }
      }

      if (S.flashTimer > 0) {
        S.flashTimer -= dt;
        if (S.flashTimer <= 0) muzzleFlashMesh.visible = false;
      }

      // 4. Uçuşan boş kovan fiziği
      ejectedCases.forEach(c => {
        if (!c.active) return;
        c.vy -= 9.8 * dt;
        c.mesh.position.x += c.vx * dt;
        c.mesh.position.y += c.vy * dt;
        c.mesh.position.z += c.vz * dt;
        c.mesh.rotation.x += c.rx * dt;
        if (c.mesh.position.y <= 0.02) {
          c.mesh.position.y = 0.02;
          c.active = false;
        }
      });

      // 5. Otomatik yanal tarama (sweep) ve yükseliş/yön açıları
      if (S.autoSweep) {
        S.sweepTimer += dt;
        S.yawDeg = Math.sin(S.sweepTimer * 1.2) * 14;
      }

      const yawRad = THREE.MathUtils.degToRad(S.yawDeg);
      const elevRad = -THREE.MathUtils.degToRad(S.elevDeg);
      trunnionCradleYawGrp.rotation.y += (yawRad - trunnionCradleYawGrp.rotation.y) * Math.min(1, dt * 10);
      gunAimPivots.forEach(p => {
        p.yawG.rotation.y = trunnionCradleYawGrp.rotation.y;
        p.elevG.rotation.x += (elevRad - p.elevG.rotation.x) * Math.min(1, dt * 10);
      });
      handwheelGrp.rotation.y = S.elevDeg * 0.45;
    }

    // ------------------------------------------------------------------------
    // DOKU / KAPLAMA YÖNETİMİ
    // ------------------------------------------------------------------------
    function applyTextures(blueprint) {
      const fin = FINISHES[S.finish];
      myMeshes.forEach(m => {
        const role = m.material.userData && m.material.userData.gatRole;
        if (role === 'carriageWood') {
          m.material.map = blueprint ? null : woodMaps[S.finish];
          m.material.bumpMap = (!blueprint && S.relief) ? woodBump : null;
          m.material.needsUpdate = true;
        } else if (role === 'brass') {
          m.material.color.setHex(fin.brass);
          m.material.bumpMap = (!blueprint && S.relief) ? metalBump : null;
          m.userData.origColor = m.material.color.clone();
          m.material.needsUpdate = true;
        } else if (role === 'bluedSteel') {
          m.material.color.setHex(fin.bluedSteel);
          m.material.bumpMap = (!blueprint && S.relief) ? metalBump : null;
          m.userData.origColor = m.material.color.clone();
          m.material.needsUpdate = true;
        } else if (role === 'iron') {
          m.material.color.setHex(fin.iron);
          m.userData.origColor = m.material.color.clone();
        } else if (role === 'camSteel') {
          m.material.color.setHex(fin.camSteel);
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
      title: 'GATLING MAKİNELİ SİLAHI (US Patent 36,836 — 1862)',
      sub: 'Dr. Richard J. Gatling • 6 Döner Namlu (.58 Kalibre) • Sabit Helisel Kam & 6 Kayar Kilit Sürgüsü • Yerçekimli Şarjör',
      partCount: '14 Ana Grup',
      texTitle: '🎺 1862 Pirinç, Menevişli Çelik & Kundak Dokusu',
      textures: Object.keys(FINISHES).map(k => ({ key: k, label: FINISHES[k].btn })),
      textureLabel: () => FINISHES[S.finish].label,
      activeTexture: () => S.finish,
      reliefLabel: on => (on ? '🔩 Torna İzleri & Ahşap Damar Kabartması: AÇIK' : '🔩 Torna İzleri & Ahşap Damar Kabartması: KAPALI'),
      relief: () => S.relief,
      subsystems: [
        { key: 'breech_cam', label: 'Helisel Kam, 6 Kilit Sürgüsü & Krank', color: '#0284c7', count: 5 },
        { key: 'barrel_group', label: '6 Döner Namlu, Ana Mil & Çerçeve', color: '#ef4444', count: 3 },
        { key: 'feed_system', label: 'Yerçekimli Şarjör & Besleme Tamburu', color: '#f59e0b', count: 2 },
        { key: 'carriage', label: '1862 Topçu Arabası, Tekerlekler & Vida', color: '#10b981', count: 4 }
      ],
      camLabels: {
        iso: 'İzometrik',
        front: '6 Namlu Ağzı',
        breech: 'Helisel Kam & Kilitler',
        engine: 'El Krankı & Dişli',
        suspension: 'Topçu Arabası',
        top: 'Üstten Şarjör'
      },
      sliders: [
        { label: 'El Krankı Çevirme Hızı (RPM)', min: 0, max: 70, step: 1, fmt: v => `${Math.round(v)} RPM (${Math.round(v * 6)} Atım/dk)` },
        { label: 'Vidalı Yükseliş Açısı (Elevation)', min: -5, max: 15, step: 0.5, fmt: v => `${v >= 0 ? '+' : ''}${v}°` },
        { label: 'Yanal Nişan Açısı (Azimuth)', min: -18, max: 18, step: 1, fmt: v => `${v > 0 ? '+' : ''}${Math.round(v)}°` }
      ],
      buttons: {
        terrain: '💪 Otomatik Krank Çevirme',
        sweep: '🎯 Otomatik Yanal Tarama',
        mode: true
      },
      fog: { near: 14, far: 48 },
      shadowExtent: 4.5,
      telemetryTag: 'US PATENT 36,836 (1862)',
      statLabels: ['ATIŞ HIZI', 'AKTİF NAMLU DÖNGÜSÜ', 'ŞARJÖR (HOPPER)', 'KALİBRE & KURS']
    };

    function modeLabel() {
      return S.liveFireMode
        ? '💥 Mod: Canlı Mühimmat Atışı (.58 Kalibre Barut & Kovan Tahliyesi)'
        : '⚙️ Mod: Kuru Tetik Mekanik Eğitim (Mermi Harcamadan Kam & Kilit Gösterimi)';
    }

    function getSliderValues() {
      return [S.crankRpm, S.elevDeg, S.yawDeg];
    }

    function onSlider(index, val) {
      if (index === 0) {
        S.crankRpm = val;
        if (val === 0) S.autoCrank = false;
        else S.autoCrank = true;
      } else if (index === 1) {
        S.elevDeg = val;
      } else if (index === 2) {
        S.autoSweep = false;
        S.yawDeg = val;
      }
      return {};
    }

    function onButton(name) {
      if (name === 'terrain') {
        S.autoCrank = !S.autoCrank;
        if (S.autoCrank && S.crankRpm === 0) S.crankRpm = 35;
        return { active: S.autoCrank };
      }
      if (name === 'sweep') {
        S.autoSweep = !S.autoSweep;
        return { active: S.autoSweep };
      }
      if (name === 'mode') {
        S.liveFireMode = !S.liveFireMode;
        const msg = S.liveFireMode
          ? '<strong>💥 Canlı Mühimmat Atışı Aktif!</strong><br/>Her 60° dönüşte alt konuma (Saat 6 yönü) gelen namlu ateşlenir ve boş kovan alttan tahliye edilir.'
          : '<strong>⚙️ Kuru Tetik (Mekanik Eğitim) Modu Aktif!</strong><br/>Mermi harcamadan X-Ray modunda 6 kilit sürgüsünün helisel kam oluğundaki ileri-geri hareketini inceleyebilirsiniz.';
        return { active: !S.liveFireMode, msg };
      }
      return {};
    }

    function buttonActive(name) {
      if (name === 'terrain') return S.autoCrank;
      if (name === 'sweep') return S.autoSweep;
      if (name === 'mode') return !S.liveFireMode;
      return false;
    }

    function fireButtonLabel() {
      return S.ammoCount <= 0
        ? '📦 ŞARJÖRÜ DOLDUR (48 × .58 Mermi)'
        : '💥 HIZLI KRANK SALVOSU (6 NAMLU ATEŞLE)!';
    }

    function onFire() {
      if (S.ammoCount <= 0) {
        S.ammoCount = 48;
        hopperRounds.forEach(rm => { rm.visible = true; });
        if (audio && audio.playClick) audio.playClick(540);
        return { ok: true, refill: true };
      }
      S.liveFireMode = true;
      S.burstTimer = 1.6;
      triggerSingleBarrelShot();
      return { ok: true };
    }

    function getStats() {
      const activeRpm = S.burstTimer > 0
        ? Math.max(S.autoCrank ? S.crankRpm : 0, 50)
        : (S.autoCrank ? S.crankRpm : 0);
      const rof = Math.round(activeRpm * 6 * GEAR_RATIO);
      const activeBarrelIdx = ((Math.floor((S.rotorAngle / (Math.PI / 3))) % 6) + 6) % 6 + 1;
      return [
        `${rof} <span>Atım/dk</span>`,
        `Namlu #${activeBarrelIdx} <span>(Saat 6)</span>`,
        `${S.ammoCount} / 48 <span>.58</span>`,
        `140 <span>mm Kam Kursu</span>`
      ];
    }

    function getStatus() {
      if (S.ammoCount <= 0 && S.liveFireMode) return { text: 'ŞARJÖR BOŞ — İKMAL GEREKLİ', color: '#d97706' };
      if (!S.liveFireMode) return { text: 'KURU TETİK: KAM & KİLİT EĞİTİMİ', color: '#0284c7' };
      const activeRpm = S.burstTimer > 0 ? 50 : (S.autoCrank ? S.crankRpm : 0);
      if (activeRpm > 0) return { text: `CANLI ATIŞ: ${Math.round(activeRpm * 6)} ATIM/DK`, color: '#ef4444' };
      return { text: 'KRANK DURDU — ATIŞA HAZIR', color: '#10b981' };
    }

    const camPresets = {
      iso: { pos: [2.35, 1.55, 1.95], look: [0, 0.82, -0.15] },
      front: { pos: [0.45, 1.12, 2.25], look: [0, 0.96, 0.25] },
      breech: { pos: [0.62, 1.48, -0.68], look: [0, 0.98, -0.25] },
      engine: { pos: [0.68, 1.38, -0.92], look: [0.08, 0.98, -0.38] },
      suspension: { pos: [1.95, 0.85, -0.45], look: [0, 0.58, -0.35] },
      top: { pos: [0.08, 2.85, -0.10], look: [0, 0.95, -0.10] }
    };

    const tourSteps = [
      {
        title: 'Genel Bakış: 1862 Gatling Makineli Silahı (US Patent 36,836)',
        desc: 'Dr. Richard J. Gatling\'in 1862\'de geliştirdiği 6 döner namlulu silah. Tek bir namludan aşırı hızlı ateş etmek yerine, 6 namlunun sırayla dolum, ateşleme ve tahliye yaparak ısınmayı önlemesi ilkesine dayanır.',
        explode: 0, cutaway: false, sub: 'all', cam: 'iso', part: partBarrelCluster
      },
      {
        title: 'X-Ray Kesit: Sabit Helisel Kam Oluğu ve 6 Kayar Kilit Sürgüsü',
        desc: 'Dış pirinç muhafaza saydamlaştığında mavi helisel kam rayı görülür. Namlular döndükçe 6 kilit sürgüsü bu sabit eğik oluğu izleyerek 14 cm ileri-geri kayar: Saat 12\'de mermiyi alır, Saat 6\'da ateşler, Saat 9\'da boş kovanı çeker!',
        explode: 0, cutaway: true, sub: 'breech_cam', cam: 'breech', part: partHelicalCam
      },
      {
        title: 'El Krankı ve 90° Konik Dişli Aktarımı (Bevel Gear)',
        desc: 'Silah barut gazıyla değil, nişancının çevirdiği el krankıyla çalışır! Krank milindeki 15 dişli konik çark, hareketi 90° döndürerek ana rotor miline 1:1 oranla iletir. 1 tam krank turunda 6 atış gerçekleşir.',
        explode: 10, cutaway: true, sub: 'breech_cam', cam: 'engine', part: partCrankGears
      },
      {
        title: 'Üst Yerçekimli Şarjör (Hopper) ve 6 Oluklu Besleme Tamburu',
        desc: 'Yaylı şarjörlerin henüz icat edilmediği 1862\'de mermiler üstteki eğimli pirinç kutudan kendi ağırlığıyla (yerçekimiyle) döner taşıyıcı tamburun 6 oluğuna birer birer düşer.',
        explode: 18, cutaway: false, sub: 'feed_system', cam: 'top', part: partAmmoHopper
      },
      {
        title: '1862 Topçu Arabası, 12 İspitli Tekerlekler ve Vidalı Yükseliş',
        desc: 'Silah, Amerikan İç Savaşı sahra topu kundaklarına benzer ahşap/demir bir topçu arabası üzerinde taşınır. Kuyruk altındaki pirinç el çarklı dikey vida yükseliş açısını, muylu tablası ise yanal nişanı ayarlar.',
        explode: 12, cutaway: false, sub: 'carriage', cam: 'suspension', part: partWheels
      },
      {
        title: 'Tam Teardown (%85): 14 Bağımsız Mekanik Grup',
        desc: '6 döner namlu, merkez rotor mili, dış çerçeve, pirinç kuyruk muhafazası, helisel kam rayı, 6 kayar kilit sürgüsü, kurma çemberi, konik dişli krankı, yerçekimli şarjör, taşıyıcı tambur ve topçu arabası tamamen ayrılmış görünümde.',
        explode: 85, cutaway: false, sub: 'all', cam: 'iso', part: partHelicalCam
      }
    ];

    return {
      root, ui, camPresets, tourSteps,
      flashMesh: null,
      firePart: partBarrelCluster,
      parts: {
        barrelCluster: partBarrelCluster,
        mainShaft: partMainShaft,
        outerFrame: partOuterFrame,
        breechCasing: partBreechCasing,
        helicalCam: partHelicalCam,
        lockBolts: partLockBolts,
        cockingRing: partCockingRing,
        crankGears: partCrankGears,
        ammoHopper: partAmmoHopper,
        carrierEjector: partCarrierEjector,
        axleBody: partAxleBody,
        elevScrew: partElevScrew,
        wheels: partWheels,
        trailBox: partTrailBox
      },
      defaultPart: partHelicalCam,
      update, onSlider, onButton, buttonActive, onFire, fireButtonLabel, modeLabel,
      getSliderValues, getStats, getStatus,
      applyTextures, setTexture, toggleRelief
    };
  };
})();

