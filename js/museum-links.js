(function () {
  'use strict';
  const catalog = () => window.MUSEUM_CATALOG.VEHICLES;
  function currentVehicle(id) {
    const key = id || new URL(location.href).searchParams.get('vehicle') || (location.pathname.endsWith('/enigma.html') ? 'enigma' : 'tiger');
    return catalog().find(v => v.id === key || v.sim === key);
  }
  function buildLink(vehicle, base, lab = false) {
    const url = new URL(lab ? 'enigma.html' : 'simulator.html', base);
    if (!lab) url.searchParams.set('vehicle', vehicle.sim || vehicle.id);
    return url.href;
  }
  async function deliver(data, nav) {
    if (typeof nav.share === 'function') {
      try { await nav.share(data); return 'shared'; }
      catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
    }
    try { if (nav.clipboard && typeof nav.clipboard.writeText === 'function') { await nav.clipboard.writeText(data.url); return 'copied'; } } catch (_) {}
    return 'manual';
  }
  let dialog, content, heading, returnFocus;
  function open(title) {
    if (!dialog) {
      dialog = document.createElement('dialog'); dialog.className = 'museum-dialog';
      dialog.setAttribute('aria-labelledby', 'museum-dialog-title');
      heading = document.createElement('h2'); heading.id = 'museum-dialog-title';
      const close = document.createElement('button'); close.className = 'btn'; close.textContent = 'Kapat ×'; close.type = 'button';
      close.addEventListener('click', () => dialog.close());
      const head = document.createElement('div'); head.className = 'museum-dialog-head'; head.append(heading, close);
      content = document.createElement('div'); content.className = 'museum-dialog-body'; dialog.append(head, content); document.body.append(dialog);
      dialog.addEventListener('close', () => { if (returnFocus && returnFocus.isConnected) returnFocus.focus(); });
      dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
    }
    returnFocus = document.activeElement; heading.textContent = title; content.replaceChildren(); dialog.showModal();
  }
  function paragraph(text) { const p = document.createElement('p'); p.textContent = text; content.append(p); return p; }
  function status(text) {
    let el = document.getElementById('museum-link-status');
    if (!el) { el = document.createElement('div'); el.id = 'museum-link-status'; el.setAttribute('role', 'status'); document.body.append(el); }
    el.textContent = text; clearTimeout(status.timer); status.timer = setTimeout(() => { el.textContent = ''; }, 4500);
  }
  async function share(vehicle, button) {
    if (button.disabled) return;
    const lab = location.pathname.endsWith('/enigma.html') && vehicle.id === 'enigma';
    const url = buildLink(vehicle, location.href, lab);
    button.disabled = true;
    try {
      const result = await deliver({title: vehicle.name, text: vehicle.name + ' — İnteraktif 3D müze', url}, navigator);
      if (result === 'copied') status('Araç bağlantısı kopyalandı.');
      if (result === 'manual') {
        open('Bağlantıyı paylaş'); paragraph(vehicle.name);
        const label = document.createElement('label'); label.textContent = 'Paylaşılacak bağlantı';
        const input = document.createElement('input'); input.type = 'url'; input.readOnly = true; input.value = url; label.append(input); content.append(label);
        paragraph('Bağlantıyı seçip kopyalayabilirsiniz.'); input.focus(); input.select();
      }
    } finally { button.disabled = false; }
  }
  function sources(vehicle) {
    open(vehicle.name + ' — Kaynaklar');
    if (vehicle.id === 'maxim' || vehicle.id === 'gatling') {
      const link = document.createElement('a'); link.href = 'maxim-gatling.html'; link.textContent = 'Gatling → Maxim: kranktan geri tepmeye karşılaştırması ↗'; content.append(link);
    }
    paragraph('Araştırma kaynakları ve ek okuma için müze, kurum ve tarihsel belge bağlantıları. Rekonstrüksiyonlar ile yorumlanan ayrıntılar araç açıklamalarında belirtilir.');
    const list = document.createElement('ul');
    for (const source of vehicle.sources || []) {
      let url; try { url = new URL(source.url); } catch (_) { continue; }
      if (url.protocol !== 'https:') continue;
      const li = document.createElement('li'), a = document.createElement('a'); a.href = url.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = source.title + ' ↗'; li.append(a); if (source.note) { const note = document.createElement('small'); note.textContent = source.note; li.append(note); } list.append(li);
    }
    if (list.children.length) content.append(list);
    else paragraph('Bu aracın kaynak bağlantıları henüz kataloğa aktarılmadı.');
  }
  document.addEventListener('click', e => {
    const button = e.target.closest('[data-museum-share], [data-museum-sources]'); if (!button) return;
    const vehicle = currentVehicle(button.dataset.museumShare || button.dataset.museumSources); if (!vehicle) return;
    if (button.hasAttribute('data-museum-share')) void share(vehicle, button); else sources(vehicle);
  });
  window.MuseumLinks = { buildLink, deliver };
})();
