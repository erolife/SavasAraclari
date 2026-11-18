(function () {
  'use strict';
  const en = window.MuseumPreferences?.language === 'en';
  const t = (tr, english) => en ? english : tr;
  const params = new URLSearchParams(location.search);
  const models = window.MUSEUM_CATALOG.VEHICLES;
  const vehicle = models.find(item => (item.sim || item.id) === params.get('vehicle')) || models.find(item => item.id === 'tiger');
  const panel = document.createElement('section');
  panel.className = 'museum-loading';
  panel.id = 'museum-loading';
  panel.setAttribute('aria-label', t('Sergi hazırlanıyor', 'Preparing exhibit'));
  const heading = document.createElement('h1');
  heading.textContent = vehicle.name;
  const art = document.createElement('div');
  art.className = 'loading-art';
  art.setAttribute('aria-hidden', 'true');
  art.innerHTML = vehicle.svg;
  const description = document.createElement('p');
  const copy = window.MuseumViewCopy[vehicle.sim || vehicle.id];
  description.textContent = copy[en ? 1 : 0].slice(0, 3).join(' ');
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.textContent = t('3D sergi hazırlanıyor…', 'Preparing the 3D exhibit…');
  const sources = document.createElement('button');
  sources.className = 'btn';
  sources.dataset.museumSources = vehicle.id;
  sources.textContent = t('Kaynaklar', 'Sources');
  const retry = document.createElement('button');
  retry.className = 'btn';
  retry.textContent = t('Yeniden dene', 'Try again');
  retry.hidden = true;
  retry.addEventListener('click', () => location.reload());
  panel.append(heading, art, description, status, sources, retry);
  document.body.append(panel);
  const quality = document.createElement('select');
  quality.id = 'museum-quality';
  quality.setAttribute('aria-label', t('Görüntü kalitesi', 'Rendering quality'));
  quality.add(new Option(t('Standart kalite', 'Standard quality'), 'standard'));
  quality.add(new Option(t('Hafif kalite', 'Lightweight quality'), 'light'));
  let choice = 'standard';
  try { if (localStorage.getItem('museum-render-quality') === 'light') choice = 'light'; } catch (_) {}
  quality.value = choice;
  document.querySelector('.top-actions').append(quality);
  let apply = () => {};
  quality.addEventListener('change', () => {
    choice = quality.value;
    try { localStorage.setItem('museum-render-quality', choice); } catch (_) {}
    apply(choice);
  });
  function fail() {
    panel.hidden = false;
    status.textContent = t('3D görünüm açılamadı. Sergi anlatımını ve kaynaklarını inceleyebilir veya yeniden deneyebilirsin.',
      'The 3D view could not open. You can read the exhibit, explore its sources or try again.');
    retry.hidden = false;
  }
  window.MuseumLoading = {
    bind(renderer) {
      apply = value => {
        renderer.setPixelRatio(Math.min(devicePixelRatio, value === 'light' ? 1 : 2));
        renderer.shadowMap.enabled = value !== 'light';
      };
      apply(choice);
      renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); fail(); });
      renderer.domElement.addEventListener('webglcontextrestored', () => { panel.hidden = true; });
    },
    ready() { panel.hidden = true; },
    fail
  };
  // Import errors can happen before the simulator's own error handler runs.
  setTimeout(() => { if (!panel.hidden) fail(); }, 20000);
})();
