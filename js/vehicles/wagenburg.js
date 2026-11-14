(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.wagenburg = function (ctx) {
    const kit = window.MuseumModelKit(ctx, 'wagenburg');
    const {T, root, parts, mats, mesh, box, beam, cyl, ring, pipe, instances} = kit;
    const oak = mats.wood.clone();
    oak.color.setHex(0xa0835c);
    const trim = mats.wood.clone();
    trim.color.setHex(0x59412d);
    const iron = mats.dark;
    const coverMat = new T.MeshStandardMaterial({color:0x9d8865,roughness:.98,side:T.DoubleSide});
    const state = {side:0, rear:0, gap:30, formation:false, roof:true};
    const counts = {};
    function part(key, name, sub, desc, exp, outer = false) {
      counts[sub] = (counts[sub] || 0) + 1;
      return kit.part(key, name, sub, [0,0,0], exp, desc, outer);
    }
    function group(parent, name, pos = [0,0,0]) {
      const g = new T.Group();
      g.name = name;
      g.position.set(...pos);
      parent.add(g);
      return g;
    }
    const chassis = part('chassis','Ahşap Şasi','Yürüyüş','Yük arabası biçiminden türetilmiş temsili savaş arabası.',[0,-.18,0]);
    for(const x of [-.67,.67]) box(chassis,[.18,.20,3.62],[x,.89,0],trim);
    for(const z of [-1.55,-.65,.65,1.55]) box(chassis,[1.82,.16,.18],[0,.92,z],trim);
    const axles = part('axles','Dingiller ve Demir Bilezikler','Yürüyüş','Dört tekerleği gövdeye bağlayan ön ve arka dingiller.',[0,-.18,0]);
    for(const z of [-1.30,1.25]) {
      cyl(axles,.071,2.35,[0,.60,z],iron,'x');
      for(const x of [-.65,.65]) box(axles,[.22,.37,.25],[x,.72,z],oak);
    }
    const wheels = part('wheels','Dört Telli Tekerlek','Yürüyüş','Ahşap teller, demir çemberler ve göbekler.',[.5,0,0]);
    function wheel(parent,x,z,detail) {
      ring(parent,.552,[x,.60,z],trim,.044,[0,Math.PI/2,0]);
      ring(parent,.585,[x,.60,z],iron,.015,[0,Math.PI/2,0]);
      cyl(parent,.114,.28,[x,.60,z],oak,'x');
      cyl(parent,.061,.305,[x,.60,z],iron,'x');
      const spokes = [];
      for(let i=0;i<12;i++) {
        const a = i*Math.PI/6;
        spokes.push({pos:[x,.60+.33*Math.cos(a),z+.33*Math.sin(a)],rot:[a,0,0]});
      }
      instances(parent,new T.BoxGeometry(.055,.47,.058),oak,spokes);
      if (detail) {
        const pins = spokes.map(({rot:[a]})=>({pos:[x+Math.sign(x)*.15,.60+.08*Math.cos(a),z+.08*Math.sin(a)],rot:[0,0,Math.PI/2]}));
        instances(parent,new T.CylinderGeometry(.012,.012,.013,6),iron,pins);
      }
    }
    for(const x of [-1.05,1.05]) for(const z of [-1.30,1.25]) wheel(wheels,x,z,true);
    const floor = part('floor','Tahta Döşeme','Gövde','Üstten çekilen örtünün altında boyuna döşeme tahtaları görülür.',[0,.24,0]);
    for(let i=0;i<10;i++) box(floor,[.167,.075,3.44],[-.775+i*.172,1.038,0],i%3?oak:mats.wood);
    const front = part('front','Ön Siper ve Çeki Oku','Gövde','Ön ahşap siper ve koşum için çeki oku. Boyutlar sergi yorumudur.',[0,.3,.28]);
    for(let i=0;i<7;i++) box(front,[1.76,.125,.075],[0,1.16+i*.132,1.73],i%3?oak:mats.wood);
    for(const x of [-.67,.67]) {
      box(front,[.085,1.03,.09],[x,1.55,1.78],trim);
      beam(front,[x,.87,1.40],[x*.14,.77,2.65],.081,trim);
    }
    ring(front,.07,[0,.77,2.70],iron,.02,[Math.PI/2,0,0]);
    const posts = part('posts','Köşe Dikmeleri ve Takozlar','Gövde','Yan kapakların üst menteşesini taşıyan ahşap çerçeve.',[.2,.22,0]);
    for(const x of [-.88,.88]) {
      for(const z of [-1.69,0,1.69]) {
        box(posts,[.12,1.34,.14],[x,1.67,z],trim);
        box(posts,[.134,.12,.154],[x,2.30,z],iron);
      }
      box(posts,[.12,.13,3.54],[x,2.27,0],trim);
      box(posts,[.13,.14,3.52],[x,1.16,0],trim);
    }
    const sideParts = part('sides','Menteşeli Yan Paneller','Siper','Yan tahtalar yukarı alınarak iç hacim görünür. Panel biçimi yaklaşık sergi yorumudur.',[.42,.18,0],true);
    const panels = [];
    for(const x of [-.91,.91]) {
      const side = Math.sign(x);
      const panel = group(sideParts,'side-'+side,[x,2.23,0]);
      panels.push({panel,side});
      for(let row=0;row<7;row++) {
        const y = -.08-row*.13;
        const pieces = row === 2 ? [[-1.59,-1.0],[-.83,-.39],[-.22,.22],[.39,.83],[1.0,1.59]] : [[-1.59,1.59]];
        for(const [from,to] of pieces) box(panel,[.075,.124,to-from],[side*.02,y,(from+to)/2],row%3?oak:mats.wood);
      }
      const studs = [];
      for(const z of [-1.43,-.57,.57,1.43]) {
        box(panel,[.024,.88,.058],[side*.068,-.46,z],iron);
        for(const y of [-.16,-.40,-.67,-.87]) studs.push({pos:[side*.087,y,z],rot:[0,0,Math.PI/2]});
        cyl(panel,.035,.17,[0,0,z],iron,'z');
      }
      instances(panel,new T.CylinderGeometry(.018,.018,.018,7),mats.steel,studs);
      pipe(panel,[[side*.078,-.70,-.22],[side*.125,-.74,-.12],[side*.125,-.74,.12],[side*.078,-.70,.22]],.02,iron);
    }
    const tailgate = part('tailgate','Arka Kapak ve Basamak','Siper','Kapak aşağı döner ve dar girişin nasıl açıldığını gösterir.',[0,.2,-.35]);
    const gate = group(tailgate,'tailgate',[0,1.09,-1.72]);
    for(let i=0;i<6;i++) box(gate,[.26,.84,.064],[-.67+i*.268,.42,0],oak);
    for(const x of [-.55,.55]) {box(gate,[.075,.83,.025],[x,.42,-.04],iron);cyl(gate,.039,.19,[x,0,0],iron,'x');}
    box(gate,[1.62,.09,.092],[0,.77,-.035],trim);
    const roof = part('roof','Sökülebilir Örtü','Gövde','Ahşap kemerler ve bez örtü, sergi için ayrı gösterilir.',[0,.48,0],true);
    const cloth = group(roof,'roof-cloth');
    const vertices = [], indices = [];
    for(const z of [-1.55,-.78,0,.78,1.55]) {
      const arch = [];
      for(let i=0;i<=14;i++) {
        const x=i/7-1, y=2.28+.45*(1-x*x);
        vertices.push(x,y,z);
        arch.push([x,y-.035,z]);
      }
      pipe(roof,arch,.03,trim);
    }
    for(let z=0;z<4;z++) for(let i=0;i<14;i++) {
      const a=z*15+i;
      indices.push(a,a+1,a+15,a+1,a+16,a+15);
    }
    const canopy = new T.BufferGeometry();
    canopy.setAttribute('position', new T.Float32BufferAttribute(vertices,3));
    canopy.setIndex(indices);
    canopy.computeVertexNormals();
    mesh(cloth,canopy,coverMat);
    for(const x of [-.94,.94]) pipe(cloth,[[x,2.32,-1.55],[x,2.34,0],[x,2.32,1.55]],.025,trim);
    const fittings = part('fittings','Oturaklar ve Donanım','Gövde','İç oturaklar, sandık ve yedek koşum ipi yaklaşık sergi ayrıntılarıdır.',[0,.35,0]);
    for(const x of [-.60,.60]) {
      box(fittings,[.33,.075,2.30],[x,1.47,0],oak);
      for(const z of [-.9,.9]) box(fittings,[.13,.38,.13],[x,1.26,z],trim);
    }
    box(fittings,[.51,.35,.65],[0,1.25,1.21],mats.wood);
    for(const x of [-.18,.18]) box(fittings,[.046,.365,.67],[x,1.25,1.21],iron);
    ring(fittings,.13,[.55,1.84,1.66],mats.wood,.035);
    const layout = part('layout','Çoklu Araba Sergisi','Düzen','İki ek araba, ortak bir savunma hattı fikrini müze ölçeğinde gösterir.',[0,0,0]);
    const display = group(layout,'line-display');
    box(display,[.22,.025,16],[1.62,.013,0],mats.brass);
    const adjacent = [];
    for(const side of [-1,1]) {
      const cart = group(layout,'neighbor-'+side);
      adjacent.push({cart,side});
      box(cart,[1.71,.19,3.45],[0,.94,0],trim);
      for(const x of [-1.05,1.05]) for(const z of [-1.30,1.25]) wheel(cart,x,z,false);
      for(const z of [-1.30,1.25]) cyl(cart,.07,2.18,[0,.60,z],iron,'x');
      for(const x of [-.87,.87]) {
        for(let j=0;j<7;j++) box(cart,[.075,.112,3.41],[x,1.25+j*.135,0],j%3?oak:mats.wood);
        for(const z of [-1.62,.04,1.62]) box(cart,[.12,1.20,.12],[x,1.71,z],trim);
      }
      for(const z of [-1.71,1.71]) box(cart,[1.72,1.0,.10],[0,1.56,z],oak);
    }
    function sync() {
      panels.forEach(({panel,side})=>{panel.rotation.z=side*state.side*Math.PI/100*.61;});
      gate.rotation.x=-state.rear*Math.PI/200;
      cloth.visible=state.roof;
      display.visible=state.formation;
      adjacent.forEach(({cart,side})=>{
        cart.visible=state.formation;
        cart.position.z=side*(4.59+state.gap*.018);
      });
    }
    const camPresets = {
      iso:{pos:[6.9,4.8,10.2],look:[0,1.13,0]},front:{pos:[4.4,4.1,6.6],look:[0,1.3,1.15]},
      breech:{pos:[3.8,3.2,-5.6],look:[0,1.2,-1.10]},engine:{pos:[5.1,3.1,3.4],look:[0,1.5,0]},
      suspension:{pos:[4.5,2.2,1.9],look:[.5,.7,0]},top:{pos:[.65,30,.02],look:[0,1,0]}
    };
    const tourSteps = [
      ['Hussit savaş arabası','Bohemya’da 15. yüzyılın ilk yarısında kullanılan savaş arabalarının yaklaşık müze yorumu.','iso',chassis,false],
      ['Taşınabilir siper','Yan panelleri kaldırıp dikmelerin ve demir şeritlerin yerlerine bakın.','front',sideParts,false],
      ['Arka giriş','Kapak hareketini ve arabanın iç hacmini inceleyin.','breech',tailgate,false],
      ['Dingil ve tekerlek','Demir çemberli dört telli tekerlek ve göbekler.','suspension',wheels,false],
      ['Örtü ve oturaklar','Örtüyü gizleyerek ahşap kemerleri ve iç yerleşimi görün.','engine',roof,true],
      ['Araba hattı','Araba hattını açın ve üstten bakın. Zemindeki sergi çizgisi arabaların ortak bir siper oluşturmasını anlatır.','top',layout,false]
    ].map(([title,desc,cam,part,cutaway])=>({title,desc,cam,part,cutaway,explode:0,sub:'all'}));
    const ui=kit.ui({
      title:'WAGENBURG — Hussit Savaş Arabası',sub:'15. yüzyıl • Bohemya • Yaklaşık müze rekonstrüksiyonu',
      portraitCameraScale:1.45,subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#97704b'})),
      camLabels:{iso:'Genel',front:'Ön Siper',breech:'Arka Giriş',engine:'İç Hacim',suspension:'Tekerlek',top:'Araba Hattı'},
      sliders:[
        {label:'Yan Paneller',min:0,max:100,step:1,fmt:v=>v+'%'},
        {label:'Arka Kapak',min:0,max:100,step:1,fmt:v=>v+'%'},
        {label:'Sergi Arabalarının Aralığı',min:0,max:100,step:1,fmt:v=>v+'%'}
      ],
      buttons:{terrain:'Örtüyü Göster / Gizle',sweep:'Başlangıca Dön'},
      telemetryTag:'HUSSİT SAVAŞ ARABASI',statLabels:['YAN PANELLER','ARKA KAPAK','ÖRTÜ','SERGİ DÜZENİ']
    });
    sync();
    return {
      root,parts,ui,camPresets,tourSteps,defaultPart:chassis,firePart:layout,update(){},
      onFire(){state.formation=!state.formation;sync();return {ok:true};},
      fireButtonLabel:()=>state.formation?'TEK ARABAYA DÖN':'ARABA HATTINI GÖSTER',
      mobileFireButtonLabel:()=>state.formation?'Tek araba':'Araba hattı',
      onSlider(i,v){const key=['side','rear','gap'][i];if(key&&Number.isFinite(v))state[key]=T.MathUtils.clamp(v,0,100);sync();return {};},
      onButton(name){if(name==='terrain')state.roof=!state.roof;else Object.assign(state,{side:0,rear:0,gap:30,formation:false,roof:true});sync();return {};},
      buttonActive:name=>name==='terrain'&&!state.roof,
      getSliderValues:()=>[state.side,state.rear,state.gap],
      getStats:()=>[state.side+' <span>%</span>',state.rear+' <span>%</span>',state.roof?'Açık':'Gizli',state.formation?'3 araba':'Tek araba'],
      getStatus:()=>({text:'BOHEMYA • 15. YÜZYIL',color:'#97704b'}),
      applyTextures:kit.applyTextures,setTexture:kit.setTexture,toggleRelief:kit.toggleRelief
    };
  };
})();
