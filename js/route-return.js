/* Optional return link for visitors arriving from a curated route. */
(function(){'use strict';
 const p=new URLSearchParams(location.search),route=window.TurkHistoryRoute;
 if(p.get('route')!=='turk'||!route.stops.some(s=>s.id===p.get('stop')))return;
 const a=document.createElement('a');a.className='btn';a.href='turk-tarihi.html?durak='+encodeURIComponent(p.get('stop'));a.textContent='↩ Türk tarihi rotası';
 document.querySelector('.top-actions').prepend(a);
})();
