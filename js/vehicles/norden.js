/* Norden M-9 bomba nişangâhı: müze örneğine dayanan eğitim amaçlı mekanik model. Gerçek balistik/trail tablosu kullanılmaz. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.norden = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'norden');
    const {T, root, mats:M, mesh, box, cyl, ring, pipe, instances} = K;
    const g = 9.81, R_ROLLER = .012, R_MIN = .008, R_MAX = .060, Q_MAX = (500/3.6)/3000, DISC_W = 6;
    const S = {h:9000, vKmh:400, err:0, power:true, autopilot:false, covers:false,
      run:false, t:0, D0:0, k:1, released:false, fall:0, impact:false, miss:0, relD:0,
      discAngle:0, rollerAngle:0, gyro:0, phiSight:Math.PI/3, phiTrue:Math.PI/3};
    const counts = {}; let number = 0;
    M.paint.color.setHex(0x26292b); M.paint.roughness = .55; // siyah kırışık boya
    const wrinkle = M.paint, alu = M.steel.clone(); alu.color.setHex(0xb9bec2);
    const lampMat = M.red.clone(); lampMat.color.setHex(0x6b2a22);
    function G(parent, pos, name) {const o=new T.Group();o.position.set(...pos);if(name)o.name=name;parent.add(o);return o;}
    function P(key,name,sub,desc,exp=[0,.15,0],outer=false,parent=root) {
      counts[sub]=(counts[sub]||0)+1;
      const p=K.part(key,++number+'. '+name,sub,[0,0,0],exp,desc,outer,parent);
      p.userData.material='Kırışık boyalı alüminyum döküm, pirinç dişliler, optik cam';
      p.userData.spec='Müze örneğine dayanan eğitim modeli; iç ölçüler ve dişli dizilimi yorumdur.';return p;
    }
    const UP=new T.Vector3(0,1,0),a3=new T.Vector3(),b3=new T.Vector3(),d3=new T.Vector3();
    function stretch(o,a,b){a3.set(...a);b3.set(...b);o.position.copy(a3).add(b3).multiplyScalar(.5);d3.copy(b3).sub(a3);o.scale.y=Math.max(d3.length(),1e-5);o.quaternion.setFromUnitVectors(UP,d3.normalize());}
    const glassMat=M.glass, shellMat=wrinkle.clone();shellMat.side=T.DoubleSide;shellMat.userData.paint=true;

    // ------------------------------------------------------------- KAİDE
    const stand=P('stand','Müze Kaidesi','Sergi','Nişangâhı göz hizasında tutan sergi kaidesi. Uçak içindeki montaj düzeni değildir.',[0,-.2,0]);
    cyl(stand,.22,.04,[0,.02,0],M.dark);cyl(stand,.05,.80,[0,.42,0],M.dark);box(stand,[.52,.04,.44],[0,.84,0],M.wood);

    // ------------------------------------------------------------- STABİLİZATÖR (alt gövde)
    const stab=P('stab','Stabilizatör Gövdesi','Stabilizatör','Alt birim: yön jiroskopu ve dümen servosunu taşır; bomba koşusunda nişangâh başlığını yönde sabitler. X-Ray kapağı saydamlaştırır.',[0,-.08,0],true);
    mesh(stab,new T.BoxGeometry(.40,.18,.34),shellMat,[0,.95,0]);
    const dgyro=P('dgyro','Yön Jiroskopu','Stabilizatör','Yatay eksenli jiroskop rotoru; güç açıkken döner, kapalıyken durur. Rotor ölçüsü temsili.',[-.18,0,0]);
    const dgFrame=G(dgyro,[-.08,.95,0]);ring(dgFrame,.07,[0,0,0],M.brass,.006,[0,Math.PI/2,0]);
    const dRotor=G(dgFrame,[0,0,0],'dir-gyro');cyl(dRotor,.055,.025,[0,0,0],alu,'x');box(dRotor,[.03,.01,.10],[0,0,0],M.dark);
    const servo=P('servo','Dümen Servosu ve Otomatik Pilot Kavraması','Stabilizatör','Bağlantı açıkken stabilizatör, kablo üzerinden otomatik pilota yön düzeltmesi verir (AFCE). Kavrama kolu yalnız durumu gösterir.',[.2,0,-.1]);
    cyl(servo,.035,.09,[.13,.95,-.10],M.dark,'x');
    const clutch=G(servo,[.18,.95,-.10],'clutch-lever');box(clutch,[.012,.07,.012],[0,.035,0],M.brass);
    const cables=P('cables','Bağlantı Kabloları','Stabilizatör','Otomatik pilot ve güç kabloları kaideden aşağı iner. Fiş sayısı ve kablo yolu temsili.',[0,-.1,-.2]);
    pipe(cables,[[.13,.90,-.17],[.13,.86,-.24],[.05,.70,-.20],[.04,.40,-.06]],.012,M.rubber);
    pipe(cables,[[-.13,.90,-.17],[-.13,.86,-.24],[-.04,.60,-.10]],.010,M.rubber);

    // ------------------------------------------------------------- NİŞANGÂH BAŞLIĞI
    const head=P('head','Nişangâh Başlığı Gövdesi','Nişangâh Başlığı','Üst birim: hesap düzeneği, teleskop ve göstergeler. Kırışık siyah boya müze örneğinde görülür.',[0,.12,0],true);
    mesh(head,new T.BoxGeometry(.30,.24,.30),shellMat,[0,1.16,.02]);
    const vgyro=P('vgyro','Dikey Jiroskop','Nişangâh Başlığı','Teleskobun dikey referansını tutan jiroskop; uçağın yalpalamasını süzer.',[-.15,.1,0]);
    const vg=G(vgyro,[-.08,1.22,-.07],'vert-gyro');cyl(vg,.045,.02,[0,0,0],alu);box(vg,[.08,.006,.012],[0,.012,0],M.dark);ring(vgyro,.055,[-.08,1.22,-.07],M.brass,.005);
    const motor=P('motor','Sabit Devirli Hız Motoru ve Regülatör','Hesap Düzeneği','Elektrik motoru regülatörle sabit devirde tutulur ve integratör diskini döndürür. Güç kesilince disk durur.',[-.2,0,0]);
    cyl(motor,.035,.10,[-.20,1.10,.08],M.dark,'x');cyl(motor,.008,.18,[-.09,1.10,.08],M.steel,'x');
    const gov=G(motor,[-.27,1.10,.08],'governor');for(const s of [-1,1]){mesh(gov,new T.SphereGeometry(.010,10,8),M.brass,[0,s*.022,0]);box(gov,[.004,.022,.004],[0,s*.011,0],M.steel);}
    const integ=P('integ','Disk–Bilye İntegratörü','Hesap Düzeneği','Dönen diskin üstündeki iki bilyeli araba, disk merkezinden r uzaklıkta hız okur. r, ayarlanan yer hızı / irtifa oranıyla orantılıdır; çıkış silindiri ω·r/r₀ hızıyla döner.',[0,.15,.15]);
    const disc=G(integ,[0,1.10,.08],'integrator-disc');cyl(disc,.07,.01,[0,0,0],alu);box(disc,[.13,.0015,.006],[0,.0055,0],M.dark);
    cyl(integ,.006,.04,[0,1.08,.08],M.steel);
    box(integ,[.08,.006,.012],[.04,1.13,.055],M.steel);box(integ,[.08,.006,.012],[.04,1.13,.105],M.steel);
    const carriage=G(integ,[0,1.105,.08],'ball-carriage');
    const lowerBall=mesh(carriage,new T.SphereGeometry(.012,14,10),M.steel,[0,.012,0]);
    const upperBall=mesh(carriage,new T.SphereGeometry(.012,14,10),M.steel,[0,.036,0]);
    box(carriage,[.03,.006,.06],[0,.024,0],M.brass);
    const rollerPart=P('roller','Çıkış Silindiri ve Dişli Dizisi','Hesap Düzeneği','Üst bilyeye değen silindir, oranı ayna tahrikine ve göstergelere aktarır. Dişli sayıları temsili.',[0,.18,.12]);
    const roller=G(rollerPart,[.04,1.105+.048+R_ROLLER,.08],'output-roller');cyl(roller,R_ROLLER,.16,[0,0,0],M.steel,'x');box(roller,[.15,.004,.004],[0,R_ROLLER,0],M.dark);
    const gears=[];for(const [x,r] of [[.13,.022],[.13,.034]]){const gg=G(rollerPart,[x,1.165+r*.2,.08+(r>.03?.05:0)],'gear');cyl(gg,r,.008,[0,0,0],M.brass,'x');gears.push(gg);}

    // ------------------------------------------------------------- TELESKOP ve AYNA
    const optics=P('optics','Teleskop ve Nişan Aynası','Optik','Bombacı dikey teleskoptan bakar; alttaki ayna φ/2 kadar döndüğünde görüş hattı dikeyden φ kadar ileri sapar. Görüş hattı turuncu ışınla gösterilir.',[.15,.1,.2]);
    cyl(optics,.025,.24,[.10,1.26,.14],wrinkle);cyl(optics,.03,.04,[.10,1.40,.14],M.rubber);mesh(optics,new T.CylinderGeometry(.021,.021,.004,20),glassMat,[.10,1.422,.14]);
    box(optics,[.08,.07,.08],[.10,1.06,.20],wrinkle);
    const mirror=G(optics,[.10,1.06,.20],'sight-mirror');box(mirror,[.05,.003,.05],[0,0,0],alu);
    const beamMat=new T.MeshBasicMaterial({color:0xd89a43,transparent:true,opacity:.75,depthWrite:false});
    const beam=new T.Mesh(new T.CylinderGeometry(.003,.003,1,6),beamMat);beam.name='sight-beam';optics.add(beam);
    const dials=P('dials','Nişan ve Düşüş Açısı Göstergeleri','Optik','Aynı kadranda iki ibre: nişan açısı φ hedefi izledikçe küçülür, düşüş açısı δ hızdan ve irtifadan hesaplanır. İbreler buluşunca bırakma kontağı kapanır.',[.2,0,0]);
    ring(dials,.05,[.156,1.20,-.05],M.brass,.004,[0,Math.PI/2,0]);cyl(dials,.048,.004,[.153,1.20,-.05],alu,'x');
    const phiNeedle=G(dials,[.16,1.20,-.05],'phi-needle'),deltaNeedle=G(dials,[.162,1.20,-.05],'delta-needle');
    box(phiNeedle,[.002,.044,.004],[0,.022,0],M.dark);box(deltaNeedle,[.002,.040,.006],[0,.020,0],M.red);
    const knobs=P('knobs','Hız, Sapma ve Yer Değiştirme Düğmeleri','Optik','Bombacının hız (rate), sapma ve yer değiştirme ayarları. Hız düğmesinin dönüşü ayar hatasını gösterir.',[.25,0,.1]);
    const rateKnob=G(knobs,[.17,1.10,.08],'rate-knob');cyl(rateKnob,.026,.02,[0,0,0],M.dark,'x');box(rateKnob,[.022,.004,.004],[.0,.02,0],alu);
    cyl(knobs,.018,.02,[.17,1.20,.12],M.dark,'x');cyl(knobs,.02,.018,[-.05,1.29,.10],M.dark);
    const release=P('release','Bırakma Kontağı ve Lamba','Optik','İbreler buluştuğunda kapanan kontak bomba bırakma devresini tetikler; kırmızı lamba yanar.',[0,.12,-.1]);
    cyl(release,.02,.02,[0,1.29,-.10],M.dark);const lamp=mesh(release,new T.SphereGeometry(.016,14,10),lampMat,[0,1.31,-.10]);
    const glow=new T.Mesh(new T.SphereGeometry(.022,14,10),new T.MeshBasicMaterial({color:0xff4b36,transparent:true,opacity:.75,depthWrite:false}));glow.position.set(0,1.31,-.10);glow.visible=false;glow.name='release-glow';release.add(glow);
    const reflex=P('reflex','X-1 Refleks Nişangâhı','Optik','Müze takımında bulunan küçük refleks nişangâh; bomba koşusuna girişte kaba yönlendirme için. Konumu yaklaşık.',[-.15,.12,.1]);
    box(reflex,[.05,.05,.07],[-.10,1.31,.10],wrinkle);mesh(reflex,new T.BoxGeometry(.045,.04,.003),glassMat,[-.10,1.355,.12],[-.3,0,0]);

    // ------------------------------------------------------------- EĞİTİM PANOSU (açılar doğru ölçekli)
    const board=P('board','Bomba Koşusu Eğitim Panosu','Eğitim','Yandan görünüş: uçak solda sabit, hedef yaklaşır. Yatay ve dikey ölçek aynıdır, bu yüzden çizgilerin açıları gerçek φ ve δ açılarıdır. Turuncu: nişangâhın görüş hattı, gri: gerçek hedef hattı, koyu: düşüş açısı.',[0,0,-.3]);
    const BX=-.5,BY=1.55,BG=1.05,SC=.5; // uçak (BX,BY), zemin BG; irtifa = SC birim
    box(board,[1.32,.78,.03],[0,1.30,-.56],M.white);for(const x of [-.62,.62])cyl(board,.018,1.30,[x,.65,-.58],M.dark);
    box(board,[1.20,.006,.01],[0,BG,-.535],M.wood);
    box(board,[.06,.018,.01],[BX,BY,-.535],M.dark);box(board,[.018,.04,.01],[BX-.02,BY+.015,-.535],M.dark);
    const lineMat=c=>new T.MeshBasicMaterial({color:c,transparent:true,opacity:.9,depthWrite:false});
    const lineGeo=new T.CylinderGeometry(.0035,.0035,1,6);
    const sightLine=new T.Mesh(lineGeo,lineMat(0xd89a43)),trueLine=new T.Mesh(lineGeo,lineMat(0x7c8288)),dropLine=new T.Mesh(lineGeo,lineMat(0x26292b));
    [sightLine,trueLine,dropLine].forEach(o=>board.add(o));sightLine.name='board-sight';trueLine.name='board-true';dropLine.name='board-drop';
    const target=G(board,[0,BG+.012,-.53],'board-target');box(target,[.03,.024,.01],[0,0,0],M.red);
    const bomb=G(board,[BX,BY,-.528],'board-bomb');mesh(bomb,new T.SphereGeometry(.012,10,8),M.dark);bomb.visible=false;

    // ------------------------------------------------------------- HESAP
    const V=()=>S.vKmh/3.6, Vp=()=>V()*(1+S.err/100), tf=()=>Math.sqrt(2*S.h/g);
    const delta=()=>Math.atan(Vp()*tf()/S.h), ratio=()=>Vp()/S.h;
    const carriageR=()=>R_MIN+(R_MAX-R_MIN)*T.MathUtils.clamp(ratio()/Q_MAX,0,1);
    const pt=(D)=>[BX+T.MathUtils.clamp(D/S.h,-.2,2.15)*SC,BG];
    function sync() {
      const r=carriageR();carriage.position.x=r;
      disc.rotation.y=S.discAngle;roller.rotation.x=S.rollerAngle;gears.forEach((o,i)=>o.rotation.x=(i?-1:1)*S.rollerAngle*(i?.65:1));
      dRotor.rotation.x=S.gyro;vg.rotation.y=S.gyro*1.3;gov.rotation.x=S.discAngle*2;
      clutch.rotation.z=S.autopilot?-.7:0;rateKnob.rotation.x=S.err*.15;
      // Ayna φ/2 döner; ışın dikey aşağıdan φ kadar ileri.
      mirror.rotation.x=-S.phiSight/2;
      const m=[.10,1.06,.20],L=.55;stretch(beam,m,[m[0],m[1]-L*Math.cos(S.phiSight),m[2]+L*Math.sin(S.phiSight)]);beam.visible=S.power;
      phiNeedle.rotation.x=-S.phiSight;deltaNeedle.rotation.x=-delta();
      const Dt=S.run||S.impact?S.D0-V()*S.t:S.h*Math.tan(S.phiTrue),Ds=S.run||S.impact?S.D0-Vp()*S.t:Dt;
      const tp=S.impact?pt(S.miss):pt(Dt);target.position.x=tp[0];
      stretch(trueLine,[BX,BY,-.532],[tp[0],BG,-.532]);
      stretch(sightLine,[BX,BY,-.530],[BX+Math.tan(S.phiSight)*SC,BG,-.530]);
      stretch(dropLine,[BX,BY,-.534],[BX+Math.tan(delta())*SC,BG,-.534]);
      trueLine.visible=sightLine.visible=true;
      bomb.visible=S.released;bomb.position.y=BY-SC*Math.min(1,.5*g*S.fall*S.fall/S.h);
      glow.visible=S.released;lampMat.color.setHex(S.released?0xc63b2b:0x6b2a22);
    }
    function startRun() {
      S.run=true;S.t=0;S.released=false;S.fall=0;S.impact=false;S.miss=0;
      S.D0=S.h*Math.max(Math.tan(Math.PI/3),Math.tan(delta())*1.35);
      S.k=Math.max(1,(S.D0-Vp()*tf())/Vp()/8); // koşu ~8 sn sürsün (zaman ölçeği)
    }
    function update(dt) {
      if(!Number.isFinite(dt))return;dt=T.MathUtils.clamp(dt,0,.05);
      if(S.power){S.discAngle=(S.discAngle+dt*DISC_W)%(Math.PI*2);S.rollerAngle=(S.rollerAngle+dt*DISC_W*carriageR()/R_ROLLER)%(Math.PI*2);S.gyro=(S.gyro+dt*40)%(Math.PI*2);}
      if(S.run&&S.power){const ds=dt*S.k;S.t+=ds;
        const tRel=(S.D0-Vp()*tf())/Vp();
        if(!S.released){
          if(S.t>=tRel){const over=S.t-tRel;S.released=true;S.relD=S.D0-V()*tRel;S.miss=S.relD-V()*tf();S.phiSight=delta();S.fall=over;}
          else S.phiSight=Math.atan2(S.D0-Vp()*S.t,S.h);
        }else S.fall+=ds;
        if(S.released&&S.fall>=tf()){S.fall=tf();S.run=false;S.impact=true;S.t=tRel+tf();}
        S.phiTrue=Math.atan2(S.D0-V()*S.t,S.h);
      }
      sync();
    }
    const camPresets={iso:{pos:[1.25,1.55,1.35],look:[0,1.12,0]},front:{pos:[.25,1.25,.85],look:[.08,1.12,.12]},breech:{pos:[.75,1.32,.25],look:[.13,1.18,-.03]},engine:{pos:[-.55,1.42,.65],look:[-.02,1.12,.06]},suspension:{pos:[0,1.35,1.25],look:[0,1.25,-.5]},top:{pos:[.01,2.4,.05],look:[0,1.1,0]}};
    const tourSteps=[
      ['Norden M-9: Dişlilerle Hesap','Uçağın yer hızını ve irtifasını dişliler, jiroskoplar ve bir disk–bilye integratörüyle işleyen nişangâh. Müze örneği Enola Gay’de kullanılan takımdır; iç düzen burada eğitim amaçlı yorumlanmıştır.','iso',head,false],
      ['Disk–Bilye İntegratörü','X-Ray ile diski görün. Yer hızını artırın veya irtifayı düşürün: bilye arabası merkezden uzaklaşır, çıkış silindiri hızlanır. Gücü kapatınca disk ve silindir durur.','engine',integ,true],
      ['Ayna ve Görüş Hattı','Ayna φ/2 dönünce görüş hattı φ kadar sapar. Bomba koşusunu başlatın: hedef yaklaştıkça φ küçülür.','front',optics,false],
      ['İki İbre Buluşunca','Kırmızı ibre düşüş açısı δ, siyah ibre nişan açısı φ. İkisi buluştuğunda kontak kapanır ve lamba yanar.','breech',dials,false],
      ['Hız Ayarı Hatası','Hız ayarını bozun: turuncu görüş hattı gri gerçek hattan ayrılır ve bırakma erken/geç olur. Iska, dirençsiz serbest düşüşle hesaplanır.','suspension',board,false],
      ['Stabilizatör ve Otomatik Pilot','Alt birimdeki yön jiroskopu ve servo, bağlantı açıkken otomatik pilota yön düzeltmesi verir. Gerçek sistemin isabet başarısı reklamlarda abartılmıştı; hava koşulları ve hız hatası büyük ıskalara yol açardı.','engine',stab,true]
    ].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));
    const ui=K.ui({portraitCameraScale:1.6,shadowExtent:2.5,title:'Norden M-9 — Mekanik Bomba Nişangâhı',sub:'Disk–bilye integratörü • Düşüş açısı • Eğitim panosu',
      subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#a08046'})),
      camLabels:{iso:'Genel',front:'Ayna ve Teleskop',breech:'Göstergeler',engine:'İntegratör',suspension:'Eğitim Panosu',top:'Üst'},
      sliders:[{label:'İrtifa',min:3000,max:9500,step:100,fmt:v=>Math.round(v)+' m'},{label:'Yer Hızı',min:250,max:500,step:5,fmt:v=>Math.round(v)+' km/sa'},{label:'Hız Ayarı Hatası',min:-10,max:10,step:1,fmt:v=>(v>0?'+':'')+Math.round(v)+' %'}],
      buttons:{terrain:'Otomatik Pilot Bağlantısı',sweep:'Kapaklar (X-Ray dışı)',mode:true},telemetryTag:'NORDEN M-9 • DİRENÇSİZ MODEL',statLabels:['DÜŞÜŞ AÇISI δ','NİŞAN AÇISI φ','İNTEGRATÖR r','ISKA']});
    sync();
    const deg=x=>(x*180/Math.PI).toFixed(1);
    return {root,parts:K.parts,ui,camPresets,tourSteps,defaultPart:integ,firePart:dials,update,
      model:{delta,tf,V,Vp,carriageR,state:S},
      onFire:()=>{if(!S.power)return {ok:false,msg:'Güç kapalı: hız motoru ve jiroskoplar çalışmıyor.'};if(S.run){S.run=false;S.impact=false;S.released=false;S.phiSight=S.phiTrue=Math.PI/3;sync();return {ok:true,msg:'Koşu sıfırlandı.'};}startRun();sync();return {ok:true,msg:'Bomba koşusu başladı.'};},
      fireButtonLabel:()=>S.run?'KOŞUYU SIFIRLA':'BOMBA KOŞUSUNU BAŞLAT',mobileFireButtonLabel:()=>S.run?'Sıfırla':'Koşu',
      onSlider:(i,v)=>{if(!Number.isFinite(v))return {};if(S.run)return {msg:'Koşu sırasında ayarlar kilitli.'};S.impact=false;S.released=false;
        if(i===0)S.h=T.MathUtils.clamp(v,3000,9500);if(i===1)S.vKmh=T.MathUtils.clamp(v,250,500);if(i===2)S.err=T.MathUtils.clamp(Math.round(v),-10,10);
        S.phiSight=S.phiTrue=Math.PI/3;sync();return {};},
      onButton:n=>{if(n==='terrain')S.autopilot=!S.autopilot;if(n==='sweep'){S.covers=!S.covers;K.parts.stab.children[0].visible=K.parts.head.children[0].visible=!S.covers;}
        if(n==='mode'){S.power=!S.power;if(!S.power)S.run=false;}sync();return {};},
      buttonActive:n=>n==='terrain'?S.autopilot:n==='sweep'?S.covers:n==='mode'?S.power:false,
      modeLabel:()=>S.power?'Güç: AÇIK (hız motoru + jiroskoplar)':'Güç: KAPALI',
      getSliderValues:()=>[S.h,S.vKmh,S.err],
      getStats:()=>[deg(delta())+' <span>°</span>',deg(S.phiSight)+' <span>°</span>',(carriageR()*1000).toFixed(0)+' <span>mm</span>',S.impact?Math.abs(S.miss).toFixed(0)+' <span>m '+(Math.abs(S.miss)<1?'isabet':S.miss>0?'kısa':'uzun')+'</span>':'— <span>m</span>'],
      getStatus:()=>!S.power?{text:'GÜÇ KAPALI',color:'#6b6f72'}:S.impact?{text:Math.abs(S.miss)<1?'İSABET (DİRENÇSİZ MODEL)':'ISKA • '+Math.abs(S.miss).toFixed(0)+' m',color:Math.abs(S.miss)<1?'#3d7a46':'#b4532a'}:S.released?{text:'BIRAKILDI • BOMBA DÜŞÜYOR',color:'#b4532a'}:S.run?{text:'BOMBA KOŞUSU • AYNA HEDEFİ İZLİYOR',color:'#a08046'}:{text:'HAZIR',color:'#a08046'},
      applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief};
  };
})();

