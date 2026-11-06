const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const THREE=require(process.env.THREE_CJS || require('node:path').join(require('node:os').tmpdir(),'monitor-three.cjs'));
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync('js/vehicles/j79.js','utf8'),sandbox);
const groups=[],meshes=[];
function register(p,o){o.userData.origColor=o.material.color.clone();p.add(o);meshes.push(o);return o;}
const ad=sandbox.window.VehicleBuilders.j79({THREE,scene:new THREE.Scene(),createPartGroup:c=>{const g=new THREE.Group();g.position.set(...c.basePos);g.userData=c;groups.push(g);return g;},addCADMesh:(p,g,m,pos,rot)=>{const o=new THREE.Mesh(g,m.clone());o.position.set(...pos);o.rotation.set(...rot);return register(p,o);},addInstancedMesh:(p,g,m,n)=>register(p,new THREE.InstancedMesh(g,m.clone(),n))});
assert.equal(groups.length,15);assert.equal(ad.tourSteps.length,6);assert.equal(ad.ui.subsystems.reduce((n,s)=>n+s.count,0),15);assert(meshes.length<500);
const compressor=ad.parts.compressor.children[0],turbine=ad.parts.turbine.children[0];
assert.equal(compressor.children.filter(x=>x.isInstancedMesh).length,17);assert.equal(turbine.children.filter(x=>x.isInstancedMesh).length,3);
ad.onSlider(0,100);ad.update(.05);assert.equal(compressor.rotation.z,turbine.rotation.z);assert(compressor.rotation.z>0);assert.equal(ad.parts.stator.rotation.z,0);
ad.onSlider(0,0);const angle=compressor.rotation.z;ad.update(.05);assert.equal(compressor.rotation.z,angle);assert.equal(ad.onFire().ok,false);
ad.onSlider(0,75);assert.equal(ad.onFire().ok,true);assert.equal(ad.getSliderValues()[2],90);
ad.onSlider(2,10);ad.update(.05);assert.equal(ad.getSliderValues()[2],10);assert.equal(ad.buttonActive('terrain'),false);
ad.onSlider(1,12);ad.onSlider(0,30);ad.update(.05);assert.equal(ad.getSliderValues()[1],12);
ad.onButton('terrain');assert.equal(ad.getSliderValues()[2],90);ad.onSlider(0,0);assert.match(ad.getStats()[2],/KAPALI/);
for(const k of ['metal','study','warm','dark']){ad.setTexture(k);ad.applyTextures(false);ad.applyTextures(true);}ad.toggleRelief();ad.applyTextures(false);
for(const v of [0,100]){ad.onSlider(2,v);ad.root.updateMatrixWorld(true);assert(Number.isFinite(new THREE.Box3().setFromObject(ad.root).max.z));}
const bounds=new THREE.Box3().setFromObject(ad.root);assert(Math.abs(bounds.min.y)<1e-6);
const html=fs.readFileSync('simulator.html','utf8');new Function(html.match(/<script type="module">([\s\S]*?)<\/script>/)[1].replace(/^\s*import[^\n]+/gm,''));
vm.runInNewContext(fs.readFileSync('js/catalog.js','utf8'),sandbox);const cat=sandbox.window.MUSEUM_CATALOG;assert.equal(cat.VEHICLES.find(v=>v.id==='j79').status,'live');for(const v of cat.VEHICLES)for(const f of cat.FACETS)for(const val of [].concat(v[f.key]))assert(f.options.some(o=>o.key===val));
console.log(`PASS J79: 15 groups, 6 tours, ${meshes.length} meshes; 17/3 stages, shared shaft, stationary stators, zero throttle, afterburner interlock, manual override, 4 finishes, ground contact, syntax/catalog`);
