(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.monitor = function (ctx) {
    const {THREE:T, scene, addCADMesh, createPartGroup} = ctx;
    const root = new T.Group(); root.visible = false; scene.add(root);
    const parts = {}, meshes = [], bolts = [];
    const S = {rpm:20, angle:0, port:100, auto:false, engine:true, phase:0, recoil:0, ammo:20, finish:'iron', relief:true};
    const iron = new T.MeshStandardMaterial({color:0x454d50, roughness:0.72, metalness:0.65});
    const brass = new T.MeshStandardMaterial({color:0xb68a43, roughness:0.45, metalness:0.7});
    const grainData=new Uint8Array(128*128*4);let grainSeed=719;
    for(let i=0;i<128*128;i++){grainSeed=(grainSeed*1664525+1013904223)>>>0;const v=110+(grainSeed>>>27);grainData.set([v,v,v,255],i*4);}
    const grain=new T.DataTexture(grainData,128,128,T.RGBAFormat);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(6,6);grain.needsUpdate=true;
    const wood = new T.MeshStandardMaterial({color:0x765237, roughness:0.95});
    iron.bumpMap=grain;iron.bumpScale=0.018;
    function group(id,name,sub,parent,pos,exp,desc,outer=false) {
      const g = createPartGroup({id:'mon_'+id,name,subsystem:sub,subLabel:sub==='turret'?'Taret':sub==='engine'?'Buhar Makinesi':'Gövde ve Güverte',basePos:pos,explodeVec:exp,desc,material:'Dövme demir / dökme demir / ahşap',weight:'Parça kütlesi modellenmedi',spec:'Eğitim amaçlı rekonstrüksiyon; iç yerleşim yaklaşık',location:'USS Monitor gövdesi ve makineleri',isOuterShell:outer});
      parent.add(g); parts[id]=g; return g;
    }
    function mesh(g,geo,mat,pos=[0,0,0],rot=[0,0,0]) {const m=addCADMesh(g,geo,mat,pos,rot);meshes.push(m);return m;}
    const box=(g,size,pos,mat=iron)=>mesh(g,new T.BoxGeometry(...size),mat,pos);
    const cyl=(g,r,h,pos,mat=iron,rot=[0,0,0])=>mesh(g,new T.CylinderGeometry(r,r,h,32),mat,pos,rot);
    // NOAA overall reference: 173 ft × 41 ft 6 in. Hull stations are reconstructed.
    const L = 52.73, W = 12.65, DECK = 3.35;
    const hullMat = new T.MeshStandardMaterial({color:0x302e2c,roughness:0.88,metalness:0.35});
    const deckMat = new T.MeshStandardMaterial({color:0x626765,roughness:0.85,metalness:0.5});
    deckMat.bumpMap=grain;deckMat.bumpScale=0.012;hullMat.bumpMap=grain;hullMat.bumpScale=0.02;
    const black = new T.MeshStandardMaterial({color:0x171e22,roughness:0.62,metalness:0.6});
    function outline(scale=1) {
      const shape=new T.Shape();
      shape.moveTo(0,L/2*scale);
      shape.bezierCurveTo(4.3*scale,25.4*scale,6.325*scale,19*scale,6.325*scale,13*scale);
      shape.lineTo(6.325*scale,-15*scale);
      shape.bezierCurveTo(6.3*scale,-22*scale,3.8*scale,-26.365*scale,0,-26.365*scale);
      shape.bezierCurveTo(-3.8*scale,-26.365*scale,-6.3*scale,-22*scale,-6.325*scale,-15*scale);
      shape.lineTo(-6.325*scale,13*scale);
      shape.bezierCurveTo(-6.325*scale,19*scale,-4.3*scale,25.4*scale,0,L/2*scale);
      return shape;
    }
    function slab(parent,scale,depth,y,mat,bevel=0) {
      const geo=new T.ExtrudeGeometry(outline(scale),{depth,bevelEnabled:bevel>0,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:24});
      geo.rotateX(-Math.PI/2); return mesh(parent,geo,mat,[0,y,0]);
    }
    function tube(parent,points,r,mat=iron){return mesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,r,8,false),mat);}
    function instances(parent,geo,mat,positions){
      const m=ctx.addInstancedMesh(parent,geo,mat,positions.length),o=new T.Object3D();
      positions.forEach((p,i)=>{o.position.set(...p);o.updateMatrix();m.setMatrixAt(i,o.matrix);});m.instanceMatrix.needsUpdate=true;meshes.push(m);return m;
    }
    const deck=group('deck','1. Zırhlı Güverte ve Bordalar','hull',root,[0,DECK,0],[0,3,0],'NOAA ölçüleriyle yaklaşık 52,73 m uzunluk ve 12,65 m genişlik. Alçak güverte, yuvarlatılmış uçlar ve borda çıkması.',true);
    slab(deck,1,0.12,0,deckMat);
    slab(deck,1,0.55,-0.55,iron);
    const floor=group('floor','2. Ahşap Alt Gövde ve Omurga','hull',root,[0,0,0],[0,-0.1,0],'Demir üst gövdenin altında kalan dar ahşap karina. Gövde istasyonları tarihsel görsellerden yaklaşık yeniden kurulmuştur.',true);
    slab(floor,0.85,1.8,0.65,hullMat,0.25);
    box(floor,[0.45,0.4,38],[0,0.2,0],wood);
    const beams=group('beams','3. İç Postalar ve Kemereler','hull',root,[0,0,0],[2,0,0],'Gövde içinde boyuna kirişler, postalar ve güverte taşıyıcıları.');
    for(const x of [-3.4,0,3.4])box(beams,[0.18,0.35,39],[x,2.7,0]);
    for(let z=-18;z<=18;z+=3){box(beams,[10,0.22,0.20],[0,2.95,z]);for(const x of [-4.9,4.9])box(beams,[0.2,1.8,0.2],[x,2,z]);}
    // Plate seams are shallow geometry, not a painted grid floating above the ship.
    const seams=[];for(let z=-20;z<=20;z+=2)for(const x of [-4,-2,0,2,4])seams.push([x,0.145,z]);
    instances(deck,new T.BoxGeometry(1.96,0.012,0.018),black,seams);
    const rivets=[];for(let z=-19;z<=19;z+=0.55)for(const x of [-5.9,5.9])rivets.push([x,0.16,z]);
    bolts.push(instances(deck,new T.SphereGeometry(0.045,6,4),iron,rivets));
    const pivot=new T.Group();pivot.position.y=3.48;root.add(pivot);
    const base=group('base','4. Taret Tabanı','turret',pivot,[0,0,0],[0,0.5,0],'Taret tabanı ve merkez mil desteği. Dönüş eğitim amacıyla yavaşlatılmıştır.');cyl(base,3.25,0.12,[0,0,0]);
    const shaft=group('shaft','5. Merkez Mil','turret',pivot,[0,0.55,0],[0,1,0],'Ericsson taretinin merkez desteği. Kaldırma düzeneği şematik gösterilir.');cyl(shaft,0.15,1.1,[0,0,0],brass);
    const shell=group('shell','6. Sekiz Katmanlı Demir Taret','turret',pivot,[0,1.35,0],[0,3.5,0],'NOAA: sekiz adet 1 inç demir tabaka, toplam yaklaşık 203 mm. İç çap yaklaşık 6,1 m; kapı ve bağlantı ayrıntıları sadeleştirilmiştir.',true);
    // Segment construction leaves two actual gun ports instead of solid walls behind the barrels.
    const R=3.15,N=80;
    for(let i=0;i<N;i++) {const a=i*2*Math.PI/N,x=Math.sin(a)*R,z=Math.cos(a)*R;const port=z>2.8&&Math.abs(Math.abs(x)-0.9)<0.42;
      const h=port?0.65:2.5;
      const m=box(shell,[0.26,h,0.203],[x,port?-0.925:0,z]);m.rotation.y=a;
      if(port){const top=box(shell,[0.26,0.65,0.203],[x,0.925,z]);top.rotation.y=a;}
      if(!port)for(const y of [-1.05,1.05]) {const b=mesh(shell,new T.SphereGeometry(0.045,6,4),iron,[x*1.035,y,z*1.035]);bolts.push(b);}
    }
    const roof=group('roof','7. Taret Tavanı','turret',pivot,[0,2.65,0],[0,5,0],'Sökülebilir tavan kesiti; X-Ray iç mekanizmaları görünür kılar.',true);cyl(roof,3.25,0.1,[0,0,0]);
    box(roof,[0.9,0.08,0.85],[0,0.11,-1.7],black);
    for(const x of [-0.30,0.30])tube(roof,[[x,0.15,-1.8],[x,0.3,-1.8],[x,0.3,-1.5],[x,0.15,-1.5]],0.025);
    for(const x of [-0.32,0.32])tube(shell,[[x,-1.2,-3.30],[x,1.3,-3.30]],0.035);
    for(let y=-1.1;y<1.3;y+=0.3)tube(shell,[[-0.32,y,-3.30],[0.32,y,-3.30]],0.025);
    const rails=group('rails','8. Top Kızakları','turret',pivot,[0,0.3,0],[0,0,2],'İki Dahlgren topunun temsili sürtünmeli kızakları. Hareket mesafesi tarihsel ölçüm değildir.');
    for(const x of [-0.9,0.9])for(const dx of [-0.28,0.28])box(rails,[0.12,0.2,3.5],[x+dx,0,0.65]);
    const guns=group('guns','9. İki XI-inç Dahlgren Topu','turret',pivot,[0,1.25,0],[0,0,3],'Mariners’ Museum: iki XI-inç Dahlgren topu. Görsel geri tepme 0,45 m; balistik hesaplanmaz.');
    const slides=[];
    for(const x of [-0.9,0.9]){const slide=new T.Group();slide.position.x=x;guns.add(slide);slides.push(slide);box(slide,[0.65,0.5,1.8],[0,-0.6,0.5],wood);
      const points=[[0,-1.2],[0.27,-1.2],[0.43,-0.9],[0.4,-0.3],[0.28,0.6],[0.23,2.15],[0.1397,2.15],[0.1397,1.5]].map(p=>new T.Vector2(...p));
      mesh(slide,new T.LatheGeometry(points,32),iron,[0,0,1.3],[Math.PI/2,0,0]);
      cyl(slide,0.13,0.85,[0,-0.1,0],iron,[0,0,Math.PI/2]);
    }
    const ports=group('ports','10. Lombar Kepenkleri','turret',pivot,[0,2.15,0],[0,1,2],'Ağır kepenkler top açıklıklarını korur. Sarkaç hareketi temsili; kapalıyken atış engellenir.');
    const shutters=[];for(const x of [-0.9,0.9]){const p=new T.Group();p.position.set(x,0,2.85);ports.add(p);box(p,[0.72,1.1,0.12],[0,-0.55,0]);shutters.push(p);}
    const drive=group('drive','11. Taret Dönüş Tahriki','turret',pivot,[0,0.3,-1.8],[0,0,-2],'Buharlı yardımcı tahrikin şematik gösterimi. Gerçek dişli oranı ve taret kaldırma kinematiği simüle edilmez.');box(drive,[0.8,0.4,0.6],[0,0,0],brass);cyl(drive,0.35,0.12,[0,0.3,0]);
    const engine=group('engine','12. Yatay Buhar Silindirleri','engine',root,[0,1.5,-10],[0,0,-3],'NOAA: yatay pistonlar makineyi su hattı altında tutar. Makine kıç bölümündedir; iç ölçüler kaynak görsellerine göre yaklaşık yeniden kurulmuştur.');
    for(const x of [-0.85,0.85])cyl(engine,0.25,0.85,[x,0,0],brass,[Math.PI/2,0,0]);
    const rods=group('rods','13. Piston Kolları','engine',root,[0,1.5,-9.4],[0,1,-2],'Yatay pistonların karşılıklı hareketi gösterilir; buhar basıncı veya güç hesabı yapılmaz.');const pistons=[];for(const x of [-0.85,0.85])pistons.push(cyl(rods,0.055,0.8,[x,0,0],iron,[Math.PI/2,0,0]));
    const crank=group('crank','14. Krank ve Volan','engine',root,[0,1.5,-8.9],[0,1,-1],'Şematik krank: piston hareketi ve mil dönüşü aynı gösterim fazını kullanır.');const wheel=mesh(crank,new T.TorusGeometry(0.35,0.05,8,32),iron);box(crank,[0.7,0.06,0.06],[0,0,0],brass);
    const pipe=group('pipe','15. Buhar Boruları','engine',root,[0,1.6,-10.7],[1,1,-2],'Buhar beslemesinin temsili boruları; kazanlardan makine dairesine bağlantı gösterilir; kondenserin içi modellenmez.');for(const x of [-0.85,0.85])cyl(pipe,0.07,1,[x,0,0],brass,[Math.PI/2,0,0]);
    const pilot=group('pilot','16. Zırhlı Kumanda Kabini','hull',root,[0,DECK+0.12,18],[0,2,2],'Pruvaya yakın alçak zırhlı kumanda kabini; dar yatay görüş aralıkları ve katmanlı demir duvarlar.');
    for(let i=0;i<5;i++)box(pilot,[2.25,0.18,2.0],[0,0.12+i*0.19,0],iron);
    box(pilot,[2.4,0.18,2.15],[0,1.35,0],iron);
    for(const x of [-1.04,1.04])box(pilot,[0.17,0.34,2],[x,1.12,0]);
    for(const z of [-0.91,0.91])box(pilot,[2.0,0.15,0.18],[0,1.23,z]);
    const fittings=group('fittings','17. Güverte Kapakları ve Bağlama Donanımı','hull',root,[0,DECK+0.12,0],[1,1,0],'Makine ve mürettebat erişim kapakları, bağlama babaları ve güverte havalandırması. Yerleşim yaklaşık.');
    for(const z of [-18,-13,-7,7,12]){box(fittings,[1.4,0.13,1.6],[0,0.1,z],black);box(fittings,[1.24,0.05,1.44],[0,0.19,z],iron);tube(fittings,[[-0.2,0.23,z],[0,0.38,z],[0.2,0.23,z]],0.035);}
    for(const z of [-20,20])for(const x of [-3.4,3.4]){box(fittings,[0.85,0.10,0.5],[x,0.05,z]);for(const dx of [-0.25,0.25]){cyl(fittings,0.12,0.4,[x+dx,0.3,z]);cyl(fittings,0.18,0.07,[x+dx,0.53,z]);}}
    const vents=group('vents','18. Bacalar ve Havalandırma Ağızları','hull',root,[0,DECK+0.12,-9],[0,2,-1],'Sökülebilir baca ve havalandırma donanımıyla seyir görünümü. Donanım savaş ve seyir durumuna göre değişirdi.');
    for(const x of [-1.25,1.25]){cyl(vents,0.42,2.25,[x,1.1,0],black);cyl(vents,0.50,0.12,[x,2.28,0],iron);cyl(vents,0.37,0.02,[x,2.35,0],black);}
    for(const x of [-2.1,2.1]){cyl(vents,0.30,1.5,[x,0.75,-5],iron);tube(vents,[[x,1.3,-5],[x,1.7,-5],[x,1.85,-4.55]],0.30,iron);cyl(vents,0.24,0.02,[x,1.85,-4.54],black,[Math.PI/2,0,0]);}
    const boats=group('boats','19. Filikalar ve Mataforalar','hull',root,[0,DECK+0.15,-5],[3,1,0],'Ahşap filikalar ve kaldırma mataforaları. Tekne formları ve askı düzeni fotoğraf referanslı rekonstrüksiyondur.');
    for(const side of [-1,1]){
      const shape=new T.Shape();shape.moveTo(0,-2.6);shape.bezierCurveTo(0.85,-1.8,0.85,1.8,0,2.6);shape.bezierCurveTo(-0.85,1.8,-0.85,-1.8,0,-2.6);
      const geo=new T.ExtrudeGeometry(shape,{depth:0.35,bevelEnabled:true,bevelThickness:0.12,bevelSize:0.10,bevelSegments:2,steps:1});geo.rotateX(-Math.PI/2);mesh(boats,geo,wood,[side*4.7,0.35,0]);
      const inner=new T.ShapeGeometry(shape);inner.rotateX(-Math.PI/2);const bed=mesh(boats,inner,black,[side*4.7,0.83,0]);bed.scale.set(0.8,1,0.9);
      for(const z of [-1.6,-0.6,0.6,1.6])box(boats,[1.0,0.08,0.22],[side*4.7,0.9,z],wood);
      for(const z of [-1.8,1.8]){tube(boats,[[side*3.8,0,z],[side*3.8,2.2,z],[side*4.5,2.4,z],[side*4.7,2.1,z]],0.07);tube(boats,[[side*4.7,2.1,z],[side*4.7,0.9,z]],0.02,wood);}
    }
    const steering=group('steering','20. Kıç Pervane ve Dümen','engine',root,[0,1.35,-23],[0,0,-3],'Tek pervane ve kıç dümeni. Pervane devri gösterim makinesine bağlıdır.');
    cyl(steering,0.14,5,[0,0,1.3],iron,[Math.PI/2,0,0]);
    const propeller=new T.Group();steering.add(propeller);propeller.position.z=-1.1;
    cyl(propeller,0.27,0.5,[0,0,0],brass,[Math.PI/2,0,0]);
    for(let i=0;i<4;i++){const a=i*Math.PI/2;const blade=mesh(propeller,new T.SphereGeometry(1,16,8),brass,[Math.sin(a)*0.55,Math.cos(a)*0.55,0]);blade.scale.set(0.32,0.68,0.07);blade.rotation.set(0,0.35,a);}
    box(steering,[0.12,1.4,1.2],[0,0,-2.1]);
    // Continuous propeller shaft and bearing pedestals in the aft machinery space.
    cyl(steering,0.12,10,[0,0,8.8],iron,[Math.PI/2,0,0]);
    for(const z of [5,9,13]){box(steering,[0.6,0.7,0.6],[0,-0.45,z]);cyl(steering,0.24,0.35,[0,0,z],brass,[Math.PI/2,0,0]);}
    const boilers=group('boilers','21. Kazanlar ve Makine Yatakları','engine',root,[0,1.35,-5],[0,2,-1],'İki kazan ve motor yatakları; tesisatın iç ayrıntıları yaklaşık, basınç hesabı yapılmaz.');
    for(const x of [-1.5,1.5]){cyl(boilers,0.7,3.0,[x,0,0],black,[Math.PI/2,0,0]);box(boilers,[1.8,0.25,3.3],[x,-0.75,0]);tube(boilers,[[x,0.7,0],[x,1.3,0],[x,1.3,-4]],0.09,brass);}
    for(const x of [-0.85,0.85])box(beams,[0.6,0.7,3.0],[x,0.8,-9.5]);
    const railings=group('railings','22. Güverte Emniyet Halatları','hull',root,[0,DECK+0.12,0],[0,1,0],'Seyir donanımındaki hafif dikmeler ve halatlar. Savaşta sökülebilen donanımlar tek bir seyir görünümünde birleştirilmiştir.');
    for(const side of [-1,1]){const pts=[];for(let z=-18;z<=18;z+=3){cyl(railings,0.035,0.75,[side*6.0,0.375,z],iron);pts.push([side*6.0,0.72,z]);}tube(railings,pts,0.018,wood);}
    function update(dt){dt=Math.max(0,Math.min(dt,0.05));if(S.engine)S.phase+=S.rpm*2*Math.PI/60*dt;if(S.auto)S.angle=(S.angle+8*dt)%360;pivot.rotation.y=S.angle*Math.PI/180;
      wheel.rotation.z=S.phase;propeller.rotation.z=S.phase;pistons.forEach((p,i)=>p.position.z=Math.sin(S.phase+i*Math.PI)*0.15);shutters.forEach((p,i)=>p.rotation.z=(i?1:-1)*S.port/100*1.5);
      S.recoil=Math.max(0,S.recoil-dt);slides.forEach(p=>p.position.z=-0.45*Math.sin(Math.PI*S.recoil));}
    function onFire(){if(!S.ammo){S.ammo=20;return {ok:true,refill:true};}if(S.port<95||S.recoil>0)return {ok:false,msg:'Önce kepenkleri tamamen açın ve geri tepmenin bitmesini bekleyin.'};S.ammo-=2;S.recoil=1;ctx.audio?.playCannonFire();return {ok:true};}
    function applyTextures(blueprint){meshes.forEach(m=>{if(m.userData.origColor && m.material.metalness===0.65){m.material.color.setHex(S.finish==='iron'?0x454d50:0x785747);m.userData.origColor.copy(m.material.color);}m.material.wireframe=false;});bolts.forEach(b=>b.visible=S.relief);}
    const cams={iso:{pos:[43,31,49],look:[0,2,0]},front:{pos:[17,13,36],look:[0,3,8]},breech:{pos:[7,8,9],look:[0,4.7,0]},engine:{pos:[12,10,-17],look:[0,2,-8]},suspension:{pos:[9,6,-32],look:[0,2,-23]},top:{pos:[0.1,70,0],look:[0,1,0]}};
    const tourSteps=[['Genel Bakış: USS Monitor, 1862','Alçak bordalı tam gemi: pruvadaki kumanda kabini, merkez taret, kıç makineleri ve tek pervane.','iso',deck,false],['Katmanlı Demir Zırh','Sekiz kat bir inç demir; yaklaşık 203 mm toplam kalınlık.','front',shell,true],['Dahlgren Topları','İki XI-inç top ve temsili geri tepme kızakları.','breech',guns,true],['Kepenkler ve Taret','Kepenkleri açın; taret açısını kaydırıcıyla değiştirin.','top',ports,true],['Yatay Buhar Makinesi','Yatay pistonlar alçak makine dairesine uygundur. Bağlantılar şematiktir.','engine',engine,true],['Parçalarına Ayır','22 grup; gövde, seyir donanımı, taret ve makine dairesini ayrı inceleyin.','iso',base,false]].map((s,i)=>({title:s[0],desc:s[1],cam:s[2],part:s[3],cutaway:s[4],explode:i===5?65:0,sub:'all'}));
    const ui={title:'USS MONITOR — Ericsson Döner Taret (1862)',sub:'1862 zırhlı gemi • 52,73 × 12,65 m • Seyir donanımı, döner taret ve güverte altı makineleri',partCount:'22 Ana Grup',texTitle:'Demir Yüzey',textures:[{key:'iron',label:'Koyu Demir'},{key:'study',label:'Oksit Çalışması (temsili)'}],textureLabel:()=>S.finish==='iron'?'Koyu demir':'Temsili oksit',activeTexture:()=>S.finish,reliefLabel:on=>'Perçinler: '+(on?'AÇIK':'KAPALI'),relief:()=>S.relief,subsystems:[{key:'hull',label:'Gövde ve Güverte',color:'#64748b',count:8},{key:'turret',label:'Taret ve Toplar',color:'#b68a43',count:8},{key:'engine',label:'Makine ve Sevk',color:'#0284c7',count:6}],camLabels:{iso:'İzometrik',front:'Lombarlar',breech:'Top Kızakları',engine:'Buhar Makinesi',suspension:'Kıç ve Pervane',top:'Üst Kesit'},sliders:[{label:'Makine Gösterim Devri (temsili)',min:0,max:60,step:1,fmt:v=>v+' RPM'},{label:'Taret Açısı',min:0,max:360,step:1,fmt:v=>Math.round(v)+'°'},{label:'Lombar Kepenk Açıklığı',min:0,max:100,step:1,fmt:v=>'%'+v}],buttons:{terrain:'Buhar Makinesi Gösterimi',sweep:'Otomatik Taret Dönüşü'},telemetryTag:'USS MONITOR • 1862',statLabels:['GÖSTERİM DEVRİ','TARET AÇISI','GÖSTERİM MÜHİMMATI','TARET ZIRHI'],shadowExtent:40,fog:{near:100,far:180}};
    update(0);
    return {root,ui,camPresets:cams,tourSteps,parts,defaultPart:shell,firePart:guns,update,onFire,fireButtonLabel:()=>S.ammo?'İKİ TOP GÖSTERİMİ':'İKMAL (20)',getSliderValues:()=>[S.rpm,S.angle,S.port],onSlider:(i,v)=>{if(i===0)S.rpm=v;if(i===1){S.angle=v;S.auto=false;}if(i===2)S.port=v;update(0);return {};},onButton:n=>{if(n==='terrain')S.engine=!S.engine;if(n==='sweep')S.auto=!S.auto;return {};},buttonActive:n=>n==='terrain'?S.engine:S.auto,getStats:()=>[`${S.engine?S.rpm:0} <span>RPM</span>`,`${Math.round(S.angle)} <span>°</span>`,`${S.ammo} <span>Adet</span>`,'203 <span>mm</span>'],getStatus:()=>({text:S.recoil?'GERİ TEPME':S.port<95?'KEPENKLER KAPALI / KISMEN AÇIK':'GÖSTERİME HAZIR',color:'#0284c7'}),applyTextures,setTexture:k=>{if(['iron','study'].includes(k))S.finish=k;},toggleRelief:()=>{S.relief=!S.relief;return S.relief;}};
  };
})();
