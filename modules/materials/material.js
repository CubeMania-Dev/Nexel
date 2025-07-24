class Materials {
  constructor(container) {
    this.cont = document.querySelector(container)
    this.renderer = new THREE.WebGLRenderer({ alpha: true })
    this.renderer.setPixelRatio(1)
    this.items = []
    this.cache = new WeakMap()
    this.textures = []
  }
  
  list() {
    const used = new Set()
    const updated = []
    
    scene.traverse((child) => {
      if (!child.userData.ignored && child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        
        for (let mat of materials) {
          if (!mat) continue
          used.add(mat)
          
          let existing = this.items.find(i => i.material === mat)
          if (existing) {
            updated.push(existing)
            continue
          }
          
          const container = ui.build({
            type: 'div',
            class: 'mat',
            onclick: () => {
              const sel = selection.selected[0]
              if (sel) {
                if (Array.isArray(sel.material)) {
                  for (let i = 0; i < sel.material.length; i++) {
                    sel.material[i] = mat
                  }
                } else {
                  sel.material = mat
                }
                this.list()
              }
            }
          }, this.cont)
          
          const sceneMini = new THREE.Scene()
          const camera = new THREE.PerspectiveCamera(70, 1)
          camera.position.z = 2
          
          const light = new THREE.DirectionalLight('#fff', 0.5)
          light.position.set(1, 1, 1)
          const ambient = new THREE.AmbientLight('#fff', 0.1)
          
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(1, 16, 8),
            mat
          )
          sphere.material.map = mat.map
          
          sceneMini.add(sphere, light, ambient)
          
          const canvas = document.createElement('canvas')
          canvas.width = 40
          canvas.height = 40
          canvas.style.width = '40px'
          canvas.style.height = '40px'
          container.appendChild(canvas)
          
          const item = { material: mat, scene: sceneMini, camera, canvas, container, width: 40, height: 40 }
          updated.push(item)
          this.update(mat)
        }
      }
    })
    
    for (let item of this.items) {
      if (!used.has(item.material)) {
        if (item.container?.parentElement) item.container.remove()
      }
    }
    
    this.items = updated
    this.renderAll()
  }
  
listTextures(container, obj, mapTarget) {
    if (typeof container === 'string') {
      container = document.querySelector(container)
      if (!container) return
    }
    
    container.innerHTML = ''
    
    const used = new Set()
    
    scene.traverse(child => {
      if (!child.isMesh || !child.material) return
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      for (let mat of materials) {
        for (let key in mat) {
          if (mat[key] instanceof THREE.Texture) {
            used.add(mat[key])
          }
        }
      }
    })
    
    for (let tex of used) {
      if (!this.textures.includes(tex)) this.textures.push(tex)
    }
    
    ui.build({
      type: 'div',
      class: 'tex',
      icon: 'plus',
      onclick: () => this.addTexture(container, obj, mapTarget)
    }, container)
    
    ui.build({
      type: 'div',
      class: 'tex',
      icon: 'close',
      onclick: () => this.setTexture(null, obj, mapTarget)
    }, container)
    
    for (let tex of this.textures) {
      const url = tex.image?.src || tex.image?.currentSrc
      if (!url) continue
      ui.build({
        type: 'div',
        class: 'tex',
        style: {
          backgroundImage: `url(${url})`
        },
        onclick: () => this.setTexture(tex, obj, mapTarget)
      }, container)
    }
  }
  
addTexture(container, obj, mapTarget) {
    if (!obj || !mapTarget || !obj.material) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const url = URL.createObjectURL(file)
      const texture = new THREE.TextureLoader().load(url, () => {
        texture.needsUpdate = true
        obj.material[mapTarget] = texture
        obj.material.needsUpdate = true
        if (!this.textures.includes(texture)) this.textures.push(texture)
        this.listTextures(container, obj, mapTarget)
        this.list()
      })
    }
    input.click()
  }
  
setTexture(tex, obj, mapTarget) {
    if (!obj || !obj.material) return
    obj.material[mapTarget] = tex
    obj.material.needsUpdate = true
    this.list()
  }
  
  renderAll() {
    for (let i of this.items) this.update(i.material)
  }
  
  preview(mat, container) {
    if (!mat || !container) return
    
    if (typeof container === 'string') {
      container = document.querySelector(container)
      if (!container) return
    }
    
    const w = 100
    const h = 100
    
    const sceneMini = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, w / h)
    camera.position.z = 2
    
    const light = new THREE.DirectionalLight('#fff', 0.5)
    light.position.set(1, 1, 1)
    const ambient = new THREE.AmbientLight('#fff', 0.1)
    
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 16, 8),
      mat
    )
    sphere.material.map = mat.map
    
    sceneMini.add(sphere, light, ambient)
    
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    container.innerHTML = ''
    container.appendChild(canvas)
    
    this.renderer.setSize(w, h, false)
    this.renderer.setRenderTarget(null)
    this.renderer.render(sceneMini, camera)
    
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(this.renderer.domElement, 0, 0, w, h)
    
    const existing = this.items.find(i => i.material === mat)
    if (existing) {
      const prev = this.cache.get(mat)
      const now = mat.uuid + JSON.stringify(mat.toJSON())
      if (prev !== now) {
        this.cache.set(mat, now)
        this.update(mat)
      }
    }
  }
  
  update(material) {
    const item = this.items.find(i => i.material === material)
    if (!item) return
    
    const prev = this.cache.get(material)
    const now = material.uuid + JSON.stringify(material.toJSON())
    
    if (prev === now) return
    this.cache.set(material, now)
    
    this.renderer.setSize(item.width, item.height, false)
    this.renderer.setRenderTarget(null)
    this.renderer.render(item.scene, item.camera)
    
    item.canvas.getContext('2d').drawImage(
      this.renderer.domElement,
      0,
      0,
      item.width,
      item.height
    )
  }
}