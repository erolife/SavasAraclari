(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.jumo004 = function (ctx) {
    const kit = window.MuseumModelKit(ctx, 'jumo004');
    const {T,root,parts,mats,mesh,box,cyl,ring,pipe,beam,instances} = kit;
    mats.paint.color.setHex(0x65716a);
    const trim=mats.paint.clone();
    trim.color.setHex(0x4c554b);
    const alloy=mats.steel.clone();
    alloy.color.setHex(0x9ca9ac);
    const warm=mats.brass.clone();
    warm.color.setHex(0x95816e);
    const state={speed:30,cover:0,needle:0,running:false,phase:0,canopy:false};
    const counts={};
    function part(key,name,sub,desc,exp,outer=false){
      counts[sub]=(counts[sub]||0)+1;
      return kit.part(key,name,sub,[0,0,0],exp,desc,outer);
    }
    function group(parent,name,pos=[0,0,0]){
      const g=new T.Group();
      g.name=name;
      g.position.set(...pos);
      parent.add(g);
      return g;
    }
    function loft(parent,rows,material,start=0,end=Math.PI*2,skip=()=>false){
      const vertices=[],triangles=[],steps=48;
      for(const [z,x,y,rx,ry] of rows) for(let i=0;i<=steps;i++){
        const a=start+(end-start)*i/steps;
        vertices.push(x+Math.cos(a)*rx,y+Math.sin(a)*ry,z);
      }
      for(let j=0;j<rows.length-1;j++) for(let i=0;i<steps;i++){
        const angle=start+(end-start)*(i+.5)/steps;
        if(skip(j,angle))continue;
        const a=j*(steps+1)+i;
        triangles.push(a,a+1,a+steps+1,a+1,a+steps+2,a+steps+1);
      }
      const geometry=new T.BufferGeometry();
      geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
      geometry.setIndex(triangles);
      geometry.computeVertexNormals();
      const materialCopy=material.clone();
      materialCopy.side=T.DoubleSide;
      return mesh(parent,geometry,materialCopy);
    }
    function wing(parent,sections,material){
      const vertices=[],indices=[],steps=24;
      for(const [x,leading,trailing,y,thickness] of sections)for(let i=0;i<=steps;i++){
        const theta=i*Math.PI*2/steps;
        const chord=(1-Math.cos(theta))/2;
        vertices.push(x,y+Math.sin(theta)*thickness*(1-.45*chord),T.MathUtils.lerp(leading,trailing,chord));
      }
      for(let j=0;j<sections.length-1;j++)for(let i=0;i<steps;i++){
        const a=j*(steps+1)+i;
        indices.push(a,a+1,a+steps+1,a+1,a+steps+2,a+steps+1);
      }
      const geo=new T.BufferGeometry();
      geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      const m=material.clone();
      m.side=T.DoubleSide;
      mesh(parent,geo,m);
    }
    const fuselage=part('fuselage','Me 262 A-1a Gövdesi','Uçak','Yaklaşık dış oranlar Smithsonian koleksiyonundaki Me 262’ye dayanır.',[0,.4,0],true);
    const body=[[-6.05,0,1.96,.055,.13],[-5.3,0,1.81,.21,.28],[-4.25,0,1.65,.46,.40],[-2.9,0,1.57,.63,.57],
      [-1.3,0,1.56,.74,.73],[.25,0,1.60,.78,.78],[1.60,0,1.62,.72,.70],[2.73,0,1.63,.70,.62],
      [4.45,0,1.55,.64,.54],[5.45,0,1.48,.47,.38],[6.05,0,1.47,.035,.04]];
    loft(fuselage,body,mats.paint,0,Math.PI*2,(j,a)=>j>=4&&j<=6&&a>.68&&a<Math.PI-.68);
    const wings=part('wings','Alçak Kanatlar ve Kanatçıklar','Uçak','İki motor gondolunu taşıyan geriye süpürülmüş kanat biçimi.',[.55,.18,0],true);
    for(const side of [-1,1]){
      wing(wings,[[side*.51,2.03,-2.17,1.47,.23],[side*2.05,1.51,-2,1.49,.22],[side*3.35,1.01,-1.9,1.52,.14],[side*5.86,-.17,-1.64,1.65,.065],[side*6.25,-.56,-1.35,1.67,.005]],mats.paint);
      pipe(wings,[[side*.8,1.55,-1.62],[side*3.1,1.60,-1.48],[side*6.10,1.69,-1.36]],.018,trim);
      pipe(wings,[[side*2.5,1.58,1.14],[side*4.6,1.69,.27],[side*6.08,1.69,-.41]],.014,alloy);
      box(wings,[.105,.055,.08],[side*6.10,1.70,-.81],side<0?mats.red:mats.glass);
    }
    const tail=part('tail','Dikey Kuyruk ve Yatay Stabilizeler','Uçak','Kuyruk silueti, hareketli yüzey çizgileri ve uç bağlantıları.',[0,.5,-.4]);
    const fin=kit.polygon(tail,[[-6.03,1.96],[-5.68,3.46],[-4.72,3.74],[-4.19,3.65],[-4.17,3.03],[-3.19,2.05]],.115,trim);
    fin.rotation.y=-Math.PI/2;
    fin.position.x=.057;
    for(const side of [-1,1]){
      wing(tail,[[side*.06,-3.72,-5.81,2.93,.08],[side*1.3,-4.27,-5.83,2.94,.066],[side*2.08,-4.88,-5.71,2.97,.008]],mats.paint);
      pipe(tail,[[side*.10,2.99,-5.26],[side*1.2,2.99,-5.39],[side*1.97,2.99,-5.57]],.014,trim);
    }
    const cockpit=part('cockpit','Pilot Mahalli','Kokpit','Koltuk, gösterge paneli ve ayak alanı görsel rekonstrüksiyondur.',[0,.55,0]);
    box(cockpit,[1.03,.08,2.65],[0,1.97,.70],mats.dark);
    box(cockpit,[.54,.15,.52],[0,2.10,.60],trim);
    box(cockpit,[.53,.43,.11],[0,2.24,.31],mats.dark,[.17,0,0]);
    box(cockpit,[.92,.22,.11],[0,2.15,1.91],mats.dark);
    for(const x of [-.31,-.10,.11,.34]){
      cyl(cockpit,.057,.024,[x,2.18,1.847],alloy,'z');
      cyl(cockpit,.041,.024,[x,2.18,1.826],mats.dark,'z');
    }
    beam(cockpit,[0,2.02,1.15],[0,2.35,1.05],.045,mats.steel);
    const glass=part('canopy','Kokpit Camı ve Çerçevesi','Kokpit','Kaldırma hareketi kokpite bakmak için sergi amaçlıdır.',[0,.65,0],true);
    const canopy=group(glass,'canopy');
    const canopyRows=[[-1.30,0,2.05,.54,.06],[-.31,0,2.07,.60,.48],[.83,0,2.11,.57,.50],[1.63,0,2.10,.55,.38],[2.72,0,2.09,.51,.025]];
    loft(canopy,canopyRows,mats.glass,0,Math.PI);
    for(const [z,x,y,rx,ry] of canopyRows){
      pipe(canopy,Array.from({length:17},(_,i)=>[x+rx*Math.cos(i*Math.PI/16),y+ry*Math.sin(i*Math.PI/16),z]),.024,trim);
    }
    for(const side of [-1,1])pipe(canopy,canopyRows.map(([z,x,y,rx])=>[side*rx,y,z]),.021,trim);
    const gear=part('gear','Üç Tekerlekli İniş Takımı','Uçak','Burun tekerleği ve iki ana takım uçağı sergi zemininde taşır.',[0,-.35,0]);
    for(const [x,z,r] of [[0,3.51,.24],[-1.82,-.83,.36],[1.82,-.83,.36]]){
      beam(gear,[x,1.39,z-.18],[x,r,z],.078,alloy);
      beam(gear,[x,1.15,z-.74],[x,r+.1,z-.09],.035,mats.steel);
      cyl(gear,r,.22,[x,r,z],mats.rubber,'x');
      cyl(gear,.13,.235,[x,r,z],alloy,'x');
      box(gear,[.14,.8,.58],[x+.16,.93,z-.19],mats.paint);
    }
    const paint=part('panels','Kapak Çizgileri ve Burun','Uçak','Gövde kapakları ve paneller seçilmiş görsel ayrıntılardır.',[0,.4,.2]);
    for(const side of [-1,1]){
      pipe(paint,[[side*.11,1.56,6],[side*.49,1.76,5.2],[side*.64,1.93,4.4],[side*.71,1.98,2.7]],.014,trim);
      box(paint,[.07,.13,.92],[side*.70,1.74,3.6],trim,[0,side*.08,0]);
      pipe(paint,[[side*.73,1.69,-.8],[side*.61,1.77,-2.7],[side*.34,1.89,-4.7]],.014,trim);
    }

    const covers=[], rotors=[], needles=[];
    for(const side of [-1,1]){
      const label=side<0?'Sol':'Sağ';
      const x=side*2.45, y=1.20;
      const shell=part('shell'+side,label+' Gondol Alt Kabuğu','Motor Kabuğu','Kanat altındaki Jumo 004 gondolunun alt yarısı.',[side*.5,-.20,0],true);
      const hood=part('hood'+side,label+' Gondol Üst Kabuğu','Motor Kabuğu','Kaldırıldığında kompresör, yanma odaları ve türbin görülür.',[side*.4,.6,0],true);
      const cover=group(hood,'cover-'+side);
      covers.push({cover,side});
      const cowling=[[-3.72,x,y,.23,.24],[-3.14,x,y,.31,.33],[-2.57,x,y,.43,.44],[-1.1,x,y,.55,.56],[.30,x,y,.55,.54],[1.55,x,y,.52,.50],[2.37,x,y,.45,.43],[2.78,x,y,.30,.30]];
      loft(shell,cowling,mats.paint,Math.PI,Math.PI*2);
      loft(cover,cowling,mats.paint,0,Math.PI);
      const intake=part('intake'+side,label+' Giriş ve Marş Göbeği','Motor İç Yapısı','Halka biçimli hava girişi ve burundaki marş göbeğinin dış görünüşü.',[side*.27,.2,.35]);
      ring(intake,.29,[x,y,2.78],alloy,.029);
      cyl(intake,.08,.54,[x,y,2.57],warm,'z',.145);
      for(let j=0;j<4;j++){
        const a=j*Math.PI/2;
        beam(intake,[x+.12*Math.cos(a),y+.12*Math.sin(a),2.59],[x+.26*Math.cos(a),y+.26*Math.sin(a),2.56],.025,alloy);
      }
      const core=part('compressor'+side,label+' Sekiz Kademeli Kompresör','Motor İç Yapısı','Sekiz sıra temsili rotor kanadı ve ayrı sabit sıralar. Katalogdaki J79 ve J58 kesitleri, bu erken turbojetle kuşak karşılaştırması sunar.',[side*.36,.45,.32]);
      const rotor=group(core,'compressor-'+side,[x,y,0]);
      rotors.push(rotor);
      cyl(rotor,.055,4.5,[0,0,-.23],mats.steel,'z');
      const blades=[], stators=[];
      for(let j=0;j<8;j++){
        const z=2.14-j*.25, radius=.26+j*.010;
        cyl(rotor,radius*.63,.065,[0,0,z],alloy,'z');
        for(let k=0;k<19;k++){
          const a=k*Math.PI*2/19;
          blades.push({pos:[Math.sin(a)*radius*.79,Math.cos(a)*radius*.79,z],rot:[.28,0,-a]});
          stators.push({pos:[x+Math.sin(a+.04)*radius*.97,y+Math.cos(a+.04)*radius*.97,z-.11],rot:[-.24,0,-a]});
        }
      }
      instances(rotor,new T.BoxGeometry(.036,.127,.045),alloy,blades);
      instances(core,new T.BoxGeometry(.026,.083,.048),mats.steel,stators);
      const burn=part('combustion'+side,label+' Altı Yanma Odası','Motor İç Yapısı','Altı çevresel yanma odası, renklendirilmiş dış gövdeyle gösterilir.',[side*.4,.4,0]);
      for(let i=0;i<6;i++){
        const a=i*Math.PI/3, px=x+.27*Math.cos(a),py=y+.27*Math.sin(a);
        cyl(burn,.14,1.18,[px,py,-.68],warm,'z');
        for(const z of [-1.21,-.14])ring(burn,.13,[px,py,z],mats.steel,.014);
        pipe(burn,[[px,py,-.10],[px+.05*Math.cos(a),py+.05*Math.sin(a),.05],[px,py,.26]],.025,mats.steel);
      }
      const turbine=part('turbine'+side,label+' Türbin Çarkı ve Egzoz','Motor İç Yapısı','Tek türbin çarkı, kompresörle aynı sergi miline bağlıdır.',[side*.4,.45,-.45]);
      const wheel=group(turbine,'turbine-'+side,[x,y,-1.66]);
      rotors.push(wheel);
      cyl(wheel,.23,.13,[0,0,0],warm,'z');
      instances(wheel,new T.BoxGeometry(.052,.16,.09),warm,Array.from({length:24},(_,i)=>{
        const a=i*Math.PI/12;
        return {pos:[.28*Math.sin(a),.28*Math.cos(a),0],rot:[.30,0,-a]};
      }));
      ring(turbine,.27,[x,y,-3.68],alloy,.027);
      const nozzle=part('nozzle'+side,label+' Hareketli Egzoz Merkezi','Motor İç Yapısı','Soğan biçimli egzoz merkezi, değişken açıklık ilkesini sergi hareketiyle gösterir.',[side*.3,.3,-.42]);
      const needle=group(nozzle,'needle-'+side,[x,y,-3.2]);
      needles.push(needle);
      loft(needle,[[-.63,0,0,.016,.016],[-.36,0,0,.13,.13],[0,0,0,.19,.19],[.32,0,0,.11,.11],[.70,0,0,.045,.045]],warm);
    }
    function sync(){
      covers.forEach(({cover,side})=>cover.position.set(side*.60*state.cover/100,1.1*state.cover/100,0));
      rotors.forEach(rotor=>{rotor.rotation.z=state.phase;});
      needles.forEach(needle=>{needle.position.z=-3.20-.23*state.needle/100;});
      canopy.position.y=state.canopy?.77:0;
    }
    const camPresets={
      iso:{pos:[16,11,18],look:[0,1.8,0]},front:{pos:[7,4.6,8.4],look:[1.5,1.4,2]},
      breech:{pos:[7.8,5.3,-9.8],look:[1.4,1.4,-2.5]},engine:{pos:[10.3,7.6,5.7],look:[2.0,1.4,-.35]},
      suspension:{pos:[4.9,5.6,5.3],look:[0,2.2,.55]},top:{pos:[.1,24,.1],look:[0,1.3,0]}
    };
    const tourSteps=[
      ['Me 262 ve jet çağı','Me 262 A-1a’nın çift motorlu, alçak kanatlı dış görünüşü.','iso',fuselage,false],
      ['Hava girişi','Gondol girişindeki merkez göbeği ve çevresindeki halka biçimli açıklığı görün.','front',parts.intake1,false],
      ['Sekiz kompresör kademesi','X-Ray ile hareketli rotor ve sabit kanat sıralarını izleyin.','engine',parts.compressor1,true],
      ['Altı yanma odası','Odaların motor ekseni etrafındaki dizilimini inceleyin.','engine',parts.combustion1,true],
      ['Türbin ve egzoz','Türbin kompresörle birlikte döner. Egzoz merkezinin konumu elle değiştirilebilir.','breech',parts.nozzle1,true],
      ['Pilot mahalli','Kanopiyi kaldırarak tek kişilik kokpiti inceleyin.','suspension',cockpit,false]
    ].map(([title,desc,cam,part,cutaway])=>({title,desc,cam,part,cutaway,explode:0,sub:'all'}));
    const ui=kit.ui({
      title:'ME 262 — Jumo 004 Motor Kesiti',sub:'Çift turbojet • Sekiz kompresör kademesi • Yaklaşık müze rekonstrüksiyonu',
      portraitCameraScale:1.58,fog:{near:65,far:145},subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#64736b'})),
      camLabels:{iso:'Tam Uçak',front:'Giriş',breech:'Türbin ve Egzoz',engine:'Jumo 004 Kesiti',suspension:'Kokpit',top:'Üst'},
      sliders:[{label:'Rotor Görsel Hızı',min:0,max:100,step:1,fmt:v=>v+'%'},
        {label:'Üst Gondol Kabuğu',min:0,max:100,step:1,fmt:v=>v+'%'},
        {label:'Egzoz Merkezi (sergi)',min:0,max:100,step:1,fmt:v=>v+'%'}],
      buttons:{terrain:'Kanopiyi Kaldır',sweep:'Başlangıca Dön'},
      telemetryTag:'JUMO 004 • JET ÇAĞINA GEÇİŞ',statLabels:['GÖRSEL HIZ','MOTOR KABUĞU','EGZOZ MERKEZİ','DÜZEN']
    });
    sync();
    return {
      root,parts,ui,camPresets,tourSteps,defaultPart:fuselage,firePart:parts.compressor1,
      update(dt){if(state.running&&Number.isFinite(dt)){state.phase=(state.phase+T.MathUtils.clamp(dt,0,.05)*state.speed*.055)%(Math.PI*2);sync();}},
      onFire(){state.running=!state.running;return {ok:true};},
      fireButtonLabel:()=>state.running?'ROTORLARI DURDUR':'ROTORLARI GÖSTER',
      mobileFireButtonLabel:()=>state.running?'Durdur':'Rotorlar',
      onSlider(i,v){const key=['speed','cover','needle'][i];if(key&&Number.isFinite(v))state[key]=T.MathUtils.clamp(v,0,100);sync();return {};},
      onButton(name){if(name==='terrain')state.canopy=!state.canopy;else Object.assign(state,{speed:30,cover:0,needle:0,running:false,phase:0,canopy:false});sync();return {};},
      buttonActive:name=>name==='terrain'&&state.canopy,
      getSliderValues:()=>[state.speed,state.cover,state.needle],
      getStats:()=>[(state.running?state.speed:0)+' <span>% görsel</span>',state.cover+' <span>%</span>',state.needle+' <span>%</span>','2 <span>Jumo 004</span>'],
      getStatus:()=>({text:'ME 262 A-1a • ÇİFT TURBOJET',color:'#64736b'}),
      applyTextures:kit.applyTextures,setTexture:kit.setTexture,toggleRelief:kit.toggleRelief
    };
  };
})();
