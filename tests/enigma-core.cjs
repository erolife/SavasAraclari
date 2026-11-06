const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const s={window:{}};vm.runInNewContext(fs.readFileSync('js/enigma-core.js','utf8'),s);const {create}=s.window.EnigmaCore;const run=(m,str)=>[...str].map(c=>m.encrypt(c).output).join('');
assert.equal(run(create(),'AAAAA'),'BDZGO');assert.equal(run(create(),'HELLOWORLD'),'ILBDAAMTAZ');
const d=create({rotors:['III','II','I'],positions:'ADQ'});assert.equal(d.encrypt('A').positions,'AER');assert.equal(d.encrypt('A').positions,'BFS');
const cfg={rotors:['V','III','II'],positions:'MCK',rings:'BDF',reflector:'C',plugs:'AV BS CG DL FU HZ IN KM OW RX'};const text='SAVASTARIHINIDEGISTIRENMAKINELER';const cipher=run(create(cfg),text);assert.equal(run(create(cfg),cipher),text);for(let i=0;i<text.length;i++)assert.notEqual(text[i],cipher[i]);
for(const plugs of ['AA','AB AC','ABC','AB 12'])assert.throws(()=>create({plugs}));assert.throws(()=>create({rotors:['I','I','III']}));assert.throws(()=>create({positions:'AB'}));
const m=create();const a=m.encrypt('A');assert.equal(a.path.length,9);assert.equal(a.path[0].from,'A');assert.equal(a.path.at(-1).to,a.output);m.reset();assert.equal(m.encrypt('A').output,a.output);
console.log('PASS Enigma core: published vectors BDZGO/ILBDAAMTAZ, double-step ADQ→AER→BFS, rings/plugs/reflector round-trip, no self-map, validation, trace/reset');
