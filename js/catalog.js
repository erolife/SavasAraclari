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
      { key: 'usa', label: 'ABD' }
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

    // ===================================================================== 2. GRUP (PLANLI)
    {
      id: 'leonardo', group: 2, status: 'planned',
      year: 1487, yearLabel: '~1487', eraLabel: 'RÖNESANS',
      domain: 'land', era: 'gunpowder', energy: ['muscle', 'gunpowder'], role: ['armor'], origin: 'italy',
      name: 'Leonardo da Vinci\'nin Zırhlı Aracı', sub: 'CRANK & GEAR DRIVE • KONİK AHŞAP ZIRH',
      desc: 'Leonardo\'nun defterlerindeki, çevresine hafif toplar dizilmiş konik ahşap zırhlı araç. İçerideki adamlar krankları çevirerek tekerlekleri döndürür. Çizimdeki dişli düzeni, ön ve arka tekerlekleri zıt yönde döndürecek şekildedir; bu bir tasarım hatası mı yoksa bilinçli bir "güvenlik kilidi" mi, hâlâ tartışılır.',
      tags: ['Krank & Dişli Aktarma', 'Konik Ahşap Zırh', 'Çevresel Toplar', 'Ters Dişli Bilmecesi'],
      specs: [['TAHRİK', 'İnsan gücü (krank)'], ['SİLAH', 'Çevresel hafif toplar'], ['DURUM', 'Yalnızca çizim (inşa edilmedi)'], ['ÖNE ÇIKAN', 'Çizim ⇄ düzeltilmiş dişli']],
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
      id: 'kadirga', group: 2, status: 'planned',
      year: 1571, yearLabel: '1571', eraLabel: 'BARUT ÇAĞI',
      domain: 'sea', era: 'gunpowder', energy: ['gunpowder', 'muscle'], role: ['artillery'], origin: 'ottoman',
      name: 'Osmanlı Kadırgası & Baş Topu (İnebahtı)', sub: 'OARED WAR GALLEY • KIZAKLI BAŞ TOPU',
      desc: 'Akdeniz\'in kürekli savaş gemisi. Ana silahı, pruvada omurga doğrultusunda kızak üzerine yerleştirilmiş ağır baş topudur; gemi bu topu hedefe çevirmek için bütünüyle döndürülür. 1571 İnebahtı, kadırgaların son büyük deniz savaşlarından biridir.',
      tags: ['Kızaklı Baş Topu', 'Kürek Düzeni', 'Mahmuz & Pruva', 'Halat-Palanga Freni'],
      specs: [['TAHRİK', 'Kürek & Yelken'], ['ANA SİLAH', 'Pruvada kızaklı baş topu'], ['SAVAŞ', 'İnebahtı (1571)'], ['ÖNE ÇIKAN', 'Kürek temposu + geri tepme']],
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
      id: 'gatling', group: 2, status: 'planned',
      year: 1862, yearLabel: '1862', eraLabel: 'SANAYİ DEVRİMİ',
      domain: 'land', era: 'industrial', energy: ['gunpowder', 'muscle'], role: ['smallarms'], origin: 'usa',
      name: 'Gatling Makineli Silahı (1862)', sub: 'HAND-CRANKED ROTARY GUN • 6 NAMLU',
      desc: 'Richard Gatling\'in 1862\'de patentini aldığı el krankıyla çalışan döner namlulu silah. Namlular döndükçe her birinin kilidi eğik bir kam oluğu boyunca ileri-geri itilir: mermiyi yerleştirir, ateşler ve boş kovanı çıkarır. Her namlu soğumak için zaman bulur.',
      tags: ['6 Döner Namlu', 'Helisel Kam & Kilitler', 'El Krankı', 'Yerçekimli Şarjör'],
      specs: [['NAMLU', '6'], ['TAHRİK', 'El krankı'], ['BESLEME', 'Yerçekimli şarjör'], ['ATIŞ HIZI', '~200/dk (ilk model, yaklaşık)']],
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
      id: 'mark1', group: 2, status: 'planned',
      year: 1916, yearLabel: '1916', eraLabel: 'I. DÜNYA SAVAŞI',
      domain: 'land', era: 'ww1', energy: ['ice', 'gunpowder'], role: ['armor'], origin: 'uk',
      name: 'İngiliz Mark I Tankı ("Male")', sub: 'RHOMBOID TRACKS • 2 × 6-POUNDER SPONSON',
      desc: 'Eylül 1916\'da Somme\'da ilk kez savaşa giren, tarihin ilk muharebe tankı. Gövdeyi çepeçevre saran eşkenar dörtgen paletler siperleri aşmak için tasarlandı. Yanlardaki çıkıntılı yuvalarda (sponson) toplar bulunur; aracı yönlendirmek için birkaç mürettebatın uyum içinde çalışması gerekirdi.',
      tags: ['Eşkenar Dörtgen Palet', 'Sponson Topları', 'Daimler Motor', 'Siper Aşma'],
      specs: [['AĞIRLIK', '~28 t'], ['MOTOR', 'Daimler, ~105 BG'], ['MÜRETTEBAT', '8'], ['HIZ', '~6 km/sa']],
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
      id: 'fokker', group: 2, status: 'planned',
      year: 1917, yearLabel: '1917', eraLabel: 'I. DÜNYA SAVAŞI',
      domain: 'air', era: 'ww1', energy: ['ice', 'gunpowder'], role: ['aircraft'], origin: 'germany',
      name: 'Fokker Dr.I Üç Kanatlı Avcı', sub: 'OBERURSEL ROTARY ENGINE • SENKRONİZE MAKİNELİ TÜFEK',
      desc: 'Üç kanatlı yapısıyla çok çevik bir avcı. Döner (rotary) motorunda krank mili sabittir; silindirler pervaneyle birlikte döner. İki makineli tüfek, pervane palları önlerindeyken ateşlemeyi durduran bir senkronizasyon düzeneğiyle pervanenin içinden ateş eder. "Kızıl Baron" Manfred von Richthofen ile özdeşleşmiştir.',
      tags: ['Döner (Rotary) Motor', 'Senkronizasyon Dişlisi', 'Üç Kanat', '2 × 7,92 mm MG'],
      specs: [['MOTOR', 'Oberursel Ur.II, ~110 BG'], ['SİLAH', '2 × 7,92 mm (senkronize)'], ['AZAMİ HIZ', '~185 km/sa'], ['ÖNE ÇIKAN', 'Senkronizasyon açık/kapalı']],
      tag: 'FOKKER-DR1-1917', icon: '🛩️',
      modal: [
        'Üç kanat, gövde kafes iskeleti ve kumaş kaplama (X-Ray)',
        'Oberursel döner motor: pervaneyle birlikte dönen 9 silindir, sabit krank',
        'Etkileşim: senkronizasyon açık/kapalı — kapalıyken kurşunların pervaneye isabeti',
        'Kumanda yüzeyleri ve kokpit; iki makineli tüfek salvosu'
      ],
      svg: '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="20" y1="124" x2="300" y2="124" stroke="#94a3b8" stroke-dasharray="4 4"/><rect x="95" y="28" width="130" height="9" rx="4" fill="#dc2626" fill-opacity="0.25" stroke="#7f1d1d" stroke-width="2"/><rect x="100" y="56" width="120" height="9" rx="4" fill="#dc2626" fill-opacity="0.25" stroke="#7f1d1d" stroke-width="2"/><rect x="105" y="84" width="110" height="9" rx="4" fill="#dc2626" fill-opacity="0.25" stroke="#7f1d1d" stroke-width="2"/><line x1="130" y1="37" x2="130" y2="84" stroke="#334155" stroke-width="1.6"/><line x1="195" y1="37" x2="195" y2="84" stroke="#334155" stroke-width="1.6"/><path d="M70 70 L240 64 L285 70 L240 76 Z" fill="#64748b" fill-opacity="0.25" stroke="#1e293b" stroke-width="2"/><circle cx="72" cy="70" r="14" stroke="#0284c7" stroke-width="2"/><line x1="58" y1="40" x2="58" y2="100" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/><g stroke="#d97706" stroke-width="2"><line x1="110" y1="62" x2="84" y2="62"/><line x1="110" y1="66" x2="84" y2="66"/></g><circle cx="150" cy="114" r="9" stroke="#1e293b" stroke-width="2"/><circle cx="170" cy="114" r="9" stroke="#1e293b" stroke-width="2"/></svg>'
    }
  ];

  window.MUSEUM_CATALOG = { FACETS, VEHICLES };
})();

