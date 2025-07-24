class HelperManager {
  constructor(scene) {
    this.scene = scene
    this.gridHelper = null
  }
  
  grid(opts = {}) {
    if (this.gridHelper) {
      this.gridHelper.visible = !this.gridHelper.visible
      return this.gridHelper
    }
    
    let {
      size = 20,
      divisions = 20,
      colorX = 0x5555FF,
      colorZ = 0xFF5555,
      colorBase = 0x888888,
      userData = {},
      lineWidth = 0.5
    } = opts
    
    let step = size / divisions
    let half = size / 2
    let positions = []
    let colors = []
    
    for (let i = -half; i <= half; i += step) {
      positions.push(-half, 0, i, half, 0, i, i, 0, -half, i, 0, half)
      let isCenter = i === 0
      let cX = new THREE.Color(isCenter ? colorX : colorBase)
      let cZ = new THREE.Color(isCenter ? colorZ : colorBase)
      colors.push(cZ.r, cZ.g, cZ.b, cZ.r, cZ.g, cZ.b)
      colors.push(cX.r, cX.g, cX.b, cX.r, cX.g, cX.b)
    }
    
    let geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    
    let material = new THREE.LineBasicMaterial({ vertexColors: true, linewidth: lineWidth })
    this.gridHelper = new THREE.LineSegments(geometry, material)
    
    let baseUserData = { isHelper: true, isGridHelper: true, ignored: true }
    if (typeof userData === 'string') baseUserData[userData] = true
    else Object.assign(baseUserData, userData)
    Object.assign(this.gridHelper.userData, baseUserData)
    
    this.scene.add(this.gridHelper)
    return this.gridHelper
  }
  
  infiniteGrid(opts = {}) {
    if (this.infiniteGridHelper) {
      this.infiniteGridHelper.visible = !this.infiniteGridHelper.visible
      return this.infiniteGridHelper
    }
    
    let {
      size = 500,
        divisions = 500,
        subdivisions = 10,
        colorX = 0xff5555,
        colorZ = 0x5555ff,
        colorBase = 0x888888,
        userData = {},
        lineWidth = 0.1
    } = opts
    
    let vertexShader = `
      varying vec2 vUv;
      varying vec2 vWorld;
  
      void main() {
        vUv = uv * ${divisions}.0;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorld = worldPos.xz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `
    
    let fragmentShader = `
      varying vec2 vUv;
      varying vec2 vWorld;
  
      uniform vec3 colorX;
      uniform vec3 colorZ;
      uniform vec3 colorBase;
      uniform float lineWidth;
      uniform float minorIntensity;
      uniform vec2 center;
  
      float grid(vec2 uv, float width) {
        vec2 g = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
        float line = min(g.x, g.y);
        return 1.0 - smoothstep(width, width + 1.0, line);
      }
  
      void main() {
        float major = grid(vUv, lineWidth);
        float minor = grid(vUv * ${subdivisions.toFixed(1)}, lineWidth * 0.5) * minorIntensity * 0.25;
        float lines = max(minor, major);
  
        bool isCenterX = abs(vUv.y - ${divisions}.0 / 2.0) < 0.01;
        bool isCenterZ = abs(vUv.x - ${divisions}.0 / 2.0) < 0.01;
  
        vec3 col = colorBase;
        if (isCenterX) col = colorX;
        if (isCenterZ) col = colorZ;
        if (isCenterX && isCenterZ) col = mix(colorX, colorZ, 0.5);
  
        float dist = length(vWorld - center);
        float maxRadius = 70.0;
        float distFade = 1.0 - clamp(dist / maxRadius, 0.0, 1.0);
        distFade = pow(distFade, 1.5);
  
        float finalAlpha = lines * distFade;
  
        gl_FragColor = vec4(col, finalAlpha);
        if (gl_FragColor.a < 0.01) discard;
      }
    `
    
    let geometry = new THREE.PlaneGeometry(size, size, 1, 1)
    let material = new THREE.ShaderMaterial({
      uniforms: {
        colorX: { value: new THREE.Color(colorX) },
        colorZ: { value: new THREE.Color(colorZ) },
        colorBase: { value: new THREE.Color(colorBase) },
        lineWidth: { value: lineWidth },
        minorIntensity: { value: 0 },
        center: { value: new THREE.Vector2(0, 0) }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      side: 2
    })
    
    this.infiniteGridHelper = new THREE.Mesh(geometry, material)
    this.infiniteGridHelper.rotation.x = -Math.PI / 2
    
    let baseUserData = { isHelper: true, isInfiniteGridHelper: true, ignored: true, noShadow: true }
    if (typeof userData === 'string') baseUserData[userData] = true
    else Object.assign(baseUserData, userData)
    Object.assign(this.infiniteGridHelper.userData, baseUserData)
    
    this.infiniteGridHelper.position.y = -0.02
    
    this.scene.add(this.infiniteGridHelper)
    return this.infiniteGridHelper
  }
  
  cameraLight(camera, intensity = 0.4) {
  if (this.cameraLightHelper) {
    this.cameraLightHelper.visible = !this.cameraLightHelper.visible
    return this.cameraLightHelper
  }

  let light = new THREE.DirectionalLight(0xffffff, intensity)
  camera.add(light)
  this.scene.add(camera)

  let target = new THREE.Object3D()
  target.userData.ignored = true
  target.userData.preserve = true
  this.scene.add(target)

  light.target = target
  light.userData.cameraLight = true
  light.userData.ignored = true
  light.userData.preserve = true
  light.userData.render = false

  this.cameraLightHelper = light
  this.cameraLightTarget = target

  this.updateCameraLight(camera)

  return light
}
  
  outline(object) {
  if (this.currentOutline) {
    this.currentOutline.forEach(h => {
      this.scene.remove(h)
      h.geometry.dispose()
      h.material.dispose()
    })
    this.currentOutline = null
  }
  
  if (!object) return
  
  const targets = Array.isArray(object) ? object : [object]
  const outlines = []
  
  for (const obj of targets) {
    if (!obj.isMesh) continue
    const helper = new THREE.BoxHelper(obj, 0x0080ff)
    helper.userData.ignored = true
    helper.userData.render = false
    this.scene.add(helper)
    outlines.push(helper)
  }
  
  this.currentOutline = outlines
}

  lights() {
    const loader = new THREE.TextureLoader()
    
    scene.traverse(light => {
      if (!light.isLight || light.isAmbientLight || light.userData.ignored) return
      
      const typeMap = {
        PointLight: 'point',
        DirectionalLight: 'directional',
        SpotLight: 'spot'
      }
      
      const type = typeMap[light.type]
      if (!type) return
      
      let point = light.getObjectByName('_lightHelper')
      if (!point) {
        const texture = loader.load(`assets/icons/light_${type}.svg`)
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3))
        const mat = new THREE.PointsMaterial({
          map: texture,
          transparent: true,
          size: 25,
          sizeAttenuation: false,
          depthTest: false
        })
        point = new THREE.Points(geo, mat)
        point.name = '_lightHelper'
        point.userData.ignored = true
        point.userData.isHelper = true
        point.userData.render = false
        light.add(point)
      }
      
      if (light.isDirectionalLight && light.target) {
        let line = light.getObjectByName('_lightLine')
        const from = new THREE.Vector3()
        const to = new THREE.Vector3()
        light.getWorldPosition(from)
        light.target.getWorldPosition(to)
        const localTo = light.worldToLocal(to.clone())
        
        if (line) {
          line.geometry.setFromPoints([new THREE.Vector3(0, 0, 0), localTo])
          line.computeLineDistances()
        } else {
          line = this.line(new THREE.Vector3(0, 0, 0), localTo)
          line.name = '_lightLine'
          light.add(line)
        }
      }
    })
  }
  
  line(from, to) {
    const geometry = new THREE.BufferGeometry().setFromPoints([from, to])
    const material = new THREE.LineDashedMaterial({
      color: 0x000000,
      dashSize: 0.1,
      gapSize: 0.1,
      linewidth: 0.5
    })
    
    const line = new THREE.Line(geometry, material)
    line.computeLineDistances()
    line.userData.ignored = true
    line.userData.isHelper = true
    line.userData.noSelectable = true
    line.userData.render = false
    
    return line
  }
  
  cameras() {
    this.scene.traverse(child => {
      if (child.isCamera && child !== mainCamera && !child.hasHelper) {
        let helperGeo = new THREE.OBJGeometry('assets/models/cameraHelper.obj')
        
        setTimeout(() => {
          let helperMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true,
          })
          let helper = new THREE.Mesh(
            helperGeo,
            helperMat
          )
          
          child.add(helper)
          
          child.hasHelper = true
          
          helper.userData.ignored = true
          helper.userData.noSelectable = true
          helper.userData.noShadow = true
          helper.userData.render = false
          
          return helper
        }, 50)
      }
    })
  }
  
  updateCameraLight(camera) {
    if (!this.cameraLightHelper || !this.cameraLightTarget) return
    
    let direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    
    let position = new THREE.Vector3()
    camera.getWorldPosition(position)
    
    direction.multiplyScalar(10).add(position)
    this.cameraLightTarget.position.copy(direction)
    
    this.cameraLightHelper.target.updateMatrixWorld()
  }
  
  update(camera) {
    if (!this.infiniteGridHelper) return
    
    let y = camera.position.y
    let intensity = y <= 0 ? 1 : y >= 10 ? 0 : 1 - (y / 10)
    
    this.infiniteGridHelper.material.uniforms.minorIntensity.value = intensity
    this.infiniteGridHelper.material.uniforms.minorIntensity.needsUpdate = true
    
    let xz = new THREE.Vector2(camera.position.x, camera.position.z)
    this.infiniteGridHelper.material.uniforms.center.value.copy(xz)
    this.infiniteGridHelper.material.uniforms.center.needsUpdate = true
  }
}