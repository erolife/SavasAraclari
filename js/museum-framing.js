(function () {
  'use strict';

  function fitOverview(THREE, camera, meshes, position, target, safeWidth, safeHeight, minDistance) {
    const boxes = [];
    const bounds = new THREE.Box3();
    const point = new THREE.Vector3();
    for (const mesh of meshes) {
      const source = mesh.isInstancedMesh ? mesh : mesh.geometry;
      if (!source.boundingBox) source.computeBoundingBox();
      const box = source.boundingBox;
      if (box.isEmpty()) continue;
      boxes.push([box, mesh.matrixWorld]);
      bounds.union(box.clone().applyMatrix4(mesh.matrixWorld));
    }
    if (bounds.isEmpty()) return;

    const rotation = new THREE.Matrix4().lookAt(position, target, camera.up);
    const right = new THREE.Vector3().setFromMatrixColumn(rotation, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(rotation, 1);
    const back = new THREE.Vector3().setFromMatrixColumn(rotation, 2);
    const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const tanX = tangent * camera.aspect * safeWidth;
    const tanY = tangent * safeHeight;
    bounds.getCenter(target);

    let distance = minDistance;
    for (const [box, matrix] of boxes) {
      for (const x of [box.min.x, box.max.x]) {
        for (const y of [box.min.y, box.max.y]) {
          for (const z of [box.min.z, box.max.z]) {
            point.set(x, y, z).applyMatrix4(matrix).sub(target);
            const depth = point.dot(back);
            distance = Math.max(distance, depth + Math.max(
              Math.abs(point.dot(right)) / tanX,
              Math.abs(point.dot(up)) / tanY,
              camera.near
            ));
          }
        }
      }
    }
    position.copy(target).addScaledVector(back, distance);
  }

  window.MuseumFraming = { fitOverview };
})();
