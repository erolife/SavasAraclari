(function () {
  'use strict';
  const lang = window.MuseumPreferences?.language === 'en' ? 1 : 0;
  const trails = window.MuseumTrails;
  const t = (tr, en) => lang ? en : tr;
  function node(tag, text) {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    return el;
  }
  const params = new URLSearchParams(location.search);
  const model = params.get('vehicle');
  const trail = trails.find(item => item.id === params.get('trail'));
  if (model) {
    function renderReturn() {
    document.querySelector('.trail-return')?.remove();
    const currentModel = new URLSearchParams(location.search).get('vehicle');
    const index = trail?.models.indexOf(currentModel) ?? -1;
    if (index < 0) return;
    const nav = node('nav');
    nav.className = 'trail-return';
    nav.setAttribute('aria-label', t('Keşif rotası', 'Discovery trail'));
    const back = node('a', trail.title[lang]);
    back.href = 'rotalar.html#' + trail.id;
    nav.append(back);
    const next = trail.models[index + 1];
    if (next) {
      const link = node('a', t('Sonraki sergi →', 'Next exhibit →'));
      link.href = 'simulator.html?' + new URLSearchParams({vehicle:next, trail:trail.id});
      nav.append(link);
    }
    document.body.append(nav);
    }
    window.addEventListener('museumvehiclechange', renderReturn);
    renderReturn();
    return;
  }
  document.title = t('Keşif rotaları', 'Discovery trails') + ' — War Machines';
  document.getElementById('trails-title').textContent = t('Keşif rotaları', 'Discovery trails');
  document.getElementById('trails-intro').textContent = t('Bir tema seç, dört sergi arasındaki bağlantıları keşfet.',
    'Choose a theme and explore the connections between four exhibits.');
  const links = document.querySelectorAll('.museum-nav a');
  links[0].textContent = t('← Envanter', '← Collection');
  links[1].textContent = t('Türk tarihi rotası ↗', 'Turkish history trail ↗');
  const options = document.getElementById('trail-options');
  options.setAttribute('aria-label', t('Rota seçimi', 'Choose a trail'));
  for (const item of trails) {
    const link = node('a', item.title[lang]);
    link.className = 'action';
    link.href = '#' + item.id;
    options.append(link);
  }
  function render() {
    const selected = trails.find(item => item.id === location.hash.slice(1)) || trails[0];
    options.querySelectorAll('a').forEach(link => {
      if (link.hash === '#' + selected.id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    const list = node('ol');
    list.className = 'trail-stops';
    selected.models.forEach((id, index) => {
      const vehicle = window.MUSEUM_CATALOG.VEHICLES.find(item => (item.sim || item.id) === id);
      const card = node('li');
      const art = node('div');
      art.className = 'trail-art';
      art.setAttribute('aria-hidden','true');
      art.innerHTML = vehicle.svg;
      const link = node('a', t('Sergiyi keşfet ↗', 'Explore exhibit ↗'));
      link.className = 'action primary';
      link.href = 'simulator.html?' + new URLSearchParams({vehicle:id,trail:selected.id});
      card.append(art,node('h3',vehicle.name),node('p',selected.connections[index][lang]),
        node('p',window.MuseumViewCopy[id][lang][3]),link);
      list.append(card);
    });
    document.getElementById('trail-content').replaceChildren(node('h2',selected.title[lang]),node('p',selected.intro[lang]),list);
  }
  window.addEventListener('hashchange',render);
  render();
})();
