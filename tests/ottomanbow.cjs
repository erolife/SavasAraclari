const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('ottomanbow',16),find=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-5);
const strings=['string-lower','string-upper'].map(find),tips=['tip-bottom','tip-top'].map(find);
assert.equal(ad.parts.string.visible,false);
ad.onFire();assert.equal(ad.parts.string.visible,true);
for(let d=0;d<=100;d++){ad.onSlider(1,d);ad.root.updateMatrixWorld(true);strings.forEach((s,i)=>{const h=s.geometry.parameters.height/2,a=s.localToWorld(new T.Vector3(0,-h,0)),b=s.localToWorld(new T.Vector3(0,h,0));close(a.distanceTo(tips[i].getWorldPosition(new T.Vector3())),0);close(a.distanceTo(b),1.65);});}
ad.onSlider(0,100);close(ad.parts.horn.children[0].position.z,-.55);close(ad.parts.sinew.children[0].position.z,.55);close(ad.parts.lacquer.children[0].position.z,.95);
ad.onSlider(2,99);close(find('bow-mount').rotation.y,35*Math.PI/180);
ad.onButton('terrain');assert.equal(find('arrow-display').visible,false);
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);assert.equal(ad.parts.string.visible,false);assert.equal(find('arrow-display').visible,true);
ad.onSlider(1,50);assert.equal(ad.parts.string.visible,true);ad.onSlider(1,NaN);assert.equal(ad.getSliderValues()[1],50);
ad.onButton('sweep');ad.root.updateMatrixWorld(true);
// Both nock slots remain physically open, not merely painted dark.
for(const x of [-.15,.55]){const ray=new T.Raycaster(new T.Vector3(1+x,.50,1),new T.Vector3(0,0,-1));assert.equal(ray.intersectObjects(ad.parts.nocks.children).length,0);}
console.log(`PASS ottomanbow: 16 groups, ${meshes.length} meshes; 101 connected string poses, constant string length, layer offsets, rotation limits, arrow visibility, open nocks/reset`);
