const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('lantern',16),byName=n=>ad.root.getObjectByName(n);
const close=(a,b)=>assert(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const beam=byName('light-beam'),slide=byName('blade-slide'),shutter=byName('shutter');
ad.root.updateMatrixWorld(true);
const ray=new T.Raycaster(new T.Vector3(0,2.25,2),new T.Vector3(0,0,-1));
for(const key of ['shield','lining'])assert.equal(ray.intersectObject(ad.parts[key],true).length,0,'Blocked light port');
assert(ray.intersectObject(shutter,true).length>0,'Closed shutter must cover port');
assert.equal(beam.visible,false);close(beam.material.opacity,0);
const v=new T.Vector3();
for(let angle=0;angle<=110;angle++){
 ad.onSlider(0,angle);ad.root.updateMatrixWorld(true);close(shutter.rotation.x,-angle*Math.PI/180);
 const lid=shutter.children[0],positions=lid.geometry.attributes.position;
 for(let i=0;i<positions.count;i++){v.fromBufferAttribute(positions,i).applyMatrix4(lid.matrixWorld);assert(v.z>.065,'Shutter enters shield face');}
 assert.equal(beam.visible,angle>8);
}
assert.equal(ray.intersectObject(shutter,true).length,0,'Open shutter must clear light port');
const opacity=beam.material.opacity;assert(opacity>0);
ad.onButton('terrain');assert.equal(beam.visible,false);close(beam.material.opacity,0);
ad.onButton('terrain');close(beam.material.opacity,opacity);
const blade=slide.children[0];ad.onSlider(1,0);ad.root.updateMatrixWorld(true);
const start=new T.Box3().setFromObject(blade);
for(let amount=0;amount<=100;amount++){
 ad.onSlider(1,amount);close(slide.position.x,-amount*.0095);ad.root.updateMatrixWorld(true);
 const bb=new T.Box3().setFromObject(blade);
 assert(bb.min.y>1.16&&bb.max.y<1.30,'Blade outside clear guide channel');
 assert(bb.max.x>-.81,'Blade loses all overlap with guide');
 close(bb.min.z,start.min.z);close(bb.max.z,start.max.z);
}
close(start.min.x-new T.Box3().setFromObject(blade).min.x,.95);
for(let angle=0;angle<=35;angle++){ad.onSlider(2,angle);for(let i=0;i<4;i++)close(byName('finger-'+i).rotation.y,-angle*Math.PI/180);}
ad.update(NaN);ad.onSlider(0,Infinity);assert.equal(ad.getSliderValues()[0],110);
ad.onSlider(0,-10);ad.onSlider(1,999);ad.onSlider(2,999);assert.deepEqual(Array.from(ad.getSliderValues()),[0,100,35]);
ad.onFire();assert.equal(ad.getSliderValues()[0],100);ad.onFire();assert.equal(ad.getSliderValues()[0],0);
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);assert(ad.buttonActive('terrain'));
const cloth=ad.parts.lining.children[0].material.color.getHex();
for(const t of ad.ui.textures){ad.setTexture(t.key);ad.applyTextures(false);assert.equal(ad.parts.lining.children[0].material.color.getHex(),cloth);}
assert(!('bumpMap' in beam.material),'Display effect must retain BasicMaterial uniforms');
close(new T.Box3().setFromObject(ad.parts.pedestal).min.y,0);
console.log(`PASS lantern: 16 groups, ${meshes.length} meshes, light port/shutter, 111 shutter poses, 101 blade positions, finger limits, lamp/reset/finishes`);
