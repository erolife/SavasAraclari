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
      { key: 'ww1', label: 'I. Dünya Savaşı' }, { key: 'interwar', label: 'Savaşlar Arası' }, { key: 'ww2', label: 'II. Dünya Savaşı' },
      { key: 'coldwar', label: 'Soğuk Savaş' }, { key: 'modern', label: 'Modern' }
    ] },
    { key: 'energy', url: 'enerji', label: 'Enerji / Temel Mekanik', options: [
      { key: 'muscle', label: '💪 Kas Gücü & Burulma' }, { key: 'gravity', label: '⚖️ Yerçekimi' },
      { key: 'gunpowder', label: '💥 Barut' }, { key: 'ice', label: '⚙️ İçten Yanmalı Motor' },
      { key: 'steam', label: '♨️ Buhar Makinesi' }, { key: 'airflow', label: '🌬️ Hava Akımı / Motorsuz' },
      { key: 'jet', label: '🔥 Jet & Roket' }, { key: 'electric', label: '⚡ Elektrik & Elektromekanik' }
    ] },
    { key: 'role', url: 'gorev', label: 'Görev Tipi', options: [
      { key: 'siege', label: 'Kuşatma' }, { key: 'artillery', label: 'Topçu' },
      { key: 'armor', label: 'Zırhlı Araç' }, { key: 'aircraft', label: 'Savaş Uçağı' },
      { key: 'smallarms', label: 'Hafif & Makineli Silah' }, { key: 'defense', label: 'Savunma Sistemi' }, { key: 'intelligence', label: 'Haberleşme & İstihbarat' }, { key: 'transport', label: 'Nakliye & Çıkarma' }, { key: 'melee', label: 'Yakın Muharebe & Hücum' }, { key: 'projectile', label: 'Elle Atılan & Fırlatma Araçları' }
    ] },
    { key: 'origin', url: 'koken', label: 'Köken', options: [
      { key: 'china', label: 'Çin' },
      { key: 'rome', label: 'Roma' }, { key: 'byzantine', label: 'Bizans (Doğu Roma)' }, { key: 'medieval_eu', label: 'Orta Çağ Avrupa & Akdeniz' },
      { key: 'ottoman', label: 'Osmanlı' }, { key: 'turkmen', label: 'Türkmen / Akkoyunlu geleneği' }, { key: 'seljuk', label: 'Selçuklular' }, { key: 'gokturk', label: 'Göktürkler' }, { key: 'turkey', label: 'Türkiye' }, { key: 'italy', label: 'İtalya (Rönesans)' },
      { key: 'uk', label: 'İngiltere' }, { key: 'germany', label: 'Almanya' }, { key: 'sweden', label: 'İsveç' },
      { key: 'france', label: 'Fransa' }, { key: 'usa', label: 'ABD' }, { key: 'ussr', label: 'SSCB' }, { key: 'korea', label: 'Kore (Joseon)' }, { key: 'mexico', label: 'Meksika (Mezoamerika)' }, { key: 'europe', label: 'Avrupa (yer atfı belirsiz)' }, { key: 'greek', label: 'Helenistik Dünya' }
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

    // ===================================================================== 3. GRUP (AKTİF & PLANLI)
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
    ,{id:'helepolis',sim:'helepolis',group:5,status:'live',year:-304,yearLabel:'MÖ 304',eraLabel:'HELENİSTİK DÖNEM • RODOS',domain:'land',era:'ancient',energy:['muscle'],role:['siege'],origin:'greek',name:'Helepolis — Dokuz Katlı Kuşatma Kulesi',sub:'DOKUZ KAT • SEKİZ TEKERLEK • AÇILIR KÖPRÜ',desc:'Kotsanas Müzesi rekonstrüksiyonundan yorumlanan daralan ahşap kule. İç katlar, çift merdiven, çapraz bağlar, levhalı cephe ve menteşeli kapaklar. Dış yüzeyi ayırın, üst katları gizleyin ve köprünün açılışını izleyin.',tags:['18 İnceleme Grubu','Dokuz Kat','Gerçek Merdiven Açıklıkları','Hareketli Köprü'],specs:[['BAĞLAM','Rodos kuşatması • MÖ 304'],['KAYNAK YÜKSEKLİĞİ','Yaklaşık 40 m'],['YÜRÜYÜŞ','Sekiz masif tekerlek'],['GÖRSEL DAYANAK','Kotsanas modern rekonstrüksiyonu']],tag:'HELEPOLIS',icon:'🏰',modal:['Daralan ahşap taşıyıcılar, dokuz döşeme ve çaprazlar','İki merdiven hattı, korkuluklar ve sabit atıcı siluetleri','Ayrılabilir cepheler, menteşeli kapaklar ve halatlı köprü','Dört kaplama, altı kamera ve altı adımlı tur'],svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><path d="M126 8H194L228 127H92Z" fill="#6d5b41" stroke="#a38152" stroke-width="4"/><path d="M122 26H198M118 40H202M114 54H206M110 68H210M106 82H214M102 96H218M98 110H222" stroke="#b08b55" stroke-width="3"/><path d="M142 23V116M178 23V116" stroke="#2c3637" stroke-width="7"/><path d="M148 83L178 83L192 104H134Z" fill="#ba925b"/><circle cx="109" cy="131" r="7" fill="#514a3d"/><circle cx="211" cy="131" r="7" fill="#514a3d"/></svg>'}
    ,{id:'organ33',sim:'organ33',group:5,status:'live',year:1488,yearLabel:'15. yüzyıl sonu',eraLabel:'RÖNESANS • TASARIM',domain:'land',era:'gunpowder',energy:['muscle','gunpowder'],role:['artillery'],origin:'italy',name:'Leonardo’nun 33 Namlulu Düzeni',sub:'ÜÇ DÖNER SIRA • BRONZ NAMLU • AHŞAP ARABA',desc:'Milano müze modelinden yorumlanan üç sıralı düzen. Otuz üç ayrı açık namlu ağzı, büyük ispitli tekerlekler, döner çerçeve ve arka ayar vidası. Sıraları yavaşça değiştirin, seçili sırayı kaldırın ve ahşap yatakları ayırın.',tags:['16 İnceleme Grubu','3 × 11 Namlu','120° Sıra Değişimi','Çizimden Rekonstrüksiyon'],specs:[['DÜZEN','Üç sıra × on bir'],['KAYNAK','Museo Scienza • Argan Giovenale modeli'],['AYRINTI','Bronz ağızlar, ahşap ispitler, vida'],['STATÜ','Çizimden modern müze yorumu']],tag:'LEONARDO-ORGAN-33',icon:'⚙️',modal:['Üç yüzlü ortak çerçeve ve ayrı namlu sıraları','Açık ağızlar, kalın dudaklar ve arka bilezikler','Ahşap tekerlekler, metal kuşaklar ve arka kuyruk','Dört yüzey, altı kamera/tur; yavaş sıra değiştirme'],svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#8e693f" stroke-width="8"><ellipse cx="66" cy="74" rx="28" ry="58"/><ellipse cx="254" cy="74" rx="28" ry="58"/><path d="M66 16V132M38 74H94M254 16V132M226 74H282"/></g><path d="M88 52H230V74H88Z" fill="#8e7751"/><path d="M98 53V72M110 53V72M122 53V72M134 53V72M146 53V72M158 53V72M170 53V72M182 53V72M194 53V72M206 53V72M218 53V72" stroke="#413f35" stroke-width="7"/><path d="M91 83H228L210 109H111Z" fill="#a08d66"/></svg>'}
    ,{id:'swordpistol',sim:'swordpistol',group:5,status:'live',year:1735,yearLabel:'18. yüzyılın ilk yarısı',eraLabel:'SAKSONYA • BİRLEŞİK AV SİLAHI',domain:'land',era:'gunpowder',energy:['muscle','gunpowder'],role:['melee','smallarms'],origin:'germany',name:'Kılıç–Tabanca — Saksonya Av Silahı',sub:'UZUN ÇELİK YÜZEY • OYMALI METAL • KIVRIMLI AHŞAP',desc:'Met Müzesi 2018.371 örneğinden yorumlanan birleşik av silahı. Yivli kılıç, sırtındaki kısa namlu, koyu kıvrımlı kabza, uzun el koruması ve oymalı dış levha. İki yüzü yavaş dönüşle karşılaştırın, bezemeleri yakın planda inceleyin.',tags:['16 İnceleme Grubu','Yüzeyli Çelik Kılıç','Açık El Koruması','Oymalı Dış Levha'],specs:[['KAYNAK','The Met • 2018.371'],['ATIF','Johannes Andreas Niefind'],['UZUNLUK','65,5 cm (müze nesnesi)'],['BAĞLAM','Saksonya av silahı']],tag:'SWORD-PISTOL-MET',icon:'⚔️',modal:['Kalınlıklı ve daralan kılıç, yivler ve kısa dış namlu','Kıvrımlı koyu ahşap kabza ve açık el koruması','Kıvrımlı metal bezeme, yarıklı vidalar ve dış kilit levhası','Müze tarihlemesi 1730/1740 farklılığı içerir; model yorumdur'],svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><path d="M95 61L284 62L310 70L280 78H93Z" fill="#a6afb3" stroke="#5a6268" stroke-width="2"/><path d="M95 58H171" stroke="#69767d" stroke-width="9"/><path d="M22 87Q17 60 92 59L95 77Q49 77 34 94Z" fill="#5e3b26" stroke="#333c40" stroke-width="3"/><path d="M27 91V111H94Q119 105 102 80" fill="none" stroke="#626f77" stroke-width="4"/><path d="M83 62Q68 34 91 33L103 43" stroke="#67747c" stroke-width="5" fill="none"/></svg>'}
];

  // Araştırma defterinden aktarılan doğrulanmış bağlantılar; model bilgileriyle aynı kaynakta.
  VEHICLES.push({"id":"archimedes","sim":"archimedes","group":6,"status":"live","year":-213,"yearLabel":"MÖ 3. yüzyıl","eraLabel":"SİRAKÜZA • MODERN REKONSTRÜKSİYON","domain":"land","era":"ancient","energy":["muscle","gravity"],"role":["defense"],"origin":"greek","name":"Arşimet’in Demir Eli — Siraküza Vinci","sub":"DÖNER DİKME • KARŞI AĞIRLIK • ZİNCİRLİ KANCA","desc":"Taş sur, ahşap çalışma yolu ve küçük tekneyle ayrıntılı diorama. Kolu kaldırın, dikmeyi döndürün ve düşey zinciri inceleyin. Kotsanas Müzesi yorumundan; özgün ölçüler bilinmiyor.","tags":["18 İnceleme Grubu","Hareketli Karşı Ağırlık","Taş Sur Dioraması","Yavaş Kaldırma"],"specs":[["DÖNEM","MÖ 3. yüzyıl"],["KAYNAK","Kotsanas Müzesi"],["STATÜ","Modern rekonstrüksiyon"],["ÖLÇEK","Temsili sergi oranları"]],"tag":"ARCHIMEDES-CLAW","icon":"⚓","modal":["Taş sur ve ahşap çalışma döşemesi","Döner dikme, çatal, mil ve kol","Kayan karşı ağırlık, irgat ve bağlı halat","Düşey zincir, demir kanca ve ahşap tekne"],"svg":"<svg viewBox=\"0 0 320 140\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M30 130V58H85V130\" fill=\"#b7a68a\"/><path d=\"M66 115V22M37 46L252 20\" stroke=\"#775535\" stroke-width=\"11\"/><path d=\"M252 20V90M238 87Q252 110 266 87\" fill=\"none\" stroke=\"#485156\" stroke-width=\"4\"/><path d=\"M200 108H301L281 130H221Z\" fill=\"#97734f\"/><path d=\"M35 40H64V72H35Z\" fill=\"#8a8578\"/></svg>"});

  VEHICLES.push({"id":"turtle","sim":"turtle","group":6,"status":"live","year":1776,"yearLabel":"1776","eraLabel":"AMERİKAN BAĞIMSIZLIK SAVAŞI","domain":"sea","era":"gunpowder","energy":["muscle"],"role":["intelligence"],"origin":"usa","name":"Turtle — Bushnell’in Tek Kişilik Denizaltısı","sub":"AHŞAP KABUK • EL KRANKI • BALAST POMPASI","desc":"Yumurta biçimli ahşap kabuğu ayırın; tek kişilik kabini, el krankını, yatay ve düşey pervaneleri inceleyin. Menteşeli üst kapak ve kavramsal balast gösterimi. İç yerleşim müze örneklerinden yaklaşık yorumdur.","tags":["20 İnceleme Grubu","Ayrılabilir Ahşap Kabuk","Bağlı Krank ve Pervane","Balast Gösterimi"],"specs":[["DÖNEM","1776"],["MÜRETTEBAT","1 kişi"],["TAHRİK","İnsan gücü"],["REFERANS","SMG 1976-480 / NHHC"]],"tag":"TURTLE-1776","icon":"⚓","modal":["Kalınlıklı ahşap kaplama, postalar ve demir kuşaklar","Camlı başlık, açılır kapak ve hava boruları","Yataklara bağlı el krankı ve iki pervane","Kavram gösterimi olarak balast suyu ve piston"],"svg":"<svg viewBox=\"0 0 320 140\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"160\" cy=\"77\" rx=\"43\" ry=\"57\" fill=\"#8d6544\" stroke=\"#493c2c\" stroke-width=\"3\"/><path d=\"M128 39H192M118 69H202M121 99H199M142 24V127M178 24V127\" stroke=\"#3d4140\" stroke-width=\"3\"/><path d=\"M145 25V9H175V25\" fill=\"#ae8c4e\"/><path d=\"M202 74H232M232 48V100\" stroke=\"#ad8d57\" stroke-width=\"7\"/><path d=\"M122 92H105V114\" stroke=\"#545f63\" stroke-width=\"4\"/></svg>"});

  VEHICLES.push({"id":"rrh","sim":"rrh","group":6,"status":"live","year":1942,"yearLabel":"1942 • m/42","eraLabel":"II. DÜNYA SAVAŞI • PASİF DİNLEME","domain":"land","era":"ww2","energy":["muscle"],"role":["defense","intelligence"],"origin":"germany","name":"RRH m/42 — Halka Hunili Akustik Dinleyici","sub":"DÖRT KAVİSLİ HUNİ • İKİ DİNLEYİCİ • SES GECİKMESİ","desc":"Radar olmayan, halka biçimli akustik alıcı. Dört açık huni, bağlı borular, iki kulaklık, üç operatör oturağı ve el çarkları. Yön/yükseliş ayarı yapın; sesin uzaktan gelişindeki gecikmeyi temsili dalgayla inceleyin.","tags":["20 İnceleme Grubu","İçi Açık Halka Hunileri","Bağlı Akustik Hortumlar","Gelen Ses Gösterimi"],"specs":[["MODEL","RRH ailesi / Finlandiya m/42"],["İLKE","Pasif akustik dinleme"],["HESAP","343 m/s eğitim varsayımı"],["ÖLÇEK","Fotoğraftan yaklaşık oranlar"]],"tag":"RRH-M42","icon":"👂","modal":["Dairesel kaide, üç ayak ve vidalı pabuçlar","Döner sütun, taşıyıcı çatal ve yükseliş milleri","Dört kavisli huni, flanş, perçin ve esnek hortum","Operatör mahalleri, ses gecikmesi ve kaynaklar"],"svg":"<svg viewBox=\"0 0 320 140\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"160\" cy=\"55\" r=\"47\" fill=\"none\" stroke=\"#6d7c60\" stroke-width=\"20\"/><circle cx=\"160\" cy=\"55\" r=\"49\" fill=\"none\" stroke=\"#35463b\" stroke-width=\"3\"/><path d=\"M160 7V22M207 55H190M160 102V87M113 55H130\" stroke=\"#f0ebdf\" stroke-width=\"4\"/><path d=\"M103 55V97Q160 137 217 97V55M160 109V127M124 135H196\" fill=\"none\" stroke=\"#465749\" stroke-width=\"8\"/></svg>"});

  VEHICLES.push({"id":"nusret","sim":"nusret","group":7,"status":"live","year":1915,"yearLabel":"1915","eraLabel":"ÇANAKKALE • OSMANLI DONANMASI","domain":"sea","era":"ww1","energy":["steam"],"role":["defense"],"origin":"ottoman","name":"Nusret — Çanakkale’nin Mayın Gemisi","sub":"TAM GÖVDE • KÖPRÜÜSTÜ • RAYLAR • BUHAR TAHRİKİ","desc":"Yaklaşık tam gemi rekonstrüksiyonu: çelik gövde, baş güverte, camlı seyir evi, baca, direkler, filikalar ve kıç rayları. Tavanı açın; buhar makinelerini ve güverte üzerinde kalan sergi arabasını inceleyin. Almanya’da inşa, Osmanlı hizmeti.","tags":["Tam Gemi","Açılır Köprüüstü","Çift Pervane","Ray Arabası"],"specs":[["ANA ORANLAR","~40 × 7,4 m"],["DÖNEM","Çanakkale / 1915"],["İNŞA / HİZMET","Almanya / Osmanlı"],["İÇ YERLEŞİM","Yaklaşık müze yorumu"]],"tag":"NUSRET-1915","icon":"⚓","modal":["Çelik karina, postalar ve baş güverte","Camlı köprüüstü, tavan, dümen ve pusula","Raylar, sekiz sergi yükü ve hareketli araba","Kazanlar, buhar makineleri, çift şaft ve pervane"],"svg":"<svg viewBox=\"0 0 320 140\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M25 90H286L264 120H53Z\" fill=\"#6d797c\"/><path d=\"M52 112H270L260 125H65Z\" fill=\"#7d4c3d\"/><path d=\"M175 90V57H231V83H278V90M125 90V48H143V90\" fill=\"#65757c\"/><path d=\"M91 88V23M212 56V10M65 40H115M190 28H236\" stroke=\"#5c5142\" stroke-width=\"3\"/><path d=\"M183 64H224\" stroke=\"#bdd9df\" stroke-width=\"8\"/><g fill=\"#303b40\"><circle cx=\"55\" cy=\"85\" r=\"7\"/><circle cx=\"75\" cy=\"85\" r=\"7\"/><circle cx=\"95\" cy=\"85\" r=\"7\"/></g></svg>"});
  VEHICLES.push({"id":"ottomanbow","sim":"ottomanbow","group":7,"status":"live","year":1719,"yearLabel":"1719–1720","eraLabel":"OSMANLI • KOMPOZİT YAY","domain":"land","era":"gunpowder","energy":["muscle"],"role":["projectile"],"origin":"ottoman","name":"Osmanlı Kompozit Yayı","sub":"LAKE • ALTIN BEZEME • AHŞAP, BOYNUZ VE SİNİR","desc":"Met Müzesi’ndeki 1719–1720 tarihli eserden büyütülmüş yorum. Kıvrımlı kirişsiz yay, koyu lake ve altın renkli bezemeler; ayrılabilir katmanlar ve iki sergi oku. Kurulu görünüm temsili olarak ayrıca açılır.","tags":["Müze Referansı","Ayrılabilir Katmanlar","İki Sergi Oku"],"specs":[["ESER","Met 35.113.1a–oo"],["KAYNAK BOYU","64,8 cm"],["KAYNAK AĞIRLIĞI","365 g"],["TARİH","1719–1720"]],"tag":"OTTOMAN-BOW","icon":"🏹","modal":["Kıvrımlı gövde, kabza ve uç kaplamaları","Ahşap, boynuz, sinir ve lake katmanları","Altın renkli yapraklar, kenar noktaları ve sarımlar","İki ok, yaprak uçlar, tüyler ve açık gezler"],"svg":"<svg viewBox=\"0 0 320 140\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M100 15C190 0 190 140 100 125\" fill=\"none\" stroke=\"#643d32\" stroke-width=\"13\"/><path d=\"M100 15C190 0 190 140 100 125\" fill=\"none\" stroke=\"#c3a461\" stroke-width=\"2\" stroke-dasharray=\"2 5\"/><path d=\"M230 118V28M255 118V28\" stroke=\"#ab8651\" stroke-width=\"3\"/><path d=\"M225 29L230 12L235 29M250 29L255 12L260 29\" fill=\"#baa164\"/></svg>"});
  VEHICLES.push({"id":"vecihi","sim":"vecihi","group":7,"status":"live","year":1925,"yearLabel":"1925","eraLabel":"TÜRKİYE • HAVACILIK ÖNCÜSÜ","domain":"air","era":"interwar","energy":["ice"],"role":["aircraft"],"origin":"turkey","name":"Vecihi K-VI — İlk Türk Uçağı","sub":"ÇİFT KANAT • BENZ SIRALI ALTI • AHŞAP VE BEZ","desc":"1925’te İzmir–Seydiköy’de uçan öncü prototip. Kumaş kaplı çift kanat, ahşap iç iskelet, açık kokpitler, tel gergiler ve su soğutmalı Benz motoru. Kaportayı açın, pervaneyi yavaşça döndürün ve kuyruk dümenlerini inceleyin.","tags":["Arşiv Referansı","Açılır Kaporta","Açık Kokpitler","Hareketli Dümenler"],"specs":[["İLK UÇUŞ","28 Ocak 1925"],["ANA AÇIKLIK","11,7 m"],["MOTOR","Benz / 6 silindir / 200 BG"],["MODEL","Renk ve iç yerleşim yaklaşık"]],"tag":"VECIHI-K-VI","icon":"🛩️","modal":["Kavisli kumaş kanatlar, kaburgalar ve gergi telleri","Gerçek boşluklu kokpitler ve ibreli gösterge paneli","Açılabilir metal kaporta, sıralı altı motor ve ahşap pervane","İrtifa / istikamet dümenleri, ay-yıldız ve kuyruk kızağı"],"svg":"<svg viewBox=\"0 0 320 140\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M31 55Q160 40 289 55L282 66H38ZM45 90H275L270 100H50Z\" fill=\"#c8ba98\" stroke=\"#83785f\"/><path d=\"M75 64L83 91M245 64L237 91M122 65L112 91M198 65L208 91\" stroke=\"#635945\" stroke-width=\"3\"/><path d=\"M146 47H174L178 108H142Z\" fill=\"#999d96\"/><path d=\"M160 27V87\" stroke=\"#71513b\" stroke-width=\"7\"/><circle cx=\"119\" cy=\"115\" r=\"13\" fill=\"#343535\"/><circle cx=\"201\" cy=\"115\" r=\"13\" fill=\"#343535\"/><path d=\"M145 90L119 115M175 90L201 115\" stroke=\"#666\" stroke-width=\"4\"/></svg>"});
  VEHICLES.push({"id":"gokturk","sim":"gokturk","group":8,"status":"live","year":650,"yearLabel":"6–8. yüzyıl","eraLabel":"GÖKTÜRKLER • BOZKIR SÜVARİSİ","domain":"land","era":"medieval","energy":["muscle"],"role":["armor"],"origin":"gokturk","name":"Göktürk Zırhlı Süvarisi ve At Donanımı","sub":"LEVHALI ZIRH • TOLGA • EYER VE ÜZENGİ","desc":"Tam at ve binici sahnesi: lamelli zırh panellerini ayırın, tolgayı kaldırın ve biniciyi gizleyerek eyerin yapısını inceleyin. Balık-Sook zırh rekonstrüksiyonundan yararlanan birleşik müze yorumu; tek bir mezarın eksiksiz takımı değildir.","tags":["Tam Atlı Sahne","Ayrılabilir Zırh","Eyer İncelemesi"],"specs":[["DÖNEM","6–8. yüzyıl"],["ZIRH","Dikey levhalı"],["REFERANS","Balık-Sook rekonstrüksiyonu"],["ÖLÇÜ / RENK","Yaklaşık sergi yorumu"]],"tag":"GOKTURK-CAVALRY","icon":"🐎","modal":["At anatomisi, yele, kuyruk ve dört toynak","Lamelli zırh, deri bağlar ve kaldırılabilir tolga","Ahşap eyer, keçe altlık, kolan ve açık üzengiler","Binici, dizginler, kınlı yan silah ve sadak"],"svg":"<svg viewBox=\"0 0 320 140\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M78 62Q133 42 198 66L219 28L242 24L263 46L249 62L224 51L207 91H93Z\" fill=\"#796050\"/><path d=\"M95 85L88 125M115 87L119 125M184 88L177 125M202 86L212 125\" stroke=\"#594739\" stroke-width=\"9\"/><path d=\"M122 57L127 21H166L175 66M145 63L176 97\" stroke=\"#4e626e\" stroke-width=\"13\"/><path d=\"M128 19Q146 -9 165 19\" fill=\"#647078\"/><path d=\"M80 63Q61 77 64 106\" stroke=\"#352b23\" stroke-width=\"8\" fill=\"none\"/></svg>"});
  VEHICLES.push({"id":"dragonmace","sim":"dragonmace","group":8,"status":"live","year":1200,"yearLabel":"12–13. yüzyıl","eraLabel":"ANADOLU SELÇUKLU • METAL İŞÇİLİĞİ","domain":"land","era":"medieval","energy":["muscle"],"role":["melee"],"origin":"seljuk","name":"Selçuklu Ejder Başlı Gürzü","sub":"KIVRIMLI EJDER • AĞIZ İÇİNDE HAYVAN • DÖKÜM BEZEME","desc":"Furusiyya R-113 eserinin büyütülmüş yorumu: kıvrılan ejder başı, açık ağızdaki küçük hayvan figürü, kabartmalı göz ve aşınmış metal yüzey. Nesneyi döndürün; baş–sap ve motif ayrımını sergi görünümünde inceleyin.","tags":["Somut Eser Referansı","Heykelsi Baş","Ayrılabilir Motif"],"specs":[["ESER","Furusiyya R-113"],["TARİH","12–13. yüzyıl"],["KAYNAK BOYU","35 cm"],["MALZEME","Bakır alaşımı / demir"]],"tag":"SELJUK-DRAGON-MACE","icon":"🐉","modal":["Kıvrımlı sabit döküm baş ve gerçek açık ağız","Kabartmalı göz, yanak ve boyun bezemeleri","Ağız içindeki küçük dört ayaklı figür","Demir sap, bilezik ve çağdaş sergi mesnetleri"],"svg":"<svg viewBox=\"0 0 320 140\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M143 127L148 65\" stroke=\"#695344\" stroke-width=\"9\"/><path d=\"M144 70Q123 24 156 22L170 5L172 33Q210 37 194 62Q185 69 185 58Q197 43 171 44Q152 47 157 71Z\" fill=\"#736b46\" stroke=\"#b29a5a\" stroke-width=\"2\"/><circle cx=\"145\" cy=\"36\" r=\"7\" fill=\"#333e35\" stroke=\"#b29a5a\"/><path d=\"M172 23L183 18L192 39L181 42\" fill=\"none\" stroke=\"#736b46\" stroke-width=\"6\"/></svg>"});
  VEHICLES.push({"id":"turbanhelmet","sim":"turbanhelmet","group":8,"status":"live","year":1480,"yearLabel":"15. yüzyıl sonu","eraLabel":"TÜRKMEN GELENEĞİ • OLASI AKKOYUNLU BAĞLANTISI","domain":"land","era":"medieval","energy":["muscle"],"role":["armor"],"origin":"turkmen","name":"Akkoyunlu Geleneğinde Bezemeli Miğfer","sub":"SARIK MİĞFER • METAL KABUK • GÜMÜŞ VE ALTIN RENKLİ BEZEME","desc":"Met 04.3.461 eserinin büyütülmüş yorumu. İçi boş gövde, göz üstü açıklıkları, yatay bezeme kuşakları ve düşey burun koruması. Kabuğu kaldırıp astar yorumunu inceleyin; zincir boyunluk tamamlamasını ayrıca açın.","tags":["Somut Müze Eseri","İçi Boş Kabuk","Ayrı Tamamlama Katmanı"],"specs":[["ESER","Met 04.3.461"],["DÖNEM","15. yüzyıl sonu"],["KAYNAK BOYU","29,2 cm"],["KAYNAK AĞIRLIĞI","1496 g"]],"tag":"TURKMAN-TURBAN-HELMET","icon":"🪖","modal":["İçi boş gövde, alt kenar ve göz üstü açıklıkları","Yatay kuşaklar, madalyonlar ve bitkisel bezeme yorumu","Kılavuz içinde kayan burun koruması ve delikli üstlük","Ayrılabilir astar ve isteğe bağlı zincir tamamlama yorumu"],"svg":"<svg viewBox=\"0 0 320 140\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M91 123V83Q88 59 128 32L160 4L192 32Q232 59 229 83V123L180 120L170 112H150L140 120Z\" fill=\"#465057\" stroke=\"#a38e59\" stroke-width=\"2\"/><path d=\"M115 52H205M104 65H216M95 78H225M94 92H226\" stroke=\"#b3a579\" stroke-width=\"3\"/><path d=\"M160 126V73\" stroke=\"#b5b7b1\" stroke-width=\"7\"/><ellipse cx=\"160\" cy=\"66\" rx=\"12\" ry=\"16\" fill=\"#b5b7b1\"/><path d=\"M107 105L117 98L127 105L117 115ZM193 105L203 98L213 105L203 115Z\" fill=\"none\" stroke=\"#baa568\" stroke-width=\"2\"/></svg>"});
  VEHICLES.push({"id":"maxim","sim":"maxim","group":9,"status":"live","year":1884,"yearLabel":"1884 / 1895 sonrası","eraLabel":"SANAYİ DEVRİMİ","domain":"land","era":"industrial","energy":["gunpowder"],"role":["smallarms"],"origin":"uk","name":"Maxim–Nordenfelt Makineli Tüfeği","sub":"GERİ TEPMEDEN OTOMATİK ÇEVRİME","desc":"Maxim’in 1884 patentli otomatik silah fikri; Museums Victoria ST 23731’deki 1895 sonrası örnek üzerinden. Pirinç su ceketi, kumaş şerit, yan yay kapağı ve açılan üst kapak. Gatling ile karşılaştırarak insan gücünden geri tepme enerjisine geçişi keşfedin.","tags":["Su Ceketi","Açılan Üst Kapak","Gatling Karşılaştırması","Müze Referansı"],"specs":[["GÖRSEL ÖRNEK","ST 23731 • 1895 sonrası"],["KAYNAK BOYU / KÜTLESİ","110 cm / 27,26 kg"],["KALİBRE (KAYNAK)",".450/.577 in."],["ÇALIŞMA","Geri tepme • şerit besleme"]],"tag":"MAXIM-NORDENFELT","icon":"⚙️","modal":["Pirinç ceket, iç namlu ve açık besleme pencereleri","Kumaş şerit, kartuş cepleri ve yüzey ayrıntıları","Menteşeli üst kapak ve yavaşlatılmış temsili iç hareket","Gatling karşılaştırması; kaynak eser ve yorumlanan parçalar ayrı belirtilir"],"svg":"<svg viewBox=\"0 0 320 140\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M30 104H290\" stroke=\"#475569\" stroke-width=\"4\"/><path d=\"M100 102V77M220 102V82\" stroke=\"#475569\" stroke-width=\"4\"/><rect x=\"31\" y=\"53\" width=\"135\" height=\"27\" rx=\"6\" fill=\"#ae8c50\" stroke=\"#665639\" stroke-width=\"2\"/><rect x=\"166\" y=\"45\" width=\"104\" height=\"43\" rx=\"3\" fill=\"#3c444a\"/><path d=\"M270 50H286V82H270M13 66H31\" fill=\"none\" stroke=\"#7e6844\" stroke-width=\"5\"/><path d=\"M176 59Q202 67 187 111\" fill=\"none\" stroke=\"#b6a17b\" stroke-width=\"10\"/><path d=\"M182 72H251\" stroke=\"#b99a5b\" stroke-width=\"6\"/></svg>"});
  VEHICLES.push({
  "id": "abdulhamid",
  "sim": "abdulhamid",
  "group": 10,
  "status": "live",
  "year": 1886,
  "yearLabel": "1886",
  "eraLabel": "SANAYİ DEVRİMİ • OSMANLI BAHRİYESİ",
  "domain": "sea",
  "era": "industrial",
  "energy": [
    "steam"
  ],
  "role": [
    "artillery",
    "defense"
  ],
  "origin": "ottoman",
  "name": "Osmanlı Abdülhamid (Nordenfelt II) Buharlı Denizaltısı",
  "sub": "ERKEN OSMANLI DENİZALTICILIĞI · BUHAR GÜCÜ VE DENGE",
  "desc": "1886’da Taşkızak’ta suya indirilen Nordenfelt II. Buhar gücü, dikey dalış pervaneleri ve boyuna denge sorunları üzerinden erken Osmanlı denizaltıcılığını keşfedin. İlk su altı torpido atışına ilişkin tarih ve tekne bilgileri kaynaklarda ayrışır; model yaklaşık bir sergi rekonstrüksiyonudur.",
  "tags": [
    "Lamm Kızgın Buhar Sarnıçları",
    "Baş/Kıç Dikey Dalış Pervaneleri",
    "356 mm Schwarzkopff Torpidosu",
    "15 İnceleme Grubu"
  ],
  "specs": [
    [
      "DÖNEM",
      "1886 · Osmanlı denizaltı deneyleri"
    ],
    [
      "TAHRİK",
      "Buhar gücü"
    ],
    [
      "GÖSTERİM",
      "Temsili iç düzen ve hareket"
    ],
    [
      "İNCELEME",
      "15 bağımsız grup"
    ]
  ],
  "tag": "ABDULHAMID-NORDENFELT-1886",
  "icon": "⚓",
  "modal": [
    "Perçinli gövde, camlı kumanda mahalli ve güverte ayrıntıları",
    "Yüzey ve dalış kipleri; baca ve buhar makinesi gösterimi",
    "Dikey pervaneler ve yaklaşık aktarma modeli",
    "Kaynak farklılıkları açıklanan torpido denemeleri ve Türk tarihi rotası"
  ],
  "svg": "<svg viewBox=\"0 0 320 140\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 58 Q90 54 160 58 T308 58\" stroke=\"#0284c7\" stroke-width=\"1.6\" stroke-dasharray=\"5 3\"/><path d=\"M22 82 Q95 54 160 54 Q225 54 298 82 Q225 110 160 110 Q95 110 22 82 Z\" fill=\"#334155\" fill-opacity=\"0.32\" stroke=\"#0f172a\" stroke-width=\"2.2\"/><rect x=\"148\" y=\"38\" width=\"14\" height=\"20\" rx=\"2\" fill=\"#475569\" stroke=\"#0f172a\" stroke-width=\"1.8\"/><path d=\"M178 55 A12 10 0 0 1 202 55 Z\" fill=\"#38bdf8\" fill-opacity=\"0.5\" stroke=\"#0f172a\" stroke-width=\"1.8\"/><rect x=\"216\" y=\"48\" width=\"54\" height=\"9\" rx=\"3\" fill=\"#b45309\" fill-opacity=\"0.45\" stroke=\"#78350f\" stroke-width=\"1.8\"/><ellipse cx=\"105\" cy=\"82\" rx=\"24\" ry=\"12\" fill=\"#d97706\" fill-opacity=\"0.3\" stroke=\"#b45309\" stroke-width=\"1.6\"/><ellipse cx=\"215\" cy=\"82\" rx=\"24\" ry=\"12\" fill=\"#d97706\" fill-opacity=\"0.3\" stroke=\"#b45309\" stroke-width=\"1.6\"/><line x1=\"62\" y1=\"62\" x2=\"62\" y2=\"102\" stroke=\"#0284c7\" stroke-width=\"2.5\"/><line x1=\"258\" y1=\"62\" x2=\"258\" y2=\"102\" stroke=\"#0284c7\" stroke-width=\"2.5\"/></svg>"
});
  VEHICLES.push({
  "id": "greekfire",
  "sim": "greekfire",
  "group": 10,
  "status": "live",
  "year": 672,
  "yearLabel": "7. yüzyıl sonu",
  "eraLabel": "ORTA ÇAĞ • BİZANS DONANMASI",
  "domain": "sea",
  "era": "medieval",
  "energy": [
    "muscle"
  ],
  "role": [
    "artillery",
    "defense"
  ],
  "origin": "byzantine",
  "name": "Bizans Rum Ateşi — Dromon Pruva Rekonstrüksiyonu",
  "sub": "TARİHSEL TASVİRLER VE REKONSTRÜKSİYONUN SINIRLARI",
  "desc": "Bizans deniz savaşlarıyla özdeşleşen Rum Ateşi’nin dromon pruva yorumu. Ahşap bordalar, bronz aslan başı ve yaklaşık kesit düzeni. Kesin bileşim ve iç sistem bilinmiyor; hareketler stilize sergi gösterimidir.",
  "tags": [
    "Dromon Pruvası",
    "Aslan Başlı Sifon",
    "12. Yüzyıl Tasvirleri",
    "Yaklaşık Kesit"
  ],
  "specs": [
    [
      "DÖNEM",
      "7. yüzyıl sonundan itibaren"
    ],
    [
      "GÖRSEL KAYNAK",
      "Skylitzes · 12. yüzyıl"
    ],
    [
      "İÇ DÜZEN",
      "Varsayımsal rekonstrüksiyon"
    ],
    [
      "İNCELEME",
      "15 bağımsız grup"
    ]
  ],
  "tag": "GREEK-FIRE-672",
  "icon": "🔥",
  "modal": [
    "Ahşap pruva kesiti ve güverte ayrıntıları",
    "Minyatürlerden esinlenen aslan başlı sifon",
    "Yaklaşık iç düzen ve temsili hareketler",
    "Kesin yakıt, basınç veya menzil iddiası bulunmaz"
  ],
  "svg": "<svg viewBox=\"0 0 320 140\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M10 105 Q90 100 160 105 T310 105\" stroke=\"#0284c7\" stroke-width=\"1.8\" stroke-dasharray=\"5 3\"/><path d=\"M24 108 L42 64 L188 64 L216 96 L185 112 Z\" fill=\"#785233\" fill-opacity=\"0.35\" stroke=\"#451a03\" stroke-width=\"2.2\"/><ellipse cx=\"78\" cy=\"88\" rx=\"18\" ry=\"14\" fill=\"#b45309\" fill-opacity=\"0.45\" stroke=\"#78350f\" stroke-width=\"1.8\"/><rect x=\"118\" y=\"76\" width=\"28\" height=\"24\" rx=\"3\" fill=\"#d97706\" fill-opacity=\"0.4\" stroke=\"#78350f\" stroke-width=\"1.8\"/><line x1=\"106\" y1=\"68\" x2=\"158\" y2=\"68\" stroke=\"#451a03\" stroke-width=\"3\"/><path d=\"M168 52 L226 46\" stroke=\"#d97706\" stroke-width=\"5\" stroke-linecap=\"round\"/><path d=\"M228 46 Q268 42 304 68 Q272 58 228 52 Z\" fill=\"#ef4444\" fill-opacity=\"0.65\" stroke=\"#ea580c\" stroke-width=\"1.8\"/></svg>"
});
  VEHICLES.push({
  "id": "r7",
  "sim": "r7",
  "group": 10,
  "status": "live",
  "year": 1961,
  "yearLabel": "1961 · R-7 ailesi: 1957",
  "eraLabel": "SOĞUK SAVAŞ • UZAY ÇAĞI",
  "domain": "space",
  "era": "coldwar",
  "energy": [
    "jet"
  ],
  "role": [
    "artillery",
    "transport"
  ],
  "origin": "ussr",
  "name": "Vostok-K — R-7 Ailesi ve Korolev Haçı",
  "sub": "BALİSTİK FÜZEDEN İNSANLI UZAY UÇUŞUNA",
  "desc": "R-7 ailesinin 1961 Vostok-K düzeni: dört yan hızlandırıcı, Blok E üst kademesi ve Vostok 3KA kapsülü. Sputnik’in 1957 taşıyıcısı ayrı bir konfigürasyondur; model ikisini aynı uçuşta birleştirmez. Ayrılma hareketi temsili müze gösterimidir.",
  "tags": [
    "Korolev Haçı (4× Yan Hızlandırıcı)",
    "32 Odalı RD-107/108 Kümesi",
    "Baykonur Yaprak Kuleleri",
    "16 İnceleme Grubu"
  ],
  "specs": [
    [
      "DÜZEN",
      "Vostok-K · 1961"
    ],
    [
      "AİLE",
      "R-7 · 1957’den itibaren"
    ],
    [
      "MOTOR DÜZENİ",
      "20 ana + 12 yönlendirme odası"
    ],
    [
      "İNCELEME",
      "16 bağımsız grup"
    ]
  ],
  "tag": "R7-SEMYORKA-VOSTOK-1957",
  "icon": "🚀",
  "modal": [
    "Panel kuşakları ve bağlantı ayrıntılarıyla dört hızlandırıcı",
    "Merkez kademe, açık kafes ve Blok E üst kademesi",
    "Ayrılan gövdeyle birlikte hareket eden motor kümeleri",
    "Açılır kaporta altında yalnız Vostok 3KA; temsili alev ve ayrılma"
  ],
  "svg": "<svg viewBox=\"0 0 320 140\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M148 12 L160 2 L172 12 L172 108 L148 108 Z\" fill=\"#4b5842\" fill-opacity=\"0.4\" stroke=\"#1e293b\" stroke-width=\"2\"/><path d=\"M148 42 L116 108 L148 104 Z\" fill=\"#ea580c\" fill-opacity=\"0.45\" stroke=\"#7c2d12\" stroke-width=\"1.8\"/><path d=\"M172 42 L204 108 L172 104 Z\" fill=\"#ea580c\" fill-opacity=\"0.45\" stroke=\"#7c2d12\" stroke-width=\"1.8\"/><line x1=\"92\" y1=\"112\" x2=\"228\" y2=\"112\" stroke=\"#334155\" stroke-width=\"4\"/><path d=\"M104 112 L136 68 M216 112 L184 68\" stroke=\"#475569\" stroke-width=\"2.5\"/><path d=\"M126 108 L118 134 L142 134 Z M152 108 L146 136 L174 136 Z M194 108 L178 134 L202 134 Z\" fill=\"#f97316\" fill-opacity=\"0.7\"/></svg>"
});
  VEHICLES.push({
  "id": "harrier",
  "sim": "harrier",
  "group": 10,
  "status": "live",
  "year": 1969,
  "yearLabel": "1969",
  "eraLabel": "SOĞUK SAVAŞ • V/STOL JET ÇAĞI",
  "domain": "air",
  "era": "coldwar",
  "energy": [
    "jet"
  ],
  "role": [
    "aircraft"
  ],
  "origin": "uk",
  "name": "Hawker Siddeley Harrier GR.1 & Rolls-Royce Pegasus VTOL Motoru",
  "sub": "İLK OPERASYONEL V/STOL JET TAARRUZ UÇAĞI • ZIT DÖNER ÇİFT ŞAFTLI PEGASUS TURBOFAN • 4 DÖNER NOZUL & RCS PUFFER",
  "desc": "1969’da RAF hizmetine giren Harrier GR.1 ve Pegasus motoru. Ok açılı kanatlar, bisiklet iniş takımı, yanal hava girişleri ve birlikte dönen dört nozul. GR.1, Falkland’da kullanılan GR.3 ve Sea Harrier’den ayrıdır. Kesit ve hover hareketi yaklaşık sergi yorumudur.",
  "tags": [
    "Zıt Döner Çift Şaft (Pegasus)",
    "4× Döner Vektör Nozulu (0°..98°)",
    "RCS Puffer & Bisiklet İniş Takımı",
    "15 İnceleme Grubu"
  ],
  "specs": [
    [
      "SÜRÜM",
      "Harrier GR.1 · RAF 1969"
    ],
    [
      "MOTOR",
      "Pegasus 10 / Mk 101"
    ],
    [
      "AYIRT EDİCİ",
      "Dört döner nozul · V/STOL"
    ],
    [
      "İNCELEME",
      "15 bağımsız grup"
    ]
  ],
  "tag": "HARRIER-GR1-PEGASUS-1969",
  "icon": "🛫",
  "modal": [
    "Daralan ok açılı kanatlar, düzeltilmiş kanopi ve GR.1 kuyruk silueti",
    "Pegasus’un zıt dönüşlü iki şaftı; hız oranı temsili",
    "Dört senkron nozul, bisiklet ve destek iniş takımları",
    "Temsili hover ve salvo gösterimi; performans hesabı değildir"
  ],
  "svg": "<svg viewBox=\"0 0 320 140\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M28 74 L92 60 L216 58 L268 72 L292 78 L256 84 L96 86 Z\" fill=\"#3f4d3b\" fill-opacity=\"0.42\" stroke=\"#1e293b\" stroke-width=\"2\"/><path d=\"M52 58 L72 32 L96 32 L82 60 Z\" fill=\"#475569\" fill-opacity=\"0.45\" stroke=\"#1e293b\" stroke-width=\"1.8\"/><path d=\"M124 66 L192 82 L138 82 Z\" fill=\"#64748b\" fill-opacity=\"0.5\" stroke=\"#1e293b\" stroke-width=\"1.8\"/><circle cx=\"164\" cy=\"76\" r=\"9\" fill=\"#94a3b8\" stroke=\"#1e293b\" stroke-width=\"2\"/><circle cx=\"126\" cy=\"76\" r=\"9\" fill=\"#ea580c\" fill-opacity=\"0.6\" stroke=\"#7c2d12\" stroke-width=\"2\"/><path d=\"M160 85 L154 122 L172 122 Z\" fill=\"#38bdf8\" fill-opacity=\"0.65\"/><path d=\"M122 85 L116 124 L134 124 Z\" fill=\"#f97316\" fill-opacity=\"0.75\"/></svg>"
});
  VEHICLES.push({
  "id": "strv103",
  "sim": "strv103",
  "group": 10,
  "status": "live",
  "year": 1986,
  "yearLabel": "1986 · aile: 1967",
  "eraLabel": "SOĞUK SAVAŞ • TARETSİZ MBT",
  "domain": "land",
  "era": "coldwar",
  "energy": [
    "ice",
    "jet"
  ],
  "role": [
    "armor",
    "defense"
  ],
  "origin": "sweden",
  "name": "Stridsvagn 103C — Taretsiz İsveç Tankı",
  "sub": "GÖVDE VE SÜSPANSİYONLA YÖNLENDİRME · 103C MODERNİZASYONU",
  "desc": "Strv 103 ailesinin 1986’dan itibaren modernize edilen C sürümü. Detroit dizel ve Caterpillar gaz türbini, yan bidonlar, sabit top ve gövde eğimini kullanan süspansiyon. İç kesit ve hareketler yaklaşık sergi yorumudur; 1967 A sürümüyle karıştırılmaz.",
  "tags": [
    "Hidropnömatik Gövde Eğimi (±11°)",
    "CODAG (Dizel + Gaz Türbini)",
    "50 Mermi Şarjör & Kıç Kovan Atıcı",
    "15 İnceleme Grubu"
  ],
  "specs": [
    [
      "SÜRÜM",
      "103C · 1986 modernizasyonu"
    ],
    [
      "GÜÇ PAKETİ",
      "Detroit 6V-53T + Caterpillar 553"
    ],
    [
      "MÜRETTEBAT",
      "3 kişi"
    ],
    [
      "İNCELEME",
      "15 bağımsız grup"
    ]
  ],
  "tag": "STRV-103-STANK-1967",
  "icon": "🛡️",
  "modal": [
    "Alçak kama gövde, yan bidonlar ve ön çubuk kafes",
    "Gövde eğilirken zemin temasını koruyan paletler ve bağlantı kolları",
    "Birlikte hareket eden namlu/kama ile temsili atış gösterimi",
    "103C motor düzeni; açılır dozer ve gizlenebilir sergi kafesi"
  ],
  "svg": "<svg viewBox=\"0 0 320 140\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M36 86 L46 62 L156 56 L248 76 L232 92 L48 92 Z\" fill=\"#3b4d38\" fill-opacity=\"0.48\" stroke=\"#1e293b\" stroke-width=\"2\"/><line x1=\"168\" y1=\"64\" x2=\"306\" y2=\"60\" stroke=\"#1e293b\" stroke-width=\"5\" stroke-linecap=\"round\"/><rect x=\"44\" y=\"88\" width=\"188\" height=\"24\" rx=\"12\" fill=\"#334155\" fill-opacity=\"0.35\" stroke=\"#1e293b\" stroke-width=\"2\"/><circle cx=\"72\" cy=\"100\" r=\"10\" fill=\"#475569\" stroke=\"#1e293b\" stroke-width=\"2\"/><circle cx=\"116\" cy=\"100\" r=\"10\" fill=\"#475569\" stroke=\"#1e293b\" stroke-width=\"2\"/><circle cx=\"160\" cy=\"100\" r=\"10\" fill=\"#475569\" stroke=\"#1e293b\" stroke-width=\"2\"/><circle cx=\"204\" cy=\"100\" r=\"10\" fill=\"#475569\" stroke=\"#1e293b\" stroke-width=\"2\"/></svg>"
});
  VEHICLES.push({
    id:'fa330', sim:'fa330', group:17, status:'live', year:1942, yearLabel:'1942', eraLabel:'II. DÜNYA SAVAŞI • DENİZ KEŞFİ',
    domain:'air', era:'ww2', energy:['airflow'], role:['intelligence'], origin:'germany',
    name:'Fa 330 Bachstelze — Denizaltının Uçan Gözcüsü', sub:'MOTORSUZ ROTOR UÇURTMASI • GÜVERTE VE ÇEKME VİNCİ',
    desc:'Denizaltının arkasında çekilen tek kişilik gözlem aracı. Üç palalı rotor, açık boru iskeleti, kemerli koltuk, kuyruk, güverte vinci ve bağlı kabloyu inceleyin. Konum ve rotor hareketleri eğitim amaçlıdır; gerçek uçuş mesafesi sahnede kısaltılmıştır.',
    tags:['Üç Palalı Serbest Rotor','Güverte ve Vinç','Hareketi İzleyen Kablo','Telefon Bağlantısı'],
    specs:[['ROTOR ÇAPI','~7,30 m'],['MOTOR','Yok — autorotasyon'],['GÖREV','Denizaltı için gözlem'],['SAHNE','Temsili güverte / kısa çekme hattı']],
    tag:'FA330-1942', icon:'🌬️',
    modal:['Açık iskelet, çift kızak ve kemerli koltuk','Üç palalı rotor başlığı, mafsallar ve kuyruk','Temsili denizaltı güvertesi, saklama tüpleri ve vinç','Kısa çekme kablosu, telefon hattı ve altı adımlı tur'],
    svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><path d="M25 108H240L270 121H46Z" fill="#4c585d"/><path d="M55 108V85H84V108" fill="#718187"/><path d="M115 108Q140 78 169 66" fill="none" stroke="#a58d62" stroke-width="2"/><path d="M157 72L179 66L240 77M178 65L176 31M157 72L153 84H191M240 77V54L259 76Z" fill="none" stroke="#71928b" stroke-width="4"/><path d="M176 31L90 22M176 31L271 18M176 31L202 55" stroke="#71928b" stroke-width="7"/><path d="M168 54V66H181" fill="none" stroke="#303b3e" stroke-width="5"/><circle cx="114" cy="106" r="7" fill="none" stroke="#a58d62" stroke-width="3"/></svg>'
  });
  VEHICLES.push({
    id:'t34', sim:'t34', group:11, status:'live', year:1940, yearLabel:'1940–1941 (erken üretim)', eraLabel:'II. DÜNYA SAVAŞI • ORTA TANK',
    domain:'land', era:'ww2', energy:['ice'], role:['armor'], origin:'ussr',
    name:'T-34/76 — Christie Süspansiyonu ve V-2 Dizel', sub:'EĞİMLİ ZIRH • YAN DUVAR HELEZON YAYLARI • 76,2 MM TOP',
    desc:'Eğimli zırh, geniş palet ve dizel motoru bir araya getiren Sovyet orta tankı. Engel kaydırıcısıyla bir tekerleğin altına kütük koyun: Christie kolu döner, gövde duvarındaki helezon yay kısalır ve palet hattı yeniden çizilir. X-Ray ile V-2 V12 dizeli, volan-fanı ve arka cer dişlilerini inceleyin. Ölçüler ve iç yerleşim yaklaşıktır.',
    tags:['Christie Süspansiyonu','Kütük Engel Testi','V-2 V12 Dizel','76,2 mm Top'],
    specs:[['AĞIRLIK','~26,5 t'],['MOTOR','V-2-34 V12 dizel, ~500 BG'],['ZIRH','15–45 mm, eğimli'],['YÜRÜYÜŞ','5 büyük tekerlek / taraf, dönüş makarası yok']],
    tag:'T34-76-1941', icon:'🛡️',
    modal:['Eğimli gövde, sürücü kapağı ve ön makineli tüfek','Altıgen taret, 76,2 mm top ve geri tepme','Christie salıncak kolları ve yan duvar yayları','V-2 dizel, volan-fan, şanzıman ve arka cer'],
    svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><path d="M40 88L70 70H230L262 82L270 96H40Z" fill="#4a5532"/><path d="M120 70L132 50H190L198 70Z" fill="#465030"/><path d="M196 58H292" stroke="#3b4247" stroke-width="5"/><path d="M36 100H272L262 118H48Z" fill="#252b2e"/><g fill="#3b4247"><circle cx="78" cy="108" r="12"/><circle cx="114" cy="108" r="12"/><circle cx="150" cy="108" r="12"/><circle cx="186" cy="108" r="12"/><circle cx="222" cy="108" r="12"/></g><path d="M114 96L122 80" stroke="#8a9197" stroke-width="3"/></svg>'
  });
  VEHICLES.push({
    id:'norden', sim:'norden', group:11, status:'live', year:1942, yearLabel:'1942 (M-9 ailesi)', eraLabel:'II. DÜNYA SAVAŞI • MEKANİK HESAP',
    domain:'air', era:'ww2', energy:['electric'], role:['intelligence'], origin:'usa',
    name:'Norden M-9 — Mekanik Analog Bomba Nişangâhı', sub:'DİSK–BİLYE İNTEGRATÖRÜ • JİROSKOPLU STABİLİZATÖR • DÜŞÜŞ AÇISI',
    desc:'Uçağın yer hızını ve irtifasını dişliler, disk–bilye integratörü ve jiroskoplarla hesaplayan nişangâh. Bomba koşusunu başlatın: teleskop aynası hedefi izler, düşüş açısına ulaşınca bırakma kontağı kapanır. Hız ayarını bozarsanız artı işaret kayar ve ıska mesafesi hesaplanır. Hava direnci ve gerçek trail tabloları kullanılmaz; iç düzen eğitim amaçlı yorumdur.',
    tags:['Disk–Bilye İntegratörü','Düşüş Açısı Hesabı','Jiroskoplu Stabilizatör','Hız Ayar Hatası ve Iska'],
    specs:[['ÜRETİCİ (MÜZE ÖRNEĞİ)','Victor Adding Machine Co.'],['BİLEŞENLER','Nişangâh başlığı + stabilizatör'],['HESAP','tan δ = V·√(2h/g) / h (dirençsiz)'],['SAHNE','Müze kaidesi + eğitim ekranı']],
    tag:'NORDEN-M9-1942', icon:'🎯',
    modal:['Nişangâh başlığı, teleskop ve ayna tahriki','Hız motoru ve disk–bilye integratörü','Nişan ve düşüş açısı göstergeleri, bırakma kontağı','Jiroskoplu stabilizatör ve otomatik pilot bağlantısı'],
    svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><rect x="110" y="96" width="100" height="26" fill="#252b2e"/><rect x="118" y="46" width="84" height="50" rx="6" fill="#2b2f33"/><circle cx="160" cy="71" r="16" fill="none" stroke="#a08046" stroke-width="3"/><path d="M160 71L176 64" stroke="#a08046" stroke-width="3"/><rect x="200" y="58" width="44" height="14" fill="#3b4247"/><path d="M244 65L290 122" stroke="#d89a43" stroke-dasharray="5 4" stroke-width="2"/><path d="M60 122H300" stroke="#71513b" stroke-width="3"/><circle cx="290" cy="122" r="5" fill="#863e32"/></svg>'
  });
  VEHICLES.push({
    id:'f14', sim:'f14', group:11, status:'live', year:1974, yearLabel:'1974 (hizmet) • müze örneği F-14D(R)', eraLabel:'SOĞUK SAVAŞ • DEĞİŞKEN OK AÇILI KANAT',
    domain:'air', era:'coldwar', energy:['jet'], role:['aircraft'], origin:'usa',
    name:'Grumman F-14 Tomcat — Değişken Ok Açılı Kanat', sub:'20° ⇄ 68° SENKRON KANAT • 75° YERDE PARK • AIM-54 PHOENIX',
    desc:'İki dış kanadın pivotlar etrafında aynı açıyla döndüğü uçak gemisi önleme uçağı. Ok açısını 20°’den 68°’e taşıyın, Mach’a bağlı temsili programı açın veya yerdeyken 75° park konumunu seçin. Açıklık, kanat ile kuyruk arasındaki yükseklik farkı ve AIM-54 ayrılması incelenebilir. Gövde ve iç yerleşim yaklaşıktır; gerçek CADC programı ve radar modellenmez.',
    tags:['Senkron Kanat Pivotları','20° / 68° / 75° Konumları','Hava Alığı Rampası ve Art Yakıcı','6 × AIM-54'],
    specs:[['AÇIKLIK','~19,54 m (20°) / ~11,65 m (68°)'],['PARK','~10,15 m (75°, yalnız yerde)'],['UZUNLUK','~19,1 m'],['MÜZE ÖRNEĞİ','F-14D(R), Udvar-Hazy']],
    tag:'F14-TOMCAT-1974', icon:'✈️',
    modal:['Kanat kök kutusu ve senkron pivotlar','20°–68° uçuş, 75° yerde park','Hava alığı rampası, fan ve art yakıcı lülesi','AIM-54 Phoenix ayrılması ve kanopi'],
    svg:'<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg"><path d="M160 10L170 40V118L184 128H136L150 118V40Z" fill="#8f979c"/><path d="M168 56L290 86L292 94L168 82Z" fill="#7f878c"/><path d="M152 56L30 86L28 94L152 82Z" fill="#7f878c"/><path d="M168 56L250 112L244 118L168 84Z" fill="none" stroke="#d89a43" stroke-dasharray="4 3" stroke-width="2"/><path d="M146 104L120 122H146ZM174 104L200 122H174Z" fill="#6c7378"/><circle cx="168" cy="60" r="4" fill="#252b2e"/><circle cx="152" cy="60" r="4" fill="#252b2e"/></svg>'
  });
  VEHICLES.push({"id": "sultanhisar", "sim": "sultanhisar", "group": 12, "status": "live", "year": 1915, "yearLabel": "1915 • 30 Nisan", "eraLabel": "I. DÜNYA SAVAŞI • OSMANLI DONANMASI", "domain": "sea", "era": "ww1", "energy": ["steam"], "role": ["defense"], "origin": "ottoman", "name": "Sultanhisar — Marmara’nın Torpidobotu", "sub": "İKİ BACA • ÜÇ GENLEŞMELİ MAKİNE • TEK PERVANE", "desc": "İnce gövde, iki baca, seyir evi, güverte kovanları ve tek pervane. X-Ray ile temsili buhar makinesinin krank ve biyellerini inceleyin. AE2 karşılaşmasını Türk tarihi rotasında keşfedin; iç yerleşim yaklaşık sergi yorumudur.", "tags": ["Tam Gemi", "Üç Silindir ve Tek Şaft", "Döner Kovan", "Türk Tarihi Rotası"], "specs": [["UZUNLUK", "~40 m"], ["TAHRİK", "Buhar / tek pervane"], ["TARİHSEL OLAY", "30 Nisan 1915"], ["MODEL", "Yaklaşık rekonstrüksiyon"]], "tag": "SULTANHISAR-1915", "icon": "⚓", "svg": "<svg viewBox=\"0 0 320 140\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M20 90H300L275 110H45Z\" fill=\"#78868b\"/><path d=\"M80 90V65H112V90M140 90V43H153V90M182 90V43H195V90\" fill=\"#5b666c\"/><path d=\"M110 65V20M80 35H140M220 80H267\" stroke=\"#35404a\" stroke-width=\"4\"/><path d=\"M35 110H278\" stroke=\"#783e35\" stroke-width=\"7\"/></svg>"});
  VEHICLES.push({"id": "renaultft", "sim": "renaultft", "group": 15, "status": "live", "year": 1917, "yearLabel": "1917 / 1918 muharebe", "eraLabel": "I. DÜNYA SAVAŞI • TANK YERLEŞİMİ", "domain": "land", "era": "ww1", "energy": ["ice"], "role": ["armor"], "origin": "france", "name": "Renault FT — Modern Tank Düzeninin Öncüsü", "sub": "TAM DÖNER TARET • ARKA MOTOR • SİPER KUYRUĞU", "desc": "Önde sürücü, ortada taret ve arkada motor. Perçinli çokgen taret, 37 mm top dış görünüşü, hareketli paletler, dokuz küçük yol tekerleği ve büyük ön avara. Kapıları ve motor kapağını açın, siper kızağını ayırın. Yaklaşık müze rekonstrüksiyonudur.", "tags": ["360° Döner Taret", "Kapalı Palet Yolu", "Açılır Kapılar", "Siper Kuyruğu"], "specs": [["MÜRETTEBAT", "2 kişi"], ["YERLEŞİM", "Sürücü / taret / motor"], ["VARYANT", "37 mm / çokgen taret yorumu"], ["İLK MUHAREBE", "1918"]], "tag": "RENAULT-FT", "icon": "🛡️", "svg": "<svg viewBox=\"0 0 320 140\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M65 91L100 70H197L237 99H65Z\" fill=\"#68734d\"/><path d=\"M127 72V42L140 32H169L184 44V72Z\" fill=\"#78825d\"/><path d=\"M178 51H236\" stroke=\"#30383a\" stroke-width=\"7\"/><path d=\"M44 103Q28 76 48 71L235 52Q273 57 262 100L245 119H62Z\" fill=\"none\" stroke=\"#343a31\" stroke-width=\"10\"/><g fill=\"#68734d\"><circle cx=\"239\" cy=\"83\" r=\"24\"/><circle cx=\"62\" cy=\"96\" r=\"16\"/><circle cx=\"110\" cy=\"105\" r=\"10\"/><circle cx=\"146\" cy=\"105\" r=\"10\"/><circle cx=\"181\" cy=\"105\" r=\"10\"/></g><path d=\"M55 102L20 124H60\" fill=\"none\" stroke=\"#68734d\" stroke-width=\"6\"/></svg>"});
  const SOURCES = {
 "renaultft": [{"title": "Renault FT — The Tank Museum", "url": "https://tankmuseum.org/article/ft-17", "note": "Yerleşim, 1917 geliştirme ve 1918 ilk muharebe bağlamı."}, {"title": "Renault FT — İspanya Kara Kuvvetleri El Goloso Müzesi", "url": "https://ejercito.defensa.gob.es/materiales/otros/museo_carros/museo-carros.html?__locale=es", "note": "Çokgen perçinli taret ve 37 mm seçeneği. İç yerleşim ve yüzey renkleri yaklaşık sergi yorumu."}],
  "sultanhisar": [{"title": "AE2 ve Sultanhisar — Australian National Maritime Museum", "url": "https://www.sea.museum/en/whats-on/exhibitions/johnnie-and-mehmet", "note": "Çatışma, hasar ve AE2’nin mürettebatınca batırılması."}, {"title": "AE2 araştırması — TINA Denizcilik Arkeolojisi Dergisi, sayı 4", "url": "https://www.tinaturk.org/dergi/TINA_Dergi_Sayi_4/content/TINA_Dergi_Sayi_04.pdf", "note": "Sultanhisar’ın yaklaşık 40,2 m boyu ve tarihsel karşılaşma. İç makine yerleşimi yaklaşık yorumdur."}],
  "f14": [
    {"title":"Grumman F-14D(R) Tomcat — Smithsonian NASM (A20040156000)","url":"https://airandspace.si.edu/collection-objects/grumman-f-14dr-tomcat/nasm_A20040156000","note":"Udvar-Hazy’de sergilenen, F-14A olarak üretilip D(R) standardına dönüştürülen uçak. Kanat açıları 20°/68°/75°; gövde ve iç yerleşim yaklaşık."}
  ],
  "norden": [
    {"title":"Bombsight, Norden M-9, Enola Gay — Smithsonian NASM (A19470009000)","url":"https://airandspace.si.edu/collection-objects/bombsight-norden-m-9-stabilizer-type-x-1-reflex-sight/nasm_A19470009000","note":"Nişangâh başlığı, stabilizatör ve X-1 refleks nişangâhı; Victor Adding Machine Co. üretimi. Modelin iç dişli ve integratör ölçüleri eğitim amaçlı yorumdur."}
  ],
  "t34": [
    {"title":"T-34/76 — The Tank Museum","url":"https://tankmuseum.org/tank-nuts/tank-collection/t-34-76","note":"Finlandiya’nın 1941’de ele geçirdiği erken üretim örnek; 76,2 mm top, 15–45 mm eğimli zırh, ~26,5 t, 4 kişilik mürettebat. Christie kol/yay oranları ve iç yerleşim yaklaşık yorumdur."}
  ],
  "fa330": [
    {"title":"Fa 330-A-0 — Musée de l’Air et de l’Espace","url":"https://www.museeairespace.fr/aller-plus-haut/collections/focke-achgelis-fa-330-a-0-bachstelze/","note":"Motorsuz gözlem aracı, 7,30 m rotor, 1942 denemeleri ve Type IXD2 bağlamı. Güverte düzeni ölçülü kopya değildir."},
    {"title":"Fa 330 Sandpiper — ABD Hava Kuvvetleri Müzesi","url":"https://www.nationalmuseum.af.mil/Visit/Museum-Exhibits/Fact-Sheets/Display/Article/196312/focke-achgelis-fa-330-sandpiper/","note":"Güverte vinci, çelik çekme kablosu ve telefon bağlantısı. Model gerçek uçuş fiziği hesaplamaz."},
    {"title":"Fa 330 müze fotoğrafları — Luftfahrtlexikon","url":"https://luftfahrtlexikon.com/focke-achgelis-fa-330-bachstelze-motorloser-kleintragschrauber-fuer-den-einsatz-auf-u-booten-und-schiffen/","note":"Koltuk, kemerler, rotor başı ve açık iskeletin görsel referansı. Fotoğraf projeye kopyalanmamıştır; ayrıntı oranları yaklaşık yorumdur."}
  ],
  "strv103": [
  {
    "title": "Arsenalen — Stridsvagn 103C",
    "url": "https://www.arsenalen.se/fordonsregister/stridsvagn-strv-103c/",
    "note": "1967 A teslimatları, 1986 C modernizasyonu, Detroit 6V-53T / Caterpillar 553, gövde ve süspansiyonla yönlendirme. İç geometri yaklaşık yorumdur."
  }
],
  "harrier": [
  {
    "title": "ASME — Pegasus 3 Engine BS 916",
    "url": "https://www.asme.org/about-asme/engineering-history/landmarks/168-pegasus-3-engine-bs-916",
    "note": "Dört döner nozul, Pegasus geliştirme tarihi, 1969 Harrier ve Mk 101. Sergideki nesne erken Pegasus 3 prototipidir."
  },
  {
    "title": "RAF Museum — Harriers over Falklands",
    "url": "https://www.rafmuseum.org.uk/blog/harriers-over-falklands/",
    "note": "1982’de kullanılan GR.3 ve Sea Harrier ayrımı; model GR.1 olarak kalır."
  }
],
  "r7": [
  {
    "title": "Smithsonian NASM — Racing to Space: Gagarin and Shepard",
    "url": "https://airandspace.si.edu/gagarin-vs-shepard",
    "note": "R-7’ye eklenen üst kademe ve 1961 Vostok uçuşu."
  },
  {
    "title": "Smithsonian — RD-107 Attitude Control Engine",
    "url": "https://www.si.edu/object/nasm_A19990074000",
    "note": "RD-107: dört ana ve iki küçük yönlendirme odası. Müze nesnesi sonraki Soyuz sürümüne aittir; motor ailesi karşılaştırmasıdır."
  },
  {
    "title": "ESA — The flight of Vostok 1",
    "url": "https://www.esa.int/About_Us/50_years_of_ESA/50_years_of_humans_in_space/The_flight_of_Vostok_1",
    "note": "12 Nisan 1961 uçuşunun tarihsel bağlamı; model uçuş fiziği simülasyonu değildir."
  }
],
  "greekfire": [
  {
    "title": "BNE — Un universo de imágenes: Skylitzes Matritensis",
    "url": "https://www.bne.es/es/agenda/universo-imagenes-skylitzes-matritensis",
    "note": "12. yüzyıl Sicilya el yazması. Tasvirler, 7. yüzyıl düzeninin teknik planları değildir."
  },
  {
    "title": "ACS / C&EN — John Haldon ile tarihsel rekonstrüksiyon söyleşisi",
    "url": "https://cen.acs.org/physical-chemistry/Podcast-Historians-decode-centuries-old/99/web/2021/01",
    "note": "Modern araştırma ve yeniden kurma girişimleri; model kesin bir özgün sistem olarak sunulmaz."
  }
],
  "abdulhamid": [
  {
    "title": "US Naval Institute — The Sultan’s Submarines (1974)",
    "url": "https://www.usni.org/magazines/proceedings/1974/october/sultans-submarines",
    "note": "İnşa ve denemeler; Ocak 1888 torpido denemesi Abdülmecid adıyla aktarılır. İç yerleşim ve renkler kesin rekonstrüksiyon değildir."
  },
  {
    "title": "University of Melbourne — Nordenfelt II",
    "url": "https://torp.esrc.unimelb.edu.au/biogs/E000136b.htm",
    "note": "İlk su altı torpido atışını Abdülhamid’e atfeden anlatı; USNI ile kaynak farkı korunur."
  }
],
  "maxim": [{"title":"Museums Victoria — ST 23731","url":"https://collections.museumsvictoria.com.au/items/406622","note":"1895 sonrası Maxim-Nordenfelt; görsel referans, 110 cm, 27,26 kg. İç geometri yaklaşık; mesnet çağdaş sergi yorumudur."},{"title":"National Army Museum — Maxim’in tarihsel bağlamı","url":"https://collection.nam.ac.uk/detail.php?acc=1974-07-41-1","note":"1884 patenti ve sömürge savaşları. Bu kayıttaki Extra Light sürümü modelin görsel referansı değildir."},{"title":"Royal Armouries — Birinci Dünya Savaşı silahları","url":"https://royalarmouries.org/objects-and-stories/stories/arms-of-the-first-world-war","note":"Maxim’den Vickers’a uzanan gelişim ve savaşın insan bedeli."}],
  "turbanhelmet": [{"title":"Turban Helmet — The Met, 04.3.461","url":"https://www.metmuseum.org/art/collection/search/22014","note":"15. yy. sonu, Batı İran / Türkmen zırh geleneği. Müze Akkoyunlu bağlantısını olasılıkla belirtir. 29,2 cm, 1496 g."},{"title":"Helmet with Aventail — The Met, 50.87","url":"https://www.metmuseum.org/art/collection/search/24813","note":"Yalnız isteğe bağlı zincir boyunluk için karşılaştırma. 04.3.461 ile aynı eser değildir; astar ve zincir yorumdur."}],
  "dragonmace": [{"title":"Court and Cosmos — Met, 2016, katalog 146, s.234","url":"https://www.metmuseum.org/met-publications/court-and-cosmos","note":"Anadolu, 12–13. yüzyıl; Furusiyya R-113, 35 cm. Küçük hayvanın türü kesin değil; boğa/aslan yorumları var."},{"title":"Sergi kataloğu PDF — ejder başlı gürz fotoğrafı","url":"https://cdn.sanity.io/files/cctd4ker/production/ee5d53316c311c05a2bf22ae2a99460ea2b8e5cd.pdf","note":"PDF sayfa 249 / basılı sayfa 234. Başın silueti ve yüzey ayrıntıları için görsel kaynak."}],
  "gokturk": [{"title":"Göktürk Dönemi Madeni Silahları — J. Özlem Oktay Çerezci, 2019","url":"https://dergipark.org.tr/en/pub/akdenizsanat/article/621686","note":"Zırh ve tolga tipleri; Balık-Sook temelli rekonstrüksiyon ve levha tabloları. Sahne bütünü yaklaşık yorumdur."},{"title":"Türk eyerinin kültürel tarihi — araştırma","url":"https://avesis.erciyes.edu.tr/yayin/443ec4c6-31da-4f58-970f-296649b29ff7/a-cultural-history-of-the-turkish-saddle/document.pdf","note":"Eyer ve üzengi bağlamı; belirli bir eyer buluntusunun birebir kopyası değildir."}],
  "vecihi": [{"title":"Vecihi K-VI: dönem fotoğrafları ve Hürkuş’un teknik anlatımı — TVHMD","url":"https://tayyarecivecihi.com/vecihi-hurkus/hurkusun-kullandigi-102-tip-ucak/ilk-turk-ucagi-vecihi-k-vi/","note":"Boyut ve motor bilgileri; kaynakta teorik denilen performans değerleri ölçülmüş uçuş sonucu olarak kullanılmadı."},{"title":"1924 arşiv fotoğrafı — TVHMD","url":"https://tayyarecivecihi.com/wp-content/uploads/2018/03/1924-0000-12.jpg","note":"Çift kanat, dikmeler, kaporta, tekerlek ve kuyruk işareti referansı; kesin renk çıkarımı yapılmadı."}],
  "ottomanbow": [{"title":"Bow and Arrows — The Metropolitan Museum of Art, 35.113.1a–oo","url":"https://www.metmuseum.org/art/collection/search/32139","note":"1719–1720 tarihli nesne; bezemeler sadeleştirilmiş, katman ve kurulu biçim öğretici yorumdur."}],
  "nusret": [{"title":"8 Mart görevi — Millî Savunma Bakanlığı","url":"https://www.msb.gov.tr/SlaytHaber/932021-42524"},{"title":"Nusret ve müze gemisi — Gemi Mühendisleri Odası, sayı 196, s.64","url":"https://www.gmo.org.tr/upl/gdt_dergi/196.pdf","note":"Ana boyutlar yaklaşık alınmıştır; metin/tablo tarihlerinde fark vardır. İç düzenek modern müze gemisinin kopyası değildir."}],
  "rrh": [{"title":"RRH müze açıklaması — Ilmatorjuntamuseo","url":"https://ilmatorjuntamuseo.fi/ilmatorjuntamuseo/kokoelman_helmet/rrh/"},{"title":"m/42 adlandırması — Ilmatorjuntamuseo","url":"https://ilmatorjuntamuseo.fi/ilmatorjuntamuseo/kokoelman_helmet/acousticlocators/"},{"title":"RRH dış biçimi ve tarihsel fotoğraf — Festungswerke Cuxhaven","url":"https://www.festungswerke-cuxhaven.de/horchgeraete","note":"Oranlar fotoğraftan yorumlanmıştır; tam alt tip ve iç hesaplayıcı kopyası değildir."}],
  "turtle": [{"title":"Varsayımsal Turtle kesit modeli 1976-480 — Science Museum Group","url":"https://collection.sciencemuseumgroup.org.uk/objects/co42224/model-of-submersible-turtle-cut-away-object-submarines-submersibles-warships"},{"title":"Turtle tarihsel belgeleri — NHHC","url":"https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/s/submarine-turtle-naval-documents.html"}],
  "archimedes": [{"title":"Demir El rekonstrüksiyonu — Kotsanas Müzesi","url":"https://kotsanas.com/el/exhibits/military/archimedes-iron-hand/","note":"Model modern müze yorumudur; özgün antik ölçüler bilinmez."}],
  "monitor": [
    {
      "title": "USS Monitor koruma çalışmaları — Mariners’ Museum",
      "url": "https://www.marinersmuseum.org/conservation/uss-monitor/"
    },
    {
      "title": "İnşa ve tasarım — NOAA",
      "url": "https://monitor.noaa.gov/150th/construction.html"
    }
  ],
  "j79": [
    {
      "title": "J79 tarihçesi — GE Aerospace",
      "url": "https://www.geaerospace.com/company/about-us/history"
    },
    {
      "title": "J79-GE-2 koleksiyonu — Smithsonian",
      "url": "https://airandspace.si.edu/collection-objects/general-electric-j79-ge-2-turbojet-engine/nasm_A19810156000"
    }
  ],
  "katyusha": [
    {
      "title": "BM-13 ve ZİS-6 — Voronej Bölge Müzesi",
      "url": "https://museum-vrn.ru/muzej/novosti/muzej-online-oruzhie-pobedy-boevaya-mashina-reaktivnoj-artillerii-katyusha/"
    }
  ],
  "v2": [
    {
      "title": "V-2 koleksiyon kaydı — Australian War Memorial",
      "url": "https://www.awm.gov.au/collection/C111276"
    },
    {
      "title": "Meillerwagen koruma projesi — AWM",
      "url": "https://www.awm.gov.au/v2-meillerwagen-conservation-project"
    },
    {
      "title": "V-2 tarihsel bağlamı — AWM",
      "url": "https://wm.awm.gov.au/read/v2-rocket-science"
    }
  ],
  "phalanx": [
    {
      "title": "Mk 15 bilgi dosyası — ABD Donanması",
      "url": "https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2167831/mk-15-phalanx-close-in-weapon-system-ciws/linkId/mk-15-phalanx-close-in-weapon-system-ciws/"
    },
    {
      "title": "Phalanx dış görünümü — Raytheon",
      "url": "https://www.rtx.com/en/raytheon/what-we-do/sea/phalanx-close-in-weapon-system"
    },
    {
      "title": "Phalanx ürün broşürü — GD-OTS (PDF)",
      "url": "https://www.gd-ots.com/wp-content/uploads/2024/03/400002644-PHALANX-Close-In-Weapon-System-CIWS-Product-Brochure-2024-03-V02-1.pdf"
    }
  ],
  "huey": [
    {
      "title": "UH-1H Smokey III koleksiyonu — Smithsonian",
      "url": "https://airandspace.si.edu/collection-objects/bell-uh-1h-iroquois-huey-smokey-iii/nasm_A19960005000"
    }
  ],
  "u505": [
    {
      "title": "U-505 koleksiyon kaydı — Griffin MSI",
      "url": "https://collections.griffinmsi.org/collections/4855"
    }
  ],
  "enigma": [
    {
      "title": "Enigma I makinesi — Crypto Museum",
      "url": "https://www.cryptomuseum.com/crypto/enigma/i/index.htm"
    },
    {
      "title": "Rotor bağlantıları — Crypto Museum",
      "url": "https://www.cryptomuseum.com/crypto/enigma/wiring.htm"
    },
    {
      "title": "Devre ve çift adımlama — Crypto Museum",
      "url": "https://www.cryptomuseum.com/crypto/enigma/working.htm"
    }
  ],
  "lcvp": [
    {
      "title": "LCVP ve çıkarma lojistiği — Ulaştırma Müzesi",
      "url": "https://transportation.army.mil/museum/AOTM/2020/may_2020.html"
    },
    {
      "title": "LCVP fotoğraf koleksiyonu — ABD Denizcilik Tarihi",
      "url": "https://www.history.navy.mil/content/history/museums/nmusn/explore/photography/ships-us/ships-usn-l/landing-craft-vehicle-personnel.html"
    }
  ],
  "chainhome": [
    {
      "title": "Chain Home tarihçesi — RAF Radar Museum",
      "url": "https://www.radarmuseum.co.uk/history/world-war-two/"
    },
    {
      "title": "Poling istasyon kaydı — Historic England",
      "url": "https://historicengland.org.uk/listing/heritage-gateway/results/record/0d636742-8028-4a8c-8b7c-e1f9aaf2d338/3ee99efa-d7fe-419b-a488-eba77c78d893"
    }
  ],
  "scythed": [
    {
      "title": "Askerî makineler çizimi — British Museum / Arts & Culture",
      "url": "https://artsandculture.google.com/asset/military-machines-leonardo-da-vinci/4AF1vuuEl2xiew?hl=en"
    },
    {
      "title": "Özgün çizim kaydı — British Museum",
      "url": "https://www.britishmuseum.org/collection/object/P_1860-0616-99"
    },
    {
      "title": "Leonardo sergisi — Las Vegas Natural History Museum",
      "url": "https://www.lvnhm.org/post/worldofdavinci"
    }
  ],
  "hwacha": [
    {
      "title": "Munjong Hwacha tarihçesi — Kore Ulusal Tarih Enstitüsü",
      "url": "https://contents.history.go.kr/play/view.do?itemId=tz&lang=eng&levelId=tz_b32"
    },
    {
      "title": "Modern rekonstrüksiyon — KCISA / Sketchfab",
      "url": "https://sketchfab.com/3d-models/singijeon-hwacha-85f48b05a86240e99b755d70070d8401"
    }
  ],
  "atlatl": [
    {
      "title": "Mexica atlatlı Am.5226 — British Museum",
      "url": "https://artsandculture.google.com/asset/wooden-spear-thrower-atlatl/YwGmIA6eKl4tqQ"
    },
    {
      "title": "Atlatl ve dart anlatımı — Maxwell Museum",
      "url": "https://hands.unm.edu/atlatls.html"
    },
    {
      "title": "Mixtec örnekleri — Museo delle Civiltà",
      "url": "https://www.museodellecivilta.it/en/oggetti/american-arts-and-cultures/spear-throwers-atlatl/"
    }
  ],
  "lantern": [
    {
      "title": "Fenerli kalkan A 384 — Kunsthistorisches Museum",
      "url": "https://www.khm.at/en/artworks/laternenschild-mit-eisenhandschuh-und-einschiebbarer-stossklinge-372783-1"
    }
  ],
  "polybolos": [
    {
      "title": "Tekrarlayan mancınık — Kotsanas Museum",
      "url": "https://kotsanas.com/exhibits/military/the-repeating-catapult/"
    }
  ],
  "giantbow": [
    {
      "title": "Leonardo askerî tasarımları — Museo Scienza",
      "url": "https://artsandculture.google.com/story/leonardo-and-the-military-engineering/BgVx_Ikfu3ohIg?hl=en-GB"
    },
    {
      "title": "Dev arbalet model kaydı — Lombardia",
      "url": "https://www.lombardiabeniculturali.it/scienza-tecnologia/schede/ST070-00100/"
    }
  ],
  "chukonu": [
    {
      "title": "Tekrarlayan arbalet 2007.10.1 — Musée de l’Archerie",
      "url": "https://www.musee-archerie-valois.fr/en/2021/10/01/repeating-crossbow/"
    }
  ],
  "helepolis": [
    {
      "title": "Helepolis koleksiyon kaydı — Kotsanas",
      "url": "https://collection.kotsanasmuseum.com/en/exhibits/106078/"
    },
    {
      "title": "Rekonstrüksiyonun ön ve arka fotoğrafları — Kotsanas",
      "url": "https://kotsanas.com/el/exhibits/military/helepolis-epimachus/"
    }
  ],
  "organ33": [
    {
      "title": "Leonardo askerî tasarımları — Museo Scienza",
      "url": "https://artsandculture.google.com/story/leonardo-and-the-military-engineering/BgVx_Ikfu3ohIg?hl=en-GB"
    },
    {
      "title": "33 namlulu model — Argan Giovenale / Museo Scienza",
      "url": "https://artsandculture.google.com/asset/organo-a-trentatre-canne-0111/ywGcPElzcqJvUA"
    }
  ],
  "swordpistol": [
    {
      "title": "Birleşik av silahı 2018.371 — The Met",
      "url": "https://www.metmuseum.org/art/collection/search/785931"
    }
  ],
  "ballista": [
    {
      "title": "Roma ballistasının arkeolojik bağlamı — English Heritage",
      "url": "https://www.english-heritage.org.uk/visit/places/maiden-castle/history/",
      "note": "Ek okuma: tarihsel bağlam ve karşılaştırma. Modelin tüm ayrıntılarının birebir referansı değildir."
    }
  ],
  "trebuchet": [
    {
      "title": "Orta Çağ kuşatma makineleri — English Heritage",
      "url": "https://www.english-heritage.org.uk/learn/story-of-england/medieval/siege-warfare/?epsremainingpath=%2F",
      "note": "Ek okuma: tarihsel bağlam ve karşılaştırma. Modelin tüm ayrıntılarının birebir referansı değildir."
    }
  ],
  "sahi": [
    {
      "title": "1464 Dardanelles Gun arşiv fotoğrafı — Historic England",
      "url": "https://historicengland.org.uk/images-books/photos/item/AA077288",
      "note": "Ek okuma: tarihsel bağlam ve karşılaştırma. Modelin tüm ayrıntılarının birebir referansı değildir."
    }
  ],
  "tiger": [
    {
      "title": "Tiger I / Tiger 131 — The Tank Museum",
      "url": "https://tankmuseum.org/tank-nuts/tank-collection/tiger-i?tpage=5",
      "note": "Ek okuma: tarihsel bağlam ve karşılaştırma. Modelin tüm ayrıntılarının birebir referansı değildir."
    }
  ],
  "spitfire": [
    {
      "title": "Spitfire Mk.IX — The Museum of Flight",
      "url": "https://www.museumofflight.org/exhibits-and-events/aircraft/supermarine-spitfire-mkix",
      "note": "Ek okuma: tarihsel bağlam ve karşılaştırma. Modelin tüm ayrıntılarının birebir referansı değildir."
    }
  ],
  "leonardo": [
    {
      "title": "Zırhlı araç ve askerî tasarımlar — Museo Scienza",
      "url": "https://artsandculture.google.com/story/leonardo-and-the-military-engineering/BgVx_Ikfu3ohIg?hl=en-GB",
      "note": "Ek okuma: tarihsel bağlam ve karşılaştırma. Modelin tüm ayrıntılarının birebir referansı değildir."
    }
  ],
  "kadirga": [
    {
      "title": "Tarihi Kadırga araştırması — Vakıflar Dergisi",
      "url": "https://dergipark.org.tr/tr/pub/vakiflar/article/439133",
      "note": "Ek okuma: tarihsel bağlam ve karşılaştırma. Modelin tüm ayrıntılarının birebir referansı değildir."
    }
  ],
  "gatling": [
    {
      "title": "1862 Gatling patenti — US36836A",
      "url": "https://patents.google.com/patent/US36836A/en",
      "note": "Ek okuma: tarihsel bağlam ve karşılaştırma. Modelin tüm ayrıntılarının birebir referansı değildir."
    }
  ],
  "mark1": [
    {
      "title": "Mark I koleksiyonu — The Tank Museum",
      "url": "https://tankmuseum.org/tank-nuts/tank-collection/mark-i?country=all&era=WW1&tname=&tpage=",
      "note": "Ek okuma: tarihsel bağlam ve karşılaştırma. Modelin tüm ayrıntılarının birebir referansı değildir."
    }
  ],
  "fokker": [
    {
      "title": "Fokker Dr.I — ABD Hava Kuvvetleri Müzesi",
      "url": "https://www.nationalmuseum.af.mil/Visit/Museum-Exhibits/Fact-Sheets/Display/Article/197402/AFmuseum/fokker-dr-i/",
      "note": "Ek okuma: tarihsel bağlam ve karşılaştırma. Modelin tüm ayrıntılarının birebir referansı değildir."
    }
  ]
};
  VEHICLES.forEach(v => { v.sources = SOURCES[v.id] || []; });
  window.MUSEUM_CATALOG = { FACETS, VEHICLES };
})();

