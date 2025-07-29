const translations = {
  en: {
    Delete: "Delete",
    Extrude: 'Extrude',
  },
  es: {
    Delete: "Eliminar",
    Extrude: 'Extruir',
  }
}

function setLanguage(lang) {
  const elements = document.querySelectorAll('*')
  elements.forEach(el => {
    if (el.children.length > 0) return
    const text = el.textContent.trim()
    if (translations[lang] && translations[lang][text]) {
      el.textContent = translations[lang][text]
    }
  })
}

setLanguage('en')