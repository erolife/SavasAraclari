const {common,assert,THREE}=require('./model-harness.cjs');const {ad,meshes}=common('u505',20);const props=ad.parts.props.children;
ad.onFire();ad.update(.05);assert(props[0].rotation.z<0&&props[1].rotation.z>0);ad.onFire();const a=props[0].rotation.z;ad.update(.05);assert.equal(props[0].rotation.z,a);
ad.onSlider(1,0);ad.onSlider(2,25);ad.update(.05);assert.equal(ad.getSliderValues()[2],25);assert(ad.parts.rudder.children[0].rotation.y>0);ad.onButton('terrain');assert(ad.buttonActive('terrain'));ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,50,0]);
const b=new THREE.Box3().setFromObject(ad.parts.outer);assert(Math.abs(b.max.z-b.min.z-76.8)<.1);console.log(`PASS U-505: 20 groups, ${meshes.length} meshes, twin shafts, stop/reset, periscope/rudder, 76.8m hull`);
