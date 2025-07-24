class ObjectManager {
  constructor(scene) {
    this.scene = scene
  }
  
  addMesh(name, x = 0, y = 0, z = 0, toCursor = true) {
    let geos = {
      cube: new THREE.BoxGeometry(),
      sphere: new THREE.SphereGeometry(0.5, 16, 8),
      plane: new THREE.PlaneGeometry(),
      cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 16)
    }
    
    let mats = {
      standard: new THREE.MeshPhysicalMaterial({
        roughness: 0.5,
        side: 2,
        flatShading: true,
      })
    }
    
    let meshes = {
      Cube: new THREE.Mesh(geos.cube, mats.standard),
      Sphere: new THREE.Mesh(geos.sphere, mats.standard),
      Plane: new THREE.Mesh(geos.plane, mats.standard),
      Cylinder: new THREE.Mesh(geos.cylinder, mats.standard)
    }
    
    meshes.Plane.rotation.x = -Math.PI/2
    
    let object = meshes[name]
    if (!object) return
    
    if (toCursor && this.cursor) {
      const cursorPos = this.cursor.position
      object.position.set(cursorPos.x + x, cursorPos.y + y, cursorPos.z + z)
    } else {
      object.position.set(x, y, z)
    }
    
    object.name = name
    
    this.scene.add(object)
    if (typeof this.onAdd === 'function') this.onAdd(object)
    
    return object
  }
  
  addOBJMesh(path, x = 0, y = 0, z = 0, toCursor = true) {
    let object = new THREE.Mesh(
      new THREE.OBJGeometry(path, true, true),
      new THREE.MeshPhysicalMaterial({
        flatShading: true,
        side: 2,
        transparent: true
      })
    )
    
    if (toCursor && this.cursor) {
      const cursorPos = this.cursor.position
      object.position.set(cursorPos.x + x, cursorPos.y + y, cursorPos.z + z)
    } else {
      object.position.set(x, y, z)
    }
    
    object.name = path.split('/').pop().split('.obj')[0]
    object.scale.set(1.5,1.5,1.5)
    
    this.scene.add(object)
    if (typeof this.onAdd === 'function') this.onAdd(object)
    
    return object
  }
  
  addLight(type, intensity = 0.3, x = 0, y = 0, z = 0, toCursor = true) {
    let lights = {
      directional: new THREE.DirectionalLight(0xffffff, intensity),
      point: new THREE.PointLight(0xffffff, intensity, 5),
      spot: new THREE.SpotLight(0xffffff, intensity),
      ambient: new THREE.AmbientLight(0xffffff, intensity)
    }
    
    let light = lights[type.toLowerCase()]
    if (!light) return
    
    if (light instanceof THREE.AmbientLight) {
      light.userData.ignored = true
    }
    
    if (toCursor && this.cursor) {
      const cursorPos = this.cursor.position
      light.position.set(cursorPos.x + x, cursorPos.y + y, cursorPos.z + z)
    } else {
      light.position.set(x, y, z)
    }
    
    this.scene.add(light)
    light.name = type
    if (typeof this.onAdd === 'function') this.onAdd(light)
    
    return light
  }
  
  addCamera(toCursor = true, x, y, z, w, h, f) {
    x ?? 0
    y ?? 0
    z ?? 0
    
    let cam = new THREE.PerspectiveCamera(
    	configs.camera.fov,
    	configs.viewport.w / configs.viewport.h,
    	0.001,
    	10000
    )
    
    if(toCursor) {
      cam.position.set(
        this.cursor.position.x + x,
        this.cursor.position.y + y,
        this.cursor.position.z + z
      )
    }
    else {
      cam.position.set(
        x, y, z
      )
    }
    
    cam.name = 'Camera'
    cam.lookAt(0, 0, 0)
    
    this.scene.add(cam)
    this.onAdd(cam)
    return cam
  }
  
  setCursor(x = 0, y = 0, z = 0) {
    if (this.cursor) {
      this.cursor.position.set(x, y, z)
      return
    }
    
    this.cursorGeometry = new THREE.BufferGeometry()
    this.cursorGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3))
    
    const textureLoader = new THREE.TextureLoader()
    const cursorTexture = textureLoader.load('./assets/icons/cursor.svg')
    
    this.cursorMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 18,
      sizeAttenuation: false,
      map: cursorTexture,
      alphaTest: 0.5,
      transparent: true,
      depthTest: false
    })
    
    this.cursor = new THREE.Points(this.cursorGeometry, this.cursorMaterial)
    this.cursor.position.set(x, y, z)
    this.cursor.userData.ignored = true
    this.cursor.userData.render = false
    
    this.scene.add(this.cursor)
    
    return cursor
  }
  
  onAdd(object) {}
}