// ============================================================================
// 672 BİZANS "RUM ATEŞİ" (GREEK FIRE / HYGRON PYR) & ÇİFT PİSTONLU SİFON POMPASI
// Madrid Skylitzes Elyazması (fol. 34v), VI. Leon Taktika (Böl. XIX) ve
// Haldon & Byrne (2002) Tam Ölçekli Deneysel Rekonstrüksiyonuna Göre
// 1:1 Tam Ölçekli Bizans Dromon Pruvası (Xylokastron) & Alt Güverte Sifon Dairesi
// ============================================================================
(function () {
  window.VehicleBuilders = window.VehicleBuilders || {};

  // --- Prosedürel Meşe Kaplama, Dövme Bronz ve Sirke/Şaplı Deri Kabartma Dokusu ---
  function makeByzantineBumpTexture(THREE) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#808080';
    g.fillRect(0, 0, 256, 256);

    // Yatay kalas derzleri ve dövme perçin/çivi başları
    g.strokeStyle = '#525252';
    g.lineWidth = 2;
    for (let y = 16; y < 256; y += 32) {
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
    g.fillStyle = '#c8c8c8';
    for (let y = 8; y < 256; y += 16) {
      for (let x = 8; x < 256; x += 16) {
        g.beginPath();
        g.arc(x, y, 1.8, 0, Math.PI * 2);
        g.fill();
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(5, 3);
    return tex;
  }

  // --- 4 Tarihsel Boya ve Malzeme Şeması ---
  const SCHEMES = {
    constantinople674: {
      name: '🔥 674 Konstantinopolis Kuşatması (İmparatorluk Erguvanı & Dövme Bronz)',
      btn: '🔥 674 Kuşatması (Erguvan & Bronz)',
      hullWood: 0x5c3a21,
      hullTrim: 0x7f1d1d,
      deckOak: 0x785233,
      copper: 0xb45309,
      bronze: 0xd97706,
      hideShield: 0x7c2d12,
      amphora: 0x9a3412,
      water: 0x0e7490
    },
    skylitzes_ms: {
      name: '📜 Madrid Skylitzes Elyazması (Bizans Altın Varak, Vermilyon & Çivit Mavi)',
      btn: '📜 Skylitzes Minyatürü (Altın & Çivit)',
      hullWood: 0x4a2c18,
      hullTrim: 0x991b1b,
      deckOak: 0x855836,
      copper: 0xc2410c,
      bronze: 0xeab308,
      hideShield: 0x1e3a8a,
      amphora: 0xb45309,
      water: 0x0284c7
    },
    haldon2002: {
      name: '⚗️ 2002 Haldon & Byrne Deneysel Rekonstrüksiyonu (Ham Çam, Bakır & Pirinç)',
      btn: '⚗️ Haldon-Byrne Deneyi (Ham Bakır)',
      hullWood: 0x6b4423,
      hullTrim: 0x57534e,
      deckOak: 0x8c6239,
      copper: 0xd97706,
      bronze: 0xca8a04,
      hideShield: 0x57534e,
      amphora: 0xa16207,
      water: 0x0369a1
    },
    dromon_night717: {
      name: '🌙 717 Haliç Gece Baskını (Ziftli Kararmış Gövde & Kızıl Ocak)',
      btn: '🌙 717 Gece Baskını (Ziftli Siyah)',
      hullWood: 0x292524,
      hullTrim: 0x450a0a,
      deckOak: 0x44403c,
      copper: 0x9a3412,
      bronze: 0xb45309,
      hideShield: 0x3f3f46,
      amphora: 0x78350f,
      water: 0x164e63
    }
  };

  // --- Prosedürel Dromon Pruva Kabuğu (Keskin Çeneli Kadırga Pruvası + Bronz Mahmuz) ---
  // z = -3.80 m (orta kesit) .. +3.25 m (pruva bodoslaması)
  function createDromonHullGeometry(THREE, isInner) {
    const nz = 24;
    const nu = 16;
    const zMin = -3.80;
    const zMax = 3.25;
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    const inset = isInner ? 0.045 : 0.0;

    function hullProfile(z, u) {
      // t = 0 (orta kesit z=-3.80) -> t = 1 (pruva ucu z=+3.25)
      const t = (z - zMin) / (zMax - zMin);
      const halfBeam = Math.max(0.06, (1.58 - inset) * Math.pow(Math.max(0, 1 - Math.pow(t, 1.55)), 0.68));
      const yKeel = 0.24 + Math.pow(t, 2.2) * 0.52 + (isInner ? 0.04 : 0);
      const yGunwale = 1.92 + Math.pow(t, 1.8) * 0.56;
      // u: -1 (iskele küpeşte) .. 0 (omurga) .. +1 (sancak küpeşte)
      const s = Math.abs(u);
      const sign = u < 0 ? -1 : 1;
      const x = sign * halfBeam * Math.pow(s, 0.78);
      const y = yKeel + (yGunwale - yKeel) * Math.pow(s, 1.35);
      return [x, y, z];
    }

    for (let iz = 0; iz <= nz; iz++) {
      const fz = iz / nz;
      const z = zMin + fz * (zMax - zMin);
      for (let iu = 0; iu <= nu; iu++) {
        const fu = iu / nu;
        const u = -1 + 2 * fu;
        const [x, y, zp] = hullProfile(z, u);
        positions.push(x, y, zp);
        const nx = u === 0 ? 0 : (u < 0 ? -0.85 : 0.85);
        const ny = -0.45;
        const nzVec = 0.25 * fz;
        const len = Math.hypot(nx, ny, nzVec) || 1;
        const dir = isInner ? -1 : 1;
        normals.push((nx / len) * dir, (ny / len) * dir, (nzVec / len) * dir);
        uvs.push(fz * 4, fu * 2);
      }
    }

    const stride = nu + 1;
    for (let iz = 0; iz < nz; iz++) {
      for (let iu = 0; iu < nu; iu++) {
        const a = iz * stride + iu;
        const b = (iz + 1) * stride + iu;
        const c = (iz + 1) * stride + (iu + 1);
        const d = iz * stride + (iu + 1);
        if (isInner) {
          indices.push(a, c, b, a, d, c);
        } else {
          indices.push(a, b, c, a, c, d);
        }
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

  window.VehicleBuilders.greekfire = function buildGreekFire(ctx) {
    const { THREE, scene, addCADMesh, createPartGroup } = ctx;
    const root = new THREE.Group();
    root.name = 'greekfire_root';
    root.visible = false;
    scene.add(root);

    const myMeshes = [];
    const byzBump = makeByzantineBumpTexture(THREE);

    function addMesh(parent, geo, mat, pos, rot, scale) {
      const m = addCADMesh(parent, geo, mat, pos, rot);
      if (scale) m.scale.set(scale[0], scale[1], scale[2]);
      myMeshes.push(m);
      return m;
    }

    // --- Malzemeler ---
    const matHullOuter = new THREE.MeshStandardMaterial({
      color: SCHEMES.constantinople674.hullWood,
      roughness: 0.72,
      metalness: 0.15,
      bumpMap: byzBump,
      bumpScale: 0.015,
      side: THREE.DoubleSide
    });
    matHullOuter.userData = { isOuterShell: true, gfRole: 'hullWood' };

    const matHullTrim = new THREE.MeshStandardMaterial({
      color: SCHEMES.constantinople674.hullTrim,
      roughness: 0.55,
      metalness: 0.22,
      bumpMap: byzBump,
      bumpScale: 0.012
    });
    matHullTrim.userData = { gfRole: 'hullTrim' };

    const matDeckOak = new THREE.MeshStandardMaterial({
      color: SCHEMES.constantinople674.deckOak,
      roughness: 0.76,
      metalness: 0.10,
      bumpMap: byzBump,
      bumpScale: 0.012
    });
    matDeckOak.userData = { gfRole: 'deckOak' };

    const matCopper = new THREE.MeshStandardMaterial({
      color: SCHEMES.constantinople674.copper,
      roughness: 0.30,
      metalness: 0.85,
      bumpMap: byzBump,
      bumpScale: 0.008
    });
    matCopper.userData = { gfRole: 'copper' };

    const matBronze = new THREE.MeshStandardMaterial({
      color: SCHEMES.constantinople674.bronze,
      roughness: 0.26,
      metalness: 0.88
    });
    matBronze.userData = { gfRole: 'bronze' };

    const matHideShield = new THREE.MeshStandardMaterial({
      color: SCHEMES.constantinople674.hideShield,
      roughness: 0.82,
      metalness: 0.08,
      bumpMap: byzBump,
      bumpScale: 0.014
    });
    matHideShield.userData = { gfRole: 'hideShield' };

    const matAmphora = new THREE.MeshStandardMaterial({
      color: SCHEMES.constantinople674.amphora,
      roughness: 0.68,
      metalness: 0.12
    });
    matAmphora.userData = { gfRole: 'amphora' };

    const matDarkIron = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.45,
      metalness: 0.82
    });

    const matEmberGlow = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 0.85,
      roughness: 0.35
    });

    const matFlameCore = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf97316,
      emissiveIntensity: 1.35,
      roughness: 0.20,
      transparent: true,
      opacity: 0.92
    });

    const matFlameOuter = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xb91c1c,
      emissiveIntensity: 1.05,
      roughness: 0.35,
      transparent: true,
      opacity: 0.78
    });

    const matWater = new THREE.MeshStandardMaterial({
      color: SCHEMES.constantinople674.water,
      roughness: 0.18,
      metalness: 0.12,
      transparent: true,
      opacity: 0.26,
      depthWrite: false
    });
    matWater.userData = { isWater: true, gfRole: 'water' };

    // ========================================================================
    // 15 BAĞIMSIZ MEKANİK PARÇA GRUBU (4 Alt Sistem)
    // ========================================================================
    const SUB_LABELS = {
      dromon_hull: 'ALT SİSTEM: DROMON PRUVA GÖVDESİ & AMFORALAR',
      cauldron_hearth: 'ALT SİSTEM: KÖRÜKLÜ OCAK & BAKIR KAZAN',
      pump_hydraulics: 'ALT SİSTEM: KTESİBİOS ÇİFT PİSTON POMPA & WINDKESSEL',
      siphon_armament: 'ALT SİSTEM: STREPTON MAFSAL & ASLAN BAŞLI SİFON'
    };

    function makePart(cfg) {
      return createPartGroup({
        id: cfg.id,
        name: cfg.name,
        subsystem: cfg.sub,
        subLabel: SUB_LABELS[cfg.sub] || 'ALT SİSTEM: RUM ATEŞİ SİFONU',
        desc: cfg.desc,
        material: cfg.material || 'Dövme Bronz, Bakır & Meşe',
        weight: cfg.weight || '85 kg',
        spec: cfg.spec || 'Standart',
        location: cfg.location || 'Dromon Pruvası',
        basePos: [0, 0, 0],
        explodeVec: cfg.explode || [0, 1.2, 0],
        isOuterShell: cfg.id === 'gf_dromon_prow'
      });
    }

    // ALT SİSTEM 1: Dromon Pruva Gövdesi, Xylokastron & Neft Amforaları (dromon_hull)
    const partDromonProw = makePart({
      id: 'gf_dromon_prow',
      name: '1. Bizans Dromon Pruva Gövdesi, Xylokastron Kalesi & Bronz Mahmuz (Peronion)',
      sub: 'dromon_hull',
      color: '#785233',
      explode: [0, 0.4, -1.8],
      spec: 'Gövde: Meşe postalar ve sedir/çam kaplama | Pruva Kalesi: Xylokastron (Ahşap Burun Kulesi) | Mahmuz: Su üstü dövme bronz Peronion',
      desc: 'Bizans İmparatorluk donanmasının belkemiği olan Dromon kadırgalarının pruva (prorai) bölümü. Alt güvertede gizli ısıtma kazanı ve çift pistonlu sifon pompası korunurken, üst pruva kalesinde (xylokastron) döner bronz sifon namlusu yer alır. X-Ray modunda dış borda kaplaması saydamlaşarak alt güvertedeki gizli sifon dairesini açığa çıkarır.'
    });

    const partKeelWater = makePart({
      id: 'gf_keel_water',
      name: '2. Dromon Omurga Kızak Beşikleri & Marmara / Haliç Su Hattı',
      sub: 'dromon_hull',
      color: '#5c3a21',
      explode: [0, -1.3, 0],
      spec: 'Omurga Tabanı: y = 0,000 m meşe tersane kızakları | Su Hattı: y = 0,95 m yarı saydam Marmara / Haliç denizi',
      desc: 'Dromon pruva kesitini y = 0,000 m müze zemininde taşıyan ağır meşe kızak beşikleri, omurga takozları ve geminin su çekimini (draft) gösteren yarı saydam deniz yüzeyi.'
    });

    const partNaphthaAmphorae = makePart({
      id: 'gf_naphtha_amphorae',
      name: '3. Ziftli Neft (Nafta) & Çam Reçinesi Amforaları ve Bakır İkmal Varilleri',
      sub: 'dromon_hull',
      color: '#9a3412',
      explode: [-1.8, 0.3, -1.6],
      spec: 'Yakıt: Karadeniz (Taman/Kafkasya) ham neft yağı + çam reçinesi + kükürt | Depolama: Zift sıvalı pişmiş toprak amforalar ve bakır fıçılar',
      desc: 'İmparator VII. Konstantinos Porphyrogennetos\'un "devlet sırrı" olarak tanımladığı sıvı yangın bileşiminin depolandığı sızdırmaz amforalar ve bakır ikmal varilleri. Ham petrol (nafta), yoğunlaştırıcı çam reçinesi ile karıştırılarak su üstünde yüzen ve sönmeyen bir jel-sıvı haline getirilirdi.'
    });

    const partHideShields = makePart({
      id: 'gf_hide_shields',
      name: '14. Sirke ve Şapla Islatılmış Yangın Önleyici Deri/Keçe Pruva Siperlikleri',
      sub: 'dromon_hull',
      color: '#7c2d12',
      explode: [1.9, 0.9, 1.0],
      spec: 'Koruma: Sirke, şap (alum) ve suyla ıslatılmış kalın sığır derisi / keçe perdeler | Konum: Xylokastron pruva siperi ve borda kalkanları',
      desc: 'VI. Leon\'un Taktika eserinde tarif edildiği üzere, hem kendi sifonlarından sıçrayabilecek kızgın neft damlalarına hem de düşman ok ve yangın silahlarına karşı pruva kalesinin dışına asılan sirke ve şap emdirilmiş çok katmanlı deri siperlikler ve Bizans Chi-Rho (☧) kalkanları.'
    });

    // ALT SİSTEM 2: Körüklü Ocak & Bakır Ön-Isıtma Kazanı (cauldron_hearth)
    const partBellowsHearth = makePart({
      id: 'gf_bellows_hearth',
      name: '4. Çift Körüklü Odun/Kömür Ocağı (Furnace Hearth) & Kor Ateş Yatağı',
      sub: 'cauldron_hearth',
      color: '#ea580c',
      explode: [-1.9, -0.3, -0.6],
      spec: 'Ocak: Tuğla ve demir kuşaklı gemi mangalı | Hava Beslemesi: Pompa koluna senkron çift deri körük (Bellows)',
      desc: 'Alt güvertede bakır kazanın altında yanan izole kömür/odun ocağı ve ateşi harlayan çift deri körük. Neft karışımının viskozitesini düşürmek ve namludan çıktığında anında buharlaşıp tutuşmasını sağlamak için yakıt kontrollü biçimde ön ısıtmaya tabi tutulurdu.'
    });

    const partCopperCauldron = makePart({
      id: 'gf_copper_cauldron',
      name: '5. Perçinli Kubbeli Bakır Ön-Isıtma Kazanı (Chalkion) & Emniyet Valfi',
      sub: 'cauldron_hearth',
      color: '#b45309',
      explode: [0, 0.8, -1.1],
      spec: 'Malzeme: Kalın dövme bakır levha (Chalkion) | İşlev: Neft ve reçine karışımını ~70-90°C sıcaklığa ısıtma ve emiş borusuna besleme',
      desc: 'Kallinikos\'un sisteminin kalbi olan kubbeli bakır kazan. Altındaki ocaktan aldığı ısıyla neft-reçine karışımını akışkan ve uçucu hale getirir; alt çıkış borusuyla yakıtı doğrudan Ktesibios tipi çift pistonlu bronz kuvvet pompasına iletir.'
    });

    const partHandCheirosiphones = makePart({
      id: 'gf_hand_cheirosiphones',
      name: '13. Portatif El Sifonları (Cheirosiphones) & Toprak Rum Ateşi El Bombaları',
      sub: 'cauldron_hearth',
      color: '#ca8a04',
      explode: [2.0, 0.6, -0.4],
      spec: 'El Silahı: İmparator VI. Leon dönemi bronz şırınga-pistonlu Cheirosiphon (3 adet) | Mühimmat: Fitilli pişmiş toprak Rum Ateşi el bombaları',
      desc: 'VI. Leon\'un Taktika (Böl. XIX) eserinde "bizim yeni icadımız" diyerek tanıttığı, askerlerin kalkan arkasından düşman güvertesine alev püskürttüğü portatif el sifonları (cheirosiphones) ve çarpma anında kırılıp tutuşan neft dolu seramik el bombaları.'
    });

    // ALT SİSTEM 3: Ktesibios Çift Pistonlu Kuvvet Pompası & Windkessel (pump_hydraulics)
    const partPumpBeam = makePart({
      id: 'gf_pump_beam',
      name: '6. Çift Kollu Pompa Manivelası (Rocking Lever Beam) & Sifoncu Tutamakları',
      sub: 'pump_hydraulics',
      color: '#d97706',
      explode: [0, 1.9, 0.25],
      spec: 'Mekanizma: Merkez mafsallı (R = 0,36 m) demir kuşaklı meşe terazi kolu | Tahrik: 2-4 Siphonarios (sifon eri) tarafından karşılıklı basma',
      desc: 'Alt güvertedeki sifoncuların (siphonarioi) karşılıklı olarak aşağı-yukarı bastığı uzun terazi manivelası. Kolun bir ucu inerken diğer ucu yükselir; böylece ikiz bronz silindirler 180° faz farkıyla kesintisiz basınç üretir.'
    });

    const partTwinCylinders = makePart({
      id: 'gf_twin_cylinders',
      name: '7. Ktesibios Tipi İkiz Bronz Pompa Silindirleri, Pistonlar & Klapeler',
      sub: 'pump_hydraulics',
      color: '#eab308',
      explode: [-1.8, 0.5, 0.25],
      spec: 'Tasarım: İskenderiyeli Ktesibios / İskenderiyeli Heron çift etkili bronz kuvvet pompası | Çap: 2 × Ø180 mm | Basınç: ~8–10 bar',
      desc: 'Antik Yunan-Roma hidrolik mühendisliğinin zirvesi olan Ktesibios kuvvet pompası. Bir piston yukarı çıkarken bakır kazandan sıcak nefti emer, diğer piston aşağı inerken tek yönlü bronz klapeyi (flap valve) açarak sıvıyı merkez basınç kubbesine basar.'
    });

    const partWindkesselDome = makePart({
      id: 'gf_windkessel_dome',
      name: '8. Merkez Basınç Dengeleme Hava Kubbesi (Windkessel / Pneuma Dome)',
      sub: 'pump_hydraulics',
      color: '#f59e0b',
      explode: [1.8, 0.5, 0.25],
      spec: 'Prensip: Sıkıştırılmış hava yastıklı hidrolik akümülatör (Windkessel) | İşlev: Piston vuruşlarını sönümleyip kesintisiz jet akışı sağlama',
      desc: 'İkiz silindirlerin ortasında yer alan hava sıkıştırma kubbesi. Pompalanan neft kubbenin alt kısmına dolarken üstteki hapsolmuş havayı sıkıştırır; bu hava yayı sayesinde sıvı kesik kesik değil, 15-20 metre menzilli kesintisiz bir mızrak gibi fışkırır.'
    });

    const partRiserConduit = makePart({
      id: 'gf_riser_conduit',
      name: '9. Zırhlı Bakır Dikme Borusu (Riser Pipe), Döner Salmastra & Ana Kesme Valfi',
      sub: 'pump_hydraulics',
      color: '#b45309',
      explode: [0, 1.1, 1.2],
      spec: 'Hat: Windkessel kubbesinden üst pruva güvertesine çıkan kalın etli bakır boru | Kontrol: Çeyrek turlu konik bronz ana vana (Stopcock)',
      desc: 'Alt güvertedeki pompa kolektöründen üst pruva kalesindeki (xylokastron) sifon kundağına basınçlı sıcak neft taşıyan dikme borusu ve sifon başçavuşunun (protosiphonarios) atışı başlatmak için açtığı ana kesme vanası.'
    });

    // ALT SİSTEM 4: Döner Sifon Namlusu, Pilot Meşale & Rum Ateşi Jeti (siphon_armament)
    const partSwivelCradle = makePart({
      id: 'gf_swivel_cradle',
      name: '10. Döner Bronz Mafsal Kundağı (Strepton) & Nişan Çemberi',
      sub: 'siphon_armament',
      color: '#d97706',
      explode: [0, 1.4, 2.15],
      spec: 'Mafsal: Strepton ("dönebilen") sızdırmaz bronz döner kundak | Yanal Açı: -35° .. +35° | Yükseliş Açısı: -10° .. +25°',
      desc: 'Bizans kaynaklarında "strepton" olarak adlandırılan, sifon namlusunun hem sancak-iskele yönünde (±35°) hem de aşağı-yukarı (-10°..+25°) döndürülerek düşman gemisinin güvertesine veya su hattına nişan alınmasını sağlayan çift eksenli bronz kundak.'
    });

    const partBronzeSiphon = makePart({
      id: 'gf_bronze_siphon',
      name: '11. Aslan Başlı (Leontokephalos) Dövme Bronz Sifon Namlusu (Sipho)',
      sub: 'siphon_armament',
      color: '#eab308',
      explode: [0, 1.8, 3.1],
      spec: 'Namlu Boyu: 1,70 m konik daralan dövme bronz boru | Ağız Süsü: Düşmana korku salan açık ağızlı bronz Aslan Başı (Leontokephalos)',
      desc: 'VI. Leon\'un Taktika\'sında "pruvanın önünde aslan veya başka yırtıcı hayvan başlarıyla kaplı bronz sifonlar bulunur" sözleriyle tarif ettiği ana silah namlusu. Uçtaki daraltıcı nozul (Ø22 mm), basıncı yüksek hızlı bir sıvı sütununa dönüştürür.'
    });

    const partPilotLance = makePart({
      id: 'gf_pilot_lance',
      name: '12. Sifon Ağzı Sürekli Yanan Pilot Ateşleme Mızrağı & Reçine Çanağı',
      sub: 'siphon_armament',
      color: '#f97316',
      explode: [1.2, 1.9, 3.6],
      spec: 'Ateşleme: Sifon ağzının 22 cm önünde asılı yanan reçine/kükürt meşale çanağı | Emniyet: Pilot meşale sönükse sıvı neft tutuşmaz!',
      desc: 'Sifon namlusunun altından uzanan demir kol üzerindeki sürekli yanan pilot ateş çanağı. Ana vana açıldığında nozuldan fışkıran basınçlı sıcak neft bu pilot alevin içinden geçerek gök gürültüsünü andıran bir kükreme ("bronte") ve yoğun dumanla dev bir alev sütununa dönüşür.'
    });

    const partFlameJet = makePart({
      id: 'gf_flame_jet',
      name: '15. Basınçlı Sıvı Rum Ateşi Alev Jeti (Pyr Thalassion) & Su Üstü Ateş Göleti',
      sub: 'siphon_armament',
      color: '#dc2626',
      explode: [0, 1.5, 5.2],
      spec: 'Menzil: ~15–20 metre basınçlı parabolik sıvı alev sütunu | Özellik: Su üzerinde yüzer, su döküldükçe harlanır; ancak kum, sirke veya şaplı deriyle boğulabilir',
      desc: 'Arapça kaynaklarda "Neft", Haçlı kaynaklarında "Yunan/Rum Ateşi", Bizans\'ta ise "Deniz Ateşi" (Pyr Thalassion) veya "Sıvı Ateş" (Hygron Pyr) olarak anılan korkunç alev jeti. Suyla söndürülemez; deniz yüzeyine düştüğünde bile su üstünde yüzerek düşman kadırgalarını su hattından tutuşturur.'
    });

    // Tüm grupları root'a ekle
    [
      partDromonProw, partKeelWater, partNaphthaAmphorae, partHideShields,
      partBellowsHearth, partCopperCauldron, partHandCheirosiphones,
      partPumpBeam, partTwinCylinders, partWindkesselDome, partRiserConduit,
      partSwivelCradle, partBronzeSiphon, partPilotLance, partFlameJet
    ].forEach(g => root.add(g));

    // ========================================================================
    // GEOMETRİ İNŞASI
    // ========================================================================

    // --- 2. Dromon Omurga Kızak Beşikleri (y = 0,000 m) & Marmara Su Hattı (partKeelWater) ---
    // Ana boyuna kızak kirişleri (alt yüzey tam y = 0,000 m)
    [-0.95, 0.95].forEach(xRail => {
      addMesh(partKeelWater, new THREE.BoxGeometry(0.22, 0.14, 7.60), matDeckOak, [xRail, 0.07, -0.35]);
    });
    // 5 adet enine tersane beşik traversi ve omurga yastıkları
    [-3.30, -1.85, -0.40, 1.05, 2.45].forEach((zCr, idx) => {
      const keelY = 0.24 + Math.pow((zCr - (-3.80)) / 7.05, 2.2) * 0.52;
      addMesh(partKeelWater, new THREE.BoxGeometry(2.30, 0.14, 0.26), matDeckOak, [0, 0.14, zCr]);
      const pillarH = Math.max(0.08, keelY - 0.18);
      addMesh(partKeelWater, new THREE.BoxGeometry(0.36, pillarH, 0.24), matDeckOak, [0, 0.18 + pillarH * 0.5, zCr]);
      if (idx < 4) {
        addMesh(partKeelWater, new THREE.BoxGeometry(0.22, pillarH + 0.22, 0.20), matDeckOak, [-0.68, 0.18 + (pillarH + 0.22) * 0.5, zCr], [0, 0, -0.28]);
        addMesh(partKeelWater, new THREE.BoxGeometry(0.22, pillarH + 0.22, 0.20), matDeckOak, [0.68, 0.18 + (pillarH + 0.22) * 0.5, zCr], [0, 0, 0.28]);
      }
    });
    // Yarı saydam Marmara / Haliç su hattı (y = 0,95 m)
    addMesh(partKeelWater, new THREE.BoxGeometry(4.80, 0.02, 9.80), matWater, [0, 0.95, 0.20]);

    // --- 1. Bizans Dromon Pruva Gövdesi, Xylokastron & Bronz Mahmuz (partDromonProw) ---
    // Dış ahşap kaplama (isOuterShell: true -> X-Ray modunda saydamlaşır!)
    addMesh(partDromonProw, createDromonHullGeometry(THREE, false), matHullOuter, [0, 0, 0]);

    // Omurga kirişi (keel) ve pruva bodoslaması (stempost)
    addMesh(partDromonProw, new THREE.BoxGeometry(0.18, 0.18, 6.60), matDeckOak, [0, 0.30, -0.55], [0.06, 0, 0]);
    addMesh(partDromonProw, new THREE.BoxGeometry(0.16, 1.85, 0.22), matDeckOak, [0, 1.55, 3.22], [-0.26, 0, 0]);
    // Koçboynuzu / kıvrımlı akrostolion pruva süsü
    addMesh(partDromonProw, new THREE.TorusGeometry(0.32, 0.065, 10, 20, Math.PI * 1.25), matHullTrim, [0, 2.55, 3.32], [0, Math.PI / 2, 0.4]);

    // 9 adet iç meşe kaburga postası (X-Ray'de net görünür)
    for (let i = 0; i < 9; i++) {
      const zRib = -3.40 + i * 0.76;
      const t = (zRib - (-3.80)) / 7.05;
      const wRib = Math.max(0.25, 1.48 * Math.pow(Math.max(0, 1 - Math.pow(t, 1.55)), 0.68));
      const yRib = 0.36 + Math.pow(t, 2.2) * 0.48;
      addMesh(partDromonProw, new THREE.BoxGeometry(wRib * 1.85, 0.09, 0.09), matDeckOak, [0, yRib + 0.05, zRib]);
      addMesh(partDromonProw, new THREE.BoxGeometry(0.08, 1.35, 0.09), matDeckOak, [-wRib * 0.92, yRib + 0.72, zRib], [0, 0, -0.22]);
      addMesh(partDromonProw, new THREE.BoxGeometry(0.08, 1.35, 0.09), matDeckOak, [wRib * 0.92, yRib + 0.72, zRib], [0, 0, 0.22]);
    }

    // Alt güverte (katoikos) tabanı: y = 0,86 m (kazan ve sifon pompasının durduğu güverte)
    addMesh(partDromonProw, new THREE.BoxGeometry(2.55, 0.07, 5.20), matDeckOak, [0, 0.86, -1.10]);

    // Üst pruva savaş platformu (Xylokastron / Pseudopation): y = 1,92 m, z = +0,65 .. +3,10 m
    addMesh(partDromonProw, new THREE.BoxGeometry(2.15, 0.08, 2.45), matDeckOak, [0, 1.92, 1.85]);
    // Xylokastron mazgallı ahşap korkuluk siperleri
    addMesh(partDromonProw, new THREE.BoxGeometry(0.08, 0.62, 2.35), matHullTrim, [-1.04, 2.26, 1.82], [0, 0.14, 0]);
    addMesh(partDromonProw, new THREE.BoxGeometry(0.08, 0.62, 2.35), matHullTrim, [1.04, 2.26, 1.82], [0, -0.14, 0]);
    // Pruva ön siperi (ortasında sifon namlusu mazgalı ile)
    addMesh(partDromonProw, new THREE.BoxGeometry(0.68, 0.62, 0.09), matHullTrim, [-0.62, 2.26, 2.95]);
    addMesh(partDromonProw, new THREE.BoxGeometry(0.68, 0.62, 0.09), matHullTrim, [0.62, 2.26, 2.95]);

    // Dromon Su Üstü Bronz Mahmuzu (Peronion / Spur): z = +3,20 .. +4,65 m, y = 1,08 m
    // (10. yüzyıl Bizans Dromonlarında su altı koçbaşı yerine düşman küreklerini kıran su üstü bronz mahmuz kullanılırdı)
    addMesh(partDromonProw, new THREE.ConeGeometry(0.16, 1.55, 12), matBronze, [0, 1.12, 3.95], [Math.PI / 2 - 0.06, 0, 0]);
    addMesh(partDromonProw, new THREE.CylinderGeometry(0.17, 0.20, 0.28, 12), matBronze, [0, 1.08, 3.22], [Math.PI / 2, 0, 0]);

    // --- 3. Ziftli Neft Amforaları & Bakır İkmal Varilleri (partNaphthaAmphorae) ---
    // Alt güverte kıç tarafında (z = -2,45 .. -3,35 m) amfora rafı ve 6 adet Bizans amforası
    addMesh(partNaphthaAmphorae, new THREE.BoxGeometry(2.10, 0.06, 0.95), matDeckOak, [0, 1.18, -2.90]);
    [-0.78, -0.46, -0.14, 0.18, 0.50, 0.82].forEach((xAmp, i) => {
      const zAmp = -2.75 - (i % 2) * 0.28;
      // Amfora gövdesi, boynu ve çift kulpu
      addMesh(partNaphthaAmphorae, new THREE.CylinderGeometry(0.13, 0.06, 0.42, 14), matAmphora, [xAmp, 1.12, zAmp]);
      addMesh(partNaphthaAmphorae, new THREE.SphereGeometry(0.135, 14, 10), matAmphora, [xAmp, 1.28, zAmp]);
      addMesh(partNaphthaAmphorae, new THREE.CylinderGeometry(0.055, 0.07, 0.16, 12), matAmphora, [xAmp, 1.44, zAmp]);
      // Ziftli mühür tıpası
      addMesh(partNaphthaAmphorae, new THREE.CylinderGeometry(0.058, 0.052, 0.04, 10), matDarkIron, [xAmp, 1.53, zAmp]);
    });
    // 2 adet çemberli bakır neft/reçine dinlendirme varili ve aktarma borusu
    [-0.68, 0.68].forEach(xBrl => {
      addMesh(partNaphthaAmphorae, new THREE.CylinderGeometry(0.22, 0.22, 0.56, 16), matCopper, [xBrl, 1.18, -2.05]);
      addMesh(partNaphthaAmphorae, new THREE.TorusGeometry(0.225, 0.014, 8, 18), matDarkIron, [xBrl, 1.04, -2.05], [Math.PI / 2, 0, 0]);
      addMesh(partNaphthaAmphorae, new THREE.TorusGeometry(0.225, 0.014, 8, 18), matDarkIron, [xBrl, 1.32, -2.05], [Math.PI / 2, 0, 0]);
    });

    // --- 4. Çift Körüklü Odun/Kömür Ocağı & Kor Ateş Yatağı (partBellowsHearth) ---
    const Z_CAULDRON = -1.15;
    // Demir kuşaklı tuğla/taş ocak kaidesi (y = 0,90 .. 1,28 m)
    addMesh(partBellowsHearth, new THREE.CylinderGeometry(0.48, 0.52, 0.36, 18), matDarkIron, [0, 1.08, Z_CAULDRON]);
    addMesh(partBellowsHearth, new THREE.BoxGeometry(0.32, 0.22, 0.14), matDarkIron, [0, 1.04, Z_CAULDRON - 0.48]);
    // Parlayan kor kömür/odun yatağı (emissive)
    const hearthEmbers = addMesh(partBellowsHearth, new THREE.CylinderGeometry(0.38, 0.40, 0.12, 16), matEmberGlow, [0, 1.16, Z_CAULDRON]);

    // Sol ve sağ çift deri körük (bellows) — pompa temposuyla açılıp kapanır
    const bellowsPivots = [];
    [-0.68, 0.68].forEach((xBel, idx) => {
      const sign = idx === 0 ? -1 : 1;
      addMesh(partBellowsHearth, new THREE.BoxGeometry(0.34, 0.04, 0.24), matDeckOak, [xBel, 0.96, Z_CAULDRON], [0, sign * 0.25, 0]);
      addMesh(partBellowsHearth, new THREE.CylinderGeometry(0.022, 0.032, 0.26, 10), matBronze, [xBel - sign * 0.20, 1.00, Z_CAULDRON], [0, 0, sign * Math.PI / 2]);
      const belTop = new THREE.Group();
      belTop.position.set(xBel - sign * 0.14, 1.02, Z_CAULDRON);
      partBellowsHearth.add(belTop);
      addMesh(belTop, new THREE.BoxGeometry(0.34, 0.10, 0.22), matHideShield, [sign * 0.14, 0.04, 0]);
      addMesh(belTop, new THREE.BoxGeometry(0.36, 0.035, 0.24), matDeckOak, [sign * 0.14, 0.10, 0]);
      bellowsPivots.push({ grp: belTop, sign });
    });

    // --- 5. Perçinli Kubbeli Bakır Ön-Isıtma Kazanı (Chalkion) (partCopperCauldron) ---
    // Kazan gövdesi ve kubbesi (y = 1,24 .. 1,86 m, z = -1,15 m)
    addMesh(partCopperCauldron, new THREE.CylinderGeometry(0.46, 0.42, 0.48, 22), matCopper, [0, 1.48, Z_CAULDRON]);
    addMesh(partCopperCauldron, new THREE.SphereGeometry(0.46, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), matCopper, [0, 1.70, Z_CAULDRON]);
    // Perçinli flanş bileziği ve üst doldurma kapağı
    addMesh(partCopperCauldron, new THREE.TorusGeometry(0.465, 0.025, 10, 24), matBronze, [0, 1.70, Z_CAULDRON], [Math.PI / 2, 0, 0]);
    addMesh(partCopperCauldron, new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16), matBronze, [0, 2.15, Z_CAULDRON]);
    // Kazandan ikiz pompa silindirlerine giden ikiz bakır emiş borusu (z = -1,15 .. +0,25 m)
    [-0.24, 0.24].forEach(xPipe => {
      addMesh(partCopperCauldron, new THREE.CylinderGeometry(0.035, 0.035, 1.36, 12), matCopper, [xPipe, 1.06, -0.45], [Math.PI / 2, 0, 0]);
    });

    // --- 7. Ktesibios Tipi İkiz Bronz Pompa Silindirleri & Pistonlar (partTwinCylinders) ---
    const Z_PUMP = 0.25;
    const X_CYL = 0.36; // Sol silindir x = -0.36 m, Sağ silindir x = +0.36 m
    const Y_CYL_BASE = 0.90;
    // Ahşap/demir pompa şasisi
    addMesh(partTwinCylinders, new THREE.BoxGeometry(1.18, 0.10, 0.56), matDeckOak, [0, Y_CYL_BASE + 0.05, Z_PUMP]);
    // Merkez manivela dikme çatalı (pivot y = 1,72 m)
    const Y_BEAM_PIVOT = 1.72;
    [-0.10, 0.10].forEach(xPost => {
      addMesh(partTwinCylinders, new THREE.BoxGeometry(0.06, 0.82, 0.10), matDarkIron, [xPost, Y_CYL_BASE + 0.45, Z_PUMP]);
    });

    // Sol ve sağ bronz pompa silindir gövdeleri (Ø0,22 m dış, yükseklik 0,48 m)
    const pistonGroups = [];
    const intakeFlaps = [];
    [-X_CYL, X_CYL].forEach((xC, idx) => {
      addMesh(partTwinCylinders, new THREE.CylinderGeometry(0.115, 0.115, 0.48, 18), matBronze, [xC, Y_CYL_BASE + 0.32, Z_PUMP]);
      addMesh(partTwinCylinders, new THREE.TorusGeometry(0.12, 0.016, 8, 18), matCopper, [xC, Y_CYL_BASE + 0.55, Z_PUMP], [Math.PI / 2, 0, 0]);
      addMesh(partTwinCylinders, new THREE.TorusGeometry(0.12, 0.016, 8, 18), matCopper, [xC, Y_CYL_BASE + 0.10, Z_PUMP], [Math.PI / 2, 0, 0]);

      // Hareketli bronz piston + biyel mili (y_0 = 1,36 m etrafında ±0,10 m strok)
      const pGrp = new THREE.Group();
      pGrp.position.set(xC, 1.36, Z_PUMP);
      partTwinCylinders.add(pGrp);
      addMesh(pGrp, new THREE.CylinderGeometry(0.098, 0.098, 0.10, 16), matCopper, [0, -0.14, 0]);
      addMesh(pGrp, new THREE.CylinderGeometry(0.024, 0.024, 0.42, 12), matDarkIron, [0, 0.12, 0]);
      addMesh(pGrp, new THREE.CylinderGeometry(0.036, 0.036, 0.06, 12), matBronze, [0, 0.34, 0], [Math.PI / 2, 0, 0]);
      pistonGroups.push(pGrp);

      // Tek yönlü emiş klapesi göstergesi
      const flap = addMesh(partTwinCylinders, new THREE.BoxGeometry(0.08, 0.02, 0.08), matCopper, [xC, Y_CYL_BASE + 0.14, Z_PUMP - 0.13]);
      intakeFlaps.push(flap);
    });

    // --- 6. Çift Kollu Pompa Manivelası (Rocking Lever Beam) (partPumpBeam) ---
    const pumpBeamPivot = new THREE.Group();
    pumpBeamPivot.position.set(0, Y_BEAM_PIVOT, Z_PUMP);
    partPumpBeam.add(pumpBeamPivot);
    // Merkez mafsal mili
    addMesh(pumpBeamPivot, new THREE.CylinderGeometry(0.034, 0.034, 0.30, 14), matBronze, [0, 0, 0], [Math.PI / 2, 0, 0]);
    // Ana terazi kolu (uzunluk 1,56 m, x = -0,78 .. +0,78 m)
    addMesh(pumpBeamPivot, new THREE.BoxGeometry(1.56, 0.085, 0.085), matDeckOak, [0, 0, 0]);
    addMesh(pumpBeamPivot, new THREE.BoxGeometry(0.84, 0.095, 0.095), matDarkIron, [0, 0, 0]);
    // Sol ve sağ biyel mafsal pimleri (x = ±0,36 m) ve uçtaki çift el tutamakları (x = ±0,76 m)
    [-X_CYL, X_CYL].forEach(xPin => {
      addMesh(pumpBeamPivot, new THREE.CylinderGeometry(0.025, 0.025, 0.14, 12), matBronze, [xPin, 0, 0], [Math.PI / 2, 0, 0]);
    });
    [-0.76, 0.76].forEach(xHnd => {
      addMesh(pumpBeamPivot, new THREE.CylinderGeometry(0.024, 0.024, 0.44, 12), matDeckOak, [xHnd, 0, 0], [Math.PI / 2, 0, 0]);
      addMesh(pumpBeamPivot, new THREE.SphereGeometry(0.032, 10, 10), matBronze, [xHnd, 0, -0.22]);
      addMesh(pumpBeamPivot, new THREE.SphereGeometry(0.032, 10, 10), matBronze, [xHnd, 0, 0.22]);
    });

    // --- 8. Merkez Basınç Dengeleme Hava Kubbesi (Windkessel / Pneuma Dome) (partWindkesselDome) ---
    // İkiz silindirleri merkez kubbeye bağlayan alt manifold borusu
    addMesh(partWindkesselDome, new THREE.CylinderGeometry(0.042, 0.042, 0.72, 14), matBronze, [0, Y_CYL_BASE + 0.18, Z_PUMP], [0, 0, Math.PI / 2]);
    // Windkessel basınçlı hava/neft akümülatör kubbesi (x = 0, z = +0,25 m, y = 1,00 .. 1,56 m)
    addMesh(partWindkesselDome, new THREE.CylinderGeometry(0.15, 0.16, 0.36, 20), matCopper, [0, Y_CYL_BASE + 0.34, Z_PUMP]);
    addMesh(partWindkesselDome, new THREE.SphereGeometry(0.15, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), matBronze, [0, Y_CYL_BASE + 0.52, Z_PUMP]);
    addMesh(partWindkesselDome, new THREE.TorusGeometry(0.155, 0.018, 8, 20), matBronze, [0, Y_CYL_BASE + 0.52, Z_PUMP], [Math.PI / 2, 0, 0]);

    // --- 9. Zırhlı Bakır Dikme Borusu (Riser Pipe) & Ana Kesme Valfi (partRiserConduit) ---
    // Windkessel'den (z=+0,25) ileri pruva dikmesine (z=+2,15) uzanan alt boru ve dikey yükseltici
    addMesh(partRiserConduit, new THREE.CylinderGeometry(0.044, 0.044, 1.92, 14), matCopper, [0, 1.18, 1.20], [Math.PI / 2, 0, 0]);
    addMesh(partRiserConduit, new THREE.SphereGeometry(0.062, 12, 12), matBronze, [0, 1.18, 2.15]);
    // Dikey bakır yükseltici boru (y = 1,18 .. 2,04 m, z = +2,15 m)
    addMesh(partRiserConduit, new THREE.CylinderGeometry(0.048, 0.048, 0.88, 16), matCopper, [0, 1.62, 2.15]);
    // Ana kesme vanası (Stopcock) gövdesi ve kolu (y = 1,72 m, z = +2,15 m)
    addMesh(partRiserConduit, new THREE.CylinderGeometry(0.072, 0.072, 0.14, 14), matBronze, [0, 1.72, 2.15], [0, 0, Math.PI / 2]);
    const stopcockHandle = new THREE.Group();
    stopcockHandle.position.set(0.08, 1.72, 2.15);
    partRiserConduit.add(stopcockHandle);
    addMesh(stopcockHandle, new THREE.BoxGeometry(0.03, 0.24, 0.04), matBronze, [0.02, 0.08, 0]);

    // --- 10. Döner Bronz Mafsal Kundağı (Strepton) & Nişan Çemberi (partSwivelCradle) ---
    const Z_SWIVEL = 2.15;
    const Y_SWIVEL = 2.02;
    // Pruva güvertesi bronz nişan kaidesi ve dereceli döner tabla
    addMesh(partSwivelCradle, new THREE.CylinderGeometry(0.26, 0.30, 0.12, 20), matBronze, [0, Y_SWIVEL, Z_SWIVEL]);
    addMesh(partSwivelCradle, new THREE.TorusGeometry(0.28, 0.018, 8, 24), matCopper, [0, Y_SWIVEL + 0.05, Z_SWIVEL], [Math.PI / 2, 0, 0]);

    // Yanal dönüş (Yaw) çatalı — partSwivelCradle içinde döner, ayrıca sifon namlusunu da taşır
    const yawCradleGrp = new THREE.Group();
    yawCradleGrp.position.set(0, Y_SWIVEL + 0.08, Z_SWIVEL);
    partSwivelCradle.add(yawCradleGrp);
    addMesh(yawCradleGrp, new THREE.CylinderGeometry(0.14, 0.18, 0.14, 16), matBronze, [0, 0.05, 0]);
    // Sol ve sağ muylu (trunnion) kolları (y = +0,22 m)
    [-0.14, 0.14].forEach(xTr => {
      addMesh(yawCradleGrp, new THREE.BoxGeometry(0.045, 0.24, 0.12), matBronze, [xTr, 0.16, 0]);
      addMesh(yawCradleGrp, new THREE.CylinderGeometry(0.045, 0.045, 0.06, 12), matCopper, [xTr, 0.24, 0], [0, 0, Math.PI / 2]);
    });

    // --- 11. Aslan Başlı (Leontokephalos) Dövme Bronz Sifon Namlusu (partBronzeSiphon) ---
    const Y_PIVOT = Y_SWIVEL + 0.32; // y = 2,34 m
    const siphonAimGrp = new THREE.Group();
    siphonAimGrp.position.set(0, Y_PIVOT, Z_SWIVEL);
    partBronzeSiphon.add(siphonAimGrp);

    // Arka basınç odası, muylu bileziği ve sifoncu nişan tutamağı (z_yerel = -0,35 .. 0 m)
    addMesh(siphonAimGrp, new THREE.CylinderGeometry(0.095, 0.085, 0.38, 18), matCopper, [0, 0, -0.16], [Math.PI / 2, 0, 0]);
    addMesh(siphonAimGrp, new THREE.SphereGeometry(0.095, 16, 12), matBronze, [0, 0, -0.35]);
    addMesh(siphonAimGrp, new THREE.CylinderGeometry(0.022, 0.022, 0.42, 10), matDeckOak, [0, -0.06, -0.46], [0.55, 0, 0]);

    // Ana konik dövme bronz sifon borusu (z_yerel = 0 .. +1,52 m)
    addMesh(siphonAimGrp, new THREE.CylinderGeometry(0.058, 0.092, 1.52, 20), matBronze, [0, 0, 0.76], [Math.PI / 2, 0, 0]);
    // Takviye bilezikleri
    [0.15, 0.55, 0.95, 1.32].forEach(zRing => {
      const rRing = 0.092 - (zRing / 1.52) * 0.032;
      addMesh(siphonAimGrp, new THREE.TorusGeometry(rRing + 0.008, 0.012, 8, 18), matCopper, [0, 0, zRing]);
    });

    // Aslan Başlı (Leontokephalos) dövme bronz namlu ağzı (z_yerel = +1,48 .. +1,76 m)
    // Yele çelenk halkası, üst/alt kükreyen çene ve daraltıcı fışkırtma nozulu
    addMesh(siphonAimGrp, new THREE.TorusGeometry(0.115, 0.028, 10, 18), matBronze, [0, 0, 1.48]);
    addMesh(siphonAimGrp, new THREE.CylinderGeometry(0.095, 0.125, 0.22, 14), matBronze, [0, 0.02, 1.56], [Math.PI / 2, 0, 0]);
    // Üst çene ve kabartma gözler
    addMesh(siphonAimGrp, new THREE.BoxGeometry(0.15, 0.065, 0.18), matBronze, [0, 0.055, 1.66], [0.12, 0, 0]);
    addMesh(siphonAimGrp, new THREE.SphereGeometry(0.022, 10, 10), matEmberGlow, [-0.055, 0.075, 1.58]);
    addMesh(siphonAimGrp, new THREE.SphereGeometry(0.022, 10, 10), matEmberGlow, [0.055, 0.075, 1.58]);
    // Alt çene
    addMesh(siphonAimGrp, new THREE.BoxGeometry(0.13, 0.048, 0.16), matBronze, [0, -0.052, 1.65], [-0.22, 0, 0]);
    // İç yüksek basınç nozulu (z_yerel = +1,72 m)
    addMesh(siphonAimGrp, new THREE.CylinderGeometry(0.024, 0.045, 0.14, 14), matCopper, [0, 0, 1.68], [Math.PI / 2, 0, 0]);

    // --- 12. Sifon Ağzı Sürekli Yanan Pilot Ateşleme Mızrağı (partPilotLance) ---
    const pilotAimGrp = new THREE.Group();
    pilotAimGrp.position.set(0, Y_PIVOT, Z_SWIVEL);
    partPilotLance.add(pilotAimGrp);
    // Namlunun altından ileri uzanan demir mızrak kolu ve uçtaki reçine çanağı (z_yerel = +1,92 m)
    addMesh(pilotAimGrp, new THREE.CylinderGeometry(0.014, 0.016, 0.78, 10), matDarkIron, [0, -0.11, 1.52], [Math.PI / 2, 0, 0]);
    addMesh(pilotAimGrp, new THREE.CylinderGeometry(0.048, 0.026, 0.06, 12), matDarkIron, [0, -0.06, 1.90]);
    // Pilot meşale alevi (pilotLit === true iken görünür ve titreşir)
    const pilotTorchFlame = new THREE.Group();
    pilotTorchFlame.position.set(0, -0.01, 1.90);
    pilotAimGrp.add(pilotTorchFlame);
    addMesh(pilotTorchFlame, new THREE.ConeGeometry(0.042, 0.15, 12), matFlameCore, [0, 0.06, 0]);
    addMesh(pilotTorchFlame, new THREE.ConeGeometry(0.062, 0.21, 12), matFlameOuter, [0, 0.08, 0]);

    // --- 13. Portatif El Sifonları (Cheirosiphones) & Toprak El Bombaları (partHandCheirosiphones) ---
    // Xylokastron sancak iç korkuluğunda (x = +0,82 m, z = +1,35 m) silah rafı
    addMesh(partHandCheirosiphones, new THREE.BoxGeometry(0.28, 0.36, 0.72), matDeckOak, [0.82, 2.12, 1.35]);
    // 3 adet VI. Leon tipi portatif bronz el sifonu (cheirosiphones)
    [-0.22, 0, 0.22].forEach(dz => {
      addMesh(partHandCheirosiphones, new THREE.CylinderGeometry(0.032, 0.038, 0.62, 12), matBronze, [0.82, 2.34, 1.35 + dz], [Math.PI / 2 - 0.25, 0, 0]);
      addMesh(partHandCheirosiphones, new THREE.CylinderGeometry(0.014, 0.014, 0.24, 10), matDeckOak, [0.82, 2.26, 1.02 + dz], [Math.PI / 2 - 0.25, 0, 0]);
    });
    // 4 adet fitilli seramik Rum Ateşi el bombası (grenades)
    [-0.18, -0.06, 0.06, 0.18].forEach(dz => {
      addMesh(partHandCheirosiphones, new THREE.SphereGeometry(0.052, 12, 10), matAmphora, [-0.82, 2.02, 1.35 + dz]);
      addMesh(partHandCheirosiphones, new THREE.CylinderGeometry(0.016, 0.022, 0.04, 8), matBronze, [-0.82, 2.08, 1.35 + dz]);
    });

    // --- 14. Sirke ve Şapla Islatılmış Deri Siperlikler & Bizans Kalkanları (partHideShields) ---
    // Pruva ön ve yan sirke-şaplı deri perdeleri
    [-1.09, 1.09].forEach((xSh, idx) => {
      const sign = idx === 0 ? -1 : 1;
      for (let k = 0; k < 4; k++) {
        const zSh = 1.05 + k * 0.50;
        addMesh(partHideShields, new THREE.BoxGeometry(0.035, 0.54, 0.42), matHideShield, [xSh, 2.24, zSh], [0, sign * 0.14, 0]);
        // Borda dışındaki yuvarlak Bizans dromon kalkanları (umbo göbekli)
        addMesh(partHideShields, new THREE.CylinderGeometry(0.22, 0.22, 0.03, 16), matHullTrim, [xSh + sign * 0.03, 2.26, zSh], [0, sign * 0.14, Math.PI / 2]);
        addMesh(partHideShields, new THREE.SphereGeometry(0.055, 10, 10), matBronze, [xSh + sign * 0.05, 2.26, zSh]);
      }
    });

    // --- 15. Basınçlı Sıvı Rum Ateşi Alev Jeti & Su Üstü Ateş Göleti (partFlameJet) ---
    const flameJetStreamGrp = new THREE.Group();
    flameJetStreamGrp.position.set(0, Y_PIVOT, Z_SWIVEL);
    partFlameJet.add(flameJetStreamGrp);

    // 10 kademeli parabolik basınçlı sıvı alev sütunu (nozul z_yerel = +1,75 m'den +7,20 m'ye uzanır)
    const jetSegments = [];
    for (let s = 0; s < 10; s++) {
      const f = (s + 0.5) / 10;
      const zLocal = 1.85 + f * 5.20;
      const dropY = -0.38 * f * f; // Parabolik yerçekimi eğrisi
      const rCore = 0.032 + f * 0.16;
      const rOuter = 0.055 + f * 0.28;
      const segGrp = new THREE.Group();
      segGrp.position.set(0, dropY, zLocal);
      flameJetStreamGrp.add(segGrp);
      addMesh(segGrp, new THREE.CylinderGeometry(rCore * 1.15, rCore * 0.85, 0.56, 12), matFlameCore, [0, 0, 0], [Math.PI / 2 + 0.12 * f, 0, 0]);
      addMesh(segGrp, new THREE.CylinderGeometry(rOuter * 1.20, rOuter * 0.85, 0.60, 12), matFlameOuter, [0, 0, 0], [Math.PI / 2 + 0.12 * f, 0, 0]);
      jetSegments.push({ grp: segGrp, baseZ: zLocal, baseY: dropY, f });
    }

    // Deniz yüzeyinde su üstünde yüzen ve sönmeyen Rum Ateşi yangın göleti (y = 0,97 m)
    const seaFirePoolGrp = new THREE.Group();
    seaFirePoolGrp.position.set(0, 0.97, 7.20);
    partFlameJet.add(seaFirePoolGrp);
    addMesh(seaFirePoolGrp, new THREE.CylinderGeometry(0.95, 1.10, 0.04, 20), matFlameOuter, [0, 0, 0]);
    addMesh(seaFirePoolGrp, new THREE.CylinderGeometry(0.58, 0.65, 0.06, 18), matFlameCore, [0, 0.02, 0]);
    for (let c = 0; c < 5; c++) {
      const ang = (c / 5) * Math.PI * 2;
      addMesh(seaFirePoolGrp, new THREE.ConeGeometry(0.16, 0.48, 10), matFlameCore, [Math.cos(ang) * 0.42, 0.24, Math.sin(ang) * 0.42]);
    }

    // ========================================================================
    // CANLI MEKANİK DURUM (STATE) VE ETKİLEŞİM MANTIĞI
    // ========================================================================
    const S = {
      spm: 42,                  // Çift pistonlu pompa temposu (0..70 Vuruş/dk - SPM)
      yawDeg: 0,                // Strepton sifon yanal nişan açısı (-35°..+35°)
      elevDeg: 6,               // Sifon namlu yükseliş açısı (-10°..+25°)
      pilotLit: true,           // Pilot ateşleme meşalesi yanıyor mu? (terrain butonu ile açılır/söndürülür)
      autoPump: true,           // Pompa ekibi otomatik çalışıyor mu? (sweep butonu)
      mode: 'battle',           // 'battle' (Basınçlı Kuşatma Atışı) | 'preheat' (Alt Güverte Kazan Ön-Isıtma & İkmal)
      fuelPct: 100,             // Bakır kazandaki sıcak neft doluluk yüzdesi (%0..%100)
      firing: false,            // Rum Ateşi püskürtülüyor mu?
      fireTimer: 0,             // Aktif püskürtme süresi
      pumpPhase: 0              // Ktesibios pompa kolu faz açısı (rad)
    };

    function syncVisualState(dt) {
      const stepDt = Math.max(0, Math.min(dt || 0, 0.1));

      // 1. Çift pistonlu Ktesibios kuvvet pompası ve çift körük kinematiği (v = ω × r)
      // KURAL: Gizli alt sınır YOKTUR; S.spm === 0 iken veya autoPump kapalıyken dPhase = 0!
      const effectiveSpm = S.autoPump ? S.spm : 0;
      const omegaPump = (effectiveSpm * Math.PI * 2) / 60;
      const dPhase = omegaPump * stepDt;
      S.pumpPhase += dPhase;

      // Pompa manivela kolu açısı: theta_B(t) = 0.28 * sin(pumpPhase)
      const beamAngle = 0.28 * Math.sin(S.pumpPhase);
      pumpBeamPivot.rotation.z = beamAngle;

      // Sol (x = -0,36 m) ve Sağ (x = +0,36 m) pistonların 180° zıt fazlı stroku: dy = ±R_B * sin(beamAngle)
      const dyPiston = X_CYL * Math.sin(beamAngle);
      pistonGroups[0].position.y = 1.36 - dyPiston;
      pistonGroups[1].position.y = 1.36 + dyPiston;

      // Emiş klapeleri ve ocak körükleri
      intakeFlaps[0].rotation.x = dyPiston < 0 ? 0.35 : 0;
      intakeFlaps[1].rotation.x = dyPiston > 0 ? 0.35 : 0;
      bellowsPivots.forEach((b, i) => {
        const bWave = i === 0 ? Math.sin(S.pumpPhase) : -Math.sin(S.pumpPhase);
        b.grp.rotation.z = b.sign * (0.14 + 0.12 * bWave);
      });
      hearthEmbers.material.emissiveIntensity = 0.65 + (effectiveSpm / 70) * 0.55;

      // 2. Strepton döner sifon kundağı, aslan başlı namlu ve pilot ateşleme mızrağı
      const yawRad = THREE.MathUtils.degToRad(S.yawDeg);
      const elevRad = THREE.MathUtils.degToRad(S.elevDeg);
      yawCradleGrp.rotation.y = yawRad;

      siphonAimGrp.rotation.set(-elevRad, yawRad, 0, 'YXZ');
      pilotAimGrp.rotation.set(-elevRad, yawRad, 0, 'YXZ');

      // 3. Pilot meşale görünürlüğü ve canlı titreşimi
      pilotTorchFlame.visible = S.pilotLit;
      if (S.pilotLit) {
        const flicker = 0.92 + 0.14 * Math.sin(S.pumpPhase * 3.7);
        pilotTorchFlame.scale.set(flicker, flicker, flicker);
      }

      // 4. Ana kesme vanası (stopcock) ve Rum Ateşi alev jeti
      if (S.firing) {
        S.fireTimer -= stepDt;
        if (S.fireTimer <= 0 || !S.pilotLit || S.fuelPct <= 0) {
          S.firing = false;
          S.fireTimer = 0;
        }
      }

      stopcockHandle.rotation.z = S.firing ? 0.0 : -1.25;
      const jetActive = S.firing && S.pilotLit;
      flameJetStreamGrp.visible = jetActive;
      seaFirePoolGrp.visible = jetActive;

      if (jetActive) {
        // Pompa hızına göre menzil çarpanı (en az %65, yüksek tempoda %115)
        const reachScale = 0.72 + (S.spm / 70) * 0.42;
        flameJetStreamGrp.rotation.set(-elevRad, yawRad, 0, 'YXZ');
        jetSegments.forEach((seg, idx) => {
          const pulse = 1.0 + 0.15 * Math.sin(S.pumpPhase * 4.5 - idx * 0.7);
          seg.grp.position.z = 1.75 + (seg.baseZ - 1.75) * reachScale;
          seg.grp.position.y = seg.baseY * reachScale;
          seg.grp.scale.set(pulse, pulse, reachScale);
        });
        const poolDist = 2.15 + 6.40 * reachScale;
        seaFirePoolGrp.position.x = Math.sin(yawRad) * poolDist;
        seaFirePoolGrp.position.z = Math.cos(yawRad) * poolDist;
      }
    }

    syncVisualState(0);

    // ========================================================================
    // KAMERA AÇILARI VE 6 ADIMLI REHBERLİ TUR
    // ========================================================================
    const camPresets = {
      iso: { pos: [5.8, 3.6, 5.4], look: [0, 1.55, 0.8] },
      front: { pos: [2.2, 2.4, 6.2], look: [0, 1.95, 2.6] },
      breech: { pos: [2.1, 2.5, 3.8], look: [0, 2.25, 2.8] },
      engine: { pos: [3.2, 2.1, -0.9], look: [0, 1.35, -0.6] },
      suspension: { pos: [2.8, 2.0, 0.9], look: [0, 1.35, 0.25] },
      top: { pos: [0.1, 9.2, 0.8], look: [0, 1.5, 0.8] }
    };

    const tourSteps = [
      {
        title: 'Genel Bakış: 672 Bizans "Rum Ateşi" (Pyr Thalassion) & Dromon Pruvası',
        desc: 'MS 672\'de Suriyeli Kallinikos tarafından geliştirilen ve 674–678 ile 717–718 Arap kuşatmalarında Konstantinopolis\'i kurtaran ünlü deniz silahı. Dromon kadırgasının pruva kalesi (xylokastron) ve alt güvertedeki gizli sifon dairesi birlikte görülüyor.',
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'iso',
        part: partDromonProw
      },
      {
        title: 'X-Ray: Körüklü Ocak & Kubbeli Bakır Ön-Isıtma Kazanı (Chalkion)',
        desc: 'Borda kaplaması saydamlaştığında alt güvertedeki ziftli neft amforaları, çift körüklü ocak ve kubbeli bakır kazan (chalkion) ortaya çıkar. Ham neft yağı (nafta) ve çam reçinesi burada ısıtılarak akışkan ve uçucu hale getirilir.',
        explode: 0,
        cutaway: true,
        sub: 'all',
        cam: 'engine',
        part: partCopperCauldron
      },
      {
        title: 'Ktesibios Çift Pistonlu Bronz Kuvvet Pompası & Windkessel Kubbesi',
        desc: 'Sifoncuların (siphonarioi) karşılıklı bastığı terazi manivelası, ikiz bronz silindirlerdeki pistonları 180° zıt fazda çalıştırır. Ortadaki Windkessel hava kubbesi basıncı (~8-10 bar) dengeleyerek sıvının kesintisiz fışkırmasını sağlar.',
        explode: 0,
        cutaway: true,
        sub: 'all',
        cam: 'suspension',
        part: partTwinCylinders
      },
      {
        title: 'Strepton Döner Bronz Mafsal & Aslan Başlı Sifon Namlusu (Sipho)',
        desc: 'VI. Leon\'un Taktika eserinde tarif ettiği üzere, üst pruva kalesindeki döner kundak (strepton) üzerinde yükselen ve ucu yırtıcı aslan başı (leontokephalos) biçiminde dövülmüş bronz sifon namlusu.',
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'breech',
        part: partBronzeSiphon
      },
      {
        title: 'Pilot Ateşleme Mızrağı & Su Üstünde Sönmeyen Sıvı Alev Jeti',
        desc: 'Namlunun altındaki pilot meşale çanağı sürekli yanar; ana vana açıldığında fışkıran basınçlı sıcak neft pilot alevin içinden geçerek 15-20 metre menzilli bir ateş sütununa dönüşür ve deniz yüzeyinde yüzerek yanmaya devam eder.',
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'front',
        part: partPilotLance
      },
      {
        title: 'VI. Leon\'un El Sifonları (Cheirosiphones) & Sirke-Şaplı Deri Siperler',
        desc: 'Korkulukta dizili portatif el sifonları (cheirosiphones), seramik el bombaları ve kendi pruvasını yangından koruyan sirke/şap emdirilmiş kalın deri perdeler.',
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'iso',
        part: partHandCheirosiphones
      }
    ];

    // ========================================================================
    // ADAPTÖR ARAYÜZÜ (UI) TANIMI
    // ========================================================================
    let activeScheme = 'constantinople674';
    let reliefEnabled = true;

    const ui = {
      title: '672 BİZANS "RUM ATEŞİ" (GREEK FIRE) & ÇİFT PİSTONLU SİFON POMPASI',
      sub: 'Kallinikos\'un Devlet Sırrı Deniz Silahı (Pyr Thalassion) • Bakır Kazan, Ktesibios Çift Pistonlu Pompa & Aslan Başlı Bronz Sifon',
      badge: 'RUM ATEŞİ — MS 672',
      partCount: '15 Ana Grup',
      portraitCameraScale: 1.30,
      shadowExtent: 9,
      sliders: [
        { label: 'Ktesibios Çift Piston Pompa Temposu', min: 0, max: 70, step: 1, fmt: v => `${Math.round(v)} Vuruş/dk` },
        { label: 'Strepton Sifon Yanal Nişan Açısı', min: -35, max: 35, step: 1, fmt: v => `${v > 0 ? '+' : ''}${Math.round(v)}°` },
        { label: 'Aslan Başlı Sifon Yükseliş Açısı', min: -10, max: 25, step: 1, fmt: v => `${v > 0 ? '+' : ''}${Math.round(v)}°` }
      ],
      buttons: {
        terrain: '🔥 Pilot Ateşleme Meşalesi: YANIYOR (Atışa Hazır)',
        sweep: '💪 Sifoncu Pompa Ekibi: ÇALIŞIYOR',
        mode: true
      },
      telemetryTag: 'KONSTANTİNOPOLİS — MS 672',
      statLabels: ['SİFON BASINCI / MENZİL', 'OCAK & PİLOT MEŞALE', 'SICAK NEFT KAZANI', 'POMPA TEMPOSU'],
      camLabels: {
        iso: 'İzometrik Dromon',
        front: 'Pruva & Aslan Başı',
        breech: 'Bronz Sifon & Meşale',
        engine: 'Bakır Kazan & Ocak',
        suspension: 'Ktesibios İkiz Pompa',
        top: 'Üst Plan'
      },
      texTitle: '🎨 Bizans İmparatorluk Donanması & Skylitzes Kaplaması',
      textures: Object.keys(SCHEMES).map(k => ({ key: k, label: SCHEMES[k].btn })),
      subsystems: [
        { key: 'dromon_hull', label: 'Dromon Pruva Gövdesi, Xylokastron & Amforalar', count: 4, color: '#785233' },
        { key: 'cauldron_hearth', label: 'Körüklü Ocak, Bakır Kazan & El Sifonları', count: 3, color: '#b45309' },
        { key: 'pump_hydraulics', label: 'Ktesibios İkiz Bronz Pompa & Windkessel Kubbesi', count: 4, color: '#d97706' },
        { key: 'siphon_armament', label: 'Strepton Mafsal, Aslan Başlı Sifon & Rum Ateşi Jeti', count: 4, color: '#dc2626' }
      ],
      activeTexture: () => activeScheme,
      textureLabel: () => SCHEMES[activeScheme].name,
      relief: () => reliefEnabled,
      reliefLabel: v => `🪵 Meşe Kalas, Dövme Bakır & Deri Dokusu: ${v ? 'AÇIK' : 'KAPALI'}`
    };

    function applyTextures(isBlueprint) {
      const sch = SCHEMES[activeScheme] || SCHEMES.constantinople674;
      myMeshes.forEach(m => {
        const mat = m.material;
        if (!mat || !mat.userData) return;
        const role = mat.userData.gfRole;
        if (role === 'water') {
          mat.color.setHex(sch.water);
          return;
        }
        let hex = null;
        if (role === 'hullWood') hex = sch.hullWood;
        else if (role === 'hullTrim') hex = sch.hullTrim;
        else if (role === 'deckOak') hex = sch.deckOak;
        else if (role === 'copper') hex = sch.copper;
        else if (role === 'bronze') hex = sch.bronze;
        else if (role === 'hideShield') hex = sch.hideShield;
        else if (role === 'amphora') hex = sch.amphora;

        if (hex !== null) {
          if (m.userData && m.userData.origColor) m.userData.origColor.setHex(hex);
          if (!isBlueprint) mat.color.setHex(hex);
        }
        if (role === 'hullWood' || role === 'deckOak' || role === 'copper' || role === 'hideShield') {
          mat.bumpMap = (!isBlueprint && reliefEnabled) ? byzBump : null;
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
        dromonProw: partDromonProw,
        keelWater: partKeelWater,
        naphthaAmphorae: partNaphthaAmphorae,
        bellowsHearth: partBellowsHearth,
        copperCauldron: partCopperCauldron,
        pumpBeam: partPumpBeam,
        twinCylinders: partTwinCylinders,
        windkesselDome: partWindkesselDome,
        riserConduit: partRiserConduit,
        swivelCradle: partSwivelCradle,
        bronzeSiphon: partBronzeSiphon,
        pilotLance: partPilotLance,
        handCheirosiphones: partHandCheirosiphones,
        hideShields: partHideShields,
        flameJet: partFlameJet
      },
      defaultPart: partBronzeSiphon,
      firePart: partFlameJet,

      update(dt) {
        syncVisualState(dt);
      },

      onSlider(idx, val) {
        const v = Number(val);
        if (idx === 0) {
          S.spm = Math.max(0, Math.min(70, v));
        } else if (idx === 1) {
          S.yawDeg = Math.max(-35, Math.min(35, v));
        } else if (idx === 2) {
          S.elevDeg = Math.max(-10, Math.min(25, v));
        }
        syncVisualState(0);
        return {};
      },

      onButton(name) {
        if (name === 'terrain') {
          S.pilotLit = !S.pilotLit;
          if (!S.pilotLit) S.firing = false;
          ui.buttons.terrain = S.pilotLit
            ? '🔥 Pilot Ateşleme Meşalesi: YANIYOR (Atışa Hazır)'
            : '💨 Pilot Ateşleme Meşalesi: SÖNÜK (Ateşleme Kilitli)';
          syncVisualState(0);
          return {
            active: S.pilotLit,
            msg: S.pilotLit
              ? 'Sifon ağzındaki reçineli pilot ateşleme meşalesi tutuşturuldu; Rum Ateşi püskürtmeye hazır!'
              : 'Pilot ateşleme meşalesi söndürüldü; açık alev olmadan neft jeti tutuşmaz.'
          };
        }
        if (name === 'sweep') {
          S.autoPump = !S.autoPump;
          ui.buttons.sweep = S.autoPump
            ? '💪 Sifoncu Pompa Ekibi: ÇALIŞIYOR'
            : '⏸️ Sifoncu Pompa Ekibi: DURAKLATILDI';
          syncVisualState(0);
          return {
            active: S.autoPump,
            msg: S.autoPump
              ? 'Alt güvertedeki sifoncular (siphonarioi) çift pistonlu Ktesibios pompasını basıyor.'
              : 'Pompa manivelası durduruldu.'
          };
        }
        if (name === 'mode') {
          S.mode = S.mode === 'battle' ? 'preheat' : 'battle';
          syncVisualState(0);
          return {
            active: S.mode === 'battle',
            msg: S.mode === 'battle'
              ? '🔥 Savaş & Sifon Atış Düzeni: Windkessel kubbesi tam basınçta, ana kesme vanası atışa hazır!'
              : '⚗️ Alt Güverte Kazan Ön-Isıtma & Amfora İkmal Düzeni: Neft-reçine karışımı bakır kazanda ısıtılıyor.'
          };
        }
        return {};
      },

      buttonActive(name) {
        if (name === 'terrain') return S.pilotLit;
        if (name === 'sweep') return S.autoPump;
        if (name === 'mode') return S.mode === 'battle';
        return false;
      },

      modeLabel() {
        return S.mode === 'battle'
          ? '🔥 Kip: Savaş & Basınçlı Sifon Atış Düzeni (Windkessel Hazır)'
          : '⚗️ Kip: Alt Güverte Kazan Ön-Isıtma & Amfora İkmali';
      },

      onFire() {
        if (S.fuelPct <= 0) {
          S.fuelPct = 100;
          S.firing = false;
          S.fireTimer = 0;
          syncVisualState(0);
          return {
            ok: true,
            refill: true,
            msg: '🏺 Ziftli amforalardan bakır kazana (Chalkion) taze neft yağı ve çam reçinesi dolduruldu (%100).'
          };
        }
        if (!S.pilotLit) {
          return {
            ok: false,
            msg: '⚠️ <strong>PİLOT MEŞALE SÖNÜK:</strong> Sifon ağzındaki pilot ateşleme mızrağı yanmadan sıcak neft tutuşmaz! Önce pilot meşaleyi yakın.'
          };
        }
        S.fuelPct = Math.max(0, S.fuelPct - 25);
        S.firing = true;
        S.fireTimer = 2.4;
        syncVisualState(0);
        if (ctx.audio && ctx.audio.playCannonFire) ctx.audio.playCannonFire();
        return {
          ok: true,
          msg: `🔥 <strong>RUM ATEŞİ (PYR THALASSION) PÜSKÜRTÜLDÜ!</strong> Basınçlı neft jeti deniz yüzeyini tutuşturdu (Kalan Kazan Yakıtı: %${S.fuelPct}).`
        };
      },

      fireButtonLabel() {
        if (S.fuelPct <= 0) return '🏺 AMFORALARDAN NEFT & REÇİNE İKMALİ YAP (%100)';
        if (!S.pilotLit) return '💨 PİLOT MEŞALE SÖNÜK (ÖNCE MEŞALEYİ YAKIN)';
        return `🔥 RUM ATEŞİ SİFONUNU PÜSKÜRT (%${S.fuelPct} YAKIT)`;
      },

      mobileFireButtonLabel() {
        if (S.fuelPct <= 0) return '🏺 Neft İkmali';
        if (!S.pilotLit) return '💨 Meşale Sönük';
        return '🔥 Rum Ateşi At';
      },

      getSliderValues() {
        return [S.spm, S.yawDeg, S.elevDeg];
      },

      getStats() {
        const effSpm = S.autoPump ? S.spm : 0;
        const bar = (1.5 + (effSpm / 70) * 8.0).toFixed(1);
        const rangeM = Math.round(6 + (effSpm / 70) * 14);
        const pilotText = S.pilotLit
          ? 'Pilot Yanıyor <span>(~85°C)</span>'
          : 'Pilot Sönük <span>(Kilitli)</span>';
        return [
          `${bar} <span>Bar (~${rangeM} m)</span>`,
          pilotText,
          `%${S.fuelPct} <span>Neft + Reçine</span>`,
          `${effSpm} <span>Vuruş/dk (180° Faz)</span>`
        ];
      },

      getStatus() {
        if (S.firing) {
          return { text: 'RUM ATEŞİ PÜSKÜRTÜLÜYOR — DENİZ YANIYOR!', color: '#dc2626' };
        }
        if (S.fuelPct <= 0) {
          return { text: 'BAKIR KAZAN BOŞ — AMFORA İKMALİ GEREKLİ', color: '#dc2626' };
        }
        if (!S.pilotLit) {
          return { text: 'PİLOT MEŞALE SÖNÜK — ATEŞLEME KİLİTLİ', color: '#d97706' };
        }
        return S.mode === 'battle'
          ? { text: 'WINDKESSEL TAM BASINÇTA — PÜSKÜRTMEYE HAZIR', color: '#16a34a' }
          : { text: 'ALT GÜVERTE KAZAN ÖN-ISITMA MODU — HAZIR', color: '#0284c7' };
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
