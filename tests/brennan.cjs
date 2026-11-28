const {common,load,THREE,assert}=require('./model-harness.cjs');
const {ad,meshes}=common('brennan',26);
function ends(o){ad.root.updateMatrixWorld(true);return [-.5,.5].map(y=>o.localToWorld(new THREE.Vector3(0,y,0)));}
const rods=meshes.filter(o=>o.parent===ad.parts.wires);
for(let i=0;i<=100;i++){
 ad.onSlider(1,-30+i*.6);ad.onSlider(2,i);
 const torpedo=ad.parts.lower.parent;
 for(let k=0;k<2;k++){
  const a=ends(rods[k*2]),b=ends(rods[k*2+1]);
  assert(a[1].distanceTo(b[0])<1e-8||a[0].distanceTo(b[1])<1e-8,'wire segments stay connected');
  const target=torpedo.localToWorld(new THREE.Vector3(-2.34,.05,k?.20:-.20));
  assert(Math.min(...b.map(v=>v.distanceTo(target)))<1e-8,'wire stays in fairlead');
 }
 assert(Math.abs(ad.parts.lid.parent.position.y-i*.012)<1e-8);
}
ad.onButton('sweep');ad.onFire();ad.update(.05);
assert(ad.parts.prop0.parent.rotation.x*ad.parts.prop1.parent.rotation.x<0,'propellers turn oppositely');
ad.onSlider(0,0);const angle=ad.parts.prop0.parent.rotation.x;ad.onFire();ad.update(.05);assert.equal(ad.parts.prop0.parent.rotation.x,angle,'zero speed stops movement');
ad.onSlider(0,Infinity);ad.onSlider(0,NaN);assert.equal(ad.getSliderValues()[0],0);ad.onSlider(1,500);assert.equal(ad.getSliderValues()[1],30);
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[35,0,0]);assert(Math.abs(ad.parts.prop0.parent.rotation.x)<1e-10);
const english=load('brennan',{window:{MuseumPreferences:{language:'en'}}}).ad;
for(const p of Object.values(english.parts))assert(!/[çğıöşüÇĞİÖŞÜ]/.test(p.userData.name+p.userData.desc+p.userData.spec));
console.log('Brennan: continuous wires, contra-rotation, zero speed, reset and English verified.');
