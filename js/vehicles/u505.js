(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.u505=function(ctx){
 const K=window.MuseumModelKit(ctx,'u505'),{T,root,parts,mats:M,part,mesh,box,cyl,ring,pipe,beam,instances,polygon}=K;
 M.paint.color.setHex(0x626c70);const S={rpm:0,scope:50,rudder:0,electric:false,phase:0};let n=0;const counts={};
 function P(k,title,sub,outer=false,exp=[1,0,0]){counts[sub]=(counts[sub]||0)+1;return part(k,(++n)+'. '+title,sub,[0,0,0],exp,'Müze referanslı U-505 görünümü. İç ölçüler ve bağlantı güzergâhları yaklaşık rekonstrüksiyondur.',outer);}
 function body(p,table,mat=M.paint){const pts=table.map(([z,r])=>new T.Vector2(r,z));return mesh(p,new T.LatheGeometry(pts,64),mat,[0,3.5,0],[Math.PI/2,0,0]);}
 const outer=P('outer','Dış Tekne ve Balast Gövdesi','Dış Yapı',true,[3,0,0]);
 body(outer,[[-38.4,.08],[-36,.7],[-32,1.6],[-25,2.7],[-16,3.38],[14,3.38],[25,2.8],[33,1.8],[37,.5],[38.4,.03]]).scale.z=.78;
 const pressure=P('pressure','İç Basınç Teknesi','Dış Yapı',true,[-3,0,0]);body(pressure,[[-30,.2],[-27,1.9],[-23,2.35],[22,2.35],[28,1.9],[31,.2]],M.dark);
 const frames=P('frames','Postalar ve Bölme Çerçeveleri','İç Bölmeler');
 for(let z=-24;z<=24;z+=3){ring(frames,2.3,[0,3.5,z],M.steel,.08);for(const x of [-1.7,1.7])beam(frames,[x,2,z],[x,5,z],.08);}
 for(const z of [-20,-8,3,16,24]){box(frames,[4.2,.15,.15],[0,2.25,z],M.steel);ring(frames,.7,[0,3.3,z],M.steel,.12);for(const x of [-1.5,1.5])box(frames,[.7,3,.12],[x,3.3,z],M.dark);}
 const deck=P('deck','Güverte Kaplaması ve Tahliye Yarıkları','Dış Yapı',true,[0,2,0]);
 const shape=new T.Shape();shape.moveTo(0,-38.2);shape.bezierCurveTo(-1,-36,-2.3,-24,-2.3,-15);shape.lineTo(-2.3,18);shape.bezierCurveTo(-2.3,30,-1,36,0,38.2);shape.bezierCurveTo(1,36,2.3,30,2.3,18);shape.lineTo(2.3,-15);shape.bezierCurveTo(2.3,-24,1,-36,0,-38.2);
 function deckY(z){return 6.15-Math.max(0,Math.abs(z)-25)*.17;}
 const deckGeo=new T.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:false});const dp=deckGeo.attributes.position;for(let i=0;i<dp.count;i++)dp.setZ(i,dp.getZ(i)+deckY(dp.getY(i))-6.15);deckGeo.computeVertexNormals();mesh(deck,deckGeo,M.dark,[0,5.97,0],[-Math.PI/2,0,0]);
 // Side plating closes the space between the raised free-flooding deck and hull.
 const outline=shape.getPoints(100),vv=[],ii=[];outline.forEach(q=>{vv.push(q.x,deckY(q.y)-.17,-q.y,q.x,3.5,-q.y);});for(let i=0;i<outline.length-1;i++)ii.push(i*2,i*2+2,i*2+1,i*2+1,i*2+2,i*2+3);const skirt=new T.BufferGeometry();skirt.setAttribute('position',new T.Float32BufferAttribute(vv,3));skirt.setIndex(ii);skirt.computeVertexNormals();mesh(deck,skirt,M.paint).material.side=T.DoubleSide;

 const slots=[];for(let z=-28;z<29;z+=.65)for(const side of [-1,1])slots.push({pos:[side*1.7,deckY(z)+.015,z]});instances(deck,new T.BoxGeometry(.18,.025,.38),M.rubber,slots);
 for(let x=-1.4;x<=1.4;x+=.35)box(deck,[.025,.02,48],[x,6.19,0],M.steel);
 const tower=P('tower','Kumanda Kulesi ve Köprü','Dış Yapı',true,[0,3,0]);
 cyl(tower,1.48,2.4,[0,7.3,.5],M.paint).scale.z=2.2;
 const rim=ring(tower,1.5,[0,8.5,.5],M.steel,.1,[Math.PI/2,0,0]);rim.scale.y=2.2;
 box(tower,[2.65,.16,5.4],[0,8.5,.35],M.dark);box(tower,[2.0,.8,1.2],[0,8.95,2.1]);
 for(const side of [-1,1])for(let z=.2;z<2;z+=.6)cyl(tower,.15,.08,[side*1.48,7.7,z],M.dark,'x');
 const rails=P('rails','Korkuluklar ve Kule Platformu','Dış Yapı');
 for(const z of [-3.9,-6.0]){cyl(rails,1.8,.18,[0,7.2,z],M.dark).scale.z=.85;const r=ring(rails,1.8,[0,8.15,z],M.steel,.04,[Math.PI/2,0,0]);r.scale.y=.85;for(let i=0;i<12;i++){const a=i*Math.PI/6;beam(rails,[1.8*Math.sin(a),7.3,z+1.53*Math.cos(a)],[1.8*Math.sin(a),8.15,z+1.53*Math.cos(a)],.04);}beam(rails,[-.8,6.2,z],[-.8,7.2,z],.1);beam(rails,[.8,6.2,z],[.8,7.2,z],.1);}
 for(const side of [-1,1])for(let z=-20;z<24;z+=4){beam(rails,[side*2.1,6.2,z],[side*2.1,7.05,z],.025);if(z<20)beam(rails,[side*2.1,7.05,z],[side*2.1,7.05,z+4],.02);}
 for(const z of [-3.9,-6]){cyl(rails,.28,.9,[0,7.75,z],M.dark);box(rails,[.75,.24,.55],[0,8.25,z],M.steel);for(const x of [-.15,.15])cyl(rails,.045,1.55,[x,8.35,z+.8],M.dark,'z');}
 const scopes=P('scopes','Periskoplar ve Antenler','Servis');const scopeMovers=[];
 for(const [x,z] of [[-.4,.2],[.4,1.2]]){cyl(scopes,.18,2.5,[x,8.7,z],M.steel);const g=new T.Group();g.position.set(x,9.3,z);scopes.add(g);scopeMovers.push(g);cyl(g,.095,2.6,[0,1.3,0],M.steel);pipe(g,[[0,2.6,0],[0,2.8,.12],[0,2.8,.4]],.095,M.steel);cyl(g,.072,.04,[0,2.8,.49],M.glass,'z');}
 beam(scopes,[.8,8.6,-1],[.8,11,-1],.035);pipe(scopes,[[0,7,28],[0,9.4,3],[0,9.5,-1],[0,7,-27]],.018,M.dark);
 const hatches=P('hatches','Güverte Kapakları ve Donanım','Dış Yapı');
 for(const z of [-24,-12,9,23]){cyl(hatches,.60,.3,[0,6.3,z],M.paint);ring(hatches,.40,[0,6.48,z],M.steel,.035,[Math.PI/2,0,0]);for(let i=0;i<4;i++){const a=i*Math.PI/2;beam(hatches,[0,6.5,z],[.4*Math.sin(a),6.5,z+.4*Math.cos(a)],.025);}}
 for(const z of [-29,27])for(const x of [-.7,.7]){cyl(hatches,.13,.38,[x,deckY(z)+.19,z],M.dark);cyl(hatches,.22,.07,[x,deckY(z)+.41,z],M.dark);}
 const rudderPart=P('rudder','Kıç İstikamet Dümenleri','Hareket');const rudders=[];
 for(const x of [-1,1]){const g=new T.Group();g.position.set(x,3.1,-36);rudderPart.add(g);box(g,[.14,2.2,2.5],[0,0,-.8]);rudders.push(g);beam(rudderPart,[x,3.9,-33],[x,3.9,-36],.09);}
 const planes=P('planes','Baş ve Kıç Dalış Düzlemleri','Hareket');const planeMovers=[];
 for(const z of [-33,29])for(const side of [-1,1]){const g=new T.Group();g.position.set(side*1.6,3.7,z);planes.add(g);box(g,[2.4,.13,2.1],[side*1,0,0]);planeMovers.push(g);cyl(planes,.10,2,[side*1.3,3.7,z],M.steel,'x');}
 const shafts=P('shafts','Çift Pervane Şaftı ve Yataklar','Tahrik');
 for(const x of [-1.3,1.3]){cyl(shafts,.12,22,[x,3.0,-23.5],M.steel,'z');for(const z of [-17,-25,-33]){cyl(shafts,.22,.35,[x,3,z],M.dark,'z');beam(shafts,[x,3,z],[x*.5,2.2,z],.12);}}
 const props=P('props','İki Üç Palli Pervane','Hareket');const propMovers=[];
 for(const x of [-1.3,1.3]){const g=new T.Group();g.position.set(x,3,-34.7);props.add(g);propMovers.push(g);cyl(g,.25,.7,[0,0,0],M.brass,'z');for(let i=0;i<3;i++){const b=new T.Group();b.rotation.z=i*Math.PI*2/3;g.add(b);const blade=polygon(b,[[.08,.1],[.52,.52],[.4,1.25],[-.08,1.3],[-.3,.9]],.09,M.brass);blade.rotation.y=.3;}}
 const diesel=P('diesel','İki Dokuz Silindirli Dizel','Tahrik');const flywheels=[];
 for(const x of [-1.15,1.15]){box(diesel,[1.45,1.2,9],[x,3,-12.8],M.steel);for(let i=0;i<9;i++){const z=-8.9-i*.95;box(diesel,[1.3,.30,.72],[x,3.8,z],M.dark);cyl(diesel,.15,.28,[x,4.1,z],M.steel);pipe(diesel,[[x-.5,3.7,z],[x-.75,4.2,z],[x-.75,4.2,z-.5]],.07,M.dark);}cyl(diesel,.6,.24,[x,3.0,-17.5],M.dark,'z');const fly=box(diesel,[.8,.06,.26],[x,3,-17.7],M.steel);flywheels.push(fly);pipe(diesel,[[x,4.1,-8],[x,4.5,-10],[x,4.5,-17]],.17,M.steel);}
 const motors=P('motors','Elektrik Motorları ve Kavramalar','Tahrik');
 for(const x of [-1.3,1.3]){cyl(motors,.68,3.2,[x,3,-20],M.steel,'z');for(const z of [-21.5,-18.5])ring(motors,.7,[x,3,z],M.dark,.09);box(motors,[.9,.5,1.3],[x,3.8,-20],M.dark);cyl(motors,.3,.5,[x,3,-22],M.brass,'z');}
 const batteries=P('batteries','Batarya Bölmeleri','İç Bölmeler');
 const cells=[];for(const z0 of [7,19])for(let i=0;i<10;i++)for(const x of [-1.2,-.4,.4,1.2])cells.push({pos:[x,1.9,z0+i*.52]});instances(batteries,new T.BoxGeometry(.64,.65,.42),M.dark,cells);for(const z of [9.4,21.4])box(batteries,[3.4,.05,5.5],[0,2.3,z],M.steel);
 const control=P('control','Kumanda Odası ve Göstergeler','İç Bölmeler');
 box(control,[3.5,.12,9],[0,2.5,-1]);for(const side of [-1,1]){box(control,[.3,1.8,3],[side*1.6,3.5,0],M.dark);for(let i=0;i<8;i++)cyl(control,.12,.05,[side*1.42,3.1+(i%2)*.5,-1.1+Math.floor(i/2)*.7],M.white,'x');ring(control,.38,[side*.9,3.4,2.5],M.brass,.04);beam(control,[side*.9,2.5,2.5],[side*.9,3.4,2.5],.08);}
 box(control,[1.25,.1,1.8],[0,3.3,-2],M.wood);for(const z of [.2,1.2])cyl(control,.12,3.2,[z===.2?-.4:.4,5,z],M.steel);
 const quarters=P('quarters','Yaşam Alanları ve Ranzalar','İç Bölmeler');
 for(const z of [7,10,14,25])for(const side of [-1,1]){for(const y of [3,4.1]){box(quarters,[1.05,.15,2.2],[side*1.35,y,z],M.wood);box(quarters,[.9,.15,2],[side*1.35,y+.15,z],M.dark);}for(const dz of [-1,1])beam(quarters,[side*1.8,2.5,z+dz],[side*1.8,4.5,z+dz],.04);}
 const ports=P('ports','Baş ve Kıç Tüp Dış Kapakları','Servis');
 for(const z of [-35,35])for(const x of [-.65,.65]){cyl(ports,.36,.16,[x,3.5,z],M.dark,'z');ring(ports,.38,[x,3.5,z+(z>0?.09:-.09)],M.steel,.045);}for(const x of [-.65,.65]){cyl(ports,.36,.16,[x,4.35,35],M.dark,'z');ring(ports,.38,[x,4.35,35.1],M.steel,.045);}
 const piping=P('piping','Servis Hatları, Merdiven ve Bağlantılar','Servis');
 for(const x of [-1.9,1.9]){pipe(piping,[[x,4.5,-22],[x,5,-15],[x,5,0],[x,4.8,23]],.055,M.steel);for(let z=-18;z<24;z+=6)ring(piping,.22,[x,4.7,z],M.red,.03);}
 for(let y=6.3;y<8.6;y+=.35)beam(piping,[-.4,y,-2.9],[.4,y,-2.9],.04);for(const x of [-.4,.4])beam(piping,[x,6.2,-2.9],[x,8.7,-2.9],.04);
 const stands=P('stands','Müze Sergileme Beşikleri','Servis');
 for(const z of [-20,0,20]){box(stands,[6.8,.22,1.1],[0,.11,z],M.dark);for(const x of [-2,2])beam(stands,[x,.2,z],[x,1.4,z],.22,M.steel);beam(stands,[-2,1.4,z],[0,.3,z],.16);beam(stands,[2,1.4,z],[0,.3,z],.16);}
 function update(dt){dt=Number.isFinite(dt)?Math.max(0,Math.min(dt,.05)):0;S.phase=(S.phase+S.rpm*dt*Math.PI/30)%(Math.PI*2);propMovers.forEach((p,i)=>p.rotation.z=(i?1:-1)*S.phase);if(!S.electric)flywheels.forEach(f=>f.rotation.z=S.phase);scopeMovers.forEach(g=>g.position.y=7.1+S.scope*.022);rudders.forEach(g=>g.rotation.y=S.rudder*Math.PI/180);planeMovers.forEach(g=>g.rotation.x=S.rudder*Math.PI/540);}
 const camPresets={iso:{pos:[62,37,64],look:[0,4,0]},front:{pos:[16,15,53],look:[0,4,20]},breech:{pos:[20,14,-48],look:[0,3,-29]},engine:{pos:[12,10,-9],look:[0,3,-13]},suspension:{pos:[14,15,14],look:[0,6,0]},top:{pos:[.1,90,1],look:[0,3,0]}};
 const tourSteps=[['U-505: Atlantik Savaşı','Griffin MSI müzesinde korunan Type IXC denizaltı. Tarihi denizciler ve ticaret gemilerindeki kayıplarla birlikte değerlendirilir.','iso',outer,false],['Teknenin Katmanları','Dış biçim, iç basınç teknesi, postalar ve bölme geçişleri.','front',frames,true],['Dizel ve Elektrik','Yüzeyde dizel, su altında bataryalı elektrik tahriki. Gösterim düğmesiyle güç kaynağını değiştirin.','engine',diesel,true],['Çift Şaft ve Dümen','Elektrik motorlarından kıça uzanan iki şaft, yataklar ve pervaneler.','breech',shafts,true],['Kule ve Periskoplar','Periskopları kaydırıcıyla yükseltin; köprü, kapaklar ve korkulukları inceleyin.','suspension',scopes,false],['Dar Yaşam Alanları','Ranzalar, batarya bölmeleri ve kumanda odası. Bölme içleri yaklaşık görsel rekonstrüksiyondur.','iso',quarters,true]].map((a,i)=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:i===5?25:0,sub:'all'}));
 const ui=K.ui({portraitCameraScale:2.1,title:'U-505 — Type IXC Denizaltı',sub:'Griffin MSI müze referansı • Tam tekne ve dizel-elektrik tahrik',shadowExtent:48,fog:{near:150,far:340},subsystems:Object.entries(counts).map(([key,count],i)=>({key,label:key,count,color:['#64748b','#eab308','#38bdf8','#22c55e','#a78bfa'][i]})),camLabels:{iso:'Genel',front:'Baş Tekne',breech:'Kıç ve Pervane',engine:'Makine Dairesi',suspension:'Kule',top:'Üst'},sliders:[{label:'Pervane Gösterim Devri',min:0,max:40,step:1,fmt:v=>v+' dev/dk'},{label:'Periskop Açıklığı',min:0,max:100,step:1,fmt:v=>'%'+v},{label:'Dümen Gösterim Açısı',min:-25,max:25,step:1,fmt:v=>v+'°'}],buttons:{terrain:'Dizel / Elektrik Gösterimi',sweep:'Başlangıç Pozu'},telemetryTag:'U-505 • İÇ YAPI',statLabels:['GÖSTERİM DEVRİ','TAHRİK','PERİSKOP','GÖVDE BOYU']});
 update(0);return {root,parts,ui,camPresets,tourSteps,defaultPart:outer,firePart:props,update,onSlider:(i,v)=>{if(i===0)S.rpm=T.MathUtils.clamp(v,0,40);if(i===1)S.scope=T.MathUtils.clamp(v,0,100);if(i===2)S.rudder=T.MathUtils.clamp(v,-25,25);update(0);return {};},onButton:n=>{if(n==='terrain')S.electric=!S.electric;else{S.rpm=0;S.scope=50;S.rudder=0;S.phase=0;S.electric=false;}update(0);return {};},buttonActive:n=>n==='terrain'?S.electric:false,onFire:()=>{S.rpm=S.rpm?0:15;return {ok:true};},mobileFireButtonLabel:()=>S.rpm?'Tahriki Durdur':'Tahriki Başlat',fireButtonLabel:()=>S.rpm?'TAHRİK GÖSTERİMİNİ DURDUR':'TAHRİK GÖSTERİMİNİ BAŞLAT',getSliderValues:()=>[S.rpm,S.scope,S.rudder],getStats:()=>[S.rpm+' <span>dev/dk</span>',S.electric?'ELEKTRİK':'DİZEL',S.scope+' <span>%</span>','~76,8 <span>m</span>'],getStatus:()=>({text:S.electric?'ELEKTRİK TAHRİKİ':'DİZEL TAHRİKİ',color:'#0284c7'}),applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
};})();
