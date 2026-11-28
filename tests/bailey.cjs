const {common,load,THREE,assert}=require('./model-harness.cjs');
const {ad,meshes}=common('bailey',30);
const main=ad.parts.transoms.parent,pin=ad.parts.pin.parent;
ad.root.updateMatrixWorld(true);const installed=main.position.x;
for(let i=0;i<=100;i++){
 ad.onSlider(0,i);ad.onSlider(1,i);ad.onSlider(2,i);ad.root.updateMatrixWorld(true);
 assert(Math.abs(main.position.x+6.096*(1-i/100))<1e-8,'one rigid carriage translates');
 assert.equal(ad.parts.nose.parent.visible,i<100);assert.equal(ad.parts.deck.parent.visible,i===100);
 assert(Math.abs(ad.parts.panelL0.parent.position.z+i*.006)<1e-8);assert(Math.abs(ad.parts.panelR0.parent.position.z-i*.006)<1e-8);
 assert.equal(pin.position.x,0);assert.equal(pin.position.y,0);assert(Math.abs(pin.position.z-i*.009)<1e-8,'inspection pin withdraws on its hole axis');
 const a=new THREE.Box3().setFromObject(ad.parts.panelL0),b=new THREE.Box3().setFromObject(ad.parts.panelL1);
 assert(Math.abs((b.min.x-a.min.x)-1.524)<1e-5,'adjacent panels keep their 10 ft scaled spacing');
}
ad.onButton('sweep');assert.equal(main.position.x,installed);ad.onFire();assert.equal(ad.getSliderValues()[0],0);for(let i=0;i<160;i++)ad.update(.05);assert.equal(ad.getSliderValues()[0],100,'launching stops exactly at deployed pose');assert(ad.parts.deck.parent.visible);
ad.onFire();ad.update(.05);ad.onSlider(0,42);ad.update(.05);assert.equal(ad.getSliderValues()[0],42,'manual positioning stops automatic movement');ad.onSlider(2,NaN);assert.equal(ad.getSliderValues()[2],0);ad.onSlider(2,999);assert.equal(ad.getSliderValues()[2],100);
// A ray along the open lug axis must pass through a genuine geometric hole.
ad.onButton('sweep');ad.root.updateMatrixWorld(true);const ray=new THREE.Raycaster(new THREE.Vector3(-5.64,1.35,2.8),new THREE.Vector3(0,0,1));const lugs=meshes.filter(o=>o.parent===ad.parts.fork||o.parent===ad.parts.tongue).filter(o=>o.geometry.type==='ExtrudeGeometry');assert.equal(ray.intersectObjects(lugs,false).length,0,'coaxial holes are not solid discs');
const en=load('bailey',{window:{MuseumPreferences:{language:'en'}}}).ad;for(const p of Object.values(en.parts))assert(!/[çğıöşüÇĞİÖŞÜ]/.test(p.userData.name+p.userData.desc+p.userData.spec));
console.log('Bailey: 30 groups; 101 rigid-launch/panel/pin poses, open coaxial lugs, staged deck, manual override and English verified.');
