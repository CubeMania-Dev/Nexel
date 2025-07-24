class SelectionSystem {
	constructor(camera, scene) {
		this.camera = camera
		this.scene = scene
		this.raycaster = new THREE.Raycaster()
		this.pointer = new THREE.Vector2()
		this.moved = false
		this.selected = []
		this.onSelect = null
		this.onDeselect = null
		this.ignoredUserData = []
		this.mode = 'single'
		
		window.addEventListener('pointerdown', () => (this.moved = false))
		window.addEventListener('pointermove', () => (this.moved = true))
		window.addEventListener('pointerup', e => {
			if (!this.moved) this.select(e.clientX, e.clientY)
		})
	}
	
	setMode(mode) {
		this.mode = mode
		if (mode === 'single' && this.selected.length > 1) {
			const last = this.selected[this.selected.length - 1]
			this.selected = [last]
			if (this.onSelect) this.onSelect(last)
		}
	}
	
	select(x, y) {
		const element = document.elementFromPoint(x, y)
		if (element && element.id !== 'viewport') return
		
		this.pointer.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1)
		this.raycaster.setFromCamera(this.pointer, this.camera)
		
		const meshes = []
		const lights = []
		
		this.scene.traverse(obj => {
			if (this.ignoredUserData.some(key => obj.userData[key])) return
			if (obj.isMesh) meshes.push(obj)
			else if (obj.isLight && obj.type !== 'AmbientLight') lights.push(obj)
		})
		
		const meshHit = this.raycaster.intersectObjects(meshes, true)[0]
		if (meshHit) return this._select(meshHit.object)
		
		const threshold = 0.3
		const origin = this.raycaster.ray.origin
		const dir = this.raycaster.ray.direction
		let closest = null
		let closestDist = Infinity
		
		for (const light of lights) {
			const pos = new THREE.Vector3()
			light.getWorldPosition(pos)
			const toLight = pos.clone().sub(origin)
			const proj = toLight.dot(dir)
			if (proj < 0) continue
			const pointOnRay = dir.clone().multiplyScalar(proj).add(origin)
			const dist = pos.distanceTo(pointOnRay)
			if (dist < threshold && proj < closestDist) {
				closestDist = proj
				closest = light
			}
		}
		
		if (closest) return this._select(closest)
		this._deselect()
	}
	
	_select(obj) {
		if (this.mode === 'single') {
			if (this.selected[0] !== obj) {
				this.selected = [obj]
				if (this.onSelect) this.onSelect(obj)
			}
		} else {
			if (!this.selected.includes(obj)) {
				this.selected.push(obj)
				if (this.onSelect) this.onSelect(obj)
			}
		}
	}
	
	_deselect() {
		if (this.selected.length > 0) {
			this.selected = []
			if (this.onDeselect) this.onDeselect()
		}
	}
}