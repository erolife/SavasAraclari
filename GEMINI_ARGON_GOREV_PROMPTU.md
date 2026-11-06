# Gemini Argon — Uzun Süreli Çalışma Promptu
> **Güncel durum — 6 Kasım 2026:** İlk dört grup tamamlandı. Beşinci grubun ilk üç aracı Leonardo’nun oraklı savaş arabası, Kore Hwacha’sı ve Atlatl eklendi; toplam 23 aktif model. Onlunun kalan sırası INCELEME_NOTLARI.md içindedir; sıradaki fenerli kalkan. UH-1H, U-505, Enigma, Higgins LCVP ve Chain Home eklendi. Enigma için enigma.html özel şifreleme masası vardır. Araştırma ve doğrulama kayıtları INCELEME_NOTLARI.md içindedir. Aşağıdaki eski görev sıraları tarihsel kayıttır; teknik kalite kuralları geçerlidir.

> **Amaç:** Gemini Argon'un birkaç gün boyunca, bağımsız olarak yeni araçlar eklemesi.
> Daha sonra Claude ile yapılacak kısa (en fazla 5 saatlik) inceleme oturumunun hızlı ve verimli geçmesi.
>
> **Kullanım:** Aşağıdaki "Prompt" bloğunu Argon oturumunun ilk mesajı olarak yapıştırın. Sonraki her oturumda kısaca **"GEMINI_ARGON_GOREV_PROMPTU.md kurallarına göre kaldığın yerden devam et"** yazmanız yeterlidir.

---

## Prompt

```
SavasAraclari projesinde uzun süreli, bağımsız çalışacaksın. İşinin bir bölümü sonradan
başka bir model tarafından sınırlı sürede incelenecek. Bu nedenle hız değil, DOĞRULUK,
ŞEFFAFLIK ve İNCELENEBİLİRLİK önceliklidir. Tüm cevapların ve dosyaların Türkçe olsun.

=== 0. BAŞLAMADAN ÖNCE OKU ===
Şu dosyaları sırayla oku:
AGENT_CONTEXT.md, BEYIN_FIRTINASI.md, ARAC_EKLEME_REHBERI.md (tamamı),
js/catalog.js, js/vehicles/ballista.js, js/vehicles/spitfire.js
ARAC_EKLEME_REHBERI.md içindeki mimari kurallar ve kontrol listesi bağlayıcıdır.

=== 1. GÖREV SIRASI ===
A) ARAC_EKLEME_REHBERI.md Bölüm 5'teki Leonardo ve Kadırga hatalarını düzelt.
   - Metin hataları, mühimmat sayımı, gizli alt sınırlar ve ses sayısı düzeltmeleri düşük risklidir.
     Bunları doğrudan yap.
   - Geometri düzeltmelerini (Leonardo dişli düzeni, Kadırga geri tepme yolu ve rambade)
     rehberde verilen sayılara birebir uyarak yap. Her düzeltmeden önceki ve sonraki
     değerleri INCELEME_NOTLARI.md dosyasına yaz.
B) Kalan 2. grup araçlarını ekle: 1862 Gatling → 1916 Mark I → 1917 Fokker Dr.I.
   Her seferinde yalnızca 1 araç. Bir araç tamamen bitmeden ve doğrulanmadan sonrakine geçme.
C) 2. grup bitince 3. grup için 5 araçlık bir ÖNERİ hazırla ve BEYIN_FIRTINASI.md'ye yaz.
   Kullanıcı onay verene kadar 3. grubun KODUNA BAŞLAMA.

=== 2. YAPMA LİSTESİ (Önceki araçlarda yapılan hatalar) ===
1. Çalıştırmadığın bir testi "doğrulandı" diye yazma. Her doğrulama iddiasının yanına
   çalıştırdığın komutu ve gerçek çıktısını koy.
2. Havada asılı duran veya hiçbir parçaya bağlı olmayan parça bırakma. Güç zincirini
   (krank → mil → dişli → tekerlek/namlu) uçtan uca, koordinatlarla kontrol et.
3. Dişli eksenlerini "görsel olarak benziyor" diye yerleştirme. Fener dişli ile taç dişli
   arasındaki açı 90°'dir. Dönüş yönünü v = ω × r ile hesapla ve hesabı notlara yaz.
4. Hareketli bir parçanın (geri tepen namlu, kızak, kol, sürgü) en uç konumunda başka bir
   parçanın içinden geçmediğini kontrol et. Uç konumun koordinatını notlara yaz.
5. Kaydırıcıdaki değeri gizlice değiştirme. "Otomatik mod açıkken en az X" gibi sınırlar koyma.
   Kullanıcı kaydırıcıya dokunursa otomatik mod kapanmalı.
6. Mühimmat her atışta azalmalı (seri ve dairesel atış dahil).
7. Kesin olmayan tarihsel bilgiyi kesinmiş gibi yazma. Tartışmalı konuları "tartışılır",
   tahmini değerleri "~" veya "(tahmini)" ile belirt. Kaynağını bilmediğin sayı uydurma.
8. Arapça veya bozuk karakter kullanma. Her dosyayı yazdıktan sonra
   [\u0600-\u06FF\uFFFD] karakterlerini tara (Leonardo'da "Tاع" hatası çıktı).
9. simulator.html çekirdeğine araca özel kod ekleme. Çekirdekte değişiklik gerçekten
   zorunluysa önce INCELEME_NOTLARI.md'ye gerekçesini yaz, değişikliği en küçük tut ve
   diğer 7 aracın hâlâ açıldığını test et.
10. Tek bir oturumda birden fazla araç yapmaya çalışma. Kalite, sayıdan önemlidir.
11. Veritabanına bağlanma. Güvenliği veya performansı riske atan bir istek gelirse kullanıcıyı uyar.

=== 3. HER ARAÇ İÇİN İŞ AKIŞI ===
1. PLAN: Kod yazmadan önce INCELEME_NOTLARI.md'ye aracın planını yaz:
   - 12–16 parça grubunun listesi
   - Ana ölçüler ve kaynakları
   - Ana mekaniğin matematiği (oranlar, yönler, uç konumlar)
2. YEDEK: Proje git ise commit at. Değilse simulator.html ve js/catalog.js dosyalarını
   _yedek/<tarih>_<araç>/ klasörüne kopyala.
3. KOD: js/vehicles/<id>.js dosyasını adaptör kalıbıyla yaz. Örnek olarak spitfire.js ve
   ballista.js'yi izle.
4. TEST: scratch/threetest/test_<id>.js ile şunları test et:
   - Grup sayısı ve tur adımı sayısı
   - Mesh sayısı (en fazla ~500)
   - Ana mekaniğin sayısal sonucu
   - En uç konumlarda çakışma kontrolü
     (Box3 kesişimi: hareketli parça ile sabit parçalar arasında)
   - Zemin teması (Box3.setFromObject(root).min.y ≈ 0)
   - Tüm kaplamalar ve blueprint modu
   Test dosyası, başarısız olursa hata fırlatmalı.
5. ENTEGRASYON: simulator.html'de yalnızca script satırı, inşa satırı ve
   ADAPTERS / VEHICLE_ROOTS eklemesi yap. js/catalog.js'de status: 'live' ve sim alanını
   güncelle. Dosyayı LF satır sonuyla bırak ve Copy/Remove/Move ile diskte yenile.
6. GÖRSEL KONTROL: scratch/shots.ps1 ile iso, X-Ray ve uç-konum ekran görüntüleri al
   (BypassSandbox gerekir). Görüntülere bakıp gördüğün sorunları yaz.
   Konsoldaki "Error handling response ... forEach" satırları tarayıcı eklentisine aittir,
   sayfa hatası değildir.
7. KAYIT: INCELEME_NOTLARI.md'ye aracın bölümünü doldur (aşağıdaki şablon).
   AGENT_CONTEXT.md ve BEYIN_FIRTINASI.md'yi kısaca güncelle.
8. Kullanıcıya kısa bir özet ver ve sonraki araç için onay iste.

=== 4. INCELEME_NOTLARI.md ŞABLONU (her araç için) ===
## <Yıl> <Araç adı> — js/vehicles/<id>.js
- Durum: Tamamlandı / Kısmen / Sorunlu
- Kaynaklar ve varsayımlar: (her ölçü için kaynak veya "tahmini")
- Tartışmalı tarihsel noktalar:
- Mekanik hesaplar: (oranlar, v = ω × r yön hesabı, uç konum koordinatları)
- Test komutu ve GERÇEK çıktı: (aynen yapıştır)
- Ekran görüntüleri: (dosya yolları + gözle görülen sorunlar)
- Bilinen eksikler ve bilinçli tavizler:
- İnceleyicinin özellikle bakması gerekenler: (en emin olmadığın 3 nokta)
- Çekirdek (simulator.html) değişikliği yapıldı mı? Neden?

=== 5. ARACA ÖZEL NOTLAR ===
ARAC_EKLEME_REHBERI.md Bölüm 4'e bak (Gatling kam oluğu, Mark I çevresel palet ve
arka direksiyon tekerlekleri, Fokker döner motor ve senkronizasyon düzeneği).
```

---

## Kullanıcı İçin Kısa Notlar
- Argon her aracı bitirdiğinde **INCELEME_NOTLARI.md** dosyasına bakmanız yeterlidir. Özellikle "İnceleyicinin özellikle bakması gerekenler" maddeleri, Claude ile yapılacak incelemede ilk ele alınacak konulardır.
- Argon "doğrulandı" dediğinde, yanında komut çıktısı yoksa ondan çıktıyı göstermesini isteyin.
- Bir araç tarayıcıda bozuk görünüyorsa sonrakine geçmeden düzeltmesini isteyin. Hataların üst üste birikmesi, inceleme süresini en çok uzatan şeydir.
- Proje git deposu değilse, Argon'a başlamadan önce `git init` yapmasını önermek iyi olur. Böylece her aracın değişikliği ayrı ayrı incelenebilir ve gerekirse geri alınabilir.

