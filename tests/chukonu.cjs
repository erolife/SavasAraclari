const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('chukonu',16),by=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-5);
for(let phase=0;phase<=100;phase++){
 ad.onSlider(1,phase);ad.root.updateMatrixWorld(true);
 const rear=by('lever').localToWorld(new T.Vector3(0,0,-.6)),front=by('magazine').localToWorld(new T.Vector3(0,0,1.5));
 assert(rear.distanceTo(by('magazine').position)<1e-6,'Lever/magazine joint');
 ad.parts.links.children.forEach((o,i)=>{const end=new T.Vector3(0,.5,0).applyMatrix4(o.matrixWorld);close(end.y,front.y);close(end.z,front.z);close(o.scale.y,.6);});
 for(const name of ['floor-frame','lid-frame','bolt-frame','trim-frame'])assert(by(name).position.distanceTo(rear)<1e-6);
 assert(new T.Box3().setFromObject(by('magazine')).min.y>1.30,'Magazine clears stock');
 assert.equal(parseInt(ad.getStats()[0]),12);
 for(let i=0;i<2;i++){const end=new T.Vector3(0,-.5,0).applyMatrix4(ad.parts.string.children[i].matrixWorld);assert(end.distanceTo(new T.Vector3(i?1.75:-1.75,1.13,.58))<1e-6);}
}
ad.onButton('sweep');ad.onFire();for(let i=0;i<80;i++)ad.update(.05);assert.equal(parseInt(ad.getStats()[0]),11);
ad.onFire();const phase=ad.getSliderValues()[1];ad.update(.05);close(ad.getSliderValues()[1],phase);
ad.onFire();for(let i=0;i<880;i++)ad.update(.05);assert.equal(parseInt(ad.getStats()[0]),0);close(ad.getSliderValues()[0],0);assert(ad.onFire().refill);assert.equal(parseInt(ad.getStats()[0]),12);close(ad.getSliderValues()[0],0);
ad.onFire();ad.onSlider(1,50);ad.update(.05);close(ad.getSliderValues()[1],50);ad.onSlider(2,100);close(by('lid').position.y,1.08);close(by('magazine-wall-1').position.x,.55);
ad.onButton('terrain');assert(!by('bolt-0').visible);ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);assert(by('bolt-11').visible);
console.log(`PASS chukonu: 16 groups, ${meshes.length} meshes, 101 closed-linkage/string poses, stock clearance, 12 cycles, empty stop/refill/manual/reset`);
