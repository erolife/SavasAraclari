const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('helepolis',18),by=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-5);
assert.equal(ad.parts.floors.children.length,9);assert.equal(ad.parts.wheels.children.length,8);
for(let angle=0;angle<=90;angle++){
 ad.onSlider(0,angle);ad.root.updateMatrixWorld(true);
 for(let i=0;i<2;i++){const expected=by('bridge').localToWorld(new T.Vector3(i?.26:-.26,1.3,0));const end=new T.Vector3(0,.5,0).applyMatrix4(ad.parts.ropes.children[i].matrixWorld);assert(end.distanceTo(expected)<1e-6);}
 assert(new T.Box3().setFromObject(ad.parts.bridge).min.y>3.1,'Bridge remains at floor height');
}
// Raycasts prove the stair wells are empty, and adjacent deck is solid.
ad.root.updateMatrixWorld(true);
for(let i=1;i<9;i++){const h=2.1-.11*i,y=.8+.78*i,deck=ad.parts.floors.children[i];
 for(const x of [-.6,.6]){const ray=new T.Raycaster(new T.Vector3(x,y+.3,-h+.55),new T.Vector3(0,-1,0),0,.5);assert.equal(ray.intersectObject(deck,true).length,0,'Stair well must be open');}
 assert(new T.Raycaster(new T.Vector3(-h+.08+Math.round((h-.08)/.16)*.16,y+.3,0),new T.Vector3(0,-1,0),0,.5).intersectObject(deck,true).length>0);
}
for(let level=1;level<=9;level++){ad.onSlider(2,level);for(let i=0;i<9;i++)assert.equal(ad.parts.floors.children[i].visible,i<level);assert.equal(ad.parts.bridge.visible,level>3);}
ad.onSlider(1,100);close(by('front-panel-0-1').position.z,1.2);close(by('side-panel-0--1').position.x,-1.2);
ad.onButton('terrain');close(by('shutter-0-1').rotation.x,-1.5);
ad.onButton('sweep');ad.onFire();for(let i=0;i<110;i++)ad.update(.05);close(ad.getSliderValues()[0],90);ad.onFire();ad.onSlider(0,35);ad.update(.05);close(ad.getSliderValues()[0],35);
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,9]);
console.log(`PASS helepolis: 18 groups, ${meshes.length} meshes, 91 bridge/rope poses, 16 stair wells, nine level filters, panels, shutters, endpoint/manual/reset`);
