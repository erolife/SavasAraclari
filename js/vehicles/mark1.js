/* =============================================================================
 * 1916 İngiliz Mark I Tankı ("Male" — Somme Muharebesi, 15 Eylül 1916)
 * 16 bağımsız mekanik grup, 5 alt sistem — Adaptör Kalıbı
 * Klasik script olarak yüklenir; sayfa file:// ile açıldığında da çalışır.
 *
 * Tarihsel ve Mekanik Arka Plan:
 *  - Sir William Tritton ve Binbaşı Walter Gordon Wilson tarafından "Little Willie"
 *    ve "Mother" prototiplerinden geliştirilen, 15 Eylül 1916'da Somme (Flers-Courcelette)
 *    Muharebesi'nde tarihte ilk kez savaşa giren muharebe tankı.
 *  - Geniş siperleri ve dikenli tel engellerini aşabilmek için ağırlık merkezini alçaltan
 *    ve paletleri gövdenin tüm çevresini dolaştıran eşkenar dörtgen (rhomboid) formda
 *    tasarlanmıştır. Ön tırmanma açısı ~40° olup 1,5 m yüksekliğindeki parapetleri ve
 *    ~3,0 m genişliğindeki siperleri aşabilirdi.
 *  - Üstte döner taret yerine gövdenin iki yanındaki çıkıntılı zırhlı yuvalarda (sponson)
 *    2 adet QF 6-pounder (57 mm L/40) Hotchkiss deniz topu ve 3 adet .303 Hotchkiss
 *    makineli tüfek taşıyan "Male" (Erkek) versiyonu.
 *  - Gövde ortasında açıkta çalışan 105 BG Foster-Daimler 6 silindirli sleeve-valve motor,
 *    sonsuz vida diferansiyel ve her iki yanda birer vitesçi ("gearsman") tarafından
 *    kumanda edilen ikincil vites kutuları + arka kuyrukta hidrolik/yaylı ikiz direksiyon
 *    tekerlekleri ("steering tail"). Tankı döndürmek için sürücü, frenci ve iki vitesçi
 *    olmak üzere 4 mürettebatın el işaretleriyle uyum içinde çalışması gerekirdi!
 * ========================================================================== */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.mark1 = function buildMark1(ctx) {
    const { THREE, scene, addCADMesh, addInstancedMesh, createPartGroup } = ctx;
    const audio = ctx.audio || null;
    const notify = ctx.notify || (() => {});

    // ------------------------------------------------------------------------
    // ÖLÇÜLER (1 birim = 1 m — Gövde ~7,72 m, Kuyruk Tekerleriyle ~9,90 m)
    // ------------------------------------------------------------------------
    const TRACK_X = 1.08;         // Sol ve sağ palet çerçevesi merkez X konumu (genişlik 0,52 m -> dış genişlik 2,68 m)
    const HULL_HALF_W = 0.78;     // Merkez kutu gövde yarı genişliği (iç koridor 1,56 m)
    const SPONSON_X = 1.48;       // Yan 6-pounder top pivot X konumu (toplam genişlik ~4,16 m)
    const SPONSON_Y = 1.18;       // Sponson top namlu yüksekliği
    const SPONSON_Z = 0.15;       // Sponson merkez Z konumu
    const TRACK_LINKS = 78;       // Her iki yandaki çevresel çelik palet bakla sayısı

    // Eşkenar dörtgen (Rhomboid) yan zırh çerçevesi köşe noktaları (Z, Y)
    // Alt düz hat Y = 0.05..2.30 m arasında uzanır; palet baklaları bunun dışından dolaşarak Y = 0.00 m'de zemine basar.
    const HORN_POLY = [
      [-2.35, 0.08],
      [1.65, 0.08],
      [3.65, 1.48],
      [3.45, 2.08],
      [2.25, 2.22],
      [-2.55, 2.12],
      [-3.52, 1.45],
      [-3.48, 0.92]
    ];

    // ------------------------------------------------------------------------
    // PROSEDÜREL DOKULAR VE KAPLAMALAR
    // ------------------------------------------------------------------------
    function makeMark1Tex(scheme, isBump) {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const g = c.getContext('2d');

      let seed = scheme.base.charCodeAt(1) * 173 + scheme.base.charCodeAt(3) * 47;
      const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

      g.fillStyle = isBump ? '#808080' : scheme.base;
      g.fillRect(0, 0, 256, 256);

      if (!isBump && scheme.patches) {
        // Solomon 1916 çok renkli kamuflaj lekeleri ve siyah konturlar
        scheme.patches.forEach((col, idx) => {
          g.fillStyle = col;
          for (let p = 0; p < 5; p++) {
            const px = rand() * 256;
            const py = rand() * 256;
            const rx = 28 + rand() * 48;
            const ry = 22 + rand() * 38;
            g.beginPath();
            g.ellipse(px, py, rx, ry, rand() * Math.PI, 0, Math.PI * 2);
            g.fill();
            g.strokeStyle = '#1c1917';
            g.lineWidth = 2.0;
            g.stroke();
          }
        });
      }

      if (!isBump && scheme.stripes) {
        // Kırmızı-Beyaz-Kırmızı İngiliz tanıma şeritleri (Cambrai / geç 1916-17)
        g.fillStyle = '#dc2626';
        g.fillRect(18, 0, 16, 256);
        g.fillStyle = '#f8fafc';
        g.fillRect(34, 0, 16, 256);
        g.fillStyle = '#dc2626';
        g.fillRect(50, 0, 16, 256);
      }

      // Perçinli kazan çeliği plaka derzleri ve ağır perçin başları
      g.strokeStyle = isBump ? 'rgba(25,25,25,0.9)' : 'rgba(15,23,42,0.42)';
      g.lineWidth = 2.2;
      g.strokeRect(4, 4, 248, 120);
      g.strokeRect(4, 128, 248, 124);

      g.fillStyle = isBump ? '#ebebeb' : 'rgba(255,255,255,0.22)';
      for (let x = 14; x < 248; x += 18) {
        [12, 116, 136, 244].forEach(y => {
          g.beginPath();
          g.arc(x, y, 2.8, 0, Math.PI * 2);
          g.fill();
        });
      }

      // Somme çamuru ve barut aşınması
      if (!isBump) {
        for (let i = 0; i < 450; i++) {
          g.fillStyle = rand() > 0.5 ? 'rgba(68,52,36,0.14)' : 'rgba(20,20,20,0.10)';
          g.fillRect(rand() * 256, rand() * 256, 3 + rand() * 6, 2 + rand() * 4);
        }
      }

      const t = new THREE.CanvasTexture(c);
      if (!isBump) t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      return t;
    }

    const FINISHES = {
      sommeSolomon1916: {
        btn: '🎨 1916 Somme "Solomon" Kamuflajı',
        label: '15 Eylül 1916 Flers-Courcelette — Solomon Çok Renkli Kamuflaj (C-19 "Clan Leslie")',
        base: '#7c6f52', patches: ['#4d6b45', '#9a6b41', '#c2a675'], stripes: false,
        track: 0x3b3632, gun: 0x4b5340, engine: 0x2f4f4f
      },
      khakibrown1916: {
        btn: '🪖 İngiliz Haki Kahve (Service Drab)',
        label: '1916 Lincoln (Foster & Co.) Fabrika Çıkışı — Tek Renk Askerî Haki & Çamur',
        base: '#5c5338', patches: null, stripes: false,
        track: 0x33302c, gun: 0x474230, engine: 0x2d3748
      },
      westernFrontMud: {
        btn: '🌧️ Batı Cephesi Siper Çamuru & Şerit',
        label: 'Kasım 1916 Ancre Muharebesi — Ağır Siper Çamuru & Kırmızı-Beyaz Tanıma Şeridi',
        base: '#4f4332', patches: ['#3b3326'], stripes: true,
        track: 0x42382c, gun: 0x3d3529, engine: 0x1e293b
      },
      bovingtonMuseum: {
        btn: '🏛️ Bovington Müzesi (Mother)',
        label: 'Bovington Tank Müzesi Korunmuş Mark I — Gri-Yeşil Restorasyon & Parlak Pirinç',
        base: '#5a6650', patches: null, stripes: false,
        track: 0x2d3138, gun: 0x4a5544, engine: 0x0f766e
      }
    };

    const armorMaps = {};
    Object.keys(FINISHES).forEach(k => {
      armorMaps[k] = makeMark1Tex(FINISHES[k], false);
    });
    const rivetBump = makeMark1Tex(FINISHES.sommeSolomon1916, true);

    const myMeshes = [];
    function makeMat(role, hex, rough, metal, bumpScale = 0.024, extra = {}) {
      const isHull = role === 'hullArmor';
      const { isArmor = false, ...matOpts } = extra;
      const m = new THREE.MeshStandardMaterial({
        color: hex,
        roughness: rough,
        metalness: metal,
        map: isHull ? armorMaps.sommeSolomon1916 : null,
        bumpMap: (isHull || role === 'gunMetal') ? rivetBump : null,
        bumpScale: (isHull || role === 'gunMetal') ? bumpScale : 0,
        ...matOpts
      });
      m.userData = { mk1Role: role, isArmor };
      return m;
    }

    const matHullArmor = makeMat('hullArmor', 0xffffff, 0.72, 0.28, 0.026, { side: THREE.DoubleSide, isArmor: true });
    const matFrameArmor = makeMat('hullArmor', 0xffffff, 0.70, 0.32, 0.026, { isArmor: true });
    const matTrackSteel = makeMat('trackSteel', 0x3b3632, 0.62, 0.72, 0);
    const matGunSteel = makeMat('gunMetal', 0x4b5340, 0.45, 0.68, 0.015);
    const matEngineBlock = makeMat('engineMetal', 0x2f4f4f, 0.42, 0.65, 0);
    const matBrass = makeMat('brass', 0xd49b35, 0.28, 0.86, 0);
    const matDarkIron = makeMat('darkIron', 0x22262c, 0.52, 0.78, 0);
    const matWood = makeMat('wood', 0x6e4726, 0.78, 0.05, 0);
    const matEarth = new THREE.MeshStandardMaterial({ color: 0x574734, roughness: 0.92, metalness: 0.02 });
    const matSandbag = new THREE.MeshStandardMaterial({ color: 0x9c8867, roughness: 0.88, metalness: 0.02 });

    function addMesh(parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], castShadow = true) {
      const m = addCADMesh(parent, geo, mat, pos, rot, castShadow);
      myMeshes.push(m);
      return m;
    }

    // ------------------------------------------------------------------------
    // KÖK GRUP
    // ------------------------------------------------------------------------
    const root = new THREE.Group();
    root.name = 'mark1_root';
    root.visible = false;
    scene.add(root);

    // ------------------------------------------------------------------------
    // 16 BAĞIMSIZ MEKANİK PARÇA GRUBU (5 Alt Sistem)
    // ------------------------------------------------------------------------

    // 1. Merkez Perçinli Kutu Gövde & Sürücü/Komutan Kabini (X-Ray Dış Kabuk)
    const partCenterHull = createPartGroup({
      id: 'mk1_center_hull',
      name: '1. Merkez Zırhlı Gövde & Öne Çıkıntılı Komutan/Sürücü Kabini',
      subsystem: 'armor_hull',
      subLabel: 'Eşkenar Dörtgen Zırh & Sponson',
      desc: 'İki yan palet çerçevesinin arasına perçinlenmiş 10–12 mm kalınlığında sertleştirilmiş kazan çeliği merkez gövde ve önde yan yana oturan komutan ile sürücünün zırhlı gözlem kabini. X-Ray modunda saydamlaşarak açıkta çalışan Daimler motorunu ve vites kutularını gösterir.',
      material: '10–12 mm Perçinli Zırh Çeliği',
      weight: '~6.400 kg',
      spec: '12 mm Ön / 10 mm Yan Perçinli Zırh',
      location: 'Merkez Gövde & Ön Kabin',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.85, 0.45],
      isOuterShell: true
    });
    root.add(partCenterHull);

    // 2. Sol Eşkenar Dörtgen (Rhomboid) Zırhlı Palet Çerçevesi
    const partLeftFrame = createPartGroup({
      id: 'mk1_left_frame',
      name: '2. Sol Eşkenar Dörtgen (Rhomboid) Zırhlı Palet Çerçevesi (Boynuz)',
      subsystem: 'armor_hull',
      subLabel: 'Eşkenar Dörtgen Zırh & Sponson',
      desc: 'Mark I\'e karakteristik eşkenar dörtgen profilini veren sol yan taşıyıcı zırh sandığı. Yüksek ön "boynuz" (horn) yapısı sayesinde tank, dikey siper duvarlarına ve 1,5 metrelik parapetlere tırmanabilir.',
      material: 'Perçinli Çelik Levha & İç Kafes Kiriş',
      weight: '~3.800 kg',
      spec: 'Uzunluk 7,72 m • Yükseklik 2,40 m • 40° Ön Burun',
      location: 'Sol Yan Gövde (X = +1,08 m)',
      basePos: [0, 0, 0],
      explodeVec: [1.65, 0.35, 0],
      isOuterShell: true
    });
    root.add(partLeftFrame);

    // 3. Sağ Eşkenar Dörtgen (Rhomboid) Zırhlı Palet Çerçevesi
    const partRightFrame = createPartGroup({
      id: 'mk1_right_frame',
      name: '3. Sağ Eşkenar Dörtgen (Rhomboid) Zırhlı Palet Çerçevesi (Boynuz)',
      subsystem: 'armor_hull',
      subLabel: 'Eşkenar Dörtgen Zırh & Sponson',
      desc: 'Sağ palet zincirinin üzerinde kaydığı eşkenar dörtgen yan çerçeve. Alt kısmında süspansiyonsuz 21 adet sabit çelik makara ve üst kısmında palet kılavuz rayları yer alır.',
      material: 'Perçinli Çelik Levha & İç Kafes Kiriş',
      weight: '~3.800 kg',
      spec: 'Uzunluk 7,72 m • Yükseklik 2,40 m • 40° Ön Burun',
      location: 'Sağ Yan Gövde (X = -1,08 m)',
      basePos: [0, 0, 0],
      explodeVec: [-1.65, 0.35, 0],
      isOuterShell: true
    });
    root.add(partRightFrame);

    // 4. Sağ ve Sol Zırhlı Yan Sponson Yuvaları (Barbetler)
    const partSponsonHousings = createPartGroup({
      id: 'mk1_sponson_housings',
      name: '4. Yan Sponson Zırhlı Yuvaları (Sağ & Sol Top Kazamatları)',
      subsystem: 'armor_hull',
      subLabel: 'Eşkenar Dörtgen Zırh & Sponson',
      desc: 'Üst taret ağırlık merkezini yükselteceği için gemi kazamatlarından esinlenerek palet çerçevelerinin ortasına cıvatalanan yarı-sekizgen zırhlı çıkıntılar (sponsons). Demiryolu nakliyesinde sökülebilirdi.',
      material: '10 mm Zırh Çeliği & Yan Erişim Kapıları',
      weight: '~1.950 kg (Çift Sponson)',
      spec: 'Genişlik +0,82 m / Taraf • 110° Atış Sektörü',
      location: 'Sağ & Sol Yan Orta (X = ±1,48 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.15, -0.55],
      isOuterShell: false
    });
    root.add(partSponsonHousings);

    // 5. Sol Çevresel Palet Zinciri (78 Dökme Çelik Bakla)
    const partLeftTrack = createPartGroup({
      id: 'mk1_left_track',
      name: '5. Sol Çevresel Palet Zinciri (78 × Dökme Çelik Bakla)',
      subsystem: 'tracks_tail',
      subLabel: 'Çevresel Paletler & Kuyruk',
      desc: 'Sol yan eşkenar dörtgen çerçevenin tüm çevresini dolaşan 52 cm genişliğinde perçinli çelik palet baklaları. Yalnızca sol ikincil vites boşa alındığında bu palet durur ve tank sola döner!',
      material: 'Sertleştirilmiş Dökme/Pres Çelik Bakla',
      weight: '~2.150 kg',
      spec: '78 Bakla • Genişlik 520 mm • Çevresel Yörünge',
      location: 'Sol Yan Çerçeve Çevresi (X = +1,08 m)',
      basePos: [0, 0, 0],
      explodeVec: [2.55, -0.25, 0.35],
      isOuterShell: false
    });
    root.add(partLeftTrack);

    // 6. Sağ Çevresel Palet Zinciri (78 Dökme Çelik Bakla)
    const partRightTrack = createPartGroup({
      id: 'mk1_right_track',
      name: '6. Sağ Çevresel Palet Zinciri (78 × Dökme Çelik Bakla)',
      subsystem: 'tracks_tail',
      subLabel: 'Çevresel Paletler & Kuyruk',
      desc: 'Sağ yan çerçevenin çevresini tam dolaşan 78 baklalı çelik palet. Sağ ikincil vites kutusu ("gearsman") tarafından bağımsız olarak hızlandırılabilir, yavaşlatılabilir veya kilitlenebilir.',
      material: 'Sertleştirilmiş Dökme/Pres Çelik Bakla',
      weight: '~2.150 kg',
      spec: '78 Bakla • Genişlik 520 mm • Çevresel Yörünge',
      location: 'Sağ Yan Çerçeve Çevresi (X = -1,08 m)',
      basePos: [0, 0, 0],
      explodeVec: [-2.55, -0.25, 0.35],
      isOuterShell: false
    });
    root.add(partRightTrack);

    // 7. Arka Cer Çarkları, Ön Gergi Tekerleri & Alt Makaralar
    const partSprocketsRollers = createPartGroup({
      id: 'mk1_sprockets_rollers',
      name: '7. Arka Dişli Cer Çarkları, Ön Gergi Tekerleri & 26 Alt Makara',
      subsystem: 'tracks_tail',
      subLabel: 'Çevresel Paletler & Kuyruk',
      desc: 'Arkada paletleri çeken ikiz dişli cer çarkları (drive sprockets), önde vida ayarlı gergi tekerlekleri (idlers) ve alt şaside yaylanmasız sabit yataklanmış yürüyüş makaraları.',
      material: 'Dökme Çelik Dişli Çark & Makara',
      weight: '~1.680 kg',
      spec: '2 × Arka Cer Çarkı + 2 × Ön Avara + 26 Makara',
      location: 'Yan Çerçeve Uçları & Alt Hat',
      basePos: [0, 0, 0],
      explodeVec: [0, -1.15, 0],
      isOuterShell: false
    });
    root.add(partSprocketsRollers);

    // 8. Arka Direksiyon Kuyruk Çatalı & İkiz Tekerlekler (Steering Tail)
    const partSteeringTail = createPartGroup({
      id: 'mk1_steering_tail',
      name: '8. Arka Direksiyon Kuyruk Çatalı & İkiz Tekerlekler (Steering Tail)',
      subsystem: 'tracks_tail',
      subLabel: 'Çevresel Paletler & Kuyruk',
      desc: 'İlk Mark I tanklarının arkasına takılan, yaylı/hidrolik baskılı ve çelik halatla yönlendirilen Ø 1,36 m çapında ikiz demir kuyruk tekerleği. Geniş dönüşlerde dümen görevi görür ve siper geçişinde arkayı desteklerdi (Kasım 1916 sonrası sökülmüştür).',
      material: 'Kafes Çelik Kol & Dökme Demir Tekerlekler',
      weight: '~920 kg',
      spec: '2 × Ø 1,36 m Tekerlek • ±18° Halatlı Dümen',
      location: 'Arka Kuyruk (Z = -3,55..-5,75 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.25, -2.45],
      isOuterShell: false
    });
    root.add(partSteeringTail);

    // 9. Sol Sponson QF 6-Pounder (57 mm) L/40 Top & Kalkan
    const partLeft6Pdr = createPartGroup({
      id: 'mk1_left_6pdr',
      name: '9. Sol Sponson QF 6-Pounder (57 mm L/40) Hotchkiss Top & Kalkan',
      subsystem: 'weapons',
      subLabel: '2 × 6-Pounder Sponson Topu & MG',
      desc: 'Sol sponson içine yerleştirilmiş 57 mm çapında, 2,28 m namlu boyuna sahip hızlı ateşli (Quick-Firing) Hotchkiss deniz topu, silindirik iç kalkanı ve hidro-yaylı geri tepme beşiği.',
      material: 'Nikel-Krom Top Çeliği & 12 mm Zırh Kalkan',
      weight: '~1.150 kg (Top + Kundak + Kalkan)',
      spec: 'Ø 57 mm (6-pdr) L/40 • Vo = 554 m/sn',
      location: 'Sol Sponson Yuvası (+X)',
      basePos: [0, 0, 0],
      explodeVec: [2.25, 0.95, 0.95],
      isOuterShell: false
    });
    root.add(partLeft6Pdr);

    // 10. Sağ Sponson QF 6-Pounder (57 mm) L/40 Top & Kalkan
    const partRight6Pdr = createPartGroup({
      id: 'mk1_right_6pdr',
      name: '10. Sağ Sponson QF 6-Pounder (57 mm L/40) Hotchkiss Top & Kalkan',
      subsystem: 'weapons',
      subLabel: '2 × 6-Pounder Sponson Topu & MG',
      desc: 'Sağ sponson içine yerleştirilmiş ikinci 57 mm QF 6-pounder Hotchkiss topu. Alman makineli tüfek yuvalarını ve sahra bataryalarını imha etmek için toplam 332 adet 6-pounder mermi taşınırdı.',
      material: 'Nikel-Krom Top Çeliği & 12 mm Zırh Kalkan',
      weight: '~1.150 kg (Top + Kundak + Kalkan)',
      spec: 'Ø 57 mm (6-pdr) L/40 • ±45° Yanal Tarama',
      location: 'Sağ Sponson Yuvası (-X)',
      basePos: [0, 0, 0],
      explodeVec: [-2.25, 0.95, 0.95],
      isOuterShell: false
    });
    root.add(partRight6Pdr);

    // 11. 3 × .303 Hotchkiss Makineli Tüfek & 6-Pounder Mühimmat Rafları
    const partHotchkissMGs = createPartGroup({
      id: 'mk1_hotchkiss_mgs',
      name: '11. 3 × .303 Hotchkiss Makineli Tüfek & 57 mm Mühimmat Rafları',
      subsystem: 'weapons',
      subLabel: '2 × 6-Pounder Sponson Topu & MG',
      desc: 'Ön komutan kabininde ve yan sponsonların arka mazgallarında yer alan hava soğutmalı .303 (7,7 mm) Hotchkiss makineli tüfekleri ile iç gövdedeki 57 mm pirinç top mermisi istifleri.',
      material: 'Menevişli Çelik & Pirinç Mühimmat',
      weight: '~840 kg (Silahlar + 332 Top Mermisi)',
      spec: '3 × .303 Hotchkiss MG + 57×307mmR Mermiler',
      location: 'Ön Kabin & Sponson İç Duvarları',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.45, 1.85],
      isOuterShell: false
    });
    root.add(partHotchkissMGs);

    // 12. Merkez Foster-Daimler 105 BG 6 Silindirli Sleeve-Valve Motor
    const partDaimlerEngine = createPartGroup({
      id: 'mk1_daimler_engine',
      name: '12. Foster-Daimler 105 BG 6 Silindirli Sleeve-Valve Motor & Volan',
      subsystem: 'powertrain',
      subLabel: 'Daimler Motor & İkincil Vitesler',
      desc: 'Bölmesiz mürettebat kabininin tam ortasında açıkta çalışan 16 litre hacimli, 6 silindirli, gömlek-supaplı (Knight sleeve-valve) benzinli traktör motoru. 1000 RPM\'de 105 beygir güç üretir.',
      material: 'Dökme Demir Silindirler, Bronz & Ağır Volan',
      weight: '~1.120 kg',
      spec: '6 Silindir • 15,9 Litre • 105 BG @ 1000 RPM',
      location: 'Gövde Merkez Koridoru (Z = -0,2..+1,2 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 2.55, 0.25],
      isOuterShell: false
    });
    root.add(partDaimlerEngine);

    // 13. Ana Şanzıman, Sonsuz Vida (Worm) Diferansiyel & Enine Aks
    const partMainDiff = createPartGroup({
      id: 'mk1_main_diff',
      name: '13. Ana 2-Vites Şanzıman, Sonsuz Vida (Worm) Diferansiyel & Aks',
      subsystem: 'powertrain',
      subLabel: 'Daimler Motor & İkincil Vitesler',
      desc: 'Daimler motorunun arkasındaki konik kavrama, 2 ileri + 1 geri vitesli ana kutu ve gücü 90° sağ/sol enine millere dağıtan kilitlenebilir sonsuz vida (worm gear) diferansiyel kutusu.',
      material: 'Dökme Demir Karter & Fosfor-Bronz Dişli',
      weight: '~680 kg',
      spec: 'Sonsuz Vida Diferansiyel +Diferansiyel Kilidi',
      location: 'Motor Arkası (Z = -1,25 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 2.15, -1.15],
      isOuterShell: false
    });
    root.add(partMainDiff);

    // 14. Sağ & Sol İkincil Vites Kutuları (Gearsmen) & Coventry Zincirleri
    const partSecondaryGears = createPartGroup({
      id: 'mk1_secondary_gears',
      name: '14. Sağ & Sol İkincil Vites Kutuları (Gearsmen) & Tahrik Zincirleri',
      subsystem: 'powertrain',
      subLabel: 'Daimler Motor & İkincil Vitesler',
      desc: 'İki vitesçi ("gearsman") tarafından komutanın el işaretleriyle ayrı ayrı kumanda edilen 2 vitesli yan şanzımanlar ve arka cer çarklarını çeviren ağır Coventry makaralı tahrik zincirleri.',
      material: 'Krom-Nikel Dişliler & Çelik Tahrik Zinciri',
      weight: '~790 kg',
      spec: '2 × İkincil Vites (Yüksek / Düşük / Boş) + Fren',
      location: 'Arka İç Yanlar (X = ±0,62 m, Z = -1,8..-3,2 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.75, -2.15],
      isOuterShell: false
    });
    root.add(partSecondaryGears);

    // 15. Ön Üst İkiz Benzin Depoları, Radyatör & Tavan Egzoz Boruları
    const partFuelExhaust = createPartGroup({
      id: 'mk1_fuel_exhaust',
      name: '15. Ön Üst İkiz Benzin Depoları, Radyatör & Tavan Egzozları',
      subsystem: 'powertrain',
      subLabel: 'Daimler Motor & İkincil Vitesler',
      desc: 'Yakıt pompası olmadığı için karbüratörü yerçekimiyle beslemek üzere ön boynuzların üst içine yerleştirilmiş ikiz benzin depoları (2 × 114 L), arka soğutma radyatörü ve tavandan doğrudan dışarı çıkan susturucusuz egzoz boruları.',
      material: 'Pirinç/Çelik Yakıt Tankı & Dökme Egzoz',
      weight: '~420 kg (Dolu)',
      spec: '228 Litre Benzin • Yerçekimli Besleme',
      location: 'Ön Üst Boynuz İçi & Tavan',
      basePos: [0, 0, 0],
      explodeVec: [0, 2.95, 1.35],
      isOuterShell: false
    });
    root.add(partFuelExhaust);

    // 16. Somme Cephesi Siper Kesiti, Kum Torbaları & Dikenli Tel (Siper Aşma Modu)
    const partTrenchDiorama = createPartGroup({
      id: 'mk1_trench_diorama',
      name: '16. Somme Cephesi Siper Kesiti, Parapet & Dikenli Tel Engeli',
      subsystem: 'trench_base',
      subLabel: 'Somme Siper Aşma Zemini',
      desc: 'Sağ paneldeki "Siper Aşma Gösterimi" açıldığında beliren 1916 Somme cephesi siper kesiti, kum torbalı parapet ve dikenli tel engeli. Eşkenar dörtgen paletlerin 40° ön açıyla engeli nasıl ezdiğini gösterir.',
      material: 'Toprak Parapet, Çuval Kum Torbası & Çelik Tel',
      weight: '— (Simülasyon Sahnesi)',
      spec: '2,4 m Siper Açıklığı + Kum Torbası Parapeti',
      location: 'Zemin Alt Yapısı',
      basePos: [0, 0, 0],
      explodeVec: [0, -1.65, 0],
      isOuterShell: true
    });
    root.add(partTrenchDiorama);

    // ------------------------------------------------------------------------
    // TANK GÖVDE EĞİM (PITCH) GRUBU — Siper Aşma Modunda Gövde Yunuslaması
    // Not: Teardown kılavuz çizgilerinin çalışması için her parça grubunun içinde
    // kendi `hullTiltGrp` alt grubu bulunur; siper modunda tüm bu alt gruplar eşzamanlı eğilir.
    // ------------------------------------------------------------------------
    const vehicleTiltSubgroups = [];
    function addTiltSubgroup(partGrp) {
      const g = new THREE.Group();
      partGrp.add(g);
      vehicleTiltSubgroups.push(g);
      return g;
    }

    const tiltCenterHull = addTiltSubgroup(partCenterHull);
    const tiltLeftFrame = addTiltSubgroup(partLeftFrame);
    const tiltRightFrame = addTiltSubgroup(partRightFrame);
    const tiltSponsons = addTiltSubgroup(partSponsonHousings);
    const tiltLeftTrack = addTiltSubgroup(partLeftTrack);
    const tiltRightTrack = addTiltSubgroup(partRightTrack);
    const tiltRollers = addTiltSubgroup(partSprocketsRollers);
    const tiltTail = addTiltSubgroup(partSteeringTail);
    const tiltLeft6Pdr = addTiltSubgroup(partLeft6Pdr);
    const tiltRight6Pdr = addTiltSubgroup(partRight6Pdr);
    const tiltMGs = addTiltSubgroup(partHotchkissMGs);
    const tiltEngine = addTiltSubgroup(partDaimlerEngine);
    const tiltDiff = addTiltSubgroup(partMainDiff);
    const tiltSecGears = addTiltSubgroup(partSecondaryGears);
    const tiltFuel = addTiltSubgroup(partFuelExhaust);

    // ------------------------------------------------------------------------
    // GEOMETRİ İNŞASI
    // ------------------------------------------------------------------------

    // --- 2 & 3. Eşkenar Dörtgen (Rhomboid) Sol ve Sağ Palet Çerçeveleri ---
    // HORN_POLY (Z, Y) noktalarından 2B Shape -> Z ekseni X yönüne döndürülerek ExtrudeGeometry
    const hornShape = new THREE.Shape();
    HORN_POLY.forEach(([z, y], idx) => {
      if (idx === 0) hornShape.moveTo(z, y);
      else hornShape.lineTo(z, y);
    });
    hornShape.closePath();

    const hornWidth = 0.44;
    const hornExtrudeGeo = new THREE.ExtrudeGeometry(hornShape, {
      depth: hornWidth,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2
    });
    // Shape (x=Z, y=Y) düzleminde üretildi ve yerel +Z yönünde extrude edildi.
    // Y ekseni etrafında +90° (Math.PI/2) döndürdüğümüzde:
    //   shape.x (Z) -> dünya -Z olur; bu yüzden shape'i (-z, y) ile kurmak yerine:
    // Doğrudan (x=Z, y=Y) noktasını Y etrafında -Math.PI/2 döndürürsek:
    //   yerel X -> dünya +Z, yerel Y -> dünya +Y, yerel Z (depth) -> dünya -X!
    function buildRhomboidSideFrame(parentTiltGrp, sideSign) {
      const xCenter = sideSign * TRACK_X;
      // Ana eşkenar dörtgen yan zırh sandığı
      const m = addMesh(
        parentTiltGrp,
        hornExtrudeGeo,
        matFrameArmor,
        [xCenter + hornWidth * 0.5, 0, 0],
        [0, -Math.PI / 2, 0]
      );
      // Yan çerçeve üzerindeki dikey/diyagonal perçin takviye kuşakları (stiffener straps)
      const strapGeo = new THREE.BoxGeometry(hornWidth + 0.04, 1.85, 0.06);
      [-2.1, -0.8, 0.6, 1.9].forEach(sz => {
        addMesh(parentTiltGrp, strapGeo, matDarkIron, [xCenter, 1.15, sz]);
      });
      // Ön burun çekme mapası (shackle)
      const shackleGeo = new THREE.TorusGeometry(0.08, 0.022, 8, 14);
      addMesh(parentTiltGrp, shackleGeo, matDarkIron, [xCenter, 1.62, 3.62], [0, Math.PI / 2, 0]);
      return m;
    }

    buildRhomboidSideFrame(tiltLeftFrame, 1);
    buildRhomboidSideFrame(tiltRightFrame, -1);

    // --- 1. Merkez Perçinli Kutu Gövde & Ön Sürücü/Komutan Kabini (partCenterHull — X-Ray) ---
    // İki yan çerçeve (X = -0.86 .. +0.86 m) arasındaki merkez zırhlı gövde
    const hullBoxGeo = new THREE.BoxGeometry(HULL_HALF_W * 2 + 0.14, 1.88, 5.45);
    addMesh(tiltCenterHull, hullBoxGeo, matHullArmor, [0, 1.18, -0.35]);

    // Ön eğimli glacis plakası (Z = +2.35 .. +3.25 m)
    const frontGlacisGeo = new THREE.BoxGeometry(HULL_HALF_W * 2 + 0.12, 1.15, 0.08);
    addMesh(tiltCenterHull, frontGlacisGeo, matHullArmor, [0, 1.48, 2.75], [-0.52, 0, 0]);

    // Öne çıkıntılı ikiz Sürücü & Komutan Gözlem Kabini (Driver & Commander Cab: Z = +2.15 .. +2.95 m, Y = 1.85 .. 2.44 m)
    const cabBoxGeo = new THREE.BoxGeometry(1.36, 0.56, 0.85);
    addMesh(tiltCenterHull, cabBoxGeo, matHullArmor, [0, 2.16, 2.42]);
    // Açılır zırhlı gözlem vizör kapakları (sol: komutan, sağ: sürücü)
    const visorFlapGeo = new THREE.BoxGeometry(0.48, 0.22, 0.04);
    [-0.34, 0.34].forEach(vx => {
      addMesh(tiltCenterHull, visorFlapGeo, matDarkIron, [vx, 2.24, 2.86], [-0.28, 0, 0]);
    });

    // --- 4. Sağ ve Sol Zırhlı Yan Sponson Yuvaları (partSponsonHousings) ---
    [-1, 1].forEach(side => {
      const sx = side * (TRACK_X + 0.22);
      // Üst ve alt yarı-sekizgen sponson tavan/taban plakaları + arka yan zırh duvarları
      const sponsonRoofGeo = new THREE.BoxGeometry(0.82, 0.08, 1.95);
      addMesh(tiltSponsons, sponsonRoofGeo, matFrameArmor, [sx + side * 0.22, 1.72, SPONSON_Z]);
      addMesh(tiltSponsons, sponsonRoofGeo, matFrameArmor, [sx + side * 0.22, 0.62, SPONSON_Z]);

      // Ön ve arka açılı sponson yanak duvarları (ortası 6-pounder silindirik kalkan için açık)
      const sponsonCheekGeo = new THREE.BoxGeometry(0.76, 1.04, 0.08);
      addMesh(tiltSponsons, sponsonCheekGeo, matFrameArmor, [sx + side * 0.24, 1.17, SPONSON_Z + 0.82], [0, -side * 0.42, 0]);
      addMesh(tiltSponsons, sponsonCheekGeo, matFrameArmor, [sx + side * 0.24, 1.17, SPONSON_Z - 0.82], [0, side * 0.42, 0]);

      // Sponson arka mürettebat giriş kapısı
      const doorGeo = new THREE.BoxGeometry(0.52, 0.78, 0.05);
      addMesh(tiltSponsons, doorGeo, matDarkIron, [sx + side * 0.22, 1.08, SPONSON_Z - 0.86], [0, side * 0.42, 0]);
    });

    // --- 5 & 6. Sol ve Sağ Çevresel Palet Zincirleri (partLeftTrack & partRightTrack) ---
    // Kapalı eşkenar dörtgen (rhomboid) palet eğrisi: HORN_POLY köşelerinin ~0.06 m dışından dolaşır.
    // Alt düz hat Y = 0.044 m'dedir; bakla + dış mahmuz (cleat) ile en alt nokta min.y = 0.000 m!
    const trackPathPts = [
      // Alt düz zemin temas hattı (arkadan öne: Z = -2.35 -> +1.65, Y = 0.044)
      [-2.35, 0.044], [-1.35, 0.044], [-0.35, 0.044], [0.65, 0.044], [1.65, 0.044],
      // Ön 40° tırmanma rampası
      [2.05, 0.28], [2.75, 0.78], [3.35, 1.20], [3.74, 1.50],
      // Ön burun avara çarkı (front idler) kavisi
      [3.84, 1.76], [3.68, 2.08], [3.32, 2.22],
      // Üst tavan dönüş hattı (önden arkaya: Z = +2.35 -> -2.55)
      [2.35, 2.27], [1.10, 2.25], [-0.15, 2.22], [-1.40, 2.19], [-2.55, 2.17],
      // Arka cer çarkı (rear sprocket) ve alt geri dönüş rampası
      [-3.18, 1.88], [-3.58, 1.50], [-3.62, 1.12], [-3.48, 0.82], [-2.85, 0.34]
    ].map(([z, y]) => new THREE.Vector3(0, y, z));

    const rhomboidCurve = new THREE.CatmullRomCurve3(trackPathPts, true, 'centripetal');
    const rhomboidTrackLen = rhomboidCurve.getLength();
    const LUT_N = 900;
    const trackLUT = [];
    for (let i = 0; i < LUT_N; i++) {
      const u = i / LUT_N;
      const p = rhomboidCurve.getPointAt(u);
      const t = rhomboidCurve.getTangentAt(u);
      const clampedY = Math.max(0.044, p.y);
      trackLUT.push({ y: clampedY, z: p.z, a: clampedY <= 0.045 ? 0 : Math.atan2(-t.y, t.z) });
    }

    const plateGeo = new THREE.BoxGeometry(0.52, 0.048, 0.21);
    const cleatGeo = new THREE.BoxGeometry(0.48, 0.032, 0.045);

    const leftTrackInst = {
      x: TRACK_X,
      plates: addInstancedMesh(tiltLeftTrack, plateGeo, matTrackSteel, TRACK_LINKS),
      cleats: addInstancedMesh(tiltLeftTrack, cleatGeo, matDarkIron, TRACK_LINKS),
      offset: 0
    };
    const rightTrackInst = {
      x: -TRACK_X,
      plates: addInstancedMesh(tiltRightTrack, plateGeo, matTrackSteel, TRACK_LINKS),
      cleats: addInstancedMesh(tiltRightTrack, cleatGeo, matDarkIron, TRACK_LINKS),
      offset: 0
    };
    myMeshes.push(leftTrackInst.plates, leftTrackInst.cleats, rightTrackInst.plates, rightTrackInst.cleats);

    const _m = new THREE.Matrix4();
    const _q = new THREE.Quaternion();
    const _e = new THREE.Euler();
    const _p = new THREE.Vector3();
    const _s = new THREE.Vector3(1, 1, 1);
    const _cleatNormal = new THREE.Vector3();

    function updateSingleTrack(inst, dt, speed) {
      // İleri sürüşte alt hat geriye (zemine göre sabit), üst hat ileriye akar -> eğri parametresi azalır
      inst.offset = (inst.offset - (dt * speed) / rhomboidTrackLen) % 1;
      if (inst.offset < 0) inst.offset += 1;
      for (let i = 0; i < TRACK_LINKS; i++) {
        const u = (i / TRACK_LINKS + inst.offset) % 1;
        const L = trackLUT[Math.floor(u * LUT_N) % LUT_N] || trackLUT[0];
        _e.set(L.a, 0, 0);
        _q.setFromEuler(_e);
        _p.set(inst.x, L.y, L.z);
        _m.compose(_p, _q, _s);
        inst.plates.setMatrixAt(i, _m);

        // Dış palet mahmuzu
        _cleatNormal.set(0, -0.028, 0).applyQuaternion(_q);
        _p.add(_cleatNormal);
        _m.compose(_p, _q, _s);
        inst.cleats.setMatrixAt(i, _m);
      }
      inst.plates.instanceMatrix.needsUpdate = true;
      inst.cleats.instanceMatrix.needsUpdate = true;
    }
    updateSingleTrack(leftTrackInst, 0, 0);
    updateSingleTrack(rightTrackInst, 0, 0);

    // --- 7. Arka Cer Çarkları, Ön Gergi Tekerleri & Alt Makaralar (partSprocketsRollers) ---
    const sprocketPivots = [];
    const rollerGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.46, 10);
    const sprocketWheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.46, 18);
    const idlerWheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.46, 18);

    [-1, 1].forEach(side => {
      const rx = side * TRACK_X;
      // Arka dişli cer çarkı (Z = -3.22 m, Y = 1.32 m)
      const spGrp = new THREE.Group();
      spGrp.position.set(rx, 1.32, -3.22);
      spGrp.userData = { side };
      tiltRollers.add(spGrp);
      addMesh(spGrp, sprocketWheelGeo, matDarkIron, [0, 0, 0], [0, 0, Math.PI / 2]);
      sprocketPivots.push(spGrp);

      // Ön burun gergi (idler) çarkı (Z = +3.45 m, Y = 1.76 m)
      const idGrp = new THREE.Group();
      idGrp.position.set(rx, 1.76, 3.45);
      idGrp.userData = { side };
      tiltRollers.add(idGrp);
      addMesh(idGrp, idlerWheelGeo, matDarkIron, [0, 0, 0], [0, 0, Math.PI / 2]);
      sprocketPivots.push(idGrp);

      // Alt düz hatta 9'ar adet yürüyüş makarası (Z = -2.20 .. +1.56 m, Y = 0.16 m)
      for (let r = 0; r < 9; r++) {
        const rz = -2.20 + r * 0.47;
        addMesh(tiltRollers, rollerGeo, matDarkIron, [rx, 0.16, rz], [0, 0, Math.PI / 2]);
      }
    });

    // --- 8. Arka Direksiyon Kuyruk Çatalı & İkiz Tekerlekler (partSteeringTail) ---
    // Z = -3.52 m'deki arka mafsaldan geriye (Z = -5.25 m) uzanan kafes kiriş ve Ø 1.36 m ikiz tekerlek
    const tailYawPivot = new THREE.Group();
    tailYawPivot.position.set(0, 0.96, -3.52);
    tiltTail.add(tailYawPivot);

    // Kuyruk taşıyıcı A-kolları ve üst baskı yayları
    const tailBoomGeo = new THREE.BoxGeometry(0.11, 0.14, 1.88);
    addMesh(tailYawPivot, tailBoomGeo, matFrameArmor, [-0.36, -0.14, -0.88], [0.16, 0.12, 0]);
    addMesh(tailYawPivot, tailBoomGeo, matFrameArmor, [0.36, -0.14, -0.88], [0.16, -0.12, 0]);
    const tailSpringCylGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.95, 10);
    addMesh(tailYawPivot, tailSpringCylGeo, matDarkIron, [0, 0.22, -0.75], [-0.55, 0, 0]);

    // Kuyruk tekerlekleri döner dingil çatalı (Z = -5.18 m, Y = 0.68 m -> R = 0.68 m tekerlek zemine değer!)
    const tailSteerForkGrp = new THREE.Group();
    tailSteerForkGrp.position.set(0, -0.28, -1.66); // Dünya Y = 0.96 - 0.28 = 0.68 m, Z = -5.18 m
    tailYawPivot.add(tailSteerForkGrp);

    const tailAxleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.92, 12);
    addMesh(tailSteerForkGrp, tailAxleGeo, matDarkIron, [0, 0, 0], [0, 0, Math.PI / 2]);

    const tailWheelRotGrp = new THREE.Group();
    tailSteerForkGrp.add(tailWheelRotGrp);
    const tailRimGeo = new THREE.TorusGeometry(0.64, 0.04, 10, 24);
    const tailSpokeGeo = new THREE.BoxGeometry(0.04, 1.24, 0.06);
    const tailHubGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.20, 12);
    [-0.36, 0.36].forEach(wx => {
      addMesh(tailWheelRotGrp, tailRimGeo, matDarkIron, [wx, 0, 0], [0, Math.PI / 2, 0]);
      addMesh(tailWheelRotGrp, tailHubGeo, matBrass, [wx, 0, 0], [0, 0, Math.PI / 2]);
      for (let s = 0; s < 4; s++) {
        addMesh(tailWheelRotGrp, tailSpokeGeo, matDarkIron, [wx, 0, 0], [(s / 4) * Math.PI, 0, 0]);
      }
    });

    // --- 9 & 10. Sol ve Sağ Sponson QF 6-Pounder (57 mm L/40) Hotchkiss Topları ---
    const sponsonGuns = [];
    const flashGeo = new THREE.ConeGeometry(0.16, 0.68, 10);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffb703, transparent: true, opacity: 0.92 });

    function buildSponson6Pounder(parentTiltGrp, sideSign) {
      const yawGrp = new THREE.Group();
      yawGrp.position.set(sideSign * SPONSON_X, SPONSON_Y, SPONSON_Z);
      // Başlangıçta ileri ve hafif dışa (+sideSign * 12°) bakar
      yawGrp.rotation.y = sideSign * 0.18;
      parentTiltGrp.add(yawGrp);

      // Silindirik döner iç zırh kalkanı (mantlet drum)
      const drumShieldGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.92, 16, 1, false, -Math.PI * 0.45, Math.PI * 0.9);
      addMesh(yawGrp, drumShieldGeo, matGunSteel, [0, 0, 0], [0, sideSign > 0 ? 0 : Math.PI, 0]);

      // Yükseliş (Elevation) beşiği
      const elevGrp = new THREE.Group();
      yawGrp.add(elevGrp);

      // Hidro-yaylı geri tepme kızak silindiri (recoil cradle)
      const cradleGeo = new THREE.BoxGeometry(0.22, 0.18, 0.95);
      addMesh(elevGrp, cradleGeo, matGunSteel, [0, -0.08, 0.28]);
      const recoilCylGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.88, 10);
      addMesh(elevGrp, recoilCylGeo, matBrass, [0, -0.18, 0.28], [Math.PI / 2, 0, 0]);

      // Geri tepen 57 mm L/40 (2,28 m) namlu ve kama bloğu grubu
      const recoilGrp = new THREE.Group();
      elevGrp.add(recoilGrp);

      const barrelGeo = new THREE.CylinderGeometry(0.044, 0.068, 2.15, 14);
      addMesh(recoilGrp, barrelGeo, matGunSteel, [0, 0.04, 0.95], [Math.PI / 2, 0, 0]);
      const muzzleRingGeo = new THREE.TorusGeometry(0.048, 0.009, 8, 14);
      addMesh(recoilGrp, muzzleRingGeo, matGunSteel, [0, 0.04, 2.02]);
      const breechBlockGeo = new THREE.BoxGeometry(0.18, 0.20, 0.32);
      addMesh(recoilGrp, breechBlockGeo, matBrass, [0, 0.03, -0.22]);
      // Topçu omuz dipçiği (shoulder piece)
      const shoulderStockGeo = new THREE.BoxGeometry(0.06, 0.24, 0.38);
      addMesh(recoilGrp, shoulderStockGeo, matWood, [-sideSign * 0.12, -0.02, -0.48]);

      const fl = new THREE.Mesh(flashGeo, flashMat);
      fl.position.set(0, 0.04, 2.36);
      fl.rotation.x = Math.PI / 2;
      fl.visible = false;
      recoilGrp.add(fl);

      const gunObj = { sideSign, yawGrp, elevGrp, recoilGrp, fl, recoilZ: 0, recoilVel: 0, flashTimer: 0 };
      sponsonGuns.push(gunObj);
      return gunObj;
    }

    buildSponson6Pounder(tiltLeft6Pdr, 1);
    buildSponson6Pounder(tiltRight6Pdr, -1);

    // --- 11. 3 × .303 Hotchkiss Makineli Tüfek & 57 mm Mühimmat Rafları (partHotchkissMGs) ---
    const mgBarrelGeo = new THREE.CylinderGeometry(0.018, 0.024, 0.68, 8);
    const mgCoolingFinsGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.22, 10);
    // Ön komutan kabini MG + Sol ve Sağ sponson arka MG'leri
    [
      { pos: [0.34, 2.08, 2.92], rot: [Math.PI / 2, 0, 0] },
      { pos: [1.72, 1.18, -0.52], rot: [Math.PI / 2, 0, -0.65] },
      { pos: [-1.72, 1.18, -0.52], rot: [Math.PI / 2, 0, 0.65] }
    ].forEach(mg => {
      addMesh(tiltMGs, mgBarrelGeo, matDarkIron, mg.pos, mg.rot);
      addMesh(tiltMGs, mgCoolingFinsGeo, matBrass, mg.pos, mg.rot);
    });

    // İç yan duvarlarda 57 mm (6-pounder) pirinç top mermisi rafları
    const rackBoxGeo = new THREE.BoxGeometry(0.24, 0.62, 1.15);
    const shell6PdrGeo = new THREE.CylinderGeometry(0.028, 0.032, 0.42, 8);
    [-0.68, 0.68].forEach(rx => {
      addMesh(tiltMGs, rackBoxGeo, matDarkIron, [rx, 0.72, 1.05]);
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 4; c++) {
          addMesh(
            tiltMGs,
            shell6PdrGeo,
            matBrass,
            [rx, 0.56 + r * 0.24, 0.65 + c * 0.26],
            [0, 0, Math.PI / 2]
          );
        }
      }
    });

    // --- 12. Merkez Foster-Daimler 105 BG 6 Silindirli Motor (partDaimlerEngine) ---
    // Z = -0.35 .. +1.05 m arasında merkez koridorda açıkta duran 6 silindirli dikey blok
    const crankcaseGeo = new THREE.BoxGeometry(0.48, 0.46, 1.32);
    addMesh(tiltEngine, crankcaseGeo, matEngineBlock, [0, 0.56, 0.35]);
    const cylPairGeo = new THREE.BoxGeometry(0.36, 0.52, 0.34);
    [-0.42, 0.0, 0.42].forEach(cz => {
      addMesh(tiltEngine, cylPairGeo, matEngineBlock, [0, 1.02, 0.35 + cz]);
    });
    // Üst pirinç su soğutma manifoldu ve karbüratör
    const waterPipeGeo = new THREE.CylinderGeometry(0.032, 0.032, 1.25, 10);
    addMesh(tiltEngine, waterPipeGeo, matBrass, [0, 1.32, 0.35], [Math.PI / 2, 0, 0]);
    // Arka ağır dökme demir volan (flywheel: Z = -0.42 m, döner)
    const engineFlywheelMesh = addMesh(
      tiltEngine,
      new THREE.CylinderGeometry(0.38, 0.38, 0.12, 20),
      matDarkIron,
      [0, 0.58, -0.42],
      [Math.PI / 2, 0, 0]
    );

    // --- 13. Ana Şanzıman, Sonsuz Vida (Worm) Diferansiyel & Enine Aks (partMainDiff) ---
    const primaryBoxGeo = new THREE.BoxGeometry(0.54, 0.42, 0.56);
    addMesh(tiltDiff, primaryBoxGeo, matEngineBlock, [0, 0.54, -0.88]);
    // Sonsuz vida diferansiyel gövdesi (Z = -1.42 m) ve sağ/sol enine aks mili (cross-shaft)
    const wormHousingGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.44, 16);
    addMesh(tiltDiff, wormHousingGeo, matBrass, [0, 0.58, -1.42], [0, 0, Math.PI / 2]);
    const crossShaftGeo = new THREE.CylinderGeometry(0.048, 0.048, 1.68, 12);
    const crossShaftMesh = addMesh(tiltDiff, crossShaftGeo, matDarkIron, [0, 0.58, -1.42], [0, 0, Math.PI / 2]);

    // --- 14. Sağ & Sol İkincil Vites Kutuları (Gearsmen) & Coventry Zincirleri (partSecondaryGears) ---
    const secGearLevers = [];
    const chainDriveWheels = [];
    [-1, 1].forEach(side => {
      const gx = side * 0.62;
      // İkincil 2-vites kutusu (Z = -1.42 m)
      const secBoxGeo = new THREE.BoxGeometry(0.32, 0.44, 0.48);
      addMesh(tiltSecGears, secBoxGeo, matEngineBlock, [gx, 0.58, -1.42]);
      // Vitesçi ("gearsman") el kolu (sağ/sol vites durumuna göre ileri/geri yatar)
      const leverPivot = new THREE.Group();
      leverPivot.position.set(gx - side * 0.14, 0.82, -1.42);
      tiltSecGears.add(leverPivot);
      const leverRodGeo = new THREE.CylinderGeometry(0.016, 0.02, 0.58, 8);
      addMesh(leverPivot, leverRodGeo, matBrass, [0, 0.28, 0]);
      secGearLevers.push({ side, leverPivot });

      // Coventry makaralı tahrik zinciri hattı (Z = -1.42 m, Y = 0.58 m -> arka cer çarkı Z = -3.22 m, Y = 1.32 m)
      const chainDx = 1.80;
      const chainDy = 0.74;
      const chainLen = Math.hypot(chainDx, chainDy);
      const chainPitch = Math.atan2(chainDy, chainDx);
      const chainRunGeo = new THREE.BoxGeometry(0.08, 0.22, chainLen);
      addMesh(
        tiltSecGears,
        chainRunGeo,
        matDarkIron,
        [side * 0.80, 0.95, -2.32],
        [-chainPitch, 0, 0]
      );
      const pinionWheel = addMesh(
        tiltSecGears,
        new THREE.CylinderGeometry(0.18, 0.18, 0.12, 14),
        matBrass,
        [side * 0.80, 0.58, -1.42],
        [0, 0, Math.PI / 2]
      );
      chainDriveWheels.push({ side, pinionWheel });
    });

    // --- 15. Ön Üst İkiz Benzin Depoları, Radyatör & Tavan Egzoz Boruları (partFuelExhaust) ---
    // Ön boynuzların iç üst kısmında ikiz silindirik benzin deposu (Z = +2.65 m, Y = 1.72 m)
    const fuelTankGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.88, 14);
    [-0.52, 0.52].forEach(fx => {
      addMesh(tiltFuel, fuelTankGeo, matBrass, [fx, 1.72, 2.45], [Math.PI / 2 - 0.35, 0, 0]);
    });
    // Arka soğutma radyatörü (Z = -2.25 m, Y = 1.25 m)
    const radiatorGeo = new THREE.BoxGeometry(0.86, 0.68, 0.32);
    addMesh(tiltFuel, radiatorGeo, matDarkIron, [0, 1.28, -2.25]);
    // Tavan üstü açık egzoz çıkış boruları (Y = 2.12 .. 2.48 m)
    const exhaustPipeGeo = new THREE.CylinderGeometry(0.042, 0.048, 0.48, 10);
    [-0.18, 0.18].forEach(ex => {
      addMesh(tiltFuel, exhaustPipeGeo, matDarkIron, [ex, 2.28, 0.15]);
      addMesh(tiltFuel, exhaustPipeGeo, matDarkIron, [ex, 2.28, 0.55]);
    });

    // --- 16. Somme Cephesi Siper Kesiti, Kum Torbaları & Dikenli Tel (partTrenchDiorama) ---
    // Varsayılan düz zeminde gizlidir; "Siper Aşma Gösterimi" (trenchMode) açıldığında görünür olur.
    const trenchGrp = new THREE.Group();
    trenchGrp.visible = false;
    partTrenchDiorama.add(trenchGrp);

    // Ön ve arka siper toprak banketleri (ortada Z = -0.8 .. +1.2 m arası siper boşluğu)
    const earthMoundFrontGeo = new THREE.BoxGeometry(6.4, 0.48, 2.2);
    addMesh(trenchGrp, earthMoundFrontGeo, matEarth, [0, 0.24, 2.55]);
    const earthMoundRearGeo = new THREE.BoxGeometry(6.4, 0.32, 2.4);
    addMesh(trenchGrp, earthMoundRearGeo, matEarth, [0, 0.16, -2.25]);

    // Siper ön parapetinde kum torbaları (sandbags) ve kırılmış dikenli tel kazıkları
    const sandbagGeo = new THREE.BoxGeometry(0.46, 0.18, 0.28);
    for (let sb = -5; sb <= 5; sb++) {
      if (Math.abs(sb) === 2) continue; // palet izi ezilmiş boşluk
      addMesh(trenchGrp, sandbagGeo, matSandbag, [sb * 0.48, 0.55, 1.65], [0, (sb % 2) * 0.15, 0]);
    }
    const wirePostGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.65, 6);
    const wireCoilGeo = new THREE.TorusGeometry(0.22, 0.012, 6, 12);
    [-2.4, -1.8, 1.8, 2.4].forEach(wx => {
      addMesh(trenchGrp, wirePostGeo, matDarkIron, [wx, 0.68, 3.25], [0.25, 0, 0.18]);
      addMesh(trenchGrp, wireCoilGeo, matDarkIron, [wx, 0.66, 3.25], [0, Math.PI / 4, 0]);
    });

    // ------------------------------------------------------------------------
    // SİMÜLASYON DURUMU VE MOTOR / İKİNCİL VİTES / SİPER FİZİĞİ
    // ------------------------------------------------------------------------
    const S = {
      engineRpm: 800,         // Daimler motor devri (0 - 1050 RPM; gizli alt sınır yok!)
      sponsonElevDeg: 3,      // 6-pounder top yükseliş açısı (-8° .. +15°)
      steerDeg: 0,            // Yönlendirme & ikincil vites kumandası (-20° .. +20°)
      autoDrive: true,        // Motor ve palet tahriki açık
      autoSweep: false,       // Sponson topları otomatik yanal tarama
      trenchMode: false,      // false = Düz Zemin, true = Somme Siper & Parapet Aşma Gösterimi
      leftGearRatio: 1.0,     // Sol ikincil vites oranı (1.0 = Yüksek, 0.5 = Düşük, 0.0 = Boş/Frenli)
      rightGearRatio: 1.0,    // Sağ ikincil vites oranı
      trenchPhase: 0,
      sweepTimer: 0,
      nextFireSide: 1,        // 1 = Sol 6-pdr, -1 = Sağ 6-pdr sırayla veya birlikte ateşlenir
      ammoCount: 64,          // Kalan 6-pounder mermi sayısı
      finish: 'sommeSolomon1916',
      relief: true
    };

    function computeGearRatios(steerVal) {
      // Gerçek Mark I'de küçük açılarda kuyruk tekeri + iç palet düşük vites (0.5x),
      // keskin dönüşlerde (|steerVal| > 10°) iç paletin ikincil vitesi boşa alınıp frenlenir (0.0x)!
      if (Math.abs(steerVal) < 2) {
        return { left: 1.0, right: 1.0, label: 'HER İKİ PALET TAM İLERİ' };
      }
      if (steerVal > 0) {
        // Sola dönüş: sol palet yavaşlar veya durur, sağ palet tam hız döner
        const leftR = steerVal > 10 ? 0.0 : 0.45;
        return {
          left: leftR,
          right: 1.0,
          label: leftR === 0 ? 'SOL PALET KİLİTLİ (KESKİN SOL)' : 'SOL DÜŞÜK VİTES + KUYRUK'
        };
      }
      // Sağa dönüş: sağ palet yavaşlar veya durur, sol palet tam hız döner
      const rightR = steerVal < -10 ? 0.0 : 0.45;
      return {
        left: 1.0,
        right: rightR,
        label: rightR === 0 ? 'SAĞ PALET KİLİTLİ (KESKİN SAĞ)' : 'SAĞ DÜŞÜK VİTES + KUYRUK'
      };
    }

    function fire6PounderSalvo() {
      if (S.ammoCount <= 0) {
        S.ammoCount = 64;
        if (audio && audio.playClick) audio.playClick(520);
        return { ok: true, refill: true };
      }
      // Her iki sponson topunu (veya sıradakini) ateşle: her iki 6-pounder birden ateşlenir (2 mermi düşer)
      const shots = Math.min(2, S.ammoCount);
      S.ammoCount = Math.max(0, S.ammoCount - shots);
      sponsonGuns.forEach(g => {
        g.recoilZ = -0.28;
        g.recoilVel = 0.85;
        g.flashTimer = 0.12;
        g.fl.visible = true;
      });
      if (audio && audio.playCannonFire) audio.playCannonFire();
      return { ok: true };
    }

    function update(dt) {
      // 1. Motor devri ve palet hızları (Gizli alt sınır yok: S.engineRpm = 0 ise tamamen durur!)
      const activeRpm = S.autoDrive ? S.engineRpm : 0;
      const baseSpeed = (activeRpm / 1000) * 1.67; // m/sn (1000 RPM'de ~6.0 km/sa)

      const gears = computeGearRatios(S.steerDeg);
      S.leftGearRatio = gears.left;
      S.rightGearRatio = gears.right;

      const vLeft = baseSpeed * S.leftGearRatio;
      const vRight = baseSpeed * S.rightGearRatio;

      // Sol ve sağ çevresel paletleri kendi bağımsız hızlarıyla ilerlet
      updateSingleTrack(leftTrackInst, dt, vLeft);
      updateSingleTrack(rightTrackInst, dt, vRight);

      // Arka cer çarkları ve ön avara tekerleklerinin dönüşü
      sprocketPivots.forEach(sp => {
        const vSide = sp.userData.side > 0 ? vLeft : vRight;
        sp.rotation.x += (vSide / 0.36) * dt;
      });

      // Daimler motor volanı, enine diferansiyel mili ve ikincil vites kolları
      const omegaEngine = (activeRpm * Math.PI * 2) / 60;
      engineFlywheelMesh.rotation.y += omegaEngine * 0.15 * dt;
      crossShaftMesh.rotation.x += (baseSpeed / 0.28) * dt;
      chainDriveWheels.forEach(cw => {
        const vSide = cw.side > 0 ? vLeft : vRight;
        cw.pinionWheel.rotation.x += (vSide / 0.18) * dt;
      });
      secGearLevers.forEach(gl => {
        const ratio = gl.side > 0 ? S.leftGearRatio : S.rightGearRatio;
        const targetTilt = ratio === 1.0 ? 0.32 : (ratio > 0 ? 0.0 : -0.35);
        gl.leverPivot.rotation.x += (targetTilt - gl.leverPivot.rotation.x) * Math.min(1, dt * 8);
      });

      // 2. Arka direksiyon kuyruk tekerlekleri ve gövde yön (yaw) açısı
      const avgSpeed = (vLeft + vRight) * 0.5;
      tailWheelRotGrp.rotation.x += (avgSpeed / 0.68) * dt;
      const tailSteerRad = -THREE.MathUtils.degToRad(S.steerDeg * 0.85);
      tailSteerForkGrp.rotation.y += (tailSteerRad - tailSteerForkGrp.rotation.y) * Math.min(1, dt * 8);

      const targetHullYaw = THREE.MathUtils.degToRad(S.steerDeg * 0.45);
      root.rotation.y += (targetHullYaw - root.rotation.y) * Math.min(1, dt * 3.5);

      // 3. Siper Aşma Modu (trenchMode): Gövde 40° ön burunla parapete tırmanıp siperi aşma salınımı yapar
      trenchGrp.visible = S.trenchMode;
      let targetPitch = 0;
      let targetHeaveY = 0;
      if (S.trenchMode) {
        if (avgSpeed > 0.02) S.trenchPhase += dt * (0.45 + avgSpeed * 0.35);
        // Parapete tırmanış (+0.16 rad burun yukarı) ve siper içine iniş (-0.08 rad)
        targetPitch = -0.11 - Math.sin(S.trenchPhase) * 0.08;
        targetHeaveY = 0.26 + Math.cos(S.trenchPhase) * 0.08;
        // Arka kuyruk çatalı zemini izlemek üzere yaylanır
        tailYawPivot.rotation.x = -targetPitch * 0.65;
      } else {
        tailYawPivot.rotation.x += (0 - tailYawPivot.rotation.x) * Math.min(1, dt * 6);
      }

      vehicleTiltSubgroups.forEach(tg => {
        tg.rotation.x += (targetPitch - tg.rotation.x) * Math.min(1, dt * 5);
        tg.position.y += (targetHeaveY - tg.position.y) * Math.min(1, dt * 5);
      });

      // 4. 6-Pounder Sponson topları yükseliş, tarama ve geri tepme fiziği
      if (S.autoSweep) {
        S.sweepTimer += dt;
      }
      const elevRad = -THREE.MathUtils.degToRad(S.sponsonElevDeg);

      sponsonGuns.forEach(g => {
        const baseYaw = g.sideSign * 0.22;
        const sweepOffset = S.autoSweep ? Math.sin(S.sweepTimer * 1.15) * 0.32 * g.sideSign : 0;
        g.yawGrp.rotation.y += (baseYaw + sweepOffset - g.yawGrp.rotation.y) * Math.min(1, dt * 6);
        g.elevGrp.rotation.x += (elevRad - g.elevGrp.rotation.x) * Math.min(1, dt * 8);

        if (g.flashTimer > 0) {
          g.flashTimer -= dt;
          if (g.flashTimer <= 0) g.fl.visible = false;
        }
        if (g.recoilZ < 0) {
          g.recoilZ = Math.min(0, g.recoilZ + g.recoilVel * dt);
          g.recoilGrp.position.z = g.recoilZ;
        }
      });
    }

    // ------------------------------------------------------------------------
    // DOKU / KAPLAMA YÖNETİMİ
    // ------------------------------------------------------------------------
    function applyTextures(blueprint) {
      const fin = FINISHES[S.finish];
      myMeshes.forEach(m => {
        const role = m.material.userData && m.material.userData.mk1Role;
        if (role === 'hullArmor') {
          m.material.map = blueprint ? null : armorMaps[S.finish];
          m.material.bumpMap = (!blueprint && S.relief) ? rivetBump : null;
          m.material.needsUpdate = true;
        } else if (role === 'trackSteel') {
          m.material.color.setHex(fin.track);
          m.userData.origColor = m.material.color.clone();
        } else if (role === 'gunMetal') {
          m.material.color.setHex(fin.gun);
          m.material.bumpMap = (!blueprint && S.relief) ? rivetBump : null;
          m.userData.origColor = m.material.color.clone();
          m.material.needsUpdate = true;
        } else if (role === 'engineMetal') {
          m.material.color.setHex(fin.engine);
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
      title: 'İNGİLİZ MARK I TANKI ("Male" — Somme, 1916)',
      sub: 'Eşkenar Dörtgen (Rhomboid) Çevresel Palet • 2 × QF 6-Pounder (57 mm) Yan Sponson • 105 BG Foster-Daimler Motor • Arka Direksiyon Kuyruğu',
      partCount: '16 Ana Grup',
      texTitle: '🎨 1916 Somme Kamuflajı & Perçin Dokusu',
      textures: Object.keys(FINISHES).map(k => ({ key: k, label: FINISHES[k].btn })),
      textureLabel: () => FINISHES[S.finish].label,
      activeTexture: () => S.finish,
      reliefLabel: on => (on ? '🔩 Ağır Perçin & Zırh Derz Kabartması: AÇIK' : '🔩 Ağır Perçin & Zırh Derz Kabartması: KAPALI'),
      relief: () => S.relief,
      subsystems: [
        { key: 'armor_hull', label: 'Eşkenar Dörtgen Zırh, Kabin & Sponsonlar', color: '#f59e0b', count: 4 },
        { key: 'tracks_tail', label: 'Çevresel Paletler & Arka Direksiyon Kuyruğu', color: '#0284c7', count: 4 },
        { key: 'weapons', label: '2 × 6-Pounder (57 mm) Top & Hotchkiss MG', color: '#ef4444', count: 3 },
        { key: 'powertrain', label: '105 BG Daimler Motor & İkincil Vitesler', color: '#10b981', count: 4 },
        { key: 'trench_base', label: 'Somme Cephesi Siper & Parapet Kesiti', color: '#8b5cf6', count: 1 }
      ],
      camLabels: {
        iso: 'İzometrik',
        front: '40° Ön Burun',
        breech: '6-Pdr Sponson',
        engine: 'Daimler & Vites',
        suspension: 'Palet & Kuyruk',
        top: 'Üstten Görünüm'
      },
      sliders: [
        { label: 'Foster-Daimler Motor Devri (RPM)', min: 0, max: 1050, step: 25, fmt: v => `${Math.round(v)} RPM` },
        { label: '6-Pounder Sponson Yükseliş Açısı', min: -8, max: 15, step: 0.5, fmt: v => `${v >= 0 ? '+' : ''}${v}°` },
        { label: 'Yönlendirme (İkincil Vites & Kuyruk Tekeri)', min: -20, max: 20, step: 1, fmt: v => v === 0 ? 'Düz (1:1)' : (v > 0 ? `Sol (${v}°)` : `Sağ (${Math.abs(v)}°)`) }
      ],
      buttons: {
        terrain: '⚙️ Palet Tahriki (Canlı Sürüş)',
        sweep: '🎯 Sponson Otomatik Tarama',
        mode: true
      },
      fog: { near: 22, far: 68 },
      shadowExtent: 9.5,
      telemetryTag: 'MARK I MALE — 1916',
      statLabels: ['İKİNCİL VİTES (4 KİŞİ)', 'SOL / SAĞ PALET HIZI', '6-PDR MÜHİMMAT', 'MOTOR GÜCÜ']
    };

    function modeLabel() {
      return S.trenchMode
        ? '🪖 Mod: Somme Siper & Parapet Aşma Gösterimi (AÇIK)'
        : '🛣️ Mod: Düz Zemin Sürüşü (Siper Aşma Gösterimi İçin Tıkla)';
    }

    function getSliderValues() {
      return [S.engineRpm, S.sponsonElevDeg, S.steerDeg];
    }

    function onSlider(index, val) {
      if (index === 0) {
        S.engineRpm = val;
        if (val === 0) S.autoDrive = false;
        else S.autoDrive = true;
      } else if (index === 1) {
        S.sponsonElevDeg = val;
        S.autoSweep = false;
      } else if (index === 2) {
        S.steerDeg = val;
      }
      return {};
    }

    function onButton(name) {
      if (name === 'terrain') {
        S.autoDrive = !S.autoDrive;
        if (S.autoDrive && S.engineRpm === 0) S.engineRpm = 800;
        return { active: S.autoDrive };
      }
      if (name === 'sweep') {
        S.autoSweep = !S.autoSweep;
        return { active: S.autoSweep };
      }
      if (name === 'mode') {
        S.trenchMode = !S.trenchMode;
        const msg = S.trenchMode
          ? '<strong>🪖 Somme Siper & Parapet Aşma Modu Aktif!</strong><br/>Eşkenar dörtgen (rhomboid) paletlerin 40° yükselen ön burnu kum torbalı parapete tırmanıyor ve arka kuyruk tekerlekleri geçişi dengeliyor!'
          : '<strong>🛣️ Düz Zemin Sürüş Modu Aktif!</strong><br/>Sağ paneldeki 3. kaydırıcıyı ("Yönlendirme") sağa/sola çekerek bir paletin ikincil vitesle nasıl durdurulduğunu ve arka kuyruk tekerinin nasıl döndüğünü inceleyin.';
        return { active: S.trenchMode, msg };
      }
      return {};
    }

    function buttonActive(name) {
      if (name === 'terrain') return S.autoDrive;
      if (name === 'sweep') return S.autoSweep;
      if (name === 'mode') return S.trenchMode;
      return false;
    }

    function fireButtonLabel() {
      return S.ammoCount <= 0
        ? '📦 6-POUNDER MÜHİMMAT İKMALİ (64 Atım)'
        : '💥 İKİZ 6-POUNDER SPONSON TOPLARINI ATEŞLE!';
    }

    function onFire() {
      return fire6PounderSalvo();
    }

    function getStats() {
      const activeRpm = S.autoDrive ? S.engineRpm : 0;
      const baseKmh = (activeRpm / 1000) * 6.0;
      const gears = computeGearRatios(S.steerDeg);
      const vLKmh = (baseKmh * gears.left).toFixed(1);
      const vRKmh = (baseKmh * gears.right).toFixed(1);
      const hp = Math.round((activeRpm / 1000) * 105);
      return [
        `${gears.label}`,
        `${vLKmh} / ${vRKmh} <span>km/sa</span>`,
        `${S.ammoCount} <span>(57 mm)</span>`,
        `${hp} <span>BG @ ${Math.round(activeRpm)}</span>`
      ];
    }

    function getStatus() {
      if (S.ammoCount <= 0) return { text: 'MÜHİMMAT BİTTİ — İKMAL GEREKLİ', color: '#d97706' };
      if (!S.autoDrive || S.engineRpm === 0) return { text: 'DAIMLER MOTOR RÖLANTİDE / DURDU', color: '#0284c7' };
      if (Math.abs(S.steerDeg) > 10) return { text: 'İKİNCİL VİTES: TEK PALET FRENLİ DÖNÜŞ', color: '#f59e0b' };
      if (S.trenchMode) return { text: 'SİPER & PARAPET AŞILIYOR', color: '#10b981' };
      return { text: 'TAM İLERİ HÜCUM (SOMME 1916)', color: '#10b981' };
    }

    const camPresets = {
      iso: { pos: [7.6, 4.2, 6.8], look: [0, 1.15, -0.4] },
      front: { pos: [2.2, 2.1, 7.6], look: [0, 1.25, 1.5] },
      breech: { pos: [4.8, 2.2, 2.4], look: [1.3, 1.18, 0.15] },
      engine: { pos: [4.6, 3.8, -1.6], look: [0, 0.85, -0.55] },
      suspension: { pos: [5.4, 2.1, -4.8], look: [0, 0.95, -2.8] },
      top: { pos: [0.1, 11.2, -0.6], look: [0, 1.1, -0.6] }
    };

    const tourSteps = [
      {
        title: 'Genel Bakış: 1916 İngiliz Mark I ("Male") — Tarihin İlk Muharebe Tankı',
        desc: '15 Eylül 1916\'da Somme\'da cepheye sürülen ilk tank. Dikenli telleri ezmek ve geniş siperleri aşmak için paletleri gövdenin tüm çevresini dolaşan eşkenar dörtgen (rhomboid) formda tasarlanmıştır.',
        explode: 0, cutaway: false, sub: 'all', cam: 'iso', part: partLeftFrame
      },
      {
        title: 'Yan Sponson Yuvaları ve 2 × QF 6-Pounder (57 mm) Deniz Topları',
        desc: 'Ağırlık merkezini alçak tutmak için üst taret yerine gövdenin iki yanındaki çıkıntılı "sponson" kazamatlarına iki adet 57 mm Hotchkiss topu yerleştirilmiştir. "Ateşle" butonuna basarak geri tepmeyi izleyin.',
        explode: 0, cutaway: false, sub: 'all', cam: 'breech', part: partLeft6Pdr
      },
      {
        title: 'X-Ray Kesit: Açıkta Çalışan 105 BG Daimler Motor ve 4 Kişilik Yönlendirme',
        desc: 'Merkez gövde saydamlaştığında mürettebatın tam ortasında açıkta gürültü ve dumanla çalışan 6 silindirli Foster-Daimler motor, sonsuz vida diferansiyel ve iki "vitesçi" (gearsmen) tarafından kumanda edilen ikincil vites kutuları görülür.',
        explode: 0, cutaway: true, sub: 'powertrain', cam: 'engine', part: partDaimlerEngine
      },
      {
        title: 'Tek Paleti Durdurarak Dönüş ve Arka Direksiyon Kuyruk Tekerlekleri',
        desc: 'Sağ paneldeki 3. kaydırıcıyı ("Yönlendirme") sola veya sağa çekin: iç taraftaki ikincil vites boşa alınıp palet tamamen durdurulur, dış palet dönmeye devam eder ve arkadaki Ø 1,36 m ikiz kuyruk tekerleği yön değiştirir!',
        explode: 0, cutaway: false, sub: 'tracks_tail', cam: 'suspension', part: partSteeringTail
      },
      {
        title: 'Somme Cephesi Siper ve Parapet Aşma Gösterimi',
        desc: 'Sağ paneldeki "Mod" butonuna tıklayarak Somme siper kesitini açın: 2,4 m yüksekliğindeki 40° eğimli ön palet burnunun kum torbalı parapete nasıl tırmandığını görün.',
        explode: 12, cutaway: false, sub: 'all', cam: 'front', part: partLeftTrack
      },
      {
        title: 'Tam Teardown (%85): 16 Bağımsız Mekanik Grup',
        desc: 'Merkez zırhlı kabin, sağ/sol eşkenar dörtgen palet çerçeveleri, yan sponsonlar, 156 baklalı çevresel paletler, arka direksiyon kuyruğu, ikiz 6-pounder toplar, Daimler motor, diferansiyel ve ikincil vitesler ayrılmış görünümde.',
        explode: 85, cutaway: false, sub: 'all', cam: 'iso', part: partDaimlerEngine
      }
    ];

    return {
      root, ui, camPresets, tourSteps,
      flashMesh: null,
      firePart: partLeft6Pdr,
      parts: {
        centerHull: partCenterHull,
        leftFrame: partLeftFrame,
        rightFrame: partRightFrame,
        sponsonHousings: partSponsonHousings,
        leftTrack: partLeftTrack,
        rightTrack: partRightTrack,
        sprocketsRollers: partSprocketsRollers,
        steeringTail: partSteeringTail,
        left6Pdr: partLeft6Pdr,
        right6Pdr: partRight6Pdr,
        hotchkissMGs: partHotchkissMGs,
        daimlerEngine: partDaimlerEngine,
        mainDiff: partMainDiff,
        secondaryGears: partSecondaryGears,
        fuelExhaust: partFuelExhaust,
        trenchDiorama: partTrenchDiorama
      },
      defaultPart: partLeftFrame,
      update, onSlider, onButton, buttonActive, onFire, fireButtonLabel, modeLabel,
      getSliderValues, getStats, getStatus,
      applyTextures, setTexture, toggleRelief
    };
  };
})();
