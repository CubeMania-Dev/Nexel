function bindBones(object) {  
  if (!object.geometry || !object.material) return null;  
    
  const bones = [];  
  object.traverse(child => {  
    if (child.isBone) bones.push(child);  
  });  
    
  if (bones.length === 0) return null;  
    
  const skinnedMesh = new THREE.SkinnedMesh(object.geometry.clone(), object.material);  
  skinnedMesh.position.copy(object.position);  
  skinnedMesh.rotation.copy(object.rotation);  
  skinnedMesh.scale.copy(object.scale);  
  skinnedMesh.matrix.copy(object.matrix);  
  skinnedMesh.matrixWorld.copy(object.matrixWorld);  
  skinnedMesh.name = object.name;  
  skinnedMesh.userData = { ...object.userData };  
  skinnedMesh.uuid = object.uuid;  
    
  const skeleton = new THREE.Skeleton(bones);  
  skinnedMesh.add(bones[0]);  
  skinnedMesh.bind(skeleton);  
    
  while (object.children.length > 0) {  
    skinnedMesh.add(object.children[0]);  
  }  
    
  if (object.parent) {  
    object.parent.add(skinnedMesh);  
    object.parent.remove(object);  
  }  
    
  const geometry = skinnedMesh.geometry;  
  const positionAttr = geometry.attributes.position;  
  const vertexCount = positionAttr.count;  
    
  if (!geometry.attributes.skinIndex || !geometry.attributes.skinWeight) {  
    const skinIndices = new Float32Array(vertexCount * 4);  
    const skinWeights = new Float32Array(vertexCount * 4);  
    
    const ajustes = {  
      suavizadoSecundario: 0.2,  
      rigidezIntermedia: 5,  
      caidaPeso: 3,  
      epsilon: 0.01  
    };  
    
    const pairs = [];  
    const map = new Map();  
    bones.forEach((b, i) => map.set(b, i));  
    
    for (let i = 0; i < bones.length; i++) {  
      const b = bones[i];  
      const start = new THREE.Vector3().setFromMatrixPosition(b.matrixWorld);  
      let end = null;  
      const child = b.children.find(c => c.isBone);  
      if (child) end = new THREE.Vector3().setFromMatrixPosition(child.matrixWorld);  
      else if (b.parent && map.has(b.parent)) {  
        const p = b.parent;  
        const pp = new THREE.Vector3().setFromMatrixPosition(p.matrixWorld);  
        end = start.clone().add(start.clone().sub(pp));  
      } else {  
        const dir = new THREE.Vector3(0, 1, 0).applyQuaternion(b.getWorldQuaternion(new THREE.Quaternion())).normalize().multiplyScalar(0.1);  
        end = start.clone().add(dir);  
      }  
      pairs.push({ index: i, start, end });  
    }  
    
    const pos = geometry.attributes.position;  
    const v = new THREE.Vector3();  
    
    for (let i = 0; i < vertexCount; i++) {  
      v.fromBufferAttribute(pos, i);  
      skinnedMesh.localToWorld(v);  
    
      const w = [];  
    
      for (let j = 0; j < pairs.length; j++) {  
        const { start, end, index } = pairs[j];  
        const seg = end.clone().sub(start);  
        const length = seg.length();  
        const dir = seg.clone().normalize();  
        const toVert = v.clone().sub(start);  
        const proj = Math.max(0, Math.min(toVert.dot(dir), length));  
        const pt = start.clone().add(dir.multiplyScalar(proj));  
        const d = v.distanceTo(pt);  
        const weight = 1 / (Math.pow(d, ajustes.caidaPeso) + ajustes.epsilon);  
        w.push({ index, weight });  
      }  
    
      w.sort((a, b) => b.weight - a.weight);  
      const m = w[0], s = w[1];  
    
      if (bones.length === 1 || m.weight > s.weight * ajustes.rigidezIntermedia) {  
        skinIndices[i * 4] = m.index;  
        skinWeights[i * 4] = 1;  
      } else {  
        let w1 = m.weight;  
        let w2 = s.weight * ajustes.suavizadoSecundario;  
        const tot = w1 + w2;  
        skinIndices[i * 4] = m.index;  
        skinWeights[i * 4] = w1 / tot;  
        skinIndices[i * 4 + 1] = s.index;  
        skinWeights[i * 4 + 1] = w2 / tot;  
      }  
    }  
    
    geometry.setAttribute('skinIndex', new THREE.BufferAttribute(skinIndices, 4));  
    geometry.setAttribute('skinWeight', new THREE.BufferAttribute(skinWeights, 4));  
  }  
    
  return skinnedMesh;  
}
function unbindBones(object) {
  if (!(object instanceof THREE.SkinnedMesh)) return null;
  
  const mesh = new THREE.Mesh(object.geometry, object.material);
  
  mesh.name = object.name;
  mesh.uuid = object.uuid;
  mesh.userData = JSON.parse(JSON.stringify(object.userData));
  mesh.castShadow = object.castShadow;
  mesh.receiveShadow = object.receiveShadow;
  mesh.visible = object.visible;
  mesh.frustumCulled = object.frustumCulled;
  mesh.renderOrder = object.renderOrder;
  mesh.matrixAutoUpdate = object.matrixAutoUpdate;
  
  mesh.position.copy(object.position);
  mesh.rotation.copy(object.rotation);
  mesh.quaternion.copy(object.quaternion);
  mesh.scale.copy(object.scale);
  mesh.matrix.copy(object.matrix);
  mesh.matrixWorld.copy(object.matrixWorld);
  
  for (let i = 0; i < object.children.length; i++) {
    mesh.add(object.children[i]);
  }
  
  if (object.parent) {
    object.parent.add(mesh);
    object.parent.remove(object);
  }
  
  return mesh;
}

function verifyWeights(bone) {
  if (!bone || !bone.isBone) return;
  
  let mesh = null;
  let current = bone.parent;
  while (current) {
    if (current.isSkinnedMesh) {
      mesh = current;
      break;
    }
    current = current.parent;
  }
  
  if (!mesh || !mesh.skeleton) return;
  
  const boneIndex = mesh.skeleton.bones.indexOf(bone);
  if (boneIndex === -1) return;
  
  const geometry = mesh.geometry;
  const position = geometry.attributes.position;
  const skinIndices = geometry.attributes.skinIndex;
  const skinWeights = geometry.attributes.skinWeight;
  
  const colors = new Float32Array(position.count * 3);
  
  for (let i = 0; i < position.count; i++) {
    let weight = 0;
    
    const indices = [
      skinIndices.getX(i),
      skinIndices.getY(i),
      skinIndices.getZ(i),
      skinIndices.getW(i)
    ];
    const weights = [
      skinWeights.getX(i),
      skinWeights.getY(i),
      skinWeights.getZ(i),
      skinWeights.getW(i)
    ];
    
    for (let j = 0; j < 4; j++) {
      if (indices[j] === boneIndex) {
        weight = weights[j];
        break;
      }
    }
    
    const h = (1 - weight) * 0.65;
    const color = new THREE.Color().setHSL(h, 1.0, 0.5);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.attributes.color.needsUpdate = true;
  
  const applyVertexColors = (material) => {
    if (material && !material.vertexColors) {
      const cloned = material.clone();
      cloned.vertexColors = true;
      return cloned;
    }
    return material;
  };
  
  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map(applyVertexColors);
  } else {
    mesh.material = applyVertexColors(mesh.material);
  }
}