/* Kotsanas iron-hand reconstruction. Exhibition proportions, not an ancient blueprint. */
(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.archimedes=function(ctx){
 const K=window.MuseumModelKit(ctx,'archimedes'),{T,root,parts,mats:M,mesh,box,cyl,ring,pipe,beam,instances}=K;
 const S={angle:0,yaw:0,chain:2.6,auto:false,time:0,boat:true};let n=0;const counts={};
 M.paint.color.setHex(0x80603c);M.paint.metalness=0;M.paint.roughness=.95;
 const stone=new T.MeshStandardMaterial({color:0xb4a58b,roughness:1});
 const water=new T.MeshStandardMaterial({color:0x315d68,roughness:.38,metalness:.25});
 const ropeMat=new T.MeshStandardMaterial({color:0xb5a07b,roughness:1});
 function G(p,pos,name){const g=new T.Group();g.position.set(...pos);g.name=name;p.add(g);return g;}
 function P(key,name,sub,desc,exp=[0,1,0],outer=false,parent=root){counts[sub]=(counts[sub]||0)+1;const p=K.part(key,++n+'. '+name,sub,[0,0,0],exp,desc,outer,parent);p.userData.material='Ahşap, taş, demir ve lif halat';return p;}
 const base=P('base','Sergi Tabanı ve Su','Diorama','Su ve sur kesiti çağdaş müze sunumudur. Bütün oranlar temsili; kaldırma kapasitesi hesaplanmaz.',[0,0,0]);
 box(base,[11,.16,8],[1.2,.08,0],M.dark);box(base,[6.9,.05,7.7],[3.1,.185,0],water);
 const waves=[];for(let i=0;i<26;i++)waves.push({pos:[2+(i%5)*.9,.216,-3.3+Math.floor(i/5)*1.3],scale:[.3+(i%3)*.15,1,1]});instances(base,new T.BoxGeometry(1,.006,.018),M.white,waves);
 const wall=P('wall','Kesme Taş Sur','Diorama','Syrakousai kıyı surlarını temsil eden taş örgü; özgün surun birebir ölçülü kopyası değildir.',[-.5,0,0],true);
 for(let row=0;row<5;row++)for(let z=0;z<9;z++)box(wall,[1.3,.62,.76],[.6,.53+row*.64,-3.4+z*.8],stone);
 const coping=P('coping','Mazgallar ve Üst Hat','Diorama','Aralıklı parapet taşları; deniz tarafındaki mekanizma açıklığı açık bırakılır.',[0,.7,0]);
 for(const z of [-3.2,-2.4,2.4,3.2])box(coping,[1.45,.7,.68],[.6,3.8,z],stone);
 box(coping,[1.5,.18,7.5],[.6,3.37,0],stone);
 const platform=P('platform','İç Çalışma Döşemesi','Diorama','Kolun arkasındaki ahşap çalışma yolu; dikmeler ve çaprazlar yükü sergi tabanına taşır.',[-.6,0,0]);
 for(let i=0;i<14;i++)box(platform,[2.8,.12,.45],[-1.45,3.12,-3.1+i*.48],M.wood);
 for(const z of [-2.8,0,2.8]){beam(platform,[-2.6,.2,z],[-2.6,3.05,z],.2,M.wood);beam(platform,[-2.6,.3,z],[-.3,3,z],.15,M.wood);box(platform,[2.8,.2,.18],[-1.4,2.98,z],M.wood);}
 const foot=P('foot','Dikme Yatağı','Taşıyıcı','Taş kaide, ahşap çapraz taban ve bronz renkli yatak; iç bağlantılar yorumdur.',[0,-.2,0]);
 box(foot,[1.35,.3,1.35],[-.8,.36,0],stone);for(const a of [0,Math.PI/2])box(foot,[2,.24,.32],[-.8,.63,0],M.wood,[0,a,0]);
 cyl(foot,.33,.22,[-.8,.86,0],M.brass);
 const yaw=G(root,[-.8,0,0],'slew');
 const mast=P('mast','Döner Ahşap Dikme','Taşıyıcı','Düşey dikme el kollarıyla döndürülür. Gösterim açısı sur açıklığıyla sınırlıdır.',[0,.5,0],false,yaw);
 cyl(mast,.22,4.6,[0,3.1,0],M.wood);for(const y of [1,3.5,4.5])cyl(mast,.245,.12,[0,y,0],M.dark);
 const braces=P('braces','Çatal ve Çapraz Payandalar','Taşıyıcı','Çift yan çatal, kol milinin iki ucunu taşır. Kol bu çatalın arasında döner.',[0,.5,0],false,yaw);
 for(const z of [-.38,.38]){beam(braces,[0,3.6,0],[0,5.25,z],.16,M.wood);box(braces,[.28,.7,.16],[0,5.1,z],M.wood);cyl(braces,.19,.10,[0,5.25,z],M.brass,'z');}
 const handles=P('handles','Dönüş Kolları','Taşıyıcı','Dikmenin alt seviyesindeki çapraz el kolları; dişli aktarım varsayılmamıştır.',[0,.25,0],false,yaw);
 for(const a of [0,Math.PI/2])box(handles,[2.1,.12,.12],[0,3.7,0],M.wood,[0,a,0]);
 const pivot=G(yaw,[0,5.25,0],'boom-pivot');
 const boom=P('boom','Mafsallı Uzun Kol','Kaldırma','Uzun ahşap kol ve üst bindirme. Hareket sergi animasyonudur, dinamik yük hesabı değildir.',[0,.7,0],false,pivot);
 box(boom,[7.1,.3,.36],[1.15,0,0],M.wood);box(boom,[4.7,.16,.44],[1.4,.23,0],M.paint);
 for(const x of [-1.8,-.8,.8,2,3.3,4.45])box(boom,[.10,.49,.46],[x,.08,0],M.dark);
 const fittings=P('fittings','Mil, Bilezik ve Başlık','Kaldırma','Kol ucundaki demir bağlantı ve merkezdeki enine mil. Perçinler görsel ayrıntıdır.',[0,0,.45],false,pivot);
 cyl(fittings,.10,1.0,[0,0,0],M.steel,'z');for(const z of [-.52,.52])cyl(fittings,.16,.06,[0,0,z],M.brass,'z');
 ring(fittings,.12,[4.45,-.22,0],M.dark,.035,[0,Math.PI/2,0]);
 const studs=[];for(const x of [-1.8,-.8,.8,2,3.3,4.45])for(const z of [-.24,.24])studs.push({pos:[x,.08,z],rot:[Math.PI/2,0,0]});instances(fittings,new T.CylinderGeometry(.035,.035,.03,8),M.brass,studs);
 const weight=P('weight','Kayan Karşı Ağırlık','Kaldırma','Kotsanas yorumundaki kayan karşı ağırlık. Konumu kol açısıyla temsili olarak ilişkilidir.',[-.6,0,0],false,pivot);
 const slider=G(weight,[-1.6,0,0],'counterweight');box(slider,[.8,.85,.85],[0,-.12,0],stone);for(const x of [-.3,.3])box(slider,[.08,1,.98],[x,-.1,0],M.dark);
 const winch=P('winch','Elle Çevrilen Irgat','Kaldırma','Döşemeye oturan çift yatak ve halat tamburu. Halat yolu görsel rekonstrüksiyondur.',[-.5,0,0],false,yaw);
 for(const z of [-.55,.55])box(winch,[.23,.65,.16],[-1.65,3.5,z],M.wood);cyl(winch,.15,1.35,[-1.65,3.68,0],M.wood,'z');
 for(const z of [-.4,.4])cyl(winch,.23,.07,[-1.65,3.68,z],M.dark,'z');
 for(let i=0;i<12;i++)ring(winch,.16,[-1.65,3.68,-.33+i*.06],ropeMat,.018);
 beam(winch,[-1.65,3.68,.72],[-1.65,4.05,.72],.07,M.dark);cyl(winch,.045,.25,[-1.65,4.05,.83],M.wood,'z');
 const cable=P('cable','Dengeleme Halatı','Kaldırma','Irgattan kolun arka ucuna uzanan temsili hat; uçları her açıdaki bağlantılara bağlı kalır.',[0,0,.3],false,yaw);
 const cableMesh=beam(cable,[-1.65,3.68,0],[-2.1,5.25,0],.035,ropeMat);
 const hanging=G(yaw,[4.45,5.03,0],'hanging');
 const chain=P('chain','Sarkıt Zincir','Kanca','Düşey zincir halkaları kol hareket ederken düşey kalır. Sergi zinciri uzunluğu ayarlanabilir.',[0,0,.5],false,hanging);
 const links=[];for(let i=0;i<32;i++){const o=ring(chain,.065,[0,-i*.08,0],M.dark,.017,[0,i%2?Math.PI/2:0,0]);o.scale.y=1.3;links.push(o);}
 const hookMount=G(hanging,[0,-2.6,0],'hook-mount');
 const claw=P('claw','Demir El ve Kanca','Kanca','Dört kıvrımlı demir kol ve merkez halka, modern müze yorumudur.',[0,-.4,0],false,hookMount);
 ring(claw,.12,[0,0,0],M.dark,.035);cyl(claw,.065,.55,[0,-.28,0],M.dark);
 for(let i=0;i<4;i++){const a=i*Math.PI/2,c=Math.cos(a),s=Math.sin(a);pipe(claw,[[0,-.12,0],[.12*c,-.5,.12*s],[.34*c,-.55,.34*s],[.38*c,-.28,.38*s]],.042,M.dark);}
 const boatMount=G(hookMount,[0,-.70,0],'boat-mount');
 const hull=P('hull','Temsili Tekne Gövdesi','Tekne','Küçük kıyı teknesi yalnızca kaldırma anlatımı içindir; belirli bir Roma savaş gemisinin ölçekli modeli değildir.',[0,0,.5],true,boatMount);
 const sections=24;for(let side=0;side<2;side++)for(let row=0;row<5;row++){
  const vertices=[],indices=[];for(let j=0;j<=sections;j++)for(let k=0;k<2;k++){const z=-2.2+j*4.4/sections,w=Math.sin(Math.PI*j/sections),level=row+k;vertices.push((side?1:-1)*(.13+level*.115)*w,.04+level*.13+.13*(1-w),z);}
  for(let j=0;j<sections;j++){const a=j*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const mat=(row%2?M.wood:M.paint).clone();mat.side=T.DoubleSide;mesh(hull,geo,mat);
  const seam=[];for(let j=0;j<=sections;j++){const z=-2.2+j*4.4/sections,w=Math.sin(Math.PI*j/sections);seam.push([(side?1:-1)*(.13+row*.115)*w,.04+row*.13+.13*(1-w),z]);}pipe(hull,seam,.009,M.dark);
 }
 beam(hull,[0,0,-2.2],[0,0,2.2],.12,M.dark);
 const deck=P('deck','Postalar, Oturak ve Borda','Tekne','Ahşap gövde postaları ve enine oturaklar. Kanca bağlantısı temsili orta enine kiriştedir.',[0,.4,0],false,boatMount);
 for(let i=1;i<8;i++){const z=-2.2+i*.55,w=Math.sin(Math.PI*i/8)*.66;pipe(deck,[[-w,.58,z],[-w*.6,.18,z],[0,.10,z],[w*.6,.18,z],[w,.58,z]],.045,M.dark);box(deck,[w*1.85,.08,.20],[0,.50,z],M.wood);}
 box(deck,[1.1,.16,.22],[0,.65,0],M.dark);
 const oars=P('oars','Kürekler ve Bağlar','Tekne','Dış kürekler teknedeki ölçek duygusunu destekler. Gemi personeli ve çarpışma fiziği modellenmez.',[0,.3,0],false,boatMount);
 for(const side of [-1,1])for(const z of [-1.1,-.55,.55,1.1]){beam(oars,[side*.5,.62,z],[side*1.5,.26,z+.35],.035,M.wood);box(oars,[.35,.04,.16],[side*1.42,.28,z+.32],M.paint,[0,-side*.3,0]);}
 function line(o,a,b){const av=new T.Vector3(...a),bv=new T.Vector3(...b);o.position.copy(av.clone().add(bv).multiplyScalar(.5));o.scale.y=av.distanceTo(bv)/o.geometry.parameters.height;o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());}
 function sync(){const a=T.MathUtils.degToRad(S.angle);pivot.rotation.z=a;yaw.rotation.y=T.MathUtils.degToRad(S.yaw);slider.position.x=-1.6-.012*S.angle;
  hanging.position.set(4.45*Math.cos(a)+.22*Math.sin(a),5.25+4.45*Math.sin(a)-.22*Math.cos(a),0);hookMount.position.y=-S.chain;
  links.forEach((o,i)=>o.position.y=-(i+.5)*S.chain/32);boatMount.visible=S.boat;boatMount.rotation.z=-a*.30;
  line(cableMesh,[-1.65,3.68,0],[-2.1*Math.cos(a),5.25-2.1*Math.sin(a),0]);
 }
 function update(dt){if(S.auto&&Number.isFinite(dt)){S.time+=T.MathUtils.clamp(dt,0,.05);S.angle=15-15*Math.cos(S.time*.7);}sync();}
 const camPresets={iso:{pos:[17,12,18],look:[1,3,0]},front:{pos:[13,7,0],look:[1,3,0]},breech:{pos:[-10,9,9],look:[-1,3.6,0]},engine:{pos:[1,8,7],look:[-.8,5,0]},suspension:{pos:[9,5,7],look:[3.5,2.8,0]},top:{pos:[1,19,.01],look:[1,0,0]}};
 const tourSteps=[['Siraküza Kıyısında','Arşimet’e atfedilen savunma düzeneğinin Kotsanas müze yorumundan diorama. Kesin antik ölçüler bilinmiyor.','iso',wall,false],['Döner Dikme','Ahşap dikme, çatal ve yan mil. Dönüş kollarıyla sur açıklığına yönelin.','breech',mast,false],['Kol ve Karşı Ağırlık','Kol açısını değiştirin; arka ağırlık ve dengeleme halatını birlikte izleyin.','engine',weight,false],['Demir El','Kanca ve düşey zincir. Zincir uzunluğu görsel sergi ayarıdır.','suspension',claw,false],['Tekne Kesiti','Temsili teknede borda, postalar ve oturaklar; özgün savaş gemisi iddiası yoktur.','suspension',deck,true],['Yavaş Gösterim','Gösterim düğmesi kolu yavaş kaldırıp indirir. El ayarı otomatik hareketi durdurur.','iso',boom,false]].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));
 const ui=K.ui({portraitCameraScale:1.8,fog:{near:100,far:180},title:'ARŞİMET’İN DEMİR ELİ',sub:'Siraküza • Kotsanas yorumundan rekonstrüksiyon • Oranlar ve hareket temsili',subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#9d805a'})),camLabels:{iso:'Diorama',front:'Deniz Cephesi',breech:'Irgat',engine:'Kol ve Mil',suspension:'Kanca ve Tekne',top:'Üst'},sliders:[{label:'Kol Açısı',min:0,max:30,step:1,fmt:v=>v+'°'},{label:'Dikme Yönü',min:-20,max:20,step:1,fmt:v=>v+'°'},{label:'Zincir Boyu (sergi)',min:2,max:2.8,step:.01,fmt:v=>v.toFixed(2)}],buttons:{terrain:'Tekneyi Göster / Gizle',sweep:'Başlangıca Dön'},telemetryTag:'DEMİR EL • TEMSİLİ KİNEMATİK',statLabels:['KOL','YÖN','ZİNCİR','GÖSTERİM']});
 sync();return {root,parts,ui,camPresets,tourSteps,defaultPart:boom,firePart:claw,update,onFire:()=>{S.auto=!S.auto;S.time=Math.acos(T.MathUtils.clamp(1-S.angle/15,-1,1))/.7;return {ok:true};},mobileFireButtonLabel:()=>S.auto?'Durdur':'Kaldır',fireButtonLabel:()=>S.auto?'GÖSTERİMİ DURDUR':'KALDIRMA GÖSTERİMİ',onSlider:(i,v)=>{if(!Number.isFinite(v))return {};S.auto=false;if(i===0)S.angle=T.MathUtils.clamp(v,0,30);if(i===1)S.yaw=T.MathUtils.clamp(v,-20,20);if(i===2)S.chain=T.MathUtils.clamp(v,2,2.8);sync();return {};},onButton:n=>{if(n==='terrain')S.boat=!S.boat;else Object.assign(S,{angle:0,yaw:0,chain:2.6,auto:false,time:0,boat:true});sync();return {};},buttonActive:n=>n==='terrain'?S.boat:false,getSliderValues:()=>[S.angle,S.yaw,S.chain],getStats:()=>[S.angle.toFixed(1)+' <span>°</span>',S.yaw+' <span>°</span>',S.chain.toFixed(2)+' <span>sergi birimi</span>',S.auto?'OTOMATİK':'EL AYARI'],getStatus:()=>({text:S.auto?'YAVAŞ KALDIRMA GÖSTERİMİ':'MÜZE REKONSTRÜKSİYONU',color:'#a58350'}),applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
};})();
