let configs = {
  nexel: {
    name: 'Nexel3D',
    version: '2.0 Beta',
    updateName: 'Modeling Update',
    date: '24 / 7 / 2025',
    creator: 'CubeMania MC'
  },
  
  viewport: {
    w: window.innerWidth,
    h: window.innerHeight,
    
    background: '#303030',
    
    pxRatio: window.devicePixelRatio,
    antialias: false,
    alpha: false,
    
    sounds: true,
    autoSelect: true,
    
    splashScreen: true,
  },
  
  camera: {
    fov: 70,
    near: 0.1,
    far: 1000,
    
    rotateSpeed: 0.8,
    zoomSpeed: 0.6,
    panSpeed: 0.8
  },
  
  transform: {
    snap: false,
    
    positionSnap: 0.5,
    rotationSnap: 45,
    scaleSnap: 0.5
  },
  
  render: {
    shadows: true,
    softShadows: false,
    shadowType: THREE.PCFShadowMap,
    shadowSize: 4096,
    cameraSize: 20,
    
    bias: -0.00005,
    near: 0.01,
    far: 1000
  }
}

// scene.js
let 
  scene,
  renderer,
  mainCamera,
  camera,
  cameraLight,
  controls,
  canvas;

// main.js
let 
  objects,
  helpers,
  projects,
  selection,
  selected,
  outliner,
  transform,
  actions, 
  grid,
  cursor,
  mat,
  animation,
  picker,
  animationId

// render / functions.js
let 
  renderEnabled,
  renderPreview,
  rendering
  

// material.js
let mapTarget = 'map'
let textureLoader = new THREE.TextureLoader()