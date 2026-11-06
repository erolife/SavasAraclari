const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('organ33',16),by=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-5);
for(let a=0;a<=360;a+=5){ad.onSlider(0,a);ad.root.updateMatrixWorld(true);for(let row=0;row<3;row++)for(let i=0;i<11;i++){
 const o=by('barrel-'+row+'-'+i),p=o.geometry.attributes.position,v=new T.Vector3();
 for(let j=0;j<p.count;j++){v.fromBufferAttribute(p,j).applyMatrix4(o.matrixWorld);assert(v.y>.15,'Ground clearance');assert(v.z>-.96,'Rear frame clearance');assert(Math.abs(v.x)<.92,'Side rail clearance');}
 close(by('row-rotor-'+row).rotation.x,a*Math.PI/180);
}}
ad.onButton('sweep');ad.root.updateMatrixWorld(true);
// Mouth ray passes through the opening; lip ray meets the rim first.
for(let row=0;row<3;row++)for(let i=0;i<11;i++){
 const o=by('barrel-'+row+'-'+i),dir=new T.Vector3(0,-1,0).transformDirection(o.matrixWorld),origin=o.localToWorld(new T.Vector3(0,1.2,0));
 const hit=new T.Raycaster(origin,dir).intersectObject(o)[0];assert(hit&&hit.distance>.3);
 const rim=o.localToWorld(new T.Vector3(.05,1.2,0));assert(new T.Raycaster(rim,dir).intersectObject(o)[0].distance<.15);
}
for(const a of [120,240,360]){ad.onFire();for(let i=0;i<80;i++)ad.update(.05);close(ad.getSliderValues()[0],a);ad.update(.05);close(ad.getSliderValues()[0],a);}
ad.onFire();ad.onSlider(0,47);ad.update(.05);close(ad.getSliderValues()[0],47);ad.onSlider(1,25);ad.onFire();close(ad.getSliderValues()[1],0);
ad.onButton('sweep');ad.onButton('terrain');assert(by('barrel-0-0').material.emissive.getHex()>0);assert.equal(by('barrel-1-0').material.emissive.getHex(),0);
ad.onSlider(2,100);close(by('bed-0').position.y,.3);ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);
console.log(`PASS organ33: 16 groups, ${meshes.length} meshes, 33 real mouths, 73 rotation clearances, three indexed stops, manual/lift interlock/reset`);
