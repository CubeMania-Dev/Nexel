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