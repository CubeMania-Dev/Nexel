class SoftShadow {
	static _originalChunk = THREE.ShaderChunk.shadowmap_pars_fragment
	static _tag = '/*PCSS_ENABLED*/'
	
	constructor({
		enabled = true,
		samples = 20,
		rings = 2,
		frustumWidth = 10,
		softness = 0.1,
		nearPlane = 0.01
	} = {}) {
		this._enabled = false
		this.samples = samples
		this.rings = rings
		this.frustumWidth = frustumWidth
		this.softness = softness
		this.nearPlane = nearPlane
		this.enabled = enabled
	}
	
	get enabled() {
		return this._enabled
	}
	
	set enabled(v) {
		if (this._enabled === v) return
		this._enabled = v
		this._updateShader()
	}
	
	_updateShader() {
		const chunk = THREE.ShaderChunk
		if (this._enabled) {
			if (chunk.shadowmap_pars_fragment.includes(SoftShadow._tag)) return
			let shader = SoftShadow._originalChunk
			const code = `
${SoftShadow._tag}
#define SOFTNESS ${this.softness.toFixed(3)}
#define LIGHT_FRUSTUM_WIDTH ${this.frustumWidth.toFixed(3)}
#define LIGHT_WORLD_SIZE (SOFTNESS * LIGHT_FRUSTUM_WIDTH)
#define LIGHT_SIZE_UV (LIGHT_WORLD_SIZE / LIGHT_FRUSTUM_WIDTH)
#define NEAR_PLANE ${this.nearPlane.toFixed(3)}
#define NUM_SAMPLES ${this.samples}
#define NUM_RINGS ${this.rings}
#define BLOCKER_SEARCH_NUM_SAMPLES NUM_SAMPLES
vec2 poissonDisk[NUM_SAMPLES];
void initPoissonSamples(vec2 r){
 float a = rand(r) * PI2, rs = 1.0 / float(NUM_SAMPLES), r0 = rs;
 for(int i = 0; i < NUM_SAMPLES; i++){
  poissonDisk[i] = vec2(cos(a), sin(a)) * pow(r0, 0.85);
  r0 += rs; a += PI2 * float(NUM_RINGS) / float(NUM_SAMPLES);
 }
}
float penumbraSize(float zr, float zb){
 return (zr - zb) / zb;
}
float findBlocker(sampler2D sm, vec2 uv, float zr){
 float r = LIGHT_SIZE_UV * (zr - NEAR_PLANE) / zr, sum = 0.0;
 int n = 0;
 for(int i = 0; i < BLOCKER_SEARCH_NUM_SAMPLES; i++){
  float d = unpackRGBAToDepth(texture2D(sm, uv + poissonDisk[i] * r));
  if(d < zr){ sum += d; n++; }
 }
 return n == 0 ? -1.0 : sum / float(n);
}
float PCF_Filter(sampler2D sm, vec2 uv, float zr, float fr){
 float s = 0.0, d;
 for(int i = 0; i < NUM_SAMPLES; i++){
  d = unpackRGBAToDepth(texture2D(sm, uv + poissonDisk[i] * fr));
  if(zr <= d) s += 1.0;
 }
 for(int i = 0; i < NUM_SAMPLES; i++){
  d = unpackRGBAToDepth(texture2D(sm, uv - poissonDisk[i].yx * fr));
  if(zr <= d) s += 1.0;
 }
 return s / (2.0 * float(NUM_SAMPLES));
}
float PCSS(sampler2D sm, vec4 c){
 vec2 uv = c.xy;
 float zr = c.z;
 initPoissonSamples(uv);
 float zb = findBlocker(sm, uv, zr);
 if(zb < 0.0) return 1.0;
 float f = penumbraSize(zr, zb) * LIGHT_SIZE_UV * NEAR_PLANE / zr;
 return PCF_Filter(sm, uv, zr, f);
}`
			shader = shader.replace('#ifdef USE_SHADOWMAP', `#ifdef USE_SHADOWMAP\n${code}`)
			shader = shader.replace('#if defined( SHADOWMAP_TYPE_PCF )', `return PCSS(shadowMap, shadowCoord);\n#if defined( SHADOWMAP_TYPE_PCF )`)
			chunk.shadowmap_pars_fragment = shader
		} else {
			if (!chunk.shadowmap_pars_fragment.includes(SoftShadow._tag)) return
			chunk.shadowmap_pars_fragment = SoftShadow._originalChunk
		}
	}
}