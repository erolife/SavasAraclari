# 📋 YAPILACAK ARAÇLAR LİSTESİ & 2 KİŞİLİK ORTAK ÇALIŞMA PLANI

> **Son Güncelleme:** 9 Kasım 2026<br>
> **Mevcut Durum:** **46 Aktif Araç** (`Grup 1 .. Grup 10` ve ek öncelik `fa330` tamamlandı)
> **Hedef:** **Grup 11 .. Grup 16** (`Araç #46 .. #75` — 30 yeni araçlık çakışmasız yol haritası)

Bu dosya, projeyi geliştiren **iki geliştiricinin** aynı aracı mükerrer (tekrarlı) kodlamasını önlemek, dosya/kimlik (`id`) adlarını önceden sabitlemek ve Git birleştirme (*merge*) çakışmalarını sıfıra indirmek amacıyla hazırlanmıştır.

### Kullanıcı önceliği — Fa 330 (9 Kasım 2026)

| Kimlik | Çalışma | Geliştirici | Durum |
| --- | --- | --- | --- |
| `fa330` / Grup 17 | Fa 330 Bachstelze, temsili denizaltı güvertesi ve çekme düzeneği | MesAi C | ✅ Tamamlandı — 23 grup, 262 mesh; 42 test dosyası ve masaüstü/X-Ray/mobil kontrol |

Bu ek çalışma kullanıcı tarafından ayrıca istendi. Aşağıdaki **#46–75 rezervasyonları değiştirilmedi**; bunlar plan sıra numaralarıdır. Kullanıcının “push en son” talebi nedeniyle sahiplenme ve tamamlanma birlikte gönderilir. Model seçildiğinde yüklenir; simülatöre statik adaptör eklenmez.

---

## 🤝 1. İki Kişilik Çakışmasız (*Merge-Conflict-Free*) Çalışma Kuralları

1. **Başlamadan Önce Sahiplenme (*Lock*):**
   - Bir araca başlamadan önce bu dosyadaki (`YAPILACAK_ARACLAR_LISTESI.md`) ilgili satırda **Geliştirici** sütununa kendi adınızı/kodunuzu yazın ve **Durum** sütununu `🔨 Yapılıyor` olarak değiştirip `git push` yapın (veya ekip arkadaşınıza hangi `#Sıra / id` ile başladığınızı bildirin).
2. **Sabit `id` ve Dosya Adı Kuralı:**
   - Tablodaki her aracın `id` değeri ve `js/vehicles/<id>.js` dosya adı **önceden rezerve edilmiştir**. Kendi başınıza farklı bir `id` türetmeyin.
3. **Paralel Çalışmada Git Çakışmasını Önleme:**
   - İki kişi aynı anda çalışırken `js/vehicles/<id>.js` ve `test_<id>.js` dosyaları birbirinden tamamen bağımsızdır (**%0 çakışma riski**).
   - Ortak dokunulan tek iki dosya `js/catalog.js` ve `simulator.html` dosyalarıdır. Çakışma yaşamamak için:
     1. Önce kendi aracınızın `js/vehicles/<id>.js` kodunu ve `test_<id>.js` birim testini tamamlayın.
     2. `js/catalog.js` ve `simulator.html` entegrasyonunu yapmadan hemen önce **`git pull`** çekin, entegrasyonu yapıp `node tests/museum-links.cjs` testini çalıştırın ve hemen **`git commit && git push`** yapın.
4. **Tek / Çift Numara veya Paket Paylaşımı:**
   - Aynı grup içinde eşzamanlı çalışırken bir geliştirici **Tek Sıra Numaralı (`#46, #48, #50...`)**, diğer geliştirici **Çift Sıra Numaralı (`#47, #49...`)** araçları alabilir ya da doğrudan farklı grupları (örn. biri `Grup 11`, diğeri `Grup 12`) paylaşabilir.

---

## ✅ 2. Başlangıçtaki 45 Aracın Hızlı Envanteri (Mükerrer Kayıt Kontrolü)

Yukarıdaki ek `fa330` ile toplam 46 aktif araç vardır. Aşağıdaki **başlangıçtaki 45 araç ve mekanizma zaten projede mevcuttur**; yeni araç seçerken bu `id` ve mekanizmalar tekrar edilmemelidir:

| Grup | Araçlar (`id` — Yıl — Kısa Ad) |
| :--- | :--- |
| **Grup 1 (1–5)** | `ballista` (MÖ 300 Roma Ballistası) • `trebuchet` (1250 Trebuchet) • `sahi` (1453/1464 Şahi Topu) • `tiger` (1942 Tiger I) • `spitfire` (1943 Spitfire Mk IX) |
| **Grup 2 (6–10)** | `leonardo` (~1487 Leonardo Zırhlı Aracı) • `kadirga` (1571 Osmanlı Kadırgası) • `gatling` (1862 Gatling) • `mark1` (1916 Mark I Tankı) • `fokker` (1917 Fokker Dr.I) |
| **Grup 3 (11–15)** | `monitor` (1862 USS Monitor) • `katyusha` (1941 BM-13 Katyuşa) • `v2` (1944 V-2 Roketi) • `j79` (1965 GE J79 Turbojet) • `phalanx` (1999 Mk 15 Phalanx CIWS) |
| **Grup 4 (16–20)** | `huey` (1967 Bell UH-1H Huey) • `u505` (1941 U-505 Denizaltı) • `enigma` (1930 Enigma I) • `lcvp` (1942 Higgins LCVP) • `chainhome` (1938 Chain Home Radar) |
| **Grup 5 (21–30)** | `scythed` (~1485 Oraklı Araba) • `hwacha` (1451 Kore Hwacha) • `atlatl` (1400 Atlatl) • `lantern` (1595 Fenerli Kalkan) • `polybolos` (MÖ 3.yy Polybolos) • `giantbow` (~1488 Dev Arbalet) • `chukonu` (19.yy Chu-ko-nu) • `helepolis` (MÖ 304 Helepolis) • `organ33` (~1488 33 Namlulu Org) • `swordpistol` (1735 Kılıç-Tabanca) |
| **Grup 6 (31–33)** | `archimedes` (MÖ 3.yy Arşimet Demir Eli) • `turtle` (1776 Turtle Denizaltısı) • `rrh` (1942 RRH m/42 Akustik Dinleyici) |
| **Grup 7 (34–36)** | `nusret` (1915 Nusret Mayın Gemisi) • `ottomanbow` (1719 Osmanlı Kompozit Yayı) • `vecihi` (1925 Vecihi K-VI) |
| **Grup 8 (37–39)** | `gokturk` (6–8.yy Göktürk Süvarisi) • `dragonmace` (12–13.yy Selçuklu Ejder Gürzü) • `turbanhelmet` (15.yy Akkoyunlu Miğferi) |
| **Grup 9 (40)** | `maxim` (1884 Maxim–Nordenfelt Makineli Tüfeği) |
| **Grup 10 (41–45)** | `abdulhamid` (1886 Abdülhamid Denizaltısı) • `greekfire` (672 Bizans Rum Ateşi) • `r7` (1957/1961 R-7 Vostok & Korolev Haçı) • `harrier` (1969 Harrier GR.1 & Pegasus VTOL) • `strv103` (1967/1986 Stridsvagn 103 "S-Tank") |

### 📊 45 Araç Sonrası Kategori Dağılımı & Boşluk Analizi
- **Ortam Dağılımı:** 🪖 Kara (`28`), ⚓ Deniz (`9`), ✈️ Hava (`6`), 🚀 Uzay (`2` — yalnızca `v2` ve `r7`).
- **Dönem Dağılımı:** Modern (`1` — yalnızca `phalanx`), Savaşlar Arası (`1` — yalnızca `vecihi`), I. Dünya Savaşı (`3`), Sanayi Devrimi (`5`), Soğuk Savaş (`5`).
- **Sonuç:** Aşağıdaki **Grup 11 .. Grup 16** listesi; özellikle **Modern**, **Soğuk Savaş**, **Savaşlar Arası**, **I. Dünya Savaşı**, **Hava/Uzay** ve **Türk/Osmanlı Mühendislik Mirası** boşluklarını dengeli biçimde dolduracak şekilde kurgulanmıştır.

---

## 🚀 3. Planlanan Yapılacak Araçlar Listesi (`#46 .. #75`)

### 📦 GRUP 11 (Araç #46 – #50): İkonik Zırhlı, Havacılık, Deniz Topçusu & Modern Hava Savunma
| Sıra | Sabit `id` & Dosya | Yıl / Dönem / Ortam / Köken | Araç Adı & Müze Referansı | Gösterilecek Benzersiz Mekanik İlke & Canlı 3D Etkileşim | Geliştirici | Durum |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **#46** | `t34`<br>`js/vehicles/t34.js` | **1940 / 1944**<br>II. Dünya Savaşı<br>🪖 Kara • `ussr` | **T-34/76 (veya T-34/85) & Christie Helezon Süspansiyon + V-2 Dizel**<br>*(Bovington Tank Museum / Kubinka)* | Gövde iç duvarlarında dikey/eğimli çalışan dev **Christie helezon yayları**, $45^\circ$ eğimli zırh geometrisi ve alüminyum bloklu **V-2-34 V12 dizel motoru**. | — | ⏳ Planlı |
| **#47** | `norden`<br>`js/vehicles/norden.js` | **1942**<br>II. Dünya Savaşı<br>✈️ Hava • `usa` | **Norden M-9 Bomba Nişangâhı — Mekanik Analog Bilgisayar**<br>*(Smithsonian NASM / NMUSAF)* | İkiz jiroskop, **bilye-disk integratörü (*ball-and-disc integrator*)**, döner optik prizma teleskobu ve uçağın hız/irtifa/rüzgâr verisiyle bırakma noktasını otomatik hesaplayan dişli diferansiyeli. | — | ⏳ Planlı |
| **#48** | `f14`<br>`js/vehicles/f14.js` | **1974**<br>Soğuk Savaş<br>✈️ Hava • `usa` | **Grumman F-14 Tomcat — Değişken Ok Açılı (*Swing-Wing*) Kanat & AWG-9**<br>*(Smithsonian NASM Udvar-Hazy)* | Titanyum merkez kutu kirişi (*wing carry-through box*) üzerindeki dev rulmanlarla **$20^\circ \leftrightarrow 68^\circ$ (ve $75^\circ$ gemi parkı) senkron açılıp kapanan değişken ok açılı kanatlar**, burun *AWG-9* radar çanağı ve *AIM-54 Phoenix* paletleri. | — | ⏳ Planlı |
| **#49** | `patriot`<br>`js/vehicles/patriot.js` | **1984 / 1991**<br>Modern<br>🪖 Kara • `usa` | **MIM-104 Patriot — M901 Fırlatma İstasyonu & AN/MPQ-53 Faz Dizinli Radar**<br>*(US Army ADA Museum / Smithsonian)* | Hidrolik dikme silindirleriyle $0^\circ \to 38^\circ$ yükselen 4'lü kanister, döner kaide, kırılabilir ön diyafram kapaklardan çıkan PAC-2 füzesi ve **faz dizinli (*phased array*) radar** kesiti. | — | ⏳ Planlı |
| **#50** | `yamato460`<br>`js/vehicles/yamato460.js` | **1941**<br>II. Dünya Savaşı<br>⚓ Deniz • `japan`* | **IJN Yamato — 460 mm (*Type 94*) Üç Namlulu Deniz Topu Tareti & Asansörleri**<br>*(Yamato Museum, Kure)* | Tarihin en büyük deniz topu tareti (2.774 ton): su altı cephaneliğinden taret içine çıkan **3 katlı mermi ve barut kesesi asansörleri**, hidrolik tokmak ve 3 namlunun sarsıntıyı önleyen **gecikme bobinli (*delay coil*)** salvosu. | — | ⏳ Planlı |

---

### 📦 GRUP 12 (Araç #51 – #55): Türk, Osmanlı & İslam Bilim/Askerî Mühendislik Mirası
| Sıra | Sabit `id` & Dosya | Yıl / Dönem / Ortam / Köken | Araç Adı & Müze Referansı | Gösterilecek Benzersiz Mekanik İlke & Canlı 3D Etkileşim | Geliştirici | Durum |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **#51** | `cezeri`<br>`js/vehicles/cezeri.js` | **1206**<br>Orta Çağ<br>🪖 Kara • `seljuk` | **El-Cezerî'nin Su Çarklı & Eksantrik Kam Milli Mekanik Düzeneği**<br>*(Topkapı Sarayı A.3472 / İstanbul İslam Bilim Müzesi)* | Su çarkı tahrikli **yatay eksantrik kam mili (*camshaft*)**, mafsallı devirme kolları, şamandıralı su regülatörü ve kova-dişli aktarma mekanizması. | — | ⏳ Planlı |
| **#52** | `rammah`<br>`js/vehicles/rammah.js` | **~1280**<br>Orta Çağ<br>⚓ Deniz • `medieval_eu`* | **Hasan el-Rammah "Yumurta" (*al-Bayda*) Öz-İtkili Roket Torpidosu**<br>*(BnF Arabe 2825 / İslam Bilim Müzesi)* | Tarihin ilk roket tahrikli deniz torpidosu: birleştirilmiş iki bakır tavadan oluşan mercek gövde, güherçileli **ikiz roket itki tüpü**, su üstü denge kızakları ve pruva mahmuz iğnesi. | — | ⏳ Planlı |
| **#53** | `humbara`<br>`js/vehicles/humbara.js` | **1735**<br>Barut & Rönesans<br>🪖 Kara • `ottoman` | **Osmanlı Humbara Havan Topu & *Rubu Tahtası* (Açı Ölçer) Düzeneği**<br>*(Harbiye Askerî Müzesi, İstanbul)* | Kısa ve kalın namlulu dökme tunç Osmanlı havanı, $45^\circ \dots 75^\circ$ yüksek açılı muylu yatağı, **içi barut dolu küresel demir *humbara* (patlayıcı gülle)**, ahşap saniyeli tapa ve *rubu tahtası* çekülüyle parabolik yörünge hesabı. | — | ⏳ Planlı |
| **#54** | `mahmudiye`<br>`js/vehicles/mahmudiye.js` | **1829**<br>Sanayi Devrimi<br>⚓ Deniz • `ottoman` | **Osmanlı *Mahmudiye* Kalyonu — 3 Ambarlı 128 Toplu Borda Bataryası Kesiti**<br>*(İstanbul Deniz Müzesi, Beşiktaş)* | Dünyanın en büyük yelkenli harp gemilerinden *Mahmudiye*'nin **3 katlı (*kantara, orta, üst güverte*) borda kesiti**: meşe postalar, halatlı lombar kapakları ve 3 güvertenin kademeli borda salvosu. | — | ⏳ Planlı |
| **#55** | `sultanhisar`<br>`js/vehicles/sultanhisar.js` | **1915**<br>I. Dünya Savaşı<br>⚓ Deniz • `ottoman` | **Osmanlı *Sultanhisar* Torpidobotu & Güverte Üstü Döner Torpido Kovanı**<br>*(İstanbul Deniz Müzesi / Çanakkale 1915)* | Çanakkale'de *HMAS AE2* denizaltısını batıran *Sultanhisar*: **üç genleşmeli (*triple-expansion*) dikey buhar makinesi**, güverte üstü **360° döner 450 mm torpido fırlatma tüpü** ve barut/basınçlı hava fırlatma mekanizması. | — | ⏳ Planlı |

---

### 📦 GRUP 13 (Araç #56 – #60): Uzay, Stratejik Havacılık & Yüksek Hız (Mach 3+) Mühendisliği
| Sıra | Sabit `id` & Dosya | Yıl / Dönem / Ortam / Köken | Araç Adı & Müze Referansı | Gösterilecek Benzersiz Mekanik İlke & Canlı 3D Etkileşim | Geliştirici | Durum |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **#56** | `sr71_j58`<br>`js/vehicles/sr71_j58.js` | **1966**<br>Soğuk Savaş<br>✈️ Hava • `usa` | **SR-71 Blackbird — Pratt & Whitney *J58* Turboramjet & Hareketli Giriş Konisi**<br>*(Smithsonian NASM Udvar-Hazy)* | Mach 1,6 sonrasında şok dalgasını yakalamak için **`66 cm` geriye kayan sivri giriş konisi (*inlet spike*)** ve Mach 3,2'de kompresör havasını doğrudan art yakıcıya aktaran **6 harici baypas borusu (*bleed tubes*)**! | — | ⏳ Planlı |
| **#57** | `saturnv_f1`<br>`js/vehicles/saturnv_f1.js` | **1967**<br>Soğuk Savaş<br>🚀 Uzay • `usa` | **Saturn V — Rocketdyne *F-1* Dev Roket Motoru & Türbopompa Kesiti**<br>*(Smithsonian NASM / Kennedy Space Center)* | Tarihin en güçlü tek yanma odalı sıvı yakıtlı roket motoru (`6.770 kN`): **55.000 BG LOX/RP-1 türbopompası**, rejeneratif soğutma boruları, türbin egzoz soğutma manifoldu ve $\pm 6^\circ$ hidrolik gimbal yatağı. | — | ⏳ Planlı |
| **#58** | `b29_turret`<br>`js/vehicles/b29_turret.js` | **1944**<br>II. Dünya Savaşı<br>✈️ Hava • `usa` | **Boeing B-29 Superfortress — GE Bilgisayarlı Uzaktan Kumandalı Taret Sistemi**<br>*(Smithsonian NASM Enola Gay / NMUSAF)* | Basınçlı kabindeki nişancının optik nişangâh kubbesini çevirdiğinde, **analog ateş kontrol bilgisayarı ve amplidin servolar** üzerinden gövde üstü/altı insansız taretlerin paralaks düzeltmesiyle eşzamanlı dönmesi! | — | ⏳ Planlı |
| **#59** | `nike`<br>`js/vehicles/nike.js` | **1959**<br>Soğuk Savaş<br>🚀 Uzay • `usa` | **MIM-14 Nike Hercules — Yüksek İrtifa Hava Savunma Füzesi & 4× Booster**<br>*(İstanbul Hava Müzesi Yeşilköy / Smithsonian)* | Türkiye'de de uzun yıllar görev yapan iki kademeli hava savunma füzesi: **4× M5E1 katı yakıtlı hızlandırıcı kümesi**, hidrolik fırlatma rampası dikmesi ($0^\circ \to 85^\circ$), delta kanatçıklar ve kademe ayrılması. | — | ⏳ Planlı |
| **#60** | `jumo004`<br>`js/vehicles/jumo004.js` | **1944**<br>II. Dünya Savaşı<br>✈️ Hava • `germany` | **Junkers Jumo 004B (Me 262) — İlk Seri Üretim Turbojet & *Zwiebel* İğne Nozulu**<br>*(Deutsches Museum Münih / Smithsonian)* | 8 kademeli eksenel kompresör, 6 yanma odası, burun içindeki 2 zamanlı *Riedel* marş motoru ve egzoz kesit alanını değiştirmek için ileri-geri kayan soğan biçimli **"Zwiebel" (hareketli merkez iğne)** mekanizması! | — | ⏳ Planlı |

---

### 📦 GRUP 14 (Araç #61 – #65): Antik & Orta Çağ Doğu-Batı Kuşatma, Deniz ve Sibernetik Mekanikleri
| Sıra | Sabit `id` & Dosya | Yıl / Dönem / Ortam / Köken | Araç Adı & Müze Referansı | Gösterilecek Benzersiz Mekanik İlke & Canlı 3D Etkileşim | Geliştirici | Durum |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **#61** | `corvus`<br>`js/vehicles/corvus.js` | **MÖ 260**<br>Antik Çağ<br>⚓ Deniz • `rome` | **Roma *Corvus* (Karga) — Döner Aborda Köprüsü & Demir Gaga Çengeli**<br>*(Polybios I.22 / Mainz Antik Denizcilik Müzesi)* | Pruva direği etrafında 360° dönebilen, palangayla kaldırılıp düşman gemisinin güvertesine bırakıldığında altındaki **sivri demir gagayla (*raven's beak*) güverteyi delip iki gemiyi kilitleyen** deniz köprüsü. | — | ⏳ Planlı |
| **#62** | `zhinanche`<br>`js/vehicles/zhinanche.js` | **MS ~250**<br>Antik Çağ<br>🪖 Kara • `china` | **Çin "Güneyi Gösteren Araba" (*Zhinanche*) — İlk Diferansiyel Dişli Arabası**<br>*(National Museum of China / Science Museum London)* | Pusula kullanmadan, sağ ve sol tekerleklerin dönüş farkını **mekanik diferansiyel dişli takımıyla** hesaplayarak araba hangi yöne dönerse dönsün üstteki heykelin kolunu daima güneye sabit tutan mekanizma! | — | ⏳ Planlı |
| **#63** | `testudo_ram`<br>`js/vehicles/testudo_ram.js` | **MÖ 865 / MÖ 1.yy**<br>Antik Çağ<br>🪖 Kara • `rome` | **Kaplumbağa (*Testudo*) Zırhlı Koçbaşı & Zincirli Sarkaç Kirişi**<br>*(Vitruvius X.13 / British Museum)* | Islak deri ve demir levhalarla kaplı tekerlekli zırhlı çatı (*testudo*) içinde, tavan kirişlerinden çift zincirle asılı **koç başlı dev meşe sarkaç kirişi** ve taş duvar yıkım darbesi. | — | ⏳ Planlı |
| **#64** | `wagenburg`<br>`js/vehicles/wagenburg.js` | **1420**<br>Orta Çağ<br>🪖 Kara • `europe` | **Hussit Savaş Arabası (*Wagenburg*) — Mobil Kale & *Houfnice* Sahra Topu**<br>*(Prag Ulusal Müzesi / VHÚ Praha)* | Tekerleklerinden birbirine demir zincirlerle kilitlenen, alt ve yan atış mazgalları açılıp kapanan zırhlı savaş arabası, içinde erken dönem barutlu *houfnice* (obüs) ve *píšťala* (el topu). | — | ⏳ Planlı |
| **#65** | `geobukseon`<br>`js/vehicles/geobukseon.js` | **1592**<br>Barut & Rönesans<br>⚓ Deniz • `korea` | **Kore *Geobukseon* (Kaplumbağa Gemisi) — Çivili Zırhlı Çatı & Ejderha Pruvası**<br>*(War Memorial of Korea, Seul)* | Amiral Yi Sun-sin'in borda çıkartmalarını önleyen **demir dikenli kubbe çatısı**, pruvadaki ejderha başından kükürt dumanı/top ateşi püskürtme düzeneği ve 2 katlı kürek/top güvertesi. | — | ⏳ Planlı |

---

### 📦 GRUP 15 (Araç #66 – #70): Sanayi Devrimi, I. Dünya Savaşı & Klasik Topçu Mekanizmaları
| Sıra | Sabit `id` & Dosya | Yıl / Dönem / Ortam / Köken | Araç Adı & Müze Referansı | Gösterilecek Benzersiz Mekanik İlke & Canlı 3D Etkileşim | Geliştirici | Durum |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **#66** | `bigbertha`<br>`js/vehicles/bigbertha.js` | **1914**<br>I. Dünya Savaşı<br>🪖 Kara • `germany` | **Krupp 42 cm *Dicke Bertha* (M-Gerät) — Dev Kuşatma Obüsü & Vinçli Yükleyici**<br>*(WTS Koblenz / Imperial War Museum)* | 420 mm'lik dev obüs: yatay kama bloğu, devasa üst hidropnömatik geri tepme silindiri, **820 kg'lık mermiyi kaldıran raylı vinç arabası** ve tekerlek palet pabuçları (*Radgürtel*). | — | ⏳ Planlı |
| **#67** | `buffington`<br>`js/vehicles/buffington.js` | **1895**<br>Sanayi Devrimi<br>🪖 Kara • `usa` | **Buffington–Crozier "Kaybolan Top" (*Disappearing Gun*) — Karşı Ağırlıklı Kıyı Topu**<br>*(Fort Casey / Battery Chamberlin Museum)* | Kurşun karşı ağırlığın kuyuya inmesiyle beton siperin üstüne kalkan, ateşlendiğinde ise **kendi geri tepme enerjisiyle tekrar duvarın arkasına çöküp gizlenen** paralel kol mekanizması! | — | ⏳ Planlı |
| **#68** | `renaultft`<br>`js/vehicles/renaultft.js` | **1917**<br>I. Dünya Savaşı<br>🪖 Kara • `europe`* | **Renault FT — İlk 360° Döner Taretli Tank Şeması & Siper Kuyruk Kızağı**<br>*(Musée des Blindés Saumur / Bovington)* | Önde sürücü, ortada **360° tam döner taret** (37 mm Puteaux topu), arkada motor bölmesi, yaprak yaylı süspansiyon boji takımı ve sökülebilir siper aşma kuyruk kızağı. | — | ⏳ Planlı |
| **#69** | `rangefinder`<br>`js/vehicles/rangefinder.js` | **1914**<br>I. Dünya Savaşı<br>⚓ Deniz • `uk` | **Barr & Stroud Optik Mesafe Ölçer (*Coincidence Rangefinder*) & Prizma Çakıştırma**<br>*(Science Museum London / HMS Belfast)* | Zırhlı gemilerin taret üstündeki iki uçlu optik borusu: beşgen uç prizmalarından gelen üst ve alt yarım görüntüleri **hareketli kama prizmayla çakıştırarak** 20 km ötedeki hedefin mesafesini ölçme. | — | ⏳ Planlı |
| **#70** | `bofors40`<br>`js/vehicles/bofors40.js` | **1934 / 1940**<br>Savaşlar Arası / II.DS<br>🪖 Kara • `sweden` | **Bofors 40 mm L/60 Otomatik Uçaksavar Topu & Klipsli Üst Besleme**<br>*(Arsenalen / Imperial War Museum)* | Sağdaki yükseliş ve soldaki yön nişancısının el çarklarıyla döndürdüğü beşik, **4'lü mermi klipslerini üstten yutan otomatik pençe besleyici**, geri tepmeli kurma ve kovan fırlatma oluğu. | — | ⏳ Planlı |

---

### 📦 GRUP 16 (Araç #71 – #75): Soğuk Savaş & Modern Dönem (Türk Savunma Sanayii Dahil)
| Sıra | Sabit `id` & Dosya | Yıl / Dönem / Ortam / Köken | Araç Adı & Müze Referansı | Gösterilecek Benzersiz Mekanik İlke & Canlı 3D Etkileşim | Geliştirici | Durum |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **#71** | `gepard`<br>`js/vehicles/gepard.js` | **1976**<br>Soğuk Savaş / Modern<br>🪖 Kara • `germany` | **Flakpanzer Gepard — Çift Radarlı Otonom 2× 35 mm Oerlikon Uçaksavar Tankı**<br>*(Deutsches Panzermuseum Munster)* | Taret arkasında katlanır S-band arama radarı, taret önünde Ku-band takip radarı ve iki yanda dıştan takılı **2× 35 mm Oerlikon KDA** otomatik topların çift şeritli mühimmat beslemesi. | — | ⏳ Planlı |
| **#72** | `kamov`<br>`js/vehicles/kamov.js` | **1982**<br>Soğuk Savaş / Modern<br>✈️ Hava • `ussr` | **Kamov Ka-50 / Ka-27 — Eş-Eksenli Zıt Döner (*Coaxial*) Çift Rotor Kafası**<br>*(Monino Hava Kuvvetleri Müzesi)* | Kuyruk rotoruna ihtiyaç duymadan torku sıfırlayan, **iç içe geçen iki eş-eksenli şaft üzerinde zıt yönlerde dönen çift 3-palli rotor kafası** ve üst/alt yalpa plakaları (*swashplates*) biyel mekanizması! | — | ⏳ Planlı |
| **#73** | `mk41vls`<br>`js/vehicles/mk41vls.js` | **1986**<br>Modern<br>⚓ Deniz • `usa` | **Mk 41 Dikey Fırlatma Sistemi (*VLS*) — 8 Hücreli Modül & Ortak Gaz Bacası**<br>*(US Navy / Türk Donanması Fırkateynleri)* | Savaş gemisi güvertesi altındaki 8 hücreli kanister modülü: zırhlı hücre kapağının açılması, roket egzoz gazının **alt *plenum* odasından geçip merkez zırhlı bacadan (*uptake*) yukarı tahliye edilmesi**. | — | ⏳ Planlı |
| **#74** | `firtina`<br>`js/vehicles/firtina.js` | **2001**<br>Modern<br>🪖 Kara • `turkey` | **T-155 Fırtına — 155 mm L/52 Kundağı Motorlu Obüs & Otomatik Mermi Yükleme Kolu**<br>*(MKE / Harbiye Askerî Müzesi / ASFAT)* | 8 metre uzunluğundaki 155 mm L/52 namlu, hidropnömatik süspansiyon, taret arkasındaki döner mermi rafından mermiyi alıp her açıda namluya süren **robotik yükleme kolu (*flick rammer*)** ve *MRSI* çoklu atış. | — | ⏳ Planlı |
| **#75** | `korkut`<br>`js/vehicles/korkut.js` | **2016**<br>Modern<br>🪖 Kara • `turkey` | **ASELSAN KORKUT — 2× 35 mm Hava Savunma Sistemi & *ATOM* Parçacıklı Mühimmat**<br>*(ASELSAN / MKE)* | Stabilize insansız kule, ikiz 35 mm topların namlu ağzındaki **elektromanyetik hız ölçer ve indüktif tapalama bobini** ile merminin namludan çıkarken programlanıp hedef önünde tungsten parçacık bulutu oluşturması! | — | ⏳ Planlı |

> **Not (`*` İşaretli Köken Anahtarları):** `#50 yamato460` ekleneceği zaman `js/catalog.js` içindeki `FACETS.origin` dizisine `{ key: 'japan', label: 'Japonya' }`, `#68 renaultft` ekleneceği zaman `{ key: 'france', label: 'Fransa' }` eklenebilir (veya mevcut `europe` anahtarı kullanılabilir).

---

## 🛠️ 4. Her Araç İçin Standart 6 Adımlı Kontrol Listesi (Özet)

Her geliştirici listeden bir aracı üzerine aldığında [ARAC_EKLEME_REHBERI.md](file:///c:/Users/hyper/projeler/SavasAraclari/ARAC_EKLEME_REHBERI.md) ve [GEMINI_ARGON_GOREV_PROMPTU.md](file:///c:/Users/hyper/projeler/SavasAraclari/GEMINI_ARGON_GOREV_PROMPTU.md) uyarınca şu 6 adımı izler:

1. **PLAN:** `INCELEME_NOTLARI.md` dosyasına müze kaynaklarını, ölçeği, en az 12 parça grubunu ve mekanik formülleri (`v = ω × r`, `RPM = 0` duruşu) yaz.
2. **YEDEK:** `simulator.html` ve `js/catalog.js` dosyalarını `_yedek/YYYY-AA-GG_<id>/` klasörüne kopyala.
3. **KOD:** `js/vehicles/<id>.js` dosyasını oluştur (`ctx.THREE` kullan, global `THREE` kullanma; tüm grup açıklamaları, 6 adımlı `tourSteps`, 3 `sliders`, 4 `textures` Türkçe olsun).
4. **TEST:** `test_<id>.js` ile gerçek Three.js altında en az 12 grup, `< 500` mesh, `min.y ≈ 0.000 m`, `RPM = 0` tam duruş ve UTF-8 temizliğini doğrula (`DOĞRULANDI [<id>.js]`).
5. **ENTEGRASYON:** `git pull` sonrası `js/catalog.js` (`VEHICLES` + `SOURCES` en az 1 HTTPS müze linki) ve `simulator.html` içine ekle; `node tests/museum-links.cjs` testinden `PASS` al.
6. **KONTROL & NOT:** Headless tarayıcı ile `iso`, `engine/front` ve `breech` ekran görüntülerini alıp konsol hatası olmadığını (`0 error`) doğrula; bu tablodaki durumu `🟢 Tamamlandı` olarak güncelle.



## 5. Uygulama Geliştirme Planı — 9 Kasım 2026

Yeni araç listesinin yanında, mevcut koleksiyonun kullanımını iyileştirmek için aşağıdaki dört öneri plana eklendi. Önerilen uygulama sırası aşağıdadır; henüz geliştirmeye başlanmadı. Araç #46–#75 sırası ve mevcut görev sahiplikleri korunur.

| Öncelik | Geliştirme | Amaç ve kapsam | Tamamlanma ölçütü | Geliştirici | Durum |
| :---: | :--- | :--- | :--- | :---: | :---: |
| U1 | **Sade müze görünümü** | Model için daha geniş alan; gerektiğinde açılan teknik paneller. “Nedir?”, “Neyi değiştirdi?”, “Nasıl çalışır?” anlatımı. Mevcut ayrıntılı inceleme kontrollerine geçiş korunur. | Masaüstü ve mobilde model ile anlatım okunabilir; teknik görünümle geçiş, parça seçimi ve mevcut kontroller çalışır. Klavye ile erişim ve odak yönetimi doğrulanır. | — | ⏳ Planlı |
| U2 | **Koleksiyon genelinde görsel kalite kontrolü** | 45 aktif aracın genel ve yakın plan kameraları, ekrana sığdırma, metin okunabilirliği ve mobil kontrolleri için ortak kalite standardı. Son beş modelde giderilen kadraj sorunları kalan araçlarda da taranır. | Her araç için masaüstü, X-Ray ve mobil kontrol kaydı tutulur. Genel görünüşte model kesilmez; yakın planlar ilgili parçayı gösterir. Bulunan sorunlar düzeltilip ilgili testlerle doğrulanır. | — | ⏳ Planlı |
| U3 | **Araç karşılaştırma ekranı** | Mevcut Gatling–Maxim çalışmasını temel alarak iki aracın dönemini, boyutlarını, güç kaynağını ve getirdiği yeniliği karşılaştırma. İlk adaylar: Abdülhamid–U-505 ve J79–Pegasus. | İki araç seçimi, kaynak bağlantıları ve mobil düzen çalışır. Bilinmeyen değerler açıkça belirtilir; farklı türdeki ölçüler doğrudan eşdeğer sayılmaz. Pegasus, mevcut Harrier içindeki motor olarak doğru adlandırılır. | — | ⏳ Planlı |
| U4 | **Kişisel koleksiyon** | Favoriler, son incelenen araçlar ve kaldığın yerden devam. Sunucu veya hesap gerektirmeden tarayıcıda yerel saklama. | Yenileme sonrası kayıtlar korunur; kaldırma ve sıfırlama çalışır. Bozuk kayıt, kaldırılmış araç ve depolama engeli güvenli biçimde ele alınır. Verinin yalnız bu tarayıcıda tutulduğu açıklanır. | — | ⏳ Planlı |

### Uygulama ve doğrulama

- İlk önerilen iş **U1 — Sade müze görünümü**. Bu kayıt, işe başlandığı veya uygulamanın tamamlandığı anlamına gelmez.
- Başlayan geliştirici ilgili U kodunu sahiplenir. Ortak arayüz dosyalarına dokunan işler, yeni araç entegrasyonlarıyla koordine edilir.
- Mevcut seçildiğinde model yükleme, tarih çizelgesi, dokuz duraklı Türk tarihi rotası ve paylaşım/kaynak bağlantıları korunur.
- Her işte kapsama uygun testler ve masaüstü/mobil görsel kontroller tamamlanır; sonuçlar INCELEME_NOTLARI.md içine kaydedilir. Her iş için ayrı Türkçe commit atılır; push zamanı kullanıcının o işteki talimatına göre belirlenir.
