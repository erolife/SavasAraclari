/* Sword-pistol inspired by Met 2018.371, attributed to Niefind.
 * External museum interpretation only; no functional ignition internals.
 */
(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.swordpistol=function(ctx){
 const K=window.MuseumModelKit(ctx,'swordpistol'),{T,root,parts,mats:M,mesh,box,cyl,ring,pipe,beam,instances}=K;
 const S={angle:0,target:180,speed:0,plate:0,cock:0,ornament:true};let n=0,finish='dark',relief=true;const counts={};
 const pixels=new Uint8Array(256*64*4);for(let y=0;y<64;y++)for(let x=0;x<256;x++){const v=Math.round(200+18*Math.sin(y*2.2+Math.sin(x*.018))+6*Math.sin(y*9.3+x*.04));pixels.set([v,v,v,255],(y*256+x)*4);}
 const grain=new T.DataTexture(pixels,256,64,T.RGBAFormat);grain.colorSpace=T.SRGBColorSpace;grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.needsUpdate=true;
 M.wood.color.setHex(0x977043);M.wood.map=grain;M.wood.userData.wood=true;const cord=new T.MeshStandardMaterial({color:0xb29a70,roughness:.95});
 function G(p,pos,name){const g=new T.Group();g.position.set(...pos);g.name=name;p.add(g);return g;}
 const specimen=new T.Group();specimen.name="specimen";root.add(specimen);
 function P(key,name,sub,desc,exp,outer=false){counts[sub]=(counts[sub]||0)+1;const g=K.part(key,(++n)+'. '+name,sub,[0,0,0],exp,desc,outer);specimen.add(g);Object.assign(g.userData,{material:'Çelik ve ahşap',weight:'Kütle hesaplanmıyor',spec:'Met 2018.371 örneğinden büyütülmüş dış yorum'});return g;}
 M.steel.color.setHex(0xa5adb0);M.steel.roughness=.36;M.dark.color.setHex(0x50565a);
 const blade=P('blade','Uzun Çelik Kılıç Ağzı','Kılıç','Düz sırt, daralan uç ve kesici yüzeyler. Kalınlığı olan yüzeyli geometri; düz bir çizgi veya levha değildir.',[0,.2,.6]);
 // Longitudinal diamond sections give a genuine beveled blade and taper.
 const sections=[[-.65,.16,.045],[0,.16,.043],[1.7,.145,.035],[2.65,.11,.023],[3.05,.015,.008],[3.15,0,0]],verts=[],idx=[];
 for(const [z,w,t] of sections)verts.push(-t,1.23,z,0,1.23+w,z,t,1.23,z,0,1.23-w,z);
 for(let i=0;i<sections.length-1;i++)for(let k=0;k<4;k++){const a=i*4+k,b=i*4+(k+1)%4,c=(i+1)*4+k,d=(i+1)*4+(k+1)%4;idx.push(a,c,b,b,c,d);}
 idx.push(0,1,2,0,2,3);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();mesh(blade,geo,M.steel).name='blade';
 const fuller=P('fuller','Kılıç Yüzündeki Uzun Yivler','Kılıç','İki yandaki dar yivler ve çizgisel yüzey geçişleri. Küçük oluklar fotoğraftan yorumlanmıştır.',[.2,.1,.3]);
 for(const side of [-1,1]){pipe(fuller,[[side*.034,1.27,-.50],[side*.031,1.27,.4],[side*.024,1.26,1.7],[side*.018,1.25,2.55]],.008,M.dark);pipe(fuller,[[side*.034,1.20,-.5],[side*.031,1.20,.4],[side*.024,1.20,1.7]],.005,M.dark);}
 const ricasso=P('ricasso','Kök ve Sırt Takviyesi','Kılıç','Kabza önündeki kalın kök, kısa bilezikler ve üst sırt çizgisi.',[0,.15,-.2]);
 box(ricasso,[.12,.30,.55],[0,1.24,-.60],M.steel);for(let i=0;i<4;i++)box(ricasso,[.125,.315,.012],[0,1.24,-.35+i*.025],M.dark);
 const barrel=P('barrel','Kılıç Sırtındaki Kısa Namlu','Tabanca','Kılıç doğrultusuna paralel kısa dış namlu. Ağız boşluğu yalnız görsel yüzeydir; iç ateşleme yapısı yoktur.',[.2,.3,.2]);
 const profile=[[0,0],[.075,0],[.075,.14],[.065,.18],[.060,1.25],[.070,1.30],[.070,1.35],[.045,1.35],[.045,1.10],[0,1.10]].map(p=>new T.Vector2(...p));
 const tube=mesh(barrel,new T.LatheGeometry(profile,32),M.steel,[.07,1.39,-.65],[Math.PI/2,0,0]);tube.name='barrel';
 const bands=P('bands','Namlu Bilezikleri ve Bağlantı Yüzeyi','Tabanca','İnce çelik bilezikler ve kılıç kökündeki bağlantı. Ölçüler görsel yorumdur.',[.2,.3,.1]);
 for(const z of [-.48,-.40,.61])ring(bands,.069,[.07,1.39,z],M.dark,.008);box(bands,[.10,.10,1.10],[.05,1.31,-.01],M.dark);
 const platePart=P('plate','Oymalı Dış Kilit Levhası','Tabanca','Ayrılabilir dış levha. Arkasında işleyen bir ateşleme mekanizması sunulmaz; yalnız nesne yüzeyleri incelenir.',[.5,.15,-.3],true);
 const plate=G(platePart,[0,0,0],'lock-plate');
 const outline=[[-1.50,1.22],[-1.43,1.43],[-.90,1.48],[-.35,1.43],[-.24,1.31],[-.50,1.15],[-1.25,1.13]];
 function sideShape(p,points,depth,x,mat){const sh=new T.Shape();points.forEach(([z,y],i)=>i?sh.lineTo(z,y):sh.moveTo(z,y));sh.closePath();return mesh(p,new T.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2}),mat,[x,0,0],[0,Math.PI/2,0]);}
 // Shape local horizontal maps to negative world Z for +90 Y, so reverse Z here.
 sideShape(plate,outline.map(([z,y])=>[-z,y]),.025,.125,M.steel);
 const cockPart=P('cock','Çakmak Kolu Dış Biçimi','Tabanca','Kıvrımlı kol ve çeneler. İnceleme açısı yavaş elle değişir; kıvılcım veya atış gösterimi yoktur.',[.4,.3,-.3]);
 const cock=G(cockPart,[.16,1.40,-1.02],'cock');
 pipe(cock,[[0,0,0],[0,.08,-.08],[0,.22,-.10],[0,.36,.03],[0,.40,.12]],.037,M.dark);cyl(cock,.09,.055,[0,0,0],M.steel,'x');box(cock,[.12,.045,.16],[0,.36,.12],M.steel);box(cock,[.10,.025,.14],[0,.43,.12],M.steel);box(cock,[.08,.05,.10],[0,.395,.15],M.rubber);cyl(cock,.022,.11,[0,.46,.09],M.steel);cyl(cock,.04,.018,[0,.52,.09],M.dark);
 const frizzen=P('frizzen','Karşı Çelik ve Kıvrımlı Dil','Tabanca','Fotoğraftaki dış çelik parça, küçük menteşe ve eğri dil. İşlevsel temas veya tetikleme modeli değildir.',[.4,.3,0]);
 pipe(frizzen,[[.16,1.37,-.51],[.16,1.51,-.43],[.16,1.66,-.37],[.16,1.72,-.18]],.023,M.steel);cyl(frizzen,.04,.09,[.16,1.37,-.51],M.dark,'x');
 const grip=P('grip','Kıvrımlı Ahşap Kabza','Kabza','Koyu ahşap kabza arka uçta aşağı kıvrılır. Fotoğraftaki aşınma, damar ve kenar çerçevesi yorumlanır.',[0,.1,-.6]);
 const gripShape=[[-2.12,.91],[-2.22,1.03],[-2.18,1.20],[-1.95,1.34],[-1.65,1.43],[-1.40,1.45],[-1.36,1.20],[-1.66,1.17],[-1.91,1.07],[-1.98,.91]];
 sideShape(grip,gripShape.map(([z,y])=>[-z,y]),.22,-.11,M.wood);
 const pommel=P('pommel','Kabza Ucu ve Metal Sırt','Kabza','Kabza ucunda yuvarlatılmış metal başlık, sırt boyunca ince çelik kuşak.',[0,.1,-.7]);
 pipe(pommel,[[0,1.45,-1.42],[0,1.43,-1.65],[0,1.34,-1.97],[0,1.20,-2.18],[0,1.02,-2.19]],.045,M.dark);
 const cap=mesh(pommel,new T.SphereGeometry(1,24,16),M.dark,[0,.98,-2.10]);cap.scale.set(.13,.10,.13);
 const guard=P('guard','Uzun El Koruması','Kabza','Kabza ucundan öne uzanan ince çelik el koruması; gerçek açık boşluk içerir.',[0,-.2,-.3]);
 pipe(guard,[[0,.96,-2.10],[0,.78,-2.08],[0,.73,-1.85],[0,.73,-1.20],[0,.78,-.85],[0,.93,-.76],[0,1.10,-.84]],.025,M.steel);
 const trigger=P('trigger','Dış Tetik ve Küçük Koruyucu','Tabanca','Yalnız dış siluet. İç yaylar, kilit yüzeyleri veya ateşleme sırası modellenmez.',[.2,-.2,-.3]);
 pipe(trigger,[[.025,1.15,-1.05],[.025,1.04,-1.00],[.025,.98,-1.05]],.018,M.dark);pipe(trigger,[[0,1.14,-1.30],[0,.76,-1.30]],.014,M.dark);
 const ornament=P('ornament','Kıvrımlı Oyma ve Rozetler','Bezeme','Metal yüzeyde kabartma kıvrımlar ve küçük rozetler. Özgün askerî figürlerin birebir kopyası değil, açıkça yorumlanmış bezemedir.',[.3,.2,-.3]);
 const ornamentFrame=G(ornament,[0,0,0],'ornament-frame');
 for(const side of [-1,1]){
  for(const [z,y,r] of [[-1.18,1.31,.105],[-.94,1.27,.06],[-1.83,1.23,.07]]){
   const pts=[];for(let i=0;i<=48;i++){const a=i*Math.PI/12,rr=r*(1-i/65);pts.push([side*(z<-1.5?.121:.16),y+rr*Math.sin(a),z+rr*Math.cos(a)]);}pipe(ornamentFrame,pts,.009,M.dark);
  }
  for(let i=0;i<7;i++){const z=-1.95+i*.09;pipe(ornamentFrame,[[side*.122,1.24,z],[side*.13,1.28,z+.025],[side*.122,1.30,z+.055]],.006,M.steel);}
 }
 const screws=P('screws','Yarıklı Vidalar ve Kenar İşleri','Bezeme','Dış bağlantı başları, tek yarıklı yüzeyler ve levha bordürü.',[.3,.15,-.3]);
 const screwFrame=G(screws,[0,0,0],'screw-frame');for(const z of [-1.40,-1.10,-.40]){cyl(screwFrame,.035,.04,[.17,1.30,z],M.dark,'x');box(screwFrame,[.006,.009,.047],[.194,1.30,z],M.steel);}
 for(const y of [1.18,1.42])pipe(screwFrame,[[.16,y,-1.35],[.16,y,-1.0],[.16,y,-.48]],.006,M.dark);
 const stand=P('stand','Döner Müze Kaidesi ve Mesnetler','Sergi','Çağdaş kaide ve destekler nesneyle birlikte döner; tarihsel parçalar değildir.',[0,-.3,0]);
 box(stand,[.85,.12,5.8],[0,.06,.40],M.dark);cyl(stand,.022,1.04,[-.20,.64,-1.7],M.brass);pipe(stand,[[-.20,1.16,-1.7],[-.10,1.16,-1.7],[0,1.16,-1.7],[.10,1.16,-1.7]],.016,M.brass);cyl(stand,.022,.94,[0,.58,1.6],M.brass);pipe(stand,[[-.10,1.10,1.6],[-.10,1.04,1.6],[.10,1.04,1.6],[.10,1.10,1.6]],.016,M.brass);
 const label=P('label','Çağdaş Sergi Levhası','Sergi','Kaynak: Met 2018.371. Müze nesnesi av silahı olarak tanımlar; yaygın savaş kullanımı iddiası kurulmaz.',[0,-.2,.4]);
 box(label,[.42,.016,.25],[0,.13,2.8],M.brass);for(let i=0;i<3;i++)box(label,[.27-i*.04,.006,.01],[0,.143,2.73+i*.055],M.dark);
 function pose(){specimen.rotation.y=S.angle*Math.PI/180;plate.position.x=S.plate*.004;cock.position.x=.16+S.plate*.004;cock.rotation.x=S.cock*Math.PI/180;ornamentFrame.position.x=S.plate*.004;screwFrame.position.x=S.plate*.004;ornament.visible=S.ornament;}
 function update(dt){if(Number.isFinite(dt)&&S.speed){S.angle=Math.min(S.target,S.angle+Math.max(0,Math.min(dt,.05))*36);if(S.angle>=S.target)S.speed=0;}pose();}
 function reset(){Object.assign(S,{angle:0,target:180,speed:0,plate:0,cock:0,ornament:true});pose();}
 const finishes={oak:{label:'Sıcak Ahşap (temsili)',color:0x977043},pale:{label:'Açık Ahşap (temsili)',color:0xb79b71},dark:{label:'Koyu Ahşap (temsili)',color:0x594331},aged:{label:'Müze Ahşabı (temsili)',color:0x82765e}};
 function applyTextures(bp){K.applyTextures(bp);K.meshes.forEach(({o})=>{if(o.material.userData.wood){o.userData.origColor.setHex(finishes[finish].color);if(!bp)o.material.color.copy(o.userData.origColor);o.material.map=grain;o.material.bumpMap=relief?grain:null;o.material.bumpScale=.008;o.material.needsUpdate=true;}});}
 const camPresets={iso:{pos:[5,3.8,5.5],look:[0,1.1,.4]},front:{pos:[4,1.8,1.5],look:[0,1.2,1]},breech:{pos:[3,2.1,-2.8],look:[0,1.3,-1.25]},engine:{pos:[2.2,1.8,-.1],look:[0,1.4,-.85]},suspension:{pos:[-3,1.9,-2.2],look:[0,1.2,-1.1]},top:{pos:[.01,7,.4],look:[0,0,.4]}};
 const tourSteps=[['İki Nesne, Tek Gövde','Met 2018.371: Saksonya, Niefind’e atfedilen av silahı. Müze başlığı yaklaşık 1740, açıklama yaklaşık 1730 der; burada 18. yüzyılın ilk yarısı kullanılır.','iso',blade,false],['Çelik Yüzey ve Yiv','Uzun kılıcın kalınlığı, daralan ucu ve iki yanındaki yivler ışıkla farklı görünür.','front',fuller,false],['Ahşap Kabza','Kıvrımlı koyu ahşap, metal sırt, kabza başı ve uzun açık el koruması.','breech',grip,false],['Dış Kilit Levhası','Levha, çakmak kolu, karşı çelik ve yarıklı vidalar dış biçimleriyle gösterilir. İç ateşleme düzeni modellenmez.','engine',platePart,true],['Oyma ve Bezeme','Rozetler ve kıvrımlar, müze fotoğrafındaki işçiliği anlatan yorumlardır; özgün askerî figürlerin kopyası değildir.','suspension',ornament,false],['Nesnenin İki Yüzü','Yavaş döndürme ile öbür yüzü görün. 65,5 cm müze nesnesinin toplam uzunluğudur; model sergi için büyütülmüştür.','top',guard,false]].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));
 const ui=K.ui({portraitCameraScale:1.95,title:'KILIÇ–TABANCA — Saksonya Av Silahı',sub:'Met 2018.371 • Niefind’e atıf • 18. yüzyılın ilk yarısı',shadowExtent:7,subsystems:Object.entries(counts).map(([key,count],i)=>({key,label:key,count,color:['#8d7757','#ad915c','#657c88','#8c8170','#997b5f'][i]})),camLabels:{iso:'Genel',front:'Kılıç Yüzeyi',breech:'Kabza',engine:'Dış Kilit',suspension:'Diğer Yüz',top:'Üst'},sliders:[{label:'Nesneyi Döndür',min:0,max:360,step:1,fmt:v=>Math.round(v)+'°'},{label:'Dış Levhayı Ayır',min:0,max:100,step:1,fmt:v=>'%'+v},{label:'Çakmak Kolu İnceleme Açısı',min:0,max:25,step:1,fmt:v=>v+'°'}],buttons:{terrain:'Bezeme Göster / Gizle',sweep:'Başlangıca Dön'},telemetryTag:'MET 2018.371 • DIŞ NESNE İNCELEMESİ',statLabels:['AÇI','LEVHA','NESNE UZUNLUĞU','BAĞLAM']});
 ui.textures=Object.entries(finishes).map(([key,v])=>({key,label:v.label}));ui.activeTexture=()=>finish;ui.textureLabel=()=>finishes[finish].label;ui.relief=()=>relief;ui.reliefLabel=v=>'Yüzey Ayrıntısı: '+(v?'AÇIK':'KAPALI');pose();applyTextures(false);
 return {root,parts,ui,camPresets,tourSteps,defaultPart:blade,firePart:platePart,update,onFire:()=>{if(S.speed){S.speed=0;return {ok:true};}if(S.angle>=360)S.angle=0;S.target=Math.min(360,(Math.floor(S.angle/180)+1)*180);S.speed=1;return {ok:true};},fireButtonLabel:()=>S.speed?'DÖNÜŞÜ DURAKLAT':'DİĞER YÜZÜ YAVAŞ GÖSTER',mobileFireButtonLabel:()=>S.speed?'Duraklat':'Diğer Yüz',onSlider:(i,v)=>{if(!Number.isFinite(v))return {};S.speed=0;if(i===0)S.angle=T.MathUtils.clamp(v,0,360);if(i===1)S.plate=T.MathUtils.clamp(v,0,100);if(i===2)S.cock=T.MathUtils.clamp(v,0,25);pose();return {};},onButton:n=>{if(n==='terrain')S.ornament=!S.ornament;else reset();pose();return {};},buttonActive:n=>n==='terrain'?S.ornament:false,getSliderValues:()=>[S.angle,S.plate,S.cock],getStats:()=>[Math.round(S.angle)+' <span>°</span>',S.plate+' <span>%</span>','65,5 <span>cm (kaynak)</span>','AV <span>birleşik nesne</span>'],getStatus:()=>({text:S.speed?'DİĞER YÜZE DÖNÜYOR':'DURAKLATILDI • İNCELE',color:'#9a794c'}),applyTextures,setTexture:k=>{if(finishes[k])finish=k;},toggleRelief:()=>{relief=!relief;return relief;}};
};})();
