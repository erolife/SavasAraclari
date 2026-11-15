(function () {
  'use strict';
  const key = 'savas-araclari-preferences';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const languages = ['tr', 'en'];
  const themes = ['system', 'light', 'dark'];
  const params = new URLSearchParams(location.search);
  let stored;
  try { stored = JSON.parse(localStorage.getItem(key)); } catch (_) {}
  const fallback = params.get('lang');
  const settings = {
    language: languages.includes(fallback) ? fallback : languages.includes(stored?.language) ? stored.language : 'tr',
    theme: themes.includes(stored?.theme) ? stored.theme : 'system'
  };
  const resolvedTheme = () => settings.theme === 'system' ? (system.matches ? 'dark' : 'light') : settings.theme;
  function applyTheme() { root.dataset.museumTheme = resolvedTheme(); }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(settings)); return true; }
    catch (_) { return false; }
  }
  root.lang = settings.language;
  applyTheme();
  window.MuseumPreferences = {
    get language() { return settings.language; },
    get theme() { return resolvedTheme(); },
    get themeChoice() { return settings.theme; }
  };
  system.addEventListener('change', () => {
    if (settings.theme !== 'system') return;
    applyTheme();
    window.dispatchEvent(new Event('museumthemechange'));
  });

  function renderControls() {
    const host = document.querySelector('.nav-cta, .top-bar, .museum-nav, .museum-lab-header, .comparison-nav');
    if (!host) return;
    const english = settings.language === 'en';
    const controls = document.createElement('div');
    controls.className = 'museum-preferences';
    function select(id, label, values, current, apply) {
      const field = document.createElement('select');
      field.id = id;
      field.title = label;
      field.setAttribute('aria-label', label);
      for (const [value, text] of values) field.add(new Option(text, value, false, value === current));
      field.addEventListener('change', () => apply(field.value));
      controls.append(field);
    }
    select('museum-language', english ? 'Language' : 'Dil', [['tr','TR'],['en','EN']], settings.language, language => {
      settings.language = language;
      const url = new URL(location.href);
      if (save()) url.searchParams.delete('lang');
      else url.searchParams.set('lang', language);
      if (url.href === location.href) location.reload();
      else location.replace(url);
    });
    select('museum-theme', english ? 'Colour theme' : 'Renk teması', english
      ? [['system','System'],['light','Light'],['dark','Dark']]
      : [['system','Sistem'],['light','Aydınlık'],['dark','Karanlık']], settings.theme, theme => {
      settings.theme = theme;
      save();
      applyTheme();
      window.dispatchEvent(new Event('museumthemechange'));
    });
    host.append(controls);
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderControls();
    // Carry the language between pages when browser storage is unavailable.
    if (!languages.includes(fallback)) return;
    document.addEventListener('click', event => {
      const anchor = event.target.closest('a[href]');
      if (!anchor) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin === location.origin && url.pathname.endsWith('.html') && !url.searchParams.has('lang')) {
        url.searchParams.set('lang', settings.language);
        anchor.href = url.href;
      }
    }, true);
  });
})();
