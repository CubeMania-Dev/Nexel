let softShadows = new SoftShadow({
  enabled: configs.render.softShadows,
  softness: 0.05,
  samples: 8
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
        child.shadow.camera.far = 1000
        child.shadow.bias = configs.render.bias
        child.shadow.mapSize = new THREE.Vector2(
          configs.render.shadowSize,
          configs.render.shadowSize,
        )
      }
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