const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('sr71_j58',28),find=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-6);
const geometries=meshes.map(m=>m.geometry);let previous=0;
for(let j=0;j<=320;j++){const mach=j/100;ad.onSlider(0,mach);const z=find('inlet-spike-left').position.z;assert(z<=previous+1e-8);close(z,find('inlet-spike-right').position.z);close(z,-.66*Math.max(0,Math.min(1,(mach-1.6)/1.6)));previous=z;ad.update(.05);close(find('compressor-rotor-left').rotation.z,find('turbine-rotor-left').rotation.z);}
ad.onFire();for(const key of ['left','right']){assert(find('core-arrow-'+key+'-0').visible,'Core must continue at high Mach');assert(find('bypass-arrow-'+key+'-0').visible);}
ad.onSlider(0,0);assert(!find('bypass-arrow-left-0').visible);assert(find('core-arrow-left-0').visible);
ad.onSlider(1,0);const angle=find('compressor-rotor-left').rotation.z;ad.update(.05);close(find('compressor-rotor-left').rotation.z,angle);assert(!find('core-arrow-left-0').visible);
ad.onSlider(2,100);close(find('engine-cover-left').position.x,-2.5);close(find('engine-cover-right').position.x,2.5);close(find('engine-cover-left').position.y,2.5);
ad.onButton('terrain');close(find('canopy-lift').position.y,1.4);ad.onSlider(0,Infinity);ad.update(NaN);ad.onSlider(0,100);close(ad.getSliderValues()[0],3.2);
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,25,0]);close(find('canopy-lift').position.y,0);assert(!find('core-arrow-left-0').visible);meshes.forEach((m,i)=>assert.equal(m.geometry,geometries[i]));
ad.root.updateMatrixWorld(true);assert(Math.abs(new T.Box3().setFromObject(ad.root).min.y)<.001);
console.log(`PASS SR-71/J58: 28 groups, ${meshes.length} meshes; 321 cone positions, shared rotor phase, high-Mach core continuity, zero speed, covers/canopy/reset, buffer reuse and ground`);
