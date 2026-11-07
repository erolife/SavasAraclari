/* Met 35.113.1a–oo, 1719–20. Enlarged museum interpretation; ornaments simplified. */
(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.ottomanbow=function(ctx){
 const K=window.MuseumModelKit(ctx,'ottomanbow'),{T,root,parts,mats:M,mesh,box,cyl,ring,pipe,beam,instances}=K;
 const S={layers:0,draw:0,turn:0,strung:false,arrows:true};let n=0,last='';const counts={};
 const horn=M.dark.clone();horn.color.setHex(0x302b27);const sinew=M.wood.clone();sinew.color.setHex(0xc6ac7d);
 const lacquer=new T.MeshStandardMaterial({color:0x552f29,roughness:.40,metalness:.1});const gold=M.brass.clone();gold.color.setHex(0xb49a5d);
 function G(p,pos,name){const g=new T.Group();g.position.set(...pos);g.name=name;p.add(g);return g;}
 const mount=G(root,[-.65,2.35,0],'bow-mount');
 function P(key,name,sub,desc,exp=[0,0,.3],outer=false,parent=mount){counts[sub]=(counts[sub]||0)+1;const p=K.part(key,++n+'. '+name,sub,[0,0,0],exp,desc,outer,parent);p.userData.material='Ahşap, boynuz, sinir, lake ve altın renkli bezeme';p.userData.spec='Met 35.113.1a–oo • büyütülmüş müze yorumu';return p;}
 const stand=P('stand','Müze Kaidesi ve İnce Mesnet','Sergi','Çağdaş sergi kaidesi; nesneler ayrıntı incelemesi için büyütülmüştür.',[0,0,0],false,root);
 box(stand,[4.8,.12,2.5],[0,.06,0],M.dark);for(const y of [1.3,3.1]){beam(stand,[-.25,.12,-.38],[-.25,y,-.38],.022,M.dark);beam(stand,[-.25,y,-.38],[-.25,y,-.10],.02,M.dark);}
 const grip=P('grip','Ortası Dolgun Kabza','Yay','Fotoğraftaki dolgun tutamak. Nesnenin hatları yaklaşık, yapı katmanları eğitim yorumudur.',[0,0,.2]);
 const handle=mesh(grip,new T.SphereGeometry(1,24,16),lacquer,[.4,0,0]);handle.scale.set(.125,.35,.105);
 function curve(){const d=S.draw/100,endY=Math.sqrt(1.65**2-(.55+.7*d)**2);const points=S.strung?[[.25,-endY],[-.03,-endY*.84],[-.31,-endY*.6],[-.39,-.45],[-.40,0],[-.39,.45],[-.31,endY*.6],[-.03,endY*.84],[.25,endY]]:[[-1,-1.65],[-.65,-1.78],[-.1,-1.63],[.30,-1.10],[.41,-.48],[.4,0],[.41,.48],[.30,1.10],[-.1,1.63],[-.65,1.78],[-1,1.65]];return new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p[0],p[1],0)));}
 function ribbon(c,width,depth,z){const verts=[],idx=[],N=100;for(let j=0;j<=N;j++){const t=j/N,v=c.getPoint(t),tan=c.getTangent(t),normal=new T.Vector3(-tan.y,tan.x,0),w=width*(.68+.32*Math.sin(Math.PI*t));for(const [side,dz] of [[-1,-1],[1,-1],[1,1],[-1,1]])verts.push(v.x+normal.x*w*side,v.y+normal.y*w*side,z+dz*depth/2);}
  for(let j=0;j<N;j++)for(let k=0;k<4;k++){const a=j*4+k,b=j*4+(k+1)%4;idx.push(a,b,a+4,b,b+4,a+4);}idx.push(0,2,1,0,3,2,N*4,N*4+1,N*4+2,N*4,N*4+2,N*4+3);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex(idx);g.computeVertexNormals();return g;
 }
 const wood=P('wood','Ahşap Çekirdek','Katmanlar','Katmanların sırası kavramsal kesittir; yapıştırıcı, kalınlık ve üretim tarifi verilmez.',[0,0,.3]);
 const belly=P('horn','Boynuz Katmanı','Katmanlar','Yayın karın tarafındaki boynuz. Ayrılmış görünüm kalınlıkları gerçek ölçü değildir.',[0,0,-.4]);
 const back=P('sinew','Sinir Katmanı','Katmanlar','Sırt tarafındaki lifli sinir katmanı; lifler görsel olarak vurgulanmıştır.',[0,0,.5]);
 const finish=P('lacquer','Lake Yüzey','Bezeme','Koyu lake ve yer yer aşınmış görünüm. Müze fotoğrafının renklerinden yaklaşık yorum; tıpatıp bezeme kopyası değildir.',[0,0,.7],true);
 const c=curve(),layers=[mesh(wood,ribbon(c,.073,.055,0),M.wood),mesh(belly,ribbon(c,.073,.035,-.047),horn),mesh(back,ribbon(c,.073,.035,.047),sinew),mesh(finish,ribbon(c,.077,.012,.073),lacquer)];
 const tips=P('tips','Başlar ve Kiriş Çentikleri','Yay','Daralan iki uç, koyu çentik işaretleri ve uç kaplamaları. Uçların iç bağlantısı yorumlanmaz.',[0,.2,.2]);
 const tipGroups=[G(tips,[0,0,0],'tip-bottom'),G(tips,[0,0,0],'tip-top')];
 for(const g of tipGroups){box(g,[.13,.20,.13],[0,0,0],M.wood);for(const y of [-.055,.055])box(g,[.14,.016,.14],[0,y,0],M.dark);}
 const wraps=P('wraps','Kabza Sargısı ve Kenar Çizgileri','Yay','Kabza kenarlarındaki ince sarımlar ve lake sınırları; süsleme sadeleştirilmiştir.',[0,0,.4]);
 const wrapsG=G(wraps,[.4,0,0],'grip-wraps');for(let i=0;i<12;i++){const o=ring(wrapsG,.11,[0,-.24+i*.044,0],gold,.006,[Math.PI/2,0,0]);o.scale.z=.85;}
 const edging=mesh(wraps,new T.TubeGeometry(c,100,.006,6,false),gold,[0,0,.085]);
 const gilding=P('gilding','Bitkisel Altın Renkli Motifler','Bezeme','Altın renkli yapraklar ve kıvrım motifleri. Özgün yazıtlar okunmuş gibi yeniden üretilmez.',[0,0,.8]);
 const leaves=instances(gilding,new T.SphereGeometry(1,10,6),gold,Array.from({length:72},()=>({pos:[0,0,0],scale:[.018,.038,.006]})));
 const silver=P('silver','Kenar Noktaları ve Rozetler','Bezeme','Kenar boyunca küçük ışık noktaları; müze eserinin zengin yüzeyini yaklaşık temsil eder.',[0,0,.9]);
 const dots=instances(silver,new T.SphereGeometry(.009,8,6),M.brass,Array.from({length:80},()=>({pos:[0,0,0]})));
 const arrowMount=G(root,[1,0,0],'arrow-display');
 const rack=P('rack','Ok Sergi Askısı','Sergi','Kaynak koleksiyonda kırk ok kayıtlıdır. Burada kaynak fotoğraftaki gibi iki ok sergilenir; sadak eklenmemiştir.',[0,0,0],false,arrowMount);
 box(rack,[1.2,.14,.7],[.2,.20,0],M.dark);for(const x of [-.15,.55]){cyl(rack,.016,2.9,[x,1.70,-.16],M.dark);for(const y of [.6,2.9])beam(rack,[x,y,-.16],[x,y,.03],.015,M.dark);}
 const shafts=P('shafts','İki Ahşap Ok Gövdesi','Oklar','İnce ahşap gövdeler; sergi boyu ve renkleri fotoğraftan yaklaşık.',[.4,0,0],false,arrowMount);
 for(const x of [-.15,.55]){cyl(shafts,.021,3.35,[x,2.22,.04],M.wood);for(const y of [.65,.9,3.7])cyl(shafts,.025,.04,[x,y,.04],gold);}
 const heads=P('heads','Yaprak Biçimli Ok Uçları','Oklar','Müze fotoğrafındaki dar, bezemeli yaprak biçimleri; uç kesiti basitleştirilmiştir.',[.4,.3,0],false,arrowMount);
 const shape=new T.Shape();shape.moveTo(0,0);shape.lineTo(-.045,.18);shape.lineTo(0,.36);shape.lineTo(.045,.18);shape.closePath();
 for(const x of [-.15,.55]){mesh(heads,new T.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:1}),gold,[x,3.89,.025]);beam(heads,[x,3.94,.064],[x,4.19,.064],.008,M.dark);}
 const feathers=P('feathers','Tüyler ve Bağlama Sargıları','Oklar','Koyu kuyruk tüyleri, ince damar çizgileri ve sarımlar. Tüy sayısı sergi yorumudur.',[.4,0,.3],false,arrowMount);
 for(const x of [-.15,.55])for(let i=0;i<3;i++){const g=G(feathers,[x,.58,.04],'fletch');g.rotation.y=i*Math.PI*2/3;const sh=new T.Shape();sh.moveTo(.02,0);sh.lineTo(.09,.08);sh.lineTo(.10,.5);sh.lineTo(.02,.57);sh.closePath();mesh(g,new T.ExtrudeGeometry(sh,{depth:.007,bevelEnabled:false}),horn);for(let j=0;j<8;j++)beam(g,[.025,.08+j*.05,.01],[.09,.12+j*.05,.01],.003,M.wood);}
 const nocks=P('nocks','Gez ve Dip Sargıları','Oklar','Kirişe oturan yarıklı gezler; yarık geometride açık bırakılmıştır.',[.4,-.2,0],false,arrowMount);
 for(const x of [-.15,.55]){for(const dx of [-.024,.024])box(nocks,[.018,.11,.045],[x+dx,.50,.04],horn);for(let i=0;i<6;i++)ring(nocks,.025,[x,.61+i*.025,.04],gold,.004,[Math.PI/2,0,0]);}
 const stringPart=P('string','Temsili Kiriş ve Çekiş','Gösterim','Kirişsiz müze görünümünde gizlidir. Kurulu görünüm ve esneme eğrisi öğretici yorumdur; gerçek kuvvet veya atış hesabı yapılmaz.',[0,0,.2]);
 const strings=[beam(stringPart,[0,0,0],[0,1,0],.009,sinew),beam(stringPart,[0,0,0],[0,1,0],.009,sinew)];strings[0].name='string-lower';strings[1].name='string-upper';
 function line(o,a,b){o.position.copy(a).add(b).multiplyScalar(.5);o.scale.y=a.distanceTo(b)/o.geometry.parameters.height;o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());}
 function sync(){mount.rotation.y=S.turn*Math.PI/180;arrowMount.visible=S.arrows;const key=[S.layers,S.draw,S.strung].join(',');if(key===last)return;last=key;
  const c=curve(),sep=S.layers/100,offset=[0,-sep*.55,sep*.55,sep*.95];
  for(let i=0;i<4;i++){layers[i].geometry.dispose();layers[i].geometry=ribbon(c,i===3?.077:.073,[.055,.035,.035,.012][i],[0,-.047,.047,.073][i]);layers[i].position.z=offset[i];}
  handle.position.x=S.strung?-.4:.4;wrapsG.position.x=handle.position.x;
  tipGroups.forEach((g,i)=>{const t=i?1:0;g.position.copy(c.getPoint(t));const tan=c.getTangent(t);g.rotation.z=-Math.atan2(tan.x,tan.y);});
  edging.geometry.dispose();edging.geometry=new T.TubeGeometry(c,100,.006,6,false);edging.position.z=.085+offset[3];
  const dummy=new T.Object3D();for(let i=0;i<72;i++){const t=.025+i*.95/71,p=c.getPoint(t),tan=c.getTangent(t),side=i%2?1:-1;dummy.position.set(p.x-tan.y*side*.032,p.y+tan.x*side*.032,.087+offset[3]);dummy.rotation.set(0,0,-Math.atan2(tan.x,tan.y)+side*.65);dummy.scale.set(.014,.030,.005);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);}leaves.instanceMatrix.needsUpdate=true;leaves.computeBoundingSphere();
  for(let i=0;i<80;i++){const t=(i+.5)/80,p=c.getPoint(t),tan=c.getTangent(t),side=i%2?1:-1;dummy.position.set(p.x-tan.y*side*.060,p.y+tan.x*side*.060,.09+offset[3]);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();dots.setMatrixAt(i,dummy.matrix);}dots.instanceMatrix.needsUpdate=true;dots.computeBoundingSphere();
  const middle=new T.Vector3(.80+.7*S.draw/100,0,0);stringPart.visible=S.strung;strings.forEach((o,i)=>line(o,c.getPoint(i),middle));
 }
 const camPresets={iso:{pos:[4.5,3.7,7.6],look:[-.2,2.25,0]},front:{pos:[-.2,2.3,7],look:[-.2,2.3,0]},breech:{pos:[-4,3,-5],look:[-.5,2.3,0]},engine:{pos:[-1.5,3,3],look:[-.4,2.5,.2]},suspension:{pos:[3.5,3.1,4],look:[1.2,2.4,0]},top:{pos:[.1,8,.1],look:[0,2,0]}};
 const tourSteps=[['1719–1720 • Osmanlı Yayı','Met 35.113.1a–oo. Kaynakta 64,8 cm ve 365 g kaydı vardır; burada büyütülmüş müze yorumu sergilenir.','front',finish,false],['Kirişsiz Müze Biçimi','Kıvrımlı uçlar, kabza ve koyu lake. Temsili kurulu görünüm ayrı düğmeyle açılır.','iso',grip,false],['Üç Yapısal Katman','Katmanları Ayır kaydırıcısıyla ahşap, boynuz ve siniri ayırın. Kalınlıklar öğretici olarak büyütülmüştür.','engine',wood,true],['Lake ve Bezemeler','Altın renkli yapraklar ve küçük noktalar, fotoğraftaki bezemelerden sadeleştirilmiştir; yazıt taklidi yapılmaz.','engine',gilding,false],['İki Sergi Oku','Kayıt kırk ok içerir; burada iki örnek vardır. Gövde, yaprak uç, tüy ve açık gez incelenebilir.','suspension',heads,false],['Temsili Kiriş','Kurulu yorumda kiriş uçları yaya bağlı kalır. Çekiş geometrisi kuvvet veya menzil hesabı değildir.','front',stringPart,false]].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));
 const ui=K.ui({portraitCameraScale:1.55,fog:{near:60,far:120},title:'OSMANLI KOMPOZİT YAYI',sub:'1719–1720 • Met 35.113.1a–oo • Büyütülmüş nesne ve katman incelemesi',subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#a0844e'})),camLabels:{iso:'Genel',front:'Bezeme Yüzü',breech:'Arka Yüz',engine:'Katmanlar',suspension:'Oklar',top:'Üst'},sliders:[{label:'Katmanları Ayır',min:0,max:100,step:1,fmt:v=>'%'+v},{label:'Temsili Çekiş (kurulu görünüm)',min:0,max:100,step:1,fmt:v=>'%'+v},{label:'Sergi Dönüşü',min:-35,max:35,step:1,fmt:v=>v+'°'}],buttons:{terrain:'Okları Göster / Gizle',sweep:'Müze Pozuna Dön'},telemetryTag:'OSMANLI • KATMANLI YAY',statLabels:['KATMAN','ÇEKİŞ','GÖRÜNÜM','ESER TARİHİ']});
 sync();return {root,parts,ui,camPresets,tourSteps,defaultPart:finish,firePart:stringPart,update:()=>sync(),onFire:()=>{S.strung=!S.strung;S.draw=0;sync();return {ok:true};},fireButtonLabel:()=>S.strung?'KİRİŞSİZ MÜZE BİÇİMİ':'KURULU YAY YORUMU',mobileFireButtonLabel:()=>S.strung?'Müze Biçimi':'Kurulu Yorum',onSlider:(i,v)=>{if(!Number.isFinite(v))return {};if(i===0)S.layers=T.MathUtils.clamp(v,0,100);if(i===1){S.draw=T.MathUtils.clamp(v,0,100);if(S.draw)S.strung=true;}if(i===2)S.turn=T.MathUtils.clamp(v,-35,35);sync();return {};},onButton:n=>{if(n==='terrain')S.arrows=!S.arrows;else Object.assign(S,{layers:0,draw:0,turn:0,strung:false,arrows:true});sync();return {};},buttonActive:n=>n==='terrain'?S.arrows:false,getSliderValues:()=>[S.layers,S.draw,S.turn],getStats:()=>[S.layers+' <span>%</span>',S.draw+' <span>% temsili</span>',S.strung?'KURULU YORUM':'KİRİŞSİZ','1719–1720'],getStatus:()=>({text:S.strung?'TEMSİLİ KURULU YAY':'KİRİŞSİZ MÜZE GÖRÜNÜMÜ',color:'#a0844e'}),applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
};})();
