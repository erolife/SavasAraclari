/* =============================================================================
 * Supermarine Spitfire Mk IX (1942–45) — 3D Araç Modülü (16 mekanik grup)
 * Klasik script olarak yüklenir; sayfa file:// ile açıldığında da çalışır. Adaptör kalıbı.
 *
 * Ölçüler (yaklaşık, Mk IX):
 *  - Kanat açıklığı 11,23 m (36 ft 10 in), boy ≈ 9,46 m, eliptik kanat, 6° dihedral
 *  - Rolls-Royce Merlin 66: 27 L V12, iki kademeli iki hızlı süperşarj + ara soğutucu
 *  - Rotol 4 palli sabit devirli pervane, Ø ≈ 3,27 m; redüksiyon oranı ≈ 0,477 (Merlin 66)
 *  - "C" kanadı: 2 × 20 mm Hispano (120 mermi/top) + 4 × .303 Browning (350 mermi/silah)
 *  - Gövdede iki yakıt tankı (toplam 85 İngiliz galonu)
 * Kanat ve kuyruk yüzeyleri, eliptik planform + NACA 4 haneli simetrik kesitle üretilir.
 * Motor gücü ve pervane uç hızı telemetrisi devirle orantılı yaklaşık değerlerdir.
 * ========================================================================== */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.spitfire = function buildSpitfire(ctx) {
    const { THREE, scene, addCADMesh, createPartGroup } = ctx;
    const audio = ctx.audio || null;

    // ------------------------------------------------------------------------
    // ÖLÇÜLER (1 birim = 1 m). Burun +Z, y yukarı. Uçak çerçevesinde gövde ekseni y = 0.
    // ------------------------------------------------------------------------
    const SEMI = 5.615;            // yarı kanat açıklığı (11,23 m / 2)
    const ROOT_C = 2.54;           // kök veter
    const WING_Z = 0.55, WING_Y = -0.48;
    const DIHEDRAL = THREE.MathUtils.degToRad(6);
    const PROP_R = 1.635;          // Ø 3,27 m
    const REDUCTION = 0.477;
    const LEG = 0.9, WHEEL_R = 0.29;
    const MAIN_PIVOT = { x: 0.80, y: -0.5, z: 0.62 };
    const TAIL_WHEEL = { z: -4.25, y: -0.44, r: 0.12 };
    const FLIGHT_Y = 2.9;
    const AMMO_CANNON = 240, AMMO_MG = 1400;

    // ------------------------------------------------------------------------
    // AERODİNAMİK YÜZEY ÜRETECİ: eliptik planform + NACA 00xx kesit
    // ------------------------------------------------------------------------
    function naca(xc, t) {
      return 5 * t * (0.2969 * Math.sqrt(xc) - 0.1260 * xc - 0.3516 * xc * xc + 0.2843 * xc * xc * xc - 0.1036 * xc * xc * xc * xc);
    }
    function buildSurface(o) {
      const nS = o.nS || 36, nC = o.nC || 18;
      const geos = [];
      [1, -1].forEach(side => {
        const pos = [], uv = [], idx = [];
        for (let i = 0; i <= nS; i++) {
          const k = i / nS;
          const s = o.full ? o.semi * Math.sin((k * 2 - 1) * Math.PI / 2) : o.semi * Math.sin(k * Math.PI / 2);
          const f = Math.abs(s) / o.semi;
          const c = Math.max(0.02, o.root * Math.sqrt(Math.max(0, 1 - f * f)));
          const t = o.tRoot + (o.tTip - o.tRoot) * f;
          const le = o.le * c;
          const dy = Math.abs(s) * Math.tan(o.dihedral || 0);
          for (let j = 0; j <= nC; j++) {
            const xc = (1 - Math.cos(Math.PI * j / nC)) / 2;
            pos.push(s, dy + side * naca(xc, t) * c, le - xc * c);
            uv.push(o.full ? (s + o.semi) / (2 * o.semi) : s / o.semi, xc);
          }
        }
        for (let i = 0; i < nS; i++) {
          for (let j = 0; j < nC; j++) {
            const a = i * (nC + 1) + j, b = a + nC + 1, c = a + 1, d = b + 1;
            if (side > 0) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d);
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
    const chordAt = (s, root, semi) => Math.max(0.02, root * Math.sqrt(Math.max(0, 1 - (s / semi) ** 2)));

    // Gövde gibi oval kesitli döner profil: z boyunca yarıçap tablosu (eşit aralıklı → v ≈ z)
    function bodyLathe(table, z0, z1, n, widthScale) {
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const z = z0 + (z1 - z0) * (i / n);
        let r = table[table.length - 1][1];
        for (let k = 0; k < table.length - 1; k++) {
          if (z >= table[k][0] && z <= table[k + 1][0]) {
            const u = (z - table[k][0]) / (table[k + 1][0] - table[k][0]);
            r = table[k][1] + (table[k + 1][1] - table[k][1]) * (0.5 - 0.5 * Math.cos(Math.PI * u));
            break;
          }
        }
        pts.push(new THREE.Vector2(Math.max(0.001, r), z));
      }
      const g = new THREE.LatheGeometry(pts, 48);
      g.scale(widthScale, 1, 1);
      return g;
    }
    // Lathe ekseni Y → Rx(+90°) ile Z'ye döner; Lathe'nin z'si dünya -y olur (φ=0 alt, φ=π üst)
    const AXIAL = [Math.PI / 2, 0, 0];
    const FUS_TABLE = [[-4.75, 0.04], [-4.2, 0.2], [-3.0, 0.36], [-1.5, 0.52], [0.0, 0.64], [1.2, 0.66], [2.2, 0.62], [3.4, 0.52], [4.25, 0.44]];

    // ------------------------------------------------------------------------
    // BOYA ŞEMALARI (prosedürel)
    // ------------------------------------------------------------------------
    const SCHEMES = {
      dayfighter: { label: 'RAF Gündüz Avcı Şeması (1941–44)', btn: '🌿 Gündüz Avcı', c1: '#6e7377', c2: '#3f4a33', under: '#a3a8ab', band: '#c5c9a6', stripes: false },
      desert: { label: 'Çöl Şeması (K. Afrika / Malta)', btn: '🏜️ Çöl', c1: '#b9a072', c2: '#7a5c3e', under: '#7ea6c9', band: null, stripes: false },
      dday: { label: 'D-Day İstila Şeritleri (Haziran 1944)', btn: '⬛⬜ D-Day', c1: '#6e7377', c2: '#3f4a33', under: '#a3a8ab', band: '#c5c9a6', stripes: true },
      silver: { label: 'Cilalı Alüminyum (Gösteri / Restorasyon)', btn: '✨ Alüminyum', c1: '#c9cdd1', c2: '#c9cdd1', under: '#c9cdd1', band: null, stripes: false, metal: true }
    };
    function seeded(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
    function camo(g, w, h, c1, c2, seed) {
      g.fillStyle = c1; g.fillRect(0, 0, w, h);
      if (c1 === c2) return;
      const r = seeded(seed);
      g.fillStyle = c2;
      for (let i = 0; i < 9; i++) {
        g.beginPath();
        const cx = r() * w, cy = r() * h, rad = w * (0.08 + r() * 0.14);
        for (let k = 0; k < 9; k++) {
          const a = (k / 9) * Math.PI * 2, rr = rad * (0.6 + r() * 0.6);
          const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.7;
          if (k === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.closePath(); g.fill();
      }
    }
    function stripes(g, x0, x1, h, vertical) {
      const n = 5, wS = (x1 - x0) / n;
      for (let k = 0; k < n; k++) {
        g.fillStyle = k % 2 === 0 ? '#f4f4f0' : '#141414';
        if (vertical) g.fillRect(0, x0 + k * wS, h, wS); else g.fillRect(x0 + k * wS, 0, wS, h);
      }
    }
    function makeTex(draw, w = 512, h = 256) {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      draw(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    }
    const schemeTex = {};
    Object.keys(SCHEMES).forEach(k => {
      const s = SCHEMES[k];
      schemeTex[k] = {
        // Gövde: u = çevre (0/1 alt, 0,5 üst), v = burundan kuyruğa uzunluk (kuyruk 0)
        fus: makeTex((g, w, h) => {
          camo(g, w, h, s.c1, s.c2, 7);
          g.fillStyle = s.under;
          g.fillRect(0, 0, w * 0.21, h);
          g.fillRect(w * 0.79, 0, w * 0.21, h);
        }, 512, 256),
        top: makeTex((g, w, h) => {
          camo(g, w, h, s.c1, s.c2, 13);
          if (s.stripes) { stripes(g, w * 0.16, w * 0.34, h); stripes(g, w * 0.66, w * 0.84, h); }
        }),
        bottom: makeTex((g, w, h) => {
          g.fillStyle = s.under; g.fillRect(0, 0, w, h);
          if (s.stripes) { stripes(g, w * 0.16, w * 0.34, h); stripes(g, w * 0.66, w * 0.84, h); }
        }),
        cowl: makeTex((g, w, h) => {
          camo(g, w, h, s.c1, s.c2, 21);
          g.fillStyle = s.under;
          g.fillRect(0, 0, w * 0.21, h);
          g.fillRect(w * 0.79, 0, w * 0.21, h);
        }, 256, 128)
      };
      // Gövde: arka gövde kuşağı (Sky) ve D-Day şeritleri — v ekseni gövde uzunluğu boyunca
      const fusCanvas = schemeTex[k].fus.image;
      const g = fusCanvas.getContext('2d');
      const W = fusCanvas.width, H = fusCanvas.height;
      // Lathe'de v = profil indeksi / n; profil kuyruktan (z=-4,75) buruna (z=2,2) gider.
      // CanvasTexture flipY=true olduğu için v=0 görüntünün altına düşer → y = H·(1 − v).
      const vOf = z => (z + 4.75) / (2.2 + 4.75);
      const bandY = (z0, z1) => [H * (1 - vOf(z1)), H * (vOf(z1) - vOf(z0))];
      if (s.band) { const [y, hh] = bandY(-3.55, -3.25); g.fillStyle = s.band; g.fillRect(0, y, W, hh); }
      if (s.stripes) { const [y, hh] = bandY(-3.2, -2.3); stripes(g, y, y + hh, W, true); }
      schemeTex[k].fus.needsUpdate = true;
    });
    // Perçin ve panel hattı kabartması
    const panelBump = (() => {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 256;
      const g = c.getContext('2d');
      g.fillStyle = '#808080'; g.fillRect(0, 0, 512, 256);
      g.strokeStyle = '#3c3c3c'; g.lineWidth = 1.5;
      for (let x = 0; x < 512; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
      for (let y = 0; y < 256; y += 42) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
      g.fillStyle = '#a8a8a8';
      for (let x = 4; x < 512; x += 8) for (let y = 0; y < 256; y += 42) g.fillRect(x, y + 3, 1.5, 1.5);
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    })();
    function roundelTex(fin) {
      return makeTex((g, w, h) => {
        g.clearRect(0, 0, w, h);
        if (fin) {
          // Kuyruk bayrağı (kırmızı-beyaz-mavi şerit)
          const cols = ['#b4232a', '#f2f2f2', '#2a3d7a'];
          cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(i * w / 3, 0, w / 3, h); });
          return;
        }
        const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2;
        [['#e8c13a', 1.0], ['#2a3d7a', 0.86], ['#f2f2f2', 0.56], ['#b4232a', 0.40]].forEach(([c, f]) => {
          g.fillStyle = c; g.beginPath(); g.arc(cx, cy, R * f, 0, Math.PI * 2); g.fill();
        });
      }, 128, 128);
    }

    // ------------------------------------------------------------------------
    // MALZEMELER
    // ------------------------------------------------------------------------
    const fusMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: schemeTex.dayfighter.fus, bumpMap: panelBump, bumpScale: 0.01, roughness: 0.55, metalness: 0.35, userData: { spRole: 'fus' } });
    const cowlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: schemeTex.dayfighter.cowl, bumpMap: panelBump, bumpScale: 0.01, roughness: 0.55, metalness: 0.35, userData: { spRole: 'cowl' } });
    const topMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: schemeTex.dayfighter.top, bumpMap: panelBump, bumpScale: 0.01, roughness: 0.55, metalness: 0.35, side: THREE.DoubleSide, userData: { spRole: 'top' } });
    const botMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: schemeTex.dayfighter.bottom, bumpMap: panelBump, bumpScale: 0.01, roughness: 0.55, metalness: 0.35, side: THREE.DoubleSide, userData: { spRole: 'bottom' } });
    const alloyMat = new THREE.MeshStandardMaterial({ color: 0xb8bec6, roughness: 0.35, metalness: 0.85 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x23262b, roughness: 0.5, metalness: 0.6 });
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x2c3036, roughness: 0.4, metalness: 0.7 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.18, metalness: 0.9 });
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb8692e, roughness: 0.35, metalness: 0.8 });
    const tyreMat = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.9, metalness: 0.05 });
    const propMat = new THREE.MeshStandardMaterial({ color: 0x18191c, roughness: 0.6, metalness: 0.2 });
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xe8c13a, roughness: 0.6, metalness: 0.1 });
    const spinnerMat = new THREE.MeshStandardMaterial({ color: 0xc5c9a6, roughness: 0.5, metalness: 0.3, userData: { spRole: 'spinner' } });
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.7, metalness: 0.2 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x4a2a14, roughness: 0.7, metalness: 0.05 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xc8dde8, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false });
    const roundelMat = new THREE.MeshBasicMaterial({ map: roundelTex(false), transparent: true, depthWrite: false, side: THREE.DoubleSide });
    const finFlashMat = new THREE.MeshBasicMaterial({ map: roundelTex(true), transparent: true, depthWrite: false, side: THREE.DoubleSide });
    const wellMat = new THREE.MeshBasicMaterial({ color: 0x15171a });

    const myMeshes = [];
    const add = (...args) => { const m = addCADMesh(...args); myMeshes.push(m); return m; };

    // ------------------------------------------------------------------------
    // HİYERARŞİ: root → airframe (poz: yer/uçuş) → parçalar ; kaide (dekor)
    // ------------------------------------------------------------------------
    const root = new THREE.Group();
    root.visible = false;
    scene.add(root);
    const airframe = new THREE.Group();
    root.add(airframe);

    // Yerde duruş açısı: ana tekerlek ve kuyruk tekerleği yere değecek şekilde
    const mainBottom = { y: MAIN_PIVOT.y - LEG - WHEEL_R, z: MAIN_PIVOT.z };
    const tailBottom = { y: TAIL_WHEEL.y - TAIL_WHEEL.r, z: TAIL_WHEEL.z };
    const GROUND_PITCH = Math.atan2(tailBottom.y - mainBottom.y, mainBottom.z - tailBottom.z);
    const GROUND_Y = -(mainBottom.y * Math.cos(GROUND_PITCH) + mainBottom.z * Math.sin(GROUND_PITCH));

    // Müze kaidesi (uçuş pozu) — parça değil, dekor
    const standGroup = new THREE.Group();
    root.add(standGroup);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x5b6470, roughness: 0.4, metalness: 0.7 });
    const standCol = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1, 16), standMat);
    standCol.castShadow = true;
    standGroup.add(standCol);
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.12, 32), standMat);
    standBase.position.y = 0.06;
    standBase.receiveShadow = true;
    standGroup.add(standBase);

    // ===================== A. MOTOR & PERVANE (engine) =====================
    const partProp = createPartGroup({
      id: 'sp_prop', name: 'Rotol 4 Palli Sabit Devirli Pervane & Spinner',
      subsystem: 'engine', subLabel: 'ALT SİSTEM: MERLIN 66 & PERVANE',
      desc: `Ø ${(PROP_R * 2).toFixed(2).replace('.', ',')} m dört palli pervane. Sabit devirli göbek, pal açısını otomatik değiştirerek motoru seçilen devirde tutar. Motor krank mili ile pervane arasındaki redüksiyon dişlisi (Merlin 66'da ≈ 0,477) pervane uçlarının ses hızına yaklaşmasını sınırlar. Yüksek devirde pervane görsel olarak bulanık bir diske dönüşür.`,
      material: 'Ahşap-Kompozit Pal (Jablo/Hydulignum), Duralümin Göbek', weight: '~200 kg', spec: '4 pal, sabit devirli',
      location: 'Burun', basePos: [0, 0, 4.25], explodeVec: [0, 0.2, 2.2], isOuterShell: false
    });
    const propSpin = new THREE.Group();
    propSpin.position.set(0, 0.05, 0.1);
    partProp.add(propSpin);
    add(propSpin, new THREE.ConeGeometry(0.32, 0.48, 28), spinnerMat, [0, 0, 0.24], [Math.PI / 2, 0, 0]);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2;
      const blade = new THREE.Group();
      blade.rotation.z = a;
      propSpin.add(blade);
      add(blade, new THREE.BoxGeometry(0.2, PROP_R - 0.25, 0.05), propMat, [0, 0.25 + (PROP_R - 0.25) / 2, 0.12], [0, 0.35, 0]);
      add(blade, new THREE.BoxGeometry(0.2, 0.12, 0.052), tipMat, [0, PROP_R - 0.06, 0.12], [0, 0.35, 0], false);
    }
    const blurDisc = new THREE.Mesh(new THREE.CircleGeometry(PROP_R, 48), new THREE.MeshBasicMaterial({ color: 0x2a2a2a, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    blurDisc.position.set(0, 0.05, 0.22);
    partProp.add(blurDisc);
    airframe.add(partProp);

    const partEngine = createPartGroup({
      id: 'sp_engine', name: 'Rolls-Royce Merlin 66 — 27 L V12 Motor Bloğu',
      subsystem: 'engine', subLabel: 'ALT SİSTEM: MERLIN 66 & PERVANE',
      desc: '60° V dizilimli, sıvı soğutmalı 27 litrelik V12 benzinli motor. İki sırada altışar silindir, ortak bir krank miline bağlıdır. Mk IX, Fw 190 tehdidine karşı Merlin 60 serisi motorun Spitfire gövdesine uyarlanmasıyla 1942\'de doğdu. X-Ray modunda çalışan pistonlar görünür.',
      material: 'Alüminyum Alaşım Blok, Çelik Krank', weight: '~750 kg (kuru, tahmini)', spec: '27 L, 60° V12, sıvı soğutma',
      location: 'Burun kaportası altı', basePos: [0, 0, 0], explodeVec: [0, 1.6, 1.4], isOuterShell: false
    });
    add(partEngine, new THREE.BoxGeometry(0.42, 0.3, 1.3), engineMat, [0, -0.12, 3.4]);
    const pistons = [];
    [-1, 1].forEach(side => {
      const bank = new THREE.Group();
      bank.position.set(side * 0.14, 0.08, 3.4);
      bank.rotation.z = -side * Math.PI / 6;
      partEngine.add(bank);
      add(bank, new THREE.BoxGeometry(0.24, 0.34, 1.25), engineMat, [0, 0.12, 0]);
      add(bank, new THREE.BoxGeometry(0.22, 0.04, 1.27), chromeMat, [0, 0.3, 0], [0, 0, 0], false);
      for (let i = 0; i < 6; i++) {
        const p = add(bank, new THREE.CylinderGeometry(0.06, 0.06, 0.09, 12), chromeMat, [0, 0.2, -0.52 + i * 0.208], [0, 0, 0], false);
        p.userData.phase = i * (Math.PI / 3) + (side > 0 ? Math.PI : 0);
        p.userData.baseY = 0.2;
        pistons.push(p);
      }
    });
    add(partEngine, new THREE.CylinderGeometry(0.2, 0.24, 0.3, 20), engineMat, [0, 0.05, 4.1], AXIAL);
    airframe.add(partEngine);

    const partSuper = createPartGroup({
      id: 'sp_super', name: 'İki Kademeli İki Hızlı Süperşarj & Ara Soğutucu',
      subsystem: 'engine', subLabel: 'ALT SİSTEM: MERLIN 66 & PERVANE',
      desc: 'Motorun arkasında, aynı mil üzerinde art arda iki kompresör çarkı havayı iki kademede sıkıştırır. Sıkışınca ısınan hava, karbüratöre girmeden önce ara soğutucuda soğutulur. Bu düzen, motorun ince havada yüksek irtifada da güç üretmesini sağladı ve Mk IX\'u Fw 190 ile yeniden boy ölçüşebilir hale getirdi.',
      material: 'Döküm Alüminyum Gövde, Dövme Çark', weight: '~90 kg', spec: '2 kademe × 2 hız',
      location: 'Motorun arkası', basePos: [0, 0, 0], explodeVec: [0, 1.2, -0.6], isOuterShell: false
    });
    add(partSuper, new THREE.CylinderGeometry(0.27, 0.27, 0.42, 24), alloyMat, [0, 0.0, 2.5], AXIAL);
    const impellers = [];
    [2.4, 2.6].forEach(z => impellers.push(add(partSuper, new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16), copperMat, [0, 0.0, z], AXIAL, false)));
    add(partSuper, new THREE.BoxGeometry(0.4, 0.22, 0.32), copperMat, [0, 0.33, 2.55]);
    airframe.add(partSuper);

    const partExhaust = createPartGroup({
      id: 'sp_exhaust', name: 'Ejektör Egzoz Çıkışları (6 + 6)',
      subsystem: 'engine', subLabel: 'ALT SİSTEM: MERLIN 66 & PERVANE',
      desc: 'Her silindirin egzozu, kaportanın yanlarındaki kısa borulardan geriye doğru atılır. Arkaya yönlendirilen egzoz gazı küçük de olsa ek itki sağlar. Yüksek devirde çıkışlarda alevler görülür.',
      material: 'Isıya Dayanıklı Çelik', weight: '~25 kg', spec: '12 çıkış (her silindire bir)',
      location: 'Kaportanın iki yanı', basePos: [0, 0, 0], explodeVec: [0, 0.4, 0.8], isOuterShell: false
    });
    const flames = [];
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x7ab8ff, transparent: true, opacity: 0, depthWrite: false });
    [-1, 1].forEach(side => {
      for (let i = 0; i < 6; i++) {
        const z = 2.85 + i * 0.2;
        add(partExhaust, new THREE.BoxGeometry(0.06, 0.07, 0.12), darkMat, [side * 0.36, 0.2, z], [0, 0, 0], false);
        const fl = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.22, 8, 1, true), flameMat.clone());
        fl.rotation.x = Math.PI / 2;
        fl.position.set(side * 0.38, 0.2, z - 0.15);
        partExhaust.add(fl);
        flames.push(fl);
      }
    });
    airframe.add(partExhaust);

    const partCowl = createPartGroup({
      id: 'sp_cowling', name: 'Motor Kaportası & Karbüratör Hava Girişi',
      subsystem: 'engine', subLabel: 'ALT SİSTEM: MERLIN 66 & PERVANE',
      desc: 'Motoru saran, sökülebilir alüminyum paneller. Mk IX\'un uzun burnu, Merlin 60 serisinin daha uzun iki kademeli süperşarjını barındırır. Burnun altındaki uzun hava girişi karbüratörü besler. X-Ray modunda kaporta saydamlaşır.',
      material: 'Alüminyum Alaşım Panel', weight: '~60 kg', spec: 'Hızlı açılan paneller',
      location: 'Burun', basePos: [0, 0, 0], explodeVec: [0, 1.0, 0.9], isOuterShell: true
    });
    add(partCowl, bodyLathe(FUS_TABLE, 2.2, 4.25, 14, 0.72), cowlMat, [0, 0, 0], AXIAL);
    add(partCowl, new THREE.BoxGeometry(0.18, 0.14, 1.3), cowlMat, [0, -0.5, 3.0]);
    airframe.add(partCowl);

    // ===================== B. GÖVDE & KANAT YAPISI (airframe) =====================
    const partFus = createPartGroup({
      id: 'sp_fuselage', name: 'Yarı Monokok Gövde Kaplaması & İşaretler',
      subsystem: 'airframe', subLabel: 'ALT SİSTEM: GÖVDE & ELİPTİK KANAT',
      desc: 'Taşıyıcı alüminyum kaplama ve iç çerçevelerden oluşan yarı monokok gövde. Kuyruğa doğru incelen oval kesit, sürtünmeyi azaltır. Gövde yanlarında RAF tescil yuvarlakları (roundel) bulunur. X-Ray modunda kaplama saydamlaşır, içteki çerçeveler, yakıt tankları ve kokpit görünür.',
      material: 'Alclad Alüminyum Kaplama', weight: '~300 kg (kaplama)', spec: `Boy ≈ 9,46 m`,
      location: 'Merkez gövde', basePos: [0, 0, 0], explodeVec: [0, 1.2, 0], isOuterShell: true
    });
    add(partFus, bodyLathe(FUS_TABLE, -4.75, 2.2, 36, 0.72), fusMat, [0, 0, 0], AXIAL);
    [-1, 1].forEach(side => add(partFus, new THREE.CircleGeometry(0.32, 32), roundelMat, [side * 0.37, 0.02, -1.7], [0, side * Math.PI / 2, 0], false));
    airframe.add(partFus);

    const partFrames = createPartGroup({
      id: 'sp_frames', name: 'Gövde Çerçeveleri & Uzun Kirişler (Longeron)',
      subsystem: 'airframe', subLabel: 'ALT SİSTEM: GÖVDE & ELİPTİK KANAT',
      desc: 'Gövdenin iskeleti: kesiti belirleyen halka çerçeveler ve bunları boylamasına bağlayan uzun kirişler. Motor yatağı, ön çerçeveye (yangın perdesi) bağlanır. Kaplama bu iskelete perçinlenir ve yükün bir kısmını taşır.',
      material: 'Alüminyum Alaşım Profil', weight: '~180 kg', spec: '~20 çerçeve',
      location: 'Gövde içi', basePos: [0, 0, 0], explodeVec: [0, 2.0, -0.4], isOuterShell: false
    });
    for (let z = -4.2; z <= 2.2; z += 0.45) {
      let r = 0.04;
      for (let k = 0; k < FUS_TABLE.length - 1; k++) if (z >= FUS_TABLE[k][0] && z <= FUS_TABLE[k + 1][0]) { const u = (z - FUS_TABLE[k][0]) / (FUS_TABLE[k + 1][0] - FUS_TABLE[k][0]); r = FUS_TABLE[k][1] + (FUS_TABLE[k + 1][1] - FUS_TABLE[k][1]) * u; }
      const ring = add(partFrames, new THREE.TorusGeometry(r * 0.94, 0.018, 6, 28), alloyMat, [0, 0, z], [0, 0, 0], false);
      ring.scale.set(0.72, 1, 1);
    }
    [[0.3, 0.45], [-0.3, 0.45], [0.3, -0.45], [-0.3, -0.45]].forEach(([x, y]) => {
      const lg = add(partFrames, new THREE.CylinderGeometry(0.02, 0.02, 6.2, 6), alloyMat, [x * 0.9, y * 0.95, -1.0], AXIAL, false);
      lg.scale.set(1, 1, 1);
    });
    add(partFrames, new THREE.BoxGeometry(0.85, 1.1, 0.04), alloyMat, [0, 0, 2.22]); // yangın perdesi
    airframe.add(partFrames);

    const wingGroup = new THREE.Group();
    wingGroup.position.set(0, WING_Y, WING_Z);
    airframe.add(wingGroup);
    const wingGeo = buildSurface({ semi: SEMI, root: ROOT_C, tRoot: 0.132, tTip: 0.06, le: 0.3, full: true, dihedral: DIHEDRAL, nS: 48, nC: 20 });

    const partWing = createPartGroup({
      id: 'sp_wing', name: 'Eliptik Kanat Kaplaması (6° Dihedral)',
      subsystem: 'airframe', subLabel: 'ALT SİSTEM: GÖVDE & ELİPTİK KANAT',
      desc: 'R. J. Mitchell ekibinin tasarladığı ünlü eliptik kanat. Eliptik planform, aynı açıklıkta en düşük indüklenmiş sürüklemeyi verir; ayrıca ince bir kanatta silahlar, mühimmat ve içe katlanan iniş takımı için yeterli iç hacim bırakır. Kesit kökte kalın (≈ %13), uca doğru incedir (≈ %6). X-Ray modunda içteki kiriş, kaburgalar ve silahlar görünür.',
      material: 'Alclad Alüminyum Kaplama', weight: '~400 kg (kanat, tahmini)', spec: '11,23 m açıklık, kök veteri ≈ 2,54 m',
      location: 'Gövde altı (alçak kanat)', basePos: [0, 0, 0], explodeVec: [0, -1.4, 0], isOuterShell: true
    });
    add(partWing, wingGeo.top, topMat);
    add(partWing, wingGeo.bottom, botMat);
    [-1, 1].forEach(side => {
      const s = side * 3.4, c = chordAt(s, ROOT_C, SEMI);
      const yTop = Math.abs(s) * Math.tan(DIHEDRAL) + naca(0.3, 0.132 + (0.06 - 0.132) * Math.abs(s) / SEMI) * c + 0.004;
      add(partWing, new THREE.CircleGeometry(0.45, 32), roundelMat, [s, yTop, 0.3 * c - 0.3 * c], [-Math.PI / 2, 0, 0], false);
      // Tekerlek yuvaları (alt yüzeyde koyu açıklıklar)
      const sw = side * 1.6, cw = chordAt(sw, ROOT_C, SEMI);
      const yBot = Math.abs(sw) * Math.tan(DIHEDRAL) - naca(0.25, 0.132) * cw - 0.004;
      add(partWing, new THREE.CircleGeometry(0.36, 24), wellMat, [sw, yBot, 0.07], [Math.PI / 2, 0, 0], false);
    });
    wingGroup.add(partWing);

    const partSpar = createPartGroup({
      id: 'sp_spar', name: 'Ana Kiriş (İç İçe Kare Borular) & Kaburgalar',
      subsystem: 'airframe', subLabel: 'ALT SİSTEM: GÖVDE & ELİPTİK KANAT',
      desc: 'Kanadın ana taşıyıcısı, iç içe geçmiş kare kesitli borulardan oluşan ve uca doğru incelen bir kiriştir; böylece kök tarafta güçlü, uçta hafif kalır. Kaburgalar kanat kesitini (profilini) belirler. Kirişin önündeki kalın "D" biçimli hücum kenarı kutusu, kanadı burulmaya karşı sertleştirir.',
      material: 'Çelik/Alüminyum Kiriş, Alüminyum Kaburga', weight: '~150 kg', spec: 'İncelen kiriş + ~20 kaburga/kanat',
      location: 'Kanat içi', basePos: [0, 0, 0], explodeVec: [0, -2.3, 0.4], isOuterShell: false
    });
    for (let side = -1; side <= 1; side += 2) {
      for (let k = 0; k < 10; k++) {
        const s0 = side * k * 0.52, s1 = side * (k + 1) * 0.52;
        const sm = (s0 + s1) / 2, c = chordAt(sm, ROOT_C, SEMI);
        const th = naca(0.3, 0.132 + (0.06 - 0.132) * Math.abs(sm) / SEMI) * c * 2 * 0.92;
        add(partSpar, new THREE.BoxGeometry(0.53, Math.max(0.02, th), 0.08), alloyMat, [sm, Math.abs(sm) * Math.tan(DIHEDRAL), 0], [0, 0, side * DIHEDRAL], false);
      }
      for (let k = 1; k <= 10; k++) {
        const s = side * k * 0.5, c = chordAt(s, ROOT_C, SEMI);
        const th = naca(0.3, 0.132 + (0.06 - 0.132) * Math.abs(s) / SEMI) * c * 2 * 0.85;
        add(partSpar, new THREE.BoxGeometry(0.012, Math.max(0.02, th), c * 0.9), alloyMat, [s, Math.abs(s) * Math.tan(DIHEDRAL), 0.3 * c - 0.5 * c], [0, 0, 0], false);
      }
    }
    wingGroup.add(partSpar);

    const partTail = createPartGroup({
      id: 'sp_tail', name: 'Kuyruk Takımı: Yatay & Dikey Stabilize',
      subsystem: 'airframe', subLabel: 'ALT SİSTEM: GÖVDE & ELİPTİK KANAT',
      desc: 'Eliptik yatay stabilize uçağın yunuslama dengesini, dikey stabilize ise yön dengesini sağlar. Dikey stabilizedeki kırmızı-beyaz-mavi şerit (fin flash) RAF tanıma işaretidir. Hareketli dümenler ayrı bir parça grubundadır.',
      material: 'Alüminyum Kaplama', weight: '~60 kg', spec: 'Eliptik yatay stabilize',
      location: 'Gövde kuyruğu', basePos: [0, 0, 0], explodeVec: [0, 0.6, -2.0], isOuterShell: false
    });
    const tailGeo = buildSurface({ semi: 1.6, root: 1.0, tRoot: 0.1, tTip: 0.06, le: 0.35, full: true, nS: 24, nC: 12 });
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.05, -4.0);
    partTail.add(tailGroup);
    add(tailGroup, tailGeo.top, topMat);
    add(tailGroup, tailGeo.bottom, botMat);
    const finGeo = buildSurface({ semi: 1.45, root: 1.35, tRoot: 0.1, tTip: 0.06, le: 0.4, full: false, nS: 20, nC: 12 });
    const finGroup = new THREE.Group();
    finGroup.position.set(0, 0.2, -4.15);
    finGroup.rotation.z = Math.PI / 2;
    partTail.add(finGroup);
    add(finGroup, finGeo.top, topMat);
    add(finGroup, finGeo.bottom, topMat);
    [-1, 1].forEach(side => add(partTail, new THREE.PlaneGeometry(0.42, 0.5), finFlashMat, [side * 0.065, 0.62, -3.85], [0, side * Math.PI / 2, 0], false));
    airframe.add(partTail);

    // ===================== C. KUMANDA & İNİŞ TAKIMI (controls) =====================
    const partSurf = createPartGroup({
      id: 'sp_surfaces', name: 'Kumanda Yüzeyleri: Kanatçık, İrtifa & İstikamet Dümeni',
      subsystem: 'controls', subLabel: 'ALT SİSTEM: KUMANDA & İNİŞ TAKIMI',
      desc: 'Lövye sağa-sola itildiğinde kanatçıklar zıt yönde hareket eder ve uçak yatar (yalpa). Lövye geri çekildiğinde irtifa dümeni yukarı kalkar ve burun yükselir (yunuslama). Pedallar istikamet dümenini çevirir. Sağ paneldeki kaydırıcılar bu hareketleri canlı gösterir; "Kumanda Testi" hepsini otomatik oynatır.',
      material: 'Alüminyum Çerçeve, Kumaş/Metal Kaplama', weight: '~45 kg', spec: 'Kanatçık ±20°, irtifa ±25°, istikamet ±25° (yaklaşık)',
      location: 'Kanat ve kuyruk firar kenarları', basePos: [0, 0, 0], explodeVec: [0, 0.9, -0.9], isOuterShell: false
    });
    const ailerons = [];
    [-1, 1].forEach(side => {
      const sIn = side * 2.6, sOut = side * 4.6;
      const hinge = s => { const c = chordAt(s, ROOT_C, SEMI); return -0.7 * c + 0.25 * c; };
      const zIn = hinge(sIn), zOut = hinge(sOut);
      const mid = new THREE.Vector3((sIn + sOut) / 2, WING_Y + Math.abs((sIn + sOut) / 2) * Math.tan(DIHEDRAL), WING_Z + (zIn + zOut) / 2);
      const g = new THREE.Group();
      g.position.copy(mid);
      const dx = (sOut - sIn) * side, dz = (zOut - zIn) * side;
      g.rotation.y = -Math.atan2(dz, dx) * 1;
      partSurf.add(g);
      const pv = new THREE.Group();
      g.add(pv);
      const avgC = 0.25 * (chordAt(sIn, ROOT_C, SEMI) + chordAt(sOut, ROOT_C, SEMI)) / 2;
      add(pv, new THREE.BoxGeometry(Math.abs(sOut - sIn), 0.035, avgC), side > 0 ? topMat : topMat, [0, 0, -avgC / 2]);
      pv.userData.side = side;
      ailerons.push(pv);
    });
    const elevators = [];
    [-1, 1].forEach(side => {
      const g = new THREE.Group();
      g.position.set(side * 0.78, 0.05, -4.26);
      partSurf.add(g);
      add(g, new THREE.BoxGeometry(1.15, 0.03, 0.32), topMat, [0, 0, -0.16]);
      elevators.push(g);
    });
    const rudder = new THREE.Group();
    rudder.position.set(0, 0.85, -4.55);
    partSurf.add(rudder);
    add(rudder, new THREE.BoxGeometry(0.03, 1.25, 0.42), topMat, [0, 0, -0.21]);
    airframe.add(partSurf);

    const partGear = createPartGroup({
      id: 'sp_gear', name: 'Dışa Katlanan Ana İniş Takımı & Kuyruk Tekerleği',
      subsystem: 'controls', subLabel: 'ALT SİSTEM: KUMANDA & İNİŞ TAKIMI',
      desc: 'Hidrolik ana iniş takımı bacakları gövdeye yakın menteşelerden dışa doğru katlanarak kanat içindeki yuvalara girer. Bu düzen kanat kirişini gövdeye yakın tutmayı kolaylaştırdı, ancak dar bir iz genişliği (≈ 1,7 m) verdi ve yerde manevrayı zorlaştırdı. Mk IX\'da kuyruk tekerleği sabittir. Takım yalnızca uçuş pozunda (kaide üzerinde) toplanabilir.',
      material: 'Çelik Oleo-Pnömatik Amortisör', weight: '~150 kg', spec: 'İz genişliği ≈ 1,7 m',
      location: 'Kanat altı & kuyruk', basePos: [0, 0, 0], explodeVec: [0, -1.6, 0.4], isOuterShell: false
    });
    const gearLegs = [];
    [-1, 1].forEach(side => {
      const g = new THREE.Group();
      g.position.set(side * MAIN_PIVOT.x, MAIN_PIVOT.y, MAIN_PIVOT.z);
      partGear.add(g);
      add(g, new THREE.CylinderGeometry(0.045, 0.05, LEG, 10), chromeMat, [0, -LEG / 2, 0]);
      add(g, new THREE.BoxGeometry(0.03, LEG * 0.85, 0.42), botMat, [side * 0.06, -LEG * 0.45, 0.02]);
      add(g, new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, 0.15, 24), tyreMat, [0, -LEG, 0], [0, 0, Math.PI / 2]);
      add(g, new THREE.CylinderGeometry(0.12, 0.12, 0.16, 16), alloyMat, [0, -LEG, 0], [0, 0, Math.PI / 2], false);
      g.userData.side = side;
      gearLegs.push(g);
    });
    add(partGear, new THREE.CylinderGeometry(0.025, 0.025, 0.28, 8), chromeMat, [0, TAIL_WHEEL.y + 0.14, TAIL_WHEEL.z + 0.05]);
    add(partGear, new THREE.CylinderGeometry(TAIL_WHEEL.r, TAIL_WHEEL.r, 0.07, 16), tyreMat, [0, TAIL_WHEEL.y, TAIL_WHEEL.z], [0, 0, Math.PI / 2]);
    airframe.add(partGear);

    // ===================== D. SİSTEMLER (systems) =====================
    const partRad = createPartGroup({
      id: 'sp_radiators', name: 'Kanat Altı Radyatörler & Yağ/Ara Soğutucu',
      subsystem: 'systems', subLabel: 'ALT SİSTEM: SOĞUTMA, KOKPİT & YAKIT',
      desc: 'Mk IX\'da iki simetrik kanat altı radyatör yuvası vardır: biri motor soğutma sıvısı radyatörü ile süperşarj ara soğutucusunu, diğeri soğutma sıvısı radyatörü ile yağ soğutucusunu barındırır. Arka kapaklar açılıp kapanarak hava akışını ve sürüklemeyi ayarlar.',
      material: 'Bakır-Pirinç Petek, Alüminyum Kanal', weight: '~120 kg (soğutucu sıvı dahil)', spec: '2 yuva, ayarlanabilir çıkış kapağı',
      location: 'Kanat altı', basePos: [0, 0, 0], explodeVec: [0, -1.0, -0.4], isOuterShell: false
    });
    [-1, 1].forEach(side => {
      const x = side * 2.0, c = chordAt(x, ROOT_C, SEMI);
      const yb = WING_Y + Math.abs(x) * Math.tan(DIHEDRAL) - naca(0.4, 0.132) * c;
      add(partRad, new THREE.BoxGeometry(0.55, 0.26, 1.25), botMat, [x, yb - 0.12, WING_Z - 0.35]);
      add(partRad, new THREE.BoxGeometry(0.47, 0.18, 0.05), copperMat, [x, yb - 0.12, WING_Z + 0.28], [0, 0, 0], false);
      add(partRad, new THREE.BoxGeometry(0.5, 0.02, 0.25), botMat, [x, yb - 0.2, WING_Z - 1.05], [0.25, 0, 0], false);
    });
    airframe.add(partRad);

    const partCockpit = createPartGroup({
      id: 'sp_cockpit', name: 'Kokpit: Kabarcık Kanopi, Zırhlı Ön Cam, Koltuk & Lövye',
      subsystem: 'systems', subLabel: 'ALT SİSTEM: SOĞUTMA, KOKPİT & YAKIT',
      desc: 'Geriye kayan kabarcık kanopi pilota geniş görüş sağlar. Ön camın ortasında kurşungeçirmez kalın bir cam bloğu vardır; koltuğun arkasında pilotu korumak için zırh plakası bulunur. Lövye ve pedallar kumanda yüzeylerine kablo ve çubuklarla bağlıdır.',
      material: 'Pleksiglas, Kurşungeçirmez Cam, Zırh Çeliği', weight: '~90 kg', spec: 'Kayar kanopi, zırhlı koltuk',
      location: 'Gövde ortası', basePos: [0, 0, 0], explodeVec: [0, 2.6, 0.2], isOuterShell: false
    });
    const canopy = new THREE.Group();
    partCockpit.add(canopy);
    const bubble = add(canopy, new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), glassMat, [0, 0.58, 0.1], [0, 0, 0], false);
    bubble.scale.set(0.34, 0.3, 0.78);
    add(canopy, new THREE.BoxGeometry(0.5, 0.32, 0.03), glassMat, [0, 0.74, 0.92], [-0.45, 0, 0], false);
    add(canopy, new THREE.BoxGeometry(0.03, 0.04, 1.5), darkMat, [0, 0.89, 0.15], [0, 0, 0], false);
    add(partCockpit, new THREE.BoxGeometry(0.42, 0.08, 0.42), leatherMat, [0, -0.05, -0.15]);
    add(partCockpit, new THREE.BoxGeometry(0.42, 0.55, 0.08), leatherMat, [0, 0.22, -0.38]);
    add(partCockpit, new THREE.BoxGeometry(0.46, 0.6, 0.03), darkMat, [0, 0.25, -0.44]); // zırh plakası
    add(partCockpit, new THREE.BoxGeometry(0.5, 0.22, 0.04), darkMat, [0, 0.38, 0.72], [0.25, 0, 0]); // gösterge paneli
    add(partCockpit, new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8), chromeMat, [0, 0.1, 0.25], [-0.2, 0, 0], false);
    add(partCockpit, new THREE.TorusGeometry(0.06, 0.012, 6, 14), darkMat, [0, 0.36, 0.3], [0, 0, 0], false);
    airframe.add(partCockpit);

    const partFuel = createPartGroup({
      id: 'sp_fuel', name: 'Gövde Yakıt Tankları (Üst + Alt, 85 Galon)',
      subsystem: 'systems', subLabel: 'ALT SİSTEM: SOĞUTMA, KOKPİT & YAKIT',
      desc: 'Motor ile kokpit arasında, yangın perdesinin hemen arkasında üst üste iki yakıt tankı bulunur (toplam yaklaşık 85 İngiliz galonu ≈ 386 L). Küçük iç yakıt kapasitesi Spitfire\'ın menzilini sınırladı; uzun görevlerde gövde altına atılabilir ek tank takılırdı.',
      material: 'Alüminyum Tank, Kendinden Sızdırmaz Kaplama', weight: '~280 kg (dolu, tahmini)', spec: '48 + 37 galon',
      location: 'Yangın perdesi ile kokpit arası', basePos: [0, 0, 0], explodeVec: [0, 2.0, 1.0], isOuterShell: false
    });
    add(partFuel, new THREE.BoxGeometry(0.62, 0.42, 0.8), tankMat, [0, 0.22, 1.7]);
    add(partFuel, new THREE.BoxGeometry(0.62, 0.38, 0.8), tankMat, [0, -0.24, 1.7]);
    add(partFuel, new THREE.CylinderGeometry(0.05, 0.05, 0.06, 12), chromeMat, [0, 0.46, 1.95], [0, 0, 0], false);
    airframe.add(partFuel);

    // ===================== E. SİLAHLAR (armament) =====================
    const partGuns = createPartGroup({
      id: 'sp_guns', name: '"C" Kanadı: 2 × 20 mm Hispano + 4 × .303 Browning',
      subsystem: 'armament', subLabel: 'ALT SİSTEM: SİLAHLAR',
      desc: 'Her kanatta bir 20 mm Hispano topu ve iki .303 Browning makineli tüfek bulunur. Toplar mermi başına çok daha yıkıcıdır ama daha az mermi taşır (top başına 120); makineli tüfekler daha hızlı ateş eder (silah başına 350 mermi). Silahlar uçağın önünde belirli bir mesafede kesişecek şekilde hafifçe içe ayarlanırdı. "Ateşle" butonu 1 saniyelik salvo atar; mühimmat sayıları buna göre azalır.',
      material: 'Çelik Namlu & Mekanizma', weight: '~200 kg (silah + mühimmat)', spec: '20 mm: ~600 atım/dk, .303: ~1.150 atım/dk (yaklaşık)',
      location: 'Kanat içi', basePos: [0, 0, 0], explodeVec: [0, -0.6, 1.6], isOuterShell: false
    });
    const muzzles = [];
    [-1, 1].forEach(side => {
      // Hispano (iç)
      {
        const s = side * 1.95, c = chordAt(s, ROOT_C, SEMI), le = 0.3 * c, y = WING_Y + Math.abs(s) * Math.tan(DIHEDRAL);
        add(partGuns, new THREE.BoxGeometry(0.12, 0.12, 1.0), darkMat, [s, y, WING_Z + le - 0.75]);
        add(partGuns, new THREE.CylinderGeometry(0.03, 0.03, 0.75, 10), darkMat, [s, y, WING_Z + le + 0.1], AXIAL);
        add(partGuns, new THREE.CylinderGeometry(0.06, 0.05, 0.2, 12), botMat, [s, y, WING_Z + le - 0.02], AXIAL, false);
        add(partGuns, new THREE.CylinderGeometry(0.13, 0.13, 0.12, 16), tankMat, [s - side * 0.25, y, WING_Z - 0.55], [0, 0, Math.PI / 2], false); // tambur/şerit kutusu
        muzzles.push({ pos: new THREE.Vector3(s, y, WING_Z + le + 0.5), type: 'cannon' });
      }
      // Browning'ler (dış)
      [2.65, 3.05].forEach(sa => {
        const s = side * sa, c = chordAt(s, ROOT_C, SEMI), le = 0.3 * c, y = WING_Y + Math.abs(s) * Math.tan(DIHEDRAL);
        add(partGuns, new THREE.BoxGeometry(0.07, 0.07, 0.8), darkMat, [s, y, WING_Z + le - 0.5], [0, 0, 0], false);
        add(partGuns, new THREE.CylinderGeometry(0.012, 0.012, 0.15, 8), darkMat, [s, y, WING_Z + le + 0.02], AXIAL, false);
        add(partGuns, new THREE.BoxGeometry(0.12, 0.05, 0.4), tankMat, [s, y, WING_Z - 0.6], [0, 0, 0], false);
        muzzles.push({ pos: new THREE.Vector3(s, y, WING_Z + le + 0.1), type: 'mg' });
      });
    });
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0, depthWrite: false });
    const muzzleFlashes = muzzles.map(m => {
      const f = new THREE.Mesh(new THREE.ConeGeometry(m.type === 'cannon' ? 0.09 : 0.05, m.type === 'cannon' ? 0.45 : 0.25, 8, 1, true), flashMat.clone());
      f.rotation.x = -Math.PI / 2;
      f.position.copy(m.pos).add(new THREE.Vector3(0, 0, m.type === 'cannon' ? 0.22 : 0.12));
      partGuns.add(f);
      return f;
    });
    airframe.add(partGuns);

    // İz mermileri (parça değil)
    const tracerPool = [];
    const tracerGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.9, 6);
    tracerGeo.rotateX(Math.PI / 2);
    for (let i = 0; i < 48; i++) {
      const t = new THREE.Mesh(tracerGeo, new THREE.MeshBasicMaterial({ color: 0xffa64d, transparent: true, opacity: 0.9, depthWrite: false }));
      t.visible = false;
      t.userData = { life: 0, vel: new THREE.Vector3() };
      scene.add(t);
      tracerPool.push(t);
    }

    // ------------------------------------------------------------------------
    // DURUM
    // ------------------------------------------------------------------------
    const S = {
      rpm: 1200, roll: 0, pitch: 0, yaw: 0,
      pose: 'ground', poseT: 0,      // 0 = yerde, 1 = kaidede (uçuş pozu)
      gearTarget: 0, gear: 0,        // 0 = açık (aşağı), 1 = toplanmış
      autoTest: false, autoT: 0,
      firing: 0, fireAcc: 0, gunIdx: 0,
      ammoC: AMMO_CANNON, ammoM: AMMO_MG,
      propAngle: 0, enginePhase: 0,
      scheme: 'dayfighter', relief: true
    };
    const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _f = new THREE.Vector3();

    function fire() {
      if (S.pose !== 'flight' || S.poseT < 0.98) return { ok: false, msg: '<strong>Yerde silahlar emniyette.</strong><br/>Silahları denemek için "Uçuş Pozu (Kaide)" moduna geçin.' };
      if (S.firing > 0) return { ok: false };
      if (S.ammoC <= 0 && S.ammoM <= 0) return { ok: false, msg: '<strong>Mühimmat bitti.</strong>' };
      S.firing = 1.0;
      S.fireAcc = 0;
      S.ammoC = Math.max(0, S.ammoC - 20);   // 2 top × ~10 mermi (1 sn)
      S.ammoM = Math.max(0, S.ammoM - 76);   // 4 MG × ~19 mermi (1 sn)
      if (audio && audio.playGunBurst) audio.playGunBurst();
      return { ok: true };
    }

    function update(dt, elapsed) {
      // Poz geçişi: yere inerken önce takım açılır
      if (S.pose === 'ground') {
        S.gearTarget = 0;
        if (S.gear < 0.01) S.poseT = Math.max(0, S.poseT - dt * 0.6);
      } else {
        S.poseT = Math.min(1, S.poseT + dt * 0.6);
      }
      const e = 0.5 - 0.5 * Math.cos(Math.PI * S.poseT);
      airframe.position.y = GROUND_Y + (FLIGHT_Y - GROUND_Y) * e;
      airframe.rotation.x = -GROUND_PITCH * (1 - e);
      const standTop = FLIGHT_Y - 0.6;
      standGroup.visible = e > 0.01;
      standCol.scale.y = Math.max(0.001, standTop * e);
      standCol.position.y = (standTop * e) / 2;

      // İniş takımı (dışa katlanma: Rz ile tekerlek dışa ve yukarı)
      if (S.poseT > 0.98 || S.gearTarget === 0) S.gear += Math.sign(S.gearTarget - S.gear) * Math.min(Math.abs(S.gearTarget - S.gear), dt * 0.45);
      const gAng = THREE.MathUtils.degToRad(87) * (0.5 - 0.5 * Math.cos(Math.PI * S.gear));
      gearLegs.forEach(g => { g.rotation.z = g.userData.side * gAng; });

      // Kumanda testi
      if (S.autoTest) {
        S.autoT += dt;
        S.roll = Math.sin(S.autoT * 1.3) * 100;
        S.pitch = Math.sin(S.autoT * 0.9 + 1) * 100;
        S.yaw = Math.sin(S.autoT * 0.7 + 2) * 100;
      } else {
        S.yaw *= 1 - Math.min(1, dt * 3);
      }
      // Uçağın sağı −X'tir (pilot +Z'ye bakar). Lövye sağa → sağ kanatçık yukarı, sol kanatçık aşağı.
      ailerons.forEach(a => { a.rotation.x = (a.userData.side < 0 ? 1 : -1) * THREE.MathUtils.degToRad(20) * (S.roll / 100); });
      elevators.forEach(el => { el.rotation.x = THREE.MathUtils.degToRad(25) * (S.pitch / 100); });
      rudder.rotation.y = THREE.MathUtils.degToRad(25) * (S.yaw / 100);

      // Motor & pervane (görsel dönüş hızı sınırlı; yüksek devirde bulanık disk)
      const propRevPerSec = (S.rpm * REDUCTION) / 60;
      S.propAngle += Math.min(propRevPerSec, 2.2) * Math.PI * 2 * dt;
      propSpin.rotation.z = S.propAngle;
      blurDisc.material.opacity = THREE.MathUtils.smoothstep(S.rpm, 700, 1900) * 0.38;
      S.enginePhase += Math.min(S.rpm / 60, 3) * Math.PI * 2 * dt;
      pistons.forEach(p => { p.position.y = p.userData.baseY + Math.sin(S.enginePhase + p.userData.phase) * 0.035; });
      impellers.forEach(m => { m.rotation.y += dt * (S.rpm / 3000) * 25; });
      const flameLevel = THREE.MathUtils.clamp((S.rpm - 900) / 2100, 0, 1);
      flames.forEach((f, i) => { f.material.opacity = flameLevel * (0.45 + 0.35 * Math.sin(elapsed * 40 + i * 1.7)); f.scale.setScalar(0.6 + flameLevel); });

      // Silah salvosu: namlu alevleri ve iz mermileri
      if (S.firing > 0) {
        S.firing = Math.max(0, S.firing - dt);
        S.fireAcc += dt;
        muzzleFlashes.forEach((f, i) => { f.material.opacity = Math.random() > 0.4 ? 0.9 : 0; f.scale.setScalar(0.7 + Math.random() * 0.6); });
        while (S.fireAcc > 0.045) {
          S.fireAcc -= 0.045;
          const m = muzzles[S.gunIdx % muzzles.length];
          S.gunIdx++;
          const tr = tracerPool.find(t => !t.visible);
          if (tr) {
            airframe.localToWorld(_v.copy(m.pos));
            airframe.getWorldQuaternion(_q);
            _f.set(0, 0, 1).applyQuaternion(_q);
            tr.position.copy(_v);
            tr.quaternion.copy(_q);
            tr.userData.vel.copy(_f).multiplyScalar(m.type === 'cannon' ? 55 : 65);
            tr.userData.life = 0;
            tr.material.color.setHex(m.type === 'cannon' ? 0xffd27a : 0xff8a3d);
            tr.visible = true;
          }
        }
      } else {
        muzzleFlashes.forEach(f => { f.material.opacity = 0; });
      }
      tracerPool.forEach(t => {
        if (!t.visible) return;
        t.userData.life += dt;
        t.position.addScaledVector(t.userData.vel, dt);
        if (t.userData.life > 1.1) t.visible = false;
      });
    }

    function applyTextures(blueprint) {
      const st = schemeTex[S.scheme];
      const sc = SCHEMES[S.scheme];
      myMeshes.forEach(m => {
        const role = m.material.userData && m.material.userData.spRole;
        if (!role) return;
        if (role === 'spinner') {
          m.material.color.set(sc.band || (sc.metal ? '#c9cdd1' : '#2b2b2b'));
          m.userData.origColor = m.material.color.clone();
          return;
        }
        m.material.map = blueprint ? null : st[role];
        m.material.bumpMap = (!blueprint && S.relief) ? panelBump : null;
        m.material.metalness = sc.metal ? 0.85 : 0.35;
        m.material.roughness = sc.metal ? 0.25 : 0.55;
        m.material.needsUpdate = true;
      });
    }

    // ------------------------------------------------------------------------
    // ADAPTÖR ARAYÜZÜ
    // ------------------------------------------------------------------------
    const ui = {
      title: 'SUPERMARINE SPITFIRE Mk IX — 1942–45',
      sub: 'Merlin 66 V12 (iki kademeli süperşarj) • Eliptik kanat • "C" kanadı: 2 × 20 mm + 4 × .303',
      partCount: '16 Ana Grup',
      texTitle: '🎨 Boya Şeması & İşaretler',
      textures: Object.keys(SCHEMES).map(k => ({ key: k, label: SCHEMES[k].btn })),
      textureLabel: () => SCHEMES[S.scheme].label,
      activeTexture: () => S.scheme,
      reliefLabel: on => (on ? '🔩 Perçin & Panel Hatları: AÇIK' : '🔩 Perçin & Panel Hatları: KAPALI'),
      relief: () => S.relief,
      subsystems: [
        { key: 'engine', label: 'Merlin 66, Süperşarj & Pervane', color: '#ef4444', count: 5 },
        { key: 'airframe', label: 'Gövde, Eliptik Kanat & Kuyruk', color: '#94a3b8', count: 5 },
        { key: 'controls', label: 'Kumanda Yüzeyleri & İniş Takımı', color: '#d97706', count: 2 },
        { key: 'systems', label: 'Radyatör, Kokpit & Yakıt', color: '#38bdf8', count: 3 },
        { key: 'armament', label: 'Silahlar ("C" Kanadı)', color: '#10b981', count: 1 }
      ],
      camLabels: { iso: 'İzometrik', front: 'Ön Görünüş', breech: 'Merlin Motoru', engine: 'Kokpit', suspension: 'İniş Takımı', top: 'Üst Görünüş' },
      sliders: [
        { label: 'Merlin 66 Motor Devri', min: 0, max: 3000, step: 50, fmt: v => `${Math.round(v)} RPM` },
        { label: 'Lövye: Kanatçıklar (Yalpa)', min: -100, max: 100, step: 1, fmt: v => (Math.abs(v) < 1 ? 'Orta' : `${v > 0 ? 'Sağ' : 'Sol'} %${Math.round(Math.abs(v))}`) },
        { label: 'Lövye: İrtifa Dümeni (Yunuslama)', min: -100, max: 100, step: 1, fmt: v => (Math.abs(v) < 1 ? 'Orta' : `${v > 0 ? 'Geri (burun ↑)' : 'İleri (burun ↓)'} %${Math.round(Math.abs(v))}`) }
      ],
      buttons: { terrain: '🛬 İniş Takımı: Topla / Aç', sweep: '🕹️ Kumanda Testi (Otomatik)', mode: true },
      telemetryTag: 'MERLIN 66',
      statLabels: ['MOTOR GÜCÜ (YAKLAŞIK)', 'PERVANE UÇ HIZI', '20 mm (2 TOP)', '.303 (4 MG)'],
      shadowExtent: 10
    };

    function modeLabel() { return S.pose === 'ground' ? '🛫 Uçuş Pozuna Geç (Müze Kaidesi)' : '🛬 Yer Pozuna Geç (Tekerlekler Üzerinde)'; }
    function getSliderValues() { return [S.rpm, S.roll, S.pitch]; }
    function onSlider(i, v) {
      if (i === 0) S.rpm = v;
      else { S.autoTest = false; if (i === 1) S.roll = v; else S.pitch = v; }
      return {};
    }
    function onButton(name) {
      if (name === 'terrain') {
        if (S.pose !== 'flight' || S.poseT < 0.98) return { active: false, msg: '<strong>Yerde iniş takımı toplanamaz</strong> (uçak gövdesinin üstüne çöker).<br/>Önce "Uçuş Pozu (Kaide)" moduna geçin.' };
        S.gearTarget = S.gearTarget === 0 ? 1 : 0;
        return { active: S.gearTarget === 1 };
      }
      if (name === 'sweep') { S.autoTest = !S.autoTest; S.autoT = 0; return { active: S.autoTest }; }
      if (name === 'mode') {
        S.pose = S.pose === 'ground' ? 'flight' : 'ground';
        return { active: S.pose === 'flight', msg: S.pose === 'flight' ? 'Uçak müze kaidesine kaldırılıyor: düz uçuş duruşu. İniş takımı artık toplanabilir ve silahlar denenebilir.' : 'Uçak yere indiriliyor; önce iniş takımı açılır. Yerde Spitfire, kuyruk tekerleği üzerinde ~13° burnu havada durur.' };
      }
      return {};
    }
    const buttonActive = n => (n === 'terrain' ? S.gearTarget === 1 : n === 'sweep' ? S.autoTest : S.pose === 'flight');
    const fireButtonLabel = () => ((S.ammoC <= 0 && S.ammoM <= 0) ? '📦 MÜHİMMAT İKMALİ' : '💥 SİLAHLARI ATEŞLE (1 SN SALVO)');
    function onFire() {
      if (S.ammoC <= 0 && S.ammoM <= 0) { S.ammoC = AMMO_CANNON; S.ammoM = AMMO_MG; return { ok: true, refill: true }; }
      return fire();
    }
    function getStats() {
      const hp = Math.round(1700 * (S.rpm / 3000));
      const tip = Math.PI * PROP_R * 2 * (S.rpm * REDUCTION) / 60;
      return [
        `${hp.toLocaleString('tr-TR')} <span>BG</span>`,
        `${Math.round(tip)} <span>m/sn (M ${(tip / 340).toFixed(2).replace('.', ',')})</span>`,
        `${S.ammoC} <span>mermi</span>`,
        `${S.ammoM} <span>mermi</span>`
      ];
    }
    function getStatus() {
      if (S.firing > 0) return { text: 'ATEŞ!', color: '#ef4444' };
      const pose = S.poseT > 0.98 ? 'KAİDEDE' : S.poseT < 0.02 ? 'YERDE' : 'POZ DEĞİŞİYOR';
      const gear = S.gear > 0.98 ? 'TAKIM KAPALI' : S.gear < 0.02 ? 'TAKIM AÇIK' : 'TAKIM HAREKETTE';
      return { text: `${pose} • ${gear}`, color: S.poseT > 0.98 ? '#0284c7' : '#64748b' };
    }

    const camPresets = {
      iso: { pos: [8.5, 4.6, 9], look: [0, 1.6, 0] },
      front: { pos: [2.2, 2.4, 9.5], look: [0, 1.9, 1.5] },
      breech: { pos: [3.6, 2.8, 5.8], look: [0, 2.0, 3.0] },
      engine: { pos: [2.2, 3.8, 0.6], look: [0, 2.1, 0.3] },
      suspension: { pos: [3.6, 0.9, 3.2], look: [0.8, 0.6, 0.6] },
      top: { pos: [0.1, 16, 0.1], look: [0, 0, 0] }
    };

    const tourSteps = [
      { title: 'Genel Bakış: Supermarine Spitfire Mk IX', desc: 'II. Dünya Savaşı\'nın simge avcı uçaklarından biri. Mk IX, Fw 190\'ın ortaya çıkışına karşılık, daha güçlü iki kademeli süperşarjlı Merlin 60 serisi motorun Spitfire gövdesine takılmasıyla 1942\'de doğdu. Yerde kuyruk tekerleği üzerinde, burnu havada durur.', explode: 0, cutaway: false, sub: 'all', cam: 'iso', part: partWing },
      { title: 'X-Ray: Merlin 66 V12, Süperşarj ve Yakıt Tankları', desc: 'Kaporta ve gövde kaplaması saydamlaşınca 60° V12 motor (çalışan pistonlarıyla), arkasındaki iki kademeli süperşarj ve yangın perdesinin arkasındaki iki yakıt tankı görünür. Motor devrini artırın: pervane bulanıklaşır, egzozlarda alev görünür.', explode: 0, cutaway: true, sub: 'all', cam: 'breech', part: partEngine },
      { title: 'Eliptik Kanat: Kiriş, Kaburgalar ve Silahlar', desc: 'Kanat kaplaması saydamken uca doğru incelen ana kiriş, profil kaburgaları ve "C" kanadındaki 20 mm Hispano ile .303 Browning\'ler görünür. Eliptik planform hem düşük sürükleme hem de silahlar için iç hacim sağladı.', explode: 0, cutaway: true, sub: 'all', cam: 'top', part: partSpar },
      { title: 'Kumanda Yüzeyleri: Yalpa, Yunuslama, Yön', desc: 'Lövye kaydırıcılarıyla kanatçıkların zıt yönde, irtifa dümeninin yukarı-aşağı hareket ettiğini görün. "Kumanda Testi" istikamet dümeniyle birlikte hepsini otomatik oynatır.', explode: 0, cutaway: false, sub: 'all', cam: 'iso', part: partSurf },
      { title: 'Dışa Katlanan İniş Takımı ve Silah Salvosu', desc: '"Uçuş Pozu (Kaide)" moduna geçin: uçak müze kaidesine yükselir, iniş takımı dışa doğru katlanarak kanat yuvalarına girer. Ardından "Ateşle" ile 1 saniyelik salvoyu ve iz mermilerini izleyin.', explode: 0, cutaway: false, sub: 'all', cam: 'suspension', part: partGear },
      { title: 'Tam Teardown (%85): 16 Mekanik Grup', desc: 'Pervane, motor, süperşarj, egzozlar, kaporta, gövde, çerçeveler, kanat, kiriş, kuyruk, kumanda yüzeyleri, iniş takımı, radyatörler, kokpit, yakıt tankları ve silahlar ayrılmış görünümde.', explode: 85, cutaway: false, sub: 'all', cam: 'iso', part: partFus }
    ];

    return {
      root, ui, camPresets, tourSteps,
      flashMesh: null,
      firePart: partGuns,
      parts: { prop: partProp, engine: partEngine, super: partSuper, exhaust: partExhaust, cowl: partCowl, fuselage: partFus, frames: partFrames, wing: partWing, spar: partSpar, tail: partTail, surfaces: partSurf, gear: partGear, radiators: partRad, cockpit: partCockpit, fuel: partFuel, guns: partGuns },
      defaultPart: partWing,
      update, onSlider, onButton, buttonActive, onFire, fireButtonLabel, modeLabel,
      getSliderValues, getStats, getStatus,
      applyTextures,
      setTexture: k => { if (SCHEMES[k]) S.scheme = k; },
      toggleRelief: () => { S.relief = !S.relief; return S.relief; },
      specs: { SEMI, ROOT_C, PROP_R, REDUCTION, GROUND_PITCH, GROUND_Y }
    };
  };
})();
