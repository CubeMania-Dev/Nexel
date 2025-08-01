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
      onclick: () => {
        if (selected) {
          ui.toggle('#object-property-panel')
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
  ['#transform-bar', 'bottom'],
  ['#animation-timeline', 'top']
)

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

// - - - #view-cube - - -
ui.build({
  type: 'div',
  id: 'view-cube'
})
ui.align(
  '#view-cube',
  ['#outliner', 'left'],
  ['#top-bar', 'bottom']
)

// - - - #outliner - - -
ui.build({
  type: 'floating-container',
  id: 'outliner',
})
ui.align(
  '#outliner',
  ['#top-bar', 'bottom'],
  ['body', 'right', true]
)
ui.borderResize(
  '#outliner'
)

// - - - #material-editor - - -
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

// #material-list
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

// #texture-list
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


// - - - #object-property-panel - - -
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
      hidden: true,
      onclick: () => {
        verifyWeights(selected)
      }
    },
  ]
})