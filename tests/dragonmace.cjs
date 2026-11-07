const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('dragonmace',14),find=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-5);
const shape=ad.parts.head.children[0].geometry.attributes.position.array.slice();
for(let i=0;i<=100;i++){ad.onSlider(1,i);ad.onSlider(2,i);close(find('head-lift').position.y,.75*i/100);close(find('animal-offset').position.x,.65*i/100);close(find('animal-offset').position.z,.45*i/100);}
assert.deepEqual(ad.parts.head.children[0].geometry.attributes.position.array,shape); // No fictitious jaw articulation.
ad.onSlider(0,1000);close(find('mace-turn').rotation.y,80*Math.PI/180);ad.onButton('terrain');assert.equal(ad.parts.stands.visible,false);
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);assert.equal(ad.parts.stands.visible,true);
ad.onFire();assert.equal(ad.getSliderValues()[2],100);ad.onFire();assert.equal(ad.getSliderValues()[2],0);ad.onSlider(2,NaN);assert.equal(ad.getSliderValues()[2],0);
ad.root.updateMatrixWorld(true);
// Negative spaces in the hooked snout and the open mouth are actual geometry gaps.
for(const [x,y]of [[.25,3.02],[.32,3.56]]){const ray=new T.Raycaster(new T.Vector3(x,y,1),new T.Vector3(0,0,-1));assert.equal(ray.intersectObjects(ad.parts.head.children).length,0);}
assert.equal(ad.parts.animal.parent,find('animal-offset'));assert.equal(ad.parts.paws.parent,find('animal-offset'));
console.log(`PASS dragonmace: 14 groups, ${meshes.length} meshes; 101 separation poses, fixed jaw geometry, open silhouette, motif hierarchy, rotation limits, supports/reset`);
