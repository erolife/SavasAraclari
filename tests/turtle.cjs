const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('turtle',20),find=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const crank=find('hand-crank'),shaft=find('drive-shaft'),prop=find('propeller'),hatch=find('hatch');
ad.onButton('sweep');for(let i=0;i<120;i++){ad.update(.05);close(crank.rotation.z,shaft.rotation.z);close(prop.rotation.z,shaft.rotation.z);}
ad.onSlider(0,0);const phase=shaft.rotation.z;ad.update(.05);close(shaft.rotation.z,phase);
ad.onSlider(0,30);ad.onButton('sweep');ad.update(.05);close(shaft.rotation.z,phase);
for(let a=0;a<=105;a++){ad.onSlider(1,a);ad.root.updateMatrixWorld(true);close(hatch.rotation.x,-a*Math.PI/180);const bounds=new T.Box3().setFromObject(hatch);assert(bounds.min.y>=3.529,'Hatch intersects crown');}
assert.equal(ad.onFire().ok,false);ad.onSlider(1,0);assert(ad.onFire().ok);ad.update(.05);assert(ad.getSliderValues()[2]<25);
ad.onSlider(2,70);ad.update(.05);close(ad.getSliderValues()[2],70);
ad.onFire();for(let i=0;i<200;i++)ad.update(.05);close(ad.getSliderValues()[2],0);
ad.onFire();assert(ad.getSliderValues()[2]===100);ad.onSlider(1,10);const water=ad.getSliderValues()[2];ad.update(.05);close(ad.getSliderValues()[2],water);
for(let level=0;level<=100;level++){ad.onSlider(2,level);ad.root.updateMatrixWorld(true);const b=new T.Box3().setFromObject(find('ballast-water'));assert(b.min.y>=.7749&&b.max.y<=1.069,'Water exceeds display tank');}
ad.onButton('terrain');close(find('shell-left').position.x,-.75);close(find('shell-right').position.x,.75);close(find('band-left').position.x,-.75);
ad.onButton('terrain');close(find('shell-left').position.x,0);ad.onSlider(1,NaN);assert(Number.isFinite(ad.getSliderValues()[1]));
close(new T.Box3().setFromObject(ad.parts.stand).min.y,0);
console.log(`PASS turtle: 20 groups, ${meshes.length} meshes; shaft continuity, zero RPM/pause, 106 hatch poses, pump interlock/manual/empty, 101 water levels, shell opening`);
