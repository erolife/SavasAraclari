/* =============================================================================
 * MÜZE KATALOĞU — Tek Kaynak (Single Source of Truth)
 * Ana sayfadaki kartlar, filtre paneli ve mühendislik pencereleri bu kayıttan üretilir.
 * Yeni araç eklemek için VEHICLES dizisine bir kayıt eklemek yeterlidir.
 * Klasik script olarak yüklenir (sayfa file:// ile açıldığında da çalışır).
 *
 * Alan açıklamaları:
 *  id        : benzersiz kimlik (aktif araçlarda simulator.html?vehicle=<sim> parametresi)
 *  year      : sıralama için yıl (M.Ö. yıllar negatif)
 *  domain    : 'land' | 'sea' | 'air' | 'space'                 (tek değer)
 *  era       : FACETS.era anahtarı                             (tek değer)
 *  energy    : FACETS.energy anahtarları                       (çoklu)
 *  role      : FACETS.role anahtarları                         (çoklu)
 *  origin    : FACETS.origin anahtarı                          (tek değer)
 *  status    : 'live' (simülatör hazır) | 'planned'
 * ========================================================================== */
(function () {
  'use strict';

  const FACETS = [
    { key: 'domain', url: 'ortam', label: 'Kullanım Ortamı', options: [
      { key: 'land', label: '🪖 Kara' }, { key: 'sea', label: '⚓ Deniz' },
      { key: 'air', label: '✈️ Hava' }, { key: 'space', label: '🚀 Uzay' }
    ] },
    { key: 'era', url: 'donem', label: 'Dönem', options: [
      { key: 'ancient', label: 'Antik Çağ' }, { key: 'medieval', label: 'Orta Çağ' },
      { key: 'gunpowder', label: 'Barut & Rönesans' }, { key: 'industrial', label: 'Sanayi Devrimi' },
      { key: 'ww1', label: 'I. Dünya Savaşı' }, { key: 'ww2', label: 'II. Dünya Savaşı' },
      { key: 'coldwar', label: 'Soğuk Savaş' }, { key: 'modern', label: 'Modern' }
    ] },
    { key: 'energy', url: 'enerji', label: 'Enerji / Temel Mekanik', options: [
      { key: 'muscle', label: '💪 Kas Gücü & Burulma' }, { key: 'gravity', label: '⚖️ Yerçekimi' },
      { key: 'gunpowder', label: '💥 Barut' }, { key: 'ice', label: '⚙️ İçten Yanmalı Motor' },
      { key: 'jet', label: '🔥 Jet & Roket' }
    ] },
    { key: 'role', url: 'gorev', label: 'Görev Tipi', options: [
      { key: 'siege', label: 'Kuşatma' }, { key: 'artillery', label: 'Topçu' },
      { key: 'armor', label: 'Zırhlı Araç' }, { key: 'aircraft', label: 'Savaş Uçağı' },
      { key: 'smallarms', label: 'Hafif & Makineli Silah' }, { key: 'defense', label: 'Savunma Sistemi' }
    ] },
    { key: 'origin', url: 'koken', label: 'Köken', options: [
      { key: 'rome', label: 'Roma' }, { key: 'medieval_eu', label: 'Orta Çağ Avrupa & Akdeniz' },
      { key: 'ottoman', label: 'Osmanlı' }, { key: 'italy', label: 'İtalya (Rönesans)' },
      { key: 'uk', label: 'İngiltere' }, { key: 'germany', label: 'Almanya' },
      { key: 'usa', label: 'ABD' }, { key: 'ussr', label: 'SSCB' }
    ] },
    { key: 'status', url: 'durum', label: 'Durum', options: [
      { key: 'live', label: '🟢 Simülatör Hazır' }, { key: 'planned', label: '⏳ Planlı' }
    ] }
  ];

  const VEHICLES = [
    // ===================================================================== 1. GRUP (AKTİF)
    {
      id: 'ballista', sim: 'ballista', group: 1, status: 'live',
      year: -300, yearLabel: 'M.Ö. 300', eraLabel: 'ANTİK ÇAĞ',
      domain: 'land', era: 'ancient', energy: ['muscle'], role: ['artillery', 'siege'], origin: 'rome',
      name: 'Roma Burulma Yaylı Ballistası', sub: 'TORSION SPRING ARTILLERY • VITRUVIUS ORANLARI',
      desc: 'Esnek ahşap yay yerine bükülmüş hayvan tendonu demetlerinde depolanan burulma enerjisini kullanan hassas atış makinesi. Halkaları çevirip ön gerilim verin, çıkrık ve cırcırla kurun, pençe tetikle ateşleyin; ok gerçek bir kavisle uçsun.',
      tags: ['2x Tendon Burulma Yayı', 'Çıkrık & Cırcır', 'Sürgü & Pençe Tetik', 'Seri Atış Gösterimi'],
      specs: [['ENERJİ KAYNAĞI', 'Burulma (Tendon)'], ['MENZİL (HESAP)', '~500 m @30° (tahmini)'], ['TEMEL ÖLÇÜ', 'D = Ok Boyu / 9'], ['3D PARÇA SAYISI', '12 Bağımsız Grup']],
      tag: 'TOR-BAL-300', icon: '🏹',
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="120" x2="300" y2="120" stroke="#94a3b8" stroke-dasharray="4 4"/><path d="M110 120 L155 75 L195 120" stroke="#334155" stroke-width="3"/><rect x="148" y="65" width="14" height="55" fill="#d97706" fill-opacity="0.2" stroke="#b45309" stroke-width="2"/><rect x="55" y="56" width="215" height="12" rx="2" fill="#64748b" fill-opacity="0.25" stroke="#1e293b" stroke-width="2"/><rect x="75" y="28" width="46" height="58" rx="3" fill="#d97706" fill-opacity="0.18" stroke="#b45309" stroke-width="2"/><circle cx="88" cy="57" r="8" stroke="#0284c7" stroke-width="2"/><circle cx="108" cy="57" r="8" stroke="#0284c7" stroke-width="2"/><path d="M88 49 L45 20 M108 65 L45 94" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/><path d="M45 20 L195 60 L45 94" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="3 2"/><line x1="70" y1="60" x2="210" y2="60" stroke="#0f172a" stroke-width="3"/><polygon points="62,60 76,55 76,65" fill="#dc2626"/><circle cx="252" cy="62" r="12" fill="#0284c7" fill-opacity="0.2" stroke="#0284c7" stroke-width="2"/></svg>'
    },
    {
      id: 'trebuchet', sim: 'trebuchet', group: 1, status: 'live',
      year: 1250, yearLabel: '1250', eraLabel: 'ORTA ÇAĞ',
      domain: 'land', era: 'medieval', energy: ['gravity'], role: ['siege'], origin: 'medieval_eu',
      name: 'Karşı Ağırlıklı Trebuchet (Mancınık)', sub: 'GRAVITY COUNTERWEIGHT ENGINE • KALE KUŞATMASI',
      desc: 'Ağırlığın düşüşünü 1:4 kaldıraç kolu ve sapanın kamçı etkisiyle hıza dönüştüren Orta Çağ kuşatma makinesi. Çarklarla kurun, karşı ağırlığı ve bırakma açısını ayarlayın, menteşeli ile sabit ağırlığı karşılaştırın.',
      tags: ['Menteşeli ⇄ Sabit Ağırlık', '1:4 Kaldıraç Kolu', 'Fiziksel Sapan Simülasyonu'],
      specs: [['KARŞI AĞIRLIK', '3 – 10 t (ayarlanabilir)'], ['MENZİL (MODEL)', '~320 m @6 t, 45°'], ['GÜLLE', '100 kg Granit'], ['3D PARÇA SAYISI', '14 Bağımsız Grup']],
      tag: 'TRB-1250-CW', icon: '🏰',
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="124" x2="300" y2="124" stroke="#94a3b8" stroke-dasharray="4 4"/><polygon points="150,32 105,124 195,124" fill="#d97706" fill-opacity="0.12" stroke="#1e293b" stroke-width="2.5"/><line x1="150" y1="32" x2="150" y2="124" stroke="#475569" stroke-width="2"/><line x1="105" y1="54" x2="255" y2="18" stroke="#b45309" stroke-width="4" stroke-linecap="round"/><circle cx="150" cy="43" r="5" fill="#0284c7"/><line x1="105" y1="54" x2="105" y2="75" stroke="#1e293b" stroke-width="2"/><polygon points="86,75 124,75 118,108 92,108" fill="#334155" fill-opacity="0.3" stroke="#0f172a" stroke-width="2"/><path d="M255 18 Q275 65 225 118" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="3 2"/><circle cx="222" cy="118" r="7" fill="#475569" stroke="#0f172a" stroke-width="1.5"/></svg>'
    },
    {
      id: 'sahi', sim: 'sahi', group: 1, status: 'live',
      year: 1464, yearLabel: '1453 / 1464', eraLabel: 'BARUT ÇAĞI',
      domain: 'land', era: 'gunpowder', energy: ['gunpowder'], role: ['siege', 'artillery'], origin: 'ottoman',
      name: 'Osmanlı Şahi Topu (Dardanelles Gun)', sub: 'TWO-PIECE CAST BRONZE BOMBARD • ~63 CM AĞIZ',
      desc: '1453 kuşatma toplarının günümüze ulaşan en yakın örneği: taşınabilmesi için birbirine vidalanan iki parçalı dev tunç döküm. Vidasını sökün, nakliye arabalarına yükleyin, X-Ray ile dar barut odasını görün, dolum döngüsünü oynatın ve ateşleyin!',
      tags: ['Vidalı İki Parça', '~315 kg Granit Gülle', 'Atış Mevzii & Nakliye', '6 Adımlı Dolum Döngüsü'],
      specs: [['TOPLAM AĞIRLIK', '16,8 Ton Tunç'], ['UZUNLUK / AĞIZ', '~5,18 m / ~63 cm'], ['GÜLLE (HESAPLANAN)', 'Ø 61 cm ≈ 315 kg'], ['3D PARÇA SAYISI', '13 Bağımsız Grup']],
      tag: 'DARDANELLES-1464-630MM', icon: '🏺',
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="118" x2="300" y2="118" stroke="#94a3b8" stroke-dasharray="4 4"/><rect x="42" y="96" width="225" height="18" rx="2" fill="#b45309" fill-opacity="0.2" stroke="#78350f" stroke-width="2"/><rect x="50" y="64" width="76" height="32" rx="3" fill="#d97706" fill-opacity="0.32" stroke="#b45309" stroke-width="2.2"/><line x1="126" y1="56" x2="126" y2="104" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="3 2"/><rect x="126" y="56" width="132" height="44" rx="3" fill="#d97706" fill-opacity="0.24" stroke="#92400e" stroke-width="2.2"/><line x1="158" y1="54" x2="158" y2="102" stroke="#78350f" stroke-width="3"/><line x1="198" y1="54" x2="198" y2="102" stroke="#78350f" stroke-width="3"/><line x1="248" y1="54" x2="248" y2="102" stroke="#78350f" stroke-width="3"/><circle cx="280" cy="78" r="15" fill="#64748b" fill-opacity="0.35" stroke="#1e293b" stroke-width="2"/></svg>'
    },
    {
      id: 'tiger', sim: 'tiger', group: 1, status: 'live',
      year: 1942, yearLabel: '1942', eraLabel: 'II. DÜNYA SAVAŞI',
      domain: 'land', era: 'ww2', energy: ['ice', 'gunpowder'], role: ['armor'], origin: 'germany',
      name: 'Pz.Kpfw. VI "Tiger I" (Ausf. E)', sub: '8.8 CM KwK 36 L/56 • MAYBACH HL230 V12 • 57 TON',
      desc: '100 mm dikey ön zırh, 88 mm yüksek ilk hızlı top, çalışan 12 pistonlu Maybach V12, iç içe geçmeli 24 tekerlek ve bakla bakla paletler. Dört tarihsel dönem paketi; hidrolik taret, motor devrine bağlı olarak döner.',
      tags: ['8.8 cm Top & Geri Tepme', '12 Hareketli V12 Piston', '96 Baklalı Palet', '4 Dönem Paketi'],
      specs: [['MOTOR GÜCÜ', '700 BG @ 3000 RPM'], ['ZIRH KALINLIĞI', '100 mm Ön / 80 mm Yan'], ['ANA SİLAH', '8.8 cm KwK 36 L/56'], ['3D PARÇA SAYISI', '22 Bağımsız Grup']],
      tag: 'SDKFZ-181-TIGER', icon: '🔥',
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="122" x2="300" y2="122" stroke="#94a3b8" stroke-dasharray="4 4"/><rect x="52" y="76" width="175" height="28" rx="2" fill="#6b7460" fill-opacity="0.35" stroke="#1e293b" stroke-width="2"/><rect x="46" y="96" width="186" height="24" rx="12" fill="#334155" fill-opacity="0.22" stroke="#0f172a" stroke-width="2"/><circle cx="72" cy="108" r="9" fill="#6b7460" stroke="#1e293b" stroke-width="1.6"/><circle cx="96" cy="108" r="9" fill="#475569" stroke="#1e293b" stroke-width="1.6"/><circle cx="120" cy="108" r="9" fill="#6b7460" stroke="#1e293b" stroke-width="1.6"/><circle cx="144" cy="108" r="9" fill="#475569" stroke="#1e293b" stroke-width="1.6"/><circle cx="168" cy="108" r="9" fill="#6b7460" stroke="#1e293b" stroke-width="1.6"/><circle cx="192" cy="108" r="9" fill="#475569" stroke="#1e293b" stroke-width="1.6"/><rect x="96" y="48" width="86" height="28" rx="3" fill="#6b7460" fill-opacity="0.45" stroke="#0f172a" stroke-width="2"/><rect x="108" y="38" width="26" height="10" rx="2" fill="#475569" stroke="#0f172a" stroke-width="1.6"/><rect x="182" y="57" width="104" height="7" fill="#334155" stroke="#0f172a" stroke-width="1.8"/><rect x="284" y="54" width="14" height="13" rx="2" fill="#d97706" stroke="#0f172a" stroke-width="1.8"/></svg>'
    },
    {
      id: 'spitfire', sim: 'spitfire', group: 1, status: 'live',
      year: 1943, yearLabel: '1943', eraLabel: 'II. DÜNYA SAVAŞI',
      domain: 'air', era: 'ww2', energy: ['ice', 'gunpowder'], role: ['aircraft'], origin: 'uk',
      name: 'Supermarine Spitfire Mk IX', sub: 'ROLLS-ROYCE MERLIN 66 V12 • ELİPTİK KANAT',
      desc: 'İki kademeli süperşarjlı Merlin 66 V12, eliptik kanat (kiriş ve kaburgalarıyla), "C" kanadı silahları ve dışa katlanan iniş takımı. Pervaneyi döndürün, kumanda yüzeylerini oynatın, uçağı müze kaidesine kaldırıp takımı toplayın ve salvo atın.',
      tags: ['Merlin 66 V12 + Süperşarj', 'Kumanda Yüzeyleri & İniş Takımı', '2 × 20 mm + 4 × .303'],
      specs: [['MOTOR', 'Merlin 66, ~1.700 BG'], ['MAKSİMUM HIZ', '~650 km/sa (irtifada)'], ['İRTİFA TAVANI', '~13.000 m'], ['3D PARÇA SAYISI', '16 Bağımsız Grup']],
      tag: 'SPITFIRE-MK9-V12', icon: '✈️',
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="70" x2="300" y2="70" stroke="#94a3b8" stroke-dasharray="4 4"/><ellipse cx="155" cy="70" rx="34" ry="56" fill="#0284c7" fill-opacity="0.14" stroke="#0284c7" stroke-width="2"/><path d="M52 70 C85 56, 200 58, 255 70 C200 82, 85 84, 52 70 Z" fill="#6b7460" fill-opacity="0.32" stroke="#1e293b" stroke-width="2"/><rect x="188" y="62" width="42" height="16" rx="2" fill="#d97706" fill-opacity="0.35" stroke="#b45309" stroke-width="1.8"/><line x1="255" y1="36" x2="255" y2="104" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/><line x1="175" y1="34" x2="208" y2="34" stroke="#dc2626" stroke-width="2.2"/><line x1="175" y1="106" x2="208" y2="106" stroke="#dc2626" stroke-width="2.2"/></svg>'
    },

    // ===================================================================== 2. GRUP (AKTİF & PLANLI)
    {
      id: 'leonardo', sim: 'leonardo', group: 2, status: 'live',
      year: 1487, yearLabel: '~1487', eraLabel: 'RÖNESANS',
      domain: 'land', era: 'gunpowder', energy: ['muscle', 'gunpowder'], role: ['armor'], origin: 'italy',
      name: 'Leonardo da Vinci\'nin Zırhlı Aracı', sub: 'CRANK & GEAR DRIVE • KONİK AHŞAP ZIRH',
      desc: 'Leonardo\'nun defterlerindeki, çevresine 16 hafif top dizilmiş konik ahşap zırhlı araç. 8 kişilik mürettebat krankları çevirerek fener dişlilerle tekerlekleri döndürür. "1487 Kodeks" (ters dişli kilidi) ile "Düzeltilmiş Dişli" modları arasında canlı geçiş yapın ve 360° salvo ateşleyin!',
      tags: ['Krank & Fener Dişli', 'Konik Ahşap Zırh', '16 Çevresel Top', 'Kodeks ⇄ Düzeltilmiş Dişli'],
      specs: [['TAHRİK', '8 Kişilik İkiz Krank'], ['SİLAH', '16 × Tunç Hafif Top'], ['ÖNE ÇIKAN', 'Kodeks ⇄ Düzeltilmiş Dişli'], ['3D PARÇA SAYISI', '14 Bağımsız Grup']],
      tag: 'LEONARDO-1487', icon: '🛡️',
      modal: [
        'Konik ahşap zırh kabuğu ve gözetleme kulesi (X-Ray ile iç mekanizma)',
        'Krank milleri, fener dişliler ve tekerlek aktarma organları',
        'Etkileşim: "Çizimdeki hali" ile "Düzeltilmiş dişli" karşılaştırması — çizimde araç neden ilerleyemez?',
        'Çevresel hafif top bataryası ve dönüşlü atış gösterimi'
      ],
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="122" x2="300" y2="122" stroke="#94a3b8" stroke-dasharray="4 4"/><path d="M70 104 Q160 10 250 104 Z" fill="#b45309" fill-opacity="0.18" stroke="#78350f" stroke-width="2.2"/><rect x="146" y="22" width="28" height="18" rx="3" fill="#d97706" fill-opacity="0.3" stroke="#78350f" stroke-width="2"/><line x1="70" y1="104" x2="250" y2="104" stroke="#1e293b" stroke-width="2.5"/><circle cx="100" cy="112" r="10" stroke="#1e293b" stroke-width="2"/><circle cx="220" cy="112" r="10" stroke="#1e293b" stroke-width="2"/><circle cx="160" cy="80" r="14" stroke="#0284c7" stroke-width="2" stroke-dasharray="3 2"/><path d="M160 66 L160 94 M146 80 L174 80" stroke="#0284c7" stroke-width="1.6"/><line x1="82" y1="96" x2="58" y2="98" stroke="#334155" stroke-width="4" stroke-linecap="round"/><line x1="238" y1="96" x2="262" y2="98" stroke="#334155" stroke-width="4" stroke-linecap="round"/><line x1="112" y1="66" x2="94" y2="58" stroke="#334155" stroke-width="4" stroke-linecap="round"/><line x1="208" y1="66" x2="226" y2="58" stroke="#334155" stroke-width="4" stroke-linecap="round"/><path d="M100 112 L160 80 L220 112" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3 2"/></svg>'
    },
    {
      id: 'kadirga', sim: 'kadirga', group: 2, status: 'live',
      year: 1571, yearLabel: '1571', eraLabel: 'BARUT ÇAĞI',
      domain: 'sea', era: 'gunpowder', energy: ['gunpowder', 'muscle'], role: ['artillery'], origin: 'ottoman',
      name: 'Osmanlı Kadırgası & Baş Topu (İnebahtı)', sub: 'OARED WAR GALLEY • KIZAKLI BAŞ TOPU',
      desc: 'Akdeniz\'in kürekli savaş gemisi. Ana silahı, pruvada omurga doğrultusunda kızak üzerine yerleştirilmiş ağır tunç baş topudur; gemi bu topu hedefe çevirmek için diferansiyel kürek manevrasıyla (bir taraf ileri, diğer taraf geri) döndürülür. Ateşleyin, braga halatıyla geri tepmeyi sönümleyin ve palangalarla topu tekrar bataryaya çekin!',
      tags: ['Kızaklı Tunç Baş Topu', 'Diferansiyel Kürek Manevrası', 'Mahmuz & 4 Prangi', 'Braga Halatı & Palanga'],
      specs: [['TAHRİK', '16 Alakürek & Latin Yelken'], ['ANA SİLAH', 'Kızaklı Tunç Baş Topu + 4 Prangi'], ['GERİ TEPME', '~0,75 m Kızak + Braga Freni'], ['3D PARÇA SAYISI', '15 Bağımsız Grup']],
      tag: 'KADIRGA-1571', icon: '⚓',
      modal: [
        'Kadırga gövdesi, kürek tezgâhları ve yelken donanımı (X-Ray kesit)',
        'Pruvadaki kızaklı tunç baş topu ve yan toplar',
        'Etkileşim: kürek temposu ile hız, geminin dönüşüyle topun hedefe çevrilmesi',
        'Atışta topun kızak üzerinde geri kayması ve halat-palanga freni'
      ],
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 100 Q160 112 300 100" stroke="#0284c7" stroke-width="1.8" stroke-dasharray="5 4"/><path d="M40 82 L268 82 L292 70 L280 92 Q160 104 52 94 Z" fill="#b45309" fill-opacity="0.22" stroke="#78350f" stroke-width="2.2"/><line x1="150" y1="82" x2="150" y2="22" stroke="#1e293b" stroke-width="2.5"/><path d="M150 26 L210 60 L150 66 Z" fill="#f1f5f9" stroke="#475569" stroke-width="1.6"/><rect x="238" y="72" width="34" height="8" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.6"/><line x1="272" y1="76" x2="290" y2="76" stroke="#0f172a" stroke-width="3"/><g stroke="#475569" stroke-width="1.6"><line x1="70" y1="90" x2="58" y2="118"/><line x1="95" y1="92" x2="83" y2="120"/><line x1="120" y1="93" x2="108" y2="121"/><line x1="145" y1="94" x2="133" y2="122"/><line x1="170" y1="94" x2="158" y2="122"/><line x1="195" y1="93" x2="183" y2="121"/><line x1="220" y1="92" x2="208" y2="120"/></g></svg>'
    },
    {
      id: 'gatling', sim: 'gatling', group: 2, status: 'live',
      year: 1862, yearLabel: '1862', eraLabel: 'SANAYİ DEVRİMİ',
      domain: 'land', era: 'industrial', energy: ['gunpowder', 'muscle'], role: ['smallarms'], origin: 'usa',
      name: 'Gatling Makineli Silahı (1862)', sub: 'HAND-CRANKED ROTARY GUN • 6 NAMLU',
      desc: 'Richard Gatling\'in 1862\'de patentini aldığı el krankıyla çalışan döner namlulu silah. Namlular döndükçe her birinin kilidi sabit helisel kam oluğu boyunca 14 cm ileri-geri itilir: mermiyi yerleştirir, Saat 6 yönünde ateşler ve boş kovanı çıkarır. X-Ray modunda kam ve 6 sürgünün tam döngüsünü inceleyin!',
      tags: ['6 Döner Namlu', 'Helisel Kam & 6 Kilit', '90° Konik Dişli Krank', 'Yerçekimli Şarjör'],
      specs: [['NAMLU', '6 × .58 Kalibre'], ['TAHRİK', 'El Krankı (1:1 Konik Dişli)'], ['BESLEME', 'Yerçekimli Şarjör (48 Atım)'], ['3D PARÇA SAYISI', '14 Bağımsız Grup']],
      tag: 'GATLING-1862', icon: '🔩',
      modal: [
        'Namlu demeti, döner gövde ve sabit dış muhafaza',
        'Helisel kam oluğu ve 6 kilit sürgüsü (X-Ray ile tam döngü)',
        'Etkileşim: krank devri ↔ atış hızı, mermi besleme ve kovan atma',
        'Topçu arabası ve yükseliş-yön ayar mekanizması'
      ],
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="124" x2="300" y2="124" stroke="#94a3b8" stroke-dasharray="4 4"/><rect x="110" y="50" width="160" height="26" rx="4" fill="#64748b" fill-opacity="0.22" stroke="#1e293b" stroke-width="2"/><g stroke="#334155" stroke-width="2"><line x1="120" y1="55" x2="290" y2="55"/><line x1="120" y1="63" x2="292" y2="63"/><line x1="120" y1="71" x2="290" y2="71"/></g><rect x="86" y="44" width="34" height="38" rx="4" fill="#d97706" fill-opacity="0.28" stroke="#b45309" stroke-width="2"/><rect x="96" y="28" width="16" height="16" fill="#b45309" fill-opacity="0.3" stroke="#78350f" stroke-width="1.6"/><circle cx="72" cy="63" r="10" stroke="#0284c7" stroke-width="2"/><line x1="72" y1="63" x2="64" y2="78" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/><circle cx="150" cy="104" r="20" stroke="#1e293b" stroke-width="2.2"/><line x1="150" y1="84" x2="150" y2="124" stroke="#1e293b" stroke-width="1.4"/><line x1="130" y1="104" x2="170" y2="104" stroke="#1e293b" stroke-width="1.4"/><line x1="110" y1="80" x2="60" y2="118" stroke="#78350f" stroke-width="3"/></svg>'
    },
    {
      id: 'mark1', sim: 'mark1', group: 2, status: 'live',
      year: 1916, yearLabel: '1916', eraLabel: 'I. DÜNYA SAVAŞI',
      domain: 'land', era: 'ww1', energy: ['ice', 'gunpowder'], role: ['armor'], origin: 'uk',
      name: 'İngiliz Mark I Tankı ("Male")', sub: 'RHOMBOID TRACKS • 2 × 6-POUNDER SPONSON',
      desc: 'Eylül 1916\'da Somme\'da ilk kez savaşa giren, tarihin ilk muharebe tankı. Gövdeyi çepeçevre saran eşkenar dörtgen paletler siperleri aşmak için tasarlandı. Yanlardaki çıkıntılı yuvalarda (sponson) 2 × 57 mm top bulunur; 4 kişilik ikincil vites ve arka kuyruk tekerlekleriyle tek paleti durdurarak yönlendirin veya Somme siperini aşın!',
      tags: ['Eşkenar Dörtgen Palet', '2 × 6-Pounder Sponson', 'Daimler Motor & İkincil Vites', 'Siper Aşma & Kuyruk Tekeri'],
      specs: [['AĞIRLIK', '~28,4 t ("Male")'], ['MOTOR', 'Foster-Daimler, 105 BG'], ['SİLAH', '2 × 57 mm + 3 × .303 MG'], ['3D PARÇA SAYISI', '16 Bağımsız Grup']],
      tag: 'MARK-I-1916', icon: '🛡️',
      modal: [
        'Eşkenar dörtgen palet şasisi ve palet makaraları',
        'Daimler motor, ana vites kutusu ve yan vites (yönlendirme) düzeni',
        'Etkileşim: siper aşma gösterimi ve yönlendirme için mürettebat koordinasyonu',
        'Yan sponsonlardaki 6-pounder toplar ve makineli tüfekler'
      ],
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="124" x2="300" y2="124" stroke="#94a3b8" stroke-dasharray="4 4"/><path d="M40 100 L80 40 L250 40 L290 100 L250 122 L80 122 Z" fill="#6b7460" fill-opacity="0.3" stroke="#1e293b" stroke-width="2.4"/><path d="M60 100 L92 52 L238 52 L270 100 L238 112 L92 112 Z" stroke="#475569" stroke-width="1.4" stroke-dasharray="3 3"/><rect x="140" y="70" width="44" height="30" rx="4" fill="#d97706" fill-opacity="0.3" stroke="#b45309" stroke-width="2"/><line x1="184" y1="82" x2="214" y2="80" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/><rect x="150" y="30" width="30" height="10" rx="2" fill="#475569" stroke="#0f172a" stroke-width="1.5"/><g fill="#334155"><circle cx="100" cy="117" r="4"/><circle cx="130" cy="117" r="4"/><circle cx="160" cy="117" r="4"/><circle cx="190" cy="117" r="4"/><circle cx="220" cy="117" r="4"/></g></svg>'
    },
    {
      id: 'fokker', sim: 'fokker', group: 2, status: 'live',
      year: 1917, yearLabel: '1917', eraLabel: 'I. DÜNYA SAVAŞI',
      domain: 'air', era: 'ww1', energy: ['ice', 'gunpowder'], role: ['aircraft'], origin: 'germany',
      name: 'Fokker Dr.I Üç Kanatlı Avcı', sub: 'OBERURSEL ROTARY ENGINE • SENKRONİZE MAKİNELİ TÜFEK',
      desc: 'Üç kanatlı yapısıyla çok çevik bir avcı. Oberursel Ur.II döner (rotary) motorunda krank mili gövdeye sabittir; 9 silindir ve karter pervaneyle birlikte döner! İki 7,92 mm Spandau tüfeği, Fokker senkronizasyon düzeneğiyle pervanenin içinden ateş eder. Senkronizasyonu kapatıp ateşleyerek kurşunların pervaneyi nasıl vurduğunu deneyin!',
      tags: ['9 Silindir Döner (Rotary) Motor', 'Fokker Senkronizasyon (Açık/Kapalı)', 'Konsol Üç Kanat', '2 × 7,92 mm Spandau'],
      specs: [['MOTOR', 'Oberursel Ur.II, 110 BG (Döner)'], ['SİLAH', '2 × 7,92 mm Spandau (Senkronize)'], ['KANAT AÇIKLIĞI', '7,19 m (Üç Kanat)'], ['3D PARÇA SAYISI', '15 Bağımsız Grup']],
      tag: 'FOKKER-DR1-1917', icon: '🛩️',
      modal: [
        'Üç kanat, gövde kafes iskeleti ve kumaş kaplama (X-Ray)',
        'Oberursel döner motor: pervaneyle birlikte dönen 9 silindir, sabit krank',
        'Etkileşim: senkronizasyon açık/kapalı — kapalıyken kurşunların pervaneye isabeti',
        'Kumanda yüzeyleri ve kokpit; iki makineli tüfek salvosu'
      ],
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="124" x2="300" y2="124" stroke="#94a3b8" stroke-dasharray="4 4"/><rect x="95" y="28" width="130" height="9" rx="4" fill="#dc2626" fill-opacity="0.25" stroke="#7f1d1d" stroke-width="2"/><rect x="100" y="56" width="120" height="9" rx="4" fill="#dc2626" fill-opacity="0.25" stroke="#7f1d1d" stroke-width="2"/><rect x="105" y="84" width="110" height="9" rx="4" fill="#dc2626" fill-opacity="0.25" stroke="#7f1d1d" stroke-width="2"/><line x1="130" y1="37" x2="130" y2="84" stroke="#334155" stroke-width="1.6"/><line x1="195" y1="37" x2="195" y2="84" stroke="#334155" stroke-width="1.6"/><path d="M70 70 L240 64 L285 70 L240 76 Z" fill="#64748b" fill-opacity="0.25" stroke="#1e293b" stroke-width="2"/><circle cx="72" cy="70" r="14" stroke="#0284c7" stroke-width="2"/><line x1="58" y1="40" x2="58" y2="100" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/><g stroke="#d97706" stroke-width="2"><line x1="110" y1="62" x2="84" y2="62"/><line x1="110" y1="66" x2="84" y2="66"/></g><circle cx="150" cy="114" r="9" stroke="#1e293b" stroke-width="2"/><circle cx="170" cy="114" r="9" stroke="#1e293b" stroke-width="2"/></svg>'
    },

    // ===================================================================== 3. GRUP (PLANLI)
    {
      id: 'monitor', group: 3, status: 'planned',
      year: 1862, yearLabel: '1862', eraLabel: 'SANAYİ DEVRİMİ',
      domain: 'sea', era: 'industrial', energy: ['gunpowder', 'ice'], role: ['artillery', 'armor'], origin: 'usa',
      name: 'USS Monitor & Ericsson Döner Taret', sub: 'IRONCLAD REVOLVING TURRET • 2 × 11 İNÇ DAHLGREN TOPU',
      desc: 'John Ericsson tarafından tasarlanan, su hattının hemen üzerinde ("sal üzerinde peynir kutusu") yüzen ilk döner taretli zırhlı savaş gemisi. 8 kat 1 inçlik dövme demir plakadan oluşan 6,1 m çapındaki taret, merkezi mil üzerinde kaldırılıp buharlı yardımcı motor ve dişli çarklarla 360° döndürülür; atış anında ağır sarkaçlı kepenkler lombarları kapatır.',
      tags: ['360° Buharlı Döner Taret', '2 × 11 inç Dahlgren Topu', 'Sarkaçlı Lombar Kepenkleri', 'Titreşimli Manivela Buhar Motoru'],
      specs: [['ZIRH KALINLIĞI', '203 mm (8×1 inç Dövme Demir)'], ['SİLAH', '2 × 279 mm (11 inç) Dahlgren'], ['TARET İÇ ÇAPI', '6,10 m (20 ft) • ~120 Ton'], ['PLANLANAN GRUP', '15 Bağımsız Grup']],
      tag: 'MONITOR-1862', icon: '⚓',
      modal: [
        '8 kat 1 inç dövme demir plakalı silindirik taret (X-Ray kesiti) ve merkezi kaldırma/dönüş mili',
        'Yan yana iki adet 11 inç (279 mm) Dahlgren yivsiz top, sürtünmeli geri tepme kızakları ve el çarklı ileri sürme',
        'Etkileşim: taret 360° dönüşü, sarkaçlı lombar kepenklerinin (port stoppers) açılıp kapanması ve çift top salvosu',
        'Zırhlı güverte altında Ericsson titreşimli manivela (vibrating-lever) buhar motoru ve 4 kanatlı pervane'
      ],
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 98 Q90 94 160 98 T305 98" stroke="#0284c7" stroke-width="1.8" stroke-dasharray="5 3"/><path d="M28 96 L292 96 L276 116 L44 116 Z" fill="#475569" fill-opacity="0.32" stroke="#1e293b" stroke-width="2"/><rect x="115" y="54" width="90" height="42" rx="4" fill="#64748b" fill-opacity="0.38" stroke="#0f172a" stroke-width="2.4"/><line x1="160" y1="50" x2="160" y2="114" stroke="#d97706" stroke-width="2.4" stroke-dasharray="3 2"/><line x1="205" y1="70" x2="242" y2="70" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/><line x1="205" y1="80" x2="242" y2="80" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/><rect x="64" y="82" width="18" height="14" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.6"/></svg>'
    },
    {
      id: 'katyusha', group: 3, status: 'planned',
      year: 1942, yearLabel: '1942', eraLabel: 'II. DÜNYA SAVAŞI',
      domain: 'land', era: 'ww2', energy: ['jet', 'ice'], role: ['artillery'], origin: 'ussr',
      name: 'BM-13 "Katyuşa" Çok Namlulu Roketatar', sub: 'MULTIPLE ROCKET LAUNCHER • 16 × 132 MM M-13 ROKETİ',
      desc: 'ZİS-6 (6×4) kamyon şasisi üzerine yerleştirilmiş 8 çift yönlü I-profil kızakta toplam 16 adet 132 mm M-13 katı yakıtlı roket taşıyan mobil topçu sistemi. Kabin içindeki el çarklı elektrikli ateşleme kutusu kontağı sıra ile kapatır; 7–10 saniyelik salvo sonunda 16 roket ~8,5 km menzile yaylım ateşiyle ulaşır.',
      tags: ['8 Çift Yönlü I-Profil Ray', '16 × 132 mm M-13 Roketi', 'Sıralı Elektrikli Kontak Kutusu', 'Arka Denge Kriko Ayakları'],
      specs: [['ROKET ÇAPI', '132 mm M-13 (42,5 kg)'], ['KAPASİTE', '16 Roket (8 Ray × 2)'], ['SALVO SÜRESİ', '7 – 10 Saniye (~8,5 km Menzil)'], ['PLANLANAN GRUP', '15 Bağımsız Grup']],
      tag: 'BM13-KATYUSHA-1942', icon: '🚀',
      modal: [
        'ZİS-6 (6×4) üç dingilli kamyon şasisi, katlanır zırhlı ön cam panjurları ve arka denge kriko ayakları',
        '8 adet 5 metrelik I-profil çelik fırlatma rayı (üstte 8 + altta 8 = 16 adet 132 mm M-13 roketi)',
        'Etkileşim: yükseliş (+4° ila +45°) ve yanal yönlendirme dişlileri; 16 roketin 0,5 sn arayla sıralı salvo ateşlemesi',
        'M-13 roket iç kesiti (X-Ray): 7 çubuklu nitrogliserin-nitroselüloz katı yakıt bloğu, Laval lülesi ve 4 kuyruk kanatçığı'
      ],
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="124" x2="300" y2="124" stroke="#94a3b8" stroke-dasharray="4 4"/><rect x="52" y="92" width="190" height="12" rx="2" fill="#475569" fill-opacity="0.3" stroke="#1e293b" stroke-width="2"/><path d="M190 92 L190 66 L225 66 L238 80 L238 92 Z" fill="#4b5320" fill-opacity="0.3" stroke="#1e293b" stroke-width="2"/><g transform="rotate(-22 140 82)"><line x1="55" y1="74" x2="215" y2="74" stroke="#0f172a" stroke-width="3.2"/><line x1="65" y1="67" x2="205" y2="67" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/><line x1="65" y1="81" x2="205" y2="81" stroke="#d97706" stroke-width="3" stroke-linecap="round"/></g><circle cx="80" cy="111" r="12" stroke="#1e293b" stroke-width="2.2"/><circle cx="110" cy="111" r="12" stroke="#1e293b" stroke-width="2.2"/><circle cx="215" cy="111" r="12" stroke="#1e293b" stroke-width="2.2"/></svg>'
    },
    {
      id: 'v2', group: 3, status: 'planned',
      year: 1944, yearLabel: '1944', eraLabel: 'II. DÜNYA SAVAŞI',
      domain: 'space', era: 'ww2', energy: ['jet'], role: ['artillery', 'siege'], origin: 'germany',
      name: 'V-2 (Aggregat 4) Balistik Roket & Turbo-Pompa', sub: 'LIQUID-PROPELLANT BALLISTIC MISSILE • 25 TON İTKİ',
      desc: 'Uzay sınırını (Kármán hattı, >100 km) aşan ilk insan yapımı araç ve modern uzay roketçiliğinin doğrudan atası. H₂O₂ buhar jeneratörüyle tahrik edilen 580 BG turbo-pompa, saniyede 125 kg sıvı oksijen (LOX) ve etil alkolü 18 brülörlü yanma odasına basar; egzoz jetinin içindeki 4 grafit kanatçık (jet vanes) LEV-3 jiroskoplarıyla roketi yönlendirir.',
      tags: ['H₂O₂ Buhar Türbinli Turbo-Pompa', 'LOX + Alkol Tankları (X-Ray)', '4 × Grafit Egzoz Kanatçığı (TVC)', 'LEV-3 Jiroskop & İvmeölçer'],
      specs: [['İTKİ KUVVETİ', '~25.000 kgf (245 kN)'], ['TURBO-POMPA', '580 BG • 4.000 RPM (125 kg/sn)'], ['MAKSİMUM HIZ', 'Mach 4,7 (~5.760 km/sa)'], ['PLANLANAN GRUP', '16 Bağımsız Grup']],
      tag: 'A4-V2-1944', icon: '🛰️',
      modal: [
        '4 bölmeli dış aerodinamik kabuk (X-Ray): burun harp başlığı, LEV-3 jiroskop bölmesi, alkol/LOX tankları ve kuyruk motoru',
        'Walter H₂O₂ buhar türbiniyle çalışan 4.000 RPM çift santrifüj turbo-pompa ve 18 çanaklı yanma odası',
        'Etkileşim: turbo-pompa devri, rejeneratif alkol soğutma akışı ve 4 grafit egzoz kanatçığıyla (TVC) itki vektör yönlendirme',
        'Meillerwagen hidrolik dikme kolu ve döner fırlatma tablası (Firing Table)'
      ],
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 70 L235 52 Q278 52 298 70 Q278 88 235 88 L40 70 Z" fill="#1e293b" fill-opacity="0.18" stroke="#0f172a" stroke-width="2.2"/><path d="M40 52 L18 36 L58 56 Z" fill="#334155" stroke="#0f172a" stroke-width="1.6"/><path d="M40 88 L18 104 L58 84 Z" fill="#334155" stroke="#0f172a" stroke-width="1.6"/><rect x="105" y="58" width="52" height="24" rx="4" fill="#0284c7" fill-opacity="0.28" stroke="#0284c7" stroke-width="1.8"/><rect x="165" y="58" width="52" height="24" rx="4" fill="#d97706" fill-opacity="0.28" stroke="#d97706" stroke-width="1.8"/><circle cx="82" cy="70" r="9" stroke="#dc2626" stroke-width="2"/><path d="M40 62 L58 58 L58 82 L40 78 Z" fill="#dc2626" fill-opacity="0.3" stroke="#991b1b" stroke-width="1.8"/></svg>'
    },
    {
      id: 'j79', group: 3, status: 'planned',
      year: 1965, yearLabel: '1965', eraLabel: 'SOĞUK SAVAŞ',
      domain: 'air', era: 'coldwar', energy: ['jet'], role: ['aircraft'], origin: 'usa',
      name: 'General Electric J79-GE-17 Turbojet & Art Yakıcı', sub: 'VARIABLE-STATOR AXIAL TURBOJET • AFTERBURNER & NOZZLE',
      desc: 'F-4 Phantom II ve F-104 Starfighter gibi Soğuk Savaş efsanelerine Mach 2+ hız kazandıran tek şaftlı eksenel turbojet motoru. Kompresör bayılmasını (stall) önleyen ilk 6 kademe değişken açılı stator kanatçıkları (VSV), 10 halkalı kan-annüler yanma odası, 3 kademeli türbin ve art yakıcı (afterburner) devreye girdiğinde açılıp kapanan 24 yapraklı yakınsak-ıraksak egzoz nozulu.',
      tags: ['17 Kademe Kompresör & VSV', 'Kan-Annüler Yanma Odası', 'Art Yakıcı (Afterburner) Halkaları', 'Değişken Alanlı Egzoz Nozulu'],
      specs: [['KURU / ISLAK İTKİ', '52,9 kN / 79,6 kN (Art Yakıcılı)'], ['KOMPRESÖR', '17 Kademe Eksenel (13,5:1 Basınç)'], ['TÜRBİN', '3 Kademe Eksenel (~7.460 RPM)'], ['PLANLANAN GRUP', '15 Bağımsız Grup']],
      tag: 'J79-TURBOJET-1965', icon: '🔥',
      modal: [
        '17 kademeli eksenel kompresör rotoru ve devirle birlikte açı değiştiren değişken stator kanatçıkları (VSV biyel halkaları)',
        '10 adet kan-annüler alev tüpü (combustor cans) ve kombine şaftı süren 3 kademeli yüksek basınç türbini',
        'Etkileşim: gaz kolu (%0–%100 Kuru İtki + Art Yakıcı kademesi), yakıt püskürtme halkaları ve 24 yapraklı hareketli egzoz nozulu',
        'Bölünmüş dış titanyum/çelik karter gövdesi (X-Ray kesiti) ve alt aksesuar dişli kutusu'
      ],
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="36" y="46" width="175" height="48" rx="4" fill="#475569" fill-opacity="0.22" stroke="#1e293b" stroke-width="2.2"/><path d="M211 46 L278 52 L292 44 L292 96 L278 88 L211 94 Z" fill="#d97706" fill-opacity="0.22" stroke="#b45309" stroke-width="2"/><line x1="36" y1="70" x2="225" y2="70" stroke="#0f172a" stroke-width="3.2"/><g stroke="#0284c7" stroke-width="2"><line x1="55" y1="48" x2="55" y2="92"/><line x1="72" y1="50" x2="72" y2="90"/><line x1="89" y1="52" x2="89" y2="88"/><line x1="106" y1="53" x2="106" y2="87"/><line x1="123" y1="54" x2="123" y2="86"/></g><rect x="138" y="54" width="36" height="32" rx="4" fill="#dc2626" fill-opacity="0.3" stroke="#991b1b" stroke-width="1.8"/><g stroke="#7c2d12" stroke-width="2.4"><line x1="186" y1="48" x2="186" y2="92"/><line x1="198" y1="48" x2="198" y2="92"/></g></svg>'
    },
    {
      id: 'phalanx', group: 3, status: 'planned',
      year: 1980, yearLabel: '1980', eraLabel: 'MODERN DÖNEM',
      domain: 'sea', era: 'modern', energy: ['gunpowder'], role: ['defense', 'smallarms'], origin: 'usa',
      name: 'Mk 15 Phalanx CIWS (20 mm M61 Vulcan & Radar)', sub: 'CLOSED-LOOP RADAR GATLING DEFENSE • 3.000 – 4.500 ATIM/DK',
      desc: 'Gemisavar füzelere karşı son savunma hattı (Close-In Weapon System). Beyaz radom içindeki Ku-bandı arama ve takip radarları, gelen hedefle birlikte havadaki 20 mm mermi akışını aynı anda izleyip açı farkını sıfırlayan kapalı çevrim (closed-loop spotting) kontrolüyle M61A1 6 namlulu Gatling topunu saniyeler içinde hedefe kilitler.',
      tags: ['M61A1 20 mm 6 Namlulu Gatling', 'Ku-Band Arama & Takip Radarı', '1.550 Mermilik Helisel Tambur', '2 Eksenli Servo Kule & Radom'],
      specs: [['SİLAH SİSTEMİ', '20 mm M61A1 Vulcan (6 Namlu)'], ['ATIŞ HIZI', '3.000 – 4.500 Atım/Dakika'], ['RADAR SİSTEMİ', 'Ku-Band Kapalı Çevrim Arama/Takip'], ['PLANLANAN GRUP', '15 Bağımsız Grup']],
      tag: 'MK15-PHALANX-1980', icon: '📡',
      modal: [
        'İkonik beyaz kompozit radom (X-Ray kesiti): üstte dönen Ku-bandı arama anteni, önde monopuls takip çanağı',
        'M61A1 20 mm 6 namlulu Gatling topu, pnömatik/hidrolik tahrik motoru ve namlu ucu kelepçesi',
        'Etkileşim: kule yanal dönüş/yükseliş servoları, radar tarama devri ve 1.550 mermilik helisel tamburdan yüksek hızlı salvo',
        '1862 el kranklı Gatling topu ile 1980 radar güdümlü M61 Vulcan arasındaki 118 yıllık mekanik süreklilik'
      ],
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="124" x2="300" y2="124" stroke="#94a3b8" stroke-dasharray="4 4"/><rect x="115" y="106" width="70" height="18" rx="3" fill="#475569" fill-opacity="0.35" stroke="#1e293b" stroke-width="2"/><path d="M126 62 L126 28 A24 24 0 0 1 174 28 L174 62 Z" fill="#f8fafc" stroke="#0f172a" stroke-width="2.2"/><circle cx="150" cy="46" r="10" stroke="#0284c7" stroke-width="1.8" stroke-dasharray="3 2"/><rect x="122" y="62" width="56" height="44" rx="4" fill="#64748b" fill-opacity="0.3" stroke="#1e293b" stroke-width="2"/><line x1="178" y1="74" x2="248" y2="66" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round"/><circle cx="150" cy="92" r="11" fill="#d97706" fill-opacity="0.28" stroke="#b45309" stroke-width="1.8"/></svg>'
    }
  ];

  window.MUSEUM_CATALOG = { FACETS, VEHICLES };
})();

