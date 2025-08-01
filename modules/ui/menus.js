// - - - #project-container - - -
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
          type: 'sep'
        }, // ---
        
        {
          type: 'h4',
          text: 'Theme'
        }, // THEME
        
        {
          type: 'row',
          content: [
            {
              type: 'btn',
              icon: 'palette',
              text: 'Dark',
              group: 'theme',
              active: true
            },
            {
              type: 'btn',
              icon: 'palette',
              text: 'Light',
              group: 'theme'
            },
            {
              type: 'btn',
              icon: 'palette',
              text: 'Soft',
              group: 'theme'
            },
          ]
        } // THEMES
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
        }, // GENERAL
        
        {
          type: 'h4',
          text: 'Orbit Controls'
        }, // ORBIT CONTROLS
        
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
          type: 'sep'
        }, // ---
        
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
        
        {
          type: 'sep'
        }, // ---
        
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
          type: 'row',
          content: [
            {
          type: 'btn',
          text: 'Clear all Projects',
          onclick: el => {
            ui.show('#clear-projects-modal')
            projects.clear()
          }
        }
          ]
        }
      ]
    }, // GENERAL SECTION
  ]
})

ui.build({
  type: 'dropdown',
  id: 'scene-cameras',
  hidden: true,
  autoAlign: true,
}) // #scene-cameras 

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