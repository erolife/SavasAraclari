/* Museum reconstruction. Measurements describe the source object; scene units are enlarged.
 * Separation controls are interpretive exhibit motions. */
(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.win1887=function(ctx){
 const K=window.MuseumModelKit(ctx,'win1887');
 const {T,root,parts,mesh,box,cyl,ring,pipe,beam,instances}=K;
 const english=window.MuseumPreferences?.language==='en';const t=(tr,en)=>english?en:tr;
 const state={a:0,b:0,c:0,support:true};const counts={};let n=0;
 function mat(color,metalness=.3,roughness=.6,paint=false){const m=new T.MeshStandardMaterial({color,metalness,roughness});m.userData.paint=paint;return m;}
 function group(parent,pos=[0,0,0]){const g=new T.Group();g.position.set(...pos);parent.add(g);return g;}
 const exhibit=group(root);
 function grain(m){const a=new Uint8Array(128*32*4);for(let y=0;y<32;y++)for(let x=0;x<128;x++){const v=Math.round(210+23*Math.sin(y*1.3+Math.sin(x*.035)*2)+9*Math.sin(y*4+x*.07));a.set([v,v,v,255],(y*128+x)*4);}const tex=new T.DataTexture(a,128,32,T.RGBAFormat);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.colorSpace=T.SRGBColorSpace;tex.needsUpdate=true;m.map=tex;return m;}
 function tubeX(p,x1,x2,y,z,r,m){const points=[[r,x1],[r,x2],[r*.62,x2],[r*.62,x2-.11]].map(([a,b])=>new T.Vector2(a,b));const g=new T.LatheGeometry(points,40);return mesh(p,g,m,[0,y,z],[0,0,-Math.PI/2]);}
 function screw(p,x,y,z,r,m,slot){cyl(p,r,.018,[x,y,z],m,'z');box(p,[r*1.4,.007,.003],[x,y,z+(z<0?-.011:.011)],slot);}

 function part(id,tr,en,ftr,fen,descTr,descEn,exp=[0,.3,0],outer=false,parent=exhibit){const sub=t(ftr,fen);counts[sub]=(counts[sub]||0)+1;const p=K.part(id,++n+'. '+t(tr,en),sub,[0,0,0],exp,t(descTr,descEn),outer,parent);Object.assign(p.userData,{material:t("Çelik, ahşap ve çağdaş sergi mesnetleri","Steel, wood and modern exhibit mounts"),weight:t('Parça kütlesi hesaplanmıyor','Part mass is not calculated'),spec:t("Propstore lot 511 • referans boyu 69 cm","Propstore lot 511 • reference length 69 cm")});return p;}
 function ellipsoid(p,pos,scale,m){const o=mesh(p,new T.SphereGeometry(1,24,16),m,pos);o.scale.set(...scale);return o;}
 function plate(p,points,depth,m,pos=[0,0,0]){const s=new T.Shape();s.moveTo(...points[0]);points.slice(1).forEach(v=>s.lineTo(...v));s.closePath();return mesh(p,new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.006,bevelThickness:.004,bevelSegments:1}),m,pos);}

 const steel=mat(0x41484b,.82,.44,true),edge=mat(0x767c7b,.85,.35),black=mat(0x252b2d,.65,.56),wood=grain(mat(0x805139,.03,.82)),darkwood=mat(0x3f3028,.03,.88),brass=mat(0xa39163,.65,.5);
 const support=part('support','Çağdaş Sergi Mesnedi','Modern exhibit mount','Sergi','Exhibit','Kabza ve ön tüp altındaki iki mesnet tarihsel parçalar değildir.','Two mounts beneath the grip and forward tube are modern display fittings.',[0,-.12,0]);
 box(support,[5.65,.10,1.8],[.3,.05,0],darkwood);
 for(const[x,y]of [[-1.65,1.12],[1.9,1.88]]){cyl(support,.02,y-.12,[x,(y+.12)/2,0],brass);pipe(support,[[x,y+.07,-.16],[x,y-.02,-.09],[x,y-.04,0],[x,y-.02,.09],[x,y+.07,.16]],.021,brass);}
 const frame=part('frame','Yuvarlak Omuzlu Alıcı Gövdesi','Rounded-shoulder receiver','Gövde','Frame','Kıvrımlı arka kenar ve geniş yan yüzey, fotoğraftaki alıcı grubunun dış biçimini izler.','The curved rear edge and broad side face follow the photographed receiver exterior.',[0,.25,.25]);
 const rp=[[-.89,1.72],[-1.02,1.91],[-.99,2.11],[-.80,2.27],[-.61,2.34],[.08,2.34],[.35,2.28],[.49,2.18],[.49,1.83],[.31,1.68],[-.40,1.65]];
 plate(frame,rp,.26,steel,[0,0,-.13]);
 const side=part('side','Yan Yüzey Bordürleri','Side-face borders','Yüzey','Surface','İnce kenarlar ve yuvarlatılmış birleşim hatları. Özgün seri numarası ve marka damgası kopyalanmaz.','Fine borders and rounded seams. Original serial numbers and maker stamps are not copied.',[0,.25,.35],true);
 for(const z of [-.15,.15]){pipe(side,[[-.83,1.78,z],[-.95,1.95,z],[-.85,2.16,z],[-.58,2.29,z],[.06,2.29,z],[.40,2.14,z]],.010,edge);pipe(side,[[-.71,1.73,z],[.24,1.73,z],[.42,1.87,z]],.007,black);}
 const barrel=part('barrel','Kısaltılmış Üst Namlu','Shortened upper barrel','Ön Grup','Front group','Film aksesuarının kısa dış namlu silueti. Kesilmiş biçim bu sergide zaten mevcut bir film nesnesi olarak anlatılır.','The prop has a shortened barrel silhouette. This exhibit describes an existing film object.',[.3,.3,0]);
 tubeX(barrel,.35,2.78,2.20,0,.095,steel);cyl(barrel,.12,.15,[.42,2.20,0],steel,'x');
 const muzzle=part('muzzle','Ağız Kenarı','Muzzle rim','Ön Grup','Front group','Açık uç ve aşınmış kenarın yaklaşık dış yorumu.','Open muzzle and interpreted worn edge.',[.4,.25,.1]);
 ring(muzzle,.083,[2.781,2.20,0],edge,.010,[0,Math.PI/2,0]);
 const tube=part('tube','Alt Tüp Dış Biçimi','Lower tube exterior','Ön Grup','Front group','Namluya paralel, daha kısa alt tüp ve yuvarlatılmış kapak.','A shorter lower tube runs parallel to the barrel and ends in a rounded cap.',[.3,.1,.1]);
 cyl(tube,.092,2.04,[1.40,1.98,0],steel,'x');ellipsoid(tube,[2.43,1.98,0],[.05,.09,.09],steel);
 const saddle=part('saddle','Ön ve Arka Tüp Bağlantıları','Front and rear tube attachments','Ön Grup','Front group','İki tüp arasındaki kısa bağlantı yüzeyleri.','Short attachment surfaces between the two tubes.',[.25,.2,.1]);
 for(const x of [.44,2.18])box(saddle,[.065,.20,.11],[x,2.09,0],black);
 const gripCore=part('gripCore','Kabza İçindeki Metal Sırt','Metal grip spine','Ahşap ve Kabza','Wood and grip','Kısa kıvrımlı kabzanın içindeki sadeleştirilmiş metal sırt.','Simplified metal spine within the short curved grip.',[-.3,.1,0]);
 const gp=[[-.88,1.87],[-1.18,1.80],[-1.82,1.37],[-1.96,1.19],[-1.91,1.07],[-1.72,1.02],[-1.42,1.17],[-.78,1.61]];
 plate(gripCore,gp,.18,black,[0,0,-.09]);
 const woodGroups=[];
 for(const sign of [-1,1]){
  const g=group(exhibit);woodGroups.push(g);
  const grip=part(sign<0?'gripBack':'gripFront',sign<0?'Sol Kısa Ahşap Kabza':'Sağ Kısa Ahşap Kabza',sign<0?'Left short wooden grip':'Right short wooden grip','Ahşap ve Kabza','Wood and grip','Ahşap damarları, dolgun kenarlar ve kısa dipçik profili. Yanak ayrılması müze yorumudur.','Wood grain, rounded edges and the short stock profile. Cheek separation is an exhibit interpretation.',[-.4,.1,sign*.5],true,g);
  plate(grip,gp,.062,wood,[0,0,sign<0?-.155:.093]);
  const fore=part(sign<0?'foreBack':'foreFront',sign<0?'Sol Ön Ahşap Parça':'Sağ Ön Ahşap Parça',sign<0?'Left fore-end wood':'Right fore-end wood','Ahşap ve Kabza','Wood and grip','Ön tüpün iki yanındaki ince ahşap parçalar ve uç vidaları.','Slim wooden sections on either side of the forward tube, with end screws.',[.2,.2,sign*.5],true,g);
  ellipsoid(fore,[1.23,2.04,sign*.092],[.77,.133,.055],wood);
  for(const x of [.62,1.79])screw(fore,x,2.04,sign*.151,.022,edge,black);
 }
 const leverPivot=group(exhibit,[-.40,1.75,0]);
 const lever=part('lever','Geniş Açık Kol Halkası','Wide open lever loop','Kol','Lever','Film nesnesindeki geniş halka. Kaydırıcı dış kolun inceleme açısını değiştirir; doldurma veya atış çevrimi değildir.','The prop’s wide loop. The slider changes exterior inspection angle, not a loading or firing cycle.',[-.3,-.2,.3],false,leverPivot);
 pipe(lever,[[0,0,0],[-.58,-.07,0],[-.96,-.34,0],[-.94,-.72,0],[-.72,-.87,0],[-.31,-.86,0],[.12,-.61,0],[.22,-.22,0],[0,0,0]],.025,steel);
 const leverBack=part('leverBack','Kolun Geniş Arka Yüzeyi','Broad rear lever surface','Kol','Lever','Kısa kabzanın altına oturan geniş metal dış yüzey halkayla birlikte hareket eder.','The broad exterior surface beneath the short grip moves with the loop.',[-.4,-.2,.2],false,leverPivot);
 plate(leverBack,[[-.08,.03],[-.57,.08],[-.91,-.19],[-.96,-.45],[-.78,-.55],[-.64,-.36],[-.18,-.13]],.13,black,[0,0,-.065]);
 const pivot=part('pivot','Kol Ekseni ve Dış Bağlantı','Lever pivot and exterior attachment','Kol','Lever','Sabit gövde ekseni ile hareketli halka aynı merkezde buluşur.','The fixed frame axis and moving loop share the same centre.',[-.2,-.1,.3]);
 cyl(pivot,.065,.31,[-.40,1.75,0],steel,'z');for(const z of [-.17,.17])screw(pivot,-.40,1.75,z,.036,edge,black);
 const hammer=part('hammer','Horoz Dış Biçimi','Hammer exterior','Gövde','Frame','Arkadaki kısa çıkıntı ve tırtıllı başlık.','Short rear projection and serrated spur.',[-.35,.3,0]);
 plate(hammer,[[-.94,1.85],[-1.17,1.94],[-1.24,2.07],[-1.14,2.10],[-1.01,1.99],[-.91,1.98]],.11,steel,[0,0,-.055]);for(let i=0;i<5;i++)box(hammer,[.012,.018,.12],[-1.22+i*.023,2.105,0],edge);
 const trigger=part('trigger','Dış Tetik Kıvrımı','Exterior trigger curve','Gövde','Frame','Kaynak film nesnesinde tetik korkuluğu değiştirilmiştir; burada dış kıvrım sergilenir.','The source prop has an altered trigger guard; the exterior curve is displayed here.',[-.2,-.2,.1]);
 pipe(trigger,[[-.31,1.69,0],[-.26,1.56,0],[-.34,1.48,0],[-.46,1.47,0]],.018,black);
 const screws=part('screws','Yan Vidalar ve Kenar Aşınması','Side screws and edge wear','Yüzey','Surface','Fotoğraftan yorumlanan dış vidalar ve ince açık renkli aşınma çizgileri.','Exterior screws and fine light-coloured wear lines interpreted from the photograph.',[0,.2,.4]);
 for(const sign of [-1,1]){for(const[x,y]of [[-.65,1.89],[.12,1.84],[-1.1,1.74]])screw(screws,x,y,sign*.17,.028,edge,black);for(let i=0;i<9;i++)box(screws,[.04+i%3*.012,.003,.003],[-.7+i*.12,2.26-i*.005,sign*.165],edge);}
 const film=part('film','Model 1887, Üretim 1888, Film 1991','Model 1887, made 1888, film 1991','Sergi','Exhibit','Propstore kaydı 1888 üretimi, 69 cm boyundaki değişmiş film nesnesini anlatır. Bu, fabrika çıkışı tüm Model 1887’lerin biçimi değildir.','Propstore documents an altered 1888-made, 69 cm film object. This is not the factory form of every Model 1887.',[0,.1,.4]);
 box(film,[1.1,.025,.33],[1.8,.125,.50],brass);for(let i=0;i<7;i++)for(const z of [.37,.63])box(film,[.047,.003,.04],[1.36+i*.14,.14,z],black);
 function sync(){woodGroups.forEach((g,i)=>g.position.z=(i===0?-1:1)*state.a/100*.35);leverPivot.rotation.z=state.b*Math.PI/180;exhibit.rotation.y=state.c*Math.PI/180;support.visible=state.support;}

 function reset(){Object.assign(state,{a:0,b:0,c:0,support:true});sync();}
 const camPresets={"iso": {"pos": [4.5, 3.5, 7], "look": [0.3, 1.25, 0]}, "front": {"pos": [0.3, 2, 7], "look": [0.3, 1.5, 0]}, "breech": {"pos": [0.3, 2, -7], "look": [0.3, 1.5, 0]}, "engine": {"pos": [-0.7, 2.8, 3.4], "look": [-0.5, 1.75, 0]}, "suspension": {"pos": [2.1, 2.8, 3.2], "look": [1.6, 2.1, 0]}, "top": {"pos": [0.3, 7, 0.01], "look": [0.3, 1.5, 0]}};
 const tourSteps=[[["Sinemada Tanınan Bir Biçim", "A silhouette recognised in cinema"], ["Kısa ahşap kabza, altta ikinci tüp ve geniş kol halkası film nesnesini tanımlar.", "A short wooden grip, lower second tube and wide lever loop define the film object."], "iso", "frame", false], [["Üç Ayrı Tarih", "Three separate dates"], ["1887 modelin adıdır; kaynak nesne 1888 üretimidir; Terminator 2 ise 1991 filmidir.", "1887 is the model name, the source object was made in 1888, and Terminator 2 is the 1991 film."], "front", "film", false], [["Ahşabın İki Yüzü", "Two sides of the wood"], ["Kabza yanaklarını ve ön ahşap parçaları ayır. Bu ayrım, dış malzemeleri incelemek için eklenmiştir.", "Separate the grip cheeks and forward wooden sections. This is added to inspect exterior materials."], "engine", "gripCore", true], [["Geniş Kol Halkası", "Wide lever loop"], ["Halkanın gerçek boşluğunu ve ortak eksende dönen dış yüzeyi incele. Hareket doldurma sırası göstermez.", "Inspect the open loop and exterior surface rotating about their shared axis. Motion does not show a loading sequence."], "engine", "lever", false], [["İki Paralel Dış Biçim", "Two parallel exterior forms"], ["Üstte namlu, altta daha kısa tüp ve yuvarlatılmış uç kapağı vardır.", "The upper barrel sits above a shorter tube with a rounded end cap."], "suspension", "tube", false], [["Nesne ve Film Aksesuarı", "Object and film prop"], ["Belirli film nesnesinin değiştirilmiş biçimi anlatılır. Seri numarası, iç ateşleme ve dublör hareketi yeniden üretilmez.", "The altered form of a particular film object is interpreted. Serial numbers, internal firing and stunt motion are not reproduced."], "iso", "screws", false]].map(([title,desc,cam,key,cutaway])=>({title:t(...title),desc:t(...desc),cam,part:parts[key],cutaway,explode:0,sub:'all'}));
 const ui=K.ui({cameraPadding:.82,title:t(...["WINCHESTER 1887 — TERMİNATÖR 2", "WINCHESTER 1887 — TERMINATOR 2"]),sub:t(...["1888 üretimli film nesnesi • geniş halka • kısa ahşap kabza", "1888-made film object • wide loop • short wooden grip"]),subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#ae955d'})),camLabels:Object.fromEntries(Object.entries({"iso": ["Tam Sergi", "Full exhibit"], "front": ["Sağ Profil", "Right profile"], "breech": ["Sol Profil", "Left profile"], "engine": ["Kol ve Kabza", "Loop and grip"], "suspension": ["Çift Tüp", "Twin tubes"], "top": ["Üst", "Top"]}).map(([k,v])=>[k,t(...v)])),sliders:[[["Ahşap Yüzeyleri Ayır (sergi)", "Separate wood surfaces (exhibit)"], 0, 100, "%"], [["Dış Kol İnceleme Açısı", "Exterior lever inspection angle"], 0, 55, "°"], [["Sergi Açısı", "Exhibit angle"], -90, 90, "°"]].map(([labels,min,max,unit])=>({label:t(...labels),min,max,step:1,fmt:v=>Math.round(v)+unit})),buttons:{terrain:t('Sergi Mesnedini Göster / Gizle','Show / hide exhibit mount'),sweep:t('Sergiyi Sıfırla','Reset exhibit')},telemetryTag:t(...["TERMİNATÖR 2 • 1991", "TERMINATOR 2 • 1991"]),statLabels:[["AHŞAP AYRIMI", "WOOD SEPARATION"], ["KOL AÇISI", "LEVER ANGLE"], ["AÇI", "ANGLE"], ["REFERANS BOYU", "REFERENCE LENGTH"]].map(v=>t(...v))});
 sync();
 return {root,parts,ui,camPresets,tourSteps,defaultPart:parts.frame,firePart:parts.gripFront,
 update(dt){if(typeof animate==='function')animate(dt);},onFire(){state.a=state.a>0?0:100;sync();return {ok:true};},
 fireButtonLabel:()=>t(...(state.a?["AHŞABI BİRLEŞTİR", "REASSEMBLE WOOD"]:["AHŞAP YÜZEYLERİ AYIR", "SEPARATE WOOD SURFACES"])),mobileFireButtonLabel:()=>t(...(state.a?["AHŞABI BİRLEŞTİR", "REASSEMBLE WOOD"]:["AHŞAP YÜZEYLERİ AYIR", "SEPARATE WOOD SURFACES"])),
 onSlider(i,v){if(!Number.isFinite(v))return {};if(i>=0&&i<3)state[['a','b','c'][i]]=T.MathUtils.clamp(v,ui.sliders[i].min,ui.sliders[i].max);sync();return {};},
 onButton(name){if(name==='terrain'){state.support=!state.support;sync();}else if(name==='sweep')reset();return {};},buttonActive:name=>name==='terrain'&&state.support,
 getSliderValues:()=>[state.a,state.b,state.c],getStats:()=>[state.a+' <span>%</span>',state.b+' <span>°</span>',state.c+' <span>°</span>',"69 <span>cm</span>"],getStatus:()=>({text:t(...["SABİT MÜZE SERGİSİ • SİNEMA BAĞLANTISI", "STATIC MUSEUM EXHIBIT • CINEMA CONNECTION"]),color:'#ae955d'}),applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
};})();
