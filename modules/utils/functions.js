overlay = function() {
  ui.show('#overlay')
}
hideAll = function() {
  ui.hide('#overlay')
  ui.hide('.menu')
  ui.hide('.quick-menu')
  ui.hide('.dropdown')
  ui.hide('.context-menu')
  ui.hide('#splash-screen')
}

setColor = function(selector, val) {
  let input = document.querySelector(selector)
  if (!input) return
  
  input.style.background = val
  input.setAttribute('value', val)
  
  input.onchange = () => {
    mat.preview(selection.selected[0].material, '#material-preview')
  }
}
setValue = function(selector, val) {
  let input = document.querySelector(selector)
  if (!input) return
  
  input.value = val
  
  input.onchange = () => {
    mat.preview(selection.selected[0].material, '#material-preview')
  }
}
setBoolean = function(selector, val) {
  let input = document.querySelector(selector)
  if (!input) return
  
  input.checked = val
  
  input.onchange = () => {
    mat.preview(selection.selected[0].material, '#material-preview')
  }
}


restartRenderer = function() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer = null
  }
  
  const newCanvas = canvas.cloneNode(true)
  canvas.parentNode.replaceChild(newCanvas, canvas)
  canvas = newCanvas
  
  initRenderer()
  initTransform()
  initControls()
  animate()
}

function fullscreen() {
  const docEl = document.documentElement;
  if (!document.fullscreenElement) {
    docEl.requestFullscreen?.() ||
      docEl.webkitRequestFullscreen?.() ||
      docEl.msRequestFullscreen?.();
  }
}
function reload() {
  window.location.reload();
}


function changeProjection(camera) {
  if (camera.isPerspectiveCamera) {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    
    camera.left = (frustumSize * aspect) / -2;
    camera.right = (frustumSize * aspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.near = camera.near;
    camera.far = camera.far;
    
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    
    camera.isPerspectiveCamera = false;
    camera.isOrthographicCamera = true;
    
    // Cambiar el tipo interno para que se comporte como ortográfica
    Object.setPrototypeOf(camera, THREE.OrthographicCamera.prototype);
  } else if (camera.isOrthographicCamera) {
    const aspect = window.innerWidth / window.innerHeight;
    
    camera.fov = 50;
    camera.aspect = aspect;
    camera.near = camera.near;
    camera.far = camera.far;
    
    camera.updateProjectionMatrix();
    
    camera.isPerspectiveCamera = true;
    camera.isOrthographicCamera = false;
    
    Object.setPrototypeOf(camera, THREE.PerspectiveCamera.prototype);
  }
}