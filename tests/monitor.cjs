const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const THREE=require(process.env.THREE_CJS || require('node:path').join(require('node:os').tmpdir(),'monitor-three.cjs'));
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync('js/vehicles/monitor.js','utf8'),sandbox);
const groups=[],meshes=[];
const ad=sandbox.window.VehicleBuilders.monitor({THREE,scene:new THREE.Scene(),createPartGroup:c=>{const g=new THREE.Group();g.position.set(...c.basePos);g.userData=c;groups.push(g);return g;},addInstancedMesh:(p,g,m,n)=>{const o=new THREE.InstancedMesh(g,m.clone(),n);o.userData.origColor=o.material.color.clone();p.add(o);meshes.push(o);return o;},addCADMesh:(p,g,m,pos,rot)=>{const o=new THREE.Mesh(g,m.clone());o.position.set(...pos);o.rotation.set(...rot);o.userData.origColor=o.material.color.clone();p.add(o);meshes.push(o);return o;}});
assert.equal(groups.length,22);assert.equal(ad.tourSteps.length,6);assert(meshes.length<500);
ad.onSlider(2,0);assert.equal(ad.onFire().ok,false);ad.onSlider(2,100);
for(let i=0;i<10;i++){assert.equal(ad.onFire().ok,true);for(let j=0;j<25;j++)ad.update(.05);}
assert.match(ad.getStats()[2],/^0 /);assert.equal(ad.onFire().refill,true);assert.match(ad.getStats()[2],/^20 /);
ad.onButton('sweep');ad.update(.05);assert(ad.getSliderValues()[1]>0);ad.onSlider(1,90);ad.update(.05);assert.equal(ad.getSliderValues()[1],90);
ad.onSlider(0,0);const wheel=ad.parts.crank.children[0],angle=wheel.rotation.z;ad.update(.05);assert.equal(wheel.rotation.z,angle);
for(const k of ['iron','study']){ad.setTexture(k);ad.applyTextures(false);ad.applyTextures(true);}ad.toggleRelief();ad.applyTextures(false);
assert.equal(ad.ui.subsystems.reduce((n,x)=>n+x.count,0),22);
const hullBounds=new THREE.Box3().setFromObject(ad.parts.deck);assert(hullBounds.max.z-hullBounds.min.z>52);assert(hullBounds.max.x-hullBounds.min.x>12);
const bounds=new THREE.Box3().setFromObject(ad.root);assert(Math.abs(bounds.min.y)<1e-6);
console.log(`PASS: 22 groups, 6 tours, ${meshes.length} meshes; closed ports, ammo/refill, manual angle, zero RPM, finishes, ground contact`);
