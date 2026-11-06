(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.katyusha=function(ctx){
 const K=window.MuseumModelKit(ctx,'katyusha'),{T,root,parts,mats:M,part,mesh,box,cyl,ring,pipe,beam,instances,wheel,polygon}=K;
 const S={rpm:0,yaw:0,elev:25,jacks:true,auto:false,ammo:16,shot:0,salvo:false,timer:0};
 const chassis=part('chassis','1. ZİS-6 Merdiven Şasi','Şasi',[0,0,0],[0,-.3,0],'ZİS-6 üç dingilli kamyon şasisi. Ana boyutlar fotoğraf oranlarıyla yaklaşık 6 × 2,2 m olarak modellenmiştir.');
 for(const x of [-.65,.65])box(chassis,[.16,.25,5.9],[x,.91,0]);for(let z=-2.6;z<=2.7;z+=.65)box(chassis,[1.45,.12,.10],[0,.92,z]);
 const axles=part('axles','2. Dingiller ve Diferansiyeller','Şasi',[0,0,0],[0,-.2,0],'Ön yönlendirme dingili, arkada çift tahrikli dingil ve diferansiyel gövdeleri.');
 for(const z of [2.1,-1.25,-2.35]){cyl(axles,.09,2.0,[0,.51,z],M.dark,'x');mesh(axles,new T.SphereGeometry(.22,16,12),M.dark,[0,.51,z]);}
 cyl(axles,.055,4,[0,.6,-.1],M.steel,'z');
 const tires=part('tires','3. Lastikler ve Jantlar','Şasi',[0,0,0],[1.3,0,0],'Önde tek, arkada çift lastikler; dişler ve jant göbekleri bağımsız geometri.');const wheels=[];
 for(const z of [2.1,-1.25,-2.35])for(const side of [-1,1]){wheels.push(wheel(tires,side*.94,.51,z,.51,.22));if(z<0)wheels.push(wheel(tires,side*.70,.51,z,.51,.20));}
 const springs=part('springs','4. Yaprak Yaylar ve Bağlantılar','Şasi',[0,0,0],[0,.3,0],'Dingillerin üstündeki katmanlı yaprak yaylar ve şasi askıları.');
 for(const z of [2.1,-1.8])for(const x of [-.63,.63]){for(let i=0;i<5;i++)box(springs,[.12,.025,1.05-i*.12],[x,.69+i*.026,z],M.dark);for(const dz of [-.45,.45])box(springs,[.18,.28,.10],[x,.85,z+dz]);}
 const motor=part('motor','5. Sıralı Motor ve Radyatör','Motor',[0,0,0],[0,1,1],'Kaput altında motor bloğu, altı silindir çıkıntısı, fan, radyatör ve manifold. İç ölçüler yaklaşık.');
 box(motor,[.65,.45,1.1],[0,1.35,2.15],M.dark);for(let i=0;i<6;i++)cyl(motor,.10,.28,[0,1.66,1.72+i*.16],M.steel);
 box(motor,[.75,.65,.10],[0,1.45,2.85],M.dark);const fan=new T.Group();fan.position.set(0,1.45,2.68);motor.add(fan);for(let i=0;i<4;i++)box(fan,[.07,.48,.025],[0,0,0],M.steel,[0,0,i*Math.PI/2]);
 pipe(motor,[[.3,1.5,2.6],[.45,1.4,2.3],[.45,1.1,1.5],[.50,.7,0]],.04,M.dark);
 const hood=part('hood','6. Kaput ve Izgara','Kabin',[0,0,0],[0,1.3,1],'Dar uzun motor kaputu, panjur çubukları, kaput kapakları ve mandallar.',true);
 box(hood,[.88,.06,1.35],[0,1.84,2.18]);for(const x of [-.45,.45])box(hood,[.04,.62,1.35],[x,1.52,2.18]);
 for(let i=0;i<15;i++)box(hood,[.024,.58,.05],[-.37+i*.053,1.49,2.88],M.steel);
 for(const x of [-.47,.47])for(let i=0;i<8;i++)box(hood,[.02,.18,.025],[x,1.6,1.75+i*.11],M.dark);
 const cab=part('cab','7. Kabin Sacı ve Tavan','Kabin',[0,0,0],[-1,1,0],'Ayrı kapı ve cam açıklıkları, açılı ön panel ve köşeli tavan. Gövde kaplaması X-Ray ile açılır.',true);
 box(cab,[1.72,.08,1.25],[0,1.07,1.0]);box(cab,[1.72,.65,.07],[0,1.43,.40]);box(cab,[1.8,.10,1.43],[0,2.37,1.02]);
 for(const x of [-.85,.85]){box(cab,[.05,.63,1.18],[x,1.43,1.0]);for(const z of [.42,1.58])box(cab,[.055,.64,.065],[x,2.04,z]);box(cab,[.055,.06,1.15],[x,1.74,1.0]);}
 box(cab,[1.7,.45,.06],[0,1.65,1.61]);for(const x of [-.81,0,.81])box(cab,[.045,.48,.07],[x,2.08,1.61]);
 const glass=part('glass','8. Camlar ve Silecekler','Kabin',[0,0,0],[0,1.5,.8],'Ön ve yan camlar. Camlar normal görünümde de saydam kalır.');
 for(const x of [-.41,.41])box(glass,[.75,.42,.015],[x,2.10,1.62],M.glass);
 for(const x of [-.86,.86])box(glass,[.012,.51,1.04],[x,2.02,1.0],M.glass);
 for(const x of [-.45,.45])beam(glass,[x-.12,1.91,1.64],[x+.12,2.20,1.64],.018,M.dark);
 const interior=part('interior','9. Koltuklar ve Kumandalar','Kabin',[0,0,0],[0,1,0],'Kabin içinde minderler, gösterge paneli, direksiyon ve vites kolu.');
 box(interior,[1.40,.16,.52],[0,1.30,.75],M.dark);box(interior,[1.40,.48,.13],[0,1.59,.51],M.dark);box(interior,[1.45,.20,.20],[0,1.74,1.40],M.dark);
 pipe(interior,[[-.44,1.25,1.32],[-.44,1.83,1.24]],.025);ring(interior,.18,[-.44,1.85,1.20],M.dark,.018,[.5,0,0]);beam(interior,[.1,1.1,1],[.1,1.55,.95],.025);
 for(const x of [-.45,-.15,.15])cyl(interior,.06,.02,[x,1.78,1.29],M.steel,'z');
 const fenders=part('fenders','10. Çamurluklar ve Basamaklar','Kabin',[0,0,0],[1,0,0],'Ön lastikleri örten kavisli çamurluklar ve kabin basamakları.');
 for(const side of [-1,1]){const g=new T.CylinderGeometry(.66,.66,.43,32,1,true,0,Math.PI);mesh(fenders,g,M.paint,[side*.96,.51,2.1],[0,0,Math.PI/2]);box(fenders,[.48,.08,1.25],[side*1.0,.85,.95]);}
 const fittings=part('fittings','11. Tampon, Lambalar ve Yedek Lastik','Kabin',[0,0,0],[0,0,1],'Ön tampon, farlar, aynalar, çekme kancaları ve kabin arkasındaki yedek lastik.');box(fittings,[2.1,.15,.16],[0,.9,3.0],M.dark);
 for(const x of [-.70,.70]){cyl(fittings,.13,.17,[x,1.45,2.78],M.paint,'z');cyl(fittings,.11,.018,[x,1.45,2.88],M.glass,'z');pipe(fittings,[[x,1.75,1.4],[x*1.6,2.10,1.4]],.02);box(fittings,[.13,.23,.04],[x*1.6,2.10,1.4],M.steel);}
 wheel(fittings,-.98,1.42,.05,.44,.22);
 for(const side of [-1,1]){box(fittings,[.035,.04,.19],[side*.89,1.72,.92],M.steel);for(const z of [.50,1.48])for(const y of [1.2,1.6])box(fittings,[.035,.1,.035],[side*.89,y,z],M.dark);}
 const bed=part('bed','12. Arka Platform ve Sandıklar','Şasi',[0,0,0],[0,.5,-1],'Arka servis platformu, depolama sandıkları ve yakıt deposu.');box(bed,[1.85,.12,3.4],[0,1.15,-1.25]);for(const x of [-.65,.65])box(bed,[.45,.40,1.15],[x,1.42,-2.1]);cyl(bed,.23,.9,[.9,.88,-.45],M.paint,'z');
 const jackPart=part('jacks','13. Arka Denge Ayakları','Şasi',[0,0,0],[0,0,-1],'Ayaklar zeminle temas eder. Gösterim sırasında kamyon hareketi durur.');const jackFeet=[];
 for(const x of [-.87,.87]){cyl(jackPart,.08,.85,[x,.7,-2.9]);const foot=new T.Group();jackPart.add(foot);foot.position.set(x,.08,-2.9);box(foot,[.45,.12,.40],[0,0,0],M.dark);cyl(foot,.04,.7,[0,.4,0]);jackFeet.push(foot);}
 const turn= new T.Group();turn.position.set(0,1.45,-.85);root.add(turn);
 const mount=part('mount','14. Döner Yatak ve Taşıyıcı','Ray Sistemi',[0,0,0],[0,.4,0],'Platforma oturan döner tabla ve iki yan taşıyıcı.',false,turn);cyl(mount,.55,.15,[0,0,0]);for(const x of [-.6,.6]){beam(mount,[x,0,-.5],[x,1.10,0],.12);beam(mount,[x,0,.5],[x,1.10,0],.12);}
 const elevation=new T.Group();elevation.position.y=1.10;turn.add(elevation);
 const rails=part('rails','15. Sekiz Çift Yüzlü Ray','Ray Sistemi',[0,0,0],[0,1,0],'Sekiz rayın üst ve alt yüzlerinde toplam on altı dış mühimmat modeli. Atış gösterimi çizgisel animasyondur; balistik hesaplanmaz.',false,elevation);
 for(let i=0;i<8;i++){const x=(i-3.5)*.205;box(rails,[.045,.14,4.6],[x,0,0]);for(const y of [-.075,.075])box(rails,[.10,.025,4.6],[x,y,0]);}
 for(const z of [-2,-.8,.6,2])box(rails,[1.65,.12,.08],[0,-.14,z],M.dark);
 const bracing=part('bracing','16. Ray Çaprazları ve Kaldırma Kolu','Ray Sistemi',[0,0,0],[0,.6,-.5],'Ray çerçevesinin çaprazları ve bağlantı kulakları.',false,elevation);
 for(const side of [-1,1])for(let z=-2;z<1.8;z+=.8){beam(bracing,[side*.8,-.15,z],[side*.8,-.4,z+.8],.04);beam(bracing,[side*.8,-.4,z],[side*.8,-.15,z+.8],.04);}for(const x of [-.8,.8])box(bracing,[.07,.07,4.4],[x,-.4,0]);
 const ammo=part('ammo','17. M-13 Dış Gövdeleri','Ray Sistemi',[0,0,0],[0,1.2,0],'Müze görünümü için dış gövdeler, burun ve kuyruk kanatçıkları. İç itici veya harp başlığı yapısı modellenmez.',false,elevation);const rockets=[],flights=[];
 for(let i=0;i<16;i++){const g=new T.Group();ammo.add(g);g.position.set((i%8-3.5)*.205,i<8?.18:-.25,0.45);cyl(g,.066,1.18,[0,0,0],M.dark,'z');mesh(g,new T.ConeGeometry(.066,.24,16),M.paint,[0,0,.71],[Math.PI/2,0,0]);for(let f=0;f<4;f++)box(g,[.025,.20,.20],[0,0,-.52],M.steel,[0,0,f*Math.PI/2]);rockets.push(g);}
 const shield=part('shield','18. Katlanır Kabin Koruma Panelleri','Kabin',[0,0,0],[0,1,1],'Ön camı örten katlanır metal paneller; inceleme için açılı konumda.');for(const x of [-.42,.42])box(shield,[.78,.045,.64],[x,2.45,1.48],M.paint,[-.25,0,0]);
 function update(dt){dt=Number.isFinite(dt)?Math.max(0,Math.min(dt,.05)):0;turn.rotation.y=S.yaw*Math.PI/180;elevation.rotation.x=-S.elev*Math.PI/180;wheels.forEach(w=>w.rotation.x+=S.rpm*dt*.05);fan.rotation.z+=S.rpm*dt*.12;jackFeet.forEach(f=>f.position.y=S.jacks?.08:.45);
  if(S.salvo){S.timer-=dt;if(S.timer<=0&&S.ammo>0){flights.push({model:rockets[16-S.ammo],time:0});S.ammo--;S.timer=.3;S.shot=.2;if(S.ammo%4===0)ctx.audio?.playCannonFire?.();}if(!S.ammo)S.salvo=false;}S.shot=Math.max(0,S.shot-dt);for(const f of flights){f.time+=dt;f.model.position.z=.45+f.time*10;if(f.time>1.2)f.model.visible=false;}
 }
 function fire(){if(S.salvo)return {ok:false};if(!S.ammo){S.ammo=16;flights.length=0;rockets.forEach(r=>{r.visible=true;r.position.z=.45;});return {ok:true,refill:true};}if(!S.jacks||S.rpm>0)return {ok:false,msg:'Gösterim için tekerlekleri durdurun ve denge ayaklarını indirin.'};S.salvo=true;S.timer=0;return {ok:true};}
 const camPresets={iso:{pos:[7,5.2,8],look:[0,1.4,0]},front:{pos:[0,2.8,8],look:[0,1.5,1]},breech:{pos:[4,4,-5],look:[0,2,-.5]},engine:{pos:[3,3,4],look:[0,1.4,2]},suspension:{pos:[4,1.6,-3],look:[0,.7,-1]},top:{pos:[.1,10,0],look:[0,0,0]}};
 const tourSteps=[['ZİS-6 üzerinde BM-13','Uzun kaputlu kabin, üç dingil ve raylı üst yapı.','iso',cab,false],['Şasi ve Dingiller','Kaplamaları açıp şasi ve yaprak yayları inceleyin.','suspension',axles,true],['Motor ve Kabin','Altı silindirli motor, radyatör, direksiyon ve gösterge paneli.','engine',motor,true],['Ray Yapısı','Sekiz ray, çapraz taşıyıcılar ve on altı dış gövde.','breech',rails,false],['Denge Ayakları','Ayaklar aşağıda ve tekerlek devri sıfırken gösterim çalışır.','breech',jackPart,false],['Parçalarına Ayır','18 grup halinde kamyon ve üst yapıyı inceleyin.','iso',chassis,false]].map((a,i)=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:i===5?65:0,sub:'all'}));
 const ui=K.ui({portraitCameraScale:1.65,title:'BM-13 KATYUŞA — ZİS-6 (1941)',sub:'Üç dingilli kamyon • 8 çift yüzlü ray • Müze referanslı görsel rekonstrüksiyon',subsystems:[{key:'Şasi',label:'Şasi ve Yürüyen Aksam',count:6,color:'#64748b'},{key:'Motor',label:'Motor',count:1,color:'#eab308'},{key:'Kabin',label:'Kabin ve Donanım',count:7,color:'#22c55e'},{key:'Ray Sistemi',label:'Ray Sistemi',count:4,color:'#ef4444'}],camLabels:{iso:'İzometrik',front:'Kabin',breech:'Raylar',engine:'Motor',suspension:'Dingiller',top:'Üst'},sliders:[{label:'Tekerlek Gösterim Devri',min:0,max:60,step:1,fmt:v=>v+' RPM'},{label:'Üst Yapı Açısı',min:-8,max:8,step:1,fmt:v=>v+'°'},{label:'Ray Yükselişi',min:5,max:45,step:1,fmt:v=>v+'°'}],buttons:{terrain:'Denge Ayakları',sweep:'Gösterimi Durdur'},telemetryTag:'BM-13 • MÜZE MODELİ',statLabels:['TEKERLEK DEVRİ','YÜKSELİŞ','KALAN GÖVDE','AYAKLAR']});
 update(0);return {root,parts,ui,camPresets,tourSteps,defaultPart:cab,firePart:rails,update,onFire:fire,mobileFireButtonLabel:()=>!S.ammo?'İkmal (16)':'Sıralı Gösterim',fireButtonLabel:()=>!S.ammo?'İKMAL (16)':'SIRALI GÖSTERİM',onSlider:(i,v)=>{if(i===0){S.rpm=T.MathUtils.clamp(v,0,60);if(S.rpm){S.salvo=false;S.jacks=false;}}if(i===1)S.yaw=T.MathUtils.clamp(v,-8,8);if(i===2)S.elev=T.MathUtils.clamp(v,5,45);update(0);return {};},onButton:n=>{if(n==='terrain'){S.jacks=!S.jacks;if(S.jacks)S.rpm=0;else S.salvo=false;}else S.salvo=false;update(0);return {};},buttonActive:n=>n==='terrain'?S.jacks:S.salvo,getSliderValues:()=>[S.rpm,S.yaw,S.elev],getStats:()=>[`${S.rpm} <span>RPM</span>`,`${S.elev} <span>°</span>`,`${S.ammo} <span>Adet</span>`,`${S.jacks?'AŞAĞIDA':'YUKARIDA'} <span></span>`],getStatus:()=>({text:S.salvo?'SIRALI GÖSTERİM':S.ammo?'İNCELEMEYE HAZIR':'İKMAL GEREKLİ',color:'#0284c7'}),applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
};})();
