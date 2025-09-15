// pageTransitions.js - Barba.js SPA transitions
// STEP 1: Fade/slide 3vh transitions
// STEP 2: Preserve scroll position  
// STEP 3: Restart Locomotive on afterEnter

import barba from '@barba/core';
import { gsap } from 'gsap';
import { initControllers } from './main.js';
import { resetMenu } from './menuOverlay.js';

// STEP 1: Initialize scroll position tracking
let scrollPositions = new Map();
let currentScrollTop = 0;

// STEP 2: Store scroll position before leaving page
function storeScrollPosition(namespace) {
  const scrollContainer = document.querySelector('[data-controller="scroll-animations"]');
  if (scrollContainer && scrollContainer.locomotive) {
    currentScrollTop = scrollContainer.locomotive.scroll.instance.scroll.y;
    scrollPositions.set(namespace, currentScrollTop);
  } else {
    // Fallback to window scroll position
    currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    scrollPositions.set(namespace, currentScrollTop);
  }
}

// STEP 3: Restore scroll position after entering page
function restoreScrollPosition(namespace) {
  const storedPosition = scrollPositions.get(namespace) || 0;
  
  // Wait for Locomotive Scroll to be initialized
  setTimeout(() => {
    const scrollContainer = document.querySelector('[data-controller="scroll-animations"]');
    if (scrollContainer && scrollContainer.locomotive) {
      scrollContainer.locomotive.scrollTo(storedPosition, { duration: 0, disableLerp: true });
    } else {
      // Fallback to window scroll
      window.scrollTo(0, storedPosition);
    }
  }, 100);
}

// STEP 4: Configure page transition animations
function createTransition() {
  return {
    name: 'fade-slide-transition',
    
    // STEP 4A: Sync transition - both pages animate simultaneously
    sync: true,

    // STEP 4B: Leave animation - fade out current page with 3vh slide down
    leave(data) {
      const { current } = data;
      const currentContainer = current.container;
      
      // Store current scroll position
      const currentNamespace = currentContainer.dataset.barbaNamespace;
      storeScrollPosition(currentNamespace);
      
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion) {
        // Immediate transition for accessibility
        return gsap.set(currentContainer, { opacity: 0 });
      }
      
      // Animate current page out
      return gsap.to(currentContainer, {
        opacity: 0,
        y: '3vh',
        duration: 0.6,
        ease: 'power2.inOut'
      });
    },

    // STEP 4C: Enter animation - fade in new page
    enter(data) {
      const { next } = data;
      const nextContainer = next.container;
      
      // Set initial state for incoming page
      gsap.set(nextContainer, {
        opacity: 0,
        y: 0
      });
      
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion) {
        // Immediate transition for accessibility
        return gsap.set(nextContainer, { opacity: 1 });
      }
      
      // Animate new page in
      return gsap.to(nextContainer, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.inOut',
        delay: 0.2
      });
    },

    // STEP 4D: After enter - reinitialize all systems
    afterEnter(data) {
      const { next } = data;
      const nextNamespace = next.container.dataset.barbaNamespace;

      // Reset menu overlay state
      resetMenu();

      // Force refresh ScrollTrigger before reinitializing
      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }

      // Reinitialize all controllers (including Locomotive Scroll)
      initControllers();

      // Force another ScrollTrigger refresh after controllers are initialized
      setTimeout(() => {
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }
      }, 100);

      // Restore scroll position for returning to a page
      if (scrollPositions.has(nextNamespace)) {
        restoreScrollPosition(nextNamespace);
      }

      // Update document title if available
      const titleElement = next.html.querySelector('title');
      if (titleElement) {
        document.title = titleElement.textContent;
      }

      // Dispatch custom event for other systems
      document.dispatchEvent(new CustomEvent('barba:afterEnter', {
        detail: { namespace: nextNamespace }
      }));
    },

    // STEP 4E: Before leave - cleanup current page systems
    beforeLeave(data) {
      const { current } = data;

      // Cleanup ScrollTrigger instances to prevent conflicts
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      }

      // Cleanup Locomotive Scroll instance
      const scrollContainer = current.container.querySelector('[data-controller="scroll-animations"]');
      if (scrollContainer && scrollContainer.locomotive) {
        scrollContainer.locomotive.destroy();
        scrollContainer.locomotive = null;
      }

      // Cleanup any GSAP timelines that might be running
      if (window.gsap) {
        window.gsap.killTweensOf('*');
      }

      // Reset animation states for fresh start
      const vibeCheckElements = current.container.querySelectorAll('.title-word--vibe, .title-word--check, .title-divider');
      vibeCheckElements.forEach(el => {
        el.classList.remove('revealed');
      });

      // Reset any intersection observers
      if (current.container.vibeCheckObserver) {
        current.container.vibeCheckObserver.disconnect();
        current.container.vibeCheckObserver = null;
      }

      // Dispatch cleanup event
      document.dispatchEvent(new CustomEvent('barba:beforeLeave', {
        detail: { namespace: current.container.dataset.barbaNamespace }
      }));
    }
  };
}

// STEP 5: Configure loading indicator
function setupLoadingIndicator() {
  // Create loading indicator element
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'barba-loading';
  loadingIndicator.innerHTML = '<div class="loading-spinner"></div>';
  
  // Add styles programmatically
  loadingIndicator.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: transparent;
    z-index: 9999;
    opacity: 0;
    pointer-events: none;
  `;
  
  const spinner = loadingIndicator.querySelector('.loading-spinner');
  spinner.style.cssText = `
    width: 0%;
    height: 100%;
    background: linear-gradient(90deg, #D5C7B6, #90867C);
    transition: width 0.3s ease;
  `;
  
  document.body.appendChild(loadingIndicator);
  
  return loadingIndicator;
}

// STEP 6: Handle loading states
function setupLoadingHandlers(loadingIndicator) {
  const spinner = loadingIndicator.querySelector('.loading-spinner');
  
  // Show loading on request start
  barba.hooks.beforeEnter(() => {
    gsap.set(loadingIndicator, { opacity: 1 });
    gsap.to(spinner, { width: '50%', duration: 0.3 });
  });
  
  // Complete loading on content ready
  barba.hooks.afterEnter(() => {
    gsap.to(spinner, { 
      width: '100%', 
      duration: 0.2,
      onComplete: () => {
        gsap.to(loadingIndicator, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            gsap.set(spinner, { width: '0%' });
          }
        });
      }
    });
  });
}

// STEP 7: Error handling for failed transitions
function setupErrorHandling() {
  barba.hooks.beforeEnter((data) => {
    // Validate that new page has required structure
    const container = data.next.container;
    if (!container.dataset.barbaNamespace) {
      console.warn('Page missing data-barba-namespace attribute');
      container.dataset.barbaNamespace = 'default';
    }
  });
  
  // Handle navigation errors
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('barba')) {
      console.error('Barba navigation error:', event.reason);
      // Fallback to standard navigation
      window.location.reload();
    }
  });
}

// STEP 8: Prefetch optimization
function setupPrefetching() {
  // Prefetch pages on hover with delay
  let prefetchTimeout;
  
  document.addEventListener('mouseenter', (event) => {
    if (!event.target || typeof event.target.closest !== 'function') return;
    const link = event.target.closest('a[href]');
    if (link && link.hostname === window.location.hostname) {
      prefetchTimeout = setTimeout(() => {
        barba.prefetch(link.href);
      }, 100); // Small delay to avoid excessive prefetching
    }
  }, true);
  
  document.addEventListener('mouseleave', (event) => {
    if (!event.target || typeof event.target.closest !== 'function') return;
    const link = event.target.closest('a[href]');
    if (link) {
      clearTimeout(prefetchTimeout);
    }
  }, true);
}

// STEP 9: Handle special cases for intro animation
function handleIntroSpecialCase() {
  // Skip transition on first load if intro is present
  const introElement = document.querySelector('#intro-book');
  if (introElement) {
    // Listen for intro completion
    document.addEventListener('intro:done', () => {
      // Enable transitions after intro is complete
      if (barba.transitions.length === 0) {
        barba.use(createTransition());
      }
    });
    
    // Return false to skip initial transition setup
    return false;
  }
  
  return true;
}

// STEP 10: Initialize Barba.js with comprehensive configuration
export function initPageTransitions() {
  try {
    // Check if Barba should initialize immediately or wait for intro
    const shouldInitializeImmediately = handleIntroSpecialCase();
    
    // Initialize Barba.js
    barba.init({
      // STEP 10A: Prevent default browser navigation
      preventRunning: true,
      
      // STEP 10B: Cache management
      cacheIgnore: ['/api/', '/admin/'],
      
      // STEP 10C: Request timeout
      timeout: 10000,
      
      // STEP 10D: Custom request headers for better caching
      requestError: (trigger, action, url, response) => {
        console.error(`Barba request failed: ${url}`, response);
        // Fallback to standard navigation
        window.location.href = url;
      }
    });
    
    // STEP 10E: Setup loading indicator
    const loadingIndicator = setupLoadingIndicator();
    setupLoadingHandlers(loadingIndicator);
    
    // STEP 10F: Setup error handling
    setupErrorHandling();
    
    // STEP 10G: Setup prefetching for better performance
    setupPrefetching();
    
    // STEP 10H: Add transition if intro is not present or completed
    if (shouldInitializeImmediately) {
      barba.use(createTransition());
    }
    
    // STEP 10I: Global hooks for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      barba.hooks.enter((data) => {
        console.log('Barba: Entering page', data.next.namespace);
      });
      
      barba.hooks.leave((data) => {
        console.log('Barba: Leaving page', data.current.namespace);
      });
    }
    
    console.log('Barba.js page transitions initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize Barba.js:', error);
    
    // Graceful fallback - ensure normal navigation still works
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (link && link.hostname === window.location.hostname) {
        // Let browser handle navigation normally
        return true;
      }
    });
  }
}

// STEP 11: Cleanup function for development/testing
export function destroyPageTransitions() {
  if (barba) {
    barba.destroy();
    
    // Clear stored scroll positions
    scrollPositions.clear();
    
    // Remove loading indicator
    const loadingIndicator = document.querySelector('.barba-loading');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
    
    console.log('Barba.js page transitions destroyed');
  }
}

// STEP 12: Export utilities for external use
export function getCurrentScrollPosition() {
  return currentScrollTop;
}

export function clearScrollPositions() {
  scrollPositions.clear();
}