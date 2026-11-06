/* Leonardo giant crossbow: enlarged/condensed museum interpretation, not a proven weapon.
 * Museo Scienza / Regione Lombardia ST070-00100. Display motion is not elastic physics.
 */
(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.giantbow=function(ctx){
 const K=window.MuseumModelKit(ctx,'giantbow'),{T,root,parts,mats:M,mesh,box,cyl,ring,pipe,beam,instances}=K;
 const S={draw:0,speed:0,direction:1,cover:0,figure:true};let n=0,finish='oak',relief=true;const counts={};
 const pixels=new Uint8Array(256*64*4);for(let y=0;y<64;y++)for(let x=0;x<256;x++){const v=Math.round(200+18*Math.sin(y*2.2+Math.sin(x*.018))+6*Math.sin(y*9.3+x*.04));pixels.set([v,v,v,255],(y*256+x)*4);}
 const grain=new T.DataTexture(pixels,256,64,T.RGBAFormat);grain.colorSpace=T.SRGBColorSpace;grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.needsUpdate=true;
 M.wood.color.setHex(0x977043);M.wood.map=grain;M.wood.userData.wood=true;const cord=new T.MeshStandardMaterial({color:0xb29a70,roughness:.95});
 function G(p,pos,name){const g=new T.Group();g.position.set(...pos);g.name=name;p.add(g);return g;}
 function P(key,name,sub,desc,exp,outer=false){counts[sub]=(counts[sub]||0)+1;const g=K.part(key,(++n)+'. '+name,sub,[0,0,0],exp,desc,outer);Object.assign(g.userData,{material:'Ahşap, demir ve halat',weight:'Kütle hesaplanmıyor',spec:'Çizimden müze yorumu; sahne yaklaşık 1:3'});return g;}
 const frame=P('frame','Uzun Ahşap Kundak','Şasi','Milano müze modelindeki uzun dar gövde. Çizimde tasarlanan dev ölçüler yaklaşık küçültülerek sergilenir.',[0,.2,0]);
 for(const x of [-.25,.25])box(frame,[.20,.20,7.55],[x,.78,-.15],M.wood);for(const z of [-3.6,-2,-.2,1.6,3.4])box(frame,[.75,.15,.16],[0,.76,z],M.wood);
 const deck=P('deck','Üst Tahtalar ve İnceleme Panelleri','Şasi','Üst kapaklar kaldırılınca kundağın enine bağları ve kurma donanımı açılır. Panel kaldırma müze arayüzü özelliğidir.',[0,.7,0],true);
 const lids=[];for(const x of [-.25,.25]){const g=G(deck,[x,.91,-.15],'cover-'+x);box(g,[.18,.055,7.45],[0,0,0],M.wood);lids.push(g);}
 const braces=P('braces','Çapraz Payandalar ve Uç Takviyeleri','Şasi','Uzun kirişleri bağlayan alt çaprazlar, baştaki yay yatağı ve arka kanca bağlantıları.',[0,-.1,0]);
 for(const z of [-2.8,-1.2,.4,2.0])for(const side of [-1,1])beam(braces,[side*.24,.63,z],[-side*.24,.63,z+1.1],.06,M.wood);
 box(braces,[1.0,.18,.58],[0,.96,2.8],M.wood);for(const x of [-.35,.35])box(braces,[.07,.25,.50],[x,1.04,2.8],M.dark);
 const axles=P('axles','Üç Dingil ve Yataklar','Şasi','Altı tekerlek üç enine dingile bağlanır. Yataklar kundağın altına sabitlenmiştir.',[0,-.15,0]);
 for(const z of [-2.8,-.15,2.55]){cyl(axles,.055,1.45,[0,.38,z],M.wood,'x');for(const x of [-.25,.25])box(axles,[.18,.34,.24],[x,.55,z],M.wood);}
 const wheelPart=P('wheels','Altı İspitli Tekerlek','Şasi','Her tekerlekte ayrı ahşap parmaklar, göbek ve ince demir çember. Tekerlekler zeminle temas eder.',[.5,0,0]);
 const wheels=[];for(const z of [-2.8,-.15,2.55])for(const side of [-1,1]){const g=G(wheelPart,[side*.61,.38,z],'wheel-'+side+'-'+z);wheels.push(g);mesh(g,new T.TorusGeometry(.335,.035,8,48),M.wood,[0,0,0],[0,Math.PI/2,0]);mesh(g,new T.CylinderGeometry(.38,.38,.10,48,1,true),M.dark,[0,0,0],[0,0,Math.PI/2]);cyl(g,.09,.16,[0,0,0],M.wood,'x');cyl(g,.035,.22,[0,0,0],M.steel,'x');for(let i=0;i<10;i++){const a=i*Math.PI/5;beam(g,[0,Math.sin(a)*.07,Math.cos(a)*.07],[0,Math.sin(a)*.34,Math.cos(a)*.34],.027,M.wood);}}
 const fittings=P('fittings','Kuşaklar, Pimler ve Kama Başları','Şasi','Şasi üstündeki metal kuşaklar ve ahşap birleşim pimleri. Görsel bağlantılar modern cıvata başları yerine sade biçimler kullanır.',[0,.2,0]);
 for(const z of [-3.4,-2.2,-1,.2,1.4,2.6,3.4]){for(const x of [-.25,.25]){box(fittings,[.23,.025,.10],[x,.96,z],M.dark);cyl(fittings,.022,.027,[x,.984,z],M.brass);}}
 const bow=P('bow','Katmanlı Dev Ahşap Yay','Yay','Ayrı ahşap laminalar kısalarak üst üste gelir. Eğilme, çizimi anlatan görsel deformasyondur; gerilme hesabı yapılmaz.',[0,.5,.4]);
 const LEAVES=9,STEPS=48,Y=1.15;const leaves=[];
 function zAt(x,draw){const t=Math.abs(x)/4;return 2.8-(.80+.65*draw)*t*t;}
 for(let j=0;j<LEAVES;j++){
  const geo=new T.BufferGeometry(),positions=new Float32Array((STEPS+1)*4*3),indices=[];
  for(let i=0;i<STEPS;i++)for(let face=0;face<4;face++){const a=i*4+face,b=i*4+(face+1)%4,c=(i+1)*4+face,d=(i+1)*4+(face+1)%4;indices.push(a,b,c,b,d,c);}
  indices.push(0,2,1,0,3,2,STEPS*4,STEPS*4+1,STEPS*4+2,STEPS*4,STEPS*4+2,STEPS*4+3);
  geo.setAttribute('position',new T.BufferAttribute(positions,3));const uv=new Float32Array((STEPS+1)*8);for(let i=0;i<=STEPS;i++)for(let k=0;k<4;k++){uv[(i*4+k)*2]=i/STEPS;uv[(i*4+k)*2+1]=k/3;}geo.setAttribute('uv',new T.BufferAttribute(uv,2));geo.setIndex(indices);const o=mesh(bow,geo,M.wood);leaves.push({o,half:4-j*.30,y:Y+j*.035});
 }
 const bands=P('bands','Yay Laminalarının Demir Bağları','Yay','Katman demetlerini saran bantlar. Bant konumları ve lamina kalınlıkları model yorumudur.',[0,.5,.2]);
 const bandGroups=[];for(const x of [-3.5,-2.7,-1.9,-1.1,-.4,.4,1.1,1.9,2.7,3.5]){const count=leaves.filter(l=>l.half>=Math.abs(x)).length,h=count*.035+.03,g=G(bands,[x,Y,0],'band-'+x);pipe(g,[[-.025,-.03,-.13],[-.025,h,-.13],[-.025,h,.13],[-.025,-.03,.13],[-.025,-.03,-.13]],.014,M.dark);bandGroups.push({g,x});}
 const nocks=P('nocks','Uç Bağları ve Halat Gözleri','Yay','Kiriş her iki yay ucundaki gözlere bağlı kalır; kurma sırasında uçları izler.',[0,.3,.4]);
 const tips=[];for(const side of [-1,1]){const g=G(nocks,[side*4,Y,2],'tip-'+side);ring(g,.075,[0,0,0],M.dark,.018,[Math.PI/2,0,0]);for(let i=0;i<5;i++)ring(g,.055,[side*(-.04-i*.025),0,0],cord,.008,[0,Math.PI/2,0]);tips.push(g);}
 const stringPart=P('string','Çift Kollu Kiriş','Yay','İki uçtan orta çekme kızağına uzanan kiriş. Uzunluk ve yay biçimi fizik yerine açıklayıcı sergi pozu olarak değişir.',[0,.4,.3]);
 const strings=[0,1].map(()=>cyl(stringPart,.018,1,[0,0,0],cord));
 function between(o,a,b){const d=b.clone().sub(a);o.position.copy(a).add(b).multiplyScalar(.5);o.scale.y=d.length();o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
 const sliderPart=P('slider','Çekme Kızağı ve Boş Yatak','Kurma','Kirişin ortasını çeken açık kızak. Kaynaklar atılacak cismi farklı anlattığından bu modelde yatak boş bırakılmıştır.',[0,.4,0]);
 const slider=G(sliderPart,[0,Y,1.9],'draw-slider');box(slider,[.28,.08,.22],[0,-.05,0],M.wood);for(const x of [-.11,.11])box(slider,[.03,.13,.15],[x,.025,0],M.dark);
 const lock=P('lock','Tutucu Kol ve Yatak Çıtaları','Kurma','Kundağa bağlı kılavuz çıtalar ve kızağın üstündeki tutucu. Ayrıntılı tetik kilidi yeniden üretilmez.',[0,.3,-.3]);
 for(const x of [-.12,.12])box(lock,[.025,.055,5.7],[x,1.04,.3],M.wood);
 const catchLever=G(slider,[0,.12,-.08],'catch-lever');beam(catchLever,[0,0,0],[0,.16,-.14],.032,M.steel);
 const winchPart=P('winch','Arka Kurma Tamburu','Kurma','Arka tambur ve yan yataklar. Gösterimde kızağın çekilmesiyle tambur dönmesi birlikte ilerler.',[0,.3,-.4]);
 const drum=G(winchPart,[0,Y,-2.8],'winch-drum');cyl(drum,.12,.46,[0,0,0],M.wood,'x');for(const x of [-.23,.23])cyl(drum,.17,.025,[x,0,0],M.dark,'x');for(const x of [-.36,.36]){box(winchPart,[.12,.26,.24],[x,1.06,-2.8],M.wood);cyl(winchPart,.035,.20,[x,Y,-2.8],M.steel,'x');}
 const haulPart=P('haul','İki Kurma Halatı','Kurma','Kızak ile tambur arasında kalan iki halat, hareket boyunca bağlantılarını korur. Dolanan sargıların sayısı temsili gösterilir.',[0,.3,-.2]);
 const hauling=[0,1].map(()=>cyl(haulPart,.012,1,[0,0,0],cord));
 for(let i=0;i<12;i++)ring(drum,.125,[-.18+i*.032,0,0],cord,.009,[0,Math.PI/2,0]);
 const handles=P('handles','Kurma Çarkları ve Tutamaklar','Kurma','Tambura bağlı iki ahşap çark ve dış tutamaklar. Bu aktarım oranı müze animasyonu için doğrudan alınmıştır.',[.5,.3,-.4]);
 const cranks=[];for(const side of [-1,1]){const g=G(handles,[side*.55,Y,-2.8],'crank-'+side);ring(g,.25,[0,0,0],M.wood,.025,[0,Math.PI/2,0]);for(let i=0;i<6;i++){const a=i*Math.PI/3;beam(g,[0,0,0],[0,Math.sin(a)*.25,Math.cos(a)*.25],.025,M.wood);}cyl(g,.025,.18,[side*.08,.25,0],M.wood,'x');cranks.push(g);}
 const scale=P('scale','Ölçek İçin Ahşap İnsan Figürü','Sergi','Yaklaşık insan ölçeğini karşılaştıran sade oyma figür. Tarihsel bir kişinin portresi değildir; gizlenebilir.',[.4,0,0]);
 const person=G(scale,[1.3,0,-2.4],'scale-person');
 function ell(p,pos,size){const o=mesh(p,new T.SphereGeometry(1,16,12),M.wood,pos);o.scale.set(...size);return o;}
 ell(person,[0,.49,0],[.065,.07,.06]);ell(person,[0,.34,0],[.085,.12,.045]);for(const side of [-1,1]){beam(person,[side*.04,.26,0],[side*.05,.055,.02],.045,M.wood);ell(person,[side*.05,.025,.035],[.035,.025,.06]);beam(person,[side*.08,.41,0],[side*.12,.25,.04],.035,M.wood);}
 function pose(){const d=S.draw/100;
  for(const l of leaves){const a=l.o.geometry.attributes.position;for(let i=0;i<=STEPS;i++){const x=-l.half+2*l.half*i/STEPS,z=zAt(x,d),corners=[[-.015,-.10],[.015,-.10],[.015,.10],[-.015,.10]];for(let k=0;k<4;k++)a.setXYZ(i*4+k,x,l.y+corners[k][0],z+corners[k][1]);}a.needsUpdate=true;l.o.geometry.computeVertexNormals();l.o.geometry.computeBoundingSphere();}
  tips.forEach(t=>{t.position.z=zAt(t.position.x,d);});bandGroups.forEach(({g,x})=>{g.position.z=zAt(x,d);});slider.position.z=1.90-3.60*d;
  const center=new T.Vector3(0,Y,slider.position.z);for(let i=0;i<2;i++)between(strings[i],tips[i].position,center);
  for(let i=0;i<2;i++){const x=i?.08:-.08;between(hauling[i],new T.Vector3(x,Y,slider.position.z),new T.Vector3(x,Y,-2.8));}
  drum.rotation.x=-3.6*d/.12;cranks.forEach(c=>{c.rotation.x=drum.rotation.x;});lids.forEach(g=>{g.position.y=.91+S.cover*.008;});scale.visible=S.figure;
 }
 function update(dt){if(Number.isFinite(dt)&&S.speed){S.draw=T.MathUtils.clamp(S.draw+Math.max(0,Math.min(dt,.05))*S.speed*S.direction*18,0,100);if(S.draw===0||S.draw===100)S.speed=0;}pose();}
 function reset(){Object.assign(S,{draw:0,speed:0,direction:1,cover:0,figure:true});pose();}
 const finishes={oak:{label:'Sıcak Ahşap (temsili)',color:0x977043},pale:{label:'Açık Ahşap (temsili)',color:0xb79b71},dark:{label:'Koyu Ahşap (temsili)',color:0x594331},aged:{label:'Müze Ahşabı (temsili)',color:0x82765e}};
 function applyTextures(bp){K.applyTextures(bp);K.meshes.forEach(({o})=>{if(o.material.userData.wood){o.userData.origColor.setHex(finishes[finish].color);if(!bp)o.material.color.copy(o.userData.origColor);o.material.map=grain;o.material.bumpMap=relief?grain:null;o.material.bumpScale=.008;o.material.needsUpdate=true;}});}
 const camPresets={iso:{pos:[9,7,10],look:[0,.8,0]},front:{pos:[0,5,9],look:[0,1.1,2.7]},breech:{pos:[3,3,-5.8],look:[0,1,-2.6]},engine:{pos:[2.6,3.3,-1.5],look:[0,1,-.5]},suspension:{pos:[3.2,1.8,.4],look:[0,.6,-.15]},top:{pos:[.01,13,0],look:[0,0,0]}};
 const tourSteps=[['Dev Bir Tasarım','Leonardo’nun dev arbaleti: çizim ile daha sonra yapılmış müze modeli birbirinden ayrılmalıdır. Çalışır savaş aracı olarak doğrulanmış değildir.','iso',frame,false],['Katmanlı Yay','Milano modelinde yay ahşap laminalardan oluşur. Bu sahnede dokuz ayrı tabaka ve onları saran bantlar görülür.','front',bow,false],['Altı Tekerlek','Üç dingil, ahşap parmaklar, göbekler ve demir çemberler. İnsan figürü ölçeğin büyüklüğünü karşılaştırmaya yarar.','suspension',wheelPart,false],['Kurma Tamburu','Kızak, iki halat, tambur ve el çarkları birlikte hareket eder. Hareket oranı ve esneme miktarı sergi yorumudur.','breech',winchPart,false],['Kundağın İç Yapısı','Panelleri kaldırın veya X-Ray açın; çaprazlar ve uzun kılavuz yatağını inceleyin.','engine',braces,true],['Çizimin Sınırları','Müze anlatımı yaklaşık 24 m yay açıklığı belirtir. Ölçüler ve malzeme davranışı bu görsel modelden üretim verisi olarak çıkarılamaz.','top',nocks,false]].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));
 const ui=K.ui({portraitCameraScale:1.85,title:'LEONARDO — Dev Arbalet',sub:'Çizimden rekonstrüksiyon • Altı tekerlek • Katmanlı ahşap yay',shadowExtent:12,subsystems:Object.entries(counts).map(([key,count],i)=>({key,label:key,count,color:['#8d7757','#ad915c','#657c88','#8c8170'][i]})),camLabels:{iso:'Genel',front:'Dev Yay',breech:'Kurma Tamburu',engine:'Kundak',suspension:'Tekerlekler',top:'Üst'},sliders:[{label:'Yavaş Kurma Hızı',min:0,max:2,step:.25,fmt:v=>v+'×'},{label:'Elle Kurma Evresi',min:0,max:100,step:1,fmt:v=>'%'+Math.round(v)},{label:'İnceleme Panelleri',min:0,max:100,step:1,fmt:v=>'%'+v}],buttons:{terrain:'Ölçek Figürünü Göster / Gizle',sweep:'Başlangıca Dön'},telemetryTag:'ÇİZİM • MÜZE MODELİ • YORUM',statLabels:['KURMA','HIZ','YAY AÇIKLIĞI','STATÜ']});
 ui.textures=Object.entries(finishes).map(([key,v])=>({key,label:v.label}));ui.activeTexture=()=>finish;ui.textureLabel=()=>finishes[finish].label;ui.relief=()=>relief;ui.reliefLabel=v=>'Ahşap Ayrıntısı: '+(v?'AÇIK':'KAPALI');pose();applyTextures(false);
 return {root,parts,ui,camPresets,tourSteps,defaultPart:frame,firePart:sliderPart,update,onFire:()=>{if(S.speed)S.speed=0;else{S.direction=S.draw>=100?-1:S.draw<=0?1:S.direction;S.speed=1;}return {ok:true};},fireButtonLabel:()=>S.speed?'GÖSTERİMİ DURAKLAT':S.draw>=100?'KURMAYI GERİ AL':'KURMAYI YAVAŞ OYNAT',mobileFireButtonLabel:()=>S.speed?'Duraklat':S.draw>=100?'Geri Al':'Kurmayı İzle',onSlider:(i,v)=>{if(!Number.isFinite(v))return {};if(i===0){S.speed=T.MathUtils.clamp(v,0,2);if(S.draw>=100)S.direction=-1;if(S.draw<=0)S.direction=1;}if(i===1){S.draw=T.MathUtils.clamp(v,0,100);S.speed=0;}if(i===2){S.cover=T.MathUtils.clamp(v,0,100);S.speed=0;}pose();return {};},onButton:n=>{if(n==='terrain')S.figure=!S.figure;else reset();pose();return {};},buttonActive:n=>n==='terrain'?S.figure:false,getSliderValues:()=>[S.speed,S.draw,S.cover],getStats:()=>[Math.round(S.draw)+' <span>%</span>',S.speed+' <span>×</span>','~24 <span>m tasarım</span>','ÇİZİM <span>rekonstrüksiyonu</span>'],getStatus:()=>({text:S.speed?'YAVAŞ KURMA GÖSTERİMİ':'DURAKLATILDI • İNCELE',color:'#9a794c'}),applyTextures,setTexture:k=>{if(finishes[k])finish=k;},toggleRelief:()=>{relief=!relief;return relief;}};
};})();
