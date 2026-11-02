/* =============================================================================
 * Pz.Kpfw. VI "Tiger I" (Ausf. E) — 3D Araç Modülü (22 mekanik grup)
 * Klasik script olarak yüklenir; sayfa file:// ile açıldığında da çalışır.
 * simulator.html içindeki çekirdek; THREE, sahne, malzemeler ve parça yardımcılarını ctx ile verir.
 * ========================================================================== */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.tiger1 = function buildTiger(ctx) {
    const { THREE, scene, MATS, addCADMesh, createPartGroup, addInstancedMesh } = ctx;

    const tankRoot = new THREE.Group();
    scene.add(tankRoot);

    // ----------------------------------------------------------------------------
    // A. HULL & ARMOR SUBSYSTEM (100mm Krupp Zırhlı Gövde)
    // ----------------------------------------------------------------------------
    const partLowerHull = createPartGroup({
      id: 'hull_lower',
      name: 'Alt Zırhlı Gövde Küveti (Wanne) & Çekme Mapaları',
      subsystem: 'hull',
      subLabel: 'ALT SİSTEM: ZIRHLI GÖVDE',
      desc: 'Tiger I\'in tüm ağırlığını taşıyan kaynaklı Krupp çelik taban, burulma çubuğu yatakları, ön yedek palet barı ve ağır U-tipi çelik çekme mapaları.',
      material: '26mm - 60mm Krupp Çeliği',
      weight: '9,400 kg',
      spec: 'Kaynaklı Kutu Şasi + Zimmerit',
      location: 'Gövde Alt Taban',
      basePos: [0, 0.72, 0],
      explodeVec: [0, -1.3, 0],
      isOuterShell: false
    });
    addCADMesh(partLowerHull, new THREE.BoxGeometry(2.15, 0.12, 5.8), MATS.armorDark, [0, -0.25, 0]);
    addCADMesh(partLowerHull, new THREE.BoxGeometry(0.1, 0.65, 5.8), MATS.armorOuter, [-1.05, 0.12, 0]);
    addCADMesh(partLowerHull, new THREE.BoxGeometry(0.1, 0.65, 5.8), MATS.armorOuter, [1.05, 0.12, 0]);
    addCADMesh(partLowerHull, new THREE.BoxGeometry(2.2, 0.65, 0.14), MATS.armorOuter, [0, 0.1, 2.88], [0.42, 0, 0]);
    addCADMesh(partLowerHull, new THREE.BoxGeometry(2.2, 0.85, 0.12), MATS.armorOuter, [0, 0.2, -2.88], [-0.15, 0, 0]);
    // Front lower glacis spare track bar (5 spare links) & U-tow shackles
    addCADMesh(partLowerHull, new THREE.CylinderGeometry(0.025, 0.025, 1.65, 10), MATS.gunSteel, [0, 0.18, 2.98], [0, 0, Math.PI / 2]);
    for (let s = -2; s <= 2; s++) {
      addCADMesh(partLowerHull, new THREE.BoxGeometry(0.26, 0.34, 0.06), MATS.trackMetal, [s * 0.29, 0.18, 2.96], [0.42, 0, 0]);
    }
    [-0.92, 0.92].forEach(xShackle => {
      addCADMesh(partLowerHull, new THREE.BoxGeometry(0.12, 0.16, 0.28), MATS.gunSteel, [xShackle, 0.22, 3.02]);
      addCADMesh(partLowerHull, new THREE.BoxGeometry(0.12, 0.16, 0.28), MATS.gunSteel, [xShackle, 0.15, -2.96]);
    });
    // Suspension swing arm mounts along lower hull sides
    for (let i = 0; i < 8; i++) {
      const zMount = -1.75 + i * 0.5;
      addCADMesh(partLowerHull, new THREE.CylinderGeometry(0.08, 0.08, 2.32, 10), MATS.gunSteel, [0, -0.18, zMount], [0, 0, Math.PI / 2], false);
    }
    tankRoot.add(partLowerHull);

    const partFrontArmor = createPartGroup({
      id: 'hull_front',
      name: '100mm Kademeli Ön Zırh, Kugelblende MG34 & Bosch Farlar',
      subsystem: 'hull',
      subLabel: 'ALT SİSTEM: ZIRHLI GÖVDE',
      desc: 'Tiger I\'i önden neredeyse delinmez kılan 100mm kalınlığındaki dikey sürücü plakası, lamine camlı sürücü vizörü (Fahrersehklappe), küresel MG34 yuvası (Kugelblende) ve üst köşelerdeki Bosch karartma farları.',
      material: '100mm Homojen Haddelenmiş Çelik',
      weight: '2,850 kg',
      spec: '100mm Dikey Zırh + Zimmerit',
      location: 'Gövde Ön Cephe',
      basePos: [0, 1.38, 2.45],
      explodeVec: [0, 0.4, 3.4],
      isOuterShell: true
    });
    addCADMesh(partFrontArmor, new THREE.BoxGeometry(3.15, 0.55, 0.22), MATS.armorOuter, [0, 0.08, 0]);
    addCADMesh(partFrontArmor, new THREE.BoxGeometry(3.15, 0.12, 0.65), MATS.armorRoof, [0, -0.22, 0.28], [0.18, 0, 0]);
    // Driver's armored visor (Fahrersehklappe) with vision slit
    addCADMesh(partFrontArmor, new THREE.BoxGeometry(0.52, 0.22, 0.16), MATS.armorDark, [0.68, 0.12, 0.12]);
    addCADMesh(partFrontArmor, new THREE.BoxGeometry(0.38, 0.04, 0.18), MATS.chromeSteel, [0.68, 0.13, 0.13]);
    // Kugelblende ball mount & perforated MG34 barrel jacket
    addCADMesh(partFrontArmor, new THREE.CylinderGeometry(0.22, 0.24, 0.12, 18), MATS.armorDark, [-0.68, 0.1, 0.08], [Math.PI / 2, 0, 0]);
    addCADMesh(partFrontArmor, new THREE.SphereGeometry(0.16, 16, 16), MATS.gunSteel, [-0.68, 0.1, 0.14]);
    addCADMesh(partFrontArmor, new THREE.CylinderGeometry(0.032, 0.042, 0.58, 12), MATS.gunSteel, [-0.68, 0.1, 0.38], [Math.PI / 2, 0, 0]);
    // Bosch karartma farları — erken üretim: iki köşede çift far / geç üretim: ön plakada tek orta far
    const headlightsTwin = new THREE.Group();
    partFrontArmor.add(headlightsTwin);
    [-1.18, 1.18].forEach(xLight => {
      addCADMesh(headlightsTwin, new THREE.BoxGeometry(0.08, 0.16, 0.08), MATS.gunSteel, [xLight, 0.42, 0.08]);
      addCADMesh(headlightsTwin, new THREE.CylinderGeometry(0.11, 0.11, 0.14, 16), MATS.armorDark, [xLight, 0.50, 0.12], [Math.PI / 2, 0, 0]);
      addCADMesh(headlightsTwin, new THREE.BoxGeometry(0.14, 0.03, 0.02), MATS.chromeSteel, [xLight, 0.50, 0.20]);
    });
    const headlightSingle = new THREE.Group();
    headlightSingle.visible = false;
    partFrontArmor.add(headlightSingle);
    addCADMesh(headlightSingle, new THREE.BoxGeometry(0.08, 0.14, 0.08), MATS.gunSteel, [0, 0.41, 0.08]);
    addCADMesh(headlightSingle, new THREE.CylinderGeometry(0.11, 0.11, 0.14, 16), MATS.armorDark, [0, 0.49, 0.12], [Math.PI / 2, 0, 0]);
    addCADMesh(headlightSingle, new THREE.BoxGeometry(0.14, 0.03, 0.02), MATS.chromeSteel, [0, 0.49, 0.20]);
    tankRoot.add(partFrontArmor);

    const partSideArmor = createPartGroup({
      id: 'hull_sides',
      name: '80mm Üst Yan Sponson Zırhları, Çamurluklar & İstihkam Aletleri',
      subsystem: 'hull',
      subLabel: 'ALT SİSTEM: ZIRHLI GÖVDE',
      desc: 'Paletlerin üzerine genişleyen 80mm kalınlığındaki yan zırh plakaları, yan çamurluk etekleri (Schürzen), çelik çekme halatları ve dış istihkam ekipmanları.',
      material: '80mm Krupp Zırh Çeliği',
      weight: '4,600 kg',
      spec: '80mm Dikey Yan Zırh + Balkenkreuz',
      location: 'Gövde Sağ & Sol Yanlar',
      basePos: [0, 1.38, -0.2],
      explodeVec: [0, 0.8, -2.2],
      isOuterShell: true
    });
    addCADMesh(partSideArmor, new THREE.BoxGeometry(0.16, 0.56, 5.2), MATS.armorOuter, [-1.52, 0.08, 0]);
    addCADMesh(partSideArmor, new THREE.BoxGeometry(0.16, 0.56, 5.2), MATS.armorOuter, [1.52, 0.08, 0]);
    addCADMesh(partSideArmor, new THREE.BoxGeometry(0.52, 0.08, 5.2), MATS.armorDark, [-1.28, -0.18, 0]);
    addCADMesh(partSideArmor, new THREE.BoxGeometry(0.52, 0.08, 5.2), MATS.armorDark, [1.28, -0.18, 0]);
    // Ribbed Side Track Fenders (Schürzen) & Gun Cleaning Rods
    [-1.66, 1.66].forEach(xFender => {
      addCADMesh(partSideArmor, new THREE.BoxGeometry(0.16, 0.05, 5.45), MATS.armorRoof, [xFender, -0.16, 0.05]);
      for (let r = 0; r < 4; r++) {
        addCADMesh(partSideArmor, new THREE.CylinderGeometry(0.018, 0.018, 2.4, 8), MATS.woodTool, [xFender * 0.96, 0.14 + r * 0.045, -0.4], [Math.PI / 2, 0, 0]);
      }
    });
    // Balkenkreuz Tactical Insignia Plates on Left & Right Hull Sides
    addCADMesh(partSideArmor, new THREE.PlaneGeometry(0.85, 0.42), MATS.insigniaDecal, [-1.61, 0.12, 0.85], [0, -Math.PI / 2, 0], false);
    addCADMesh(partSideArmor, new THREE.PlaneGeometry(0.85, 0.42), MATS.insigniaDecal, [1.61, 0.12, 0.85], [0, Math.PI / 2, 0], false);
    tankRoot.add(partSideArmor);

    const partHullRoof = createPartGroup({
      id: 'hull_roof',
      name: 'Gövde Tavanı, Feifel Siklon Filtreleri & Çelik Çekme Halatları',
      subsystem: 'hull',
      subLabel: 'ALT SİSTEM: ZIRHLI GÖVDE',
      desc: 'Periskoplu sürücü/telsizci kapakları, gövde üstü 32mm çelik çekme halatları, motor soğutma panjurları ve ikonik çift Feifel siklon toz/hava filtreleri.',
      material: '26mm Haddelenmiş Zırh Çeliği',
      weight: '1,950 kg',
      spec: 'Feifel Hava Filtreli & Panjurlu',
      location: 'Gövde Üst Tavan',
      basePos: [0, 1.72, -0.15],
      explodeVec: [0, 2.5, 0],
      isOuterShell: true
    });
    addCADMesh(partHullRoof, new THREE.BoxGeometry(3.15, 0.08, 1.5), MATS.armorRoof, [0, 0, 1.85]);
    // Driver & Radio Operator Swivel Hatches + Periscope Hoods
    [0.68, -0.68].forEach(xHatch => {
      addCADMesh(partHullRoof, new THREE.CylinderGeometry(0.28, 0.28, 0.10, 20), MATS.armorDark, [xHatch, 0.05, 1.95]);
      addCADMesh(partHullRoof, new THREE.BoxGeometry(0.12, 0.09, 0.14), MATS.gunSteel, [xHatch, 0.11, 2.12]);
    });
    // Pioneer Shovel & Axe on Front Deck
    addCADMesh(partHullRoof, new THREE.CylinderGeometry(0.02, 0.02, 1.1, 8), MATS.woodTool, [0, 0.06, 2.38], [0, 0, Math.PI / 2]);
    addCADMesh(partHullRoof, new THREE.BoxGeometry(0.22, 0.03, 0.26), MATS.gunSteel, [-0.62, 0.06, 2.38]);
    // Rear Engine Deck & Louvered Cooling Grilles
    addCADMesh(partHullRoof, new THREE.BoxGeometry(3.15, 0.08, 2.0), MATS.armorRoof, [0, 0, -1.65]);
    [-0.95, 0.95].forEach(xGrille => {
      addCADMesh(partHullRoof, new THREE.BoxGeometry(0.88, 0.08, 1.42), MATS.armorDark, [xGrille, 0.02, -1.65]);
      for (let l = 0; l < 8; l++) {
        addCADMesh(partHullRoof, new THREE.BoxGeometry(0.82, 0.05, 0.04), MATS.gunSteel, [xGrille, 0.06, -2.25 + l * 0.17], [0.35, 0, 0], false);
      }
      // Coiled Steel Tow Cables along hull deck sides
      addCADMesh(partHullRoof, new THREE.CylinderGeometry(0.032, 0.032, 3.2, 10), MATS.gunSteel, [xGrille * 1.32, 0.07, 0.15], [Math.PI / 2, 0, 0]);
    });
    // Twin Feifel Cyclone Air Cleaners & V-Intake Ducts — yalnızca erken üretimde (1943 ortasında kaldırıldı)
    const feifelGroup = new THREE.Group();
    partHullRoof.add(feifelGroup);
    [-0.58, 0.58].forEach(xFeifel => {
      addCADMesh(feifelGroup, new THREE.CylinderGeometry(0.18, 0.16, 0.52, 16), MATS.armorDark, [xFeifel, 0.18, -2.55]);
      addCADMesh(feifelGroup, new THREE.CylinderGeometry(0.045, 0.045, 0.85, 10), MATS.gunSteel, [xFeifel * 0.55, 0.12, -2.15], [Math.PI / 2, xFeifel > 0 ? -0.42 : 0.42, 0]);
    });
    tankRoot.add(partHullRoof);

    const partBulkhead = createPartGroup({
      id: 'hull_bulkhead',
      name: 'İç Yangın Duvarı (Brandwand) & Kablo Geçişleri',
      subsystem: 'hull',
      subLabel: 'ALT SİSTEM: ZIRHLI GÖVDE',
      desc: 'Mürettebat savaş bölmesi ile arka Maybach V12 motor dairesini birbirinden ayıran çelik bölme duvarı. Olası bir motor yangınının mühimmatlara sıçramasını engeller.',
      material: '10mm Çelik Sac & Asbest İzolasyon',
      weight: '320 kg',
      spec: 'Gaz ve Alev Sızdırmaz',
      location: 'Gövde Orta-Arka Sınır',
      basePos: [0, 1.15, -0.82],
      explodeVec: [0, 1.4, -0.82],
      isOuterShell: false
    });
    addCADMesh(partBulkhead, new THREE.BoxGeometry(2.05, 0.95, 0.08), MATS.interiorCream, [0, 0, 0]);
    addCADMesh(partBulkhead, new THREE.BoxGeometry(0.45, 0.55, 0.12), MATS.armorDark, [0, 0.05, 0]);
    tankRoot.add(partBulkhead);

    // ----------------------------------------------------------------------------
    // B. MAYBACH HL230 V12 ENGINE & COOLING SUBSYSTEM (Motor & Soğutma)
    // ----------------------------------------------------------------------------
    const partEngineBlock = createPartGroup({
      id: 'eng_block',
      name: 'Maybach HL230 P45 V12 Motor Bloğu & 4x Solex Karbüratör',
      subsystem: 'engine',
      subLabel: 'ALT SİSTEM: V12 MOTOR & SOĞUTMA',
      desc: '23 litre hacminde, 60° V12 dizilimli benzinli motor, üstte 4 adet Solex çift boğazlı karbüratör, manyeto ateşleme ünitesi ve döküm egzoz manifoldları.',
      material: 'Dökme Demir & Alüminyum Alaşım',
      weight: '1,200 kg',
      spec: '700 BG @ 3000 RPM (23.0 L)',
      location: 'Arka Motor Dairesi Merkez',
      basePos: [0, 1.05, -1.78],
      explodeVec: [0, 2.2, -2.5],
      isOuterShell: false
    });
    addCADMesh(partEngineBlock, new THREE.BoxGeometry(0.68, 0.48, 1.35), MATS.engineBlock, [0, -0.1, 0]);
    addCADMesh(partEngineBlock, new THREE.BoxGeometry(0.32, 0.48, 1.3), MATS.engineBlock, [-0.26, 0.22, 0], [0, 0, Math.PI / 6]);
    addCADMesh(partEngineBlock, new THREE.BoxGeometry(0.32, 0.48, 1.3), MATS.engineBlock, [0.26, 0.22, 0], [0, 0, -Math.PI / 6]);
    addCADMesh(partEngineBlock, new THREE.CylinderGeometry(0.16, 0.16, 0.9, 16), MATS.gunSteel, [0, 0.52, 0], [Math.PI / 2, 0, 0]);
    // 4x Solex Carburetors & Air Collector Plenum
    for (let c = 0; c < 4; c++) {
      addCADMesh(partEngineBlock, new THREE.CylinderGeometry(0.06, 0.06, 0.18, 10), MATS.brassAmmo, [0, 0.40, -0.42 + c * 0.28]);
    }
    tankRoot.add(partEngineBlock);

    const partPistons = createPartGroup({
      id: 'eng_pistons',
      name: 'V12 Hareketli Piston & Biyel Grubu (12 Silindir)',
      subsystem: 'engine',
      subLabel: 'ALT SİSTEM: V12 MOTOR & SOĞUTMA',
      desc: 'Maybach HL230\'un iki sırada 6\'şar adet çalışan toplam 12 yüksek sıkıştırmalı alüminyum pistonu. Sağ panelden RPM (Motor Devri) kaydırıcısını değiştirerek çalışma hızını gözlemleyebilirsiniz.',
      material: 'Dövme Alüminyum-Silisyum (Mahle)',
      weight: '84 kg (Takım)',
      spec: '130mm Çap x 145mm Strok',
      location: 'Motor Bloğu İçi',
      basePos: [0, 1.28, -1.78],
      explodeVec: [0, 3.15, -2.5],
      isOuterShell: false
    });
    const pistonMeshes = [];
    for (let i = 0; i < 6; i++) {
      const zOff = -0.5 + i * 0.2;
      const pL = addCADMesh(partPistons, new THREE.CylinderGeometry(0.075, 0.075, 0.22, 14), MATS.chromeSteel, [-0.28, 0.12, zOff], [0, 0, Math.PI / 6]);
      pL.userData.phase = i * (Math.PI / 3);
      pL.userData.bankDir = new THREE.Vector3(-Math.sin(Math.PI / 6), Math.cos(Math.PI / 6), 0);
      pL.userData.origin = pL.position.clone();
      pistonMeshes.push(pL);

      const pR = addCADMesh(partPistons, new THREE.CylinderGeometry(0.075, 0.075, 0.22, 14), MATS.chromeSteel, [0.28, 0.12, zOff], [0, 0, -Math.PI / 6]);
      pR.userData.phase = i * (Math.PI / 3) + Math.PI;
      pR.userData.bankDir = new THREE.Vector3(Math.sin(Math.PI / 6), Math.cos(Math.PI / 6), 0);
      pR.userData.origin = pR.position.clone();
      pistonMeshes.push(pR);
    }
    tankRoot.add(partPistons);

    const partRadiators = createPartGroup({
      id: 'eng_radiators',
      name: 'Çift Su Radyatörü, Yakıt Tankları & Siklon Soğutma Fanları',
      subsystem: 'engine',
      subLabel: 'ALT SİSTEM: V12 MOTOR & SOĞUTMA',
      desc: '700 beygirlik V12 motorun aşırı ısınmasını önlemek için motorun sağ ve sol yan bölmelerine yerleştirilmiş 120 litre kapasiteli bakır/pirinç petekli su radyatörleri, 540 litrelik zırhlı yakıt depoları ve mekanik tahrikli dev fanlar.',
      material: 'Bakır-Pirinç Petek & Çelik Fan',
      weight: '410 kg',
      spec: '120 L Su + 540 L Benzin Kapasitesi',
      location: 'Motor Yan Sponson Bölmeleri',
      basePos: [0, 1.22, -1.75],
      explodeVec: [0, 2.0, -3.5],
      isOuterShell: false
    });
    addCADMesh(partRadiators, new THREE.BoxGeometry(0.65, 0.45, 1.3), MATS.radiatorCopper, [-0.95, 0, 0]);
    addCADMesh(partRadiators, new THREE.BoxGeometry(0.65, 0.45, 1.3), MATS.radiatorCopper, [0.95, 0, 0]);
    const fanMeshes = [];
    [-0.95, 0.95].forEach(xPos => {
      [-0.32, 0.32].forEach(zPos => {
        const fanGroup = new THREE.Group();
        fanGroup.position.set(xPos, 0.26, zPos);
        addCADMesh(fanGroup, new THREE.CylinderGeometry(0.24, 0.24, 0.05, 18), MATS.gunSteel);
        addCADMesh(fanGroup, new THREE.BoxGeometry(0.42, 0.04, 0.08), MATS.chromeSteel);
        addCADMesh(fanGroup, new THREE.BoxGeometry(0.08, 0.04, 0.42), MATS.chromeSteel);
        addCADMesh(fanGroup, new THREE.BoxGeometry(0.42, 0.04, 0.08), MATS.chromeSteel, [0, 0, 0], [0, Math.PI / 4, 0]);
        addCADMesh(fanGroup, new THREE.BoxGeometry(0.08, 0.04, 0.42), MATS.chromeSteel, [0, 0, 0], [0, Math.PI / 4, 0]);
        partRadiators.add(fanGroup);
        fanMeshes.push(fanGroup);
      });
    });
    tankRoot.add(partRadiators);

    const partExhaust = createPartGroup({
      id: 'eng_exhaust',
      name: 'Zırhlı Çift Dikey Egzoz Bacası, 20t Kriko & Notek Lambası',
      subsystem: 'engine',
      subLabel: 'ALT SİSTEM: V12 MOTOR & SOĞUTMA',
      desc: 'Tiger I\'in arka zırh plakasında yükselen ikonik çift dikey egzoz susturucusu, 50mm döküm çelik zırh muhafazaları, üst kelebek kapakları ve 20 tonluk ağır bakım krikosu.',
      material: 'Döküm Çelik Muhafaza (50mm)',
      weight: '290 kg',
      spec: 'Alev Gizleyen Susturucu + 20t Kriko',
      location: 'Gövde Arka Dış Cephe',
      basePos: [0, 1.25, -3.05],
      explodeVec: [0, 0.6, -2.6],
      isOuterShell: false
    });
    [-0.38, 0.38].forEach(xEx => {
      addCADMesh(partExhaust, new THREE.CylinderGeometry(0.19, 0.19, 0.82, 16), MATS.paintedSteel, [xEx, -0.02, 0]);
      addCADMesh(partExhaust, new THREE.CylinderGeometry(0.09, 0.09, 0.98, 12), MATS.gunSteel, [xEx, 0.06, 0]);
      addCADMesh(partExhaust, new THREE.CylinderGeometry(0.11, 0.11, 0.03, 12), MATS.gunSteel, [xEx, 0.56, 0], [0.25, 0, 0]);
    });
    // 20-Ton Heavy Tank Jack on Right Rear Plate & Notek Convoy Light on Left
    addCADMesh(partExhaust, new THREE.BoxGeometry(0.22, 0.58, 0.18), MATS.gunSteel, [0.85, -0.12, -0.05]);
    addCADMesh(partExhaust, new THREE.CylinderGeometry(0.08, 0.08, 0.22, 12), MATS.transmissionGreen, [-0.88, 0.15, -0.05]);
    tankRoot.add(partExhaust);

    // ----------------------------------------------------------------------------
    // C. DRIVETRAIN, TRANSMISSION, CREW COCKPIT & AMMO RACKS
    // ----------------------------------------------------------------------------
    const partTransmission = createPartGroup({
      id: 'drv_gearbox',
      name: 'Maybach Olvar Şanzıman, Henschel Direksiyon & Sürücü Kokpiti',
      subsystem: 'drivetrain',
      subLabel: 'ALT SİSTEM: ŞANZIMAN & GÜÇ AKTARIMI',
      desc: 'Sürücü ve telsizcinin tam ortasında bulunan hidrolik ön-seçicili 8 ileri / 4 geri vitesli Olvar şanzıman, Henschel L600C direksiyon simidi ve deri mürettebat koltukları.',
      material: 'Yüksek Mukavemetli Dişli Çeliği',
      weight: '1,450 kg',
      spec: '8 İleri / 4 Geri Hidrolik Vites',
      location: 'Gövde Ön Merkez',
      basePos: [0, 0.95, 2.05],
      explodeVec: [0, 1.8, 2.2],
      isOuterShell: false
    });
    addCADMesh(partTransmission, new THREE.BoxGeometry(0.75, 0.56, 0.88), MATS.transmissionGreen, [0, 0, 0]);
    addCADMesh(partTransmission, new THREE.CylinderGeometry(0.18, 0.18, 2.2, 16), MATS.transmissionGreen, [0, 0.02, 0.22], [0, 0, Math.PI / 2]);
    addCADMesh(partTransmission, new THREE.CylinderGeometry(0.28, 0.28, 0.16, 20), MATS.gunSteel, [-0.82, 0.02, 0.22], [0, 0, Math.PI / 2]);
    addCADMesh(partTransmission, new THREE.CylinderGeometry(0.28, 0.28, 0.16, 20), MATS.gunSteel, [0.82, 0.02, 0.22], [0, 0, Math.PI / 2]);
    // Driver & Radio Operator Leather Seats + Henschel Steering Wheel
    [0.68, -0.68].forEach(xSeat => {
      addCADMesh(partTransmission, new THREE.BoxGeometry(0.42, 0.10, 0.42), MATS.leatherSeat, [xSeat, -0.12, -0.32]);
      addCADMesh(partTransmission, new THREE.BoxGeometry(0.42, 0.46, 0.08), MATS.leatherSeat, [xSeat, 0.14, -0.52]);
    });
    addCADMesh(partTransmission, new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16), MATS.gunSteel, [0.68, 0.24, 0.05], [1.1, 0, 0]);
    addCADMesh(partTransmission, new THREE.CylinderGeometry(0.03, 0.03, 0.38, 8), MATS.chromeSteel, [0.68, 0.10, 0.18], [-0.5, 0, 0]);
    tankRoot.add(partTransmission);

    const partDriveShaft = createPartGroup({
      id: 'drv_shaft',
      name: 'Ana Kardan Güç Aktarma Şaftı (Kardanwelle)',
      subsystem: 'drivetrain',
      subLabel: 'ALT SİSTEM: ŞANZIMAN & GÜÇ AKTARIMI',
      desc: 'Arkadaki Maybach V12 motordan aldığı torku, taret sepetinin altından geçirerek en öndeki Olvar şanzımana ileten yüksek devirli çelik kardan şaftı.',
      material: 'Dövme Krom-Molibden Çeliği',
      weight: '185 kg',
      spec: 'Maks. 3000 RPM Tork İletimi',
      location: 'Gövde Taban Merkez Tüneli',
      basePos: [0, 0.72, 0.15],
      explodeVec: [0, 0.9, 0],
      isOuterShell: false
    });
    const shaftMesh = addCADMesh(partDriveShaft, new THREE.CylinderGeometry(0.075, 0.075, 2.85, 12), MATS.chromeSteel, [0, 0, 0], [Math.PI / 2, 0, 0]);
    addCADMesh(partDriveShaft, new THREE.CylinderGeometry(0.13, 0.13, 0.18, 12), MATS.gunSteel, [0, 0, -1.3], [Math.PI / 2, 0, 0]);
    addCADMesh(partDriveShaft, new THREE.CylinderGeometry(0.13, 0.13, 0.18, 12), MATS.gunSteel, [0, 0, 1.3], [Math.PI / 2, 0, 0]);
    tankRoot.add(partDriveShaft);

    const partAmmoRacks = createPartGroup({
      id: 'drv_ammo',
      name: '8.8 cm PzGr. 39 Mühimmat Rafları (92 Adet Kapasite)',
      subsystem: 'drivetrain',
      subLabel: 'ALT SİSTEM: ŞANZIMAN & MÜHİMMAT',
      desc: 'Gövdenin sağ ve sol üst sponson boşluklarına yatay olarak dizilmiş zırh delici (PzGr. 39) ve yüksek patlayıcılı (Sprgr. L/4.5) 88mm top mermileri. X-Ray modunu açarak iç yerleşimi net görebilirsiniz.',
      material: 'Pirinç Kovan & Sertleştirilmiş Çelik Çekirdek',
      weight: '1,380 kg (Tam Yüklü)',
      spec: '92x 88x571mm R Mermi',
      location: 'Sağ ve Sol Yan Sponson İçi',
      basePos: [0, 1.38, 0.35],
      explodeVec: [0, 1.65, 0.35],
      isOuterShell: false
    });
    [-1.25, 1.25].forEach(xSide => {
      addCADMesh(partAmmoRacks, new THREE.BoxGeometry(0.36, 0.38, 2.3), MATS.armorDark, [xSide, 0, 0]);
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 7; col++) {
          const zShell = -0.95 + col * 0.31;
          const yShell = -0.08 + row * 0.16;
          addCADMesh(partAmmoRacks, new THREE.CylinderGeometry(0.042, 0.046, 0.52, 8), MATS.brassAmmo, [xSide, yShell, zShell], [0, 0, Math.PI / 2], false);
        }
      }
    });
    tankRoot.add(partAmmoRacks);

    // ----------------------------------------------------------------------------
    // D. SCHACHTELLAUFWERK SUSPENSION & TRACKS (Süspansiyon & Paletler)
    // ----------------------------------------------------------------------------
    const partTorsionBars = createPartGroup({
      id: 'sus_torsion',
      name: '16x Enlemesine Burulma Çubuğu & Salıncak Kolları (Drehstabfederung)',
      subsystem: 'suspension',
      subLabel: 'ALT SİSTEM: SÜSPANSİYON & PALET',
      desc: 'Gövde tabanını boydan boya enlemesine geçen 16 adet yay çeliği burulma çubuğu. Tekerlekler engebeli arazide yukarı kalktıkça bu çubuklar kendi ekseninde burularak 57 tonluk tanka son derece sarsıntısız bir atış platformu sağlar.',
      material: 'Yay Çeliği (Krom-Vanadyum)',
      weight: '1,120 kg',
      spec: '55mm - 58mm Çaplı Burulma Mili',
      location: 'Gövde Alt Taban Boyunca',
      basePos: [0, 0.54, 0.15],
      explodeVec: [0, -2.0, 0],
      isOuterShell: false
    });
    for (let i = 0; i < 8; i++) {
      const zBar = -1.75 + i * 0.5;
      addCADMesh(partTorsionBars, new THREE.CylinderGeometry(0.036, 0.036, 2.35, 8), MATS.torsionPurple, [0, 0, zBar], [0, 0, Math.PI / 2], false);
    }
    tankRoot.add(partTorsionBars);

    const partWheelsLeft = createPartGroup({
      id: 'sus_wheels_l',
      name: 'Sol Schachtellaufwerk Tekerlekler (Kauçuk Bandajlı) & Dişli Cer Çarkı',
      subsystem: 'suspension',
      subLabel: 'ALT SİSTEM: SÜSPANSİYON & PALET',
      desc: 'Alman mühendis Heinrich Ernst Kniekamp\'ın tasarladığı 800mm çapındaki bindirmeli (interleaved) kauçuk çemberli çelik yol tekerlekleri ve önde dişli cer çarkı.',
      material: 'Preslenmiş Çelik Disk & Kauçuk Bandaj',
      weight: '3,600 kg (Sol Grup)',
      spec: '8 Aks x 3 Sıra (800mm Çap)',
      location: 'Gövde Sol Alt Yan',
      basePos: [-1.32, 0.45, 0.1],
      explodeVec: [-2.4, -0.4, 0],
      isOuterShell: false
    });

    const partWheelsRight = createPartGroup({
      id: 'sus_wheels_r',
      name: 'Sağ Schachtellaufwerk Tekerlekler (Kauçuk Bandajlı) & Dişli Cer Çarkı',
      subsystem: 'suspension',
      subLabel: 'ALT SİSTEM: SÜSPANSİYON & PALET',
      desc: 'Sağ palet hattını taşıyan iç içe geçmeli 8 aks kauçuk çemberli tekerlek grubu, önde dişli cer tekerleği (Drive Sprocket) ve arkada palet gergi (Idler) tekerleği.',
      material: 'Preslenmiş Çelik Disk & Kauçuk Bandaj',
      weight: '3,600 kg (Sağ Grup)',
      spec: '8 Aks x 3 Sıra (800mm Çap)',
      location: 'Gövde Sağ Alt Yan',
      basePos: [1.32, 0.45, 0.1],
      explodeVec: [2.4, -0.4, 0],
      isOuterShell: false
    });

    // Schachtellaufwerk: taraf başına 8 aks. Kauçuk bandajlı erken düzende aks başına 3 tekerlek (24/taraf),
    // tek ve çift akslar farklı yanal "kat"larda durduğu için tekerlekler iç içe geçer (interleaved).
    // Geç üretimde (1944) iç lastikli çelik tekerleklere geçildi ve aks başına 2 tekerlek kaldı.
    const rotatingWheels = [];
    const axleGroups = [];
    const WHEEL_SLOTS_RUBBER = { odd: [0.30, 0.06, -0.18], even: [0.18, -0.06, -0.30] }; // + = dışa doğru
    const WHEEL_SLOTS_STEEL = { odd: [0.24, 0.0], even: [0.12, -0.12] };
    const geoTire = new THREE.CylinderGeometry(0.42, 0.42, 0.095, 28);
    const geoDisc = new THREE.CylinderGeometry(0.35, 0.35, 0.10, 24);
    const geoHub = new THREE.CylinderGeometry(0.10, 0.10, 0.125, 12);
    const geoSteelDisc = new THREE.CylinderGeometry(0.40, 0.40, 0.10, 28);
    const geoSteelRim = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 28);
    const geoSteelHub = new THREE.CylinderGeometry(0.16, 0.16, 0.13, 14);
    const WHEEL_ROT = [0, 0, Math.PI / 2];

    function populateWheelSide(parentGroup, sideSign) {
      for (let i = 0; i < 8; i++) {
        const zStation = -1.75 + i * 0.5;
        const key = i % 2 === 0 ? 'odd' : 'even';

        // Aks grubu: dönüş (rotation.x) ve süspansiyon salınımı (position.y) tüm tekerleklere birlikte uygulanır
        const axle = new THREE.Group();
        axle.position.set(0, 0, zStation);
        parentGroup.add(axle);

        const rubberSet = new THREE.Group();
        axle.add(rubberSet);
        WHEEL_SLOTS_RUBBER[key].forEach((slot, k) => {
          const x = sideSign * slot;
          addCADMesh(rubberSet, geoTire, MATS.rubberTire, [x, 0, 0], WHEEL_ROT, k === 0);
          addCADMesh(rubberSet, geoDisc, k === 0 ? MATS.paintedSteel : MATS.armorDark, [x, 0, 0], WHEEL_ROT, false);
          addCADMesh(rubberSet, geoHub, MATS.gunSteel, [x + sideSign * 0.01, 0, 0], WHEEL_ROT, false);
        });

        const steelSet = new THREE.Group();
        steelSet.visible = false;
        axle.add(steelSet);
        WHEEL_SLOTS_STEEL[key].forEach((slot, k) => {
          const x = sideSign * slot;
          addCADMesh(steelSet, geoSteelDisc, k === 0 ? MATS.paintedSteel : MATS.armorDark, [x, 0, 0], WHEEL_ROT, k === 0);
          addCADMesh(steelSet, geoSteelRim, MATS.gunSteel, [x, 0, 0], WHEEL_ROT, false);
          addCADMesh(steelSet, geoSteelHub, MATS.gunSteel, [x + sideSign * 0.01, 0, 0], WHEEL_ROT, false);
        });

        axle.userData.stationIndex = i;
        axle.userData.baseY = 0;
        axle.userData.rubberSet = rubberSet;
        axle.userData.steelSet = steelSet;
        rotatingWheels.push(axle);
        axleGroups.push(axle);
      }

      // Önde dişli cer çarkı (paleti çeken tahrik tekerleği)
      const sprocket = addCADMesh(
        parentGroup,
        new THREE.CylinderGeometry(0.39, 0.39, 0.32, 24),
        MATS.paintedSteel,
        [0, 0.26, 2.35],
        WHEEL_ROT
      );
      addCADMesh(sprocket, new THREE.CylinderGeometry(0.18, 0.18, 0.38, 14), MATS.gunSteel);
      for (let t = 0; t < 18; t++) {
        const angle = (t / 18) * Math.PI * 2;
        addCADMesh(
          sprocket,
          new THREE.BoxGeometry(0.06, 0.34, 0.09),
          MATS.chromeSteel,
          [Math.cos(angle) * 0.41, 0, Math.sin(angle) * 0.41],
          [0, -angle, 0],
          false
        );
      }
      sprocket.userData.stationIndex = -1;
      sprocket.userData.baseY = 0.26;
      rotatingWheels.push(sprocket);

      // Arkada palet gergi (avara) tekerleği
      const idler = addCADMesh(
        parentGroup,
        new THREE.CylinderGeometry(0.36, 0.36, 0.3, 24),
        MATS.armorDark,
        [0, 0.22, -2.45],
        WHEEL_ROT
      );
      addCADMesh(idler, new THREE.CylinderGeometry(0.12, 0.12, 0.34, 12), MATS.gunSteel);
      idler.userData.stationIndex = -1;
      idler.userData.baseY = 0.22;
      rotatingWheels.push(idler);
    }

    populateWheelSide(partWheelsLeft, -1);
    populateWheelSide(partWheelsRight, 1);
    tankRoot.add(partWheelsLeft);
    tankRoot.add(partWheelsRight);

    const partTracks = createPartGroup({
      id: 'sus_tracks',
      name: '725mm Geniş Savaş Paletleri & Kılavuz Dişleri (Gefechtsketten)',
      subsystem: 'suspension',
      subLabel: 'ALT SİSTEM: SÜSPANSİYON & PALET',
      desc: '57 tonluk Tiger I\'in yumuşak zemine batmasını önlemek için kullanılan 725mm genişliğindeki manganez-çelik döküm palet baklaları (her iki yanda 96\'şar bakla).',
      material: 'Döküm Manganez Çeliği',
      weight: '5,750 kg (Çift Palet)',
      spec: '725mm Genişlik / 96 Bakla',
      location: 'Sağ & Sol Tekerlek Çevresi',
      basePos: [0, 0.45, 0.1],
      explodeVec: [0, -1.2, 3.0],
      isOuterShell: false
    });

    // Bakla bakla palet: taraf başına 96 bakla, cer çarkı ve avara etrafında kapalı bir eğri boyunca dolaşır.
    // Tiger I'da taşıyıcı makara yoktur; üst palet doğrudan yol tekerleklerinin üstüne oturur.
    // Performans: her taraf için bakla ve kılavuz dişi birer InstancedMesh (toplam 4 çizim çağrısı).
    const trackShoes = []; // eski API uyumluluğu (artık kullanılmıyor)
    const TRACK_LINKS = 96;
    const sprocketArc = [-100, -60, -20, 20, 60, 100].map(d => {
      const a = THREE.MathUtils.degToRad(d);
      return [2.35 + 0.43 * Math.cos(a), 0.26 + 0.43 * Math.sin(a)];
    });
    const idlerArc = [80, 120, 160, 200, 240].map(d => {
      const a = THREE.MathUtils.degToRad(d);
      return [-2.45 + 0.40 * Math.cos(a), 0.22 + 0.40 * Math.sin(a)];
    });
    // (z, y) noktaları — saat yönünün tersine: alt hat ileri, cer çarkı, üst hat geri, avara
    const trackPts = [
      [-1.75, -0.45], [-0.875, -0.45], [0, -0.45], [0.875, -0.45], [1.75, -0.45], [2.15, -0.30],
      ...sprocketArc,
      [1.75, 0.48], [0.875, 0.47], [0, 0.47], [-0.875, 0.47], [-1.75, 0.48],
      ...idlerArc,
      [-2.15, -0.32]
    ].map(p => new THREE.Vector3(0, p[1], p[0]));
    const trackCurve = new THREE.CatmullRomCurve3(trackPts, true, 'centripetal');
    const trackLength = trackCurve.getLength();
    const LUT_N = 1200;
    const trackLUT = [];
    for (let i = 0; i < LUT_N; i++) {
      const u = i / LUT_N;
      const p = trackCurve.getPointAt(u);
      const t = trackCurve.getTangentAt(u);
      trackLUT.push({ y: p.y, z: p.z, a: Math.atan2(-t.y, t.z) });
    }

    const linkGeo = new THREE.BoxGeometry(0.68, 0.05, 0.13);
    const hornGeo = new THREE.BoxGeometry(0.05, 0.08, 0.08);
    const trackSides = [-1.34, 1.34].map(xTrack => ({
      x: xTrack,
      links: addInstancedMesh(partTracks, linkGeo, MATS.trackMetal, TRACK_LINKS),
      horns: addInstancedMesh(partTracks, hornGeo, MATS.gunSteel, TRACK_LINKS)
    }));
    let trackOffset = 0;
    const _m = new THREE.Matrix4();
    const _q = new THREE.Quaternion();
    const _e = new THREE.Euler();
    const _p = new THREE.Vector3();
    const _s = new THREE.Vector3(1, 1, 1);
    const _hornLocal = new THREE.Vector3();

    function wheelWave(z, elapsed) {
      const s = (z + 1.75) / 0.5; // sürekli aks indeksi
      return Math.sin(elapsed * 3.8 + s * 0.75) * 0.055;
    }

    // speed: palet çevresel hızı (birim/sn). İleri sürüşte üst hat ileri, alt hat geri akar → eğri parametresi azalır.
    function updateTracks(dt, speed, elapsed, terrainActive) {
      trackOffset = (trackOffset - (dt * speed) / trackLength) % 1;
      if (trackOffset < 0) trackOffset += 1;
      for (const side of trackSides) {
        for (let i = 0; i < TRACK_LINKS; i++) {
          const u = (i / TRACK_LINKS + trackOffset) % 1;
          const L = trackLUT[Math.floor(u * LUT_N) % LUT_N] || trackLUT[0];
          let y = L.y;
          // Alt hat, süspansiyon testinde tekerlekleri izler
          if (terrainActive && L.y < -0.35 && L.z > -1.9 && L.z < 1.9) y += wheelWave(L.z, elapsed);
          _e.set(L.a, 0, 0);
          _q.setFromEuler(_e);
          _p.set(side.x, y, L.z);
          _m.compose(_p, _q, _s);
          side.links.setMatrixAt(i, _m);
          // Kılavuz dişi bağlantının iç yüzünde (yerel +Y daima eğrinin içine bakar)
          _hornLocal.set(0, 0.055, 0).applyQuaternion(_q);
          _p.add(_hornLocal);
          _m.compose(_p, _q, _s);
          side.horns.setMatrixAt(i, _m);
        }
        side.links.instanceMatrix.needsUpdate = true;
        side.horns.instanceMatrix.needsUpdate = true;
      }
    }
    updateTracks(0, 0, 0, false);
    tankRoot.add(partTracks);

    // ----------------------------------------------------------------------------
    // E. TURRET & 8.8 CM KwK 36 L/56 MAIN GUN SUBSYSTEM (Taret & Ana Silah)
    // ----------------------------------------------------------------------------
    const turretPivot = new THREE.Group();
    turretPivot.position.set(0, 1.76, 0.15);
    tankRoot.add(turretPivot);

    const partTurretBasket = createPartGroup({
      id: 'tur_basket',
      name: '360° Taret Dişli Halkası, Sepet & Nişancı/Komutan Koltukları',
      subsystem: 'turret',
      subLabel: 'ALT SİSTEM: SİLAH & TARET',
      desc: 'Taretin gövde üzerinde dönmesini sağlayan 1850mm çapındaki bilyalı dişli çember, taret ile birlikte dönen iç mürettebat tabanı (Turret Basket), nişancı/komutan koltukları ve hidrolik dönüş mekanizması.',
      material: 'Dövme Çelik Dişli & Çelik Kafes',
      weight: '1,180 kg',
      spec: '1,850 mm Çap / Hidrolik Tahrik',
      location: 'Gövde Merkez Taret Yatağı',
      basePos: [0, -0.35, 0],
      explodeVec: [0, 1.2, 0],
      isOuterShell: false
    });
    addCADMesh(partTurretBasket, new THREE.CylinderGeometry(1.12, 1.12, 0.14, 32), MATS.gunSteel, [0, 0.35, 0]);
    addCADMesh(partTurretBasket, new THREE.CylinderGeometry(0.95, 0.95, 0.08, 24), MATS.interiorCream, [0, -0.42, 0]);
    addCADMesh(partTurretBasket, new THREE.BoxGeometry(0.08, 0.78, 0.08), MATS.gunSteel, [-0.88, -0.02, 0]);
    addCADMesh(partTurretBasket, new THREE.BoxGeometry(0.08, 0.78, 0.08), MATS.gunSteel, [0.88, -0.02, 0]);
    addCADMesh(partTurretBasket, new THREE.BoxGeometry(0.34, 0.10, 0.34), MATS.leatherSeat, [0.55, -0.22, 0.15]);
    addCADMesh(partTurretBasket, new THREE.BoxGeometry(0.34, 0.10, 0.34), MATS.leatherSeat, [0.50, 0.05, -0.45]);
    addCADMesh(partTurretBasket, new THREE.BoxGeometry(0.32, 0.12, 0.32), MATS.leatherSeat, [-0.55, -0.22, -0.15]);
    turretPivot.add(partTurretBasket);

    const partTurretShell = createPartGroup({
      id: 'tur_shell',
      name: 'Krupp At Nalı Taret Zırhı (82mm), Sis Havanları & Yedek Paletler',
      subsystem: 'turret',
      subLabel: 'ALT SİSTEM: SİLAH & TARET',
      desc: 'Tek parça 82mm kalınlığındaki bükülmüş Krupp taret zırhı, yanlarda 3\'er namlulu 90mm Nebelwurfgerät sis havanları, asılı yedek palet baklaları, kaçış kapağı ve dönem paketine göre değişen taktik taret numarası.',
      material: '82mm Bükülmüş Krupp Çeliği',
      weight: '4,950 kg',
      spec: '82mm Zırh + 6x Sis Havanı',
      location: 'Taret Dış Gövde',
      basePos: [0, 0.42, -0.1],
      explodeVec: [0, 3.2, -0.6],
      isOuterShell: true
    });
    // At nalı taret: düz ön plaka + tek parça bükülmüş yan/arka plaka (üstten görünüş profili ekstrüde edilir).
    // Şekil koordinatları: x = yan, y = -z (dünya). Ön köşeler z=+0.9, arka eliptik kavis z≈-1.15.
    const TURRET_RX = 1.2;
    const TURRET_RZ = 1.15;
    const turretShape = new THREE.Shape();
    turretShape.moveTo(-1.05, -0.9);
    turretShape.lineTo(1.05, -0.9);
    turretShape.lineTo(TURRET_RX, 0);
    turretShape.absellipse(0, 0, TURRET_RX, TURRET_RZ, 0, Math.PI, false);
    turretShape.lineTo(-1.05, -0.9);
    const turretGeo = new THREE.ExtrudeGeometry(turretShape, {
      depth: 0.74, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 40
    });
    addCADMesh(partTurretShell, turretGeo, MATS.armorOuter, [0, -0.37, 0], [-Math.PI / 2, 0, 0]);
    // Taret tavanı (ayrı plaka, Zimmeritsiz)
    const roofGeo = new THREE.ShapeGeometry(turretShape, 40);
    addCADMesh(partTurretShell, roofGeo, MATS.armorRoof, [0, 0.395, 0], [-Math.PI / 2, 0, 0], false);

    // Yan duvarın x konumu (z'ye göre): önde düz kenar, arkada elips
    const turretWallX = z => (z >= 0 ? TURRET_RX - (z / 0.9) * (TURRET_RX - 1.05) : TURRET_RX * Math.sqrt(Math.max(0, 1 - (z / TURRET_RZ) ** 2)));

    // Üçlü 90 mm sis havanları (NbK 39) — taret ön yanlarında
    [-1, 1].forEach(side => {
      for (let s = 0; s < 3; s++) {
        addCADMesh(
          partTurretShell,
          new THREE.CylinderGeometry(0.05, 0.05, 0.28, 10),
          MATS.gunSteel,
          [side * (turretWallX(0.68) + 0.05), 0.12 + s * 0.11, 0.68],
          [Math.PI / 3, 0, side > 0 ? -0.18 : 0.18]
        );
      }
      // Taret yanlarına asılı yedek palet baklaları — duvar kavisini izler
      for (let tr = 0; tr < 3; tr++) {
        const z = -0.15 - tr * 0.28;
        addCADMesh(partTurretShell, new THREE.BoxGeometry(0.07, 0.34, 0.24), MATS.trackMetal, [side * (turretWallX(z) + 0.045), 0.0, z]);
      }
    });
    // Sağ arka kaçış kapağı
    addCADMesh(partTurretShell, new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16), MATS.armorDark,
      [-(turretWallX(-0.68) + 0.02), 0.02, -0.68], [0, -0.65, Math.PI / 2]);
    // Taktik numara + Balkenkreuz levhaları (numara dönem paketine göre değişir)
    const sideAngle = Math.atan2(TURRET_RX - 1.05, 0.9);
    addCADMesh(partTurretShell, new THREE.PlaneGeometry(0.78, 0.38), MATS.insigniaDecal, [-(turretWallX(0.42) + 0.025), 0.08, 0.42], [0, -Math.PI / 2 + sideAngle, 0], false);
    addCADMesh(partTurretShell, new THREE.PlaneGeometry(0.78, 0.38), MATS.insigniaDecal, [turretWallX(0.42) + 0.025, 0.08, 0.42], [0, Math.PI / 2 - sideAngle, 0], false);
    turretPivot.add(partTurretShell);

    const partCupola = createPartGroup({
      id: 'tur_cupola',
      name: 'Komutan Kupolası (Erken: 5 Yarık / Geç: 7 Periskop), Yükleyici Kapağı & Gepäckkasten',
      subsystem: 'turret',
      subLabel: 'ALT SİSTEM: SİLAH & TARET',
      desc: 'Taretin sol üst kısmında yer alan 5 periskoplu komutan gözetleme kupolası, uçaksavar MG34 halkası, sağda yükleyici kapağı, duman tahliye fanı ve arkadaki ikonik mürettebat malzeme sandığı (Gepäckkasten).',
      material: '80mm Döküm Çelik Kupola',
      weight: '680 kg',
      spec: '5x Gözetleme Yarığı & Rommel Kutusu',
      location: 'Taret Üst Tavan & Arka',
      basePos: [0, 0.88, -0.15],
      explodeVec: [0, 4.4, -1.2],
      isOuterShell: false
    });
    // Erken kupola: yüksek, davul biçimli, 5 gözetleme yarıklı / Geç kupola (1943 ortası): alçak döküm, 7 periskoplu
    const cupolaEarly = new THREE.Group();
    partCupola.add(cupolaEarly);
    addCADMesh(cupolaEarly, new THREE.CylinderGeometry(0.34, 0.36, 0.32, 24), MATS.armorDark, [0.52, 0.08, -0.25]);
    addCADMesh(cupolaEarly, new THREE.CylinderGeometry(0.36, 0.36, 0.06, 24), MATS.armorRoof, [0.52, 0.25, -0.25]);
    for (let v = 0; v < 5; v++) {
      const a = (v / 5) * Math.PI * 2;
      addCADMesh(
        cupolaEarly,
        new THREE.BoxGeometry(0.12, 0.07, 0.08),
        MATS.chromeSteel,
        [0.52 + Math.cos(a) * 0.33, 0.14, -0.25 + Math.sin(a) * 0.33],
        [0, -a, 0]
      );
    }
    const cupolaLate = new THREE.Group();
    cupolaLate.visible = false;
    partCupola.add(cupolaLate);
    addCADMesh(cupolaLate, new THREE.CylinderGeometry(0.36, 0.40, 0.18, 28), MATS.armorDark, [0.52, 0.01, -0.25]);
    addCADMesh(cupolaLate, new THREE.CylinderGeometry(0.27, 0.30, 0.06, 24), MATS.armorRoof, [0.52, 0.12, -0.25]);
    addCADMesh(cupolaLate, new THREE.TorusGeometry(0.40, 0.018, 8, 32), MATS.gunSteel, [0.52, 0.12, -0.25], [Math.PI / 2, 0, 0], false); // uçaksavar MG halkası
    for (let v = 0; v < 7; v++) {
      const a = (v / 7) * Math.PI * 2;
      addCADMesh(
        cupolaLate,
        new THREE.BoxGeometry(0.10, 0.05, 0.07),
        MATS.chromeSteel,
        [0.52 + Math.cos(a) * 0.33, 0.07, -0.25 + Math.sin(a) * 0.33],
        [0, -a, 0],
        false
      );
    }
    // Turret Roof Fume Extractor Fan Dome & Loader Hatch
    addCADMesh(partCupola, new THREE.CylinderGeometry(0.16, 0.18, 0.08, 14), MATS.armorDark, [0.05, 0.0, 0.28]);
    addCADMesh(partCupola, new THREE.BoxGeometry(0.46, 0.08, 0.46), MATS.armorDark, [-0.5, 0.0, 0.15]);
    // Rear Gepäckkasten (Rommel Box) with mounting brackets
    addCADMesh(partCupola, new THREE.BoxGeometry(1.55, 0.58, 0.45), MATS.paintedSteel, [0, -0.45, -1.32]);
    addCADMesh(partCupola, new THREE.BoxGeometry(1.62, 0.06, 0.48), MATS.armorRoof, [0, -0.15, -1.32]);
    turretPivot.add(partCupola);

    const gunElevationPivot = new THREE.Group();
    gunElevationPivot.position.set(0, 0.42, 0.88);
    turretPivot.add(gunElevationPivot);

    const partMantlet = createPartGroup({
      id: 'tur_mantlet',
      name: '110mm Döküm Top Kalkanı (Kanonenblende) & TZF 9b Nişangahı',
      subsystem: 'turret',
      subLabel: 'ALT SİSTEM: SİLAH & TARET',
      desc: 'Taretin ön açıklığını tamamen kapatan 110mm (bazı noktalarda 140mm) kalınlığındaki döküm çelik kalkan. Üzerinde TZF 9b çift dürbünlü nişangah delikleri ve eş eksenli MG34 yuvası bulunur.',
      material: '110mm - 140mm Döküm Zırh Çeliği',
      weight: '1,780 kg',
      spec: 'TZF 9b Binoküler Nişangah Yuvalı',
      location: 'Taret Ön Cephe',
      basePos: [0, 0, 0.12],
      explodeVec: [0, 1.5, 1.9],
      isOuterShell: false
    });
    addCADMesh(partMantlet, new THREE.BoxGeometry(1.95, 0.68, 0.28), MATS.armorOuter, [0, 0, 0]);
    addCADMesh(partMantlet, new THREE.CylinderGeometry(0.24, 0.28, 0.46, 18), MATS.armorDark, [0, 0, 0.22], [Math.PI / 2, 0, 0]);
    // Coaxial MG34 & Binocular TZF 9b Sight Apertures
    addCADMesh(partMantlet, new THREE.CylinderGeometry(0.03, 0.03, 0.42, 10), MATS.gunSteel, [-0.52, 0.04, 0.22], [Math.PI / 2, 0, 0]);
    addCADMesh(partMantlet, new THREE.CylinderGeometry(0.028, 0.028, 0.32, 10), MATS.rubberTire, [0.32, 0.05, 0.02], [Math.PI / 2, 0, 0]);
    addCADMesh(partMantlet, new THREE.CylinderGeometry(0.028, 0.028, 0.32, 10), MATS.rubberTire, [0.44, 0.05, 0.02], [Math.PI / 2, 0, 0]);
    gunElevationPivot.add(partMantlet);

    const partBreech = createPartGroup({
      id: 'tur_breech',
      name: 'Kama Bloğu & Hidrolik Geri Tepme Silindirleri',
      subsystem: 'turret',
      subLabel: 'ALT SİSTEM: SİLAH & TARET',
      desc: 'Taretin içinde yer alan yarı otomatik yatay kama mekanizması, mermi kovan yakalayıcı sepet ve üstteki ikiz hidrolik-pnömatik geri tepme sönümleyici (recuperator) silindirler.',
      material: 'Yüksek Alaşımlı Top Çeliği',
      weight: '640 kg',
      spec: '580mm Hidrolik Geri Tepme Kursu',
      location: 'Taret İç Merkez',
      basePos: [0, 0, -0.58],
      explodeVec: [0, 3.8, 0.2],
      isOuterShell: false
    });
    const breechMovingGroup = new THREE.Group();
    partBreech.add(breechMovingGroup);
    addCADMesh(breechMovingGroup, new THREE.BoxGeometry(0.46, 0.42, 0.85), MATS.gunSteel, [0, 0, 0]);
    addCADMesh(partBreech, new THREE.CylinderGeometry(0.085, 0.085, 1.05, 14), MATS.chromeSteel, [-0.14, 0.28, 0.12], [Math.PI / 2, 0, 0]);
    addCADMesh(partBreech, new THREE.CylinderGeometry(0.085, 0.085, 1.05, 14), MATS.chromeSteel, [0.14, 0.28, 0.12], [Math.PI / 2, 0, 0]);
    gunElevationPivot.add(partBreech);

    const partGunBarrel = createPartGroup({
      id: 'tur_barrel',
      name: '8.8 cm KwK 36 L/56 Ana Top Namlusu & Çift Odacıklı Ağız Baskısı',
      subsystem: 'turret',
      subLabel: 'ALT SİSTEM: SİLAH & TARET',
      desc: '4.93 metre uzunluğundaki (56 kalibre) yivli 88mm top namlusu ve ucundaki çift odacıklı gaz saptırıcı ağız baskısı (Muzzle Brake). Ateşle butonuna bastığınızda gerçekçi geri tepme hareketini yapar.',
      material: 'Krupp Nikel-Krom Top Çeliği',
      weight: '1,310 kg',
      spec: '88 mm Çap / 4,930 mm Uzunluk (L/56)',
      location: 'Taret Ön Uzantı',
      basePos: [0, 0, 1.85],
      explodeVec: [0, 1.5, 4.2],
      isOuterShell: false
    });
    const barrelRecoilGroup = new THREE.Group();
    partGunBarrel.add(barrelRecoilGroup);

    addCADMesh(barrelRecoilGroup, new THREE.CylinderGeometry(0.115, 0.135, 1.6, 20), MATS.paintedSteel, [0, 0, -0.75], [Math.PI / 2, 0, 0]);
    addCADMesh(barrelRecoilGroup, new THREE.CylinderGeometry(0.095, 0.11, 1.85, 20), MATS.paintedSteel, [0, 0, 0.95], [Math.PI / 2, 0, 0]);
    // Stepped Double-Baffle Muzzle Brake with Side Gas Vent Baffles & Dark Bore
    addCADMesh(barrelRecoilGroup, new THREE.CylinderGeometry(0.155, 0.155, 0.44, 20), MATS.gunSteel, [0, 0, 1.98], [Math.PI / 2, 0, 0]);
    addCADMesh(barrelRecoilGroup, new THREE.BoxGeometry(0.38, 0.22, 0.12), MATS.paintedSteel, [0, 0, 1.88]);
    addCADMesh(barrelRecoilGroup, new THREE.BoxGeometry(0.38, 0.22, 0.12), MATS.paintedSteel, [0, 0, 2.08]);
    addCADMesh(barrelRecoilGroup, new THREE.CylinderGeometry(0.075, 0.075, 0.46, 16), MATS.rubberTire, [0, 0, 1.99], [Math.PI / 2, 0, 0]);

    // Namlu alevi: dar uç namlu ağzında, geniş taban ileri bakar
    const flashGeo = new THREE.ConeGeometry(0.65, 2.2, 16, 1, true);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.0, depthWrite: false, side: THREE.DoubleSide });
    const flashMesh = new THREE.Mesh(flashGeo, flashMat);
    flashMesh.rotation.x = -Math.PI / 2;
    flashMesh.position.set(0, 0, 3.3);
    barrelRecoilGroup.add(flashMesh);

    gunElevationPivot.add(partGunBarrel);

    // Dönem paketine göre donanım: { feifel, cupola: 'early'|'late', wheels: 'rubber'|'steel', headlights: 'twin'|'single' }
    function setVariant(v) {
      feifelGroup.visible = !!v.feifel;
      cupolaEarly.visible = v.cupola !== 'late';
      cupolaLate.visible = v.cupola === 'late';
      headlightsTwin.visible = v.headlights !== 'single';
      headlightSingle.visible = v.headlights === 'single';
      axleGroups.forEach(a => {
        a.userData.rubberSet.visible = v.wheels !== 'steel';
        a.userData.steelSet.visible = v.wheels === 'steel';
      });
    }

    return {
      tankRoot, turretPivot, gunElevationPivot, barrelRecoilGroup, breechMovingGroup, flashMesh,
      pistonMeshes, fanMeshes, shaftMesh, rotatingWheels, trackShoes,
      partFrontArmor, partAmmoRacks, partGunBarrel, partPistons, partTransmission, partTorsionBars,
      setVariant, updateTracks
    };
  };
})();
