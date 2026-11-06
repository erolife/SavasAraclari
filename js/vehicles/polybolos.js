/* Polybolos: interpretive display after Kotsanas Museum / Philo.
 * Motion is a slowed exhibit sequence; dimensions, chain guide and timings approximate.
 */
(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.polybolos=function(ctx){
 const K=window.MuseumModelKit(ctx,'polybolos'),{T,root,parts,mats:M,mesh,box,cyl,ring,pipe,beam,instances}=K;
 const S={speed:0,phase:0,open:0,ammo:8,fired:false,highlight:false};const counts={};let number=0,finish='oak',relief=true;
 const data=new Uint8Array(256*64*4);for(let y=0;y<64;y++)for(let x=0;x<256;x++){const v=Math.round(200+16*Math.sin(y*2.7+Math.sin(x*.03))+5*Math.sin(y*11+x*.07));data.set([v,v,v,255],(y*256+x)*4);}
 const grain=new T.DataTexture(data,256,64,T.RGBAFormat);grain.colorSpace=T.SRGBColorSpace;grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.needsUpdate=true;
 M.wood.color.setHex(0x9a6a38);M.wood.map=grain;M.wood.userData.wood=true;
 const rope=new T.MeshStandardMaterial({color:0xb9a27c,roughness:.98});
 function G(p,pos,name){const g=new T.Group();g.position.set(...pos);g.name=name;p.add(g);return g;}
 function P(key,name,sub,desc,exp,outer=false,parent=root){counts[sub]=(counts[sub]||0)+1;const g=K.part(key,(++number)+'. '+name,sub,[0,0,0],exp,desc,outer,parent);Object.assign(g.userData,{material:'Ahşap, demir, tunç ve lif demetleri',weight:'Kütle hesaplanmıyor',spec:'Metinden müze rekonstrüksiyonu; oranlar yaklaşık'});return g;}
 const stand=P('stand','Üçgen Ahşap Ayak','Taşıyıcı','Üçgen taban, ana dikme ve çapraz payandalar. Kotsanas rekonstrüksiyonundaki ahşap sehpa silueti esas alınır.',[0,-.2,0]);
 const corners=[[-.95,.08,-1],[.95,.08,-1],[0,.08,1.15]];for(let i=0;i<3;i++)beam(stand,corners[i],corners[(i+1)%3],.16,M.wood);
 box(stand,[.20,1.70,.20],[0,.96,.5],M.wood);
 for(const a of corners)beam(stand,a,[0,1.55,.5],.12,M.wood);
 const saddle=P('saddle','Üst Beşik ve Arka Payanda','Taşıyıcı','Uzun ray gövdesini taşıyan beşik ve arka eğik destekler. Bağlantılar zeminden üst gövdeye kesintisiz uzanır.',[0,.3,0]);
 box(saddle,[.80,.18,.65],[0,1.73,.5],M.wood);for(const x of [-.20,.20])beam(saddle,[0,.70,.45],[x,1.83,-1.30],.10,M.wood);
 const bed=P('bed','Çift Uzun Ray ve Geçmeler','Taşıyıcı','Yan taşıyıcılar, enine kirişler ve hareketli sürgünün açık yolu. Dar yatak kanalında hareket izlenebilir.',[0,.3,0]);
 for(const x of [-.35,.35])box(bed,[.12,.19,3.30],[x,1.92,0],M.wood);
 for(const z of [-1.5,0,1.5])box(bed,[.83,.10,.13],[0,1.84,z],M.wood);
 const iron=P('iron','Metal Kuşaklar ve Pimler','Taşıyıcı','Ahşap kiriş uçlarındaki demir kuşaklar, yatak plakaları ve yuvarlak pimler.',[0,.2,0]);
 for(const x of [-.35,.35])for(const z of [-1.45,1.45]){box(iron,[.145,.025,.18],[x,2.025,z],M.dark);cyl(iron,.021,.025,[x,2.05,z],M.brass);}
 const torsion=P('torsion','Burulma Çerçevesi','Burulma','İki dik lif demetini tutan ahşap başlıklar ve dikmeler. Güç kaynağı yay biçimli tek bir esnek çubuk değil, burulma demetleridir.',[0,.4,.6]);
 for(const y of [1.75,2.52])box(torsion,[1.55,.15,.35],[0,y,1.70],M.wood);
 for(const x of [-.38,.38])box(torsion,[.09,.70,.28],[x,2.13,1.70],M.wood);for(const x of [-.72,.72]){for(const y of [1.90,2.39])box(torsion,[.09,.24,.28],[x,y,1.70],M.wood);box(torsion,[.09,.30,.07],[x,2.13,1.91],M.wood);}
 const bundles=P('bundles','Bükümlü Lif Demetleri','Burulma','Dikey demetler tek tek lif geometrisiyle gösterilir; gerçek gerilim ve enerji hesabı yapılmaz.',[.3,.3,.4]);
 for(const x of [-.55,.55]){for(let i=0;i<12;i++){const pts=[];for(let j=0;j<=24;j++){const a=i*Math.PI/6+j*.045;pts.push([x+.066*Math.cos(a),1.78+j*.030,1.70+.066*Math.sin(a)]);}pipe(bundles,pts,.010,rope);}for(const y of [1.71,2.62]){cyl(bundles,.12,.055,[x,y,1.70],M.brass);cyl(bundles,.035,.10,[x,y,1.70],M.dark);}}
 const armsPart=P('arms','İki Ahşap Atıcı Kol','Burulma','Burulma demetlerinin içindeki kollar, gösterim evresine göre simetrik olarak döner. Bağlı kiriş uçları kolları takip eder.',[0,.3,.4]);
 const arms=[];for(const side of [-1,1]){const g=G(armsPart,[side*.55,2.13,1.70],'arm-'+side);beam(g,[0,0,0],[side*.72,0,-.12],.085,M.wood);cyl(g,.065,.15,[0,0,0],M.dark);ring(g,.05,[side*.72,0,-.12],rope,.012,[0,Math.PI/2,0]);arms.push(g);}
 const stringPart=P('string','Hareketli Kiriş','Burulma','İki kol ucu ve sürgü mandalı arasında görülen kiriş. Şekil değişimi yavaşlatılmış anlatımdır; fizik çözümü değildir.',[0,.3,.3]);
 const strings=[0,1].map(()=>cyl(stringPart,.012,1,[0,0,0],rope));
 function between(o,a,b){const d=b.clone().sub(a);o.position.copy(a).add(b).multiplyScalar(.5);o.scale.y=d.length();o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
 const drive=P('drive','Beşgen Çarklar ve Ortak Miller','Aktarma','Her iki yanda ahşap beşgen çarklar; arka ortak mil kranktan hareket alır. Çevredeki yuvarlatılmış zincir yolu sergi sadeleştirmesidir.',[.5,0,0]);
 const wheels=[];for(const z of [-1.30,1.30]){cyl(drive,.035,1.20,[0,1.92,z],M.dark,'x');for(const x of [-.49,.49]){const w=G(drive,[x,1.92,z],'sprocket-'+x+'-'+z);cyl(w,.23,.12,[0,0,0],M.wood,'x',.23);w.children[0].geometry.dispose();w.children[0].geometry=new T.CylinderGeometry(.23,.23,.12,5);w.children[0].rotation.z=Math.PI/2;ring(w,.23,[0,0,0],M.dark,.012,[0,Math.PI/2,0]);cyl(w,.055,.16,[0,0,0],M.brass,'x');wheels.push(w);}}
 const crankPart=P('crank','İleri–Geri Çevrilen Krank','Aktarma','Arka milin dışındaki ahşap tutamak. İleri ve geri hareket aynı mil, çark ve zincirle eşlenir; tek yönlü sürekli motor değildir.',[-.6,0,-.3]);
 const crank=G(crankPart,[-.70,1.92,-1.30],'crank');beam(crank,[0,0,0],[0,.35,0],.055,M.dark);cyl(crank,.045,.24,[-.10,.35,0],M.wood,'x');
 const chainPart=P('chains','Çift Mafsallı Zincir','Aktarma','Ahşap bloklar, demir yan levhalar ve pimler. Zincirin üst koluna bağlı sürgü ileri–geri gider. Kapalı zincir yolu görsel olarak sadeleştirilmiştir.',[.6,0,0]);
 const R=.23,L=2.6,PERIM=2*L+2*Math.PI*R,N=66;
 function path(s){s=((s%PERIM)+PERIM)%PERIM;if(s<L)return [1.92+R,-1.30+s,0];s-=L;if(s<Math.PI*R){const a=s/R;return [1.92+R*Math.cos(a),1.30+R*Math.sin(a),a];}s-=Math.PI*R;if(s<L)return [1.92-R,1.30-s,Math.PI];s-=L;const a=s/R;return [1.92-R*Math.cos(a),-1.30-R*Math.sin(a),Math.PI+a];}
 const chains=[];for(const x of [-.49,.49]){const transforms=Array.from({length:N},()=>({pos:[0,0,0]}));const blocks=instances(chainPart,new T.BoxGeometry(.10,.07,.085),M.wood,transforms);const plates=instances(chainPart,new T.BoxGeometry(.14,.025,.095),M.dark,transforms);chains.push({x,blocks,plates});}
 const carriagePart=P('carriage','Hareketli Sürgü ve Zincir Pimi','Aktarma','Ortadaki sürgü iki üst zincir koluna aynı boyuna noktada bağlanır. Yatak kenarları arasında ileri–geri hareket eder.',[0,.5,0]);
 const carriage=G(carriagePart,[0,2.13,-1.05],'carriage');box(carriage,[.47,.08,.45],[0,0,0],M.wood);for(const x of [-.18,.18])box(carriage,[.035,.06,.70],[x,.06,.14],M.wood);
 cyl(carriage,.025,1.0,[0,.02,0],M.dark,'x');
 const clawPart=P('claw','Kiriş Mandalı ve Uç Dayanaklar','Aktarma','Sürgüye bağlı iki küçük mandal, ön ve arka dayanaklarla ilişkili olarak açılıp kapanır. Gerçek kilit geometrisi sadeleştirilmiştir.',[0,.4,0]);
 const claw=G(carriage,[0,.08,-.08],'claw');for(const x of [-.07,.07])box(claw,[.035,.13,.04],[x,.045,0],M.brass);for(const z of [-1.35,1.14])box(clawPart,[.10,.16,.07],[0,2.08,z],M.dark);
 const magazine=P('magazine','Üst Ahşap Ok Haznesi','Besleme','Kotsanas yorumundaki üst hazne. Bu sergide sekiz ok bulunur; sayı tarihsel kapasite iddiası değildir.',[0,.7,0],true);
 const walls=[];for(const x of [-.19,.19]){const w=G(magazine,[x,0,0],'magazine-wall-'+x);box(w,[.045,.43,1.70],[0,2.72,-.15],M.wood);walls.push(w);}
 for(const z of [-1.04,.74]){box(magazine,[.46,.51,.08],[0,2.71,z],M.wood);for(const x of [-.23,.23])beam(magazine,[x,2.06,z],[x,2.50,z],.05,M.wood);}
 const rollerPart=P('roller','Yivli Besleme Tamburu','Besleme','Boyuna yuva ile tek ok aktarımını anlatan döner tambur. Gösterim evresi sürgü hareketiyle bağlıdır.',[0,.5,0]);
 const roller=G(rollerPart,[0,2.46,-.15],'roller');mesh(roller,new T.CylinderGeometry(.13,.13,1.65,32,1,false,.25,Math.PI*2-.5),M.wood,[0,0,0],[Math.PI/2,0,0]);
 for(const z of [-1.05,.75])cyl(rollerPart,.035,.16,[0,2.46,z],M.brass,'z');
 const camPart=P('cam','Helisel İz ve Takipçi','Besleme','Tamburun helisel izini ve sürgüye bağlı takipçiyi gösteren açıklama elemanları. İz ölçüsü ve bağlantı şekli sergi yorumudur.',[.3,.4,0]);
 const helix=G(roller,[0,0,0],'helix');const hp=[];for(let i=0;i<=60;i++){const a=i*Math.PI/60;hp.push([.133*Math.sin(a),.133*Math.cos(a),-.70+i*1.4/60]);}pipe(helix,hp,.009,M.dark);
 const follower=cyl(camPart,.014,1,[0,0,0],M.brass);follower.name='cam-follower';
 const ammo=P('ammo','Sekiz Sergi Oku','Besleme','Haznedeki görünür oklar, tamburdaki tek ok ve sürgüdeki ok ayrı izlenir. Her otomatik çevrimde sayaç bir azalır; bittiğinde yenilenebilir.',[0,.8,0]);
 function bolt(parent,name){const g=G(parent,[0,0,0],name);cyl(g,.017,1.25,[0,0,0],M.wood,'z');mesh(g,new T.ConeGeometry(.035,.14,4),M.steel,[0,0,.695],[Math.PI/2,0,0]);for(const a of [0,Math.PI/2])box(g,[.085,.006,.18],[0,0,-.53],rope,[0,0,a]);return g;}
 const reserve=Array.from({length:8},(_,i)=>{const g=bolt(ammo,'reserve-'+i);g.position.set((i%2-.5)*.09,2.65+Math.floor(i/2)*.065,-.15);return g;});
 const feed=bolt(ammo,'feed-bolt'),loaded=bolt(ammo,'loaded-bolt');
 const details=P('details','Hazne Kuşakları ve Kama Başları','Besleme','Hazne uçlarının metal kuşakları ve ahşap kama başları. Küçük bağlantılar görsel yoruma dayanır.',[0,.4,0]);
 for(const z of [-1.04,.74])for(const y of [2.55,2.93]){box(details,[.51,.045,.10],[0,y,z],M.dark);for(const x of [-.16,.16])cyl(details,.018,.025,[x,y,z+.06],M.brass,'z');}
 const dummy=new T.Object3D(),pA=new T.Vector3(),pB=new T.Vector3();
 function pose(){const p=S.phase/100;
  let z;if(p<.35)z=-1.05+1.95*p/.35;else if(p<.80)z=.90-1.95*(p-.35)/.45;else z=-1.05;
  const offset=z+1.30;carriage.position.z=z;const spin=offset/R;wheels.forEach(w=>w.rotation.x=spin);crank.rotation.x=spin;
  for(const chain of chains)for(let i=0;i<N;i++){const [y,zz,a]=path(i*PERIM/N+offset);dummy.position.set(chain.x,y,zz);dummy.rotation.set(a,0,0);dummy.updateMatrix();chain.blocks.setMatrixAt(i,dummy.matrix);chain.plates.setMatrixAt(i,dummy.matrix);}chains.forEach(c=>{c.blocks.instanceMatrix.needsUpdate=c.plates.instanceMatrix.needsUpdate=true;});
  const draw=p<.35?0:p<.80?(p-.35)/.45:p<.85?1:Math.max(0,1-(p-.85)/.10);
  arms.forEach((a,i)=>{a.rotation.y=(i?1:-1)*draw*.50;});
  arms[0].updateMatrix();arms[1].updateMatrix();pA.set(-.72,0,-.12).applyMatrix4(arms[0].matrix);pB.set(.72,0,-.12).applyMatrix4(arms[1].matrix);
  const center=new T.Vector3(0,2.21,.90-1.95*draw);between(strings[0],pA,center);between(strings[1],center,pB);
  claw.rotation.x=p>=.35&&p<.85?0:-.8;
  const turn=p<.35?Math.PI*(1-p/.35):p<.70?Math.PI*(p-.35)/.35:Math.PI;roller.rotation.z=turn;
  const f=(z+1.05)/1.95,ha=f*Math.PI;roller.updateMatrix();const contact=new T.Vector3(.133*Math.sin(ha),.133*Math.cos(ha),-.70+f*1.4).applyMatrix4(roller.matrix);between(follower,new T.Vector3(.20,2.21,z),contact);
  const active=S.ammo>0||S.fired;reserve.forEach((g,i)=>{g.visible=i<Math.max(0,S.ammo-(p>=.35&&!S.fired?1:0));});
  feed.visible=active&&p>=.35&&p<.70;feed.position.set(.15*Math.sin(turn),2.46+.15*Math.cos(turn),-.15);if(p>=.65&&p<.70){const h=(p-.65)/.05;feed.position.lerp(new T.Vector3(0,2.23,z+.50),h);}
  loaded.visible=active&&p>=.70&&p<.96;loaded.position.set(0,2.23,p<.85?z+.50:-.55+(p-.85)*20);
  walls.forEach((g,i)=>{g.position.x=(i?1:-1)*(.19+S.open*.005);});
  for(const c of chains)for(const o of [c.blocks,c.plates]){o.material.emissive.setHex(S.highlight?0x62451a:0);o.material.emissiveIntensity=.5;}
 }
 function update(dt){if(Number.isFinite(dt)&&S.speed&&(S.ammo||S.fired)){const old=S.phase;S.phase+=Math.max(0,Math.min(dt,.05))*S.speed*20;if(!S.fired&&old<85&&S.phase>=85){S.ammo--;S.fired=true;}if(S.phase>=100){S.phase=0;S.fired=false;if(!S.ammo)S.speed=0;}}pose();}
 function reset(){Object.assign(S,{speed:0,phase:0,open:0,ammo:8,fired:false,highlight:false});pose();}
 const finishes={oak:{label:'Meşe & Tunç (temsili)',color:0x9a6a38},ash:{label:'Açık Ahşap (temsili)',color:0xb39a70},dark:{label:'Koyu Ahşap (temsili)',color:0x5e4836},aged:{label:'Yaşlanmış Ahşap (temsili)',color:0x877962}};
 function applyTextures(bp){K.applyTextures(bp);K.meshes.forEach(({o})=>{if(o.material.userData.wood){o.userData.origColor.setHex(finishes[finish].color);if(!bp)o.material.color.copy(o.userData.origColor);o.material.map=grain;o.material.bumpMap=relief?grain:null;o.material.bumpScale=.009;o.material.needsUpdate=true;}});}
 const camPresets={iso:{pos:[5,4.5,5.8],look:[0,1.8,0]},front:{pos:[0,2.8,4.8],look:[0,2.15,1.05]},breech:{pos:[3.5,3.2,-4],look:[0,2.1,-.8]},engine:{pos:[2.6,3.5,-2.3],look:[0,2.55,-.2]},suspension:{pos:[3.2,2.3,0],look:[.3,2,0]},top:{pos:[.01,7,0],look:[0,1,0]}};
 const tourSteps=[['Metinden Rekonstrüksiyon','Dionysios’a atfedilen Polybolos, Philon’un anlatımı üzerinden yorumlanır. Buradaki görünüm Kotsanas Müzesi rekonstrüksiyonunu temel alır.','iso',stand,false],['Burulma Demetleri','Ahşap çerçeve, iki lif demeti ve simetrik kollar. Kiriş uçlarının kol hareketini takip edişini izleyin.','front',bundles,false],['Çift Zincir ve Krank','Krank ileri–geri döner. İki yan zincirin üst kolu aynı sürgü pimine bağlanır; zincir yolu bu sergide yuvarlatılmıştır.','suspension',chainPart,false],['Üst Hazne ve Tambur','Hazne yanlarını ayırın veya X-Ray açın. Tamburdaki yuvanın tek oku aşağı aktarmasını inceleyin.','engine',rollerPart,true],['Mandalın Evreleri','Elle evre ayarı gösterimi durdurur. %35 yakalama, %70 aktarım, %85 bırakma sergi zamanlamalarıdır; tarihsel ölçüm değildir.','breech',carriagePart,false],['Sekiz Oklu Sergi Çevrimi','Her otomatik çevrimde bir ok eksilir. Hazne bittiğinde yenileyin. Sekiz ok ve hareket hızı sergi tercihidir; balistik hesap yapılmaz.','iso',ammo,false]].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));
 const ui=K.ui({portraitCameraScale:1.8,title:'POLYBOLOS — Tekrarlayan Ok Atıcı',sub:'MÖ 3. yüzyıl anlatımı • Kotsanas rekonstrüksiyonundan yorum',subsystems:Object.entries(counts).map(([key,count],i)=>({key,label:key,count,color:['#9c805d','#b2a181','#6e7b85','#a4925b'][i]})),camLabels:{iso:'Genel',front:'Burulma',breech:'Sürgü',engine:'Besleme',suspension:'Zincir',top:'Üst'},sliders:[{label:'Yavaş Çevrim Hızı',min:0,max:2,step:.25,fmt:v=>v+'×'},{label:'Elle Çevrim Evresi',min:0,max:100,step:1,fmt:v=>'%'+Math.round(v)},{label:'Hazne Yanlarını Ayır',min:0,max:100,step:1,fmt:v=>'%'+v}],buttons:{terrain:'Zincir Hareketini Vurgula',sweep:'Başlangıca Dön'},telemetryTag:'ÇİFT ZİNCİR • TEK OK AKTARIMI',statLabels:['KALAN OK','EVRE','SÜRGÜ','HIZ']});
 ui.textures=Object.entries(finishes).map(([key,v])=>({key,label:v.label}));ui.activeTexture=()=>finish;ui.textureLabel=()=>finishes[finish].label;ui.relief=()=>relief;ui.reliefLabel=v=>'Ahşap Yüzey: '+(v?'AYRINTILI':'DÜZ');
 pose();applyTextures(false);return {root,parts,ui,camPresets,tourSteps,defaultPart:bed,firePart:carriagePart,update,onFire:()=>{if(!S.ammo){S.ammo=8;S.phase=0;S.fired=false;S.speed=0;pose();return {ok:true,refill:true};}S.speed=S.speed?0:1;return {ok:true};},fireButtonLabel:()=>!S.ammo?'HAZNEYİ YENİLE (8)':S.speed?'ÇEVRİMİ DURAKLAT':'YAVAŞ ÇEVRİMİ BAŞLAT',mobileFireButtonLabel:()=>!S.ammo?'Yenile (8)':S.speed?'Duraklat':'Çevrimi İzle',onSlider:(i,v)=>{if(!Number.isFinite(v))return {};if(i===0)S.speed=T.MathUtils.clamp(v,0,2);if(i===1){S.phase=T.MathUtils.clamp(v,0,100);S.speed=0;S.fired=S.phase>=85;}if(i===2){S.open=T.MathUtils.clamp(v,0,100);S.speed=0;}pose();return {};},onButton:n=>{if(n==='terrain')S.highlight=!S.highlight;else reset();pose();return {};},buttonActive:n=>n==='terrain'?S.highlight:false,getSliderValues:()=>[S.speed,S.phase,S.open],getStats:()=>[S.ammo+' <span>/ 8</span>',Math.round(S.phase)+' <span>%</span>',carriage.position.z.toFixed(2)+' <span>sergi birimi</span>',S.speed+' <span>×</span>'],getStatus:()=>({text:S.speed?'YAVAŞ TEKRARLI ÇEVRİM':'DURAKLATILDI • İNCELE',color:'#9b7a45'}),applyTextures,setTexture:k=>{if(finishes[k])finish=k;},toggleRelief:()=>{relief=!relief;return relief;}};
};})();
