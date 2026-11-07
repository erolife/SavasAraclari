/* Turtle, 1776. Conjectural museum reconstruction informed by SMG 1976-480 and NHHC. */
(function(){'use strict';window.VehicleBuilders=window.VehicleBuilders||{};
window.VehicleBuilders.turtle=function(ctx){
 const K=window.MuseumModelKit(ctx,'turtle'),{T,root,parts,mats:M,mesh,box,cyl,ring,pipe,beam,instances}=K;
 let n=0;const counts={},S={rpm:12,phase:0,hatch:0,ballast:25,open:false,running:false,pumping:false,pumpTime:0};
 M.paint.color.setHex(0x775039);M.paint.metalness=0;M.paint.roughness=.88;
 const oak=M.wood.clone();oak.color.setHex(0x9a724c);const copper=M.brass.clone();copper.color.setHex(0x937348);
 function G(p,pos,name){const g=new T.Group();g.position.set(...pos);g.name=name;p.add(g);return g;}
 function P(key,name,sub,desc,exp=[0,1,0],outer=false,parent=root){counts[sub]=(counts[sub]||0)+1;const p=K.part(key,++n+'. '+name,sub,[0,0,0],exp,desc,outer,parent);p.userData.material='Ahşap, demir, pirinç ve cam';p.userData.spec='1776 • iç yerleşim yaklaşık müze yorumu';return p;}
 const stand=P('stand','Müze Kaidesi ve Mesnetler','Sergi','Günümüz sergi kaidesi. Gövde oranları yaklaşık; buradaki hareketler denizaltı performans simülasyonu değildir.',[0,0,0]);
 box(stand,[3.6,.12,3.6],[0,.06,0],M.dark);for(const x of [-.55,.55]){box(stand,[.13,.43,1.9],[x,.33,0],M.dark);for(const z of [-.6,.6])box(stand,[.28,.09,.25],[x,.56,z],M.rubber);}
 // Egg-shaped shell: meridional planks with thickness and open crown, avoiding a solid sphere.
 function point(t,a,inner=0){const f=Math.sin(t)*(1+.10*Math.cos(t));return new T.Vector3((.98-inner)*f*Math.cos(a),2+1.40*Math.cos(t),(1.12-inner)*f*Math.sin(a));}
 function plank(a0,a1){const verts=[],idx=[];for(let skin=0;skin<2;skin++)for(let j=0;j<=24;j++)for(let k=0;k<2;k++){const t=.35+j*(Math.PI-.48)/24,v=point(t,k?a1:a0,skin*.055);verts.push(...v.toArray());}
  const layer=50;for(let j=0;j<24;j++){const a=j*2;idx.push(a,a+2,a+1,a+1,a+2,a+3,layer+a,layer+a+1,layer+a+2,layer+a+1,layer+a+3,layer+a+2);for(const k of [0,1]){const b=a+k;idx.push(b,b+layer,b+2,b+layer,b+layer+2,b+2);}}for(const a of [0,48])idx.push(a,a+1,a+layer,a+1,a+layer+1,a+layer);
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();return geo;
 }
 const left=P('left','Sol Ahşap Kabuk','Gövde','İki kaplumbağa kabuğu benzetmesinden yumurta biçimi. Kaplama ve iç posta yerleri müze yorumudur.',[-.65,0,0],true);
 const right=P('right','Sağ Ahşap Kabuk','Gövde','Ahşap gövdenin ikinci yarısı; inceleme düğmesi iki kabuğu sergi amaçlı yana ayırır.',[.65,0,0],true);
 const shells=[G(left,[0,0,0],'shell-left'),G(right,[0,0,0],'shell-right')];
 for(let i=0;i<32;i++){const a=i*Math.PI*2/32,side=Math.cos(a+Math.PI/32)>0?1:0;mesh(shells[side],plank(a+.004,a+Math.PI/16-.004),i%3?M.paint:oak);}
 const ribs=P('ribs','İç Postalar ve Dip Omurgası','Gövde','Açılmış kabukta iç ahşap postalar, bağlantı takozları ve dar taban görünür.',[0,0,.3]);
 for(let i=0;i<10;i++){const a=i*Math.PI/5,pts=[];for(let j=0;j<=24;j++)pts.push(point(.38+j*(Math.PI-.55)/24,a,.11).toArray());pipe(ribs,pts,.035,oak);}
 box(ribs,[.7,.12,1.5],[0,.74,0],M.wood);
 const bands=P('bands','Demir Kuşak ve Bağlantılar','Gövde','Dış gövde kuşakları ve küçük bağlantı başları modern müze örneklerindeki görünümü yorumlar.',[0,0,-.4]);
 const bandSides=[G(bands,[0,0,0],'band-left'),G(bands,[0,0,0],'band-right')];
 for(const t of [.7,1.25,1.8,2.35])for(let side=0;side<2;side++){const pts=[],start=side?-Math.PI/2:Math.PI/2;for(let j=0;j<=40;j++)pts.push(point(t,start+j*Math.PI/40,-.012).toArray());pipe(bandSides[side],pts,.023,M.dark);}
 for(let side=0;side<2;side++){const rivets=[];for(let i=0;i<12;i++){const a=(side?-Math.PI/2:Math.PI/2)+i*Math.PI/11;for(const t of [.7,1.25,1.8,2.35])rivets.push({pos:point(t,a,-.035).toArray()});}instances(bandSides[side],new T.SphereGeometry(.017,8,6),M.brass,rivets);}
 const crown=P('crown','Pirinç Başlık ve Giriş Boynu','Gövde','Üst başlık, küçük görüş camları ve giriş ağzı. Boyutları karşılaştırmalı müze yorumudur.',[0,.5,0],true);
 mesh(crown,new T.CylinderGeometry(.34,.44,.27,48,1,true),copper,[0,3.37,0]);ring(crown,.35,[0,3.51,0],M.brass,.035,[Math.PI/2,0,0]);
 const ports=P('ports','Görüş Camları ve Çerçeveler','Gövde','Başlığın çevresindeki küçük camlar ve bronz renkli cıvatalı çerçeveler.',[0,.35,.2]);
 for(let i=0;i<6;i++){const a=i*Math.PI/3,g=G(ports,[Math.sin(a)*.40,3.38,Math.cos(a)*.40],'port-'+i);g.rotation.y=a;ring(g,.073,[0,0,0],M.brass,.016);cyl(g,.062,.012,[0,0,.004],M.glass,'z');for(let j=0;j<4;j++){const b=j*Math.PI/2;cyl(g,.009,.012,[Math.sin(b)*.087,Math.cos(b)*.087,.015],M.steel,'z');}}
 const lidPart=P('lid','Menteşeli Üst Kapak','Gövde','Kapak yalnızca sergi incelemesi için açılır. Açık kapakla dalış gösterimi başlatılamaz.',[0,.6,0]);
 const lid=G(lidPart,[0,3.58,-.34],'hatch');cyl(lid,.345,.045,[0,.025,.34],copper);ring(lid,.30,[0,.052,.34],M.dark,.012,[Math.PI/2,0,0]);pipe(lid,[[-.10,.07,.34],[-.10,.17,.34],[.10,.17,.34],[.10,.07,.34]],.022,M.brass);cyl(lidPart,.033,.34,[0,3.58,-.34],M.steel,'x');
 const vents=P('vents','Hava Boruları','Yaşam Alanı','Yüzeyde hava yenilemeye ilişkin borular; vana iç geometrisi ve hava süresi hesaplanmaz.',[0,.5,-.3]);
 for(const x of [-.23,.23]){pipe(vents,[[x,2.6,-.32],[x,3.6,-.32],[x,3.72,-.22],[x,3.72,-.08]],.028,copper);cyl(vents,.044,.05,[x,3.72,-.07],M.dark,'z');}
 const seat=P('seat','Operatör Oturağı ve Ayaklık','Yaşam Alanı','Tek kişilik dar kabin. Koltuk, ayaklık ve kumandalar özgün yerleşimin kesin kopyası değildir.',[0,.1,-.5]);
 box(seat,[.57,.09,.45],[0,1.38,-.2],oak);box(seat,[.5,.65,.07],[0,1.73,-.43],M.wood,[.12,0,0]);for(const x of [-.22,.22])beam(seat,[x,.8,-.2],[x,1.36,-.2],.055,M.wood);box(seat,[.65,.06,.25],[0,.96,.35],oak);
 const drive=P('drive','Yatay Tahrik Mili ve Yataklar','Tahrik','İleri hareket pervanesine bağlı yatay mil. Hareket gösteriminde tek ortak faz kullanılır; hız tahmini üretilmez.',[0,.2,.4]);
 for(const z of [.38,.80,1.02]){cyl(drive,.09,.10,[0,1.85,z],copper,'z');for(const x of [-.14,.14])beam(drive,[x,1.35,z],[x,1.85,z],.04,M.dark);}
 const shaft=G(drive,[0,1.85,0],'drive-shaft');cyl(shaft,.032,1.64,[0,0,.55],M.steel,'z');
 const crankPart=P('crank','El Krankı ve Tutamak','Tahrik','Krank ile dış pervane aynı şafta bağlıdır; mekanik aktarım sadeleştirilmiştir.',[0,0,.4]);
 const crank=G(crankPart,[0,1.85,-.27],'hand-crank');beam(crank,[0,0,0],[.24,0,0],.04,copper);cyl(crank,.03,.18,[.24,0,-.07],M.wood,'z');
 const propPart=P('prop','İleri Hareket Pervanesi','Tahrik','Erken vidalı kürek/pervane biçiminin iki palalı müze yorumu. Dönüş gösterimidir, itki çözümü değildir.',[0,0,.6]);
 const prop=G(propPart,[0,1.85,1.40],'propeller');cyl(prop,.085,.16,[0,0,0],copper,'z');
 function blades(parent,r){for(const sign of [-1,1]){const shape=new T.Shape();shape.moveTo(.035,0);shape.quadraticCurveTo(.32*r,.18*r,.42*r,.82*r);shape.quadraticCurveTo(.15*r,1.1*r,-.19*r,.85*r);shape.lineTo(-.035,0);shape.closePath();mesh(parent,new T.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:1}),copper,[0,0,0],[0,.23,sign<0?Math.PI:0]);}}
 blades(prop,.48);
 const vdrive=P('vdrive','Düşey Pervane Kolu','Tahrik','Düşey hareket düzeneğinin ayrı krankı ve üst şaftı; ana şafttan bağımsız elle işletim yorumudur.',[-.35,.35,0]);
 cyl(vdrive,.075,.12,[.53,2.70,0],copper);cyl(vdrive,.075,.12,[.53,3.14,0],copper);beam(vdrive,[.53,2.7,0],[.35,2.7,0],.07,M.wood);
 const vshaft=G(vdrive,[.53,2.65,0],'vertical-shaft');cyl(vshaft,.025,1.2,[0,.5,0],M.steel);beam(vshaft,[0,0,0],[.20,0,0],.035,copper);cyl(vshaft,.022,.16,[.20,-.05,0],M.wood);
 const vpropPart=P('vprop','Üst Düşey Pervane','Tahrik','Üstteki ikinci vidalı kürek. Yalnızca balast gösterimi sırasında yavaş hareket eder.',[.35,.6,0]);
 const vprop=G(vpropPart,[.53,3.75,0],'vertical-propeller');vprop.rotation.x=-Math.PI/2;blades(vprop,.27);cyl(vprop,.06,.1,[0,0,0],copper,'z');
 const rudder=P('rudder','Kıç Dümeni','Tahrik','Kıçtaki küçük yön levhası, mil ve kabine uzanan yeke; sabit sergi konumunda gösterilir.',[0,0,-.6]);
 cyl(rudder,.025,.9,[0,1.65,-1.19],M.steel);box(rudder,[.035,.65,.32],[0,1.45,-1.31],oak);beam(rudder,[0,2.1,-1.19],[0,2.1,-.42],.04,copper);
 const instruments=P('instruments','Pusula ve Gösterge Yüzleri','Yaşam Alanı','İki küçük gösterge yüzü ve ibre; fosforlu işaret fikrini anlatan temsili okuma yüzleri, tarihsel ölçek iddiası yok.',[0,.2,.3]);
 for(const x of [-.23,.23]){cyl(instruments,.105,.05,[x,2.3,.57],copper,'z');cyl(instruments,.088,.006,[x,2.3,.603],M.white,'z');beam(instruments,[x,2.3,.611],[x+.035,2.36,.611],.009,M.dark);const marks=[];for(let j=0;j<12;j++){const a=j*Math.PI/6;marks.push({pos:[x+Math.sin(a)*.071,2.3+Math.cos(a)*.071,.61],rot:[0,0,-a]});}instances(instruments,new T.BoxGeometry(.008,.016,.006),M.dark,marks);}
 const pump=P('pump','Elle İşletilen Balast Pompası','Balast','Silindir, piston kolu ve dip borusu. Su düzeyi gösterimi kavramsaldır; pompa kapasitesi modellenmez.',[-.3,0,.3]);
 cyl(pump,.085,.55,[-.48,1.2,.13],copper);pipe(pump,[[-.48,.93,.13],[-.48,.79,.13],[-.2,.79,.1]],.026,copper);
 const piston=G(pump,[-.48,1.5,.13],'pump-piston');cyl(piston,.018,.25,[0,.06,0],M.steel);cyl(piston,.025,.24,[0,.2,0],M.wood,'x');
 const ballast=P('ballast','Balast Haznesi ve Su Düzeyi','Balast','Şeffaf hazne çağdaş eğitim kesitidir. Gösterilen yüzde gerçek dalış derinliği değildir.',[0,-.15,0]);
 box(ballast,[.65,.35,.7],[0,.94,.0],M.glass);const liquid=box(ballast,[.61,.20,.66],[0,.875,0],new T.MeshStandardMaterial({color:0x277e98,transparent:true,opacity:.65,roughness:.25}));liquid.name='ballast-water';
 const weights=P('weights','Dip Ağırlığı ve Bağları','Balast','Alt ağırlık ve sabit taşıyıcı kayışlar. Tehlikeli boşaltma veya saldırı mekanizması simüle edilmez.',[0,-.3,0]);
 box(weights,[.52,.12,.8],[0,.63,0],M.dark);for(const x of [-.2,.2])pipe(weights,[[x,.65,-.4],[x,.84,-.4],[x,.84,.4],[x,.65,.4]],.018,M.steel);
 function sync(){shaft.rotation.z=S.phase;crank.rotation.z=S.phase;prop.rotation.z=S.phase;lid.rotation.x=-S.hatch*Math.PI/180;
  shells.forEach((g,i)=>g.position.x=(i?1:-1)*(S.open?.75:0));bandSides.forEach((g,i)=>g.position.x=(i?1:-1)*(S.open?.75:0));
  const h=.003+.29*S.ballast/100;liquid.scale.y=h/.20;liquid.position.y=.775+h/2;
  piston.position.y=1.5+(S.pumping?.07*Math.sin(S.pumpTime*5):0);vshaft.rotation.y=S.pumpTime*1.2;vprop.rotation.z=S.pumpTime*1.2;
 }
 function update(dt){if(Number.isFinite(dt)){dt=T.MathUtils.clamp(dt,0,.05);if(S.running)S.phase+=S.rpm*Math.PI*2/60*dt;if(S.pumping){S.pumpTime+=dt;S.ballast=Math.max(0,S.ballast-dt*8);if(S.ballast===0)S.pumping=false;}}sync();}
 const camPresets={iso:{pos:[6.4,4.8,7.7],look:[0,1.9,0]},front:{pos:[0,2.7,7],look:[0,2,0]},breech:{pos:[-5,3.5,-5],look:[0,1.8,0]},engine:{pos:[3.8,2.8,4.5],look:[0,1.8,.5]},suspension:{pos:[-3.5,2.2,3.1],look:[-.2,1.2,0]},top:{pos:[.1,8,.1],look:[0,1.5,0]}};
 const tourSteps=[['Turtle • 1776','David Bushnell’in tek kişilik denizaltısı. Science Museum 1976-480 örneği de varsayımsal bir rekonstrüksiyondur.','iso',left,false],['İki Kabuk','Kabuğu Aç düğmesiyle ahşap dış kaplamayı ayırın; iç postalar ve dar kabini görün.','front',ribs,true],['Kranktan Pervaneye','El krankı, yataklar ve dış pervane ortak şafta bağlıdır. Gösterim devrini ayarlayın.','engine',drive,false],['Yaşam Alanı','Oturak, iki küçük gösterge, hava boruları ve üst camlar tek operatörün çevresindedir.','breech',seat,true],['Balast Gösterimi','Balast yüzdesi yalnızca kavramsal su düzeyidir. Kapak kapalıyken pompa gösterimi başlatılabilir.','suspension',pump,true],['Başarısız Girişim, Kalıcı Fikir','1776 saldırıları başarılı olmadı. Burada saldırı düzeneği yerine su altında hareket ve insan unsuruna odaklanılır.','top',lidPart,false]].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));
 const ui=K.ui({portraitCameraScale:1.65,fog:{near:60,far:120},title:'TURTLE — Bushnell’in Denizaltısı',sub:'1776 • Tek kişilik ahşap denizaltı • İç yerleşim yaklaşık rekonstrüksiyon',subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#95744e'})),camLabels:{iso:'Genel',front:'Ön',breech:'Kabin',engine:'El Tahriki',suspension:'Balast',top:'Üst Kapak'},sliders:[{label:'El Krankı Gösterim Devri',min:0,max:30,step:1,fmt:v=>v+' RPM'},{label:'Üst Kapak Açısı',min:0,max:105,step:1,fmt:v=>v+'°'},{label:'Balast Su Düzeyi (temsili)',min:0,max:100,step:1,fmt:v=>'%'+Math.round(v)}],buttons:{terrain:'Kabuğu Aç / Kapat',sweep:'Krankı Başlat / Durdur'},telemetryTag:'TURTLE • İNSAN GÜCÜ',statLabels:['KRANK','KAPAK','BALAST','KABUK']});
 sync();return {root,parts,ui,camPresets,tourSteps,defaultPart:left,firePart:pump,update,onFire:()=>{if(S.hatch>0)return {ok:false,msg:'Pompa gösterimi için üst kapağı kapatın.'};if(S.pumping){S.pumping=false;}else{if(S.ballast===0)S.ballast=100;S.pumping=true;}sync();return {ok:true};},mobileFireButtonLabel:()=>S.pumping?'Durdur':'Pompa',fireButtonLabel:()=>S.pumping?'POMPAYI DURDUR':'BALAST POMPASI GÖSTERİMİ',onSlider:(i,v)=>{if(!Number.isFinite(v))return {};if(i===0)S.rpm=T.MathUtils.clamp(v,0,30);if(i===1){S.hatch=T.MathUtils.clamp(v,0,105);if(S.hatch>0)S.pumping=false;}if(i===2){S.ballast=T.MathUtils.clamp(v,0,100);S.pumping=false;}sync();return {};},onButton:n=>{if(n==='terrain')S.open=!S.open;if(n==='sweep')S.running=!S.running;sync();return {};},buttonActive:n=>n==='terrain'?S.open:S.running,getSliderValues:()=>[S.rpm,S.hatch,S.ballast],getStats:()=>[(S.running?S.rpm:0)+' <span>RPM</span>',S.hatch+' <span>°</span>',S.ballast.toFixed(0)+' <span>% temsili</span>',S.open?'AYRILMIŞ':'BİRLEŞİK'],getStatus:()=>({text:S.pumping?'BALAST BOŞALTMA GÖSTERİMİ':S.hatch?'KAPAK AÇIK • SERGİ':'İNCELEMEYE HAZIR',color:'#9d7b45'}),applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
};})();
