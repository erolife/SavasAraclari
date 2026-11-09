/* Fa 330: museum reconstruction, not a flight or submarine operating simulator. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.fa330 = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'fa330');
    const {T, root, parts, mats:M, mesh, box, cyl, ring, pipe, instances} = K;
    const S = {pose:35, speed:25, tilt:0, running:false, auto:false, time:0, covers:false};
    const counts = {}; let number = 0;
    M.paint.color.setHex(0x71928b); M.paint.metalness = .25;
    const naval = M.steel.clone(); naval.color.setHex(0x4c585d); naval.roughness=.82;
    const canvas = M.wood.clone(); canvas.color.setHex(0xa58d62);
    const pale = M.white.clone(); pale.userData.paint=false;
    function G(parent, pos, name) {const g=new T.Group();g.position.set(...pos);g.name=name;parent.add(g);return g;}
    function P(key,name,sub,desc,exp=[0,.5,0],outer=false,parent=root) {
      counts[sub]=(counts[sub]||0)+1;
      const p=K.part(key,++number+'. '+name,sub,[0,0,0],exp,desc,outer,parent);
      p.userData.spec='Yaklaşık müze rekonstrüksiyonu; sergi hareketi uçuş hesabı değildir.';
      p.userData.material='Boyalı metal, ahşap, deri ve dokuma';return p;
    }
    function tube(p,a,b,r=.025,mat=M.paint) {
      const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);
      const o=cyl(p,r,d.length(),av.add(bv).multiplyScalar(.5).toArray(),mat);
      o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;
    }
    function wheel(p,r,pos) {const g=G(p,pos,'handwheel');ring(g,r,[0,0,0],M.dark,.018);
      for(let i=0;i<4;i++){const a=i*Math.PI/2;tube(g,[0,0,0],[r*Math.cos(a),r*Math.sin(a),0],.012,M.steel);}return g;}
    // A short, explicitly interpretive submarine deck section; no specific boat attribution.
    const hull=P('hull','Denizaltı Gövde Kesiti','Güverte','Type IXD2 kullanım bağlamını anlatan kısa güverte rekonstrüksiyonu. Tam denizaltı veya belirli bir teknenin ölçülü kopyası değildir.',[0,-.25,0],true);
    const verts=[],indices=[],N=48,L=24;
    for(let j=0;j<=L;j++){const z=-6+j/2,f=1-.2*Math.pow(z/6,4);for(let i=0;i<=N;i++){const a=i*2*Math.PI/N;verts.push(2.2*f*Math.cos(a),.59+.51*Math.sin(a),z);}}
    for(let j=0;j<L;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i;indices.push(a,a+1,a+N+1,a+1,a+N+2,a+N+1);}
    const hg=new T.BufferGeometry();hg.setAttribute('position',new T.Float32BufferAttribute(verts,3));hg.setIndex(indices);hg.computeVertexNormals();mesh(hull,hg,naval);
    const frames=P('frames','Gövde Postaları ve Kemereler','Güverte','Kesit uçlarında ve X-Ray görünümünde taşıyıcı postalar. İç yerleşim gösterilmez.',[0,.1,0]);
    for(const z of [-6,-4,-2,0,2,4,6]){const pts=[];for(let i=0;i<=48;i++){const a=i*Math.PI/24;pts.push([2.15*(1-.2*Math.pow(z/6,4))*Math.cos(a),.59+.48*Math.sin(a),z]);}pipe(frames,pts,.035,M.dark);tube(frames,[-1.8,1.03,z],[1.8,1.03,z],.035,naval);}
    const deck=P('deck','Ahşap Güverte ve Drenaj','Güverte','Koyu ahşap kaplama, metal kenar şeritleri ve drenaj açıklıkları. Ayrıntıların yerleşimi temsili.',[0,.4,0],true);
    const planks=[];for(let x=-1.62;x<1.7;x+=.18)for(let z=-5.2;z<6;z+=1.6)planks.push({pos:[x,1.125,z],scale:[1,1,1]});
    instances(deck,new T.BoxGeometry(.165,.05,1.57),M.wood,planks);
    for(const x of [-1.76,1.76])box(deck,[.08,.06,12],[x,1.12,0],naval);
    const slots=[];for(const s of [-1,1])for(let z=-5.5;z<=5.5;z+=.35)slots.push({pos:[s*(2.12-.36*Math.pow(z/6,4)),.83,z],rot:[0,0,0]});
    instances(deck,new T.BoxGeometry(.028,.105,.21),M.dark,slots);
    const tower=P('tower','Kısmi Kule ve Gözetleme Mahalli','Güverte','Kulenin yalnızca sergiye bakan bölümü modellenir. Bu sahne U-505 veya başka bir teknenin Fa 330 taşıdığını iddia etmez.',[0,.4,1],true);
    const towerBody=cyl(tower,1,1.85,[0,2.07,4.5],naval);towerBody.scale.set(.8,1,1.25);
    const towerRim=ring(tower,1,[0,3.02,4.5],M.dark,.06,[Math.PI/2,0,0]);towerRim.scale.set(.83,1.25,1);
    const rimFloor=cyl(tower,.94,.06,[0,2.92,4.5],M.dark);rimFloor.scale.set(.8,1,1.25);
    const fittings=P('fittings','Kule Donanımı ve Güverte Bağları','Güverte','Merdiven, kısa periskop başı, menhol ve bağlama babaları. Sahne bağlamı için yaklaşık dış ayrıntılar.',[.4,.3,.4]);
    tube(fittings,[.35,2.95,4.8],[.35,4.05,4.8],.065,naval);pipe(fittings,[[.35,4.05,4.8],[.35,4.18,4.8],[.35,4.18,4.55]],.065,naval);
    for(const x of [-.25,.25])tube(fittings,[x,1.17,3.20],[x,2.9,3.20],.025,naval);
    for(let y=1.3;y<2.9;y+=.22)tube(fittings,[-.25,y,3.2],[.25,y,3.2],.018,M.steel);
    cyl(fittings,.38,.10,[1.05,1.22,2.7],naval);wheel(fittings,.17,[1.05,1.29,2.7]).rotation.x=Math.PI/2;
    for(const x of [-1.4,1.4])for(const z of [-5,5]){box(fittings,[.4,.06,.35],[x,1.18,z],naval);for(const dx of [-.12,.12]){cyl(fittings,.06,.25,[x+dx,1.32,z],naval);cyl(fittings,.09,.035,[x+dx,1.46,z],M.dark);}}
    const containers=P('containers','Sökülü Parça Saklama Tüpleri','Güverte','Sökülebilen aracın denizaltıda saklanmasını anlatan iki temsili kap. Boyut ve konumları arşiv planı değildir.',[.6,.3,.3]);
    const tubeWall=naval.clone();tubeWall.side=T.DoubleSide;
    const lids=[];for(const x of [-1.25,1.25]){mesh(containers,new T.CylinderGeometry(.24,.24,2,32,1,true),tubeWall,[x,1.47,3.85],[Math.PI/2,0,0]);ring(containers,.23,[x,1.47,2.85],M.steel,.015);cyl(containers,.24,.035,[x,1.47,4.85],naval,'z');for(const z of [3.1,4.6]){box(containers,[.54,.12,.15],[x,1.2,z],M.dark);ring(containers,.25,[x,1.47,z],M.steel,.018);}const lid=G(containers,[x-.24,1.47,2.83],'storage-lid');cyl(lid,.24,.055,[.24,0,0],naval,'z');wheel(lid,.10,[.24,0,-.045]);lids.push(lid);}
    const winch=P('winch','Çekme Vinci ve Yataklar','Çekme','Güvertedeki vinç çelik çekme kablosunu toplar. Gövde ve yatakların dış görünüşü yorumdur; bir imalat planı değildir.',[-.5,.3,0]);
    box(winch,[1.2,.10,.85],[0,1.20,1.5],naval);
    for(const x of [-.48,.48]){box(winch,[.10,.6,.6],[x,1.53,1.5],naval);cyl(winch,.12,.16,[x,1.65,1.5],M.steel,'x');}
    const drum=G(winch,[0,1.65,1.5],'tow-drum');cyl(drum,.25,.82,[0,0,0],M.dark,'x');
    for(const x of [-.4,.4])cyl(drum,.36,.045,[x,0,0],naval,'x');
    const windings=[];for(let x=-.36;x<=.36;x+=.032)windings.push({pos:[x,0,0],rot:[0,Math.PI/2,0]});instances(drum,new T.TorusGeometry(.27,.013,6,36),M.steel,windings);
    box(drum,[.06,.035,.12],[0,.282,0],M.brass);
    const brake=P('brake','Vinç Freni ve El Çarkı','Çekme','Fren kolu ve koruyucu kapak. Çark dönüşü yalnızca kablo hareketini görünür kılan sergi animasyonudur.',[-.6,.3,0]);
    cyl(brake,.25,.15,[-.65,1.65,1.5],naval,'x');const crank=G(brake,[-.77,1.65,1.5],'winch-crank');crank.rotation.y=Math.PI/2;wheel(crank,.23,[0,0,0]);cyl(crank,.025,.13,[.20,0,.07],M.wood,'z');
    tube(brake,[.55,1.35,1.75],[.72,1.95,1.65],.025,M.steel);cyl(brake,.035,.16,[.72,1.99,1.65],M.rubber);
    const guide=P('guide','Makara ve Kablo Kılavuzu','Çekme','Tamburdan çıkan kablo kılavuzdan geçerek gözlem aracına uzanır. Gösterilen kısa hat gerçek uçuş mesafesi değildir.',[0,.3,0]);
    for(const x of [-.14,.14])tube(guide,[x,1.16,.85],[x,1.58,.85],.03,naval);
    cyl(guide,.12,.22,[0,1.58,.85],M.dark,'x');ring(guide,.12,[-.12,1.58,.85],M.steel,.015,[0,Math.PI/2,0]);
    const cable=P('cable','Çekme Kablosu ve Telefon Hattı','Çekme','Çelik hat aracı denizaltıya bağlar; gözlemci telefonla haberleşir. İkinci ince çizgi telefon bağlantısının eğitim vurgusudur, kablo kesitinin birebir modeli değildir.',[0,0,0]);
    pipe(cable,[[0,1.91,1.5],[0,1.85,1.15],[0,1.70,.85]],.015,M.steel);
    // Reuse cylinders: no new geometry is allocated while the cable moves.
    const segments=[],telephone=[];for(let i=0;i<32;i++){segments.push(cyl(cable,.014,1,[0,0,0],M.steel));telephone.push(cyl(cable,.007,1,[0,0,0],canvas));}
    const craft=G(root,[0,2.2,-3.4],'aircraft-pose');
    const chassis=P('chassis','Açık Boru İskeleti','Hava Aracı','Müze fotoğrafındaki açık iskelet, kuyruk kolu ve çapraz bağlantılar. Kapalı bir motor gövdesi yoktur.',[.3,.2,0],false,craft);
    tube(chassis,[0,.25,1.35],[0,.45,-2.7],.047);
    for(const s of [-1,1]){tube(chassis,[s*.42,.12,.75],[s*.25,.50,-.6],.025);tube(chassis,[s*.42,.12,-.75],[s*.25,.50,-.6],.025);tube(chassis,[s*.25,.50,-.6],[0,.58,-2.7],.022);tube(chassis,[s*.25,.5,.15],[0,.25,1.35],.025);}
    const skids=P('skids','Çift Kızak ve Çapraz Bağlar','Hava Aracı','İki kızak açık iskeleti güvertede taşır. Sergi konumu sıfırdayken kızakların altı güverteye oturur.',[0,-.2,0],false,craft);
    for(const x of [-.45,.45])pipe(skids,[[x,.18,1.15],[x,.045,.9],[x,.035,0],[x,.045,-.9],[x,.12,-1.05]],.035);
    for(const z of [-.65,.65])tube(skids,[-.45,.095,z],[.45,.095,z],.028);
    // Catmull-Rom bends dip slightly below their control points: seat the actual tube surface.
    root.updateMatrixWorld(true);
    const skidFloor=new T.Box3().setFromObject(skids).min.y-craft.getWorldPosition(new T.Vector3()).y;
    skids.children.forEach(o=>{o.position.y-=skidFloor;});
    const mast=P('mast','Rotor Direği ve Destekler','Hava Aracı','Rotor başını taşıyan eğimli direk. Görünen kovanlar ve bağlantı başları fotoğraf yorumudur.',[0,.5,0],false,craft);
    tube(mast,[0,.40,-.58],[0,1.66,-.55],.065);
    for(const s of [-1,1])tube(mast,[s*.32,.18,-.65],[0,1.3,-.56],.018);
    for(const y of [.65,1.05,1.45])cyl(mast,.078,.07,[0,y,-.58+(y-.4)*.0238],M.steel);
    const seat=P('seat','Koltuk ve Sırtlık','Gözlemci','Açık tek kişilik koltuk; minder ve arka metal taşıyıcı ayrı katmanlardır.',[.4,.3,0],false,craft);
    for(const x of [-.25,.25]){tube(seat,[x,.13,-.35],[x,.47,-.35],.025);tube(seat,[x,.13,.2],[x,.47,.2],.025);tube(seat,[x,.48,-.35],[x,1.03,-.42],.02);}
    box(seat,[.55,.06,.6],[0,.48,-.04],M.paint);box(seat,[.49,.075,.53],[0,.54,-.02],M.rubber);
    box(seat,[.54,.52,.05],[0,.80,-.40],M.paint,[.12,0,0]);box(seat,[.47,.47,.07],[0,.80,-.36],M.rubber,[.12,0,0]);
    const harness=P('harness','Dokuma Kemerler ve Toka','Gözlemci','İki omuz kayışı ve bel kemeri, açık koltuğun ayrıntılarını gösterir.',[.4,.3,.2],false,craft);
    for(const x of [-.14,.14]){box(harness,[.055,.48,.015],[x,.80,-.31],canvas,[.12,0,0]);box(harness,[.055,.014,.39],[x,.59,-.05],canvas);}
    box(harness,[.48,.015,.065],[0,.59,.12],canvas);box(harness,[.10,.025,.075],[0,.61,.12],M.brass);
    const controls=P('controls','Kumanda Kolu ve Ayak Dayanakları','Gözlemci','Öndeki kumanda kolu, ayak dayanakları ve başa uzanan ince bağlantılar. Uçuş kumanda hesabı yapılmaz.',[0,.2,.5],false,craft);
    tube(controls,[0,.28,.4],[0,.91,.48],.026);cyl(controls,.038,.18,[0,.87,.48],M.rubber);
    for(const x of [-.29,.29]){tube(controls,[0,.28,1.1],[x,.32,1.1],.025);tube(controls,[x,.32,1.1],[x,.46,1.14],.023);tube(controls,[x-.10,.46,1.14],[x+.10,.46,1.14],.027,M.dark);}
    tube(controls,[.07,.30,.4],[.07,1.58,-.51],.009,M.steel);
    const phone=P('phone','Telefon Donanımı ve Gösterge','Gözlemci','Telefon bağlantısı tarihsel kayıtlarda doğrulanır. Küçük kutu, ahize ve gösterge yerleşimi görsel yorumdur.',[-.3,.2,.3],false,craft);
    box(phone,[.26,.17,.11],[0,.38,1.22],M.dark,[.25,0,0]);cyl(phone,.056,.018,[-.06,.40,1.285],pale,'z');tube(phone,[-.06,.40,1.30],[-.04,.43,1.30],.004,M.dark);
    box(phone,[.11,.21,.15],[-.35,.59,-.15],naval);pipe(phone,[[-.44,.70,-.13],[-.46,.61,-.10],[-.44,.51,-.13]],.028,M.rubber);
    pipe(phone,[[-.44,.51,-.13],[-.4,.36,.2],[0,.25,1.25]],.009,M.dark);
    const towEye=P('towEye','Çekme Bağlantısı','Çekme','Burundaki hat bağlantısı; kablo ucu tüm sergi konumlarında bu noktayı izler.',[0,.1,.3],false,craft);
    ring(towEye,.055,[0,.25,1.35],M.steel,.014,[0,Math.PI/2,0]);
    const anchor=G(towEye,[0,.25,1.35],'tow-anchor');
    const tail=P('tail','Kuyruk Yüzeyleri','Hava Aracı','İnce yatay denge yüzeyi ve yuvarlatılmış dikey kuyruk; oranlar müze fotoğrafından yaklaşık alınmıştır.',[0,.3,-.5],true,craft);
    function panel(p,points,depth,pos,rot) {const shape=new T.Shape();shape.moveTo(...points[0]);for(const a of points.slice(1))shape.lineTo(...a);shape.closePath();return mesh(p,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.015,bevelSize:.035,bevelSegments:3,steps:1}),M.paint,pos,rot);}
    panel(tail,[[-1,0],[-.98,.35],[-.75,.50],[.75,.50],[.98,.35],[1,0]],.025,[0,.59,-2.95],[-Math.PI/2,0,0]);
    panel(tail,[[0,0],[0,.54],[-.12,.59],[-.3,.60],[-.52,.50],[-.65,.1]],.025,[-.015,.61,-2.48],[0,-Math.PI/2,0]);
    for(const s of [-1,1])tube(tail,[0,.46,-2.0],[s*.85,.59,-2.75],.009,M.steel);
    // Contemporary cross marking, without inventing a particular aircraft serial number.
    for(const s of [-1,1]){box(tail,[.008,.31,.12],[s*.038,1.02,-2.67],pale);box(tail,[.008,.12,.31],[s*.038,1.02,-2.67],pale);box(tail,[.009,.27,.065],[s*.044,1.02,-2.67],M.dark);box(tail,[.009,.065,.27],[s*.044,1.02,-2.67],M.dark);}
    const head=P('head','Rotor Başlığı ve Mafsallar','Rotor','Üç pala bağlantısı, serbest dönen göbek ve küçük kumanda bağlantıları. İç yatak ölçüleri temsili.',[0,.5,0],false,craft);
    const tilt=G(head,[0,1.72,-.55],'rotor-tilt');const rotor=G(tilt,[0,0,0],'free-rotor');
    cyl(tilt,.11,.12,[0,-.06,0],M.steel);ring(tilt,.15,[0,-.08,0],M.dark,.025,[Math.PI/2,0,0]);cyl(rotor,.15,.11,[0,.025,0],M.paint);
    for(let i=0;i<3;i++){const a=i*Math.PI*2/3,g=G(rotor,[0,0,0],'blade-root-'+i);g.rotation.y=a;tube(g,[.10,.04,0],[.42,.07,0],.046);cyl(g,.045,.14,[.26,.07,0],M.steel,'z');tube(g,[.10,.17,0],[.45,.09,-.08],.012,M.steel);box(g,[.13,.025,.19],[.37,.085,0],M.paint);}
    function bladeGeometry() {
      const v=[],ix=[],stations=[.39,.65,1.2,2.2,3.3,3.65],steps=16;
      stations.forEach((r,j)=>{const chord=j===0?.16:j===5?.18:.25;for(let k=0;k<=steps;k++){const a=k*Math.PI*2/steps;v.push(r,.06+.017*Math.sin(a)*(j===5?.5:1),Math.cos(a)*chord/2);}});
      for(let j=0;j<stations.length-1;j++)for(let k=0;k<steps;k++){const a=j*(steps+1)+k;ix.push(a,a+steps+1,a+1,a+1,a+steps+1,a+steps+2);}
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();return g;
    }
    const blades=P('blades','Üç Uzun Rotor Palası','Rotor','Yaklaşık 7,30 m çap; rotor motorla sürülmez. Animasyon hava akımıyla autorotasyon ilkesini anlatır, gerçek devir veya kaldırma kuvveti hesaplamaz.',[0,.45,0],false,rotor);
    const bladeGeo=bladeGeometry();for(let i=0;i<3;i++){const g=G(blades,[0,0,0],'blade-'+i);g.rotation.y=i*Math.PI*2/3;mesh(g,bladeGeo,M.paint);box(g,[.045,.022,.22],[3.43,.061,0],pale);tube(g,[.65,.058,.124],[3.3,.058,.124],.006,M.steel);}
    const fasteners=P('fasteners','Cıvatalar ve Emniyet Bağlantıları','Hava Aracı','Direk ve şasi bağlantılarında seçilmiş küçük ayrıntılar; söküm sırası veya montaj ölçüsü verilmez.',[.3,.2,0],false,craft);
    const bolts=[];for(const x of [-.07,.07])for(const y of [.45,.65,1.05,1.45])bolts.push({pos:[x,y,-.57],rot:[0,0,Math.PI/2]});for(const x of [-.45,.45])for(const z of [-.65,.65])bolts.push({pos:[x,.12,z]});instances(fasteners,new T.CylinderGeometry(.02,.02,.025,6),M.steel,bolts);
    const flow=P('flow','Hava Akımı Gösterimi','Eğitim','Turuncu oklar hava akımını vurgular. Güverte/uçuş arası hareket bir sergi düzenidir; irtifa, rüzgâr ve deniz koşulları hesaplanmaz.',[0,0,0],false,craft);
    const arrows=[];const flowMat=new T.MeshBasicMaterial({color:0xd89a43,transparent:true,opacity:.65,depthWrite:false});
    for(const x of [-1.2,1.2]){const g=G(flow,[x,1.1,1],'airflow-arrow');const shaft=new T.Mesh(new T.CylinderGeometry(.012,.012,.7,8),flowMat);shaft.rotation.x=-Math.PI/2;g.add(shaft);const tip=new T.Mesh(new T.ConeGeometry(.07,.18,10),flowMat);tip.rotation.x=-Math.PI/2;tip.position.z=-.43;g.add(tip);arrows.push(g);}
    const start=new T.Vector3(0,1.70,.85),end=new T.Vector3(),pointA=new T.Vector3(),pointB=new T.Vector3(),direction=new T.Vector3(),up=new T.Vector3(0,1,0);
    let lastPose=null;
    function cablePoint(t,out,offset=0) {out.lerpVectors(start,end,t);out.y-=.18*Math.sin(Math.PI*t);out.x+=offset;return out;}
    function sync() {
      craft.position.set(0,1.15+S.pose*.03,-2-S.pose*.04);
      tilt.rotation.x=S.tilt*Math.PI/180;
      // Track exploded transforms too, without allocating replacement geometries.
      root.updateMatrixWorld(true);anchor.getWorldPosition(end);cable.worldToLocal(end);
      // The cable part stays at its base origin, also in exploded view.
      for(let i=0;i<32;i++)for(const [list,offset] of [[segments,0],[telephone,.028]]) {
        cablePoint(i/32,pointA,offset);cablePoint((i+1)/32,pointB,offset);const o=list[i];o.position.copy(pointA).add(pointB).multiplyScalar(.5);direction.copy(pointB).sub(pointA);o.scale.y=direction.length();o.quaternion.setFromUnitVectors(up,direction.normalize());
      }
      if(lastPose!==null){const delta=(S.pose-lastPose)*.10;drum.rotation.x+=delta;crank.rotation.z+=delta;}lastPose=S.pose;
      lids.forEach(l=>{l.rotation.y=S.covers?-1.65:0;});
      arrows.forEach((g,i)=>{g.visible=S.running&&S.speed>0;g.position.z=1.4-((S.time*.6+i*.5)%1)*2;});
    }
    function update(dt) {
      if(!Number.isFinite(dt))return;dt=T.MathUtils.clamp(dt,0,.05);
      if(S.auto){S.phase=(S.phase||0)+dt*.22;S.pose=50-50*Math.cos(S.phase);}
      if(S.running&&S.speed>0){S.time+=dt*S.speed/25;rotor.rotation.y=(rotor.rotation.y+dt*S.speed*.04)%(Math.PI*2);}sync();
    }
    const camPresets={iso:{pos:[16,12,16],look:[0,2,-1.5]},front:{pos:[4,4,1],look:[0,2.9,-3.5]},breech:{pos:[-6,4.5,-9],look:[0,2.8,-4.8]},engine:{pos:[3,5,-.5],look:[0,3.5,-3.5]},suspension:{pos:[-4,3.7,3],look:[0,1.6,1.3]},top:{pos:[.1,20,-1.5],look:[0,1.5,-1.5]}};
    const tourSteps=[
      ['Denizaltının Uçan Gözcüsü','1942’de denenen motorsuz gözlem aracı. Denizaltının çektiği üç palalı rotor uçurtması; savaşın sonucunu değiştiren yaygın bir sistem değildi.','iso',chassis,false],
      ['Açık Koltuk','Kemerler, ayak dayanakları, kumanda kolu ve telefon kutusunu yakından inceleyin. Küçük donanım yerleşimleri fotoğraf yorumudur.','front',seat,false],
      ['Motor Olmadan Dönen Rotor','Rotor başı ve üç ayrı pala. Gösterimi başlatın; görsel hızı sıfıra indirdiğinizde dönüş de durur. Bu bir kaldırma kuvveti hesabı değildir.','engine',head,false],
      ['Kuyruk ve Boru İskelet','İnce kuyruk kolu, denge yüzeyleri ve çapraz destekler. X-Ray dış yüzeyleri saydamlaştırır.','breech',tail,true],
      ['Güvertedeki Vinç','Tambur, fren kolu, makara ve gözlemciye uzanan hat. Sergi konumunu değiştirerek kablo bağlantısını izleyin.','suspension',winch,false],
      ['Saklama ve Sınırlar','Kapakları açın. Güverte bölümü temsili; uçuş mesafesi ekrana sığacak kadar kısaltılmıştır. Kaynaklarda 220 m’ye varan irtifalar geçer, burada gerçek uçuş canlandırılmaz.','top',containers,false]
    ].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));
    const ui=K.ui({portraitCameraScale:1.8,shadowExtent:15,fog:{near:80,far:160},title:'Fa 330 — Denizaltının Uçan Gözcüsü',sub:'Motorsuz rotor uçurtması • 1942 • Kısaltılmış mesafeli sergi sahnesi',subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#71928b'})),camLabels:{iso:'Güverte ve Araç',front:'Gözlemci',breech:'Kuyruk',engine:'Rotor Başlığı',suspension:'Çekme Vinci',top:'Üst'},sliders:[{label:'Sergi Konumu (uçuş hesabı değil)',min:0,max:100,step:1,fmt:v=>Math.round(v)+'%'},{label:'Rotor Görsel Hızı',min:0,max:100,step:1,fmt:v=>Math.round(v)+'%'},{label:'Rotor Başı Eğimi (sergi)',min:-8,max:8,step:1,fmt:v=>v+'°'}],buttons:{terrain:'Sergi Hareketi',sweep:'Saklama Kapakları'},telemetryTag:'MOTORSUZ • TEMSİLİ SERGİ HAREKETİ',statLabels:['ROTOR ÇAPI','SERGİ KONUMU','GÖRSEL HIZ','TAHRİK']});
    sync();
    return {root,parts,ui,camPresets,tourSteps,defaultPart:chassis,firePart:head,update,
      onFire:()=>{S.running=!S.running;sync();return {ok:true};},fireButtonLabel:()=>S.running?'ROTOR GÖSTERİMİNİ DURDUR':'AUTOROTASYONU GÖSTER',mobileFireButtonLabel:()=>S.running?'Durdur':'Rotoru Göster',
      onSlider:(i,v)=>{if(!Number.isFinite(v))return {};S.auto=false;if(i===0)S.pose=T.MathUtils.clamp(v,0,100);if(i===1)S.speed=T.MathUtils.clamp(v,0,100);if(i===2)S.tilt=T.MathUtils.clamp(v,-8,8);sync();return {};},
      onButton:n=>{if(n==='terrain'){S.auto=!S.auto;S.phase=Math.acos(1-2*S.pose/100);}if(n==='sweep')S.covers=!S.covers;sync();return {};},buttonActive:n=>n==='terrain'?S.auto:n==='sweep'?S.covers:false,
      getSliderValues:()=>[S.pose,S.speed,S.tilt],getStats:()=>['~7,30 <span>m</span>',Math.round(S.pose)+' <span>% sergi</span>',(S.running?S.speed:0)+' <span>% animasyon</span>','YOK <span>motor yok</span>'],getStatus:()=>({text:S.running&&S.speed>0?'AUTOROTASYON • TEMSİLİ HAREKET':'MOTORSUZ GÖZLEM ARACI',color:'#71928b'}),applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
  };
})();
