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




