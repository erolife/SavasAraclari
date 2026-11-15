(function () {
  'use strict';
  const collection = window.MuseumCollection;
  const t = (tr, en) => window.MuseumPreferences?.language === 'en' ? en : tr;
  const text = {
    back: t('← Envanter', '← Collection'),
    title: t('Koleksiyonum', 'My collection'),
    privacy: t('Favoriler ve inceleme geçmişi yalnızca bu tarayıcıda saklanır.', 'Favorites and browsing history are saved only in this browser.'),
    resume: t('Kaldığın yerden devam et', 'Pick up where you left off'),
    open: t('Devam et ↗', 'Resume ↗'),
    favorites: t('Favoriler', 'Favorites'),
    noFavorites: t('Bir sergideki ☆ Favori düğmesine dokunarak buraya ekleyebilirsin.', 'Use the ☆ Favorite button on an exhibit to save it here.'),
    recent: t('Son incelenenler', 'Recently viewed'),
    noRecent: t('Açtığın sergiler burada görünür.', 'The exhibits you open appear here.'),
    clear: t('Geçmişi temizle', 'Clear history'),
    reset: t('Koleksiyonu sıfırla', 'Reset collection'),
    cancel: t('Vazgeç', 'Cancel'),
    confirm: t('Temizle', 'Clear'),
    remove: t('Kaldır', 'Remove')
  };
  const byId = id => document.getElementById(id);
  const resume = byId('resume-exhibit');
  const favorites = byId('favorites-list');
  const recent = byId('recent-list');
  const clear = byId('clear-history');
  const reset = byId('reset-collection');
  const dialog = byId('collection-confirm');
  const status = byId('collection-status');
  let pending;

  document.title = text.title + t(' — Savaş Makineleri', ' — War Machines');
  document.querySelector('.collection-nav').setAttribute('aria-label', t('Müze gezinmesi', 'Museum navigation'));
  document.querySelectorAll('[data-collection-text]').forEach(node => { node.textContent = text[node.dataset.collectionText]; });

  function describe(record) {
    const name = collection.byId.get(record.id).name;
    if (record.page === 'lab') return name + t(' · Şifreleme laboratuvarı', ' · Cipher lab');
    if (record.tour > 1 && record.view === 'technical') return name + t(` · Tur adımı ${record.tour}`, ` · Tour step ${record.tour}`);
    return name;
  }

  function makeRow(record, removable) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = collection.link(record);
    link.textContent = describe(record);
    item.append(link);
    if (removable) {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = text.remove;
      remove.setAttribute('aria-label', `${text.remove} · ${link.textContent}`);
      remove.addEventListener('click', () => {
        const index = [...favorites.children].indexOf(item);
        collection.removeFavorite(record.id);
        status.textContent = t('Favori kaldırıldı.', 'Favorite removed.');
        const next = favorites.children[Math.min(index, favorites.children.length - 1)];
        (next?.querySelector('button') || byId('favorites-title')).focus();
      });
      item.append(remove);
    }
    return item;
  }

  function render() {
    const { favorites: saved, recent: viewed } = collection.store.data;
    const latest = viewed[0];
    resume.hidden = !latest;
    if (latest) resume.href = collection.link(latest);
    else resume.removeAttribute('href');
    byId('resume-detail').textContent = latest ? describe(latest)
      : t('İlk sergini açtığında buradan devam edebilirsin.', 'Open your first exhibit to continue from here.');
    favorites.replaceChildren(...saved.map(id => makeRow({ id }, true)));
    recent.replaceChildren(...viewed.map(entry => makeRow(entry, false)));
    byId('favorites-empty').hidden = saved.length > 0;
    byId('recent-empty').hidden = viewed.length > 0;
    clear.hidden = viewed.length === 0;
    reset.hidden = saved.length === 0 && viewed.length === 0;
    const storage = byId('collection-storage');
    storage.hidden = collection.store.persisted;
    storage.textContent = t('Tarayıcı kaydı kapalı. Değişiklikler yalnızca bu sayfa açıkken korunur.',
      'Browser storage is unavailable. Changes last while this page is open.');
  }

  function confirm(action, trigger, title, description) {
    pending = { action, trigger };
    byId('collection-confirm-title').textContent = title;
    byId('collection-confirm-detail').textContent = description;
    dialog.returnValue = '';
    dialog.showModal();
  }

  clear.addEventListener('click', () => confirm('history', clear, text.clear,
    t('Son incelenenler ve devam noktası silinecek.', 'This clears recently viewed exhibits and the resume point.')));
  reset.addEventListener('click', () => confirm('all', reset, text.reset,
    t('Favoriler, son incelenenler ve devam noktası silinecek.', 'This clears favorites, recently viewed exhibits and the resume point.')));
  dialog.addEventListener('close', () => {
    if (!pending) return;
    const { action, trigger } = pending;
    pending = null;
    if (dialog.returnValue !== 'confirm') {
      trigger.focus();
      return;
    }
    if (action === 'history') {
      collection.clearHistory();
      status.textContent = t('Geçmiş temizlendi.', 'History cleared.');
      byId('recent-title').focus();
    } else {
      collection.reset();
      status.textContent = t('Koleksiyon sıfırlandı.', 'Collection reset.');
      byId('favorites-title').focus();
    }
  });

  window.addEventListener('museumcollectionchange', render);
  render();
})();
