const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('giantbow',16),by=n=>ad.root.getObjectByName(n);
const close=(a,b)=>assert(Math.abs(a-b)<1e-5,`${a} != ${b}`);
for(let phase=0;phase<=100;phase++){
 ad.onSlider(1,phase);ad.root.updateMatrixWorld(true);
 const center=by('draw-slider').position;
 for(let i=0;i<2;i++){
  const tip=by('tip-'+(i?1:-1)),s=ad.parts.string.children[i],h=ad.parts.haul.children[i];
  assert(new T.Vector3(0,-.5,0).applyMatrix4(s.matrixWorld).distanceTo(tip.position)<1e-6);
  assert(new T.Vector3(0,.5,0).applyMatrix4(s.matrixWorld).distanceTo(center)<1e-6);
  const start=new T.Vector3(i?.08:-.08,1.15,center.z),end=new T.Vector3(i?.08:-.08,1.15,-2.8);
  assert(new T.Vector3(0,-.5,0).applyMatrix4(h.matrixWorld).distanceTo(start)<1e-6);
  assert(new T.Vector3(0,.5,0).applyMatrix4(h.matrixWorld).distanceTo(end)<1e-6);
  close(by('crank-'+(i?1:-1)).rotation.x,by('winch-drum').rotation.x);
 }
 close(by('tip--1').position.z,by('tip-1').position.z);
 for(const o of ad.parts.bow.children){for(const v of o.geometry.attributes.position.array)assert(Number.isFinite(v));assert(o.geometry.boundingSphere.radius>0);}
 close(ad.getSliderValues()[0],0);
}
for(const z of [-2.8,-.15,2.55])for(const side of [-1,1])close(new T.Box3().setFromObject(by('wheel-'+side+'-'+z)).min.y,0);
ad.onButton('sweep');ad.onFire();for(let i=0;i<120;i++)ad.update(.05);close(ad.getSliderValues()[1],100);close(ad.getSliderValues()[0],0);
ad.onFire();for(let i=0;i<120;i++)ad.update(.05);close(ad.getSliderValues()[1],0);close(ad.getSliderValues()[0],0);
ad.onFire();ad.onSlider(1,45);ad.update(.05);close(ad.getSliderValues()[1],45);
ad.onSlider(2,100);close(by('cover-0.25').position.y,1.71);
ad.onButton('terrain');assert(!ad.parts.scale.visible);
ad.onSlider(0,Infinity);ad.update(NaN);close(ad.getSliderValues()[0],0);
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);assert(ad.parts.scale.visible);
console.log(`PASS giantbow: 16 groups, ${meshes.length} meshes, 101 string/haul poses, six ground contacts, endpoint/reverse/manual/reset`);
