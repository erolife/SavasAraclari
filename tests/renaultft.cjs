const {common,assert,THREE:T}=require('./model-harness.cjs');
const {ad,meshes}=common('renaultft',22),find=n=>ad.root.getObjectByName(n),close=(a,b)=>assert(Math.abs(a-b)<1e-5,`${a} != ${b}`);
assert.equal(ad.parts.bogies.children.filter(o=>o.name.startsWith('roadwheel-')).length,18);
const tracks=ad.parts.tracks.children,matrix=new T.Matrix4(),p=new T.Vector3();assert.equal(tracks.length,4);
const start=tracks[0].instanceMatrix.array.slice();ad.update(.05);assert.deepEqual(tracks[0].instanceMatrix.array,start);
const geometries=meshes.map(m=>m.geometry);ad.onSlider(0,40);
for(let j=0;j<300;j++){ad.update(.05);for(const track of tracks){for(let i=0;i<track.count;i++){track.getMatrixAt(i,matrix);p.setFromMatrixPosition(matrix);assert(p.y>=.045&&p.y<1.65);assert(Math.abs(p.z)<2.3);assert([...matrix.elements].every(Number.isFinite));}}}
assert.notDeepEqual(tracks[0].instanceMatrix.array,start);meshes.forEach((m,i)=>assert.equal(m.geometry,geometries[i]));
ad.onSlider(0,0);const stopped=tracks[0].instanceMatrix.array.slice(),angle=find('engine-fan').rotation.z;ad.update(.05);assert.deepEqual(tracks[0].instanceMatrix.array,stopped);close(find('engine-fan').rotation.z,angle);
for(let a=-180;a<=180;a+=5)for(const elev of [-5,20]){ad.onSlider(1,a);ad.onSlider(2,elev);ad.root.updateMatrixWorld(true);close(find('turret-yaw').rotation.y,a*Math.PI/180);close(find('gun-elevation').rotation.x,-elev*Math.PI/180);assert(new T.Box3().setFromObject(find('gun-elevation')).min.y>new T.Box3().setFromObject(ad.parts.hull).max.y,'Gun clears fixed hull throughout rotation');}
ad.onButton('terrain');assert(find('engine-cover').rotation.z>1.5);assert(find('driver-door-1').rotation.y>1);assert(find('driver-door--1').rotation.y< -1);
ad.onFire();assert(find('tail-skid').position.z<-.6);ad.onSlider(0,Infinity);ad.update(NaN);ad.onSlider(1,999);close(ad.getSliderValues()[1],180);
ad.onButton('sweep');assert.deepEqual(Array.from(ad.getSliderValues()),[0,0,0]);close(find('tail-skid').position.z,0);close(find('engine-cover').rotation.z,0);
ad.root.updateMatrixWorld(true);assert(Math.abs(new T.Box3().setFromObject(ad.root).min.y)<.001);
console.log(`PASS Renault FT: 22 groups, ${meshes.length} meshes; 18 road wheels, 300 closed-track poses, stationary zero speed, 146 turret/elevation poses, doors/cover/tail/reset, buffer reuse, ground`);
