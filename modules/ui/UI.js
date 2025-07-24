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
  class: 'rad-right',
  content: [
    {
      type: 'btn',
      iconPath: 'assets/icons/material.svg',
      tooltip: 'Material',
      hideElement: '#object-property-panel',
      onclick: (btn) => {
        let sel = selection.selected
        
        if (sel.length > 0) {
          ui.toggle('#material-editor')
          updateMaterials()
          mat.preview(sel[0].material, '#material-preview')
        }
      }
    }, // MATERIAL
    {
      type: 'btn',
      icon: 'sliders',
      tooltip: 'Transform',
      hideElement: '#material-editor, #material-list',
      onclick: (btn) => {
        if (selection.selected.length > 0) {
          ui.toggle('#object-property-panel', 'fade')
          updateProperties()
        }
      }
    }, // PROPERTY
    
    {
      type: 'sep'
    }, // ---
    
    {
      type: 'btn',
      iconPath: 'assets/icons/selection_object.svg',
      group: 'selection-type',
      active: true,
      tooltip: 'Selection: Object'
    }, // OBJECT
    {
      type: 'btn',
      iconPath: 'assets/icons/selection_face.svg',
      group: 'selection-type',
      tooltip: 'Selection: Face'
    }, // FACE
    {
      type: 'btn',
      iconPath: 'assets/icons/selection_segment.svg',
      group: 'selection-type',
      tooltip: 'Selection: Segment'
    }, // EDGE
    {
      type: 'btn',
      iconPath: 'assets/icons/selection_vertex.svg',
      group: 'selection-type',
      tooltip: 'Selection: Vertex'
    }, // VERTEX
  ]
})

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
  ['#side-bar', 'right']
)
ui.borderResize(
  '#object-property-panel'
)

// #material-editor
ui.build({  
  type: 'floating-container',  
  id: 'material-editor',  
  hidden: true,  
  content: [  
    {  
      type: 'div',  
      id: 'material-preview',  
      dropdown: '#material-list',
      onclick: () => {
        mat.renderAll()
      }
    },  // PREVIEW
    
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
          onclick: () => {
            let sel = selection.selected[0]
            mapTarget = 'map'
            mat.listTextures('#texture-list', sel, mapTarget)
          }
        }  
      ]  
    },  // COLOR + MAP

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
          onclick: () => {
            let sel = selection.selected[0]
            mapTarget = 'alphaMap'
            mat.listTextures('#texture-list', sel, mapTarget)
          }
        }
      ]
    },  // OPACITY + MAP
      
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
          onclick: () => {
            let sel = selection.selected[0]
            mapTarget = 'roughnessMap'
            mat.listTextures('#texture-list', sel, mapTarget)
          }
        }  
      ]  
    },  // ROUGHNESS + MAP
      
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
          onclick: () => {
            let sel = selection.selected[0]
            mapTarget = 'metalnessMap'
            mat.listTextures('#texture-list', sel, mapTarget)
          }
        }  
      ]  
    },  // METALNESS + MAP
    
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
          onclick: () => {
            let sel = selection.selected[0]
            mapTarget = 'normalMap'
            mat.listTextures('#texture-list', sel, mapTarget)
          }
        }  
      ]  
    },  // NORMAL + MAP
      
    {  
      type: 'slider',  
      id: 'mat-transmission',  
      attrs: { min: "0", max: "1", step: "0.01", title: "Transmission: " },  
      oninput: (el) => {  
        el.title = `Transmission: ${el.value}`  
        let sel = selection.selected[0]  
        if (sel) sel.material.transmission = parseFloat(el.value)  
      }  
    },  // TRANSMISSION
      
    {  
      type: 'slider',  
      id: 'mat-thickness',  
      attrs: { min: "0", max: "1", step: "0.01", title: "Thickness: " },  
      oninput: (el) => {  
        el.title = `Thickness: ${el.value}`  
        let sel = selection.selected[0]  
        if (sel) sel.material.thickness = parseFloat(el.value)  
      }  
    },  // THICKNESS
      
    {  
      type: 'sep'  
    },  // ---
      
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
    },  // SHADOWS
    
    {  
      type: 'checkbox',  
      id: 'mat-transparent',  
      label: 'Transparent',  
      onchange: (el) => {  
        let sel = selection.selected[0]  
        if (sel) sel.material.transparent = el.checked  
      }  
    },  // TRANSPARENT
    
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
  ['#side-bar', 'right']
)

// #material-list + #texture-list
ui.build({
  type: 'floating-grid',
  autoAlign: true,
  hidden: true,
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
  id: 'texture-list'
})
ui.align(
  '#texture-list',
  ['#material-editor', 'right'],
  ['#material-editor', 'top', true]
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

// - - - #transform-toolbar - - -
ui.build({
  type: 'bar',
  id: 'transform-toolbar',
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
  '#transform-toolbar',
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
  class: 'rad-top',
  content: [
    {
      type: 'btn',
      icon: 'trash-alt',
      tooltip: 'Delete',
      onclick: () => {
        actions.saveState('object', selection.selected[0], 'remove')
        actions.delete(selection.selected)
        selection._deselect()
        transform.detach()
      }
    }, // Delete
    {
      type: 'btn',
      icon: 'clone',
      tooltip: 'Duplicate',
      onclick: () => {
        let obj = actions.duplicate(selection.selected)
      }
    }, // Clone
    {
      type: 'btn',
      icon: 'eye',
      tooltip: 'Hide',
      onclick: () => {
        let obj = actions.hide(selection.selected[0])
        selection._deselect()
        outliner.refresh()
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
      icon: 'bone',
      text: 'Bone',
      
      
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
        let obj = objects.addOBJMesh('/assets/models/suzanne.obj')
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
            text: 'save'
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
            }
          ]
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
            }
          ]
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
            }
          ]
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
            }
          ]
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
            }
          ]
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
            }
          ]
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
            }
          ]
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
            }
          ]
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
            }
          ]
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
        },  // AUTO SELECT
        
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


// - - - ALL MODALS - - -
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
    }
  ]
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
    }
  ]
})


// --- FEEDBACK ---
ui.build({
  type: 'div',
  id: 'overlay',
  hidden: true,
  onclick: el => hideAll()
})

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
              text: `Nexel3d v${configs.nexel.version}`
            },
            {
              icon: 'tools',
              type: 'strong',
              style: {
                color: '#29f'
              },
              text: `${configs.nexel.updateName}`
            }
          ]
        }
      ]
    },
    
    {
      type: 'sep'
    },
    
    {
      type: 'h5',
      style: {
        textAlign: 'justify'
      },
      text: `Bienvenido a la version ${configs.nexel.version}, esta es solo una version de prueba, por lo que puedes encontrar varios problemas, en ese caso reportalos en el servidor Oficial`
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
          text: 'Reinicio TOTAL'
        },
        {
          type: 'li',
          text: 'Se ha reiniciado el proyecto junto a sus características funciones en busca de rendimiento, calidad y mejor flujo de trabajo, ademas de refaccion completa de la interfaz'
        },
        
        {
          type: 'sep'
        },
        
        {
          type: 'h5',
          text: 'Funciones iniciales'
        },
        
        {
          type: 'li',
          text: 'Navegacion de interfaz'
        },
        {
          type: 'li',
          text: 'Seleccion y transformacion de objetos'
        },
        {
          type: 'li',
          text: 'Edicion de materiales'
        },
        {
          type: 'li',
          text: 'Guardado de Proyectos'
        },
        {
          type: 'li',
          text: 'Linea de tiempo y animacion'
        },
        {
          type: 'li',
          text: 'Renderizado de imagen'
        },
        {
          type: 'li',
          text: 'Renderizado y guardado de imagenes'
        },
        {
          type: 'li',
          text: 'Configuraciones variadas para funciones'
        },
        
        {
          type: 'sep'
        },
        
        {
          type: 'h5',
          text: 'Proximas Funciones ASEGURADAS'
        },
        
        {
          type: 'li',
          text: 'Sombras Suaves'
        },
        {
          type: 'li',
          text: 'Oclusion Ambiental'
        },
        {
          type: 'li',
          text: 'Funciones de edicion de keyframes'
        },
      ]
    },
    
    {
      type: 'row',
      content: [
        {
          type: 'btn',
          content: [{ type: 'i', class: 'fab fa-discord', style: { color: '#45f', fontSize: '1.5em' } }],
          text: 'Discord',
          onclick: el => {
            
          }
        },
        {
          type: 'btn',
          content: [{ type: 'i', class: 'fab fa-youtube', style: { color: '#f32', fontSize: '1.5em' } }],
          text: 'Youtube',
          onclick: el => {
            
          }
        },
      ]
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