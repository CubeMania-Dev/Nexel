class ViewCube {
  constructor(camera, container) {
    this.lineWidth = 0.02
    this.lineHeight = 0.7
    this.headSize = 0.18
    
    this.cam = camera
    this.cont = document.querySelector(container)
    
    this.init()
  }
  
  init() {
    let scene, camera, renderer
    
    let cam = this.cam
    
    let w = this.cont.clientWidth
    let h = this.cont.clientHeight
    
    scene = new THREE.Scene()
    
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.001, 2)
    
    camera.position.set(0, 0, 1)
    
    renderer = new THREE.WebGLRenderer({
      alpha: true,
    })
    renderer.setPixelRatio(1.5)
    renderer.setSize(w, h)
    
    this.cont.appendChild(renderer.domElement)
    
    let group = this.axes()
    
    scene.add(group)
    
    function animate() {
      requestAnimationFrame(animate)
      
      group.quaternion.copy(cam.quaternion.clone().invert())
      
      renderer.render(scene, camera)
    }
    
    animate()
  }
  
  axes() {
    let group = new THREE.Group()
    
    let mat = {
      red: new THREE.MeshBasicMaterial({ color: '#f33' }),
      green: new THREE.MeshBasicMaterial({ color: '#3f3' }),
      blue: new THREE.MeshBasicMaterial({ color: '#33f' }),
      
      redN: new THREE.MeshBasicMaterial({ color: '#500' }),
      greenN: new THREE.MeshBasicMaterial({ color: '#050' }),
      blueN: new THREE.MeshBasicMaterial({ color: '#005' }),
    }
    
    let geo = {
      line: new THREE.CylinderGeometry(this.lineWidth, this.lineWidth, this.lineHeight, 10),
      sphere: new THREE.SphereGeometry(this.headSize),
      sphereN: new THREE.SphereGeometry(this.headSize)
    }
    
    geo.line.translate(0, this.lineHeight / 2, 0)
    geo.sphere.translate(0, this.lineHeight, 0)
    geo.sphereN.translate(0, -this.lineHeight, 0)
    
    let lineX = new THREE.Mesh(
      geo.line,
      mat.red
    )
    let sphereX = new THREE.Mesh(
      geo.sphere,
      mat.red
    )
    let sphereXN = new THREE.Mesh(
      geo.sphereN,
      mat.redN
    )
    lineX.rotation.z = -Math.PI / 2
    
    let lineY = new THREE.Mesh(
      geo.line,
      mat.green
    )
    let sphereY = new THREE.Mesh(
      geo.sphere,
      mat.green
    )
    let sphereYN = new THREE.Mesh(
      geo.sphereN,
      mat.greenN
    )
    
    let lineZ = new THREE.Mesh(
      geo.line,
      mat.blue
    )
    let sphereZ = new THREE.Mesh(
      geo.sphere,
      mat.blue
    )
    let sphereZN = new THREE.Mesh(
      geo.sphereN,
      mat.blueN
    )
    lineZ.rotation.x = Math.PI / 2
    
    
    lineX.add(sphereX, sphereXN)
    lineY.add(sphereY, sphereYN)
    lineZ.add(sphereZ, sphereZN)
    
    group.add(lineX, lineY, lineZ)
    
    return group
  }
}