const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('atlatl',16);
const byName=n=>ad.root.getObjectByName(n);
const close=(a,b)=>assert(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const point=n=>byName(n).getWorldPosition(new T.Vector3());
const lever=byName('lever'),dart=byName('dart');
// The same hook/socket contact survives every attached pose and separates continuously.
let previousGap=0;
for(let phase=0;phase<=100;phase++){
  ad.onSlider(1,phase);ad.root.updateMatrixWorld(true);
  const gap=point('hook-contact').distanceTo(point('socket-contact'));
  if(phase<=60)close(gap,0);else{assert(gap>previousGap);previousGap=gap;}
  for(const object of [lever,dart])assert(new T.Box3().setFromObject(object).min.y>.22,'Object intersects exhibit base');
  assert.equal(ad.getSliderValues()[0],0);
}
// Finger rings have open holes and real shell walls, rather than painted circles.
ad.onButton('sweep');ad.root.updateMatrixWorld(true);
ad.parts.grip.children.forEach((o,i)=>{
  const x=(i?1:-1)*.29;
  const ray=(px)=>new T.Raycaster(o.localToWorld(new T.Vector3(px,0,1)),new T.Vector3(0,0,-1).transformDirection(o.matrixWorld)).intersectObject(o);
  assert.equal(ray(x).length,0);assert(ray(x+.17).length>0);
});
const socketMesh=ad.parts.socket.children.find(o=>o.isMesh);
assert.equal(socketMesh.geometry.parameters.openEnded,true);
assert(socketMesh.geometry.parameters.radiusTop>.024,'Hook tip must fit inside socket');
ad.onSlider(1,60);ad.root.updateMatrixWorld(true);const release=dart.quaternion.clone();
ad.onSlider(1,100);ad.root.updateMatrixWorld(true);assert(dart.quaternion.equals(release),'Detached dart must not continue rotating with lever');
ad.onButton('sweep');ad.onFire();for(let i=0;i<20;i++)ad.update(.05);close(ad.getSliderValues()[1],16);
ad.onFire();const phase=ad.getSliderValues()[1];ad.update(.05);close(ad.getSliderValues()[1],phase);
ad.onFire();ad.onSlider(1,48);ad.update(.05);close(ad.getSliderValues()[1],48);assert.equal(ad.getSliderValues()[0],0);
ad.onSlider(0,2);ad.onSlider(2,100);assert.equal(ad.getSliderValues()[0],0);ad.root.updateMatrixWorld(true);
close(point('socket-contact').y-point('hook-contact').y,.8);
ad.onSlider(0,NaN);ad.onSlider(1,Infinity);ad.update(NaN);assert.equal(ad.getSliderValues()[1],48);
ad.onButton('terrain');assert.equal(dart.visible,false);ad.onButton('terrain');assert.equal(dart.visible,true);
ad.onButton('mode');assert.equal(byName('hook-contact').children[0].visible,true);
ad.onButton('sweep');assert.equal(byName('hook-contact').children[0].visible,false);
ad.onFire();for(let i=0;i<150;i++)ad.update(.05);assert.equal(ad.getSliderValues()[1],100);assert.equal(ad.getSliderValues()[0],0);
ad.onFire();assert.equal(ad.getSliderValues()[1],0);assert.equal(ad.getSliderValues()[0],1);
ad.onSlider(1,-100);ad.onSlider(2,999);ad.onSlider(0,999);assert.deepEqual(Array.from(ad.getSliderValues()),[2,0,100]);
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);
// Kaide ends on the ground, finishes retain shell/stone materials.
close(new T.Box3().setFromObject(ad.parts.base).min.y,0);
const shell=ad.parts.grip.children[0].material.color.getHex();
for(const t of ad.ui.textures){ad.setTexture(t.key);ad.applyTextures(false);assert.equal(ad.parts.grip.children[0].material.color.getHex(),shell);}
console.log(`PASS Atlatl: 16 groups, ${meshes.length} meshes, 101 poses, hook/socket continuity, release, base clearance, hollow rings/socket, pause/manual/end/reset, four finishes`);
