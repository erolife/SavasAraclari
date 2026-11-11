/* T-155 Fırtına: 155 mm L/52 kundağı motorlu obüs, hidropnömatik süspansiyon ve otomatik mermi yükleme kolu. Müze referanslı yaklaşık model; balistik atış tablosu hesaplamaz. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.firtina = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'firtina');
    const { T, root, parts, mats: M, mesh, box, cyl, ring, pipe, beam, instances } = K;

    const R = 0.34, TR = 0.06, WY = R + TR, WX = 1.38;
    const WZ = [2.10, 1.16, 0.22, -0.72, -1.66, -2.52];
    const SPR = { z: 3.04, y: 0.68, r: 0.31 }, IDL = { z: -3.18, y: 0.62, r: 0.29 };

    const S = {
      elev: 32, turret: 0, rpm: 900,
      kneel: false, autoLoad: false,
      ammo: 48, firing: false, firePhase: 0,
      loadPhase: 0, wheelAngle: 0, fanAngle: 0
    };
    const counts = {}; let n = 0;

    // TSK kara kamuflaj haki-zeytin ana rengi
    M.paint.color.setHex(0x4c583e); M.paint.roughness = 0.80;
    const camoDark = M.paint.clone(); camoDark.color.setHex(0x3a4332); camoDark.userData.paint = true;
    const armorSteel = M.paint.clone(); armorSteel.color.setHex(0x525e44); armorSteel.userData.paint = true;
    const engineMat = M.dark.clone(); engineMat.color.setHex(0x363d42);
    const shellOlive = M.brass.clone(); shellOlive.color.setHex(0x6b7042); shellOlive.roughness = 0.55;
    const flashMat = new T.MeshBasicMaterial({ color: 0xffa834, transparent: true, opacity: 0.88, depthWrite: false });

    function G(parent, pos, name) {
      const g = new T.Group(); g.position.set(...pos); if (name) g.name = name; parent.add(g); return g;
    }
    function P(key, name, sub, desc, exp = [0, 0.5, 0], outer = false, parent = root) {
      counts[sub] = (counts[sub] || 0) + 1;
      const p = K.part(key, ++n + '. ' + name, sub, [0, 0, 0], exp, desc, outer, parent);
      p.userData.material = 'Kaynaklı zırh çeliği, dövme namlu çeliği, alüminyum-çelik iç mekanizma ve kauçuk palet pedleri';
      p.userData.spec = 'T-155 Fırtına (1:1 ölçek • 155 mm L/52 • 48 mermi otomatik besleme)';
      return p;
    }
    const UP = new T.Vector3(0, 1, 0), tmpA = new T.Vector3(), tmpB = new T.Vector3(), tmpD = new T.Vector3();
    function stretch(o, a, b) {
      tmpA.set(...a); tmpB.set(...b);
      o.position.copy(tmpA).add(tmpB).multiplyScalar(0.5);
      tmpD.copy(tmpB).sub(tmpA);
      o.scale.y = Math.max(tmpD.length(), 1e-4);
      o.quaternion.setFromUnitVectors(UP, tmpD.normalize());
    }

    // Gövde yüksekliği atış kilidi (kneel) sırasında -0,12 m çöker; tekerlekler ve palet y=0'da kalır!
    const hullBody = G(root, [0, 0, 0], 'hull-body');

    // --------------------------------------------------------- 1..3 ZIRHLI GÖVDE, ÖN LEVHA VE ARKA KAPI
    function hullGeo() {
      const st = [
        [-3.52, 0.48, 1.56, 1.66],
        [-3.35, 0.42, 1.62, 1.68],
        [1.95, 0.42, 1.62, 1.68],
        [2.95, 0.46, 1.32, 1.66],
        [3.48, 0.72, 0.98, 1.56]
      ];
      const rings = st.map(([z, yb, yt, ws]) => [
        [0, yb], [1.04, yb], [1.04, 1.02], [ws, 1.02], [ws - 0.08, yt],
        [-(ws - 0.08), yt], [-ws, 1.02], [-1.04, 1.02], [-1.04, yb]
      ].map(([x, y]) => [x, y, z]));
      const v = [], ix = [], N = rings[0].length;
      rings.forEach(r => r.forEach(p => v.push(...p)));
      for (let j = 0; j < rings.length - 1; j++) {
        for (let i = 0; i < N; i++) {
          const a = j * N + i, b = j * N + (i + 1) % N;
          ix.push(a, b, a + N, b, b + N, a + N);
        }
      }
      const cap = (j, flip) => {
        const c = v.length / 3, r = rings[j];
        v.push(0, 1.05, r[0][2]);
        for (let i = 0; i < N; i++) {
          const a = j * N + i, b = j * N + (i + 1) % N;
          flip ? ix.push(c, b, a) : ix.push(c, a, b);
        }
      };
      cap(rings.length - 1, false); cap(0, true);
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(v, 3));
      g.setIndex(ix);
      const flat = g.toNonIndexed();
      flat.computeVertexNormals();
      return flat;
    }

    const hull = P('hull', 'Kaynaklı Zırhlı Gövde Kabuğu', 'Gövde',
      'Önde motor ve sürücü bölmesi, arkada geniş dövüş bölmesi barındıran kaynaklı zırh çeliği gövde. X-Ray iç güç paketini ve süspansiyon kollarını açar.',
      [0, 0.8, 0], true, hullBody);
    const hMat = armorSteel.clone(); hMat.side = T.DoubleSide; hMat.userData.paint = true;
    mesh(hull, hullGeo(), hMat);
    for (const s of [-1, 1]) box(hull, [0.42, 0.03, 6.85], [s * 1.48, 1.04, -0.05], camoDark); // yan etek/çamurluk

    const glacis = P('glacis', 'Ön Eğik Levha, Sürücü Kapağı ve Namlu Yol Kilidi', 'Gövde',
      'Sol önde üç periskoplu sürücü mahalli, sağ önde motor panjurları ve en uçta intikal sırasında 8 metrelik namluyu sabitleyen katlanır yol kilidi.',
      [0, 0.5, 1.1], false, hullBody);
    // Sol sürücü kapağı ve periskoplar
    cyl(glacis, 0.30, 0.06, [-0.82, 1.64, 1.92], camoDark);
    for (const dx of [-0.14, 0, 0.14]) box(glacis, [0.09, 0.09, 0.12], [-0.82 + dx, 1.70, 2.22], M.dark);
    // Sağ motor soğutma ızgarası
    box(glacis, [1.05, 0.05, 1.25], [0.58, 1.63, 1.85], M.dark);
    // Ön namlu yol kilidi (A-çerçeve) ve farlar
    const travelLock = G(glacis, [0, 1.18, 3.25], 'travel-lock');
    for (const s of [-1, 1]) {
      beam(travelLock, [s * 0.38, 0, 0], [s * 0.14, 0.92, -0.18], 0.06, M.paint);
      cyl(glacis, 0.08, 0.10, [s * 1.25, 1.24, 3.22], M.dark, 'z');
    }
    ring(travelLock, 0.16, [0, 0.96, -0.18], M.steel, 0.028);

    const rearDoor = P('rearDoor', 'Arka Çift Kanatlı Personel ve Mühimmat İkmal Kapısı', 'Gövde',
      'Poyraz mühimmat ikmal aracından dakikalar içinde mermi ve barut aktarımına olanak veren geniş arka gövde kapısı.',
      [0, 0.4, -1.2], false, hullBody);
    for (const s of [-1, 1]) {
      box(rearDoor, [0.68, 0.96, 0.06], [s * 0.38, 1.02, -3.54], camoDark);
      box(rearDoor, [0.08, 0.16, 0.08], [s * 0.12, 1.02, -3.58], M.dark);
    }

    // --------------------------------------------------------- 4..5 GÜÇ PAKETİ (ÖN-SAĞ MTU DİZEL + ALLISON)
    const engine = P('engine', '1.000 BG MTU 881 Ka-500 V8 Dizel Motor (Ön-Sağ)', 'Güç Paketi',
      'Kundağı motorlu obüse ~65 km/sa hız kazandıran kompakt sekiz silindirli su soğutmalı turbo dizel motor.',
      [0.5, 1.0, 0.8], false, hullBody);
    box(engine, [0.76, 0.58, 1.18], [0.52, 0.88, 1.52], engineMat);
    for (const s of [-1, 1]) {
      const bank = G(engine, [0.52 + s * 0.22, 1.18, 1.52], 'v8-bank-' + s);
      bank.rotation.z = -s * 0.48;
      box(bank, [0.22, 0.24, 1.08], [0, 0.06, 0], M.steel);
      instances(bank, new T.CylinderGeometry(0.05, 0.05, 0.06, 10), M.dark,
        Array.from({ length: 4 }, (_, i) => ({ pos: [0, 0.20, -0.36 + i * 0.24] })));
    }
    cyl(engine, 0.11, 0.44, [0.52, 1.36, 1.02], M.brass, 'z'); // çift turboşarj

    const transmission = P('transmission', 'Allison X-1100-5 Otomatik Şanzıman ve Soğutma Fanı', 'Güç Paketi',
      'Motorun önünde yer alan çapraz tahrikli otomatik şanzıman, frenler ve üst radyatör soğutma fanı. 0 dev/dk’da fan ve cer durur.',
      [0.4, 1.1, 1.3], false, hullBody);
    box(transmission, [1.55, 0.46, 0.58], [0.18, 0.76, 2.58], engineMat);
    cyl(transmission, 0.075, 2.35, [0, SPR.y, SPR.z], M.steel, 'x');
    const coolFan = G(transmission, [0.58, 1.48, 1.85], 'cooling-fan');
    ring(coolFan, 0.36, [0, 0, 0], M.steel, 0.025, [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 8; i++) box(coolFan, [0.64, 0.02, 0.07], [0, 0, 0], M.steel, [0, i * Math.PI / 4, 0]);

    // --------------------------------------------------------- 6..11 HİDROPNÖMATİK SÜSPANSİYON VE YÜRÜYÜŞ
    const sprockets = P('sprockets', 'Ön Cer Dişlileri ve Son Tahrik', 'Yürüyüş ve Süspansiyon',
      'Ön şanzımandan güç alarak paletleri süren çift dişli çemberli ön cer tekerlekleri.',
      [0, 0.2, 1.4], false, hullBody);
    const sprocketG = [];
    for (const s of [-1, 1]) {
      const sg = G(sprockets, [s * WX, SPR.y, SPR.z], 'sprocket-' + s);
      for (const dx of [-0.12, 0.12]) cyl(sg, SPR.r, 0.04, [dx, 0, 0], M.paint, 'x');
      cyl(sg, 0.13, 0.28, [0, 0, 0], M.dark, 'x');
      instances(sg, new T.BoxGeometry(0.28, 0.045, 0.045), M.steel, Array.from({ length: 11 }, (_, i) => {
        const a = i * 2 * Math.PI / 11;
        return { pos: [0, Math.sin(a) * (SPR.r - 0.02), Math.cos(a) * (SPR.r - 0.02)], rot: [-a, 0, 0] };
      }));
      sprocketG.push(sg);
    }

    const hsu = P('hsu', '12 × Hidropnömatik Süspansiyon Ünitesi (HSU) ve Salıncak Kolları', 'Yürüyüş ve Süspansiyon',
      'Burulma çubuğu yerine azot-yağ tüplü 12 bağımsız hidropnömatik ünite. Atış şokunu sönümler ve atış kilidinde gövdeyi alçaltır.',
      [0, 0.1, 0], false);
    const hsuArms = [];
    for (const s of [-1, 1]) {
      WZ.forEach((wz, k) => {
        const cylPod = box(hsu, [0.16, 0.26, 0.34], [s * 1.12, 0.62, wz + 0.28], M.dark);
        const arm = cyl(hsu, 0.045, 1, [0, 0, 0], M.steel);
        hsuArms.push({ s, k, wz, cylPod, arm });
      });
    }

    const wheelsL = P('wheelsL', 'Sol 6 Çift Yol Tekerleği ve Dönüş Makaraları', 'Yürüyüş ve Süspansiyon',
      'Sol yanda zemine basan 6 çift kauçuk kaplı yol tekerleği ve üst paleti taşıyan 3 dönüş makarası.', [-1.3, 0, 0], false);
    const wheelsR = P('wheelsR', 'Sağ 6 Çift Yol Tekerleği ve Dönüş Makaraları', 'Yürüyüş ve Süspansiyon',
      'Sağ yan 6 çift yol tekerleği ve dönüş makaraları.', [1.3, 0, 0], false);
    const wheelGroups = [];
    for (const [s, pObj] of [[-1, wheelsL], [1, wheelsR]]) {
      WZ.forEach(wz => {
        const wg = G(pObj, [s * WX, WY, wz], 'roadwheel');
        for (const dx of [-0.09, 0.09]) K.wheel(wg, dx, 0, 0, R, 0.14);
        wheelGroups.push(wg);
      });
      for (const rz of [1.45, -0.25, -1.95]) cyl(pObj, 0.11, 0.24, [s * WX, 0.90, rz], M.dark, 'x');
    }

    const idlers = P('idlers', 'Arka Gergi Tekerlekleri ve Atış Sabitleme Pabuçları', 'Yürüyüş ve Süspansiyon',
      'Arkadaki palet gergi tekerlekleri ve atış kilidi devreye girdiğinde zemine inen arka destek pabuçları.',
      [0, 0.1, -1.4], false, hullBody);
    const idlerG = [], spades = [];
    for (const s of [-1, 1]) {
      const ig = G(idlers, [s * WX, IDL.y, IDL.z], 'idler-' + s);
      for (const dx of [-0.10, 0.10]) cyl(ig, IDL.r, 0.05, [dx, 0, 0], M.paint, 'x');
      cyl(ig, 0.11, 0.26, [0, 0, 0], M.dark, 'x');
      idlerG.push(ig);
      const sp = G(idlers, [s * 0.95, 0.56, -3.48], 'spade-' + s);
      beam(sp, [0, 0, 0], [0, -0.34, -0.38], 0.09, M.steel);
      box(sp, [0.36, 0.05, 0.28], [0, -0.36, -0.42], M.dark);
      spades.push(sp);
    }

    const tracks = P('tracks', 'Kauçuk Pedli Çelik Paletler', 'Yürüyüş ve Süspansiyon',
      'Zeminle tam temas eden (y = 0) kapalı palet döngüsü.', [0, -0.3, 0], false);
    const trackGeo = new T.BoxGeometry(0.54, TR, 1);
    const trackSegs = { '-1': Array.from({ length: 16 }, () => mesh(tracks, trackGeo, M.dark)), '1': Array.from({ length: 16 }, () => mesh(tracks, trackGeo, M.dark)) };

    // --------------------------------------------------------- 12..14 KAYNAKLI TARET, KOMUTAN KUBBESİ VE MVR RADARI
    const turretYaw = G(hullBody, [0, 1.62, -0.92], 'turret-yaw');

    const turret = P('turret', 'Geniş Kaynaklı Taret Kabuğu ve Sepeti', 'Taret ve Atış Kontrol',
      'Dört kişilik taret mürettebatını, 48 mermi magazinini ve otomatik yükleme kolunu koruyan çok yüzeyli zırhlı taret. X-Ray iç yükleyiciyi açar.',
      [0, 1.3, -0.2], true, turretYaw);
    function turretGeo() {
      const bot = [[-1.32, 1.48], [1.32, 1.48], [1.54, 0.35], [1.52, -2.58], [-1.52, -2.58], [-1.54, 0.35]];
      const top = [[-1.06, 1.02], [1.06, 1.02], [1.34, 0.22], [1.34, -2.42], [-1.34, -2.42], [-1.34, 0.22]];
      const v = [], ix = [], N = bot.length;
      bot.forEach(([x, z]) => v.push(x, 0.02, z));
      top.forEach(([x, z]) => v.push(x, 1.16, z));
      for (let i = 0; i < N; i++) {
        const b = (i + 1) % N;
        ix.push(i, b, i + N, b, b + N, i + N);
      }
      const cT = v.length / 3; v.push(0, 1.16, -0.7);
      for (let i = 0; i < N; i++) ix.push(cT, ((i + 1) % N) + N, i + N);
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(v, 3));
      g.setIndex(ix);
      const flat = g.toNonIndexed();
      flat.computeVertexNormals();
      return flat;
    }
    const tMat = armorSteel.clone(); tMat.side = T.DoubleSide; tMat.userData.paint = true;
    mesh(turret, turretGeo(), tMat);
    ring(turret, 1.18, [0, 0.01, 0], M.steel, 0.035, [Math.PI / 2, 0, 0]);
    // Sis havanları (iki yanda 4'er adet)
    for (const s of [-1, 1]) {
      for (let i = 0; i < 4; i++) cyl(turret, 0.042, 0.24, [s * 1.38, 0.72 + i * 0.06, 0.85 - i * 0.12], M.dark, 'z');
    }

    const cupola = P('cupola', 'Komutan Kubbesi, 12,7 mm M2 Silahı ve Panoramik Nişangâh', 'Taret ve Atış Kontrol',
      'Sağ üstte 12,7 mm uçaksavar makineli tüfeği taşıyan komutan kubbesi, sol üstte sayısal atış kontrol panoramik nişangâh başlığı.',
      [0, 1.8, -0.2], false, turretYaw);
    cyl(cupola, 0.36, 0.18, [0.68, 1.25, -0.15], camoDark);
    box(cupola, [0.16, 0.22, 0.36], [0.68, 1.44, 0.05], M.dark);
    cyl(cupola, 0.022, 1.05, [0.68, 1.48, 0.68], M.dark, 'z'); // 12,7 mm M2 namlusu
    box(cupola, [0.30, 0.34, 0.28], [-0.68, 1.32, 0.18], M.steel); // panoramik nişangâh
    cyl(cupola, 0.08, 0.06, [-0.68, 1.36, 0.33], M.glass, 'z');

    // --------------------------------------------------------- 15..17 155 MM L/52 SİLAH SİSTEMİ VE MVR RADARI
    const gunElev = G(turretYaw, [0, 0.58, 1.12], 'gun-elev');

    const mvr = P('mvr', 'İlk Hız Radarı (MVR) ve Ataletsel Seyrüsefer Birimi', 'Taret ve Atış Kontrol',
      'Beşik üzerinde namluyla birlikte yükselen Doppler ilk hız radarı: her merminin gerçek çıkış hızını ölçerek atış kontrol bilgisayarına düzeltme verir.',
      [0, 1.5, 1.0], false, gunElev);
    box(mvr, [0.34, 0.24, 0.42], [0, 0.44, 0.58], camoDark);
    box(mvr, [0.28, 0.18, 0.03], [0, 0.44, 0.80], M.white); // radar düzlemsel anten yüzü
    box(mvr, [0.38, 0.26, 0.36], [-0.82, -0.18, -0.95], M.steel); // taret içi INS / AKKB bilgisayar kutusu

    const cradle = P('cradle', 'Top Beşiği ve Hidropnömatik Geri Tepme Silindirleri', '155 mm L/52 Silah',
      '-2° ile +68° dikey yükseliş sağlayan zırhlı kalkan beşiği ve namlu üstündeki ikiz geri tepme/ileri getirme silindirleri.',
      [0, 1.1, 1.1], false, gunElev);
    box(cradle, [0.88, 0.62, 0.64], [0, 0, 0.18], camoDark);
    for (const dx of [-0.22, 0.22]) cyl(cradle, 0.085, 1.45, [dx, 0.24, 0.52], M.steel, 'z');

    const recoilSlide = G(gunElev, [0, 0, 0], 'recoil-slide');
    const barrel = P('barrel', '155 mm L/52 Monoblok Namlu, Duman Tahliyesi ve Çift Bölmeli Ağız Baskısı', '155 mm L/52 Silah',
      '~8,06 m uzunluğunda 52 kalibre yivli namlu, ortada barut gazını öne atan duman tahliye silindiri ve uçta yüksek verimli çift bölmeli ağız baskısı (muzzle brake).',
      [0, 1.2, 2.2], false, recoilSlide);
    cyl(barrel, 0.145, 2.40, [0, 0, 1.35], M.paint, 'z', 0.165); // arka kalın namlu
    cyl(barrel, 0.215, 0.88, [0, 0, 2.95], camoDark, 'z'); // duman tahliye silindiri (bore evacuator)
    cyl(barrel, 0.115, 3.85, [0, 0, 5.30], M.paint, 'z', 0.135); // uzun L/52 ön namlu
    // Çift bölmeli (double-baffle) karakteristik 155 mm ağız baskısı
    box(barrel, [0.46, 0.34, 0.68], [0, 0, 7.52], M.dark);
    for (const bz of [7.36, 7.64]) box(barrel, [0.52, 0.22, 0.14], [0, 0, bz], M.steel);
    cyl(barrel, 0.08, 0.16, [0, 0, 7.88], M.dark, 'z');
    const muzzleFlash = new T.Mesh(new T.ConeGeometry(0.42, 1.65, 16), flashMat);
    muzzleFlash.rotation.x = Math.PI / 2;
    muzzleFlash.position.set(0, 0, 8.65);
    muzzleFlash.visible = false;
    barrel.add(muzzleFlash);

    const breech = P('breech', 'Dikey Kayan Kama Bloğu ve Otomatik Kapsül Besleyici', '155 mm L/52 Silah',
      'Yüksek atış hızı (15 saniyede 3 darbe atışı) için aşağı/yukarı kayarak açılan kama bloğu. Namlu ile birlikte geri teper.',
      [0, 1.0, 0.3], false, recoilSlide);
    box(breech, [0.52, 0.50, 0.54], [0, 0, -0.18], M.steel);
    const breechWedge = G(breech, [0, 0, -0.20], 'sliding-wedge');
    box(breechWedge, [0.34, 0.44, 0.26], [0, 0, 0], M.brass);

    // --------------------------------------------------------- 18..19 48 ATIMLIK MAGAZİN VE ROBOTİK YÜKLEME KOLU
    const ammoRack = P('ammoRack', 'Taret Arkası 48 Atımlık Otomatik Mermi Magazini', 'Otomatik Yükleyici',
      'Taret sepetinin arkasında yatay hücrelerde depolanan 48 adet 155 mm top mermisi (MOD 274 uzatılmış menzilli mühimmatlarla ~40 km menzil).',
      [0, 1.2, -1.4], false, turretYaw);
    box(ammoRack, [2.18, 0.05, 0.96], [0, 0.14, -1.92], M.dark);
    box(ammoRack, [2.18, 0.05, 0.96], [0, 0.94, -1.92], M.dark);
    box(ammoRack, [2.18, 0.84, 0.06], [0, 0.54, -2.38], M.dark);
    for (const sx of [-1.06, 1.06]) box(ammoRack, [0.06, 0.84, 0.96], [sx, 0.54, -1.92], M.dark);
    const shellTransforms = [], tipTransforms = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 12; col++) {
        const sx = -0.92 + col * 0.168, sy = 0.24 + row * 0.19;
        shellTransforms.push({ pos: [sx, sy, -1.86], rot: [Math.PI / 2, 0, 0] });
        tipTransforms.push({ pos: [sx, sy, -1.46], rot: [Math.PI / 2, 0, 0] });
      }
    }
    instances(ammoRack, new T.CylinderGeometry(0.068, 0.068, 0.58, 10), shellOlive, shellTransforms);
    instances(ammoRack, new T.ConeGeometry(0.068, 0.24, 10), M.brass, tipTransforms);

    const loaderArm = P('loaderArm', 'Robotik Mermi Aktarma ve Yüksek Açılı İtici Kol', 'Otomatik Yükleyici',
      'Magazinden aldığı ~43,5 kg’lık 155 mm mermiyi namlu hangi yükseliş açısında olursa olsun kama eksenine hizalayıp namluya süren elektromekanik kol.',
      [0, 1.3, -0.6], false, turretYaw);
    // Taret tavan/yan rayı ve döner robotik yükleme kolu
    cyl(loaderArm, 0.06, 1.35, [0.44, 0.58, -0.62], M.steel, 'z');
    const armSwing = G(loaderArm, [0.44, 0.58, -0.55], 'loader-swing');
    box(armSwing, [0.46, 0.14, 0.16], [-0.22, 0, 0], M.steel);
    const trayPitch = G(armSwing, [-0.44, 0, 0.15], 'loader-tray');
    box(trayPitch, [0.24, 0.10, 0.96], [0, -0.08, 0.22], M.brass);
    const rammedShell = G(trayPitch, [0, 0.02, 0.15], 'loader-shell');
    cyl(rammedShell, 0.074, 0.62, [0, 0, 0], shellOlive, 'z');
    mesh(rammedShell, new T.ConeGeometry(0.074, 0.26, 12), M.brass, [0, 0, 0.44], [Math.PI / 2, 0, 0]);

    // --------------------------------------------------------- KİNEMATİK VE SENKRONİZASYON
    function trackLoop(kneelDrop) {
      const c = TR / 2;
      const sy = SPR.y + kneelDrop, iy = IDL.y + kneelDrop;
      const pts = [[SPR.z, sy + SPR.r + c], [SPR.z + SPR.r + c, sy], [SPR.z, sy - SPR.r - c]];
      for (let k = 0; k < WZ.length; k++) pts.push([WZ[k], WY - R - c]); // alt palet y = 0.03 -> taban 0.000!
      pts.push([IDL.z, iy - IDL.r - c], [IDL.z - IDL.r - c, iy], [IDL.z, iy + IDL.r + c]);
      for (let k = WZ.length - 1; k >= 0; k--) pts.push([WZ[k], 0.90 + 0.11 + c]);
      return pts;
    }

    function sync() {
      const kneelDrop = S.kneel ? -0.12 : 0;
      hullBody.position.y = kneelDrop;

      // Yol kilidi yalnız namlu 0°/0° yol konumuna yakınsa dikilir, aksi halde öne yatar
      travelLock.rotation.x = (Math.abs(S.turret) < 2 && S.elev < 3) ? 0 : 1.15;

      // Arka atış sabitleme pabuçları (kneel açıkken yere dokunur, y >= 0 korunur)
      spades.forEach(sp => { sp.rotation.x = S.kneel ? -0.10 : 0.65; });

      // 12 HSU salıncak kolları: gövde üzerindeki pimi y=WY tekerlek göbeğine bağlar
      hsuArms.forEach(({ s, wz, cylPod, arm }) => {
        cylPod.position.y = 0.62 + kneelDrop;
        stretch(arm, [s * 1.16, 0.56 + kneelDrop, wz + 0.30], [s * 1.28, WY, wz]);
      });

      wheelGroups.forEach(wg => { wg.rotation.x = S.wheelAngle; });
      sprocketG.forEach(sg => { sg.rotation.x = S.wheelAngle * R / SPR.r; });
      idlerG.forEach(ig => { ig.rotation.x = S.wheelAngle * R / IDL.r; });
      coolFan.rotation.y = S.fanAngle;

      const loop = trackLoop(kneelDrop);
      for (const s of [-1, 1]) {
        trackSegs[String(s)].forEach((seg, i) => {
          const a = loop[i], b = loop[(i + 1) % loop.length];
          const dz = b[0] - a[0], dy = b[1] - a[1];
          seg.position.set(s * WX, (a[1] + b[1]) / 2, (a[0] + b[0]) / 2);
          seg.scale.set(1, 1, Math.max(Math.hypot(dz, dy), 1e-4));
          seg.rotation.set(Math.atan2(-dy, dz), 0, 0);
        });
      }

      turretYaw.rotation.y = S.turret * Math.PI / 180;
      const elevRad = -S.elev * Math.PI / 180;
      gunElev.rotation.x = elevRad;

      // Geri tepme (-0,55 m)
      const fp = S.firePhase;
      const kick = !S.firing ? 0 : fp < 0.14 ? fp / 0.14 : Math.max(0, 1 - (fp - 0.14) / 0.66);
      recoilSlide.position.z = kick > 0 ? -0.55 * kick : 0;
      muzzleFlash.visible = S.firing && fp < 0.11;

      // Robotik otomatik yükleyici 4 aşamalı çevrimi (magazin -> hizalama -> namlu ekseninde sürüş -> çekilme)
      const lp = S.autoLoad ? S.loadPhase : 0;
      if (!S.autoLoad) {
        armSwing.position.z = -0.75;
        armSwing.rotation.y = 0.42;
        trayPitch.rotation.x = 0;
        rammedShell.visible = S.ammo > 0;
        rammedShell.position.z = 0.15;
        breechWedge.position.y = 0;
      } else {
        const alignFrac = lp < 0.25 ? 0 : lp < 0.50 ? (lp - 0.25) / 0.25 : lp < 0.82 ? 1 : 1 - (lp - 0.82) / 0.18;
        const ramFrac = lp >= 0.52 && lp < 0.78 ? Math.sin(((lp - 0.52) / 0.26) * Math.PI) : 0;
        armSwing.position.z = -0.85 + alignFrac * 0.92;
        armSwing.rotation.y = 0.42 * (1 - alignFrac);
        trayPitch.rotation.x = elevRad * alignFrac; // namlu yükseliş açısına otomatik hizalanır!
        rammedShell.visible = S.ammo > 0 && lp < 0.72;
        rammedShell.position.z = 0.15 + ramFrac * 0.95;
        breechWedge.position.y = -0.24 * alignFrac; // dikey kayan kama aşağı açılır
      }
    }

    function speedKmh() {
      return S.kneel ? 0 : (S.rpm / 2300) * 65;
    }

    function update(dt) {
      if (!Number.isFinite(dt)) return;
      dt = T.MathUtils.clamp(dt, 0, 0.05);
      const v = speedKmh() / 3.6;
      if (v > 0) S.wheelAngle = (S.wheelAngle + dt * (v / R) * 0.35) % (Math.PI * 2);
      if (S.rpm > 0) S.fanAngle = (S.fanAngle + dt * (S.rpm / 2300) * 14) % (Math.PI * 2);
      if (S.firing) {
        S.firePhase += dt * 1.35;
        if (S.firePhase >= 1) { S.firing = false; S.firePhase = 0; }
      }
      if (S.autoLoad && !S.firing) {
        S.loadPhase = (S.loadPhase + dt * 0.45) % 1;
      }
      sync();
    }

    const camPresets = {
      iso: { pos: [11.8, 6.6, 12.8], look: [0, 2.5, 1.8] },
      front: { pos: [3.6, 3.2, 11.4], look: [0, 2.0, 2.2] },
      breech: { pos: [3.8, 3.8, -4.8], look: [0, 2.2, -1.2] },
      engine: { pos: [4.4, 3.6, 5.2], look: [0.4, 1.2, 1.8] },
      suspension: { pos: [5.8, 1.4, 0.6], look: [1.0, 0.6, 0] },
      top: { pos: [0.1, 15.5, 0.5], look: [0, 1.6, 0.5] }
    };

    const tourSteps = [
      ['T-155 Fırtına: 155 mm L/52 Modern Kundağı Motorlu Obüs', '2001’de envantere giren T-155 Fırtına; 8 metrelik 52 kalibre namlusu, sayısal atış kontrolü ve hızlı mevzi değiştirme yeteneğiyle modern topçuluğun temsilcisidir.', 'iso', turret, false],
      ['Robotik Otomatik Mermi Yükleme Kolu', 'X-Ray’i ve “Otomatik Yükleyici” düğmesini açın: arkadaki 48 atımlık magazinden alınan mermi, namlu +68° dik açıda bile olsa namlu eksenine otomatik hizalanıp sürülür.', 'breech', loaderArm, true],
      ['155 mm L/52 Namlu, Ağız Baskısı ve İlk Hız Radarı (MVR)', 'Beşik üzerindeki Doppler ilk hız radarı (MVR), her merminin namludan çıkış hızını ölçerek atış kontrol bilgisayarına gerçek zamanlı düzeltme sağlar.', 'front', mvr, false],
      ['Ön-Sağ 1.000 BG MTU V8 Dizel ve Allison Şanzıman', 'Tankların aksine motor önde sağdadır; bu yerleşim arkada geniş taret sepeti ve mühimmat ikmal kapısına yer açar. 0 dev/dk’da fan ve cer dişlileri durur.', 'engine', engine, true],
      ['12 × Hidropnömatik Süspansiyon Ünitesi (HSU)', 'Burulma çubuğu yerine kullanılan 12 hidropnömatik kol zemin temasını korurken iç gövde tabanını tamamen serbest bırakır.', 'suspension', hsu, false],
      ['Atış Kilidi ve Hızlı Mevzilenme', '“Atış Kilidi (Çökme)” düğmesiyle hidropnömatik süspansiyonu kilitleyip gövdeyi alçaltın; sürüş kesilir ve obüs geri tepmeyi zemine aktaracak kararlı konuma geçer.', 'suspension', idlers, false]
    ].map(a => ({ title: a[0], desc: a[1], cam: a[2], part: a[3], cutaway: a[4], explode: 0, sub: 'all' }));

    const ui = K.ui({
      title: 'T-155 Fırtına — 155 mm L/52 Obüs ve Otomatik Yükleyici',
      sub: '2001 TSK envanteri • 155 mm L/52 • Robotik Yükleme Kolu & 12× Hidropnömatik Süspansiyon',
      portraitCameraScale: 1.5,
      shadowExtent: 13,
      subsystems: Object.entries(counts).map(([key, count]) => ({ key, label: key, count, color: '#4c583e' })),
      camLabels: {
        iso: 'Genel', front: '155 mm L/52 & MVR', breech: 'Otomatik Yükleyici',
        engine: 'Ön-Sağ Motor', suspension: 'Hidropnömatik HSU', top: 'Üst'
      },
      sliders: [
        { label: 'Namlu Yükseliş Açısı', min: -2, max: 68, step: 1, fmt: v => Math.round(v) + '°' },
        { label: 'Taret Yanca Dönüşü', min: -180, max: 180, step: 1, fmt: v => Math.round(v) + '°' },
        { label: 'Motor Devri (MTU 881)', min: 0, max: 2300, step: 50, fmt: v => Math.round(v) + ' dev/dk' }
      ],
      buttons: { terrain: 'Atış Kilidi (Çökme)', sweep: 'Otomatik Yükleyici' },
      telemetryTag: 'T-155 FIRTINA • 155 MM L/52 • MVR',
      statLabels: ['HIZ (TEMSİLİ)', 'YÜKSELİŞ / TARET', 'MOTOR DEVRİ', 'MAGAZİN']
    });

    sync();
    return {
      root, parts, ui, camPresets, tourSteps,
      defaultPart: loaderArm, firePart: barrel, update,
      hullBody, gunElev, recoilSlide, trayPitch, coolFan, sprocketG,
      onFire: () => {
        if (S.autoLoad) return { ok: false, msg: 'Yükleme kolu kama arkasındayken atış emniyet kilidinde — önce yükleyiciyi kapatın.' };
        if (S.ammo <= 0) {
          S.ammo = 48; S.firing = false; S.firePhase = 0;
          sync();
          return { ok: true, refill: true, msg: 'Poyraz mühimmat ikmali: 48 × 155 mm mermi yüklendi.' };
        }
        if (S.firing) return { ok: false };
        S.ammo--; S.firing = true; S.firePhase = 0.001;
        sync();
        if (ctx.audio && ctx.audio.playCannonFire) ctx.audio.playCannonFire();
        return { ok: true, msg: '155 mm L/52 atış — kalan ' + S.ammo + '/48' };
      },
      fireButtonLabel: () => S.autoLoad ? 'YÜKLEYİCİ AKTİF — KİLİTLİ' : S.ammo <= 0 ? 'POYRAZ İKMALİ (48 MERMİ)' : '155 MM ATIŞ (' + S.ammo + '/48)',
      mobileFireButtonLabel: () => S.autoLoad ? 'Yüklemede' : S.ammo <= 0 ? 'İkmal' : 'Ateş',
      onSlider: (i, v) => {
        if (!Number.isFinite(v)) return {};
        if (i === 0) S.elev = T.MathUtils.clamp(v, -2, 68);
        if (i === 1) S.turret = T.MathUtils.clamp(v, -180, 180);
        if (i === 2) S.rpm = T.MathUtils.clamp(v, 0, 2300);
        sync(); return {};
      },
      onButton: name => {
        if (name === 'terrain') S.kneel = !S.kneel;
        if (name === 'sweep') { S.autoLoad = !S.autoLoad; S.loadPhase = 0; }
        sync(); return {};
      },
      buttonActive: name => name === 'terrain' ? S.kneel : name === 'sweep' ? S.autoLoad : false,
      getSliderValues: () => [S.elev, S.turret, S.rpm],
      getStats: () => [
        speedKmh().toFixed(1) + ' <span>km/sa</span>',
        Math.round(S.elev) + '° / ' + Math.round(S.turret) + '° <span>L/52</span>',
        Math.round(S.rpm) + ' <span>dev/dk</span>',
        S.ammo + ' <span>/ 48 HE</span>'
      ],
      getStatus: () => S.firing
        ? { text: '155 MM L/52 ATIŞ • HİDROPNÖMATİK GERİ TEPME VE MVR ÖLÇÜMÜ', color: '#c05621' }
        : S.autoLoad
          ? { text: 'ROBOTİK MERMİ YÜKLEME KOLU ÇALIŞIYOR • NAMLU AÇISINA HİZALI', color: '#8a6d3b' }
          : S.kneel
            ? { text: 'HİDROPNÖMATİK ATIŞ KİLİDİ AKTİF • GÖVDE MEVZİDE SABİTLENDİ', color: '#3a4332' }
            : { text: S.rpm > 0 ? 'MTU 881 ÇALIŞIYOR • İNTİKAL HAZIR' : 'MOTOR DURDU', color: '#4c583e' },
      applyTextures: K.applyTextures, setTexture: K.setTexture, toggleRelief: K.toggleRelief
    };
  };
})();
