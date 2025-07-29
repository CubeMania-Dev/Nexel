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
  light.raycast = () => {};

  this.cameraLightHelper = light
  this.cameraLightTarget = target

  this.updateCameraLight(camera)

  return light
}
  
  outline(object) {
  if (this.currentOutline) {
    this.currentOutline.forEach(h => {
      h.parent.remove(h)
      h.geometry.dispose()
      h.material.dispose()
    })
    this.currentOutline = null
  }
  
  if (!object) return
  
  const targets = Array.isArray(object) ? object : [object]
  const outlines = []
  
  for (const obj of targets) {
    if (!obj.isMesh || !obj.geometry) continue
    
    const geometry = obj.geometry
    const positionAttr = geometry.attributes.position
    if (!positionAttr) continue
    
    let localBox = new THREE.Box3().setFromBufferAttribute(positionAttr)
    let size = new THREE.Vector3()
    localBox.getSize(size)
    size.multiplyScalar(1.1)
    
    const boxGeo = new THREE.BoxGeometry(size.x, size.y, size.z)
    const edges = new THREE.EdgesGeometry(boxGeo)
    const material = new THREE.LineBasicMaterial({
      color: 0x0080ff,
      linewidth: 1,
    })
    
    const outline = new THREE.LineSegments(edges, material)
    const center = new THREE.Vector3()
    localBox.getCenter(center)
    outline.position.copy(center)
    outline.raycast = () => {}
    outline.userData.ignored = true
    outline.userData.render = false
    
    obj.add(outline)
    outlines.push(outline)
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
        point.raycast = () => {};
        point.userData.ignored = true
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
      
    })
    
    const line = new THREE.Line(geometry, material)
    line.computeLineDistances()
    line.raycast = () => {};
    line.userData.ignored = true
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
          
          helper.raycast = () => {};
          helper.userData.noShadow = true
          helper.userData.ignored = true
          helper.userData.render = false
          
          return helper
        }, 50)
      }
    })
  }
  
  bones() {
    const helpers = [];
    
    scene.traverse(child => {
      if (child.isBone) {
        let helper = new THREE.Points(
          new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3)),
          new THREE.PointsMaterial({
            size: 8,
            sizeAttenuation: false,
            map: textureLoader.load('./assets/images/bone.png'),
            transparent: true,
            depthTest: false
          })
        );
        helper.userData.ignored = true;
        helper.userData.render = false
        helper.raycast = () => {};
        child.add(helper);
        helpers.push(helper);
      }
    });
    
    return helpers;
  }
  
  boneConnections() {
    if (!this.connections) {
      this.geometry = new THREE.BufferGeometry();
      this.material = new THREE.LineBasicMaterial({
        color: '#666',
        linewidth: 2,
        depthTest: false,
        transparent: true
      });
      this.connections = new THREE.LineSegments(this.geometry, this.material);
      this.connections.name = '__connections';
      this.connections.userData.ignored = true
      this.connections.userData.render = false
      this.scene.add(this.connections);
    }
    
    const segments = [];
    
    this.scene.traverse(bone => {
      if (bone.isBone && bone.children.length > 0) {
        for (const child of bone.children) {
          if (child.isBone) {
            const start = new THREE.Vector3();
            const end = new THREE.Vector3();
            bone.getWorldPosition(start);
            child.getWorldPosition(end);
            segments.push(start.x, start.y, start.z, end.x, end.y, end.z);
          }
        }
      }
    });
    
    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(segments, 3));
    this.geometry.computeBoundingSphere();
    this.geometry.attributes.position.needsUpdate = true;
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
  
  wireframe(obj, vertices = true) {
    if (!this._wires) this._wires = new Set();
    if (!this._wireMat) this._wireMat = new THREE.LineBasicMaterial({ color: 0x000000 });
    if (!this._vertMat) this._vertMat = new THREE.PointsMaterial({ color: '#000', size: 5, sizeAttenuation: false });
    
    if (obj === null) {
      for (const w of this._wires) {
        if (w.parent) {
          w.visible = false;
          if (w.parent._verts) w.parent._verts.visible = false;
        }
      }
      return;
    }
    
    if (obj._wire) {
      obj._wire.geometry.dispose();
      obj._wire.geometry = new THREE.EdgesGeometry(obj.geometry);
      obj._wire.visible = true;
      
      if (vertices) {
        if (obj._verts) {
          obj._verts.geometry.dispose();
          obj._verts.geometry = obj.geometry;
          obj._verts.visible = true;
        } else {
          const verts = new THREE.Points(obj.geometry, this._vertMat);
          verts.userData.ignored = true;
          verts.raycast = () => {};
          obj.add(verts);
          obj._verts = verts;
        }
      } else if (obj._verts) {
        obj._verts.visible = false;
      }
      return obj._wire;
    }
    
    const geo = new THREE.EdgesGeometry(obj.geometry);
    const wire = new THREE.LineSegments(geo, this._wireMat);
    wire.userData.ignored = true
    
    wire.raycast = () => {};
    obj.add(wire);
    obj._wire = wire;
    this._wires.add(wire);
    
    if (vertices) {
      const verts = new THREE.Points(obj.geometry, this._vertMat);
      verts.userData.ignored = true;
      
      verts.raycast = () => {};
      obj.add(verts);
      obj._verts = verts;
    }
    
    return wire;
  }
}