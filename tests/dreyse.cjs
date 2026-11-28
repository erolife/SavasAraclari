const {common,load,THREE,assert}=require('./model-harness.cjs');
const {ad,meshes}=common('dreyse',25);
const carrier=ad.parts.bolt.parent,shells=meshes.filter(o=>o.parent===ad.parts.receiverLid);
for(let i=0;i<=100;i++){
 ad.onSlider(0,i);ad.root.updateMatrixWorld(true);
 const travel=Math.max(0,(i-25)/75);assert(Math.abs(carrier.position.x-(-.95-.65*travel))<1e-9);
 if(i<=25)assert.equal(carrier.position.x,-.95,'handle rotates before bolt translates');
 if(i>0){const a=carrier.localToWorld(new THREE.Vector3(.02,0,.12)),b=carrier.localToWorld(new THREE.Vector3(.02,0,.34));const ray=new THREE.Raycaster(a,b.clone().sub(a).normalize(),0,a.distanceTo(b));assert.equal(ray.intersectObjects(shells,false).length,0,'handle clears rotating and longitudinal receiver slots');}
 ad.onSlider(1,i);ad.onSlider(2,i);assert(Math.abs(ad.parts.receiverLid.parent.position.y-i*.01)<1e-9);assert(Math.abs(ad.parts.needleCover.parent.position.y-i*.006)<1e-9);
 ad.onSlider(1,0);ad.onSlider(2,0);
}
ad.onButton('sweep');ad.onFire();for(let i=0;i<80;i++)ad.update(.05);assert.equal(ad.getSliderValues()[0],0,'demonstration returns to closed pose');
ad.onFire();ad.update(.05);ad.onSlider(0,73);ad.update(.05);assert.equal(ad.getSliderValues()[0],73,'manual inspection stops automatic cycle');ad.onSlider(0,NaN);assert.equal(ad.getSliderValues()[0],73);ad.onSlider(2,999);assert.equal(ad.getSliderValues()[2],100);ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);
const barrel=meshes.find(o=>o.parent===ad.parts.barrel);ad.root.updateMatrixWorld(true);const boreRay=new THREE.Raycaster(new THREE.Vector3(3.8,1.65,0),new THREE.Vector3(-1,0,0),0,.35);assert.equal(boreRay.intersectObject(barrel,false).length,0,'muzzle is a genuine opening');
const en=load('dreyse',{window:{MuseumPreferences:{language:'en'}}}).ad;for(const p of Object.values(en.parts))assert(!/[çğıöşüÇĞİÖŞÜ]/.test(p.userData.name+p.userData.desc+p.userData.spec));
const fs=require('node:fs'),vm=require('node:vm'),env={window:{}};for(const file of ['catalog.js','catalog-en.js','catalog-source-en.js'])vm.runInNewContext(fs.readFileSync('js/'+file,'utf8'),env);const cat=env.window.MuseumCatalogEnglish.translate(env.window.MUSEUM_CATALOG);for(const id of ['yavuz','bailey','dreyse']){const v=cat.VEHICLES.find(v=>v.id===id);assert.equal(v.sources.length,3);assert.equal(v.modal.length,4);assert(!/[çğıöşüÇĞİÖŞÜ]/.test([v.name,v.desc,...v.modal].join(' ')));}
console.log('Dreyse: 25 groups; 101 bolt/slot/section poses, open muzzle, cycle/manual controls and all three English catalogue records verified.');
