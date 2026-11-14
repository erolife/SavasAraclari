# 📋 YAPILACAK ARAÇLAR LİSTESİ & 2 KİŞİLİK ORTAK ÇALIŞMA PLANI

> **Son Güncelleme:** 12 Kasım 2026<br>
> **Mevcut Durum:** **60 Aktif Araç** (`110` HTTPS müze kaynağı • `57` test dosyası • `12` duraklı Türk tarihi rotası)
> - Başlangıç envanteri (`Grup 1 .. Grup 10`): **45 araç**
> - Kullanıcı önceliği ek araçlar (`Grup 17` & `Grup 18` — `fa330`, `shermancrab`, `french75`, `dreadnought`): **4 araç**
> - Bu listeden (`#46 .. #75`) tamamlananlar (`#46 t34`, `#47 norden`, `#48 f14`, `#49 patriot`, `#50 yamato460`, `#51 cezeri`, `#55 sultanhisar`, `#56 sr71_j58`, `#57 saturnv_f1`, `#68 renaultft`, `#74 firtina`): **11 / 30 araç**
>
> **Kalan Hedef:** **Grup 12 .. Grup 16** içinde **`⏳ Planlı` 19 araç** *(Grup 11 `5/5` tamamlandı)*

Bu dosya, projeyi geliştiren **iki geliştiricinin** aynı aracı mükerrer (tekrarlı) kodlamasını önlemek, dosya/kimlik (`id`) adlarını önceden sabitlemek ve Git birleştirme (*merge*) çakışmalarını sıfıra indirmek amacıyla hazırlanmıştır.

### 📌 Kullanıcı Önceliği Ek Araçlar (`#46–#75` Plan Sırası Dışında Eklenenler)

Aşağıdaki 4 araç kullanıcı önceliğiyle plan dışı grup numaralarında (`Grup 17` ve `Grup 18`) tamamlanmıştır; **`#46–#75` sıra numaraları ve `id` rezervasyonları aynen korunmuştur**:

| Kimlik / Grup | Yıl & Ortam | Çalışma | Geliştirici | Durum |
| :--- | :--- | :--- | :---: | :--- |
| `fa330` / Grup 17 | 1942 • ✈️ Hava (`germany`) | Focke-Achgelis Fa 330 Bachstelze, temsili denizaltı güvertesi ve çekme vinci | MesAi C | ✅ Tamamlandı (23 grup, 262 mesh — 9 Kasım 2026) |
| `shermancrab` / Grup 18 | 1944 • 🪖 Kara (`uk`) | Sherman Crab Mk I — 43 zincirli mayın dövücü tambur ve M4A4 Multibank motor kesiti | MesAi C | ✅ Tamamlandı (21 grup, 349 mesh — 11 Kasım 2026) |
| `french75` / Grup 18 | 1897 • 🪖 Kara (`france`) | Canon de 75 modèle 1897 — Hidropnömatik uzun geri tepme silindiri ve kama mekanizması | MesAi C | ✅ Tamamlandı (18 grup, 142 mesh — 11 Kasım 2026) |
| `dreadnought` / Grup 18 | 1906 • ⚓ Deniz (`uk`) | HMS Dreadnought — Parsons buhar türbinleri, 4 şaft ve 5 × çift 305 mm taret düzeni | MesAi C | ✅ Tamamlandı (34 grup, 460 mesh — 11 Kasım 2026) |

---

## 🤝 1. İki Kişilik Çakışmasız (*Merge-Conflict-Free*) Çalışma Kuralları

1. **Başlamadan Önce Sahiplenme (*Lock*):**
   - Bir araca başlamadan önce bu dosyadaki (`YAPILACAK_ARACLAR_LISTESI.md`) ilgili satırda **Geliştirici** sütununa kendi adınızı/kodunuzu yazın ve **Durum** sütununu `🔨 Yapılıyor` olarak değiştirip `git push` yapın (veya ekip arkadaşınıza hangi `#Sıra / id` ile başladığınızı bildirin).
2. **Sabit `id` ve Dosya Adı Kuralı:**
   - Tablodaki her aracın `id` değeri ve `js/vehicles/<id>.js` dosya adı **önceden rezerve edilmiştir**. Kendi başınıza farklı bir `id` türetmeyin.
3. **Paralel Çalışmada Git Çakışmasını Önleme (Güncel Dinamik Yükleyici Mimarisi):**
   - İki kişi aynı anda çalışırken `js/vehicles/<id>.js` ve `tests/<id>.cjs` dosyaları birbirinden tamamen bağımsızdır (**%0 çakışma riski**).
   - **ÖNEMLİ (`vehicle-loader.js`):** `simulator.html` dosyasına artık statik `<script>`, `ADAPTERS` veya `VEHICLE_ROOTS` girdisi **eklenmez** (`tests/vehicle-loader.cjs` bunu denetler). Ortak dokunulan tek kod dosyası `js/catalog.js` dosyasıdır!
   - Çakışma yaşamamak için:
     1. Önce kendi aracınızın `js/vehicles/<id>.js` modelini (`window.MuseumModelKit`) ve `tests/<id>.cjs` (`tests/model-harness.cjs`) birim testini tamamlayın.
     2. `js/catalog.js` entegrasyonunu yapmadan hemen önce **`git pull`** çekin, kaydı ekleyip `node tests/museum-links.cjs` ve `node tests/vehicle-loader.cjs` testlerini çalıştırın, ardından **`git commit && git push`** yapın.
4. **Tek / Çift Numara veya Grup Paylaşımı:**
   - Aynı anda çalışırken doğrudan farklı grupları (ör. bir geliştirici **Grup 11 / 12**, diğer geliştirici **Grup 13 / 15**) veya tek/çift sıra numaralarını paylaşabilirsiniz.

---

## ✅ 2. Mevcut 60 Aktif Aracın Tam Envanteri (Mükerrer Kayıt Kontrolü)

Aşağıdaki **60 araç ve mekanizma projede canlı (`status: 'live'`) olarak mevcuttur**; yeni araç veya ek öncelik seçerken bu `id` ve mekanizmalar tekrar edilmemelidir:

| Grup | Aktif Araçlar (`id` — Yıl — Kısa Ad) |
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
| **Grup 10 (41–45)** | `abdulhamid` (1886 Abdülhamid Denizaltısı) • `greekfire` (672 Bizans Rum Ateşi) • `r7` (1957/1961 R-7 Vostok & Korolev Haçı) • `harrier` (1969 Harrier GR.1 & Pegasus VTOL) • `strv103` (1967/1986 Stridsvagn 103C) |
| **Grup 11 (5/5 Tamamlandı)** | `t34` (1940 T-34/76 & Christie) • `norden` (1942 Norden M-9 Bomba Nişangâhı) • `f14` (1974 Grumman F-14D(R) Tomcat) • `patriot` (1984 MIM-104 Patriot & AN/MPQ-53) • `yamato460` (1941 IJN Yamato 460 mm Üçlü Taret) |
| **Grup 12 (2/5 Aktif)** | `cezeri` (1206 El-Cezerî Su Çarklı & İkiz Pompalı Düzenek — *Türk tarihi rotası 3. durak*) • `sultanhisar` (1915 Osmanlı Sultanhisar Torpidobotu — *Türk tarihi rotası 10. durak*) |
| **Grup 13 (2/5 Aktif)** | `sr71_j58` (1964 SR-71 Blackbird & J58 Turboramjet) • `saturnv_f1` (1967 Saturn V Rocketdyne F-1 Motoru) |
| **Grup 15 (1/5 Aktif)** | `renaultft` (1917 Renault FT Tankı) |
| **Grup 16 (1/5 Aktif)** | `firtina` (2001 T-155 Fırtına 155 mm L/52 Obüs — *Türk tarihi rotası 12. durak*) |
| **Grup 17 (Ek — 1)** | `fa330` (1942 Fa 330 Bachstelze Denizaltı Rotor Uçurtması) |
| **Grup 18 (Ek — 3)** | `shermancrab` (1944 Sherman Crab Mk I) • `french75` (1897 Fransız 75 mm Topu) • `dreadnought` (1906 HMS Dreadnought) |

### 📊 60 Araç Sonrası Güncel Kategori Dağılımı & Boşluk Analizi
- **Ortam Dağılımı (`60`):** 🪖 Kara (`35`), ⚓ Deniz (`12`), ✈️ Hava (`10`), 🚀 Uzay (`3` — `v2`, `r7`, `saturnv_f1`).
- **Dönem Dağılımı (`60`):** II. Dünya Savaşı (`14`), Barut & Rönesans (`11`), Soğuk Savaş (`8`), Sanayi Devrimi (`7`), Orta Çağ (`7`), I. Dünya Savaşı (`5`), Antik Çağ (`4`), Modern (`3` — `phalanx`, `patriot`, `firtina`), Savaşlar Arası (`1` — yalnızca `vecihi`).
- **Öncelikli Boşluk Notu:** `patriot`, `firtina` ve `saturnv_f1` ile Modern (`3`) ve Uzay (`3`) kategorileri güçlendirildi; `japan` (`Japonya`) köken filtresi `yamato460` ile birlikte `js/catalog.js` içine eklendi. Kalan 19 araç içindeki `#59 nike`, `#70 bofors40` (Savaşlar Arası), **Grup 14 (`#61..#65` — Antik & Orta Çağ)** ve **Grup 16 (`#71, #72, #73, #75` — Modern)** dönem/ortam dengesini daha da derinleştirecektir.

---

## 🚀 3. Planlanan Yapılacak Araçlar Listesi (`#46 .. #75` — 11 Tamamlandı, 19 Planlı)

### 🧭 Grup Bazında Hızlı Durum Özeti (Kalan 19 Araç)
| Grup | Tamamlanan (`11`) | Kalan Planlı Araçlar (`19`) |
| :--- | :--- | :--- |
| **Grup 11 (`#46–#50`)** | `#46 t34`, `#47 norden`, `#48 f14`, `#49 patriot`, `#50 yamato460` *(5/5 — Tamamlandı)* | — |
| **Grup 12 (`#51–#55`)** | `#51 cezeri`, `#55 sultanhisar` *(2/5)* | **`#52 rammah`**, **`#53 humbara`**, **`#54 mahmudiye`** |
| **Grup 13 (`#56–#60`)** | `#56 sr71_j58`, `#57 saturnv_f1` *(2/5)* | **`#58 b29_turret`**, **`#59 nike`**, **`#60 jumo004`** |
| **Grup 14 (`#61–#65`)** | — *(0/5)* | **`#61 corvus`**, **`#62 zhinanche`**, **`#63 testudo_ram`**, **`#64 wagenburg`**, **`#65 geobukseon`** |
| **Grup 15 (`#66–#70`)** | `#68 renaultft` *(1/5)* | **`#66 bigbertha`**, **`#67 buffington`**, **`#69 rangefinder`**, **`#70 bofors40`** |
| **Grup 16 (`#71–#75`)** | `#74 firtina` *(1/5)* | **`#71 gepard`**, **`#72 kamov`**, **`#73 mk41vls`**, **`#75 korkut`** |

---

### 📦 GRUP 11 (Araç #46 – #50): İkonik Zırhlı, Havacılık, Deniz Topçusu & Modern Hava Savunma
| Sıra | Sabit `id` & Dosya | Yıl / Dönem / Ortam / Köken | Araç Adı & Müze Referansı | Gösterilecek Benzersiz Mekanik İlke & Canlı 3D Etkileşim | Geliştirici | Durum |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **#46** | `t34`<br>`js/vehicles/t34.js` | **1940 / 1941**<br>II. Dünya Savaşı<br>🪖 Kara • `ussr` | **T-34/76 & Christie Helezon Süspansiyon + V-2 Dizel**<br>*(Bovington Tank Museum)* | Gövde iç duvarlarında eğimli çalışan **Christie helezon yayları**, eğimli zırh geometrisi, kütük engel testi ve **V-2-34 V12 dizel motoru**. | Antigravity | 🟢 Tamamlandı (18 grup, 246 mesh) |
| **#47** | `norden`<br>`js/vehicles/norden.js` | **1942**<br>II. Dünya Savaşı<br>✈️ Hava • `usa` | **Norden M-9 Bomba Nişangâhı — Mekanik Analog Bilgisayar**<br>*(Smithsonian NASM)* | İkiz jiroskop, **disk–bilye integratörü (*ball-and-disc integrator*)**, $-\varphi/2$ döner ayna teleskobu ve 1:1 gerçek açılı bomba koşusu eğitim panosu. | Antigravity | 🟢 Tamamlandı (16 grup, 58 mesh) |
| **#48** | `f14`<br>`js/vehicles/f14.js` | **1974**<br>Soğuk Savaş<br>✈️ Hava • `usa` | **Grumman F-14D(R) Tomcat — Değişken Ok Açılı (*Swing-Wing*) Kanat**<br>*(Smithsonian NASM Udvar-Hazy)* | Titanyum merkez kutu üzerindeki rulmanlarla **$20^\circ \leftrightarrow 68^\circ$ (ve $75^\circ$ gemi parkı) senkron kanatlar**, süpersonik alık rampaları, ikiz F110 ve 6 × *AIM-54 Phoenix*. | Antigravity | 🟢 Tamamlandı (17 grup, 157 mesh) |
| **#49** | `patriot`<br>`js/vehicles/patriot.js` | **1984 / 1991**<br>Modern<br>🪖 Kara • `usa` | **MIM-104 Patriot — M901 Fırlatma İstasyonu & AN/MPQ-53 Faz Dizinli Radar**<br>*(US Army ADA Museum / Smithsonian)* | Hidrolik dikme silindirleriyle $0^\circ \to 38^\circ$ yükselen 4'lü kanister, döner kaide, kırılabilir ön diyafram kapaklardan çıkan PAC-2 füzesi ve **faz dizinli (*phased array*) radar** kesiti. | Antigravity | 🟢 Tamamlandı (18 grup, 232 mesh) |
| **#50** | `yamato460`<br>`js/vehicles/yamato460.js` | **1941**<br>II. Dünya Savaşı<br>⚓ Deniz • `japan` | **IJN Yamato — 460 mm (*Type 94*) Üç Namlulu Deniz Topu Tareti & Asansörleri**<br>*(Yamato Museum, Kure)* | Tarihin en büyük deniz topu tareti (2.774 ton): su altı cephaneliğinden taret içine çıkan **3 katlı mermi ve barut kesesi asansörleri**, hidrolik tokmak ve 3 namlunun sarsıntıyı önleyen **gecikme bobinli (*delay coil*)** salvosu. | Antigravity | 🟢 Tamamlandı (18 grup, 118 mesh) |

---

### 📦 GRUP 12 (Araç #51 – #55): Türk, Osmanlı & İslam Bilim/Askerî Mühendislik Mirası
| Sıra | Sabit `id` & Dosya | Yıl / Dönem / Ortam / Köken | Araç Adı & Müze Referansı | Gösterilecek Benzersiz Mekanik İlke & Canlı 3D Etkileşim | Geliştirici | Durum |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **#51** | `cezeri`<br>`js/vehicles/cezeri.js` | **1206**<br>Orta Çağ<br>🪖 Kara • `seljuk` | **El-Cezerî'nin Su Çarklı, Kam Milli ve İkiz Pompalı Mekanik Düzeneği**<br>*(Topkapı Sarayı A.3472 / Muslim Heritage / Met Museum)* | Su çarkı tahrikli 2:1 taç–fener dişli, **4 fazlı yatay eksantrik kam mili**, oluklu salınım kolu (*slotted yoke*) ve tek yönlü klapeli **karşılıklı ikiz bakır su pompası** (*Türk tarihi rotası 3. durak*). | Antigravity | 🟢 Tamamlandı (18 grup, 116 mesh) |
| **#52** | `rammah`<br>`js/vehicles/rammah.js` | **~1280**<br>Orta Çağ<br>⚓ Deniz • `medieval_eu`* | **Hasan el-Rammah "Yumurta" (*al-Bayda*) Öz-İtkili Roket Torpidosu**<br>*(BnF Arabe 2825 / İslam Bilim Müzesi)* | Tarihin ilk roket tahrikli deniz torpidosu: birleştirilmiş iki bakır tavadan oluşan mercek gövde, güherçileli **ikiz roket itki tüpü**, su üstü denge kızakları ve pruva mahmuz iğnesi. | — | ⏳ Planlı |
| **#53** | `humbara`<br>`js/vehicles/humbara.js` | **1735**<br>Barut & Rönesans<br>🪖 Kara • `ottoman` | **Osmanlı Humbara Havan Topu & *Rubu Tahtası* (Açı Ölçer) Düzeneği**<br>*(Harbiye Askerî Müzesi, İstanbul)* | Kısa ve kalın namlulu dökme tunç Osmanlı havanı, $45^\circ \dots 75^\circ$ yüksek açılı muylu yatağı, **içi barut dolu küresel demir *humbara* (patlayıcı gülle)**, ahşap saniyeli tapa ve *rubu tahtası* çekülüyle parabolik yörünge hesabı. | — | ⏳ Planlı |
| **#54** | `mahmudiye`<br>`js/vehicles/mahmudiye.js` | **1829**<br>Sanayi Devrimi<br>⚓ Deniz • `ottoman` | **Osmanlı *Mahmudiye* Kalyonu — 3 Ambarlı 128 Toplu Borda Bataryası Kesiti**<br>*(İstanbul Deniz Müzesi, Beşiktaş)* | Dünyanın en büyük yelkenli harp gemilerinden *Mahmudiye*'nin **3 katlı (*kantara, orta, üst güverte*) borda kesiti**: meşe postalar, halatlı lombar kapakları ve 3 güvertenin kademeli borda salvosu. | MesAi C | ✅ Tamamlandı — 17 grup, 473 mesh, Türk tarihi rotası |
| **#55** | `sultanhisar`<br>`js/vehicles/sultanhisar.js` | **1915**<br>I. Dünya Savaşı<br>⚓ Deniz • `ottoman` | **Osmanlı *Sultanhisar* Torpidobotu & Güverte Üstü Döner Torpido Kovanı**<br>*(ANMM / TINA Çanakkale 1915)* | Çanakkale/Marmara'da *HMAS AE2* denizaltısını saf dışı bırakan *Sultanhisar*: **üç silindirli dikey buhar makinesi**, güverte üstü **döner torpido kovanları** ve Türk tarihi rotası 5. durağı. | MesAi C | 🟢 Tamamlandı (22 grup, 226 mesh) |

---

### 📦 GRUP 13 (Araç #56 – #60): Uzay, Stratejik Havacılık & Yüksek Hız (Mach 3+) Mühendisliği
| Sıra | Sabit `id` & Dosya | Yıl / Dönem / Ortam / Köken | Araç Adı & Müze Referansı | Gösterilecek Benzersiz Mekanik İlke & Canlı 3D Etkileşim | Geliştirici | Durum |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **#56** | `sr71_j58`<br>`js/vehicles/sr71_j58.js` | **1964 / 1966**<br>Soğuk Savaş<br>✈️ Hava • `usa` | **SR-71 Blackbird — Pratt & Whitney *J58* Turboramjet & Hareketli Giriş Konisi**<br>*(NASA / Smithsonian NASM Udvar-Hazy)* | Yüksek Mach'ta geriye kayan **sivri giriş konileri (*inlet spikes*)**, 9 kompresör / 2 türbin kademesi ve kompresör havasını art yakıcıya aktaran **altışar harici baypas borusu (*bleed tubes*)**. | MesAi C | 🟢 Tamamlandı (28 grup, 301 mesh) |
| **#57** | `saturnv_f1`<br>`js/vehicles/saturnv_f1.js` | **1967**<br>Soğuk Savaş<br>🚀 Uzay • `usa` | **Saturn V — Rocketdyne *F-1* Dev Roket Motoru & Türbopompa Kesiti**<br>*(Smithsonian NASM / Kennedy Space Center)* | Tarihin en güçlü tek yanma odalı sıvı yakıtlı roket motoru (`6.770 kN`): **55.000 BG LOX/RP-1 türbopompası**, rejeneratif soğutma boruları, türbin egzoz soğutma manifoldu ve $\pm 6^\circ$ hidrolik gimbal yatağı. | Antigravity | 🟢 Tamamlandı (17 grup, 73 mesh) |
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
| **#68** | `renaultft`<br>`js/vehicles/renaultft.js` | **1917**<br>I. Dünya Savaşı<br>🪖 Kara • `france` | **Renault FT — İlk 360° Döner Taretli Tank Şeması & Siper Kuyruk Kızağı**<br>*(The Tank Museum / El Goloso)* | Önde sürücü, ortada **360° tam döner sekizgen taret** (37 mm top), arkada 4 silindirli motor bölmesi, kapalı palet yolu ve sökülebilir siper aşma kuyruk kızağı. | MesAi C | 🟢 Tamamlandı (22 grup, 315 mesh) |
| **#69** | `rangefinder`<br>`js/vehicles/rangefinder.js` | **1914**<br>I. Dünya Savaşı<br>⚓ Deniz • `uk` | **Barr & Stroud Optik Mesafe Ölçer (*Coincidence Rangefinder*) & Prizma Çakıştırma**<br>*(Science Museum London / HMS Belfast)* | Zırhlı gemilerin taret üstündeki iki uçlu optik borusu: beşgen uç prizmalarından gelen üst ve alt yarım görüntüleri **hareketli kama prizmayla çakıştırarak** 20 km ötedeki hedefin mesafesini ölçme. | — | ⏳ Planlı |
| **#70** | `bofors40`<br>`js/vehicles/bofors40.js` | **1934 / 1940**<br>Savaşlar Arası / II.DS<br>🪖 Kara • `sweden` | **Bofors 40 mm L/60 Otomatik Uçaksavar Topu & Klipsli Üst Besleme**<br>*(Arsenalen / Imperial War Museum)* | Sağdaki yükseliş ve soldaki yön nişancısının el çarklarıyla döndürdüğü beşik, **4'lü mermi klipslerini üstten yutan otomatik pençe besleyici**, geri tepmeli kurma ve kovan fırlatma oluğu. | — | ⏳ Planlı |

---

### 📦 GRUP 16 (Araç #71 – #75): Soğuk Savaş & Modern Dönem (Türk Savunma Sanayii Dahil)
| Sıra | Sabit `id` & Dosya | Yıl / Dönem / Ortam / Köken | Araç Adı & Müze Referansı | Gösterilecek Benzersiz Mekanik İlke & Canlı 3D Etkileşim | Geliştirici | Durum |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **#71** | `gepard`<br>`js/vehicles/gepard.js` | **1976**<br>Soğuk Savaş / Modern<br>🪖 Kara • `germany` | **Flakpanzer Gepard — Çift Radarlı Otonom 2× 35 mm Oerlikon Uçaksavar Tankı**<br>*(Deutsches Panzermuseum Munster)* | Taret arkasında katlanır S-band arama radarı, taret önünde Ku-band takip radarı ve iki yanda dıştan takılı **2× 35 mm Oerlikon KDA** otomatik topların çift şeritli mühimmat beslemesi. | — | ⏳ Planlı |
| **#72** | `kamov`<br>`js/vehicles/kamov.js` | **1982**<br>Soğuk Savaş / Modern<br>✈️ Hava • `ussr` | **Kamov Ka-50 / Ka-27 — Eş-Eksenli Zıt Döner (*Coaxial*) Çift Rotor Kafası**<br>*(Monino Hava Kuvvetleri Müzesi)* | Kuyruk rotoruna ihtiyaç duymadan torku sıfırlayan, **iç içe geçen iki eş-eksenli şaft üzerinde zıt yönlerde dönen çift 3-palli rotor kafası** ve üst/alt yalpa plakaları (*swashplates*) biyel mekanizması! | — | ⏳ Planlı |
| **#73** | `mk41vls`<br>`js/vehicles/mk41vls.js` | **1986**<br>Modern<br>⚓ Deniz • `usa` | **Mk 41 Dikey Fırlatma Sistemi (*VLS*) — 8 Hücreli Modül & Ortak Gaz Bacası**<br>*(US Navy / Türk Donanması Fırkateynleri)* | Savaş gemisi güvertesi altındaki 8 hücreli kanister modülü: zırhlı hücre kapağının açılması, roket egzoz gazının **alt *plenum* odasından geçip merkez zırhlı bacadan (*uptake*) yukarı tahliye edilmesi**. | — | ⏳ Planlı |
| **#74** | `firtina`<br>`js/vehicles/firtina.js` | **2001**<br>Modern<br>🪖 Kara • `turkey` | **T-155 Fırtına — 155 mm L/52 Kundağı Motorlu Obüs & Otomatik Mermi Yükleme Kolu**<br>*(MKE / Harbiye Askerî Müzesi / ASFAT)* | 8 metre uzunluğundaki 155 mm L/52 namlu, 12× hidropnömatik süspansiyon, beşik üstü MVR radar ve 48 atımlık magazinden mermiyi alıp $+68^\circ$ dahil her açıda namluya süren **robotik yükleme kolu** (*Türk tarihi rotası 12. durak*). | Antigravity | 🟢 Tamamlandı (19 grup, 252 mesh) |
| **#75** | `korkut`<br>`js/vehicles/korkut.js` | **2016**<br>Modern<br>🪖 Kara • `turkey` | **ASELSAN KORKUT — 2× 35 mm Hava Savunma Sistemi & *ATOM* Parçacıklı Mühimmat**<br>*(ASELSAN / MKE)* | Stabilize insansız kule, ikiz 35 mm topların namlu ağzındaki **elektromanyetik hız ölçer ve indüktif tapalama bobini** ile merminin namludan çıkarken programlanıp hedef önünde tungsten parçacık bulutu oluşturması! | — | ⏳ Planlı |

> **Not (`*` İşaretli Köken Anahtarları):** `france` (`Fransa`) köken anahtarı `renaultft` ve `french75` ile birlikte, `japan` (`Japonya`) köken anahtarı ise `#50 yamato460` ile birlikte `js/catalog.js` içine eklendi. `#52 rammah` için mevcut `medieval_eu` kullanılabilir veya yeni bir köken etiketi tanımlanabilir.

---

## 🛠️ 4. Her Araç İçin Standart 6 Adımlı Kontrol Listesi (Güncel Mimari Özeti)

Her geliştirici listeden bir aracı üzerine aldığında [ARAC_EKLEME_REHBERI.md](file:///c:/Users/hyper/projeler/SavasAraclari/ARAC_EKLEME_REHBERI.md) uyarınca şu 6 adımı izler:

1. **SAHİPLENME & PLAN:** Bu dosyada aracın durumunu `🔨 Yapılıyor` olarak işaretle; müze kaynaklarını, ölçeği, parça gruplarını ve mekanik formülleri (`v = ω × r`, sıfır devirde duruş, uç konum açıklıkları) belirle.
2. **MODEL KODU:** `js/vehicles/<id>.js` dosyasını oluştur (`window.MuseumModelKit(ctx, '<id>')` veya `ctx.THREE` kullan; tüm grup açıklamaları, 6 adımlı `tourSteps`, 3 `sliders`, 4 `textures` Türkçe olsun; animasyon sırasında yeni geometri tahsis etme).
3. **BİRİM TESTİ:** `tests/<id>.cjs` (`tests/model-harness.cjs`) ile gerçek Three.js altında parça sayısı, `< 500` mesh, `min.y ≈ 0.000 m`, sıfır hızda/güçte tam duruş, çarpışmasız uç konumlar ve tampon yeniden kullanımını doğrula.
4. **KATALOG ENTEGRASYONU:** `git pull` sonrası yalnızca `js/catalog.js` (`VEHICLES` + `SOURCES` en az 1 doğrulanmış HTTPS müze bağlantısı) içine ekle (**`simulator.html` içine statik script ekleme!**).
5. **REGRESYON TESTLERİ:** `node tests/museum-links.cjs`, `node tests/vehicle-loader.cjs`, `node tests/history-timeline.cjs` ve (ilgiliyse) `node tests/turk-route.cjs` testlerinden `PASS` al.
6. **GÖRSEL KONTROL & NOT:** Tarayıcı / headless ekran görüntüleriyle masaüstü genel, X-Ray ve mobil görünümü inceleyip konsol hatası olmadığını doğrula; `INCELEME_NOTLARI.md` ve bu tablodaki durumu `🟢 Tamamlandı` olarak güncelle.

---

## 5. Uygulama Geliştirme Planı — 9 Kasım 2026

Yeni araç listesinin yanında, mevcut koleksiyonun kullanımını iyileştirmek için aşağıdaki dört öneri plana eklendi. Önerilen uygulama sırası aşağıdadır; henüz geliştirmeye başlanmadı. Araç `#46–#75` sırası ve mevcut görev sahiplikleri korunur.

| Öncelik | Geliştirme | Amaç ve kapsam | Tamamlanma ölçütü | Geliştirici | Durum |
| :---: | :--- | :--- | :--- | :---: | :---: |
| U1 | **Sade müze görünümü** | Model için daha geniş alan; gerektiğinde açılan teknik paneller. “Nedir?”, “Neyi değiştirdi?”, “Nasıl çalışır?” anlatımı. Mevcut ayrıntılı inceleme kontrollerine geçiş korunur. | Masaüstü ve mobilde model ile anlatım okunabilir; teknik görünümle geçiş, parça seçimi ve mevcut kontroller çalışır. Klavye ile erişim ve odak yönetimi doğrulanır. | — | ⏳ Planlı |
| U2 | **Koleksiyon genelinde görsel kalite kontrolü** | Mevcut aktif araçların (55+ model) genel ve yakın plan kameraları, ekrana sığdırma, metin okunabilirliği ve mobil kontrolleri için ortak kalite standardı. Son modellerde giderilen kadraj sorunları kalan araçlarda da taranır. | Her araç için masaüstü, X-Ray ve mobil kontrol kaydı tutulur. Genel görünüşte model kesilmez; yakın planlar ilgili parçayı gösterir. Bulunan sorunlar düzeltilip ilgili testlerle doğrulanır. | — | ⏳ Planlı |
| U3 | **Araç karşılaştırma ekranı** | Mevcut Gatling–Maxim çalışmasını temel alarak iki aracın dönemini, boyutlarını, güç kaynağını ve getirdiği yeniliği karşılaştırma. İlk adaylar: Abdülhamid–U-505 ve J79–Pegasus. | İki araç seçimi, kaynak bağlantıları ve mobil düzen çalışır. Bilinmeyen değerler açıkça belirtilir; farklı türdeki ölçüler doğrudan eşdeğer sayılmaz. Pegasus, mevcut Harrier içindeki motor olarak doğru adlandırılır. | — | ⏳ Planlı |
| U4 | **Kişisel koleksiyon** | Favoriler, son incelenen araçlar ve kaldığın yerden devam. Sunucu veya hesap gerektirmeden tarayıcıda yerel saklama. | Yenileme sonrası kayıtlar korunur; kaldırma ve sıfırlama çalışır. Bozuk kayıt, kaldırılmış araç ve depolama engeli güvenli biçimde ele alınır. Verinin yalnız bu tarayıcıda tutulduğu açıklanır. | — | ⏳ Planlı |

### Uygulama ve doğrulama

- İlk önerilen iş **U1 — Sade müze görünümü**. Bu kayıt, işe başlandığı veya uygulamanın tamamlandığı anlamına gelmez.
- Başlayan geliştirici ilgili U kodunu sahiplenir. Ortak arayüz dosyalarına dokunan işler, yeni araç entegrasyonlarıyla koordine edilir.
- Mevcut seçildiğinde model yükleme, tarih çizelgesi, on iki duraklı Türk tarihi rotası ve paylaşım/kaynak bağlantıları korunur.
- Her işte kapsama uygun testler ve masaüstü/mobil görsel kontroller tamamlanır; sonuçlar `INCELEME_NOTLARI.md` içine kaydedilir. Her iş için ayrı Türkçe commit atılır; push zamanı kullanıcının o işteki talimatına göre belirlenir.
