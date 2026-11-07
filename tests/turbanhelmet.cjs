const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('turbanhelmet',17),find=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-5);
assert.equal(find('mail-completion').visible,false);assert.equal(find('mail-links').count,1040);
for(let i=0;i<=100;i++){ad.onSlider(0,i);ad.onSlider(1,i);close(find('nasal-slide').position.y,i*.0045);close(find('shell-lift').position.y,i*.009);ad.root.updateMatrixWorld(true);const b=new T.Box3().setFromObject(ad.parts.nasal),g=new T.Box3().setFromObject(ad.parts.guide);assert(b.min.y<g.min.y&&b.max.y>g.max.y);}
ad.onButton('terrain');assert.equal(find('mail-completion').visible,true);assert.equal(find('mail-completion').parent,find('shell-lift'));
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);assert.equal(find('mail-completion').visible,false);
ad.onFire();assert.equal(ad.getSliderValues()[1],100);ad.onFire();assert.equal(ad.getSliderValues()[1],0);ad.onSlider(2,500);close(find('helmet-turn').rotation.y,Math.PI/2);ad.onSlider(0,NaN);assert.equal(ad.getSliderValues()[0],0);ad.onButton('sweep');
ad.root.updateMatrixWorld(true);const ray=new T.Raycaster(new T.Vector3(0,1.30,0),new T.Vector3(0,1,0),0,.5);assert.equal(ray.intersectObjects(ad.parts.bowl.children).length,0); // Open underside, no solid cone base.
for(const x of [-.065,.065]){const ray=new T.Raycaster(new T.Vector3(x,2.85,1.5),new T.Vector3(0,0,-1),0,.43);assert.equal(ray.intersectObjects([ad.parts.crest.children[0]]).length,0);}
close(new T.Box3().setFromObject(ad.parts.base).min.y,0);
console.log(`PASS turbanhelmet: 17 groups, ${meshes.length} meshes; 101 guide/slide/lift poses, hollow underside, pierced crest, 1040 optional mail rings, attached mail, limits/reset`);
