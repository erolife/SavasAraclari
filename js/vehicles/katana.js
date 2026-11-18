/* Museum reconstruction. Measurements describe the source object; scene units are enlarged.
 * Separation controls are interpretive exhibit motions. */
(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.katana=function(ctx){
 const K=window.MuseumModelKit(ctx,'katana');
 const {T,root,parts,mesh,box,cyl,ring,pipe,beam,instances}=K;
 const english=window.MuseumPreferences?.language==='en';const t=(tr,en)=>english?en:tr;
 const state={a:0,b:0,c:0,support:true};const counts={};let n=0;
 function mat(color,metalness=.3,roughness=.6,paint=false){const m=new T.MeshStandardMaterial({color,metalness,roughness});m.userData.paint=paint;return m;}
 function group(parent,pos=[0,0,0]){const g=new T.Group();g.position.set(...pos);parent.add(g);return g;}
 const exhibit=group(root);
 function part(id,tr,en,ftr,fen,descTr,descEn,exp=[0,.3,0],outer=false,parent=exhibit){const sub=t(ftr,fen);counts[sub]=(counts[sub]||0)+1;const p=K.part(id,++n+'. '+t(tr,en),sub,[0,0,0],exp,t(descTr,descEn),outer,parent);Object.assign(p.userData,{material:t("Çelik, ahşap, gümüş ve bakır alaşımı donanım","Steel, wood, silver and copper-alloy fittings"),weight:t('Parça kütlesi hesaplanmıyor','Part mass is not calculated'),spec:t("Met 91.2.58 • 62,1 cm kesici uzunluk","Met 91.2.58 • 62.1 cm cutting edge")});return p;}
 function ellipsoid(p,pos,scale,m){const o=mesh(p,new T.SphereGeometry(1,24,16),m,pos);o.scale.set(...scale);return o;}
 function plate(p,points,depth,m,pos=[0,0,0]){const s=new T.Shape();s.moveTo(...points[0]);points.slice(1).forEach(v=>s.lineTo(...v));s.closePath();return mesh(p,new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.006,bevelThickness:.004,bevelSegments:1}),m,pos);}

 const steel=mat(0xa6adb0,.88,.28),edge=mat(0xd4dadb,.92,.20),dark=mat(0x424746,.77,.5),silver=mat(0x8b9290,.82,.44,true),gold=mat(0xc3a459,.78,.32),wood=mat(0x43312a,.03,.85),corewood=mat(0xa48a60,.02,.88),cord=mat(0x726653,.02,.95);
 const mount=part('support','Kake Sergi Sehpası','Kake display stand','Sergi','Exhibit','İki ayrı seviyeli ahşap destek modern sergi düzenidir.','The two-level wooden stand is a modern display arrangement.',[0,-.12,0]);
 box(mount,[6,.10,1.55],[.1,.05,.2],wood);
 for(const x of [-1.25,1.8]){
  box(mount,[.25,.13,1.3],[x,.15,.2],wood);box(mount,[.12,1.86,.15],[x,1.10,.17],wood);
  for(const y of [1.12,1.99]){pipe(mount,[[x-.22,y+.18,.17],[x-.19,y,.17],[x,y-.04,.17],[x+.19,y,.17],[x+.22,y+.18,.17]],.043,wood);}
 }
 const blade=part('blade','Kavisli Çelik Bıçak','Curved steel blade','Çelik','Steel','Met 91.2.58: kesici uzunluk 62,1 cm, eğrilik 1,5 cm. Çelik yüzey ve ısıl işlem çizgisi görsel yorumdur.','Met 91.2.58: cutting edge 62.1 cm, curvature 1.5 cm. Steel finish and heat-treatment line are interpreted.',[0,.6,0]);
 const bladeOrigin=[-.75,2,0];
 // Four longitudinal surfaces form the spine, shinogi ridge and thin cutting edge.
 function bladeGeometry(start=0,end=1){const vs=[],idx=[],steps=96;for(let i=0;i<=steps;i++){
  const u=start+(end-start)*i/steps,x=-.75+3.726*u,cy=2+.09*u*u;
  const taper=u<.86?1-.18*u:Math.max(.012,(1-u)/.14*.85);
  const w=.17*taper,th=.026*taper;
  vs.push(x,cy-w*.48,0,x,cy+w*.18,th,x,cy+w*.52,0,x,cy+w*.18,-th);
 }for(let i=0;i<steps;i++)for(let j=0;j<4;j++){const a=i*4+j,b=i*4+(j+1)%4;idx.push(a,b,a+4,b,b+4,a+4);}idx.push(0,2,1,0,3,2);const q=steps*4;idx.push(q,q+1,q+2,q,q+2,q+3);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vs,3));g.setIndex(idx);g.computeVertexNormals();return g;}
 mesh(blade,bladeGeometry(),steel);
 const hamon=part('hamon','Hamon ve Parlak Ağız','Hamon and polished edge','Çelik','Steel','Dalgalı hat ısıl işlem sınırını görselleştirir; eserin gerçek sertlik haritası değildir.','The undulating line illustrates a heat-treatment boundary, not a measured hardness map.',[0,.6,.12]);
 for(const side of [-1,1]){const pts=[];for(let i=0;i<94;i++){const u=i/96,w=.17*(u<.86?1-.18*u:(1-u)/.14*.85);pts.push([-.75+3.726*u,2+.09*u*u-w*.20+.008*Math.sin(u*95),side*.015]);}pipe(hamon,pts,.004,edge);}
 const tip=part('tip','Kissaki Uç ve Yokote','Kissaki tip and yokote','Çelik','Steel','Uç yüzeyi ve enine geçiş çizgisi bıçak geometrisini tamamlar.','The tip face and transverse transition complete the blade geometry.',[.1,.45,.1]);
 pipe(tip,[[2.45,2.03,-.021],[2.45,2.15,0],[2.45,2.03,.021]],.003,edge);
 const tang=part('tang','Nakago — Sap İçindeki Çelik','Nakago — tang within the grip','Sap ve Donanım','Grip and fittings','Sap içindeki uzantı yaklaşık biçimlidir. Kaynakta sap dâhil bıçak 83 cm olarak kaydedilir.','The hidden tang is an approximate reconstruction. The source lists 83 cm for the blade including tang.',[-.4,.25,0]);
 plate(tang,[[-2,1.97],[-.76,1.94],[-.76,2.06],[-1.98,2.05]],.035,dark,[0,0,-.017]);
 const habaki=part('habaki','Habaki — Bıçak Bileziği','Habaki — blade collar','Sap ve Donanım','Grip and fittings','Bıçağın tabanını çevreleyen bilezik ve bitişik rondelalar.','The collar surrounding the blade base and adjacent washers.',[-.25,.25,.25]);
 box(habaki,[.16,.21,.075],[-.77,2,0],gold);
 const guard=part('tsuba','Tsuba — El Siperi','Tsuba — hand guard','Sap ve Donanım','Grip and fittings','İnce oval siperin kenarı ve yüzey bezemeleri sadeleştirilmiştir.','The rim and ornament of the thin oval guard are simplified.',[-.5,.2,0]);
 const guardPivot=group(guard,[-.92,2,0]);
 const oval=cyl(guardPivot,.23,.055,[0,0,0],dark,'x');oval.scale.z=.72;
 const rim=ring(guardPivot,.218,[0,0,0],silver,.013,[0,Math.PI/2,0]);rim.scale.y=1.05;rim.scale.x=.75;
 for(const x of [-.047,.047]){const w=cyl(guardPivot,.151,.017,[x,0,0],gold,'x');w.scale.z=.69;}
 const grip=part('grip','Bambu Biçimli Gümüş Sap','Bamboo-shaped silver grip','Sap ve Donanım','Grip and fittings','Bu seçilmiş eserin sapı gümüş donanımlıdır; yaygın ipek örgülü sapın kopyası değildir.','This selected object has silver grip fittings, rather than the familiar silk-wrapped grip.',[-.7,.2,.25],true);
 const gripPivot=group(grip);
 const h=cyl(gripPivot,.13,1.13,[-1.55,2,0],silver,'x');h.scale.z=.63;
 for(const x of [-2.10,-1.95,-1.61,-1.24,-1.03]){const r=cyl(gripPivot,.137,.036,[x,2,0],dark,'x');r.scale.z=.65;ring(gripPivot,.133,[x,2,0],silver,.009,[0,Math.PI/2,0]).scale.x=.64;}
 const cap=part('kashira','Kashira — Uç Donanımı','Kashira — pommel fitting','Sap ve Donanım','Grip and fittings','Sapın kapalı ucundaki metal başlık ve askı bağı.','The metal end cap and suspension cord at the closed grip end.',[-.75,.1,0]);
 const capPivot=group(cap);
 ellipsoid(capPivot,[-2.12,2,0],[.065,.139,.09],dark);
 pipe(capPivot,[[-2.13,1.94,.06],[-2.19,1.64,.08],[-2.13,1.43,.11],[-2.07,1.65,.06],[-2.13,1.94,.06]],.012,cord);
 const peg=part('mekugi','Sap Sabitleme Pimi','Grip retaining peg','Sap ve Donanım','Grip and fittings','Pimin yeri ve iç bağlantısı görsel açıklama için yaklaşık konumlandırılmıştır.','The peg and its hidden attachment are positioned approximately for explanation.',[-.2,.3,.4]);
 cyl(peg,.025,.21,[-1.16,2,0],gold,'z');
 // The scabbard is shown separately; no drawing or cutting motion is simulated.
 const saya=part('saya','Saya — Gümüş Kın','Saya — silver scabbard','Kın','Scabbard','Bıçakla aynı kavisi izleyen kapalı kın, bu sergide ayrı seviyede gösterilir.','The closed curved scabbard is displayed on a separate level.',[0,.1,.5],true);
 const sayaPivot=group(saya);
 function sheathHalf(parent,side,m){const v=[],ix=[];const N=80,M=16;for(let i=0;i<=N;i++){const u=i/N,x=-.83+3.92*u,cy=1.13+.12*u*u;const taper=1-.30*u;for(let j=0;j<=M;j++){const a=(j/M*Math.PI)+(side<0?Math.PI:0);v.push(x,cy+Math.cos(a)*.135*taper,.31+Math.sin(a)*.095*taper);}}for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*(M+1)+j;ix.push(a,a+1,a+M+1,a+1,a+M+2,a+M+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();const mm=m.clone();mm.side=T.DoubleSide;return mesh(parent,g,mm);}
 sheathHalf(sayaPivot,-1,silver);
 const face=part('sayaFace','Ayrılabilir Kın Yüzeyi','Removable exhibit — scabbard face','Kın','Scabbard','Yüzeyin ayrılması yalnızca ahşap iç yapıyı incelemek içindir.','The surface separates only to reveal the interpreted wooden core.',[0,.25,.7],true);
 const facePivot=group(face);sheathHalf(facePivot,1,silver);
 const lining=part('lining','Kın Ahşabı ve Ağız','Scabbard wood and throat','Kın','Scabbard','Ahşap çekirdek metal kılıfın altında yorumlanır; kesit kalınlıkları ölçülmüş değildir.','The wood beneath the metal is interpreted; section thicknesses are not measured.',[0,-.1,.1]);
 pipe(lining,[[-.83,1.13,.31],[.1,1.137,.31],[1.2,1.16,.31],[2.3,1.21,.31],[3.08,1.25,.31]],.049,corewood);
 const mouth=part('koiguchi','Koiguchi — Kın Ağzı','Koiguchi — scabbard mouth','Kın','Scabbard','Açık ağızda gümüş çerçeve ile ahşap çekirdeği karşılaştır.','Compare the silver frame and wooden lining at the open throat.',[-.2,.15,.3]);
 const mr=ring(mouth,.13,[-.83,1.13,.31],dark,.015,[0,Math.PI/2,0]);mr.scale.x=.72;
 const end=part('kojiri','Kojiri — Kın Ucu','Kojiri — scabbard tip','Kın','Scabbard','Yuvarlatılmış uç donanımı dış kabuğu kapatır.','The rounded tip fitting closes the outer shell.',[.3,.1,.2]);
 ellipsoid(end,[3.08,1.25,.31],[.043,.094,.068],dark);
 const fittings=part('bands','Kın Bilezikleri ve Askılar','Scabbard bands and hangers','Kın','Scabbard','Müze fotoğrafındaki iki askı ve tekrarlanan metal bilezikler.','Two hangers and repeated metal bands follow the museum photograph.',[0,.3,.3]);
 for(const x of [-.62,.05,.79,2.13,2.81]){const y=1.13+.12*((x+.83)/3.92)**2;const r=ring(fittings,.13*(1-.30*(x+.83)/3.92),[x,y,.31],dark,.018,[0,Math.PI/2,0]);r.scale.x=.73;if(x===.05||x===.79){box(fittings,[.09,.19,.055],[x,y+.19,.31],silver);cyl(fittings,.025,.075,[x,y+.28,.31],dark,'z');}}
 const waves=part('waves','Gümüş Dalga Bezemesi','Silver wave ornament','Bezeme','Ornament','Dalga kıvrımları fotoğraftan sadeleştirilmiştir. İnce gravür ve yazı kopyalanmamıştır.','Wave scrolls are simplified from the photograph. Fine engraving and inscriptions are not copied.',[0,.2,.65],false,facePivot);
 const waveTransforms=[];for(let i=0;i<34;i++){const x=-.72+i*.108,y=1.13+.12*((x+.83)/3.92)**2;waveTransforms.push({pos:[x,y+.015*Math.sin(i*.8),.395-.022*(x+.83)/3.92],rot:[0,0,i*.55],scale:[1,.46,1]});}
 instances(waves,new T.TorusGeometry(.055,.004,5,16,Math.PI*1.6),dark,waveTransforms);
 const fish=part('fish','Altın ve Koyu Metal Balıklar','Gold and dark-metal fish','Bezeme','Ornament','Su canlıları, yapraklar ve dalgalar gümüş donanımın temasını oluşturur.','Fish, aquatic plants and waves form the theme of the silver mounting.',[0,.25,.8],false,facePivot);
 function fishShape(parent,x,y,z,s,m){const body=ellipsoid(parent,[x,y,z],[.17*s,.052*s,.013],m);plate(parent,[[x-.14*s,y],[x-.23*s,y+.06*s],[x-.23*s,y-.05*s]],.012,m,[0,0,z]);ellipsoid(parent,[x+.12*s,y+.014*s,z+.013],[.009,.009,.007],dark);const scales=[];for(let row=-1;row<=1;row++)for(let i=0;i<7;i++)scales.push({pos:[x-.10*s+i*.029*s,y+row*.023*s,z+.014],scale:[s,s,1]});instances(parent,new T.TorusGeometry(.015,.0025,4,10,Math.PI),dark,scales);return body;}
 fishShape(fish,1.5,1.16,.402,1.2,gold);fishShape(fish,.35,1.145,.402,.8,dark);
 const gripDecor=part('gripDecor','Sap Balığı ve Kenarları','Grip fish and edging','Bezeme','Ornament','Sap donanımındaki küçük balık motifi; yaklaşık kabartma.','The small fish motif on the grip is interpreted in low relief.',[-.7,.25,.4],false,gripPivot);
 fishShape(gripDecor,-1.56,2,.091,.72,gold);
 const leaves=part('leaves','Su Bitkileri ve Kamışlar','Aquatic plants and reeds','Bezeme','Ornament','Altın renkli küçük yapraklar ve kıvrık bitki hatları.','Small gilt-coloured leaves and curved plant lines.',[0,.3,.8],false,facePivot);
 for(const x of [-.4,1,2.35]){pipe(leaves,[[x-.1,1.07,.404],[x,1.13,.409],[x+.1,1.19,.403]],.005,gold);for(let i=0;i<3;i++)ellipsoid(leaves,[x-.05+i*.06,1.1+i*.035,.411],[.029,.013,.006],gold);}
 function sync(){exhibit.rotation.y=state.c*Math.PI/180;const a=state.a/100;gripPivot.position.x=-a*.45;capPivot.position.x=-a*.45;guardPivot.position.x=-.92-a*.22;facePivot.position.z=state.b/100*.5;mount.visible=state.support;}

 function reset(){Object.assign(state,{a:0,b:0,c:0,support:true});sync();}
 const camPresets={"iso": {"pos": [3.8, 3.2, 7.5], "look": [0.4, 1.25, 0.1]}, "front": {"pos": [0.4, 2, 8], "look": [0.4, 1.5, 0]}, "breech": {"pos": [0.3, 3, -7], "look": [0.4, 1.5, 0]}, "engine": {"pos": [-1.35, 2.65, 2.5], "look": [-1.35, 1.92, 0]}, "suspension": {"pos": [1.4, 1.8, 2.7], "look": [1.3, 1.17, 0.3]}, "top": {"pos": [0.4, 8, 0.01], "look": [0.4, 1.3, 0]}};
 const tourSteps=[[["İki Ayrı Tarih", "Two separate dates"], ["17. yüzyıl bıçak, 19. yüzyıl gümüş donanımla birleşir. Bu eser tüm samuray kılıçlarının tek örneği değildir.", "A seventeenth-century blade meets nineteenth-century silver fittings. This object is one example within a diverse tradition."], "iso", "blade", false], [["Kavis ve Hamon", "Curvature and hamon"], ["Tek ağızlı çelik, sırt, yüzey sırtı ve ince kesici ağız olarak modellenmiştir. Dalgalı hat temsili ısıl işlem sınırıdır.", "The single-edged steel has a spine, ridge and thin cutting edge. The wavy line interprets the heat-treatment boundary."], "front", "hamon", false], [["Bambu ve Gümüş", "Bamboo and silver"], ["Sap, ipek örgü yerine bambuyu çağrıştıran metal bileziklerle çevrilidir. Sap ayrımı müze hareketidir.", "The grip has bamboo-like metal fittings rather than silk wrapping. Grip separation is an exhibit motion."], "engine", "grip", false], [["Tsuba ve Habaki", "Tsuba and habaki"], ["Oval siper, ince rondelalar ve bıçak bileziği arasındaki farkı gör.", "Distinguish the oval guard, thin washers and blade collar."], "engine", "tsuba", false], [["Kın ve Ahşap Çekirdek", "Scabbard and wooden core"], ["Gümüş kın ayrı seviyede sergilenir. Kesit ve yüzey ayrımı, yaklaşık ahşap iç yapıyı gösterir.", "The silver scabbard is on a separate level. Cutaway and face separation reveal an approximate wooden core."], "suspension", "lining", true], [["Balıklar ve Dalgalar", "Fish and waves"], ["Altın renkli balıkları, su bitkilerini ve iki askıyı bul. İnce gravürler sadeleştirilmiştir.", "Find the gilt-coloured fish, aquatic plants and two hangers. Fine engraving is simplified."], "suspension", "fish", false]].map(([title,desc,cam,key,cutaway])=>({title:t(...title),desc:t(...desc),cam,part:parts[key],cutaway,explode:0,sub:'all'}));
 const ui=K.ui({cameraPadding:.82,title:t(...["KATANA — ÇELİK VE GÜMÜŞ", "KATANA — STEEL AND SILVER"]),sub:t(...["17. yüzyıl bıçak • 19. yüzyıl donanım • büyütülmüş sergi", "17th-century blade • 19th-century mounting • enlarged exhibit"]),subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#ae955d'})),camLabels:Object.fromEntries(Object.entries({"iso": ["Tam Sergi", "Full exhibit"], "front": ["Profil", "Profile"], "breech": ["Arka Yüz", "Reverse"], "engine": ["Sap ve Tsuba", "Grip and tsuba"], "suspension": ["Gümüş Kın", "Silver scabbard"], "top": ["Üst", "Top"]}).map(([k,v])=>[k,t(...v)])),sliders:[[["Sap Donanımını Ayır (sergi)", "Separate grip fittings (exhibit)"], 0, 100, "%"], [["Kın Yüzeyini Ayır (sergi)", "Separate scabbard face (exhibit)"], 0, 100, "%"], [["Sergi Açısı", "Exhibit angle"], -90, 90, "°"]].map(([labels,min,max,unit])=>({label:t(...labels),min,max,step:1,fmt:v=>Math.round(v)+unit})),buttons:{terrain:t('Sergi Mesnedini Göster / Gizle','Show / hide exhibit mount'),sweep:t('Sergiyi Sıfırla','Reset exhibit')},telemetryTag:t(...["JAPONYA • EDO DÖNEMİ", "JAPAN • EDO PERIOD"]),statLabels:[["SAP AYRIMI", "GRIP SEPARATION"], ["KIN YÜZEYİ", "SCABBARD FACE"], ["AÇI", "ANGLE"], ["KESİCİ UZUNLUK", "CUTTING EDGE"]].map(v=>t(...v))});
 sync();
 return {root,parts,ui,camPresets,tourSteps,defaultPart:parts.blade,firePart:parts.grip,
 update(dt){if(typeof animate==='function')animate(dt);},onFire(){state.a=state.a>0?0:100;sync();return {ok:true};},
 fireButtonLabel:()=>t(...(state.a?["DONANIMI BİRLEŞTİR", "REASSEMBLE FITTINGS"]:["SAP DONANIMINI AYIR", "SEPARATE GRIP FITTINGS"])),mobileFireButtonLabel:()=>t(...(state.a?["DONANIMI BİRLEŞTİR", "REASSEMBLE FITTINGS"]:["SAP DONANIMINI AYIR", "SEPARATE GRIP FITTINGS"])),
 onSlider(i,v){if(!Number.isFinite(v))return {};if(i>=0&&i<3)state[['a','b','c'][i]]=T.MathUtils.clamp(v,ui.sliders[i].min,ui.sliders[i].max);sync();return {};},
 onButton(name){if(name==='terrain'){state.support=!state.support;sync();}else if(name==='sweep')reset();return {};},buttonActive:name=>name==='terrain'&&state.support,
 getSliderValues:()=>[state.a,state.b,state.c],getStats:()=>[state.a+' <span>%</span>',state.b+' <span>%</span>',state.c+' <span>°</span>',"62.1 <span>cm</span>"],getStatus:()=>({text:t(...["ÇELİK • GÜMÜŞ • MÜZE İNCELEMESİ", "STEEL • SILVER • MUSEUM INSPECTION"]),color:'#ae955d'}),applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
};})();

