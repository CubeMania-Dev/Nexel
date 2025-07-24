class ActionManager {
  constructor(scene) {
    this.scene = scene
    this.clipboard = []
    
    this.stack = {
      current: [],
      
      undo: [],
      redo: []
    }
  }
  
  delete(objects) {
    if (!objects) return
    
    const arr = Array.isArray(objects) ? objects : [objects]
    arr.forEach(obj => {
      if (obj) this.scene.remove(obj)
    })
    this.onAction()
  }
  
  copy(objects) {
    if (!objects) return
    
    const arr = Array.isArray(objects) ? objects : [objects]
    this.clipboard = arr.map(obj => obj.clone(true))
    return true
    
    this.onAction()
  }
  
  paste() {
    if (this.clipboard.length === 0) return false
    const clones = this.clipboard.map(obj => {
      const clone = obj.clone(true)
      this.scene.add(clone)
      return clone
    })
    return clones.length === 1 ? clones[0] : clones
    
    this.onAction()
  }
  
  duplicate(objects) {
    if (!objects) return
    
    this.copy(objects)
    this.paste(objects)
    
    this.onAction()
  }
  
  hide(objects) {
    if (!objects) return
    
    const arr = Array.isArray(objects) ? objects : [objects]
    arr.forEach(obj => {
      if (obj) obj.visible = !obj.visible
    })
    return arr.every(obj => obj?.visible)
    
    this.onAction()
  }
  
  group(objects = []) {
    if (!Array.isArray(objects) || objects.length === 0) return null
    const group = new THREE.Group()
    objects.forEach(obj => {
      if (obj) group.add(obj)
    })
    this.scene.add(group)
    return group
    
    this.onAction()
  }
  
  jump(camera) {
    let cam = camera
    let cont = controls
    
    controls.object = cam
    selection.camera = cam
    transform.camera = cam
    
    controls.update()
    
    return cam
  }
  
  focus(camera, object, controls) {
    if (!object) return
    
    const box = new THREE.Box3().setFromObject(object)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const distance = maxDim * 3
    
    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    const targetPos = center.clone().add(dir.negate().multiplyScalar(distance))
    
    const startPos = camera.position.clone()
    const startTarget = controls ? controls.target.clone() : center.clone()
    const endTarget = center.clone()
    
    let t = 0
    
    const easeOutSlow = x => 1 - Math.pow(1 - x, 5)
    
    const animate = () => {
      t += 0.03
      const progress = easeOutSlow(Math.min(t, 1))
      
      camera.position.lerpVectors(startPos, targetPos, progress)
      if (controls) {
        controls.target.lerpVectors(startTarget, endTarget, progress)
        controls.update()
      } else {
        camera.lookAt(center)
      }
      camera.updateMatrixWorld()
      
      if (t < 1) requestAnimationFrame(animate)
    }
    
    animate()
  }
  
  saveState(type, obj, action) {
    if (!obj) return
    
    const cloneDeep = o => {
      if (!o) return o
      if (typeof o.clone === 'function') return o.clone()
      if (Array.isArray(o)) return o.map(cloneDeep)
      if (o && typeof o === 'object') {
        const copy = {}
        for (let k in o) if (o.hasOwnProperty(k)) {
          const v = o[k]
          copy[k] = (v && typeof v === 'object') ? cloneDeep(v) : v
        }
        return copy
      }
      return o
    }
  
    const state = { type, ref: obj }
    if (type === 'transform') {
      state.data = {
        position: obj.position.clone(),
        rotation: obj.rotation.clone(),
        scale:    obj.scale.clone()
      }
    } else if (type === 'geometry') {
      state.data = obj.geometry.clone()
    } else if (type === 'material') {
      state.data = obj.material.clone()
    } else if (type === 'object') {
      state.action = action           // 'add' or 'remove'
      state.parent = obj.parent
      state.data   = cloneDeep(obj)
    } else return
  
    this.stack.undo.push(state)
    this.stack.redo.length = 0
    this.onAction()
  }
  
  undo() {
    if (!this.stack.undo.length) return
    const s = this.stack.undo.pop()
    const { type, ref } = s
    let next = { type, ref }
  
    if (type === 'transform') {
      next.data = {
        position: ref.position.clone(),
        rotation: ref.rotation.clone(),
        scale:    ref.scale.clone()
      }
      ref.position.copy(s.data.position)
      ref.rotation.copy(s.data.rotation)
      ref.scale.copy(s.data.scale)
  
    } else if (type === 'geometry') {
      next.data = ref.geometry.clone()
      ref.geometry = s.data.clone()
  
    } else if (type === 'material') {
      next.data = ref.material.clone()
      ref.material = s.data.clone()
  
    } else if (type === 'object') {
      next.action = s.action
      next.parent = s.parent
      next.data   = s.data
  
      if (s.action === 'add') {
        // undo add → remove
        s.parent.remove(ref)
      } else {
        // undo remove → add
        s.parent.add(ref)
      }
    }
  
    this.stack.redo.push(next)
    this.onAction()
  }
  
  redo() {
    if (!this.stack.redo.length) return
    const s = this.stack.redo.pop()
    const { type, ref } = s
    let next = { type, ref }
  
    if (type === 'transform') {
      next.data = {
        position: ref.position.clone(),
        rotation: ref.rotation.clone(),
        scale:    ref.scale.clone()
      }
      ref.position.copy(s.data.position)
      ref.rotation.copy(s.data.rotation)
      ref.scale.copy(s.data.scale)
  
    } else if (type === 'geometry') {
      next.data = ref.geometry.clone()
      ref.geometry = s.data.clone()
  
    } else if (type === 'material') {
      next.data = ref.material.clone()
      ref.material = s.data.clone()
  
    } else if (type === 'object') {
      next.action = s.action
      next.parent = s.parent
      next.data   = s.data
  
      if (s.action === 'add') {
        // redo add → add
        s.parent.add(ref)
      } else {
        // redo remove → remove
        s.parent.remove(ref)
      }
    }
  
    this.stack.undo.push(next)
    this.onAction()
  }
  
  
  onAction() {}
}