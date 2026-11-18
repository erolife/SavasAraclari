const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const window = {};
for (const name of ['catalog', 'museum-view-copy', 'museum-trails-data']) {
  vm.runInNewContext(fs.readFileSync(`js/${name}.js`, 'utf8'), { window });
}
const trails = window.MuseumTrails;
assert.equal(new Set(trails.map(trail => trail.id)).size, trails.length);
for (const trail of trails) {
  assert.equal(new Set(trail.models).size, trail.models.length, trail.id);
  assert.equal(trail.connections.length, trail.models.length, trail.id);
  for (const pair of [trail.title, trail.intro, ...trail.connections]) {
    assert.equal(pair.length, 2);
    assert.ok(pair.every(text => text.trim().length > 10));
    assert.notEqual(pair[0], pair[1]);
  }
  for (const id of trail.models) {
    const vehicle = window.MUSEUM_CATALOG.VEHICLES.find(item => (item.sim || item.id) === id);
    assert.ok(vehicle && vehicle.status === 'live', `${trail.id}: ${id}`);
    assert.ok(vehicle.sources.length && window.MuseumViewCopy[id], id);
    assert.ok(fs.existsSync(`js/vehicles/${id}.js`), id);
  }
}
assert.deepEqual(Array.from(trails.find(trail => trail.id === 'cinema').models), ['c96', 'garand', 'win1887', 'ppk', 'model29']);
for (const id of ['leonardo', 'submarines', 'aviation']) {
  assert.equal(trails.find(trail => trail.id === id).models.length, 4);
}
new Function(fs.readFileSync('js/museum-trails.js', 'utf8'));
console.log('PASS trails: cinema sequence, bilingual connections, unique active models, sources, museum copy and existing four-stop trails');
