const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const window = {};
for (const file of ['catalog.js', 'museum-view-copy.js']) {
  vm.runInNewContext(fs.readFileSync('js/' + file, 'utf8'), { window });
}

const activeModels = window.MUSEUM_CATALOG.VEHICLES
  .filter(vehicle => vehicle.status === 'live')
  .map(vehicle => vehicle.sim || vehicle.id)
  .sort();
assert.deepEqual(Object.keys(window.MuseumViewCopy).sort(), Array.from(activeModels));
for (const id of activeModels) {
  const [turkish, english] = window.MuseumViewCopy[id];
  assert.equal(turkish.length, 4, id);
  assert.equal(english.length, 4, id);
  for (const [index, text] of turkish.entries()) {
    assert.ok(text.trim().length > 10, id);
    assert.ok(english[index].trim().length > 10, id);
    assert.notEqual(text, english[index], id);
  }
}
