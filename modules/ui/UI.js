// - - - #top-bar - - -
ui.build({
  type: 'top-bar',
  id: 'top-bar',
  class: 'rad-n',
  content: [
    {
      type: 'btn',
      id: 'add-btn',
      icon: 'add',
      decoration: false,
      accent: true,
      dropdown: '#add-menu',
    }, // ADD
    {
      type: 'btn',
      id: 'save-btn',
      icon: 'save',
      accent: true,
      hideElement: '#project-container',
      onclick: el => {
        if (saved) projects.overwrite(projectName)
        else ui.show('#project-name-modal')
      }
    }, // SAVE
    {
      type: 'btn',
      id: 'open-project-btn',
      icon: 'folder-open',
      accent: true,
      toggleElement: '#project-container',
      onclick: el => {
        let children = el.querySelectorAll('.proj')
        
        children.forEach((child) => {
          child.addEventListener('click', () => {
            ui.hide(el)
          })
        })
      }
    }, // OPEN
    
    {
      type: 'sep'
    }, // ---
    
    {
      type: 'btn',
      id: 'snap-btn',
      icon: 'magnet',
      toggle: true,
      onclick: () => {
        snap()
      },
    }, // SNAP
    
    // .....
    
    {
      type: 'div',
      class: 'flex hidden w-full',
      id: 'top-bar-functions',
      content: [
        {
          type: 'sep'
        }, // ---
        
        {
          type: 'btn',
          icon: 'border-all',
          onclick: el => fullscreen()
        },
        
        {
          type: 'sep'
        }, // ---
      ]
    }, // EXTRA FUNCTIONS
    
    // .....
    
    {
      type: 'btn',
      icon: 'cubes',
      toggle: true,
      class: 'right',
      id: 'render',
      onclick: () => {
        let renderBtn = document.getElementById('conf-render')
        
        renderBtn.classList.toggle('active')
        
        render()
      }
    }, // RENDER
    
    {
      type: 'sep'
    }, // ---
    
    {
      type: 'btn',
      icon: 'undo',
      onclick: () => {
        actions.undo()
      }
    }, // UNDO,
    {
      type: 'btn',
      icon: 'redo',
      onclick: () => {
        actions.redo()
      }
    }, // REDO
    
    {
      type: 'sep'
    }, // ---
    
    {
      type: 'btn',
      icon: 'bars',
      toggleElement: '#config-menu'
    }, // MENU
  ]
})


// #project-container
ui.build({
  type: 'floating-grid',
  id: 'project-container',
  hidden: true,
})
ui.align(
  '#project-container',
  ['#top-bar', 'bottom'],
  ['#open-project-btn', 'left', true]
)


// - - - #side-bar - - -
ui.build({
  type: 'side-bar',
  id: 'side-bar',
  class: 'rad-br',
  content: [
    {
      type: 'btn',
      iconPath: 'assets/icons/material.svg',
      tooltip: 'Material',
      hideElement: '#object-property-panel',
      onclick: () => {
        if (selected && selection.type === 'object') {
          ui.toggle('#material-editor')
          updateMaterials()
          mat.preview(selected.material, '#material-preview')
        }
      }
    }, // MATERIAL
    {
      type: 'btn',
      icon: 'sliders',
      tooltip: 'Transform',
      hideElement: '#material-editor, #material-list',
    }, // PROPERTY
    
    {
      type: 'sep'
    }, // ---
    
    {
      type: 'btn',
      icon: 'tools',
      id: 'tools-btn',
      hidden: true,
      onclick: el => {
        if (selected) {
          ui.show('#object-tool-panel')
        }
      }
    }, // EDIT
    
    {
      type: 'sep',
      hidden: true,
    }, // ---
    
    {
      type: 'btn',
      iconPath: 'assets/icons/selection_object.svg',
      group: 'selection-type',
      active: true,
      tooltip: 'Selection: Object',
      showElement: '#animation-timeline',
      onclick: () => {
        selection.setType('object')
        selection.setFilter('all')
      }
    }, // OBJECT
    {
      type: 'btn',
      iconPath: 'assets/icons/selection_face.svg',
      group: 'selection-type',
      tooltip: 'Selection: Face',
      showElement: '#face-toolbar',
      onclick: () => selection.setType('face')
    }, // FACE
    {
      type: 'btn',
      iconPath: 'assets/icons/selection_segment.svg',
      group: 'selection-type',
      tooltip: 'Selection: Segment',
      showElement: '#segment-toolbar',
      onclick: () => selection.setType('segment')
    }, // EDGE
    {
      type: 'btn',
      iconPath: 'assets/icons/selection_vertex.svg',
      group: 'selection-type',
      tooltip: 'Selection: Vertex',
      showElement: '#vertex-toolbar',
      onclick: () => selection.setType('vertex')
    }, // VERTEX
    
    {
      type: 'sep'
    }, // ---
    
    {
      type: 'btn',
      iconPath: './assets/icons/bone.svg',
      group: 'selection-type',
      showElement: '#rigging-toolbar',
      onclick: () => {
        selection.setType('object')
        // selection.setFilter('bone')
      }
    }, // RIGGING
  ]
})
ui.align(
  '#side-bar',
  ['#transform-bar', 'bottom']
)

// #object-property-panel
ui.build({
  type: 'floating-container',
  id: 'object-property-panel',
  hidden: true,
  content: [
    { type: 'h5', text: 'Position' },
    {
      label: 'X',
      id: 'pos-x',
      type: 'number',
      attrs: { step: '0.01' },
      oninput: el => {
        let val = el.value
        let o = selection.selected[0]
        let n = parseFloat(val)
        if (o && !isNaN(n)) o.position.x = n
        
        helpers.outline(selection.selected[0])
      }
    },
    {
      label: 'Y',
      id: 'pos-y',
      type: 'number',
      attrs: { step: '0.01' },
      oninput: el => {
        let val = el.value
        let o = selection.selected[0]
        let n = parseFloat(val)
        if (o && !isNaN(n)) o.position.y = n
        
        helpers.outline(selection.selected[0])
      }
    },
    {
      label: 'Z',
      id: 'pos-z',
      type: 'number',
      attrs: { step: '0.01' },
      oninput: el => {
        let val = el.value
        let o = selection.selected[0]
        let n = parseFloat(val)
        if (o && !isNaN(n)) o.position.z = n
        
        helpers.outline(selection.selected[0])
      }
    },
    { type: 'sep' },
    { type: 'h5', text: 'Rotation' },
    {
      label: 'X',
      id: 'rot-x',
      type: 'number',
      attrs: { step: '0.01' },
      oninput: el => {
        let val = el.value
        let o = selection.selected[0]
        let n = parseFloat(val)
        if (o && !isNaN(n)) o.rotation.x = n * Math.PI / 180
        
        helpers.outline(selection.selected[0])
      }
    },
    {
      label: 'Y',
      id: 'rot-y',
      type: 'number',
      attrs: { step: '0.01' },
      oninput: el => {
        let val = el.value
        let o = selection.selected[0]
        let n = parseFloat(val)
        if (o && !isNaN(n)) o.rotation.y = n * Math.PI / 180
        
        helpers.outline(selection.selected[0])
      }
    },
    {
      label: 'Z',
      id: 'rot-z',
      type: 'number',
      attrs: { step: '0.01' },
      oninput: el => {
        let val = el.value
        let o = selection.selected[0]
        let n = parseFloat(val)
        if (o && !isNaN(n)) o.rotation.z = n * Math.PI / 180
        
        helpers.outline(selection.selected[0])
      }
    },
    { type: 'sep' },
    { type: 'h5', text: 'Scale' },
    {
      label: 'X',
      id: 'scl-x',
      type: 'number',
      attrs: { step: '0.01' },
      oninput: el => {
        let val = el.value
        let o = selection.selected[0]
        let n = parseFloat(val)
        if (o && !isNaN(n)) o.scale.x = n
        
        helpers.outline(selection.selected[0])
      }
    },
    {
      label: 'Y',
      id: 'scl-y',
      type: 'number',
      attrs: { step: '0.01' },
      oninput: el => {
        let val = el.value
        let o = selection.selected[0]
        let n = parseFloat(val)
        if (o && !isNaN(n)) o.scale.y = n
        
        helpers.outline(selection.selected[0])
      }
    },
    {
      label: 'Z',
      id: 'scl-z',
      type: 'number',
      attrs: { step: '0.01' },
      oninput: el => {
        let val = el.value
        let o = selection.selected[0]
        let n = parseFloat(val)
        if (o && !isNaN(n)) o.scale.z = n
        
        helpers.outline(selection.selected[0])
      }
    }
  ]
})
ui.align(
  '#object-property-panel',
  ['#side-bar', 'right'],
  ['#side-bar', 'top', true]
)
ui.borderResize(
  '#object-property-panel'
)

// #material-editor
ui.build({
  type: 'floating-container',
  id: 'material-editor',
  hidden: true,
  class: 'z-3',
  content: [
    {
      type: 'div',
      id: 'material-preview',
      dropdown: '#material-list',
      hideElement: '#texture-list',
      onclick: () => {
        mat.renderAll()
      }
    }, // PREVIEW
    
    {
      type: 'row',
      content: [
      {
        type: 'picker',
        id: 'mat-color',
        label: 'Color',
        onchange: (el) => {
          let sel = selection.selected[0]
          if (sel) sel.material.color = new THREE.Color(el.getAttribute('value'))
        }
      },
      {
        type: 'btn',
        icon: 'image',
        style: { padding: 0, marginLeft: 'auto' },
        showElement: '#texture-list',
        hideElement: '#material-list',
        onclick: () => {
          let sel = selection.selected[0]
          mapTarget = 'map'
          mat.listTextures('#texture-list', sel, mapTarget)
        }
      }]
    }, // COLOR + MAP
    
    {
      type: 'row',
      content: [
      {
        type: 'slider',
        id: 'mat-opacity',
        attrs: { min: "0", max: "1", step: "0.01", title: "Opacity: " },
        oninput: (el) => {
          el.title = `Opacity: ${el.value}`
          let sel = selection.selected[0]
          if (sel) {
            sel.material.opacity = parseFloat(el.value)
            sel.material.transparent = sel.material.opacity < 0.9
          }
        }
      },
      {
        type: 'btn',
        icon: 'image',
        style: { padding: 0 },
        showElement: '#texture-list',
        hideElement: '#material-list',
        onclick: () => {
          let sel = selection.selected[0]
          mapTarget = 'alphaMap'
          mat.listTextures('#texture-list', sel, mapTarget)
        }
      }]
    }, // OPACITY + MAP
    
    {
      type: 'row',
      content: [
      {
        type: 'slider',
        id: 'mat-roughness',
        attrs: { min: "0", max: "1", step: "0.01", title: "Roughness: " },
        oninput: (el) => {
          el.title = `Roughness: ${el.value}`
          let sel = selection.selected[0]
          if (sel) sel.material.roughness = parseFloat(el.value)
        }
      },
      {
        type: 'btn',
        icon: 'image',
        style: { padding: 0 },
        showElement: '#texture-list',
        hideElement: '#material-list',
        onclick: () => {
          let sel = selection.selected[0]
          mapTarget = 'roughnessMap'
          mat.listTextures('#texture-list', sel, mapTarget)
        }
      }]
    }, // ROUGHNESS + MAP
    
    {
      type: 'row',
      content: [
      {
        type: 'slider',
        id: 'mat-metalness',
        attrs: { min: "0", max: "1", step: "0.01", title: "Metalness: " },
        oninput: (el) => {
          el.title = `Metalness: ${el.value}`
          let sel = selection.selected[0]
          if (sel) sel.material.metalness = parseFloat(el.value)
        }
      },
      {
        type: 'btn',
        icon: 'image',
        style: { padding: 0 },
        showElement: '#texture-list',
        hideElement: '#material-list',
        onclick: () => {
          let sel = selection.selected[0]
          mapTarget = 'metalnessMap'
          mat.listTextures('#texture-list', sel, mapTarget)
        }
      }]
    }, // METALNESS + MAP
    
    {
      type: 'row',
      content: [
      {
        type: 'slider',
        id: 'mat-normal',
        attrs: { min: "0", max: "1", step: "0.01", title: "Normal: " },
        oninput: (el) => {
          el.title = `Normal: ${el.value}`
          let sel = selection.selected[0]
          if (sel) sel.material.normalScale = new THREE.Vector2(parseFloat(el.value), parseFloat(el.value))
        }
      },
      {
        type: 'btn',
        icon: 'image',
        style: { padding: 0 },
        showElement: '#texture-list',
        hideElement: '#material-list',
        onclick: () => {
          let sel = selection.selected[0]
          mapTarget = 'normalMap'
          mat.listTextures('#texture-list', sel, mapTarget)
        }
      }]
    }, // NORMAL + MAP
    
    {
      type: 'slider',
      id: 'mat-transmission',
      attrs: { min: "0", max: "1", step: "0.01", title: "Transmission: " },
      oninput: (el) => {
        el.title = `Transmission: ${el.value}`
        let sel = selection.selected[0]
        if (sel) sel.material.transmission = parseFloat(el.value)
      }
    }, // TRANSMISSION
    
    {
      type: 'slider',
      id: 'mat-thickness',
      attrs: { min: "0", max: "1", step: "0.01", title: "Thickness: " },
      oninput: (el) => {
        el.title = `Thickness: ${el.value}`
        let sel = selection.selected[0]
        if (sel) sel.material.thickness = parseFloat(el.value)
      }
    }, // THICKNESS
    
    {
      type: 'sep'
    }, // ---
    
    {
      type: 'checkbox',
      id: 'mat-shadow',
      label: 'Shadow',
      attrs: { checked: "true" },
      onchange: (el) => {
        let sel = selection.selected[0]
        sel.userData.noShadow = !el.checked
        updateRenderState()
      }
    }, // SHADOWS
    
    {
      type: 'checkbox',
      id: 'mat-transparent',
      label: 'Transparent',
      onchange: (el) => {
        let sel = selection.selected[0]
        if (sel) sel.material.transparent = el.checked
      }
    }, // TRANSPARENT
    
    {
      type: 'checkbox',
      id: 'mat-pixelated',
      label: 'Pixelated',
      onchange: (el) => {
        let sel = selection.selected[0]
        if (sel && sel.material) {
          const maps = ['map', 'roughnessMap', 'metalnessMap', 'normalMap']
          for (let key of maps) {
            const tex = sel.material[key]
            if (tex instanceof THREE.Texture) {
              tex.magFilter = el.checked ? THREE.NearestFilter : THREE.LinearFilter
              tex.minFilter = el.checked ? THREE.NearestMipMapNearestFilter : THREE.LinearMipMapLinearFilter
              tex.needsUpdate = true
            }
          }
        }
      }
    }, // PIXELATED
  ]
})
ui.align(
  '#material-editor',
  ['#side-bar', 'right'],
  ['#side-bar', 'top', true]
)

// #material-list + #texture-list
ui.build({
  type: 'floating-grid',
  autoAlign: true,
  hidden: true,
  class: 'z-2',
  id: 'material-list'
})
ui.align(
  '#material-list',
  ['#material-editor', 'right'],
  ['#material-editor', 'top', true]
)

ui.build({
  type: 'floating-grid',
  hidden: true,
  class: 'z-2',
  id: 'texture-list'
})
ui.align(
  '#texture-list',
  ['#material-editor', 'right'],
  ['#material-editor', 'top', true]
)

// #object-tool-panel
ui.build({
  type: 'floating-container',
  id: 'object-tool-panel',
  hidden: true,
  style: {
    padding: 'var(--spc-xs)'
  },
  class: 'rad-right',
  content: [
  {
    type: 'btn',
    icon: 'bone',
    minText: 'Rigging',
  }]
})
ui.align(
  '#object-tool-panel',
  ['#side-bar', 'right'],
  ['#tools-btn', 'top', true]
)

function updateMaterials() {
  let sel = selection.selected[0]
  
  if (!sel || sel.type !== 'Mesh' || !sel.material) {
    ui.hide('#material-editor', '#material-list')
    return
  }
  
  setColor('#mat-color', sel.material.color.getStyle())
  
  setValue('#mat-opacity', sel.material.opacity || 1)
  setValue('#mat-roughness', sel.material.roughness || 1)
  setValue('#mat-metalness', sel.material.metalness || 0)
  setValue('#mat-normal', sel.material.normalScale || 1)
  
  setValue('#mat-transmission', sel.material.transmission || 0)
  setValue('#mat-thickness', sel.material.thickness || 0)
  
  setBoolean('#mat-shadow', !sel.userData.noShadow)
  setBoolean('#mat-transparent', sel.material.transparent)
}

function updateProperties() {
  let o = selection.selected[0]
  if (!o) return
  
  const round = v => Number(parseFloat(v).toFixed(2))
  
  setValue('#pos-x', round(o.position.x))
  setValue('#pos-y', round(o.position.y))
  setValue('#pos-z', round(o.position.z))
  
  setValue('#rot-x', round(o.rotation.x * 180 / Math.PI))
  setValue('#rot-y', round(o.rotation.y * 180 / Math.PI))
  setValue('#rot-z', round(o.rotation.z * 180 / Math.PI))
  
  setValue('#scl-x', round(o.scale.x))
  setValue('#scl-y', round(o.scale.y))
  setValue('#scl-z', round(o.scale.z))
}

// - - - #transform-bar - - -
ui.build({
  type: 'bar',
  id: 'transform-bar',
  direction: 'row',
  class: 'rad-br',
  content: [
    {
      type: 'btn',
      icon: 'arrows',
      group: 'transform',
      active: true,
      tooltip: 'Transform: Position',
      onclick: () => {
        transform.setMode('translate')
      }
    }, // Position
    {
      type: 'btn',
      icon: 'rotate',
      group: 'transform',
      tooltip: 'Transform: Rotation',
      onclick: () => {
        transform.setMode('rotate')
      }
    }, // Rotation
    {
      type: 'btn',
      icon: 'expand',
      group: 'transform',
      tooltip: 'Transform: Scale',
      onclick: () => {
        transform.setMode('scale')
      }
    }, // Scale
  ]
})
ui.align(
  '#transform-bar',
  ['#top-bar', 'bottom'],
  ['body', 'left', true],
)

// View Cube
ui.build({
  type: 'div',
  id: 'view-cube'
})
ui.align(
  '#view-cube',
  ['#outliner', 'left'],
  ['#top-bar', 'bottom']
)

// - - - #action-bar - - -
ui.build({
  type: 'bar',
  direction: 'row',
  id: 'action-bar',
  position: 'bottom',
  hidden: true,
  data: { show: 'onSelect' },
  class: 'rad-top',
  content: [
    {
      type: 'btn',
      icon: 'trash-alt',
      tooltip: 'Delete',
      onclick: () => {
        if (selection.type === 'object') {
          actions.saveState('object', selection.selected[0], 'remove')
          actions.delete(selection.selected)
          selection._deselect()
        }
      }
    }, // Delete
    {
      type: 'btn',
      icon: 'clone',
      tooltip: 'Duplicate',
      onclick: () => {
        if (selection.type === 'object') {
          helpers.outline(null)
          let dup = actions.duplicate(selection.selected)
        }
      }
    }, // Clone
    {
      type: 'btn',
      icon: 'eye',
      tooltip: 'Hide',
      onclick: el => {
        if (selection.type === 'object') {
          actions.hide(selection.selected[0])
          selection._deselect()
          outliner.refresh()
        }
      }
    }, // Hide,
    {
      type: 'btn',
      icon: 'crosshairs',
      tooltip: 'Focus',
      onclick: () => {
        actions.focus(camera, selection.selected[0], controls)
      }
    }, // Focus
    {
      type: 'btn',
      icon: 'folder',
      tooltip: 'Group',
      onclick: () => {
        helpers.outline(null)
        let group = actions.group(selection.selected)
        selection._select(group)
        outliner.refresh()
      }
    }, // Group
  ]
})
ui.align(
  '#action-bar',
  ['#animation-timeline', 'top']
)


// - - - #add-menu - - -
ui.build({
  type: 'dropdown',
  id: 'add-menu',
  hidden: true,
  autoAlign: true,
  content: [
    {
      type: 'btn',
      icon: 'cube',
      text: 'Mesh',
      dropdown: '#add-mesh-menu',
      tooltip: 'Add Primitives >',
    }, // Mesh
    {
      type: 'btn',
      icon: 'lightbulb',
      text: 'Light',
      dropdown: '#add-light-menu',
      tooltip: 'Add Lights >',
    }, // Light
    {
      type: 'btn',
      icon: 'video',
      text: 'Camera',
      onclick: () => {
        objects.addCamera(true, 0, 0, 0)
      }
    }, // Camera
    {
      type: 'btn',
      iconPath: './assets/icons/bone_plus.svg',
      text: 'Bone',
      onclick: el => {
        objects.addBone()
      }
    }, // Bone
  ]
})

ui.build({
  type: 'dropdown',
  id: 'add-mesh-menu',
  hidden: true,
  autoAlign: true,
  content: [
    {
      type: 'btn',
      icon: 'cube',
      text: 'Cube',
      tooltip: 'Hola, soy Cube',
      onclick: () => {
        let obj = objects.addMesh('Cube')
      }
    }, // Cube
    {
      type: 'btn',
      icon: 'cube',
      text: 'Sphere',
      tooltip: 'Hablame por Discord, estoy aburrido',
      onclick: () => {
        let obj = objects.addMesh('Sphere')
      }
    }, // Sphere
    {
      type: 'btn',
      icon: 'cube',
      text: 'Plane',
      tooltip: 'WTF!',
      onclick: () => {
        let obj = objects.addMesh('Plane')
      }
    }, // Plane
    {
      type: 'btn',
      icon: 'cube',
      text: 'Cylinder',
      tooltip: 'Deja de revisar el contenido de mis botones 😆',
      onclick: () => {
        let obj = objects.addMesh('Cylinder')
      }
    }, // Cylinder
    
    {
      type: 'sep'
    }, // ---
    
    {
      type: 'btn',
      icon: 'cube',
      text: 'Suzanne',
      tooltip: 'Hola... Yo para nada soy el mono de Blender',
      onclick: () => {
        let obj = objects.addOBJMesh('./assets/models/suzanne.obj')
      }
    }, // Suzanne
  ]
}) // Mesh Menu
ui.build({
  type: 'dropdown',
  id: 'add-light-menu',
  hidden: true,
  autoAlign: true,
  content: [
    {
      type: 'btn',
      icon: 'lightbulb',
      text: 'Directional',
      onclick: () => {
        objects.addLight('Directional')
      }
    }, // Directional
    {
      type: 'btn',
      icon: 'lightbulb',
      text: 'Point',
      onclick: () => {
        objects.addLight('Point')
      }
    }, // Point
    {
      type: 'btn',
      icon: 'lightbulb',
      text: 'Spot',
      onclick: () => {
        objects.addLight('Spot')
      }
    }, // Spot
  ]
}) // Light Menu

// - - - #outliner - - -
ui.build({
  type: 'floating-container',
  id: 'outliner',
})
ui.borderResize(
  '#outliner'
)
ui.align(
  '#outliner',
  ['#top-bar', 'bottom'],
  ['body', 'right', true]
)

// - - - #config-menu - - -
ui.build({
  type: 'menu',
  id: 'config-menu',
  hidden: true,
  content: [
    {
      type: 'side-bar',
      content: [
        {
          type: 'btn',
          icon: 'cubes',
          text: 'Render',
          group: 'conf-section',
          showElement: '#render-section',
          
          active: true
        }, // Render
        {
          type: 'btn',
          icon: 'display',
          text: 'Interface',
          group: 'conf-section',
          showElement: '#interface-section'
        }, // Interface
        {
          type: 'btn',
          icon: 'earth',
          text: 'General',
          group: 'conf-section',
          showElement: '#general-section'
        }, // General
      ]
    }, // SIDE SECTION
    
    {
      type: 'section',
      id: 'render-section',
      content: [
        {
          type: 'h3',
          icon: 'cubes',
          text: 'Render'
        }, // RENDER
        
        {
          type: 'row',
          content: [
          {
            type: 'div',
            id: 'render-output',
            style: {
              aspectRatio: '16/9',
            }
          }]
        }, // #render-output
        {
          type: 'row',
          content: [
          {
            type: 'btn',
            icon: 'cubes',
            toggle: true,
            id: 'conf-render',
            onclick: () => {
              let renderBtn = document.getElementById('render')
              
              renderBtn.classList.toggle('active')
              
              render()
            }
          },
          {
            type: 'btn',
            icon: 'save',
            text: 'save',
            onclick: () => saveRender()
          },
          {
            type: 'btn',
            icon: 'video',
            text: 'Render',
            hidden: true
          }, ]
        }, // IMAGE - SAVE
        
        {
          type: 'row',
          content: [
          {
            type: 'btn',
            text: `Camera`,
            icon: 'video',
            dropdown: '#scene-cameras',
            class: 'w-full',
            decoration: 'dropdown-left',
            onclick: function() {
              listCameras()
            }
          }]
        }, // CAMERA
        
        {
          type: 'sep'
        }, // ---
        
        {
          type: 'h4',
          text: 'Post-processing',
          hidden: true,
        }, // POST PROCESSING
        
        {
          type: 'row',
          hidden: true,
          content: [
          {
            type: 'checkbox',
            label: 'Soft Shadows',
            onclick: () => {
              toggleSoftShadows()
            }
          }]
        }, // soft shadows []
        {
          type: 'row',
          hidden: true,
          content: [
          {
            type: 'checkbox',
            label: 'Ambient Occlusion',
          }]
        }, // abient occlussion []
        {
          type: 'row',
          hidden: true,
          content: [
          {
            type: 'checkbox',
            label: 'Bloom',
          }]
        }, // bloom []
      ]
    }, // RENDER SECTION
    {
      type: 'section',
      id: 'interface-section',
      hidden: true,
      content: [
        {
          type: 'h3',
          icon: 'display',
          text: 'Interface',
        }, // INTERFACE
        
        {
          type: 'h4',
          text: 'Performance'
        }, // PERFORMANCE 
        
        {
          type: 'row',
          content: [
          {
            type: 'checkbox',
            label: 'Antialiasing',
            attrs: {
              checked: true
            },
            onchange: el => {
              configs.viewport.antialias = el.checked
              
              restartRenderer()
            }
          }]
        }, // ANTIALIAS
        {
          type: 'row',
          content: [
          {
            type: 'checkbox',
            label: 'Click Sound',
            attrs: {
              checked: true
            },
            onchange: el => {
              configs.viewport.sounds = el.checked
            }
          }]
        }, // CLICK SOUND
        {
          type: 'row',
          content: [
          {
            type: 'strong',
            text: 'Resolution'
          },
          {
            type: 'slider',
            attrs: {
              min: '0.8',
              max: '2',
              step: '0.1',
              value: configs.viewport.pxRatio,
              title: 'Pixel Ratio: ' + configs.viewport.pxRatio
            },
            oninput: el => {
              configs.viewport.pxRatio = el.value
              renderer.setPixelRatio(el.value)
              
              el.title = `Pixel Ratio: ${el.value}`
            }
          }]
        }, // RESOLUTION
        
        {
          type: 'h4',
          text: 'Camera Controls'
        }, // CAMERA
        
        {
          type: 'row',
          content: [
          {
            type: 'number',
            label: 'Rotation Velocity',
            attrs: {
              value: configs.camera.rotateSpeed
            },
            oninput: el => {
              configs.camera.rotateSpeed = el.value
            }
          }]
        }, // ROTATION SPEED
        {
          type: 'row',
          content: [
          {
            type: 'number',
            label: 'Zoom Velocity',
            attrs: {
              value: configs.camera.zoomSpeed
            },
            oninput: el => {
              configs.camera.zoomSpeed = el.value
            }
          }]
        }, // ZOOM SPEED
        {
          type: 'row',
          content: [
          {
            type: 'number',
            label: 'Pan Velocity',
            attrs: {
              value: configs.camera.panSpeed
            },
            oninput: el => {
              configs.camera.panSpeed = el.value
            }
          }]
        }, // PAN SPEED
        
        {
          type: 'h4',
          text: 'Transform Controls'
        }, // Transform Controls
        
        {
          type: 'row',
          content: [
          {
            type: 'number',
            label: 'Position Snap',
            attrs: {
              value: configs.transform.positionSnap
            },
            oninput: el => {
              configs.transform.positionSnap = el.value
              
              snap()
              snap()
            }
          }]
        }, // POSITION SNAP
        {
          type: 'row',
          content: [
          {
            type: 'number',
            label: 'Rotation Snap',
            attrs: {
              value: configs.transform.rotationSnap
            },
            oninput: el => {
              configs.transform.rotationSnap = el.value
              snap()
              snap()
            }
          }]
        }, // ROTATION SNAP
        {
          type: 'row',
          content: [
          {
            type: 'number',
            label: 'Scale Snap',
            attrs: {
              value: configs.transform.scaleSnap
            },
            oninput: el => {
              configs.transform.scaleSnap = el.value
              snap()
              snap()
            }
          }]
        }, // SCALE SNAP
        
      ]
    }, // INTERFACE SECTION
    {
      type: 'section',
      id: 'general-section',
      hidden: true,
      content: [
        {
          type: 'h3',
          icon: 'earth',
          text: 'General'
        },
        {
          type: 'checkbox',
          label: 'Auto select on Add',
          attrs: {
            checked: true
          },
          onchange: el => {
            configs.viewport.autoSelect = el.checked
          }
        }, // AUTO SELECT
        
        {
          type: 'sep'
        },
        
        {
          type: 'btn',
          text: 'Clear all Projects',
          onclick: el => {
            ui.show('#clear-projects-modal')
            projects.clear()
          }
        },
      ]
    }, // GENERAL SECTION
  ]
})


ui.build({
  type: 'dropdown',
  id: 'scene-cameras',
  hidden: true,
  autoAlign: true,
})

function listCameras() {
  ui.clear('#scene-cameras')
  
  ui.build({
    type: 'btn',
    icon: 'video',
    text: 'mainCamera',
    onclick: () => {
      camera = actions.jump(mainCamera)
      
      renderImage()
    }
  }, '#scene-cameras')
  
  ui.build({
    type: 'sep'
  }, '#scene-cameras')
  
  scene.traverse((child) => {
    if (child.isCamera && child !== mainCamera) {
      ui.build({
        type: 'btn',
        icon: 'video',
        text: `${child.name || 'Unnamed Camera'}`,
        onclick: () => {
          camera = actions.jump(child)
          
          renderImage()
        }
      }, '#scene-cameras')
    }
  })
}


// - - - ANIMATION - - -
ui.build({
  type: 'div',
  id: 'animation-timeline',
  content: [
    {
      type: 'div',
      id: 'animation-toolbar',
      content: [
        {
          type: 'btn',
          icon: 'backward',
          onclick: () => {
            animation.setCursor(0)
          }
        }, // BACKWARD
        {
          type: 'btn',
          icon: 'play',
          activeIcon: 'pause',
          toggle: true,
          onclick: () => {
            if (!animation._playing) {
              animation.play()
            } else {
              animation.pause()
            }
          }
        }, // PLAY
        {
          type: 'btn',
          icon: 'forward',
          onclick: () => {
            animation.setCursor(animation.frames - 1)
          }
        }, // FORWARD
        
        {
           type: 'sep'
        },
        
        {
          type: 'btn',
          icon: 'diamond',
          class: 'right',
          onclick: function() {
            animation.keyframe(selection.selected[0])
          }
        }, // KEYFRAME
      ]
    }, // TOOLBAR
    {
      type: 'div',
      id: 'timeline',
      content: [
      {
        type: 'div',
        id: 'frames'
      }]
    }, // TIMELINE
  ]
})

ui.borderResize(
  '#animation-timeline',
)

// - - - EDIT TOOLS - - -
// #face-toolbar
ui.build({
  type: 'bar',
  id: 'face-toolbar',
  hidden: true,
  class: 'rad-top',
  position: { bottom: 0 },
  content: [
  {
    type: 'btn',
    icon: 'close',
    minText: 'Delete',
    onclick: () => {
      actions.saveState('geometry', selection.selectedMesh)
      deleteFace()
    }
  },
  {
    type: 'btn',
    iconPath: './assets/icons/tool_extrude_face.svg',
    minText: 'Extrude',
    onclick: () => {
      actions.saveState('geometry', selection.selectedMesh)
      extrudeFace(0)
    }
  }]
})

// #segment-toolbar
ui.build({
  type: 'bar',
  id: 'segment-toolbar',
  hidden: true,
  class: 'rad-top',
  position: { bottom: 0 },
  content: [
  {
    type: 'btn',
    icon: 'close',
    minText: 'Delete',
    onclick: () => {
      actions.saveState('geometry', selection.selectedMesh)
      deleteSegment()
    }
  },
  {
    type: 'btn',
    iconPath: './assets/icons/tool_extrude_segment.svg',
    minText: 'Extrude',
    onclick: () => {
      actions.saveState('geometry', selection.selectedMesh)
      extrudeSegment(0)
    }
  }]
})

// #vertex-toolbar
ui.build({
  type: 'bar',
  id: 'vertex-toolbar',
  hidden: true,
  class: 'rad-top',
  position: { bottom: 0 },
  content: [
  {
    type: 'btn',
    icon: 'close',
    minText: 'Delete',
    onclick: () => {
      actions.saveState('geometry', selection.selectedMesh)
      deleteVertex()
    }
  }]
})

// #rigging-toolbar
ui.build({
  type: 'bar',
  id: 'rigging-toolbar',
  hidden: true,
  class: 'rad-top',
  position: { bottom: 0 },
  content: [
    {
      type: 'btn',
      icon: 'close',
      minText: 'Delete',
      onclick: () => {
        if (selected.isBone) {
          actions.saveState('object', selected, 'remove')
          actions.delete(selected)
          selection._deselect()
        }
      }
    },
    {
      type: 'btn',
      iconPath: './assets/icons/bone_plus.svg',
      minText: 'Add',
      onclick: () => {
        objects.addBone()
      }
    },
    {
      type: 'btn',
      iconPath: './assets/icons/bone_bind.svg',
      minText: 'Bind',
      onclick: () => {
        if (selected.isMesh) {
          let obj = bindBones(selected)
          selection._select(obj)
          outliner.refresh(true)
        }
      }
    },
    {
      type: 'btn',
      iconPath: './assets/icons/bone_detach.svg',
      minText: 'Detach',
      onclick: () => {
        if (selected.isSkinnedMesh) {
          let obj = unbindBones(selected)
          selection._select(obj)
          outliner.refresh(true)
        }
      }
    },
    
    {
      type: 'sep'
    },
    
    {
      type: 'btn',
      icon: 'brush',
      minText: 'Weights',
      onclick: () => {
        verifyWeights(selected)
      }
    },
  ]
})



// - - - ALL MODALS - - -
ui.build({
  type: 'dropdown',
  id: 'object-context-menu',
  hidden: true,
  content: [
  {
    type: 'btn',
    icon: 'circle',
    text: 'Shade Smooth',
    onclick: el => {
      
    }
  }]
})

const viewport = document.querySelector('#viewport');
viewport.addEventListener('doubletouch', (e) => {
  actions.undo()
});
viewport.addEventListener('tripletouch', (e) => {
  actions.redo()
});



// #project-name-modal
ui.build({
  type: 'modal',
  id: 'project-name-modal',
  hidden: true,
  onaccept: (modal) => {
    let input = modal.querySelector('input[type="text"]')
    let name = input.value
    
    if (!saved) {
      projects.save(name)
      
      saved = true
      projectName = name
    }
  },
  content: [
  {
    type: 'p',
    icon: 'save',
    text: 'Save Project'
  },
  {
    type: 'text',
    attrs: {
      value: 'New Project'
    }
  }]
})

// #clear-projects-modal
ui.build({
  type: 'modal',
  hidden: true,
  id: 'clear-projects-modal',
  onaccept: el => {
    projects.clear()
  },
  content: [
  {
    type: 'strong',
    class: 'alert',
    icon: 'warn',
    text: 'Are you sure you want to delete all your projects? This action cannot be undone'
  }]
})


// --- FEEDBACK ---
ui.build({
  type: 'div',
  id: 'overlay',
  hidden: true,
  onclick: el => hideAll()
})

// #splash-screen
ui.build({
  type: 'container',
  id: 'splash-screen',
  hidden: true,
  style: {
    width: '80%',
    maxHeight: '300px',
    border: 'solid var(--bg-3)',
    padding: 'var(--spc-lg)'
  },
  content: [
    {
      type: 'row',
      style: {
        marginBottom: '10px'
      },
      content: [
      {
        type: 'img',
        class: 'logo',
        src: 'assets/images/logo.png'
      },
      {
        type: 'div',
        class: 'flex',
        direction: 'column',
        content: [
        {
          type: 'h3',
          style: {
            margin: 0
          },
          text: `Nexel3d (${configs.nexel.version})`
        },
        {
          icon: 'tools',
          type: 'strong',
          style: {
            color: '#29f'
          },
          text: `${configs.nexel.updateName}`
        }]
      }]
    },
    {
      type: 'sep'
    },
    {
      type: 'h5',
      style: {
        textAlign: 'justify'
      },
      text: `Welcome to version ${configs.nexel.version}. This is only a test version, so you may encounter some issues. If so, please report them on the official server.`
    },
    {
      type: 'sep'
    },
    {
      type: 'h4',
      text: "What's new? :",
      decoration: 'dropdown',
      class: 'collapsable',
      toggleElement: '#splash-content'
    },
    {
      type: 'ul',
      id: 'splash-content',
      hidden: true,
      content: [
        {
          type: 'h5',
          text: 'TOTAL RESTART'
        },
        {
          type: 'li',
          text: 'The project has been completely restarted, removing broken and unnecessary features to improve performance, quality, and workflow. The user interface has also been fully redesigned.'
        },
        {
          type: 'sep'
        },
        {
          type: 'h5',
          text: 'Initial Features'
        },
        { type: 'li', text: 'UI navigation' },
        { type: 'li', text: 'Object selection and transformation' },
        { type: 'li', text: 'Material editing' },
        { type: 'li', text: 'Project saving' },
        { type: 'li', text: 'Timeline and basic animation' },
        { type: 'li', text: 'Image rendering and export' },
        { type: 'li', text: 'Various function settings' },
        {
          type: 'sep'
        },
        {
          type: 'h5',
          text: 'CONFIRMED Upcoming Features'
        },
        { type: 'li', text: 'Soft shadows' },
        { type: 'li', text: 'Ambient occlusion' },
        { type: 'li', text: 'Advanced keyframe editing' }
      ]
    },
    
    {
      type: 'row',
      content: [
      {
        type: 'strong',
        text: 'by CubeMania MC'
      }]
    },
    {
      type: 'row',
      content: [
      {
        type: 'btn',
        content: [
          { type: 'i', class: 'fab fa-discord', style: { color: '#45f', fontSize: '1.5em' } }
        ],
        text: 'Discord',
        onclick: el => {
          window.open('https://discord.gg/3DQzWEfk')
        }
      },
      {
        type: 'btn',
        content: [
          { type: 'i', class: 'fab fa-youtube', style: { color: '#f32', fontSize: '1.5em' } }
        ],
        text: 'YouTube',
        onclick: el => {
          window.open('https://youtube.com/@cubemania_mc_4558?si=qjsaAllowZuq5WGx')
        }
      }]
    }
  ]
})


let buttons = document.querySelectorAll('.btn')

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (configs.viewport.sounds) {
      ui.playSound('assets/sounds/click.mp3', 0.1, false)
    }
  })
})