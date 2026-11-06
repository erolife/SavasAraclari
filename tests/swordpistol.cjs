const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('swordpistol',16),by=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-5);
ad.root.updateMatrixWorld(true);
// Both bevels must face outward and be pickable, while the hand-guard interior stays empty.
for(const side of [-1,1])assert(new T.Raycaster(new T.Vector3(side,1.23,1),new T.Vector3(-side,0,0)).intersectObject(by('blade')).length>0);
assert.equal(new T.Raycaster(new T.Vector3(1,.85,-1.55),new T.Vector3(-1,0,0)).intersectObject(ad.parts.guard,true).length,0);
assert(new T.Raycaster(new T.Vector3(1,.73,-1.55),new T.Vector3(-1,0,0)).intersectObject(ad.parts.guard,true).length>0);
const tube=by('barrel'),dir=new T.Vector3(0,-1,0).transformDirection(tube.matrixWorld),origin=tube.localToWorld(new T.Vector3(0,1.5,0));assert(new T.Raycaster(origin,dir).intersectObject(tube)[0].distance>.3);
for(let angle=0;angle<=360;angle+=5){ad.onSlider(0,angle);ad.root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(ad.root);assert(box.min.y>=-.001);close(by('specimen').rotation.y,angle*Math.PI/180);}
for(let n=0;n<=100;n++){ad.onSlider(1,n);close(by('lock-plate').position.x,n*.004);close(by('cock').position.x-.16,n*.004);close(by('screw-frame').position.x,n*.004);}
ad.onButton('sweep');ad.onFire();for(let i=0;i<101;i++)ad.update(.05);close(ad.getSliderValues()[0],180);ad.update(.05);close(ad.getSliderValues()[0],180);ad.onFire();for(let i=0;i<101;i++)ad.update(.05);close(ad.getSliderValues()[0],360);
ad.onFire();ad.onSlider(0,42);ad.update(.05);close(ad.getSliderValues()[0],42);ad.onSlider(2,100);close(ad.getSliderValues()[2],25);
ad.onButton('terrain');assert(!ad.parts.ornament.visible);ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);assert(ad.parts.ornament.visible);
console.log(`PASS swordpistol: 16 groups, ${meshes.length} meshes, outward blade bevels, hollow guard/muzzle, 73 rotations, 101 plate poses, half-turn stops/manual/reset`);
