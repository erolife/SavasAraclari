const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const sandbox={window:{},URL,document:{addEventListener(){}}};
vm.runInNewContext(fs.readFileSync('js/catalog.js','utf8'),sandbox);
vm.runInNewContext(fs.readFileSync('js/museum-links.js','utf8'),sandbox);
const {buildLink,deliver}=sandbox.window.MuseumLinks,vehicles=sandbox.window.MUSEUM_CATALOG.VEHICLES;
(async()=>{
 for(const v of vehicles){const url=new URL(buildLink(v,'https://example.org/museum/index.html?secret=no#katalog'));assert.equal(url.pathname,'/museum/simulator.html');assert.equal(url.searchParams.get('vehicle'),v.sim);assert.equal(url.searchParams.size,1);assert.equal(url.hash,'');}
 assert.equal(buildLink({id:'enigma'},'https://example.org/museum/enigma.html?message=private',true),'https://example.org/museum/enigma.html');
 let copied='',shared=false;const data={title:'Atlatl',url:'https://example.org/museum/simulator.html?vehicle=atlatl'};
 assert.equal(await deliver(data,{share:async d=>{assert.equal(d,data);shared=true;}}),'shared');assert(shared);
 assert.equal(await deliver(data,{share:async()=>{throw {name:'AbortError'};},clipboard:{writeText:async()=>assert.fail('Cancellation must not copy')}}),'cancelled');
 assert.equal(await deliver(data,{share:async()=>{throw {name:'NotAllowedError'};},clipboard:{writeText:async u=>{copied=u;}}}),'copied');assert.equal(copied,data.url);
 assert.equal(await deliver(data,{clipboard:{writeText:async()=>{throw Error('denied');}}}),'manual');assert.equal(await deliver(data,{}),'manual');
 assert(vehicles.every(v=>v.sources.length>0),'Every vehicle must have a source or further reading');
 let count=0;for(const v of vehicles)for(const s of v.sources){assert.equal(new URL(s.url).protocol,'https:');assert(s.title);count++;}
 console.log(`PASS museum-links: ${vehicles.length} vehicle URLs, subdirectory/private-query cleanup, native/cancel/copy/manual paths, ${count} HTTPS sources`);
})().catch(e=>{console.error(e);process.exitCode=1;});
