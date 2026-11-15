(function () {
  'use strict';

  const exhibits = {
    enigma: {
      tr: [
        'Enigma I, tuşları ve ışıklı harf paneli olan elektromekanik bir şifreleme makinesiydi.',
        'Alman askerî haberleşmesini korudu. Polonyalı ve Müttefik ekiplerin şifreyi çözmesi savaş istihbaratını etkiledi.',
        'Bir tuşa basınca rotorlar ilerler. Elektrik rotorlar ve yansıtıcıdan geçip çıkış harfinin lambasını yakar.'
      ],
      en: [
        'Enigma I was an electromechanical cipher machine with a keyboard and a panel of letter lamps.',
        'It protected German military communications. Work by Polish and Allied codebreakers shaped wartime intelligence.',
        'A key press advances the rotors. The electrical signal passes through the rotors and reflector, lighting the output letter.'
      ]
    },
    nusret: {
      tr: [
        'Nusret, Osmanlı donanmasında görev yapan küçük bir buharlı mayın gemisiydi.',
        '8 Mart 1915’te Erenköy Koyu’na döktüğü mayınlar, Çanakkale deniz muharebelerinin seyrini etkiledi.',
        'Güverte rayları yükün kıça taşınmasını sağlıyordu. Buhar makineleri iki pervane miline güç veriyordu.'
      ],
      en: [
        'Nusret was a small steam-powered minelayer in the Ottoman Navy.',
        'The mines it laid in Erenköy Bay on 8 March 1915 helped shape the naval battles of the Dardanelles.',
        'Deck rails let the crew move the load towards the stern. Steam engines drove the two propeller shafts.'
      ]
    },
    dragonmace: {
      tr: [
        '12–13. yüzyıl Anadolu’sından, ejder biçimli bir döküm gürz başının modelidir.',
        'Bu eser, Selçuklu metal işçiliğinde silah biçimi ile hayvan bezemesinin nasıl birleştiğini gösterir.',
        'Ejderin açık ağzı dökümün parçasıdır. Sergi, küçük hayvan motifinin baş üzerindeki konumunu yakından gösterir.'
      ],
      en: [
        'This model represents a cast dragon-shaped mace head from 12th–13th-century Anatolia.',
        'The object shows how Seljuk metalworkers combined the form of a weapon with animal ornament.',
        'The dragon’s open mouth is part of the casting. The exhibit offers a close look at where the small animal sits on the head.'
      ]
    }
  };

  function mount({ english, onChange }) {
    const panel = document.getElementById('museum-overview');
    const toggle = document.getElementById('museum-view-toggle');
    const lab = document.getElementById('museum-overview-lab');
    const descriptions = panel.querySelectorAll('dd');
    const parameters = new URLSearchParams(location.search);
    const technical = parameters.get('view') === 'technical' || parameters.has('mode') || parameters.has('cam');
    let overview = !technical;
    let exhibit;
    let visible = false;
    const t = (tr, en) => english ? en : tr;

    const questions = [
      t('Nedir?', 'What is it?'),
      t('Tarihteki yeri nedir?', 'Why does it matter?'),
      t('Nasıl çalışır?', 'How does it work?')
    ];
    panel.querySelectorAll('dt').forEach((term, index) => { term.textContent = questions[index]; });
    panel.setAttribute('aria-label', t('Sergi anlatımı', 'Exhibit overview'));
    lab.textContent = t('Enigma laboratuvarını aç ↗', 'Open the Enigma lab ↗');

    function render() {
      visible = Boolean(exhibit) && overview;
      toggle.hidden = !exhibit;
      panel.hidden = !visible;
      document.body.classList.toggle('museum-overview-active', visible);
      toggle.textContent = visible ? t('Teknik inceleme', 'Technical view') : t('Müze görünümü', 'Museum view');
      toggle.setAttribute('aria-expanded', String(visible));
      onChange(visible);
    }

    toggle.addEventListener('click', () => {
      overview = !overview;
      const url = new URL(location.href);
      if (overview) {
        url.searchParams.delete('view');
        url.searchParams.delete('mode');
        url.searchParams.delete('cam');
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
          const copy = exhibit[english ? 'en' : 'tr'];
          descriptions.forEach((description, index) => { description.textContent = copy[index]; });
          lab.hidden = id !== 'enigma';
        }
        render();
      },
      get visible() { return visible; }
    };
  }

  window.MuseumView = { mount };
})();
