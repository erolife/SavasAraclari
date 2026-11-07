const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('gokturk',23),find=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-5);
for(let i=0;i<=100;i++){ad.onSlider(0,i);ad.onSlider(1,i);close(find('front-panel').position.z,.65*i/100);close(find('back-panel').position.z,-.5*i/100);close(find('helmet-lift').position.y,.6*i/100);close(find('neckguard-lift').position.y,find('helmet-lift').position.y);}
ad.onSlider(2,80);close(find('exhibit').rotation.y,35*Math.PI/180);ad.onSlider(2,-80);close(find('exhibit').rotation.y,-35*Math.PI/180);
ad.onButton('terrain');assert.equal(find('rider').visible,false);assert.equal(ad.parts.saddle.parent.visible,true);assert.equal(ad.parts.reins.parent,find('rider'));
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);assert.equal(find('rider').visible,true);
ad.onFire();assert.equal(ad.getSliderValues()[0],100);ad.onFire();assert.equal(ad.getSliderValues()[0],0);ad.onSlider(0,NaN);assert.equal(ad.getSliderValues()[0],0);
ad.root.updateMatrixWorld(true);close(new T.Box3().setFromObject(ad.parts.legs).min.y,.092);
for(const s of [-1,1]){const st=find('stirrup-'+s),ray=new T.Raycaster(new T.Vector3(s*.43,1.09,.5),new T.Vector3(0,0,-1),0,.5);assert.equal(ray.intersectObjects(st.children).length,0);}
const front=find('front-panel').children[0];assert.equal(front.count,60);assert.equal(front.geometry.parameters.shapes.holes.length,4);
console.log(`PASS gokturk: 23 groups, ${meshes.length} meshes; 101 armour/helmet poses, guards move together, rider/rein visibility, open stirrups, pierced plates, hoof/base contact, limits/reset`);
