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

// #no-tester-modal
ui.build({
  type: 'modal',
  hidden: true,
  id: 'no-tester-modal',
  content: [
  {
    type: 'strong',
    icon: 'close',
    text: 'The entered key is not valid, please contact the developer to obtain a special key.'
  }],
  onaccept: (el) => {
    ui.hide(el)
  }
})

// #verified-tester-modal
ui.build({
  type: 'modal',
  hidden: true,
  id: 'verified-tester-modal',
  content: [
  {
    type: 'strong',
    icon: 'check',
    text: 'Congratulations, you can enjoy special features just for testers.'
  }],
  onaccept: (el) => {
    ui.hide(el)
    testerUser = true
    ui.saveToLocal('testerUser', true)
    reload()
  }
})