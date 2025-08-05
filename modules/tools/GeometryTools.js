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
  if (selection.type !== 'face' || !selection.selectedMesh || !selection.selectedFace?.length) return
  const mesh = selection.selectedMesh
  const g = mesh.geometry
  if (!g || !g.isBufferGeometry) return
  
  const posArray = Array.from(g.attributes.position.array)
  const idxArray = g.index ? Array.from(g.index.array) : [...Array(posArray.length / 3).keys()]
  const uvArray = g.attributes.uv ? Array.from(g.attributes.uv.array) : []
  const faceSet = new Set(selection.selectedFace.flatMap(f => f.pairIndex != null ? [f.faceIndex, f.pairIndex] : [f.faceIndex]))
  
  const newIdx = idxArray.filter((_, i) => !faceSet.has(Math.floor(i / 3)))
  
  const normal = [...faceSet].reduce((n, f) => {
    const a = idxArray[f * 3]
    const b = idxArray[f * 3 + 1]
    const c = idxArray[f * 3 + 2]
    const vA = new THREE.Vector3(...posArray.slice(a * 3, a * 3 + 3))
    const vB = new THREE.Vector3(...posArray.slice(b * 3, b * 3 + 3))
    const vC = new THREE.Vector3(...posArray.slice(c * 3, c * 3 + 3))
    return n.add(new THREE.Vector3().subVectors(vB, vA).cross(new THREE.Vector3().subVectors(vC, vA)).normalize())
  }, new THREE.Vector3()).normalize()
  
  const map = new Map()
  const uvMap = new Map()
  const vertexStart = posArray.length / 3
  
  for (const f of faceSet) {
    for (let k = 0; k < 3; k++) {
      const vi = idxArray[f * 3 + k]
      if (!map.has(vi)) {
        const v = new THREE.Vector3(...posArray.slice(vi * 3, vi * 3 + 3)).addScaledVector(normal, distance)
        const newIndex = posArray.length / 3
        map.set(vi, newIndex)
        posArray.push(v.x, v.y, v.z)
        if (uvArray.length) {
          const u = uvArray[vi * 2]
          const v = uvArray[vi * 2 + 1]
          uvMap.set(newIndex, [u, v])
          uvArray.push(u, v)
        }
      }
    }
  }
  
  const edgeKey = (a, b) => a < b ? `${a}_${b}` : `${b}_${a}`
  const seen = new Set()
  
  for (const f of faceSet) {
    const [a, b, c] = [0, 1, 2].map(k => idxArray[f * 3 + k])
    const [a2, b2, c2] = [a, b, c].map(v => map.get(v))
    newIdx.push(a2, b2, c2)
    if (uvArray.length) {
      const [ua, va] = uvArray.slice(a * 2, a * 2 + 2)
      const [ub, vb] = uvArray.slice(b * 2, b * 2 + 2)
      const [uc, vc] = uvArray.slice(c * 2, c * 2 + 2)
      uvArray.push(ua, va, ub, vb, uc, vc)
    }
    
    for (let e = 0; e < 3; e++) {
      const i1 = [a, b, c][e]
      const i2 = [a, b, c][(e + 1) % 3]
      const key = edgeKey(i1, i2)
      if (!seen.has(key)) {
        seen.add(key)
        const adjacent = [...faceSet].filter(f2 => {
          const tri = [idxArray[f2 * 3], idxArray[f2 * 3 + 1], idxArray[f2 * 3 + 2]]
          return tri.includes(i1) && tri.includes(i2)
        })
        if (adjacent.length === 1) {
          const j1 = map.get(i1)
          const j2 = map.get(i2)
          newIdx.push(i1, i2, j2, j2, j1, i1)
          if (uvArray.length) {
            const [u1, v1] = uvArray.slice(i1 * 2, i1 * 2 + 2)
            const [u2, v2] = uvArray.slice(i2 * 2, i2 * 2 + 2)
            uvArray.push(u1, v1, u2, v2, u2, v2, u2, v2, u1, v1, u1, v1)
          }
        }
      }
    }
  }
  
  const ng = new THREE.BufferGeometry()
  ng.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posArray), 3))
  ng.setIndex(new THREE.BufferAttribute(new Uint32Array(newIdx), 1))
  if (uvArray.length) {
    ng.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvArray), 2))
  }
  ng.computeVertexNormals()
  ng.computeBoundingBox()
  ng.computeBoundingSphere()
  
  mesh.geometry.dispose()
  mesh.geometry = ng
  
  selection.selectedFace = newIdx.length / 3 - faceSet.size
  selection._deselect()
  selection._selectFace()
}
function rebuild() {
  if (selection.type !== 'face' || !selection.selectedMesh || !Array.isArray(selection.selectedFace) || selection.selectedFace.length === 0) return
  
  const mesh = selection.selectedMesh
  const g = mesh.geometry
  if (!g || !g.isBufferGeometry || !g.index) return
  
  const indexAttr = g.index
  const idx = Array.from(indexAttr.array)
  const newIdx = idx.slice()
  
  const facePairs = []
  const visited = new Set()
  for (const f of selection.selectedFace) {
    if (f.pairIndex != null && !visited.has(f.faceIndex) && !visited.has(f.pairIndex)) {
      facePairs.push([f.faceIndex, f.pairIndex])
      visited.add(f.faceIndex)
      visited.add(f.pairIndex)
    }
  }
  
  for (const [f0, f1] of facePairs) {
    const i0 = f0 * 3
    const i1 = f1 * 3
    
    const t1 = [idx[i0], idx[i0 + 1], idx[i0 + 2]]
    const t2 = [idx[i1], idx[i1 + 1], idx[i1 + 2]]
    
    const common = t1.filter(v => t2.includes(v))
    if (common.length !== 2) continue
    
    const opp0 = t1.find(v => !common.includes(v))
    const opp1 = t2.find(v => !common.includes(v))
    
    newIdx[i0] = opp0
    newIdx[i0 + 1] = common[1]
    newIdx[i0 + 2] = opp1
    
    newIdx[i1] = opp1
    newIdx[i1 + 1] = common[0]
    newIdx[i1 + 2] = opp0
  }
  
  indexAttr.array.set(new Uint32Array(newIdx))
  indexAttr.needsUpdate = true
  
  g.computeVertexNormals()
  g.computeBoundingBox()
  g.computeBoundingSphere()
  
  selection._deselect()
  selection._selectFace()
}
function collapseFace() {
  if (selection.type !== 'face' || !selection.selectedMesh || !Array.isArray(selection.selectedFace) || selection.selectedFace.length === 0) return
  
  const mesh = selection.selectedMesh
  const g = mesh.geometry
  if (!g || !g.isBufferGeometry || !g.index) return
  
  const posAttr = g.attributes.position
  const indexAttr = g.index
  const posArray = Array.from(posAttr.array)
  const idxArray = Array.from(indexAttr.array)
  
  const faceSet = new Set(selection.selectedFace.flatMap(f => f.pairIndex != null ? [f.faceIndex, f.pairIndex] : [f.faceIndex]))
  const vertsToCollapse = new Set()
  faceSet.forEach(fi => {
    vertsToCollapse.add(idxArray[fi * 3])
    vertsToCollapse.add(idxArray[fi * 3 + 1])
    vertsToCollapse.add(idxArray[fi * 3 + 2])
  })
  
  if (vertsToCollapse.size === 0) return
  
  const verts = Array.from(vertsToCollapse)
  const center = verts.reduce((v, i) => {
    v.x += posArray[i * 3]
    v.y += posArray[i * 3 + 1]
    v.z += posArray[i * 3 + 2]
    return v
  }, new THREE.Vector3()).divideScalar(verts.length)
  
  const newIndex = posArray.length / 3
  posArray.push(center.x, center.y, center.z)
  
  const mapped = idxArray.map(i => vertsToCollapse.has(i) ? newIndex : i)
  const finalIdx = []
  for (let f = 0; f < mapped.length / 3; f++) {
    const a = mapped[f * 3]
    const b = mapped[f * 3 + 1]
    const c = mapped[f * 3 + 2]
    if (a !== b && b !== c && c !== a) {
      finalIdx.push(a, b, c)
    }
  }
  
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posArray), 3))
  g.setIndex(new THREE.BufferAttribute(new Uint32Array(finalIdx), 1))
  g.computeVertexNormals()
  g.computeBoundingBox()
  g.computeBoundingSphere()
  
  selection._deselect()
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
  if (selection.type !== 'segment' || !selection.selectedMesh || !selection.selectedSegment?.length) return
  const mesh = selection.selectedMesh
  const geometry = mesh.geometry
  if (!geometry || !geometry.isBufferGeometry) return

  const originalPos = Array.from(geometry.attributes.position.array)
  const originalIdx = geometry.index ? Array.from(geometry.index.array) : [...Array(originalPos.length / 3).keys()]
  const hasUV = !!geometry.attributes.uv
  const originalUV = hasUV ? Array.from(geometry.attributes.uv.array) : []
  const edgeKey = (i, j) => i < j ? `${i}_${j}` : `${j}_${i}`

  const faceCount = originalIdx.length / 3
  const edgeFaces = {}
  for (let f = 0; f < faceCount; f++) {
    const ia = originalIdx[f * 3]
    const ib = originalIdx[f * 3 + 1]
    const ic = originalIdx[f * 3 + 2]
    for (let [x, y] of [[ia, ib], [ib, ic], [ic, ia]]) {
      const key = edgeKey(x, y)
      if (!edgeFaces[key]) edgeFaces[key] = []
      edgeFaces[key].push(f)
    }
  }

  const extrudeMap = new Map()
  const pos = [...originalPos]
  const uv = [...originalUV]

  for (let { i1, i2 } of selection.selectedSegment) {
    for (let origIndex of [i1, i2]) {
      if (!extrudeMap.has(origIndex)) {
        const key = edgeKey(i1, i2)
        const adjacent = edgeFaces[key] || []
        const normal = adjacent.reduce((acc, fIdx) => {
          const aI = originalIdx[fIdx * 3]
          const bI = originalIdx[fIdx * 3 + 1]
          const cI = originalIdx[fIdx * 3 + 2]
          const vA = new THREE.Vector3(pos[aI * 3], pos[aI * 3 + 1], pos[aI * 3 + 2])
          const vB = new THREE.Vector3(pos[bI * 3], pos[bI * 3 + 1], pos[bI * 3 + 2])
          const vC = new THREE.Vector3(pos[cI * 3], pos[cI * 3 + 1], pos[cI * 3 + 2])
          return acc.add(vB.clone().sub(vA).cross(vC.clone().sub(vA)).normalize())
        }, new THREE.Vector3()).normalize()
        const baseX = pos[origIndex * 3]
        const baseY = pos[origIndex * 3 + 1]
        const baseZ = pos[origIndex * 3 + 2]
        const newPos = new THREE.Vector3(baseX, baseY, baseZ).addScaledVector(normal, distance)
        const newIndex = pos.length / 3
        pos.push(newPos.x, newPos.y, newPos.z)
        extrudeMap.set(origIndex, newIndex)
        if (hasUV) {
          const u = originalUV[origIndex * 2]
          const v = originalUV[origIndex * 2 + 1]
          uv.push(u, v)
        }
      }
    }
  }

  const newIdx = [...originalIdx]
  const newSegments = []

  for (let { i1, i2 } of selection.selectedSegment) {
    const j1 = extrudeMap.get(i1)
    const j2 = extrudeMap.get(i2)
    newIdx.push(i1, i2, j2, j2, j1, i1)
    newSegments.push({ i1: j1, i2: j2 })
    if (hasUV) {
      const u1 = uv[i1 * 2]
      const v1 = uv[i1 * 2 + 1]
      const u2 = uv[i2 * 2]
      const v2 = uv[i2 * 2 + 1]
      uv.push(u1, v1, u2, v2, u2, v2, u2, v2, u1, v1, u1, v1)
    }
  }

  const newGeometry = new THREE.BufferGeometry()
  newGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3))
  newGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(newIdx), 1))
  if (hasUV) newGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2))
  newGeometry.computeVertexNormals()
  newGeometry.computeBoundingBox()
  newGeometry.computeBoundingSphere()

  mesh.geometry.dispose()
  mesh.geometry = newGeometry
  selection.selectedSegment = newSegments
}
function collapseSegment() {
  if (selection.type !== 'segment' || !selection.selectedMesh || !Array.isArray(selection.selectedSegment) || selection.selectedSegment.length === 0) return

  const mesh = selection.selectedMesh
  const g = mesh.geometry
  if (!g || !g.isBufferGeometry) return

  const posAttr = g.attributes.position
  const idxAttr = g.index
  const posArray = Array.from(posAttr.array)
  const idxArray = idxAttr ? Array.from(idxAttr.array) : null

  const mapping = {}
  selection.selectedSegment.forEach(({ i1, i2 }) => {
    const x1 = posArray[i1 * 3],   y1 = posArray[i1 * 3 + 1],   z1 = posArray[i1 * 3 + 2]
    const x2 = posArray[i2 * 3],   y2 = posArray[i2 * 3 + 1],   z2 = posArray[i2 * 3 + 2]
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, mz = (z1 + z2) / 2
    const newIndex = posArray.length / 3
    posArray.push(mx, my, mz)
    mapping[i1] = newIndex
    mapping[i2] = newIndex
  })

  const finalIdx = []
  if (idxArray) {
    for (let f = 0; f < idxArray.length / 3; f++) {
      const a = mapping[idxArray[f * 3]]   || idxArray[f * 3]
      const b = mapping[idxArray[f * 3+1]] || idxArray[f * 3+1]
      const c = mapping[idxArray[f * 3+2]] || idxArray[f * 3+2]
      if (a !== b && b !== c && c !== a) finalIdx.push(a, b, c)
    }
  } else {
    const stride = 9
    const newPos = []
    for (let f = 0; f < posArray.length / stride; f++) {
      const start = f * stride
      const i0 = f*3, i1 = f*3+1, i2 = f*3+2
      const a = mapping[i0] || i0
      const b = mapping[i1] || i1
      const c = mapping[i2] || i2
      if (a !== b && b !== c && c !== a) {
        for (let i = 0; i < stride; i++) newPos.push(posArray[start + i])
      }
    }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(newPos), 3))
  }

  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posArray), 3))
  if (finalIdx.length) {
    g.setIndex(new THREE.BufferAttribute(new Uint32Array(finalIdx), 1))
  } else {
    g.index && g.setIndex(null)
  }
  g.computeVertexNormals()
  g.computeBoundingBox()
  g.computeBoundingSphere()
  selection._deselect()
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
function mergeVertices(geometry) {
  if (!geometry || !geometry.isBufferGeometry) return
  
  const posAttr = geometry.attributes.position
  const uvAttr = geometry.attributes.uv
  const idxAttr = geometry.index
  
  const pos = Array.from(posAttr.array)
  const uvs = uvAttr ? Array.from(uvAttr.array) : null
  const index = idxAttr ? Array.from(idxAttr.array) : [...Array(pos.length / 3).keys()]
  
  const key = (x, y, z) => `${x},${y},${z}`
  const map = new Map()
  const newPos = []
  const newUvs = []
  const remap = {}
  
  for (let i = 0; i < pos.length / 3; i++) {
    const x = pos[i * 3]
    const y = pos[i * 3 + 1]
    const z = pos[i * 3 + 2]
    const k = key(x, y, z)
    
    if (map.has(k)) {
      remap[i] = map.get(k)
    } else {
      const ni = newPos.length / 3
      map.set(k, ni)
      remap[i] = ni
      newPos.push(x, y, z)
      if (uvs) {
        newUvs.push(uvs[i * 2], uvs[i * 2 + 1])
      }
    }
  }
  
  const newIndex = index.map(i => remap[i])
  const ng = new THREE.BufferGeometry()
  ng.setAttribute('position', new THREE.BufferAttribute(new Float32Array(newPos), 3))
  if (uvs) {
    ng.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(newUvs), 2))
  }
  ng.setIndex(new THREE.BufferAttribute(new Uint32Array(newIndex), 1))
  ng.computeVertexNormals()
  ng.computeBoundingBox()
  ng.computeBoundingSphere()
  
  geometry.dispose()
  geometry.copy(ng)
}