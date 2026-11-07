# İnceleme Notları ve Mühendislik Kayıt Defteri (`INCELEME_NOTLARI.md`)

> Bu dosya `GEMINI_ARGON_GOREV_PROMPTU.md` ve `ARAC_EKLEME_REHBERI.md` kuralları uyarınca her düzeltme ve yeni araç için tutulan şeffaf mühendislik kaydıdır.

---

## GÖREV A — Mevcut Araç Düzeltmeleri (Leonardo & Kadırga)

### A.1. ~1487 Leonardo da Vinci'nin Zırhlı Aracı — `js/vehicles/leonardo.js`
- **Durum:** Tamamlandı (7/7 rehber maddesi + 1 kullanıcı görsel geri bildirimi: koni/etek dışına taşan şasi kirişi ve dikmelerin düzeltilmesi)
- **Kaynaklar ve varsayımlar:**
  - *British Museum, Codex Arundel 1030, f.1030r (~1487):* 8 kişilik krank tahriki, 4 adet fener pinyon (*rocchetti*) ve 4 adet çivili taç dişli teker (*ruote dentate*), konik ahşap zırh kabuğu ve gözetleme kulesi.
  - *Ölçüler (tahmini rekonstrüksiyon):* Taban çapı `4,80 m` ($R_{\text{base}} = 2,40\text{ m}$), toplam yükseklik `~2,93 m`, tekerlek yarıçapı $R_w = 0,56\text{ m}$, taç dişli yarıçapı $R_c = 0,36\text{ m}$ (20 çivi), fener pinyon yarıçapı $r_p = 0,12\text{ m}$ (10 çubuk).
- **Tartışmalı tarihsel noktalar:**
  - Kodeks çiziminde ön ve arka tekerleklerin pinyonları birbirine bakan iç kenarlara yerleştirildiği için tekerlekler zıt yönlere döner. Bunun Leonardo tarafından çizimlerin çalınmasına karşı kasıtlı bir şifreleme mi yoksa basit bir perspektif/taslak hatası mı olduğu tarihçiler arasında **tartışılır**.
- **Önceki ve Sonraki Değerler Tablosu:**

| # | Konu | Önceki Değer / Durum | Sonraki Değer / Düzeltme |
|---|---|---|---|
| 1 | Bozuk metinler | `camLabels.suspension` (Arapca 'ayn-elif' bozuk karakteri) ve `getStatus: 'DÜZELTİLMİŞ: İLERlemeye HAZIR'` | `'Taç Dişli Teker'` ve `'DÜZELTİLMİŞ: İLERLEMEYE HAZIR'` (`[\u0600-\u06FF\uFFFD]` taraması temiz) |
| 2 | Fener pinyon ekseni ve tahrik mili | Pinyon ekseni X yönündeydi (dingile paralel) ve krank miline bağlı değildi | Her iki yanda (`x = ±1.04 m, y = 0.56 m`) **Z yönünde boyuna tahrik mili** (`z = -1.68 .. +1.02 m`) eklendi. Pinyonların (`r = 0.12 m`, 10 çubuk) ekseni **Z yönüne** çevrildi (taç dişliyle 90° dik kavrama). |
| 2b | Krank → Tahrik mili bağlantısı | Bağlantısızdı | `z = 0` düzleminde krank mili (`x = ±0.52, y = 1.08`) üzerindeki düz dişli (`r1 = 0.26 m`, 10 diş) ile alt tahrik mili (`x = ±1.04, y = 0.56`) üzerindeki düz dişli (`r2 = 0.475 m`, 16 diş) birbirine teğet kavraşır ($r_1 + r_2 = 0.735\text{ m} = \sqrt{0.52^2 + 0.52^2}$). |
| 2c | Ön/Arka Pinyon Z konumları ve Mod Geçişi | Yapay "ara avare dişli" (`partIdlerGear`) vardı | Ön pinyon `z = +0.82 m` (ön taç dişlinin `z = 1.18 - 0.36 = +0.82 m` arka kenarı). Arka pinyon **Kodeks modunda `z = -0.82 m`** (arka taç dişlinin `-1.18 + 0.36 = -0.82 m` ön kenarı → zıt dönüş), **Düzeltilmiş modda `z = -1.54 m`** (arka taç dişlinin `-1.18 - 0.36 = -1.54 m` arka kenarı → aynı yönde dönüş). 9. grup "Arka Pinyon Kaydırma Çatalı & Mandal Düzeneği" olarak yeniden modellendi. |
| 2d | Açısal hız ve telemetri | `wheelOmega = 0.5 * omegaCrank` (~3,1 km/sa @28 RPM) | $\omega_{\text{mil}} = \omega_{\text{krank}} \times (0.26 / 0.475) \approx 0.5474\,\omega_{\text{krank}}$, $\omega_{\text{teker}} = \omega_{\text{mil}} \times (0.12 / 0.36) \approx 0.1825\,\omega_{\text{krank}}$. 28 RPM'de hız $\approx 1.1\text{ km/sa}$. |
| 3 | Platform-tekerlek çakışması & dış kabuk taşması | `Y = 0.62 m`'deki tam daire (`R = 2.14 m`) tekerlekleri kesiyordu; ayrıca `z = ±1.80 m`'deki `3.40 m` genişlikli enine kiriş uçları ($r = 2.48\text{ m}$) ve `Y = 2.22 m` yüksekliğindeki 4 dikme ($r = 1.06\text{ m}$) dış koni/etek zırhından dışarı taşıyordu | Platform; merkez koridor (`1.56 × 3.28 m`), yan orta sahanlıklar (`0.84 × 0.96 m`) ve uç sahanlıklardan (`1.24 × 0.34 m`) oluşturuldu; tekerlek kuyuları tamamen boş bırakıldı. Ön/arka uç enine kirişler `z = ±1.68 m`, genişlik `1.80 m` ($r_{\text{köşe}} = 1.97\text{ m} < 2.24\text{ m}$), 4 iç dikme `x = ±0.58, z = ±0.58, Y = 0.62..1.56 m` ve 16 iç kaburga `r = 1.80 → 0.44 m` olarak güncellendi. Tüm iç köşe noktalarının dış kabuk içinde kaldığı vertex testiyle doğrulandı. |
| 4 | Havada duran top halkası | `ringTrackGeo` (`Y = 0.86 m, R = 1.78 m`) desteksizdi | `partCannonRing` altına ana şasi/platformdan yükselen 8 adet meşe dikme ve radyal destek kolu eklendi. |
| 5 | Mühimmat sayımı ve yazım hatası | Salvoda `-4` düşüyordu, dairesel atışta hiç düşmüyordu; `S.SalvoActive` yazım hatası vardı | Her top atışında (`fireSingleBarrel`) `S.ammoSalvos` 1 azalır (toplam 32 atım = 2 tam salvo). `S.SalvoActive` kaldırıldı. |
| 6 | Gizli alt sınır | `Math.max(S.rpm, 24)` | Kaldırıldı: `activeRpm = S.autoCrank ? S.rpm : 0`. Kullanıcı kaydırıcıyı 0'dan büyük bir değere çekerse `S.autoCrank = true` olur ve tam kaydırıcı değeri kullanılır. |
| 7 | Salvo ses yükü | 16 topta 16 kez `playCannonFire()` | Yalnızca `idx % 2 === 0` olduğunda çalınır (salvoda 8 ses). |

- **Mekanik Yön Hesabı (`v = ω × r`):**
  - Tekerlek taç dişlisi `YZ` düzlemindedir (dönme ekseni $+X$, yarıçapı $R_c = 0.36\text{ m}$).
  - Tahrik mili ve fener pinyon ekseni $+Z$ yönündedir (yarıçapı $r_p = 0.12\text{ m}$). Pinyon merkezi $x = \text{side} \times 1.04$, taç dişli çivileri $x \approx \text{side} \times 1.16$.
  - Temas noktasında (`x = side * 1.16, y = 0.56`) pinyonun $+Y$ (yukarı) teğetsel hızı $v_y = \omega_{\text{mil}} \cdot r_p$:
    - **Ön tekerlekte (`z_center = +1.18 m`):** Pinyon `z = +0.82 m` noktasındadır, yani tekerlek merkezine göre $\Delta z = -0.36\text{ m}$ (arka kenar). Yukarı doğru ($+Y$) kuvvet, $+X$ ekseni etrafında $\tau_x = \Delta y \cdot F_z - \Delta z \cdot F_y = -(-0.36) \cdot F_y = +0.36 F_y > 0$ tork üretir (`rotation.x` artar = $+Z$ yönünde ileri yuvarlanma).
    - **Arka tekerlekte (`z_center = -1.18 m`):**
      - *Kodeks Modu (`z_pinyon = -0.82 m`):* Tekerlek merkezine göre $\Delta z = +0.36\text{ m}$ (ön kenar). Yukarı doğru ($+Y$) kuvvet $\tau_x = -(+0.36) \cdot F_y = -0.36 F_y < 0$ (Ön tekerleğe **ZIT** yön!).
      - *Düzeltilmiş Mod (`z_pinyon = -1.54 m`):* Tekerlek merkezine göre $\Delta z = -0.36\text{ m}$ (arka kenar). Yukarı doğru ($+Y$) kuvvet $\tau_x = -(-0.36) \cdot F_y = +0.36 F_y > 0$ (Ön tekerlekle **AYNI** yön!).
- **Test komutu ve GERÇEK çıktı:**
  - Komut: `node "C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\threetest\test_leonardo.js"`
  - Gerçek Çıktı:
    `DOĞRULANDI [leonardo.js]: 14 grup, 492 mesh, min.y=-0.030m, Kodeks(fw=+0.0535, rw=-0.0535), Düzeltilmiş(dFront=+0.8025, dRear=+0.8025), RPM=0 duruş OK, Salvo mühimmat 32->16 & ses=8 OK, UTF-8 temiz.`
- **Ekran görüntüleri:**
  - `C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\rev_leonardo_iso.png` — Konik zırh ve alt etek tamamen temiz, hiçbir iç kiriş veya dikme dışarı taşmıyor.
  - `C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\rev_leonardo_suspension_xray.png` — X-Ray altında tekerlek kuyuları açık, boyuna Z-eksenli fener pinyonlar taç dişlilerle 90° dik kavraşıyor.
- **Bilinen eksikler ve bilinçli tavizler:**
  - Krank kollarını çeviren 8 kişilik insan figürü eklenmemiştir (projedeki diğer araçlarda da mürettebat figürü bulunmamaktadır).
- **İnceleyicinin özellikle bakması gerekenler:**
  1. `partIdlerGear` (kaydırma çatalı) ile arka fener pinyonların `z = -0.82 m ↔ -1.54 m` yumuşak geçişi.
  2. `z = 0` düzlemindeki üst krank düz dişlisi (`r1 = 0.26 m`) ile alt tahrik mili düz dişlisinin (`r2 = 0.475 m`) kavraşması.
  3. Konik zırhın dış yüzeyinde hiçbir iç iskelet çıkıntısının kalmadığı.
- **Çekirdek (`simulator.html`) değişikliği yapıldı mı?** Hayır.

---

### A.2. 1571 Osmanlı Kadırgası & Baş Topu — `js/vehicles/kadirga.js`
- **Durum:** Tamamlandı (6/6 madde)
- **Kaynaklar ve varsayımlar:**
  - *Tarihsel kaynaklar:* Katip Çelebi (*Tuhfetü'l-Kibâr fî Esfâri'l-Bihâr*), İstanbul Deniz Müzesi kadırga modelleri ve 16. yüzyıl Akdeniz kadırgası (*galley*) rekonstrüksiyonları (John F. Guilmartin, *Gunpowder and Galleys*).
  - *Ölçüler:* Tam bir kadırga (~42 m) yerine pruva ve orta kürek tezgâhını yüksek detayla gösteren `~11,45 m` uzunluğunda (`Z = -4.60 .. +5.85 m`) savaş modülü kesiti; gövde genişliği `3,24 m`, apostis genişliği `4,16 m`, baş topu boyu `2,65 m` (~24 libre kolunburna/şayka, tahmini).
- **Tartışmalı tarihsel noktalar:**
  - 1571 İnebahtı döneminde baş topunun geri tepmesini sönümlemekte kullanılan kızak ve *braga* halatı düzeninin tam geri tepme mesafesi gemi tonajına göre `~0,6 – 1,2 m` arasında değişir (modelde rambade boyuna uygun olarak `~0,75 m` alınmıştır).
- **Önceki ve Sonraki Değerler Tablosu:**

| # | Konu | Önceki Değer / Durum | Sonraki Değer / Düzeltme |
|---|---|---|---|
| 1 | Geri tepme yolu & çakışma | Top `z = 2.45 → 1.12 m` (`1,33 m`) kayıyor, `z = 1.02 m` takozunun içinden geçiyor ve `z = 0.55 m` direğine yaklaşıyordu | Geri tepme **`~0,75 m`** (`z = 2.45 → 1.70 m`, `recoilVel = 4.58`, fren ivmesi `14.0 m/sn²`). Arka takoz **`z = 0.58 m`**, kızak rayları **`z = 0.55 .. 3.45 m`**, rambade platformu **`z = 0.60 .. 3.60 m`**, pruva direği **`mastZ = -0.15 m`** konumuna alındı. Topun en geri konumunda (`z = 1.70 m`) kızak arkası `z = 0.78 m`'de durur (takoz `z = 0.58 m`'nin önünde, direk `z = -0.15 m`'den uzakta; `Box3` kesişimi = `false`). |
| 2 | Rambade platformu desteği | Pruvada gövde daraldığı için platform (`2.65 m` genişlik) yanlarda boşlukta duruyordu | Apostis kirişleri (`x = ±2.08 m`) `z = -4.55 .. +3.45 m` boyunca (`8,0 m`) pruvaya uzatıldı; rambade altına 3 adet enine kemere kirişi (`z = 0.85, 2.10, 3.35 m`), 6 dikme ve 6 adet eğik borda payandası eklendi. |
| 3 | Ana güverte kaplaması | Kemere kirişleri vardı ama `Y_DECK = 1.16 m` kaplama levhası yoktu | `partHullPlanking` (`isOuterShell: true`) içine `Y = 1.16 m` seviyesinde gövde profilini izleyen 16 dilimli ana güverte kaplaması eklendi (X-Ray modunda saydamlaşarak ambarı gösterir). |
| 4 | Gizli alt sınır | `Math.max(S.strokesPerMin, 18)` | Kaldırıldı: `activeSpm = S.autoRow ? S.strokesPerMin : 0`. |
| 5 | Telemetri birimi | `'0.0 (Dönüş)' + ' <span>Knot</span>'` | `0.0 <span>Knot (dönüş)</span>` olarak düzeltildi. |
| 6 | Dümen kaydırıcısı ezilmesi | `rowMode === 'pivot'` her karede `S.helmDeg` değerini eziyordu | Diferansiyel kürek salınımı ayrı `pivotYawDeg` değişkeniyle uygulanıyor; kullanıcı 3. kaydırıcıya (`helmDeg`) dokunduğunda `S.autoCombat = false` olur ve kullanıcının verdiği açı korunur. |

- **Test komutu ve GERÇEK çıktı:**
  - Komut: `node "C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\threetest\test_kadirga.js"`
  - Gerçek Çıktı:
    `DOĞRULANDI [kadirga.js]: 15 grup, 402 mesh, min.y=0.000m, Geri tepme(2.45m -> 1.70m -> 2.45m, direk/takoz çakışması YOK), Tempo=0 duruş OK, Pivot telemetri & dümen koruma OK, UTF-8 temiz.`
- **Ekran görüntüleri:**
  - `C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\rev_kadirga_iso.png` — Uzatılmış apostis kirişleri, rambade payandaları, `Z = -0.15 m`'ye çekilmiş trinketa direği ve ana güverte kaplaması net görünüyor.
  - `C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\rev_kadirga_breech.png` — Kızaklı baş topu, braga halatları ve rambade arka takozu çakışmasız hizalı.
- **Bilinen eksikler ve bilinçli tavizler:**
  - Tam 24 oturaklı (~42 m) kadırga yerine, topçu ve kürek mekaniğinin kamerada okunaklı olması için 8 çift kürekli pruva+orta savaş modülü (~11,45 m) modellenmiştir.
- **İnceleyicinin özellikle bakması gerekenler:**
  1. Baş topu ateşlendiğinde (`z = 2.45 → 1.70 m`) arka tampon takozu (`z = 0.58 m`) ve trinketa direği (`z = -0.15 m`) ile mesafesi.
  2. X-Ray modunda `partHullPlanking` içindeki 16 dilimli ana güvertenin saydamlaşarak alt ambardaki barut/su fıçılarını göstermesi.
  3. "Olduğu Yerde Nişan Dönüşü" (`pivot`) modundayken 3. kaydırıcının (`helmDeg`) kullanıcı tarafından serbestçe kontrol edilebilmesi.
- **Çekirdek (`simulator.html`) değişikliği yapıldı mı?** Hayır.

---

## GÖREV B — 2. Grup Araç #1: 1862 Gatling Makineli Silahı — `js/vehicles/gatling.js`

- **Durum:** Tamamlandı
- **Kaynaklar ve varsayımlar:**
  - *Birincil Patent:* Richard J. Gatling, **ABD Patenti No. 36,836** (*"Improvement in Revolving Battery-Guns"*, 4 Kasım 1862) ve geliştirilmiş **Model 1865 / 1866** pirinç kovanlı topçu arabası örnekleri (Fort Meade / Smithsonian örnekleri).
  - *Tarihsel ölçüler ve varsayımlar:*
    - **Kalibre:** `.58 inç` (~14,7 mm, 1862 kağıt/çelik tüp kovanlı model) / `.50-70` (1866 model).
    - **Namlu sayısı ve boyu:** 6 adet paralel yivli namlu, uzunluk $L_{\text{namlu}} \approx 0,92\text{ m}$ (~36 inç), demet dairesi yarıçapı $R_b = 0,068\text{ m}$.
    - **Topçu arabası tekerlekleri:** Standart Amerikan İç Savaşı (No. 1 Field Limber/Carriage) ahşap topçu tekerleği çapı $\approx 1,36\text{ m}$ ($R_w = 0,68\text{ m}$, 12 ispitli), iz genişliği $1,36\text{ m}$ ($X = \pm 0,68\text{ m}$).
    - **Dişli oranı (tahmini):** Arka/yan el krank milindeki konik dişli ($N_1 = 15$ diş, $r_1 = 0,045\text{ m}$) ile ana rotor milindeki konik pinyon ($N_2 = 15$ diş, $r_2 = 0,045\text{ m}$) arasında $1:1$ oran (1 krank devri = 1 tam namlu demeti dönüşü = 6 atış). 35 RPM krank devrinde $35 \times 6 = 210\text{ atım/dk}$ (1862 modelinin tarihsel ~200 atım/dk hızıyla tam uyumlu).
- **Tartışmalı tarihsel noktalar:**
  - 1862 tarihli ilk modelde barut ve kurşun kağıt kartuş yerine **pahalı çelik tüp haznecikler (steel chambers)** içinde ayrı ayrı besleniyordu ve namlu ile hazne arasındaki gaz kaçağı sorunu vardı; yekpare pirinç kovanlı tam güvenilir model 1865/1866'da ortaya çıktı. Açıklamalarda bu fark açıkça belirtilmiştir.
- **14 Bağımsız Mekanik Parça Grubu Planı (4 Alt Sistem):**
  - **Döner Namlu Demeti & Çerçeve (`barrel_group` — 3 Grup):**
    1. `gat_barrel_cluster`: 6 Adet Döner Çelik Namlu ($\varnothing 28\text{ mm}$, $L = 0,92\text{ m}$) & Ön/Arka Pirinç Bağlantı Diskleri
    2. `gat_main_shaft`: Merkez Ana Rotor Mili ($Z = -0,50 .. +1,00\text{ m}$) & Ön Yatak Burcu
    3. `gat_outer_frame`: Dikdörtgen Dövme Demir Yan Çerçeve Kolları, Ön Halka & Muylu (Trunnion) Yatakları
  - **Helisel Kam, 6 Kilit Sürgüsü & Krank (`breech_cam` — 5 Grup):**
    4. `gat_breech_casing`: Sabit Pirinç Kuyruk Muhafazası (X-Ray Dış Kabuk: `isOuterShell: true`)
    5. `gat_helical_cam`: Sabit Helisel Kam Silindiri, İleri İtme Rampası & Geri Çekme Rayı
    6. `gat_lock_bolts`: 6 Adet İleri-Geri Kayar Kilit Sürgüsü (Locks), Tırnaklar & İğne Çekiçleri
    7. `gat_cocking_ring`: Horoz Kurma & Bırakma Çemberi (Saat 6 Yönü Ateşleme Mandalı)
    8. `gat_crank_gears`: Arka El Krankı, Konik Dişli Çifti (90° Bevel Gear) & Dişli Kutusu
  - **Yerçekimli Şarjör & Kovan Tahliyesi (`feed_system` — 2 Grup):**
    9. `gat_ammo_hopper`: Üst Yerçekimli Pirinç Besleme Şarjörü (Hopper) & `.58` Kovan İstifi
    10. `gat_carrier_ejector`: 6 Oluklu Döner Besleme Tamburu (Carrier Block) & Alt Kovan Tahliye Kanalı
  - **1862 Topçu Arabası & Nişan (`carriage` — 4 Grup):**
    11. `gat_axle_body`: Ahşap/Demir Dingil Gövdesi, Muylu Çatalı & Yön (Azimuth) Döner Tabla
    12. `gat_elev_screw`: Kuyruk Altı Dikey Vidalı Yükseliş (Elevation) Mekanizması & El Çarkı
    13. `gat_wheels`: 12 İspitli Ahşap Topçu Tekerlekleri ($\varnothing 1,36\text{ m}$) & Demir Çemberler (Sol & Sağ)
    14. `gat_trail_box`: Çift Kuyruk Kirişi (Trail), Toprak Mahmuzu & Mühimmat Sandığı
- **Mekanik Hesaplar (Kam Fonksiyonu $z(\theta)$, $v = \omega \times r$ ve Uç Konumlar):**
  - **Koordinat Sistemi:**
    - Tekerlek yarıçapı $R_w = 0,68\text{ m}$, dingil merkezi $Y = 0,68\text{ m}, Z = 0,0\text{ m}$ (Tekerlek alt noktası $Y = 0,000\text{ m}$ zemin teması).
    - Arka kuyruk mahmuzu $Z = -1,64\text{ m}, Y = 0,005\text{ m}$ noktasında zemine oturur.
    - Muylu (yükseliş) pivotu: $Y = 0,98\text{ m}, Z = +0,05\text{ m}$.
  - **Helisel Kam Fonksiyonu $z_{\text{bolt}}(\phi_i)$:**
    - $i \in \{0..5\}$ numaralı namlu ve kilit sürgüsünün anlık açısı: $\phi_i = (\theta_{\text{rotor}} + i \cdot \frac{\pi}{3}) \bmod 2\pi$.
    - Saat 12 yönü ($\phi = 0$): Üstteki şarjörden mermi taşıyıcı oluğa (carrier) düşer; kilit sürgüsü en **geride** ($z_{\text{offset}} = 0,00\text{ m}$, yerel $z = -0,36\text{ m}$).
    - Saat 12 → Saat 5 yönü ($\phi \in [0, 0,85\pi]$): Sabit helisel kam rampası sürgüyü $S_{\text{stroke}} = 0,14\text{ m}$ **ileri** iter:
      $$z_{\text{offset}}(\phi) = S_{\text{stroke}} \cdot \frac{1 - \cos(\pi \cdot \frac{\phi}{0,85\pi})}{2}$$
      Mermi namlu atım yatağına ($z_{\text{offset}} = +0,14\text{ m}$, yerel $z = -0,22\text{ m}$) sürülür.
    - Saat 5 → Saat 7 yönü ($\phi \in [0,85\pi, 1,15\pi]$): Kama kilitlenme düzlüğü ($z_{\text{offset}} = +0,14\text{ m}$). **Saat 6 yönünde ($\phi = \pi$)** kurma halkası iğneyi serbest bırakır ve **ATEŞLEME** gerçekleşir!
    - Saat 7 → Saat 11 yönü ($\phi \in [1,15\pi, 1,85\pi]$): Geri çekme kam oluğu sürgüyü $z_{\text{offset}} = +0,14\text{ m} \to 0,00\text{ m}$ geriye çeker; tırnak boş kovanı dışarı çeker ve kovan alt tahliye penceresinden ($\phi \approx 1,55\pi$) aşağı düşer.
    - Saat 11 → Saat 12 yönü ($\phi \in [1,85\pi, 2\pi]$): Arka bekleme düzlüğü ($z_{\text{offset}} = 0,00\text{ m}$).
  - **Uç Konum Çakışma Kontrolü:**
    - Sürgülerin en ileri ucu yerel $z = -0,22 + 0,095 = -0,125\text{ m}$ (namlu arka yüzeyi $z = +0,04\text{ m}$ ile çakışmaz; `Box3` kesişimi = `false`).
    - Sürgülerin en geri ucu yerel $z = -0,36 - 0,085 = -0,445\text{ m}$ (kuyruk muhafazası arka kapağı $z = -0,51\text{ m}$ ile çakışmaz; `Box3` kesişimi = `false`).
  - **Konik Dişli Yön Hesabı ($v = \omega \times r$):**
    - Sağ yandaki el krankı ($+X$ ekseni, $z = -0,42\text{ m}$) ileri doğru ($\omega_{\text{crank}} > 0$) çevrildiğinde, temas noktasındaki ($x = +0,05\text{ m}, z = -0,42\text{ m}$) teğetsel hız $+Y$ yönündedir; bu da $Z$ eksenli ana rotor milini $\omega_{\text{rotor}} = +\omega_{\text{crank}}$ ($1:1$ oran) ile saat yönünde döndürür.
- **Test komutu ve GERÇEK çıktı:**
  - Komut: `node "C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\threetest\test_gatling.js"`
  - Gerçek Çıktı:
    `DOĞRULANDI [gatling.js]: 14 grup, 222 mesh, min.y=-0.000m, Kam kursu(-0.36m <-> -0.22m = 140mm, namlu/kapak çakışması YOK), 1 tur = 6 atış (48->42) & 210 atım/dk OK, RPM=0 duruş OK, Kuru tetik OK, UTF-8 temiz.`
- **Ekran görüntüleri:**
  - `C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\rev_gatling_iso.png` — 6 döner namlu, pirinç kuyruk muhafazası, üst yerçekimli şarjör, vidalı yükseliş çarkı, 12 ispitli topçu tekerlekleri ve alt namlu alevi tam hizalı.
  - `C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\rev_gatling_breech_xray.png` — İlk çekimde sağ tekerlek kuyruk muhafazasının bir kısmını örtüyordu; `camPresets.breech` açısı `[0.62, 1.48, -0.68]` olarak tekerlek iç-üst açısına güncellendi ve ikinci çekimde saydam pirinç muhafaza içindeki mavi helisel kam rayı, 6 kayar kilit sürgüsü ve 90° konik dişli çifti engelsiz doğrulandı.
- **Bilinen eksikler ve bilinçli tavizler:**
  - Helisel kam yüzeyi performans ve netlik amacıyla 36 ayrık kılavuz segmenti (`CAM_SEGS = 36`) olarak modellenmiştir; kilit sürgüsü kulakçıkları bu kanalı tam analitik $z(\phi)$ eğrisiyle takip eder.
- **İnceleyicinin özellikle bakması gerekenler:**
  1. X-Ray modunda (`Kızaklı Baş Topu / Helisel Kam & Kilitler` kamerası) mavi helisel kam oluğu ile 6 kilit sürgüsünün eşzamanlı dönüş + ileri-geri hareketi.
  2. Sağ paneldeki mod düğmesiyle **Canlı Mühimmat Atışı** ⇄ **Kuru Tetik Mekanik Eğitim** geçişi (kuru tetikte mermi azalmaz).
  3. 35 RPM'de dakikada 210 atım hızı ve her 60° ($\pi/3$) adımda Saat 6 yönündeki namlunun ateşlenmesi.
- **Çekirdek (`simulator.html`) değişikliği yapıldı mı?**
  - Yalnızca standart adaptör entegrasyonu satırları eklendi (`<script src="js/vehicles/gatling.js"></script>`, `const gatling = window.VehicleBuilders.gatling(buildCtx)` ve `ADAPTERS` / `VEHICLE_ROOTS` kaydı). Çekirdek mantığına dokunulmadı.

---

## GÖREV B — 2. Grup Araç #2: 1916 İngiliz Mark I Tankı ("Male") — `js/vehicles/mark1.js`

- **Durum:** Tamamlandı ve Doğrulandı
- **Kaynaklar ve varsayımlar:**
  - *Birincil Tarihsel Kaynaklar:* Bovington Tank Müzesi (*The Tank Museum*) Mark I / Mark IV teknik arşivleri, Sir William Tritton & Major Walter Gordon Wilson 1915–1916 "Mother / Mark I" spesifikasyonları ve David Fletcher (*British Mark I Tank 1916*, Osprey New Vanguard).
  - *Tarihsel ölçüler ve varsayımlar:*
    - **Gövde Boyu (kuyruk tekerleksiz):** $\approx 7,72\text{ m}$ ($Z = -3,80 .. +3,92\text{ m}$).
    - **Toplam Boy (arka direksiyon kuyruk tekerlekleri dahil):** $\approx 9,90\text{ m}$ ($Z = -5,86 .. +3,92\text{ m}$).
    - **Gövde Yüksekliği:** $\approx 2,44\text{ m}$ ($Y = 0,00 .. +2,44\text{ m}$).
    - **Genişlik:** Palet dış genişliği $\approx 2,68\text{ m}$ (palet merkezleri $X = \pm 1,08\text{ m}$, palet genişliği $0,52\text{ m}$); yan 6-pounder sponsonlarla toplam genişlik $\approx 4,18\text{ m}$ ($X = \pm 2,09\text{ m}$).
    - **Motor & Aktarma:** Merkezde açıkta duran **Foster-Daimler 6 silindirli sleeve-valve** benzinli motor ($105\text{ BG @ }1000\text{ RPM}$), 2 ileri vitesli ana şanzıman, sonsuz vida (*worm drive*) diferansiyel ve sağ/sol **2 vitesli ikincil palet vites kutuları** (*secondary gears*) + Coventry zincir tahrikiyle arka cer çarklarına ($Z = -3,22\text{ m}, Y = 1,32\text{ m}$) aktarım.
    - **Ana Silahlar ("Male" Modeli):** Sağ ve sol yan çıkıntılı yuvalarda (*sponsons*) 2 adet **QF 6-pounder 6 cwt Hotchkiss** ($\varnothing 57\text{ mm}$, $L/40$, namlu boyu $\approx 2,28\text{ m}$) deniz topu + 3 adet `.303 Hotchkiss` makineli tüfek.
- **Tartışmalı tarihsel noktalar:**
  - Arka kuyruk direksiyon tekerlekleri (*steering tail*) geniş dönüşlerde yardımcı olmak ve siper geçişinde denge sağlamak için tasarlanmıştı; ancak Somme cephesinde çamurda sıkıştığı ve topçu ateşinde kolayca hasar gördüğü için Kasım 1916'dan itibaren sahada sökülmeye başlandı ve Mark IV'te tamamen kaldırıldı.
- **16 Bağımsız Mekanik Parça Grubu Planı (5 Alt Sistem):**
  - **Eşkenar Dörtgen Zırh & Sponsonlar (`armor_hull` — 4 Grup):**
    1. `mk1_center_hull`: Merkez Perçinli Kutu Gövde & Öne Çıkıntılı Komutan/Sürücü Kabini (`isOuterShell: true`)
    2. `mk1_left_frame`: Sol Eşkenar Dörtgen (*Rhomboid*) Zırhlı Palet Çerçevesi (`isOuterShell: true`)
    3. `mk1_right_frame`: Sağ Eşkenar Dörtgen (*Rhomboid*) Zırhlı Palet Çerçevesi (`isOuterShell: true`)
    4. `mk1_sponson_housings`: Sağ ve Sol Zırhlı Yan Sponson Yuvaları & Mühimmat Dolapları
  - **Çevresel Paletler & Arka Direksiyon Kuyruğu (`tracks_tail` — 4 Grup):**
    5. `mk1_left_track`: Sol Çevresel Palet Zinciri (78 Dökme Çelik Bakla + 78 Mahmuz — `InstancedMesh`)
    6. `mk1_right_track`: Sağ Çevresel Palet Zinciri (78 Dökme Çelik Bakla + 78 Mahmuz — `InstancedMesh`)
    7. `mk1_sprockets_rollers`: Arka Dişli Cer Çarkları, Ön Gergi Tekerleri (*Idlers*) & Alt Makaralar
    8. `mk1_steering_tail`: Arka Hidrolik/Yaylı Direksiyon Kuyruk Çatalı & İkiz Kuyruk Tekerlekleri ($\varnothing 1,36\text{ m}$)
  - **2 × 6-Pounder Sponson Topları & MG (`weapons` — 3 Grup):**
    9. `mk1_left_6pdr`: Sol Sponson QF 6-Pounder (57 mm) L/40 Top, Kalkan & Geri Tepme Beşiği
    10. `mk1_right_6pdr`: Sağ Sponson QF 6-Pounder (57 mm) L/40 Top, Kalkan & Geri Tepme Beşiği
    11. `mk1_hotchkiss_mgs`: Ön Kabin ve Yan Sponson `.303` Hotchkiss Makineli Tüfekleri & 57 mm Mühimmat Rafları
  - **Foster-Daimler Motor & İkincil Vitesler (`powertrain` — 4 Grup):**
    12. `mk1_daimler_engine`: Merkez Foster-Daimler 105 BG 6 Silindirli Sleeve-Valve Motor & Volan
    13. `mk1_main_diff`: Ana Şanzıman, Sonsuz Vida (*Worm*) Diferansiyel & Enine Aks Mili
    14. `mk1_secondary_gears`: Sağ & Sol İkincil Vites Kutuları (*Gearsmen* Kolları) & Coventry Tahrik Zincirleri
    15. `mk1_fuel_exhaust`: Ön Üst İkiz Benzin Depoları (Yerçekimli Besleme), Radyatör & Tavan Egzoz Boruları
  - **Siper Aşma Zemini (`trench_base` — 1 Grup):**
    16. `mk1_trench_diorama`: Somme Cephesi Siper Kesiti, Parapet Kum Torbaları & Dikenli Tel Engeli (Yalnızca "Siper Aşma Modu"nda görünür)
- **Mekanik Hesaplar (Kapalı Rhomboid Palet Eğrisi, İkincil Vites Yönlendirme ve Uç Konumlar):**
  - **Kapalı Rhomboid Palet Eğrisi (`CatmullRomCurve3`):**
    - Palet, yan eşkenar dörtgen çerçevenin ($X = \pm 1,08\text{ m}$) dış çevresini tam dolaşır:
      - Alt düz temas hattı: $Z = -2,35 .. +1,65\text{ m}, Y = 0,044\text{ m}$ (bakla kalınlığı $0,048\text{ m}$ ve dış mahmuz $\Delta y = -0,028\text{ m}, h = 0,032\text{ m}$ ile en alt nokta $\min(y) = 0,044 - 0,028 - 0,016 = 0,000\text{ m}$ tam zemin teması!).
      - Ön 40° tırmanma rampası (siper ve parapet aşma burnu): $(Z = +1,65, Y = 0,044) \to (Z = +3,74, Y = 1,50)$.
      - Ön burun gergi çarkı (*front idler*) kavisi: $(Z = +3,84, Y = 1,76) \to (Z = +3,32, Y = 2,22)$.
      - Üst tavan dönüş hattı: $(Z = +2,35, Y = 2,27) \to (Z = -2,55, Y = 2,17)$.
      - Arka cer çarkı (*rear drive sprocket*) ve alt geri dönüş rampası: $(Z = -3,18, Y = 1,88) \to (Z = -3,62, Y = 1,12) \to (Z = -2,35, Y = 0,044)$.
    - `simulator.html` içindeki `addInstancedMesh` yardımcısı ile sol (`mk1_left_track`) ve sağ (`mk1_right_track`) paletlerin her biri 2 `InstancedMesh` (78 bakla + 78 mahmuz) olarak çizilir (toplam yalnız 4 draw call, toplam mesh sayısı `150`).
  - **4 Kişilik Mürettebat Yönlendirme Mekaniği ($v_L, v_R$):**
    - Motor devri $\text{RPM} \in [0, 1050]$ iken baz palet hızı $v_{\text{base}} = (\text{RPM} / 1000) \times 1,67\text{ m/sn}$ ($\approx 6,0\text{ km/sa}$; $800\text{ RPM}$'de $4,8\text{ km/sa}$).
    - **Direksiyon & İkincil Vites Kaydırıcısı (`steerDeg` $\in [-20^\circ, +20^\circ]$):**
      - $|\text{steerDeg}| < 2^\circ$: Her iki ikincil vites kutusu yüksek viteste ($g_L = 1,0, g_R = 1,0$), arka kuyruk tekerlekleri düz ($0^\circ$).
      - $|\text{steerDeg}| \in [2^\circ, 10^\circ]$: Arka kuyruk tekerlekleri $-0,85 \times \text{steerDeg}$ açısıyla döner; iç palet düşük vitese ($g_{\text{iç}} = 0,45$) alınır (geniş dönüş).
      - $|\text{steerDeg}| > 10^\circ$: İç taraftaki vitesçi (*gearsman*) ikincil vitesi boşa alıp palet frenini çeker ($g_{\text{iç}} = 0,0$, iç palet tamamen **DURUR**!), dış palet tam hızla ($g_{\text{dış}} = 1,0$) dönerek tankı keskin döndürür.
  - **6-Pounder Sponson Topu Geri Tepme ve Çakışma Kontrolü:**
    - Sponson pivotları $X = \pm 1,42\text{ m}, Y = 1,18\text{ m}, Z = 0,15\text{ m}$ konumundadır.
    - Ateşleme anında (`onFire()`) her iki 6-pounder top birden ateşlenir (`ammoCount: 64 -> 62`), namlu ve kama bloğu hidro-yaylı beşik üzerinde $z_{\text{recoil}} = -0,28\text{ m}$ geriye kayar ve yayla yerine döner; en uç geri tepme konumunda kama/dipçik kutusu ($|X| \ge 1,24\text{ m}$) merkezdeki Daimler motor bloğu ($|X| \le 0,24\text{ m}$) ile kesinlikle kesişmez (`Box3.intersectsBox === false`).
- **Test komutu ve GERÇEK çıktı:**
  - Komut: `node C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\threetest\test_mark1.js`
  - Gerçek Çıktı:
    `DOĞRULANDI [mark1.js]: 16 grup, 150 mesh (4 InstancedMesh x 78 bakla), min.y=-0.000m, Düz(4.8/4.8 km/sa) & Keskin Sol(0.0/4.8 km/sa, dLeft=0.0000, dRight=0.3359) OK, RPM=0 duruş OK, 6-Pdr Salvo(64->62, geri tepme=-0.28m, motor çakışması YOK) OK, Siper Modu OK, UTF-8 temiz.`
- **Ekran görüntüleri:**
  - `C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\rev_mark1_iso.png` — 1916 Somme "Solomon" çok renkli kamuflajı, eşkenar dörtgen (rhomboid) yan zırh çerçeveleri, gövdeyi tam dolaşan 78'er baklalı paletler, yan sponson 6-pounder topu ve arka direksiyon kuyruk tekerlekleri tam hizalı.
  - `C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\rev_mark1_engine_xray.png` — İlk çekimde yan eşkenar dörtgen çerçevelerde `isArmor: true` bayrağı olmadığı için X-Ray'de opak kalıyordu; `matHullArmor` ve `matFrameArmor` malzemelerine `isArmor: true` ve yan çerçevelere `isOuterShell: true` eklendi, `camPresets.engine` açısı `[4.6, 3.8, -1.6]` olarak güncellendi. İkinci çekimde saydamlaşan gövde içinde yeşil 6 silindirli Foster-Daimler motor bloğu, pirinç sonsuz vida diferansiyel, ikincil vites kutuları, vitesçi kolları ve Coventry tahrik zincirleri net biçimde doğrulandı.
  - `C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\rev_mark1_suspension.png` — Arka cer çarkları ve $\varnothing 1,36\text{ m}$ ikiz direksiyon kuyruk tekerlekleri ile A-çatalı süspansiyonu doğrulandı.
- **Bilinen eksikler ve bilinçli tavizler:**
  - Siper Aşma Modu (`trenchMode = true`) açıldığında gövdenin 40° ön burunla parapete tırmanış hareketi, Teardown kılavuz çizgilerinin bozulmaması için her parça grubunun içindeki `tiltSubgroup` alt gruplarının eşzamanlı yunuslama (`rotation.x`) ve yükselme (`position.y`) hareketiyle modellenmiştir.
- **İnceleyicinin özellikle bakması gerekenler:**
  1. Sağ paneldeki 3. kaydırıcı (**"Yönlendirme: İkincil Vites & Kuyruk Tekeri"**) $+15^\circ$ (Sol) veya $-15^\circ$ (Sağ) değerine çekildiğinde iç taraftaki paletin tamamen durması (`0.0 / 4.8 km/sa`), vitesçi kolunun geriye yatması ve arka kuyruk tekerleğinin yön değiştirmesi.
  2. **Zırh Kesiti (X-Ray)** + `Daimler & Vites` kamerasında merkezde açıkta çalışan 105 BG Daimler motoru, sonsuz vida diferansiyeli ve Coventry zincir tahriki.
  3. Sağ paneldeki **"Mod: Somme Siper & Parapet Aşma Gösterimi"** düğmesiyle kum torbalı siper ve dikenli tel sahnesinin açılması.
- **Çekirdek (`simulator.html`) değişikliği yapıldı mı?**
  - Yalnızca standart adaptör entegrasyonu satırları eklendi (`<script src="js/vehicles/mark1.js"></script>`, `const mark1 = window.VehicleBuilders.mark1(buildCtx)` ve `ADAPTERS` / `VEHICLE_ROOTS` kaydı). Çekirdek mantığına dokunulmadı.

---

## GÖREV B — 2. Grup Araç #3: 1917 Fokker Dr.I Üç Kanatlı Avcı — `js/vehicles/fokker.js`

- **Durum:** Tamamlandı ve Doğrulandı
- **Kaynaklar ve varsayımlar:**
  - *Birincil Tarihsel Kaynaklar:* Reinhold Platz & Anthony Fokker 1917 *Fokker F.I / Dr.I* fabrika teknik çizimleri, *Oberursel Ur.II (Le Rhône 9J kopyası)* 110 BG 9 silindirli döner motor kılavuzu, Fokker *Zentralsteuerung* (merkezi kam-iticili senkronizasyon) şeması ve Alex Imrie (*The Fokker Triplane*).
  - *Tarihsel ölçüler ve varsayımlar:*
    - **Üst / Orta / Alt Kanat Açıklığı:** Üst $7,19\text{ m}$ (`SEMI_TOP = 3.595 m`), Orta $6,23\text{ m}$ (`SEMI_MID = 3.115 m`), Alt $5,73\text{ m}$ (`SEMI_BOT = 2.865 m`). Kanat veteri (*chord*) her üç kanatta $1,00\text{ m}$, kalın Göttingen 298 (`~%16` kalınlık) konsol (*cantilever*) kutu kirişli profil.
    - **Toplam Gövde Boyu:** $5,77\text{ m}$ ($Z = -3,52 .. +2,25\text{ m}$); yükseklik $2,95\text{ m}$.
    - **Aks Kanatçığı (Axle Sub-wing):** İniş takımı tekerlek dingilini saran $1,52 \times 0,36\text{ m}$ aerodinamik taşıyıcı kaplama.
    - **Motor & Pervane:** **Oberursel Ur.II** 9 silindirli hava soğutmalı **döner (rotary) motor** ($110\text{ BG @ }1200\text{ RPM}$, ağırlık $\approx 140\text{ kg}$). Krank mili gövde yangın perdesine **SABİTTİR**; 9 silindir, karter ve $\varnothing 2,62\text{ m}$ (`PROP_R = 1.31 m`) *Axial* lamine ceviz pervane $1:1$ oranla **BİRLİKTE DÖNER**!
    - **Silahlar & Senkronizasyon:** Kokpit önünde 2 adet **7,92 mm LMG 08/15 "Spandau"** makineli tüfek ($2 \times 500 = 1000\text{ mermi}$) ve motor karterindeki kam halkasından tahrik alan Fokker *Zentralsteuerung* itici çubuklu senkronizasyon düzeneği.
- **Tartışmalı tarihsel noktalar:**
  - Popüler kültürde tüm Fokker Dr.I uçaklarının "kırmızı" olduğu sanılır; oysa gerçekte yalnızca Manfred von Richthofen'in birkaç uçağı (*Dr.I 425/17* vb.) tamamen kırmızıya boyanmıştı. Üretilen 320 adet Dr.I'in büyük çoğunluğu fabrikadan **zeytin yeşili / kahverengi çizgili kamuflaj (*Streifentarnung*)** ve açık gök mavisi alt yüzeyle çıkmıştır.
- **15 Bağımsız Mekanik Parça Grubu Planı (5 Alt Sistem):**
  - **Oberursel Ur.II Döner Motor & Pervane (`rotary_engine` — 4 Grup):**
    1. `fk_propeller`: Axial $\varnothing 2,62\text{ m}$ İki Palli Lamine Ceviz Pervane & Göbek Flanşı
    2. `fk_rotary_block`: Oberursel Ur.II Döner Karter & 9 Silindir Bloğu (Pervaneyle Birlikte Döner!)
    3. `fk_fixed_crank`: Sabit İçi Boş Krank Mili, Arka Motor Yatağı & Karbüratör Girişi (Gövdeye Sabit!)
    4. `fk_cowling`: Alüminyum At Nalı Motor Kaportası (X-Ray Dış Kabuk: `isOuterShell: true`)
  - **Senkronizasyon & Spandau Silahları (`sync_weapons` — 3 Grup):**
    5. `fk_sync_gear`: Fokker *Zentralsteuerung* Senkronizasyon Kam Halkası, İtici Çubuklar & Tetik Kamları
    6. `fk_spandau_guns`: İkiz 7,92 mm LMG 08/15 "Spandau" Hava Soğutmalı Makineli Tüfekler
    7. `fk_ammo_boxes`: Alüminyum Mühimmat Sandıkları & Boş Kovan Olukları ($2 \times 500\text{ Mermi}$)
  - **Üç Kanat (Triplane) & İç Kutu Kiriş (`triplane_wings` — 3 Grup):**
    8. `fk_wings_skin`: Üst, Orta ve Alt Kanat Kumaş Kaplaması (X-Ray Dış Kabuk: `isOuterShell: true`)
    9. `fk_wings_spars`: Kalın Konsol Ahşap Kutu Kirişler (*Box Spars*) & Huş Kontrplak Kaburgalar
    10. `fk_interplane_struts`: Kanatlar Arası Tekil Dikmeler (*Interplane Struts*) & Kabin Payandaları (Üç kanada tam temaslı)
  - **Çelik Boru Gövde & Kokpit (`fuselage_cockpit` — 3 Grup):**
    11. `fk_fuselage_skin`: Kumaş Gövde Kaplaması & *Balkenkreuz* İşaretleri (`isOuterShell: true`)
    12. `fk_steel_truss`: Kaynaklı Çelik Boru Gövde Kafesi (*Steel-Tube Truss*), Kokpit, Lövye & Koltuk
    13. `fk_fuel_castor`: Ön Benzin (70 L) ve Hint Yağı (*Castor Oil* — 20 L) Birleşik Tankı
  - **Kumanda Yüzeyleri & Aks Kanatçıklı İniş Takımı (`controls_gear` — 2 Grup):**
    14. `fk_control_surfaces`: Boynuz Dengeli Kanatçıklar, Üçgen İrtifa Dümeni & Tam Hareketli İstikamet Dümeni
    15. `fk_landing_gear`: Aerodinamik Aks Kanatçıklı (*Axle Sub-wing*) Ana İniş Takımı & Kuyruk Kızağı
- **Mekanik Hesaplar (Döner Motor, Senkronizasyon Açısı ve Zemin Teması):**
  - **Oberursel Ur.II Döner Motor Matematiği:**
    - Sabit krank mili (`partFixedCrank`) $\omega = 0$ ile gövdede sabit durur (`dCrank = 0`); 9 silindirli blok (`rotarySpinGrp`) ve pervane (`propSpinGrp`) $\theta(t) = \int \omega_{\text{motor}}\,dt$ açısıyla $1:1$ birlikte döner (`dProp === dRotary`).
  - **Senkronizasyon Matematiği (Açık vs Kapalı — Pervane İsabeti):**
    - İkiz Spandau namluları $X = \pm 0,18\text{ m}, Y = +0,39\text{ m}$ konumundan $+Z$ yönüne ateş eder. Pervane düzlemi ($Z = +2,22\text{ m}$) üzerinde mermi geçiş noktaları merkeze göre $\alpha_{\text{namlu}} = \text{atan2}(-x_{\text{namlu}}, y_{\text{namlu}})$ açılarındadır.
    - İki palli pervanenin pal açıları $\beta_0 = -\theta \pmod{2\pi}$ ve $\beta_1 = (\beta_0 + \pi) \pmod{2\pi}$'dir.
    - **Senkronizasyon AÇIK (`syncEnabled = true`):** $|\text{shortestAngleDist}(\beta_k, \alpha_{\text{namlu}})| < 0,22\text{ rad}$ ($\approx 12,6^\circ$) olduğunda Fokker kamı tetiği kilitler; mermi **yalnızca pala namlu önünde değilken** ateşlenir (`propHits === 0`).
    - **Senkronizasyon KAPALI (`syncEnabled = false`):** Tüfekler pala konumuna bakmaksızın ateş eder; atış anında $|\text{shortestAngleDist}(\beta_k, \alpha_{\text{namlu}})| < 0,22\text{ rad}$ ise mermi pervane palasına çarpar (`propHits++`) ve kırmızı kıvılcım çakar.
  - **Zemin Teması:**
    - Ana tekerlekler ($Y_{\text{merkez}} = -0,96\text{ m}, R_w = 0,35\text{ m}, Z = +0,88\text{ m}$) ve arka kuyruk kızağı ($Y_{\text{alt}} = -0,44\text{ m}, Z = -3,28\text{ m}$) üzerinden hesaplanan `GROUND_PITCH` ve `GROUND_Y` ile yerde dururken $\min(y) = 0,000\text{ m}$ tam zemin teması sağlanır.
- **Test komutu ve GERÇEK çıktı:**
  - Komut: `node C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\threetest\test_fokker.js`
  - Gerçek Çıktı:
    `DOĞRULANDI [fokker.js]: 15 grup, 264 mesh, min.y=-0.000m, Döner Motor 1:1 (dProp=4.500 === dRotary=4.500, sabitKrank=0) OK, RPM=0 duruş OK, Senkron AÇIK(mermi=985, pervaneİsabet=0) & Senkron KAPALI(mermi=968, pervaneİsabet=2) OK, Dikme-Kanat teması OK, UTF-8 temiz.`
- **Ekran görüntüleri:**
  - `C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\rev_fokker_iso.png` — Fabrika standart çizgili kamuflajı (*Streifentarnung*), üç kanatlı (triplane) konsol yapı, kanatlar arası tekil dikmeler, aks kanatçıklı iniş takımı ve dönen Axial pervane.
  - `C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\rev_fokker_front_xray.png` — X-Ray burun kesitinde saydamlaşan at nalı kaporta içinde 9 silindirli Oberursel Ur.II döner motor, bakır emme boruları, çelik boru gövde kafesi ve üç kanadın içindeki kalın ahşap kutu kirişler + huş kontrplak kaburgalar.
  - `C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\rev_fokker_breech_xray.png` — İlk çekimde `breech` kamerası biraz alçak kaldığı için `camPresets.breech` `[1.95, 2.25, 2.55]` olarak yükseltildi; ikinci çekimde döner motorun arkasındaki sabit krank mili, pirinç senkronizasyon kam halkası, itici çubuklar, ikiz 7,92 mm Spandau makineli tüfekler ve benzin/hint yağı tankı engelsiz doğrulandı.
- **Bilinen eksikler ve bilinçli tavizler:**
  - Yüksek devirde (1100 RPM) ekran yenileme hızı nedeniyle oluşan stroboskopik donma etkisini önlemek için görsel açısal hız üst sınırı `18 rad/sn` ile sınırlandırılmış ve yarı-saydam pervane diski (`propBlurDisc`) ile desteklenmiştir (`RPM = 0` iken tam `0 rad/sn` olarak durur).
- **İnceleyicinin özellikle bakması gerekenler:**
  1. **X-Ray + `Döner Motor` kamerası:** Krank mili (`3. Sabit İçi Boş Krank Mili`) gövdeye sabit dururken 9 silindirli Oberursel Ur.II bloğunun pervaneyle 1:1 birlikte dönmesi.
  2. Sağ paneldeki **"⚙️ Senkronizasyon: AÇIK ⇄ ⚠️ Senkronizasyon: KAPALI"** düğmesi: Senkronizasyon kapatılıp ateşlendiğinde mermilerin dönen pervaneyi vurması (`PERVANE İSABETİ` sayacının artması ve kırmızı kıvılcım).
  3. 4 tarihsel kaplama seçeneği: Varsayılan *Fabrika Çizgili (Streifentarnung)* yanında *Kızıl Baron (Dr.I 425/17)*, *Werner Voss (F.I 103/17)* ve *Jasta 18 "Raben"*.
- **Çekirdek (`simulator.html`) değişikliği yapıldı mı?**
  - Yalnızca standart adaptör entegrasyonu satırları eklendi (`<script src="js/vehicles/fokker.js"></script>`, `const fokker = window.VehicleBuilders.fokker(buildCtx)` ve `ADAPTERS` / `VEHICLE_ROOTS` kaydı). Çekirdek mantığına dokunulmadı.

---

# GÖREV D — 3. Grup Araçlarının Eklenmesi

## 4. 1862 USS Monitor & Ericsson Döner Taret — `js/vehicles/monitor.js`
- **Durum:** Tamamlandı (`15 parça grubu`, `213 mesh`, `min.y = -0,000 m`)
- **Kaynaklar ve varsayımlar:**
  - *Gerçek boyutlar (John Ericsson 1861/1862 tasarım çizimleri, HABS/HAER VA-1396 ve The Mariners' Museum kurtarılan taret/motor verileri):*
    - Üst Zırhlı Sal Gövde (*Upper Armored Raft*): Tam boy `172 ft` (`52,4 m`), genişlik `41 ft 6 in` (`12,65 m`), su kesimi (draft) `10 ft 6 in` (`3,20 m`), su üstü borda yüksekliği (*freeboard*) yalnızca `~18 in` (`0,46 m`).
    - Alt Demir Tekne (*Lower Iron Hull*): Boy `124 ft` (`37,8 m`), genişlik `34 ft` (`10,36 m`).
    - Ericsson Döner Taret: İç çap `20 ft` (`6,10 m`), dış çap `21 ft 4 in` (`6,50 m`), yükseklik `9 ft` (`2,74 m`), zırh kalınlığı **8 kat × 1 inç (`25,4 mm`) haddelenmiş dövme demir plaka = toplam `8 in` (`203 mm`)**, ağırlık `~120 long ton`.
    - Ana Silahlar: Yan yana **2 × 11 inç (`279 mm`) Dahlgren yivsiz kabuk/gülle topu** (her biri `~15.700 lb / 7.120 kg`, namlu boyu `~3,35 m`, katı demir gülle `~168 lb / 76 kg` veya patlayıcı humbara `~136 lb / 61,7 kg`, barut hakkı `15 lb / 6,8 kg` — 1862 Hampton Roads standart emniyet sınırı).
    - Ana Tahrik: Ericsson **36 inç çaplı çift pistonlu yatay "titreşimli manivela" (*vibrating-lever*) buhar motoru** (`~320 IHP`, maks. ~60–80 RPM, azami hız `~6–8 knot`), 2 adet Martin su borulu kazan ve 4 kanatlı `9 ft` (`2,74 m`) dökme demir Ericsson uskuru.
  - *Sahne Ölçeği (Taret ve makine dairesinin 18 m müze ızgarasında detaylı okunabilmesi için `1:2,2` taret ölçeği, `10,4 m` kesit gövde):*
    - Deniz tabanı/kızak alt yüzeyi: `y = 0,000 m`, su hattı yüzeyi `Y_WATER = 0,92 m`, zırhlı ana güverte `Y_DECK = 1,18 m` (su üstü *freeboard* = `0,26 m`).
    - Üst Zırhlı Sal: Boy `10,40 m` (`z = -5,20 .. +5,20 m`), genişlik `3,60 m` (`x = -1,80 .. +1,80 m`).
    - Alt Demir Tekne: Boy `7,80 m` (`z = -3,90 .. +3,90 m`), genişlik `2,80 m` (`x = -1,40 .. +1,40 m`), `y = 0,14 .. 0,92 m`.
    - Ericsson Döner Taret: Merkez `(x = 0, z = +0,35 m)`, dış yarıçap `R_TURRET_OUT = 1,40 m` (çap `2,80 m`), iç yarıçap `R_TURRET_IN = 1,28 m` (zırh kalınlığı `0,12 m`, 8 eşmerkezli katman), yükseklik `H_TURRET = 1,25 m` (`y = 1,18 .. 2,43 m`).
- **Tartışmalı tarihsel noktalar:**
  - *Taret Sızdırmazlığı ve Kaldırma Kama Mekanizması:* Ericsson taretin tüm ağırlığını güverte halkasına değil, gemi omurgasına oturan **merkezi dövme demir mile (`Ø 9 inç`)** taşıtmıştır. Muharebe öncesi milin altındaki kama (*wedge key*) çakılarak taret güverteden hafifçe kaldırılır ve buharlı yardımcı motorla döndürülürdü; ancak bu boşluktan içeri su girdiği ve tareti tam durdurmanın zor olduğu (bazen topçuların taret dönerken "uçarak" ateş ettiği) tarihsel kaynaklarda tartışılır.
  - *15 lb vs 30 lb Barut Hakkı:* 9 Mart 1862 Hampton Roads çarpışmasında Donanma Bürosu namlu çatlaması endişesiyle barut hakkını `15 lb` (`6,8 kg`) ile sınırlamıştır. Daha sonra yapılan testlerde `30 lb` (`13,6 kg`) barutla *CSS Virginia* zırhının delinebileceği öne sürülmüştür; bu durum parça açıklamalarında açıkça belirtilmiştir.
- **15 Bağımsız Mekanik Parça Grubu (4 Alt Sistem):**
  - **8 Katmanlı Döner Taret & Mil (`turret_system` — 5 Grup):**
    1. `mn_turret_armor`: 8 Katmanlı (8×1 inç) Dövme Demir Döner Taret Zırhı (`isOuterShell: true`, X-Ray'de saydamlaşır ve 8 eşmerkezli katmanı görünür)
    2. `mn_roof_grating`: Taret Üst Havalandırma Izgarası, Raylar & Komutan Nişan Siperi
    3. `mn_center_spindle`: Merkezi Dövme Demir Taret Mili (`x=0, z=+0,35 m`), Kaldırma Kaması & Çapraz Gergi Kirişleri
    4. `mn_turret_gears`: Güverte Altı Ana Dişli Çark (`R = 0,72 m`) & 2 Silindirli Yardımcı Taret Buhar Motoru (`r_pin = 0,18 m`, 4:1 oran)
    5. `mn_port_stoppers`: Ağır Dövme Demir Sarkaçlı Lombar Kepenkleri (*Pendulum Port Stoppers*)
  - **2 × 11 İnç Dahlgren Topları & Cephanelik (`artillery` — 4 Grup):**
    6. `mn_left_dahlgren`: İskele (Sol) 11 İnç (`279 mm`) Dahlgren Yivsiz Topu (`x = -0,44 m`) & Sürtünmeli Geri Tepme Kızağı
    7. `mn_right_dahlgren`: Sancak (Sağ) 11 İnç (`279 mm`) Dahlgren Yivsiz Topu (`x = +0,44 m`) & Sürtünmeli Geri Tepme Kızağı
    8. `mn_recoil_slides`: Taret İçi Demir Kızak Rayları, Sürtünme Fren Kolları, El Çarkları & Gülle Vinç Palangası
    9. `mn_shell_magazine`: Alt Cephanelik, 11 İnç Küresel Humbara/Gülle İstifi & Barut Fıçıları (`z = +1,95 m`)
  - **Zırhlı Sal Gövde, Kaptan Köşkü & Su Hattı (`armored_hull` — 3 Grup):**
    10. `mn_armored_deck`: Üst Zırhlı Sal Güvertesi (*Armored Raft Overhang*), Zırh Kuşağı & Pirinç Taret Halkası (`isOuterShell: true`)
    11. `mn_lower_hull`: Alt Demir Tekne, Omurga, Enine Bölmeler & Çapa Kuyusu (`z = +4,15 m`)
    12. `mn_pilot_house`: Pruva Kütük Tipi Zırhlı Kaptan Köşkü (*Pilot House*, `z = +3,35 m`), Gözetleme Yarıkları & Dümen Çarkı + Yarı Saydam Deniz Yüzeyi
  - **Ericsson Titreşimli Manivela Motoru & Uskur (`steam_propulsion` — 3 Grup):**
    13. `mn_vibrating_engine`: Ericsson Çift Pistonlu "Titreşimli Manivela" (*Vibrating-Lever*) Ana Buhar Motoru (`z = -2,85 m`)
    14. `mn_boilers_blower`: 2 × Martin Su Borulu Kazan, Yatkın Duman Boruları & Santrifüj Buharlı Havalandırma Fanı (`z = -1,25 m`)
    15. `mn_propeller_rudder`: 4 Kanatlı `9 ft` Ericsson Dökme Demir Uskur (`z = -4,45 m`), Pervane Şaftı & Dengeli Dümen
- **Mekanik Hesaplar (Dişli Oranları, `v = ω × r` Yön Hesabı ve Uç Konum Çakışma Kontrolü):**
  - **1. Taret Dönüş Dişlisi (`v = ω × r`):**
    - Taret merkezi $C_B = (0, 0,72, +0,35)$, güverte altı ana dişli çark yarıçapı $R_B = 0,72\text{ m}$ (Y ekseni).
    - Yardımcı buhar motorunun sürdüğü dikey pinyon mili merkezi $C_P = (-0,90, 0,72, +0,35)$, pinyon yarıçapı $r_P = 0,18\text{ m}$ (Y ekseni).
    - Eksenler arası mesafe $|C_B - C_P| = 0,90\text{ m} = R_B + r_P = 0,72 + 0,18\text{ m}$ (tam diş teması, $P = (-0,72, 0,72, +0,35)$).
    - Taret $\omega_B\,\hat{j}$ hızıyla dönerken temas noktasındaki çizgisel hız:
      $$v_P = (\omega_B\,\hat{j}) \times (-0,72\,\hat{i}) = +0,72\,\omega_B\,\hat{k}$$
    - Pinyonun aynı $v_P$ hızını üretmesi için:
      $$v_P = (\omega_P\,\hat{j}) \times (+0,18\,\hat{i}) = -0,18\,\omega_P\,\hat{k} \implies \omega_P = -\frac{0,72}{0,18}\,\omega_B = -4,0\,\omega_B$$
    - Dolayısıyla taret $\Delta\psi$ kadar döndüğünde pinyon $\Delta\phi_P = -4,0\,\Delta\psi$ kadar zıt yönde döner.
  - **2. 11 İnç Dahlgren Geri Tepme ve Sarkaçlı Kepenk Uç Konumları:**
    - İki top taret içinde $x_{\text{yerel}} = \pm 0,44\text{ m}$ eksenlerindedir (merkezi mil $x = 0, r = 0,11\text{ m}$'den $0,16\text{ m}$ net açıklıkla ayrılır).
    - Batarya konumunda (`slideBack = 0`): namlu kuyruk topuzu $z_{\text{yerel}} = -0,42\text{ m}$, namlu ağzı $z_{\text{yerel}} = +1,48\text{ m}$ (lombar dışına $0,20\text{ m}$ çıkar).
    - Maksimum geri tepmede (`MAX_RECOIL = 0,42 m`): namlu kuyruk topuzu $z_{\text{yerel}} = -0,84\text{ m}$ konumuna gelir.
    - $x = \pm 0,44\text{ m}$ kesitinde taret arka iç duvarı $z_{\text{duvar}} = -\sqrt{1,28^2 - 0,44^2} = -1,202\text{ m}$'dir.
    - $-0,84\text{ m} > -1,202\text{ m}$ olduğundan en uç geri tepme konumunda bile namlu kuyruğu ile taret iç duvarı arasında **$0,362\text{ m}$ net boşluk** kalır (hiçbir parçanın içinden geçmez).
    - **🛡️ Kepenk Kapalı (`shuttersClosed = true`) Modu:** Toplar taret içine $0,36\text{ m}$ geri çekilir ($z_{\text{ağız}} = +1,12\text{ m} < R_{\text{in}} = 1,28\text{ m}$) ve sarkaçlı lombar kepenkleri $\pm 38^\circ \to 0^\circ$ kapanarak lombar deliklerini örter.
  - **3. Ericsson Titreşimli Manivela Motoru (`RPM = 0` Duruş Dahil):**
    - Motor krank açısı $\theta_E(t) = \int 2\pi\frac{\text{RPM}}{60}\,dt$. `RPM === 0` iken $\Delta\theta_E = 0$, manivelalar ve 4 kanatlı uskur tamamen durur.
    - Sağ ve sol yatay piston kolları $\pm\sin(\theta_E)$ ile salınırken, titreşimli manivela kolları (*rocker shafts*) $\alpha_{L,R} = \pm 0,36\sin(\theta_E)\text{ rad}$ ($\approx \pm 20,6^\circ$) açıyla salınır ve biyel kollarıyla merkez uskur şaftını $1:1$ döndürür.
- **Test komutu ve GERÇEK çıktı:**
  - Komut:
    ```powershell
    node C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\threetest\test_monitor.js
    ```
  - Gerçek Çıktı:
    ```text
    DOĞRULANDI [monitor.js]: 15 grup, 213 mesh, min.y=-0.000m, Manivela Motoru & Uskur 1:1 (dProp=1.571 === dCrank=1.571, RPM=0 duruş) OK, Taret Dişlisi 4:1 (pinYaw=-3.142 === -4*0.785) OK, 2x11-inç Dahlgren Salvo (40->38, geriTepme=-0.42m, kuyrukZ=-0.84m > duvarZ=-1.20m, milAçıklığı OK) & Sarkaç Kepenk Kilidi OK, UTF-8 temiz.
    ```
- **Ekran görüntüleri:**
  - `C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\rev_monitor_iso.png` (`431.781 bayt`)
  - `C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\rev_monitor_front_xray.png` (`466.744 bayt`)
  - `C:\Users\hyper\.gemini\antigravity\brain\8359d426-d9a9-43d9-901a-3a6dd7dc21f1\scratch\rev_monitor_breech_xray.png` (`815.181 bayt`)
  - *Görsel inceleme ve yapılan düzeltme:* İlk alınan `rev_monitor_iso.png` görüntüsünde `buildRingWall()` içindeki dış `CylinderGeometry` nesnesinde `openEnded: false` bırakıldığı için taretin üstünün düz metal bir kapakla kapandığı ve demiryolu raylı tavan ızgarasını (`partRoofGrating`) örttüğü tespit edildi. Her iki silindir duvarı `openEnded: true` yapılarak yalnızca et kalınlığını (`R_TURRET_IN .. R_TURRET_OUT`) örten `RingGeometry` halka kapaklar eklendi; ikinci ekran görüntüsünde taret içi boşluğunun ve tavan ızgarasının kusursuz göründüğü doğrulandı.
- **Bilinen eksikler ve bilinçli tavizler:**
  - Gerçek *USS Monitor* `52,4 m` (`172 ft`) tam boyunda ve oldukça basık bir gemidir; `6,5 m` çapındaki döner taretin, `2 × 11 inç` Dahlgren toplarının, güverte altı `4:1` dişli çarkının ve kıçtaki Ericsson titreşimli manivela motorunun 18 metrelik müze sahnesinde mikroskobik kalmaması için gövde boyu `10,4 m` (`-5,20 .. +5,20 m`) kesit-müze ölçeğinde temsil edilmiş, tüm iç mekanizma koordinatları birebir geometrik uyumla yerleştirilmiştir.
- **İnceleyicinin özellikle bakması gerekenler (En kritik 3 nokta):**
  1. `js/vehicles/monitor.js` içinde taret döndürüldüğünde (`S.turretYawDeg` veya `360° Buharlı Taret Tarama` modu) güverte altındaki ana dişli çark (`R = 0,72 m`) ile yardımcı "donkey" buhar motoru pinyonunun (`r = 0,18 m`, merkez `x = -0,90 m`) `1:-4` oranıyla (`v = ω × r`) ters yönde dönmesi.
  2. `Lombar Kepenkleri: KAPALI` (`shuttersClosed = true`) durumuna geçildiğinde iki 11 inçlik Dahlgren topunun taret içine `0,36 m` çekilmesi (`z_ağız = +1,12 m < R_in = 1,28 m`), sarkaçlı kepenklerin `±38° -> 0°` kapanması ve bu konumda ateşleme tuşuna basıldığında kepenk emniyet kilidinin devreye girmesi.
  3. Atış anında (`MAX_RECOIL = 0,42 m`) her iki Dahlgren topunun kuyruk topuzunun `z_yerel = -0,84 m` konumunda durarak taret arka iç duvarına (`z_duvar = -1,202 m`) `0,362 m` kala güvenli biçimde frenlenmesi ve mühimmatın `40 -> 38` (her salvoda `-2`) azalması.
- **Çekirdek (`simulator.html`) değişikliği yapıldı mı? Neden?**
  - Yalnızca standart adaptör entegrasyonu satırları eklendi (`<script src="js/vehicles/monitor.js"></script>`, `const monitor = window.VehicleBuilders.monitor(buildCtx)` ve `ADAPTERS` / `VEHICLE_ROOTS` kaydı). Çekirdek mantığına dokunulmadı.









## USS Monitor — 6 Kasım 2026

- Kaynaklar: https://www.marinersmuseum.org/conservation/uss-monitor/ ve https://monitor.noaa.gov/150th/construction.html
- Doğrulanan temel bilgiler: iki XI-inç Dahlgren; sekiz adet 1 inç demir taret tabakası; yatay pistonlu Ericsson buhar makinesi.
- Kapsam: 15 gruplu, 274 mesh içeren taret ve yaklaşık 10 × 9 m güverte kesiti. Tam gemi değildir. Tarihsel tam mekanik rekonstrüksiyon değildir: buhar makinesi, taret tahriki, kepenk hareketi ve iç yerleşim şematik; 0,45 m geri tepme ve 20 atımlık gösterim kapasitesi eğitim amaçlıdır. Kazan, kondenser, pervane ve gerçek kaldırma/dişli bağlantıları modellenmedi. Kaplamalar tarihsel boya iddiası taşımaz.
- Katalogdaki içten yanmalı motor etiketi buhar ile düzeltildi. Katalog aktif; 11/15 simülatör. Çekirdekte yalnızca script ve adaptör kayıtları eklendi.
- Tekrar çalıştırma: `node tests/setup-monitor.cjs` (internet gerekir), ardından `node tests/monitor.cjs`. Three.js 0.160.0 işletim sisteminin geçici klasörüne indirilir; THREE_CJS ortam değişkeniyle mevcut kopya seçilebilir.
- Gerçek test çıktısı: `PASS: 15 groups, 6 tours, 274 meshes; closed ports, ammo/refill, manual angle, zero RPM, finishes, ground contact`
- Tarayıcı: normal ve X-Ray görüntüleri incelendi; ilk görsel kontrolde namlu çıkıntısı yetersiz görüldü, namlu konumu düzeltildi ve tekrar incelendi. 11 aktif araçta sonraki düğmesiyle geçiş tamamlandı; konsolda JavaScript hatası yok. Tarayıcının kullanıcı etkileşimi öncesi AudioContext uyarısı mevcut.

## J79-GE-15 — 6 Kasım 2026

### Kaynak ve varyant
- National Museum of the US Air Force, General Electric J79 Turbojet: https://www.nationalmuseum.af.mil/Visit/Museum-Exhibits/Fact-Sheets/Display/Article/197630/www.youtube.com/general-electric-j79-turbojet/
  Arama indeksindeki müze kaydı GE-15, 17 kompresör ve 3 türbin kademesi, 17 ft 5 in uzunluk, 3 ft 2 in çap, kuru 10.900 lbf / art yakıcıyla 17.000 lbf bildiriyor. Doğrudan yeniden açma isteği 403 döndü. Katalogdaki GE-17 taslağı GE-15 olarak düzeltildi; itki değerleri 48,5 / 75,6 kN olarak dönüştürüldü. Katalog yılı dönem etiketi olarak korundu; GE-15 hizmete giriş tarihi olarak doğrulanmadı.
- GE Aerospace tarihçesi: https://www.geaerospace.com/company/about-us/history — J79 değişken statorlarının farklı akış şartlarına uyumu.
- Smithsonian J79-GE-2 koleksiyonu: https://airandspace.si.edu/collection-objects/general-electric-j79-ge-2-turbojet-engine/nasm_A19810156000 — J79 ailesinin kan-annüler yanma ve 17/3 kademe mimarisini çapraz kontrol için kullanıldı; GE-2 ölçüleri GE-15 verisi olarak kullanılmadı.

### Uygulama ve sınırlar
- 15 grup, 247 kayıtlı mesh, 6 kamera ve 6 tur; tekrar eden rotor/stator kanatları InstancedMesh kullanır.
- Ortak şaft üzerindeki kompresör ve türbin aynı fazda döner. Sabit statorlar dönmez; değişken statorlar kendi açısını değiştirir.
- Görsel hız en fazla 3 rad/sn; gerçek motor devri, termodinamik, yakıt tüketimi veya canlı itki hesabı yapılmaz. Akış renkleri sıcaklık verisi değildir.
- İç boyutlar, kanat profili/adetleri, altı hareketli stator sırası, 10 alev tüpü yerleşimi, 24 egzoz yaprağı ve kontrol çizelgesi temsili. Malzeme seçenekleri tarihsel kaplama iddiası taşımaz.
- Elle stator veya egzoz ayarı otomatiği kapatır. Sıfır gaz rotorları durdurur ve art yakıcıyı kapatır; gösterim düğmesi sıfır gazda reddedilir.
- Modül klasik script; çekirdekte yalnızca script/build/adaptör/root kaydı eklendi. Önceki Monitor değişiklikleri korundu.

### Gerçek doğrulama
- Bağımlılık hazırlama (ilk kullanım): `node tests/setup-monitor.cjs`; mevcut Three.js 0.160.0 için `THREE_CJS` yolu da kullanılabilir.
- Komut: `node tests/j79.cjs`
- Çıktı: `PASS J79: 15 groups, 6 tours, 247 meshes; 17/3 stages, shared shaft, stationary stators, zero throttle, afterburner interlock, manual override, 4 finishes, ground contact, syntax/catalog`
- Masaüstü Chrome: normal ve X-Ray + art yakıcı görüntüleri incelendi. 12 aktif araç ileri düğmesiyle dolaşıldı; J79 turu 6/6 adımına ulaştı. Konsolda JavaScript hatası yok; mevcut AudioContext kullanıcı etkileşimi uyarısı sürüyor.
- Mobil cihaz, CFD doğruluğu ve her aracın tüm mekanik hareketleri bu kapsamda test edilmedi.

## Görsel ayrıntı revizyonu — Monitor ve J79 (6 Kasım 2026)

Önceki kesit modelleri kullanıcının talebiyle daha ayrıntılı dış geometrilere dönüştürüldü. Yukarıdaki ilk sürüm kapsamları bu bölümle güncellenir.

- Monitor: kare platform kaldırıldı. NOAA 173 ft × 41 ft 6 in referansıyla yaklaşık 52,73 × 12,65 m tam gövde, alt karina, iç postalar, güverte levha birleşimleri, perçinler, pruva kumanda kabini, kapaklar, babalar, filikalar/mataforalar, bacalar/havalandırma, emniyet halatları, kazanlar, pervane mili, yataklar ve dümen eklendi. Taret tavan kapağı ve merdiven ayrıntıları tamamlandı. 22 grup; seyir donanımı görünümü. https://monitor.noaa.gov/shipwrecks/uss_monitor.html
- J79: düz üç silindir karter yerine değişken çaplı karter bölümleri, cıvatalı flanşlar, ayrım şeritleri, dış stator kontrol halkaları, boru/kablo hatları, filtre/aksesuar gövdeleri, egzoz aktüatörleri, yaprak takviyeleri ve tekerlekli bakım arabası eklendi. Kutu rotor kanatları yerine daralan ve süpürülmüş kanat geometrisi kullanıldı. https://www.nationalmuseum.af.mil/Upcoming/Photos/igsearch/J79/
- Her iki modelde tekrar kullanılan deterministik 128 px metal mikro yüzey dokusu var. Görsel rekonstrüksiyonun iç ölçüleri, boru güzergâhları ve kontrol programları yaklaşık kalır; fotogrametri veya üretim çizimi doğruluğu iddia edilmez. Monitor seyir donanımı belirli bir günün birebir konfigürasyonu değildir.
- Başlangıçta root.visible=false düzeltmesiyle varsayılan Tiger açılışında bu modellerin üst üste görünmesi önlendi.
- Doğrulama: node tests/monitor.cjs (22 grup, 445 mesh), node tests/j79.cjs (15 grup, 439 mesh) geçti. Monitor gövde boyut kontrolü ve alt sistem grup toplamı eklendi. Her ikisi 500 mesh hedefinin altında.
- Masaüstü tarayıcıda normal ve X-Ray genel görüntüler; Monitor makine dairesi yakın görünümü incelendi. J79 art yakıcı ve parçalarına ayırma kontrolleri çalıştırıldı. Havalandırma ağız diskindeki boşluk görsel kontrolde görülüp giderildi.

## Katyuşa / ZİS-6 — 6 Kasım 2026
- Varyant: erken ZİS-6 şasili BM-13; katalog yılı 1941 olarak düzeltildi. Kaynak: Voronej Bölge Müzesi, https://museum-vrn.ru/muzej/novosti/muzej-online-oruzhie-pobedy-boevaya-mashina-reaktivnoj-artillerii-katyusha/ ; ZİS-6 ve erken üretim tarihini doğrular. Dış görünüm müze fotoğraf oranlarından yeniden kurulmuştur; ölçek yaklaşık.
- 18 parça grubu: şasi, üç dingil, çift arka lastikler, yaprak yaylar, motor/radyatör/fan, kaput, kabin, saydam camlar, koltuk/direksiyon/göstergeler, çamurluklar, dış donanım, platform, ayaklar, yatak, raylar, çaprazlar, dış mühimmat gövdeleri ve kabin koruma panelleri.
- Sıralı görsel animasyon ve ikmal; gerçek balistik, hedefleme veya mühimmat iç yapısı yok. Denge ayakları ile tekerlek gösterimi birbirini dışlar. 4 temsili kaplama ve 6 rehberli tur.
- `node tests/katyusha.cjs`: PASS; 18 grup, 353 mesh, sonlu geometri, kaplamalar, sıralı gösterim/ikmal, denge ayakları ve elle açı kontrolü.
- Tarayıcı: normal görünüm incelendi; X-Ray ve gösterim kontrolleri çalıştırıldı, konsolda JavaScript hatası yok.
- Ortak geometri/UI yardımcıları js/model-kit.js içinde; seçilebilir parça kayıtları mevcut çekirdeğin yardımcıları üzerinden yapılır.

## V-2 / A4 ve Meillerwagen — 6 Kasım 2026
- Kaynaklar: AWM koleksiyonu https://www.awm.gov.au/collection/C111276 ; konservasyon https://www.awm.gov.au/v2-meillerwagen-conservation-project ; tarihsel bağlam https://wm.awm.gov.au/read/v2-rocket-science . Yaklaşık 14 m dış biçim ve taşıyıcı fotoğraf oranları esas alındı. Siyah-beyaz deneysel görünüm, AWM'nin yeşil restore örneğinin birebir boyası değildir.
- 18 grup, 222 mesh: taşıyıcı şasi, tekerlekler, ayaklar, kafes, kuşaklar, hareketli silindirler, servis donanımı; dış gövde, burun, kanatlar, birleşim halkaları; tank hacimleri, ekipman kutuları, çerçeveler ve motor dış donanımı.
- Dikey/yatay poz, gövde inceleme dönüşü ve kuyruk yüzeyi gösterimi; otomatik pozdan manuel kontrole geçiş. Fırlatma, hedefleme veya çalışır itki hesabı yok. Rehber turda zorla çalıştırma ve sivil mağdurların tarihsel bağlamı var.
- `node tests/v2.cjs`: PASS; kaplamalar, 6 tur, 0/30/60/90 derece yer açıklığı, manuel öncelik ve poz düğmeleri doğrulandı.
- Görsel kontrol: dikey normal ve yatay X-Ray incelendi; ilk dikey görüntüde eksik trunnion destekleri eklendi. Yatay görüntüde kafes üstte kaldığı için kafes bağlantıları taşıma pozunda roketin altında kalacak şekilde düzeltildi.

## Phalanx Block 1B — 6 Kasım 2026
- Varyant ve tarih: ABD Donanması ilk Block 1B kurulumunu 1999 olarak verir. Katalog 1980 ilk Phalanx ile 1999 Block 1B ayrımını yapacak şekilde güncellendi. Kaynak: https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2167831/mk-15-phalanx-close-in-weapon-system-ciws/linkId/mk-15-phalanx-close-in-weapon-system-ciws/
- Dış görünüm referansı: https://www.rtx.com/en/raytheon/what-we-do/sea/phalanx-close-in-weapon-system ; altı namlu ve besleme donanımı: https://www.gd-ots.com/wp-content/uploads/2024/03/400002644-PHALANX-Close-In-Weapon-System-CIWS-Product-Brochure-2024-03-V02-1.pdf
- 18 grup, 230 mesh: cıvatalı güverte kaidesi, dönüş yatağı, kabin ve kapaklar, beyaz radom, iç anten ve taşıyıcıları, optik pencereler, yükseliş beşiği, altı ayrı namlu ve destek kafesi, tambur dış/iç iskeleti, körüklü besleme kanalı, tahrik gövdeleri, ızgaralar, kablolar ve basamaklar.
- Yavaşlatılmış rotor, yatay/düşey inceleme, otomatik eksen gösterimi, X-Ray, kaplamalar ve 6 adımlı rehber tur. Görsel rekonstrüksiyon; iç yerleşim ve oranlar yaklaşık, hedefleme/angajman hesabı yok.
- `node tests/phalanx.cjs` geçti: başlat/durdur, manuel öncelik, açı sınırları, yer açıklığı, sıfırlama ve sonlu geometri. Tarayıcıda normal/X-Ray incelendi; antenin alt desteği ve tamburun iç iskeleti görsel kontrolde tamamlandı. JavaScript konsol hatası yok.

## Üç yeni araç — bütünleşik son kontrol
- Katalogdaki eski plan/özellik metinleri uygulanan modellerle eşleştirildi; Katyuşa etiketi 1941, V-2 adı Meillerwagen olarak güncellendi. Katalog 15/15 aktif.
- Mobil hızlı işlem düğmeleri modelin gerçek işlemini ve durumunu gösterir; sekme başlığı aktif araçla eşleşir. Üç yeni modelin dikey telefon kadrajı, doğrudan URL açılışı dahil genişletildi.
- Beş model testi (Monitor, J79, Katyuşa, V-2, Phalanx) geçti. Ana sayfa/simülatör JavaScript, ES module ve import-map sözdizimi kontrolü geçti; git diff --check temiz.
- Tarayıcıda 15 araç arasında geçiş, her birinde X-Ray/CAD aç-kapat ve üç yeni aracın altışar rehber tur adımı çalıştırıldı. Konsolda JavaScript hatası yok.
- Üç yeni model normal ve X-Ray görünümlerinde incelendi; V-2 yatay pozundaki kafesin roket altında kaldığı doğrulandı. 390×844 mobil kadrajlar ve işlem düğmeleri kontrol edildi.

## Dördüncü grup / UH-1H — araştırma ve uygulama planı
- Kaynak: Smithsonian NASM, https://airandspace.si.edu/collection-objects/bell-uh-1h-iroquois-huey-smokey-iii/nasm_A19960005000 ; rotor çapı 14,7 m, gövde uzunluğu 12,6 m, yükseklik yaklaşık 4,2 m. Model genel UH-1H; Smokey III duman donanımı kopyalanmaz.
- 20 grup: alt gövde, kabin iskeleti, burun, camlar, kokpit, koltuklar, kapılar, kabin zemini, tavan, kuyruk, stabilizeler, kızaklar, motor kaportası, türbin, transmisyon, mast/kumanda tablası, ana rotor, kuyruk şaftı, kuyruk rotoru ve dış servis ayrıntıları.
- Görsel devir 0–40; tahrik sürekliliği görünür, gerçek uçuş hesabı yok. Kollektif pala açısı ve kapı açıklığı; sıfır devir tam duruş. Ölçü dışındaki detaylar fotoğraf oranlarından yaklaşık.
- Plan: iki pal ±7,35 m; rotor merkezi y≈4,0; kızak tabanı y=0. Kapı kılavuzları üzerinde geriye kayar. Ana/kuyruk rotor hareketi ortak gösterim fazından türetilir; oran tarihsel değer iddiası taşımaz.

- UH-1H uygulandı: `node tests/huey.cjs` → `PASS UH-1H: 20 groups, 241 meshes, rotor stop/link, collective/manual override, doors/reset, 14.7m rotor`. Normal ve X-Ray + açık kapılar tarayıcıda incelendi; mobil 390×844 kadraj kontrol edildi. Konsolda hata yok. İlk görsel kontrolde kokpit yan panelleri ve ray destekleri tamamlandı. İlk testte negatif sıfır karşılaştırması toleranslı kontrolle düzeltildi; başlangıç pozuna dönüşe rotor fazı sıfırlaması eklendi.

- Mobil son görüntüde UH-1H sol pala ucu kadraj dışında kaldı; portre kamera katsayısı 2,3 yapılıp tekrar görüntülendi. AGENT_CONTEXT.md ve BEYIN_FIRTINASI.md repo .gitignore kuralı gereği yerel tutulur; izlenen rehber/notlar günceldir.

## U-505 — araştırma ve plan
- Griffin MSI koleksiyonu https://collections.griffinmsi.org/collections/4855 : yaklaşık 252 ft (76,8 m) boy, 22,3 ft (6,8 m) en, iki dokuz silindirli dizel ve iki elektrik motoru. Müze görünümü temel alınır; bölüm ve boru ölçüleri yaklaşık.
- 20 grup planı: dış gövde, basınç teknesi, postalar, güverte, kule, korkuluk, periskoplar, kapaklar, dümen, dalış düzlemleri, şaftlar, pervaneler, dizeller, elektrik motorları, bataryalar, kumanda odası, yaşam alanları, dış tüp kapakları, borular ve sergileme desteği.
- Kontroller: yavaşlatılmış tahrik, periskop açıklığı, dümen; dizel/elektrik gösterim modu. Dalış ve silah atışı simülasyonu yok. Çift şaft sürekli, dümen uçları ve hareketli kapsamlar test edilir.

- Portre kadraj kök nedeni: OrbitControls.maxDistance yeni kamera mesafesini sınırlıyordu. flyCameraTo içinde yalnızca portre ölçeklemesi sırasında uzaklık sınırı hedef mesafeye uyarlanır. Araç kimliğine özel çekirdek koşulu yok. Tekrar ekran görüntüsünde iki rotor ucu da kadraja girdi.

- U-505 tamamlandı: `node tests/u505.cjs` → `PASS U-505: 20 groups, 454 meshes, twin shafts, stop/reset, periscope/rudder, 76.8m hull`. Gövde boyu testi ilk uygulamadaki yerel eksen ölçekleme hatasını yakaladı; düşey kesit ölçeği düzeltildi. Normal görünümde baş/kıç güverte boşluğu kapatıldı; X-Ray makine dairesi ve 390×844 mobil genel görünüm incelendi. Konsolda hata yok.

## Enigma — özel çalışma planı
- Enigma I seçildi; M4 deniz modeliyle karıştırılmaz. Crypto Museum: https://www.cryptomuseum.com/crypto/enigma/i/index.htm ; bağlantılar https://www.cryptomuseum.com/crypto/enigma/wiring.htm ; adımlama https://www.cryptomuseum.com/crypto/enigma/working.htm . Tarihsel bağlamda Polonyalı matematikçiler, Turing/Welchman ve daha geniş ekip birlikte anlatılır.
- İki görünüm aynı modeli/hesabı kullanır: standart müze adaptörü ve enigma.html şifreleme masası. 3B ahşap kasa/kapak, tuşlar, lambalar, fişler, rotorlar, mandallar ve iç bağlantılar.
- Saf JS şifre çekirdeği: I–V rotorlar, B/C yansıtıcı, halka/konumlar, fiş çiftleri; elektrik geçmeden önce adımlama, çift adımlama. Varsayılan I-II-III/AAA/AAA/B fişsiz AAAAA→BDZGO ve HELLOWORLD→ILBDAAMTAZ vektörleri; III-II-I/ADQ→AER→BFS.
- Masa: gerçek tuş girişi, çıktı şeridi, ayar doğrulama, 9 aşamalı iz, adım seçimi, aynı başlangıç ayarıyla çözme ve çift adımlama örneği. Mobil düzen ve klavye erişimi kontrol edilir.

- Enigma tamamlandı: çekirdek ve model testleri geçti. Tarayıcıda AAAAA→BDZGO, geri çözme→AAAAA, ADQ→AER→BFS ve tekrarlı fiş uyarısı doğrulandı. Uygulanmamış form değişikliğinin geri çözmeyi etkilemesi engellendi. Masa ve müze görünümü, 390×844 mobil kadraj/klavye kontrol edildi; yatay taşma yok. Altın gidiş ve turkuaz dönüş yolları açıklayıcı görselleştirmedir. 17 grup; metinsiz testte 316 mesh.

## Higgins LCVP — araştırma ve uygulama
- ABD Ordu Ulaştırma Müzesi: https://transportation.army.mil/museum/AOTM/2020/may_2020.html ; ahşap tekne, çelik baş/yan koruma ve yaklaşık 36 personel. ABD Denizcilik Tarihi: https://www.history.navy.mil/content/history/museums/nmusn/explore/photography/ships-us/ships-usn-l/landing-craft-vehicle-personnel.html ; yaklaşık 36 ft boy. Prototipler 1941 sonu, katalog seri kullanım dönemi 1942.
- 18 grup: tekne, postalar, döşeme, küpeşte, rampa, menteşeler, halatlar, vinç, kıç güverte, dümen mahalli, motor, şaft, pervane, dümen, halka yuvaları, yük, servis ve beşikler. İç geometri yaklaşık; sandıklar temsili.
- Test: rampa 0/45/90° konumlarında iki halat ucunun menteşeli rampaya bağlı kalması, yer açıklığı, pervane duruşu/sıfırlama, dümen sınırı ve yük görünürlüğü geçti. 201 mesh.

- LCVP normal görünüm, açık rampa/X-Ray motor yakın planı ve 390×844 mobil kadraj incelendi. Konsol hatası yok.

## Chain Home — araştırma ve uygulama
- Kaynak: RAF Air Defence Radar Museum, https://www.radarmuseum.co.uk/history/world-war-two/ ; ahşap alıcı, çelik verici ve sabit perde anten düzeni. 350 ft (~107 m) verici / 240 ft (~73 m) alıcı tipi için Historic England Poling kaydı: https://historicengland.org.uk/listing/heritage-gateway/results/record/0d636742-8028-4a8c-8b7c-e1f9aaf2d338/3ee99efa-d7fe-419b-a488-eba77c78d893 . Kule yükseklikleri istasyona göre değişmiştir; diorama belirli bir istasyonun birebir kopyası değildir.
- 19 grup, 329 mesh: sekiz kafes kule, beton temeller, merdivenler/platformlar, sabit antenler, izolatörler, iki bina ve hareketli çatılar, verici cihazları, alıcı/gonyometre, A-tipi ekran, harita masası, telefon/sandalyeler, jeneratör, çevre çiti ve açıklayıcı darbe izleri.
- Kule ölçeği yaklaşık 1:10; saha aralıkları ve iç odalar sıkıştırılmış. Ekran izi temsili; gerçek algılama/menzil hesabı yok. Gonyometre kontrolü yalnız düğme hareketi gösterir, kuleleri döndürmez.
- Testler: sabit kuleler/yükseklikler, darbe duruşu ve manuel öncelik, çatı kaldırma, düğme sınırı, iz görünürlüğü ve sıfırlama geçti.

- Chain Home normal istasyon ve açık çatı/X-Ray operatör odası incelendi. Mobil son kontrolde desteklenmeyen bumpMap uniform hatası bulundu; ortak kaplama yardımcısı BasicMaterial üzerine bumpMap ekliyordu. Yalnız bumpMap destekleyen malzemelere uygulama ve değişimde needsUpdate eklendi. Regresyon testi bu koşulu kapsar. Mobil saha tabanı için kadraj 2,2 yapıldı.

## Dördüncü grup — bütünleşik son kontrol
- 11 test dosyası geçti: Monitor, J79, Katyuşa, V-2, Phalanx, UH-1H, U-505, Enigma çekirdeği/modeli, LCVP ve Chain Home.
- Katalog 20 aktif; tüm kayıtların facet değerleri doğrulandı. Tarayıcıda 20 araç geçişi, X-Ray/CAD aç-kapat ve beş yeni modelde altışar tur adımı çalıştı; konsol hatası yok.
- Chain Home bumpMap düzeltmesi sonrası mobil konsol temiz ve saha tabanı bütünüyle görünür. Ortak kaplama yardımcısındaki değişim diğer dokuz model testiyle tekrar doğrulandı.
- Enigma masaüstü/mobil klavye, örnek şifreleme, ayar doğrulama, geri çözme ve çift adımlama kontrol edildi. Sayfa harici Three.js/font kaynakları kullanır; tamamen çevrimdışı paket değildir.

## Beşinci grup — kullanıcı tarafından onaylanan sıra
1. Leonardo’nun oraklı savaş arabası (`scythed`) — tamamlandı.
2. Kore Hwacha’sı (`hwacha`) — tamamlandı.
3. Atlatl — mızrak fırlatma kolu (`atlatl`) — tamamlandı.
4. Fenerli kalkan (`lantern`) — tamamlandı.
5. Polybolos (`polybolos`) — tamamlandı.
6. Leonardo’nun dev arbaleti (`giantbow`) — tamamlandı.
7. Çin tekrarlayan arbaleti — Chu-ko-nu (`chukonu`) — tamamlandı.
8. Helepolis kuşatma kulesi (`helepolis`) — tamamlandı.
9. Leonardo’nun çok namlulu top düzeni (`organ33`) — tamamlandı.
10. Kılıç–tabanca birleşimi (`swordpistol`) — tamamlandı.
Her araç ayrı araştırma, uygulama, test ve görsel kontrolden sonra Türkçe commit alır. Push en son, kullanıcı talimatıyla. Çizimler, günümüze kalan nesneler ve modern rekonstrüksiyonlar birbirinden ayrılır.

## Leonardo’nun oraklı savaş arabası — 6 Kasım 2026
- Esas alınan çizim: British Museum, 1860,0616.99, yaklaşık 1485. Müzenin yayımladığı açıklama ve çizim: https://artsandculture.google.com/asset/military-machines-leonardo-da-vinci/4AF1vuuEl2xiew?hl=en ; özgün kayıt https://www.britishmuseum.org/collection/object/P_1860-0616-99 (doğrudan erişim 403 verdi; müzenin Google Arts & Culture yayını okundu, çizim görsel olarak incelendi).
- British Museum bu tasarımların yapılıp savaşta kullanılmasını pek olası görmez. Arayüz, katalog ve turda “çizimden rekonstrüksiyon” ayrımı korunur. Torino 15583 çizimiyle tek bir özgün makineymiş gibi birleştirilmez. İkinci görsel karşılaştırma: Las Vegas Natural History Museum, https://www.lvnhm.org/post/worldofdavinci .
- Siluet: arkada iki büyük tekerlek, ortada iki koşumlu at, önde dört kollu yatay orak. Ölçüler tarihsel veri değildir; orantısal müze modeli. Atlar oyma ahşap figürlerdir, yürüyüş simülasyonu yoktur.
- 18 seçilebilir grup, 262 kayıtlı mesh. İspit/parmak/göbek/pim ayrıntılı tekerlekler; ahşap damar dokusu; demir kuşaklar; iki oyma at, deri koşum ve dizginler; eğri ve kalınlıklı dört orak; destekli kesintisiz mil; iki taç/fener dişli çifti.
- Sergi yorumu: arka 24/8 ve ön 8/24 aktarım (3:1 → 1:3); gerçek tasarım oranı iddiası yok. Mil yatakları, açılır inceleme paneli ve ön müze beşiği yorum olarak açıklanır. Devir 0–18; elle faz kontrolü oynatmayı durdurur. Atlar/koşum gizlenebilir, aktarım vurgulanabilir. Dört ahşap görünümü, altı kamera ve altı tur adımı.
- İlk yakın plan kontrolde arka dişli hacmine giren orta kiriş kaldırıldı, çaprazlar dişlinin altına alınıp dikmelerle bağlandı; kapak açıklığı artırıldı. Dizgin uçları destekli bağlama halkalarına bağlandı. Ön dişli altındaki yatak açıklığı düzeltildi.
- Test, dönen daireye ait eksen hizalı kutunun sahte zemin/çarpışma sonucu üretmesini önlemek için gerçek dönüştürülmüş tekerlek ve dişli köşelerini kullanır. 73 fazda orak/at, dişli/şasi açıklığı ve tekerlek zemin teması; dik aktarımın v=ω×r yönleri, 3:1/1:3 hızlar, sıfır devir, manuel öncelik, kapak, gizleme ve sıfırlama doğrulanır.

- Sonuç: beşinci grup 1/10 tamamlandı; katalog 21 aktif. Normal görünüm, açık kapak/X-Ray arka dişli yakın planı, 45° ön orak pozu ve 390×844 mobil kadraj gözle incelendi. Tarayıcıda dört kaplama, CAD/X-Ray, altı tur adımı ve Leonardo zırhlı araç/Chain Home/Enigma/yeni araç geçişleri kontrol edildi. Mobilde oynatma ilerledi; elle 90° seçilince devir sıfıra indi ve açı korundu. Konsolda sayfa hatası yok.


## Kore Hwacha’sı — 6 Kasım 2026
- Varyant: 1451 Munjong Hwacha, 100 orta boy Singijeon taşıyan düzen. Kore Ulusal Tarih Enstitüsü, https://contents.history.go.kr/play/view.do?itemId=tz&lang=eng&levelId=tz_b32 ; Munjong kayıtlarının 13 Şubat 1451 tarihli anlatımında 100 Singijeon ile 50 sajeon chongtong seçenekleri ayrılır. Bu model ikinci varyantı temsil etmez.
- Görsel kaynak: Korea Culture Information Service Agency (@kcisameta), “Singijeon Hwacha”, https://sketchfab.com/3d-models/singijeon-hwacha-85f48b05a86240e99b755d70070d8401 . Sayfa web aracında 403 verdi; herkese açık Sketchfab model API kaydındaki kurumun 1920×1080 önizlemesi alınıp gözle incelendi. Model dosyası indirilmedi/kopyalanmadı; yerel geometri sıfırdan yazıldı.
- Görsel dayanak modern rekonstrüksiyondur; orijinal korunmuş araç veya kesin üretim ölçüsü iddiası yoktur. Ahşap araba, uzun kollar, büyük ispitli tekerlekler, eğimli delikli kaset ve uzun saplar esas alındı. İkinci kılavuz levha, birleşimler, destek hareketi, açı aralığı ve yüzey renkleri sergi yorumudur. Sergi levhasındaki üç çizgi dekoratiftir; tarihsel yazıt değildir.
- 18 seçilebilir grup, 168 kayıtlı mesh: iki ahşap tekerlek, demir çemberler, parmaklar/göbekler/pimler, şasi/döşeme/çaprazlar, taşıma kolları, dayanaklar, yan dikmeler, mafsallar, kaset çerçevesi, iki delikli levha ve yüz dış ok modeli. Her levhada gerçek geometriyle 100 açıklık vardır. Tekrarlanan ok parçaları InstancedMesh kullanır.
- Etkileşim: temsili sıralı eksilme, duraklatma, 100 oka yenileme, kaset inceleme açısı, levhaları ayırma, okları gizleme ve başlangıca dönüş. Dört ahşap görünümü, altı kamera ve altı tur. İç mühimmat yapısı veya balistik hesap yok; eksilme temposu tarihsel atış hızı değildir.
- Testler: `node tests/hwacha.cjs` (200 deliğe raycast ve ahşap aralıklara kontrol ışınları; 26 açıda destek uçları, zemin/tekerlek açıklığı; 100 okun eksilmesi, zaman birikimi, duraklatma, manuel öncelik, yenileme, görünürlük, sınırlar ve sıfırlama), `node tests/scythed.cjs`, `node tests/j79.cjs` geçti. Son test katalog facet değerlerini ve simulator modül sözdizimini de doğrular.
- Görsel kontrol: masaüstü genel görünüm, arka saplar/X-Ray yakın planı, oklar gizliyken ayrılmış delikli levhalar; dört kaplama ve CAD aç/kapat; altı tur; 390×844 mobil genel görünüm. Mobil yatay taşma yok; gösterim sayacı azaldı, duraklatınca sabit kaldı. Scythed/Enigma/Hwacha geçişleri çalıştı. Sayfa JavaScript hatası yok; mevcut favicon.ico eksikliği 404 veriyor.
- Katalog: 22 aktif model; yeni Kore (Joseon) filtresi yalnız Hwacha’yı getiriyor. Beşinci grup 2/10 tamamlandı; sıradaki Atlatl. Türkçe commit, push kullanıcı talimatına kadar yok.


## Atlatl — 6 Kasım 2026
- Görsel kaynak: British Museum Am.5226, müzenin Google Arts & Culture yayını https://artsandculture.google.com/asset/wooden-spear-thrower-atlatl/YwGmIA6eKl4tqQ ; 1400–1521, Mexica/Aztek, ahşap-kabuk-pamuk ve altın bezeme. Müze muhtemelen törensel kullanım belirtir. Fotoğraf incelendi; model fotoğrafı/varlığı kopyalanmadan prosedürel olarak yazıldı. 1400–1521 atlatl türünün icat tarihi değildir.
- Mekanik ve dart anlatımı: Maxwell Museum / University of New Mexico, https://hands.unm.edu/atlatls.html . Ahşap kol ucundaki kanca dartın arka yuvasına dayanır; dartlarda bölümlü sap ve taş uç örnekleri bulunur. Bu kaynakta anlatılan Güneybatı ABD örnekleri, Mexica nesnesiyle tek arkeolojik takım olarak sunulmaz.
- İkincil bağlam: Museo delle Civiltà, https://www.museodellecivilta.it/en/oggetti/american-arts-and-cultures/spear-throwers-atlatl/ ; geç 15./erken 16. yy Oaxaca, Mixtec örnekleri, oyma ahşap/altın/kabuk. Mixtec ve Mexica atıfları birleştirilmedi.
- Büyütülmüş, esinlenilmiş müze modeli; Am.5226 birebir kopyası değildir. Uzun dart, yiv/kanca, kıvrımlı bezeme, oranlar ve hareketler yorumdur. Özgün figürler/glifler uydurularak kopya diye sunulmaz. Kaide, destek ve dekoratif işaretler çağdaştır. Menzil, gerçek atış, dart esnemesi veya hız hesabı yoktur.
- 16 seçilebilir grup / 189 mesh: cilalı ahşap, yiv kenarları, uç kancası, gerçek boşluklu çift kabuk halka, çapraz pamuk sargıları, altın renkli kabartma, uzun dart, sap boğumları, açık arka yuva, üç tüy ve ince lifleri, ön sap/sargı ve üç boyutlu yüzeyli taş uç. Dört ahşap görünümü, altı kamera ve altı tur.
- Gösterim: %60'a kadar ortak hareketle kanca/yuva teması korunur; sonra dartın yönü sabitlenerek temsili ayrılma açıklığı oluşur. Elle evre/ayırma değişince oynatma durur. Son evrede otomatik duruş, yeniden oynatma, dart gizleme, temas işareti ve sıfırlama mevcut.
- Testler: `node tests/atlatl.cjs` — 101 pozda temas/ayrılma ve kaide açıklığı, kabuk halkalara boşluk/duvar raycast kontrolü, açık yuva, ayrılan dartın sabit yönü, duraklatma/manuel öncelik, sınırlar, sıfırlama ve dört kaplama. `node tests/hwacha.cjs` ve `node tests/j79.cjs` regresyonları geçti; katalog facet ve simulator sözdizimi doğrulandı.
- Görsel kontrol: genel görünüm, kabuk halka/sargı yakın planı, %60 temas pozunda X-Ray, dört kaplama/CAD, altı tur; 390×844 mobil başlangıç ve %100 ayrılma görünümü. Mobil taşma yok, duraklatılan evre sabit kaldı. Hwacha/Scythed/Atlatl geçişleri başarılı. JavaScript hatası görülmedi; mevcut favicon isteği 404 veriyor.
- Sonuç: 23 aktif model, beşinci grup 3/10. Meksika filtresi yalnız Atlatl'ı getirir. Sıradaki fenerli kalkan. Kullanıcı 6 Kasım'da kalan sıraya onay beklemeden devam edilmesini istedi; her araçtan sonra Türkçe commit, push yok.


## Fenerli kalkan — KHM A 384 — 6 Kasım 2026
- Esas kaynak: Kunsthistorisches Museum, https://www.khm.at/en/artworks/laternenschild-mit-eisenhandschuh-und-einschiebbarer-stossklinge-372783-1 . 1596'dan önce; Ferdinand II koleksiyonu. Kalkan çapı 40 cm, uzunluk kapalı 82 / açık 101 cm. Kaynaktaki demir/pirinç/kadife/deri/zincir örgü bilgileri ve ön/arka fotoğraflar esas alındı. Müze pratikliği düşük, muhtemelen sohbet nesnesi yorumu yapar; etkili bir savaş silahı iddiası kurulmaz. Üretim yeri kesinleştirilmediği için katalog kökeni Avrupa (yer atfı belirsiz).
- Müze sayfası web açmada 403 verdi; PowerShell ile erişildi. Büyük ön/arka fotoğraflar müzenin `/pics/372783/HJRK_A_384_38076.jpg` ve `HJRK_A_384_38079.jpg` yayınlarından gözle incelendi. Görseller uygulamaya kopyalanmadı. Philadelphia örneği araştırmada görüldü fakat geometriler tek özgün nesneymiş gibi birleştirilmedi.
- 16 grup / 92 kayıtlı mesh: delikli çelik yüz ve eldiven çentiği, kıvrılmış kenar, pirinç perçinler, merkez çıkıntısı, kırmızı kadife, işlemeli şerit, kayışlar, levhalı eldiven, 180 örneklenmiş zincir halkası, iki çentikli çıkıntı, sürgü kanalı, hareketli bıçak, arka fener, iç lamba ve kapak. Ayrıntı oranları ve eklemler yaklaşık; nesne sergi için büyütülmüş, çağdaş mesnet ayrı gruptur.
- Etkileşim: 0–110° kapak, temsili ışık aç/kapat, bıçak uzantısı ve parmak inceleme açısı; dört kaplama, altı kamera/tur. Bıçak hareketi kaynakta verilen 19 cm farkı kalkan çapına göre orantılar; üretim/kilit mekanizması modeli değildir.
- `node tests/lantern.cjs`: gerçek ışık ağzı/astar açıklığı, kapalı kapak örtüşmesi; 111 kapak açısında çarpışmasız hareket; ışık-kapak ilişkisi; 101 bıçak konumunda kılavuz açıklığı ve devamlı örtüşme; parmak sınırları, sıfırlama ve kaplamalar. Atlatl ve J79 regresyonları da geçti. J79 testi katalog ve simulator sözdizimini doğrular.
- Görsel kontroller: genel, kadife arka yüz, X-Ray fener içi; dört kaplama/CAD ve altı tur; 390×844 mobil kapak açık ve bıçak tam uzatılmış kadraj. Mobil yatay taşma yok; kontroller telemetriyle eşleşti. Atlatl/Hwacha/yeni araç geçişleri tamam. Sayfa JavaScript hatası görülmedi.
- Sonuç: 24 aktif model, beşinci grup 4/10. Sıradaki Polybolos; kullanıcı onay beklemeden sıraya devam istiyor. Her araç ayrı Türkçe commit; push yok.


## Polybolos — 6 Kasım 2026
- Ana kaynak: Kotsanas Museum, https://kotsanas.com/exhibits/military/the-repeating-catapult/ . Müzenin Philon anlatımına dayalı modern rekonstrüksiyonu ve fotoğrafı incelendi. Dionysios'a atıf, çift zincir, beşgen çark, ileri–geri krank ve döner besleme düzeni temel alınır; özgün korunmuş nesne gibi sunulmaz. Fotoğraf uygulamaya alınmadı.
- 18 grup / 166 mesh. Üçgen ahşap taban, payandalar, çift lif demeti, simetrik kollar, hareketli kiriş, metal kuşaklar, dört beşgen çark, ortak miller, krank, örneklenmiş çift zincir, sürgü/mandal, üst hazne, yivli tambur ve sekiz dış ok.
- Oranlar, sekiz ok kapasitesi, yuvarlatılmış zincir yolu, helis takipçisinin değişen uzunluğu ve çevrim evreleri sergi yorumudur; operasyonel fizik/menzil hesabı yoktur. Elle evre değiştirmek sayaçtan ok düşürmez. Otomatik çevrim başına bir ok azalır; son çevrim tamamlanıp durur, yenileme oynatmayı kendiliğinden başlatmaz.
- İlk geometrik kontrolde zincir/demet çakışması giderildi, ön çerçeve ilerletildi; dış dikmelerde hareketli kollar için açıklık bırakıldı. Üst hazne iki sütun/dört sıra düzeniyle alçaltıldı. Helis takipçisinin uçları sürgü ve tambur izine bağlandı. Zincir teğet yönleri ve çark dönüş işareti düzeltildi.
- `node tests/polybolos.cjs`: 100 evrede zincir pimi/sürgü, kiriş/kol uçları, helis takipçi teması, zincir-demet açıklığı; dönüş işareti, tek ok aktarım sürekliliği, sekiz tam çevrim, boşta duruş, yenileme, manuel öncelik ve sıfırlama. Lantern/J79 regresyonları ve katalog/simulator sözdizimi kontrolü geçti.
- Görsel kontrol: masaüstü genel görünüm; %68 evrede açık hazne/X-Ray besleme yakın planı; dört ahşap görünümü, CAD ve altı tur. 390×844 mobil kadraj ve duraklatılan evre sabitliği kontrol edildi; yatay taşma yok. Katalog 25 aktif. Beşinci grup 5/10; sıradaki Leonardo dev arbalet. Push yok.


## Leonardo dev arbalet — 6 Kasım 2026
- Kaynaklar: Museo Nazionale Scienza e Tecnologia, https://artsandculture.google.com/story/leonardo-and-the-military-engineering/BgVx_Ikfu3ohIg?hl=en-GB ; Regione Lombardia ST070-00100, https://www.lombardiabeniculturali.it/scienza-tecnologia/schede/ST070-00100/ . Müze modelinin fotoğrafı incelendi. Katmanlı yay, yaklaşık 24 m tasarım açıklığı ve altı tekerlek esas alındı. Kaynaklar mühimmatı farklı anlattığından yatak boş bırakıldı. Savaşta kullanıldığı iddia edilmez.
- 16 grup / 225 mesh: dokuz bağımsız lamina, takip eden bantlar, halat gözleri, çift kiriş, uzun kundak, çaprazlar, altı ispitli tekerlek, hareketli kızak, iki kurma halatı, tambur ve çarklar. Ahşap ölçek figürü ve kaldırılabilir paneller sergi ekidir. Yaklaşık 1:3 sahne; deformasyon ve oranlar üretim verisi değildir.
- Test: 101 evrede kiriş ve halat uçlarının bağlantısı, simetri, sonlu yay geometrisi; altı zemin teması, ileri/geri uçta duruş, manuel öncelik ve sıfırlama geçti. Polybolos/J79 regresyonları, katalog ve simulator sözdizimi geçti.
- Görsel kontrol: masaüstü genel ve tam kurulmuş arka tambur yakın planı; dört kaplama, altı tur; 390×844 mobil açık paneller/X-Ray. Yatay taşma yok. JavaScript hatası görülmedi; mevcut favicon 404. Katalog 26 aktif, grup 6/10; sıradaki Chu-ko-nu. Push yok.


## Chu-ko-nu — 6 Kasım 2026
- Kaynak: Musée de l’Archerie et du Valois, https://www.musee-archerie-valois.fr/en/2021/10/01/repeating-crossbow/ ; 2007.10.1, 19. yüzyıl Çin, ahşap/metal/lif. Müzenin nesne fotoğrafı incelendi. Mucit atfı, atış hızı ve menzil tekrar edilmedi. Kısa tüysüz oklar ve yaklaşık bir düzine hazne anlatımı esas alındı.
- 16 grup / 104 mesh: dar kundak, yay katmanları/lif bağları, çift kol ve tutamak, pimler, üst hazne, kapak, köşe takviyeleri, on iki ok ve çağdaş mesnet. Dört mafsallı hareketin oranları, kiriş yer değiştirmesi ve eksilme temposu sergi yorumudur; nesnenin ölçülü mekanik kopyası değildir.
- İlk görsel kontrolde hazne yüksekliği azaltıldı. 101 evrede kaldıraç/hazne mafsalı, sabit boylu ön bağlantılar, hazne-kundak açıklığı ve kiriş uçları test edildi. On iki çevrim, boşta duruş, yenileme, manuel öncelik, kapak/duvar açma ve sıfırlama geçti. Dev arbalet/J79 regresyonları geçti.
- Masaüstü açık hazne yakın planı, dört kaplama/CAD, altı tur ve 390×844 mobil genel görünüm incelendi. Mobil yatay taşma ve konsol hatası yok. Katalog 27 aktif, Çin köken filtresi eklendi. Grup 7/10; sıradaki Helepolis. Push yok.


## Helepolis — 6 Kasım 2026
- Kaynak: Kotsanas Museum, https://collection.kotsanasmuseum.com/en/exhibits/106078/ ve ön/arka fotoğrafları https://kotsanas.com/el/exhibits/military/helepolis-epimachus/ . Modern rekonstrüksiyonun iki fotoğrafı incelendi. Dokuz kat, sekiz tekerlek, iki merdiven ve yaklaşık 40 m anlatımı esas alındı; iç yerleşim/kaplama bağlantıları yorumdur.
- 18 grup / 389 mesh: ızgara taban, dört çift masif tekerlek, yataklar, daralan dikmeler, kuşaklar/çaprazlar, dokuz döşeme, gerçek merdiven boşlukları, korkuluklar, sabit atıcı siluetleri, levhalı ön yüz, yan tahtalar, 18 kapak, menteşeli köprü ve halatlar. Tekrarlanan tahtalar ve parçalar örneklenmiştir.
- Test: 91 köprü açısında halat bağlantısı; 16 merdiven boşluğuna raycast ve komşu dolu döşemeye kontrol ışını; dokuz kat filtresi, cephe ayırma, kapaklar, uçta duruş/manuel öncelik/sıfırlama geçti. Chu-ko-nu/J79 regresyonları geçti.
- Görsel: genel görünüm, açık arka, dört katlı kesit ve mobil 390×844 incelendi. Kesitte gizlenmiş üst kata çıkan son merdiven ve desteksiz kalan halatlar gizlendi; arka kamera kadrajı genişletildi. Dört kaplama/CAD ve altı tur çalıştı; mobil taşma ve konsol hatası yok. Katalog 28 aktif, grup 8/10; sıradaki Leonardo çok namlulu düzen. Push yok.


## Leonardo 33 namlulu düzen — 7 Kasım 2026
- Kaynak: Museo Nazionale Scienza e Tecnologia, https://artsandculture.google.com/story/leonardo-and-the-military-engineering/BgVx_Ikfu3ohIg?hl=en-GB ; Argan Giovenale model kaydı/fotoğrafı https://artsandculture.google.com/asset/organo-a-trentatre-canne-0111/ywGcPElzcqJvUA . Müze fotoğrafı incelendi; üç sıra/on bir namlu, döner çerçeve ve arka vida esas alındı. Çizimden modern rekonstrüksiyon olduğu belirtilir.
- 16 grup / 173 mesh: 33 açık ağızlı bronz dış namlu, üç yatak, ortak çerçeve, menteşeler, tutucu çubuklar, ahşap tekerlekler, 12 ispit, metal çemberler/pimler, kuyruk, vida/helis ve tutamak. Sıra işaretleri çağdaş sergi ekidir; atış veya iç ateşleme modeli yoktur.
- 73 dönüş konumunda bütün namlu köşelerinin zemin/arka kiriş/yan kiriş açıklıkları doğrulandı. 33 ağız boşluğu ve dudak için raycast; üç 120° duruş, manuel öncelik, kaldırma/dönüş kilidi, vurgu ve sıfırlama geçti. Helepolis/J79 regresyonları geçti. İlk kontrolde arka kiriş ve kuyruk başlangıcı dönüş hacminden çıkarıldı.
- Masaüstü genel, kaldırılmış sıra/X-Ray yakın planı, dört yüzey ve altı tur; 390×844 mobil genel görünüm kontrol edildi. Yatay taşma ve konsol hatası yok. Katalog 29 aktif, grup 9/10; sıradaki kılıç–tabanca. Push yok.


## Kılıç–tabanca — 7 Kasım 2026
- Kaynak: The Metropolitan Museum of Art, https://www.metmuseum.org/art/collection/search/785931 ; 2018.371, Saksonya, Johannes Andreas Niefind’e atfedilen birleşik av silahı, çelik/ahşap, 65,5 cm. Genel ve kabza yakın plan fotoğrafları incelendi. Başlık/kayıtta yaklaşık 1740, açıklamada yaklaşık 1730 bulunduğundan arayüzde 18. yüzyılın ilk yarısı yazıldı; sıralama yılı 1735 yalnız katalog içindir.
- 16 grup / 68 mesh: kalınlıklı daralan çelik kılıç, yan yivler, kök bilezikleri, kısa açık ağızlı dış namlu, kıvrımlı ahşap kabza, uzun açık el koruması, kabza başı/sırt, dış levha, çakmak kolu ve karşı çelik, yarıklı vidalar, kıvrımlı bezeme, döner çağdaş kaide. Bezemeler özgün figürlerin kopyası değil yorumdur. İşlevsel iç ateşleme veya atış gösterimi yoktur.
- Test: iki taraftan kılıç yüzeyine raycast; el koruması boşluğu ve dolu kenarı; namlu ağzı; 73 dönüş ve 101 levha ayırma konumu; iki yarım turda otomatik duruş, manuel öncelik, sınırlar, bezeme/sıfırlama geçti. İlk görsel kontrolde yüz normalleri, kabza mesnedi ve bezeme yüzey konumu düzeltildi.
- Masaüstü kabza/dış levha yakın planı, dört yüzey/CAD, altı tur ve 390×844 mobil görünüm kontrol edildi. Mobil kadraj kılıcın tamamı için genişletildi. JavaScript hatası yok; mevcut favicon.ico 404 isteği sürüyor.

## Beşinci grup — bütünleşik kapanış, 7 Kasım 2026
- On araç tamamlandı, katalog 30 aktif modele ulaştı. Her araç kendi araştırma, test ve görsel kontrol kaydıyla ayrı Türkçe commit aldı; push yapılmadı.
- 21 test dosyasının tamamı geçti (yardımcı model-harness ve indirme setup-monitor betikleri test sayısına dahil değil). Yeni modellerin yanı sıra Monitor/J79, Katyuşa, V-2, Phalanx, UH-1H, U-505, Enigma çekirdeği/modeli, LCVP ve Chain Home regresyonları doğrulandı.
- Tarayıcıda 30 aracın tamamına geçiş ve karşılık gelen başlıklar doğrulandı. Çin filtresi yalnız Chu-ko-nu’yu getiriyor. Mobil yatay sayfa taşması yok.
- Müze kaynaklarıyla modern rekonstrüksiyonlar ve sergi için yorumlanan hareketler metinlerde ayrıldı. Uygulama harici Three.js/font kaynaklarını kullanmayı sürdürüyor; tam çevrimdışı paket değildir. Yeni araç sırası kullanıcıyla henüz belirlenmedi.


## Ürün önerileri — paylaşım ve kaynaklar, 7 Kasım 2026
- Kullanıcı talimatıyla tamamlanan onlunun bütün commit’leri `origin/feature/kilic-tabanca` dalına push edildi; uzak uç 4c62a85 ile yerel uç eşleşti. Main’e merge/deploy yapılmadı.
- Kullanıcı kapsamı: şimdilik paylaşım ve kaynak bağlantıları. Yorum/inceleme sayacı sunucu işi kapsam dışı; video seçkisi ayrıca araştırılabilecek sonraki öneri.
- Katalog kartları, simülatör üst çubuğu ve Enigma masasına ortak Paylaş/Kaynaklar düğmeleri eklendi. Ortak işlev `js/museum-links.js`, stil `css/museum-links.css`; veri tek katalog kaynağında. Simülatör çekirdeğine araca özel davranış eklenmedi; yalnız ortak arayüz düğmeleri ve betik/stil yüklemesi eklendi.
- Paylaşım: yerel paylaşım API’si, ardından pano; izin yoksa seçilebilir URL penceresi. İptal panoya yazmaz. URL alt dizini korur, yalnız seçili aracı içerir; Enigma mesaj/ayarları paylaşılmaz. O an açık araç URL’den okunur. Dosya/localhost ortamındaki bağlantı aynı ortamı gösterir; yayımlanmış sitede otomatik aynı site adresi kullanılır.
- Önce 20 araç için araştırma defterindeki 38 bağlantı aktarıldı. İlk 10 araç için 10 ek okuma bağlantısı araştırıldı: English Heritage (Roma ballistası/Orta Çağ kuşatma bağlamı), Historic England (1464 top arşivi), Tank Museum (Tiger I/Mark I), Museum of Flight (Spitfire IX), Museo Scienza (Leonardo), Vakıflar Dergisi (tarihi kadırga), US36836A patent kaydı ve ABD Hava Kuvvetleri Müzesi (Fokker). Tam URL’ler katalogda; ek okumalar birebir model referansı olmadıkları notuyla gösterilir. Fokker doğrudan web açmada 403 verdi, kurumsal arama kaydı okundu.
- Testler: `node tests/museum-links.cjs` — 30 araç URL’si, alt dizin ve özel sorgu temizleme, native/iptal/pano/manuel yollar, 48 HTTPS kaynak, tüm araçlarda kaynak varlığı geçti. `node tests/j79.cjs` katalog/simulator sözdizimi ve `node tests/enigma-core.cjs` regresyonları geçti.
- Tarayıcı: katalogdaki 30 paylaş düğmesi, Chu-ko-nu doğru URL kopyalama, araç değiştirdikten sonra kılıç-tabanca URL’si, pano reddinde seçili alan ve kapanınca odağın düğmeye dönmesi doğrulandı. Atlatl masaüstü kaynak paneli ve 390×844 simülatör/Enigma panelleri gözle incelendi. Dialog varsayılan margin sıfırlamasına karşı ortalandı; Enigma mobil üst çubuğuna satır kaydırma eklendi.


## 7 Kasım 2026 — Arşimet’in Demir Eli
- Kaynak: https://kotsanas.com/el/exhibits/military/archimedes-iron-hand/ . Modern müze rekonstrüksiyonu; kesin antik ölçüler ve kapasite iddiası yoktur.
- 18 grup, 218 mesh: taş sur, destekli döşeme, döner dikme, çatal, kol, kayan karşı ağırlık, irgat, bağlı halat, düşey zincir, demir kanca ve kaplamalı küçük tekne.
- 186 açı/yön/zincir konumunda bağlantı uçları ve tekne açıklıkları doğrulandı. Otomatik gösterim, el ayarı, sınırlar, sıfırlama ve dört kaplama test edildi.
- tests/archimedes.cjs, tests/j79.cjs ve tests/museum-links.cjs geçti. Masaüstü izometrik, X-Ray ve 390×844 mobil görünüm kontrol edildi; mobil kadraj ve eylem etiketi düzeltildi. Bilinen favicon 404 ve kullanıcı etkileşimi öncesi AudioContext uyarısı dışında uygulama hatası görülmedi.


## 7 Kasım 2026 — Turtle
- Kaynaklar: https://collection.sciencemuseumgroup.org.uk/objects/co42224/model-of-submersible-turtle-cut-away-object-submarines-submersibles-warships (1976-480, varsayımsal kesit modeli) ve https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/s/submarine-turtle-naval-documents.html . Özgün tekne ölçüsü veya kesin iç yerleşim iddiası yoktur.
- 20 grup, 155 mesh. Kalınlıklı 32 ahşap kaplama, iç postalar, kuşak/perçinler, camlı başlık, menteşeli kapak, hava boruları, kabin, göstergeler, iki pervane, yataklı krank ve balast pompası. Saldırı düzeneği yerine hareket/yaşam alanı anlatılır.
- 106 kapak açısı, ortak şaft fazları, sıfır devir/durdurma, açık kapak pompa kilidi, su bitişi, el ayarı ve 101 su düzeyi test edildi. Testin bulduğu kapak/başlık çakışması menteşe yüksekliğiyle düzeltildi.
- tests/turtle.cjs, tests/j79.cjs, tests/museum-links.cjs geçti. Masaüstü kapalı/açık kabuk ve X-Ray; 390×844 mobil kadraj, yatay taşma ve pompa etiketi kontrol edildi. Uygulama JavaScript hatası görülmedi.


## 7 Kasım 2026 — RRH m/42
- Kaynaklar: https://ilmatorjuntamuseo.fi/ilmatorjuntamuseo/kokoelman_helmet/rrh/ ve /acousticlocators/; dış biçim fotoğrafı: https://www.festungswerke-cuxhaven.de/horchgeraete (RRH-002). Dört ayrı borulu TSH fotoğrafı ile halka hunili RRH ayrıştırıldı. Alman RRH ailesi / Finlandiya m/42 adlandırması; tam alt tip veya ölçülü iç mekanizma kopyası değildir.
- 20 grup, 149 mesh: içi açık dört eğrisel halka hunisi, flanş/perçinler, çatal, bağlı esnek hortumlar, iki başlık, üç oturak, el çarkları, kapalı raporlama kutusu, vidalı üç ayak ve dönüş yatağı.
- Eğitim dalgası alıcıya doğru ilerler; 343 m/s sabit ses hızıyla mesafe/gecikme, görsel 4× zaman. Gerçek radar veya atış kontrol hesabı yoktur.
- tests/rrh.cjs: 61 yükselişte hortum uçları, merkez açıklığı, gecikme, dalga yönü, kesintisiz tarama başlangıcı, el ayarı, reset ve zemin teması geçti. j79 ve museum-links entegrasyon testleri geçti.
- 1440×1000 izometrik ve 60° yükselişte arka X-Ray, 390×844 mobil kadraj ve eylem etiketi kontrol edildi; uygulama hatası görülmedi.

### Üç modelin ortak son doğrulaması
25 test dosyası başarılı; katalog 33 aktif araç ve 54 HTTPS kaynak içeriyor. Yeni üç kartın simülatör bağlantıları, kaynak paneli ve kronolojik araç geçişi tarayıcıda kontrol edildi. Mobil portre ölçekleri ve bağlama uygun eylem etiketleri ayrı ayarlandı.


## 7 Kasım 2026 — Nusret
- Kaynaklar: https://www.msb.gov.tr/SlaytHaber/932021-42524 ve https://www.gmo.org.tr/upl/gdt_dergi/196.pdf (s.64). Ana oran ~40 × 7,4 m. Almanya inşası ve Osmanlı hizmeti açıkça ayrıldı. Özgün gemi / modern müze gemisi karıştırılmadı; iç makineler ve yerleşim yaklaşık eğitim kesitidir.
- 26 grup / 441 mesh: tam karina, postalar, yükseltilmiş baş güverte, camlı seyir evi, kaldırılabilir tavan, baca, direk/arma, açık filikalar, raylar, sekiz sergi maketi, vinç, demirler, kazanlar ve çift şaft/pervane. Tarihsel görevdeki 26 sayısı ayrı anlatılır.
- 101 araba konumu, tekerlek-ray oturuşu, otomatik uç sınırları/el ayarı, çift pervane ve sıfır devir, dümen, tavan/reset, gövde boyu test edildi. nusret, j79 ve museum-links testleri geçti. Masaüstü genel görünüm, makine X-Ray ve 390×844 mobil kadraj/taşma kontrol edildi.


### Osmanlı kompozit yayı — 7 Kasım 2026
- Met Müzesi 35.113.1a–oo (1719–1720): kirişsiz C biçimi, koyu lake ve altın renkli sadeleştirilmiş bezeme; iki sergi oku. Büyütülmüş model, özgün ölçü ve kurulu yorum ayrımı arayüzde açık.
- 16 seçilebilir grup, 122 mesh; ayrı ahşap/boynuz/sinir/lake katmanları, tüyler ve geometrik açık gezler. Kurulu yorumda 101 çekiş konumunda kiriş bağlantısı ve sabit uzunluk doğrulandı.
- `node tests/ottomanbow.cjs`, J79 katalog/entegrasyon ve museum-links testleri geçti (35 araç, 57 kaynak).
- Chrome 1440×1000 genel ve katman/X-Ray yakın planı; 390×844 mobil müze ve kurulu görünüm kontrol edildi, yatay taşma yok. Model hatası yok; ortak favicon.ico 404 ve programatik etkileşimde ses otomatik oynatma uyarısı mevcut.


### Vecihi K-VI ve Türk tarihi serisi — 7 Kasım 2026
- TVHMD dönem fotoğrafları ve Hürkuş’un yayımlanmış anlatımı esas alındı: 28 Ocak 1925 ilk uçuş, Benz altı silindirli su soğutmalı motor, 200 BG ve 11,7 m açıklık. Kaynaktaki teorik hızlar gerçek uçuş ölçümü olarak aktarılmadı. Renk ve gizli yerleşim yaklaşık müze yorumu.
- 24 grup / 370 mesh: kavisli kumaş kanatlar, ayrı ahşap kaburgalar, gergiler, kaporta yarıkları ve perçinler; iki gerçek boşluklu kokpit, panel, koltuklar; altı silindir, su soğutma, ahşap pervane; menteşeli kuyruk dümenleri ve ay-yıldız.
- `tests/vecihi.cjs`: 1000 pervane/krank adımı, sabit silindirler, piston aralıkları, sıfır devir, 41 dümen konumu, açık kokpit delikleri, 11,7 m açıklık, yer teması ve sıfırlama geçti. Türkiye ve Savaşlar Arası katalog filtreleri eklendi.
- Chrome 1440×1000 genel, açık kaporta/X-Ray motor ve kokpit yakın planı; 390×844 mobil kadraj kontrol edildi. İskelet kaplamanın içine alındı, kokpit kamerası paneli ve koltukları gösterecek şekilde düzeltildi; yatay taşma yok. Ortak favicon 404 / otomatik ses uyarısı dışında model hatası görülmedi.
- Son regresyon: 28 test dosyasının tamamı geçti; 36 araç, 59 HTTPS kaynak. Üç yeni araç için ayrı Türkçe commit.
