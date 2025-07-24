// BASIC SCENE
// --- SCENE ---    
scene = new THREE.Scene()


// --- CAMERA ---  
mainCamera = new THREE.PerspectiveCamera(
	configs.camera.fov,
	configs.viewport.w / configs.viewport.h,
	configs.camera.near,
	configs.camera.far
)
mainCamera.position.set(4, 2, 4)
mainCamera.name = 'mainCamera'
mainCamera.userData.ignored = true
mainCamera.lookAt(new THREE.Vector3(0, 0, 0))


camera = mainCamera


// --- RENDERER ---    
canvas = document.querySelector('#viewport')

function initRenderer() {
	renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		alpha: configs.viewport.alpha,
		antialias: configs.viewport.antialias
	})
	
	renderer.physicallyCorrectLights = configs.render.physicallyCorrect
	renderer.shadowMap.enabled = configs.render.shadows
	renderer.shadowMap.type = configs.render.shadowType
	renderer.setSize(configs.viewport.w, configs.viewport.h)
	renderer.setPixelRatio(configs.viewport.pxRatio)
	renderer.setClearColor(configs.viewport.background)
}

initRenderer()