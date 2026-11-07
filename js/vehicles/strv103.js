// ============================================================================
// 1967 STRIDSVAGN 103 ("S-TANK") — TARETSİZ HİDROPNÖMATİK ANA MUHAREBE TANKI
// Arsenalen (İsveç Zırhlı Araçlar Müzesi, Strängnäs) ve The Tank Museum (Bovington)
// Strv 103C Koleksiyonlarına Göre 1:1 Tam Ölçekli Müze Rekonstrüksiyonu
// Gövdeye Sabit 105 mm Bofors L74 (L/62) Top, Hidropnömatik Süspansiyonla Nişan Alma
// (±11° Yunuslama), CODAG (Rolls-Royce K60 Karşıt Pistonlu Dizel + Boeing 553 Gaz Türbini)
// Güç Paketi, 50 Mermilik Çift Otomatik Doldurucu, Kıçtan Kovan Fırlatma & Dozer Bıçağı
// ============================================================================
(function () {
  window.VehicleBuilders = window.VehicleBuilders || {};

  // --- Prosedürel Yivli (Ribbed) İsveç Zırh Çeliği Kabartma Dokusu ---
  function makeSwedishRibbedArmorBump(THREE) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#808080';
    g.fillRect(0, 0, 256, 256);

    // Ön glasisteki karakteristik yatay zırh nervürleri (APFSDS/HEAT kaydırma yivleri)
    for (let y = 0; y < 256; y += 16) {
      g.fillStyle = '#a8a8a8';
      g.fillRect(0, y, 256, 6);
      g.fillStyle = '#545454';
      g.fillRect(0, y + 6, 256, 4);
    }
    // Kaynak dikişleri ve cıvata izleri
    g.strokeStyle = '#404040';
    g.lineWidth = 2;
    for (let x = 64; x < 256; x += 64) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, 256);
      g.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  // --- 4 Tarihsel Boya Şeması ---
  const SCHEMES = {
    foa_m90_splinter: {
      name: '🌲 İsveç Ordusu FOA M90 "Splinter" Geometrik Orman Kamuflajı (P 4 Skaraborg)',
      btn: '🌲 İsveç M90 Splinter (Koyu & Açık Yeşil)',
      armorMain: 0x3b4d38,
      armorSecondary: 0x526b47,
      skirtFuel: 0x2d3a2a,
      barrelSteel: 0x273326,
      interiorMetal: 0xd4d4d8,
      brass: 0xd97706
    },
    nordic_olive1967: {
      name: '🛡️ 1967 Strv 103B Erken Hizmet — İskandinav Zeytin Yeşili (Norrland Tugayı)',
      btn: '🛡️ 1967 İskandinav Zeytin Yeşili',
      armorMain: 0x434d36,
      armorSecondary: 0x4f5b41,
      skirtFuel: 0x363f2c,
      barrelSteel: 0x2c3424,
      interiorMetal: 0xe2e8f0,
      brass: 0xd97706
    },
    subarctic_winter: {
      name: '❄️ Lapland Kutup Kışı — Beyaz/Gri Kış Kamuflajı (Boden Garnizonu)',
      btn: '❄️ Lapland Kutup Kışı (Kar Beyazı & Çam)',
      armorMain: 0xdbe2e9,
      armorSecondary: 0x4b5842,
      skirtFuel: 0xcbd5e1,
      barrelSteel: 0x334155,
      interiorMetal: 0xcbd5e1,
      brass: 0xd97706
    },
    bovington_museum: {
      name: '🏛️ Arsenalen & Bovington Tank Müzesi Kesit Sergisi (Koyu Antrasit & Çelik)',
      btn: '🏛️ Arsenalen Müze Sergisi',
      armorMain: 0x3f493d,
      armorSecondary: 0x475569,
      skirtFuel: 0x334155,
      barrelSteel: 0x1e293b,
      interiorMetal: 0xf1f5f9,
      brass: 0xf59e0b
    }
  };

  // --- Prosedürel Strv 103 Kama Kesitli (78° Glasis Eğimli) Gövde Kabuğu ---
  function createStrv103HullGeometry(THREE) {
    // 6 enine kesit istasyonu (z = -3.45 .. +3.45 m) ile alçak profilli kama gövde
    const stations = [
      // [z, yBottom, yChine, yRoof, halfWBottom, halfWChine, halfWRoof]
      [-3.45, 0.56, 1.12, 1.56, 1.32, 1.62, 1.38],
      [-2.40, 0.48, 1.15, 1.78, 1.36, 1.64, 1.44],
      [-0.60, 0.46, 1.16, 1.88, 1.36, 1.64, 1.46],
      [ 0.65, 0.46, 1.14, 1.82, 1.36, 1.64, 1.42],
      [ 2.25, 0.52, 1.06, 1.34, 1.34, 1.62, 1.26],
      [ 3.45, 0.84, 0.92, 0.96, 1.24, 1.48, 1.18]
    ];

    const nu = 8; // Alt merkez -> sol alt -> sol omuz -> sol tavan -> sağ tavan -> sağ omuz -> sağ alt -> alt merkez
    const nz = stations.length;
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i < nz; i++) {
      const [z, yB, yC, yR, wB, wC, wR] = stations[i];
      const v = i / (nz - 1);
      const ring = [
        [0, yB],
        [-wB, yB],
        [-wC, yC],
        [-wR, yR],
        [0, yR + 0.02],
        [wR, yR],
        [wC, yC],
        [wB, yB],
        [0, yB]
      ];
      for (let j = 0; j <= nu; j++) {
        const [x, y] = ring[j];
        positions.push(x, y, z);
        normals.push(0, 1, 0);
        uvs.push(j / nu, v);
      }
    }

    const row = nu + 1;
    for (let i = 0; i < nz - 1; i++) {
      for (let j = 0; j < nu; j++) {
        const a = i * row + j;
        const b = (i + 1) * row + j;
        const c = (i + 1) * row + (j + 1);
        const d = i * row + (j + 1);
        indices.push(a, b, d, b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  window.VehicleBuilders.strv103 = function buildStrv103(ctx) {
    const { THREE, scene, addCADMesh, createPartGroup } = ctx;
    const root = new THREE.Group();
    root.name = 'strv103_root';
    root.visible = false;
    scene.add(root);

    // Hidrostatik direksiyonla yatay nişan (Hull Yaw: -25° .. +25°) grubu
    const yawPivot = new THREE.Group();
    yawPivot.name = 'strv103_yaw_pivot';
    root.add(yawPivot);

    // Hidropnömatik süspansiyonla dikey nişan (Hull Pitch: -11° .. +12°) grubu
    const hullPitchGroup = new THREE.Group();
    hullPitchGroup.name = 'strv103_hull_pitch';
    yawPivot.add(hullPitchGroup);

    const myMeshes = [];
    const ribbedBump = makeSwedishRibbedArmorBump(THREE);

    function addMesh(parent, geo, mat, pos, rot, scale) {
      const m = addCADMesh(parent, geo, mat, pos, rot);
      if (scale) m.scale.set(scale[0], scale[1], scale[2]);
      myMeshes.push(m);
      return m;
    }

    // --- Malzemeler ---
    const matHullOuter = new THREE.MeshStandardMaterial({
      color: SCHEMES.foa_m90_splinter.armorMain,
      roughness: 0.56,
      metalness: 0.38,
      bumpMap: ribbedBump,
      bumpScale: 0.018,
      side: THREE.DoubleSide
    });
    matHullOuter.userData = { isOuterShell: true, s103Role: 'armorMain' };

    const matArmorSec = new THREE.MeshStandardMaterial({
      color: SCHEMES.foa_m90_splinter.armorSecondary,
      roughness: 0.54,
      metalness: 0.42,
      bumpMap: ribbedBump,
      bumpScale: 0.012
    });
    matArmorSec.userData = { s103Role: 'armorSecondary' };

    const matSkirtFuel = new THREE.MeshStandardMaterial({
      color: SCHEMES.foa_m90_splinter.skirtFuel,
      roughness: 0.60,
      metalness: 0.35
    });
    matSkirtFuel.userData = { isOuterShell: true, s103Role: 'skirtFuel' };

    const matBarrelSteel = new THREE.MeshStandardMaterial({
      color: SCHEMES.foa_m90_splinter.barrelSteel,
      roughness: 0.38,
      metalness: 0.72
    });
    matBarrelSteel.userData = { s103Role: 'barrelSteel' };

    const matInteriorAlloy = new THREE.MeshStandardMaterial({
      color: SCHEMES.foa_m90_splinter.interiorMetal,
      roughness: 0.32,
      metalness: 0.78
    });
    matInteriorAlloy.userData = { s103Role: 'interiorMetal' };

    const matBrass = new THREE.MeshStandardMaterial({
      color: SCHEMES.foa_m90_splinter.brass,
      roughness: 0.25,
      metalness: 0.88
    });
    matBrass.userData = { s103Role: 'brass' };

    const matTurbineOrange = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      roughness: 0.36,
      metalness: 0.68
    });

    const matDieselBlue = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.40,
      metalness: 0.65
    });

    const matRubber = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.88,
      metalness: 0.08
    });

    const matTrackSteel = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.62,
      metalness: 0.74
    });

    const matMuzzleBlast = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.82
    });

    // ========================================================================
    // 15 BAĞIMSIZ MEKANİK PARÇA GRUBU (4 Alt Sistem)
    // ========================================================================
    const SUB_LABELS = {
      hull_armor: 'ALT SİSTEM: 78° EĞİMLİ YİVLİ GLASİS ZIRHI, DOZER & ANTI-HEAT KAFES',
      gun_autoloader: 'ALT SİSTEM: SABİT 105 MM BOFORS L74 TOP & 50 MERMİLİK OTOMATİK DOLDURUCU',
      codag_crew: 'ALT SİSTEM: CODAG (K60 DİZEL + BOEING 553 TÜRBİN) & ÇİFT YÖNLÜ MÜRETTEBAT',
      hydro_suspension: 'ALT SİSTEM: HİDROPNÖMATİK NİŞAN SÜSPANSİYONU & 4 AKSLI YÜRÜYÜŞ TAKIMI'
    };

    function makePart(cfg, attachToGround) {
      const g = createPartGroup({
        id: cfg.id,
        name: cfg.name,
        subsystem: cfg.sub,
        subLabel: SUB_LABELS[cfg.sub] || 'ALT SİSTEM: STRV 103 S-TANK',
        desc: cfg.desc,
        material: cfg.material || 'İsveç Bofors Zırh Çeliği (270–340 BHN)',
        weight: cfg.weight || '850 kg',
        spec: cfg.spec || 'Bofors / Landsverk — Strv 103C',
        location: cfg.location || 'Ana Gövde',
        basePos: [0, 0, 0],
        explodeVec: cfg.explode || [0, 1.2, 0],
        isOuterShell: !!cfg.isOuterShell
      });
      if (attachToGround) {
        yawPivot.add(g);
      } else {
        hullPitchGroup.add(g);
      }
      return g;
    }

    // ALT SİSTEM 1: 78° Eğimli Yivli Glasis Zırhı, Dozer Bıçağı & Anti-HEAT Kafesi (hull_armor — 3 Grup)
    const partSlopedHull = makePart({
      id: 's103_sloped_hull',
      name: '1. 78° Eğimli Yivli (Ribbed) Ön Glasis Zırhı, Alçak Gövde & Yan Yakıt Bidonu Etekleri',
      sub: 'hull_armor',
      isOuterShell: true,
      explode: [0, 1.3, 0],
      spec: 'Tavan Yüksekliği: 1,90 m (Kupola: 2,14 m) | Glasis: 40 mm @ 78° (~192 mm LOS) + Yivli Kaydırma Nervürleri',
      desc: 'Tareti tamamen ortadan kaldırarak yüksekliği 1,90 metreye indiren kama kesitli zırhlı gövde. Ön glasis üzerindeki yatay çelik yivler (ribs) APFSDS oklu mermilerin sekmesini önlemek yerine zırh üzerinde kırılarak enerjisini kaybetmesini sağlar; yan eteklerdeki 18×22 litrelik dizel bidonları (Strv 103C) ise çukur imlalı (HEAT) mermilere karşı boşluklu zırh kalkanı oluşturur.'
    }, false);

    const partDozerBlade = makePart({
      id: 's103_dozer_blade',
      name: '13. BT-41 Gövde Altına Katlanan Hidrolik İstihkâm Dozer Bıçağı',
      sub: 'hull_armor',
      explode: [0, -0.7, 2.2],
      spec: 'Genişlik: 3,00 m | Açılma Açısı: 0° (Katlı) -> 115° (Kazı Konumu) | Görev: Kendi Mevziini Kazma (Hull-Down)',
      desc: 'Her Strv 103C tankının alt ön zırhına entegre edilen katlanır istihkâm dozer bıçağı. Mürettebat dışarı çıkmadan birkaç dakika içinde kendi koruganını (hull-down ateş çukuru) kazabilir ve alt gövdeyi ilave çelik zırhla korur.'
    }, false);

    const partAntiHeatFence = makePart({
      id: 's103_anti_heat_fence',
      name: '14. Ön Glasis Anti-HEAT Çubuk Zırh Kafesi & Çift Sabit 7,62 mm Ksp 58 Kutusu',
      sub: 'hull_armor',
      explode: [0, 0.9, 2.6],
      spec: 'Koruma: Çukur İmlalı (HEAT) Başlık Tetikleme Izgarası | İkincil Silah: Sol Ön 2 × 7,62 mm Ksp 58',
      desc: 'Uzun yıllar devlet sırrı olarak gizli tutulan ve yalnız savaş durumunda ön glasis önüne dikilen çelik çubuklu Anti-HEAT kafesi ile sol ön zırh kutusuna sabitlenmiş çift 7,62 mm Ksp 58 makineli tüfeği.'
    }, false);

    // ALT SİSTEM 2: Sabit 105 mm Bofors L74 Top & 50 Mermilik Otomatik Doldurucu (gun_autoloader — 5 Grup)
    const partBoforsL74 = makePart({
      id: 's103_bofors_l74',
      name: '2. Gövdeye Sabit 105 mm Bofors L74 (L/62) Uzun Yivli Top Namlusu & Duman Tahliyesi',
      sub: 'gun_autoloader',
      explode: [0, 0.6, 2.8],
      spec: 'Kalibre: 105 mm L/62 (6,51 m Uzun Namlu) | İlk Hız: 1.500 m/s (APDS) | Montaj: Gövdeye Rijit Sabit',
      desc: 'Standart NATO L7 (L/52) topundan tam 1 metre (10 kalibre) daha uzun olan Bofors L74 namlusu. Topun gövdeye rijit bağlanması sayesinde namlu salınımı minimumdur ve çok yüksek ilk hızla üstün zırh delişi sağlar.'
    }, false);

    const partBreechRecoil = makePart({
      id: 's103_breech_recoil',
      name: '3. Gövde İçi Kama Bloğu, Hidropnömatik Geri Tepme Silindirleri & Sabit Beşik',
      sub: 'gun_autoloader',
      explode: [0, 1.4, 0.2],
      spec: 'Kama: Dikey Kayar Kama | Geri Tepme Kursu: 340 mm | Konum: Mürettebat Bölmesi Ortası',
      desc: 'Tankın tam merkezinde, sürücü/nişancı (sol) ile komutanın (sağ) arasından geçen 105 mm kama bloğu ve hidropnömatik geri tepme frenleri. Taret sepeti olmadığı için geri tepme kuvveti doğrudan ana şasi kirişlerine aktarılır.'
    }, false);

    const partAutoloaderMags = makePart({
      id: 's103_autoloader_mags',
      name: '4. Kıç Çift Otomatik Doldurucu Şarjörü (2 × 25 = 50 Adet 105 mm Mermi Rafı)',
      sub: 'gun_autoloader',
      explode: [0, 1.5, -2.2],
      spec: 'Kapasite: 50 Mermi (Sol 25 + Sağ 25) | Atış Hızı: 15 Mermi/dk (4 Saniyede 1 Atış!)',
      desc: 'Gövdenin en arkasında yer alan iki bağımsız zırhlı dikey şarjör (APDS, HEAT ve HE mermileri). Hidrolik tokmak mermiyi 4 saniyede bir doğrudan sabit kamaya sürer; bu sayede 4 kişilik mürettebat 3 kişiye indirilmiştir.'
    }, false);

    const partRearEjector = makePart({
      id: 's103_rear_ejector',
      name: '5. Kıç Zırh Otomatik Boş Kovan Fırlatma Kapakçığı & Fırlatılan Pirinç Kovan',
      sub: 'gun_autoloader',
      explode: [0, 0.8, -3.2],
      spec: 'Mekanizma: Geri Tepme Enerjili Kıç Kapakçık | Avantaj: Mürettebat Bölmesinde Sıfır Barut Gazı',
      desc: 'Ateşleme anında geri tepen kama, boş pirinç kovanı tankın içine düşürmek yerine kıç zırhtaki otomatik yaylı kapakçıktan doğrudan tankın arkasına fırlatır!'
    }, false);

    const partMuzzleBlast = makePart({
      id: 's103_muzzle_blast',
      name: '15. 105 mm Bofors L74 Namlu Alevi & APDS-T Sabot Çekirdeği',
      sub: 'gun_autoloader',
      explode: [0, 0.4, 3.8],
      spec: 'Mühimmat: 105×617mmR slpprj m/66 (APDS-T) / slpprj m/80 (APFSDS-T)',
      desc: 'Bofors L74 L/62 namlusundan 1.500 m/s hızla çıkan zırh delici sabot mermisi ve yüksek basınçlı namlu ağzı şok konisi.'
    }, false);

    // ALT SİSTEM 3: CODAG (K60 Dizel + Boeing 553 Türbin) Güç Paketi & Mürettebat (codag_crew — 3 Grup)
    const partK60Diesel = makePart({
      id: 's103_k60_diesel',
      name: '6. Ön Sağ: Rolls-Royce K60 İki Zamanlı Karşıt Pistonlu (Opposed-Piston) Dizel Motor',
      sub: 'codag_crew',
      explode: [1.5, 1.5, 1.6],
      spec: 'Tip: 6 Silindir, 12 Karşıt Piston, Çift Kranklı 2 Zamanlı Çok Yakıtlı Dizel | Güç: 240 hp (Strv 103C: Detroit 6V-53T 290 hp)',
      desc: 'Ön glasis zırhının hemen altında, mürettebatı önden gelen mermilere karşı koruyan ikinci bir metal kalkan olarak yerleştirilen yassı karşıt pistonlu dizel motor. Normal seyir ve hassas hidropnömatik/hidrostatik nişan manevralarında tek başına çalışır.'
    }, false);

    const partBoeingTurbine = makePart({
      id: 's103_boeing_turbine',
      name: '7. Ön Sol: Boeing 553 (Caterpillar) Gaz Türbini & CODAG Birleştirme Şanzımanı',
      sub: 'codag_crew',
      explode: [-1.5, 1.5, 1.6],
      spec: 'Gaz Türbini: Boeing 553 (490 hp) | Toplam CODAG Gücü: 730 hp | Direksiyon: Hidrostatik Rejeneratif',
      desc: 'Tarihte bir muharebe tankında kullanılan ilk gaz türbini! Soğuk İskandinav kışında anında çalışır ve yüksek hız/engebeli arazi hücumunda dizel motora ek 490 beygir güç katar. Önündeki birleştirme dişli kutusu ve hidrostatik direksiyon tankı nokta etrafında döndürür.'
    }, false);

    const partCrewStation = makePart({
      id: 's103_crew_station',
      name: '8. 3 Kişilik Çift Yönlü Mürettebat Bölmesi: Sürücü/Nişancı, Komutan & Arka Sürücü',
      sub: 'codag_crew',
      explode: [0, 2.0, -0.4],
      spec: 'Mürettebat: 3 Kişi (Solda Sürücü/Nişancı, Sağda Komutan, Sol Arkada Geriye Bakan Telsizci/Arka Sürücü)',
      desc: 'Hem sürücü/nişancı hem de komutan ikiz gidon lövyesiyle tankı tek başına sürüp nişan alarak ateşleyebilir! Sol arkadaki 3. mürettebat ise tamamen geriye bakar ve kendi gaz/fren/direksiyon pedallarıyla tankı ileri gittiği hızda (50 km/sa) geri geri sürebilir.'
    }, false);

    // ALT SİSTEM 4: Hidropnömatik Nişan Süspansiyonu & Yürüyüş Takımı (hydro_suspension — 4 Grup)
    const partHydroActuators = makePart({
      id: 's103_hydro_actuators',
      name: '9. Hidropnömatik Süspansiyon Silindirleri, Azot Akümülatör Küreleri & Basınç Boruları',
      sub: 'hydro_suspension',
      explode: [0, 0.9, -0.6],
      spec: 'Dikey Nişan Açısı: -11° Alçalış .. +12° Yükseliş | Çalışma Basıncı: ~210 bar Hidrolik + Azot Yastığı',
      desc: 'Nişancının gidon kolunu öne-arkaya eğmesiyle 1. (ön) ve 4. (arka) yol tekerleği salıncak kollarına yüksek basınçlı yağ pompalayan hidropnömatik ünite. Gövdeyi saniyede ~4° hızla eğerek sabit topu hedefe kilitler.'
    }, false);

    const partRoadwheelsLeft = makePart({
      id: 's103_roadwheels_left',
      name: '10. Sol 4 × Büyük Kauçuk Kaplı Çelik Yol Tekerleği & Hidropnömatik Salıncak Kolları',
      sub: 'hydro_suspension',
      explode: [-1.8, 0.2, 0],
      spec: 'Tekerlek Çapı: 780 mm (Centurion Tipi Çift Disk) | Aks Sayısı: Yan Başına Yalnız 4 Aks',
      desc: 'Nokta dönüşü (neutral steer) direncini azaltmak için kısa palet temas boyuna dizilen 4 büyük çiftli yol tekerleği ve gövde eğimini sağlayan hidropnömatik krank kolları.'
    }, true);

    const partRoadwheelsRight = makePart({
      id: 's103_roadwheels_right',
      name: '11. Sağ 4 × Büyük Kauçuk Kaplı Çelik Yol Tekerleği & Hidropnömatik Salıncak Kolları',
      sub: 'hydro_suspension',
      explode: [1.8, 0.2, 0],
      spec: 'Tekerlek Çapı: 780 mm | Pivot Akslar: 2. ve 3. Akslar Merkez Dayanak, 1. ve 4. Akslar Aktif Yunuslama',
      desc: 'Sağ yandaki 4 büyük çiftli yol tekerleği ve hidropnömatik salıncak kolları. Tank gövdesi ±11° eğilirken 4 tekerlek de zemine (y = 0,000 m) tam basmaya devam eder.'
    }, true);

    const partTracksSprockets = makePart({
      id: 's103_tracks_sprockets',
      name: '12. Ön Cer Dişlileri (Drive Sprockets), Arka İstikamet Tekerlekleri & 670 mm Çelik Paletler',
      sub: 'hydro_suspension',
      explode: [0, -0.4, 0],
      spec: 'Palet Genişliği: 670 mm | Cer Dişlisi: Önde (CODAG Şanzımandan Doğrudan Tahrik)',
      desc: 'Önde yer alan 12 dişli cer tekerlekleri, arkadaki gergi (istikamet) tekerlekleri, üst taşıyıcı makaralar ve 670 mm genişliğindeki İsveç kış paletleri (y = 0,000 m).'
    }, true);

    // ========================================================================
    // GEOMETRİ İNŞASI (1:1 TAM ÖLÇEK: Gövde Boyu 7,04 m, Namlu ile 8,99 m)
    // ========================================================================

    // --- 1. 78° Eğimli Yivli Glasis & Gövde Kabuğu (partSlopedHull) ---
    const hullGeo = createStrv103HullGeometry(THREE);
    addMesh(partSlopedHull, hullGeo, matHullOuter, [0, 0, 0]);

    // Ön ve kıç zırh aynaları
    addMesh(partSlopedHull, new THREE.BoxGeometry(2.44, 0.16, 0.12), matArmorSec, [0, 0.88, 3.44], [0.22, 0, 0]);
    addMesh(partSlopedHull, new THREE.BoxGeometry(2.68, 0.96, 0.08), matHullOuter, [0, 1.06, -3.45]);

    // Ön glasis üzerindeki karakteristik yatay çelik nervür barları (APFSDS kırıcı kaburgalar)
    for (let r = 0; r < 9; r++) {
      const t = r / 8;
      const zRib = 0.85 + t * 2.40;
      const yRib = 1.80 - t * 0.82;
      const wRib = 2.68 - t * 0.36;
      addMesh(partSlopedHull, new THREE.BoxGeometry(wRib, 0.028, 0.045), matArmorSec, [0, yRib, zRib]);
    }

    // Ön motor bakım kapakları üzerinde 2 parçalı menteşeli panjur ızgaraları
    [-0.58, 0.58].forEach(xLouv => {
      addMesh(partSlopedHull, new THREE.BoxGeometry(0.88, 0.035, 1.15), matArmorSec, [xLouv, 1.56, 1.65], [0.30, 0, 0]);
    });

    // Yan eteklerde 9'ar adet (toplam 18 adet) 22 litrelik Strv 103C dizel yakıt bidonu (Jerrycan zırh etekleri!)
    [-1.68, 1.68].forEach(xSide => {
      // Üst çamurluk rafı
      addMesh(partSlopedHull, new THREE.BoxGeometry(0.18, 0.05, 6.40), matArmorSec, [xSide, 1.14, -0.10]);
      for (let j = 0; j < 9; j++) {
        const zCan = -2.65 + j * 0.64;
        addMesh(partSlopedHull, new THREE.BoxGeometry(0.14, 0.46, 0.56), matSkirtFuel, [xSide, 0.90, zCan]);
        // Bidon X kabartma nervürü
        addMesh(partSlopedHull, new THREE.BoxGeometry(0.15, 0.32, 0.04), matArmorSec, [xSide, 0.90, zCan], [0.6, 0, 0]);
      }
    });

    // --- 2. Gövdeye Sabit 105 mm Bofors L74 (L/62) Uzun Top Namlusu (partBoforsL74) ---
    // Namlu ekseni: x = 0, y = 1,42 m; glasis çıkış boğazı z = +1,45 m'den namlu ağzı z = +5,45 m'ye uzanır!
    const Y_GUN = 1.42;
    // Gövde üstü zırhlı namlu boğaz bileziği (collar)
    addMesh(partBoforsL74, new THREE.BoxGeometry(0.42, 0.34, 0.95), matArmorSec, [0, Y_GUN - 0.02, 1.35]);
    // Ana 105 mm L/62 namlu borusu (termal ceketli)
    addMesh(partBoforsL74, new THREE.CylinderGeometry(0.082, 0.105, 4.10, 20), matBarrelSteel, [0, Y_GUN, 3.40], [Math.PI / 2, 0, 0]);
    // Eksantrik duman tahliye silindiri (Bore Evacuator / Fume Extractor, z = +3,15 m)
    addMesh(partBoforsL74, new THREE.CylinderGeometry(0.135, 0.135, 0.68, 20), matArmorSec, [0, Y_GUN + 0.015, 3.15], [Math.PI / 2, 0, 0]);
    // Termal ceket kelepçe bilezikleri ve namlu ağzı MRS aynası
    [2.25, 2.75, 3.65, 4.35, 5.10].forEach(zBand => {
      addMesh(partBoforsL74, new THREE.CylinderGeometry(0.092, 0.092, 0.05, 18), matArmorSec, [0, Y_GUN, zBand], [Math.PI / 2, 0, 0]);
    });
    addMesh(partBoforsL74, new THREE.CylinderGeometry(0.096, 0.086, 0.14, 20), matBarrelSteel, [0, Y_GUN, 5.42], [Math.PI / 2, 0, 0]);
    addMesh(partBoforsL74, new THREE.CylinderGeometry(0.052, 0.052, 0.16, 16), new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 }), [0, Y_GUN, 5.43], [Math.PI / 2, 0, 0]);

    // --- 3. Gövde İçi Kama Bloğu & Hidropnömatik Geri Tepme Silindirleri (partBreechRecoil) ---
    // Sabit top beşiği (cradle)
    addMesh(partBreechRecoil, new THREE.BoxGeometry(0.54, 0.12, 1.65), matInteriorAlloy, [0, Y_GUN - 0.18, 0.10]);
    // İkiz hidropnömatik geri tepme ve yerine getirme (recuperator) silindirleri
    [-0.18, 0.18].forEach(xRec => {
      addMesh(partBreechRecoil, new THREE.CylinderGeometry(0.068, 0.068, 1.45, 14), matInteriorAlloy, [xRec, Y_GUN + 0.11, 0.25], [Math.PI / 2, 0, 0]);
    });

    // Atışta geriye (-Z) kayan 105 mm kama bloğu ve iç namlu uzantısı
    const breechRecoilGrp = new THREE.Group();
    partBreechRecoil.add(breechRecoilGrp);
    addMesh(breechRecoilGrp, new THREE.CylinderGeometry(0.115, 0.125, 1.35, 18), matInteriorAlloy, [0, Y_GUN, 0.35], [Math.PI / 2, 0, 0]);
    addMesh(breechRecoilGrp, new THREE.BoxGeometry(0.38, 0.36, 0.44), matBarrelSteel, [0, Y_GUN, -0.42]);
    // Dikey kama bloğu (vertical sliding wedge)
    addMesh(breechRecoilGrp, new THREE.BoxGeometry(0.26, 0.32, 0.24), matBrass, [0, Y_GUN + 0.04, -0.42]);

    // --- 4. Kıç Çift Otomatik Doldurucu Şarjörü (2 × 25 = 50 Mermi) (partAutoloaderMags) ---
    // Sol ve sağ zırhlı dikey mermi kasetleri (z = -1,55 .. -3,20 m) ve merkez besleme oluğu
    [-0.56, 0.56].forEach(xMag => {
      addMesh(partAutoloaderMags, new THREE.BoxGeometry(0.62, 0.86, 1.62), matInteriorAlloy, [xMag, 1.18, -2.35]);
      // Şarjör içinde dizili 105 mm pirinç kovanlı mermiler (her yanda 2 sıra × 5 görünür mermi)
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 5; col++) {
          const ySh = 0.94 + row * 0.24;
          const xSh = xMag + (col - 2) * 0.11;
          addMesh(partAutoloaderMags, new THREE.CylinderGeometry(0.048, 0.052, 0.62, 10), matBrass, [xSh, ySh, -2.18], [Math.PI / 2, 0, 0]);
          addMesh(partAutoloaderMags, new THREE.ConeGeometry(0.046, 0.28, 10), matBarrelSteel, [xSh, ySh, -1.73], [Math.PI / 2, 0, 0]);
        }
      }
    });
    // Merkez hidrolik mermi sürme oluğu ve zincirli tokmak (rammer)
    addMesh(partAutoloaderMags, new THREE.BoxGeometry(0.32, 0.14, 2.15), matInteriorAlloy, [0, Y_GUN - 0.14, -1.75]);
    const autoloaderRoundMesh = addMesh(partAutoloaderMags, new THREE.CylinderGeometry(0.052, 0.052, 0.82, 12), matBrass, [0, Y_GUN, -1.45], [Math.PI / 2, 0, 0]);

    // --- 5. Kıç Zırh Otomatik Boş Kovan Fırlatma Kapakçığı & Fırlatılan Kovan (partRearEjector) ---
    // Kıç plakada (z = -3,45 m, y = 1,42 m) dairesel kovan fırlatma yuvası ve yukarı açılan zırhlı kapakçık
    addMesh(partRearEjector, new THREE.CylinderGeometry(0.14, 0.14, 0.12, 16), matArmorSec, [0, Y_GUN, -3.45], [Math.PI / 2, 0, 0]);
    const rearHatchPivot = new THREE.Group();
    rearHatchPivot.position.set(0, Y_GUN + 0.14, -3.48);
    partRearEjector.add(rearHatchPivot);
    addMesh(rearHatchPivot, new THREE.CylinderGeometry(0.15, 0.15, 0.04, 16), matArmorSec, [0, -0.14, -0.02], [Math.PI / 2, 0, 0]);

    // Ateşlemede kıçtan dışarı (-Z) fırlayan sıcak boş pirinç kovan
    const ejectedCasingGrp = new THREE.Group();
    ejectedCasingGrp.position.set(0, Y_GUN, -3.50);
    partRearEjector.add(ejectedCasingGrp);
    addMesh(ejectedCasingGrp, new THREE.CylinderGeometry(0.052, 0.056, 0.62, 14), matBrass, [0, 0, 0], [Math.PI / 2, 0, 0]);
    ejectedCasingGrp.visible = false;

    // --- 6. Ön Sağ: Rolls-Royce K60 İki Zamanlı Karşıt Pistonlu Dizel Motor (partK60Diesel) ---
    // Sağ ön motor bölmesinde (x = +0,54 m, y = 0,88 m, z = +1,95 m) çift kranklı yassı K60 dizel
    addMesh(partK60Diesel, new THREE.BoxGeometry(0.62, 0.56, 1.32), matDieselBlue, [0.54, 0.88, 1.95]);
    // Üst ve alt karşıt piston krank karterleri ve egzoz manifoldu
    addMesh(partK60Diesel, new THREE.CylinderGeometry(0.12, 0.12, 1.38, 14), matInteriorAlloy, [0.54, 1.16, 1.95], [Math.PI / 2, 0, 0]);
    addMesh(partK60Diesel, new THREE.CylinderGeometry(0.12, 0.12, 1.38, 14), matInteriorAlloy, [0.54, 0.60, 1.95], [Math.PI / 2, 0, 0]);
    // Dönen K60 krank volanı ve soğutma fanı
    const k60FlywheelGrp = new THREE.Group();
    k60FlywheelGrp.position.set(0.54, 0.88, 2.66);
    partK60Diesel.add(k60FlywheelGrp);
    addMesh(k60FlywheelGrp, new THREE.CylinderGeometry(0.22, 0.22, 0.08, 18), matInteriorAlloy, [0, 0, 0], [Math.PI / 2, 0, 0]);
    for (let b = 0; b < 6; b++) {
      const a = (b / 6) * Math.PI * 2;
      addMesh(k60FlywheelGrp, new THREE.BoxGeometry(0.38, 0.04, 0.09), matBrass, [0, 0, 0], [0, 0, a]);
    }

    // --- 7. Ön Sol: Boeing 553 Gaz Türbini & CODAG Birleştirme Şanzımanı (partBoeingTurbine) ---
    // Sol ön motor bölmesinde (x = -0,54 m, y = 0,88 m, z = +1,85 m) Boeing 553 gaz türbini
    addMesh(partBoeingTurbine, new THREE.CylinderGeometry(0.24, 0.28, 1.18, 18), matTurbineOrange, [-0.54, 0.88, 1.85], [Math.PI / 2, 0, 0]);
    addMesh(partBoeingTurbine, new THREE.CylinderGeometry(0.29, 0.24, 0.36, 18), matInteriorAlloy, [-0.54, 0.88, 1.12], [Math.PI / 2, 0, 0]);
    // Dönen gaz türbini kompresör çarkı
    const boeingRotorGrp = new THREE.Group();
    boeingRotorGrp.position.set(-0.54, 0.88, 2.46);
    partBoeingTurbine.add(boeingRotorGrp);
    addMesh(boeingRotorGrp, new THREE.CylinderGeometry(0.21, 0.21, 0.08, 18), matBrass, [0, 0, 0], [Math.PI / 2, 0, 0]);
    for (let b = 0; b < 8; b++) {
      const a = (b / 8) * Math.PI * 2;
      addMesh(boeingRotorGrp, new THREE.BoxGeometry(0.36, 0.03, 0.09), matInteriorAlloy, [0, 0, 0], [0, 0, a]);
    }
    // En önde (z = +2,88 m) CODAG birleştirme dişli kutusu ve hidrostatik rejeneratif direksiyon ünitesi
    addMesh(partBoeingTurbine, new THREE.BoxGeometry(1.95, 0.42, 0.44), matInteriorAlloy, [0, 0.84, 2.92]);

    // --- 8. 3 Kişilik Çift Yönlü Mürettebat Bölmesi & Komutan Kupolası (partCrewStation) ---
    // Sol: Sürücü / Nişancı koltuğu (z = -0,15 m, x = -0,68 m) + İkiz nişan/sürüş gidonu ve periskobu
    addMesh(partCrewStation, new THREE.BoxGeometry(0.44, 0.48, 0.46), matArmorSec, [-0.68, 0.96, -0.15]);
    addMesh(partCrewStation, new THREE.CylinderGeometry(0.03, 0.03, 0.36, 10), matInteriorAlloy, [-0.68, 1.24, 0.22], [0.4, 0, 0]);
    addMesh(partCrewStation, new THREE.BoxGeometry(0.32, 0.14, 0.06), matBrass, [-0.68, 1.38, 0.30]);
    addMesh(partCrewStation, new THREE.BoxGeometry(0.26, 0.18, 0.28), matArmorSec, [-0.68, 1.88, 0.32]);

    // Sağ: Komutan koltuğu (z = -0,25 m, x = +0,68 m) + Jiroskopik stabilize OPS-1 döner komutan kupolası (tavan y = 2,14 m!)
    addMesh(partCrewStation, new THREE.BoxGeometry(0.44, 0.48, 0.46), matArmorSec, [0.68, 0.96, -0.25]);
    addMesh(partCrewStation, new THREE.CylinderGeometry(0.38, 0.42, 0.24, 20), matArmorSec, [0.68, 1.94, -0.15]);
    addMesh(partCrewStation, new THREE.CylinderGeometry(0.28, 0.34, 0.12, 18), matHullOuter, [0.68, 2.08, -0.15]);
    // Komutan kupolası makineli tüfek konsolu
    addMesh(partCrewStation, new THREE.CylinderGeometry(0.022, 0.022, 0.58, 10), matBarrelSteel, [0.92, 2.06, 0.18], [Math.PI / 2, 0, 0]);

    // Sol Arka: GERİYE (-Z) BAKAN Telsizci / Arka Sürücü koltuğu ve arka sürüş direksiyonu (z = -0,98 m, x = -0,68 m)
    addMesh(partCrewStation, new THREE.BoxGeometry(0.44, 0.46, 0.44), matDieselBlue, [-0.68, 0.94, -0.98]);
    addMesh(partCrewStation, new THREE.BoxGeometry(0.30, 0.14, 0.06), matBrass, [-0.68, 1.32, -1.32]);

    // --- 9. Gövde İçi Hidropnömatik Süspansiyon Silindirleri & Azot Küreleri (partHydroActuators) ---
    [-1.12, 1.12].forEach(xAct => {
      // Ön (z=+1.65) ve arka (z=-1.65) yüksek basınçlı hidropnömatik aktüatör silindirleri ve yeşil azot küreleri
      [1.65, -1.65].forEach(zAct => {
        addMesh(partHydroActuators, new THREE.CylinderGeometry(0.095, 0.095, 0.72, 14), matInteriorAlloy, [xAct, 0.76, zAct], [Math.PI / 2, 0, 0]);
        addMesh(partHydroActuators, new THREE.SphereGeometry(0.13, 14, 12), matArmorSec, [xAct * 0.88, 0.92, zAct]);
      });
    });

    // --- 10 & 11. Sol ve Sağ 4 × Büyük Yol Tekerleği & Hidropnömatik Salıncak Kolları (y = 0,000 m) ---
    // 4 aksın Z konumları: z = [+2.05, +0.68, -0.68, -2.05] m
    // Palet alt baklası kalınlığı 0,025 m; tekerlek yarıçapı R = 0,39 m -> tekerlek merkezi y = 0,415 m (alt yüzey tam y = 0,000 m!)
    const AXLE_Z = [2.05, 0.68, -0.68, -2.05];
    const Y_WHEEL = 0.415;
    const R_WHEEL = 0.39;
    const roadWheelMeshes = [];
    const swingArmPivots = [];

    function buildSideSuspension(parent, sideSign) {
      const xWheel = sideSign * 1.48;
      const xArm = sideSign * 1.32;
      AXLE_Z.forEach((zAx, idx) => {
        // Hidropnömatik salıncak kolu (gövde eğildikçe tekerlekle gövde arasındaki açıyı kompanze eder)
        const armPiv = new THREE.Group();
        armPiv.position.set(xArm, Y_WHEEL, zAx);
        parent.add(armPiv);
        addMesh(armPiv, new THREE.BoxGeometry(0.10, 0.14, 0.46), matInteriorAlloy, [0, 0.14, 0.16], [-0.45, 0, 0]);
        swingArmPivots.push({ grp: armPiv, zAx });

        // Çift diskli kauçuk kaplı çelik yol tekerleği (döner!)
        const whGrp = new THREE.Group();
        whGrp.position.set(xWheel, Y_WHEEL, zAx);
        parent.add(whGrp);
        [-0.09, 0.09].forEach(dx => {
          addMesh(whGrp, new THREE.CylinderGeometry(R_WHEEL, R_WHEEL, 0.14, 24), matRubber, [dx, 0, 0], [0, 0, Math.PI / 2]);
          addMesh(whGrp, new THREE.CylinderGeometry(R_WHEEL * 0.72, R_WHEEL * 0.72, 0.15, 20), matArmorSec, [dx, 0, 0], [0, 0, Math.PI / 2]);
        });
        addMesh(whGrp, new THREE.CylinderGeometry(0.11, 0.11, 0.36, 14), matInteriorAlloy, [0, 0, 0], [0, 0, Math.PI / 2]);
        roadWheelMeshes.push(whGrp);
      });
    }

    buildSideSuspension(partRoadwheelsLeft, -1);
    buildSideSuspension(partRoadwheelsRight, 1);

    // --- 12. Ön Cer Dişlileri, Arka İstikamet Tekerlekleri & 670 mm Çelik Paletler (partTracksSprockets) ---
    const sprocketMeshes = [];
    [-1.48, 1.48].forEach(xTr => {
      // Ön Cer Dişlisi (Drive Sprocket: z = +3,02 m, y = 0,74 m)
      const spr = new THREE.Group();
      spr.position.set(xTr, 0.74, 3.02);
      partTracksSprockets.add(spr);
      addMesh(spr, new THREE.CylinderGeometry(0.34, 0.34, 0.32, 16), matArmorSec, [0, 0, 0], [0, 0, Math.PI / 2]);
      for (let t = 0; t < 12; t++) {
        const a = (t / 12) * Math.PI * 2;
        addMesh(spr, new THREE.BoxGeometry(0.34, 0.06, 0.08), matInteriorAlloy, [0, Math.cos(a) * 0.35, Math.sin(a) * 0.35], [a, 0, 0]);
      }
      sprocketMeshes.push(spr);

      // Arka Gergi / İstikamet Tekerleği (Idler Wheel: z = -3,02 m, y = 0,72 m)
      const idl = new THREE.Group();
      idl.position.set(xTr, 0.72, -3.02);
      partTracksSprockets.add(idl);
      addMesh(idl, new THREE.CylinderGeometry(0.32, 0.32, 0.30, 20), matArmorSec, [0, 0, 0], [0, 0, Math.PI / 2]);
      sprocketMeshes.push(idl);

      // 2 × Üst taşıyıcı makara (Return Rollers)
      [-1.10, 1.10].forEach(zRet => {
        addMesh(partTracksSprockets, new THREE.CylinderGeometry(0.11, 0.11, 0.26, 14), matArmorSec, [xTr, 0.96, zRet], [0, 0, Math.PI / 2]);
      });

      // Alt palet kolu: tam y = 0,000 m zemine basar! (kalınlık 0,025 m -> merkez y = 0,0125 m)
      addMesh(partTracksSprockets, new THREE.BoxGeometry(0.64, 0.025, 4.30), matTrackSteel, [xTr, 0.0125, 0.0]);
      // Üst palet kolu
      addMesh(partTracksSprockets, new THREE.BoxGeometry(0.64, 0.03, 5.95), matTrackSteel, [xTr, 1.07, 0.0]);
      // Ön eğimli palet kolu (1. tekerlek z=+2,05, y=0,025'ten ön cer dişlisi z=+3,02, y=0,42'ye)
      addMesh(partTracksSprockets, new THREE.BoxGeometry(0.64, 0.03, 1.12), matTrackSteel, [xTr, 0.24, 2.58], [-0.38, 0, 0]);
      // Arka eğimli palet kolu (4. tekerlek z=-2,05, y=0,025'ten arka gergi tekerleği z=-3,02, y=0,42'ye)
      addMesh(partTracksSprockets, new THREE.BoxGeometry(0.64, 0.03, 1.12), matTrackSteel, [xTr, 0.24, -2.58], [0.38, 0, 0]);

      // Palet dişleri (grousers) — alt kolda y = 0,000 m zemine sıfır!
      for (let g = -10; g <= 10; g++) {
        addMesh(partTracksSprockets, new THREE.BoxGeometry(0.66, 0.022, 0.06), matArmorSec, [xTr, 0.011, g * 0.20]);
        addMesh(partTracksSprockets, new THREE.BoxGeometry(0.66, 0.025, 0.06), matArmorSec, [xTr, 1.085, g * 0.27]);
      }
    });

    // --- 13. BT-41 Gövde Altına Katlanan Hidrolik Dozer Bıçağı (partDozerBlade) ---
    const dozerPivot = new THREE.Group();
    dozerPivot.position.set(0, 0.76, 3.22);
    partDozerBlade.add(dozerPivot);
    // Sol ve sağ hidrolik itme kolları
    [-1.08, 1.08].forEach(xDz => {
      addMesh(dozerPivot, new THREE.BoxGeometry(0.08, 0.09, 0.72), matArmorSec, [xDz, -0.06, -0.32], [0.18, 0, 0]);
    });
    // Kavisli çelik dozer kepçesi (3,00 m genişlik)
    addMesh(dozerPivot, new THREE.BoxGeometry(2.96, 0.42, 0.06), matArmorSec, [0, -0.14, -0.66], [0.25, 0, 0]);
    addMesh(dozerPivot, new THREE.BoxGeometry(2.98, 0.08, 0.08), matInteriorAlloy, [0, -0.34, -0.62]);

    // --- 14. Ön Glasis Anti-HEAT Çubuk Zırh Kafesi & Çift Sabit 7,62 mm Ksp 58 (partAntiHeatFence) ---
    // Sol burun üstünde (x = -1,18 m, y = 1,08 m, z = +3,10 m) sabit çift 7,62 mm Ksp 58 makineli tüfek kutusu
    addMesh(partAntiHeatFence, new THREE.BoxGeometry(0.32, 0.22, 0.62), matArmorSec, [-1.18, 1.08, 3.05]);
    [-1.24, -1.12].forEach(xMg => {
      addMesh(partAntiHeatFence, new THREE.CylinderGeometry(0.014, 0.014, 0.52, 8), matBarrelSteel, [xMg, 1.08, 3.52], [Math.PI / 2, 0, 0]);
    });

    // Katlanır Anti-HEAT çubuk zırh kafesi (savunma modunda dikilir!)
    const antiHeatFenceGrp = new THREE.Group();
    antiHeatFenceGrp.position.set(0, 0.96, 3.38);
    partAntiHeatFence.add(antiHeatFenceGrp);
    addMesh(antiHeatFenceGrp, new THREE.BoxGeometry(2.56, 0.04, 0.04), matArmorSec, [0, 0.52, 0]);
    addMesh(antiHeatFenceGrp, new THREE.BoxGeometry(2.56, 0.04, 0.04), matArmorSec, [0, 0.04, 0]);
    for (let b = -10; b <= 10; b++) {
      // Merkezde 105 mm top namlusu için boşluk bırak
      if (Math.abs(b) <= 1) continue;
      addMesh(antiHeatFenceGrp, new THREE.CylinderGeometry(0.01, 0.01, 0.52, 6), matInteriorAlloy, [b * 0.12, 0.28, 0]);
    }

    // --- 15. 105 mm Bofors L74 Namlu Alevi & APDS-T Sabot Mermisi (partMuzzleBlast) ---
    const muzzleFlashGrp = new THREE.Group();
    muzzleFlashGrp.position.set(0, Y_GUN, 5.50);
    partMuzzleBlast.add(muzzleFlashGrp);
    addMesh(muzzleFlashGrp, new THREE.ConeGeometry(0.36, 1.35, 14), matMuzzleBlast, [0, 0, 0.68], [Math.PI / 2, 0, 0]);
    addMesh(muzzleFlashGrp, new THREE.SphereGeometry(0.28, 12, 10), matMuzzleBlast, [0, 0, 0.18]);
    const apdsProjectile = addMesh(muzzleFlashGrp, new THREE.ConeGeometry(0.038, 0.48, 10), matInteriorAlloy, [0, 0, 1.2], [Math.PI / 2, 0, 0]);
    muzzleFlashGrp.visible = false;

    // ========================================================================
    // CANLI MEKANİK DURUM (STATE) VE ETKİLEŞİM MANTIĞI
    // ========================================================================
    const S = {
      pitchDeg: 0,              // Hidropnömatik Gövde Yunuslama Açısı (-11° Alçalış .. +12° Yükseliş)
      rpm: 2200,                // CODAG Motor Devri (0 .. 3600 RPM)
      hullYawDeg: 0,            // Hidrostatik Gövde Yönü (-25° .. +25° yatay nişan)
      dozerDeployed: false,     // BT-41 Gövde Altı Dozer Bıçağı Açık mı? (terrain butonu)
      autoAimSweep: false,      // Otomatik Hidropnömatik Nişan Tarama (sweep butonu)
      mode: 'defense',          // 'defense' (Savunma Mevzii / Anti-HEAT Kafes Açık) | 'cruise' (Yol Seyir Kipi)
      ammoCount: 50,            // 50 adet 105 mm L74 otomatik doldurucu mermisi
      firing: false,
      fireProgress: 0,
      engineAngle: 0,
      wheelAngle: 0,
      animTime: 0
    };

    function syncVisualState(dt) {
      const stepDt = Math.max(0, Math.min(dt || 0, 0.1));
      S.animTime += stepDt;

      // Otomatik hidropnömatik nişan taraması açıksa gövde eğimini ve yönünü yumuşakça oynat
      if (S.autoAimSweep && stepDt > 0) {
        S.pitchDeg = Math.round(Math.sin(S.animTime * 1.5) * 90) / 10;
        S.hullYawDeg = Math.round(Math.cos(S.animTime * 0.9) * 14);
      }

      // 1. Hidropnömatik Süspansiyonla Gövde Yunuslama (Pitch: -11° .. +12°) ve Hidrostatik Yön (Yaw: -25° .. +25°)
      // Gövde merkezi (0, 1.08, 0) etrafında eğilirken, 4 yol tekerleği ve alt palet kolu y = 0,000 m zeminde sabit kalır!
      const pitchRad = THREE.MathUtils.degToRad(S.pitchDeg);
      hullPitchGroup.position.set(0, Math.max(0, Math.abs(S.pitchDeg) * 0.008), 0);
      hullPitchGroup.rotation.x = -pitchRad;
      yawPivot.rotation.y = THREE.MathUtils.degToRad(S.hullYawDeg);

      // Salıncak kolları gövdenin ön/arka kalkışına göre açı değiştirir
      swingArmPivots.forEach(sp => {
        sp.grp.rotation.x = -(sp.zAx / 2.05) * pitchRad * 0.85;
      });

      // 2. CODAG Motor (Rolls-Royce K60 Dizel + Boeing 553 Gaz Türbini) ve Yürüyüş Takımı Kinematiği
      // KURAL: Gizli alt sınır YOKTUR; S.rpm === 0 iken tüm şaftlar ve tekerlekler tamamen durur!
      const omegaEngine = (S.rpm / 60) * 0.35;
      const dEng = omegaEngine * stepDt;
      S.engineAngle += dEng;
      S.wheelAngle += dEng * 0.28;

      k60FlywheelGrp.rotation.z = S.engineAngle;
      boeingRotorGrp.rotation.z = -S.engineAngle * 1.8; // Yüksek devirli gaz türbini rotoru
      roadWheelMeshes.forEach(w => { w.rotation.x = S.wheelAngle; });
      sprocketMeshes.forEach(s => { s.rotation.x = S.wheelAngle * 1.15; });

      // 3. BT-41 Katlanır İstihkâm Dozer Bıçağı (0 rad gövde altında katlı -> 1.85 rad öne-aşağı açık)
      dozerPivot.rotation.x = S.dozerDeployed ? 1.82 : 0.0;

      // 4. Anti-HEAT Çubuk Zırh Kafesi (Savunma modunda dik, seyir modunda glasis üzerine yatık)
      antiHeatFenceGrp.rotation.x = S.mode === 'defense' ? 0.0 : 1.35;

      // 5. 105 mm Bofors L74 Geri Tepme, Otomatik Doldurucu & Kıçtan Boş Kovan Fırlatma!
      if (S.firing) {
        S.fireProgress += stepDt * 1.6;
        if (S.fireProgress >= 1.0) {
          S.firing = false;
          S.fireProgress = 0;
          breechRecoilGrp.position.z = 0;
          rearHatchPivot.rotation.x = 0;
          ejectedCasingGrp.visible = false;
          muzzleFlashGrp.visible = false;
          autoloaderRoundMesh.position.z = -1.45;
        } else {
          // Geri tepme: ilk %25'te 0,34 m geriye teper, sonra yerine gelir
          const rec = S.fireProgress < 0.25
            ? (S.fireProgress / 0.25)
            : Math.max(0, 1 - (S.fireProgress - 0.25) / 0.55);
          breechRecoilGrp.position.z = -0.34 * rec;

          // Namlu alevi ve APDS sabot çekirdeği
          muzzleFlashGrp.visible = S.fireProgress < 0.45;
          apdsProjectile.position.z = 1.2 + S.fireProgress * 12.0;

          // Kıç zırh kovan fırlatma kapakçığı açılır ve boş pirinç kovan arkaya (-Z) fırlar!
          rearHatchPivot.rotation.x = -Math.sin(Math.min(1, S.fireProgress * 1.3) * Math.PI) * 1.15;
          ejectedCasingGrp.visible = true;
          ejectedCasingGrp.position.set(
            0,
            Y_GUN - 0.35 * S.fireProgress * S.fireProgress,
            -3.50 - S.fireProgress * 2.6
          );
          ejectedCasingGrp.rotation.x = S.fireProgress * 2.4;

          // Otomatik doldurucu yeni mermiyi kamaya sürer
          autoloaderRoundMesh.position.z = -1.45 + Math.sin(S.fireProgress * Math.PI) * 0.55;
        }
      } else {
        breechRecoilGrp.position.z = 0;
        rearHatchPivot.rotation.x = 0;
        ejectedCasingGrp.visible = false;
        muzzleFlashGrp.visible = false;
      }
    }

    syncVisualState(0);

    // ========================================================================
    // KAMERA AÇILARI VE 6 ADIMLI REHBERLİ TUR
    // ========================================================================
    const camPresets = {
      iso: { pos: [6.4, 3.1, 6.6], look: [0, 1.05, 0.4] },
      front: { pos: [1.8, 1.7, 7.4], look: [0, 1.15, 1.5] },
      breech: { pos: [3.2, 2.2, -2.6], look: [0, 1.25, -1.6] },
      engine: { pos: [2.8, 2.3, 3.2], look: [0, 1.0, 1.8] },
      suspension: { pos: [3.8, 1.2, 0.8], look: [0, 0.55, 0.2] },
      top: { pos: [0.1, 9.2, 0.1], look: [0, 1.0, 0] }
    };

    const tourSteps = [
      {
        title: 'Genel Bakış: 1967 Stridsvagn 103 ("S-Tank") — Taretsiz Ana Muharebe Tankı',
        desc: 'Sven Berge tarafından tasarlanan Strv 103, tareti tamamen kaldırarak yüksekliği 1,90 metreye indiren ve 78° eğimli yivli ön zırhıyla mermileri kıran benzersiz bir İsveç ana muharebe tankıdır.',
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'iso',
        part: partSlopedHull
      },
      {
        title: 'Hidropnömatik Süspansiyonla Nişan Alma (±11° Gövde Yunuslaması)',
        desc: 'Sabit 105 mm Bofors L74 topuna dikey yükseliş açısı vermek için 1. ve 4. aksın hidropnömatik kolları tüm tank gövdesini öne/arkaya yatırır! İlk kaydırıcıyla gövdenin eğilerek nişan alışını izleyin.',
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'suspension',
        part: partRoadwheelsRight
      },
      {
        title: 'X-Ray: Dünyanın İlk CODAG Tank Motoru (K60 Dizel + Boeing 553 Gaz Türbini)',
        desc: 'Ön zırhın hemen altında mürettebatı koruyan iki farklı motor yan yana çalışır: sağda 2 zamanlı karşıt pistonlu Rolls-Royce K60 dizel (seyir ve nişan için) ve solda 490 beygirlik Boeing 553 gaz türbini (hücum için).',
        explode: 0,
        cutaway: true,
        sub: 'all',
        cam: 'engine',
        part: partBoeingTurbine
      },
      {
        title: '50 Mermilik Çift Otomatik Doldurucu & Kıçtan Kovan Fırlatma (4 Sn/Atış)',
        desc: 'Kıçtaki 2×25 mermilik otomatik şarjör sabit topu 4 saniyede bir besler. Ateşle butonuna bastığınızda boş pirinç kovanın kıç zırhtaki kapakçıktan dışarı fırlatılışını izleyin!',
        explode: 0,
        cutaway: true,
        sub: 'all',
        cam: 'breech',
        part: partAutoloaderMags
      },
      {
        title: '3 Kişilik Çift Yönlü Mürettebat & Arkaya Bakan Sürücü',
        desc: 'Hem sürücü/nişancı hem de komutan tankı tek başına sürüp ateşleyebilir. Sol arkadaki telsizci ise tamamen geriye bakar ve kendi direksiyonuyla tankı 50 km/sa hızla geri geri kaçırabilir.',
        explode: 0,
        cutaway: true,
        sub: 'all',
        cam: 'top',
        part: partCrewStation
      },
      {
        title: 'BT-41 Katlanır İstihkâm Dozer Bıçağı & Anti-HEAT Çubuk Zırh Kafesi',
        desc: 'Gövde altına katlanan BT-41 dozer bıçağı sayesinde her Strv 103 dakikalar içinde kendi ateş mevziini (hull-down) kazar; ön glasis üzerindeki Anti-HEAT kafesi ise çukur imlalı roketleri erken patlatır.',
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'front',
        part: partDozerBlade
      }
    ];

    // ========================================================================
    // ADAPTÖR ARAYÜZÜ (UI) TANIMI
    // ========================================================================
    let activeScheme = 'foa_m90_splinter';
    let reliefEnabled = true;

    const ui = {
      title: '1967 STRIDSVAGN 103 ("S-TANK") — TARETSİZ HİDROPNÖMATİK TANK',
      sub: 'Gövdeye Sabit 105 mm Bofors L74 Top • Hidropnömatik Süspansiyonla Nişan • CODAG (Dizel + Gaz Türbini) & 4 Sn Otomatik Doldurucu',
      badge: 'STRV 103C ("S-TANK") — 1967',
      partCount: '15 Ana Grup',
      portraitCameraScale: 1.28,
      shadowExtent: 9,
      sliders: [
        { label: 'Hidropnömatik Gövde Eğimi (Top Yükselişi -11° .. +12°)', min: -11, max: 12, step: 0.5, fmt: v => `${v > 0 ? '+' : ''}${Number(v).toFixed(1)}°` },
        { label: 'CODAG Motor Devri (K60 Dizel + Boeing 553 Türbin)', min: 0, max: 3600, step: 100, fmt: v => `${Math.round(v)} RPM` },
        { label: 'Hidrostatik Gövde Yönü (Yatay Nişan -25° .. +25°)', min: -25, max: 25, step: 1, fmt: v => `${v > 0 ? '+' : ''}${Math.round(v)}°` }
      ],
      buttons: {
        terrain: '🚜 BT-41 Gövde Altı İstihkâm Dozer Bıçağı: KATLI',
        sweep: '🎯 Otomatik Hidropnömatik Nişan Tarama: KAPALI',
        mode: true
      },
      telemetryTag: 'BOFORS L74 & CODAG SİSTEMİ',
      statLabels: ['GÖVDE / TOP EĞİMİ', 'CODAG GÜÇ PAKETİ', 'OTOMATİK DOLDURUCU', 'ALÇAK PROFİL & KAFES'],
      camLabels: {
        iso: 'İzometrik Genel',
        front: '78° Yivli Glasis & Dozer',
        breech: 'Şarjör & Kovan Çıkışı',
        engine: 'CODAG (Dizel+Türbin)',
        suspension: 'Hidropnömatik Kollar',
        top: 'Üst (Çift Yönlü Ekip)'
      },
      texTitle: '🎨 İsveç Ordusu (P 4 / Norrland) & Müze Boya Şemaları',
      textures: Object.keys(SCHEMES).map(k => ({ key: k, label: SCHEMES[k].btn })),
      subsystems: [
        { key: 'hull_armor', label: '78° Yivli Glasis, Jerrycan Etek, Dozer & Anti-HEAT', count: 3, color: '#3b4d38' },
        { key: 'gun_autoloader', label: 'Sabit 105 mm L74 Top, 50 Mermi Şarjör & Kıç Atıcı', count: 5, color: '#d97706' },
        { key: 'codag_crew', label: 'CODAG (K60 Dizel + Boeing Türbin) & 3 Ekip', count: 3, color: '#0284c7' },
        { key: 'hydro_suspension', label: 'Hidropnömatik Süspansiyon & 4 Akslı Paletler', count: 4, color: '#475569' }
      ],
      activeTexture: () => activeScheme,
      textureLabel: () => SCHEMES[activeScheme].name,
      relief: () => reliefEnabled,
      reliefLabel: v => `🪨 78° Glasis APFSDS Kırıcı Çelik Yiv Dokusu: ${v ? 'AÇIK' : 'KAPALI'}`
    };

    function applyTextures(isBlueprint) {
      const sch = SCHEMES[activeScheme] || SCHEMES.foa_m90_splinter;
      myMeshes.forEach(m => {
        const mat = m.material;
        if (!mat || !mat.userData) return;
        const role = mat.userData.s103Role;
        let hex = null;
        if (role === 'armorMain') hex = sch.armorMain;
        else if (role === 'armorSecondary') hex = sch.armorSecondary;
        else if (role === 'skirtFuel') hex = sch.skirtFuel;
        else if (role === 'barrelSteel') hex = sch.barrelSteel;
        else if (role === 'interiorMetal') hex = sch.interiorMetal;
        else if (role === 'brass') hex = sch.brass;

        if (hex !== null) {
          if (m.userData && m.userData.origColor) m.userData.origColor.setHex(hex);
          if (!isBlueprint) mat.color.setHex(hex);
        }
        if (role === 'armorMain' || role === 'armorSecondary') {
          mat.bumpMap = (!isBlueprint && reliefEnabled) ? ribbedBump : null;
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
        slopedHull: partSlopedHull,
        boforsL74: partBoforsL74,
        breechRecoil: partBreechRecoil,
        autoloaderMags: partAutoloaderMags,
        rearEjector: partRearEjector,
        k60Diesel: partK60Diesel,
        boeingTurbine: partBoeingTurbine,
        crewStation: partCrewStation,
        hydroActuators: partHydroActuators,
        roadwheelsLeft: partRoadwheelsLeft,
        roadwheelsRight: partRoadwheelsRight,
        tracksSprockets: partTracksSprockets,
        dozerBlade: partDozerBlade,
        antiHeatFence: partAntiHeatFence,
        muzzleBlast: partMuzzleBlast
      },
      defaultPart: partBoforsL74,
      firePart: partRearEjector,

      update(dt) {
        syncVisualState(dt);
      },

      onSlider(idx, val) {
        const v = Number(val);
        if (idx === 0) {
          S.autoAimSweep = false;
          S.pitchDeg = Math.max(-11, Math.min(12, v));
        } else if (idx === 1) {
          S.rpm = Math.max(0, Math.min(3600, v));
        } else if (idx === 2) {
          S.autoAimSweep = false;
          S.hullYawDeg = Math.max(-25, Math.min(25, v));
        }
        syncVisualState(0);
        return {};
      },

      onButton(name) {
        if (name === 'terrain') {
          S.dozerDeployed = !S.dozerDeployed;
          ui.buttons.terrain = S.dozerDeployed
            ? '🚜 BT-41 Gövde Altı İstihkâm Dozer Bıçağı: AÇIK (KAZI)'
            : '🚜 BT-41 Gövde Altı İstihkâm Dozer Bıçağı: KATLI';
          syncVisualState(0);
          return {
            active: S.dozerDeployed,
            msg: S.dozerDeployed
              ? '🚜 BT-41 hidrolik dozer bıçağı gövde altından öne indirilerek mevzi kazı (hull-down) konumuna kilitlendi!'
              : 'BT-41 dozer bıçağı alt glasis zırhının altına katlandı.'
          };
        }
        if (name === 'sweep') {
          S.autoAimSweep = !S.autoAimSweep;
          ui.buttons.sweep = S.autoAimSweep
            ? '🎯 Otomatik Hidropnömatik Nişan Tarama: AÇIK'
            : '🎯 Otomatik Hidropnömatik Nişan Tarama: KAPALI';
          syncVisualState(0);
          return {
            active: S.autoAimSweep,
            msg: S.autoAimSweep
              ? 'Hidropnömatik süspansiyon (±11° yunuslama) ve hidrostatik direksiyonla otomatik hedef tarama döngüsü başlatıldı.'
              : 'Otomatik nişan taraması durduruldu.'
          };
        }
        if (name === 'mode') {
          S.mode = S.mode === 'defense' ? 'cruise' : 'defense';
          syncVisualState(0);
          return {
            active: S.mode === 'defense',
            msg: S.mode === 'defense'
              ? '🛡️ Savunma Mevzii Kipi: Ön glasis Anti-HEAT çubuk zırh kafesi dikildi, 105 mm L74 topu atışa hazır.'
              : '🛣️ Yol Seyir Kipi: Anti-HEAT çubuk kafesi glasis üzerine katlandı.'
          };
        }
        return {};
      },

      buttonActive(name) {
        if (name === 'terrain') return S.dozerDeployed;
        if (name === 'sweep') return S.autoAimSweep;
        if (name === 'mode') return S.mode === 'defense';
        return false;
      },

      modeLabel() {
        return S.mode === 'defense'
          ? '🛡️ Kip: Savunma Mevzii (Anti-HEAT Kafesi Dikili)'
          : '🛣️ Kip: Yol Seyir Konumu (Anti-HEAT Kafesi Katlı)';
      },

      onFire() {
        if (S.ammoCount <= 0) {
          S.ammoCount = 50;
          S.firing = false;
          S.fireProgress = 0;
          syncVisualState(0);
          return {
            ok: true,
            refill: true,
            msg: '🔄 Kıç Şarjör İkmali: Sol ve sağ otomatik doldurucu kasetlerine 50 adet 105 mm Bofors L74 mermisi yüklendi (50/50).'
          };
        }
        S.ammoCount = Math.max(0, S.ammoCount - 1);
        S.firing = true;
        S.fireProgress = 0.02;
        syncVisualState(0);
        if (ctx.audio && ctx.audio.playCannonFire) ctx.audio.playCannonFire();
        return {
          ok: true,
          msg: `💥 <strong>105 mm Bofors L74 (L/62) Ateşlendi!</strong> Boş pirinç kovan kıç kapakçıktan dışarı fırlatıldı (Kalan Şarjör: ${S.ammoCount} / 50)`
        };
      },

      fireButtonLabel() {
        if (S.ammoCount <= 0) return '🔄 50 ADET 105 MM ŞARJÖR İKMALİ YAP';
        return `💥 105 MM BOFORS L74 ATEŞLE & KOVAN FIRLAT (${S.ammoCount}/50)`;
      },

      mobileFireButtonLabel() {
        return S.ammoCount <= 0 ? '🔄 İkmal Yap' : '💥 105mm Ateşle';
      },

      getSliderValues() {
        return [S.pitchDeg, S.rpm, S.hullYawDeg];
      },

      getStats() {
        const pitchTxt = `${S.pitchDeg > 0 ? '+' : ''}${S.pitchDeg.toFixed(1)}° <span>(Yön: ${S.hullYawDeg > 0 ? '+' : ''}${S.hullYawDeg}°)</span>`;
        const powerHp = Math.round((S.rpm / 3600) * 730);
        const codagTxt = S.rpm === 0
          ? '0 <span>hp (Durdu)</span>'
          : S.rpm > 1800
            ? `${powerHp} <span>hp (Dizel+Türbin)</span>`
            : `${powerHp} <span>hp (K60 Dizel)</span>`;
        return [
          pitchTxt,
          codagTxt,
          `${S.ammoCount} / 50 <span>(15 Atış/dk)</span>`,
          S.dozerDeployed ? '1,90 m <span>(Dozer Açık)</span>' : '1,90 m <span>(Anti-HEAT)</span>'
        ];
      },

      getStatus() {
        if (S.firing) {
          return { text: '105 MM L74 ATEŞLENDİ — KIÇTAN KOVAN FIRLATILIYOR!', color: '#dc2626' };
        }
        if (S.ammoCount <= 0) {
          return { text: 'OTOMATİK DOLDURUCU BOŞ — ŞARJÖR İKMALİ GEREKLİ', color: '#d97706' };
        }
        if (S.dozerDeployed) {
          return { text: 'BT-41 DOZER BIÇAĞI AÇIK — MEVZİ KAZI & PUSU KONUMU', color: '#0284c7' };
        }
        return { text: 'HİDROPNÖMATİK SÜSPANSİYON & OTOMATİK DOLDURUCU HAZIR', color: '#16a34a' };
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

