/* J79-GE-15 educational cutaway. Sources and approximations: INCELEME_NOTLARI.md.
 * One unit = one metre; intake +Z, exhaust -Z. No thermodynamic solver.
 */
(function () {
  'use strict';
  window.VehicleBuilders = window.VehicleBuilders || {};
  window.VehicleBuilders.j79 = function buildJ79(ctx) {
    const { THREE: T, scene, addCADMesh, createPartGroup, addInstancedMesh } = ctx;
    const root = new T.Group(); root.visible = false;
    scene.add(root);
    const Y = 1.15;
    const S = { throttle: 35, vane: 15, nozzle: 35, automatic: true, flow: true,
      afterburner: false, phase: 0, time: 0, finish: 'metal', relief: true };
    const parts = {}, surfaces = [], rotors = [], vanes = [], petals = [], fasteners = [];
    const metal = new T.MeshStandardMaterial({ color: 0x8b979d, metalness: 0.75, roughness: 0.38 });
    const dark = new T.MeshStandardMaterial({ color: 0x38454e, metalness: 0.7, roughness: 0.55 });
    const hot = new T.MeshStandardMaterial({ color: 0x9c6b4e, metalness: 0.65, roughness: 0.5 });
    const grainData=new Uint8Array(128*128*4);let grainSeed=719;
    for(let i=0;i<128*128;i++){grainSeed=(grainSeed*1664525+1013904223)>>>0;const v=110+(grainSeed>>>27);grainData.set([v,v,v,255],i*4);}
    const grain=new T.DataTexture(grainData,128,128,T.RGBAFormat);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(6,6);grain.needsUpdate=true;
    const blue = new T.MeshStandardMaterial({ color: 0x347b9a, metalness: 0.4, roughness: 0.5 });
    metal.bumpMap=grain;metal.bumpScale=0.0015;hot.bumpMap=grain;hot.bumpScale=0.002;
    const labels = { cold: 'Giriş ve Kompresör', core: 'Yanma ve Türbin', exhaust: 'Art Yakıcı ve Egzoz', frame: 'Karter ve Kaide' };
    function part(id, name, sub, z, exp, desc, outer = false) {
      const g = createPartGroup({ id: 'j79_' + id, name, subsystem: sub, subLabel: labels[sub],
        basePos: [0, Y, z], explodeVec: exp, desc, isOuterShell: outer,
        material: 'Metal alaşımları (görsel temsil)', weight: 'Parça kütlesi modellenmedi',
        spec: 'GE-15 referanslı eğitim modeli; iç ölçüler yaklaşık', location: 'Motor ekseni (+Z giriş / −Z egzoz)' });
      root.add(g); parts[id] = g; return g;
    }
    function mesh(parent, geometry, material, pos = [0, 0, 0], rot = [0, 0, 0]) {
      const m = addCADMesh(parent, geometry, material, pos, rot);
      surfaces.push({ mesh: m, color: material.color.clone() }); return m;
    }
    const box = (p, size, pos, mat = dark) => mesh(p, new T.BoxGeometry(...size), mat, pos);
    const cylinder = (p, r, h, pos, mat = metal) => mesh(p, new T.CylinderGeometry(r, r, h, 48), mat, pos, [Math.PI / 2, 0, 0]);
    const ring = (p, r, pos, mat = metal, tube = 0.025) => mesh(p, new T.TorusGeometry(r, tube, 8, 64), mat, pos);
    function sleeve(p, r, length, z, mat) {
      return mesh(p, new T.CylinderGeometry(r, r, length, 64, 1, true), mat, [0, 0, z], [Math.PI / 2, 0, 0]);
    }
    function airfoil(height,chord) {
      // Tapered, swept airfoil; local radial direction is +Y.
      const vertices=[],indices=[];const sections=8;
      for(let j=0;j<=sections;j++) {const t=j/sections,y=(t-0.5)*height,c=chord*(1-0.35*t),sweep=0.018*t*t;
        for(let k=0;k<12;k++){const a=k*Math.PI/6;vertices.push(Math.sin(a)*0.009*(1-0.6*t),y,Math.cos(a)*c/2+sweep);}}
      for(let j=0;j<sections;j++)for(let k=0;k<12;k++){const a=j*12+k,b=j*12+(k+1)%12,c=a+12,d=b+12;indices.push(a,b,c,b,d,c);}
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
    }
    function pipe(parent,points,r,mat=metal){return mesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),32,r,8,false),mat);}
    function boltRing(parent,r,z,count=32){const b=addInstancedMesh(parent,new T.CylinderGeometry(0.013,0.013,0.022,6),dark,count),o=new T.Object3D();for(let i=0;i<count;i++){const a=i*2*Math.PI/count;o.position.set(Math.sin(a)*r,Math.cos(a)*r,z);o.rotation.x=Math.PI/2;o.updateMatrix();b.setMatrixAt(i,o.matrix);}b.instanceMatrix.needsUpdate=true;surfaces.push({mesh:b,color:dark.color.clone()});fasteners.push(b);}
    function bladeRow(parent, radius, hub, z, count, material, twist) {
      // Repeated airfoils share one geometry and one draw call per row.
      const geo = airfoil(radius - hub, 0.065);
      const row = addInstancedMesh(parent, geo, material, count);
      surfaces.push({mesh: row, color: material.color.clone()});
      const obj = new T.Object3D();
      for (let i = 0; i < count; i++) {
        const a = i * Math.PI * 2 / count;
        obj.position.set(-Math.sin(a) * (radius + hub) / 2, Math.cos(a) * (radius + hub) / 2, z);
        obj.rotation.set(0, twist, a); obj.updateMatrix(); row.setMatrixAt(i, obj.matrix);
      }
      row.instanceMatrix.needsUpdate = true;
      return row;
    }
    const inlet = part('inlet', '1. Giriş Çerçevesi', 'cold', 2.35, [0, 0, 1.5], 'Hava önden girer. Giriş çapı ve iç geometri müze ölçülerine göre yaklaşık oranlanmıştır.');
    ring(inlet, 0.47, [0, 0, 0]);
    const cone = mesh(inlet, new T.ConeGeometry(0.14, 0.42, 32), metal, [0, 0, -0.05], [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; const b = box(inlet, [0.025, 0.32, 0.08], [-Math.sin(a)*0.3,Math.cos(a)*0.3,-0.18]); b.rotation.z = a; }
    const compressor = part('compressor', '2. Kompresör: 17 Rotor Kademesi', 'cold', 0, [0, 0.7, 0.5], 'Müze kaydı: 17 kademeli eksenel kompresör. Kanat adetleri ve profilleri temsili; CFD veya basınç hesabı yapılmaz.');
    const rotor = new T.Group(); compressor.add(rotor); rotors.push(rotor);
    for (let i = 0; i < 17; i++) {
      const z = 2.05 - i * 0.105, r = 0.43 - i * 0.004;
      cylinder(rotor, 0.16 + i * 0.004, 0.035, [0,0,z], dark);
      bladeRow(rotor, r, 0.17 + i * 0.004, z, 28, metal, 0.35);
    }
    const stator = part('stator', '3. Sabit Stator Sıraları', 'cold', 0, [0,-0.25,0], 'Rotor sıraları arasındaki statorlar gövdeye sabittir. Dönen rotorla birlikte dönmezler.');
    for(let i=6;i<17;i++) bladeRow(stator,0.445-i*0.004,0.18+i*0.004,2.00-i*0.105,28,dark,-0.3);
    const variable = part('variable', '4. Değişken Stator Gösterimi', 'cold', 0, [0,0.8,0], 'GE, J79 değişken statorlarının farklı hava akışlarına uyumu sağladığını açıklar. İlk altı sıra burada temsili açı çizelgesiyle hareket eder; gerçek kontrol programı değildir.');
    for(let k=0;k<6;k++) for(let i=0;i<16;i++) {
      const a=i*2*Math.PI/16, p=new T.Group(); p.position.set(-Math.sin(a)*0.30,Math.cos(a)*0.30,2.00-k*0.105);p.rotation.z=a;variable.add(p);
      const blade=mesh(p,airfoil(0.25,0.065),metal);vanes.push(blade);
    }
    const shaft = part('shaft', '5. Tek Ortak Şaft', 'core', 0, [0,1.3,0], 'Türbin kompresörü aynı şaft üzerinden döndürür. İki rotor aynı animasyon fazını paylaşır.');
    cylinder(shaft,0.085,3.35,[0,0,0.43],dark);
    const diffuser = part('diffuser', '6. Difüzör', 'core', 0.15, [0,0.5,0], 'Kompresörden çıkan hava yanma bölmesine yönelir. Genişleyen geçit eğitim amacıyla sadeleştirilmiştir.');
    sleeve(diffuser,0.43,0.22,0,metal);ring(diffuser,0.43,[0,0,0.11]);
    const combustor = part('combustor', '7. Borulu-Halkalı Yanma Bölgesi', 'core', -0.35, [0,1,0], 'J79 ailesinin kan-annüler yanma düzeni. On alev tüpü temsili yerleşimle gösterilir; yakıt debisi veya sıcaklık hesabı yoktur.');
    for(let i=0;i<10;i++) {const a=i*2*Math.PI/10;sleeve(combustor,0.095,0.65,0,hot).position.set(Math.sin(a)*0.28,Math.cos(a)*0.28,0);}
    const manifold = part('manifold', '8. Yakıt Dağıtım Halkası', 'core', 0.02, [0,1.2,0], 'Yakıt dağıtımının şematik halkası. Renkler parçaları ayırt etmek içindir.');ring(manifold,0.28,[0,0,0],hot,0.018);
    const turbine = part('turbine', '9. Üç Kademeli Türbin', 'core', 0, [0,0.8,-0.3], 'Müze kaydı: üç eksenel türbin kademesi. Türbin ve kompresör 1:1 aynı şaft üzerinde döner.');
    const turbineRotor=new T.Group();turbine.add(turbineRotor);rotors.push(turbineRotor);
    for(let i=0;i<3;i++){const z=-0.85-i*0.14;cylinder(turbineRotor,0.18,0.04,[0,0,z],dark);bladeRow(turbineRotor,0.39,0.18,z,32,hot,0.4);bladeRow(turbine,0.405,0.19,z+0.065,32,dark,-0.35);}
    const tail = part('tail', '10. Egzoz Konisi', 'exhaust', -1.35, [0,0,-0.5], 'Türbin çıkış gazının art yakıcı kanalına geçişi.');
    mesh(tail,new T.ConeGeometry(0.18,0.5,32),dark,[0,0,0],[-Math.PI/2,0,0]);
    const burner=part('burner','11. Art Yakıcı Halkaları','exhaust',-1.65,[0,0.6,-0.6],'Türbin sonrasında ek yanma gösterimi. Düğme yalnızca gaz kolu sıfırdan büyükken etkinleşir; eşik bir motor işletme prosedürü değildir.');
    for(const r of [0.19,0.33])ring(burner,r,[0,0,0],hot,0.02);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;const b=box(burner,[0.025,0.38,0.03],[-Math.sin(a)*0.20,Math.cos(a)*0.20,0],hot);b.rotation.z=a;}
    const nozzle=part('nozzle','12. Değişken Alanlı Egzoz','exhaust',-2.05,[0,0,-1],'Art yakıcıyla egzoz açıklığı değişir. Buradaki 24 yaprak, menteşe açıları ve otomatik çizelge temsili geometridir.');
    ring(nozzle,0.44,[0,0,0],dark);
    for(let i=0;i<24;i++){const a=i*2*Math.PI/24,p=new T.Group();p.position.set(-Math.sin(a)*0.44,Math.cos(a)*0.44,0);p.rotation.z=a;nozzle.add(p);
      const leaf=box(p,[0.12,0.025,0.59],[0,0,-0.295],hot);box(p,[0.018,0.018,0.51],[0,0.025,-0.28],dark);petals.push(p);}
    const casing=part('casing','13. Ayrılabilir Dış Karter','frame',0,[1.2,0.9,0],'X-Ray dış kabuğu saydamlaştırır. GE-15 müze ölçüleri: uzunluk yaklaşık 5,31 m, çap 0,965 m. Gövde ve iç bileşenler sadeleştirilmiştir.',true);
    // Changing diameters and bolted seams reproduce the assembled engine silhouette.
    const profile=[[-2.04,0.455],[-1.85,0.46],[-1.3,0.45],[-1.12,0.43],[-1.05,0.49],[-0.8,0.51],[-0.55,0.52],[-0.2,0.50],[0.1,0.47],[0.24,0.43],[0.7,0.445],[1.3,0.47],[1.85,0.48],[2.2,0.475]];
    for(let k=0;k<profile.length-1;k++){
      const [z0,r0]=profile[k],[z1,r1]=profile[k+1];
      mesh(casing,new T.CylinderGeometry(r1,r0,z1-z0,64,1,true),k<5?hot:metal,[0,0,(z0+z1)/2],[Math.PI/2,0,0]);
    }
    for(const [z,r] of [[2.20,0.49],[1.85,0.495],[0.70,0.46],[0.24,0.45],[0.10,0.49],[-0.8,0.53],[-1.12,0.46],[-1.85,0.48]]){ring(casing,r,[0,0,z],dark,0.018);boltRing(casing,r,z);}
    // Split-case longitudinal seam strips.
    for(const x of [-0.475,0.475])box(casing,[0.028,0.035,1.95],[x,0,1.20],dark);
    // External variable-stator unison rings, levers and longitudinal control rod.
    for(let k=0;k<6;k++){
      const z=2.00-k*0.105;ring(variable,0.505,[0,0,z],dark,0.009);
      for(let i=0;i<12;i++){const a=i*Math.PI/6;const lever=box(variable,[0.018,0.018,0.072],[Math.sin(a)*0.51,Math.cos(a)*0.51,z],metal);lever.rotation.z=-a;}
    }
    pipe(variable,[[0.52,0,2.07],[0.54,0,1.7],[0.54,0,1.38],[0.48,-0.15,1.20]],0.014);
    const accessory=part('accessory','14. Aksesuar Kutusu ve Borular','frame',0.6,[0,-0.3,0.5],'Gövde altındaki aksesuar kutusu ve servis boruları yalnızca görsel temsildir.');box(accessory,[0.5,0.20,0.65],[0,-0.54,0]);
    for(const x of [-0.18,0.18])cylinder(accessory,0.035,1,[x,-0.42,0],hot);
    // Gearbox housings, filter canisters, harnesses, fuel and lubrication lines.
    for(const [x,y,z,r,h] of [[0.25,-0.49,0.25,0.11,0.28],[-0.27,-0.49,0.4,0.13,0.32],[0.08,-0.64,-0.05,0.09,0.3]]){cylinder(accessory,r,h,[x,y,z],dark);ring(accessory,r,[x,y,z+h/2],metal,0.012);}
    for(let i=0;i<12;i++) {
      const a=i*2*Math.PI/12, r=0.55, x=Math.sin(a)*r,y=Math.cos(a)*r;
      pipe(accessory,[[x*0.8,y*0.8,-0.6],[x,y,-0.45],[x,y,0.25],[x*0.92,y*0.92,0.45]],0.008,i%3?metal:hot);
    }
    for(const side of [-1,1])for(let i=0;i<5;i++){
      const y=-0.23+i*0.095,x=side*(0.48+0.015*i);
      pipe(accessory,[[side*0.2,-0.55,0],[x,-0.40,0.15],[x,y,0.45],[x,y,1.2],[side*0.4,y,1.45]],0.009,i%2?dark:metal);
      ring(accessory,0.025,[x,y,0.7],dark,0.006);
    }
    // Rear actuator cylinders and articulated rods mounted to the nozzle collar.
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6,x=Math.sin(a)*0.49,y=Math.cos(a)*0.49;
      cylinder(nozzle,0.025,0.22,[x,y,0.16],dark);cylinder(nozzle,0.012,0.25,[x,y,-0.04],metal);
      ring(nozzle,0.025,[x,y,0.27],metal,0.008);
    }
    const stand=part('stand','15. Motor Bakım Arabası','frame',0,[0,0,0],'Tekerlekli motor bakım arabası, iki dairesel yatak ve taşıyıcı şasi. Sergileme donanımı motordan ayrıdır.');
    for(const x of [-0.60,0.60])box(stand,[0.09,0.11,3.8],[x,-0.89,0],blue);
    for(const z of [-1.5,1.5]){
      box(stand,[1.4,0.10,0.09],[0,-0.89,z],blue);
      for(const x of [-0.55,0.55]){box(stand,[0.07,0.48,0.09],[x,-0.62,z],blue);pipe(stand,[[x,-0.89,z],[x,-0.46,z],[Math.sign(x)*0.35,-0.35,z]],0.035,blue);
        const wheel=mesh(stand,new T.CylinderGeometry(0.14,0.14,0.10,20),dark,[x,-Y+0.14,z],[0,0,Math.PI/2]);
        mesh(stand,new T.CylinderGeometry(0.06,0.06,0.12,16),metal,[x,-Y+0.14,z],[0,0,Math.PI/2]);}
      mesh(stand,new T.TorusGeometry(0.50,0.035,8,48,Math.PI),blue,[0,0,z],[0,0,Math.PI]);
    }
    // Unregistered effects are intentionally excluded from picking/material changes.
    const particles=new T.Group();root.add(particles);const dots=[];
    const dotGeo=new T.SphereGeometry(0.025,6,4);
    for(let i=0;i<60;i++){const m=new T.Mesh(dotGeo,new T.MeshBasicMaterial({color:0x38bdf8,transparent:true,opacity:0.8,depthWrite:false}));particles.add(m);dots.push(m);}
    const flame=new T.Mesh(new T.ConeGeometry(0.32,1.2,32,1,true),new T.MeshBasicMaterial({color:0xff8c37,transparent:true,opacity:0.3,side:T.DoubleSide,depthWrite:false}));
    flame.rotation.x=-Math.PI/2;flame.position.set(0,Y,-3.25);root.add(flame);
    function regulate(){if(S.automatic){S.vane=30*(1-S.throttle/100);S.nozzle=S.afterburner?90:25+S.throttle*0.2;}}
    function update(dt){
      dt=Number.isFinite(dt)?Math.max(0,Math.min(dt,0.05)):0;regulate();
      const omega=S.throttle/100*3;S.phase=(S.phase+omega*dt)%(2*Math.PI);S.time+=dt;
      rotors.forEach(r=>r.rotation.z=S.phase);vanes.forEach(v=>v.rotation.y=S.vane*Math.PI/180);
      petals.forEach(p=>p.rotation.x=-(0.35-S.nozzle/100*0.45));
      particles.visible=S.flow&&S.throttle>0;
      dots.forEach((m,i)=>{const z=2.55-((i/60*5.2+S.time*S.throttle/100*1.4)%5.2),a=i*2.399;
        m.position.set(Math.sin(a)*0.33,Y+Math.cos(a)*0.33,z);m.material.color.setHex(z>0.1?0x38bdf8:z> -0.8?0xfb923c:0xef4444);});
      flame.visible=S.afterburner&&S.throttle>0;flame.scale.y=0.9+0.1*Math.sin(S.time*12);
    }
    function onSlider(i,value){if(!Number.isFinite(value))return {};if(i===0){S.throttle=T.MathUtils.clamp(value,0,100);if(!S.throttle)S.afterburner=false;}if(i===1){S.automatic=false;S.vane=T.MathUtils.clamp(value,0,30);}if(i===2){S.automatic=false;S.nozzle=T.MathUtils.clamp(value,0,100);}update(0);return {};}
    function onFire(){if(!S.throttle)return {ok:false,msg:'Önce gaz kolunu sıfırdan büyük bir değere getirin.'};S.afterburner=!S.afterburner;update(0);return {ok:true};}
    function applyTextures(blueprint){surfaces.forEach(({mesh:m,color})=>{const c=color.clone();if(S.finish==='study')c.lerp(new T.Color(0x4b9abc),0.35);if(S.finish==='warm')c.lerp(new T.Color(0xb47c45),0.3);if(S.finish==='dark')c.multiplyScalar(0.6);m.userData.origColor.copy(c);if(!blueprint)m.material.color.copy(c);});fasteners.forEach(m=>m.visible=S.relief);}
    const camPresets={iso:{pos:[5.4,3.2,5.4],look:[0,Y,0]},front:{pos:[0,1.8,6],look:[0,Y,1]},breech:{pos:[4,2.7,-0.2],look:[0,Y,-0.4]},engine:{pos:[3,2.6,2],look:[0,Y,1]},suspension:{pos:[3,2,-5],look:[0,Y,-2]},top:{pos:[0.01,7,0],look:[0,Y,0]}};
    const tourSteps=[
      ['J79-GE-15: Tek Şaftlı Turbojet','Müze referanslı eğitim modeli. X-Ray ile hava girişinden egzoza kadar iç yapıyı inceleyin.','iso',inlet,false],
      ['17 Kompresör Kademesi','Rotorlar döner, statorlar sabit kalır. Görsel dönüş en fazla 3 rad/sn; gerçek motor devri değildir.','engine',compressor,true],
      ['Değişken Stator','Stator açısını elle değiştirince otomatik çizelge kapanır. Otomatik düğmesiyle yeniden bağlayabilirsiniz.','front',variable,true],
      ['Yanma ve Üç Türbin Kademesi','Türbin ve kompresör aynı şaft üzerindedir. Akış renkleri bölgeyi gösterir; sıcaklık ölçümü değildir.','breech',turbine,true],
      ['Art Yakıcı ve Egzoz','Art yakıcıyı açın. Otomatik düzen etkinse yapraklar daha geniş açıklığa geçer. Elle verilen açıklık korunur.','suspension',nozzle,true],
      ['15 Grubu Ayırın','Karter, rotorlar, sabit sıralar, yanma bölgesi ve egzozu ayrı inceleyin. İç ölçüler ve kanat profilleri yaklaşık.','iso',casing,false]
    ].map((s,i)=>({title:s[0],desc:s[1],cam:s[2],part:s[3],cutaway:s[4],explode:i===5?75:0,sub:'all'}));
    const ui={title:'GENERAL ELECTRIC J79-GE-15 — Turbojet Kesiti',sub:'17 kompresör + 3 türbin kademesi • Tek şaft • Müze referanslı, yavaşlatılmış eğitim gösterimi',partCount:'15 Ana Grup',texTitle:'Malzeme Görünümü',textures:[{key:'metal',label:'Metal'},{key:'study',label:'Mavi İnceleme'},{key:'warm',label:'Sıcak Metal'},{key:'dark',label:'Koyu Metal'}],textureLabel:()=> 'Temsili malzeme: '+S.finish,activeTexture:()=>S.finish,relief:()=>S.relief,reliefLabel:on=>'Bağlantı Detayları: '+(on?'AÇIK':'KAPALI'),subsystems:[{key:'cold',label:labels.cold,count:4,color:'#38bdf8'},{key:'core',label:labels.core,count:5,color:'#fb923c'},{key:'exhaust',label:labels.exhaust,count:3,color:'#ef4444'},{key:'frame',label:labels.frame,count:3,color:'#64748b'}],camLabels:{iso:'İzometrik',front:'Hava Girişi',breech:'Yanma ve Türbin',engine:'Kompresör',suspension:'Egzoz',top:'Üst Kesit'},sliders:[{label:'Gaz Kolu (Gösterim)',min:0,max:100,step:1,fmt:v=>'%'+Math.round(v)},{label:'Stator Açısı (Temsili)',min:0,max:30,step:1,fmt:v=>v.toFixed(1)+'°'},{label:'Egzoz Açıklığı (Temsili)',min:0,max:100,step:1,fmt:v=>'%'+Math.round(v)}],buttons:{terrain:'Otomatik Stator / Egzoz',sweep:'Renkli Akış Gösterimi'},telemetryTag:'GE-15 • EĞİTİM MODELİ',statLabels:['GAZ KOLU','GÖRSEL DÖNÜŞ','ART YAKICI','EGZOZ AÇIKLIĞI']};
    update(0);
    return {root,parts,ui,camPresets,tourSteps,defaultPart:inlet,firePart:burner,update,onSlider,onFire,
      onButton:name=>{if(name==='terrain')S.automatic=!S.automatic;if(name==='sweep')S.flow=!S.flow;update(0);return {};},buttonActive:name=>name==='terrain'?S.automatic:S.flow,
      fireButtonLabel:()=>S.afterburner?'ART YAKICIYI KAPAT':'ART YAKICI GÖSTERİMİ',getSliderValues:()=>[S.throttle,S.vane,S.nozzle],getStats:()=>[`${S.throttle} <span>%</span>`,`${(S.throttle/100*3).toFixed(2)} <span>rad/sn (yavaş)</span>`,`${S.afterburner?'AÇIK':'KAPALI'} <span>Gösterim</span>`,`${Math.round(S.nozzle)} <span>%</span>`],getStatus:()=>({text:!S.throttle?'DURDU':S.afterburner?'ART YAKICI GÖSTERİMİ':'KURU ÇALIŞMA GÖSTERİMİ',color:S.afterburner?'#ea580c':'#0284c7'}),applyTextures,setTexture:key=>{if(['metal','study','warm','dark'].includes(key))S.finish=key;},toggleRelief:()=>{S.relief=!S.relief;return S.relief;}};
  };
})();
