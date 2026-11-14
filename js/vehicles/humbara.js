(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.humbara = function (ctx) {
    const kit=window.MuseumModelKit(ctx,'humbara');
    const {T,root,parts,mats,mesh,box,cyl,ring,beam,pipe,instances}=kit;
    const bronze=mats.brass.clone();
    bronze.color.setHex(0x927143);
    const wood=mats.wood;
    const gold=mats.brass.clone();
    gold.color.setHex(0xd0ad65);
    const dark=mats.dark;
    const state={angle:35,front:0,daylight:0,cover:false};
    const counts={};
    function part(key,name,sub,desc,exp=[0,.26,0],outer=false){
      counts[sub]=(counts[sub]||0)+1;
      return kit.part(key,name,sub,[0,0,0],exp,desc,outer);
    }
    function group(parent,name,pos){
      const g=new T.Group();
      g.name=name;
      g.position.set(...pos);
      parent.add(g);
      return g;
    }
    const floor=part('floor','Müze Platformu','Sergi','Ahşap döşeme, havan ve ölçüm sergisini aynı sahnede birleştirir.');
    box(floor,[6.6,.10,4.0],[.65,.05,0],wood);
    const slats=[];
    for(let x=-2.56;x<3.91;x+=.19)slats.push({pos:[x,.102,0]});
    instances(floor,new T.BoxGeometry(.009,.005,3.93),dark,slats);
    const bed=part('bed','Ağır Ahşap Yatak','Havan','Kısa havanın oturduğu kalın destek yatağı. Biçim ve ölçüler temsili.',[0,.18,0]);
    for(const x of [-1.76,-.40])box(bed,[.26,.23,2.55],[x,.224,.06],wood);
    for(const z of [-.91,.95])box(bed,[1.65,.16,.32],[-1.08,.36,z],wood);
    for(const x of [-1.68,-.48]){
      box(bed,[.32,.38,1.85],[x,.59,.05],wood,[.07,0,0]);
      for(const z of [-.59,.58]){
        box(bed,[.354,.045,.10],[x,.79,z],dark);
        cyl(bed,.032,.08,[x,.81,z],gold);
      }
      pipe(bed,[[x,.64,-1],[x,.62,-1.20],[x,.37,-1.20],[x,.34,-.96]],.035,dark);
    }
    const support=part('support','Metal Kuşak ve Dış Destek','Havan','Dış metal bilezikler ve yükü ahşaba dağıtan geniş destek.',[0,.20,0]);
    cyl(support,.12,1.56,[-1.08,.85,.24],dark,'x');
    for(const x of [-1.78,-.38]){
      box(support,[.12,.42,.33],[x,.76,.24],dark);
      cyl(support,.155,.07,[x,.86,.24],bronze,'x');
    }
    const casting=part('casting','Havanın Döküm Gövdesi','Havan','Geniş ağızlı kısa gövde ve dış bilezikler. Sergi yüzeyleri yaklaşık yorumdur.',[0,.34,0]);
    const bronzeModel=group(casting,'mortar-display',[-1.08,.91,.24]);
    bronzeModel.rotation.x=.64;
    const silhouette=[new T.Vector2(0,-.36),new T.Vector2(.28,-.36),new T.Vector2(.35,-.31),
      new T.Vector2(.37,-.25),new T.Vector2(.41,.31),new T.Vector2(.446,.36),new T.Vector2(.447,.46),
      new T.Vector2(.34,.46),new T.Vector2(.34,.37),new T.Vector2(.28,.32),new T.Vector2(0,.32)];
    mesh(bronzeModel,new T.LatheGeometry(silhouette,64),bronze);
    ring(bronzeModel,.366,[0,-.22,0],bronze,.028,[Math.PI/2,0,0]);
    ring(bronzeModel,.429,[0,.35,0],gold,.015,[Math.PI/2,0,0]);
    ring(bronzeModel,.386,[0,.01,0],bronze,.018,[Math.PI/2,0,0]);
    const lifting=part('lifting','Dış Halkalar ve Döküm Bezemesi','Havan','Dış gövde ayrıntılarına odaklanan sergi parçaları.',[.21,.34,0]);
    const handles=group(lifting,'casting-details',[-1.08,.91,.24]);
    handles.rotation.x=.64;
    for(const x of [-.38,.38]){
      ring(handles,.106,[x,.09,0],bronze,.024,[0,Math.PI/2,0]);
      box(handles,[.07,.16,.10],[x*.95,.08,0],bronze);
    }
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      mesh(handles,new T.SphereGeometry(.028,10,8),gold,[.398*Math.cos(a),.22,.398*Math.sin(a)]);
    }
    const cover=part('cover','Koruyucu Müze Örtüsü','Sergi','Sergiyi kapatmak için hafif bir sanal örtü.',[0,.45,0],true);
    const hood=group(cover,'museum-cover',[-1.08,1.08,.24]);
    const fabric=new T.MeshStandardMaterial({color:0x968267,roughness:1,side:T.DoubleSide});
    const fabricGeo=new T.CylinderGeometry(.60,.69,.95,32,1,true,0,Math.PI*2);
    mesh(hood,fabricGeo,fabric,[0,.12,0]);
    cyl(hood,.59,.035,[0,.61,0],wood);
    const table=part('table','Hendese Sergisi Masası','Ölçüm','Rubu tahtasının ayrı bir sergi olarak sunulduğu ahşap masa.',[0,.18,0]);
    box(table,[1.79,.14,1.27],[1.23,.93,.24],wood);
    for(const x of [.53,1.93])for(const z of [-.22,.72])box(table,[.103,.78,.10],[x,.50,z],wood);
    for(const z of [-.22,.72])box(table,[1.47,.075,.06],[1.23,.34,z],wood);
    const board=part('board','Rubu Tahtası · Çeyrek Daire','Ölçüm','Bağımsız ölçüm sergisi. Çeyrek daire ve çekül, açı okuma ilkesini gösterir.',[0,.34,.18]);
    const center=new T.Vector3(1.62,1.91,.28);
    const points=[[0,0]];
    for(let i=0;i<=30;i++){
      const a=i*Math.PI/60;
      points.push([-.80*Math.sin(a),-.80*Math.cos(a)]);
    }
    const quadrant=kit.polygon(board,points,.057,wood);
    quadrant.position.copy(center);
    for(const x of [1.13,1.53])beam(board,[x,1.0,-.12],[x,1.72,.28],.074,wood);
    const ticks=part('marks','Ölçek Çizgileri ve Pirinç Yay','Ölçüm','Kısa ve uzun çizgiler, bir açının ölçek üzerinde nasıl okunduğunu gösterir.',[0,.18,.15]);
    const marks=[];
    for(let i=0;i<=18;i++){
      const a=i*Math.PI/36, radius=i%3?.742:.72;
      marks.push({pos:[center.x-radius*Math.sin(a),center.y-radius*Math.cos(a),.342],rot:[0,0,-a],scale:[1,i%3?.43:1,1]});
    }
    instances(ticks,new T.BoxGeometry(.012,.091,.005),gold,marks);
    for(const r of [.62,.785])pipe(ticks,Array.from({length:25},(_,i)=>{
      const a=i*Math.PI/48;
      return [center.x-r*Math.sin(a),center.y-r*Math.cos(a),.342];
    }),.008,gold);
    const plumb=part('plumb','Ölçüm İpi ve Çekül','Ölçüm','İpin konumu elle değiştirilerek ölçek üzerindeki okuma incelenir.',[0,.32,.19]);
    const line=group(plumb,'plumb',[center.x,center.y,.38]);
    beam(line,[0,0,0],[0,-.81,0],.014,dark);
    cyl(line,.041,.09,[0,-.83,0],gold,'y',.012);
    ring(plumb,.038,[center.x,center.y,.389],gold,.009);
    const book=part('book','Hendese Defteri ve Cetvel','Ölçüm','Geometri talimi bağlamını anlatan temsili defter ve çizim araçları.');
    const paper=mats.white.clone();
    paper.color.setHex(0xddd0ad);
    box(book,[.44,.036,.30],[.70,1.02,.52],dark,[0,.18,0]);
    for(const x of [.59,.79])box(book,[.197,.023,.278],[x,1.048,.52],paper);
    for(const x of [.59,.79])for(let z=.42;z<.63;z+=.040)box(book,[.123,.004,.005],[x,1.064,z],dark);
    box(book,[.42,.018,.03],[1.48,1.02,.70],gold,[0,.34,0]);
    const cards=part('cards','Sergi Levhaları','Sergi','Havan ile ölçüm aracını birbirinden ayıran alçak kaideler.');
    for(const x of [-1.1,1.23]){
      box(cards,[.58,.11,.25],[x,.157,1.48],dark);
      box(cards,[.49,.037,.17],[x,.237,1.48],gold,[.30,0,0]);
    }
    function sync(){
      line.rotation.z=-state.angle*Math.PI/180;
      hood.visible=state.cover;
      quadrant.material.color.copy(wood.color).lerp(gold.color,state.daylight*.003);
      const rotation=state.front*Math.PI/180;
      bronzeModel.rotation.y=handles.rotation.y=rotation;
    }
    const camPresets={
      iso:{pos:[7.7,5.2,8.8],look:[.35,.8,0]},front:{pos:[0,3.0,4.7],look:[-1.08,.9,.25]},
      breech:{pos:[-4,2.55,-3],look:[-1.08,.82,.24]},engine:{pos:[3.5,2.65,3.0],look:[1.35,1.45,.24]},
      suspension:{pos:[-2.4,2.4,2.7],look:[-1.1,.55,.24]},top:{pos:[.4,10,.2],look:[.5,.5,0]}
    };
    const tourSteps=[
      ['Osmanlı humbaracıları','18. yüzyılda Humbaracı Ahmed Paşa, ocak düzeninin ve askerî eğitimin yenilenmesinde rol aldı.','iso',bed,false],
      ['Döküm dış gövde','Kısa namlu biçimini, dış bilezikleri ve bronz yüzeyi inceleyin.','front',casting,false],
      ['Taşıyıcı yatak','Ağır ahşap yatağın ve metal kuşakların dış görünüşü.','suspension',support,false],
      ['Hendese ve talim','Matematik ve geometri, dönemin askerî eğitimindeki yenilikler arasındaydı.','engine',book,false],
      ['Rubu tahtası','Çeyrek daire ölçeği ve çekül ile açı okuma ilkesini inceleyin.','engine',ticks,false],
      ['İki ayrı sergi nesnesi','Rubu tahtası, Osmanlı ölçüm geleneğinin bağımsız bir örneği olarak sunulur.','iso',board,false]
    ].map(([title,desc,cam,part,cutaway])=>({title,desc,cam,part,cutaway,explode:0,sub:'all'}));
    const ui=kit.ui({
      title:'HUMBARA — Osmanlı Havanı ve Hendese Sergisi',sub:'1730’lar • Humbaracı Ahmed Paşa • Yaklaşık müze yorumu',
      portraitCameraScale:1.68,fog:{near:65,far:150},
      subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#987849'})),
      camLabels:{iso:'Tam Sergi',front:'Döküm Gövde',breech:'Arka Görünüş',engine:'Rubu Tahtası',suspension:'Ahşap Yatak',top:'Üst'},
      sliders:[{label:'Rubu Tahtası İpi',min:0,max:90,step:1,fmt:v=>v+'°'},
        {label:'Döküm Dış Yönü',min:-30,max:30,step:1,fmt:v=>v+'°'},
        {label:'Tahta Tonu',min:0,max:100,step:1,fmt:v=>v+'%'}],
      buttons:{terrain:'Müze Örtüsünü Göster / Gizle',sweep:'Başlangıca Dön'},
      telemetryTag:'HUMBARA • 18. YÜZYIL',statLabels:['ÖLÇÜM İPİ','DIŞ GÖRÜNÜM','TAHTA TONU','ÖRTÜ']
    });
    sync();
    return {root,parts,ui,camPresets,tourSteps,defaultPart:casting,firePart:board,update(){},
      onFire(){state.cover=!state.cover;sync();return {ok:true};},fireButtonLabel:()=>state.cover?'SERGİYİ AÇ':'SERGİYİ ÖRT',
      mobileFireButtonLabel:()=>state.cover?'Aç':'Örtü',
      onSlider(i,v){if(Number.isFinite(v)){if(i===0)state.angle=T.MathUtils.clamp(v,0,90);if(i===1)state.front=T.MathUtils.clamp(v,-30,30);if(i===2)state.daylight=T.MathUtils.clamp(v,0,100);}sync();return {};},
      onButton(name){if(name==='terrain')state.cover=!state.cover;else Object.assign(state,{angle:35,front:0,daylight:0,cover:false});sync();return {};},
      buttonActive:name=>name==='terrain'&&state.cover,getSliderValues:()=>[state.angle,state.front,state.daylight],
      getStats:()=>[state.angle+' <span>°</span>',state.front+' <span>°</span>',state.daylight+' <span>%</span>',state.cover?'Örtülü':'Açık'],
      getStatus:()=>({text:'OSMANLI • HENDESE VE TALİM',color:'#987849'}),
      applyTextures:kit.applyTextures,setTexture:kit.setTexture,toggleRelief:kit.toggleRelief};
  };
})();
