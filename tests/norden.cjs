const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('norden',16),find=n=>ad.root.getObjectByName(n);
const close=(a,b,e=1e-5)=>assert(Math.abs(a-b)<e,`${a} != ${b}`);
assert.equal(ad.ui.sliders.length,3);assert.equal(Object.keys(ad.camPresets).length,6);
// Stand and training board sit cleanly on y = 0.
ad.root.updateMatrixWorld(true);
close(new T.Box3().setFromObject(ad.root).min.y,0,1e-4);

// Ball-and-disc integrator kinematics: carriage radius increases with ground speed and decreases with altitude.
ad.onSlider(0,9000);ad.onSlider(1,300);ad.onSlider(2,0);
const rLowV=ad.model.carriageR();close(find('ball-carriage').position.x,rLowV);
ad.onSlider(1,500);const rHighV=ad.model.carriageR();assert(rHighV>rLowV,'Higher speed must move carriage outward');
ad.onSlider(0,4000);const rLowH=ad.model.carriageR();assert(rLowH>rHighV,'Lower altitude must move carriage outward');

// Output roller angular velocity is proportional to carriage radius: omega_roller = omega_disc * r / R_ROLLER.
ad.onSlider(0,9000);ad.onSlider(1,400);ad.onSlider(2,0);
const disc=find('integrator-disc'),roller=find('output-roller'),dgyro=find('dir-gyro');
const d0=disc.rotation.y,rl0=roller.rotation.x;
ad.update(.02);
const dDisc=disc.rotation.y-d0,dRol=roller.rotation.x-rl0;
close(dRol,dDisc*ad.model.carriageR()/.012,1e-5);

// Power off stops disc, roller and gyros, hides sight beam, and prevents starting a bomb run.
ad.onButton('mode');assert(!ad.buttonActive('mode'));
const d1=disc.rotation.y,rl1=roller.rotation.x,g1=dgyro.rotation.x;
ad.update(.05);ad.update(.05);
close(disc.rotation.y,d1);close(roller.rotation.x,rl1);close(dgyro.rotation.x,g1);
assert(!find('sight-beam').visible);
assert.equal(ad.onFire().ok,false);
ad.onButton('mode');assert(ad.buttonActive('mode'));assert(find('sight-beam').visible);

// Mirror law: mirror rotates by -phi/2 and sight beam points at angle phi from vertical (-Y toward +Z).
const mirror=find('sight-mirror'),beam=find('sight-beam');
close(mirror.rotation.x,-ad.model.state.phiSight/2,1e-6);
const dir=new T.Vector3(0,1,0).applyQuaternion(beam.quaternion).normalize();
close(Math.atan2(dir.z,-dir.y),ad.model.state.phiSight,1e-5);

// Geometry buffer reuse during full bomb run + zero-error hit.
const geos=meshes.map(m=>m.geometry);
ad.onSlider(0,8000);ad.onSlider(1,420);ad.onSlider(2,0);
assert(ad.onFire().ok);
// Sliders locked during active run.
assert(ad.onSlider(0,3000).msg);close(ad.getSliderValues()[0],8000);
let sawRelease=false;
for(let i=0;i<600&&!ad.model.state.impact;i++){
  ad.update(.05);
  if(ad.model.state.released&&!sawRelease){
    sawRelease=true;
    close(ad.model.state.phiSight,ad.model.delta(),1e-6);
    assert(find('release-glow').visible);
    assert(find('board-bomb').visible);
  }
}
assert(sawRelease&&ad.model.state.impact,'Bomb run must release and reach impact');
close(ad.model.state.miss,0,1e-4);
assert(ad.getStats()[3].includes('isabet'));
meshes.forEach((m,i)=>assert.equal(m.geometry,geos[i],'No geometry reallocation allowed'));

// Positive rate error (+10%) releases early -> bomb falls short (miss > 0); negative (-10%) releases late -> long (miss < 0).
ad.onSlider(2,10);assert(ad.onFire().ok);
for(let i=0;i<600&&!ad.model.state.impact;i++)ad.update(.05);
assert(ad.model.state.impact&&ad.model.state.miss>50,'Overestimated speed must fall short');
assert(ad.getStats()[3].includes('kısa'));

ad.onSlider(2,-10);assert(ad.onFire().ok);
for(let i=0;i<600&&!ad.model.state.impact;i++)ad.update(.05);
assert(ad.model.state.impact&&ad.model.state.miss<-50,'Underestimated speed must fall long');
assert(ad.getStats()[3].includes('uzun'));

// Autopilot clutch & outer covers toggles + input clamping.
ad.onButton('terrain');assert(find('clutch-lever').rotation.z<-.5);
ad.onButton('sweep');assert(!ad.parts.head.children[0].visible);ad.onButton('sweep');assert(ad.parts.head.children[0].visible);
ad.onSlider(0,99999);close(ad.getSliderValues()[0],9500);
ad.onSlider(1,-10);close(ad.getSliderValues()[1],250);
ad.onSlider(2,NaN);ad.update(NaN);assert(ad.getSliderValues().every(Number.isFinite));

const fs=require('node:fs'),vm=require('node:vm'),sb={window:{}};vm.runInNewContext(fs.readFileSync('js/catalog.js','utf8'),sb);
const rec=sb.window.MUSEUM_CATALOG.VEHICLES.find(v=>v.id==='norden');
assert(rec&&rec.sim==='norden'&&rec.status==='live'&&rec.origin==='usa'&&rec.sources.length>=1);
console.log(`PASS norden: 16 parts / ${meshes.length} meshes; ball-disc integrator, mirror phi/2 law, zero-error hit, +/-10% rate-error miss, power gate, catalog`);

