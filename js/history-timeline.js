(function(){'use strict';
  const english=window.MuseumPreferences?.language==='en';
  if(english){
    document.documentElement.lang='en';
    const text={'.skip':'Skip to timeline','.museum-nav a:first-child':'← War Machines','.museum-nav span':'EXPLORE THE COLLECTION / 01','.museum-nav a:last-child':'Turkish history route →','.eyebrow':'ONE INVENTION, ONE ERA, ONE CHANGE','h1':'The trail of machines<br><em>through time.</em>','.hero-bottom > p':'Explore the collection chronologically, from primitive tools to modern systems. Focus on an era, then open a model to examine it in detail.','.collection-count span':'interactive models','.timeline-intro p:nth-child(2)':'Dates are not evenly spaced. Approximate dates and ranges follow the catalog; ordering is based on catalog year.','#empty h2':'No vehicles found in this range.','#empty p':'Shorten your search or reset the filters.','#empty-reset':'Show the full collection','.editorial-note strong':'History includes more than machines used in war.','.editorial-note p':'The collection also includes experimental designs, personal equipment, and museum reconstructions. A date label does not mean a vehicle saw combat that year. See each model description and its sources for details.','.museum-footer a':'Return to inventory','.museum-footer span':'War Machines · Interactive Museum'};
    for(const [selector,value] of Object.entries(text)){const el=document.querySelector(selector);if(el&&value)el.innerHTML=value;}
    const search=document.getElementById('search');search.placeholder='E.g. Nusret, Enigma, bow';
    document.title='Timeline — War Machines';document.querySelector('meta[name="description"]').content='Explore war machines through the eras. Browse vehicles chronologically and open their 3D models.';
    document.querySelector('.filter-panel label:nth-child(1)').firstChild.textContent='Search vehicles';
    document.querySelector('.filter-panel label:nth-child(2)').firstChild.textContent='Era';
    document.querySelector('.filter-panel label:nth-child(3)').firstChild.textContent='Domain';
    document.querySelector('#era option').textContent='All eras';document.querySelector('#domain option').textContent='All domains';
    document.querySelector('#reset').textContent='Reset';
    document.querySelector('.museum-nav').setAttribute('aria-label','Main navigation');document.querySelector('.museum-footer a').textContent='Return to inventory';
    document.querySelector('#total').nextElementSibling.textContent='interactive models';
    document.querySelector('.museum-footer a').nextElementSibling.textContent='War Machines · Interactive Museum';
    document.querySelector('#results').setAttribute('aria-label','Chronological vehicle list');
    document.querySelector('.filter-panel').setAttribute('aria-label','Timeline filters');
    document.querySelector('noscript').innerHTML='JavaScript is required for the timeline. <a href="index.html">Return to inventory.</a>';
  }
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
    byId('result-count').textContent=english?`${vehicles.length} / ${catalog.VEHICLES.filter(v=>v.status==='live').length} vehicles shown`:vehicles.length+' / '+catalog.VEHICLES.filter(v=>v.status==='live').length+' araç gösteriliyor';
    byId('empty').hidden=vehicles.length>0;
    byId('timeline-list').innerHTML=vehicles.map(v=>`<li class="timeline-item"><div class="timeline-date">${escape(v.yearLabel)}<small>${escape(label('era',v.era))}</small></div><article class="timeline-card"><div class="art" aria-hidden="true">${v.svg||''}</div><div><div class="card-label">${escape(label('origin',v.origin))} · ${escape(label('domain',v.domain))}</div><h2>${escape(v.name)}</h2><p>${escape(v.desc)}</p><div class="actions"><a class="action primary" href="simulator.html?vehicle=${encodeURIComponent(v.sim||v.id)}">${english?'Explore 3D model ↗':'3D modeli incele ↗'}</a><button type="button" data-museum-sources="${escape(v.id)}">${english?'Sources':'Kaynaklar'}</button></div></div></article></li>`).join('');
  }
  const reset=()=>{fields.forEach(id=>{byId(id).value='';});render();};
  fields.forEach(id=>byId(id).addEventListener(id==='search'?'input':'change',()=>render()));
  byId('reset').addEventListener('click',reset);byId('empty-reset').addEventListener('click',reset);
  window.addEventListener('popstate',()=>{readURL();render(false);});readURL();render(false);
})();
