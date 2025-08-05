// --- FEEDBACK ---
ui.build({
  type: 'div',
  id: 'overlay',
  hidden: true,
  onclick: el => hideAll()
})

// #splash-screen
testerUser = ui.loadFromLocal('testerUser')

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
      type: 'btn',
      class: 'close',
      text: '×',
      onclick: () =>  {
        ui.hide('#splash-screen, #overlay')
      }
    }, // X
    
    {
      type: 'row',
      style: {
        marginBottom: '10px'
      },
      content: [
      {
        type: 'img',
        class: 'logo',
        src: 'assets/images/logo_vector.svg'
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
          text: `Nexel ${configs.nexel.version}`
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
    }, // LOGO + VERSION
    
    {
      type: 'strong',
      class: 'special',
      icon: 'check',
      text: 'Tester Functions Enabled',
      hidden: !testerUser,
    },
    
    {
      type: 'h4',
      text: "What's new? :",
      decoration: 'dropdown',
      class: 'collapsable',
      toggleElement: '#splash-content'
    }, // WHAT'S NEW ?
    
    {
      type: 'ul',
      id: 'splash-content',
      hidden: true,
      content: [
        
        {
          type: 'h5',
          text: 'Added'
        }, // ADDED
        
        {
          type: 'li',
          text: '- Special Keys for Testers'
        },
        {
          type: 'li',
          text: '- Interface Themes'
        },
        {
          type: 'li',
          text: '- More edit mode tools'
        },
        {
          type: 'li',
          class: 'special',
          text: '- Model import .obj, .gltf/.glb (TESTER)'
        },
        {
          type: 'li',
          class: 'special',
          text: '- Soft Shadows (TESTER)'
        },
        
        {
          type: 'sep'
        }, // ---
        
        {
          type: 'h5',
          text: 'Fixed'
        }, // FIXED
        
        {
          type: 'li',
          text: '- Objects faces disconnected'
        },
        {
          type: 'li',
          text: '- Uncontrolled object transformation (position and scale)'
        },
        
        {
          type: 'sep'
        }, // ---
        
        {
          type: 'h5',
          text: 'Removed'
        }, // REMOVED
        
        {
          type: 'li',
          text: '- Fullscreen Button (TEMPORARY)'
        },
        
        {
          type: 'sep'
        }, // ---
        
        {
          type: 'h5',
          text: 'Thanks to the testers'
        }, // THANK TO THE TESTERS
        
        {
          type: 'li',
          class: 'special',
          text: 'GIAL --- COCHU_444 --- A.A.K --- DECA --- BROCK --- VERDESITOO --- WILLINHO --- DIZZEY --- CONGRAY_MC'
        }
      ]
    }, // WHAT'S NEW 'CONTENT'
    
    {
      type: 'sep'
    }, // ---
    
    {
      type: 'row',
      hidden: testerUser,
      content: [
        {
          type: 'text',
          label: 'Tester Key',
          attrs: {
            placeholder: '...special key',
            id: 'testerKey'
          },
          content: [
            {
              type: 'btn',
              icon: 'check',
              text: 'Verify',
              accent: true,
              onclick(el) {
                let key = ui.get('#testerKey').value
                if (testerCodes.includes(key)) {
                  ui.show('#verified-tester-modal')
                } else {
                  ui.show('#no-tester-modal')
                }
              }
            }
          ]
        }
      ]
    }, // TESTER KEY
    
    {
      type: 'sep',
      hidden: testerUser,
    }, // ---
    
    {
      type: 'row',
      content: [
      {
        type: 'strong',
        text: 'by CubeMania MC'
      }]
    }, // BY CUBEMANIA
    
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
          window.open('https://discord.gg/CFRJvQqvZ2')
        }
      },
      {
        type: 'btn',
        content: [
          { type: 'i', class: 'fab fa-youtube', style: { color: '#f33', fontSize: '1.5em' } }
        ],
        text: 'YouTube',
        onclick: el => {
          window.open('https://youtube.com/@cubemania_mc_4558?si=qjsaAllowZuq5WGx')
        }
      }]
    }, // LIKS
  ]
})

// SOUNDS
let buttons = document.querySelectorAll('.btn')
buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (configs.viewport.sounds) {
      ui.playSound('assets/sounds/click.mp3', 0.1, false)
    }
  })
})