const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('rrh',20),find=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-5,`${a} != ${b}`);
const elev=find('elevation'),yaw=find('azimuth'),wave=find('incoming-wave');
for(let angle=0;angle<=60;angle++){
 ad.onSlider(1,angle);ad.root.updateMatrixWorld(true);close(elev.rotation.x,-angle*Math.PI/180);
 for(let i=0;i<2;i++){const hose=ad.parts.hoses.children[i],curve=hose.geometry.parameters.path;
  const expected=new T.Vector3(i?.35:-.35,-.55,-.96).applyAxisAngle(new T.Vector3(1,0,0),-angle*Math.PI/180).add(new T.Vector3(0,2.45,0));close(curve.getPoint(0).distanceTo(expected),0);close(curve.getPoint(1).distanceTo(new T.Vector3(i?1.55:-1.55,1.55,-.85)),0);
 }
 for(let i=0;i<4;i++)assert(new T.Box3().setFromObject(ad.parts['horn'+i]).min.y>1.5,'Horn enters lower mechanism');
}
ad.onSlider(1,0);ad.root.updateMatrixWorld(true);const ray=new T.Raycaster(new T.Vector3(0,3.15,5),new T.Vector3(0,0,-1));
for(let i=0;i<4;i++)assert.equal(ray.intersectObject(ad.parts['horn'+i],true).length,0,'Central aperture is blocked');
for(const d of [1,3,6]){ad.onSlider(2,d);close(parseFloat(ad.getStats()[2]),Number((d*1000/343).toFixed(2)));}
assert(!wave.visible);ad.onFire();assert(wave.visible);const z=wave.position.z;ad.update(.05);assert(wave.position.z<z,'Sound must travel toward receiver');ad.onFire();assert(!wave.visible);
ad.onSlider(0,52);ad.onButton('terrain');ad.update(0);close(ad.getSliderValues()[0],52);ad.update(.05);assert(ad.getSliderValues()[0]!==52);
ad.onSlider(0,-22);ad.update(.05);close(ad.getSliderValues()[0],-22);close(yaw.rotation.y,-22*Math.PI/180);
ad.onSlider(2,0);close(ad.getSliderValues()[2],1);ad.onSlider(1,Infinity);assert(Number.isFinite(ad.getSliderValues()[1]));
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,18,3]);assert(!wave.visible);
close(new T.Box3().setFromObject(ad.parts.legs).min.y,0);
assert(!('bumpMap' in wave.material));
console.log(`PASS rrh: 20 groups, ${meshes.length} meshes; 61 elevations, attached hose ends, open aperture, delay/direction, continuous scan/manual/reset, ground contact`);
