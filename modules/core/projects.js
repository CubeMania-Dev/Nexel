class Projects {
	constructor(scene, container) {
		this.scene = scene
		this.projectContainer = typeof container === 'string' ? document.querySelector(container) : container
		this.projects = []
		this.db = null
		this.initDB()
		this.onSave = () => {}
		this.onLoad = () => {}
	}
	
	initDB() {
		const request = indexedDB.open('ProjectsDB', 1)
		request.onupgradeneeded = (event) => {
			const db = event.target.result
			if (!db.objectStoreNames.contains('projects')) {
				db.createObjectStore('projects', { keyPath: 'name' })
			}
		}
		request.onsuccess = (event) => {
			this.db = event.target.result
			this.loadAllFromDB()
		}
		request.onerror = () => {
			console.error('IndexedDB init error')
		}
	}
	
saveToDB(project) {
	if (!this.db) return
	
	renderer.render(project, camera)
	const preview = canvas.toDataURL('image/jpeg', 0.7)
	
	const transaction = this.db.transaction('projects', 'readwrite')
	const store = transaction.objectStore('projects')
	store.put({
		name: project.name,
		date: project.userData.date,
		sceneJSON: project.toJSON(),
		preview
	})
	transaction.oncomplete = () => {
		this.loadAllFromDB()
	}
	transaction.onerror = () => {
		console.error('Error saving project to DB')
	}
}
	
	loadAllFromDB() {
		if (!this.db) return
		const transaction = this.db.transaction('projects', 'readonly')
		const store = transaction.objectStore('projects')
		const request = store.getAll()
		request.onsuccess = () => {
			this.projects = request.result.map(p => {
				const scene = new THREE.ObjectLoader().parse(p.sceneJSON)
				scene.name = p.name
				scene.userData.date = p.date
				scene.userData.preview = p.preview || ''
				return scene
			})
			this.refreshUI()
		}
		request.onerror = () => {
			console.error('Error loading projects from DB')
		}
	}
	
	refreshUI() {
		this.projectContainer.innerHTML = ''
		this.projects.forEach(p => {
			const element = ui.build({
				type: 'div',
				text: p.name,
				class: 'proj'
			})
			if (p.userData.preview) {
				element.style.backgroundImage = `url(${p.userData.preview})`
				element.style.backgroundSize = 'cover'
				element.style.backgroundPosition = 'center'
			}
			element.onclick = () => this.load(p.name)
			this.projectContainer.appendChild(element)
		})
	}
	
	uniqueName(name) {
		let newName = name
		let i = 1
		while (this.projects.find(p => p.name === newName)) {
			newName = `${name} (${i})`
			i++
		}
		return newName
	}
	
	preserveObject(obj) {
		obj.userData.preserve = true
	}
	
	save(name) {
		this.onSave()
		let finalName = this.uniqueName(name)
		const project = new THREE.Scene()
		project.name = finalName
		project.userData.date = new Date().toLocaleDateString('es-ES')
		
		this.scene.children.forEach(child => {
			if (!child.userData.preserve) {
				project.add(child.clone())
			}
		})
		
		this.projects.push(project)
		this.saveToDB(project)
	}
	
	overwrite(name) {
		this.onSave()
		
		const existingIndex = this.projects.findIndex(p => p.name === name)
		const project = new THREE.Scene()
		project.name = name
		project.userData.date = new Date().toLocaleDateString('es-ES')
	
		this.scene.children.forEach(child => {
			if (!child.userData.preserve) {
				project.add(child.clone())
			}
		})
	
		if (existingIndex !== -1) {
			this.projects[existingIndex] = project
		} else {
			this.projects.push(project)
		}
	
		this.saveToDB(project)
	}
	
	load(name) {
		const found = this.projects.find(p => p.name === name)
		if (found) {
			this.scene.children
				.filter(c => !c.userData.preserve)
				.forEach(c => this.scene.remove(c))
			
			found.children.forEach(child => {
				this.scene.add(child.clone())
			})
		}
		
		this.onLoad()
	}
	
	list() {
		return this.projects.map(p => ({ name: p.name, date: p.userData.date }))
	}
	
	delete(name) {
		if (!this.db) return
		const transaction = this.db.transaction('projects', 'readwrite')
		const store = transaction.objectStore('projects')
		store.delete(name).onsuccess = () => {
			this.projects = this.projects.filter(p => p.name !== name)
			this.refreshUI()
		}
	}
	
	clear() {
		if (!this.db) return
		const transaction = this.db.transaction('projects', 'readwrite')
		const store = transaction.objectStore('projects')
		const clearRequest = store.clear()
		clearRequest.onsuccess = () => {
			this.projects = []
			this.refreshUI()
		}
		clearRequest.onerror = () => {
			console.error('Error clearing projects from DB')
		}
	}
}