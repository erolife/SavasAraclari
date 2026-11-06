/* Shared geometry and UI helpers. Classic script; no network or module loader. */
(function () {
  'use strict';
  window.MuseumModelKit = function (ctx, id) {
    const T=ctx.THREE, root=new T.Group(), parts={}, meshes=[], details=[];
    root.visible=false;root.name=id;ctx.scene.add(root);
    const data=new Uint8Array(128*128*4);let seed=193;
    for(let i=0;i<128*128;i++){seed=(seed*1664525+1013904223)>>>0;const n=110+(seed>>>27);data.set([n,n,n,255],i*4);}
    const grain=new T.DataTexture(data,128,128,T.RGBAFormat);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(5,5);grain.needsUpdate=true;
    function material(color,metalness=.45,roughness=.65,paint=false){const m=new T.MeshStandardMaterial({color,metalness,roughness,bumpMap:grain,bumpScale:.003});m.userData.paint=paint;return m;}
    const mats={paint:material(0x4e5940,.35,.75,true),steel:material(0x647078,.75,.4),dark:material(0x252b2e,.55,.6),rubber:material(0x202324,0,.95),wood:material(0x71513b,0,.9),brass:material(0xa08046,.7,.5),white:material(0xd8d9d4,.25,.65,true),red:material(0x863e32,.25,.7),glass:new T.MeshStandardMaterial({color:0x8ab0bb,transparent:true,opacity:.38,roughness:.15,metalness:.15})};
    function part(key,name,sub,pos=[0,0,0],exp=[0,1,0],desc='',outer=false,parent=root){
      const g=ctx.createPartGroup({id:id+'_'+key,name,subsystem:sub,subLabel:sub,basePos:pos,explodeVec:exp,desc,material:'Metal, kauçuk ve kaplama',weight:'Parça kütlesi hesaplanmıyor',spec:'Müze referanslı görsel model; iç ölçüler yaklaşık',location:name,isOuterShell:outer});parent.add(g);parts[key]=g;return g;
    }
    function mesh(p,g,m=mats.paint,pos=[0,0,0],rot=[0,0,0]){const o=ctx.addCADMesh(p,g,m,pos,rot);meshes.push({o,color:m.color.clone(),paint:!!m.userData.paint});return o;}
    const box=(p,size,pos,mat=mats.paint,rot=[0,0,0])=>mesh(p,new T.BoxGeometry(...size),mat,pos,rot);
    const cyl=(p,r,h,pos,mat=mats.steel,axis='y',r2=r)=>mesh(p,new T.CylinderGeometry(r,r2,h,32),mat,pos,axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:[0,0,0]);
    const ring=(p,r,pos,mat=mats.steel,t=.018,rot=[0,0,0])=>mesh(p,new T.TorusGeometry(r,t,8,48),mat,pos,rot);
    const pipe=(p,pts,r=.02,mat=mats.steel)=>mesh(p,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(a=>new T.Vector3(...a))),24,r,8,false),mat);
    function beam(p,a,b,width=.06,mat=mats.steel){const av=new T.Vector3(...a),bv=new T.Vector3(...b),o=box(p,[width,av.distanceTo(bv),width],av.clone().add(bv).multiplyScalar(.5).toArray(),mat);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return o;}
    function instances(p,geo,mat,transforms){const o=ctx.addInstancedMesh(p,geo,mat,transforms.length),dummy=new T.Object3D();transforms.forEach((v,i)=>{dummy.position.set(...v.pos);dummy.rotation.set(...(v.rot||[0,0,0]));dummy.scale.set(...(v.scale||[1,1,1]));dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);});o.instanceMatrix.needsUpdate=true;meshes.push({o,color:mat.color.clone(),paint:!!mat.userData.paint});return o;}
    function bolts(p,r,z,count=24){const o=instances(p,new T.CylinderGeometry(.022,.022,.035,6),mats.steel,Array.from({length:count},(_,i)=>({pos:[r*Math.sin(i*2*Math.PI/count),r*Math.cos(i*2*Math.PI/count),z],rot:[Math.PI/2,0,0]})));details.push(o);return o;}
    function wheel(p,x,y,z,r=.5,width=.23){const w=new T.Group();w.position.set(x,y,z);p.add(w);cyl(w,r,width,[0,0,0],mats.rubber,'x');cyl(w,r*.58,width+.015,[0,0,0],mats.paint,'x');cyl(w,r*.22,width+.07,[0,0,0],mats.dark,'x');
      const tread=Array.from({length:36},(_,i)=>{const a=i*2*Math.PI/36;return {pos:[0,Math.sin(a)*(r-.018),Math.cos(a)*(r-.018)],rot:[-a,0,0]};});instances(w,new T.BoxGeometry(width+.015,.055,.09),mats.rubber,tread);return w;}
    function polygon(p,points,depth,mat=mats.paint){const s=new T.Shape();s.moveTo(...points[0]);points.slice(1).forEach(v=>s.lineTo(...v));s.closePath();return mesh(p,new T.ExtrudeGeometry(s,{depth,bevelEnabled:false}),mat);}
    let finish='original',relief=true;
    const schemes={original:{label:'Müze Görünümü',color:null},winter:{label:'Açık Kaplama (temsili)',color:0xa9ada5},dark:{label:'Koyu Kaplama (temsili)',color:0x333e39},sand:{label:'Toprak Kaplama (temsili)',color:0x8b7850}};
    function applyTextures(blueprint){meshes.forEach(({o,color,paint})=>{const c=paint&&schemes[finish].color!==null?new T.Color(schemes[finish].color):color;o.userData.origColor.copy(c);if(!blueprint)o.material.color.copy(c);o.material.bumpMap=relief?grain:null;});details.forEach(o=>o.visible=relief);}
    function ui(config){return {...config,partCount:Object.keys(parts).length+' Ana Grup',texTitle:'Yüzey ve Kaplama',textures:Object.entries(schemes).map(([key,s])=>({key,label:s.label})),textureLabel:()=>schemes[finish].label,activeTexture:()=>finish,relief:()=>relief,reliefLabel:v=>'Yüzey Ayrıntıları: '+(v?'AÇIK':'KAPALI')};}
    return {T,root,parts,meshes,mats,part,mesh,box,cyl,ring,pipe,beam,instances,bolts,wheel,polygon,ui,applyTextures,setTexture:k=>{if(schemes[k])finish=k;},toggleRelief:()=>{relief=!relief;return relief;}};
  };
})();
