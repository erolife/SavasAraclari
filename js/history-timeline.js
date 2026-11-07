(function(){'use strict';
  const normalize=value=>String(value||'').toLocaleLowerCase('tr-TR').trim();
  function select(vehicles,{q='',era='',domain=''}={}) {
    const query=normalize(q);
    return vehicles.filter(v=>v.status==='live'&&(!era||v.era===era)&&(!domain||v.domain===domain)&&(!query||normalize([v.name,v.desc,...(v.tags||[])].join(' ')).includes(query))).slice().sort((a,b)=>a.year-b.year||a.id.localeCompare(b.id));
  }
  window.MuseumTimeline={select,normalize};
  if(typeof document==='undefined')return;
  const catalog=window.MUSEUM_CATALOG,byId=id=>document.getElementById(id),fields=['search','era','domain'];
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label=(key,value)=>catalog.FACETS.find(f=>f.key===key)?.options.find(o=>o.key===value)?.label||value;
  for(const key of ['era','domain'])for(const o of catalog.FACETS.find(f=>f.key===key).options){const option=document.createElement('option');option.value=o.key;option.textContent=o.label;byId(key).append(option);}
  byId('total').textContent=catalog.VEHICLES.filter(v=>v.status==='live').length;
  function readURL(){const p=new URLSearchParams(location.search);byId('search').value=p.get('q')||'';for(const key of ['era','domain'])byId(key).value=catalog.FACETS.find(f=>f.key===key).options.some(o=>o.key===p.get(key))?p.get(key):'';}
  function render(save=true){
    const filters={q:byId('search').value,era:byId('era').value,domain:byId('domain').value},vehicles=select(catalog.VEHICLES,filters);
    if(save){const url=new URL(location.href);url.search='';for(const [k,v] of Object.entries(filters))if(v)url.searchParams.set(k,v);history.replaceState(null,'',url);}
    byId('result-count').textContent=vehicles.length+' / '+catalog.VEHICLES.filter(v=>v.status==='live').length+' araç gösteriliyor';
    byId('empty').hidden=vehicles.length>0;
    byId('timeline-list').innerHTML=vehicles.map(v=>`<li class="timeline-item"><div class="timeline-date">${escape(v.yearLabel)}<small>${escape(label('era',v.era))}</small></div><article class="timeline-card"><div class="art" aria-hidden="true">${v.svg||''}</div><div><div class="card-label">${escape(label('origin',v.origin))} · ${escape(label('domain',v.domain))}</div><h2>${escape(v.name)}</h2><p>${escape(v.desc)}</p><div class="actions"><a class="action primary" href="simulator.html?vehicle=${encodeURIComponent(v.sim||v.id)}">3D modeli incele ↗</a><button type="button" data-museum-sources="${escape(v.id)}">Kaynaklar</button></div></div></article></li>`).join('');
  }
  const reset=()=>{fields.forEach(id=>{byId(id).value='';});render();};
  fields.forEach(id=>byId(id).addEventListener(id==='search'?'input':'change',()=>render()));
  byId('reset').addEventListener('click',reset);byId('empty-reset').addEventListener('click',reset);
  window.addEventListener('popstate',()=>{readURL();render(false);});readURL();render(false);
})();
