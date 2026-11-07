const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('archimedes',18),find=n=>ad.root.getObjectByName(n);
const close=(a,b)=>assert(Math.abs(a-b)<1e-5,`${a} != ${b}`);
const v=new T.Vector3(),tip=new T.Vector3(),hook=find('hook-mount'),hang=find('hanging'),pivot=find('boom-pivot');
for(let angle=0;angle<=30;angle++)for(const yaw of [-20,0,20])for(const length of [2,2.8]){
 ad.onSlider(0,angle);ad.onSlider(1,yaw);ad.onSlider(2,length);ad.root.updateMatrixWorld(true);
 pivot.localToWorld(tip.set(4.45,-.22,0));hang.getWorldPosition(v);close(v.distanceTo(tip),0);
 hook.getWorldPosition(v);close(tip.y-v.y,length);close(tip.x,v.x);close(tip.z,v.z);
 assert(new T.Box3().setFromObject(ad.parts.hull).min.y>.22,'Boat goes through water plinth');
 assert(new T.Box3().setFromObject(ad.parts.hull).min.x>1.3,'Boat hits wall');
 const rope=ad.parts.cable.children[0],p=rope.geometry.attributes.position;assert(p.count>0);
 const end=new T.Vector3(0,rope.geometry.parameters.height/2,0).applyMatrix4(rope.matrixWorld);
 pivot.localToWorld(tip.set(-2.1,0,0));close(end.distanceTo(tip),0);
}
ad.onButton('sweep');ad.onFire();ad.update(.05);assert(ad.getSliderValues()[0]>0);ad.onSlider(0,12);ad.update(.05);close(ad.getSliderValues()[0],12);
ad.onSlider(0,Infinity);close(ad.getSliderValues()[0],12);ad.onSlider(1,900);close(ad.getSliderValues()[1],20);
ad.onButton('terrain');assert(!find('boat-mount').visible);ad.onButton('sweep');assert(find('boat-mount').visible);
close(new T.Box3().setFromObject(ad.parts.base).min.y,0);
console.log(`PASS archimedes: 18 groups, ${meshes.length} meshes; 186 poses, chain verticality, attached rope, boat clearance, auto/manual/reset`);
