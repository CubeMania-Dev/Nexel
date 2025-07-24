class AnimationSystem {
  constructor(conf) {
    this.conf = Object.assign({ frames: 250, currentFrame: 0, container: null }, conf)
    this.frames = this.conf.frames
    this.currentFrame = this.conf.currentFrame
    this.container = typeof this.conf.container === 'string'
      ? document.querySelector(this.conf.container)
      : this.conf.container
    this.cursor = null
    this._dragging = false
    this._playing = false
    this._rafId = null
    this._fps = 30
    this.init()
  }
  
  init() {
    for (let i = 0; i < this.frames; i++) {
      const f = ui.build({ type: 'div', class: 'frame' })
      f.addEventListener('click', () => this.setCursor(i))
      this.container.appendChild(f)
    }
    this.cursor = ui.build({ type: 'div', class: 'frame cursor' })
    this.container.appendChild(this.cursor)
    this.cursor.addEventListener('pointerdown', e => {
      e.preventDefault()
      this._dragging = true
    })
    this.cursor.addEventListener('touchstart', e => {
      e.preventDefault()
      this._dragging = true
    })
    window.addEventListener('pointerup', () => {
      this._dragging = false
    })
    window.addEventListener('touchend', () => {
      this._dragging = false
    })
    window.addEventListener('pointermove', e => {
      if (!this._dragging) return
      e.preventDefault()
      this._drag(e.clientX)
    })
    window.addEventListener('touchmove', e => {
      if (!this._dragging) return
      e.preventDefault()
      this._drag(e.touches[0].clientX)
    })
    this.setCursor(this.currentFrame)
  }
  
  _drag(clientX) {
    const rect = this.container.getBoundingClientRect()
    let x = clientX - rect.left
    if (x < 0) x = 0
    if (x > rect.width) x = rect.width
    const frames = this.container.querySelectorAll('.frame')
    let idx = 0, md = Infinity
    frames.forEach((f, i) => {
      const d = Math.abs(f.offsetLeft - x)
      if (d < md) { md = d; idx = i }
    })
    this.setCursor(idx)
  }
  
  setCursor(frame) {
    const frames = this.container.querySelectorAll('.frame')
    const fe = frames[frame]
    if (!fe) return
    this.cursor.style.left = fe.offsetLeft + 'px'
    this.currentFrame = frame
    scene.children.forEach(o => {
      if (Array.isArray(o.userData?.keyframes)) this.interpolate(o, frame)
    })
    this.onUpdate(frame)
  }
  
  onUpdate(frame) {}
  
  addKeyframe(object) {
    if (!object.userData.keyframes) object.userData.keyframes = []
    object.userData.keyframes.push({
      frame: this.currentFrame,
      position: [object.position.x, object.position.y, object.position.z],
      rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
      scale: [object.scale.x, object.scale.y, object.scale.z]
    })
    this.renderKeyframes(object)
  }
  removeKeyframe(object) {
    if (!object.userData.keyframes) return
    object.userData.keyframes = object.userData.keyframes.filter(k => k.frame !== this.currentFrame)
    this.renderKeyframes(object)
  }
  replaceKeyframe(object) {
    if (!object.userData.keyframes) object.userData.keyframes = []
    object.userData.keyframes = object.userData.keyframes.filter(k => k.frame !== this.currentFrame)
    object.userData.keyframes.push({
      frame: this.currentFrame,
      position: [object.position.x, object.position.y, object.position.z],
      rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
      scale: [object.scale.x, object.scale.y, object.scale.z]
    })
    this.renderKeyframes(object)
  }
  
  keyframe(object) {
    if (!object.userData.keyframes) object.userData.keyframes = []
    const idx = object.userData.keyframes.findIndex(k => k.frame === this.currentFrame)
    const cur = {
      frame: this.currentFrame,
      position: [object.position.x, object.position.y, object.position.z],
      rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
      scale: [object.scale.x, object.scale.y, object.scale.z]
    }
    if (idx === -1) this.addKeyframe(object)
    else {
      const ex = object.userData.keyframes[idx]
      const same = JSON.stringify(ex.position) === JSON.stringify(cur.position)
        && JSON.stringify(ex.rotation) === JSON.stringify(cur.rotation)
        && JSON.stringify(ex.scale) === JSON.stringify(cur.scale)
      if (same) this.removeKeyframe(object)
      else this.replaceKeyframe(object)
    }
  }
  
  renderKeyframes(object = null) {
    const frames = this.container.querySelectorAll('.frame')
    frames.forEach(f => f.querySelectorAll('.keyframe').forEach(d => d.remove()))
    if (!object || !Array.isArray(object.userData?.keyframes)) return
    object.userData.keyframes.forEach(k => {
      const fe = frames[k.frame]
      if (!fe) return
      fe.appendChild(ui.build({ type: 'div', class: 'keyframe' }))
    })
  }
  
  catmullRom(p0, p1, p2, p3, t) {
    const t2 = t*t, t3 = t2*t
    return [
      0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
      0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3),
      0.5*((2*p1[2])+(-p0[2]+p2[2])*t+(2*p0[2]-5*p1[2]+4*p2[2]-p3[2])*t2+(-p0[2]+3*p1[2]-3*p2[2]+p3[2])*t3)
    ]
  }
  lerp(a, b, t) {
    return a*(1-t)+b*t
  }
  slerpQuat(q1, q2, t) {
    return q1.clone().slerp(q2, t)
  }
  interpolate(object, frame) {
    const k = object.userData.keyframes
    if (!k || !k.length) return
    const s = [...k].sort((a,b)=>a.frame-b.frame)
    let i = 0
    for (let j=0;j<s.length;j++) if (s[j].frame<=frame) i=j
    const prev = s[i], next = s[i+1]
    if (!prev) return
    if (!next) {
      object.position.set(...prev.position)
      object.rotation.set(...prev.rotation)
      object.scale.set(...prev.scale)
      return
    }
    const t = (frame-prev.frame)/(next.frame-prev.frame)
    const p0 = s[i-1]?s[i-1].position:prev.position
    const p1 = prev.position
    const p2 = next.position
    const p3 = s[i+2]?s[i+2].position:next.position
    const pos = this.catmullRom(p0,p1,p2,p3,t)
    object.position.set(...pos)
    const q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(...prev.rotation))
    const q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(...next.rotation))
    const qi = this.slerpQuat(q0,q1,t)
    const ei = new THREE.Euler().setFromQuaternion(qi)
    object.rotation.set(ei.x,ei.y,ei.z)
    object.scale.set(
      this.lerp(prev.scale[0],next.scale[0],t),
      this.lerp(prev.scale[1],next.scale[1],t),
      this.lerp(prev.scale[2],next.scale[2],t)
    )
  }
  
  play() {
    if (this._playing) return
    this._playing = true
    const step = () => {
      if (!this._playing) return
      this.setCursor(this.currentFrame)
      this.currentFrame = (this.currentFrame+1)%this.frames
      this._rafId = setTimeout(step,1000/this._fps)
    }
    step()
  }
  pause() {
    if (!this._playing) return
    this._playing = false
    clearTimeout(this._rafId)
    this._rafId = null
  }
}