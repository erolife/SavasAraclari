(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.phalanx=function(ctx){
 const K=window.MuseumModelKit(ctx,'phalanx'),{T,root,parts,mats:M,part,mesh,box,cyl,ring,pipe,beam,instances}=K;
 const S={speed:0,yaw:0,elev:5,auto:false,time:0,phase:0};
 const deck=part('deck','1. Güverte Bağlantısı','Kaide',[0,0,0],[0,-.1,0],'Güverteye oturan cıvatalı taban, çevresel takviyeler ve servis açıklıkları.');
 cyl(deck,1.02,.16,[0,.08,0],M.dark);cyl(deck,.78,.43,[0,.36,0],M.white);
 instances(deck,new T.CylinderGeometry(.045,.045,.07,6),M.steel,Array.from({length:24},(_,i)=>({pos:[.91*Math.sin(i*Math.PI/12),.19,.91*Math.cos(i*Math.PI/12)]})));
 for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(deck,[.75*Math.sin(a),.53,.75*Math.cos(a)],[.94*Math.sin(a),.18,.94*Math.cos(a)],.08,M.white);}
 const bearing=part('bearing','2. Dönüş Yatağı','Kaide',[0,0,0],[0,.5,0],'Sabit taban ile hareketli üst yapının arasındaki çevresel yatak.');
 for(const y of [.56,.67,.78])cyl(bearing,.79,.07,[0,y,0],y===.67?M.dark:M.steel);
 const turret=new T.Group();turret.position.y=.82;root.add(turret);
 const chassis=part('chassis','3. Döner Üst Şasi','Kaide',[0,0,0],[0,0,-1],'Düşey taşıyıcılar, platform ve üst ekipmanın bağlantı iskeleti.',false,turret);
 box(chassis,[1.52,.18,1.75],[0,.05,-.05],M.white);for(const x of [-.58,.58]){box(chassis,[.17,1.9,.28],[x,1.05,-.36],M.steel);beam(chassis,[x,.2,.6],[x,1.6,-.36],.12,M.steel);}
 const covers=part('covers','4. Servis Muhafazaları','Kaide',[0,0,0],[-1,0,0],'Arka elektronik kabinleri, sökülebilir kapaklar, kapı menteşeleri ve kilitler.',true,turret);
 box(covers,[1.18,1.35,.64],[0,.86,-.65],M.white);
 for(const x of [-.3,.3]){box(covers,[.54,1.15,.028],[x,.86,-.985],M.white);box(covers,[.035,.18,.045],[x+.18,.9,-1.02],M.dark);for(const y of [.4,1.3])cyl(covers,.035,.13,[x-.23,y,-1.01],M.steel);}
 const radome=part('radome','5. Beyaz Radar Kubbesi','Radar ve Sensör',[0,0,0],[0,1.7,0],'Phalanx siluetinin belirgin kompozit radomu. Block 1B görünümü; dış oranlar fotoğraflardan yaklaşık kurulmuştur.',true,turret);
 cyl(radome,.68,1.25,[0,2.68,-.24],M.white);
 mesh(radome,new T.SphereGeometry(.68,48,24,0,Math.PI*2,0,Math.PI/2),M.white,[0,3.305,-.24]);
 for(const y of [2.05,2.13])ring(radome,.69,[0,y,-.24],M.steel,.022,[Math.PI/2,0,0]);
 instances(radome,new T.SphereGeometry(.024,8,6),M.steel,Array.from({length:24},(_,i)=>({pos:[.685*Math.sin(i*Math.PI/12),2.1,-.24+.685*Math.cos(i*Math.PI/12)]})));
 const search=part('search','6. Arama Anteni','Radar ve Sensör',[0,0,0],[0,1,0],'Radom içindeki antenin temsili mekanik yerleşimi; X-Ray görünümünde incelenebilir.',false,turret);
 cyl(search,.18,.85,[0,2.7,-.24],M.dark);cyl(search,.12,.8,[0,1.95,-.24],M.steel);cyl(search,.42,.07,[0,2.32,-.24],M.steel);
 for(const x of [-.35,.35])beam(search,[x,1.7,-.35],[x,2.32,-.24],.06,M.steel);
 cyl(search,.33,.08,[0,1.92,.53],M.brass,'z');ring(search,.34,[0,1.92,.58],M.dark,.025);
 const antenna=new T.Group();antenna.position.set(0,3.08,-.24);search.add(antenna);
 box(antenna,[.98,.38,.09],[0,0,0],M.steel);for(let i=-5;i<=5;i++)box(antenna,[.025,.31,.028],[i*.08,0,.06],M.brass);
 const track=part('track','7. Ön Radar Muhafazası','Radar ve Sensör',[0,0,0],[0,0,1],'Ana kubbenin altındaki ön anten muhafazası ve montaj halkası.',true,turret);
 cyl(track,.43,.38,[0,1.92,.53],M.white,'z');mesh(track,new T.SphereGeometry(.42,32,16),M.white,[0,1.92,.72]).scale.z=.22;
 ring(track,.44,[0,1.92,.72],M.steel,.02);
 const optic=part('optic','8. Block 1B Elektro-Optik Sensör','Radar ve Sensör',[0,0,0],[1,0,0],'Block 1B, elektro-optik sensör ve farklı namlu destekleriyle ayırt edilir. ABD Donanması ilk Block 1B kullanımını 1999 olarak verir.',false,turret);
 beam(optic,[.55,1.85,-.1],[.98,1.85,.08],.14,M.white);box(optic,[.46,.62,.57],[.98,1.99,.18],M.white);
 for(const [x,y,r] of [[.98,2.13,.14],[.98,1.86,.10]]){cyl(optic,r,.06,[x,y,.49],M.dark,'z');cyl(optic,r*.75,.065,[x,y,.495],M.glass,'z');ring(optic,r,[x,y,.53],M.steel,.014);}
 const pitch=new T.Group();pitch.position.set(0,1.50,.28);turret.add(pitch);
 const cradle=part('cradle','9. Yükseliş Beşiği','Top ve Besleme',[0,0,0],[1,0,0],'Top grubunu taşıyan yan plakalar ve yatay eksenli mafsallar.',false,pitch);
 for(const x of [-.48,.48]){box(cradle,[.12,.6,.85],[x,0,.04],M.white);cyl(cradle,.25,.21,[x,0,0],M.steel,'x');cyl(cradle,.17,.23,[x,0,0],M.white,'x');}
 const breech=part('breech','10. Arka Mekanizma Muhafazası','Top ve Besleme',[0,0,0],[0,0,-1],'M61 ailesi döner namlu grubunun arka dış muhafazası ve servis flanşları.',true,pitch);
 cyl(breech,.33,.72,[0,0,-.15],M.dark,'z');for(const z of [-.51,-.2,.21]){cyl(breech,.36,.06,[0,0,z],M.steel,'z');ring(breech,.30,[0,0,z+.035],M.dark,.023);}
 const barrelPart=part('barrels','11. Altı Namlulu Rotor','Top ve Besleme',[0,0,0],[0,0,1],'Altı ayrı namlu, açık uçlar ve döner rotor. Hız kontrolü yavaşlatılmış görsel mekanizma gösterimidir.',false,pitch);
 const rotor=new T.Group();barrelPart.add(rotor);
 for(let i=0;i<6;i++){const a=i*Math.PI/3,x=.155*Math.sin(a),y=.155*Math.cos(a);
  cyl(rotor,.039,2.12,[x,y,1.29],M.dark,'z');cyl(rotor,.054,.21,[x,y,.34],M.steel,'z');
  ring(rotor,.039,[x,y,2.36],M.steel,.010);cyl(rotor,.027,.006,[x,y,2.355],M.rubber,'z');
 }
 const braces=part('braces','12. Namlu Destek Kafesi','Top ve Besleme',[0,0,0],[0,0,1],'Block 1B görünümüne uygun çevresel destek halkaları ve boyuna takviyeler.',false,pitch);
 for(const z of [.47,1.30,2.13]){ring(braces,.245,[0,0,z],M.steel,.045);for(let i=0;i<6;i++){const a=i*Math.PI/3;box(braces,[.06,.06,.09],[.26*Math.sin(a),.26*Math.cos(a),z],M.dark);}}
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3;beam(braces,[.25*Math.sin(a),.25*Math.cos(a),.47],[.25*Math.sin(a),.25*Math.cos(a),2.13],.035,M.steel);}
 const drum=part('drum','13. Mühimmat Tamburu','Top ve Besleme',[0,0,0],[0,-.4,1],'Alt ön bölümdeki tamburun dış kapakları, çevresel bantları ve servis bağlantıları.',true,turret);
 cyl(drum,.52,1.25,[0,.63,.65],M.white,'x');
 for(const x of [-.64,.64]){cyl(drum,.54,.06,[x,.63,.65],M.steel,'x');cyl(drum,.46,.07,[x,.63,.65],M.white,'x');cyl(drum,.13,.085,[x,.63,.65],M.dark,'x');
  instances(drum,new T.SphereGeometry(.026,8,6),M.steel,Array.from({length:16},(_,i)=>({pos:[x*1.07,.63+.48*Math.sin(i*Math.PI/8),.65+.48*Math.cos(i*Math.PI/8)]})));}
 cyl(chassis,.11,1.30,[0,.63,.65],M.dark,'x');
 for(const x of [-.49,0,.49]){ring(chassis,.43,[x,.63,.65],M.dark,.025,[0,Math.PI/2,0]);for(let i=0;i<6;i++){const a=i*Math.PI/3;beam(chassis,[x,.63,.65],[x,.63+.41*Math.sin(a),.65+.41*Math.cos(a)],.025,M.steel);}}
 const chute=part('chute','14. Esnek Besleme Kanalı','Top ve Besleme',[0,0,0],[-1,0,0],'Tamburdan mekanizmaya uzanan dış besleme kanalı. Körüklü yüzey ve bağlantı ağızları modellenmiştir.',false,turret);
 const curve=new T.CatmullRomCurve3([[.67,.65,.68],[.91,.9,.6],[.88,1.25,.25],[.45,1.50,.06]].map(a=>new T.Vector3(...a)));
 mesh(chute,new T.TubeGeometry(curve,30,.105,8,false),M.dark);
 for(let i=0;i<=22;i++){const u=i/22,o=ring(chute,.115,curve.getPoint(u).toArray(),M.steel,.014);o.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),curve.getTangent(u));}
 const drives=part('drives','15. Tahrik ve Eksen Muhafazaları','Servis',[0,0,0],[-1,0,0],'Dönüş ve yükseliş motorlarının dış muhafazaları, bağlantı flanşları ve destekler.',false,turret);
 cyl(drives,.17,.55,[-.66,1.5,.2],M.dark,'z');cyl(drives,.22,.12,[-.66,1.5,.45],M.steel,'z');box(drives,[.36,.4,.5],[-.48,.4,-.3],M.dark);
 const cooling=part('cooling','16. Havalandırma ve Servis Panelleri','Servis',[0,0,0],[0,0,-1],'Arka kabin üzerindeki havalandırma ızgaraları ve yan erişim panelleri.',false,turret);
 for(const x of [-.60,.60]){box(cooling,[.035,.58,.43],[x,.9,-.64],M.dark);for(let i=0;i<10;i++)box(cooling,[.05,.025,.40],[x,.65+i*.05,-.64],M.steel);}
 box(cooling,[.85,.42,.025],[0,1.21,-1.01],M.dark);for(let i=0;i<8;i++)box(cooling,[.80,.022,.04],[0,1.05+i*.045,-1.03],M.steel);
 const cables=part('cables','17. Kablolar ve Koruyucu Hatlar','Servis',[0,0,0],[1,0,0],'Kabinler, sensör ve tahrik gövdeleri arasındaki dış kablo demetleri.',false,turret);
 for(const x of [-.48,.48]){pipe(cables,[[x,.2,-.7],[x,.8,-.8],[x,1.6,-.7],[x,2.03,-.35]],.028,M.rubber);pipe(cables,[[x,.3,.2],[x*.95,.8,0],[x,1.2,-.1]],.035,M.rubber);}
 pipe(cables,[[.55,1.55,-.3],[.8,1.6,-.4],[.98,1.8,-.15]],.03,M.rubber);
 const service=part('service','18. Basamaklar, Tutamaklar ve Etiketler','Servis',[0,0,0],[0,0,-1],'Bakım basamakları, emniyet tutamakları, kapak bağlantıları ve temsili uyarı plakaları.',false,turret);
 for(const x of [-.7,.7]){pipe(service,[[x,.3,-.85],[x,.4,-1.15],[x,1.4,-1.15],[x,1.5,-.85]],.025,M.steel);for(const y of [.42,.72,1.02])box(service,[.25,.04,.22],[x,y,-1.05],M.steel);}
 for(const x of [-.3,.3]){box(service,[.22,.12,.025],[x,.6,-1.04],M.brass);box(service,[.22,.018,.028],[x,.6,-1.055],M.dark);}
 function update(dt){dt=Number.isFinite(dt)?Math.max(0,Math.min(dt,.05)):0;S.time+=dt;if(S.auto){S.yaw=55*Math.sin(S.time*.28);S.elev=10+15*Math.sin(S.time*.21);}turret.rotation.y=S.yaw*Math.PI/180;pitch.rotation.x=-S.elev*Math.PI/180;S.phase=(S.phase+dt*S.speed*Math.PI/30)%(Math.PI*2);rotor.rotation.z=S.phase;antenna.rotation.y=S.phase*.3;}
 const camPresets={iso:{pos:[7,5.2,8.5],look:[0,2.1,.3]},front:{pos:[0,3,9],look:[0,2,.2]},breech:{pos:[-5,3.5,5],look:[0,2.2,1]},engine:{pos:[5,3,-5],look:[0,2,-.3]},suspension:{pos:[4,2,5],look:[0,1,.3]},top:{pos:[.1,9,2],look:[0,2,0]}};
 const tourSteps=[['Phalanx Block 1B','Beyaz radar kubbesi, altı namlulu top ve kompakt güverte kaidesi. İlk Phalanx 1980; burada seçilen Block 1B varyantı 1999.','iso',radome,false],['Güverte ve Dönüş Yatağı','Cıvatalı taban ve döner üst yapının bağlantılarını inceleyin.','suspension',bearing,false],['Radar ve Elektro-Optik Sensör','Kubbenin içindeki temsili arama anteni ve sağ yandaki iki optik açıklık.','front',search,true],['Altı Namlulu Mekanizma','Rotor, namlu ağızları ve destek kafesi. Ana düğme yavaşlatılmış hareket gösterimini başlatır.','breech',barrelPart,false],['Tambur ve Besleme Kanalı','Tambur dış gövdesi ve kıvrımlı körüklü kanal mekanizmanın altındadır.','suspension',chute,false],['Bakım Donanımı','Kapaklar, ızgaralar, kablo demetleri ve basamaklar; 18 grubu ayrı inceleyin.','engine',service,false]].map((a,i)=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:i===5?35:0,sub:'all'}));
 const ui=K.ui({portraitCameraScale:1.35,title:'Mk 15 Phalanx — Block 1B',sub:'1999 • Radar kubbesi, elektro-optik sensör ve altı namlulu mekanizma',shadowExtent:8,fog:{near:30,far:80},subsystems:[{key:'Kaide',label:'Kaide ve Üst Yapı',count:4,color:'#64748b'},{key:'Radar ve Sensör',label:'Radar ve Sensör',count:4,color:'#38bdf8'},{key:'Top ve Besleme',label:'Top ve Besleme',count:6,color:'#eab308'},{key:'Servis',label:'Servis Donanımı',count:4,color:'#22c55e'}],camLabels:{iso:'Genel',front:'Radar ve Sensör',breech:'Namlu Grubu',engine:'Arka Servis',suspension:'Kaide ve Tambur',top:'Üst'},sliders:[{label:'Yavaşlatılmış Rotor Gösterimi',min:0,max:60,step:1,fmt:v=>v+' dev/dk'},{label:'Yatay İnceleme Açısı',min:-150,max:150,step:1,fmt:v=>v+'°'},{label:'Düşey İnceleme Açısı',min:-10,max:70,step:1,fmt:v=>v+'°'}],buttons:{terrain:'Otomatik Eksen Gösterimi',sweep:'Başlangıç Pozu'},telemetryTag:'BLOCK 1B • MEKANİK İNCELEME',statLabels:['GÖSTERİM DEVRİ','YATAY AÇI','DÜŞEY AÇI','NAMLU SAYISI']});
 update(0);return {root,parts,ui,camPresets,tourSteps,defaultPart:radome,firePart:barrelPart,update,onSlider:(i,v)=>{if(i===0)S.speed=T.MathUtils.clamp(v,0,60);else{S.auto=false;if(i===1)S.yaw=T.MathUtils.clamp(v,-150,150);if(i===2)S.elev=T.MathUtils.clamp(v,-10,70);}update(0);return {};},onButton:n=>{if(n==='terrain')S.auto=!S.auto;else{S.auto=false;S.speed=0;S.yaw=0;S.elev=5;}update(0);return {};},buttonActive:n=>n==='terrain'?S.auto:false,onFire:()=>{S.speed=S.speed?0:24;return {ok:true};},mobileFireButtonLabel:()=>S.speed?'Rotoru Durdur':'Rotoru Başlat',fireButtonLabel:()=>S.speed?'ROTORU DURDUR':'ROTOR GÖSTERİMİNİ BAŞLAT',getSliderValues:()=>[S.speed,S.yaw,S.elev],getStats:()=>[`${Math.round(S.speed)} <span>dev/dk</span>`,`${Math.round(S.yaw)} <span>°</span>`,`${Math.round(S.elev)} <span>°</span>`,'6 <span>namlu</span>'],getStatus:()=>({text:S.speed?'YAVAŞLATILMIŞ GÖSTERİM':'MÜZE İNCELEMESİ',color:'#0284c7'}),applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
};})();
