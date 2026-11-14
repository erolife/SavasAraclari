(function () {
  'use strict';
  window.VehicleBuilders=window.VehicleBuilders||{};
  window.VehicleBuilders.kamov=function(ctx) {
    const kit=window.MuseumModelKit(ctx,'kamov');
    const {T,root,parts,mats,mesh,box,cyl,ring,beam,pipe,instances}=kit;
    const state={speed:32,hoist:0,door:0,running:false,phase:0,cowling:false};
    const counts={};
    mats.paint.color.setHex(0xbdc8cb);
    const red=mats.paint.clone();
    red.color.setHex(0xa64839);
    red.userData.paint=false;
    const deckMat=mats.steel.clone();
    deckMat.color.setHex(0x47595e);
    const windowMat=mats.glass.clone();
    windowMat.color.setHex(0x25434f);
    windowMat.opacity=.62;
    const amber=mats.brass.clone();
    amber.color.setHex(0xbe8643);
    function part(key,name,sub,desc,exp=[0,.4,0],outer=false) {
      counts[sub]=(counts[sub]||0)+1;
      return kit.part(key,name,sub,[0,0,0],exp,desc,outer);
    }
    function group(parent,name,pos=[0,0,0]) {
      const g=new T.Group();
      g.name=name;
      g.position.set(...pos);
      parent.add(g);
      return g;
    }
    function loft(parent,rows,material,start=0,end=Math.PI*2,skip=()=>false){
      const vertices=[],idx=[],steps=48;
      for(const [z,x,y,rx,ry] of rows)for(let i=0;i<=steps;i++){
        const a=start+(end-start)*i/steps;
        vertices.push(x+rx*Math.cos(a),y+ry*Math.sin(a),z);
      }
      for(let j=0;j<rows.length-1;j++)for(let i=0;i<steps;i++){
        const a=start+(end-start)*(i+.5)/steps;
        if(skip(j,a))continue;
        const k=j*(steps+1)+i;
        idx.push(k,k+1,k+steps+1,k+1,k+steps+2,k+steps+1);
      }
      const geo=new T.BufferGeometry();
      geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
      geo.setIndex(idx);
      geo.computeVertexNormals();
      const mat=material.clone();
      mat.side=T.DoubleSide;
      return mesh(parent,geo,mat);
    }
    const deck=part('deck','Gemi İniş Güvertesi','Güverte','Gemi üzerinde kullanılan kompakt helikopterin temsili güverte sahnesi.',[0,-.25,0]);
    box(deck,[17,.18,14],[0,.09,0],deckMat);
    ring(deck,4.75,[0,.188,0],mats.white,.027,[Math.PI/2,0,0]);
    for(const x of [-.65,.65])box(deck,[.12,.012,1.7],[x,.19,0],mats.white);
    box(deck,[1.38,.012,.125],[0,.19,0],mats.white);
    const ties=[];
    for(let x=-7.5;x<=7.5;x+=1.5)for(let z=-6;z<=6;z+=1.5)
      ties.push({pos:[x,.187,z],rot:[Math.PI/2,0,0]});
    instances(deck,new T.TorusGeometry(.041,.010,5,10),mats.steel,ties);
    for(const x of [-8.3,8.3]){
      beam(deck,[x,.69,-6.87],[x,.69,6.87],.039,mats.steel);
      for(let z=-6.6;z<7;z+=1.2)beam(deck,[x,.18,z],[x,.69,z],.045,mats.steel);
    }
    for(const x of [-6,-3,0,3,6])box(deck,[.50,.015,.09],[x,.197,-6.65],amber);
    const hull=part('hull','Ka-27PS Kabin Gövdesi','Gövde','Kısa, yan yana pilot koltuklu deniz helikopteri. Arama kurtarma varyantına dayanan yaklaşık dış biçim.',[.4,.2,0],true);
    const rows=[[-2.92,0,1.98,.32,.25],[-2.27,0,2.08,.72,.52],[-1.5,0,2.09,1.07,.89],[-.9,0,2.11,1.14,.99],
      [.92,0,2.11,1.14,.99],[1.65,0,2.09,1.12,.98],[2.42,0,2.03,.97,.89],[3.03,0,1.92,.73,.65],[3.39,0,1.76,.28,.36],[3.52,0,1.74,.03,.07]];
    loft(hull,rows,mats.paint,0,Math.PI*2,(j,a)=>(j===3&&(a<.62||a>Math.PI*2-.62))||(j>=5&&j<=7&&a>.29&&a<Math.PI-.29));
    loft(hull,rows.slice(1,8),red,Math.PI*1.13,Math.PI*1.87);
    const trim=part('trim','Kabin Kaplamaları ve Hava Girişleri','Gövde','Arama kurtarma rengine uyumlu alt kuşak ve dış kapak kenarları.');
    for(const x of [-1,1]){
      pipe(trim,[[x*.82,1.57,-2.1],[x*1.13,1.57,-.9],[x*1.13,1.57,1.21],[x*.83,1.42,2.65]],.045,red);
      pipe(trim,[[x*.78,2.49,-2.17],[x*1.08,2.61,-.96],[x*1.03,2.62,1.25]],.018,mats.steel);
      box(trim,[.048,.21,.69],[x*1.08,1.40,-1.02],red);
      box(trim,[.08,.1,.30],[x*1.13,2.01,1.20],mats.steel);
    }
    const cockpit=part('cockpit','Kokpit ve Ön Camlar','Kabin','Yan yana pilot koltukları, ön konsol ve çerçeveli kabin camları.',[0,.48,.35]);
    loft(cockpit,rows.slice(5,9),windowMat,.29,Math.PI-.29);
    for(const [z,x,y,rx,ry] of rows.slice(5,9))
      pipe(cockpit,Array.from({length:19},(_,i)=>{const a=.29+i*(Math.PI-.58)/18;return [x+(rx+.009)*Math.cos(a),y+(ry+.009)*Math.sin(a),z];}),.028,mats.steel);
    pipe(cockpit,rows.slice(5,9).map(([z,x,y,rx,ry])=>[x,y+ry+.01,z]),.023,mats.steel);
    const seats=part('seats','Koltuk ve Kurtarma Kabini','Kabin','İki ön koltuk ve yan bank. İç yerleşim yaklaşık sergi yorumudur.',[0,.24,0]);
    box(seats,[1.80,.095,4.08],[0,1.43,.43],deckMat);
    for(const x of [-.46,.46]){
      box(seats,[.45,.11,.49],[x,1.63,1.75],mats.rubber);
      box(seats,[.43,.48,.105],[x,1.87,1.54],mats.rubber,[.12,0,0]);
      beam(seats,[x,1.48,2.12],[x,1.77,2.05],.036,mats.dark);
    }
    box(seats,[1.45,.27,.24],[0,1.92,2.51],mats.dark);
    for(const x of [-.78,.78]){
      box(seats,[.27,.10,1.50],[x,1.64,-.33],red);
      box(seats,[.08,.33,1.50],[x*1.12,1.85,-.33],red);
    }
    const entry=part('doors','Sürgülü Kurtarma Kapısı','Kabin','Kabin yanındaki sürgülü kapak geriye alınır.',[.4,.23,0],true);
    const doors=[];
    for(const x of [-1.13,1.13]){
      const g=group(entry,'door-'+Math.sign(x),[x,2.13,.04]);
      doors.push(g);
      box(g,[.084,1.19,1.83],[0,0,0],mats.paint);
      box(g,[.092,.38,.65],[0,.26,.38],windowMat);
      box(g,[.106,.061,.19],[0,-.11,.58],mats.dark);
      box(g,[.10,.14,1.75],[0,-.42,0],red);
      for(const y of [1.55,2.74])beam(entry,[x,y,-2.38],[x,y,1.05],.033,mats.steel);
    }
    const tail=part('tail','Kısa Kuyruk ve İkiz Dikey Yüzey','Gövde','Ka-27 ailesinin kısa kuyruğu ve iki yanında dikey denge yüzeyleri.',[0,.35,-.35]);
    loft(tail,[[-5.62,0,2.48,.16,.16],[-5.14,0,2.48,.32,.25],[-3.78,0,2.33,.49,.30],[-2.48,0,2.18,.69,.38]],mats.paint);
    box(tail,[3.18,.11,.71],[0,2.52,-4.92],mats.paint);
    for(const x of [-1.44,1.44]){
      const fin=kit.polygon(tail,[[-5.55,2.10],[-5.53,3.62],[-4.88,3.62],[-4.40,2.77],[-4.51,2.21]],.12,red);
      fin.rotation.y=-Math.PI/2;
      fin.position.x=x+.06;
      beam(tail,[x,2.70,-5.53],[x,3.60,-5.50],.054,mats.steel);
    }
    const gear=part('gear','Dört Tekerlekli İniş Takımı','Gövde','Ön ve arka tekerlekler gemi güvertesine oturur.',[0,-.29,0]);
    for(const [x,z,r] of [[-.89,2.0,.21],[.89,2.0,.21],[-1.43,-1.25,.29],[1.43,-1.25,.29]]){
      const y=.18+r, inner=x*.69;
      beam(gear,[inner,1.51,z],[x,y,z],.084,mats.steel);
      beam(gear,[inner,1.43,z-.40],[x,y+.15,z],.053,mats.steel);
      cyl(gear,r,.21,[x,y,z],mats.rubber,'x');
      cyl(gear,r*.47,.224,[x,y,z],mats.steel,'x');
      box(gear,[.055,.18,.22],[inner,1.44,z],deckMat);
    }
    const pod=part('pods','Yan Yüzdürme Muhafazaları','Kurtarma','Kabin yanlarında arama kurtarma sürümüne özgü muhafaza siluetleri.',[.45,.18,0]);
    for(const x of [-1.21,1.21]){
      loft(pod,[[-2.24,x,1.62,.04,.04],[-1.92,x,1.62,.25,.26],[-.93,x,1.64,.24,.26],[-.68,x,1.66,.055,.07]],red);
      for(const z of [-1.70,-1.10])ring(pod,.247,[x,1.64,z],mats.steel,.014);
      box(pod,[.23,.15,.26],[x,1.70,-1.04],mats.steel);
    }
    const motor=part('drives','Motor Kaportası Altındaki Kütleler','Rotorlar','Gövde üstündeki iki temsili motor hacmi ve rotor taşıyıcısı.',[.4,.4,0]);
    for(const x of [-.47,.47]){
      cyl(motor,.24,1.48,[x,3.01,-.34],mats.steel,'z');
      cyl(motor,.17,.32,[x,3.02,-1.1],mats.dark,'z');
      for(const z of [-.77,-.43,.01,.29])ring(motor,.247,[x,3.01,z],amber,.016);
    }
    cyl(motor,.45,.21,[0,3.18,-.22],deckMat);
    const cowlingPart=part('cowling','Ayrılabilir Üst Kaporta','Rotorlar','Üst kaporta kaldırıldığında temsili motor ve kolon taşımaları görünür.',[0,.5,0],true);
    const cowling=group(cowlingPart,'cowling');
    loft(cowling,[[-1.46,0,2.82,.35,.18],[-1.04,0,2.98,.73,.32],[-.33,0,3.04,.87,.43],[.56,0,3.04,.75,.34],[1.08,0,2.97,.40,.16]],mats.paint,0,Math.PI);
    for(const x of [-.64,.64])box(cowling,[.21,.13,.47],[x,3.16,.60],deckMat,[.14,0,0]);
    const column=part('column','Ortak Eksen ve İki Göbek','Rotorlar','Üst ve alt rotorların aynı eksende, iki ayrı düzlemde yer almasını gösterir.',[0,.48,0]);
    cyl(column,.18,1.33,[0,3.94,-.20],mats.steel);
    cyl(column,.27,.28,[0,3.45,-.20],deckMat);
    const rotors=[];
    for(const [key,y,color,dir] of [['lower',3.94,deckMat,1],['upper',4.67,mats.dark,-1]]){
      const blades=part(key,key==='upper'?'Üst Üç Palli Rotor':'Alt Üç Palli Rotor','Rotorlar','Sergi animasyonu üst ve alt rotorun ters yönlerde dönmesini gösterir.',[0,.66,0]);
      const rotor=group(blades,key+'-rotor',[0,y,-.20]);
      rotors.push({rotor,dir});
      cyl(rotor,.29,.19,[0,0,0],mats.steel);
      for(let j=0;j<3;j++){
        const arm=group(rotor,'blade-'+j);
        arm.rotation.y=j*Math.PI*2/3;
        cyl(arm,.07,.74,[.42,0,0],mats.steel,'x');
        const blade=kit.polygon(arm,[[.72,-.16],[5.40,-.18],[6.75,-.08],[6.82,.12],[5.5,.19],[.86,.19]],.032,color);
        blade.rotation.x=-Math.PI/2;
        box(arm,[.27,.038,.34],[6.62,.003,0],amber);
        box(arm,[.33,.102,.17],[.73,0,0],deckMat);
      }
    }
    const rescue=part('rescue','Kurtarma Vinci ve Sepet','Kurtarma','Kabin yanında açılan kısa halat ve temsili kurtarma sepeti.',[.45,.25,0]);
    const winchAnchor=new T.Vector3(1.53,2.65,.75);
    box(rescue,[.44,.15,.25],[1.25,2.65,.75],mats.steel);
    cyl(rescue,.12,.225,[1.5,2.67,.75],deckMat,'x');
    const cable=cyl(rescue,.017,1,[winchAnchor.x,winchAnchor.y-.25,winchAnchor.z],mats.dark);
    const basket=group(rescue,'basket',[winchAnchor.x,2.07,winchAnchor.z]);
    ring(basket,.26,[0,.04,0],amber,.026,[Math.PI/2,0,0]);
    ring(basket,.22,[0,-.22,0],amber,.024,[Math.PI/2,0,0]);
    for(let i=0;i<10;i++){
      const a=i*Math.PI/5;
      beam(basket,[.22*Math.cos(a),-.21,.22*Math.sin(a)],[.26*Math.cos(a),.04,.26*Math.sin(a)],.02,amber);
    }
    cyl(basket,.216,.035,[0,-.23,0],deckMat);
    beam(basket,[0,.24,0],[-.22,.04,0],.018,mats.steel);
    beam(basket,[0,.24,0],[.22,.04,0],.018,mats.steel);
    function sync(){
      rotors.forEach(({rotor,dir})=>{rotor.rotation.y=dir*state.phase+(dir<0?.6:0);});
      doors.forEach(door=>{door.position.z=.04-state.door*.014;});
      cowling.position.set(state.cowling?2.8:0,state.cowling?.20:0,0);
      const length=.34+state.hoist*.016;
      cable.scale.y=length;
      cable.position.y=winchAnchor.y-length/2;
      basket.position.y=winchAnchor.y-length-.24;
    }
    const camPresets={
      iso:{pos:[21,15,23],look:[0,2.3,-.4]},front:{pos:[8,6,12],look:[0,2.4,1.25]},
      breech:{pos:[8,6,-10],look:[0,2.4,-3.5]},engine:{pos:[6.5,7,6.8],look:[0,3.8,-.2]},
      suspension:{pos:[6.3,4.2,5],look:[1.20,1.78,.50]},top:{pos:[.2,30,.1],look:[0,2,0]}
    };
    const tourSteps=[
      ['Gemi üstünde arama kurtarma','Ka-27PS, Ka-27 ailesinin denizde arama kurtarma varyantıdır.','iso',hull,false],
      ['Ortak eksen','Üst ve alt göbek arasındaki düşey ayrımı yakından görün.','engine',column,false],
      ['Ters yönlü rotorlar','Üçer palli rotorları yavaş gösterimde birlikte izleyin.','engine',parts.upper,false],
      ['Kısa kuyruk','İki denge yüzeyi ve güverte üzerindeki kompakt gövde.','breech',tail,false],
      ['Kurtarma vinci','Sepeti indirip halat ve kabin açıklığına bakın.','suspension',rescue,false],
      ['Pilot mahalli','Ön camları ve yan yana iki koltuğu inceleyin.','front',cockpit,true]
    ].map(([title,desc,cam,part,cutaway])=>({title,desc,cam,part,cutaway,explode:0,sub:'all'}));
    const ui=kit.ui({
      title:'KAMOV KA-27PS — Gemi Üstü Kurtarma Helikopteri',
      sub:'Eş eksenli çift rotor • Sürgülü kapı • Kurtarma vinci',
      portraitCameraScale:1.55,fog:{near:80,far:170},shadowExtent:15,
      subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#526c74'})),
      camLabels:{iso:'Helikopter ve Güverte',front:'Pilot Mahalli',breech:'Kuyruk',engine:'Rotor Başları',suspension:'Kurtarma Vinci',top:'Üst'},
      sliders:[{label:'Rotor Görsel Hızı',min:0,max:100,step:1,fmt:v=>v+'%'},
        {label:'Kurtarma Sepetini İndir',min:0,max:100,step:1,fmt:v=>v+'%'},
        {label:'Kabin Kapısını Aç',min:0,max:100,step:1,fmt:v=>v+'%'}],
      buttons:{terrain:'Üst Kaportayı Ayır',sweep:'Başlangıca Dön'},
      telemetryTag:'KA-27PS • DENİZDE ARAMA KURTARMA',statLabels:['GÖRSEL HIZ','SEPET','KAPI','ROTOR DÜZENİ']
    });
    sync();
    return {root,parts,ui,camPresets,tourSteps,defaultPart:hull,firePart:column,
      update(dt){if(state.running&&Number.isFinite(dt)){state.phase=(state.phase+T.MathUtils.clamp(dt,0,.05)*state.speed*.067)%(Math.PI*2);sync();}},
      onFire(){state.running=!state.running;return {ok:true};},fireButtonLabel:()=>state.running?'ROTORLARI DURDUR':'ROTORLARI GÖSTER',
      mobileFireButtonLabel:()=>state.running?'Durdur':'Rotorlar',
      onSlider(i,v){const key=['speed','hoist','door'][i];if(key&&Number.isFinite(v))state[key]=T.MathUtils.clamp(v,0,100);sync();return {};},
      onButton(name){if(name==='terrain')state.cowling=!state.cowling;else Object.assign(state,{speed:32,hoist:0,door:0,running:false,phase:0,cowling:false});sync();return {};},
      buttonActive:name=>name==='terrain'&&state.cowling,getSliderValues:()=>[state.speed,state.hoist,state.door],
      getStats:()=>[(state.running?state.speed:0)+' <span>% görsel</span>',state.hoist+' <span>%</span>',state.door+' <span>%</span>','Eş eksenli'],
      getStatus:()=>({text:'KA-27PS • GÜVERTE SERGİSİ',color:'#526c74'}),applyTextures:kit.applyTextures,setTexture:kit.setTexture,toggleRelief:kit.toggleRelief};
  };
})();
