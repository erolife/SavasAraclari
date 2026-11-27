/* Mk 41 Dikey Fırlatma Sistemi (VLS) — 8 Hücreli Modül & Ortak Gaz Bacası (1986)
 * ABD Donanması / NAVSEA & Türk Donanması fırkateynleri referanslı 1:1 kesit; iç egzoz U-akışı eğitim yorumudur. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.mk41vls = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'mk41vls');
    const { T, root, parts, mats, mesh, box, cyl, ring, instances } = K;
    const english = window.MuseumPreferences?.language === 'en';
    const t = (tr, en) => (english ? en : tr);

    const state = {
      selectedCell: 1,   // 1..8
      inspectPct: 0,     // 0..100
      speedPct: 75,      // 0..100
      showFlow: true,
      salvoMode: false,
      loaded: [true, true, true, true, true, true, true, true],
      launching: false,
      launchCells: [],
      launchPhase: 0
    };

    const counts = {};
    let partIndex = 0;

    function mat(color, metalness = 0.48, roughness = 0.48, paint = false) {
      const m = new T.MeshStandardMaterial({ color, metalness, roughness, bumpScale: 0.002 });
      m.userData.paint = paint;
      return m;
    }

    const navyMat = mat(0x5b6672, 0.35, 0.62, true);
    const steelMat = mats.steel.clone();
    const darkMat = mats.dark.clone();
    const brassMat = mats.brass.clone();
    const whiteMat = mats.white.clone();
    const canisterMat = mat(0x3a434d, 0.55, 0.44, false);
    const orangeMat = mat(0xd97706, 0.25, 0.55, false);
    const blueRingMat = mat(0x0284c7, 0.35, 0.45, false);
    const flameMat = new T.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.88, side: T.DoubleSide });
    const guideMat = new T.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.42 });

    function part(id, tr, en, subTr, subEn, descTr, descEn, basePos = [0, 0, 0], exp = [0, 0.5, 0], outer = false, parent = root) {
      const sub = t(subTr, subEn);
      counts[sub] = (counts[sub] || 0) + 1;
      const p = K.part(id, ++partIndex + '. ' + t(tr, en), sub, basePos, exp, t(descTr, descEn), outer, parent);
      Object.assign(p.userData, {
        material: t('Denizcilik çeliği, ablatif egzoz astarı ve alüminyum/kompozit kanisterler', 'Marine structural steel, ablative exhaust liner & composite canisters'),
        weight: t('~14,5 ton boş modül ağırlığı (1:1 ölçek 8 hücre)', '~14.5 t empty module weight (1:1 scale 8-cell)'),
        spec: t('Strike-Length 7,7 m • Tekli & Quad-Pack ESSM • Ortak Plenum + Uptake Egzoz', 'Strike-Length 7.7 m • Single & Quad-Pack ESSM • Common Plenum + Uptake')
      });
      return p;
    }

    // 2×4 hücre koordinatları: Sol sıra x = -0.92 (1..4), Sağ sıra x = +0.92 (5..8), merkez baca x = 0
    const CELLS = [];
    for (let i = 0; i < 8; i++) {
      const col = i < 4 ? -1 : 1;
      const row = i % 4;
      CELLS.push({ idx: i, x: col * 0.92, z: -1.14 + row * 0.76 });
    }

    // -------------------------------------------------------------------------
    // A. GEMİ GÜVERTESİ & ZIRHLI ŞASİ (4 Grup)
    // -------------------------------------------------------------------------
    const keelBase = part('keelBase',
      'Alt Gemi Omurga Kaidesi (y = 0)', 'Lower ship deck foundation (y = 0)',
      'Gemi Güvertesi ve Şasi', 'Ship Deck & Structure',
      'Modül yükünü gemi alt güverte kirişlerine aktaran çelik taban plakası ve destek ayakları.',
      'Structural steel base plate and mounts transferring launcher loads into the ship hull frames.',
      [0, 0, 0], [0, -0.3, 0]
    );
    box(keelBase, [3.40, 0.16, 4.10], [0, 0.08, 0], darkMat); // min.y = 0.000!

    const moduleFrame = part('moduleFrame',
      '8 Hücreli Çelik Modül Kafesi', '8-cell Strike-Length steel frame',
      'Gemi Güvertesi ve Şasi', 'Ship Deck & Structure',
      'Hücreleri 2×4 düzende tutan dikey taşıyıcı sütunlar ve şok emici ara kuşaklar; X-Ray ile içi açılır.',
      'Vertical framework supporting eight 7.7 m Strike-Length cells; open X-Ray to view canisters.',
      [0, 0, 0], [0, 0.4, -0.8], true
    );
    for (const sx of [-1.52, -0.34, 0.34, 1.52]) {
      for (const sz of [-1.62, 1.62]) {
        box(moduleFrame, [0.10, 6.80, 0.10], [sx, 3.66, sz], navyMat);
      }
    }
    for (const hy of [1.45, 3.85, 6.20]) {
      box(moduleFrame, [3.14, 0.08, 0.10], [0, hy, -1.62], steelMat);
      box(moduleFrame, [3.14, 0.08, 0.10], [0, hy, 1.62], steelMat);
    }

    const shipDeck = part('shipDeck',
      'Üst Zırhlı Savaş Gemisi Güvertesi', 'Upper armored warship deck',
      'Gemi Güvertesi ve Şasi', 'Ship Deck & Structure',
      'Füze ağızlarını ve merkez egzoz bacasını açık bırakan 8 bölmeli zırhlı güverte kaplaması.',
      'Armored main weather deck framed around all eight cell openings and the central uptake hatch.',
      [0, 0, 0], [0, 1.2, 0], true
    );
    // Çevre çerçeve levhaları + enine bölme kirişleri (gerçek açık hücre ağızları)
    box(shipDeck, [3.50, 0.18, 0.44], [0, 7.12, -1.78], navyMat);
    box(shipDeck, [3.50, 0.18, 0.44], [0, 7.12, 1.78], navyMat);
    for (const sx of [-1.56, 1.56]) box(shipDeck, [0.38, 0.18, 3.20], [sx, 7.12, 0], navyMat);
    for (const sx of [-0.42, 0.42]) box(shipDeck, [0.18, 0.18, 3.20], [sx, 7.12, 0], navyMat);
    for (const sz of [-0.76, 0, 0.76]) box(shipDeck, [3.10, 0.16, 0.12], [0, 7.12, sz], navyMat);

    const deckHatches = part('deckHatches',
      '8× Menteşeli Zırhlı Hücre Kapağı', '8× Hinged armored cell hatches',
      'Gemi Güvertesi ve Şasi', 'Ship Deck & Structure',
      'Su ve alev sızdırmaz contalı, ateşleme öncesinde hidrolik olarak 88° açılan güverte kapakları.',
      'Watertight armored hatches opening 88° hydraulically prior to vertical missile ignition.',
      [0, 0, 0], [0, 1.5, 0]
    );
    const hatchPivots = [];
    for (const c of CELLS) {
      const side = c.x < 0 ? -1 : 1;
      const hp = new T.Group();
      hp.name = 'hatch-pivot-' + (c.idx + 1);
      hp.position.set(c.x + side * 0.34, 7.24, c.z);
      deckHatches.add(hp);
      box(hp, [0.66, 0.08, 0.62], [-side * 0.34, 0.04, 0], navyMat);
      cyl(hp, 0.03, 0.46, [0, 0.04, 0], brassMat, 'z');
      hatchPivots.push({ pivot: hp, side });
    }

    // -------------------------------------------------------------------------
    // B. 8 HÜCRELİ KANİSTERLER & ÇOKLU MÜHİMMAT (6 Grup)
    // -------------------------------------------------------------------------
    const canistersLeft = part('canistersLeft',
      'İskele Sırası Kanisterleri (Hücre 1–4)', 'Port-row canisters (Cells 1–4)',
      '8 Hücreli Kanister ve Füzeler', '8-Cell Canisters & Missiles',
      'Hücre 1–3 SM-2/6 ve Hücre 4 Tomahawk füzelerini taşıyan çelik fırlatma kanisterleri; X-Ray ile saydamlaşır.',
      'Steel launch canisters housing SM-2/6 (Cells 1–3) and Tomahawk (Cell 4); transparent in X-Ray.',
      [0, 0, 0], [-0.9, 0.3, 0], true
    );
    const canistersRight = part('canistersRight',
      'Sancak Sırası Kanisterleri (Hücre 5–8)', 'Starboard-row canisters (Cells 5–8)',
      '8 Hücreli Kanister ve Füzeler', '8-Cell Canisters & Missiles',
      'Hücre 5 Tomahawk, Hücre 6–7 dörtlü ESSM ve Hücre 8 VL-ASROC kanisterleri; X-Ray ile içi görülür.',
      'Starboard canisters housing Tomahawk (Cell 5), Quad-Pack ESSM (6–7), and VL-ASROC (Cell 8).',
      [0, 0, 0], [0.9, 0.3, 0], true
    );
    for (const c of CELLS) {
      const parentGrp = c.idx < 4 ? canistersLeft : canistersRight;
      box(parentGrp, [0.62, 5.75, 0.62], [c.x, 4.15, c.z], canisterMat);
      ring(parentGrp, 0.28, [c.x, 7.04, c.z], brassMat, 0.025, [Math.PI / 2, 0, 0]);
    }

    const missilePivots = Array.from({ length: 8 }, (_, idx) => {
      const mg = new T.Group();
      mg.name = 'missile-cell-' + (idx + 1);
      mg.position.set(CELLS[idx].x, 1.35, CELLS[idx].z);
      return mg;
    });

    const smMissiles = part('smMissiles',
      'Hücre 1–3: SM-2 / SM-6 Hava Savunma Füzeleri', 'Cells 1–3: SM-2 / SM-6 SAM missiles',
      '8 Hücreli Kanister ve Füzeler', '8-Cell Canisters & Missiles',
      'Uzun menzilli filo hava ve balistik füze savunması için Standart Füze ailesi.',
      'Standard Missile air-defense and ballistic missile defense interceptors in Cells 1–3.',
      [0, 0, 0], [-1.3, 1.0, -0.5]
    );
    for (const idx of [0, 1, 2]) {
      const m = missilePivots[idx];
      smMissiles.add(m);
      cyl(m, 0.14, 4.40, [0, 2.55, 0], whiteMat, 'y');
      mesh(m, new T.ConeGeometry(0.14, 0.55, 16), orangeMat, [0, 5.02, 0]);
      box(m, [0.46, 0.42, 0.03], [0, 1.0, 0], darkMat);
      box(m, [0.03, 0.42, 0.46], [0, 1.0, 0], darkMat);
    }

    const tomahawk = part('tomahawk',
      'Hücre 4–5: BGM-109 Tomahawk Seyir Füzeleri', 'Cells 4–5: BGM-109 Tomahawk cruise missiles',
      '8 Hücreli Kanister ve Füzeler', '8-Cell Canisters & Missiles',
      'Katlanır kanatlı uzun menzilli kara taarruz seyir füzesi (Hücre 4 ve 5).',
      'Long-range folding-wing Tomahawk land-attack cruise missiles loaded in Cells 4 and 5.',
      [0, 0, 0], [0, 1.1, 1.1]
    );
    for (const idx of [3, 4]) {
      const m = missilePivots[idx];
      tomahawk.add(m);
      cyl(m, 0.19, 4.55, [0, 2.55, 0], navyMat, 'y');
      mesh(m, new T.SphereGeometry(0.19, 14, 10), darkMat, [0, 4.82, 0]);
      cyl(m, 0.21, 0.78, [0, 0.55, 0], orangeMat, 'y'); // katı yakıtlı booster
    }

    const essmQuad = part('essmQuad',
      'Hücre 6–7: Quad-Pack 4’lü ESSM Kümesi', 'Cells 6–7: Quad-Pack 4× ESSM bundles',
      '8 Hücreli Kanister ve Füzeler', '8-Cell Canisters & Missiles',
      'Tek Mk 41 hücresinin içine 4 adet Evolved SeaSparrow füzesi sığdıran modüler küme düzeneği.',
      'Quad-Pack adapter packing four Evolved SeaSparrow interceptors inside a single VLS cell.',
      [0, 0, 0], [1.4, 1.0, 0]
    );
    for (const idx of [5, 6]) {
      const m = missilePivots[idx];
      essmQuad.add(m);
      for (const qx of [-0.14, 0.14]) {
        for (const qz of [-0.14, 0.14]) {
          cyl(m, 0.085, 3.45, [qx, 2.15, qz], whiteMat, 'y');
          mesh(m, new T.ConeGeometry(0.085, 0.34, 12), blueRingMat, [qx, 4.04, qz]);
        }
      }
      box(m, [0.46, 0.08, 0.46], [0, 0.48, 0], darkMat);
    }

    const vlaAsroc = part('vlaAsroc',
      'Hücre 8: VL-ASROC Denizaltı Savunma Roketi', 'Cell 8: RUM-139 VL-ASROC anti-submarine rocket',
      '8 Hücreli Kanister ve Füzeler', '8-Cell Canisters & Missiles',
      'Hafif torpidoyu roket itkisiyle uzaktaki denizaltı bölgesine taşıyan dikey atışlı ASW füzesi.',
      'Vertical Launch Anti-Submarine Rocket carrying a lightweight torpedo standoff payload.',
      [0, 0, 0], [1.3, 1.1, 0.8]
    );
    {
      const m = missilePivots[7];
      vlaAsroc.add(m);
      cyl(m, 0.15, 3.95, [0, 2.35, 0], brassMat, 'y');
      mesh(m, new T.ConeGeometry(0.15, 0.45, 14), orangeMat, [0, 4.55, 0]);
      box(m, [0.42, 0.36, 0.03], [0, 0.72, 0], darkMat);
    }

    // -------------------------------------------------------------------------
    // C. ORTAK EGZOZ YÖNETİMİ: PLENUM & UPTAKE (5 Grup)
    // -------------------------------------------------------------------------
    const plenumChamber = part('plenumChamber',
      'Alt Ortak Egzoz Toplama Odası (Plenum)', 'Lower common exhaust plenum',
      'Ortak Egzoz ve Güvenlik', 'Exhaust Plenum & Uptake',
      '8 hücrenin tüm sıcak roket egzozunu altta karşılayıp ablatif ısı astarıyla merkez bacaya yönlendiren oda.',
      'Common ablative-lined lower chamber collecting booster exhaust from all eight launch cells.',
      [0, 0, 0], [0, -0.4, 0], true
    );
    box(plenumChamber, [3.08, 0.96, 3.22], [0, 0.72, 0], darkMat);
    box(plenumChamber, [2.70, 0.18, 2.86], [0, 0.32, 0], orangeMat); // ısı kalkanı deflektörü

    const uptakeShaft = part('uptakeShaft',
      'Merkez Zırhlı Gaz Tahliye Bacası (Uptake)', 'Central armored exhaust uptake shaft',
      'Ortak Egzoz ve Güvenlik', 'Exhaust Plenum & Uptake',
      'İki sıra hücrenin tam ortasından yukarı yükselerek sıcak gazı güverte üzerine güvenle atan baca.',
      'Armored central exhaust uptake venting deflected rocket gases vertically above the weather deck.',
      [0, 0, 0], [0, 0.9, 0], true
    );
    box(uptakeShaft, [0.58, 5.95, 2.90], [0, 4.18, 0], canisterMat);

    const uptakeHatch = part('uptakeHatch',
      'Merkez Baca Üst Tahliye Kapağı', 'Uptake top exhaust hatch',
      'Ortak Egzoz ve Güvenlik', 'Exhaust Plenum & Uptake',
      'Herhangi bir hücre ateşlenirken füzeyle aynı anda açılıp egzoz gazını göğe tahliye eden zırhlı kapak.',
      'Armored top damper opening simultaneously with the active cell hatch to vent exhaust gas.',
      [0, 0, 0], [0, 1.7, 0]
    );
    const uptakePivot = new T.Group();
    uptakePivot.name = 'uptake-hatch-pivot';
    uptakePivot.position.set(0.28, 7.25, 0);
    uptakeHatch.add(uptakePivot);
    box(uptakePivot, [0.56, 0.09, 2.84], [-0.28, 0.04, 0], navyMat);

    const delugeSystem = part('delugeSystem',
      'Deniz Suyu Bastırma ve Soğutma Boruları', 'Seawater deluge suppression manifold',
      'Ortak Egzoz ve Güvenlik', 'Exhaust Plenum & Uptake',
      'Tutuşmamış yakıt veya aşırı ısınmaya karşı her hücre ağzına su perdesi basan güvenlik hattı.',
      'High-pressure seawater deluge manifold preventing heat buildup or accidental ignition.',
      [0, 0, 0], [0, 0.6, 0.9]
    );
    for (const sx of [-0.46, 0.46]) {
      cyl(delugeSystem, 0.045, 3.05, [sx, 6.75, 0], blueRingMat, 'z');
    }

    const exhaustFlow = part('exhaustFlow',
      'U-Yörüngeli Sıcak Gaz Akışı (Hücre → Plenum → Baca)', 'U-path exhaust gas plume (Cell → Plenum → Uptake)',
      'Ortak Egzoz ve Güvenlik', 'Exhaust Plenum & Uptake',
      'Ateşlenen füzeye ait egzozun aşağı plenum odasına inip merkez bacadan yukarı çıkışını gösteren akış yolu.',
      'Illustrates hot booster gases descending into the plenum and venting up the central uptake shaft.',
      [0, 0, 0], [0, 0.4, 0]
    );
    ring(exhaustFlow, 0.24, [0, 7.24, 0], orangeMat, 0.02, [Math.PI / 2, 0, 0]);
    const cellDownJet = new T.Mesh(new T.CylinderGeometry(0.18, 0.28, 5.2, 14), flameMat);
    cellDownJet.position.set(CELLS[0].x, 3.8, CELLS[0].z);
    cellDownJet.visible = false;
    exhaustFlow.add(cellDownJet);
    const plenumGlow = new T.Mesh(new T.BoxGeometry(2.4, 0.45, 0.85), flameMat);
    plenumGlow.position.set(0, 0.68, 0);
    plenumGlow.visible = false;
    exhaustFlow.add(plenumGlow);
    const uptakePlume = new T.Mesh(new T.CylinderGeometry(0.24, 0.42, 8.6, 16), flameMat);
    uptakePlume.position.set(0, 5.4, 0);
    uptakePlume.visible = false;
    exhaustFlow.add(uptakePlume);
    const guideArrow = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 6.4, 10), guideMat);
    guideArrow.position.set(0, 4.2, 0);
    exhaustFlow.add(guideArrow);

    // -------------------------------------------------------------------------
    // D. KONTROL, GÖBEK BAĞLANTILARI & İKMAL (3 Grup)
    // -------------------------------------------------------------------------
    const launchSequencer = part('launchSequencer',
      'LCU Ateşleme Kontrol Kabini', 'Launch Control Unit (LCU) cabinet',
      'Kontrol ve İkmal', 'Control & Reload',
      'Hücre seçimi, füze sağlık sorgusu ve kapak kilitleme dizisini yöneten dijital kontrol kabini.',
      'Digital Launch Control Unit managing cell selection, Built-In Test and hatch sequencing.',
      [0, 0, 0], [0, 0.4, -1.2]
    );
    box(launchSequencer, [1.10, 1.35, 0.28], [0, 2.10, -1.78], steelMat);
    box(launchSequencer, [0.36, 0.24, 0.06], [-0.22, 2.45, -1.94], blueRingMat);

    const umbilicals = part('umbilicals',
      'Hücre Göbek Veri Kabloları & Tutma Mandalı', 'Cell umbilical cables & hold-down latches',
      'Kontrol ve İkmal', 'Control & Reload',
      'Motor ateşlenene kadar füzeyi kanister içinde kilitleyen mandallar ve hızlı ayrılan veri kabloları.',
      'Hold-down latches and breakaway umbilical connectors providing pre-launch targeting data.',
      [0, 0, 0], [0, 0.2, 0.6]
    );
    for (const c of CELLS) {
      box(umbilicals, [0.06, 0.90, 0.10], [c.x + (c.x < 0 ? 0.34 : -0.34), 6.20, c.z], brassMat);
    }

    const reloadCrane = part('reloadCrane',
      'Güverte Üstü İkmal Kılavuz Çerçevesi', 'Deck stowable reload guide frame',
      'Kontrol ve İkmal', 'Control & Reload',
      'Liman ikmalinde boş kanisterlerin vinçle çıkarılıp yeni mühimmat yüklenmesine rehberlik eden kol.',
      'Foldable deck guide frame assisting dockside crane insertion of fresh missile canisters.',
      [0, 0, 0], [1.2, 1.4, 0]
    );
    box(reloadCrane, [0.14, 0.26, 2.60], [1.48, 7.36, 0], steelMat);
    box(reloadCrane, [0.45, 0.14, 0.22], [1.26, 7.44, -1.20], orangeMat);

    // -------------------------------------------------------------------------
    // E. SİNKRONİZASYON & ANİMASYON
    // -------------------------------------------------------------------------
    function sync() {
      const inspectRad = (state.inspectPct / 100) * 1.52;
      const anyActiveLaunch = state.launching;

      for (let i = 0; i < 8; i++) {
        const isSel = i === state.selectedCell - 1;
        const isFiringCell = anyActiveLaunch && state.launchCells.includes(i);
        let openAngle = isSel ? inspectRad : 0;
        if (isFiringCell) {
          const p = state.launchPhase;
          const fireOpen = p < 0.14 ? (p / 0.14) * 1.52 : p < 0.85 ? 1.52 : (1 - (p - 0.85) / 0.15) * 1.52;
          openAngle = Math.max(openAngle, fireOpen);
        }
        hatchPivots[i].pivot.rotation.z = openAngle > 0 ? -hatchPivots[i].side * openAngle : 0;

        const m = missilePivots[i];
        if (!state.loaded[i] && !isFiringCell) {
          m.visible = false;
          m.position.y = 1.35;
        } else {
          m.visible = true;
          if (isFiringCell) {
            const p = state.launchPhase;
            const rise = p < 0.16 ? 0 : Math.pow((p - 0.16) / 0.84, 1.45) * 9.5;
            m.position.y = 1.35 + rise;
          } else {
            m.position.y = 1.35;
          }
        }
      }

      const uptakeAngle = anyActiveLaunch
        ? (state.launchPhase < 0.14 ? (state.launchPhase / 0.14) * 1.52 : state.launchPhase < 0.88 ? 1.52 : (1 - (state.launchPhase - 0.88) / 0.12) * 1.52)
        : inspectRad;
      uptakePivot.rotation.z = uptakeAngle > 0 ? -uptakeAngle : 0;

      const showFlame = anyActiveLaunch && state.launchPhase > 0.12 && state.launchPhase < 0.90;
      if (showFlame && state.launchCells.length > 0) {
        const primary = CELLS[state.launchCells[0]];
        cellDownJet.position.set(primary.x, 3.8, primary.z);
        cellDownJet.visible = true;
        plenumGlow.visible = true;
        uptakePlume.visible = true;
      } else {
        cellDownJet.visible = false;
        plenumGlow.visible = false;
        uptakePlume.visible = false;
      }
      guideArrow.visible = state.showFlow;
    }

    function reset() {
      Object.assign(state, {
        selectedCell: 1,
        inspectPct: 0,
        speedPct: 75,
        showFlow: true,
        salvoMode: false,
        loaded: [true, true, true, true, true, true, true, true],
        launching: false,
        launchCells: [],
        launchPhase: 0
      });
      sync();
    }

    const camPresets = {
      iso: { pos: [7.8, 7.2, 8.8], look: [0, 3.6, 0] },
      front: { pos: [0.4, 5.2, 9.6], look: [0, 3.6, 0] },
      breech: { pos: [4.2, 9.2, 4.6], look: [0, 7.2, 0] },
      engine: { pos: [5.4, 3.8, 5.4], look: [0, 2.8, 0] },
      suspension: { pos: [4.6, 1.4, 4.8], look: [0, 0.7, 0] },
      top: { pos: [0.1, 13.8, 0.2], look: [0, 7.0, 0] }
    };

    const tourSteps = [
      [['8 Hücreli Mk 41 Strike-Length Modülü', '8-cell Mk 41 Strike-Length module'], ['Ticonderoga, Arleigh Burke ve müttefik fırkateynlerin güvertesi altına gömülü dikey fırlatma hücresi.', 'Below-deck modular vertical launching system aboard Ticonderoga, Arleigh Burke and allied frigates.'], 'iso', 'moduleFrame', false],
      [['Güverte Kapakları ve Hücre İçi Çeşitlilik', 'Armored hatches & multi-missile load'], ['Aynı standart modül SM-2/6, Tomahawk, 4’lü Quad-Pack ESSM ve VL-ASROC füzelerini barındırır.', 'A single module mixes SM-2/6, Tomahawk, Quad-Pack ESSM and VL-ASROC canisters seamlessly.'], 'breech', 'deckHatches', false],
      [['Alt Ortak Plenum Egzoz Toplama Odası', 'Lower common exhaust plenum'], ['X-Ray’i açın: fırlatılan roketin sıcak gazı hücre tabanından inip ablatif astarlı plenumda toplanır.', 'Enable X-Ray: rocket exhaust drops into the ablative lower plenum before turning toward the uptake.'], 'suspension', 'plenumChamber', true],
      [['Merkez Zırhlı Gaz Bacası (U-Akış)', 'Central armored exhaust uptake shaft'], ['Plenumda yön değiştiren gaz, iki hücre sırasının ortasındaki ortak zırhlı bacadan göğe tahliye edilir.', 'Deflected gases climb the central armored uptake shaft between the two 4-cell banks cleanly.'], 'engine', 'uptakeShaft', true],
      [['Quad-Pack: Tek Hücrede 4 ESSM', 'Quad-Pack: 4 ESSM per cell'], ['Hücre 6 ve 7’deki modüler küme sayesinde ateş gücü dört katına çıkar; X-Ray ile içini inceleyin.', 'Quad-Pack adapters fit four Evolved SeaSparrow missiles inside cells 6 and 7.'], 'engine', 'essmQuad', true],
      [['Tekli Fırlatma ve 2’li Salvo Döngüsü', 'Single shot & dual salvo launch'], ['Ateşle düğmesiyle hücre ve baca kapaklarının eşzamanlı açılışını ve U-yörüngeli alevi izleyin.', 'Press Fire to trigger synchronized hatch opening, vertical ignition and plenum-uptake exhaust.'], 'iso', 'exhaustFlow', false]
    ].map(([title, desc, cam, key, cutaway]) => ({
      title: t(...title), desc: t(...desc), cam, part: parts[key], cutaway, explode: 0, sub: 'all'
    }));

    const ui = K.ui({
      cameraPadding: 0.86,
      title: t('MK 41 VLS — 8 HÜCRELİ DİKEY FIRLATMA SİSTEMİ (1986)', 'MK 41 VLS — 8-CELL VERTICAL LAUNCHING SYSTEM (1986)'),
      sub: t('Ortak Plenum & Uptake Gaz Bacası • SM-2 / Tomahawk / Quad-Pack ESSM / VL-ASROC', 'Common Plenum & Uptake Exhaust • SM-2 / Tomahawk / Quad-Pack ESSM / VL-ASROC'),
      subsystems: Object.entries(counts).map(([key, count]) => ({ key, label: key, count, color: '#5b6672' })),
      camLabels: Object.fromEntries(Object.entries({
        iso: ['Genel Sergi', 'Full exhibit'],
        front: ['Ön Kesit', 'Front view'],
        breech: ['Güverte Kapakları', 'Deck hatches'],
        engine: ['X-Ray Plenum & Baca', 'X-Ray Plenum & Uptake'],
        suspension: ['Alt Plenum Odası', 'Lower plenum'],
        top: ['Üst Görünüş', 'Top view']
      }).map(([k, v]) => [k, t(...v)])),
      sliders: [
        [['Seçili VLS Hücresi', 'Selected VLS cell'], 1, 8, ''],
        [['Kapak İnceleme Açısı', 'Hatch inspection angle'], 0, 100, '%'],
        [['Fırlatma Oynatma Hızı', 'Launch playback speed'], 0, 100, '%']
      ].map(([labels, min, max, unit]) => ({
        label: t(...labels), min, max, step: 1, fmt: v => (unit ? Math.round(v) + unit : '#' + Math.round(v))
      })),
      buttons: {
        terrain: t('Egzoz U-Akış Şeması', 'Exhaust U-flow guide'),
        sweep: t('Sistemi Sıfırla', 'Reset system'),
        mode: true
      },
      telemetryTag: t('MK 41 VLS • 8 HÜCRE • ORTAK UPTAKE', 'MK 41 VLS • 8-CELL • COMMON UPTAKE'),
      statLabels: [
        ['SEÇİLİ HÜCRE', 'SELECTED CELL'],
        ['MÜHİMMAT TİPİ', 'PAYLOAD'],
        ['FIRLATMA KİPİ', 'LAUNCH MODE'],
        ['HAZIR HÜCRE', 'LOADED CELLS']
      ].map(v => t(...v))
    });

    sync();

    const PAYLOAD_NAMES = [
      'SM-2 / SM-6', 'SM-2 / SM-6', 'SM-2 / SM-6',
      'Tomahawk', 'Tomahawk',
      '4× ESSM Quad', '4× ESSM Quad', 'VL-ASROC'
    ];

    return {
      root, parts, ui, camPresets, tourSteps,
      defaultPart: parts.uptakeShaft, firePart: parts.exhaustFlow,
      hatchPivots, uptakePivot, missilePivots,
      update(dt) {
        if (!Number.isFinite(dt)) return;
        dt = T.MathUtils.clamp(dt, 0, 0.05);
        if (state.launching && state.speedPct > 0) {
          state.launchPhase += dt * (0.18 + (state.speedPct / 100) * 0.95);
          if (state.launchPhase >= 1) {
            state.launching = false;
            state.launchPhase = 0;
            state.launchCells = [];
          }
        }
        sync();
      },
      onFire() {
        const readyCount = state.loaded.filter(Boolean).length;
        if (readyCount === 0) {
          state.loaded = [true, true, true, true, true, true, true, true];
          state.launching = false;
          state.launchCells = [];
          state.launchPhase = 0;
          sync();
          return { ok: true, resupplied: true };
        }
        if (state.launching) return { ok: false };
        const chosen = [];
        const pref = state.selectedCell - 1;
        if (state.loaded[pref]) chosen.push(pref);
        else chosen.push(state.loaded.findIndex(Boolean));
        if (state.salvoMode) {
          const second = state.loaded.findIndex((v, i) => v && !chosen.includes(i));
          if (second !== -1) chosen.push(second);
        }
        for (const cIdx of chosen) state.loaded[cIdx] = false;
        state.launchCells = chosen;
        state.launching = true;
        state.launchPhase = 0.001;
        sync();
        if (ctx.audio?.playCannonFire) ctx.audio.playCannonFire();
        return { ok: true };
      },
      fireButtonLabel: () => {
        const left = state.loaded.filter(Boolean).length;
        return t(left > 0 ? 'VLS FIRLAT (' + left + '/8)' : '8 HÜCRE İKMALİ', left > 0 ? 'LAUNCH VLS (' + left + '/8)' : 'RELOAD ALL 8 CELLS');
      },
      mobileFireButtonLabel: () => {
        const left = state.loaded.filter(Boolean).length;
        return t(left > 0 ? 'FIRLAT' : 'İKMAL', left > 0 ? 'LAUNCH' : 'RELOAD');
      },
      modeLabel: () => t(
        state.salvoMode ? 'Fırlatma Kipi: 2’li Salvo' : 'Fırlatma Kipi: Tekli Hücre',
        state.salvoMode ? 'Launch Mode: Dual Salvo' : 'Launch Mode: Single Cell'
      ),
      onSlider(i, v) {
        if (!Number.isFinite(v)) return {};
        const clamped = T.MathUtils.clamp(v, ui.sliders[i].min, ui.sliders[i].max);
        if (i === 0) state.selectedCell = Math.round(clamped);
        else if (i === 1) state.inspectPct = clamped;
        else if (i === 2) state.speedPct = clamped;
        sync();
        return {};
      },
      onButton(name) {
        if (name === 'terrain') {
          state.showFlow = !state.showFlow;
          sync();
        } else if (name === 'sweep') {
          reset();
        } else if (name === 'mode') {
          state.salvoMode = !state.salvoMode;
          sync();
        }
        return {};
      },
      buttonActive: name => (name === 'terrain' && state.showFlow) || (name === 'mode' && state.salvoMode),
      getSliderValues: () => [state.selectedCell, state.inspectPct, state.speedPct],
      getStats: () => {
        const left = state.loaded.filter(Boolean).length;
        const idx = state.selectedCell - 1;
        return [
          '#' + state.selectedCell + (state.loaded[idx] ? '' : ' ' + t('(BOŞ)', '(EMPTY)')),
          PAYLOAD_NAMES[idx],
          state.salvoMode ? t('2’Lİ SALVO', 'DUAL SALVO') : t('TEKLİ HÜCRE', 'SINGLE CELL'),
          left + ' / 8'
        ];
      },
      getStatus: () => ({
        text: state.launching
          ? t('HÜCRE KAPAĞI & ORTAK BACA AÇIK • PLENUM U-AKIŞI AKTİF', 'CELL & UPTAKE HATCHES OPEN • PLENUM U-FLOW ACTIVE')
          : state.loaded.some(Boolean)
            ? t('LCU HAZIR • ORTAK EGZOZ SİSTEMİ KONTROL ALTINDA', 'LCU READY • COMMON PLENUM & UPTAKE ARMED')
            : t('8 HÜCRE BOŞ • İKMAL İÇİN FIRLAT DÜĞMESİNE BASIN', 'ALL 8 CELLS EMPTY • PRESS LAUNCH TO RELOAD'),
        color: state.launching ? '#f97316' : '#0284c7'
      }),
      applyTextures: K.applyTextures,
      setTexture: K.setTexture,
      toggleRelief: K.toggleRelief
    };
  };
})();
