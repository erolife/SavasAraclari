(function () {
  'use strict';
  const key = 'museum-personal-collection-v1';
  const recentLimit = 12;
  const exhibits = (window.MUSEUM_CATALOG?.VEHICLES || []).filter(vehicle => vehicle.status === 'live');
  const byId = new Map(exhibits.map(vehicle => [vehicle.id, vehicle]));
  const byModel = new Map(exhibits.map(vehicle => [vehicle.sim || vehicle.id, vehicle]));
  const t = (tr, en) => window.MuseumPreferences?.language === 'en' ? en : tr;

  function checkpoint(value) {
    if (!byId.has(value?.id)) return null;
    if (value.id === 'enigma' && value.page === 'lab') return { id: value.id, page: 'lab' };
    const view = value.view === 'overview' ? 'overview' : 'technical';
    const tour = Number.isInteger(value.tour) && value.tour > 0 && value.tour <= 100 ? value.tour : 1;
    return { id: value.id, page: 'model', view, tour };
  }

  function normalize(value) {
    const favorites = Array.isArray(value?.favorites) ? value.favorites.filter(id => byId.has(id)) : [];
    const recent = new Map();
    if (Array.isArray(value?.recent)) {
      for (const item of value.recent) {
        const entry = checkpoint(item);
        if (entry && !recent.has(entry.id)) recent.set(entry.id, entry);
        if (recent.size === recentLimit) break;
      }
    }
    return { favorites: [...new Set(favorites)], recent: [...recent.values()] };
  }

  function createStore(storage) {
    let data = normalize(null);
    let persisted = true;

    function refresh() {
      if (!persisted) return;
      try {
        const stored = storage.getItem(key);
        try { data = normalize(JSON.parse(stored)); }
        catch (_) { data = normalize(null); }
      } catch (_) {
        persisted = false;
      }
    }

    function update(change) {
      refresh();
      const next = normalize(change(data));
      const changed = JSON.stringify(next) !== JSON.stringify(data);
      if (!changed) return false;
      data = next;
      if (persisted) {
        try { storage.setItem(key, JSON.stringify(data)); }
        catch (_) { persisted = false; }
      }
      return true;
    }

    refresh();
    return {
      get data() { return data; },
      get persisted() { return persisted; },
      refresh,
      toggle(id) {
        if (!byId.has(id)) return false;
        return update(state => ({ ...state, favorites: state.favorites.includes(id)
          ? state.favorites.filter(item => item !== id) : [id, ...state.favorites] }));
      },
      visit(value) {
        const entry = checkpoint(value);
        if (!entry) return false;
        return update(state => ({ ...state, recent: [entry, ...state.recent.filter(item => item.id !== entry.id)] }));
      },
      removeFavorite(id) {
        return update(state => ({ ...state, favorites: state.favorites.filter(item => item !== id) }));
      },
      clearHistory() { return update(state => ({ ...state, recent: [] })); },
      reset() { return update(() => null); }
    };
  }

  function link(value) {
    const entry = checkpoint(value);
    if (!entry) return null;
    if (entry.page === 'lab') return 'enigma.html';
    const vehicle = byId.get(entry.id);
    const query = new URLSearchParams({ vehicle: vehicle.sim || vehicle.id });
    if (entry.view === 'technical' && value.view === 'technical') {
      query.set('view', 'technical');
      if (entry.tour > 1) query.set('tour', entry.tour);
    }
    return 'simulator.html?' + query;
  }

  const store = createStore({
    getItem: item => window.localStorage.getItem(item),
    setItem: (item, value) => window.localStorage.setItem(item, value)
  });

  function refreshButtons(root = document) {
    const favoriteIds = new Set(store.data.favorites);
    for (const button of root.querySelectorAll('[data-museum-favorite]')) {
      const vehicle = byId.get(button.dataset.museumFavorite);
      button.hidden = !vehicle;
      if (!vehicle) continue;
      const pressed = favoriteIds.has(vehicle.id);
      const label = t('Favori', 'Favorite');
      button.setAttribute('aria-pressed', String(pressed));
      button.setAttribute('aria-label', `${label} · ${vehicle.name}`);
      button.textContent = `${pressed ? '★' : '☆'} ${label}`;
    }
  }

  function notify() {
    refreshButtons();
    window.dispatchEvent(new Event('museumcollectionchange'));
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-museum-favorite]');
    if (!button || !store.toggle(button.dataset.museumFavorite)) return;
    notify();
  });
  window.addEventListener('storage', event => {
    if (event.key !== null && event.key !== key) return;
    store.refresh();
    notify();
  });
  window.addEventListener('pageshow', () => {
    store.refresh();
    notify();
  });

  window.MuseumCollection = {
    key, createStore, link, store, byId, refreshButtons,
    setActiveModel(model) {
      const vehicle = byModel.get(model);
      const button = document.getElementById('museum-model-favorite');
      button.dataset.museumFavorite = vehicle?.id || '';
      store.refresh();
      refreshButtons(button.parentElement);
    },
    recordModel(model, tour, overview) {
      const vehicle = byModel.get(model);
      if (vehicle && store.visit({ id: vehicle.id, tour, view: overview ? 'overview' : 'technical' })) notify();
    },
    clearHistory() { if (store.clearHistory()) notify(); },
    reset() { if (store.reset()) notify(); },
    removeFavorite(id) { if (store.removeFavorite(id)) notify(); }
  };

  if (document.body.dataset.collectionVisit === 'enigma') store.visit({ id: 'enigma', page: 'lab' });
  refreshButtons();
})();
