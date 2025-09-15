// browserBackFix.js - Simple and robust browser back navigation fix for vibe pages
// Handles animation reset without complex state management

class BrowserBackFix {
  constructor() {
    this.currentPage = null;
    this.hasAnimated = new Map();
    this.resetTimers = new Map();
    this.isResetting = false;
    
    this.init();
  }
  
  init() {
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.handlePageVisible();
      }
    });
    
    // Listen for page show (handles browser back)
    window.addEventListener('pageshow', (event) => {
      if (event.persisted || performance.navigation.type === 2) {
        // Page came from cache (browser back)
        setTimeout(() => this.handlePageVisible(), 50);
      }
    });
    
    // Listen for DOMContentLoaded on each page
    document.addEventListener('DOMContentLoaded', () => {
      this.detectAndSetupCurrentPage();
    });
    
    // Listen for Barba.js transitions
    document.addEventListener('barba:afterEnter', () => {
      setTimeout(() => this.detectAndSetupCurrentPage(), 100);
    });
  }
  
  detectAndSetupCurrentPage() {
    const container = document.querySelector('[data-barba-container]');
    if (!container) return;
    
    const namespace = container.dataset.barbaNamespace;
    if (['serenity', 'spirit', 'texture', 'adventure', 'commencement'].includes(namespace)) {
      this.currentPage = namespace;
      this.setupPageResetLogic(namespace);
    }
  }
  
  setupPageResetLogic(pageName) {
    // Clear any existing reset timer
    if (this.resetTimers.has(pageName)) {
      clearTimeout(this.resetTimers.get(pageName));
    }
    
    // Check if page needs reset after a small delay
    const timer = setTimeout(() => {
      this.checkAndResetPage(pageName);
    }, 200);
    
    this.resetTimers.set(pageName, timer);
  }
  
  handlePageVisible() {
    if (this.currentPage && !this.isResetting) {
      this.checkAndResetPage(this.currentPage);
    }
  }
  
  checkAndResetPage(pageName) {
    if (this.isResetting) return;
    
    // Check if animations have run but page looks like it needs reset
    if (this.needsReset(pageName)) {
      this.resetPage(pageName);
    }
  }
  
  needsReset(pageName) {
    // Check key animation elements to see if they're in final state but should restart
    const brushPath = document.getElementById(`${pageName}BrushPath`);
    const textElement = document.querySelector(`text[mask="url(#${pageName}BrushMask)"]`);
    const subtitle = document.querySelector(`.${pageName}-subtitle`);
    const scrollIndicator = document.querySelector(`.${pageName}-scroll`);
    
    // If brush animation completed but page just became visible, likely needs reset
    const brushCompleted = brushPath && brushPath.style.strokeDashoffset === '0';
    const textVisible = textElement && textElement.style.opacity === '1';
    const subtitleVisible = subtitle && subtitle.style.opacity === '1';
    const scrollVisible = scrollIndicator && scrollIndicator.style.opacity === '1';
    
    // Determine if we're in a state that suggests browser back
    const isInFinalState = brushCompleted && textVisible && subtitleVisible && scrollVisible;
    const justBecameVisible = document.visibilityState === 'visible';
    
    // Check if title is in viewport (if yes, animations should be running)
    const title = document.querySelector(`.${pageName}-title`);
    const titleInView = title && this.isElementInViewport(title);
    
    return isInFinalState && titleInView && justBecameVisible;
  }
  
  resetPage(pageName) {
    if (this.isResetting) return;
    
    this.isResetting = true;
    
    try {
      // Reset animation elements to initial state
      this.resetAnimationElements(pageName);
      
      // Reset gallery state
      this.resetGalleryState(pageName);
      
      // Mark as needs animation
      this.hasAnimated.set(pageName, false);
      
      // Wait a moment then check if we should trigger animations
      setTimeout(() => {
        this.triggerAnimationsIfNeeded(pageName);
        this.isResetting = false;
      }, 100);
      
    } catch (error) {
      console.error('Error resetting page:', error);
      this.isResetting = false;
    }
  }
  
  resetAnimationElements(pageName) {
    // Reset paintbrush animation
    const brushPath = document.getElementById(`${pageName}BrushPath`);
    const textElement = document.querySelector(`text[mask="url(#${pageName}BrushMask)"]`);
    
    if (brushPath && textElement) {
      brushPath.style.strokeDashoffset = '2800';
      brushPath.setAttribute('stroke-width', '0');
      textElement.style.opacity = '0';
    }
    
    // Reset subtitle
    const subtitle = document.querySelector(`.${pageName}-subtitle`);
    if (subtitle) {
      subtitle.style.opacity = '0';
      subtitle.style.transform = 'translateY(20px) scale(0.95)';
    }
    
    // Reset subtitle tape
    const subtitleTape = document.querySelector(`.${pageName}-subtitle-container .subtitle-tape`);
    if (subtitleTape) {
      subtitleTape.style.opacity = '0';
      subtitleTape.style.transform = 'translateX(-50%) rotate(-8deg) scale(1)';
    }
    
    // Reset scroll indicator
    const scrollIndicator = document.querySelector(`.${pageName}-scroll`);
    if (scrollIndicator) {
      scrollIndicator.style.opacity = '0';
    }
    
    // Reset background color
    const section = document.querySelector(`.${pageName}-section`);
    if (section) {
      section.style.backgroundColor = 'white';
    }
    
    // Reset CTA button
    const cta = document.querySelector(`.${pageName}-cta`);
    if (cta) {
      cta.style.opacity = '0';
      cta.classList.remove('revealed');
    }
  }
  
  resetGalleryState(pageName) {
    // Reset to first image
    if (window[`${pageName}CurrentIndex`] !== undefined) {
      window[`${pageName}CurrentIndex`] = 0;
    }
    
    const currentIndexElement = document.getElementById(`${pageName}-current-index`);
    if (currentIndexElement) {
      currentIndexElement.textContent = '1';
    }
    
    // Reset to first image source
    const imageElement = document.getElementById(`current-${pageName}-image`);
    if (imageElement && window[`${pageName}Images`] && window[`${pageName}Images`].length > 0) {
      imageElement.src = window[`${pageName}Images`][0].src;
    }
    
    // Reset tapes
    this.resetTapes(pageName);
  }
  
  resetTapes(pageName) {
    const tapesContainer = document.getElementById(`${pageName}-tapes-container`);
    if (!tapesContainer || !window[`${pageName}Images`]) return;
    
    tapesContainer.innerHTML = '';
    
    const firstImage = window[`${pageName}Images`][0];
    if (firstImage && firstImage.tapes) {
      firstImage.tapes.forEach((tape, index) => {
        const tapeEl = this.createTapeElement(tape, index, pageName);
        tapesContainer.appendChild(tapeEl);
      });
    }
  }
  
  createTapeElement(tape, index, pageName) {
    const tapeEl = document.createElement('div');
    tapeEl.className = `${pageName}-tape tape-${index}`;
    tapeEl.style.cssText = `
      position: absolute;
      width: ${tape.width}px;
      height: ${tape.height}px;
      background: rgba(255,255,255,0.9);
      border: 1px solid #ddd;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 10;
      transform: rotate(${tape.rotation}deg) ${tape.transform || ''};
    `;
    
    if (tape.top !== undefined) tapeEl.style.top = tape.top + 'px';
    if (tape.bottom !== undefined) tapeEl.style.bottom = tape.bottom + 'px';
    if (tape.left !== undefined) {
      tapeEl.style.left = typeof tape.left === 'string' ? tape.left : tape.left + 'px';
    }
    if (tape.right !== undefined) tapeEl.style.right = tape.right + 'px';
    
    return tapeEl;
  }
  
  triggerAnimationsIfNeeded(pageName) {
    const title = document.querySelector(`.${pageName}-title`);
    if (title && this.isElementInViewport(title)) {
      // Force trigger animations by dispatching a custom event
      const event = new CustomEvent('forceAnimationTrigger', {
        detail: { pageName }
      });
      document.dispatchEvent(event);
    }
  }
  
  isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    );
  }
  
  // Public method to manually trigger reset
  forceReset(pageName = null) {
    const page = pageName || this.currentPage;
    if (page) {
      this.resetPage(page);
    }
  }
  
  destroy() {
    this.resetTimers.forEach(timer => clearTimeout(timer));
    this.resetTimers.clear();
    this.hasAnimated.clear();
  }
}

// Initialize the fix
let browserBackFix = null;

export function initBrowserBackFix() {
  if (!browserBackFix) {
    browserBackFix = new BrowserBackFix();
  }
  return browserBackFix;
}

export function getBrowserBackFix() {
  return browserBackFix;
}

export function destroyBrowserBackFix() {
  if (browserBackFix) {
    browserBackFix.destroy();
    browserBackFix = null;
  }
}