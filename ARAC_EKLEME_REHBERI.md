# Araç Ekleme Rehberi ve Devam Promptu
> **Güncel durum — 6 Kasım 2026:** İlk dört grup tamamlandı: 20 aktif model. UH-1H, U-505, Enigma, Higgins LCVP ve Chain Home eklendi. Enigma için enigma.html özel şifreleme masası vardır. Araştırma ve doğrulama kayıtları INCELEME_NOTLARI.md içindedir. Aşağıdaki eski görev sıraları tarihsel kayıttır; teknik kalite kuralları geçerlidir.

> Bu dosya, yeni bir oturumda (hangi model veya ajan olursa olsun) projeye kaldığı yerden, aynı kalite çizgisinde devam edilebilsin diye hazırlandı.
> **Kullanım:** Aşağıdaki "Hazır Prompt" bölümünü kopyalayıp yeni oturumun ilk mesajı olarak yapıştırın.

---

## 1. Hazır Prompt (Kopyala ve Yapıştır)

```
SavasAraclari projesine devam ediyoruz. Kod yazmadan önce sırasıyla şunları oku:
1) AGENT_CONTEXT.md  2) BEYIN_FIRTINASI.md  3) ARAC_EKLEME_REHBERI.md (bu dosya)
4) js/catalog.js  5) Örnek adaptör: js/vehicles/ballista.js ve js/vehicles/spitfire.js

Görev sırası:
A) Önce ARAC_EKLEME_REHBERI.md "Bölüm 5 — Açık Hatalar" listesindeki Leonardo ve
   Kadırga düzeltmelerini yap ve doğrula.
B) Sonra 2. Grubun kalan araçlarını SIRAYLA ve OTURUM BAŞINA 1 ARAÇ olacak şekilde ekle:
   1862 Gatling → 1916 Mark I → 1917 Fokker Dr.I
Her araçta rehberdeki "Bölüm 3 — Kontrol Listesi"nin tamamını uygula. Bitince
AGENT_CONTEXT.md ve BEYIN_FIRTINASI.md dosyalarını Türkçe güncelle. Tüm cevaplar Türkçe olsun.
```

---

## 2. Mimari Kurallar (Değiştirilemez)

| Kural | Açıklama |
|---|---|
| **Klasik script** | Araç modülleri ES module değildir. `(function(){ window.VehicleBuilders.<id> = function(ctx){...} })();` kalıbıyla yazılır. Sayfa `file://` ile açıldığında yerel `import` CORS nedeniyle engellenir. |
| **Tek kaynak katalog** | Araç bilgileri yalnızca `js/catalog.js` içinde tutulur. Araç bitince sadece `status: 'live'` ve `sim: '<id>'` alanları değiştirilir; ana sayfa ve simülatör menüsü kendiliğinden güncellenir. |
| **Adaptör kalıbı** | Modül şu nesneyi döndürür: `{ root, ui, camPresets, tourSteps, parts, defaultPart, firePart, update(dt, elapsed), onSlider(i,v), onButton(name), buttonActive(name), onFire(), fireButtonLabel(), modeLabel(), getSliderValues(), getStats(), getStatus(), applyTextures(blueprint), setTexture(key), toggleRelief() }` |
| **simulator.html entegrasyonu** | Bu dosyada yalnızca 3 değişiklik yapılır: (1) `<script src="js/vehicles/<id>.js">` satırı, (2) `currentBuildVehicle = '<id>'; const x = window.VehicleBuilders.<id>(buildCtx);`, (3) `ADAPTERS` ve `VEHICLE_ROOTS` nesnelerine ekleme. Çekirdeğe araca özel kod **eklenmez**. |
| **Sabit arayüz yuvaları** | 3 kaydırıcı (`slider-rpm`, `slider-turret`, `slider-elev`), 2 düğme (`terrain`, `sweep`), isteğe bağlı mod düğmesi (`ui.buttons.mode: true` + `modeLabel()`), 4 telemetri değeri, 6 kamera açısı (`iso, front, breech, engine, suspension, top`), 6 tur adımı. |
| **Mesh kaydı** | Seçilebilir ve X-Ray'e tepki veren her mesh `ctx.addCADMesh` ile eklenir. Efekt mesh'leri (namlu alevi, bulanık disk) doğrudan `new THREE.Mesh` ile oluşturulur. Çekirdek bunları `origColor` olmadığı için atlar. |
| **Satır sonu** | `simulator.html` LF satır sonuyla kalmalı. PowerShell `WriteAllLines` kullanmayın. Düzenlemeden sonra `Copy-Item → Remove-Item → Move-Item -Force` ile dosyayı diskte yenileyin. |
| **Veritabanı yok** | Proje tamamen istemci tarafında çalışır. Hiçbir veritabanına bağlanılmaz. |

---

## 3. Her Yeni Araç İçin Kontrol Listesi

### 3.1. Tarihsel Doğruluk
- [ ] Ölçüler gerçek bir müze örneğine veya kaynağa dayanmalı. Tahmini değerler arayüzde "(tahmini)" / "~" ile belirtilmeli.
- [ ] Tarihsel olarak tartışmalı konular (Leonardo'daki ters dişli gibi) kesin bilgi gibi sunulmamalı; "tartışılır" diye yazılmalı.
- [ ] Parça açıklamalarında kullanılan terimler o döneme uygun olmalı (örneğin kadırgada *apostis, korsiye, rambade, braga*).

### 3.2. Mekanik Tutarlılık (⚠️ Leonardo ve Kadırga'da en çok hata burada çıktı)
- [ ] **Güç aktarım zinciri kesintisiz olmalı:** Krank → mil → dişli → tekerlek arasında boşlukta duran bir parça kalmamalı. Her dişli, fiziksel olarak temas ettiği parçaya değmeli.
- [ ] **Dişli eksenleri doğru olmalı:** Fener dişli ile taç dişli arasındaki aktarım **90°**dir. Bu nedenle pinyonun ekseni tekerlek dingiline **dik** olmalıdır (paralel olmamalı).
- [ ] **Dönüş yönleri hesapla doğrulanmalı:** Temas noktasındaki hız vektörü `v = ω × r` ile hesaplanmalı ve animasyondaki işaretler (±) buna göre seçilmeli.
- [ ] **Hareketli parçaların yolu boş olmalı:** Geri tepen namlu, kayan kızak veya dönen kol; direk, takoz, gövde gibi sabit parçaların içinden geçmemeli. En uç konum (maksimum geri tepme, tam açılı kol) mutlaka kontrol edilmeli.
- [ ] **Yerleşim:** Platformlar ve güverteler tekerleklerin içinden geçmemeli (gerekirse tekerlek boşluğu bırakılmalı). Hiçbir parça havada asılı kalmamalı; destek kirişi veya dikmesi olmalı.
- [ ] Tekerlek, palet veya iniş takımı zemine tam değmeli (`Box3.setFromObject(root).min.y ≈ 0`).

### 3.3. Arayüz ve Durum Mantığı
- [ ] Kaydırıcıda görünen değer, simülasyonda **gerçekten kullanılan** değerle aynı olmalı. "Otomatik mod açıkken en az X" gibi gizli alt sınırlar kullanılmamalı (Leonardo ve Kadırga'da bu hata var).
- [ ] Otomatik modlar, kullanıcının kaydırıcıyla verdiği değeri her karede ezmemeli. Kullanıcı kaydırıcıya dokunursa otomatik mod kapanmalı.
- [ ] Mühimmat her atışta azalmalı; seri atış modu da dahil. Mühimmat bitince ateş düğmesi "İkmal" moduna geçmeli.
- [ ] Telemetri birimleri `<span>` içinde ve okunaklı olmalı (örneğin "0.0 (Dönüş) Knot" gibi bozuk ifadeler olmamalı).
- [ ] Metinlerde yazım hatası veya bozuk karakter olmamalı (Leonardo'da `'Tاع Dişli Teker'` ve `'İLERlemeye'` hataları var). Dosyalar UTF-8 kaydedilmeli.

### 3.4. Performans
- [ ] Hedef: araç başına en fazla ~500 mesh. Tekrar eden parçalar (palet baklası, perçin, kürek) için `addInstancedMesh` tercih edilmeli.
- [ ] Ses: Seri atışta her mermi için ayrı `playCannonFire()` çağrılmamalı (16 top için 16 ses aşırı yük oluşturur). 2–3 atışta bir ses çalınmalı.
- [ ] Prosedürel canvas dokuları en fazla 256–512 px olmalı; her kaplama için bir kez üretilip önbelleğe alınmalı.

### 3.5. Doğrulama (Her Araç Sonunda Zorunlu)
1. `scratch/threetest/test_<id>.js` dosyası oluşturulmalı (gerçek three.js ile: `require('./node_modules/three/build/three.cjs')`). Şunlar test edilmeli:
   - Parça grubu sayısı
   - Tur adımı sayısı
   - Ana mekaniğin sayısal sonucu (dönüş yönü, geri tepme mesafesi ve geri dönüşü vb.)
   - Tüm kaplamaların `applyTextures(false/true)` ile hatasız çalışması
2. `simulator.html` modül betiğinin sözdizimi `new Function(...)` ile kontrol edilmeli.
3. Headless Edge ekran görüntüsü alınmalı (`scratch/shots.ps1`, `BypassSandbox` gerekir). İzometrik ve X-Ray görünümlerde gözle kontrol yapılmalı.
   - Konsoldaki "Error handling response … forEach" uyarıları tarayıcı eklentisinden gelir; sayfa hatası değildir.
4. `simulator.html?vehicle=<id>` adresinde üst çubuk, menü (`Araç Seç (N/10)`) ve `◀ / ▶` geçişleri kontrol edilmeli.

---

## 4. Kalan 2. Grup Araçları — Özel Notlar

### 4.1. 1862 Gatling (`js/vehicles/gatling.js`)
- 6 namlu **birlikte** döner; dış muhafaza ve kam oluğu sabittir. Kilit sürgüleri, sabit **helisel kam oluğu** boyunca ileri ve geri gider. Kam eğrisini bir fonksiyon olarak tanımlayın: `z(θ)` (θ: demetin dönüş açısı).
- Ateşleme, her namlu **aynı açısal konuma** geldiğinde olmalıdır (genellikle saat 12 veya 3 yönü). Atış hızı = krank devri × dişli oranı × 6.
- Boş kovanlar alttan atılmalı (küçük bir parçacık havuzu kullanılabilir). Yerçekimli şarjör (Bruce / Broadwell tipi) üst tarafta olmalı.
- Krank ile namlu demeti arasındaki dişli oranını belirtin. Tahmini değerleri "~" ile gösterin.

### 4.2. 1916 Mark I "Male" (`js/vehicles/mark1.js`)
- Palet, eşkenar dörtgen gövdenin **çevresini** dolaşır. Tiger'daki `CatmullRomCurve3` + `InstancedMesh` palet sistemini yeniden kullanın (kapalı ve köşeli bir eğri).
- Yön değiştirme: Ana vites kutusu ve sağ/sol ikincil vitesler ile yapılır. Gerçekte 4 kişi gerekirdi. Bunu, düğmeyle bir paletin durdurulması (diğerinin dönmesi) şeklinde gösterin.
- Sponson topları (6-pounder) gövdenin yan çıkıntılarındadır. Kuyrukta **arka direksiyon tekerlekleri** vardı (ilk modeller); bunu unutmayın.
- Siper aşma gösterimi: Gövde, açılı bir zemin profili üzerinde eğilmeli ve paletler temas etmeli.

### 4.3. 1917 Fokker Dr.I (`js/vehicles/fokker.js`)
- **Döner (rotary) motor:** Krank mili gövdeye sabittir. 9 silindir, karter ve pervane **birlikte döner**. Bu nedenle pistonları silindire göre değil, silindir bloğunu döndürerek canlandırın.
- **Senkronizasyon:** Kam, pervane palası namlu önündeyken ateşi keser. "Kapalı" modda iz mermilerinin pervaneye isabet ettiğini (kıvılcım efekti) gösterin. İsabet hesabı açı karşılaştırmasıyla yapılmalı: pala açısı ±tolerans.
- Spitfire'daki `buildSurface` kanat üreticisi uyarlanabilir (üç kanat; dikdörtgene yakın planform, kalın kesit). Kanatlar arası dikmeler kanatlara değmeli.
- Kızıl Baron boyası dahil 4 kaplama. "Fokker Dr.I kırmızıydı" genellemesinden kaçının: çoğu Dr.I kahverengi-yeşil fabrika boyasındaydı.

---

## 5. Açık Hatalar — Önce Bunlar Düzeltilecek

> Bu liste, 4 Kasım 2026 tarihli kod incelemesinde tespit edildi. Ekran görüntüsü doğrulaması kota nedeniyle **tamamlanamadı**; düzeltmelerden sonra görsel kontrol yapılmalıdır.

### 5.1. Leonardo (`js/vehicles/leonardo.js`)
1. **Bozuk metin:** `camLabels.suspension: 'Tاع Dişli Teker'` → `'Taç Dişli Teker'` olmalı. `getStatus` içindeki `'DÜZELTİLMİŞ: İLERlemeye HAZIR'` → `'DÜZELTİLMİŞ: İLERLEMEYE HAZIR'` olmalı.
2. **Dişli geometrisi yanlış (en önemli hata):**
   - Fener pinyonların ekseni şu an X yönünde, yani tekerlek dingiline **paralel**. Taç dişliyle 90° aktarım için pinyon ekseni **Z** yönünde olmalı.
   - Pinyonlar, krank milleriyle bağlantısız biçimde havada duruyor.
   - **Önerilen çözüm:**
     - Her yanda, tekerlek merkezi yüksekliğinde (y ≈ 0.56, x ≈ ±1.04) Z yönünde uzanan bir **tahrik mili** eklenmeli.
     - Bu mil, krank miline z=0 noktasında bir çift düz dişliyle bağlanmalı (r ≈ 0.26 ve r ≈ 0.475).
     - Ön pinyon z = +0.82 konumunda olmalı (ön taç dişlinin **arka** kenarı).
     - Kodeks modunda arka pinyon z = −0.82 konumunda olmalı (arka taç dişlinin **ön** kenarı → ters dönüş).
     - Düzeltilmiş modda arka pinyon z = −1.54 konumuna kaymalı (arka kenar → aynı yön).
     - "Ara avare dişli" kavramı kaldırılmalı; yerine "arka pinyon kaydırma çatalı" konmalı. Bu değişiklik açıklama, tur metni ve `AGENT_CONTEXT.md` dosyasına da yansıtılmalı.
   - Tekerlek açısal hızı ≈ tahrik mili hızı × (0.12 / 0.36) olmalı. Hız telemetrisi bu orana göre yeniden hesaplanmalı (28 RPM'de ≈ 1 km/sa).
3. **Platform tekerleklerin içinden geçiyor:** Y=0.62'deki dairesel platform tekerlekleri kesiyor. Platform, tekerlek ve dişli boşlukları bırakılarak birden fazla kutu parçasıyla kurulmalı. Barut fıçıları ve sandıklar da boşlukların dışına taşınmalı.
4. Top halkası (`ringTrackGeo`) havada duruyor; altına 8 adet dikme eklenmeli.
5. **Mühimmat:** 16 atışlık salvo yalnızca 4 azaltıyor; dairesel atış modunda ise mühimmat hiç azalmıyor. Her top atışında 1 azalmalı. Ayrıca `S.SalvoActive` yazım hatası temizlenmeli.
6. **Gizli alt sınır:** `autoCrank` açıkken devir en az 24 RPM'e zorlanıyor. Bu kaldırılmalı: "Otomatik krank" açıksa `S.rpm` kullanılmalı, kapalıysa 0.
7. Salvoda 16 ayrı ses çalınıyor → 2 atışta bir ses çalınmalı.

### 5.2. Kadırga (`js/vehicles/kadirga.js`)
1. **Geri tepme yolu engelli:** Top 1,33 m geri kayınca kızak, arka takozun (z=1.02) içinden geçiyor. Kuyruk topuzu ise pruva direğine (z≈0.55) çarpıyor.
   - Geri tepme ~0,75 m'ye düşürülmeli: `S.gunSlideZ` en az 1.70, frenleme ivmesi ≈ 14.
   - Takoz z ≈ 0.70 konumuna, kızak rayları z 0.65–3.45 aralığına taşınmalı. Rambade platformu z 0.6–3.6 aralığında olmalı.
   - Direk z ≈ −0.15 konumuna alınmalı.
   - Metinlerde, katalogdaki teknik özelliklerde ve testteki (`minZ` eşiği) "1,35 m" ifadesi güncellenmeli.
2. **Rambade platformu havada:** Pruvada gövde çok dar (~0.32 m yarı genişlik), platform ise 2.65 m. Apostis kirişleri pruvaya kadar (z ≈ 3.4) uzatılmalı ve platformu taşıyan bir pruva enine kirişi eklenmeli.
3. **Ana güverte kaplaması yok:** Kemere kirişleri var ama güverte yüzeyi yok. Y_DECK seviyesinde güverte kaplaması eklenmeli. Bu kaplama `partHullPlanking` (dış kabuk) içinde olmalı ki X-Ray modunda ambar görünsün.
4. **Gizli alt sınır:** `autoRow` açıkken tempo en az 18'e zorlanıyor. Leonardo'daki gibi düzeltilmeli.
5. **Telemetri:** Dönüş modunda `'0.0 (Dönüş)' + ' Knot'` bozuk görünüyor → `0.0 <span>Knot (dönüş)</span>` olmalı.
6. **Kaydırıcı ezilmesi:** Nişan dönüşü ve otomatik nişan modları, dümen kaydırıcısının değerini her karede eziyor. Kullanıcı kaydırıcıya dokunduğunda bu modlar kapanmalı.

---

## 6. Ek Fikir Havuzu (Sonraya)
- Üst çubuktaki araç seçici artık sabit genişlikte (aktif araç rozeti + `◀ / ▶` + katalog menüsü); 50 araca kadar ölçeklenir.
- 3. grup adayları: USS Monitor taret (1862), V-2 (1944, ilk "Uzay" aracı), Katyuşa BM-13, J79 turbojet, Phalanx CIWS.
- Kullanıcı fikirleri (`BEYIN_FIRTINASI.md`): paylaş butonu, inceleme sayısı/yorum çekmecesi (sunucu gerektirir; güvenlik ve veritabanı kararı kullanıcıdadır), YouTube bağlantıları.

