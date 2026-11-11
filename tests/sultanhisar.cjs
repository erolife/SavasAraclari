const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('sultanhisar',22),find=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-5,`${a} != ${b}`);
const prop=find('propeller'),shaft=find('drive-shaft');
ad.onFire();for(let i=0;i<500;i++){ad.update(.02);close(prop.rotation.z,shaft.rotation.z);for(let j=0;j<3;j++){const rod=find('connecting-rod-'+j);close(rod.geometry.parameters.height*rod.scale.y,.75);assert(Number.isFinite(find('piston-'+j).position.y));ad.root.updateMatrixWorld(true);close(rod.localToWorld(new T.Vector3(0,-.35,0)).distanceTo(find('crank-pin-'+j).getWorldPosition(new T.Vector3())),0);}}
ad.onSlider(0,0);const a=prop.rotation.z;ad.update(.05);close(prop.rotation.z,a);ad.onSlider(0,30);ad.onFire();ad.update(.05);close(prop.rotation.z,a);
for(let v=-60;v<=60;v++){ad.onSlider(2,v);close(find('launcher-yaw').rotation.y,v*Math.PI/180);ad.root.updateMatrixWorld(true);const b=new T.Box3().setFromObject(find('launcher-yaw'));assert(b.max.z<-9&&b.min.z>-15,'Launcher must clear forward skylight and aft gun');}
ad.onSlider(1,90);close(find('rudder').rotation.y,25*Math.PI/180);ad.onSlider(0,NaN);ad.update(Infinity);assert(ad.getSliderValues().every(Number.isFinite));
ad.onButton('terrain');assert(find('bridge-roof').position.y>1);ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[20,0,0]);close(find('bridge-roof').position.y,0);close(prop.rotation.z,0);
const p=new T.Box3().setFromObject(prop),r=new T.Box3().setFromObject(find('rudder'));assert(r.max.z<p.min.z,'Rudder must remain aft of the propeller');
console.log(`PASS Sultanhisar: 22 groups, ${meshes.length} meshes; connected shaft, 500 engine poses, stopped drive, 121 launcher angles, clearance, finite inputs, roof/reset`);
