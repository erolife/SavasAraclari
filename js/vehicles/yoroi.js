/* Enlarged exhibit based on The Met 36.25.39a–p, an 18th-century revival yoroi.
 * Panel separation and helmet lift are museum inspection motions. */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.yoroi = function (ctx) {
    const K = window.MuseumModelKit(ctx, 'yoroi');
    const { T, root, parts, mesh, box, cyl, ring, pipe, beam, instances } = K;
    const english = window.MuseumPreferences?.language === 'en';
    const t = (tr, en) => english ? en : tr;
    const state = { spread: 0, lift: 0, turn: 0, support: true };
    const counts = {};
    let number = 0;
    function material(color, metalness, roughness) {
      return new T.MeshStandardMaterial({ color, metalness, roughness });
    }
    const lacquer = material(0x202922, .48, .43);
    lacquer.userData.paint = true;
    const black = material(0x151a18, .4, .38);
    const gold = material(0xb59449, .76, .39);
    const silk = material(0x9b9a65, .05, .9);
    const orange = material(0xbb714b, .04, .88);
    const cord = material(0x634039, .02, .95);
    const fabric = material(0x555040, .02, .96);
    const leather = material(0x4b3830, .08, .82);
    const wood = material(0x594335, .02, .88);
    const ivory = material(0xb5a47d, .02, .86);
    function group(parent, position, name) {
      const object = new T.Group();
      object.position.set(...position);
      object.name = name;
      parent.add(object);
      return object;
    }
    const exhibit = group(root, [0, 0, 0], 'exhibit');
    const helmetLift = group(exhibit, [0, 0, 0], 'helmet-lift');
    function part(id, tr, en, familyTr, familyEn, descTr, descEn, explosion = [0, .3, 0], outer = false, parent = exhibit) {
      const family = t(familyTr, familyEn);
      counts[family] = (counts[family] || 0) + 1;
      const object = K.part(id, ++number + '. ' + t(tr, en), family, [0, 0, 0], explosion, t(descTr, descEn), outer, parent);
      Object.assign(object.userData, {
        material: t('Demir, lake, deri, ipek ve metal bezeme', 'Iron, lacquer, leather, silk and metal ornament'),
        weight: t('Parça kütlesi hesaplanmıyor', 'Part mass is not calculated'),
        spec: t('Met 36.25.39a–p • büyütülmüş görsel yorum', 'Met 36.25.39a–p • enlarged visual interpretation')
      });
      return object;
    }
    function ellipsoid(parent, position, scale, mat) {
      const object = mesh(parent, new T.SphereGeometry(1, 24, 16), mat, position);
      object.scale.set(...scale);
      return object;
    }
    function plate(parent, points, depth, mat, position = [0, 0, 0]) {
      const shape = new T.Shape();
      shape.moveTo(...points[0]);
      for (const point of points.slice(1)) shape.lineTo(...point);
      shape.closePath();
      return mesh(parent, new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: .009, bevelThickness: .006, bevelSegments: 1 }), mat, position);
    }
    // One curved strip per row, with repeated overlapping scales and silk links.
    function rows(parent, width, height, count, columns, curvature = .035) {
      const scales = [], ties = [], holes = [], hems = [];
      const pitch = height / count;
      const cell = width / columns;
      for (let row = 0; row < count; row++) {
        for (let col = 0; col < columns; col++) {
          const x = -width / 2 + (col + .5) * cell;
          const y = -row * pitch;
          const z = curvature * (1 - Math.pow(x / (width / 2), 2));
          scales.push({ pos: [x, y, z], scale: [cell * 1.04, pitch * 1.2, .028] });
          for (const side of [-1, 1]) {
            ties.push({ pos: [x + side * cell * .20, y + pitch * .10, z + .021], rot: [0, 0, side * .10], scale: [.011, pitch * .80, .011] });
            holes.push({ pos: [x + side * cell * .20, y + pitch * .43, z + .021], scale: [.009, .009, .005] });
          }
          if (row === count - 1) hems.push({pos:[x,y-pitch*.30,z+.026],scale:[cell*.68,pitch*.55,.017]});
        }
      }
      instances(parent, new T.BoxGeometry(1, 1, 1), lacquer, scales);
      instances(parent, new T.BoxGeometry(1, 1, 1), silk, ties);
      instances(parent, new T.SphereGeometry(1, 6, 4), black, holes);
      instances(parent, new T.TorusGeometry(1, .23, 5, 10), orange, hems);
      box(parent, [width + .025, .036, .045], [0, pitch * .55, .01], gold);
    }
    function flower(parent, x, y, z, radius = .055) {
      const petals = Array.from({length:6},(_,i)=>{
        const a = i * Math.PI / 3;
        return {pos:[x+radius*.53*Math.sin(a),y+radius*.53*Math.cos(a),z],rot:[0,0,-a],scale:[radius*.30,radius*.62,.009]};
      });
      instances(parent, new T.SphereGeometry(1, 8, 5), gold, petals);
      cyl(parent,radius*.23,.016,[x,y,z+.008],gold,'z');
    }

    const base = part('base','Müze Kaidesi','Museum plinth','Sergi','Exhibit',
      'Ahşap kutu ve figürü taşıyan çağdaş sergi kaidesi.','A modern plinth supports the display box and figure.',[0,0,0],false,root);
    box(base,[2.8,.10,1.95],[0,.05,0],black);
    box(base,[2.73,.035,1.88],[0,.117,0],wood);
    const support = part('support','Ahşap Sergi Kutusu','Wooden display box','Sergi','Exhibit',
      'Oturan donanımı destekleyen ahşap kutu. İç mesnet bu sergi için yorumlanmıştır.','A wooden box supports the seated display. The internal mount is interpretive.',[0,0,0]);
    box(support,[1.35,.9,1.05],[0,.6,-.10],wood);
    for (const x of [-.63,.63]) for (const z of [-.57,.37]) box(support,[.035,.9,.035],[x,.60,z],gold);
    for (const y of [.19,1.01]) box(support,[1.37,.035,1.07],[0,y,-.1],black);
    const mannequin = part('mannequin','İç Sergi Figürü','Internal display figure','Sergi','Exhibit',
      'Nötr, oturan iç figür ve destek. Şekli, renkleri ve gizli bağlantıları yaklaşık müze yorumudur.','A neutral seated figure and support. Its shape, colours and hidden attachments are interpretive.',[0,0,0]);
    ellipsoid(mannequin,[0,2.15,-.03],[.48,.65,.28],fabric);
    box(mannequin,[.9,.16,.62],[0,1.36,-.04],fabric);
    for (const side of [-1,1]) {
      const thigh = ellipsoid(mannequin,[side*.37,1.24,.33],[.24,.20,.52],fabric);
      thigh.rotation.x=-.12;
      ellipsoid(mannequin,[side*.45,.83,.69],[.16,.47,.14],fabric);
    }
    const chest = part('chest','Ön Göğüslük ve Deri Yüzey','Front cuirass and leather facing','Gövde','Cuirass',
      'Gövdeyi saran zırhın ön yüzeyi. Baklava desenleri, kaynak fotoğrafındaki bezemenin sadeleştirilmiş yorumudur.','The front face of the wraparound cuirass. The diamond pattern simplifies the photographed decoration.',[0,.15,.6],true);
    const chestPanel = group(chest,[0,0,0],'chest-panel');
    plate(chestPanel,[[-.46,1.54],[-.56,2.34],[-.43,2.68],[.43,2.68],[.56,2.34],[.46,1.54]],.052,leather,[0,0,.25]);
    plate(chestPanel,[[-.42,1.58],[-.50,2.30],[-.39,2.48],[.39,2.48],[.50,2.30],[.42,1.58]],.018,ivory,[0,0,.315]);
    const pattern = [];
    for (let i=-4;i<=4;i++) for (const sign of [-1,1]) {
      const y=1.65+i*.17;
      pattern.push({pos:[0,y+.42,.345],rot:[0,0,sign*.72],scale:[.012,.62,.01]});
    }
    instances(chestPanel,new T.BoxGeometry(1,1,1),leather,pattern.filter(item=>item.pos[1]>1.8&&item.pos[1]<2.3));
    const upperChest = group(chestPanel,[0,2.63,.33],'upper-lamellae');
    rows(upperChest,1.02,.20,3,20,.025);
    const back = part('back','Arka Levha Sıraları','Rear lamellar rows','Gövde','Cuirass',
      'Arka zırh yüzeyinde lake kaplı sıralar ve bağlar görünür.','Lacquered rows and lacing are visible on the rear armour.',[0,.2,-.5],true);
    const backPanel = group(back,[0,2.56,-.33],'back-panel');
    backPanel.rotation.y=Math.PI;
    rows(backPanel,1.03,.91,10,21,.06);
    const sidePanel = part('waidate','Waidate Yan Paneli','Waidate side panel','Gövde','Cuirass',
      'Sağ yandaki kapatma paneli. Kaydırıcı bu parçayı inceleme amacıyla gövdeden ayırır.','The closing panel on the right side. The slider separates it from the body for inspection.',[.65,.2,0],true);
    const waidate = group(sidePanel,[.53,2.53,.0],'waidate-panel');
    waidate.rotation.y=Math.PI/2;
    rows(waidate,.57,.86,10,12);
    const leftPanel = part('left','Sol Yan Sıraları','Left side rows','Gövde','Cuirass',
      'Gövde çevresinde devam eden yatay sıralar. İnce levha ve bağ ölçekleri görsel okunurluk için büyütülmüştür.','Horizontal rows continue around the torso. Fine scales and lacing are enlarged for readability.',[-.6,.2,0],true);
    const left = group(leftPanel,[-.53,2.53,0],'left-panel');
    left.rotation.y=-Math.PI/2;
    rows(left,.57,.86,10,12);
    const collar = part('collar','Yaka ve Omuz Askıları','Collar and shoulder straps','Bağlar','Lacing',
      'Boyun çevresindeki tekstil ve zırhı taşıyan geniş askılar.','Textile around the neck and broad straps support the armour.',[0,.4,0]);
    const neckRing=ring(collar,.24,[0,2.76,0],fabric,.07,[Math.PI/2,0,0]);neckRing.scale.y=.75;
    for (const side of [-1,1]) {
      pipe(collar,[[side*.36,2.58,.29],[side*.37,2.81,.12],[side*.36,2.83,-.16],[side*.35,2.55,-.31]],.050,leather);
      ring(collar,.064,[side*.36,2.72,.30],gold,.014);
    }
    const decoration = part('ornament','Yaldız Renkli Donanım','Gilt-coloured fittings','Bezeme','Ornament',
      'Çiçek rozetleri ve çevre şeritleri sade geometrilerle yorumlanmıştır.','Floral rosettes and edge strips are interpreted with simplified shapes.',[0,.15,.4]);
    for (const side of [-1,1]) {
      box(decoration,[.105,.75,.025],[side*.47,2.10,.38],gold,[0,0,side*.08]);
      for (let j=0;j<5;j++) flower(decoration,side*.47,1.80+j*.13,.401,.035);
    }
    const knots = part('knots','Agemaki Düğümleri ve Püsküller','Agemaki knots and tassels','Bağlar','Lacing',
      'Ön ve arka ipek bağlar ile püsküller. Bağ yolu dekoratif olarak sadeleştirilmiştir.','Silk knots and tassels at the front and back. Their paths are decoratively simplified.',[0,.2,.4]);
    for (const x of [-.43,0,.43]) {
      const y=x===0?2.44:2.59;
      pipe(knots,[[x,y+.1,.42],[x-.09,y,.43],[x,y-.06,.43],[x+.09,y,.43],[x,y+.1,.42]],.013,orange);
      pipe(knots,[[x,y-.06,.43],[x,y-.25,.44]],.018,orange);
      const threads=Array.from({length:18},(_,i)=>({pos:[x+(i%6-2.5)*.014,y-.32,.43+Math.floor(i/6)*.012],scale:[.008,.17,.008]}));
      instances(knots,new T.BoxGeometry(1,1,1),orange,threads);
    }
    const shoulders=[];
    for (const side of [-1,1]) {
      const shoulder = part(side<0?'sodeL':'sodeR',side<0?'Sol Sode Omuzluğu':'Sağ Sode Omuzluğu',side<0?'Left sode shoulder guard':'Right sode shoulder guard','Omuzluklar','Shoulder guards',
        'Geniş, köşeli omuzluğun katmanlı levhaları ve kenar bağları. Ayrılma hareketi müze incelemesi içindir.','Layered scales and edge lacing on the broad shoulder guard. Separation is a museum inspection motion.',[side*.8,.2,0],true);
      const guard=group(shoulder,[side*.78,2.68,-.025],'sode-'+side);
      guard.rotation.y=side*.26;
      guard.rotation.z=side*.16;
      rows(guard,.58,.86,9,12,.05);
      box(guard,[.60,.13,.075],[0,.10,.018],gold);
      for(const x of [-.20,0,.20])flower(guard,x,.1,.066,.04);
      pipe(shoulder,[[side*.42,2.80,-.16],[side*.65,2.86,-.10],[side*.79,2.79,.01]],.018,cord);
      shoulders.push(guard);
    }
    const skirtGroups=[];
    const skirtInfo=[
      ['skirtFront','Ön Kusazuri','Front kusazuri',[0,1.56,.63],0,.99],
      ['skirtBack','Arka Kusazuri','Rear kusazuri',[0,1.52,-.57],Math.PI,1.02],
      ['skirtL','Sol Kusazuri','Left kusazuri',[-.80,1.57,.05],-Math.PI/2,.83],
      ['skirtR','Sağ Kusazuri','Right kusazuri',[.80,1.57,.05],Math.PI/2,.83]
    ];
    for (const [id,tr,en,position,angle,width] of skirtInfo) {
      const panel=part(id,tr,en,'Etek','Skirt',
        'Dört parçalı eteğin üst üste gelen sıraları. Oturan sergi duruşundaki dışa açılım yaklaşık yorumdur.','Overlapping rows of the four-part skirt. The spread in the seated display is interpreted.',[position[0]*.8,-.1,position[2]*.8],true);
      const skirt=group(panel,position,id+'-rows');
      skirt.rotation.y=angle;
      skirt.rotation.x=-.24;
      rows(skirt,width,.91,9,20,.04);
      for (const x of [-width*.35,width*.35]) flower(skirt,x,-.85,.065,.038);
      skirtGroups.push({object:skirt,position:skirt.position.clone()});
    }
    const arms = part('sleeves','Kote Kol Kumaşı ve Halkalar','Kote fabric and mail','Kollar','Arms',
      'Oturan sergi düzeninde kollar dizlere uzanır. İnce halkalar ve kumaş yüzeyi temsili dokudur.','Arms reach towards the knees in the seated display. Fine rings and cloth texture are illustrative.',[.3,0,.25]);
    for (const side of [-1,1]) {
      beam(arms,[side*.48,2.57,.02],[side*.61,2.08,.20],.19,fabric);
      beam(arms,[side*.61,2.08,.20],[side*.48,1.48,.62],.16,leather);
      const mail=[];
      for(let j=0;j<9;j++)for(let i=0;i<6;i++)mail.push({pos:[side*(.58+i*.014),2.30-j*.035,.22],scale:[.012,.016,.008]});
      instances(arms,new T.TorusGeometry(1,.18,4,8),black,mail);
    }
    const cuffs = part('cuffs','Ön Kol Metal Şeritleri','Forearm metal strips','Kollar','Arms',
      'Kol kumaşının üzerinde altın renkli metal ve koyu şeritler.','Gilt-coloured metal and dark strips over the sleeves.',[.3,.1,.3]);
    for (const side of [-1,1]) for(let j=0;j<5;j++){
      const p=[side*(.58-j*.018),1.92-j*.075,.32+j*.057];
      const band=cyl(cuffs,.105,.035,p,j%2?black:gold);
      band.rotation.x=-.55;
    }
    const hands = part('hands','El Üstü Koruması','Back-of-hand guards','Kollar','Arms',
      'Diz üzerine oturan el üstü korumaları ve sadeleştirilmiş eldivenler.','Back-of-hand guards rest on the knees above simplified gloves.',[.3,0,.3]);
    for(const side of [-1,1]){
      ellipsoid(hands,[side*.47,1.46,.66],[.13,.10,.17],gold);
      for(let j=0;j<4;j++)ellipsoid(hands,[side*.47+(j-1.5)*.046,1.40,.76],[.021,.025,.09],leather);
      flower(hands,side*.47,1.48,.81,.043);
    }
    const thighs = part('thighs','Haidate Diz ve Uyluk Parçaları','Haidate thigh and knee pieces','Bacaklar','Legs',
      'Eteğin altından görünen tekstil ve levha paneller.','Textile and plate panels visible beneath the skirt.',[.25,0,.25]);
    for(const side of [-1,1]){
      const panel=group(thighs,[side*.37,1.30,.53],'thigh-'+side);
      panel.rotation.x=-1.1;
      rows(panel,.40,.48,5,8);
    }
    const shins = part('shins','Suneate Baldır Korumaları','Suneate shin guards','Bacaklar','Legs',
      'Baldır çevresindeki düşey parçalar, kumaş ve bağlarla bir arada tutulur.','Vertical shin pieces are held together by cloth and ties.',[.3,0,.2]);
    for(const side of [-1,1]){
      ellipsoid(shins,[side*.45,.71,.72],[.16,.42,.12],leather);
      for(let j=0;j<5;j++)beam(shins,[side*.45+(j-2)*.057,.37,.83],[side*.45+(j-2)*.066,1.06,.82],.023,j%2?black:gold);
      for(const y of [.41,.91])pipe(shins,[[side*.45-.16,y,.70],[side*.45,y,.87],[side*.45+.16,y,.70]],.015,cord);
    }
    const feet = part('feet','Ayak ve Alt Kumaş','Feet and lower textile','Bacaklar','Legs',
      'Sergi takımının altındaki sadeleştirilmiş tekstil ayaklar.','Simplified textile feet beneath the armour display.',[.2,0,.3]);
    for(const side of [-1,1])ellipsoid(feet,[side*.45,.23,.81],[.15,.09,.24],fabric);

    const bowl = part('bowl','Kabuto Miğfer Kubbesi','Kabuto helmet bowl','Miğfer','Helmet',
      'Dilimli, koyu lake kubbe. Yükseltme işlemi sergi iç yüzeyini incelemek içindir.','A dark lacquered segmented bowl. Lifting reveals the display interior.',[0,.8,0],true,helmetLift);
    mesh(bowl,new T.SphereGeometry(.38,48,22,0,Math.PI*2,0,Math.PI/2),black,[0,3.22,0]);
    const ribs=part('ribs','Miğfer Dilimleri ve Perçinler','Helmet ribs and rivets','Miğfer','Helmet',
      'Kubbe yüzeyindeki birleşim çizgileri ve kabarık perçin başları.','Seams and raised rivet heads across the bowl.',[0,.8,0],false,helmetLift);
    const rivets=[];
    for(let i=0;i<20;i++){
      const a=i*Math.PI/10;
      pipe(ribs,Array.from({length:14},(_,j)=>{
        const p=j*Math.PI/26;
        return [.383*Math.sin(p)*Math.sin(a),3.22+.383*Math.cos(p),.383*Math.sin(p)*Math.cos(a)];
      }),.008,gold);
      for(let j=1;j<5;j++){
        const p=j*Math.PI/11;
        rivets.push({pos:[.39*Math.sin(p)*Math.sin(a),3.22+.39*Math.cos(p),.39*Math.sin(p)*Math.cos(a)]});
      }
    }
    instances(ribs,new T.SphereGeometry(.015,8,6),black,rivets);
    const crown = part('crown','Tehen Tepe Bileziği','Tehen crown fitting','Miğfer','Helmet',
      'Miğferin tepesindeki küçük halka ve metal çevre bezemesi.','The small opening and metal ornament at the crown.',[0,.9,0],false,helmetLift);
    for(const [radius,y]of [[.09,3.60],[.075,3.63]])ring(crown,radius,[0,y,0],gold,.012,[Math.PI/2,0,0]);
    const brim = part('brim','Mabizashi Siperlik','Mabizashi visor','Miğfer','Helmet',
      'Öne uzanan siperlik ve yaldız renkli çevre.','A projecting visor with a gilt-coloured rim.',[0,.7,.2],true,helmetLift);
    const visor=plate(brim,[[-.37,-.10],[-.45,.04],[-.34,.20],[.34,.20],[.45,.04],[.37,-.10]],.035,black,[0,3.21,.32]);
    visor.rotation.x=-1.25;
    pipe(brim,[[-.41,3.19,.40],[-.26,3.16,.57],[0,3.15,.61],[.26,3.16,.57],[.41,3.19,.40]],.014,gold);
    const neckguard = part('shikoro','Shikoro Ense Korumaları','Shikoro neck guard','Miğfer','Helmet',
      'Dışa genişleyen katmanlar enseyi ve yanları çevreler.','Flared layers wrap around the back and sides of the neck.',[0,.6,-.4],true,helmetLift);
    for(let j=0;j<5;j++){
      const radius=.43+j*.055,y=3.22-j*.076;
      const segment = new T.CylinderGeometry(radius,radius+.045,.095,48,1,true,.67,Math.PI*2-1.34);
      mesh(neckguard,segment,lacquer,[0,y,0]);
      const stitches=[];
      for(let i=0;i<32;i++){
        const a=.70+i*(Math.PI*2-1.4)/31;
        stitches.push({pos:[(radius+.03)*Math.sin(a),y,(radius+.03)*Math.cos(a)],rot:[0,a,0],scale:[.015,.08,.013]});
      }
      instances(neckguard,new T.BoxGeometry(1,1,1),j===4?orange:silk,stitches);
    }
    const wings=part('fukigaeshi','Fukigaeshi Yan Kıvrımları','Fukigaeshi side turnbacks','Miğfer','Helmet',
      'Siperliğin iki yanındaki dışa kıvrılan geniş plakalar.','Broad turned-back plates on either side of the visor.',[0,.6,.2],true,helmetLift);
    for(const side of [-1,1]){
      const wing=plate(wings,[[-.18,-.16],[-.20,.10],[.17,.16],[.21,-.13]],.035,gold,[side*.43,3.28,.10]);
      wing.rotation.y=side*.38;
      flower(wings,side*.44,3.30,.155,.075);
    }
    const crest=part('kuwagata','Kuwagata Ön Bezeme','Kuwagata front crest','Bezeme','Ornament',
      'İki yana yükselen altın renkli bezeme. Çizgisel motifler sadeleştirilmiştir.','The gilt-coloured crest rises on both sides. Linear motifs are simplified.',[0,.9,.4],false,helmetLift);
    for(const side of [-1,1]){
      const points=[[side*.03,3.28],[side*.21,3.39],[side*.32,3.87],[side*.56,4.13],[side*.35,4.10],[side*.20,3.98],[side*.14,3.58]];
      plate(crest,points,.024,gold,[0,0,.44]);
    }
    flower(crest,0,3.37,.48,.105);
    const face = part('face','Menpō Yüz Koruması','Menpō face protection','Yüz ve Boğaz','Face and throat',
      'Müze fotoğrafındaki siyah yüz korumasının sadeleştirilmiş dış biçimi.','A simplified outer form of the black face protection in the museum photograph.',[0,.45,.65],true);
    const mask=group(face,[0,0,0],'face-mask');
    for(const side of [-1,1]){
      ellipsoid(mask,[side*.16,3.02,.27],[.145,.19,.085],black);
      pipe(mask,[[side*.27,3.12,.28],[side*.15,3.13,.35],[side*.07,3.09,.36]],.019,gold);
    }
    ellipsoid(mask,[0,2.86,.28],[.19,.12,.075],black);
    ellipsoid(mask,[0,3.02,.38],[.065,.09,.085],black);
    box(mask,[.18,.045,.015],[0,2.92,.36],leather);
    pipe(mask,[[-.10,2.94,.38],[0,2.96,.40],[.10,2.94,.38]],.012,gold);
    const throat=part('throat','Yodarekake Boğaz Sıraları','Yodarekake throat lames','Yüz ve Boğaz','Face and throat',
      'Yüz korumasının altındaki kısa katmanlar.','Short protective rows beneath the face piece.',[0,.4,.5],true);
    const bib=group(throat,[0,2.83,.34],'throat-rows');
    rows(bib,.49,.20,3,11,.04);
    const ties=part('chin','Miğfer Bağları','Helmet cords','Bağlar','Lacing',
      'Miğferi yüz çevresinden geçen ipek bağlar tamamlar. Gizli düğümler yaklaşık yorumdur.','Silk cords complete the helmet around the face. Hidden knots are interpreted.',[0,.5,.4]);
    for(const side of [-1,1])pipe(ties,[[side*.34,3.21,.18],[side*.29,2.94,.32],[side*.12,2.80,.35],[0,2.78,.36]],.023,cord);

    function sync() {
      const opening=state.spread/100;
      exhibit.rotation.y=T.MathUtils.degToRad(state.turn);
      chestPanel.position.z=opening*.62;
      backPanel.position.z=-.33-opening*.50;
      waidate.position.x=.53+opening*.68;
      left.position.x=-.53-opening*.4;
      shoulders.forEach((object,index)=>{ object.position.x=(index===0?-1:1)*(.78+opening*.40); });
      skirtGroups.forEach(({object,position})=>{
        object.position.copy(position);
        object.position.x+=position.x*opening*.55;
        object.position.z+=position.z*opening*.42;
      });
      helmetLift.position.y=state.lift/100*.60;
      mask.position.z=opening*.40;
      support.visible=state.support;
      mannequin.visible=state.support;
    }
    function reset() {
      Object.assign(state,{spread:0,lift:0,turn:0,support:true});
      sync();
    }
    const camPresets={
      iso:{pos:[5.4,3.5,8.0],look:[0,2.1,0]},
      front:{pos:[0,2.7,8],look:[0,2.1,.1]},
      breech:{pos:[-4.8,3.6,-6],look:[0,2.2,0]},
      engine:{pos:[1.8,3.65,3.3],look:[0,3.25,.2]},
      suspension:{pos:[2.6,2.2,3.7],look:[.1,1.8,.2]},
      top:{pos:[.01,8,.01],look:[0,2,0]}
    };
    const tourSteps=[
      [t('Ō-yoroi — Eski Üsluba Dönüş','Ō-yoroi — A revival of an older style'),t('Ana görsel referans 18. yüzyıla tarihlenir. Orta Çağ üslubuna yeniden ilgiyle yapılmış bir zırhtır.','The visual reference dates to the eighteenth century, when armourers revived medieval styles.'),'iso',chest,false],
      [t('Küçük Levhalar, Geniş Yüzey','Small scales, broad surfaces'),t('Lake sıralar ve ipek bağlar zırhın yüzeyini oluşturur. Parça ayrımı müze incelemesi içindir.','Lacquered rows and silk links form the surface. Separation is a museum inspection feature.'),'suspension',sidePanel,false],
      [t('Kabuto ve Ense Katmanları','Kabuto and neck layers'),t('Tepe bileziğini, siperliği ve dışa genişleyen ense sıralarını incele.','Find the crown fitting, visor and flared neck layers.'),'engine',bowl,false],
      [t('Omuzluklar ve Dört Parçalı Etek','Shoulder guards and four-part skirt'),t('İki geniş sode ve dört kusazuri, gövdenin çevresini tamamlar.','Two broad sode and four kusazuri complete the armour around the torso.'),'front',parts.skirtFront,false],
      [t('İç Mesnet ve Tekstil','Internal mount and textile'),t('Kesit görünümü, çağdaş destek ile dış zırhın ilişkisini gösterir.','The cutaway shows the relationship between the modern support and outer armour.'),'suspension',mannequin,true],
      [t('Kaynak, Renk ve Yorum','Source, colour and interpretation'),t('İpek örgüler ve bezemeler sadeleştirilmiştir. İç bağlantılar ve hareketler yaklaşık sergi yorumudur.','Silk lacing and ornament are simplified. Hidden attachments and movements are interpretive.'),'breech',back,false]
    ].map(([title,desc,cam,part,cutaway])=>({title,desc,cam,part,cutaway,explode:0,sub:'all'}));
    const ui=K.ui({
      cameraPadding: .78,
      title:t('Ō-YOROI — SAMURAY ZIRHI','Ō-YOROI — SAMURAI ARMOUR'),
      sub:t('Met 36.25.39a–p • 18. yüzyıl canlandırması • büyütülmüş müze yorumu','Met 36.25.39a–p • Eighteenth-century revival • enlarged exhibit'),
      subsystems:Object.entries(counts).map(([key,count])=>({key,label:key,count,color:'#a08c55'})),
      camLabels:{iso:t('Tam Takım','Full armour'),front:t('Ön','Front'),breech:t('Arka','Rear'),engine:t('Kabuto','Kabuto'),suspension:t('Levha ve Bağlar','Scales and lacing'),top:t('Üst','Top')},
      sliders:[
        {label:t('Panelleri Ayır (sergi)','Separate panels (exhibit)'),min:0,max:100,step:1,fmt:v=>Math.round(v)+'%'},
        {label:t('Kabutoyu Kaldır (sergi)','Lift kabuto (exhibit)'),min:0,max:100,step:1,fmt:v=>Math.round(v)+'%'},
        {label:t('Sergi Açısı','Exhibit angle'),min:-90,max:90,step:1,fmt:v=>Math.round(v)+'°'}
      ],
      buttons:{terrain:t('İç Mesnet ve Kutuyu Göster / Gizle','Show / hide mount and box'),sweep:t('Sergiyi Sıfırla','Reset exhibit')},
      telemetryTag:t('JAPONYA • EDO DÖNEMİ','JAPAN • EDO PERIOD'),
      statLabels:[t('PANEL AYRIMI','PANEL SEPARATION'),t('KABUTO','KABUTO'),t('SERGİ AÇISI','EXHIBIT ANGLE'),t('KAYNAK BOYU','SOURCE HEIGHT')]
    });
    sync();
    return {
      root,parts,ui,camPresets,tourSteps,defaultPart:chest,firePart:sidePanel,
      update:()=>{},
      onFire(){state.spread=state.spread>0?0:100;sync();return {ok:true};},
      fireButtonLabel:()=>t(state.spread?'PANELLERİ BİRLEŞTİR':'LEVHA VE BAĞLARI İNCELE',state.spread?'REASSEMBLE PANELS':'EXPLORE SCALES AND LACING'),
      mobileFireButtonLabel:()=>t(state.spread?'Birleştir':'Zırhı İncele',state.spread?'Reassemble':'Explore armour'),
      onSlider(index,value){
        if(!Number.isFinite(value))return {};
        if(index===0)state.spread=T.MathUtils.clamp(value,0,100);
        if(index===1)state.lift=T.MathUtils.clamp(value,0,100);
        if(index===2)state.turn=T.MathUtils.clamp(value,-90,90);
        sync();return {};
      },
      onButton(name){if(name==='terrain'){state.support=!state.support;sync();}else if(name==='sweep')reset();return {};},
      buttonActive:name=>name==='terrain'&&state.support,
      getSliderValues:()=>[state.spread,state.lift,state.turn],
      getStats:()=>[state.spread+' <span>%</span>',state.lift+' <span>%</span>',state.turn+' <span>°</span>','148.6 <span>cm</span>'],
      getStatus:()=>({text:t('18. YÜZYIL • CANLANDIRMA ZIRH','18TH CENTURY • REVIVAL ARMOUR'),color:'#a08c55'}),
      applyTextures:K.applyTextures,setTexture:K.setTexture,toggleRelief:K.toggleRelief
    };
  };
})();
