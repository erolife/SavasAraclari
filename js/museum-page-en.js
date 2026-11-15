(function () {
  'use strict';
  const english = window.MuseumPreferences?.language === 'en';
  const entries = `
Eskiden Bugüne Savaş Makineleri — İnteraktif 3D Mühendislik & Teardown Müzesi|Machines That Changed Warfare — Interactive 3D Engineering Museum
Eskiden Bugüne Savaş Makineleri|Machines That Changed Warfare
İnteraktif 3D Mühendislik, Kesit ve Parçalama Müzesi|Interactive museum of 3D engineering, cutaways and disassembly
Müze Kataloğu & Filtreler|Museum catalogue & filters
Tarih Çizelgesi|Timeline
Türk Tarihi Rotası|Turkish History Trail
Araçları karşılaştır|Compare exhibits
💡 Yeni Araç Talep Et|💡 Suggest an exhibit
⚙️ PROSEDÜREL CAD & TEARDOWN SİMÜLATÖRÜ|⚙️ PROCEDURAL CAD & TEARDOWN SIMULATOR
Savaş Tarihini Değiştiren Makinelerin|Explore the machines
Kalbine İnin.|that changed warfare.
Antik Roma'nın burulma yaylı|From the Roman torsion
'sından, 1453 İstanbul Kuşatması'nın dev bronz| to the giant bronze
'na ve II. Dünya Savaşı'nın 57 tonluk| associated with the siege of Constantinople and the 57-ton
tankına kadar tarihsel mühendislik harikalarını 3 boyutlu olarak parçalarına ayırın, X-Ray kesitlerini inceleyin ve mekanizmalarını canlı çalıştırın.|tank of World War II, take apart historical machines in 3D, explore cutaways and see their mechanisms in motion.
Şahi Topu|Şahi cannon
Türk Tarihi Rotası →|Explore the Turkish History Trail →
Tarih Çizelgesini Keşfet →|Explore the timeline →
🔥 1942 Tiger I Simülatörü|🔥 1942 Tiger I simulator
🏺 1453 Şahi Topu Simülatörü (Yeni!)|🏺 Şahi cannon simulator
🩻 X-Ray Kesit Modu|🩻 X-Ray cutaway
📜 Tarihsel Katalog|📜 Historical catalogue
Grup|Groups
Bağımsız Mekanik Alt Parça|Independent mechanical assemblies
%100|100%
Sıfır Harici Dosya, Saf Three.js|Procedural Three.js geometry
Araç|Exhibits
Müze koleksiyonu|Museum collection
CANLI 3D VİTRİN: Pz.Kpfw. VI "TIGER I"|LIVE 3D SHOWCASE: Pz.Kpfw. VI "TIGER I"
AKTİF PROTOTİP|INTERACTIVE PREVIEW
🖱️ Fareyle döndürün • Aşağıdan Teardown test edin|🖱️ Drag to rotate • Try disassembly below
🔩 Birleştir (%0)|🔩 Assemble (0%)
💥 Teardown (%80)|💥 Teardown (80%)
Tam Ekran Simülatör →|Full-screen simulator →
MÜZE KATALOĞU • TARİHSEL ZAMAN ÇİZELGESİ|MUSEUM CATALOGUE • HISTORICAL TIMELINE
Kas Gücünden Baruta, V12 Motorlardan Jetlere|From muscle power to gunpowder, from V12s to jets
Araçları kullanım ortamına, dönemine, enerji kaynağına ve görev tipine göre süzün; mühendisliğin çağlar boyunca nasıl evrimleştiğini interaktif modeller üzerinden karşılaştırın.|Filter by environment, era, power source and role to see how engineering evolved through the ages.
🔎 Araç, dönem veya mekanik ara… (ör. palet, burulma, Osmanlı)|🔎 Search exhibits, eras or mechanisms…
Katalogda ara|Search the catalogue
Sıralama|Sort order
Sırala: Kronolojik|Sort: oldest first
Sırala: En Yeni Önce|Sort: newest first
Sırala: Alfabetik|Sort: alphabetical
✕ Filtreleri Temizle|✕ Clear filters
Bu filtrelerle eşleşen araç yok.|No exhibits match these filters.
Bir boyuttan seçim kaldırmayı veya aramayı değiştirmeyi deneyin.|Remove a filter or change your search term.
Filtreleri Temizle|Clear filters
TEARDOWN SİMÜLATÖR MİMARİSİ|THE 3D SIMULATOR
Neden Prosedürel 3D Mühendislik?|How does the 3D museum work?
Milimetrik Teardown (%0 – %100)|Exploded view (0–100%)
Her parça kendi gerçek mühendislik montaj ekseninde (explodeVec) dışarı doğru açılır. Bağlantı kılavuz çizgileriyle hangi dişlinin hangi şafta bağlandığını net olarak takip edebilirsiniz.|Each part moves out along its assembly axis. Guide lines show how gears, shafts and other parts fit together.
X-Ray Zırh Kesiti & CAD Blueprint|X-Ray cutaway & CAD blueprint
Tek tuşla 100mm dış zırh plakalarını şeffaflaştırarak içteki 92 adet 88mm top mermisini, taret sepetini, yangın duvarını ve çalışan V12 motor pistonlarını kesit halinde inceleyin.|Make the Tiger's armour transparent to inspect its turret basket, ammunition stowage, firewall and animated V12 pistons.
Canlı Mekanik & Web Audio Sentezi|Animated mechanisms & Web Audio
Harici ses veya 3D model dosyası olmadan; tarayıcı içinde gerçek zamanlı çalışan pistonlar, burulma çubuğu süspansiyon testi ve 8.8 cm KwK 36 top ateşleme/geri tepme simülasyonu.|See animated pistons, torsion-bar suspension and recoil in the browser. The exhibit builds its geometry and synthesises sound as it runs.
— Three.js & Web Audio API Tabanlı İnteraktif Mühendislik Simülatörü|— Interactive engineering museum built with Three.js and Web Audio
Tiger I 3D Simülatöre Geç →|Open the Tiger I simulator →
FAZ 2 MÜHENDİSLİK PLANI|PHASE 2 ENGINEERING PLAN
Araç Başlığı|Exhibit title
✕ Kapat|✕ Close
PLANLANAN 3D TEARDOWN ALT SİSTEMLERİ & ANİMASYONLAR:|PLANNED ASSEMBLIES & ANIMATIONS
Bu araç planlı; simülatörü hazır araçları hemen deneyimleyebilirsiniz:|This exhibit is planned. You can explore the models already available.
🟢 Simülatörü Hazır Araçları Göster|🟢 Show interactive exhibits
KOLEKSİYONA KATKIDA BULUNUN|CONTRIBUTE TO THE COLLECTION
💡 Yeni Savaş Makinesi / Araç Talep Formu|💡 Suggest an exhibit
3D Teardown müzemizde parçalarına ayrılmış ve çalışan mekanizmasıyla görmek istediğiniz tarihsel aracı önerin.|Suggest a historical machine you would like to explore in the 3D museum.
Web Sitesi|Website
Araç veya Silah Adı *|Vehicle or machine name *
Örn: 1515 Yavuz Sultan Selim Darbzen Topu, B-17 Flying Fortress, T-34/85...|e.g. B-17 Flying Fortress, T-34/85
Dönemi / Yaklaşık Yılı *|Era or approximate year *
Örn: MÖ 212, 1526, II. Dünya Savaşı (1943)|e.g. 212 BCE, 1526, World War II (1943)
Kullanım Ortamı *|Operating environment *
🪖 Kara (Tank, Topçu, Kuşatma, Piyade)|🪖 Land (armour, artillery, siege, infantry)
⚓ Deniz (Kadırga, Zırhlı, Denizaltı)|⚓ Sea (galley, battleship, submarine)
✈️ Hava (Avcı, Bombardıman, Helikopter, Motor)|✈️ Air (fighter, bomber, helicopter, engine)
🚀 Uzay & Balistik Roket|🚀 Space & rocketry
🔐 Diğer (İstihbarat, Radar, Lojistik)|🔐 Other (intelligence, radar, logistics)
Öne Çıkarılması İstenen Mekanizma / Neden Eklenmeli? *|What should the exhibit highlight? *
Örn: Christie süspansiyon yaylarının X-Ray'de çalışması, Norden bomba nişangâhının jiroskop dişlileri veya Yunan ateşi sifon pompası...|e.g. a cutaway showing the movement of Christie suspension springs
Referans / Kaynak Linki|Reference link
(İsteğe bağlı — Müze, Wikipedia, Teknik Çizim)|(Optional — museum, encyclopedia or drawing)
Adınız / Rumuzunuz|Name or nickname
(İsteğe bağlı)|(Optional)
Örn: Ahmet Y.|e.g. Alex
E-posta veya İletişim|Email or contact details
Araç eklendiğinde haber vermemiz için|So we can tell you if your exhibit is added
Vazgeç|Cancel
🚀 Talebi Gönder|🚀 Submit suggestion
📋 BU TARAYICIDAN GÖNDERDİĞİNİZ TALEPLER (|📋 SUGGESTIONS FROM THIS BROWSER (
Paylaş ↗|Share ↗
Kaynaklar|Sources
← 3D müzeye dön|← Back to the 3D museum
Koleksiyon ↗|Collection ↗
Enigma — Bir Harfin Yolculuğu|Enigma — The Journey of a Letter
SAVAŞ TARİHİNİ DEĞİŞTİREN MAKİNELER / 18|MACHINES THAT CHANGED WARFARE / 18
ELEKTROMEKANİK BİR HİKÂYE · ENIGMA I|AN ELECTROMECHANICAL STORY · ENIGMA I
Bir harfin|The journey
yolculuğu.|of a letter.
Tuşa dokun. Rotorların adımını izle.|Press a key. Watch the rotors step.
Aynı harfin neden farklı bir lambayı yaktığını keşfet.|Discover why the same letter lights a different lamp.
Enigma üç boyutlu modeli|3D model of Enigma
01 / MAKİNE|01 / MACHINE
Ahşap kasa · Enigma I|Wooden case · Enigma I
Müze modeli hazırlanıyor…|Preparing the museum model…
Genel görünüm|Overview
Rotorlara yaklaş|Zoom in on the rotors
İç yapıyı aç|Show the interior
Kapak|Lid
Ahşap kapak açısı|Wooden lid angle
Sürükle: döndür · Tekerlek / iki parmak: yakınlaştır|Drag to rotate · Scroll or pinch to zoom
Büyütülmüş müze rekonstrüksiyonu. Sayısal rotor halkaları, ahşap kapak ve fiş tahtası. Renkli yollar elektrik sırasını açıklar; fiziksel kablo güzergâhı değildir.|Enlarged museum reconstruction with numbered rotor rings, wooden lid and plugboard. Coloured paths show the sequence of the electrical circuit.
02 / ŞİFRELEME MASASI|02 / CIPHER DESK
Güncel rotor konumları|Current rotor positions
Lamba paneli|Lampboard
Enigma klavyesi|Enigma keyboard
Tuşları tıklayın veya fiziksel klavyenizde A–Z kullanın.|Click the keys or press A–Z on your keyboard.
GİRİŞ|INPUT
ÇIKIŞ|OUTPUT
İlk harfi bekliyor. Varsayılan ayar: I · II · III / AAA / B.|Waiting for the first letter. Default: I · II · III / AAA / B.
Bir mesaj dene|Try a message
MERHABA|HELLO
Türkçe harfler sadeleştirilir; A–Z dışındaki karakterler atlanır. En fazla 240 harf.|Turkish letters are normalised and characters outside A–Z are skipped. Up to 240 letters.
Metni sırayla işle →|Process message →
Çıktıyı aynı ayarla çöz|Decode the output with the same settings
Başlangıca dön|Reset
Makine ayarları|Machine settings
Rotorlar · Halkalar · Fişler|Rotors · Rings · Plugs
Sol rotor|Left rotor
Orta rotor|Middle rotor
Sağ rotor|Right rotor
Başlangıç|Starting positions
Halkalar|Ring settings
Yansıtıcı|Reflector
Fiş çiftleri|Plug pairs
Soldan sağa rotor sırası. Her harf yalnız bir çifte bağlanabilir. A–Z gösterimi, makinenin 01–26 halkalarına karşılık gelir.|Rotors are listed left to right. Each letter can belong to one pair. A–Z corresponds to machine ring settings 01–26.
Ayarları uygula ve sıfırla|Apply settings and reset
Örnek: AAAAA → BDZGO|Example: AAAAA → BDZGO
Çift adımlamayı keşfet|Explore double stepping
03 / GİDİŞ VE DÖNÜŞ|03 / OUTWARD AND RETURN
Elektriğin izini sür.|Trace the electrical circuit.
▶ Yolu oynat|▶ Play circuit
Sonraki aşama →|Next stage →
Bir tuşa basınca dokuz aşama burada açılır. Önce rotorlar ilerler, ardından elektrik devresi tamamlanır.|Press any key to reveal nine stages. The rotors step first, then the electrical circuit closes.
Elektrik yolu aşamaları|Circuit stages
MAKİNENİN ÖTESİNDE|BEYOND THE MACHINE
Bu hikâye insanlarla tamamlanır.|The people behind the breakthrough
Enigma’nın çözülmesi tek bir kişinin başarısı değildi. Marian Rejewski, Jerzy Różycki ve Henryk Zygalski’nin Polonya’daki çalışmaları; Alan Turing, Gordon Welchman ve geniş Müttefik ekiplerin çalışmalarıyla devam etti. Burada bir şifreleme makinesini kullanıyorsunuz; Bombe şifre çözme makinesi ayrı bir sistemdi.|Polish cryptanalysts Marian Rejewski, Jerzy Różycki and Henryk Zygalski laid foundations later built on by Alan Turing, Gordon Welchman and other Allied teams. Enigma enciphered messages. The Bombe helped recover their settings.
Makine: Crypto Museum ↗|Machine: Crypto Museum ↗
Devre ve çift adımlama ↗|Circuit and double stepping ↗
Tarih: British Library ↗|History: British Library ↗
ENIGMA I · Etkileşimli müze çalışması|ENIGMA I · Interactive museum exhibit
Model ve hesaplama aynı rotor durumunu paylaşır.|The 3D model and the cipher share the same rotor state.
Müze gezinmesi|Museum navigation
← Envanter|← Collection
SAVAŞ MAKİNELERİ / KARŞILAŞTIRMA 01|MACHINES THAT CHANGED WARFARE / COMPARISON 01
Maxim’i incele ↗|Explore the Maxim ↗
1862 → 1884 · OTOMATİKLEŞMENİN EŞİĞİ|1862 → 1884 · THE STEP TOWARDS AUTOMATION
Kranktan|From crank
geri tepmeye.|to recoil.
İki silah da ateşin sürekliliğini artırdı. Maxim’in belirleyici farkı, her çevrim için insanın kol çevirmesine ihtiyaç duymamasıydı.|Both machines sustained fire. The Maxim could cycle without an operator turning a crank.
İki yaklaşım|Two approaches
01 / İNSAN GÜCÜ|01 / HUMAN POWER
1862 patenti|1862 patent
El krankı, çoklu namlu ve tekerlekli taşıyıcısıyla Gatling silueti|Gatling silhouette showing the crank, barrel cluster and wheeled carriage
Operatör krankı çevirir; namlu demeti döner. Dışarıdan sağlanan mekanik hareket, çevrimi sürdürür.|The operator turns the crank, rotating the barrel cluster and providing the power for each cycle.
Gatling’in 3D modelini aç|Open the Gatling in 3D
02 / GERİ TEPME ENERJİSİ|02 / RECOIL ENERGY
1884 patenti|1884 patent
Pirinç su ceketi, tek namlusu ve mühimmat şeridiyle Maxim silueti|Maxim silhouette showing the brass water jacket, single barrel and belt
Tek namlu, su ceketi ve şerit besleme. Ateşlemenin geri tepme enerjisi, otomatik çevrimin kaynağıdır.|A single barrel, water jacket and belt feed. Recoil provides energy for the automatic cycle.
Maxim’in 3D modelini aç|Open the Maxim in 3D
DÖNÜM NOKTASI|THE CHANGE
Hareketin kaynağı değişiyor.|Where the energy comes from
Bu akış yalnızca enerji kaynağını anlatır; parça sırası veya gerçek atış temposu göstermez.|This illustration traces the source of energy through each system.
Enerji akışını göster|Show energy flow
İnsan|Person
Krank|Crank
Döner demet|Rotating cluster
Ateşleme|Discharge
Geri tepme|Recoil
Otomatik çevrim|Automatic cycle
Akış duraklatıldı.|Flow paused.
YAN YANA|SIDE BY SIDE
Aynı soruna iki farklı yaklaşım.|Two approaches to the same problem
Karşılaştırma, envanterdeki Gatling ve 1895 sonrası Maxim-Nordenfelt yorumları içindir.|The comparison covers the Gatling and the later Maxim-Nordenfelt represented in the collection.
Özellik|Feature
Çevrimin enerjisi|Cycle energy
Elle çevrilen krank|Hand crank
Ateşlemenin geri tepmesi|Recoil from discharge
Namlu düzeni|Barrel arrangement
Birlikte dönen altı namlu|Six barrels rotating together
Tek namlu|Single barrel
Besleme yaklaşımı|Feed
Üstten, yerçekiminden yararlanan besleme|Gravity feed from above
Yandan geçen mühimmat şeridi|Belt fed from the side
Isının yönetimi|Cooling
Yükün birden çok namluya dağılması|Heat spread over several barrels
Namlu çevresinde su ceketi|Water jacket around the barrel
Operatörün rolü|Operator's role
Krankı çevirmek ve silahı yönetmek|Turn the crank and operate the gun
Ateşi yönetmek; ikmal ve soğutmayı sürdürmek|Control fire and maintain supply and cooling
Tarihsel eşik|Historical transition
Mekanik olarak tekrarlanan ateş|Mechanically repeated fire
Kendi çevrimini sürdüren otomatik ateş|Self-powered automatic fire
NEDEN TARİHİ DEĞİŞTİRDİ?|WHY DID IT CHANGE HISTORY?
Bir icattan daha büyük bir değişim.|A change larger than one invention
Maxim, sömürge savaşlarında ateş gücü eşitsizliğinin simgelerinden oldu. Bu etkiyi tek başına bir silahın başarısı gibi okumak; örgütlenme, eğitim, ikmal ve çatışmaların insan bedelini gözden kaçırır.|The Maxim became a symbol of unequal firepower in colonial wars. Its impact also depended on organisation, training and logistics, and came with a human cost.
Maxim’den geliştirilen Vickers gibi silahlar, Birinci Dünya Savaşı’nın endüstriyel ateş gücünde yer aldı. Otomatikleşme, silahın yanı sıra mühimmat tedarikini, soğutmayı ve ekip çalışmasını da savaşın merkezine taşıdı.|Weapons derived from the Maxim, including the Vickers, helped shape industrial firepower in World War I. Automatic fire made ammunition supply, cooling and teamwork central to its use.
1884 icadın patent tarihidir. Sergilenen 3D yorum, 1895 sonrası Maxim-Nordenfelt örneğine dayanır; 1884 prototipinin birebir kopyası değildir. Çizimler karşılaştırma için hazırlanmış siluetlerdir.|The patent dates to 1884. The 3D exhibit represents a Maxim-Nordenfelt from after 1895. The silhouettes were drawn for this comparison.
Kaynaklar ve görsel referans|Sources and visual references
Maxim-Nordenfelt örneğinin fotoğrafları, ölçüleri ve katalog kimliği. Fotoğraflar bu sitede yeniden yayımlanmamıştır.|Photographs, dimensions and collection record for the Maxim-Nordenfelt.
National Army Museum · Maxim’in gelişimi ↗|National Army Museum · Development of the Maxim ↗
1884 patenti, geri tepme prensibi ve sömürge savaşları. Bu sayfadaki Extra Light, farklı bir sürümdür.|The 1884 patent, recoil principle and colonial wars. The catalogue shows the Extra Light variant.
Richard Gatling · 1862 patenti ↗|Richard Gatling · 1862 patent ↗
Döner namlu demeti ve mekanik çevrim için tarihsel belge.|Historical document on the rotating barrels and mechanical cycle.
Royal Armouries · Birinci Dünya Savaşı silahları ↗|Royal Armouries · World War I weapons ↗
Maxim’den Vickers’a gelişim ve savaş bağlamı.|Development from Maxim to Vickers in wartime context.
Savaş Makineleri · İnteraktif Müze|Machines That Changed Warfare · Interactive Museum
Maxim’i incelemeye dön →|Return to the Maxim →
`;
  const dictionary = new Map(entries.trim().split('\n').map(line => {
    const separator = line.indexOf('|');
    return [line.slice(0, separator), line.slice(separator + 1)];
  }));
  dictionary.set('Gatling → Maxim | Savaş Makineleri', 'Gatling → Maxim | Machines That Changed Warfare');
  function translate(value) { return english ? dictionary.get(value.trim().replace(/\s+/g, ' ')) || value : value; }
  function localize() {
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement.closest('script, style, svg, [lang="tr"]')) continue;
      const translated = translate(node.data);
      if (translated !== node.data) node.data = node.data.match(/^\s*/)[0] + translated + node.data.match(/\s*$/)[0];
    }
    for (const el of document.querySelectorAll('[aria-label], [title], [placeholder], [alt]')) {
      for (const attribute of ['aria-label', 'title', 'placeholder', 'alt']) {
        if (el.hasAttribute(attribute)) el.setAttribute(attribute, translate(el.getAttribute(attribute)));
      }
    }
  }
  if (english) localize();
})();
