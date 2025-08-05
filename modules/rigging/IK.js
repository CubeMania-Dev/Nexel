function applyIK(bone) {
  if (!bone || !bone.parent || !bone.parent.parent) return;
  
  const root = bone.parent.parent;
  
  if (!root.isSkinnedMesh || !root.skeleton || !root.skeleton.bones) return;
  
  let existingTarget = root.getObjectByName('__IK_Target__');
  if (existingTarget) {
    root.remove(existingTarget);
  }
  
  const target = new THREE.Mesh(
    new THREE.SphereGeometry(0.05),
    new THREE.MeshBasicMaterial({ color: 0xff0000, depthTest: false })
  );
  target.name = '__IK_Target__';
  target.renderOrder = 999;
  root.add(target);
  
  const worldPos = new THREE.Vector3();
  bone.getWorldPosition(worldPos);
  target.position.copy(worldPos);
  
  const bones = root.skeleton.bones;
  const effectorIndex = bones.indexOf(bone);
  const linkIndex = bones.indexOf(bone.parent);
  
  if (effectorIndex === -1 || linkIndex === -1) return;
  
  const iks = [{
    target: target,
    effector: effectorIndex,
    links: [{ bone: linkIndex }]
  }];
  
  const solver = new THREE.CCDIKSolver(root, iks);
  
  solver.update();
  
  bone.userData.ikSolver = solver;
  bone.userData.ikTarget = target;
}