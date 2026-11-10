/* T-34/76 erken üretim: müze referanslı yaklaşık rekonstrüksiyon. Sürüş veya balistik simülatörü değildir. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.t34 = function (ctx) {
    const K = window.MuseumModelKit(ctx, 't34');
    const {T, root, mats:M, mesh, box, cyl, ring, instances} = K;
    // Ölçüler (m). Tekerlek yarıçapı ~0,415 (Ø ~830 mm), palet kalınlığı 0,06.
    const R = 0.415, TR = 0.06, RP = R + TR, WY = RP, WX = 1.25, ARM = Math.hypot(0.40, 0.15);
    const WZ = [1.98, 1.12, 0.26, -0.60, -1.46], IDL = {z:2.72, y:0.58, r:0.30}, SPR = {z:-2.42, y:0.60, r:0.32};
    const S = {obstacle:0, rpm:900, turret:0, auto:false, zObs:WZ[1], hatches:false, ammo:77, fire:0, firing:false, wheelAngle:0, crank:0, time:0};
    const counts = {}; let number = 0;
    M.paint.color.setHex(0x4a5532); M.paint.roughness = .82;
    const cast = M.paint.clone(); cast.color.setHex(0x465030); cast.userData.paint = true;
    const engineMat = M.dark.clone(); engineMat.color.setHex(0x3b4247);
    const springMat = M.steel.clone(); springMat.color.setHex(0x8a9197);
    const logMat = M.wood.clone(); logMat.color.setHex(0x6b5038);
    function G(parent, pos, name) {const g=new T.Group();g.position.set(...pos);if(name)g.name=name;parent.add(g);return g;}
    function P(key,name,sub,desc,exp=[0,.5,0],outer=false,parent=root) {
      counts[sub]=(counts[sub]||0)+1;
      const p=K.part(key,++number+'. '+name,sub,[0,0,0],exp,desc,outer,parent);
      p.userData.material='Haddelenmiş/dökme zırh çeliği, kauçuk bandaj, alüminyum alaşım motor';
      p.userData.spec='Müze referanslı yaklaşık model; iç yerleşim ve küçük ölçüler yorumdur.';return p;
    }
    function rod(p,a,b,r,mat) {const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);
      const o=cyl(p,r,d.length(),av.add(bv).multiplyScalar(.5).toArray(),mat);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
    // Birim uzunlukta yeniden kullanılan parçalar: her karede yalnız konum/ölçek/yön güncellenir.
    const UP=new T.Vector3(0,1,0),tmpA=new T.Vector3(),tmpB=new T.Vector3(),tmpD=new T.Vector3();
    function stretch(o,a,b) {tmpA.set(...a);tmpB.set(...b);o.position.copy(tmpA).add(tmpB).multiplyScalar(.5);tmpD.copy(tmpB).sub(tmpA);o.scale.y=Math.max(tmpD.length(),1e-4);o.quaternion.setFromUnitVectors(UP,tmpD.normalize());}

    // ---------------------------------------------------------------- GÖVDE
    // Kesitler: [z, alt, üst, yan çıkıntı yarı genişliği]. Çıkıntı (sponson) altı y = 1,18'de; en yüksek tekerlek konumunda bile paletin üstünde kalır.
    function hullGeometry() {
      const st=[[-2.96,.58,1.02,1.5],[-2.78,.40,1.229,1.5],[-2.62,.40,1.45,1.5],[1.75,.40,1.45,1.5],[2.42,.40,1.0,1.5],[2.43,.40,.993,.98],[2.80,.40,.747,.98],[2.96,.55,.64,.98]];
      const rings=st.map(([z,yb,yt,ws])=>{const ys=Math.min(1.18,yt),xt=Math.max(.98,ws-.84*(yt-ys));
        return [[0,yb],[.98,yb],[.98,ys],[ws,ys],[xt,yt],[-xt,yt],[-ws,ys],[-.98,ys],[-.98,yb]].map(([x,y])=>[x,y,z]);});
      const v=[],ix=[],N=rings[0].length;rings.forEach(r=>r.forEach(p=>v.push(...p)));
      for(let j=0;j<rings.length-1;j++)for(let i=0;i<N;i++){const a=j*N+i,b=j*N+(i+1)%N;ix.push(a,b,a+N,b,b+N,a+N);}
      const cap=(j,flip)=>{const c=v.length/3,r=rings[j];let cx=0,cy=0;r.forEach(p=>{cx+=p[0];cy+=p[1];});v.push(cx/N,cy/N,r[0][2]);
        for(let i=0;i<N;i++){const a=j*N+i,b=j*N+(i+1)%N;flip?ix.push(c,b,a):ix.push(c,a,b);}};
      cap(rings.length-1,false);cap(0,true);
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);
      const flat=g.toNonIndexed();flat.computeVertexNormals();return flat;
    }
    const hull=P('hull','Eğimli Zırh Gövdesi','Gövde','Ön levha yataydan ~34° (dikeyden ~56°) eğimli; yan çıkıntılar palet üstünde. X-Ray dış kabuğu saydamlaştırır ve yan duvardaki Christie yaylarını gösterir. Kalınlıklar (15–45 mm) dış görünüşte ayrıca modellenmez.',[0,.9,0],true);
    const hullMat=M.paint.clone();hullMat.side=T.DoubleSide;hullMat.userData.paint=true;mesh(hull,hullGeometry(),hullMat);
    for(const s of [-1,1])box(hull,[.52,.012,.55],[s*1.25,1.006,2.70],M.paint); // ön çamurluk levhaları (avare tekerlek üstü)
    const glacis=P('glacis','Sürücü Kapağı, Ön Makineli Tüfek ve Far','Gövde','Ön eğik levhadaki sürücü kapağı ve sağdaki bilyeli yuvada 7,62 mm DT. Kapak düğmeyle açılır; yerleşim yaklaşık.',[0,.4,.8]);
    const slope=Math.atan2(.81,1.21),gz=t=>1.75+1.21*t,gy=t=>1.45-.81*t;
    const driverHinge=G(glacis,[-.33,gy(.18)+.02,gz(.18)],'driver-hinge');driverHinge.rotation.x=slope;
    box(driverHinge,[.48,.045,.42],[0,0,.21],cast);box(driverHinge,[.16,.05,.06],[0,.03,.30],M.dark);
    const mgBall=cyl(glacis,.11,.08,[.42,gy(.45)+.02,gz(.45)],cast,'z');mgBall.rotation.x=Math.PI/2-slope;
    rod(glacis,[.42,gy(.45)+.03,gz(.45)],[.42,gy(.45)-.05,gz(.45)+.42],.016,M.dark);
    cyl(glacis,.075,.09,[-.70,gy(.55)+.06,gz(.55)],M.steel,'z');ring(glacis,.075,[-.70,gy(.55)+.06,gz(.55)+.05],M.dark,.012);
    for(const s of [-1,1]){box(glacis,[.10,.06,.12],[s*.70,.62,2.97],M.dark);}
    const rear=P('rear','Arka Levha ve Egzozlar','Gövde','Eğik arka levha, iki egzoz çıkışı ve bakım kapağı. Arka levha ayrıntıları temsili.',[0,.3,-.8]);
    const rearSlope=Math.atan2(.47,.34);
    box(rear,[1.2,.035,.5],[0,1.22,-2.80],cast,[-rearSlope,0,0]);
    for(const s of [-1,1]){cyl(rear,.07,.20,[s*.55,.86,-3.0],M.dark,'z');ring(rear,.07,[s*.55,.86,-3.10],M.steel,.012);}

    // ---------------------------------------------------------------- TARET
    const turretYaw=G(root,[0,1.45,.55],'turret-yaw');
    const turret=P('turret','Altıgen Taret Kabuğu','Taret','Öne yakın konumlu iki kişilik taret (komutan aynı zamanda nişancı). Altıgen eğimli yanlar ve büyük arka menteşeli kapak 1941 düzenini temsil eder. Döküm/kaynaklı alt sürüm ayrımı yapılmaz.',[0,1.2,0],true,turretYaw);
    const tMat=cast.clone();tMat.side=T.DoubleSide;tMat.userData.paint=true;
    const shell=mesh(turret,new T.CylinderGeometry(.78,.95,.62,6,1,true),tMat,[0,.31,0],[0,Math.PI/6,0]);shell.scale.set(1,1,1.2);
    const roof=mesh(turret,new T.CylinderGeometry(.78,.78,.04,6),tMat,[0,.62,0],[0,Math.PI/6,0]);roof.scale.set(1,1,1.2);
    for(const s of [-1,1])box(turret,[.07,.18,.035],[s*.36,.70,.55],M.dark); // periskoplar
    const hatchHinge=G(turret,[0,.645,-.62],'turret-hatch');box(hatchHinge,[.86,.04,.70],[0,0,.35],cast);box(hatchHinge,[.12,.05,.08],[0,.03,.60],M.dark);
    const gun=P('gun','76,2 mm Top, Kalkan ve Geri Tepme Beşiği','Taret','Top kalkanı sabit kalır, namlu ve kama geri teper (~0,37 m, yaklaşık). L-11/F-34 alt sürümü belirtilmez.',[0,.4,1.4],false,turretYaw);
    const gunPivot=G(gun,[0,.30,.95],'gun-pivot');
    box(gunPivot,[.62,.36,.16],[0,0,.08],cast);box(gunPivot,[.20,.18,.40],[0,0,.32],cast);
    rod(gunPivot,[.20,.05,.02],[.20,.05,.30],.03,M.dark); // eş eksenli DT
    const recoil=G(gunPivot,[0,0,0],'gun-recoil');
    rod(recoil,[0,0,.15],[0,0,2.22],.055,M.paint);cyl(recoil,.062,.12,[0,0,2.17],M.dark,'z');
    box(recoil,[.26,.26,.44],[0,0,-.20],M.dark);box(recoil,[.30,.06,.30],[0,-.16,-.20],M.steel);
    const flash=new T.Mesh(new T.ConeGeometry(.22,.7,14),new T.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:.85,depthWrite:false}));
    flash.rotation.x=Math.PI/2;flash.position.set(0,0,2.62);flash.visible=false;recoil.add(flash);
    const crew=P('crew','Taret Halkası, Koltuklar ve Mermi Rafı','Taret','Taret halkası, halkaya asılı iki koltuk ve taret arkasındaki hazır mermi rafı. T-34/76 tarette sepet yoktur; yükleyici gövde tabanındaki kutulardan da mermi alır.',[0,.9,-.4],false,turretYaw);
    ring(crew,.71,[0,.0,0],M.steel,.04,[Math.PI/2,0,0]);
    for(const x of [-.35,.35]){rod(crew,[x,0,-.1],[x,-.42,-.1],.018,M.steel);box(crew,[.34,.05,.32],[x,-.44,-.1],M.rubber);}
    instances(crew,new T.CylinderGeometry(.04,.04,.62,10),M.brass,[-.3,-.15,0,.15,.3].map(x=>({pos:[x,.36,-.80],rot:[0,0,Math.PI/2]})));
    const ammo=P('ammo','Taban Cephane Kutuları','Mürettebat','Gövde tabanındaki kapaklı cephane kutuları; 77 mermi kapasitesi müze verisi, kutu sayısı ve dizilimi temsili.',[0,-.3,0]);
    instances(ammo,new T.BoxGeometry(.42,.20,.50),M.dark,[-.5,0,.5].flatMap(x=>[.15,.75].map(z=>({pos:[x,.51,z]}))));
    const seats=P('seats','Sürücü ve Telsizci-Makineli Tüfekçi Koltukları','Mürettebat','Ön bölmede solda sürücü, sağda telsizci/makineli tüfekçi. Kumanda kolları ve pedallar yaklaşık.',[0,.5,.6]);
    for(const x of [-.33,.42]){box(seats,[.38,.06,.36],[x,.62,1.55],M.rubber);box(seats,[.38,.36,.06],[x,.82,1.36],M.rubber);}
    for(const x of [-.43,-.23])rod(seats,[x,.45,1.85],[x,.85,1.80],.018,M.steel);

    // ---------------------------------------------------------------- MOTOR
    const engine=P('engine','V-2 V12 Dizel Motor','Motor','~38,9 L, ~500 BG @ 1800 dev/dk alüminyum alaşımlı V12 dizel. İki silindir sırası 60° V açısıyla; krank kasnağı devirle döner.',[0,1.0,-.6]);
    box(engine,[.62,.42,1.30],[0,.66,-1.20],engineMat);
    for(const s of [-1,1]){const bank=G(engine,[s*.20,.94,-1.20]);bank.rotation.z=-s*Math.PI/6;box(bank,[.22,.30,1.24],[0,.10,0],engineMat);
      instances(bank,new T.CylinderGeometry(.045,.045,.06,10),M.steel,Array.from({length:6},(_,i)=>({pos:[0,.27,-.52+i*.208]})));}
    const pulley=G(engine,[0,.66,-.52],'crank-pulley');cyl(pulley,.16,.05,[0,0,0],M.steel,'z');box(pulley,[.30,.03,.06],[0,0,.03],M.dark);
    const cooling=P('cooling','Volan Fanı ve Radyatörler','Motor','Motorun arkasındaki volan-fan iki yandaki eğik radyatörlerden hava çeker. Fan dev/dk ile döner, 0 dev/dk iken durur.',[0,.8,-1.2]);
    for(const s of [-1,1])box(cooling,[.08,.62,1.1],[s*.62,.80,-1.25],M.dark,[0,0,s*.35]);
    const fan=G(cooling,[0,.72,-2.02],'fan');ring(fan,.40,[0,0,0],M.steel,.03);
    for(let i=0;i<12;i++){const b=G(fan,[0,0,0]);b.rotation.z=i*Math.PI/6;box(b,[.06,.36,.02],[0,.20,0],M.steel,[0,.35,0]);}
    const drive=P('drive','Şanzıman, Son Tahrik ve Cer Dişlileri','Motor','Arka şanzıman, yan kavramalar ve son tahrik milleri arka cer dişlilerini çevirir. Silindir makaralı cer dişlisi palet kılavuz dişlerini iter.',[0,.6,-1.6]);
    box(drive,[.80,.40,.36],[0,.62,-2.32],engineMat);
    const sprockets=[];for(const s of [-1,1]){rod(drive,[s*.40,SPR.y,SPR.z],[s*1.10,SPR.y,SPR.z],.06,M.steel);
      const g=G(drive,[s*WX,SPR.y,SPR.z],'sprocket');for(const dx of [-.12,.12])cyl(g,SPR.r,.04,[dx,0,0],M.paint,'x');cyl(g,.10,.30,[0,0,0],M.dark,'x');
      instances(g,new T.CylinderGeometry(.035,.035,.24,8),M.steel,Array.from({length:10},(_,i)=>{const a=i*Math.PI/5;return {pos:[0,Math.sin(a)*(SPR.r-.04),Math.cos(a)*(SPR.r-.04)],rot:[0,0,Math.PI/2]};}));sprockets.push(g);}

    // ---------------------------------------------------------------- SÜSPANSİYON (Christie)
    const springs=P('springs','Christie Helezon Yayları (Yan Duvar)','Süspansiyon','Her tekerleğin krank milindeki iç kol, gövde yan duvarına eğik yerleştirilmiş helezon yayı sıkıştırır. Yay üst ucu gövdeye sabittir. Kol oranı ve yay boyu temsilidir.',[0,.3,0]);
    const arms=P('arms','Salıncak Kolları ve Krank Milleri','Süspansiyon','Öndeki pivottan çıkan dış kol tekerlek göbeğini taşır; tekerlek kol yayı üzerinde hareket eder (kol boyu sabit).',[0,.1,0]);
    const helix=(()=>{const pts=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2*7;pts.push(new T.Vector3(.065*Math.cos(a),i/96-.5,.065*Math.sin(a)));}return new T.TubeGeometry(new T.CatmullRomCurve3(pts),192,.011,6,false);})();
    const susp=[];
    for(const s of [-1,1])WZ.forEach((z,k)=>{
      const pivot=[z+.40,WY+.15];
      cyl(arms,.045,.22,[s*.96,pivot[1],pivot[0]],M.dark,'x');
      const outer=cyl(arms,.035,1,[0,0,0],M.steel);const inner=cyl(springs,.03,1,[0,0,0],M.steel);
      const coil=mesh(springs,helix,springMat);
      const restB=[pivot[0]-.40*.35,pivot[1]-.15*.35],anchor=[restB[0]+.12,restB[1]+.55];
      box(springs,[.16,.04,.16],[s*.86,anchor[1]+.02,anchor[0]],M.dark);
      susp.push({s,k,pivot,anchor,outer,inner,coil,len:0});
    });
    const wheelsL=P('wheelsL','Sol Yol Tekerlekleri (5 Çift)','Yürüyüş','Ø ~830 mm kauçuk bandajlı çift tekerlekler; palet kılavuz dişi ikisinin arasından geçer. Dönüş makarası yoktur, üst palet tekerleklerin üstüne yaslanır.',[-1.4,0,0]);
    const wheelsR=P('wheelsR','Sağ Yol Tekerlekleri (5 Çift)','Yürüyüş','Sağ taraf; her tekerlek kendi Christie koluyla bağımsız hareket eder.',[1.4,0,0]);
    const wheels={};
    for(const [s,p] of [[-1,wheelsL],[1,wheelsR]])wheels[s]=WZ.map(z=>{const g=G(p,[s*WX,WY,z],'road-wheel');for(const dx of [-.085,.085])K.wheel(g,dx,0,0,R,.13);return g;});
    const idlers=P('idlers','Ön Avare (Gergi) Tekerlekleri','Yürüyüş','Öndeki avare tekerlek palet gerginliğini ayarlar; krank kollu gergi ayarı yaklaşık.',[0,.2,.6]);
    const idlerG=[];for(const s of [-1,1]){const g=G(idlers,[s*WX,IDL.y,IDL.z],'idler');for(const dx of [-.10,.10])cyl(g,IDL.r,.06,[dx,0,0],M.paint,'x');cyl(g,.08,.30,[0,0,0],M.dark,'x');rod(idlers,[s*.98,IDL.y,IDL.z-.25],[s*1.05,IDL.y,IDL.z],.04,M.dark);idlerG.push(g);}
    const tracks=P('tracks','Paletler (Dinamik Hat)','Yürüyüş','Taraf başına 16 doğru parçalı kapalı palet hattı. Engel testinde tekerlek alt ve üst noktalarından yeniden hesaplanır; tek tek bakla modellenmez.',[0,-.2,0]);
    const trackGeo=new T.BoxGeometry(.50,TR,1),trackSeg={};
    for(const s of [-1,1])trackSeg[s]=Array.from({length:16},()=>mesh(tracks,trackGeo,M.dark));
    const test=P('test','Engel Testi Kütüğü','Test Zemini','Christie süspansiyonunun her tekerleği ayrı yükseltmesini göstermek için yuvarlak kütük. Gerçek arazi profili değildir.',[0,-.4,0]);
    const log=mesh(test,new T.CylinderGeometry(1,1,3.3,28),logMat,[0,0,0],[0,0,Math.PI/2]);log.name='test-log';

    // ---------------------------------------------------------------- KİNEMATİK
    const hubs=WZ.map(z=>({z,y:WY,lift:0}));
    function solveWheel(k,H) {
      const rho=H/2,pz=WZ[k]+.40,py=WY+.15;let hz=WZ[k],lift=0;
      for(let it=0;it<10;it++){const d=hz-S.zObs;lift=(H>.005&&Math.abs(d)<RP+rho)?Math.max(0,rho+Math.sqrt((RP+rho)**2-d*d)-RP):0;
        const dy=WY+lift-py;hz=pz-Math.sqrt(Math.max(0,ARM*ARM-dy*dy));}
      hubs[k].z=hz;hubs[k].y=WY+lift;hubs[k].lift=lift;
    }
    function trackLoop() {
      const c=TR/2,pts=[[IDL.z,IDL.y+IDL.r+c],[IDL.z+IDL.r+c,IDL.y],[IDL.z,IDL.y-IDL.r-c]];
      hubs.forEach(h=>pts.push([h.z,h.y-R-c]));
      pts.push([SPR.z,SPR.y-SPR.r-c],[SPR.z-SPR.r-c,SPR.y],[SPR.z,SPR.y+SPR.r+c]);
      for(let k=hubs.length-1;k>=0;k--)pts.push([hubs[k].z,hubs[k].y+R+c]);
      return pts;
    }
    function sync() {
      const H=S.obstacle;
      for(let k=0;k<WZ.length;k++)solveWheel(k,H);
      for(const s of [-1,1])wheels[s].forEach((g,k)=>{g.position.set(s*WX,hubs[k].y,hubs[k].z);g.rotation.x=S.wheelAngle;});
      susp.forEach(o=>{const h=hubs[o.k],x=o.s;
        stretch(o.outer,[x*1.04,o.pivot[1],o.pivot[0]],[x*1.04,h.y,h.z]);
        const b=[o.pivot[0]+(h.z-o.pivot[0])*.35,o.pivot[1]+(h.y-o.pivot[1])*.35];
        stretch(o.inner,[x*.86,o.pivot[1],o.pivot[0]],[x*.86,b[1],b[0]]);
        stretch(o.coil,[x*.86,o.anchor[1],o.anchor[0]],[x*.86,b[1],b[0]]);o.len=Math.hypot(o.anchor[0]-b[0],o.anchor[1]-b[1]);});
      const loop=trackLoop();
      for(const s of [-1,1])trackSeg[s].forEach((o,i)=>{const a=loop[i],b=loop[(i+1)%loop.length],dz=b[0]-a[0],dy=b[1]-a[1];
        o.position.set(s*WX,(a[1]+b[1])/2,(a[0]+b[0])/2);o.scale.set(1,1,Math.max(Math.hypot(dz,dy),1e-4));o.rotation.set(Math.atan2(-dy,dz),0,0);});
      const rho=H/2;log.visible=H>.005;log.position.set(0,rho,S.zObs);log.scale.set(Math.max(rho,1e-4),1,Math.max(rho,1e-4));
      sprockets.forEach(g=>g.rotation.x=S.wheelAngle*R/SPR.r);idlerG.forEach(g=>g.rotation.x=S.wheelAngle*R/IDL.r);
      pulley.rotation.z=S.crank;fan.rotation.z=S.crank;
      turretYaw.rotation.y=S.turret*Math.PI/180;
      const p=S.fire,kick=!S.firing?0:p<.15?p/.15:Math.max(0,1-(p-.15)/.6);recoil.position.z=-.37*kick;flash.visible=S.firing&&p<.12;
      hatchHinge.rotation.x=S.hatches?-1.9:0;driverHinge.rotation.x=slope-(S.hatches?1.2:0);
    }
    const speedKmh=()=>S.rpm/1800*53;
    function update(dt) {
      if(!Number.isFinite(dt))return;dt=T.MathUtils.clamp(dt,0,.05);S.time+=dt;
      const v=speedKmh()/3.6;S.wheelAngle=(S.wheelAngle+dt*v/R*.35)%(Math.PI*2);S.crank=(S.crank+dt*S.rpm*.012)%(Math.PI*2);
      if(S.auto&&v>0){if(S.obstacle<.05)S.obstacle=.18;S.zObs-=dt*Math.max(.4,v*.25);if(S.zObs<-2.7)S.zObs=3.3;}
      if(S.firing){S.fire+=dt*1.4;if(S.fire>=1){S.firing=false;S.fire=0;}}
      sync();
    }
    const camPresets={iso:{pos:[8.5,5,8.5],look:[0,1,0]},front:{pos:[2.6,2.4,7.6],look:[0,1.3,2]},breech:{pos:[2.8,3.6,-1.6],look:[0,1.9,.5]},engine:{pos:[3.4,3.4,-5.2],look:[0,.8,-1.4]},suspension:{pos:[5.4,1.2,1.6],look:[.9,.6,.3]},top:{pos:[.1,11,0],look:[0,1,0]}};
    const tourSteps=[
      ['T-34/76: Eğimli Zırh ve Geniş Palet','1941’de Alman ordusunu şaşırtan orta tank. Eğimli levhalar, geniş paletler ve dizel motor bir arada. Bu sahne müze örneğine dayanan yaklaşık bir rekonstrüksiyondur.','iso',hull,false],
      ['Christie Süspansiyonu','Engel kaydırıcısıyla 2. tekerleğin altına kütük koyun: yalnız o tekerlek yükselir, kolu döner ve yan duvardaki yay kısalır. Diğer tekerlekler zemine basmaya devam eder.','suspension',springs,true],
      ['Kütük Üzerinden Geçiş','“Engel Gösterimi” düğmesi kütüğü önden arkaya taşır. Tekerlekler sırayla yükselir; palet hattı her karede tekerleklere göre yeniden çizilir.','suspension',wheelsR,false],
      ['V-2 Dizel ve Arka Tahrik','X-Ray ile arkadaki V12 dizeli, volan-fanı, şanzımanı ve cer dişlilerini görün. Devir 0 iken fan, tekerlekler ve cer durur.','engine',engine,true],
      ['76,2 mm Top ve İki Kişilik Taret','Komutan aynı zamanda nişancıydı; bu iş yükü T-34/76’nın bilinen zayıflığıdır. Ateşte namlu geri teper, kalkan sabit kalır.','breech',gun,true],
      ['Kapaklar ve Sınırlar','Kapakları açın. Kalınlık, iç yerleşim ve alt sürüm ayrıntıları yaklaşık; hız göstergesi temsili bir vites oranıyla hesaplanır.','front',glacis,false]
    ].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));
    const ui=K.ui({portraitCameraScale:1.45,shadowExtent:9,title:'T-34/76 — Christie Süspansiyonu ve V-2 Dizel',sub:'1940–41 erken üretim • Eğimli zırh • Yan duvar helezon yayları',
      subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#4a5532'})),
      camLabels:{iso:'Genel',front:'Ön Levha',breech:'Taret ve Top',engine:'Motor Bölmesi',suspension:'Christie Yayları',top:'Üst'},
      sliders:[{label:'Engel Yüksekliği (2. tekerlek)',min:0,max:.20,step:.01,fmt:v=>Math.round(v*100)+' cm'},{label:'Motor Devri (V-2)',min:0,max:1800,step:50,fmt:v=>Math.round(v)+' dev/dk'},{label:'Taret Dönüşü',min:-180,max:180,step:1,fmt:v=>Math.round(v)+'°'}],
      buttons:{terrain:'Engel Gösterimi',sweep:'Kapaklar'},telemetryTag:'V-2-34 • CHRISTIE • 76,2 MM',statLabels:['HIZ (TEMSİLİ)','MOTOR','EN BÜYÜK YAY KISALMASI','MERMİ']});
    let restLen=0;sync();restLen=susp[0].len;
    const maxCompression=()=>Math.max(...susp.map(o=>restLen-o.len));
    return {root,parts:K.parts,ui,camPresets,tourSteps,defaultPart:springs,firePart:gun,update,hubs,suspension:susp,trackLoop,
      onFire:()=>{if(S.ammo<=0){S.ammo=77;return {ok:true,refill:true,msg:'İkmal: 77 mermi.'};}if(S.firing)return {ok:false};S.ammo--;S.firing=true;S.fire=0;sync();if(ctx.audio&&ctx.audio.playCannonFire)ctx.audio.playCannonFire();return {ok:true,msg:'76,2 mm atış — kalan '+S.ammo};},
      fireButtonLabel:()=>S.ammo<=0?'İKMAL (77 MERMİ)':'76,2 MM ATEŞ ('+S.ammo+')',mobileFireButtonLabel:()=>S.ammo<=0?'İkmal':'Ateş',
      onSlider:(i,v)=>{if(!Number.isFinite(v))return {};if(i===0){S.auto=false;S.zObs=WZ[1];S.obstacle=T.MathUtils.clamp(v,0,.20);}if(i===1)S.rpm=T.MathUtils.clamp(v,0,1800);if(i===2)S.turret=T.MathUtils.clamp(v,-180,180);sync();return {};},
      onButton:n=>{if(n==='terrain'){S.auto=!S.auto;S.zObs=3.3;}if(n==='sweep')S.hatches=!S.hatches;sync();return {};},
      buttonActive:n=>n==='terrain'?S.auto:n==='sweep'?S.hatches:false,
      getSliderValues:()=>[S.obstacle,S.rpm,S.turret],
      getStats:()=>[speedKmh().toFixed(1)+' <span>km/sa</span>',Math.round(S.rpm)+' <span>dev/dk</span>',Math.round(maxCompression()*1000)+' <span>mm</span>',S.ammo+' <span>/ 77</span>'],
      getStatus:()=>S.firing?{text:'76,2 MM ATEŞ — GERİ TEPME',color:'#b4532a'}:S.auto?{text:'ENGEL GÖSTERİMİ • TEKERLEKLER SIRAYLA YÜKSELİYOR',color:'#4a5532'}:{text:S.rpm>0?'MOTOR ÇALIŞIYOR':'MOTOR DURDU',color:'#4a5532'},
      applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
  };
})();
