/* Museum reconstruction. Measurements describe the source object; scene units are enlarged.
 * Separation controls are interpretive exhibit motions. */
(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.chakar=function(ctx){
 const K=window.MuseumModelKit(ctx,'chakar');
 const {T,root,parts,mesh,box,cyl,ring,pipe,beam,instances}=K;
 const english=window.MuseumPreferences?.language==='en';const t=(tr,en)=>english?en:tr;
 const state={a:0,b:0,c:0,support:true};const counts={};let n=0;
 function mat(color,metalness=.3,roughness=.6,paint=false){const m=new T.MeshStandardMaterial({color,metalness,roughness});m.userData.paint=paint;return m;}
 function group(parent,pos=[0,0,0]){const g=new T.Group();g.position.set(...pos);parent.add(g);return g;}
 const exhibit=group(root);
 function part(id,tr,en,ftr,fen,descTr,descEn,exp=[0,.3,0],outer=false,parent=exhibit){const sub=t(ftr,fen);counts[sub]=(counts[sub]||0)+1;const p=K.part(id,++n+'. '+t(tr,en),sub,[0,0,0],exp,t(descTr,descEn),outer,parent);Object.assign(p.userData,{material:t("Çelik, altın ve gümüş kakma; çağdaş ahşap mesnet","Steel, gold and silver inlay; modern wooden mount"),weight:t('Parça kütlesi hesaplanmıyor','Part mass is not calculated'),spec:t("MMFA 2022.85 • çap 28,6 cm","MMFA 2022.85 • diameter 28.6 cm")});return p;}
 function ellipsoid(p,pos,scale,m){const o=mesh(p,new T.SphereGeometry(1,24,16),m,pos);o.scale.set(...scale);return o;}
 function plate(p,points,depth,m,pos=[0,0,0]){const s=new T.Shape();s.moveTo(...points[0]);points.slice(1).forEach(v=>s.lineTo(...v));s.closePath();return mesh(p,new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.006,bevelThickness:.004,bevelSegments:1}),m,pos);}

 const steel=mat(0x4d5351,.79,.48,true),silver=mat(0xb1b4a5,.84,.4),gold=mat(0xb8a263,.82,.37),wood=mat(0x3c302a,.03,.86),cloth=mat(0x4b5462,.02,.95);
 const support=part('support','Çağdaş Sergi Mesnedi','Modern exhibit mount','Sergi','Exhibit','İnce tutucular halkanın özgün parçası değildir.','The slender supports are not part of the historical object.',[0,-.15,0]);
 box(support,[3.9,.12,1.3],[0,.06,0],wood);box(support,[3.45,.035,1.05],[0,.138,0],cloth);
 for(const x of [-.78,.78]){cyl(support,.025,.85,[x,.56,-.055],silver);pipe(support,[[x,.95,-.055],[x,1.02,.02],[x,.98,.09]],.021,silver);}
 const turn=group(exhibit,[0,1.89,0]);
 function annulus(a,b){const vs=[],ix=[],N=64;const profile=[[1.27,-.010],[1.285,-.022],[1.39,-.016],[1.43,0],[1.39,.016],[1.285,.022],[1.27,.010]];for(let i=0;i<=N;i++){const ang=a+(b-a)*i/N;for(const[r,z]of profile)vs.push(Math.cos(ang)*r,Math.sin(ang)*r,z);}for(let i=0;i<N;i++)for(let j=0;j<profile.length;j++){const q=i*profile.length+j,k=i*profile.length+(j+1)%profile.length;ix.push(q,k,q+profile.length,k,k+profile.length,q+profile.length);}for(const end of [0,N]){const off=end*profile.length;for(let j=1;j<profile.length-1;j++)ix.push(off,off+j,off+j+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vs,3));g.setIndex(ix);g.computeVertexNormals();return g;}
 const sectors=[];
 for(let q=0;q<4;q++){
  const s=group(turn),start=q*Math.PI/2+.0004,stop=(q+1)*Math.PI/2-.0004;sectors.push(s);
  const body=part('sector'+q,['Üst Sağ Çelik','Üst Sol Çelik','Alt Sol Çelik','Alt Sağ Çelik'][q],['Upper right steel','Upper left steel','Lower left steel','Lower right steel'][q],'Çelik Halka','Steel ring','Düz halka kesiti dışa doğru incelir. Dörde ayrılma özgün bir eklem değil, müze incelemesidir.','The flat annular section thins toward the outside. Four-way separation is a museum device, not an original joint.',[Math.cos((start+stop)/2)*.4,Math.sin((start+stop)/2)*.4,0],true,s);
  mesh(body,annulus(start,stop),steel);
  const rim=part('rim'+q,'İç ve Dış Gümüş Hat '+(q+1),'Inner and outer silver line '+(q+1),'Kakma ve Bezeme','Inlay and ornament','İnce gümüş renkli sınırlar altın bezemenin iki yanını izler.','Fine silver-coloured borders frame the gilt ornament.',[0,.2,.2],false,s);
  for(const r of [1.284,1.405])for(const side of [-1,1]){const pts=[];for(let i=0;i<=36;i++){const a=start+(stop-start)*i/36;pts.push([r*Math.cos(a),r*Math.sin(a),side*.019]);}pipe(rim,pts,.0035,silver);}
  const motif=part('ornament'+q,'Altın Renkli Kıvrım ve Üçgenler '+(q+1),'Gilt scrolls and triangles '+(q+1),'Kakma ve Bezeme','Inlay and ornament','Kaynakta altın/gümüş kakma vardır. Buradaki geometrik kıvrımlar sadeleştirilmiştir; yazıt taklidi değildir.','The source has gold/silver inlay. These geometric scrolls are simplified; they do not imitate inscriptions.',[0,.2,.25],false,s);
  const spirals=[],beads=[];
  for(let j=0;j<6;j++){
   const a=start+(j+.5)*(stop-start)/6;
   for(const side of [-1,1]){
    const pos=[1.345*Math.cos(a),1.345*Math.sin(a),side*.023];
    spirals.push({pos,rot:[0,0,a],scale:[.68,1,1]});
    const pts=[[-.054,-.047],[.054,-.047],[0,.049],[-.054,-.047]].map(([dx,dy])=>[(1.345+dy)*Math.cos(a)-dx*Math.sin(a),(1.345+dy)*Math.sin(a)+dx*Math.cos(a),side*.023]);pipe(motif,pts,.0033,gold);
    for(let k=0;k<5;k++){const aa=a+(k-2)*.023;beads.push({pos:[1.385*Math.cos(aa),1.385*Math.sin(aa),side*.022]});}
   }
  }
  instances(motif,new T.TorusGeometry(.033,.003,5,18,Math.PI*1.65),gold,spirals);
  instances(motif,new T.SphereGeometry(.0045,6,4),gold,beads);
  const hatch=part('hatch'+q,'Çizgisel Dolgu '+(q+1),'Linear infill '+(q+1),'Kakma ve Bezeme','Inlay and ornament','Küçük eş aralıklı çizgiler, kakmanın yoğunluğunu yaklaşık olarak gösterir.','Small evenly spaced strokes approximate the density of the inlay.',[0,.2,.3],false,s);
  const lines=[];for(let j=0;j<45;j++){const a=start+(j+.5)*(stop-start)/45;for(const side of [-1,1])lines.push({pos:[1.302*Math.cos(a),1.302*Math.sin(a),side*.023],rot:[0,0,a],scale:[1,1,1]});}
  instances(hatch,new T.BoxGeometry(.006,.019,.003),gold,lines);
 }
 const section=part('profile','Büyütülmüş Kesit Örneği','Enlarged section sample','Kesit','Section','Yandaki kısa kesit, dışa incelmeyi abartılı ölçekte açıklar. Eserin kopmuş parçası değildir.','The short sample explains the thinning edge at an exaggerated scale. It is not a fragment of the object.',[.4,.25,0]);
 const inset=group(section,[-1.48,.40,.35]);
 plate(inset,[[-.30,0],[-.30,.13],[.27,.07],[.30,.065]],.16,steel);
 box(section,[.83,.035,.38],[-1.47,.355,.35],wood);
 const core=part('inlayDetail','Kakma Ayrıntı Örneği','Inlay detail sample','Kesit','Section','Kesit yanındaki altın ve gümüş hatlar malzeme ilişkisini açıklar; üretim ölçüsü değildir.','The gold and silver lines beside the sample explain the materials, not fabrication dimensions.',[.3,.2,.2]);
 pipe(core,[[-1.74,.54,.45],[-1.55,.51,.45],[-1.26,.48,.45]],.008,gold);pipe(core,[[-1.74,.52,.45],[-1.56,.49,.45],[-1.26,.46,.45]],.004,silver);
 function sync(){turn.rotation.set(state.b*Math.PI/180,state.c*Math.PI/180,0);sectors.forEach((g,i)=>{const a=(i+.5)*Math.PI/2,d=state.a/100*.24;g.position.set(Math.cos(a)*d,Math.sin(a)*d,0);});support.visible=state.support;}

 function reset(){Object.assign(state,{a:0,b:0,c:0,support:true});sync();}
 const camPresets={"iso": {"pos": [3.8, 3.2, 7], "look": [0, 1.7, 0]}, "front": {"pos": [0, 1.9, 7], "look": [0, 1.8, 0]}, "breech": {"pos": [0, 2, -7], "look": [0, 1.8, 0]}, "engine": {"pos": [1.5, 2.8, 2.2], "look": [0.7, 2.75, 0]}, "suspension": {"pos": [-1.4, 0.9, 2.3], "look": [-1.4, 0.45, 0.35]}, "top": {"pos": [0.01, 7, 1], "look": [0, 1.6, 0]}};
 const tourSteps=[[["Bir Kılıç Değil: Halka", "A ring rather than a sword"], ["Pencap kökenli chakar, ince ve düz çelik halkadır. Müze kaydı bu örneği günümüz Pakistan’ındaki Sialkot’a bağlar.", "The Punjabi chakar is a thin, flat steel ring. The museum attributes this example to Sialkot in present-day Pakistan."], "iso", "sector0", false], [["Kütle Yerine İnce Kesit", "A thin section"], ["Yuvarlak bir boru değildir: geniş yüzey dış kenara doğru incelir.", "This is not a round tube: a broad flat face thins toward the outer edge."], "suspension", "profile", false], [["Altın ve Gümüş", "Gold and silver"], ["İki metalin kakması koyu çelik üzerinde görünür. Motifler sadeleştirilmiştir; kaynak yazıtları kopyalanmaz.", "Two inlay metals contrast with dark steel. Motifs are simplified and the original inscriptions are not copied."], "engine", "ornament0", false], [["Dörde Ayırma", "Four-way separation"], ["Bu sergide halka dört parçaya ayrılabilir. Tarihsel eserde bu hareketli eklemler bulunmaz.", "This exhibit can separate into four sections. These moving joints do not exist in the historical object."], "front", "sector1", false], [["İki Yüzün Devamı", "Both faces"], ["Arka yüzde de sınır çizgilerini ve kıvrımlı geometrik dolguları incele.", "Inspect the borders and scroll-like geometric infill on the reverse face."], "breech", "rim2", false], [["Silah ve Kimlik", "Weapon and identity"], ["Chakar, Sih savaşçı geleneğiyle ilişkilidir. Bu işlemeli 19. yüzyıl örneği bezeme ve kimlik boyutunu da gösterir.", "Chakar are associated with Sikh martial traditions. This decorated nineteenth-century example also speaks to ornament and identity."], "iso", "inlayDetail", false]].map(([title,desc,cam,key,cutaway])=>({title:t(...title),desc:t(...desc),cam,part:parts[key],cutaway,explode:0,sub:'all'}));
 const ui=K.ui({cameraPadding:.82,title:t(...["CHAKAR — İŞLEMELİ ÇELİK HALKA", "CHAKAR — INLAID STEEL RING"]),sub:t(...["Pencap / Sialkot • 19. yüzyıl ortası • büyütülmüş sergi", "Punjab / Sialkot • Mid-19th century • enlarged exhibit"]),subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#ae955d'})),camLabels:Object.fromEntries(Object.entries({"iso": ["Tam Sergi", "Full exhibit"], "front": ["Ön Yüz", "Obverse"], "breech": ["Arka Yüz", "Reverse"], "engine": ["Kakma", "Inlay"], "suspension": ["Kesit Örneği", "Section sample"], "top": ["İnce Kenar", "Thin edge"]}).map(([k,v])=>[k,t(...v)])),sliders:[[["Halkayı Ayır (sergi)", "Separate ring (exhibit)"], 0, 100, "%"], [["İnceleme Eğimi", "Inspection tilt"], 0, 60, "°"], [["Sergi Açısı", "Exhibit angle"], -90, 90, "°"]].map(([labels,min,max,unit])=>({label:t(...labels),min,max,step:1,fmt:v=>Math.round(v)+unit})),buttons:{terrain:t('Sergi Mesnedini Göster / Gizle','Show / hide exhibit mount'),sweep:t('Sergiyi Sıfırla','Reset exhibit')},telemetryTag:t(...["PENCAP • SİALKOT", "PUNJAB • SIALKOT"]),statLabels:[["AYRIM", "SEPARATION"], ["EĞİM", "TILT"], ["AÇI", "ANGLE"], ["KAYNAK ÇAPI", "SOURCE DIAMETER"]].map(v=>t(...v))});
 sync();
 return {root,parts,ui,camPresets,tourSteps,defaultPart:parts.sector0,firePart:parts.sector0,
 update(dt){if(typeof animate==='function')animate(dt);},onFire(){state.a=state.a>0?0:100;sync();return {ok:true};},
 fireButtonLabel:()=>t(...(state.a?["HALKAYI BİRLEŞTİR", "REASSEMBLE THE RING"]:["HALKA KESİTİNİ İNCELE", "EXPLORE THE RING SECTION"])),mobileFireButtonLabel:()=>t(...(state.a?["HALKAYI BİRLEŞTİR", "REASSEMBLE THE RING"]:["HALKA KESİTİNİ İNCELE", "EXPLORE THE RING SECTION"])),
 onSlider(i,v){if(!Number.isFinite(v))return {};if(i>=0&&i<3)state[['a','b','c'][i]]=T.MathUtils.clamp(v,ui.sliders[i].min,ui.sliders[i].max);sync();return {};},
 onButton(name){if(name==='terrain'){state.support=!state.support;sync();}else if(name==='sweep')reset();return {};},buttonActive:name=>name==='terrain'&&state.support,
 getSliderValues:()=>[state.a,state.b,state.c],getStats:()=>[state.a+' <span>%</span>',state.b+' <span>°</span>',state.c+' <span>°</span>',"28.6 <span>cm</span>"],getStatus:()=>({text:t(...["ÇELİK HALKA • ALTIN VE GÜMÜŞ KAKMA", "STEEL RING • GOLD AND SILVER INLAY"]),color:'#ae955d'}),applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
};})();
