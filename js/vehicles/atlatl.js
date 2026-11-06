/* Mexica-inspired atlatl exhibit, not a facsimile or ballistic simulation.
 * British Museum Am.5226: silhouette/material reference; Maxwell Museum: hook contact.
 * Enlarged exhibit proportions, dart, relief and motion are interpretive.
 */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.atlatl = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'atlatl');
    const { T, root, parts, mats: M, mesh, box, cyl, ring, pipe, beam, instances } = K;
    const S = { speed: 0, phase: 0, separation: 0, dart: true };
    const counts = {}; let number = 0, finish = 'rosewood', relief = true;
    const pixels = new Uint8Array(256 * 64 * 4);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 256; x++) {
      const v = Math.round(192 + 22 * Math.sin(y * 2.8 + Math.sin(x * .024)) + 7 * Math.sin(y * 13 + x * .03));
      pixels.set([v, v, v, 255], (y * 256 + x) * 4);
    }
    const grain = new T.DataTexture(pixels, 256, 64, T.RGBAFormat);
    grain.colorSpace = T.SRGBColorSpace; grain.wrapS = grain.wrapT = T.RepeatWrapping; grain.needsUpdate = true;
    M.wood.color.setHex(0x4b231b); M.wood.map = grain; M.wood.roughness = .38; M.wood.userData.wood = true;
    const gold = new T.MeshStandardMaterial({ color: 0xc6a35b, metalness: .78, roughness: .47 });
    const shell = new T.MeshStandardMaterial({ color: 0xe8dfc7, metalness: .12, roughness: .36 });
    const cotton = new T.MeshStandardMaterial({ color: 0xbaa17a, roughness: .95 });
    const cane = new T.MeshStandardMaterial({ color: 0xac8046, roughness: .75, map: grain });
    const stone = new T.MeshStandardMaterial({ color: 0x353e40, roughness: .46, metalness: .12, flatShading: true });
    const feather = new T.MeshStandardMaterial({ color: 0xe0d6b8, roughness: .94, side: T.DoubleSide });
    function group(parent, pos, name) { const g = new T.Group(); g.position.set(...pos); g.name = name; parent.add(g); return g; }
    function P(key, name, sub, desc, exp, parent = root, outer = false) {
      counts[sub] = (counts[sub] || 0) + 1;
      const p = K.part(key, (++number) + '. ' + name, sub, [0, 0, 0], exp, desc, outer, parent);
      Object.assign(p.userData, { material: 'Ahşap, kabuk ve lif — görsel yorum', weight: 'Kütle hesaplanmıyor', spec: 'Büyütülmüş sergi modeli; üretim ölçeği değildir' }); return p;
    }
    function slab(p, points, depth, mat, y = 0) {
      const s = new T.Shape(); s.moveTo(...points[0]); points.slice(1).forEach(v => s.lineTo(...v)); s.closePath();
      return mesh(p, new T.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: .015, bevelSize: .018, bevelSegments: 3 }), mat, [0, y, 0], [Math.PI / 2, 0, 0]);
    }
    const base = P('base', 'Çağdaş Sergi Kaidesi', 'Sergi', 'Koyu taş kaide ve metal inceleme mesnedi müzeye ait sunum elemanlarıdır; tarihsel silahın parçası değildir.', [0, 0, 0]);
    box(base, [2.5, .18, 7.4], [0, .09, -1.25], M.dark);
    box(base, [2.38, .025, 7.28], [0, .193, -1.25], new T.MeshStandardMaterial({ color: 0x68665d, roughness: .94 }));
    for (const x of [-1.17, 1.17]) box(base, [.012, .008, 7.10], [x, .211, -1.25], gold);
    const stand = P('stand', 'İnceleme Mafsalı', 'Sergi', 'Kol hareketini yavaş gösteren çağdaş mesnet. İnsan elinin veya tarihsel bir fırlatma düzeneğinin kopyası değildir.', [0, -.3, 0]);
    cyl(stand, .16, .10, [0, .26, .70], M.dark);
    cyl(stand, .035, .98, [0, .75, .70], M.brass);
    mesh(stand, new T.SphereGeometry(.05,24,16), M.dark, [0,1.24,.70]);
    const assembly = group(root, [0, 1.35, .70], 'assembly');
    const lever = group(assembly, [0, 0, 0], 'lever');
    const dart = group(assembly, [0, 0, 0], 'dart');
    const body = P('body', 'Tek Parça Ahşap Fırlatma Kolu', 'Atlatl', 'Mexica örneklerinden esinlenen uzun, dar ve yuvarlatılmış ahşap gövde. Am.5226 nesnesinin birebir kopyası değildir.', [0, .3, 0], lever);
    slab(body, [[-.11,-.98],[.11,-.98],[.12,-.8],[.10,.38],[.145,.66],[.145,1.87],[.10,2.06],[0,2.10],[-.10,2.06],[-.145,1.87],[-.145,.66],[-.10,.38]], .11, M.wood, .04);
    const groove = P('groove', 'Üst Yiv ve Kılavuz Kenarları', 'Atlatl', 'Dartın arka ucuna uzanan sığ kılavuz yiv. Ayrı yan dudaklar sayesinde gerçek bir açıklık görülür.', [0, .35, 0], lever);
    for (const x of [-.072, .072]) pipe(groove, [[x,.055,.23],[x,.073,.8],[x,.073,1.72],[x,.10,1.91]], .018, M.wood);
    const hook = P('hook', 'Uç Kancası ve Temas Noktası', 'Atlatl', 'Ahşap kanca dartın arkasındaki sığ yuvaya dayanır. Mekanik ilke Maxwell Museum anlatımına dayanır; bu kancanın biçimi yorumdur.', [0, .5, .2], lever);
    pipe(hook, [[0,.04,2.0],[0,.15,2.02],[0,.24,1.97],[0,.24,1.94]], .028, M.wood);
    mesh(hook,new T.ConeGeometry(.024,.10,16),M.wood,[0,.24,1.90],[-Math.PI/2,0,0]);
    const contact = group(hook, [0, .24, 1.88], 'hook-contact');
    const grip = P('grip', 'Kabuk Parmak Halkaları', 'Atlatl', 'British Museum örneğindeki açık renkli çift kabuk halka görsel referanstır. İç boşluklar geometriyle açılmıştır.', [.45, .1, 0], lever);
    for (const side of [-1, 1]) {
      const s = new T.Shape(); s.absellipse(side * .29, 0, .22, .30, 0, Math.PI * 2, false, 0);
      const h = new T.Path(); h.absellipse(side * .29, 0, .125, .20, 0, Math.PI * 2, true, 0); s.holes.push(h);
      mesh(grip, new T.ExtrudeGeometry(s, { depth: .045, bevelEnabled: true, bevelSize: .014, bevelThickness: .012, bevelSegments: 3, curveSegments: 36 }), shell, [0,.045,0], [Math.PI / 2,0,0]);
    }
    const lash = P('lash', 'Pamuk Lifli Çapraz Sargılar', 'Atlatl', 'Kabuk halkaları gövdeye bağlayan çok katlı lif sargıları; çapraz geçişler ve düğüm uçları tek tek modellenir.', [0, .3, -.2], lever, true);
    for (let i = 0; i < 19; i++) {
      const z = -.22 + i * .024;
      const pts = [[-.15,.015,z],[-.13,.085,z+.012],[.13,.085,z+.024],[.15,-.10,z+.012],[-.13,-.10,z],[-.15,.015,z]];
      pipe(lash, pts, .008, cotton);
    }
    for (const side of [-1, 1]) for (let i = 0; i < 7; i++) {
      pipe(lash, [[side*.12,.08,-.2+i*.015],[side*.20,.09,0],[side*.12,.08,.10+i*.015]], .009, cotton);
    }
    pipe(lash, [[.12,.09,-.16],[.20,.10,-.20],[.21,.06,-.30],[.17,.02,-.34]], .013, cotton);
    const ornament = P('ornament', 'Altın Renkli Kabartma Şeritleri', 'Atlatl', 'Törensel örneğin altın bezemesini hatırlatan sadeleştirilmiş kıvrımlar. Özgün figürlerin veya bir tarihsel glifin kopyası değildir.', [0, -.35, 0], lever);
    // Side and underside relief leaves the upper contact groove unobstructed.
    for (const side of [-1, 1]) {
      pipe(ornament, [[side*.144,-.015,.60],[side*.15,-.015,1.25],[side*.12,-.015,1.95]], .009, gold);
      for (let i = 0; i < 7; i++) {
        const z = .67 + i * .17;
        pipe(ornament, [[side*.145,-.012,z],[side*.17,.015,z+.045],[side*.15,.03,z+.10]], .012, gold);
        const curl = ring(ornament, .047, [0,-.092,z], gold, .009, [Math.PI/2,0,0]); curl.scale.x = 1.6;
      }
    }
    const pommel = P('pommel', 'Ahşap Sap ve Uç Ayrıntıları', 'Atlatl', 'Halka gerisindeki cilalı tutamak, açık ahşap uç kesiti ve kanca yanındaki küçük kabuk dolgular.', [0, 0, -.3], lever);
    for (const z of [-.9, -.85]) ring(pommel, .072, [0,-.02,z], M.wood, .012, [0,0,0]);
    for (const x of [-.10,.10]) { const o = mesh(pommel, new T.SphereGeometry(.025,12,8), shell, [x,.052,1.93]); o.scale.y=.35; }
    const shaft = P('shaft', 'Uzun Dart Gövdesi', 'Dart', 'Atlatl dartı yay oku değildir. Bu uzun ahşap/kamış görünümü ve boy oranı eğitim amaçlıdır; Am.5226 ile birlikte korunmuş bir dartı temsil etmez.', [0, .6, 0], dart);
    cyl(shaft, .025, 4.90, [0,.24,-.75], cane, 'z', .032);
    const nodes = P('nodes', 'Sap Boğumları ve Dış Bağlar', 'Dart', 'Sap üzerindeki hafif boğumlar ve dış lif bağları. Ayrıntılar temsili olarak eklenmiştir.', [.25,.4,0], dart);
    for (const z of [-2.8,-2,-1.2,-.4,.4,1.1]) ring(nodes, .032, [0,.24,z], cane, .006);
    const socket = P('socket', 'Arka Uç Yuvası', 'Dart', 'Kancanın dayandığı sığ ve içi boş arka yuva. Temas–ayrılma kaydırıcısı bu bağlantıyı yakın planda gösterir.', [0,.5,.4], dart);
    mesh(socket, new T.CylinderGeometry(.034,.034,.20,24,1,true), cane, [0,.24,1.80], [Math.PI/2,0,0]);
    ring(socket,.030,[0,.24,1.90],cotton,.006);
    const socketContact = group(socket,[0,.24,1.88],'socket-contact');
    const fins = P('fins', 'Dart Kuyruk Tüyleri', 'Dart', 'Üç ayrı tüy yüzeyi, orta sap ve ince yan lifler. Tüy düzeni modern eğitim rekonstrüksiyonudur.', [.35,.6,.3], dart);
    for(let j=0;j<3;j++) {
      const g=group(fins,[0,.24,0],'feather-'+j); g.rotation.z=j*Math.PI*2/3;
      const shape=new T.Shape(); shape.moveTo(0,1.02); shape.quadraticCurveTo(.16,1.12,.17,1.39); shape.quadraticCurveTo(.12,1.57,0,1.63); shape.closePath();
      mesh(g,new T.ShapeGeometry(shape,24),feather,[0,0,0],[Math.PI/2,0,0]);
      pipe(g,[[0,.006,1.02],[.06,.006,1.30],[0,.006,1.63]],.006,cotton);
      for(let i=0;i<15;i++){const z=1.07+i*.033,w=.14*Math.sin((z-1.02)/.61*Math.PI);beam(g,[.014,.009,z],[w,.009,z+.06],.003,cotton);}
    }
    const fore = P('fore', 'Ön Ahşap Bölüm ve Sargı', 'Dart', 'Koyu ahşap ön bölüm ve taş ucun dış sargısı. Bölümlü dartlar Maxwell Museum örnekleriyle anlatılır; farklı kültürler tek buluntu gibi sunulmaz.', [0,.5,-.6], dart);
    cyl(fore,.031,.64,[0,.24,-3.48],M.wood,'z',.023);
    for(let i=0;i<15;i++)ring(fore,.034,[0,.24,-3.74+i*.012],cotton,.005);
    const point = P('point', 'Yontma Taş Görünümlü Uç', 'Dart', 'Merkez sırtı ve kırık yüzeyleri olan temsili taş uç. Malzeme seçimi tarihsel örneğe özgü kesin bir teşhis değildir.', [0,.6,-.8], dart);
    // Faceted double-sided lenticular blade, not a flat triangular icon.
    const outline=[[-.035,-3.70],[-.12,-3.85],[-.095,-4.02],[0,-4.31],[.095,-4.02],[.12,-3.85],[.035,-3.70]];
    const verts=[];
    for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length];verts.push(a[0],.24,a[1],b[0],.24,b[1],0,.285,-3.92);verts.push(b[0],.24,b[1],a[0],.24,a[1],0,.195,-3.92);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.computeVertexNormals();mesh(point,geo,stone);
    for(const side of [-1,1])for(let i=0;i<5;i++)pipe(point,[[side*.025,.27,-3.80-i*.06],[side*(.095-i*.01),.245,-3.85-i*.06]],.003,M.dark);
    const guide = P('guide', 'Temas İşareti ve Sergi İşaretleri', 'Sergi', 'Küçük pirinç işaretler sergi düzenine aittir. Ölçek veya tarihsel nişangâh değildir.', [0,0,0]);
    for(let i=0;i<15;i++)box(guide,[i%5===0?.13:.07,.005,.012],[-1.08,.213,-4.55+i*.45],gold);
    box(guide,[.50,.015,.30],[.75,.218,1.76],M.dark);
    for(let i=0;i<3;i++)box(guide,[.33-i*.05,.006,.014],[.75,.228,1.69+i*.07],gold);
    const marker = mesh(contact,new T.SphereGeometry(.055,16,10),gold);
    marker.visible=false;
    let emphasize=false;
    function sync(){
      const t=S.phase/100,attached=Math.min(t,.60),angle=(-7+32*t)*Math.PI/180;
      lever.rotation.x=angle;dart.rotation.x=(-7+32*attached)*Math.PI/180;
      const release=Math.max(0,(t-.60)/.40);
      dart.position.set(0,S.separation*.008+release*.70,-release*.45);
      dart.visible=S.dart;marker.visible=emphasize;
    }
    function update(dt){if(Number.isFinite(dt)&&S.speed>0){S.phase=Math.min(100,S.phase+Math.max(0,Math.min(dt,.05))*S.speed*16);if(S.phase===100)S.speed=0;}sync();}
    function reset(){Object.assign(S,{speed:0,phase:0,separation:0,dart:true});emphasize=false;sync();}
    const finishes={rosewood:{label:'Koyu Cilalı Ahşap',color:0x4b231b},walnut:{label:'Ceviz Tonu (temsili)',color:0x705039},pale:{label:'Açık Ahşap (temsili)',color:0xab8251},aged:{label:'Yaşlanmış Ahşap (temsili)',color:0x665b4b}};
    function applyTextures(blueprint){K.applyTextures(blueprint);K.meshes.forEach(({o})=>{if(o.material.userData.wood){o.userData.origColor.setHex(finishes[finish].color);if(!blueprint)o.material.color.copy(o.userData.origColor);o.material.map=grain;o.material.bumpMap=relief?grain:null;o.material.bumpScale=.007;o.material.needsUpdate=true;}});}
    const camPresets={iso:{pos:[5.8,6.2,6.4],look:[0,1.2,-1]},front:{pos:[2.0,2.5,-5.8],look:[0,1.8,-3.3]},breech:{pos:[2.2,2.8,3.7],look:[0,1.5,2.1]},engine:{pos:[1.7,2.7,1.7],look:[0,1.35,.7]},suspension:{pos:[2.8,.8,2.4],look:[0,1.3,1.5]},top:{pos:[.01,8.8,-1.1],look:[0,0,-1.1]}};
    const tourSteps=[
      ['Bir Kolu Uzatan Araç','Atlatl çok eski ve farklı coğrafyalara yayılan bir araç türüdür. Bu sergi Mexica görünümünden esinlenir; tarih, atlatlın icat tarihi değildir.','iso',body,false],
      ['Kabuk Halkalar ve Lifler','British Museum Am.5226 örneğinde ahşap, kabuk ve pamuk görülür. Çift halkayı ve gövdeye sarılan lifleri yakın planda inceleyin.','engine',grip,false],
      ['Kanca ile Dartın Teması','Kanca, dartın arka yuvasına dayanır. Yavaş gösterimde %60’a kadar temas korunur; sonrasında ayrılma sergi hareketiyle açılır.','breech',hook,true],
      ['Uzun Dart','Uzun sap, kuyruk tüyleri, dış bağlar, ön bölüm ve yontma taş görünümü. Dart, törensel müze nesnesiyle birlikte bulunmuş değildir.','front',point,false],
      ['Törensel Bezeme','Müze, altın bezemeli örneğin muhtemelen törensel olduğunu belirtir. Buradaki kıvrımlar sadeleştirilmiş yorumdur; özgün figürler kopyalanmaz.','suspension',ornament,false],
      ['Sergi ile Tarihi Ayırmak','Kaide ve mafsal çağdaş sunum parçalarıdır. Hareket yavaşlatılmış temas incelemesidir; gerçek fırlatma, esneme veya menzil hesabı değildir.','top',stand,false]
    ].map(a=>({title:a[0],desc:a[1],cam:a[2],part:a[3],cutaway:a[4],explode:0,sub:'all'}));
    const ui=K.ui({portraitCameraScale:1.8,title:'ATLATL — Mexica Esintili İnceleme',sub:'1400–1521 örneğinden esinlenme • Büyütülmüş müze yorumu',
      subsystems:Object.entries(counts).map(([key,count],i)=>({key,label:key,count,color:['#7d8790','#ad8051','#a6a271'][i]})),
      camLabels:{iso:'Genel',front:'Taş Uç',breech:'Kanca ve Yuva',engine:'Kabuk Halkalar',suspension:'Bezeme',top:'Üst'},
      sliders:[{label:'Yavaş Gösterim Hızı',min:0,max:2,step:.25,fmt:v=>v+'×'},{label:'Temas–Ayrılma Evresi',min:0,max:100,step:1,fmt:v=>'%'+Math.round(v)},{label:'Dartı Ayır (sergi)',min:0,max:100,step:1,fmt:v=>'%'+v}],
      buttons:{terrain:'Dartı Göster / Gizle',sweep:'Başlangıca Dön',mode:true},telemetryTag:'KOL • KANCA • DART',statLabels:['EVRE','TEMAS','GÖSTERİM','DART']});
    ui.textures=Object.entries(finishes).map(([key,v])=>({key,label:v.label}));ui.activeTexture=()=>finish;ui.textureLabel=()=>finishes[finish].label;ui.relief=()=>relief;ui.reliefLabel=v=>'Ahşap Yüzey: '+(v?'AYRINTILI':'DÜZ');
    sync();applyTextures(false);
    return {root,parts,ui,camPresets,tourSteps,defaultPart:body,firePart:hook,update,
      onFire:()=>{if(S.phase>=100)S.phase=0;S.speed=S.speed?0:1;sync();return {ok:true};},
      fireButtonLabel:()=>S.speed?'GÖSTERİMİ DURAKLAT':S.phase>=100?'GÖSTERİMİ YENİDEN OYNAT':'TEMAS–AYRILMA GÖSTERİMİ',mobileFireButtonLabel:()=>S.speed?'Duraklat':'Mekaniği İncele',
      onSlider:(i,v)=>{if(!Number.isFinite(v))return {};if(i===0)S.speed=T.MathUtils.clamp(v,0,2);if(i===1){S.phase=T.MathUtils.clamp(v,0,100);S.speed=0;}if(i===2){S.separation=T.MathUtils.clamp(v,0,100);S.speed=0;}sync();return {};},
      onButton:n=>{if(n==='terrain'){S.dart=!S.dart;S.speed=0;}else if(n==='mode')emphasize=!emphasize;else reset();sync();return {};},buttonActive:n=>n==='terrain'?S.dart:n==='mode'?emphasize:false,modeLabel:()=>emphasize?'TEMAS İŞARETİ: AÇIK':'KANCA TEMASINI VURGULA',
      getSliderValues:()=>[S.speed,S.phase,S.separation],getStats:()=>[Math.round(S.phase)+' <span>%</span>',(S.phase<=60&&!S.separation?'BAĞLI':'AYRI')+' <span>sergi</span>',S.speed+' <span>×</span>',(S.dart?'GÖRÜNÜR':'GİZLİ')+' <span></span>'],
      getStatus:()=>({text:S.speed?'YAVAŞ TEMAS GÖSTERİMİ':'DURAKLATILDI • İNCELE',color:'#9c7841'}),applyTextures,setTexture:k=>{if(finishes[k])finish=k;},toggleRelief:()=>{relief=!relief;return relief;}};
  };
})();
