/* KHM A 384, before 1596. Enlarged external museum reconstruction.
 * Shape, interior joints and presentation movements are approximate.
 */
(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.lantern=function(ctx){
 const K=window.MuseumModelKit(ctx,'lantern'),{T,root,parts,mats:M,mesh,box,cyl,ring,pipe,beam,instances}=K;
 const S={shutter:0,blade:0,curl:0,lit:true,time:0};let num=0;const counts={};
 M.paint.color.setHex(0x59636a);M.paint.metalness=.8;M.paint.roughness=.43;
 M.steel.color.setHex(0x8b969a);M.steel.roughness=.30;M.dark.color.setHex(0x30383c);
 const velvet=new T.MeshStandardMaterial({color:0x802333,roughness:1,metalness:0});
 const leather=new T.MeshStandardMaterial({color:0x42332b,roughness:.96});
 function G(parent,pos,name){const g=new T.Group();g.position.set(...pos);g.name=name;parent.add(g);return g;}
 function P(key,name,sub,desc,exp,outer=false,parent=root){counts[sub]=(counts[sub]||0)+1;const p=K.part(key,(++num)+'. '+name,sub,[0,0,0],exp,desc,outer,parent);Object.assign(p.userData,{material:'Demir, pirinç, deri ve kadife',weight:'Kütle hesaplanmıyor',spec:'KHM A 384 • büyütülmüş dış rekonstrüksiyon'});return p;}
 const mount=G(root,[0,1.6,0],'shield-mount');
 const pedestal=P('pedestal','Çağdaş Müze Mesnedi','Sergi','Sade kaide ve arka destekler günümüz sergi elemanıdır; tarihsel nesnenin parçası değildir.',[0,0,0]);
 box(pedestal,[3.4,.12,1.8],[-.5,.06,-.20],M.dark);for(const x of [-.55,.55]){cyl(pedestal,.027,.60,[x,.42,-.30],M.dark);pipe(pedestal,[[x,.72,-.30],[x,.79,-.16],[x,.79,.02]],.026,M.dark);}
 function outline(){const s=new T.Shape();for(let i=0;i<=128;i++){const a=i*Math.PI*2/128,y=Math.sin(a),x=Math.max(Math.cos(a),y>-.06&&y<.55?-.76:-1);if(!i)s.moveTo(x,y);else s.lineTo(x,y);}s.closePath();return s;}
 function circleHole(s,x,y,r){const h=new T.Path();h.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(h);}
 function plate(p,s,z,mat){return mesh(p,new T.ExtrudeGeometry(s,{depth:.045,bevelEnabled:false,curveSegments:12}),mat,[0,0,z]);}
 const shield=P('shield','Delikli Yuvarlak Kalkan','Kalkan','Kenar eldiven çentiği, ışık ağzı, radyal yarıklar ve dairesel delikler. Açıklıklar gerçek geometri boşluklarıdır.',[0,0,.45],true,mount);
 const face=outline();circleHole(face,0,.65,.13);
 for(let i=0;i<20;i++){const a=i*Math.PI*2/20;circleHole(face,Math.cos(a)*.38,Math.sin(a)*.38,.026);const h=new T.Path();const c=Math.cos(a),s=Math.sin(a);h.moveTo(c*.14-s*.01,s*.14+c*.01);h.lineTo(c*.30-s*.014,s*.30+c*.014);h.lineTo(c*.30+s*.014,s*.30-c*.014);h.lineTo(c*.14+s*.01,s*.14-c*.01);h.closePath();face.holes.push(h);}
 plate(shield,face,.02,M.paint).userData.apertures=41;
 const rim=P('rim','Kıvrılmış Kenar ve Çemberler','Kalkan','Kalkan kenarının kıvrımı, aralıklı dış bantlar ve pirinç kenar çizgileri. Fotoğraf biçimi yaklaşık olarak yorumlanmıştır.',[0,0,.3],false,mount);
 const rimPts=[];for(let i=0;i<=128;i++){const a=i*Math.PI*2/128,y=Math.sin(a);rimPts.push([Math.max(Math.cos(a),y>-.06&&y<.55?-.76:-1),y,.05]);}pipe(rim,rimPts,.023,M.steel);
 for(const [start,end] of [[-.08,2.45],[3.50,6.03]]){const pts=[];for(let i=0;i<=48;i++){const a=start+(end-start)*i/48;pts.push([Math.cos(a)*.83,Math.sin(a)*.83,.085]);}pipe(rim,pts,.027,M.paint);}
 const rivets=P('rivets','Pirinç Perçinler ve Rozetler','Kalkan','Ön yüzdeki ayrı perçin başları, merkez çevresi ve arkadaki küçük rozet bağlantıları.',[0,0,.4],false,mount);
 const studs=[];for(const r of [.94,.83])for(let i=0;i<40;i++){const a=i*Math.PI/20,x=r*Math.cos(a),y=r*Math.sin(a);if(x<-.70&&y>-.09&&y<.58||Math.abs(x)<.18&&y>.56&&y<.85)continue;studs.push({pos:[x,y,.09]});}
 for(let i=0;i<8;i++){const a=i*Math.PI/4;studs.push({pos:[Math.cos(a)*.085,Math.sin(a)*.085,.105]});}
 instances(rivets,new T.SphereGeometry(.016,10,8),M.brass,studs);
 const boss=P('boss','Merkez Çıkıntısı','Kalkan','Merkezdeki sivri çıkıntı ve taban halkası. Kalkanın sıra dışı birleşik formunun bir parçasıdır.',[0,0,.6],false,mount);
 cyl(boss,.072,.10,[0,0,.11],M.steel,'z');mesh(boss,new T.ConeGeometry(.045,.53,8),M.steel,[0,0,.42],[Math.PI/2,0,0]);
 const lining=P('lining','Kırmızı Kadife Astar','İç Donanım','Müzenin arka görünümündeki koyu kırmızı kadife. Dış kalkan deliklerinin arkasında astar bulunur; ışık ağzı açık bırakılmıştır.',[0,0,-.45],true,mount);
 const liningShape=outline();circleHole(liningShape,0,.65,.13);plate(lining,liningShape,-.055,velvet);
 const embroidery=P('embroidery','Altın Renkli Şerit ve Rozetler','İç Donanım','Astar kenarındaki işlemeli şerit, çift dikiş çizgileri ve rozetler. Motif ayrıntıları sadeleştirilmiştir.',[0,0,-.3],false,mount);
 for(const radius of [.90,.92])ring(embroidery,radius,[0,0,-.065],M.brass,.008);
 const stitches=[];for(let i=0;i<120;i++){const a=i*Math.PI/60;stitches.push({pos:[.91*Math.cos(a),.91*Math.sin(a),-.072],rot:[0,0,a]});}instances(embroidery,new T.BoxGeometry(.015,.006,.007),M.brass,stitches);
 const straps=P('straps','Kol Kayışları ve Tokalar','İç Donanım','Arka yüzde kadife kaplı kol bağı, tutamak ve küçük bağlantı tokaları. Taşıyıcı bağlantılar görünür bırakılır.',[0,0,-.6],false,mount);
 for(const x of [-.28,.28]){pipe(straps,[[x,-.65,-.10],[x,-.40,-.34],[x,.10,-.36],[x,.42,-.10]],.055,velvet);box(straps,[.16,.12,.03],[x,-.66,-.11],M.brass);box(straps,[.11,.07,.036],[x,-.66,-.13],leather);}
 cyl(straps,.035,.48,[-1.0,.22,-.20],M.dark);for(const y of [0,.44])beam(straps,[-1,y,-.20],[-.73,y,-.04],.04,M.steel);
 const gauntlet=P('gauntlet','Mafsallı Demir Eldiven','Eldiven','Fotoğraftaki sol el zırhı: bileklik, üst üste binen sırt levhaları, parmaklar ve yana ayrılan başparmak.',[-.6,.2,.3],false,mount);
 const cuff=mesh(gauntlet,new T.CylinderGeometry(.24,.21,.40,32,1,true),M.paint,[-.82,.24,.08],[0,0,Math.PI/2]);
 const palm=mesh(gauntlet,new T.SphereGeometry(1,32,20),M.paint,[-1.08,.24,.15]);palm.scale.set(.25,.20,.14);
 for(let i=0;i<5;i++){const x=-.85-i*.065;const o=ring(gauntlet,.20,[x,.24,.17],M.steel,.012,[0,Math.PI/2,0]);o.scale.x=.80;}
 const fingers=[];for(let i=0;i<4;i++){const f=G(gauntlet,[-1.22,.10+i*.09,.14],'finger-'+i);fingers.push(f);for(let j=0;j<3;j++){const o=mesh(f,new T.SphereGeometry(1,16,10),M.paint,[-.06-j*.055,0,-j*.025]);o.scale.set(.065,.045,.06);ring(f,.039,[-.055-j*.055,0,-j*.025],M.brass,.006,[0,Math.PI/2,0]);}}
 const thumb=mesh(gauntlet,new T.SphereGeometry(1,16,12),M.paint,[-1.04,-.01,.12],[0,0,-.55]);thumb.scale.set(.16,.07,.10);
 const mail=P('mail','Zincir Örgü ve Deri İçlik','Eldiven','Eldiven altında birbirine geçen halkalar ve koyu deri içlik. Tekrarlanan yüzler örneklenmiş geometriyle çizilir.',[-.55,0,-.4],false,mount);
 const backing=mesh(mail,new T.SphereGeometry(1,20,12),leather,[-1.06,.22,-.035]);backing.scale.set(.30,.23,.05);
 const links=[];for(let row=0;row<12;row++)for(let col=0;col<15;col++)links.push({pos:[-1.36+col*.036+(row%2)*.018,-.01+row*.04,-.085],rot:[row%2?.40:-.40,0,0]});instances(mail,new T.TorusGeometry(.022,.004,5,10),M.steel,links);
 const spikes=P('spikes','Eldivenin İki Uzun Çıkıntısı','Eldiven','KHM örneğindeki iki dar çıkıntı. Çentikli kenarların biçimi fotoğraftan sadeleştirilmiştir.',[-.7,.15,.2],false,mount);
 for(const [y,dy] of [[.45,.35],[-.02,-.10]]){const a=new T.Vector3(-1.18,y,.15),b=new T.Vector3(-2.20,y+dy,.15);const mid=a.clone().add(b).multiplyScalar(.5);const o=mesh(spikes,new T.ConeGeometry(.035,a.distanceTo(b),4),M.steel,mid.toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());}
 const tooth=new T.Shape();tooth.moveTo(0,0);tooth.lineTo(.04,-.035);tooth.lineTo(.06,0);tooth.closePath();
 const teeth=[];for(const [y,dy] of [[.45,.35],[-.02,-.10]])for(let i=0;i<8;i++){const t=.06+i*.055;teeth.push({pos:[-1.18-t,y+t*dy/1.02,.15],rot:[0,0,-Math.atan2(dy,1.02)]});}instances(spikes,new T.ExtrudeGeometry(tooth,{depth:.012,bevelEnabled:false}),M.steel,teeth);
 const scabbard=P('scabbard','Sürgülü Bıçak Kılavuzu','Bıçak','Kalkanın altından geçen uzun kılavuz ve arka uzantı. Bıçak bu kılavuzun açık kanalında kayar.',[0,-.3,-.1],false,mount);
 for(const y of [-.30,-.44])box(scabbard,[2.45,.025,.16],[.42,y,-.10],M.paint);
 box(scabbard,[2.45,.15,.02],[.42,-.37,-.19],velvet);
 for(const x of [-.70,.3,1.52])for(const y of [-.30,-.44])cyl(scabbard,.014,.025,[x,y,-.01],M.brass,'z');
 const bladePart=P('blade','Uzatılabilir Çelik Bıçak','Bıçak','KHM kaydı: toplam uzunluk 82 cm, bıçak açıkken 101 cm. Modelde 19 cm fark, kalkan çapına göre orantılı gösterilir; iç kilit mekanizması yorumlanmaz.',[-.6,-.2,0],false,mount);
 const slide=G(bladePart,[0,0,0],'blade-slide');
 const bladeShape=new T.Shape();bladeShape.moveTo(.90,-.415);bladeShape.lineTo(-2.30,-.415);bladeShape.lineTo(-2.55,-.37);bladeShape.lineTo(-2.30,-.325);bladeShape.lineTo(.90,-.325);bladeShape.closePath();mesh(slide,new T.ExtrudeGeometry(bladeShape,{depth:.025,bevelEnabled:false}),M.steel,[0,0,-.12]);
 beam(slide,[-2.30,-.37,-.089],[.88,-.37,-.089],.011,M.dark);
 const lamp=P('lamp','Arka Fener ve Askı','Fener','Arka yüzdeki metal fener, üst külah ve küçük askı bağlantıları. Kaynak bunu yağ lambalı bir düzen olarak açıklar.',[0,.3,-.6],true,mount);
 const lampPos=[0,.65,-.34];
 mesh(lamp,new T.CylinderGeometry(.18,.18,.42,32,1,true,Math.PI/4,Math.PI*1.5),M.brass,lampPos);
 for(const y of [.44,.86])cyl(lamp,.185,.035,[0,y,-.34],M.brass);
 mesh(lamp,new T.ConeGeometry(.21,.25,12),M.brass,[0,1.0,-.34]);
 ring(lamp,.065,[0,1.17,-.34],M.brass,.012);
 for(const x of [-.22,.22])for(const y of [.49,.81]){beam(lamp,[x,y,-.06],[x,y,-.34],.028,M.dark);cyl(lamp,.022,.025,[x,y,-.05],M.brass,'z');}
 lamp.children.forEach(o=>{o.position.y-=.20;});
 const interior=P('interior','Lamba İçi ve Işık Gösterimi','Fener','Küçük kap, fitil ucu ve sıcak renkli temsili alev. Gerçek yanma veya aydınlatma gücü hesaplanmaz.',[0,.2,-.5],false,mount);
 cyl(interior,.10,.09,[0,.50,-.34],M.dark);cyl(interior,.018,.05,[0,.565,-.34],M.rubber);
 const flameMat=new T.MeshBasicMaterial({color:0xffb64b,transparent:true,opacity:.8,depthWrite:false});
 const flame=new T.Mesh(new T.SphereGeometry(1,16,12),flameMat);flame.position.set(0,.63,-.34);flame.scale.set(.035,.09,.035);interior.add(flame);
 const port=P('port','Işık Ağzı ve Menteşeli Kapak','Fener','Kalkan yüzündeki gerçek açıklık ve menteşeli yuvarlak kapak. Kapak açıldıkça temsili ışık görünür.',[0,0,.5],false,mount);
 ring(port,.135,[0,.65,.078],M.brass,.012);
 const shutter=G(port,[0,.79,.085],'shutter');cyl(shutter,.14,.022,[0,-.14,0],M.paint,'z');cyl(port,.023,.17,[0,.79,.085],M.steel,'x');
 box(shutter,[.08,.02,.025],[0,-.20,.025],M.brass);
 const glowMat=new T.MeshBasicMaterial({color:0xffc568,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending});
 const glow=new T.Mesh(new T.ConeGeometry(.40,.85,32,1,true),glowMat);glow.position.set(0,.65,.55);glow.rotation.x=-Math.PI/2;mount.add(glow);glow.name='light-beam';
 function sync(){shutter.rotation.x=-S.shutter*Math.PI/180;slide.position.x=-S.blade*.0095;fingers.forEach((g,i)=>{g.rotation.y=-S.curl*Math.PI/180;});flame.visible=S.lit;glow.visible=S.lit&&S.shutter>8;glowMat.opacity=S.lit?Math.max(0,(S.shutter-8)/102)*.12:0;}
 function update(dt){if(Number.isFinite(dt))S.time+=Math.max(0,Math.min(dt,.05));flame.scale.y=.09+(S.lit?Math.sin(S.time*3)*.006:0);sync();}
 function reset(){Object.assign(S,{shutter:0,blade:0,curl:0,lit:true,time:0});sync();}
 const camPresets={iso:{pos:[4.3,3.7,5.8],look:[-.65,1.55,0]},front:{pos:[-.65,1.8,6],look:[-.65,1.6,0]},breech:{pos:[-3.4,3.0,-4.7],look:[-.3,1.65,-.15]},engine:{pos:[1.8,3.1,-2.5],look:[0,2.25,-.3]},suspension:{pos:[-3.1,2.6,2.1],look:[-1.15,1.8,.1]},top:{pos:[-.6,7,.01],look:[-.6,1,0]}};
 const tourSteps=[['A 384 • 1596’dan Önce','Kunsthistorisches Museum, Ferdinand II koleksiyonu. Müze bu birleşik nesneyi pratikliği sınırlı, muhtemelen sohbet ve sergileme amaçlı bir tasarım olarak yorumlar.','iso',shield,false],['Delikler ve Perçinler','Kalkan yüzünde gerçek radyal açıklıklar, ışık ağzı, dış çemberler ve pirinç perçinler.','front',rim,false],['Demir Eldiven','Bileklik, üst üste binen levhalar, dört parmak, başparmak ve iki uzun çıkıntı. Arka yüzde zincir örgü ve tutamak vardır.','suspension',gauntlet,false],['Kadife ve İç Donanım','Kırmızı kadife astar, şeritler, kol kayışları ve fener. İç görünüm müzenin arka fotoğrafına dayanır.','breech',lining,false],['Kapaklı Fener','Kapağı açıp ışık gösterimini deneyin. X-Ray metal fener gövdesinin içindeki temsili lambayı gösterir.','engine',interior,true],['Sürgülü Bıçak','Kaynakta 82 cm kapalı, 101 cm açık toplam uzunluk belirtilir. Burada inceleme hareketi gösterilir; iç kilit yapısı yaklaşık bırakılır.','front',bladePart,false]].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));
 const ui=K.ui({portraitCameraScale:1.8,title:'FENERLİ KALKAN — KHM A 384',sub:'1596’dan önce • Demir eldiven, kadife ve gizli fener • Müze rekonstrüksiyonu',subsystems:Object.entries(counts).map(([key,count],i)=>({key,label:key,count,color:['#8b9094','#647b8b','#a53b4c','#6e7e8d','#8a8077','#b59a59'][i]})),camLabels:{iso:'Genel',front:'Ön Yüz',breech:'Kadife İç Yüz',engine:'Fener',suspension:'Eldiven',top:'Üst'},sliders:[{label:'Işık Kapağı',min:0,max:110,step:1,fmt:v=>v+'°'},{label:'Bıçak Uzantısı',min:0,max:100,step:1,fmt:v=>'%'+v},{label:'Parmak İnceleme Açısı',min:0,max:35,step:1,fmt:v=>v+'°'}],buttons:{terrain:'Feneri Yak / Söndür',sweep:'Başlangıca Dön'},telemetryTag:'KHM • A 384 • MÜZE NESNESİ',statLabels:['KAPAK','BIÇAK','PARMAKLAR','FENER']});
 sync();return {root,parts,ui,camPresets,tourSteps,defaultPart:shield,firePart:port,update,onFire:()=>{S.shutter=S.shutter?0:100;sync();return {ok:true};},fireButtonLabel:()=>S.shutter?'IŞIK KAPAĞINI KAPAT':'IŞIK KAPAĞINI AÇ',mobileFireButtonLabel:()=>S.shutter?'Kapağı Kapat':'Kapağı Aç',onSlider:(i,v)=>{if(!Number.isFinite(v))return {};if(i===0)S.shutter=T.MathUtils.clamp(v,0,110);if(i===1)S.blade=T.MathUtils.clamp(v,0,100);if(i===2)S.curl=T.MathUtils.clamp(v,0,35);sync();return {};},onButton:n=>{if(n==='terrain')S.lit=!S.lit;else reset();sync();return {};},buttonActive:n=>n==='terrain'?S.lit:false,getSliderValues:()=>[S.shutter,S.blade,S.curl],getStats:()=>[S.shutter+' <span>°</span>',S.blade+' <span>%</span>',S.curl+' <span>° temsili</span>',(S.lit?'YANIK':'SÖNÜK')+' <span>gösterim</span>'],getStatus:()=>({text:S.shutter&&S.lit?'IŞIK GÖSTERİMİ':'İNCELEMEYE HAZIR',color:'#ac8b43'}),applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
};})();
