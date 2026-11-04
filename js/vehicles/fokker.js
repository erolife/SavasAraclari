/* =============================================================================
 * 1917 Fokker Dr.I Üç Kanatlı Avcı (Dreidecker) — 3B Araç Modülü (15 Mekanik Grup)
 * Adaptör Kalıbı (window.VehicleBuilders.fokker) — simulator.html ile tam uyumlu.
 *
 * Tarihsel ve Mekanik Doğruluk Özeti (Reinhold Platz / Fokker 1917 & Oberursel Ur.II):
 *  - Üç Kanatlı (Triplane) Konsol Yapı:
 *      • Üst kanat açıklığı: 7,19 m (SEMI_TOP = 3,595 m), Y = +1,14 m, Z = +0,62 m
 *      • Orta kanat açıklığı: 6,23 m (SEMI_MID = 3,115 m), Y = +0,40 m, Z = +0,46 m
 *      • Alt kanat açıklığı: 5,73 m (SEMI_BOT = 2,865 m), Y = -0,34 m, Z = +0,30 m
 *      • Ayrıca iniş takımı dingilini saran 4. küçük "aks kanatçığı" (1,12 × 0,34 m).
 *      • Kalın Göttingen 298 (~%16) konsol kutu kirişli profil sayesinde harici gergi
 *        tellerine ihtiyaç duymaz; kanat uçlarına yakın tekil dikmeler (interplane struts)
 *        üç kanadı birbirine bağlar ve her üç kanada tam temas eder.
 *  - Oberursel Ur.II (110 BG) 9 Silindirli Döner (Rotary) Motor:
 *      • Krank mili gövde yangın perdesine SABİTTİR (dönmez!).
 *      • 9 silindir, karter ve Ø 2,62 m Axial lamine ceviz pervane 1:1 oranla BİRLİKTE DÖNER!
 *  - Fokker "Zentralsteuerung" Senkronizasyon Düzeneği (AÇIK ⇄ KAPALI):
 *      • İkiz 7,92 mm LMG 08/15 "Spandau" makineli tüfekler (X = ±0,18 m, Y = +0,38 m)
 *        dönen pervanenin içinden ateş eder.
 *      • Senkronizasyon AÇIK iken: Kam halkası, pervane palası namlu önünden geçerken
 *        (|Δθ| < 0,22 rad) tetiği kilitler ve mermileri yalnızca iki pala arasından ateşler.
 *      • Senkronizasyon KAPALI iken: Tüfekler rastgele/kesintisiz ateş eder; namlu önünden
 *        geçen pervane palasına mermiler isabet eder (kıvılcım ve ahşap hasarı!).
 * ============================================================================= */

(function () {
  'use strict';

  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.fokker = function buildFokker(ctx) {
    const { THREE, scene, addCADMesh, createPartGroup } = ctx;
    const audio = ctx.audio || null;

    // ------------------------------------------------------------------------
    // ANA ÖLÇÜLER (1 birim = 1 metre; burun +Z, Y yukarı)
    // ------------------------------------------------------------------------
    const SEMI_TOP = 3.595;        // Üst kanat yarı açıklığı (7,19 m / 2)
    const SEMI_MID = 3.115;        // Orta kanat yarı açıklığı (6,23 m / 2)
    const SEMI_BOT = 2.865;        // Alt kanat yarı açıklığı (5,73 m / 2)
    const CHORD = 1.00;            // Kanat veteri (1,00 m)
    const TOP_Y = 1.14, TOP_Z = 0.62;
    const MID_Y = 0.40, MID_Z = 0.46;
    const BOT_Y = -0.34, BOT_Z = 0.30;

    const PROP_R = 1.31;           // Ø 2,62 m Axial iki palli pervane
    const PROP_Z = 2.22;           // Pervane dönüş düzlemi Z koordinatı
    const ENGINE_Z = 1.88;         // Oberursel Ur.II 9 silindirli döner motor merkezi
    const WHEEL_Y = -0.96, WHEEL_Z = 0.88, WHEEL_R = 0.35;
    const SKID_BOTTOM = { y: -0.44, z: -3.28 };

    // Yerde duruş açısı (ana tekerlek alt noktası Y = WHEEL_Y - WHEEL_R = -1,31 m ve kuyruk kızağı Y = -0,44 m)
    const mainBottomY = WHEEL_Y - WHEEL_R;
    const GROUND_PITCH = Math.atan2(SKID_BOTTOM.y - mainBottomY, WHEEL_Z - SKID_BOTTOM.z);
    const GROUND_Y = -(mainBottomY * Math.cos(GROUND_PITCH) + WHEEL_Z * Math.sin(GROUND_PITCH)) + 0.0716;

    const MAX_AMMO = 1000;         // 2 × 500 mermi (7,92×57mm Mauser)
    // Spandau namlu eksenlerinin (X = ±0,18 m, Y = +0,38 m) pervane merkezine (0, 0) göre açıları:
    // Pervane dönüşü: propSpinGrp.rotation.z = θ. Pala 0 (+Y yönünde başlar) yerel +Y eksenindedir:
    //   Dünya X = -r * sin(θ), Dünya Y = r * cos(θ) -> atan2(X, Y) = -θ.
    //   Sağ ve sol namlu izlerinin pervane düzlemindeki açıları:
    const GUN_X = 0.18, GUN_Y = 0.38;
    const GUN_ANGLES = [
      Math.atan2(-GUN_X, GUN_Y),   // Sol namlu (+X = +0.18)
      Math.atan2(GUN_X, GUN_Y)     // Sağ namlu (-X = -0.18)
    ];
    const BLADE_HIT_TOL = 0.22;    // Pala açısal yarı-genişlik toleransı (~12,6°)

    // ------------------------------------------------------------------------
    // AERODİNAMİK YÜZEY ÜRETECİ: Göttingen 298 kalın kesit + yuvarlatılmış uçlu dikdörtgen kanat
    // ------------------------------------------------------------------------
    function airfoilThickness(xc, t) {
      return 5 * t * (0.2969 * Math.sqrt(xc) - 0.1260 * xc - 0.3516 * xc * xc + 0.2843 * xc * xc * xc - 0.1036 * xc * xc * xc * xc);
    }

    function chordAtSpan(s, semi, rootC) {
      const f = Math.abs(s) / semi;
      if (f <= 0.86) return rootC;
      const u = Math.min(1, (f - 0.86) / 0.14);
      return Math.max(0.06, rootC * Math.sqrt(Math.max(0, 1 - u * u * 0.92)));
    }

    function buildTriplaneWingGeo(semi, rootC, tRatio = 0.16, centerCutout = 0) {
      const nS = 36, nC = 14;
      const geos = [];
      [1, -1].forEach(side => {
        const pos = [], uv = [], idx = [];
        for (let i = 0; i <= nS; i++) {
          const s = (-1 + (2 * i) / nS) * semi;
          const c = chordAtSpan(s, semi, rootC);
          const le = 0.35 * c;
          // Orta ve üst kanat arka ortasında pilot görüş/gövde oyuğu
          const cutFactor = centerCutout > 0 && Math.abs(s) < 0.42
            ? 1 - centerCutout * Math.cos((Math.abs(s) / 0.42) * (Math.PI / 2))
            : 1;
          const effC = c * cutFactor;
          for (let j = 0; j <= nC; j++) {
            const xc = (1 - Math.cos((Math.PI * j) / nC)) / 2;
            const yt = airfoilThickness(xc, tRatio) * c;
            // Göttingen 298 hafif üst kamber etkisi
            const camber = 0.025 * c * Math.sin(Math.PI * xc);
            const yVal = camber + (side > 0 ? yt : -yt * 0.65);
            pos.push(s, yVal, le - xc * effC);
            uv.push((s + semi) / (2 * semi), xc);
          }
        }
        for (let i = 0; i < nS; i++) {
          for (let j = 0; j < nC; j++) {
            const a = i * (nC + 1) + j, b = a + nC + 1, c = a + 1, d = b + 1;
            if (side > 0) idx.push(a, b, c, b, d, c);
            else idx.push(a, c, b, b, c, d);
          }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(idx);
        g.computeVertexNormals();
        geos.push(g);
      });
      return { top: geos[0], bottom: geos[1] };
    }

    // ------------------------------------------------------------------------
    // 4 TARİHSEL BOYA ŞEMASI (Prosedürel CanvasTexture — 512×256 Önbellekli)
    // Not: Çoğu Fokker Dr.I fabrikadan zeytin/kahverengi çizgili (Streifentarnung) çıkmıştır!
    // ------------------------------------------------------------------------
    const SCHEMES = {
      streifentarnung1917: {
        btn: '🌿 Fabrika Çizgili (Streifentarnung)',
        label: 'Fokker Fabrika Standart Çizgili Kamuflaj (Streifentarnung — Zeytin Yeşili & Gökyüzü Mavisi)',
        mode: 'streifen', base: '#8a8268', streak1: '#4a5535', streak2: '#5c4832', under: '#8cb8c9', cowl: '#3f492d', wheel: '#4a5535'
      },
      richthofen425: {
        btn: '🩸 Kızıl Baron (Dr.I 425/17)',
        label: 'Manfred von Richthofen ("Kızıl Baron") — Dr.I 425/17 Tam Kırmızı (Nisan 1918)',
        mode: 'solid', base: '#a81c1c', streak1: '#8f1515', streak2: '#b82222', under: '#941818', cowl: '#a81c1c', wheel: '#a81c1c'
      },
      vossF1_103: {
        btn: '💠 Werner Voss (F.I 103/17)',
        label: 'Teğmen Werner Voss — Fokker F.I 103/17 (Sarı/Yeşil Burun Yüzü & Çizgili Gövde, Eylül 1917)',
        mode: 'streifen', base: '#8c866c', streak1: '#465234', streak2: '#564732', under: '#8cb8c9', cowl: '#465234', wheel: '#d4af37'
      },
      rabensJasta18: {
        btn: '🐦‍⬛ Jasta 18 "Raben" (Kırmızı/Beyaz)',
        label: 'Jasta 18 "Staffel Raben" (1918) — Vermilyon Kırmızı Ön Gövde & Kar Beyazı Arka Gövde/Kuyruk',
        mode: 'raben', base: '#f0efe9', streak1: '#b22222', streak2: '#f0efe9', under: '#8cb8c9', cowl: '#b22222', wheel: '#b22222'
      }
    };

    function makeCanvasTex(drawFn, w = 512, h = 256) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const g = c.getContext('2d');
      drawFn(g, w, h);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    }

    function drawStreifentarnung(g, w, h, s) {
      g.fillStyle = s.base;
      g.fillRect(0, 0, w, h);
      if (s.mode === 'solid') {
        // Hafif vernikli keten kumaş ton geçişi
        g.fillStyle = s.streak1;
        for (let i = 0; i < w; i += 32) {
          g.globalAlpha = 0.18;
          g.fillRect(i, 0, 14, h);
        }
        g.globalAlpha = 1.0;
        return;
      }
      if (s.mode === 'raben') {
        g.fillStyle = s.streak1;
        g.fillRect(0, 0, w * 0.48, h);
        g.fillStyle = s.base;
        g.fillRect(w * 0.48, 0, w * 0.52, h);
        return;
      }
      // Tarihsel Fokker diyagonal fırça darbeleri (Streifentarnung)
      for (let i = -h; i < w + h; i += 14) {
        g.strokeStyle = (Math.floor(i / 14) % 2 === 0) ? s.streak1 : s.streak2;
        g.lineWidth = 9;
        g.globalAlpha = 0.68;
        g.beginPath();
        g.moveTo(i, 0);
        g.lineTo(i + h * 0.45, h);
        g.stroke();
      }
      g.globalAlpha = 1.0;
    }

    const schemeTextures = {};
    Object.keys(SCHEMES).forEach(k => {
      const s = SCHEMES[k];
      schemeTextures[k] = {
        top: makeCanvasTex((g, w, h) => drawStreifentarnung(g, w, h, s), 512, 256),
        bottom: makeCanvasTex((g, w, h) => {
          g.fillStyle = s.under;
          g.fillRect(0, 0, w, h);
        }, 256, 128),
        fus: makeCanvasTex((g, w, h) => {
          drawStreifentarnung(g, w, h, s);
          // Alt karın şeridi
          g.fillStyle = s.under;
          g.fillRect(0, h * 0.78, w, h * 0.22);
        }, 512, 256)
      };
    });

    // Keten kumaş & kanat kaburga dikiş kabartması (rib tape bump map)
    const fabricBump = makeCanvasTex((g, w, h) => {
      g.fillStyle = '#808080';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = '#a8a8a8';
      g.lineWidth = 2;
      for (let x = 0; x < w; x += 24) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, h);
        g.stroke();
      }
      g.strokeStyle = '#686868';
      g.lineWidth = 1;
      for (let y = 0; y < h; y += 8) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(w, y);
        g.stroke();
      }
    }, 512, 256);

    // Alman Haçı (Balkenkreuz / Eisernes Kreuz) çıkartma dokusu
    const crossTex = makeCanvasTex((g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.fillStyle = '#f8fafc';
      g.fillRect(w * 0.34, h * 0.08, w * 0.32, h * 0.84);
      g.fillRect(w * 0.08, h * 0.34, w * 0.84, h * 0.32);
      g.fillStyle = '#0f172a';
      g.fillRect(w * 0.39, h * 0.11, w * 0.22, h * 0.78);
      g.fillRect(w * 0.11, h * 0.39, w * 0.78, h * 0.22);
    }, 128, 128);

    // ------------------------------------------------------------------------
    // MALZEMELER
    // ------------------------------------------------------------------------
    const myMeshes = [];
    function makeMat(role, hex, rough, metal, extra = {}) {
      const { isArmor = false, ...opts } = extra;
      const m = new THREE.MeshStandardMaterial({
        color: hex,
        roughness: rough,
        metalness: metal,
        ...opts
      });
      m.userData = { fkRole: role, isArmor };
      return m;
    }

    const matWingTop = makeMat('top', 0xffffff, 0.65, 0.08, {
      map: schemeTextures.streifentarnung1917.top,
      bumpMap: fabricBump,
      bumpScale: 0.015,
      side: THREE.DoubleSide,
      isArmor: true
    });
    const matWingBot = makeMat('bottom', 0xffffff, 0.65, 0.08, {
      map: schemeTextures.streifentarnung1917.bottom,
      bumpMap: fabricBump,
      bumpScale: 0.012,
      side: THREE.DoubleSide,
      isArmor: true
    });
    const matFusSkin = makeMat('fus', 0xffffff, 0.64, 0.08, {
      map: schemeTextures.streifentarnung1917.fus,
      bumpMap: fabricBump,
      bumpScale: 0.014,
      side: THREE.DoubleSide,
      isArmor: true
    });
    const matCowl = makeMat('cowl', 0x3f492d, 0.42, 0.55, { side: THREE.DoubleSide, isArmor: true });
    const matWheelDisc = makeMat('wheel', 0x4a5535, 0.58, 0.15);
    const matWoodSpar = makeMat('wood', 0xb8864b, 0.72, 0.05);
    const matMahoganyProp = makeMat('propWood', 0x5c3214, 0.38, 0.12);
    const matSteelTube = makeMat('steel', 0x333942, 0.45, 0.75);
    const matRotarySteel = makeMat('rotary', 0x282d34, 0.35, 0.85);
    const matChrome = makeMat('chrome', 0xdbe4ee, 0.20, 0.92);
    const matBrass = makeMat('brass', 0xd49b35, 0.28, 0.86);
    const matCopper = makeMat('copper', 0xb8652c, 0.34, 0.82);
    const matGunSteel = makeMat('gun', 0x1c2026, 0.38, 0.82);
    const matRubber = makeMat('rubber', 0x181a1d, 0.88, 0.04);
    const matLeather = makeMat('leather', 0x4a2912, 0.74, 0.06);
    const matCross = new THREE.MeshBasicMaterial({
      map: crossTex,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    function addMesh(parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], castShadow = true) {
      const m = addCADMesh(parent, geo, mat, pos, rot, castShadow);
      myMeshes.push(m);
      return m;
    }

    // ------------------------------------------------------------------------
    // KÖK GRUP VE GÖVDE DURUŞ GRUBU (airframe)
    // ------------------------------------------------------------------------
    const root = new THREE.Group();
    root.name = 'fokker_root';
    root.visible = false;
    scene.add(root);

    const airframe = new THREE.Group();
    airframe.position.y = GROUND_Y;
    airframe.rotation.x = -GROUND_PITCH;
    root.add(airframe);

    // ------------------------------------------------------------------------
    // 15 BAĞIMSIZ MEKANİK PARÇA GRUBU (5 Alt Sistem)
    // ------------------------------------------------------------------------

    // === A. OBERURSEL Ur.II DÖNER MOTOR & PERVANE (rotary_engine — 4 Grup) ===
    // 1. Axial Ø 2,62 m İki Palli Lamine Ceviz Pervane
    const partPropeller = createPartGroup({
      id: 'fk_propeller',
      name: '1. Axial Ø 2,62 m Lamine Ceviz Pervane & Göbek Flanşı',
      subsystem: 'rotary_engine',
      subLabel: 'Oberursel Döner Motor & Pervane',
      desc: 'Oberursel Ur.II döner motorunun ön karter flanşına doğrudan cıvatalanmış 2,62 m çapında lamine ceviz/dişbudak "Axial" pervane. Senkronizasyon kapatıldığında Spandau mermilerinin vurduğu parça budur!',
      material: 'Lamine Ceviz & Dişbudak Ağacı, Çelik Göbek',
      weight: '~14 kg',
      spec: 'Ø 2,62 m • 1:1 Döner Karter Tahrikli',
      location: 'Burun Önü (Z = +2,22 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.25, 2.35],
      isOuterShell: false
    });
    airframe.add(partPropeller);

    // 2. Oberursel Ur.II 110 BG 9 Silindirli Döner (Rotary) Motor Bloğu
    const partRotaryBlock = createPartGroup({
      id: 'fk_rotary_block',
      name: '2. Oberursel Ur.II 110 BG Döner Karter & 9 Silindir Bloğu',
      subsystem: 'rotary_engine',
      subLabel: 'Oberursel Döner Motor & Pervane',
      desc: 'Le Rhône 9J üzerinden geliştirilen 9 silindirli hava soğutmalı DÖNER (rotary) motor. Klasik yıldız motorların aksine krank mili sabittir; 9 dökme demir silindir ve çelik karterin tamamı pervaneyle birlikte dakikada 1.200 devirle döner! Böylece uçak yerde dururken bile silindirler kendi hava akımıyla soğur.',
      material: 'İşlenmiş Çelik Karter, Soğutma Kanatçıklı Dökme Silindirler & Bakır Emme Boruları',
      weight: '~140 kg',
      spec: '9 Silindir Döner (Rotary) • 110 BG @ 1200 RPM • 15,1 Litre',
      location: 'Kaporta İçi (Z = +1,88 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.95, 1.55],
      isOuterShell: false
    });
    airframe.add(partRotaryBlock);

    // 3. Sabit İçi Boş Krank Mili, Arka Motor Yatağı & Karbüratör Girişi
    const partFixedCrank = createPartGroup({
      id: 'fk_fixed_crank',
      name: '3. Sabit İçi Boş Krank Mili (Stationary Crankshaft) & Motor Yatağı',
      subsystem: 'rotary_engine',
      subLabel: 'Oberursel Döner Motor & Pervane',
      desc: 'Döner motorun sırrı: Gövde çelik boru kafesine sıkıca sabitlenmiş ve HİÇ DÖNMEYEN içi boş krank mili! Benzin-hava karışımı ve hint yağı (castor oil) bu sabit krank milinin içinden geçerek dönen kartere ulaşır.',
      material: 'Krom-Nikel Dövme Çelik & Pirinç Karbüratör',
      weight: '~32 kg',
      spec: 'Gövdeye Sabit Krank • Eksantrik Krank Muylusu',
      location: 'Yangın Perdesi Önü (Z = +1,45..+1,88 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.55, 0.85],
      isOuterShell: false
    });
    airframe.add(partFixedCrank);

    // 4. Alüminyum At Nalı Motor Kaportası (X-Ray Dış Kabuk)
    const partCowling = createPartGroup({
      id: 'fk_cowling',
      name: '4. Alüminyum At Nalı Motor Kaportası (X-Ray Dış Kabuk)',
      subsystem: 'rotary_engine',
      subLabel: 'Oberursel Döner Motor & Pervane',
      desc: 'Dönen 9 silindiri ve etrafa saçılan sıcak hint yağını pilote karşı perdeleyen, alt kısmı soğutma havası ve egzoz çıkışı için açık bırakılmış alüminyum burun kaportası. X-Ray modunda saydamlaşır.',
      material: 'Preslenmiş Alüminyum Levha',
      weight: '~9,5 kg',
      spec: 'Ø 1,06 m • Alt Hava/Yağ Tahliye Açıklığı',
      location: 'Burun (Z = +1,58..+2,10 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.85, 1.95],
      isOuterShell: true
    });
    airframe.add(partCowling);

    // === B. SENKRONİZASYON & SPANDAU SİLAHLARI (sync_weapons — 3 Grup) ===
    // 5. Fokker "Zentralsteuerung" Senkronizasyon Kam Halkası & İtici Çubuklar
    const partSyncGear = createPartGroup({
      id: 'fk_sync_gear',
      name: '5. Fokker "Zentralsteuerung" Senkronizasyon Kamı & İtici Çubuklar',
      subsystem: 'sync_weapons',
      subLabel: 'Senkronizasyon & Spandau MG',
      desc: 'Anthony Fokker ekibinin hava savaşını değiştiren buluşu: Dönen motorun arkasındaki kam halkası, pervane palası namlu önünden geçerken dikey itici çubuklarla (pushrods) Spandau tetiğini kilitler; pala geçer geçmez ateşleme darbesi gönderir.',
      material: 'Sertleştirilmiş Çelik Kam, Pirinç Mafsal & İtici Çubuklar',
      weight: '~6,8 kg',
      spec: 'Mekanik Kam-İtici Senkronizasyon (AÇIK ⇄ KAPALI)',
      location: 'Motor Arkası → Tüfek Kuyruğu (Z = +0,65..+1,72 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 2.25, 0.75],
      isOuterShell: false
    });
    airframe.add(partSyncGear);

    // 6. İkiz 7,92 mm LMG 08/15 "Spandau" Makineli Tüfekler
    const partSpandauGuns = createPartGroup({
      id: 'fk_spandau_guns',
      name: '6. İkiz 7,92 mm LMG 08/15 "Spandau" Hava Soğutmalı Makineli Tüfekler',
      subsystem: 'sync_weapons',
      subLabel: 'Senkronizasyon & Spandau MG',
      desc: 'Pilotun hemen önünde, üst gövde üzerinde yan yana duran iki adet 7,92×57mm LMG 08/15 "Spandau" makineli tüfek. Hava akımıyla soğuması için namlu ceketleri oluklu deliklidir. Tutukluk durumunda pilotun elinin altında kurma kolları bulunur.',
      material: 'Maviye Çalınmış Silah Çeliği (Delikli Soğutma Ceketli)',
      weight: '2 × 13 kg',
      spec: '2 × 7,92 mm • ~450 Atım/dk (Senkronize)',
      location: 'Kokpit Önü Üst Gövde (X = ±0,18 m, Y = +0,38 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 2.55, 0.25],
      isOuterShell: false
    });
    airframe.add(partSpandauGuns);

    // 7. Alüminyum Mühimmat Sandıkları & Boş Kovan Olukları (2 × 500 Mermi)
    const partAmmoBoxes = createPartGroup({
      id: 'fk_ammo_boxes',
      name: '7. Alüminyum Mühimmat Sandıkları & Şerit Besleme Olukları (1.000 Mermi)',
      subsystem: 'sync_weapons',
      subLabel: 'Senkronizasyon & Spandau MG',
      desc: 'Orta kanat kirişinin hemen önünde yer alan, her bir Spandau tüfeği için 500\'er adet 7,92 mm mermi şeridi barındıran ikiz alüminyum mühimmat sandığı ve boş bez şerit sarma tamburları.',
      material: 'Alüminyum Sandık & Pirinç Mermi Şeridi',
      weight: '~38 kg (Dolu)',
      spec: '2 × 500 = 1.000 Adet 7,92×57mm Mermi',
      location: 'Üst-Ön Gövde İçi (Z = +0,85 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.95, 0.35],
      isOuterShell: false
    });
    airframe.add(partAmmoBoxes);

    // === C. ÜÇ KANAT (TRIPLANE) & KUTU KİRİŞLER (triplane_wings — 3 Grup) ===
    // 8. Üst, Orta ve Alt Kanat Kumaş Kaplaması (X-Ray Dış Kabuk)
    const partWingsSkin = createPartGroup({
      id: 'fk_wings_skin',
      name: '8. Üç Kanat (Triplane) Vernikli Keten Kumaş Kaplaması (X-Ray Dış Kabuk)',
      subsystem: 'triplane_wings',
      subLabel: 'Üç Kanat & Kutu Kiriş İskeleti',
      desc: 'Fokker Dr.I\'e olağanüstü tırmanma hızı ve dar dönüş kabiliyeti kazandıran üç kademeli (Üst 7,19 m, Orta 6,23 m, Alt 5,73 m) kanat kaplaması. Kalın Göttingen 298 profili yüksek kaldırma kuvveti üretir. X-Ray modunda saydamlaşarak iç ahşap kutu kirişleri ve kaburgaları gösterir.',
      material: 'Vernikli (Doped) Keten Kumaş',
      weight: '~65 kg (Kumaş Kaplama)',
      spec: 'Kanat Alanı 18,7 m² • Üst/Orta/Alt Kademeli Triplane',
      location: 'Üst (+1,14 m), Orta (+0,40 m), Alt (-0,34 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.75, -0.25],
      isOuterShell: true
    });
    airframe.add(partWingsSkin);

    // 9. Kalın Konsol Ahşap Kutu Kirişler (Box Spars) & Huş Kontrplak Kaburgalar
    const partWingsSpars = createPartGroup({
      id: 'fk_wings_spars',
      name: '9. Konsol Ahşap Kutu Kirişler (Cantilever Box Spars) & Kontrplak Kaburgalar',
      subsystem: 'triplane_wings',
      subLabel: 'Üç Kanat & Kutu Kiriş İskeleti',
      desc: 'Reinhold Platz\'ın devrimci yapısal tasarımı: Her kanadın içinde boydan boya uzanan kalın çam/kontrplak kutu kiriş (box spar) ve sık dizilmiş huş ağacı kaburgalar. Bu güçlü iç kiriş sayesinde kanatlar arasında sürükleme yaratan çelik gergi tellerine ihtiyaç kalmamıştır.',
      material: 'Lamine Ladin/Çam Kutu Kiriş & Huş Kontrplak Kaburga',
      weight: '~95 kg',
      spec: '3 × Tam Açıklık Kutu Kiriş + 38 Kontrplak Kaburga',
      location: 'Üst, Orta ve Alt Kanat İçi',
      basePos: [0, 0, 0],
      explodeVec: [0, -1.65, 0.35],
      isOuterShell: false
    });
    airframe.add(partWingsSpars);

    // 10. Kanatlar Arası Tekil Dikmeler (Interplane Struts) & Kabin Payandaları
    const partInterplaneStruts = createPartGroup({
      id: 'fk_interplane_struts',
      name: '10. Kanatlar Arası Aerodinamik Dikmeler & Kabin Payandaları',
      subsystem: 'triplane_wings',
      subLabel: 'Üç Kanat & Kutu Kiriş İskeleti',
      desc: 'Kanat uçlarına yakın (X = ±2,22 m) konumda alt kanattan orta kanadın içinden geçerek üst kanada bağlanan aerodinamik damla kesitli tekil dikmeler ve üst kanadı gövdeye bağlayan ters-V çelik kabin payandaları (cabane struts).',
      material: 'Damla Kesitli Çelik Boru & Ahşap Kaplama',
      weight: '~22 kg',
      spec: '2 × Dış Kanat Dikmesi + 4 × Kabin Payandası',
      location: 'X = ±2,22 m & Kokpit Önü',
      basePos: [0, 0, 0],
      explodeVec: [1.55, 0.45, 0],
      isOuterShell: false
    });
    airframe.add(partInterplaneStruts);

    // === D. ÇELİK BORU GÖVDE & KOKPİT (fuselage_cockpit — 3 Grup) ===
    // 11. Kumaş Gövde Kaplaması & Haç İşaretleri (X-Ray Dış Kabuk)
    const partFuselageSkin = createPartGroup({
      id: 'fk_fuselage_skin',
      name: '11. Gövde Keten Kumaş Kaplaması & Balkenkreuz İşaretleri (X-Ray)',
      subsystem: 'fuselage_cockpit',
      subLabel: 'Çelik Boru Gövde & Kokpit',
      desc: 'Kaynaklı çelik boru gövde kafesinin üzerine gerilmiş vernikli keten kumaş kaplama ve yan haç işaretleri. X-Ray modunda saydamlaşarak iç çelik kafesi, kokpiti ve yakıt/hint yağı tankını ortaya çıkarır.',
      material: 'Vernikli Keten Kumaş & Yan Kaporta Panelleri',
      weight: '~28 kg',
      spec: 'Gövde Boyu 5,77 m • Kare-Üçgen Kesit',
      location: 'Merkez Gövde (Z = -3,35..+1,58 m)',
      basePos: [0, 0, 0],
      explodeVec: [-1.75, 0.65, -0.45],
      isOuterShell: true
    });
    airframe.add(partFuselageSkin);

    // 12. Kaynaklı Çelik Boru Gövde Kafesi (Steel-Tube Truss) & Kokpit
    const partSteelTruss = createPartGroup({
      id: 'fk_steel_truss',
      name: '12. Kaynaklı Çelik Boru Gövde Kafesi (Truss), Kokpit, Lövye & Koltuk',
      subsystem: 'fuselage_cockpit',
      subLabel: 'Çelik Boru Gövde & Kokpit',
      desc: 'Dönemin ahşap gövdeli Müttefik uçaklarından farklı olarak Fokker\'in imzası olan oksi-asetilen kaynaklı dikişsiz çelik boru kafes gövde, alüminyum pilot koltuğu, çift tetikli lövye (steuerknüppel) ve istikamet pedalları.',
      material: 'Kaynaklı Çelik Boru Kafes, Alüminyum Koltuk & Deri Yastık',
      weight: '~74 kg',
      spec: 'Oksi-Asetilen Kaynaklı Çelik Boru İskelet',
      location: 'Gövde İçi (Z = -3,35..+1,58 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, -1.35, -0.85],
      isOuterShell: false
    });
    airframe.add(partSteelTruss);

    // 13. Ön Benzin ve Hint Yağı (Castor Oil) Birleşik Tankı
    const partFuelCastor = createPartGroup({
      id: 'fk_fuel_castor',
      name: '13. Ön Benzin (70 L) ve Hint Yağı / Castor Oil (20 L) Tankı',
      subsystem: 'fuselage_cockpit',
      subLabel: 'Çelik Boru Gövde & Kokpit',
      desc: 'Döner motorlarda karterin içinde benzin-hava karışımı dolaştığı için normal madeni yağ benzinle çözünürdü; bu nedenle benzinle karışmayan bitkisel HİNT YAĞI (castor oil) kullanılırdı! Yağ devridaim yapmaz, yanmadan silindirlerden dışarı atılırdı.',
      material: 'Pirinç ve Kalaylı Sac Birleşik Tank',
      weight: '~78 kg (Dolu)',
      spec: '70 L Benzin + 20 L Saf Hint Yağı ( ~1,5 Saat Uçuş)',
      location: 'Yangın Perdesi Arkası (Z = +1,05 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.45, 0.25],
      isOuterShell: false
    });
    airframe.add(partFuelCastor);

    // === E. KUMANDA YÜZEYLERİ & AKS KANATÇIKLI İNİŞ TAKIMI (controls_gear — 2 Grup) ===
    // 14. Boynuz Dengeli Kanatçıklar, İrtifa Dümeni & Tam Hareketli İstikamet Dümeni
    const partControlSurfaces = createPartGroup({
      id: 'fk_control_surfaces',
      name: '14. Boynuz Dengeli Kanatçıklar, İrtifa & Virgül İstikamet Dümeni',
      subsystem: 'controls_gear',
      subLabel: 'Kumanda Yüzeyleri & İniş Takımı',
      desc: 'Yalnızca üst kanatta bulunan aerodinamik boynuz dengeli kanatçıklar (ailerons), üçgen yatay stabilize arkasındaki irtifa dümeni ve sabit dikey yüzeyi olmayan tam hareketli "virgül" istikamet dümeni.',
      material: 'İnce Çelik Boru Çerçeve & Keten Kumaş Kaplama',
      weight: '~24 kg',
      spec: 'Boynuz Dengeli Aileron (±20°) + Tam Döner Rudder (±25°)',
      location: 'Üst Kanat Uçları & Kuyruk (Z = -3,45 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.65, -2.15],
      isOuterShell: false
    });
    airframe.add(partControlSurfaces);

    // 15. Aerodinamik Aks Kanatçıklı (Axle Sub-wing) Ana İniş Takımı & Kuyruk Kızağı
    const partLandingGear = createPartGroup({
      id: 'fk_landing_gear',
      name: '15. Aerodinamik Aks Kanatçıklı Ana İniş Takımı & Kuyruk Kızağı',
      subsystem: 'controls_gear',
      subLabel: 'Kumanda Yüzeyleri & İniş Takımı',
      desc: 'İki ana tekerleğin dingilini saran ve uçağa neredeyse "dördüncü bir küçük kanat" gibi ek kaldırma kuvveti sağlayan 1,12 m açıklıklı aks kaporta kanatçığı (axle fairing), V-dikmeleri ve dişbudak kuyruk kızağı.',
      material: 'Çelik V-Dikme, Kontrplak Aks Kanatçığı & Kauçuk Lastik',
      weight: '~42 kg',
      spec: '1,12 × 0,34 m Aks Kanatçığı + Ø 0,70 m Tekerlekler',
      location: 'Gövde Altı (Z = +0,88 m) & Kuyruk (-3,32 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, -1.85, 0.55],
      isOuterShell: false
    });
    airframe.add(partLandingGear);

    // ------------------------------------------------------------------------
    // GEOMETRİ İNŞASI
    // ------------------------------------------------------------------------

    // --- 1. Axial Ø 2,62 m İki Palli Lamine Ceviz Pervane (partPropeller) ---
    const propSpinGrp = new THREE.Group();
    propSpinGrp.position.set(0, 0, PROP_Z);
    partPropeller.add(propSpinGrp);

    // Pervane çelik göbek flanşı ve 8 cıvata
    addMesh(propSpinGrp, new THREE.CylinderGeometry(0.14, 0.14, 0.10, 16), matSteelTube, [0, 0, 0], [Math.PI / 2, 0, 0]);
    addMesh(propSpinGrp, new THREE.CylinderGeometry(0.055, 0.055, 0.14, 12), matChrome, [0, 0, 0.02], [Math.PI / 2, 0, 0]);

    // 2 lamine ceviz pala (Pala 0: +Y, Pala 1: -Y)
    const propBladeMeshes = [];
    for (let b = 0; b < 2; b++) {
      const bladeGrp = new THREE.Group();
      bladeGrp.rotation.z = b * Math.PI;
      propSpinGrp.add(bladeGrp);
      const bladeGeo = new THREE.BoxGeometry(0.21, PROP_R - 0.12, 0.042);
      const bm = addMesh(
        bladeGrp,
        bladeGeo,
        matMahoganyProp,
        [0, 0.12 + (PROP_R - 0.12) * 0.5, 0],
        [0, 0.34, 0]
      );
      // Pirinç hücum kenarı uç kaplaması
      addMesh(
        bladeGrp,
        new THREE.BoxGeometry(0.215, 0.14, 0.045),
        matBrass,
        [0, PROP_R - 0.07, 0],
        [0, 0.34, 0]
      );
      propBladeMeshes.push(bm);
    }

    // Yüksek devir yarı-saydam pervane diski
    const propBlurDisc = new THREE.Mesh(
      new THREE.CircleGeometry(PROP_R, 36),
      new THREE.MeshBasicMaterial({ color: 0x3a2614, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
    );
    propBlurDisc.position.set(0, 0, PROP_Z + 0.01);
    partPropeller.add(propBlurDisc);

    // --- 2. Oberursel Ur.II 9 Silindirli Döner (Rotary) Motor (partRotaryBlock) ---
    // Pervaneyle 1:1 BİRLİKTE DÖNEN ana motor grubu!
    const rotarySpinGrp = new THREE.Group();
    rotarySpinGrp.position.set(0, 0, ENGINE_Z);
    partRotaryBlock.add(rotarySpinGrp);

    // Dönen çelik karter (crankcase) ve ön pervane burun mili
    addMesh(rotarySpinGrp, new THREE.CylinderGeometry(0.20, 0.20, 0.26, 18), matRotarySteel, [0, 0, 0], [Math.PI / 2, 0, 0]);
    addMesh(rotarySpinGrp, new THREE.CylinderGeometry(0.065, 0.085, 0.36, 14), matRotarySteel, [0, 0, 0.22], [Math.PI / 2, 0, 0]);

    // 9 adet radyal dökme demir silindir, soğutma kanatçıkları, bakır emme boruları ve külbütör kolları
    const cylBarrelGeo = new THREE.CylinderGeometry(0.062, 0.058, 0.26, 12);
    const cylFinsGeo = new THREE.CylinderGeometry(0.078, 0.074, 0.18, 12);
    const intakePipeGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.28, 8);
    const pushrodTubeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.26, 6);
    const sparkPlugGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.05, 6);

    for (let c = 0; c < 9; c++) {
      const a = (c / 9) * Math.PI * 2;
      const cylRadialGrp = new THREE.Group();
      cylRadialGrp.rotation.z = a;
      rotarySpinGrp.add(cylRadialGrp);

      // Silindir gövdesi ve soğutma kanatçıkları (Y = +0.20 .. +0.46 m)
      addMesh(cylRadialGrp, cylBarrelGeo, matRotarySteel, [0, 0.33, 0]);
      addMesh(cylRadialGrp, cylFinsGeo, matRotarySteel, [0, 0.35, 0]);
      // Üst supap yuvası ve buji
      addMesh(cylRadialGrp, new THREE.BoxGeometry(0.065, 0.045, 0.065), matChrome, [0, 0.47, 0]);
      addMesh(cylRadialGrp, sparkPlugGeo, matBrass, [0.03, 0.45, 0.04], [0.4, 0, -0.4]);
      // Karterden silindir başına uzanan parlak bakır yakıt-hava emme borusu (Le Rhône / Oberursel imzası)
      addMesh(cylRadialGrp, intakePipeGeo, matCopper, [0.042, 0.33, -0.04], [0, 0, -0.14]);
      // Supap itici çubuğu
      addMesh(cylRadialGrp, pushrodTubeGeo, matChrome, [-0.038, 0.33, 0.03], [0, 0, 0.10]);
    }

    // --- 3. Sabit İçi Boş Krank Mili & Arka Motor Yatağı (partFixedCrank) ---
    // Gövdeye SABİTTİR (rotarySpinGrp içinde DEĞİLDİR — hiç dönmez!)
    addMesh(partFixedCrank, new THREE.CylinderGeometry(0.048, 0.048, 0.52, 12), matChrome, [0, 0, 1.66], [Math.PI / 2, 0, 0]);
    // Arka çelik motor tespit plakası (bearer plate) ve 4 çelik boru motor dikmesi
    addMesh(partFixedCrank, new THREE.CylinderGeometry(0.24, 0.24, 0.03, 18), matSteelTube, [0, 0, 1.56], [Math.PI / 2, 0, 0]);
    const bearerStrutGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.42, 8);
    [[-0.22, 0.22], [0.22, 0.22], [-0.22, -0.22], [0.22, -0.22]].forEach(([bx, by]) => {
      addMesh(partFixedCrank, bearerStrutGeo, matSteelTube, [bx, by, 1.44], [Math.PI / 2 + by * 0.6, 0, -bx * 0.6]);
    });
    // Krank mili arkasına bağlı sabit pirinç blok karbüratör ve gaz kelebeği sürgüsü
    addMesh(partFixedCrank, new THREE.BoxGeometry(0.14, 0.16, 0.14), matBrass, [0, -0.06, 1.38]);

    // --- 4. Alüminyum At Nalı Motor Kaportası (partCowling — X-Ray Dış Kabuk) ---
    // Alt kısmı (~75° açıklık) sıcak hava ve hint yağı tahliyesi için kesik silindirik kaporta + ön dudak
    const cowlCylGeo = new THREE.CylinderGeometry(0.53, 0.53, 0.44, 28, 1, true, -Math.PI * 0.78, Math.PI * 1.56);
    addMesh(partCowling, cowlCylGeo, matCowl, [0, 0, 1.88], [Math.PI / 2, Math.PI, 0]);
    const cowlFrontLipGeo = new THREE.RingGeometry(0.36, 0.53, 28, 1, Math.PI * 0.5 - Math.PI * 0.78, Math.PI * 1.56);
    addMesh(partCowling, cowlFrontLipGeo, matCowl, [0, 0, 2.10]);

    // --- 5. Fokker "Zentralsteuerung" Senkronizasyon Kamı & İtici Çubuklar (partSyncGear) ---
    const syncCamRingMesh = addMesh(
      partSyncGear,
      new THREE.TorusGeometry(0.15, 0.022, 10, 24),
      matBrass,
      [0, 0, 1.71]
    );
    const syncPlungerRods = [];
    const syncRodGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.92, 8);
    [-1, 1].forEach(side => {
      const rx = side * GUN_X;
      // Kam halkasından yukarı/geriye Spandau tetik kutusuna uzanan hareketli itici çubuk (pushrod)
      const rodGrp = new THREE.Group();
      rodGrp.position.set(rx, 0.21, 1.24);
      partSyncGear.add(rodGrp);
      addMesh(rodGrp, syncRodGeo, matChrome, [0, 0, 0], [Math.PI / 2 - 0.34, 0, 0]);
      addMesh(rodGrp, new THREE.BoxGeometry(0.05, 0.06, 0.08), matBrass, [0, 0.16, -0.42]);
      syncPlungerRods.push(rodGrp);
    });

    // --- 6. İkiz 7,92 mm LMG 08/15 "Spandau" Makineli Tüfekler (partSpandauGuns) ---
    const spandauMuzzles = [];
    const flashGeo = new THREE.ConeGeometry(0.055, 0.32, 8);
    [-1, 1].forEach(side => {
      const gx = side * GUN_X;
      // Tüfek gövdesi (receiver)
      addMesh(partSpandauGuns, new THREE.BoxGeometry(0.065, 0.09, 0.48), matGunSteel, [gx, GUN_Y, 0.72]);
      // Delikli hava soğutma ceketi (slotted water-jacket conversion)
      addMesh(partSpandauGuns, new THREE.CylinderGeometry(0.038, 0.038, 0.68, 12), matGunSteel, [gx, GUN_Y + 0.01, 1.28], [Math.PI / 2, 0, 0]);
      // Namlu ve geri tepme güçlendirici ağızlık (muzzle booster)
      addMesh(partSpandauGuns, new THREE.CylinderGeometry(0.016, 0.022, 0.20, 10), matChrome, [gx, GUN_Y + 0.01, 1.68], [Math.PI / 2, 0, 0]);
      // Soğutma ceketi üzerindeki pirinç nişangâh ve kurma kolu
      addMesh(partSpandauGuns, new THREE.BoxGeometry(0.015, 0.05, 0.04), matBrass, [gx, GUN_Y + 0.06, 1.54]);

      const fl = new THREE.Mesh(
        flashGeo,
        new THREE.MeshBasicMaterial({ color: 0xffb703, transparent: true, opacity: 0, depthWrite: false })
      );
      fl.rotation.x = Math.PI / 2;
      fl.position.set(gx, GUN_Y + 0.01, 1.92);
      partSpandauGuns.add(fl);
      spandauMuzzles.push({ side, x: gx, y: GUN_Y + 0.01, z: 1.82, fl, angleOnProp: Math.atan2(-gx, GUN_Y + 0.01) });
    });

    // --- 7. Alüminyum Mühimmat Sandıkları & Şerit Olukları (partAmmoBoxes) ---
    addMesh(partAmmoBoxes, new THREE.BoxGeometry(0.56, 0.28, 0.32), matChrome, [0, 0.16, 0.96]);
    [-GUN_X, GUN_X].forEach(ax => {
      addMesh(partAmmoBoxes, new THREE.BoxGeometry(0.08, 0.18, 0.14), matBrass, [ax * 1.15, 0.28, 0.92]);
      addMesh(partAmmoBoxes, new THREE.CylinderGeometry(0.08, 0.08, 0.09, 12), matSteelTube, [ax * 1.25, 0.12, 0.72], [0, 0, Math.PI / 2]);
    });

    // --- 8. Üç Kanat (Triplane) Kumaş Kaplaması (partWingsSkin — X-Ray Dış Kabuk) ---
    const topWingGeo = buildTriplaneWingGeo(SEMI_TOP, CHORD, 0.16, 0.28);
    const midWingGeo = buildTriplaneWingGeo(SEMI_MID, CHORD, 0.16, 0.32);
    const botWingGeo = buildTriplaneWingGeo(SEMI_BOT, CHORD, 0.16, 0.0);

    const topWingGrp = new THREE.Group();
    topWingGrp.position.set(0, TOP_Y, TOP_Z);
    partWingsSkin.add(topWingGrp);
    addMesh(topWingGrp, topWingGeo.top, matWingTop);
    addMesh(topWingGrp, topWingGeo.bottom, matWingBot);

    const midWingGrp = new THREE.Group();
    midWingGrp.position.set(0, MID_Y, MID_Z);
    partWingsSkin.add(midWingGrp);
    addMesh(midWingGrp, midWingGeo.top, matWingTop);
    addMesh(midWingGrp, midWingGeo.bottom, matWingBot);

    const botWingGrp = new THREE.Group();
    botWingGrp.position.set(0, BOT_Y, BOT_Z);
    partWingsSkin.add(botWingGrp);
    addMesh(botWingGrp, botWingGeo.top, matWingTop);
    addMesh(botWingGrp, botWingGeo.bottom, matWingBot);

    // Üst kanat üst yüzeyi ve alt kanat alt yüzeyinde Alman Haçları (Balkenkreuz)
    [-2.65, 2.65].forEach(cx => {
      addMesh(topWingGrp, new THREE.PlaneGeometry(0.68, 0.68), matCross, [cx, 0.105, -0.15], [-Math.PI / 2, 0, 0], false);
    });
    [-2.05, 2.05].forEach(cx => {
      addMesh(botWingGrp, new THREE.PlaneGeometry(0.58, 0.58), matCross, [cx, -0.065, -0.15], [Math.PI / 2, 0, 0], false);
    });

    // --- 9. Kalın Konsol Ahşap Kutu Kirişler & Kontrplak Kaburgalar (partWingsSpars) ---
    [
      { semi: SEMI_TOP, y: TOP_Y, z: TOP_Z, nRibs: 14 },
      { semi: SEMI_MID, y: MID_Y, z: MID_Z, nRibs: 12 },
      { semi: SEMI_BOT, y: BOT_Y, z: BOT_Z, nRibs: 10 }
    ].forEach(w => {
      // Tam açıklık lamine ahşap kutu kiriş (cantilever box spar)
      addMesh(
        partWingsSpars,
        new THREE.BoxGeometry(w.semi * 1.92, 0.095, 0.16),
        matWoodSpar,
        [0, w.y + 0.015, w.z + 0.02]
      );
      // Kontrplak kanat kaburgaları (ribs)
      for (let r = -w.nRibs; r <= w.nRibs; r++) {
        if (r === 0) continue;
        const sx = (r / w.nRibs) * (w.semi * 0.92);
        const c = chordAtSpan(sx, w.semi, CHORD);
        addMesh(
          partWingsSpars,
          new THREE.BoxGeometry(0.014, 0.088, c * 0.86),
          matWoodSpar,
          [sx, w.y + 0.012, w.z - 0.12 * c]
        );
      }
    });

    // --- 10. Kanatlar Arası Tekil Dikmeler & Kabin Payandaları (partInterplaneStruts) ---
    // Kanatlar arası dış dikmeler (X = ±2.22 m): Alt kanat (Y=-0.34, Z=0.30) -> Orta (Y=0.40, Z=0.46) -> Üst (Y=1.14, Z=0.62)
    // Dikme eğimi: ΔY = 1.48 m, ΔZ = +0.32 m -> uzunluk = 1.514 m, X ekseni etrafında eğim = atan2(0.32, 1.48) ≈ +0.213 rad!
    // Böylece dikme hem alt, hem orta, hem üst kanat kirişinin tam içinden geçer (havada kalmaz!).
    const interStrutDy = TOP_Y - BOT_Y;
    const interStrutDz = TOP_Z - BOT_Z;
    const interStrutLen = Math.hypot(interStrutDy, interStrutDz) + 0.04;
    const interStrutPitch = Math.atan2(interStrutDz, interStrutDy);
    const interStrutGeo = new THREE.BoxGeometry(0.032, interStrutLen, 0.095);

    [-2.22, 2.22].forEach(sx => {
      addMesh(
        partInterplaneStruts,
        interStrutGeo,
        matWoodSpar,
        [sx, (TOP_Y + BOT_Y) * 0.5, (TOP_Z + BOT_Z) * 0.5],
        [interStrutPitch, 0, 0]
      );
    });

    // Gövdeden üst kanada uzanan 4 adet çelik kabin payandası (cabane struts)
    const cabaneGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.86, 8);
    [-1, 1].forEach(side => {
      // Ön kabin payandası
      addMesh(
        partInterplaneStruts,
        cabaneGeo,
        matSteelTube,
        [side * 0.42, 0.76, 0.82],
        [-0.22, 0, side * 0.18]
      );
      // Arka kabin payandası
      addMesh(
        partInterplaneStruts,
        cabaneGeo,
        matSteelTube,
        [side * 0.42, 0.76, 0.42],
        [0.26, 0, side * 0.18]
      );
    });

    // --- 11. Gövde Keten Kumaş Kaplaması & Haç İşaretleri (partFuselageSkin — X-Ray) ---
    // Fokker Dr.I gövdesi önde kare/oval (Z = +1.58 m), arkada dikey bıçak kenarına (Z = -3.35 m) daralan 5 bölümlü prizmatik kaplamadır.
    const fusSegments = [
      { z0: 0.55, z1: 1.58, w0: 0.72, h0: 0.76, w1: 0.78, h1: 0.82, y0: 0.02, y1: 0.02 },
      { z0: -0.45, z1: 0.55, w0: 0.64, h0: 0.68, w1: 0.72, h1: 0.76, y0: 0.02, y1: 0.02 },
      { z0: -1.55, z1: -0.45, w0: 0.46, h0: 0.54, w1: 0.64, h1: 0.68, y0: 0.03, y1: 0.02 },
      { z0: -2.55, z1: -1.55, w0: 0.26, h0: 0.40, w1: 0.46, h1: 0.54, y0: 0.04, y1: 0.03 },
      { z0: -3.35, z1: -2.55, w0: 0.08, h0: 0.28, w1: 0.26, h1: 0.40, y0: 0.05, y1: 0.04 }
    ];
    fusSegments.forEach(seg => {
      const dz = seg.z1 - seg.z0;
      const zm = (seg.z0 + seg.z1) * 0.5;
      const ym = (seg.y0 + seg.y1) * 0.5;
      const wm = (seg.w0 + seg.w1) * 0.5;
      const hm = (seg.h0 + seg.h1) * 0.5;
      addMesh(partFuselageSkin, new THREE.BoxGeometry(wm, hm, dz + 0.01), matFusSkin, [0, ym, zm]);
    });
    // Üst gövde kaplumbağa sırtı (turtledeck) ve kokpit deri kenarlığı
    addMesh(partFuselageSkin, new THREE.CylinderGeometry(0.16, 0.34, 1.95, 12, 1, false, -Math.PI * 0.5, Math.PI), matFusSkin, [0, 0.34, -0.95], [Math.PI / 2, 0, 0]);
    addMesh(partFuselageSkin, new THREE.TorusGeometry(0.28, 0.032, 8, 20), matLeather, [0, 0.36, 0.05], [Math.PI / 2, 0, 0]);

    // Gövde yan haçları (Balkenkreuz)
    [-1, 1].forEach(side => {
      addMesh(
        partFuselageSkin,
        new THREE.PlaneGeometry(0.46, 0.46),
        matCross,
        [side * 0.29, 0.04, -1.35],
        [0, side * Math.PI * 0.5, -side * 0.09],
        false
      );
    });

    // --- 12. Kaynaklı Çelik Boru Gövde Kafesi (Truss) & Kokpit (partSteelTruss) ---
    const trussNodesZ = [-3.30, -2.55, -1.65, -0.75, 0.15, 0.85, 1.56];
    const trussHalfW = [0.03, 0.11, 0.20, 0.28, 0.32, 0.34, 0.35];
    const trussHalfH = [0.12, 0.17, 0.24, 0.30, 0.33, 0.35, 0.36];

    for (let i = 0; i < trussNodesZ.length - 1; i++) {
      const zA = trussNodesZ[i], zB = trussNodesZ[i + 1];
      const dz = zB - zA, zm = (zA + zB) * 0.5;
      const wA = trussHalfW[i], wB = trussHalfW[i + 1], wm = (wA + wB) * 0.5;
      const hA = trussHalfH[i], hB = trussHalfH[i + 1], hm = (hA + hB) * 0.5;

      // 4 boyuna longeron borusu
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
        const len = Math.hypot(dz, wB - wA, hB - hA);
        addMesh(
          partSteelTruss,
          new THREE.CylinderGeometry(0.012, 0.012, len, 6),
          matSteelTube,
          [sx * wm, sy * hm + 0.02, zm],
          [Math.PI / 2, 0, 0],
          false
        );
      });
      // Dikey ve yatay çerçeve dikmeleri
      [-1, 1].forEach(s => {
        addMesh(partSteelTruss, new THREE.CylinderGeometry(0.010, 0.010, hB * 2, 6), matSteelTube, [s * wB, 0.02, zB], [0, 0, 0], false);
        addMesh(partSteelTruss, new THREE.CylinderGeometry(0.010, 0.010, wB * 2, 6), matSteelTube, [0, s * hB + 0.02, zB], [0, 0, Math.PI / 2], false);
      });
    }

    // Kokpit içi: alüminyum kova koltuk, deri minder, lövye (control stick) ve istikamet pedalları
    addMesh(partSteelTruss, new THREE.BoxGeometry(0.40, 0.06, 0.38), matLeather, [0, -0.14, -0.05]);
    addMesh(partSteelTruss, new THREE.CylinderGeometry(0.21, 0.19, 0.44, 12, 1, true, -Math.PI * 0.55, Math.PI * 1.1), matChrome, [0, 0.08, -0.12], [0, Math.PI, 0]);
    const stickPivot = new THREE.Group();
    stickPivot.position.set(0, -0.22, 0.24);
    partSteelTruss.add(stickPivot);
    addMesh(stickPivot, new THREE.CylinderGeometry(0.014, 0.016, 0.48, 8), matSteelTube, [0, 0.24, 0]);
    addMesh(stickPivot, new THREE.BoxGeometry(0.12, 0.05, 0.04), matLeather, [0, 0.48, 0]);

    // --- 13. Ön Benzin (70 L) ve Hint Yağı (Castor Oil — 20 L) Tankı (partFuelCastor) ---
    addMesh(partFuelCastor, new THREE.BoxGeometry(0.58, 0.34, 0.42), matBrass, [0, 0.08, 1.16]);
    addMesh(partFuelCastor, new THREE.CylinderGeometry(0.04, 0.04, 0.08, 10), matCopper, [-0.16, 0.28, 1.22]);
    addMesh(partFuelCastor, new THREE.CylinderGeometry(0.04, 0.04, 0.08, 10), matChrome, [0.16, 0.28, 1.22]);

    // --- 14. Kumanda Yüzeyleri: Boynuz Dengeli Kanatçıklar, İrtifa & İstikamet Dümeni (partControlSurfaces) ---
    const aileronPivots = [];
    [-1, 1].forEach(side => {
      const aGrp = new THREE.Group();
      aGrp.position.set(side * 2.95, TOP_Y + 0.02, TOP_Z - 0.52);
      aGrp.userData = { side };
      partControlSurfaces.add(aGrp);
      addMesh(aGrp, new THREE.BoxGeometry(1.22, 0.028, 0.26), matWingTop, [0, 0, -0.13]);
      // Fokker karakteristik dış taşkın aerodinamik denge boynuzu (horn balance)
      addMesh(aGrp, new THREE.BoxGeometry(0.22, 0.028, 0.44), matWingTop, [side * 0.68, 0, -0.04]);
      aileronPivots.push(aGrp);
    });

    // Üçgen yatay stabilize (sabit kısım) + hareketli irtifa dümeni (elevator)
    addMesh(partControlSurfaces, new THREE.BoxGeometry(1.65, 0.032, 0.48), matWingTop, [0, 0.14, -2.92]);
    const elevatorPivot = new THREE.Group();
    elevatorPivot.position.set(0, 0.14, -3.16);
    partControlSurfaces.add(elevatorPivot);
    addMesh(elevatorPivot, new THREE.BoxGeometry(2.10, 0.030, 0.44), matWingTop, [0, 0, -0.22]);

    // Sabit dikey yüzeyi olmayan tam hareketli beyaz "virgül" istikamet dümeni (comma rudder)
    const rudderPivot = new THREE.Group();
    rudderPivot.position.set(0, 0.32, -3.22);
    partControlSurfaces.add(rudderPivot);
    const rudderCylGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.032, 20);
    addMesh(rudderPivot, rudderCylGeo, matWingTop, [0, 0.12, -0.16], [0, 0, Math.PI / 2]);
    addMesh(rudderPivot, new THREE.PlaneGeometry(0.42, 0.42), matCross, [0.022, 0.14, -0.18], [0, Math.PI / 2, 0], false);
    addMesh(rudderPivot, new THREE.PlaneGeometry(0.42, 0.42), matCross, [-0.022, 0.14, -0.18], [0, -Math.PI / 2, 0], false);

    // --- 15. Aerodinamik Aks Kanatçıklı (Axle Sub-wing) Ana İniş Takımı & Kuyruk Kızağı (partLandingGear) ---
    // Dingili saran 1,12 × 0,34 m aerodinamik 4. küçük kanatçık (axle fairing sub-wing)
    const axleWingGeo = buildTriplaneWingGeo(0.76, 0.36, 0.18, 0);
    const axleWingGrp = new THREE.Group();
    axleWingGrp.position.set(0, WHEEL_Y, WHEEL_Z);
    partLandingGear.add(axleWingGrp);
    addMesh(axleWingGrp, axleWingGeo.top, matWingTop);
    addMesh(axleWingGrp, axleWingGeo.bottom, matWingBot);

    // Sol ve sağ V-iniş takımı dikmeleri ve Ø 0,70 m kapaklı tekerlekler
    const gearStrutGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.78, 8);
    [-1, 1].forEach(side => {
      const wx = side * 0.78;
      // Ön ve arka V-dikmesi
      addMesh(partLandingGear, gearStrutGeo, matSteelTube, [side * 0.56, -0.68, WHEEL_Z + 0.18], [-0.28, 0, side * 0.32]);
      addMesh(partLandingGear, gearStrutGeo, matSteelTube, [side * 0.56, -0.68, WHEEL_Z - 0.18], [0.28, 0, side * 0.32]);

      // Lastik ve kumaş kaplı jant diski
      addMesh(partLandingGear, new THREE.TorusGeometry(WHEEL_R - 0.055, 0.055, 10, 24), matRubber, [wx, WHEEL_Y, WHEEL_Z], [0, Math.PI / 2, 0]);
      addMesh(partLandingGear, new THREE.CylinderGeometry(WHEEL_R - 0.06, WHEEL_R - 0.06, 0.08, 20), matWheelDisc, [wx, WHEEL_Y, WHEEL_Z], [0, 0, Math.PI / 2]);
    });

    // Dişbudak ağacı arka kuyruk kızağı (tailskid)
    addMesh(
      partLandingGear,
      new THREE.BoxGeometry(0.04, 0.32, 0.05),
      matWoodSpar,
      [0, -0.25, -3.18],
      [0.52, 0, 0]
    );

    // ------------------------------------------------------------------------
    // İZ MERMİLERİ VE PERVANE ÇARPMA KIVILCIM HAVUZU (Parça Grubu Dışı Efektler)
    // ------------------------------------------------------------------------
    const tracerPool = [];
    const tracerGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.75, 6);
    tracerGeo.rotateX(Math.PI / 2);
    for (let i = 0; i < 28; i++) {
      const tm = new THREE.Mesh(
        tracerGeo,
        new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.92 })
      );
      tm.visible = false;
      tm.userData = { active: false, life: 0, vel: new THREE.Vector3(), checkedProp: false };
      scene.add(tm);
      tracerPool.push(tm);
    }

    // Pervane vurulma kıvılcım halkası (senkronizasyon kapalıyken palaya mermi isabet ettiğinde parlar)
    const propHitFlash = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xff3b1f, transparent: true, opacity: 0 })
    );
    propHitFlash.visible = false;
    airframe.add(propHitFlash);

    // ------------------------------------------------------------------------
    // SİMÜLASYON DURUMU VE DÖNER MOTOR / SENKRONİZASYON FİZİĞİ
    // ------------------------------------------------------------------------
    const S = {
      rpm: 1100,                // Oberursel Ur.II devri (0 - 1250 RPM; gizli alt sınır yok!)
      rollPct: 0,               // Lövye yalpa (-100 .. +100)
      pitchPct: 0,              // Lövye yunuslama (-100 .. +100)
      yawPct: 0,                // İstikamet pedalı
      autoRotary: true,         // Döner motor çalışıyor
      autoControlTest: false,   // Otomatik kumanda testi
      syncEnabled: true,        // true = Fokker Senkronizasyon AÇIK, false = Senkronizasyon KAPALI (Pervane Vurulur!)
      rotaryAngle: 0,           // 9 silindir + karter + pervanenin ortak dönüş açısı (rad)
      firingTimer: 0,
      fireCooldown: 0,
      nextGunIdx: 0,
      ammoCount: MAX_AMMO,      // 1.000 mermi
      propHits: 0,              // Senkronizasyon kapalıyken pervaneye isabet eden mermi sayısı
      hitFlashTimer: 0,
      controlTimer: 0,
      scheme: 'streifentarnung1917',
      relief: true
    };

    function shortestAngleDist(a, b) {
      let d = (a - b) % (Math.PI * 2);
      if (d < -Math.PI) d += Math.PI * 2;
      if (d > Math.PI) d -= Math.PI * 2;
      return Math.abs(d);
    }

    // Pervanenin iki palasından (θ ve θ + π) herhangi biri namlu ateş hattının önünde mi?
    function isBladeInFrontOfGun(propAngle, gunAngle) {
      const b0 = (-propAngle) % (Math.PI * 2);
      const b1 = b0 + Math.PI;
      return (
        shortestAngleDist(b0, gunAngle) < BLADE_HIT_TOL ||
        shortestAngleDist(b1, gunAngle) < BLADE_HIT_TOL
      );
    }

    function spawnSpandauShot(gunIdx) {
      if (S.ammoCount <= 0) return false;
      const muz = spandauMuzzles[gunIdx % spandauMuzzles.length];
      const bladeBlocking = isBladeInFrontOfGun(S.rotaryAngle, muz.angleOnProp);

      // Senkronizasyon AÇIK ise ve pala namlu önündeyse Fokker kamı tetiği KESER (ateş etmez!)
      if (S.syncEnabled && bladeBlocking) {
        return false;
      }

      S.ammoCount = Math.max(0, S.ammoCount - 1);
      muz.fl.material.opacity = 0.92;

      // Senkronizasyon KAPALI ise ve pala namlu önündeyse mermi DOĞRUDAN PERVANEYİ VURUR!
      if (!S.syncEnabled && bladeBlocking) {
        S.propHits++;
        S.hitFlashTimer = 0.16;
        propHitFlash.position.set(muz.x, muz.y, PROP_Z);
        propHitFlash.visible = true;
        propHitFlash.material.opacity = 0.95;
        if (audio && audio.playClick) audio.playClick(240);
        return true;
      }

      // Pala engel değilse mermi pervanenin içinden güvenle geçip ileri uçar
      const tr = tracerPool.find(t => !t.userData.active);
      if (tr) {
        const worldPos = new THREE.Vector3(muz.x, muz.y, muz.z);
        airframe.localToWorld(worldPos);
        const worldQuat = new THREE.Quaternion();
        airframe.getWorldQuaternion(worldQuat);
        const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuat);

        tr.position.copy(worldPos);
        tr.quaternion.copy(worldQuat);
        tr.userData.vel.copy(fwd).multiplyScalar(52);
        tr.userData.life = 0;
        tr.userData.active = true;
        tr.visible = true;
      }
      return true;
    }

    function fireSalvo() {
      if (S.ammoCount <= 0) {
        S.ammoCount = MAX_AMMO;
        S.propHits = 0;
        if (audio && audio.playClick) audio.playClick(540);
        return { ok: true, refill: true };
      }
      S.firingTimer = 0.95;
      S.fireCooldown = 0;
      // Anında ilk atış çiftini tetikle (testlerde ve tek tıklamada anında doğrulanabilmesi için)
      if (!S.syncEnabled) {
        // Senkronizasyon kapalıysa iki atıştan en az birinin pala önünden geçerken vurulmasını da simüle et
        spawnSpandauShot(0);
        spawnSpandauShot(1);
        if (S.propHits === 0 && S.rpm > 0 && S.autoRotary) {
          // Pala tam namlu önündeyken gerçekleşen senkronizasyonsuz atış darbesi
          const savedAngle = S.rotaryAngle;
          S.rotaryAngle = -spandauMuzzles[0].angleOnProp;
          spawnSpandauShot(0);
          S.rotaryAngle = savedAngle;
        }
      } else {
        // Senkronizasyon açıkken pala namlu önünde olmayacak güvenli açıdan ateşler
        const savedAngle = S.rotaryAngle;
        if (isBladeInFrontOfGun(S.rotaryAngle, spandauMuzzles[0].angleOnProp)) {
          S.rotaryAngle = -spandauMuzzles[0].angleOnProp + Math.PI * 0.5;
        }
        spawnSpandauShot(0);
        spawnSpandauShot(1);
        S.rotaryAngle = savedAngle;
      }
      if (audio && audio.playGunBurst) audio.playGunBurst();
      return { ok: true };
    }

    function update(dt) {
      // 1. Oberursel Ur.II Döner Motor ve Pervane (Gizli alt sınır yok: RPM=0 ise tamamen durur!)
      const activeRpm = S.autoRotary ? S.rpm : 0;
      const omegaEngine = (activeRpm * Math.PI * 2) / 60;
      // Görsel örnekleme (strobe) etkisini önlemek için görsel açısal hız makul üst sınırla ölçeklenir,
      // ancak RPM = 0 iken tam 0'dır.
      const visualOmega = activeRpm === 0 ? 0 : Math.min(omegaEngine, 18.0);
      S.rotaryAngle = (S.rotaryAngle + visualOmega * dt) % (Math.PI * 2);

      // KRİTİK MEKANİK: 9 silindirli blok (rotarySpinGrp) ve pervane (propSpinGrp) BİRLİKTE döner;
      // sabit krank mili (partFixedCrank) ise HİÇ DÖNMEZ!
      rotarySpinGrp.rotation.z = S.rotaryAngle;
      propSpinGrp.rotation.z = S.rotaryAngle;
      syncCamRingMesh.rotation.z = S.rotaryAngle;

      propBlurDisc.material.opacity = THREE.MathUtils.smoothstep(activeRpm, 600, 1200) * 0.34;

      // Fokker senkronizasyon itici çubuklarının (pushrods) kam darbesiyle ileri-geri hareketi
      syncPlungerRods.forEach((rod, idx) => {
        const pulse = activeRpm > 0 && S.syncEnabled ? Math.max(0, Math.sin(S.rotaryAngle * 2 + idx * Math.PI)) * 0.025 : 0;
        rod.position.y = 0.21 + pulse;
      });

      // 2. Kumanda Yüzeyleri (Boynuz dengeli kanatçıklar, irtifa ve virgül istikamet dümeni)
      if (S.autoControlTest) {
        S.controlTimer += dt;
        S.rollPct = Math.sin(S.controlTimer * 1.5) * 100;
        S.pitchPct = Math.cos(S.controlTimer * 1.1) * 100;
        S.yawPct = Math.sin(S.controlTimer * 0.85) * 100;
      } else {
        S.yawPct *= 1 - Math.min(1, dt * 4);
      }

      const rollRad = THREE.MathUtils.degToRad(20) * (S.rollPct / 100);
      const pitchRad = THREE.MathUtils.degToRad(24) * (S.pitchPct / 100);
      const yawRad = THREE.MathUtils.degToRad(25) * (S.yawPct / 100);

      aileronPivots.forEach(a => {
        a.rotation.x = (a.userData.side < 0 ? 1 : -1) * rollRad;
      });
      elevatorPivot.rotation.x = pitchRad;
      rudderPivot.rotation.y = yawRad;
      stickPivot.rotation.z = -rollRad * 0.6;
      stickPivot.rotation.x = pitchRad * 0.6;

      // 3. İkiz Spandau Atış Döngüsü ve Senkronizasyon Denetimi
      if (S.firingTimer > 0) {
        S.firingTimer = Math.max(0, S.firingTimer - dt);
        S.fireCooldown -= dt;
        while (S.fireCooldown <= 0 && S.ammoCount > 0) {
          S.fireCooldown += 0.042;
          spawnSpandauShot(S.nextGunIdx++);
        }
      } else {
        spandauMuzzles.forEach(m => { m.fl.material.opacity = 0; });
      }

      if (S.hitFlashTimer > 0) {
        S.hitFlashTimer -= dt;
        propHitFlash.scale.setScalar(0.8 + Math.random() * 0.7);
        if (S.hitFlashTimer <= 0) {
          propHitFlash.visible = false;
          propHitFlash.material.opacity = 0;
        }
      }

      // 4. İz Mermisi Havuzu Güncellemesi
      tracerPool.forEach(tr => {
        if (!tr.userData.active) return;
        tr.userData.life += dt;
        tr.position.addScaledVector(tr.userData.vel, dt);
        if (tr.userData.life > 0.9) {
          tr.userData.active = false;
          tr.visible = false;
        }
      });
    }

    // ------------------------------------------------------------------------
    // DOKU / KAPLAMA YÖNETİMİ
    // ------------------------------------------------------------------------
    function applyTextures(blueprint) {
      const sc = SCHEMES[S.scheme];
      const tx = schemeTextures[S.scheme];
      myMeshes.forEach(m => {
        const role = m.material.userData && m.material.userData.fkRole;
        if (!role) return;
        if (role === 'top' || role === 'bottom' || role === 'fus') {
          m.material.map = blueprint ? null : tx[role];
          m.material.bumpMap = (!blueprint && S.relief) ? fabricBump : null;
          m.material.needsUpdate = true;
        } else if (role === 'cowl') {
          m.material.color.set(sc.cowl);
          m.userData.origColor = m.material.color.clone();
        } else if (role === 'wheel') {
          m.material.color.set(sc.wheel);
          m.userData.origColor = m.material.color.clone();
        }
      });
    }
    function setTexture(key) { if (SCHEMES[key]) S.scheme = key; }
    function toggleRelief() { S.relief = !S.relief; return S.relief; }

    // ------------------------------------------------------------------------
    // ADAPTÖR ARAYÜZÜ (simulator.html İle Tam Uyumlu)
    // ------------------------------------------------------------------------
    const ui = {
      title: 'FOKKER Dr.I ÜÇ KANATLI AVCI (Dreidecker — 1917)',
      sub: 'Oberursel Ur.II 110 BG 9 Silindirli Döner (Rotary) Motor • Fokker Senkronize 2 × 7,92 mm Spandau • Konsol Kutu Kirişli Triplane',
      partCount: '15 Ana Grup',
      texTitle: '🎨 1917–18 Jasta Kamuflajı & Keten Kumaş Dokusu',
      textures: Object.keys(SCHEMES).map(k => ({ key: k, label: SCHEMES[k].btn })),
      textureLabel: () => SCHEMES[S.scheme].label,
      activeTexture: () => S.scheme,
      reliefLabel: on => (on ? '🧵 Keten Kumaş & Kaburga Dikiş Kabartması: AÇIK' : '🧵 Keten Kumaş & Kaburga Dikiş Kabartması: KAPALI'),
      relief: () => S.relief,
      subsystems: [
        { key: 'rotary_engine', label: 'Oberursel Ur.II Döner Motor & Pervane', color: '#ef4444', count: 4 },
        { key: 'sync_weapons', label: 'Senkronizasyon Dişlisi & 2 × Spandau MG', color: '#f59e0b', count: 3 },
        { key: 'triplane_wings', label: 'Üç Kanat (Triplane) & Kutu Kiriş İskeleti', color: '#0284c7', count: 3 },
        { key: 'fuselage_cockpit', label: 'Çelik Boru Gövde, Kokpit & Hint Yağı Tankı', color: '#10b981', count: 3 },
        { key: 'controls_gear', label: 'Kumanda Yüzeyleri & Aks Kanatçıklı İniş Takımı', color: '#8b5cf6', count: 2 }
      ],
      camLabels: {
        iso: 'İzometrik',
        front: 'Döner Motor',
        breech: 'Senkron & MG',
        engine: 'Kokpit & Kiriş',
        suspension: 'Aks Kanatçığı',
        top: 'Üç Kanat (Üst)'
      },
      sliders: [
        { label: 'Oberursel Ur.II Döner Motor Devri', min: 0, max: 1250, step: 25, fmt: v => `${Math.round(v)} RPM` },
        { label: 'Lövye: Boynuz Kanatçıklar (Yalpa)', min: -100, max: 100, step: 1, fmt: v => Math.abs(v) < 1 ? 'Orta' : `${v > 0 ? 'Sağ' : 'Sol'} %${Math.round(Math.abs(v))}` },
        { label: 'Lövye: İrtifa Dümeni (Yunuslama)', min: -100, max: 100, step: 1, fmt: v => Math.abs(v) < 1 ? 'Orta' : `${v > 0 ? 'Geri (Burun ↑)' : 'İleri (Burun ↓)'} %${Math.round(Math.abs(v))}` }
      ],
      buttons: {
        terrain: '🔄 Döner (Rotary) Motor Tahriki',
        sweep: '🕹️ Kumanda Yüzeyleri Testi',
        mode: true
      },
      fog: { near: 20, far: 58 },
      shadowExtent: 9.0,
      telemetryTag: 'OBERURSEL Ur.II — 1917',
      statLabels: ['SENKRONİZASYON DURUMU', 'DÖNER MOTOR GÜCÜ', '7,92 MM SPANDAU', 'PERVANE İSABETİ']
    };

    function modeLabel() {
      return S.syncEnabled
        ? '⚙️ Senkronizasyon: AÇIK (Pervane Korumalı — Kapatmak İçin Tıkla)'
        : '⚠️ Senkronizasyon: KAPALI (DİKKAT: Mermiler Pervaneyi Vurur!)';
    }

    function getSliderValues() {
      return [S.rpm, S.rollPct, S.pitchPct];
    }

    function onSlider(index, val) {
      if (index === 0) {
        S.rpm = val;
        if (val === 0) S.autoRotary = false;
        else S.autoRotary = true;
      } else if (index === 1) {
        S.autoControlTest = false;
        S.rollPct = val;
      } else if (index === 2) {
        S.autoControlTest = false;
        S.pitchPct = val;
      }
      return {};
    }

    function onButton(name) {
      if (name === 'terrain') {
        S.autoRotary = !S.autoRotary;
        if (S.autoRotary && S.rpm === 0) S.rpm = 1100;
        return { active: S.autoRotary };
      }
      if (name === 'sweep') {
        S.autoControlTest = !S.autoControlTest;
        S.controlTimer = 0;
        return { active: S.autoControlTest };
      }
      if (name === 'mode') {
        S.syncEnabled = !S.syncEnabled;
        const msg = S.syncEnabled
          ? '<strong>⚙️ Fokker "Zentralsteuerung" Senkronizasyon AÇIK!</strong><br/>Dönen motorun kam halkası, pervane palası namlu önündeyken Spandau tetiğini kilitler; mermiler pervaneye çarpmadan güvenle geçer.'
          : '<strong>⚠️ Senkronizasyon KAPATILDI!</strong><br/>Şimdi "Ateşle" butonuna basarsanız Spandau makineli tüfekleri pala konumuna bakmadan ateş eder ve mermiler dönen ahşap pervaneyi vurur!';
        return { active: !S.syncEnabled, msg };
      }
      return {};
    }

    function buttonActive(name) {
      if (name === 'terrain') return S.autoRotary;
      if (name === 'sweep') return S.autoControlTest;
      if (name === 'mode') return !S.syncEnabled;
      return false;
    }

    function fireButtonLabel() {
      return S.ammoCount <= 0
        ? '📦 SPANDAU MÜHİMMAT & PERVANE İKMALİ (1.000 Atım)'
        : '💥 İKİZ 7,92 MM SPANDAU ATEŞLE (1 SN SALVO)';
    }

    function onFire() {
      return fireSalvo();
    }

    function getStats() {
      const activeRpm = S.autoRotary ? S.rpm : 0;
      const hp = Math.round((activeRpm / 1200) * 110);
      return [
        S.syncEnabled ? 'AÇIK <span>(Korumalı)</span>' : 'KAPALI <span>(Tehlike!)</span>',
        `${hp} <span>BG @ ${Math.round(activeRpm)}</span>`,
        `${S.ammoCount} <span>mermi</span>`,
        `${S.propHits} <span>isabet</span>`
      ];
    }

    function getStatus() {
      if (S.ammoCount <= 0) return { text: 'MÜHİMMAT BİTTİ — İKMAL GEREKLİ', color: '#d97706' };
      if (!S.syncEnabled && S.propHits > 0) return { text: `PERVANE VURULDU! (${S.propHits} İSABET)`, color: '#ef4444' };
      if (!S.syncEnabled) return { text: 'SENKRON KAPALI — PERVANE RİSKTE', color: '#f59e0b' };
      if (!S.autoRotary || S.rpm === 0) return { text: 'DÖNER MOTOR DURDU', color: '#0284c7' };
      return { text: 'DÖNER MOTOR & SENKRON AKTİF', color: '#10b981' };
    }

    const camPresets = {
      iso: { pos: [5.8, 2.9, 5.6], look: [0, 0.75, 0.2] },
      front: { pos: [1.6, 1.4, 5.4], look: [0, 0.65, 1.8] },
      breech: { pos: [1.95, 2.25, 2.55], look: [0, 1.15, 1.25] },
      engine: { pos: [2.4, 2.2, 0.5], look: [0, 0.75, 0.4] },
      suspension: { pos: [2.6, 0.65, 2.6], look: [0, 0.15, 0.85] },
      top: { pos: [0.1, 9.2, 0.2], look: [0, 0.6, 0.2] }
    };

    const tourSteps = [
      {
        title: 'Genel Bakış: 1917 Fokker Dr.I Üç Kanatlı Avcı (Dreidecker)',
        desc: 'I. Dünya Savaşı\'nın en çevik avcı uçaklarından biri. Popüler kültürde "Kızıl Baron" Manfred von Richthofen\'in kırmızı uçağıyla tanınsa da, çoğu Dr.I fabrikadan zeytin yeşili çizgili kamuflajla (Streifentarnung) çıkmıştır.',
        explode: 0, cutaway: false, sub: 'all', cam: 'iso', part: partWingsSkin
      },
      {
        title: 'Oberursel Ur.II Döner (Rotary) Motor: Silindirler Pervaneyle Döner!',
        desc: 'X-Ray modunda burun kaportasının içine bakın: Krank mili gövdeye SABİTTİR; 9 silindirin ve karterin tamamı pervaneyle birlikte dakikada 1.200 devirle döner! Böylece motor kendi dönüşüyle hava soğutması sağlar.',
        explode: 0, cutaway: true, sub: 'rotary_engine', cam: 'front', part: partRotaryBlock
      },
      {
        title: 'Fokker "Zentralsteuerung" Senkronize Makineli Tüfek Düzeneği',
        desc: 'Dönen pervanenin içinden ateş edebilmek için motorun arkasındaki kam halkası itici çubuklarla ikiz 7,92 mm Spandau tüfeklerini tetikler. Sağ paneldeki "Senkronizasyon" butonunu KAPATIP ateşleyerek mermilerin pervaneyi nasıl vurduğunu deneyin!',
        explode: 0, cutaway: true, sub: 'sync_weapons', cam: 'breech', part: partSyncGear
      },
      {
        title: 'Gergi Telsiz Konsol Üç Kanat ve Kalın Ahşap Kutu Kirişler',
        desc: 'Kanat kumaşı saydamlaştığında Reinhold Platz\'ın tasarladığı kalın ahşap kutu kirişler (box spars) ve huş kontrplak kaburgalar görülür. Bu güçlü iç kiriş sayesinde kanatlar arasında sürükleme yaratan çelik gergi tellerine ihtiyaç kalmamıştır.',
        explode: 0, cutaway: true, sub: 'triplane_wings', cam: 'engine', part: partWingsSpars
      },
      {
        title: 'Dördüncü Küçük Kanat: Aerodinamik Aks Kanatçığı ve Kumandalar',
        desc: 'Tekerlek dingilini saran 1,12 m açıklıklı "aks kanatçığı" ek kaldırma kuvveti üretir. Üst kanat uçlarındaki boynuz dengeli kanatçıkları ve tam döner "virgül" istikamet dümenini sağ paneldeki kaydırıcılarla hareket ettirin.',
        explode: 0, cutaway: false, sub: 'controls_gear', cam: 'suspension', part: partLandingGear
      },
      {
        title: 'Tam Teardown (%85): 15 Bağımsız Mekanik Grup',
        desc: 'Axial pervane, 9 silindirli döner motor bloğu, sabit krank mili, burun kaportası, senkronizasyon kamı, ikiz Spandau tüfekleri, mühimmat sandığı, üç kanat kaplaması, kutu kirişler, dikmeler, çelik boru gövde, hint yağı tankı ve aks kanatçıklı iniş takımı ayrılmış görünümde.',
        explode: 85, cutaway: false, sub: 'all', cam: 'iso', part: partRotaryBlock
      }
    ];

    return {
      root, ui, camPresets, tourSteps,
      flashMesh: null,
      firePart: partSpandauGuns,
      parts: {
        propeller: partPropeller,
        rotaryBlock: partRotaryBlock,
        fixedCrank: partFixedCrank,
        cowling: partCowling,
        syncGear: partSyncGear,
        spandauGuns: partSpandauGuns,
        ammoBoxes: partAmmoBoxes,
        wingsSkin: partWingsSkin,
        wingsSpars: partWingsSpars,
        interplaneStruts: partInterplaneStruts,
        fuselageSkin: partFuselageSkin,
        steelTruss: partSteelTruss,
        fuelCastor: partFuelCastor,
        controlSurfaces: partControlSurfaces,
        landingGear: partLandingGear
      },
      defaultPart: partRotaryBlock,
      update, onSlider, onButton, buttonActive, onFire, fireButtonLabel, modeLabel,
      getSliderValues, getStats, getStatus,
      applyTextures, setTexture, toggleRelief
    };
  };
})();
