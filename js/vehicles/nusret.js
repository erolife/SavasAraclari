/* Nusret, 1915. Approximate historic vessel, not the modern museum ship's machinery. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.nusret = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'nusret');
    const {T, root, parts, mats:M, mesh, box, cyl, ring, pipe, beam, instances} = K;
    const S = {rpm:0, phase:0, rudder:0, travel:0, auto:false, direction:1, roof:false};
    const counts = {}; let number = 0;
    M.paint.color.setHex(0x687579); M.wood.color.setHex(0x977c58);
    const red = M.red.clone(); red.color.setHex(0x663f36);
    function group(parent, pos, name) { const g=new T.Group();g.position.set(...pos);g.name=name;parent.add(g);return g; }
    function part(key, name, sub, desc, explode=[0,1,0], outer=false) {
      counts[sub]=(counts[sub]||0)+1;
      const p=K.part(key,++number+'. '+name,sub,[0,0,0],explode,desc,outer);
      p.userData.material='Çelik, ahşap, pirinç ve lif halat';
      p.userData.spec='1915 Nusret • iç yerleşim yaklaşık';return p;
    }
    function surface(parent, rows, material) {
      const vertices=[],indices=[],cols=rows[0].length;
      rows.forEach(row=>row.forEach(v=>vertices.push(...v)));
      for(let j=0;j<rows.length-1;j++)for(let i=0;i<cols-1;i++){const a=j*cols+i;indices.push(a,a+cols,a+1,a+1,a+cols,a+cols+1);}
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();
      const mat=material.clone();mat.side=T.DoubleSide;return mesh(parent,g,mat);
    }
    // Full hull, approximately 40 x 7.4 m; offsets are exhibition reconstruction.
    const stations=[[-20,.10],[-19,1.55],[-17,2.7],[-13,3.45],[-8,3.7],[0,3.7],[7,3.5],[12,3],[16,2.05],[19,.7],[20,0]];
    const bottom=part('bottom','Kırmızı Karina ve Omurga','Gövde','Yaklaşık 40 × 7,4 m ana oranlar. Karina kesitleri özgün tersane ofseti değil, görsel rekonstrüksiyondur.',[0,-.6,0],true);
    surface(bottom,stations.map(([z,w])=>[[-w*.91,2.3,z],[-w*.76,1.25,z],[-w*.4,.85,z],[0,.75,z],[w*.4,.85,z],[w*.76,1.25,z],[w*.91,2.3,z]]),red);
    const hull=part('hull','Çelik Borda ve Kuşak','Gövde','Alçak kıç çalışma güvertesi ve sivri baş. Renkler müze sunumudur; savaş zamanı boya tonu kesinleştirilmemiştir.',[0,.3,0],true);
    for(const side of [-1,1]){surface(hull,stations.map(([z,w])=>[[side*w*.91,2.3,z],[side*w,4.2,z]]),M.paint);pipe(hull,stations.map(([z,w])=>[side*w*.915,2.35,z]),.055,M.dark);}
    const frames=part('frames','Postalar, Omurga ve Bölmeler','Gövde','İç çelik postalar, enine kemereler ve omurga. Bölme yerleri yaklaşık gösterilmiştir.',[0,.5,0]);
    for(let z=-16;z<=16;z+=2){const w=z>10?2.5:z< -12?2.9:3.5;pipe(frames,[[-w,4.05,z],[-w*.78,1.35,z],[0,.95,z],[w*.78,1.35,z],[w,4.05,z]],.065,M.dark);beam(frames,[-w,3.95,z],[w,3.95,z],.085,M.steel);}
    box(frames,[.22,.3,36],[0,1.05,0],M.dark);
    const deck=part('deck','Ana Güverte ve Servis Kapakları','Gövde','Kıçtaki raylı çalışma alanı ve orta güverte. X-Ray modunda güverte altı açığa çıkar.',[0,1.2,0],true);
    surface(deck,stations.map(([z,w])=>[[-w,4.2,z],[0,4.2,z],[w,4.2,z]]),M.wood);
    const planks=[];for(let z=-17;z<12;z+=.65)planks.push({pos:[0,4.215,z]});instances(deck,new T.BoxGeometry(5.4,.014,.018),M.dark,planks);
    for(const z of [-8,-2,7]){box(deck,[1.5,.16,1.3],[0,4.3,z],M.paint);box(deck,[1.25,.04,1.05],[0,4.4,z],M.dark);}
    const forecastle=part('forecastle','Yükseltilmiş Baş Güverte','Gövde','Baş bodoslama ve yükseltilmiş baş güverte. Merdivenler ana güverteye bağlanır.',[0,.8,1],true);
    const front=stations.filter(([z])=>z>=12);
    surface(forecastle,front.map(([z,w])=>[[-w,5.4,z],[w,5.4,z]]),M.wood);
    for(const side of [-1,1])surface(forecastle,front.map(([z,w])=>[[side*w,4.2,z],[side*w,5.4,z]]),M.paint);
    box(forecastle,[6,.04,.12],[0,5.42,12],M.dark);
    for(const x of [-2.5,2.5]){beam(forecastle,[x,4.25,10.8],[x,5.4,12],.08,M.steel);for(let i=0;i<6;i++)box(forecastle,[.62,.06,.22],[x,4.3+i*.2,10.9+i*.2],M.steel);}
    const bridge=part('bridge','Köprüüstü ve Camlı Seyir Evi','Kumanda','Öndeki yükseltilmiş seyir evi, gerçek pencere açıklıkları ve kapı. Dış biçim müze fotoğraflarından yorumlanmıştır.',[0,1.3,0],true);
    box(bridge,[4.4,.14,3.6],[0,5.45,7.6],M.paint);
    for(const x of [-2.05,2.05])for(const z of [6,9.2])box(bridge,[.18,2.2,.18],[x,5.25,z],M.paint);
    box(bridge,[4.1,.65,.12],[0,5.85,9.15],M.paint);
    for(const x of [-1.6,-.8,0,.8,1.6]){box(bridge,[.08,.85,.12],[x,6.6,9.15],M.paint);box(bridge,[.68,.73,.04],[x+.36,6.6,9.15],M.glass);}
    for(const side of [-1,1]){box(bridge,[.12,.65,3.3],[side*2.05,5.85,7.6],M.paint);for(const z of [6.1,7.1,8.1,9.1])box(bridge,[.12,.85,.08],[side*2.05,6.6,z],M.paint);for(const z of [6.6,7.6,8.6])box(bridge,[.04,.72,.82],[side*2.05,6.6,z],M.glass);}
    const roofPart=part('roof','Kaldırılabilir Köprüüstü Tavanı','Kumanda','Tavanı sergi amacıyla kaldırarak dümen ve harita masasını inceleyin.',[0,2,0],true);
    const roof=group(roofPart,[0,0,0],'bridge-roof');box(roof,[4.65,.17,3.8],[0,7.1,7.6],M.paint);for(const x of [-2.2,2.2])box(roof,[.08,.12,3.8],[x,7.2,7.6],M.dark);
    const helm=part('helm','Dümen, Pusula ve Harita Masası','Kumanda','Seyir araçları yaklaşık yerleşimdedir. Harita çizgileri dekoratif olup harekât rotası değildir.',[0,.8,0]);
    cyl(helm,.12,1,[0,5.96,8.4],M.brass);ring(helm,.44,[0,6.55,8.35],M.wood,.055);for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(helm,[0,6.55,8.35],[Math.sin(a)*.5,6.55+Math.cos(a)*.5,8.35],.035,M.brass);}
    box(helm,[1.5,.1,.9],[-1,6.1,7],M.wood);for(const x of [-1.55,-.45])for(const z of [6.7,7.3])beam(helm,[x,5.5,z],[x,6.1,z],.06,M.wood);
    box(helm,[1.2,.012,.65],[-1,6.16,7],M.white);cyl(helm,.20,.1,[1.2,6.25,8.4],M.brass);cyl(helm,.16,.01,[1.2,6.31,8.4],M.white);
    const funnel=part('funnel','Baca ve Güverte Üstü Kasası','Üst Donanım','Tek baca ve geniş alt kasa. Baca içi açıktır; görünen kazan bağlantısı temsili olarak kapalı tutulmuştur.',[0,1.5,0]);
    box(funnel,[2.5,.75,3.2],[0,4.6,.6],M.paint);mesh(funnel,new T.CylinderGeometry(.74,.83,3.8,40,1,true),M.paint,[0,6.7,.6],[.06,0,0]);
    mesh(funnel,new T.CylinderGeometry(.78,.78,.55,40,1,true),M.dark,[0,8.33,.70]);ring(funnel,.78,[0,8.6,.70],M.dark,.055,[Math.PI/2,0,0]);
    for(const x of [-.87,.87])beam(funnel,[x,5,.6],[x,8.5,.6],.03,M.steel);
    const vents=part('vents','Mantarlar ve Deveboynu Havalandırmalar','Üst Donanım','Açık ağızlı güverte havalandırmaları ve küçük servis mantarları.',[0,.9,0]);
    for(const [x,z] of [[-1.5,2.8],[1.5,2.8],[-1.5,-2.5],[1.5,-2.5]]){cyl(vents,.22,1.5,[x,5,z],M.paint);pipe(vents,[[x,5.65,z],[x,5.95,z],[x,6.05,z+.32]],.22,M.paint);mesh(vents,new T.CylinderGeometry(.35,.22,.32,24,1,true),M.paint,[x,6.05,z+.43],[Math.PI/2,0,0]);cyl(vents,.28,.02,[x,6.05,z+.59],M.dark,'z');}
    for(const z of [-5,4,13]){cyl(vents,.16,.40,[0,4.5,z],M.paint);cyl(vents,.3,.08,[0,4.73,z],M.paint);}
    const masts=part('masts','Baş ve Kıç Direkleri','Üst Donanım','İki direk, serenler ve küçük bağlantı bilezikleri; modern radar donanımı eklenmemiştir.',[0,2,0]);
    for(const [z,h] of [[10,9],[-10,7]]){cyl(masts,.10,h,[0,4.2+h/2,z],M.wood);beam(masts,[-2.3,4.2+h*.72,z],[2.3,4.2+h*.72,z],.09,M.wood);for(const y of [4.5,7,4.2+h*.72])cyl(masts,.14,.10,[0,y,z],M.dark);}
    const rigging=part('rigging','İstralyalar ve İnce Arma','Üst Donanım','Direk destekleri ve seren uçlarından gelen halatlar; donanım sergi yorumudur.',[0,.5,0]);
    for(const [z,h] of [[10,9],[-10,7]])for(const side of [-1,1]){beam(rigging,[0,4.2+h,z],[side*2.5,4.3,z-3],.025,M.dark);beam(rigging,[side*2.3,4.2+h*.72,z],[side*2.3,4.4,z],.02,M.wood);}
    const rails=part('rails','Kıç Çalışma Rayları','Güverte İşi','İki raylı sergi hattı. Araba sadece güverte üzerinde ileri–geri gider; denize bırakma işlemi canlandırılmaz.',[0,.5,-.4]);
    for(const lane of [-2.1,2.1])for(const dx of [-.36,.36])box(rails,[.07,.10,16],[lane+dx,4.29,-10],M.steel);
    const sleepers=[];for(let z=-17.5;z<-2;z+=.7)for(const x of [-2.1,2.1])sleepers.push({pos:[x,4.235,z]});instances(rails,new T.BoxGeometry(.98,.055,.12),M.dark,sleepers);
    const exhibits=part('exhibits','Temsili Güverte Yükleri','Güverte İşi','Sekiz dış mayın maketi sergi düzenidir; 1915 görevindeki 26 sayısını veya yükleme planını birebir yeniden üretmez. İç düzenek gösterilmez.',[0,.8,-.4]);
    function cart(parent,x,z,name){const g=group(parent,[x,4.58,z],name);box(g,[1,.18,1],[0,0,0],M.dark);for(const dx of [-.36,.36])for(const dz of [-.34,.34])cyl(g,.14,.08,[dx,-.10,dz],M.steel,'x');mesh(g,new T.SphereGeometry(.55,20,14),M.dark,[0,.65,0]);cyl(g,.35,.25,[0,.20,0],M.steel);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;beam(g,[Math.sin(a)*.46,.93,Math.cos(a)*.46],[Math.sin(a)*.64,1.08,Math.cos(a)*.64],.065,M.dark);}return g;}
    for(const z of [-4,-7,-10,-13])cart(exhibits,-2.1,z,'display-load');for(const z of [-4,-7,-10])cart(exhibits,2.1,z,'display-load');
    const carriagePart=part('carriage','Hareketli Sergi Arabası','Güverte İşi','Ray açıklığına oturan dört tekerlek. Yüzde ayarı yalnızca güverte üzerindeki sergi konumudur.',[0,.8,-.6]);
    const carriage=cart(carriagePart,2.1,-13,'rail-carriage');
    const crane=part('crane','Küçük Kıç Bumba ve Vinç','Güverte İşi','Kıç direğe yakın servis bumbası, makara ve tambur. Fotoğraf oranlarından temsili donanım.',[0,1,-.5]);
    beam(crane,[0,5,-10],[0,7.5,-14],.13,M.wood);beam(crane,[0,10,-10],[0,7.5,-14],.025,M.dark);ring(crane,.17,[0,7.4,-14],M.steel,.035,[0,Math.PI/2,0]);beam(crane,[0,7.25,-14],[0,5.5,-14],.025,M.dark);cyl(crane,.3,.8,[0,4.6,-11],M.steel,'x');
    const boats=part('boats','İki Filika ve Mataforalar','Üst Donanım','Orta güverte yanlarındaki açık filikalar, oturaklar ve taşıyıcı mataforalar.',[0,1,0]);
    for(const side of [-1,1]){const x=side*2.8,pts=[[-2.5,0],[-2, .48],[-1,.65],[1,.65],[2,.48],[2.5,0]];surface(boats,pts.map(([z,w])=>[[x-w,5.25,z+3],[x-w*.65,4.65,z+3],[x+w*.65,4.65,z+3],[x+w,5.25,z+3]]),M.wood);for(const z of [1.5,2.5,3.5,4.5])box(boats,[1.0,.09,.23],[x,5,z],M.wood);for(const z of [1,5]){pipe(boats,[[side*2.1,4.25,z],[side*2.1,6,z],[x,6.2,z],[x,5.3,z]],.06,M.steel);}}
    const anchors=part('anchors','Demirler, Zincir ve Irgat','Baş Donanımı','Baş güvertede zincir ırgatı, demirler ve bağlama babaları.',[0,.5,1]);
    cyl(anchors,.35,.5,[0,5.7,16],M.dark);for(const side of [-1,1]){pipe(anchors,[[side*.3,5.55,16],[side*1.2,5.48,17],[side*1.5,4.3,17]],.07,M.dark);beam(anchors,[side*1.7,4.3,17],[side*1.7,3.1,17],.10,M.dark);pipe(anchors,[[side*1.7-.5,3.3,17],[side*1.7,3.05,17],[side*1.7+.5,3.3,17]],.10,M.dark);}
    const engines=part('engines','Buharlı Makineler ve Çapraz Başlıklar','Tahrik','İki buhar makinesi eğitim kesitidir. Silindir boyutları ve gerçek makine dairesi yerleşimi yaklaşık; performans hesabı yapılmaz.',[0,.8,0]);
    const pistons=[];
    for(const x of [-1,1]){box(engines,[1.1,.25,3.6],[x,1.7,-3],M.dark);for(let i=0;i<3;i++){const z=-1.9-i*1.1;cyl(engines,.23+i*.055,.75,[x,3,z],M.steel);for(const dx of [-.38,.38])beam(engines,[x+dx,1.85,z],[x+dx,2.7,z],.055,M.dark);const p=cyl(engines,.055,.75,[x,2.3,z],M.brass);p.name='piston-'+pistons.length;pistons.push(p);}}
    const boilers=part('boilers','Kazanlar ve Servis Hatları','Tahrik','Kazan gövdeleri ve borular, buhar tahrikini anlatan yaklaşık iç donanımdır.',[0,.7,0]);
    for(const x of [-1,1]){cyl(boilers,.65,3,[x,2.25,1.4],M.dark,'z');cyl(boilers,.48,.08,[x,2.25,3],M.steel,'z');pipe(boilers,[[x,2.9,1],[x,3.5,1],[x,3.5,-2]],.09,M.brass);}
    const shafts=part('shafts','İki Şaft ve Yatakları','Tahrik','Her makinenin kıça uzanan şaftı kendi pervanesine bağlıdır. Tüm dönüş yavaşlatılmış gösterimdir.',[0,0,-.6]);
    for(const x of [-1,1]){cyl(shafts,.085,14.8,[x,1.55,-11.4],M.steel,'z');for(const z of [-5,-9,-13,-17]){box(shafts,[.4,.4,.35],[x,1.35,z],M.dark);cyl(shafts,.16,.35,[x,1.55,z],M.brass,'z');}}
    const propPart=part('propellers','Çift Pervane','Tahrik','Kıçtaki iki pervane, bağlı şaftların uçlarında. Palalar fotoğraf ve genel dönem biçiminden yorumdur.',[0,0,-1]);
    const props=[];for(const x of [-1,1]){const g=group(propPart,[x,1.55,-19],'propeller-'+x);props.push(g);cyl(g,.18,.4,[0,0,0],M.brass,'z');for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const b=mesh(g,new T.SphereGeometry(1,16,10),M.brass,[Math.sin(a)*.42,Math.cos(a)*.42,0],[0,.25,-a]);b.scale.set(.24,.54,.055);}}
    const rudderPart=part('rudder','Dümen Palası ve Mil','Tahrik','Merkezdeki dümen, pervanelerin arkasında sergi açısıyla döner.',[0,0,-1]);
    const rudder=group(rudderPart,[0,1.65,-19.6],'rudder');cyl(rudder,.07,2.3,[0,.55,0],M.steel);box(rudder,[.10,1.4,.8],[0,0,-.22],M.paint);
    const railsPart=part('railings','Korkuluklar, Lombarlar ve Can Simitleri','Dış Donanım','İnce güverte korkulukları, borda lombarları ve emniyet donanımı.',[0,.4,0]);
    for(const side of [-1,1]){const railPts=[];for(let z=-16;z<=10;z+=2){const w=z< -12?3.15:3.55;cyl(railsPart,.025,.8,[side*w,4.65,z],M.steel);railPts.push([side*w,5.05,z]);}pipe(railsPart,railPts,.022,M.steel);for(let z=-11;z<=9;z+=4){ring(railsPart,.14,[side*3.62,3.55,z],M.brass,.027,[0,Math.PI/2,0]);cyl(railsPart,.115,.02,[side*3.63,3.55,z],M.dark,'x');}for(const z of [5,8])ring(railsPart,.32,[side*2.2,5.9,z],M.white,.085,[0,Math.PI/2,0]);}
    const fittings=part('fittings','Güverte Topu ve Bağlama Donanımı','Dış Donanım','Başta dönem topunun yalnızca dış silueti ve bağlama babaları. Ateşleme veya iç silah mekanizması yoktur.',[0,.5,0]);
    cyl(fittings,.42,.7,[0,5.85,14],M.paint);box(fittings,[.65,.5,.9],[0,6.4,14],M.dark);cyl(fittings,.11,2.2,[0,6.65,14.9],M.dark,'z');
    for(const side of [-1,1])for(const z of [-16,11,17]){const x=side*(z>15?1.25:2.8),y=z>=12?5.4:4.2;for(const dz of [-.2,.2])cyl(fittings,.09,.3,[x,y+.15,z+dz],M.dark);box(fittings,[.23,.07,.75],[x,y+.33,z],M.dark);}
    cyl(fittings,.035,2.6,[0,5.5,-18.7],M.steel);
    box(fittings,[1.3,.8,.015],[.65,6.25,-18.7],M.red);
    const crescent=new T.Shape();crescent.absarc(.53,6.25,.24,.65,Math.PI*2-.65,false);crescent.absarc(.63,6.25,.20,Math.PI*2-.40,.40,true);crescent.closePath();
    mesh(fittings,new T.ShapeGeometry(crescent),M.white,[0,0,-18.68]);
    const star=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.065:.15,x=.91+Math.cos(a)*r,y=6.25+Math.sin(a)*r;if(i)star.lineTo(x,y);else star.moveTo(x,y);}star.closePath();mesh(fittings,new T.ShapeGeometry(star),M.white,[0,0,-18.68]);
    const stands=part('stands','Müze Sergi Beşikleri','Sergi','Karina ve pervaneleri görünür kılan çağdaş sergi mesnetleri.',[0,0,0]);
    for(const z of [-11,9]){box(stands,[8,.18,1],[0,.09,z],M.dark);for(const x of [-1.3,1.3])beam(stands,[x,.18,z],[x,.95,z],.2,M.dark);}
    function sync(){props.forEach(p=>p.rotation.z=S.phase);pistons.forEach((p,i)=>p.position.y=2.3+.18*Math.sin(S.phase+(i%3)*Math.PI*2/3));rudder.rotation.y=S.rudder*Math.PI/180;carriage.position.z=-13-S.travel*.04;roof.position.y=S.roof?2.5:0;}
    function update(dt){if(Number.isFinite(dt)){dt=T.MathUtils.clamp(dt,0,.05);S.phase=(S.phase+S.rpm*Math.PI/30*dt)%(Math.PI*2);if(S.auto){S.travel+=S.direction*dt*12;if(S.travel>=100){S.travel=100;S.direction=-1;}if(S.travel<=0){S.travel=0;S.direction=1;}}}sync();}
    const camPresets={iso:{pos:[43,28,48],look:[0,4,0]},front:{pos:[19,15,34],look:[0,5,10]},breech:{pos:[19,15,-30],look:[0,4,-10]},engine:{pos:[10,11,-10],look:[0,2,-2]},suspension:{pos:[9,11,13],look:[0,6,7]},top:{pos:[.1,63,.1],look:[0,2,0]}};
    const tourSteps=[['Nusret • 1915','Almanya’da inşa edilip Osmanlı donanmasında görev yapan Nusret. Yaklaşık tam gemi rekonstrüksiyonu, modern müze gemisinin birebir kopyası değildir.','iso',hull,false],['Çanakkale’deki Rolü','8 Mart 1915 görevi ve 26 mayın, 18 Mart deniz muharebesinin önemli unsurlarındandır. Güvertedeki sekiz maket sergi tercihidir.','breech',exhibits,false],['Güverte Üzerindeki İş','Ray arabasını yavaş hareket ettirin. Gösterim ray üzerinde kalır; yük denize bırakılmaz.','breech',carriagePart,false],['Seyir Evi','Tavanı kaldırın: dümen, pusula ve harita masası. İç yerleşim yaklaşık yorumdur.','suspension',helm,false],['Buhardan Pervaneye','Kazanlar, iki temsili makine, şaft yatakları ve çift pervane. Gösterim devri gerçek işletme devri değildir.','engine',engines,true],['Gövde ve Bellek','Çelik postalar ve karina. Özgün gemi ile sonradan yapılan müze gemileri kaynak panelinde ayrı değerlendirilir.','top',frames,true]].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));
    const ui=K.ui({portraitCameraScale:1.55,title:'NUSRET — Çanakkale, 1915',sub:'Yaklaşık 40 × 7,4 m • Osmanlı hizmeti / Almanya’da inşa • Tam gemi rekonstrüksiyonu',shadowExtent:30,fog:{near:150,far:260},subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#667d83'})),camLabels:{iso:'Tam Gemi',front:'Baş Güverte',breech:'Kıç Rayları',engine:'Buhar Makineleri',suspension:'Köprüüstü',top:'Üst'},sliders:[{label:'Makine Gösterim Devri',min:0,max:30,step:1,fmt:v=>v+' RPM'},{label:'Dümen Açısı',min:-25,max:25,step:1,fmt:v=>v+'°'},{label:'Sergi Arabası Konumu',min:0,max:100,step:1,fmt:v=>'%'+Math.round(v)}],buttons:{terrain:'Köprüüstü Tavanı',sweep:'Başlangıca Dön'},telemetryTag:'NUSRET • GÜVERTE VE TAHRİK',statLabels:['DEVİR','DÜMEN','ARABA','TARİHSEL GÖREV']});
    sync();return {root,parts,ui,camPresets,tourSteps,defaultPart:hull,firePart:carriagePart,update,onFire:()=>{S.auto=!S.auto;return {ok:true};},fireButtonLabel:()=>S.auto?'ARABAYI DURDUR':'RAY ARABASI GÖSTERİMİ',mobileFireButtonLabel:()=>S.auto?'Durdur':'Ray Arabası',onSlider:(i,v)=>{if(!Number.isFinite(v))return {};if(i===0)S.rpm=T.MathUtils.clamp(v,0,30);if(i===1)S.rudder=T.MathUtils.clamp(v,-25,25);if(i===2){S.travel=T.MathUtils.clamp(v,0,100);S.auto=false;}sync();return {};},onButton:n=>{if(n==='terrain')S.roof=!S.roof;else Object.assign(S,{rpm:0,phase:0,rudder:0,travel:0,auto:false,direction:1,roof:false});sync();return {};},buttonActive:n=>n==='terrain'?S.roof:false,getSliderValues:()=>[S.rpm,S.rudder,S.travel],getStats:()=>[S.rpm+' <span>RPM gösterim</span>',S.rudder+' <span>°</span>',S.travel.toFixed(0)+' <span>%</span>','8 Mart <span>1915</span>'],getStatus:()=>({text:S.auto?'GÜVERTE ÜZERİNDE SERGİ HAREKETİ':'NUSRET • MÜZE REKONSTRÜKSİYONU',color:'#647f87'}),applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
  };
})();
