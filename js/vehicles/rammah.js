/* Hasan el-Rammah "Yumurta" (al-Bayda) Öz-İtkili Roket Torpidosu (~1280, BnF Arabe 2825)
 * Tarihsel el yazmasına dayalı müze yorumu; oranlar ve iç yakıt katmanları eğitim amaçlıdır. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.rammah = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'rammah');
    const { T, root, parts, mats, mesh, box, cyl, ring, pipe, beam, instances } = K;
    const english = window.MuseumPreferences?.language === 'en';
    const t = (tr, en) => (english ? en : tr);

    const state = {
      open: 0,       // Üst tava kesit açıklığı (%0..%100)
      thrust: 55,    // Roket itki gücü (%0..%100)
      rudder: 0,     // Kuyruk dümen açısı (-15..+15 deg)
      showWater: true,
      launched: false,
      travel: 0,     // 0 -> 1 ileri kayma
      animating: false,
      elapsed: 0
    };

    const counts = {};
    let partIndex = 0;

    function mat(color, metalness = 0.45, roughness = 0.55, paint = false) {
      const m = new T.MeshStandardMaterial({ color, metalness, roughness, bumpScale: 0.002 });
      m.userData.paint = paint;
      return m;
    }

    const copper = mat(0xa8643a, 0.78, 0.34, true);
    const iron = mat(0x3a4046, 0.72, 0.48, false);
    const feltMat = mat(0x7c6f5b, 0.05, 0.94, false);
    const powderMat = mat(0x28292b, 0.1, 0.92, false);
    const naphthaMat = mat(0xb87324, 0.15, 0.55, false);
    const fuseMat = mat(0xc8a464, 0.08, 0.85, false);
    const woodMat = mats.wood.clone();
    const brassMat = mats.brass.clone();
    const waterMat = new T.MeshStandardMaterial({
      color: 0x3b7a94,
      transparent: true,
      opacity: 0.42,
      roughness: 0.18,
      metalness: 0.12
    });
    const flameOuterMat = new T.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 1.4,
      transparent: true,
      opacity: 0.82,
      roughness: 0.3
    });
    const flameCoreMat = new T.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 1.8,
      transparent: true,
      opacity: 0.92,
      roughness: 0.2
    });

    function part(id, tr, en, subTr, subEn, descTr, descEn, basePos = [0, 0.62, 0], exp = [0, 0.5, 0], outer = false) {
      const sub = t(subTr, subEn);
      counts[sub] = (counts[sub] || 0) + 1;
      const p = K.part(id, ++partIndex + '. ' + t(tr, en), sub, basePos, exp, t(descTr, descEn), outer);
      Object.assign(p.userData, {
        material: t('Dövme bakır/demir, keçe yalıtım, ahşap kızak ve güherçile karışımı', 'Hammered copper/iron, felt seal, timber cradle and saltpeter mixture'),
        weight: t('Tarihsel ölçü kaydı yok (temsili ~1,4 m gövde)', 'No historical mass record (interpretive ~1.4 m hull)'),
        spec: t('BnF Arabe 2825 el yazması (~1280) rekonstrüksiyonu', 'BnF Arabe 2825 manuscript (~1280) interpretation')
      });
      return p;
    }

    // -------------------------------------------------------------------------
    // A. MERCEK GÖVDE (LENTICULAR HULL) — 4 Grup
    // -------------------------------------------------------------------------
    const upperProfile = [
      new T.Vector2(0.01, 0.38),
      new T.Vector2(0.32, 0.36),
      new T.Vector2(0.68, 0.28),
      new T.Vector2(0.96, 0.14),
      new T.Vector2(1.08, 0.03),
      new T.Vector2(1.02, 0.01)
    ];
    const upperPan = part(
      'upperPan',
      'Üst Mercek Bakır Tava',
      'Upper lenticular copper pan',
      'Mercek Gövde',
      'Lenticular Hull',
      'El yazmasında iki tavanın birleştirilmesiyle tarif edilen üst metal kabuk. Kesit kaydırıcısıyla yukarı kaldırılabilir.',
      'Upper metal shell formed from two joined pans as described in the treatise. Lifts with the cutaway slider.',
      [0, 0.62, 0],
      [0, 1.4, 0],
      true
    );
    const upperGeo = new T.LatheGeometry(upperProfile, 40);
    const upperMesh = mesh(upperPan, upperGeo, copper, [0, 0, 0]);
    upperMesh.scale.set(1.18, 1.0, 0.68);
    cyl(upperPan, 0.075, 0.14, [0, 0.38, 0], brassMat, 'y');

    const lowerPan = part(
      'lowerPan',
      'Alt Mercek Demir Tava',
      'Lower lenticular iron pan',
      'Mercek Gövde',
      'Lenticular Hull',
      'Su hattına oturan alt metal tava; ısıya ve darbeye karşı alt zırh çanağını oluşturur.',
      'Lower metal pan resting near the waterline, forming the heat-resistant lower shell.',
      [0, 0.62, 0],
      [0, -0.5, 0],
      true
    );
    const lowerProfile = upperProfile.map(v => new T.Vector2(v.x, -v.y));
    const lowerGeo = new T.LatheGeometry(lowerProfile, 40);
    const lowerMesh = mesh(lowerPan, lowerGeo, iron, [0, 0, 0]);
    lowerMesh.scale.set(1.18, 1.0, 0.68);

    const sealRing = part(
      'sealRing',
      'Keçe Conta ve Perçin Keneti',
      'Felt gasket and riveted seam',
      'Mercek Gövde',
      'Lenticular Hull',
      'İki metal tavanın arasına sıkıştırılan kalın keçe yalıtım bandı ve çevresel kenet perçinleri.',
      'Thick felt gasket compressed between the two pans with peripheral seam rivets.',
      [0, 0.62, 0],
      [0, 0.45, 0.6]
    );
    const seamTorus = ring(sealRing, 1.06, [0, 0, 0], feltMat, 0.045, [Math.PI / 2, 0, 0]);
    seamTorus.scale.set(1.18, 0.68, 1.0);
    const rivetList = [];
    for (let i = 0; i < 18; i++) {
      const a = (i * Math.PI * 2) / 18;
      rivetList.push({ pos: [Math.cos(a) * 1.24, 0.02, Math.sin(a) * 0.72] });
    }
    instances(sealRing, new T.CylinderGeometry(0.022, 0.022, 0.06, 8), brassMat, rivetList);

    const incendiaryCore = part(
      'incendiaryCore',
      'İç Yangın Harcı ve Güherçile Haznesi',
      'Internal incendiary & saltpeter core',
      'Mercek Gövde',
      'Lenticular Hull',
      'Rammah’ın tarif ettiği arıtılmış güherçile, neft yağı ve demir talaşı katmanlarının temsili kesiti.',
      'Interpretive cutaway of purified saltpeter, naphtha oil and iron filings mixture described by al-Rammah.',
      [0, 0.62, 0],
      [0, 0.9, -0.5]
    );
    const coreBase = cyl(incendiaryCore, 0.88, 0.14, [0, -0.02, 0], powderMat, 'y');
    coreBase.scale.set(1.1, 1.0, 0.62);
    const coreTop = cyl(incendiaryCore, 0.66, 0.16, [0, 0.08, 0], naphthaMat, 'y');
    coreTop.scale.set(1.08, 1.0, 0.60);
    ring(incendiaryCore, 0.42, [0, 0.17, 0], brassMat, 0.02, [Math.PI / 2, 0, 0]);

    // -------------------------------------------------------------------------
    // B. ROKET İTKİSİ (ROCKET PROPULSION) — 4 Grup
    // -------------------------------------------------------------------------
    const portRocket = part(
      'portRocket',
      'İskele Roket İtki Tüpü',
      'Port rocket propulsion tube',
      'Roket İtkisi',
      'Rocket Propulsion',
      'Güherçile bazlı yakıtla doldurulmuş sol yan roket tüpü ve daralan seramik/demir lüle.',
      'Left-side saltpeter-fueled rocket tube and converging exhaust nozzle.',
      [0, 0.62, 0],
      [-0.5, 0.3, -0.9]
    );
    cyl(portRocket, 0.11, 1.25, [-0.45, 0.02, -0.52], iron, 'x');
    cyl(portRocket, 0.075, 0.22, [-1.14, 0.02, -0.52], brassMat, 'x', 0.11);
    cyl(portRocket, 0.09, 0.14, [0.22, 0.02, -0.52], copper, 'x');

    const starboardRocket = part(
      'starboardRocket',
      'Sancak Roket İtki Tüpü',
      'Starboard rocket propulsion tube',
      'Roket İtkisi',
      'Rocket Propulsion',
      'İskele tüpüyle eşzamanlı yanarak doğrusal su üstü itki üreten sağ yan roket tüpü.',
      'Right-side rocket tube burning in parallel with the port tube to drive forward motion.',
      [0, 0.62, 0],
      [-0.5, 0.3, 0.9]
    );
    cyl(starboardRocket, 0.11, 1.25, [-0.45, 0.02, 0.52], iron, 'x');
    cyl(starboardRocket, 0.075, 0.22, [-1.14, 0.02, 0.52], brassMat, 'x', 0.11);
    cyl(starboardRocket, 0.09, 0.14, [0.22, 0.02, 0.52], copper, 'x');

    const fuseTrain = part(
      'fuseTrain',
      'Çatallı Ateşleme Fitili',
      'Forked ignition fuse train',
      'Roket İtkisi',
      'Rocket Propulsion',
      'Tek noktadan yakıldığında her iki roket tüpünü aynı anda ateşleyen Y biçimli barut fitili.',
      'Y-shaped powder fuse igniting both lateral rocket tubes simultaneously from one point.',
      [0, 0.62, 0],
      [-0.8, 0.7, 0]
    );
    pipe(fuseTrain, [[-0.95, 0.12, 0], [-0.55, 0.12, 0], [-0.20, 0.08, -0.52]], 0.022, fuseMat);
    pipe(fuseTrain, [[-0.55, 0.12, 0], [-0.20, 0.08, 0.52]], 0.022, fuseMat);
    ring(fuseTrain, 0.055, [-0.95, 0.14, 0], brassMat, 0.015, [0, Math.PI / 2, 0]);

    const plume = part(
      'plume',
      'Egzoz Alevi ve Gaz Çıkışı',
      'Exhaust flame plume',
      'Roket İtkisi',
      'Rocket Propulsion',
      'Roket itki gücü sıfırın üzerindeyken iki lüleden çıkan temsili itki alevi.',
      'Illustrative thrust plume emerging from both rocket nozzles whenever thrust is above zero.',
      [0, 0.62, 0],
      [-1.4, 0.2, 0]
    );
    const plumeCones = [];
    for (const zSign of [-1, 1]) {
      const g = new T.Group();
      g.position.set(-1.26, 0.02, zSign * 0.52);
      plume.add(g);
      const outerC = new T.Mesh(new T.ConeGeometry(0.11, 0.78, 16), flameOuterMat);
      outerC.rotation.z = Math.PI / 2;
      outerC.position.x = -0.39;
      g.add(outerC);
      const innerC = new T.Mesh(new T.ConeGeometry(0.055, 0.44, 14), flameCoreMat);
      innerC.rotation.z = Math.PI / 2;
      innerC.position.x = -0.22;
      g.add(innerC);
      plumeCones.push(g);
    }

    // -------------------------------------------------------------------------
    // C. DENGE VE KILAVUZ (STABILITY & GUIDANCE) — 3 Grup
    // -------------------------------------------------------------------------
    const guidePoles = part(
      'guidePoles',
      'İkiz Uzun Denge ve Kılavuz Çubukları',
      'Twin stability & guide poles',
      'Denge ve Kılavuz',
      'Stability & Guidance',
      'El yazmasındaki çizimde arkaya uzanan iki uzun ahşap kılavuz çubuğu torpidonun rotasını düz tutar.',
      'Two long rear guide poles shown in the manuscript illustration to keep the torpedo on course.',
      [0, 0.62, 0],
      [-1.1, 0.4, 0]
    );
    for (const z of [-0.22, 0.22]) {
      cyl(guidePoles, 0.036, 2.55, [-2.15, 0.02, z], woodMat, 'x');
    }
    for (const x of [-1.45, -2.35, -3.15]) {
      box(guidePoles, [0.07, 0.05, 0.54], [x, 0.02, 0], iron);
    }

    const lateralSkids = part(
      'lateralSkids',
      'Yan Su Üstü Kayma Kızakları',
      'Lateral surface-skimming skids',
      'Denge ve Kılavuz',
      'Stability & Guidance',
      'Yumurtanın su üzerinde yan yatmasını önleyen iki yanal denge kızağı.',
      'Pair of lateral skids keeping the lenticular hull upright while skimming across water.',
      [0, 0.62, 0],
      [0, -0.3, 0.8]
    );
    for (const zSign of [-1, 1]) {
      pipe(
        lateralSkids,
        [[-0.88, -0.28, zSign * 0.72], [0.0, -0.34, zSign * 0.76], [0.95, -0.24, zSign * 0.66]],
        0.03,
        woodMat
      );
      beam(lateralSkids, [-0.55, -0.10, zSign * 0.52], [-0.55, -0.31, zSign * 0.73], 0.04, iron);
      beam(lateralSkids, [0.55, -0.10, zSign * 0.52], [0.55, -0.30, zSign * 0.73], 0.04, iron);
    }

    const rudderFin = part(
      'rudderFin',
      'Kıç Yön Dümeni (Denge Kanatçığı)',
      'Stern directional rudder fin',
      'Denge ve Kılavuz',
      'Stability & Guidance',
      'Kılavuz çubukların ucuna takılı, ±15° ayarlanabilen kuyruk denge kanatçığı.',
      'Directional tail fin mounted at the rear of the guide poles, adjustable within ±15°.',
      [0, 0.62, 0],
      [-1.5, 0.7, 0]
    );
    const rudderPivot = new T.Group();
    rudderPivot.position.set(-3.32, 0.02, 0);
    rudderFin.add(rudderPivot);
    cyl(rudderPivot, 0.024, 0.44, [0, 0, 0], brassMat, 'y');
    const finShape = new T.Shape();
    finShape.moveTo(0, -0.20);
    finShape.lineTo(-0.46, -0.26);
    finShape.lineTo(-0.42, 0.24);
    finShape.lineTo(0, 0.18);
    finShape.closePath();
    const finGeo = new T.ExtrudeGeometry(finShape, { depth: 0.026, bevelEnabled: false });
    mesh(rudderPivot, finGeo, copper, [0, 0, -0.013]);

    // -------------------------------------------------------------------------
    // D. MAHMUZ VE SERGİ (RAM & EXHIBIT) — 5 Grup
    // -------------------------------------------------------------------------
    const spearRam = part(
      'spearRam',
      'Dikenli Pruva Mahmuz Mızrağı',
      'Barbed prow ramming spear',
      'Mahmuz ve Sergi',
      'Ram & Exhibit',
      'Hedef geminin ahşap bordasına çarpıp saplanarak gövdeyi tekneye tutturacak sivri mahmuz iğnesi.',
      'Barbed iron prow spike designed to embed into an enemy ship’s wooden hull upon impact.',
      [0, 0.62, 0],
      [1.2, 0.3, 0]
    );
    cyl(spearRam, 0.045, 0.85, [1.55, 0.01, 0], iron, 'x');
    const tipCone = mesh(spearRam, new T.ConeGeometry(0.085, 0.36, 12), mats.steel, [2.12, 0.01, 0], [0, 0, -Math.PI / 2]);
    tipCone.castShadow = true;
    for (const [dy, dz] of [[0.06, 0], [-0.06, 0], [0, 0.06], [0, -0.06]]) {
      beam(spearRam, [2.02, 0.01, 0], [1.86, 0.01 + dy * 1.4, dz * 1.4], 0.026, mats.steel);
    }

    const clamps = part(
      'clamps',
      'Gövde Kenet Kelepçeleri',
      'Hull binding clamps',
      'Mahmuz ve Sergi',
      'Ram & Exhibit',
      'Alt ve üst tavayı roket tüpleriyle birbirine sabitleyen dövme demir kuşaklar.',
      'Forged iron binding straps securing the two pans and rocket tubes together.',
      [0, 0.62, 0],
      [0, 0.8, -0.8]
    );
    for (const x of [-0.55, 0.55]) {
      const band = ring(clamps, 0.44, [x, 0, 0], iron, 0.026, [0, Math.PI / 2, 0]);
      band.scale.set(1.48, 0.85, 1.0);
    }

    const launchCradle = part(
      'launchCradle',
      'Ahşap Fırlatma Oluğu ve Kaide',
      'Wooden launch trough & plinth',
      'Mahmuz ve Sergi',
      'Ram & Exhibit',
      'Torpidonun sergilendiği ve suya bırakılmadan önce hizalandığı ahşap oluklu müze kaidesi.',
      'Museum timber cradle and wooden trough used to support and aim the device.',
      [0, 0, 0],
      [0, -0.35, 0]
    );
    box(launchCradle, [8.6, 0.14, 2.4], [0.9, 0.07, 0], mats.dark);
    for (const x of [-2.4, -0.6, 1.2]) {
      box(launchCradle, [0.22, 0.24, 1.3], [x, 0.25, 0], woodMat);
    }
    for (const z of [-0.62, 0.62]) {
      box(launchCradle, [4.2, 0.07, 0.10], [-0.6, 0.36, z], woodMat);
    }

    const waterTarget = part(
      'waterTarget',
      'Su Yüzeyi Kesiti ve Temsili Gemi Bordası',
      'Water surface & target ship hull section',
      'Mahmuz ve Sergi',
      'Ram & Exhibit',
      'Roket itkisiyle su üstü kayışı ve pruva mahmuzunun hedef ahşap bordaya saplanmasını gösteren sergi kesiti.',
      'Exhibition water strip and representative timber ship side showing prow impact.',
      [0, 0, 0],
      [1.4, 0, 0]
    );
    box(waterTarget, [8.2, 0.06, 2.1], [0.9, 0.28, 0], waterMat);
    // Hedef gemi bordası (x = +4.15..+4.75)
    box(waterTarget, [0.36, 1.45, 1.95], [4.35, 0.86, 0], woodMat);
    for (const y of [0.35, 0.72, 1.10, 1.45]) {
      box(waterTarget, [0.40, 0.08, 1.98], [4.35, y, 0], iron);
    }
    for (const z of [-0.72, 0, 0.72]) {
      box(waterTarget, [0.16, 1.5, 0.14], [4.58, 0.88, z], mats.dark);
    }

    const plaque = part(
      'plaque',
      'Yazısız Pirinç Müze Levhası',
      'Unlettered brass museum plaque',
      'Mahmuz ve Sergi',
      'Ram & Exhibit',
      'BnF Arabe 2825 el yazmasına atıf yapan yazısız sergi bilgi plakası.',
      'Unlettered brass exhibit plaque referencing the BnF Arabe 2825 treatise.',
      [0, 0, 0],
      [0, -0.35, 0.5]
    );
    box(plaque, [1.1, 0.04, 0.42], [-2.5, 0.16, 0.88], brassMat, [0.22, 0, 0]);

    // Hareketli torpido parçaları (ateşleme sırasında X yönünde ilerler)
    const movingKeys = [
      'upperPan', 'lowerPan', 'sealRing', 'incendiaryCore',
      'portRocket', 'starboardRocket', 'fuseTrain', 'plume',
      'guidePoles', 'lateralSkids', 'rudderFin', 'spearRam', 'clamps'
    ];
    const baseY = 0.62;

    function sync() {
      const openLift = (state.open / 100) * 0.95;
      const travelX = state.travel * 1.92;
      for (const k of movingKeys) {
        parts[k].position.x = travelX;
        parts[k].position.y = k === 'upperPan' ? baseY + openLift : baseY;
      }

      rudderPivot.rotation.y = (state.rudder * Math.PI) / 180;
      waterTarget.visible = state.showWater;

      const activeThrust = state.thrust > 0;
      plume.visible = activeThrust;
      if (activeThrust) {
        const s = 0.45 + (state.thrust / 100) * 0.95;
        const flicker = state.animating || state.elapsed > 0 ? 1 + 0.1 * Math.sin(state.elapsed * 24) : 1;
        for (const c of plumeCones) {
          c.scale.set(s * flicker, 0.65 + (state.thrust / 100) * 0.45, 0.65 + (state.thrust / 100) * 0.45);
        }
      }
    }

    function reset() {
      Object.assign(state, { open: 0, thrust: 55, rudder: 0, showWater: true, launched: false, travel: 0, animating: false });
      sync();
    }

    const camPresets = {
      iso: { pos: [4.6, 3.2, 6.2], look: [0.4, 0.75, 0] },
      front: { pos: [6.4, 1.8, 0.2], look: [0.6, 0.75, 0] },
      breech: { pos: [-6.6, 2.1, 2.2], look: [-0.8, 0.7, 0] },
      engine: { pos: [0.2, 2.4, 3.5], look: [0, 0.7, 0] },
      suspension: { pos: [-2.2, 1.6, 3.8], look: [-1.4, 0.6, 0] },
      top: { pos: [0.4, 7.6, 0.01], look: [0.4, 0.6, 0] }
    };

    const tourSteps = [
      [
        ['1280 El Yazmasından Su Üstü Roketi', 'A 1280 manuscript surface rocket'],
        ['Hasan el-Rammah’ın Kitâbü’l-Fürûsiyye eserinde tarif edilen al-bayda (“yumurta”), erken dönem roket tahrikli su üstü yakıcı aracıdır.', 'Described in Hasan al-Rammah’s Book of Military Horsemanship, al-bayda (“the egg”) is an early rocket-propelled incendiary naval weapon.'],
        'iso', 'upperPan', false
      ],
      [
        ['İki Metal Tava ve Keçe Yalıtım', 'Two metal pans & felt seal'],
        ['Birbirine kenetlenmiş iki yassı tava su sızdırmaz keçe conta ile mühürlenir. Üst tavayı kaldırarak iç yangın harcını inceleyin.', 'Two fastened metal pans are sealed with a felt gasket. Lift the upper pan to inspect the internal incendiary charge.'],
        'engine', 'incendiaryCore', true
      ],
      [
        ['Arıtılmış Güherçile ve İkiz Roketler', 'Purified saltpeter & twin rockets'],
        ['El yazması, patlayıcı barut için güherçilenin saflaştırılmasını ayrıntılar. İki yan roket tüpü çatallı fitille aynı anda ateşlenir.', 'The treatise details saltpeter purification. Twin lateral rocket tubes are lit simultaneously via a forked fuse train.'],
        'breech', 'portRocket', false
      ],
      [
        ['Kılavuz Çubuklar ve Yön Dümeni', 'Guide poles & rudder fin'],
        ['Arkaya uzanan iki uzun kılavuz çubuğu ve uçtaki dümen yaprağı, torpidonun su üstünde sapmadan ilerlemesine yardım eder.', 'Two long rear guide poles and a stern rudder fin help keep the device tracking straight across the water surface.'],
        'suspension', 'guidePoles', false
      ],
      [
        ['Yan Kızaklar ve Pruva Mahmuzu', 'Lateral skids & barbed spear'],
        ['Yan kızaklar gövdeyi su üstünde dengede tutar; öndeki dikenli mahmuz iğnesi hedef ahşap gemi bordasına saplanmak üzere tasarlanmıştır.', 'Lateral skids steady the hull on the water while the forward barbed spear is designed to lodge into a wooden ship side.'],
        'front', 'spearRam', false
      ],
      [
        ['Ateşleme ve Borda Çarpışması', 'Launch & hull impact'],
        ['Üst tava kapalıyken ateşleme düğmesine basarak torpidonun su oluğu boyunca kayıp temsili gemi bordasına saplanmasını izleyin.', 'With the upper pan closed, press Launch to watch the torpedo skim forward and embed its spear into the target hull.'],
        'iso', 'waterTarget', false
      ]
    ].map(([title, desc, cam, key, cutaway]) => ({
      title: t(...title),
      desc: t(...desc),
      cam,
      part: parts[key],
      cutaway,
      explode: 0,
      sub: 'all'
    }));

    const ui = K.ui({
      cameraPadding: 0.85,
      title: t('HASAN EL-RAMMAH “AL-BAYDA” (~1280)', 'HASAN AL-RAMMAH “AL-BAYDA” (~1280)'),
      sub: t('BnF Arabe 2825 • Mercek gövde • İkiz güherçile roketi', 'BnF Arabe 2825 • Lenticular hull • Twin saltpeter rockets'),
      subsystems: Object.entries(counts).map(([key, count]) => ({ key, label: key, count, color: '#d97706' })),
      camLabels: Object.fromEntries(Object.entries({
        iso: ['Genel Sergi', 'Full exhibit'],
        front: ['Pruva ve Hedef', 'Prow & target'],
        breech: ['Kıç ve Roketler', 'Stern & rockets'],
        engine: ['İç Harç Kesiti', 'Charge cutaway'],
        suspension: ['Kılavuz Çubuklar', 'Guide poles'],
        top: ['Üst Görünüş', 'Top view']
      }).map(([k, v]) => [k, t(...v)])),
      sliders: [
        [['Üst Tavayı Ayır (Kesit)', 'Upper pan cutaway'], 0, 100, '%'],
        [['Roket İtki Gücü', 'Rocket thrust level'], 0, 100, '%'],
        [['Kuyruk Dümen Açısı', 'Stern rudder angle'], -15, 15, '°']
      ].map(([labels, min, max, unit]) => ({
        label: t(...labels),
        min,
        max,
        step: 1,
        fmt: v => Math.round(v) + unit
      })),
      buttons: {
        terrain: t('Su & Hedef Bordayı Göster', 'Show water & target hull'),
        sweep: t('Sergiyi Sıfırla', 'Reset exhibit')
      },
      telemetryTag: t('AL-BAYDA • BNF ARABE 2825', 'AL-BAYDA • BNF ARABE 2825'),
      statLabels: [
        ['KESİT AÇIKLIĞI', 'CUTAWAY LIFT'],
        ['ROKET İTKİSİ', 'THRUST'],
        ['DÜMEN AÇISI', 'RUDDER'],
        ['İLERLEME', 'TRAVEL']
      ].map(v => t(...v))
    });

    sync();

    return {
      root,
      parts,
      ui,
      camPresets,
      tourSteps,
      defaultPart: parts.upperPan,
      firePart: parts.spearRam,
      update(dt) {
        if (state.thrust > 0) state.elapsed += dt;
        if (state.animating) {
          const target = state.launched ? 1 : 0;
          const step = dt * (state.launched ? 1.55 : 2.2);
          if (Math.abs(target - state.travel) <= step) {
            state.travel = target;
            state.animating = false;
          } else {
            state.travel += Math.sign(target - state.travel) * step;
          }
        }
        sync();
      },
      onFire() {
        if (!state.launched && state.open > 5) {
          return { ok: false, msg: t('Üst tava kesiti açıkken fırlatılamaz; önce kesiti kapatın.', 'Close the upper pan cutaway before launching.') };
        }
        if (!state.launched && state.thrust <= 0) {
          return { ok: false, msg: t('Roket itki gücü %0 iken fırlatma yapılamaz.', 'Increase rocket thrust above 0% to launch.') };
        }
        state.launched = !state.launched;
        state.animating = true;
        if (!state.launched) state.travel = 0;
        else state.travel = 1;
        sync();
        return { ok: true };
      },
      fireButtonLabel: () => t(state.launched ? 'BAŞLANGICA AL' : 'ROKETİ ATEŞLE', state.launched ? 'RETURN TO CRADLE' : 'LAUNCH TORPEDO'),
      mobileFireButtonLabel: () => t(state.launched ? 'GERİ AL' : 'ATEŞLE', state.launched ? 'RESET' : 'LAUNCH'),
      onSlider(i, v) {
        if (!Number.isFinite(v)) return {};
        const clamped = T.MathUtils.clamp(v, ui.sliders[i].min, ui.sliders[i].max);
        if (i === 0) state.open = clamped;
        else if (i === 1) state.thrust = clamped;
        else if (i === 2) state.rudder = clamped;
        sync();
        return {};
      },
      onButton(name) {
        if (name === 'terrain') {
          state.showWater = !state.showWater;
          sync();
        } else if (name === 'sweep') {
          reset();
        }
        return {};
      },
      buttonActive: name => name === 'terrain' && state.showWater,
      getSliderValues: () => [state.open, state.thrust, state.rudder],
      getStats: () => [
        Math.round(state.open) + ' <span>%</span>',
        Math.round(state.thrust) + ' <span>%</span>',
        Math.round(state.rudder) + ' <span>°</span>',
        Math.round(state.travel * 100) + ' <span>%</span>'
      ],
      getStatus: () => ({
        text: state.launched
          ? t('MAHMUZ HEDEF BORDAYA SAPLANDI', 'PROW SPEAR EMBEDDED IN HULL')
          : state.thrust === 0
            ? t('ROKET İTKİSİ KAPALI (BEKLEMEDE)', 'ROCKET THRUST IDLE (0%)')
            : t('OLUKTA ATEŞLEMEYE HAZIR', 'READY ON LAUNCH TROUGH'),
        color: state.launched ? '#dc2626' : '#d97706'
      }),
      applyTextures: K.applyTextures,
      setTexture: K.setTexture,
      toggleRelief: K.toggleRelief
    };
  };
})();
