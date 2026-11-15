(function () {
  'use strict';

  // Each pair contains the Turkish and English exhibit cards in display order.
  window.MuseumViewCopy = {
    enigma: [
      ['Enigma I, tuşları ve ışıklı harf paneli olan elektromekanik bir şifreleme makinesiydi.', 'Alman askerî haberleşmesini korudu. Polonyalı ve Müttefik ekiplerin şifreyi çözmesi savaş istihbaratını etkiledi.', 'Bir tuşa basınca rotorlar ilerler. Elektrik rotorlar ve yansıtıcıdan geçip çıkış harfinin lambasını yakar.', 'Tuş sıralarıyla kapağın altındaki rotor pencerelerini karşılaştır.'],
      ['Enigma I was an electromechanical cipher machine with a keyboard and a panel of letter lamps.', 'It protected German military communications. Work by Polish and Allied codebreakers shaped wartime intelligence.', 'A key press advances the rotors. The electrical signal passes through the rotors and reflector, lighting the output letter.', 'Compare the keyboard rows with the rotor windows beneath the lid.']
    ],
    nusret: [
      ['Nusret, Osmanlı donanmasında görev yapan küçük bir buharlı mayın gemisiydi.', '8 Mart 1915’te Erenköy Koyu’na döktüğü mayınlar, Çanakkale deniz muharebelerinin seyrini etkiledi.', 'Güverte rayları yükün kıça taşınmasını sağlıyordu. Buhar makineleri iki pervane miline güç veriyordu.', 'Köprüüstünün arkasından kıça doğru uzanan güverte raylarını bul.'],
      ['Nusret was a small steam-powered minelayer in the Ottoman Navy.', 'The mines it laid in Erenköy Bay on 8 March 1915 helped shape the naval battles of the Dardanelles.', 'Deck rails let the crew move the load towards the stern. Steam engines drove the two propeller shafts.', 'Find the deck rails extending from behind the bridge towards the stern.']
    ],
    dragonmace: [
      ['12–13. yüzyıl Anadolu’sından, ejder biçimli bir döküm gürz başının modelidir.', 'Bu eser, Selçuklu metal işçiliğinde silah biçimi ile hayvan bezemesinin nasıl birleştiğini gösterir.', 'Ejderin açık ağzı dökümün parçasıdır. Sergi, küçük hayvan motifinin baş üzerindeki konumunu yakından gösterir.', 'Ejderin ağzının içinde duran küçük hayvan motifini bul.'],
      ['This model represents a cast dragon-shaped mace head from 12th–13th-century Anatolia.', 'The object shows how Seljuk metalworkers combined the form of a weapon with animal ornament.', 'The dragon’s open mouth is part of the casting. The exhibit offers a close look at where the small animal sits on the head.', 'Find the small animal motif inside the dragon’s mouth.']
    ],
    ballista: [
      ['Roma ordularının kullandığı, ahşap ayaklı bir fırlatma makinesi.', 'Roma topçuluğunda zanaat ve standart parça düzeninin yerini gösterir.', 'Bükülmüş lif demetleri yay kollarına hareket verir.', 'İki yay kolunun gövdeye girdiği yuvalara bak.'],
      ['A Roman projectile engine on a wooden stand.', 'It shows the place of craftsmanship and repeatable construction in Roman artillery.', 'Twisted fibre bundles drive the two arms.', 'Find the sockets where the two arms enter the frame.']
    ],
    trebuchet: [
      ['Ağır karşı ağırlığı olan bir Orta Çağ kuşatma makinesi.', 'Taş kalelerin çevresinde kurulan büyük ahşap düzeneklerin ölçeğini gösterir.', 'Ağırlık inerken uzun kol mafsal çevresinde döner.', 'Kolun iki ucundaki uzunluk farkına bak.'],
      ['A medieval siege engine with a heavy counterweight.', 'It shows the scale of the wooden machinery built around stone fortifications.', 'As the weight falls, the long arm rotates around its pivot.', 'Compare the lengths of the arm on either side of the pivot.']
    ],
    sahi: [
      ['1464 tarihli Dardaneller Topu, iki parçalı döküm tunç bir kuşatma topudur.', 'Osmanlı dökümcülüğünün ölçeğini ve ağır top taşımacılığını gösterir.', 'Ön ve arka döküm tek bir gövde oluşturacak biçimde birleşir.', 'İki tunç parçanın arasındaki birleşim çizgisini bul.'],
      ['The Dardanelles Gun is a two-part bronze bombard dated 1464.', 'It shows the scale of Ottoman foundry work and the challenge of moving heavy guns.', 'Two cast sections join to form the body.', 'Find the seam between the bronze sections.']
    ],
    tiger: [
      ['Tiger I, Almanya’nın İkinci Dünya Savaşı dönemindeki ağır tanklarından biridir.', 'Ağır zırhın taşıma, bakım ve üretim üzerindeki yükünü gösterir.', 'Motor ve aktarma organları, geniş paletleri hareket ettirir.', 'Tekerleklerin yan görünüşte nasıl üst üste geldiğine bak.'],
      ['The Tiger I was a German heavy tank of the Second World War.', 'It illustrates how heavy armour affects transport, maintenance and production.', 'The engine and transmission drive its wide tracks.', 'Look for the overlapping road wheels in profile.']
    ],
    spitfire: [
      ['Spitfire Mk IX, piston motorlu ve eliptik kanatlı bir avcı uçağıdır.', 'Mk IX, savaş sırasında mevcut bir tasarımın yeni motorlarla nasıl geliştirildiğini gösterir.', 'Merlin motoru pervaneyi döndürür. Kanat ve kuyruktaki yüzeyler uçağı yönlendirir.', 'Kanadın dış kenarını ve eliptik çizgisini takip et.'],
      ['The Spitfire Mk IX is a piston-engined fighter with an elliptical wing.', 'The Mk IX illustrates how an aircraft design could evolve through wartime engine upgrades.', 'The Merlin engine turns the propeller. Control surfaces on the wings and tail steer the aircraft.', 'Trace the elliptical outline of the wing.']
    ],
    leonardo: [
      ['Leonardo’nun çizimlerine dayanan konik zırhlı araç sergisi.', 'Rönesans çizimlerinin, dönemin üretim sınırlarını aşan fikirleri nasıl kayda geçirdiğini gösterir.', 'İçerideki kranklar ve dişliler, tekerleklere hareket aktarmak üzere tasarlanmıştı.', 'Konik kabuğun altından görünen tekerleklere bak.'],
      ['A conical armoured vehicle exhibit based on Leonardo’s drawings.', 'It shows how Renaissance drawings recorded ideas beyond what builders could readily make.', 'Internal cranks and gears were intended to drive the wheels.', 'Look for the wheels beneath the conical shell.']
    ],
    kadirga: [
      ['Osmanlı kürekli kadırgasının baş ve orta bölümünü gösteren bir kesit.', 'Kürek gücüyle hareket eden savaş gemilerinde insan emeğinin ölçeğini gösterir.', 'Kürekler uzun bir güverte boyunca sıralanır. Baş tarafında top ve taşıyıcı düzeni bulunur.', 'İki yandaki kürek sıralarını ortadaki yürüyüş yoluyla karşılaştır.'],
      ['A section through the bow and centre of an Ottoman oared galley.', 'It shows the scale of human labour aboard oared warships.', 'Oars line the long deck. The bow carries a gun and its supporting structure.', 'Compare the rows of oars with the walkway between them.']
    ],
    gatling: [
      ['Elle çevrilen çok namlulu bir 19. yüzyıl silahı.', 'Tekrarlanan hareketin mekanik olarak düzenlenmesinde bir dönüm noktasıdır.', 'Bir krank dışarıdan hareket verir ve namlu demeti birlikte döner.', 'Namlu demetinin çevresindeki eşit aralıkları fark et.'],
      ['A nineteenth-century hand-cranked, multi-barrel gun.', 'It marks a turning point in the mechanical coordination of repeated motion.', 'A hand crank provides motion and the barrel cluster rotates as a unit.', 'Notice the even spacing around the barrel cluster.']
    ],
    mark1: [
      ['İngiliz Mark I, Birinci Dünya Savaşı’nda kullanılan erken bir paletli tanktır.', 'Siperlerle bölünmüş arazi, ilk tankların alışılmadık gövde biçimini etkiledi.', 'Paletler gövdenin çevresini sarar ve önde yukarı yükselir.', 'Ön palet ucunun gövdeye göre ne kadar yukarıda kaldığına bak.'],
      ['Britain’s Mark I was an early tracked tank used in the First World War.', 'Trenched terrain shaped the unusual profiles of early tanks.', 'The tracks wrap around the entire hull and rise at the front.', 'Notice how high the front of each track sits above the body.']
    ],
    fokker: [
      ['Fokker Dr.I, üç kanatlı ve döner motorlu bir Birinci Dünya Savaşı avcısıdır.', 'Erken havacılıkta mühendisler, manevra ve kaldırma için farklı kanat düzenleri denedi.', 'Üç kanat dikmelerle birbirine bağlanır. Döner motorun silindirleri birlikte hareket eder.', 'Üst ve alt kanatları birbirine bağlayan ince dikmelere bak.'],
      ['The Fokker Dr.I was a First World War triplane fighter with a rotary engine.', 'Early aircraft designers tried different wing arrangements for lift and manoeuvrability.', 'Struts connect the three wings. The rotary engine’s cylinders turn together.', 'Find the slender struts spanning the wings.']
    ],
    monitor: [
      ['USS Monitor, suya yakın güverteli ve döner taretli bir Amerikan zırhlısıydı.', 'Amerikan İç Savaşı’nda zırh ve döner taretin deniz savaşındaki yerini görünür kıldı.', 'Silindir biçimli taret, alçak güverte üzerinde kendi ekseni çevresinde döner.', 'Taretin yüksekliğini geminin suya yakın güvertesiyle karşılaştır.'],
      ['USS Monitor was an American ironclad with a low deck and a rotating turret.', 'In the American Civil War, it demonstrated the role of armour and the revolving turret at sea.', 'The cylindrical turret turns on its axis above the low deck.', 'Compare the height of the turret with the low deck.']
    ],
    katyusha: [
      ['BM-13 Katyuşa, kamyon şasisi üzerinde taşınan bir roketatar sergisidir.', 'İkinci Dünya Savaşı’nda hareketli topçu birliklerinde kamyonların rolünü gösterir.', 'Roketler, kamyon kasasının üzerindeki açık raylarda taşınır.', 'Öndeki kamyon kabiniyle arkadaki rayların ayrı yapılarına bak.'],
      ['The BM-13 Katyusha exhibit shows a rocket launcher mounted on a truck chassis.', 'It illustrates the importance of trucks to mobile artillery in the Second World War.', 'Open rails above the truck bed carry the rockets.', 'Compare the truck cab at the front with the open structure at the back.']
    ],
    v2: [
      ['V-2 roketi ve onu taşıyan Meillerwagen’in yer aldığı bir sergi.', 'V-2, zorla çalıştırmanın ve sivil kayıpların eşlik ettiği bir savaş teknolojisiydi. Daha sonra roketçilik çalışmalarını da etkiledi.', 'Sergi, roketi ve onu yataydan dik konuma kaldıran taşıyıcıyı bir arada gösterir.', 'Uzun taşıyıcı çerçevesini ve üzerindeki mafsalı bul.'],
      ['An exhibit showing the V-2 rocket and its Meillerwagen transporter.', 'The V-2 was a wartime technology linked to forced labour and civilian deaths. It later influenced rocketry.', 'The exhibit places the rocket beside the transporter that raised it from horizontal to vertical.', 'Find the pivot on the long transporter frame.']
    ],
    j79: [
      ['General Electric J79, süpersonik uçaklarda kullanılan eksenel bir turbojettir.', 'Soğuk Savaş’ın yüksek hızlı uçaklarında motor ile gövde tasarımı arasındaki ilişkiyi gösterir.', 'Hava, art arda dizilen kompresör kademelerinden geçer ve egzoz arkadan çıkar.', 'Öndeki kompresör halkalarını arkadaki geniş egzoz bölümüyle karşılaştır.'],
      ['The General Electric J79 is an axial turbojet used in supersonic aircraft.', 'It illustrates how airframe and engine design were linked in high-speed Cold War aircraft.', 'Air passes through successive compressor stages and exits at the rear.', 'Compare the forward compressor rings with the broad exhaust section.']
    ],
    phalanx: [
      ['Phalanx, donanma gemilerinde görülen kısa menzilli bir savunma sistemidir.', 'Gemi savunmasında sensörlerin ve mekanik bileşenlerin tek bir kaidede birleşmesini gösterir.', 'Radar bölümü ve mekanik donanım döner bir platform üzerinde yer alır.', 'Beyaz radar kubbesinin metal kaideye göre boyutuna bak.'],
      ['Phalanx is a short-range defensive system fitted to naval ships.', 'It shows how naval defence brought sensors and machinery onto one mount.', 'The radar and mechanical assemblies sit on a rotating platform.', 'Compare the white radar dome with the metal base below.']
    ],
    huey: [
      ['UH-1H Huey, geniş kabinli, tek ana rotorlu bir helikopterdir.', 'Taşıma ve tıbbi tahliyede helikopter kullanımının yaygınlaşmasını temsil eder.', 'Türbinin hareketi aktarma kutusundan ana rotora ulaşır.', 'Kabinin üstünde yükselen rotor direğinin yerini bul.'],
      ['The UH-1H Huey is a helicopter with a broad cabin and a single main rotor.', 'It represents the growing use of helicopters for transport and medical evacuation.', 'The transmission carries turbine power to the main rotor.', 'Find the rotor mast directly above the cabin.']
    ],
    u505: [
      ['U-505, İkinci Dünya Savaşı döneminden kalma Alman Type IXC denizaltısıdır.', 'Atlantik Savaşı’ndaki denizaltı yaşamına ve 1944’teki ele geçirilme öyküsüne ışık tutar.', 'Yüzeyde dizel, dalışta elektrik tahriki kullanır.', 'Uzun dış gövdenin üzerinde yükselen kumanda kulesini bul.'],
      ['U-505 is a German Type IXC submarine from the Second World War.', 'It brings to view submarine life in the Battle of the Atlantic and the story of its 1944 capture.', 'It used diesel propulsion on the surface and electric propulsion underwater.', 'Find the conning tower above the long outer hull.']
    ],
    lcvp: [
      ['Higgins LCVP, düz tabanlı ve baş rampalı bir çıkarma teknesidir.', 'İkinci Dünya Savaşı çıkarmalarında lojistik ve kıyıya erişim sorunlarını gösterir.', 'Öndeki rampa açıldığında teknenin taşıma bölümü kıyıya bağlanır.', 'Ön rampanın yanındaki dik ve alçak bordaları karşılaştır.'],
      ['The Higgins LCVP is a flat-bottomed landing craft with a bow ramp.', 'It illustrates the challenges of logistics and access in Second World War landings.', 'The forward ramp connects the cargo area to the shore.', 'Look at the short side walls next to the bow ramp.']
    ],
    chainhome: [
      ['Chain Home, Britanya’nın sabit radar kuleleri ve operatör binalarından oluşan erken uyarı ağıydı.', 'Uçakları erken fark etmek, hava savunmasında haberleşme ve ekip çalışmasının önemini artırdı.', 'Ayrı antenler sinyal gönderip yankıları alır. Operatörler bilgiyi izleme ağına aktarır.', 'Farklı biçimdeki verici ve alıcı kuleleri ayırt et.'],
      ['Chain Home was Britain’s early-warning network of fixed radar towers and operator buildings.', 'Early detection made communication and teamwork central to air defence.', 'Separate aerials transmit signals and receive echoes. Operators report what they see to the network.', 'Distinguish the differently shaped transmitter and receiver towers.']
    ],
    scythed: [
      ['Leonardo’nun çizimindeki oraklı savaş arabasının sergi yorumu.', 'Çizimler, savaş teknolojisi üzerine düşünülmüş ve kâğıt üzerinde kalmış fikirleri belgeliyor.', 'Model, tekerleklerle mafsallı kollar arasındaki hareket fikrini görünür kılar.', 'Arabanın altındaki hareketli kollarla tekerlekler arasına bak.'],
      ['An exhibit interpretation of Leonardo’s drawing of a scythed chariot.', 'The sketch records a wartime concept that remained on paper.', 'The model makes visible the idea of a link between wheels and articulated arms.', 'Look between the wheels and the arms beneath the carriage.']
    ],
    hwacha: [
      ['Hwacha, Joseon Kore’sine ait ahşap araba üzerindeki çoklu fırlatma düzeneğidir.', 'Kore askerî zanaatında ahşap, metal ve kâğıdın ortak kullanımını gösterir.', 'Tekerlekli şasi, sıralı açıklıkları olan ayrı bir çerçeveyi taşır.', 'Çerçevedeki tekrarlanan boşlukların düzenini incele.'],
      ['Hwacha is a Joseon Korean launch rack on a wooden cart.', 'It shows how Korean military craftspeople combined wood, metal and paper.', 'The wheeled frame supports a separate rack with repeated openings.', 'Study the pattern of openings in the rack.']
    ],
    atlatl: [
      ['Atlatl, uzun bir dartı taşımak için elde tutulan kısa bir kaldıraçtır.', 'Çeşitli kültürlerde basit ahşap aletlerin hareketi nasıl dönüştürdüğünü gösterir.', 'Ahşap kol ile dart bir temas noktasında birbirine dayanır.', 'Kısa ahşap kolun ve uzun dartın sergideki ölçeğini karşılaştır.'],
      ['An atlatl is a short handheld lever associated with a long dart.', 'It shows how different cultures used simple wooden tools to change movement.', 'The wooden lever and dart meet at a single point of contact.', 'Compare the scale of the short lever and the long dart.']
    ],
    lantern: [
      ['Fenerli kalkan, kalkan yüzeyi ile ele giyilen demir parçayı bir araya getiren bir müze nesnesidir.', 'Rönesans metal işçiliğinde savunma araçlarıyla merak nesnelerinin kesiştiğini gösterir.', 'Kalkanın arkasında bir eldiven ve ışık için kapatılabilir bir açıklık bulunur.', 'Kırmızı astarla demir eldivenin ayrıldığı yere bak.'],
      ['The lantern shield combines a shield face with an iron hand covering.', 'It shows where defensive equipment and Renaissance curiosities met.', 'Behind the shield are an iron glove and an opening for light that can be covered.', 'Find the boundary between the red lining and the iron glove.']
    ],
    polybolos: [
      ['Polybolos, Antik Çağ anlatılarında geçen tekrarlayan bir ok atıcı düzenektir.', 'Sergi, eski mühendislerin eşzamanlı hareket üzerine düşündüğünü gösterir.', 'Yorumda çift zincir ve yivli tambur farklı hareketleri bir araya getirir.', 'İki zincirin tamburun iki yanında nasıl uzandığına bak.'],
      ['The polybolos is a repeating bolt-thrower described in ancient sources.', 'The exhibit shows how ancient engineers thought about coordinated motion.', 'In this reconstruction, paired chains and a grooved drum coordinate movement.', 'Look for the chains running on either side of the drum.']
    ],
    giantbow: [
      ['Leonardo’nun çizimlerinden yorumlanan tekerlekli dev arbalet.', 'Kâğıt üzerindeki ölçek artışının taşıma ve denge sorunlarını nasıl değiştirdiğini gösterir.', 'Büyük katmanlı yay, çok tekerlekli ahşap şasinin üzerine yerleştirilir.', 'Yayın orta bölümündeki katmanlara ve altı destek tekerleğine bak.'],
      ['A wheeled giant crossbow interpreted from Leonardo’s drawings.', 'It shows how scaling a concept on paper changes questions of transport and balance.', 'The large laminated bow sits on a wooden frame with multiple wheels.', 'Find the layers at the centre of the bow and the six supporting wheels.']
    ],
    chukonu: [
      ['Chu-ko-nu, üstünde bir hazne bulunan Çin tekrarlayan arbaletidir.', 'Karmaşık işlerin tek bir tekrarlı el hareketinde birleştirilmesine tarihsel bir örnektir.', 'Üst hazne ve kol aynı gövde üzerinde hareket eder.', 'Haznenin yayın üstündeki konumuna bak.'],
      ['Chu-ko-nu is a Chinese repeating crossbow with a magazine on top.', 'It is a historical example of combining several tasks in a repeated hand motion.', 'The magazine and lever share the same frame.', 'Notice where the magazine sits above the bow.']
    ],
    helepolis: [
      ['Helepolis, antik kaynaklarda anlatılan çok katlı kuşatma kulesidir.', 'Büyük kuşatmaların marangozluk, ulaşım ve ekip emeği gerektirdiğini gösterir.', 'Üst üste katlar geniş bir tekerlekli şasi üzerinde yükselir.', 'En alt katın genişliğini üst katların genişliğiyle karşılaştır.'],
      ['The Helepolis is a multi-storey siege tower described in ancient sources.', 'It shows how large sieges relied on carpentry, transport and collective labour.', 'Stacked floors rise from a broad wheeled base.', 'Compare the width of the bottom floor with the upper levels.']
    ],
    organ33: [
      ['Leonardo’nun çok namlulu top çizimlerinden yorumlanan ahşap arabalı bir sergi.', 'Rönesans tasarımcılarının seri hareket ve sıra değiştirme fikirlerini örnekler.', 'Üç ayrı namlu sırası ortak bir taşıyıcı çevresinde yer alır.', 'Üç sırayı şasinin arkasından bakarak ayırt et.'],
      ['A wheeled exhibit based on Leonardo’s drawings of a multiple-barrel gun.', 'It illustrates Renaissance ideas about repeated movement and alternating rows.', 'Three rows of barrels sit around a shared carrier.', 'Find the three separate rows from behind the carriage.']
    ],
    swordpistol: [
      ['Sakson av kültüründen kılıç ile tabancayı bir araya getiren bir müze nesnesi.', 'Erken modern av takımlarında işlevin ve süslemenin nasıl birleştiğini gösterir.', 'Uzun çelik bıçak ve tabanca gövdesi ortak bir kabzada buluşur.', 'Oymalı metalin kıvrımlı ahşapla birleştiği yere bak.'],
      ['A hunting object from Saxony that combines a sword and a pistol.', 'It illustrates the meeting of function and ornament in early modern hunting equipment.', 'A long steel blade and pistol body share a grip.', 'Look where the engraved metal meets the curved wood.']
    ],
    archimedes: [
      ['Arşimet’e atfedilen Demir El’in Siraküza kıyısındaki müze yorumu.', 'Antik anlatılardan hareketle geliştirilen rekonstrüksiyonların nasıl yorum içerdiğini gösterir.', 'Model, bir direğin çevresinde dönen kolu, zinciri ve karşı ağırlığı gösterir.', 'Rıhtım kenarından suyun üzerine uzanan zincire bak.'],
      ['A museum interpretation of the Iron Hand attributed to Archimedes, set at Syracuse.', 'It shows how reconstructions of ancient accounts involve interpretation.', 'The model shows a pivoting arm, a chain and a counterweight.', 'Find the chain extending past the quay over the water.']
    ],
    turtle: [
      ['Turtle, David Bushnell’in tek kişilik ahşap denizaltısı için bir sergi rekonstrüksiyonudur.', 'Sualtı ulaşımına ilişkin erken denemelerin ne kadar dar bir hacimde yapıldığını gösterir.', 'İçeride insan gücüyle döndürülen kollar ve bir balast pompası bulunur.', 'İki parçalı ahşap kabuğun birleşim çizgisini bul.'],
      ['This is a reconstruction of David Bushnell’s one-person wooden submersible, Turtle.', 'It shows the cramped space of early experiments with underwater travel.', 'Hand-driven mechanisms and a ballast pump fit inside.', 'Find the seam between the two halves of the wooden shell.']
    ],
    rrh: [
      ['RRH m/42, uçakları uzaktan dinlemek için kullanılan halka hunili bir aygıttır.', 'Uçakları erken fark etmek için kullanılan akustik yöntemlerde insan kulağının rolünü gösterir.', 'Kavisli huniler sesi dinleyicilere iletir.', 'Dört huninin uçlarının hangi yönlere baktığını incele.'],
      ['The RRH m/42 is a ring-horn listening device for detecting distant aircraft.', 'It shows how acoustic early-warning methods relied on human hearing.', 'Curved horns channel sound to the listeners.', 'Look at the directions faced by the four horn openings.']
    ],
    ottomanbow: [
      ['Ahşap, boynuz ve siniri birleştiren bezemeli Osmanlı kompozit yayı.', 'Farklı malzemelerin usta işçiliğiyle tek bir nesnede nasıl bir araya geldiğini gösterir.', 'Yay gövdesi, esnek katmanlardan oluşur. Sergide katmanların yeri ayrı ayrı görülebilir.', 'Yay uçlarının kıvrımını ve yüzeydeki altın renkli süslemeyi incele.'],
      ['A decorated Ottoman composite bow combining wood, horn and sinew.', 'It shows how skilled craftspeople brought different materials together in one object.', 'The bow is built from flexible layers that the exhibit shows separately.', 'Look at the recurved tips and the gold-coloured surface decoration.']
    ],
    vecihi: [
      ['Vecihi K-VI, Türkiye’de tasarlanan ve üretilen erken bir çift kanatlı uçak prototipidir.', 'Vecihi Hürkuş’un girişimi, Türkiye’de uçak tasarımı ve üretimi tarihinin erken bir örneğidir.', 'Ahşap ve bez yapı, kanatlar arasındaki dikmeler ve gergilerle desteklenir.', 'İki kanat arasındaki çapraz gergileri bul.'],
      ['Vecihi K-VI is an early biplane prototype designed and built in Türkiye.', 'Vecihi Hürkuş’s work was an early landmark in Turkish aircraft design and production.', 'Struts and bracing support the wood-and-fabric wing structure.', 'Find the diagonal braces between the wings.']
    ],
    gokturk: [
      ['Göktürk dönemi buluntularından esinlenen zırhlı süvari ve at donanımı sergisi.', 'Bozkırda binicilik ile koruyucu donanımın birlikte geliştiğini gösterir.', 'Küçük levhalar üst üste dizilerek hareket edebilen bir zırh yüzeyi oluşturur.', 'Zırh levhalarıyla eyer ve üzengiyi aynı sahnede karşılaştır.'],
      ['An armoured rider and horse equipment inspired by Göktürk-period finds.', 'The exhibit shows how riding and protective equipment developed together on the steppe.', 'Rows of overlapping plates form a flexible armour surface.', 'Compare the armour plates with the saddle and stirrups in the same scene.']
    ],
    turbanhelmet: [
      ['Akkoyunlu geleneğiyle ilişkilendirilen bezemeli bir sarık miğferin sergi modeli.', 'Biçim ile süslemenin saray ve zırh işçiliğinde nasıl birleştiğini gösterir.', 'Yivli kabuk, başı çevreleyen sert yüzeyi oluşturur.', 'Yivlerin tepeye doğru nasıl daraldığına ve yazı kuşağına bak.'],
      ['A model of a decorated turban helmet associated with the Aq Qoyunlu tradition.', 'It shows how form and decoration met in the craft of armour.', 'A fluted shell forms the hard surface around the head.', 'Notice how the flutes narrow towards the top and meet the band of inscription.']
    ],
    maxim: [
      ['Maxim–Nordenfelt, 19. yüzyılın sonundaki otomatik silahların bir örneğidir.', 'Otomatik ateş, sömürge savaşlarında ve sonraki endüstriyel savaşlarda ateş gücünün ölçeğini değiştirdi.', 'Maxim tasarımında geri tepme mekanik çevrime enerji verir.', 'Namlu çevresindeki silindirik su ceketi ile sergi kaidesini ayırt et.'],
      ['The Maxim–Nordenfelt is an example of late nineteenth-century automatic weapons.', 'Automatic fire changed the scale of firepower in colonial and later industrial warfare.', 'The Maxim design uses recoil to power its mechanical cycle.', 'Distinguish the cylindrical water jacket from the exhibit stand.']
    ],
    abdulhamid: [
      ['Abdülhamid, Taşkızak’ta monte edilen erken Osmanlı buharlı denizaltısıdır.', 'Osmanlı donanmasının sualtı teknolojisini denediği dönemi temsil eder. Denemelerin ayrıntıları kaynaklarda farklı anlatılır.', 'Buhar tahriki ve denge düzeni dar, puro biçimli gövdenin içinde yer alır.', 'Su çizgisine göre güverteyi ve camlı küçük kumanda bölümünü bul.'],
      ['Abdülhamid is an early Ottoman steam submarine assembled at Taşkızak.', 'It represents the Ottoman Navy’s experiments with underwater technology. Sources differ on details of the trials.', 'Steam propulsion and balance systems fit inside the narrow, cigar-shaped hull.', 'Look for the deck and small glazed control station above the waterline.']
    ],
    greekfire: [
      ['Bizans dromonunun baş kısmını gösteren ve Rum Ateşi anlatılarından esinlenen bir sahne.', 'Rum Ateşi’nin donanma tarihindeki yerini ve tarihsel tasvirlerin yorum sınırlarını gösterir.', 'Sergi, pruva donanımlarını yaklaşık bir müze düzeninde bir araya getirir.', 'Ahşap tekne ile pruvadaki hayvan başı bezemesine bak.'],
      ['A Byzantine dromon bow exhibit inspired by accounts of Greek fire.', 'It explores the place of Greek fire in naval history and the limits of surviving depictions.', 'The exhibit arranges the bow fittings in an interpretive museum scene.', 'Look at the wooden vessel and the animal-head ornament at its bow.']
    ],
    r7: [
      ['Vostok-K, R-7 ailesinin insanlı uzay uçuşunda kullanılan bir üyesidir.', 'Aynı roket ailesinin balistik füze programından uzay taşıyıcılığına uzanan tarihini gösterir.', 'Dört yan blok, merkez gövdenin çevresinde ayrı birimler olarak yer alır.', 'Üstten bakarak merkez gövde ile dört yan bloğun simetrisini incele.'],
      ['Vostok-K was a member of the R-7 family used for human spaceflight.', 'It illustrates how a ballistic missile programme led to a family of space launchers.', 'Four side boosters form separate units around the central core.', 'Look down from above to see the symmetry of the four boosters around the core.']
    ],
    harrier: [
      ['Harrier GR.1, yönlendirilebilir itişli Pegasus motoruna sahip bir jet uçağıdır.', 'Kısa veya dikey kalkış ve iniş, jetlerin kullanabileceği alanlara yeni seçenekler ekledi.', 'Pegasus, jet akımını dört döner nozuldan yönlendirir.', 'Gövdenin iki yanında yer alan nozul çiftlerini bul.'],
      ['The Harrier GR.1 is a jet aircraft powered by the vectored-thrust Pegasus engine.', 'Short or vertical takeoff and landing opened up new places for jet aircraft to operate.', 'Four swivelling nozzles direct the jet flow from the Pegasus.', 'Find the pairs of nozzles on either side of the fuselage.']
    ],
    strv103: [
      ['Stridsvagn 103C, gövdesi alçak ve tareti olmayan bir İsveç tankıdır.', 'Yerleşik tank düzeninin dışında geliştirilmiş bir Soğuk Savaş tasarımıdır.', 'Gövde ve süspansiyon, sabit namluyla birlikte bir bütün olarak hareket eder.', 'Üstten bakarak gövde ile namlunun birleştiği yeri bul.'],
      ['Stridsvagn 103C is a low-profile Swedish tank without a turret.', 'It shows a Cold War approach that departed from the conventional tank layout.', 'The hull and suspension move together with the fixed gun.', 'From above, find where the gun meets the hull.']
    ],
    fa330: [
      ['Fa 330, denizaltının çektiği motorsuz bir hava gözcüsü düzeneğiydi.', 'Denizaltı gözcülüğünde görüş yüksekliğinin önemini gösterir.', 'Rotor, kanatların üzerinden geçen havayla döner. Çekme hattı modeli güverteye bağlar.', 'İnce gövdeyi, güverte vincini ve ikisini birleştiren hattı bul.'],
      ['The Fa 330 was an unpowered aerial lookout towed by a submarine.', 'It shows why viewing height mattered for submarine lookouts.', 'Air moving over the blades turns the rotor. The towline connects the exhibit to the deck.', 'Find the slender frame, deck winch and the line linking them.']
    ],
    t34: [
      ['T-34/76, eğimli zırhlı ve dizel motorlu bir Sovyet tankıdır.', 'İkinci Dünya Savaşı’nda hareketlilik ve geniş ölçekli tank üretiminin önemini gösterir.', 'Motor paletlere güç verir. Yan süspansiyon büyük yol tekerleklerini destekler.', 'Ön zırhın eğimini ve yan tekerleklerin boyutunu karşılaştır.'],
      ['The T-34/76 is a Soviet tank with sloped armour and a diesel engine.', 'It illustrates the importance of mobility and large-scale tank production in the Second World War.', 'The engine drives the tracks. The suspension supports the large road wheels.', 'Compare the angle of the front armour with the size of the road wheels.']
    ],
    norden: [
      ['Norden M-9, elektrikli ekranlar yerine mekanik parçalar kullanan analog bir hesaplama aygıtıdır.', 'Dijital bilgisayarlardan önce hareketle hesap yapılan bir dönemi temsil eder.', 'Dönen disk, makaralar ve kadranlar soyut değerleri fiziksel hareketle gösterir.', 'Şeffaf sergi parçasının arkasındaki disk ve makaraları bul.'],
      ['The Norden M-9 is an analogue computing device built around mechanical parts.', 'It represents a period when physical movement could perform calculations before digital computers.', 'A rotating disk, rollers and dials represent abstract quantities with physical movement.', 'Find the disk and rollers behind the transparent exhibit panel.']
    ],
    f14: [
      ['F-14 Tomcat, hareketli kanatları olan çift motorlu bir deniz uçağıdır.', 'Uçak gemisi operasyonlarıyla yüksek hızlı uçuşun aynı tasarımda nasıl buluştuğunu gösterir.', 'Kanatlar, gövdeye yakın mafsallarında geriye doğru dönebilir.', 'Kanat köklerinin gövdeye bağlandığı noktaları bul.'],
      ['The F-14 Tomcat is a twin-engine naval fighter with movable wings.', 'It shows how carrier operations and high-speed flight shaped a single design.', 'The wings can pivot rearward at joints close to the fuselage.', 'Find where the wing roots meet the fuselage.']
    ],
    sultanhisar: [
      ['Sultanhisar, Osmanlı donanmasında görev yapan dar gövdeli bir torpidobottur.', 'AE2 ile 1915’teki karşılaşması, Çanakkale harekâtının Marmara’daki boyutunu gösterir.', 'Üç genleşmeli buhar makinesi tek pervane hattına güç verir.', 'İki baca ile kıçtaki tek pervaneyi aynı görünümde bul.'],
      ['Sultanhisar is a narrow-hulled torpedo boat that served in the Ottoman Navy.', 'Its 1915 encounter with AE2 illustrates the Sea of Marmara’s role in the Dardanelles campaign.', 'A triple-expansion steam engine drives a single propeller shaft.', 'Find the two funnels and the single propeller at the stern.']
    ],
    renaultft: [
      ['Renault FT, gövdesi küçük ve kulesi tam dönebilen bir Fransız tankıdır.', 'Döner kule, öndeki sürücü ve arkadaki motor yerleşimi daha sonraki tankları etkiledi.', 'Ön kabin ve arka motor bölümü ayrı hacimlerdir. Kule üstte döner.', 'Kulenin konumunu ve kıçta gövdeden uzanan kuyruğu bul.'],
      ['The Renault FT is a small French tank with a fully rotating turret.', 'Its rotating turret, forward driver and rear engine influenced later tank layouts.', 'The forward cabin and rear engine occupy separate spaces beneath the turret.', 'Find the turret and the tail extending behind the hull.']
    ],
    sr71_j58: [
      ['SR-71 Blackbird, iki J58 motorlu yüksek hızlı bir keşif uçağıdır.', 'Yüksek hızda uçuş için hava girişi, motor ve ısıya dayanıklı gövdenin birlikte tasarlandığını gösterir.', 'Hava, sivri giriş konilerinin çevresinden motor kaportalarına ulaşır.', 'İki motorun önündeki sivri giriş konilerini bul.'],
      ['The SR-71 Blackbird is a high-speed reconnaissance aircraft with two J58 engines.', 'It shows how inlet, engine and heat-resistant airframe had to be designed together for high speed.', 'Air flows around pointed inlet cones into the engine nacelles.', 'Find the pointed cones at the front of both engines.']
    ],
    shermancrab: [
      ['Sherman Crab, önünde zincirli tambur bulunan bir mayın temizleme tankıdır.', 'İkinci Dünya Savaşı’nda zırhlı araçların yol açmak gibi özel görevlere uyarlandığını gösterir.', 'Gövdenin önüne eklenen kollar bir tambur ve zincirleri taşır.', 'Ek donanımın tank gövdesinin önünde nereye bağlandığını incele.'],
      ['The Sherman Crab is a mine-clearing tank with a chain drum at the front.', 'It shows how Second World War armoured vehicles were adapted to specialist tasks such as clearing routes.', 'Front-mounted arms carry a drum and its hanging chains.', 'Look where the added equipment joins the front of the tank.']
    ],
    french75: [
      ['Fransız 75’liği, hareketli namlusu ve tekerlekli top arabasıyla sergilenir.', 'Geri tepmeyi yönetmek saha topçuluğunda mürettebatın işini ve tasarım önceliklerini değiştirdi.', 'Namlu geri kayarken top arabası ve tekerlekler sahnede yerinde kalır.', 'Namlu altındaki kızak ile tekerleklerin bağlantısına bak.'],
      ['The French 75 is shown with a sliding barrel on a wheeled carriage.', 'Managing recoil changed the work of field artillery crews and their equipment design.', 'The barrel slides back while the carriage and wheels stay in place in the exhibit.', 'Look at the slide beneath the barrel and its relation to the wheels.']
    ],
    dreadnought: [
      ['HMS Dreadnought, buhar türbinli ve büyük taretli bir İngiliz zırhlısıydı.', '1906’da savaş gemisi tasarımı için yeni bir ölçüt oluşturdu.', 'Kazanların sağladığı buhar türbinlere, oradan pervane millerine hareket verir.', 'Güverte üzerindeki taretlerle iki bacanın yerleşimini karşılaştır.'],
      ['HMS Dreadnought was a British battleship with steam turbines and large turrets.', 'In 1906 it set a new benchmark for battleship design.', 'Steam from the boilers drives turbines connected to the propeller shafts.', 'Compare the layout of the turrets and the two funnels on deck.']
    ],
    patriot: [
      ['Patriot sergisi, radar ve füze fırlatma istasyonunu iki ayrı araç grubu olarak gösterir.', 'Hava savunmasında algılama ve diğer görevlerin bir ağ içinde dağıtılmasını örnekler.', 'Sabit yüzlü radar, antenini fiziksel olarak döndürmeden tarama yapar.', 'Yuvarlak radar yüzünü dikdörtgen taşıma kaplarından ayırt et.'],
      ['The Patriot exhibit shows the radar and launcher as two separate vehicle groups.', 'It illustrates how sensing and other air defence tasks are distributed across a network.', 'The fixed-face radar scans electronically without turning its antenna.', 'Distinguish the round radar face from the rectangular transport containers.']
    ],
    yamato460: [
      ['Yamato zırhlısının üç namlulu taretini ve altındaki güverteleri gösteren bir kesit.', 'Büyük deniz topçuluğunun gemi içinde kapladığı hacmi görünür kılar.', 'Taret, alt güvertelere uzanan silindirik bir yapının üzerinde döner.', 'Üstteki taret ile aşağı uzanan halka ve asansör bölümünü karşılaştır.'],
      ['A cutaway showing a triple turret from the battleship Yamato and the decks beneath it.', 'It reveals how much space large naval artillery occupied inside a ship.', 'The turret rotates above a cylindrical structure that extends through the decks.', 'Compare the turret above with the ring and lift structures below.']
    ],
    cezeri: [
      ['El-Cezerî’nin çizimleri ve açıklamalarından esinlenen, su çarkı ve ikiz pompalı bir müze düzeneği.', '1206 tarihli eser, Artuklu döneminde su gücüyle çalışan makinelerin nasıl belgelendiğini gösterir.', 'Su çarkının dönüşü dişliler ve kam mili üzerinden pompaların ileri geri hareketine dönüşür.', 'Ortadaki fener dişli ile iki yandaki bakır pompaları bul.'],
      ['A museum mechanism with a waterwheel and twin pumps inspired by al-Jazari’s descriptions and drawings.', 'His 1206 work shows how machines powered by water were documented in the Artuqid period.', 'Gears and a camshaft turn the wheel’s rotation into the back-and-forth motion of the pumps.', 'Find the central lantern gear and the copper pumps on either side.']
    ],
    saturnv_f1: [
      ['Saturn V’in ilk kademesinde kullanılan F-1 roket motorunun sergi kesiti.', 'Apollo’nun Ay’a uzanan uçuşlarının arkasındaki motor ölçeğini gösterir.', 'Sergi, motorun geniş lülesiyle üst bölümdeki pompaları aynı yapıda gösterir.', 'Lülenin geniş ağzını üstteki boruların çapıyla karşılaştır.'],
      ['A museum cutaway of the F-1 rocket engine used on the first stage of Saturn V.', 'It shows the scale of the propulsion behind Apollo’s flights to the Moon.', 'The exhibit places the broad bell and the upper pump assembly in the same structure.', 'Compare the mouth of the bell with the pipes above it.']
    ],
    firtina: [
      ['T-155 Fırtına, paletli gövde üzerinde taşınan kundağı motorlu bir obüstür.', 'Türkiye’de modern savunma sanayisinde hareketlilik ve otomasyonun bir araya gelişini gösterir.', 'Paletli gövde, döner kule ve içerisindeki otomatik düzenekleri taşır.', 'Kulenin gövdeye göre boyutuna ve iki yandaki yol tekerleklerine bak.'],
      ['T-155 Fırtına is a self-propelled howitzer carried on a tracked hull.', 'It illustrates how mobility and automation came together in Türkiye’s modern defence industry.', 'The tracked hull supports the rotating turret and its internal machinery.', 'Compare the size of the turret with the hull and its rows of road wheels.']
    ],
    mahmudiye: [
      ['Mahmudiye, üç direkli ve üç ambarlı Osmanlı kalyonunun sergi modelidir.', 'Kırım Savaşı’nda görev alan büyük yelkenli gemilerin ölçeğini gösterir.', 'Yelkenlerin yükü direkler ve halatlarla ahşap gövdeye aktarılır.', 'Borda kesitinde üst üste gelen üç güverteyi bul.'],
      ['This is a model of Mahmudiye, a three-masted Ottoman ship of the line.', 'It conveys the scale of the sailing warships that served in the Crimean War.', 'Masts and rigging transfer the load of the sails to the wooden hull.', 'Find the three stacked decks in the side cutaway.']
    ],
    wagenburg: [
      ['Wagenburg sergisi, Hussit savaş arabalarını korunaklı bir sıra halinde gösterir.', 'Gündelik taşıma araçlarının, Orta Çağ’da toplu savunma düzenlerine uyarlandığını örnekler.', 'Açılabilir paneller ve ayrı arabalar birlikte bir geçici sınır oluşturur.', 'Öndeki arabanın ahşap tekerlekleri ile yan panellerine bak.'],
      ['The Wagenburg exhibit shows Hussite war wagons arranged as a protected line.', 'It illustrates how medieval communities adapted transport wagons for collective defence.', 'Separate wagons and opening panels form the temporary barrier.', 'Look at the wooden wheels and panels of the nearest wagon.']
    ],
    jumo004: [
      ['Me 262 uçağında kullanılan çift Jumo 004 turbojetin sergi kesiti.', 'İkinci Dünya Savaşı sırasında seri üretilen erken turbojetlerin uçak tasarımına etkisini gösterir.', 'Her motor önden arkaya dizilen kompresör, yanma ve egzoz bölümlerine sahiptir.', 'Kanat altındaki iki gondolda benzer parça dizilerini bul.'],
      ['A cutaway of the two Jumo 004 turbojets used in the Me 262.', 'It shows the influence of early production turbojets on aircraft design in the Second World War.', 'Each engine has compressor, combustion and exhaust sections arranged from front to back.', 'Find the matching sequences inside the two underwing nacelles.']
    ],
    corvus: [
      ['Corvus, antik kaynaklarda Roma gemileriyle ilişkilendirilen bir geçiş köprüsüdür.', 'Mylae anlatısı Romalıların denizdeki deneyim eksikliğine nasıl çözüm aradığını gösterir.', 'Yaklaşık sergi modeli, iki gemi ve pruvaya mafsalla bağlanan ahşap köprüden oluşur.', 'Köprünün geminin başındaki dikmeyle birleştiği yere bak.'],
      ['The corvus was a boarding bridge associated with Roman ships in ancient accounts.', 'The story of Mylae shows how Rome looked for ways to overcome its limited experience at sea.', 'The interpretive scene includes two ships and a wooden bridge that pivots at the bow.', 'Find where the bridge meets the upright at the bow.']
    ],
    humbara: [
      ['Osmanlı humbaracılığıyla bağlantılı bir döküm havan ve rubu tahtası sergisi.', 'Humbaracı Ahmed Paşa döneminde askerî eğitimde matematiğin yerini gösterir.', 'Sergideki çeyrek daire ve çekül ipi, açı ölçümünü görselleştirir.', 'Döküm gövdeden ayrı duran hendese tahtasını ve kavisli ölçeğini bul.'],
      ['An exhibit pairing a cast Ottoman mortar with a quadrant used for geometry.', 'It shows the place of mathematics in military education in the era of Humbaracı Ahmed Pasha.', 'The quarter circle and plumb line illustrate how angles could be measured.', 'Find the separate geometry board and its curved scale.']
    ],
    kamov: [
      ['Ka-27PS, gemilerden arama kurtarma görevleri için kullanılan bir helikopterdir.', 'Kompakt rotor düzeninin sınırlı gemi güvertelerinde nasıl kullanıldığını gösterir.', 'Aynı eksendeki iki rotor zıt yönlerde döner. Kabin yanındaki vinç kurtarma için kullanılır.', 'Rotorların üst üste dizilişine ve kabinin yanındaki kurtarma sepetine bak.'],
      ['The Ka-27PS is a shipborne search-and-rescue helicopter.', 'It shows how a compact rotor arrangement serves aircraft on confined ship decks.', 'Two rotors on a shared axis turn in opposite directions. A cabin-side hoist assists rescues.', 'Look at the stacked rotors and the rescue basket beside the cabin.']
    ]
  };
})();
