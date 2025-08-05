let softShadows = new SoftShadow({
  enabled: ui.loadFromLocal('softShadows') || false
})

function render() {
  renderEnabled = !renderEnabled
  
  updateRenderState()
}

function updateRenderState() {
  rendering = renderEnabled && !renderPreview
  
  scene.traverse(child => {
    let light = child.isDirectionalLight || child.isPointLight && !child.userData.ignored && !child.userData.noShadow
    
    let mesh = child.isMesh && !child.userData.ignored && !child.userData.noShadow
    
    if (mesh) {
      child.castShadow = rendering
      child.receiveShadow = rendering
    }
    
    if (light) {
      child.castShadow = rendering
      
      if (child.shadow) {
        child.shadow.camera.near = 0.01
        child.shadow.camera.far = 1000
        
        child.shadow.camera.left = -configs.render.cameraSize
        child.shadow.camera.right = configs.render.cameraSize
        child.shadow.camera.top = configs.render.cameraSize
        child.shadow.camera.bottom = -configs.render.cameraSize
        
        child.shadow.bias = configs.render.bias
        child.shadow.mapSize = new THREE.Vector2(
          configs.render.shadowSize,
          configs.render.shadowSize,
        )
      }
    }
    
    if (child.isPointLight) {
      child.shadow.bias = -0.01
    }
    
    if (child.userData.render === false) {
      child.visible = !rendering
    }
  })
  
  if (rendering) renderImage()
}

function renderImage() {
  renderer.render(scene, camera)
  const img = new Image()
  img.src = renderer.domElement.toDataURL()
  const container = document.querySelector('#render-output')
  if (container) {
    container.innerHTML = ''
    container.appendChild(img)
  }
  return img
}
function saveRender() {
  const img = document.querySelector('#render-output img')
  if (!img) return
  
  try {
    const a = document.createElement('a')
    a.href = img.src
    a.download = 'render.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (e) {
    try {
      window.open(`googlechrome://navigate?url=${encodeURIComponent(img.src)}`, '_blank')
    } catch (e2) {}
  }
}