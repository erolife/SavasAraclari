/* =============================================================================
 * 1571 Osmanlı Kadırgası & Kızaklı Baş Topu (İnebahtı / Lepanto Dönemi)
 * 15 bağımsız mekanik grup, 4 alt sistem — Adaptör Kalıbı
 * Klasik script olarak yüklenir; sayfa file:// ile açıldığında da çalışır.
 *
 * Tarihsel ve Mekanik Arka Plan:
 *  - 16. yüzyılda Akdeniz'in vurucu gücü olan Osmanlı kadırgaları (Tersane-i Âmire),
 *    rüzgârdan bağımsız manevra sağlayan kürek düzeni, su üstü pruva mahmuzu ve
 *    pruva köşküne (rambade) yerleştirilen ağır tunç "Baş Topu" (kolunburna/şayka)
 *    ile savaşırdı.
 *  - Baş topu, geminin omurga doğrultusunda sabit bir ahşap kızak (oluk) üzerinde
 *    dururdu. Yanal dönüş açısı olmadığı için topu hedefe çevirmek üzere BÜTÜN GEMİ
 *    dümen ve diferansiyel kürek manevrasıyla (bir taraf ileri, diğer taraf geri
 *    kürek çekerek) döndürülürdü.
 *  - Ateşleme anında top kızak boyunca ~0,75 m geriye kayar, kalın "braga" halatı ve
 *    palanga makaraları geri tepmeyi sönümler, ardından topçular palangalarla topu
 *    yeniden pruva mazgalına (batarya konumuna) çekerdi.
 * ========================================================================== */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};

  window.VehicleBuilders.kadirga = function buildKadirga(ctx) {
    const { THREE, scene, addCADMesh, createPartGroup } = ctx;
    const audio = ctx.audio || null;
    const notify = ctx.notify || (() => {});

    // ------------------------------------------------------------------------
    // ÖLÇÜLER (1 birim = 1 m — Pruva ve Orta Kesit Savaş Modülü: ~11,4 m toplam boy)
    // ------------------------------------------------------------------------
    const Z_STERN = -4.60;        // Kesit arka sınırı
    const Z_BOW = 3.90;           // Pruva bodoslaması ucu
    const Z_RAM_TIP = 5.85;       // Pruva mahmuzu ucu
    const HALF_BEAM = 1.62;       // Gövde yarı genişliği (tam genişlik 3,24 m)
    const APOSTIS_X = 2.08;       // Kürek küpeştesi (apostis) yarı açıklığı
    const Y_KEEL = 0.12;          // Omurga merkez yüksekliği (alt taban Y = 0.00 m zemin teması)
    const Y_WATER = 0.62;         // Su hattı yüksekliği
    const Y_DECK = 1.16;          // Ana güverte yüksekliği
    const Y_RAMBADE = 1.56;       // Pruva top köşkü (rambade) yüksekliği
    const OAR_COUNT_SIDE = 8;     // Her bordada gösterilen kürek sayısı (toplam 16 kürek)

    // ------------------------------------------------------------------------
    // PROSEDÜREL DOKULAR VE KAPLAMALAR
    // ------------------------------------------------------------------------
    function makeGalleyTex(baseHex, grainHex, bandHex, isBump) {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const g = c.getContext('2d');
      g.fillStyle = isBump ? '#808080' : baseHex;
      g.fillRect(0, 0, 256, 256);

      let seed = baseHex.charCodeAt(1) * 149 + baseHex.charCodeAt(3) * 41;
      const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

      // Armuz kaplama kalas derzleri (ziftli kalafat çizgileri)
      g.strokeStyle = isBump ? 'rgba(18,18,18,0.9)' : 'rgba(12,10,8,0.48)';
      g.lineWidth = 2.2;
      for (let y = 24; y < 256; y += 24) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(256, y);
        g.stroke();
      }

      // Ahşap damarları
      for (let i = 0; i < 80; i++) {
        const y0 = rand() * 256;
        const amp = 1.2 + rand() * 3.8;
        const freq = 0.015 + rand() * 0.025;
        g.strokeStyle = isBump
          ? (rand() > 0.5 ? 'rgba(35,35,35,0.55)' : 'rgba(220,220,220,0.4)')
          : grainHex;
        g.globalAlpha = isBump ? 0.85 : (0.16 + rand() * 0.26);
        g.lineWidth = 0.7 + rand() * 1.5;
        g.beginPath();
        for (let x = 0; x <= 256; x += 8) {
          const y = y0 + Math.sin(x * freq + i) * amp;
          if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.stroke();
      }

      // Osmanlı borda kuşağı rengi
      if (!isBump && bandHex) {
        g.globalAlpha = 0.34;
        g.fillStyle = bandHex;
        g.fillRect(0, 0, 256, 48);
        g.fillRect(0, 144, 256, 24);
      }
      g.globalAlpha = 1;

      const t = new THREE.CanvasTexture(c);
      if (!isBump) t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(3, 2);
      return t;
    }

    const FINISHES = {
      tersane1571: {
        btn: '⚓ 1571 Tersane-i Âmire',
        label: '1571 Tersane-i Âmire — Ziftli Çam & Osmanlı Kızılı Borda',
        woodBase: '#6e4222', woodGrain: '#2b1507', band: '#991b1b',
        deck: 0xa67b4b, bronze: 0xc88a32, iron: 0x282d34, oar: 0xb88954
      },
      kapudanPasa: {
        btn: '🌙 Kapudan Paşa Baştardası',
        label: 'Kapudan Paşa Sancak Baştardası — Yeşil Borda & Altın Tunç',
        woodBase: '#5c3a21', woodGrain: '#241206', band: '#065f46',
        deck: 0xb08455, bronze: 0xeab308, iron: 0x1e242b, oar: 0xc49a6c
      },
      lepantoSmoke: {
        btn: '🔥 İnebahtı Barut & Tuz İsi',
        label: '1571 İnebahtı Muharebesi — Barut İsi & Deniz Tuzu Yıpranması',
        woodBase: '#4f3524', woodGrain: '#1c110a', band: '#571b1b',
        deck: 0x7d6043, bronze: 0x9c6b30, iron: 0x1f2124, oar: 0x8a6a47
      },
      navalMuseum: {
        btn: '🏛️ Deniz Müzesi Modeli',
        label: 'İstanbul Deniz Müzesi Tarihsel Kadırga Rekonstrüksiyonu',
        woodBase: '#9c6635', woodGrain: '#4d2c10', band: '#b45309',
        deck: 0xc79a63, bronze: 0xd99b26, iron: 0x3b424d, oar: 0xd1a775
      }
    };

    const woodMaps = {};
    Object.keys(FINISHES).forEach(k => {
      const f = FINISHES[k];
      woodMaps[k] = makeGalleyTex(f.woodBase, f.woodGrain, f.band, false);
    });
    const woodBump = makeGalleyTex('#808080', '#303030', null, true);

    const myMeshes = [];
    function makeMat(role, hex, rough, metal, bumpScale = 0.022, extra = {}) {
      const m = new THREE.MeshStandardMaterial({
        color: hex,
        roughness: rough,
        metalness: metal,
        map: role === 'hullWood' ? woodMaps.tersane1571 : null,
        bumpMap: (role === 'hullWood' || role === 'deckWood') ? woodBump : null,
        bumpScale: (role === 'hullWood' || role === 'deckWood') ? bumpScale : 0,
        ...extra
      });
      m.userData = { kadRole: role };
      return m;
    }

    const matHullWood = makeMat('hullWood', 0xffffff, 0.72, 0.06, 0.025, { side: THREE.DoubleSide });
    const matDeckWood = makeMat('deckWood', 0xa67b4b, 0.76, 0.05, 0.016);
    const matOarWood = makeMat('oarWood', 0xb88954, 0.68, 0.06, 0);
    const matBronze = makeMat('bronze', 0xc88a32, 0.30, 0.84, 0);
    const matIron = makeMat('iron', 0x282d34, 0.48, 0.76, 0);
    const matCanvas = makeMat('canvas', 0xebe3d2, 0.85, 0.02, 0);
    const matRope = makeMat('rope', 0xc4a46d, 0.88, 0.02, 0);
    const matSeaWater = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.22,
      metalness: 0.15,
      transparent: true,
      opacity: 0.34,
      depthWrite: false
    });

    function addMesh(parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], castShadow = true) {
      const m = addCADMesh(parent, geo, mat, pos, rot, castShadow);
      myMeshes.push(m);
      return m;
    }

    // ------------------------------------------------------------------------
    // KÖK GRUP VE GEMİ YÖN (YAW) PİVOTU
    // ------------------------------------------------------------------------
    const root = new THREE.Group();
    root.name = 'kadirga_root';
    root.visible = false;
    scene.add(root);

    // ------------------------------------------------------------------------
    // 15 BAĞIMSIZ MEKANİK PARÇA GRUBU
    // ------------------------------------------------------------------------

    // 1. Dış Gövde Kaplaması & Bordalar (X-Ray'de saydamlaşır)
    const partHullPlanking = createPartGroup({
      id: 'kad_hull_planking',
      name: '1. Dış Gövde Armuz Kaplaması & Kuşaklar (Karina & Borda)',
      subsystem: 'hull',
      subLabel: 'Gövde, Omurga & Mahmuz',
      desc: 'Akdeniz kadırgalarının su direncini azaltan 1:8 oranındaki ince uzun çam/meşe armuz kaplama gövdesi ve borda kuşakları. X-Ray modunda saydamlaşarak iç omurgayı ve cephaneliği gösterir.',
      material: 'Ziftli Çam & Meşe Kuşak',
      weight: '~8.400 kg (Kesit)',
      spec: 'Genişlik 3,24 m • Su Çekimi ~1,1 m',
      location: 'Dış Karina & Borda',
      basePos: [0, 0, 0],
      explodeVec: [0, -1.3, 0],
      isOuterShell: true
    });
    root.add(partHullPlanking);

    // 2. Omurga, Bodoslama & 18 Eğri Kaburga İskeleti (Postalar)
    const partKeelRibs = createPartGroup({
      id: 'kad_keel_ribs',
      name: '2. Ana Omurga, Pruva Bodoslaması & 18 Kaburga (Posta)',
      subsystem: 'hull',
      subLabel: 'Gövde, Omurga & Mahmuz',
      desc: 'Tek parça meşe ana omurga, iç omurga (keelson), kavisli pruva bodoslaması ve gövde formunu veren 18 çift eğri meşe posta (kaburga). Baş topunun geri tepme yükünü doğrudan omurgaya iletir.',
      material: 'Yekpare Meşe Omurga & Postalar',
      weight: '~5.200 kg',
      spec: '18 Çift Posta • 22×26 cm Omurga',
      location: 'İç Omurga İskeleti',
      basePos: [0, 0, 0],
      explodeVec: [0, -0.55, 0],
      isOuterShell: false
    });
    root.add(partKeelRibs);

    // 3. Tunç Zırhlı Pruva Mahmuzu (Spur / Mahmuz)
    const partBowRam = createPartGroup({
      id: 'kad_bow_ram',
      name: '3. Tunç Zırhlı Su Üstü Pruva Mahmuzu (Mahmuz)',
      subsystem: 'hull',
      subLabel: 'Gövde, Omurga & Mahmuz',
      desc: 'Antik su altı mahmuzlarından farklı olarak 16. yüzyıl kadırgalarında su üstünde ileri uzanan ~2 metrelik meşe/tunç mahmuz. Düşman kadırgasının küreklerini kırmak ve bordalama köprüsü kurmak için kullanılırdı.',
      material: 'Meşe Çekirdek & Dökme Tunç Başlık',
      weight: '~620 kg',
      spec: 'Uzunluk ~2,1 m • Su Üstü Bordalama Mahmuzu',
      location: 'Pruva Ucu (Z = +3,9..+5,85 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.25, 2.3],
      isOuterShell: false
    });
    root.add(partBowRam);

    // 4. Deniz Yüzeyi & Pruva Dalga İzi (Sergi Kaidesi)
    const partSeaBase = createPartGroup({
      id: 'kad_sea_base',
      name: '4. Su Hattı Kesiti & Pruva Dalga Köpüğü',
      subsystem: 'hull',
      subLabel: 'Gövde, Omurga & Mahmuz',
      desc: 'Kadırganın sığ su çekimini (~1 m) ve kürek temposuyla oluşan pruva dalga izini gösteren yarı saydam deniz yüzeyi katmanı.',
      material: 'Simülasyon Deniz Yüzeyi',
      weight: '—',
      spec: 'Y = 0,62 m Su Hattı Referansı',
      location: 'Su Hattı Düzlemi',
      basePos: [0, 0, 0],
      explodeVec: [0, -2.0, 0],
      isOuterShell: true
    });
    root.add(partSeaBase);

    // 5. Kürekçi Oturakları, Apostis Çerçevesi & Korsiye Yolu
    const partApostisBenches = createPartGroup({
      id: 'kad_apostis_benches',
      name: '5. Kürekçi Oturakları (Banklar), Apostis & Korsiye Yolu',
      subsystem: 'propulsion',
      subLabel: 'Kürek Tezgâhı & Dümen',
      desc: 'Gövdeden dışarı taşan dikdörtgen kürek çerçevesi (apostis/telaro), iskarmoz kazıkları, açılı kürekçi oturakları ve merkezde boyuna uzanan yükseltilmiş "korsiye" yürüyüş yolu.',
      material: 'Meşe Apostis & Çam Oturaklar',
      weight: '~2.100 kg',
      spec: 'Genişlik 4,16 m • 16 Oturak & Korsiye',
      location: 'Ana Güverte Üstü',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.95, 0],
      isOuterShell: false
    });
    root.add(partApostisBenches);

    // 6. İskele (Sol) Kürek Takımı (8 Adet Alakürek)
    const partPortOars = createPartGroup({
      id: 'kad_port_oars',
      name: '6. İskele (Sol) Kürek Takımı (8 × Alakürek & Kurşun Denge)',
      subsystem: 'propulsion',
      subLabel: 'Kürek Tezgâhı & Dümen',
      desc: 'İskele bordasındaki 8 adet uzun dişbudak kürek (alakürek). Her küreğin iç tutamak kısmında suya dalıp çıkmayı kolaylaştıran kurşun karşı ağırlık ve elcik (manika) bulunur.',
      material: 'Dişbudak Ağacı & Kurşun Denge',
      weight: '~440 kg (8 × 55 kg)',
      spec: '8 × 4,6 m Kürek • 1:3 Kaldıraç Oranı',
      location: 'İskele Apostis Hattı (+X)',
      basePos: [0, 0, 0],
      explodeVec: [2.4, 0.5, 0],
      isOuterShell: false
    });
    root.add(partPortOars);

    // 7. Sancak (Sağ) Kürek Takımı (8 Adet Alakürek)
    const partStarboardOars = createPartGroup({
      id: 'kad_starboard_oars',
      name: '7. Sancak (Sağ) Kürek Takımı (8 × Alakürek & Kurşun Denge)',
      subsystem: 'propulsion',
      subLabel: 'Kürek Tezgâhı & Dümen',
      desc: 'Sancak bordasındaki 8 adet uzun kürek. "Olduğu Yerde Nişan Dönüşü" modunda sancak kürekleri ileri çekerken iskele kürekleri geri çekerek (sia/voga) baş topunu hedefe çevirir!',
      material: 'Dişbudak Ağacı & Kurşun Denge',
      weight: '~440 kg (8 × 55 kg)',
      spec: '8 × 4,6 m Kürek • Diferansiyel Dönüş',
      location: 'Sancak Apostis Hattı (-X)',
      basePos: [0, 0, 0],
      explodeVec: [-2.4, 0.5, 0],
      isOuterShell: false
    });
    root.add(partStarboardOars);

    // 8. Kıç Bodoslama, Yelpaze Dümen & Yeke Kolu
    const partRudderStern = createPartGroup({
      id: 'kad_rudder_stern',
      name: '8. Kıç Bodoslama, Yelpaze Dümen & Yeke Kolu',
      subsystem: 'propulsion',
      subLabel: 'Kürek Tezgâhı & Dümen',
      desc: 'Kadırganın omurga doğrultusundaki baş topunu hedefe yöneltmekte kullanılan geniş yelpaze dümen (timon) ve güverteye uzanan yeke kolu.',
      material: 'Meşe Dümen Palası & Tunç İğnecik',
      weight: '~380 kg',
      spec: '±20° Dümen Açısı',
      location: 'Arka Kesit (Z = -4,6 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 0.2, -2.1],
      isOuterShell: false
    });
    root.add(partRudderStern);

    // 9. Pruva Top Köşkü (Rambade) & Geri Tepme Kızak Yolu
    const partBowPlatform = createPartGroup({
      id: 'kad_bow_platform',
      name: '9. Pruva Top Köşkü (Rambade), Siperlik & Kızak Olukları',
      subsystem: 'artillery',
      subLabel: 'Kızaklı Baş Topu & Prangiler',
      desc: 'Pruvada apostis çerçevesi ve enine kemere dikmeleri üzerinde yükselen zırhlı top ve bordalama platformu (rambade). Merkezinde ağır baş topunun ateşlendiğinde geriye kaydığı yağlanmış ikiz meşe kızak olukları yer alır.',
      material: 'Zırhlı Meşe Platform & Kızak Rayları',
      weight: '~1.350 kg',
      spec: '2,80 m Kızak Yolu • ~0,75 m Geri Tepme',
      location: 'Pruva Üst Güvertesi (Z = +0,6..+3,6 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.4, 1.4],
      isOuterShell: false
    });
    root.add(partBowPlatform);

    // 10. Kızaklı Tunç Baş Topu (Kolunburna / Şayka Topu)
    const partCenterCannon = createPartGroup({
      id: 'kad_center_cannon',
      name: '10. Kızaklı Tunç Baş Topu (Kolunburna / Şayka — ~24 Libre)',
      subsystem: 'artillery',
      subLabel: 'Kızaklı Baş Topu & Prangiler',
      desc: 'Kadırganın ana vurucu silahı: tekerleksiz ahşap kızak kundağı üzerine oturtulmuş 2,65 m boyunda dökme tunç baş topu. Ateşlendiğinde kızak üzerinde ~0,75 m geriye kayar ve palangalarla tekrar ileri çekilir.',
      material: 'Dökme Tunç (Tophane-i Âmire) & Meşe Kızak',
      weight: '~2.150 kg (Namlu + Kızak)',
      spec: 'L = 2,65 m • Ø ~140 mm (~24 Libre Gülle)',
      location: 'Pruva Merkez Ekseni',
      basePos: [0, 0, 0],
      explodeVec: [0, 2.2, 1.8],
      isOuterShell: false
    });
    root.add(partCenterCannon);

    // 11. Halat-Palanga Geri Tepme Freni (Braga Halatı & Makaralar)
    const partBreechTackle = createPartGroup({
      id: 'kad_breech_tackle',
      name: '11. Halat-Palanga Geri Tepme Freni (Braga Halatı & Palangalar)',
      subsystem: 'artillery',
      subLabel: 'Kızaklı Baş Topu & Prangiler',
      desc: 'Baş topunun kuyruk üzengisinden geçen kalın kenevir "braga" fren halatı ve topu atış sonrası tekrar batarya konumuna çeken çift dilli ahşap palanga makaraları.',
      material: 'Katranlı Kenevir Halat & Şimşir Makara',
      weight: '~190 kg',
      spec: 'Braga Fren Halatı + 2 × Çift Palanga',
      location: 'Pruva Top Köşkü Yanları',
      basePos: [0, 0, 0],
      explodeVec: [0, 1.85, 0.6],
      isOuterShell: false
    });
    root.add(partBreechTackle);

    // 12. 4 Adet Yan Prangi / Darbzen Döner Çatal Topu
    const partFlankGuns = createPartGroup({
      id: 'kad_flank_guns',
      name: '12. Yan Bordalarda 4 × Döner Çatal Topu (Prangi / Darbzen)',
      subsystem: 'artillery',
      subLabel: 'Kızaklı Baş Topu & Prangiler',
      desc: 'Pruva köşkü korkuluklarına demir çatallarla (swivel) monte edilmiş 4 adet kuyruktan dolma tunç prangi topu. Bordalama öncesi düşman güvertesini ateş altına alır.',
      material: 'Dökme Tunç & Dövme Demir Çatal',
      weight: '~360 kg (4 × 90 kg)',
      spec: '4 × Ø 55 mm Kuyruktan Dolma Prangi',
      location: 'Pruva İskele & Sancak Küpeştesi',
      basePos: [0, 0, 0],
      explodeVec: [0, 2.4, 2.2],
      isOuterShell: false
    });
    root.add(partFlankGuns);

    // 13. Eğik Pruva Direği (Trinketa) & Çarmıh Halatları
    const partForeMast = createPartGroup({
      id: 'kad_fore_mast',
      name: '13. Pruva Direği (Trinketa), Boğatalar & Çarmıh Halatları',
      subsystem: 'rigging',
      subLabel: 'Direk, Latin Yelken & Cephanelik',
      desc: 'Rambade platformunun hemen gerisinde (Z = -0,15 m) yükselen, öne doğru hafif eğimli (raked) çam trinketa direği, direk tepesi kalsası (calcet) ve direği bordalara sabitleyen çarmıh halatları.',
      material: 'Karadeniz Çamı & Kenevir Çarmıh',
      weight: '~780 kg',
      spec: 'Yükseklik ~6,0 m • Öne Eğimli Direk',
      location: 'Rambade Gerisi (Z = -0,15 m)',
      basePos: [0, 0, 0],
      explodeVec: [0, 3.2, 0],
      isOuterShell: false
    });
    root.add(partForeMast);

    // 14. Latin Seren Direği (Antena) & Sarılı Savaş Yelkeni
    const partLateenYard = createPartGroup({
      id: 'kad_lateen_yard',
      name: '14. İki Parçalı Latin Sereni (Antena) & Sarılı Yelken Bezi',
      subsystem: 'rigging',
      subLabel: 'Direk, Latin Yelken & Cephanelik',
      desc: 'Akdeniz kadırgalarının üçgen "latin" yelkenini taşıyan uzun eğik seren (antena). Muharebe sırasında kürek manevrasını engellememek ve yangın riskini azaltmak için yelken serene sıkıca sarılırdı (abosa edilirdi).',
      material: 'Ladin Seren & Keten Yelken Bezi',
      weight: '~520 kg',
      spec: 'Uzunluk 7,4 m • Muharebe Tertibi Sarılı',
      location: 'Direk Üstü Çapraz Konum',
      basePos: [0, 0, 0],
      explodeVec: [0, 4.1, -0.5],
      isOuterShell: false
    });
    root.add(partLateenYard);

    // 15. Ambar: Cephanelik, Barut Fıçıları, Gülle İstifi & Su Fıçıları
    const partHoldMagazine = createPartGroup({
      id: 'kad_hold_magazine',
      name: '15. Alt Ambar: Cephanelik, Barut Fıçıları, Gülle & Su İstifi',
      subsystem: 'rigging',
      subLabel: 'Direk, Latin Yelken & Cephanelik',
      desc: 'Su hattının altında, iç omurga boyunca dizilmiş bakır çemberli barut fıçıları, taş/demir top gülleleri ve kürekçiler için tatlı su fıçıları. Aynı zamanda safra (balast) görevi görür.',
      material: 'Meşe Fıçı, Bakır Çember & Granit/Demir Gülle',
      weight: '~1.650 kg',
      spec: '16 Atımlık Baş Topu & Prangi Mühimmatı',
      location: 'Güverte Altı Sintine & Cephanelik',
      basePos: [0, 0, 0],
      explodeVec: [0, -0.95, 0],
      isOuterShell: false
    });
    root.add(partHoldMagazine);

    // ------------------------------------------------------------------------
    // GEOMETRİ İNŞASI
    // ------------------------------------------------------------------------

    // Gövde genişlik profili fonksiyonu: Z (-4.6 .. +3.9) boyunca daralan pruva formu
    function hullHalfWidthAt(z) {
      if (z <= 0.5) {
        // Orta kesitten arkaya hafif daralma
        const t = (z - Z_STERN) / (0.5 - Z_STERN);
        return HALF_BEAM * (0.86 + 0.14 * Math.sin(t * Math.PI * 0.65));
      }
      // Pruvaya doğru keskin kama daralması
      const u = Math.min(1, (z - 0.5) / (Z_BOW - 0.5));
      return HALF_BEAM * Math.cos(u * Math.PI * 0.48);
    }

    // --- 1. Dış Gövde Armuz Kaplaması (partHullPlanking) ---
    // Z boyunca 16 dilimli sağ ve sol borda panelleri + karina levhaları
    const Z_SEGS = 16;
    for (let i = 0; i < Z_SEGS; i++) {
      const z0 = THREE.MathUtils.lerp(Z_STERN, Z_BOW, i / Z_SEGS);
      const z1 = THREE.MathUtils.lerp(Z_STERN, Z_BOW, (i + 1) / Z_SEGS);
      const zm = (z0 + z1) * 0.5;
      const dz = z1 - z0;
      const w0 = hullHalfWidthAt(z0);
      const w1 = hullHalfWidthAt(z1);
      const wm = (w0 + w1) * 0.5;
      const yaw = Math.atan2(w1 - w0, dz);
      const segLen = Math.hypot(dz, w1 - w0) + 0.02;

      [-1, 1].forEach(side => {
        // Alt karina eğimli levhası (omurgadan su hattına)
        const bilgeW = Math.hypot(wm * 0.88, Y_WATER - Y_KEEL);
        const bilgeTilt = Math.atan2(wm * 0.88, Y_WATER - Y_KEEL);
        const bilgeGeo = new THREE.BoxGeometry(0.055, bilgeW, segLen);
        addMesh(
          partHullPlanking,
          bilgeGeo,
          matHullWood,
          [side * wm * 0.44, (Y_KEEL + Y_WATER) * 0.5, zm],
          [0, side * yaw, -side * bilgeTilt]
        );

        // Üst borda levhası (su hattından güverte küpeştesine)
        const topsideH = Y_DECK + 0.24 - Y_WATER;
        const topsideGeo = new THREE.BoxGeometry(0.06, topsideH, segLen);
        addMesh(
          partHullPlanking,
          topsideGeo,
          matHullWood,
          [side * wm * 0.92, Y_WATER + topsideH * 0.5, zm],
          [0, side * yaw, side * 0.14]
        );

        // Dış borda koruma kuşağı (wale)
        const waleGeo = new THREE.BoxGeometry(0.09, 0.09, segLen);
        addMesh(
          partHullPlanking,
          waleGeo,
          matIron,
          [side * (wm * 0.95 + 0.02), Y_DECK - 0.04, zm],
          [0, side * yaw, 0]
        );
      });

      // Ana güverte döşeme kalasları (Y = Y_DECK, X-Ray modunda partHullPlanking ile birlikte saydamlaşır)
      const deckPlankGeo = new THREE.BoxGeometry(wm * 1.84, 0.036, dz + 0.015);
      addMesh(partHullPlanking, deckPlankGeo, matDeckWood, [0, Y_DECK, zm]);
    }

    // --- 2. Ana Omurga, Pruva Bodoslaması & 18 Kaburga (partKeelRibs) ---
    const keelLen = Z_BOW - Z_STERN + 0.3;
    const keelGeo = new THREE.BoxGeometry(0.22, 0.24, keelLen);
    addMesh(partKeelRibs, keelGeo, matDeckWood, [0, Y_KEEL, (Z_BOW + Z_STERN) * 0.5]);
    const keelsonGeo = new THREE.BoxGeometry(0.18, 0.14, keelLen - 0.4);
    addMesh(partKeelRibs, keelsonGeo, matDeckWood, [0, Y_KEEL + 0.22, (Z_BOW + Z_STERN) * 0.5]);

    // Kavisli pruva bodoslaması (stempost)
    const stemGeo = new THREE.BoxGeometry(0.20, 1.55, 0.26);
    addMesh(partKeelRibs, stemGeo, matDeckWood, [0, 0.88, Z_BOW + 0.05], [-0.32, 0, 0]);

    // 18 çift eğri posta (kaburga) ve kemere (deck beam) kirişleri
    for (let r = 0; r < 18; r++) {
      const zr = THREE.MathUtils.lerp(Z_STERN + 0.22, Z_BOW - 0.28, r / 17);
      const wr = hullHalfWidthAt(zr) * 0.88;
      // Enine kemere kirişi
      const beamGeo = new THREE.BoxGeometry(wr * 2, 0.08, 0.09);
      addMesh(partKeelRibs, beamGeo, matDeckWood, [0, Y_DECK - 0.06, zr]);
      // Sağ ve sol posta kolları
      [-1, 1].forEach(side => {
        const ribFloorGeo = new THREE.BoxGeometry(wr * 0.92, 0.09, 0.09);
        addMesh(partKeelRibs, ribFloorGeo, matDeckWood, [side * wr * 0.45, (Y_KEEL + Y_WATER) * 0.5 + 0.04, zr], [0, 0, side * 0.42]);
        const futtockGeo = new THREE.BoxGeometry(0.085, 0.62, 0.09);
        addMesh(partKeelRibs, futtockGeo, matDeckWood, [side * wr * 0.88, Y_WATER + 0.26, zr], [0, 0, -side * 0.16]);
      });
    }

    // --- 3. Tunç Zırhlı Su Üstü Pruva Mahmuzu (partBowRam) ---
    const ramLen = Z_RAM_TIP - Z_BOW + 0.35;
    const ramCoreGeo = new THREE.ConeGeometry(0.24, ramLen, 4);
    addMesh(partBowRam, ramCoreGeo, matDeckWood, [0, Y_DECK + 0.16, (Z_BOW + Z_RAM_TIP) * 0.5 - 0.08], [Math.PI / 2 - 0.05, Math.PI / 4, 0]);
    // Tunç mahmuz ucu (üç çatallı/piramidal dökme başlık)
    const ramBronzeHeadGeo = new THREE.ConeGeometry(0.16, 0.85, 4);
    addMesh(partBowRam, ramBronzeHeadGeo, matBronze, [0, Y_DECK + 0.20, Z_RAM_TIP - 0.32], [Math.PI / 2 - 0.05, Math.PI / 4, 0]);
    // Mahmuz yan demir kuşakları
    const ramStrapGeo = new THREE.BoxGeometry(0.32, 0.06, 1.45);
    addMesh(partBowRam, ramStrapGeo, matIron, [0, Y_DECK + 0.15, Z_BOW + 0.62]);

    // --- 4. Su Hattı Kesiti & Pruva Dalga Köpüğü (partSeaBase) ---
    const seaPlaneGeo = new THREE.BoxGeometry(6.8, 0.04, 11.8);
    addMesh(partSeaBase, seaPlaneGeo, matSeaWater, [0, Y_WATER, 0.4], [0, 0, 0], false);
    const wakeStrips = [];
    [-1, 1].forEach(side => {
      const wakeGeo = new THREE.BoxGeometry(0.12, 0.05, 5.4);
      const wm = addMesh(partSeaBase, wakeGeo, matCanvas, [side * 1.15, Y_WATER + 0.025, 1.1], [0, -side * 0.24, 0], false);
      wakeStrips.push(wm);
    });

    // --- 5. Kürekçi Oturakları, Apostis Çerçevesi & Korsiye Yolu (partApostisBenches) ---
    // Merkez yükseltilmiş yürüyüş yolu (korsiye / corsia)
    const corsiaLen = 5.4;
    const corsiaGeo = new THREE.BoxGeometry(0.56, 0.22, corsiaLen);
    addMesh(partApostisBenches, corsiaGeo, matDeckWood, [0, Y_DECK + 0.11, -1.85]);

    // İskele ve Sancak dış kürek küpeşte kirişleri (apostis / telaro) ve payandalar
    // Z = -4.55 .. +3.45 m boyunca kesintisiz uzanarak önde rambade top köşkünü de taşır
    [-1, 1].forEach(side => {
      const apostisBeamGeo = new THREE.BoxGeometry(0.12, 0.14, 8.0);
      addMesh(partApostisBenches, apostisBeamGeo, matDeckWood, [side * APOSTIS_X, Y_DECK + 0.28, -0.55]);

      // 8 kürekçi oturağı (bank), ayak basamağı (pedagne) ve iskarmoz kazığı (tholepin)
      for (let b = 0; b < OAR_COUNT_SIDE; b++) {
        const zb = -4.15 + b * 0.68;
        // Açılı kürekçi bankı
        const benchGeo = new THREE.BoxGeometry(1.36, 0.07, 0.24);
        addMesh(partApostisBenches, benchGeo, matDeckWood, [side * 1.05, Y_DECK + 0.18, zb], [0, -side * 0.16, 0]);
        // Apostis dış destek dirseği (outrigger knee)
        const kneeGeo = new THREE.BoxGeometry(0.65, 0.09, 0.10);
        addMesh(partApostisBenches, kneeGeo, matDeckWood, [side * (APOSTIS_X - 0.28), Y_DECK + 0.16, zb], [0, 0, side * 0.22]);
        // İskarmoz (tholepin — küreğin bağlandığı dikme)
        const tholeGeo = new THREE.CylinderGeometry(0.026, 0.03, 0.22, 8);
        addMesh(partApostisBenches, tholeGeo, matIron, [side * APOSTIS_X, Y_DECK + 0.42, zb + 0.12]);
      }
    });

    // --- 6 & 7. İskele (+X) ve Sancak (-X) Kürek Takımları (16 × Alakürek) ---
    const portOarPivots = [];
    const starboardOarPivots = [];

    function buildOarSet(parent, side, targetArr) {
      for (let i = 0; i < OAR_COUNT_SIDE; i++) {
        const zo = -4.03 + i * 0.68;
        // Kürek mafsal noktası: apostis kirişi üzerinde
        const pivot = new THREE.Group();
        pivot.position.set(side * APOSTIS_X, Y_DECK + 0.38, zo);
        pivot.userData = { side, index: i };
        parent.add(pivot);

        // Kürek eğim grubu (suya doğru ~16° aşağı eğimli)
        const oarBody = new THREE.Group();
        pivot.add(oarBody);

        // Kürek şaftı: iç kısım (1,25 m) + dış kısım (3,35 m) = 4,6 m
        const shaftLen = 4.55;
        const shaftGeo = new THREE.CylinderGeometry(0.032, 0.042, shaftLen, 8);
        // X ekseni boyunca uzanacak şekilde (rot.z = Math.PI/2)
        // İç uç merkeze (-side), dış uç denize (+side) uzanır
        addMesh(oarBody, shaftGeo, matOarWood, [side * 0.95, 0, 0], [0, 0, Math.PI / 2]);

        // Kürek palası (pala — dış uçta yassı kısım)
        const bladeGeo = new THREE.BoxGeometry(1.15, 0.028, 0.17);
        addMesh(oarBody, bladeGeo, matOarWood, [side * 2.75, 0, 0]);

        // İç topuz ve kurşun denge ağırlığı (manika & kurşun)
        const counterbalanceGeo = new THREE.BoxGeometry(0.32, 0.085, 0.085);
        addMesh(oarBody, counterbalanceGeo, matIron, [-side * 1.05, 0, 0]);

        targetArr.push({ pivot, oarBody, side, index: i });
      }
    }

    buildOarSet(partPortOars, 1, portOarPivots);
    buildOarSet(partStarboardOars, -1, starboardOarPivots);

    // --- 8. Kıç Bodoslama, Yelpaze Dümen & Yeke Kolu (partRudderStern) ---
    const sternPostGeo = new THREE.BoxGeometry(0.18, 1.38, 0.22);
    addMesh(partRudderStern, sternPostGeo, matDeckWood, [0, 0.82, Z_STERN]);
    const rudderPivot = new THREE.Group();
    rudderPivot.position.set(0, 0.78, Z_STERN - 0.12);
    partRudderStern.add(rudderPivot);
    const rudderBladeGeo = new THREE.BoxGeometry(0.08, 1.18, 0.68);
    addMesh(rudderPivot, rudderBladeGeo, matDeckWood, [0, -0.08, -0.34]);
    const pintleGeo = new THREE.BoxGeometry(0.12, 0.06, 0.28);
    addMesh(rudderPivot, pintleGeo, matBronze, [0, 0.22, -0.08]);
    addMesh(rudderPivot, pintleGeo, matBronze, [0, -0.32, -0.08]);
    const tillerBarGeo = new THREE.CylinderGeometry(0.032, 0.04, 1.15, 8);
    addMesh(rudderPivot, tillerBarGeo, matDeckWood, [0, 0.56, 0.48], [Math.PI / 2 - 0.12, 0, 0]);

    // --- 9. Pruva Top Köşkü (Rambade), Siperlik & Kızak Olukları (partBowPlatform) ---
    // Z = +0.60 .. +3.60 m (boy 3.00 m, merkez Z = 2.10 m) — geri tepen topu ve arka takozu tam taşır
    const rambadeDeckGeo = new THREE.BoxGeometry(2.65, 0.10, 3.00);
    addMesh(partBowPlatform, rambadeDeckGeo, matDeckWood, [0, Y_RAMBADE, 2.10]);

    // Rambade platformunu ana güverteye, bordalara ve apostis kirişlerine bağlayan 3 enine kemere, dikmeler ve diyagonal payandalar
    const rambadeBeamGeo = new THREE.BoxGeometry(2.65, 0.11, 0.14);
    const rambadePostGeo = new THREE.BoxGeometry(0.12, Y_RAMBADE - Y_DECK, 0.12);
    const rambadeBraceGeo = new THREE.BoxGeometry(0.92, 0.10, 0.12);
    [0.85, 2.10, 3.35].forEach(bz => {
      addMesh(partBowPlatform, rambadeBeamGeo, matDeckWood, [0, Y_RAMBADE - 0.08, bz]);
      [-0.95, 0.95].forEach(px => {
        addMesh(partBowPlatform, rambadePostGeo, matDeckWood, [px, (Y_DECK + Y_RAMBADE) * 0.5, bz]);
      });
      [-1, 1].forEach(side => {
        addMesh(partBowPlatform, rambadeBraceGeo, matDeckWood, [side * 1.56, Y_DECK + 0.32, bz], [0, 0, -side * 0.18]);
      });
    });

    // Ön zırhlı siperlik duvarı (ortasında baş topu mazgal açıklığı ile sol ve sağ kanat)
    const breastworkGeo = new THREE.BoxGeometry(1.02, 0.52, 0.14);
    addMesh(partBowPlatform, breastworkGeo, matHullWood, [-0.82, Y_RAMBADE + 0.28, 3.45], [0, 0.18, 0]);
    addMesh(partBowPlatform, breastworkGeo, matHullWood, [0.82, Y_RAMBADE + 0.28, 3.45], [0, -0.18, 0]);
    // Baş topu geri tepme kızak rayları (Z = +0.55 .. +3.45 m, boy 2.90 m, merkez Z = 2.00 m)
    const slideRailGeo = new THREE.BoxGeometry(0.12, 0.11, 2.90);
    addMesh(partBowPlatform, slideRailGeo, matDeckWood, [-0.26, Y_RAMBADE + 0.08, 2.00]);
    addMesh(partBowPlatform, slideRailGeo, matDeckWood, [0.26, Y_RAMBADE + 0.08, 2.00]);
    // Arka geri tepme tampon takozu (Z = +0.58 m — tam geri tepmiş kızak arkası Z = 0.78 m ile çakışmaz)
    const rearChockGeo = new THREE.BoxGeometry(0.76, 0.18, 0.18);
    addMesh(partBowPlatform, rearChockGeo, matIron, [0, Y_RAMBADE + 0.12, 0.58]);

    // --- 10. Kızaklı Tunç Baş Topu (Kolunburna / Şayka — partCenterCannon) ---
    const centerGunSlideGrp = new THREE.Group();
    // Batarya konumunda Z = 2.45; ateşlenince ~0.75 m geri teperek Z = 1.70'e kayar
    centerGunSlideGrp.position.set(0, Y_RAMBADE + 0.14, 2.45);
    partCenterCannon.add(centerGunSlideGrp);

    // Tekerleksiz ahşap kızak kundağı (sled carriage)
    const sledSideGeo = new THREE.BoxGeometry(0.11, 0.32, 1.48);
    addMesh(centerGunSlideGrp, sledSideGeo, matDeckWood, [-0.24, 0.16, -0.18]);
    addMesh(centerGunSlideGrp, sledSideGeo, matDeckWood, [0.24, 0.16, -0.18]);
    const sledTransomGeo = new THREE.BoxGeometry(0.56, 0.22, 0.16);
    addMesh(centerGunSlideGrp, sledTransomGeo, matDeckWood, [0, 0.12, 0.42]);
    addMesh(centerGunSlideGrp, sledTransomGeo, matDeckWood, [0, 0.10, -0.78]);

    // Baş topu namlu yükseliş pivotu
    const centerBarrelElevGrp = new THREE.Group();
    centerBarrelElevGrp.position.set(0, 0.34, 0.12);
    centerGunSlideGrp.add(centerBarrelElevGrp);

    // 2,65 m Tunç Kolunburna / Şayka Namlusu (sekizgen kuyruk + kademeli gövde + lale ağız)
    const breechOctGeo = new THREE.CylinderGeometry(0.16, 0.185, 0.95, 8);
    addMesh(centerBarrelElevGrp, breechOctGeo, matBronze, [0, 0, -0.52], [Math.PI / 2, 0, 0]);
    const chaseGeo = new THREE.CylinderGeometry(0.125, 0.155, 1.65, 16);
    addMesh(centerBarrelElevGrp, chaseGeo, matBronze, [0, 0, 0.78], [Math.PI / 2, 0, 0]);
    // Takviye bilezikleri ve lale ağız (astragal & tulip)
    [-0.92, -0.05, 0.65, 1.55].forEach(bz => {
      const ringR = bz < 0 ? 0.185 : 0.15;
      const ringGeo = new THREE.TorusGeometry(ringR, 0.022, 10, 16);
      addMesh(centerBarrelElevGrp, ringGeo, matBronze, [0, 0, bz]);
    });
    const cascabelGeo = new THREE.SphereGeometry(0.085, 12, 12);
    addMesh(centerBarrelElevGrp, cascabelGeo, matBronze, [0, 0, -1.08]);
    const trunnionGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.66, 10);
    addMesh(centerBarrelElevGrp, trunnionGeo, matBronze, [0, -0.02, 0.0], [0, 0, Math.PI / 2]);

    // Baş topu namlu alevi
    const mainFlashGeo = new THREE.ConeGeometry(0.26, 0.95, 10);
    const mainFlashMat = new THREE.MeshBasicMaterial({ color: 0xffb703, transparent: true, opacity: 0.92 });
    const mainFlashMesh = new THREE.Mesh(mainFlashGeo, mainFlashMat);
    mainFlashMesh.position.set(0, 0, 2.08);
    mainFlashMesh.rotation.x = Math.PI / 2;
    mainFlashMesh.visible = false;
    centerBarrelElevGrp.add(mainFlashMesh);

    // --- 11. Halat-Palanga Geri Tepme Freni (Braga Halatı & Makaralar — partBreechTackle) ---
    // Ön siperlikteki sabit mapa noktalarından topun kuyruğuna uzanan dinamik halat ve palanga makaraları
    const pulleyBlockGeo = new THREE.BoxGeometry(0.12, 0.10, 0.18);
    [-0.44, 0.44].forEach(px => {
      addMesh(partBreechTackle, pulleyBlockGeo, matDeckWood, [px, Y_RAMBADE + 0.22, 3.28]);
    });
    const tackleRopes = [];
    [-1, 1].forEach(side => {
      const rGeo = new THREE.CylinderGeometry(0.022, 0.022, 1.0, 8);
      const rMesh = addMesh(partBreechTackle, rGeo, matRope, [side * 0.36, Y_RAMBADE + 0.22, 2.3], [Math.PI / 2, 0, 0]);
      const bragaGeo = new THREE.CylinderGeometry(0.032, 0.032, 1.0, 8);
      const bMesh = addMesh(partBreechTackle, bragaGeo, matRope, [side * 0.28, Y_RAMBADE + 0.32, 2.1], [Math.PI / 2, 0, 0]);
      tackleRopes.push({ side, rMesh, bMesh });
    });

    // --- 12. 4 Adet Yan Prangi / Darbzen Döner Çatal Topu (partFlankGuns) ---
    const flankGunPivots = [];
    const flankBarrelGeo = new THREE.CylinderGeometry(0.042, 0.056, 0.78, 10);
    const swivelForkGeo = new THREE.CylinderGeometry(0.025, 0.028, 0.36, 8);
    [
      { side: -1, z: 3.10, yaw: -0.35 },
      { side: 1, z: 3.10, yaw: 0.35 },
      { side: -1, z: 1.75, yaw: -0.65 },
      { side: 1, z: 1.75, yaw: 0.65 }
    ].forEach(cfg => {
      const mount = new THREE.Group();
      mount.position.set(cfg.side * 1.24, Y_RAMBADE + 0.32, cfg.z);
      mount.rotation.y = cfg.yaw;
      partFlankGuns.add(mount);

      addMesh(mount, swivelForkGeo, matIron, [0, -0.12, 0]);
      const elevG = new THREE.Group();
      mount.add(elevG);
      addMesh(elevG, flankBarrelGeo, matBronze, [0, 0.04, 0.22], [Math.PI / 2, 0, 0]);
      // Kuyruk manivelası (tiller handle)
      const tailHandleGeo = new THREE.CylinderGeometry(0.016, 0.02, 0.38, 8);
      addMesh(elevG, tailHandleGeo, matIron, [0, 0.02, -0.34], [Math.PI / 2 + 0.25, 0, 0]);

      const fl = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.38, 8), mainFlashMat);
      fl.position.set(0, 0.04, 0.78);
      fl.rotation.x = Math.PI / 2;
      fl.visible = false;
      elevG.add(fl);

      flankGunPivots.push({ elevG, fl, flashTimer: 0 });
    });

    // --- 13. Pruva Direği (Trinketa) & Çarmıh Halatları (partForeMast) ---
    const mastH = 5.85;
    // Rambade platformunun (Z = +0.60 .. +3.60) hemen gerisinde Z = -0.15 m'de yükselir;
    // böylece geri tepen baş topu (en arka noktası Z = +0.62 m) direğe kesinlikle çarpmaz.
    const mastZ = -0.15;
    const mastGeo = new THREE.CylinderGeometry(0.095, 0.145, mastH, 12);
    // Öne hafif eğimli (0.08 rad)
    addMesh(partForeMast, mastGeo, matDeckWood, [0, Y_KEEL + mastH * 0.5 + 0.12, mastZ], [0.08, 0, 0]);
    // Direk tepesi kalsası (calcet — makara bloğu)
    const calcetGeo = new THREE.BoxGeometry(0.28, 0.36, 0.32);
    addMesh(partForeMast, calcetGeo, matDeckWood, [0, Y_KEEL + mastH + 0.12, mastZ + 0.22]);

    // İskele ve sancak çarmıh halatları (4'er adet)
    [-1, 1].forEach(side => {
      for (let s = 0; s < 4; s++) {
        const sz = mastZ - 0.85 + s * 0.45;
        const dx = side * (HALF_BEAM * 0.92);
        const dy = (Y_KEEL + mastH) - (Y_DECK + 0.2);
        const dz = (mastZ + 0.18) - sz;
        const len = Math.hypot(dx, dy, dz);
        const shroudGeo = new THREE.CylinderGeometry(0.014, 0.014, len, 6);
        const m = addMesh(partForeMast, shroudGeo, matRope, [dx * 0.5, Y_DECK + 0.2 + dy * 0.5, sz + dz * 0.5]);
        m.lookAt(0, Y_KEEL + mastH, mastZ + 0.18);
        m.rotateX(Math.PI / 2);
      }
    });

    // --- 14. İki Parçalı Latin Sereni (Antena) & Sarılı Yelken Bezi (partLateenYard) ---
    const yardPivot = new THREE.Group();
    yardPivot.position.set(0, Y_KEEL + mastH * 0.76, mastZ + 0.18);
    // Latin sereni pruvadan kıça doğru ~36° eğik durur
    yardPivot.rotation.x = -0.58;
    yardPivot.rotation.z = 0.12;
    partLateenYard.add(yardPivot);

    const yardLen = 7.4;
    const yardGeo = new THREE.CylinderGeometry(0.055, 0.095, yardLen, 10);
    addMesh(yardPivot, yardGeo, matDeckWood, [0, 0, 0], [Math.PI / 2, 0, 0]);
    // Serene sarılmış (abosa edilmiş) keten yelken rulosu
    const furledSailGeo = new THREE.CylinderGeometry(0.11, 0.13, yardLen * 0.88, 10);
    addMesh(yardPivot, furledSailGeo, matCanvas, [0, -0.09, 0], [Math.PI / 2, 0, 0]);

    // --- 15. Alt Ambar: Cephanelik, Barut Fıçıları, Gülle & Su İstifi (partHoldMagazine) ---
    const powderKegGeo = new THREE.CylinderGeometry(0.18, 0.20, 0.44, 12);
    const waterCaskGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.62, 12);
    const shotPileGeo = new THREE.BoxGeometry(0.52, 0.22, 0.52);
    const cannonBallGeo = new THREE.SphereGeometry(0.068, 10, 10);

    // Pruva altı cephanelik (barut fıçıları ve 24 librelik gülle sandıkları)
    [-0.48, 0.48].forEach(px => {
      for (let k = 0; k < 3; k++) {
        addMesh(partHoldMagazine, powderKegGeo, matDeckWood, [px, Y_KEEL + 0.38, 1.35 + k * 0.56]);
      }
      addMesh(partHoldMagazine, shotPileGeo, matDeckWood, [px * 0.85, Y_KEEL + 0.28, 0.45]);
      for (let b = -1; b <= 1; b++) {
        addMesh(partHoldMagazine, cannonBallGeo, matIron, [px * 0.85 + b * 0.14, Y_KEEL + 0.44, 0.45]);
      }
    });
    // Orta ambar tatlı su fıçıları
    for (let w = 0; w < 5; w++) {
      const wz = -0.65 - w * 0.78;
      addMesh(partHoldMagazine, waterCaskGeo, matDeckWood, [-0.55, Y_KEEL + 0.42, wz], [0, 0, Math.PI / 2]);
      addMesh(partHoldMagazine, waterCaskGeo, matDeckWood, [0.55, Y_KEEL + 0.42, wz], [0, 0, Math.PI / 2]);
    }

    // ------------------------------------------------------------------------
    // SİMÜLASYON DURUMU VE FİZİK / ANİMASYON DÖNGÜSÜ
    // ------------------------------------------------------------------------
    const S = {
      strokesPerMin: 22,      // Kürekçi temposu (0 - 36 darbe/dk)
      elevDeg: 3,             // Baş topu & prangi yükseliş açısı (-2° .. +10°)
      helmDeg: 0,             // Gemi pruva nişan / dümen açısı (-20° .. +20°)
      rowMode: 'cruise',      // 'cruise' (Senkron İleri Kürek) | 'pivot' (Diferansiyel Nişan Dönüşü: Sancak İleri / İskele Geri)
      autoRow: true,          // Hücum temposu açık
      autoCombat: false,      // Otomatik pruva nişan & atış döngüsü
      oarPhase: 0,            // Kürek çevrim fazı (rad)
      gunState: 'ready',      // 'ready' | 'recoil' | 'haul_forward'
      gunSlideZ: 2.45,        // Baş topu kızak konumu (2.45 = batarya, 1.70 = ~0.75 m tam geri tepmiş)
      recoilVel: 0,
      flashTimer: 0,
      ammoCount: 16,
      combatTimer: 0,
      finish: 'tersane1571',
      relief: true
    };

    function updateTackleRopes() {
      // Sabit ön siperlik mapası (Z = 3.28) ile kayan baş topu (S.gunSlideZ) arasındaki braga ve palanga halatlarını ölçekle
      const frontZ = 3.28;
      const gunZ = S.gunSlideZ - 0.15;
      const span = Math.max(0.25, frontZ - gunZ);
      const midZ = (frontZ + gunZ) * 0.5;
      tackleRopes.forEach(tr => {
        tr.rMesh.position.z = midZ;
        tr.rMesh.scale.set(1, span, 1);
        tr.bMesh.position.z = midZ - 0.12;
        tr.bMesh.scale.set(1, span * 1.08, 1);
      });
    }
    updateTackleRopes();

    function fireBowBattery() {
      if (S.ammoCount <= 0) {
        S.ammoCount = 16;
        if (audio && audio.playClick) audio.playClick(520);
        return { ok: true, refill: true };
      }
      if (S.gunState !== 'ready') {
        return {
          ok: false,
          msg: '<strong>Baş topu henüz batarya konumuna çekiliyor!</strong><br/>Topçular palangalarla kızaklı topu pruva mazgalına yerleştirdiğinde yeniden ateşleyebilirsiniz.'
        };
      }
      S.gunState = 'recoil';
      S.recoilVel = 4.58;
      S.flashTimer = 0.14;
      S.ammoCount = Math.max(0, S.ammoCount - 1);
      mainFlashMesh.visible = true;
      flankGunPivots.forEach(fp => {
        fp.fl.visible = true;
        fp.flashTimer = 0.11;
      });
      if (audio && audio.playCannonFire) audio.playCannonFire();
      return { ok: true };
    }

    function update(dt, elapsed = 0) {
      // 1. Kürek çevrimi (Eliptik 3B darbe: suya dalış -> çekiş -> sudan çıkış -> ileri hazırlık)
      // Gizli alt sınır yok: kaydırıcı 0 ise kürekler durur
      const activeSpm = S.autoRow ? S.strokesPerMin : 0;
      const omegaOar = (activeSpm * Math.PI * 2) / 60;
      S.oarPhase += omegaOar * dt;

      const animateOarBank = (arr, dirSign) => {
        arr.forEach(o => {
          const ph = S.oarPhase * dirSign - o.index * 0.12;
          // İleri-geri süpürme açısı (yaw) ve suya dalıp çıkma açısı (dip)
          const sweepYaw = Math.sin(ph) * 0.36 * o.side;
          const dipRoll = (-0.28 + Math.cos(ph) * 0.11) * o.side;
          o.pivot.rotation.y = sweepYaw;
          o.oarBody.rotation.z = dipRoll;
        });
      };

      // 'cruise' modunda her iki borda ileri çeker; 'pivot' modunda sancak ileri (+1), iskele geri (-1) çeker
      animateOarBank(starboardOarPivots, 1);
      animateOarBank(portOarPivots, S.rowMode === 'pivot' ? -1 : 1);

      // 2. Gemi pruva nişan dönüşü ve dümen
      // 'pivot' modunda kullanıcının S.helmDeg kaydırıcısını ezmeden ayrı bir pivotYaw salınımı eklenir
      let pivotYawDeg = 0;
      if (S.autoCombat) {
        S.combatTimer += dt;
        S.helmDeg = Math.sin(S.combatTimer * 0.85) * 12;
        if (S.gunState === 'ready' && S.ammoCount > 0 && Math.abs(Math.cos(S.combatTimer * 0.85)) > 0.96) {
          fireBowBattery();
        }
      } else if (S.rowMode === 'pivot' && activeSpm > 0) {
        // Diferansiyel kürek modunda gemi ağır ağır nişan salınımı yapar (S.helmDeg korunur)
        pivotYawDeg = Math.sin(S.oarPhase * 0.35) * 10;
      }

      const targetYaw = THREE.MathUtils.degToRad((S.helmDeg + pivotYawDeg) * 0.45);
      root.rotation.y += (targetYaw - root.rotation.y) * Math.min(1, dt * 4);
      // Hafif deniz salınımı (pitch/roll)
      root.rotation.x = Math.sin((elapsed || S.oarPhase) * 1.4) * 0.012;
      root.rotation.z = Math.cos((elapsed || S.oarPhase) * 1.1) * 0.015;

      const rudderTarget = -THREE.MathUtils.degToRad(S.helmDeg);
      rudderPivot.rotation.y += (rudderTarget - rudderPivot.rotation.y) * Math.min(1, dt * 8);

      // 3. Baş topu ve yan prangi yükseliş açıları
      const elevRad = -THREE.MathUtils.degToRad(S.elevDeg);
      centerBarrelElevGrp.rotation.x += (elevRad - centerBarrelElevGrp.rotation.x) * Math.min(1, dt * 8);
      flankGunPivots.forEach(fp => {
        fp.elevG.rotation.x += (elevRad - fp.elevG.rotation.x) * Math.min(1, dt * 8);
        if (fp.flashTimer > 0) {
          fp.flashTimer -= dt;
          if (fp.flashTimer <= 0) fp.fl.visible = false;
        }
      });

      // 4. Baş topu kızak geri tepmesi (~0.75 m: Z = 2.45 -> 1.70 m) ve halat-palanga ile bataryaya çekilme döngüsü
      if (S.flashTimer > 0) {
        S.flashTimer -= dt;
        if (S.flashTimer <= 0) mainFlashMesh.visible = false;
      }

      if (S.gunState === 'recoil') {
        S.gunSlideZ -= S.recoilVel * dt;
        // Braga halatı gerildikçe frenleme kuvveti artar (~0.75 m mesafede durdurur)
        S.recoilVel -= 14.0 * dt;
        if (S.gunSlideZ <= 1.70 || S.recoilVel <= 0) {
          S.gunSlideZ = Math.max(1.70, S.gunSlideZ);
          S.gunState = 'haul_forward';
          S.recoilVel = 0;
        }
        centerGunSlideGrp.position.z = S.gunSlideZ;
        updateTackleRopes();
      } else if (S.gunState === 'haul_forward') {
        // Topçular palangalarla topu tekrar pruva mazgalına (Z = 2.45) çeker
        S.gunSlideZ += 0.48 * dt;
        if (S.gunSlideZ >= 2.45) {
          S.gunSlideZ = 2.45;
          S.gunState = 'ready';
        }
        centerGunSlideGrp.position.z = S.gunSlideZ;
        updateTackleRopes();
      }
    }

    // ------------------------------------------------------------------------
    // DOKU / KAPLAMA YÖNETİMİ
    // ------------------------------------------------------------------------
    function applyTextures(blueprint) {
      const fin = FINISHES[S.finish];
      myMeshes.forEach(m => {
        const role = m.material.userData && m.material.userData.kadRole;
        if (role === 'hullWood') {
          m.material.map = blueprint ? null : woodMaps[S.finish];
          m.material.bumpMap = (!blueprint && S.relief) ? woodBump : null;
          m.material.needsUpdate = true;
        } else if (role === 'deckWood') {
          m.material.color.setHex(fin.deck);
          m.material.bumpMap = (!blueprint && S.relief) ? woodBump : null;
          m.userData.origColor = m.material.color.clone();
          m.material.needsUpdate = true;
        } else if (role === 'oarWood') {
          m.material.color.setHex(fin.oar);
          m.userData.origColor = m.material.color.clone();
        } else if (role === 'bronze') {
          m.material.color.setHex(fin.bronze);
          m.userData.origColor = m.material.color.clone();
        } else if (role === 'iron') {
          m.material.color.setHex(fin.iron);
          m.userData.origColor = m.material.color.clone();
        }
      });
    }
    function setTexture(key) { if (FINISHES[key]) S.finish = key; }
    function toggleRelief() { S.relief = !S.relief; return S.relief; }

    // ------------------------------------------------------------------------
    // ADAPTÖR ARAYÜZÜ (simulator.html İle Tam Uyumlu)
    // ------------------------------------------------------------------------
    const ui = {
      title: 'OSMANLI KADIRGASI & KIZAKLI BAŞ TOPU (İnebahtı — 1571)',
      sub: 'Tersane-i Âmire Kadırgası • Kızaklı Tunç Kolunburna Baş Topu • 4 × Yan Prangi • Diferansiyel Kürek Manevrası',
      partCount: '15 Ana Grup',
      texTitle: '⚓ Tersane-i Âmire Gövde & Tunç Dokusu',
      textures: Object.keys(FINISHES).map(k => ({ key: k, label: FINISHES[k].btn })),
      textureLabel: () => FINISHES[S.finish].label,
      activeTexture: () => S.finish,
      reliefLabel: on => (on ? '🪵 Armuz Kalafat & Ahşap Kabartması: AÇIK' : '🪵 Armuz Kalafat & Ahşap Kabartması: KAPALI'),
      relief: () => S.relief,
      subsystems: [
        { key: 'artillery', label: 'Kızaklı Baş Topu, Braga Freni & 4 Prangi', color: '#ef4444', count: 4 },
        { key: 'propulsion', label: 'Kürek Tezgâhı, 16 Alakürek & Dümen', color: '#0284c7', count: 4 },
        { key: 'hull', label: 'Armuz Gövde, Omurga, Postalar & Mahmuz', color: '#d97706', count: 4 },
        { key: 'rigging', label: 'Trinketa Direği, Latin Sereni & Cephanelik', color: '#10b981', count: 3 }
      ],
      camLabels: {
        iso: 'İzometrik',
        front: 'Pruva & Mahmuz',
        breech: 'Kızaklı Baş Topu',
        engine: 'Kürek Tezgâhı',
        suspension: 'Omurga & Ambar',
        top: 'Üst Güverte'
      },
      sliders: [
        { label: 'Kürekçi Temposu (Voga / Dakika)', min: 0, max: 36, step: 1, fmt: v => `${Math.round(v)} Darbe/dk` },
        { label: 'Baş Topu & Prangi Yükseliş Açısı', min: -2, max: 10, step: 0.5, fmt: v => `${v >= 0 ? '+' : ''}${v}°` },
        { label: 'Gemi Pruva Nişan & Dümen Açısı', min: -20, max: 20, step: 1, fmt: v => `${v > 0 ? '+' : ''}${Math.round(v)}°` }
      ],
      buttons: {
        terrain: '🚣 Hücum Temposu (Canlı Kürek)',
        sweep: '🎯 Oto-Pruva Nişan & Atış Döngüsü',
        mode: true
      },
      fog: { near: 26, far: 78 },
      shadowExtent: 11,
      telemetryTag: 'TERSANE-İ ÂMİRE 1571',
      statLabels: ['KÜREK MANEVRASI', 'GEMİ SÜRATİ', 'KALAN GÜLLE', 'BAŞ TOPU MENZİLİ']
    };

    function modeLabel() {
      return S.rowMode === 'cruise'
        ? '⚓ Kürek Modu: Düz Hücum (İskele & Sancak Senkron İleri)'
        : '🔄 Kürek Modu: Olduğu Yerde Nişan Dönüşü (Sancak İleri / İskele Geri)';
    }

    function getSliderValues() {
      return [S.strokesPerMin, S.elevDeg, S.helmDeg];
    }

    function onSlider(index, val) {
      if (index === 0) {
        S.strokesPerMin = val;
        if (val === 0) S.autoRow = false;
        else S.autoRow = true;
      } else if (index === 1) {
        S.elevDeg = val;
      } else if (index === 2) {
        S.autoCombat = false;
        S.helmDeg = val;
      }
      return {};
    }

    function onButton(name) {
      if (name === 'terrain') {
        S.autoRow = !S.autoRow;
        if (S.autoRow && S.strokesPerMin === 0) S.strokesPerMin = 22;
        return { active: S.autoRow };
      }
      if (name === 'sweep') {
        S.autoCombat = !S.autoCombat;
        if (S.autoCombat && S.ammoCount <= 0) S.ammoCount = 16;
        return { active: S.autoCombat };
      }
      if (name === 'mode') {
        S.rowMode = S.rowMode === 'cruise' ? 'pivot' : 'cruise';
        const msg = S.rowMode === 'pivot'
          ? '<strong>🔄 Olduğu Yerde Nişan Dönüşü (Sia / Voga) Aktif!</strong><br/>Baş topu omurgaya sabit olduğundan, topu hedefe çevirmek için <strong>sancak kürekleri ileri, iskele kürekleri geri</strong> çekerek gemiyi olduğu yerde döndürüyor!'
          : '<strong>⚓ Düz Hücum Küreği Modu Aktif!</strong><br/>İskele ve sancak kürek takımları senkronize ileri çekerek kadırgayı mahmuz hücum hızına (~7,5 knot) çıkarıyor.';
        return { active: S.rowMode === 'pivot', msg };
      }
      return {};
    }

    function buttonActive(name) {
      if (name === 'terrain') return S.autoRow;
      if (name === 'sweep') return S.autoCombat;
      if (name === 'mode') return S.rowMode === 'pivot';
      return false;
    }

    function fireButtonLabel() {
      return S.ammoCount <= 0
        ? '📦 BARUT & GÜLLE İKMALİ (16 Atım)'
        : '💥 BAŞ TOPU & PRANGİLERİ ATEŞLE!';
    }

    function onFire() {
      return fireBowBattery();
    }

    function getStats() {
      const activeSpm = S.autoRow ? S.strokesPerMin : 0;
      const knotsHtml = S.rowMode === 'cruise'
        ? `${((activeSpm / 36) * 7.8).toFixed(1)} <span>Knot</span>`
        : '0.0 <span>Knot (dönüş)</span>';
      const modeTxt = S.rowMode === 'cruise' ? 'HÜCUM (SENKRON)' : 'NİŞAN DÖNÜŞÜ';
      const rangeM = Math.round(620 + Math.max(0, S.elevDeg) * 95);
      return [
        `${modeTxt}`,
        knotsHtml,
        `${S.ammoCount} <span>Gülle</span>`,
        `~${rangeM} <span>Metre</span>`
      ];
    }

    function getStatus() {
      if (S.gunState === 'recoil') return { text: 'GERİ TEPME (BRAGA FRENİ)', color: '#ef4444' };
      if (S.gunState === 'haul_forward') return { text: 'PALANGAYLA İLERİ ÇEKİLİYOR', color: '#d97706' };
      if (S.ammoCount <= 0) return { text: 'CEPHANE BİTTİ', color: '#d97706' };
      return { text: 'BAŞ TOPU BATARYADA HAZIR', color: '#0284c7' };
    }

    const camPresets = {
      iso: { pos: [7.5, 4.2, 7.2], look: [0, 1.3, 0.8] },
      front: { pos: [1.8, 2.2, 8.2], look: [0, 1.4, 2.5] },
      breech: { pos: [2.6, 2.8, 3.6], look: [0, 1.65, 2.2] },
      engine: { pos: [4.8, 2.6, -1.5], look: [0, 1.25, -1.5] },
      suspension: { pos: [3.6, 1.5, 1.2], look: [0, 0.65, 0.2] },
      top: { pos: [0.1, 10.5, 0.5], look: [0, 1.2, 0.5] }
    };

    const tourSteps = [
      {
        title: 'Genel Bakış: 1571 Osmanlı Kadırgası & Pruva Savaş Düzeni',
        desc: '16. yüzyıl Akdeniz deniz savaşlarının vurucu gücü. İnce uzun gövdesi, her iki bordadaki kürek tezgâhları, su üstü pruva mahmuzu ve pruva köşkündeki (rambade) ağır baş topu ile tam bir yüzen topçu bataryasıdır.',
        explode: 0, cutaway: false, sub: 'all', cam: 'iso', part: partHullPlanking
      },
      {
        title: 'Kızaklı Tunç Baş Topu ve Halat-Palanga Geri Tepme Freni',
        desc: 'Pruva merkezindeki ~24 librelik tunç kolunburna, tekerleksiz ahşap kızak üzerinde durur. "Baş Topu & Prangileri Ateşle" butonuna basın: top kızak üzerinde ~0,75 m geriye kayar, braga halatıyla frenlenir ve palangalarla tekrar ileri çekilir!',
        explode: 0, cutaway: false, sub: 'all', cam: 'breech', part: partCenterCannon
      },
      {
        title: 'Bütün Gemiyi Çevirerek Nişan Alma: Diferansiyel Kürek Manevrası',
        desc: 'Baş topu sabit eksende durduğu için hedefe nişan almak üzere bütün kadırga döndürülür. Sağ paneldeki "Kürek Modu" butonuna tıklayarak sancak küreklerinin ileri, iskele küreklerinin geri çektiği nişan manevrasını izleyin.',
        explode: 0, cutaway: false, sub: 'propulsion', cam: 'engine', part: partPortOars
      },
      {
        title: 'X-Ray Kesit: Omurga, 18 Eğri Posta ve Su Altı Cephaneliği',
        desc: 'Dış armuz kaplama saydamlaştığında tek parça meşe omurga, 18 çift eğri posta ve su hattının altında korunan barut fıçıları ile taş/demir gülle istifi ortaya çıkar.',
        explode: 15, cutaway: true, sub: 'all', cam: 'suspension', part: partKeelRibs
      },
      {
        title: 'Su Üstü Pruva Mahmuzu ve 4 × Yan Prangi Topu',
        desc: 'Düşman kadırgasının küreklerini kırıp bordalama köprüsü kuran tunç başlıklı pruva mahmuzu ve yakın mesafe güverte temizliği için küpeştelere dizilmiş 4 adet döner çatal topu (prangi).',
        explode: 20, cutaway: false, sub: 'artillery', cam: 'front', part: partBowRam
      },
      {
        title: 'Tam Teardown (%85): 15 Bağımsız Deniz & Topçu Grubu',
        desc: 'Armuz gövde, omurga ve postalar, pruva mahmuzu, kürek oturakları ve apostis, 16 alakürek, yelpaze dümen, rambade top köşkü, kızaklı baş topu, braga palangaları, 4 prangi, trinketa direği, latin sereni ve cephanelik ayrılmış görünümde.',
        explode: 85, cutaway: false, sub: 'all', cam: 'iso', part: partCenterCannon
      }
    ];

    return {
      root, ui, camPresets, tourSteps,
      flashMesh: null,
      firePart: partCenterCannon,
      parts: {
        hullPlanking: partHullPlanking,
        keelRibs: partKeelRibs,
        bowRam: partBowRam,
        seaBase: partSeaBase,
        apostisBenches: partApostisBenches,
        portOars: partPortOars,
        starboardOars: partStarboardOars,
        rudderStern: partRudderStern,
        bowPlatform: partBowPlatform,
        centerCannon: partCenterCannon,
        breechTackle: partBreechTackle,
        flankGuns: partFlankGuns,
        foreMast: partForeMast,
        lateenYard: partLateenYard,
        holdMagazine: partHoldMagazine
      },
      defaultPart: partCenterCannon,
      update, onSlider, onButton, buttonActive, onFire, fireButtonLabel, modeLabel,
      getSliderValues, getStats, getStatus,
      applyTextures, setTexture, toggleRelief
    };
  };
})();

