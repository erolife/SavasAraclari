const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const load = (file, context) => vm.runInNewContext(fs.readFileSync(file, 'utf8'), context);

const window = { MuseumPreferences: { language: 'en' } };
load('js/catalog.js', { window });
const turkish = window.MUSEUM_CATALOG;
const original = JSON.stringify(turkish);
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
  assert.equal(JSON.stringify(vehicle.sources), JSON.stringify(old.sources));
}
assert.equal(english.FACETS.find(f => f.key === 'domain').options[0].label, '🪖 Land');

function preferences(storage, dark, search = '') {
  const root = { dataset: {} };
  let onSystemChange;
  const events = [];
  const media = { matches: dark, addEventListener(_, cb) { onSystemChange = cb; } };
  const window = {
    matchMedia: () => media,
    dispatchEvent(event) { events.push(event.type); }
  };
  load('js/museum-preferences.js', {
    window, document: { documentElement: root, addEventListener() {} },
    location: { search }, localStorage: { getItem: storage },
    URLSearchParams, Event
  });
  return { root, state: window.MuseumPreferences, events,
    changeSystem(dark) { media.matches = dark; onSystemChange(); } };
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
console.log('PASS preferences: catalogue coverage and integrity, saved preferences, system changes, denied storage fallback');
