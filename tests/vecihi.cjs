const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('vecihi',24),find=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-5);
const prop=find('propeller'),crank=find('crankshaft'),pistons=Array.from({length:6},(_,i)=>find('piston-'+i));
const initial=pistons.map(p=>p.position.y);ad.update(.1);assert.deepEqual(pistons.map(p=>p.position.y),initial);
ad.onFire();assert.equal(ad.getSliderValues()[0],24);for(let i=0;i<1000;i++){ad.update(.05);close(prop.rotation.z,crank.rotation.z);assert(prop.rotation.z>=0&&prop.rotation.z<2*Math.PI);pistons.forEach(p=>assert(p.position.y>=1.95999&&p.position.y<=2.08001));}
const fixedCylinders=ad.parts.engine.children.filter(o=>o.geometry?.type==='CylinderGeometry'&&o.geometry.parameters.height===.39);assert.equal(fixedCylinders.length,6);fixedCylinders.forEach(p=>close(p.rotation.z,0));
ad.onSlider(0,0);const phase=prop.rotation.z,ys=pistons.map(p=>p.position.y);ad.update(.1);close(prop.rotation.z,phase);assert.deepEqual(pistons.map(p=>p.position.y),ys);
for(let a=-20;a<=20;a++){ad.onSlider(1,a);ad.onSlider(2,-a);close(find('elevator').rotation.x,a*Math.PI/180);close(find('rudder').rotation.y,-a*Math.PI/180);close(find('elevator').position.z,-3.35);close(find('rudder').position.z,-3.8);}
ad.onButton('terrain');close(find('engine-hood').position.y,1.1);ad.onButton('sweep');close(find('engine-hood').position.y,0);assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);close(prop.rotation.z,0);
ad.onSlider(0,Infinity);assert.equal(ad.getSliderValues()[0],0);ad.onSlider(1,999);assert.equal(ad.getSliderValues()[1],20);ad.onButton('sweep');ad.root.updateMatrixWorld(true);
const b=new T.Box3().setFromObject(ad.parts.upper);close(b.max.x-b.min.x,11.7);close(new T.Box3().setFromObject(ad.parts.wheels).min.y,0);
// Cockpit mouths are actual holes in the deck, with no skin above the seats.
for(const z of [-.95,.28]){const ray=new T.Raycaster(new T.Vector3(0,2.5,z),new T.Vector3(0,-1,0),0,.65);assert.equal(ray.intersectObjects(ad.parts.skin.children).length,0);}
assert(new T.Box3().setFromObject(ad.root).max.y<3.2);
console.log(`PASS vecihi: 24 groups, ${meshes.length} meshes; 1000 crank/propeller poses, six fixed cylinders, piston limits, zero RPM, 41 hinge poses, cockpit holes, 11.7m span, ground/reset`);
