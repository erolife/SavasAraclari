/* Helepolis, inspired by Kotsanas modern reconstruction.
 * Nine levels, eight wheels; architectural proportions are interpretive.
 */
(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.helepolis=function(ctx){
 const K=window.MuseumModelKit(ctx,'helepolis'),{T,root,parts,mats:M,mesh,cyl,ring,pipe,beam,instances}=K;
 const S={bridge:0,speed:0,cover:0,level:9,shutters:false};let n=0,finish='oak',relief=true;const counts={};
 const pixels=new Uint8Array(256*64*4);for(let y=0;y<64;y++)for(let x=0;x<256;x++){const v=Math.round(200+18*Math.sin(y*2.2+Math.sin(x*.018))+6*Math.sin(y*9.3+x*.04));pixels.set([v,v,v,255],(y*256+x)*4);}
 const grain=new T.DataTexture(pixels,256,64,T.RGBAFormat);grain.colorSpace=T.SRGBColorSpace;grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.needsUpdate=true;
 M.wood.color.setHex(0x977043);M.wood.map=grain;M.wood.userData.wood=true;const cord=new T.MeshStandardMaterial({color:0xb29a70,roughness:.95});
 function G(p,pos,name){const g=new T.Group();g.position.set(...pos);g.name=name;p.add(g);return g;}
 function P(key,name,sub,desc,exp,outer=false){counts[sub]=(counts[sub]||0)+1;const g=K.part(key,(++n)+'. '+name,sub,[0,0,0],exp,desc,outer);Object.assign(g.userData,{material:'Ahşap, demir ve halat',weight:'Kütle hesaplanmıyor',spec:'Modern rekonstrüksiyondan yorum; yaklaşık 1:5 sahne'});return g;}
 const boxes=new Map();
 function box(parent,size,pos,mat){let byMat=boxes.get(parent);if(!byMat){byMat=new Map();boxes.set(parent,byMat);}if(!byMat.has(mat))byMat.set(mat,[]);byMat.get(mat).push({pos,scale:size});}
 const levelNodes=[],panels=[],hatches=[],wheelNodes=[];
 const H=i=>2.1-.11*i,Y=i=>.8+.78*i;
 function L(p,i){const g=G(p,[0,0,0],p.name+'-level-'+i);levelNodes.push({g,i});return g;}
 const base=P('base','Izgara Alt Şasi','Taşıyıcı','Kotsanas rekonstrüksiyonundaki ızgara taban. Açıklık sayısı sıkıştırılmış sergi düzenidir.',[0,-.25,0]);
 for(let i=-3;i<=3;i++){box(base,[4.6,.15,.13],[0,.65,i*.7],M.wood);box(base,[.13,.15,4.6],[i*.7,.5,0],M.wood);}
 const wheels=P('wheels','Sekiz Masif Tekerlek','Yürüyüş','Ahşap masif tekerlekler, demir çember ve göbekler. Dört çift halinde yerleştirilmiştir.',[.4,-.2,0]);
 for(const z of [-1.6,1.6])for(const x of [-1.65,1.65])for(const side of [-1,1]){const g=G(wheels,[x+side*.17,.25,z],'wheel-'+x+'-'+z+'-'+side);wheelNodes.push(g);cyl(g,.25,.13,[0,0,0],M.wood,'x');mesh(g,new T.CylinderGeometry(.255,.255,.14,32,1,true),M.dark,[0,0,0],[0,0,Math.PI/2]);cyl(g,.065,.18,[0,0,0],M.steel,'x');}
 const yokes=P('yokes','Dingil Yatakları ve Döner Tablalar','Yürüyüş','Dört çiftin üzerinde yatak çatalı ve düşey dönme pimi. Hareket yönü düzeni müze yorumudur.',[0,-.2,0]);
 for(const z of [-1.6,1.6])for(const x of [-1.65,1.65]){cyl(yokes,.04,.55,[x,.25,z],M.steel,'x');box(yokes,[.48,.12,.22],[x,.44,z],M.wood);cyl(yokes,.13,.07,[x,.53,z],M.dark);}
 const posts=P('posts','Daralan Köşe Dikmeleri','Taşıyıcı','Dokuz kat boyunca içeri eğilen dört ana dikme. Her kat ayrı taşıyıcı bölüm olarak incelenebilir.',[.3,0,.3]);
 const beams=P('beams','Kat Kuşakları ve Enine Kirişler','Taşıyıcı','Kat çevresindeki yatay ahşap kirişler, birleşim blokları ve ara taşıyıcılar.',[0,.15,0]);
 const braces=P('braces','Çapraz Rüzgâr Bağları','Taşıyıcı','Açık arka yüzün ve yanların çapraz ahşap bağları. Katlar yükseldikçe açıklık daralır.',[0,0,-.4]);
 const floors=P('floors','Dokuz Katın Döşemeleri','İç Mekân','Döşeme tahtalarında iki merdiven hattı için gerçek açıklıklar bulunur. Üst katları gizleyerek aşağıya bakabilirsiniz.',[0,.3,0]);
 const front=P('front','Ön Koruma ve Atış Açıklıkları','Kaplama','Pencereli ön yüz. Demir kaplama ve ahşap altlık ayrı renklerle yorumlanır; levha boyutları kesin tarihsel veri değildir.',[0,0,.8],true);
 const sides=P('sides','Yan Ahşap ve Demir Kaplamalar','Kaplama','Yan duvarlar inceleme sürgüsüyle dışarı alınabilir; bu hareket sergi özelliğidir.',[.8,0,0],true);
 const shutters=P('shutters','Menteşeli Pencere Kapakları','Kaplama','Dokuz katın çift açıklıkları üzerindeki kapaklar birlikte açılır. İç yüzey koyu deriyle yorumlanır.',[0,.2,.5],true);
 const up=P('up','Yukarı Çıkış Merdivenleri','İç Mekân','Birinci merdiven hattı; iki yan kiriş, ayrı basamaklar ve küpeşte.',[-.3,0,-.3]);
 const down=P('down','Aşağı İniş Merdivenleri','İç Mekân','İkinci merdiven hattı. Tarihsel kaynakta iki ayrı merdiven anlatılır; basamak sayıları sergi ölçeğidir.',[.3,0,-.3]);
 const rails=P('rails','Kat Korkulukları','İç Mekân','Açık arka yüz ve merdiven boşlukları boyunca ahşap korkuluklar.',[0,.2,-.3]);
 const artillery=P('artillery','Katlardaki Mancınık Siluetleri','Donanım','Alt katlarda büyük, üst katlarda daha küçük atıcıları anlatan sabit dış modeller. Atış mekanizması çalıştırılmaz.',[0,.25,.3]);
 const bolts=[];
 for(let i=0;i<9;i++){
  const h=H(i),hn=H(i+1),y=Y(i),yn=Y(i+1),p=L(posts,i),b=L(beams,i),c=L(braces,i),f=L(floors,i),fr=L(front,i),si=L(sides,i),ha=L(shutters,i),ra=L(rails,i),ar=L(artillery,i);
  for(const x of [-1,1])for(const z of [-1,1]){beam(p,[x*h,y,z*h],[x*hn,yn,z*hn],.10,M.wood);box(b,[.19,.14,.19],[x*h,y,z*h],M.dark);}
  for(const z of [-h,h])box(b,[h*2,.12,.10],[0,y,z],M.wood);for(const x of [-h,h])box(b,[.10,.12,h*2],[x,y,0],M.wood);
  for(const x of [-1,1])beam(c,[x*h,y,-h],[-x*hn,yn,-hn],.045,M.wood);
  // Plank instances leave two genuine stair wells in the rear half.
  const planks=[];for(let x=-h+.08;x<h;x+=.16){const gap=Math.abs(Math.abs(x)-.6)<.23&&i>0;if(gap){planks.push({pos:[x,y+.055,.55],scale:[.15,.035,Math.max(.1,2*h-1.1)]});}else planks.push({pos:[x,y+.055,0],scale:[.15,.035,2*h-.12]});}
  instances(f,new T.BoxGeometry(1,1,1),M.wood,planks);
  // Each facade bay has a central opening, with separate lintel, sill and jambs.
  for(const side of [-1,1]){
   const x=side*h*.48,w=h*.7,port=.30,pg=G(fr,[0,0,0],'front-panel-'+i+'-'+side);panels.push({g:pg,axis:'z',side:1});
   box(pg,[w,.19,.045],[x,y+.18,h-.045],M.dark);box(pg,[w,.20,.045],[x,y+.67,h-.12],M.dark);
   for(const edge of [-1,1])box(pg,[(w-port)/2,.30,.045],[x+edge*(w+port)/4,y+.425,h-.08],M.dark);
   const shutter=G(ha,[x,y+.57,h-.04],'shutter-'+i+'-'+side);box(shutter,[.34,.31,.045],[0,-.155,0],M.wood);box(shutter,[.30,.27,.015],[0,-.155,-.03],M.rubber);cyl(shutter,.025,.38,[0,0,0],M.steel,'x');hatches.push({g:shutter,z:h-.04});
   for(const yy of [.16,.65])for(const xx of [-w*.4,w*.4])bolts.push({pos:[x+xx,y+yy,h-.015],rot:[Math.PI/2,0,0]});
  }
  // Narrow central front is open at bridge levels 3 and 4.
  if(i!==3&&i!==4){const pg=G(fr,[0,0,0],'front-center-'+i);panels.push({g:pg,axis:'z',side:1});box(pg,[h*.26,.70,.045],[0,y+.40,h-.08],M.dark);}
  for(const side of [-1,1]){const pg=G(si,[0,0,0],'side-panel-'+i+'-'+side);panels.push({g:pg,axis:'x',side});const rows=[];for(let r=0;r<7;r++)rows.push({pos:[side*(h-.11*r/7),y+.10+r*.095,0],scale:[.04,.088,2*h-.08]});instances(pg,new T.BoxGeometry(1,1,1),M.wood,rows);for(const z of [-h*.7,0,h*.7])box(pg,[.06,.68,.045],[side*(h+.025),y+.38,z],M.dark);}
  for(const x of [-h,0,h])box(ra,[.035,.32,.035],[x,y+.24,-h],M.wood);box(ra,[2*h,.035,.035],[0,y+.4,-h],M.wood);
  if(i<8)for(const [part,x] of [[up,-.6],[down,.6]]){const stair=L(part,i),z=-h+.22;for(const side of [-1,1]){beam(stair,[x+side*.17,y,z],[x+side*.17,yn,z+1.0],.045,M.wood);beam(stair,[x+side*.19,y+.32,z],[x+side*.19,yn+.32,z+1],.025,M.wood);}instances(stair,new T.BoxGeometry(.36,.035,.12),M.wood,Array.from({length:10},(_,j)=>({pos:[x,y+(j+1)*.078,z+(j+1)*.1]})));}
  if(i!==3){const size=1-i*.045;for(const x of [-h*.48,h*.48]){const cat=G(ar,[x,y+.12,h-.55],'catapult-'+i+'-'+x);cat.scale.setScalar(size);box(cat,[.40,.10,.65],[0,.07,0],M.wood);for(const xx of [-.14,.14])box(cat,[.06,.24,.06],[xx,.20,.1],M.wood);box(cat,[.46,.06,.06],[0,.34,.1],M.wood);beam(cat,[-.18,.30,.1],[-.32,.30,.24],.045,M.wood);beam(cat,[.18,.30,.1],[.32,.30,.24],.045,M.wood);pipe(cat,[[-.32,.30,.24],[0,.30,-.10],[.32,.30,.24]],.008,cord);}}
 }
 const bridgePart=P('bridge','Menteşeli Çıkış Köprüsü','Donanım','Orta kattaki köprü açılır; tahtalar, iki taşıyıcı kiriş ve menteşe ekseni birlikte hareket eder.',[0,.2,.7]);
 const bridge=G(bridgePart,[0,Y(3)+.08,H(3)+.04],'bridge');for(let i=0;i<12;i++)box(bridge,[.62,.10,.045],[0,.06+i*.11,0],M.wood);for(const x of [-.24,.24])box(bridge,[.065,1.35,.07],[x,.675,-.04],M.wood);cyl(bridge,.04,.75,[0,0,0],M.steel,'x');
 const ropes=P('ropes','Köprü Askı Halatları','Donanım','İki halat köprü uçlarını izler. Bu hareket bir kuvvet veya vinç hesabı değildir.',[0,.3,.5]);
 const ropeMeshes=[-1,1].map(()=>cyl(ropes,.014,1,[0,0,0],cord));
 const roof=P('roof','Üst Platform ve Kaplama','Taşıyıcı','Daralan kulenin son platformu. Üst yüz inceleme katı seçimiyle gizlenir.',[0,.7,0]);
 const roofNode=L(roof,8);box(roofNode,[H(9)*2,.10,H(9)*2],[0,Y(9),0],M.wood);
 const fittings=P('fittings','Kaplama Bağları ve Perçinler','Kaplama','Ön levhalardaki bağlantı başları örneklenmiş geometriyle üretilir.',[0,.15,.3]);
 instances(fittings,new T.CylinderGeometry(.018,.018,.02,8),M.brass,bolts);
 for(const [parent,byMat] of boxes)for(const [mat,transforms] of byMat)instances(parent,new T.BoxGeometry(1,1,1),mat,transforms);
 function pose(){
  levelNodes.forEach(({g,i})=>{g.visible=i<S.level;});roofNode.visible=S.level===9;
  panels.forEach(({g,axis,side})=>{g.position[axis]=side*S.cover*.012;});hatches.forEach(({g,z})=>{g.rotation.x=S.shutters?-1.5:0;g.position.z=z+S.cover*.012;});
  bridge.rotation.x=S.bridge*Math.PI/180;bridge.updateMatrix();
  for(let i=0;i<2;i++){const x=i?.26:-.26,a=new T.Vector3(x,Y(5)-.03,H(3)),b=new T.Vector3(x,1.30,0).applyMatrix4(bridge.matrix),d=b.clone().sub(a),o=ropeMeshes[i];o.position.copy(a).add(b).multiplyScalar(.5);o.scale.y=d.length();o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
  bridgePart.visible=S.level>3;ropes.visible=S.level>5;for(const p of [up,down])p.children.forEach((g,i)=>{g.visible=i<S.level-1;});fittings.visible=S.level===9;fittings.children[0].position.z=S.cover*.012;
 }
 function update(dt){if(Number.isFinite(dt)&&S.speed){S.bridge=Math.min(90,S.bridge+Math.max(0,Math.min(dt,.05))*S.speed*18);if(S.bridge===90)S.speed=0;}pose();}
 function reset(){Object.assign(S,{bridge:0,speed:0,cover:0,level:9,shutters:false});pose();}
 const finishes={oak:{label:'Sıcak Ahşap (temsili)',color:0x977043},pale:{label:'Açık Ahşap (temsili)',color:0xb79b71},dark:{label:'Koyu Ahşap (temsili)',color:0x594331},aged:{label:'Müze Ahşabı (temsili)',color:0x82765e}};
 function applyTextures(bp){K.applyTextures(bp);K.meshes.forEach(({o})=>{if(o.material.userData.wood){o.userData.origColor.setHex(finishes[finish].color);if(!bp)o.material.color.copy(o.userData.origColor);o.material.map=grain;o.material.bumpMap=relief?grain:null;o.material.bumpScale=.008;o.material.needsUpdate=true;}});}
 const camPresets={iso:{pos:[11,8,13],look:[0,3.9,0]},front:{pos:[0,5,12],look:[0,4,0]},breech:{pos:[-9,7,-13],look:[0,4,0]},engine:{pos:[3,5,-5],look:[0,3,0]},suspension:{pos:[5,2.2,5],look:[0,.6,0]},top:{pos:[.01,14,1],look:[0,2,0]}};
 const tourSteps=[['Şehir Alan Kule','Helepolis: Rodos kuşatmasıyla ilişkilendirilen dokuz katlı dev kule. Görsel model Kotsanas’ın modern rekonstrüksiyonundan yorumlanmıştır.','iso',posts,false],['Korunan Ön Yüz','Pencereler, hareketli kapaklar ve koyu metal kaplama. Katmanları ayırarak ahşap taşıyıcıları görün.','front',front,false],['Dokuz Katın İçinde','İki merdiven hattı, gerçek döşeme açıklıkları, korkuluklar ve çapraz bağlar. Üst katları gizleyerek alt katı inceleyin.','breech',floors,true],['Çıkış Köprüsü','Köprü ve iki askı halatı birlikte hareket eder. Açılma temposu sergi yorumudur.','engine',bridgePart,false],['Sekiz Tekerlek','Dört çift masif ahşap tekerlek, dingil yatakları ve ızgara taban. Yürüme ve yük hesabı yapılmaz.','suspension',wheels,false],['Kaynakların Sınırı','Müze yaklaşık 40 m yükseklik anlatır. Bu sahne yaklaşık 1:5 ölçeklidir; iç yerleşim ve küçük donanım yorumdur.','top',roof,false]].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));
 const ui=K.ui({portraitCameraScale:1.15,title:'HELEPOLIS — Dokuz Katlı Kuşatma Kulesi',sub:'Rodos • MÖ 304 • Modern rekonstrüksiyondan yorum',shadowExtent:12,subsystems:Object.entries(counts).map(([key,count],i)=>({key,label:key,count,color:['#8d7757','#ad915c','#657c88','#8c8170','#997b5f'][i]})),camLabels:{iso:'Genel',front:'Ön Yüz',breech:'Açık Arka',engine:'Kat ve Köprü',suspension:'Tekerlekler',top:'Üst'},sliders:[{label:'Köprüyü Aç',min:0,max:90,step:1,fmt:v=>Math.round(v)+'°'},{label:'Dış Kaplamayı Ayır',min:0,max:100,step:1,fmt:v=>'%'+v},{label:'Görünen Kat Sayısı',min:1,max:9,step:1,fmt:v=>v+' / 9'}],buttons:{terrain:'Pencere Kapaklarını Aç / Kapat',sweep:'Başlangıca Dön'},telemetryTag:'DOKUZ KAT • SEKİZ TEKERLEK',statLabels:['KÖPRÜ','KAT','TEKERLEK','TASARIM YÜKSEKLİĞİ']});
 ui.textures=Object.entries(finishes).map(([key,v])=>({key,label:v.label}));ui.activeTexture=()=>finish;ui.textureLabel=()=>finishes[finish].label;ui.relief=()=>relief;ui.reliefLabel=v=>'Ahşap Ayrıntısı: '+(v?'AÇIK':'KAPALI');pose();applyTextures(false);
 return {root,parts,ui,camPresets,tourSteps,defaultPart:posts,firePart:bridgePart,update,onFire:()=>{if(S.bridge>=90)S.bridge=0;S.speed=S.speed?0:1;return {ok:true};},fireButtonLabel:()=>S.speed?'KÖPRÜYÜ DURAKLAT':'KÖPRÜYÜ YAVAŞ AÇ',mobileFireButtonLabel:()=>S.speed?'Duraklat':'Köprüyü Aç',onSlider:(i,v)=>{if(!Number.isFinite(v))return {};S.speed=0;if(i===0)S.bridge=T.MathUtils.clamp(v,0,90);if(i===1)S.cover=T.MathUtils.clamp(v,0,100);if(i===2)S.level=Math.round(T.MathUtils.clamp(v,1,9));pose();return {};},onButton:n=>{if(n==='terrain')S.shutters=!S.shutters;else reset();pose();return {};},buttonActive:n=>n==='terrain'?S.shutters:false,getSliderValues:()=>[S.bridge,S.cover,S.level],getStats:()=>[Math.round(S.bridge)+' <span>°</span>',S.level+' <span>/9</span>','8 <span>masif</span>','~40 <span>m (kaynak)</span>'],getStatus:()=>({text:S.speed?'KÖPRÜ AÇILIYOR':'DURAKLATILDI • İNCELE',color:'#9a794c'}),applyTextures,setTexture:k=>{if(finishes[k])finish=k;},toggleRelief:()=>{relief=!relief;return relief;}};
};})();
