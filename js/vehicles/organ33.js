/* Leonardo 33-barrel organ, inspired by Museo Scienza modern reconstruction.
 * Three rows of eleven. External museum model, not a firing simulation.
 */
(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.organ33=function(ctx){
 const K=window.MuseumModelKit(ctx,'organ33'),{T,root,parts,mats:M,mesh,box,cyl,ring,pipe,beam,instances}=K;
 const S={angle:0,target:0,speed:0,lift:0,cover:0,highlight:false};let n=0,finish='oak',relief=true;const counts={};
 const pixels=new Uint8Array(256*64*4);for(let y=0;y<64;y++)for(let x=0;x<256;x++){const v=Math.round(200+18*Math.sin(y*2.2+Math.sin(x*.018))+6*Math.sin(y*9.3+x*.04));pixels.set([v,v,v,255],(y*256+x)*4);}
 const grain=new T.DataTexture(pixels,256,64,T.RGBAFormat);grain.colorSpace=T.SRGBColorSpace;grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.needsUpdate=true;
 M.wood.color.setHex(0x977043);M.wood.map=grain;M.wood.userData.wood=true;const cord=new T.MeshStandardMaterial({color:0xb29a70,roughness:.95});
 function G(p,pos,name){const g=new T.Group();g.position.set(...pos);g.name=name;p.add(g);return g;}
 function P(key,name,sub,desc,exp,outer=false){counts[sub]=(counts[sub]||0)+1;const g=K.part(key,(++n)+'. '+name,sub,[0,0,0],exp,desc,outer);Object.assign(g.userData,{material:'Ahşap, bronz ve demir',weight:'Kütle hesaplanmıyor',spec:'Çizimden modern müze rekonstrüksiyonu; oranlar yaklaşık'});return g;}
 const frame=P('frame','Ahşap Taşıyıcı Şasi','Araba','Tekerlekler arasındaki ahşap gövde ve geriye uzanan kuyruk. Müze modelinden orantısal yorum.',[0,-.1,0]);
 for(const x of [-.99,.99])box(frame,[.16,.18,2],[x,1.25,-.25],M.wood);box(frame,[2.25,.15,.16],[0,1.25,-1.05],M.wood);
 const trail=P('trail','Arka Kuyruk ve Taşıma Tutamağı','Araba','Alçalan ahşap kuyruk, uçtaki tutuş ve yerdeki destek.',[0,-.1,-.6]);
 for(const x of [-.4,.4])beam(trail,[x,1.20,-1.05],[x*.4,.20,-2.5],.12,M.wood);box(trail,[.50,.13,.35],[0,.15,-2.5],M.wood);cyl(trail,.04,.7,[0,.25,-2.65],M.wood,'x');
 const axle=P('axle','Ortak Dingil ve Yataklar','Araba','İki büyük tekerlek ile döner çerçeve ortak enine eksen çevresinde yerleşir.',[.4,0,0]);
 cyl(axle,.065,2.95,[0,1.25,0],M.steel,'x');for(const x of [-1.0,1.0]){box(axle,[.18,.28,.28],[x,1.25,0],M.wood);ring(axle,.11,[x,1.25,0],M.dark,.025,[0,Math.PI/2,0]);}
 const wheels=P('wheels','Büyük Ahşap Tekerlekler','Araba','On iki ispit, kalın çember, demir dış kuşak ve merkez takviyeleri.',[.5,0,0]);
 for(const side of [-1,1]){const g=G(wheels,[side*1.28,1.25,0],'wheel-'+side);mesh(g,new T.TorusGeometry(1.17,.075,10,64),M.wood,[0,0,0],[0,Math.PI/2,0]);mesh(g,new T.CylinderGeometry(1.25,1.25,.13,64,1,true),M.dark,[0,0,0],[0,0,Math.PI/2]);cyl(g,.17,.24,[0,0,0],M.wood,'x');cyl(g,.095,.29,[0,0,0],M.dark,'x');for(let i=0;i<12;i++){const a=i*Math.PI/6;beam(g,[0,Math.sin(a)*.15,Math.cos(a)*.15],[0,Math.sin(a)*1.17,Math.cos(a)*1.17],.075,M.wood);}for(let i=0;i<24;i++){const a=i*Math.PI/12;cyl(g,.018,.15,[0,Math.sin(a)*1.18,Math.cos(a)*1.18],M.brass,'x');}}
 const hubs=P('hubs','Göbek Pimleri ve Kama Başları','Araba','Dingil uçlarında pul, pim ve halka. Tekerlek dokusu ayrı ahşap parçalarla okunur.',[.6,0,0]);
 for(const side of [-1,1]){ring(hubs,.075,[side*1.46,1.25,0],M.brass,.02,[0,Math.PI/2,0]);cyl(hubs,.019,.25,[side*1.49,1.25,0],M.steel);}
 const cradle=P('cradle','Üç Yüzlü Döner Çerçeve','Döner Düzen','Üç sıra aynı çerçeve üzerinde 120° aralıklarla yerleşir. Hareket yavaş inceleme içindir.',[0,.4,0]);
 const rotating=[];function R(p,name){const g=G(p,[0,1.25,0],name);rotating.push(g);return g;}
 const rotor=R(cradle,'rotor');for(const x of [-.88,.88])for(let i=0;i<3;i++){const a=i*2*Math.PI/3,b=(i+1)*2*Math.PI/3;beam(rotor,[x,.43*Math.cos(a),.43*Math.sin(a)],[x,.43*Math.cos(b),.43*Math.sin(b)],.055,M.wood);}for(let i=0;i<3;i++){const a=i*2*Math.PI/3;box(rotor,[1.84,.08,.08],[0,.43*Math.cos(a),.43*Math.sin(a)],M.wood);}
 const beds=P('beds','Üç Ahşap Namlu Yatağı','Döner Düzen','Her sıranın altında ayrı yatak ve enine bağlantı bulunur.',[0,.4,.2],true);
 const bedRotor=R(beds,'bed-rotor'),banks=[];
 for(let i=0;i<3;i++){const g=G(bedRotor,[0,0,0],'bed-'+i);g.rotation.x=i*Math.PI*2/3;box(g,[1.90,.065,.86],[0,.42,.10],M.wood);for(const z of [-.31,.47])box(g,[1.98,.04,.07],[0,.47,z],M.dark);}
 const barrels=[];
 for(let row=0;row<3;row++){
  const p=P('row'+row,(row+1)+'. Sıra — On Bir Bronz Namlu','Namlular','Açık ağızlı dış namlu geometrisi, kalın dudak ve arka bilezik. İç ateşleme veya mühimmat yapısı modellenmez.',[0,.5+row*.2,.3]);
  const r=R(p,'row-rotor-'+row),bank=G(r,[0,0,0],'bank-'+row);bank.rotation.x=row*Math.PI*2/3;
  const hinge=G(bank,[0,.51,-.40],'barrel-hinge-'+row);banks.push(hinge);
  const profile=[[0,0],[.064,0],[.064,.07],[.05,.11],[.047,.95],[.064,1.02],[.064,1.10],[.041,1.10],[.041,.85],[0,.85]].map(p=>new T.Vector2(...p));
  for(let i=0;i<11;i++){const x=(i-5)*.17,o=mesh(hinge,new T.LatheGeometry(profile,24),M.brass,[x,0,0],[Math.PI/2,0,0]);o.name='barrel-'+row+'-'+i;barrels.push({o,row});}
 }
 const hinges=P('hinges','Namlu Sıralarının Menteşeleri','Döner Düzen','Her on birli sıra bir enine menteşe ekseni üzerinde inceleme için kaldırılır.',[.3,.2,0]);
 const hingeRotor=R(hinges,'hinge-rotor');for(let i=0;i<3;i++){const g=G(hingeRotor,[0,0,0],'hinge-axis-'+i);g.rotation.x=i*Math.PI*2/3;cyl(g,.025,1.98,[0,.51,-.40],M.steel,'x');}
 const retainers=P('retainers','Üst Tutucu Çubuklar','Döner Düzen','Yan pimlere bağlı tutucu çubuklar. İnceleme açılırken yataktan uzaklaştırılır.',[0,.4,.3]);
 const retainRotor=R(retainers,'retain-rotor'),bars=[];for(let i=0;i<3;i++){const g=G(retainRotor,[0,0,0],'retain-'+i);g.rotation.x=i*Math.PI*2/3;const b=G(g,[0,.59,.30],'bar-'+i);cyl(b,.018,1.95,[0,0,0],M.dark,'x');bars.push(b);}
 const screw=P('screw','Yükseklik Ayar Vidası','Ayar','Kaynakta anlatılan sonsuz vida, arka tarafta dış biçimiyle gösterilir. Dişli oranı ve balistik çözüm hesaplanmaz.',[0,.3,-.5]);
 const screwGroup=G(screw,[0,.65,-1.45],'screw');cyl(screwGroup,.055,.65,[0,0,0],M.steel);const helix=[];for(let i=0;i<=160;i++){const a=i*Math.PI/8;helix.push([.06*Math.cos(a),-.30+i*.00375,.06*Math.sin(a)]);}pipe(screwGroup,helix,.012,M.brass);box(screw,[.30,.12,.22],[0,.90,-1.45],M.wood);
 const handle=P('handle','Vida Çevirme Tutamağı','Ayar','Ahşap enine tutamak ve metal bağlantı. Sergide dış donanım olarak incelenir.',[0,.2,-.5]);
 cyl(handle,.028,.42,[0,.32,-1.45],M.wood,'x');for(const x of [-.2,.2])cyl(handle,.035,.12,[x,.36,-1.45],M.wood);
 const bands=P('bands','Şasi Kuşakları ve Perçinler','Ayrıntı','Ahşap arabadaki demir kuşaklar ve dövme başlar.',[.3,.1,-.2]);
 for(const x of [-.99,.99])for(const z of [-.65,.65]){box(bands,[.19,.025,.12],[x,1.355,z],M.dark);cyl(bands,.025,.025,[x,1.38,z],M.brass);}
 const marker=P('marker','Çağdaş Sıra İşaretleri','Sergi','I, II ve III çizgili küçük işaretler sergi yönlendirmesidir; tarihsel yazıt değildir.',[0,.3,0]);
 const markerRotor=R(marker,'marker-rotor');for(let i=0;i<3;i++){const g=G(markerRotor,[0,0,0],'marker-'+i);g.rotation.x=i*Math.PI*2/3;for(let j=0;j<=i;j++)box(g,[.012,.035,.06],[-.06+j*.035,.48,-.30],M.brass);}
 function active(){return ((Math.round(-S.angle/120)%3)+3)%3;}
 function pose(){rotating.forEach(g=>g.rotation.x=S.angle*Math.PI/180);banks.forEach((g,i)=>{g.rotation.x=i===active()?-S.lift*Math.PI/180:0;});bars.forEach((g,i)=>{g.position.y=.59+(i===active()?S.lift*.009:0);});bedRotor.children.forEach(g=>{g.position.y=S.cover*.003*Math.cos(g.rotation.x);g.position.z=S.cover*.003*Math.sin(g.rotation.x);});barrels.forEach(({o,row})=>o.material.emissive.setHex(S.highlight&&row===active()?0x38270c:0));}
 function update(dt){if(Number.isFinite(dt)&&S.speed){S.angle=Math.min(S.target,S.angle+Math.max(0,Math.min(dt,.05))*30);if(S.angle>=S.target)S.speed=0;}pose();}
 function reset(){Object.assign(S,{angle:0,target:0,speed:0,lift:0,cover:0,highlight:false});pose();}
 const finishes={oak:{label:'Sıcak Ahşap (temsili)',color:0x977043},pale:{label:'Açık Ahşap (temsili)',color:0xb79b71},dark:{label:'Koyu Ahşap (temsili)',color:0x594331},aged:{label:'Müze Ahşabı (temsili)',color:0x82765e}};
 function applyTextures(bp){K.applyTextures(bp);K.meshes.forEach(({o})=>{if(o.material.userData.wood){o.userData.origColor.setHex(finishes[finish].color);if(!bp)o.material.color.copy(o.userData.origColor);o.material.map=grain;o.material.bumpMap=relief?grain:null;o.material.bumpScale=.008;o.material.needsUpdate=true;}});}
 const camPresets={iso:{pos:[4.8,3.8,5.1],look:[0,1.1,-.4]},front:{pos:[0,2.1,4],look:[0,1.3,0]},breech:{pos:[3,2.5,-4.5],look:[0,.9,-.8]},engine:{pos:[2.3,2.8,2.2],look:[0,1.4,0]},suspension:{pos:[4,1.9,.5],look:[.8,1.2,0]},top:{pos:[.01,7,-.4],look:[0,0,-.4]}};
 const tourSteps=[['Üç Sıra, Otuz Üç Namlu','Leonardo’nun çiziminden yapılmış Milano müze modeli esas alındı. Savaşta kullanıldığı doğrulanmış bir araç olarak sunulmaz.','iso',cradle,false],['Bronz Namlu Ağızları','Her sırada on bir namlu: kalın dudaklar, açık ağız boşluğu ve arka bilezik. Yalnız dış nesne geometrisi gösterilir.','front',parts.row0,false],['Sıra Değişimi','Ortak çerçeve 120° döndüğünde diğer sıra üst konuma gelir. Vurgu düğmesi seçili sırayı işaretler.','engine',beds,true],['Büyük Tekerlekler','On iki ahşap ispit, kalın çember, metal kuşak, göbek ve dingil pimi.','suspension',wheels,false],['Arka Ayar Donanımı','Kaynakta yükseklik ayarı için vida anlatılır. Burada vida ve tutamağı dış biçimiyle incelenir.','breech',screw,false],['Çizimden Müze Modeline','Sıra kaldırma ve yatak ayırma inceleme hareketleridir. Atış, mühimmat içi ve ateşleme düzeni modellenmez.','top',hinges,false]].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));
 const ui=K.ui({portraitCameraScale:1.75,title:'LEONARDO — 33 Namlulu Düzen',sub:'Üç sıra × on bir • Döner çerçeve • Çizimden rekonstrüksiyon',shadowExtent:6,subsystems:Object.entries(counts).map(([key,count],i)=>({key,label:key,count,color:['#8d7757','#ad915c','#657c88','#8c8170','#997b5f','#86765b'][i]})),camLabels:{iso:'Genel',front:'Namlu Ağızları',breech:'Ayar Vidası',engine:'Döner Çerçeve',suspension:'Tekerlek',top:'Üst'},sliders:[{label:'Çerçeveyi Elle Döndür',min:0,max:360,step:1,fmt:v=>Math.round(v)+'°'},{label:'Seçili Sırayı Kaldır',min:0,max:25,step:1,fmt:v=>v+'°'},{label:'Yatakları Ayır',min:0,max:100,step:1,fmt:v=>'%'+v}],buttons:{terrain:'Seçili Sırayı Vurgula',sweep:'Başlangıca Dön'},telemetryTag:'ÜÇ SIRA • ÇİZİMDEN REKONSTRÜKSİYON',statLabels:['SIRA','NAMLU','AÇI','STATÜ']});
 ui.textures=Object.entries(finishes).map(([key,v])=>({key,label:v.label}));ui.activeTexture=()=>finish;ui.textureLabel=()=>finishes[finish].label;ui.relief=()=>relief;ui.reliefLabel=v=>'Ahşap Ayrıntısı: '+(v?'AÇIK':'KAPALI');pose();applyTextures(false);
 return {root,parts,ui,camPresets,tourSteps,defaultPart:cradle,firePart:cradle,update,onFire:()=>{if(S.speed){S.speed=0;return {ok:true};}if(S.angle>=360)S.angle=0;S.target=Math.min(360,(Math.floor(S.angle/120)+1)*120);S.lift=0;S.cover=0;S.speed=1;return {ok:true};},fireButtonLabel:()=>S.speed?'DÖNÜŞÜ DURAKLAT':'SONRAKİ SIRAYA GEÇ',mobileFireButtonLabel:()=>S.speed?'Duraklat':'Sıra Değiştir',onSlider:(i,v)=>{if(!Number.isFinite(v))return {};S.speed=0;if(i===0){S.angle=T.MathUtils.clamp(v,0,360);S.lift=0;}if(i===1)S.lift=T.MathUtils.clamp(v,0,25);if(i===2)S.cover=T.MathUtils.clamp(v,0,100);pose();return {};},onButton:n=>{if(n==='terrain')S.highlight=!S.highlight;else reset();pose();return {};},buttonActive:n=>n==='terrain'?S.highlight:false,getSliderValues:()=>[S.angle,S.lift,S.cover],getStats:()=>[(active()+1)+' <span>/3</span>','33 <span>3 × 11</span>',Math.round(S.angle)+' <span>°</span>','ÇİZİM <span>rekonstrüksiyonu</span>'],getStatus:()=>({text:S.speed?'SIRA DEĞİŞİYOR':'DURAKLATILDI • İNCELE',color:'#9a794c'}),applyTextures,setTexture:k=>{if(finishes[k])finish=k;},toggleRelief:()=>{relief=!relief;return relief;}};
};})();
