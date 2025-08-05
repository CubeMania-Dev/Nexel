class UIBuilder {
	constructor() {
		this.root = document.body
		this.move('[move]')
		this.rotate('[rotate]')
		this.resize('[resize]')
		
		this.onLoadTheme = (theme) => {}
		
		this.darkTheme = {
			'bg-0': '#000',
			'bg-1': '#121212',
			'bg-2': '#1e1e1e',
			'bg-3': '#2a2a2a',
			'bg-4': '#323232',
			'bg-5': '#424242',
			'bg-6': '#4e4e4e',
			
			'text-1': '#e0e0e0',
			'text-2': '#b0b0b0',
			'text-3': '#808080',
			
			'text-accent': '#A5CAFF',
			'text-active': '#A6C1FF',
			
			'accent': '#0080ff',
			'accent-1': '#3D9EFF',
			
			'active': '#114382',
			
			'alert': '#F33737'
		}
		this.lightTheme = {
			'bg-0': '#fff',
			'bg-1': '#f5f5f5',
			'bg-2': '#ebebeb',
			'bg-3': '#e0e0e0',
			'bg-4': '#d6d6d6',
			'bg-5': '#cccccc',
			'bg-6': '#c2c2c2',
			
			'text-1': '#1a1a1a',
			'text-2': '#3a3a3a',
			'text-3': '#5a5a5a',
			
			'text-accent': '#0053b0',
			'text-active': '#0048a0',
			
			'accent': '#006eff',
			'accent-1': '#3D9EFF',
			
			'active': '#d0e5ff',
			
			'alert': '#D32F2F'
		}
		this.softTheme = {
			'bg-0': '#0b0e14',
			'bg-1': '#121621',
			'bg-2': '#1a1f2b',
			'bg-3': '#222735',
			'bg-4': '#2b3140',
			'bg-5': '#353c4a',
			'bg-6': '#404654',
			
			'text-1': '#d0d8e0',
			'text-2': '#a5acb5',
			'text-3': '#7a818a',
			
			'text-accent': '#A8CFFF',
			'text-active': '#9FC7FF',
			
			'accent': '#5a9eff',
			'accent-1': '#7db6ff',
			
			'active': '#2b4a72',
			
			'alert': '#e06666'
		}
	}
	
	// UI TRANSFORM
	move(selector, handler = null, axis = 'both', snap = 0, contain = false, useSelection = false) {
		const elements = this.root.querySelectorAll(selector)
		const handlers = handler ? this.root.querySelectorAll(handler) : []
		
		elements.forEach((el, i) => {
			const handleEl = handler ? (handlers[i] || handlers[0]) : el
			
			let dragging = false
			let offsetX = 0
			let offsetY = 0
			const parent = el.parentElement
			
			const onPointerDown = e => {
				if (useSelection && this.selectedElement !== el) return
				
				const computed = getComputedStyle(el)
				if (computed.position !== 'absolute') {
					const rect = el.getBoundingClientRect()
					const pRect = parent.getBoundingClientRect()
					el.style.position = 'absolute'
					el.style.left = (rect.left - pRect.left) + 'px'
					el.style.top = (rect.top - pRect.top) + 'px'
				}
				
				offsetX = e.clientX - el.offsetLeft
				offsetY = e.clientY - el.offsetTop
				dragging = true
				document.addEventListener('pointermove', onPointerMove)
				document.addEventListener('pointerup', onPointerUp)
			}
			
			const onPointerMove = e => {
				if (!dragging) return
				
				let x = e.clientX - offsetX
				let y = e.clientY - offsetY
				
				if (contain && parent) {
					const pRect = parent.getBoundingClientRect()
					const elRect = el.getBoundingClientRect()
					const rightLimit = pRect.width - elRect.width
					const bottomLimit = pRect.height - elRect.height
					
					x = Math.min(Math.max(x, 0), rightLimit)
					y = Math.min(Math.max(y, 0), bottomLimit)
				}
				
				if (snap > 0) {
					x = Math.round(x / snap) * snap
					y = Math.round(y / snap) * snap
				}
				
				if (axis === 'x') {
					el.style.left = x + 'px'
				} else if (axis === 'y') {
					el.style.top = y + 'px'
				} else {
					el.style.left = x + 'px'
					el.style.top = y + 'px'
				}
			}
			
			const onPointerUp = () => {
				dragging = false
				document.removeEventListener('pointermove', onPointerMove)
				document.removeEventListener('pointerup', onPointerUp)
			}
			
			handleEl.style.touchAction = 'none'
			handleEl.addEventListener('pointerdown', onPointerDown)
		})
	}
	
	resize(selector, handler = null, axis = 'both', snap = 0, contain = false, force = false, useSelection = false) {
		const elements = this.root.querySelectorAll(selector)
		const handlers = handler ? this.root.querySelectorAll(handler) : []
		
		elements.forEach((el, i) => {
			const handleEl = handler ? (handlers[i] || handlers[0]) : el
			
			let resizing = false
			let startX = 0
			let startY = 0
			let startW = 0
			let startH = 0
			let startL = 0
			let startT = 0
			const parent = el.parentElement
			
			const onPointerDown = e => {
				if (useSelection && this.selectedElement !== el) return
				const rect = el.getBoundingClientRect()
				resizing = true
				startX = e.clientX
				startY = e.clientY
				startW = rect.width
				startH = rect.height
				startL = el.offsetLeft
				startT = el.offsetTop
				document.addEventListener('pointermove', onPointerMove)
				document.addEventListener('pointerup', onPointerUp)
			}
			
			const onPointerMove = e => {
				if (!resizing) return
				
				let dx = e.clientX - startX
				let dy = e.clientY - startY
				
				let newW = startW
				let newH = startH
				let newL = startL
				let newT = startT
				
				if (axis === 'x' || axis === 'both' || axis === 'right') {
					newW = startW + dx
				}
				if (axis === 'y' || axis === 'both' || axis === 'bottom') {
					newH = startH + dy
				}
				if (axis === 'left') {
					newW = startW - dx
					if (force && newW > 0) {
						newL = startL + dx
					} else if (!force) {
						newL = startL + dx
					}
				}
				if (axis === 'top') {
					newH = startH - dy
					if (force && newH > 0) {
						newT = startT + dy
					} else if (!force) {
						newT = startT + dy
					}
				}
				
				if (contain && parent) {
					const pRect = parent.getBoundingClientRect()
					newW = Math.min(newW, pRect.width)
					newH = Math.min(newH, pRect.height)
				}
				
				newW = Math.max(1, newW)
				newH = Math.max(1, newH)
				
				if (snap > 0) {
					newW = Math.round(newW / snap) * snap
					newH = Math.round(newH / snap) * snap
					newL = Math.round(newL / snap) * snap
					newT = Math.round(newT / snap) * snap
				}
				
				if (axis === 'x' || axis === 'both' || axis === 'left' || axis === 'right') {
					el.style.width = newW + 'px'
				}
				if (axis === 'y' || axis === 'both' || axis === 'top' || axis === 'bottom') {
					el.style.height = newH + 'px'
				}
				
				if ((axis === 'left' && (!force || newW > 1)) || (axis === 'x' && !force) || (axis === 'both' && !force)) {
					el.style.left = newL + 'px'
				}
				if ((axis === 'top' && (!force || newH > 1)) || (axis === 'y' && !force) || (axis === 'both' && !force)) {
					el.style.top = newT + 'px'
				}
				
				this.onResize()
			}
			
			const onPointerUp = () => {
				resizing = false
				document.removeEventListener('pointermove', onPointerMove)
				document.removeEventListener('pointerup', onPointerUp)
			}
			
			handleEl.style.touchAction = 'none'
			handleEl.addEventListener('pointerdown', onPointerDown)
		})
	}
	onResize() {}
	
	rotate(selector, handler = null, snap = 0, useSelection = false) {
		const elements = this.root.querySelectorAll(selector)
		const handlers = handler ? this.root.querySelectorAll(handler) : []
		
		elements.forEach((el, i) => {
			const handleEl = handler ? (handlers[i] || handlers[0]) : el
			
			let rotating = false
			let centerX = 0
			let centerY = 0
			let startAngle = 0
			let baseRotation = el.__rotation || 0
			
			function getAngle(x, y) {
				return Math.atan2(y - centerY, x - centerX) * (180 / Math.PI)
			}
			
			const onPointerDown = e => {
				if (useSelection && this.selectedElement !== el) return
				const rect = el.getBoundingClientRect()
				centerX = rect.left + rect.width / 2
				centerY = rect.top + rect.height / 2
				startAngle = getAngle(e.clientX, e.clientY)
				baseRotation = el.__rotation || 0
				rotating = true
				document.addEventListener('pointermove', onPointerMove)
				document.addEventListener('pointerup', onPointerUp)
			}
			
			const onPointerMove = e => {
				if (!rotating) return
				const currentAngle = getAngle(e.clientX, e.clientY)
				let delta = currentAngle - startAngle
				let rotation = baseRotation + delta
				
				if (snap > 0) {
					rotation = Math.round(rotation / snap) * snap
				}
				
				el.style.transform = `rotate(${rotation}deg)`
			}
			
			const onPointerUp = e => {
				if (!rotating) return
				const currentAngle = getAngle(e.clientX, e.clientY)
				let delta = currentAngle - startAngle
				baseRotation += delta
				
				if (snap > 0) {
					baseRotation = Math.round(baseRotation / snap) * snap
				}
				
				el.__rotation = baseRotation
				rotating = false
				document.removeEventListener('pointermove', onPointerMove)
				document.removeEventListener('pointerup', onPointerUp)
			}
			
			handleEl.style.touchAction = 'none'
			handleEl.addEventListener('pointerdown', onPointerDown)
		})
	}
	
	borderResize(selector) {
	const el = document.querySelector(selector);
	if (!el) return;
	
	let activeBorder = null;
	let initialSize = {};
	let initialPos = {};
	
	const handleTouchStart = (e) => {
		if (e.touches.length !== 1) return;
		
		const touch = e.touches[0];
		const rect = el.getBoundingClientRect();
		const style = getComputedStyle(el);
		
		const borderAreas = {
			left: parseFloat(style.borderLeftWidth) || 0,
			right: parseFloat(style.borderRightWidth) || 0,
			top: parseFloat(style.borderTopWidth) || 0,
			bottom: parseFloat(style.borderBottomWidth) || 0
		};
		
		if (touch.clientX <= rect.left + borderAreas.left) {
			activeBorder = 'left';
		} else if (touch.clientX >= rect.right - borderAreas.right) {
			activeBorder = 'right';
		} else if (touch.clientY <= rect.top + borderAreas.top) {
			activeBorder = 'top';
		} else if (touch.clientY >= rect.bottom - borderAreas.bottom) {
			activeBorder = 'bottom';
		}
		
		if (!activeBorder) return;
		
		initialPos = {
			x: touch.clientX,
			y: touch.clientY
		};
		
		initialSize = {
			width: el.offsetWidth,
			height: el.offsetHeight
		};
		
		el.style.touchAction = 'none';
		e.preventDefault();
	};
	
	const handleTouchMove = (e) => {
		if (!activeBorder || e.touches.length !== 1) return;
		
		const touch = e.touches[0];
		e.preventDefault();
		
		switch (activeBorder) {
			case 'left':
				el.style.width = `${initialSize.width + (initialPos.x - touch.clientX)}px`;
				break;
			case 'right':
				el.style.width = `${initialSize.width + (touch.clientX - initialPos.x)}px`;
				break;
			case 'top':
				el.style.height = `${initialSize.height + (initialPos.y - touch.clientY)}px`;
				break;
			case 'bottom':
				el.style.height = `${initialSize.height + (touch.clientY - initialPos.y)}px`;
				break;
		}
	};
	
	const handleTouchEnd = () => {
		activeBorder = null;
		el.style.touchAction = '';
	};
	
	el.addEventListener('touchstart', handleTouchStart, { passive: false });
	document.addEventListener('touchmove', handleTouchMove, { passive: false });
	document.addEventListener('touchend', handleTouchEnd);
	document.addEventListener('touchcancel', handleTouchEnd);
}
	
	align(selector, ...targets) {
	const el = typeof selector === 'string' ? document.querySelector(selector) : selector
	if (!el || targets.length === 0) return
	
	const compute = () => {
		const scrollTop = window.scrollY || document.documentElement.scrollTop
		const scrollLeft = window.scrollX || document.documentElement.scrollLeft
		const viewportHeight = window.innerHeight
		const viewportWidth = window.innerWidth
		
		targets.forEach(entry => {
			const [targetSel, side = 'bottom', inside = false] = Array.isArray(entry) ? entry : [entry, 'bottom', false]
			const target = typeof targetSel === 'string' ? document.querySelector(targetSel) : targetSel
			if (!target) return
			
			const rect = target.getBoundingClientRect()
			const elRect = el.getBoundingClientRect()
			const insideAlign = inside === true
			
			switch (side) {
				case 'top':
					el.style.top = `${rect.top + scrollTop - (insideAlign ? 0 : elRect.height)}px`
					el.style.bottom = ''
					break
				case 'bottom':
					el.style.top = `${rect.bottom + scrollTop - (insideAlign ? elRect.height : 0)}px`
					el.style.bottom = ''
					break
				case 'left':
					el.style.left = `${rect.left + scrollLeft - (insideAlign ? 0 : elRect.width)}px`
					el.style.right = ''
					break
				case 'right':
					el.style.left = `${rect.right + scrollLeft - (insideAlign ? elRect.width : 0)}px`
					el.style.right = ''
					break
				case 'h-center':
					el.style.left = `${rect.left + (insideAlign ? 0 : elRect.width / 2)}px`
					el.style.right = ''
					break
			}
		})
		
		el.style.position = 'absolute'
	}
	
	this.onResize = compute
	this.onBorderResize = compute
	
	function update() {
		requestAnimationFrame(update)
		compute()
	}
	
	update()
	
	compute()
}
	
	zoom(selector, pan = true, zoom = true) {
		const containers = this.root.querySelectorAll(selector)
		
		containers.forEach(container => {
			let isPanning = false
			let startX = 0
			let startY = 0
			let originX = 0
			let originY = 0
			let currentScale = 1
			let lastTouchDist = 0
			
			const group = document.createElement('div')
			while (container.firstChild) {
				group.appendChild(container.firstChild)
			}
			container.appendChild(group)
			
			group.style.position = 'absolute'
			group.style.left = '0'
			group.style.top = '0'
			group.style.transformOrigin = '0 0'
			
			const setTransform = () => {
				group.style.transform = `translate(${originX}px, ${originY}px) scale(${currentScale})`
			}
			
			const getDistance = (touches) => {
				const dx = touches[0].clientX - touches[1].clientX
				const dy = touches[0].clientY - touches[1].clientY
				return Math.sqrt(dx * dx + dy * dy)
			}
			
			const isDirectTouch = e => e.target === container
			
			const onTouchStart = e => {
				if (!isDirectTouch(e)) return
				
				if (e.touches.length === 1 && pan) {
					isPanning = true
					startX = e.touches[0].clientX - originX
					startY = e.touches[0].clientY - originY
				}
				
				if (e.touches.length === 2 && zoom) {
					isPanning = false
					lastTouchDist = getDistance(e.touches)
				}
			}
			
			const onTouchMove = e => {
				if (!isDirectTouch(e)) return
				
				if (e.touches.length === 1 && isPanning && pan) {
					originX = e.touches[0].clientX - startX
					originY = e.touches[0].clientY - startY
					setTransform()
				}
				
				if (e.touches.length === 2 && zoom) {
					e.preventDefault()
					const dist = getDistance(e.touches)
					if (!lastTouchDist) {
						lastTouchDist = dist
						return
					}
					
					const delta = dist - lastTouchDist
					const scaleFactor = delta * 0.005
					currentScale = Math.max(0.1, currentScale + scaleFactor)
					setTransform()
					lastTouchDist = dist
				}
			}
			
			const onTouchEnd = e => {
				if (e.touches.length < 2) lastTouchDist = 0
				if (e.touches.length === 0) isPanning = false
			}
			
			container.style.position = 'relative'
			container.style.touchAction = 'none'
			container.addEventListener('touchstart', onTouchStart, { passive: false })
			container.addEventListener('touchmove', onTouchMove, { passive: false })
			container.addEventListener('touchend', onTouchEnd)
			container.addEventListener('touchcancel', onTouchEnd)
		})
	}
	
	
	// SELECTION + ACTIONS
	select(selector) {
		const elements = this.root.querySelectorAll(selector)
		
		let pointerDownPos = null
		let pointerMoved = false
		
		elements.forEach(el => {
			el.addEventListener('pointerdown', e => {
				pointerDownPos = { x: e.clientX, y: e.clientY }
				pointerMoved = false
			})
			
			el.addEventListener('pointermove', e => {
				if (!pointerDownPos) return
				const dx = e.clientX - pointerDownPos.x
				const dy = e.clientY - pointerDownPos.y
				if (Math.sqrt(dx * dx + dy * dy) > 5) pointerMoved = true
			})
			
			el.addEventListener('pointerup', e => {
				if (!pointerDownPos) return
				if (!pointerMoved) {
					if (this.selectedElement && this.selectedElement !== el) {
						this.selectedElement.style.boxShadow = this.selectedElement.__originalBoxShadow || ''
					}
					this.selectedElement = el
					el.__originalBoxShadow = getComputedStyle(el).boxShadow
					el.style.boxShadow = '0 0 0 1px white inset'
					if (this._onSelectCallback) this._onSelectCallback(el)
				}
				pointerDownPos = null
				pointerMoved = false
			})
		})
		
		this.root.addEventListener('pointerdown', e => {
			if (this.selectedElement && !this.root.contains(e.target)) return
			if (this.selectedElement && e.target === this.root) {
				this.selectedElement.style.boxShadow = this.selectedElement.__originalBoxShadow || ''
				this.selectedElement = null
				if (this._onSelectCallback) this._onSelectCallback(null)
			}
		})
	}
	
	clone(offset = 10) {
		if (!this.selectedElement) return
		this.selectedElement.style.boxShadow = this.selectedElement.__originalBoxShadow || ''
		const clone = this.selectedElement.cloneNode(true)
		const left = this.selectedElement.offsetLeft
		const top = this.selectedElement.offsetTop
		clone.style.position = 'absolute'
		clone.style.left = (left + offset) + 'px'
		clone.style.top = (top + offset) + 'px'
		this.root.appendChild(clone)
		this.selectedElement = null
	}
	
	copy() {
		if (!this.selectedElement) return
		this.selectedElement.style.boxShadow = this.selectedElement.__originalBoxShadow || ''
		const clone = this.selectedElement.cloneNode(true)
		clone.style.boxShadow = ''
		this._copiedElement = clone
		this._copiedElement._copyLeft = this.selectedElement.offsetLeft
		this._copiedElement._copyTop = this.selectedElement.offsetTop
		this.selectedElement = null
	}
	
	paste() {
		if (!this._copiedElement) return
		const clone = this._copiedElement.cloneNode(true)
		const left = this._copiedElement._copyLeft || 0
		const top = this._copiedElement._copyTop || 0
		clone.style.position = 'absolute'
		clone.style.left = left + 'px'
		clone.style.top = top + 'px'
		clone.style.boxShadow = ''
		this.root.appendChild(clone)
	}
	
	delete() {
		if (!this.selectedElement) return
		this.selectedElement.remove()
		this.selectedElement = null
	}
	
	
	// UI DISPLAY
hide(el) {
	const elements = typeof el === 'string' ?
		this.root.querySelectorAll(el) :
		(el instanceof Element ? [el] : el)
	elements.forEach(e => e.classList.add('hidden'))
}

show(el) {
	const elements = typeof el === 'string' ?
		this.root.querySelectorAll(el) :
		(el instanceof Element ? [el] : el)
	elements.forEach(e => e.classList.remove('hidden'))
}

toggle(el) {
	const elements = typeof el === 'string' ?
		this.root.querySelectorAll(el) :
		(el instanceof Element ? [el] : el)
	elements.forEach(e => e.classList.toggle('hidden'))
}
	
	
	// EVENT REGISTER
	register(method, args) {
		if (!this._registered) this._registered = []
		this._registered.push({ method, args })
	}
	
	reloadEvents() {
		if (!this._registered) return
		
		const targets = new Set()
		
		this._registered.forEach(entry => {
			const selector = entry.args[0]
			const elements = this.root.querySelectorAll(selector)
			elements.forEach(el => {
				if (!targets.has(el)) {
					const clone = el.cloneNode(true)
					el.replaceWith(clone)
					targets.add(clone)
				}
			})
		})
		
		const calls = [...this._registered]
		this._registered = []
		
		calls.forEach(entry => {
			this[entry.method](...entry.args)
			this.register(entry.method, entry.args)
		})
	}
	
	
	// UI BUILDER
build(config, parent) {
	parent = typeof parent === 'string' ? document.querySelector(parent) : parent
	if (!parent) parent = document.body
	
	const presets = {
		'bar': '<div class="bar"></div>',
		'top-bar': '<div class="top bar"></div>',
		'side-bar': '<div class="side bar"></div>',
		'container': '<div class="container"></div>',
		'floating-container': '<div class="floating-container"></div>',
		'floating-grid': '<div class="floating-grid"></div>',
		'modal': '<div class="modal"><div class="content"></div><button class="btn cancel">Cancel</button><button class="btn accept">Accept</button></div>',
		'menu': '<div class="menu"></div>',
		'quick-menu': '<div class="quick menu"></div>',
		'dropdown': '<div class="dropdown"></div>',
		'section': '<section class="section"></section>',
		'row': '<div class="row"></div>',
		'sep': '<div class="sep"></div>',
		'btn': '<button class="btn"></button>',
		'text': '<input type="text">',
		'color': '<input type="color">',
		'picker': '<div class="picker"></div>',
		'checkbox': '<input type="checkbox">',
		'radio': '<input type="radio">',
		'number': '<input type="number">',
		'slider': '<input type="range">',
		'file': '<input type="file">',
		'textarea': '<textarea></textarea>',
	}
	
	const create = (conf) => {
		let wrapper, el, input
		
		if (presets[conf.type]) {
			wrapper = document.createElement('div')
			wrapper.innerHTML = presets[conf.type].trim()
			el = wrapper.firstChild
		} else {
			el = document.createElement(conf.type || 'div')
		}
		
		const isInput = ['text', 'checkbox', 'radio', 'number', 'slider', 'file'].includes(conf.type)
		
		if (isInput) {
			input = el
			el._input = input
		}
		
		if (isInput && conf.label) {
			const labelWrapper = document.createElement('label')
			labelWrapper.textContent = conf.label
			labelWrapper.style.userSelect = 'none'
			labelWrapper.style.cursor = 'default'
			labelWrapper.appendChild(input)
			el = labelWrapper
		}
		
		const target = input || el
		
		if (conf.iconPath) {
			fetch(conf.iconPath).then(res => res.text()).then(svg => {
				const parser = new DOMParser()
				const doc = parser.parseFromString(svg, 'image/svg+xml')
				const svgEl = doc.documentElement
				svgEl.removeAttribute('width')
				svgEl.removeAttribute('height')
				svgEl.classList.add('icon-svg')
				if (conf.iconPosition === 'right') {
					if (conf.text) el.appendChild(document.createTextNode(conf.text + ' '))
					el.appendChild(svgEl)
				} else {
					el.appendChild(svgEl)
					if (conf.text) el.appendChild(document.createTextNode(' ' + conf.text))
				}
			}).catch(() => {})
		} else if (conf.icon) {
			const icon = document.createElement('i')
			icon.className = `fas fa-${conf.icon} icon`
			if (conf.iconPosition === 'right') {
				if (conf.text) el.appendChild(document.createTextNode(conf.text + ' '))
				el.appendChild(icon)
			} else {
				el.appendChild(icon)
				if (conf.text) el.appendChild(document.createTextNode(' ' + conf.text))
			}
		} else if (conf.text && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
			el.textContent = conf.text
		}
		
		if (conf.iconSVG) {
			const temp = document.createElement('div')
			temp.innerHTML = conf.iconSVG.trim()
			el.appendChild(temp.firstChild)
		}
		
		if (conf.span) {
			const span = document.createElement('span')
			span.textContent = conf.span
			el.appendChild(span)
		}
		
		if (conf.minText) {
			const minText = document.createElement('span')
			minText.className = 'min'
			minText.textContent = conf.minText
			el.appendChild(minText)
		}
		
		if (conf.decoration !== false && (conf.decoration || conf.dropdown)) {
			const deco = document.createElement('span')
			deco.className = `decoration_${conf.decoration || 'dropdown'}`
			el.appendChild(deco)
		}
		
		if (conf.id) target.id = conf.id
		if (conf.hidden) target.classList.add('hidden')
		if (conf.class) target.classList.add(...conf.class.split(' '))
		
		if (conf.style) {
			for (let key in conf.style) {
				if (Object.prototype.hasOwnProperty.call(conf.style, key)) {
					if (isNaN(key)) {
						target.style[key] = conf.style[key]
					}
				}
			}
		}
		
		if (conf.attrs) {
			for (let key in conf.attrs) {
				if (Object.prototype.hasOwnProperty.call(conf.attrs, key)) {
					target.setAttribute(key, conf.attrs[key])
				}
			}
		}
		
		if (conf.data) {  
		  for (let key in conf.data) {  
		    if (Object.prototype.hasOwnProperty.call(conf.data, key)) {  
		      target.dataset[key] = conf.data[key]  
		    }  
		  }  
		}
		
		if (conf.tooltip) target.title = conf.tooltip
		
		for (let key in conf) {
			if (conf.hasOwnProperty(key) && key.startsWith('on') && typeof conf[key] === 'function') {
				const fn = conf[key]
				const event = key.slice(2)
				if (input && (event === 'input' || event === 'change')) {
					input.addEventListener(event, e => fn(e.target))
				} else {
					target.addEventListener(event, () => fn(target))
				}
			}
		}
		
		if (conf.toggleElement) {
			target.addEventListener('click', () => {
				document.querySelectorAll(conf.toggleElement).forEach(t => t.classList.toggle('hidden'))
			})
		}
		
		if (conf.showElement) {
			target.addEventListener('click', () => {
				if (conf.group) {
					document.querySelectorAll(`[data-group="${conf.group}"]`).forEach(btn => {
						if (btn !== target && btn._conf?.showElement) {
							document.querySelectorAll(btn._conf.showElement).forEach(elm => elm.classList.add('hidden'))
						}
					})
				}
				document.querySelectorAll(conf.showElement).forEach(t => t.classList.remove('hidden'))
			})
		}
		
		if (conf.hideElement) {
			target.addEventListener('click', () => {
				document.querySelectorAll(conf.hideElement).forEach(t => t.classList.add('hidden'))
			})
		}
		
		if (conf.dropdown) {
			target.addEventListener('click', (e) => {
				e.stopPropagation()
				const targetDrop = document.querySelector(conf.dropdown)
				if (!targetDrop) return
				const parentDropdown = target.closest('.dropdown')
				document.querySelectorAll('.dropdown').forEach(drop => {
					if (drop !== targetDrop && drop !== parentDropdown && drop.parentElement === parentDropdown?.parentElement) {
						drop.classList.add('hidden')
					}
				})
				targetDrop.classList.toggle('hidden')
				if (!targetDrop.classList.contains('hidden') && targetDrop.dataset.autoAlign) {
					const btnRect = target.getBoundingClientRect()
					const dropRect = targetDrop.getBoundingClientRect()
					const bodyRect = document.body.getBoundingClientRect()
					let left = btnRect.right
					let top = btnRect.top
					if (left + dropRect.width > bodyRect.width) {
						left = btnRect.left - dropRect.width
					}
					if (top + dropRect.height > bodyRect.height) {
						top = bodyRect.height - dropRect.height
					}
					targetDrop.style.position = 'absolute'
					targetDrop.style.left = `${Math.max(0, left)}px`
					targetDrop.style.top = `${Math.max(0, top)}px`
				}
			})
		}
		
		if (conf.group) {
			target.dataset.group = conf.group
			if (conf.active) target.classList.add('active')
			target.addEventListener('click', () => {
				document.querySelectorAll(`[data-group="${conf.group}"]`).forEach(btn => btn.classList.remove('active'))
				target.classList.add('active')
			})
		}
		
		if (conf.checked) {
			el.setAttribute('checked', conf.checked)
		}
		
		if (conf.accent) target.classList.add('accent')
		
		if (conf.toggle) {
			target.classList.add('toggle')
			const hasBind = conf.bind && typeof conf.bind === 'object' && conf.bind.object && typeof conf.bind.object === 'object' && conf.bind.key
			if (hasBind) {
				if (conf.bind.object[conf.bind.key]) target.classList.add('active')
				else target.classList.remove('active')
			}
			target.addEventListener('click', () => {
				const isActive = target.classList.toggle('active')
				if (conf.activeIcon) {
					const iconEl = target.querySelector('i')
					if (iconEl) iconEl.className = `fas fa-${isActive ? conf.activeIcon : conf.icon}`
				}
				if (hasBind) {
					conf.bind.object[conf.bind.key] = isActive
				}
			})
		}
		
		if (conf.position) {
			const absolutePositions = ['top', 'right', 'bottom', 'left']
			absolutePositions.forEach(pos => {
				if (conf.position[pos] !== undefined) {
					target.style[pos] = typeof conf.position[pos] === 'number' ? conf.position[pos] + 'px' : conf.position[pos]
				}
			})
			target.style.position = 'absolute'
		}
		
		if (conf.src) {
			el.src = conf.src
		}
		
		if (conf.direction === 'row' || conf.direction === 'column') {
			target.style.display = 'flex'
			target.style.flexDirection = conf.direction
		}
		
		const children = conf.content || conf.children || []
		if (Array.isArray(children)) {
			const contentTarget = el.querySelector('.content') || el
			children.forEach(child => contentTarget.appendChild(create(child)))
		}
		
		if (conf.type === 'menu' && !target.querySelector('.close.btn')) {
			const closeBtn = document.createElement('button')
			closeBtn.className = 'close btn'
			closeBtn.textContent = '×'
			closeBtn.onclick = () => {
				const self = target.id ? document.querySelector(`#${target.id}`) : target
				if (self) self.classList.add('hidden')
			}
			el.appendChild(closeBtn)
		}
		
		if (conf.type === 'modal') {
			const acceptBtn = el.querySelector('.accept')
			if (acceptBtn && typeof conf.onaccept === 'function') {
				acceptBtn.addEventListener('click', () => {
					conf.onaccept(el)
					el.classList.add('hidden')
				}
				)}
				
			
			const cancelBtn = el.querySelector('.cancel')
			if (cancelBtn) {
				cancelBtn.addEventListener('click', () => el.classList.add('hidden'))
			}
		}
		
		if (conf.autoAlign && conf.type === 'dropdown' && conf.id) el.dataset.autoAlign = 'true'
		
		if (conf.type === 'floating-toolbar') {
			el.classList.add('floating-toolbar')
			const pos = conf.position
			const dir = conf.direction
			if (pos === 'left') el.style.left = '0'
			if (pos === 'right') el.style.right = '0'
			if (pos === 'top') el.style.top = '0'
			if (pos === 'bottom') el.style.bottom = '0'
			if (dir === 'row') el.style.flexDirection = 'row'
			if (dir === 'column') el.style.flexDirection = 'column'
			el.style.position = 'absolute'
		}
		
		el._conf = conf
		return el
	}
	
	if (!document._dropdownHandlerAttached) {
		document.addEventListener('click', () => {
			document.querySelectorAll('.dropdown').forEach(drop => drop.classList.add('hidden'))
		})
		document._dropdownHandlerAttached = true
	}
	
	const result = create(config)
	parent.appendChild(result)
	return result
}

	clear(selector) {
		let selectors = document.querySelectorAll(selector)
		
		selectors.forEach((el) => {
			el.innerHTML = ''
		})
	}
	
active(element) {
	if (!element || !element.dataset.group) return
	const group = element.dataset.group
	document.querySelectorAll(`[data-group="${group}"]`).forEach(el => el.classList.remove('active'))
	element.classList.add('active')
}

get(selector, element = document) {
	return element.querySelector(selector)
}

  playSound(path, volume = 1, loop = false) {
	  let audio = new Audio(path)
	  audio.volume = volume
	  audio.loop = loop
	  audio.play()
	}
	
	// THEMES
setTheme(theme) {
	const themes = { dark: this.darkTheme, light: this.lightTheme, soft: this.softTheme }
	const selected = themes[theme]
	if (!selected) return
	const root = document.documentElement
	for (const key in selected) {
		root.style.setProperty(`--${key}`, selected[key])
	}
	localStorage.setItem('ui-theme', theme)
}
loadTheme() {
	const saved = localStorage.getItem('ui-theme')
	if (saved) this.setTheme(saved)
	
	this.onLoadTheme(saved)
}


saveToLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
loadFromLocal(key) {
	const data = localStorage.getItem(key)
	return data ? JSON.parse(data) : null
}
}

let ui = new UIBuilder()