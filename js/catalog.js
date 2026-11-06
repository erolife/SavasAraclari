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
      { key: 'steam', label: '♨️ Buhar Makinesi' },
      { key: 'jet', label: '🔥 Jet & Roket' }, { key: 'electric', label: '⚡ Elektrik & Elektromekanik' }
    ] },
    { key: 'role', url: 'gorev', label: 'Görev Tipi', options: [
      { key: 'siege', label: 'Kuşatma' }, { key: 'artillery', label: 'Topçu' },
      { key: 'armor', label: 'Zırhlı Araç' }, { key: 'aircraft', label: 'Savaş Uçağı' },
      { key: 'smallarms', label: 'Hafif & Makineli Silah' }, { key: 'defense', label: 'Savunma Sistemi' }, { key: 'intelligence', label: 'Haberleşme & İstihbarat' }, { key: 'transport', label: 'Nakliye & Çıkarma' }, { key: 'melee', label: 'Yakın Muharebe & Hücum' }, { key: 'projectile', label: 'Elle Atılan & Fırlatma Araçları' }
    ] },
    { key: 'origin', url: 'koken', label: 'Köken', options: [
      { key: 'china', label: 'Çin' },
      { key: 'rome', label: 'Roma' }, { key: 'medieval_eu', label: 'Orta Çağ Avrupa & Akdeniz' },
      { key: 'ottoman', label: 'Osmanlı' }, { key: 'italy', label: 'İtalya (Rönesans)' },
      { key: 'uk', label: 'İngiltere' }, { key: 'germany', label: 'Almanya' },
      { key: 'usa', label: 'ABD' }, { key: 'ussr', label: 'SSCB' }, { key: 'korea', label: 'Kore (Joseon)' }, { key: 'mexico', label: 'Meksika (Mezoamerika)' }, { key: 'europe', label: 'Avrupa (yer atfı belirsiz)' }, { key: 'greek', label: 'Helenistik Dünya' }
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
      id: 'monitor', sim: 'monitor', group: 3, status: 'live',
      year: 1862, yearLabel: '1862', eraLabel: 'SANAYİ DEVRİMİ',
      domain: 'sea', era: 'industrial', energy: ['steam', 'gunpowder'], role: ['artillery', 'armor'], origin: 'usa',
      name: 'USS Monitor & Ericsson Döner Taret', sub: 'IRONCLAD REVOLVING TURRET • 2 × 11 İNÇ DAHLGREN TOPU',
      desc: 'USS Monitor (1862): döner demir taret, iki XI-inç Dahlgren topu ve yatay buhar makinesini anlatan 22 gruplu tam gemi modeli. X-Ray ile içini inceleyin; kepenkleri açın ve temsili geri tepme gösterimini oynatın. Alçak gövde, kumanda kabini, filikalar, bacalar ve kıç pervanesiyle gemiyi inceleyin. İç ölçüler yaklaşık yeniden kurulmuştur.',
      tags: ['360° Buharlı Döner Taret', '2 × 11 inç Dahlgren Topu', 'Sarkaçlı Lombar Kepenkleri', 'Şematik Yatay Buhar Makinesi'],
      specs: [['ZIRH KALINLIĞI', '203 mm (8×1 inç Dövme Demir)'], ['SİLAH', '2 × 279 mm (11 inç) Dahlgren'], ['TARET İÇ ÇAPI', '~6,10 m (20 ft)'], ['3D PARÇA SAYISI', '22 Bağımsız Grup']],
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
      id: 'katyusha', sim: 'katyusha', group: 3, status: 'live',
      year: 1941, yearLabel: '1941', eraLabel: 'II. DÜNYA SAVAŞI',
      domain: 'land', era: 'ww2', energy: ['jet', 'ice'], role: ['artillery'], origin: 'ussr',
      name: 'BM-13 "Katyuşa" Çok Namlulu Roketatar', sub: 'MULTIPLE ROCKET LAUNCHER • 16 × 132 MM M-13 ROKETİ',
      desc: 'Erken dönem ZİS-6 kamyon şasili BM-13: ayrıntılı kabin, motor, üç dingil, yaprak yaylar ve sekiz çift yüzlü ray. X-Ray ile içini inceleyin, denge ayaklarını indirin ve on altı gövdenin sıralı gösterimini oynatın. Boyutlar fotoğraf referanslarından yaklaşık; balistik hesaplanmaz.',
      tags: ['ZİS-6 Üç Dingilli Şasi', '8 Çift Yüzlü Ray', '16 Dış Roket Gövdesi', 'Denge Ayakları'],
      specs: [['ŞASİ', 'ZİS-6 • 6×4'], ['KAPASİTE', '16 Gövde (8 Ray × 2)'], ['ETKİLEŞİM', 'Sıralı gösterim ve ikmal'], ['3D PARÇA SAYISI', '18 Bağımsız Grup']],
      tag: 'BM13-KATYUSHA-1941', icon: '🚀',
      modal: [
        'ZİS-6 kabin, motor, üç dingil, çift arka lastikler ve yaprak yay ayrıntıları',
        'Sekiz çift yüzlü ray, on altı dış roket gövdesi, çapraz taşıyıcılar ve koruma panelleri',
        'Etkileşim: ray açısı, tekerlek gösterimi, denge ayakları ve sıralı görsel animasyon',
        'X-Ray ile kabin ve motor; altı adımlı rehber tur ve dört yüzey kaplaması'
      ],
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="124" x2="300" y2="124" stroke="#94a3b8" stroke-dasharray="4 4"/><rect x="52" y="92" width="190" height="12" rx="2" fill="#475569" fill-opacity="0.3" stroke="#1e293b" stroke-width="2"/><path d="M190 92 L190 66 L225 66 L238 80 L238 92 Z" fill="#4b5320" fill-opacity="0.3" stroke="#1e293b" stroke-width="2"/><g transform="rotate(-22 140 82)"><line x1="55" y1="74" x2="215" y2="74" stroke="#0f172a" stroke-width="3.2"/><line x1="65" y1="67" x2="205" y2="67" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/><line x1="65" y1="81" x2="205" y2="81" stroke="#d97706" stroke-width="3" stroke-linecap="round"/></g><circle cx="80" cy="111" r="12" stroke="#1e293b" stroke-width="2.2"/><circle cx="110" cy="111" r="12" stroke="#1e293b" stroke-width="2.2"/><circle cx="215" cy="111" r="12" stroke="#1e293b" stroke-width="2.2"/></svg>'
    },
    {
      id: 'v2', sim: 'v2', group: 3, status: 'live',
      year: 1944, yearLabel: '1944', eraLabel: 'II. DÜNYA SAVAŞI',
      domain: 'space', era: 'ww2', energy: ['jet'], role: ['artillery', 'siege'], origin: 'germany',
      name: 'V-2 / A4 ve Meillerwagen Taşıyıcısı', sub: 'ROKET VE TAŞIMA DÜZENEĞİ • MÜZE İNCELEMESİ',
      desc: 'V-2/A4 ve Meillerwagen taşıyıcısının müze referanslı modeli. Siyah-beyaz dış gövde, dört kuyruk kanadı, iç tank hacimleri ve taşıma kafesini inceleyin; dikey/yatay sergi pozları arasında geçin. Tarihsel anlatım zorla çalıştırılan insanları ve saldırıların mağdurlarını da kapsar.',
      tags: ['Meillerwagen Taşıyıcısı', 'Dikey ve Yatay Sergi Pozu', 'X-Ray İç Bölmeler', 'Dört Kuyruk Kanadı'],
      specs: [['GÖVDE UZUNLUĞU', '~14 m'], ['ANA GÖVDE ÇAPI', '~1,65 m'], ['ETKİLEŞİM', 'Kaldırma ve inceleme pozları'], ['3D PARÇA SAYISI', '18 Bağımsız Grup']],
      tag: 'A4-V2-1944', icon: '🛰️',
      modal: ['Meillerwagen şasisi, tekerlekleri, destekleri ve hareketli taşıma kafesi', 'Gövde panelleri, kuyruk kanatları ve X-Ray iç bölmeleri', 'Dikey/yatay müze pozları; fırlatma veya hedefleme simülasyonu yok', 'AWM kaynaklarıyla tarihsel bağlam ve yaklaşık görsel rekonstrüksiyon'],
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40 70 L235 52 Q278 52 298 70 Q278 88 235 88 L40 70 Z" fill="#1e293b" fill-opacity="0.18" stroke="#0f172a" stroke-width="2.2"/><path d="M40 52 L18 36 L58 56 Z" fill="#334155" stroke="#0f172a" stroke-width="1.6"/><path d="M40 88 L18 104 L58 84 Z" fill="#334155" stroke="#0f172a" stroke-width="1.6"/><rect x="105" y="58" width="52" height="24" rx="4" fill="#0284c7" fill-opacity="0.28" stroke="#0284c7" stroke-width="1.8"/><rect x="165" y="58" width="52" height="24" rx="4" fill="#d97706" fill-opacity="0.28" stroke="#d97706" stroke-width="1.8"/><circle cx="82" cy="70" r="9" stroke="#dc2626" stroke-width="2"/><path d="M40 62 L58 58 L58 82 L40 78 Z" fill="#dc2626" fill-opacity="0.3" stroke="#991b1b" stroke-width="1.8"/></svg>'
    },
    {
      id: 'j79', sim: 'j79', group: 3, status: 'live',
      year: 1965, yearLabel: '1965', eraLabel: 'SOĞUK SAVAŞ',
      domain: 'air', era: 'coldwar', energy: ['jet'], role: ['aircraft'], origin: 'usa',
      name: 'General Electric J79-GE-15 Turbojet & Art Yakıcı', sub: 'VARIABLE-STATOR AXIAL TURBOJET • AFTERBURNER & NOZZLE',
      desc: 'ABD Hava Kuvvetleri Müzesi GE-15 örneğini temel alan eğitim kesiti: 17 kademeli kompresör, üç kademeli türbin ve ortak şaft. X-Ray ile iç yapıyı inceleyin; gaz kolunu, temsili stator açısını ve egzoz açıklığını değiştirin. Art yakıcı ve renkli akış gösterimini açın. İç geometri yaklaşık, hareketler yavaşlatılmıştır.',
      tags: ['17 Kademe Kompresör & VSV', 'Kan-Annüler Yanma Odası', 'Art Yakıcı (Afterburner) Halkaları', 'Değişken Alanlı Egzoz Nozulu'],
      specs: [['KURU / ISLAK İTKİ', '48,5 kN / 75,6 kN (Art Yakıcılı)'], ['KOMPRESÖR', '17 Kademe Eksenel'], ['TÜRBİN', '3 Kademe Eksenel'], ['3D PARÇA SAYISI', '15 Bağımsız Grup']],
      tag: 'J79-TURBOJET-1965', icon: '🔥',
      modal: [
        '17 kademeli eksenel kompresör; sabit ve temsili değişken stator sıraları',
        'Temsili kan-annüler yanma bölgesi ve kompresörle aynı şaftı paylaşan 3 kademeli türbin',
        'Etkileşim: gösterim gaz kolu, art yakıcı, renkli akış ve temsili 24 yapraklı hareketli egzoz',
        'X-Ray karter ve temsili aksesuar kutusu; ölçüler ve kontrol çizelgesi sadeleştirilmiştir'
      ],
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="36" y="46" width="175" height="48" rx="4" fill="#475569" fill-opacity="0.22" stroke="#1e293b" stroke-width="2.2"/><path d="M211 46 L278 52 L292 44 L292 96 L278 88 L211 94 Z" fill="#d97706" fill-opacity="0.22" stroke="#b45309" stroke-width="2"/><line x1="36" y1="70" x2="225" y2="70" stroke="#0f172a" stroke-width="3.2"/><g stroke="#0284c7" stroke-width="2"><line x1="55" y1="48" x2="55" y2="92"/><line x1="72" y1="50" x2="72" y2="90"/><line x1="89" y1="52" x2="89" y2="88"/><line x1="106" y1="53" x2="106" y2="87"/><line x1="123" y1="54" x2="123" y2="86"/></g><rect x="138" y="54" width="36" height="32" rx="4" fill="#dc2626" fill-opacity="0.3" stroke="#991b1b" stroke-width="1.8"/><g stroke="#7c2d12" stroke-width="2.4"><line x1="186" y1="48" x2="186" y2="92"/><line x1="198" y1="48" x2="198" y2="92"/></g></svg>'
    },
    {
      id: 'phalanx', sim: 'phalanx', group: 3, status: 'live',
      year: 1999, yearLabel: '1999', eraLabel: 'MODERN DÖNEM',
      domain: 'sea', era: 'modern', energy: ['gunpowder'], role: ['defense', 'smallarms'], origin: 'usa',
      name: 'Mk 15 Phalanx CIWS — Block 1B', sub: 'RADAR, ELEKTRO-OPTİK SENSÖR VE ALTI NAMLU',
      desc: 'Block 1B görünümünde ayrıntılı güverte sistemi: beyaz radar kubbesi, elektro-optik sensör, altı namlulu rotor, tambur ve körüklü besleme kanalı. 18 seçilebilir grup, X-Ray ve yavaşlatılmış mekanizma gösterimi.',
      tags: ['Block 1B • 1999', '6 Namlulu Rotor', 'Radar ve Optik Sensör', '18 İnceleme Grubu'],
      specs: [['VARYANT', 'Mk 15 Phalanx Block 1B'], ['NAMLU GRUBU', '20 mm • 6 namlu'], ['ETKİLEŞİM', 'Rotor, yatay ve düşey inceleme'], ['MODEL GRUBU', '18 Bağımsız Grup']],
      tag: 'MK15-PHALANX-1B-1999', icon: '📡',
      modal: [
        'Dış form: yuvarlak radar kubbesi, sensör pencereleri, mafsallı top beşiği ve namlu destek kafesi',
        'Bakım ayrıntıları: cıvatalı kaide, tambur kapakları, körüklü kanal, kablolar, ızgaralar ve basamaklar',
        'Etkileşim: yavaşlatılmış rotor, elle eksen açıları, otomatik poz gösterimi, X-Ray ve parçalarına ayırma',
        '6 adımlı rehber tur; ilk Phalanx (1980) ile burada gösterilen Block 1B (1999) ayrımı'
      ],
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="124" x2="300" y2="124" stroke="#94a3b8" stroke-dasharray="4 4"/><rect x="115" y="106" width="70" height="18" rx="3" fill="#475569" fill-opacity="0.35" stroke="#1e293b" stroke-width="2"/><path d="M126 62 L126 28 A24 24 0 0 1 174 28 L174 62 Z" fill="#f8fafc" stroke="#0f172a" stroke-width="2.2"/><circle cx="150" cy="46" r="10" stroke="#0284c7" stroke-width="1.8" stroke-dasharray="3 2"/><rect x="122" y="62" width="56" height="44" rx="4" fill="#64748b" fill-opacity="0.3" stroke="#1e293b" stroke-width="2"/><line x1="178" y1="74" x2="248" y2="66" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round"/><circle cx="150" cy="92" r="11" fill="#d97706" fill-opacity="0.28" stroke="#b45309" stroke-width="1.8"/></svg>'
    },
    {
      id:'huey',sim:'huey',group:4,status:'live',year:1967,yearLabel:'1967',eraLabel:'SOĞUK SAVAŞ',domain:'air',era:'coldwar',energy:['jet'],role:['aircraft'],origin:'usa',
      name:'Bell UH-1H Iroquois — Huey',sub:'HAVA HAREKETLİLİĞİ • TÜRBİN VE ROTOR AKTARMASI',
      desc:'Tam gövdeli UH-1H: geniş camlı kokpit, kayar kabin kapıları, T53 türbin dış donanımı, transmisyon, kumanda tablası ve iki palli rotorlar. X-Ray ile iç bağlantıları inceleyin.',
      tags:['20 İnceleme Grubu','14,7 m Ana Rotor','Kayar Kabin Kapıları','Türbin ve Aktarma'],
      specs:[['ROTOR ÇAPI','14,7 m'],['GÖVDE BOYU','~12,6 m'],['GÖSTERİM','Rotor, kollektif ve kapılar'],['MODEL','20 Bağımsız Grup']],tag:'UH1H-HUEY',icon:'🚁',
      modal:['Tam gövde, kokpit, kabin koltukları, kızaklar ve uzun kuyruk bomu','T53 dış gövdeleri, transmisyon, mast ve kumanda bağlantıları','İki palli rotorlar, kollektif pala açısı ve kayar kapılar','Smithsonian ölçü referansı; iç ayrıntılar yaklaşık rekonstrüksiyon'],
      svg:'<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M110 55 Q165 35 200 60 L230 92 L100 92 L40 75 L20 45 L35 42 L50 68 L110 75Z" fill="#4e5940" stroke="#1e293b" stroke-width="3"/><path d="M154 55V24 M75 24H260 M110 105H235 M130 91V105 M210 92V105" stroke="#334155" stroke-width="4"/><path d="M170 55L200 64L215 81H170Z" fill="#8ab0bb"/></svg>'
    },
    {id:'u505',sim:'u505',group:4,status:'live',year:1941,yearLabel:'1941',eraLabel:'II. DÜNYA SAVAŞI',domain:'sea',era:'ww2',energy:['ice','electric'],role:['defense'],origin:'germany',
    name:'U-505 — Type IXC Denizaltı',sub:'DİZEL-ELEKTRİK TAHRİK • TAM TEKNE',desc:'Korunmuş U-505 müze örneğine dayalı tam tekne; basınç gövdesi, periskoplar, makine dairesi, bataryalar ve yaşam bölmeleri. Çift şaft ve pervane hareketini X-Ray ile izleyin.',
    tags:['20 İnceleme Grubu','İki Dizel ve İki Elektrik Motoru','Hareketli Periskoplar','X-Ray Bölmeler'],specs:[['BOY','~76,8 m'],['EN','~6,8 m'],['TAHRİK','Dizel / elektrik'],['MODEL','20 Bağımsız Grup']],tag:'U505-IXC',icon:'⚓',modal:['Tam dış tekne, kule ve güverte donanımı','Basınç teknesi, postalar, kumanda odası ve ranzalar','Çift şaft, pervaneler, periskop ve dümen gösterimi','Griffin MSI müze referansı; iç ayrıntılar yaklaşık'],svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><path d="M15 85Q140 60 300 85Q280 115 40 108Z" fill="#626c70" stroke="#1e293b" stroke-width="3"/><path d="M135 80V45H180V80M150 45V20H160" fill="#89949a" stroke="#1e293b" stroke-width="3"/></svg>'},
    {id:'enigma',sim:'enigma',group:4,status:'live',year:1930,yearLabel:'1930',eraLabel:'II. DÜNYA SAVAŞINA GİDEN DÖNEM',domain:'land',era:'ww2',energy:['electric'],role:['intelligence'],origin:'germany',name:'Enigma I — Bir Harfin Yolculuğu',sub:'ÖZEL ŞİFRELEME MASASI • ÜÇ ROTOR VE YANSITICI',desc:'Ahşap kasayı ve iç mekanizmayı inceleyin; özel şifreleme masasında kendi mesajınızı yazın. Rotorlar, halka ayarları ve fiş çiftleriyle harfin dokuz aşamalı gidiş-dönüş yolunu izleyin.',tags:['Etkileşimli Şifreleme Masası','Tarihsel Rotor Bağlantıları','Çift Adımlama','17 İnceleme Grubu'],specs:[['MODEL','Enigma I'],['ROTORLAR','I–V arasından üç farklı rotor'],['YANSITICI','B / C'],['DENEYİM','3D inceleme + şifreleme masası']],tag:'ENIGMA-I',icon:'🔐',modal:['Ahşap kasa, menteşeler, bakelit tuşlar, lambalar ve sayısal rotor halkaları','Özel şifreleme masası: mesaj, rotor/halka ayarları ve fiş çiftleri','Bilinen test vektörleri ve çift adımlama ile doğrulanmış hesaplama','Polonyalı matematikçiler ve Müttefik ekiplerin katkılarını içeren tarihsel anlatım'],svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><path d="M60 60V14H250V60M60 60H250V125H60Z" fill="#72452d" stroke="#342c24" stroke-width="3"/><path d="M72 72H238V115H72Z" fill="#202a26"/><g fill="#e9d8b7"><circle cx="100" cy="100" r="6"/><circle cx="130" cy="100" r="6"/><circle cx="160" cy="100" r="6"/><circle cx="190" cy="100" r="6"/><circle cx="220" cy="100" r="6"/></g><path d="M125 61V79M155 61V79M185 61V79" stroke="#c39b50" stroke-width="9"/></svg>'}

    ,{id:'lcvp',sim:'lcvp',group:4,status:'live',year:1942,yearLabel:'1942',eraLabel:'II. DÜNYA SAVAŞI',domain:'sea',era:'ww2',energy:['ice'],role:['transport'],origin:'usa',name:'Higgins LCVP — Çıkarma Teknesi',sub:'AHŞAP TEKNE • ÇELİK RAMPA • KIÇ TAHRİKİ',desc:'Baş rampasını açın, çift halatın hareketini ve ahşap gövde postalarını inceleyin. Kıç motoru, şaft, pervane, dümen mahalli ve yük alanıyla tam tekne modeli.',tags:['18 İnceleme Grubu','Hareketli Baş Rampası','Ahşap İç Yapı','Kıç Dizel Tahriki'],specs:[['BOY','~11 m'],['KAPASİTE','~36 personel'],['ETKİLEŞİM','Rampa, pervane ve dümen'],['MODEL','18 Bağımsız Grup']],tag:'HIGGINS-LCVP',icon:'⚓',modal:['Ahşap tekne, iç postalar, döşeme ve koruyucu yan kaplama','Menteşeli baş rampası, çift halat ve vinç tamburu','Dizel motor, şaft, pervane, dümen ve kıç donanımı','ABD müze referansları; ölçüler ve yerleşim yaklaşık'],svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><path d="M30 65H270L290 108H55Z" fill="#67747a" stroke="#263442" stroke-width="3"/><path d="M60 70H235V95H70Z" fill="#a88a61"/><path d="M270 65L310 95L290 108Z" fill="#859398" stroke="#263442" stroke-width="3"/><path d="M40 65V45H80V65" fill="#52616b"/></svg>'}
    ,{id:'chainhome',sim:'chainhome',group:4,status:'live',year:1938,yearLabel:'1938',eraLabel:'II. DÜNYA SAVAŞINA GİDEN DÖNEM',domain:'land',era:'ww2',energy:['electric'],role:['defense','intelligence'],origin:'uk',name:'Chain Home — Erken Uyarı İstasyonu',sub:'SABİT ANTENLER • OPERATÖRLER • RAPORLAMA AĞI',desc:'Dört çelik verici ve dört ahşap alıcı kulesiyle istasyon dioraması. Çatıları kaldırın; cihaz kabinleri, A-tipi ekran, telefon ve harita masasını inceleyin.',tags:['19 İnceleme Grubu','Çelik ve Ahşap Kuleler','Kaldırılabilir Çatılar','Operatör Odası'],specs:[['VERİCİ KULE TİPİ','~107 m'],['ALICI KULE TİPİ','~73 m'],['ANTENLER','Sabit perde ve çapraz dipoller'],['MODEL','Kuleler 1:10; saha sıkıştırılmış']],tag:'CHAIN-HOME',icon:'📡',modal:['Beton temeller, kafes kuleler, bakım merdivenleri ve sabit antenler','Verici kabinleri, bobinler, alıcı masası ve gonyometre','A-tipi ekran, harita masası ve telefonla insan unsurunun anlatımı','RAF Radar Museum ve Historic England kaynakları; temsili darbe gösterimi'],svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><g stroke="#5a666d" stroke-width="3" fill="none"><path d="M40 125L55 12L70 125M130 125L145 12L160 125M46 75H64M49 48H61M136 75H154M139 48H151M55 28H145M55 45H145M55 62H145"/></g><path d="M215 125L225 48L235 125M260 125L270 48L280 125M210 60H240M255 60H285" stroke="#8a6e46" stroke-width="3" fill="none"/><path d="M82 125V99H122V125M174 125V99H204V125" fill="#737b67"/></svg>'}

    ,{
      id: 'scythed', sim: 'scythed', group: 5, status: 'live',
      year: 1485, yearLabel: '~1485', eraLabel: 'RÖNESANS — TASARIM',
      domain: 'land', era: 'gunpowder', energy: ['muscle'], role: ['melee'], origin: 'italy',
      name: 'Leonardo’nun Oraklı Savaş Arabası', sub: 'ÇİZİMDEN REKONSTRÜKSİYON • DÖRT KOLLU ORAK DÜZENİ',
      desc: 'British Museum’daki yaklaşık 1485 tarihli çizimden yorumlanan atlı araba. Oyma atlar, deri koşum, ahşap ispitli tekerlekler, iki dik açılı dişli aktarımı ve kavisli oraklar. Yapıldığı veya savaşta kullanıldığı doğrulanmış bir araç değildir.',
      tags: ['18 İnceleme Grubu', 'Oyma Atlar ve Koşum', 'Bağlantılı Dişli Aktarımı', 'Tarihsel Tasarım'],
      specs: [['KAYNAK', 'British Museum • 1860,0616.99'], ['STATÜ', 'Çizimden müze rekonstrüksiyonu'], ['ETKİLEŞİM', 'Devir, elle faz ve sergi kapağı'], ['ÖLÇÜLER', 'Görsel yorum; tarihsel ölçüm değil']],
      tag: 'LEONARDO-SCYTHED-1485', icon: '⚙️',
      modal: ['İki oyma at, deri koşum ve uzun ahşap çeki çerçevesi', 'Demir çemberli ispitli tekerlekler, taç/fener dişliler ve sürekli mil', 'Dört kavisli orak; yavaş gösterim, elle faz, X-Ray ve aktarım vurgusu', 'Dişli oranları, boyutlar ve açılır panel sergi yorumudur; savaşta kullanım iddiası yok'],
      svg: '<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#74543b" stroke-width="5"><path d="M40 99H264M54 95V74H100V95"/><circle cx="67" cy="99" r="25"/><path d="M67 74V124M42 99H92M120 94V66L154 59L168 32L182 35L176 57L160 72V94M135 71V95"/></g><path d="M240 96L284 80Q307 76 300 54Q292 72 276 72L240 88L207 78Q190 70 187 50Q176 75 201 86Z" fill="#8b928d" stroke="#384444" stroke-width="2"/><path d="M252 97V61" stroke="#74543b" stroke-width="5"/></svg>'
    }

    ,{
      id: 'hwacha', sim: 'hwacha', group: 5, status: 'live', year: 1451, yearLabel: '1451', eraLabel: 'JOSEON DÖNEMİ',
      domain: 'land', era: 'gunpowder', energy: ['gunpowder'], role: ['artillery'], origin: 'korea',
      name: 'Kore Hwacha’sı — Munjong', sub: 'YÜZ SINGIJEON • AHŞAP ARABA VE DELİKLİ KASET',
      desc: '1451 tarihli yüz oklu varyantın dış rekonstrüksiyonu. İspitli ahşap tekerlekler, uzun saplar, gerçek açıklıklı kaset levhaları, demir kuşaklar ve mafsallı taşıyıcılar. Levhaları ayırın, okları gizleyin ve sıralı incelemeyi başlatın.',
      tags: ['18 İnceleme Grubu', '100 Ok / 100 Açıklık', 'Ayrılabilir Levhalar', 'Joseon • 1451'],
      specs: [['VARYANT', 'Munjong • Singijeon taşıyıcısı'], ['KAPASİTE', '100 orta boy Singijeon'], ['MODEL', 'Yaklaşık dış rekonstrüksiyon'], ['ETKİLEŞİM', 'Kaset açısı, levha ayırma, sıralı inceleme']],
      tag: 'HWACHA-MUNJONG-1451', icon: '🏹',
      modal: ['Dilimli ahşap tekerlekler, demir çember, dingil ve uzun taşıma kolları', 'İki delikli levha, yüz uzun ok sapı ve dış kılıflar', 'Dört ahşap görünümü, altı kamera, X-Ray ve altı adımlı tur', 'Kore Ulusal Tarih Enstitüsü tarih referansı; ölçüler ve gösterim temposu temsili'],
      svg: '<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><g stroke="#654b32" stroke-width="7" fill="none"><path d="M35 120L235 84M60 125L260 90M215 90L224 43"/><circle cx="205" cy="103" r="29"/><path d="M205 74V132M176 103H234M184 82L226 124M184 124L226 82" stroke-width="3"/></g><path d="M165 51L210 26L235 64L190 90Z" fill="#98734e" stroke="#493b2d" stroke-width="3"/><g stroke="#c3a266" stroke-width="3"><path d="M80 106L229 20M87 111L236 25M94 116L243 30M101 121L250 35M108 126L257 40"/></g></svg>'
    }

    ,{id:'atlatl',sim:'atlatl',group:5,status:'live',year:1400,yearLabel:'1400–1521',eraLabel:'MEXICA ÖRNEĞİ • DAHA ESKİ BİR ARAÇ TÜRÜ',domain:'land',era:'medieval',energy:['muscle'],role:['projectile'],origin:'mexico',
      name:'Atlatl — Kolu Uzatan Fırlatma Aracı',sub:'KABUK HALKALAR • AHŞAP KOL • UZUN DART',
      desc:'Mexica törensel örneğinden esinlenen büyütülmüş inceleme modeli. Cilalı ahşap, içi boş kabuk halkalar, pamuk sargıları ve altın renkli kabartmalar. Dartın kancaya temasını ve ayrılmasını yavaş gösterimde izleyin; taş ucu ve tüyleri yakın planda inceleyin.',
      tags:['16 İnceleme Grubu','Kabuk Parmak Halkaları','Kanca–Dart Teması','Müze Yorumu'],
      specs:[['GÖRSEL KAYNAK','British Museum • Am.5226'],['TARİH','Örnek: 1400–1521; icat tarihi değil'],['GÖSTERİM','Yavaş temas ve ayrılma'],['STATÜ','Törensel örnekten esinlenme']],tag:'ATLATL-MEXICA',icon:'🏹',
      modal:['Oyma ahşap görünümü, çift kabuk halka ve çapraz pamuk sargıları','Uzun dart, gerçek arka yuva, kuyruk tüyleri ve yüzeyli taş uç','Dört yüzey seçeneği, altı kamera ve altı adımlı tur','Çağdaş sergi kaidesi; dart, kabartma ve hareketler yorumdur'],
      svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><path d="M58 96L261 60" stroke="#633b27" stroke-width="12" stroke-linecap="round"/><path d="M166 77L260 60" stroke="#b69a5e" stroke-width="7"/><g fill="none" stroke="#bcad8b" stroke-width="7"><ellipse cx="109" cy="72" rx="13" ry="16"/><ellipse cx="114" cy="106" rx="13" ry="16"/></g><path d="M35 39L270 57" stroke="#aa854e" stroke-width="4"/><path d="M16 37L42 29L38 48Z" fill="#4f5d62"/><path d="M239 54L252 40L265 57" fill="#ddd3b4"/></svg>'
    }

    ,{id:'lantern',sim:'lantern',group:5,status:'live',year:1595,yearLabel:'1596’dan önce',eraLabel:'GEÇ RÖNESANS',domain:'land',era:'gunpowder',energy:['muscle'],role:['defense','melee'],origin:'europe',
      name:'Fenerli Kalkan — KHM A 384',sub:'DEMİR ELDİVEN • KIRMIZI KADİFE • GİZLİ FENER',desc:'Viyana’daki A 384 örneğinden ayrıntılı dış rekonstrüksiyon. Delikli çelik yüz, pirinç perçinler, mafsallı eldiven, zincir örgü ve kırmızı kadife içlik. Işık kapağını açın, feneri yakın ve sürgülü bıçağı inceleyin.',
      tags:['16 İnceleme Grubu','Açılır Işık Kapağı','Kadife ve Zincir Örgü','Sürgülü Bıçak'],specs:[['KAYNAK','KHM • A 384'],['KALKAN ÇAPI','40 cm (kaynak)'],['TOPLAM UZUNLUK','82 / 101 cm (kaynak)'],['BAĞLAM','Pratikliği sınırlı birleşik nesne']],tag:'LANTERN-SHIELD-A384',icon:'🛡️',modal:['Delikli kalkan, ışık ağzı, pirinç perçinler ve merkez çıkıntısı','Demir eldiven, parmak levhaları, zincir örgü ve iki uzun çıkıntı','Arka kadife, kayışlar, metal fener ve sıcak ışık gösterimi','KHM ön/arka fotoğrafları; küçük bağlantılar ve hareketler yaklaşık'],
      svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><circle cx="205" cy="70" r="58" fill="#56616a" stroke="#b7a47b" stroke-width="3"/><circle cx="205" cy="70" r="45" fill="none" stroke="#d5bd88" stroke-width="2"/><path d="M20 103H250" stroke="#89959a" stroke-width="7"/><path d="M140 45H105V82H150" fill="#687780" stroke="#293b45" stroke-width="3"/><circle cx="205" cy="38" r="10" fill="#ffc06a"/><path d="M205 70L180 56L185 77Z" fill="#a7b0b5"/></svg>'}

    ,{id:'polybolos',sim:'polybolos',group:5,status:'live',year:-250,yearLabel:'MÖ 3. yüzyıl',eraLabel:'HELENİSTİK DÖNEM',domain:'land',era:'ancient',energy:['muscle'],role:['artillery'],origin:'greek',name:'Polybolos — Tekrarlayan Ok Atıcı',sub:'ÇİFT ZİNCİR • YİVLİ TAMBUR • BURULMA',desc:'Kotsanas Müzesi rekonstrüksiyonundan yorumlanan ahşap düzen. İki burulma demeti, çift zincir, beşgen çarklar, ileri–geri krank ve üst ok haznesi. Yanları açarak besleme tamburunu ve sürgüyü inceleyin.',tags:['18 İnceleme Grubu','Çift Zincir Aktarması','Tek Ok Besleme','Sekiz Oklu Sergi Çevrimi'],specs:[['KAYNAK','Philon anlatımı / Kotsanas yorumu'],['TAHRİK','Elle, ileri–geri krank'],['MODEL','Yaklaşık müze rekonstrüksiyonu'],['GÖSTERİM','Evre, hazne açma ve yavaş çevrim']],tag:'POLYBOLOS',icon:'🏹',modal:['Üçgen ahşap sehpa, lif demetleri ve simetrik atıcı kollar','Bağlantılı çift zincir, ortak miller, sürgü ve mandal','Üst hazne, yivli döner tambur ve tek ok aktarımı','Sekiz ok sergi tercihidir; zamanlama ve zincir yolu sadeleştirilmiştir'],svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><path d="M90 120L150 63L205 120ZM150 63V122M65 57H270M75 32V79M98 32V79M64 32H109M64 79H109" stroke="#8e673e" stroke-width="9" fill="none"/><path d="M118 24H245V49H118Z" fill="#a9804f" stroke="#3e4243" stroke-width="2"/><path d="M105 66H265M105 79H265" stroke="#4e5961" stroke-width="3" stroke-dasharray="5 3"/><path d="M74 66L45 80L120 68" stroke="#c9b995" stroke-width="3" fill="none"/></svg>'}

    ,{id:'giantbow',sim:'giantbow',group:5,status:'live',year:1488,yearLabel:'~1485–1490',eraLabel:'RÖNESANS • TASARIM',domain:'land',era:'gunpowder',energy:['muscle'],role:['siege'],origin:'italy',name:'Leonardo’nun Dev Arbaleti',sub:'KATMANLI DEV YAY • ALTI TEKERLEK • KURMA TAMBURU',desc:'Milano müze modelinden yorumlanan dev tasarım. Dokuz ayrı ahşap lamina, metal bağlar, altı ispitli tekerlek, uzun kundak ve bağlantılı kurma halatları. Ölçek figürünü görün, panelleri kaldırın ve kurmayı yavaşlatılmış gösterimde izleyin.',tags:['16 İnceleme Grubu','Dokuz Yay Laminası','Altı Ahşap Tekerlek','Çizimden Rekonstrüksiyon'],specs:[['YAY AÇIKLIĞI','~24 m tasarım ölçeği'],['TAŞIYICI','Üç dingil / altı tekerlek'],['GÖRSEL KAYNAK','Milano müze modeli / Lombardia kaydı'],['STATÜ','Doğrulanmış savaş aracı değil']],tag:'LEONARDO-GIANT-CROSSBOW',icon:'🏹',modal:['Katmanlı yay, bantlar ve bağlı kiriş uçları','Uzun ahşap kundak, alt çaprazlar ve kaldırılabilir sergi panelleri','Çift kurma halatı, tambur ve el çarkları; manuel evre önceliği','Kaynaklar mühimmat türünü farklı anlatır; yatak boş, hareketler temsili'],svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><path d="M154 20H172V128H154Z" fill="#9b754b" stroke="#493b2b" stroke-width="3"/><path d="M25 58Q160-5 295 58M29 53Q160 3 291 53M40 47Q160 6 280 47" fill="none" stroke="#987040" stroke-width="7"/><path d="M25 58L163 96L295 58" fill="none" stroke="#ad9b76" stroke-width="2"/><g fill="#675541"><circle cx="145" cy="45" r="9"/><circle cx="182" cy="45" r="9"/><circle cx="145" cy="80" r="9"/><circle cx="182" cy="80" r="9"/><circle cx="145" cy="113" r="9"/><circle cx="182" cy="113" r="9"/></g></svg>'}

  
    ,{id:'chukonu',sim:'chukonu',group:5,status:'live',year:1850,yearLabel:'19. yüzyıl örneği',eraLabel:'ÇİN • GEÇ İMPARATORLUK',domain:'land',era:'industrial',energy:['muscle'],role:['projectile'],origin:'china',name:'Chu-ko-nu — Çin Tekrarlayan Arbaleti',sub:'ÜST HAZNE • ÇİFT KOL • KISA TÜYSÜZ OKLAR',desc:'Crépy-en-Valois Okçuluk Müzesi örneğinden esinlenen ayrıntılı ahşap model. Kavisli yay, lif bağları, uzun kaldıraç, hareketli hazne ve on iki kısa ok. Hazneyi açın, bağlantıları inceleyin ve temsili çevrimi yavaş izleyin.',tags:['16 İnceleme Grubu','Açılabilir Hazne','Bağlantılı Kaldıraç','On İki Oklu Gösterim'],specs:[['KAYNAK','Musée de l’Archerie • 2007.10.1'],['NESNE TARİHİ','19. yüzyıl; icat tarihi değil'],['MALZEME','Ahşap, metal, lif'],['MODEL','Büyütülmüş müze yorumu']],tag:'CHU-KO-NU',icon:'🏹',modal:['Dar kundak, kavisli yay ve lif sargıları','Çift kollu kaldıraç, pimler, hazne ve kılavuzlar','Kısa tüysüz oklar, açılan kapak ve yan duvarlar','Dört yüzey, altı kamera ve altı adımlı tur'],svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><path d="M35 103L275 64M65 95L208 36L280 47" stroke="#725238" stroke-width="10" fill="none"/><path d="M80 40H208V81H80Z" fill="#9a7048" stroke="#42362c" stroke-width="3"/><path d="M20 69Q95 137 235 108" fill="none" stroke="#b79762" stroke-width="10"/><path d="M20 69L168 88L235 108" fill="none" stroke="#8e784f" stroke-width="2"/></svg>'}
];

  window.MUSEUM_CATALOG = { FACETS, VEHICLES };
})();

