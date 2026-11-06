/* Enigma I: historical I–V wirings, wide B/C reflectors; no network or DOM. */
(function(){'use strict';
 const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ',ROTORS={I:['EKMFLGDQVZNTOWYHXUSPAIBRCJ','Q'],II:['AJDKSIRUXBLHWTMCQGZNPYFVOE','E'],III:['BDFHJLCPRTXVZNYEIWGAKMUSQO','V'],IV:['ESOVPZJAYQUIRHXLNFTGKDCMWB','J'],V:['VZBRGITYUPSDNHLXAWMJQOFECK','Z']},REF={B:'YRUHQSLDPXNGOKMIEBFZCWVJAT',C:'FVPJIAOYEDRZXWGCTKUQSBNMHL'},mod=n=>(n%26+26)%26;
 function create(config={}){
  const names=(config.rotors||['I','II','III']).slice();if(names.length!==3||new Set(names).size!==3||names.some(x=>!ROTORS[x]))throw Error('Üç farklı rotor seçin.');
  const start=(config.positions||'AAA').toUpperCase(),ring=(config.rings||'AAA').toUpperCase();if(!/^[A-Z]{3}$/.test(start)||!/^[A-Z]{3}$/.test(ring))throw Error('Konum ve halka ayarları üç A–Z harfi olmalı.');
  const reflector=config.reflector||'B';if(!REF[reflector])throw Error('Geçersiz yansıtıcı.');const plugs=(config.plugs||'').trim().toUpperCase().split(/\s+/).filter(Boolean),map=[...A].map((_,i)=>i),used=new Set();
  if(plugs.length>13)throw Error('En fazla 13 fiş çifti kullanılabilir.');for(const p of plugs){if(!/^[A-Z]{2}$/.test(p)||p[0]===p[1]||[...p].some(c=>used.has(c)))throw Error('Fiş çiftleri farklı ve tekrarsız harfler olmalı: AB CD gibi.');const [a,b]=[...p].map(c=>A.indexOf(c));map[a]=b;map[b]=a;[...p].forEach(c=>used.add(c));}
  let pos=[...start].map(c=>A.indexOf(c));const rings=[...ring].map(c=>A.indexOf(c));
  function encrypt(letter){const input=String(letter).toUpperCase();if(!/^[A-Z]$/.test(input))throw Error('Tek bir A–Z harfi girin.');const before=pos.map(n=>A[n]).join(''),middle=ROTORS[names[1]][1].includes(A[pos[1]]),right=ROTORS[names[2]][1].includes(A[pos[2]]),stepped=[middle,middle||right,true];pos=pos.map((p,i)=>mod(p+(stepped[i]?1:0)));let v=A.indexOf(input);const path=[];
   function stage(label,fn,rotor=null,reverse=false){const from=v;v=fn(v);path.push({label,from:A[from],to:A[v],rotor,reverse});}
   stage('Fiş tahtası →',x=>map[x]);
   function through(i,reverse){const wire=ROTORS[names[i]][0],shift=pos[i]-rings[i];stage(names[i]+(reverse?' ←':' →'),x=>{const entry=mod(x+shift),exit=reverse?wire.indexOf(A[entry]):A.indexOf(wire[entry]);return mod(exit-shift);},i,reverse);}
   for(let i=2;i>=0;i--)through(i,false);stage('Yansıtıcı '+reflector,x=>A.indexOf(REF[reflector][x]));for(let i=0;i<3;i++)through(i,true);stage('Fiş tahtası ←',x=>map[x]);
   return {input,output:A[v],before,positions:pos.map(n=>A[n]).join(''),stepped,path};
  }
  return {encrypt,reset:()=>{pos=[...start].map(c=>A.indexOf(c));},positions:()=>pos.map(n=>A[n]).join(''),config:()=>({rotors:names.slice(),positions:start,rings:ring,reflector,plugs:plugs.join(' ')})};
 }
 window.EnigmaCore={create,alphabet:A,rotors:Object.keys(ROTORS)};
})();
