const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const THREE = require(process.env.THREE_CJS || path.join(os.tmpdir(), 'monitor-three.cjs'));
const window = {};
vm.runInNewContext(fs.readFileSync('js/museum-framing.js', 'utf8'), { window });

const geometry = new THREE.BoxGeometry(12, 2, 5);
const model = new THREE.Mesh(geometry);
model.position.set(18, 3, -6);
model.rotation.y = Math.PI / 4;
model.updateMatrixWorld();
const instance = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial(), 1);
instance.setMatrixAt(0, new THREE.Matrix4().makeTranslation(18, 6, -6));
instance.updateMatrixWorld();

for (const [aspect, safeWidth, safeHeight] of [[1440 / 900, 0.48, 0.78], [390 / 844, 0.94, 0.56]]) {
  const camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 200);
  const position = new THREE.Vector3(11, 7, 11);
  const target = new THREE.Vector3(0, 1, 0);
  const direction = position.clone().sub(target).normalize();
  window.MuseumFraming.fitOverview(THREE, camera, [model, instance], position, target, safeWidth, safeHeight, 3);
  assert.ok(position.clone().sub(target).normalize().distanceTo(direction) < 1e-8);
  assert.ok(target.x > 12);
  camera.position.copy(position);
  camera.lookAt(target);
  camera.updateMatrixWorld();
  for (const mesh of [model, instance]) {
    const box = mesh.isInstancedMesh ? mesh.boundingBox : geometry.boundingBox;
    for (const x of [box.min.x, box.max.x]) {
      for (const y of [box.min.y, box.max.y]) {
        for (const z of [box.min.z, box.max.z]) {
          const screen = new THREE.Vector3(x, y, z).applyMatrix4(mesh.matrixWorld).project(camera);
          assert.ok(Math.abs(screen.x) <= safeWidth + 1e-8);
          assert.ok(Math.abs(screen.y) <= safeHeight + 1e-8);
          assert.ok(screen.z >= -1 && screen.z <= 1);
        }
      }
    }
  }
}
