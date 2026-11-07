const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('nusret',26),find=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-5);
const cart=find('rail-carriage'),p1=find('propeller--1'),p2=find('propeller-1');
for(let i=0;i<=100;i++){ad.onSlider(2,i);ad.root.updateMatrixWorld(true);const b=new T.Box3().setFromObject(cart);assert(b.min.z>=-17.7&&b.max.z<=-12.3);close(cart.position.x,2.1);close(cart.position.y,4.58);}
ad.onButton('sweep');ad.onSlider(0,20);for(let i=0;i<100;i++)ad.update(.05);close(p1.rotation.z,p2.rotation.z);assert(p1.rotation.z>0);ad.onSlider(0,0);const phase=p1.rotation.z;ad.update(.05);close(p1.rotation.z,phase);
ad.onFire();for(let i=0;i<700;i++){ad.update(.05);const v=ad.getSliderValues()[2];assert(v>=0&&v<=100);}ad.onSlider(2,37);ad.update(.05);close(ad.getSliderValues()[2],37);
for(let a=-25;a<=25;a++){ad.onSlider(1,a);close(find('rudder').rotation.y,a*Math.PI/180);}
ad.onButton('terrain');close(find('bridge-roof').position.y,2.5);ad.onButton('sweep');close(find('bridge-roof').position.y,0);assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);
ad.onSlider(0,NaN);assert.equal(ad.getSliderValues()[0],0);
const b=new T.Box3().setFromObject(ad.parts.hull.children[0]);close(b.max.z-b.min.z,40);assert(b.max.x-b.min.x>3.69);
close(new T.Box3().setFromObject(ad.parts.stands).min.y,0);
console.log(`PASS nusret: 26 groups, ${meshes.length} meshes; 101 carriage poses, rail limits, twin shafts, zero RPM, rudder, roof/reset, 40m hull`);
