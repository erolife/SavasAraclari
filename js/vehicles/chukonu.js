/* Chinese repeating crossbow, inspired by Musee Archerie Valois 2007.10.1.
 * Proportions and display motion are interpretive, not manufacturing data.
 */
(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.chukonu=function(ctx){
 const K=window.MuseumModelKit(ctx,'chukonu'),{T,root,parts,mats:M,mesh,box,cyl,ring,pipe,beam,instances}=K;
 const S={phase:0,speed:0,cover:0,ammo:12,bolts:true};let n=0,finish='oak',relief=true;const counts={};
 const pixels=new Uint8Array(256*64*4);for(let y=0;y<64;y++)for(let x=0;x<256;x++){const v=Math.round(200+18*Math.sin(y*2.2+Math.sin(x*.018))+6*Math.sin(y*9.3+x*.04));pixels.set([v,v,v,255],(y*256+x)*4);}
 const grain=new T.DataTexture(pixels,256,64,T.RGBAFormat);grain.colorSpace=T.SRGBColorSpace;grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.needsUpdate=true;
 M.wood.color.setHex(0x977043);M.wood.map=grain;M.wood.userData.wood=true;const cord=new T.MeshStandardMaterial({color:0xb29a70,roughness:.95});
 function G(p,pos,name){const g=new T.Group();g.position.set(...pos);g.name=name;p.add(g);return g;}
 function P(key,name,sub,desc,exp,outer=false){counts[sub]=(counts[sub]||0)+1;const g=K.part(key,(++n)+'. '+name,sub,[0,0,0],exp,desc,outer);Object.assign(g.userData,{material:'Ahşap, demir ve halat',weight:'Kütle hesaplanmıyor',spec:'19. yüzyıl örneğinden büyütülmüş sergi yorumu'});return g;}
 const stock=P('stock','Uzun Ahşap Gövde','Gövde','İnce kundak ve arkaya uzanan tutma bölümü. Müze fotoğrafındaki yalın profil esas alınır.',[0,-.2,0]);
 const outline=[[-1.65,1.12],[-1.62,1.30],[-.65,1.32],[.85,1.28],[1.38,1.12],[1.18,1.02],[-.50,1.12]];
 const sh=new T.Shape();outline.forEach(([z,y],i)=>i?sh.lineTo(z,y):sh.moveTo(z,y));sh.closePath();const body=mesh(stock,new T.ExtrudeGeometry(sh,{depth:.23,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:2,steps:1}),M.wood,[.115,0,0],[0,-Math.PI/2,0]);
 const grip=P('grip','Kundak Ucu ve Kenar Oyukları','Gövde','Ahşap arka tutuş, yuvarlatılmış kenarlar ve koyulaşmış uçlar.',[0,0,-.4]);
 box(grip,[.27,.21,.14],[0,1.22,-1.62],M.wood);for(const x of [-.12,.12])pipe(grip,[[x,1.22,-1.55],[x,1.24,-.8],[x,1.22,.65]],.008,M.dark);
 const mount=P('mount','Yay Yatağı ve Ahşap Kama','Gövde','Ön ahşap yatak, bağ ve kama başları. Birleşim ölçüleri yaklaşık yorumdur.',[0,-.1,.4]);
 box(mount,[.38,.20,.35],[0,1.05,.78],M.wood);cyl(mount,.07,.46,[0,1.07,.78],M.wood,'x');
 const bow=P('bow','Kavisli Ahşap Yay','Yay','Müze örneğindeki yatay yay profili. Kuvvet hesabı yapılmadan sabit biçimde sergilenir.',[0,.1,.4]);
 const bowPoints=[[-1.75,1.13,.58],[-1.35,1.05,.73],[-.7,1.02,.89],[0,1.02,.93],[.7,1.02,.89],[1.35,1.05,.73],[1.75,1.13,.58]];
 for(let j=0;j<3;j++)pipe(bow,bowPoints.map(([x,y,z])=>[x,y+j*.035,z]),.035,M.wood);
 const binding=P('binding','Yay Sargıları ve Uç Gözleri','Yay','Lif sargıları, ahşap katmanları ve kiriş uçlarını görsel olarak bağlar.',[0,.15,.3]);
 for(const x of [-1.35,-.30,.30,1.35])for(let i=0;i<6;i++)ring(binding,.075,[x+i*.017,1.07,.93-.12*Math.abs(x)],cord,.009,[0,Math.PI/2,0]);
 const tips=[];for(const side of [-1,1]){const p=new T.Vector3(side*1.75,1.13,.58);tips.push(p);ring(binding,.045,p.toArray(),cord,.012,[Math.PI/2,0,0]);}
 const string=P('string','Kiriş ve Orta Temas Noktası','Yay','Kiriş uçları yaya bağlı kalır. Orta noktanın yavaş yer değiştirmesi temsili bir sergi hareketidir.',[0,.15,0]);
 const strings=[0,1].map(()=>cyl(string,.012,1,[0,0,0],cord));
 function between(o,a,b){const d=b.clone().sub(a);o.position.copy(a).add(b).multiplyScalar(.5);o.scale.y=d.length();o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
 const leverPart=P('lever','Çift Kollu Ahşap Kaldıraç','Besleme','İki uzun ahşap kol ve enine tutamak. Bağlantılı hareket müze örneğinden sadeleştirilmiştir.',[.4,.3,-.2]);
 const lever=G(leverPart,[0,1.28,-.25],'lever');for(const x of [-.25,.25]){box(lever,[.065,.09,1.5],[x,0,-.75],M.wood);cyl(lever,.055,.085,[x,0,-.6],M.steel,'x');}cyl(lever,.065,.66,[0,0,-1.5],M.wood,'x');
 const pivots=P('pivots','Mafsal Pimleri ve Pullar','Besleme','Kaldıraç iki yandaki ortak eksene oturur; metal pim başları görünür.',[.3,.2,0]);
 cyl(pivots,.045,.64,[0,1.28,-.25],M.steel,'x');for(const x of [-.3,.3])cyl(pivots,.075,.025,[x,1.28,-.25],M.dark,'x');
 const magazinePart=P('magazine','Hareketli Üst Ok Haznesi','Besleme','Uzun dar hazne, yukarıda istiflenmiş kısa okları taşır. Model on iki ok gösterir.',[0,.65,0],true);
 const magazine=G(magazinePart,[0,0,0],'magazine'),walls=[];
 for(const side of [-1,1]){const g=G(magazine,[side*.15,.27,.75],'magazine-wall-'+side);box(g,[.05,.56,1.50],[0,0,0],M.wood);walls.push(g);}
 for(const z of [0,1.50])box(magazine,[.34,.56,.055],[0,.27,z],M.wood);
 const floor=P('floor','Hazne Tabanı ve Açık Kanal','Besleme','İki ince taban çıtası arasında açık kanal. Yan duvarları ayırmak çağdaş inceleme özelliğidir.',[0,.3,0]);
 const floorFrame=G(floor,[0,0,0],'floor-frame');for(const x of [-.10,.10])box(floorFrame,[.09,.055,1.5],[x,-.015,.75],M.wood);
 const lidPart=P('lid','Sürgülü Hazne Kapağı','Besleme','Üst ahşap kapak kaldırıldığında ok sırası görülür. Açıklık sergi kontrolüdür.',[0,.8,0],true);
 const lidFrame=G(lidPart,[0,0,0],'lid-frame'),lid=G(lidFrame,[0,.58,.75],'lid');box(lid,[.35,.045,1.55],[0,0,0],M.wood);box(lid,[.1,.045,.12],[0,.035,-.48],M.wood);
 const linksPart=P('links','Ön Kılavuz Bağlantıları','Besleme','Hazne ile kundak arasında bağlantılı iki kısa kılavuz. Bu dört mafsallı gösterim tarihsel mekanizmanın ölçülü kopyası değildir.',[.4,.2,.3]);
 const links=[-.20,.20].map(x=>{const o=box(linksPart,[.055,1,.065],[x,0,0],M.wood);return o;});
 const boltsPart=P('bolts','On İki Kısa Tüysüz Ok','Oklar','Müze anlatımındaki kısa, tüysüz oklar. Okların tamamı dış geometridir; uç biçimi yaklaşık sergi yorumudur.',[0,.5,0]);
 const boltFrame=G(boltsPart,[0,0,0],'bolt-frame'),bolts=[];
 for(let i=0;i<12;i++){const g=G(boltFrame,[0,.055+i*.039,.77],'bolt-'+i);cyl(g,.014,1.20,[0,0,0],M.wood,'z');mesh(g,new T.ConeGeometry(.024,.13,4),M.steel,[0,0,.665],[Math.PI/2,0,0]);bolts.push(g);}
 const trims=P('trims','Hazne Köşebentleri ve Çiviler','Ayrıntı','Köşe kuşakları, küçük çivi başları ve uç takviyeleri; yüzey yaşlanması renkle yorumlanır.',[.3,.3,0]);
 const trimFrame=G(trims,[0,0,0],'trim-frame');for(const x of [-.18,.18])for(const z of [.04,1.46]){box(trimFrame,[.025,.48,.06],[x,.27,z],M.dark);for(const y of [.08,.26,.46])cyl(trimFrame,.018,.03,[x,y,z],M.brass,'x');}
 const stand=P('stand','Çağdaş Müze Mesnedi','Sergi','Nesneden ayrı çağdaş taban ve iki taşıyıcı. Tarihsel silahın parçası değildir.',[0,-.3,0]);
 box(stand,[1.1,.10,2.5],[0,.05,-.1],M.dark);for(const z of [-.9,.65]){cyl(stand,.025,.87,[0,.54,z],M.brass);pipe(stand,[[-.16,1.03,z],[-.16,.98,z],[.16,.98,z],[.16,1.03,z]],.018,M.brass);}
 const display=P('display','Boşalma Göstergesi','Sergi','Gösterim çevriminde oklar birer birer eksilir. Gerçek atış hızı, uçuş veya balistik hesaplanmaz.',[0,0,.3]);
 box(display,[.48,.018,.23],[0,.112,.90],M.brass);for(let i=0;i<3;i++)box(display,[.28-i*.05,.007,.01],[0,.125,.84+i*.055],M.dark);
 function pose(){
  const f=(1-Math.cos(S.phase*Math.PI/50))/2,angle=(15+20*f)*Math.PI/180;lever.rotation.x=angle;
  const B=new T.Vector3(0,1.28+.6*Math.sin(angle),-.25-.6*Math.cos(angle)),D=new T.Vector3(0,1.28,1.25);
  // Circle intersection closes the four-bar display linkage at every pose.
  const dy=D.y-B.y,dz=D.z-B.z,dist=Math.hypot(dy,dz),a=(1.5**2-.6**2+dist**2)/(2*dist),h=Math.sqrt(Math.max(0,1.5**2-a*a));
  const C=new T.Vector3(0,B.y+a*dy/dist+h*dz/dist,B.z+a*dz/dist-h*dy/dist),rotation=-Math.atan2(C.y-B.y,C.z-B.z);
  for(const g of [magazine,floorFrame,lidFrame,boltFrame,trimFrame]){g.position.copy(B);g.rotation.x=rotation;}
  links.forEach((o,i)=>{const x=i?.20:-.20;between(o,new T.Vector3(x,D.y,D.z),new T.Vector3(x,C.y,C.z));});
  const center=new T.Vector3(0,1.13,.50-.65*f);strings.forEach((o,i)=>between(o,tips[i],center));
  walls.forEach((g,i)=>{g.position.x=(i?1:-1)*(.15+S.cover*.004);});lid.position.y=.58+S.cover*.005;
  bolts.forEach((g,i)=>{g.visible=S.bolts&&i<S.ammo;});
 }
 function update(dt){if(Number.isFinite(dt)&&S.speed&&S.ammo){S.phase+=Math.max(0,Math.min(dt,.05))*S.speed*25;if(S.phase>=100){S.phase-=100;S.ammo--;if(!S.ammo){S.phase=0;S.speed=0;}}}pose();}
 function reset(){Object.assign(S,{phase:0,speed:0,cover:0,ammo:12,bolts:true});pose();}
 const finishes={oak:{label:'Sıcak Ahşap (temsili)',color:0x977043},pale:{label:'Açık Ahşap (temsili)',color:0xb79b71},dark:{label:'Koyu Ahşap (temsili)',color:0x594331},aged:{label:'Müze Ahşabı (temsili)',color:0x82765e}};
 function applyTextures(bp){K.applyTextures(bp);K.meshes.forEach(({o})=>{if(o.material.userData.wood){o.userData.origColor.setHex(finishes[finish].color);if(!bp)o.material.color.copy(o.userData.origColor);o.material.map=grain;o.material.bumpMap=relief?grain:null;o.material.bumpScale=.008;o.material.needsUpdate=true;}});}
 const camPresets={iso:{pos:[4,3.4,4.5],look:[0,1.25,0]},front:{pos:[0,2.3,4.5],look:[0,1.2,.7]},breech:{pos:[2.5,2.6,-3.5],look:[0,1.6,-.4]},engine:{pos:[2.3,3.1,1.7],look:[0,1.7,.1]},suspension:{pos:[3,1.7,-.5],look:[0,1.25,0]},top:{pos:[.01,6,0],look:[0,1.1,0]}};
 const tourSteps=[['Çin Tekrarlayan Arbaleti','Crépy-en-Valois Müzesi 2007.10.1: 19. yüzyıl Çin örneği. İcat tarihiyle nesnenin tarihi aynı değildir.','iso',stock,false],['Yay ve Lif Bağları','Kavisli ahşap yay, katman sargıları ve bağlı kiriş. Yüzeyler müze fotoğrafından esinlenmiştir.','front',bow,false],['Çift Kollu Kaldıraç','Uzun iki kol ve tutamak hazneyle bağlantılı hareket eder. Bağlantı oranları yaklaşık sergi yorumudur.','breech',leverPart,false],['Üst Haznenin İçi','Yan duvarları ayırın; kısa tüysüz oklar ve dar alt kanal görünür.','engine',magazinePart,true],['Bir Çevrim, Bir Ok','Yavaş gösterim her tam çevrimde bir ok eksiltir. Hazne boşalınca durur; düğmeyle yenilenir.','suspension',boltsPart,false],['Nesne ve Sergi','Çağdaş mesnet tarihsel parçadan ayrıdır. Bu nesneye ait olmayan kesin hız, menzil veya mucit iddiası sunulmaz.','top',stand,false]].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));
 const ui=K.ui({portraitCameraScale:1.6,title:'CHU-KO-NU — Tekrarlayan Arbalet',sub:'19. yüzyıl Çin örneği • Üst hazne • Çift kollu kaldıraç',shadowExtent:6,subsystems:Object.entries(counts).map(([key,count],i)=>({key,label:key,count,color:['#8d7757','#ad915c','#657c88','#8c8170','#997b5f','#86765b'][i]})),camLabels:{iso:'Genel',front:'Yay',breech:'Kaldıraç',engine:'Hazne',suspension:'Bağlantılar',top:'Üst'},sliders:[{label:'Yavaş Gösterim Hızı',min:0,max:2,step:.25,fmt:v=>v+'×'},{label:'Elle Çevrim Evresi',min:0,max:100,step:1,fmt:v=>'%'+Math.round(v)},{label:'Hazneyi İncele',min:0,max:100,step:1,fmt:v=>'%'+v}],buttons:{terrain:'Okları Göster / Gizle',sweep:'Başlangıca Dön'},telemetryTag:'MÜZE ÖRNEĞİ • TEMSİLİ ÇEVRİM',statLabels:['OK','EVRE','HIZ','TARİH']});
 ui.textures=Object.entries(finishes).map(([key,v])=>({key,label:v.label}));ui.activeTexture=()=>finish;ui.textureLabel=()=>finishes[finish].label;ui.relief=()=>relief;ui.reliefLabel=v=>'Ahşap Ayrıntısı: '+(v?'AÇIK':'KAPALI');pose();applyTextures(false);
 return {root,parts,ui,camPresets,tourSteps,defaultPart:stock,firePart:leverPart,update,onFire:()=>{if(!S.ammo){S.ammo=12;S.phase=0;pose();return {refill:true};}S.speed=S.speed?0:1;return {ok:true};},fireButtonLabel:()=>!S.ammo?'ON İKİ OKLA YENİLE':S.speed?'GÖSTERİMİ DURAKLAT':'ÇEVRİMİ YAVAŞ OYNAT',mobileFireButtonLabel:()=>!S.ammo?'Yenile':S.speed?'Duraklat':'Çevrimi İzle',onSlider:(i,v)=>{if(!Number.isFinite(v))return {};if(i===0)S.speed=S.ammo?T.MathUtils.clamp(v,0,2):0;if(i===1){S.phase=T.MathUtils.clamp(v,0,100);S.speed=0;}if(i===2){S.cover=T.MathUtils.clamp(v,0,100);S.speed=0;}pose();return {};},onButton:n=>{if(n==='terrain')S.bolts=!S.bolts;else reset();pose();return {};},buttonActive:n=>n==='terrain'?S.bolts:false,getSliderValues:()=>[S.speed,S.phase,S.cover],getStats:()=>[S.ammo+' <span>/12</span>',Math.round(S.phase)+' <span>%</span>',S.speed+' <span>×</span>','19. <span>yüzyıl örneği</span>'],getStatus:()=>({text:S.speed?'YAVAŞ ÇEVRİM':!S.ammo?'HAZNE BOŞ':'DURAKLATILDI • İNCELE',color:'#9a794c'}),applyTextures,setTexture:k=>{if(finishes[k])finish=k;},toggleRelief:()=>{relief=!relief;return relief;}};
};})();
