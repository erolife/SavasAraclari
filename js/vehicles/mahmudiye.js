(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.mahmudiye = function (ctx) {
    const kit = window.MuseumModelKit(ctx, 'mahmudiye');
    const {T, root, parts, mats, mesh, box, cyl, pipe, beam, instances} = kit;
    const darkWood = mats.wood.clone();
    darkWood.color.setHex(0x3e2920);
    const ochre = mats.brass.clone();
    ochre.color.setHex(0xbc9657);
    const copper = mats.red.clone();
    copper.color.setHex(0x64523c);
    const canvas = new T.MeshStandardMaterial({color: 0xd6c09b, roughness: .96, side: T.DoubleSide});
    const cord = mats.wood.clone();
    cord.color.setHex(0x403528);
    const state = {ports: [65, 65, 65], section: false, canvas: true};
    const counts = {};
    function part(key, name, sub, desc, exp, outer = false) {
      counts[sub] = (counts[sub] || 0) + 1;
      return kit.part(key, name, sub, [0, 0, 0], exp, desc, outer);
    }
    function group(parent, name, position) {
      const g = new T.Group();
      g.name = name;
      g.position.set(...position);
      parent.add(g);
      return g;
    }
    function skin(parent, rows, material, strips = [rows]) {
      const count = rows[0].length;
      const vertices = [];
      const indices = [];
      for (const strip of strips) {
      const offset = vertices.length / 3;
      vertices.push(...strip.flat(2));
      for (let i = 0; i < strip.length - 1; i++) {
        for (let j = 0; j < count - 1; j++) {
          const a = offset + i * count + j;
          indices.push(a, a + count, a + 1, a + 1, a + count, a + count + 1);
        }
      }
      }
      const geometry = new T.BufferGeometry();
      geometry.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      const bothSides = material.clone();
      bothSides.side = T.DoubleSide;
      return mesh(parent, geometry, bothSides);
    }

    const stations = [[-14, .83], [-13, 2.2], [-11, 3.3], [-7, 3.65], [0, 3.77],
      [6, 3.62], [10, 3.0], [12, 1.95], [14, .08]];
    const widthCurve = new T.SplineCurve(stations.map(([z,w]) => new T.Vector2(z,w)));
    function width(z) {
      let i = 1;
      while (i < stations.length - 1 && z > stations[i][0]) i++;
      const [a, b] = [stations[i - 1], stations[i]];
      const t = T.MathUtils.clamp((z - a[0]) / (b[0] - a[0]), 0, 1);
      return widthCurve.getPoint((i - 1 + t) / (stations.length - 1)).y;
    }
    function sheer(z) { return .45 * (z / 14) ** 4; }
    const levels = [2.15, 2.94, 3.73];
    const section = [];
    const lids = [[], [], []];
    const keel = part('keel', 'Karina ve Omurga', 'Tekne', 'Ahşap savaş gemisinin dolgun karinası ve uzun omurgası.', [0,-.4,0], true);
    const slices = Array.from({length: 57}, (_, i) => i / 2 - 14);
    skin(keel, slices.map(z => {
      const w = width(z);
      const low = .53 + .79 * (z / 14) ** 6;
      return [[-w,1.98,z], [-w*.78,low+.46,z], [-w*.39,low+.12,z], [0,low,z],
        [w*.39,low+.12,z], [w*.78,low+.46,z], [w,1.98,z]];
    }), copper);
    box(keel,[.14,.13,22],[0,.56,0],darkWood);

    const frame = part('frame', 'Postalar ve Kemereler', 'Tekne', 'Gövdenin biçimini kuran enine ahşap iskelet ve güverte taşıyıcıları.', [0,.3,0]);
    for (let z = -12; z <= 12; z += 1.5) {
      const w = width(z) - .10;
      for (const side of [-1, 1]) {
        pipe(frame, [[0,.70,z],[side*w*.62,.98,z],[side*w,2,z],[side*w*.94,4.28,z]], .042, mats.wood);
      }
      for (const y of levels) box(frame, [2*w,.075,.09], [0,y-.055,z], darkWood);
    }
    const lining = part('decks', 'Üç Top Güvertesi', 'Güverteler', 'Alt, orta ve üst güvertelerin yaklaşık sergi yerleşimi.', [0,.65,0], true);
    const deckPlanks = [];
    levels.forEach(y => {
      skin(lining, slices.map(z => [[-width(z)*.95,y,z],[width(z)*.95,y,z]]), mats.wood);
      for (const z of slices.filter(z => z % 2 === 0 && Math.abs(z) < 13)) {
        for(let x = -2.9; x <= 2.9; x += .19) {
          if (Math.abs(x) < Math.min(width(z-1),width(z+1)) * .92) deckPlanks.push({pos:[x,y+.006,z]});
        }
      }
    });
    instances(lining, new T.BoxGeometry(.009,.008,1.94), darkWood, deckPlanks);

    for (const side of [-1, 1]) {
      const wall = part(side === 1 ? 'starboard' : 'port', side === 1 ? 'Sancak Bordası' : 'İskele Bordası', 'Tekne',
        'Koyu ahşap bordada gerçek geometri açıklıkları ve sarı kuşaklar.', [side*.8,0,0], true);
      const shell = group(wall, 'side-' + side, [0,0,0]);
      if (side === 1) section.push(shell);
      const strips = new Map([[ochre, []], [darkWood, []]]);
      levels.forEach((y, row) => {
        const gunPart = part('battery'+side+'_'+row, ['Alt','Orta','Üst'][row]+' Güverte · '+(side<0?'İskele':'Sancak'),
          'Lombarlar', 'Açılır lombar kapakları ve yaklaşık tarihî donanım siluetleri.', [side*.2,.18,0]);
        const battery = group(gunPart, 'ports-'+side+'-'+row, [0,0,0]);
        const frames = [], silhouettes = [], trucks = [];
        const ports = Array.from({length: 16}, (_, i) => (i - 7.5) * 1.46);
        function face(bottom, top, from, to, mat) {
          const points = [from, ...slices.filter(z => z > from && z < to), to];
          strips.get(mat).push(points.map(z => {
            const x = side * width(z) * (1-row*.022);
            return [[x,bottom+sheer(z),z],[x,top+sheer(z),z]];
          }));
        }
        face(row ? y-.18 : 1.98, y+.21, -14,14,darkWood);
        face(y+.62,y+.68,-14,14,ochre);
        const last = row === 2;
        if (last) face(y+.68,y+.91,-14,14,darkWood);
        let previous = -14;
        for (const z of ports) {
          face(y+.21,y+.62,previous,z-.26,ochre);
          previous = z+.26;
          const x = side*width(z)*(1-row*.022);
          const top = y+.62+sheer(z);
          const hatch = group(battery, 'hatch-'+side+'-'+row+'-'+z, [x+side*.025,top,z]);
          box(hatch,[.045,.402,.50],[0,-.202,0],darkWood);
          lids[row].push({hatch,side});
          for (const dz of [-.27,.27]) frames.push({pos:[x,y+.42+sheer(z),z+dz]});
          silhouettes.push({pos:[x-side*.43,y+.38+sheer(z),z],rot:[0,0,Math.PI/2]});
          trucks.push({pos:[x-side*.62,y+.14+sheer(z),z]});
        }
        face(y+.21,y+.62,previous,14,ochre);
        instances(battery,new T.BoxGeometry(.075,.43,.035),darkWood,frames);
        instances(battery,new T.CylinderGeometry(.052,.078,.85,12),mats.dark,silhouettes);
        instances(battery,new T.BoxGeometry(.50,.20,.27),mats.wood,trucks);
        if(side===1) section.push(battery);
      });
      for (const [material, rows] of strips) skin(shell, rows[0], material, rows);
    }
    const stern = part('stern','Kıç Aynası ve Galeriler','Tekne','Süslemeli kıç aynası, pencereler ve galeri kuşakları temsili yorumdur.',[0,.2,-.6]);
    for(let i=0;i<3;i++) {
      const y=2.3+i*.67, z=-13.64-i*.08;
      box(stern,[2.68,.62,.16],[0,y,z],darkWood);
      box(stern,[2.87,.085,.24],[0,y-.30,z],ochre);
      for(let j=-3;j<=3;j++) {
        box(stern,[.24,.34,.025],[j*.34,y,z-.087],ochre);
        box(stern,[.174,.26,.027],[j*.34,y,z-.105],mats.glass);
        box(stern,[.014,.26,.03],[j*.34,y,z-.12],ochre);
      }
    }
    const upper = part('upper','Üst Güverte Donanımı','Güverteler','Irgat, açık ızgaralar, korkuluklar ve kıç seyir mahalli.',[0,.65,0],true);
    skin(upper,slices.map(z=>[[-width(z)*.96,4.43+sheer(z),z],[width(z)*.96,4.43+sheer(z),z]]),mats.wood);
    for(const side of [-1,1]) pipe(upper,slices.map(z=>[side*width(z)*.98,4.66+sheer(z),z]),.052,darkWood);
    const grating = [];
    for(const z of [-8,-2,5,9]) {
      box(upper,[1.7,.10,1.1],[0,4.48+sheer(z),z],darkWood);
      for(let x=-.75;x<=.75;x+=.15) grating.push({pos:[x,4.56+sheer(z),z]});
    }
    instances(upper, new T.BoxGeometry(.035,.04,1.02), ochre, grating);
    cyl(upper,.29,.43,[0,4.68,10.1],darkWood);
    cyl(upper,.38,.10,[0,4.92,10.1],ochre);
    beam(upper,[0,4.63,12.6],[0,6.2,18.2],.19,darkWood);
    for(const side of [-1,1]) {
      pipe(upper, [[side*.55,4.62,11],[side*1.5,4.55,11.7],[side*1.5,3.65,12]],.047,mats.dark);
    }
    const masts = part('masts','Üç Direk ve Serenler','Arma','Baş, ana ve mizana direği. Serenler yelkenlerin yatay taşıyıcılarıdır.',[0,.7,0]);
    const sails = part('sails','Kavisli Bez Yelkenler','Arma','Katmanlı kare yelkenler ve baş üçgeni yaklaşık dönem donanımıdır.',[0,.45,0],true);
    const sailCloth = group(sails, 'canvas', [0,0,0]);
    const rig = part('rig','Çarmıhlar ve İskotalar','Arma','Direkleri bordaya bağlayan halatlar ve çarmıh basamakları.',[0,.45,0]);
    for(const [z, height, span] of [[7.5,14.6,4.3],[-.8,17.2,5.0],[-8.4,13.4,3.65]]) {
      cyl(masts,.09,height-4.4,[0,(height+4.4)/2,z],darkWood,'y',.20);
      cyl(masts,.45,.11,[0,height-5.4,z],darkWood);
      for(let row=0;row<3;row++) {
        const top=height-1.1-row*2.48, half=span*(.58+.21*row);
        beam(masts,[-half,top,z],[half,top,z],.09,darkWood);
        const grid = Array.from({length: 11}, (_,i) => {
          const u=i/5-1;
          return Array.from({length: 9}, (_,j) => {
            const v=j/8;
            return [u*half*(.90+.10*v),top-2.22*v+.13*v*u*u,z+.61*Math.sin(Math.PI*v)*(1-.74*u*u)];
          });
        });
        skin(sailCloth,grid,canvas);
        for(const i of [0,3,5,7,10]) pipe(sailCloth,grid[i],.010,ochre);
        pipe(sailCloth,grid.map(g=>g.at(-1)),.018,cord);
      }
      for(const side of [-1,1]) {
        for(const dz of [-1.15,-.55,.05,.65]) {
          beam(rig,[side*(width(z+dz)-.12),4.47,z+dz],[0,height-5.2,z],.024,cord);
        }
        for(let i=1;i<=12;i++) {
          const t=i/15, x=side*(width(z)-.12)*(1-t), y=4.47+(height-9.67)*t;
          beam(rig,[x,y,z-1.14*(1-t)],[x,y,z+.65*(1-t)],.019,cord);
        }
      }
    }
    skin(sailCloth,[[[0,12,7.6],[0,12,7.6]],[[0,6.75,9.1],[0,6.08,16.2]]],canvas);
    pipe(rig, [[0,14.6,7.5],[0,10.2,11.8],[0,6.2,18.15]],.025,cord);
    pipe(rig, [[0,17.2,-.8],[0,14.35,7.5],[0,6.25,18.15]],.024,cord);
    pipe(rig, [[0,13.4,-8.4],[0,16.8,-.8],[0,14.5,7.5]],.022,cord);
    const stand = part('stand','Sergi Kaidesi','Sergi','Karina ayrıntılarını açıkta bırakan müze destekleri.',[0,-.1,0]);
    for(const z of [-7,7]) {
      box(stand,[5,.15,1.30],[0,.075,z],mats.dark);
      box(stand,[.78,.50,.8],[0,.40,z],darkWood);
    }

    function sync() {
      lids.forEach((deck,i) => deck.forEach(({hatch,side}) => {
        hatch.rotation.z = side * state.ports[i] * Math.PI / 100;
      }));
      section.forEach(item => { item.visible = !state.section; });
      sailCloth.visible = state.canvas;
    }
    const camPresets = {
      iso:{pos:[34,29,37],look:[0,7,1]}, front:{pos:[18,17,23],look:[0,6,8]},
      breech:{pos:[10,8,-21],look:[0,3.6,-12]}, engine:{pos:[17,8,10],look:[1,3.1,0]},
      suspension:{pos:[10,15,14],look:[0,10,1]}, top:{pos:[.1,47,.1],look:[0,3,0]}
    };
    const tourSteps = [
      ['Mahmudiye, 1829','Tersane-i Âmire’de inşa edilen üç direkli Osmanlı kalyonu.','iso',keel,false],
      ['Üç güverte','Enine postaları ve üst üste ahşap güverteleri kesitte izleyin.','engine',frame,true],
      ['Lombarlar','Her güvertenin kapaklarını ayrı ayrı kaldırın. Gösterilen açıklık sayısı temsili.','engine',parts.port,false],
      ['Arma','Yelken bezini gizleyip direkleri, serenleri ve çarmıhları görün.','suspension',rig,false],
      ['Kıç galerileri','Pencereli kıç aynası, renk ve bezeme dönem yorumudur.','breech',stern,false],
      ['Kırım Savaşı','Kalyon Sivastopol ablukasında Osmanlı donanmasında görev aldı.','iso',upper,false]
    ].map(([title,desc,cam,part,cutaway]) => ({title,desc,cam,part,cutaway,explode:0,sub:'all'}));
    const ui = kit.ui({
      title:'MAHMUDİYE — Üç Ambarlı Kalyon',sub:'1829 • Tersane-i Âmire • Yaklaşık müze rekonstrüksiyonu',
      portraitCameraScale:1.65,shadowExtent:28,fog:{near:115,far:250},
      subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#8a6641'})),
      camLabels:{iso:'Tam Gemi',front:'Baş ve Güverte',breech:'Kıç Galerisi',engine:'Borda Kesiti',suspension:'Direk ve Arma',top:'Üst'},
      sliders:['Alt','Orta','Üst'].map(name=>({label:name+' güverte lombarları',min:0,max:100,step:1,fmt:v=>v+'%'})),
      buttons:{terrain:'Sancak Kesiti',sweep:'Başlangıca Dön'},
      telemetryTag:'MAHMUDİYE • 1829',statLabels:['ALT LOMBARLAR','ORTA LOMBARLAR','ÜST LOMBARLAR','GÖRÜNÜM']
    });
    sync();
    return {
      root, parts, ui, camPresets, tourSteps, defaultPart:keel, firePart:masts, update() {},
      onFire(){state.canvas=!state.canvas;sync();return {ok:true};},
      fireButtonLabel:()=>state.canvas?'YELKEN BEZİNİ GİZLE':'YELKEN BEZİNİ GÖSTER',
      mobileFireButtonLabel:()=>state.canvas?'Arma':'Yelken',
      onSlider(i,v){if(i>=0&&i<3&&Number.isFinite(v))state.ports[i]=T.MathUtils.clamp(v,0,100);sync();return {};},
      onButton(name){if(name==='terrain')state.section=!state.section;else Object.assign(state,{ports:[65,65,65],section:false,canvas:true});sync();return {};},
      buttonActive:name=>name==='terrain'&&state.section,
      getSliderValues:()=>state.ports.slice(),
      getStats:()=>[...state.ports.map(v=>v+' <span>% açıklık</span>'),state.section?'Kesit':'Tam gemi'],
      getStatus:()=>({text:'OSMANLI DONANMASI • YELKEN ÇAĞI',color:'#956a41'}),
      applyTextures:kit.applyTextures,setTexture:kit.setTexture,toggleRelief:kit.toggleRelief
    };
  };
})();
