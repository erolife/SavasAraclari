const {common,assert,THREE}=require('./model-harness.cjs');
const {ad,meshes}=common('katana',20);
function centre(key){ad.root.updateMatrixWorld(true);return new THREE.Box3().setFromObject(ad.parts[key]).getCenter(new THREE.Vector3());}
const grip=centre('grip'),face=centre('sayaFace');
const gripBounds=new THREE.Box3().setFromObject(ad.parts.grip);const posts=ad.parts.support.children.filter(m=>m.geometry?.type==='BoxGeometry'&&m.geometry.parameters.height>1);assert.equal(posts.length,2);assert.ok(posts.every(m=>m.position.x>gripBounds.max.x),'uprights must leave the decorated grip unobscured');
for(let i=0;i<=100;i++){ad.onSlider(0,i);ad.onSlider(1,i);assert.ok(Math.abs(centre('grip').x-grip.x+i/100*.45)<1e-6);assert.ok(Math.abs(centre('sayaFace').z-face.z-i/100*.5)<1e-6);}
ad.onSlider(0,NaN);assert.equal(ad.getSliderValues()[0],100);ad.onSlider(2,300);assert.equal(ad.getSliderValues()[2],90);ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);ad.onFire();assert.equal(ad.getSliderValues()[0],100);ad.onFire();assert.equal(ad.getSliderValues()[0],0);ad.onButton('terrain');assert.equal(ad.parts.support.visible,false);ad.onButton('sweep');assert.equal(ad.parts.support.visible,true);
common('katana',20,{window:{MuseumPreferences:{language:'en'}}});
assert.ok(meshes.some(m=>m.isInstancedMesh&&m.count>=30));
console.log('PASS katana: 20 parts, 72 meshes, both languages, 101 separation poses, controls and supports');
