const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const load = (file, context) => vm.runInNewContext(fs.readFileSync(file, 'utf8'), context);

const window = { MuseumPreferences: { language: 'en' } };
load('js/catalog.js', { window });
const turkish = window.MUSEUM_CATALOG;
const original = JSON.stringify(turkish);
load('js/catalog-source-en.js', { window });
load('js/catalog-en.js', { window });
const english = window.MUSEUM_CATALOG;
assert.notEqual(english, turkish);
assert.equal(JSON.stringify(turkish), original);
assert.equal(english.VEHICLES.length, turkish.VEHICLES.length);
for (const [index, vehicle] of english.VEHICLES.entries()) {
  const old = turkish.VEHICLES[index];
  assert.equal(vehicle.id, old.id);
  assert.equal(vehicle.sim, old.sim);
  assert.equal(vehicle.year, old.year);
  assert.notEqual(vehicle.desc, old.desc, vehicle.id);
  assert.equal(JSON.stringify(vehicle.sources.map(source => source.url)), JSON.stringify(old.sources.map(source => source.url)));
  assert.equal(window.MuseumSourceEnglish[vehicle.id].length, old.sources.length, vehicle.id);
  for (const [index, source] of vehicle.sources.entries()) {
    assert.ok(source.title, vehicle.id);
    if (old.sources[index].note) assert.notEqual(source.note, old.sources[index].note, vehicle.id);
  }
}
const mace = english.VEHICLES.find(vehicle => vehicle.id === 'dragonmace');
assert.match(mace.sources[0].title, /catalogue entry 146/);
assert.match(mace.sources[1].note, /printed page 234/);
assert.equal(english.FACETS.find(f => f.key === 'domain').options[0].label, '🪖 Land');

load('js/exhibit-labels-en.js', { window });
load('js/exhibit-tours-en.js', { window });
load('js/exhibit-copy-en.js', { window });
assert.equal(window.MuseumLabelEnglish['Dış Gövde ve Kanatlar'], 'Outer Fuselage & Wings');
assert.equal(window.MuseumTourEnglish['Çanakkale’deki Rolü'], 'Its Role at Çanakkale');
assert.equal(window.MuseumExhibitEnglish['23. Dümen Palası ve Mil'], '23. Rudder blade and stock');

function preferences(storage, dark, search = '') {
  const root = { dataset: {} };
  let onSystemChange;
  const events = [];
  const handlers = {};
  const location = new URL('https://museum.example/index.html' + search);
  const media = { matches: dark, addEventListener(_, cb) { onSystemChange = cb; } };
  const window = {
    matchMedia: () => media,
    dispatchEvent(event) { events.push(event.type); }
  };
  load('js/museum-preferences.js', {
    window,
    document: {
      documentElement: root,
      querySelector() { return null; },
      addEventListener(type, listener) { handlers[type] = listener; }
    },
    location, localStorage: { getItem: storage },
    URL, URLSearchParams, Event
  });
  handlers.DOMContentLoaded();
  return { root, state: window.MuseumPreferences, events,
    changeSystem(dark) { media.matches = dark; onSystemChange(); },
    follow(href) {
      const anchor = { href: new URL(href, location).href };
      if (handlers.click) handlers.click({ target: { closest: () => anchor } });
      return anchor.href;
    }
  };
}
const system = preferences(() => 'invalid json', true);
assert.equal(system.root.lang, 'tr');
assert.equal(system.state.themeChoice, 'system');
assert.equal(system.root.dataset.museumTheme, 'dark');
system.changeSystem(false);
assert.equal(system.root.dataset.museumTheme, 'light');
assert.deepEqual(system.events, ['museumthemechange']);

const explicit = preferences(() => '{"language":"en","theme":"light"}', true);
explicit.changeSystem(true);
assert.equal(explicit.root.lang, 'en');
assert.equal(explicit.root.dataset.museumTheme, 'light');
assert.deepEqual(explicit.events, []);
const blocked = preferences(() => { throw Error('Storage denied'); }, false, '?lang=en');
assert.equal(blocked.root.lang, 'en');
assert.equal(blocked.root.dataset.museumTheme, 'light');
assert.equal(blocked.follow('/karsilastir'), 'https://museum.example/karsilastir?lang=en');
assert.equal(blocked.follow('/simulator.html?vehicle=nusret'), 'https://museum.example/simulator.html?vehicle=nusret&lang=en');
assert.equal(blocked.follow('/karsilastir?lang=tr'), 'https://museum.example/karsilastir?lang=tr');
assert.equal(blocked.follow('/manual.pdf'), 'https://museum.example/manual.pdf');
assert.equal(blocked.follow('https://sources.example/collection'), 'https://sources.example/collection');
console.log('PASS preferences: catalogue coverage and integrity, saved preferences, system changes, denied storage fallback');
