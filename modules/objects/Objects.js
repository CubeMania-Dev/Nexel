class Objects {
  constructor(scene) {
    this.scene = scene
    
    this.cursor
  }
  
  addMesh(name, x = 0, y = 0, z = 0, toCursor = true) {
    
    x = x ?? 0
    y = y ?? 0
    z = z ?? 0
    
    let geo = {
      cube: new THREE.BoxGeometry(),
      sphere: new THREE.SphereGeometry(0.5, 16, 8),
      plane: new THREE.PlaneGeometry(),
      cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 16)
    }
    let mat = {
      physical: new THREE.MeshPhysicalMaterial({
        roughness: 1,
        side: 2,
        flatShading: true,
      })
    }
    let object = {
      Cube: new THREE.Mesh(geo.cube, mat.physical),
      Sphere: new THREE.Mesh(geo.sphere, mat.physical),
      Plane: new THREE.Mesh(geo.plane, mat.physical),
      Cylinder: new THREE.Mesh(geo.cylinder, mat.physical)
    }
    
    object.Plane.rotation.x = -Math.PI / 2
    object.Plane.scale.set(2, 2, 1)
    
    let mesh = object[name]
    
    mesh.name = name
    
    if (toCursor && this.cursor) {
      let cursor = this.cursor.position
      
      mesh.position.set(
        cursor.x += x,
        cursor.y += y,
        cursor.z += z
      )
    }
    else {
      mesh.position.set(x, y, z)
    }
    
    this.scene.add(mesh)
    this.onAdd(mesh)
    
    return mesh
  }
  
  addOBJMesh(path, x = 0, y = 0, z = 0, toCursor = true) {
    
    x = x ?? 0
    y = y ?? 0
    z = z ?? 0
    
    let mesh = new THREE.Mesh(
      new THREE.OBJGeometry(path, true, false),
      new THREE.MeshPhysicalMaterial({
        roughness: 1,
        side: 2,
        flatShading: true,
      })
    )
    
    
    mesh.name = path.split('/').pop().split('.obj')[0]
    mesh.scale.set(1.5, 1.5, 1.5)
    
    if (toCursor && this.cursor) {
      let cursor = this.cursor.position
      
      mesh.position.set(
        cursor.x += x,
        cursor.y += y,
        cursor.z += z
      )
    }
    else {
      mesh.position.set(x, y, z)
    }
    
    this.scene.add(mesh)
    this.onAdd(mesh)
    
    return mesh
  }
  
  addLight(type, intensity = 0.5, x = 0, y = 0, z = 0, toCursor = true) {
    let lights = {
      directional: new THREE.DirectionalLight(0xffffff, intensity),
      point: new THREE.PointLight(0xffffff, intensity),
      spot: new THREE.SpotLight(0xffffff, intensity)
    }
    
    
    lights.spot.angle = Math.PI / 5
    lights.spot.penumbra = 1
    lights.spot.distance = 20
    
    lights.point.distance = 10
    lights.point.decay = 1
    
    lights.ambient = new THREE.AmbientLight(0xffffff, intensity)
    
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
  
  addCamera(toCursor = true, x, y, z) {
    x ?? 0
    y ?? 0
    z ?? 0
    
    let cam = new THREE.PerspectiveCamera(
      configs.camera.fov,
      configs.viewport.w / configs.viewport.h,
      0.001,
      10000
    )
    
    if (toCursor) {
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
  
  addBone(toCursor = true, x, y, z) {
    
    x = x ?? 0
    y = y ?? 0
    z = z ?? 0
    
    let bone = new THREE.Bone()
    
    bone.name = 'Bone'
    
    if (toCursor && this.cursor) {
      let cursor = this.cursor.position
      
      bone.position.set(
        cursor.x + x,
        cursor.y + y,
        cursor.z + z
      )
    }
    else {
      bone.position.set(x, y, z)
    }
    
    if (selection.selected.length > 0) {
      selection.selected[0].add(bone)
    } else {
      this.scene.add(bone)
    }
    
    this.onAdd(bone)
    
    return bone
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