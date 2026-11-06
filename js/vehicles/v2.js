(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.v2=function(ctx){
 const K=window.MuseumModelKit(ctx,'v2'),{T,root,parts,mats:M,part,mesh,box,cyl,ring,pipe,beam,instances,wheel,polygon}=K;
 const S={angle:0,spin:0,open:0,auto:false,time:0};
 const frame=part('frame','1. Meillerwagen Şasisi','Taşıyıcı',[0,0,0],[1,0,0],'Australian War Memorial koleksiyonundaki V-2 ve Meillerwagen birlikteliği esas alınmıştır. Taşıyıcı boyutları fotoğraf oranlarıyla yaklaşık.');
 for(const x of [-.95,.95])box(frame,[.20,.25,11.5],[x,.8,1.0],M.dark);for(let z=-4;z<=6;z+=1)box(frame,[2.1,.13,.13],[0,.85,z],M.dark);
 const tires=part('tires','2. Tekerlek Takımları','Taşıyıcı',[0,0,0],[1,0,0],'Çekilen taşıyıcının tekerlekleri, jantları, dingilleri ve lastik dişleri.');
 for(const z of [-3.5,5.7]){cyl(tires,.11,2.5,[0,.55,z],M.dark,'x');for(const side of [-1,1])wheel(tires,side*1.18,.55,z,.55,.28);}
 const supports=part('supports','3. Denge Ayakları','Taşıyıcı',[0,0,0],[0,0,1],'Sergileme görünümünde zemine basan dört vidalı destek ve geniş ayak tablaları.');
 for(const x of [-1.55,1.55])for(const z of [-3,4.8]){beam(supports,[x*.6,.85,z],[x,.85,z],.12);cyl(supports,.07,.75,[x,.48,z]);box(supports,[.55,.12,.55],[x,.06,z]);ring(supports,.17,[x,.9,z],M.steel,.025,[Math.PI/2,0,0]);}
 // Rear trunnion towers connect the lifting frame to the chassis.
 for(const x of [-1.05,1.05]){beam(frame,[x,.8,-4.5],[x,2,-4],.16);beam(frame,[x,.8,-2.8],[x,2,-4],.16);cyl(frame,.22,.25,[x,2,-4],M.steel,'x');}
 const lift=new T.Group();lift.position.set(0,2.0,-4.0);root.add(lift);
 const cradle=part('cradle','4. Kaldırma Kafesi','Taşıyıcı',[0,0,0],[1,0,0],'Roketin yanında uzanan kafes taşıyıcı; yatay ve dikey müze pozları arasında hareket eder.',false,lift);
 for(const x of [-1.05,1.05]){box(cradle,[.12,12,.12],[x,6,.9],M.dark);for(let y=.5;y<12;y+=1.4){beam(cradle,[x,y,.9],[x,y+1.1,1.1],.065);beam(cradle,[x,y,1.1],[x,y+1.1,.9],.065);}box(cradle,[.10,12,.10],[x,6,1.1],M.dark);}
 for(let y=.5;y<12;y+=1.4)beam(cradle,[-1.05,y,.9],[1.05,y,.9],.08);
 const bands=part('bands','5. Taşıma Kuşakları','Taşıyıcı',[0,0,0],[0,0,-1],'Kafese bağlı taşıma kuşakları. Kaldırma hareketi sergileme amaçlıdır; operasyon prosedürü değildir.',false,lift);
 for(const y of [2,6,10]){ring(bands,.91,[0,y,0],M.dark,.045,[Math.PI/2,0,0]);for(const x of [-.85,.85])beam(bands,[x,y,.25],[x,y,.9],.08);}
 const hydraulic=part('hydraulic','6. Kaldırma Silindirleri','Taşıyıcı',[0,0,0],[-1,0,0],'İki hareketli destek silindiri; uç noktaları taşıyıcıya bağlı kalır.');const cylinders=[],rods=[];
 for(const x of [-.70,.70]){cylinders.push(cyl(hydraulic,.11,1,[x,1,-2],M.dark));rods.push(cyl(hydraulic,.055,1,[x,1,-2],M.steel));}
 const fittings=part('fittings','7. Çeki Oku, Sandıklar ve Servis Donanımı','Taşıyıcı',[0,0,0],[0,0,1],'Çeki oku, hortumlar, saklama kutuları ve basamaklar.');
 beam(fittings,[-.95,.8,6.7],[0,.65,8.1],.12);beam(fittings,[.95,.8,6.7],[0,.65,8.1],.12);ring(fittings,.14,[0,.65,8.2],M.dark,.035,[Math.PI/2,0,0]);
 for(const x of [-.6,.6]){box(fittings,[.65,.45,1.0],[x,1.2,3.5]);pipe(fittings,[[x,1.3,3],[x,1.1,1.5],[x,1.0,-2.5]],.035,M.rubber);}
 for(let z=-1;z<4;z+=.6)box(fittings,[.4,.06,.3],[1.2,.9,z],M.steel);
 const rocket=new T.Group();lift.add(rocket);
 const lower=part('lower','8. Alt Dış Gövde','Gövde',[0,0,0],[0,0,1.8],'Yaklaşık 14 m uzunluk ve 1,65 m ana gövde çapıyla A4 dış formu. Panel ve bağlantı ayrıntıları müze görsellerinden yeniden kurulmuştur.',true,rocket);
 const upper=part('upper','9. Üst Dış Gövde','Gövde',[0,0,0],[0,0,-1.8],'Üst gövde ve konik geçişler. Siyah-beyaz görünüm ölçüm amaçlı deneysel kaplamalara gönderme yapar; tüm V-2’ler bu renkte değildi.',true,rocket);
 const nose=part('nose','10. Burun Dış Kabuğu','Gövde',[0,0,0],[0,2,0],'Burun yalnızca dış biçim olarak gösterilir. Harp başlığı iç yapısı modellenmez.',true,rocket);
 const profile=[[.48,.05],[.72,.4],[.82,1.1],[.825,3],[.825,8.6],[.77,10.5],[.62,11.7],[.35,12.8],[.0,14.0]];
 function skin(parent,from,to){for(let k=from;k<to;k++){const [r0,y0]=profile[k],[r1,y1]=profile[k+1];for(let q=0;q<4;q++){const geo=new T.CylinderGeometry(r1,r0,y1-y0,24,1,true,q*Math.PI/2,Math.PI/2);mesh(parent,geo,(q+k)%2?M.dark:M.white,[0,(y0+y1)/2,0]);}}}
 skin(lower,0,4);skin(upper,4,6);skin(nose,6,8);
 const seams=part('seams','11. Bölme Halkaları ve Servis Kapakları','Gövde',[0,0,0],[1,0,0],'Gövde çevresindeki birleşim halkaları, servis kapakları ve bağlantı başları.',false,rocket);
 for(const [r,y] of [[.82,1.1],[.825,3],[.825,6.2],[.825,8.6],[.77,10.5],[.62,11.7]]){
  ring(seams,r+.008,[0,y,0],M.steel,.012,[Math.PI/2,0,0]);const bolts=Array.from({length:36},(_,i)=>({pos:[(r+.012)*Math.sin(i*Math.PI/18),y,(r+.012)*Math.cos(i*Math.PI/18)]}));instances(seams,new T.SphereGeometry(.018,6,4),M.steel,bolts);
 }
 for(let i=0;i<4;i++){const a=i*Math.PI/2;box(seams,[.32,.48,.022],[Math.sin(a)*.83,2.4,Math.cos(a)*.83],M.dark,[0,a,0]);}
 const fins=part('fins','12. Dört Kuyruk Kanadı','Gövde',[0,0,0],[1,0,1],'Dört büyük aerodinamik kuyruk kanadı, kök kaplamaları ve dış kumanda yüzeyleri.',false,rocket);
 const finMovers=[];
 for(let i=0;i<4;i++) {const g=new T.Group();g.rotation.y=i*Math.PI/2;fins.add(g);const fin=polygon(g,[[.65,.12],[1.75,.12],[1.75,.85],[.82,3.4],[.65,2.6]],.055,i%2?M.white:M.dark);fin.position.z=-.0275;
  beam(g,[.77,.2,0],[.77,2.8,0],.09,M.steel);const flap=box(g,[.6,.32,.07],[1.43,.32,0],M.steel);finMovers.push(flap);
 }
 const tanks=part('tanks','13. İç Tank Hacimleri','İç Bölmeler',[0,0,0],[0,0,1],'X-Ray’de iki ana tankın hacmi görünür. Ölçekler ve iç bağlantılar görsel temsildir; dolum veya karışım hesabı yoktur.',false,rocket);
 for(const [y,h,mat] of [[4.4,3.6,M.steel],[8.0,3.2,M.brass]]){cyl(tanks,.68,h,[0,y,0],mat);mesh(tanks,new T.SphereGeometry(.68,32,16),mat,[0,y+h/2,0]).scale.y=.25;mesh(tanks,new T.SphereGeometry(.68,32,16),mat,[0,y-h/2,0]).scale.y=.25;}
 const frames=part('frames','14. İç Taşıyıcı Halkalar','İç Bölmeler',[0,0,0],[-1,0,0],'Tankları ve ekipman bölmelerini taşıyan halka ve boyuna destekler.',false,rocket);
 for(const y of [1.2,2.4,6.3,10.0,11.0])ring(frames,.73,[0,y,0],M.dark,.035,[Math.PI/2,0,0]);for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])beam(frames,[.72*Math.sin(a),1.2,.72*Math.cos(a)],[.72*Math.sin(a),11,.72*Math.cos(a)],.035);
 const instruments=part('instruments','15. Alet Bölmesi','İç Bölmeler',[0,0,0],[0,1.5,0],'Tarihsel alet bölmesinin dış kutuları ve montaj rafı. Yönlendirme algoritması veya hedefleme simülasyonu yoktur.',false,rocket);
 cyl(instruments,.68,.10,[0,10.65,0],M.dark);for(const x of [-.3,.3])for(const z of [-.25,.25])box(instruments,[.30,.38,.30],[x,10.9,z],M.steel);ring(instruments,.23,[0,11.3,0],M.brass,.025,[Math.PI/2,0,0]);
 const motor=part('motor','16. Motor Bölmesi Dış Donanımı','İç Bölmeler',[0,0,0],[0,0,-1.2],'Motor bölmesinin müze görünümü: dış muhafazalar, destekler ve borular. Çalışır motor tasarımı veya itki hesabı değildir.',false,rocket);
 cyl(motor,.38,.65,[0,1.05,0],M.dark);for(const x of [-.4,.4]){mesh(motor,new T.SphereGeometry(.22,20,12),M.steel,[x,1.75,0]);pipe(motor,[[x,1.75,0],[x,.9,.3],[.3,.8,.3]],.055,M.steel);beam(motor,[x,1.9,0],[x,.5,0],.06);}
 const nozzle=part('nozzle','17. Egzoz Çanı','İç Bölmeler',[0,0,0],[0,-.1,0],'İç yüzeyi açık, çift cidarlı görsel egzoz çanı. Profil yaklaşık rekonstrüksiyon.',false,rocket);
 const nozzlePts=[[.46,.1],[.44,.18],[.27,.55],[.23,.7],[.27,.85],[.30,.85],[.26,.70],[.30,.55],[.48,.18],[.49,.1]].map(v=>new T.Vector2(...v));mesh(nozzle,new T.LatheGeometry(nozzlePts,48),M.dark);
 const lines=part('lines','18. Servis Tesisatı ve Kablo Kanalları','İç Bölmeler',[0,0,0],[.8,0,0],'Bölmeler arasındaki dış tesisatın görünümü. Güzergâhlar yaklaşık ve işlevsel bağlantı şeması değildir.',false,rocket);
 for(const side of [-1,1])pipe(lines,[[side*.65,1,.2],[side*.7,2,.2],[side*.7,6,.2],[side*.65,10,.2]],.025,M.steel);
 function update(dt){dt=Number.isFinite(dt)?Math.max(0,Math.min(dt,.05)):0;S.time+=dt;if(S.auto)S.angle=45+40*Math.sin(S.time*.25);lift.rotation.x=S.angle*Math.PI/180;rocket.rotation.y=S.spin*Math.PI/180;finMovers.forEach(f=>f.rotation.x=S.open*Math.PI/180);
  root.updateMatrixWorld(true);for(let i=0;i<2;i++){const x=i? .7:-.7,a=new T.Vector3(x,1,-2),b=lift.localToWorld(new T.Vector3(x,4,1.0));root.worldToLocal(b);const d=b.clone().sub(a),len=d.length(),mid=a.clone().addScaledVector(d,.5);cylinders[i].position.copy(mid);cylinders[i].scale.y=len*.55;rods[i].position.copy(a.clone().addScaledVector(d,.75));rods[i].scale.y=len*.5;for(const o of [cylinders[i],rods[i]])o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());}
 }
 const camPresets={iso:{pos:[19,12,23],look:[0,7,0]},front:{pos:[0,8,24],look:[0,7,-3]},breech:{pos:[7,5,4],look:[0,3,-4]},engine:{pos:[5,5,1],look:[0,3,-4]},suspension:{pos:[9,5,12],look:[0,1,1]},top:{pos:[.1,25,5],look:[0,4,0]}};
 const tourSteps=[['V-2 ve Meillerwagen','AWM müze örneği üzerinden roket ve taşıyıcı. V-2, sivil kayıplar ve zorla çalıştırılan insanların tarihiyle birlikte değerlendirilmelidir.','iso',upper,false],['Taşıma Düzeni','Tekerlekler, kafes, destekler ve taşıma kuşakları. Poz kaydırıcısı yalnızca müze hareketini gösterir.','suspension',frame,false],['Dış Gövde ve Kuyruk','Dört kuyruk kanadı, bölme halkaları ve panel kapakları.','breech',fins,false],['X-Ray: İç Hacimler','Tanklar ve ekipman bölmesi iç yerleşimi anlamaya yarar; değerler yaklaşık.','front',tanks,true],['Motor Bölmesi','Dış muhafazalar ve egzoz çanı. Fırlatma veya hedefleme simülasyonu bulunmaz.','engine',motor,true],['Tarihsel Bağlam ve Parçalar','Zorla çalıştırılan insanlar ve saldırıların mağdurları bu teknolojinin tarihinin parçasıdır. 18 grubu ayrı inceleyin.','iso',frames,false]].map((a,i)=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:i===5?55:0,sub:'all'}));
 const ui=K.ui({portraitCameraScale:1.55,title:'V-2 / A4 — Meillerwagen ile Müze Modeli',sub:'1944 • Dış gövde, taşıma kafesi ve iç bölmeler • Yaklaşık rekonstrüksiyon',shadowExtent:25,fog:{near:60,far:130},subsystems:[{key:'Taşıyıcı',label:'Meillerwagen',count:7,color:'#64748b'},{key:'Gövde',label:'Dış Gövde ve Kanatlar',count:5,color:'#eab308'},{key:'İç Bölmeler',label:'İç Bölmeler',count:6,color:'#38bdf8'}],camLabels:{iso:'Genel',front:'Gövde',breech:'Kuyruk',engine:'Motor Bölmesi',suspension:'Taşıyıcı',top:'Üst'},sliders:[{label:'Sergileme Pozu: Dikey → Yatay',min:0,max:90,step:1,fmt:v=>Math.round(v)+'°'},{label:'Gövde İnceleme Açısı',min:0,max:360,step:1,fmt:v=>Math.round(v)+'°'},{label:'Kuyruk Yüzeyi Gösterimi',min:-10,max:10,step:1,fmt:v=>v+'°'}],buttons:{terrain:'Otomatik Poz Gösterimi',sweep:'Dikey Poza Dön'},telemetryTag:'A4 • TARİHSEL İNCELEME',statLabels:['POZ','İNCELEME AÇISI','GÖVDE UZUNLUĞU','ANA ÇAP']});
 update(0);return {root,parts,ui,camPresets,tourSteps,defaultPart:upper,firePart:frames,update,onSlider:(i,v)=>{S.auto=false;if(i===0)S.angle=T.MathUtils.clamp(v,0,90);if(i===1)S.spin=T.MathUtils.clamp(v,0,360);if(i===2)S.open=T.MathUtils.clamp(v,-10,10);update(0);return {};},onButton:n=>{if(n==='terrain')S.auto=!S.auto;else{S.auto=false;S.angle=0;}update(0);return {};},buttonActive:n=>n==='terrain'?S.auto:false,onFire:()=>{S.auto=false;S.angle=S.angle>45?0:90;update(0);return {ok:true};},mobileFireButtonLabel:()=>S.angle>45?'Dikey Poz':'Yatay Poz',fireButtonLabel:()=>S.angle>45?'DİKEY SERGİ POZU':'YATAY TAŞIMA POZU',getSliderValues:()=>[S.angle,S.spin,S.open],getStats:()=>[`${Math.round(S.angle)} <span>°</span>`,`${Math.round(S.spin)} <span>°</span>`,'~14 <span>m</span>','~1,65 <span>m</span>'],getStatus:()=>({text:S.auto?'SERGİ HAREKETİ':'MÜZE İNCELEMESİ',color:'#0284c7'}),applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
};})();
