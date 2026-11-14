(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.corvus = function (ctx) {
    const kit = window.MuseumModelKit(ctx, 'corvus');
    const {T,root,parts,mats,mesh,box,cyl,pipe,beam,instances} = kit;
    const state = {lift:55,turn:0,sail:true,neighbor:true};
    const counts = {};
    const wood = mats.wood;
    const trim = wood.clone();
    trim.color.setHex(0x4b3024);
    const deckWood = wood.clone();
    deckWood.color.setHex(0xa88253);
    const linen = new T.MeshStandardMaterial({color:0xd8be91,roughness:.95,side:T.DoubleSide});
    function part(key,name,sub,desc,exp=[0,.5,0],outer=false) {
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
    function surface(parent,rows,material) {
      const geo=new T.BufferGeometry(), indices=[], n=rows[0].length;
      for(let j=0;j<rows.length-1;j++) for(let i=0;i<n-1;i++) {
        const a=j*n+i;
        indices.push(a,a+n,a+1,a+1,a+n,a+n+1);
      }
      geo.setAttribute('position',new T.Float32BufferAttribute(rows.flat(2),3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      const mat=material.clone();
      mat.side=T.DoubleSide;
      mesh(parent,geo,mat);
    }
    const stations=[[-10,.05],[-9,.71],[-7,1.42],[-4,1.68],[0,1.77],[4,1.69],[7,1.26],[9,.55],[10,.04]];
    const section=(z,w)=>[[-w,2.2,z],[-w*.95,1.63,z],[-w*.64,.95,z],[0,.68+.55*(z/10)**6,z],
      [w*.64,.95,z],[w*.95,1.63,z],[w,2.2,z]];
    const hull=part('hull','Roma Gemisinin Gövdesi','Gemi','Antik kürekli gemi için yaklaşık müze rekonstrüksiyonu.',[0,.22,0],true);
    surface(hull,stations.map(([z,w])=>section(z,w)),wood);
    const ribs=part('ribs','Omurga ve Ahşap Postalar','Gemi','Kabuk altındaki enine ahşap iskelet.');
    for(const [z,w] of stations.slice(1,-1)) pipe(ribs,section(z,w*.95),.055,trim);
    box(ribs,[.15,.16,16],[0,.78,0],trim);
    const deck=part('deck','Boyuna Güverte ve Korkuluklar','Gemi','Tahta kaplama, borda kuşakları ve çalışma alanı.',[0,.7,0],true);
    surface(deck,stations.map(([z,w])=>[[-w,2.20,z],[w,2.20,z]]),deckWood);
    const planks=[];
    for(let z=-7;z<=7;z+=2)for(let x=-1.1;x<=1.1;x+=.15)planks.push({pos:[x,2.21,z]});
    instances(deck,new T.BoxGeometry(.012,.009,1.92),trim,planks);
    for(const side of [-1,1]) {
      for(const y of [1.8,2.24,2.52])pipe(deck,stations.map(([z,w])=>[side*w,y+.25*(z/10)**6,z]),.043,trim);
      for(const [z,w] of stations.slice(1,-1))beam(deck,[side*w,2.19,z],[side*w,2.52,z],.046,trim);
    }
    const oars=part('oars','Kürekler ve Oturaklar','Gemi','İki yanda kürek sıraları. Kürek düzeni temsili.',[.55,0,0]);
    for(let z=-6;z<=6;z+=1) {
      box(oars,[2.53,.075,.23],[0,1.94,z],trim);
      for(const side of [-1,1]){
        beam(oars,[side*.91,2.03,z],[side*3.0,.85,z-.46],.049,wood);
        box(oars,[.62,.056,.16],[side*2.92,.89,z-.44],deckWood,[0,side*.20,-side*.48]);
      }
    }
    const rig=part('rig','Direk, Seren ve Halatlar','Arma','Yelkenin taşındığı direk ve bordalara bağlanan sabit arma.');
    cyl(rig,.086,6.1,[0,5.25,-1.25],trim,'y',.14);
    beam(rig,[-2.95,7.62,-1.25],[2.95,7.62,-1.25],.10,trim);
    for(const x of [-1.6,1.6])beam(rig,[x,2.24,-2.8],[0,7.99,-1.25],.027,trim);
    const clothPart=part('sail','Kavisli Kare Yelken','Arma','Yelken bezi arma görünümü için gizlenebilir.',[0,.6,0],true);
    const cloth=group(clothPart,'sail');
    const sailRows=Array.from({length:13},(_,i)=>Array.from({length:11},(_,j)=>{
      const x=i/6-1, v=j/10;
      return [x*(2.49+.29*v),7.58-3*v+.12*x*x*v,-1.25+.49*Math.sin(Math.PI*v)*(1-.65*x*x)];
    }));
    surface(cloth,sailRows,linen);
    for(const i of [0,3,6,9,12])pipe(cloth,sailRows[i],.014,deckWood);
    const ends=part('ends','Kavisli Baş ve Kıç','Gemi','Baş ve kıç süsleri ile çift dümen küreği dönem yorumudur.');
    for(const side of [-1,1]) {
      pipe(ends,[[side*.48,2.3,-8.5],[side*.30,2.75,-9.6],[side*.09,3.65,-10]],.085,trim);
      beam(ends,[side*.74,2.74,-7.72],[side*1.4,.90,-9],.095,trim);
      box(ends,[.14,.68,.35],[side*1.37,1.03,-8.91],wood,[.2,0,0]);
    }
    pipe(ends,[[0,.98,9],[0,1.63,10.15],[0,2.58,10.1],[0,3.1,9.73]],.13,trim);
    const pillar=part('post','Başta Dikme ve Makara','Corvus','Polybios’un tarifindeki baş dikmesini ve üstteki makarayı yorumlar.');
    const pivotZ=6.3;
    cyl(pillar,.15,3.1,[0,3.76,pivotZ],trim,'y',.19);
    cyl(pillar,.24,.14,[0,2.27,pivotZ],deckWood);
    cyl(pillar,.14,.14,[0,5.34,pivotZ],mats.brass,'x');
    const bridgePart=part('bridge','Tahta Geçiş Köprüsü','Corvus','Mafsallı sergi köprüsü ve iki yan korkuluğu. Geometri yaklaşık bir yorumdur.',[0,.65,.4]);
    const yaw=group(bridgePart,'bridge-yaw',[0,2.53,pivotZ]);
    const hinge=group(yaw,'bridge-hinge');
    for(let i=0;i<22;i++)box(hinge,[1.05,.085,.202],[0,0,.42+i*.203],i%3?deckWood:wood);
    for(const x of [-.46,.46]) {
      box(hinge,[.12,.12,4.65],[x,-.067,2.50],trim);
      box(hinge,[.065,.07,4.54],[x,.38,2.56],trim);
      for(let z=.55;z<4.75;z+=.66)box(hinge,[.05,.39,.05],[x,.20,z],trim);
    }
    const hoist=part('rope','Gergi Halatı','Corvus','Hareket sırasında makara ile köprü arasındaki bağlantıyı gösterir.');
    const rope=cyl(hoist,.027,1,[0,0,0],trim);
    const neighborPart=part('neighbor','İkinci Antik Gemi','Sergi','Aynı dönemin ikinci gemisi, geçiş fikrinin bağlamını gösterir.',[0,0,0]);
    const neighbor=group(neighborPart,'neighbor',[0,0,20.3]);
    surface(neighbor,stations.map(([z,w])=>section(z,w*.84)),trim);
    surface(neighbor,stations.map(([z,w])=>[[-w*.84,2.2,z],[w*.84,2.2,z]]),deckWood);
    for(const x of [-1,1]) {
      pipe(neighbor,stations.map(([z,w])=>[x*w*.83,2.24,z]),.047,deckWood);
      for(let z=-5;z<=5;z+=1.25)beam(neighbor,[x*.9,2.1,z],[x*2.55,.9,z+.45],.048,wood);
    }
    cyl(neighbor,.10,4,[0,4.18,0],trim,'y',.14);
    beam(neighbor,[-2.25,5.97,0],[2.25,5.97,0],.078,trim);
    const stands=part('stands','Müze Kaideleri','Sergi','İki tekneyi su dışında destekleyen sehpa.');
    const secondary=group(stands,'neighbor-stands');
    for(const [parent,offset] of [[stands,0],[secondary,20.3]])for(const z of [-4,4]) {
      box(parent,[2.1,.12,.84],[0,.06,z+offset],mats.dark);
      box(parent,[.55,.54,.62],[0,.39,z+offset],trim);
    }
    const up=new T.Vector3(0,1,0), tip=new T.Vector3(), delta=new T.Vector3(), pulley=new T.Vector3(0,5.34,pivotZ);
    function sync(){
      yaw.rotation.y=state.turn*Math.PI/180;
      hinge.rotation.x=-state.lift*Math.PI/180;
      cloth.visible=state.sail;
      neighbor.visible=secondary.visible=state.neighbor;
      hinge.updateWorldMatrix(true,false);
      tip.set(0,.10,4.83);
      hinge.localToWorld(tip);
      root.worldToLocal(tip);
      delta.copy(tip).sub(pulley);
      rope.position.copy(pulley).addScaledVector(delta,.5);
      rope.scale.y=delta.length();
      rope.quaternion.setFromUnitVectors(up,delta.normalize());
    }
    const camPresets={
      iso:{pos:[47,42,50],look:[0,3.1,10]}, front:{pos:[11,8,18],look:[0,3.1,6.7]},
      breech:{pos:[16,12,-17],look:[0,3,0]},engine:{pos:[12,8,17],look:[0,3.6,8.3]},
      suspension:{pos:[10,11,5],look:[0,4,-1]},top:{pos:[.3,71,10.2],look:[0,2,10]}
    };
    const tourSteps=[
      ['İki antik gemi','Roma ile Kartaca’nın Birinci Pön Savaşı sırasındaki deniz mücadelesi.','iso',hull,false],
      ['Ahşap iskelet','X-Ray ile kaplamanın altında omurgayı ve postaları izleyin.','breech',ribs,true],
      ['Kürek ve yelken','Kürek sıralarını ve kare yelkenin armasını karşılaştırın.','suspension',rig,false],
      ['Baş dikmesi','Polybios, geçiş köprüsünü başta bir dikme ve makarayla tarif eder.','front',pillar,false],
      ['Mafsallı köprü','Sergi kolunu kaldırıp yönünü değiştirin. Halatın iki uçla bağı korunur.','engine',bridgePart,false],
      ['Mylae, MÖ 260','Polybios, geçiş köprülerinin Roma’ya sağladığı üstünlüğü anlatır. İkinci gemi temsili bağlamdır.','top',neighborPart,false]
    ].map(([title,desc,cam,part,cutaway])=>({title,desc,cam,part,cutaway,explode:0,sub:'all'}));
    const ui=kit.ui({
      title:'CORVUS — Roma Geçiş Köprüsü',sub:'Mylae, MÖ 260 • İki antik gemi • Yaklaşık müze rekonstrüksiyonu',
      portraitCameraScale:1.65,fog:{near:110,far:235},shadowExtent:32,
      subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#97744c'})),
      camLabels:{iso:'İki Gemi',front:'Baş Güverte',breech:'Roma Gemisi',engine:'Geçiş Köprüsü',suspension:'Arma',top:'Üst'},
      sliders:[{label:'Sergi Köprüsü Açısı',min:0,max:75,step:1,fmt:v=>v+'°'},
        {label:'Sergi Köprüsü Yönü',min:-30,max:30,step:1,fmt:v=>v+'°'},
        {label:'Yelken Bezi',min:0,max:1,step:1,fmt:v=>v?'Görünür':'Gizli'}],
      buttons:{terrain:'Yelkeni Göster / Gizle',sweep:'Başlangıca Dön'},
      telemetryTag:'CORVUS • BİRİNCİ PÖN SAVAŞI',statLabels:['KÖPRÜ','YÖN','YELKEN','GEMİLER']
    });
    sync();
    return {root,parts,ui,camPresets,tourSteps,defaultPart:hull,firePart:neighborPart,update(){},
      onFire(){state.neighbor=!state.neighbor;sync();return {ok:true};},fireButtonLabel:()=>state.neighbor?'İKİNCİ GEMİYİ GİZLE':'İKİNCİ GEMİYİ GÖSTER',
      mobileFireButtonLabel:()=>state.neighbor?'Tek gemi':'İki gemi',
      onSlider(i,v){if(Number.isFinite(v)){if(i===0)state.lift=T.MathUtils.clamp(v,0,75);if(i===1)state.turn=T.MathUtils.clamp(v,-30,30);if(i===2)state.sail=v>=.5;}sync();return {};},
      onButton(name){if(name==='terrain')state.sail=!state.sail;else Object.assign(state,{lift:55,turn:0,sail:true,neighbor:true});sync();return {};},
      buttonActive:name=>name==='terrain'&&!state.sail,getSliderValues:()=>[state.lift,state.turn,Number(state.sail)],
      getStats:()=>[state.lift+' <span>°</span>',state.turn+' <span>°</span>',state.sail?'Görünür':'Gizli',state.neighbor?'İki gemi':'Tek gemi'],
      getStatus:()=>({text:'MYLAE • MÖ 260',color:'#97744c'}),applyTextures:kit.applyTextures,setTexture:kit.setTexture,toggleRelief:kit.toggleRelief};
  };
})();
