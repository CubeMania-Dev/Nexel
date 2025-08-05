class SoftShadow {
	constructor({
	  enabled = true,
		samples = 12,
		rings = 2,
		frustumWidth = 10,
		worldSize = 0.001,
		nearPlane = 0.5,
	} = {}) {
		this.enabled = enabled
		this.samples = samples
		this.rings = rings
		this.frustumWidth = frustumWidth
		this.worldSize = worldSize
		this.nearPlane = nearPlane
		
		this.updateShader()
	}
	
	updateShader() {
		let shader = THREE.ShaderChunk.shadowmap_pars_fragment
		
		const replacePoissonSamples = `
#define LIGHT_WORLD_SIZE ${this.worldSize.toFixed(3)}
#define LIGHT_FRUSTUM_WIDTH ${this.frustumWidth.toFixed(3)}
#define LIGHT_SIZE_UV (LIGHT_WORLD_SIZE / LIGHT_FRUSTUM_WIDTH)
#define NEAR_PLANE ${this.nearPlane.toFixed(3)}
#define NUM_SAMPLES ${this.samples}
#define NUM_RINGS ${this.rings}
#define BLOCKER_SEARCH_NUM_SAMPLES NUM_SAMPLES
vec2 poissonDisk[NUM_SAMPLES];
void initPoissonSamples(vec2 r){
  float a = rand(r) * PI2, rs = 1. / float(NUM_SAMPLES), r0 = rs;
  for(int i = 0; i < NUM_SAMPLES; i++){
    poissonDisk[i] = vec2(cos(a), sin(a)) * pow(r0, 0.85);
    r0 += rs; a += PI2 * float(NUM_RINGS) / float(NUM_SAMPLES);
  }
}
float penumbraSize(float zr, float zb){ return (zr - zb) / zb; }
float findBlocker(sampler2D sm, vec2 uv, float zr){
  float r = LIGHT_SIZE_UV * (zr - NEAR_PLANE) / zr, sum = 0.;
  int n = 0;
  for(int i = 0; i < BLOCKER_SEARCH_NUM_SAMPLES; i++){
    float d = unpackRGBAToDepth(texture2D(sm, uv + poissonDisk[i] * r));
    if(d < zr){ sum += d; n++; }
  }
  return n == 0 ? -1. : sum / float(n);
}
float PCF_Filter(sampler2D sm, vec2 uv, float zr, float fr){
  float s = 0., d;
  for(int i = 0; i < NUM_SAMPLES; i++){
    d = unpackRGBAToDepth(texture2D(sm, uv + poissonDisk[i] * fr));
    if(zr <= d) s += 1.;
  }
  for(int i = 0; i < NUM_SAMPLES; i++){
    d = unpackRGBAToDepth(texture2D(sm, uv + -poissonDisk[i].yx * fr));
    if(zr <= d) s += 1.;
  }
  return s / (2. * float(NUM_SAMPLES));
}
float PCSS(sampler2D sm, vec4 c){
  vec2 uv = c.xy;
  float zr = c.z;
  initPoissonSamples(uv);
  float zb = findBlocker(sm, uv, zr);
  if(zb == -1.) return 1.;
  float f = penumbraSize(zr, zb) * LIGHT_SIZE_UV * NEAR_PLANE / zr;
  return PCF_Filter(sm, uv, zr, f);
}`
		
		
		if (this.enabled) {
			
		shader = shader.replace(
			'#ifdef USE_SHADOWMAP',
			`#ifdef USE_SHADOWMAP
${replacePoissonSamples}`
		)
		
		shader = shader.replace(
			'#if defined( SHADOWMAP_TYPE_PCF )',
			`return PCSS(shadowMap, shadowCoord);
#if defined( SHADOWMAP_TYPE_PCF )`
		)
		
		THREE.ShaderChunk.shadowmap_pars_fragment = shader
		}
	}
}