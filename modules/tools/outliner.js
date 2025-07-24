class Outliner {
  constructor(container) {
    this.containerEl = document.querySelector(container)
    this.selection = null
    this.selectionEl = null
    this.collapsed = new WeakSet()
    
    this.containerEl.addEventListener('dragover', e => {
      e.preventDefault()
      this.containerEl.classList.add('drag-hover')
    })
    
    this.containerEl.addEventListener('dragleave', () => {
      this.containerEl.classList.remove('drag-hover')
    })
    
    this.containerEl.addEventListener('drop', e => {
      e.preventDefault()
      this.containerEl.classList.remove('drag-hover')
      const t = document.elementFromPoint(e.clientX, e.clientY)
      if (t.closest('.item')) return
      const uuid = e.dataTransfer.getData('text/plain')
      const dragged = scene.getObjectByProperty('uuid', uuid)
      if (!dragged || dragged === scene) return
      this._reparentPreservingTransform(dragged, scene)
      this.refresh()
    })
  }
  
  refresh() {
    this.containerEl.innerHTML = ''
    const walk = (obj, level = 0) => {
      if (obj.userData.ignored || obj.isHelper || obj.parent?.type === 'TransformControls') return
      if (obj !== scene) this.addItem(obj, level)
      if (!this.collapsed.has(obj)) obj.children.forEach(c => walk(c, level + 1))
    }
    walk(scene, 0)
  }
  
  addItem(obj, level) {
  const hasChildren = obj.children.length > 0
  const icon = obj.isCamera ? 'video' : obj.isMesh ? 'cube' : obj.isLight ? 'lightbulb' : obj.isGroup ? 'folder' : 'cube'
  
  const item = ui.build({
    type: 'div',
    class: `item${obj.visible === false ? ' hiddenItem' : ''}`,
    text: obj.name || 'Unnamed',
    icon,
    onclick: () => this._select(obj),
    attrs: { draggable: 'true' },
    style: {
      marginLeft: obj.parent === scene ? '0px' : `${(level - 1) * 15}px`
    }
  }, this.containerEl)
  
  item._obj = obj
  
  const iconEl = item.querySelector('i.fa-cube, i.fa-lightbulb, i.fa-layer-group, i.fa-video')
  
  const nonIgnoredChildren = obj.children.filter(child => !child.userData?.ignored)
  const showCollapse = nonIgnoredChildren.length > 0
  
  if (showCollapse) {
    const caret = document.createElement('i')
    caret.className = `fas fa-caret-${this.collapsed.has(obj) ? 'right' : 'down'} collapse`
    item.insertBefore(caret, item.firstChild)
    if (iconEl) iconEl.style.marginLeft = '10px'
    caret.addEventListener('click', e => {
      e.stopPropagation()
      this.collapsed.has(obj) ? this.collapsed.delete(obj) : this.collapsed.add(obj)
      this.refresh()
    })
  } else if (iconEl) {
    iconEl.style.marginLeft = '0px'
  }
  
  if (this.selection === obj) {
    item.classList.add('selected')
    this.selectionEl = item
  }
  
  item.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', obj.uuid)
  })
  
  item.addEventListener('dragover', e => {
    e.preventDefault()
    item.classList.add('drag-hover')
  })
  
  item.addEventListener('dragleave', () => {
    item.classList.remove('drag-hover')
  })
  
  item.addEventListener('drop', e => {
    e.preventDefault()
    item.classList.remove('drag-hover')
    const uuid = e.dataTransfer.getData('text/plain')
    const dragged = scene.getObjectByProperty('uuid', uuid)
    if (!dragged || dragged === obj) return
    let p = obj
    while (p) {
      if (p === dragged) return
      p = p.parent
    }
    this._reparentPreservingTransform(dragged, obj)
    this.refresh()
  })
}
  
  _reparentPreservingTransform(child, newParent) {
    child.updateWorldMatrix(true, false)
    const worldMatrix = child.matrixWorld.clone()
    if (child.parent) child.parent.remove(child)
    newParent.add(child)
    newParent.updateWorldMatrix(true, false)
    const inv = new THREE.Matrix4().copy(newParent.matrixWorld).invert()
    worldMatrix.multiplyMatrices(inv, worldMatrix)
    worldMatrix.decompose(child.position, child.quaternion, child.scale)
  }
  
  _select(obj) {
    if (this.selectionEl) this.selectionEl.classList.remove('selected')
    this.selection = obj
    this.selectionEl = [...this.containerEl.children].find(el => el._obj === obj)
    if (this.selectionEl) this.selectionEl.classList.add('selected')
    selection._select(obj)
  }
  
  _deselect() {
    if (this.selectionEl) this.selectionEl.classList.remove('selected')
    this.selection = null
    this.selectionEl = null
    selection._deselect()
  }
}