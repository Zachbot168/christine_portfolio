// vibePageManager.js - Centralized state management for vibe gallery pages
// Handles browser back navigation, state restoration, and animation re-triggering

class VibePageManager {
  constructor() {
    this.pageStates = new Map();
    this.observers = new Map();
    this.animationTimers = new Map();
    this.isResetting = false;
    
    // Bind methods to preserve context
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handlePageShow = this.handlePageShow.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    
    this.init();
  }
  
  init() {
    // Listen for page visibility changes (tab switching, browser back)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Listen for page show events (browser back button)
    window.addEventListener('pageshow', this.handlePageShow);
    
    // Listen for page unload to clean up
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    
    // Listen for Barba.js events
    document.addEventListener('barba:afterEnter', (event) => {
      this.handlePageEnter(event.detail.namespace);
    });
    
    document.addEventListener('barba:beforeLeave', (event) => {
      this.handlePageLeave(event.detail.namespace);
    });
  }
  
  // Detect which vibe page we're on
  detectCurrentPage() {
    const namespace = document.querySelector('[data-barba-container]')?.dataset.barbaNamespace;
    if (namespace && ['serenity', 'spirit', 'texture', 'adventure', 'commencement'].includes(namespace)) {
      return namespace;
    }
    return null;
  }
  
  // Get default state for a page
  getDefaultPageState(pageName) {
    return {
      hasAnimated: false,
      currentImageIndex: 0,
      scrollPosition: 0,
      backgroundTransitioned: false,
      subtitleRevealed: false,
      tapesAnimated: false,
      scrollIndicatorShown: false,
      ctaRevealed: false
    };
  }
  
  // Save current page state
  savePageState(pageName) {
    if (!pageName) return;
    
    const state = {
      hasAnimated: true, // Always mark as animated when leaving
      currentImageIndex: this.getCurrentImageIndex(pageName),
      scrollPosition: this.getCurrentScrollPosition(),
      backgroundTransitioned: this.hasBackgroundTransitioned(pageName),
      subtitleRevealed: this.hasSubtitleRevealed(pageName),
      tapesAnimated: this.hasTapesAnimated(pageName),
      scrollIndicatorShown: this.hasScrollIndicatorShown(pageName),
      ctaRevealed: this.hasCtaRevealed(pageName)
    };
    
    this.pageStates.set(pageName, state);
  }
  
  // Restore page state
  restorePageState(pageName) {
    if (!pageName) return;
    
    const savedState = this.pageStates.get(pageName);
    if (!savedState) return;
    
    // If we're coming back to a page, we want to reset it for fresh animation
    this.resetPageForFreshAnimation(pageName);
  }
  
  // Reset page to allow animations to re-trigger
  resetPageForFreshAnimation(pageName) {
    if (!pageName || this.isResetting) return;
    
    this.isResetting = true;
    
    try {
      // Clear any existing timers
      this.clearAllTimers(pageName);
      
      // Reset visual elements to initial state
      this.resetVisualElements(pageName);
      
      // Reset animation flags
      this.resetAnimationFlags(pageName);
      
      // Reset gallery state
      this.resetGalleryState(pageName);
      
      // Recreate observers
      this.recreateObservers(pageName);
      
      // Force re-initialization of page animations
      setTimeout(() => {
        this.reinitializePageAnimations(pageName);
        this.isResetting = false;
      }, 100);
      
    } catch (error) {
      console.error(`Error resetting ${pageName} page:`, error);
      this.isResetting = false;
    }
  }
  
  // Reset visual elements to initial state
  resetVisualElements(pageName) {
    const selectors = {
      title: `.${pageName}-title`,
      section: `.${pageName}-section`,
      subtitle: `.${pageName}-subtitle`,
      subtitleTape: `.${pageName}-subtitle-container .subtitle-tape`,
      scrollIndicator: `.${pageName}-scroll`,
      cta: `.${pageName}-cta`,
      brushPath: `#${pageName}BrushPath`,
      textElement: `text[mask="url(#${pageName}BrushMask)"]`
    };
    
    // Reset section background
    const section = document.querySelector(selectors.section);
    if (section) {
      section.style.backgroundColor = 'white';
      section.classList.remove('background-transitioned');
    }
    
    // Reset paintbrush animation
    const brushPath = document.getElementById(`${pageName}BrushPath`);
    const textElement = document.querySelector(`text[mask="url(#${pageName}BrushMask)"]`);
    
    if (brushPath && textElement) {
      brushPath.style.strokeDashoffset = '2800';
      brushPath.setAttribute('stroke-width', '0');
      textElement.style.opacity = '0';
    }
    
    // Reset subtitle and tape
    const subtitle = document.querySelector(selectors.subtitle);
    const subtitleTape = document.querySelector(selectors.subtitleTape);
    
    if (subtitle) {
      subtitle.style.opacity = '0';
      subtitle.style.transform = 'translateY(20px) scale(0.95)';
    }
    
    if (subtitleTape) {
      subtitleTape.style.opacity = '0';
      subtitleTape.style.transform = 'translateX(-50%) rotate(-8deg) scale(1)';
    }
    
    // Reset scroll indicator
    const scrollIndicator = document.querySelector(selectors.scrollIndicator);
    if (scrollIndicator) {
      scrollIndicator.style.opacity = '0';
    }
    
    // Reset CTA
    const cta = document.querySelector(selectors.cta);
    if (cta) {
      cta.style.opacity = '0';
      cta.classList.remove('revealed');
    }
  }
  
  // Reset animation flags by clearing the global hasAnimated variable
  resetAnimationFlags(pageName) {
    // Since the hasAnimated variable is scoped to the page's script,
    // we'll need to work around this by forcing a re-trigger
    
    // Remove any data attributes that might track animation state
    const title = document.querySelector(`.${pageName}-title`);
    if (title) {
      title.removeAttribute('data-animated');
      title.classList.remove('animated');
    }
    
    // Clear page state
    this.pageStates.set(pageName, this.getDefaultPageState(pageName));
  }
  
  // Reset gallery to first image
  resetGalleryState(pageName) {
    const imageElement = document.getElementById(`current-${pageName}-image`);
    const currentIndexElement = document.getElementById(`${pageName}-current-index`);
    
    if (currentIndexElement) {
      currentIndexElement.textContent = '1';
    }
    
    // Reset to first image if we have the images array available
    if (window[`${pageName}Images`] && window[`${pageName}Images`].length > 0) {
      if (imageElement) {
        imageElement.src = window[`${pageName}Images`][0].src;
      }
      
      // Reset current index
      if (window[`${pageName}CurrentIndex`] !== undefined) {
        window[`${pageName}CurrentIndex`] = 0;
      }
      
      // Reset tapes for first image
      this.resetTapesToFirstImage(pageName);
    }
  }
  
  // Reset tapes to first image configuration
  resetTapesToFirstImage(pageName) {
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
  
  // Create tape element (helper function)
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
    
    // Set position
    if (tape.top !== undefined) tapeEl.style.top = tape.top + 'px';
    if (tape.bottom !== undefined) tapeEl.style.bottom = tape.bottom + 'px';
    if (tape.left !== undefined) {
      tapeEl.style.left = typeof tape.left === 'string' ? tape.left : tape.left + 'px';
    }
    if (tape.right !== undefined) tapeEl.style.right = tape.right + 'px';
    
    return tapeEl;
  }
  
  // Recreate intersection observers
  recreateObservers(pageName) {
    // Clear existing observers for this page
    const existingObserver = this.observers.get(pageName);
    if (existingObserver) {
      existingObserver.disconnect();
    }
    
    // Create new observer that doesn't disconnect after first use
    const title = document.querySelector(`.${pageName}-title`);
    if (!title) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isResetting) {
          // Add a small delay to ensure everything is ready
          setTimeout(() => {
            this.triggerPageAnimations(pageName);
          }, 100);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px'
    });
    
    observer.observe(title);
    this.observers.set(pageName, observer);
  }
  
  // Force re-initialization of page animations
  reinitializePageAnimations(pageName) {
    // Trigger the scroll-based animation check
    const title = document.querySelector(`.${pageName}-title`);
    if (title) {
      // Temporarily mark as not animated to force re-trigger
      const rect = title.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isInView) {
        this.triggerPageAnimations(pageName);
      }
    }
  }
  
  // Trigger all page animations
  triggerPageAnimations(pageName) {
    if (this.isResetting) return;
    
    // Mark as animated to prevent double-triggering during this session
    const state = this.pageStates.get(pageName) || this.getDefaultPageState(pageName);
    state.hasAnimated = true;
    this.pageStates.set(pageName, state);
    
    // Trigger paintbrush animation
    this.triggerPaintbrushAnimation(pageName);
    
    // Schedule subsequent animations
    this.scheduleSubsequentAnimations(pageName);
  }
  
  // Trigger paintbrush animation
  triggerPaintbrushAnimation(pageName) {
    const brushPath = document.getElementById(`${pageName}BrushPath`);
    const textElement = document.querySelector(`text[mask="url(#${pageName}BrushMask)"]`);
    
    if (!brushPath || !textElement) return;
    
    // Make text visible first
    textElement.style.opacity = '1';
    
    // Start with width 0 for paper tearing effect
    brushPath.setAttribute('stroke-width', '0');
    
    // Start the brush stroke animation (left to right reveal)
    const strokeTimer = setTimeout(() => {
      brushPath.style.strokeDashoffset = '0';
    }, 500);
    
    this.addTimer(pageName, 'stroke', strokeTimer);
    
    // Paper tearing width animation
    const tearingTimer = setTimeout(() => {
      this.animateChoppyTearing(brushPath, pageName);
    }, 1000);
    
    this.addTimer(pageName, 'tearing', tearingTimer);
  }
  
  // Animate choppy tearing effect
  animateChoppyTearing(brushPath, pageName) {
    const frames = [0, 20, 45, 70, 80];
    let currentFrame = 0;
    
    const animateChoppy = () => {
      if (currentFrame < frames.length) {
        brushPath.setAttribute('stroke-width', frames[currentFrame]);
        currentFrame++;
        const frameTimer = setTimeout(animateChoppy, 100);
        this.addTimer(pageName, `frame-${currentFrame}`, frameTimer);
      } else {
        // Start random width switching after tearing animation completes
        const randomTimer = setTimeout(() => {
          this.startRandomWidthSwitching(brushPath, pageName);
        }, 300);
        this.addTimer(pageName, 'random-start', randomTimer);
      }
    };
    
    animateChoppy();
  }
  
  // Start random width switching
  startRandomWidthSwitching(brushPath, pageName) {
    const widths = [60, 80, 100];
    
    const widthInterval = setInterval(() => {
      if (this.isResetting) {
        clearInterval(widthInterval);
        return;
      }
      
      const randomWidth = widths[Math.floor(Math.random() * widths.length)];
      brushPath.setAttribute('stroke-width', randomWidth);
    }, 1000);
    
    this.addTimer(pageName, 'width-interval', widthInterval);
  }
  
  // Schedule subsequent animations
  scheduleSubsequentAnimations(pageName) {
    // Show subtitle after paintbrush animation
    const subtitleTimer = setTimeout(() => {
      this.animateSubtitle(pageName);
    }, 1000);
    
    this.addTimer(pageName, 'subtitle', subtitleTimer);
    
    // Show scroll indicator
    const scrollTimer = setTimeout(() => {
      this.animateScrollIndicator(pageName);
    }, 2200);
    
    this.addTimer(pageName, 'scroll', scrollTimer);
  }
  
  // Animate subtitle appearance
  animateSubtitle(pageName) {
    const subtitle = document.querySelector(`.${pageName}-subtitle`);
    const subtitleTape = document.querySelector(`.${pageName}-subtitle-container .subtitle-tape`);
    
    if (subtitle) {
      subtitle.style.opacity = '1';
      subtitle.style.transform = 'translateY(0) scale(1)';
    }
    
    // Animate tape after subtitle
    if (subtitleTape) {
      const tapeTimer = setTimeout(() => {
        subtitleTape.style.opacity = '1';
        subtitleTape.style.transform = 'translateX(-50%) rotate(-8deg) scale(1.1)';
        
        // Settle tape to normal size
        const settleTimer = setTimeout(() => {
          subtitleTape.style.transform = 'translateX(-50%) rotate(-8deg) scale(1)';
        }, 200);
        
        this.addTimer(pageName, 'tape-settle', settleTimer);
      }, 400);
      
      this.addTimer(pageName, 'tape', tapeTimer);
    }
  }
  
  // Animate scroll indicator
  animateScrollIndicator(pageName) {
    const scrollIndicator = document.querySelector(`.${pageName}-scroll`);
    if (scrollIndicator) {
      scrollIndicator.style.opacity = '1';
    }
  }
  
  // Timer management
  addTimer(pageName, timerName, timer) {
    if (!this.animationTimers.has(pageName)) {
      this.animationTimers.set(pageName, new Map());
    }
    
    const pageTimers = this.animationTimers.get(pageName);
    
    // Clear existing timer with same name
    if (pageTimers.has(timerName)) {
      clearTimeout(pageTimers.get(timerName));
      clearInterval(pageTimers.get(timerName));
    }
    
    pageTimers.set(timerName, timer);
  }
  
  // Clear all timers for a page
  clearAllTimers(pageName) {
    const pageTimers = this.animationTimers.get(pageName);
    if (pageTimers) {
      pageTimers.forEach((timer) => {
        clearTimeout(timer);
        clearInterval(timer);
      });
      pageTimers.clear();
    }
  }
  
  // Utility functions to check current state
  getCurrentImageIndex(pageName) {
    const currentIndexElement = document.getElementById(`${pageName}-current-index`);
    return currentIndexElement ? parseInt(currentIndexElement.textContent) - 1 : 0;
  }
  
  getCurrentScrollPosition() {
    const scrollContainer = document.querySelector('[data-controller="scroll-animations"]');
    if (scrollContainer && scrollContainer.locomotive) {
      return scrollContainer.locomotive.scroll.instance.scroll.y;
    }
    return window.pageYOffset || document.documentElement.scrollTop;
  }
  
  hasBackgroundTransitioned(pageName) {
    const section = document.querySelector(`.${pageName}-section`);
    return section ? section.style.backgroundColor !== 'white' : false;
  }
  
  hasSubtitleRevealed(pageName) {
    const subtitle = document.querySelector(`.${pageName}-subtitle`);
    return subtitle ? subtitle.style.opacity === '1' : false;
  }
  
  hasTapesAnimated(pageName) {
    const subtitleTape = document.querySelector(`.${pageName}-subtitle-container .subtitle-tape`);
    return subtitleTape ? subtitleTape.style.opacity === '1' : false;
  }
  
  hasScrollIndicatorShown(pageName) {
    const scrollIndicator = document.querySelector(`.${pageName}-scroll`);
    return scrollIndicator ? scrollIndicator.style.opacity === '1' : false;
  }
  
  hasCtaRevealed(pageName) {
    const cta = document.querySelector(`.${pageName}-cta`);
    return cta ? cta.classList.contains('revealed') : false;
  }
  
  // Event handlers
  handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      const currentPage = this.detectCurrentPage();
      if (currentPage) {
        // Small delay to ensure page is fully visible
        setTimeout(() => {
          this.resetPageForFreshAnimation(currentPage);
        }, 100);
      }
    }
  }
  
  handlePageShow(event) {
    // This specifically handles browser back button
    if (event.persisted) {
      const currentPage = this.detectCurrentPage();
      if (currentPage) {
        setTimeout(() => {
          this.resetPageForFreshAnimation(currentPage);
        }, 100);
      }
    }
  }
  
  handlePageEnter(namespace) {
    if (['serenity', 'spirit', 'texture', 'adventure', 'commencement'].includes(namespace)) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        this.resetPageForFreshAnimation(namespace);
      }, 200);
    }
  }
  
  handlePageLeave(namespace) {
    if (['serenity', 'spirit', 'texture', 'adventure', 'commencement'].includes(namespace)) {
      this.savePageState(namespace);
      this.clearAllTimers(namespace);
      
      // Disconnect observers
      const observer = this.observers.get(namespace);
      if (observer) {
        observer.disconnect();
      }
    }
  }
  
  handleBeforeUnload() {
    const currentPage = this.detectCurrentPage();
    if (currentPage) {
      this.savePageState(currentPage);
    }
    
    // Clean up all observers and timers
    this.observers.forEach(observer => observer.disconnect());
    this.animationTimers.forEach(pageTimers => {
      pageTimers.forEach(timer => {
        clearTimeout(timer);
        clearInterval(timer);
      });
    });
  }
  
  // Public methods for manual control
  forceResetPage(pageName = null) {
    const page = pageName || this.detectCurrentPage();
    if (page) {
      this.resetPageForFreshAnimation(page);
    }
  }
  
  // Cleanup method
  destroy() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('pageshow', this.handlePageShow);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    
    this.observers.forEach(observer => observer.disconnect());
    this.animationTimers.forEach(pageTimers => {
      pageTimers.forEach(timer => {
        clearTimeout(timer);
        clearInterval(timer);
      });
    });
    
    this.pageStates.clear();
    this.observers.clear();
    this.animationTimers.clear();
  }
}

// Create global instance
let vibePageManager = null;

// Initialize the manager
export function initVibePageManager() {
  if (!vibePageManager) {
    vibePageManager = new VibePageManager();
  }
  return vibePageManager;
}

// Get current instance
export function getVibePageManager() {
  return vibePageManager;
}

// Destroy instance
export function destroyVibePageManager() {
  if (vibePageManager) {
    vibePageManager.destroy();
    vibePageManager = null;
  }
}

export { VibePageManager };