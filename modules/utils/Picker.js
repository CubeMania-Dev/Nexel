class Picker {
  constructor() {
    this.createHTML()
    this.createStyles()
    this.setup()
    this.bindEvents()
    this.addGlobalClose()
  }

  createHTML() {
    this.container = document.createElement('div')
    this.container.className = 'color-picker'
    this.container.style.display = 'none'
    this.container.innerHTML = `
      <canvas class="SL" id="sat-lum"></canvas>
      <canvas class="h" id="hue"></canvas>
      <div class="row">
        <div class="color selected"></div>
        <button id="save">Save</button>
      </div>
    `
    document.body.appendChild(this.container)
  }

  createStyles() {
    let style = document.createElement('style')
    style.innerText = `
    .color-picker {
      position: fixed;
      inset: auto;
      display: none;
      flex-direction: column;
      padding: 0.6em;
      gap: 1em;
      background: #282828;
      border-radius: 10px;
      z-index: 999999;
    }
    .color-picker .SL {
      position: relative;
      width: 180px;
      height: 120px;
      border-radius: 5px;
      background: #42445A;
    }
    .color-picker .h {
      position: relative;
      width: 180px;
      height: 10px;
      border-radius: 5px;
      background: #42445A;
    }
    .color-picker .row {
      display: flex;
      align-items: center;
      gap: 5px;
      width: 100%;
      overflow-x: auto;
    }
    .color-picker .row button {
      margin-left: auto;
      background: #177AFF;
      border: none;
      border-radius: 5px;
      padding: 4px 6px;
      color: #fff;
    }
    .color-picker .row .color {
      height: 25px;
      aspect-ratio: 1/1;
      border-radius: 5px;
      background: #000;
      border: solid 1px #747474;
    }
    .color-picker .row .color.selected {
      border: solid #177AFF;
    }
    `
    document.head.appendChild(style)
  }

  setup() {
    this.satLumCanvas = this.container.querySelector('#sat-lum')
    this.satLumCtx = this.satLumCanvas.getContext('2d')
    this.satLumCanvas.width = this.satLumW = 180
    this.satLumCanvas.height = this.satLumH = 120

    this.hueCanvas = this.container.querySelector('#hue')
    this.hueCtx = this.hueCanvas.getContext('2d')
    this.hueCanvas.width = this.hueW = 180
    this.hueCanvas.height = this.hueH = 10

    this.preview = this.container.querySelector('.color.selected')
    this.saveBtn = this.container.querySelector('#save')

    this.hueColors = ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#f00']
    this.hue = 0
    this.hueX = this.hueW / 2
    this.satLumX = this.satLumW / 2
    this.satLumY = this.satLumH / 2

    this.drawHue()
    this.updateUI()
  }

  bindEvents() {
    this.bindCanvasEvents(this.satLumCanvas, e => this.updateSatLum(e))
    this.bindCanvasEvents(this.hueCanvas, e => this.updateHue(e))
    this.saveBtn?.addEventListener('click', () => this.saveColor())
  }

  bindCanvasEvents(canvas, handler) {
    canvas.addEventListener('mousedown', e => {
      handler(e)
      const move = e => handler(e)
      const up = () => {
        window.removeEventListener('mousemove', move)
        window.removeEventListener('mouseup', up)
      }
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', up)
    })
    canvas.addEventListener('touchmove', e => handler(e.touches[0]))
  }

  updateSatLum(e) {
    const rect = this.satLumCanvas.getBoundingClientRect()
    this.satLumX = Math.min(Math.max(0, e.clientX - rect.left), this.satLumW - 1)
    this.satLumY = Math.min(Math.max(0, e.clientY - rect.top), this.satLumH - 1)
    this.setPreview(this.getColorAt(this.satLumX, this.satLumY))
    this.updateUI()
  }

  updateHue(e) {
    const rect = this.hueCanvas.getBoundingClientRect()
    this.hueX = Math.min(Math.max(0, e.clientX - rect.left), this.hueW - 1)
    this.hue = (this.hueX / this.hueW) * 360
    this.setPreview(this.getColorAt(this.satLumX, this.satLumY))
    this.updateUI()
  }

  updateUI() {
    this.drawHue()
    this.drawHueSelector()
    this.drawSatLum()
    this.drawSatLumCircle()
  }

  drawHue() {
    const gradient = this.hueCtx.createLinearGradient(0, 0, this.hueW, 0)
    this.hueColors.forEach((c, i, a) => gradient.addColorStop(i / (a.length - 1), c))
    this.hueCtx.fillStyle = gradient
    this.hueCtx.fillRect(0, 0, this.hueW, this.hueH)
  }

  drawHueSelector() {
    this.hueCtx.beginPath()
    this.hueCtx.strokeStyle = 'white'
    this.hueCtx.lineWidth = 3
    this.hueCtx.moveTo(this.hueX, 0)
    this.hueCtx.lineTo(this.hueX, this.hueH)
    this.hueCtx.stroke()
  }

  drawSatLum() {
    const data = this.satLumCtx.createImageData(this.satLumW, this.satLumH)
    const [rh, gh, bh] = this.hslToRgb(this.hue / 360, 1, 0.5)
    for (let y = 0; y < this.satLumH; y++) {
      const l = 1 - y / (this.satLumH - 1)
      for (let x = 0; x < this.satLumW; x++) {
        const s = x / (this.satLumW - 1)
        const r = ((rh * s + 1 - s) * l * 255) | 0
        const g = ((gh * s + 1 - s) * l * 255) | 0
        const b = ((bh * s + 1 - s) * l * 255) | 0
        const i = (y * this.satLumW + x) * 4
        data.data.set([r, g, b, 255], i)
      }
    }
    this.satLumCtx.putImageData(data, 0, 0)
  }

  drawSatLumCircle() {
    const [r, g, b] = this.satLumCtx.getImageData(this.satLumX, this.satLumY, 1, 1).data
    const stroke = (r + g + b) / 3 > 128 ? 'black' : 'white'
    this.satLumCtx.beginPath()
    this.satLumCtx.arc(this.satLumX, this.satLumY, 7, 0, Math.PI * 2)
    this.satLumCtx.strokeStyle = stroke
    this.satLumCtx.lineWidth = 2
    this.satLumCtx.stroke()
  }

  getColorAt(x, y) {
    const [r, g, b] = this.satLumCtx.getImageData(x, y, 1, 1).data
    return `rgb(${r},${g},${b})`
  }

  setPreview(color) {
    this.currentColor = color
    if (this.preview) this.preview.style.background = color
  }

  saveColor() {
	if (this.activeTarget && this.currentColor) {
		this.activeTarget.style.background = this.currentColor
		this.activeTarget.setAttribute('value', this.currentColor)
		
		const event = new Event('change', { bubbles: true })
		this.activeTarget.dispatchEvent(event)
		
		this.container.style.display = 'none'
	}
}

  add(selector) {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation()
        this.activeTarget = el
        this.container.style.display = 'flex'
        const value = el.getAttribute('value') || 'rgb(255,255,255)'
        el.style.background = value
        this.setPreview(value)

        const [r, g, b] = value.match(/\d+/g).map(Number)
        const [h, s, l] = this.rgbToHsl(r, g, b)
        this.hue = h * 360
        this.hueX = this.hueW * h
        this.satLumX = s * (this.satLumW - 1)
        this.satLumY = (1 - l) * (this.satLumH - 1)
        this.updateUI()
      })
    })
  }

  addGlobalClose() {
    document.addEventListener('pointerdown', e => {
      if (!this.container.contains(e.target)) this.container.style.display = 'none'
    })
  }

  hslToRgb(h, s, l) {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    if (s === 0) return [l, l, l]
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)]
  }

  rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2
    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }
    return [h, s, l]
  }
}