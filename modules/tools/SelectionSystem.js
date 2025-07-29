class SelectionSystem {
	constructor(camera, scene) {
		this.camera = camera
		this.scene = scene
		this.raycaster = new THREE.Raycaster()
		this.pointer = new THREE.Vector2()
		this.moved = false
		
		this.selected = []
		this.selectedFace = null
		this.selectedSegment = null
		this.selectedVertex = null
		
		this.onSelect = (obj) => {}
		this.onDeselect = (obj) => {}
		this.onModeChange = (mode) => {}
		this.onTypeChange = (type) => {}
		
		this.ignoredUserData = []
		
		this.mode = 'single'
		this.type = 'object'
		this.filter = 'all'
		
		this.faceHelper = null
		this.segmentHelper = null
		this.vertexHelper = null
		
		window.addEventListener('pointerdown', () => (this.moved = false))
		window.addEventListener('pointermove', () => (this.moved = true))
		window.addEventListener('pointerup', e => {
			if (!this.moved) this.select(e.clientX, e.clientY)
		})
	}
}

/* MODE (SINGLE - MULTI) */
SelectionSystem.prototype.setMode = function(mode) {
	this.mode = mode
	if (mode === 'single' && this.selected.length > 1) {
		const last = this.selected[this.selected.length - 1]
		this.selected = [last]
		if (this.onSelect) this.onSelect(last)
		
		this._deselect()
		this.onModeChange(mode)
	}
}

/* TYPE (OBJECT - FACE - SEGMENT - VERTEX) */
SelectionSystem.prototype.setType = function(type) {
	const validTypes = ['object', 'face', 'segment', 'vertex']
	if (validTypes.includes(type)) {
		this.type = type
		
		this._deselect()
		this.onTypeChange(type)
	}
}

/* FILTER (ALL, BONE, CAMERA, LIGHT, MESH) */
SelectionSystem.prototype.setFilter = function(mode) {
	const valid = ['all', 'bone', 'camera', 'light', 'mesh'];
	this.filter = valid.includes(mode) ? mode : 'all';
};


/* SELECTION */
SelectionSystem.prototype.select = function(x, y) {
	const element = document.elementFromPoint(x, y)
	if (element && element.id !== 'viewport') return

	this.pointer.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1)
	this.raycaster.setFromCamera(this.pointer, this.camera)

	if (this.type === 'object') {
		this._selectObject()
	} else if (this.type === 'face') {
		this._selectFace()
	} else if (this.type === 'segment') {
		this._selectSegment()
	} else if (this.type === 'vertex') {
		this._selectVertex()
	}
}

/* SELECTION TYPES */
SelectionSystem.prototype._selectObject = function() {
	const meshes = [];
	const bones = [];
	const lights = [];
	const cameras = [];
	
	const isIgnored = obj => {
		while (obj) {
			if (this.ignoredUserData.some(key => obj.userData[key])) return true;
			obj = obj.parent;
		}
		return false;
	};
	
	this.scene.traverse(obj => {
		if (isIgnored(obj)) return;
		if (obj.isBone) bones.push(obj);
		else if (obj.isMesh) meshes.push(obj);
		else if (obj.isLight && obj.type !== 'AmbientLight') lights.push(obj);
		else if (obj.isCamera && obj !== this.camera) cameras.push(obj);
	});
	
	const threshold = 0.3;
	const origin = this.raycaster.ray.origin;
	const dir = this.raycaster.ray.direction;
	
	if (this.filter === 'bone' || this.filter === 'all') {
		let closestBone = null;
		let closestBoneDist = Infinity;
		for (const bone of bones) {
			const pos = new THREE.Vector3();
			bone.getWorldPosition(pos);
			const toBone = pos.clone().sub(origin);
			const proj = toBone.dot(dir);
			if (proj < 0) continue;
			const pointOnRay = dir.clone().multiplyScalar(proj).add(origin);
			const dist = pos.distanceTo(pointOnRay);
			if (dist < threshold && proj < closestBoneDist) {
				closestBoneDist = proj;
				closestBone = bone;
			}
		}
		if (closestBone) return this._select(closestBone);
	}
	
	if (this.filter === 'light' || this.filter === 'all') {
		let closestLight = null;
		let closestLightDist = Infinity;
		for (const light of lights) {
			const pos = new THREE.Vector3();
			light.getWorldPosition(pos);
			const toLight = pos.clone().sub(origin);
			const proj = toLight.dot(dir);
			if (proj < 0) continue;
			const pointOnRay = dir.clone().multiplyScalar(proj).add(origin);
			const dist = pos.distanceTo(pointOnRay);
			if (dist < threshold && proj < closestLightDist) {
				closestLightDist = proj;
				closestLight = light;
			}
		}
		if (closestLight) return this._select(closestLight);
	}
	
	if (this.filter === 'mesh' || this.filter === 'all') {
		const meshHit = this.raycaster.intersectObjects(meshes, true)[0];
		if (meshHit) return this._select(meshHit.object);
	}
	
	if (this.filter === 'camera' || this.filter === 'all') {
		let closestCamera = null;
		let closestCameraDist = Infinity;
		for (const camera of cameras) {
			const pos = new THREE.Vector3();
			camera.getWorldPosition(pos);
			const toCamera = pos.clone().sub(origin);
			const proj = toCamera.dot(dir);
			if (proj < 0) continue;
			const pointOnRay = dir.clone().multiplyScalar(proj).add(origin);
			const dist = pos.distanceTo(pointOnRay);
			if (dist < threshold && proj < closestCameraDist) {
				closestCameraDist = proj;
				closestCamera = camera;
			}
		}
		if (closestCamera) return this._select(closestCamera);
	}
	
	this._deselect();
};
SelectionSystem.prototype._selectFace = function() {
	const meshes = []
	this.scene.traverse(obj => {
		if (this.ignoredUserData.some(key => obj.userData[key])) return
		if (obj.isMesh && obj !== this.faceHelper) meshes.push(obj)
	})

	const hit = this.raycaster.intersectObjects(meshes, true)[0]
	if (!hit || !hit.object.isMesh) return this._deselect()

	const mesh = hit.object
	const geometry = mesh.geometry
	if (!geometry || !geometry.isBufferGeometry) return this._deselect()

	const posAttr = geometry.attributes.position
	const isIndexed = !!geometry.index
	const index = isIndexed ? geometry.index.array : null
	const faceIndex = hit.faceIndex

	const getTri = i => isIndexed ?
		[index[i * 3], index[i * 3 + 1], index[i * 3 + 2]] :
		[i * 3, i * 3 + 1, i * 3 + 2]

	const getVertex = i => new THREE.Vector3().fromBufferAttribute(posAttr, i)
	const samePosition = (a, b) => getVertex(a).equals(getVertex(b))
	const shareTwo = (a, b) => a.filter(ai => b.some(bi => isIndexed ? ai === bi : samePosition(ai, bi))).length === 2

	const triA = getTri(faceIndex)
	const vertsA = triA.map(i => getVertex(i).applyMatrix4(mesh.matrixWorld))
	const normalA = new THREE.Vector3().subVectors(vertsA[1], vertsA[0])
		.cross(new THREE.Vector3().subVectors(vertsA[2], vertsA[0])).normalize()

	let pairIndex = null
	const triCount = isIndexed ? index.length / 3 : posAttr.count / 3
	let bestScore = -1

	for (let i = 0; i < triCount; i++) {
		if (i === faceIndex) continue
		const triB = getTri(i)
		if (!shareTwo(triA, triB)) continue
		const vertsB = triB.map(j => getVertex(j).applyMatrix4(mesh.matrixWorld))
		const normalB = new THREE.Vector3().subVectors(vertsB[1], vertsB[0])
			.cross(new THREE.Vector3().subVectors(vertsB[2], vertsB[0])).normalize()
		const score = Math.abs(normalA.dot(normalB))
		if (score > bestScore) {
			bestScore = score
			pairIndex = i
		}
	}

	if (!Array.isArray(this.selectedFace)) this.selectedFace = []
	if (this.mode === 'single') this.selectedFace.length = 0

	const exists = this.selectedFace.find(f => f.faceIndex === faceIndex && f.pairIndex === pairIndex)
	if (exists) {
		this.selectedFace = this.selectedFace.filter(f => !(f.faceIndex === faceIndex && f.pairIndex === pairIndex))
	} else {
		this.selectedFace.push({ faceIndex, pairIndex })
	}

	if (this.selectedFace.length === 0) {
		this._deselect()
		return
	}

	const allVerts = []
	for (const { faceIndex, pairIndex } of this.selectedFace) {
		allVerts.push(...getTri(faceIndex).map(i => getVertex(i).applyMatrix4(mesh.matrixWorld)))
		if (pairIndex !== null) {
			allVerts.push(...getTri(pairIndex).map(i => getVertex(i).applyMatrix4(mesh.matrixWorld)))
		}
	}

	const center = allVerts.reduce((sum, v) => sum.add(v), new THREE.Vector3()).multiplyScalar(1 / allVerts.length)
	const local = allVerts.map(v => v.clone().sub(center))
	const positions = new Float32Array(local.flatMap(v => [v.x, v.y, v.z]))
	const indices = Array.from({ length: local.length }, (_, i) => i)

	let helper = this.faceHelper
	if (!helper) {
		const geom = new THREE.BufferGeometry()
		const mat = new THREE.MeshBasicMaterial({
			color: 0x0080ff,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.5,
			depthTest: false
		})
		helper = new THREE.Mesh(geom, mat)
		helper.userData._faceHelper = true
		helper.userData.ignored = true
		this.faceHelper = helper
		this.scene.add(helper)
	}

	helper.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
	helper.geometry.setIndex(indices)
	helper.geometry.attributes.position.needsUpdate = true
	helper.position.copy(center)

	if (this.mode === 'single') {
		this.selected = [helper]
	} else if (!this.selected.includes(helper)) {
		this.selected.push(helper)
	}

	this.selectedMesh = mesh
	if (this.onSelect) this.onSelect(helper)
}
SelectionSystem.prototype._selectSegment = function() {
	const meshes = []
	this.scene.traverse(obj => {
		if (this.ignoredUserData.some(key => obj.userData[key])) return
		if (obj.isMesh) meshes.push(obj)
	})

	const hit = this.raycaster.intersectObjects(meshes, true)[0]
	if (!hit || !hit.object.isMesh) return this._deselect()

	const mesh = hit.object
	const geometry = mesh.geometry
	if (!geometry || !geometry.isBufferGeometry) return this._deselect()

	const posAttr = geometry.attributes.position
	const isIndexed = !!geometry.index
	const index = isIndexed ? geometry.index.array : null
	const faceIndex = hit.faceIndex

	const getTri = i => isIndexed ?
		[index[i * 3], index[i * 3 + 1], index[i * 3 + 2]] :
		[i * 3, i * 3 + 1, i * 3 + 2]

	const getVertex = i => new THREE.Vector3().fromBufferAttribute(posAttr, i)
	const tri = getTri(faceIndex)
	const worldVerts = tri.map(i => getVertex(i).applyMatrix4(mesh.matrixWorld))

	const edges = [
		{ i1: tri[0], i2: tri[1], v1: worldVerts[0], v2: worldVerts[1] },
		{ i1: tri[1], i2: tri[2], v1: worldVerts[1], v2: worldVerts[2] },
		{ i1: tri[2], i2: tri[0], v1: worldVerts[2], v2: worldVerts[0] }
	]

	const rayOrigin = this.raycaster.ray.origin
	const rayDir = this.raycaster.ray.direction
	const threshold = 0.2

	let closest = null
	let minDist = Infinity

	for (const edge of edges) {
		const segCenter = new THREE.Vector3().addVectors(edge.v1, edge.v2).multiplyScalar(0.5)
		const toSeg = segCenter.clone().sub(rayOrigin)
		const proj = toSeg.dot(rayDir)
		if (proj < 0) continue

		const pointOnRay = rayDir.clone().multiplyScalar(proj).add(rayOrigin)
		const dist = pointOnRay.distanceTo(segCenter)

		if (dist < threshold && dist < minDist) {
			minDist = dist
			closest = edge
		}
	}

	if (!closest) return this._deselect()

	if (!Array.isArray(this.selectedSegment)) this.selectedSegment = []
	if (this.mode === 'single') this.selectedSegment.length = 0

	const exists = this.selectedSegment.find(s => (
		(s.i1 === closest.i1 && s.i2 === closest.i2) || (s.i1 === closest.i2 && s.i2 === closest.i1)
	))

	if (exists) {
		this.selectedSegment = this.selectedSegment.filter(s => !(
			(s.i1 === closest.i1 && s.i2 === closest.i2) || (s.i1 === closest.i2 && s.i2 === closest.i1)
		))
	} else {
		this.selectedSegment.push({ i1: closest.i1, i2: closest.i2 })
	}

	if (this.selectedSegment.length === 0) {
		this._deselect()
		return
	}

	const allVerts = []
	for (const { i1, i2 } of this.selectedSegment) {
		allVerts.push(getVertex(i1).applyMatrix4(mesh.matrixWorld))
		allVerts.push(getVertex(i2).applyMatrix4(mesh.matrixWorld))
	}

	const center = allVerts.reduce((sum, v) => sum.add(v), new THREE.Vector3()).multiplyScalar(1 / allVerts.length)
	const local = allVerts.map(v => v.clone().sub(center))
	const positions = new Float32Array(local.flatMap(v => [v.x, v.y, v.z]))
	const indices = Array.from({ length: local.length }, (_, i) => i)

	let helper = this.segmentHelper
	if (!helper) {
		const geom = new THREE.BufferGeometry()
		const mat = new THREE.LineBasicMaterial({
			color: 0x0080ff,
			linewidth: 4
		})
		helper = new THREE.LineSegments(geom, mat)
		helper.userData._segmentHelper = true
		helper.userData.ignored = true
		this.segmentHelper = helper
		this.scene.add(helper)
	}

	helper.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
	helper.geometry.setIndex(indices)
	helper.geometry.attributes.position.needsUpdate = true
	helper.position.copy(center)

	if (this.mode === 'single') {
		this.selected = [helper]
	} else if (!this.selected.includes(helper)) {
		this.selected.push(helper)
	}

	this.selectedMesh = mesh
	if (this.onSelect) this.onSelect(helper)
}
SelectionSystem.prototype._selectVertex = function() {
	const meshes = []
	this.scene.traverse(obj => {
		if (this.ignoredUserData.some(key => obj.userData[key])) return
		if (obj.isMesh && obj !== this.vertexHelper) meshes.push(obj)
	})
	
	const hit = this.raycaster.intersectObjects(meshes, true)[0]
	if (!hit || !hit.object.isMesh) return this._deselect()
	
	const mesh = hit.object
	const geometry = mesh.geometry
	if (!geometry || !geometry.isBufferGeometry) return this._deselect()
	
	const posAttr = geometry.attributes.position
	const isIndexed = !!geometry.index
	const indexArray = isIndexed ? geometry.index.array : null
	
	let vertexIndex = null
	
	if (isIndexed && hit.faceIndex !== undefined) {
		const i = hit.faceIndex * 3
		const i1 = indexArray[i]
		const i2 = indexArray[i + 1]
		const i3 = indexArray[i + 2]
		const a = new THREE.Vector3().fromBufferAttribute(posAttr, i1).applyMatrix4(mesh.matrixWorld)
		const b = new THREE.Vector3().fromBufferAttribute(posAttr, i2).applyMatrix4(mesh.matrixWorld)
		const c = new THREE.Vector3().fromBufferAttribute(posAttr, i3).applyMatrix4(mesh.matrixWorld)
		const d1 = hit.point.distanceToSquared(a)
		const d2 = hit.point.distanceToSquared(b)
		const d3 = hit.point.distanceToSquared(c)
		const min = Math.min(d1, d2, d3)
		vertexIndex = min === d1 ? i1 : min === d2 ? i2 : i3
	} else {
		// For non-indexed geometry, find closest vertex by brute force
		let closestDist = Infinity
		let closestIndex = null
		const localPoint = hit.point.clone().applyMatrix4(new THREE.Matrix4().copy(mesh.matrixWorld).invert())
		for (let i = 0; i < posAttr.count; i++) {
			const v = new THREE.Vector3().fromBufferAttribute(posAttr, i)
			const dist = v.distanceToSquared(localPoint)
			if (dist < closestDist) {
				closestDist = dist
				closestIndex = i
			}
		}
		vertexIndex = closestIndex
	}
	
	if (vertexIndex === null) return this._deselect()
	
	if (!Array.isArray(this.selectedVertex)) this.selectedVertex = []
	if (this.mode === 'single') this.selectedVertex.length = 0
	
	const exists = this.selectedVertex.find(v => v.vertexIndex === vertexIndex)
	if (exists) {
		this.selectedVertex = this.selectedVertex.filter(v => v.vertexIndex !== vertexIndex)
	} else {
		this.selectedVertex.push({ vertexIndex })
	}
	
	if (this.selectedVertex.length === 0) {
		this._deselect()
		return
	}
	
	const worldPositions = this.selectedVertex.map(({ vertexIndex }) =>
		new THREE.Vector3().fromBufferAttribute(posAttr, vertexIndex).applyMatrix4(mesh.matrixWorld)
	)
	
	const center = worldPositions.reduce((sum, v) => sum.add(v), new THREE.Vector3()).multiplyScalar(1 / worldPositions.length)
	const local = worldPositions.map(v => v.clone().sub(center))
	const positions = new Float32Array(local.flatMap(v => [v.x, v.y, v.z]))
	
	let helper = this.vertexHelper
	if (!helper) {
		const geom = new THREE.BufferGeometry()
		const mat = new THREE.PointsMaterial({
			color: 0x0080ff,
			size: 8,
			map: new THREE.TextureLoader().load('./assets/icons/dot.svg'),
			sizeAttenuation: false,
			transparent: true,
		})
		helper = new THREE.Points(geom, mat)
		helper.userData._vertexHelper = true
		helper.userData.ignored = true
		this.vertexHelper = helper
		this.scene.add(helper)
	}
	
	helper.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
	helper.geometry.attributes.position.needsUpdate = true
	helper.position.copy(center)
	
	if (this.mode === 'single') {
		this.selected = [helper]
	} else if (!this.selected.includes(helper)) {
		this.selected.push(helper)
	}
	
	this.selectedMesh = mesh
	if (this.onSelect) this.onSelect(helper)
}

SelectionSystem.prototype.updateSelected = function() {
	if (!this.selected?.length || !this.selectedMesh || !this.selectedMesh.geometry || !this.selectedMesh.geometry.attributes.position) return
	if (
		!Array.isArray(this.selectedFace) &&
		!Array.isArray(this.selectedSegment) &&
		!Array.isArray(this.selectedVertex)
	) return
	
	const mesh = this.selectedMesh
	const geometry = mesh.geometry
	const posAttr = geometry.attributes.position
	const isIndexed = !!geometry.index
	const indexArray = isIndexed ? geometry.index.array : null
	const inverseMatrix = new THREE.Matrix4().copy(mesh.matrixWorld).invert()

	const getIndicesFromFace = i => isIndexed ?
		[indexArray[i * 3], indexArray[i * 3 + 1], indexArray[i * 3 + 2]] :
		[i * 3, i * 3 + 1, i * 3 + 2]

	if (this.type === 'face' && this.faceHelper && Array.isArray(this.selectedFace)) {
		const helper = this.faceHelper
		const helperAttr = helper.geometry.attributes.position
		const helperMatrix = new THREE.Matrix4().compose(helper.position, helper.quaternion, helper.scale)

		const allIndices = []
		this.selectedFace.forEach(({ faceIndex, pairIndex }) => {
			allIndices.push(...getIndicesFromFace(faceIndex))
			if (pairIndex !== null) {
				allIndices.push(...getIndicesFromFace(pairIndex))
			}
		})

		const worldPositions = []
		for (let i = 0; i < helperAttr.count; i++) {
			const vx = helperAttr.getX(i)
			const vy = helperAttr.getY(i)
			const vz = helperAttr.getZ(i)
			worldPositions.push(new THREE.Vector3(vx, vy, vz).applyMatrix4(helperMatrix))
		}

		const localPositions = worldPositions.map(v => v.clone().applyMatrix4(inverseMatrix))

		for (let i = 0; i < allIndices.length; i++) {
			const idx = allIndices[i]
			const v = localPositions[i]
			posAttr.setXYZ(idx, v.x, v.y, v.z)
		}
	} 
	else if (this.type === 'segment' && this.segmentHelper && Array.isArray(this.selectedSegment)) {
		const helper = this.segmentHelper
		const helperAttr = helper.geometry.attributes.position
		const helperMatrix = new THREE.Matrix4().compose(helper.position, helper.quaternion, helper.scale)

		const allIndices = []
		this.selectedSegment.forEach(({ i1, i2 }) => {
			allIndices.push(i1, i2)
		})

		const worldPositions = []
		for (let i = 0; i < helperAttr.count; i++) {
			const vx = helperAttr.getX(i)
			const vy = helperAttr.getY(i)
			const vz = helperAttr.getZ(i)
			worldPositions.push(new THREE.Vector3(vx, vy, vz).applyMatrix4(helperMatrix))
		}

		const localPositions = worldPositions.map(v => v.clone().applyMatrix4(inverseMatrix))

		for (let i = 0; i < allIndices.length; i++) {
			const idx = allIndices[i]
			const v = localPositions[i]
			posAttr.setXYZ(idx, v.x, v.y, v.z)
		}
	} 
	else if (this.type === 'vertex' && this.vertexHelper && Array.isArray(this.selectedVertex)) {
		const helper = this.vertexHelper
		const helperAttr = helper.geometry.attributes.position
		const offset = helper.position

		const allIndices = this.selectedVertex.map(({ vertexIndex }) => vertexIndex)

		for (let i = 0; i < allIndices.length; i++) {
			const idx = allIndices[i]
			const vx = helperAttr.getX(i)
			const vy = helperAttr.getY(i)
			const vz = helperAttr.getZ(i)
			const worldPos = new THREE.Vector3(vx, vy, vz).add(offset)
			const localPos = worldPos.clone().applyMatrix4(inverseMatrix)
			posAttr.setXYZ(idx, localPos.x, localPos.y, localPos.z)
		}
	}

	posAttr.needsUpdate = true
	
	this.selectedMesh.geometry.computeBoundingSphere()
	this.selectedMesh.geometry.computeBoundingBox()
}

/* HELPERS */
SelectionSystem.prototype._select = function(obj) {
		if (this.type === 'object') {
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
	}
SelectionSystem.prototype._deselect = function() {
	if (this.faceHelper) {
		this.scene.remove(this.faceHelper)
		this.faceHelper.geometry.dispose()
		this.faceHelper.material.dispose()
		this.faceHelper = null
	}
	
	if (this.segmentHelper) {
		this.scene.remove(this.segmentHelper)
		this.segmentHelper.geometry.dispose()
		this.segmentHelper.material.dispose()
		this.segmentHelper = null
	}
	
	if (this.vertexHelper) {
		this.scene.remove(this.vertexHelper)
		this.vertexHelper.geometry.dispose()
		this.vertexHelper.material.dispose()
		this.vertexHelper = null
	}
	
	this.selected = []
	this.selectedMesh = null
	this.selectedFace = []
	this.selectedFaceIndex = null
	this.selectedPairIndex = null
	
	const onDeselect = this.onDeselect
	this.onDeselect = null
	if (onDeselect) onDeselect()
	this.onDeselect = onDeselect
}