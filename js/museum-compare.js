(function () {
  'use strict';
  const english = window.MuseumPreferences?.language === 'en';
  const t = (tr, en) => english ? en : tr;
  const text = {
    home: t('← Envanter', '← Collection'),
    timeline: t('Tarih çizelgesi ↗', 'Timeline ↗'),
    title: t('Araçları karşılaştır', 'Compare exhibits'),
    intro: t('Koleksiyondan iki sergi seçin. Dönemlerini, çalışma ilkelerini ve tarihsel rollerini yan yana inceleyin.',
      'Choose two exhibits from the collection. Look at their eras, working principles and historical roles side by side.'),
    selection: t('Sergi seçimi', 'Exhibit selection'),
    left: t('Birinci sergi', 'First exhibit'),
    right: t('İkinci sergi', 'Second exhibit')
  };
  const catalog = window.MUSEUM_CATALOG;
  const exhibits = catalog.VEHICLES.filter(vehicle => vehicle.status === 'live');
  const byId = new Map(exhibits.map(vehicle => [vehicle.id, vehicle]));
  const byElement = id => document.getElementById(id);
  const selects = [byElement('compare-left'), byElement('compare-right')];
  const cards = [byElement('compare-left-card'), byElement('compare-right-card')];
  const pairs = [...document.querySelectorAll('[data-pair]')];
  const defaultPair = ['abdulhamid', 'u505'];
  const comparisonGroups = [defaultPair, ['j79', 'harrier']];
  const dimensionUnavailable = t('Bu motor sürümü için doğrulanmış ölçü bulunamadı.', 'Dimensions for this engine variant have not been verified.');
  const featured = {
    abdulhamid: {
      name: 'Abdülhamid',
      excerpt: t('Taşkızak’ta monte edilen Nordenfelt II, Osmanlı donanmasının erken denizaltı deneylerinden biriydi.',
        'Assembled at Taşkızak, Nordenfelt II was one of the Ottoman Navy’s early submarine experiments.'),
      principle: t('Buhar tahriki', 'Steam propulsion'),
      dimensions: t('Yaklaşık 31 m boy · 3,6 m en', 'About 31 m long · 3.6 m beam'),
      role: t('Denizaltı teknolojisinin sınandığı deneysel bir tekne.', 'An experimental vessel for testing early submarine technology.'),
      reference: ['Millî Savunma Üniversitesi', 'https://www.msu.edu.tr/mavivatandanacikdenizleredergisi/mavi_vatan_14.pdf']
    },
    u505: {
      name: 'U-505',
      excerpt: t('Atlantik’te görev yapan Type IXC sınıfı Alman denizaltısı, 1944’te ABD Donanması tarafından ele geçirildi.',
        'This German Type IXC submarine patrolled the Atlantic and was captured by the U.S. Navy in 1944.'),
      principle: t('Yüzeyde dizel, dalışta elektrik', 'Diesel on the surface, electric when submerged'),
      dimensions: t('Yaklaşık 76,8 m boy · 6,8 m en', 'About 76.8 m long · 6.8 m beam'),
      role: t('II. Dünya Savaşı’nda uzun menzilli Atlantik devriyeleri.', 'Long-range Atlantic patrols during World War II.'),
      reference: ['Griffin Museum of Science and Industry', 'https://collections.griffinmsi.org/collections/4855']
    },
    j79: {
      name: 'General Electric J79-GE-15',
      excerpt: t('Art yakıcılı turbojet. J79 ailesi, F-4 ve F-104 gibi süpersonik uçaklara güç verdi.',
        'An afterburning turbojet. The J79 family powered supersonic aircraft such as the F-4 and F-104.'),
      principle: t('Art yakıcılı turbojet · arkaya yönelen egzoz', 'Afterburning turbojet · rearward exhaust'),
      dimensions: t('Yaklaşık 5,31 m boy · 0,97 m çap', 'About 5.31 m long · 0.97 m diameter'),
      role: t('Yüksek hızlı uçuş için ileri itiş.', 'Forward thrust for high-speed flight.'),
      reference: ['GE Aerospace · J79', 'https://www.geaerospace.com/sites/default/files/datasheet-J79.pdf'],
      dimensionsReference: [
        t('Müze ölçü kaydı', 'Museum measurement record'),
        'https://www.nationalmuseum.af.mil/Visit/Museum-Exhibits/Fact-Sheets/Display/Article/197630/general-electric-j79-turbojet/'
      ]
    },
    harrier: {
      name: 'Rolls-Royce Pegasus Mk 101',
      excerpt: t('Harrier GR.1 içindeki Pegasus, jet itişini dört döner nozulla yönlendirir.',
        'Inside the Harrier GR.1, the Pegasus directs jet thrust through four swivelling nozzles.'),
      principle: t('Yönlendirilebilir itişli turbofan · dört döner nozul', 'Vectored-thrust turbofan · four swivelling nozzles'),
      dimensions: dimensionUnavailable,
      role: t('Kısa veya dikey kalkış ve inişi mümkün kılan yönlendirilebilir itiş.', 'Vectored thrust for short or vertical takeoff and landing.'),
      reference: ['ASME · Pegasus', 'https://www.asme.org/about-asme/engineering-history/landmarks/168-pegasus-3-engine-bs-916']
    }
  };

  function element(tag, value) {
    const node = document.createElement(tag);
    if (value !== undefined) node.textContent = value;
    return node;
  }

  const nameOf = vehicle => featured[vehicle.id]?.name || vehicle.name;
  function facet(vehicle, key) {
    const options = catalog.FACETS.find(item => item.key === key).options;
    return [].concat(vehicle[key] || []).map(value => options.find(option => option.key === value)?.label || value).join(' · ');
  }

  function card(node, vehicle) {
    const info = featured[vehicle.id];
    const art = element('div');
    art.className = 'compare-art';
    art.setAttribute('aria-hidden', 'true');
    if (info) {
      const image = element('img');
      image.src = `images/compare/${vehicle.id}.webp`;
      image.alt = '';
      image.width = 720;
      image.height = 360;
      art.append(image);
    } else {
      art.innerHTML = vehicle.svg;
    }
    const model = element('a', '3D model ↗');
    const query = new URLSearchParams({ vehicle: vehicle.sim || vehicle.id });
    if (vehicle.id === 'harrier') {
      query.set('mode', 'xray');
      query.set('cam', 'engine');
    }
    model.href = 'simulator.html?' + query;
    model.className = 'action primary';
    const sources = element('button', t('Kaynaklar', 'Sources'));
    sources.type = 'button';
    sources.dataset.museumSources = vehicle.id;
    const actions = element('div');
    actions.className = 'actions';
    actions.append(model, sources);
    node.replaceChildren(art, element('h3', nameOf(vehicle)), element('p', info?.excerpt || vehicle.desc), actions);
  }

  function referenceLink(record) {
    const link = element('a', record[0] + ' ↗');
    link.href = record[1];
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  function source(vehicle) {
    const record = featured[vehicle.id]?.reference || [vehicle.sources[0]?.title, vehicle.sources[0]?.url];
    return record[1] ? referenceLink(record) : t('Kaynak kaydı yok.', 'No source entry.');
  }

  function dimensions(vehicle) {
    const info = featured[vehicle.id];
    if (!info.dimensionsReference) return info.dimensions;
    const value = document.createDocumentFragment();
    value.append(info.dimensions, element('br'), referenceLink(info.dimensionsReference));
    return value;
  }

  function table(vehicles) {
    const target = byElement('compare-table');
    const caption = element('caption', t('Yan yana', 'Side by side'));
    const heading = element('tr');
    for (const label of [t('Özellik', 'Feature'), ...vehicles.map(nameOf)]) {
      const cell = element('th', label);
      cell.scope = 'col';
      heading.append(cell);
    }
    const head = element('thead');
    head.append(heading);
    const body = element('tbody');
    function row(label, value) {
      const line = element('tr');
      const name = element('th', label);
      name.scope = 'row';
      line.append(name);
      for (const vehicle of vehicles) {
        const cell = element('td');
        cell.append(value(vehicle));
        line.append(cell);
      }
      body.append(line);
    }
    row(t('Dönem', 'Era'), vehicle => `${vehicle.yearLabel} · ${vehicle.eraLabel}`);
    row(t('İşleyiş', 'Working principle'), vehicle => featured[vehicle.id]?.principle || facet(vehicle, 'energy'));
    row(t('Tarihsel rol', 'Historical role'), vehicle => featured[vehicle.id]?.role || facet(vehicle, 'role') || facet(vehicle, 'domain'));
    if (comparisonGroups.some(group => vehicles.every(vehicle => group.includes(vehicle.id)))) {
      row(t('Boyut', 'Dimensions'), dimensions);
    }
    row(t('Başlıca kaynak', 'Key source'), source);
    target.replaceChildren(caption, head, body);
  }

  function readPair() {
    const url = new URL(location.href);
    const left = url.searchParams.get('left');
    const right = url.searchParams.get('right');
    const first = byId.has(left) ? left : defaultPair[0];
    const second = byId.has(right) && right !== first ? right : defaultPair.find(id => id !== first);
    return [first, second];
  }

  function render(ids) {
    const vehicles = ids.map(id => byId.get(id));
    selects.forEach((select, index) => {
      for (const option of select.options) option.disabled = option.value === ids[1 - index];
      select.value = ids[index];
      card(cards[index], vehicles[index]);
    });
    table(vehicles);
    const note = byElement('compare-note');
    note.hidden = !ids.includes('abdulhamid') && !ids.includes('harrier');
    note.textContent = [
      ids.includes('abdulhamid') && t('Abdülhamid ile Abdülmecid’in denemeleri hakkında kaynaklar farklı anlatımlar verir.',
        'Sources differ on the trials of Abdülhamid and Abdülmecid.'),
      ids.includes('harrier') && t('Pegasus, Harrier GR.1 modelinde incelenir. ASME’nin sergilediği motor erken Pegasus 3 prototipidir.',
        'Explore the Pegasus in the Harrier GR.1 model. The ASME landmark documents the earlier Pegasus 3 prototype.')
    ].filter(Boolean).join(' ');
    byElement('compare-status').textContent = vehicles.map(nameOf).join(' ↔ ');
    for (const link of pairs) {
      const match = link.dataset.pair.split(',').every(id => ids.includes(id));
      if (match) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  }

  function choose(ids) {
    const url = new URL(location.href);
    url.searchParams.set('left', ids[0]);
    url.searchParams.set('right', ids[1]);
    if (url.href !== location.href) history.pushState(null, '', url);
    render(ids);
  }

  document.title = text.title + t(' — Savaş Makineleri', ' — War Machines');
  document.querySelectorAll('[data-copy]').forEach(node => { node.textContent = text[node.dataset.copy]; });
  document.querySelector('.compare-nav').setAttribute('aria-label', t('Müze gezinmesi', 'Museum navigation'));
  byElement('compare-pairs').setAttribute('aria-label', t('Önerilen karşılaştırmalar', 'Suggested comparisons'));
  for (const select of selects) {
    for (const vehicle of exhibits) select.add(new Option(nameOf(vehicle), vehicle.id));
    select.addEventListener('change', () => choose(selects.map(field => field.value)));
  }
  for (const link of pairs) link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    choose(link.dataset.pair.split(','));
  });
  window.addEventListener('popstate', () => render(readPair()));
  render(readPair());
})();
