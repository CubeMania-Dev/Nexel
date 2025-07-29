/* FACE TOOLS */
function deleteFace() {
  if (selection.type !== 'face' || !selection.selectedMesh || !Array.isArray(selection.selectedFace) || selection.selectedFace.length === 0) return
  const mesh = selection.selectedMesh
  const geometry = mesh.geometry
  if (!geometry || !geometry.isBufferGeometry) return
  const posAttr = geometry.attributes.position
  const indexAttr = geometry.index
  const toRemove = new Set(selection.selectedFace.flatMap(({ faceIndex, pairIndex }) => pairIndex != null ? [faceIndex, pairIndex] : [faceIndex]))
  if (indexAttr) {
    const indexArray = Array.from(indexAttr.array)
    const newIndex = []
    for (let f = 0; f < indexArray.length / 3; f++) {
      if (!toRemove.has(f)) {
        newIndex.push(indexArray[f * 3], indexArray[f * 3 + 1], indexArray[f * 3 + 2])
      }
    }
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(newIndex), 1))
  } else {
    const posArray = posAttr.array
    const stride = 9
    const newPos = []
    for (let f = 0; f < posArray.length / stride; f++) {
      if (!toRemove.has(f)) {
        const start = f * stride
        for (let i = 0; i < stride; i++) newPos.push(posArray[start + i])
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(newPos), 3))
    if (geometry.attributes.normal) {
      const normArray = geometry.attributes.normal.array
      const newNorm = []
      for (let f = 0; f < normArray.length / stride; f++) {
        if (!toRemove.has(f)) {
          const start = f * stride
          for (let i = 0; i < stride; i++) newNorm.push(normArray[start + i])
        }
      }
      geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(newNorm), 3))
    }
  }
  geometry.attributes.position.needsUpdate = true
  if (geometry.index) geometry.index.needsUpdate = true
  if (geometry.attributes.normal) geometry.attributes.normal.needsUpdate = true
  else geometry.computeVertexNormals()
  selection._deselect()
}
function extrudeFace(distance) {
  if (selection.type !== 'face' || !selection.selectedMesh || !selection.selectedFace?.length) return;

  const mesh = selection.selectedMesh;
  const g = mesh.geometry;
  if (!g || !g.isBufferGeometry) return;

  let pos = Array.from(g.attributes.position.array);
  let idx = g.index ? Array.from(g.index.array) : [...Array(pos.length / 3).keys()];
  const faceSet = new Set(selection.selectedFace.flatMap(f => f.pairIndex != null ? [f.faceIndex, f.pairIndex] : [f.faceIndex]));

  const newIdx = idx.filter((_, i) => !faceSet.has(Math.floor(i / 3)));
  const normal = [...faceSet].reduce((n, f) => {
    const a = idx[f * 3], b = idx[f * 3 + 1], c = idx[f * 3 + 2];
    const vA = new THREE.Vector3(...pos.slice(a * 3, a * 3 + 3));
    const vB = new THREE.Vector3(...pos.slice(b * 3, b * 3 + 3));
    const vC = new THREE.Vector3(...pos.slice(c * 3, c * 3 + 3));
    return n.add(new THREE.Vector3().subVectors(vB, vA).cross(new THREE.Vector3().subVectors(vC, vA)).normalize());
  }, new THREE.Vector3()).normalize();

  const map = new Map();
  for (const f of faceSet)
    for (let k = 0; k < 3; k++) {
      const vi = idx[f * 3 + k];
      if (!map.has(vi)) {
        const v = new THREE.Vector3(...pos.slice(vi * 3, vi * 3 + 3)).addScaledVector(normal, distance);
        map.set(vi, pos.length / 3);
        pos.push(v.x, v.y, v.z);
      }
    }

  const edgeKey = (a, b) => a < b ? `${a}_${b}` : `${b}_${a}`;
  const seen = new Set();
  for (const f of faceSet) {
    const [a, b, c] = [0, 1, 2].map(k => idx[f * 3 + k]);
    const [a2, b2, c2] = [a, b, c].map(v => map.get(v));
    newIdx.push(a2, b2, c2);
    for (let e = 0; e < 3; e++) {
      const i1 = [a, b, c][e], i2 = [a, b, c][(e + 1) % 3];
      if (!seen.has(edgeKey(i1, i2))) {
        seen.add(edgeKey(i1, i2));
        if ([...faceSet].filter(f2 => [idx[f2 * 3], idx[f2 * 3 + 1], idx[f2 * 3 + 2]].includes(i1) && [idx[f2 * 3], idx[f2 * 3 + 1], idx[f2 * 3 + 2]].includes(i2)).length === 1) {
          const j1 = map.get(i1), j2 = map.get(i2);
          newIdx.push(i1, i2, j2, j2, j1, i1);
        }
      }
    }
  }

  const vertexCount = pos.length / 3;
  if (Math.max(...newIdx) >= vertexCount) return console.error('Invalid geometry');

  const ng = new THREE.BufferGeometry();
  ng.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  ng.setIndex(new THREE.BufferAttribute(new Uint32Array(newIdx), 1));
  ng.computeVertexNormals();
  ng.computeBoundingBox();
  ng.computeBoundingSphere();

  mesh.geometry.dispose();
  mesh.geometry = ng;

  selection.selectedFace = newIdx.length / 3 - faceSet.size;
  selection._deselect();
  selection._selectFace();
}


/* SEGMENT TOOLS */
function deleteSegment() {
  if (selection.type !== 'segment' || !selection.selectedMesh || !Array.isArray(selection.selectedSegment) || selection.selectedSegment.length === 0) return
  const mesh = selection.selectedMesh
  const geometry = mesh.geometry
  if (!geometry || !geometry.isBufferGeometry) return
  const indexAttr = geometry.index
  const segmentsToRemove = new Set(selection.selectedSegment.map(({ i1, i2 }) => i1 < i2 ? `${i1}_${i2}` : `${i2}_${i1}`))
  if (indexAttr) {
    const ia = Array.from(indexAttr.array)
    const newIndex = []
    for (let f = 0; f < ia.length / 3; f++) {
      const a = ia[f*3], b = ia[f*3+1], c = ia[f*3+2]
      const edges = [a<b?`${a}_${b}`:`${b}_${a}`, b<c?`${b}_${c}`:`${c}_${b}`, c<a?`${c}_${a}`:`${a}_${c}`]
      if (!edges.some(e => segmentsToRemove.has(e))) newIndex.push(a, b, c)
    }
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(newIndex), 1))
  } else {
    const posArray = geometry.attributes.position.array
    const stride = 9
    const newPos = []
    for (let f = 0; f < posArray.length / stride; f++) {
      const start = f * stride
      const v0 = new THREE.Vector3(posArray[start], posArray[start+1], posArray[start+2])
      const v1 = new THREE.Vector3(posArray[start+3], posArray[start+4], posArray[start+5])
      const v2 = new THREE.Vector3(posArray[start+6], posArray[start+7], posArray[start+8])
      const idx0 = f*3, idx1 = f*3+1, idx2 = f*3+2
      const edges = [
        idx0<idx1?`${idx0}_${idx1}`:`${idx1}_${idx0}`,
        idx1<idx2?`${idx1}_${idx2}`:`${idx2}_${idx1}`,
        idx2<idx0?`${idx2}_${idx0}`:`${idx0}_${idx2}`
      ]
      if (!edges.some(e => segmentsToRemove.has(e))) {
        for (let i = 0; i < stride; i++) newPos.push(posArray[start + i])
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(newPos), 3))
  }
  geometry.attributes.position.needsUpdate = true
  if (geometry.index) geometry.index.needsUpdate = true
  geometry.computeVertexNormals()
  selection._deselect()
}
function extrudeSegment(distance) {
  if (selection.type !== 'segment' || !selection.selectedMesh || !selection.selectedSegment?.length) return;

  const mesh = selection.selectedMesh;
  const geometry = mesh.geometry;
  if (!geometry || !geometry.isBufferGeometry) return;

  const posAttr = geometry.attributes.position;
  const indexAttr = geometry.index;
  let pos = Array.from(posAttr.array);
  let idx = indexAttr ? Array.from(indexAttr.array) : [...Array(pos.length / 3).keys()];

  const edgeKey = (a, b) => a < b ? `${a}_${b}` : `${b}_${a}`;

  const faceCount = idx.length / 3;
  const edgeFaces = {};
  for (let f = 0; f < faceCount; f++) {
    const [a, b, c] = [idx[f * 3], idx[f * 3 + 1], idx[f * 3 + 2]];
    [[a, b], [b, c], [c, a]].forEach(([i1, i2]) => {
      const k = edgeKey(i1, i2);
      if (!edgeFaces[k]) edgeFaces[k] = [];
      edgeFaces[k].push(f);
    });
  }

  const extrudeMap = new Map();
  for (const { i1, i2 } of selection.selectedSegment) {
    [i1, i2].forEach(i => {
      if (!extrudeMap.has(i)) {
        const k = edgeKey(i1, i2);
        const faces = edgeFaces[k] || [];
        const n = new THREE.Vector3();
        faces.forEach(f => {
          const [a, b, c] = [idx[f * 3], idx[f * 3 + 1], idx[f * 3 + 2]];
          const va = new THREE.Vector3(pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2]);
          const vb = new THREE.Vector3(pos[b * 3], pos[b * 3 + 1], pos[b * 3 + 2]);
          const vc = new THREE.Vector3(pos[c * 3], pos[c * 3 + 1], pos[c * 3 + 2]);
          n.add(vb.clone().sub(va).cross(vc.clone().sub(va)).normalize());
        });
        n.normalize();
        const vnew = new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]).addScaledVector(n, distance);
        const ni = pos.length / 3;
        pos.push(vnew.x, vnew.y, vnew.z);
        extrudeMap.set(i, ni);
      }
    });
  }

  const newIdx = idx.slice();
  const newSelectedSegment = [];
  for (const { i1, i2 } of selection.selectedSegment) {
    const j1 = extrudeMap.get(i1), j2 = extrudeMap.get(i2);

    // Dos triángulos para la cara lateral
    newIdx.push(i1, i2, j2, j2, j1, i1);
    newSelectedSegment.push({ i1: j1, i2: j2 });
  }

  const ng = new THREE.BufferGeometry();
  ng.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  ng.setIndex(new THREE.BufferAttribute(new Uint32Array(newIdx), 1));
  ng.computeVertexNormals();
  ng.computeBoundingBox();
  ng.computeBoundingSphere();

  mesh.geometry.dispose();
  mesh.geometry = ng;
  selection.selectedSegment = newSelectedSegment;
}


/* VERTEX TOOLS */
function deleteVertex() {
  if (selection.type !== 'vertex' || !selection.selectedMesh || !Array.isArray(selection.selectedVertex) || selection.selectedVertex.length === 0) return
  const mesh = selection.selectedMesh
  const geometry = mesh.geometry
  if (!geometry || !geometry.isBufferGeometry) return
  const indexAttr = geometry.index
  const toRemove = new Set(selection.selectedVertex.map(v => v.vertexIndex))
  if (indexAttr) {
    const ia = Array.from(indexAttr.array)
    const newIndex = []
    for (let f = 0; f < ia.length / 3; f++) {
      const a = ia[f*3], b = ia[f*3+1], c = ia[f*3+2]
      if (!toRemove.has(a) && !toRemove.has(b) && !toRemove.has(c)) newIndex.push(a, b, c)
    }
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(newIndex), 1))
  } else {
    const posArray = geometry.attributes.position.array
    const stride = 9
    const newPos = []
    for (let f = 0; f < posArray.length / stride; f++) {
      const start = f * stride
      const idx0 = f*3, idx1 = f*3+1, idx2 = f*3+2
      if (!toRemove.has(idx0) && !toRemove.has(idx1) && !toRemove.has(idx2)) {
        for (let i = 0; i < stride; i++) newPos.push(posArray[start + i])
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(newPos), 3))
  }
  geometry.attributes.position.needsUpdate = true
  if (geometry.index) geometry.index.needsUpdate = true
  geometry.computeVertexNormals()
  selection._deselect()
}



/* UTILS */
function updateBoundingBox(object) {
  const geom = object.geometry;
  if (!geom) return;
  geom.computeBoundingBox();
  geom.computeBoundingSphere();
  Object.values(geom.attributes).forEach(attr => attr.needsUpdate = true);
  object.updateMatrixWorld(true);
}