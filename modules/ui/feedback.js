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
    }, // LOGO + VERSION
    
    {
      type: 'sep'
    }, // ---
    
    {
      type: 'h5',
      style: {
        textAlign: 'justify'
      },
      text: `Welcome to version ${configs.nexel.version}. This is only a test version, so you may encounter some issues. If so, please report them on the official server.`
    }, // WELCOME TEXT
    
    {
      type: 'sep'
    }, // ---
    
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
        { type: 'li', text: 'Advanced keyframe editing' },
        
        {
          type: 'sep'
        },
        
        {
          type: 'h5',
          text: 'Thanks to the testers'
        },
        
        {
          type: 'li',
          text: 'GIAL --- COCHU_444 --- A.A.K --- DECA --- BROCK --- VERDESITOO --- WILLINHO --- DIZZEY --- CONGRAY_MC'
        }
      ]
    }, // WHAT'S NEW 'CONTENT'
    
    {
      type: 'row',
      content: [
      {
        type: 'strong',
        text: 'by CubeMania MC'
      }]
    }, // BY CUBEMANIA
    
    {
      type: 'sep'
    }, // ---
    
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