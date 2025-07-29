// --- SPLASH SCREEN ---
if (configs.viewport.splashScreen) {
  overlay()
  ui.show('#splash-screen')
}


// --- PROJECTS ---
projects = new Projects(scene, '#project-container')

let saved = false
let projectName = null

projects.onSave = () => {
  if (renderEnabled) {
    render()
  }
  transform.detach()
  updateRenderState()
}
projects.onLoad = () => {
  outliner.refresh(true)
}


// --- OUTLINER ---
outliner = new Outliner('#outliner')

outliner.onUpdate = () => {
  helpers.boneConnections()
}


// --- VIEWCUBE ---
viewCube = new ViewCube(camera, '#view-cube')


// --- CONTROLS ---   
initControls = function() {
  if (controls) {
    controls.dispose()
    controls = null
  }
  
  controls = new THREE.OrbitControls(camera, canvas)
  controls.rotateSpeed = configs.camera.rotateSpeed
  controls.zoomSpeed = configs.camera.zoomSpeed
  controls.panSpeed = configs.camera.panSpeed
  
  controls.addEventListener('start', () => {
    if (renderEnabled) {
      renderPreview = true
      updateRenderState()
    }
  })
  
  controls.addEventListener('end', () => {
    if (renderEnabled) {
      renderPreview = false
      updateRenderState()
    }
  })
}

initControls()

// --- TRANSFORM ---
initTransform = function() {
  if (configs.transform.snap) {
    snap()
    document.getElementById('snap-btn').classList.remove('active')
  }
  if (transform) {
    scene.remove(transform)
    transform.dispose()
    transform = null
  }
  
  transform = new THREE.TransformControls(camera, renderer.domElement)
  
  transform.userData.preserve = true
  
  transform.traverse((child) => {
    child.userData.noSelectable = true
    child.userData.ignored = true
    child.userData.noShadow = true
  })
  
  transform.setSpace('local')
  
  transform.addEventListener('mouseDown', () => {
    controls.enabled = false
    renderPreview = true
    updateRenderState()
    
    if (selection.type === 'object') {
      actions.saveState('transform', selected)
    }
    else if (selection.type !== 'object') {
      actions.saveState('geometry', selected)
    }
  })
  
  transform.addEventListener('mouseUp', () => {
    controls.enabled = true
    renderPreview = false
    updateRenderState()
    updateProperties()
    
    if (selection.type !== 'object') {
      helpers.wireframe(selected)
    }
  })
  
  transform.addEventListener('objectChange', () => {
    if (selected.isBone) {
      helpers.boneConnections()
    }
    else {
      helpers.outline(null)
      selection.updateSelected()
    }
    
    if (selected.isDirectionalLight) {
      helpers.lights()
    }
  })
  
  scene.add(transform)
}

snap = function() {
  if (!transform) return
  
  const isActive = !transform.translationSnap &&
    !transform.rotationSnap &&
    !transform.scaleSnap
  
  transform.translationSnap = isActive ? configs.transform.positionSnap : null
  transform.rotationSnap = isActive ? THREE.MathUtils.degToRad(configs.transform.rotationSnap) : null
  transform.scaleSnap = isActive ? configs.transform.scaleSnap : null
  
  configs.transform.snap = isActive
}

initTransform()


// --- ACTIONS ---
actions = new ActionManager(scene)

actions.onAction = () => {
  helpers.outline(selected)
  helpers.lights()
  helpers.boneConnections()
  mat.list()
  updateProperties()
  outliner.refresh()
  
  if (selection.type !== 'object') {
    helpers.wireframe(selected)
    selection._deselect()
  }
}



// --- SELECTION ---
selection = new SelectionSystem(camera, scene)

selection.ignoredUserData = [
  'noSelectable'
]

selection.onSelect = (object) => {
  if (configs.viewport.sounds) {
    ui.playSound('assets/sounds/snap.mp3', 0.1)
  }
  
  transform.attach(object)
  outliner._select(object)
  
  if (selection.type === 'object') {
    helpers.outline(object)
    helpers.wireframe(null)
    
    selected = selection.selected[0]
  }
  else {
    helpers.outline(null)
    helpers.wireframe(selection.selectedMesh, true)
    
    selected = selection.selectedMesh
  }
  
  animation.renderKeyframes(object)
  
  ui.show('[data-show="onSelect"]')
  
  updateMaterials()
  updateProperties()
}
selection.onDeselect = (object) => {
  transform.detach()
  outliner._deselect()
  helpers.outline(null)
  helpers.wireframe(null)
  animation.renderKeyframes(null)
  
  selected = null
  
  ui.hide(
    '#material-editor, #material-list, #texture-list, #object-property-panel, #object-tool-panel'
  )
  
  ui.hide('[data-show="onSelect"]')
}


// --- OBJECTS ---
objects = new Objects(scene)
objects.addLight('ambient', 0.2)

cursor = objects.setCursor(0, 0, 0)

objects.addMesh('Cube')
objects.addCamera(true, 2.5, 1, 0)
objects.addLight('Directional', true, -3, 6, 3.5)

objects.onAdd = (object) => {
  if (configs.viewport.autoSelect) selection._select(object)
  helpers.lights()
  helpers.cameras()
  
  outliner.refresh()
  mat.list()
  
  helpers.bones()
  helpers.boneConnections()
  
  updateRenderState()
  
  actions.saveState('object', object, 'add')
}



// --- HELPERS ---
helpers = new HelperManager(scene)

grid = helpers.infiniteGrid({
  colorX: 0xdd8888,
  colorZ: 0x8888ff,
  colorBase: 0x999999,
  userData: {
    noSelectable: true,
    render: false,
    ignored: true
  }
})
cameraLight = helpers.cameraLight(mainCamera, 0.5)


// --- COLOR PICKER ---
picker = new Picker()

picker.add('#mat-color')


// --- ANIMATION SYSTEM ---
animation = new AnimationSystem({
  container: '#frames',
})

animation.onUpdate = () => {
  helpers.boneConnections()
  
  if (animation._playing) {
    helpers.outline(null)
    transform.detach()
  } else if (selected) {
    helpers.outline(selected)
    transform.attach(selected)
  }
}

// --- MATERIALS ---
mat = new Materials('#material-list', scene)


/* ANIMATE */
function onResize() {
  let w = window.innerWidth
  let h = window.innerHeight
  
  renderer.setSize(w, h)
  camera.aspect = w / h
  
  if (w > h) {
    // HORIZONTAL    
    camera.fov = configs.camera.fov / 2
    transform.size = 2
    controls.rotateSpeed = configs.camera.rotateSpeed / 2
    ui.show('#top-bar-functions')
  } else {
    // VERTICAL    
    camera.fov = configs.camera.fov
    transform.size = 1
    controls.rotateSpeed = configs.camera.rotateSpeed
    ui.hide('#top-bar-functions')
  }
  
  camera.updateProjectionMatrix()
}
onResize()

window.addEventListener('resize', onResize)


function animate() {
  animationId = requestAnimationFrame(animate)
  
  if (true) {
    renderer.render(scene, camera)
    
    helpers.updateCameraLight(mainCamera)
    helpers.update(mainCamera)
  }
}

window.onload = () => {
  animate()
  
  helpers.lights()
  helpers.cameras()
  mat.list()
  
  updateRenderState()
  
  outliner.refresh()
}