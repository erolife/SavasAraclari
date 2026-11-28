const {common,load,THREE,assert}=require('./model-harness.cjs');
const {ad,meshes}=common('yavuz',43);
const shafts=meshes.filter(o=>o.parent===ad.parts.shafts&&o.geometry.type==='CylinderGeometry'&&o.geometry.parameters.radiusTop===.024);
assert.equal(shafts.length,4);ad.root.updateMatrixWorld(true);
for(let i=0;i<4;i++){
 const o=shafts[i],h=o.geometry.parameters.height;
 const ends=[-h/2,h/2].map(y=>o.localToWorld(new THREE.Vector3(0,y,0)));
 const prop=ad.parts['screw'+i].parent.getWorldPosition(new THREE.Vector3());
 assert(Math.min(...ends.map(v=>v.distanceTo(prop)))<.011,'shaft enters its own propeller hub');
}
for(let i=0;i<=100;i++){
 ad.onSlider(1,-25+i*.5);ad.onSlider(2,i);ad.root.updateMatrixWorld(true);
 const high=new THREE.Box3().setFromObject(ad.parts.gunsX),low=new THREE.Box3().setFromObject(ad.parts.turretY);
 assert(high.min.y>low.max.y,'raised aft barrels clear lower turret roof');
 assert.equal(ad.parts.turretP.parent.rotation.y,Math.PI/2,'wing turret remains outboard');
 assert.equal(ad.parts.turretQ.parent.rotation.y,-Math.PI/2);
 assert(Math.abs(ad.parts.hatch.parent.position.y-i*.016)<1e-8);
}
ad.onButton('sweep');ad.onFire();ad.update(.05);assert(ad.parts.screw0.parent.rotation.x*ad.parts.screw3.parent.rotation.x<0);
ad.onSlider(0,0);ad.onFire();const angle=ad.parts.screw0.parent.rotation.x;ad.update(.05);assert.equal(ad.parts.screw0.parent.rotation.x,angle);
ad.onSlider(1,NaN);ad.onSlider(2,999);assert.equal(ad.getSliderValues()[2],100);ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[30,0,0]);
const en=load('yavuz',{window:{MuseumPreferences:{language:'en'}}}).ad;
for(const p of Object.values(en.parts))assert(!/[çğıöşüÇĞİÖŞÜ]/.test(p.userData.name+p.userData.desc+p.userData.spec));
console.log('Yavuz: 43 groups, four connected shafts, 101 turret/cover poses, superfiring clearance, zero speed, reset and English verified.');
