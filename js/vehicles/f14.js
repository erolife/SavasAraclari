/* Grumman F-14D(R) Tomcat: Smithsonian Udvar-Hazy örneğine (A20040156000) dayanan yaklaşık müze modeli. Gerçek CADC uçuş bilgisayarı ve AWG-9/APG-71 radar simülasyonu değildir. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.f14 = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'f14');
    const {T, root, mats:M, mesh, box, cyl, ring, instances} = K;
    // 1 birim = 1 m. Pivotlar x = ±2,75, y = 2,16, z = -0,35; 20°'de yarı açıklık 9,77 m (toplam 19,54 m).
    const PX = 2.75, PY = 2.16, PZ = -0.35, U_TIP = 7.02, LE0 = 0.38, TAN20 = Math.tan(20 * Math.PI / 180);
    const S = {sweep:20, mach:0, throttle:65, autoSweep:false, open:false, ammo:6, fanAngle:0, shots:[], time:0};
    const counts = {}; let number = 0;
    M.paint.color.setHex(0x8a9298); M.paint.roughness = .58; M.paint.metalness = .28; // donanma taktik gri
    const darkGrey = M.paint.clone(); darkGrey.color.setHex(0x6e767c); darkGrey.userData.paint = true;
    const radomeMat = M.dark.clone(); radomeMat.color.setHex(0x2a2f33);
    const tiMat = M.steel.clone(); tiMat.color.setHex(0x9aa2a8); tiMat.metalness = .82;
    const nozzleMat = M.dark.clone(); nozzleMat.color.setHex(0x3a3937);
    const missileMat = M.white.clone(); missileMat.color.setHex(0xdadcd8);
    function G(parent, pos, name) {const o=new T.Group();o.position.set(...pos);if(name)o.name=name;parent.add(o);return o;}
    function P(key,name,sub,desc,exp=[0,.6,0],outer=false,pos=[0,0,0]) {
      counts[sub]=(counts[sub]||0)+1;
      const p=K.part(key,++number+'. '+name,sub,pos,exp,desc,outer,root);
      p.userData.material='Alüminyum alaşım gövde, elektron ışın kaynaklı titanyum kanat kutusu, kompozit kuyruk kaplaması';
      p.userData.spec='Udvar-Hazy F-14D(R) referanslı yaklaşık model; iç ölçüler ve kanat programı eğitim amaçlı yorumdur.';return p;
    }
    const UP=new T.Vector3(0,1,0),a3=new T.Vector3(),b3=new T.Vector3(),d3=new T.Vector3();
    function stretch(o,a,b){a3.copy(a);b3.copy(b);o.position.copy(a3).add(b3).multiplyScalar(.5);d3.copy(b3).sub(a3);o.scale.y=Math.max(d3.length(),1e-4);o.quaternion.setFromUnitVectors(UP,d3.normalize());}

    // Artan z yönünde CCW (x,y) halkalarından dışa dönük normalli loft üretir.
    function loftZ(rings, smooth=false) {
      const v=[],ix=[],N=rings[0].length;rings.forEach(r=>r.forEach(p=>v.push(...p)));
      for(let j=0;j<rings.length-1;j++)for(let i=0;i<N;i++){const a=j*N+i,b=j*N+(i+1)%N;ix.push(a,b,a+N,b,b+N,a+N);}
      const cap=(j,flip)=>{const c=v.length/3,r=rings[j];let cx=0,cy=0;r.forEach(p=>{cx+=p[0];cy+=p[1];});v.push(cx/N,cy/N,r[0][2]);
        for(let i=0;i<N;i++){const a=j*N+i,b=j*N+(i+1)%N;flip?ix.push(c,b,a):ix.push(c,a,b);}};
      cap(rings.length-1,false);cap(0,true);
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);
      const out=smooth?g:g.toNonIndexed();out.computeVertexNormals();return out;
    }
    // Kanat/kuyruk kesiti: u artarken (+X için s=1, -X için s=-1) dışa dönük normalli NACA benzeri profil.
    function wingGeometry(stations, s=1) {
      const rings=stations.map(([u,zLE,zTE,th,yc=0])=>{
        const c=zLE-zTE,zc=(zLE+zTE)/2;
        return [[yc,zTE],[yc+th*.72,zc-.18*c],[yc+th,zc+.18*c],[yc+.25*th,zLE],[yc-.25*th,zLE],[yc-th,zc+.18*c],[yc-th*.72,zc-.18*c]].map(([y,z])=>[s*u,y,z]);
      });
      const v=[],ix=[],N=rings[0].length;rings.forEach(r=>r.forEach(p=>v.push(...p)));
      for(let j=0;j<rings.length-1;j++)for(let i=0;i<N;i++){const a=j*N+i,b=j*N+(i+1)%N;s>0?ix.push(a,b,a+N,b,b+N,a+N):ix.push(a,a+N,b,b,a+N,b+N);}
      const cap=(j,flip)=>{const c=v.length/3,r=rings[j];let cy=0,cz=0;r.forEach(p=>{cy+=p[1];cz+=p[2];});v.push(r[0][0],cy/N,cz/N);
        for(let i=0;i<N;i++){const a=j*N+i,b=j*N+(i+1)%N;(s>0?flip:!flip)?ix.push(c,b,a):ix.push(c,a,b);}};
      cap(rings.length-1,false);cap(0,true);
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);
      const flat=g.toNonIndexed();flat.computeVertexNormals();return flat;
    }

    // ------------------------------------------------------------- GÖVDE ve KOKPİT
    const fuse=P('fuselage','Ön Gövde, Radom ve Yassı Arka Gövde','Gövde','Geniş kaldırma gövdesi ("tunnel") iki motor naseli arasında ek taşıma üretir ve AIM-54 paletlerini barındırır. Udvar-Hazy’deki F-14D(R) örneğinde burun altında çift sensör podu (TCS/IRST) bulunur.',[0,.8,0],true);
    const ell=(z,rx,ry,yc)=>Array.from({length:16},(_,i)=>{const a=i*Math.PI*2/16;return [Math.cos(a)*rx,yc+Math.sin(a)*ry,z];});
    mesh(fuse,loftZ([
      ell(-9.10,.52,.11,1.95),ell(-7.00,.82,.24,1.98),ell(-3.50,1.08,.38,2.02),ell(.80,1.12,.44,2.04),
      ell(3.40,.78,.54,2.02),ell(5.80,.62,.48,1.94),ell(7.60,.42,.34,1.84)
    ],true),M.paint);
    mesh(fuse,loftZ([ell(7.60,.42,.34,1.84),ell(8.75,.21,.18,1.77),ell(9.55,.03,.03,1.72)],true),radomeMat);
    // F-14D çift çene podu (IRST + TCS) ve M61 Vulcan namlu ağzı kaplaması
    box(fuse,[.26,.16,.78],[0,1.44,7.05],darkGrey);cyl(fuse,.06,.22,[-.07,1.43,7.46],radomeMat,'z');cyl(fuse,.06,.22,[.07,1.43,7.46],M.glass,'z');
    cyl(fuse,.04,.45,[.56,1.84,6.20],M.dark,'z');

    const cockpit=P('cockpit','Tandem İki Kişilik Kokpit (Pilot + RIO)','Kokpit','Önde pilot, arkada silah sistem subayı (RIO) oturur. İki adet fırlatma koltuğu ve gösterge siperlikleri görülür.',[0,.9,.4]);
    box(cockpit,[.84,.42,3.10],[0,2.14,4.75],M.dark);
    for(const z of [5.55,4.15]){
      box(cockpit,[.46,.12,.46],[0,2.02,z],M.dark);box(cockpit,[.44,.68,.12],[0,2.38,z-.20],M.dark,[-.14,0,0]);
      box(cockpit,[.34,.18,.14],[0,2.74,z-.24],M.red);ring(cockpit,.045,[0,2.85,z-.22],M.brass,.010);
      box(cockpit,[.54,.20,.26],[0,2.38,z+.42],M.dark);
    }
    mesh(cockpit,new T.BoxGeometry(.26,.18,.02),M.glass,[0,2.56,6.08],[-.45,0,0]);

    const canopy=P('canopy','Kanopi ve Kuyruk Hava Freni','Kokpit','Uzun çerçeveli kanopi arka menteşesinden kalkar; yassı arka gövdedeki üst-alt hava freni yaprakları birlikte açılır.',[0,1.1,.3],true);
    const canopyHinge=G(canopy,[0,2.44,3.15],'canopy-hinge');
    mesh(canopyHinge,loftZ([ell(.05,.44,.26,.04),ell(1.35,.43,.48,.14),ell(2.55,.35,.38,.08),ell(3.30,.20,.10,-.04)],true),M.glass);
    for(const [z,r,y] of [[.25,.30,.02],[1.40,.43,.16],[2.50,.35,.09]]){
      const hoop=mesh(canopyHinge,new T.TorusGeometry(r,.022,8,20,Math.PI),darkGrey,[0,y,z]);hoop.scale.set(1,1.05,1);
    }
    const sbUp=G(canopy,[0,2.06,-7.95],'speedbrake-upper'),sbDn=G(canopy,[0,1.84,-7.95],'speedbrake-lower');
    box(sbUp,[.88,.04,1.05],[0,.02,-.52],darkGrey);box(sbDn,[.88,.04,1.05],[0,-.02,-.52],darkGrey);

    // ------------------------------------------------------------- KANAT KUTUSU, ELDİVEN ve SENKRON KANATLAR
    const wingbox=P('wingbox','Titanyum Kanat Taşıyıcı Kutu ve Pivot Yatakları','Kanat Mekanizması','Elektron ışın kaynaklı titanyum merkez kutu, iki dış kanadın eğilme yükünü gövde üstünden karşılar. İki küresel pivot yatağı (x = ±2,75 m) ve hidrolik ok açısı pistonları senkron çalışır.',[0,1.1,0]);
    box(wingbox,[5.60,.22,.74],[0,2.16,-.35],tiMat);
    box(wingbox,[3.40,.18,.32],[0,2.16,.28],tiMat);box(wingbox,[3.40,.18,.32],[0,2.16,-.98],tiMat);
    for(const s of [-1,1]){cyl(wingbox,.28,.28,[s*PX,PY,PZ],tiMat);ring(wingbox,.32,[s*PX,PY+.14,PZ],M.dark,.025,[Math.PI/2,0,0]);}
    const actGeo=new T.CylinderGeometry(.045,.045,1,12);
    const actL=mesh(wingbox,actGeo,M.steel,[0,0,0]),actR=mesh(wingbox,actGeo,M.steel,[0,0,0]);
    actL.name='sweep-actuator-L';actR.name='sweep-actuator-R';

    const gloves=P('gloves','Sabit Kanat Eldivenleri (Wing Glove)','Kanat Mekanizması','Gövde ile pivot arasındaki sabit yüksek ok açılı kök bölge. F-14D standardında erken F-14A’daki küçük ön kanatçıklar (glove vane) bulunmaz; arka yarıkta şişirilebilir sızdırmazlık yastıkları yer alır.',[0,.75,0],true);
    for(const s of [-1,1]){
      mesh(gloves,wingGeometry([[1.02,2.85,-2.35,.15,PY],[2.05,1.45,-2.10,.13,PY],[2.86,.45,-1.75,.11,PY]],s),darkGrey);
      box(gloves,[.95,.05,.48],[s*2.25,PY+.09,-1.75],M.rubber,[0,s*.22,0]);
    }

    // Dış kanat istasyonları (pivot yerel çerçevesinde, Λ = 20° referans konumu):
    // u = 0..7,02 m; hücum kenarı LE0 - u*tan(20°) = 0,38 - 0,36397*u -> tam 20,00° hücum kenarı ok açısı!
    const wingStations=[
      [0.00, LE0, -1.62, .090, 0],
      [2.20, LE0-2.20*TAN20, -2.02, .072, 0],
      [4.80, LE0-4.80*TAN20, -2.50, .052, 0],
      [U_TIP, LE0-U_TIP*TAN20, -2.92, .035, 0]
    ];
    const wingLPart=P('wingL','Sol Değişken Ok Açılı Dış Kanat','Kanat Mekanizması','Sol pivot etrafında 20° (düşük hız / kalkış-iniş), 68° (süpersonik uçuş) ve yalnız yerdeyken 75° (uçak gemisi güverte parkı) konumlarına döner.',[1.6,.35,0],false,[PX,PY,PZ]);
    const pivotL=G(wingLPart,[0,0,0],'pivot-L');
    mesh(pivotL,wingGeometry(wingStations,1),M.paint);
    const lugL=G(pivotL,[.55,0,-.85],'wing-lug-L');

    const wingRPart=P('wingR','Sağ Değişken Ok Açılı Dış Kanat','Kanat Mekanizması','Sol kanatla birebir eşit ve zıt açıyla dönerek simetrik taşıma üretir; ok açısı arttıkça yarı açıklık 9,77 m’den 5,83 m’ye (uçuşta) ve 4,99 m’ye (parkta) iner.',[-1.6,.35,0],false,[-PX,PY,PZ]);
    const pivotR=G(wingRPart,[0,0,0],'pivot-R');
    mesh(pivotR,wingGeometry(wingStations,-1),M.paint);
    const lugR=G(pivotR,[-.55,0,-.85],'wing-lug-R');

    const highlift=P('highlift','Hücum Kenarı Slatları ve Firar Kenarı Flapları','Kanat Mekanizması','Düşük ok açısında (20°–25°) taşıma katsayısını artırmak için sarkan hücum kenarı slatları ve firar kenarı flapları; kanat geriye süpürüldükçe kapanır.',[0,.55,-.35]);
    const hlPivotL=G(highlift,[PX,PY,PZ],'hl-pivot-L'),hlPivotR=G(highlift,[-PX,PY,PZ],'hl-pivot-R');
    const slatAngle=Math.atan(TAN20),flapAngle=Math.atan((2.92-1.62)/U_TIP);
    const slatL=G(hlPivotL,[3.60,0,LE0-3.60*TAN20+.04],'slat-L'),slatR=G(hlPivotR,[-3.60,0,LE0-3.60*TAN20+.04],'slat-R');
    box(slatL,[5.80,.035,.22],[0,0,0],darkGrey,[0,slatAngle,0]);box(slatR,[5.80,.035,.22],[0,0,0],darkGrey,[0,-slatAngle,0]);
    const flapL=G(hlPivotL,[3.40,0,-2.25],'flap-L'),flapR=G(hlPivotR,[-3.40,0,-2.25],'flap-R');
    box(flapL,[5.60,.035,.34],[0,0,0],darkGrey,[0,flapAngle,0]);box(flapR,[5.60,.035,.34],[0,0,0],darkGrey,[0,-flapAngle,0]);

    // ------------------------------------------------------------- İTKİ: HAVA ALIKLARI, RAMPALAR, F110 MOTORLARI ve LÜLELER
    const intakes=P('intakes','İkiz Süpersonik Hava Alığı Naselleri','İtki','Kanat eldivenlerinin altına yerleştirilmiş, birbirinden ayrık iki dikdörtgen hava alığı ve motor naseli.',[0,-.55,.3],true);
    for(const s of [-1,1]){
      box(intakes,[1.02,.86,10.60],[s*1.38,1.56,-2.70],M.paint);
      // Kama biçimli süpersonik giriş dudağı (üst dudak önde)
      box(intakes,[1.04,.06,.65],[s*1.38,1.98,2.92],darkGrey,[.08,0,0]);
      box(intakes,[.06,.86,.55],[s*1.88,1.56,2.82],darkGrey);box(intakes,[.06,.86,.55],[s*.88,1.56,2.82],darkGrey);
      box(intakes,[1.04,.06,.35],[s*1.38,1.15,2.72],darkGrey);
    }

    const ramps=P('ramps','Değişken Eğimli Süpersonik Hava Alığı Rampaları','İtki','Mach 1,0 üzerinde üst tavandan aşağı inerek eğik şok dalgaları oluşturan ve havayı kompresör önünde ses altına yavaşlatan hareketli rampalar.',[0,-.35,.9]);
    const rampL=G(ramps,[1.38,1.95,2.85],'intake-ramp-L'),rampR=G(ramps,[-1.38,1.95,2.85],'intake-ramp-R');
    for(const rp of [rampL,rampR]){box(rp,[.92,.04,1.35],[0,-.02,-.68],tiMat);box(rp,[.88,.03,.85],[0,-.04,-1.72],M.steel);}

    const engines=P('engines','İkiz GE F110-GE-400 Turbofan Motorları','İtki','F-14D standardında TF30 yerine kullanılan yüksek itkili turbofan motorlar. X-Ray modunda kompresör fanları ve titanyum motor gövdeleri görülür; itki kolu %0 iken fanlar tamamen durur.',[0,-.75,-.4]);
    const fanL=G(engines,[1.38,1.56,.45],'fan-L'),fanR=G(engines,[-1.38,1.56,.45],'fan-R');
    for(const [s,fn] of [[1,fanL],[-1,fanR]]){
      cyl(engines,.44,7.60,[s*1.38,1.56,-3.65],tiMat,'z');
      ring(engines,.45,[s*1.38,1.56,-1.20],M.dark,.025);ring(engines,.45,[s*1.38,1.56,-4.40],M.dark,.025);
      cyl(fn,.12,.22,[0,0,.08],M.dark,'z',.04);
      const blades=Array.from({length:18},(_,i)=>{const a=i*Math.PI*2/18;return {pos:[Math.cos(a)*.23,Math.sin(a)*.23,0],rot:[0,.35,a]};});
      instances(fn,new T.BoxGeometry(.04,.30,.012),tiMat,blades);
    }

    const nozzles=P('nozzles','Değişken Kesitli Art Yakıcı Lüleleri','İtki','Her motorda çevresel yapraklardan oluşan yakınsak-ıraksak lüle; art yakıcı (%92+ itki) devreye girdiğinde yapraklar açılır ve şok halkalı alev konisi belirir.',[0,-.4,-1.2]);
    const petalsL=[],petalsR=[],abMat=new T.MeshBasicMaterial({color:0xe88432,transparent:true,opacity:.72,depthWrite:false});
    const abCoreMat=new T.MeshBasicMaterial({color:0x8ecae6,transparent:true,opacity:.65,depthWrite:false});
    const flameL=new T.Group(),flameR=new T.Group();flameL.name='ab-flame-L';flameR.name='ab-flame-R';
    for(const [s,arr,fl] of [[1,petalsL,flameL],[-1,petalsR,flameR]]){
      cyl(nozzles,.45,.65,[s*1.38,1.56,-7.75],nozzleMat,'z',.43);
      const ringGrp=G(nozzles,[s*1.38,1.56,-8.08],s>0?'nozzle-L':'nozzle-R');
      for(let i=0;i<12;i++){
        const a=i*Math.PI*2/12,piv=G(ringGrp,[Math.cos(a)*.42,Math.sin(a)*.42,0]);piv.rotation.z=a;
        const leaf=G(piv,[0,0,0]);box(leaf,[.03,.21,.78],[0,0,-.39],nozzleMat);arr.push(leaf);
      }
      fl.position.set(s*1.38,1.56,-8.85);
      const c1=new T.Mesh(new T.ConeGeometry(.34,2.4,14,1,true),abMat);c1.rotation.x=-Math.PI/2;c1.position.z=-1.2;fl.add(c1);
      const c2=new T.Mesh(new T.ConeGeometry(.20,1.5,12),abCoreMat);c2.rotation.x=-Math.PI/2;c2.position.z=-.75;fl.add(c2);
      nozzles.add(fl);
    }

    // ------------------------------------------------------------- KUYRUK: ÇİFT DİKEY STABİLİZE, STABİLATÖRLER ve YAKALAMA KANCASI
    const tails=P('tails','Dışa Eğimli Çift Dikey Stabilize ve Yakalama Kancası','Kuyruk','Motor nasellerinin üstünde dışa ~5° eğimli çift dikey kuyruk, alt karın yüzgeçleri ve uçak gemisi güverte yakalama kancası.',[0,1.0,-1.0]);
    for(const s of [-1,1]){
      const fin=G(tails,[s*1.48,1.98,0],s>0?'fin-L':'fin-R');fin.rotation.z=-s*5*Math.PI/180;
      const finSt=[[0,-5.35,-8.55,.065,0],[1.45,-6.25,-8.75,.048,0],[2.82,-7.20,-8.90,.032,0]].map(([v,zLE,zTE,th])=>[v,zLE,zTE,th,0]);
      // Dikey stabilizeyi Y boyunca yükseltmek için X->Y dönüşümü
      const fg=wingGeometry(finSt,1);fg.rotateZ(Math.PI/2);mesh(fin,fg,M.paint);
      box(tails,[.05,.42,1.85],[s*1.48,1.02,-7.20],darkGrey,[0,0,s*.15]);
    }
    box(tails,[.08,.08,1.85],[0,1.58,-8.45],M.dark,[.12,0,0]);box(tails,[.16,.10,.18],[0,1.46,-9.35],M.steel);

    const stabs=P('stabs','Tam Hareketli Yatay Stabilatörler','Kuyruk','Yunuslama ve yalpa kontrolü için diferansiyel çalışabilen tam hareketli yatay kuyruk yüzeyleri. y = 1,62 m kotunda yer aldığından, 68° ve 75° ok açısında dış kanatlar stabilatörlerin ~0,39 m üstünden temassız geçer.',[0,-.25,-1.1]);
    const stabSt=[[0,-6.05,-8.45,.055,0],[1.65,-6.95,-8.75,.042,0],[3.15,-7.95,-9.02,.026,0]];
    const stabL=G(stabs,[1.82,1.62,0],'stab-L'),stabR=G(stabs,[-1.82,1.62,0],'stab-R');
    mesh(stabL,wingGeometry(stabSt,1),darkGrey);mesh(stabR,wingGeometry(stabSt,-1),darkGrey);

    // ------------------------------------------------------------- İNİŞ TAKIMLARI (Mach = 0 iken y = 0,000 m zemine basar)
    const gearNose=P('gearNose','Çift Tekerlekli Burun İniş Takımı ve Katapult Çubuğu','İniş Takımı','Uçak gemisi katapult mekiğine kilitlenen fırlatma çubuğu (launch bar) ve çift tekerlekli dikme. Mach > 0 olduğunda yuvasına katlanır.',[0,-.8,.8]);
    const noseStrut=G(gearNose,[0,1.52,5.65],'nose-gear-strut');
    cyl(noseStrut,.065,1.18,[0,-.59,0],M.white);cyl(noseStrut,.045,.75,[0,-.75,.38],M.steel,undefined,.035);
    noseStrut.children[1].rotation.x=-.48; // katapult çubuğu
    for(const s of [-1,1]){cyl(noseStrut,.34,.14,[s*.17,-1.18,0],M.rubber,'x');cyl(noseStrut,.17,.15,[s*.17,-1.18,0],M.white,'x');}

    const gearMain=P('gearMain','Ana İniş Takımı Dikmeleri ve Tekerlekleri','İniş Takımı','Kanat eldivenlerinin altından inen geniş izli ana dikmeler; zemin düzlemine (y = 0) tam oturur ve uçuş Mach değerinde içeri katlanır.',[0,-.8,-.2]);
    const mainL=G(gearMain,[2.08,1.58,-.85],'main-gear-L'),mainR=G(gearMain,[-2.08,1.58,-.85],'main-gear-R');
    for(const [s,mg] of [[1,mainL],[-1,mainR]]){
      cyl(mg,.08,1.10,[0,-.55,0],M.white);box(mg,[.06,.95,.42],[s*.14,-.48,.12],M.paint);
      cyl(mg,.48,.22,[s*.12,-1.10,0],M.rubber,'x');cyl(mg,.24,.23,[s*.12,-1.10,0],M.white,'x');
    }

    // ------------------------------------------------------------- 6 × AIM-54 PHOENIX PALET ve PİLON YÜKÜ
    const phoenix=P('phoenix','6 × AIM-54 Phoenix Uzun Menzilli Füze Yükü','Silah Yükü','Gövde tünelindeki dört konformal palet ve kanat eldiveni altındaki iki pilonda toplam 6 adet AIM-54 Phoenix. Ateşleme tuşu her basışta bir füzeyi güvenli düşüşten sonra ileri fırlatır.',[0,-.95,.2]);
    const slots=[
      [-.52,1.38,2.15],[.52,1.38,2.15],
      [-.52,1.38,-1.55],[.52,1.38,-1.55],
      [-2.52,1.72,.35],[2.52,1.72,.35]
    ];
    for(const [x,y,z] of slots.slice(0,4))box(phoenix,[.36,.16,3.40],[x,y+.22,z],darkGrey);
    for(const s of [-1,1])box(phoenix,[.12,.32,1.65],[s*2.52,1.94,.35],darkGrey);
    const plumeMat=new T.MeshBasicMaterial({color:0xff9b3d,transparent:true,opacity:.85,depthWrite:false});
    const missiles=slots.map((pos,i)=>{
      const g=G(phoenix,pos,'phoenix-'+i);
      cyl(g,.19,3.30,[0,0,0],missileMat,'z');cyl(g,.01,.65,[0,0,1.975],radomeMat,'z',.19);
      for(const a of [0,Math.PI/2]){box(g,[.92,.02,.75],[0,0,-.65],missileMat,[0,0,a]);box(g,[.92,.02,.38],[0,0,-1.45],darkGrey,[0,0,a]);}
      const pl=new T.Mesh(new T.ConeGeometry(.16,1.1,10),plumeMat);pl.rotation.x=-Math.PI/2;pl.position.z=-2.20;pl.visible=false;pl.name='plume-'+i;g.add(pl);
      return {g,base:pos,pl,state:'rack',t:0};
    });

    // ------------------------------------------------------------- KİNEMATİK ve SENKRONİZASYON
    const lugWorldL=new T.Vector3(),lugWorldR=new T.Vector3(),anchL=new T.Vector3(1.95,PY,-1.02),anchR=new T.Vector3(-1.95,PY,-1.02);
    const autoSweepTarget=m=>20+48*T.MathUtils.clamp((m-.4)/1.0,0,1);
    const rampDeg=()=>S.mach<=1?0:14*T.MathUtils.clamp((S.mach-1)/1.2,0,1);
    const wingSpan=()=>{const a=(S.sweep-20)*Math.PI/180;return 2*(PX+U_TIP*Math.cos(a)+(LE0-U_TIP*TAN20)*Math.sin(a));};

    function sync() {
      if(S.mach>0&&S.sweep>68)S.sweep=68; // 75° park kilidi yalnız yerdeyken (Mach = 0) geçerlidir.
      const alpha=(S.sweep-20)*Math.PI/180;
      pivotL.rotation.y=alpha;pivotR.rotation.y=-alpha;
      hlPivotL.rotation.y=alpha;hlPivotR.rotation.y=-alpha;
      // Slat/flap sarkması: 20°'de açık, 28° üstünde kapalı.
      const droop=T.MathUtils.clamp((28-S.sweep)/8,0,1);
      slatL.position.y=slatR.position.y=-.045*droop;
      flapL.position.y=flapR.position.y=-.065*droop;
      // Hidrolik ok açısı pistonlarını gerçek pim noktaları arasında uzat.
      root.updateMatrixWorld(true);
      lugL.getWorldPosition(lugWorldL);wingbox.worldToLocal(lugWorldL);stretch(actL,anchL,lugWorldL);
      lugR.getWorldPosition(lugWorldR);wingbox.worldToLocal(lugWorldR);stretch(actR,anchR,lugWorldR);
      // Süpersonik hava alığı rampaları
      const rRad=rampDeg()*Math.PI/180;rampL.rotation.x=rRad;rampR.rotation.x=rRad;
      // Motor fanları ve art yakıcı lüle yaprakları
      fanL.rotation.z=S.fanAngle;fanR.rotation.z=-S.fanAngle;
      const ab=S.throttle>=92,openAmt=ab?.22:T.MathUtils.lerp(-.14,.04,S.throttle/92);
      petalsL.forEach(p=>p.rotation.x=openAmt);petalsR.forEach(p=>p.rotation.x=openAmt);
      flameL.visible=flameR.visible=ab;
      const pulse=1+.06*Math.sin(S.time*28);flameL.scale.set(1,1,pulse);flameR.scale.set(1,1,pulse);
      // Kanopi ve kuyruk hava freni
      canopyHinge.rotation.x=S.open?-.58:0;sbUp.rotation.x=S.open?.52:0;sbDn.rotation.x=S.open?-.52:0;
      // İniş takımı: Mach = 0 iken açık (y = 0), Mach > 0 iken katlı
      const airborne=S.mach>0;
      noseStrut.rotation.x=airborne?-1.48:0;noseStrut.visible=!airborne;
      mainL.rotation.z=airborne?-1.45:0;mainR.rotation.z=airborne?1.45:0;mainL.visible=mainR.visible=!airborne;
      // AIM-54 füzeleri
      missiles.forEach(m=>{
        if(m.state==='rack'){m.g.visible=true;m.g.position.set(...m.base);m.pl.visible=false;}
        else if(m.state==='fly'){
          m.g.visible=true;const drop=Math.min(.38,m.t*1.6),fwd=m.t>.22?(m.t-.22)*26:0;
          m.g.position.set(m.base[0],m.base[1]-drop,m.base[2]+fwd);m.pl.visible=m.t>.18;
        }else{m.g.visible=false;m.pl.visible=false;}
      });
    }

    function update(dt) {
      if(!Number.isFinite(dt))return;dt=T.MathUtils.clamp(dt,0,.05);S.time+=dt;
      if(S.throttle>0)S.fanAngle=(S.fanAngle+dt*(4+S.throttle*.38))%(Math.PI*2);
      if(S.autoSweep&&S.mach>0)S.sweep=autoSweepTarget(S.mach);
      missiles.forEach(m=>{if(m.state==='fly'){m.t+=dt;if(m.t>1.6)m.state='gone';}});
      sync();
    }

    const camPresets={
      iso:{pos:[16.5,9.5,15.5],look:[0,2.0,-.5]},
      front:{pos:[0,3.4,17.5],look:[0,1.9,1.0]},
      breech:{pos:[6.8,5.8,3.2],look:[1.4,2.1,-.5]},
      engine:{pos:[5.5,3.2,-13.8],look:[0,1.8,-6.5]},
      suspension:{pos:[4.8,1.4,4.8],look:[0,1.4,.5]},
      top:{pos:[0,29.5,-2.2],look:[0,2.0,-.5]}
    };
    const tourSteps=[
      ['Grumman F-14D(R) Tomcat','Uçak gemisi konuşlu önleme uçağı: düşük hızda geniş açıklıklı düz kanat (20°), süpersonik hızda düşük sürüklemeli ok açılı kanat (68°). Müze referansı Udvar-Hazy’deki F-14D(R) örneğidir.','iso',fuse,false],
      ['Titanyum Kanat Kutusu ve Pivotlar','X-Ray modunda gövde sırtındaki titanyum taşıyıcı kutuyu, iki küresel pivotu ve kanat açıldıkça uzayıp kısalan hidrolik pistonları inceleyin.','breech',wingbox,true],
      ['20° / 68° Uçuş ve 75° Güverte Parkı','Üstten görünüşte ok açısını 20°’den 68°’e ve yerdeyken (Mach 0) 75° park konumuna alın: kanatlar yatay stabilatörlerin ~39 cm üstünden temassız geçer.','top',wingLPart,false],
      ['Süpersonik Hava Alığı Rampaları','Mach değerini 1,0 üzerine çıkarın: hava alığı tavanındaki rampalar eğilerek havayı F110 kompresör fanı önünde yavaşlatır.','front',ramps,true],
      ['GE F110 Motorları ve Art Yakıcı','İtki kolunu %92 üzerine taşıyın: değişken kesitli lüle yaprakları açılır ve art yakıcı alev konisi belirir; %0’da fanlar durur.','engine',nozzles,false],
      ['6 × AIM-54 Phoenix Yükü','Gövde tünelindeki dört palet ve eldiven pilonlarındaki iki AIM-54 füzesi. Ateşleme tuşuyla füzeleri tek tek ayırın.','suspension',phoenix,false]
    ].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));

    const ui=K.ui({portraitCameraScale:1.55,shadowExtent:14,fog:{near:75,far:165},
      title:'Grumman F-14 Tomcat — Değişken Ok Açılı Kanat',
      sub:'20°–68° senkron kanat • 75° yerde park • İkiz F110 ve 6 × AIM-54',
      subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#6f8796'})),
      camLabels:{iso:'Genel',front:'Burun ve Alıklar',breech:'Kanat Pivotu',engine:'Lüleler ve Kuyruk',suspension:'Alt Gövde ve AIM-54',top:'Üst (Planform)'},
      sliders:[
        {label:'Kanat Ok Açısı',min:20,max:75,step:1,fmt:v=>Math.round(v)+'°'+(v>68?' (Park)':'')},
        {label:'Uçuş Mach Değeri',min:0,max:2.2,step:.1,fmt:v=>v===0?'0,0 (Yerde)':'Mach '+v.toFixed(1)},
        {label:'Motor İtki Kolu',min:0,max:100,step:1,fmt:v=>Math.round(v)+'%'+(v>=92?' (AB)':'')}
      ],
      buttons:{terrain:'Otomatik Kanat Programı (Temsili)',sweep:'Kanopi ve Hava Freni'},
      telemetryTag:'F-14D(R) • YAKLAŞIK KANAT GEOMETRİSİ',
      statLabels:['KANAT AÇIKLIĞI','KANAT OK AÇISI','HAVA ALIĞI RAMPASI','AIM-54 YÜKÜ']});

    sync();
    return {root,parts:K.parts,ui,camPresets,tourSteps,defaultPart:wingbox,firePart:phoenix,update,
      kinematics:{wingSpan,rampDeg,autoSweepTarget,state:S},
      onFire:()=>{
        if(S.ammo<=0){missiles.forEach(m=>{m.state='rack';m.t=0;});S.ammo=6;sync();return {ok:true,refill:true,msg:'6 × AIM-54 yeniden yüklendi.'};}
        const next=missiles.find(m=>m.state==='rack');if(!next)return {ok:false};
        next.state='fly';next.t=0;S.ammo--;sync();return {ok:true,msg:`AIM-54 ayrıldı (${S.ammo}/6 kaldı).`};
      },
      fireButtonLabel:()=>S.ammo>0?`AIM-54 AYIR (${S.ammo}/6)`:'6 × AIM-54 YÜKLE (İKMAL)',
      mobileFireButtonLabel:()=>S.ammo>0?`AIM-54 (${S.ammo})`:'İkmal',
      onSlider:(i,v)=>{
        if(!Number.isFinite(v))return {};
        if(i===0){S.autoSweep=false;const maxSw=S.mach>0?68:75;S.sweep=T.MathUtils.clamp(v,20,maxSw);}
        if(i===1){S.mach=Math.round(T.MathUtils.clamp(v,0,2.2)*10)/10;if(S.mach>0&&S.sweep>68)S.sweep=68;if(S.autoSweep&&S.mach>0)S.sweep=autoSweepTarget(S.mach);}
        if(i===2)S.throttle=T.MathUtils.clamp(Math.round(v),0,100);
        sync();return {};
      },
      onButton:n=>{
        if(n==='terrain'){S.autoSweep=!S.autoSweep;if(S.autoSweep&&S.mach>0)S.sweep=autoSweepTarget(S.mach);}
        if(n==='sweep')S.open=!S.open;
        sync();return {};
      },
      buttonActive:n=>n==='terrain'?S.autoSweep:n==='sweep'?S.open:false,
      getSliderValues:()=>[S.sweep,S.mach,S.throttle],
      getStats:()=>[wingSpan().toFixed(2)+' <span>m</span>',Math.round(S.sweep)+' <span>°'+(S.sweep>68?' park':'')+'</span>',rampDeg().toFixed(1)+' <span>°</span>',S.ammo+' <span>/ 6 adet</span>'],
      getStatus:()=>({text:S.mach===0?(S.sweep>68?'GÜVERTE PARK KONUMU (75°)':'YERDE • İNİŞ TAKIMI AÇIK'):(S.throttle>=92?'UÇUŞTA • ART YAKICI AÇIK':'UÇUŞTA • '+(S.autoSweep?'OTOMATİK KANAT':'MANUEL KANAT')),color:S.throttle>=92?'#b4532a':'#6f8796'}),
      applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
  };
})();
