// ============================================================================
// 1957 R-7 SEMYORKA (8K71) / VOSTOK (8K72K) KITALARARASI ROKET & KOROLEV HAÇI
// Sergey Korolev (OKB-1) Başmühendisliğinde Dünyanın İlk ICBM'i,
// Sputnik 1 (4 Ekim 1957) ve Vostok 1 / Yuri Gagarin (12 Nisan 1961) Taşıyıcı Roketi
// 1:3,5 Müze Ölçeği: Baykonur Saha 1/5 "Tulip" Yaprak Kuleleri, 32 Odalı RD-107/108
// Motor Kümesi, Açık Kafes Ara Kademe ve "Korolev Haçı" (Korolev Cross) Simülasyonu
// ============================================================================
(function () {
  window.VehicleBuilders = window.VehicleBuilders || {};

  // --- Prosedürel Sovyet Havacılık/Uzay Alaşım Panel & Perçin Kabartma Dokusu ---
  function makeAerospacePanelBump(THREE) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#808080';
    g.fillRect(0, 0, 256, 256);

    g.strokeStyle = '#585858';
    g.lineWidth = 1.5;
    for (let y = 32; y < 256; y += 32) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(256, y);
      g.stroke();
    }
    for (let x = 32; x < 256; x += 32) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, 256);
      g.stroke();
    }
    g.fillStyle = '#b4b4b4';
    for (let y = 6; y < 256; y += 16) {
      for (let x = 6; x < 256; x += 16) {
        g.fillRect(x, y, 1.5, 1.5);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 6);
    return tex;
  }

  // --- 4 Tarihsel Boya ve Konfigürasyon Şeması ---
  const SCHEMES = {
    vostok1961: {
      name: '👨‍🚀 12 Nisan 1961 Vostok 1 — Yuri Gagarin (Baykonur Zeytin Yeşili & Kriyojenik Beyaz)',
      btn: '👨‍🚀 1961 Vostok 1 (Yeşil & Beyaz)',
      rocketBody: 0x4b5842,
      loxFrost: 0xf1f5f9,
      fairing: 0xe2e8f0,
      orangeTrim: 0xea580c,
      padTruss: 0x334155,
      nozzleBronze: 0xb45309
    },
    sputnik1957: {
      name: '🛰️ 4 Ekim 1957 Sputnik 1 — 8K71PS İlk Uydu Fırlatışı (Parlak Duralümin & Gri)',
      btn: '🛰️ 1957 Sputnik 1 (Gümüş & Gri)',
      rocketBody: 0x94a3b8,
      loxFrost: 0xf8fafc,
      fairing: 0xcbd5e1,
      orangeTrim: 0xdc2626,
      padTruss: 0x475569,
      nozzleBronze: 0x92400e
    },
    semyorka_icbm: {
      name: '☢️ 1957 R-7 Semyorka 8K71 Kıtalararası Balistik Füze (Koyu Askerî Haki)',
      btn: '☢️ 1957 R-7 ICBM (Askerî Haki)',
      rocketBody: 0x3f4a3c,
      loxFrost: 0xdbeafe,
      fairing: 0x52525b,
      orangeTrim: 0xb91c1c,
      padTruss: 0x27272a,
      nozzleBronze: 0x78350f
    },
    vdnh_moscow: {
      name: '🏛️ Moskova VDNH / Kozmonotik Müzesi Anıt Sergisi (Beyaz & Titanyum Gri)',
      btn: '🏛️ Moskova VDNH Anıtı (Beyaz)',
      rocketBody: 0xe2e8f0,
      loxFrost: 0xffffff,
      fairing: 0xf8fafc,
      orangeTrim: 0xf97316,
      padTruss: 0x64748b,
      nozzleBronze: 0xd97706
    }
  };

  window.VehicleBuilders.r7 = function buildR7(ctx) {
    const { THREE, scene, addCADMesh, createPartGroup } = ctx;
    const root = new THREE.Group();
    root.name = 'r7_root';
    root.visible = false;
    scene.add(root);

    const myMeshes = [];
    const panelBump = makeAerospacePanelBump(THREE);

    function addMesh(parent, geo, mat, pos, rot, scale) {
      const m = addCADMesh(parent, geo, mat, pos, rot);
      if (scale) m.scale.set(scale[0], scale[1], scale[2]);
      myMeshes.push(m);
      return m;
    }

    // --- Malzemeler ---
    const matRocketOuter = new THREE.MeshStandardMaterial({
      color: SCHEMES.vostok1961.rocketBody,
      roughness: 0.48,
      metalness: 0.38,
      bumpMap: panelBump,
      bumpScale: 0.012
    });
    matRocketOuter.userData = { isOuterShell: true, r7Role: 'rocketBody' };

    const matBoosterSkin = new THREE.MeshStandardMaterial({
      color: SCHEMES.vostok1961.rocketBody,
      roughness: 0.46,
      metalness: 0.42,
      bumpMap: panelBump,
      bumpScale: 0.012
    });
    matBoosterSkin.userData = { r7Role: 'rocketBody' };

    const matLoxFrost = new THREE.MeshStandardMaterial({
      color: SCHEMES.vostok1961.loxFrost,
      roughness: 0.65,
      metalness: 0.15,
      bumpMap: panelBump,
      bumpScale: 0.008
    });
    matLoxFrost.userData = { r7Role: 'loxFrost' };

    const matFairingOuter = new THREE.MeshStandardMaterial({
      color: SCHEMES.vostok1961.fairing,
      roughness: 0.42,
      metalness: 0.32,
      bumpMap: panelBump,
      bumpScale: 0.01,
      side: THREE.DoubleSide
    });
    matFairingOuter.userData = { isOuterShell: true, r7Role: 'fairing' };

    const matOrangeTrim = new THREE.MeshStandardMaterial({
      color: SCHEMES.vostok1961.orangeTrim,
      roughness: 0.45,
      metalness: 0.25
    });
    matOrangeTrim.userData = { r7Role: 'orangeTrim' };

    const matPadTruss = new THREE.MeshStandardMaterial({
      color: SCHEMES.vostok1961.padTruss,
      roughness: 0.55,
      metalness: 0.65
    });
    matPadTruss.userData = { r7Role: 'padTruss' };

    const matNozzle = new THREE.MeshStandardMaterial({
      color: SCHEMES.vostok1961.nozzleBronze,
      roughness: 0.30,
      metalness: 0.85
    });
    matNozzle.userData = { r7Role: 'nozzleBronze' };

    const matAlloy = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      roughness: 0.22,
      metalness: 0.90
    });

    const matGoldFoil = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.28,
      metalness: 0.86
    });

    const matDarkSteel = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.45,
      metalness: 0.80
    });

    const matPlumeCore = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf97316,
      emissiveIntensity: 1.5,
      roughness: 0.15,
      transparent: true,
      opacity: 0.92
    });

    const matPlumeOuter = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xdc2626,
      emissiveIntensity: 1.15,
      roughness: 0.30,
      transparent: true,
      opacity: 0.72
    });

    // ========================================================================
    // 16 BAĞIMSIZ MEKANİK PARÇA GRUBU (4 Alt Sistem)
    // ========================================================================
    const SUB_LABELS = {
      launch_complex: 'ALT SİSTEM: BAYKONUR SAHA 1/5 & YAPRAK KULELERİ',
      core_stage: 'ALT SİSTEM: MERKEZ ÇEKİRDEK (BLOK A) & RD-108 MOTORU',
      strapon_boosters: 'ALT SİSTEM: 4 YAN HIZLANDIRICI (KOROLEV HAÇI) & RD-107',
      upper_payload: 'ALT SİSTEM: BLOK E ÜST KADEME, VOSTOK 3KA & SPUTNIK 1'
    };

    function makePart(cfg) {
      return createPartGroup({
        id: cfg.id,
        name: cfg.name,
        subsystem: cfg.sub,
        subLabel: SUB_LABELS[cfg.sub] || 'ALT SİSTEM: R-7 SEMYORKA / VOSTOK',
        desc: cfg.desc,
        material: cfg.material || 'AMG-6 Alüminyum-Magnezyum Alaşımı & Çelik',
        weight: cfg.weight || '3.500 kg',
        spec: cfg.spec || 'OKB-1 Korolev Tasarımı',
        location: cfg.location || 'R-7 Gövdesi',
        basePos: [0, 0, 0],
        explodeVec: cfg.explode || [0, 1.2, 0],
        isOuterShell: !!cfg.isOuterShell
      });
    }

    // ALT SİSTEM 1: Baykonur Saha 1/5 Fırlatma Kompleksi (launch_complex — 3 Grup)
    const partLaunchTable = makePart({
      id: 'r7_launch_table',
      name: '1. Baykonur Saha 1/5 ("Gagarin\'in Başlangıcı") Çelik Fırlatma Masası',
      sub: 'launch_complex',
      explode: [0, -1.6, 0],
      spec: 'Konum: Baykonur LC-1/5 | Yapı: Alev hendekli döner çelik fırlatma halkası (y = 0,000 m)',
      desc: 'R-7 Semyorka, Vostok 1 ve günümüz Soyuz roketlerinin fırlatıldığı ünlü Baykonur Saha 1/5 fırlatma masası. Roket tabandan oturmaz; ortadaki dairesel açıklıktan 32 yanma odasının 4.000 kN\'luk alev sütunu doğrudan alt alev hendeğine boşalır.'
    });

    const partPetalTowers = makePart({
      id: 'r7_petal_towers',
      name: '2. Karşı Ağırlıklı 4 Çiçek Yaprağı ("Tulip") Süspansiyon Kafes Kolları',
      sub: 'launch_complex',
      explode: [0, -0.6, 1.8],
      spec: 'Mekanizma: 4 × Karşı ağırlıklı çelik kafes kol | Açılma Açısı: 0° (Kilitli) -> 42° (Tam Açık)',
      desc: 'Vladimir Barmin tarafından tasarlanan dahi süspansiyon sistemi. 280 tonluk roketi dört yan hızlandırıcının üst kuşağından asılı tutar; kalkış anında roketin itkisi ağırlığını aştığında yük kalkar ve altlarındaki ağır karşı ağırlıklar dört kafes kolu çiçek yaprağı (lale) gibi simetrik olarak 42° dışa yatırır.'
    });

    const partUmbilicalMasts = makePart({
      id: 'r7_umbilical_masts',
      name: '3. Kriyojenik Sıvı Oksijen (LOX) Dolum & Telemetri Kuleleri',
      sub: 'launch_complex',
      explode: [2.2, 0.2, 0],
      spec: 'İşlev: Saniyede ~40 kg buharlaşan sıvı oksijeni (-183°C) kalkış anına dek tamamlama ve elektrik beslemesi',
      desc: 'Roketin yan hızlandırıcılarına ve üst kademesine kriyojenik sıvı oksijen (-183°C), hidrojen peroksit ve elektrik/telemetri bağlantısı sağlayan servis direkleri. Motorlar tam itkiye ulaştığında geri çekilir.'
    });

    // ALT SİSTEM 2: Merkez Çekirdek Kademe — Blok A & RD-108 (core_stage — 3 Grup)
    const partCoreHull = makePart({
      id: 'r7_core_hull',
      name: '4. Merkez Çekirdek Kademe (Blok A) Dış Gövde Kabuğu & Bel Kuşağı',
      sub: 'core_stage',
      isOuterShell: true,
      explode: [0, 0.8, -1.8],
      spec: 'Boy: 28,0 m | Çap: 2,95 m (Üst) / 1,95 m (Alt) | Malzeme: AMG-6 Alüminyum-Magnezyum Alaşımı',
      desc: 'Dört yan hızlandırıcının ortasında yer alan ve kalkıştan itibaren ~300 saniye boyunca kesintisiz çalışan merkez kademe (Blok A). X-Ray modunda dış kabuk saydamlaşarak içteki kriyojenik sıvı oksijen (LOX) ve kerosen (T-1) tanklarını gösterir.'
    });

    const partCoreTanks = makePart({
      id: 'r7_core_tanks',
      name: '5. Blok A İç Sıvı Oksijen (LOX) & Kerosen (T-1) Kriyojenik Tankları',
      sub: 'core_stage',
      explode: [0, 1.4, 0],
      spec: 'Yakıt: RG-1 / T-1 Kerosen + Sıvı Oksijen (LOX, -183°C) | Yanma Süresi: ~301 saniye',
      desc: 'Merkez çekirdek kademenin içindeki yüksek basınçlı sıvı oksijen ve kerosen tankları, tanklar arası boru tünelleri ve RD-108 türbopompasını çalıştıran hidrojen peroksit (H₂O₂) tankı.'
    });

    const partRd108Engine = makePart({
      id: 'r7_rd108_engine',
      name: '6. Merkez RD-108 Sıvı Yakıtlı Roket Motoru (4 Ana Oda + 4 Gimbal Vernier)',
      sub: 'core_stage',
      explode: [0, -1.5, 0],
      spec: 'Tasarım: Valentin Gluşko (OKB-456) | İtki: 745 kN (Deniz Seviyesi) / 941 kN (Vakum) | Odalar: 4 Ana + 4 Vernier',
      desc: 'Tek bir H₂O₂ buhar türbopompasının beslediği 4 ana çan yanma odası ve etrafındaki ±18° dönebilen 4 küçük yönlendirme (vernier) nozulundan oluşan efsanevi RD-108 motoru.'
    });

    // ALT SİSTEM 3: 4 Konik Yan Hızlandırıcı & Korolev Haçı (strapon_boosters — 5 Grup)
    const partBoosterB = makePart({
      id: 'r7_booster_b',
      name: '7. Kuzey Yan Hızlandırıcı (Blok B) Konik Gövde & Üst Ayrılma Mafsalı',
      sub: 'strapon_boosters',
      explode: [0, 0.4, 2.4],
      spec: 'Boy: 19,0 m | Taban Çapı: 2,68 m | Kuru Kütle: 3,5 ton | Dolu Kütle: 43,4 ton | Yanma Süresi: 118 sn',
      desc: 'Kuzey (+Z) yönündeki konik yan hızlandırıcı (Blok B). İtkiyi üst ucundaki küresel mafsal üzerinden merkez kademeye aktarır; T+118 saniyede yakıtı bittiğinde üst kilit çözülür ve oksijen tankı üst valfi açılarak Korolev Haçı ayrılmasını başlatır.'
    });

    const partBoosterV = makePart({
      id: 'r7_booster_v',
      name: '8. Doğu Yan Hızlandırıcı (Blok V) Konik Gövde & Aerodinamik Kanatçık',
      sub: 'strapon_boosters',
      explode: [2.4, 0.4, 0],
      spec: 'Konum: Doğu (+X) | Özellik: Kriyojenik buz tutmuş beyaz oksijen tankı kuşağı ve üçgen kuyruk stabilizatörü',
      desc: 'Doğu (+X) yönündeki konik yan hızlandırıcı (Blok V). Atmosferik tırmanış sırasında aerodinamik kararlılığa yardımcı olan etek kanatçığı ve iç LOX/Kerosen tanklarını barındırır.'
    });

    const partBoosterG = makePart({
      id: 'r7_booster_g',
      name: '9. Güney Yan Hızlandırıcı (Blok G) Konik Gövde & Aerodinamik Kanatçık',
      sub: 'strapon_boosters',
      explode: [0, 0.4, -2.4],
      spec: 'Konum: Güney (-Z) | Ayrılma: T+118 sn simetrik geri takla ("Korolev Haçı")',
      desc: 'Güney (-Z) yönündeki konik yan hızlandırıcı (Blok G). Diğer üç hızlandırıcıyla eşzamanlı olarak merkez gövdeden dışa doğru açılarak gökyüzünde ünlü Korolev Haçı\'nı çizer.'
    });

    const partBoosterD = makePart({
      id: 'r7_booster_d',
      name: '10. Batı Yan Hızlandırıcı (Blok D) Konik Gövde & Üst Ayrılma Mafsalı',
      sub: 'strapon_boosters',
      explode: [-2.4, 0.4, 0],
      spec: 'Konum: Batı (-X) | İtki Katkısı: 4 × 813 kN = 3.252 kN (Kalkış itkisinin %80\'i)',
      desc: 'Batı (-X) yönündeki konik yan hızlandırıcı (Blok D). Dört yan hızlandırıcı kalkış anında toplam itkinin dörtte üçünden fazlasını üretir.'
    });

    const partRd107Clusters = makePart({
      id: 'r7_rd107_clusters',
      name: '11. 4 × RD-107 Yan Hızlandırıcı Motor Kümesi (16 Ana + 8 Vernier Nozul)',
      sub: 'strapon_boosters',
      explode: [1.8, -1.6, 1.8],
      spec: 'Motor: 4 × RD-107 (Her birinde 4 Ana Yanma Odası + 2 Gimbal Vernier) | Toplam: 24 Yanma Odası',
      desc: 'Yan hızlandırıcıların tabanında yer alan dört adet RD-107 motor paketi. Büyük tek bir yanma odasında oluşan yanma kararsızlığı (combustion instability) sorununu aşmak için Gluşko her motoru tek türbopompalı 4 yanma odasına bölmüştür.'
    });

    // ALT SİSTEM 4: Açık Kafes Ara Kademe, Blok E, Vostok 3KA & Burun Kaportası (upper_payload — 5 Grup)
    const partInterstageTruss = makePart({
      id: 'r7_interstage_truss',
      name: '12. Açık Çelik Kafes Ara Kademe (Hot-Staging Interstage Truss)',
      sub: 'upper_payload',
      explode: [0, 2.0, -1.4],
      spec: 'Yapı: Çapraz borulu açık çelik kafes | İşlev: "Sıcak Kademelendirme" (Hot-Staging) egzoz tahliyesi',
      desc: 'Sovyet roketlerinin imzası olan açık kafes ara kademe. Üst kademe (Blok E) motoru, alt kademe (Blok A) henüz ayrılmadan önce ateşlenir ("hot-staging"); böylece sıfır yerçekiminde yakıt çökmesi sorunu yaşanmaz ve sıcak egzoz gazları kafes boşluklarından dışarı kaçar.'
    });

    const partBlokEStage = makePart({
      id: 'r7_blok_e_stage',
      name: '13. Vostok 8K72K Üst Kademesi (Blok E) & RD-0109 Vakum Motoru',
      sub: 'upper_payload',
      explode: [0, 2.5, 0],
      spec: 'Motor: Kosberg RD-0109 (LOX/Kerosen, 54,5 kN Vakum İtkisi) | Görev: Yörünge hızına (~7,8 km/sn) çıkarma',
      desc: 'Orijinal R-7 ICBM\'ine 1959-1960\'ta eklenen Blok E üst kademesi. Vostok uzay aracını ve Luna sondalarını alçak Dünya yörüngesine veya kaçış hızına ulaştıran üçüncü kademedir.'
    });

    const partVostokSpacecraft = makePart({
      id: 'r7_vostok_spacecraft',
      name: '14. Vostok 3KA Küresel İniş Kapsülü ("Sharik") & Sputnik 1 Uydusu',
      sub: 'upper_payload',
      explode: [1.6, 3.0, 1.4],
      spec: 'Kapsül: Ø2,3 m Küresel Vostok 3KA (2,46 ton, TDU Fren Motorlu) + Ø58 cm 4 Antenli Sputnik 1 Küresi',
      desc: 'Burun kaportasının içinde korunan, 12 Nisan 1961\'de Yuri Gagarin\'in Dünya çevresinde 108 dakikalık ilk insanlı uzay uçuşunu yaptığı küresel Vostok 3KA ("Sharik") kapsülü, konik ekipman modülü ve yanında karşılaştırmalı ölçekte 4 bıyık antenli Sputnik 1 uydusu.'
    });

    const partPayloadFairing = makePart({
      id: 'r7_payload_fairing',
      name: '15. İki Parçalı Konik Burun Kaportası (Payload Fairing — Ayrılabilir Kabuk)',
      sub: 'upper_payload',
      isOuterShell: true,
      explode: [-1.8, 3.2, 0],
      spec: 'Yapı: Boyuna ikiye ayrılan aerodinamik burun konisi | Gözlem: Kozmonot lomboz pencereleri ve antenler',
      desc: 'Vostok uzay aracını atmosferik tırmanış sırasında aerodinamik ısınma ve basınçtan koruyan iki parçalı konik burun kaportası. X-Ray modunda veya kaporta açma düğmesiyle içindeki Vostok 3KA kapsülü ve Sputnik 1 görülür.'
    });

    const partExhaustPlumes = makePart({
      id: 'r7_exhaust_plumes',
      name: '16. 32 Odalı RD-107/108 Kalkış Alev Sütunu & Korolev Haçı Ayrılma Jeti',
      sub: 'upper_payload',
      explode: [0, -2.4, 0],
      spec: 'Ateşleme: 20 Ana Yanma Odası + 12 Vernier Nozulu = 32 Eşzamanlı Alev Jeti (~4.000 kN Kalkış İtkisi)',
      desc: 'Kalkış anında merkez RD-108 ve dört yan RD-107 motorunun toplam 32 nozulundan fışkıran dev ateş sütunu ve T+118 saniyede yan hızlandırıcılar Korolev Haçı çizerek ayrılırken üst oksijen valflerinden çıkan beyaz basınç tahliye jetleri.'
    });

    // Tüm grupları root'a ekle
    [
      partLaunchTable, partPetalTowers, partUmbilicalMasts,
      partCoreHull, partCoreTanks, partRd108Engine,
      partBoosterB, partBoosterV, partBoosterG, partBoosterD, partRd107Clusters,
      partInterstageTruss, partBlokEStage, partVostokSpacecraft, partPayloadFairing, partExhaustPlumes
    ].forEach(g => root.add(g));

    // ========================================================================
    // GEOMETRİ İNŞASI (1:3,5 Müze Ölçeği, y = 0,000 m Taban)
    // ========================================================================
    const Y_PAD_TOP = 0.72;
    const Y_ENGINE_BASE = 1.15; // RD-107/108 nozul ağız düzlemi

    // --- 1. Baykonur Saha 1/5 Çelik Fırlatma Masası & Taban (partLaunchTable) ---
    // Zemin raylı beton/çelik kaide çerçevesi (alt yüzey tam y = 0,000 m)
    addMesh(partLaunchTable, new THREE.CylinderGeometry(2.85, 3.05, 0.16, 32), matPadTruss, [0, 0.08, 0]);
    // Alev hendeği iç huni duvarı
    addMesh(partLaunchTable, new THREE.CylinderGeometry(1.45, 1.95, 0.56, 28, 1, true), matDarkSteel, [0, 0.44, 0]);
    // 8 adet radyal fırlatma masası çelik kirişi ve üst dairesel halka (y = 0,72 m)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      addMesh(partLaunchTable, new THREE.BoxGeometry(0.22, 0.56, 1.15), matPadTruss, [Math.cos(a) * 2.15, 0.44, Math.sin(a) * 2.15], [0, -a, 0]);
    }
    addMesh(partLaunchTable, new THREE.TorusGeometry(1.85, 0.14, 12, 32), matPadTruss, [0, Y_PAD_TOP, 0], [Math.PI / 2, 0, 0]);
    addMesh(partLaunchTable, new THREE.TorusGeometry(2.55, 0.08, 10, 32), matOrangeTrim, [0, Y_PAD_TOP + 0.06, 0], [Math.PI / 2, 0, 0]);

    // --- 2. 4 × Karşı Ağırlıklı Çiçek Yaprağı ("Tulip") Süspansiyon Kafes Kolları (partPetalTowers) ---
    // 4 ana yön: Kuzey (+Z), Doğu (+X), Güney (-Z), Batı (-X) -> açılar 0, pi/2, pi, 3pi/2
    const petalPivotGroups = [];
    for (let k = 0; k < 4; k++) {
      const phi = (k * Math.PI) / 2;
      const petalHolder = new THREE.Group();
      petalHolder.rotation.y = phi;
      partPetalTowers.add(petalHolder);

      // Mafsal noktası: r = 1,75 m, y = Y_PAD_TOP + 0,10 m = 0,82 m
      const pivotGrp = new THREE.Group();
      pivotGrp.position.set(0, Y_PAD_TOP + 0.10, 1.75);
      petalHolder.add(pivotGrp);

      // Alt karşı ağırlık kutusu (mafsalın dışında/altında)
      addMesh(pivotGrp, new THREE.BoxGeometry(0.52, 0.38, 0.62), matOrangeTrim, [0, -0.12, 0.42]);
      addMesh(pivotGrp, new THREE.CylinderGeometry(0.08, 0.08, 0.64, 14), matAlloy, [0, 0, 0], [0, 0, Math.PI / 2]);

      // Yukarı ve içe doğru uzanan çelik kafes kol (y_yerel = 0 .. +3,65 m, üst pabuç z_yerel = -0,76 m)
      addMesh(pivotGrp, new THREE.BoxGeometry(0.10, 3.75, 0.12), matPadTruss, [-0.18, 1.82, -0.38], [-0.20, 0, 0]);
      addMesh(pivotGrp, new THREE.BoxGeometry(0.10, 3.75, 0.12), matPadTruss, [0.18, 1.82, -0.38], [-0.20, 0, 0]);
      for (let b = 0; b < 6; b++) {
        const yb = 0.45 + b * 0.56;
        const zb = -yb * 0.205;
        addMesh(pivotGrp, new THREE.BoxGeometry(0.42, 0.06, 0.08), matPadTruss, [0, yb, zb]);
      }
      // Üst süspansiyon tutucu çene (roketin bel pabuçlarını kavrayan kafa)
      addMesh(pivotGrp, new THREE.BoxGeometry(0.46, 0.18, 0.28), matOrangeTrim, [0, 3.65, -0.78]);
      petalPivotGroups.push(pivotGrp);
    }

    // --- 3. Kriyojenik Dolum & Telemetri Kuleleri (partUmbilicalMasts) ---
    const umbilicalPivotGroups = [];
    [Math.PI * 0.25, -Math.PI * 0.75].forEach(ang => {
      const uHolder = new THREE.Group();
      uHolder.rotation.y = ang;
      partUmbilicalMasts.add(uHolder);
      const uPiv = new THREE.Group();
      uPiv.position.set(0, Y_PAD_TOP + 0.08, 2.35);
      uHolder.add(uPiv);
      addMesh(uPiv, new THREE.CylinderGeometry(0.05, 0.07, 7.60, 12), matPadTruss, [0, 3.80, 0]);
      // Üst kriyojenik bağlantı kolları
      [3.20, 5.40, 7.20].forEach(yArm => {
        addMesh(uPiv, new THREE.BoxGeometry(0.08, 0.08, 1.35), matOrangeTrim, [0, yArm, -0.68]);
      });
      umbilicalPivotGroups.push(uPiv);
    });

    // --- 4. Merkez Çekirdek Kademe (Blok A) Dış Gövde Kabuğu (partCoreHull) ---
    // Blok A alt silindirik etek (y = 1,25 .. 4,45 m, r = 0,34 m) ve üst genişleyen gövde (y = 4,45 .. 8,05 m, r = 0,43 m)
    addMesh(partCoreHull, new THREE.CylinderGeometry(0.38, 0.32, 3.20, 28, 1, true), matRocketOuter, [0, 2.85, 0]);
    addMesh(partCoreHull, new THREE.CylinderGeometry(0.43, 0.38, 3.60, 28, 1, true), matRocketOuter, [0, 6.25, 0]);
    // Ortadaki beyaz sıvı oksijen buzlanma kuşağı (frost band) ve turuncu telemetri halkaları
    addMesh(partCoreHull, new THREE.CylinderGeometry(0.434, 0.415, 1.35, 28, 1, true), matLoxFrost, [0, 5.55, 0]);
    addMesh(partCoreHull, new THREE.TorusGeometry(0.385, 0.022, 10, 28), matOrangeTrim, [0, 4.45, 0], [Math.PI / 2, 0, 0]);
    addMesh(partCoreHull, new THREE.TorusGeometry(0.435, 0.022, 10, 28), matOrangeTrim, [0, 8.05, 0], [Math.PI / 2, 0, 0]);

    // --- 5. Blok A İç Sıvı Oksijen (LOX) & Kerosen (T-1) Tankları (partCoreTanks) ---
    // Üst LOX tankı (y = 4,65 .. 7,75 m, parlak alüminyum/beyaz)
    addMesh(partCoreTanks, new THREE.CylinderGeometry(0.36, 0.34, 2.60, 22), matLoxFrost, [0, 6.20, 0]);
    addMesh(partCoreTanks, new THREE.SphereGeometry(0.36, 22, 14), matLoxFrost, [0, 7.50, 0]);
    addMesh(partCoreTanks, new THREE.SphereGeometry(0.34, 22, 14), matLoxFrost, [0, 4.90, 0]);
    // Alt T-1 Kerosen tankı (y = 2,15 .. 4,35 m, altın/bakır anotlu alaşım)
    addMesh(partCoreTanks, new THREE.CylinderGeometry(0.30, 0.27, 1.80, 22), matGoldFoil, [0, 3.25, 0]);
    addMesh(partCoreTanks, new THREE.SphereGeometry(0.30, 20, 12), matGoldFoil, [0, 4.15, 0]);
    // H₂O₂ (Hidrojen Peroksit) simit tankı ve besleme boruları
    addMesh(partCoreTanks, new THREE.TorusGeometry(0.24, 0.055, 12, 24), matAlloy, [0, 1.92, 0], [Math.PI / 2, 0, 0]);

    // --- 6. Merkez RD-108 Roket Motoru (4 Ana Yanma Odası + 4 Gimbal Vernier) (partRd108Engine) ---
    // Türbopompa ve gaz jeneratörü bloğu (y = 1,55 .. 1,85 m)
    addMesh(partRd108Engine, new THREE.CylinderGeometry(0.22, 0.26, 0.36, 18), matDarkSteel, [0, 1.68, 0]);
    // 4 adet ana RD-108 çan nozulu
    for (let c = 0; c < 4; c++) {
      const a = (c / 4) * Math.PI * 2 + Math.PI * 0.25;
      const rNoz = 0.145;
      addMesh(partRd108Engine, new THREE.CylinderGeometry(0.055, 0.115, 0.38, 16), matNozzle, [Math.cos(a) * rNoz, 1.34, Math.sin(a) * rNoz]);
      addMesh(partRd108Engine, new THREE.TorusGeometry(0.105, 0.012, 8, 16), matAlloy, [Math.cos(a) * rNoz, 1.22, Math.sin(a) * rNoz], [Math.PI / 2, 0, 0]);
    }
    // 4 adet gimbal vernier yönlendirme nozulu (±18° döner)
    const coreVernierPivots = [];
    for (let v = 0; v < 4; v++) {
      const a = (v / 4) * Math.PI * 2;
      const vPiv = new THREE.Group();
      vPiv.position.set(Math.cos(a) * 0.31, 1.42, Math.sin(a) * 0.31);
      vPiv.rotation.y = -a;
      partRd108Engine.add(vPiv);
      addMesh(vPiv, new THREE.CylinderGeometry(0.024, 0.052, 0.24, 12), matNozzle, [0, -0.10, 0]);
      coreVernierPivots.push(vPiv);
    }

    // --- 7, 8, 9, 10 & 11. 4 × Konik Yan Hızlandırıcı (Blok B, V, G, D) & RD-107 Kümesi ---
    // Her bir yan hızlandırıcı hem kendi gövde grubunda hem de RD-107 motor ile senkron hareket eder!
    const boosterParts = [partBoosterB, partBoosterV, partBoosterG, partBoosterD];
    const boosterAnimData = [];
    const boosterVernierPivots = [];

    for (let k = 0; k < 4; k++) {
      const phi = (k * Math.PI) / 2; // k=0:+Z (Kuzey/B), k=1:+X (Doğu/V), k=2:-Z (Güney/G), k=3:-X (Batı/D)
      const ux = Math.sin(phi);
      const uz = Math.cos(phi);
      const bPart = boosterParts[k];

      // Hızlandırıcı hareket grubu (Korolev Haçı ayrılmasında hem ötelenir hem devrilir)
      const bMoveGrp = new THREE.Group();
      // Üst burun mafsalı referans noktası: r_top = 0,46 m, y_top = 6,62 m
      bMoveGrp.position.set(ux * 0.46, 6.62, uz * 0.46);
      bMoveGrp.rotation.y = phi;
      bPart.add(bMoveGrp);

      // Hızlandırıcı ekseni üst mafsaldan aşağı-dışa doğru 7,5° eğimlidir (uzunluk ~5,40 m)
      const coneTilt = -0.125; // Üst uç merkez gövdeye yaslanır, alt etek dışarı açılır
      const bodyGrp = new THREE.Group();
      bodyGrp.rotation.x = coneTilt;
      bMoveGrp.add(bodyGrp);

      // Üst burun konisi ve ayrılma mafsalı + LOX basınç tahliye valfi
      addMesh(bodyGrp, new THREE.ConeGeometry(0.18, 0.72, 22), matOrangeTrim, [0, -0.36, 0]);
      addMesh(bodyGrp, new THREE.SphereGeometry(0.065, 12, 12), matAlloy, [0, -0.05, -0.12]);
      // Orta kriyojenik LOX konik gövde (beyaz buz tutmuş kuşak)
      addMesh(bodyGrp, new THREE.CylinderGeometry(0.18, 0.32, 2.10, 24), matLoxFrost, [0, -1.77, 0]);
      // Alt Kerosen (T-1) konik/silindirik gövde
      addMesh(bodyGrp, new THREE.CylinderGeometry(0.32, 0.38, 2.35, 24), matBoosterSkin, [0, -3.99, 0]);
      // Etek kuşağı ve üçgen aerodinamik stabilizatör kanatçığı
      addMesh(bodyGrp, new THREE.TorusGeometry(0.382, 0.018, 8, 24), matOrangeTrim, [0, -5.15, 0], [Math.PI / 2, 0, 0]);
      addMesh(bodyGrp, new THREE.BoxGeometry(0.035, 0.78, 0.46), matOrangeTrim, [0, -4.72, 0.48], [0.28, 0, 0]);

      // Aynı hızlandırıcının altındaki RD-107 motor paketi (partRd107Clusters içinde senkron hareketli grup)
      const rd107MoveGrp = new THREE.Group();
      rd107MoveGrp.position.copy(bMoveGrp.position);
      rd107MoveGrp.rotation.y = phi;
      partRd107Clusters.add(rd107MoveGrp);

      const rd107Body = new THREE.Group();
      rd107Body.rotation.x = coneTilt;
      rd107MoveGrp.add(rd107Body);

      // RD-107 alt ısı kalkanı ve 4 ana çan yanma odası (y_yerel = -5,32 m)
      addMesh(rd107Body, new THREE.CylinderGeometry(0.36, 0.34, 0.14, 20), matDarkSteel, [0, -5.22, 0]);
      for (let c = 0; c < 4; c++) {
        const ca = (c / 4) * Math.PI * 2 + Math.PI * 0.25;
        addMesh(rd107Body, new THREE.CylinderGeometry(0.048, 0.102, 0.34, 16), matNozzle, [Math.cos(ca) * 0.14, -5.42, Math.sin(ca) * 0.14]);
        addMesh(rd107Body, new THREE.TorusGeometry(0.095, 0.01, 8, 14), matAlloy, [Math.cos(ca) * 0.14, -5.52, Math.sin(ca) * 0.14], [Math.PI / 2, 0, 0]);
      }
      // 2 adet dış vernier yönlendirme nozulu
      [-0.24, 0.24].forEach(xv => {
        const vPiv = new THREE.Group();
        vPiv.position.set(xv, -5.28, 0.24);
        rd107Body.add(vPiv);
        addMesh(vPiv, new THREE.CylinderGeometry(0.022, 0.046, 0.22, 12), matNozzle, [0, -0.09, 0]);
        boosterVernierPivots.push(vPiv);
      });

      boosterAnimData.push({ bMoveGrp, rd107MoveGrp, ux, uz, phi });
    }

    // --- 12. Açık Çelik Kafes Ara Kademe (Hot-Staging Interstage Truss) (partInterstageTruss) ---
    // y = 8,05 .. 8,55 m arasında 12 çapraz çelik dikmeli açık kafes
    addMesh(partInterstageTruss, new THREE.TorusGeometry(0.43, 0.02, 8, 28), matPadTruss, [0, 8.06, 0], [Math.PI / 2, 0, 0]);
    addMesh(partInterstageTruss, new THREE.TorusGeometry(0.43, 0.02, 8, 28), matPadTruss, [0, 8.54, 0], [Math.PI / 2, 0, 0]);
    for (let s = 0; s < 8; s++) {
      const a1 = (s / 8) * Math.PI * 2;
      const rT = 0.42;
      addMesh(partInterstageTruss, new THREE.CylinderGeometry(0.016, 0.016, 0.56, 8), matAlloy, [Math.cos(a1) * rT, 8.30, Math.sin(a1) * rT], [0, -a1, 0.36]);
      addMesh(partInterstageTruss, new THREE.CylinderGeometry(0.016, 0.016, 0.56, 8), matAlloy, [Math.cos(a1) * rT, 8.30, Math.sin(a1) * rT], [0, -a1, -0.36]);
    }

    // --- 13. Üst Kademe (Blok E) & RD-0109 Vakum Motoru (partBlokEStage) ---
    // Blok E silindirik gövdesi (y = 8,55 .. 9,55 m, r = 0,43 m) ve altındaki RD-0109 nozulu
    addMesh(partBlokEStage, new THREE.CylinderGeometry(0.43, 0.43, 0.98, 28), matLoxFrost, [0, 9.04, 0]);
    addMesh(partBlokEStage, new THREE.TorusGeometry(0.435, 0.02, 8, 28), matOrangeTrim, [0, 9.52, 0], [Math.PI / 2, 0, 0]);
    addMesh(partBlokEStage, new THREE.CylinderGeometry(0.06, 0.15, 0.34, 18), matNozzle, [0, 8.36, 0]);

    // --- 14. Vostok 3KA Küresel İniş Kapsülü ("Sharik") & Sputnik 1 Uydusu (partVostokSpacecraft) ---
    // Konik ekipman ve TDU fren motoru modülü (y = 9,55 .. 9,98 m)
    addMesh(partVostokSpacecraft, new THREE.CylinderGeometry(0.28, 0.36, 0.42, 22), matGoldFoil, [0, 9.76, 0]);
    // Oksijen/azot küresel gaz tüpleri çelengi (12 adet küçük küre)
    for (let g = 0; g < 10; g++) {
      const ga = (g / 10) * Math.PI * 2;
      addMesh(partVostokSpacecraft, new THREE.SphereGeometry(0.048, 10, 10), matAlloy, [Math.cos(ga) * 0.33, 9.96, Math.sin(ga) * 0.33]);
    }
    // Vostok 3KA "Sharik" küresel kozmonot iniş kapsülü (y = 10,32 m, r = 0,33 m) ve metal şerit kuşaklar
    addMesh(partVostokSpacecraft, new THREE.SphereGeometry(0.33, 24, 18), matAlloy, [0, 10.32, 0]);
    addMesh(partVostokSpacecraft, new THREE.TorusGeometry(0.334, 0.014, 8, 24), matGoldFoil, [0, 10.32, 0]);
    addMesh(partVostokSpacecraft, new THREE.TorusGeometry(0.334, 0.014, 8, 24), matGoldFoil, [0, 10.32, 0], [Math.PI / 2, 0, 0]);
    // Vzor optik yönelim penceresi ve fırlatma koltuğu kapağı
    addMesh(partVostokSpacecraft, new THREE.CylinderGeometry(0.08, 0.08, 0.04, 14), matOrangeTrim, [0, 10.42, 0.31], [Math.PI / 2 - 0.3, 0, 0]);

    // Üst kısmında karşılaştırmalı ölçekte 4 bıyık antenli Sputnik 1 (PS-1) küresi (y = 10,92 m)
    addMesh(partVostokSpacecraft, new THREE.SphereGeometry(0.11, 20, 16), matAlloy, [0, 10.92, 0]);
    for (let ant = 0; ant < 4; ant++) {
      const aa = (ant / 4) * Math.PI * 2 + 0.4;
      addMesh(partVostokSpacecraft, new THREE.CylinderGeometry(0.006, 0.008, 0.62, 8), matAlloy, [Math.cos(aa) * 0.18, 10.68, Math.sin(aa) * 0.18], [Math.sin(aa) * 0.38, 0, -Math.cos(aa) * 0.38]);
    }

    // --- 15. İki Parçalı Konik Burun Kaportası (Payload Fairing) (partPayloadFairing) ---
    // Sol (-X) ve Sağ (+X) yarım kaporta kabukları (açılıp Vostok 3KA & Sputnik 1'i sergileyebilir)
    const fairingHalves = [];
    [-1, 1].forEach(side => {
      const fHalf = new THREE.Group();
      fHalf.position.set(0, 9.55, 0);
      partPayloadFairing.add(fHalf);
      const phiStart = side < 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
      // Alt silindirik kaporta (y_yerel = 0 .. 1,05 m)
      addMesh(fHalf, new THREE.CylinderGeometry(0.43, 0.43, 1.05, 16, 1, false, phiStart, Math.PI), matFairingOuter, [0, 0.525, 0]);
      // Üst konik burun (y_yerel = 1,05 .. 2,05 m, toplam tepe y = 11,60 m)
      addMesh(fHalf, new THREE.ConeGeometry(0.43, 1.00, 16, 1, false, phiStart, Math.PI), matFairingOuter, [0, 1.55, 0]);
      fairingHalves.push({ grp: fHalf, side });
    });

    // --- 16. 32 Odalı Kalkış Alev Sütunu & Korolev Haçı Ayrılma Jeti (partExhaustPlumes) ---
    const corePlumeGrp = new THREE.Group();
    corePlumeGrp.position.set(0, 1.15, 0);
    partExhaustPlumes.add(corePlumeGrp);
    addMesh(corePlumeGrp, new THREE.ConeGeometry(0.28, 1.10, 18), matPlumeCore, [0, -0.52, 0], [Math.PI, 0, 0]);
    addMesh(corePlumeGrp, new THREE.ConeGeometry(0.42, 1.35, 18), matPlumeOuter, [0, -0.62, 0], [Math.PI, 0, 0]);

    const boosterPlumeGroups = [];
    for (let k = 0; k < 4; k++) {
      const bpGrp = new THREE.Group();
      partExhaustPlumes.add(bpGrp);
      addMesh(bpGrp, new THREE.ConeGeometry(0.24, 0.95, 16), matPlumeCore, [0, -0.45, 0], [Math.PI, 0, 0]);
      addMesh(bpGrp, new THREE.ConeGeometry(0.36, 1.18, 16), matPlumeOuter, [0, -0.52, 0], [Math.PI, 0, 0]);
      boosterPlumeGroups.push(bpGrp);
    }

    // ========================================================================
    // CANLI MEKANİK DURUM (STATE) VE ETKİLEŞİM MANTIĞI
    // ========================================================================
    const S = {
      korolevPct: 0,            // Korolev Haçı ayrılma evresi (%0 = Bitişik, %100 = Tam Korolev Haçı)
      tulipDeg: 0,              // Baykonur yaprak kuleleri açılma açısı (0°..42°)
      vernierDeg: 0,            // 12 × Vernier yönlendirme nozulu gimbal açısı (-18°..+18°)
      fairingOpen: false,       // Burun kaportası açık mı? (terrain butonu)
      autoCross: false,         // Otomatik Korolev Haçı & kule animasyonu (sweep butonu)
      mode: 'vostok',           // 'vostok' (1961 Vostok 1 / Gagarin) | 'sputnik' (1957 Sputnik 1 / ICBM)
      firing: true,             // 32 odalı RD-107/108 ateşlemesi aktif mi?
      stageFuel: 100,           // Yakıt/Ateşleme durumu (%100)
      animTime: 0
    };

    function syncVisualState(dt) {
      const stepDt = Math.max(0, Math.min(dt || 0, 0.1));
      S.animTime += stepDt;

      // Otomatik Korolev Haçı gösterimi açıksa sinüzoidal olarak kuleleri ve 4 hızlandırıcıyı oynat
      if (S.autoCross && stepDt > 0) {
        const w = 0.5 - 0.5 * Math.cos(S.animTime * 1.15);
        S.tulipDeg = Math.round(w * 42);
        S.korolevPct = Math.round(Math.max(0, (w - 0.25) / 0.75) * 100);
      }

      // 1. Baykonur Saha 1/5 Çiçek Yaprağı ("Tulip") Süspansiyon Kuleleri (0° .. 42°)
      // Korolev Haçı ayrılması başladığında kuleler otomatik olarak da tam açılır
      const effectiveTulipDeg = Math.max(S.tulipDeg, S.korolevPct > 2 ? 42 : 0);
      const tulipRad = THREE.MathUtils.degToRad(effectiveTulipDeg);
      petalPivotGroups.forEach(pg => {
        pg.rotation.x = tulipRad;
      });
      umbilicalPivotGroups.forEach(ug => {
        ug.rotation.x = tulipRad * 0.65;
      });

      // 2. Korolev Haçı (Korolev Cross) 4'lü Simetrik Yan Hızlandırıcı Ayrılması (tau = 0 .. 1)
      const tau = Math.max(0, Math.min(1, S.korolevPct / 100));
      boosterAnimData.forEach((bd, idx) => {
        // Radyal dışa açılma (dr = 2,15 * tau m), aşağı süzülme (dy = -0,75 * tau^2 m)
        // ve üst burun mafsalından dışa devrilme (dTheta = +52° * tau)
        const rPos = 0.46 + tau * 2.15;
        const yPos = 6.62 - tau * tau * 0.75;
        bd.bMoveGrp.position.set(bd.ux * rPos, yPos, bd.uz * rPos);
        bd.bMoveGrp.rotation.set(tau * 0.90, bd.phi, 0, 'YXZ');

        bd.rd107MoveGrp.position.copy(bd.bMoveGrp.position);
        bd.rd107MoveGrp.rotation.copy(bd.bMoveGrp.rotation);

        // Yan hızlandırıcı alev sütunları (tau < 0.35 iken yanar, ayrıldıktan sonra söner)
        const bp = boosterPlumeGroups[idx];
        bp.visible = S.firing && tau < 0.35;
        const rNozWorld = rPos + 0.66;
        bp.position.set(bd.ux * rNozWorld, yPos - 5.48, bd.uz * rNozWorld);
      });

      // 3. 12 × Vernier Yönlendirme Nozulu Gimbal Açısı (-18° .. +18°)
      const vernRad = THREE.MathUtils.degToRad(S.vernierDeg);
      coreVernierPivots.forEach(vp => { vp.rotation.x = vernRad; });
      boosterVernierPivots.forEach(vp => { vp.rotation.x = vernRad; });

      // 4. İki Parçalı Burun Kaportası (Payload Fairing) Açılması
      const targetFairingX = S.fairingOpen ? 0.62 : 0.0;
      const targetFairingRot = S.fairingOpen ? 0.32 : 0.0;
      fairingHalves.forEach(fh => {
        fh.grp.position.x = fh.side * targetFairingX;
        fh.grp.rotation.z = -fh.side * targetFairingRot;
      });

      // 5. Merkez RD-108 Alev Sütunu Titreşimi
      corePlumeGrp.visible = S.firing;
      if (S.firing) {
        const pulse = 0.94 + 0.12 * Math.sin(S.animTime * 28);
        corePlumeGrp.scale.set(pulse, 1.0 + 0.08 * Math.cos(S.animTime * 22), pulse);
      }
    }

    syncVisualState(0);

    // ========================================================================
    // KAMERA AÇILARI VE 6 ADIMLI REHBERLİ TUR
    // ========================================================================
    const camPresets = {
      iso: { pos: [10.8, 6.8, 11.4], look: [0, 5.6, 0] },
      front: { pos: [0.2, 5.8, 13.8], look: [0, 5.6, 0] },
      breech: { pos: [3.2, 10.4, 3.6], look: [0, 10.1, 0] },
      engine: { pos: [3.4, 1.6, 3.6], look: [0, 1.4, 0] },
      suspension: { pos: [4.8, 3.2, 4.8], look: [0, 2.6, 0] },
      top: { pos: [0.2, 16.5, 0.2], look: [0, 5.5, 0] }
    };

    const tourSteps = [
      {
        title: 'Genel Bakış: 1957 R-7 Semyorka / Vostok & Uzay Çağı\'nın Doğuşu',
        desc: 'Sergey Korolev\'in (OKB-1) başmühendisliğinde geliştirilen R-7 Semyorka; 1957\'de dünyanın ilk kıtalararası balistik füzesi (ICBM) olmuş, Sputnik 1\'i ve 12 Nisan 1961\'de Yuri Gagarin\'i (Vostok 1) uzaya taşıyarak insanlık tarihini değiştirmiştir.',
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'iso',
        part: partCoreHull
      },
      {
        title: 'Baykonur Saha 1/5 & Çiçek Yaprağı ("Tulip") Süspansiyon Kuleleri',
        desc: 'R-7 tabandan oturmaz; 280 tonluk ağırlığı bel kuşağından 4 dev çelik kafes kol (petal towers) tarafından taşınır. İtki ağırlığı aştığı anda karşı ağırlıklı bu 4 kol lale yaprağı gibi 42° dışa açılır.',
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'suspension',
        part: partPetalTowers
      },
      {
        title: '32 Odalı Ateşleme: RD-108 Merkez & 4 × RD-107 Yan Motor Kümesi',
        desc: 'Yüksek irtifada dev motorları ateşleme riskini ortadan kaldırmak için merkez RD-108 ve dört yan RD-107 motoru yerde aynı anda ateşlenir. 20 ana çan oda ve 12 gimbal vernier nozulu (toplam 32 oda) ~4.000 kN kalkış itkisi üretir.',
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'engine',
        part: partRd108Engine
      },
      {
        title: '"Korolev Haçı" (Korolev Cross): 4 Yan Hızlandırıcının Simetrik Ayrılması',
        desc: 'Kalkıştan 118 saniye sonra yakıtı biten 4 konik yan hızlandırıcı (Blok B, V, G, D), üst küresel mafsallardan kurtulup oksijen tankı valflerinin itkisiyle dışa doğru simetrik bir haç (✕) çizerek merkez gövdeden ayrılır.',
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'top',
        part: partBoosterB
      },
      {
        title: 'X-Ray: Kriyojenik LOX/Kerosen Tankları & Açık Kafes Ara Kademe',
        desc: 'X-Ray modunda merkez Blok A\'nın sıvı oksijen (-183°C) ve kerosen tankları ile Blok E motorunun alt kademe ayrılmadan önce ateşlenmesine ("hot-staging") olanak tanıyan açık çelik kafes ara kademe görünür.',
        explode: 0,
        cutaway: true,
        sub: 'all',
        cam: 'front',
        part: partInterstageTruss
      },
      {
        title: 'Vostok 3KA ("Sharik") Küresel Kapsülü & Sputnik 1 Uydusu',
        desc: 'Burun kaportası açıldığında Yuri Gagarin\'i taşıyan Ø2,3 m\'lik küresel Vostok 3KA iniş kapsülü, ekipman modülü ve 4 bıyık antenli Sputnik 1 uydusu ortaya çıkar.',
        explode: 0,
        cutaway: true,
        sub: 'all',
        cam: 'breech',
        part: partVostokSpacecraft
      }
    ];

    // ========================================================================
    // ADAPTÖR ARAYÜZÜ (UI) TANIMI
    // ========================================================================
    let activeScheme = 'vostok1961';
    let reliefEnabled = true;

    const ui = {
      title: '1957 R-7 SEMYORKA / VOSTOK KITALARARASI ROKET & KOROLEV HAÇI',
      sub: 'Dünyanın İlk ICBM\'i, Sputnik 1 & Vostok 1 Taşıyıcısı • 32 Odalı RD-107/108 Kümesi, Baykonur Yaprak Kuleleri & Korolev Haçı',
      badge: 'R-7 / VOSTOK — 1957–61',
      partCount: '16 Ana Grup',
      portraitCameraScale: 1.45,
      shadowExtent: 12,
      sliders: [
        { label: 'Korolev Haçı (4 Yan Hızlandırıcı Ayrılma Evresi)', min: 0, max: 100, step: 1, fmt: v => `%${Math.round(v)}` },
        { label: 'Baykonur Yaprak Kuleleri ("Tulip") Açılması', min: 0, max: 42, step: 1, fmt: v => `${Math.round(v)}°` },
        { label: '12 × Vernier Yönlendirme Nozulu Gimbal Açısı', min: -18, max: 18, step: 1, fmt: v => `${v > 0 ? '+' : ''}${Math.round(v)}°` }
      ],
      buttons: {
        terrain: '🛡️ Burun Kaportası (Fairing): KAPALI (Uçuşa Hazır)',
        sweep: '✨ Otomatik Korolev Haçı Gösterimi: KAPALI',
        mode: true
      },
      telemetryTag: 'OKB-1 KOROLEV — BAYKONUR SAHA 1/5',
      statLabels: ['TOPLAM KALKIŞ İTKİSİ', 'KOROLEV HAÇI & KULELER', 'AKTİF YANMA ODASI', 'FAYDALI YÜK / GÖREV'],
      camLabels: {
        iso: 'İzometrik Genel',
        front: 'Cephe Boy Görünüm',
        breech: 'Vostok 3KA & Sputnik',
        engine: '32 Odalı RD-107/108',
        suspension: 'Baykonur Yaprak Kulesi',
        top: 'Üst (Korolev Haçı)'
      },
      texTitle: '🎨 Sovyet Uzay Programı & Baykonur Kaplaması',
      textures: Object.keys(SCHEMES).map(k => ({ key: k, label: SCHEMES[k].btn })),
      subsystems: [
        { key: 'launch_complex', label: 'Baykonur Saha 1/5 & "Tulip" Yaprak Kuleleri', count: 3, color: '#475569' },
        { key: 'core_stage', label: 'Merkez Çekirdek Kademe (Blok A) & RD-108', count: 3, color: '#16a34a' },
        { key: 'strapon_boosters', label: '4 Konik Yan Hızlandırıcı (Korolev Haçı) & RD-107', count: 5, color: '#ea580c' },
        { key: 'upper_payload', label: 'Açık Kafes, Blok E, Vostok 3KA & Sputnik 1', count: 5, color: '#0284c7' }
      ],
      activeTexture: () => activeScheme,
      textureLabel: () => SCHEMES[activeScheme].name,
      relief: () => reliefEnabled,
      reliefLabel: v => `🔩 AMG-6 Alaşım Panel & Kriyojenik Doku: ${v ? 'AÇIK' : 'KAPALI'}`
    };

    function applyTextures(isBlueprint) {
      const sch = SCHEMES[activeScheme] || SCHEMES.vostok1961;
      myMeshes.forEach(m => {
        const mat = m.material;
        if (!mat || !mat.userData) return;
        const role = mat.userData.r7Role;
        let hex = null;
        if (role === 'rocketBody') hex = sch.rocketBody;
        else if (role === 'loxFrost') hex = sch.loxFrost;
        else if (role === 'fairing') hex = sch.fairing;
        else if (role === 'orangeTrim') hex = sch.orangeTrim;
        else if (role === 'padTruss') hex = sch.padTruss;
        else if (role === 'nozzleBronze') hex = sch.nozzleBronze;

        if (hex !== null) {
          if (m.userData && m.userData.origColor) m.userData.origColor.setHex(hex);
          if (!isBlueprint) mat.color.setHex(hex);
        }
        if (role === 'rocketBody' || role === 'loxFrost' || role === 'fairing') {
          mat.bumpMap = (!isBlueprint && reliefEnabled) ? panelBump : null;
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
        launchTable: partLaunchTable,
        petalTowers: partPetalTowers,
        umbilicalMasts: partUmbilicalMasts,
        coreHull: partCoreHull,
        coreTanks: partCoreTanks,
        rd108Engine: partRd108Engine,
        boosterB: partBoosterB,
        boosterV: partBoosterV,
        boosterG: partBoosterG,
        boosterD: partBoosterD,
        rd107Clusters: partRd107Clusters,
        interstageTruss: partInterstageTruss,
        blokEStage: partBlokEStage,
        vostokSpacecraft: partVostokSpacecraft,
        payloadFairing: partPayloadFairing,
        exhaustPlumes: partExhaustPlumes
      },
      defaultPart: partCoreHull,
      firePart: partExhaustPlumes,

      update(dt) {
        syncVisualState(dt);
      },

      onSlider(idx, val) {
        const v = Number(val);
        if (idx === 0) {
          S.autoCross = false;
          S.korolevPct = Math.max(0, Math.min(100, v));
        } else if (idx === 1) {
          S.autoCross = false;
          S.tulipDeg = Math.max(0, Math.min(42, v));
        } else if (idx === 2) {
          S.vernierDeg = Math.max(-18, Math.min(18, v));
        }
        syncVisualState(0);
        return {};
      },

      onButton(name) {
        if (name === 'terrain') {
          S.fairingOpen = !S.fairingOpen;
          ui.buttons.terrain = S.fairingOpen
            ? '🛰️ Burun Kaportası (Fairing): AÇIK (Vostok 3KA & Sputnik Görünür)'
            : '🛡️ Burun Kaportası (Fairing): KAPALI (Uçuşa Hazır)';
          syncVisualState(0);
          return {
            active: S.fairingOpen,
            msg: S.fairingOpen
              ? 'İki parçalı konik burun kaportası ayrıldı; içteki Vostok 3KA ("Sharik") kapsülü ve Sputnik 1 uydusu açığa çıktı!'
              : 'Burun kaportası kapatıldı.'
          };
        }
        if (name === 'sweep') {
          S.autoCross = !S.autoCross;
          ui.buttons.sweep = S.autoCross
            ? '✨ Otomatik Korolev Haçı Gösterimi: AÇIK'
            : '✨ Otomatik Korolev Haçı Gösterimi: KAPALI';
          syncVisualState(0);
          return {
            active: S.autoCross,
            msg: S.autoCross
              ? 'Otomatik Baykonur yaprak kulesi açılışı ve 4\'lü Korolev Haçı ayrılma döngüsü başlatıldı.'
              : 'Otomatik Korolev Haçı döngüsü durduruldu; kaydırıcılarla manuel kontrol edebilirsiniz.'
          };
        }
        if (name === 'mode') {
          S.mode = S.mode === 'vostok' ? 'sputnik' : 'vostok';
          syncVisualState(0);
          return {
            active: S.mode === 'vostok',
            msg: S.mode === 'vostok'
              ? '👨‍🚀 Vostok 8K72K Konfigürasyonu (12 Nisan 1961): Blok E üst kademesi ve Vostok 3KA insanlı uzay aracı aktif.'
              : '🛰️ Sputnik 8K71PS / R-7 ICBM Konfigürasyonu (4 Ekim 1957): 1,5 kademeli temel Semyorka ve PS-1 uydusu.'
          };
        }
        return {};
      },

      buttonActive(name) {
        if (name === 'terrain') return S.fairingOpen;
        if (name === 'sweep') return S.autoCross;
        if (name === 'mode') return S.mode === 'vostok';
        return false;
      },

      modeLabel() {
        return S.mode === 'vostok'
          ? '👨‍🚀 Kip: 1961 Vostok 8K72K (Yuri Gagarin İnsanlı Uzay Aracı)'
          : '🛰️ Kip: 1957 Sputnik 8K71PS / R-7 Semyorka ICBM';
      },

      onFire() {
        S.firing = true;
        if (S.korolevPct < 10) {
          S.tulipDeg = 42;
          S.korolevPct = 65;
          syncVisualState(0);
          if (ctx.audio && ctx.audio.playCannonFire) ctx.audio.playCannonFire();
          return {
            ok: true,
            msg: '🚀 <strong>"POYEHALİ!" (GİDİYORUZ!)</strong> Baykonur yaprak kuleleri 42° açıldı, T+118 sn\'de 4 yan hızlandırıcı simetrik <strong>Korolev Haçı (✕)</strong> çizerek ayrıldı!'
          };
        }
        S.korolevPct = 0;
        S.tulipDeg = 0;
        syncVisualState(0);
        return {
          ok: true,
          refill: true,
          msg: '🔄 R-7 Semyorka / Vostok tekrar Baykonur Saha 1/5 süspansiyon kulelerine kenetlendi (%0).'
        };
      },

      fireButtonLabel() {
        return S.korolevPct < 10
          ? '🚀 KALKIŞ & KOROLEV HAÇI AYRILMASINI BAŞLAT (T+118 SN)'
          : '🔄 ROKETİ BAYKONUR KULELERİNE YENİDEN KENETLE (%0)';
      },

      mobileFireButtonLabel() {
        return S.korolevPct < 10 ? '🚀 Korolev Haçı' : '🔄 Kenetle';
      },

      getSliderValues() {
        return [S.korolevPct, S.tulipDeg, S.vernierDeg];
      },

      getStats() {
        const boostersAttached = S.korolevPct < 35;
        const thrustKn = boostersAttached ? 3997 : 941;
        const activeChambers = boostersAttached ? '32 <span>Oda (20 Ana+12 Vern)</span>' : '8 <span>Oda (RD-108 Merkez)</span>';
        const crossState = S.korolevPct === 0
          ? `Kule: ${S.tulipDeg}° <span>(Kenetli)</span>`
          : `Haç: %${S.korolevPct} <span>(Ayrıldı)</span>`;
        const payloadText = S.mode === 'vostok'
          ? 'Vostok 3KA <span>(4.725 kg)</span>'
          : 'Sputnik 1 <span>(83,6 kg)</span>';
        return [
          `${thrustKn.toLocaleString('tr-TR')} <span>kN İtki</span>`,
          crossState,
          activeChambers,
          payloadText
        ];
      },

      getStatus() {
        if (S.korolevPct >= 35) {
          return { text: 'T+118 SN KOROLEV HAÇI AYRILDI — BLOK A SEYRİ', color: '#ea580c' };
        }
        if (S.tulipDeg >= 30) {
          return { text: 'BAYKONUR YAPRAK KULELERİ AÇIK — 32 ODA TAM İTKİDE', color: '#16a34a' };
        }
        return { text: 'BAYKONUR SAHA 1/5 — 32 ODALI ATEŞLEMEYE HAZIR', color: '#0284c7' };
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
