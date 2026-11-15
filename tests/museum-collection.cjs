const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

let value = null;
const storage = {
  getItem: () => value,
  setItem: (_, input) => { value = input; }
};
const document = { body: { dataset: {} }, addEventListener() {}, querySelectorAll: () => [] };
const window = { localStorage: storage, addEventListener() {} };
const env = { window, document, URLSearchParams };
for (const file of ['catalog.js', 'museum-collection.js']) {
  vm.runInNewContext(fs.readFileSync('js/' + file, 'utf8'), env);
}
const collection = window.MuseumCollection;
const plain = object => JSON.parse(JSON.stringify(object));

value = '{malformed data';
const store = collection.createStore(storage);
assert.ok(store.persisted);
assert.deepEqual(plain(store.data), { favorites: [], recent: [] });
value = JSON.stringify({
  favorites: ['nusret', 'removed-model', 'nusret', 'enigma'],
  recent: [
    { id: 'removed-model' },
    { id: 'nusret', page: 'lab', view: 'unrecognized', tour: -1 },
    { id: 'enigma', page: 'lab' },
    { id: 'enigma', view: 'technical', tour: 2 }
  ]
});
store.refresh();
assert.deepEqual(plain(store.data), {
  favorites: ['nusret', 'enigma'],
  recent: [{ id: 'nusret', page: 'model', view: 'technical', tour: 1 }, { id: 'enigma', page: 'lab' }]
});
assert.equal(store.toggle('removed-model'), false);
assert.equal(store.visit({ id: 'removed-model' }), false);

const otherTab = collection.createStore(storage);
otherTab.toggle('dragonmace');
store.visit({ id: 'nusret', tour: 3, view: 'technical' });
assert.deepEqual(plain(store.data.favorites), ['dragonmace', 'nusret', 'enigma']);
assert.equal(collection.link(store.data.recent[0]), 'simulator.html?vehicle=nusret&view=technical&tour=3');
assert.equal(collection.link(store.data.recent[1]), 'enigma.html');
assert.equal(collection.link({ id: 'dragonmace' }), 'simulator.html?vehicle=dragonmace');
assert.equal(collection.link({ id: 'removed-model', url: 'https://elsewhere.example' }), null);
assert.equal(store.removeFavorite('enigma'), true);
assert.equal(store.removeFavorite('enigma'), false);
for (const id of [...collection.byId.keys()].slice(0, 15)) store.visit({ id });
assert.equal(store.data.recent.length, 12);
store.clearHistory();
assert.deepEqual(plain(store.data), { favorites: ['dragonmace', 'nusret'], recent: [] });
store.reset();
assert.deepEqual(JSON.parse(value), { favorites: [], recent: [] });

const blocked = collection.createStore({
  getItem: () => null,
  setItem: () => { throw new Error('Storage disabled'); }
});
assert.equal(blocked.toggle('enigma'), true);
assert.equal(blocked.persisted, false);
assert.equal(blocked.visit({ id: 'enigma', page: 'lab' }), true);
assert.deepEqual(plain(blocked.data), { favorites: ['enigma'], recent: [{ id: 'enigma', page: 'lab' }] });
