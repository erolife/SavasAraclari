(function () {
  'use strict';

  const exhibits = window.MuseumViewCopy || {};

  function mount({ english, onChange }) {
    const panel = document.getElementById('museum-overview');
    const toggle = document.getElementById('museum-view-toggle');
    const lab = document.getElementById('museum-overview-lab');
    const descriptions = panel.querySelectorAll('dd');
    const parameters = new URLSearchParams(location.search);
    const technical = parameters.get('view') === 'technical' || parameters.has('mode') || parameters.has('cam') || parameters.has('tour');
    let overview = !technical;
    let exhibit;
    let visible = false;
    const t = (tr, en) => english ? en : tr;

    const questions = [
      t('Nedir?', 'What is it?'),
      t('Tarihteki yeri nedir?', 'Why does it matter?'),
      t('Nasıl çalışır?', 'How does it work?'),
      t('Modelde şuna bak', 'Look for this on the model')
    ];
    panel.querySelectorAll('dt').forEach((term, index) => { term.textContent = questions[index]; });
    panel.setAttribute('aria-label', t('Sergi anlatımı', 'Exhibit overview'));
    lab.textContent = t('Enigma laboratuvarını aç ↗', 'Open the Enigma lab ↗');

    function render(navigating = false) {
      visible = Boolean(exhibit) && overview;
      toggle.hidden = !exhibit;
      panel.hidden = !visible;
      document.body.classList.toggle('museum-overview-active', visible);
      toggle.textContent = visible ? t('Teknik inceleme', 'Technical view') : t('Müze görünümü', 'Museum view');
      toggle.setAttribute('aria-expanded', String(visible));
      onChange(visible, navigating);
    }

    toggle.addEventListener('click', () => {
      overview = !overview;
      const url = new URL(location.href);
      if (overview) {
        url.searchParams.delete('view');
        url.searchParams.delete('mode');
        url.searchParams.delete('cam');
        url.searchParams.delete('tour');
      } else {
        url.searchParams.set('view', 'technical');
      }
      history.replaceState(null, '', url);
      render();
      toggle.focus();
    });

    return {
      show(id) {
        exhibit = Object.hasOwn(exhibits, id) ? exhibits[id] : null;
        if (exhibit) {
          const copy = exhibit[english ? 1 : 0];
          descriptions.forEach((description, index) => { description.textContent = copy[index]; });
          lab.hidden = id !== 'enigma';
        }
        render(true);
      },
      get visible() { return visible; }
    };
  }

  window.MuseumView = { mount };
})();
