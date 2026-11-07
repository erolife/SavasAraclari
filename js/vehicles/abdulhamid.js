// ============================================================================
// 1886 OSMANLI ABDÜLHAMİD (NORDENFELT II) BUHARLI DENİZALTISI — js/vehicles/abdulhamid.js
// Erken Osmanlı denizaltıcılığı; torpido denemelerine ilişkin kaynak farkları turda açıklanır.
// 15 Bağımsız Mekanik Parça Grubu • 4 Alt Sistem • Lamm Kızgın Buhar & Dikey Dalış Pervaneleri
// ============================================================================
(function () {
  'use strict';

  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.abdulhamid = function (ctx) {
    const { THREE, scene, addCADMesh, createPartGroup } = ctx;

    // ------------------------------------------------------------------------
    // SAHNE ÖLÇEKLERİ VE TEMEL KOORDİNATLAR (1:2,5 Müze Kesit Ölçeği)
    // Gerçek Boy: 30,5 m (100 ft) • En: 3,66 m (12 ft) • Deplasman: ~100 Ton
    // Sahne Boyu: 12,20 m (z = -6,10 .. +6,10 m) • Gövde Çapı: 1,48 m (R_MAX = 0,74 m)
    // ------------------------------------------------------------------------
    const Y_HULL = 1.25;         // Puro gövde merkez ekseni yüksekliği (m)
    const R_MAX = 0.74;          // Orta silindirik gövde dış yarıçapı (m)
    const R_IN = 0.69;           // İç gövde yarıçapı (m)
    const Z_BOW = 6.10;          // Pruva ucu (m)
    const Z_STERN = -6.10;       // Kıç ucu (m)
    const Y_SHAFT = 1.05;        // Ana pervane ve buhar makinesi şaft ekseni (m)
    const Z_ENGINE = -1.65;      // 250 BG bileşik buhar makinesi merkezi (m)
    const Z_BOILER = -0.35;      // Kömürlü deniz kazanı ve teleskopik baca merkezi (m)
    const Z_CUPOLA = 0.85;       // Cam kubbeli komutan kulesi merkezi (m)
    const Z_VERT_FWD = 4.25;     // Baş dikey dalış pervanesi kuyusu (m)
    const Z_VERT_AFT = -4.25;    // Kıç dikey dalış pervanesi kuyusu (m)
    const R_BEVEL_MAIN = 0.14;   // Ana şaft üzerindeki konik dişli yarıçapı (m)
    const R_BEVEL_VERT = 0.07;   // Dikey dalış mili pinyon konik dişli yarıçapı (m) — 1:2 oran (90°)

    // Gövde puro (cigar) yarıçap profili r(z)
    function hullRadiusAtZ(z) {
      const az = Math.abs(z);
      if (az <= 2.20) return R_MAX;
      const t = Math.min(1, (az - 2.20) / (Z_BOW - 2.20));
      // Yumuşak parabolik/eliptik puro daralması (uçlarda r = 0,08 m)
      return R_MAX * (1 - 0.89 * Math.pow(t, 1.65));
    }

    // ------------------------------------------------------------------------
    // 4 TARİHSEL BOYA VE KAPLAMA ŞEMASI
    // ------------------------------------------------------------------------
    const SCHEMES = {
      taskizak1886: {
        name: '⚓ Koyu demir ve kırmızı karina · temsili',
        hullUpper: 0x2b343b,
        hullLower: 0x6b261f,
        deckIron: 0x1f262b,
        interior: 0x475569,
        brass: 0xc8963e,
        copper: 0xb45309,
        timber: 0x6d4c33,
        water: 0x0e7490
      },
      sarayburnu1888: {
        name: '💥 Kömür ve tuz patinası · temsili',
        hullUpper: 0x1e2429,
        hullLower: 0x52211b,
        deckIron: 0x161b20,
        interior: 0x3b4654,
        brass: 0xb5832e,
        copper: 0x9a3412,
        timber: 0x583e28,
        water: 0x0369a1
      },
      barrow1886: {
        name: '⚙️ Fabrika grisi ve pirinç · temsili',
        hullUpper: 0x434d56,
        hullLower: 0x333c44,
        deckIron: 0x2e363d,
        interior: 0x64748b,
        brass: 0xd9a441,
        copper: 0xc2651a,
        timber: 0x7c583c,
        water: 0x0284c7
      },
      deniz_muzesi: {
        name: '🏛️ Siyah ve altın sergi yorumu · temsili',
        hullUpper: 0x1c2024,
        hullLower: 0x7f1d1d,
        deckIron: 0x272c33,
        interior: 0x526071,
        brass: 0xeab308,
        copper: 0xd97706,
        timber: 0x855836,
        water: 0x0891b2
      }
    };

    function makeRivetBumpTexture() {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const g = c.getContext('2d');
      g.fillStyle = '#808080';
      g.fillRect(0, 0, 256, 256);
      g.strokeStyle = '#555555';
      g.lineWidth = 2;
      for (let y = 32; y < 256; y += 64) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(256, y);
        g.stroke();
      }
      for (let x = 32; x < 256; x += 64) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, 256);
        g.stroke();
      }
      g.fillStyle = '#dcdcdc';
      for (let y = 10; y < 256; y += 16) {
        for (let x = 10; x < 256; x += 16) {
          if ((x - 32) % 64 === 0 || (y - 32) % 64 === 0) {
            g.beginPath();
            g.arc(x, y, 2.5, 0, Math.PI * 2);
            g.fill();
          }
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 2);
      return tex;
    }

    const rivetBump = makeRivetBumpTexture();
    const myMeshes = [];

    function makeMat(colorHex, rough, metal, role, isOuter = false, extra = {}) {
      const m = new THREE.MeshStandardMaterial(Object.assign({
        color: colorHex,
        roughness: rough,
        metalness: metal,
        bumpMap: (role === 'hullUpper' || role === 'hullLower' || role === 'deck') ? rivetBump : null,
        bumpScale: 0.015
      }, extra));
      m.userData = { abRole: role, isOuter: !!isOuter };
      return m;
    }

    const matHullUpper = makeMat(SCHEMES.taskizak1886.hullUpper, 0.52, 0.72, 'hullUpper', true, { side: THREE.DoubleSide });
    const matHullLower = makeMat(SCHEMES.taskizak1886.hullLower, 0.58, 0.62, 'hullLower', true, { side: THREE.DoubleSide });
    const matDeckIron = makeMat(SCHEMES.taskizak1886.deckIron, 0.50, 0.75, 'deck', false);
    const matInterior = makeMat(SCHEMES.taskizak1886.interior, 0.55, 0.65, 'interior', false);
    const matDarkIron = makeMat(0x20262c, 0.46, 0.78, 'iron', false);
    const matSteelBright = makeMat(0x94a3b8, 0.26, 0.88, 'steel', false);
    const matBrass = makeMat(SCHEMES.taskizak1886.brass, 0.28, 0.86, 'brass', false);
    const matCopper = makeMat(SCHEMES.taskizak1886.copper, 0.32, 0.82, 'copper', false);
    const matTimber = makeMat(SCHEMES.taskizak1886.timber, 0.78, 0.08, 'timber', false);
    const matFireGlow = makeMat(0xea580c, 0.35, 0.10, 'fire', false, {
      emissive: new THREE.Color(0xc2410c),
      emissiveIntensity: 0.70
    });
    const matHotSteam = makeMat(0x38bdf8, 0.30, 0.25, 'steam', false, {
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.35
    });
    const matGlass = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.12,
      metalness: 0.15,
      transparent: true,
      opacity: 0.52
    });
    const matWater = new THREE.MeshStandardMaterial({
      color: SCHEMES.taskizak1886.water,
      roughness: 0.20,
      metalness: 0.15,
      transparent: true,
      opacity: 0.30,
      depthWrite: false
    });
    matWater.userData = { abRole: 'water', isWater: true };

    // ------------------------------------------------------------------------
    // KÖK GRUP VE 15 BAĞIMSIZ MEKANİK PARÇA GRUBU
    // ------------------------------------------------------------------------
    const root = new THREE.Group();
    root.name = 'abdulhamid_root';
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
        desc: cfg.desc + ' İç düzen, renkler ve hareket oranları yaklaşık sergi yorumudur; özgün imalat planı değildir.',
        material: cfg.mat,
        weight: cfg.weight,
        spec: cfg.spec,
        location: cfg.loc,
        basePos: [0, 0, 0],
        explodeVec: cfg.explode || [0, 1.2, 0],
        isOuterShell: !!cfg.isOuterShell
      });
      root.add(g);
      return g;
    }

    // --- ALT SİSTEM 1: PURO BİÇİMLİ PERÇİNLİ ÇELİK GÖVDE & KULE (hull_structure — 4 Grup) ---
    const partOuterHull = makePart({
      id: 'ab_outer_hull',
      name: '1. Puro Biçimli (Cigar-Shaped) Perçinli Dış Çelik Gövde Kabuğu',
      sub: 'ALT SİSTEM: PURO ÇELİK GÖVDE & KOMUTAN KULESİ',
      desc: 'George Garrett ve Thorsten Nordenfelt tarafından tasarlanan, uçlara doğru parabolik olarak sivrilen puro biçimli (cigar-shaped) perçinli çelik/demir tekne kabuğu. İngiltere\'de imal edilen plakalar 1886\'da İstanbul Taşkızak Tersanesi\'nde birleştirilmiştir. X-Ray modunda dış kabuk saydamlaşarak içteki Lamm sarnıçlarını ve buhar makinesini gösterir.',
      mat: '9,5 – 16 mm Perçinli Levha Demir/Çelik',
      weight: '~42 Ton (Gövde Kabuğu)',
      spec: 'Tam Boy 30,5 m (100 ft) • Çap 3,66 m (12 ft)',
      loc: 'Ana Tekne Dış Kabuğu (z = -6,10 .. +6,10 m)',
      subsystem: 'hull_structure',
      isOuterShell: true,
      explode: [0, 1.9, 0]
    });

    const partRibFrames = makePart({
      id: 'ab_rib_frames',
      name: '2. İç Çelik Halka Postalar (24 Adet), Omurga & Su Geçirmez Bölmeler',
      sub: 'ALT SİSTEM: PURO ÇELİK GÖVDE & KOMUTAN KULESİ',
      desc: 'Su altı basıncına karşı puro gövdeyi destekleyen L-kesitli dairesel çelik posta çemberleri, boyuna omurga kirişi, iç yürüme ızgaraları ve sarnıç/makine dairelerini ayıran su geçirmez perdeler.',
      mat: 'Dövme Demir L-Profil Postalar & Omurga Kirişi',
      weight: '~16 Ton',
      spec: '24 × Halka Posta • 4 Su Geçirmez Bölme',
      loc: 'İç Gövde İskeleti (Y = 0,55 .. 1,92 m)',
      subsystem: 'hull_structure',
      explode: [0, 0.5, 0]
    });

    const partConningCupola = makePart({
      id: 'ab_conning_cupola',
      name: '3. Cam Gözetleme Kubbeli Komutan Kulesi (Conning Cupola) & Kapak',
      sub: 'ALT SİSTEM: PURO ÇELİK GÖVDE & KOMUTAN KULESİ',
      desc: 'Gövde sırtında yükselen alçak zırhlı giriş/komutan kulesi ve üstündeki kalın cam gözetleme kubbesi. Komutan satıh seyrinde ve yarı dalışta pusula ile hedefi buradan takip eder, dalış öncesinde sızdırmaz üst kapak kilitlenirdi.',
      mat: 'Dövme Çelik Kule, Bronz Çerçeve & Kalın Mercek Cam',
      weight: '~1,4 Ton',
      spec: '360° Gözetleme Kubbesi • Sızdırmaz Giriş Kapağı',
      loc: 'Sırt Güvertesi Ön-Orta (z = +0,85 m)',
      subsystem: 'hull_structure',
      explode: [0, 2.5, 0.85]
    });

    const partKeelCradle = makePart({
      id: 'ab_keel_cradle',
      name: '4. Taşkızak Tersanesi Meşe Kızak Beşikleri & Haliç Su Yüzeyi',
      sub: 'ALT SİSTEM: PURO ÇELİK GÖVDE & KOMUTAN KULESİ',
      desc: '6 Eylül 1886\'da Haliç Taşkızak Tersanesi\'nde suya indirilen Abdülhamid denizaltısını taşıyan 5 adet ağır meşe kızak beşiği ve yarı saydam Haliç/Marmara su hattı düzlemi.',
      mat: 'Masif Meşe Kızak Kütükleri & Demir Bağlantılar',
      weight: '~6,5 Ton (Tersane Kızağı)',
      spec: 'Zemin Teması y = 0,000 m • Su Hattı Gösterimi',
      loc: 'Tersane Zemini (Y = 0,00 .. 0,55 m)',
      subsystem: 'hull_structure',
      explode: [0, -1.2, 0]
    });

    // --- ALT SİSTEM 2: LAMM KIZGIN BUHAR SARNIÇLARI, KAZAN & BUHAR MAKİNESİ (steam_lamm — 4 Grup) ---
    const partSteamBoiler = makePart({
      id: 'ab_steam_boiler',
      name: '5. Merkez Kömürlü Deniz Buhar Kazanı, Ocak & Teleskopik Duman Bacası',
      sub: 'ALT SİSTEM: LAMM KIZGIN BUHAR SİSTEMİ & MAKİNE',
      desc: 'Satıh seyrinde buhar üreten kömürlü İskoç tipi deniz kazanı ve sırt güvertesinden çıkan teleskopik duman bacası. Dalış emri verildiğinde kazan ocağı söndürülür, teleskopik baca gövde içine indirilir ve sızdırmaz baca kapağı kapatılır.',
      mat: 'Perçinli Kazan Çeliği, Ateş Tuğlası & Çelik Baca',
      weight: '~9,5 Ton',
      spec: '150 psi Buhar Basıncı • Teleskopik İndirilebilir Baca',
      loc: 'Gövde Merkezi (z = -0,35 m)',
      subsystem: 'steam_lamm',
      explode: [0, 1.8, -0.35]
    });

    const partLammCisterns = makePart({
      id: 'ab_lamm_cisterns',
      name: '6. Baş ve Kıç "Lamm" Kızgın Su / Buhar Biriktirme Sarnıçları',
      sub: 'ALT SİSTEM: LAMM KIZGIN BUHAR SİSTEMİ & MAKİNE',
      desc: 'Dalış sırasında önceden depolanan ısıdan yararlanma prensibini gösteren hazneler. İki haznenin boyutu ve konumu yaklaşık kesit yorumudur; özgün kapasite veya dalış süresi iddiası değildir.',
      mat: 'Perçinli Basınçlı Çelik Sarnıçlar & Bakır Buhar Boruları',
      weight: '~14 Ton (Dolu Sarnıçlar)',
      spec: 'Isı biriktirme prensibi · yaklaşık kesit',
      loc: 'Baş (z = +2,55 m) ve Kıç (z = -2,85 m) Bölmeleri',
      subsystem: 'steam_lamm',
      explode: [-1.6, 0.9, 0.5]
    });

    const partCompoundEngine = makePart({
      id: 'ab_compound_engine',
      name: '7. 250 BG Çift Silindirli Bileşik (Compound) Buhar Makinesi & Krank',
      sub: 'ALT SİSTEM: LAMM KIZGIN BUHAR SİSTEMİ & MAKİNE',
      desc: 'Yüksek ve alçak basınçlı iki dikey/eğimli silindire sahip 250 IHP gücünde tersinir bileşik (compound) buhar makinesi. Satıhta doğrudan kazandan, su altında ise Lamm kızgın su sarnıçlarından beslenerek ana pervane şaftını ve dikey dalış pervanelerini tahrik eder.',
      mat: 'Dökme Demir Silindirler, Dövme Çelik Krank & Bronz Yataklar',
      weight: '~6,8 Ton',
      spec: '250 IHP • Çift Silindir Bileşik • 0–90 RPM',
      loc: 'Kıç Makine Dairesi (z = -1,65 m)',
      subsystem: 'steam_lamm',
      explode: [1.6, 1.1, -1.65]
    });

    const partBallastPumps = makePart({
      id: 'ab_ballast_pumps',
      name: '8. Soğuk Su Balast Tankları, Buharlı Sintine Pompası & Manometreler',
      sub: 'ALT SİSTEM: LAMM KIZGIN BUHAR SİSTEMİ & MAKİNE',
      desc: 'Omurga altındaki soğuk su balast bölmeleri, buharlı pistonlu sintine/balast pompası, bakır valf kollektörü ve sarnıç basınç manometreleri. Denizaltı dalış öncesinde yalnız birkaç yüz kilogram pozitif yüzerlik kalacak şekilde balast alırdı.',
      mat: 'Bakır Borular, Pirinç Vanalar & Dökme Demir Pompa',
      weight: '~3,2 Ton',
      spec: 'Pozitif Yüzerlik Ayarı • Buharlı Balast Pompası',
      loc: 'Alt Omurga Bölmeleri (Y = 0,68 .. 1,02 m)',
      subsystem: 'steam_lamm',
      explode: [-1.4, -0.4, -0.8]
    });

    // --- ALT SİSTEM 3: ANA USKUR, DİKEY DALIŞ PERVANELERİ & DÜMENLER (propulsion_dive — 4 Grup) ---
    const partMainPropeller = makePart({
      id: 'ab_main_propeller',
      name: '9. Kıç 4 Kanatlı Ana Uskur (Pervane) & Ana Tahrik Şaftı',
      sub: 'ALT SİSTEM: ANA USKUR, DİKEY PERVANELER & DÜMEN',
      desc: 'Kıç uçta yer alan 4 kanatlı dökme bronz/demir ana uskur ve gövde boyunca uzanan ana tahrik şaftı. Buhar makinesi krankıyla 1:1 oranda döner; RPM = 0 olduğunda tamamen durur.',
      mat: 'Dökme Bronz 4 Kanatlı Uskur & Dövme Çelik Şaft',
      weight: '~2,4 Ton',
      spec: '1:1 Krank Tahriki • Satıhta ~6 Knot / Dalmış ~4 Knot',
      loc: 'Kıç Uç (z = -6,18 m, Y = 1,05 m)',
      subsystem: 'propulsion_dive',
      explode: [0, 0.2, -2.4]
    });

    const partVerticalScrews = makePart({
      id: 'ab_vertical_screws',
      name: '10. Baş ve Kıç Dikey Dalış Pervaneleri & 90° Konik Dişli Aktarması',
      sub: 'ALT SİSTEM: ANA USKUR, DİKEY PERVANELER & DÜMEN',
      desc: 'Nordenfelt denizaltısının en özgün mekanizması: tekne pozitif yüzerliğe sahip olduğu için su altına inmek ve derinliği korumak amacıyla baş (z = +4,25 m) ve kıç (z = -4,25 m) dikey kuyular içine yerleştirilmiş iki adet yatay/dikey çekiş pervanesi. Ana şafttan 90° konik dişli çiftiyle (R1 = 0,14 m / R2 = 0,07 m → 1:2 oran, v = ω × r) tahrik edilir; pervaneler durursa denizaltı kendiliğinden yüzeye çıkar.',
      mat: 'Bronz 3 Kanatlı Dikey Pervaneler & Çelik Konik Dişliler',
      weight: '~1,8 Ton',
      spec: '90° Konik Dişli (1:2 Hız Oranı) • Dikey Aşağı İtki',
      loc: 'Baş (z = +4,25 m) ve Kıç (z = -4,25 m) Dikey Kuyuları',
      subsystem: 'propulsion_dive',
      explode: [0, 2.2, 0]
    });

    const partSternRudder = makePart({
      id: 'ab_stern_rudder',
      name: '11. Kıç İstikamet Dümeni & Sarkaçlı Otomatik Derinlik Kanatları',
      sub: 'ALT SİSTEM: ANA USKUR, DİKEY PERVANELER & DÜMEN',
      desc: 'Kıçtaki dikey istikamet dümeni ile pruva ve kıç yanlarında bulunan yatay derinlik/yunuslama kanatları (hydroplanes). Garrett ve Nordenfelt, boyuna yunuslama açısını dengelemek için sarkaç ağırlıklı bir mekanizma kullanmış ancak sıcak su ve torpido ağırlık değişimleri nedeniyle trim kontrolü çok zor kalmıştır.',
      mat: 'Perçinli Çelik Dümen Yaprakları & Bronz Mafsallar',
      weight: '~1,5 Ton',
      spec: '±25° İstikamet Dümeni • ±15° Yunuslama Kanatları',
      loc: 'Kıç Uç (z = -5,85 m) ve Pruva Yanları (z = +4,60 m)',
      subsystem: 'propulsion_dive',
      explode: [1.5, -0.2, -1.8]
    });

    const partControlLevers = makePart({
      id: 'ab_control_levers',
      name: '12. Komutan Kumanda Mahalli, Dikey Pervane Kavraması & Pusula',
      sub: 'ALT SİSTEM: ANA USKUR, DİKEY PERVANELER & DÜMEN',
      desc: 'Cam kubbeli komutan kulesinin hemen altında yer alan kumanda istasyonu: pirinç dümen çarkı, buhar gaz valfi kolu, dikey dalış pervaneleri kavrama kolu, derinlik manometresi ve sarkaçlı eğim göstergesi.',
      mat: 'Pirinç Dümen Çarkı, Çelik Kumanda Kolları & Cam Göstergeler',
      weight: '~480 kg',
      spec: 'Merkezi Komutan Kontrolü • Derinlik & Trim Göstergesi',
      loc: 'Kule Altı Kumanda Bölmesi (z = +0,85 m)',
      subsystem: 'propulsion_dive',
      explode: [1.5, 1.5, 0.85]
    });

    // --- ALT SİSTEM 4: BAŞ TORPİDO KOVANI, WHITEHEAD TORPİDOSU & TOPLAR (weapons_torpedo — 3 Grup) ---
    const partTorpedoTube = makePart({
      id: 'ab_torpedo_tube',
      name: '13. Pruva Üstü Harici 356 mm (14 İnç) Torpido Kovanı & Ön Kapak',
      sub: 'ALT SİSTEM: 356 MM TORPİDO KOVANI & GÜVERTE TOPLARI',
      desc: 'Pruva sırt güvertesi üzerine monte edilmiş Ø 356 mm (14 inç) çapında silindirik bronz/çelik torpido fırlatma kovanı ve menteşeli sızdırmaz ön kapağı. Kapak kapalıyken emniyet kilidi ateşlemeyi engeller; atış öncesinde kapak +75° yukarı açılır.',
      mat: 'Perçinli Çelik/Bronz Kovan & Menteşeli Ön Kapak',
      weight: '~1,9 Ton',
      spec: 'Ø 356 mm (14 inç) • +75° Açılır Ön Kapak Kilidi',
      loc: 'Pruva Üst Güvertesi (z = +3,55 .. +5,80 m, Y = 1,76 m)',
      subsystem: 'weapons_torpedo',
      explode: [0, 2.4, 2.2]
    });

    const partWhiteheadTorpedo = makePart({
      id: 'ab_whitehead_torpedo',
      name: '14. 356 mm Schwarzkopff / Whitehead Torpidosu (Sergi Rekonstrüksiyonu)',
      sub: 'ALT SİSTEM: 356 MM TORPİDO KOVANI & GÜVERTE TOPLARI',
      desc: 'Dönemin kendinden tahrikli torpidosunu temsil eder. Abdülhamid ve Abdülmecid denemelerine ilişkin ilk atış anlatıları kaynaklarda farklıdır. İki atışlık stok, yalnızca sergi etkileşimidir.',
      mat: 'Fosfor-Bronz / Çelik Gövde & Basınçlı Hava Motoru',
      weight: '2 × ~265 kg (1 Kovanda + 1 Yedek)',
      spec: 'Ø 356 mm • Boy ~4,5 m • 2 Adet Mühimmat',
      loc: 'Baş Kovan İçi (z = +4,65 m) ve İç Yedek Raf',
      subsystem: 'weapons_torpedo',
      explode: [0, 2.9, 3.2]
    });

    const partDeckGuns = makePart({
      id: 'ab_deck_guns',
      name: '15. Güverte Üstü 2 × 35 mm Nordenfelt Çabuk Ateşli Makineli Topları',
      sub: 'ALT SİSTEM: 356 MM TORPİDO KOVANI & GÜVERTE TOPLARI',
      desc: 'Komutan kulesinin önünde iskele ve sancak tarafına yerleştirilmiş iki adet 35 mm (1,4 inç) Nordenfelt çok namlulu/çabuk ateşli güverte savunma topu. Satıh seyrinde torpidobotlara karşı koruma sağlamak için tasarlanmıştır.',
      mat: 'Çelik Namlu, Bronz Kundak & Döner Kaide',
      weight: '2 × ~185 kg',
      spec: '2 × 35 mm Nordenfelt • Döner Güverte Kaidesi',
      loc: 'Ön Sırt Güvertesi (z = +1,85 m, x = ±0,34 m)',
      subsystem: 'weapons_torpedo',
      explode: [1.4, 2.4, 1.85]
    });

    // ========================================================================
    // GEOMETRİ İNŞASI
    // ========================================================================

    // --- 1. Puro Biçimli Perçinli Dış Çelik Gövde Kabuğu (partOuterHull) ---
    const HULL_SEGS = 28;
    for (let i = 0; i < HULL_SEGS; i++) {
      const z0 = Z_STERN + (i / HULL_SEGS) * (Z_BOW - Z_STERN);
      const z1 = Z_STERN + ((i + 1) / HULL_SEGS) * (Z_BOW - Z_STERN);
      const zMid = (z0 + z1) * 0.5;
      const dz = z1 - z0;
      const r0 = hullRadiusAtZ(z0);
      const r1 = hullRadiusAtZ(z1);

      // Üst yarı kabuk (koyu demir gri) ve alt yarı karina (kırmızı astar)
      const upperGeo = new THREE.CylinderGeometry(r1, r0, dz, 28, 1, true, Math.PI * 0.5, Math.PI);
      addMesh(partOuterHull, upperGeo, matHullUpper, [0, Y_HULL, zMid], [Math.PI / 2, 0, 0]);

      const lowerGeo = new THREE.CylinderGeometry(r1, r0, dz, 28, 1, true, -Math.PI * 0.5, Math.PI);
      addMesh(partOuterHull, lowerGeo, matHullLower, [0, Y_HULL, zMid], [Math.PI / 2, 0, 0]);

      // Her 2 segmentte bir dış perçin kuşağı
      if (i > 0 && i % 2 === 0) {
        addMesh(partOuterHull, new THREE.TorusGeometry(r0 + 0.006, 0.009, 6, 28), matHullUpper, [0, Y_HULL, z0]);
      }
    }
    // Pruva ve kıç uç konik kapakları
    addMesh(partOuterHull, new THREE.SphereGeometry(hullRadiusAtZ(Z_BOW), 16, 12), matHullUpper, [0, Y_HULL, Z_BOW]);
    addMesh(partOuterHull, new THREE.SphereGeometry(hullRadiusAtZ(Z_STERN), 16, 12), matHullLower, [0, Y_HULL, Z_STERN]);
    // Sırt üstü düz yürüme güvertesi şeridi (z = -3,60 .. +3,60 m)
    addMesh(partOuterHull, new THREE.BoxGeometry(0.56, 0.04, 7.20), matDeckIron, [0, Y_HULL + R_MAX + 0.01, 0]);

    // --- 2. İç Çelik Halka Postalar, Omurga & Su Geçirmez Bölmeler (partRibFrames) ---
    // Boyuna iç omurga kirişi
    addMesh(partRibFrames, new THREE.BoxGeometry(0.12, 0.09, 10.60), matInterior, [0, Y_HULL - R_IN + 0.05, 0]);
    // İç çalışma tabanı / ızgara platformu
    addMesh(partRibFrames, new THREE.BoxGeometry(0.88, 0.035, 8.80), matInterior, [0, Y_HULL - 0.34, 0]);
    // 24 adet dairesel çelik posta çemberi
    for (let i = 1; i <= 24; i++) {
      const zRib = Z_STERN + 0.45 + ((i - 1) / 23) * (Z_BOW - Z_STERN - 0.90);
      const rRib = Math.max(0.16, hullRadiusAtZ(zRib) - 0.045);
      addMesh(partRibFrames, new THREE.TorusGeometry(rRib, 0.018, 6, 24), matInterior, [0, Y_HULL, zRib]);
    }
    // 4 adet su geçirmez bölme halkası (bulkheads)
    [-3.65, -0.95, 1.55, 3.65].forEach(zBulk => {
      const rB = Math.max(0.25, hullRadiusAtZ(zBulk) - 0.04);
      addMesh(partRibFrames, new THREE.RingGeometry(0.28, rB, 24), matInterior, [0, Y_HULL, zBulk]);
    });

    // --- 3. Cam Gözetleme Kubbeli Komutan Kulesi & Kapak (partConningCupola) ---
    const Y_CUPOLA_BASE = Y_HULL + R_MAX + 0.02;
    addMesh(partConningCupola, new THREE.CylinderGeometry(0.28, 0.32, 0.36, 20), matDeckIron, [0, Y_CUPOLA_BASE + 0.18, Z_CUPOLA]);
    addMesh(partConningCupola, new THREE.TorusGeometry(0.29, 0.024, 8, 20), matBrass, [0, Y_CUPOLA_BASE + 0.36, Z_CUPOLA], [Math.PI / 2, 0, 0]);
    // Cam gözetleme kubbesi ve pirinç koruma kafesi
    addMesh(partConningCupola, new THREE.SphereGeometry(0.25, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), matGlass, [0, Y_CUPOLA_BASE + 0.36, Z_CUPOLA]);
    for (let a = 0; a < 4; a++) {
      const ang = (a / 4) * Math.PI;
      addMesh(partConningCupola, new THREE.TorusGeometry(0.255, 0.010, 6, 16, Math.PI), matBrass, [0, Y_CUPOLA_BASE + 0.36, Z_CUPOLA], [0, ang, 0]);
    }
    // Yan lombar mercekleri
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2;
      addMesh(
        partConningCupola,
        new THREE.CylinderGeometry(0.045, 0.045, 0.04, 12),
        matBrass,
        [Math.sin(ang) * 0.30, Y_CUPOLA_BASE + 0.22, Z_CUPOLA + Math.cos(ang) * 0.30],
        [Math.PI / 2, 0, -ang]
      );
    }

    // --- 4. Taşkızak Tersanesi Meşe Kızak Beşikleri & Su Yüzeyi (partKeelCradle) ---
    // Zemin teması tam y = 0,000 m olacak şekilde alt kızak rayları ve 5 meşe beşik
    addMesh(partKeelCradle, new THREE.BoxGeometry(0.18, 0.12, 9.60), matTimber, [-0.52, 0.06, 0]);
    addMesh(partKeelCradle, new THREE.BoxGeometry(0.18, 0.12, 9.60), matTimber, [0.52, 0.06, 0]);
    [-3.80, -1.90, 0.0, 1.90, 3.80].forEach(zCradle => {
      const rH = hullRadiusAtZ(zCradle);
      const hBlock = Math.max(0.18, (Y_HULL - rH) - 0.10);
      addMesh(partKeelCradle, new THREE.BoxGeometry(1.45, hBlock, 0.32), matTimber, [0, 0.12 + hBlock * 0.5, zCradle]);
      // Yan takoz destekleri
      addMesh(partKeelCradle, new THREE.BoxGeometry(0.28, 0.26, 0.28), matTimber, [-0.52, 0.12 + hBlock + 0.08, zCradle], [0, 0, -0.35]);
      addMesh(partKeelCradle, new THREE.BoxGeometry(0.28, 0.26, 0.28), matTimber, [0.52, 0.12 + hBlock + 0.08, zCradle], [0, 0, 0.35]);
    });
    // Yarı saydam Haliç/Marmara su yüzeyi (Y = 1,55 m)
    const waterPlane = addMesh(partKeelCradle, new THREE.BoxGeometry(4.40, 0.02, 13.60), matWater, [0, 1.55, 0], [0, 0, 0], false);

    // --- 5. Merkez Kömürlü Deniz Buhar Kazanı & Teleskopik Duman Bacası (partSteamBoiler) ---
    // İskoç tipi yatay silindirik buhar kazanı (z = -0,35 m, Y = 1,22 m)
    addMesh(partSteamBoiler, new THREE.CylinderGeometry(0.46, 0.46, 1.45, 24), matDarkIron, [0, 1.22, Z_BOILER], [Math.PI / 2, 0, 0]);
    for (let b = -1; b <= 1; b++) {
      addMesh(partSteamBoiler, new THREE.TorusGeometry(0.468, 0.014, 8, 24), matBrass, [0, 1.22, Z_BOILER + b * 0.48]);
    }
    // Kazan ön ocak kapağı ve ateş parıltısı (satıh modunda parlar, dalış modunda söner)
    addMesh(partSteamBoiler, new THREE.CylinderGeometry(0.20, 0.20, 0.06, 16), matDarkIron, [0, 1.12, Z_BOILER + 0.74], [Math.PI / 2, 0, 0]);
    const furnaceFireMesh = addMesh(partSteamBoiler, new THREE.CylinderGeometry(0.15, 0.15, 0.07, 16), matFireGlow, [0, 1.12, Z_BOILER + 0.75], [Math.PI / 2, 0, 0], false);

    // Sırt baca kovanı ve teleskopik indirilebilir duman bacası
    addMesh(partSteamBoiler, new THREE.CylinderGeometry(0.17, 0.19, 0.34, 18), matDeckIron, [0, Y_HULL + R_MAX + 0.12, Z_BOILER]);
    const chimneyGrp = new THREE.Group();
    chimneyGrp.position.set(0, Y_HULL + R_MAX + 0.24, Z_BOILER); // chimneyLift = 1 iken y = 2,23 m
    partSteamBoiler.add(chimneyGrp);
    addMesh(chimneyGrp, new THREE.CylinderGeometry(0.125, 0.135, 0.64, 18), matDarkIron, [0, 0.16, 0]);
    addMesh(chimneyGrp, new THREE.TorusGeometry(0.135, 0.016, 8, 18), matBrass, [0, 0.47, 0], [Math.PI / 2, 0, 0]);

    // Baca üst sızdırmaz dalış kapağı (dalış modunda kapanır)
    const chimneyHatchPivot = new THREE.Group();
    chimneyHatchPivot.position.set(0, Y_HULL + R_MAX + 0.29, Z_BOILER - 0.18);
    partSteamBoiler.add(chimneyHatchPivot);
    addMesh(chimneyHatchPivot, new THREE.CylinderGeometry(0.18, 0.18, 0.035, 18), matBrass, [0, 0.02, 0.18]);

    // --- 6. Baş ve Kıç "Lamm" Kızgın Su / Buhar Biriktirme Sarnıçları (partLammCisterns) ---
    // Baş Lamm sarnıcı (z = +2,55 m) ve Kıç Lamm sarnıcı (z = -2,85 m)
    [2.55, -2.85].forEach(zCis => {
      const rC = Math.min(0.42, hullRadiusAtZ(zCis) - 0.16);
      addMesh(partLammCisterns, new THREE.CylinderGeometry(rC, rC, 1.35, 22), matCopper, [0, 1.24, zCis], [Math.PI / 2, 0, 0]);
      addMesh(partLammCisterns, new THREE.SphereGeometry(rC, 18, 12), matCopper, [0, 1.24, zCis + 0.675]);
      addMesh(partLammCisterns, new THREE.SphereGeometry(rC, 18, 12), matCopper, [0, 1.24, zCis - 0.675]);
      // Sarnıç üst buhar kubbesi (steam dome) ve pirinç çemberler
      addMesh(partLammCisterns, new THREE.CylinderGeometry(0.13, 0.15, 0.22, 16), matBrass, [0, 1.24 + rC + 0.06, zCis]);
      addMesh(partLammCisterns, new THREE.TorusGeometry(rC + 0.008, 0.014, 6, 22), matBrass, [0, 1.24, zCis - 0.35]);
      addMesh(partLammCisterns, new THREE.TorusGeometry(rC + 0.008, 0.014, 6, 22), matBrass, [0, 1.24, zCis + 0.35]);
    });
    // Sarnıçları kazana ve buhar makinesine bağlayan üst bakır ana buhar kolektör borusu
    addMesh(partLammCisterns, new THREE.CylinderGeometry(0.035, 0.035, 5.60, 12), matCopper, [0.18, 1.66, -0.15], [Math.PI / 2, 0, 0]);
    const steamFlowRing = addMesh(partLammCisterns, new THREE.CylinderGeometry(0.042, 0.042, 5.40, 12), matHotSteam, [-0.18, 1.66, -0.15], [Math.PI / 2, 0, 0], false);

    // --- 7. 250 BG Çift Silindirli Bileşik Buhar Makinesi & Krank (partCompoundEngine) ---
    // Alt yatak gövdesi (bedplate) ve dikey destek sütunları
    addMesh(partCompoundEngine, new THREE.BoxGeometry(0.68, 0.12, 0.92), matDarkIron, [0, Y_SHAFT - 0.14, Z_ENGINE]);
    // Yüksek basınç (HP, z = -1,45) ve Alçak basınç (LP, z = -1,85) dikey silindirleri
    addMesh(partCompoundEngine, new THREE.CylinderGeometry(0.16, 0.16, 0.34, 18), matDarkIron, [0, Y_SHAFT + 0.48, Z_ENGINE + 0.20]);
    addMesh(partCompoundEngine, new THREE.CylinderGeometry(0.22, 0.22, 0.34, 18), matDarkIron, [0, Y_SHAFT + 0.48, Z_ENGINE - 0.20]);
    addMesh(partCompoundEngine, new THREE.CylinderGeometry(0.18, 0.18, 0.04, 18), matBrass, [0, Y_SHAFT + 0.66, Z_ENGINE + 0.20]);
    addMesh(partCompoundEngine, new THREE.CylinderGeometry(0.24, 0.24, 0.04, 18), matBrass, [0, Y_SHAFT + 0.66, Z_ENGINE - 0.20]);
    // 4 çelik taşıyıcı sütun
    [-0.22, 0.22].forEach(xCol => {
      [-0.28, 0.28].forEach(dzCol => {
        addMesh(partCompoundEngine, new THREE.CylinderGeometry(0.024, 0.028, 0.48, 10), matSteelBright, [xCol, Y_SHAFT + 0.16, Z_ENGINE + dzCol]);
      });
    });

    // Hareketli krank mili grubu (y = Y_SHAFT = 1,05 m, z = Z_ENGINE = -1,65 m)
    const engineCrankGrp = new THREE.Group();
    engineCrankGrp.position.set(0, Y_SHAFT, Z_ENGINE);
    partCompoundEngine.add(engineCrankGrp);
    addMesh(engineCrankGrp, new THREE.CylinderGeometry(0.055, 0.055, 0.88, 14), matSteelBright, [0, 0, 0], [Math.PI / 2, 0, 0]);
    // Krank kolları ve volan çemberi
    addMesh(engineCrankGrp, new THREE.BoxGeometry(0.10, 0.24, 0.08), matSteelBright, [0, 0.06, 0.20]);
    addMesh(engineCrankGrp, new THREE.BoxGeometry(0.10, 0.24, 0.08), matSteelBright, [0, -0.06, -0.20]);
    addMesh(engineCrankGrp, new THREE.CylinderGeometry(0.24, 0.24, 0.06, 20), matBrass, [0, 0, 0.40], [Math.PI / 2, 0, 0]);

    // Hareketli HP ve LP piston + biyel grupları
    const pistonHPGrp = new THREE.Group();
    pistonHPGrp.position.set(0, Y_SHAFT + 0.24, Z_ENGINE + 0.20);
    partCompoundEngine.add(pistonHPGrp);
    addMesh(pistonHPGrp, new THREE.CylinderGeometry(0.028, 0.028, 0.32, 10), matSteelBright, [0, 0.06, 0]);
    addMesh(pistonHPGrp, new THREE.BoxGeometry(0.12, 0.08, 0.10), matBrass, [0, -0.08, 0]);

    const pistonLPGrp = new THREE.Group();
    pistonLPGrp.position.set(0, Y_SHAFT + 0.24, Z_ENGINE - 0.20);
    partCompoundEngine.add(pistonLPGrp);
    addMesh(pistonLPGrp, new THREE.CylinderGeometry(0.032, 0.032, 0.32, 10), matSteelBright, [0, 0.06, 0]);
    addMesh(pistonLPGrp, new THREE.BoxGeometry(0.14, 0.08, 0.10), matBrass, [0, -0.08, 0]);

    // --- 8. Soğuk Su Balast Tankları, Buharlı Sintine Pompası & Manometreler (partBallastPumps) ---
    addMesh(partBallastPumps, new THREE.BoxGeometry(0.62, 0.18, 3.20), matInterior, [0, 0.76, 0.20]);
    addMesh(partBallastPumps, new THREE.CylinderGeometry(0.12, 0.12, 0.42, 14), matBrass, [-0.24, 0.98, 0.35], [0, 0, Math.PI / 2]);
    addMesh(partBallastPumps, new THREE.CylinderGeometry(0.08, 0.08, 0.22, 14), matCopper, [0.24, 0.98, 0.35]);
    // Bakır balast boru hattı
    addMesh(partBallastPumps, new THREE.CylinderGeometry(0.028, 0.028, 6.40, 10), matCopper, [-0.26, 0.86, 0], [Math.PI / 2, 0, 0]);

    // --- 9. Kıç 4 Kanatlı Ana Uskur & Ana Tahrik Şaftı (partMainPropeller) ---
    // Kesintisiz ana tahrik şaftı: z = -6,18 m (kıç uskur) .. z = +4,25 m (baş dikey pervane konik dişlisi)
    // Yataklar sabit, şaft ve konik dişliler mainShaftGrp içinde döner!
    [-5.20, -3.60, -0.95, 1.55, 3.60].forEach(zBrg => {
      addMesh(partMainPropeller, new THREE.BoxGeometry(0.18, 0.16, 0.14), matBrass, [0, Y_SHAFT - 0.04, zBrg]);
    });

    const mainShaftGrp = new THREE.Group();
    mainShaftGrp.position.set(0, Y_SHAFT, 0);
    partMainPropeller.add(mainShaftGrp);
    // Ana şaft mili (z = -6,20 .. +4,32 m, toplam boy 10,52 m, merkez z = -0,94 m)
    addMesh(mainShaftGrp, new THREE.CylinderGeometry(0.042, 0.042, 10.52, 14), matSteelBright, [0, 0, -0.94], [Math.PI / 2, 0, 0]);

    // Kıç 4 kanatlı ana uskur (z = -6,18 m, Y = Y_SHAFT = 1,05 m)
    const mainPropHub = new THREE.Group();
    mainPropHub.position.set(0, 0, -6.18);
    mainShaftGrp.add(mainPropHub);
    addMesh(mainPropHub, new THREE.CylinderGeometry(0.11, 0.08, 0.24, 16), matBrass, [0, 0, 0], [Math.PI / 2, 0, 0]);
    for (let b = 0; b < 4; b++) {
      const ang = (b / 4) * Math.PI * 2;
      const bladeGrp = new THREE.Group();
      bladeGrp.rotation.z = ang;
      mainPropHub.add(bladeGrp);
      addMesh(bladeGrp, new THREE.BoxGeometry(0.14, 0.44, 0.026), matBrass, [0, 0.26, 0], [0, 0.42, 0]);
    }

    // --- 10. Baş ve Kıç Dikey Dalış Pervaneleri & 90° Konik Dişli Aktarması (partVerticalScrews) ---
    // Ana şaft üzerindeki 2 adet tahrik konik dişlisi (R1 = 0,14 m, Z ekseni)
    const mainBevelVisuals = [];
    [Z_VERT_FWD, Z_VERT_AFT].forEach(zV => {
      // Dikey kuyu silindiri (koruyucu açık tünel)
      addMesh(partVerticalScrews, new THREE.CylinderGeometry(0.28, 0.28, 0.42, 20, 1, true), matDeckIron, [0, Y_HULL + 0.22, zV]);
      addMesh(partVerticalScrews, new THREE.BoxGeometry(0.56, 0.04, 0.08), matBrass, [0, Y_HULL + 0.43, zV]);

      // Ana şaft üzerindeki Z-eksenli konik dişli (R1 = 0,14 m, merkez (0, Y_SHAFT, zV - R_BEVEL_VERT))
      const bevMain = new THREE.Group();
      bevMain.position.set(0, Y_SHAFT, zV - R_BEVEL_VERT);
      partVerticalScrews.add(bevMain);
      addMesh(bevMain, new THREE.CylinderGeometry(R_BEVEL_MAIN, R_BEVEL_MAIN * 0.78, 0.06, 18), matBrass, [0, 0, 0], [Math.PI / 2, 0, 0]);
      for (let t = 0; t < 16; t++) {
        const a = (t / 16) * Math.PI * 2;
        addMesh(bevMain, new THREE.BoxGeometry(0.028, 0.032, 0.055), matBrass, [Math.cos(a) * R_BEVEL_MAIN, Math.sin(a) * R_BEVEL_MAIN, 0], [0, 0, a]);
      }
      mainBevelVisuals.push(bevMain);
    });

    // Baş ve kıç Y-eksenli dikey dalış mili + R2 = 0,07 m pinyon konik dişlisi + 3 kanatlı dikey pervane
    // Temas noktası: (0, Y_SHAFT + R_BEVEL_MAIN = 1,19 m, zV - R_BEVEL_VERT) -> Tam 90° dişli kavraşması!
    const vertScrewGroups = [];
    [Z_VERT_FWD, Z_VERT_AFT].forEach(zV => {
      const vGrp = new THREE.Group();
      vGrp.position.set(0, Y_SHAFT + R_BEVEL_MAIN, zV);
      partVerticalScrews.add(vGrp);

      // Alt 90° pinyon konik dişlisi (R2 = 0,07 m, Y ekseni)
      addMesh(vGrp, new THREE.CylinderGeometry(R_BEVEL_VERT * 0.75, R_BEVEL_VERT, 0.05, 16), matSteelBright, [0, 0, 0]);
      for (let t = 0; t < 8; t++) {
        const a = (t / 8) * Math.PI * 2;
        addMesh(vGrp, new THREE.BoxGeometry(0.024, 0.048, 0.024), matSteelBright, [Math.cos(a) * R_BEVEL_VERT, 0, Math.sin(a) * R_BEVEL_VERT], [0, -a, 0]);
      }
      // Dikey tahrik mili (Y = 1,19 .. 1,52 m)
      addMesh(vGrp, new THREE.CylinderGeometry(0.026, 0.026, 0.34, 12), matSteelBright, [0, 0.17, 0]);
      // 3 kanatlı yatay/dikey çekiş pervanesi (Y = 1,50 m)
      addMesh(vGrp, new THREE.CylinderGeometry(0.055, 0.055, 0.06, 14), matBrass, [0, 0.31, 0]);
      for (let b = 0; b < 3; b++) {
        const ang = (b / 3) * Math.PI * 2;
        const bHolder = new THREE.Group();
        bHolder.position.set(0, 0.31, 0);
        bHolder.rotation.y = ang;
        vGrp.add(bHolder);
        addMesh(bHolder, new THREE.BoxGeometry(0.23, 0.018, 0.085), matBrass, [0.13, 0, 0], [0.32, 0, 0]);
      }
      vertScrewGroups.push(vGrp);
    });

    // --- 11. Kıç İstikamet Dümeni & Baş/Kıç Yunuslama Kanatları (partSternRudder) ---
    const rudderPivot = new THREE.Group();
    rudderPivot.position.set(0, Y_HULL, -5.75);
    partSternRudder.add(rudderPivot);
    addMesh(rudderPivot, new THREE.CylinderGeometry(0.028, 0.028, 0.72, 10), matSteelBright, [0, 0, 0]);
    addMesh(rudderPivot, new THREE.BoxGeometry(0.032, 0.62, 0.44), matDeckIron, [0, 0, -0.22]);

    const hydroplanePivots = [];
    [3.95, -4.95].forEach(zHyd => {
      const hPiv = new THREE.Group();
      hPiv.position.set(0, Y_HULL, zHyd);
      partSternRudder.add(hPiv);
      const rH = hullRadiusAtZ(zHyd);
      addMesh(hPiv, new THREE.CylinderGeometry(0.024, 0.024, rH * 2 + 0.76, 10), matSteelBright, [0, 0, 0], [0, 0, Math.PI / 2]);
      addMesh(hPiv, new THREE.BoxGeometry(0.36, 0.025, 0.28), matDeckIron, [-(rH + 0.20), 0, 0]);
      addMesh(hPiv, new THREE.BoxGeometry(0.36, 0.025, 0.28), matDeckIron, [rH + 0.20, 0, 0]);
      hydroplanePivots.push(hPiv);
    });

    // --- 12. Komutan Kumanda Mahalli, Dikey Pervane Kavraması & Pusula (partControlLevers) ---
    addMesh(partControlLevers, new THREE.CylinderGeometry(0.04, 0.05, 0.48, 12), matBrass, [0, 1.18, Z_CUPOLA + 0.15]);
    const helmWheelGrp = new THREE.Group();
    helmWheelGrp.position.set(0, 1.42, Z_CUPOLA + 0.22);
    partControlLevers.add(helmWheelGrp);
    addMesh(helmWheelGrp, new THREE.TorusGeometry(0.16, 0.018, 8, 18), matBrass, [0, 0, 0]);
    for (let s = 0; s < 6; s++) {
      const a = (s / 6) * Math.PI * 2;
      addMesh(helmWheelGrp, new THREE.CylinderGeometry(0.01, 0.01, 0.32, 8), matBrass, [0, 0, 0], [0, 0, a]);
    }
    // Dikey dalış pervanesi kavrama kolu
    const clutchLeverPivot = new THREE.Group();
    clutchLeverPivot.position.set(0.24, 1.08, Z_CUPOLA);
    partControlLevers.add(clutchLeverPivot);
    addMesh(clutchLeverPivot, new THREE.CylinderGeometry(0.016, 0.016, 0.42, 8), matSteelBright, [0, 0.21, 0]);
    addMesh(clutchLeverPivot, new THREE.SphereGeometry(0.035, 10, 10), matBrass, [0, 0.42, 0]);

    // --- 13. Pruva Üstü Harici 356 mm Torpido Kovanı & Menteşeli Ön Kapak (partTorpedoTube) ---
    const Y_TUBE = 1.76;
    const Z_TUBE_CENTER = 4.65;
    const L_TUBE = 2.24; // z = +3,53 .. +5,77 m
    // Açık uçlu kovan silindiri ve beşik ayakları
    addMesh(partTorpedoTube, new THREE.CylinderGeometry(0.21, 0.21, L_TUBE, 22, 1, true), matDeckIron, [0, Y_TUBE, Z_TUBE_CENTER], [Math.PI / 2, 0, 0]);
    addMesh(partTorpedoTube, new THREE.CylinderGeometry(0.215, 0.215, 0.08, 22), matBrass, [0, Y_TUBE, Z_TUBE_CENTER - L_TUBE * 0.5], [Math.PI / 2, 0, 0]);
    for (let b = -1; b <= 1; b++) {
      const zSup = Z_TUBE_CENTER + b * 0.72;
      addMesh(partTorpedoTube, new THREE.TorusGeometry(0.218, 0.015, 8, 22), matBrass, [0, Y_TUBE, zSup]);
      addMesh(partTorpedoTube, new THREE.BoxGeometry(0.28, 0.22, 0.08), matDeckIron, [0, Y_TUBE - 0.20, zSup]);
    }
    // Menteşeli ön torpido kovan kapağı (z = +5,77 m, üst menteşe y = Y_TUBE + 0,21 m)
    const tubeShutterPivot = new THREE.Group();
    tubeShutterPivot.position.set(0, Y_TUBE + 0.21, Z_TUBE_CENTER + L_TUBE * 0.5);
    partTorpedoTube.add(tubeShutterPivot);
    addMesh(tubeShutterPivot, new THREE.CylinderGeometry(0.215, 0.215, 0.035, 22), matBrass, [0, -0.21, 0.02], [Math.PI / 2, 0, 0]);

    // --- 14. 356 mm Schwarzkopff / Whitehead Bronz Torpido & Yedek Torpido (partWhiteheadTorpedo) ---
    function buildTorpedoMeshGroup(parent) {
      const tg = new THREE.Group();
      parent.add(tg);
      // Fosfor-bronz puro torpido gövdesi (toplam boy 1,92 m: z_yerel = -0,96 .. +0,96 m, çap 0,34 m)
      addMesh(tg, new THREE.CylinderGeometry(0.165, 0.165, 1.12, 18), matBrass, [0, 0, 0], [Math.PI / 2, 0, 0]);
      addMesh(tg, new THREE.ConeGeometry(0.165, 0.42, 18), matCopper, [0, 0, 0.77], [Math.PI / 2, 0, 0]);
      addMesh(tg, new THREE.CylinderGeometry(0.05, 0.165, 0.38, 18), matBrass, [0, 0, -0.75], [Math.PI / 2, 0, 0]);
      // Kuyruk kanatçıkları ve çift ters döner pervane
      addMesh(tg, new THREE.BoxGeometry(0.36, 0.016, 0.22), matSteelBright, [0, 0, -0.84]);
      addMesh(tg, new THREE.BoxGeometry(0.016, 0.36, 0.22), matSteelBright, [0, 0, -0.84]);
      const propA = new THREE.Group();
      propA.position.set(0, 0, -0.95);
      tg.add(propA);
      addMesh(propA, new THREE.BoxGeometry(0.26, 0.035, 0.014), matSteelBright, [0, 0, 0]);
      addMesh(propA, new THREE.BoxGeometry(0.035, 0.26, 0.014), matSteelBright, [0, 0, 0]);
      tg.userData.tailProp = propA;
      return tg;
    }

    // Aktif kovandaki 1. torpido (Y = Y_TUBE = 1,76 m, Z = Z_TUBE_CENTER = +4,65 m)
    const activeTorpedoGrp = buildTorpedoMeshGroup(partWhiteheadTorpedo);
    activeTorpedoGrp.position.set(0, Y_TUBE, Z_TUBE_CENTER);

    // Gövde içindeki yedek 2. torpido (Y = 1,04 m, Z = +2,55 m yan raf)
    const spareTorpedoGrp = buildTorpedoMeshGroup(partWhiteheadTorpedo);
    spareTorpedoGrp.position.set(0, 0.96, 2.55);
    spareTorpedoGrp.scale.setScalar(0.88);

    // --- 15. Güverte Üstü 2 × 35 mm Nordenfelt Makineli Topları (partDeckGuns) ---
    const deckGunSwivels = [];
    [-0.34, 0.34].forEach(xGun => {
      addMesh(partDeckGuns, new THREE.CylinderGeometry(0.06, 0.08, 0.28, 12), matBrass, [xGun, Y_HULL + R_MAX + 0.14, 1.85]);
      const swiv = new THREE.Group();
      swiv.position.set(xGun, Y_HULL + R_MAX + 0.30, 1.85);
      partDeckGuns.add(swiv);
      addMesh(swiv, new THREE.BoxGeometry(0.14, 0.08, 0.22), matBrass, [0, 0, 0]);
      // 4 namlulu Nordenfelt bataryası
      for (let b = -1.5; b <= 1.5; b += 1) {
        addMesh(swiv, new THREE.CylinderGeometry(0.012, 0.014, 0.46, 8), matDarkIron, [b * 0.028, 0.02, 0.24], [Math.PI / 2, 0, 0]);
      }
      addMesh(swiv, new THREE.BoxGeometry(0.09, 0.14, 0.06), matBrass, [0, 0.09, -0.04]);
      deckGunSwivels.push(swiv);
    });

    // ========================================================================
    // CANLI MEKANİK DURUM (STATE) VE ETKİLEŞİM MANTIĞI
    // ========================================================================
    const S = {
      rpm: 54,                  // Buhar makinesi & ana uskur devri (0..90 RPM)
      helmDeg: 0,               // İstikamet dümeni ve güverte topu açısı (-25°..+25°)
      pitchDeg: 0,              // Yunuslama / derinlik kanadı açısı (-15°..+15°)
      mode: 'submerged',        // 'submerged' (Lamm Kızgın Buhar Su Altı Dalışı) | 'surface' (Satıh Buhar Seyri)
      shutterOpen: true,        // Torpido kovanı ön kapağı açık mı? (terrain butonu ile açılır/kapanır)
      autoSteam: true,          // Otomatik buhar/seyir animasyonu
      ammo: 2,                  // 2 × 356 mm Schwarzkopff / Whitehead torpidosu
      torpedoFiring: false,     // Torpido fırlatma animasyonu sürüyor mu?
      torpedoProgress: 0,       // 0..1 arası torpido ilerleme evresi
      shaftAngle: 0,            // Ana şaft toplam dönüş açısı (rad)
      vertScrewAngle: 0,        // Dikey dalış pervaneleri toplam dönüş açısı (rad)
      chimneyLift: 0            // 0 = baca içeride (dalış), 1 = baca yukarıda (satıh)
    };

    function syncVisualState(dt) {
      const stepDt = Math.max(0, Math.min(dt || 0, 0.1));
      const isSubmerged = S.mode === 'submerged';

      // 1. Teleskopik baca ve ocak kapağı geçişi
      const targetLift = isSubmerged ? 0.0 : 1.0;
      S.chimneyLift += (targetLift - S.chimneyLift) * Math.min(1, stepDt * 8 + (stepDt === 0 ? 1 : 0));
      chimneyGrp.position.y = (Y_HULL + R_MAX - 0.30) + S.chimneyLift * 0.54;
      chimneyHatchPivot.rotation.x = -S.chimneyLift * 1.45; // Dalışta 0 rad (kapalı), satıhta -83° açık
      furnaceFireMesh.visible = !isSubmerged;
      steamFlowRing.material.emissiveIntensity = isSubmerged ? 0.55 : 0.20;
      clutchLeverPivot.rotation.x = isSubmerged ? 0.42 : -0.35;

      // 2. Ana şaft, pistonlar, ana uskur ve 90° konik dişli dikey dalış pervaneleri (v = ω × r)
      // KURAL: Gizli alt sınır YOKTUR; S.rpm === 0 iken veya autoSteam kapalıyken dTheta = 0!
      const effectiveRpm = S.autoSteam ? S.rpm : 0;
      const omegaShaft = (effectiveRpm * Math.PI * 2) / 60;
      const dThetaShaft = omegaShaft * stepDt;
      S.shaftAngle += dThetaShaft;

      mainShaftGrp.rotation.z = S.shaftAngle;
      engineCrankGrp.rotation.z = S.shaftAngle;
      mainBevelVisuals.forEach(bm => { bm.rotation.z = S.shaftAngle; });

      // HP ve LP piston kollarının sinüzoidal stroku (90° faz farkıyla bileşik makine)
      pistonHPGrp.position.y = (Y_SHAFT + 0.24) + Math.sin(S.shaftAngle) * 0.055;
      pistonLPGrp.position.y = (Y_SHAFT + 0.24) + Math.cos(S.shaftAngle) * 0.055;

      // Dikey dalış pervaneleri: 90° konik dişli oranı R1 / R2 = 0.14 / 0.07 = 2.0 (v = ω × r)
      // Su altı dalış modunda kavrama tam bağlıdır (2:1 hızda döner)
      const dThetaVert = dThetaShaft * (R_BEVEL_MAIN / R_BEVEL_VERT);
      if (isSubmerged) {
        S.vertScrewAngle += dThetaVert;
      }
      vertScrewGroups.forEach(vg => { vg.rotation.y = S.vertScrewAngle; });

      // 3. Dümen, komutan çarkı, güverte topları ve derinlik kanatları
      const helmRad = THREE.MathUtils.degToRad(S.helmDeg);
      const pitchRad = THREE.MathUtils.degToRad(S.pitchDeg);
      rudderPivot.rotation.y = helmRad;
      helmWheelGrp.rotation.z = -helmRad * 2.5;
      // Güverte topları dümen ve derinlik kumandasından bağımsızdır.
      hydroplanePivots.forEach(hp => { hp.rotation.x = pitchRad; });

      // 4. Baş torpido kovan kapağı (+75° = 1.309 rad açılır)
      const targetShutter = (S.shutterOpen || S.torpedoFiring) ? -1.309 : 0.0;
      tubeShutterPivot.rotation.x = targetShutter;

      // 5. 356 mm Schwarzkopff / Whitehead torpido fırlatma hareketi
      activeTorpedoGrp.visible = S.ammo >= 1 || S.torpedoFiring;
      spareTorpedoGrp.visible = S.ammo >= 2;
      if (S.torpedoFiring) {
        S.torpedoProgress += stepDt * 0.85;
        if (S.torpedoProgress >= 1) {
          S.torpedoFiring = false;
          S.torpedoProgress = 0;
          activeTorpedoGrp.position.set(0, Y_TUBE, Z_TUBE_CENTER);
        } else {
          // z = +4,65 m'den z = +12,40 m'ye doğrusal su altı torpido çıkışı
          activeTorpedoGrp.position.set(0, Y_TUBE, Z_TUBE_CENTER + S.torpedoProgress * 7.75);
          if (activeTorpedoGrp.userData.tailProp) {
            activeTorpedoGrp.userData.tailProp.rotation.z += stepDt * 32;
          }
        }
      } else {
        activeTorpedoGrp.position.set(0, Y_TUBE, Z_TUBE_CENTER);
      }
    }

    mainShaftGrp.name = 'ab-shaft';
    activeTorpedoGrp.name = 'ab-torpedo';
    tubeShutterPivot.name = 'ab-shutter';
    // İlk kurulumda durumu senkronize et
    syncVisualState(0);

    // ========================================================================
    // KAMERA AÇILARI VE 6 ADIMLI REHBERLİ TUR
    // ========================================================================
    const camPresets = {
      iso: { pos: [14, 6.0, 14], look: [0, 1.3, 0.2] },
      front: { pos: [2.8, 2.3, 8.4], look: [0, 1.5, 3.8] },
      breech: { pos: [2.4, 2.2, 5.2], look: [0, 1.76, 4.65] },
      engine: { pos: [3.4, 2.1, -1.8], look: [0, 1.25, -1.2] },
      suspension: { pos: [3.2, 2.4, 4.4], look: [0, 1.35, 4.25] },
      top: { pos: [0.2, 11.5, 0.2], look: [0, 1.25, 0] }
    };

    const tourSteps = [
      {
        title: 'Genel Bakış: 1886 Osmanlı Abdülhamid (Nordenfelt II) Denizaltısı',
        desc: "1886’da Taşkızak’ta suya indirilen Nordenfelt II, Osmanlı donanmasının erken denizaltı deneylerini temsil eder. Puro biçimli gövde, güverte topları ve camlı kumanda mahalli dönemin yüzey gemisi anlayışını da taşır.",
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'iso',
        part: partOuterHull
      },
      {
        title: 'Lamm Kızgın Buhar Biriktirme Sarnıçları (Termal Akümülatör)',
        desc: "Dalışta ocak yakmak yerine önceden biriktirilen ısıdan yararlanılması, buharlı denizaltının ayırt edici fikriydi. Kesitteki iki hazne ve borular, bu prensibin yaklaşık görsel anlatımıdır.",
        explode: 0,
        cutaway: true,
        sub: 'all',
        cam: 'engine',
        part: partLammCisterns
      },
      {
        title: 'Teleskopik Baca & 250 BG Bileşik Buhar Makinesi',
        desc: "Yüzey ve dalış kiplerini karşılaştırın: baca ile ocak görünüşü değişirken buhar makinesinin hareketi ayrı kumandadan durdurulabilir. İç yerleşim ve devirler ölçülmüş performans verisi değildir.",
        explode: 0,
        cutaway: true,
        sub: 'all',
        cam: 'engine',
        part: partCompoundEngine
      },
      {
        title: 'Baş ve Kıç Dikey Dalış Pervaneleri (90° Konik Dişli)',
        desc: "Dikey pervaneler, Nordenfelt tasarımının dalış yaklaşımını gösterir. Sergideki dişli çifti ve hız oranı açıklayıcı modellemedir; teknenin özgün aktarma planı olarak okunmamalıdır.",
        explode: 0,
        cutaway: true,
        sub: 'all',
        cam: 'suspension',
        part: partVerticalScrews
      },
      {
        title: 'Cam Gözetleme Kubbeli Komutan Kulesi & Trim Zorluğu',
        desc: "Boyuna denge, bu teknelerin başlıca sorunuydu. Mürettebatın yer değiştirmesi ve torpido denemeleri trim yönetimini zorlaştırıyordu. Gösterim tam bir hidrodinamik simülasyon değildir.",
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'front',
        part: partConningCupola
      },
      {
        title: '356 mm Baş Torpido Kovanı & Schwarzkopff Torpidosu (1888)',
        desc: "İlk su altı torpido atışı yaygın biçimde Abdülhamid’e atfedilir; kaynaklar tarih ve tekne konusunda ayrışır. USNI’nin 1974 incelemesi Ocak 1888 İzmit denemesini Abdülmecid adıyla anlatır. Bu nedenle kesin bir Sarayburnu zaferi sunulmuyor.",
        explode: 0,
        cutaway: true,
        sub: 'all',
        cam: 'breech',
        part: partWhiteheadTorpedo
      }
    ];

    // ========================================================================
    // ADAPTÖR ARAYÜZÜ (UI) TANIMI
    // ========================================================================
    let activeScheme = 'taskizak1886';
    let reliefEnabled = true;

    const ui = {
      title: '1886 OSMANLI ABDÜLHAMİD (NORDENFELT II) BUHARLI DENİZALTISI',
      sub: 'Erken Osmanlı Denizaltıcılığı • Taşkızak, 1886 • Buhar Gücü ve Denge Sorunu',
      badge: 'ABDÜLHAMİD — 1886',
      partCount: '15 Ana Grup',
      portraitCameraScale: 1.7,
      fog: {near: 45, far: 100},
      shadowExtent: 11,
      sliders: [
        { label: 'Buhar Makinesi & Ana Uskur Devri', min: 0, max: 90, step: 1, fmt: v => `${Math.round(v)} RPM` },
        { label: 'Kıç İstikamet Dümeni', min: -25, max: 25, step: 1, fmt: v => `${v > 0 ? '+' : ''}${Math.round(v)}°` },
        { label: 'Derinlik / Yunuslama Kanadı (Hydroplane)', min: -15, max: 15, step: 1, fmt: v => `${v > 0 ? '+' : ''}${Math.round(v)}°` }
      ],
      buttons: {
        terrain: '🛡️ Torpido Kovan Kapağı: AÇIK (Atışa Hazır)',
        sweep: '♨️ Buhar Tahriki & Pervaneler: AÇIK',
        mode: true
      },
      telemetryTag: 'TAŞKIZAK TERSANESİ — 1886',
      statLabels: ['TEMSİLİ MAKİNE DEVRİ', 'DALIŞ & BACA DURUMU', '356 MM TORPİDO', 'DİKEY PERVANE DEVRİ'],
      camLabels: {
        iso: 'İzometrik Genel',
        front: 'Pruva & Kule',
        breech: '356 mm Torpido Kovanı',
        engine: 'Buhar Makinesi & Lamm',
        suspension: 'Dikey Dalış Pervanesi',
        top: 'Üst Plan'
      },
      texTitle: '🎨 1886 Taşkızak Tersanesi & Osmanlı Bahriye Kaplaması',
      textures: Object.keys(SCHEMES).map(k => ({ key: k, label: SCHEMES[k].name })),
      subsystems: [
        { key: 'hull_structure', label: 'Puro Çelik Gövde, Postalar & Camlı Kule', count: 4, color: '#475569' },
        { key: 'steam_lamm', label: 'Lamm Kızgın Buhar Sarnıçları, Kazan & Makine', count: 4, color: '#d97706' },
        { key: 'propulsion_dive', label: 'Ana Uskur, Dikey Dalış Pervaneleri & Dümen', count: 4, color: '#0284c7' },
        { key: 'weapons_torpedo', label: '356 mm Baş Torpido Kovanı & Nordenfelt Topları', count: 3, color: '#dc2626' }
      ],
      activeTexture: () => activeScheme,
      textureLabel: () => SCHEMES[activeScheme].name,
      relief: () => reliefEnabled,
      reliefLabel: v => `🔩 Perçinli Levha & Çelik Kuşak Dokusu: ${v ? 'AÇIK' : 'KAPALI'}`
    };

    function applyTextures(isBlueprint) {
      const sch = SCHEMES[activeScheme] || SCHEMES.taskizak1886;
      myMeshes.forEach(m => {
        const mat = m.material;
        if (!mat || !mat.userData) return;
        const role = mat.userData.abRole;
        if (role === 'water') {
          mat.color.setHex(sch.water);
          return;
        }
        let hex = null;
        if (role === 'hullUpper') hex = sch.hullUpper;
        else if (role === 'hullLower') hex = sch.hullLower;
        else if (role === 'deck') hex = sch.deckIron;
        else if (role === 'interior') hex = sch.interior;
        else if (role === 'brass') hex = sch.brass;
        else if (role === 'copper') hex = sch.copper;
        else if (role === 'timber') hex = sch.timber;

        if (hex !== null) {
          if (m.userData && m.userData.origColor) m.userData.origColor.setHex(hex);
          if (!isBlueprint) mat.color.setHex(hex);
        }
        if (role === 'hullUpper' || role === 'hullLower' || role === 'deck') {
          mat.bumpMap = (!isBlueprint && reliefEnabled) ? rivetBump : null;
          mat.needsUpdate = true;
        }
      });
    }

    return {
      root,
      ui,
      camPresets,
      tourSteps,
      flashMesh: null,
      parts: {
        outerHull: partOuterHull,
        ribFrames: partRibFrames,
        conningCupola: partConningCupola,
        keelCradle: partKeelCradle,
        steamBoiler: partSteamBoiler,
        lammCisterns: partLammCisterns,
        compoundEngine: partCompoundEngine,
        ballastPumps: partBallastPumps,
        mainPropeller: partMainPropeller,
        verticalScrews: partVerticalScrews,
        sternRudder: partSternRudder,
        controlLevers: partControlLevers,
        torpedoTube: partTorpedoTube,
        whiteheadTorpedo: partWhiteheadTorpedo,
        deckGuns: partDeckGuns
      },
      defaultPart: partOuterHull,
      firePart: partWhiteheadTorpedo,

      update(dt) {
        syncVisualState(dt);
      },

      onSlider(idx, val) {
        const v = Number(val);
        if (!Number.isFinite(v)) return {};
        if (idx === 0) {
          S.rpm = Math.max(0, Math.min(90, v));
        } else if (idx === 1) {
          S.helmDeg = Math.max(-25, Math.min(25, v));
        } else if (idx === 2) {
          S.pitchDeg = Math.max(-15, Math.min(15, v));
        }
        syncVisualState(0);
        return {};
      },

      onButton(name) {
        if (name === 'terrain') {
          if (S.torpedoFiring) return {active: S.shutterOpen, msg: 'Torpido geçişi tamamlanana kadar kapak açık tutulur.'};
          S.shutterOpen = !S.shutterOpen;
          ui.buttons.terrain = S.shutterOpen
            ? '🛡️ Torpido Kovan Kapağı: AÇIK (Atışa Hazır)'
            : '🔒 Torpido Kovan Kapağı: KAPALI (Emniyet Kilidi)';
          syncVisualState(0);
          return {
            active: S.shutterOpen,
            msg: S.shutterOpen
              ? 'Baş 356 mm torpido kovan kapağı +75° açıldı; torpido atışa hazır.'
              : 'Baş torpido kovan kapağı kapatıldı; ateşleme emniyet kilidi devrede.'
          };
        }
        if (name === 'sweep') {
          S.autoSteam = !S.autoSteam;
          ui.buttons.sweep = S.autoSteam
            ? '♨️ Buhar Tahriki & Pervaneler: AÇIK'
            : '⏸️ Buhar Tahriki & Pervaneler: DURAKLATILDI';
          syncVisualState(0);
          return {
            active: S.autoSteam,
            msg: S.autoSteam
              ? 'Bileşik buhar makinesi ve uskur tahriki devrede.'
              : 'Buhar valfi kapatıldı; makine ve pervaneler durduruldu.'
          };
        }
        if (name === 'mode') {
          S.mode = S.mode === 'submerged' ? 'surface' : 'submerged';
          syncVisualState(0);
          return {
            active: S.mode === 'submerged',
            msg: S.mode === 'submerged'
              ? '🌊 Su Altı Kızgın Buhar Dalış Modu: Kazan ocağı söndürüldü, teleskopik baca indirildi; Lamm sarnıçları ve dikey dalış pervaneleri devrede!'
              : '♨️ Satıh Buhar Seyri Modu: Teleskopik baca yükseltildi, kömürlü kazan ocağı yakıldı; dikey dalış pervaneleri ayrıldı.'
          };
        }
        return {};
      },

      buttonActive(name) {
        if (name === 'terrain') return S.shutterOpen;
        if (name === 'sweep') return S.autoSteam;
        if (name === 'mode') return S.mode === 'submerged';
        return false;
      },

      modeLabel() {
        return S.mode === 'submerged'
          ? '🌊 Kip: Su Altı Kızgın Buhar Dalışı (Baca İnik & Dikey Pervaneler Aktif)'
          : '♨️ Kip: Satıh Buhar Seyri (Baca Açık & Kömür Kazanı Aktif)';
      },

      onFire() {
        if (S.torpedoFiring) return {ok: false, msg: 'Torpido gösterimi sürüyor.'};
        if (S.ammo <= 0) {
          S.ammo = 2;
          S.torpedoFiring = false;
          S.torpedoProgress = 0;
          syncVisualState(0);
          return {
            ok: true,
            refill: true,
            msg: '🔄 Taşkızak Tersanesi ikmali: 2 adet 356 mm Schwarzkopff / Whitehead torpidosu yüklendi.'
          };
        }
        if (!S.shutterOpen) {
          return {
            ok: false,
            msg: '⚠️ <strong>EMNİYET KİLİDİ:</strong> Baş torpido kovan kapağı kapalıyken atış yapılamaz! Önce kovan kapağını açın.'
          };
        }
        S.ammo = Math.max(0, S.ammo - 1);
        S.torpedoFiring = true;
        S.torpedoProgress = 0.01;
        syncVisualState(0);
        if (ctx.audio && ctx.audio.playCannonFire) ctx.audio.playCannonFire();
        return {
          ok: true,
          msg: `💥 <strong>356 mm Schwarzkopff Torpidosu ateşlendi!</strong> (Kalan Torpido: ${S.ammo} / 2)`
        };
      },

      fireButtonLabel() {
        if (S.torpedoFiring) return '⏳ TORPİDO GÖSTERİMİ SÜRÜYOR';
        if (S.ammo <= 0) return '🔄 356 MM TORPİDO İKMALİ YAP (2 ADET)';
        if (!S.shutterOpen) return '🔒 KOVAN KAPAĞI KAPALI (EMNİYET KİLİDİ)';
        return `🚀 356 MM SCHWARZKOPFF TORPİDOSU ATEŞLE (${S.ammo}/2)`;
      },

      mobileFireButtonLabel() {
        if (S.torpedoFiring) return '⏳ Gösterim sürüyor';
        if (S.ammo <= 0) return '🔄 İkmal Yap';
        if (!S.shutterOpen) return '🔒 Kapak Kapalı';
        return '🚀 Torpido At';
      },

      getSliderValues() {
        return [S.rpm, S.helmDeg, S.pitchDeg];
      },

      getStats() {
        const effRpm = S.autoSteam ? S.rpm : 0;
        const diveStat = S.mode === 'submerged'
          ? 'Dalmış <span>(Baca İnik)</span>'
          : 'Satıh <span>(Baca Açık)</span>';
        const vertRpm = S.mode === 'submerged' ? effRpm * 2 : 0;
        return [
          `${effRpm} <span>RPM · sergi animasyonu</span>`,
          diveStat,
          `${S.ammo} / 2 <span>Adet (356 mm)</span>`,
          `${vertRpm} <span>RPM (1:2 Konik)</span>`
        ];
      },

      getStatus() {
        if (S.ammo <= 0) {
          return { text: 'TORPİDO BİTTİ — İKMAL GEREKLİ', color: '#dc2626' };
        }
        if (!S.shutterOpen) {
          return { text: 'KOVAN KAPAĞI KAPALI — ATIŞ KİLİTLİ', color: '#d97706' };
        }
        return S.mode === 'submerged'
          ? { text: 'SU ALTI LAMM KIZGIN BUHAR SEYRİ — ATIŞA HAZIR', color: '#0284c7' }
          : { text: 'SATIH BUHAR SEYRİ (BACA AÇIK) — ATIŞA HAZIR', color: '#16a34a' };
      },

      applyTextures,
      setTexture(key) {
        if (SCHEMES[key]) activeScheme = key;
      },
      toggleRelief() {
        reliefEnabled = !reliefEnabled;
        return reliefEnabled;
      }
    };
  };
})();
