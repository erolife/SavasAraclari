const {common,load,THREE,assert}=require('./model-harness.cjs');
const {ad,meshes}=common('kerrison',28);
const cable=meshes.filter(o=>o.parent===ad.parts.cable);
function ends(o){return [-.5,.5].map(y=>o.localToWorld(new THREE.Vector3(0,y,0)));}
for(let i=0;i<=100;i++){
 ad.onSlider(0,-150+3*i);ad.onSlider(1,i*.25);ad.onSlider(2,i);ad.root.updateMatrixWorld(true);
 for(let k=0;k<2;k++){const a=ends(cable[k]),b=ends(cable[k+1]);assert(Math.min(a[0].distanceTo(b[1]),a[1].distanceTo(b[0]))<1e-8,'continuous cable');}
 const start=ad.parts.socket.parent.localToWorld(new THREE.Vector3(.43,.28,-.56));assert(Math.min(...ends(cable[0]).map(v=>v.distanceTo(start)))<1e-8,'cable stays attached to traversing head');
 // Adjacent external gear pitch circles meet, and their rotations have opposite signs.
 const a=ad.parts.gear0.parent,b=ad.parts.gear1.parent;
 assert(Math.abs(a.position.distanceTo(b.position)-.30)<1e-8);
 assert(a.rotation.z*b.rotation.z<=0);
 const scopeBounds=new THREE.Box3().setFromObject(ad.parts.scope0);assert(scopeBounds.min.y>2.55,'eyepiece clears the fixed upper housing throughout pitch range');
}
ad.onButton('sweep');ad.onFire();ad.update(.05);assert.notEqual(ad.getSliderValues()[0],0);ad.onSlider(0,33);ad.update(.05);assert.equal(ad.getSliderValues()[0],33,'manual input takes control');
ad.onSlider(1,1e5);assert.equal(ad.getSliderValues()[1],25);ad.onSlider(1,NaN);assert.equal(ad.getSliderValues()[1],25);
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,12,0]);
const en=load('kerrison',{window:{MuseumPreferences:{language:'en'}}}).ad;
for(const p of Object.values(en.parts))assert(!/[çğıöşüÇĞİÖŞÜ]/.test(p.userData.name+p.userData.desc+p.userData.spec));
console.log('Kerrison: tripod, 101 cable/gear/optics poses, manual override, clamps, reset and English verified.');
