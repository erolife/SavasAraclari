<<<<<<< HEAD
/* =============================================================================
 * 1862 USS Monitor & Ericsson Buharlı Döner Taret — 3B Araç Modülü (15 Grup)
 * Adaptör Kalıbı (window.VehicleBuilders.monitor) — simulator.html ile tam uyumlu.
 *
 * Tarihsel ve Mekanik Doğruluk Özeti (John Ericsson 1862 & HABS/HAER VA-1396):
 *  - Ericsson 360° Döner Zırhlı Taret:
 *      • Gerçek ölçü: İç çap 20 ft (6,10 m), dış çap 21 ft 4 in (6,50 m), yükseklik 9 ft (2,74 m),
 *        8 kat × 1 inç (25,4 mm) haddelenmiş dövme demir plaka = 203 mm (8 inç) zırh, ~120 ton.
 *      • Sahne ölçeği (1:2,2 taret detayı, 10,4 m kesit gövde): Taret merkezi (x = 0, z = +0,35 m),
 *        dış yarıçap R_out = 1,40 m (Ø 2,80 m), iç yarıçap R_in = 1,28 m, yükseklik 1,25 m (Y = 1,18..2,43 m).
 *  - Merkezi Mil, Kama ve Buharlı Dönüş Dişli Zinciri (v = ω × r Doğrulamalı):
 *      • Taret tüm ağırlığını omurgaya oturan Ø 9 inç merkezi dövme demir mile (partCenterSpindle)
 *        ve alt kama (wedge key) yatağına verir.
 *      • Güverte altında (Y = 0,72 m) mile kamalı ana dişli çark (R_B = 0,72 m, merkez (0, 0,72, +0,35))
 *        ile yardımcı 2 silindirli taret buhar motorunun sürdüğü dikey pinyon (r_P = 0,18 m,
 *        merkez (-0,90, 0,72, +0,35)) tam temas noktasında ((-0,72, 0,72, +0,35), |Δx| = 0,72 + 0,18 = 0,90 m)
 *        kavraşır: ω_P = -(R_B / r_P) * ω_B = -4,0 * ω_B (zıt yön, 4:1 dişli oranı).
 *  - 2 × 11 İnç (279 mm) Dahlgren Yivsiz Toplar ve Sarkaçlı Lombar Kepenkleri:
 *      • İskele (x = -0,44 m) ve Sancak (x = +0,44 m) topları merkezi milden (x = 0, r = 0,11 m)
 *        net 0,16 m açıklıkla ayrılır; sürtünmeli demir kızaklar üzerinde 0,42 m geri teper.
 *      • Maksimum geri tepmede kuyruk topuzu z_yerel = -0,84 m konumuna gelir; x = ±0,44 m'deki
 *        taret iç duvarı z_duvar = -sqrt(1,28² - 0,44²) = -1,202 m olduğundan 0,362 m net boşluk kalır.
 *      • Sarkaçlı lombar kepenkleri (Pendulum Port Stoppers): Atış düzeninde ±38° yana açıktır;
 *        "Dolum & Zırh Koruması" modunda toplar 0,36 m içeri çekilir (z_ağız = +1,12 m < 1,28 m) ve
 *        ağır demir kepenkler 0° konumuna kapanarak lombarları düşman güllesine karşı örter.
 *  - Ericsson "Titreşimli Manivela" (Vibrating-Lever) Ana Buhar Motoru & 4 Kanatlı Uskur:
 *      • Kıç makine dairesinde (z = -2,85 m) çift yatay piston, sağ/sol salınımlı manivela kollarını
 *        (rocker arms, ±20,6°) sallar ve biyel kollarıyla 4 kanatlı Ericsson uskurunu 1:1 tahrik eder.
 * ============================================================================= */

(function () {
  'use strict';

  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.monitor = function buildMonitor(ctx) {
    const { THREE, scene, addCADMesh, createPartGroup } = ctx;
    const audio = ctx.audio || null;

    // ------------------------------------------------------------------------
    // ANA ÖLÇÜLER (1 birim = 1 metre; pruva +Z, sancak +X, Y yukarı)
    // ------------------------------------------------------------------------
    const Y_KEEL = 0.14;           // Alt demir tekne omurga tabanı (kızak blokları Y = 0,00..0,14 m)
    const Y_WATER = 0.92;          // Hampton Roads su hattı yüzeyi
    const Y_DECK = 1.18;           // Zırhlı ana güverte seviyesi (su üstü freeboard = 0,26 m)
    const TURRET_Z = 0.35;         // Ericsson döner taret merkez Z koordinatı
    const R_TURRET_OUT = 1.40;     // Taret dış yarıçapı (Ø 2,80 m — 1:2,2 ölçek)
    const R_TURRET_IN = 1.28;      // Taret iç yarıçapı (8 kat 1 inç zırh kalınlığı = 0,12 m)
    const H_TURRET = 1.25;         // Taret yüksekliği (Y = 1,18 .. 2,43 m)

    const GUN_X = 0.44;            // İskele (-0,44 m) ve Sancak (+0,44 m) 11 inç Dahlgren eksenleri
    const GUN_Y = 1.66;            // Namlu muylu merkez yüksekliği
    const MAX_RECOIL = 0.42;       // Sürtünmeli kızak üzerinde maksimum geri tepme kursu (m)
    const RETRACT_DIST = 0.36;     // Kepenk kapalıyken topların taret içine çekilme mesafesi (m)
    const MAX_AMMO = 40;           // 40 adet 11 inç (279 mm) küresel gülle/humbara

    // Güverte altı taret dişli çarkları (v = ω × r: R_BULL = 0,72 m, R_PIN = 0,18 m -> oran 4:1)
    const R_BULL = 0.72;
    const R_PIN = 0.18;
    const PINION_X = -(R_BULL + R_PIN); // -0,90 m (tam diş teması x = -0,72 m)
    const GEAR_Y = 0.72;

    // ------------------------------------------------------------------------
    // PROSEDÜREL DOKULAR VE 4 TARİHSEL KAPLAMA ŞEMASI (256 px Önbellekli)
    // ------------------------------------------------------------------------
    const SCHEMES = {
      hampton1862: {
        btn: '⚓ Hampton Roads 1862',
        label: '9 Mart 1862 Hampton Roads — Kömür Katranlı Zırh & Tuzlu Su Patinası',
        turretIron: 0x2b3137,
        deckIron: 0x363d45,
        lowerHull: 0x4a251d,
        gunIron: 0x1f2429,
        brass: 0xc89b3c,
        timber: 0x6e4f32,
        water: 0x1e4d6b
      },
      brooklyn1862: {
        btn: '🏭 Brooklyn Tersanesi',
        label: 'Şubat 1862 Greenpoint / Brooklyn — Yeni Haddelenmiş Gri Demir & Kırmızı Sülyen',
        turretIron: 0x3f4750,
        deckIron: 0x4b5560,
        lowerHull: 0x7c2d12,
        gunIron: 0x272c33,
        brass: 0xd4a843,
        timber: 0x7c5a3a,
        water: 0x0369a1
      },
      jamesriver1862: {
        btn: '🔥 James Nehri Barut İsi',
        label: 'Mayıs 1862 Drewry\'s Bluff — Çarpışma Çukurları, Barut İsi & Pas İzleri',
        turretIron: 0x262322,
        deckIron: 0x332f2c,
        lowerHull: 0x3d221a,
        gunIron: 0x191a1c,
        brass: 0xb0842e,
        timber: 0x594028,
        water: 0x294c44
      },
      mariners_museum: {
        btn: '🏛️ Mariners\' Müzesi',
        label: 'Newport News Müze Konservasyonu — Kesit İnceleme & Parlak Pirinç Donanım',
        turretIron: 0x334155,
        deckIron: 0x475569,
        lowerHull: 0x643124,
        gunIron: 0x1e293b,
        brass: 0xeab308,
        timber: 0x855f3c,
        water: 0x0284c7
      }
    };

    function makeRivetBumpTexture() {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const g = c.getContext('2d');
      g.fillStyle = '#808080';
      g.fillRect(0, 0, 256, 256);
      // Plaka derz çizgileri
      g.strokeStyle = '#404040';
      g.lineWidth = 3;
      for (let y = 32; y < 256; y += 64) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(256, y);
        g.stroke();
      }
      for (let x = 64; x < 256; x += 128) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, 256);
        g.stroke();
      }
      // Perçin ve cıvata başları
      for (let y = 12; y < 256; y += 32) {
        for (let x = 16; x < 256; x += 32) {
          g.fillStyle = '#e5e5e5';
          g.beginPath();
          g.arc(x, y, 3.2, 0, Math.PI * 2);
          g.fill();
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 2);
      return tex;
    }

    const rivetBump = makeRivetBumpTexture();
    const myMeshes = [];

    function makeMat(colorHex, rough, metal, role, isArmor = false, extra = {}) {
      const m = new THREE.MeshStandardMaterial(Object.assign({
        color: colorHex,
        roughness: rough,
        metalness: metal,
        bumpMap: role === 'iron' || role === 'turret' ? rivetBump : null,
        bumpScale: 0.018
      }, extra));
      m.userData = { mnRole: role, isArmor: !!isArmor };
      return m;
    }

    const matTurretArmor = makeMat(SCHEMES.hampton1862.turretIron, 0.52, 0.72, 'turret', true, { side: THREE.DoubleSide });
    const matInnerLamination = makeMat(0x475569, 0.48, 0.75, 'lamination', false);
    const matDeckArmor = makeMat(SCHEMES.hampton1862.deckIron, 0.56, 0.68, 'deck', true);
    const matLowerHull = makeMat(SCHEMES.hampton1862.lowerHull, 0.62, 0.52, 'lower', false);
    const matDahlgren = makeMat(SCHEMES.hampton1862.gunIron, 0.36, 0.84, 'gun', false);
    const matDarkIron = makeMat(0x22272e, 0.48, 0.76, 'iron', false);
    const matSteelBright = makeMat(0x94a3b8, 0.28, 0.88, 'steel', false);
    const matBrass = makeMat(SCHEMES.hampton1862.brass, 0.30, 0.86, 'brass', false);
    const matCopper = makeMat(0xb45309, 0.34, 0.82, 'copper', false);
    const matTimber = makeMat(SCHEMES.hampton1862.timber, 0.78, 0.08, 'timber', false);
    const matCoalFire = makeMat(0xea580c, 0.40, 0.10, 'fire', false, { emissive: new THREE.Color(0x9a3412), emissiveIntensity: 0.55 });
    const matWater = new THREE.MeshStandardMaterial({
      color: SCHEMES.hampton1862.water,
      roughness: 0.22,
      metalness: 0.15,
      transparent: true,
      opacity: 0.36,
      depthWrite: false
    });
    matWater.userData = { mnRole: 'water', isWater: true };

    // ------------------------------------------------------------------------
    // KÖK GRUP VE 15 BAĞIMSIZ MEKANİK PARÇA GRUBU
    // ------------------------------------------------------------------------
    const root = new THREE.Group();
    root.name = 'monitor_root';
    root.visible = false;
    scene.add(root);

    function addMesh(parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], castShadow = true) {
      const m = addCADMesh(parent, geo, mat, pos, rot, castShadow);
      myMeshes.push(m);
      return m;
    }

    function makePart(cfg) {
      const g = createPartGroup({
        id: cfg.id,
        name: cfg.name,
        subsystem: cfg.subsystem,
        subLabel: cfg.sub,
        desc: cfg.desc,
        material: cfg.mat,
        weight: cfg.weight,
        spec: cfg.spec,
        location: cfg.loc,
        basePos: [0, 0, 0],
        explodeVec: cfg.explode || [0, 1.5, 0],
        isOuterShell: !!cfg.isOuterShell
      });
      root.add(g);
      return g;
    }

    // --- ALT SİSTEM 1: 8 KATMANLI DÖNER TARET & MERKEZİ MİL (turret_system — 5 Grup) ---
    const partTurretArmor = makePart({
      id: 'mn_turret_armor',
      name: '1. 8 Katmanlı (203 mm) Dövme Demir Döner Taret Zırhı',
      sub: 'ALT SİSTEM: 8 KATMANLI DÖNER TARET & MİL',
      desc: 'John Ericsson tarafından tasarlanan silindirik döner taret. Tek parça kalın zırh dövülemediği için 1 inç (25,4 mm) kalınlığında 8 eşmerkezli haddelenmiş dövme demir plaka katmanı birbirine cıvatalanarak toplam 8 inç (203 mm) zırh elde edilmiştir. X-Ray modunda 8 katmanlı iç yapısı görülür.',
      mat: '8 × 1 inç Haddelenmiş Baltimore Dövme Demiri',
      weight: '~120 Long Ton (Tam Taret)',
      spec: 'İç Çap 6,10 m (20 ft) • Yükseklik 2,74 m (9 ft)',
      loc: 'Orta Güverte Üstü (z = +0,35 m)',
      subsystem: 'turret_system',
      isOuterShell: true,
      explode: [0, 2.2, 0]
    });

    const partRoofGrating = makePart({
      id: 'mn_roof_grating',
      name: '2. Taret Üst Demiryolu Raylı Havalandırma Izgarası & Kapak',
      sub: 'ALT SİSTEM: 8 KATMANLI DÖNER TARET & MİL',
      desc: 'Taretin tavanı, hem barut dumanını tahliye etmek hem de yukarıdan düşecek mermileri saptırmak için dövme demir demiryolu rayları ve delikli demir plakalarla ızgara şeklinde kapatılmıştır. Üzerinde komutan gözetleme kapağı bulunur.',
      mat: 'Dövme Demir Ray Kirişleri & Delikli Sac',
      weight: '~6,4 Ton',
      spec: 'Barut Dumanı Tahliyesi & Üst Koruma',
      loc: 'Taret Tavanı (Y = 2,40 m)',
      subsystem: 'turret_system',
      explode: [0, 3.1, 0]
    });

    const partCenterSpindle = makePart({
      id: 'mn_center_spindle',
      name: '3. Merkezi Dövme Demir Taret Mili (Spindle) & Kaldırma Kaması',
      sub: 'ALT SİSTEM: 8 KATMANLI DÖNER TARET & MİL',
      desc: '120 tonluk taret ağırlığını güverte bilyelerine değil, doğrudan gemi omurgasına oturan Ø 9 inçlik (229 mm) merkezi dövme demir mile verir. Muharebe öncesi milin altındaki çelik kama (wedge key) çakılarak taret güverte halkasından hafifçe kaldırılır ve serbestçe dönmesi sağlanır.',
      mat: 'Dövme Çelik/Demir Mil & Bronz Yatak',
      weight: '~4,8 Ton',
      spec: 'Ø 229 mm (9 inç) • Çapraz Gergi Kirişli',
      loc: 'Taret Merkezi (x = 0, z = +0,35 m)',
      subsystem: 'turret_system',
      explode: [0, 1.4, 0]
    });

    const partTurretGears = makePart({
      id: 'mn_turret_gears',
      name: '4. Güverte Altı Ana Dişli Çark & 2 Silindirli Taret Buhar Motoru',
      sub: 'ALT SİSTEM: 8 KATMANLI DÖNER TARET & MİL',
      desc: 'Güverte altında merkezi mile kamalanmış büyük ana dişli çark (R = 0,72 m) ve onu 4:1 oranla (v = ω × r) tahrik eden dikey pinyon (r = 0,18 m). Gücünü 2 silindirli yardımcı "donkey" buhar motorundan 90° konik dişli çiftiyle alır.',
      mat: 'Dökme Demir Dişli Çarklar & Pirinç Silindirler',
      weight: '~3,2 Ton',
      spec: '4:1 Son Dişli Oranı • 360° Buharlı Dönüş',
      loc: 'Güverte Altı Orta Bölme (Y = 0,72 m)',
      subsystem: 'turret_system',
      explode: [-1.8, -0.6, 0.35]
    });

    const partPortStoppers = makePart({
      id: 'mn_port_stoppers',
      name: '5. Dövme Demir Sarkaçlı Lombar Kepenkleri (Pendulum Port Stoppers)',
      sub: 'ALT SİSTEM: 8 KATMANLI DÖNER TARET & MİL',
      desc: 'Ericsson\'un patentli sarkaçlı lombar kepenkleri. Taret tavan kirişine asılı ağır kranklı demir sarkaçlar, toplar dolum için içeri çekildiğinde lombar deliklerini kapatarak mürettebatı düşman ateşinden korur; atış öncesinde halat palangalarla ±38° yana açılır.',
      mat: '150 mm Dövme Demir Sarkaç Blokları',
      weight: '2 × ~950 kg',
      spec: '±38° Sarkaç Açılma • Lombar Zırh Koruması',
      loc: 'Taret Ön Lombarları (z_yerel = +1,16 m)',
      subsystem: 'turret_system',
      explode: [0, 1.8, 1.9]
    });

    // --- ALT SİSTEM 2: 2 × 11 İNÇ DAHLGREN TOPLARI & CEPHANELİK (artillery — 4 Grup) ---
    const partLeftDahlgren = makePart({
      id: 'mn_left_dahlgren',
      name: '6. İskele (Sol) 11 İnç (279 mm) Dahlgren Yivsiz Topu & Kundak',
      sub: 'ALT SİSTEM: 2 × 11 İNÇ DAHLGREN TOPLARI & CEPHANELİK',
      desc: 'Amiral John A. Dahlgren tarafından geliştirilen, barut basıncının en yüksek olduğu kuyruk kısmı kalın "soda şişesi" profilli 11 inç (279 mm) yivsiz dökme demir top. 1862 Hampton Roads çarpışmasında 15 lb (6,8 kg) barut hakkıyla 168 lb (76 kg) demir gülle ateşlemiştir (sonradan 30 lb barutun CSS Virginia zırhını delebileceği tartışılmıştır).',
      mat: 'Dökme Demir Namlu & Perçinli Demir Kundak',
      weight: '~7.120 kg (15.700 lb Namlu)',
      spec: 'Ø 279 mm (11 inç) • 76 kg Gülle / 61,7 kg Humbara',
      loc: 'Taret İçi Sol Eksen (x = -0,44 m)',
      subsystem: 'artillery',
      explode: [-1.4, 1.5, 1.8]
    });

    const partRightDahlgren = makePart({
      id: 'mn_right_dahlgren',
      name: '7. Sancak (Sağ) 11 İnç (279 mm) Dahlgren Yivsiz Topu & Kundak',
      sub: 'ALT SİSTEM: 2 × 11 İNÇ DAHLGREN TOPLARI & CEPHANELİK',
      desc: 'Taretin sancak tarafındaki ikinci 11 inç Dahlgren topu. Dar taret içinde (6,1 m iç çap) iki dev topun sadece 0,42 m mesafede durdurulabilmesi için Ericsson çok plakalı sürtünme frenli demir kızaklar kullanmıştır.',
      mat: 'Dökme Demir Namlu & Perçinli Demir Kundak',
      weight: '~7.120 kg (15.700 lb Namlu)',
      spec: 'Ø 279 mm (11 inç) • 0,42 m Sürtünmeli Geri Tepme',
      loc: 'Taret İçi Sağ Eksen (x = +0,44 m)',
      subsystem: 'artillery',
      explode: [1.4, 1.5, 1.8]
    });

    const partRecoilSlides = makePart({
      id: 'mn_recoil_slides',
      name: '8. Taret İçi Sürtünmeli Demir Kızak Rayları, Fren Çarkları & Vinç',
      sub: 'ALT SİSTEM: 2 × 11 İNÇ DAHLGREN TOPLARI & CEPHANELİK',
      desc: 'Taret tabanına boyuna cıvatalanmış dört adet paralel dövme demir I-kiriş kızak rayı. Yanlardaki büyük pirinç/demir el çarkları sıkılarak kundak plakaları raylara bastırılır (sürtünmeli geri tepme freni); atıştan sonra dişli vinç kollarıyla toplar tekrar batarya konumuna sürülür.',
      mat: 'Dövme Demir Kızak Rayları & Bronz Fren Çarkları',
      weight: '~3,6 Ton',
      spec: 'Sürtünme Plakalı Fren • Kremayer İleri Sürme',
      loc: 'Taret Tabanı (Y = 1,29 m, x = ±0,44 m)',
      subsystem: 'artillery',
      explode: [0, 0.9, 1.4]
    });

    const partShellMagazine = makePart({
      id: 'mn_shell_magazine',
      name: '9. Su Altı Cephaneliği, 11 İnç Küresel Gülle Rafları & Barut Fıçıları',
      sub: 'ALT SİSTEM: 2 × 11 İNÇ DAHLGREN TOPLARI & CEPHANELİK',
      desc: 'Su hattının altında, zırhlı güverteyle korunan baş-orta cephanelik ve mermi odası. 11 inçlik küresel dökme demir gülleler ve bakır kapaklı barut fıçıları burada istiflenir; palangalı mermi vinciyle taret tabanındaki kapaklardan yukarı çekilir.',
      mat: 'Dökme Demir Gülleler, Meşe Raflar & Bakır Barut Sandıkları',
      weight: '~4,5 Ton (40 Atım Mühimmat)',
      spec: '40 × 11 inç Gülle/Humbara • 15 lb Barut Keseleri',
      loc: 'Güverte Altı Baş-Orta Bölme (z = +1,95 m)',
      subsystem: 'artillery',
      explode: [1.8, -0.7, 1.95]
    });

    // --- ALT SİSTEM 3: ZIRHLI SAL GÖVDE, KAPTAN KÖŞKÜ & SU HATTI (armored_hull — 3 Grup) ---
    const partArmoredDeck = makePart({
      id: 'mn_armored_deck',
      name: '10. Üst Zırhlı Sal Güvertesi (Armored Raft), 5 İnç Zırh Kuşağı & Pirinç Halka',
      sub: 'ALT SİSTEM: ZIRHLI SAL GÖVDE & KAPTAN KÖŞKÜ',
      desc: 'Su hattının yalnızca ~46 cm (18 inç) üzerinde yüzen, alt demir tekneden her yönde taşarak pervaneyi, dümeni ve tekneyi mahmuz ile top ateşine karşı koruyan zırhlı "sal" (raft) yapısı. Yanlarda 5 inç (127 mm) demir zırh + kalın meşe/çam yastık, üstte 1 inç demir güverte plakası ve taret altında dökme pirinç yatak halkası bulunur.',
      mat: '127 mm Yan Demir Zırh + Meşe Yastık + 25 mm Güverte',
      weight: '~380 Ton (Gerçek Üst Sal)',
      spec: 'Gerçek Boy 52,4 m × 12,65 m (Sahne 1:2,2 Kesit)',
      loc: 'Su Hattı Üstü (Y = 0,90 .. 1,18 m)',
      subsystem: 'armored_hull',
      isOuterShell: true,
      explode: [0, 0.85, 0]
    });

    const partLowerHull = makePart({
      id: 'mn_lower_hull',
      name: '11. Alt Demir Tekne, Su Geçirmez Perdeler & Gizli Çapa Kuyusu',
      sub: 'ALT SİSTEM: ZIRHLI SAL GÖVDE & KAPTAN KÖŞKÜ',
      desc: 'Üstteki geniş zırhlı salın altında yer alan, 1/2 inçlik perçinli demir levhalardan inşa edilmiş düz karinalı alt tekne. Pruva taşmasının altında düşman ateşi görmeden çapa atıp toplamayı sağlayan zırhlı çapa kuyusu (anchor well) yer alır.',
      mat: '12,7 mm Perçinli Gemi Demiri & Meşe Kızak Blokları',
      weight: '~290 Ton (Alt Tekne)',
      spec: 'Düz Karina • Su Geçirmez Bölmeli • Gizli Çapa Kuyusu',
      loc: 'Su Hattı Altı (Y = 0,00 .. 0,90 m)',
      subsystem: 'armored_hull',
      explode: [0, -1.2, 0]
    });

    const partPilotHouse = makePart({
      id: 'mn_pilot_house',
      name: '12. Pruva Kütük Tipi Zırhlı Kaptan Köşkü (Pilot House) & Deniz Yüzeyi',
      sub: 'ALT SİSTEM: ZIRHLI SAL GÖVDE & KAPTAN KÖŞKÜ',
      desc: 'Pruva güvertesinde yükselen, 9×12 inçlik (229×305 mm) masif dövme demir kütüklerin köşelerden cıvatalanmasıyla oluşturulmuş zırhlı kaptan köşkü. Komutan (Teğmen John L. Worden) ve serdümen buradaki 16 mm\'lik dar görüş yarığından gemiyi yönetirdi. Taretin tam pruvaya ateş etmesini engellediği için sonraki monitorlarda taret üstüne taşınmıştır.',
      mat: '229 × 305 mm Masif Dövme Demir Kütükler',
      weight: '~18 Ton',
      spec: 'Dar Görüş Yarığı • Zincirli Dümen Dolabı',
      loc: 'Pruva Güvertesi (z = +3,45 m)',
      subsystem: 'armored_hull',
      explode: [0, 1.5, 2.2]
    });

    // --- ALT SİSTEM 4: ERİCSSON TİTREŞİMLİ MANİVELA MOTORU & USKUR (steam_propulsion — 3 Grup) ---
    const partSteamEngine = makePart({
      id: 'mn_vibrating_engine',
      name: '13. Ericsson 36 İnç Çift Pistonlu "Titreşimli Manivela" Ana Buhar Motoru',
      sub: 'ALT SİSTEM: ERİCSSON BUHAR MOTORU & USKUR',
      desc: 'USS Monitor\'un alçak güverte yüksekliğine sığması için John Ericsson\'un icat ettiği yatay çift pistonlu "titreşimli manivela" (vibrating-lever) buhar motoru. Ortadaki tek dökme silindir gövdesinde sırt sırta çalışan iki piston, yanlardaki L-manivela kollarını (±20,6°) sallar; bu kollar da biyel çubuklarıyla ortadaki pervane krankını çevirir.',
      mat: 'Dökme Demir Silindir Gövdesi, Dövme Çelik Manivelalar & Pirinç Yataklar',
      weight: '~28 Ton',
      spec: '320 IHP • Ø 914 mm (36 inç) Çift Piston • 0–80 RPM',
      loc: 'Kıç Makine Dairesi (z = -2,85 m)',
      subsystem: 'steam_propulsion',
      explode: [-1.9, -0.4, -1.8]
    });

    const partBoilersBlower = makePart({
      id: 'mn_boilers_blower',
      name: '14. 2 × Martin Su Borulu Kazan & Santrifüj Buharlı Havalandırma Fanları',
      sub: 'ALT SİSTEM: ERİCSSON BUHAR MOTORU & USKUR',
      desc: 'Makine dairesinin önünde yan yana yer alan iki adet Martin tipi yatay su borulu kömür kazanı ve geminin su altındaki kapalı bölmelerine temiz hava ile kazan çekişi sağlayan çift buharlı santrifüj vantilatör (blower) sistemi.',
      mat: 'Perçinli Kazan Çeliği, Bakır Buhar Boruları & Pirinç Valfler',
      weight: '~34 Ton (2 Kazan + Fanlar)',
      spec: '2 × Martin Su Borulu Kazan • Buharlı Cebri Havalandırma',
      loc: 'Orta-Kıç Kazan Dairesi (z = -1,25 m)',
      subsystem: 'steam_propulsion',
      explode: [1.9, -0.4, -1.2]
    });

    const partPropellerRudder = makePart({
      id: 'mn_propeller_rudder',
      name: '15. 4 Kanatlı 9 ft Ericsson Dökme Demir Uskur, Şaft & Dengeli Dümen',
      sub: 'ALT SİSTEM: ERİCSSON BUHAR MOTORU & USKUR',
      desc: 'Zırhlı kıç sal taşmasının altında korunan 9 ft (2,74 m) çapında 4 kanatlı Ericsson dökme demir uskuru (pervane) ve arkasındaki dengeli demir dümen. Motor devri (RPM) 0 olduğunda uskur tamamen durur.',
      mat: 'Dökme Demir 4 Kanatlı Uskur & Dövme Çelik Şaft',
      weight: '~4,2 Ton',
      spec: 'Ø 2,74 m (9 ft) 4 Kanatlı Uskur • 1:1 Krank Tahriki',
      loc: 'Kıç Sualtı Uzantısı (z = -4,45 m)',
      subsystem: 'steam_propulsion',
      explode: [0, -0.8, -2.4]
    });

    // ========================================================================
    // GEOMETRİ İNŞASI — TARET VE DAHLGREN TOPLARI BİRLİKTE DÖNEN PIVOT HİYERARŞİSİ
    // ========================================================================
    // Taret dönüş açısı (S.turretYawDeg) uygulandığında taret zırhı, tavan ızgarası,
    // sarkaçlı kepenkler, kızak rayları ve 2 × 11 inç Dahlgren topları birlikte döner!
    // Her bir parça grubunun içinde (0, 0, TURRET_Z) merkezli birer yaw alt grubu oluşturuyoruz.
    const turretRotGroups = [];
    function makeTurretYawSubgroup(parentPart) {
      const g = new THREE.Group();
      g.position.set(0, 0, TURRET_Z);
      parentPart.add(g);
      turretRotGroups.push(g);
      return g;
    }

    const yawTurretArmor = makeTurretYawSubgroup(partTurretArmor);
    const yawRoofGrating = makeTurretYawSubgroup(partRoofGrating);
    const yawCenterSpindle = makeTurretYawSubgroup(partCenterSpindle);
    const yawPortStoppers = makeTurretYawSubgroup(partPortStoppers);
    const yawLeftDahlgren = makeTurretYawSubgroup(partLeftDahlgren);
    const yawRightDahlgren = makeTurretYawSubgroup(partRightDahlgren);
    const yawRecoilSlides = makeTurretYawSubgroup(partRecoilSlides);

    // --- 1. 8 Katmanlı Dövme Demir Döner Taret Zırhı (partTurretArmor) ---
    // Ön lombar açıklığı (±0,33 rad = ±19° aralığında Y = 1,46..1,92 m arasında iki oval lombar)
    // Alt halka (Y = 1,18 .. 1,48 m, 360° tam halka), üst halka (Y = 1,90 .. 2,43 m, 360° tam halka)
    // Orta kuşak (Y = 1,48 .. 1,90 m): lombar pencereleri dışındaki arka/yan yay ve lombarlar arası orta dikme
    function buildRingWall(parent, rIn, rOut, yMin, yMax, thetaStart, thetaLength, mat, segs = 36) {
      const h = yMax - yMin;
      const yMid = (yMin + yMax) * 0.5;
      // Dış silindir yüzeyi ve iç silindir yüzeyi (uçları açık — taret içi boş silindir)
      addMesh(parent, new THREE.CylinderGeometry(rOut, rOut, h, segs, 1, true, thetaStart, thetaLength), mat, [0, yMid, 0]);
      addMesh(parent, new THREE.CylinderGeometry(rIn, rIn, h, segs, 1, true, thetaStart, thetaLength), mat, [0, yMid, 0]);
    }

    buildRingWall(yawTurretArmor, R_TURRET_IN, R_TURRET_OUT, Y_DECK, 1.48, 0, Math.PI * 2, matTurretArmor, 40);
    buildRingWall(yawTurretArmor, R_TURRET_IN, R_TURRET_OUT, 1.90, Y_DECK + H_TURRET, 0, Math.PI * 2, matTurretArmor, 40);
    // Taret zırh duvarının üst ve alt halka kapakları (yalnızca rIn..rOut arası et kalınlığını kapatır, taret ortası açıktır)
    addMesh(yawTurretArmor, new THREE.RingGeometry(R_TURRET_IN, R_TURRET_OUT, 40), matTurretArmor, [0, Y_DECK + H_TURRET, 0], [-Math.PI / 2, 0, 0]);
    addMesh(yawTurretArmor, new THREE.RingGeometry(R_TURRET_IN, R_TURRET_OUT, 40), matTurretArmor, [0, Y_DECK + 0.01, 0], [-Math.PI / 2, 0, 0]);
    // Orta kuşak: ön lombar bölgesi (-0,48 .. +0,48 rad) hariç 305° zırh duvarı
    buildRingWall(yawTurretArmor, R_TURRET_IN, R_TURRET_OUT, 1.48, 1.90, 0.48, Math.PI * 2 - 0.96, matTurretArmor, 36);
    // İki lombar arasındaki merkez zırh dikmesi (-0,15 .. +0,15 rad)
    buildRingWall(yawTurretArmor, R_TURRET_IN, R_TURRET_OUT, 1.48, 1.90, -0.15, 0.30, matTurretArmor, 10);

    // X-Ray modunda görünen 8 eşmerkezli (8 × 1 inç) dövme demir katman halkaları (Taret üst kesitinde)
    for (let layer = 1; layer < 8; layer++) {
      const rL = R_TURRET_IN + (layer / 8) * (R_TURRET_OUT - R_TURRET_IN);
      const ringGeo = new THREE.RingGeometry(rL - 0.004, rL + 0.004, 40);
      addMesh(yawTurretArmor, ringGeo, matInnerLamination, [0, Y_DECK + H_TURRET + 0.002, 0], [-Math.PI / 2, 0, 0]);
    }

    // Dış yüzeyde perçin/cıvata kuşak çemberleri ve Hampton Roads gülle çukuru (battle dent)
    addMesh(yawTurretArmor, new THREE.TorusGeometry(R_TURRET_OUT + 0.008, 0.015, 8, 40), matTurretArmor, [0, Y_DECK + 0.08, 0], [Math.PI / 2, 0, 0]);
    addMesh(yawTurretArmor, new THREE.TorusGeometry(R_TURRET_OUT + 0.008, 0.015, 8, 40), matTurretArmor, [0, Y_DECK + H_TURRET - 0.06, 0], [Math.PI / 2, 0, 0]);

    // --- 2. Taret Üst Demiryolu Raylı Havalandırma Izgarası & Komutan Kapağı (partRoofGrating) ---
    addMesh(yawRoofGrating, new THREE.TorusGeometry(R_TURRET_IN - 0.04, 0.03, 8, 36), matDarkIron, [0, Y_DECK + H_TURRET - 0.04, 0], [Math.PI / 2, 0, 0]);
    for (let i = -5; i <= 5; i++) {
      const xRail = i * 0.20;
      const halfSpan = Math.sqrt(Math.max(0.1, (R_TURRET_IN - 0.06) ** 2 - xRail * xRail)) * 1.92;
      addMesh(yawRoofGrating, new THREE.BoxGeometry(0.038, 0.045, halfSpan), matDarkIron, [xRail, Y_DECK + H_TURRET - 0.03, 0]);
    }
    // Üst komutan gözetleme siperi ve sürgülü zırh kapağı
    addMesh(yawRoofGrating, new THREE.BoxGeometry(0.46, 0.12, 0.46), matDarkIron, [-0.36, Y_DECK + H_TURRET + 0.05, -0.25]);
    addMesh(yawRoofGrating, new THREE.BoxGeometry(0.50, 0.03, 0.50), matBrass, [-0.36, Y_DECK + H_TURRET + 0.12, -0.25]);

    // --- 3. Merkezi Dövme Demir Taret Mili (Spindle), Kaldırma Kaması & Gergi Kirişleri (partCenterSpindle) ---
    // Merkez mil (x = 0, z_yerel = 0, Y = 0,22 .. 2,40 m, r = 0,11 m)
    addMesh(yawCenterSpindle, new THREE.CylinderGeometry(0.105, 0.115, 2.18, 20), matSteelBright, [0, 1.31, 0]);
    // Omurga yatak göbeği ve taret kaldırma kaması (wedge key — Y = 0,26 m)
    addMesh(partCenterSpindle, new THREE.CylinderGeometry(0.22, 0.26, 0.18, 20), matBrass, [0, 0.26, TURRET_Z]);
    addMesh(partCenterSpindle, new THREE.BoxGeometry(0.52, 0.07, 0.14), matSteelBright, [0, 0.28, TURRET_Z]);
    // Taret tabanı merkez göbek bileziği (Y = 1,26 m) ve üst tavan yatağı (Y = 2,34 m)
    addMesh(yawCenterSpindle, new THREE.CylinderGeometry(0.22, 0.24, 0.14, 20), matBrass, [0, 1.26, 0]);
    addMesh(yawCenterSpindle, new THREE.CylinderGeometry(0.18, 0.18, 0.10, 20), matBrass, [0, 2.34, 0]);
    // Mil üstünden taret taban çemberine inen 4 diyagonal gergi çubuğu (top kundaklarına çarpmaması için X=0 ve Z=0 düzlemlerinde)
    for (let a = 0; a < 4; a++) {
      const ang = a * (Math.PI / 2);
      const rMid = 0.62;
      addMesh(
        yawCenterSpindle,
        new THREE.CylinderGeometry(0.022, 0.022, 1.32, 8),
        matDarkIron,
        [Math.sin(ang) * rMid, 1.78, Math.cos(ang) * rMid],
        [Math.cos(ang) * 0.68, 0, -Math.sin(ang) * 0.68]
      );
    }

    // --- 4. Güverte Altı Ana Dişli Çark & 2 Silindirli Yardımcı Taret Buhar Motoru (partTurretGears) ---
    // Ana dişli çark (R_BULL = 0,72 m, merkez (0, 0,72, TURRET_Z))
    const bullGearGrp = new THREE.Group();
    bullGearGrp.position.set(0, GEAR_Y, TURRET_Z);
    partTurretGears.add(bullGearGrp);
    addMesh(bullGearGrp, new THREE.CylinderGeometry(R_BULL, R_BULL, 0.08, 36), matBrass, [0, 0, 0]);
    addMesh(bullGearGrp, new THREE.CylinderGeometry(0.22, 0.22, 0.12, 20), matDarkIron, [0, 0, 0]);
    for (let t = 0; t < 32; t++) {
      const ang = (t / 32) * Math.PI * 2;
      addMesh(
        bullGearGrp,
        new THREE.BoxGeometry(0.042, 0.082, 0.048),
        matBrass,
        [Math.cos(ang) * R_BULL, 0, Math.sin(ang) * R_BULL],
        [0, -ang, 0]
      );
    }

    // Dikey pinyon dişlisi (R_PIN = 0,18 m, merkez (PINION_X = -0,90, GEAR_Y = 0,72, TURRET_Z = +0,35))
    // Tam temas noktası: x = -0,72 m (|PINION_X| = R_BULL + R_PIN = 0,72 + 0,18 = 0,90 m)
    const pinionGearGrp = new THREE.Group();
    pinionGearGrp.position.set(PINION_X, GEAR_Y, TURRET_Z);
    partTurretGears.add(pinionGearGrp);
    addMesh(pinionGearGrp, new THREE.CylinderGeometry(R_PIN, R_PIN, 0.09, 18), matSteelBright, [0, 0, 0]);
    for (let t = 0; t < 12; t++) {
      const ang = (t / 12) * Math.PI * 2;
      addMesh(
        pinionGearGrp,
        new THREE.BoxGeometry(0.036, 0.092, 0.040),
        matSteelBright,
        [Math.cos(ang) * R_PIN, 0, Math.sin(ang) * R_PIN],
        [0, -ang, 0]
      );
    }
    // Pinyon dikey mili (Y = 0,32 .. 0,82 m) ve alt 90° konik dişli çifti (Y = 0,42 m)
    addMesh(partTurretGears, new THREE.CylinderGeometry(0.045, 0.045, 0.52, 12), matSteelBright, [PINION_X, 0.56, TURRET_Z]);
    addMesh(partTurretGears, new THREE.ConeGeometry(0.13, 0.09, 18), matBrass, [PINION_X, 0.42, TURRET_Z], [Math.PI, 0, 0]);
    // Yatay tahrik mili (Z = -0,45 .. +0,35 m, X = -0,90 m, Y = 0,42 m) ve karşı 90° konik dişlisi
    const donkeyShaftGrp = new THREE.Group();
    donkeyShaftGrp.position.set(PINION_X, 0.42, -0.05);
    partTurretGears.add(donkeyShaftGrp);
    addMesh(donkeyShaftGrp, new THREE.CylinderGeometry(0.038, 0.038, 0.80, 12), matSteelBright, [0, 0, 0], [Math.PI / 2, 0, 0]);
    addMesh(donkeyShaftGrp, new THREE.ConeGeometry(0.13, 0.09, 18), matBrass, [0, 0, 0.28], [-Math.PI / 2, 0, 0]);
    // 2 silindirli yardımcı "donkey" taret buhar motoru (X = -0,90 m, Y = 0,44 m, Z = -0,52 m)
    addMesh(partTurretGears, new THREE.BoxGeometry(0.38, 0.26, 0.34), matDarkIron, [PINION_X, 0.36, -0.52]);
    addMesh(partTurretGears, new THREE.CylinderGeometry(0.08, 0.08, 0.24, 14), matBrass, [PINION_X - 0.09, 0.56, -0.46]);
    addMesh(partTurretGears, new THREE.CylinderGeometry(0.08, 0.08, 0.24, 14), matBrass, [PINION_X + 0.09, 0.56, -0.46]);

    // --- 5. Dövme Demir Sarkaçlı Lombar Kepenkleri (Pendulum Port Stoppers — partPortStoppers) ---
    // Üst mafsal: (x = ±GUN_X, y = 2,16 m, z_yerel = +1,15 m)
    // Açıkken: ±38° (±0,663 rad) yana açılır; Kapalıyken: 0° konumuna gelerek lombarları kapatır.
    const portStopperPivots = [];
    [-1, 1].forEach(side => {
      const piv = new THREE.Group();
      piv.position.set(side * GUN_X, 2.16, 1.15);
      piv.userData = { side };
      yawPortStoppers.add(piv);
      // Üst mafsal yatağı
      addMesh(yawPortStoppers, new THREE.BoxGeometry(0.14, 0.10, 0.14), matBrass, [side * GUN_X, 2.18, 1.15]);
      // Kranklı demir sarkaç kolu ve ağır lombar kapama bloğu (merkez Y = -0,50 m -> dünya Y = 1,66 m)
      addMesh(piv, new THREE.BoxGeometry(0.08, 0.52, 0.07), matDarkIron, [0, -0.24, 0]);
      addMesh(piv, new THREE.CylinderGeometry(0.18, 0.18, 0.10, 18), matDarkIron, [0, -0.50, 0.04], [Math.PI / 2, 0, 0]);
      addMesh(piv, new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12), matBrass, [0, -0.50, 0.05], [Math.PI / 2, 0, 0]);
      portStopperPivots.push(piv);
    });

    // --- 6 & 7. İskele (Sol) ve Sancak (Sağ) 11 İnç (279 mm) Dahlgren Topları (partLeftDahlgren / partRightDahlgren) ---
    // Dahlgren "soda şişesi" profili (LatheGeometry: yerel Y ekseni boyunca z_local = -0,42 .. +1,48 m, toplam boy 1,90 m)
    const dahlgrenPoints = [
      new THREE.Vector2(0.001, -0.42), // Kuyruk topuzu ucu (cascabel)
      new THREE.Vector2(0.065, -0.37), // Kuyruk topuzu boynu
      new THREE.Vector2(0.195, -0.28), // Kalın barut odası kuşağı
      new THREE.Vector2(0.215, -0.05), // Maksimum kuyruk çapı (Dahlgren şişe gövdesi)
      new THREE.Vector2(0.190, 0.25),  // Muylu önü geçişi
      new THREE.Vector2(0.145, 0.65),  // Konik namlu gövdesi
      new THREE.Vector2(0.122, 1.25),  // Namlu boynu
      new THREE.Vector2(0.138, 1.44),  // Namlu ağzı kabartması (muzzle swell)
      new THREE.Vector2(0.095, 1.48),  // Namlu ağzı ucu
      new THREE.Vector2(0.072, 1.48),  // Ø 279 mm namlu içi delik ağzı
      new THREE.Vector2(0.070, 1.20)   // Namlu içi
    ];
    const dahlgrenBarrelGeo = new THREE.LatheGeometry(dahlgrenPoints, 24);
    dahlgrenBarrelGeo.rotateX(Math.PI / 2); // +Z yönüne baksın (kuyruk z = -0,42 m, ağız z = +1,48 m)

    function buildDahlgrenAssembly(yawParent, xOffset) {
      // Kızak üzerinde ileri-geri kayan kundak grubu (slideCarriageGrp)
      const slideCarriageGrp = new THREE.Group();
      slideCarriageGrp.position.set(xOffset, 0, 0);
      yawParent.add(slideCarriageGrp);

      // Demir kutu kundak yan yanakları (x_local = ±0,15 m -> dünya |x| = 0,29 .. 0,59 m; merkezi milden 0,18 m uzakta!)
      [-1, 1].forEach(s => {
        addMesh(slideCarriageGrp, new THREE.BoxGeometry(0.045, 0.34, 0.76), matDarkIron, [s * 0.145, 1.48, 0.04]);
        addMesh(slideCarriageGrp, new THREE.CylinderGeometry(0.065, 0.065, 0.06, 14), matBrass, [s * 0.145, GUN_Y, 0.12], [0, 0, Math.PI / 2]);
      });
      // Kundak alt sürtünme tablası ve arka bağlantı kirişi
      addMesh(slideCarriageGrp, new THREE.BoxGeometry(0.32, 0.06, 0.78), matDarkIron, [0, 1.32, 0.04]);
      addMesh(slideCarriageGrp, new THREE.BoxGeometry(0.28, 0.16, 0.12), matBrass, [0, 1.44, -0.28]);

      // Namlu yükseliş mafsalı (barrelPivot — muylu merkezi Y = GUN_Y = 1,66 m, Z = +0,12 m)
      const barrelPivot = new THREE.Group();
      barrelPivot.position.set(0, GUN_Y, 0.12);
      slideCarriageGrp.add(barrelPivot);

      // Namlu (barrelPivot merkezine göre z = -0,12 m kaydırılarak batarya konumunda kuyruk z = -0,42 m, ağız z = +1,48 m olur)
      addMesh(barrelPivot, dahlgrenBarrelGeo, matDahlgren, [0, 0, -0.12]);
      // Muylular (trunnions)
      addMesh(barrelPivot, new THREE.CylinderGeometry(0.052, 0.052, 0.38, 14), matSteelBright, [0, 0, 0], [0, 0, Math.PI / 2]);
      // Kuyruk yükseliş vidası
      addMesh(slideCarriageGrp, new THREE.CylinderGeometry(0.022, 0.022, 0.28, 10), matBrass, [0, 1.50, -0.24]);

      // Efekt: Namlu ağzı alevi (addCADMesh DEĞİL, doğrudan THREE.Mesh)
      const flash = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.65, 12),
        new THREE.MeshBasicMaterial({ color: 0xffb703, transparent: true, opacity: 0 })
      );
      flash.rotation.x = Math.PI / 2;
      flash.position.set(0, 0, 1.68);
      barrelPivot.add(flash);

      return { slideCarriageGrp, barrelPivot, flash, xOffset };
    }

    const leftGun = buildDahlgrenAssembly(yawLeftDahlgren, -GUN_X);
    const rightGun = buildDahlgrenAssembly(yawRightDahlgren, +GUN_X);
    const dahlgrenGuns = [leftGun, rightGun];

    // --- 8. Taret İçi Sürtünmeli Demir Kızak Rayları, Fren Çarkları & Vinç (partRecoilSlides) ---
    // Taret taban plakası (merkezi mil delikli: R_in = 0,24 m, R_out = 1,26 m, Y = 1,22 m)
    addMesh(yawRecoilSlides, new THREE.CylinderGeometry(1.26, 1.26, 0.06, 36), matTimber, [0, 1.22, 0]);
    [-GUN_X, +GUN_X].forEach((gx, idx) => {
      const outerSign = idx === 0 ? -1 : 1;
      // Her topun altında 2 paralel dövme demir I-kiriş kızak rayı (z = -0,96 .. +0,98 m, Y = 1,275 m)
      [-0.13, +0.13].forEach(rx => {
        addMesh(yawRecoilSlides, new THREE.BoxGeometry(0.055, 0.055, 1.94), matDarkIron, [gx + rx, 1.275, 0.01]);
      });
      // Ön ve arka kızak traversleri (arka takoz z = -0,95 m; maksimum geri tepmede kundak z = -0,76 m'de durur, çakışmaz!)
      addMesh(yawRecoilSlides, new THREE.BoxGeometry(0.34, 0.08, 0.08), matBrass, [gx, 1.29, 0.96]);
      addMesh(yawRecoilSlides, new THREE.BoxGeometry(0.34, 0.08, 0.08), matBrass, [gx, 1.29, -0.95]);
      // Yan sürtünme freni sıkma çarkı ve dişli vinç kolu
      addMesh(yawRecoilSlides, new THREE.TorusGeometry(0.13, 0.018, 8, 18), matBrass, [gx + outerSign * 0.24, 1.46, 0.15], [0, Math.PI / 2, 0]);
      addMesh(yawRecoilSlides, new THREE.CylinderGeometry(0.025, 0.025, 0.14, 10), matSteelBright, [gx + outerSign * 0.20, 1.46, 0.15], [0, 0, Math.PI / 2]);
    });
    // Taret içi gülle kaldırma vinç askısı (sağ arka çeyrekte)
    addMesh(yawRecoilSlides, new THREE.CylinderGeometry(0.028, 0.028, 1.08, 10), matBrass, [0.88, 1.78, -0.45]);
    addMesh(yawRecoilSlides, new THREE.TorusGeometry(0.09, 0.02, 8, 16), matBrass, [0.88, 2.24, -0.45]);

    // --- 9. Su Altı Cephaneliği, 11 İnç Küresel Gülle Rafları & Barut Fıçıları (partShellMagazine) ---
    // Cephanelik tabanı ve meşe gülle rafları (z = +1,55 .. +2,75 m, Y = 0,24 .. 0,84 m)
    addMesh(partShellMagazine, new THREE.BoxGeometry(2.10, 0.06, 1.15), matTimber, [0, 0.24, 2.15]);
    [-0.68, 0.68].forEach(mx => {
      addMesh(partShellMagazine, new THREE.BoxGeometry(0.42, 0.42, 1.05), matTimber, [mx, 0.48, 2.15]);
      // 11 inç (Ø 0,26 m) küresel demir gülle dizisi
      for (let k = 0; k < 4; k++) {
        addMesh(partShellMagazine, new THREE.SphereGeometry(0.115, 14, 12), matDahlgren, [mx, 0.74, 1.76 + k * 0.25]);
      }
    });
    // Ortada bakır kapaklı 15 lb barut fıçıları (powder tanks)
    for (let k = 0; k < 3; k++) {
      addMesh(partShellMagazine, new THREE.CylinderGeometry(0.13, 0.13, 0.34, 14), matCopper, [-0.18 + k * 0.18, 0.44, 2.15]);
      addMesh(partShellMagazine, new THREE.CylinderGeometry(0.135, 0.135, 0.04, 14), matBrass, [-0.18 + k * 0.18, 0.62, 2.15]);
    }

    // --- 10. Üst Zırhlı Sal Güvertesi (Armored Raft), 5 İnç Zırh Kuşağı & Pirinç Halka (partArmoredDeck) ---
    // Sivri pruva (+Z = +5,20 m) ve sivri/yuvarlak kıç (-Z = -5,20 m) tekne profili (ExtrudeGeometry)
    function makeRaftShape(halfL, halfW, bowStart) {
      const sh = new THREE.Shape();
      sh.moveTo(0, halfL);
      sh.quadraticCurveTo(halfW * 0.85, bowStart + (halfL - bowStart) * 0.45, halfW, bowStart);
      sh.lineTo(halfW, -bowStart);
      sh.quadraticCurveTo(halfW * 0.85, -bowStart - (halfL - bowStart) * 0.45, 0, -halfL);
      sh.quadraticCurveTo(-halfW * 0.85, -bowStart - (halfL - bowStart) * 0.45, -halfW, -bowStart);
      sh.lineTo(-halfW, bowStart);
      sh.quadraticCurveTo(-halfW * 0.85, bowStart + (halfL - bowStart) * 0.45, 0, halfL);
      return sh;
    }

    const raftShape = makeRaftShape(5.20, 1.80, 3.10);
    // Taret altı dairesel güverte boşluğu (merkezi mil ve dişli çarkların görünmesi için)
    const turretHole = new THREE.Path();
    turretHole.absarc(0, TURRET_Z, 1.18, 0, Math.PI * 2, true);
    raftShape.holes.push(turretHole);

    const raftGeo = new THREE.ExtrudeGeometry(raftShape, { depth: 0.28, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 24 });
    raftGeo.rotateX(-Math.PI / 2); // XY düzleminden XZ düzlemine (Y = 0 .. 0,28 m)
    addMesh(partArmoredDeck, raftGeo, matDeckArmor, [0, 0.90, 0]);

    // Taret altı dökme pirinç güverte yatak halkası (brass deck ring — R = 1,42 m, Y = 1,19 m)
    addMesh(partArmoredDeck, new THREE.TorusGeometry(R_TURRET_OUT + 0.02, 0.032, 10, 44), matBrass, [0, Y_DECK + 0.01, TURRET_Z], [Math.PI / 2, 0, 0]);
    // Pruva ve kıç demir babalar (bollards)
    [-0.85, 0.85].forEach(bx => {
      addMesh(partArmoredDeck, new THREE.CylinderGeometry(0.05, 0.06, 0.16, 10), matDarkIron, [bx, Y_DECK + 0.08, 4.10]);
      addMesh(partArmoredDeck, new THREE.CylinderGeometry(0.05, 0.06, 0.16, 10), matDarkIron, [bx, Y_DECK + 0.08, -4.10]);
    });

    // --- 11. Alt Demir Tekne, Su Geçirmez Perdeler & Gizli Çapa Kuyusu (partLowerHull) ---
    // Alt demir tekne: sadece borda duvarları ve düz karina (üst yüzeyi açık ki X-Ray'de iç bölmeler görünsün!)
    const lowerOuterShape = makeRaftShape(3.90, 1.38, 2.35);
    const lowerInnerHole = makeRaftShape(3.74, 1.24, 2.22);
    lowerOuterShape.holes.push(lowerInnerHole);
    const lowerWallGeo = new THREE.ExtrudeGeometry(lowerOuterShape, { depth: 0.72, bevelEnabled: false, curveSegments: 20 });
    lowerWallGeo.rotateX(-Math.PI / 2);
    addMesh(partLowerHull, lowerWallGeo, matLowerHull, [0, 0.18, 0]);

    // Düz karina taban sacı (Y = 0,14 .. 0,18 m)
    const keelPlateShape = makeRaftShape(3.90, 1.38, 2.35);
    const keelPlateGeo = new THREE.ExtrudeGeometry(keelPlateShape, { depth: 0.04, bevelEnabled: false, curveSegments: 20 });
    keelPlateGeo.rotateX(-Math.PI / 2);
    addMesh(partLowerHull, keelPlateGeo, matLowerHull, [0, 0.14, 0]);

    // Enine su geçirmez bölmeler (bulkheads) ve iç omurga kirişi
    [-2.05, -0.65, 1.35, 2.85].forEach(bz => {
      addMesh(partLowerHull, new THREE.BoxGeometry(2.44, 0.68, 0.04), matDarkIron, [0, 0.52, bz]);
    });
    addMesh(partLowerHull, new THREE.BoxGeometry(0.14, 0.12, 7.40), matDarkIron, [0, 0.22, 0]);

    // Pruva zırhlı taşması altında gizli çapa kuyusu (anchor well, z = +4,25 m) ve 4 tırnaklı Monitor çapası
    addMesh(partLowerHull, new THREE.CylinderGeometry(0.32, 0.32, 0.42, 16), matDarkIron, [0, 0.76, 4.25]);
    addMesh(partLowerHull, new THREE.CylinderGeometry(0.035, 0.035, 0.48, 10), matSteelBright, [0, 0.52, 4.25]);
    addMesh(partLowerHull, new THREE.TorusGeometry(0.18, 0.03, 8, 14, Math.PI), matDarkIron, [0, 0.34, 4.25], [0, 0, Math.PI]);

    // Kuru havuz / müze meşe kızak blokları (Y = 0,000 .. 0,140 m -> min.y = 0,000 m tam zemin teması!)
    for (let kz = -3.2; kz <= 3.2; kz += 1.6) {
      addMesh(partLowerHull, new THREE.BoxGeometry(2.20, 0.14, 0.28), matTimber, [0, 0.07, kz]);
    }

    // --- 12. Pruva Kütük Tipi Zırhlı Kaptan Köşkü (Pilot House) & Deniz Yüzeyi (partPilotHouse) ---
    // 9×12 inç dövme demir kütüklerden oluşan kare kaptan köşkü (z = +3,45 m, Y = 1,18 .. 1,72 m)
    for (let b = 0; b < 4; b++) {
      const by = Y_DECK + 0.06 + b * 0.11;
      // 3. katmanda dar yatay gözetleme yarığı (sight slit)
      const hLog = b === 2 ? 0.075 : 0.105;
      addMesh(partPilotHouse, new THREE.BoxGeometry(0.76, hLog, 0.76), matTurretArmor, [0, by, 3.45]);
    }
    // Üst zırh plakası ve köşe cıvata başları
    addMesh(partPilotHouse, new THREE.BoxGeometry(0.82, 0.05, 0.82), matBrass, [0, Y_DECK + 0.50, 3.45]);
    // İç dümen dolabı
    addMesh(partPilotHouse, new THREE.TorusGeometry(0.14, 0.018, 8, 16), matBrass, [0, Y_DECK + 0.24, 3.55]);

    // Yarı saydam Hampton Roads su hattı yüzeyi (Y = 0,92 m)
    const waterMesh = addMesh(partPilotHouse, new THREE.PlaneGeometry(13.5, 6.2), matWater, [0, Y_WATER, 0], [-Math.PI / 2, 0, Math.PI / 2]);
    waterMesh.receiveShadow = false;
    waterMesh.castShadow = false;

    // --- 13. Ericsson "Titreşimli Manivela" (Vibrating-Lever) Ana Buhar Motoru (partSteamEngine) ---
    // Merkez: z = -2,85 m, Y = 0,52 m
    const ENG_Z = -2.85;
    // Ortadaki ikiz yatay silindir gövdesi (trunk cylinder)
    addMesh(partSteamEngine, new THREE.CylinderGeometry(0.28, 0.28, 1.08, 20), matDarkIron, [0, 0.56, ENG_Z], [0, 0, Math.PI / 2]);
    addMesh(partSteamEngine, new THREE.BoxGeometry(1.16, 0.14, 0.68), matDarkIron, [0, 0.26, ENG_Z]);
    addMesh(partSteamEngine, new THREE.CylinderGeometry(0.30, 0.30, 0.06, 20), matBrass, [-0.54, 0.56, ENG_Z], [0, 0, Math.PI / 2]);
    addMesh(partSteamEngine, new THREE.CylinderGeometry(0.30, 0.30, 0.06, 20), matBrass, [+0.54, 0.56, ENG_Z], [0, 0, Math.PI / 2]);

    // Sağ ve sol salınımlı "titreşimli manivela" kolları (rocker arms) ve biyel çubukları
    const engineRockers = [];
    [-1, 1].forEach(side => {
      const rPiv = new THREE.Group();
      rPiv.position.set(side * 0.76, 0.36, ENG_Z - 0.18);
      rPiv.userData = { side };
      partSteamEngine.add(rPiv);
      // Manivela yatak bloğu
      addMesh(partSteamEngine, new THREE.BoxGeometry(0.14, 0.18, 0.18), matBrass, [side * 0.76, 0.32, ENG_Z - 0.18]);
      // Dikey salınım kolu ve merkez krank miline uzanan biyel çubuğu
      addMesh(rPiv, new THREE.BoxGeometry(0.06, 0.44, 0.08), matSteelBright, [0, 0.18, 0]);
      addMesh(rPiv, new THREE.CylinderGeometry(0.025, 0.025, 0.72, 10), matSteelBright, [-side * 0.34, 0.22, -0.14], [0, side * 0.32, Math.PI / 2]);
      engineRockers.push(rPiv);
    });

    // Merkez pervane krankı ve volan (z = -3,18 m, Y = 0,48 m)
    const engineCrankGrp = new THREE.Group();
    engineCrankGrp.position.set(0, 0.48, -3.18);
    partSteamEngine.add(engineCrankGrp);
    addMesh(engineCrankGrp, new THREE.CylinderGeometry(0.24, 0.24, 0.07, 20), matBrass, [0, 0, 0], [Math.PI / 2, 0, 0]);
    addMesh(engineCrankGrp, new THREE.BoxGeometry(0.08, 0.36, 0.09), matSteelBright, [0, 0, 0.05]);

    // --- 14. 2 × Martin Su Borulu Kazan & Santrifüj Havalandırma Fanları (partBoilersBlower) ---
    // İki kazan (x = ±0,56 m, z = -1,25 m, Y = 0,54 m)
    [-0.56, 0.56].forEach(bx => {
      addMesh(partBoilersBlower, new THREE.BoxGeometry(0.76, 0.58, 1.12), matDarkIron, [bx, 0.52, -1.25]);
      // Kömür ateş kapakları (emissive turuncu kor)
      addMesh(partBoilersBlower, new THREE.BoxGeometry(0.46, 0.14, 0.04), matCoalFire, [bx, 0.36, -0.68]);
      // Üst pirinç buhar domları ve manometreler
      addMesh(partBoilersBlower, new THREE.CylinderGeometry(0.14, 0.14, 0.22, 16), matBrass, [bx, 0.88, -1.25]);
      // Bakır ana buhar borusu (kazanlardan arka motora uzanır)
      addMesh(partBoilersBlower, new THREE.CylinderGeometry(0.038, 0.038, 1.55, 10), matCopper, [bx * 0.65, 0.78, -2.02], [Math.PI / 2, 0, 0]);
    });
    // Santrifüj havalandırma fanları (blower fans — z = -2,05 m, x = ±0,82 m)
    [-0.82, 0.82].forEach(fx => {
      addMesh(partBoilersBlower, new THREE.CylinderGeometry(0.20, 0.20, 0.14, 18), matBrass, [fx, 0.46, -2.05], [0, 0, Math.PI / 2]);
    });

    // --- 15. 4 Kanatlı 9 ft Ericsson Dökme Demir Uskur, Şaft & Dengeli Dümen (partPropellerRudder) ---
    // Pervane şaftı (z = -3,18 .. -4,45 m, Y = 0,48 m)
    addMesh(partPropellerRudder, new THREE.CylinderGeometry(0.055, 0.055, 1.30, 14), matSteelBright, [0, 0.48, -3.82], [Math.PI / 2, 0, 0]);
    // Şaft askı yatağı
    addMesh(partPropellerRudder, new THREE.BoxGeometry(0.12, 0.38, 0.14), matDarkIron, [0, 0.68, -4.25]);

    // 4 kanatlı Ericsson uskuru (propellerSpinGrp — z = -4,45 m, Y = 0,48 m, Ø 0,80 m)
    const propellerSpinGrp = new THREE.Group();
    propellerSpinGrp.position.set(0, 0.48, -4.45);
    partPropellerRudder.add(propellerSpinGrp);
    addMesh(propellerSpinGrp, new THREE.CylinderGeometry(0.11, 0.09, 0.20, 16), matBrass, [0, 0, 0], [Math.PI / 2, 0, 0]);
    for (let b = 0; b < 4; b++) {
      const bAng = (b / 4) * Math.PI * 2;
      const bladeWrap = new THREE.Group();
      bladeWrap.rotation.z = bAng;
      propellerSpinGrp.add(bladeWrap);
      addMesh(bladeWrap, new THREE.BoxGeometry(0.14, 0.36, 0.028), matBrass, [0, 0.22, 0], [0, 0.42, 0]);
    }

    // Kıç dengeli demir dümen (rudderPivot — z = -4,82 m, Y = 0,52 m)
    const rudderPivot = new THREE.Group();
    rudderPivot.position.set(0, 0.52, -4.82);
    partPropellerRudder.add(rudderPivot);
    addMesh(rudderPivot, new THREE.CylinderGeometry(0.04, 0.04, 0.68, 10), matDarkIron, [0, 0.08, 0]);
    addMesh(rudderPivot, new THREE.BoxGeometry(0.05, 0.54, 0.46), matLowerHull, [0, -0.02, -0.14]);

    // ------------------------------------------------------------------------
    // 11 İNÇ KÜRESEL GÜLLE PARABOLİK UÇUŞ HAVUZU (Parça Grubu Dışı Efekt)
    // ------------------------------------------------------------------------
    const shellPool = [];
    const shellGeo = new THREE.SphereGeometry(0.12, 12, 10);
    for (let i = 0; i < 6; i++) {
      const sm = new THREE.Mesh(
        shellGeo,
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 })
      );
      sm.visible = false;
      sm.userData = { active: false, vel: new THREE.Vector3(), life: 0 };
      scene.add(sm);
      shellPool.push(sm);
    }

    // ------------------------------------------------------------------------
    // SİMÜLASYON DURUMU VE MEKANİK HESAPLAR
    // ------------------------------------------------------------------------
    const S = {
      rpm: 48,                  // Ericsson buhar motoru devri (0 - 80 RPM; gizli alt sınır yok!)
      turretYawDeg: 0,          // Döner taret açısı (-180° .. +180°)
      elevDeg: 4,               // 11 inç Dahlgren yükseliş açısı (-3° .. +12°)
      autoSteam: true,          // Buhar motoru & uskur tahriki açık
      autoTurretSweep: false,   // 360° otomatik taret tarama
      shuttersClosed: false,    // false = Lombar kepenkleri AÇIK (Atış Düzeni), true = Kepenkler KAPALI (Dolum Koruması)
      recoilProgress: 0,        // 0..1 ateşleme geri tepme sönümü
      slideOffset: 0,           // Topların kızak üzerinde geriye kayma mesafesi (0 .. MAX_RECOIL = 0,42 m)
      shutterOpenRatio: 1.0,    // 1,0 = ±38° açık, 0,0 = 0° kapalı
      enginePhase: 0,           // Buhar motoru krank/manivela fazı (rad)
      rudderTimer: 0,
      ammoCount: MAX_AMMO,      // 40 adet 11 inç gülle
      scheme: 'hampton1862',
      relief: true
    };

    function fireDahlgrenSalvo() {
      if (S.ammoCount <= 0) {
        S.ammoCount = MAX_AMMO;
        if (audio && audio.playClick) audio.playClick(520);
        return { ok: true, refill: true, msg: '<strong>📦 11 İnç Cephanelik İkmali Tamamlandı!</strong><br/>Su altı cephaneliğine 40 adet 11 inç (279 mm) küresel demir gülle ve 15 lb barut kesesi yüklendi.' };
      }
      if (S.shuttersClosed) {
        return {
          ok: false,
          msg: '<strong>🛡️ Sarkaçlı Lombar Kepenkleri Kapalı!</strong><br/>Toplar şu an dolum koruması için taret içine çekilmiş ve kepenkler kapalı durumda. Ateşlemek için sağ paneldeki <em>"Lombar Kepenkleri"</em> düğmesiyle kepenkleri açın.'
        };
      }

      const shotsFired = Math.min(2, S.ammoCount);
      S.ammoCount = Math.max(0, S.ammoCount - shotsFired);
      S.recoilProgress = 1.0;
      S.slideOffset = MAX_RECOIL;

      const yawRad = THREE.MathUtils.degToRad(S.turretYawDeg);
      const elevRad = THREE.MathUtils.degToRad(S.elevDeg);

      dahlgrenGuns.slice(0, shotsFired).forEach(g => {
        g.flash.material.opacity = 0.96;
        const sh = shellPool.find(s => !s.userData.active);
        if (sh) {
          // Namlu ağzı dünya konumu
          const localMuzzle = new THREE.Vector3(g.xOffset, GUN_Y + Math.sin(elevRad) * 1.48, 1.48 * Math.cos(elevRad));
          localMuzzle.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRad);
          localMuzzle.z += TURRET_Z;
          sh.position.copy(localMuzzle);

          const dir = new THREE.Vector3(
            Math.sin(yawRad) * Math.cos(elevRad),
            Math.sin(elevRad) + 0.08,
            Math.cos(yawRad) * Math.cos(elevRad)
          ).normalize();
          sh.userData.vel.copy(dir).multiplyScalar(22);
          sh.userData.life = 0;
          sh.userData.active = true;
          sh.visible = true;
        }
      });

      if (audio && audio.playCannonFire) audio.playCannonFire();
      return { ok: true };
    }

    function update(dt) {
      // 1. Ericsson Titreşimli Manivela Ana Buhar Motoru & 4 Kanatlı Uskur (RPM=0 ise tam duruş!)
      const activeRpm = S.autoSteam ? S.rpm : 0;
      const omegaEngine = (activeRpm * Math.PI * 2) / 60;
      S.enginePhase = (S.enginePhase + omegaEngine * dt) % (Math.PI * 2);

      // Uskur ve krank 1:1 döner
      propellerSpinGrp.rotation.z = S.enginePhase;
      engineCrankGrp.rotation.z = S.enginePhase;
      // Titreşimli manivelalar (rocker arms) ±0,36 rad (±20,6°) açıyla salınır
      engineRockers.forEach(rk => {
        rk.rotation.z = rk.userData.side * Math.sin(S.enginePhase) * 0.36;
      });

      // Hafif dümen salınımı (buhar tahriki açıkken)
      if (activeRpm > 0) {
        S.rudderTimer += dt;
        rudderPivot.rotation.y = Math.sin(S.rudderTimer * 0.9) * 0.14;
      }

      // 2. 360° Buharlı Döner Taret & Güverte Altı Dişli Çarklar (v = ω × r: ω_pin = -4,0 * ω_bull)
      if (S.autoTurretSweep) {
        S.turretYawDeg += dt * 28;
        if (S.turretYawDeg > 180) S.turretYawDeg -= 360;
      }
      const yawRad = THREE.MathUtils.degToRad(S.turretYawDeg);
      turretRotGroups.forEach(g => { g.rotation.y = yawRad; });
      bullGearGrp.rotation.y = yawRad;
      pinionGearGrp.rotation.y = -yawRad * (R_BULL / R_PIN); // -4,0 * yawRad
      donkeyShaftGrp.rotation.z = -yawRad * (R_BULL / R_PIN);

      // 3. 11 İnç Dahlgren Yükseliş, Sürtünmeli Kızak Geri Tepmesi ve Sarkaçlı Lombar Kepenkleri
      const elevRad = THREE.MathUtils.degToRad(S.elevDeg);
      dahlgrenGuns.forEach(g => {
        g.barrelPivot.rotation.x = -elevRad;
      });

      if (S.recoilProgress > 0) {
        S.recoilProgress = Math.max(0, S.recoilProgress - dt * 0.85);
        // İlk %25'te maksimum geri tepmede (0,42 m) kalır, sonra vinçle batarya konumuna sürülür
        const targetSlide = S.shuttersClosed ? RETRACT_DIST : (S.recoilProgress * MAX_RECOIL);
        S.slideOffset += (targetSlide - S.slideOffset) * Math.min(1, dt * 10);
        dahlgrenGuns.forEach(g => {
          g.flash.material.opacity = Math.max(0, (S.recoilProgress - 0.72) * 3.4);
        });
      } else {
        const targetSlide = S.shuttersClosed ? RETRACT_DIST : 0;
        S.slideOffset += (targetSlide - S.slideOffset) * Math.min(1, dt * 8);
        dahlgrenGuns.forEach(g => { g.flash.material.opacity = 0; });
      }

      dahlgrenGuns.forEach(g => {
        g.slideCarriageGrp.position.z = -S.slideOffset;
      });

      // Sarkaçlı kepenkler: açıkken ±38° (0,663 rad), kapalıyken (veya geri tepme ortasında) 0°
      const targetShutterOpen = S.shuttersClosed ? 0.0 : 1.0;
      S.shutterOpenRatio += (targetShutterOpen - S.shutterOpenRatio) * Math.min(1, dt * 9);
      const shutterAngle = S.shutterOpenRatio * THREE.MathUtils.degToRad(38);
      portStopperPivots.forEach(piv => {
        piv.rotation.z = piv.userData.side * shutterAngle;
      });

      // 4. 11 İnç Küresel Güllelerin Parabolik Balistik Uçuşu
      shellPool.forEach(sh => {
        if (!sh.userData.active) return;
        sh.userData.life += dt;
        sh.userData.vel.y -= 9.81 * dt * 0.45;
        sh.position.addScaledVector(sh.userData.vel, dt);
        if (sh.userData.life > 2.2 || sh.position.y < 0.1) {
          sh.userData.active = false;
          sh.visible = false;
        }
      });
    }

    // ------------------------------------------------------------------------
    // KAPLAMA VE KABARTMA YÖNETİMİ
    // ------------------------------------------------------------------------
    function applyTextures(blueprint) {
      const sc = SCHEMES[S.scheme];
      myMeshes.forEach(m => {
        const role = m.material.userData && m.material.userData.mnRole;
        if (!role) return;
        if (role === 'turret') {
          m.material.color.setHex(sc.turretIron);
          m.material.bumpMap = (!blueprint && S.relief) ? rivetBump : null;
          m.material.needsUpdate = true;
        } else if (role === 'deck') {
          m.material.color.setHex(sc.deckIron);
          m.material.bumpMap = (!blueprint && S.relief) ? rivetBump : null;
          m.material.needsUpdate = true;
        } else if (role === 'lower') {
          m.material.color.setHex(sc.lowerHull);
        } else if (role === 'gun') {
          m.material.color.setHex(sc.gunIron);
        } else if (role === 'brass') {
          m.material.color.setHex(sc.brass);
        } else if (role === 'timber') {
          m.material.color.setHex(sc.timber);
        } else if (role === 'water') {
          m.material.color.setHex(sc.water);
        }
        if (m.userData.origColor && role !== 'water') {
          m.userData.origColor.copy(m.material.color);
        }
      });
    }

    function setTexture(key) { if (SCHEMES[key]) S.scheme = key; }
    function toggleRelief() { S.relief = !S.relief; return S.relief; }

    // ------------------------------------------------------------------------
    // ADAPTÖR ARAYÜZÜ (simulator.html İle Tam Uyumlu)
    // ------------------------------------------------------------------------
    const ui = {
      title: '1862 USS MONITOR & ERİCSSON BUHARLI DÖNER TARET',
      sub: 'İlk Döner Taretli Zırhlı Savaş Gemisi (Ironclad) • 8×1 İnç Dövme Demir Taret • 2 × 11 İnç Dahlgren Topu • Titreşimli Manivela Motoru',
      partCount: '15 Ana Grup',
      texTitle: '🎨 1862 Amerikan İç Savaşı & Tersane Kaplaması',
      textures: Object.keys(SCHEMES).map(k => ({ key: k, label: SCHEMES[k].btn })),
      textureLabel: () => SCHEMES[S.scheme].label,
      activeTexture: () => S.scheme,
      reliefLabel: on => (on ? '🔩 8 Katmanlı Perçin & Zırh Plakası Dokusu: AÇIK' : '🔩 8 Katmanlı Perçin & Zırh Plakası Dokusu: KAPALI'),
      relief: () => S.relief,
      subsystems: [
        { key: 'turret_system', label: '8 Katmanlı Döner Taret, Mil & Buhar Dişlisi', color: '#f59e0b', count: 5 },
        { key: 'artillery', label: '2 × 11 İnç Dahlgren Topu, Kızak & Cephanelik', color: '#ef4444', count: 4 },
        { key: 'armored_hull', label: 'Zırhlı Sal Gövde, Kaptan Köşkü & Su Hattı', color: '#0284c7', count: 3 },
        { key: 'steam_propulsion', label: 'Ericsson Titreşimli Manivela Motoru & Uskur', color: '#10b981', count: 3 }
      ],
      camLabels: {
        iso: 'İzometrik',
        front: 'Taret & Köşk',
        breech: 'Taret İçi (X-Ray)',
        engine: 'Manivela Motoru',
        suspension: 'Taret Dişlisi',
        top: 'Üst Kesit'
      },
      sliders: [
        { label: 'Ericsson Buhar Motoru & Uskur Devri', min: 0, max: 80, step: 2, fmt: v => `${Math.round(v)} RPM` },
        { label: 'Ericsson Döner Taret Açısı (360°)', min: -180, max: 180, step: 1, fmt: v => `${Math.round(v)}°` },
        { label: '11 İnç Dahlgren Yükseliş Açısı', min: -3, max: 12, step: 0.5, fmt: v => `${v >= 0 ? '+' : ''}${v}°` }
      ],
      buttons: {
        terrain: '⚙️ Buhar Tahriki & Uskur',
        sweep: '🔄 360° Buharlı Taret Tarama',
        mode: true
      },
      fog: { near: 20, far: 58 },
      shadowExtent: 9.5,
      telemetryTag: 'ERICSSON IRONCLAD — 1862',
      statLabels: ['GEMİ HIZI / MOTOR', 'TARET & KEPENK', '11 İNÇ (279 MM) GÜLLE', 'TARET ZIRHI']
    };

    function modeLabel() {
      return S.shuttersClosed
        ? '🛡️ Lombar Kepenkleri: KAPALI (Toplar İçeride & Korumalı — Açmak İçin Tıkla)'
        : '🔓 Lombar Kepenkleri: AÇIK (Atış Düzeni — Dolum Korumasına Geç)';
    }

    function getSliderValues() {
      return [S.rpm, S.turretYawDeg, S.elevDeg];
    }

    function onSlider(index, val) {
      if (index === 0) {
        S.rpm = val;
        S.autoSteam = val > 0;
      } else if (index === 1) {
        S.autoTurretSweep = false;
        S.turretYawDeg = val;
      } else if (index === 2) {
        S.elevDeg = val;
      }
      return {};
    }

    function onButton(name) {
      if (name === 'terrain') {
        S.autoSteam = !S.autoSteam;
        if (S.autoSteam && S.rpm === 0) S.rpm = 48;
        return { active: S.autoSteam };
      }
      if (name === 'sweep') {
        S.autoTurretSweep = !S.autoTurretSweep;
        return { active: S.autoTurretSweep };
      }
      if (name === 'mode') {
        S.shuttersClosed = !S.shuttersClosed;
        if (S.shuttersClosed) {
          S.slideOffset = RETRACT_DIST;
          S.shutterOpenRatio = 0.0;
        } else {
          S.slideOffset = 0;
          S.shutterOpenRatio = 1.0;
        }
        const msg = S.shuttersClosed
          ? '<strong>🛡️ Sarkaçlı Lombar Kepenkleri Kapatıldı (Dolum Koruması)!</strong><br/>İki 11 inç Dahlgren topu kızaklar üzerinde 0,36 m içeri çekildi ve ağır demir sarkaç kepenkler lombarları düşman ateşine karşı kapattı.'
          : '<strong>🔓 Lombar Kepenkleri ±38° Açıldı (Atış Düzeni)!</strong><br/>Sarkaç kepenkler palangalarla yana çekildi ve 11 inç Dahlgren topları batarya konumuna sürüldü; ateşe hazır.';
        return { active: S.shuttersClosed, msg };
      }
      return {};
    }

    function buttonActive(name) {
      if (name === 'terrain') return S.autoSteam;
      if (name === 'sweep') return S.autoTurretSweep;
      if (name === 'mode') return S.shuttersClosed;
      return false;
    }

    function fireButtonLabel() {
      if (S.ammoCount <= 0) return '📦 11 İNÇ GÜLLE & BARUT İKMALİ (40 Adet)';
      if (S.shuttersClosed) return '🛡️ KEPENKLER KAPALI (Önce Lombarları Açın)';
      return '💥 2 × 11 İNÇ DAHLGREN ÇİFT SALVO ATEŞLE!';
    }

    function onFire() {
      return fireDahlgrenSalvo();
    }

    function getStats() {
      const activeRpm = S.autoSteam ? S.rpm : 0;
      const knots = ((activeRpm / 80) * 8.0).toFixed(1);
      const hp = Math.round((activeRpm / 80) * 320);
      return [
        `${knots} <span>Knot (${hp} BG)</span>`,
        `${Math.round(S.turretYawDeg)}° <span>${S.shuttersClosed ? '(Kepenk Kapalı)' : '(Açık)'}</span>`,
        `${S.ammoCount} <span>Adet (76 kg)</span>`,
        `203 <span>mm (8×1 inç)</span>`
      ];
    }

    function getStatus() {
      if (S.ammoCount <= 0) return { text: 'CEPHANELİK BOŞ — İKMAL GEREKLİ', color: '#d97706' };
      if (S.recoilProgress > 0.15) return { text: 'GERİ TEPME & SÜRTÜNME FRENİ', color: '#ef4444' };
      if (S.shuttersClosed) return { text: 'DOLUM KORUMASI (KEPENK KAPALI)', color: '#0284c7' };
      return { text: 'BATARYA KONUMUNDA — ATEŞE HAZIR', color: '#10b981' };
    }

    const camPresets = {
      iso: { pos: [6.4, 3.6, 6.2], look: [0, 1.2, 0.4] },
      front: { pos: [2.2, 2.2, 6.4], look: [0, 1.4, 1.5] },
      breech: { pos: [0.0, 3.8, -2.2], look: [0, 1.55, 0.35] },
      engine: { pos: [-3.4, 2.1, -3.6], look: [0, 0.55, -2.9] },
      suspension: { pos: [-2.8, 1.6, 1.2], look: [-0.3, 0.72, 0.35] },
      top: { pos: [0.1, 10.5, 0.2], look: [0, 1.0, 0.0] }
    };

    const tourSteps = [
      {
        title: 'Genel Bakış: 1862 USS Monitor ("Sal Üzerinde Peynir Kutusu")',
        desc: '9 Mart 1862\'de Hampton Roads muharebesinde CSS Virginia ile karşılaşarak tarihin ilk zırhlı gemi (ironclad) düellosunu gerçekleştiren USS Monitor. Su hattının yalnızca 46 cm üzerinde yüzen zırhlı güverte ve ortadaki 360° döner taret, tüm modern savaş gemilerinin atasıdır.',
        explode: 0, cutaway: false, sub: 'all', cam: 'iso', part: partTurretArmor
      },
      {
        title: '8 Katmanlı (203 mm) Dövme Demir Taret ve Merkezi Mil',
        desc: 'X-Ray modunda taretin 8 eşmerkezli 1 inçlik demir plakadan oluşan katmanlı yapısını inceleyin. 120 tonluk taretin tüm ağırlığı güverteye değil, gemi omurgasına oturan Ø 9 inçlik merkezi dövme demir mile (Spindle) ve alt kaldırma kamasına biner.',
        explode: 0, cutaway: true, sub: 'turret_system', cam: 'breech', part: partCenterSpindle
      },
      {
        title: '2 × 11 İnç Dahlgren Topları, Sürtünmeli Kızaklar & Sarkaçlı Kepenkler',
        desc: 'Taret içinde yan yana duran iki adet 11 inç (279 mm) Dahlgren topu, sürtünmeli demir kızaklar üzerinde 0,42 m geri teper. Sağ paneldeki "Lombar Kepenkleri" düğmesiyle topları içeri çekip ağır sarkaçlı demir kepenklerin lombarları nasıl kapattığını deneyin!',
        explode: 0, cutaway: true, sub: 'artillery', cam: 'front', part: partPortStoppers
      },
      {
        title: 'Güverte Altı Buharlı Taret Dişli Çarkları (4:1 Oran)',
        desc: 'Merkezi mile bağlı R = 0,72 m ana dişli çark, 2 silindirli yardımcı "donkey" buhar motorunun sürdüğü r = 0,18 m dikey pinyonla kavraşır. Taret açısı kaydırıcısını oynatarak dişlilerin 4:1 oranla (v = ω × r) zıt yönde dönüşünü gözlemleyin.',
        explode: 0, cutaway: true, sub: 'turret_system', cam: 'suspension', part: partTurretGears
      },
      {
        title: 'Ericsson "Titreşimli Manivela" (Vibrating-Lever) Ana Buhar Motoru',
        desc: 'Kıç makine dairesinde John Ericsson\'un alçak tekneye sığdırmak için icat ettiği çift pistonlu yatay buhar motoru çalışır. İki yandaki manivela kolları (±20,6°) ileri-geri salınarak 4 kanatlı dökme demir uskuru 1:1 tahrik eder.',
        explode: 0, cutaway: true, sub: 'steam_propulsion', cam: 'engine', part: partSteamEngine
      },
      {
        title: 'Tam Teardown (%85): 15 Bağımsız Mekanik Grup',
        desc: '8 katmanlı taret zırhı, demiryolu raylı tavan ızgarası, merkezi mil ve kama, taret dişli çarkları, sarkaçlı kepenkler, iki adet 11 inç Dahlgren topu, sürtünmeli kızaklar, su altı cephaneliği, zırhlı sal güverte, alt demir tekne, kaptan köşkü, titreşimli manivela motoru, Martin kazanları ve 4 kanatlı uskur ayrılmış görünümde.',
        explode: 85, cutaway: false, sub: 'all', cam: 'iso', part: partTurretArmor
      }
    ];

    return {
      root, ui, camPresets, tourSteps,
      flashMesh: null,
      firePart: partLeftDahlgren,
      parts: {
        turretArmor: partTurretArmor,
        roofGrating: partRoofGrating,
        centerSpindle: partCenterSpindle,
        turretGears: partTurretGears,
        portStoppers: partPortStoppers,
        leftDahlgren: partLeftDahlgren,
        rightDahlgren: partRightDahlgren,
        recoilSlides: partRecoilSlides,
        shellMagazine: partShellMagazine,
        armoredDeck: partArmoredDeck,
        lowerHull: partLowerHull,
        pilotHouse: partPilotHouse,
        steamEngine: partSteamEngine,
        boilersBlower: partBoilersBlower,
        propellerRudder: partPropellerRudder
      },
      defaultPart: partTurretArmor,
      update, onSlider, onButton, buttonActive, onFire, fireButtonLabel, modeLabel,
      getSliderValues, getStats, getStatus,
      applyTextures, setTexture, toggleRelief
    };
=======
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.monitor = function (ctx) {
    const {THREE:T, scene, addCADMesh, createPartGroup} = ctx;
    const root = new T.Group(); root.visible = false; scene.add(root);
    const parts = {}, meshes = [], bolts = [];
    const S = {rpm:20, angle:0, port:100, auto:false, engine:true, phase:0, recoil:0, ammo:20, finish:'iron', relief:true};
    const iron = new T.MeshStandardMaterial({color:0x454d50, roughness:0.72, metalness:0.65});
    const brass = new T.MeshStandardMaterial({color:0xb68a43, roughness:0.45, metalness:0.7});
    const grainData=new Uint8Array(128*128*4);let grainSeed=719;
    for(let i=0;i<128*128;i++){grainSeed=(grainSeed*1664525+1013904223)>>>0;const v=110+(grainSeed>>>27);grainData.set([v,v,v,255],i*4);}
    const grain=new T.DataTexture(grainData,128,128,T.RGBAFormat);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(6,6);grain.needsUpdate=true;
    const wood = new T.MeshStandardMaterial({color:0x765237, roughness:0.95});
    iron.bumpMap=grain;iron.bumpScale=0.018;
    function group(id,name,sub,parent,pos,exp,desc,outer=false) {
      const g = createPartGroup({id:'mon_'+id,name,subsystem:sub,subLabel:sub==='turret'?'Taret':sub==='engine'?'Buhar Makinesi':'Gövde ve Güverte',basePos:pos,explodeVec:exp,desc,material:'Dövme demir / dökme demir / ahşap',weight:'Parça kütlesi modellenmedi',spec:'Eğitim amaçlı rekonstrüksiyon; iç yerleşim yaklaşık',location:'USS Monitor gövdesi ve makineleri',isOuterShell:outer});
      parent.add(g); parts[id]=g; return g;
    }
    function mesh(g,geo,mat,pos=[0,0,0],rot=[0,0,0]) {const m=addCADMesh(g,geo,mat,pos,rot);meshes.push(m);return m;}
    const box=(g,size,pos,mat=iron)=>mesh(g,new T.BoxGeometry(...size),mat,pos);
    const cyl=(g,r,h,pos,mat=iron,rot=[0,0,0])=>mesh(g,new T.CylinderGeometry(r,r,h,32),mat,pos,rot);
    // NOAA overall reference: 173 ft × 41 ft 6 in. Hull stations are reconstructed.
    const L = 52.73, W = 12.65, DECK = 3.35;
    const hullMat = new T.MeshStandardMaterial({color:0x302e2c,roughness:0.88,metalness:0.35});
    const deckMat = new T.MeshStandardMaterial({color:0x626765,roughness:0.85,metalness:0.5});
    deckMat.bumpMap=grain;deckMat.bumpScale=0.012;hullMat.bumpMap=grain;hullMat.bumpScale=0.02;
    const black = new T.MeshStandardMaterial({color:0x171e22,roughness:0.62,metalness:0.6});
    function outline(scale=1) {
      const shape=new T.Shape();
      shape.moveTo(0,L/2*scale);
      shape.bezierCurveTo(4.3*scale,25.4*scale,6.325*scale,19*scale,6.325*scale,13*scale);
      shape.lineTo(6.325*scale,-15*scale);
      shape.bezierCurveTo(6.3*scale,-22*scale,3.8*scale,-26.365*scale,0,-26.365*scale);
      shape.bezierCurveTo(-3.8*scale,-26.365*scale,-6.3*scale,-22*scale,-6.325*scale,-15*scale);
      shape.lineTo(-6.325*scale,13*scale);
      shape.bezierCurveTo(-6.325*scale,19*scale,-4.3*scale,25.4*scale,0,L/2*scale);
      return shape;
    }
    function slab(parent,scale,depth,y,mat,bevel=0) {
      const geo=new T.ExtrudeGeometry(outline(scale),{depth,bevelEnabled:bevel>0,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:24});
      geo.rotateX(-Math.PI/2); return mesh(parent,geo,mat,[0,y,0]);
    }
    function tube(parent,points,r,mat=iron){return mesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,r,8,false),mat);}
    function instances(parent,geo,mat,positions){
      const m=ctx.addInstancedMesh(parent,geo,mat,positions.length),o=new T.Object3D();
      positions.forEach((p,i)=>{o.position.set(...p);o.updateMatrix();m.setMatrixAt(i,o.matrix);});m.instanceMatrix.needsUpdate=true;meshes.push(m);return m;
    }
    const deck=group('deck','1. Zırhlı Güverte ve Bordalar','hull',root,[0,DECK,0],[0,3,0],'NOAA ölçüleriyle yaklaşık 52,73 m uzunluk ve 12,65 m genişlik. Alçak güverte, yuvarlatılmış uçlar ve borda çıkması.',true);
    slab(deck,1,0.12,0,deckMat);
    slab(deck,1,0.55,-0.55,iron);
    const floor=group('floor','2. Ahşap Alt Gövde ve Omurga','hull',root,[0,0,0],[0,-0.1,0],'Demir üst gövdenin altında kalan dar ahşap karina. Gövde istasyonları tarihsel görsellerden yaklaşık yeniden kurulmuştur.',true);
    slab(floor,0.85,1.8,0.65,hullMat,0.25);
    box(floor,[0.45,0.4,38],[0,0.2,0],wood);
    const beams=group('beams','3. İç Postalar ve Kemereler','hull',root,[0,0,0],[2,0,0],'Gövde içinde boyuna kirişler, postalar ve güverte taşıyıcıları.');
    for(const x of [-3.4,0,3.4])box(beams,[0.18,0.35,39],[x,2.7,0]);
    for(let z=-18;z<=18;z+=3){box(beams,[10,0.22,0.20],[0,2.95,z]);for(const x of [-4.9,4.9])box(beams,[0.2,1.8,0.2],[x,2,z]);}
    // Plate seams are shallow geometry, not a painted grid floating above the ship.
    const seams=[];for(let z=-20;z<=20;z+=2)for(const x of [-4,-2,0,2,4])seams.push([x,0.145,z]);
    instances(deck,new T.BoxGeometry(1.96,0.012,0.018),black,seams);
    const rivets=[];for(let z=-19;z<=19;z+=0.55)for(const x of [-5.9,5.9])rivets.push([x,0.16,z]);
    bolts.push(instances(deck,new T.SphereGeometry(0.045,6,4),iron,rivets));
    const pivot=new T.Group();pivot.position.y=3.48;root.add(pivot);
    const base=group('base','4. Taret Tabanı','turret',pivot,[0,0,0],[0,0.5,0],'Taret tabanı ve merkez mil desteği. Dönüş eğitim amacıyla yavaşlatılmıştır.');cyl(base,3.25,0.12,[0,0,0]);
    const shaft=group('shaft','5. Merkez Mil','turret',pivot,[0,0.55,0],[0,1,0],'Ericsson taretinin merkez desteği. Kaldırma düzeneği şematik gösterilir.');cyl(shaft,0.15,1.1,[0,0,0],brass);
    const shell=group('shell','6. Sekiz Katmanlı Demir Taret','turret',pivot,[0,1.35,0],[0,3.5,0],'NOAA: sekiz adet 1 inç demir tabaka, toplam yaklaşık 203 mm. İç çap yaklaşık 6,1 m; kapı ve bağlantı ayrıntıları sadeleştirilmiştir.',true);
    // Segment construction leaves two actual gun ports instead of solid walls behind the barrels.
    const R=3.15,N=80;
    for(let i=0;i<N;i++) {const a=i*2*Math.PI/N,x=Math.sin(a)*R,z=Math.cos(a)*R;const port=z>2.8&&Math.abs(Math.abs(x)-0.9)<0.42;
      const h=port?0.65:2.5;
      const m=box(shell,[0.26,h,0.203],[x,port?-0.925:0,z]);m.rotation.y=a;
      if(port){const top=box(shell,[0.26,0.65,0.203],[x,0.925,z]);top.rotation.y=a;}
      if(!port)for(const y of [-1.05,1.05]) {const b=mesh(shell,new T.SphereGeometry(0.045,6,4),iron,[x*1.035,y,z*1.035]);bolts.push(b);}
    }
    const roof=group('roof','7. Taret Tavanı','turret',pivot,[0,2.65,0],[0,5,0],'Sökülebilir tavan kesiti; X-Ray iç mekanizmaları görünür kılar.',true);cyl(roof,3.25,0.1,[0,0,0]);
    box(roof,[0.9,0.08,0.85],[0,0.11,-1.7],black);
    for(const x of [-0.30,0.30])tube(roof,[[x,0.15,-1.8],[x,0.3,-1.8],[x,0.3,-1.5],[x,0.15,-1.5]],0.025);
    for(const x of [-0.32,0.32])tube(shell,[[x,-1.2,-3.30],[x,1.3,-3.30]],0.035);
    for(let y=-1.1;y<1.3;y+=0.3)tube(shell,[[-0.32,y,-3.30],[0.32,y,-3.30]],0.025);
    const rails=group('rails','8. Top Kızakları','turret',pivot,[0,0.3,0],[0,0,2],'İki Dahlgren topunun temsili sürtünmeli kızakları. Hareket mesafesi tarihsel ölçüm değildir.');
    for(const x of [-0.9,0.9])for(const dx of [-0.28,0.28])box(rails,[0.12,0.2,3.5],[x+dx,0,0.65]);
    const guns=group('guns','9. İki XI-inç Dahlgren Topu','turret',pivot,[0,1.25,0],[0,0,3],'Mariners’ Museum: iki XI-inç Dahlgren topu. Görsel geri tepme 0,45 m; balistik hesaplanmaz.');
    const slides=[];
    for(const x of [-0.9,0.9]){const slide=new T.Group();slide.position.x=x;guns.add(slide);slides.push(slide);box(slide,[0.65,0.5,1.8],[0,-0.6,0.5],wood);
      const points=[[0,-1.2],[0.27,-1.2],[0.43,-0.9],[0.4,-0.3],[0.28,0.6],[0.23,2.15],[0.1397,2.15],[0.1397,1.5]].map(p=>new T.Vector2(...p));
      mesh(slide,new T.LatheGeometry(points,32),iron,[0,0,1.3],[Math.PI/2,0,0]);
      cyl(slide,0.13,0.85,[0,-0.1,0],iron,[0,0,Math.PI/2]);
    }
    const ports=group('ports','10. Lombar Kepenkleri','turret',pivot,[0,2.15,0],[0,1,2],'Ağır kepenkler top açıklıklarını korur. Sarkaç hareketi temsili; kapalıyken atış engellenir.');
    const shutters=[];for(const x of [-0.9,0.9]){const p=new T.Group();p.position.set(x,0,2.85);ports.add(p);box(p,[0.72,1.1,0.12],[0,-0.55,0]);shutters.push(p);}
    const drive=group('drive','11. Taret Dönüş Tahriki','turret',pivot,[0,0.3,-1.8],[0,0,-2],'Buharlı yardımcı tahrikin şematik gösterimi. Gerçek dişli oranı ve taret kaldırma kinematiği simüle edilmez.');box(drive,[0.8,0.4,0.6],[0,0,0],brass);cyl(drive,0.35,0.12,[0,0.3,0]);
    const engine=group('engine','12. Yatay Buhar Silindirleri','engine',root,[0,1.5,-10],[0,0,-3],'NOAA: yatay pistonlar makineyi su hattı altında tutar. Makine kıç bölümündedir; iç ölçüler kaynak görsellerine göre yaklaşık yeniden kurulmuştur.');
    for(const x of [-0.85,0.85])cyl(engine,0.25,0.85,[x,0,0],brass,[Math.PI/2,0,0]);
    const rods=group('rods','13. Piston Kolları','engine',root,[0,1.5,-9.4],[0,1,-2],'Yatay pistonların karşılıklı hareketi gösterilir; buhar basıncı veya güç hesabı yapılmaz.');const pistons=[];for(const x of [-0.85,0.85])pistons.push(cyl(rods,0.055,0.8,[x,0,0],iron,[Math.PI/2,0,0]));
    const crank=group('crank','14. Krank ve Volan','engine',root,[0,1.5,-8.9],[0,1,-1],'Şematik krank: piston hareketi ve mil dönüşü aynı gösterim fazını kullanır.');const wheel=mesh(crank,new T.TorusGeometry(0.35,0.05,8,32),iron);box(crank,[0.7,0.06,0.06],[0,0,0],brass);
    const pipe=group('pipe','15. Buhar Boruları','engine',root,[0,1.6,-10.7],[1,1,-2],'Buhar beslemesinin temsili boruları; kazanlardan makine dairesine bağlantı gösterilir; kondenserin içi modellenmez.');for(const x of [-0.85,0.85])cyl(pipe,0.07,1,[x,0,0],brass,[Math.PI/2,0,0]);
    const pilot=group('pilot','16. Zırhlı Kumanda Kabini','hull',root,[0,DECK+0.12,18],[0,2,2],'Pruvaya yakın alçak zırhlı kumanda kabini; dar yatay görüş aralıkları ve katmanlı demir duvarlar.');
    for(let i=0;i<5;i++)box(pilot,[2.25,0.18,2.0],[0,0.12+i*0.19,0],iron);
    box(pilot,[2.4,0.18,2.15],[0,1.35,0],iron);
    for(const x of [-1.04,1.04])box(pilot,[0.17,0.34,2],[x,1.12,0]);
    for(const z of [-0.91,0.91])box(pilot,[2.0,0.15,0.18],[0,1.23,z]);
    const fittings=group('fittings','17. Güverte Kapakları ve Bağlama Donanımı','hull',root,[0,DECK+0.12,0],[1,1,0],'Makine ve mürettebat erişim kapakları, bağlama babaları ve güverte havalandırması. Yerleşim yaklaşık.');
    for(const z of [-18,-13,-7,7,12]){box(fittings,[1.4,0.13,1.6],[0,0.1,z],black);box(fittings,[1.24,0.05,1.44],[0,0.19,z],iron);tube(fittings,[[-0.2,0.23,z],[0,0.38,z],[0.2,0.23,z]],0.035);}
    for(const z of [-20,20])for(const x of [-3.4,3.4]){box(fittings,[0.85,0.10,0.5],[x,0.05,z]);for(const dx of [-0.25,0.25]){cyl(fittings,0.12,0.4,[x+dx,0.3,z]);cyl(fittings,0.18,0.07,[x+dx,0.53,z]);}}
    const vents=group('vents','18. Bacalar ve Havalandırma Ağızları','hull',root,[0,DECK+0.12,-9],[0,2,-1],'Sökülebilir baca ve havalandırma donanımıyla seyir görünümü. Donanım savaş ve seyir durumuna göre değişirdi.');
    for(const x of [-1.25,1.25]){cyl(vents,0.42,2.25,[x,1.1,0],black);cyl(vents,0.50,0.12,[x,2.28,0],iron);cyl(vents,0.37,0.02,[x,2.35,0],black);}
    for(const x of [-2.1,2.1]){cyl(vents,0.30,1.5,[x,0.75,-5],iron);tube(vents,[[x,1.3,-5],[x,1.7,-5],[x,1.85,-4.55]],0.30,iron);cyl(vents,0.24,0.02,[x,1.85,-4.54],black,[Math.PI/2,0,0]);}
    const boats=group('boats','19. Filikalar ve Mataforalar','hull',root,[0,DECK+0.15,-5],[3,1,0],'Ahşap filikalar ve kaldırma mataforaları. Tekne formları ve askı düzeni fotoğraf referanslı rekonstrüksiyondur.');
    for(const side of [-1,1]){
      const shape=new T.Shape();shape.moveTo(0,-2.6);shape.bezierCurveTo(0.85,-1.8,0.85,1.8,0,2.6);shape.bezierCurveTo(-0.85,1.8,-0.85,-1.8,0,-2.6);
      const geo=new T.ExtrudeGeometry(shape,{depth:0.35,bevelEnabled:true,bevelThickness:0.12,bevelSize:0.10,bevelSegments:2,steps:1});geo.rotateX(-Math.PI/2);mesh(boats,geo,wood,[side*4.7,0.35,0]);
      const inner=new T.ShapeGeometry(shape);inner.rotateX(-Math.PI/2);const bed=mesh(boats,inner,black,[side*4.7,0.83,0]);bed.scale.set(0.8,1,0.9);
      for(const z of [-1.6,-0.6,0.6,1.6])box(boats,[1.0,0.08,0.22],[side*4.7,0.9,z],wood);
      for(const z of [-1.8,1.8]){tube(boats,[[side*3.8,0,z],[side*3.8,2.2,z],[side*4.5,2.4,z],[side*4.7,2.1,z]],0.07);tube(boats,[[side*4.7,2.1,z],[side*4.7,0.9,z]],0.02,wood);}
    }
    const steering=group('steering','20. Kıç Pervane ve Dümen','engine',root,[0,1.35,-23],[0,0,-3],'Tek pervane ve kıç dümeni. Pervane devri gösterim makinesine bağlıdır.');
    cyl(steering,0.14,5,[0,0,1.3],iron,[Math.PI/2,0,0]);
    const propeller=new T.Group();steering.add(propeller);propeller.position.z=-1.1;
    cyl(propeller,0.27,0.5,[0,0,0],brass,[Math.PI/2,0,0]);
    for(let i=0;i<4;i++){const a=i*Math.PI/2;const blade=mesh(propeller,new T.SphereGeometry(1,16,8),brass,[Math.sin(a)*0.55,Math.cos(a)*0.55,0]);blade.scale.set(0.32,0.68,0.07);blade.rotation.set(0,0.35,a);}
    box(steering,[0.12,1.4,1.2],[0,0,-2.1]);
    // Continuous propeller shaft and bearing pedestals in the aft machinery space.
    cyl(steering,0.12,10,[0,0,8.8],iron,[Math.PI/2,0,0]);
    for(const z of [5,9,13]){box(steering,[0.6,0.7,0.6],[0,-0.45,z]);cyl(steering,0.24,0.35,[0,0,z],brass,[Math.PI/2,0,0]);}
    const boilers=group('boilers','21. Kazanlar ve Makine Yatakları','engine',root,[0,1.35,-5],[0,2,-1],'İki kazan ve motor yatakları; tesisatın iç ayrıntıları yaklaşık, basınç hesabı yapılmaz.');
    for(const x of [-1.5,1.5]){cyl(boilers,0.7,3.0,[x,0,0],black,[Math.PI/2,0,0]);box(boilers,[1.8,0.25,3.3],[x,-0.75,0]);tube(boilers,[[x,0.7,0],[x,1.3,0],[x,1.3,-4]],0.09,brass);}
    for(const x of [-0.85,0.85])box(beams,[0.6,0.7,3.0],[x,0.8,-9.5]);
    const railings=group('railings','22. Güverte Emniyet Halatları','hull',root,[0,DECK+0.12,0],[0,1,0],'Seyir donanımındaki hafif dikmeler ve halatlar. Savaşta sökülebilen donanımlar tek bir seyir görünümünde birleştirilmiştir.');
    for(const side of [-1,1]){const pts=[];for(let z=-18;z<=18;z+=3){cyl(railings,0.035,0.75,[side*6.0,0.375,z],iron);pts.push([side*6.0,0.72,z]);}tube(railings,pts,0.018,wood);}
    function update(dt){dt=Math.max(0,Math.min(dt,0.05));if(S.engine)S.phase+=S.rpm*2*Math.PI/60*dt;if(S.auto)S.angle=(S.angle+8*dt)%360;pivot.rotation.y=S.angle*Math.PI/180;
      wheel.rotation.z=S.phase;propeller.rotation.z=S.phase;pistons.forEach((p,i)=>p.position.z=Math.sin(S.phase+i*Math.PI)*0.15);shutters.forEach((p,i)=>p.rotation.z=(i?1:-1)*S.port/100*1.5);
      S.recoil=Math.max(0,S.recoil-dt);slides.forEach(p=>p.position.z=-0.45*Math.sin(Math.PI*S.recoil));}
    function onFire(){if(!S.ammo){S.ammo=20;return {ok:true,refill:true};}if(S.port<95||S.recoil>0)return {ok:false,msg:'Önce kepenkleri tamamen açın ve geri tepmenin bitmesini bekleyin.'};S.ammo-=2;S.recoil=1;ctx.audio?.playCannonFire();return {ok:true};}
    function applyTextures(blueprint){meshes.forEach(m=>{if(m.userData.origColor && m.material.metalness===0.65){m.material.color.setHex(S.finish==='iron'?0x454d50:0x785747);m.userData.origColor.copy(m.material.color);}m.material.wireframe=false;});bolts.forEach(b=>b.visible=S.relief);}
    const cams={iso:{pos:[43,31,49],look:[0,2,0]},front:{pos:[17,13,36],look:[0,3,8]},breech:{pos:[7,8,9],look:[0,4.7,0]},engine:{pos:[12,10,-17],look:[0,2,-8]},suspension:{pos:[9,6,-32],look:[0,2,-23]},top:{pos:[0.1,70,0],look:[0,1,0]}};
    const tourSteps=[['Genel Bakış: USS Monitor, 1862','Alçak bordalı tam gemi: pruvadaki kumanda kabini, merkez taret, kıç makineleri ve tek pervane.','iso',deck,false],['Katmanlı Demir Zırh','Sekiz kat bir inç demir; yaklaşık 203 mm toplam kalınlık.','front',shell,true],['Dahlgren Topları','İki XI-inç top ve temsili geri tepme kızakları.','breech',guns,true],['Kepenkler ve Taret','Kepenkleri açın; taret açısını kaydırıcıyla değiştirin.','top',ports,true],['Yatay Buhar Makinesi','Yatay pistonlar alçak makine dairesine uygundur. Bağlantılar şematiktir.','engine',engine,true],['Parçalarına Ayır','22 grup; gövde, seyir donanımı, taret ve makine dairesini ayrı inceleyin.','iso',base,false]].map((s,i)=>({title:s[0],desc:s[1],cam:s[2],part:s[3],cutaway:s[4],explode:i===5?65:0,sub:'all'}));
    const ui={title:'USS MONITOR — Ericsson Döner Taret (1862)',sub:'1862 zırhlı gemi • 52,73 × 12,65 m • Seyir donanımı, döner taret ve güverte altı makineleri',partCount:'22 Ana Grup',texTitle:'Demir Yüzey',textures:[{key:'iron',label:'Koyu Demir'},{key:'study',label:'Oksit Çalışması (temsili)'}],textureLabel:()=>S.finish==='iron'?'Koyu demir':'Temsili oksit',activeTexture:()=>S.finish,reliefLabel:on=>'Perçinler: '+(on?'AÇIK':'KAPALI'),relief:()=>S.relief,subsystems:[{key:'hull',label:'Gövde ve Güverte',color:'#64748b',count:8},{key:'turret',label:'Taret ve Toplar',color:'#b68a43',count:8},{key:'engine',label:'Makine ve Sevk',color:'#0284c7',count:6}],camLabels:{iso:'İzometrik',front:'Lombarlar',breech:'Top Kızakları',engine:'Buhar Makinesi',suspension:'Kıç ve Pervane',top:'Üst Kesit'},sliders:[{label:'Makine Gösterim Devri (temsili)',min:0,max:60,step:1,fmt:v=>v+' RPM'},{label:'Taret Açısı',min:0,max:360,step:1,fmt:v=>Math.round(v)+'°'},{label:'Lombar Kepenk Açıklığı',min:0,max:100,step:1,fmt:v=>'%'+v}],buttons:{terrain:'Buhar Makinesi Gösterimi',sweep:'Otomatik Taret Dönüşü'},telemetryTag:'USS MONITOR • 1862',statLabels:['GÖSTERİM DEVRİ','TARET AÇISI','GÖSTERİM MÜHİMMATI','TARET ZIRHI'],shadowExtent:40,fog:{near:100,far:180}};
    update(0);
    return {root,ui,camPresets:cams,tourSteps,parts,defaultPart:shell,firePart:guns,update,onFire,fireButtonLabel:()=>S.ammo?'İKİ TOP GÖSTERİMİ':'İKMAL (20)',getSliderValues:()=>[S.rpm,S.angle,S.port],onSlider:(i,v)=>{if(i===0)S.rpm=v;if(i===1){S.angle=v;S.auto=false;}if(i===2)S.port=v;update(0);return {};},onButton:n=>{if(n==='terrain')S.engine=!S.engine;if(n==='sweep')S.auto=!S.auto;return {};},buttonActive:n=>n==='terrain'?S.engine:S.auto,getStats:()=>[`${S.engine?S.rpm:0} <span>RPM</span>`,`${Math.round(S.angle)} <span>°</span>`,`${S.ammo} <span>Adet</span>`,'203 <span>mm</span>'],getStatus:()=>({text:S.recoil?'GERİ TEPME':S.port<95?'KEPENKLER KAPALI / KISMEN AÇIK':'GÖSTERİME HAZIR',color:'#0284c7'}),applyTextures,setTexture:k=>{if(['iron','study'].includes(k))S.finish=k;},toggleRelief:()=>{S.relief=!S.relief;return S.relief;}};
>>>>>>> 734ff246925d81fd6781dd8e9a0cf25945f2a2fc
  };
})();
