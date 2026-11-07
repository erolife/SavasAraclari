const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('maxim',20),find=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-6);
const jacket=ad.parts.jacket.children[0];ad.root.updateMatrixWorld(true);const original=jacket.getWorldPosition(new T.Vector3()).clone();
for(let i=0;i<=100;i++){ad.onSlider(0,i);close(find('recoil-illustration').position.x,.12*Math.sin(i*Math.PI/100)**2);ad.onSlider(1,i);close(find('lid-hinge').rotation.z,Math.min(i,65)*Math.PI/180);ad.root.updateMatrixWorld(true);assert(jacket.getWorldPosition(new T.Vector3()).distanceTo(original)<1e-6);}
// The top lid and sight share the hinge, while the jacket remains fixed.
assert.equal(ad.parts.cover.parent,find('lid-hinge'));assert.equal(ad.parts.sights.parent,find('lid-hinge'));assert.equal(ad.parts.barrel.parent,find('recoil-illustration'));
ad.onButton('sweep');ad.root.updateMatrixWorld(true);
const ray=new T.Raycaster(new T.Vector3(.27,1.96,2),new T.Vector3(0,0,-1));assert.equal(ray.intersectObjects(ad.parts.shell.children).length,0,'feed opening must cut through both side plates');
ad.onFire();ad.update(.08);assert(ad.getSliderValues()[0]>0);ad.onSlider(0,50);ad.update(.08);close(ad.getSliderValues()[0],50);ad.onSlider(0,NaN);close(ad.getSliderValues()[0],50);
ad.onSlider(1,999);close(ad.getSliderValues()[1],65);ad.onSlider(2,-999);close(ad.getSliderValues()[2],-35);
ad.onButton('terrain');assert.equal(find('belt-display').visible,false);ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);assert.equal(find('belt-display').visible,true);ad.update(1);close(ad.getSliderValues()[0],0);
ad.onFire();for(let i=0;i<200;i++)ad.update(.1);assert(ad.getSliderValues()[0]>=0&&ad.getSliderValues()[0]<100);ad.onFire();const phase=ad.getSliderValues()[0];ad.update(.1);close(ad.getSliderValues()[0],phase);
console.log(`PASS maxim: 20 groups, ${meshes.length} meshes; 101 poses, fixed jacket, hinge hierarchy, true feed openings, manual override, reset, limits and pause`);
