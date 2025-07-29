// LONG PRESS
(function() {
  const LONGPRESS_TIME = 500;
  const MOVE_THRESHOLD = 5;
  const elements = new WeakMap();
  
  function setup(element) {
    if (elements.has(element)) return;
    
    let timer;
    let startX, startY;
    let active = false;
    
    function start(e) {
      if (e.type === 'touchstart') {
        if (e.touches.length !== 1) return; // solo un dedo
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
      } else {
        startX = e.clientX;
        startY = e.clientY;
      }
      
      active = true;
      timer = setTimeout(() => {
        const event = new CustomEvent('longpress', { detail: { originalEvent: e } });
        element.dispatchEvent(event);
      }, LONGPRESS_TIME);
    }
    
    function cancel() {
      active = false;
      clearTimeout(timer);
    }
    
    function move(e) {
      if (!active) return;
      
      const point = e.touches ? e.touches[0] : e;
      const dx = Math.abs(point.clientX - startX);
      const dy = Math.abs(point.clientY - startY);
      
      if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
        cancel();
      }
    }
    
    function checkTouchCount(e) {
      if (e.touches && e.touches.length > 1) {
        cancel(); // multi-touch detectado → cancelamos
      }
    }
    
    element.addEventListener('mousedown', start);
    element.addEventListener('mouseup', cancel);
    element.addEventListener('mouseleave', cancel);
    element.addEventListener('mousemove', move);
    
    element.addEventListener('touchstart', start, { passive: true });
    element.addEventListener('touchend', cancel);
    element.addEventListener('touchmove', move, { passive: true });
    element.addEventListener('touchmove', checkTouchCount, { passive: true });
    
    elements.set(element, true);
  }
  
  const originalAddEventListener = Element.prototype.addEventListener;
  
  Element.prototype.addEventListener = function(type, listener, options) {
    if (type === 'longpress') setup(this);
    return originalAddEventListener.call(this, type, listener, options);
  };
})();

// DOUBLE TOUCH
(function() {
  const MOVE_THRESHOLD = 5;
  const elements = new WeakMap();
  
  function setup(element) {
    if (elements.has(element)) return;
    
    let pointers = new Map();
    let twoFinger = false;
    
    function onPointerDown(e) {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, moved: false });
      if (pointers.size === 2) {
        twoFinger = true;
      }
    }
    
    function onPointerMove(e) {
      const data = pointers.get(e.pointerId);
      if (!data || data.moved) return;
      if (Math.abs(e.clientX - data.x) > MOVE_THRESHOLD || Math.abs(e.clientY - data.y) > MOVE_THRESHOLD) {
        data.moved = true;
        pointers.set(e.pointerId, data);
      }
    }
    
    function onPointerUp(e) {
      if (!twoFinger) {
        pointers.delete(e.pointerId);
        return;
      }
      if (pointers.size === 2) {
        const allStatic = Array.from(pointers.values()).every(d => !d.moved);
        if (allStatic) {
          const event = new CustomEvent('doubletouch', { detail: { originalEvent: e } });
          element.dispatchEvent(event);
        }
      }
      twoFinger = false;
      pointers.clear();
    }
    
    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointercancel', onPointerUp);
    
    elements.set(element, true);
  }
  
  const originalAddEventListener = Element.prototype.addEventListener;
  Element.prototype.addEventListener = function(type, listener, options) {
    if (type === 'doubletouch') setup(this);
    return originalAddEventListener.call(this, type, listener, options);
  };
})();

// TRIPLE TOUCH
(function() {
  const MOVE_THRESHOLD = 5;
  const elements = new WeakMap();
  
  function setup(element) {
    if (elements.has(element)) return;
    
    let pointers = new Map();
    let threeFinger = false;
    
    function onPointerDown(e) {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, moved: false });
      if (pointers.size === 3) {
        threeFinger = true;
      }
    }
    
    function onPointerMove(e) {
      const data = pointers.get(e.pointerId);
      if (!data || data.moved) return;
      if (Math.abs(e.clientX - data.x) > MOVE_THRESHOLD || Math.abs(e.clientY - data.y) > MOVE_THRESHOLD) {
        data.moved = true;
        pointers.set(e.pointerId, data);
      }
    }
    
    function onPointerUp(e) {
      if (!threeFinger) {
        pointers.delete(e.pointerId);
        return;
      }
      if (pointers.size === 3) {
        const allStatic = Array.from(pointers.values()).every(d => !d.moved);
        if (allStatic) {
          const event = new CustomEvent('tripletouch', { detail: { originalEvent: e } });
          element.dispatchEvent(event);
        }
      }
      threeFinger = false;
      pointers.clear();
    }
    
    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointercancel', onPointerUp);
    
    elements.set(element, true);
  }
  
  const originalAddEventListener = Element.prototype.addEventListener;
  Element.prototype.addEventListener = function(type, listener, options) {
    if (type === 'tripletouch') setup(this);
    return originalAddEventListener.call(this, type, listener, options);
  };
})();