let configs = {
  nexel: {
    name: 'Nexel',
    version: '2.0 b1',
    updateName: 'Modeling Update',
    date: '...',
    creator: 'CubeMania MC'
  },
  
  viewport: {
    w: window.innerWidth,
    h: window.innerHeight,
    
    background: '#303030',
    
    pxRatio: window.devicePixelRatio,
    antialias: false,
    alpha: true,
    
    sounds: false,
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
    shadowType: THREE.PCFSoftShadowMap,
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



let testerCodes = [
  'Nexel2_SpecialKey_18D2F3A7E5A_8F4A9C1B',
  'Nexel2_SpecialKey_1AC3E7B2D9F_3E7D1A8C',
  'Nexel2_SpecialKey_19B4C8D7A2E_7C3F9D0A',
  'Nexel2_SpecialKey_1DF7A9C3B6E_2A5C8F9D',
  'Nexel2_SpecialKey_1BE8D2F9C7A_6F1E3B4D',
  'Nexel2_SpecialKey_1C9A3F7D8E2_5B6D0C3A',
  'Nexel2_SpecialKey_1E3B7A9D6F4_9A2C7D1E',
  'Nexel2_SpecialKey_1F6D2A9C3B7_4C8F0E1A',
  'Nexel2_SpecialKey_1A7B9C4D6F3_0D5E8A2C',
  'Nexel2_SpecialKey_1C2D8F7A9B5_3A6E0D1F'
]

let testerUser = false