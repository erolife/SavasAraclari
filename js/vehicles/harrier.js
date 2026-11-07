// ============================================================================
// 1969 HAWKER SIDDELEY HARRIER GR.1 & ROLLS-ROYCE PEGASUS VTOL MOTORU
// RAF Museum Hendon/Cosford, Science Museum Group (Rolls-Royce Pegasus Kesiti)
// ve IWM Duxford Koleksiyonlarına Göre 1:1,35 Müze Ölçeğinde
// Tarihin İlk Operasyonel V/STOL Jet Taarruz Uçağı, Zıt Döner Çift Şaftlı
// Pegasus Turbofan Motoru, 4 Senkron Döner Vektör Nozulu (0°..98°) ve RCS "Puffer" Sistemi
// ============================================================================
(function () {
  window.VehicleBuilders = window.VehicleBuilders || {};

  // --- Prosedürel Havacılık Perçin & Panel Derz Kabartma Dokusu ---
  function makeHarrierPanelBump(THREE) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#808080';
    g.fillRect(0, 0, 256, 256);

    g.strokeStyle = '#525252';
    g.lineWidth = 1.5;
    for (let y = 32; y < 256; y += 32) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(256, y);
      g.stroke();
    }
    for (let x = 32; x < 256; x += 48) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, 256);
      g.stroke();
    }
    g.fillStyle = '#b0b0b0';
    for (let y = 6; y < 256; y += 16) {
      for (let x = 6; x < 256; x += 12) {
        g.fillRect(x, y, 1.5, 1.5);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(5, 4);
    return tex;
  }

  // --- 4 Tarihsel Boya Şeması ---
  const SCHEMES = {
    raf_germany1970: {
      name: '🌲 1970 RAF Germany — No. 4 Squadron (NATO Koyu Yeşil & Koyu Deniz Grisi)',
      btn: '🌲 RAF Germany 1970 (NATO Kamuflaj)',
      fuselageTop: 0x3f4d3b,
      fuselageSide: 0x475569,
      belly: 0x94a3b8,
      radome: 0x1e293b,
      nozzleMetal: 0x78716c,
      titanium: 0xcbd5e1
    },
    falklands1982: {
      name: '⚓ Koyu deniz grisi · temsili, GR.3 rekonstrüksiyonu değildir',
      btn: '⚓ Deniz Grisi · Temsili',
      fuselageTop: 0x334155,
      fuselageSide: 0x475569,
      belly: 0x64748b,
      radome: 0x0f172a,
      nozzleMetal: 0x57534e,
      titanium: 0xd4d4d8
    },
    usmc_av8a: {
      name: '🦅 1971 USMC AV-8A Harrier — VMA-513 (Zeytin Yeşili, Haki & Açık Gri)',
      btn: '🦅 USMC AV-8A (Yeşil & Haki)',
      fuselageTop: 0x4d5d42,
      fuselageSide: 0x78716c,
      belly: 0xcbd5e1,
      radome: 0x18181b,
      nozzleMetal: 0x71717a,
      titanium: 0xe2e8f0
    },
    kestrel_p1127: {
      name: '✨ Prototiplerden esinlenen metal yüzey · temsili',
      btn: '✨ Metal Yüzey · Temsili',
      fuselageTop: 0xcbd5e1,
      fuselageSide: 0x94a3b8,
      belly: 0xe2e8f0,
      radome: 0x27272a,
      nozzleMetal: 0x92400e,
      titanium: 0xf8fafc
    }
  };

  // --- Prosedürel Harrier Gövde Kabuğu (Dev Yanal Fan Girişli Damla Kesit) ---
  function createHarrierFuselageGeometry(THREE) {
    const nz = 26;
    const nu = 20;
    const zMin = -4.60;
    const zMax = 4.30;
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    // Harrier gövde kesit profili: ortada Pegasus fanı için geniş omuzlu (R_x = 0.66 m), burun ve kuyruğa daralan
    function profileAtZ(z) {
      if (z > 2.60) {
        // Burun konisi (z = +2.60 .. +4.30 m)
        const f = Math.max(0, 1 - (z - 2.60) / 1.70);
        const rx = 0.04 + 0.48 * Math.pow(f, 0.72);
        const ry = 0.04 + 0.50 * Math.pow(f, 0.72);
        const yc = 1.24 - (1 - f) * 0.14;
        return [rx, ry, yc];
      }
      if (z >= -1.40) {
        // Orta gövde ve dev Pegasus yan hava giriş yanakları (z = -1.40 .. +2.60 m)
        const bulge = Math.sin(((z + 1.40) / 4.00) * Math.PI);
        const rx = 0.54 + 0.14 * bulge;
        const ry = 0.56 + 0.10 * bulge;
        const yc = 1.30 + 0.04 * bulge;
        return [rx, ry, yc];
      }
      // Arka gövde ve kuyruk konisi (z = -4.60 .. -1.40 m)
      const f = Math.max(0, (z - zMin) / (-1.40 - zMin));
      const rx = 0.16 + 0.38 * Math.pow(f, 0.78);
      const ry = 0.18 + 0.38 * Math.pow(f, 0.78);
      const yc = 1.38 - (1 - f) * 0.08;
      return [rx, ry, yc];
    }

    for (let iz = 0; iz <= nz; iz++) {
      const fz = iz / nz;
      const z = zMin + fz * (zMax - zMin);
      const [rx, ry, yc] = profileAtZ(z);
      for (let iu = 0; iu <= nu; iu++) {
        const fu = iu / nu;
        const ang = fu * Math.PI * 2;
        const x = Math.cos(ang) * rx;
        const y = yc + Math.sin(ang) * ry;
        positions.push(x, y, z);
        normals.push(Math.cos(ang), Math.sin(ang), 0);
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
        indices.push(a, b, c, a, c, d);
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

  window.VehicleBuilders.harrier = function buildHarrier(ctx) {
    const { THREE, scene, addCADMesh, createPartGroup } = ctx;
    const root = new THREE.Group();
    root.name = 'harrier_root';
    root.visible = false;
    scene.add(root);

    // Uçağın tüm parçalarını taşıyan airframe grubu (VTOL Hover modunda yükselir!)
    const airframe = new THREE.Group();
    airframe.name = 'harrier_airframe';
    root.add(airframe);

    const myMeshes = [];
    const panelBump = makeHarrierPanelBump(THREE);

    function addMesh(parent, geo, mat, pos, rot, scale) {
      const m = addCADMesh(parent, geo, mat, pos, rot);
      if (scale) m.scale.set(scale[0], scale[1], scale[2]);
      myMeshes.push(m);
      return m;
    }

    // --- Malzemeler ---
    const matFuselageOuter = new THREE.MeshStandardMaterial({
      color: SCHEMES.raf_germany1970.fuselageTop,
      roughness: 0.52,
      metalness: 0.35,
      bumpMap: panelBump,
      bumpScale: 0.012,
      side: THREE.DoubleSide
    });
    matFuselageOuter.userData = { isOuterShell: true, hrRole: 'fuselageTop' };

    const matWingUpper = new THREE.MeshStandardMaterial({
      color: SCHEMES.raf_germany1970.fuselageTop,
      roughness: 0.50,
      metalness: 0.36,
      bumpMap: panelBump,
      bumpScale: 0.01
    });
    matWingUpper.userData = { hrRole: 'fuselageTop' };

    const matFuselageSide = new THREE.MeshStandardMaterial({
      color: SCHEMES.raf_germany1970.fuselageSide,
      roughness: 0.50,
      metalness: 0.38,
      bumpMap: panelBump,
      bumpScale: 0.01
    });
    matFuselageSide.userData = { hrRole: 'fuselageSide' };

    const matBelly = new THREE.MeshStandardMaterial({
      color: SCHEMES.raf_germany1970.belly,
      roughness: 0.48,
      metalness: 0.32
    });
    matBelly.userData = { hrRole: 'belly' };

    const matRadome = new THREE.MeshStandardMaterial({
      color: SCHEMES.raf_germany1970.radome,
      roughness: 0.42,
      metalness: 0.25
    });
    matRadome.userData = { hrRole: 'radome' };

    const matNozzle = new THREE.MeshStandardMaterial({
      color: SCHEMES.raf_germany1970.nozzleMetal,
      roughness: 0.32,
      metalness: 0.85
    });
    matNozzle.userData = { hrRole: 'nozzleMetal' };

    const matTitanium = new THREE.MeshStandardMaterial({
      color: SCHEMES.raf_germany1970.titanium,
      roughness: 0.22,
      metalness: 0.90
    });
    matTitanium.userData = { hrRole: 'titanium' };

    const matHotCore = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0x9a3412,
      emissiveIntensity: 0.45,
      roughness: 0.28,
      metalness: 0.82
    });

    const matDarkIron = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.50,
      metalness: 0.75
    });

    const matTire = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.88,
      metalness: 0.08
    });

    const matCanopyGlass = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.08,
      metalness: 0.15,
      transparent: true,
      opacity: 0.34,
      depthWrite: false
    });

    const matColdJet = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.15,
      transparent: true,
      opacity: 0.65
    });

    const matHotJet = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 1.35,
      transparent: true,
      opacity: 0.78
    });

    // ========================================================================
    // 15 BAĞIMSIZ MEKANİK PARÇA GRUBU (4 Alt Sistem)
    // ========================================================================
    const SUB_LABELS = {
      airframe_wings: 'ALT SİSTEM: HARRIER GÖVDE, HAVA GİRİŞLERİ & ANHEDRAL KANATLAR',
      pegasus_engine: 'ALT SİSTEM: ROLLS-ROYCE PEGASUS ZIT DÖNER ÇİFT ŞAFTLI MOTOR',
      vector_nozzles: 'ALT SİSTEM: 4 DÖNER VEKTÖR NOZULU (0°..98°) & RCS PUFFER',
      gear_weapons: 'ALT SİSTEM: BİSİKLET İNİŞ TAKIMI, ADEN TOPLARI & SNEB ROKETLERİ'
    };

    function makePart(cfg) {
      const g = createPartGroup({
        id: cfg.id,
        name: cfg.name,
        subsystem: cfg.sub,
        subLabel: SUB_LABELS[cfg.sub] || 'ALT SİSTEM: HARRIER GR.1 VTOL',
        desc: cfg.desc + ' Geometri ve hareketler yaklaşık sergi yorumudur; uçuş performansı simülasyonu değildir.',
        material: cfg.material || 'Havacılık Duralümin & Titanyum Alaşımı',
        weight: cfg.weight || '320 kg',
        spec: cfg.spec || 'Hawker Siddeley / Rolls-Royce',
        location: cfg.location || 'Gövde',
        basePos: [0, 0, 0],
        explodeVec: cfg.explode || [0, 1.2, 0],
        isOuterShell: !!cfg.isOuterShell
      });
      airframe.add(g);
      return g;
    }

    // ALT SİSTEM 1: Gövde, Hava Girişleri, Kokpit & -12° Anhedral Kanatlar (airframe_wings — 4 Grup)
    const partFuselageSkin = makePart({
      id: 'hr_fuselage_skin',
      name: '1. Harrier GR.1 Gövde Dış Kabuğu, Dev Yanal Hava Girişleri & Blow-in Kapakçıkları',
      sub: 'airframe_wings',
      isOuterShell: true,
      explode: [0, 0.9, 0],
      spec: 'Tam Boy: 13,87 m | Hava Girişi: 2 × 8 Vakumlu Yardımcı Emme Kapakçıklı (Blow-in Doors) Dev Giriş',
      desc: 'Pegasus motorunun saniyede ~200 kg hava yutan dev LP fanını besleyen yan hava girişleri ve dikey kalkışta (hover) ek hava emişi için vakumla kendiliğinden açılan yardımcı kapakçıklar (blow-in doors). X-Ray modunda dış kabuk saydamlaşarak içteki Pegasus motorunu ve nozul zincir tahrikini gösterir.'
    });

    const partCockpitCanopy = makePart({
      id: 'hr_cockpit_canopy',
      name: '2. Kokpit, Martin-Baker Mk.9 Fırlatma Koltuğu, HUD & Tekli Nozul Vektör Kolu',
      sub: 'airframe_wings',
      explode: [0, 1.8, 2.2],
      spec: 'Koltuk: Martin-Baker Type 9A (Zero-Zero) | Özel Kumanda: Gaz kolunun yanındaki tekli Nozul Vektör Kolu',
      desc: 'Harrier\'ı helikopterlerden ayıran en büyük mühendislik başarısı kokpittedir: pilot dördü birden dönen nozulları gaz kolunun hemen iç tarafındaki tek bir kolla (nozzle lever) ileri-geri çekerek 0° yatay uçuştan 90° dikey hover ve 98° geri frenlemeye kesintisiz geçiş yapar.'
    });

    const partAnhedralWings = makePart({
      id: 'hr_anhedral_wings',
      name: '3. -12° Anhedral (Aşağı Eğimli) Ok Açılı Ana Kanatlar & Flaperonlar',
      sub: 'airframe_wings',
      explode: [0, 1.4, -0.3],
      spec: 'Açıklık: 7,70 m | Dihedral Açısı: -12° (Anhedral) | Ok Açısı: 34°',
      desc: 'Omuzdan bağlı yüksek kanatların aşırı enine kararlılığını (roll stability / Dutch roll) dengelemek ve kanat ucu destek tekerleklerini (outriggers) yere yaklaştırmak için uçlara doğru -12° aşağı bükülen karakteristik Harrier kanatları.'
    });

    const partTailEmpennage = makePart({
      id: 'hr_tail_empennage',
      name: '4. Kuyruk Konisi, Dikey Stabilizatör & Tam Hareketli Yatay Stabilizatör',
      sub: 'airframe_wings',
      explode: [0, 1.1, -2.6],
      spec: 'Kuyruk: Anhedral açılı all-moving tailplane & RWR antenli dikey yüzgeç',
      desc: 'Kuyruk ucunda hover tepki valflerini (RCS) barındıran uzatılmış kuyruk konisi, dikey stabilizatör ve yüksek ses-altı hızlarda yunuslama kontrolü sağlayan tam hareketli yatay kuyruk.'
    });

    // ALT SİSTEM 2: Rolls-Royce Pegasus Zıt Döner Çift Şaftlı Turbofan (pegasus_engine — 3 Grup)
    const partPegasusFanLp = makePart({
      id: 'hr_pegasus_fan_lp',
      name: '5. Rolls-Royce Pegasus 3 Kademeli Alçak Basınç (LP) Titanyum Fanı & LP Şaftı',
      sub: 'pegasus_engine',
      explode: [0, 0.3, 1.9],
      spec: 'Fan Çapı: Ø1,22 m | Kademe: 3 Kademeli Titanyum LP Fan | Dönüş: Sol/Saat Yönü Tersine (ω_LP > 0)',
      desc: 'Pegasus motorunun ön kısmındaki 3 kademeli dev titanyum fan. Sıkıştırdığı havanın büyük kısmını ("soğuk akış") doğrudan ön iki döner nozula göndererek toplam VTOL itkisinin yaklaşık yarısını üretir.'
    });

    const partPegasusCoreHp = makePart({
      id: 'hr_pegasus_core_hp',
      name: '6. Pegasus 8 Kademeli Yüksek Basınç (HP) Kompresörü & Zıt Döner HP Türbin Şaftı',
      sub: 'pegasus_engine',
      explode: [0, 0.5, -0.5],
      spec: 'Kademe: 8 HP Kompresör + Halkasal Yanma Odası + 2 HP / 2 LP Türbin | Dönüş: LP şaftına zıt yönde; hız oranı sergi için seçildi',
      desc: 'Pegasus\'un en kritik sırrı: HP kompresör/türbin şaftı ile LP fan şaftı ZIT YÖNLERDE döner! Böylece uçak havada asılı (hover) dururken her iki şaftın açısal momentumları birbirini götürür (L_toplam ≈ 0) ve tehlikeli jiroskopik yalpa/yunuslama kuplajı ortadan kalkar.'
    });

    const partNozzleDrive = makePart({
      id: 'hr_nozzle_drive',
      name: '7. Pnömatik Nozul Tahrik Motoru, Senkronizasyon Milleri & Zincir Dişlileri',
      sub: 'pegasus_engine',
      explode: [1.5, 0.6, -0.1],
      spec: 'Tahrik: HP kompresör havasıyla çalışan çift pnömatik motor + senkron şaftlar + motosiklet tipi ağır zincir dişlileri',
      desc: 'Dört döner nozulun tek bir derece bile şaşmadan tam senkron (1:1) dönmesini sağlayan mekanik aktarma sistemi. Ön ve arka nozul çiftleri yatay senkron milleri ve zincir dişli kutularıyla birbirine kilitlenmiştir.'
    });

    // ALT SİSTEM 3: 4 × Döner Vektör Nozulu & RCS "Puffer" Tepki Kontrol Sistemi (vector_nozzles — 4 Grup)
    const partColdNozzles = makePart({
      id: 'hr_cold_nozzles',
      name: '8. Ön İkiz "Soğuk" (LP Fan Baypas) Döner Vektör Nozulları (0°..98°)',
      sub: 'vector_nozzles',
      explode: [-1.8, -0.2, 0.7],
      spec: 'Konum: Ön Gövde Yanları (x = ±0,68 m, z = +0,62 m) | Akış: LP Fan Basınçlı Soğuk Hava (~100°C)',
      desc: 'Uçağın ağırlık merkezinin hemen önünde yer alan ve LP fandan gelen sıkıştırılmış baypas havasını yönlendiren ön ikiz döner nozullar. İçindeki yönlendirici kanatçıklar (cascade vanes) hava akışını 90° köşeden minimum kayıpla döndürür.'
    });

    const partHotNozzles = makePart({
      id: 'hr_hot_nozzles',
      name: '9. Arka İkiz "Sıcak" (Türbin Egzoz) Döner Vektör Nozulları (0°..98°)',
      sub: 'vector_nozzles',
      explode: [1.8, -0.2, -0.8],
      spec: 'Konum: Arka Gövde Yanları (x = ±0,68 m, z = -0,82 m) | Akış: Türbin Sıcak Egzoz Gazı (~650°C, Nimonic Alaşım)',
      desc: 'Ağırlık merkezinin hemen arkasında yer alan ve sıcak türbin egzozunu ikiye bölüp dışarı atan Nimonic ısı-dirençli alaşım arka döner nozullar. Ön soğuk nozullarla birlikte ağırlık merkezini dört köşeden dengeler.'
    });

    const partRcsPuffers = makePart({
      id: 'hr_rcs_puffers',
      name: '10. Hover Tepki Kontrol Sistemi (RCS "Puffer" Valfleri — Burun, Kuyruk & Kanat Uçları)',
      sub: 'vector_nozzles',
      explode: [0, 1.7, 0],
      spec: 'Sistem: HP Kompresör Bleed-Air Kanalı + Burun (Pitch), Kuyruk (Pitch/Yaw) ve İki Kanat Ucu (Roll) Puffer Valfleri',
      desc: 'Dikey kalkış ve havada asılı duruşta (hover) kanatlar üzerinden hava akmadığı için normal kanatçık ve dümenler çalışmaz. Pilot lövyeyi hareket ettirdiğinde burun, kuyruk ve kanat uçlarındaki "puffer" tepki valflerinden yüksek basınçlı sıcak hava püskürtülerek uçağın dengesi sağlanır.'
    });

    const partVtolJets = makePart({
      id: 'hr_vtol_jets',
      name: '15. 4 × Vektörel İtki Akış Konileri (Mavi Fan + Turuncu Egzoz) & Puffer Jetleri',
      sub: 'vector_nozzles',
      explode: [0, -1.6, -1.2],
      spec: 'Dört senkron nozul · mavi/turuncu akış renkleri temsili',
      desc: 'Ön iki nozuldan çıkan soğuk mavi fan jeti, arka iki nozuldan çıkan sıcak turuncu egzoz jeti ve uçlardaki RCS puffer hava jetlerinin vektörel görselleştirmesi. Nozul açısı değiştikçe 4 itki vektörü eşzamanlı döner.'
    });

    // ALT SİSTEM 4: Bisiklet İniş Takımı, Outrigger & ADEN / SNEB Silahları (gear_weapons — 4 Grup)
    const partBicycleGear = makePart({
      id: 'hr_bicycle_gear',
      name: '11. Bisiklet Tipi Burun & Merkez Çift Tekerlekli Ana İniş Takımı',
      sub: 'gear_weapons',
      explode: [0, -1.4, 0.4],
      spec: 'Düzen: Gövde Merkez Hattında Bisiklet (Tandem) İniş Takımı | Zemin Teması: y = 0,000 m',
      desc: 'Gövde yanlarında 4 büyük döner nozul bulunduğu için geleneksel üçgen iniş takımına yer kalmamıştır; bu nedenle Harrier\'da burun altında tek, ağırlık merkezi arkasında çift tekerlekli "bisiklet" tipi merkez iniş takımı kullanılmıştır.'
    });

    const partOutriggerGear = makePart({
      id: 'hr_outrigger_gear',
      name: '12. Kanat Ucu Destek Tekerlekleri (Outrigger Landing Gear)',
      sub: 'gear_weapons',
      explode: [2.2, -1.2, -0.8],
      spec: 'Konum: Sol ve Sağ Kanat Ucu Kaportaları (x = ±2,58 m, y = 0,000 m) | İşlev: Yerde Yanal Denge',
      desc: 'Bisiklet tipi merkez iniş takımının yerde yana devrilmesini önleyen ve uçuşta kanat ucu aerodinamik podlarına geriye doğru katlanan ince destek dikmeleri.'
    });

    const partAdenPods = makePart({
      id: 'hr_aden_pods',
      name: '13. Gövde Altı 2 × 30 mm ADEN Revolver Top Podları & Karın Levhaları (Strakes)',
      sub: 'gear_weapons',
      explode: [-1.4, -1.3, 0.2],
      spec: 'Silah: 2 × 30 mm Royal Small Arms Factory ADEN Mk.4 Revolver Topu (1.300 atım/dk, 130\'ar mermi)',
      desc: 'Gövde altına takılan iki adet aerodinamik 30 mm ADEN top podu. Bu podlar aynı zamanda dikey iniş sırasında yere çarpan sıcak egzoz gazlarının yukarı sekip tekrar motor girişine kaçmasını (hot gas ingestion) önleyen birer "hava barajı" (cushion) görevi görür!'
    });

    const partSnebRockets = makePart({
      id: 'hr_sneak_rockets',
      name: '14. Kanat Altı 2 × Matra Type 155 (68 mm SNEB) Roket Podları & Pilonlar',
      sub: 'gear_weapons',
      explode: [1.6, -1.1, -0.2],
      spec: 'Mühimmat: 2 × Matra 155 Podu (Her birinde 18 × 68 mm SNEB Güdümsüz Taarruz Roketi) + 2 × Harici Yakıt Tankı',
      desc: 'Harrier GR.1\'in yakın hava desteği (CAS) görevlerinde taşıdığı 18\'er tüplü Matra SNEB roket podları ve iç pilonlardaki 100 galonluk aerodinamik yakıt tankları.'
    });

    // ========================================================================
    // GEOMETRİ İNŞASI (1:1,35 Müze Ölçeği, Yerde Tekerlekler y = 0,000 m)
    // ========================================================================

    // --- 1. Harrier GR.1 Gövde Dış Kabuğu & Dev Yanal Hava Girişleri (partFuselageSkin) ---
    addMesh(partFuselageSkin, createHarrierFuselageGeometry(THREE), matFuselageOuter, [0, 0, 0]);
    // Burun radomu ve pitot tüpü (z = +3,95 .. +5,05 m)
    addMesh(partFuselageSkin, new THREE.ConeGeometry(0.18, 0.65, 20), matRadome, [0, 1.10, 4.55], [Math.PI / 2 + 0.08, 0, 0]);
    addMesh(partFuselageSkin, new THREE.CylinderGeometry(0.01, 0.014, 0.55, 8), matTitanium, [0, 1.08, 5.05], [Math.PI / 2, 0, 0]);

    // Sol ve Sağ Dev Yanal Hava Giriş Kaportaları (Cheek Intakes) & 8'er Yardımcı Emme Kapakçığı (Blow-in Doors)
    [-0.56, 0.56].forEach(xIn => {
      const sign = xIn < 0 ? -1 : 1;
      addMesh(partFuselageSkin, new THREE.CylinderGeometry(0.38, 0.42, 1.25, 18, 1, true), matFuselageSide, [xIn, 1.32, 1.65], [Math.PI / 2, 0, 0]);
      addMesh(partFuselageSkin, new THREE.TorusGeometry(0.38, 0.032, 10, 20), matBelly, [xIn, 1.32, 2.26]);
      // Vakumlu yardımcı emme kapakçıkları (Blow-in doors)
      for (let d = 0; d < 4; d++) {
        const dy = -0.18 + d * 0.12;
        addMesh(partFuselageSkin, new THREE.BoxGeometry(0.025, 0.08, 0.22), matBelly, [xIn + sign * 0.38, 1.32 + dy, 1.95], [0, sign * 0.15, 0]);
      }
    });

    // --- 2. Kokpit, Martin-Baker Mk.9 Koltuk, HUD & Kanopi (partCockpitCanopy) ---
    // Kokpit küveti, Martin-Baker fırlatma koltuğu ve baş üstü çekme halkası
    addMesh(partCockpitCanopy, new THREE.BoxGeometry(0.46, 0.34, 0.95), matDarkIron, [0, 1.36, 2.65]);
    addMesh(partCockpitCanopy, new THREE.BoxGeometry(0.34, 0.58, 0.12), matDarkIron, [0, 1.56, 2.42], [-0.18, 0, 0]);
    addMesh(partCockpitCanopy, new THREE.BoxGeometry(0.32, 0.10, 0.34), matNozzle, [0, 1.32, 2.62]);
    // HUD camı ve gösterge siperi
    addMesh(partCockpitCanopy, new THREE.BoxGeometry(0.36, 0.16, 0.35), matDarkIron, [0, 1.58, 3.02]);
    addMesh(partCockpitCanopy, new THREE.BoxGeometry(0.18, 0.14, 0.02), matCanopyGlass, [0, 1.68, 2.98], [-0.45, 0, 0]);
    // Sol konsoldaki ünlü Nozul Vektör Kolu (Nozzle Vectoring Lever)
    const cockpitNozzleLever = new THREE.Group();
    cockpitNozzleLever.position.set(-0.20, 1.44, 2.75);
    partCockpitCanopy.add(cockpitNozzleLever);
    addMesh(cockpitNozzleLever, new THREE.CylinderGeometry(0.01, 0.01, 0.18, 8), matTitanium, [0, 0.09, 0]);
    addMesh(cockpitNozzleLever, new THREE.SphereGeometry(0.024, 8, 8), matHotCore, [0, 0.18, 0]);

    // Damla biçimli cam kanopi ve çerçevesi (z = +1,85 .. +3,35 m)
    const canopy=addMesh(partCockpitCanopy,new THREE.SphereGeometry(1,28,18),matCanopyGlass,[0,1.72,2.55]);
    canopy.scale.set(.31,.34,.80);canopy.name='hr-canopy';
    for(const z of [2.02,2.96])addMesh(partCockpitCanopy,new THREE.TorusGeometry(.28,.016,8,24,Math.PI),matFuselageSide,[0,1.72,z]);
    addMesh(partCockpitCanopy, new THREE.TorusGeometry(0.31, 0.018, 8, 16, Math.PI), matFuselageSide, [0, 1.62, 2.85]);

    // --- 3. -12° Anhedral (Aşağı Eğimli) Ana Kanatlar & Flaperonlar (partAnhedralWings) ---
    const aileronPivots = [];
    [-1, 1].forEach(side => {
      const wGrp = new THREE.Group();
      // Omuz bağlantı noktası: x = ±0,48 m, y = 1,72 m, z = -0,25 m
      wGrp.position.set(side * 0.48, 1.72, -0.25);
      // Karakteristik -12° anhedral (aşağı eğim) açısı!
      wGrp.rotation.z = -side * THREE.MathUtils.degToRad(12.5);
      partAnhedralWings.add(wGrp);

      // Kanat ana kutusu (geriye 34° ok açılı, yarı açıklık ~2,20 m)
      const wingShape=new THREE.Shape();
      [[0,0.64],[side*1.12,-0.04],[side*1.18,0.02],[side*2.20,-0.72],[side*2.20,-1.15],[side*0.65,-0.95],[0,-0.80]].forEach(([x,z],i)=>i?wingShape.lineTo(x,-z):wingShape.moveTo(x,-z));wingShape.closePath();
      addMesh(wGrp,new THREE.ExtrudeGeometry(wingShape,{depth:0.065,bevelEnabled:false}),matWingUpper,[0,0.0325,0],[Math.PI/2,0,0]);
      for(const [r,c,y] of [[0.17,0x233d68,0.038],[0.10,0xa43b35,0.041]])addMesh(wGrp,new THREE.CircleGeometry(r,24),new THREE.MeshStandardMaterial({color:c,roughness:.8}),[side*1.55,y,-.62],[-Math.PI/2,0,0]);
      addMesh(wGrp,new THREE.SphereGeometry(.035,10,8),new THREE.MeshStandardMaterial({color:side<0?0xc53632:0x399355}),[side*2.20,0,-.75]);
      // Kanat ucu aerodinamik podu ve testere dişi hücum kenarı (dogtooth)
      addMesh(wGrp, new THREE.CylinderGeometry(0.07, 0.09, 1.12, 12), matFuselageSide, [side * 2.12, -0.02, -0.82], [Math.PI / 2, 0, 0]);
      // Kanatçık (Aileron)
      const ailPiv = new THREE.Group();
      ailPiv.position.set(side * 1.68, -0.01, -1.05);
      ailPiv.rotation.y = -side * 0.32;
      wGrp.add(ailPiv);
      addMesh(ailPiv, new THREE.BoxGeometry(0.68, 0.04, 0.24), matFuselageSide, [0, 0, -0.12]);
      aileronPivots.push({ grp: ailPiv, side });
    });

    // --- 4. Kuyruk Konisi, Dikey Stabilizatör & Yatay Stabilizatör (partTailEmpennage) ---
    // Dikey stabilizatör (fin) ve üst RWR uyarı anteni (z = -3,10 .. -4,65 m, y = 1,55 .. 2,88 m)
    const finShape=new THREE.Shape();finShape.moveTo(-3.0,1.48);finShape.lineTo(-3.75,2.86);finShape.lineTo(-4.30,2.86);finShape.lineTo(-4.38,1.48);finShape.closePath();
    const finGeo=new THREE.ExtrudeGeometry(finShape,{depth:.07,bevelEnabled:false});finGeo.rotateY(-Math.PI/2);finGeo.translate(.035,0,0);
    addMesh(partTailEmpennage,finGeo,matFuselageSide,[0,0,0]);
    // Tam hareketli anhedral yatay stabilizatör (All-moving tailplane)
    const tailplanePivot = new THREE.Group();
    tailplanePivot.position.set(0, 1.48, -4.15);
    partTailEmpennage.add(tailplanePivot);
    [-1, 1].forEach(side => {
      addMesh(tailplanePivot, new THREE.BoxGeometry(1.36, 0.045, 0.62), matWingUpper, [side * 0.72, -0.12, -0.22], [0, -side * 0.42, -side * 0.22]);
    });

    // --- 5. Rolls-Royce Pegasus 3 Kademeli Alçak Basınç (LP) Titanyum Fanı & Şaftı (partPegasusFanLp) ---
    const Y_ENGINE = 1.30;
    const lpSpoolGrp = new THREE.Group();
    lpSpoolGrp.position.set(0, Y_ENGINE, 1.25);
    partPegasusFanLp.add(lpSpoolGrp);

    // Burun konisi (spinner), 3 kademeli LP titanyum fan diskleri ve 18 adet geniş veterli fan pali
    addMesh(lpSpoolGrp, new THREE.ConeGeometry(0.14, 0.34, 18), matTitanium, [0, 0, 0.36], [Math.PI / 2, 0, 0]);
    [0.14, -0.04, -0.22].forEach((zStage, sIdx) => {
      const rFan = 0.42 - sIdx * 0.03;
      addMesh(lpSpoolGrp, new THREE.CylinderGeometry(rFan * 0.45, rFan * 0.45, 0.12, 18), matTitanium, [0, 0, zStage], [Math.PI / 2, 0, 0]);
      const bladeCount = sIdx === 0 ? 16 : 12;
      for (let b = 0; b < bladeCount; b++) {
        const ang = (b / bladeCount) * Math.PI * 2;
        const bHolder = new THREE.Group();
        bHolder.position.set(0, 0, zStage);
        bHolder.rotation.z = ang;
        lpSpoolGrp.add(bHolder);
        addMesh(bHolder, new THREE.BoxGeometry(0.025, rFan * 0.56, 0.085), matTitanium, [0, rFan * 0.68, 0], [0, 0.42, 0]);
      }
    });
    // İçten geçen uzun LP şaftı (z_yerel = -2,35 .. +0,20 m) ve arka LP türbin diski
    addMesh(lpSpoolGrp, new THREE.CylinderGeometry(0.055, 0.055, 2.45, 14), matTitanium, [0, 0, -1.08], [Math.PI / 2, 0, 0]);
    addMesh(lpSpoolGrp, new THREE.CylinderGeometry(0.28, 0.26, 0.16, 18), matHotCore, [0, 0, -2.18], [Math.PI / 2, 0, 0]);

    // --- 6. Pegasus 8 Kademeli Yüksek Basınç (HP) Kompresörü & Zıt Döner HP Şaftı (partPegasusCoreHp) ---
    // Yarı saydam/kafesli motor karter halkaları ve halkasal yanma odası (sabit gövde)
    addMesh(partPegasusCoreHp, new THREE.CylinderGeometry(0.36, 0.32, 0.58, 22, 1, true), matNozzle, [0, Y_ENGINE, -0.35], [Math.PI / 2, 0, 0]);
    addMesh(partPegasusCoreHp, new THREE.TorusGeometry(0.36, 0.025, 10, 24), matHotCore, [0, Y_ENGINE, -0.10]);
    addMesh(partPegasusCoreHp, new THREE.TorusGeometry(0.34, 0.025, 10, 24), matHotCore, [0, Y_ENGINE, -0.62]);

    // Zıt yönde dönen (ω_HP = -1,35 * ω_LP) HP kompresör + HP türbin tamburu!
    const hpSpoolGrp = new THREE.Group();
    hpSpoolGrp.position.set(0, Y_ENGINE, 0.25);
    partPegasusCoreHp.add(hpSpoolGrp);
    addMesh(hpSpoolGrp, new THREE.CylinderGeometry(0.11, 0.11, 1.35, 16), matHotCore, [0, 0, -0.42], [Math.PI / 2, 0, 0]);
    for (let st = 0; st < 6; st++) {
      const zHp = 0.22 - st * 0.13;
      const rHp = 0.29 - st * 0.012;
      addMesh(hpSpoolGrp, new THREE.CylinderGeometry(rHp, rHp, 0.06, 18), matTitanium, [0, 0, zHp], [Math.PI / 2, 0, 0]);
      for (let b = 0; b < 10; b++) {
        const ang = (b / 10) * Math.PI * 2;
        addMesh(hpSpoolGrp, new THREE.BoxGeometry(0.02, 0.08, 0.05), matTitanium, [Math.cos(ang) * rHp, Math.sin(ang) * rHp, zHp], [0, 0, ang]);
      }
    }
    // 2 kademeli HP sıcak türbin rotor diski (z_yerel = -0,95 m)
    addMesh(hpSpoolGrp, new THREE.CylinderGeometry(0.27, 0.27, 0.18, 18), matHotCore, [0, 0, -0.95], [Math.PI / 2, 0, 0]);

    // --- 7. Pnömatik Nozul Tahrik Motoru & Zincir Dişli Senkronizasyon Sistemi (partNozzleDrive) ---
    // Motor üstündeki pnömatik hava motoru (air motor) ve ön/arka nozulları bağlayan senkron şaftları
    addMesh(partNozzleDrive, new THREE.CylinderGeometry(0.08, 0.08, 0.36, 14), matTitanium, [0, Y_ENGINE + 0.44, -0.10], [0, 0, Math.PI / 2]);
    [-0.52, 0.52].forEach(xChain => {
      // Ön (z=+0,62) ve Arka (z=-0,82) nozul dişlilerini birbirine kilitleyen boyuna senkron mili ve zincir muhafazası
      addMesh(partNozzleDrive, new THREE.CylinderGeometry(0.024, 0.024, 1.48, 12), matTitanium, [xChain, Y_ENGINE + 0.22, -0.10], [Math.PI / 2, 0, 0]);
      addMesh(partNozzleDrive, new THREE.TorusGeometry(0.16, 0.022, 8, 18), matDarkIron, [xChain, Y_ENGINE - 0.08, 0.62], [0, Math.PI / 2, 0]);
      addMesh(partNozzleDrive, new THREE.TorusGeometry(0.16, 0.022, 8, 18), matDarkIron, [xChain, Y_ENGINE - 0.08, -0.82], [0, Math.PI / 2, 0]);
    });

    // --- 8 & 9. Ön İkiz "Soğuk" (partColdNozzles) ve Arka İkiz "Sıcak" (partHotNozzles) Döner Vektör Nozulları ---
    // 4 nozulun tamamı aynı açı (theta_N = 0° .. 98°) ile döner!
    // theta_N = 0° iken nozul ağzı tam geriye (-Z) bakar; theta_N = 90° iken tam aşağı (-Y) bakar; 98° iken hafif ileri-aşağı frenleme yapar.
    const Z_NOZ_COLD = 0.62;
    const Z_NOZ_HOT = -0.82;
    const Y_NOZ = 1.16;
    const X_NOZ = 0.64;

    const coldNozzlePivots = [];
    const hotNozzlePivots = [];

    function buildSwivelNozzle(parent, xPos, zPos, isHot) {
      const sign = xPos < 0 ? -1 : 1;
      // Gövde yan yatak flanşı (sabit)
      addMesh(parent, new THREE.CylinderGeometry(0.22, 0.24, 0.12, 20), matNozzle, [xPos - sign * 0.06, Y_NOZ, zPos], [0, 0, Math.PI / 2]);

      // Döner dirsek nozul grubu (X ekseni etrafında 0° .. 98° döner)
      const nPiv = new THREE.Group();
      nPiv.position.set(xPos, Y_NOZ, zPos);
      parent.add(nPiv);

      const elbowMat = isHot ? matHotCore : matNozzle;
      // Yanal giriş bileziği
      addMesh(nPiv, new THREE.CylinderGeometry(0.195, 0.195, 0.18, 18), elbowMat, [sign * 0.06, 0, 0], [0, 0, Math.PI / 2]);
      // Dirsek omuz küresi
      addMesh(nPiv, new THREE.SphereGeometry(0.195, 16, 14), elbowMat, [sign * 0.14, 0, 0]);
      // Geriye (-Z) doğru uzanan nozul namlusu ve iç yönlendirici kanatçık ızgarası (cascade louvers)
      addMesh(nPiv, new THREE.CylinderGeometry(0.175, 0.195, 0.34, 18), elbowMat, [sign * 0.14, 0, -0.20], [Math.PI / 2, 0, 0]);
      for (let v = -1; v <= 1; v++) {
        addMesh(nPiv, new THREE.BoxGeometry(0.28, 0.018, 0.08), matTitanium, [sign * 0.14, v * 0.07, -0.36]);
      }
      return nPiv;
    }

    [-X_NOZ, X_NOZ].forEach(xN => {
      coldNozzlePivots.push(buildSwivelNozzle(partColdNozzles, xN, Z_NOZ_COLD, false));
      hotNozzlePivots.push(buildSwivelNozzle(partHotNozzles, xN, Z_NOZ_HOT, true));
    });

    // --- 10. Hover Tepki Kontrol Sistemi (RCS "Puffer" Boruları & Valfleri) (partRcsPuffers) ---
    // HP kompresörden buruna (z=+4,15), kuyruğa (z=-4,55) ve iki kanat ucuna (x=±2,58) giden titanyum basınçlı hava boruları
    addMesh(partRcsPuffers, new THREE.CylinderGeometry(0.025, 0.025, 8.60, 10), matTitanium, [0, 1.52, -0.20], [Math.PI / 2, 0, 0]);
    // Burun, kuyruk ve kanat ucu "Puffer" panjurlu reaksiyon valfleri
    [[0, 0.94, 4.15], [0, 1.34, -4.52], [-2.54, 1.24, -1.05], [2.54, 1.24, -1.05]].forEach(pos => {
      addMesh(partRcsPuffers, new THREE.CylinderGeometry(0.048, 0.055, 0.09, 12), matHotCore, pos);
    });

    // --- 11. Bisiklet Tipi Burun & Merkez Ana İniş Takımı (y = 0,000 m) (partBicycleGear) ---
    // Burun iniş takımı (z = +2,55 m, tekerlek yarıçapı R = 0,21 m -> merkez y = 0,21 m -> alt yüzey tam y = 0,000 m!)
    addMesh(partBicycleGear, new THREE.CylinderGeometry(0.042, 0.036, 0.78, 12), matTitanium, [0, 0.62, 2.55]);
    addMesh(partBicycleGear, new THREE.BoxGeometry(0.16, 0.08, 0.24), matTitanium, [0, 0.28, 2.55]);
    const noseWheelMesh = addMesh(partBicycleGear, new THREE.CylinderGeometry(0.21, 0.21, 0.12, 20), matTire, [0, 0.21, 2.55], [0, 0, Math.PI / 2]);
    addMesh(partBicycleGear, new THREE.CylinderGeometry(0.10, 0.10, 0.13, 14), matTitanium, [0, 0.21, 2.55], [0, 0, Math.PI / 2]);

    // Merkez çift tekerlekli ana iniş takımı (z = -0,95 m, tekerlek yarıçapı R = 0,28 m -> merkez y = 0,28 m -> alt yüzey tam y = 0,000 m!)
    addMesh(partBicycleGear, new THREE.CylinderGeometry(0.058, 0.048, 0.76, 14), matTitanium, [0, 0.68, -0.95]);
    addMesh(partBicycleGear, new THREE.CylinderGeometry(0.036, 0.036, 0.42, 12), matTitanium, [0, 0.28, -0.95], [0, 0, Math.PI / 2]);
    const mainWheelMeshes = [];
    [-0.16, 0.16].forEach(xWh => {
      const mw = addMesh(partBicycleGear, new THREE.CylinderGeometry(0.28, 0.28, 0.13, 22), matTire, [xWh, 0.28, -0.95], [0, 0, Math.PI / 2]);
      addMesh(partBicycleGear, new THREE.CylinderGeometry(0.13, 0.13, 0.14, 14), matTitanium, [xWh, 0.28, -0.95], [0, 0, Math.PI / 2]);
      mainWheelMeshes.push(mw);
    });

    // --- 12. Kanat Ucu Destek Tekerlekleri (Outrigger Landing Gear) (partOutriggerGear) ---
    [-2.54, 2.54].forEach(xOut => {
      // Kanat ucu podundan (y = 1,22 m, z = -1,08 m) yere (y = 0,000 m) inen ince dikme ve tekerlek (R = 0,13 m)
      addMesh(partOutriggerGear, new THREE.CylinderGeometry(0.026, 0.022, 1.08, 10), matTitanium, [xOut, 0.68, -1.08]);
      addMesh(partOutriggerGear, new THREE.CylinderGeometry(0.13, 0.13, 0.07, 16), matTire, [xOut, 0.13, -1.08], [0, 0, Math.PI / 2]);
      addMesh(partOutriggerGear, new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12), matTitanium, [xOut, 0.13, -1.08], [0, 0, Math.PI / 2]);
    });

    // --- 13. Gövde Altı 2 × 30 mm ADEN Revolver Top Podları (partAdenPods) ---
    const adenMuzzleFlashes = [];
    [-0.36, 0.36].forEach(xPod => {
      addMesh(partAdenPods, new THREE.CylinderGeometry(0.12, 0.12, 1.85, 16), matFuselageSide, [xPod, 0.72, 0.35], [Math.PI / 2, 0, 0]);
      addMesh(partAdenPods, new THREE.ConeGeometry(0.12, 0.38, 16), matFuselageSide, [xPod, 0.72, 1.46], [Math.PI / 2, 0, 0]);
      addMesh(partAdenPods, new THREE.ConeGeometry(0.12, 0.36, 16), matFuselageSide, [xPod, 0.72, -0.75], [-Math.PI / 2, 0, 0]);
      // 30 mm ADEN top namlusu ve namlu alevi
      addMesh(partAdenPods, new THREE.CylinderGeometry(0.022, 0.026, 0.36, 10), matDarkIron, [xPod, 0.68, 1.68], [Math.PI / 2, 0, 0]);
      const fl = addMesh(partAdenPods, new THREE.ConeGeometry(0.09, 0.42, 10), matHotJet, [xPod, 0.68, 2.02], [Math.PI / 2, 0, 0]);
      fl.visible = false;
      adenMuzzleFlashes.push(fl);
    });

    // --- 14. Kanat Altı 2 × Matra SNEB 68 mm Roket Podları & Harici Tanklar (partSnebRockets) ---
    const snebProjectiles = [];
    [-1, 1].forEach(side => {
      // İç pilon + harici yakıt tankı (x = ±1,15 m)
      addMesh(partSnebRockets, new THREE.BoxGeometry(0.05, 0.24, 0.68), matBelly, [side * 1.15, 1.34, -0.45]);
      addMesh(partSnebRockets, new THREE.CylinderGeometry(0.15, 0.15, 1.75, 16), matFuselageSide, [side * 1.15, 1.08, -0.45], [Math.PI / 2, 0, 0]);
      addMesh(partSnebRockets, new THREE.ConeGeometry(0.15, 0.45, 16), matRadome, [side * 1.15, 1.08, 0.65], [Math.PI / 2, 0, 0]);
      addMesh(partSnebRockets, new THREE.ConeGeometry(0.15, 0.45, 16), matFuselageSide, [side * 1.15, 1.08, -1.55], [-Math.PI / 2, 0, 0]);

      // Dış pilon + Matra Type 155 (18 × 68 mm SNEB) roket podu (x = ±1,78 m)
      addMesh(partSnebRockets, new THREE.BoxGeometry(0.05, 0.22, 0.56), matBelly, [side * 1.78, 1.22, -0.68]);
      addMesh(partSnebRockets, new THREE.CylinderGeometry(0.14, 0.14, 1.25, 16), matTitanium, [side * 1.78, 0.98, -0.68], [Math.PI / 2, 0, 0]);
      addMesh(partSnebRockets, new THREE.CylinderGeometry(0.135, 0.135, 0.04, 16), matDarkIron, [side * 1.78, 0.98, -0.04], [Math.PI / 2, 0, 0]);

      // Ateşlemede fırlayan 68 mm SNEB roketi
      const rkt = new THREE.Group();
      rkt.position.set(side * 1.78, 0.98, 0.0);
      partSnebRockets.add(rkt);
      addMesh(rkt, new THREE.CylinderGeometry(0.034, 0.034, 0.52, 10), matTitanium, [0, 0, 0], [Math.PI / 2, 0, 0]);
      addMesh(rkt, new THREE.ConeGeometry(0.035, 0.18, 10), matHotCore, [0, 0, 0.35], [Math.PI / 2, 0, 0]);
      addMesh(rkt, new THREE.ConeGeometry(0.06, 0.35, 10), matHotJet, [0, 0, -0.42], [-Math.PI / 2, 0, 0]);
      rkt.visible = false;
      snebProjectiles.push({ grp: rkt, baseX: side * 1.78 });
    });

    // --- 15. 4 × Vektörel İtki Akış Konisi & RCS Puffer Hava Jetleri (partVtolJets) ---
    const coldJetPlumes = [];
    const hotJetPlumes = [];
    [-X_NOZ, X_NOZ].forEach((xN, idx) => {
      const sign = xN < 0 ? -1 : 1;
      const cj = new THREE.Group();
      cj.position.set(xN + sign * 0.14, Y_NOZ, Z_NOZ_COLD);
      partVtolJets.add(cj);
      addMesh(cj, new THREE.ConeGeometry(0.17, 0.78, 14), matColdJet, [0, 0, -0.74], [Math.PI / 2, 0, 0]);
      coldJetPlumes.push(cj);

      const hj = new THREE.Group();
      hj.position.set(xN + sign * 0.14, Y_NOZ, Z_NOZ_HOT);
      partVtolJets.add(hj);
      addMesh(hj, new THREE.ConeGeometry(0.19, 0.84, 14), matHotJet, [0, 0, -0.77], [Math.PI / 2, 0, 0]);
      hotJetPlumes.push(hj);
    });

    // ========================================================================
    // CANLI MEKANİK DURUM (STATE) VE ETKİLEŞİM MANTIĞI
    // ========================================================================
    const S = {
      nozzleDeg: 82,            // 4 × Vektör Nozul Açısı (0° Yatay Uçuş .. 90° Dikey Hover .. 98° VIFF Frenleme)
      rpm: 6800,                // Rolls-Royce Pegasus LP Fan Devri (0 .. 8500 RPM)
      stickDeg: 0,              // Yunuslama / Yalpa Kumandası ve RCS Puffer (-20° .. +20°)
      autoCycle: false,         // Otomatik VTOL 0° <-> 90° nozul geçiş döngüsü (sweep butonu)
      jetsVisible: true,        // Vektörel itki jet konileri görünür mü? (terrain butonu)
      mode: 'hover',            // 'hover' (Dikey VTOL Havada Asılı Duruş) | 'ground' (Pist Üzerinde / STOL)
      ammoSalvo: 4,             // 4 salvo (30 mm ADEN + 68 mm SNEB roket salvosu)
      firing: false,
      fireProgress: 0,
      lpAngle: 0,               // LP fan toplam dönüş açısı (rad)
      hpAngle: 0,               // HP kompresör/türbin zıt yönlü toplam dönüş açısı (rad)
      hoverLift: 0,             // Hava çerçevesinin yerden yüksekliği (0 m yerde .. 1,15 m hover)
      animTime: 0
    };

    function syncVisualState(dt) {
      const stepDt = Math.max(0, Math.min(dt || 0, 0.1));
      S.animTime += stepDt;

      // Otomatik VTOL geçiş testi açıksa nozul açısını 0° ile 90° arasında yumuşakça oynat
      if (S.autoCycle && stepDt > 0) {
        const w = 0.5 - 0.5 * Math.cos(S.animTime * 1.4);
        S.nozzleDeg = Math.round(w * 90);
      }

      // 1. Zıt Döner Çift Şaftlı (Contra-Rotating) Pegasus Turbofan Kinematiği
      // KURAL: Gizli alt sınır YOKTUR; S.rpm === 0 iken dLp = 0 ve dHp = 0!
      const omegaLp = (S.rpm / 60) * 0.25; // Görsel netlik için ölçekli açısal hız
      const dLp = omegaLp * stepDt;
      const dHp = -1.35 * dLp; // HP şaftı LP şaftına TAM ZIT yönde (-1,35x) döner!
      S.lpAngle += dLp;
      S.hpAngle += dHp;

      lpSpoolGrp.rotation.z = S.lpAngle;
      hpSpoolGrp.rotation.z = S.hpAngle;

      // 2. 4 × Döner Vektör Nozulu Senkronizasyonu (0° Yatay .. 90° Dikey Hover .. 98° Geri Frenleme)
      // theta_N = 0° iken rotation.x = 0 (nozul geriye -Z bakar); theta_N = 90° iken rotation.x = -pi/2 (nozul aşağı -Y bakar)
      const nozRad = -THREE.MathUtils.degToRad(S.nozzleDeg);
      coldNozzlePivots.forEach(np => { np.rotation.x = nozRad; });
      hotNozzlePivots.forEach(np => { np.rotation.x = nozRad; });
      cockpitNozzleLever.rotation.x = THREE.MathUtils.degToRad(S.nozzleDeg * 0.65);

      // Vektörel itki konileri (S.rpm > 100 ve jetsVisible açıkken nozullarla aynı açıda döner)
      const showJets = S.jetsVisible && S.rpm > 100;
      const jetScale = Math.max(0.25, S.rpm / 8500);
      coldJetPlumes.forEach(cj => {
        cj.visible = showJets;
        cj.rotation.x = nozRad;
        cj.scale.set(1, 1, jetScale);
      });
      hotJetPlumes.forEach(hj => {
        hj.visible = showJets;
        hj.rotation.x = nozRad;
        hj.scale.set(1, 1, jetScale);
      });

      // 3. VTOL Hover Yüksekliği vs. Yerde (Ground) Duruş
      // Ground modunda airframe.position.y = 0.000 (tekerlekler tam y = 0,000 m zemine basar!)
      const targetLift = (S.mode === 'hover' && S.nozzleDeg >= 75 && S.rpm >= 2000) ? 0.95 : 0.0;
      S.hoverLift = targetLift;
      airframe.position.y = S.hoverLift;

      // 4. Kumanda Yüzeyleri & RCS Puffer
      const stickRad = THREE.MathUtils.degToRad(S.stickDeg);
      tailplanePivot.rotation.x = stickRad;
      aileronPivots.forEach(ap => {
        ap.grp.rotation.x = ap.side * stickRad * 0.8;
      });

      // 5. 30 mm ADEN Top & 68 mm Matra SNEB Roket Salvosu
      if (S.firing) {
        S.fireProgress += stepDt * 1.4;
        if (S.fireProgress >= 1.0) {
          S.firing = false;
          S.fireProgress = 0;
          adenMuzzleFlashes.forEach(fl => { fl.visible = false; });
          snebProjectiles.forEach(sp => { sp.grp.visible = false; });
        } else {
          adenMuzzleFlashes.forEach(fl => {
            fl.visible = true;
            fl.scale.setScalar(0.8 + 0.4 * Math.sin(S.fireProgress * 40));
          });
          snebProjectiles.forEach(sp => {
            sp.grp.visible = true;
            sp.grp.position.z = S.fireProgress * 9.5;
          });
        }
      } else {
        adenMuzzleFlashes.forEach(fl => { fl.visible = false; });
        snebProjectiles.forEach(sp => { sp.grp.visible = false; });
      }
    }

    // Başlangıçta 'ground' modunda senkronize et ki min.y = 0,000 m zemin teması daima net olsun
    S.mode = 'ground';
    lpSpoolGrp.name='hr-lp';hpSpoolGrp.name='hr-hp';
    [...coldNozzlePivots,...hotNozzlePivots].forEach((p,i)=>p.name='hr-nozzle-'+i);
    [...coldJetPlumes,...hotJetPlumes].forEach((p,i)=>p.name='hr-jet-'+i);
    snebProjectiles.forEach((p,i)=>p.grp.name='hr-projectile-'+i);
    syncVisualState(0);

    // ========================================================================
    // KAMERA AÇILARI VE 6 ADIMLI REHBERLİ TUR
    // ========================================================================
    const camPresets = {
      iso: { pos: [13, 6, 13], look: [0, 1.35, 0] },
      front: { pos: [2.2, 2.1, 7.2], look: [0, 1.35, 1.2] },
      breech: { pos: [3.2, 1.9, 0.8], look: [0, 1.25, -0.1] },
      engine: { pos: [3.4, 2.2, 1.4], look: [0, 1.35, 0.2] },
      suspension: { pos: [3.6, 1.2, 1.8], look: [0, 0.65, 0.4] },
      top: { pos: [0.1, 10.5, 0.1], look: [0, 1.3, 0] }
    };

    const tourSteps = [
      {
        title: 'Genel Bakış: 1969 Hawker Siddeley Harrier GR.1 — İlk Operasyonel V/STOL Jet',
        desc: '1969\'da RAF hizmetine giren Harrier GR.1, piste ihtiyaç duymadan orman açıklıklarından veya gemi güvertelerinden dikey kalkış ve iniş (V/STOL) yapabilen tarihin ilk operasyonel jet taarruz uçağıdır.',
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'iso',
        part: partFuselageSkin
      },
      {
        title: 'X-Ray: Rolls-Royce Pegasus & Zıt Yönde Dönen Çift Şaft (Jiroskopik Denge)',
        desc: 'X-Ray modunda 3 kademeli titanyum LP fan ile 8 kademeli HP kompresörün ZIT YÖNLERDE döndüğünü izleyin! Bu tasarım, uçak havada asılı (hover) dururken jiroskopik etkileri azaltarak uçağın kontrolsüzce yana yatmasını önler.',
        explode: 0,
        cutaway: true,
        sub: 'all',
        cam: 'engine',
        part: partPegasusFanLp
      },
      {
        title: '4 × Senkron Döner Vektör Nozulu (0° Yatay -> 90° Hover -> 98° VIFF)',
        desc: 'Öndeki iki "soğuk" fan nozulu ve arkadaki iki "sıcak" türbin egzoz nozulu, pnömatik motor ve zincir-şaft sistemiyle bire bir aynı açıda (0°..98°) döner. Kaydırıcıyla 4 nozulun eşzamanlı dönüşünü deneyimleyin.',
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'breech',
        part: partColdNozzles
      },
      {
        title: 'Hover Tepki Kontrol Sistemi: RCS "Puffer" Hava Valfleri',
        desc: 'Havada asılı dururken kanatlar üzerinden hava akmadığı için kanatçık ve dümenler işlevsizdir. HP kompresörden alınan basınçlı hava burun, kuyruk ve kanat uçlarındaki "puffer" valflerinden püskürtülerek uçak dengelenir.',
        explode: 0,
        cutaway: true,
        sub: 'all',
        cam: 'top',
        part: partRcsPuffers
      },
      {
        title: '-12° Anhedral Kanatlar, Bisiklet İniş Takımı & Outrigger Tekerlekleri',
        desc: 'Yanlardaki 4 nozul nedeniyle Harrier\'da merkez "bisiklet" tipi iniş takımı ve -12° aşağı eğimli (anhedral) kanatların uçlarında destek tekerlekleri (outriggers) kullanılmıştır.',
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'suspension',
        part: partBicycleGear
      },
      {
        title: '30 mm ADEN Top Podları ("Hava Barajı") & 68 mm SNEB Roketleri',
        desc: 'Gövde altındaki 2 × 30 mm ADEN top podları sadece güçlü birer silah değil, aynı zamanda dikey inişte yerden seken sıcak egzoz gazlarının tekrar motora kaçmasını önleyen birer aerodinamik kalkandır.',
        explode: 0,
        cutaway: false,
        sub: 'all',
        cam: 'front',
        part: partAdenPods
      }
    ];

    // ========================================================================
    // ADAPTÖR ARAYÜZÜ (UI) TANIMI
    // ========================================================================
    let activeScheme = 'raf_germany1970';
    let reliefEnabled = true;

    const ui = {
      title: '1969 HAWKER SIDDELEY HARRIER GR.1 & ROLLS-ROYCE PEGASUS VTOL MOTORU',
      sub: 'Tarihin İlk Operasyonel V/STOL Jet Taarruz Uçağı • Zıt Döner Çift Şaftlı Pegasus Turbofan, 4 Döner Vektör Nozulu & RCS Puffer',
      badge: 'HARRIER GR.1 — 1969',
      partCount: '15 Ana Grup',
      portraitCameraScale: 1.55,
      fog: {near: 40, far: 90},
      shadowExtent: 9,
      sliders: [
        { label: '4 × Vektör Nozul Açısı (0° Uçuş .. 90° Hover .. 98° Fren)', min: 0, max: 98, step: 1, fmt: v => `${Math.round(v)}°` },
        { label: 'Rolls-Royce Pegasus LP/HP Fan Devri', min: 0, max: 8500, step: 100, fmt: v => `${Math.round(v)} RPM` },
        { label: 'Lövye & RCS "Puffer" Tepki Kumandası', min: -20, max: 20, step: 1, fmt: v => `${v > 0 ? '+' : ''}${Math.round(v)}°` }
      ],
      buttons: {
        terrain: '💨 4 × Vektörel İtki Akış Konisi: AÇIK',
        sweep: '🔄 Otomatik VTOL (0° ⇄ 90°) Geçiş Döngüsü: KAPALI',
        mode: true
      },
      telemetryTag: 'ROLLS-ROYCE PEGASUS MK 101',
      statLabels: ['TEMSİLİ MOTOR DEVRİ', 'NOZUL VEKTÖR AÇISI', 'ÇİFT ŞAFT (LP / HP)', 'ADEN & SNEB MÜHİMMAT'],
      camLabels: {
        iso: 'İzometrik Genel',
        front: 'Pruva & Hava Girişi',
        breech: '4 Döner Vektör Nozulu',
        engine: 'Pegasus Zıt Şaftlar',
        suspension: 'Bisiklet İniş Takımı',
        top: 'Üst (-12° Anhedral)'
      },
      texTitle: '🎨 RAF, Royal Navy & USMC Tarihsel Boya Şemaları',
      textures: Object.keys(SCHEMES).map(k => ({ key: k, label: SCHEMES[k].btn })),
      subsystems: [
        { key: 'airframe_wings', label: 'Gövde, Hava Girişleri, Kokpit & -12° Kanatlar', count: 4, color: '#475569' },
        { key: 'pegasus_engine', label: 'Pegasus Zıt Döner LP/HP Şaftlar & Zincir Tahriki', count: 3, color: '#0284c7' },
        { key: 'vector_nozzles', label: '4 × Döner Vektör Nozulu (0°..98°) & RCS Puffer', count: 4, color: '#ea580c' },
        { key: 'gear_weapons', label: 'Bisiklet İniş Takımı, Outrigger, ADEN & SNEB', count: 4, color: '#16a34a' }
      ],
      activeTexture: () => activeScheme,
      textureLabel: () => SCHEMES[activeScheme].name,
      relief: () => reliefEnabled,
      reliefLabel: v => `🔩 Havacılık Perçin & Panel Derz Dokusu: ${v ? 'AÇIK' : 'KAPALI'}`
    };

    function applyTextures(isBlueprint) {
      const sch = SCHEMES[activeScheme] || SCHEMES.raf_germany1970;
      myMeshes.forEach(m => {
        const mat = m.material;
        if (!mat || !mat.userData) return;
        const role = mat.userData.hrRole;
        let hex = null;
        if (role === 'fuselageTop') hex = sch.fuselageTop;
        else if (role === 'fuselageSide') hex = sch.fuselageSide;
        else if (role === 'belly') hex = sch.belly;
        else if (role === 'radome') hex = sch.radome;
        else if (role === 'nozzleMetal') hex = sch.nozzleMetal;
        else if (role === 'titanium') hex = sch.titanium;

        if (hex !== null) {
          if (m.userData && m.userData.origColor) m.userData.origColor.setHex(hex);
          if (!isBlueprint) mat.color.setHex(hex);
        }
        if (role === 'fuselageTop' || role === 'fuselageSide') {
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
        fuselageSkin: partFuselageSkin,
        cockpitCanopy: partCockpitCanopy,
        anhedralWings: partAnhedralWings,
        tailEmpennage: partTailEmpennage,
        pegasusFanLp: partPegasusFanLp,
        pegasusCoreHp: partPegasusCoreHp,
        nozzleDrive: partNozzleDrive,
        coldNozzles: partColdNozzles,
        hotNozzles: partHotNozzles,
        rcsPuffers: partRcsPuffers,
        bicycleGear: partBicycleGear,
        outriggerGear: partOutriggerGear,
        adenPods: partAdenPods,
        snebRockets: partSnebRockets,
        vtolJets: partVtolJets
      },
      defaultPart: partColdNozzles,
      firePart: partSnebRockets,

      update(dt) {
        syncVisualState(dt);
      },

      onSlider(idx, val) {
        const v = Number(val);
        if (!Number.isFinite(v)) return {};
        if (idx === 0) {
          S.autoCycle = false;
          S.nozzleDeg = Math.max(0, Math.min(98, v));
        } else if (idx === 1) {
          S.rpm = Math.max(0, Math.min(8500, v));
        } else if (idx === 2) {
          S.stickDeg = Math.max(-20, Math.min(20, v));
        }
        syncVisualState(0);
        return {};
      },

      onButton(name) {
        if (name === 'terrain') {
          S.jetsVisible = !S.jetsVisible;
          ui.buttons.terrain = S.jetsVisible
            ? '💨 4 × Vektörel İtki Akış Konisi: AÇIK'
            : '💨 4 × Vektörel İtki Akış Konisi: GİZLİ';
          syncVisualState(0);
          return {
            active: S.jetsVisible,
            msg: S.jetsVisible
              ? 'Ön soğuk fan (mavi) ve arka sıcak egzoz (turuncu) vektörel itki konileri gösteriliyor.'
              : 'Vektörel itki akış konileri gizlendi.'
          };
        }
        if (name === 'sweep') {
          S.autoCycle = !S.autoCycle;
          ui.buttons.sweep = S.autoCycle
            ? '🔄 Otomatik VTOL (0° ⇄ 90°) Geçiş Döngüsü: AÇIK'
            : '🔄 Otomatik VTOL (0° ⇄ 90°) Geçiş Döngüsü: KAPALI';
          syncVisualState(0);
          return {
            active: S.autoCycle,
            msg: S.autoCycle
              ? '4 döner nozulun 0° yatay uçuştan 90° dikey VTOL hover konumuna senkron geçiş döngüsü başlatıldı.'
              : 'Otomatik nozul döngüsü durduruldu.'
          };
        }
        if (name === 'mode') {
          S.mode = S.mode === 'hover' ? 'ground' : 'hover';
          S.autoCycle = false;
          if (S.mode === 'hover' && S.nozzleDeg < 80) S.nozzleDeg = 90;
          syncVisualState(0);
          return {
            active: S.mode === 'hover',
            msg: S.mode === 'hover'
              ? '🚁 VTOL Dikey Hover Modu: 4 nozul aşağı yönlendirildi, uçak yerden yükselerek RCS "puffer" kontrolüne geçti!'
              : '🛬 Pist / STOL Yer Modu: Uçak bisiklet iniş takımı ve kanat ucu destek tekerlekleri üzerine indi (y = 0,000 m).'
          };
        }
        return {};
      },

      buttonActive(name) {
        if (name === 'terrain') return S.jetsVisible;
        if (name === 'sweep') return S.autoCycle;
        if (name === 'mode') return S.mode === 'hover';
        return false;
      },

      modeLabel() {
        return S.mode === 'hover'
          ? '🚁 Kip: Dikey VTOL Hover (Havada Asılı & RCS Puffer Aktif)'
          : '🛬 Kip: Pist / STOL Yer Duruşu (Bisiklet İniş Takımı Yerde)';
      },

      onFire() {
        if (S.firing) return {ok:false,msg:'Salvo gösterimi sürüyor.'};
        if (S.ammoSalvo <= 0) {
          S.ammoSalvo = 4;
          S.firing = false;
          S.fireProgress = 0;
          syncVisualState(0);
          return {
            ok: true,
            refill: true,
            msg: '🔄 İleri Cephe İkmali: 2 × 30 mm ADEN top podları ve 36 × 68 mm Matra SNEB roketleri yeniden yüklendi (4/4 Salvo).'
          };
        }
        S.ammoSalvo = Math.max(0, S.ammoSalvo - 1);
        S.firing = true;
        S.fireProgress = 0.02;
        syncVisualState(0);
        if (ctx.audio && ctx.audio.playCannonFire) ctx.audio.playCannonFire();
        return {
          ok: true,
          msg: `💥 <strong>30 mm ADEN Topları & 68 mm SNEB Roketleri Ateşlendi!</strong> (Kalan Salvo: ${S.ammoSalvo} / 4)`
        };
      },

      fireButtonLabel() {
        if(S.firing) return '⏳ SALVO GÖSTERİMİ SÜRÜYOR';
        if (S.ammoSalvo <= 0) return '🔄 30 MM ADEN & 68 MM SNEB MÜHİMMAT İKMALİ YAP';
        return `💥 30 MM ADEN & SNEB ROKET SALVOSU ATEŞLE (${S.ammoSalvo}/4)`;
      },

      mobileFireButtonLabel() {
        if(S.firing) return '⏳ Gösterim sürüyor';
        return S.ammoSalvo <= 0 ? '🔄 İkmal Yap' : '💥 ADEN & SNEB';
      },

      getSliderValues() {
        return [S.nozzleDeg, S.rpm, S.stickDeg];
      },

      getStats() {
        const modeTxt = S.nozzleDeg >= 75
          ? `${S.nozzleDeg}° <span>(VTOL Hover)</span>`
          : S.nozzleDeg >= 30
            ? `${S.nozzleDeg}° <span>(STOL Kısa Kalkış)</span>`
            : `${S.nozzleDeg}° <span>(Yatay Seyir)</span>`;
        const spoolTxt = S.rpm === 0
          ? '0 <span>RPM (Durdu)</span>'
          : `+${Math.round(S.rpm / 100)} / -${Math.round((S.rpm * 1.35) / 100)} <span>Zıt Şaft</span>`;
        return [
          `${S.rpm} <span>RPM · temsili devir</span>`,
          modeTxt,
          spoolTxt,
          `${S.ammoSalvo} / 4 <span>Salvo (30mm+68mm)</span>`
        ];
      },

      getStatus() {
        if (S.firing) {
          return { text: '30 MM ADEN & 68 MM SNEB SALVOSU ATEŞLENİYOR!', color: '#dc2626' };
        }
        if (S.ammoSalvo <= 0) {
          return { text: 'MÜHİMMAT BİTTİ — İKMAL GEREKLİ', color: '#d97706' };
        }
        if (S.hoverLift > 0) {
          return { text: 'TEMSİLİ DİKEY VTOL HOVER — 4 NOZUL & RCS PUFFER DEVREDE', color: '#0284c7' };
        }
        return { text: 'PİST / STOL KONUMU — ATIŞA VE VTOL KALKIŞA HAZIR', color: '#16a34a' };
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
