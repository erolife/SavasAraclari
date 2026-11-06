const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('polybolos',18),by=n=>ad.root.getObjectByName(n);
const close=(a,b)=>assert(Math.abs(a-b)<1e-5,`${a} != ${b}`),ammo=()=>parseInt(ad.getStats()[0]);
const carriage=by('carriage'),crank=by('crank'),chainMeshes=ad.parts.chains.children.filter(o=>o.isInstancedMesh);
const matrix=new T.Matrix4(),pos=new T.Vector3();
for(let phase=0;phase<100;phase++){
 ad.onSlider(1,phase);ad.root.updateMatrixWorld(true);
 for(const o of chainMeshes){o.getMatrixAt(0,matrix);pos.setFromMatrixPosition(matrix);close(pos.z,carriage.position.z);close(pos.y,carriage.position.y+.02);}
 for(const x of [-.49,.49])for(const z of [-1.3,1.3])close(by('sprocket-'+x+'-'+z).rotation.x,crank.rotation.x);
 const strings=ad.parts.string.children;
 for(let i=0;i<2;i++){
  const end=new T.Vector3(0,i? .5:-.5,0).applyMatrix4(strings[i].matrixWorld);
  const tip=by('arm-'+(i?1:-1)).localToWorld(new T.Vector3(i?.72:-.72,0,-.12));assert(end.distanceTo(tip)<1e-6,'String leaves arm tip');
 }
 assert(new T.Box3().setFromObject(ad.parts.chains).max.z<new T.Box3().setFromObject(ad.parts.bundles).min.z,'Chain must clear torsion bundles');
 const follower=by('cam-follower'),f=(carriage.position.z+1.05)/1.95,ha=f*Math.PI;
 const expected=by('roller').localToWorld(new T.Vector3(.133*Math.sin(ha),.133*Math.cos(ha),-.70+f*1.4));
 assert(new T.Vector3(0,.5,0).applyMatrix4(follower.matrixWorld).distanceTo(expected)<1e-6,'Follower leaves helix');
 assert.equal(ammo(),8,'Manual inspection does not consume ammunition');
}
// Positive angular X velocity advances the upper chain toward +Z.
ad.onSlider(1,10);const a=crank.rotation.x,z=carriage.position.z;ad.onSlider(1,11);
close((crank.rotation.x-a)*.23,carriage.position.z-z);
assert(new T.Vector3(1,0,0).cross(new T.Vector3(0,.23,0)).z>0);
// Feed-to-slider transition has no visible spatial jump at handoff.
ad.onSlider(1,69.999);const feed=by('feed-bolt').position.clone();ad.onSlider(1,70);assert(feed.distanceTo(by('loaded-bolt').position)<.001);
ad.onButton('sweep');ad.onFire();for(let i=0;i<84;i++)ad.update(.05);assert.equal(ammo(),8);ad.update(.05);assert.equal(ammo(),7);
ad.onFire();const stopped=ad.getSliderValues()[1];ad.update(.05);close(ad.getSliderValues()[1],stopped);
ad.onFire();for(let i=0;i<15;i++)ad.update(.05);assert.equal(ammo(),7);close(ad.getSliderValues()[1],0);
for(let i=0;i<700;i++)ad.update(.05);assert.equal(ammo(),0);assert.equal(ad.getSliderValues()[0],0);assert.equal(ad.getSliderValues()[1],0);
assert(ad.onFire().refill);assert.equal(ammo(),8);assert.equal(ad.getSliderValues()[0],0);
ad.onFire();ad.onSlider(1,47);ad.update(.05);assert.equal(ad.getSliderValues()[0],0);close(ad.getSliderValues()[1],47);
ad.onSlider(2,100);close(by('magazine-wall-0.19').position.x,.69);
ad.onSlider(0,Infinity);ad.update(NaN);assert.equal(ad.getSliderValues()[0],0);
ad.onButton('terrain');assert(ad.parts.chains.children[0].material.emissive.getHex()>0);
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);assert.equal(ammo(),8);
console.log(`PASS Polybolos: 18 groups, ${meshes.length} meshes, 100 chain-pin/string poses, rotation direction, bundle clearance, feed handoff, 8 cycles, empty stop/refill/manual/reset`);
