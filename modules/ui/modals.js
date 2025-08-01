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